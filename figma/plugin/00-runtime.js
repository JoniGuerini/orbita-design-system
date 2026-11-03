/**
 * Lume para Figma — núcleo do plugin.
 *
 * Roda no sandbox de plugins do Figma (sem módulos): o build (scripts/build-figma-plugin.mjs) junta
 * figma/plugin/*.js em ordem e injeta DATA (variáveis e estilos), ICONS e META antes deste arquivo.
 *
 * Regras deste código:
 *   - nada de ?. nem ?? (o sandbox do Figma pode não aceitar); Object.assign em vez de spread de objeto
 *   - toda cor e medida vem de uma variável do Figma (bind), nunca de um valor solto — exceto o
 *     cabeçalho escuro dos blocos, que usa primitivas de propósito (fica igual nos dois modos)
 *   - tudo que o plugin cria leva pluginData "orbita-key": rodar de novo atualiza em vez de duplicar,
 *     e componentes mantêm o id (instâncias espalhadas pelo arquivo continuam ligadas)
 */

/* eslint-disable no-unused-vars */

var LUME = {
  vars: {}, // nome → Variable
  collections: {}, // nome em português ('Semânticos') → VariableCollection
  modes: {}, // 'Escuro' | 'Claro' → modeId (coleção Semânticos)
  active: ['Claro', 'Escuro'], // modos escolhidos na janela, na ordem das prévias (o plano gratuito do Figma aceita um só)
  textStyles: {},
  effectStyles: {}, // nome em português ('Escuro/shadow/sm') → EffectStyle
  registry: {}, // orbita-key → node
  fonts: {},
  report: { variaveis: 0, estilos: 0, componentes: 0, variantes: 0, blocos: 0, icones: 0, avisos: [] },
  pages: {}, // 'Fundamentos' | 'Ícones' | 'Componentes' → PageNode
  block: '', // bloco em construção (para o relatório de textos sem tradução)
  progress: function () {},
};

var KEY = 'orbita-key';
var PROP = 'orbita-prop';
var PAGE = 'orbita-page';

/* ───────── Utilidades ───────── */

function hexToRgba(hex) {
  var h = String(hex).replace('#', '');
  var n = function (i) { return parseInt(h.slice(i, i + 2), 16) / 255; };
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
}

function warn(msg) {
  if (LUME.report.avisos.indexOf(msg) < 0) LUME.report.avisos.push(msg);
}

function pick(obj, key, fallback) {
  return obj && obj[key] !== undefined ? obj[key] : fallback;
}

/* ───────── Tokens: variáveis e estilos ───────── */

/** Modos que esta execução gera: numa coleção com temas, só os escolhidos; nas outras, o único que há. */
function modesOf(c) {
  return c.modes.length > 1 ? c.modes.filter(function (m) { return LUME.active.indexOf(m) >= 0; }) : c.modes;
}

/** addMode com a recusa do plano gratuito explicada (o Figma só diz “Limited to 1 modes only”). */
function addMode(col, name) {
  try {
    return col.addMode(name);
  } catch (err) {
    if (/Limited to/.test(String(err && err.message))) {
      throw new Error(L3(
        'O plano deste arquivo no Figma aceita um modo só por coleção de variáveis. Em Modos, escolha “Só Escuro” ou “Só Claro”, ou leve o arquivo para um time com plano pago.',
        'This file’s Figma plan allows only one mode per variable collection. Under Modes, choose “Dark only” or “Light only”, or move the file to a team on a paid plan.',
        'El plan de este archivo en Figma admite un solo modo por colección de variables. En Modos, elige “Solo Oscuro” o “Solo Claro”, o lleva el archivo a un equipo con plan de pago.',
      ));
    }
    throw err;
  }
}

/** Nome em português (a chave interna) de uma coleção ou de um modo, em qualquer idioma em que esteja no arquivo. */
function canonical(name, known) {
  for (var k of known) if (anyLang(k).indexOf(name) >= 0) return k;
  return name;
}

