import mysql from 'mysql2/promise';

let pool;

async function db() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_requests (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(128) NOT NULL UNIQUE,
        client_id VARCHAR(128) NOT NULL DEFAULT '',
        type VARCHAR(64) NOT NULL DEFAULT '',
        received_at DATETIME NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'success',
        error TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }
  return pool;
}

function assertIdent(name, label = 'identifier') {
  if (!/^[a-zA-Z0-9_]+$/.test(name || '')) {
    throw Object.assign(new Error(`Invalid ${label}`), { status: 400 });
  }
  return name;
}

function buildWhere(filters = [], logic = 'AND') {
  const clauses = [];
  const params = [];
  for (const f of filters) {
    assertIdent(f.field, 'column');
    const op = (f.operator || '=').toUpperCase();
    if (op === 'IS NULL' || op === 'IS NOT NULL') {
      clauses.push(`\`${f.field}\` ${op}`);
      continue;
    }
    if (op === 'IN' || op === 'NOT IN') {
      const arr = Array.isArray(f.value) ? f.value : [f.value];
      clauses.push(`\`${f.field}\` ${op} (${arr.map(() => '?').join(',')})`);
      params.push(...arr);
      continue;
    }
    clauses.push(`\`${f.field}\` ${op} ?`);
    params.push(f.value);
  }
  if (!clauses.length) return { sql: '', params };
  return {
    sql: ` WHERE ${clauses.join(` ${logic === 'OR' ? 'OR' : 'AND'} `)}`,
    params,
  };
}

export const mysqlStore = {
  async read(req) {
    const p = await db();
    const table = assertIdent(req.table, 'table');
    const action = req.action || 'list';
    const { sql: where, params } = buildWhere(req.filters || [], (req.filter_logic || 'AND').toUpperCase());

    if (action === 'count') {
      const [rows] = await p.query(`SELECT COUNT(*) AS c FROM \`${table}\`${where}`, params);
      return { success: true, action, table, total: rows[0].c };
    }

    let order = '';
    if (req.sort?.field) {
      assertIdent(req.sort.field, 'sort');
      const dir = String(req.sort.direction || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      order = ` ORDER BY \`${req.sort.field}\` ${dir}`;
    }

    const limit = Math.min(500, Number(req.limit || 100));
    const page = Math.max(1, Number(req.page || 1));
    const offset = (page - 1) * limit;

    if (action === 'get') {
      const [rows] = await p.query(
        `SELECT * FROM \`${table}\`${where}${order} LIMIT 1`,
        params
      );
      return { success: true, action, table, data: rows[0] || null };
    }

    const [countRows] = await p.query(`SELECT COUNT(*) AS c FROM \`${table}\`${where}`, params);
    const [rows] = await p.query(
      `SELECT * FROM \`${table}\`${where}${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return {
      success: true,
      action: 'list',
      table,
      data: rows,
      total: countRows[0].c,
      page,
      limit,
    };
  },

  async operation(op) {
    const p = await db();
    const table = assertIdent(op.table, 'table');
    const pk = assertIdent(op.primary_key || 'id', 'primary_key');
    const action = op.action;
    let affected = 0;
    let lastInsertId = 0;

    for (const row of op.rows || []) {
      if (action === 'delete') {
        const [r] = await p.query(`DELETE FROM \`${table}\` WHERE \`${pk}\` = ?`, [row[pk]]);
        affected += r.affectedRows || 0;
        continue;
      }

      const keys = Object.keys(row).filter((k) => /^[a-zA-Z0-9_]+$/.test(k));
      if (!keys.length) continue;

      if (action === 'update' || (action === 'upsert' && row[pk])) {
        const sets = keys.filter((k) => k !== pk).map((k) => `\`${k}\` = ?`);
        const vals = keys.filter((k) => k !== pk).map((k) => row[k]);
        if (sets.length && row[pk] != null && row[pk] !== 0) {
          const [r] = await p.query(
            `UPDATE \`${table}\` SET ${sets.join(', ')} WHERE \`${pk}\` = ?`,
            [...vals, row[pk]]
          );
          if (r.affectedRows) {
            affected += r.affectedRows;
            continue;
          }
          if (action === 'update') continue;
        }
      }

      if (action === 'upsert' || action === 'update') {
        const cols = keys.map((k) => `\`${k}\``).join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const [r] = await p.query(
          `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`,
          keys.map((k) => row[k])
        );
        affected += r.affectedRows || 0;
        lastInsertId = r.insertId || lastInsertId;
      }
    }

    return { success: true, action, table, affected, last_insert_id: lastInsertId };
  },

  async schema(tableName) {
    const p = await db();
    const table = assertIdent(tableName, 'table');
    const [rows] = await p.query(`SHOW COLUMNS FROM \`${table}\``);
    return { success: true, table, columns: rows };
  },

  async checkRequestId(id) {
    const p = await db();
    const [rows] = await p.query(
      `SELECT status FROM cms_requests WHERE request_id = ? LIMIT 1`,
      [id]
    );
    if (rows[0]?.status === 'success') return false;
    await p.query(
      `INSERT IGNORE INTO cms_requests (request_id, client_id, type, received_at, status)
       VALUES (?, ?, 'operation', NOW(), 'success')`,
      [id, process.env.SYNC_CLIENT_ID || '']
    );
    return true;
  },
};
