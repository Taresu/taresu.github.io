import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalOrigin = 'https://thales-salata.dev';
const legacyOrigin = 'https://taresu.github.io';

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(error => {
        if (error) reject(error);
        else resolve(address.port);
      });
    });
  });
}

function startServer(port) {
  const server = spawn(process.execPath, ['serve.mjs'], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return new Promise((resolve, reject) => {
    let stderr = '';
    const timeout = setTimeout(() => {
      server.kill();
      reject(new Error(`server startup timed out: ${stderr}`));
    }, 5000);

    server.stderr.on('data', chunk => {
      stderr += chunk;
    });
    server.once('exit', code => {
      clearTimeout(timeout);
      reject(new Error(`server exited with code ${code}: ${stderr}`));
    });
    server.stdout.once('data', () => {
      clearTimeout(timeout);
      resolve(server);
    });
  });
}

test('public SEO endpoints identify the custom domain as the only canonical host', async t => {
  const port = await reservePort();
  const server = await startServer(port);
  t.after(() => server.kill());

  const baseUrl = `http://127.0.0.1:${port}`;
  const [homeResponse, robotsResponse, sitemapResponse, markdownResponse, serverCardResponse, skillsResponse] =
    await Promise.all([
      fetch(`${baseUrl}/`),
      fetch(`${baseUrl}/robots.txt`),
      fetch(`${baseUrl}/sitemap.xml`),
      fetch(`${baseUrl}/index.md`),
      fetch(`${baseUrl}/.well-known/mcp/server-card.json`),
      fetch(`${baseUrl}/.well-known/agent-skills/index.json`),
    ]);

  const home = await homeResponse.text();
  const robots = await robotsResponse.text();
  const sitemap = await sitemapResponse.text();
  const publicDocuments = [
    home,
    robots,
    sitemap,
    await markdownResponse.text(),
    await serverCardResponse.text(),
    await skillsResponse.text(),
    homeResponse.headers.get('link') || '',
  ];

  assert.ok(
    home.includes(`<link rel="canonical" href="${canonicalOrigin}/"/>`),
    'the homepage must declare the custom domain as canonical',
  );
  assert.ok(home.includes(`property="og:url" content="${canonicalOrigin}/"`));
  assert.ok(home.includes('"@type": "ProfilePage"'));
  assert.match(robots, new RegExp(`Sitemap: ${canonicalOrigin}/sitemap\\.xml`));
  assert.doesNotMatch(robots, /^Disallow: \/assets\/$/m);
  assert.match(sitemap, new RegExp(`<loc>${canonicalOrigin}/</loc>`));
  assert.ok(
    publicDocuments.every(document => !document.includes(legacyOrigin)),
    'public SEO and discovery documents must not advertise the legacy origin',
  );
});
