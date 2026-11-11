# Build a React website with Whoopix

Run the **Node sync agent** + **React (Vite)** app from this monorepo.

## Architecture

```text
Browser (React :5173)
    │  /content/*  (Vite proxy, local demo)
    ▼
Node agent (:8787)
    │  cms-sync-v1 HMAC
    ▲
Whoopix CMS (when connected)
```

- **Local demo:** `STORE=memory` — no MySQL required; React reads `/content/pages` and `/content/settings`.  
- **Hybrid production:** `STORE=mysql` + public agent URL + CMS credentials.  
- **Browser never holds** `SYNC_CLIENT_SECRET`. Production apps should call the agent through a BFF using `@whoopix/cms-sync`.

## Install & run

```bash
git clone https://github.com/Whoopix/whoopix-environments.git
cd whoopix-environments
```

### Terminal 1 — agent

```bash
cd environments/node-agent
cp .env.example .env
npm install
npm run dev
```

Check: http://127.0.0.1:8787/health

### Terminal 2 — React

```bash
cd environments/react
cp .env.example .env
npm install
npm run dev
```

Open: http://127.0.0.1:5173

You should see pages seeded in the memory store (Home, About) and site name/tagline from settings.

## Connect CMS (optional but recommended)

1. Set `STORE=mysql` and `DB_*` in the agent `.env` (or keep memory only for UI work).  
2. Set `SYNC_CLIENT_ID` / `SYNC_CLIENT_SECRET`.  
3. Tunnel port `8787` if CMS must reach your laptop.  
4. Follow [Connect to Whoopix CMS](connect-cms.md) — agent base URL is the tunnel root (paths `/read`, `/operation`, `/upload`).

## Develop the UI

| Path | Role |
|------|------|
| `environments/react/src/App.jsx` | Main UI |
| `environments/react/src/lib/content.js` | Content fetch helpers |
| `environments/react/src/styles.css` | Design tokens / layout |
| `environments/node-agent/src/*` | Sync agent (auth, stores) |

Open `environments/react` in Cursor → [Build with Cursor](build-with-cursor.md).

Example:

```text
Expand this React Whoopix environment into a full marketing site
(home, services, about, contact). Keep page list/settings loaded
from the agent content API. Add components under src/. Do not embed
sync secrets in the client.
```

## Using `@whoopix/cms-sync` (server only)

```js
import { createSyncClient } from '@whoopix/cms-sync';

const client = createSyncClient({
  baseUrl: 'http://127.0.0.1:8787',
  clientId: process.env.SYNC_CLIENT_ID,
  secret: process.env.SYNC_CLIENT_SECRET,
});

const pages = await client.read({
  table: 'mod_pages_list',
  action: 'list',
  limit: 20,
});
```

Use this from Node scripts, Next route handlers, or a small Express BFF — not from Vite browser code.

## Production notes

1. Put React build behind CDN/host of your choice.  
2. Run Node agent (or PHP agent) with MySQL on a secured HTTPS host.  
3. Point Whoopix CMS at that agent.  
4. Replace `/content/*` demo routes with authenticated BFF reads (`CONTENT_PUBLIC` must stay off in production).  
