/**
 * Blocos de feedback: Tooltip, Toast, Alerta, Modal e Estado vazio.
 * Espelha ds/components/feedback.css (tooltip, vazio), toast.css, alert.css e modal.css.
 */
(function () {
  /* ───────── Peças ───────── */

  /** Botão de ícone (.ds-icon-btn): sem fundo, só o ícone. */
  function iconButton(name, o) {
    o = o || {};
    var size = o.size || 36;
    var b = box('Botão de ícone · ' + name, { dir: 'H', align: 'center', cross: 'center', w: size, h: size, radius: size <= 28 ? 'radius/xs' : 'radius/sm' });
    if (o.outline) stroke(b, 'color/border/control', 1);
    if (o.hover) fill(b, 'color/bg/hover');
    add(b, icon(name, o.iconSize || (size <= 28 ? 16 : 20), o.color || 'color/fg/default'));
    return b;
  }

  /** Tecla de atalho (.ds-kbd). */
  async function kbd(label) {
    var k = box('Tecla', { dir: 'H', align: 'center', cross: 'center', pad: [0, 5], h: 20, radius: 'radius/xs', fill: 'color/bg/hover', stroke: 'color/border/default' });
    add(k, await text(label, { style: 'caption', size: 11, weight: 'Medium', color: 'color/fg/subtle', name: 'Tecla' }));
    return k;
  }

  /** Troca o texto de uma camada da instância (para exemplos de conjuntos sem propriedade de texto). */
  function setText(node, name, chars) {
    var t = node.findOne(function (n) { return n.type === 'TEXT' && n.name === L(name); });
    if (t) t.characters = L(chars);
    return node;
  }

  /** Ação mínima (.ds-inline-action): texto apagado + seta. */
  async function inlineAction(label, iconName, before) {
    var a = box('Ação inline', { dir: 'H', gap: 'space/100', cross: 'center', pad: [0, 4], h: 28, radius: 'radius/xs' });
    var ic = icon(iconName || 'arrow-right', 14, 'color/fg/subtle');
    if (before) add(a, ic);
    add(a, await text(label, { style: 'label-sm', weight: 'Regular', color: 'color/fg/subtle' }));
    if (!before) add(a, ic);
    return a;
  }

  /* ───────── Tooltip ───────── */

  var TIP = {};

  async function tooltipSet() {
    if (TIP.set && !TIP.set.removed) return TIP.set;
    var items = [['Não', false], ['Sim', true]].map(function (k) {
      return {
        props: { Atalho: k[0] },
        build: async function (c) {
          box(c.name, { dir: 'H', gap: 'space/100', cross: 'center', pad: [6, 10], radius: 'radius/sm', fill: 'color/bg/raised', stroke: 'color/border/default' }, c);
          shadow(c, 'sm');
          add(c, await text('Recolher menu', { style: 'label-sm', color: 'color/fg/default', prop: 'Texto', name: 'Texto' }));
          if (k[1]) {
            var keys = box('Atalho', { dir: 'H', gap: 3 });
            add(keys, await kbd('⌘'));
            add(keys, await kbd('B'));
            add(c, keys);
          }
        },
      };
    });
    TIP.set = await variants('tooltip', 'Tooltip', items, {
      description: 'Dica curta no hover e no foco: nomeia botões de ícone e ensina atalhos. Até 240 px; dá para apontar o balão sem ele sumir.',
      columns: 2,
      gap: 32,
      props: { 'Texto': ['TEXT', 'Recolher menu'] },
    });
    return TIP.set;
  }

  /** Gatilho + balão numa das quatro posições (10 px de vão, como o tooltip.js). */
  function placement(set, where) {
    var trigger = iconButton('copy', { outline: true, hover: true });
    var tip = instance(set, { Atalho: 'Não' }, { 'Texto': 'Copiar link' });
    var vertical = where === 'Em cima' || where === 'Embaixo';
    var pair = box(where, { dir: vertical ? 'V' : 'H', gap: 10, cross: 'center' });
    var first = where === 'Em cima' || where === 'À esquerda';
    addAll(pair, first ? [tip, trigger] : [trigger, tip]);
    return pair;
  }

  defineBlock({
    id: 'tooltip',
    page: 'Componentes',
    row: 'Feedback',
    order: 1,
    group: 'Feedback',
    title: 'Tooltip',
    description: 'Dica curta que aparece no hover e no foco. Nomeia botões de ícone e mostra atalhos. Nunca guarde nela algo que a pessoa precisa para concluir a tarefa.',
    build: async function () {
      var set = await tooltipSet();
      return {
        sections: [
          { title: 'Variantes', description: 'Só texto, ou texto com o atalho de teclado.', node: set },
          {
            title: 'Posições',
            description: 'Em cima é o padrão; o balão troca de lado quando não cabe.',
            frame: true,
            cross: 'center',
            node: function () {
              var grid = box('Posições', { dir: 'H', wrap: true, gap: 40, rowGap: 32, cross: 'center', align: 'center', w: 340 });
              ['Em cima', 'Embaixo', 'À direita', 'À esquerda'].forEach(function (p) { add(grid, placement(set, p)); });
              return grid;
            },
          },
        ].concat(themed('Tooltip', async function () {
          var bar = box('Barra', { dir: 'V', gap: 10, cross: 'start' });
          var tools = box('Ferramentas', { dir: 'H', gap: 4, pad: 4, radius: 'radius/md', fill: 'color/bg/surface', stroke: 'color/border/subtle' });
          ['panel-left', 'search', 'copy', 'download', 'more-horizontal'].forEach(function (n, i) { add(tools, iconButton(n, { hover: i === 0, color: 'color/fg/muted' })); });
          add(bar, tools);
          add(bar, instance(set, { Atalho: 'Sim' }, { 'Texto': 'Recolher menu' }));
          return bar;
        }, { cross: 'start' })),
      };
    },
  });

  /* ───────── Toast ───────── */

  var TOAST_TONES = [
    ['Neutro', null, 'check'],
    ['Sucesso', 'success', 'check-circle'],
    ['Atenção', 'warning', 'alert-triangle'],
    ['Perigo', 'danger', 'alert-circle'],
    ['Informação', 'info', 'info'],
  ];
  var TOAST_KINDS = ['Simples', 'Com ação', 'Com fechar'];

  async function buildToast(c, tone, kind) {
    var extra = kind !== 'Simples';
    box(c.name, { dir: 'H', gap: 'space/100', cross: 'center', pad: [0, extra ? 'space/100' : 'space/200', 0, 'space/150'], h: 40, radius: 'radius/md', fill: 'color/bg/inverse' }, c);
    shadow(c, 'md');
    if (tone[1]) {
      var dot = box('Ícone', { dir: 'H', align: 'center', cross: 'center', w: 22, h: 22, radius: 'radius/full', fill: 'color/' + tone[1] + '/solid' });
      add(dot, icon(tone[2], 14, 'color/' + tone[1] + '/on-solid'));
      add(c, dot);
    } else add(c, icon(tone[2], 18, 'color/fg/inverse'));
    add(c, await text(tone[1] === 'danger' ? 'Não deu para salvar' : 'Projeto arquivado', { style: 'label-md', color: 'color/fg/inverse', name: 'Mensagem' }));
    if (kind === 'Com ação') {
      var act = box('Ação', { dir: 'H', cross: 'center', pad: [0, 'space/100'], h: 28, radius: 'radius/sm' });
      var label = await text('Desfazer', { style: 'label-md', weight: 'Semi Bold', color: 'color/fg/inverse', prop: 'Ação', name: 'Ação' });
      label.textDecoration = 'UNDERLINE';
      add(act, label);
      var gapA = box('Respiro', { dir: 'H', w: 8, h: 1 });
      add(c, gapA);
      add(c, act);
    }
    if (kind === 'Com fechar') {
      var close = box('Fechar', { dir: 'H', align: 'center', cross: 'center', w: 28, h: 28, radius: 'radius/sm', opacity: 'opacity/muted' });
      add(close, icon('x', 16, 'color/fg/inverse'));
      add(c, close);
    }
  }

  var TOAST = {};

  async function toastSet() {
    if (TOAST.set && !TOAST.set.removed) return TOAST.set;
    var items = [];
    TOAST_TONES.forEach(function (tone) {
      TOAST_KINDS.forEach(function (kind) {
        items.push({ props: { Tom: tone[0], Tipo: kind }, build: function (c) { return buildToast(c, tone, kind); } });
      });
    });
    TOAST.set = await variants('toast', 'Toast', items, {
      description: 'Aviso curto e passageiro no fundo invertido. O tom vem no ícone — com círculo na cor do status — e no texto.',
      columns: 3,
      gap: 16,
      rowGap: 16,
      props: { 'Ação': ['TEXT', 'Desfazer'] },
    });
    return TOAST.set;
  }

  defineBlock({
    id: 'toast',
    page: 'Componentes',
    row: 'Feedback',
    order: 2,
    group: 'Feedback',
    title: 'Toast',
    description: 'Confirma o que aconteceu sem interromper. Some sozinho em alguns segundos; com ação (desfazer) fica um pouco mais; o que precisa de leitura fica até fechar.',
    build: async function () {
      var set = await toastSet();
      return {
        sections: [
          { title: 'Tons e tipos', description: 'Neutro, sucesso, atenção, perigo e informação; simples, com ação ou com fechar.', span: 2, fill: false, node: function () { return labeledMatrix(set, TOAST_KINDS, TOAST_TONES.map(function (t) { return t[0]; })); } },
        ].concat(themed('Toasts', async function () {
          var stack = box('Pilha', { dir: 'V', gap: 'space/100', cross: 'end', w: 416 });
          add(stack, instance(set, { Tom: 'Sucesso', Tipo: 'Com ação' }, { 'Ação': 'Desfazer' }));
          add(stack, instance(set, { Tom: 'Perigo', Tipo: 'Com fechar' }));
          add(stack, setText(instance(set, { Tom: 'Neutro', Tipo: 'Simples' }), 'Mensagem', 'Link copiado'));
          return stack;
        }, { cross: 'end' })),
      };
    },
  });

  /* ───────── Alerta ───────── */

  var ALERT_TONES = [
    ['Neutro', null, 'info', 'Seu plano renova em 3 dias', 'Nada muda no preço. Você recebe o recibo por e-mail.', 'em 3 dias.', 'Plano renova'],
    ['Informação', 'info', 'info', 'Manutenção no sábado', 'Das 2h às 4h os relatórios ficam só para leitura.', 'sábado, 2h–4h.', 'Manutenção'],
    ['Sucesso', 'success', 'check-circle', 'Integração conectada', 'Os pedidos novos chegam aqui a cada 5 minutos.', 'há 2 min.', 'Conectada'],
    ['Atenção', 'warning', 'alert-triangle', 'Cota quase no limite', 'Você usou 92% das chamadas de API do mês.', 'deste mês.', 'Cota em 92%'],
    ['Perigo', 'danger', 'alert-circle', 'Não conseguimos salvar', 'Suas alterações continuam aqui. Tente de novo em alguns segundos.', 'tente de novo.', 'Não salvou'],
  ];

  function alertColors(tone) {
    if (!tone) return { bg: 'color/bg/surface', border: 'color/border/subtle', icon: 'color/fg/muted' };
    return { bg: 'color/' + tone + '/subtle', border: 'color/' + tone + '/border', icon: 'color/' + tone + '/fg' };
  }

  async function buildAlert(c, t, compact, buttons) {
    var col = alertColors(t[1]);
    if (compact) {
      box(c.name, { dir: 'H', gap: 'space/150', cross: 'center', pad: ['space/100', 'space/150', 'space/100', 'space/200'], w: 400, radius: 'radius/md', fill: col.bg, stroke: col.border }, c);
    } else {
      box(c.name, { dir: 'H', gap: 'space/150', cross: 'start', pad: ['space/200', 'space/250'], w: 400, radius: 'radius/lg', fill: col.bg, stroke: col.border }, c);
    }
    var ic = box('Ícone', { dir: 'H', cross: 'center', h: 22 });
    add(ic, icon(t[2], 20, col.icon));
    add(c, ic);
    var body = box('Corpo', { dir: compact ? 'H' : 'V', gap: compact ? 'space/100' : 'space/050', cross: compact ? 'baseline' : 'start' });
    add(body, await text(compact ? t[6] : t[3], { style: 'label-md', color: 'color/fg/default', name: 'Título' }));
    var msg = await text(compact ? t[5] : t[4], { style: 'body-sm', color: 'color/fg/muted', name: 'Texto', w: compact ? undefined : 300, truncate: compact });
    add(body, msg, { fillW: true });
    if (compact) { msg.maxLines = 1; body.clipsContent = true; }
    if (!compact) {
      var actions = box('Ações', { dir: 'H', gap: 'space/200', cross: 'center', pad: ['space/050', 0, 0, 0] });
      add(actions, instance(buttons, { Variante: 'Secundário', Tamanho: 'P', Estado: 'Normal' }, { 'Rótulo': t[1] === 'danger' ? 'Tentar de novo' : 'Ver detalhes' }));
      exposes(actions, 'visible', 'Ações');
      add(body, actions);
    }
    add(c, body, { fillW: true });
    if (compact) {
      var link = await inlineAction('Detalhes');
      exposes(link, 'visible', 'Ações');
      add(c, link);
    }
    var close = iconButton('x', { size: 28, color: 'color/fg/muted' });
    exposes(close, 'visible', 'Fechar');
    add(c, close);
  }

  var ALERT = {};

  async function alertSet() {
    if (ALERT.set && !ALERT.set.removed) return ALERT.set;
    var buttons = await buttonSet();
    var items = [];
    ALERT_TONES.forEach(function (t) {
      [['Completo', false], ['Compacto', true]].forEach(function (f) {
        items.push({ props: { Tom: t[0], Formato: f[0] }, build: function (c) { return buildAlert(c, t, f[1], buttons); } });
      });
    });
    ALERT.set = await variants('alerta', 'Alerta', items, {
      description: 'Mensagem inline com tom. Ícone e texto dizem o mesmo que a cor. Compacto cabe numa linha, dentro de painéis.',
      columns: 2,
      gap: 24,
      rowGap: 20,
      props: {
        'Ações': ['BOOLEAN', true],
        'Fechar': ['BOOLEAN', false],
      },
    });
    return ALERT.set;
  }

  /** Resumo de erros do formulário: alerta de perigo com links para cada campo. */
  LUME.lib = LUME.lib || {};
  LUME.lib.errorSummary = function (w, title, items) { return errorSummary(w, title, items); };

  async function errorSummary(w, title, items) {
    var col = alertColors('danger');
    var a = box('Resumo de erros', { dir: 'H', gap: 'space/150', cross: 'start', pad: ['space/200', 'space/250'], w: w, radius: 'radius/lg', fill: col.bg, stroke: col.border });
    var ic = box('Ícone', { dir: 'H', cross: 'center', h: 22 });
    add(ic, icon('alert-circle', 20, col.icon));
    add(a, ic);
    var body = box('Corpo', { dir: 'V', gap: 'space/050' });
    add(body, await text(title || 'Revise 3 campos para continuar', { style: 'label-md' }));
    var list = box('Lista', { dir: 'V', gap: 'space/050', pad: ['space/050', 0, 0, 0] });
    for (var item of items || ['Nome do projeto: dê um nome ao projeto', 'Endereço: escolha um endereço', 'E-mail: use o formato nome@empresa.com']) {
      // o texto quebra dentro do resumo em vez de vazar
      var t = await text(item, { style: 'body-sm', color: 'color/fg/default', w: w - 92 });
      t.textDecoration = 'UNDERLINE';
      add(list, t);
    }
    add(body, list);
    add(a, body, { fillW: true });
    return a;
  }

  defineBlock({
    id: 'alerta',
    page: 'Componentes',
    row: 'Feedback',
    order: 3,
    group: 'Feedback',
    title: 'Alerta',
    description: 'Mensagem que fica na página até a situação mudar: aviso, sucesso, erro. Tem título, texto, ações e fechar opcional. O tom nunca vem sozinho.',
    build: async function () {
      var set = await alertSet();
      return {
        sections: [
          { title: 'Tons e formatos', description: 'Neutro, informação, sucesso, atenção e perigo; completo ou compacto.', span: 2, fill: false, node: function () { return labeledMatrix(set, ['Completo', 'Compacto'], ALERT_TONES.map(function (t) { return t[0]; })); } },
          {
            title: 'Resumo de erros',
            description: 'No topo do formulário, depois de enviar: diz quantos campos revisar e leva a cada um.',
            span: 2,
            frame: true,
            node: function () { return errorSummary(520); },
          },
        ].concat(themed('Alertas', async function () {
          var panel = box('Painel', { dir: 'V', gap: 12, pad: 20, w: 416, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          add(panel, await text('Integrações', { style: 'heading-xs' }));
          add(panel, instance(set, { Tom: 'Atenção', Formato: 'Completo' }), { fillW: true });
          var ok = instance(set, { Tom: 'Sucesso', Formato: 'Compacto' }, { 'Ações': false });
          setText(setText(ok, 'Título', 'Webhook ativo'), 'Texto', 'último envio há 2 min.');
          add(panel, ok, { fillW: true });
          return panel;
        })),
      };
    },
  });

  /* ───────── Modal ───────── */

  var MODAL_TYPES = [
    ['Padrão', false, 'Convidar pessoas', 'Quem você convidar recebe um e-mail e entra no time na hora. Dá para mudar o acesso depois.', 'Convidar'],
    ['Destrutivo', true, 'Excluir projeto?', 'O projeto “Lançamento de outubro” e os 24 arquivos dele somem para todo mundo. Não dá para desfazer.', 'Excluir projeto'],
  ];
  var MODAL_SIZES = [['P', 400], ['M', 520]];

  async function buildModal(c, t, w, buttons) {
    box(c.name, { dir: 'V', gap: 0, w: w, fill: 'color/bg/raised', stroke: 'color/border/subtle', radius: 'radius/2xl', clip: true }, c);
    shadow(c, 'md');
    var head = box('Cabeçalho', { dir: 'H', gap: 'space/200', cross: 'start', pad: ['space/400', 'space/300', 0, 'space/400'] });
    if (t[1]) {
      var ic = box('Ícone', { dir: 'H', align: 'center', cross: 'center', w: 40, h: 40, radius: 'radius/full', fill: 'color/danger/subtle' });
      add(ic, icon('alert-triangle', 20, 'color/danger/fg'));
      add(head, ic);
    }
    var heading = box('Título', { dir: 'V', gap: 'space/050', pad: [2, 0, 0, 0] });
    var eyebrow = await text(t[1] ? 'Projetos' : 'Time de Pagamentos', { style: 'eyebrow', color: 'color/fg/subtle', name: 'Sobretítulo' });
    exposes(eyebrow, 'visible', 'Com sobretítulo');
    add(heading, eyebrow);
    add(heading, await text(t[2], { style: 'heading-lg', color: 'color/fg/default', name: 'Título', w: w - 160 }), { fillW: true });
    add(head, heading, { fillW: true });
    var close = box('Fechar', { dir: 'V', pad: [0, 0, 0, 0] });
    add(close, iconButton('x', { color: 'color/fg/muted' }));
    add(head, close);
    add(c, head, { fillW: true });
    var body = box('Corpo', { dir: 'V', pad: ['space/200', 'space/400', 0, t[1] ? 88 : 'space/400'] });
    add(body, await text(t[3], { style: 'body-md', color: 'color/fg/muted', name: 'Texto', w: w - 120 }), { fillW: true });
    add(c, body, { fillW: true });
    var foot = box('Rodapé', { dir: 'H', gap: 'space/150', align: 'end', pad: 'space/400' });
    add(foot, instance(buttons, { Variante: 'Secundário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Cancelar' }));
    add(foot, instance(buttons, { Variante: t[1] ? 'Perigo' : 'Primário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': t[4] }));
    add(c, foot, { fillW: true });
  }

  var MODAL = {};

  async function modalSet() {
    if (MODAL.set && !MODAL.set.removed) return MODAL.set;
    var buttons = await buttonSet();
    var items = [];
    MODAL_TYPES.forEach(function (t) {
      MODAL_SIZES.forEach(function (sz) {
        items.push({ props: { Tipo: t[0], Tamanho: sz[0] }, build: function (c) { return buildModal(c, t, sz[1], buttons); } });
      });
    });
    MODAL.set = await variants('modal', 'Modal', items, {
      description: 'Interrompe para uma decisão ou tarefa curta. Título que diz a pergunta, texto com a consequência e a ação com o nome do que acontece.',
      columns: 2,
      gap: 32,
      rowGap: 32,
      props: {
        'Com sobretítulo': ['BOOLEAN', true],
      },
    });
    return MODAL.set;
  }

  defineBlock({
    id: 'modal',
    page: 'Componentes',
    row: 'Feedback',
    order: 4,
    group: 'Feedback',
    title: 'Modal',
    description: 'Para uma decisão que não pode esperar ou uma tarefa curta. Destrutivo ganha ícone e o botão de perigo — e o texto diz o que some.',
    build: async function () {
      var set = await modalSet();
      return {
        sections: [
          { title: 'Tipos e tamanhos', description: 'Padrão e destrutivo, em P (400) e M (520, o padrão).', span: 2, fill: false, node: function () { return labeledMatrix(set, ['P · 400', 'M · 520'], null); } },
        ].concat(themed('Modal', async function () {
          // o véu ocupa a moldura inteira (mesmo raio), com o modal no centro
          var scrim = box('Fundo', { dir: 'V', align: 'center', cross: 'center', pad: 28, w: 456, radius: 24, fill: 'color/bg/overlay' });
          add(scrim, instance(set, { Tipo: 'Destrutivo', Tamanho: 'P' }, { 'Com sobretítulo': false }));
          return scrim;
        }, { pad: 0, fillChildren: true })),
      };
    },
  });

  /* ───────── Estado vazio ───────── */

  var EMPTY = [
    ['Primeiro uso', null, 'folder', 'Nenhum projeto ainda', 'Projetos reúnem tarefas, arquivos e pessoas. Crie o primeiro e convide o time.', ['Primário', 'plus', 'Criar projeto'], ['Ver um exemplo', 'arrow-right']],
    ['Sem resultados', null, 'search-x', 'Nada encontrado para “orçamento 2019”', 'Confira a grafia ou tente outra palavra. A busca olha títulos e autores.', ['Secundário', 'x', 'Limpar busca'], ['Limpar filtros', 'filter']],
    ['Erro', 'danger', 'alert-circle', 'Não conseguimos carregar os pagamentos', 'Pode ser instabilidade do nosso lado. Seus dados estão seguros — tente de novo em alguns segundos.', ['Secundário', 'refresh', 'Tentar de novo'], ['Ver status do serviço', 'external-link']],
    ['Sem permissão', 'muted', 'lock', 'Você não tem acesso a este relatório', 'Ele é do time de Finanças. Peça acesso a quem criou — a pessoa recebe um aviso.', ['Primário', 'mail', 'Pedir acesso'], ['Voltar para relatórios', 'arrow-left', true]],
    ['Offline', 'warning', 'wifi-off', 'Sem conexão', 'Não há uma versão salva desta lista. Ela carrega sozinha quando a internet voltar.', ['Secundário', 'refresh', 'Tentar agora'], null],
    ['Carregando', 'loading', 'loader', 'Carregando os projetos…', 'Costuma levar poucos segundos.', null, null],
  ];
  // a linha de lista só faz sentido com uma ação: as três primeiras situações
  var EMPTY_LIST = EMPTY.slice(0, 3);

  /** Ícone do estado vazio por tom: marca (padrão), status, apagado (sem acesso) e carregando (sem fundo). */
  function emptyTone(tone) {
    if (!tone) return { bg: 'color/bg/muted', fg: 'color/fg/brand' };
    if (tone === 'muted') return { bg: 'color/bg/muted', fg: 'color/fg/muted' };
    if (tone === 'loading') return { bg: null, fg: 'color/fg/muted' };
    return { bg: 'color/' + tone + '/subtle', fg: 'color/' + tone + '/fg' };
  }
  var EMPTY_PLACES = [
    ['Página', { w: 460, pad: ['space/800', 'space/300'], gap: 'space/200', radius: 'radius/2xl', iconBox: 56, iconRadius: 'radius/lg', title: 'heading-md', size: 'M' }],
    ['Painel', { w: 340, pad: ['space/500', 'space/250'], gap: 'space/150', radius: 'radius/xl', iconBox: 40, iconRadius: 'radius/md', title: 'heading-xs', size: 'P' }],
  ];

  async function buildEmpty(c, e, place, buttons) {
    var p = place[1];
    box(c.name, { dir: 'V', gap: p.gap, cross: 'center', pad: p.pad, w: p.w, radius: p.radius, fill: 'color/bg/sunken' }, c);
    stroke(c, 'color/border/default', 1, { dash: [4, 4] });
    var tone = emptyTone(e[1]);
    var ib = box('Ícone', { dir: 'H', align: 'center', cross: 'center', w: p.iconBox, h: p.iconBox, radius: p.iconRadius, fill: tone.bg });
    add(ib, icon(e[2], p.iconBox > 48 ? 24 : 20, tone.fg));
    add(c, ib);
    var copy = box('Texto', { dir: 'V', gap: 'space/050', cross: 'center' });
    add(copy, await text(e[3], { style: p.title, color: 'color/fg/default', align: 'center', w: p.w - 64, name: 'Título' }));
    add(copy, await text(e[4], { style: 'body-sm', color: 'color/fg/muted', align: 'center', w: Math.min(360, p.w - 64), name: 'Descrição' }));
    add(c, copy);
    if (e[5]) {
      var actions = box('Ações', { dir: 'H', wrap: true, gap: 'space/200', rowGap: 'space/150', cross: 'center', align: 'center', pad: ['space/050', 0, 0, 0] });
      add(actions, instance(buttons, { Variante: e[5][0], Tamanho: p.size, Estado: 'Normal' }, { 'Rótulo': e[5][2], 'Ícone': true, 'Trocar ícone': e[5][1] }));
      if (e[6]) add(actions, await inlineAction(e[6][0], e[6][1], e[6][2]));
      exposes(actions, 'visible', 'Ações');
      add(c, actions);
    }
    if (e[0] === 'Erro') add(c, await text('Erro 503 · 14:32', { style: 'caption', color: 'color/fg/subtle', name: 'Detalhe' }));
  }

  async function buildEmptyInline(c, e, buttons) {
    box(c.name, { dir: 'H', gap: 'space/200', cross: 'center', pad: 'space/250', w: 560, radius: 'radius/lg', fill: 'color/bg/sunken' }, c);
    stroke(c, 'color/border/default', 1, { dash: [4, 4] });
    var tone = emptyTone(e[1]);
    var ib = box('Ícone', { dir: 'H', align: 'center', cross: 'center', w: 36, h: 36, radius: 'radius/md', fill: tone.bg });
    add(ib, icon(e[2], 18, tone.fg));
    add(c, ib);
    var copy = box('Texto', { dir: 'V', gap: 2 });
    add(copy, await text(e[3], { style: 'label-md', color: 'color/fg/default', name: 'Título', truncate: true, w: 300 }), { fillW: true });
    add(copy, await text(e[4], { style: 'body-sm', color: 'color/fg/muted', name: 'Descrição', w: 300 }), { fillW: true });
    add(c, copy, { fillW: true });
    add(c, instance(buttons, { Variante: 'Secundário', Tamanho: 'P', Estado: 'Normal' }, { 'Rótulo': e[5][2] }));
  }

  var EMP = {};

  async function emptySet() {
    if (EMP.set && !EMP.set.removed) return EMP.set;
    var buttons = await buttonSet();
    var items = [];
    EMPTY.forEach(function (e) {
      EMPTY_PLACES.forEach(function (pl) {
        items.push({ props: { Situação: e[0], Lugar: pl[0] }, build: function (c) { return buildEmpty(c, e, pl, buttons); } });
      });
    });
    EMP.set = await variants('vazio', 'Estado vazio', items, {
      description: 'Quando não há nada para mostrar: diga por quê e ofereça o próximo passo. Página inteira ou dentro de um painel.',
      columns: 2,
      gap: 32,
      rowGap: 32,
      props: {
        'Ações': ['BOOLEAN', true],
      },
    });
    return EMP.set;
  }

  async function emptyInlineSet() {
    if (EMP.inline && !EMP.inline.removed) return EMP.inline;
    var buttons = await buttonSet();
    var items = EMPTY_LIST.map(function (e) {
      return { props: { Situação: e[0] }, build: function (c) { return buildEmptyInline(c, e, buttons); } };
    });
    EMP.inline = await variants('vazio-lista', 'Estado vazio/Lista', items, {
      description: 'Na linha de uma tabela ou lista: ícone à esquerda, ação à direita.',
      columns: 1,
      gap: 16,
      rowGap: 16,
    });
    return EMP.inline;
  }

  defineBlock({
    id: 'estado-vazio',
    page: 'Componentes',
    row: 'Feedback',
    order: 5,
    group: 'Feedback',
    title: 'Estado vazio',
    description: 'Nunca uma área em branco: diga o que aconteceu — ainda não há nada, o filtro não achou, falta acesso, caiu a conexão ou ainda está carregando — e ofereça o próximo passo.',
    build: async function () {
      var set = await emptySet();
      var inline = await emptyInlineSet();
      return {
        sections: [
          { title: 'Situações e lugares', description: 'Primeiro uso, sem resultados, erro, sem permissão, offline e carregando; em página inteira ou dentro de painel. Carregando não tem ação.', span: 2, fill: false, node: function () { return labeledMatrix(set, ['Página', 'Painel'], EMPTY.map(function (e) { return e[0]; })); } },
          { title: 'Dentro de lista', description: 'Compacto, numa linha — para tabelas e listas que ficaram sem itens.', span: 2, node: inline },
        ].concat(themed('Estado vazio', async function () {
          var panel = box('Painel', { dir: 'V', gap: 16, pad: 20, w: 400, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
          var head = box('Cabeçalho', { dir: 'H', align: 'between', cross: 'center' });
          add(head, await text('Projetos', { style: 'heading-xs' }));
          add(head, await text('0 de 0', { style: 'caption', color: 'color/fg/subtle' }));
          add(panel, head, { fillW: true });
          add(panel, instance(set, { Situação: 'Primeiro uso', Lugar: 'Painel' }), { fillW: true });
          return panel;
        })),
      };
    },
  });
})();