async function importTokens() {
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var allVars = await figma.variables.getLocalVariablesAsync();
  var byCollection = {};
  var collectionNames = DATA.collections.map(function (c) { return c.name; });
  var modeNames = [];
  DATA.collections.forEach(function (c) { c.modes.forEach(function (m) { if (modeNames.indexOf(m) < 0) modeNames.push(m); }); });

  for (var c of DATA.collections) {
    // a coleção pode ter sido criada em outro idioma: acha por qualquer nome e renomeia
    var names = anyLang(c.name);
    var col = collections.find(function (x) { return names.indexOf(x.name) >= 0; }) || figma.variables.createVariableCollection(L(c.name));
    col.name = L(c.name);
    var modeIds = {};
    var wanted = modesOf(c);
    wanted.forEach(function (m, i) {
      var mode = col.modes.find(function (x) { return canonical(x.name, modeNames) === m; });
      if (!mode && i === 0 && wanted.indexOf(canonical(col.modes[0].name, modeNames)) < 0) mode = { modeId: col.modes[0].modeId };
      if (mode) col.renameMode(mode.modeId, L(m));
      modeIds[m] = mode ? mode.modeId : addMode(col, L(m));
    });
    if (c.hiddenFromPublishing) col.hiddenFromPublishing = true;
    var vars = {};
    allVars.filter(function (v) { return v.variableCollectionId === col.id; }).forEach(function (v) { vars[v.name] = v; });
    byCollection[c.name] = { col: col, modeIds: modeIds, vars: vars };
    LUME.collections[c.name] = col;
  }
  // coleções que já estão no arquivo e não vieram agora (importação em partes): os aliases podem apontar para elas
  collections.forEach(function (col) {
    var id = canonical(col.name, collectionNames);
    if (byCollection[id]) return;
    var vars = {};
    var modeIds = {};
    col.modes.forEach(function (m) { modeIds[canonical(m.name, modeNames)] = m.modeId; });
    allVars.filter(function (v) { return v.variableCollectionId === col.id; }).forEach(function (v) { vars[v.name] = v; });
    byCollection[id] = { col: col, modeIds: modeIds, vars: vars };
    LUME.collections[id] = col;
  });

  // 1º: todas as variáveis existem (os aliases precisam delas)
  for (var c2 of DATA.collections) {
    var entry = byCollection[c2.name];
    for (var v of c2.variables) {
      var variable = entry.vars[v.name];
      if (variable && variable.resolvedType !== v.type) { variable.remove(); variable = null; }
      if (!variable) variable = figma.variables.createVariable(v.name, entry.col, v.type);
      variable.description = L(v.description || '');
      variable.scopes = v.scopes;
      if (v.hiddenFromPublishing) variable.hiddenFromPublishing = true;
      if (v.codeSyntax) variable.setVariableCodeSyntax('WEB', v.codeSyntax);
      entry.vars[v.name] = variable;
      LUME.report.variaveis++;
    }
  }

  // 2º: valores por modo
  for (var c3 of DATA.collections) {
    var e3 = byCollection[c3.name];
    for (var v3 of c3.variables) {
      for (var mode of modesOf(c3)) {
        var raw = v3.values[mode];
        var value = raw && typeof raw === 'object'
          ? figma.variables.createVariableAlias(byCollection[raw.collection].vars[raw.alias])
          : v3.type === 'COLOR' ? hexToRgba(raw) : raw;
        e3.vars[v3.name].setValueForMode(e3.modeIds[mode], value);
      }
    }
  }

  // Semânticos primeiro na busca por nome (color/bg/canvas); primitivas e dimensões depois
  ['Primitivas', 'Dimensões', 'Semânticos'].forEach(function (name) {
    var e = byCollection[name];
    if (!e) return;
    Object.keys(e.vars).forEach(function (k) { LUME.vars[k] = e.vars[k]; });
  });
  var sem = byCollection['Semânticos'];
  LUME.modes = sem ? sem.modeIds : {};

  var textStyles = await figma.getLocalTextStylesAsync();
  textStyles.forEach(function (x) { LUME.textStyles[x.name] = x; });
  for (var s of DATA.textStyles || []) {
    var font = await ensureFont(s.fontFamily, s.fontStyle);
    var style = textStyles.find(function (x) { return x.name === s.name; }) || figma.createTextStyle();
    style.name = s.name;
    style.description = L(s.description || '');
    style.fontName = font;
    style.fontSize = s.fontSize;
    style.lineHeight = { unit: 'PIXELS', value: s.lineHeight };
    style.letterSpacing = { unit: 'PERCENT', value: s.letterSpacing };
    style.textCase = s.textCase;
    LUME.textStyles[s.name] = style;
    LUME.report.estilos++;
  }

  // sombras: 'Escuro/shadow/sm' — o modo no começo do nome vai no idioma ativo
  var effectStyles = await figma.getLocalEffectStylesAsync();
  var styleName = function (name) {
    var parts = name.split('/');
    return [L(parts[0])].concat(parts.slice(1)).join('/');
  };
  for (var e of DATA.effectStyles || []) {
    var fxNames = anyLang(e.name.split('/')[0]).map(function (m) { return [m].concat(e.name.split('/').slice(1)).join('/'); });
    var fx = effectStyles.find(function (x) { return fxNames.indexOf(x.name) >= 0; }) || figma.createEffectStyle();
    fx.name = styleName(e.name);
    fx.description = L(e.description || '');
    fx.effects = e.effects.map(function (l) {
      return { type: 'DROP_SHADOW', color: l.color, offset: { x: l.x, y: l.y }, radius: l.blur, spread: l.spread, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false };
    });
    LUME.effectStyles[e.name] = fx;
    LUME.report.estilos++;
  }
}

/** Carrega a fonte; sem ela (Inter Tight ou JetBrains Mono ausentes), cai para Inter no mesmo peso. */
async function ensureFont(family, style) {
  var id = family + '/' + style;
  if (LUME.fonts[id]) return LUME.fonts[id];
  try {
    await figma.loadFontAsync({ family: family, style: style });
    LUME.fonts[id] = { family: family, style: style };
  } catch (err) {
    warn(L3('Fonte ausente: ', 'Missing font: ', 'Fuente ausente: ') + family + ' ' + style + L3(' (usei Inter)', ' (used Inter)', ' (usé Inter)'));
    var fallback = { family: 'Inter', style: style };
    try { await figma.loadFontAsync(fallback); } catch (e2) { fallback = { family: 'Inter', style: 'Regular' }; await figma.loadFontAsync(fallback); }
    LUME.fonts[id] = fallback;
  }
  return LUME.fonts[id];
}

async function loadFonts() {
  var list = [['Inter', 'Regular'], ['Inter', 'Medium'], ['Inter', 'Semi Bold'], ['Inter', 'Bold'], ['Inter Tight', 'Semi Bold'], ['Inter Tight', 'Bold'], ['JetBrains Mono', 'Regular']];
  for (var f of list) await ensureFont(f[0], f[1]);
}

/* ───────── Variáveis nos nós ───────── */

