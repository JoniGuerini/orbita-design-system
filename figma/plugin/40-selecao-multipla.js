/**
 * Bloco modelo: Seleção múltipla com busca — opção, menu, gatilho e os dois modos.
 */

/** Caixa de marcação (o mesmo desenho do .ds-checkbox), usada dentro das opções. */
async function checkBox(checked) {
  var b = box('Caixa', { dir: 'H', align: 'center', cross: 'center', w: 18, h: 18, radius: 'radius/xs' });
  if (checked) {
    fill(b, 'color/brand/solid');
    add(b, icon('check', 14, 'color/brand/on-solid'));
  } else stroke(b, 'color/fg/subtle', 1.5);
  return b;
}

var MS = {};

async function msOptionSet() {
  if (MS.option && !MS.option.removed) return MS.option;
  var items = [];
  [['Não', false], ['Sim', true]].forEach(function (m) {
    ['Normal', 'Hover'].forEach(function (state) {
      items.push({
        props: { Marcada: m[0], Estado: state },
        build: async function (c) {
          box(c.name, { dir: 'H', gap: 'space/150', pad: [0, 'space/150'], cross: 'center', w: 196, h: 36, radius: 10 }, c);
          if (state === 'Hover') fill(c, 'color/bg/hover');
          add(c, await checkBox(m[1]));
          var t = await text('Pagamentos', { style: 'label-md', color: m[1] || state === 'Hover' ? 'color/fg/default' : 'color/fg/muted', prop: 'Rótulo', name: 'Rótulo' });
          add(c, t, { grow: true });
        },
      });
    });
  });
  MS.option = await variants('ms-opcao', 'Seleção/Opção', items, {
    description: 'Opção da lista com caixa de marcação. Marcar não fecha o menu.',
    columns: 2,
    gap: 16,
    props: { 'Rótulo': ['TEXT', 'Pagamentos'] },
  });
  return MS.option;
}

var MS_OPTIONS = [['Cartões', true], ['Atendimento', true], ['Dados', false], ['Prevenção a fraudes', false], ['Onboarding', false], ['Pagamentos', true]];

/** Campo de busca do topo do menu. */
async function msSearch(placeholder) {
  var f = box('Busca', { dir: 'H', gap: 'space/100', pad: [0, 'space/150'], cross: 'center', h: 36, radius: 10, fill: 'color/bg/sunken' });
  add(f, icon('search', 16, 'color/fg/subtle'));
  add(f, await text(placeholder || 'Buscar times…', { style: 'body-sm', color: 'color/fg/subtle' }));
  return f;
}

async function msMenu() {
  if (MS.menu && !MS.menu.removed) return MS.menu;
  var option = await msOptionSet();
  MS.menu = await component('ms-menu', 'Seleção/Menu múltiplo', async function (c) {
    box(c.name, { dir: 'V', gap: 2, pad: 6, w: 280, fill: 'color/bg/raised', stroke: 'color/border/strong', radius: 'radius/lg' }, c);
    shadow(c, 'md');
    add(c, await msSearch(), { fillW: true });
    var list = box('Opções', { dir: 'V', gap: 0, pad: [4, 0, 0, 0] });
    add(c, list, { fillW: true });
    MS_OPTIONS.forEach(function (o) {
      var inst = instance(option, { Marcada: o[1] ? 'Sim' : 'Não', Estado: 'Normal' }, { 'Rótulo': o[0] });
      add(list, inst, { fillW: true });
    });
  }, { description: 'Menu com busca no topo e opções marcáveis. Os marcados viram a contagem no gatilho.' });
  return MS.menu;
}

var MS_TRIGGERS = [
  ['Vazio', 'Escolha os times', false, 'color/border/field'],
  ['Aberto', '3 times', true, 'color/border/focus'],
  ['Preenchido', '3 times', false, 'color/border/field'],
  ['Desativado', 'Escolha os times', false, 'color/border/field'],
];

async function msTriggerSet() {
  if (MS.trigger && !MS.trigger.removed) return MS.trigger;
  var items = MS_TRIGGERS.map(function (t) {
    return {
      props: { Estado: t[0] },
      build: async function (c) {
        box(c.name, { dir: 'H', gap: 10, pad: [0, 11, 0, 13], cross: 'center', w: 280, h: 40, radius: 'radius/md' }, c);
        num(c, 'height', 'size/control/md');
        stroke(c, t[3], 1);
        if (t[0] === 'Desativado') num(c, 'opacity', 'opacity/disabled');
        var placeholder = t[0] === 'Vazio' || t[0] === 'Desativado';
        // sem propriedade de texto: cada estado tem o seu texto (uma propriedade mostraria o mesmo em todos)
        add(c, await text(t[1], { style: 'body-sm', color: placeholder ? 'color/fg/subtle' : 'color/fg/default', name: 'Valor' }), { grow: true });
        add(c, icon(t[2] ? 'chevron-up' : 'chevron-down', 16, 'color/fg/subtle'));
      },
    };
  });
  MS.trigger = await variants('ms-gatilho', 'Seleção/Gatilho múltiplo', items, {
    description: 'Mostra quantos itens estão marcados. Aberto ganha o anel de foco.',
    columns: 2,
    gap: 16,
  });
  return MS.trigger;
}

/** Rótulo + gatilho + menu aberto, como aparece na tela. */
async function msExample() {
  var trigger = await msTriggerSet();
  var menu = await msMenu();
  var field = box('Campo', { dir: 'V', gap: 8, w: 280 });
  add(field, await text('Times', { style: 'label-md', color: 'color/fg/default' }));
  add(field, instance(trigger, { Estado: 'Aberto' }), { fillW: true });
  add(field, menu.createInstance(), { fillW: true });
  return field;
}

defineBlock({
  id: 'selecao-multipla',
  page: 'Componentes',
  row: 'Formulário',
  order: 3,
  group: 'Seleção',
  title: 'Seleção múltipla com busca',
  description: 'Um campo que aceita várias opções, com busca e caixas de marcação no menu. Marcar não fecha a lista; o campo mostra a contagem.',
  build: async function () {
    var option = await msOptionSet();
    var menu = await msMenu();
    var trigger = await msTriggerSet();
    return {
      sections: [
        { title: 'Opção', description: 'Marcar não fecha o menu.', node: option },
        { title: 'Menu', description: 'Os escolhidos viram a contagem no campo.', node: menu, fill: false },
        { title: 'Gatilho', description: 'Vazio, aberto, preenchido e desativado.', node: trigger, span: 2 },
      ].concat(themed('Seleção múltipla', msExample, { cross: 'start' })),
    };
  },
});
