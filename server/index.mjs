import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { extname, join, resolve, sep } from 'node:path';

const port = Number(process.env.PORT || 8080);
const browserDir = resolve(import.meta.dirname, '..', 'dist', 'noah-notice', 'browser');
const core = process.env.CORE_URL ? new URL(process.env.CORE_URL) : null;
if (core && !['http:', 'https:'].includes(core.protocol)) throw new Error('CORE_URL 須使用 http 或 https。');
const requestCore = core?.protocol === 'https:' ? httpsRequest : httpRequest;
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://localhost');
  if (/^\/(?:api\/(?:notices|apps)|oauth2|login)(?:\/|$)/.test(url.pathname)) {
    if (!core) {
      response.writeHead(503, { 'Cache-Control': 'no-store' });
      response.end();
      return;
    }
    const headers = { ...request.headers, host: core.host };
    delete headers.connection;
    const upstream = requestCore(core, {
      path: url.pathname + url.search,
      method: request.method,
      headers,
      timeout: 15000,
    }, (result) => {
      const resultHeaders = { ...result.headers };
      delete resultHeaders.connection;
      response.writeHead(result.statusCode, resultHeaders);
      result.on('error', () => response.destroy());
      result.pipe(response);
    });
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('error', () => {
      if (response.headersSent) {
        response.destroy();
        return;
      }
      response.writeHead(502, { 'Cache-Control': 'no-store' });
      response.end();
    });
    response.on('close', () => upstream.destroy());
    request.pipe(upstream);
    return;
  }
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const requested = resolve(browserDir, relative);
  const inside = requested === browserDir || requested.startsWith(`${browserDir}${sep}`);
  const file = inside && existsSync(requested) && statSync(requested).isFile()
    ? requested
    : join(browserDir, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('找不到。');
    return;
  }
  const isIndex = file === join(browserDir, 'index.html');
  response.writeHead(200, {
    'Content-Type': types[extname(file)] || 'application/octet-stream',
    'Cache-Control': isIndex ? 'no-store' : 'public, max-age=31536000',
  });
  createReadStream(file).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`公告在 http://0.0.0.0:${port}`);
});
