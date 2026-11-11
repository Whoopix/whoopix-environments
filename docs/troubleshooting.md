# Troubleshooting

## Agent / CMS connection

| Symptom | Fix |
|---------|-----|
| `Unknown client` | Match `SYNC_CLIENT_ID` in agent and CMS exactly |
| `Invalid signature` | Match `SYNC_CLIENT_SECRET`; ensure signature is HMAC of **raw body** + `.` + timestamp |
| `Request timestamp too old` | Sync system clocks; default max age is 300 seconds |
| `Duplicate request_id` | CMS/client retried a successful write — expected idempotency (HTTP 409) |
| CMS timeouts | Agent not reachable — check tunnel, firewall, HTTPS certificate |
| 404 on `/read` or `/read.php` | Wrong `api_prefix`; PHP uses `/system/api/*.php`, Node uses `/read` |

## PHP tenant

| Symptom | Fix |
|---------|-----|
| Blank page / 500 | Check PHP error log; confirm `config.php` + `db.php` exist and DB accepts connections |
| Site loads, CMS cannot write | Agent URL wrong, or `system/api/config.php` secret mismatch |
| Uploads fail | `files/upload` not writable; check `UPLOAD_*` paths in agent config |
| Front doesn’t show CMS edits | Caching; wrong DB; front reading a different database than the agent |

## React + Node

| Symptom | Fix |
|---------|-----|
| React shows content API error | Start `node-agent` on `:8787`; Vite proxies `/content` there |
| `/health` fails | `npm install` + `npm run dev` inside `environments/node-agent` |
| CORS errors from CMS browser tools | Agent CORS allowlist must include `https://www.cms.whoopix.ai` |
| Memory data resets | Expected on agent restart when `STORE=memory` — use MySQL for persistence |

## Cursor / AI mistakes to reverse

- HMAC “removed for testing” in committed files → restore from git  
- Secrets committed → rotate secret immediately, remove from history if needed  
- New parallel router ignoring `modules.php` → prefer Whoopix modules/templates  

## Still stuck?

1. Confirm [Getting started](getting-started.md) checklist  
2. Re-read [Connect to Whoopix CMS](connect-cms.md)  
3. Verify protocol details in [cms-sync-v1.md](cms-sync-v1.md)  
4. Compare with working PHP agent docs: [whoopix-tenant system/api README](https://github.com/Whoopix/whoopix-tenant/blob/main/system/api/README.md)  
