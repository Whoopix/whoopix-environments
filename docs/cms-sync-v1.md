# cms-sync-v1

Wire protocol between **Whoopix CMS** and a **tenant agent**.

## Auth headers

| Header | Meaning |
|--------|---------|
| `X-Sync-Client` | Client id (must match agent config) |
| `X-Sync-Timestamp` | Unix seconds; reject if skew &gt; `SYNC_MAX_AGE` (default 300) |
| `X-Sync-Signature` | `HMAC-SHA256(rawBody + '.' + timestamp, secret)` hex |
| `X-Sync-File-Hash` | Upload only: SHA-256 of file bytes |

## Envelope

```json
{
  "protocol": "cms-sync-v1",
  "client_id": "your-client-id",
  "request_id": "unique-per-call",
  "timestamp": 1714567890,
  "read": { },
  "operation": { }
}
```

Use either `read` or `operation` (not both) depending on endpoint.

## Endpoints (agent)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/read` or `/read.php` | list / get / count / aggregate / join |
| POST | `/operation` or `/operation.php` | upsert / update / delete |
| POST | `/upload` or `/upload.php` | multipart file upload |
| GET | `/schema?table=` or `/schema.php` | column discovery |
| GET | `/health` | liveness (Node agent) |

## Read actions

`list`, `get`, `count`, `aggregate`, `join` — see PHP agent README for filter operators.

## Operation actions

`upsert`, `update`, `delete` — `request_id` is idempotent (duplicate success → 409).
