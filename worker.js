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
        return new Response(mdResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
