export default async function handler(req, res) {
  try {
    // CORS for browser access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    const SAAVN_BASE = (globalThis.process && globalThis.process.env && globalThis.process.env.SAAVN_API_BASE_URL) || undefined;
    if (!SAAVN_BASE) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ error: 'SAAVN_API_BASE_URL not configured on server' }));
    }

    // Accept ?query=term or ?q=term; build the autocomplete.get query
    const incoming = new URL(req.url, `http://${req.headers.host}`);
    const q = incoming.searchParams.get('query') || incoming.searchParams.get('q') || '';

    const targetSearch = `?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(q)}`;
    const targetUrl = SAAVN_BASE + targetSearch;

    // Forward headers similarly to api/saavn/api.php.js
    const forwardHeaders = {};
    forwardHeaders['accept'] = req.headers['accept'] || 'application/json, text/plain, */*';
    forwardHeaders['referer'] = req.headers['referer'] || 'https://www.jiosaavn.com/';
    forwardHeaders['user-agent'] = req.headers['user-agent'] || 'Mozilla/5.0 (compatible)';
    const incomingCookie = req.headers['cookie'];
    const fallbackCookie = (globalThis.process && globalThis.process.env && globalThis.process.env.SAAVN_API_COOKIE) || '';
    const cookieToSend = incomingCookie && String(incomingCookie).trim() ? incomingCookie : (fallbackCookie && String(fallbackCookie).trim() ? fallbackCookie : '');
    if (cookieToSend) forwardHeaders['cookie'] = cookieToSend;
    forwardHeaders['host'] = new URL(SAAVN_BASE).host;

    const fetchOptions = { method: 'GET', headers: forwardHeaders };

    let upstream;
    try {
      upstream = await fetch(targetUrl, fetchOptions);
    } catch (fetchErr) {
      res.statusCode = 502;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ error: 'Upstream fetch failed', details: String(fetchErr && fetchErr.message ? fetchErr.message : fetchErr) }));
    }

    res.statusCode = upstream.status;
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);
    const cc = upstream.headers.get('cache-control');
    if (cc) res.setHeader('cache-control', cc);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (ct && (ct.startsWith('application/json') || ct.startsWith('text/'))) {
      const text = await upstream.text();
      return res.end(text);
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    if (typeof globalThis.Buffer !== 'undefined') {
      return res.end(globalThis.Buffer.from(uint8));
    }
    const fallbackText = new TextDecoder().decode(uint8);
    return res.end(fallbackText);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
  }
}