function V(name) {
  var v = LUME.vars[name];
  if (!v) throw new Error(L3('Variável não encontrada: ', 'Variable not found: ', 'Variable no encontrada: ') + name);
  return v;
}

function paint(name, opacity) {
  var p = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 }, 'color', V(name));
  return opacity === undefined || opacity === 1 ? p : Object.assign({}, p, { opacity: opacity });
}

/**
 * Aplica pinturas ligadas a variáveis. Quando a ligação de uma pintura muda, o Figma troca a
 * opacidade dela pela transparência da variável (é o que deixa bg/hover a 6%). Para pedir uma
 * opacidade própria (o véu de 24% do avatar), aplica de novo: com a ligação igual, ela fica.
 */
function setPaints(node, field, list) {
  node[field] = list;
  var want = list.map(function (p) { return p.opacity === undefined ? 1 : p.opacity; });
  if (want.every(function (o) { return o === 1; })) return node;
  node[field] = node[field].map(function (p, i) { return want[i] < 1 ? Object.assign({}, p, { opacity: want[i] }) : p; });
  return node;
}

/** fills: nome de variável, lista de nomes ou null (sem preenchimento). */
function fill(node, name, opacity) {
  if (!name) { node.fills = []; return node; }
  return setPaints(node, 'fills', [].concat(name).map(function (n) { return paint(n, opacity); }));
}

function stroke(node, name, weight, opts) {
  opts = opts || {};
  if (!name) { node.strokes = []; return node; }
  node.strokes = [paint(name)];
  node.strokeAlign = opts.align || 'INSIDE';
  if (typeof weight === 'string') node.setBoundVariable('strokeWeight', V(weight));
  else node.strokeWeight = weight === undefined ? 1 : weight;
  if (opts.dash) node.dashPattern = opts.dash;
  return node;
}

/** Medida: número solto ou nome de variável de dimensão ('space/200', 'radius/md'). */
function num(node, field, value) {
  if (value === undefined || value === null) return;
  if (typeof value === 'string') node.setBoundVariable(field, V(value));
  else node[field] = value;
}

function radius(node, value) {
  ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'].forEach(function (f) { num(node, f, value); });
  return node;
}

function shadow(node, size) {
  // Estilos do Figma não têm modos: a sombra usa a cor de overlay do tema, que tem.
  var color = { r: 0, g: 0, b: 0, a: 0.3 };
  var base = { type: 'DROP_SHADOW', color: color, offset: { x: 0, y: size === 'sm' ? 2 : 8 }, radius: size === 'sm' ? 6 : 24, spread: size === 'sm' ? 0 : -4, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false };
  var fx = base;
  try { fx = figma.variables.setBoundVariableForEffect(base, 'color', V('color/bg/overlay')); } catch (e) { /* sem bind: fica a cor fixa */ }
  node.effects = [fx];
  return node;
}

/** Fixa o modo da coleção Semânticos neste nó (e em tudo dentro dele). */
function setMode(node, modeName) {
  var col = LUME.collections['Semânticos'];
  var id = LUME.modes[modeName];
  if (!col || !id) return node;
  node.setExplicitVariableModeForCollection(col, id);
  return node;
}

/* ───────── Construção ───────── */

var ALIGN = { start: 'MIN', center: 'CENTER', end: 'MAX', between: 'SPACE_BETWEEN', baseline: 'BASELINE' };

/**
 * Frame com auto layout.
 * o: { dir: 'H'|'V'|'none', gap, pad (número, token ou [t, r, b, l] / [y, x]), w, h, fill, stroke, strokeWeight,
 *      radius, align (eixo principal), cross (eixo cruzado), wrap, rowGap, clip, name, opacity }
 * Sem w/h, o frame abraça o conteúdo.
 */
function box(name, o, node) {
  o = o || {};
  var f = node || figma.createFrame();
  f.name = L(name);
  f.fills = [];
  if (o.dir !== 'none') {
    f.layoutMode = o.dir === 'H' ? 'HORIZONTAL' : 'VERTICAL';
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    if (o.wrap && o.dir === 'H') f.layoutWrap = 'WRAP';
    num(f, 'itemSpacing', o.gap === undefined ? 0 : o.gap);
    if (o.wrap) num(f, 'counterAxisSpacing', o.rowGap === undefined ? o.gap : o.rowGap);
    padding(f, o.pad);
    f.primaryAxisAlignItems = ALIGN[o.align || 'start'];
    f.counterAxisAlignItems = ALIGN[o.cross || 'start'] === 'SPACE_BETWEEN' ? 'MIN' : ALIGN[o.cross || 'start'];
  }
  if (o.w !== undefined || o.h !== undefined) {
    f.resize(o.w !== undefined ? o.w : Math.max(1, f.width), o.h !== undefined ? o.h : Math.max(1, f.height));
    if (o.dir !== 'none') {
      // resize() fixa os dois eixos; o eixo sem medida volta a abraçar o conteúdo
      var horizontal = o.dir === 'H';
      var fixW = o.w !== undefined ? 'FIXED' : 'AUTO';
      var fixH = o.h !== undefined ? 'FIXED' : 'AUTO';
      f.primaryAxisSizingMode = horizontal ? fixW : fixH;
      f.counterAxisSizingMode = horizontal ? fixH : fixW;
    }
  }
  if (o.fill) fill(f, o.fill, o.fillOpacity);
  if (o.stroke) stroke(f, o.stroke, o.strokeWeight, { dash: o.dash });
  if (o.radius !== undefined) radius(f, o.radius);
  f.clipsContent = !!o.clip;
  if (o.opacity !== undefined) num(f, 'opacity', o.opacity);
  return f;
}

