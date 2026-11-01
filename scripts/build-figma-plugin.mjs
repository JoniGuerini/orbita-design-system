#!/usr/bin/env node
/**
 * Monta o plugin "Órbita para Figma" em dist/figma-plugin/:
 *   manifest.json   importe no Figma: Plugins → Desenvolvimento → Importar plugin do manifesto…
 *   code.js         figma/plugin/*.js em ordem + DATA (variáveis e estilos), ICONS e META
 *   ui.html         a janela do plugin
 *
 * Uso: npm run figma            (tudo)
 *      node scripts/build-figma-plugin.mjs --only 30-botao,40-selecao-multipla --out dist/figma-plugin-teste
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'figma', 'plugin');
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};

export async function buildFigmaPlugin({ only, out } = {}) {
  const outDir = path.resolve(ROOT, out ?? 'dist/figma-plugin');
  const { default: data } = await import(pathToFileURL(path.join(ROOT, 'ds', 'tokens.js')).href);
  const { figmaVariables } = await import(pathToFileURL(path.join(ROOT, 'ds', 'js', 'token-export.js')).href);

  // ícones: o módulo define um custom element; no Node basta um esboço
  globalThis.HTMLElement ??= class {};
  globalThis.customElements ??= { define() {}, get() {} };
  const iconsMod = await import(pathToFileURL(path.join(ROOT, 'ds', 'icons', 'icons.js')).href);
  // palavras-chave nas três línguas: a descrição do componente de ícone vai no idioma escolhido na janela
  const { ICON_KEYWORDS } = await import(pathToFileURL(path.join(ROOT, 'site', 'icon-keywords.js')).href);
  const icons = iconsMod.iconList.map((i) => ({ name: i.name, category: i.category, keywords: i.keywords.join(' '), keywordsEn: ICON_KEYWORDS[i.name]?.[0] ?? '', keywordsEs: ICON_KEYWORDS[i.name]?.[1] ?? '', body: i.body }));

  const changelog = await readFile(path.join(ROOT, 'site', 'changelog.js'), 'utf8');
  const version = /CURRENT_VERSION = '([^']+)'/.exec(changelog)?.[1] ?? '0.0.0';

  const meta = {
    version,
    generatedAt: data.generatedAt,
    iconCount: icons.length,
    iconCategories: iconsMod.iconCategories,
    // curvas de animação: o Figma não guarda curva como variável, então vão para o bloco Movimento
    easings: data.tokens.filter((t) => t.type === 'cubicBezier').map((t) => ({ name: t.name.split('.').pop(), css: t.css, points: t.css.match(/-?[\d.]+/g).map(Number) })),
  };

  let files = (await readdir(SRC)).filter((f) => f.endsWith('.js')).sort();
  if (only) {
    const keep = new Set(only.split(',').map((s) => s.trim().replace(/\.js$/, '')));
    files = files.filter((f) => f.startsWith('0') || f.startsWith('99-') || keep.has(f.replace(/\.js$/, '')));
  }
  const parts = [];
  for (const f of files) parts.push(`// ───── ${f} ─────\n${await readFile(path.join(SRC, f), 'utf8')}`);

  const header = `// Órbita para Figma ${version} — gerado por scripts/build-figma-plugin.mjs em ${data.generatedAt}. Não edite à mão: edite figma/plugin/.\n`;
  const code = `${header}var DATA = ${JSON.stringify(figmaVariables(data))};\nvar ICONS = ${JSON.stringify(icons)};\nvar META = ${JSON.stringify(meta)};\n\n${parts.join('\n\n')}`;

  // sintaxe válida e sem ?. / ?? fora de strings (o sandbox do Figma pode não aceitar)
  new vm.Script(code, { filename: 'code.js' });
  const risky = [];
  parts.join('\n').split('\n').forEach((line, i) => {
    if (/^\s*(\*|\/\*)/.test(line)) return;
    const bare = line.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '').replace(/\/\/.*$/, '');
    if (/\?\.|\?\?/.test(bare)) risky.push(`${i + 1}: ${line.trim().slice(0, 80)}`);
  });
  if (risky.length) throw new Error(`Use || e checagens explícitas em vez de ?. / ?? no código do plugin:\n  ${risky.join('\n  ')}`);

  const manifest = {
    name: 'Órbita para Figma',
    id: 'orbita-design-system',
    api: '1.0.0',
    main: 'code.js',
    ui: 'ui.html',
    editorType: ['figma'],
    documentAccess: 'dynamic-page',
    networkAccess: { allowedDomains: ['none'] },
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outDir, 'code.js'), code);
  await writeFile(path.join(outDir, 'ui.html'), await readFile(path.join(ROOT, 'figma', 'ui.html'), 'utf8'));
  return { outDir, files, bytes: Buffer.byteLength(code), icons: icons.length, version };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  buildFigmaPlugin({ only: arg('only'), out: arg('out') })
    .then((r) => {
      console.log(`✓ plugin ${r.version} → ${path.relative(ROOT, r.outDir)}/ (${(r.bytes / 1024).toFixed(0)} KB, ${r.files.length} arquivos, ${r.icons} ícones)`);
      console.log('  No Figma: Plugins → Desenvolvimento → Importar plugin do manifesto… → manifest.json');
    })
    .catch((err) => {
      console.error(`✗ ${err.message}`);
      process.exit(1);
    });
}
