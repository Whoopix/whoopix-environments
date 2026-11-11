# Getting started

This guide gets you from zero to a running Whoopix-connected website environment.

## Prerequisites

| Tool | Required for |
|------|----------------|
| Git | Everything |
| [Cursor](https://cursor.com) (recommended) or any IDE | Building the site with AI / by hand |
| PHP 8+ + MySQL | PHP tenant path |
| Node.js 18+ | React / Node / Next path |
| A Whoopix CMS account | Connecting the live CMS ([admin](https://www.cms.whoopix.ai/admin.php)) |
| Optional: ngrok / Cloudflare Tunnel | Letting CMS reach your laptop |

## Step 1 — Choose a stack

| If you want… | Use |
|--------------|-----|
| Classic Whoopix PHP site (templates + modules) | [PHP website](php-website.md) → clone `whoopix-tenant` |
| Modern React UI | [React + Node](react-node-website.md) |
| One Next.js app with server API routes | [Next scaffold](../environments/next/README.md) |
| Agent in Python | [Python scaffold](../environments/python/README.md) |

Unsure? Read [Choose your stack](choose-your-stack.md).  
Most teams starting today: **PHP tenant** for full CMS parity, or **React + Node** for a JS front.

## Step 2 — Clone

**PHP**

```bash
git clone https://github.com/Whoopix/whoopix-tenant.git my-whoopix-site
cd my-whoopix-site
```

**React + Node**

```bash
git clone https://github.com/Whoopix/whoopix-environments.git
cd whoopix-environments
```

## Step 3 — Configure (never commit secrets)

### PHP

```bash
cp db.example.php db.php
cp config.example.php config.php
cp system/api/config.example.php system/api/config.php
```

Edit:

- MySQL host / user / pass / database in `db.php` **and** matching values in `system/api/config.php`
- `SYNC_CLIENT_ID` / `SYNC_CLIENT_SECRET` (create a strong secret; same pair must be registered in CMS)

### React + Node

```bash
cd environments/node-agent
cp .env.example .env
# SYNC_CLIENT_ID, SYNC_CLIENT_SECRET
# STORE=memory for local demo, or STORE=mysql + DB_* for real data
```

## Step 4 — Run

**PHP** — point your vhost / `php -S localhost:8080` at the tenant root.  
Confirm: `http://localhost:8080/` and that `system/api/` is under the same host.

**React + Node**

```bash
# terminal 1
cd environments/node-agent && npm install && npm run dev

# terminal 2
cd environments/react && npm install && npm run dev
```

Confirm: http://127.0.0.1:5173 and http://127.0.0.1:8787/health

## Step 5 — Connect Whoopix CMS

Follow [Connect to Whoopix CMS](connect-cms.md).

Minimum:

1. Same `SYNC_CLIENT_ID` + `SYNC_CLIENT_SECRET` in CMS and agent.
2. CMS site agent URL / `api_prefix` points at your reachable agent  
   (`…/system/api` for PHP, or the Node agent base URL).
3. Save a page or upload an image in CMS → appears in your tenant store.

## Step 6 — Build the website

Open the project folder in **Cursor** and follow [Build with Cursor](build-with-cursor.md).

Example prompt:

> Build a polished marketing homepage using this Whoopix tenant. Keep hero, services, and contact copy in CMS-editable module/page data. Do not break `system/api` sync auth.

## Checklist

- [ ] Environment runs locally without errors  
- [ ] Secrets only in ignored config / `.env`  
- [ ] CMS can call the agent (or you are on memory-demo only)  
- [ ] A CMS edit shows up on the front  
- [ ] Cursor/`AGENTS.md` rules loaded so AI keeps content hybrid  

## Next docs

- [Connect to Whoopix CMS](connect-cms.md)  
- [Build with Cursor](build-with-cursor.md)  
- [API protocol cms-sync-v1](cms-sync-v1.md)  
- [Troubleshooting](troubleshooting.md)  
