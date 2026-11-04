#!/usr/bin/env node
/**
 * Servidor de desenvolvimento sem dependências.
 * Gera os tokens ao iniciar e de novo a cada mudança em tokens/*.json.
 *
 * Uso: node scripts/serve.mjs   (PORT=5173 por padrão)
 */
import http from 'node:http';
import { createReadStream, watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokens } from './build-tokens.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT ?? 5173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
};

await buildTokens();

let timer;
watch(path.join(ROOT, 'tokens'), () => {
  clearTimeout(timer);
  timer = setTimeout(() => buildTokens().catch((err) => console.error(`✗ ${err.message}`)), 80);
});

http
  .createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      // aviso de versão nova (site/update.js): no servidor local a impressão é fixa, então ele nunca aparece
      if (pathname === '/version.json') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end('{"build":"dev"}');
        return;
      }
      let file = path.join(ROOT, decodeURIComponent(pathname));
      if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      let info = await stat(file).catch(() => null);
      if (info?.isDirectory()) {
        file = path.join(file, 'index.html');
        info = await stat(file).catch(() => null);
      }
      if (!info) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — não encontrado');
        return;
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      createReadStream(file).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end(String(err));
    }
  })
  .listen(PORT, () => console.log(`\n  Lume DS → http://localhost:${PORT}\n`));
