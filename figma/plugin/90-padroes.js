/**
 * Padrões: Mensagens e cartão de resultado, Composer e o App shell em miniatura.
 * Espelha ds/components/chat.css e shell.css.
 */
(function () {
  /* ───────── Peças locais ───────── */

  /** A chama do Lume, como em assets/favicon.svg: cores fixas do tema Refúgio do app (é logotipo, não segue o tema). */
  function flame(size) {
    var f = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24">' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248z" fill="#c97b63"/>' +
      '<path d="M15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1.001a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.717z" fill="#ffffff" fill-opacity="0.28"/></svg>');
    f.name = L('Chama');
    return f;
  }

  function iconButton(name, size, color) {
    var s = size || 32;
    var b = box('Botão de ícone · ' + name, { dir: 'H', align: 'center', cross: 'center', w: s, h: s, radius: 'radius/sm' });
    add(b, icon(name, s <= 32 ? 16 : 20, color || 'color/fg/muted'));
    return b;
  }

  async function inlineAction(label, iconName, after) {
    var a = box('Ação inline · ' + label, { dir: 'H', gap: 'space/100', cross: 'center', h: 28 });
    if (iconName && !after) add(a, icon(iconName, 14, 'color/fg/subtle'));
    add(a, await text(label, { style: 'label-sm', weight: 'Regular', color: 'color/fg/subtle' }));
    if (iconName && after) add(a, icon(iconName, 14, 'color/fg/subtle'));
    return a;
  }

  /** O carimbo do Lume no cabeçalho da resposta: “L” sobre o tom da marca. */
  async function mark(size) {
    var s = size || 24;
    var m = box('Marca', { dir: 'H', align: 'center', cross: 'center', w: s, h: s, radius: 'radius/sm', fill: 'color/brand/subtle' });
    add(m, await text('L', { style: 'label-sm', weight: 'Bold', color: 'color/brand/fg' }));
    return m;
  }

  /* ───────── Mensagens ───────── */

  var MSG_W = 400;
  var P = {};

  async function messageSet() {
    if (P.msg && !P.msg.removed) return P.msg;
    var items = [
      ['Usuário', 'Normal'],
      ['Usuário', 'Erro'],
      ['Assistente', 'Normal'],
      ['Assistente', 'Escrevendo'],
    ].map(function (v) {
      return {
        props: { Autor: v[0], Estado: v[1] },
        build: async function (c) {
          var user = v[0] === 'Usuário';
          box(c.name, { dir: 'V', gap: 'space/100', cross: user ? 'end' : 'start', w: MSG_W }, c);
          if (user) {
            var bubble = box('Balão', { dir: 'H', pad: ['space/150', 'space/200'], fill: 'color/bg/raised', stroke: v[1] === 'Erro' ? 'color/danger/border' : 'color/border/subtle', radius: 'radius/xl' });
            num(bubble, 'bottomRightRadius', 'radius/xs');
            add(bubble, await text('Crie um roteiro de 3 cenas para o lançamento da versão 0.4.', { style: 'body-md', color: 'color/fg/default', w: 300, prop: 'Pergunta', name: 'Pergunta' }));
            add(c, bubble);
            if (v[1] === 'Erro') {
              var err = box('Erro', { dir: 'H', gap: 'space/150', cross: 'center' });
              var why = box('Motivo', { dir: 'H', gap: 'space/075', cross: 'center' });
              add(why, icon('alert-circle', 16, 'color/danger/fg'));
              add(why, await text('Não foi possível enviar.', { style: 'body-sm', color: 'color/danger/fg' }));
              add(err, why);
              add(err, await inlineAction('Tentar de novo', 'refresh'));
              add(c, err);
            } else {
              var meta = box('Meta', { dir: 'H', gap: 4 });
              add(meta, await text('Você ·', { style: 'caption', color: 'color/fg/subtle' }));
              add(meta, await text('09:41', { style: 'caption', color: 'color/fg/subtle', prop: 'Hora', name: 'Hora' }));
              add(c, meta);
            }
            return;
          }
          var head = box('Cabeçalho', { dir: 'H', gap: 'space/100', cross: 'center' });
          add(head, await mark(24));
          add(head, await text('Lume', { style: 'eyebrow', color: 'color/fg/default' }));
          add(head, await text('·', { style: 'eyebrow', color: 'color/fg/subtle' }));
          add(head, await text('09:41', { style: 'eyebrow', color: 'color/fg/subtle', prop: 'Hora', name: 'Hora' }));
          add(c, head);
          if (v[1] === 'Escrevendo') {
            var typing = box('Escrevendo', { dir: 'H', gap: 'space/100', cross: 'center', h: 28 });
            var dots = box('Pontos', { dir: 'H', gap: 4, cross: 'center' });
            [1, 0.6, 0.3].forEach(function (op) {
              var d = shape('Ponto', { ellipse: true, w: 6, h: 6 });
              fill(d, 'color/fg/subtle', op);
              add(dots, d);
            });
            add(typing, dots);
            add(typing, await text('Escrevendo…', { style: 'body-sm', color: 'color/fg/subtle' }));
            add(c, typing);
            return;
          }
          add(c, await text('Montei um roteiro curto, em três cenas. Cada uma cabe em até 20 segundos.', { style: 'body-md', color: 'color/fg/default', w: MSG_W, prop: 'Resposta', name: 'Resposta' }), { fillW: true });
          var actions = box('Ações', { dir: 'H', gap: 2, pad: [0, 0, 0, 0] });
          ['copy', 'refresh', 'thumbs-up', 'thumbs-down'].forEach(function (n) { add(actions, iconButton(n, 32)); });
          add(c, actions);
        },
      };
    });
    P.msg = await variants('mensagem', 'Mensagem', items, {
      description: 'Pergunta em balão sólido à direita; resposta em texto de leitura, sem balão, com o carimbo do Lume e as ações.',
      columns: 2,
      gap: 32,
      rowGap: 32,
      // uma propriedade por texto: o padrão de uma propriedade vale para todas as variantes do conjunto
      props: { 'Pergunta': ['TEXT', 'Crie um roteiro de 3 cenas para o lançamento da versão 0.4.'], 'Resposta': ['TEXT', 'Montei um roteiro curto, em três cenas. Cada uma cabe em até 20 segundos.'], 'Hora': ['TEXT', '09:41'] },
    });
    return P.msg;
  }

  var SCENES = [['01', 'Abertura', 'Tela escura. O nome Lume aparece, sem enfeite.'], ['02', 'O problema', 'Três telas do mesmo produto, cada uma de um jeito.'], ['03', 'A virada', 'Um token muda e todas as telas mudam juntas.']];

  async function resultCard() {
    if (P.card && !P.card.removed) return P.card;
    P.card = await component('cartao-resultado', 'Cartão de resultado', async function (c) {
      box(c.name, { dir: 'V', gap: 'space/100', pad: ['space/250', 'space/300', 'space/250', 'space/300'], w: MSG_W, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' }, c);
      var head = box('Cabeçalho', { dir: 'H', gap: 'space/150', align: 'between' });
      var titles = box('Títulos', { dir: 'V', gap: 2 });
      add(titles, await text('Roteiro · 3 cenas · ~45 s', { style: 'eyebrow', color: 'color/fg/subtle', prop: 'Rótulo', name: 'Rótulo' }));
      add(titles, await text('Lançamento do Lume 0.4', { style: 'heading-sm', color: 'color/fg/default', prop: 'Título', name: 'Título' }));
      add(head, titles);
      var tools = box('Ferramentas', { dir: 'H', gap: 2 });
      add(tools, iconButton('copy', 32));
      add(tools, iconButton('more-horizontal', 32));
      add(head, tools);
      add(c, head, { fillW: true });
      var list = box('Cenas', { dir: 'V', gap: 'space/150', pad: ['space/100', 0, 0, 0] });
      for (var sc of SCENES) {
        var item = box('Cena ' + sc[0], { dir: 'V', gap: 'space/050' });
        var h = box('Carimbo e rótulo', { dir: 'H', gap: 'space/150', cross: 'baseline' });
        add(h, await text(sc[0], { style: 'caption', color: 'color/fg/subtle' }));
        add(h, await text(sc[1], { style: 'body-sm', color: 'color/fg/subtle' }));
        add(item, h);
        add(item, await text(sc[2], { style: 'body-sm', color: 'color/fg/default', w: MSG_W - 48 }), { fillW: true });
        add(list, item, { fillW: true });
      }
      add(c, list, { fillW: true });
      var actions = box('Ações', { dir: 'H', gap: 'space/300', pad: ['space/100', 0, 0, 0] });
      add(actions, await inlineAction('Abrir no editor', 'arrow-right', true));
      add(actions, await inlineAction('Copiar roteiro', 'copy'));
      add(c, actions);
    }, { description: 'O resultado dentro da resposta: rótulo, título, ferramentas, itens com carimbo e ações inline.' });
    return P.card;
  }

  defineBlock({
    id: 'mensagens',
    page: 'Componentes',
    row: 'Padrões',
    order: 1,
    group: 'Padrões · Conversa',
    title: 'Mensagens e resultado',
    description: 'A pergunta é um balão sólido à direita, com o canto de quem fala. A resposta é texto de leitura, sem balão — e o que ela produz vira um cartão de resultado.',
    tags: ['Padrão', 'Claro · Escuro'],
    build: async function () {
      var msg = await messageSet();
      var card = await resultCard();
      return {
        sections: [
          { title: 'Mensagem', description: 'Pergunta normal e com erro; resposta pronta e escrevendo.', span: 2, node: function () { return labeledMatrix(msg, ['Normal', 'Erro ao enviar · escrevendo'], ['Pergunta', 'Resposta']); }, fill: false },
          { title: 'Cartão de resultado', description: 'Troque rótulo e título pelas propriedades.', node: card, fill: false },
          {
            title: 'Como escrever',
            description: 'Curto, direto, em português. A resposta diz o que fez e o que vem depois.',
            frame: true,
            node: async function () {
              var list = box('Regras', { dir: 'V', gap: 10 });
              var rules = [['check', 'Comece pelo resultado'], ['check', 'Uma ideia por parágrafo'], ['x', '“Claro! Ótima pergunta!”'], ['x', 'Desculpas antes da resposta']];
              for (var r of rules) {
                var row = box(r[1], { dir: 'H', gap: 10, cross: 'center' });
                add(row, icon(r[0], 16, r[0] === 'check' ? 'color/success/fg' : 'color/danger/fg'));
                add(row, await text(r[1], { style: 'body-sm', color: 'color/fg/default' }));
                add(list, row);
              }
              return list;
            },
          },
        ].concat(themed('Conversa', async function () {
          var thread = box('Conversa', { dir: 'V', gap: 'space/300', w: MSG_W });
          add(thread, instance(msg, { Autor: 'Usuário', Estado: 'Normal' }));
          var reply = box('Resposta', { dir: 'V', gap: 'space/100' });
          add(reply, instance(msg, { Autor: 'Assistente', Estado: 'Normal' }));
          add(reply, card.createInstance());
          add(thread, reply);
          return thread;
        }, { pad: 16 })),
      };
    },
  });

  /* ───────── Composer ───────── */

  var COMPOSER_W = 440;
  var COMPOSER_STATES = [
    ['Vazio', 'Pergunte algo ou digite / para comandos', 'color/fg/subtle', 'color/border/field', 'off', null],
    ['Digitando', 'Crie um roteiro de 3 cenas sobre o lançamento', 'color/fg/default', 'color/border/focus', 'on', '46/2000'],
    ['Com comando', 'sobre o lançamento da versão 0.4', 'color/fg/default', 'color/border/focus', 'on', null],
    ['Enviando', 'Pergunte algo ou digite / para comandos', 'color/fg/subtle', 'color/border/field', 'busy', null],
    ['Com anexo', 'Resuma este documento em 5 tópicos', 'color/fg/default', 'color/border/focus', 'on', null],
  ];

  /** Anexo (.ds-attachment): pílula com ícone do tipo, nome, peso e o × opcional. */
  async function attachmentSet() {
    if (P.attachment && !P.attachment.removed) return P.attachment;
    P.attachment = await variants('anexo', 'Anexo', ['Normal', 'Removível'].map(function (st) {
      return {
        props: { Estado: st },
        build: async function (c) {
          box(c.name, { dir: 'H', gap: 'space/100', pad: [0, st === 'Removível' ? 'space/075' : 'space/150', 0, 'space/100'], cross: 'center', h: 36, radius: 'radius/full', stroke: 'color/border/control' }, c);
          var ic = box('Tipo', { dir: 'H', align: 'center', cross: 'center', w: 24, h: 24, radius: 'radius/full', fill: 'color/bg/hover' });
          var kind = icon('file-text', 14, 'color/fg/muted');
          exposes(kind, 'mainComponent', 'Tipo de arquivo');
          add(ic, kind);
          add(c, ic);
          add(c, await text('roteiro.pdf', { style: 'label-sm', color: 'color/fg/default', prop: 'Arquivo', name: 'Arquivo', truncate: true }));
          add(c, await text('240 KB', { style: 'label-sm', weight: 'Regular', color: 'color/fg/subtle', prop: 'Peso', name: 'Peso' }));
          if (st === 'Removível') {
            var x = box('Remover', { dir: 'H', align: 'center', cross: 'center', w: 22, h: 22, radius: 'radius/full' });
            add(x, icon('x', 14, 'color/fg/subtle'));
            add(c, x);
          }
        },
      };
    }), {
      description: 'Arquivo enviado com a mensagem. Removível no composer, antes de enviar; o × tem nome acessível “Remover roteiro.pdf”.',
      columns: 2,
      gap: 16,
      props: {
        'Arquivo': ['TEXT', 'roteiro.pdf'],
        'Peso': ['TEXT', '240 KB'],
        'Tipo de arquivo': ['INSTANCE_SWAP', 'file-text', ['file-text', 'image', 'code', 'table', 'paperclip']],
      },
    });
    return P.attachment;
  }

  var SUGGESTIONS = [['list', 'Crie um roteiro de 3 cenas'], ['file-text', 'Resuma o que é o Lume'], ['palette', 'Por onde começo os tokens?']];

  /** Sugestões (.ds-suggestions): chips pequenos com ícone, na conversa vazia — clicar preenche o composer. */
  async function suggestions() {
    if (P.suggestions && !P.suggestions.removed) return P.suggestions;
    var chips = LUME.lib.chipSet ? await LUME.lib.chipSet() : null;
    P.suggestions = await component('sugestoes', 'Sugestões', async function (c) {
      box(c.name, { dir: 'H', wrap: true, gap: 'space/100', rowGap: 'space/100', w: COMPOSER_W }, c);
      for (var sg of SUGGESTIONS) {
        if (chips) add(c, instance(chips, { Tipo: 'Filtro', Tamanho: 'P', Estado: 'Normal' }, { 'Rótulo': sg[1], 'Ícone': true, 'Trocar ícone': sg[0] }));
      }
    }, { description: 'Pontos de partida na conversa vazia. Chips pequenos com ícone; clicar preenche o composer.' });
    return P.suggestions;
  }

  async function sendButton(mode) {
    var bg = mode === 'busy' ? 'color/fg/default' : mode === 'on' ? 'color/brand/solid' : 'color/bg/muted';
    var b = box('Enviar', { dir: 'H', align: 'center', cross: 'center', w: 36, h: 36, radius: 'radius/full', fill: bg });
    if (mode === 'busy') add(b, shape('Parar', { w: 12, h: 12, fill: 'color/bg/canvas', radius: 3 }));
    else add(b, icon('arrow-up', 18, mode === 'on' ? 'color/brand/on-solid' : 'color/fg/disabled'));
    return b;
  }

  async function composerSet() {
    if (P.composer && !P.composer.removed) return P.composer;
    var attachment = await attachmentSet();
    P.composer = await variants('composer', 'Composer', COMPOSER_STATES.map(function (st) {
      return {
        props: { Estado: st[0] },
        build: async function (c) {
          box(c.name, { dir: 'V', gap: 'space/100', pad: ['space/150', 'space/150', 'space/100', 'space/200'], w: COMPOSER_W, fill: 'color/bg/raised', stroke: st[3], radius: 'radius/2xl' }, c);
          if (st[0] === 'Com comando') {
            var tokens = box('Comando', { dir: 'H', gap: 'space/075', pad: [0, 'space/050', 0, 'space/100'], cross: 'center', h: 30, radius: 'radius/full', fill: 'color/brand/subtle', stroke: 'color/brand/border' });
            add(tokens, await text('/roteiro', { style: 'label-sm', weight: 'Semi Bold', color: 'color/brand/fg', prop: 'Comando', name: 'Comando' }));
            add(tokens, icon('x', 14, 'color/brand/fg'));
            add(c, tokens);
          }
          if (st[0] === 'Com anexo') {
            var files = box('Anexos', { dir: 'H', wrap: true, gap: 'space/075', rowGap: 'space/075' });
            add(files, instance(attachment, { Estado: 'Removível' }));
            add(c, files, { fillW: true });
          }
          var input = box('Campo', { dir: 'H', pad: [2, 0] });
          var propName = st[0] === 'Digitando' ? 'Texto' : st[0] === 'Vazio' || st[0] === 'Enviando' ? 'Placeholder' : null;
          add(input, await text(st[1], { style: 'body-md', color: st[2], w: COMPOSER_W - 28, prop: propName || undefined, name: propName || 'Texto' }), { fillW: true });
          add(c, input, { fillW: true });
          var bar = box('Barra', { dir: 'H', gap: 2, cross: 'center' });
          add(bar, iconButton('paperclip', 32));
          add(bar, iconButton('slash', 32));
          add(bar, box('Espaço', { dir: 'H', h: 1 }), { grow: true });
          if (st[5]) {
            var count = box('Contagem', { dir: 'H', pad: [0, 'space/150', 0, 0] });
            add(count, await text(st[5], { style: 'caption', color: 'color/fg/subtle' }));
            add(bar, count);
          }
          add(bar, await sendButton(st[4]));
          add(c, bar, { fillW: true });
        },
      };
    }), {
      description: 'A caixa cresce com o texto, aceita anexos e comandos com “/”. Enviar é o único ponto de cor — e vira “parar” enquanto a resposta chega.',
      columns: 2,
      gap: 24,
      rowGap: 24,
      props: { 'Placeholder': ['TEXT', 'Pergunte algo ou digite / para comandos'], 'Texto': ['TEXT', 'Crie um roteiro de 3 cenas sobre o lançamento'], 'Comando': ['TEXT', '/roteiro'] },
    });
    return P.composer;
  }

  async function hint() {
    var h = box('Dica', { dir: 'H', gap: 'space/100', align: 'center', cross: 'center' });
    add(h, await text('Enter envia · Shift + Enter quebra linha', { style: 'caption', color: 'color/fg/subtle' }));
    return h;
  }

  defineBlock({
    id: 'composer',
    page: 'Componentes',
    row: 'Padrões',
    order: 2,
    group: 'Padrões · Conversa',
    title: 'Composer',
    description: 'A caixa de mensagem: vazia, digitando, com um comando, com anexo e enviando. Contorno de campo (3:1) em repouso, anel de foco ao digitar. Na conversa vazia, sugestões para começar.',
    tags: ['Padrão', 'Claro · Escuro'],
    build: async function () {
      var set = await composerSet();
      var attachment = await attachmentSet();
      var sugg = await suggestions();
      return {
        sections: [
          { title: 'Estados', description: 'Vazio, digitando (com contagem perto do limite), com comando, enviando e com anexo.', span: 2, node: set },
          { title: 'Anexo', description: 'Normal na mensagem enviada; removível no composer. Troque o tipo em “Tipo de arquivo”.', node: attachment },
          { title: 'Sugestões', description: 'Na conversa vazia, acima do composer. Até 3, curtas e úteis.', node: sugg, fill: false },
        ].concat(themed('Composer', async function () {
          var wrap = box('Composer com dica', { dir: 'V', gap: 'space/100' });
          add(wrap, instance(set, { Estado: 'Digitando' }), { fillW: false });
          add(wrap, await hint(), { fillW: true });
          return wrap;
        }, { pad: 16 })),
      };
    },
  });

  /* ───────── App shell em miniatura ───────── */

  async function navItem(label, iconName, active, dot) {
    var it = box(label, { dir: 'H', gap: 12, pad: [0, 12], cross: 'center', h: 36, radius: 'radius/md', fill: active ? 'color/bg/selected' : null, stroke: active ? 'color/border/subtle' : null });
    add(it, icon(iconName, 18, active ? 'color/fg/default' : 'color/fg/muted'));
    add(it, await text(label, { style: 'label-md', color: active ? 'color/fg/default' : 'color/fg/muted' }), { grow: true });
    if (dot) add(it, shape('Novidade', { ellipse: true, w: 6, h: 6, fill: 'color/brand/indicator' }));
    return it;
  }

  async function miniShell() {
    if (P.shell && !P.shell.removed) return P.shell;
    P.shell = await component('app-shell-mini', 'App shell/Miniatura', async function (c) {
      box(c.name, { dir: 'H', gap: 'space/100', pad: 'space/100', w: 940, h: 520, fill: 'color/bg/app', radius: 'radius/3xl' }, c);

      // sidebar flutuante
      var side = box('Sidebar', { dir: 'V', gap: 'space/100', pad: [0, 12, 12, 12], w: 232, fill: 'color/bg/sidebar', stroke: 'color/border/subtle', radius: 'radius/2xl', clip: true });
      var head = box('Cabeçalho', { dir: 'H', align: 'between', cross: 'center', h: 64, pad: [0, 4] });
      // logotipo: a chama e o nome, como a .ds-brand do site (chama de 24 px para texto de 28 → 18 para 21)
      var brand = box('Marca', { dir: 'H', gap: 'space/150', cross: 'center' });
      add(brand, flame(18));
      add(brand, await text('Lume', { style: 'heading-md', weight: 'Bold', color: 'color/fg/default' }));
      add(head, brand);
      // sem botão no cabeçalho: aberta, quem recolhe é a aba na borda, que só aparece com o mouse
      add(side, head, { fillW: true });
      var search = box('Busca', { dir: 'H', gap: 10, pad: [0, 12], cross: 'center', h: 40, radius: 'radius/md', stroke: 'color/border/control' });
      add(search, icon('search', 16, 'color/fg/subtle'));
      add(search, await text('Buscar no Lume', { style: 'body-sm', color: 'color/fg/subtle' }), { grow: true });
      var kbd = box('Atalho', { dir: 'H', pad: [1, 6], radius: 'radius/xs', stroke: 'color/border/default' });
      add(kbd, await text('⌘K', { style: 'caption', color: 'color/fg/subtle' }));
      add(search, kbd);
      add(side, search, { fillW: true });
      var nav = box('Navegação', { dir: 'V', gap: 2, pad: [8, 0, 0, 0] });
      add(nav, await navItem('Início', 'home', true), { fillW: true });
      add(nav, await navItem('Primeiros passos', 'zap'), { fillW: true });
      add(nav, await navItem('Novidades', 'megaphone', false, true), { fillW: true });
      var groupLabel = box('Grupo', { dir: 'H', pad: [14, 12, 6, 12] });
      add(groupLabel, await text('Fundamentos', { style: 'label-sm', color: 'color/fg/default' }));
      add(nav, groupLabel, { fillW: true });
      add(nav, await navItem('Cores', 'palette'), { fillW: true });
      add(nav, await navItem('Tipografia', 'type'), { fillW: true });
      add(nav, await navItem('Ícones', 'shapes'), { fillW: true });
      add(side, nav, { fillW: true });
      add(side, box('Espaço', { dir: 'V', w: 1 }), { grow: true });
      var account = box('Conta', { dir: 'H', gap: 10, pad: [0, 12, 0, 10], cross: 'center', h: 56, radius: 'radius/lg', fill: 'color/bg/muted', stroke: 'color/border/subtle' });
      var badge = box('Ícone', { dir: 'H', align: 'center', cross: 'center', w: 32, h: 32, radius: 'radius/full', stroke: 'color/border/default' });
      add(badge, icon('package', 16, 'color/fg/muted'));
      add(account, badge);
      var acc = box('Versão', { dir: 'V', gap: 0 });
      add(acc, await text('Lume ' + META.version.replace(/\.0$/, ''), { style: 'heading-xs', color: 'color/fg/default' }));
      add(acc, await text('Ver o que há de novo', { style: 'caption', color: 'color/fg/subtle', w: 110, truncate: true }), { fillW: true });
      add(account, acc, { grow: true });
      add(account, icon('chevron-right', 16, 'color/fg/subtle'));
      add(side, account, { fillW: true });
      add(c, side, { fillH: true });

      // painel principal
      var main = box('Painel principal', { dir: 'V', gap: 0, fill: 'color/bg/canvas', stroke: 'color/border/subtle', radius: 'radius/2xl', clip: true });
      var top = box('Topbar', { dir: 'H', gap: 'space/150', pad: [0, 16, 0, 24], cross: 'center', h: 56 });
      var crumbs = box('Trilha', { dir: 'H', gap: 6, cross: 'center' });
      add(crumbs, await text('Início', { style: 'label-sm', color: 'color/fg/muted' }));
      add(crumbs, icon('chevron-right', 14, 'color/fg/subtle'));
      add(crumbs, await text('Fundamentos', { style: 'label-sm', color: 'color/fg/muted' }));
      add(crumbs, icon('chevron-right', 14, 'color/fg/subtle'));
      add(crumbs, await text('Cores', { style: 'label-sm', color: 'color/fg/default' }));
      add(top, crumbs);
      add(top, box('Espaço', { dir: 'H', h: 1 }), { grow: true });
      var seg = box('Tema', { dir: 'H', gap: 2, pad: 3, radius: 'radius/full', fill: 'color/bg/sunken', stroke: 'color/border/subtle' });
      [['moon', true], ['sun', false], ['monitor', false]].forEach(function (o) {
        var item = box('Tema · ' + o[0], { dir: 'H', align: 'center', cross: 'center', w: 28, h: 28, radius: 'radius/full', fill: o[1] ? 'color/bg/muted' : null });
        add(item, icon(o[0], 16, o[1] ? 'color/fg/default' : 'color/fg/subtle'));
        add(seg, item);
      });
      add(top, seg);
      add(main, top, { fillW: true });
      var content = box('Conteúdo', { dir: 'V', gap: 'space/150', pad: [24, 40, 32, 40] });
      add(content, await text('Fundamentos', { style: 'eyebrow', color: 'color/fg/subtle' }));
      add(content, await text('Cores', { style: 'heading-xl', color: 'color/fg/default' }));
      add(content, await text('Paletas em OKLCH, tokens semânticos e temas escuro e claro. Os componentes só consomem tokens.', { style: 'body-md', color: 'color/fg/muted', w: 520 }));
      var cards = box('Cartões', { dir: 'H', gap: 12, pad: [12, 0, 0, 0] });
      var groups = [['Marca', ['color/brand/subtle', 'color/brand/solid', 'color/brand/fg']], ['Status', ['color/success/solid', 'color/warning/solid', 'color/danger/solid']], ['Gráficos', ['color/chart/series/1', 'color/chart/series/2', 'color/chart/series/3']]];
      for (var g of groups) {
        var card = box(g[0], { dir: 'V', gap: 12, pad: 16, w: 192, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
        var strip = box('Amostras', { dir: 'H', gap: 4 });
        g[1].forEach(function (v) { add(strip, shape('Amostra', { w: 32, h: 24, fill: v, radius: 'radius/xs' })); });
        add(card, strip);
        add(card, await text(g[0], { style: 'label-md', color: 'color/fg/default' }));
        add(cards, card);
      }
      add(content, cards);
      add(main, content, { fillW: true });
      add(c, main, { grow: true, fillH: true });
    }, { description: 'Sidebar flutuante com marca, busca, navegação e cartão da versão; painel principal com topbar (trilha e tema) e conteúdo.' });
    return P.shell;
  }

  defineBlock({
    id: 'app-shell',
    page: 'Componentes',
    row: 'Padrões',
    order: 3,
    group: 'Padrões',
    title: 'App shell',
    description: 'A moldura de toda tela, em miniatura: sidebar flutuante, painel principal e topbar. Camadas por superfície — app, sidebar e canvas —, sem sombra pesada nem degradê.',
    tags: ['Padrão', 'Claro · Escuro'],
    build: async function () {
      var shell = await miniShell();
      return {
        sections: themed('App shell', function () { return shell.createInstance(); }, { pad: 24 }).map(function (s) { return Object.assign(s, { span: 2 }); }),
      };
    },
  });
})();
