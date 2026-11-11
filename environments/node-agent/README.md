# Node sync agent

Express implementation of the Whoopix **cms-sync-v1** tenant agent.

CMS (or `@whoopix/cms-sync`) calls this service the same way it calls PHP `system/api`.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

- `STORE=memory` — zero-config demo tables (`mod_pages_list`, `mod_settings`)
- `STORE=mysql` — real MySQL hybrid tenant (set `DB_*`)

Point Whoopix CMS site `api_prefix` to this service base URL, e.g. `https://your-tunnel.example` (paths `/read`, `/operation`, `/upload`).

## Cursor

Ask Cursor to extend routes or map your React/Next BFF to this agent. Keep HMAC auth intact (`src/auth.js`).
