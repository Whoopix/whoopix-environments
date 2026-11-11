# `@whoopix/cms-sync`

Small Node SDK for **cms-sync-v1**: HMAC signing + `read` / `operation` helpers.

```js
import { createSyncClient } from '@whoopix/cms-sync';

const cms = createSyncClient({
  baseUrl: 'http://127.0.0.1:8787',
  clientId: process.env.SYNC_CLIENT_ID,
  secret: process.env.SYNC_CLIENT_SECRET,
});

const pages = await cms.read({
  table: 'mod_pages_list',
  action: 'list',
  limit: 20,
});
```

Use this from a **server** (Node agent, Next.js route, Express BFF). Do not put `SYNC_CLIENT_SECRET` in browser bundles.
