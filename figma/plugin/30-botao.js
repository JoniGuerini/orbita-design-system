/**
 * Bloco modelo: Botão. Use como referência para os outros componentes —
 * variants() para o conjunto, propriedades de texto/booleano/troca, instance() nos exemplos e themed() no fim.
 */

var BTN_VARIANTS = [
  ['Primário', { bg: 'color/brand/solid', hover: 'color/brand/solid-hover', pressed: 'color/brand/solid-pressed', fg: 'color/brand/on-solid' }],
  ['Secundário', { bg: null, hover: 'color/bg/hover', pressed: 'color/bg/pressed', fg: 'color/fg/default', border: 'color/border/control', borderHover: 'color/border/strong' }],
  ['Ghost', { bg: null, hover: 'color/bg/hover', pressed: 'color/bg/pressed', fg: 'color/fg/default' }],
  ['Sutil', { bg: 'color/bg/muted', hover: 'color/bg/muted', pressed: 'color/bg/pressed', fg: 'color/fg/default' }],
  ['Perigo', { bg: 'color/danger/solid', hover: 'color/danger/solid-hover', pressed: 'color/danger/solid-hover', fg: 'color/danger/on-solid' }],
];

var BTN_SIZES = [
  ['P', { h: 'size/control/sm', px: 'space/150', gap: 'space/075', radius: 'radius/sm', text: 'label-sm', icon: 16 }],
  ['M', { h: 'size/control/md', px: 'space/200', gap: 'space/100', radius: 'radius/md', text: 'label-md', icon: 18 }],
  ['G', { h: 'size/control/lg', px: 'space/250', gap: 'space/100', radius: 'radius/md', text: 'label-lg', icon: 20 }],
];

var BTN_STATES = ['Normal', 'Hover', 'Pressionado', 'Foco', 'Desativado'];

/** Desenha um botão dentro do componente (variante). */
async function buildButton(c, v, s, state) {
  box(c.name, { dir: 'H', gap: s.gap, pad: [0, s.px], cross: 'center', align: 'center', radius: s.radius, h: 40 }, c);
  num(c, 'height', s.h);
  var bg = state === 'Hover' ? v.hover : state === 'Pressionado' ? v.pressed : v.bg;
  fill(c, bg);
  if (v.border) stroke(c, state === 'Hover' ? v.borderHover : v.border, 1);
  if (state === 'Foco') {
    stroke(c, 'color/border/focus', 'focus-ring/width', { align: 'OUTSIDE' });
  }
  if (state === 'Desativado') num(c, 'opacity', 'opacity/disabled');
  var ic = icon('plus', s.icon, v.fg);
  exposes(ic, 'visible', 'Ícone');
  exposes(ic, 'mainComponent', 'Trocar ícone');
  add(c, ic);
  add(c, await text('Botão', { style: s.text, color: v.fg, prop: 'Rótulo', name: 'Rótulo' }));
}

var BUTTON_SET = null;

async function buttonSet() {
  if (BUTTON_SET && !BUTTON_SET.removed) return BUTTON_SET;
  var items = [];
  BTN_VARIANTS.forEach(function (v) {
    BTN_SIZES.forEach(function (s) {
      BTN_STATES.forEach(function (state) {
        items.push({ props: { Variante: v[0], Tamanho: s[0], Estado: state }, build: function (c) { return buildButton(c, v[1], s[1], state); } });
      });
    });
  });
  BUTTON_SET = await variants('botao', 'Botão', items, {
    description: 'Dispara uma ação. Primário para a ação principal (uma por tela); Perigo só com confirmação.',
    columns: 5,
    props: {
      'Rótulo': ['TEXT', 'Botão'],
      'Ícone': ['BOOLEAN', false],
      'Trocar ícone': ['INSTANCE_SWAP', 'plus', ['plus', 'pencil', 'check', 'download', 'upload', 'arrow-right', 'search', 'trash', 'copy', 'send']],
    },
  });
  return BUTTON_SET;
}

defineBlock({
  id: 'botao',
  page: 'Componentes',
  row: 'Ações',
  order: 1,
  group: 'Ações',
  title: 'Botão',
  description: 'Dispara uma ação. A cor fica para a ação principal; o resto se apoia em contorno e transparência. Rótulo, ícone e troca de ícone são propriedades.',
  build: async function () {
    var set = await buttonSet();
    return {
      sections: [
        {
          title: 'Variantes, tamanhos e estados',
          description: '5 variantes × 3 tamanhos × 5 estados. Foco e desativado também são variantes, para documentar e testar.',
          span: 2,
          fill: false,
          node: function () {
            var rows = [];
            BTN_VARIANTS.forEach(function (v) { BTN_SIZES.forEach(function (sz) { rows.push(v[0] + ' · ' + sz[0]); }); });
            return labeledMatrix(set, BTN_STATES, rows);
          },
        },
        {
          title: 'Com ícone',
          description: 'Ligue “Ícone” e escolha em “Trocar ícone”.',
          frame: true,
          cross: 'start',
          node: function () {
            var row = box('Exemplos', { dir: 'H', gap: 12, wrap: true, rowGap: 12 });
            add(row, instance(set, { Variante: 'Primário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Criar projeto', 'Ícone': true, 'Trocar ícone': 'plus' }));
            add(row, instance(set, { Variante: 'Secundário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Exportar', 'Ícone': true, 'Trocar ícone': 'download' }));
            add(row, instance(set, { Variante: 'Ghost', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Editar', 'Ícone': true, 'Trocar ícone': 'pencil' }));
            return row;
          },
        },
        {
          title: 'Hierarquia',
          description: 'Uma ação principal; a secundária ao lado; a destrutiva separada.',
          frame: true,
          node: function () {
            var row = box('Ações do diálogo', { dir: 'H', gap: 12, cross: 'center' });
            add(row, instance(set, { Variante: 'Perigo', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Excluir' }));
            var spacer = box('Espaço', { dir: 'H', w: 24, h: 1 });
            add(row, spacer);
            add(row, instance(set, { Variante: 'Secundário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Cancelar' }));
            add(row, instance(set, { Variante: 'Primário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Salvar' }));
            return row;
          },
        },
      ].concat(themed('Botões', async function () {
        var card = box('Cartão', { dir: 'V', gap: 20, pad: 24, fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/xl' });
        add(card, await text('Publicar a versão 0.4', { style: 'heading-sm' }));
        add(card, await text('Todo mundo do time recebe o aviso. Dá para desfazer em até 10 minutos.', { style: 'body-sm', color: 'color/fg/muted', w: 360 }));
        var actions = box('Ações', { dir: 'H', gap: 10 });
        add(actions, instance(set, { Variante: 'Secundário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Agora não' }));
        add(actions, instance(set, { Variante: 'Primário', Tamanho: 'M', Estado: 'Normal' }, { 'Rótulo': 'Publicar', 'Ícone': true, 'Trocar ícone': 'send' }));
        add(card, actions);
        return card;
      })),
    };
  },
});
