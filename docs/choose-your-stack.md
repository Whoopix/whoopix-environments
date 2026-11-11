# Choose your stack

Every stack talks to Whoopix CMS the same way: a **tenant sync agent** implements **cms-sync-v1**. The front-end is your choice.

## Decision guide

```text
Need full Whoopix PHP modules/templates today?
  └─ YES → PHP tenant (whoopix-tenant)
  └─ NO
       Want a JS SPA / design system in React?
         └─ YES → React + Node agent
         └─ Prefer React with server routes in one repo?
               └─ YES → Next.js (+ agent or embedded BFF)
               └─ Prefer Python backend?
                     └─ YES → Python agent + any front
```

## Comparison

| | PHP tenant | React + Node | Next.js | Python agent |
|--|------------|--------------|---------|--------------|
| Front templates | PHP `templates/` + `modules/` | React components | App Router | Your choice |
| Sync agent | Built-in `system/api` | `environments/node-agent` | Call agent or BFF | You implement |
| CMS parity | Highest (production shape) | High via agent | High via agent | When agent is complete |
| Local demo without MySQL | Needs MySQL | `STORE=memory` | Via Node memory | DIY |
| Best for | Agencies, classic Whoopix sites | Product/marketing SPAs | Full-stack JS teams | Python shops |

## What Whoopix CMS expects

Regardless of stack, CMS needs:

1. A reachable agent base URL  
2. Matching `SYNC_CLIENT_ID` / `SYNC_CLIENT_SECRET`  
3. Endpoints for **read**, **operation**, **upload** (and ideally **schema**)

PHP and Node agents already provide these. Next/Python docs show how to wire the same contract.

## Recommendation

- **Shipping a client website on Whoopix soon** → start with [PHP](php-website.md).  
- **Exploring hybrid + Cursor for a modern UI** → start with [React + Node](react-node-website.md).  
- **Later** you can keep the same CMS site and swap fronts as long as the agent contract stays stable.  
