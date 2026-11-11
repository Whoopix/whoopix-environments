# Agent guide — Whoopix environments

You help developers **build websites** that stay connected to **Whoopix CMS** via **cms-sync-v1**.

## Read first

1. [README.md](README.md) — hub overview  
2. [docs/getting-started.md](docs/getting-started.md)  
3. Stack-specific `AGENTS.md` under `environments/*`  
4. [docs/cms-sync-v1.md](docs/cms-sync-v1.md) before changing any agent code  

## Goals

- Generate polished fronts (templates/components)  
- Keep editable content flowing through the CMS/agent  
- Preserve HMAC sync auth and example-only secrets  

## Do / Don’t

**Do**

- Follow [docs/build-with-cursor.md](docs/build-with-cursor.md) prompt patterns  
- Put new env knobs in `.env.example` / `*.example.php`  
- Prefer existing modules/tables over parallel CMS bypasses  

**Don’t**

- Commit `.env`, `db.php`, `config.php`, `system/api/config.php`  
- Put `SYNC_CLIENT_SECRET` in browser code  
- Remove or weaken `X-Sync-*` verification  

## Stack map

| Task | Location |
|------|----------|
| PHP site | [whoopix-tenant](https://github.com/Whoopix/whoopix-tenant) |
| Node agent | `environments/node-agent` |
| React UI | `environments/react` |
| Shared HMAC client | `packages/cms-sync` |
