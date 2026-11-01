#!/usr/bin/env node
/**
 * Monta o site para publicar (Vercel) em dist/site/, só com o que o navegador usa:
 *   index.html, ds/, site/ e assets/favicon.svg
 *
 * O resto do repositório (CLAUDE.md, README, scripts/, figma/, tokens/) fica de fora.
 * Arquivo novo que o site carregue fora dessas pastas entra na lista PUBLIC.
 *
 * Uso: npm run build (gera os tokens antes)
 */
import { cp, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'site');
const PUBLIC = ['index.html', 'ds', 'site', 'assets/favicon.svg'];

await rm(OUT, { recursive: true, force: true });
for (const item of PUBLIC) {
  await stat(path.join(ROOT, item)); // falha se o caminho sumiu, em vez de publicar sem ele
  await cp(path.join(ROOT, item), path.join(OUT, item), { recursive: true });
}
console.log(`✓ site: ${PUBLIC.join(', ')} → dist/site/`);
