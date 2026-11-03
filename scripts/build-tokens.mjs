#!/usr/bin/env node
/**
 * Build de tokens do Lume.
 *
 * Lê tokens/*.json e gera:
 *   ds/tokens.css — custom properties (primitivas, fundação, temas) + classes de texto
 *   ds/tokens.js  — os mesmos dados, resolvidos, para a documentação consumir
 *
 * Formato dos JSON (inspirado no W3C DTCG, mais enxuto):
 *   - grupos podem declarar "$type" e "$unit", herdados pelos filhos
 *   - folha = valor direto, { "$value": … }, ou { "dark": …, "light": … } para temas
 *   - referências: "{color.neutral.900}"; transparência: "alpha({color.white}, 0.1)"
 *
 * Uso: node scripts/build-tokens.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PREFIX = 'ds';
// três temas: Lume claro (light, o padrão), Lume escuro (dark) e Laranja (orange, o pêssego quente)
const MODES = ['light', 'dark', 'orange'];
const DEFAULT_MODE = 'light';
// token sem valor próprio num tema herda deste outro; o Lume escuro tem todos os valores
const FALLBACK = { orange: 'dark', light: 'orange' };
const SCHEME = { light: 'light', dark: 'dark', orange: 'light' };
// recortes de um tema: valem só dentro de um seletor e não viram tema próprio (nem vão para Figma ou exportações).
// No JSON, a chave do recorte só aparece nos tokens que mudam ali; o resto segue o tema de base.
const SCOPES = { 'light-sidebar': { base: 'light', selector: '[data-theme="light"] :is(.ds-sidebar, .ds-navbar)', scheme: 'dark', over: 'color.bg.sidebar' } };
const ALL_MODES = [...MODES, ...Object.keys(SCOPES)];
for (const [id, scope] of Object.entries(SCOPES)) FALLBACK[id] = scope.base;
const modeValue = (value, mode) => value[mode] ?? (FALLBACK[mode] ? modeValue(value, FALLBACK[mode]) : undefined);

const SOURCES = [
  { file: 'foundation.json', themed: false },
  { file: 'typography.json', themed: false },
  { file: 'semantic.json', themed: true },
  { file: 'effects.json', themed: true },
];

/* ───────────────────────── Cor ───────────────────────── */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const encode = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const decode = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);

function oklchToLinearSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-5 && v <= 1 + 1e-5);

/** Converte OKLCH → hex, reduzindo o croma (mantendo L e H) até caber no sRGB. */
function oklch(L, C, H) {
  let c = C;
  if (!inGamut(oklchToLinearSrgb(L, c, H))) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearSrgb(L, mid, H))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  const rgb = oklchToLinearSrgb(L, c, H).map((v) => Math.round(encode(clamp01(v)) * 255));
  return { hex: toHex(rgb), L, C: c, H };
}

const hex2 = (n) => n.toString(16).padStart(2, '0');
const toHex = (rgb, a = 1) => `#${rgb.map(hex2).join('')}${a < 1 ? hex2(Math.round(a * 255)) : ''}`;

