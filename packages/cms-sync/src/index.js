import { createHmac, createHash, randomUUID } from 'node:crypto';

export const PROTOCOL = 'cms-sync-v1';

/**
 * @param {string} secret
 * @param {string} rawBody
 * @param {number|string} timestamp
 */
export function signBody(secret, rawBody, timestamp) {
  return createHmac('sha256', secret)
    .update(`${rawBody}.${timestamp}`)
    .digest('hex');
}

/**
 * @param {string} secret
 * @param {string} type
 * @param {string} filename
 * @param {number|string} timestamp
 */
export function signUpload(secret, type, filename, timestamp) {
  return createHmac('sha256', secret)
    .update(`${type}.${filename}.${timestamp}`)
    .digest('hex');
}

export function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

/**
 * @typedef {object} SyncClientOptions
 * @property {string} baseUrl Agent base, e.g. https://site.example/system/api
 * @property {string} clientId
 * @property {string} secret
 * @property {typeof fetch} [fetchImpl]
 */

export function createSyncClient(options) {
  const baseUrl = String(options.baseUrl || '').replace(/\/$/, '');
  const clientId = options.clientId;
  const secret = options.secret;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (!baseUrl || !clientId || !secret) {
    throw new Error('createSyncClient requires baseUrl, clientId, secret');
  }

  async function post(path, payload) {
    const timestamp = Math.floor(Date.now() / 1000);
    const { request_id: rid, ...rest } = payload;
    const body = {
      protocol: PROTOCOL,
      client_id: clientId,
      request_id: rid || randomUUID(),
      timestamp,
      ...rest,
    };

    const rawBody = JSON.stringify(body);
    const signature = signBody(secret, rawBody, timestamp);

    const res = await fetchImpl(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Client': clientId,
        'X-Sync-Timestamp': String(timestamp),
        'X-Sync-Signature': signature,
      },
      body: rawBody,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    read(readBlock, requestId) {
      return post('/read', {
        request_id: requestId || randomUUID(),
        read: readBlock,
      });
    },
    operation(operationBlock, requestId) {
      return post('/operation', {
        request_id: requestId || randomUUID(),
        operation: operationBlock,
      });
    },
  };
}
