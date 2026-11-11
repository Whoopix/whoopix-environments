import { createHmac } from 'node:crypto';
import { PROTOCOL } from '@whoopix/cms-sync';

export function requireSyncAuth(req, res, rawBody) {
  const clientId = req.get('x-sync-client') || '';
  const timestamp = Number(req.get('x-sync-timestamp') || 0);
  const signature = req.get('x-sync-signature') || '';
  const expectedClient = process.env.SYNC_CLIENT_ID || '';
  const secret = process.env.SYNC_CLIENT_SECRET || '';
  const maxAge = Number(process.env.SYNC_MAX_AGE || 300);

  if (!clientId || !timestamp || !signature) {
    res.status(401).json({ success: false, error: 'Missing sync headers' });
    return null;
  }
  if (clientId !== expectedClient) {
    res.status(401).json({ success: false, error: 'Unknown client' });
    return null;
  }
  if (!secret) {
    res.status(500).json({ success: false, error: 'Agent not configured (missing secret)' });
    return null;
  }
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > maxAge) {
    res.status(401).json({ success: false, error: 'Request timestamp too old (replay protection)' });
    return null;
  }

  const expected = createHmac('sha256', secret)
    .update(`${rawBody}.${timestamp}`)
    .digest('hex');
  if (expected !== signature) {
    res.status(401).json({ success: false, error: 'Invalid signature' });
    return null;
  }

  let body;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    res.status(400).json({ success: false, error: 'Invalid JSON body' });
    return null;
  }

  if (body.protocol && body.protocol !== PROTOCOL) {
    res.status(400).json({ success: false, error: 'Unsupported protocol' });
    return null;
  }
  if (body.client_id && body.client_id !== clientId) {
    res.status(400).json({ success: false, error: 'client_id mismatch' });
    return null;
  }

  return { clientId, body, timestamp };
}
