import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANONICAL_ROOT = fs.realpathSync(__dirname);
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.PORTFOLIO_HOST || '127.0.0.1';

const PUBLIC_ROOT_FILES = new Set([
  'index.html',
  'index.md',
  'robots.txt',
  'sitemap.xml',
]);
const PUBLIC_DIRECTORIES = new Set(['assets', '.well-known']);

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.pdf':  'application/pdf',
  '.mp3':  'audio/mpeg',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
  '.json': 'application/json',
  '.md':   'text/markdown',
};

// RFC 8288 Link headers for agent discovery
const LINK_HEADERS = [
  '<https://thales-salata.dev/index.md>; rel="alternate"; type="text/markdown"',
  '<https://thales-salata.dev/sitemap.xml>; rel="sitemap"',
  '<https://thales-salata.dev/.well-known/mcp/server-card.json>; rel="service-desc"',
  '<https://thales-salata.dev/.well-known/agent-skills/index.json>; rel="agent-skills"',
].join(', ');

function resolvePublicFile(requestUrl) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return null;
  }

  if (urlPath.includes('\\')) return null;
  if (urlPath === '/' || urlPath.endsWith('/')) urlPath += 'index.html';

  const segments = urlPath.split('/').filter(Boolean);
  const isRootFile = segments.length === 1 && PUBLIC_ROOT_FILES.has(segments[0]);
  const isPublicDirectory = segments.length > 1 && PUBLIC_DIRECTORIES.has(segments[0]);
  const hasHiddenSegment = segments.some(
    (segment, index) => segment.startsWith('.') && !(index === 0 && segment === '.well-known'),
  );
  if ((!isRootFile && !isPublicDirectory) || hasHiddenSegment) return null;

  // Security boundary: a request may resolve only to an explicitly public path inside this repository.
  const filePath = path.resolve(__dirname, ...segments);
  if (!filePath.startsWith(`${__dirname}${path.sep}`)) return null;

  return { filePath, urlPath: `/${segments.join('/')}` };
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Method not allowed');
    return;
  }

  const publicFile = resolvePublicFile(req.url);
  if (!publicFile) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const { filePath, urlPath } = publicFile;

  // Markdown content negotiation: serve index.md when client prefers text/markdown
  const accept = req.headers['accept'] || '';
  const servesMarkdown = urlPath === '/index.html' && accept.includes('text/markdown');
  const requestedFilePath = servesMarkdown ? path.join(__dirname, 'index.md') : filePath;

  fs.realpath(requestedFilePath, (realPathError, canonicalPath) => {
    if (realPathError || !canonicalPath.startsWith(`${CANONICAL_ROOT}${path.sep}`)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    fs.readFile(canonicalPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      if (servesMarkdown) {
        res.writeHead(200, {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Link': LINK_HEADERS,
          'Vary': 'Accept',
        });
        res.end(data);
        return;
      }

      const ext = path.extname(filePath);
      const headers = { 'Content-Type': MIME[ext] || 'text/plain' };
      // Add Link headers and Vary on HTML responses
      if (ext === '.html' || urlPath.endsWith('index.html')) {
        headers['Link'] = LINK_HEADERS;
        headers['Vary'] = 'Accept';
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPorta ${PORT} já está em uso.`);
    console.error(`O servidor provavelmente já está rodando em http://localhost:${PORT}\n`);
    console.error(`Para encerrar o processo: kill $(lsof -ti:${PORT})\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
