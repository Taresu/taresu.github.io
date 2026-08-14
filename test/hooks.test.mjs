import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    ...options,
    env: { ...process.env, ...options.env },
  });
}

function withTemporaryRepository(callback) {
  const repository = mkdtempSync(path.join(os.tmpdir(), 'portfolio-hooks-'));
  const initialized = run('git', ['init', '--quiet'], { cwd: repository });
  assert.equal(initialized.status, 0, initialized.stderr);

  try {
    callback(repository);
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
}

test('pre-commit accepts clean staged content and rejects whitespace errors', () => {
  withTemporaryRepository(repository => {
    const hook = path.join(projectRoot, '.githooks', 'pre-commit');
    const stagedFile = path.join(repository, 'example.txt');

    writeFileSync(stagedFile, 'clean content\n');
    assert.equal(run('git', ['add', 'example.txt'], { cwd: repository }).status, 0);
    const cleanResult = run('sh', [hook], { cwd: repository });
    assert.equal(cleanResult.status, 0, cleanResult.stderr);

    writeFileSync(stagedFile, 'trailing whitespace  \n');
    assert.equal(run('git', ['add', 'example.txt'], { cwd: repository }).status, 0);
    const invalidResult = run('sh', [hook], { cwd: repository });
    assert.notEqual(invalidResult.status, 0, 'the hook must reject staged whitespace errors');
  });
});

test('pre-push propagates the static verification result', () => {
  withTemporaryRepository(repository => {
    const hook = path.join(projectRoot, '.githooks', 'pre-push');
    writeFileSync(
      path.join(repository, 'package.json'),
      JSON.stringify({
        scripts: {
          'verify:static': 'node -e "process.exit(Number(process.env.VERIFY_EXIT || 0))"',
        },
      }),
    );

    const success = run('sh', [hook], { cwd: repository, env: { VERIFY_EXIT: '0' } });
    assert.equal(success.status, 0, success.stderr);

    const failure = run('sh', [hook], { cwd: repository, env: { VERIFY_EXIT: '23' } });
    assert.equal(failure.status, 23, 'the hook must block a push when verification fails');
  });
});

test('hooks:install configures the repository to use versioned hooks', () => {
  withTemporaryRepository(repository => {
    const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const installCommand = packageJson.scripts?.['hooks:install'];
    assert.ok(installCommand, 'package.json must expose the hooks:install command');

    const installation = run('sh', ['-c', installCommand], { cwd: repository });
    assert.equal(installation.status, 0, installation.stderr);

    const configuredPath = run('git', ['config', '--get', 'core.hooksPath'], { cwd: repository });
    assert.equal(configuredPath.status, 0, configuredPath.stderr);
    assert.equal(configuredPath.stdout.trim(), '.githooks');
  });
});
