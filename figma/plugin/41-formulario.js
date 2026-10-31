/**
 * Blocos de formulário: Campo de texto, Campo com rótulo, Seleção simples, Checkbox e radio, Switch.
 * Espelha ds/components/form.css, select.css, checkbox.css e switch.css.
 */
(function () {
  /* ───────── Peças compartilhadas ───────── */

  /** Troca o texto de uma camada dentro de uma instância (inclusive em instâncias aninhadas). */
  function setText(node, name, chars) {
    var t = node.findOne(function (n) { return n.type === 'TEXT' && n.name === name; });
    if (t) t.characters = chars;
    return node;
  }

  var FIELD_SIZES = [
    ['P', { h: 'size/control/sm', pad: [0, 'space/100', 0, 10], gap: 'space/100', radius: 'radius/sm', ring: 'radius/md', text: 'body-sm', icon: 16, w: 220 }],
    ['M', { h: 'size/control/md', pad: [0, 'space/150', 0, 13], gap: 'space/150', radius: 'radius/md', ring: 'radius/lg', text: 'body-sm', icon: 18, w: 260 }],
    ['G', { h: 'size/control/lg', pad: [0, 'space/200'], gap: 'space/150', radius: 'radius/md', ring: 'radius/lg', text: 'body-md', icon: 20, w: 300 }],
  ];
  var FIELD_STATES = ['Vazio', 'Preenchido', 'Hover', 'Foco', 'Erro', 'Desativado'];

  /**
   * Halo do foco (o box-shadow de 3 px do CSS): retângulo solto que acompanha o tamanho do campo.
   * Mede o campo na hora (32, 40 ou 48 px; o multilinha cresce com o texto) — chame depois de dimensionar.
   */
  function focusHalo(parent, radiusVar, colorVar, offset) {
    var o = offset === undefined ? 3 : offset;
    var halo = shape('Foco', { w: parent.width + o * 2, h: parent.height + o * 2, radius: radiusVar });
    stroke(halo, colorVar, o, { align: 'INSIDE' });
    add(parent, halo, { absolute: true, x: -o, y: -o });
    halo.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    return halo;
  }

  function fieldBorder(state) {
    if (state === 'Hover') return 'color/border/field-hover';
    if (state === 'Foco') return 'color/border/focus';
    if (state === 'Erro') return 'color/danger/solid';
    return 'color/border/field';
  }

  /** O campo em si (.ds-field), dentro do componente. */
  async function buildField(c, s, state, o) {
    o = o || {};
    box(c.name, { dir: 'H', gap: s.gap, pad: s.pad, cross: 'center', w: o.w || s.w, h: 40, radius: s.radius }, c);
    num(c, 'height', s.h);
    c.clipsContent = false;
    stroke(c, fieldBorder(state), 1);
    if (state === 'Foco') focusHalo(c, s.ring, 'color/brand/border');
    if (state === 'Desativado') num(c, 'opacity', 'opacity/disabled');
    var ic = icon(o.icon || 'search', s.icon, 'color/fg/subtle');
    exposes(ic, 'visible', 'Ícone');
    exposes(ic, 'mainComponent', 'Trocar ícone');
    add(c, ic);
    var filled = state === 'Preenchido' || state === 'Erro';
    // a propriedade de texto deixa o mesmo conteúdo em todas as variantes; a cor diz se é placeholder
    var t = await text(o.value || 'Lançamento de outubro', {
      style: s.text,
      color: filled ? 'color/fg/default' : 'color/fg/subtle',
      prop: 'Valor',
      name: 'Valor',
      truncate: true,
    });
    add(c, t, { grow: true });
  }

  var FIELD = {};

  async function fieldSet() {
    if (FIELD.set && !FIELD.set.removed) return FIELD.set;
    var items = [];
    FIELD_STATES.forEach(function (state) {
      FIELD_SIZES.forEach(function (sz) {
        items.push({ props: { Tamanho: sz[0], Estado: state }, build: function (c) { return buildField(c, sz[1], state); } });
      });
    });
    FIELD.set = await variants('campo', 'Campo de texto', items, {
      description: 'Campo de uma linha. O contorno usa border/field (3:1); foco ganha o anel da marca, erro o contorno de perigo.',
      columns: 3,
      gap: 24,
      rowGap: 20,
      props: {
        'Valor': ['TEXT', 'Lançamento de outubro'],
        'Ícone': ['BOOLEAN', false],
        'Trocar ícone': ['INSTANCE_SWAP', 'search', ['search', 'mail', 'lock', 'calendar', 'user', 'link', 'hash', 'at-sign']],
      },
    });
    return FIELD.set;
  }

  var MULTI_STATES = ['Vazio', 'Preenchido', 'Foco', 'Erro'];

  async function multilineSet() {
    if (FIELD.multi && !FIELD.multi.removed) return FIELD.multi;
    var items = MULTI_STATES.map(function (state) {
      return {
        props: { Estado: state },
        build: async function (c) {
          box(c.name, { dir: 'V', gap: 0, pad: [10, 'space/150', 10, 13], w: 204, radius: 'radius/md' }, c);
          c.clipsContent = false;
          stroke(c, fieldBorder(state), 1);
          var filled = state !== 'Vazio' && state !== 'Foco';
          var t = await text('Reúne o roteiro, as imagens e o texto do anúncio de outubro.', {
            style: 'body-sm',
            color: filled ? 'color/fg/default' : 'color/fg/subtle',
            w: 178,
            prop: 'Texto',
            name: 'Texto',
          });
          add(c, t, { fillW: true });
          var spacer = box('Altura mínima', { dir: 'V', h: 44 });
          add(c, spacer, { fillW: true });
          if (state === 'Foco') focusHalo(c, 'radius/lg', 'color/brand/border');
        },
      };
    });
    FIELD.multi = await variants('campo-multilinha', 'Campo de texto/Multilinha', items, {
      description: 'Multilinha (textarea): altura mínima de 88 px, cresce com o texto.',
      columns: 2,
      gap: 24,
      props: { 'Texto': ['TEXT', 'Reúne o roteiro, as imagens e o texto do anúncio de outubro.'] },
    });
    return FIELD.multi;
  }

  defineBlock({
    id: 'campo-de-texto',
    page: 'Componentes',
    row: 'Formulário',
    order: 1,
    group: 'Formulário',
    title: 'Campo de texto',
    description: 'Onde a pessoa digita. Três tamanhos, seis estados e ícone opcional à esquerda. O contorno passa de 3:1 em qualquer superfície; o rótulo fica no Campo com rótulo.',
    build: async function () {
      var set = await fieldSet();
      var multi = await multilineSet();
      return {
        sections: [
          {
            title: 'Tamanhos e estados',
            description: 'P (32), M (40, padrão) e G (48). Hover, foco e erro também são variantes, para documentar e testar.',
            span: 2,
            fill: false,
            node: function () { return labeledMatrix(set, ['P · 32', 'M · 40', 'G · 48'], FIELD_STATES); },
          },
          {
            title: 'Com ícone',
            description: 'Ligue “Ícone” e troque em “Trocar ícone”. O ícone fica no tom apagado.',
            frame: true,
            gap: 12,
            fillChildren: true,
            node: function () {
              return [
                instance(set, { Tamanho: 'M', Estado: 'Vazio' }, { 'Ícone': true, 'Trocar ícone': 'search', 'Valor': 'Buscar no Órbita' }),
                instance(set, { Tamanho: 'M', Estado: 'Preenchido' }, { 'Ícone': true, 'Trocar ícone': 'mail', 'Valor': 'ana@orbita.app' }),
              ];
            },
          },
          { title: 'Multilinha', description: 'Para textos de mais de uma linha: descrição, comentário, mensagem.', node: multi, fill: false },
        ].concat(themed('Campos', async function () {
          var card = box('Busca', { dir: 'V', gap: 12, pad: 24, w: 380, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          add(card, await text('Filtrar pedidos', { style: 'heading-xs' }));
          add(card, instance(set, { Tamanho: 'M', Estado: 'Foco' }, { 'Ícone': true, 'Trocar ícone': 'search', 'Valor': 'Buscar por cliente ou número' }), { fillW: true });
          add(card, instance(set, { Tamanho: 'M', Estado: 'Preenchido' }, { 'Ícone': true, 'Trocar ícone': 'calendar', 'Valor': '01/10 – 31/10' }), { fillW: true });
          return card;
        })),
      };
    },
  });

  /* ───────── Campo com rótulo ───────── */

  var FF_TYPES = [
    ['Padrão', { state: 'Preenchido', hint: true }],
    ['Opcional', { state: 'Vazio', hint: true, optional: true }],
    ['Erro', { state: 'Erro', error: true }],
    ['Desativado', { state: 'Desativado', hint: true }],
  ];

  async function formFieldSet() {
    if (FIELD.form && !FIELD.form.removed) return FIELD.form;
    var set = await fieldSet();
    var items = FF_TYPES.map(function (t) {
      return {
        props: { Tipo: t[0] },
        build: async function (c) {
          box(c.name, { dir: 'V', gap: 'space/075', w: 320 }, c);
          var label = box('Rótulo', { dir: 'H', gap: 'space/100', align: 'between', cross: 'baseline' });
          add(label, await text('Nome do projeto', { style: 'label-md', color: 'color/fg/default', prop: 'Rótulo', name: 'Rótulo' }));
          if (t[1].optional) add(label, await text('opcional', { style: 'body-sm', color: 'color/fg/subtle', name: 'Opcional' }));
          add(c, label, { fillW: true });
          var field = instance(set, { Tamanho: 'M', Estado: t[1].state });
          add(c, field, { fillW: true });
          var foot = box('Rodapé', { dir: 'H', gap: 'space/200', align: 'between', cross: 'start' });
          if (t[1].error) {
            var err = box('Erro', { dir: 'H', gap: 'space/075', cross: 'start' });
            var eic = icon('alert-circle', 16, 'color/danger/fg');
            var holder = box('Ícone', { dir: 'V', pad: [3, 0, 0, 0] });
            add(holder, eic);
            add(err, holder);
            add(foot, err, { fillW: true });
            add(err, await text('Dê um nome ao projeto.', { style: 'body-sm', color: 'color/danger/fg', prop: 'Erro', name: 'Erro' }), { fillW: true });
          } else {
            add(foot, await text('Aparece no menu e na busca.', { style: 'body-sm', color: 'color/fg/subtle', prop: 'Dica', name: 'Dica' }), { fillW: true });
          }
          var counter = await text(t[1].state === 'Vazio' ? '0/40' : '21/40', { style: 'caption', color: t[1].error ? 'color/danger/fg' : 'color/fg/subtle', name: 'Contador' });
          exposes(counter, 'visible', 'Contador');
          add(foot, counter);
          add(c, foot, { fillW: true });
        },
      };
    });
    FIELD.form = await variants('campo-rotulo', 'Campo com rótulo', items, {
      description: 'Rótulo em cima, campo no meio, dica ou erro embaixo. O erro diz o que fazer, com ícone — nunca só a cor.',
      columns: 2,
      gap: 32,
      rowGap: 28,
      props: {
        'Rótulo': ['TEXT', 'Nome do projeto'],
        'Dica': ['TEXT', 'Aparece no menu e na busca.'],
        'Erro': ['TEXT', 'Dê um nome ao projeto.'],
        'Contador': ['BOOLEAN', true],
      },
    });
    return FIELD.form;
  }

  defineBlock({
    id: 'campo-com-rotulo',
    page: 'Componentes',
    row: 'Formulário',
    order: 2,
    group: 'Formulário',
    title: 'Campo com rótulo',
    description: 'O campo completo: rótulo, campo, dica ou mensagem de erro e contador opcional. Opcional é marcado no rótulo — obrigatório é o padrão.',
    build: async function () {
      var set = await formFieldSet();
      var buttons = await buttonSet();
      return {
        sections: [
          { title: 'Tipos', description: 'Padrão, opcional, erro e desativado. “Contador” liga e desliga o 21/40.', span: 2, node: set },
          {
            title: 'Formulário',
            description: 'Rótulos curtos, uma coluna, a ação principal no fim e à direita.',
            span: 2,
            frame: true,
            node: async function () {
              var form = box('Formulário', { dir: 'V', gap: 24, w: 420 });
              add(form, await text('Novo projeto', { style: 'heading-sm' }));
              add(form, instance(set, { Tipo: 'Padrão' }, { 'Rótulo': 'Nome do projeto', 'Dica': 'Aparece no menu e na busca.' }), { fillW: true });
              add(form, setText(instance(set, { Tipo: 'Opcional' }, { 'Rótulo': 'Descrição', 'Dica': 'Uma frase sobre o objetivo.', 'Contador': false }), 'Valor', 'Ex.: o que muda para o cliente'), { fillW: true });
              var actions = box('Ações', { dir: 'H', gap: 'space/150', align: 'end' });
              add(actions, instance(buttons, { Variante: 'Secundário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Cancelar' }));
              add(actions, instance(buttons, { Variante: 'Primário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Criar projeto' }));
              add(form, actions, { fillW: true });
              return form;
            },
          },
        ].concat(themed('Campo com rótulo', async function () {
          var card = box('Cartão', { dir: 'V', gap: 20, pad: 24, w: 380, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          add(card, setText(instance(set, { Tipo: 'Padrão' }, { 'Rótulo': 'Endereço', 'Dica': 'Letras minúsculas, números e hífen.' }), 'Valor', 'orbita.app/lancamento'), { fillW: true });
          add(card, setText(instance(set, { Tipo: 'Erro' }, { 'Rótulo': 'E-mail para avisos', 'Erro': 'Use um e-mail no formato nome@empresa.com.' }), 'Valor', 'ana@orbita'), { fillW: true });
          return card;
        })),
      };
    },
  });

  /* ───────── Seleção simples ───────── */

  var SEL_STATES = [
    ['Vazio', 'Escolha o time', 'color/border/field', false],
    ['Preenchido', 'Pagamentos', 'color/border/field', false],
    ['Hover', 'Pagamentos', 'color/border/field-hover', false],
    ['Aberto', 'Pagamentos', 'color/border/focus', true],
    ['Erro', 'Escolha o time', 'color/danger/solid', false],
    ['Desativado', 'Pagamentos', 'color/border/field', false],
  ];

  var SEL = {};

  async function selectTriggerSet() {
    if (SEL.trigger && !SEL.trigger.removed) return SEL.trigger;
    var items = SEL_STATES.map(function (s) {
      return {
        props: { Estado: s[0] },
        build: async function (c) {
          box(c.name, { dir: 'H', gap: 10, pad: [0, 11, 0, 13], cross: 'center', w: 260, h: 40, radius: 'radius/md' }, c);
          num(c, 'height', 'size/control/md');
          c.clipsContent = false;
          stroke(c, s[2], 1);
          if (s[3]) focusHalo(c, 'radius/lg', 'color/brand/border');
          if (s[0] === 'Desativado') num(c, 'opacity', 'opacity/disabled');
          var ic = icon('users', 18, 'color/fg/subtle');
          exposes(ic, 'visible', 'Ícone');
          exposes(ic, 'mainComponent', 'Trocar ícone');
          add(c, ic);
          var placeholder = s[0] === 'Vazio' || s[0] === 'Erro';
          add(c, await text(s[1], { style: 'body-sm', color: placeholder ? 'color/fg/subtle' : 'color/fg/default', name: 'Valor', truncate: true }), { grow: true });
          add(c, icon(s[3] ? 'chevron-up' : 'chevron-down', 16, 'color/fg/subtle'));
        },
      };
    });
    SEL.trigger = await variants('selecao-gatilho', 'Seleção/Gatilho', items, {
      description: 'Gatilho da seleção simples: mostra o valor escolhido; aberto ganha o anel de foco e a seta vira. Edite o texto direto na instância.',
      columns: 3,
      gap: 24,
      props: {
        'Ícone': ['BOOLEAN', false],
        'Trocar ícone': ['INSTANCE_SWAP', 'users', ['users', 'user', 'globe', 'calendar', 'folder', 'tag']],
      },
    });
    return SEL.trigger;
  }

  async function selectOptionSet() {
    if (SEL.option && !SEL.option.removed) return SEL.option;
    var items = ['Normal', 'Hover', 'Selecionada', 'Desativada'].map(function (state) {
      return {
        props: { Estado: state },
        build: async function (c) {
          box(c.name, { dir: 'H', gap: 'space/150', pad: [0, 'space/150'], cross: 'center', w: 200, h: 36, radius: 10 }, c);
          if (state === 'Hover') fill(c, 'color/bg/hover');
          if (state === 'Desativada') num(c, 'opacity', 'opacity/disabled');
          var strong = state === 'Hover' || state === 'Selecionada';
          add(c, await text('Pagamentos', { style: 'label-md', color: strong ? 'color/fg/default' : 'color/fg/muted', prop: 'Rótulo', name: 'Rótulo', truncate: true }), { grow: true });
          if (state === 'Selecionada') add(c, icon('check', 16, 'color/fg/brand'));
        },
      };
    });
    SEL.option = await variants('selecao-opcao', 'Seleção/Opção', items, {
      description: 'Opção da lista. A escolhida ganha o check da marca; o hover é um véu sutil.',
      columns: 2,
      gap: 16,
      props: { 'Rótulo': ['TEXT', 'Pagamentos'] },
    });
    return SEL.option;
  }

  var SEL_OPTIONS = [['Cartões', 'Normal'], ['Investimentos', 'Hover'], ['Pagamentos', 'Selecionada'], ['Seguros', 'Normal'], ['Empréstimos', 'Normal']];

  async function selectMenu() {
    if (SEL.menu && !SEL.menu.removed) return SEL.menu;
    var option = await selectOptionSet();
    SEL.menu = await component('selecao-menu', 'Seleção/Menu', async function (c) {
      box(c.name, { dir: 'V', gap: 0, pad: 6, w: 260, fill: 'color/bg/raised', stroke: 'color/border/strong', radius: 'radius/lg' }, c);
      shadow(c, 'md');
      var group = box('Grupo', { dir: 'V', pad: [6, 'space/150', 4, 'space/150'] });
      add(group, await text('Times', { style: 'caption', color: 'color/fg/subtle' }));
      add(c, group, { fillW: true });
      SEL_OPTIONS.forEach(function (o) {
        add(c, instance(option, { Estado: o[1] }, { 'Rótulo': o[0] }), { fillW: true });
      });
    }, { description: 'Lista da seleção simples, com rótulo de grupo. Abre colada ao gatilho.' });
    return SEL.menu;
  }

  // com busca: para listas longas — a busca fica no topo e filtra enquanto se digita
  var SEL_SEARCH = [['Pagamentos', 'Hover'], ['Plataforma', 'Normal'], ['Prevenção a fraudes', 'Normal']];

  async function selectSearchMenu() {
    if (SEL.search && !SEL.search.removed) return SEL.search;
    var option = await selectOptionSet();
    SEL.search = await component('selecao-menu-busca', 'Seleção/Menu com busca', async function (c) {
      box(c.name, { dir: 'V', gap: 2, pad: 6, w: 260, fill: 'color/bg/raised', stroke: 'color/border/strong', radius: 'radius/lg' }, c);
      shadow(c, 'md');
      // busca já digitada: o texto em fg/default, não no tom de placeholder
      var find = box('Busca', { dir: 'H', gap: 'space/100', pad: [0, 'space/150'], cross: 'center', h: 36, radius: 10, fill: 'color/bg/sunken' });
      add(find, icon('search', 16, 'color/fg/subtle'));
      add(find, await text('pa', { style: 'body-sm', color: 'color/fg/default', name: 'Busca' }));
      add(c, find, { fillW: true });
      var list = box('Opções', { dir: 'V', gap: 0, pad: [4, 0, 0, 0] });
      SEL_SEARCH.forEach(function (o) { add(list, instance(option, { Estado: o[1] }, { 'Rótulo': o[0] }), { fillW: true }); });
      add(c, list, { fillW: true });
      var count = box('Contagem', { dir: 'H', pad: [6, 'space/150', 4, 'space/150'] });
      add(count, await text('3 de 14 times', { style: 'caption', color: 'color/fg/subtle' }));
      add(c, count, { fillW: true });
    }, { description: 'Seleção simples com busca, para listas longas. A busca filtra enquanto se digita e diz quantos itens sobraram.' });
    return SEL.search;
  }

  ORB.lib = ORB.lib || {};
  ORB.lib.fieldSet = fieldSet;
  ORB.lib.formFieldSet = formFieldSet;
  ORB.lib.selectTriggerSet = selectTriggerSet;

  defineBlock({
    id: 'selecao',
    page: 'Componentes',
    row: 'Formulário',
    order: 4,
    group: 'Seleção',
    title: 'Seleção',
    description: 'Escolher um item de uma lista. A lista é do Órbita — nada de menu nativo do sistema —, abre colada ao campo e marca a escolha com um check.',
    build: async function () {
      var trigger = await selectTriggerSet();
      var option = await selectOptionSet();
      var menu = await selectMenu();
      var search = await selectSearchMenu();
      return {
        sections: [
          { title: 'Gatilho', description: 'Vazio, preenchido, hover, aberto, erro e desativado.', span: 2, node: trigger },
          { title: 'Opção', description: 'Normal, hover, selecionada e desativada.', node: option },
          { title: 'Menu', description: 'Rótulo de grupo e opções; a escolhida tem o check.', node: menu, fill: false },
          { title: 'Com busca', description: 'Acima de uns 10 itens, a busca entra no topo da lista.', node: search, fill: false },
        ].concat(themed('Seleção', async function () {
          var field = box('Campo', { dir: 'V', gap: 8, w: 260 });
          add(field, await text('Time responsável', { style: 'label-md' }));
          add(field, instance(trigger, { Estado: 'Aberto' }), { fillW: true });
          add(field, menu.createInstance(), { fillW: true });
          return field;
        })),
      };
    },
  });

  /* ───────── Checkbox e radio ───────── */

  var CHOICE_STATES = ['Normal', 'Hover', 'Foco', 'Erro', 'Desativado'];

  /** O controle (18 px) com anel de foco solto em volta, como o outline do CSS. */
  function choiceControl(kind, mark, state) {
    var round = kind === 'radio';
    var on = mark !== 'Desmarcado';
    var b = box(round ? 'Radio' : 'Caixa', { dir: 'H', align: 'center', cross: 'center', w: 18, h: 18, radius: round ? 'radius/full' : 'radius/xs' });
    b.clipsContent = false;
    if (on && !round) {
      fill(b, state === 'Hover' ? 'color/brand/solid-hover' : 'color/brand/solid');
      if (mark === 'Marcado') add(b, icon('check', 14, 'color/brand/on-solid'));
      else add(b, shape('Traço', { w: 8, h: 2, radius: 1, fill: 'color/brand/on-solid' }));
    } else if (on && round) {
      stroke(b, 'color/brand/solid', 1.5);
      add(b, shape('Ponto', { w: 8, h: 8, ellipse: true, fill: 'color/brand/solid' }));
    } else {
      stroke(b, state === 'Hover' ? 'color/fg/muted' : state === 'Erro' ? 'color/danger/solid' : 'color/fg/subtle', 1.5);
    }
    if (state === 'Foco') {
      var ring = shape('Foco', { w: 26, h: 26, radius: round ? 'radius/full' : 'radius/sm', ellipse: false });
      stroke(ring, 'color/border/focus', 'focus-ring/width', { align: 'INSIDE' });
      add(b, ring, { absolute: true, x: -4, y: -4 });
    }
    var holder = box('Controle', { dir: 'V', pad: [1, 0, 0, 0] });
    add(holder, b);
    return holder;
  }

  async function buildChoice(c, kind, mark, state) {
    box(c.name, { dir: 'H', gap: 'space/150', cross: 'start' }, c);
    c.clipsContent = false;
    if (state === 'Desativado') num(c, 'opacity', 'opacity/disabled');
    add(c, choiceControl(kind, mark, state));
    var txt = box('Texto', { dir: 'V', gap: 2 });
    add(txt, await text(kind === 'radio' ? 'Privado' : 'Lembretes', { style: 'label-md', color: 'color/fg/default', prop: 'Rótulo', name: 'Rótulo' }));
    var desc = await text(kind === 'radio' ? 'Só convidados' : 'Um por semana', { style: 'body-sm', color: 'color/fg/muted', prop: 'Descrição', name: 'Descrição' });
    exposes(desc, 'visible', 'Com descrição');
    add(txt, desc);
    add(c, txt);
  }

  var CHOICE = {};

  async function checkboxSet() {
    if (CHOICE.check && !CHOICE.check.removed) return CHOICE.check;
    var items = [];
    ['Desmarcado', 'Marcado', 'Indeterminado'].forEach(function (mark) {
      CHOICE_STATES.forEach(function (state) {
        items.push({ props: { Marcação: mark, Estado: state }, build: function (c) { return buildChoice(c, 'checkbox', mark, state); } });
      });
    });
    CHOICE.check = await variants('checkbox', 'Checkbox', items, {
      description: 'Várias escolhas independentes. Indeterminado: parte dos itens de um grupo marcada.',
      columns: 5,
      gap: 24,
      rowGap: 24,
      props: {
        'Rótulo': ['TEXT', 'Lembretes'],
        'Descrição': ['TEXT', 'Um por semana'],
        'Com descrição': ['BOOLEAN', true],
      },
    });
    return CHOICE.check;
  }

  async function radioSet() {
    if (CHOICE.radio && !CHOICE.radio.removed) return CHOICE.radio;
    var items = [];
    ['Desmarcado', 'Marcado'].forEach(function (mark) {
      CHOICE_STATES.forEach(function (state) {
        items.push({ props: { Marcação: mark, Estado: state }, build: function (c) { return buildChoice(c, 'radio', mark, state); } });
      });
    });
    CHOICE.radio = await variants('radio', 'Radio', items, {
      description: 'Uma escolha entre opções que se excluem. Sempre em grupo, com uma opção marcada por padrão quando fizer sentido.',
      columns: 5,
      gap: 24,
      rowGap: 24,
      props: {
        'Rótulo': ['TEXT', 'Privado'],
        'Descrição': ['TEXT', 'Só convidados'],
        'Com descrição': ['BOOLEAN', true],
      },
    });
    return CHOICE.radio;
  }

  defineBlock({
    id: 'checkbox-radio',
    page: 'Componentes',
    row: 'Formulário',
    order: 5,
    group: 'Formulário',
    title: 'Checkbox e radio',
    description: 'Checkbox para várias escolhas, radio para uma só. Rótulo clicável, descrição opcional e o anel de foco afastado do controle.',
    build: async function () {
      var check = await checkboxSet();
      var radio = await radioSet();
      return {
        sections: [
          { title: 'Checkbox', description: 'Desmarcado, marcado e indeterminado em cada estado.', span: 2, fill: false, node: function () { return labeledMatrix(check, CHOICE_STATES, ['Desmarcado', 'Marcado', 'Indeterminado']); } },
          { title: 'Radio', description: 'Desmarcado e marcado em cada estado.', span: 2, fill: false, node: function () { return labeledMatrix(radio, CHOICE_STATES, ['Desmarcado', 'Marcado']); } },
        ].concat(themed('Escolhas', async function () {
          var card = box('Preferências', { dir: 'V', gap: 24, pad: 24, w: 380, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          var g1 = box('Notificações', { dir: 'V', gap: 'space/150' });
          add(g1, await text('Notificações', { style: 'label-md' }));
          add(g1, instance(check, { Marcação: 'Marcado', Estado: 'Normal' }, { 'Rótulo': 'Avisos por e-mail', 'Descrição': 'Um resumo por semana' }));
          add(g1, instance(check, { Marcação: 'Desmarcado', Estado: 'Normal' }, { 'Rótulo': 'Menções', 'Com descrição': false }));
          add(g1, instance(check, { Marcação: 'Marcado', Estado: 'Normal' }, { 'Rótulo': 'Novidades do Órbita', 'Com descrição': false }));
          add(card, g1);
          var g2 = box('Visibilidade', { dir: 'V', gap: 'space/150' });
          add(g2, await text('Visibilidade', { style: 'label-md' }));
          add(g2, instance(radio, { Marcação: 'Marcado', Estado: 'Normal' }, { 'Rótulo': 'Privado', 'Descrição': 'Só quem você convidar' }));
          add(g2, instance(radio, { Marcação: 'Desmarcado', Estado: 'Normal' }, { 'Rótulo': 'Time', 'Descrição': 'Todo mundo de Pagamentos' }));
          add(card, g2);
          return card;
        })),
      };
    },
  });

  /* ───────── Switch ───────── */

  var SW_SIZES = [
    ['M', { w: 36, h: 20, thumb: 14 }],
    ['P', { w: 28, h: 16, thumb: 10 }],
  ];
  var SW_STATES = ['Normal', 'Hover', 'Foco', 'Desativado'];

  async function buildSwitch(c, sz, on, state) {
    box(c.name, { dir: 'H', gap: 'space/150', cross: 'start' }, c);
    c.clipsContent = false;
    if (state === 'Desativado') num(c, 'opacity', 'opacity/disabled');
    var track = box('Trilha', { dir: 'H', align: on ? 'end' : 'start', cross: 'center', pad: [0, 3], w: sz.w, h: sz.h, radius: 'radius/full' });
    track.clipsContent = false;
    if (on) {
      fill(track, state === 'Hover' ? 'color/brand/solid-hover' : 'color/brand/solid');
      stroke(track, state === 'Hover' ? 'color/brand/solid-hover' : 'color/brand/solid', 1);
    } else {
      fill(track, 'color/bg/muted');
      stroke(track, state === 'Hover' ? 'color/border/field-hover' : 'color/border/field', 1);
    }
    add(track, shape('Polegar', { w: sz.thumb, h: sz.thumb, ellipse: true, fill: on ? 'color/brand/on-solid' : 'color/fg/muted' }));
    if (state === 'Foco') {
      var ring = shape('Foco', { w: sz.w + 8, h: sz.h + 8, radius: 'radius/full' });
      stroke(ring, 'color/border/focus', 'focus-ring/width', { align: 'INSIDE' });
      add(track, ring, { absolute: true, x: -4, y: -4 });
    }
    var holder = box('Controle', { dir: 'V', pad: [(20 - sz.h) / 2, 0, 0, 0] });
    add(holder, track);
    add(c, holder);
    var label = await text('Avisos', { style: 'label-md', color: 'color/fg/default', prop: 'Rótulo', name: 'Rótulo' });
    exposes(label, 'visible', 'Com rótulo');
    add(c, label);
  }

  var SWITCH = {};

  async function switchSet() {
    if (SWITCH.set && !SWITCH.set.removed) return SWITCH.set;
    var items = [];
    SW_SIZES.forEach(function (sz) {
      [['Não', false], ['Sim', true]].forEach(function (on) {
        SW_STATES.forEach(function (state) {
          items.push({ props: { Tamanho: sz[0], Ligado: on[0], Estado: state }, build: function (c) { return buildSwitch(c, sz[1], on[1], state); } });
        });
      });
    });
    SWITCH.set = await variants('switch', 'Switch', items, {
      description: 'Liga e desliga com efeito imediato — sem botão de salvar. Desligado, a trilha tem contorno de 3:1.',
      columns: 4,
      gap: 32,
      rowGap: 24,
      props: { 'Rótulo': ['TEXT', 'Avisos'], 'Com rótulo': ['BOOLEAN', true] },
    });
    return SWITCH.set;
  }

  defineBlock({
    id: 'switch',
    page: 'Componentes',
    row: 'Formulário',
    order: 6,
    group: 'Formulário',
    title: 'Switch',
    description: 'Liga e desliga algo na hora. Dois tamanhos: M (36 × 20) e P (28 × 16). Em listas de ajustes, o controle vai à direita.',
    build: async function () {
      var set = await switchSet();
      var rows = [];
      SW_SIZES.forEach(function (sz) { ['Desligado', 'Ligado'].forEach(function (l) { rows.push(sz[0] + ' · ' + l); }); });
      return {
        sections: [
          { title: 'Tamanhos e estados', description: 'Desligado e ligado em cada estado, nos dois tamanhos.', span: 2, fill: false, node: function () { return labeledMatrix(set, SW_STATES, rows); } },
        ].concat(themed('Ajustes', async function () {
          var list = box('Ajustes', { dir: 'V', gap: 0, w: 400, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          list.clipsContent = true;
          var settings = [['Avisos por e-mail', 'Um resumo por semana', true], ['Modo compacto', 'Mais itens por tela', false], ['Sons', 'Ao receber mensagens', false]];
          for (var i = 0; i < settings.length; i++) {
            var s = settings[i];
            var row = box(s[0], { dir: 'H', gap: 16, pad: [16, 20], cross: 'center', align: 'between' });
            if (i > 0) { stroke(row, 'color/border/subtle', 0); row.strokeTopWeight = 1; }
            var txt = box('Texto', { dir: 'V', gap: 2 });
            add(txt, await text(s[0], { style: 'label-md' }));
            add(txt, await text(s[1], { style: 'body-sm', color: 'color/fg/muted' }));
            add(row, txt, { grow: true });
            add(row, instance(set, { Tamanho: 'M', Ligado: s[2] ? 'Sim' : 'Não', Estado: 'Normal' }, { 'Com rótulo': false }));
            add(list, row, { fillW: true });
          }
          return list;
        })),
      };
    },
  });
  ORB.lib.checkboxSet = checkboxSet;
})();
