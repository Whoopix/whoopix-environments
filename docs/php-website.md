# Build a PHP website with Whoopix

Use the **[whoopix-tenant](https://github.com/Whoopix/whoopix-tenant)** repository — the production-shaped hybrid tenant.

## What you get

| Path | Role |
|------|------|
| `index.php` | Front entry |
| `templates/` | Page layouts CMS can assign |
| `modules/` | Pages, blog, products, contact, … |
| `system/api/` | Sync agent (CMS ↔ MySQL + uploads) |
| `files/upload/` | Media written by CMS uploads |
| `_sync_bridge_*.php` | Bridge helpers for pull/push |

## Install

```bash
git clone https://github.com/Whoopix/whoopix-tenant.git my-site
cd my-site

cp db.example.php db.php
cp config.example.php config.php
cp system/api/config.example.php system/api/config.php
```

### Configure

1. Create a MySQL database (utf8mb4).  
2. Set credentials in `db.php` and the same DB in `system/api/config.php` (`AGENT_DB_*`).  
3. Set:

```php
define('SYNC_CLIENT_ID', 'your-site-slug');
define('SYNC_CLIENT_SECRET', 'your-long-hex-secret');
```

4. Serve the folder with Apache/nginx/PHP built-in server so both the site and `/system/api/*` share one host.

```bash
php -S 127.0.0.1:8080 -t .
```

5. Connect CMS → [Connect to Whoopix CMS](connect-cms.md)  
   Agent base: `https://YOUR_HOST/system/api`

## Develop the front

| Task | Where |
|------|--------|
| Homepage / chrome | `templates/`, `index.php` |
| Inner pages | `modules/pages`, other `modules/*` |
| CSS/JS | `css/`, `js/`, template-local assets |
| Forms / leads | `wpx-lead-submit.php`, `includes/` |

Open the folder in Cursor → [Build with Cursor](build-with-cursor.md).

## Verify hybrid sync

1. In Whoopix CMS, edit a page title.  
2. Check MySQL (`mod_pages_list` / related tables).  
3. Refresh the PHP front — title updates.  
4. Upload an image in CMS → file under `files/upload/`.

## Agent API reference

Full contract: [system/api/README.md](https://github.com/Whoopix/whoopix-tenant/blob/main/system/api/README.md)  
Protocol summary: [cms-sync-v1.md](cms-sync-v1.md)

## Deploy

1. Deploy the tenant folder to your host (PHP + MySQL).  
2. Set production secrets via env or untracked config.  
3. HTTPS + correct `api_prefix` in CMS.  
4. Confirm cron/bridge endpoints if your host uses `_sync_bridge_apply.php`.  

## Don’ts

- Don’t commit `db.php` / `config.php` / `system/api/config.php`  
- Don’t remove HMAC verification “temporarily” in git  
- Don’t hard-code long marketing copy when a module field exists  
