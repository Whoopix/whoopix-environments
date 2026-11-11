# Whoopix Environments

Developer environments for building websites that **integrate with Whoopix CMS** (`cms.whoopix.ai`) through the hybrid sync API.

Pick a stack. Every environment speaks the same protocol: **cms-sync-v1** (HMAC-signed read / write / upload).

```
                 ┌──────────────────────────┐
                 │     cms.whoopix.ai       │
                 │  editors · AI · SEO     │
                 └────────────┬─────────────┘
                              │ cms-sync-v1
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         PHP tenant      Node agent      React / Next
      (whoopix-tenant)  (this repo)     (this repo)
```

## Environments

| Path | Stack | Use when |
|------|--------|----------|
| [`environments/php`](environments/php) | Classic PHP tenant | Full Whoopix front + agent (see also [whoopix-tenant](https://github.com/Whoopix/whoopix-tenant)) |
| [`environments/node-agent`](environments/node-agent) | Node.js (Express) | Sync agent in Node, or BFF for JS fronts |
| [`environments/react`](environments/react) | React (Vite) | SPA UI consuming Whoopix content via the agent |
| [`environments/next`](environments/next) | Next.js | App Router + server routes with `@whoopix/cms-sync` |
| [`environments/python`](environments/python) | Python | FastAPI/Flask agent scaffold (protocol docs) |
| [`packages/cms-sync`](packages/cms-sync) | JS SDK | Sign requests, call read/operation from Node / BFF |

## How hybrid works

1. You run a **tenant agent** (PHP or Node) with `SYNC_CLIENT_ID` + `SYNC_CLIENT_SECRET`.
2. Whoopix CMS registers that client and calls `…/read`, `…/operation`, `…/upload`.
3. Your front (PHP templates, React, etc.) renders from the same content store the agent writes.

Local-only? Tunnel the agent URL (ngrok / Cloudflare Tunnel) so CMS can reach it, or develop against a staging agent.

## Quick pick

**PHP site connected to CMS**

```bash
git clone https://github.com/Whoopix/whoopix-tenant.git
# or start from environments/php in this repo
```

**React site + Node agent**

```bash
git clone https://github.com/Whoopix/whoopix-environments.git
cd whoopix-environments/environments/node-agent && cp .env.example .env && npm install && npm run dev
cd ../react && cp .env.example .env && npm install && npm run dev
```

## Cursor

Open the environment folder you care about. Each one has an `AGENTS.md` describing how to build against Whoopix without breaking sync.

## Protocol docs

- [`docs/cms-sync-v1.md`](docs/cms-sync-v1.md) — envelopes, headers, actions  
- PHP agent reference: [whoopix-tenant/system/api/README.md](https://github.com/Whoopix/whoopix-tenant/blob/main/system/api/README.md)

## Related repos

| Repo | Role |
|------|------|
| [whoopix-tenant](https://github.com/Whoopix/whoopix-tenant) | Production-shaped PHP tenant kit |
| [whoopix-cms](https://github.com/Whoopix/whoopix-cms) | CMS (private) |
