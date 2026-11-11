# React environment

Build UI in `src/`. Content should come from the Whoopix agent/CMS, not hard-coded marketing blocks when a CMS field exists.

HMAC secrets belong on a server (`@whoopix/cms-sync` or `environments/node-agent`), not in Vite env for the browser.
