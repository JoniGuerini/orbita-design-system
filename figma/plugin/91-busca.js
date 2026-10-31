/**
 * Padrões: Paleta de comandos (⌘K), Barra de filtros e Formulário.
 * A paleta segue ds/components/command.css; os filtros, ds/components/filters.css (chips de 36 px, busca na
 * mesma altura, ordenação à direita e o resumo com contagem, filtros ativos e “Limpar tudo”).
 */
(function () {
  var B = {};

  async function kbd(label) {
    var k = box('Tecla', { dir: 'H', align: 'center', cross: 'center', pad: [0, 5], h: 20, radius: 'radius/xs', fill: 'color/bg/hover', stroke: 'color/border/default' });
    k.minWidth = 20;
    add(k, await text(label, { style: 'caption', size: 11, weight: 'Medium', color: 'color/fg/subtle', name: 'Tecla' }));
    return k;
  }

  async function rules(list) {
    var col = box('Regras', { dir: 'V', gap: 10 });
    for (var r of list) {
      var row = box(r[1], { dir: 'H', gap: 10, cross: 'center' });
      add(row, icon(r[0], 16, r[0] === 'check' ? 'color/success/fg' : 'color/danger/fg'));
      add(row, await text(r[1], { style: 'body-sm', color: 'color/fg/default' }));
      add(col, row);
    }
    return col;
  }

  function setText(node, name, chars) {
    var t = node.findOne(function (n) { return n.type === 'TEXT' && n.name === name; });
    if (t) t.characters = chars;
    return node;
  }

  /* ───────── Paleta de comandos ───────── */

  async function commandItemSet() {
    if (B.item && !B.item.removed) return B.item;
    B.item = await variants('comando-item', 'Comandos/Item', ['Normal', 'Selecionado'].map(function (st) {
      var on = st === 'Selecionado';
      return {
        props: { Estado: st },
        build: async function (c) {
          box(c.name, { dir: 'H', gap: 'space/150', pad: [0, 'space/150'], cross: 'center', w: 600, h: 44, radius: 'radius/md', fill: on ? 'color/bg/selected' : null }, c);
          var ic = icon('inbox', 18, on ? 'color/fg/brand' : 'color/fg/subtle');
          exposes(ic, 'mainComponent', 'Ícone');
          add(c, ic);
          add(c, await text('Pedidos', { style: 'label-md', color: on ? 'color/fg/default' : 'color/fg/muted', prop: 'Rótulo', name: 'Rótulo', truncate: true }), { grow: true });
          var hint = await text('N', { style: 'caption', color: 'color/fg/subtle', prop: 'Texto do atalho', name: 'Atalho' });
          exposes(hint, 'visible', 'Atalho');
          add(c, hint);
          // o ↵ só aparece no item ativo: Enter executa esse
          var enter = icon('corner-down-left', 16, 'color/fg/subtle');
          enter.visible = on;
          add(c, enter);
        },
      };
    }), {
      description: 'Item da paleta: ícone, rótulo e atalho opcional. O ativo ganha fundo de seleção, ícone na cor da marca e o ↵ de Enter.',
      columns: 1,
      gap: 12,
      props: {
        'Rótulo': ['TEXT', 'Pedidos'],
        'Ícone': ['INSTANCE_SWAP', 'inbox', ['inbox', 'users', 'bar-chart', 'plus', 'user', 'download', 'moon', 'keyboard', 'settings']],
        'Atalho': ['BOOLEAN', false],
        'Texto do atalho': ['TEXT', 'N'],
      },
    });
    return B.item;
  }

  var GROUPS = [
    ['Ir para', [['Pedidos', 'inbox', null, true], ['Clientes', 'users'], ['Relatórios', 'bar-chart']]],
    ['Criar', [['Novo pedido', 'plus', 'N'], ['Novo cliente', 'user']]],
    ['Preferências', [['Alternar tema', 'moon'], ['Ver atalhos de teclado', 'keyboard', '?']]],
  ];

  async function paletteSet() {
    if (B.palette && !B.palette.removed) return B.palette;
    var item = await commandItemSet();
    B.palette = await variants('paleta', 'Paleta de comandos', ['Aberta', 'Sem resultados'].map(function (st) {
      return {
        props: { Estado: st },
        build: async function (c) {
          box(c.name, { dir: 'V', gap: 0, w: 640, fill: 'color/bg/raised', stroke: 'color/border/default', radius: 'radius/2xl', clip: true }, c);
          shadow(c, 'md');
          var search = box('Busca', { dir: 'H', gap: 'space/150', pad: [0, 'space/200', 0, 'space/250'], cross: 'center', h: 64 });
          stroke(search, 'color/border/subtle', 0);
          search.strokeBottomWeight = 1;
          add(search, icon('search', 20, 'color/fg/subtle'));
          var empty = st === 'Sem resultados';
          add(search, await text(empty ? 'orçamento 2019' : 'O que você procura?', { style: 'body-lg', color: empty ? 'color/fg/default' : 'color/fg/subtle', name: 'Busca' }), { grow: true });
          add(search, await kbd('Esc'));
          add(c, search, { fillW: true });
          var list = box('Lista', { dir: 'V', gap: 'space/100', pad: 'space/100' });
          if (empty) {
            var none = box('Vazio', { dir: 'V', gap: 'space/050', cross: 'center', pad: ['space/500', 'space/200'] });
            add(none, await text('Nada para “orçamento 2019”', { style: 'label-md', color: 'color/fg/default' }));
            add(none, await text('Tente outra palavra — a busca olha páginas, ações e pessoas.', { style: 'body-sm', color: 'color/fg/subtle' }));
            add(list, none, { fillW: true });
          } else {
            for (var g of GROUPS) {
              var group = box(g[0], { dir: 'V', gap: 0 });
              var label = box('Rótulo do grupo', { dir: 'H', pad: ['space/100', 'space/150', 'space/075', 'space/150'] });
              add(label, await text(g[0], { style: 'eyebrow', color: 'color/fg/subtle' }));
              add(group, label, { fillW: true });
              for (var it of g[1]) {
                var o = { 'Rótulo': it[0], 'Ícone': it[1] };
                if (it[2]) { o['Atalho'] = true; o['Texto do atalho'] = it[2]; }
                add(group, instance(item, { Estado: it[3] ? 'Selecionado' : 'Normal' }, o), { fillW: true });
              }
              add(list, group, { fillW: true });
            }
          }
          add(c, list, { fillW: true });
          var foot = box('Rodapé', { dir: 'H', gap: 'space/250', pad: ['space/150', 'space/250'], cross: 'center' });
          stroke(foot, 'color/border/subtle', 0);
          foot.strokeTopWeight = 1;
          var hints = [[['↑', '↓'], 'navegar'], [['↵'], 'abrir'], [['Esc'], 'fechar']];
          for (var h of hints) {
            var hint = box(h[1], { dir: 'H', gap: 'space/050', cross: 'center' });
            for (var key of h[0]) add(hint, await kbd(key));
            add(hint, await text(h[1], { style: 'caption', color: 'color/fg/subtle' }));
            add(foot, hint);
          }
          add(c, foot, { fillW: true });
        },
      };
    }), {
      description: 'Abre com ⌘K de qualquer tela. Busca no topo, resultados em grupos e as teclas no rodapé. Sem resultado, diz o que procurou.',
      columns: 1,
      gap: 32,
    });
    return B.palette;
  }

  defineBlock({
    id: 'paleta-comandos',
    page: 'Componentes',
    row: 'Padrões',
    order: 4,
    group: 'Padrões · Busca',
    title: 'Paleta de comandos',
    description: 'Ir a qualquer lugar e fazer qualquer coisa pelo teclado: ⌘K abre, as setas escolhem, Enter executa. Resultados em grupos, com o atalho de cada ação ao lado.',
    tags: ['Padrão', 'Claro · Escuro'],
    build: async function () {
      var item = await commandItemSet();
      var palette = await paletteSet();
      return {
        sections: [
          { title: 'Item', description: 'Normal e selecionado. Troque o ícone e ligue o atalho pelas propriedades.', span: 2, node: item },
          { title: 'Paleta', description: 'Aberta e sem resultados. 640 px, cantos de 28 px e a sombra das camadas que flutuam.', span: 2, node: palette, fill: false },
          {
            title: 'Teclado',
            description: 'A paleta é de teclado primeiro — o mouse também funciona.',
            span: 2,
            frame: true,
            node: function () {
              return rules([['check', '⌘K (Ctrl K) abre de qualquer tela'], ['check', 'Setas movem a seleção; Enter executa'], ['check', 'Esc fecha e devolve o foco a quem abriu'], ['x', 'Ações destrutivas sem confirmação']]);
            },
          },
        ].concat(themed('Paleta', function () { return instance(palette, { Estado: 'Aberta' }); }, { pad: 24 }).map(function (s) { return Object.assign(s, { span: 2 }); })),
      };
    },
  });

  /* ───────── Barra de filtros ───────── */

  async function filterFieldSet() {
    if (B.field && !B.field.removed) return B.field;
    B.field = await variants('filtro-campo', 'Filtros/Filtro', [['Sem valor', false, false], ['Com valor', true, false], ['Aberto', true, true]].map(function (f) {
      return {
        props: { Estado: f[0] },
        build: async function (c) {
          box(c.name, { dir: 'H', gap: 'space/100', pad: [0, 'space/150', 0, 'space/200'], cross: 'center', h: 36, radius: 'radius/full', fill: f[1] ? 'color/bg/selected' : null }, c);
          stroke(c, f[1] ? 'color/border/strong' : 'color/border/control', 1);
          if (f[2]) stroke(c, 'color/border/focus', 'focus-ring/width', { align: 'OUTSIDE' });
          add(c, await text('Status', { style: 'label-sm', weight: 'Semi Bold', color: 'color/fg/default', prop: 'Rótulo', name: 'Rótulo' }));
          add(c, icon(f[2] ? 'chevron-up' : 'chevron-down', 14, 'color/fg/subtle'));
        },
      };
    }), {
      description: 'Filtro da barra: abre um menu. Com valor, ganha o fundo de seleção e diz o valor no rótulo (“Status: Pago”).',
      columns: 3,
      gap: 16,
      props: { 'Rótulo': ['TEXT', 'Status'] },
    });
    return B.field;
  }

  async function searchPill(placeholder, w) {
    var s = box('Busca', { dir: 'H', gap: 'space/100', pad: [0, 6, 0, 14], cross: 'center', w: w, h: 36, radius: 'radius/full' });
    stroke(s, 'color/border/field', 1);
    add(s, icon('search', 16, 'color/fg/subtle'));
    add(s, await text(placeholder, { style: 'body-sm', color: 'color/fg/subtle', truncate: true, name: 'Busca' }), { grow: true });
    return s;
  }

  async function filterBar() {
    if (B.bar && !B.bar.removed) return B.bar;
    var field = await filterFieldSet();
    var removable = ORB.lib.removableChipSet ? await ORB.lib.removableChipSet() : null;
    var inline = ORB.lib.inlineSet ? await ORB.lib.inlineSet() : null;
    B.bar = await component('barra-filtros', 'Filtros/Barra', async function (c) {
      box(c.name, { dir: 'V', gap: 'space/150', w: 880 }, c);
      var bar = box('Barra', { dir: 'H', gap: 'space/100', cross: 'center' });
      add(bar, await searchPill('Buscar por cliente ou número', 280));
      add(bar, setText(instance(field, { Estado: 'Com valor' }), 'Rótulo', 'Status: Pago'));
      add(bar, setText(instance(field, { Estado: 'Sem valor' }), 'Rótulo', 'Canal'));
      add(bar, setText(instance(field, { Estado: 'Sem valor' }), 'Rótulo', 'Período'));
      add(bar, box('Espaço', { dir: 'H', h: 1 }), { grow: true });
      add(bar, setText(instance(field, { Estado: 'Sem valor' }), 'Rótulo', 'Ordenar: Mais recentes'));
      add(c, bar, { fillW: true });
      var summary = box('Resumo', { dir: 'H', gap: 'space/150', cross: 'center', h: 30 });
      add(summary, await text('8 de 24 pedidos', { style: 'body-sm', color: 'color/fg/muted', name: 'Contagem' }));
      var active = box('Ativos', { dir: 'H', gap: 'space/075', cross: 'center' });
      if (removable) {
        add(active, instance(removable, { Tamanho: 'P', Estado: 'Normal' }, { 'Rótulo': 'Pago' }));
        add(active, instance(removable, { Tamanho: 'P', Estado: 'Normal' }, { 'Rótulo': 'Com desconto' }));
      }
      add(summary, active);
      if (inline) add(summary, instance(inline, { Variante: 'Padrão', Estado: 'Normal' }, { 'Rótulo': 'Limpar tudo', 'Sinal': false }));
      add(c, summary, { fillW: true });
    }, { description: 'Uma linha acima da tabela ou dos gráficos: busca, filtros, ordenação à direita e, embaixo, a contagem, os filtros ativos e “Limpar tudo”.' });
    return B.bar;
  }

  defineBlock({
    id: 'barra-filtros',
    page: 'Componentes',
    row: 'Padrões',
    order: 5,
    group: 'Padrões · Busca',
    title: 'Barra de filtros',
    description: 'Filtrar sem sair da página: busca, filtros e ordenação numa linha só, sempre acima do que filtram. A contagem diz o resultado; os filtros ativos dá para tirar um a um.',
    tags: ['Padrão', 'Claro · Escuro'],
    build: async function () {
      var field = await filterFieldSet();
      var bar = await filterBar();
      return {
        sections: [
          { title: 'Filtro', description: 'Sem valor, com valor e aberto (com o menu embaixo).', node: field },
          {
            title: 'Regras',
            description: 'O que vale para tabelas e para painéis de gráficos.',
            frame: true,
            node: function () {
              return rules([['check', 'Uma linha só, acima do que filtra'], ['check', 'A contagem muda junto com o filtro'], ['check', 'Período no mesmo lugar em todas as telas'], ['x', 'Filtro escondido num menu de “Mais”']]);
            },
          },
          { title: 'Barra montada', description: 'Busca de 36 px na altura dos chips; ordenação empurrada para a direita.', span: 2, node: bar, fill: false },
        ].concat(themed('Filtros', function () { return bar.createInstance(); }, { pad: 24 }).map(function (s) { return Object.assign(s, { span: 2 }); })),
      };
    },
  });

  /* ───────── Formulário ───────── */

  async function formExample() {
    var formField = ORB.lib.formFieldSet ? await ORB.lib.formFieldSet() : null;
    var trigger = ORB.lib.selectTriggerSet ? await ORB.lib.selectTriggerSet() : null;
    var check = ORB.lib.checkboxSet ? await ORB.lib.checkboxSet() : null;
    var buttons = await buttonSet();
    var form = box('Formulário', { dir: 'V', gap: 'space/400', w: 400 });
    var head = box('Cabeçalho', { dir: 'V', gap: 'space/050' });
    add(head, await text('Clientes', { style: 'eyebrow', color: 'color/fg/subtle' }));
    add(head, await text('Novo cliente', { style: 'heading-lg', color: 'color/fg/default' }));
    add(form, head);
    if (ORB.lib.errorSummary) add(form, await ORB.lib.errorSummary(400, 'Revise 2 campos para salvar', ['Nome do cliente: diga o nome da nota fiscal', 'E-mail: use o formato nome@empresa.com']), { fillW: true });
    var fields = box('Campos', { dir: 'V', gap: 'space/300' });
    if (formField) {
      add(fields, setText(instance(formField, { Tipo: 'Erro' }, { 'Rótulo': 'Nome do cliente', 'Erro': 'Diga o nome como aparece na nota fiscal.', 'Contador': false }), 'Valor', ''), { fillW: true });
      add(fields, setText(instance(formField, { Tipo: 'Padrão' }, { 'Rótulo': 'E-mail', 'Dica': 'Para onde vão os recibos.', 'Contador': false }), 'Valor', 'compras@padaria.com'), { fillW: true });
    }
    if (trigger) {
      var plan = box('Plano', { dir: 'V', gap: 'space/075' });
      add(plan, await text('Plano', { style: 'label-md', color: 'color/fg/default' }));
      add(plan, setText(instance(trigger, { Estado: 'Preenchido' }), 'Valor', 'Pro · R$ 480/mês'), { fillW: true });
      add(fields, plan, { fillW: true });
    }
    if (check) add(fields, instance(check, { Marcação: 'Marcado', Estado: 'Normal' }, { 'Rótulo': 'Enviar e-mail de boas-vindas', 'Descrição': 'Com o link para criar a senha' }));
    add(form, fields, { fillW: true });
    var actions = box('Ações', { dir: 'H', gap: 'space/150', align: 'end' });
    add(actions, instance(buttons, { Variante: 'Secundário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Cancelar' }));
    add(actions, instance(buttons, { Variante: 'Primário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Salvar cliente' }));
    add(form, actions, { fillW: true });
    return form;
  }

  defineBlock({
    id: 'formulario',
    page: 'Componentes',
    row: 'Padrões',
    order: 6,
    group: 'Padrões',
    title: 'Formulário',
    description: 'Campos, validação e erros que ajudam a seguir: uma coluna, rótulo em cima, o resumo de erros no topo depois de enviar e a ação principal no fim, à direita.',
    tags: ['Padrão', 'Claro · Escuro'],
    build: async function () {
      return {
        sections: [
          {
            title: 'Layout',
            description: 'Uma coluna de até 480 px. Seções separadas por espaço, não por linhas.',
            frame: true,
            node: function () {
              return rules([['check', 'Rótulo sempre visível, em cima do campo'], ['check', 'Opcional marcado; obrigatório é o padrão'], ['check', 'A ação principal no fim, à direita'], ['x', 'Placeholder no lugar do rótulo']]);
            },
          },
          {
            title: 'Validação',
            description: 'Validar ao sair do campo e ao enviar — nunca a cada tecla.',
            frame: true,
            node: function () {
              return rules([['check', 'O erro diz o que fazer, com ícone'], ['check', 'Resumo no topo leva a cada campo'], ['check', 'O foco vai para o resumo ao enviar'], ['x', 'Botão de enviar desativado sem explicação']]);
            },
          },
        ].concat(themed('Formulário', formExample, { pad: 32 })),
      };
    },
  });
})();
