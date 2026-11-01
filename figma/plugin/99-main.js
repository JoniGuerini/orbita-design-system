/**
 * Órbita para Figma — orquestração: variáveis → fontes → páginas → blocos → arrumação na página.
 * A UI (ui.html) escolhe o que gerar; sem UI (testes), gera tudo.
 */

/** Ordem das linhas em cada página: cada linha é uma categoria, com os blocos lado a lado. */
var ROWS = {
  Fundamentos: ['Fundamentos'],
  'Ícones': ['Ícones'],
  Componentes: ['Ações', 'Formulário', 'Navegação', 'Feedback', 'Dados e conteúdo', 'Gráficos', 'Padrões'],
};

var GAP_X = 96;
var GAP_Y = 200;

function say(msg) {
  ORB.progress(msg);
}

/** Fundo escuro da página, como uma mesa de trabalho (primitiva fixa: páginas não usam variáveis). */
function pageBackground(page) {
  var hex = null;
  DATA.collections.forEach(function (c) {
    if (c.name !== 'Primitivas') return;
    c.variables.forEach(function (v) { if (v.name === 'color/neutral/975') hex = v.values[c.modes[0]]; });
  });
  if (!hex) return;
  var rgb = hexToRgba(hex);
  page.backgrounds = [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: 1, visible: true, blendMode: 'NORMAL' }];
}

/** Título de linha no canvas (fora dos blocos), recriado a cada execução. */
async function rowTitle(page, key, label, count) {
  var old = live(key);
  if (old) old.remove();
  var t = box('Categoria · ' + label, { dir: 'V', gap: 6 });
  t.setPluginData(KEY, key);
  ORB.registry[key] = t;
  add(t, await text(label, { style: 'display-sm', color: 'color/neutral/300' }));
  add(t, await text(count + (count === 1 ? L3(' bloco', ' block', ' bloque') : L3(' blocos', ' blocks', ' bloques')), { style: 'body-md', color: 'color/neutral/600', raw: true }));
  page.appendChild(t);
  return t;
}

/** Data de geração dos tokens no formato de cada idioma. */
function generatedOn() {
  var p = META.generatedAt.slice(0, 10).split('-');
  var months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
  return LANG === 'en' ? months[Number(p[1]) - 1] + ' ' + Number(p[2]) + ', ' + p[0] : p[2] + '/' + p[1] + '/' + p[0];
}

/** Capa da página Componentes: o que é, versão, como usar. */
async function cover(page, id) {
  var key = 'cover/' + id;
  // versões anteriores guardavam a capa pelo nome da página
  [key, 'cover/' + PAGES[id]].forEach(function (k) {
    var old = live(k);
    if (old) old.remove();
  });
  var c = box('Órbita · Capa', { dir: 'V', gap: 20, pad: [56, 64], w: 1120, fill: 'color/neutral/950', radius: 36 });
  c.setPluginData(KEY, key);
  ORB.registry[key] = c;
  add(c, await text('ÓRBITA DESIGN SYSTEM · ' + META.version, { style: 'overline', color: 'color/brand/400', raw: true }));
  add(c, await text(id, { style: 'display-md', color: 'color/neutral/50' }));
  var modes = ORB.active.length > 1
    ? L3('nos modos Claro e Escuro', 'in Light and Dark modes', 'en los modos Claro y Oscuro')
    : L3('no modo ', 'in ', 'en el modo ') + L(ORB.active[0]) + L3('', ' mode', '');
  var intro = L3(
    'Cada bloco é um componente: o conjunto de variantes, exemplos montados com instâncias e o mesmo exemplo {modos}. Cores, medidas e textos vêm das variáveis e dos estilos do arquivo.',
    'Each block is a component: the variant set, examples built with instances, and the same example {modos}. Colors, sizes, and text come from the file’s variables and styles.',
    'Cada bloque es un componente: el conjunto de variantes, ejemplos armados con instancias y el mismo ejemplo {modos}. Colores, medidas y textos vienen de las variables y los estilos del archivo.',
  );
  add(c, await text(intro.replace('{modos}', modes), { style: 'body-lg', color: 'color/neutral/400', w: 880, raw: true }));
  var facts = box('Fatos', { dir: 'H', gap: 40, pad: [12, 0, 0, 0] });
  // contado na própria página: vale também quando os blocos foram gerados em partes
  var sets = page.findAll(function (n) { return n.type === 'COMPONENT_SET'; });
  var variantCount = sets.reduce(function (a, st) { return a + st.children.length; }, 0);
  var loose = page.findAll(function (n) { return n.type === 'COMPONENT' && n.parent && n.parent.type !== 'COMPONENT_SET'; }).length;
  var stats = [
    [String(sets.length + loose), 'componentes e conjuntos'],
    [String(variantCount), 'variantes'],
    [String(META.iconCount || ICONS.length), 'ícones'],
    [generatedOn(), 'gerado em'],
  ];
  for (var s of stats) {
    var f = box('Fato', { dir: 'V', gap: 2 });
    add(f, await text(s[0], { style: 'heading-lg', color: 'color/neutral/100', raw: true }));
    add(f, await text(s[1], { style: 'caption', color: 'color/neutral/500' }));
    add(facts, f);
  }
  add(c, facts);
  page.appendChild(c);
  return c;
}

