// Cloudflare Pages middleware
// Intercepts GET / with Accept: text/markdown and serves index.md instead.

export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  const accept = request.headers.get('Accept') || '';

  if (
    (url.pathname === '/' || url.pathname === '/index.html') &&
    accept.includes('text/markdown')
  ) {
    const mdUrl = new URL('/index.md', request.url);
    const mdResponse = await fetch(mdUrl);
    if (mdResponse.ok) {
      return new Response(await mdResponse.text(), {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  return next();
}
