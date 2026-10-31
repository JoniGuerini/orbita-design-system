/**
 * Navegação: Abas, Controle segmentado, Menu e Trilha (breadcrumb).
 * Mesmo desenho de ds/components/tabs.css, form.css (.ds-segmented), menu.css e feedback.css (.ds-breadcrumb).
 */
(function () {
  ORB.lib = ORB.lib || {};

  function focusInside(c) {
    stroke(c, 'color/border/focus', 'focus-ring/width', { align: 'INSIDE' });
  }

  /* ───────── Abas ───────── */

  var TAB_LOOKS = [
    ['Sublinhada', {
      M: { h: 36, px: 'space/150', inset: 12, below: 8, style: 'label-md', radius: 'radius/sm' },
      P: { h: 30, px: 'space/100', inset: 8, below: 6, style: 'label-sm', radius: 'radius/sm' },
    }],
    ['Segmentada', {
      M: { h: 32, px: 'space/200', style: 'label-md', radius: 'radius/full' },
      P: { h: 26, px: 'space/150', style: 'label-sm', radius: 'radius/full' },
    }],
  ];
  var TAB_STATES = ['Normal', 'Hover', 'Selecionada', 'Foco', 'Desativada'];

  async function buildTab(c, look, size, s, state) {
    box(c.name, { dir: 'H', gap: 'space/100', pad: [0, s.px], cross: 'center', align: 'center', h: s.h, radius: s.radius }, c);
    c.clipsContent = false;
    var selected = state === 'Selecionada';
    var fg = selected || state === 'Hover' ? 'color/fg/default' : 'color/fg/subtle';
    if (look === 'Sublinhada' && state === 'Hover') fill(c, 'color/bg/hover');
    if (look === 'Segmentada' && selected) fill(c, 'color/bg/muted');
    if (state === 'Foco') focusInside(c);
    if (state === 'Desativada') num(c, 'opacity', 'opacity/disabled');
    var ic = icon('layers', size === 'P' ? 14 : 16, fg);
    exposes(ic, 'visible', 'Ícone');
    exposes(ic, 'mainComponent', 'Trocar ícone');
    add(c, ic);
    add(c, await text('Visão geral', { style: s.style, color: fg, prop: 'Rótulo', name: 'Rótulo' }));
    var count = box('Contagem', { dir: 'H', align: 'center', cross: 'center', pad: [0, 'space/075'], h: 20, radius: 'radius/full', fill: 'color/bg/selected' });
    count.minWidth = 20;
    add(count, await text('3', { style: 'caption', weight: 'Medium', color: 'color/fg/muted', prop: 'Número', name: 'Número' }));
    exposes(count, 'visible', 'Contagem');
    add(c, count);
    // opcionais começam escondidos (como os padrões das propriedades) antes de medir o indicador
    ic.visible = false;
    count.visible = false;
    if (look === 'Sublinhada') {
      // indicador: 2 px na cor da marca, sobre a linha da lista (fica abaixo da aba, como no CSS)
      var bar = shape('Indicador', { w: Math.max(4, c.width - s.inset * 2), h: 2, fill: 'color/brand/solid', radius: 2 });
      add(c, bar, { absolute: true, x: s.inset, y: s.h + s.below - 2 });
      bar.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
      bar.visible = selected;
    }
  }

  var TAB_SET = null;
  async function tabSet() {
    if (TAB_SET && !TAB_SET.removed) return TAB_SET;
    var items = [];
    TAB_LOOKS.forEach(function (l) {
      ['M', 'P'].forEach(function (size) {
        TAB_STATES.forEach(function (state) {
          items.push({ props: { 'Aparência': l[0], Tamanho: size, Estado: state }, build: function (c) { return buildTab(c, l[0], size, l[1][size], state); } });
        });
      });
    });
    TAB_SET = await variants('aba', 'Abas/Aba', items, {
      description: 'Uma aba. Sublinhada: indicador de 2 px na cor da marca. Segmentada: pílula com fundo na selecionada.',
      columns: 5,
      gap: 28,
      rowGap: 24,
      props: {
        'Rótulo': ['TEXT', 'Visão geral'],
        'Ícone': ['BOOLEAN', false],
        'Trocar ícone': ['INSTANCE_SWAP', 'layers', ['layers', 'home', 'bar-chart', 'settings', 'users', 'file-text', 'history']],
        'Contagem': ['BOOLEAN', false],
        'Número': ['TEXT', '3'],
      },
    });
    return TAB_SET;
  }

  function tab(set, look, size, state, label, extra) {
    var o = { 'Rótulo': label };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return instance(set, { 'Aparência': look, Tamanho: size, Estado: state }, o);
  }

  var TABS_DEMO = [['Visão geral', 'Selecionada'], ['Atividade', 'Normal', { 'Contagem': true, 'Número': '3' }], ['Membros', 'Normal']];

  async function underlineList() {
    var set = await tabSet();
    return component('abas-sublinhada', 'Abas/Lista sublinhada', async function (c) {
      box(c.name, { dir: 'H', gap: 'space/050', pad: ['space/100', 0] }, c);
      stroke(c, 'color/border/subtle', 0);
      c.strokeBottomWeight = 1;
      c.clipsContent = false;
      TABS_DEMO.forEach(function (t) { add(c, tab(set, 'Sublinhada', 'M', t[1], t[0], t[2])); });
    }, { description: 'Lista de abas sublinhada: linha fina embaixo, a aba ativa marca a linha.' });
  }

  async function segmentedList() {
    var set = await tabSet();
    return component('abas-segmentada', 'Abas/Lista segmentada', async function (c) {
      box(c.name, { dir: 'H', gap: 2, pad: 3, radius: 'radius/full', fill: 'color/bg/sunken', stroke: 'color/border/subtle' }, c);
      [['Dia', 'Normal'], ['Semana', 'Selecionada'], ['Mês', 'Normal']].forEach(function (t) { add(c, tab(set, 'Segmentada', 'M', t[1], t[0])); });
    }, { description: 'Abas segmentadas: para alternar vistas curtas do mesmo conteúdo.' });
  }

  defineBlock({
    id: 'abas',
    page: 'Componentes',
    row: 'Navegação',
    order: 1,
    group: 'Navegação',
    title: 'Abas',
    description: 'Alternam vistas do mesmo assunto sem sair da página. Sublinhada para seções de uma tela; segmentada para vistas curtas, como dia, semana e mês.',
    build: async function () {
      var set = await tabSet();
      var line = await underlineList();
      var seg = await segmentedList();
      return {
        sections: [
          {
            title: 'Aparências, tamanhos e estados',
            description: 'Sublinhada e segmentada × médio e pequeno × 5 estados. Ícone e contagem são opcionais.',
            span: 2,
            fill: false,
            node: function () {
              return labeledMatrix(set, TAB_STATES, ['Sublinhada · M', 'Sublinhada · P', 'Segmentada · M', 'Segmentada · P']);
            },
          },
          { title: 'Lista sublinhada', description: 'A linha da lista é o trilho do indicador.', node: line, fill: false },
          { title: 'Lista segmentada', description: 'Fundo rebaixado e a selecionada em destaque.', node: seg, fill: false },
        ].concat(themed('Abas', async function () {
          var panel = box('Painel', { dir: 'V', gap: 20, pad: [20, 24, 28, 24], fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl', w: 416 });
          add(panel, await text('Projeto Órbita', { style: 'heading-sm' }));
          var list = line.createInstance();
          add(panel, list, { fillW: true });
          var lines = box('Conteúdo', { dir: 'V', gap: 8 });
          add(lines, await text('12 tarefas abertas · 3 em revisão', { style: 'body-sm', color: 'color/fg/muted' }));
          add(lines, await text('Última atualização há 2 horas', { style: 'caption', color: 'color/fg/subtle' }));
          add(panel, lines);
          return panel;
        })),
      };
    },
  });

  /* ───────── Controle segmentado ───────── */

  var SEG_STATES = ['Normal', 'Hover', 'Selecionado'];

  async function buildSegment(c, content, state) {
    box(c.name, { dir: 'H', align: 'center', cross: 'center', pad: [0, 'space/100'], h: 30, radius: 'radius/full' }, c);
    c.minWidth = 30;
    var fg = state === 'Normal' ? 'color/fg/subtle' : 'color/fg/default';
    if (state === 'Selecionado') fill(c, 'color/bg/muted');
    if (content === 'Ícone') {
      var ic = icon('moon', 16, fg);
      exposes(ic, 'mainComponent', 'Ícone');
      add(c, ic);
    } else {
      add(c, await text('Semana', { style: 'label-sm', color: fg, prop: 'Rótulo', name: 'Rótulo' }));
    }
  }

  var SEG_SET = null;
  async function segmentSet() {
    if (SEG_SET && !SEG_SET.removed) return SEG_SET;
    var items = [];
    ['Ícone', 'Texto'].forEach(function (content) {
      SEG_STATES.forEach(function (state) {
        items.push({ props: { 'Conteúdo': content, Estado: state }, build: function (c) { return buildSegment(c, content, state); } });
      });
    });
    SEG_SET = await variants('segmento', 'Controle segmentado/Item', items, {
      description: 'Um item do controle segmentado. Só ícone pede nome acessível e tooltip.',
      columns: 3,
      gap: 28,
      rowGap: 20,
      props: {
        'Rótulo': ['TEXT', 'Semana'],
        'Ícone': ['INSTANCE_SWAP', 'moon', ['moon', 'sun', 'monitor', 'list', 'grid', 'bar-chart']],
      },
    });
    return SEG_SET;
  }

  async function themeControl() {
    var set = await segmentSet();
    return component('segmentado-tema', 'Controle segmentado/Tema', async function (c) {
      box(c.name, { dir: 'H', gap: 2, pad: 3, radius: 'radius/full', fill: 'color/bg/sunken', stroke: 'color/border/subtle' }, c);
      [['moon', 'Selecionado'], ['sun', 'Normal'], ['monitor', 'Normal']].forEach(function (s) {
        add(c, instance(set, { 'Conteúdo': 'Ícone', Estado: s[1] }, { 'Ícone': s[0] }));
      });
    }, { description: 'Escuro, claro e sistema — o mesmo controle da topbar.' });
  }
  ORB.lib.themeControl = themeControl;

  async function textControl() {
    var set = await segmentSet();
    return component('segmentado-texto', 'Controle segmentado/Período', async function (c) {
      box(c.name, { dir: 'H', gap: 2, pad: 3, radius: 'radius/full', fill: 'color/bg/sunken', stroke: 'color/border/subtle' }, c);
      [['7 dias', 'Normal'], ['30 dias', 'Selecionado'], ['90 dias', 'Normal'], ['12 meses', 'Normal']].forEach(function (s) {
        add(c, instance(set, { 'Conteúdo': 'Texto', Estado: s[1] }, { 'Rótulo': s[0] }));
      });
    }, { description: 'Filtro de período: uma escolha entre poucas opções curtas.' });
  }

  defineBlock({
    id: 'segmentado',
    page: 'Componentes',
    row: 'Navegação',
    order: 2,
    group: 'Navegação',
    title: 'Controle segmentado',
    description: 'Uma escolha entre duas a quatro opções curtas, com efeito na hora — tema, período, vista. Pílula rebaixada; a opção escolhida ganha fundo.',
    build: async function () {
      var set = await segmentSet();
      var themeC = await themeControl();
      var textC = await textControl();
      return {
        sections: [
          {
            title: 'Item',
            description: 'Ícone ou texto × normal, hover e selecionado.',
            fill: false,
            node: function () { return labeledMatrix(set, SEG_STATES, ['Ícone', 'Texto']); },
          },
          {
            title: 'Montados',
            description: 'Tema (ícones) e período (texto).',
            frame: true,
            node: function () {
              var col = box('Controles', { dir: 'V', gap: 16 });
              add(col, themeC);
              add(col, textC);
              return col;
            },
          },
        ].concat(themed('Controle segmentado', async function () {
          var bar = box('Filtros', { dir: 'H', gap: 16, cross: 'center', pad: [16, 20], fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          add(bar, await text('Período', { style: 'label-sm', color: 'color/fg/muted' }));
          add(bar, textC.createInstance());
          return bar;
        })),
      };
    },
  });

  /* ───────── Menu ───────── */

  var MENU_KINDS = [
    ['Opção', { fg: 'color/fg/muted', icon: 'color/fg/subtle' }],
    ['Opção selecionada', { fg: 'color/fg/default', icon: 'color/fg/subtle', check: true }],
    ['Ação', { fg: 'color/fg/default', icon: 'color/fg/subtle' }],
    ['Perigo', { fg: 'color/danger/fg', icon: 'color/danger/fg', hoverBg: 'color/danger/subtle', danger: true }],
  ];
  var MENU_STATES = ['Normal', 'Hover', 'Desativado'];

  async function buildMenuItem(c, k, state) {
    box(c.name, { dir: 'H', gap: 'space/150', pad: [0, 'space/150'], cross: 'center', w: 240, h: 36, radius: 10 }, c);
    var hover = state === 'Hover';
    if (hover) fill(c, k.hoverBg || 'color/bg/hover');
    if (state === 'Desativado') num(c, 'opacity', 'opacity/disabled');
    var fg = hover && !k.danger ? 'color/fg/default' : k.fg;
    var ic = icon('copy', 18, k.icon);
    exposes(ic, 'visible', 'Ícone');
    exposes(ic, 'mainComponent', 'Trocar ícone');
    add(c, ic);
    add(c, await text(k.danger ? 'Excluir' : 'Duplicar', { style: 'label-md', color: fg, prop: 'Rótulo', name: 'Rótulo', truncate: true }), { grow: true });
    var sc = await text('⌘D', { style: 'caption', color: 'color/fg/subtle', prop: 'Texto do atalho', name: 'Atalho' });
    exposes(sc, 'visible', 'Atalho');
    add(c, sc);
    if (k.check) add(c, icon('check', 16, 'color/fg/brand'));
  }

  var MENU_SET = null;
  async function menuItemSet() {
    if (MENU_SET && !MENU_SET.removed) return MENU_SET;
    var items = [];
    MENU_KINDS.forEach(function (k) {
      MENU_STATES.forEach(function (state) {
        items.push({ props: { Tipo: k[0], Estado: state }, build: function (c) { return buildMenuItem(c, k[1], state); } });
      });
    });
    MENU_SET = await variants('menu-item', 'Menu/Item', items, {
      description: 'Item de menu: opção (com ✓ quando escolhida), ação ou perigo. Atalho e ícone são opcionais.',
      columns: 3,
      gap: 24,
      rowGap: 12,
      props: {
        'Rótulo': ['TEXT', 'Duplicar'],
        'Ícone': ['BOOLEAN', true],
        'Trocar ícone': ['INSTANCE_SWAP', 'copy', ['copy', 'pencil', 'trash', 'download', 'link', 'star', 'moon', 'sun', 'monitor', 'list', 'grid']],
        'Atalho': ['BOOLEAN', false],
        'Texto do atalho': ['TEXT', '⌘D'],
      },
    });
    return MENU_SET;
  }
  ORB.lib.menuItemSet = menuItemSet;

  async function menuGroup() {
    return component('menu-grupo', 'Menu/Grupo', async function (c) {
      box(c.name, { dir: 'H', pad: ['space/150', 'space/150', 'space/050', 'space/150'], w: 240 }, c);
      add(c, await text('Editar', { style: 'caption', color: 'color/fg/subtle', name: 'Rótulo' }));
    }, { description: 'Rótulo de grupo dentro do menu.' });
  }

  async function menuSeparator() {
    return component('menu-separador', 'Menu/Separador', async function (c) {
      box(c.name, { dir: 'V', pad: [6, 0], w: 252 }, c);
      var line = shape('Linha', { w: 252, h: 1, fill: 'color/border/subtle' });
      add(c, line, { fillW: true });
    }, { description: 'Divide grupos; vai de borda a borda do menu.' });
  }

  async function composedMenu() {
    var set = await menuItemSet();
    var group = await menuGroup();
    var sep = await menuSeparator();
    return component('menu', 'Menu/Menu', async function (c) {
      box(c.name, { dir: 'V', gap: 0, pad: 6, w: 252, fill: 'color/bg/raised', stroke: 'color/border/strong', radius: 'radius/lg' }, c);
      shadow(c, 'md');
      var g1 = group.createInstance();
      add(c, g1, { fillW: true });
      add(c, instance(set, { Tipo: 'Ação', Estado: 'Normal' }, { 'Rótulo': 'Duplicar', 'Trocar ícone': 'copy', 'Atalho': true, 'Texto do atalho': '⌘D' }), { fillW: true });
      add(c, instance(set, { Tipo: 'Ação', Estado: 'Hover' }, { 'Rótulo': 'Renomear', 'Trocar ícone': 'pencil', 'Atalho': true, 'Texto do atalho': 'F2' }), { fillW: true });
      add(c, instance(set, { Tipo: 'Ação', Estado: 'Desativado' }, { 'Rótulo': 'Mover para…', 'Trocar ícone': 'folder' }), { fillW: true });
      var s1 = sep.createInstance();
      add(c, s1);
      s1.layoutSizingHorizontal = 'FILL';
      add(c, instance(set, { Tipo: 'Opção selecionada', Estado: 'Normal' }, { 'Rótulo': 'Grade', 'Trocar ícone': 'grid' }), { fillW: true });
      add(c, instance(set, { Tipo: 'Opção', Estado: 'Normal' }, { 'Rótulo': 'Lista', 'Trocar ícone': 'list' }), { fillW: true });
      var s2 = sep.createInstance();
      add(c, s2);
      s2.layoutSizingHorizontal = 'FILL';
      add(c, instance(set, { Tipo: 'Perigo', Estado: 'Normal' }, { 'Rótulo': 'Excluir', 'Trocar ícone': 'trash', 'Atalho': true, 'Texto do atalho': '⌫' }), { fillW: true });
    }, { description: 'Menu montado: grupos, ações com atalho, opção escolhida e a ação destrutiva por último.' });
  }

  defineBlock({
    id: 'menu',
    page: 'Componentes',
    row: 'Navegação',
    order: 3,
    group: 'Navegação',
    title: 'Menu',
    description: 'Lista que abre de um chip ou botão, para escolher um valor ou disparar ações. Grupos com rótulo, separadores, atalhos à direita e a ação destrutiva sempre no fim.',
    build: async function () {
      var set = await menuItemSet();
      var group = await menuGroup();
      var sep = await menuSeparator();
      var menu = await composedMenu();
      return {
        sections: [
          {
            title: 'Item',
            description: '4 tipos × normal, hover e desativado.',
            span: 2,
            fill: false,
            node: function () { return labeledMatrix(set, MENU_STATES, MENU_KINDS.map(function (k) { return k[0]; })); },
          },
          {
            title: 'Grupo e separador',
            description: 'O rótulo do grupo é texto apagado; o separador vai de borda a borda.',
            frame: true,
            node: function () {
              var col = box('Partes', { dir: 'V', gap: 12, w: 252 });
              add(col, group);
              add(col, sep, { fillW: true });
              return col;
            },
          },
          { title: 'Menu montado', description: 'Fundo elevado, contorno forte e sombra.', node: menu, fill: false },
        ].concat(themed('Menu', async function () {
          var col = box('Gatilho e menu', { dir: 'V', gap: 8 });
          if (ORB.lib.chipSet) {
            var chips = await ORB.lib.chipSet();
            add(col, instance(chips, { Tipo: 'Seletor', Tamanho: 'M', Estado: 'Selecionado' }, { 'Rótulo': 'Visualização' }));
          }
          add(col, menu.createInstance());
          return col;
        })),
      };
    },
  });

  /* ───────── Trilha (breadcrumb) ───────── */

  var CRUMB_STATES = [['Link', 'color/fg/subtle'], ['Hover', 'color/fg/default'], ['Atual', 'color/fg/default']];

  var CRUMB_SET = null;
  async function crumbSet() {
    if (CRUMB_SET && !CRUMB_SET.removed) return CRUMB_SET;
    var items = CRUMB_STATES.map(function (s) {
      return {
        props: { Estado: s[0] },
        build: async function (c) {
          box(c.name, { dir: 'H', cross: 'center', radius: 'radius/xs' }, c);
          add(c, await text(s[0] === 'Atual' ? 'Cores' : 'Fundamentos', { style: 'label-md', color: s[1], prop: 'Rótulo', name: 'Rótulo' }));
        },
      };
    });
    CRUMB_SET = await variants('trilha-item', 'Trilha/Item', items, {
      description: 'Página na trilha. As anteriores são links apagados; a atual (aria-current) fica em destaque.',
      columns: 3,
      gap: 32,
      props: { 'Rótulo': ['TEXT', 'Fundamentos'] },
    });
    return CRUMB_SET;
  }

  async function crumbSeparator() {
    return component('trilha-separador', 'Trilha/Separador', async function (c) {
      box(c.name, { dir: 'H', cross: 'center' }, c);
      var ic = icon('chevron-right', 14, 'color/fg/subtle');
      ic.opacity = 0.6;
      add(c, ic);
    }, { description: 'Chevron entre as páginas, a 60% de opacidade.' });
  }

  async function trail() {
    var set = await crumbSet();
    var sep = await crumbSeparator();
    return component('trilha', 'Trilha/Trilha', async function (c) {
      box(c.name, { dir: 'H', gap: 'space/075', cross: 'center' }, c);
      add(c, instance(set, { Estado: 'Link' }, { 'Rótulo': 'Início' }));
      add(c, sep.createInstance());
      add(c, instance(set, { Estado: 'Link' }, { 'Rótulo': 'Fundamentos' }));
      add(c, sep.createInstance());
      add(c, instance(set, { Estado: 'Atual' }, { 'Rótulo': 'Cores' }));
    }, { description: 'Trilha montada. No celular, mostre só a página atual.' });
  }

  defineBlock({
    id: 'trilha',
    page: 'Componentes',
    row: 'Navegação',
    order: 4,
    group: 'Navegação',
    title: 'Trilha',
    description: 'Mostra onde a página está e leva de volta aos níveis de cima. Fica na topbar; no celular, só a página atual aparece.',
    tags: ['Componente', 'Breadcrumb', 'Claro · Escuro'],
    build: async function () {
      var set = await crumbSet();
      var sep = await crumbSeparator();
      var t = await trail();
      return {
        sections: [
          {
            title: 'Item e separador',
            description: 'Link, hover e atual; o chevron separa.',
            frame: true,
            node: function () {
              var row = box('Partes', { dir: 'H', gap: 32, cross: 'center' });
              add(row, set);
              add(row, sep);
              return row;
            },
          },
          { title: 'Trilha montada', description: 'Início › Fundamentos › Cores.', frame: true, node: function () { return t; } },
        ].concat(themed('Trilha', async function () {
          var bar = box('Topbar', { dir: 'H', gap: 32, cross: 'center', pad: [12, 12, 12, 20], fill: 'color/bg/canvas', stroke: 'color/border/subtle', radius: 'radius/xl' });
          add(bar, t.createInstance());
          if (ORB.lib.themeControl) add(bar, (await ORB.lib.themeControl()).createInstance());
          return bar;
        })),
      };
    },
  });
})();
