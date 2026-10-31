/**
 * Página Fundamentos: cores (por papel, nos dois modos), tipografia, espaçamento, raios e sombras.
 * Movimento e layout ficam em 11-movimento-layout.js.
 */

var COLOR_GROUPS = [
  ['Fundos', 'Do fundo do app ao painel elevado — e as camadas de hover e seleção.', 'color/bg/'],
  ['Texto', 'Do mais forte ao mais apagado. Todos passam de 4,5:1 nas superfícies.', 'color/fg/'],
  ['Bordas', 'Contornos finos; border/field é o dos campos e passa de 3:1.', 'color/border/'],
  ['Marca', 'O pêssego: ação principal, destaque e o indicador de novidade.', 'color/brand/'],
  ['Status', 'Sucesso, atenção, perigo e informação — sempre com ícone e texto.', ['color/success/', 'color/warning/', 'color/danger/', 'color/info/']],
  ['Gráficos · séries', 'As 8 séries em ordem fixa, validadas para daltonismo.', 'color/chart/series/'],
  ['Gráficos · escalas', 'Sequencial (um tom, mais = mais forte), ordinal (etapas em ordem) e divergente (dois polos com o meio neutro).', ['color/chart/seq/', 'color/chart/ord/', 'color/chart/div/']],
  ['Gráficos · apoio', 'Status de medidores, o tom de contexto, “Outros”, a grade e o eixo.', ['color/chart/status/', 'color/chart/muted', 'color/chart/other', 'color/chart/grid', 'color/chart/axis']],
];

function semanticNames(prefix) {
  var list = [];
  DATA.collections.forEach(function (c) {
    if (c.name !== 'Semânticos') return;
    c.variables.forEach(function (v) {
      [].concat(prefix).forEach(function (p) { if (v.name.indexOf(p) === 0) list.push(v.name); });
    });
  });
  return list;
}

async function swatch(name) {
  var cell = box(name, { dir: 'V', gap: 8, w: 132 });
  var chip = shape('Amostra', { w: 132, h: 56, fill: name, radius: 'radius/md', stroke: 'color/border/subtle' });
  add(cell, chip);
  add(cell, await text(name.replace('color/', ''), { style: 'label-sm', color: 'color/fg/default', w: 132 }));
  return cell;
}

defineBlock({
  id: 'cores',
  page: 'Fundamentos',
  row: 'Fundamentos',
  order: 1,
  group: 'Fundamentos',
  title: 'Cores',
  description: 'Tokens semânticos: é isso que os componentes usam. Cada um aponta para uma primitiva diferente no modo Escuro e no Claro — troque o modo do frame e tudo acompanha.',
  tags: ['Variáveis', 'Claro · Escuro'],
  build: async function () {
    var sections = [];
    for (var g of COLOR_GROUPS) {
      var names = semanticNames(g[2]);
      sections.push({
        title: g[0],
        description: g[1],
        span: 2,
        node: async function (w) {
          var pair = box('Claro e Escuro', { dir: 'H', gap: 24, w: w });
          for (var mode of ['Claro', 'Escuro']) {
            var stage = box('Modo ' + mode, { dir: 'H', wrap: true, gap: 16, rowGap: 20, pad: 24, fill: 'color/bg/canvas', stroke: 'color/border/subtle', radius: 24 });
            setMode(stage, mode);
            for (var n of this.names) add(stage, await swatch(n));
            add(pair, stage, { grow: true });
            stage.layoutSizingHorizontal = 'FILL';
          }
          return pair;
        }.bind({ names: names }),
      });
    }
    return { sections: sections };
  },
});

