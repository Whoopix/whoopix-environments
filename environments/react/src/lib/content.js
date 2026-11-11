/**
 * Front-end content helpers.
 * In local demo mode the Node agent exposes /content/* (no secret in the browser).
 * For production, put HMAC calls in a server BFF using @whoopix/cms-sync.
 */

const base = (import.meta.env.VITE_CONTENT_API || '').replace(/\/$/, '');

async function get(path) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`Content API ${res.status}`);
  return res.json();
}

export function fetchPages() {
  return get('/content/pages');
}

export function fetchSettings() {
  return get('/content/settings');
}