function padding(f, pad) {
  if (pad === undefined || pad === null) return;
  var p = Array.isArray(pad) ? pad : [pad, pad, pad, pad];
  if (p.length === 2) p = [p[0], p[1], p[0], p[1]];
  num(f, 'paddingTop', p[0]);
  num(f, 'paddingRight', p[1]);
  num(f, 'paddingBottom', p[2]);
  num(f, 'paddingLeft', p[3]);
}

/** Põe o filho no pai. o: { fillW, fillH, grow, absolute, x, y } */
function add(parent, child, o) {
  o = o || {};
  parent.appendChild(child);
  if (o.absolute) {
    child.layoutPositioning = 'ABSOLUTE';
    if (o.x !== undefined) child.x = o.x;
    if (o.y !== undefined) child.y = o.y;
  }
  if (o.fillW) child.layoutSizingHorizontal = 'FILL';
  if (o.fillH) child.layoutSizingVertical = 'FILL';
  if (o.grow) child.layoutGrow = 1;
  return child;
}

/** Vários filhos de uma vez. */
function addAll(parent, children, o) {
  children.forEach(function (c) { if (c) add(parent, c, o); });
  return parent;
}

/**
 * Texto com estilo do Lume. o: { style: 'label-md', color, w, align, name, weight (sobrepõe o peso), size, prop, raw }
 * prop: nome da propriedade de componente de texto que este nó expõe (ex.: 'Rótulo').
 * O texto passa por L(); raw: true para um texto que já vem traduzido ou que não se traduz (código).
 */
async function text(chars, o) {
  o = o || {};
  chars = o.raw ? String(chars) : L(String(chars));
  var t = figma.createText();
  var styleName = 'text/' + (o.style || 'body-sm');
  var style = LUME.textStyles[styleName];
  t.fontName = style ? style.fontName : await ensureFont('Inter', 'Regular');
  t.characters = chars;
  if (style) await t.setTextStyleIdAsync(style.id);
  if (o.weight) {
    var family = (style ? style.fontName : t.fontName).family;
    t.fontName = await ensureFont(family, o.weight);
  }
  if (o.size) t.fontSize = o.size;
  fill(t, o.color || 'color/fg/default');
  t.name = o.name ? L(o.name) : chars.slice(0, 40);
  if (o.w) {
    t.resize(o.w, t.height);
    t.textAutoResize = 'HEIGHT';
  } else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  if (o.align) t.textAlignHorizontal = o.align === 'center' ? 'CENTER' : o.align === 'end' ? 'RIGHT' : 'LEFT';
  if (o.truncate) t.textTruncation = 'ENDING';
  if (o.prop) t.setPluginData(PROP, 'characters:' + o.prop);
  return t;
}

/** Retângulo ou elipse simples, com cor e raio. */
function shape(name, o) {
  o = o || {};
  var r = o.ellipse ? figma.createEllipse() : figma.createRectangle();
  r.name = L(name);
  r.resize(o.w || 8, o.h || o.w || 8);
  fill(r, o.fill || null);
  if (o.stroke) stroke(r, o.stroke, o.strokeWeight);
  if (!o.ellipse && o.radius !== undefined) radius(r, o.radius);
  return r;
}

/** Marca um nó para expor uma propriedade de componente (visível/instância) depois do conjunto pronto. */
function exposes(node, field, propName) {
  var prev = node.getPluginData(PROP);
  node.setPluginData(PROP, (prev ? prev + '|' : '') + field + ':' + propName);
  return node;
}

/* ───────── Registro (rodar de novo atualiza) ───────── */

/**
 * Páginas do Lume: id ('Componentes') → nome em português ('Lume · Componentes'), traduzido por L().
 * A página guarda o id (pluginData orbita-page); as de versões antigas são achadas pelo nome, em qualquer idioma.
 */
var PAGES = { Fundamentos: 'Lume · Fundamentos', 'Ícones': 'Lume · Ícones', Componentes: 'Lume · Componentes' };

function pageId(page) {
  var id = page.getPluginData(PAGE);
  if (id) return id;
  return Object.keys(PAGES).find(function (k) { return anyLang(PAGES[k]).indexOf(page.name) >= 0; }) || '';
}

async function loadRegistry() {
  for (var page of figma.root.children) {
    var id = pageId(page);
    if (!id || LUME.pages[id]) continue;
    await page.loadAsync();
    LUME.pages[id] = page;
    page.findAll(function (n) { return !!n.getPluginData(KEY); }).forEach(function (n) { LUME.registry[n.getPluginData(KEY)] = n; });
  }
}

function live(key, type) {
  var n = LUME.registry[key];
  if (!n || n.removed) return null;
  if (type && n.type !== type) return null;
  return n;
}

/** Página vazia com o nome padrão do Figma (“Page 1”, “Página 1”): todo arquivo novo traz uma. */
async function blankDefaultPage() {
  for (var p of figma.root.children) {
    if (!/^(Page|Página) \d+$/.test(p.name)) continue;
    await p.loadAsync();
    if (!p.children.length) return p;
  }
  return null;
}

