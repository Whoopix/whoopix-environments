import { useEffect, useState } from 'react';
import { fetchPages, fetchSettings } from './lib/content.js';

export default function App() {
  const [pages, setPages] = useState([]);
  const [settings, setSettings] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, s] = await Promise.all([fetchPages(), fetchSettings()]);
        if (cancelled) return;
        setPages(p.data || []);
        const map = {};
        for (const row of s.data || []) map[row.name] = row.value;
        setSettings(map);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message +
              ' — start environments/node-agent (npm run dev) so /content/* is available.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <p className="brand">Whoopix</p>
        <h1>{settings.site_name || 'React environment'}</h1>
        <p className="lede">
          {settings.tagline ||
            'Build in React. Content and CMS operations stay on the Whoopix hybrid API.'}
        </p>
        <div className="cta">
          <a className="btn" href="https://www.cms.whoopix.ai/admin.php">
            Open CMS
          </a>
          <a className="btn ghost" href="https://github.com/Whoopix/whoopix-environments">
            Environments hub
          </a>
        </div>
      </header>

      <section className="panel">
        <h2>Pages from sync store</h2>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <ul>
            {pages.map((page) => (
              <li key={page.id}>
                <strong>{page.title}</strong>
                <span>/{page.url || ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
