/**
 * Gráficos: Barras, Linhas e áreas, Rosca e Heatmap — exemplos documentados como componentes.
 * Marcas só com variáveis de gráfico (color/chart/*); textos (eixo, rótulos, valores) sempre em fg.
 * Regras de ds/components/chart.css: barra ≤ 24 px com ponta de 4 px e base reta, linha de 2 px,
 * 2 px entre segmentos, grade de 1 px sólida, tracejado só para meta.
 */
(function () {
  var CARD_W = 448;
  var PLOT_W = CARD_W - 48;
  var MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  var S = function (n) { return 'color/chart/series/' + n; };

  /* ───────── Peças ───────── */

  function put(parent, node, x, y) {
    parent.appendChild(node);
    node.x = Math.round(x * 100) / 100;
    node.y = Math.round(y * 100) / 100;
    return node;
  }

  function plotArea(name, w, h) {
    var f = box(name, { dir: 'none' });
    f.resize(w, h);
    f.clipsContent = false;
    return f;
  }

  /** Grade horizontal + marcas do eixo y. y(v) devolve a coordenada; ticks em valores. */
  async function yGrid(area, ticks, y, left, width, format) {
    for (var t of ticks) {
      var line = shape(t === 0 ? 'Linha de base' : 'Grade', { w: width, h: 1, fill: t === 0 ? 'color/chart/axis' : 'color/chart/grid' });
      put(area, line, left, Math.round(y(t)));
      var label = await text(format(t), { style: 'caption', color: 'color/fg/subtle', w: left - 10, align: 'end', name: 'Marca ' + t });
      put(area, label, 0, Math.round(y(t)) - 8);
    }
  }

  /** Rótulos do eixo x, centrados no meio de cada faixa (de step em step). */
  async function xLabels(area, labels, left, band, y, step) {
    for (var i = 0; i < labels.length; i += step) {
      var t = await text(labels[i], { style: 'caption', color: 'color/fg/subtle', w: Math.round(band * step), align: 'center', name: 'Rótulo ' + labels[i] });
      put(area, t, left + i * band + band / 2 - (band * step) / 2, y);
    }
  }

  /** Barra com a ponta de dados arredondada (4 px) e base reta, já posicionada na área. */
  function bar(area, name, x, y, w, h, color, end) {
    var r = shape(name, { w: Math.max(1, w), h: Math.max(1, h), fill: color });
    var across = end === 'right' || end === 'left';
    var rr = Math.min(4, across ? h / 2 : w / 2, across ? w : h);
    if (end === 'top') { r.topLeftRadius = rr; r.topRightRadius = rr; }
    if (end === 'right') { r.topRightRadius = rr; r.bottomRightRadius = rr; }
    if (end === 'left') { r.topLeftRadius = rr; r.bottomLeftRadius = rr; }
    return put(area, r, x, y);
  }

  /** 9260 → "9.260" (sem depender de Intl no sandbox do Figma). */
  function thousands(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /** Legenda: a chave espelha a marca (retângulo, traço ou ponto) e o nome fica em fg/muted. */
  async function legend(items, mark) {
    var row = box('Legenda', { dir: 'H', gap: 16, wrap: true, rowGap: 6, cross: 'center' });
    for (var it of items) {
      var item = box(it[0], { dir: 'H', gap: 8, cross: 'center' });
      var key = mark === 'line' ? shape('Chave', { w: 14, h: 2, fill: it[1], radius: 1 }) : mark === 'dot' ? shape('Chave', { ellipse: true, w: 8, h: 8, fill: it[1] }) : shape('Chave', { w: 10, h: 10, fill: it[1], radius: 3 });
      add(item, key);
      add(item, await text(it[0], { style: 'label-sm', color: 'color/fg/muted' }));
      add(row, item);
    }
    return row;
  }

  /** Moldura do gráfico (.ds-chart--card): título, subtítulo, ação de tabela, legenda opcional e o desenho. */
  async function chartCard(c, title, subtitle, legendNode, plot, width) {
    box(c.name, { dir: 'V', gap: 16, pad: [20, 24, 24, 24], w: width || CARD_W, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' }, c);
    var head = box('Cabeçalho', { dir: 'H', gap: 16, align: 'between' });
    var titles = box('Títulos', { dir: 'V', gap: 2 });
    add(titles, await text(title, { style: 'heading-xs', color: 'color/fg/default', prop: 'Título', name: 'Título' }));
    add(titles, await text(subtitle, { style: 'body-sm', color: 'color/fg/subtle', prop: 'Subtítulo', name: 'Subtítulo' }));
    add(head, titles);
    var toggle = box('Ver como tabela', { dir: 'H', align: 'center', cross: 'center', w: 32, h: 32, radius: 'radius/sm' });
    add(toggle, icon('table', 16, 'color/fg/muted'));
    add(head, toggle);
    add(c, head, { fillW: true });
    if (legendNode) add(c, legendNode, { fillW: true });
    add(c, plot);
  }

  /** Vetor a partir de um caminho no espaço 24 × 24, esticado para w × h (os traços não engrossam). */
  function vectorPath(name, d, w, h, o) {
    o = o || {};
    var attrs = o.area ? 'fill="#000000" fill-opacity="' + (o.opacity || 0.1) + '" stroke="none"' : 'fill="none" stroke="#000000" stroke-width="' + (o.weight || 2) + '" stroke-linecap="round" stroke-linejoin="round"';
    var svg = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="' + d + '" ' + attrs + '/></svg>');
    svg.name = name;
    svg.fills = [];
    svg.clipsContent = false;
    svg.children.forEach(function (ch) { ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; });
    colorIcon(svg, o.color);
    svg.resize(w, h);
    return svg;
  }

  var r2 = function (v) { return Math.round(v * 100) / 100; };

  /* ───────── Barras ───────── */

  var REVENUE = [82, 91, 88, 104, 112, 98, 120, 131, 126, 140, 152, 149];
  var CHANNELS = [['App', [30, 35, 41, 44, 52, 60]], ['Loja', [40, 42, 38, 50, 55, 52]], ['Site', [20, 18, 22, 25, 24, 28]]];
  var TEAMS = [['Pagamentos', 48], ['Cartões', 41], ['Investimentos', 33], ['Seguros', 27], ['Empréstimos', 19]];

  async function columnsPlot() {
    var H = 200, left = 36, top = 18, bottom = 24;
    var pw = PLOT_W - left - 4, ph = H - top - bottom;
    var area = plotArea('Área do gráfico', PLOT_W, H);
    var y = function (v) { return top + ph - (v / 200) * ph; };
    await yGrid(area, [0, 50, 100, 150, 200], y, left, pw, function (t) { return String(t); });
    var band = pw / 12;
    var bw = Math.min(24, Math.round(band * 0.56));
    var peak = REVENUE.indexOf(Math.max.apply(null, REVENUE));
    REVENUE.forEach(function (v, i) {
      var x = left + i * band + (band - bw) / 2;
      bar(area, 'Barra ' + MONTHS[i], r2(x), r2(y(v)), bw, r2(y(0) - y(v)), S(1), 'top');
    });
    var val = await text('R$ 152 mil', { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default', w: 90, align: 'center', name: 'Valor no maior' });
    put(area, val, left + peak * band + band / 2 - 45, y(REVENUE[peak]) - 22);
    await xLabels(area, MONTHS, left, band, top + ph + 6, 2);
    return area;
  }

  async function groupedPlot(stacked) {
    var H = 200, left = 36, top = 10, bottom = 24;
    var pw = PLOT_W - left - 4, ph = H - top - bottom;
    var area = plotArea('Área do gráfico', PLOT_W, H);
    var max = stacked ? 150 : 60;
    var ticks = stacked ? [0, 50, 100, 150] : [0, 20, 40, 60];
    var y = function (v) { return top + ph - (v / max) * ph; };
    await yGrid(area, ticks, y, left, pw, function (t) { return String(t); });
    var band = pw / 6;
    for (var i = 0; i < 6; i++) {
      if (stacked) {
        var bw = Math.min(24, Math.round(band * 0.56));
        var x = left + i * band + (band - bw) / 2;
        var cum = 0;
        for (var j = 0; j < CHANNELS.length; j++) {
          var v = CHANNELS[j][1][i];
          var y1 = y(cum + v);
          var y0 = y(cum) - (j > 0 ? 2 : 0); // 2 px de respiro entre segmentos
          cum += v;
          bar(area, CHANNELS[j][0] + ' ' + MONTHS[i], r2(x), r2(y1), bw, r2(y0 - y1), S(j + 1), j === CHANNELS.length - 1 ? 'top' : 'none');
        }
      } else {
        var k = CHANNELS.length;
        var w = Math.min(24, Math.floor((band * 0.72 - (k - 1) * 2) / k));
        var gx = left + i * band + (band - (k * w + (k - 1) * 2)) / 2;
        for (var s = 0; s < k; s++) {
          var vv = CHANNELS[s][1][i];
          bar(area, CHANNELS[s][0] + ' ' + MONTHS[i], r2(gx + s * (w + 2)), r2(y(vv)), w, r2(y(0) - y(vv)), S(s + 1), 'top');
        }
      }
    }
    await xLabels(area, MONTHS.slice(0, 6), left, band, top + ph + 6, 1);
    return area;
  }

  async function horizontalPlot() {
    var rowH = 36, thick = 20, labelW = 96;
    var H = TEAMS.length * rowH;
    var area = plotArea('Área do gráfico', PLOT_W, H);
    var x0 = labelW + 8;
    var maxW = PLOT_W - x0 - 40;
    put(area, shape('Linha de base', { w: 1, h: H, fill: 'color/chart/axis' }), x0, 0);
    for (var i = 0; i < TEAMS.length; i++) {
      var t = TEAMS[i];
      var cy = i * rowH + rowH / 2;
      var label = await text(t[0], { style: 'label-sm', color: 'color/fg/muted', w: labelW, align: 'end' });
      put(area, label, 0, cy - 9);
      var w = Math.round((t[1] / 50) * maxW);
      bar(area, 'Barra ' + t[0], x0 + 1, cy - thick / 2, w, thick, S(1), 'right');
      var val = await text(String(t[1]), { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' });
      put(area, val, x0 + 1 + w + 6, cy - 9);
    }
    return area;
  }

  /** 100%: a parte de cada canal no total do mês — o eixo vai de 0 a 100%. */
  async function percentPlot() {
    var H = 200, left = 40, top = 10, bottom = 24;
    var pw = PLOT_W - left - 4, ph = H - top - bottom;
    var area = plotArea('Área do gráfico', PLOT_W, H);
    var y = function (v) { return top + ph - v * ph; };
    await yGrid(area, [0, 0.25, 0.5, 0.75, 1], y, left, pw, function (t) { return Math.round(t * 100) + '%'; });
    var band = pw / 6;
    var bw = Math.min(24, Math.round(band * 0.56));
    for (var i = 0; i < 6; i++) {
      var total = CHANNELS.reduce(function (a, ch) { return a + ch[1][i]; }, 0);
      var x = left + i * band + (band - bw) / 2;
      var cum = 0;
      for (var j = 0; j < CHANNELS.length; j++) {
        var share = CHANNELS[j][1][i] / total;
        var y1 = y(cum + share);
        var y0 = y(cum) - (j > 0 ? 2 : 0);
        cum += share;
        bar(area, CHANNELS[j][0] + ' ' + MONTHS[i], r2(x), r2(y1), bw, r2(y0 - y1), S(j + 1), j === CHANNELS.length - 1 ? 'top' : 'none');
      }
    }
    await xLabels(area, MONTHS.slice(0, 6), left, band, top + ph + 6, 1);
    return area;
  }

  var NPS = [['Norte', -6], ['Nordeste', 4], ['Centro-Oeste', -2], ['Sudeste', 9], ['Sul', 5]];

  /** Divergentes: acima e abaixo de zero nos dois polos de color/chart/div, a partir de uma linha central. */
  async function divergingPlot() {
    var rowH = 36, thick = 20, labelW = 96;
    var rowsH = NPS.length * rowH;
    var area = plotArea('Área do gráfico', PLOT_W, rowsH + 22);
    var x0 = labelW + 8;
    var mid = Math.round(x0 + (PLOT_W - x0) / 2);
    var reach = (PLOT_W - x0) / 2 - 32;
    put(area, shape('Linha de base', { w: 1, h: rowsH, fill: 'color/chart/axis' }), mid, 0);
    for (var i = 0; i < NPS.length; i++) {
      var n = NPS[i];
      var cy = i * rowH + rowH / 2;
      put(area, await text(n[0], { style: 'label-sm', color: 'color/fg/muted', w: labelW, align: 'end' }), 0, cy - 9);
      var neg = n[1] < 0;
      var w = Math.max(2, Math.round((Math.abs(n[1]) / 10) * reach));
      bar(area, 'Barra ' + n[0], neg ? mid - w : mid + 1, cy - thick / 2, w, thick, neg ? 'color/chart/div/2' : 'color/chart/div/6', neg ? 'left' : 'right');
      var val = await text((neg ? '−' : '+') + Math.abs(n[1]), { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' });
      put(area, val, neg ? mid - w - 6 - val.width : mid + 1 + w + 6, cy - 9);
    }
    var below = await text('← Abaixo da meta', { style: 'caption', color: 'color/fg/subtle' });
    put(area, below, x0, rowsH + 6);
    var above = await text('Acima da meta →', { style: 'caption', color: 'color/fg/subtle' });
    put(area, above, PLOT_W - above.width, rowsH + 6);
    return area;
  }

  var FUNNEL = [['Visitaram', 12400], ['Criaram conta', 6800], ['Ativaram', 4100], ['Primeira compra', 2300], ['Recorrentes', 1150]];

  /** Funil: etapas em sequência numa rampa de um tom (color/chart/ord), com a conversão da etapa anterior. */
  async function funnelPlot() {
    var rowH = 40, thick = 24, labelW = 112;
    var area = plotArea('Área do gráfico', PLOT_W, FUNNEL.length * rowH);
    var x0 = labelW + 8;
    var maxW = PLOT_W - x0 - 104;
    put(area, shape('Linha de base', { w: 1, h: FUNNEL.length * rowH, fill: 'color/chart/axis' }), x0, 0);
    for (var i = 0; i < FUNNEL.length; i++) {
      var f = FUNNEL[i];
      var cy = i * rowH + rowH / 2;
      put(area, await text(f[0], { style: 'label-sm', color: 'color/fg/muted', w: labelW, align: 'end' }), 0, cy - 9);
      var w = Math.max(4, Math.round((f[1] / FUNNEL[0][1]) * maxW));
      var step = Math.round((i / (FUNNEL.length - 1)) * 4);
      bar(area, 'Etapa ' + f[0], x0 + 1, cy - thick / 2, w, thick, 'color/chart/ord/' + (5 - step), 'right');
      var val = box('Valor', { dir: 'H', gap: 6, cross: 'center' });
      add(val, await text(thousands(f[1]), { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' }));
      if (i) add(val, await text(Math.round((f[1] / FUNNEL[i - 1][1]) * 100) + '%', { style: 'caption', color: 'color/fg/subtle' }));
      put(area, val, x0 + 1 + w + 8, cy - 9);
    }
    return area;
  }

  var G = {};

  async function barsSet() {
    if (G.bars && !G.bars.removed) return G.bars;
    var items = [
      { props: { Tipo: 'Colunas' }, build: async function (c) { await chartCard(c, 'Receita por mês', 'Em R$ mil · 2026', null, await columnsPlot()); } },
      { props: { Tipo: 'Agrupadas' }, build: async function (c) { await chartCard(c, 'Vendas por canal', 'Mil unidades · 1º semestre', await legend(CHANNELS.map(function (ch, i) { return [ch[0], S(i + 1)]; }), 'rect'), await groupedPlot(false)); } },
      { props: { Tipo: 'Empilhadas' }, build: async function (c) { await chartCard(c, 'Vendas por canal', 'Mil unidades · total por mês', await legend(CHANNELS.map(function (ch, i) { return [ch[0], S(i + 1)]; }), 'rect'), await groupedPlot(true)); } },
      { props: { Tipo: 'Horizontais' }, build: async function (c) { await chartCard(c, 'Entregas por time', 'Trimestre · valor na ponta, sem eixo', null, await horizontalPlot()); } },
      { props: { Tipo: '100%' }, build: async function (c) { await chartCard(c, 'Vendas por canal', 'Parte de cada canal no total do mês', await legend(CHANNELS.map(function (ch, i) { return [ch[0], S(i + 1)]; }), 'rect'), await percentPlot()); } },
      { props: { Tipo: 'Divergentes' }, build: async function (c) { await chartCard(c, 'NPS por região', 'Pontos contra a meta · 2º trimestre', null, await divergingPlot()); } },
      { props: { Tipo: 'Funil' }, build: async function (c) { await chartCard(c, 'Funil de ativação', 'Pessoas em cada etapa · conversão da anterior', null, await funnelPlot()); } },
    ];
    G.bars = await variants('grafico-barras', 'Gráfico/Barras', items, {
      description: 'Colunas, agrupadas, empilhadas, horizontais, 100%, divergentes e funil. Uma série não tem legenda (o título nomeia); duas ou mais, sempre.',
      columns: 2,
      gap: 24,

    });
    return G.bars;
  }

  /** A barra de perto: as medidas que fazem o gráfico calmo. */
  async function barAnatomy() {
    var f = plotArea('Anatomia da barra', 416, 200);
    put(f, shape('Linha de base', { w: 160, h: 1, fill: 'color/chart/axis' }), 0, 170);
    bar(f, 'Barra', 24, 50, 24, 120, S(1), 'top');
    bar(f, 'Segmento de baixo', 88, 110, 24, 60, S(2), 'none');
    bar(f, 'Segmento de cima', 88, 40, 24, 68, S(1), 'top');
    var notes = [['≤ 24 px de espessura', 'a sobra da faixa é ar', 30], ['Ponta de 4 px, base reta', 'cresce de uma linha só', 82], ['2 px entre segmentos', 'o respiro separa, não um contorno', 134]];
    for (var n of notes) {
      var box1 = box('Nota', { dir: 'V', gap: 2, w: 220 });
      add(box1, await text(n[0], { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' }));
      add(box1, await text(n[1], { style: 'caption', color: 'color/fg/subtle' }));
      put(f, box1, 180, n[2] - 14);
      put(f, shape('Guia', { w: 40, h: 1, fill: 'color/border/default' }), 128, n[2]);
    }
    return f;
  }

  defineBlock({
    id: 'grafico-barras',
    page: 'Componentes',
    row: 'Gráficos',
    order: 1,
    group: 'Gráficos',
    title: 'Barras',
    description: 'Comparar magnitude. Barras finas que crescem do zero, cor por série em ordem fixa e rótulos só onde importam — o resto fica no eixo e na tabela.',
    tags: ['Componente', 'Variáveis de gráfico', 'Claro · Escuro'],
    build: async function () {
      var set = await barsSet();
      return {
        sections: [
          { title: 'Tipos', description: 'Séries em color/chart/series na ordem 1, 2, 3. Divergentes usam os polos de color/chart/div; o funil, a rampa color/chart/ord.', span: 2, node: set },
          { title: 'Anatomia da barra', description: 'O que vale para toda barra e todo segmento.', frame: true, node: barAnatomy },
          {
            title: 'Rótulo seletivo',
            description: 'Um valor no maior ponto; o resto o eixo e a tabela contam. Texto sempre em fg, nunca na cor da série.',
            frame: true,
            node: async function () {
              var list = box('Regras', { dir: 'V', gap: 10 });
              var rules = [['check', 'Valor na ponta da barra horizontal'], ['check', 'Um destaque no maior ou no último'], ['x', 'Um número em cada barra'], ['x', 'Rótulo pintado na cor da série']];
              for (var r of rules) {
                var row = box(r[1], { dir: 'H', gap: 10, cross: 'center' });
                add(row, icon(r[0], 16, r[0] === 'check' ? 'color/success/fg' : 'color/danger/fg'));
                add(row, await text(r[1], { style: 'body-sm', color: 'color/fg/default' }));
                add(list, row);
              }
              return list;
            },
          },
        ].concat(themed('Barras', function () { return instance(set, { Tipo: 'Agrupadas' }); }, { pad: 16 })),
      };
    },
  });

  /* ───────── Linhas e áreas ───────── */

  var USERS = { a: [12.1, 13.8, 13.2, 17.9, 20.6, 23.8, 23.1, 26.9, 29.8, 29.2, 33.6, 38.2], b: [10.2, 10.9, 11.1, 12.8, 14.1, 15.9, 16.8, 17.7, 18.9, 20.8, 22.1, 24.0] };

  async function linePlot(kind) {
    var H = 200, left = 44, top = 14, bottom = 24, right = kind === 'Comparação' ? 52 : 70;
    var pw = PLOT_W - left - right, ph = H - top - bottom;
    var area = plotArea('Área do gráfico', PLOT_W, H);
    var max = 40;
    var y = function (v) { return top + ph - (v / max) * ph; };
    var x = function (i) { return left + (i * pw) / 11; };
    await yGrid(area, [0, 10, 20, 30, 40], y, left, pw, function (t) { return t ? t + ' mil' : '0'; });
    await xLabels(area, MONTHS, left - pw / 22, pw / 11, top + ph + 6, 2);

    // caminho no espaço 24 × 24 da área de desenho (o vetor é esticado para pw × ph)
    var toPath = function (vals, closeArea) {
      var pts = vals.map(function (v, i) { return [r2(((x(i) - left) / pw) * 24), r2(((y(v) - top) / ph) * 24)]; });
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join('');
      return closeArea ? d + 'L24 24L0 24Z' : d;
    };

    if (kind === 'Comparação') {
      // meta: o único tracejado do gráfico
      var target = box('Meta', { dir: 'none' });
      target.resize(pw, 1);
      stroke(target, 'color/fg/subtle', 0, { dash: [4, 4] });
      target.strokeBottomWeight = 1;
      put(area, target, left, Math.round(y(35)));
      var tl = await text('Meta · 35 mil', { style: 'label-sm', color: 'color/fg/muted' });
      put(area, tl, left + 4, y(35) - 22);
      put(area, vectorPath('Linha · 2025', toPath(USERS.b), pw, ph, { color: 'color/chart/muted' }), left, top);
    }
    if (kind === 'Área') put(area, vectorPath('Área · 2026', toPath(USERS.a, true), pw, ph, { area: true, color: S(1), opacity: 0.1 }), left, top);
    put(area, vectorPath('Linha · 2026', toPath(USERS.a), pw, ph, { color: S(1) }), left, top);

    var ends = kind === 'Comparação' ? [['2026', USERS.a, S(1)], ['2025', USERS.b, 'color/chart/muted']] : [['38,2 mil', USERS.a, S(1)]];
    for (var e of ends) {
      var ex = x(11);
      var ey = y(e[1][11]);
      var dot = shape('Ponto final', { ellipse: true, w: 8, h: 8, fill: e[2] });
      stroke(dot, 'color/bg/surface', 2, { align: 'OUTSIDE' });
      put(area, dot, ex - 4, ey - 4);
      var label = await text(e[0], kind === 'Comparação' ? { style: 'label-sm', color: 'color/fg/muted' } : { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' });
      put(area, label, ex + 10, ey - 9);
    }
    return area;
  }

  // usuários ativos por plano — somados dão exatamente USERS.a
  var PLANS = [
    ['Grátis', [7.1, 8.0, 7.6, 10.2, 11.6, 13.1, 12.4, 14.2, 15.6, 15.0, 17.1, 19.3]],
    ['Pro', [3.6, 4.1, 4.0, 5.3, 6.1, 7.2, 7.1, 8.4, 9.3, 9.2, 10.6, 12.0]],
    ['Empresas', [1.4, 1.7, 1.6, 2.4, 2.9, 3.5, 3.6, 4.3, 4.9, 5.0, 5.9, 6.9]],
  ];

  /** Áreas empilhadas: faixas somadas a 16% com a linha de 2 px no topo de cada uma; o total fica no fim. */
  async function stackedAreaPlot() {
    var H = 200, left = 44, top = 14, bottom = 24;
    var pw = PLOT_W - left - 70, ph = H - top - bottom;
    var area = plotArea('Área do gráfico', PLOT_W, H);
    var y = function (v) { return top + ph - (v / 40) * ph; };
    var x = function (i) { return left + (i * pw) / 11; };
    await yGrid(area, [0, 10, 20, 30, 40], y, left, pw, function (t) { return t ? t + ' mil' : '0'; });
    await xLabels(area, MONTHS, left - pw / 22, pw / 11, top + ph + 6, 2);
    var pt = function (i, v) { return r2(((x(i) - left) / pw) * 24) + ' ' + r2(((y(v) - top) / ph) * 24); };
    var base = PLANS[0][1].map(function () { return 0; });
    for (var j = 0; j < PLANS.length; j++) {
      var tops = base.map(function (b, i) { return r2(b + PLANS[j][1][i]); });
      var upper = tops.map(function (v, i) { return (i ? 'L' : 'M') + pt(i, v); }).join('');
      var lower = base.map(function (v, i) { return 'L' + pt(i, v); }).reverse().join('');
      put(area, vectorPath('Área · ' + PLANS[j][0], upper + lower + 'Z', pw, ph, { area: true, color: S(j + 1), opacity: 0.16 }), left, top);
      put(area, vectorPath('Linha · ' + PLANS[j][0], upper, pw, ph, { color: S(j + 1) }), left, top);
      base = tops;
    }
    var total = await text('38,2 mil', { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' });
    put(area, total, x(11) + 10, y(base[11]) - 9);
    return area;
  }

  async function linesSet() {
    if (G.lines && !G.lines.removed) return G.lines;
    var items = [
      { props: { Tipo: 'Linha' }, build: async function (c) { await chartCard(c, 'Usuários ativos', 'Por mês · 2026 · valor no fim da linha', null, await linePlot('Linha')); } },
      { props: { Tipo: 'Comparação' }, build: async function (c) { await chartCard(c, 'Usuários ativos', '2026 contra 2025, com a meta', await legend([['2026', S(1)], ['2025', 'color/chart/muted']], 'line'), await linePlot('Comparação')); } },
      { props: { Tipo: 'Área' }, build: async function (c) { await chartCard(c, 'Usuários ativos', 'Lavagem de 10% sob a linha', null, await linePlot('Área')); } },
      { props: { Tipo: 'Áreas empilhadas' }, build: async function (c) { await chartCard(c, 'Usuários ativos', 'Por plano · cada faixa soma à de baixo', await legend(PLANS.map(function (p, i) { return [p[0], S(i + 1)]; }), 'rect'), await stackedAreaPlot()); } },
    ];
    G.lines = await variants('grafico-linhas', 'Gráfico/Linhas', items, {
      description: 'Tendência no tempo: linha de 2 px, nome ou valor no fim, o período anterior em cinza e a meta tracejada. Um eixo só.',
      columns: 2,
      gap: 24,
      props: { 'Título': ['TEXT', 'Usuários ativos'] },
    });
    return G.lines;
  }

  defineBlock({
    id: 'grafico-linhas',
    page: 'Componentes',
    row: 'Gráficos',
    order: 2,
    group: 'Gráficos',
    title: 'Linhas e áreas',
    description: 'Tendência no tempo. A série atual na cor 1, o contexto em color/chart/muted, a meta como o único tracejado e o nome no fim da linha quando cabe.',
    tags: ['Componente', 'Variáveis de gráfico', 'Claro · Escuro'],
    build: async function () {
      var set = await linesSet();
      return {
        sections: [
          { title: 'Tipos', description: 'Linha única, comparação com o período anterior, área e áreas empilhadas.', span: 2, node: set },
          {
            title: 'Um eixo só',
            description: 'Duas grandezas de escalas diferentes viram dois gráficos — ou um índice com base 100. Nunca dois eixos y.',
            span: 2,
            frame: true,
            node: async function () {
              var list = box('Regras', { dir: 'V', gap: 10 });
              var rules = [['check', 'Período anterior em cinza, embaixo'], ['check', 'Meta tracejada com rótulo'], ['x', 'Dois eixos y no mesmo gráfico'], ['x', 'Rótulos empilhados quando as linhas se cruzam']];
              for (var r of rules) {
                var row = box(r[1], { dir: 'H', gap: 10, cross: 'center' });
                add(row, icon(r[0], 16, r[0] === 'check' ? 'color/success/fg' : 'color/danger/fg'));
                add(row, await text(r[1], { style: 'body-sm', color: 'color/fg/default' }));
                add(list, row);
              }
              return list;
            },
          },
        ].concat(themed('Linhas', function () { return instance(set, { Tipo: 'Comparação' }); }, { pad: 16 })),
      };
    },
  });

  /* ───────── Rosca ───────── */

  var PAYMENTS = [['Pix', 4210, S(1)], ['Crédito', 2630, S(2)], ['Débito', 1290, S(3)], ['Boleto', 610, S(4)], ['Outros', 520, 'color/chart/other']];
  var PAYMENTS3 = [['Pix', 4210, S(1)], ['Cartões', 3920, S(2)], ['Outros', 1130, 'color/chart/other']];

  /** Rosca desenhada no espaço 24 × 24 (quadrada) e esticada para size. 2 px de respiro entre fatias. */
  function donutVector(parts, size) {
    var total = parts.reduce(function (a, p) { return a + p[1]; }, 0);
    var k = 24 / size;
    var R = (size / 2 - 4) * k;
    var r = R - 22 * k;
    var mid = ((R + r) / 2) / k;
    var gap = 2 / mid;
    var a = -Math.PI / 2;
    var pt = function (rad, ang) { return r2(12 + rad * Math.cos(ang)) + ' ' + r2(12 + rad * Math.sin(ang)); };
    var paths = parts.map(function (p) {
      var span = (p[1] / total) * Math.PI * 2;
      var a0 = a + gap / 2;
      var a1 = a + span - gap / 2;
      a += span;
      var large = a1 - a0 > Math.PI ? 1 : 0;
      return '<path d="M' + pt(R, a0) + 'A' + r2(R) + ' ' + r2(R) + ' 0 ' + large + ' 1 ' + pt(R, a1) + 'L' + pt(r, a1) + 'A' + r2(r) + ' ' + r2(r) + ' 0 ' + large + ' 0 ' + pt(r, a0) + 'Z" fill="#000000" stroke="none"/>';
    });
    var svg = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' + paths.join('') + '</svg>');
    svg.name = 'Fatias';
    svg.fills = [];
    svg.clipsContent = false;
    svg.children.forEach(function (ch, i) {
      ch.name = parts[i][0];
      ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
      ch.fills = [paint(parts[i][2])];
    });
    svg.resize(size, size);
    return svg;
  }

  async function donutCard(c, parts, title) {
    var total = parts.reduce(function (a, p) { return a + p[1]; }, 0);
    var size = 148;
    var fig = plotArea('Rosca', size, size);
    put(fig, donutVector(parts, size), 0, 0);
    var center = box('Miolo', { dir: 'V', gap: 2, align: 'center', cross: 'center', w: size, h: size });
    var tv = await text(thousands(total), { style: 'heading-sm', size: 24, color: 'color/fg/default', prop: 'Total', name: 'Total' });
    tv.lineHeight = { unit: 'PIXELS', value: 28 };
    add(center, tv);
    add(center, await text('Total', { style: 'caption', color: 'color/fg/subtle' }));
    put(fig, center, 0, 0);

    var list = box('Lista', { dir: 'V', gap: 0 });
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var row = box(p[0], { dir: 'H', gap: 10, pad: [0, 6], cross: 'center', h: 36 });
      if (i) { stroke(row, 'color/border/subtle', 0); row.strokeTopWeight = 1; }
      add(row, shape('Chave', { w: 10, h: 10, fill: p[2], radius: 3 }));
      add(row, await text(p[0], { style: 'body-sm', color: 'color/fg/muted' }), { grow: true });
      add(row, await text(thousands(p[1]), { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' }));
      var share = await text((Math.round((p[1] / total) * 1000) / 10).toString().replace('.', ',') + '%', { style: 'body-sm', color: 'color/fg/subtle', w: 44, align: 'end' });
      add(row, share);
      add(list, row, { fillW: true });
    }
    var body = box('Rosca e lista', { dir: 'H', gap: 24, cross: 'center' });
    add(body, fig);
    add(body, list, { grow: true });
    await chartCard(c, title, 'Transações no mês', null, body);
    body.layoutSizingHorizontal = 'FILL';
  }

  async function donutSet() {
    if (G.donut && !G.donut.removed) return G.donut;
    G.donut = await variants('grafico-rosca', 'Gráfico/Rosca', [
      { props: { Fatias: '3' }, build: function (c) { return donutCard(c, PAYMENTS3, 'Pagamentos por método'); } },
      { props: { Fatias: '5' }, build: function (c) { return donutCard(c, PAYMENTS, 'Pagamentos por método'); } },
    ], {
      description: 'Parte do todo de relance, até 6 fatias — da 6ª em diante vira “Outros” em color/chart/other. O miolo mostra o total.',
      columns: 2,
      gap: 24,
      props: { 'Título': ['TEXT', 'Pagamentos por método'], 'Subtítulo': ['TEXT', 'Transações no mês'], 'Total': ['TEXT', '9.260'] },
    });
    return G.donut;
  }

  defineBlock({
    id: 'grafico-rosca',
    page: 'Componentes',
    row: 'Gráficos',
    order: 3,
    group: 'Gráficos',
    title: 'Rosca',
    description: 'Proporção de relance, com até 6 fatias e 2 px de respiro entre elas. A lista ao lado faz o papel de legenda e de rótulo: nome, valor e porcentagem.',
    tags: ['Componente', 'Variáveis de gráfico', 'Claro · Escuro'],
    build: async function () {
      var set = await donutSet();
      return {
        sections: [
          { title: 'Fatias', description: 'Com 3 e com 5 fatias. Para comparar valores próximos, use barras.', span: 2, node: set },
        ].concat(themed('Rosca', function () { return instance(set, { Fatias: '5' }); }, { pad: 16 })),
      };
    },
  });

  /* ───────── Heatmap ───────── */

  var DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  var SEQ5 = [1, 2, 4, 6, 7];

  function orders(d, h) {
    var curve = Math.max(0, Math.sin(((h - 6) / 24) * Math.PI * 2));
    var lunch = h >= 11 && h <= 13 ? 14 : 0;
    var dinner = h >= 19 && h <= 21 ? 18 : 0;
    var weekend = d >= 5 ? (h >= 10 ? 10 : -6) : 0;
    var wobble = ((d * 7 + h * 3) % 5) * 1.5;
    return Math.max(0, Math.round(curve * 34 + lunch + dinner + weekend + wobble - (h < 6 ? 10 : 0)));
  }

  async function heatPlot(scale) {
    var cell = 13, gap = 2, left = 30, top = 0;
    var W = left + 24 * (cell + gap) - gap;
    var H = top + 7 * (cell + gap) - gap + 22;
    var area = plotArea('Mapa', W, H);
    var vals = [];
    for (var d = 0; d < 7; d++) for (var h = 0; h < 24; h++) vals.push(orders(d, h));
    var max = Math.max.apply(null, vals);
    var mean = vals.reduce(function (a, v) { return a + v; }, 0) / vals.length;
    var m = Math.max(max - mean, mean);
    for (var dd = 0; dd < 7; dd++) {
      var lab = await text(DAYS[dd], { style: 'caption', color: 'color/fg/subtle', w: left - 8, align: 'end' });
      put(area, lab, 0, top + dd * (cell + gap) - 1);
      for (var hh = 0; hh < 24; hh++) {
        var v = orders(dd, hh);
        var color;
        if (scale === 'Divergente') {
          var k = Math.max(0, Math.min(4, Math.round(((v - mean) / m) * 2) + 2));
          color = 'color/chart/div/' + [1, 2, 4, 6, 7][k];
        } else {
          color = v === 0 ? 'color/chart/grid' : 'color/chart/seq/' + SEQ5[Math.max(0, Math.min(4, Math.ceil((v / max) * 5) - 1))];
        }
        var r = shape(DAYS[dd] + ' ' + hh + 'h', { w: cell, h: cell, fill: color, radius: 3 });
        put(area, r, left + hh * (cell + gap), top + dd * (cell + gap));
      }
    }
    for (var c = 0; c < 24; c += 6) {
      var t = await text(c + 'h', { style: 'caption', color: 'color/fg/subtle' });
      put(area, t, left + c * (cell + gap), top + 7 * (cell + gap) + 4);
    }
    return area;
  }

  async function scaleLegend(scale) {
    var row = box('Escala', { dir: 'H', gap: 8, cross: 'center' });
    add(row, await text(scale === 'Divergente' ? 'Abaixo da média' : 'Menos', { style: 'caption', color: 'color/fg/subtle' }));
    var bins = box('Faixas', { dir: 'H', gap: 2 });
    var tokens = scale === 'Divergente' ? [1, 2, 4, 6, 7].map(function (n) { return 'color/chart/div/' + n; }) : ['color/chart/grid'].concat(SEQ5.map(function (n) { return 'color/chart/seq/' + n; }));
    tokens.forEach(function (tk) { add(bins, shape('Faixa', { w: 13, h: 13, fill: tk, radius: 3 })); });
    add(row, bins);
    add(row, await text(scale === 'Divergente' ? 'Acima' : 'Mais', { style: 'caption', color: 'color/fg/subtle' }));
    return row;
  }

  async function heatSet() {
    if (G.heat && !G.heat.removed) return G.heat;
    G.heat = await variants('grafico-heatmap', 'Gráfico/Heatmap', ['Sequencial', 'Divergente'].map(function (sc) {
      return {
        props: { Escala: sc },
        build: async function (c) {
          var body = box('Mapa e escala', { dir: 'V', gap: 14, cross: 'end' });
          add(body, await heatPlot(sc));
          add(body, await scaleLegend(sc));
          await chartCard(c, 'Pedidos por hora', sc === 'Divergente' ? 'Contra a média da semana' : 'Dia da semana × hora', null, body);
        },
      };
    }), {
      description: 'Intensidade numa grade. Sequencial: um tom, mais = mais forte (no escuro, mais claro). Divergente: dois tons com o meio neutro. Até 7 faixas.',
      columns: 2,
      gap: 24,
      props: { 'Título': ['TEXT', 'Pedidos por hora'] },
    });
    return G.heat;
  }

  // um ano de atividade, um valor por dia, começando num domingo (2 nov. 2025) — sementes fixas
  var YEAR_START = Date.UTC(2025, 10, 2);

  function yearActivity() {
    var seed = 3;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var out = [];
    for (var i = 0; i < 364; i++) {
      var weekend = i % 7 === 0 || i % 7 === 6;
      var season = 0.6 + 0.4 * Math.sin((i / 364) * Math.PI * 2 - 1);
      out.push(rnd() < (weekend ? 0.7 : 0.18) ? 0 : Math.round(rnd() * 9 * season + (weekend ? 0 : 2)));
    }
    return out;
  }

  /** Calendário: semanas em colunas, dias em linhas, o mês em cima da primeira semana dele. */
  async function calendarPlot() {
    var cell = 12, gap = 2, left = 30, top = 18, weeks = 52;
    var vals = yearActivity();
    var max = Math.max.apply(null, vals);
    var area = plotArea('Calendário', left + weeks * (cell + gap) - gap, top + 7 * (cell + gap) - gap);
    for (var r of [[1, 'Seg'], [3, 'Qua'], [5, 'Sex']]) {
      put(area, await text(r[1], { style: 'caption', color: 'color/fg/subtle', w: left - 8, align: 'end' }), 0, top + r[0] * (cell + gap) - 2);
    }
    var lastMonth = -1;
    for (var w = 0; w < weeks; w++) {
      var month = new Date(YEAR_START + w * 7 * 86400000).getUTCMonth();
      if (month !== lastMonth) {
        put(area, await text(MONTHS[month], { style: 'caption', color: 'color/fg/subtle' }), left + w * (cell + gap), 0);
        lastMonth = month;
      }
      for (var k = 0; k < 7; k++) {
        var v = vals[w * 7 + k];
        var color = v === 0 ? 'color/chart/grid' : 'color/chart/seq/' + SEQ5[Math.max(0, Math.min(4, Math.ceil((v / max) * 5) - 1))];
        put(area, shape('Dia ' + (w * 7 + k + 1), { w: cell, h: cell, fill: color, radius: 3 }), left + w * (cell + gap), top + k * (cell + gap));
      }
    }
    return area;
  }

  async function calendarComponent() {
    if (G.calendar && !G.calendar.removed) return G.calendar;
    G.calendar = await component('grafico-calendario', 'Gráfico/Calendário', async function (c) {
      var body = box('Calendário e escala', { dir: 'V', gap: 14, cross: 'end' });
      add(body, await calendarPlot());
      add(body, await scaleLegend('Sequencial'));
      await chartCard(c, 'Pedidos no ano', 'Um quadrado por dia · nov. 2025 a out. 2026', null, body, 804);
    }, { description: 'Heatmap em calendário: um quadrado por dia, semanas em colunas e a mesma escala sequencial da grade.' });
    return G.calendar;
  }

  defineBlock({
    id: 'grafico-heatmap',
    page: 'Componentes',
    row: 'Gráficos',
    order: 4,
    group: 'Gráficos',
    title: 'Heatmap',
    description: 'Intensidade numa grade de dia × hora ou num calendário de um ano. Células com 2 px de respiro, sem dado na cor da grade e a escala sempre à vista.',
    tags: ['Componente', 'Variáveis de gráfico', 'Claro · Escuro'],
    build: async function () {
      var set = await heatSet();
      var calendar = await calendarComponent();
      return {
        sections: [
          { title: 'Escalas', description: 'color/chart/seq (5 faixas) e color/chart/div com o meio neutro.', span: 2, node: set },
          { title: 'Calendário', description: 'Um quadrado por dia, semanas em colunas e o mês em cima da primeira semana dele.', span: 2, node: calendar, fill: false },
        ].concat(themed('Heatmap', function () { return instance(set, { Escala: 'Sequencial' }); }, { pad: 16 })),
      };
    },
  });

  /* ───────── Dispersão ───────── */

  // clientes: custo de aquisição (R$) × satisfação, por segmento — sementes fixas, sempre os mesmos pontos
  var SEGMENTS = (function () {
    var seed = 5;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var make = function (n, cx, cy, sx, sy, size) {
      var pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.round(cx + (rnd() - 0.5) * sx), y: Math.round(cy + (rnd() - 0.5) * sy), size: Math.round(size * (0.4 + rnd())) });
      return pts;
    };
    return [['Varejo', make(18, 60, 52, 70, 46, 120)], ['Empresas', make(14, 115, 64, 70, 36, 300)], ['Autônomos', make(12, 38, 38, 40, 40, 60)]];
  })();

  async function scatterPlot(kind) {
    var H = 236, left = 36, top = 30, bottom = 40;
    var pw = PLOT_W - left - 8, ph = H - top - bottom;
    var area = plotArea('Área do gráfico', PLOT_W, H);
    var x = function (v) { return left + (v / 160) * pw; };
    var y = function (v) { return top + ph - (v / 100) * ph; };
    await yGrid(area, [0, 25, 50, 75, 100], y, left, pw, function (t) { return String(t); });
    for (var t of [0, 40, 80, 120, 160]) {
      var tl = await text(String(t), { style: 'caption', color: 'color/fg/subtle', w: 40, align: 'center' });
      put(area, tl, x(t) - 20, top + ph + 6);
    }
    var xt = await text('Custo de aquisição (R$)', { style: 'caption', color: 'color/fg/subtle' });
    put(area, xt, left + pw - xt.width, top + ph + 22);
    put(area, await text('Satisfação', { style: 'caption', color: 'color/fg/subtle' }), 0, 0);
    var maxSize = 0;
    SEGMENTS.forEach(function (s) { s[1].forEach(function (p) { maxSize = Math.max(maxSize, p.size); }); });
    if (kind === 'Com meta') {
      // a meta é o único tracejado
      var target = box('Meta', { dir: 'none' });
      target.resize(pw, 1);
      stroke(target, 'color/fg/subtle', 0, { dash: [4, 4] });
      target.strokeBottomWeight = 1;
      put(area, target, left, Math.round(y(60)));
      var ml = await text('Meta · 60', { style: 'label-sm', color: 'color/fg/muted' });
      put(area, ml, left + pw - ml.width, y(60) - 22);
    }
    for (var j = 0; j < SEGMENTS.length; j++) {
      for (var p of SEGMENTS[j][1]) {
        var r = kind === 'Bolhas' ? 4 + 10 * Math.sqrt(p.size / maxSize) : 4;
        var dot = shape(SEGMENTS[j][0], { ellipse: true, w: r * 2, h: r * 2 });
        fill(dot, S(j + 1), kind === 'Bolhas' ? 0.85 : 1);
        stroke(dot, 'color/bg/surface', kind === 'Bolhas' ? 1 : 2, { align: 'OUTSIDE' });
        put(area, dot, r2(x(p.x) - r), r2(y(p.y) - r));
      }
    }
    return area;
  }

  async function scatterSet() {
    if (G.scatter && !G.scatter.removed) return G.scatter;
    var subtitles = { Pontos: 'Um ponto por cliente, por segmento', Bolhas: 'O tamanho é a receita do cliente', 'Com meta': 'A meta de satisfação como referência' };
    G.scatter = await variants('grafico-dispersao', 'Gráfico/Dispersão', ['Pontos', 'Bolhas', 'Com meta'].map(function (kind) {
      return {
        props: { Tipo: kind },
        build: async function (c) {
          await chartCard(c, 'Custo × satisfação', subtitles[kind], await legend(SEGMENTS.map(function (s, i) { return [s[0], S(i + 1)]; }), 'dot'), await scatterPlot(kind));
        },
      };
    }), {
      description: 'Relação entre duas medidas, até 3 séries. Pontos de 8 px com anel da cor da superfície; bolhas quando há uma terceira medida.',
      columns: 2,
      gap: 24,
      props: { 'Título': ['TEXT', 'Custo × satisfação'] },
    });
    return G.scatter;
  }

  defineBlock({
    id: 'grafico-dispersao',
    page: 'Componentes',
    row: 'Gráficos',
    order: 5,
    group: 'Gráficos',
    title: 'Dispersão',
    description: 'Relação entre duas medidas. Pontos pequenos com anel da cor da superfície, bolhas para uma terceira medida e a meta como a única linha tracejada.',
    tags: ['Componente', 'Variáveis de gráfico', 'Claro · Escuro'],
    build: async function () {
      var set = await scatterSet();
      return {
        sections: [
          { title: 'Tipos', description: 'Pontos, bolhas (a área cresce com o valor) e com a meta. Até 3 séries, sempre com legenda.', span: 2, node: set },
        ].concat(themed('Dispersão', function () { return instance(set, { Tipo: 'Pontos' }); }, { pad: 16 })),
      };
    },
  });
})();