/** createPage com a recusa do plano gratuito explicada (o Figma responde em inglês, com link de preço). */
function addPage() {
  try {
    return figma.createPage();
  } catch (err) {
    if (/Starter plan|\d+ pages/.test(String(err && err.message))) {
      throw new Error(L3(
        'O plano gratuito do Figma aceita 3 páginas por arquivo, e o Lume usa 3 (Fundamentos, Ícones e Componentes). Apague as outras páginas do arquivo, ou use um arquivo novo, e rode de novo.',
        'Figma’s free plan allows 3 pages per file, and Lume uses 3 (Foundations, Icons, and Components). Delete the file’s other pages, or use a new file, and run again.',
        'El plan gratuito de Figma admite 3 páginas por archivo, y Lume usa 3 (Fundamentos, Íconos y Componentes). Borra las otras páginas del archivo, o usa un archivo nuevo, y vuelve a ejecutarlo.',
      ));
    }
    throw err;
  }
}

async function ensurePage(id) {
  var page = LUME.pages[id];
  // a página vazia do arquivo novo vira uma do Lume: o plano gratuito aceita 3 páginas, e o Lume usa 3
  if (!page) page = await blankDefaultPage();
  if (!page) page = addPage();
  page.name = L(PAGES[id]);
  page.setPluginData(PAGE, id);
  await page.loadAsync();
  LUME.pages[id] = page;
  return page;
}

/** Componente avulso ou variante: reaproveita o existente (mesmo id) e refaz o conteúdo. */
function upsertComponent(key, name) {
  var c = live(key, 'COMPONENT');
  if (c) {
    c.children.slice().forEach(function (ch) { ch.remove(); });
    c.effects = [];
    c.strokes = [];
  } else {
    c = figma.createComponent();
    c.setPluginData(KEY, key);
    LUME.registry[key] = c;
  }
  c.name = name;
  c.description = '';
  return c;
}

/**
 * Componente sem variantes. build(comp) monta o conteúdo (use box(name, o, comp) para configurar o layout).
 */
async function component(key, name, build, o) {
  var c = upsertComponent('cmp/' + key, L(name));
  await build(c);
  if (o && o.description) c.description = L(o.description);
  LUME.report.componentes++;
  return c;
}

/**
 * Conjunto de variantes.
 * items: [{ props: { Variante: 'Primário', Tamanho: 'M' }, build: async (comp, props) => {} }]
 * o: { description, columns (variantes por linha), gap, props: { 'Rótulo': ['TEXT', 'Botão'], 'Ícone': ['BOOLEAN', true],
 *      'Trocar ícone': ['INSTANCE_SWAP', 'search'] } }
 */
async function variants(key, name, items, o) {
  o = o || {};
  var comps = [];
  for (var it of items) {
    // a chave usa o português (é a identidade da variante); o nome no Figma vai no idioma ativo
    var vname = Object.keys(it.props).map(function (k) { return k + '=' + it.props[k]; }).join(', ');
    var c = upsertComponent('var/' + key + '/' + vname, variantName(it.props));
    await it.build(c, it.props);
    comps.push(c);
    LUME.report.variantes++;
  }
  var setKey = 'set/' + key;
  var set = live(setKey, 'COMPONENT_SET');
  var stage = figma.currentPage;
  if (set) {
    comps.forEach(function (c) { set.appendChild(c); });
  } else {
    comps.forEach(function (c) { stage.appendChild(c); });
    set = figma.combineAsVariants(comps, stage);
    set.setPluginData(KEY, setKey);
    LUME.registry[setKey] = set;
  }
  set.name = L(name);
  if (o.description) set.description = L(o.description);

  // grade das variantes dentro do conjunto (a borda tracejada roxa é do próprio Figma)
  var gap = o.gap === undefined ? 20 : o.gap;
  var pad = o.pad === undefined ? 24 : o.pad;
  if (o.columns) {
    // matriz: N colunas, cada coluna na largura da maior variante dela, cada linha na altura da maior
    set.layoutMode = 'NONE';
    set.fills = [];
    var cols = o.columns;
    var rowGap = o.rowGap === undefined ? gap : o.rowGap;
    var colW = [];
    var rowH = [];
    comps.forEach(function (c, i) {
      var col = i % cols;
      var r = Math.floor(i / cols);
      colW[col] = Math.max(colW[col] || 0, c.width);
      rowH[r] = Math.max(rowH[r] || 0, c.height);
    });
    var xs = [pad];
    colW.forEach(function (wv, i) { xs[i + 1] = xs[i] + wv + gap; });
    var ys = [pad];
    rowH.forEach(function (hv, i) { ys[i + 1] = ys[i] + hv + rowGap; });
    comps.forEach(function (c, i) {
      var col = i % cols;
      var r = Math.floor(i / cols);
      c.x = xs[col];
      c.y = ys[r] + Math.round((rowH[r] - c.height) / 2);
    });
    set.resize(xs[cols] - gap + pad, ys[rowH.length] - rowGap + pad);
    set.setPluginData('orbita-columns', String(cols));
    set.setPluginData('orbita-grid', JSON.stringify({ xs: xs, ys: ys, colW: colW, rowH: rowH }));
  } else {
    box(name, { dir: 'H', wrap: true, gap: gap, rowGap: o.rowGap === undefined ? 20 : o.rowGap, pad: pad, cross: o.cross || 'center', w: o.width }, set);
  }

  // propriedades de componente (texto, booleano, troca de instância)
  if (o.props) {
    var keys = {};
    Object.keys(o.props).forEach(function (pname) {
      var spec = o.props[pname];
      var defs = set.componentPropertyDefinitions;
      // a propriedade pode ter sido criada em outro idioma: acha por qualquer nome e traduz nome e texto padrão
      var names = anyLang(pname);
      var found = Object.keys(defs).find(function (k) { return names.indexOf(k.split('#')[0]) >= 0 && defs[k].type === spec[0]; });
      if (found) {
        var change = {};
        if (found.split('#')[0] !== Lg(pname)) change.name = Lg(pname);
        if (spec[0] === 'TEXT' && defs[found].defaultValue !== L(spec[1])) change.defaultValue = L(spec[1]);
        keys[pname] = Object.keys(change).length ? set.editComponentProperty(found, change) : found;
        return;
      }
      var def = spec[0] === 'TEXT' ? L(spec[1]) : spec[1];
      var opts;
      if (spec[0] === 'INSTANCE_SWAP') {
        var ic = iconComponent(def);
        def = ic.id;
        opts = { preferredValues: (spec[2] || []).map(function (n) { return { type: 'COMPONENT', key: iconComponent(n).key }; }) };
      }
      keys[pname] = set.addComponentProperty(Lg(pname), spec[0], def, opts);
    });
    // só camadas do próprio componente — nunca as de dentro de uma instância aninhada
    var ownLayer = function (n, c) {
      for (var p = n.parent; p && p !== c; p = p.parent) if (p.type === 'INSTANCE') return false;
      return true;
    };
    comps.forEach(function (c) {
      c.findAll(function (n) { return !!n.getPluginData(PROP) && ownLayer(n, c); }).forEach(function (n) {
        var refs = {};
        n.getPluginData(PROP).split('|').forEach(function (pair) {
          var parts = pair.split(':');
          if (keys[parts[1]]) refs[parts[0]] = keys[parts[1]];
        });
        if (Object.keys(refs).length) {
          n.componentPropertyReferences = refs;
          // a camada ligada a um booleano começa como o padrão da propriedade (escondida se for false)
          if (refs.visible) n.visible = set.componentPropertyDefinitions[refs.visible].defaultValue !== false;
        }
      });
    });
  }
  LUME.report.componentes++;
  return set;
}

