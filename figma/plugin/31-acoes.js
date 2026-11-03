/**
 * Ações: Botão de ícone, Ação inline, Chip e Badge.
 * Mesmo desenho de ds/components/button.css e chip.css. Os construtores ficam em LUME.lib para outros blocos.
 */
(function () {
  LUME.lib = LUME.lib || {};

  var STATES = ['Normal', 'Hover', 'Pressionado', 'Foco', 'Desativado'];

  function focusRing(c) {
    stroke(c, 'color/border/focus', 'focus-ring/width', { align: 'OUTSIDE' });
  }

  function disabled(c, token) {
    num(c, 'opacity', token || 'opacity/disabled');
  }

  /* ───────── Botão de ícone ───────── */

  var IB_VARIANTS = [
    ['Padrão', { fg: 'color/fg/default' }],
    ['Apagado', { fg: 'color/fg/muted', fgHover: 'color/fg/default' }],
    ['Contorno', { fg: 'color/fg/default', border: 'color/border/control', borderHover: 'color/border/strong' }],
    ['Sutil', { fg: 'color/fg/default', bg: 'color/bg/muted', subtle: true }],
  ];
  var IB_SIZES = [
    ['P', { size: 'size/control/xs', px: 28, radius: 'radius/xs', icon: 16 }],
    ['M', { size: 36, px: 36, radius: 'radius/sm', icon: 20 }],
    ['G', { size: 44, px: 44, radius: 'radius/md', icon: 20 }],
  ];

  async function buildIconButton(c, v, s, state) {
    box(c.name, { dir: 'H', align: 'center', cross: 'center', w: s.px, h: s.px, radius: s.radius }, c);
    if (typeof s.size === 'string') { num(c, 'width', s.size); num(c, 'height', s.size); }
    var bg = v.bg || null;
    if (state === 'Hover') bg = v.subtle ? null : 'color/bg/hover';
    if (state === 'Pressionado') bg = 'color/bg/pressed';
    if (state === 'Hover' && v.subtle) setPaints(c, 'fills', [paint('color/bg/muted'), paint('color/fg/default', 0.06)]);
    else fill(c, bg);
    if (v.border) stroke(c, state === 'Hover' || state === 'Pressionado' ? v.borderHover : v.border, 1);
    if (state === 'Foco') focusRing(c);
    if (state === 'Desativado') disabled(c);
    var fg = state === 'Hover' || state === 'Pressionado' ? v.fgHover || v.fg : v.fg;
    var ic = icon('more-horizontal', s.icon, fg);
    exposes(ic, 'mainComponent', 'Ícone');
    add(c, ic);
  }

  var IB_SET = null;
  async function iconButtonSet() {
    if (IB_SET && !IB_SET.removed) return IB_SET;
    var items = [];
    IB_VARIANTS.forEach(function (v) {
      IB_SIZES.forEach(function (s) {
        STATES.forEach(function (state) {
          items.push({ props: { Variante: v[0], Tamanho: s[0], Estado: state }, build: function (c) { return buildIconButton(c, v[1], s[1], state); } });
        });
      });
    });
    IB_SET = await variants('botao-icone', 'Botão de ícone', items, {
      description: 'Só ícone, sem fundo por padrão. Sempre com nome acessível (aria-label) e tooltip com o mesmo texto.',
      columns: 5,
      gap: 48,
      rowGap: 16,
      props: {
        'Ícone': ['INSTANCE_SWAP', 'more-horizontal', ['more-horizontal', 'pencil', 'copy', 'download', 'trash', 'x', 'search', 'settings', 'stack', 'panel-left', 'plus']],
      },
    });
    return IB_SET;
  }
  LUME.lib.iconButtonSet = iconButtonSet;

  function ib(set, variante, tamanho, name) {
    return instance(set, { Variante: variante, Tamanho: tamanho, Estado: 'Normal' }, { 'Ícone': name });
  }

  defineBlock({
    id: 'botao-icone',
    page: 'Componentes',
    row: 'Ações',
    order: 2,
    group: 'Ações',
    title: 'Botão de ícone',
    description: 'Ações frequentes em barras, cabeçalhos e listas. Sem fundo por padrão; ganha contorno ou fundo sutil quando precisa de presença. O ícone é uma propriedade de troca.',
    build: async function () {
      var set = await iconButtonSet();
      return {
        sections: [
          {
            title: 'Variantes, tamanhos e estados',
            description: '4 variantes × 3 tamanhos (28, 36 e 44 px) × 5 estados.',
            span: 2,
            fill: false,
            node: function () {
              var rows = [];
              IB_VARIANTS.forEach(function (v) { IB_SIZES.forEach(function (s) { rows.push(v[0] + ' · ' + s[0]); }); });
              return labeledMatrix(set, STATES, rows);
            },
          },
          {
            title: 'Barra de ferramentas',
            description: 'Padrão para ações do conteúdo; o “mais” abre um menu.',
            frame: true,
            node: function () {
              var bar = box('Barra', { dir: 'H', gap: 4, cross: 'center' });
              ['pencil', 'copy', 'download', 'trash'].forEach(function (n) { add(bar, ib(set, 'Padrão', 'M', n)); });
              var sep = shape('Divisor', { w: 1, h: 20, fill: 'color/border/default' });
              add(bar, box('Espaço', { dir: 'H', w: 8, h: 1 }));
              add(bar, sep);
              add(bar, box('Espaço', { dir: 'H', w: 8, h: 1 }));
              add(bar, ib(set, 'Padrão', 'M', 'more-horizontal'));
              return bar;
            },
          },
          {
            title: 'Com contorno e sutil',
            description: 'Contorno para alternar a sidebar; sutil para fechar algo que flutua.',
            frame: true,
            node: function () {
              var row = box('Exemplos', { dir: 'H', gap: 16, cross: 'center' });
              add(row, ib(set, 'Contorno', 'G', 'panel-left'));
              add(row, ib(set, 'Contorno', 'M', 'search'));
              add(row, ib(set, 'Sutil', 'M', 'x'));
              add(row, ib(set, 'Apagado', 'P', 'settings'));
              return row;
            },
          },
        ].concat(themed('Botão de ícone', async function () {
          var card = box('Painel', { dir: 'V', gap: 4, pad: [20, 20, 24, 24], fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl', w: 400 });
          var head = box('Cabeçalho', { dir: 'H', gap: 4, cross: 'start' });
          var titles = box('Títulos', { dir: 'V', gap: 2 });
          add(titles, await text('Exemplo', { style: 'eyebrow', color: 'color/fg/subtle' }));
          add(titles, await text('Roteiro da versão 0.4', { style: 'heading-sm' }));
          add(head, titles, { grow: true });
          add(head, ib(set, 'Apagado', 'M', 'stack'));
          add(head, ib(set, 'Apagado', 'M', 'x'));
          add(card, head, { fillW: true });
          add(card, await text('Três cenas curtas. Cada uma cabe em 20 segundos.', { style: 'body-sm', color: 'color/fg/muted', w: 320 }));
          return card;
        })),
      };
    },
  });

  /* ───────── Ação inline ───────── */

  var IA_VARIANTS = [
    ['Padrão', { fg: 'color/fg/subtle', hover: 'color/fg/default', weight: 'Regular' }],
    ['Forte', { fg: 'color/fg/default', hover: 'color/fg/brand', weight: 'Medium' }],
  ];
  var IA_STATES = ['Normal', 'Hover', 'Desativado'];

  async function buildInline(c, v, state) {
    box(c.name, { dir: 'H', gap: 'space/100', pad: [0, 4], cross: 'center', h: 28, radius: 'radius/xs' }, c);
    var fg = state === 'Hover' ? v.hover : v.fg;
    if (state === 'Desativado') disabled(c, 'opacity/muted');
    var lead = icon('video', 16, fg);
    exposes(lead, 'visible', 'Ícone à esquerda');
    exposes(lead, 'mainComponent', 'Trocar ícone');
    add(c, lead);
    add(c, await text('Ver demonstração', { style: 'label-sm', weight: v.weight, color: fg, prop: 'Rótulo', name: 'Rótulo' }));
    var sign = icon('plus', 14, fg);
    exposes(sign, 'visible', 'Sinal');
    exposes(sign, 'mainComponent', 'Trocar sinal');
    add(c, box('Espaço', { dir: 'H', w: 2, h: 1 }));
    add(c, sign);
  }

  var IA_SET = null;
  async function inlineSet() {
    if (IA_SET && !IA_SET.removed) return IA_SET;
    var items = [];
    IA_VARIANTS.forEach(function (v) {
      IA_STATES.forEach(function (state) {
        items.push({ props: { Variante: v[0], Estado: state }, build: function (c) { return buildInline(c, v[1], state); } });
      });
    });
    IA_SET = await variants('acao-inline', 'Ação inline', items, {
      description: 'A ação mais discreta: dentro do conteúdo, com + para acrescentar ou → para seguir.',
      columns: 3,
      gap: 32,
      rowGap: 20,
      props: {
        'Rótulo': ['TEXT', 'Ver demonstração'],
        'Ícone à esquerda': ['BOOLEAN', false],
        'Trocar ícone': ['INSTANCE_SWAP', 'video', ['video', 'play', 'history', 'pencil', 'link', 'file-text']],
        'Sinal': ['BOOLEAN', true],
        'Trocar sinal': ['INSTANCE_SWAP', 'plus', ['plus', 'arrow-right', 'chevron-right', 'external-link']],
      },
    });
    return IA_SET;
  }
  LUME.lib.inlineSet = inlineSet;

  /** Cabeçalho de seção do painel: "01 · Abertura" — selo + rótulo apagado. */
  async function sectionHead(stamp, label) {
    var h = box('Seção', { dir: 'H', gap: 'space/100', cross: 'center' });
    add(h, await text(stamp, { style: 'code-sm', color: 'color/fg/subtle' }));
    add(h, await text(label, { style: 'label-sm', color: 'color/fg/muted' }));
    return h;
  }
  LUME.lib.sectionHead = sectionHead;

  defineBlock({
    id: 'acao-inline',
    page: 'Componentes',
    row: 'Ações',
    order: 3,
    group: 'Ações',
    title: 'Ação inline',
    description: 'A ação que mora dentro do conteúdo — “Na cena +”, “Ver o que mudou →”. Texto apagado que acende no hover; a forte tem um pouco mais de presença.',
    build: async function () {
      var set = await inlineSet();
      return {
        sections: [
          {
            title: 'Variantes e estados',
            description: 'Padrão e forte × normal, hover e desativado.',
            span: 2,
            fill: false,
            node: function () { return labeledMatrix(set, IA_STATES, ['Padrão', 'Forte']); },
          },
          {
            title: 'Sinal e ícone',
            description: '+ acrescenta, → segue. O ícone à esquerda é opcional.',
            frame: true,
            node: function () {
              var col = box('Exemplos', { dir: 'V', gap: 10 });
              add(col, instance(set, { Variante: 'Padrão', Estado: 'Normal' }, { 'Rótulo': 'Na cena' }));
              add(col, instance(set, { Variante: 'Forte', Estado: 'Normal' }, { 'Rótulo': 'Ver o que mudou', 'Trocar sinal': 'arrow-right' }));
              add(col, instance(set, { Variante: 'Padrão', Estado: 'Normal' }, { 'Rótulo': 'Ver demonstração', 'Ícone à esquerda': true, 'Trocar ícone': 'video' }));
              return col;
            },
          },
          {
            title: 'Ao lado do título',
            description: 'A forte com → leva para a lista completa.',
            frame: true,
            node: async function () {
              var row = box('Cabeçalho', { dir: 'H', gap: 24, cross: 'center', w: 340 });
              add(row, await text('Atividade recente', { style: 'heading-xs' }), { grow: true });
              add(row, instance(set, { Variante: 'Forte', Estado: 'Normal' }, { 'Rótulo': 'Ver tudo', 'Trocar sinal': 'arrow-right' }));
              return row;
            },
          },
        ].concat(themed('Ação inline', async function () {
          var card = box('Painel', { dir: 'V', gap: 12, pad: 24, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl', w: 400 });
          add(card, await sectionHead('01', 'Abertura'));
          add(card, await text('Tela escura. O nome Lume aparece, sem enfeite.', { style: 'body-sm', color: 'color/fg/default', w: 340 }));
          add(card, instance(set, { Variante: 'Padrão', Estado: 'Normal' }, { 'Rótulo': 'Na cena', 'Ícone à esquerda': true, 'Trocar ícone': 'video' }));
          return card;
        })),
      };
    },
  });

  /* ───────── Chip ───────── */

  var CHIP_TYPES = ['Filtro', 'Seletor'];
  var CHIP_SIZES = [
    ['M', { h: 36, pad: 'space/200', glyph: 'space/150', style: 'label-sm', check: 14, icon: 16 }],
    ['P', { h: 30, pad: 'space/150', glyph: 'space/100', style: 'caption', check: 14, icon: 14 }],
  ];
  var CHIP_STATES = ['Normal', 'Hover', 'Selecionado', 'Foco', 'Desativado'];

  async function buildChip(c, type, s, state) {
    var selected = state === 'Selecionado';
    // como no site: recuo menor do lado que termina em ✓ ou seta (o desenho já tem respiro)
    var pl = type === 'Filtro' && selected ? s.glyph : s.pad;
    var pr = type === 'Seletor' ? s.glyph : s.pad;
    box(c.name, { dir: 'H', gap: 'space/100', pad: [0, pr, 0, pl], cross: 'center', h: s.h, radius: 'radius/full' }, c);
    if (state === 'Hover') fill(c, 'color/bg/hover');
    if (selected) fill(c, 'color/bg/selected');
    stroke(c, state === 'Hover' || selected ? 'color/border/strong' : 'color/border/control', 1);
    if (state === 'Foco') focusRing(c);
    if (state === 'Desativado') disabled(c);
    if (type === 'Filtro' && selected) add(c, icon('check', s.check, 'color/fg/default'));
    var lead = icon('pencil', s.icon, 'color/fg/brand');
    exposes(lead, 'visible', 'Ícone');
    exposes(lead, 'mainComponent', 'Trocar ícone');
    add(c, lead);
    add(c, await text(type === 'Seletor' ? 'Direto' : 'Pagos', { style: s.style, weight: 'Semi Bold', color: 'color/fg/default', prop: 'Rótulo', name: 'Rótulo' }));
    if (type === 'Seletor') add(c, icon(selected ? 'chevron-up' : 'chevron-down', 14, 'color/fg/subtle'));
  }

  var CHIP_SET = null;
  async function chipSet() {
    if (CHIP_SET && !CHIP_SET.removed) return CHIP_SET;
    var items = [];
    CHIP_TYPES.forEach(function (type) {
      CHIP_SIZES.forEach(function (s) {
        CHIP_STATES.forEach(function (state) {
          items.push({ props: { Tipo: type, Tamanho: s[0], Estado: state }, build: function (c) { return buildChip(c, type, s[1], state); } });
        });
      });
    });
    CHIP_SET = await variants('chip', 'Chip', items, {
      description: 'Pílula com contorno. Filtro liga e desliga (com ✓ quando ligado); seletor abre um menu (chevron).',
      columns: 5,
      gap: 24,
      rowGap: 18,
      props: {
        'Rótulo': ['TEXT', 'Direto'],
        'Ícone': ['BOOLEAN', false],
        'Trocar ícone': ['INSTANCE_SWAP', 'pencil', ['pencil', 'moon', 'sun', 'filter', 'calendar', 'user', 'tag', 'globe']],
      },
    });
    return CHIP_SET;
  }
  LUME.lib.chipSet = chipSet;

  var RM_SET = null;
  async function removableSet() {
    if (RM_SET && !RM_SET.removed) return RM_SET;
    var items = [];
    CHIP_SIZES.forEach(function (s) {
      ['Normal', 'Remover em hover'].forEach(function (state) {
        items.push({
          props: { Tamanho: s[0], Estado: state },
          build: async function (c) {
            box(c.name, { dir: 'H', gap: 'space/100', pad: [0, 'space/075', 0, s[1].pad], cross: 'center', h: s[1].h, radius: 'radius/full' }, c);
            stroke(c, 'color/border/control', 1);
            add(c, await text('Pagamentos', { style: s[1].style, weight: 'Semi Bold', color: 'color/fg/default', prop: 'Rótulo', name: 'Rótulo' }));
            var size = s[0] === 'P' ? 18 : 22;
            var x = box('Remover', { dir: 'H', align: 'center', cross: 'center', w: size, h: size, radius: 'radius/full' });
            if (state !== 'Normal') fill(x, 'color/bg/hover');
            add(x, icon('x', s[0] === 'P' ? 12 : 14, state === 'Normal' ? 'color/fg/subtle' : 'color/fg/default'));
            add(c, x);
          },
        });
      });
    });
    RM_SET = await variants('chip-removivel', 'Chip removível', items, {
      description: 'Mostra uma seleção que dá para tirar. O × tem nome acessível: “Remover Pagamentos”.',
      columns: 2,
      gap: 24,
      rowGap: 16,
      props: { 'Rótulo': ['TEXT', 'Pagamentos'] },
    });
    return RM_SET;
  }
  LUME.lib.removableChipSet = removableSet;

  function chip(set, type, size, state, label, extra) {
    var o = { 'Rótulo': label };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return instance(set, { Tipo: type, Tamanho: size, Estado: state }, o);
  }

  defineBlock({
    id: 'chip',
    page: 'Componentes',
    row: 'Ações',
    order: 4,
    group: 'Ações',
    title: 'Chip',
    description: 'Pílula com contorno para filtrar, escolher e mostrar seleções. Como filtro, liga e desliga; como seletor, abre um menu; removível, mostra o que já foi escolhido.',
    build: async function () {
      var set = await chipSet();
      var rm = await removableSet();
      return {
        sections: [
          {
            title: 'Tipos, tamanhos e estados',
            description: 'Filtro e seletor × médio (36 px) e pequeno (30 px) × 5 estados. Selecionado no seletor = menu aberto.',
            span: 2,
            fill: false,
            node: function () {
              var rows = [];
              CHIP_TYPES.forEach(function (t) { CHIP_SIZES.forEach(function (s) { rows.push(t + ' · ' + s[0]); }); });
              return labeledMatrix(set, CHIP_STATES, rows);
            },
          },
          {
            title: 'Removível',
            description: 'O × fica em hover separado do chip.',
            fill: false,
            node: function () { return labeledMatrix(rm, ['Normal', 'Remover em hover'], ['Médio', 'Pequeno']); },
          },
          {
            title: 'Filtros',
            description: 'O ✓ diz que está ligado — não depende só da cor.',
            frame: true,
            node: function () {
              var row = box('Filtros', { dir: 'H', wrap: true, gap: 8, rowGap: 8 });
              add(row, chip(set, 'Filtro', 'P', 'Selecionado', 'Pagos'));
              add(row, chip(set, 'Filtro', 'P', 'Normal', 'Pendentes'));
              add(row, chip(set, 'Filtro', 'P', 'Selecionado', 'Reembolsados'));
              add(row, chip(set, 'Filtro', 'P', 'Normal', 'Cancelados'));
              return row;
            },
          },
        ].concat(themed('Chip', async function () {
          var col = box('Filtros', { dir: 'V', gap: 16 });
          var top = box('Seletores', { dir: 'H', gap: 8 });
          add(top, chip(set, 'Seletor', 'M', 'Normal', 'Direto', { 'Ícone': true, 'Trocar ícone': 'pencil' }));
          add(top, chip(set, 'Seletor', 'M', 'Selecionado', 'Escuro', { 'Ícone': true, 'Trocar ícone': 'moon' }));
          add(col, top);
          var tags = box('Escolhidos', { dir: 'H', gap: 8 });
          add(tags, instance(rm, { Tamanho: 'P', Estado: 'Normal' }, { 'Rótulo': 'Pagamentos' }));
          add(tags, instance(rm, { Tamanho: 'P', Estado: 'Normal' }, { 'Rótulo': 'Cartões' }));
          add(col, tags);
          return col;
        })),
      };
    },
  });

  /* ───────── Badge ───────── */

  var TONES = [
    ['Neutro', { bg: 'color/bg/selected', fg: 'color/fg/muted', border: 'color/border/subtle' }],
    ['Marca', { bg: 'color/brand/subtle', fg: 'color/brand/fg', border: 'color/brand/border' }],
    ['Sucesso', { bg: 'color/success/subtle', fg: 'color/success/fg', border: 'color/success/border' }],
    ['Atenção', { bg: 'color/warning/subtle', fg: 'color/warning/fg', border: 'color/warning/border' }],
    ['Perigo', { bg: 'color/danger/subtle', fg: 'color/danger/fg', border: 'color/danger/border' }],
    ['Info', { bg: 'color/info/subtle', fg: 'color/info/fg', border: 'color/info/border' }],
  ];
  var BADGE_KINDS = ['Rótulo', 'Contagem'];
  var BADGE_SIZES = [
    ['M', { h: 24, px: 'space/100', pxCount: 'space/075', min: 24, style: 'label-sm', weight: null }],
    ['P', { h: 20, px: 'space/075', pxCount: 'space/050', min: 20, style: 'caption', weight: 'Medium' }],
  ];

  async function buildBadge(c, tone, kind, s) {
    var count = kind === 'Contagem';
    box(c.name, { dir: 'H', gap: 'space/075', pad: [0, count ? s.pxCount : s.px], cross: 'center', align: 'center', h: s.h, radius: 'radius/full', fill: tone.bg, stroke: tone.border }, c);
    if (count) {
      c.minWidth = s.min;
    } else {
      var dot = shape('Ponto', { ellipse: true, w: 6, h: 6, fill: tone.fg });
      exposes(dot, 'visible', 'Ponto');
      add(c, dot);
    }
    var o = { style: s.style, color: tone.fg, prop: count ? 'Número' : 'Rótulo', name: count ? 'Número' : 'Rótulo' };
    if (s.weight) o.weight = s.weight;
    add(c, await text(count ? '12' : 'Novo', o));
  }

  var BADGE_SET = null;
  async function badgeSet() {
    if (BADGE_SET && !BADGE_SET.removed) return BADGE_SET;
    var items = [];
    BADGE_KINDS.forEach(function (kind) {
      BADGE_SIZES.forEach(function (s) {
        TONES.forEach(function (t) {
          items.push({ props: { Tipo: kind, Tamanho: s[0], Tom: t[0] }, build: function (c) { return buildBadge(c, t[1], kind, s[1]); } });
        });
      });
    });
    BADGE_SET = await variants('badge', 'Badge', items, {
      description: 'Rótulo curto de status ou contagem. Status sempre com texto — o ponto e a cor só reforçam.',
      columns: 6,
      gap: 24,
      rowGap: 16,
      props: {
        'Rótulo': ['TEXT', 'Novo'],
        'Número': ['TEXT', '12'],
        'Ponto': ['BOOLEAN', false],
      },
    });
    return BADGE_SET;
  }
  LUME.lib.badgeSet = badgeSet;

  function badge(set, tone, label, o) {
    o = o || {};
    var props = { Tipo: o.count ? 'Contagem' : 'Rótulo', Tamanho: o.size || 'M', Tom: tone };
    var over = o.count ? { 'Número': label } : { 'Rótulo': label, 'Ponto': !!o.dot };
    return instance(set, props, over);
  }
  LUME.lib.badge = badge;

  defineBlock({
    id: 'badge',
    page: 'Componentes',
    row: 'Ações',
    order: 5,
    group: 'Ações',
    title: 'Badge',
    description: 'Rótulo curto de status ou contagem — nunca enfeite. Seis tons, dois tamanhos, ponto opcional e uma versão de contagem com largura mínima de círculo.',
    build: async function () {
      var set = await badgeSet();
      return {
        sections: [
          {
            title: 'Tons, tamanhos e tipos',
            description: '6 tons × médio (24 px) e pequeno (20 px) × rótulo e contagem.',
            span: 2,
            fill: false,
            node: function () {
              return labeledMatrix(set, TONES.map(function (t) { return t[0]; }), ['Rótulo · M', 'Rótulo · P', 'Contagem · M', 'Contagem · P']);
            },
          },
          {
            title: 'Com ponto',
            description: 'O ponto ajuda a varrer uma lista de status.',
            frame: true,
            node: function () {
              var row = box('Status', { dir: 'H', gap: 8, wrap: true, rowGap: 8 });
              add(row, badge(set, 'Sucesso', 'Pronto', { dot: true }));
              add(row, badge(set, 'Atenção', 'Em revisão', { dot: true }));
              add(row, badge(set, 'Perigo', 'Bloqueado', { dot: true }));
              add(row, badge(set, 'Neutro', 'Rascunho', { dot: true }));
              return row;
            },
          },
          {
            title: 'Contagem',
            description: 'Número centralizado, alinhado em colunas.',
            frame: true,
            node: function () {
              var row = box('Contagens', { dir: 'H', gap: 8, cross: 'center' });
              add(row, badge(set, 'Neutro', '3', { count: true }));
              add(row, badge(set, 'Marca', '12', { count: true }));
              add(row, badge(set, 'Perigo', '99+', { count: true }));
              add(row, badge(set, 'Neutro', '8', { count: true, size: 'P' }));
              return row;
            },
          },
        ].concat(themed('Badge', async function () {
          var list = box('Novidades', { dir: 'V', gap: 0, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl', w: 400, clip: true });
          var rows = [['Marca', 'Novo', 'Seção de gráficos'], ['Info', 'Melhoria', 'Tooltip segue a WCAG 1.4.13'], ['Sucesso', 'Correção', 'Contorno dos campos a 3:1']];
          for (var i = 0; i < rows.length; i++) {
            var r = box('Item', { dir: 'H', gap: 16, pad: [14, 20], cross: 'center' });
            if (i) { stroke(r, 'color/border/subtle', 0); r.strokeTopWeight = 1; }
            var b = box('Tipo', { dir: 'H', w: 84 });
            add(b, badge(set, rows[i][0], rows[i][1], { size: 'P' }));
            add(r, b);
            add(r, await text(rows[i][2], { style: 'body-sm', color: 'color/fg/default' }), { grow: true });
            add(list, r, { fillW: true });
          }
          return list;
        })),
      };
    },
  });
})();
