/**
 * Dados e conteúdo: Avatar, Painel e cartão, Tabela, Indicador e medidor.
 * Espelha ds/components/surfaces.css, panel.css, table.css e chart.css (.ds-stat, .ds-meter).
 */
(function () {
  /* ───────── Peças pequenas (locais a este arquivo) ───────── */

  /** Botão só de ícone, sem fundo (o .ds-icon-btn padrão) — desenhado aqui, sem depender de outro bloco. */
  function iconButton(name, size, color) {
    var s = size || 36;
    var b = box('Botão de ícone · ' + name, { dir: 'H', align: 'center', cross: 'center', w: s, h: s, radius: 'radius/sm' });
    add(b, icon(name, s <= 32 ? 16 : 20, color || 'color/fg/muted'));
    return b;
  }

  /** Chip com contorno (seletor): ícone opcional, rótulo e chevron. */
  async function chip(label, iconName) {
    var c = box('Chip · ' + label, { dir: 'H', gap: 'space/100', pad: [0, 'space/150', 0, iconName ? 'space/150' : 'space/200'], cross: 'center', h: 36, radius: 'radius/full', stroke: 'color/border/control' });
    if (iconName) add(c, icon(iconName, 16, 'color/fg/muted'));
    add(c, await text(label, { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default' }));
    add(c, icon('chevron-down', 14, 'color/fg/subtle'));
    return c;
  }

  /** Ação inline: a mais discreta ("Na cena +"). */
  async function inlineAction(label, trailing) {
    var a = box('Ação inline · ' + label, { dir: 'H', gap: 'space/100', cross: 'center', h: 28 });
    add(a, await text(label, { style: 'label-sm', weight: 'Regular', color: 'color/fg/subtle' }));
    if (trailing) add(a, icon(trailing, 14, 'color/fg/subtle'));
    return a;
  }

  /* ───────── Avatar ───────── */

  var AV_SIZES = [['XS', 24], ['P', 32], ['M', 40], ['G', 48], ['GG', 64]];
  var AV_TONES = [['Neutro', null], ['Areia', 'sand'], ['Argila', 'clay'], ['Ocre', 'ochre'], ['Ardósia', 'slate'], ['Verde', 'green'], ['Verde-azulado', 'teal'], ['Azul', 'blue'], ['Violeta', 'violet'], ['Rosa', 'pink']];
  var AV_STATUS = [['Online', 'color/success/solid'], ['Ausente', 'color/warning/solid'], ['Ocupado', 'color/danger/solid'], ['Offline', 'color/fg/disabled']];
  var AV = {};

  /**
   * Fundo do tom: a superfície elevada com uma camada do tom a 24% por cima (o color-mix do CSS).
   * A camada é um retângulo absoluto atrás das iniciais — opaco no conjunto, então avatares empilhados não vazam.
   */
  function toneFill(node, tone, px, radiusVar) {
    if (!tone) {
      fill(node, 'color/bg/muted');
      stroke(node, 'color/border/subtle', 1);
      return;
    }
    fill(node, 'color/bg/raised');
    var tint = shape('Tom', { w: px, h: px, radius: radiusVar || 'radius/full' });
    fill(tint, 'color/' + tone + '/400', 0.24);
    add(node, tint, { absolute: true, x: 0, y: 0 });
    tint.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  }

  async function avatarStatusSet() {
    if (AV.status && !AV.status.removed) return AV.status;
    AV.status = await variants('avatar-status', 'Avatar/Status', AV_STATUS.map(function (s) {
      return {
        props: { Estado: s[0] },
        build: async function (c) {
          box(c.name, { dir: 'none' }, c);
          c.resize(12, 12);
          var dot = shape('Ponto', { ellipse: true, w: 12, h: 12, fill: s[1] });
          stroke(dot, 'color/bg/canvas', 2, { align: 'OUTSIDE' });
          c.appendChild(dot);
          dot.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
        },
      };
    }), { description: 'Presença. Fica no canto do avatar, com um anel da cor do fundo.', columns: 4, gap: 24 });
    return AV.status;
  }

  async function avatarSet() {
    if (AV.set && !AV.set.removed) return AV.set;
    var status = await avatarStatusSet();
    var items = [];
    AV_SIZES.forEach(function (sz) {
      AV_TONES.forEach(function (tone) {
        items.push({
          props: { Tamanho: sz[0], Tom: tone[0] },
          build: async function (c) {
            var px = sz[1];
            box(c.name, { dir: 'H', align: 'center', cross: 'center', w: px, h: px, radius: 'radius/full' }, c);
            toneFill(c, tone[1], px);
            var t = await text('AS', { style: 'label-md', weight: 'Semi Bold', size: Math.max(10, Math.round(px * 0.38)), color: tone[1] ? 'color/fg/default' : 'color/fg/muted', prop: 'Iniciais', name: 'Iniciais' });
            add(c, t);
            var d = Math.max(8, Math.round(px * 0.28));
            var dot = instance(status, { Estado: 'Online' });
            dot.name = 'Status'; // no Figma a instância nasce com o nome do conjunto; “Status” aparece no painel
            dot.resize(d, d);
            add(c, dot, { absolute: true, x: px - d + 1, y: px - d + 1 });
            dot.isExposedInstance = true;
            exposes(dot, 'visible', 'Status');
          },
        });
      });
    });
    AV.set = await variants('avatar', 'Avatar', items, {
      description: 'Iniciais num tom estável por pessoa. Ligue “Status” e troque o estado na instância aninhada.',
      columns: AV_TONES.length,
      gap: 18,
      rowGap: 20,
      props: { 'Iniciais': ['TEXT', 'AS'], 'Status': ['BOOLEAN', false] },
    });
    return AV.set;
  }

  async function avatarIconSet() {
    if (AV.icon && !AV.icon.removed) return AV.icon;
    AV.icon = await variants('avatar-icone', 'Avatar/Ícone', AV_SIZES.map(function (sz) {
      return {
        props: { Tamanho: sz[0] },
        build: async function (c) {
          box(c.name, { dir: 'H', align: 'center', cross: 'center', w: sz[1], h: sz[1], radius: 'radius/full' }, c);
          toneFill(c, null, sz[1]);
          add(c, icon('user', Math.round(sz[1] / 2), 'color/fg/muted'));
        },
      };
    }), { description: 'Sem foto nem nome: o ícone de pessoa.', columns: 5, gap: 18 });
    return AV.icon;
  }

  // quadrado: para times, empresas e espaços de trabalho; o canto acompanha o tamanho
  var SQ_TONES = [['Neutro', null], ['Areia', 'sand'], ['Ardósia', 'slate'], ['Azul', 'blue'], ['Verde', 'green']];

  async function avatarSquareSet() {
    if (AV.square && !AV.square.removed) return AV.square;
    var items = [];
    AV_SIZES.forEach(function (sz) {
      SQ_TONES.forEach(function (tone) {
        items.push({
          props: { Tamanho: sz[0], Tom: tone[0] },
          build: async function (c) {
            var px = sz[1];
            var corner = px <= 32 ? 'radius/sm' : 'radius/md';
            box(c.name, { dir: 'H', align: 'center', cross: 'center', w: px, h: px, radius: corner }, c);
            toneFill(c, tone[1], px, corner);
            add(c, await text('PG', { style: 'label-md', weight: 'Semi Bold', size: Math.max(10, Math.round(px * 0.38)), color: tone[1] ? 'color/fg/default' : 'color/fg/muted', prop: 'Iniciais', name: 'Iniciais' }));
          },
        });
      });
    });
    AV.square = await variants('avatar-quadrado', 'Avatar/Quadrado', items, {
      description: 'Para times, empresas e espaços de trabalho. Cantos de 8 px até 32 px e de 12 px acima disso.',
      columns: SQ_TONES.length,
      gap: 18,
      rowGap: 20,
      props: { 'Iniciais': ['TEXT', 'PG'] },
    });
    return AV.square;
  }

  async function avatarGroup() {
    if (AV.group && !AV.group.removed) return AV.group;
    var set = await avatarSet();
    AV.group = await component('avatar-grupo', 'Avatar/Grupo', async function (c) {
      box(c.name, { dir: 'H', gap: -8, cross: 'center' }, c);
      [['AS', 'Areia'], ['BL', 'Azul'], ['CM', 'Verde'], ['DR', 'Rosa']].forEach(function (p) {
        var a = instance(set, { Tamanho: 'M', Tom: p[1] }, { 'Iniciais': p[0] });
        stroke(a, 'color/bg/canvas', 2, { align: 'OUTSIDE' });
        add(c, a);
      });
      var more = box('Mais', { dir: 'H', align: 'center', cross: 'center', w: 40, h: 40, radius: 'radius/full', fill: 'color/bg/muted' });
      stroke(more, 'color/bg/canvas', 2, { align: 'OUTSIDE' });
      add(more, await text('+3', { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default', prop: 'Mais', name: 'Mais' }));
      add(c, more);
    }, { description: 'Grupo empilhado: um quarto do avatar por baixo do próximo, com anel da cor do fundo.' });
    return AV.group;
  }

  defineBlock({
    id: 'avatar',
    page: 'Componentes',
    row: 'Dados e conteúdo',
    order: 1,
    group: 'Dados e conteúdo',
    title: 'Avatar',
    description: 'Pessoa ou conta: iniciais num tom estável, ícone quando não há nome, status de presença e grupo com o que sobrou em “+N”.',
    build: async function () {
      var set = await avatarSet();
      var iconSet = await avatarIconSet();
      var status = await avatarStatusSet();
      var group = await avatarGroup();
      var square = await avatarSquareSet();
      return {
        sections: [
          {
            title: 'Tamanhos e tons',
            description: '24, 32, 40, 48 e 64 px × 10 tons. O tom vem da pessoa (ex.: um hash do id), nunca da posição na lista.',
            span: 2,
            fill: false,
            node: function () { return labeledMatrix(set, AV_TONES.map(function (t) { return t[0] === 'Verde-azulado' ? 'V.-azulado' : t[0]; }), AV_SIZES.map(function (s) { return s[0] + ' · ' + s[1] + ' px'; })); },
          },
          { title: 'Ícone', description: 'Para contas sem nome ou convidados.', node: iconSet },
          { title: 'Status', description: 'Online, ausente, ocupado e offline — sempre com texto por perto.', node: status },
          {
            title: 'Com status',
            description: 'Ligue “Status” e escolha o estado na instância aninhada.',
            frame: true,
            node: function () {
              var row = box('Exemplos', { dir: 'H', gap: 20, cross: 'center' });
              ['Online', 'Ausente', 'Ocupado', 'Offline'].forEach(function (st, i) {
                var a = instance(set, { Tamanho: 'G', Tom: ['Azul', 'Verde', 'Argila', 'Neutro'][i] }, { 'Iniciais': ['LM', 'RS', 'TP', 'JV'][i], 'Status': true });
                var nested = a.findOne(function (n) { return n.type === 'INSTANCE' && n.name === 'Status'; });
                // a instância aninhada (exposta) troca de estado pela propriedade de variante
                if (nested && st !== 'Online') nested.setProperties({ Estado: st });
                add(row, a);
              });
              return row;
            },
          },
          { title: 'Grupo', description: 'Até 4 rostos; o resto vira “+N”.', frame: true, node: function () { return group.createInstance(); } },
          {
            title: 'Quadrado',
            description: 'Para times e espaços de trabalho — pessoas são sempre redondas.',
            span: 2,
            fill: false,
            node: function () { return labeledMatrix(square, SQ_TONES.map(function (t) { return t[0]; }), AV_SIZES.map(function (s) { return s[0] + ' · ' + s[1] + ' px'; })); },
          },
        ].concat(themed('Avatar', async function () {
          var card = box('Membros', { dir: 'V', gap: 0, pad: [8, 20], w: 360, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          var people = [['Ana Souza', 'Design', 'AS', 'Areia', true], ['Bruno Lima', 'Engenharia', 'BL', 'Azul', false], ['Carla Mendes', 'Produto', 'CM', 'Verde', true]];
          for (var i = 0; i < people.length; i++) {
            var p = people[i];
            var row = box(p[0], { dir: 'H', gap: 12, pad: [12, 0], cross: 'center' });
            if (i) { stroke(row, 'color/border/subtle', 0); row.strokeTopWeight = 1; }
            add(row, instance(set, { Tamanho: 'M', Tom: p[3] }, { 'Iniciais': p[2], 'Status': p[4] }));
            var who = box('Nome', { dir: 'V', gap: 0 });
            add(who, await text(p[0], { style: 'label-md', color: 'color/fg/default' }));
            add(who, await text(p[1], { style: 'caption', color: 'color/fg/subtle' }));
            add(row, who, { grow: true });
            add(card, row, { fillW: true });
          }
          return card;
        })),
      };
    },
  });

  /* ───────── Painel e cartão ───────── */

  var PN = {};

  async function sectionSet() {
    if (PN.section && !PN.section.removed) return PN.section;
    PN.section = await variants('painel-secao', 'Painel/Seção', [['Sem ação', false], ['Com ação', true]].map(function (v) {
      return {
        props: { 'Ação': v[0] },
        build: async function (c) {
          box(c.name, { dir: 'V', gap: 'space/150', w: 420 }, c);
          var head = box('Carimbo e rótulo', { dir: 'H', gap: 'space/150', cross: 'baseline' });
          add(head, await text('00', { style: 'caption', color: 'color/fg/subtle', prop: 'Número', name: 'Número' }));
          add(head, await text('Sobre', { style: 'body-sm', color: 'color/fg/subtle', prop: 'Rótulo', name: 'Rótulo' }));
          add(c, head);
          add(c, await text('Um roteiro curto para o lançamento: três cenas, uma ideia por cena, nada de enfeite.', { style: 'body-md', color: 'color/fg/default', w: 420, prop: 'Texto', name: 'Texto' }), { fillW: true });
          if (v[1]) add(c, await inlineAction('Na cena', 'plus'));
        },
      };
    }), {
      description: 'Carimbo (00) + rótulo apagado, texto de leitura e, se houver, uma ação inline.',
      columns: 2,
      gap: 32,
      props: { 'Número': ['TEXT', '00'], 'Rótulo': ['TEXT', 'Sobre'], 'Texto': ['TEXT', 'Um roteiro curto para o lançamento: três cenas, uma ideia por cena, nada de enfeite.'] },
    });
    return PN.section;
  }

  async function panelComponent() {
    if (PN.panel && !PN.panel.removed) return PN.panel;
    var sec = await sectionSet();
    var buttons = await buttonSet();
    PN.panel = await component('painel', 'Painel', async function (c) {
      box(c.name, { dir: 'V', gap: 'space/400', pad: ['space/500', 'space/600', 'space/600', 'space/600'], w: 560, fill: 'color/bg/raised', stroke: 'color/border/subtle', radius: 'radius/2xl' }, c);
      shadow(c, 'md');
      var header = box('Cabeçalho', { dir: 'H', gap: 'space/300', align: 'between' });
      var titles = box('Títulos', { dir: 'V', gap: 'space/075' });
      add(titles, await text('Roteiro', { style: 'eyebrow', color: 'color/fg/subtle', prop: 'Grupo', name: 'Grupo' }));
      add(titles, await text('Lançamento da versão 0.4', { style: 'heading-lg', color: 'color/fg/default', prop: 'Título', name: 'Título' }));
      add(header, titles);
      var actions = box('Ações', { dir: 'H', gap: 'space/050' });
      add(actions, iconButton('stack', 36, 'color/fg/default'));
      add(actions, iconButton('x', 36, 'color/fg/default'));
      add(header, actions);
      add(c, header, { fillW: true });
      var toolbar = box('Barra', { dir: 'H', gap: 'space/100', cross: 'center' });
      add(toolbar, await chip('Tom direto', 'pencil'));
      add(toolbar, await chip('Escuro'));
      var meta = box('Meta', { dir: 'H', pad: [0, 0, 0, 'space/200'] });
      add(meta, await text('~3 min', { style: 'body-sm', color: 'color/fg/subtle' }));
      add(toolbar, meta);
      add(c, toolbar);
      var body = box('Seções', { dir: 'V', gap: 'space/500' });
      add(body, instance(sec, { 'Ação': 'Com ação' }, { 'Número': '01', 'Rótulo': 'Abertura', 'Texto': 'Tela escura. O nome Órbita aparece, sem enfeite.' }), { fillW: true });
      add(body, instance(sec, { 'Ação': 'Sem ação' }, { 'Número': '02', 'Rótulo': 'O problema', 'Texto': 'Três telas do mesmo produto, cada uma de um jeito.' }), { fillW: true });
      add(c, body, { fillW: true });
      var footer = box('Rodapé', { dir: 'H', gap: 'space/150', pad: ['space/200', 0, 0, 0] });
      add(footer, instance(buttons, { Variante: 'Primário', Tamanho: 'G', Estado: 'Normal' }, { 'Rótulo': 'Gerar roteiro', 'Ícone': true, 'Trocar ícone': 'play' }));
      add(c, footer);
    }, { description: 'A superfície de uma tarefa: rótulo, título, ações, barra de chips, seções com carimbo e o rodapé com a ação principal.' });
    return PN.panel;
  }

  async function cardSet() {
    if (PN.card && !PN.card.removed) return PN.card;
    PN.card = await variants('cartao', 'Cartão', [['Padrão', 'color/bg/surface', 'color/border/subtle', false], ['Elevado', 'color/bg/raised', 'color/border/subtle', true], ['Interativo · hover', 'color/bg/surface', 'color/border/strong', false]].map(function (v) {
      return {
        props: { Tipo: v[0] },
        build: async function (c) {
          box(c.name, { dir: 'V', gap: 'space/100', pad: 'space/300', w: 280, fill: v[1], stroke: v[2], radius: 'radius/xl' }, c);
          if (v[3]) shadow(c, 'md');
          add(c, await text('Tokens para Figma', { style: 'heading-sm', color: 'color/fg/default', prop: 'Título', name: 'Título' }));
          add(c, await text('Variáveis nos modos Escuro e Claro, geradas do mesmo JSON do código.', { style: 'body-sm', color: 'color/fg/muted', w: 232, prop: 'Texto', name: 'Texto' }), { fillW: true });
        },
      };
    }), {
      description: 'Bloco de conteúdo sobre o canvas. Elevado para o que flutua; interativo ganha borda forte no hover.',
      columns: 3,
      gap: 20,
      props: { 'Título': ['TEXT', 'Tokens para Figma'], 'Texto': ['TEXT', 'Variáveis nos modos Escuro e Claro, geradas do mesmo JSON do código.'] },
    });
    return PN.card;
  }

  async function dividerSet() {
    if (PN.divider && !PN.divider.removed) return PN.divider;
    PN.divider = await variants('divisor', 'Divisor', [
      { props: { 'Direção': 'Horizontal' }, build: function (c) { box(c.name, { dir: 'none' }, c); c.resize(240, 1); fill(c, 'color/border/subtle'); } },
      { props: { 'Direção': 'Vertical' }, build: function (c) { box(c.name, { dir: 'none' }, c); c.resize(1, 40); fill(c, 'color/border/subtle'); } },
    ], { description: 'Linha de 1 px em border/subtle. Estique a instância: separa seções, não enfeita.', columns: 2, gap: 32 });
    return PN.divider;
  }

  defineBlock({
    id: 'painel',
    page: 'Componentes',
    row: 'Dados e conteúdo',
    order: 2,
    group: 'Dados e conteúdo',
    title: 'Painel e cartão',
    description: 'O painel é a superfície de uma tarefa — rótulo pequeno e apagado, título, controles discretos e seções com carimbo. O cartão agrupa conteúdo sobre o canvas.',
    build: async function () {
      var sec = await sectionSet();
      var card = await cardSet();
      var panel = await panelComponent();
      var divider = await dividerSet();
      return {
        sections: [
          { title: 'Seção', description: 'Carimbo “00 · Sobre”, texto de leitura e ação inline opcional.', span: 2, node: sec },
          { title: 'Cartão', description: 'Padrão, elevado e interativo.', span: 2, node: card },
          { title: 'Divisor', description: 'Horizontal e vertical, em border/subtle.', node: divider },
          {
            title: 'Divisor no cartão',
            description: 'Separa o resumo das ações sem precisar de outra superfície.',
            frame: true,
            node: async function () {
              var c = box('Cartão', { dir: 'V', gap: 16, pad: 20, w: 340, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
              add(c, await text('Plano Pro', { style: 'heading-xs' }));
              add(c, await text('12 pessoas · renova em 3 de novembro', { style: 'body-sm', color: 'color/fg/muted' }));
              add(c, instance(divider, { 'Direção': 'Horizontal' }), { fillW: true });
              var row = box('Rodapé', { dir: 'H', gap: 12, cross: 'center' });
              add(row, await text('R$ 480/mês', { style: 'label-md' }), { grow: true });
              var vd = instance(divider, { 'Direção': 'Vertical' });
              vd.resize(1, 16);
              add(row, vd);
              add(row, await text('Gerenciar', { style: 'label-sm', color: 'color/fg/subtle' }));
              add(c, row, { fillW: true });
              return c;
            },
          },
          { title: 'Painel', description: 'Instâncias de seção e de botão por dentro: troque os textos pelas propriedades.', span: 2, fill: false, node: panel },
        ].concat(themed('Painel', function () { return panel.createInstance(); }).map(function (s) { return Object.assign(s, { span: 2 }); })),
      };
    },
  });

  /* ───────── Tabela ───────── */

  var TB = {};
  var SORTS = [['Nenhuma', 'chevrons-up-down', 'color/fg/subtle', 'color/fg/subtle'], ['Crescente', 'arrow-up', 'color/fg/brand', 'color/fg/default'], ['Decrescente', 'arrow-down', 'color/fg/brand', 'color/fg/default']];
  // cada tipo expõe a sua propriedade de texto: num conjunto, o padrão de uma propriedade vale para todas as variantes
  var CELL_TYPES = [['Texto', 'body-sm', 'color/fg/default', 'Ana Souza', 'Texto'], ['Forte', 'label-md', 'color/fg/default', 'Pedido #4821', 'Destaque'], ['Apagado', 'body-sm', 'color/fg/subtle', '31 de out.', 'Detalhe'], ['Número', 'body-sm', 'color/fg/default', 'R$ 1.284', 'Número']];
  var ROW_STATES = [['Normal', null], ['Hover', 'color/bg/hover'], ['Selecionada', 'color/bg/selected']];

  async function headerSet() {
    if (TB.head && !TB.head.removed) return TB.head;
    var items = [];
    ['Esquerda', 'Direita'].forEach(function (al) {
      SORTS.forEach(function (s) {
        items.push({
          props: { 'Ordenação': s[0], Alinhamento: al },
          build: async function (c) {
            box(c.name, { dir: 'H', pad: [0, 'space/200'], cross: 'center', align: al === 'Direita' ? 'end' : 'start', w: 160, h: 44, fill: 'color/bg/surface' }, c);
            stroke(c, 'color/border/subtle', 0);
            c.strokeBottomWeight = 1;
            var btn = box('Ordenar', { dir: 'H', gap: 'space/050', pad: [4, 6], cross: 'center', radius: 'radius/xs' });
            var label = await text('Coluna', { style: 'label-sm', color: s[3], prop: 'Rótulo', name: 'Rótulo' });
            var ic = icon(s[1], 14, s[2]);
            if (al === 'Direita') addAll(btn, [ic, label]); else addAll(btn, [label, ic]);
            add(c, btn);
          },
        });
      });
    });
    TB.head = await variants('tabela-cabecalho', 'Tabela/Cabeçalho', items, {
      description: 'Cabeçalho ordenável. Ordenado, o rótulo fica forte e a seta ganha a cor da marca.',
      columns: 3,
      gap: 16,
      props: { 'Rótulo': ['TEXT', 'Coluna'] },
    });
    return TB.head;
  }

  async function cellSet() {
    if (TB.cell && !TB.cell.removed) return TB.cell;
    var items = [];
    CELL_TYPES.forEach(function (t) {
      ROW_STATES.forEach(function (st) {
        items.push({
          props: { Tipo: t[0], Linha: st[0] },
          build: async function (c) {
            box(c.name, { dir: 'H', pad: [0, 'space/200'], cross: 'center', align: t[0] === 'Número' ? 'end' : 'start', w: 160, h: 52, fill: st[1] }, c);
            stroke(c, 'color/border/subtle', 0);
            c.strokeBottomWeight = 1;
            add(c, await text(t[3], { style: t[1], color: t[2], prop: t[4], name: t[4] }));
          },
        });
      });
    });
    TB.cell = await variants('tabela-celula', 'Tabela/Célula', items, {
      description: 'Texto, forte, apagado e número (à direita, algarismos tabulares) em linha normal, com hover e selecionada.',
      columns: 3,
      gap: 16,
      props: { 'Texto': ['TEXT', 'Ana Souza'], 'Destaque': ['TEXT', 'Pedido #4821'], 'Detalhe': ['TEXT', '31 de out.'], 'Número': ['TEXT', 'R$ 1.284'] },
    });
    return TB.cell;
  }

  var STATUS_TONES = [['Pago', 'success'], ['Pendente', 'warning'], ['Cancelado', 'danger'], ['Reembolsado', null]];

  async function statusSet() {
    if (TB.status && !TB.status.removed) return TB.status;
    TB.status = await variants('tabela-status', 'Tabela/Status', STATUS_TONES.map(function (s) {
      return {
        props: { Tom: s[0] },
        build: async function (c) {
          var bg = s[1] ? 'color/' + s[1] + '/subtle' : 'color/bg/selected';
          var fg = s[1] ? 'color/' + s[1] + '/fg' : 'color/fg/muted';
          var bd = s[1] ? 'color/' + s[1] + '/border' : 'color/border/subtle';
          box(c.name, { dir: 'H', gap: 'space/075', pad: [0, 'space/075'], cross: 'center', h: 20, radius: 'radius/full', fill: bg, stroke: bd }, c);
          add(c, shape('Ponto', { ellipse: true, w: 6, h: 6, fill: fg }));
          add(c, await text(s[0], { style: 'caption', weight: 'Medium', color: fg, name: 'Rótulo' }));
        },
      };
    }), { description: 'Status da linha: ponto + texto, nunca só a cor. O texto acompanha o tom.', columns: 4, gap: 16 });
    return TB.status;
  }

  var ORDERS = [['#4821', 'Ana Souza', 'Pago', 'R$ 1.284'], ['#4814', 'Bruno Lima', 'Pendente', 'R$ 312'], ['#4807', 'Carla Mendes', 'Pago', 'R$ 2.950'], ['#4800', 'Diego Ramos', 'Cancelado', 'R$ 89']];

  async function tableExample() {
    if (TB.example && !TB.example.removed) return TB.example;
    var head = await headerSet();
    var cell = await cellSet();
    var status = await statusSet();
    var widths = [48, 132, 240, 200, 160];
    TB.example = await component('tabela-exemplo', 'Tabela/Exemplo', async function (c) {
      box(c.name, { dir: 'V', gap: 0, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl', clip: true }, c);
      var hr = box('Cabeçalho', { dir: 'H', gap: 0 });
      var checkHead = box('Seleção', { dir: 'H', pad: [0, 0, 0, 'space/250'], cross: 'center', w: widths[0], h: 44, fill: 'color/bg/surface' });
      stroke(checkHead, 'color/border/subtle', 0);
      checkHead.strokeBottomWeight = 1;
      add(checkHead, await checkBox(false));
      add(hr, checkHead);
      [['Pedido', 'Nenhuma', 'Esquerda'], ['Cliente', 'Crescente', 'Esquerda'], ['Status', 'Nenhuma', 'Esquerda'], ['Valor', 'Nenhuma', 'Direita']].forEach(function (h, i) {
        var inst = instance(head, { 'Ordenação': h[1], Alinhamento: h[2] }, { 'Rótulo': h[0] });
        inst.resize(widths[i + 1], 44);
        add(hr, inst);
      });
      add(c, hr);
      for (var r = 0; r < ORDERS.length; r++) {
        var o = ORDERS[r];
        var state = r === 2 ? 'Selecionada' : 'Normal';
        var row = box('Linha ' + o[0], { dir: 'H', gap: 0 });
        var check = box('Seleção', { dir: 'H', pad: [0, 0, 0, 'space/250'], cross: 'center', w: widths[0], h: 52, fill: r === 2 ? 'color/bg/selected' : null });
        stroke(check, 'color/border/subtle', 0);
        check.strokeBottomWeight = r === ORDERS.length - 1 ? 0 : 1;
        add(check, await checkBox(r === 2));
        add(row, check);
        var cells = [['Forte', o[0]], ['Texto', o[1]], [null, o[2]], ['Número', o[3]]];
        for (var k = 0; k < cells.length; k++) {
          var w = widths[k + 1];
          var node;
          if (cells[k][0]) {
            var propName = { Texto: 'Texto', Forte: 'Destaque', 'Número': 'Número' }[cells[k][0]];
            var ov = {};
            ov[propName] = cells[k][1];
            node = instance(cell, { Tipo: cells[k][0], Linha: state }, ov);
            node.resize(w, 52);
          } else {
            node = box('Status', { dir: 'H', pad: [0, 'space/200'], cross: 'center', w: w, h: 52, fill: r === 2 ? 'color/bg/selected' : null });
            stroke(node, 'color/border/subtle', 0);
            node.strokeBottomWeight = 1;
            add(node, instance(status, { Tom: o[2] }));
          }
          if (r === ORDERS.length - 1) node.strokeBottomWeight = 0;
          add(row, node);
        }
        add(c, row);
      }
    }, { description: 'Composta só com instâncias: cabeçalho ordenável, células, status e a linha selecionada.' });
    return TB.example;
  }

  defineBlock({
    id: 'tabela',
    page: 'Componentes',
    row: 'Dados e conteúdo',
    order: 3,
    group: 'Dados e conteúdo',
    title: 'Tabela',
    description: 'Dados em linhas e colunas. Cabeçalho apagado e ordenável, células de 52 px, números à direita e a linha selecionada com um fundo discreto.',
    build: async function () {
      var head = await headerSet();
      var cell = await cellSet();
      var status = await statusSet();
      var example = await tableExample();
      return {
        sections: [
          { title: 'Cabeçalho', description: 'Sem ordem, crescente e decrescente, à esquerda e à direita.', span: 2, node: function () { return labeledMatrix(head, ['Nenhuma', 'Crescente', 'Decrescente'], ['Esquerda', 'Direita']); }, fill: false },
          { title: 'Status', description: 'Tons de status com ponto e texto — nunca só a cor.', span: 2, node: status },
          { title: 'Célula', description: '4 tipos × linha normal, hover e selecionada.', span: 2, fill: false, node: function () { return labeledMatrix(cell, ['Normal', 'Hover', 'Selecionada'], CELL_TYPES.map(function (t) { return t[0]; })); } },
          { title: 'Composta', description: 'Pedidos do dia com seleção — a 3ª linha está selecionada.', span: 2, fill: false, node: example },
        ].concat(themed('Tabela', function () { return example.createInstance(); }).map(function (s) { return Object.assign(s, { span: 2 }); })),
      };
    },
  });

  /* ───────── Indicador e medidor ───────── */

  var KP = {};
  // a seta diz para onde o número foi; a cor diz se isso é bom — subir nem sempre é bom
  var DELTAS = [['Sobe · bom', 'trending-up', 'color/success/fg', '+12,4%'], ['Cai · ruim', 'trending-down', 'color/danger/fg', '−3,1%'], ['Sobe · ruim', 'trending-up', 'color/danger/fg', '+8%'], ['Cai · bom', 'trending-down', 'color/success/fg', '−5,2%'], ['Estável', 'minus', 'color/fg/muted', '0,0%']];

  /** Troca o texto de uma camada da instância (sobreposição direta, para textos que não são propriedade). */
  function setText(inst, layer, chars) {
    var t = inst.findOne(function (n) { return n.type === 'TEXT' && n.name === layer; });
    if (t) t.characters = chars;
    return inst;
  }
  var SPARK = [8, 9, 9, 11, 10, 12, 13, 12, 14, 15, 15, 17];

  /** Sparkline: traço em chart/other, lavagem de 12% e o ponto atual na cor da série 1. */
  function sparkline(values, w, h) {
    var lo = Math.min.apply(null, values);
    var hi = Math.max.apply(null, values);
    var padY = 4;
    var pts = values.map(function (v, i) {
      var x = 1 + (i * 22) / (values.length - 1);
      var y = (padY + (1 - (v - lo) / (hi - lo || 1)) * (h - padY * 2)) * (24 / h);
      return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
    });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join('');
    var area = d + 'L' + pts[pts.length - 1][0] + ' 24L' + pts[0][0] + ' 24Z';
    var frame = box('Sparkline', { dir: 'none' });
    frame.resize(w, h);
    var wash = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="' + area + '" fill="#000000" fill-opacity="0.12" stroke="none"/></svg>');
    var line = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="' + d + '" stroke="#000000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>');
    [wash, line].forEach(function (svg) {
      svg.name = svg === wash ? 'Lavagem' : 'Linha';
      svg.fills = [];
      svg.children.forEach(function (ch) { ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; });
      colorIcon(svg, 'color/chart/other');
      frame.appendChild(svg);
      svg.x = 0;
      svg.y = 0;
      svg.resize(w, h);
    });
    var last = pts[pts.length - 1];
    var dot = shape('Ponto atual', { ellipse: true, w: 10, h: 10, fill: 'color/chart/series/1' });
    stroke(dot, 'color/bg/surface', 2, { align: 'OUTSIDE' });
    frame.appendChild(dot);
    dot.x = Math.round((last[0] / 24) * w - 5);
    dot.y = Math.round((last[1] / 24) * h - 5);
    return frame;
  }

  async function statSet() {
    if (KP.stat && !KP.stat.removed) return KP.stat;
    var items = [];
    DELTAS.forEach(function (dl) {
      [['Com', true], ['Sem', false]].forEach(function (tr) {
        items.push({
          props: { 'Variação': dl[0], 'Tendência': tr[0] },
          build: async function (c) {
            box(c.name, { dir: 'V', gap: 'space/050', pad: ['space/250', 'space/250', 'space/200', 'space/250'], w: 240, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' }, c);
            add(c, await text('Receita', { style: 'label-sm', color: 'color/fg/muted', prop: 'Rótulo', name: 'Rótulo' }));
            var value = await text('R$ 1,3 mi', { style: 'heading-sm', size: 28, color: 'color/fg/default', prop: 'Valor', name: 'Valor' });
            value.lineHeight = { unit: 'PIXELS', value: 36 };
            value.letterSpacing = { unit: 'PERCENT', value: -2.5 };
            add(c, value);
            var delta = box('Variação', { dir: 'H', gap: 'space/100', cross: 'center', h: 24 });
            var change = box('Mudança', { dir: 'H', gap: 4, cross: 'center' });
            add(change, icon(dl[1], 16, dl[2]));
            add(change, await text(dl[3], { style: 'label-sm', weight: 'Semi Bold', color: dl[2], name: 'Mudança' }));
            add(delta, change);
            add(delta, await text('vs. mês anterior', { style: 'body-sm', color: 'color/fg/subtle', prop: 'Período', name: 'Período' }));
            add(c, delta);
            if (tr[1]) {
              var spark = box('Tendência', { dir: 'V', pad: ['space/150', 0, 0, 0] });
              add(spark, sparkline(SPARK, 192, 32));
              add(c, spark, { fillW: true });
            }
          },
        });
      });
    });
    KP.stat = await variants('indicador', 'Indicador', items, {
      description: 'Rótulo, valor, variação (sinal + ícone + texto — nunca só a cor) e a tendência opcional.',
      columns: 2,
      gap: 20,
      props: { 'Rótulo': ['TEXT', 'Receita'], 'Valor': ['TEXT', 'R$ 1,3 mi'], 'Período': ['TEXT', 'vs. mês anterior'] },
    });
    return KP.stat;
  }

  var METERS = [['Marca', 'color/brand/solid', 'color/brand/subtle', null, 0.42, '42 GB', 'de 100 GB'], ['Atenção', 'color/chart/status/warning', 'color/warning/subtle', ['alert-triangle', 'color/warning/fg'], 0.78, '78', 'de 100'], ['Crítico', 'color/chart/status/critical', 'color/danger/subtle', ['alert-circle', 'color/danger/fg'], 0.94, 'R$ 4,7 mil', 'de R$ 5 mil'], ['Sucesso', 'color/chart/status/good', 'color/success/subtle', null, 1, '112', 'de 100']];

  async function meterSet() {
    if (KP.meter && !KP.meter.removed) return KP.meter;
    KP.meter = await variants('medidor', 'Medidor', METERS.map(function (m) {
      return {
        props: { Tom: m[0] },
        build: async function (c) {
          var W = 280;
          box(c.name, { dir: 'V', gap: 'space/100', w: W }, c);
          var head = box('Cabeçalho', { dir: 'H', gap: 'space/200', cross: 'center', align: 'between' });
          add(head, await text('Armazenamento', { style: 'label-sm', color: 'color/fg/muted', prop: 'Rótulo', name: 'Rótulo' }));
          var val = box('Valor', { dir: 'H', gap: 4, cross: 'center' });
          if (m[3]) add(val, icon(m[3][0], 16, m[3][1]));
          add(val, await text(m[5], { style: 'body-sm', weight: 'Semi Bold', color: m[3] ? m[3][1] : 'color/fg/default', name: 'Valor' }));
          add(val, await text(m[6], { style: 'body-sm', color: 'color/fg/subtle', name: 'Limite' }));
          add(head, val);
          add(c, head, { fillW: true });
          var track = box('Trilha', { dir: 'none', radius: 'radius/full', fill: m[2], clip: true });
          track.resize(W, 8);
          var bar = shape('Preenchimento', { w: Math.max(4, Math.round(W * m[4])), h: 8, fill: m[1], radius: 'radius/full' });
          track.appendChild(bar);
          add(c, track);
        },
      };
    }), {
      description: 'Uma razão contra um limite. O preenchimento carrega a gravidade; a trilha é um tom claro da mesma rampa. Atenção e crítico ganham ícone.',
      columns: 2,
      gap: 32,
      rowGap: 28,
      props: { 'Rótulo': ['TEXT', 'Armazenamento'] },
    });
    return KP.meter;
  }

  // receita mensal de 2026 (R$ mil): a mesma série do gráfico de colunas
  var REVENUE_2026 = [82, 91, 88, 104, 112, 98, 120, 131, 126, 140, 152, 149];

  /** Número de destaque (.ds-stat--hero): um por vista, 56 px, algarismos proporcionais. */
  async function heroStat() {
    if (KP.hero && !KP.hero.removed) return KP.hero;
    KP.hero = await component('indicador-destaque', 'Indicador/Destaque', async function (c) {
      box(c.name, { dir: 'V', gap: 0, pad: 'space/300', w: 400, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' }, c);
      add(c, await text('Receita em 2026', { style: 'label-sm', color: 'color/fg/muted', name: 'Rótulo' }));
      var value = await text('R$ 1,4 mi', { style: 'heading-sm', size: 56, color: 'color/fg/default', name: 'Valor' });
      value.lineHeight = { unit: 'PIXELS', value: 56 };
      value.letterSpacing = { unit: 'PERCENT', value: -3.5 };
      var holder = box('Número', { dir: 'V', pad: ['space/100', 0, 0, 0] });
      add(holder, value);
      add(c, holder);
      var delta = box('Variação', { dir: 'H', gap: 'space/100', cross: 'center', pad: ['space/150', 0, 0, 0] });
      var change = box('Mudança', { dir: 'H', gap: 4, cross: 'center' });
      add(change, icon('trending-up', 16, 'color/success/fg'));
      add(change, await text('+14,2%', { style: 'label-sm', weight: 'Semi Bold', color: 'color/success/fg', name: 'Mudança' }));
      add(delta, change);
      add(delta, await text('vs. 2025', { style: 'body-sm', color: 'color/fg/subtle', name: 'Período' }));
      add(c, delta);
      var spark = box('Tendência', { dir: 'V', pad: ['space/250', 0, 0, 0] });
      add(spark, sparkline(REVENUE_2026, 352, 48));
      add(c, spark, { fillW: true });
    }, { description: 'O número que a tela existe para mostrar — um por vista. 56 px na mesma sans do resto, com algarismos proporcionais.' });
    return KP.hero;
  }

  defineBlock({
    id: 'indicadores',
    page: 'Componentes',
    row: 'Dados e conteúdo',
    order: 4,
    group: 'Dados e conteúdo',
    title: 'Indicador e medidor',
    description: 'Quando o gráfico é um número: valor grande em algarismos proporcionais, variação com sinal, ícone e texto, e o medidor para uma razão contra um limite.',
    build: async function () {
      var stat = await statSet();
      var meter = await meterSet();
      var hero = await heroStat();
      return {
        sections: [
          { title: 'Indicador', description: 'A seta segue o número; a cor diz se é bom. Com e sem tendência.', span: 2, fill: false, node: function () { return labeledMatrix(stat, ['Com tendência', 'Sem tendência'], DELTAS.map(function (d) { return d[0]; })); } },
          { title: 'Medidor', description: 'Marca, atenção (75%), crítico (90%) e sucesso.', span: 2, node: meter },
          { title: 'Número de destaque', description: 'Um por vista. Em tamanho grande, algarismos proporcionais — tabulares deixam o “1” solto.', node: hero, fill: false },
          {
            title: 'Quando usar',
            description: 'O destaque abre a tela; os indicadores comuns vêm logo abaixo.',
            frame: true,
            node: async function () {
              var list = box('Regras', { dir: 'V', gap: 10 });
              var rules = [['check', 'Um número de destaque por vista'], ['check', 'A mesma sans do resto da tela'], ['x', 'Fonte de display ou serifada'], ['x', 'Dois destaques disputando atenção']];
              for (var r of rules) {
                var row = box(r[1], { dir: 'H', gap: 10, cross: 'center' });
                add(row, icon(r[0], 16, r[0] === 'check' ? 'color/success/fg' : 'color/danger/fg'));
                add(row, await text(r[1], { style: 'body-sm', color: 'color/fg/default' }));
                add(list, row);
              }
              return list;
            },
          },
          {
            title: 'Linha de indicadores',
            description: 'Até 4 por linha, todos com o mesmo período — subir nem sempre é bom: o tempo de resposta piora quando sobe.',
            span: 2,
            frame: true,
            node: function () {
              var row = box('Indicadores', { dir: 'H', gap: 16 });
              add(row, instance(stat, { 'Variação': 'Sobe · bom', 'Tendência': 'Sem' }, { 'Rótulo': 'Receita', 'Valor': 'R$ 1,3 mi' }));
              add(row, setText(instance(stat, { 'Variação': 'Sobe · bom', 'Tendência': 'Sem' }, { 'Rótulo': 'Clientes ativos', 'Valor': '38.210' }), 'Mudança', '+4,2%'));
              add(row, instance(stat, { 'Variação': 'Sobe · ruim', 'Tendência': 'Sem' }, { 'Rótulo': 'Tempo de resposta', 'Valor': '182 ms', 'Período': 'vs. semana anterior' }));
              return row;
            },
          },
        ].concat(themed('Indicadores', async function () {
          var wrap = box('Painel de indicadores', { dir: 'V', gap: 16 });
          add(wrap, instance(stat, { 'Variação': 'Sobe · bom', 'Tendência': 'Com' }));
          // 280 px por dentro: a largura do medidor, para o rótulo e o “42 GB de 100 GB” caberem na mesma linha
          var card = box('Cotas', { dir: 'V', gap: 20, pad: 20, w: 320, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          var a = instance(meter, { Tom: 'Marca' });
          add(card, a, { fillW: true });
          var b = instance(meter, { Tom: 'Atenção' }, { 'Rótulo': 'Cota de API' });
          add(card, b, { fillW: true });
          add(wrap, card);
          return wrap;
        })),
      };
    },
  });
})();