/**
 * Matriz rotulada: o conjunto (em colunas fixas) com os nomes das colunas em cima e das linhas à esquerda.
 * Os rótulos ficam fora do conjunto — dentro dele só pode haver variantes.
 */
async function labeledMatrix(set, colLabels, rowLabels) {
  var grid = JSON.parse(set.getPluginData('orbita-grid') || '{}');
  var left = rowLabels ? 132 : 0;
  var top = colLabels ? 32 : 0;
  var frame = box('Matriz · ' + set.name, { dir: 'none' });
  frame.resize(left + set.width, top + set.height);
  if (colLabels) {
    for (var i = 0; i < colLabels.length; i++) {
      var t = await text(colLabels[i], { style: 'caption', color: 'color/fg/subtle' });
      frame.appendChild(t);
      t.x = left + grid.xs[i];
      t.y = 8;
    }
  }
  if (rowLabels) {
    for (var r = 0; r < rowLabels.length; r++) {
      var tr = await text(rowLabels[r], { style: 'caption', color: 'color/fg/subtle', w: left - 16 });
      frame.appendChild(tr);
      tr.x = 0;
      tr.y = top + grid.ys[r] + Math.round(grid.rowH[r] / 2) - 8;
    }
  }
  frame.appendChild(set);
  set.x = left;
  set.y = top;
  return frame;
}

/** Nome da variante no idioma ativo: { Variante: 'Primário' } → 'Variant=Primary'. */
function variantName(props) {
  return Object.keys(props).map(function (k) { return Lg(k) + '=' + LV(k, props[k]); }).join(', ');
}

/** Propriedades de variante no idioma ativo, para setProperties: { Estado: 'Ausente' } → { State: 'Away' }. */
function variantProps(props) {
  var out = {};
  Object.keys(props).forEach(function (k) { out[Lg(k)] = LV(k, props[k]); });
  return out;
}

/** A variante de um conjunto pelo valor das propriedades — para montar exemplos com instâncias. */
function variant(set, props) {
  var want = variantName(props).split(', ');
  var found = set.children.find(function (c) {
    var parts = c.name.split(', ');
    return want.every(function (w) { return parts.indexOf(w) >= 0; });
  });
  if (!found) throw new Error(L3('Variante não encontrada: ', 'Variant not found: ', 'Variante no encontrada: ') + set.name + ' · ' + want.join(', '));
  return found;
}

/** Instância com sobreposições de propriedade (por nome curto: { 'Rótulo': 'Salvar' }). */
function instance(compOrSet, props, overrides) {
  var main = compOrSet.type === 'COMPONENT_SET' ? variant(compOrSet, props || {}) : compOrSet;
  var inst = main.createInstance();
  if (overrides) {
    var defs = inst.componentProperties;
    var map = {};
    Object.keys(overrides).forEach(function (short) {
      var full = Object.keys(defs).find(function (k) { return k.split('#')[0] === Lg(short); });
      if (!full) return;
      var val = overrides[short];
      if (defs[full].type === 'INSTANCE_SWAP') val = iconComponent(val).id;
      else if (defs[full].type === 'TEXT') val = L(val);
      map[full] = val;
    });
    if (Object.keys(map).length) inst.setProperties(map);
  }
  return inst;
}

/* ───────── Ícones ───────── */

var ICON_INDEX = {};
ICONS.forEach(function (i) { ICON_INDEX[i.name] = i; });

/** Componente do ícone (criado sob demanda; a página de Ícones organiza depois). */
// muda quando o jeito de montar o ícone muda: força refazer os ícones na mesma versão do Lume
var ICON_FORMAT = 'contorno';

