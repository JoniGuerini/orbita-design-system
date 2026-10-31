/**
 * Fundamentos: Movimento (durações e curvas) e Layout (breakpoints e medidas do app shell).
 * Durações e medidas vêm das variáveis de Dimensões; as curvas, de META.easings (o Figma não guarda curva em variável).
 */
(function () {
  function dims(prefix) {
    var col = DATA.collections.find(function (c) { return c.name === 'Dimensões'; });
    return col ? col.variables.filter(function (v) { return v.name.indexOf(prefix) === 0; }) : [];
  }
  var valueOf = function (v) { return v.values[Object.keys(v.values)[0]]; };
  var tail = function (name) { return name.split('/').pop(); };

  /* ───────── Movimento ───────── */

  var DURATION_USE = {
    instant: 'Troca de estado sem transição.',
    fast: 'Hover, foco e cor — a maior parte das interações.',
    base: 'Menus, tooltips, chevrons e popovers.',
    slow: 'Sidebar, gaveta, grupos do menu e entrada de página.',
    slower: 'Para transições grandes e raras.',
  };
  var EASING_USE = {
    standard: 'Padrão para quase tudo: sai rápido e assenta suave.',
    emphasized: 'Superfícies que se deslocam: menus, sidebar, gaveta.',
    decelerate: 'Entradas: o elemento chega e desacelera.',
    accelerate: 'Saídas: o elemento ganha velocidade ao sair.',
    linear: 'Progresso e loops contínuos.',
  };

  async function durationList(w) {
    var list = box('Durações', { dir: 'V', gap: 0, w: w });
    var items = dims('duration/');
    var max = Math.max.apply(null, items.map(valueOf).concat([1]));
    for (var i = 0; i < items.length; i++) {
      var v = items[i];
      var ms = valueOf(v);
      var row = box(v.name, { dir: 'H', gap: 24, pad: [14, 0], cross: 'center' });
      if (i) { stroke(row, 'color/border/subtle', 0); row.strokeTopWeight = 1; }
      var name = box('Nome', { dir: 'V', gap: 2, w: 160 });
      add(name, await text(v.name, { style: 'label-sm', color: 'color/fg/default' }));
      add(name, await text(ms + ' ms', { style: 'caption', color: 'color/fg/subtle' }));
      add(row, name);
      var track = box('Trilha', { dir: 'none', radius: 'radius/full', fill: 'color/bg/muted', clip: true });
      track.resize(280, 8);
      if (ms > 0) track.appendChild(shape('Duração', { w: Math.max(4, Math.round((ms / max) * 280)), h: 8, fill: 'color/brand/solid', radius: 'radius/full' }));
      add(row, track);
      add(row, await text(DURATION_USE[tail(v.name)] || '', { style: 'body-sm', color: 'color/fg/muted' }), { grow: true });
      add(list, row, { fillW: true });
    }
    return list;
  }

  /** A curva desenhada como um vetor no quadrado 24 × 24: do canto de baixo à esquerda ao de cima à direita. */
  function curve(points, size) {
    var p = points.map(function (n, i) { return Math.round((i % 2 ? (1 - n) * 24 : n * 24) * 100) / 100; });
    var d = 'M0 24C' + p[0] + ' ' + p[1] + ' ' + p[2] + ' ' + p[3] + ' 24 0';
    var svg = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="' + d + '" stroke="#000000" stroke-width="2" stroke-linecap="round" fill="none"/></svg>');
    svg.name = 'Curva';
    svg.fills = [];
    svg.clipsContent = false;
    svg.children.forEach(function (ch) { ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; });
    colorIcon(svg, 'color/fg/brand');
    svg.resize(size, size);
    return svg;
  }

  async function easingCard(e) {
    var card = box(e.name, { dir: 'V', gap: 12, pad: 16, w: 182, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/lg' });
    var plot = box('Gráfico', { dir: 'none', fill: 'color/bg/sunken', radius: 'radius/sm' });
    plot.resize(150, 110);
    plot.clipsContent = false;
    var c = curve(e.points, 86);
    plot.appendChild(c);
    c.x = 32;
    c.y = 12;
    card.appendChild(plot);
    add(card, await text(e.name, { style: 'label-md', color: 'color/fg/default' }));
    add(card, await text(e.points.join(', '), { style: 'code-sm', color: 'color/fg/subtle' }));
    add(card, await text(EASING_USE[e.name] || '', { style: 'caption', color: 'color/fg/muted', w: 150 }), { fillW: true });
    return card;
  }

  defineBlock({
    id: 'movimento',
    page: 'Fundamentos',
    row: 'Fundamentos',
    order: 4,
    group: 'Fundamentos',
    title: 'Movimento',
    description: 'Transições com propósito: curtas, com a curva certa para entrar, sair ou se deslocar. As durações são variáveis de Dimensões (em ms); as curvas ficam documentadas aqui.',
    tags: ['Variáveis', 'Curvas'],
    build: async function () {
      return {
        sections: [
          { title: 'Durações', description: 'duration/instant a duration/slower. A maior parte das interações usa fast.', span: 2, node: durationList },
          {
            title: 'Curvas',
            description: 'cubic-bezier do CSS. No protótipo do Figma, use “Personalizada” com os mesmos quatro números.',
            span: 2,
            node: async function (w) {
              var grid = box('Curvas', { dir: 'H', wrap: true, gap: 16, rowGap: 16, w: w });
              for (var e of META.easings || []) add(grid, await easingCard(e));
              return grid;
            },
          },
          {
            title: 'Movimento reduzido',
            description: 'Com prefers-reduced-motion, as trocas viram instantâneas e nada se desloca.',
            span: 2,
            frame: true,
            node: async function () {
              var col = box('Regras', { dir: 'V', gap: 10 });
              var list = [['check', 'Respeite o movimento reduzido do sistema'], ['check', 'Opacidade e cor podem ficar; deslocamento sai'], ['x', 'Animação só de enfeite'], ['x', 'Piscar mais de 3 vezes por segundo']];
              for (var r of list) {
                var row = box(r[1], { dir: 'H', gap: 10, cross: 'center' });
                add(row, icon(r[0], 16, r[0] === 'check' ? 'color/success/fg' : 'color/danger/fg'));
                add(row, await text(r[1], { style: 'body-sm', color: 'color/fg/default' }));
                add(col, row);
              }
              return col;
            },
          },
        ],
      };
    },
  });

  /* ───────── Layout ───────── */

  var BREAKPOINT_NOTES = {
    sm: 'Ainda sem regra no app — disponível para componentes.',
    md: 'Abaixo dele, margens e painéis compactam e as tabelas viram cartões.',
    lg: 'Abaixo dele, a sidebar vira gaveta; a partir dele, fica fixa e recolhível (⌘B).',
    xl: 'Abaixo dele, as grades de 4 colunas passam para 2.',
    '2xl': 'Telas largas mantêm a largura máxima de conteúdo.',
  };

  async function breakpointList(w) {
    var list = box('Breakpoints', { dir: 'V', gap: 0, w: w });
    var items = dims('breakpoint/');
    var max = Math.max.apply(null, items.map(valueOf).concat([1]));
    for (var i = 0; i < items.length; i++) {
      var v = items[i];
      var px = valueOf(v);
      var row = box(v.name, { dir: 'H', gap: 24, pad: [14, 0], cross: 'center' });
      if (i) { stroke(row, 'color/border/subtle', 0); row.strokeTopWeight = 1; }
      var name = box('Nome', { dir: 'V', gap: 2, w: 160 });
      add(name, await text(v.name, { style: 'label-sm', color: 'color/fg/default' }));
      add(name, await text(px + ' px', { style: 'caption', color: 'color/fg/subtle' }));
      add(row, name);
      var track = box('Trilha', { dir: 'none', radius: 'radius/full', fill: 'color/bg/muted', clip: true });
      track.resize(320, 8);
      track.appendChild(shape('Largura', { w: Math.round((px / max) * 320), h: 8, fill: 'color/chart/series/2', radius: 'radius/full' }));
      add(row, track);
      add(row, await text(BREAKPOINT_NOTES[tail(v.name)] || '', { style: 'body-sm', color: 'color/fg/muted' }), { grow: true });
      add(list, row, { fillW: true });
    }
    return list;
  }

  /** O shell em escala 1:2, com as medidas de layout/* anotadas. */
  async function shellDiagram() {
    var get = function (n) { var v = dims(n)[0]; return v ? valueOf(v) : 0; };
    var k = 0.5;
    var sidebar = get('layout/sidebar') * k, topbar = get('layout/topbar') * k, gap = get('layout/frame-gap') * k;
    var W = 700, H = 300;
    var frame = box('Shell 1:2', { dir: 'none', fill: 'color/bg/app', radius: 'radius/xl' });
    frame.resize(W, H);
    var side = shape('Sidebar', { w: sidebar, h: H - gap * 2, fill: 'color/bg/sidebar', stroke: 'color/border/subtle', radius: 'radius/lg' });
    frame.appendChild(side);
    side.x = gap;
    side.y = gap;
    var main = shape('Painel principal', { w: W - sidebar - gap * 3, h: H - gap * 2, fill: 'color/bg/canvas', stroke: 'color/border/subtle', radius: 'radius/lg' });
    frame.appendChild(main);
    main.x = sidebar + gap * 2;
    main.y = gap;
    var bar = shape('Topbar', { w: W - sidebar - gap * 3, h: topbar, fill: 'color/bg/muted', radius: 'radius/lg' });
    frame.appendChild(bar);
    bar.x = main.x;
    bar.y = gap;
    var notes = [
      ['layout/sidebar · ' + get('layout/sidebar') + ' px', gap + 12, H / 2 - 8],
      ['layout/topbar · ' + get('layout/topbar') + ' px', main.x + 16, gap + topbar / 2 - 8],
      ['layout/gutter · ' + get('layout/gutter') + ' px de margem do conteúdo', main.x + 16, gap + topbar + 24],
      ['layout/content-max · ' + get('layout/content-max') + ' px', main.x + 16, gap + topbar + 48],
      ['layout/frame-gap · ' + get('layout/frame-gap') + ' px entre os painéis', main.x + 16, H - gap - 28],
    ];
    for (var n of notes) {
      var t = await text(n[0], { style: 'caption', color: 'color/fg/muted' });
      frame.appendChild(t);
      t.x = n[1];
      t.y = n[2];
    }
    return frame;
  }

  defineBlock({
    id: 'layout',
    page: 'Fundamentos',
    row: 'Fundamentos',
    order: 5,
    group: 'Fundamentos',
    title: 'Layout',
    description: 'Breakpoints, as medidas do app shell e as larguras máximas de conteúdo e de leitura. Tudo em variáveis de Dimensões: layout/* e breakpoint/*.',
    tags: ['Variáveis'],
    build: async function () {
      var get = function (n) { var v = dims(n)[0]; return v ? valueOf(v) : 0; };
      return {
        sections: [
          { title: 'Breakpoints', description: 'Do celular deitado (sm) às telas largas (2xl). O app muda de verdade em md e lg.', span: 2, node: breakpointList },
          { title: 'App shell', description: 'Em escala 1:2: sidebar flutuante, painel principal, topbar e o respiro entre eles.', span: 2, frame: true, node: shellDiagram },
          {
            title: 'Larguras de leitura',
            description: 'Conteúdo até ' + get('layout/content-max') + ' px; texto corrido até ' + get('layout/prose-max') + ' px, perto de 70 caracteres por linha.',
            span: 2,
            frame: true,
            node: async function () {
              var col = box('Larguras', { dir: 'V', gap: 12 });
              var items = [['layout/content-max', 'color/chart/series/1'], ['layout/prose-max', 'color/chart/series/3']];
              for (var it of items) {
                var px = get(it[0]);
                var row = box(it[0], { dir: 'H', gap: 16, cross: 'center' });
                add(row, shape('Largura', { w: Math.round(px * 0.6), h: 12, fill: it[1], radius: 'radius/full' }));
                add(row, await text(it[0] + ' · ' + px + ' px', { style: 'label-sm', color: 'color/fg/default' }));
                add(col, row);
              }
              return col;
            },
          },
        ],
      };
    },
  });
})();
