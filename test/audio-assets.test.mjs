import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioPath = path.join(projectRoot, 'assets/audio/chill-lofi-inspired-loop.mp3');
const licensePath = path.join(projectRoot, 'assets/audio/LICENSE-chill-lofi-inspired.md');

test('reactive lo-fi asset matches the reviewed CC0 transcode', () => {
  const audio = readFileSync(audioPath);
  assert.equal(statSync(audioPath).size, 1_945_645);
  assert.equal(
    createHash('sha256').update(audio).digest('hex'),
    '78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535',
  );

  const license = readFileSync(licensePath, 'utf8');
  assert.match(license, /Chill Lofi Inspired/);
  assert.match(license, /omfgdude/);
  assert.match(license, /qubodup/);
  assert.match(license, /CC0 1\.0 Universal/);
  assert.match(license, /chill-lofi-inspired-loop-edit/);
  assert.match(license, /78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535/);
});