/** Nome e palavras-chave do ícone no idioma ativo (as camadas também: “Ícone”, “Icon”, “Ícono”). */
function nameIcon(c, def) {
  c.name = L('Ícone') + '/' + def.name;
  c.description = LANG === 'en' ? def.keywordsEn : LANG === 'es' ? def.keywordsEs : def.keywords;
  c.children.forEach(function (ch) { ch.name = ch.name.replace(/^[^·]+/, L('Ícone') + (ch.name.indexOf('·') > 0 ? ' ' : '')); });
  c.setPluginData('orbita-lang', LANG);
}

function iconComponent(name) {
  var key = 'icon/' + name;
  var c = live(key, 'COMPONENT');
  var def = ICON_INDEX[name];
  if (c && c.getPluginData('orbita-built') === META.version + '/' + ICON_FORMAT) {
    // feito nesta versão: em outro idioma, só renomeia (o id e a camada continuam os mesmos)
    if (c.getPluginData('orbita-lang') !== LANG && def) nameIcon(c, def);
    return c;
  }
  if (!def) throw new Error(L3('Ícone não encontrado: ', 'Icon not found: ', 'Ícono no encontrado: ') + name);
  if (!c) {
    c = figma.createComponent();
    c.setPluginData(KEY, key);
    LUME.registry[key] = c;
    var holder = LUME.pages['Ícones'] || figma.currentPage;
    holder.appendChild(c);
  } else c.children.slice().forEach(function (ch) { ch.remove(); });
  c.resize(24, 24);
  c.fills = [];
  c.clipsContent = false;
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    def.body.replace(/currentColor/g, '#000000') + '</svg>';
  var frame = figma.createNodeFromSvg(svg);
  frame.children.slice().forEach(function (child) { c.appendChild(child); });
  frame.remove();
  // Uma camada só, “Ícone”, com o traço em contorno. Na troca de ícone o Figma leva a cor
  // para a camada de mesmo nome e posição: com uma camada só, a cor passa inteira para qualquer
  // ícone — e um preenchimento nunca vaza para um ícone de traço.
  var parts = [];
  var cx = c.absoluteTransform[0][2];
  var cy = c.absoluteTransform[1][2];
  var collect = function (n) {
    if (n.type === 'GROUP') { n.children.slice().forEach(collect); return; }
    if (n.strokes && n.strokes.length) {
      // o contorno nasce solto na página (e na origem, se a forma estava num grupo):
      // recoloca pela posição da forma, menos meio traço — pontas e junções são redondas
      var half = n.strokeWeight / 2;
      var nx = n.absoluteTransform[0][2] - cx - half;
      var ny = n.absoluteTransform[1][2] - cy - half;
      var o = n.outlineStroke();
      if (o) { c.appendChild(o); o.x = nx; o.y = ny; parts.push(o); }
    }
    if (n.fills && n.fills.length) { n.strokes = []; c.appendChild(n); parts.push(n); }
  };
  c.children.slice().forEach(collect);
  if (!parts.length) throw new Error(L3('Ícone sem forma: ', 'Icon without a shape: ', 'Ícono sin forma: ') + name);
  // uma camada por opacidade (só o heatmap tem células a 35% e 70%); a cheia é sempre “Ícone”
  var byOpacity = {};
  parts.forEach(function (p) {
    var op = p.fills && p.fills[0] && p.fills[0].opacity !== undefined ? p.fills[0].opacity : 1;
    var k = String(Math.round(op * 100));
    (byOpacity[k] = byOpacity[k] || []).push(p);
  });
  var keep = Object.keys(byOpacity).sort(function (a, b) { return b - a; }).map(function (k) {
    var v = figma.flatten([figma.union(byOpacity[k], c)], c);
    v.name = k === '100' ? 'Ícone' : 'Ícone · ' + k + '%';
    v.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: Number(k) / 100 }];
    v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    return v;
  });
  c.children.slice().forEach(function (ch) { if (keep.indexOf(ch) < 0) ch.remove(); });
  nameIcon(c, def);
  colorIcon(c, 'color/fg/default');
  c.setPluginData('orbita-built', META.version + '/' + ICON_FORMAT);
  LUME.report.icones++;
  return c;
}

/** Pinta os traços e preenchimentos do ícone com uma variável (funciona em instâncias também). */
function colorIcon(node, name) {
  node.findAll(function (n) { return n.type === 'VECTOR' || n.type === 'ELLIPSE' || n.type === 'RECTANGLE' || n.type === 'BOOLEAN_OPERATION' || n.type === 'LINE' || n.type === 'POLYGON'; }).forEach(function (n) {
    if (n.strokes && n.strokes.length) n.strokes = [paint(name)];
    if (n.fills && n.fills.length) {
      var op = n.fills[0].opacity;
      setPaints(n, 'fills', [paint(name, op === undefined ? 1 : op)]);
    }
  });
  return node;
}

/** Instância de ícone no tamanho e na cor pedidos. */
function icon(name, size, color) {
  var inst = iconComponent(name).createInstance();
  inst.name = name;
  if (size && size !== 24) inst.rescale(size / 24);
  if (color) colorIcon(inst, color);
  return inst;
}

/* ───────── Blocos de documentação ───────── */

var BLOCK_W = 1120;
var BLOCKS = [];

/**
 * Registra um bloco. def: { id, page: 'Componentes'|'Fundamentos', row, order, group, title, description, tags, build }
 * build(ctx) devolve { sections: [...], previews?: { light, dark, caption } } — ver docBlock.
 */
