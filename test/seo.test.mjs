import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalOrigin = 'https://thales-salata.dev';
const legacyOrigin = 'https://taresu.github.io';

function listFiles(directory, relativeTo = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listFiles(entryPath, relativeTo)
      : [path.relative(relativeTo, entryPath)];
  });
}

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

function containsLegacyOrigin(document) {
  const urlCandidates = document.match(/https?:\/\/[^\s"'<>]+/g) || [];
  return urlCandidates.some(candidate => {
    try {
      return new URL(candidate).origin === legacyOrigin;
    } catch {
      return false;
    }
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
    publicDocuments.every(document => !containsLegacyOrigin(document)),
    'public SEO and discovery documents must not advertise the legacy origin',
  );
});

test('the services page is available at its canonical URL', async t => {
  const port = await reservePort();
  const server = await startServer(port);
  t.after(() => server.kill());

  const response = await fetch(`http://127.0.0.1:${port}/servicos`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.ok(html.includes(`<link rel="canonical" href="${canonicalOrigin}/servicos"/>`));
});

test('the sitemap advertises the canonical services page', () => {
  const sitemap = readFileSync(path.join(projectRoot, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, new RegExp(`<loc>${canonicalOrigin}/servicos</loc>`));
});

test('Cloudflare default deploy works from a clean checkout with an asset allowlist', () => {
  rmSync(path.join(projectRoot, 'public'), { recursive: true, force: true });
  const wranglerConfig = readFileSync(path.join(projectRoot, 'wrangler.toml'), 'utf8');
  const assetsDirectory = wranglerConfig.match(/\[assets\][\s\S]*?directory = "([^"]+)"/)?.[1];
  assert.ok(assetsDirectory, 'Wrangler must configure an assets directory');
  assert.equal(
    existsSync(path.join(projectRoot, assetsDirectory)),
    true,
    'the configured assets directory must exist in a fresh checkout before any build command',
  );

  const ignoreRules = readFileSync(path.join(projectRoot, '.assetsignore'), 'utf8');
  const fixture = mkdtempSync(path.join(os.tmpdir(), 'portfolio-assets-'));
  const allowed = [
    'favicon.ico',
    'index.html',
    'index.md',
    'robots.txt',
    'servicos.html',
    'sitemap.xml',
    '_headers',
    path.join('assets', 'vendor', 'bundle.js'),
    path.join('.well-known', 'mcp', 'server-card.json'),
  ];
  const forbidden = [
    'worker.js',
    'wrangler.toml',
    'package.json',
    'LICENSE',
    path.join('docs', 'internal.md'),
    path.join('test', 'seo.test.mjs'),
    path.join('.wrangler', 'cache', 'account.json'),
  ];

  try {
    assert.equal(spawnSync('git', ['init', '--quiet'], { cwd: fixture }).status, 0);
    mkdirSync(path.join(fixture, '.git', 'info'), { recursive: true });
    writeFileSync(path.join(fixture, '.git', 'info', 'exclude'), ignoreRules);
    for (const file of [...allowed, ...forbidden]) {
      const filePath = path.join(fixture, file);
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, 'fixture');
    }

    for (const file of allowed) {
      const result = spawnSync('git', ['check-ignore', '--quiet', '--no-index', file], { cwd: fixture });
      assert.equal(result.status, 1, `${file} must be included in Worker assets`);
    }
    for (const file of forbidden) {
      const result = spawnSync('git', ['check-ignore', '--quiet', '--no-index', file], { cwd: fixture });
      assert.equal(result.status, 0, `${file} must be excluded from Worker assets`);
    }
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('Wrangler deploys the Worker to the canonical custom domain', () => {
  const wranglerConfig = readFileSync(path.join(projectRoot, 'wrangler.toml'), 'utf8');
  assert.match(
    wranglerConfig,
    /\[\[routes\]\][\s\S]*?pattern = "thales-salata\.dev"[\s\S]*?custom_domain = true/,
  );
});

test('the Pages build contains only published site artifacts', () => {
  const build = spawnSync('npm', ['run', 'build:pages'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  assert.equal(build.status, 0, build.stderr);

  const deployedFiles = listFiles(path.join(projectRoot, 'public'));
  assert.ok(deployedFiles.includes('favicon.ico'));
  assert.ok(deployedFiles.includes('index.html'));
  assert.ok(deployedFiles.includes('robots.txt'));
  assert.ok(deployedFiles.includes('servicos.html'));
  assert.ok(deployedFiles.includes('sitemap.xml'));
  assert.ok(deployedFiles.includes(path.join('.well-known', 'mcp', 'server-card.json')));
  assert.equal(deployedFiles.some(file => file.startsWith('.wrangler')), false);
  assert.equal(deployedFiles.some(file => file.startsWith('docs')), false);
  assert.equal(deployedFiles.includes('wrangler.toml'), false);
});
