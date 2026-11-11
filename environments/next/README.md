# Next.js environment (scaffold)

Use this when you want React **and** a server BFF in one app.

Recommended shape:

1. App Router UI in `app/`
2. Route handlers under `app/api/...` that call `@whoopix/cms-sync` with `SYNC_CLIENT_*`
3. Whoopix CMS still talks to a tenant agent (`whoopix-tenant` PHP or `environments/node-agent`)

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir
npm install file:../../packages/cms-sync
```

Wire `createSyncClient({ baseUrl, clientId, secret })` only in server components / route handlers.

Status: documented starter path — expand into a full template when you need it; React + Node agent already cover the hybrid loop.
