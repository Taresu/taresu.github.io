import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

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
  '.txt':  'text/plain',
  '.xml':  'application/xml',
  '.json': 'application/json',
  '.md':   'text/markdown',
};

// RFC 8288 Link headers for agent discovery
const LINK_HEADERS = [
  '<https://taresu.github.io/index.md>; rel="alternate"; type="text/markdown"',
  '<https://taresu.github.io/sitemap.xml>; rel="sitemap"',
  '<https://taresu.github.io/.well-known/mcp/server-card.json>; rel="service-desc"',
  '<https://taresu.github.io/.well-known/agent-skills/index.json>; rel="agent-skills"',
].join(', ');

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Markdown content negotiation: serve index.md when client prefers text/markdown
  const accept = req.headers['accept'] || '';
  if ((urlPath === '/' || urlPath === '/index.html') && accept.includes('text/markdown')) {
    const mdPath = path.join(__dirname, 'index.md');
    fs.readFile(mdPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Link': LINK_HEADERS,
        'Vary': 'Accept',
      });
      res.end(data);
    });
    return;
  }

  if (urlPath === '/' || urlPath.endsWith('/')) urlPath = urlPath + 'index.html';
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const headers = { 'Content-Type': mime };
    // Add Link headers and Vary on HTML responses
    if (ext === '.html' || urlPath.endsWith('index.html')) {
      headers['Link'] = LINK_HEADERS;
      headers['Vary'] = 'Accept';
    }
    res.writeHead(200, headers);
    res.end(data);
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

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
