#!/usr/bin/env node
/**
 * Testa o plugin do Figma sem o Figma: monta o code.js, roda numa imitação da API (scripts/figma-mock.mjs)
 * com as regras do Figma, roda de novo para ver se atualiza sem duplicar e gera uma prévia em HTML.
 *
 * Uso: npm run figma:test
 *      node scripts/test-figma-plugin.mjs --only 30-botao --out dist/figma-plugin-teste
 * Prévia: http://localhost:5173/dist/figma-plugin/preview.html (com npm run dev)
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildFigmaPlugin } from './build-figma-plugin.mjs';
import { createMockFigma } from './figma-mock.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};

const built = await buildFigmaPlugin({ only: arg('only'), out: arg('out') });
const code = await readFile(path.join(built.outDir, 'code.js'), 'utf8');
const figma = createMockFigma({ missingFonts: arg('missing-font') ? [arg('missing-font')] : [] });

async function run(label) {
  const context = vm.createContext({ figma, console, __ORBITA_TEST__: true, setTimeout, Promise });
  vm.runInContext(code, context, { filename: 'code.js' });
  const t0 = performance.now();
  const summary = await context.main({ strict: !process.argv.includes('--loose') });
  return { label, summary, ms: Math.round(performance.now() - t0) };
}

function census() {
  const out = { pages: figma.root.children.map((p) => p.name), byType: {}, keys: {} };
  for (const page of figma.root.children) {
    page._loaded = true;
    for (const n of page.findAll()) {
      out.byType[n.type] = (out.byType[n.type] ?? 0) + 1;
      const key = n.getPluginData('orbita-key');
      if (key) {
        if (out.keys[key]) out.dupes = [...(out.dupes ?? []), key];
        out.keys[key] = n.id;
      }
    }
  }
  return out;
}

let first;
let second;
try {
  first = await run('1ª execução');
  const c1 = census();
  second = await run('2ª execução');
  const c2 = census();

  const lost = Object.keys(c1.keys).filter((k) => (k.startsWith('var/') || k.startsWith('cmp/') || k.startsWith('set/') || k.startsWith('icon/')) && c2.keys[k] !== c1.keys[k]);
  const problems = [];
  if (c2.dupes?.length) problems.push(`chaves repetidas: ${c2.dupes.slice(0, 5).join(', ')}`);
  if (lost.length) problems.push(`componentes que mudaram de id (instâncias quebrariam): ${lost.slice(0, 5).join(', ')}`);
  if (c2.pages.length !== c1.pages.length) problems.push('páginas duplicadas');
  for (const t of ['COMPONENT', 'COMPONENT_SET']) if (c1.byType[t] !== c2.byType[t]) problems.push(`${t}: ${c1.byType[t]} → ${c2.byType[t]}`);

  // ícone = uma camada só, “Ícone”: é o que faz a cor passar inteira na troca de ícone
  const badIcons = Object.keys(c2.keys).filter((k) => k.startsWith('icon/')).filter((k) => {
    const n = figma._all.get(c2.keys[k]);
    // a camada cheia é a primeira e se chama “Ícone”; só o heatmap tem camadas extras de opacidade
    return !n || n.children[0]?.name !== 'Ícone' || n.children.some((c, i) => c.strokes?.length || (i > 0 && !/^Ícone · \d+%$/.test(c.name)));
  });
  if (badIcons.length) problems.push(`ícones fora do formato de uma camada: ${badIcons.slice(0, 5).join(', ')}`);

  // opacidade própria em pintura ligada a variável: o Figma a troca pela da variável se aplicar uma vez só
  const veil = figma.root.children.flatMap((p) => p.findAll((n) => n.name === 'Tom' && n.parent?.parent?.name === 'Avatar'));
  if (!veil.length || veil.some((n) => Math.abs((n.fills[0]?.opacity ?? 1) - 0.24) > 0.01)) problems.push('o véu do avatar não ficou a 24% (opacidade da pintura perdida)');

  // linhas que não cabem: no Figma o conteúdo vaza pela borda (foi assim que as tags saíram do cabeçalho)
  const overflows = [];
  for (const page of figma.root.children) {
    for (const top of page.children) {
      for (const o of figma._overflowsOf(top)) overflows.push(`${top.name.replace('Órbita · ', '')} › ${o.node.name} (${o.need} > ${o.have} px)`);
    }
  }
  if (overflows.length) problems.push(`conteúdo vazando da linha: ${overflows.slice(0, 40).join('; ')}${overflows.length > 40 ? ` e mais ${overflows.length - 40}` : ''}`);

  // resumo para a página Recursos › Plugin do Figma
  const blocks = [];
  for (const page of figma.root.children) {
    for (const n of page.children) {
      const key = n.getPluginData('orbita-key');
      if (key.startsWith('block/')) blocks.push({ page: page.name.replace('Órbita · ', ''), title: n.name.replace('Órbita · ', ''), sets: n.findAll((x) => x.type === 'COMPONENT_SET').length, variants: n.findAll((x) => x.type === 'COMPONENT' && x.parent?.type === 'COMPONENT_SET').length, x: n.x, y: n.y });
    }
  }
  blocks.sort((a, b) => a.page.localeCompare(b.page) || a.y - b.y || a.x - b.x);
  const summary = {
    version: built.version,
    generatedAt: new Date().toISOString(),
    pages: c2.pages.filter((p) => p.startsWith('Órbita')),
    components: (c2.byType.COMPONENT ?? 0) - (c2.keys ? Object.keys(c2.keys).filter((k) => k.startsWith('icon/')).length : 0),
    sets: c2.byType.COMPONENT_SET ?? 0,
    icons: Object.keys(c2.keys).filter((k) => k.startsWith('icon/')).length,
    variables: figma._variables.length,
    textStyles: figma._textStyles.length,
    effectStyles: figma._effectStyles.length,
    blocks,
  };
  await writeFile(path.join(built.outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`✓ ${first.label}: ${first.summary} (${first.ms} ms)`);
  console.log(`✓ ${second.label}: mesmos ${c2.byType.COMPONENT ?? 0} componentes e ${c2.byType.COMPONENT_SET ?? 0} conjuntos, ids preservados (${second.ms} ms)`);
  console.log(`  páginas: ${c2.pages.join(' · ')}`);
  console.log(`  nós: ${Object.entries(c2.byType).map(([k, v]) => `${k.toLowerCase()} ${v}`).join(', ')}`);
  if (problems.length) {
    console.error(`✗ ${problems.join('\n✗ ')}`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error(`✗ o plugin falhou: ${err.message}`);
  console.error(err.stack.split('\n').filter((l) => l.includes('code.js')).slice(0, 4).join('\n'));
  process.exitCode = 1;
}

/* ───────── Prévia em HTML: auto layout vira flexbox, variáveis viram var(--ds-…) ───────── */

