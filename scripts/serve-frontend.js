#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, prettier/prettier */
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const distDir = path.resolve(__dirname, '..', 'frontend', 'dist');

function serveDist() {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(distDir, reqPath);

    if (!filePath.startsWith(distDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        const index = path.join(distDir, 'index.html');
        fs.readFile(index, (ie, data) => {
          if (ie) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(data);
        });
        return;
      }

      const stream = fs.createReadStream(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
        }[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      stream.pipe(res);
    });
  });

  server.listen(PORT, () => {
    console.log(`Serving ${distDir} at http://localhost:${PORT}`);
  });
}

if (fs.existsSync(distDir) && fs.statSync(distDir).isDirectory()) {
  serveDist();
} else {
  console.error(
    `No built frontend found at ${distDir}. Run 'npm run build:frontend' first.`,
  );
  process.exitCode = 2;
}
