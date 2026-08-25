import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
    env: { ...process.env, PORT: String(port), PORTFOLIO_HOST: '' },
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

function requestStatus(port, requestPath, method = 'GET', hostname = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const request = http.request({ hostname, port, path: requestPath, method }, response => {
      response.resume();
      response.once('end', () => resolve(response.statusCode));
    });
    request.once('error', reject);
    request.end();
  });
}

test('local server rejects non-public and traversal paths', async t => {
  const port = await reservePort();
  const server = await startServer(port);
  t.after(() => server.kill());

  const forbiddenPaths = [
    '/.git/config',
    '/package.json',
    '/../../../../etc/passwd',
    '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd',
    '/..%2f..%2f..%2f..%2fetc%2fpasswd',
  ];

  for (const requestPath of forbiddenPaths) {
    assert.equal(
      await requestStatus(port, requestPath),
      404,
      `${requestPath} must not be readable through the development server`,
    );
  }
});

test('local server rejects non-read methods', async t => {
  const port = await reservePort();
  const server = await startServer(port);
  t.after(() => server.kill());

  assert.equal(await requestStatus(port, '/index.html', 'POST'), 405);
});

test('local server binds to loopback by default', async t => {
  const nonLoopbackAddress = Object.values(os.networkInterfaces())
    .flat()
    .find(address => address?.family === 'IPv4' && !address.internal)?.address;
  if (!nonLoopbackAddress) {
    t.skip('no non-loopback IPv4 interface is available');
    return;
  }

  const port = await reservePort();
  const server = await startServer(port);
  t.after(() => server.kill());

  await assert.rejects(
    requestStatus(port, '/', 'GET', nonLoopbackAddress),
    error => error.code === 'ECONNREFUSED' || error.code === 'EHOSTUNREACH',
  );
});

test('local server rejects public-path symlinks that escape the repository', async t => {
  const externalDirectory = mkdtempSync(path.join(os.tmpdir(), 'portfolio-server-security-'));
  const externalFile = path.join(externalDirectory, 'private.txt');
  const publicLink = path.join(projectRoot, 'assets', `security-test-${process.pid}.txt`);
  writeFileSync(externalFile, 'private fixture');
  symlinkSync(externalFile, publicLink);
  t.after(() => {
    rmSync(publicLink, { force: true });
    rmSync(externalDirectory, { recursive: true, force: true });
  });

  const port = await reservePort();
  const server = await startServer(port);
  t.after(() => server.kill());

  assert.equal(await requestStatus(port, `/assets/${path.basename(publicLink)}`), 404);
});
