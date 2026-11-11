# React environment

Vite + React starter that renders content from a Whoopix-compatible agent.

## Run with the Node agent

```bash
# terminal 1
cd ../node-agent && cp .env.example .env && npm install && npm run dev

# terminal 2
cd ../react && cp .env.example .env && npm install && npm run dev
```

Open http://127.0.0.1:5173 — pages/settings come from the agent memory store (`/content/*` via Vite proxy).

## Production pattern

Browser → your BFF (Next/Express) using `@whoopix/cms-sync` → tenant agent ← Whoopix CMS.

Never put `SYNC_CLIENT_SECRET` in the React bundle.
