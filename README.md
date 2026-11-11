# Whoopix developer environments

Build a website in **PHP, React, Node, Next, or Python** and keep it connected to **[Whoopix CMS](https://www.cms.whoopix.ai/admin.php)** through the hybrid sync API.

Whoopix is not a closed theme. You own the front-end. The CMS edits content, runs SEO/AI tools, and syncs into your environment over **cms-sync-v1**.

```text
  You build the site here                 Whoopix cloud
  ┌─────────────────────────┐            ┌────────────────────┐
  │  PHP / React / Next …   │  HMAC API  │  cms.whoopix.ai    │
  │  + sync agent           │◄──────────►│  pages · SEO · AI  │
  │  + your DB / store      │            │  media · modules   │
  └─────────────────────────┘            └────────────────────┘
```

---

## Start here

| Guide | What it covers |
|-------|----------------|
| **[Getting started](docs/getting-started.md)** | Install, pick a stack, run a site in minutes |
| **[Choose your stack](docs/choose-your-stack.md)** | PHP vs React/Node vs Next vs Python |
| **[Connect to Whoopix CMS](docs/connect-cms.md)** | Sync credentials, agent URL, smoke tests |
| **[Build with Cursor](docs/build-with-cursor.md)** | How to prompt the AI to generate the website safely |
| **[PHP website](docs/php-website.md)** | Full classic tenant (`whoopix-tenant`) |
| **[React + Node website](docs/react-node-website.md)** | SPA + Node sync agent |
| **[API protocol](docs/cms-sync-v1.md)** | Headers, envelopes, read/write/upload |
| **[Troubleshooting](docs/troubleshooting.md)** | Common failures and fixes |

---

## 60-second overview

1. **Clone** an environment (PHP tenant or this monorepo).
2. **Configure** DB + `SYNC_CLIENT_ID` / `SYNC_CLIENT_SECRET` (never commit secrets).
3. **Run** the site + sync agent locally (tunnel if CMS must reach you).
4. **Link** the agent URL in Whoopix CMS for your site.
5. **Open the folder in Cursor** and ask it to build templates/pages that keep content CMS-editable.

---

## Environments in this repo

| Path | Stack | Ready to run? |
|------|--------|----------------|
| [`environments/php`](environments/php) | PHP tenant | Uses [whoopix-tenant](https://github.com/Whoopix/whoopix-tenant) |
| [`environments/node-agent`](environments/node-agent) | Node sync agent | Yes |
| [`environments/react`](environments/react) | React (Vite) | Yes (with node-agent) |
| [`environments/next`](environments/next) | Next.js | Scaffold docs |
| [`environments/python`](environments/python) | Python agent | Scaffold docs |
| [`packages/cms-sync`](packages/cms-sync) | JS HMAC client | Yes (Node/BFF) |

---

## Fastest paths

### A) Classic PHP site (production-shaped)

```bash
git clone https://github.com/Whoopix/whoopix-tenant.git my-site
cd my-site
cp db.example.php db.php
cp config.example.php config.php
cp system/api/config.example.php system/api/config.php
# edit credentials, then point PHP/Apache/nginx at this folder
```

Full walkthrough → [PHP website](docs/php-website.md)

### B) React site + Node agent (modern JS)

```bash
git clone https://github.com/Whoopix/whoopix-environments.git
cd whoopix-environments/environments/node-agent
cp .env.example .env && npm install && npm run dev

# new terminal
cd ../react
cp .env.example .env && npm install && npm run dev
```

Open http://127.0.0.1:5173 — walkthrough → [React + Node](docs/react-node-website.md)

---

## What “done” looks like

- Your front renders pages from the tenant store (`mod_*` tables or agent memory).
- Saving a page or uploading an image in Whoopix CMS updates that store.
- Cursor can change layout/templates without hard-coding copy that belongs in the CMS.

---

## Security (non-negotiable)

- Never commit `db.php`, `config.php`, `system/api/config.php`, or `.env`.
- Never put `SYNC_CLIENT_SECRET` in a browser bundle.
- Use HTTPS for any agent URL Whoopix CMS can reach.

---

## Related

| Repo | Purpose |
|------|---------|
| [whoopix-environments](https://github.com/Whoopix/whoopix-environments) | This hub — multi-stack kits + docs |
| [whoopix-tenant](https://github.com/Whoopix/whoopix-tenant) | Full PHP hybrid tenant |
| [whoopix-cms](https://github.com/Whoopix/whoopix-cms) | CMS codebase (private) |
| [whoopix.ai/developers](https://www.whoopix.ai/developers) | Product developer page |
