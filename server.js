const http = require('http');
const fs = require('fs');
const path = require('path');
const build = require('./scripts/build');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DEV = process.argv.includes('--dev');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
};

// Only these folders/files are public; source partials, scripts and node_modules are not served.
const PUBLIC = /^\/(index\.html|css\/[\w.-]+\.css|js\/[\w.-]+\.js|assets\/[\w./-]+)$/;

// Rebuild index.html when the file system allows it. Hosts with a read-only file system (serverless platforms)
// simply use the committed index.html.
function safeBuild() {
  try { build(); } catch (e) { if (DEV) console.warn('Build skipped:', e.message); }
}
safeBuild();

function handler(req, res) {
  try {
    let reqUrl = decodeURI(req.url.split('?')[0]);
    if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';
    if (DEV && reqUrl === '/index.html') safeBuild();          // dev: pick up edits to src/sections without restarting

    if (!PUBLIC.test(reqUrl) || reqUrl.includes('..')) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const filePath = path.normalize(path.join(PUBLIC_DIR, reqUrl));
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        // images rarely change: let browsers keep them for a day; pages, styles and scripts always fresh
        'Cache-Control': ext === '.html' || ext === '.css' || ext === '.js' ? 'no-cache' : 'public, max-age=86400',
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error: ' + e.message);
  }
}

// `node server.js` starts a server; platforms that import this file get the request handler instead.
if (require.main === module) {
  http.createServer(handler).listen(PORT, () => {
    console.log(`Wedding invitation running at http://localhost:${PORT}/`);
    console.log(`Personal link example: http://localhost:${PORT}/?to=Rahul%20Sharma`);
  });
}

module.exports = handler;