function parseHex(hex) {
  let h = hex.replace('#', '');
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return { rgb, a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => decode(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const composite = (fg, bgRgb) => fg.rgb.map((c, i) => Math.round(c * fg.a + bgRgb[i] * (1 - fg.a)));

/* ───────────────────────── Tokens ───────────────────────── */

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isModes = (v) => isPlain(v) && ALL_MODES.some((m) => m in v) && Object.keys(v).every((k) => ALL_MODES.includes(k) || k.startsWith('$'));
const cssVar = (name) => `--${PREFIX}-${name.replaceAll('.', '-')}`;
const round = (n, d = 4) => +n.toFixed(d);

function createRegistry() {
  const list = [];
  const byName = new Map();
  return {
    list,
    byName,
    add(token) {
      if (byName.has(token.name)) throw new Error(`Token duplicado: ${token.name}`);
      list.push(token);
      byName.set(token.name, token);
    },
  };
}

function buildPalettes({ defaults, palettes }) {
  return Object.entries(palettes).map(([name, def]) => {
    const lightness = { ...defaults.lightness, ...def.lightness };
    const chromaCurve = { ...defaults.chromaCurve, ...def.chromaCurve };
    const steps = Object.keys(lightness).sort((a, b) => a - b);
    return {
      name,
      label: def.label ?? name,
      hue: def.hue,
      chroma: def.chroma,
      steps: steps.map((step, i) => {
        const t = steps.length > 1 ? i / (steps.length - 1) : 0;
        const H = (def.hue + (def.hueShift ?? 0) * t + 360) % 360;
        return { step, ...oklch(lightness[step], def.chroma * (chromaCurve[step] ?? 1), H) };
      }),
    };
  });
}

function isLeaf(value, ctx) {
  if (!isPlain(value)) return true;
  return '$value' in value || isModes(value) || ctx.type === 'typography';
}

function flatten(node, pathParts, ctx, source, registry) {
  const local = { ...ctx };
  if (node.$type) local.type = node.$type;
  if (node.$unit) local.unit = node.$unit;

  let entries = Object.entries(node).filter(([k]) => !k.startsWith('$'));
  if (entries.length && entries.every(([k]) => /^\d+$/.test(k))) {
    entries = entries.sort(([a], [b]) => parseFloat(a) - parseFloat(b));
  }

  for (const [key, raw] of entries) {
    const parts = [...pathParts, key];
    if (!isLeaf(raw, local)) {
      flatten(raw, parts, local, source, registry);
      continue;
    }
    const value = isPlain(raw) && '$value' in raw ? raw.$value : raw;
    const token = {
      name: parts.join('.'),
      path: parts,
      type: local.type,
      unit: local.unit,
      themed: source.themed,
      source: source.file,
      description: isPlain(raw) ? raw.$description : undefined,
    };
    if (isModes(value)) {
      token.modes = Object.fromEntries(ALL_MODES.map((m) => [m, modeValue(value, m)]));
      token.own = Object.keys(value).filter((k) => ALL_MODES.includes(k));
    } else {
      token.value = value;
    }
    registry.add(token);
  }
}

const valueFor = (token, mode) => (token.modes ? token.modes[mode] : token.value);

/* ───────────────────────── Saída CSS ───────────────────────── */

const REF = /\{([^}]+)\}/g;
const ALPHA = /alpha\(\s*\{([^}]+)\}\s*,\s*([\d.]+)\s*\)/g;

function createEmitter(registry) {
  const assertRef = (ref, from) => {
    if (!registry.byName.has(ref)) throw new Error(`"${from}" referencia {${ref}}, que não existe.`);
  };

  const dim = (v, unit) => (v === 0 ? '0' : unit === 'px' ? `${v}px` : `${round(v / 16)}rem`);

  const refsToCss = (str, from) =>
    String(str)
      .replace(ALPHA, (_, ref, a) => {
        assertRef(ref, from);
        return `color-mix(in srgb, var(${cssVar(ref)}) ${round(a * 100, 2)}%, transparent)`;
      })
      .replace(REF, (_, ref) => {
        assertRef(ref, from);
        return `var(${cssVar(ref)})`;
      });

  function typographyCss(style) {
    const weight = `var(${cssVar(`font.weight.${style.weight}`)})`;
    const family = `var(${cssVar(`font.family.${style.family ?? 'sans'}`)})`;
    return `${weight} ${dim(style.size)}/${dim(style.line)} ${family}`;
  }

  function toCss(token, mode) {
    const v = valueFor(token, mode);
    switch (token.type) {
      case 'dimension':
        return dim(v, token.unit);
      case 'cubicBezier':
        return `cubic-bezier(${v.join(', ')})`;
      case 'typography':
        return typographyCss(v);
      default:
        return refsToCss(v, token.name);
    }
  }

  /** Resolve o valor final (hex) de uma cor em um tema. */
  function resolveColor(str, mode, seen = new Set()) {
    const s = String(str).trim();
    let m = /^alpha\(\s*\{([^}]+)\}\s*,\s*([\d.]+)\s*\)$/.exec(s);
    if (m) {
      const base = parseHex(resolveColor(`{${m[1]}}`, mode, seen));
      return toHex(base.rgb, base.a * Number(m[2]));
    }
    m = /^\{([^}]+)\}$/.exec(s);
    if (m) {
      assertRef(m[1], [...seen].at(-1) ?? s);
      if (seen.has(m[1])) throw new Error(`Referência circular em ${[...seen, m[1]].join(' → ')}`);
      const next = new Set(seen).add(m[1]);
      return resolveColor(valueFor(registry.byName.get(m[1]), mode), mode, next);
    }
    return s.toLowerCase();
  }

  /** Cor opaca resultante, compondo transparências sobre um fundo. */
  function solidColor(name, mode, over = 'color.bg.canvas') {
    const c = parseHex(resolveColor(`{${name}}`, mode));
    if (c.a >= 1) return c.rgb;
    return composite(c, solidColor(over, mode));
  }

  return { toCss, resolveColor, solidColor };
}

