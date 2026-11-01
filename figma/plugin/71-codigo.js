/**
 * Código: o bloco (.ds-code, .ds-code--sm) e o código dentro do texto (.ds-inline-code).
 * Fundo rebaixado, mono de 14 ou 12 px; comentário em fg/subtle e destaque em fg/brand — nada de arco-íris.
 */
(function () {
  // cada linha é uma lista de trechos: [texto, tipo] — 'c' comentário, 'a' destaque, '' normal
  var SAMPLE = [
    [['/* use sempre os tokens semânticos */', 'c']],
    [['.cartao {', '']],
    [['  padding: ', ''], ['var(--ds-space-300)', 'a'], [';', '']],
    [['  background: ', ''], ['var(--ds-color-bg-surface)', 'a'], [';', '']],
    [['  border-radius: ', ''], ['var(--ds-radius-xl)', 'a'], [';', '']],
    [['}', '']],
  ];
  var SAMPLE_SM = [
    [['import ', ''], ['{ icon }', 'a'], [" from './ds/icons/icons.js';", '']],
    [["icon('search', { size: 16 });", '']],
  ];
  var KIND = { c: 'color/fg/subtle', a: 'color/fg/brand', '': 'color/fg/default' };

  async function codeLines(lines, style) {
    var col = box('Linhas', { dir: 'V', gap: 0 });
    for (var line of lines) {
      var row = box('Linha', { dir: 'H', gap: 0 });
      // só o comentário se traduz; o resto é código
      for (var part of line) add(row, await text(part[0], { style: style, color: KIND[part[1]], name: part[1] === 'c' ? 'Comentário' : part[1] === 'a' ? 'Destaque' : 'Código', raw: part[1] !== 'c' }));
      add(col, row);
    }
    return col;
  }

  var CODE = {};

  async function codeSet() {
    if (CODE.set && !CODE.set.removed) return CODE.set;
    CODE.set = await variants('codigo', 'Código', [
      {
        props: { Tipo: 'Bloco' },
        build: async function (c) {
          box(c.name, { dir: 'V', pad: ['space/200', 'space/250'], w: 400, radius: 'radius/lg', fill: 'color/bg/sunken', stroke: 'color/border/subtle', clip: true }, c);
          add(c, await codeLines(SAMPLE, 'code-md'));
        },
      },
      {
        props: { Tipo: 'Bloco pequeno' },
        build: async function (c) {
          box(c.name, { dir: 'V', pad: ['space/150', 'space/200'], w: 400, radius: 'radius/md', fill: 'color/bg/sunken', stroke: 'color/border/subtle', clip: true }, c);
          add(c, await codeLines(SAMPLE_SM, 'code-sm'));
        },
      },
      {
        props: { Tipo: 'Inline' },
        build: async function (c) {
          box(c.name, { dir: 'H', pad: [1, 6], cross: 'center', radius: 'radius/xs', fill: 'color/bg/hover' }, c);
          add(c, await text('tabular-nums', { style: 'code-sm', color: 'color/fg/default', prop: 'Código', name: 'Código' }));
        },
      },
    ], {
      description: 'Bloco de 14 px, pequeno de 12 px e o código dentro do texto. Comentário apagado; o que importa ganha o tom da marca.',
      columns: 1,
      gap: 24,
      rowGap: 24,
      props: { 'Código': ['TEXT', 'tabular-nums'] },
    });
    return CODE.set;
  }

  defineBlock({
    id: 'codigo',
    page: 'Componentes',
    row: 'Dados e conteúdo',
    order: 5,
    group: 'Dados e conteúdo',
    title: 'Código',
    description: 'Para mostrar código na documentação e nas telas: o bloco sobre o fundo rebaixado e o trecho curto no meio do texto. Mono, sem colorir cada palavra.',
    build: async function () {
      var set = await codeSet();
      return {
        sections: [
          { title: 'Tipos', description: 'Bloco (14 px), bloco pequeno (12 px) e inline. O bloco rola na horizontal em vez de quebrar a linha.', node: set, fill: false },
          {
            title: 'No meio do texto',
            description: 'O inline tem fundo de hover e cantos de 6 px — troque o texto pela propriedade “Código”.',
            frame: true,
            node: async function () {
              var p = box('Parágrafo', { dir: 'H', wrap: true, gap: 4, rowGap: 6, cross: 'center', w: 380 });
              add(p, await text('Guarde', { style: 'body-sm', color: 'color/fg/muted' }));
              add(p, instance(set, { Tipo: 'Inline' }, { 'Código': 'tabular-nums' }));
              add(p, await text('para colunas que precisam alinhar e', { style: 'body-sm', color: 'color/fg/muted' }));
              add(p, instance(set, { Tipo: 'Inline' }, { 'Código': 'href' }));
              add(p, await text('para indicadores que levam a um detalhe.', { style: 'body-sm', color: 'color/fg/muted' }));
              return p;
            },
          },
        ].concat(themed('Código', function () { return instance(set, { Tipo: 'Bloco' }); }, { pad: 24 })),
      };
    },
  });
})();