const modeNames = {};
for (const c of figma._collections) for (const m of c.modes) modeNames[m.modeId] = m.name;
const cssVar = (name) => `var(--ds-${name.replace(/\//g, '-')})`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const WEIGHT = { Regular: 400, Medium: 500, 'Semi Bold': 600, Bold: 700, 'Extra Bold': 800 };
const JUSTIFY = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' };
const ALIGN = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', BASELINE: 'baseline' };

function color(p) {
  if (!p) return 'transparent';
  const base = p._var ? cssVar(p._var) : `rgba(${Math.round(p.color.r * 255)},${Math.round(p.color.g * 255)},${Math.round(p.color.b * 255)},${p.color.a ?? 1})`;
  // a transparência da própria variável já vem no var(--ds-…): só a opacidade pedida a mais entra aqui
  const alpha = figma._variables.find((v) => v.id === p.boundVariables?.color?.id)?._resolve()?.a ?? 1;
  const op = Math.abs((p.opacity ?? 1) - alpha) < 0.002 ? 1 : p.opacity ?? 1;
  return op < 1 ? `color-mix(in srgb, ${base} ${Math.round(op * 100)}%, transparent)` : base;
}

function boxStyle(n, parent) {
  const s = [];
  const al = n.layoutMode && n.layoutMode !== 'NONE';
  const pal = parent && parent.layoutMode && parent.layoutMode !== 'NONE';
  const sizeH = figma._sizing(n, 'H');
  const sizeV = figma._sizing(n, 'V');
  const pH = parent?.layoutMode === 'HORIZONTAL';
  if (n.layoutPositioning === 'ABSOLUTE' || (parent && !pal)) s.push(`position:absolute;left:${n.x}px;top:${n.y}px`);
  else s.push('position:relative');
  // tamanho
  // crescer (layoutGrow) na linha é o mesmo que preencher: o texto encolhe em vez de empurrar os vizinhos
  const growH = pH && n.layoutGrow === 1;
  if ((sizeH === 'FILL' || growH) && pal) s.push(pH ? 'flex:1 1 0;min-width:0' : 'align-self:stretch');
  else if (sizeH === 'HUG' && n.type !== 'TEXT') s.push('width:max-content');
  else if (n.type !== 'TEXT' || n.textAutoResize !== 'WIDTH_AND_HEIGHT') s.push(`width:${round(n.width)}px`);
  if (sizeV === 'FILL' && pal) s.push(!pH ? 'flex:1 1 0;min-height:0' : 'align-self:stretch');
  else if (sizeV !== 'HUG' && n.type !== 'TEXT') s.push(`height:${round(n.height)}px`);
  if (n.layoutGrow === 1 && pal && !growH) s.push('flex-grow:1');
  if (!growH) s.push('flex-shrink:0');
  if (al) {
    s.push(`display:flex;flex-direction:${n.layoutMode === 'HORIZONTAL' ? 'row' : 'column'}`);
    s.push(`gap:${n.layoutWrap === 'WRAP' ? `${n.counterAxisSpacing}px ` : ''}${n.primaryAxisAlignItems === 'SPACE_BETWEEN' ? 0 : n.itemSpacing}px`);
    s.push(`padding:${n.paddingTop}px ${n.paddingRight}px ${n.paddingBottom}px ${n.paddingLeft}px`);
    s.push(`justify-content:${JUSTIFY[n.primaryAxisAlignItems]};align-items:${ALIGN[n.counterAxisAlignItems]}`);
    if (n.layoutWrap === 'WRAP') s.push('flex-wrap:wrap;align-content:flex-start');
  }
  s.push('box-sizing:border-box');
  const fills = (n.fills ?? []).filter((f) => f.visible !== false);
  if (fills.length && n.type !== 'TEXT' && n.type !== 'VECTOR') s.push(`background:${color(fills[0])}`);
  const stroke = (n.strokes ?? [])[0];
  if (stroke && n.type !== 'VECTOR') {
    const w = n.strokeWeight ?? 1;
    const sides = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'].map((k) => (n[k] === undefined ? w : n[k]));
    if (sides.some((v) => v !== sides[0])) s.push(`border-style:solid;border-color:${color(stroke)};border-width:${sides.map((v) => `${v}px`).join(' ')}`);
    else if (n.strokeAlign === 'OUTSIDE') s.push(`box-shadow:0 0 0 ${w}px ${color(stroke)}`);
    else if (w > 0) s.push(`box-shadow:inset 0 0 0 ${w}px ${color(stroke)}`);
  }
  const r = [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].map((v) => Math.min(v ?? 0, 999));
  if (r.some(Boolean)) s.push(`border-radius:${r.map((v) => `${v}px`).join(' ')}`);
  const fx = (n.effects ?? []).filter((e) => e.type === 'DROP_SHADOW');
  if (fx.length) s.push(`filter:${fx.map((e) => `drop-shadow(${e.offset.x}px ${e.offset.y}px ${e.radius / 2}px ${e._var ? `color-mix(in srgb, ${cssVar(e._var)} 60%, transparent)` : `rgba(0,0,0,${e.color.a})`})`).join(' ')}`);
  if (n.opacity !== undefined && n.opacity < 1) s.push(`opacity:${n.opacity}`);
  if (n.clipsContent && al) s.push('overflow:hidden');
  if (n.type === 'COMPONENT_SET') s.push('outline:1px dashed #9747ff;outline-offset:-1px;border-radius:5px');
  return s.join(';');
}