defineBlock({
  id: 'tipografia',
  page: 'Fundamentos',
  row: 'Fundamentos',
  order: 2,
  group: 'Fundamentos',
  title: 'Tipografia',
  description: 'Inter Tight para títulos, Inter para leitura e JetBrains Mono para código. Cada linha é um estilo de texto do Figma com o mesmo nome do token.',
  tags: ['Estilos de texto'],
  build: async function () {
    return {
      sections: [{
        title: 'Estilos',
        description: 'Tamanho e entrelinha em px; o tracking vai em %.',
        span: 2,
        node: async function (w) {
          var list = box('Estilos', { dir: 'V', gap: 0, w: w });
          for (var s of DATA.textStyles) {
            var row = box(s.name, { dir: 'H', gap: 32, pad: [18, 0], cross: 'center' });
            stroke(row, 'color/border/subtle', 0);
            row.strokeBottomWeight = 1;
            var meta = box('Especificação', { dir: 'V', gap: 2, w: 220 });
            add(meta, await text(s.name.replace('text/', ''), { style: 'label-md', color: 'color/fg/default' }));
            add(meta, await text(s.fontFamily + ' · ' + s.fontStyle + ' · ' + s.fontSize + '/' + s.lineHeight, { style: 'caption', color: 'color/fg/subtle' }));
            add(row, meta);
            // a amostra quebra linha no espaço que sobra: nos tamanhos de display ela não cabe numa linha só
            var sample = await text(s.fontSize >= 26 ? 'Vamos construir com refinamento' : 'Um design system plano, calmo e preciso.', { style: s.name.replace('text/', ''), color: 'color/fg/default', w: w - 220 - 32 });
            add(row, sample, { grow: true });
            add(list, row, { fillW: true });
          }
          return list;
        },
      }],
    };
  },
});

defineBlock({
  id: 'espacos',
  page: 'Fundamentos',
  row: 'Fundamentos',
  order: 3,
  group: 'Fundamentos',
  title: 'Espaço, raio e sombra',
  description: 'Escala de 4 em 4 px para o ritmo, cantos do sutil à pílula e sombras para separar camadas. Medidas ligadas às variáveis de Dimensões.',
  tags: ['Variáveis', 'Estilos de efeito'],
  build: async function () {
    var dims = DATA.collections.find(function (c) { return c.name === 'Dimensões'; }).variables;
    var spaces = dims.filter(function (v) { return v.name.indexOf('space/') === 0 && v.values['Valor'] > 0; });
    var radii = dims.filter(function (v) { return v.name.indexOf('radius/') === 0 && v.name !== 'radius/none'; });
    return {
      sections: [
        {
          title: 'Espaçamento',
          description: 'space/050 a space/1200. Use em gap e padding.',
          node: async function (w) {
            var list = box('Espaços', { dir: 'V', gap: 10, w: w });
            for (var v of spaces) {
              var row = box(v.name, { dir: 'H', gap: 16, cross: 'center' });
              var label = box('Nome', { dir: 'V', w: 120 });
              add(label, await text(v.name, { style: 'label-sm', color: 'color/fg/default' }));
              add(row, label);
              var bar = shape('Barra', { w: 8, h: 12, fill: 'color/brand/solid', radius: 3 });
              num(bar, 'width', v.name);
              add(row, bar);
              add(row, await text(v.values['Valor'] + ' px', { style: 'caption', color: 'color/fg/subtle' }));
              add(list, row);
            }
            return list;
          },
        },
        {
          title: 'Raios',
          description: 'radius/xs a radius/full.',
          node: async function (w) {
            var grid = box('Raios', { dir: 'H', wrap: true, gap: 16, rowGap: 20, w: w });
            for (var v of radii) {
              var cell = box(v.name, { dir: 'V', gap: 8, cross: 'center' });
              var sq = shape('Amostra', { w: 72, h: 72, fill: 'color/bg/surface', stroke: 'color/border/default' });
              radius(sq, v.name);
              add(cell, sq);
              add(cell, await text(v.name.replace('radius/', ''), { style: 'caption', color: 'color/fg/muted' }));
              add(grid, cell);
            }
            return grid;
          },
        },
        {
          title: 'Sombras',
          description: 'Estilos de efeito não têm modos no Figma: há uma versão para cada tema.',
          span: 2,
          node: async function (w) {
            var pair = box('Sombras', { dir: 'H', gap: 24, w: w });
            for (var mode of ['Claro', 'Escuro']) {
              var stage = box('Modo ' + mode, { dir: 'H', wrap: true, gap: 24, rowGap: 24, pad: 32, fill: 'color/bg/canvas', stroke: 'color/border/subtle', radius: 24 });
              setMode(stage, mode);
              for (var size of ['xs', 'sm', 'md', 'lg', 'xl', '2xl']) {
                var card = box('shadow/' + size, { dir: 'V', pad: 16, w: 112, h: 72, fill: 'color/bg/raised', radius: 'radius/lg', align: 'end' });
                var st = ORB.effectStyles[mode + '/shadow/' + size];
                if (st) await card.setEffectStyleIdAsync(st.id);
                add(card, await text(size, { style: 'label-sm', color: 'color/fg/muted' }));
                add(stage, card);
              }
              add(pair, stage);
              stage.layoutSizingHorizontal = 'FILL';
            }
            return pair;
          },
        },
      ],
    };
  },
});
