import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args) {
  return spawnSync(command, args, { cwd: projectRoot, encoding: 'utf8', shell: false });
}

function trackedFiles() {
  const result = run('git', ['ls-files', '-z']);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.split('\0').filter(Boolean).filter(file => existsSync(path.join(projectRoot, file)));
}

function pngDimensions(filePath) {
  const image = readFileSync(filePath);
  return [image.readUInt32BE(16), image.readUInt32BE(20)];
}

test('tracked files exclude local output, installers, and private material', () => {
  const forbidden = /(^|\/)(?:\.playwright-cli|\.superpowers|output|temporary screenshots|docs\/superpowers)(?:\/|$)|(?:^|\/)(?:CLAUDE\.md|.*\.(?:deb|rpm|dmg|exe|pem|key|p12|pfx))$/i;
  assert.deepEqual(trackedFiles().filter(file => forbidden.test(file)), []);
});

test('tracked text contains no browser-extension or workstation residue', () => {
  const forbidden = /(moz-extension:\/\/|chrome-extension:\/\/|file:\/\/|(?:^|["' ])\/home\/[^\s"']+|(?:^|["' ])\/Users\/[^\s"']+)/i;
  const offenders = [];

  for (const file of trackedFiles()) {
    if (/\.(?:png|jpg|jpeg|gif|webp|pdf|mp3|woff2)$/i.test(file)) continue;
    const content = readFileSync(path.join(projectRoot, file), 'utf8');
    if (forbidden.test(content)) offenders.push(file);
  }

  assert.deepEqual(offenders, []);
});

test('Volkswagen employer logo uses the sanitized vector asset', () => {
  const html = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const svg = readFileSync(path.join(projectRoot, 'assets/Volkswagen_logo_2019.svg'), 'utf8');
  assert.match(html, /assets\/Volkswagen_logo_2019\.svg/);
  assert.match(html, /data-logo-bg="dark"/);
  assert.match(svg, /<path fill="#fff"/);
  assert.doesNotMatch(svg, /<script|moz-extension:|javascript:/i);
  assert.equal(existsSync(path.join(projectRoot, 'assets/Volkswagen-Emblem.png')), false);
});

test('the site exposes a self-hosted favicon', () => {
  const html = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const pngFavicon = readFileSync(path.join(projectRoot, 'assets/favicon.png'));
  const rootFavicon = readFileSync(path.join(projectRoot, 'favicon.ico'));
  const favicon = readFileSync(path.join(projectRoot, 'assets/favicon.svg'), 'utf8');
  const iconCount = rootFavicon.readUInt16LE(4);
  const iconSizes = Array.from({ length: iconCount }, (_, index) => {
    const offset = 6 + (index * 16);
    return rootFavicon[offset] || 256;
  });

  assert.match(html, /<link rel="icon" href="\/favicon\.ico" type="image\/x-icon"\/>/);
  assert.equal((html.match(/<link rel="icon"/g) || []).length, 1);
  assert.deepEqual([pngFavicon.readUInt32BE(16), pngFavicon.readUInt32BE(20)], [512, 512]);
  assert.ok(iconSizes.some(size => size >= 48), 'favicon.ico must include a Google-sized icon');
  assert.match(favicon, /<svg[\s\S]*viewBox="0 0 32 32"/);
  assert.doesNotMatch(favicon, /<script|javascript:|moz-extension:/i);
});

test('the authorial shield appears only at strategic brand touchpoints', () => {
  const home = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const services = readFileSync(path.join(projectRoot, 'servicos.html'), 'utf8');
  const brandDirectory = path.join(projectRoot, 'assets', 'brand');

  assert.equal(existsSync(path.join(brandDirectory, 'thales-salata-shield-source.png')), true);
  assert.equal(existsSync(path.join(brandDirectory, 'thales-salata-shield.png')), true);
  assert.deepEqual(pngDimensions(path.join(brandDirectory, 'thales-salata-shield-source.png')), [500, 500]);
  assert.deepEqual(pngDimensions(path.join(brandDirectory, 'thales-salata-shield.png')), [500, 500]);
  assert.deepEqual(
    [...home.matchAll(/data-brand-shield="([^"]+)"/g)].map(match => match[1]),
    ['hero', 'about', 'footer'],
  );
  assert.deepEqual(
    [...services.matchAll(/data-brand-shield="([^"]+)"/g)].map(match => match[1]),
    ['services-about', 'services-footer'],
  );
  assert.equal((home.match(/<img[^>]+src="assets\/brand\/thales-salata-shield\.png"/g) || []).length, 3);
  assert.equal((services.match(/<img[^>]+src="\/assets\/brand\/thales-salata-shield\.png"/g) || []).length, 2);
  assert.doesNotMatch(home, /rel="icon"[^>]+assets\/brand\/thales-salata-shield/);
});

test('the About section presents the canonical ASCII self-portrait accessibly', () => {
  const home = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const services = readFileSync(path.join(projectRoot, 'servicos.html'), 'utf8');
  const brandDirectory = path.join(projectRoot, 'assets', 'brand');
  const portraitPath = path.join(brandDirectory, 'ascii-self-portrait.svg');

  assert.equal(existsSync(portraitPath), true);
  const portrait = readFileSync(portraitPath, 'utf8');
  assert.ok(Buffer.byteLength(portrait) < 40_000, 'the canonical portrait should stay below 40 KB');
  assert.match(portrait, /viewBox="0 0 3074 3208"/);
  assert.doesNotMatch(portrait, /<script|<foreignObject|javascript:|(?:href|src)="https?:\/\//i);
  assert.equal((home.match(/data-ascii-portrait/g) || []).length, 1);
  assert.match(
    home,
    /<img src="assets\/brand\/ascii-self-portrait\.svg" width="3074" height="3208" alt="[^"]+" data-i18n-alt="about\.asciiAlt" loading="lazy" decoding="async"/,
  );
  assert.match(home, /data-i18n="about\.asciiTitle"/);
  assert.match(home, /data-i18n="about\.asciiCaption"/);
  assert.equal((home.match(/'about\.asciiAlt'/g) || []).length, 2);
  assert.equal((home.match(/'about\.asciiTitle'/g) || []).length, 2);
  assert.equal((home.match(/'about\.asciiCaption'/g) || []).length, 2);
  assert.doesNotMatch(services, /ascii-self-portrait/);
});

test('social cards reuse the canonical ASCII portrait source', () => {
  const brandDirectory = path.join(projectRoot, 'assets', 'brand');
  const renderer = readFileSync(path.join(projectRoot, 'render-social-cards.mjs'), 'utf8');

  assert.equal(existsSync(path.join(brandDirectory, 'ascii-art-social.webp')), false);
  assert.match(renderer, /ascii-self-portrait\.svg'\), 'image\/svg\+xml'/);
  assert.deepEqual(pngDimensions(path.join(brandDirectory, 'portfolio-social.png')), [1200, 630]);
  assert.deepEqual(pngDimensions(path.join(brandDirectory, 'services-social.png')), [1200, 630]);
});

test('local cleanup targets are ignored by Git', () => {
  for (const target of [
    '.playwright-cli/session.log',
    '.superpowers/brainstorm/state.json',
    'output/playwright/desktop.png',
    'temporary screenshots/mobile.png',
    'docs/superpowers/plans/local.md',
    'CLAUDE.md',
    'protonvpn-stable-release_1.0.8_all.deb',
  ]) {
    const result = run('git', ['check-ignore', '--quiet', '--no-index', '--', target]);
    assert.equal(result.status, 0, `${target} must be ignored`);
  }
});
