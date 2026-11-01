/**
 * Órbita — exportação dos tokens para Figma e outras ferramentas.
 *
 * Funções puras: recebem os dados de ds/tokens.js (o mesmo objeto, no navegador ou no Node)
 * e devolvem cada formato pronto para salvar. Nada aqui acessa rede ou DOM.
 *
 *   import data from './ds/tokens.js';
 *   import { figmaVariables, figmaRestPayload, figmaPlugin, toDTCG, toFlat, exportFiles } from './ds/js/token-export.js';
 *
 *   figmaVariables(data)    → coleções + estilos num formato simples (o que o plugin lê)
 *   figmaRestPayload(data)  → corpo do POST /v1/files/:file_key/variables da API REST do Figma
 *   figmaPlugin(data)       → { manifest, code } de um plugin de desenvolvimento que cria/atualiza tudo
 *   toDTCG(data)            → W3C Design Tokens (DTCG), temas em $extensions
 *   toFlat(data)            → JSON plano, nome → valor (por tema), fácil de usar em JS/TS
 *   exportFiles(data, css)  → [{ path, content }] com todos os arquivos de dist/tokens/
 */

export const COLLECTIONS = { primitives: 'Primitivas', semantic: 'Semânticos', dimensions: 'Dimensões' };
export const MODES = { dark: 'Escuro', light: 'Claro' };
const VALUE_MODE = 'Valor';
const EXT = 'com.orbita';

/* ───────── Utilidades ───────── */

const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

/** color.bg.canvas → color/bg/canvas */
export const figmaName = (name) => name.replaceAll('.', '/');

/** #rrggbb ou #rrggbbaa → { r, g, b, a } de 0 a 1, como o Figma espera. */
export function hexToRgba(hex) {
  let h = String(hex).replace('#', '');
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => round(parseInt(h.slice(i, i + 2), 16) / 255));
  const a = h.length === 8 ? round(parseInt(h.slice(6, 8), 16) / 255) : 1;
  return { r, g, b, a };
}

const toHex2 = (n) => Math.round(n).toString(16).padStart(2, '0');
const rgbToHex = (r, g, b, a = 1) => `#${toHex2(r)}${toHex2(g)}${toHex2(b)}${a < 1 ? toHex2(a * 255) : ''}`;

/** "{color.neutral.925}" → "color.neutral.925"; transparência e valores diretos → null */
const plainRef = (ref) => /^\{([^}]+)\}$/.exec(String(ref ?? ''))?.[1] ?? null;

