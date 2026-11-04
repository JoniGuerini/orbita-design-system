#!/usr/bin/env node
/**
 * Monta o site para publicar (Vercel) em dist/site/, só com o que o navegador usa:
 *   index.html, ds/, site/ e assets/favicon.svg
 *
 * O resto do repositório (CLAUDE.md, README, scripts/, figma/, tokens/) fica de fora.
 * Arquivo novo que o site carregue fora dessas pastas entra na lista PUBLIC.
 *
 * Também grava dist/site/version.json com a impressão digital do que vai para o ar (hash do
 * conteúdo): uma aba aberta compara com a dela e mostra o aviso de versão nova (site/update.js).
 *
 * Uso: npm run build (gera os tokens antes)
 */
import { createHash } from 'node:crypto';
import { cp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

// impressão digital: muda quando qualquer arquivo publicado muda, e só nesse caso
const files = (await readdir(OUT, { recursive: true, withFileTypes: true }))
  .filter((d) => d.isFile())
  .map((d) => path.join(d.parentPath ?? d.path, d.name))
  .sort();
const hash = createHash('sha256');
for (const file of files) hash.update(path.relative(OUT, file)).update(await readFile(file));
const changelog = await readFile(path.join(ROOT, 'site', 'changelog.js'), 'utf8');
const version = changelog.match(/CURRENT_VERSION = '([^']+)'/)?.[1] ?? null;
const build = hash.digest('hex').slice(0, 12);
await writeFile(path.join(OUT, 'version.json'), `${JSON.stringify({ build, version, builtAt: new Date().toISOString() })}\n`);

console.log(`✓ site: ${PUBLIC.join(', ')} → dist/site/ (versão ${version}, build ${build})`);
