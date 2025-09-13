export default async function handler(req, res) {
  try {
    // Always set CORS headers early so responses (including errors) are accessible from the browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    // Use SAAVN_API_BASE_URL from environment to avoid hardcoding the upstream URL
    const targetBase = (globalThis.process && globalThis.process.env && globalThis.process.env.SAAVN_API_BASE_URL) || undefined;
    if (!targetBase) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ error: 'SAAVN_API_BASE_URL is not configured on the server' }));
    }

    // Build upstream URL using incoming query string
    const incoming = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = targetBase + (incoming.search || '');

    // Forward minimal safe headers
    const forwardHeaders = {};
    if (req.headers['accept']) forwardHeaders['accept'] = req.headers['accept'];
    if (req.headers['user-agent']) forwardHeaders['user-agent'] = req.headers['user-agent'];

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!fetchOptions.headers['content-type']) fetchOptions.headers['content-type'] = req.headers['content-type'] || 'application/json';
    }

    console.log('[saavn-proxy] targetUrl=', targetUrl);
    let upstream;
    try {
      upstream = await fetch(targetUrl, fetchOptions);
    } catch (fetchErr) {
      // Log the error for Vercel diagnostics
      console.error('[saavn-proxy] fetch error for', targetUrl, fetchErr);
      // Network-level error when contacting upstream
      res.statusCode = 502;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ error: 'Upstream fetch failed', details: String(fetchErr && fetchErr.message ? fetchErr.message : fetchErr) }));
    }

    // Propagate upstream status
    res.statusCode = upstream.status;

    // Forward only safe headers (content-type, cache-control) to the client
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);
    const cc = upstream.headers.get('cache-control');
    if (cc) res.setHeader('cache-control', cc);

    // Ensure CORS header is present
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Return body appropriately depending on content type
    if (ct && (ct.startsWith('application/json') || ct.startsWith('text/'))) {
      const text = await upstream.text();
      return res.end(text);
    }

    // For binary responses
    const arrayBuffer = await upstream.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    if (typeof globalThis.Buffer !== 'undefined') {
      return res.end(globalThis.Buffer.from(uint8));
    }

    // Fallback: send decoded text
    const fallbackText = new TextDecoder().decode(uint8);
    return res.end(fallbackText);
  } catch (err) {
    // Unexpected internal error
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
  }
};
