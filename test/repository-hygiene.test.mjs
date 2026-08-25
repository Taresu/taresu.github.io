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
  const favicon = readFileSync(path.join(projectRoot, 'assets/favicon.svg'), 'utf8');
  assert.match(html, /<link rel="icon" href="assets\/favicon\.svg" type="image\/svg\+xml"\/>/);
  assert.match(favicon, /<svg[\s\S]*viewBox="0 0 32 32"/);
  assert.doesNotMatch(favicon, /<script|javascript:|moz-extension:/i);
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
