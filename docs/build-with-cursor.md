# Build websites with Cursor

Whoopix environments are designed so **Cursor** (or any coding agent) can generate the front-end while the **CMS stays the content brain**.

## Project setup in Cursor

1. **File → Open Folder** on the environment root:
   - PHP: the `whoopix-tenant` clone  
   - React: `whoopix-environments/environments/react` (keep `node-agent` running)  
2. Confirm `AGENTS.md` is present (agents should read it).  
3. Optionally add a short project rule: “Follow AGENTS.md; keep Whoopix sync API intact.”

## Golden rules for AI prompts

1. **Layout in code, copy in CMS** — hero text, services, blogs, SEO fields should come from `mod_*` / agent data when those modules exist.  
2. **Do not rewrite sync auth** — never “simplify” HMAC headers.  
3. **Do not commit secrets** — examples only (`*.example.php`, `.env.example`).  
4. **Reuse modules** — prefer `modules/pages`, `modules/blog`, `modules/contact`, etc. over parallel routers.  
5. **Templates are assignable** — new page templates should be selectable from CMS (`mod_pages_list.template`).

## Prompt library

### New marketing site (PHP)

```text
You are working in a Whoopix PHP tenant (see AGENTS.md and README).
Build a complete marketing website:
- Homepage, about, services, blog listing, contact
- Use templates/ for page chrome and modules/ for features
- Content must remain editable from Whoopix CMS via existing mod_* tables
- Keep system/api HMAC sync unchanged
- Mobile-first, accessible, distinctive typography (no generic Inter/purple AI look)
```

### New React front

```text
You are in environments/react with content from the Node Whoopix agent (/content/* via Vite proxy).
Build a multi-section marketing site that renders pages/settings from the agent.
Add routes/components as needed. Do not put SYNC_CLIENT_SECRET in the browser.
When a BFF is needed, use @whoopix/cms-sync on the server only.
```

### Add a CMS-assignable template (PHP)

```text
Create templates/my-landing.php for a landing layout with hero, features grid, and CTA.
Wire it so Whoopix can assign it on a page in mod_pages_list.
Pull feature titles/bodies from existing module fields where possible.
```

### Wire a form to Whoopix

```text
Use the existing lead/contact handlers (wpx-lead-submit / includes contact handlers).
Do not invent a new mail stack unless missing. Keep submissions compatible with CMS lead flows.
```

### Visual polish pass

```text
Improve the first viewport as one composition: brand-first, one headline, one supporting line,
one CTA group, strong real visual. Avoid card-heavy hero and generic purple gradients.
Keep all user-editable strings sourced from CMS data.
```

## What good output looks like

| Good | Bad |
|------|-----|
| New `templates/…` + CSS using module data | Hard-coded paragraphs that editors can’t change |
| Uses `modules.php` routing | New `router.php` that bypasses Whoopix |
| Leaves `system/api` alone | Deletes HMAC “for local testing” in committed code |
| Documents new env vars in `.env.example` | Puts real secrets in repo |

## After the AI builds

1. Run the site locally  
2. Assign the new template to a page in Whoopix CMS (PHP)  
3. Edit content in CMS → confirm front updates  
4. Commit only code + examples — never secrets  

## Related files agents should read

- Root [`AGENTS.md`](../AGENTS.md)  
- Stack `AGENTS.md` inside each environment  
- [`docs/cms-sync-v1.md`](cms-sync-v1.md) before touching the agent  
- PHP: [whoopix-tenant AGENTS.md](https://github.com/Whoopix/whoopix-tenant/blob/main/AGENTS.md)  
