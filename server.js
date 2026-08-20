const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;
  let relativePath;

  try {
    relativePath = decodeURIComponent(urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, ''));
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  if (relativePath.endsWith('/')) relativePath += 'index.html';
  const filePath = path.resolve(ROOT, relativePath);
  const insideRoot = filePath === ROOT || filePath.startsWith(`${ROOT}${path.sep}`);

  if (!insideRoot) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});

// Fail loudly instead of silently when the port is already taken
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try: PORT=${Number(PORT) + 1} node server.js`);
    process.exit(1);
  }
  throw err;
});