/** Arruma blocos e títulos: uma linha por categoria, blocos alinhados pelo topo. */
async function arrange(page, pageId, built) {
  var y = 0;
  if (pageId === 'Componentes') {
    var cv = await cover(page, pageId);
    cv.x = 0;
    cv.y = 0;
    y = cv.height + GAP_Y;
  }
  for (var row of ROWS[pageId]) {
    var blocks = built.filter(function (b) { return b.def.row === row; });
    if (!blocks.length) continue;
    var title = await rowTitle(page, 'row/' + pageId + '/' + row, row, blocks.length);
    title.x = 0;
    title.y = y;
    y += title.height + 48;
    var x = 0;
    var tallest = 0;
    blocks.sort(function (a, b) { return (a.def.order || 0) - (b.def.order || 0); });
    blocks.forEach(function (b) {
      b.node.x = x;
      b.node.y = y;
      x += b.node.width + GAP_X;
      tallest = Math.max(tallest, b.node.height);
    });
    y += tallest + GAP_Y;
  }
  // o que sobrou fora da página (componentes soltos de execuções antigas) vai para baixo
  page.children.forEach(function (n) {
    if ((n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') && n.getPluginData(KEY) && n.getPluginData(KEY).indexOf('icon/') !== 0) {
      n.x = 0;
      n.y = y;
      y += n.height + 48;
    }
  });
}

async function main(options) {
  options = options || {};
  setLang(options.locale || 'pt-BR');
  var wanted = options.pages || ['Fundamentos', 'Ícones', 'Componentes'];
  var chosen = options.modes && options.modes.length ? options.modes : ['Claro', 'Escuro'];
  ORB.active = ['Claro', 'Escuro'].filter(function (m) { return chosen.indexOf(m) >= 0; });

  say(L3('Lendo o arquivo…', 'Reading the file…', 'Leyendo el archivo…'));
  await loadRegistry();

  say(L3('Variáveis e estilos…', 'Variables and styles…', 'Variables y estilos…'));
  await importTokens();
  await loadFonts();

  // a página de ícones vem primeiro: os outros componentes usam os ícones
  for (var k of Object.keys(PAGES)) await ensurePage(k);

  var order = ['Ícones', 'Fundamentos', 'Componentes'];
  for (var pageId of order) {
    if (wanted.indexOf(pageId) < 0 && pageId !== 'Ícones') continue;
    var page = ORB.pages[pageId];
    await figma.setCurrentPageAsync(page);
    pageBackground(page);
    if (pageId === 'Ícones' && wanted.indexOf('Ícones') < 0) {
      // sem gerar a página de ícones, os componentes de ícone ainda precisam existir
      ICONS.forEach(function (i) { iconComponent(i.name); });
      continue;
    }
    var defs = BLOCKS.filter(function (b) { return b.page === pageId; });
    var built = [];
    for (var def of defs) {
      say(L(pageId) + ' · ' + L(def.title) + '…');
      ORB.block = def.id;
      try {
        var content = await def.build({ page: page });
        var node = await docBlock(def, content);
        page.appendChild(node);
        built.push({ def: def, node: node });
      } catch (err) {
        warn(L3('Bloco “', 'Block “', 'Bloque “') + L(def.title) + L3('” falhou: ', '” failed: ', '” falló: ') + (err && err.message ? err.message : err));
        if (options.strict) throw err;
      }
    }
    ORB.block = 'arrumação';
    await arrange(page, pageId, built);
  }

  // ícones que esta execução não tocou (geração em partes) também vão para o idioma ativo
  ICONS.forEach(function (i) {
    var ic = live('icon/' + i.name, 'COMPONENT');
    if (ic && ic.getPluginData('orbita-lang') !== LANG) nameIcon(ic, i);
  });

  var first = ORB.pages[wanted[wanted.length - 1]] || ORB.pages.Componentes;
  await figma.setCurrentPageAsync(first);
  var r = ORB.report;
  var counts = L3(
    r.blocos + ' blocos, ' + r.componentes + ' componentes (' + r.variantes + ' variantes), ' + r.icones + ' ícones, ' + r.variaveis + ' variáveis',
    r.blocos + ' blocks, ' + r.componentes + ' components (' + r.variantes + ' variants), ' + r.icones + ' icons, ' + r.variaveis + ' variables',
    r.blocos + ' bloques, ' + r.componentes + ' componentes (' + r.variantes + ' variantes), ' + r.icones + ' íconos, ' + r.variaveis + ' variables',
  );
  var only = L3(', só no modo ', ', ', ', solo en el modo ') + L(ORB.active[0]) + L3('.', ' mode only.', '.');
  return 'Órbita: ' + counts + (ORB.active.length > 1 ? '.' : only) +
    (r.avisos.length ? L3(' Avisos: ', ' Warnings: ', ' Avisos: ') + r.avisos.join(' · ') : '');
}

/* ───────── Entrada ───────── */

if (typeof __ORBITA_TEST__ === 'undefined') {
  if (typeof __html__ !== 'undefined') {
    figma.showUI(__html__, { width: 380, height: 780, themeColors: true });
    ORB.progress = function (msg) { figma.ui.postMessage({ type: 'progress', message: msg }); };
    // modos e idioma ficam guardados neste computador: num arquivo de plano gratuito, não precisa escolher toda vez
    Promise.all([figma.clientStorage.getAsync('orbita-modes'), figma.clientStorage.getAsync('orbita-locale')]).then(function (saved) {
      figma.ui.postMessage({ type: 'init', modes: saved[0] || null, locale: saved[1] || 'system' });
    });
    figma.ui.onmessage = function (msg) {
      if (msg.type === 'cancel') return figma.closePlugin();
      if (msg.type === 'locale') return figma.clientStorage.setAsync('orbita-locale', msg.preference);
      if (msg.type !== 'run') return;
      figma.clientStorage.setAsync('orbita-modes', msg.modes);
      main({ pages: msg.pages, modes: msg.modes, locale: msg.locale }).then(function (summary) {
        figma.ui.postMessage({ type: 'done', message: summary });
        figma.notify(summary, { timeout: 8000 });
      }).catch(function (err) {
        figma.ui.postMessage({ type: 'error', message: String(err && err.message ? err.message : err) });
      });
    };
  } else {
    main({}).then(function (summary) { figma.closePlugin(summary); }).catch(function (err) { figma.closePlugin(L3('Órbita: erro — ', 'Órbita: error — ', 'Órbita: error — ') + err.message); });
  }
}
