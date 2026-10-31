import { icon } from '../../ds/icons/icons.js';
import { scatterChart } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { customers } from '../chart-data.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-dispersao.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const pad = (n) => String(n).padStart(2, '0');
const median = (vals) => {
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

const X = () => ({ label: L('Custo de aquisição', 'Acquisition cost', 'Costo de adquisición'), format: 'currency' });
const Y = () => ({ label: 'NPS', format: 'integer' });
const SIZE = () => ({ label: L('Receita mensal', 'Monthly revenue', 'Ingresos mensuales'), format: 'currency-compact' });

const costVsSatisfaction = () => L('Custo × satisfação por segmento', 'Cost × satisfaction by segment', 'Costo × satisfacción por segmento');
const retailTitle = () => L('Varejo: custo × satisfação', 'Retail: cost × satisfaction', 'Minorista: costo × satisfacción');
const eachPoint = () => L('Cada ponto é uma conta', 'Each point is an account', 'Cada punto es una cuenta');

/**
 * Monta as séries: cada ponto tem nome (aparece no tooltip e na tabela);
 * o rótulo direto só aparece nos extremos quando `labels` está ligado.
 */
function build(segments, { bubbles = false, labels = false } = {}) {
  const all = segments.flatMap((s, si) => s.points.map((p, k) => ({ si, k, ...p })));
  const extremes = new Set();
  if (labels) {
    const by = (fn) => all.reduce((best, p) => (fn(p) > fn(best) ? p : best));
    [by((p) => p.y), by((p) => -p.y), by((p) => p.x)].forEach((p) => extremes.add(`${p.si}-${p.k}`));
  }
  return segments.map((s, si) => ({
    name: s.name,
    points: s.points.map((p, k) => ({
      x: p.x,
      y: p.y,
      label: `${s.name} · ${pad(k + 1)}`,
      showLabel: extremes.has(`${si}-${k}`),
      ...(bubbles ? { size: p.size * 1000 } : {}),
    })),
  }));
}

const references = (segments) => {
  const pts = segments.flatMap((s) => s.points);
  const median_ = L('Mediana', 'Median', 'Mediana');
  return {
    x: { ...X(), reference: median(pts.map((p) => p.x)), referenceLabel: median_ },
    y: { ...Y(), reference: median(pts.map((p) => p.y)), referenceLabel: median_ },
  };
};

/* ───────── Playground ───────── */

function playgroundOptions(state) {
  const segments = customers().slice(0, +state.series);
  const series = build(segments, { bubbles: state.bubbles === 'on', labels: state.labels === 'on' });
  const refs = state.reference === 'on' ? references(segments) : { x: X(), y: Y() };
  return {
    title: segments.length === 1 ? retailTitle() : costVsSatisfaction(),
    subtitle: eachPoint(),
    series,
    x: refs.x,
    y: refs.y,
    ...(state.bubbles === 'on' ? { size: SIZE() } : {}),
    height: 340,
  };
}

const axisCode = (a) =>
  `{ label: '${a.label}', format: '${a.format}'${a.reference != null ? `, reference: ${a.reference}, referenceLabel: '${a.referenceLabel}'` : ''} }`;

function playgroundCode(state) {
  const o = playgroundOptions(state);
  const varNames = [L('varejo', 'retail', 'minorista'), L('empresas', 'businesses', 'empresas'), L('autonomos', 'freelancers', 'autonomos')];
  const series = o.series.map((s, i) => `    { name: '${s.name}', points: ${varNames[i]} },`).join('\n');
  const point = `{ x, y, label${state.bubbles === 'on' ? ', size' : ''}${state.labels === 'on' ? ', showLabel' : ''} }`;
  const size = SIZE();
  return `import { scatterChart } from './ds/js/charts.js';

// ${L('cada ponto', 'each point', 'cada punto')}: ${point}
const chart = scatterChart(document.querySelector('#${L('contas', 'accounts', 'cuentas')}'), {
  title: '${o.title}',
  subtitle: '${o.subtitle}',
  series: [
${series}
  ],
  x: ${axisCode(o.x)},
  y: ${axisCode(o.y)},${o.size ? `\n  size: { label: '${size.label}', format: '${size.format}' },` : ''}
});`;
}

/* ───────── Variantes ───────── */

const VARIANTS = () => [
  {
    id: 'simples',
    name: L('Simples', 'Simple', 'Simple'),
    code: L('1 série', '1 series', '1 serie'),
    text: L('Uma série, um tom. Sem legenda: o título diz o que cada ponto é.', 'One series, one hue. No legend: the title says what each point is.', 'Una serie, un tono. Sin leyenda: el título dice qué es cada punto.'),
    options: () => ({ title: retailTitle(), subtitle: eachPoint(), series: build(customers().slice(0, 1)), x: X(), y: Y() }),
  },
  {
    id: 'segmentos',
    name: L('Por segmento', 'By segment', 'Por segmento'),
    code: 'series: 3',
    text: L('Até três séries. Numa dispersão, qualquer ponto pode encostar em qualquer outro — por isso o teto é menor que nas linhas.', 'Up to three series. In a scatter, any point can touch any other — that’s why the ceiling is lower than for lines.', 'Hasta tres series. En una dispersión, cualquier punto puede tocar a cualquier otro — por eso el techo es menor que en las líneas.'),
    options: () => ({ title: costVsSatisfaction(), series: build(customers()), x: X(), y: Y() }),
  },
  {
    id: 'bolhas',
    name: L('Bolhas', 'Bubbles', 'Burbujas'),
    code: 'size',
    text: L('Uma terceira medida vira a área da bolha. Serve para comparar ordens de grandeza, não para ler o valor.', 'A third measure becomes the bubble’s area. It’s for comparing orders of magnitude, not for reading the value.', 'Una tercera medida se vuelve el área de la burbuja. Sirve para comparar órdenes de magnitud, no para leer el valor.'),
    options: () => ({ title: L('Receita por conta', 'Revenue by account', 'Ingresos por cuenta'), subtitle: L('Área da bolha = receita mensal', 'Bubble area = monthly revenue', 'Área de la burbuja = ingresos mensuales'), series: build(customers().slice(0, 2), { bubbles: true }), x: X(), y: Y(), size: SIZE() }),
  },
  {
    id: 'referencias',
    name: L('Com referências', 'With references', 'Con referencias'),
    code: 'reference',
    text: L('As medianas dividem o plano em quadrantes: acima e à esquerda está o melhor — satisfeito e barato.', 'The medians split the plane into quadrants: top left is the best — satisfied and cheap.', 'Las medianas dividen el plano en cuadrantes: arriba y a la izquierda está lo mejor — satisfecho y barato.'),
    options: () => ({ title: L('Onde cada segmento está', 'Where each segment sits', 'Dónde está cada segmento'), subtitle: L('Linhas nas medianas de custo e NPS', 'Lines at the cost and NPS medians', 'Líneas en las medianas de costo y NPS'), series: build(customers()), ...references(customers()) }),
  },
  {
    id: 'rotulos',
    name: L('Rótulos seletivos', 'Selective labels', 'Etiquetas selectivas'),
    code: 'showLabel',
    text: L('Nome só nos extremos — o maior NPS, o menor e o custo mais alto. O resto fica no tooltip e na tabela.', 'Names only on the extremes — the highest NPS, the lowest, and the highest cost. The rest stays in the tooltip and the table.', 'Nombre solo en los extremos — el mayor NPS, el menor y el costo más alto. El resto queda en el tooltip y en la tabla.'),
    options: () => ({ title: L('Os extremos', 'The extremes', 'Los extremos'), subtitle: L('Rótulo direto só onde a história está', 'Direct labels only where the story is', 'Etiqueta directa solo donde está la historia'), series: build(customers(), { labels: true }), x: X(), y: Y() }),
  },
];

/* ───────── API ───────── */

const API = () => [
  ['series', '{ name, color?, points }[]', '—', L('Até 3 séries. Acima disso, o Órbita avisa no console: agrupe ou use pequenos múltiplos.', 'Up to 3 series. Beyond that, Órbita warns in the console: group them or use small multiples.', 'Hasta 3 series. Por encima de eso, Órbita avisa en la consola: agrupa o usa pequeños múltiplos.')],
  ['points', '{ x, y, size?, label?, showLabel? }[]', '—', L(`${ic('label')} nomeia o ponto no tooltip e na tabela; ${ic('showLabel: false')} tira só o rótulo direto.`, `${ic('label')} names the point in the tooltip and the table; ${ic('showLabel: false')} removes only the direct label.`, `${ic('label')} nombra el punto en el tooltip y en la tabla; ${ic('showLabel: false')} quita solo la etiqueta directa.`)],
  ['x · y', '{ label, format, zero, reference, referenceLabel }', 'zero: false', L('Título do eixo, formato, se começa no zero e uma linha de referência tracejada.', 'Axis title, format, whether it starts at zero, and a dashed reference line.', 'Título del eje, formato, si empieza en cero y una línea de referencia discontinua.')],
  ['size', '{ label, format, range }', 'range: [4, 18]', L(`Com ${ic('size')} nos pontos, o raio segue a raiz do valor (área proporcional).`, `With ${ic('size')} on the points, the radius follows the square root of the value (proportional area).`, `Con ${ic('size')} en los puntos, el radio sigue la raíz del valor (área proporcional).`)],
  ['height', 'number', '320', L('Altura total, com os eixos.', 'Total height, with the axes.', 'Altura total, con los ejes.')],
  ['title · subtitle · label · card · table · pointLabel', '—', '—', L('Iguais aos de todos os gráficos; pointLabel nomeia a coluna da tabela.', 'Same as every chart; pointLabel names the table column.', 'Iguales a los de todos los gráficos; pointLabel nombra la columna de la tabla.')],
];

function apiTable() {
  return `<div class="doc-table gd-api">
    <div class="doc-table__head" aria-hidden="true"><span>${L('Opção', 'Option', 'Opción')}</span><span>${L('Tipo', 'Type', 'Tipo')}</span><span>${L('Padrão', 'Default', 'Predeterminado')}</span><span>${L('Para quê', 'What for', 'Para qué')}</span></div>
    ${API().map(
      ([name, type, def, text]) => `<div class="doc-table__row">
        <span><code class="ds-inline-code">${name}</code></span>
        <span class="gd-api__type">${type}</span>
        <span class="gd-api__type">${def}</span>
        <span class="gd-api__text">${text}</span>
      </div>`,
    ).join('')}
  </div>`;
}

/* ───────── Anatomia do ponto ───────── */

const targetFigure = () => `<svg class="gd-target__svg" viewBox="0 0 240 160" aria-hidden="true">
  <circle cx="120" cy="80" r="24" class="gd-target__hit"/>
  <circle cx="120" cy="80" r="6" class="gd-target__ring"/>
  <circle cx="120" cy="80" r="4" class="gd-target__dot"/>
  <line x1="144" y1="80" x2="196" y2="80" class="gd-target__lead"/>
  <text x="200" y="76" class="gd-target__num">24 px</text><text x="200" y="92" class="gd-target__cap">${L('alvo', 'target', 'objetivo')}</text>
  <line x1="116" y1="80" x2="64" y2="40" class="gd-target__lead"/>
  <text x="60" y="36" text-anchor="end" class="gd-target__num">8 px</text><text x="60" y="52" text-anchor="end" class="gd-target__cap">${L('ponto', 'dot', 'punto')}</text>
  <line x1="125" y1="84" x2="160" y2="128" class="gd-target__lead"/>
  <text x="164" y="132" class="gd-target__num">2 px</text><text x="164" y="148" class="gd-target__cap">${L('anel', 'ring', 'anillo')}</text>
</svg>`;

/* ───────── Página ───────── */

const section = (id, title, desc, body) => `
  <section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        <p class="doc-section__desc">${desc}</p>
      </div>
    </header>
    ${body}
  </section>`;

export default function renderDispersao(page) {
  const pointCount = customers().reduce((n, s) => n + s.points.length, 0);
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('A relação entre duas medidas: cada ponto é um item. Pontos de 8 px com anel, até três séries, nome só em quem merece — e um alvo generoso para o hover achar o ponto mais próximo.', 'The relationship between two measures: each point is an item. 8 px dots with a ring, up to three series, names only where they’re earned — and a generous target so hover finds the closest point.', 'La relación entre dos medidas: cada punto es un elemento. Puntos de 8 px con anillo, hasta tres series, nombre solo en quien lo merece — y un objetivo generoso para que el hover encuentre el punto más cercano.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('séries', 'series', 'series')}</dt><dd class="doc-stat__value">${L('até 3', 'up to 3', 'hasta 3')}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('ponto', 'dot', 'punto')}</dt><dd class="doc-stat__value">8 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('anel', 'ring', 'anillo')}</dt><dd class="doc-stat__value">2 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('alvo do hover', 'hover target', 'objetivo del hover')}</dt><dd class="doc-stat__value">24 px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['variantes', L('Variantes', 'Variants', 'Variantes')],
        ['alvo', L('Alvo de 24 px', '24 px target', 'Objetivo de 24 px')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', L('Ligue séries, bolhas, referências e rótulos. Passe o mouse perto de um ponto — não precisa acertar o centro.', 'Turn on series, bubbles, references, and labels. Hover near a point — you don’t need to hit the center.', 'Activa series, burbujas, referencias y etiquetas. Pasa el mouse cerca de un punto — no hace falta acertar el centro.'), playgroundMarkup('dispersao', { wide: true }))}

    ${section(
      'variantes',
      L('Variantes', 'Variants', 'Variantes'),
      L('Da nuvem simples às bolhas. Em todas, o hover acha o ponto mais próximo e a tabela lista cada um.', 'From a simple cloud to bubbles. In all of them, hover finds the closest point and the table lists each one.', 'De la nube simple a las burbujas. En todas, el hover encuentra el punto más cercano y la tabla lista cada uno.'),
      `<div class="gd-grid">
        ${VARIANTS().map(
          (v) => `<article class="gd-card">
            <div class="gd-card__chart" data-variant="${v.id}"></div>
            <div class="gd-card__body">
              <p class="cd-example__name">${v.name}<code>${v.code}</code></p>
              <p class="cd-example__text">${v.text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'alvo',
      L('Alvo de 24 px', '24 px target', 'Objetivo de 24 px'),
      L('Um ponto de 8 px é pequeno demais para mirar. O hover procura o ponto mais perto do ponteiro, até 24 px de distância.', 'An 8 px dot is too small to aim at. Hover looks for the point closest to the pointer, up to 24 px away.', 'Un punto de 8 px es demasiado pequeño para apuntar. El hover busca el punto más cercano al puntero, hasta 24 px de distancia.'),
      `<div class="gd-target">
        <div class="gd-target__figure">${targetFigure()}</div>
        <ul class="gd-target__list" role="list">
          <li><p class="gd-target__title">${L('Ponto de 8 px', '8 px dot', 'Punto de 8 px')}</p><p class="gd-target__text">${L('Raio 4, na cor da série. Pequeno o bastante para a nuvem respirar.', 'Radius 4, in the series color. Small enough for the cloud to breathe.', 'Radio 4, en el color de la serie. Lo bastante pequeño para que la nube respire.')}</p></li>
          <li><p class="gd-target__title">${L('Anel de 2 px', '2 px ring', 'Anillo de 2 px')}</p><p class="gd-target__text">${L('Da cor da superfície, separa pontos sobrepostos sem desenhar contorno de tinta.', 'In the surface color, it separates overlapping points without drawing an ink outline.', 'Del color de la superficie, separa puntos superpuestos sin dibujar un contorno de tinta.')}</p></li>
          <li><p class="gd-target__title">${L('Alvo de 24 px', '24 px target', 'Objetivo de 24 px')}</p><p class="gd-target__text">${L('O mais próximo dentro do raio acende, com um anel da cor dele. Em bolhas, a distância conta a partir da borda.', 'The closest within the radius lights up, with a ring in its color. With bubbles, distance counts from the edge.', 'El más cercano dentro del radio se ilumina, con un anillo de su color. En burbujas, la distancia cuenta desde el borde.')}</p></li>
        </ul>
      </div>
      <article class="gd-card gd-card--dense">
        <div class="gd-card__chart" data-dense></div>
        <div class="gd-card__body">
          <p class="cd-example__name">${L('Experimente na nuvem', 'Try it on the cloud', 'Pruébalo en la nube')}<code>${L(`${pointCount} pontos`, `${pointCount} points`, `${pointCount} puntos`)}</code></p>
          <p class="cd-example__text">${L('Passe o mouse no meio dos pontos: sempre há um aceso, o mais perto do ponteiro.', 'Hover among the points: there’s always one lit, the closest to the pointer.', 'Pasa el mouse entre los puntos: siempre hay uno encendido, el más cercano al puntero.')}</p>
        </div>
      </article>`,
    )}

    ${section(
      'acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('Cada ponto é alcançável sem mouse e sem cor.', 'Every point is reachable without a mouse and without color.', 'Cada punto se puede alcanzar sin mouse y sin color.'),
      a11yList([
        [L('Tabela com todos os pontos', 'A table with every point', 'Tabla con todos los puntos'), L('O botão de tabela lista cada ponto com nome, série, x, y e tamanho — o caminho para quem não enxerga a nuvem.', 'The table button lists each point with name, series, x, y, and size — the way in for those who can’t see the cloud.', 'El botón de tabla lista cada punto con nombre, serie, x, y y tamaño — el camino para quien no ve la nube.')],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab foca o gráfico; as setas andam pelos pontos da esquerda para a direita, Home e End vão às pontas e Esc fecha o tooltip.', 'Tab focuses the chart; the arrows walk through the points from left to right, Home and End go to the ends, and Esc closes the tooltip.', 'Tab enfoca el gráfico; las flechas recorren los puntos de izquierda a derecha, Home y End van a los extremos y Esc cierra el tooltip.'), ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        [L('Leitor de tela', 'Screen reader', 'Lector de pantalla'), L('O gráfico anuncia quantos pontos tem; cada ponto visitado é lido com nome e os dois valores.', 'The chart announces how many points it has; each visited point is read with its name and both values.', 'El gráfico anuncia cuántos puntos tiene; cada punto visitado se lee con nombre y los dos valores.')],
        [L('Cores validadas em todos os pares', 'Colors validated across all pairs', 'Colores validados en todos los pares'), L('Na dispersão qualquer cor encosta em qualquer outra. As três primeiras séries do Órbita foram validadas par a par para daltonismo — por isso o limite de três.', 'In a scatter, any color can touch any other. Órbita’s first three series were validated pair by pair for color blindness — hence the limit of three.', 'En la dispersión cualquier color toca a cualquier otro. Las tres primeras series de Órbita se validaron par a par para daltonismo — por eso el límite de tres.')],
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L('Com duas séries ou mais há legenda, e o tooltip repete o nome da série.', 'With two or more series there’s a legend, and the tooltip repeats the series name.', 'Con dos series o más hay leyenda, y el tooltip repite el nombre de la serie.')],
        [L('Alvo generoso', 'A generous target', 'Objetivo generoso'), L('O hover pega o ponto mais próximo até 24 px, o mínimo confortável para mouse e toque.', 'Hover catches the closest point up to 24 px, the comfortable minimum for mouse and touch.', 'El hover toma el punto más cercano hasta 24 px, el mínimo cómodo para mouse y toque.')],
      ]),
    )}

    ${section(
      'tokens',
      L('Tokens usados', 'Tokens used', 'Tokens usados'),
      L('As três primeiras cores de série, as linhas do plano e a cor da superfície para o anel.', 'The first three series colors, the plane lines, and the surface color for the ring.', 'Los tres primeros colores de serie, las líneas del plano y el color de la superficie para el anillo.'),
      tokenTable([
        ['color.chart.series.1', L('Primeira série', 'First series', 'Primera serie')],
        ['color.chart.series.2', L('Segunda série', 'Second series', 'Segunda serie')],
        ['color.chart.series.3', L('Terceira série', 'Third series', 'Tercera serie')],
        ['color.bg.surface', L('Anel dos pontos (cor da superfície)', 'Point ring (surface color)', 'Anillo de los puntos (color de la superficie)')],
        ['color.chart.grid', L('Linhas de grade', 'Grid lines', 'Líneas de cuadrícula')],
        ['color.chart.axis', L('Eixos', 'Axes', 'Ejes')],
        ['color.fg.subtle', L('Valores e títulos dos eixos, referência', 'Axis values and titles, reference', 'Valores y títulos de los ejes, referencia')],
        ['color.fg.muted', L('Rótulos diretos', 'Direct labels', 'Etiquetas directas')],
        ['color.bg.raised', L('Fundo do tooltip', 'Tooltip background', 'Fondo del tooltip')],
      ]),
    )}

    ${section(
      'uso',
      L('Uso', 'Usage', 'Uso'),
      L('Dispersão responde “uma coisa anda com a outra?”. Para o resto, há gráficos melhores.', 'A scatter answers “does one thing move with the other?”. For everything else, there are better charts.', 'La dispersión responde “¿una cosa va con la otra?”. Para el resto, hay gráficos mejores.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: até 3 séries', 'Do: up to 3 series', 'Haz: hasta 3 series')}</p>
          <p class="usage-card__text">${L('Mais que isso, as cores começam a se confundir. Agrupe em “Outros” ou separe em pequenos múltiplos.', 'Beyond that, colors start to get confused. Group into “Others” or split into small multiples.', 'Más que eso, los colores empiezan a confundirse. Agrupa en “Otros” o separa en pequeños múltiplos.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: bolha para valor exato', 'Avoid: bubbles for exact values', 'Evita: burbuja para valor exacto')}</p>
          <p class="usage-card__text">${L('O olho erra a área de círculos. A bolha diz “bem maior” ou “bem menor”; o número fica no tooltip.', 'The eye misjudges circle areas. A bubble says “much bigger” or “much smaller”; the number stays in the tooltip.', 'El ojo se equivoca con el área de los círculos. La burbuja dice “mucho mayor” o “mucho menor”; el número queda en el tooltip.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Zero é opcional', 'Zero is optional', 'El cero es opcional')}</p>
          <p class="usage-card__text">${L(`Diferente das barras, os eixos podem começar perto dos dados — a posição é a mensagem, não o comprimento. Ligue ${ic('zero')} quando a distância até zero importa.`, `Unlike bars, the axes can start near the data — position is the message, not length. Turn on ${ic('zero')} when the distance to zero matters.`, `A diferencia de las barras, los ejes pueden empezar cerca de los datos — la posición es el mensaje, no la longitud. Activa ${ic('zero')} cuando la distancia hasta cero importa.`)}</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: uma referência', 'Do: a reference', 'Haz: una referencia')}</p>
          <p class="usage-card__text">${L('Mediana, média ou meta dão sentido aos quadrantes. Sem elas, a pessoa não sabe o que é “alto”.', 'Median, average, or goal give the quadrants meaning. Without them, people don’t know what “high” is.', 'Mediana, media o meta dan sentido a los cuadrantes. Sin ellas, la persona no sabe qué es “alto”.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: tempo no eixo x', 'Avoid: time on the x-axis', 'Evita: tiempo en el eje x')}</p>
          <p class="usage-card__text">${L('Se os pontos são uma sequência no tempo, ligue-os: use um gráfico de linha.', 'If the points are a sequence in time, connect them: use a line chart.', 'Si los puntos son una secuencia en el tiempo, únelos: usa un gráfico de línea.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Rótulo só nos extremos', 'Labels only on the extremes', 'Etiqueta solo en los extremos')}</p>
          <p class="usage-card__text">${L('Nome em todos os pontos vira ruído. Rotule o que a história pede e deixe o resto no tooltip.', 'A name on every point becomes noise. Label what the story calls for and leave the rest in the tooltip.', 'Nombre en todos los puntos se vuelve ruido. Etiqueta lo que pide la historia y deja el resto en el tooltip.')}</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      L('Uma função, com update, setLoading e destroy como em todos os gráficos.', 'One function, with update, setLoading, and destroy as in every chart.', 'Una función, con update, setLoading y destroy como en todos los gráficos.'),
      `${codeBlock(`import { scatterChart } from './ds/js/charts.js';

const chart = scatterChart(document.querySelector('#${L('contas', 'accounts', 'cuentas')}'), {
  title: '${L('Custo × satisfação', 'Cost × satisfaction', 'Costo × satisfacción')}',
  series: [{ name: '${customers()[0].name}', points: [{ x: 42, y: 61, label: '${L('Conta', 'Account', 'Cuenta')} 01' }, { x: 58, y: 47, label: '${L('Conta', 'Account', 'Cuenta')} 02' }] }],
  x: { label: '${X().label}', format: 'currency' },
  y: { label: 'NPS', format: 'integer', reference: 50, referenceLabel: '${L('Meta', 'Goal', 'Meta')}' },
});`)}
      ${apiTable()}`,
    )}
  </div>`;
}

export function mount(root) {
  const charts = [];
  const without = L('Sem', 'Without', 'Sin');

  const unmountPlayground = mountPlayground(root, {
    id: 'dispersao',
    controls: [
      { id: 'series', label: L('Séries', 'Series', 'Series'), value: '3', options: ['1', '2', '3'].map((value) => ({ value, label: value })) },
      { id: 'bubbles', label: L('Bolhas', 'Bubbles', 'Burbujas'), value: 'off', options: [{ value: 'off', label: without }, { value: 'on', label: L('Com', 'With', 'Con') }] },
      { id: 'reference', label: L('Referência', 'Reference', 'Referencia'), value: 'off', options: [{ value: 'off', label: without }, { value: 'on', label: L('Medianas', 'Medians', 'Medianas') }] },
      { id: 'labels', label: L('Rótulos', 'Labels', 'Etiquetas'), value: 'off', options: [{ value: 'off', label: without }, { value: 'on', label: L('Extremos', 'Extremes', 'Extremos') }] },
    ],
    render: () => '<div data-playground-chart></div>',
    mount(preview, state) {
      const chart = scatterChart(preview.querySelector('[data-playground-chart]'), playgroundOptions(state));
      return () => chart.destroy();
    },
    code: playgroundCode,
  });

  VARIANTS().forEach((v) => {
    const el = root.querySelector(`[data-variant="${v.id}"]`);
    if (el) charts.push(scatterChart(el, { ...v.options(), height: 300 }));
  });
  const dense = root.querySelector('[data-dense]');
  if (dense) charts.push(scatterChart(dense, { title: L('Todas as contas', 'All accounts', 'Todas las cuentas'), series: build(customers()), x: X(), y: Y(), height: 320 }));

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    charts.forEach((c) => c.destroy());
    unmountCopy();
    unmountNav();
  };
}
