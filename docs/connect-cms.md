# Connect to Whoopix CMS

This wires your local/remote environment to [cms.whoopix.ai](https://www.cms.whoopix.ai/admin.php) so editors and AI tools can update your site.

## Concepts

| Term | Meaning |
|------|---------|
| **Tenant** | Your website folder + database/store |
| **Sync agent** | HTTP API CMS calls (`system/api` or Node agent) |
| **Client ID** | Public-ish identifier for this site (`SYNC_CLIENT_ID`) |
| **Client secret** | Shared HMAC key (`SYNC_CLIENT_SECRET`) — private |
| **Agent URL / api_prefix** | Base URL CMS uses, e.g. `https://dev.example.com/system/api` |

## 1. Create credentials

Generate a strong secret (example):

```bash
# macOS / Linux
openssl rand -hex 32

# PowerShell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]]).ToLower()
```

Pick a stable client id, e.g. `acme-site` or your project slug.

Put the same values in:

- PHP: `system/api/config.php`  
- Node: `environments/node-agent/.env`  
- Whoopix CMS site sync/client settings for that site  

If they differ, every CMS call fails with `Unknown client` or `Invalid signature`.

## 2. Make the agent reachable

CMS servers must **HTTP(S) POST** to your agent.

| Setup | Approach |
|-------|----------|
| Staging / production host | Point DNS + HTTPS at the tenant; use that URL |
| Laptop only | Tunnel: `ngrok http 8080` or Cloudflare Tunnel |
| Demo without CMS | Node `STORE=memory` + React only (no CMS link yet) |

### PHP agent URL

```text
https://YOUR_HOST/system/api
```

CMS will call paths like `/read.php`, `/operation.php`, `/upload.php` under that prefix (or as configured by your CMS site row).

### Node agent URL

```text
https://YOUR_TUNNEL_HOST
```

Paths: `/read`, `/operation`, `/upload`, `/schema`, `/health`.

## 3. Register in Whoopix CMS

1. Sign in at https://www.cms.whoopix.ai/admin.php  
2. Open (or create) the site that should drive this front  
3. Set:
   - Sync **client id** = `SYNC_CLIENT_ID`  
   - Sync **secret** = `SYNC_CLIENT_SECRET`  
   - Agent / **api_prefix** = your reachable base URL  
4. Save  

Exact admin labels may vary by CMS version; the values above are what must match.

## 4. Smoke test

### Health (Node)

```bash
curl -s http://127.0.0.1:8787/health
```

Expect `"ok": true`.

### Signed read (any agent)

Use `@whoopix/cms-sync` from this repo:

```bash
cd packages/cms-sync
# from a small script, or Node REPL, with env set:
```

```js
import { createSyncClient } from '@whoopix/cms-sync';

const cms = createSyncClient({
  baseUrl: process.env.AGENT_URL, // e.g. http://127.0.0.1:8787
  clientId: process.env.SYNC_CLIENT_ID,
  secret: process.env.SYNC_CLIENT_SECRET,
});

console.log(await cms.read({ table: 'mod_pages_list', action: 'list', limit: 5 }));
```

### From the CMS UI

1. Edit a page title or upload an image in Whoopix admin  
2. Confirm the change in:
   - PHP: MySQL `mod_*` / `files/upload`  
   - Node memory: `/content/pages` (demo) or MySQL when `STORE=mysql`  
3. Refresh your front  

## 5. Common connection failures

| Symptom | Likely cause |
|---------|----------------|
| `Unknown client` | Client id mismatch |
| `Invalid signature` | Secret mismatch or wrong raw body signing |
| `Request timestamp too old` | Clock skew &gt; 300s |
| Timeouts from CMS | Agent not publicly reachable / tunnel down |
| 404 on read/operation | Wrong api_prefix path |

More: [Troubleshooting](troubleshooting.md)

## Security checklist

- [ ] Secret only in server-side config  
- [ ] HTTPS on any public agent  
- [ ] `.env` / `config.php` gitignored  
- [ ] Rotate secret if it ever leaked  