const round = (v) => Math.round(v * 100) / 100;

function textHtml(n, parent) {
  const st = figma._textStyles.find((x) => x.id === n.textStyleId);
  const font = n.fontName;
  const lh = n.lineHeight?.unit === 'PIXELS' ? `${n.lineHeight.value}px` : 'normal';
  const ls = n.letterSpacing?.unit === 'PERCENT' ? `${n.letterSpacing.value / 100}em` : '0';
  const s = [boxStyle(n, parent), `font-family:'${font.family}',Inter,sans-serif`, `font-weight:${WEIGHT[font.style] ?? 400}`, `font-size:${n.fontSize}px`, `line-height:${lh}`, `letter-spacing:${ls}`, `color:${color(n.fills?.[0])}`];
  if (n.textAutoResize === 'WIDTH_AND_HEIGHT') s.push('white-space:nowrap');
  if (n.textTruncation === 'ENDING') s.push('overflow:hidden;text-overflow:ellipsis;white-space:nowrap');
  if (st?.textCase === 'UPPER') s.push('text-transform:uppercase');
  s.push(`text-align:${({ LEFT: 'left', CENTER: 'center', RIGHT: 'right' })[n.textAlignHorizontal] ?? 'left'}`);
  return `<div style="${s.join(';')}">${esc(n.characters)}</div>`;
}

