export default async function handler(req, res) {
  try {
    // Allow preflight from browsers (if your frontend calls the function directly)
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
      res.end(JSON.stringify({ error: 'SAAVN_API_BASE_URL is not configured on the server' }));
      return;
    }

    // req.url includes the path within the serverless function (e.g. '/api/saavn/api.php?__call=...')
    const incoming = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = targetBase + (incoming.search || '');

    // Forward minimal safe headers
    const forwardHeaders = {};
    if (req.headers['accept']) forwardHeaders['accept'] = req.headers['accept'];
    if (req.headers['user-agent']) forwardHeaders['user-agent'] = req.headers['user-agent'];

    // Make request to JioSaavn server-side (no CORS needed)
    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      // Vercel/Node will have req.body parsed for common content-types depending on runtime config.
      // If a raw body is needed, it can be streamed; here we'll forward JSON/string bodies when present.
      if (req.body) {
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        if (!fetchOptions.headers['content-type']) fetchOptions.headers['content-type'] = req.headers['content-type'] || 'application/json';
      }
    }

    const upstream = await fetch(targetUrl, fetchOptions);

    // Copy upstream status and headers (but avoid hop-by-hop headers)
    res.statusCode = upstream.status;
    upstream.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (['transfer-encoding', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'upgrade'].includes(lower)) return;
      res.setHeader(key, val);
    });

    // Ensure the function response is accessible from browser when needed
    if (!res.getHeader('Access-Control-Allow-Origin')) res.setHeader('Access-Control-Allow-Origin', '*');

    const arrayBuffer = await upstream.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    if (typeof globalThis.Buffer !== 'undefined') {
      res.end(globalThis.Buffer.from(uint8));
    } else {
      // Fallback: decode as text
      const text = new TextDecoder().decode(uint8);
      res.end(text);
    }
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
  }
};
