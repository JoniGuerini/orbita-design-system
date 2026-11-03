#!/usr/bin/env node
/**
 * Exporta os tokens do Lume para Figma e outras ferramentas.
 *
 * Lê ds/tokens.js (gerado por `npm run tokens`) e escreve em dist/tokens/:
 *   figma-variables.json        coleções + estilos (o que o plugin lê)
 *   figma-variables.rest.json   corpo do POST /v1/files/:file_key/variables (API REST do Figma)
 *   figma-plugin/               plugin de desenvolvimento que cria ou atualiza tudo no arquivo aberto
 *   tokens.dtcg.json            W3C Design Tokens, temas em $extensions
 *   tokens.flat.json            nome → valor por tema, para JS/TS
 *   tokens.css                  cópia de ds/tokens.css
 *
 * Uso: npm run tokens:export
 */
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'tokens');

const { default: data } = await import(pathToFileURL(path.join(ROOT, 'ds', 'tokens.js')).href);
const { exportFiles, exportCounts } = await import(pathToFileURL(path.join(ROOT, 'ds', 'js', 'token-export.js')).href);

// Avisa se os JSON de tokens mudaram depois do último build.
const built = (await stat(path.join(ROOT, 'ds', 'tokens.js'))).mtimeMs;
const sources = (await readdir(path.join(ROOT, 'tokens'))).filter((f) => f.endsWith('.json'));
const stale = [];
for (const f of sources) if ((await stat(path.join(ROOT, 'tokens', f))).mtimeMs > built) stale.push(f);
if (stale.length) console.warn(`! ${stale.join(', ')} mudou depois do último build — rode npm run tokens antes para exportar a versão atual.`);

const css = await readFile(path.join(ROOT, 'ds', 'tokens.css'), 'utf8');
const files = exportFiles(data, css);

for (const file of files) {
  const target = path.join(OUT, file.path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, file.content);
  // os .json têm que ser JSON válido
  if (file.path.endsWith('.json')) JSON.parse(file.content);
}

const c = exportCounts(data);
const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;
console.log(`✓ tokens exportados → ${path.relative(ROOT, OUT)}/`);
for (const file of files) console.log(`  ${file.path.padEnd(28)} ${kb(file.content)}`);
console.log(`  Figma: ${c.variables} variáveis (${c.primitives} primitivas, ${c.semantic} semânticas em 2 modos, ${c.dimensions} dimensões), ${c.textStyles} estilos de texto, ${c.effectStyles} de sombra`);
console.log(`  DTCG e JSON plano: ${c.tokens} tokens`);