function defineBlock(def) {
  BLOCKS.push(def);
}

/** Tira do bloco antigo tudo que é componente (para sobreviver à reconstrução) e apaga o resto. */
function clearBlock(key) {
  var old = live(key);
  if (!old) return;
  var page = old.parent;
  old.findAll(function (n) { return (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && !!n.getPluginData(KEY) && n.parent && n.parent.type !== 'COMPONENT_SET'; })
    .forEach(function (n) { page.appendChild(n); });
  old.remove();
}

/**
 * Monta o bloco: cabeçalho escuro (grupo, título, descrição, tags) + seções em duas colunas.
 * section: { title, description, node, span: 1|2, frame: true (moldura neutra em volta), mode: 'Claro'|'Escuro' }
 */
async function docBlock(def, content) {
  var key = 'block/' + def.id;
  clearBlock(key);
  var w = def.width || BLOCK_W;
  var block = box('Lume · ' + def.title, { dir: 'V', gap: 0, pad: 14, w: w, fill: 'color/bg/app', radius: 36 });
  block.setPluginData(KEY, key);
  block.setPluginData('orbita-row', def.row || '');
  block.setPluginData('orbita-order', String(def.order || 0));
  LUME.registry[key] = block;
  setMode(block, 'Claro');

  // cabeçalho: primitivas de propósito — escuro nos dois modos, como uma capa
  var head = box('Cabeçalho', { dir: 'V', gap: 10, pad: [36, 40, 36, 40], fill: 'color/neutral/950', radius: 24 });
  add(block, head, { fillW: true });
  add(head, await text(L(def.group).toUpperCase(), { style: 'overline', color: 'color/brand/400', name: 'Grupo', raw: true }));
  add(head, await text(def.title, { style: 'heading-xl', color: 'color/neutral/50', name: 'Título' }));
  var row = box('Descrição e tags', { dir: 'H', gap: 24, cross: 'end', align: 'between' });
  add(head, row, { fillW: true });
  // a descrição ocupa o que sobra: com três tags ela encolhe em vez de empurrar as tags para fora
  add(row, await text(def.description, { style: 'body-sm', color: 'color/neutral/400', w: w - 14 * 2 - 80 - 260, name: 'Descrição' }), { grow: true });
  var tags = box('Tags', { dir: 'H', gap: 8 });
  for (var t of def.tags || ['Componente', 'Claro · Escuro']) {
    if (t === 'Claro · Escuro') t = LUME.active.join(' · ');
    var pill = box('Tag', { dir: 'H', pad: [5, 12], radius: 'radius/full', fill: 'color/neutral/900', stroke: 'color/neutral/800' });
    add(pill, await text(t, { style: 'caption', color: 'color/neutral/300' }));
    add(tags, pill);
  }
  add(row, tags);

  // corpo: seções em grade de duas colunas
  var inner = w - 14 * 2;
  var padX = 40;
  var colGap = 48;
  var colW = Math.floor((inner - padX * 2 - colGap) / 2);
  var body = box('Seções', { dir: 'H', wrap: true, gap: colGap, rowGap: 56, pad: [48, padX, 48, padX] });
  add(block, body, { fillW: true });

  for (var s of content.sections) {
    var sw = s.span === 2 ? inner - padX * 2 : colW;
    var sec = box(s.title, { dir: 'V', gap: 16, w: sw });
    var label = box('Título da seção', { dir: 'V', gap: 2 });
    add(label, await text(s.title, { style: 'heading-xs', color: 'color/fg/default' }));
    if (s.description) add(label, await text(s.description, { style: 'body-sm', color: 'color/fg/subtle', w: sw }));
    add(sec, label, { fillW: true });
    var node = typeof s.node === 'function' ? await s.node(sw) : s.node;
    if (s.mode || s.frame) {
      var stage = box(s.mode ? 'Modo ' + s.mode : 'Exemplo', { dir: 'V', gap: s.gap === undefined ? 16 : s.gap, pad: s.pad === undefined ? 32 : s.pad, fill: 'color/bg/canvas', stroke: 'color/border/subtle', radius: 24, cross: s.cross || 'start' });
      if (s.mode) setMode(stage, s.mode);
      add(sec, stage, { fillW: true });
      [].concat(node).forEach(function (n) { if (n) add(stage, n, { fillW: !!s.fillChildren }); });
    } else if (node) {
      add(sec, node);
      if (node.type === 'COMPONENT_SET') {
        // sem colunas fixas, o conjunto ocupa a largura da seção e as variantes quebram linha
        if (!node.getPluginData('orbita-columns')) { node.resize(sw, Math.max(1, node.height)); node.primaryAxisSizingMode = 'FIXED'; }
      } else if (s.fill !== false) node.layoutSizingHorizontal = 'FILL';
    }
    add(body, sec);
  }
  LUME.report.blocos++;
  return block;
}

/** Seções finais: o mesmo exemplo em cada modo escolhido das variáveis (Claro e Escuro, ou um só). */
function themed(title, build, o) {
  o = o || {};
  var both = LUME.active.length > 1;
  return LUME.active.map(function (mode) {
    var description = mode === 'Claro'
      ? o.light || 'Modo Claro das variáveis'
      : o.dark || (both ? 'O mesmo componente no modo Escuro' : 'Modo Escuro das variáveis');
    return { title: mode, description: description, mode: mode, node: build, cross: o.cross, pad: o.pad, gap: o.gap, fillChildren: o.fillChildren };
  });
}
