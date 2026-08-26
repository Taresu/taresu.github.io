import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import worker from '../worker.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_HEADERS = new Map([
  ['x-content-type-options', 'nosniff'],
  ['x-frame-options', 'DENY'],
  ['referrer-policy', 'strict-origin-when-cross-origin'],
  ['permissions-policy', 'camera=(), geolocation=(), microphone=(), payment=(), usb=()'],
]);

function createAssetEnvironment() {
  return {
    ASSETS: {
      async fetch(request) {
        const pathname = new URL(request.url).pathname;
        if (pathname === '/index.md') {
          return new Response('# profile', {
            status: 206,
            statusText: 'Partial Content',
            headers: {
              'Cache-Control': 'upstream-markdown-cache',
              ETag: '"markdown-etag"',
              Vary: 'Accept-Encoding',
            },
          });
        }

        return new Response('<!doctype html>', {
          status: 203,
          statusText: 'Non-Authoritative Information',
          headers: {
            'Cache-Control': 'upstream-html-cache',
            'Content-Type': 'text/html',
            ETag: '"html-etag"',
          },
        });
      },
    },
  };
}

function executableInlineScriptHashes() {
  const html = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const hashes = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptPattern)) {
    const [, attributes, source] = match;
    if (/\bsrc\s*=/i.test(attributes)) continue;

    const type = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1].toLowerCase();
    if (type && !['application/javascript', 'text/javascript', 'module'].includes(type)) continue;

    const digest = createHash('sha256').update(source).digest('base64');
    hashes.push(`'sha256-${digest}'`);
  }
  return hashes;
}

function assertSecurityPolicy(response) {
  for (const [name, value] of REQUIRED_HEADERS) {
    assert.equal(response.headers.get(name), value, `${name} must use the hardened value`);
  }

  const policy = response.headers.get('content-security-policy');
  assert.ok(policy, 'Content-Security-Policy must be present');
  const directives = new Map(
    policy
      .split(';')
      .map(directive => directive.trim())
      .filter(Boolean)
      .map(directive => {
        const separator = directive.indexOf(' ');
        return separator === -1
          ? [directive, '']
          : [directive.slice(0, separator), directive.slice(separator + 1)];
      }),
  );

  assert.equal(directives.get('default-src'), "'self'");
  assert.equal(directives.get('base-uri'), "'self'");
  assert.equal(directives.get('object-src'), "'none'");
  assert.equal(directives.get('frame-ancestors'), "'none'");
  assert.equal(directives.get('form-action'), "'self'");
  assert.equal(directives.get('connect-src'), "'self' https://crawlindex.org");
  assert.equal(directives.get('img-src'), "'self' data: https://crawlindex.org https://webanalyzer.dev");
  assert.equal(directives.get('media-src'), "'self'");
  assert.equal(directives.get('font-src'), "'self'");
  assert.equal(directives.get('style-src'), "'self' 'unsafe-inline'");

  const scriptSources = directives.get('script-src')?.split(/\s+/) || [];
  assert.ok(scriptSources.includes("'self'"));
  assert.equal(scriptSources.includes("'unsafe-inline'"), false);
  assert.equal(scriptSources.includes("'unsafe-eval'"), false);
  for (const hash of executableInlineScriptHashes()) {
    assert.ok(scriptSources.includes(hash), `script-src must authorize ${hash}`);
  }
}

function globalStaticHeaders() {
  const source = readFileSync(path.join(projectRoot, '_headers'), 'utf8');
  const rules = new Map();
  let currentRule;

  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      currentRule = line.trim();
      rules.set(currentRule, new Map());
      continue;
    }

    const separator = line.indexOf(':');
    if (!currentRule || separator === -1) continue;
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    rules.get(currentRule).set(name, value);
  }

  return rules.get('/*');
}

test('Worker hardens HTML assets without losing response metadata', async () => {
  const response = await worker.fetch(
    new Request('https://thales-salata.dev/'),
    createAssetEnvironment(),
  );

  assert.equal(response.status, 203);
  assert.equal(response.statusText, 'Non-Authoritative Information');
  assert.equal(response.headers.get('cache-control'), 'upstream-html-cache');
  assert.equal(response.headers.get('etag'), '"html-etag"');
  assert.equal(await response.text(), '<!doctype html>');
  assertSecurityPolicy(response);
});

test('Worker hardens negotiated Markdown without losing response metadata', async () => {
  const response = await worker.fetch(
    new Request('https://thales-salata.dev/', { headers: { Accept: 'text/markdown' } }),
    createAssetEnvironment(),
  );

  assert.equal(response.status, 206);
  assert.equal(response.statusText, 'Partial Content');
  assert.equal(response.headers.get('cache-control'), 'public, max-age=3600');
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('etag'), '"markdown-etag"');
  assert.equal(response.headers.get('vary'), 'Accept-Encoding, Accept');
  assert.equal(await response.text(), '# profile');
  assertSecurityPolicy(response);
});

test('direct static assets use the same security policy as Worker responses', async () => {
  const workerResponse = await worker.fetch(
    new Request('https://thales-salata.dev/'),
    createAssetEnvironment(),
  );
  const staticHeaders = globalStaticHeaders();
  assert.ok(staticHeaders, '_headers must define a global static-asset rule');

  for (const name of [...REQUIRED_HEADERS.keys(), 'content-security-policy']) {
    assert.equal(staticHeaders.get(name), workerResponse.headers.get(name));
  }
});
