# Python environment (scaffold)

For FastAPI / Flask teams that want a Whoopix sync agent in Python.

Implement:

- `POST /read`, `POST /operation`, `POST /upload`
- Headers: `X-Sync-Client`, `X-Sync-Timestamp`, `X-Sync-Signature`
- Body protocol: `cms-sync-v1` (see [`docs/cms-sync-v1.md`](../../docs/cms-sync-v1.md))

```python
# signature = hmac.new(secret, f"{raw_body}.{timestamp}".encode(), hashlib.sha256).hexdigest()
```

Point CMS `api_prefix` at your FastAPI base URL once deployed or tunneled.

Status: protocol-ready scaffold docs — Node/PHP agents are the reference implementations today.
