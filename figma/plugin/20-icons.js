/**
 * Página Ícones: os componentes de ícone ficam aqui, organizados por categoria.
 * Grade de 24 px, traço 1,5, cor ligada a color/fg/default (troque na instância).
 */

defineBlock({
  id: 'icones',
  page: 'Ícones',
  row: 'Ícones',
  order: 1,
  group: 'Fundamentos',
  title: 'Ícones',
  description: 'Os mesmos ' + ICONS.length + ' ícones do código, como componentes de 24 px. Arraste uma instância e troque a cor por qualquer variável de texto; nos componentes, use a propriedade “Trocar ícone”.',
  tags: [ICONS.length + ' componentes', 'Traço 1,5'],
  width: 1480,
  build: async function () {
    var cats = {};
    ICONS.forEach(function (i) { (cats[i.category] = cats[i.category] || []).push(i); });
    var sections = [];
    Object.keys(cats).forEach(function (cat) {
      sections.push({
        title: META.iconCategories[cat] || cat,
        description: cats[cat].length + ' ícones',
        span: 2,
        node: async function (w) {
          var grid = box('Ícones · ' + cat, { dir: 'H', wrap: true, gap: 12, rowGap: 12, w: w });
          for (var def of cats[cat]) {
            var cell = box(def.name, { dir: 'V', gap: 10, pad: [18, 8, 12, 8], w: 108, cross: 'center', fill: 'color/bg/surface', stroke: 'color/border/subtle', radius: 'radius/lg' });
            add(cell, iconComponent(def.name));
            add(cell, await text(def.name, { style: 'caption', color: 'color/fg/muted', w: 92, align: 'center', truncate: true }));
            add(grid, cell);
          }
          return grid;
        },
      });
    });
    return { sections: sections };
  },
});