function iconHtml(n, parent) {
  const shapes = n.children.filter((c) => c.type === 'VECTOR').flatMap((v) => {
    const stroke = v.strokes?.[0];
    const fill = v.fills?.[0];
    const clean = (svg) => svg.replace(/\s(stroke|fill|stroke-width)="[^"]*"/g, '');
    // ícone achatado: o traço virou contorno e é pintado pelo preenchimento do vetor
    if (v._parts) {
      return v._parts.map((p) => {
        const style = p.role === 'stroke'
          ? `stroke:${color(fill)};fill:none;stroke-width:${p.weight ?? 1.5};stroke-linecap:round;stroke-linejoin:round`
          : `stroke:none;fill:${color(fill)}`;
        return clean(p.svg).replace(/^<(\w+)/, `<$1 style="${style}"`);
      });
    }
    const style = `stroke:${stroke ? color(stroke) : 'none'};fill:${fill ? color(fill) : 'none'};stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round`;
    return [clean(v._svg).replace(/^<(\w+)/, `<$1 style="${style}"`)];
  });
  const vb = n.children.find((c) => c._viewBox)?._viewBox ?? '0 0 24 24';
  const square = vb === '0 0 24 24';
  return `<svg viewBox="${vb}"${square ? '' : ' preserveAspectRatio="none"'} style="${boxStyle(n, parent)};overflow:visible">${shapes.join('')}</svg>`;
}

function nodeHtml(n, parent) {
  if (n.visible === false) return '';
  if (n.type === 'TEXT') return textHtml(n, parent);
  if (n.children?.length && n.children.every((c) => c.type === 'VECTOR')) return iconHtml(n, parent);
  if (n.type === 'RECTANGLE' || n.type === 'ELLIPSE') {
    const extra = n.type === 'ELLIPSE' ? ';border-radius:50%' : '';
    return `<div style="${boxStyle(n, parent)}${extra}"></div>`;
  }
  let attrs = '';
  const modes = Object.values(n.explicitVariableModes ?? {});
  if (modes.length) attrs = ` data-theme="${modeNames[modes[0]] === 'Claro' ? 'light' : 'dark'}"`;
  const title = n.type === 'COMPONENT_SET' || n.type === 'COMPONENT' ? ` title="${esc(n.name)}"` : '';
  return `<div${attrs}${title} style="${boxStyle(n, parent)}">${(n.children ?? []).map((c) => nodeHtml(c, n)).join('')}</div>`;
}

const pagesHtml = figma.root.children
  .filter((p) => p.name.startsWith('Órbita'))
  .map((p) => {
    const w = Math.max(...p.children.map((c) => c.x + c.width), 100);
    const h = Math.max(...p.children.map((c) => c.y + c.height), 100);
    const bg = p.backgrounds?.[0]?.color;
    const bgCss = bg ? `rgb(${Math.round(bg.r * 255)},${Math.round(bg.g * 255)},${Math.round(bg.b * 255)})` : '#1e1e1e';
    return `<section class="page"><h2>${esc(p.name)}</h2><div class="canvas" style="width:${w + 160}px;height:${h + 160}px;background:${bgCss}"><div style="position:absolute;left:80px;top:80px">${p.children.map((c) => nodeHtml(c, p)).join('')}</div></div></section>`;
  })
  .join('');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Prévia · Órbita para Figma</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../ds/tokens.css">
<style>body{margin:0;background:#111;color:#ccc;font:13px Inter,sans-serif}header{position:sticky;top:0;z-index:9;display:flex;gap:16px;align-items:center;padding:10px 16px;background:#1b1b1b;border-bottom:1px solid #333}
header input{width:200px}.page h2{margin:24px 16px 8px;font:600 14px Inter;color:#999}.zoom{transform-origin:0 0}.canvas{position:relative}</style></head>
<body><header><strong>Prévia do plugin</strong><span>aproximação do Figma (auto layout → flexbox)</span><label>zoom <input type="range" min="0.2" max="1" step="0.05" value="0.5" oninput="document.querySelector('.zoom').style.transform='scale('+this.value+')'"></label></header>
<div class="zoom" style="transform:scale(.5)">${pagesHtml}</div></body></html>`;
await writeFile(path.join(built.outDir, 'preview.html'), html);
console.log(`  prévia: ${path.relative(ROOT, path.join(built.outDir, 'preview.html'))}`);
