export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    const targetBase = (globalThis.process && globalThis.process.env && (globalThis.process.env.PLAYLIST_SONGS_URL || globalThis.process.env.SAAVN_PLAYLIST_SONGS_URL)) || undefined;
    if (!targetBase) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ error: 'PLAYLIST_SONGS_URL is not configured on the server' }));
    }

    const incoming = new URL(req.url, `http://${req.headers.host}`);
    const id = incoming.searchParams.get('id');
    if (!id) {
      res.statusCode = 400;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ error: 'missing id parameter' }));
    }

    // Build target URL
    let targetUrl = targetBase;
    if (targetUrl.includes('?')) {
      targetUrl = targetUrl + `&id=${encodeURIComponent(id)}`;
    } else {
      targetUrl = targetUrl + `?id=${encodeURIComponent(id)}`;
    }

    // Forward minimal headers
    const headers = {
      accept: req.headers['accept'] || 'application/json, text/plain, */*',
      referer: req.headers['referer'] || '',
      'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (compatible)'
    };

    let upstream;
    try {
      upstream = await fetch(targetUrl, { method: 'GET', headers });
    } catch (e) {
      res.statusCode = 502;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ error: 'Upstream fetch failed', details: String(e && e.message ? e.message : e) }));
    }

    res.statusCode = upstream.status;
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);
    const text = await upstream.text();
    return res.end(text);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
  }
}
