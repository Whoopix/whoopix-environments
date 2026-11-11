# Agent guide — Whoopix environments monorepo

This repo holds **multiple tenant/dev environments** that integrate with Whoopix CMS via **cms-sync-v1**.

## Choosing a stack

- Classic PHP Whoopix front → `environments/php` or clone `Whoopix/whoopix-tenant`
- JS sync agent / BFF → `environments/node-agent`
- SPA / headless UI → `environments/react`
- Shared signing + typed calls → `packages/cms-sync`

## Rules

1. Never invent a parallel auth scheme — keep HMAC headers exactly as documented.
2. Never commit real `SYNC_CLIENT_SECRET`, DB passwords, or `.env`.
3. Prefer content in CMS-managed tables / API payloads over hard-coded marketing copy.
4. When adding a new environment (Vue, Next, Python, …), mirror the same README + AGENTS + `.env.example` pattern and link it from the root README.
