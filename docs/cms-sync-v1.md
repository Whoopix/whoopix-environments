# cms-sync-v1 protocol

Wire format between **Whoopix CMS** and a **tenant sync agent**.

PHP reference implementation: [whoopix-tenant/system/api](https://github.com/Whoopix/whoopix-tenant/tree/main/system/api)  
Node reference implementation: [environments/node-agent](../environments/node-agent)  
JS helper: [@whoopix/cms-sync](../packages/cms-sync)

## Authentication

Every signed request includes:

| Header | Value |
|--------|--------|
| `X-Sync-Client` | Client id (must equal agent `SYNC_CLIENT_ID`) |
| `X-Sync-Timestamp` | Unix time in seconds |
| `X-Sync-Signature` | `hex(HMAC-SHA256(secret, rawBody + "." + timestamp))` |
| `X-Sync-File-Hash` | Upload only: `hex(SHA256(fileBytes))` |

Reject when:

- Any required header is missing  
- Client id unknown  
- Absolute clock skew &gt; `SYNC_MAX_AGE` (default **300**)  
- Signature mismatch  

## JSON envelope

```json
{
  "protocol": "cms-sync-v1",
  "client_id": "your-client-id",
  "request_id": "unique-id-per-call",
  "timestamp": 1714567890
}
```

Add either a `read` object (read endpoint) or an `operation` object (write endpoint).

`request_id` is idempotent on successful writes — repeating a successful id returns **409**.

## Endpoints

| Method | PHP path | Node path | Purpose |
|--------|----------|-----------|---------|
| POST | `/read.php` | `/read` | Query rows |
| POST | `/operation.php` | `/operation` | Insert/update/delete |
| POST | `/upload.php` | `/upload` | Multipart upload |
| GET | `/schema.php?table=` | `/schema?table=` | Column discovery |
| GET | — | `/health` | Liveness |

Base URL examples:

- PHP: `https://site.example/system/api`  
- Node: `https://agent.example`  

## Read

```json
{
  "protocol": "cms-sync-v1",
  "client_id": "acme",
  "request_id": "…",
  "timestamp": 1714567890,
  "read": {
    "table": "mod_pages_list",
    "action": "list",
    "columns": ["id", "title", "url"],
    "filters": [{ "field": "status", "operator": "=", "value": 1 }],
    "filter_logic": "AND",
    "sort": { "field": "id", "direction": "DESC" },
    "limit": 50,
    "page": 1
  }
}
```

**Actions:** `list` · `get` · `count` · `aggregate` · `join`

**Filter operators:** `=` `!=` `>` `>=` `<` `<=` `LIKE` `IN` `NOT IN` `BETWEEN` `IS NULL` `IS NOT NULL`

## Operation (write)

```json
{
  "protocol": "cms-sync-v1",
  "client_id": "acme",
  "request_id": "…",
  "timestamp": 1714567890,
  "operation": {
    "action": "upsert",
    "table": "mod_pages_list",
    "primary_key": "id",
    "rows": [{ "id": 0, "title": "Home", "status": 1 }]
  }
}
```

**Actions:** `upsert` · `update` · `delete`  
`id: 0` / missing id on upsert → insert.

## Upload

`multipart/form-data` with field `file` and `type` (`images` | `templates` | `videos`).

Signature for uploads may use `type.filename.timestamp` (see PHP agent README). Always send `X-Sync-File-Hash`.

## Implementing a new language agent

If you add Go, Python, etc.:

1. Verify HMAC exactly as above  
2. Enforce protocol name `cms-sync-v1`  
3. Implement read / operation / upload / schema  
4. Keep secrets server-side  
5. Document the base URL pattern in the environment README  

See [environments/python](../environments/python/README.md) for a checklist-style scaffold.  
