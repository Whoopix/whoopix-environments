import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { requireSyncAuth } from './auth.js';
import { memoryStore } from './store-memory.js';
import { mysqlStore } from './store-mysql.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const storeMode = (process.env.STORE || 'memory').toLowerCase();
const store = storeMode === 'mysql' ? mysqlStore : memoryStore;
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

app.use(
  cors({
    origin: [
      'https://cms.whoopix.ai',
      'https://www.cms.whoopix.ai',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    allowedHeaders: [
      'Content-Type',
      'X-Sync-Client',
      'X-Sync-Timestamp',
      'X-Sync-Signature',
      'X-Sync-File-Hash',
    ],
  })
);

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    protocol: 'cms-sync-v1',
    store: storeMode,
    client: process.env.SYNC_CLIENT_ID || null,
  });
});

// Public read-only helpers for local SPA demos (never enable blindly in production).
const publicContent = storeMode === 'memory' || process.env.CONTENT_PUBLIC === '1';
if (publicContent) {
  app.get('/content/pages', async (_req, res) => {
    try {
      const out = await store.read({
        table: 'mod_pages_list',
        action: 'list',
        limit: 50,
      });
      res.json(out);
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get('/content/settings', async (_req, res) => {
    try {
      const out = await store.read({
        table: 'mod_settings',
        action: 'list',
        limit: 100,
      });
      res.json(out);
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
}

function rawJson(req, res, next) {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (c) => {
    data += c;
  });
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
}

app.post('/read', rawJson, async (req, res) => {
  const auth = requireSyncAuth(req, res, req.rawBody || '');
  if (!auth) return;
  try {
    const read = auth.body.read;
    if (!read?.table) {
      return res.status(400).json({ success: false, error: 'Missing read block' });
    }
    const out = await store.read(read);
    res.json(out);
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

app.post('/operation', rawJson, async (req, res) => {
  const auth = requireSyncAuth(req, res, req.rawBody || '');
  if (!auth) return;
  try {
    const requestId = auth.body.request_id;
    if (!requestId) {
      return res.status(400).json({ success: false, error: 'Missing request_id' });
    }
    const ok = await store.checkRequestId(requestId);
    if (!ok) {
      return res.status(409).json({ success: false, error: 'Duplicate request_id', request_id: requestId });
    }
    const operation = auth.body.operation;
    if (!operation?.table) {
      return res.status(400).json({ success: false, error: 'Missing operation block' });
    }
    const out = await store.operation(operation);
    res.json(out);
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

app.get('/schema', async (req, res) => {
  try {
    const table = String(req.query.table || '');
    if (!table) return res.status(400).json({ success: false, error: 'Missing table' });
    const out = await store.schema(table);
    res.json(out);
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const clientId = req.get('x-sync-client') || '';
    if (clientId !== process.env.SYNC_CLIENT_ID) {
      return res.status(401).json({ success: false, error: 'Unknown client' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Missing file' });
    }
    const type = req.body.type || req.query.type || 'images';
    const buf = fs.readFileSync(req.file.path);
    const hash = createHash('sha256').update(buf).digest('hex');
    const headerHash = req.get('x-sync-file-hash');
    if (headerHash && headerHash !== hash) {
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ success: false, error: 'File hash mismatch' });
    }
    const safeName = `${Date.now()}-${req.file.originalname.replace(/[^\w.\-]+/g, '_')}`;
    const dest = path.join(uploadDir, safeName);
    fs.renameSync(req.file.path, dest);
    res.json({
      success: true,
      filename: safeName,
      url: `/uploads/${safeName}`,
      size: buf.length,
      type,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.use('/uploads', express.static(uploadDir));

app.listen(port, () => {
  console.log(`[whoopix-node-agent] http://127.0.0.1:${port} store=${storeMode}`);
});
