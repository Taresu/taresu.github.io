const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'sha256-ViNC/VHt4jfqj/aHF8mCa+8F5HpHglzjY7e121V280w=' 'sha256-nD0G06XBfPbVkT8muoOANdG15pZU25Ivqa8biSX70iA=' 'sha256-i1fepjD+8wjzShChLhL2biTis7Nh1g+ii/JR37slmnM=' 'sha256-8oVi9sFqf8BZlQy7BXq7K9pLFJIoUUts2gzIu0LqAtc='",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://crawlindex.org https://webanalyzer.dev",
  "media-src 'self'",
  "connect-src 'self' https://crawlindex.org",
  "worker-src 'none'",
].join('; ');

export const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
});

function secureResponse(response, overrides = {}) {
  // Preserve the asset stream and metadata while adding headers to this Worker-generated response.
  const securedResponse = new Response(response.body, response);
  for (const [name, value] of Object.entries(overrides)) {
    securedResponse.headers.set(name, value);
  }
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    securedResponse.headers.set(name, value);
  }
  return securedResponse;
}

function appendVary(headers, value) {
  const values = (headers.get('Vary') || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  if (!values.some(item => item.toLowerCase() === value.toLowerCase())) values.push(value);
  return values.join(', ');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get('Accept') || '';

    if (
      (url.pathname === '/' || url.pathname === '/index.html') &&
      accept.includes('text/markdown')
    ) {
      const mdResponse = await env.ASSETS.fetch(
        new Request(new URL('/index.md', request.url))
      );
      if (mdResponse.ok) {
        return secureResponse(mdResponse, {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': appendVary(mdResponse.headers, 'Accept'),
          'Cache-Control': 'public, max-age=3600',
        });
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);
    return secureResponse(assetResponse);
  },
};