function cssBlock(selector, tokens, mode, emit, extra = []) {
  const lines = [...extra];
  let lastGroup;
  for (const t of tokens) {
    const group = t.path.slice(0, t.path.length > 2 ? 2 : 1).join('.');
    if (group !== lastGroup) {
      lines.push(`${lines.length ? '\n' : ''}  /* ${group} */`);
      lastGroup = group;
    }
    lines.push(`  ${cssVar(t.name)}: ${emit.toCss(t, mode)};`);
    if (t.type === 'typography') lines.push(`  ${cssVar(t.name)}-tracking: ${t.value.tracking ?? '0'};`);
  }
  return `${selector} {\n${lines.join('\n')}\n}`;
}

/* ───────────────────────── Build ───────────────────────── */

export async function buildTokens({ quiet = false } = {}) {
  const started = performance.now();
  const readJson = async (file) => JSON.parse(await readFile(path.join(ROOT, 'tokens', file), 'utf8'));

  const registry = createRegistry();
  const palettes = buildPalettes(await readJson('palettes.json'));

  // Primitivas
  for (const [name, hex] of [['white', '#ffffff'], ['black', '#000000']]) {
    registry.add({ name: `color.${name}`, path: ['color', name], type: 'color', value: hex, themed: false, source: 'palettes.json' });
  }
  for (const p of palettes) {
    for (const s of p.steps) {
      registry.add({ name: `color.${p.name}.${s.step}`, path: ['color', p.name, s.step], type: 'color', value: s.hex, themed: false, source: 'palettes.json' });
    }
  }

  let checks = [];
  for (const source of SOURCES) {
    const json = await readJson(source.file);
    if (json.$checks) checks = checks.concat(json.$checks);
    flatten(json, [], {}, source, registry);
  }

  const emit = createEmitter(registry);
  const globalTokens = registry.list.filter((t) => !t.themed);
  const themedTokens = registry.list.filter((t) => t.themed);

  // Contraste (WCAG 2.x)
  const contrast = checks.flatMap(([fg, bg, min, over]) =>
    MODES.map((mode) => {
      const bgRgb = emit.solidColor(bg, mode, over);
      const fgColor = parseHex(emit.resolveColor(`{${fg}}`, mode));
      const fgRgb = fgColor.a < 1 ? composite(fgColor, bgRgb) : fgColor.rgb;
      const ratio = round(contrastRatio(fgRgb, bgRgb), 2);
      return { fg, bg, mode, min, ratio, pass: ratio >= min };
    }),
  );

  // recortes: só os pares sobre o fundo do recorte (os outros textos não aparecem ali)
  const scopedContrast = Object.keys(SCOPES).flatMap((mode) =>
    checks
      .filter(([, bg]) => themedTokens.find((t) => t.name === bg)?.own?.includes(mode))
      .map(([fg, bg, min]) => {
        // transparência composta sobre o fundo do próprio recorte (a sidebar), não sobre o canvas da página
        const bgRgb = emit.solidColor(bg, mode, SCOPES[mode].over);
        const fgColor = parseHex(emit.resolveColor(`{${fg}}`, mode));
        const ratio = round(contrastRatio(fgColor.a < 1 ? composite(fgColor, bgRgb) : fgColor.rgb, bgRgb), 2);
        return { fg, bg, mode, min, ratio, pass: ratio >= min };
      }),
  );

  // CSS
  const textStyles = registry.list.filter((t) => t.type === 'typography');
  const textClasses = textStyles
    .map((t) => {
      const name = t.path.at(-1);
      const transform = t.value.transform ? `\n  text-transform: ${t.value.transform};` : '';
      return `.${PREFIX}-text-${name} {\n  font: var(${cssVar(t.name)});\n  letter-spacing: var(${cssVar(t.name)}-tracking);${transform}\n}`;
    })
    .join('\n');

  // "system" é resolvido no JS (Lume claro ou Lume escuro): o CSS só conhece os três temas
  const css = [
    `/**\n * Lume Design System — tokens\n * Gerado por scripts/build-tokens.mjs a partir de tokens/*.json. Não edite à mão.\n */`,
    cssBlock(':root', globalTokens, DEFAULT_MODE, emit),
    cssBlock(`:root,\n[data-theme="${DEFAULT_MODE}"]`, themedTokens, DEFAULT_MODE, emit, [`  color-scheme: ${SCHEME[DEFAULT_MODE]};`]),
    ...MODES.filter((m) => m !== DEFAULT_MODE).map((m) => cssBlock(`[data-theme="${m}"]`, themedTokens, m, emit, [`  color-scheme: ${SCHEME[m]};`])),
    ...Object.entries(SCOPES).map(([id, scope]) =>
      cssBlock(scope.selector, themedTokens.filter((t) => t.own?.includes(id)), id, emit, [`  color-scheme: ${scope.scheme};`]),
    ),
    `/* Estilos de texto */\n${textClasses}`,
  ].join('\n\n');

  // JS para a documentação
  const data = {
    generatedAt: new Date().toISOString(),
    prefix: PREFIX,
    modes: MODES,
    defaultMode: DEFAULT_MODE,
    palettes: palettes.map((p) => ({
      name: p.name,
      label: p.label,
      hue: p.hue,
      chroma: p.chroma,
      steps: p.steps.map((s) => {
        const rgb = parseHex(s.hex).rgb;
        return {
          step: s.step,
          hex: s.hex,
          oklch: `oklch(${round(s.L * 100, 1)}% ${round(s.C, 3)} ${round(s.H, 1)})`,
          cssVar: cssVar(`color.${p.name}.${s.step}`),
          contrastOnWhite: round(contrastRatio(rgb, [255, 255, 255]), 2),
          contrastOnBlack: round(contrastRatio(rgb, [0, 0, 0]), 2),
        };
      }),
    })),
    tokens: registry.list
      .filter((t) => t.source !== 'palettes.json')
      .map((t) => {
        const out = { name: t.name, cssVar: cssVar(t.name), type: t.type, source: t.source, themed: t.themed };
        if (t.description) out.description = t.description;
        if (t.type === 'typography') return { ...out, ...t.value, css: emit.toCss(t, DEFAULT_MODE) };
        if (t.type === 'dimension') return { ...out, px: t.value, css: emit.toCss(t) };
        if (t.type === 'color') {
          return { ...out, modes: Object.fromEntries(MODES.map((m) => [m, { ref: valueFor(t, m), value: emit.resolveColor(valueFor(t, m), m) }])) };
        }
        if (t.themed) return { ...out, modes: Object.fromEntries(MODES.map((m) => [m, emit.toCss(t, m)])) };
        return { ...out, css: emit.toCss(t) };
      }),
    contrast,
  };

  const renderJs = (d) => `// Gerado por scripts/build-tokens.mjs — não edite à mão.\nconst data = ${JSON.stringify(d, null, 2)};\n\nexport const { generatedAt, prefix, modes, defaultMode, palettes, tokens, contrast } = data;\nexport default data;\n`;

  // A data só muda quando os tokens mudam: rodar de novo sem mexer em nada não altera o arquivo (nem o git).
  const jsPath = path.join(ROOT, 'ds', 'tokens.js');
  const previous = await readFile(jsPath, 'utf8').catch(() => '');
  const previousAt = previous.match(/"generatedAt": "([^"]+)"/)?.[1];
  if (previousAt && previous === renderJs({ ...data, generatedAt: previousAt })) data.generatedAt = previousAt;

  await writeFile(path.join(ROOT, 'ds', 'tokens.css'), `${css}\n`);
  await writeFile(jsPath, renderJs(data));

  if (!quiet) {
    const failed = contrast.filter((c) => !c.pass);
    const ms = Math.round(performance.now() - started);
    console.log(`✓ tokens: ${registry.list.length} tokens, ${palettes.length} paletas → ds/tokens.css, ds/tokens.js (${ms}ms)`);
    console.log(`  contraste: ${contrast.length - failed.length}/${contrast.length} combinações atingem o mínimo`);
    const scopedFailed = scopedContrast.filter((c) => !c.pass);
    if (scopedContrast.length) console.log(`  recortes (${Object.keys(SCOPES).join(', ')}): ${scopedContrast.length - scopedFailed.length}/${scopedContrast.length}`);
    for (const c of [...failed, ...scopedFailed]) console.warn(`  ✗ [${c.mode}] ${c.fg} sobre ${c.bg}: ${c.ratio} (mín. ${c.min})`);
  }
  return data;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  buildTokens().catch((err) => {
    console.error(`✗ ${err.message}`);
    process.exit(1);
  });
}
