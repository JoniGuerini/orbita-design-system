#!/usr/bin/env node
/**
 * Modo conector: o mesmo código do plugin, em partes que cabem numa execução do conector do Figma
 * (use_figma: até 50 mil caracteres, sem setPluginData, uma troca de página por vez).
 *
 *   - pluginData vira um registro guardado num texto da página "Órbita · registro" do arquivo
 *   - cada parte roda um pedaço: tokens, ícones, um arquivo de blocos, ou a arrumação de uma página
 *   - dependências entre arquivos (o conjunto do Botão, do Chip…) são buscadas no arquivo, não refeitas
 *
 * Uso: node scripts/build-figma-mcp.mjs   → dist/figma-mcp/NN-nome.js (só para validar; o plugin de verdade é o de npm run figma)
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'figma', 'plugin');
const OUT = path.join(ROOT, 'dist', 'figma-mcp');
// o limite de código por chamada do use_figma é 50.000 caracteres
const LIMIT = 50000;

/* ───────── Compactação segura: tira comentários e espaços, nunca mexe em strings ───────── */

function minify(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let last = '\n';
  const word = (c) => /[A-Za-z0-9_$]/.test(c);
  const regexAllowed = () => /[(,=:[!&|?{};+\-*%<>~^\n]/.test(last) || /\b(return|typeof|case|in|of)$/.test(out.trimEnd());
  let pendingSpace = false;
  let pendingNewline = false;
  const emit = (s) => {
    if (pendingNewline) { if (out && !out.endsWith('\n')) out += '\n'; }
    else if (pendingSpace && out && word(out[out.length - 1]) && word(s[0])) out += ' ';
    else if (pendingSpace && out && /[+\-]/.test(out[out.length - 1]) && /[+\-]/.test(s[0])) out += ' ';
    pendingSpace = false;
    pendingNewline = false;
    out += s;
    last = s[s.length - 1];
  };
  const stack = []; // template literal nesting
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2) + 2; pendingSpace = true; continue; }
    if (c === '\n') { pendingNewline = true; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { pendingSpace = true; i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      emit(src.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (c === '`' || (c === '}' && stack.length && stack[stack.length - 1] === 0)) {
      // template literal (ou volta de um ${…})
      if (c === '}') stack.pop();
      let j = i + 1;
      let piece = c;
      for (;;) {
        if (j >= n) throw new Error('template sem fim');
        const ch = src[j];
        if (ch === '\\') { piece += ch + src[j + 1]; j += 2; continue; }
        if (ch === '`') { piece += ch; j++; break; }
        if (ch === '$' && src[j + 1] === '{') { piece += '${'; j += 2; stack.push(0); break; }
        piece += ch;
        j++;
      }
      emit(piece);
      i = j;
      continue;
    }
    if (c === '{' && stack.length) { stack[stack.length - 1]++; emit(c); i++; continue; }
    if (c === '}' && stack.length) { stack[stack.length - 1]--; emit(c); i++; continue; }
    if (c === '/' && regexAllowed()) {
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') { j += 2; continue; }
        if (ch === '[') inClass = true;
        else if (ch === ']') inClass = false;
        else if (ch === '/' && !inClass) break;
        j++;
      }
      j++;
      while (j < n && /[gimsuy]/.test(src[j])) j++;
      emit(src.slice(i, j));
      i = j;
      continue;
    }
    if (word(c)) {
      let j = i;
      while (j < n && word(src[j])) j++;
      emit(src.slice(i, j));
      i = j;
      continue;
    }
    emit(c);
    i++;
  }
  return out;
}

/* ───────── Transformações ───────── */

const transformPD = (code) => code.replace(/([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.(set|get)PluginData\(/g, '__$2PD($1, ');

/** Recorta uma função pelo nome (do "function nome(" até a chave que fecha). */
function cutFunction(code, name) {
  const start = code.search(new RegExp(`(async\\s+)?function\\s+${name}\\s*\\(`));
  if (start < 0) return { code, fn: '' };
  let i = code.indexOf('{', start);
  let depth = 0;
  for (; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (depth === 0) break; }
  }
  return { code: code.slice(0, start) + code.slice(i + 1), fn: code.slice(start, i + 1) };
}

const PRELUDE = String.raw`
var __ORBITA_TEST__ = true;
var __PD = {};
var __REG = 'Órbita · registro';
async function __regText() {
  var p = figma.root.children.find(function (x) { return x.name === __REG; });
  if (!p) return null;
  await p.loadAsync();
  return { page: p, text: p.findOne(function (n) { return n.type === 'TEXT' && n.name === 'registro'; }) };
}
async function __loadPD() {
  var r = await __regText();
  if (r && r.text && r.text.characters) __PD = JSON.parse(r.text.characters);
}
async function __savePD(prune) {
  if (prune) {
    for (var id of Object.keys(__PD)) {
      var node = await figma.getNodeByIdAsync(id);
      if (!node || node.removed) delete __PD[id];
    }
  }
  var r = await __regText();
  var page = r ? r.page : figma.createPage();
  page.name = __REG;
  await page.loadAsync();
  var t = r && r.text;
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  if (!t) { t = figma.createText(); page.appendChild(t); t.fontName = { family: 'Inter', style: 'Regular' }; t.name = 'registro'; }
  t.characters = JSON.stringify(__PD);
}
function __setPD(n, k, v) { if (!n || !n.id) return; var e = __PD[n.id] || (__PD[n.id] = {}); e[k] = String(v); }
function __getPD(n, k) { var e = n && __PD[n.id]; return e && e[k] !== undefined ? e[k] : ''; }
async function loadTokensFromFile() {
  var cols = await figma.variables.getLocalVariableCollectionsAsync();
  var vars = await figma.variables.getLocalVariablesAsync();
  var byId = {};
  cols.forEach(function (c) { byId[c.id] = c; ORB.collections[c.name] = c; });
  ['Primitivas', 'Dimensões', 'Semânticos'].forEach(function (name) {
    vars.forEach(function (v) { var c = byId[v.variableCollectionId]; if (c && c.name === name) ORB.vars[v.name] = v; });
  });
  var sem = ORB.collections['Semânticos'];
  if (sem) sem.modes.forEach(function (m) { ORB.modes[m.name] = m.modeId; });
  (await figma.getLocalTextStylesAsync()).forEach(function (s) { ORB.textStyles[s.name] = s; });
  (await figma.getLocalEffectStylesAsync()).forEach(function (s) { ORB.effectStyles[s.name] = s; });
}
var __PAGES = ['Órbita · Fundamentos', 'Órbita · Ícones', 'Órbita · Componentes'];
`;

/** Dependências entre arquivos: no conector, buscam o que outra parte já criou (sem redesenhar). */
const STUBS = String.raw`
function __need(key, type, who) { var n = live(key, type); if (!n) throw new Error(who + ' ainda não existe no arquivo — rode a parte dele antes'); return n; }
async function buttonSet() { return __need('set/botao', 'COMPONENT_SET', 'Botão'); }
async function msOptionSet() { return __need('set/ms-opcao', 'COMPONENT_SET', 'Seleção/Opção'); }
async function msMenu() { return __need('cmp/ms-menu', 'COMPONENT', 'Seleção/Menu múltiplo'); }
async function msTriggerSet() { return __need('set/ms-gatilho', 'COMPONENT_SET', 'Seleção/Gatilho'); }
ORB.lib = ORB.lib || {};
ORB.lib.chipSet = async function () { return __need('set/chip', 'COMPONENT_SET', 'Chip'); };
ORB.lib.badgeSet = async function () { return __need('set/badge', 'COMPONENT_SET', 'Badge'); };
ORB.lib.iconButtonSet = async function () { return __need('set/botao-icone', 'COMPONENT_SET', 'Botão de ícone'); };
ORB.lib.removableChipSet = async function () { return __need('set/chip-removivel', 'COMPONENT_SET', 'Chip removível'); };
ORB.lib.inlineSet = async function () { return __need('set/acao-inline', 'COMPONENT_SET', 'Ação inline'); };
ORB.lib.fieldSet = async function () { return __need('set/campo', 'COMPONENT_SET', 'Campo de texto'); };
ORB.lib.formFieldSet = async function () { return __need('set/campo-rotulo', 'COMPONENT_SET', 'Campo com rótulo'); };
ORB.lib.selectTriggerSet = async function () { return __need('set/selecao-gatilho', 'COMPONENT_SET', 'Seleção/Gatilho'); };
ORB.lib.checkboxSet = async function () { return __need('set/checkbox', 'COMPONENT_SET', 'Checkbox'); };
`;

const driverTokens = `
await __loadPD();
await importTokens();
await loadFonts();
await __savePD(false);
return { parte: 'tokens', variaveis: Object.keys(ORB.vars).length, estilosTexto: Object.keys(ORB.textStyles).length, estilosEfeito: Object.keys(ORB.effectStyles).length, avisos: ORB.report.avisos };`;

const driverIcons = `
await __loadPD();
await loadTokensFromFile();
await loadRegistry(__PAGES);
var page = await ensurePage('Órbita · Ícones');
await figma.setCurrentPageAsync(page);
var made = ICONS.map(function (i) { return iconComponent(i.name).id; });
await __savePD(false);
return { parte: 'ícones', criados: made.length, primeiro: made[0], ultimo: made[made.length - 1], avisos: ORB.report.avisos };`;

const driverBlocks = (pageId) => `
await __loadPD();
await loadTokensFromFile();
await loadFonts();
await loadRegistry(__PAGES);
await ensurePage('Órbita · Ícones');
var page = await ensurePage(${JSON.stringify(`Órbita · ${pageId}`)});
await figma.setCurrentPageAsync(page);
var right = page.children.reduce(function (m, n) { return Math.max(m, n.x + n.width); }, 0);
var out = [];
for (var def of BLOCKS.filter(function (b) { return b.page === ${JSON.stringify(pageId)}; })) {
  var content = await def.build({ page: page });
  var node = await docBlock(def, content);
  page.appendChild(node);
  node.x = right + 400;
  node.y = 0;
  right = node.x + node.width;
  out.push({ id: node.id, titulo: def.title, w: Math.round(node.width), h: Math.round(node.height) });
}
await __savePD(false);
return { parte: 'blocos', pagina: page.name, blocos: out, relatorio: ORB.report };`;

const driverArrange = (pageId) => `
await __loadPD();
await loadTokensFromFile();
await loadFonts();
await loadRegistry(__PAGES);
var page = await ensurePage(${JSON.stringify(`Órbita · ${pageId}`)});
await figma.setCurrentPageAsync(page);
pageBackground(page);
var built = page.children.filter(function (n) { return __getPD(n, KEY).indexOf('block/') === 0; }).map(function (n) {
  return { def: { row: __getPD(n, 'orbita-row'), order: Number(__getPD(n, 'orbita-order')) || 0 }, node: n };
});
await arrange(page, ${JSON.stringify(pageId)}, built);
await __savePD(true);
return { parte: 'arrumação', pagina: page.name, blocos: built.map(function (b) { return { id: b.node.id, nome: b.node.name, x: b.node.x, y: b.node.y }; }) };`;

/* ───────── Montagem ───────── */

const { default: data } = await import(pathToFileURL(path.join(ROOT, 'ds', 'tokens.js')).href);
const { figmaVariables } = await import(pathToFileURL(path.join(ROOT, 'ds', 'js', 'token-export.js')).href);
globalThis.HTMLElement ??= class {};
globalThis.customElements ??= { define() {}, get() {} };
const iconsMod = await import(pathToFileURL(path.join(ROOT, 'ds', 'icons', 'icons.js')).href);
const icons = iconsMod.iconList.map((i) => ({ name: i.name, category: i.category, keywords: i.keywords.join(' '), body: i.body }));
const changelog = await readFile(path.join(ROOT, 'site', 'changelog.js'), 'utf8');
const version = /CURRENT_VERSION = '([^']+)'/.exec(changelog)?.[1] ?? '0.0.0';
const meta = {
  version,
  generatedAt: data.generatedAt,
  iconCount: icons.length,
  iconCategories: iconsMod.iconCategories,
  easings: data.tokens.filter((t) => t.type === 'cubicBezier').map((t) => ({ name: t.name.split('.').pop(), css: t.css, points: t.css.match(/-?[\d.]+/g).map(Number) })),
  pageIntro: { 'Órbita · Componentes': 'Cada bloco é um componente: o conjunto de variantes, exemplos montados com instâncias e o mesmo exemplo nos modos Claro e Escuro. Cores, medidas e textos vêm das variáveis e dos estilos do arquivo.' },
};
const vars = figmaVariables(data);
const col = (name) => vars.collections.find((c) => c.name === name);

const read = async (f) => transformPD(await readFile(path.join(SRC, `${f}.js`), 'utf8'));
// ajudantes pequenos do 40 que outros arquivos usam (desenho puro, sem componente): vão inteiros
const ms = await read('40-selecao-multipla');
const HELPERS = ['checkBox', 'msSearch'].map((name) => cutFunction(ms, name).fn).join('\n');
let runtime = await read('00-runtime');
const { code: runtimeNoImport } = cutFunction(runtime, 'importTokens');
// para os tokens basta o começo do núcleo (estado, utilidades, importação e fontes)
const runtimeTokens = runtime.slice(0, runtime.indexOf('/* ───────── Variáveis nos nós'));
const main = cutFunction(await read('99-main'), 'main').code.replace(/\/\* ─+ Entrada[\s\S]*$/, '');

// dados enxutos para os blocos (os valores ficam no arquivo; aqui só nomes e o que os blocos leem)
const slim = (c) => ({ name: c.name, modes: c.modes, variables: c.variables.map((v) => ({ name: v.name, values: c.name === 'Semânticos' ? {} : v.values })) });
const dataSlim = { collections: [slim(col('Semânticos')), slim(col('Dimensões'))], textStyles: vars.textStyles.map((t) => ({ name: t.name, fontFamily: t.fontFamily, fontStyle: t.fontStyle, fontSize: t.fontSize, lineHeight: t.lineHeight })), effectStyles: [] };
const neutral975 = col('Primitivas').variables.find((v) => v.name === 'color/neutral/975');
const dataArrange = { collections: [{ name: 'Primitivas', modes: col('Primitivas').modes, variables: [{ name: neutral975.name, values: neutral975.values }] }], textStyles: [], effectStyles: [] };
const iconMeta = icons.map(({ body, ...rest }) => ({ ...rest, body: '' }));

const head = (d, ic) => `var DATA = ${JSON.stringify(d)};\nvar ICONS = ${JSON.stringify(ic)};\nvar META = ${JSON.stringify(meta)};\n`;

const files = (await readdir(SRC)).filter((f) => /^\d\d-/.test(f) && !/^(00|99)-/.test(f)).map((f) => f.replace(/\.js$/, ''));
const pageOf = { '10-foundations': 'Fundamentos', '11-movimento-layout': 'Fundamentos', '20-icons': 'Ícones' };

const chunks = [];
const half = Math.ceil(icons.length / 2);
// tokens compactos: [nome, valor…] — o código CSS sai do nome; as primitivas vão sem descrição (ficam escondidas da publicação)
const scopesList = [];
const sc = (arr) => { const k = JSON.stringify(arr); let i = scopesList.indexOf(k); if (i < 0) { scopesList.push(k); i = scopesList.length - 1; } return i; };
const val = (v) => (v && typeof v === 'object' ? `${v.collection === 'Primitivas' ? 'p' : 's'}:${v.alias}` : v);
const packed = {
  p: col('Primitivas').variables.map((v) => [v.name, v.values.Valor]),
  s: col('Semânticos').variables.map((v) => [v.name, val(v.values.Escuro), val(v.values.Claro), sc(v.scopes), v.description || '']),
  d: col('Dimensões').variables.map((v) => [v.name, v.values.Valor, sc(v.scopes), v.description || '']),
};
const UNPACK = String.raw`
var __S = __SCOPES.map(function (x) { return JSON.parse(x); });
var __code = function (n) { return 'var(--ds-' + n.replace(/\//g, '-') + ')'; };
var __ref = function (v) { if (typeof v !== 'string' || v.indexOf(':') < 0 || v.charAt(0) === '#') return v; return { alias: v.slice(2), collection: v.charAt(0) === 'p' ? 'Primitivas' : 'Semânticos' }; };
DATA.collections = [];
if (__PACK.p) DATA.collections.push({ name: 'Primitivas', modes: ['Valor'], hiddenFromPublishing: true, variables: __PACK.p.map(function (r) { return { name: r[0], type: 'COLOR', description: '', scopes: [], hiddenFromPublishing: true, codeSyntax: __code(r[0]), values: { Valor: r[1] } }; }) });
if (__PACK.s) DATA.collections.push({ name: 'Semânticos', modes: ['Escuro', 'Claro'], variables: __PACK.s.map(function (r) { return { name: r[0], type: 'COLOR', description: r[4], scopes: __S[r[3]], codeSyntax: __code(r[0]), values: { Escuro: __ref(r[1]), Claro: __ref(r[2]) } }; }) });
if (__PACK.d) DATA.collections.push({ name: 'Dimensões', modes: ['Valor'], variables: __PACK.d.map(function (r) { return { name: r[0], type: 'FLOAT', description: r[3], scopes: __S[r[2]], codeSyntax: __code(r[0]), values: { Valor: r[1] } }; }) });
`;
const tokenChunk = (pack, styles) => head({ collections: [], textStyles: styles ? vars.textStyles : [], effectStyles: styles ? vars.effectStyles : [] }, []) + `var __PACK = ${JSON.stringify(pack)};\nvar __SCOPES = ${JSON.stringify(scopesList)};\n` + UNPACK + PRELUDE + runtimeTokens + driverTokens;
chunks.push(['01-tokens-variaveis', tokenChunk(packed, false)]);
chunks.push(['03-tokens-estilos', tokenChunk({}, true)]);
chunks.push(['04-icones-a', head(dataArrange, icons.slice(0, half)) + PRELUDE + runtimeNoImport + driverIcons]);
chunks.push(['05-icones-b', head(dataArrange, icons.slice(half)) + PRELUDE + runtimeNoImport + driverIcons]);
let n = 6;
for (const f of files) {
  const pageId = pageOf[f] ?? 'Componentes';
  const body = await read(f);
  chunks.push([`${String(n++).padStart(2, '0')}-${f.replace(/^\d\d-/, '')}`, head(pageOf[f] === 'Fundamentos' ? { ...dataSlim, collections: [...dataSlim.collections] } : { collections: [], textStyles: [], effectStyles: [] }, f === '20-icons' ? iconMeta : []) + PRELUDE + runtimeNoImport + STUBS + HELPERS + body + driverBlocks(pageId)]);
}
for (const pageId of ['Ícones', 'Fundamentos', 'Componentes']) {
  chunks.push([`${String(n++).padStart(2, '0')}-arrumar-${pageId.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}`, head(dataArrange, []) + PRELUDE + runtimeNoImport + main + driverArrange(pageId)]);
}

/* Versão enxuta: o núcleo vai uma vez para o arquivo (texto "código" na página de registro) e cada parte
   junta núcleo + pedaço num eval só (o conector roda em modo estrito: funções de um eval não vazam). */
const LIB = PRELUDE + runtimeNoImport + STUBS + HELPERS + main;
const LIB_GET = String.raw`
var __libPage = figma.root.children.find(function (x) { return x.name === 'Órbita · registro'; });
if (!__libPage) throw new Error('Rode antes a parte que guarda o código');
await __libPage.loadAsync();
var __lib = __libPage.findOne(function (n) { return n.type === 'TEXT' && n.name === 'código'; });
if (!__lib) throw new Error('Rode antes a parte que guarda o código');
`;
const slimChunks = [];
const libMin = minify(LIB);
slimChunks.push(['00-guardar-codigo', minify(String.raw`
var __p = figma.root.children.find(function (x) { return x.name === 'Órbita · registro'; }) || figma.createPage();
__p.name = 'Órbita · registro';
await __p.loadAsync();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
var __t = __p.findOne(function (n) { return n.type === 'TEXT' && n.name === 'código'; });
if (!__t) { __t = figma.createText(); __p.appendChild(__t); __t.fontName = { family: 'Inter', style: 'Regular' }; __t.name = 'código'; __t.x = 0; __t.y = 400; }
`) + `
__t.characters = ${JSON.stringify(libMin)};
return { codigo: __t.characters.length, no: __t.id };`]);
for (const [name, code] of chunks) {
  if (name.includes('tokens')) { slimChunks.push([name, minify(code)]); continue; }
  // separa cabeçalho (DATA/ICONS/META) e o que vem depois do núcleo
  const headEnd = code.indexOf(PRELUDE);
  const headPart = code.slice(0, headEnd);
  let rest = code.slice(headEnd + PRELUDE.length);
  for (const piece of [runtimeNoImport, STUBS, HELPERS, main]) if (rest.startsWith(piece)) rest = rest.slice(piece.length);
  const body = minify(rest);
  const NL = '\\n'; // "\n" escrito dentro da string do código gerado
  slimChunks.push([name, `${minify(LIB_GET)}\nreturn await eval('(async function () {${NL}' + ${JSON.stringify(minify(headPart))} + '${NL}' + __lib.characters + '${NL}' + ${JSON.stringify(body)} + '${NL}})()');`]);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const report = [];
for (const [name, code] of chunks) {
  const small = minify(code);
  // precisa ser JS válido como corpo de função assíncrona (o conector embrulha assim)
  new vm.Script(`(async function () {\n${small}\n})`, { filename: `${name}.js` });
  // a versão completa leva o núcleo junto; a que passar do limite só existe na enxuta
  if (small.length > LIMIT) { report.push(`${name.padEnd(28)} ${String(small.length).padStart(6)} caracteres — grande demais, use enxuto/${name}.js`); continue; }
  await writeFile(path.join(OUT, `${name}.js`), small);
  report.push(`${name.padEnd(28)} ${String(small.length).padStart(6)} caracteres`);
}
const SLIM = path.join(OUT, 'enxuto');
await mkdir(SLIM, { recursive: true });
const slimReport = [];
for (const [name, code] of slimChunks) {
  new vm.Script(`(async function () {\n${code}\n})`, { filename: `${name}.js` });
  if (code.length > LIMIT) throw new Error(`enxuto/${name}: ${code.length} caracteres`);
  await writeFile(path.join(SLIM, `${name}.js`), code);
  slimReport.push(`${name.padEnd(28)} ${String(code.length).padStart(6)}`);
}
console.log(`✓ ${chunks.length} partes para o conector → ${path.relative(ROOT, OUT)}/\n  ${report.join('\n  ')}`);
console.log(`✓ versão enxuta (núcleo guardado no arquivo) → ${path.relative(ROOT, SLIM)}/ · ${slimChunks.reduce((a, c) => a + c[1].length, 0)} caracteres no total\n  ${slimReport.join('\n  ')}`);
