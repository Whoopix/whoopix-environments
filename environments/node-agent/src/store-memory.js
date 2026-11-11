/** Simple in-memory table store for local React demos (not for production CMS). */

const tables = new Map();
const seenRequests = new Set();

function table(name) {
  if (!tables.has(name)) tables.set(name, []);
  return tables.get(name);
}

export function memorySeed() {
  if (table('mod_pages_list').length) return;
  table('mod_pages_list').push(
    {
      id: 1,
      title: 'Home',
      url: '',
      template: 0,
      status: 1,
      lang: 'en',
    },
    {
      id: 2,
      title: 'About',
      url: 'about',
      template: 0,
      status: 1,
      lang: 'en',
    }
  );
  table('mod_settings').push(
    { id: 1, name: 'site_name', value: 'Whoopix Dev Site' },
    { id: 2, name: 'tagline', value: 'Hybrid React + Whoopix CMS' }
  );
}

function matchFilters(row, filters = [], logic = 'AND') {
  if (!filters.length) return true;
  const checks = filters.map((f) => {
    const v = row[f.field];
    const op = f.operator || '=';
    const want = f.value;
    switch (op) {
      case '=':
        return v == want;
      case '!=':
        return v != want;
      case '>':
        return v > want;
      case '>=':
        return v >= want;
      case '<':
        return v < want;
      case '<=':
        return v <= want;
      case 'LIKE':
        return String(v ?? '').includes(String(want).replace(/%/g, ''));
      default:
        return v == want;
    }
  });
  return logic === 'OR' ? checks.some(Boolean) : checks.every(Boolean);
}

export const memoryStore = {
  async read(req) {
    memorySeed();
    const name = req.table;
    const rows = table(name).filter((r) =>
      matchFilters(r, req.filters || [], (req.filter_logic || 'AND').toUpperCase())
    );
    const action = req.action || 'list';
    if (action === 'count') {
      return { success: true, action, table: name, total: rows.length };
    }
    if (action === 'get') {
      return { success: true, action, table: name, data: rows[0] || null };
    }
    const limit = Number(req.limit || 100);
    const page = Math.max(1, Number(req.page || 1));
    const start = (page - 1) * limit;
    return {
      success: true,
      action: 'list',
      table: name,
      data: rows.slice(start, start + limit),
      total: rows.length,
      page,
      limit,
    };
  },

  async operation(op) {
    memorySeed();
    const name = op.table;
    const rows = table(name);
    const action = op.action;
    const pk = op.primary_key || 'id';
    let affected = 0;
    let lastInsertId = 0;

    for (const incoming of op.rows || []) {
      if (action === 'delete') {
        const idx = rows.findIndex((r) => r[pk] == incoming[pk]);
        if (idx >= 0) {
          rows.splice(idx, 1);
          affected++;
        }
        continue;
      }
      const id = incoming[pk];
      const idx = id && id !== 0 ? rows.findIndex((r) => r[pk] == id) : -1;
      if (action === 'update' || (action === 'upsert' && idx >= 0)) {
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...incoming };
          affected++;
        }
      } else if (action === 'upsert') {
        const nextId =
          Number(id) > 0
            ? Number(id)
            : (rows.reduce((m, r) => Math.max(m, Number(r[pk]) || 0), 0) + 1);
        const row = { ...incoming, [pk]: nextId };
        rows.push(row);
        lastInsertId = nextId;
        affected++;
      }
    }

    return {
      success: true,
      action,
      table: name,
      affected,
      last_insert_id: lastInsertId,
    };
  },

  async schema(tableName) {
    memorySeed();
    const sample = table(tableName)[0] || {};
    return {
      success: true,
      table: tableName,
      columns: Object.keys(sample).map((Field) => ({
        Field,
        Type: typeof sample[Field] === 'number' ? 'int' : 'varchar',
      })),
    };
  },

  checkRequestId(id) {
    if (seenRequests.has(id)) return false;
    seenRequests.add(id);
    return true;
  },
};