/** Divide por vírgulas fora de parênteses. */
function splitTop(str) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of String(str)) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const fontFamilies = (css) => splitTop(css).map((f) => f.replace(/^["']|["']$/g, ''));

/** "0 2px 4px -1px rgb(0 0 0 / 0.28), …" → camadas */
export function parseShadow(css) {
  return splitTop(css).map((layer) => {
    const color = /rgba?\(([^)]+)\)/.exec(layer);
    const nums = layer.replace(/rgba?\([^)]+\)/, '').trim().split(/\s+/).map((v) => parseFloat(v) || 0);
    const [x = 0, y = 0, blur = 0, spread = 0] = nums;
    let rgba = { r: 0, g: 0, b: 0, a: 1 };
    if (color) {
      const parts = color[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      const [r, g, b, a = 1] = parts;
      rgba = { r: round(r / 255), g: round(g / 255), b: round(b / 255), a: round(a) };
    }
    return { x, y, blur, spread, color: rgba, hex: rgbToHex(rgba.r * 255, rgba.g * 255, rgba.b * 255, rgba.a) };
  });
}

const FIGMA_FONT_STYLE = { regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold', bold: 'Bold', heavy: 'Extra Bold' };

/* ───────── Modelo comum (uma leitura, vários formatos) ───────── */

function colorScopes(name) {
  const [, group, ...rest] = name.split('.');
  const leaf = rest.at(-1) ?? '';
  if (group === 'bg') return ['FRAME_FILL', 'SHAPE_FILL'];
  if (group === 'fg') return ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  if (group === 'border') return ['STROKE_COLOR'];
  if (group === 'chart') return ['SHAPE_FILL', 'STROKE_COLOR'];
  if (leaf === 'fg' || leaf === 'on-solid') return ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  if (leaf === 'border') return ['STROKE_COLOR'];
  return ['ALL_FILLS', 'STROKE_COLOR'];
}

function dimensionScopes(name) {
  const group = name.split('.')[0];
  return (
    {
      space: ['GAP', 'WIDTH_HEIGHT'],
      radius: ['CORNER_RADIUS'],
      'border-width': ['STROKE_FLOAT'],
      'focus-ring': ['STROKE_FLOAT'],
      size: ['WIDTH_HEIGHT'],
      layout: ['WIDTH_HEIGHT', 'GAP'],
      breakpoint: ['WIDTH_HEIGHT'],
      blur: ['EFFECT_FLOAT'],
      opacity: ['OPACITY'],
    }[group] ?? []
  );
}

/**
 * Lê os dados uma vez e monta: primitivas, semânticas (com alias ou RGBA), dimensões,
 * estilos de texto e estilos de sombra (um por tema — estilos do Figma não têm modos).
 */
export function tokenModel(data) {
  const { palettes, tokens } = data;
  const primitives = [
    ...palettes.flatMap((p) =>
      p.steps.map((s) => ({
        name: `color.${p.name}.${s.step}`,
        type: 'COLOR',
        value: s.hex,
        cssVar: s.cssVar,
        description: `${p.label} ${s.step} · ${s.oklch}`,
      })),
    ),
    { name: 'color.white', type: 'COLOR', value: '#ffffff', cssVar: '--ds-color-white', description: 'Branco' },
    { name: 'color.black', type: 'COLOR', value: '#000000', cssVar: '--ds-color-black', description: 'Preto' },
  ];
  const primNames = new Set(primitives.map((p) => p.name));
  const semNames = new Set(tokens.filter((t) => t.type === 'color').map((t) => t.name));

  const semantic = tokens
    .filter((t) => t.type === 'color')
    .map((t) => {
      const values = {};
      for (const mode of ['dark', 'light']) {
        const { ref, value } = t.modes[mode];
        const target = plainRef(ref);
        if (target && primNames.has(target)) values[mode] = { alias: target, collection: 'primitives', hex: value };
        else if (target && semNames.has(target)) values[mode] = { alias: target, collection: 'semantic', hex: value };
        else values[mode] = { hex: value, ref };
      }
      return { name: t.name, type: 'COLOR', cssVar: t.cssVar, description: t.description ?? '', scopes: colorScopes(t.name), values };
    });

  const dimensions = tokens
    .filter((t) => t.type === 'dimension' || t.type === 'duration' || t.name.startsWith('opacity.'))
    .map((t) => {
      const isOpacity = t.name.startsWith('opacity.');
      // durações viram número em ms: servem de referência no protótipo e no Dev Mode (sem escopo de propriedade)
      const isDuration = t.type === 'duration';
      return {
        name: t.name,
        type: 'FLOAT',
        cssVar: t.cssVar,
        // opacidade no Figma vai de 0 a 100
        value: isOpacity ? round(Number(t.css) * 100, 2) : isDuration ? parseFloat(t.css) : t.px,
        unit: isOpacity ? '%' : isDuration ? 'ms' : 'px',
        css: t.css,
        description: t.description ?? (isOpacity ? `Opacidade ${t.css}` : isDuration ? `Duração de ${t.css}` : t.css === `${t.px}px` ? '' : `${t.css} no CSS`),
        scopes: dimensionScopes(t.name),
      };
    });

  const families = Object.fromEntries(tokens.filter((t) => t.type === 'fontFamily').map((t) => [t.name.split('.').at(-1), fontFamilies(t.css)]));
  const weights = Object.fromEntries(tokens.filter((t) => t.type === 'fontWeight').map((t) => [t.name.split('.').at(-1), Number(t.css)]));

  const textStyles = tokens
    .filter((t) => t.type === 'typography')
    .map((t) => ({
      name: t.name,
      cssVar: t.cssVar,
      description: t.usage ?? '',
      fontFamily: families[t.family ?? 'sans'][0],
      fontStyle: FIGMA_FONT_STYLE[t.weight] ?? 'Regular',
      fontWeight: weights[t.weight] ?? 400,
      fontSize: t.size,
      lineHeight: t.line,
      letterSpacing: round(parseFloat(t.tracking || '0') * 100, 2),
      textCase: t.transform === 'uppercase' ? 'UPPER' : 'ORIGINAL',
      tracking: t.tracking ?? '0',
    }));

  const effectStyles = tokens
    .filter((t) => t.type === 'shadow')
    .flatMap((t) =>
      ['dark', 'light'].map((mode) => ({
        name: `${t.name}.${mode}`,
        token: t.name,
        mode,
        cssVar: t.cssVar,
        description: `Sombra ${t.name.split('.').at(-1)} · tema ${MODES[mode].toLowerCase()}`,
        layers: parseShadow(t.modes[mode]),
        css: t.modes[mode],
      })),
    );

  return { primitives, semantic, dimensions, textStyles, effectStyles };
}

/* ───────── Figma: formato simples (o que o plugin lê) ───────── */

export function figmaVariables(data) {
  const m = tokenModel(data);
  const ref = (v) =>
    v.alias ? { alias: figmaName(v.alias), collection: v.collection === 'primitives' ? COLLECTIONS.primitives : COLLECTIONS.semantic } : v.hex;
  return {
    $schema: 'orbita/figma-variables@1',
    name: 'Órbita',
    generatedAt: data.generatedAt,
    collections: [
      {
        name: COLLECTIONS.primitives,
        modes: [VALUE_MODE],
        hiddenFromPublishing: true,
        variables: m.primitives.map((p) => ({
          name: figmaName(p.name),
          type: 'COLOR',
          description: p.description,
          scopes: [],
          hiddenFromPublishing: true,
          codeSyntax: `var(${p.cssVar})`,
          values: { [VALUE_MODE]: p.value },
        })),
      },
      {
        name: COLLECTIONS.semantic,
        modes: [MODES.dark, MODES.light],
        variables: m.semantic.map((s) => ({
          name: figmaName(s.name),
          type: 'COLOR',
          description: s.description,
          scopes: s.scopes,
          codeSyntax: `var(${s.cssVar})`,
          values: { [MODES.dark]: ref(s.values.dark), [MODES.light]: ref(s.values.light) },
        })),
      },
      {
        name: COLLECTIONS.dimensions,
        modes: [VALUE_MODE],
        variables: m.dimensions.map((d) => ({
          name: figmaName(d.name),
          type: 'FLOAT',
          description: d.description,
          scopes: d.scopes,
          codeSyntax: `var(${d.cssVar})`,
          values: { [VALUE_MODE]: d.value },
        })),
      },
    ],
    textStyles: m.textStyles.map((t) => ({
      name: figmaName(t.name),
      description: t.description,
      fontFamily: t.fontFamily,
      fontStyle: t.fontStyle,
      fontSize: t.fontSize,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      textCase: t.textCase,
    })),
    effectStyles: m.effectStyles.map((e) => ({
      name: `${MODES[e.mode]}/${figmaName(e.token)}`,
      description: e.description,
      effects: e.layers.map((l) => ({ type: 'DROP_SHADOW', color: l.color, x: l.x, y: l.y, blur: l.blur, spread: l.spread })),
    })),
  };
}

/* ───────── Figma: API REST (POST /v1/files/:file_key/variables) ───────── */

const tempId = (prefix, name) => `${prefix}:${name}`;

/**
 * Corpo para criar as três coleções de uma vez num arquivo novo.
 * Cria (CREATE) — rodar duas vezes no mesmo arquivo duplica. Para manter em dia, use o plugin.
 */
export function figmaRestPayload(data) {
  const simple = figmaVariables(data);
  const colId = { [COLLECTIONS.primitives]: 'col:primitivas', [COLLECTIONS.semantic]: 'col:semanticos', [COLLECTIONS.dimensions]: 'col:dimensoes' };
  const modeId = (collection, mode) => tempId('mode', `${colId[collection].slice(4)}/${mode}`);

  const variableCollections = [];
  const variableModes = [];
  const variables = [];
  const variableModeValues = [];

  for (const c of simple.collections) {
    const id = colId[c.name];
    variableCollections.push({ action: 'CREATE', id, name: c.name, initialModeId: modeId(c.name, c.modes[0]), ...(c.hiddenFromPublishing ? { hiddenFromPublishing: true } : {}) });
    c.modes.forEach((mode, i) => variableModes.push({ action: i === 0 ? 'UPDATE' : 'CREATE', id: modeId(c.name, mode), name: mode, variableCollectionId: id }));
    for (const v of c.variables) {
      const vid = tempId('var', `${colId[c.name].slice(4)}/${v.name}`);
      variables.push({
        action: 'CREATE',
        id: vid,
        name: v.name,
        variableCollectionId: id,
        resolvedType: v.type,
        description: v.description,
        scopes: v.scopes,
        ...(v.hiddenFromPublishing ? { hiddenFromPublishing: true } : {}),
        codeSyntax: { WEB: v.codeSyntax },
      });
      for (const mode of c.modes) {
        const raw = v.values[mode];
        const value =
          raw && typeof raw === 'object'
            ? { type: 'VARIABLE_ALIAS', id: tempId('var', `${colId[raw.collection].slice(4)}/${raw.alias}`) }
            : v.type === 'COLOR'
              ? hexToRgba(raw)
              : raw;
        variableModeValues.push({ variableId: vid, modeId: modeId(c.name, mode), value });
      }
    }
  }
  return { variableCollections, variableModes, variables, variableModeValues };
}

/* ───────── Figma: plugin de desenvolvimento (qualquer plano) ───────── */

const PLUGIN_RUNTIME = String.raw`
// Órbita → Figma. Cria ou atualiza as variáveis e os estilos pelo nome; pode rodar quantas vezes quiser.
function hexToRgba(hex) {
  var h = String(hex).replace('#', '');
  var n = function (i) { return parseInt(h.slice(i, i + 2), 16) / 255; };
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
}

// o plugin “Órbita para Figma” pode ter criado tudo em inglês ou espanhol: acha a coleção, o modo e a sombra em qualquer idioma
var OTHER_NAMES = { 'Primitivas': ['Primitives'], 'Semânticos': ['Semantic'], 'Dimensões': ['Dimensions', 'Dimensiones'], 'Escuro': ['Dark', 'Oscuro'], 'Claro': ['Light'], 'Valor': ['Value'] };
function same(found, name) { return found === name || (OTHER_NAMES[name] || []).indexOf(found) >= 0; }
function sameStyle(found, name) {
  var a = found.split('/');
  var b = name.split('/');
  return a.slice(1).join('/') === b.slice(1).join('/') && same(a[0], b[0]);
}

async function run() {
  var report = { criadas: 0, atualizadas: 0, estilos: 0, fontes: [] };
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var allVars = await figma.variables.getLocalVariablesAsync();
  var byName = {};

  for (var c of DATA.collections) {
    var col = collections.find(function (x) { return same(x.name, c.name); }) || figma.variables.createVariableCollection(c.name);
    var modeIds = {};
    c.modes.forEach(function (m, i) {
      var mode = col.modes.find(function (x) { return same(x.name, m); });
      if (!mode && i === 0 && !c.modes.some(function (n) { return same(col.modes[0].name, n); })) {
        col.renameMode(col.modes[0].modeId, m);
        mode = { modeId: col.modes[0].modeId };
      }
      modeIds[m] = mode ? mode.modeId : col.addMode(m);
    });
    if (c.hiddenFromPublishing) col.hiddenFromPublishing = true;
    var vars = {};
    allVars.filter(function (v) { return v.variableCollectionId === col.id; }).forEach(function (v) { vars[v.name] = v; });
    byName[c.name] = { col: col, modeIds: modeIds, vars: vars };
  }

  // 1º: todas as variáveis existem (os aliases precisam delas)
  for (var c of DATA.collections) {
    var entry = byName[c.name];
    for (var v of c.variables) {
      var variable = entry.vars[v.name];
      if (variable && variable.resolvedType !== v.type) { variable.remove(); variable = null; }
      if (!variable) { variable = figma.variables.createVariable(v.name, entry.col, v.type); report.criadas++; }
      else report.atualizadas++;
      variable.description = v.description || '';
      variable.scopes = v.scopes;
      if (v.hiddenFromPublishing) variable.hiddenFromPublishing = true;
      if (v.codeSyntax) variable.setVariableCodeSyntax('WEB', v.codeSyntax);
      entry.vars[v.name] = variable;
    }
  }

  // 2º: valores por modo
  for (var c of DATA.collections) {
    var entry = byName[c.name];
    for (var v of c.variables) {
      for (var mode of c.modes) {
        var raw = v.values[mode];
        var value = raw && typeof raw === 'object'
          ? figma.variables.createVariableAlias(byName[raw.collection].vars[raw.alias])
          : v.type === 'COLOR' ? hexToRgba(raw) : raw;
        entry.vars[v.name].setValueForMode(entry.modeIds[mode], value);
      }
    }
  }

  var textStyles = await figma.getLocalTextStylesAsync();
  for (var s of DATA.textStyles) {
    try { await figma.loadFontAsync({ family: s.fontFamily, style: s.fontStyle }); }
    catch (e) { report.fontes.push(s.fontFamily + ' ' + s.fontStyle); continue; }
    var style = textStyles.find(function (x) { return x.name === s.name; }) || figma.createTextStyle();
    style.name = s.name;
    style.description = s.description || '';
    style.fontName = { family: s.fontFamily, style: s.fontStyle };
    style.fontSize = s.fontSize;
    style.lineHeight = { unit: 'PIXELS', value: s.lineHeight };
    style.letterSpacing = { unit: 'PERCENT', value: s.letterSpacing };
    style.textCase = s.textCase;
    report.estilos++;
  }

  var effectStyles = await figma.getLocalEffectStylesAsync();
  for (var e of DATA.effectStyles) {
    var fx = effectStyles.find(function (x) { return sameStyle(x.name, e.name); });
    if (!fx) { fx = figma.createEffectStyle(); fx.name = e.name; }
    fx.description = e.description || '';
    fx.effects = e.effects.map(function (l) {
      return { type: 'DROP_SHADOW', color: l.color, offset: { x: l.x, y: l.y }, radius: l.blur, spread: l.spread, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false };
    });
    report.estilos++;
  }

  var msg = 'Órbita: ' + report.criadas + ' variáveis criadas, ' + report.atualizadas + ' atualizadas, ' + report.estilos + ' estilos.';
  if (report.fontes.length) msg += ' Fontes ausentes: ' + Array.from(new Set(report.fontes)).join(', ') + '.';
  figma.closePlugin(msg);
}

run().catch(function (err) { figma.closePlugin('Órbita: erro — ' + err.message); });
`;

export function figmaPlugin(data) {
  const manifest = {
    name: 'Órbita · importar tokens',
    id: 'orbita-tokens-import',
    api: '1.0.0',
    main: 'code.js',
    editorType: ['figma'],
    documentAccess: 'dynamic-page',
    networkAccess: { allowedDomains: ['none'] },
  };
  const code = `// Gerado por scripts/export-tokens.mjs em ${data.generatedAt} — não edite à mão.\nconst DATA = ${JSON.stringify(figmaVariables(data))};\n${PLUGIN_RUNTIME}`;
  return { manifest: `${JSON.stringify(manifest, null, 2)}\n`, code };
}

/* ───────── W3C Design Tokens (DTCG) ───────── */

function setPath(root, path, node) {
  let cur = root;
  path.slice(0, -1).forEach((key) => (cur = cur[key] ??= {}));
  cur[path.at(-1)] = node;
}

const cubic = (css) => (/cubic-bezier\(([^)]+)\)/.exec(css)?.[1] ?? '0, 0, 1, 1').split(',').map(Number);

export function toDTCG(data) {
  const { palettes, tokens } = data;
  const byVar = new Map(tokens.map((t) => [t.cssVar, t.name]));
  const colorValue = ({ ref, value }) => (plainRef(ref) ? `{${plainRef(ref)}}` : value);
  const shadowValue = (css) => parseShadow(css).map((l) => ({ color: l.hex, offsetX: `${l.x}px`, offsetY: `${l.y}px`, blur: `${l.blur}px`, spread: `${l.spread}px` }));
  const root = {
    $description: 'Órbita Design System — tokens no formato W3C Design Tokens. Temas: $value é o escuro (padrão); os dois estão em $extensions.com.orbita.modes.',
    $extensions: { [EXT]: { generatedAt: data.generatedAt, modes: data.modes, defaultMode: data.defaultMode, prefix: data.prefix } },
  };

  for (const p of palettes) for (const s of p.steps) setPath(root, ['color', p.name, s.step], { $type: 'color', $value: s.hex, $description: `${p.label} ${s.step} · ${s.oklch}` });
  setPath(root, ['color', 'white'], { $type: 'color', $value: '#ffffff' });
  setPath(root, ['color', 'black'], { $type: 'color', $value: '#000000' });

  for (const t of tokens) {
    const path = t.name.split('.');
    const desc = t.description ?? t.usage;
    let node;
    switch (t.type) {
      case 'color':
        node = { $type: 'color', $value: colorValue(t.modes.dark), $extensions: { [EXT]: { modes: { dark: colorValue(t.modes.dark), light: colorValue(t.modes.light) } } } };
        break;
      case 'dimension':
        node = { $type: 'dimension', $value: `${t.px}px` };
        break;
      case 'number':
        node = { $type: 'number', $value: Number(t.css) };
        break;
      case 'duration':
        node = { $type: 'duration', $value: t.css };
        break;
      case 'cubicBezier':
        node = { $type: 'cubicBezier', $value: cubic(t.css) };
        break;
      case 'fontFamily':
        node = { $type: 'fontFamily', $value: fontFamilies(t.css) };
        break;
      case 'fontWeight':
        node = { $type: 'fontWeight', $value: Number(t.css) };
        break;
      case 'typography':
        node = {
          $type: 'typography',
          $value: {
            fontFamily: `{font.family.${t.family ?? 'sans'}}`,
            fontWeight: `{font.weight.${t.weight}}`,
            fontSize: `${t.size}px`,
            lineHeight: round(t.line / t.size, 4),
            letterSpacing: t.tracking && t.tracking !== '0' ? t.tracking : '0em',
          },
          ...(t.transform ? { $extensions: { [EXT]: { textTransform: t.transform } } } : {}),
        };
        break;
      case 'shadow':
        node = { $type: 'shadow', $value: shadowValue(t.modes.dark), $extensions: { [EXT]: { modes: { dark: shadowValue(t.modes.dark), light: shadowValue(t.modes.light) } } } };
        break;
      case 'gradient': {
        const stops = [...t.modes.dark.matchAll(/(var\((--[a-z0-9-]+)\)|transparent|#[0-9a-f]{3,8})\s+([\d.]+)%/gi)].map((mm) => ({
          color: mm[2] ? `{${byVar.get(mm[2])}}` : mm[1] === 'transparent' ? '#00000000' : mm[1],
          position: Number(mm[3]) / 100,
        }));
        node = { $type: 'gradient', $value: stops, $extensions: { [EXT]: { css: t.modes } } };
        break;
      }
      default:
        node = { $value: t.css ?? t.modes };
    }
    if (desc) node.$description = desc;
    setPath(root, path, node);
  }
  return root;
}

/* ───────── JSON plano ───────── */

export function toFlat(data) {
  const out = {};
  for (const p of data.palettes) for (const s of p.steps) out[`color.${p.name}.${s.step}`] = { type: 'color', cssVar: s.cssVar, value: s.hex };
  out['color.white'] = { type: 'color', cssVar: '--ds-color-white', value: '#ffffff' };
  out['color.black'] = { type: 'color', cssVar: '--ds-color-black', value: '#000000' };
  for (const t of data.tokens) {
    const base = { type: t.type, cssVar: t.cssVar };
    if (t.type === 'color') out[t.name] = { ...base, dark: t.modes.dark.value, light: t.modes.light.value };
    else if (t.type === 'dimension') out[t.name] = { ...base, value: t.css, px: t.px };
    else if (t.type === 'typography') out[t.name] = { ...base, value: t.css, fontFamily: t.family, fontSize: t.size, lineHeight: t.line, fontWeight: t.weight, letterSpacing: t.tracking ?? '0', ...(t.transform ? { textTransform: t.transform } : {}) };
    else if (t.modes) out[t.name] = { ...base, dark: t.modes.dark, light: t.modes.light };
    else out[t.name] = { ...base, value: t.css };
  }
  return { $meta: { name: 'Órbita Design System', generatedAt: data.generatedAt, modes: data.modes, defaultMode: data.defaultMode, prefix: data.prefix }, tokens: out };
}

/* ───────── Contagens e arquivos ───────── */

export function exportCounts(data) {
  const m = tokenModel(data);
  return {
    primitives: m.primitives.length,
    semantic: m.semantic.length,
    dimensions: m.dimensions.length,
    variables: m.primitives.length + m.semantic.length + m.dimensions.length,
    aliases: m.semantic.reduce((a, s) => a + ['dark', 'light'].filter((mode) => s.values[mode].alias).length, 0),
    resolved: m.semantic.reduce((a, s) => a + ['dark', 'light'].filter((mode) => !s.values[mode].alias).length, 0),
    textStyles: m.textStyles.length,
    effectStyles: m.effectStyles.length,
    tokens: m.primitives.length + data.tokens.length,
  };
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

/** Todos os arquivos de dist/tokens/. `css` é o conteúdo de ds/tokens.css (opcional). */
export function exportFiles(data, css) {
  const plugin = figmaPlugin(data);
  return [
    { path: 'figma-variables.json', content: json(figmaVariables(data)) },
    { path: 'figma-variables.rest.json', content: json(figmaRestPayload(data)) },
    { path: 'figma-plugin/manifest.json', content: plugin.manifest },
    { path: 'figma-plugin/code.js', content: plugin.code },
    { path: 'tokens.dtcg.json', content: json(toDTCG(data)) },
    { path: 'tokens.flat.json', content: json(toFlat(data)) },
    ...(css ? [{ path: 'tokens.css', content: css }] : []),
  ];
}
