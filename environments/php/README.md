# PHP environment

The full PHP hybrid tenant (templates, modules, `system/api` agent) lives in:

**https://github.com/Whoopix/whoopix-tenant**

```bash
git clone https://github.com/Whoopix/whoopix-tenant.git my-site
cd my-site
cp db.example.php db.php
cp config.example.php config.php
cp system/api/config.example.php system/api/config.php
```

Then open that folder in Cursor and build the website while keeping the sync API connected to Whoopix CMS.

This folder exists so the [environments hub](../../README.md) lists PHP alongside Node and React.
