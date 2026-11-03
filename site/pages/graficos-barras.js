import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { barChart } from '../../ds/js/charts.js';
import { locale, dateFormat } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { months, revenue, channels, teams, funnel, npsDelta } from '../chart-data.js';
import { L, ratio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-barras.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const ORIENTATIONS = () => [
  ['vertical', 'Vertical'],
  ['horizontal', 'Horizontal'],
];

const LAYOUTS = () => [
  ['grouped', L('Agrupado', 'Grouped', 'Agrupado')],
  ['stacked', L('Empilhado', 'Stacked', 'Apilado')],
  ['percent', '100%'],
];

const LABELS = () => [
  ['none', L('Nenhum', 'None', 'Ninguno')],
  ['max', L('Só o maior', 'Largest only', 'Solo el mayor')],
  ['last', L('Só o último', 'Last only', 'Solo el último')],
  ['all', L('Todos', 'All', 'Todos')],
];

/** Menor contraste das cores de série sobre a superfície, nos três temas (vem do build). */
const minSeriesContrast = Math.min(...contrast.filter((c) => c.fg.startsWith('color.chart.series.') && c.bg === 'color.bg.surface').map((c) => c.ratio));

const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)} ${L('pts', 'pts', 'pts')}`;
const monthName = (i) => {
  const s = dateFormat({ month: 'long' }).format(new Date(2026, i, 15));
  return s.charAt(0).toLocaleUpperCase(locale()) + s.slice(1);
};
const revenueLabel = () => L('Receita', 'Revenue', 'Ingresos');
const salesByChannel = () => L('Vendas por canal', 'Sales by channel', 'Ventas por canal');
const thousandUnits = () => L('Mil unidades', 'Thousand units', 'Miles de unidades');

/** Código JS legível de uma chamada de barChart. */
const list = (arr) => `[${arr.map((v) => (typeof v === 'string' ? `'${v}'` : v)).join(', ')}]`;

function chartCode(fn, target, lines) {
  return `import { ${fn} } from './ds/js/charts.js';\n\n${fn}(document.querySelector('${target}'), {\n${lines.filter(Boolean).map((l) => `  ${l}`).join('\n')}\n});`;
}

/* ───────── Playground ───────── */

function playOptions(state) {
  const count = Number(state.series);
  const ch = channels();
  const series = ch.series.slice(0, count);
  return {
    title: count === 1 ? L('Vendas no app', 'App sales', 'Ventas en la app') : salesByChannel(),
    subtitle: L('Mil unidades · 1º semestre', 'Thousand units · 1st half', 'Miles de unidades · 1.er semestre'),
    categories: ch.categories,
    series,
    orientation: state.orientation,
    layout: count === 1 ? 'grouped' : state.layout,
    labels: state.labels,
    highlight: state.highlight === 'one' ? ch.categories.length - 1 : undefined,
    height: 300,
  };
}

function playCode(state) {
  const o = playOptions(state);
  return chartCode('barChart', `#${L('vendas', 'sales', 'ventas')}`, [
    `title: '${o.title}',`,
    `subtitle: '${o.subtitle}',`,
    `categories: ${list(o.categories)},`,
    'series: [',
    ...o.series.map((s) => `  { name: '${s.name}', values: ${list(s.values)} },`),
    '],',
    o.orientation !== 'vertical' && `orientation: '${o.orientation}',`,
    o.layout !== 'grouped' && `layout: '${o.layout}',`,
    `labels: '${o.labels}',`,
    o.highlight != null && `highlight: ${o.highlight}, // ${L(`${o.categories[o.highlight]} em destaque; o resto em cinza`, `${o.categories[o.highlight]} highlighted; the rest in gray`, `${o.categories[o.highlight]} destacado; el resto en gris`)}`,
  ]);
}

/* ───────── Variantes ───────── */

const VARIANTS = () => {
  const ch = channels();
  const tm = teams();
  const nps = npsDelta();
  const fn = funnel();
  return [
    {
      id: 'colunas',
      name: L('Colunas', 'Columns', 'Columnas'),
      code: "orientation: 'vertical'",
      text: L('Uma série, uma cor. Só o maior valor ganha rótulo; o eixo carrega o resto.', 'One series, one color. Only the largest value gets a label; the axis carries the rest.', 'Una serie, un color. Solo el mayor valor recibe etiqueta; el eje lleva el resto.'),
      options: { title: L('Receita por mês', 'Revenue by month', 'Ingresos por mes'), subtitle: L('Em reais · 2026', 'In reais · 2026', 'En reales · 2026'), categories: months(), series: [{ name: revenueLabel(), values: revenue[2026] }], format: 'currency', labels: 'max' },
    },
    {
      id: 'agrupadas',
      name: L('Agrupadas', 'Grouped', 'Agrupadas'),
      code: "layout: 'grouped'",
      text: L('Compara séries dentro de cada categoria. Até 4 séries, com 2 px entre barras vizinhas.', 'Compares series within each category. Up to 4 series, with 2 px between neighboring bars.', 'Compara series dentro de cada categoría. Hasta 4 series, con 2 px entre barras vecinas.'),
      options: { title: salesByChannel(), subtitle: thousandUnits(), categories: ch.categories, series: ch.series.slice(0, 3) },
    },
    {
      id: 'empilhadas',
      name: L('Empilhadas', 'Stacked', 'Apiladas'),
      code: "layout: 'stacked'",
      text: L('O total e a composição juntos. Só a ponta do topo é arredondada; o total vai em cima.', 'Total and composition together. Only the top end is rounded; the total goes on top.', 'El total y la composición juntos. Solo el extremo superior es redondeado; el total va arriba.'),
      options: { title: salesByChannel(), subtitle: L('Total e composição · mil unidades', 'Total and composition · thousand units', 'Total y composición · miles de unidades'), categories: ch.categories, series: ch.series, layout: 'stacked', labels: 'last' },
    },
    {
      id: 'cem',
      name: '100%',
      code: "layout: 'percent'",
      text: L('Só a composição: cada coluna soma 100%. O tooltip mostra a parte e o valor real.', 'Composition only: each column adds up to 100%. The tooltip shows the share and the real value.', 'Solo la composición: cada columna suma 100%. El tooltip muestra la parte y el valor real.'),
      options: { title: L('Participação de cada canal', 'Share of each channel', 'Participación de cada canal'), subtitle: L('Por mês', 'By month', 'Por mes'), categories: ch.categories, series: ch.series, layout: 'percent' },
    },
    {
      id: 'horizontais',
      name: L('Horizontais', 'Horizontal', 'Horizontales'),
      code: "orientation: 'horizontal'",
      text: L('Para rankings e nomes longos. O valor vai na ponta, então o eixo some.', 'For rankings and long names. The value goes at the end, so the axis goes away.', 'Para rankings y nombres largos. El valor va en el extremo, así que el eje desaparece.'),
      options: { title: L('Entregas por time', 'Deliveries by team', 'Entregas por equipo'), subtitle: L('3º trimestre', 'Q3', '3.er trimestre'), categories: tm.categories, series: [{ name: L('Entregas', 'Deliveries', 'Entregas'), values: tm.values }], orientation: 'horizontal', format: 'integer' },
    },
    {
      id: 'divergentes',
      name: L('Divergentes', 'Diverging', 'Divergentes'),
      code: 'diverging: true',
      text: L('Acima e abaixo de uma referência, nas duas pontas da escala divergente. O zero é a meta.', 'Above and below a reference, at both ends of the diverging scale. Zero is the goal.', 'Por encima y por debajo de una referencia, en los dos extremos de la escala divergente. El cero es la meta.'),
      options: {
        title: L('NPS contra a meta', 'NPS vs. goal', 'NPS contra la meta'),
        subtitle: L('Diferença em pontos, por região', 'Difference in points, by region', 'Diferencia en puntos, por región'),
        categories: nps.categories,
        series: [{ name: L('Diferença', 'Difference', 'Diferencia'), values: nps.values }],
        orientation: 'horizontal',
        diverging: true,
        positiveLabel: L('Acima da meta', 'Above goal', 'Por encima de la meta'),
        negativeLabel: L('Abaixo da meta', 'Below goal', 'Por debajo de la meta'),
        labels: 'all',
        format: signed,
      },
    },
    {
      id: 'enfase',
      name: L('Ênfase', 'Emphasis', 'Énfasis'),
      code: 'highlight: 11',
      text: L('Quando a história é uma barra só: ela fica na cor, o resto vira contexto em cinza.', 'When the story is a single bar: it keeps the color, the rest becomes gray context.', 'Cuando la historia es una sola barra: queda en color, el resto se vuelve contexto en gris.'),
      options: { title: L('Receita de dezembro', 'December revenue', 'Ingresos de diciembre'), subtitle: L('Contra os outros meses de 2026', 'Against the other months of 2026', 'Contra los otros meses de 2026'), categories: months(), series: [{ name: revenueLabel(), values: revenue[2026] }], format: 'currency', highlight: 11, labels: 'last' },
    },
    {
      id: 'funil',
      name: L('Funil', 'Funnel', 'Embudo'),
      code: 'ordinal: true',
      text: L('Etapas em sequência numa rampa de um tom. O tooltip mostra quanto passou da etapa anterior.', 'Steps in sequence on a single-hue ramp. The tooltip shows how much carried over from the previous step.', 'Etapas en secuencia en una rampa de un tono. El tooltip muestra cuánto pasó de la etapa anterior.'),
      options: { title: L('Funil de ativação', 'Activation funnel', 'Embudo de activación'), subtitle: L('Pessoas em outubro', 'People in October', 'Personas en octubre'), categories: fn.categories, series: [{ name: L('Pessoas', 'People', 'Personas'), values: fn.values }], orientation: 'horizontal', ordinal: true, format: 'integer' },
    },
  ];
};

/* ───────── Estados ───────── */

const STATES = () => [
  ['hover', L('Hover e foco', 'Hover and focus', 'Hover y foco'), L('A faixa da categoria acende e o tooltip lista todas as séries. Com Tab e setas, o mesmo — e um leitor de tela ouve os valores.', 'The category band lights up and the tooltip lists every series. With Tab and the arrows, the same — and a screen reader hears the values.', 'La franja de la categoría se ilumina y el tooltip lista todas las series. Con Tab y flechas, lo mismo — y un lector de pantalla oye los valores.')],
  ['escondida', L('Série escondida', 'Hidden series', 'Serie oculta'), L('Clique na legenda para esconder uma série. As outras mantêm a cor: a cor segue a série, não a posição.', 'Click the legend to hide a series. The others keep their color: color follows the series, not the position.', 'Haz clic en la leyenda para ocultar una serie. Las demás mantienen el color: el color sigue a la serie, no a la posición.')],
  ['carregando', L('Carregando', 'Loading', 'Cargando'), L('Ao buscar dados novos, o desenho anterior fica a meia opacidade. Sem esqueleto, sem pulo de layout.', 'While fetching new data, the previous drawing stays at half opacity. No skeleton, no layout jump.', 'Al buscar datos nuevos, el dibujo anterior queda a media opacidad. Sin esqueleto, sin saltos de layout.')],
  ['vazio', L('Vazio', 'Empty', 'Vacío'), L('Sem dados, a área do gráfico vira um aviso com a mesma altura. Diga o que fazer, se houver.', 'With no data, the chart area becomes a notice of the same height. Say what to do, if anything.', 'Sin datos, el área del gráfico se vuelve un aviso con la misma altura. Di qué hacer, si hay algo.')],
];

/* ───────── Uso (miniaturas estáticas) ───────── */

function miniBars(values, { base = 0, colors, labels } = {}) {
  const W = 220;
  const H = 96;
  const max = Math.max(...values);
  const bw = 18;
  const gap = (W - 24 - values.length * bw) / (values.length - 1 || 1);
  const y = (v) => 82 - ((v - base) / (max - base || 1)) * 70;
  const bars = values
    .map((v, i) => {
      const x = 12 + i * (bw + gap);
      const top = y(v);
      return `<path d="M${x} 82V${top + 4}A4 4 0 0 1 ${x + 4} ${top}H${x + bw - 4}A4 4 0 0 1 ${x + bw} ${top + 4}V82Z" style="fill:${colors?.[i] ?? 'var(--ds-color-chart-series-1)'}"/>`;
    })
    .join('');
  const axis = labels ? `<text x="12" y="94" class="gb-mini__tick">${labels[0]}</text><text x="${W - 12}" y="94" class="gb-mini__tick" text-anchor="end">${labels[1]}</text>` : '';
  return `<svg class="gb-mini" viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="8" x2="${W - 8}" y1="82.5" y2="82.5" class="gb-mini__base"/>${bars}${axis}</svg>`;
}

function miniHorizontal(names) {
  const W = 220;
  const rows = names
    .map((n, i) => {
      const w = [120, 96, 70][i];
      const y = 10 + i * 28;
      return `<text x="70" y="${y + 9}" class="gb-mini__label" text-anchor="end" dominant-baseline="middle">${n}</text><path d="M80 ${y}H${80 + w - 4}A4 4 0 0 1 ${80 + w} ${y + 4}V${y + 14}A4 4 0 0 1 ${80 + w - 4} ${y + 18}H80Z" style="fill:var(--ds-color-chart-series-1)"/>`;
    })
    .join('');
  return `<svg class="gb-mini" viewBox="0 0 ${W} 96" aria-hidden="true"><line x1="80.5" x2="80.5" y1="4" y2="92" class="gb-mini__base"/>${rows}</svg>`;
}

const RAINBOW = ['series-1', 'series-2', 'series-3', 'series-4', 'series-5'].map((s) => `var(--ds-color-chart-${s})`);

/* ───────── API ───────── */

const API = () => [
  ['categories', 'string[]', '—', L('Rótulos das categorias, na ordem do eixo.', 'Category labels, in axis order.', 'Etiquetas de las categorías, en el orden del eje.')],
  ['series', '[{ name, values, color? }]', '—', L(`Uma entrada por série. Sem ${ic('color')}, a série usa o slot da sua posição (1–8).`, `One entry per series. Without ${ic('color')}, the series uses the slot for its position (1–8).`, `Una entrada por serie. Sin ${ic('color')}, la serie usa el slot de su posición (1–8).`)],
  ['orientation', "'vertical' | 'horizontal'", "'vertical'", L('Horizontal para rankings e nomes longos.', 'Horizontal for rankings and long names.', 'Horizontal para rankings y nombres largos.')],
  ['layout', "'grouped' | 'stacked' | 'percent'", "'grouped'", L('Lado a lado, empilhado ou empilhado em 100%.', 'Side by side, stacked, or stacked to 100%.', 'Lado a lado, apilado o apilado al 100%.')],
  ['labels', "'auto' | 'none' | 'max' | 'last' | 'all'", "'auto'", L(`Rótulos de valor. ${ic('auto')} mostra todos só em barras horizontais de uma série ou empilhadas.`, `Value labels. ${ic('auto')} shows all of them only on single-series horizontal bars or stacked bars.`, `Etiquetas de valor. ${ic('auto')} muestra todas solo en barras horizontales de una serie o apiladas.`)],
  ['highlight', L('número', 'number', 'número'), '—', L(`Índice da categoria em destaque; as outras ficam em ${ic('chart.muted')}.`, `Index of the highlighted category; the others use ${ic('chart.muted')}.`, `Índice de la categoría destacada; las demás quedan en ${ic('chart.muted')}.`)],
  ['diverging', 'boolean', 'false', L(`Positivo e negativo nas pontas da escala divergente. Legenda com ${ic('positiveLabel')} e ${ic('negativeLabel')}.`, `Positive and negative at the ends of the diverging scale. Legend with ${ic('positiveLabel')} and ${ic('negativeLabel')}.`, `Positivo y negativo en los extremos de la escala divergente. Leyenda con ${ic('positiveLabel')} y ${ic('negativeLabel')}.`)],
  ['ordinal', 'boolean', 'false', L('Categorias em sequência (funil, faixas) numa rampa de um tom.', 'Categories in sequence (funnel, bands) on a single-hue ramp.', 'Categorías en secuencia (embudo, rangos) en una rampa de un tono.')],
  ['format', L('preset | Intl | função', 'preset | Intl | function', 'preset | Intl | función'), "'number'", L(`${ic("'integer'")}, ${ic("'compact'")}, ${ic("'percent'")}, ${ic("'currency'")}… O eixo compacta sozinho; troque com ${ic('axisFormat')}.`, `${ic("'integer'")}, ${ic("'compact'")}, ${ic("'percent'")}, ${ic("'currency'")}… The axis compacts on its own; change it with ${ic('axisFormat')}.`, `${ic("'integer'")}, ${ic("'compact'")}, ${ic("'percent'")}, ${ic("'currency'")}… El eje se compacta solo; cámbialo con ${ic('axisFormat')}.`)],
  ['height', 'px', '280', L('Altura total das colunas, incluindo o eixo. Barras horizontais calculam a altura pelas linhas.', 'Total height of the columns, including the axis. Horizontal bars compute their height from the rows.', 'Altura total de las columnas, incluido el eje. Las barras horizontales calculan la altura por las filas.')],
  ['title · subtitle', 'string', '—', L(`Cabeçalho do gráfico. Sem título, passe ${ic('label')} para nomeá-lo.`, `Chart header. Without a title, pass ${ic('label')} to name it.`, `Encabezado del gráfico. Sin título, pasa ${ic('label')} para nombrarlo.`)],
  ['card · table · texture', 'boolean', 'false · true · false', L('Superfície com contorno, botão de tabela e hachura de reserva.', 'Outlined surface, table button, and backup hatching.', 'Superficie con contorno, botón de tabla y rayado de reserva.')],
];

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

export default function renderBarras(page) {
  const minRatio = ratio(minSeriesContrast);
  const tm = teams().categories;
  return `
  <div class="page doc gb-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Compara grandezas lado a lado. Uma base no zero, barras finas, a ponta arredondada carregando o dado — e o número só onde ele conta a história.', 'Compares quantities side by side. A baseline at zero, thin bars, the rounded end carrying the data — and the number only where it tells the story.', 'Compara magnitudes lado a lado. Una base en cero, barras finas, el extremo redondeado llevando el dato — y el número solo donde cuenta la historia.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">layouts</dt><dd class="doc-stat__value">${LAYOUTS().length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('orientações', 'orientations', 'orientaciones')}</dt><dd class="doc-stat__value">${ORIENTATIONS().length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('espessura máxima', 'max thickness', 'grosor máximo')}</dt><dd class="doc-stat__value">24 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('contraste mínimo', 'minimum contrast', 'contraste mínimo')}</dt><dd class="doc-stat__value">${minRatio}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['variantes', L('Variantes', 'Variants', 'Variantes')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', L('Troque orientação, layout, séries e rótulos. O gráfico é o de verdade: passe o mouse, use as setas, esconda séries na legenda ou abra a tabela.', 'Change orientation, layout, series, and labels. The chart is the real one: hover, use the arrows, hide series in the legend, or open the table.', 'Cambia orientación, layout, series y etiquetas. El gráfico es el de verdad: pasa el mouse, usa las flechas, oculta series en la leyenda o abre la tabla.'), playgroundMarkup('graficos-barras', { wide: true }))}

    ${section(
      'variantes',
      L('Variantes', 'Variants', 'Variantes'),
      L('Cada forma responde a uma pergunta. Escolha pela pergunta, não pela aparência.', 'Each form answers a question. Choose by the question, not by the look.', 'Cada forma responde a una pregunta. Elige por la pregunta, no por la apariencia.'),
      `<div class="gb-variants">
        ${VARIANTS().map(
          (v) => `<article class="gb-variant">
            <div class="gb-variant__chart" data-variant="${v.id}"></div>
            <div class="gb-variant__body">
              <p class="gb-variant__name">${v.name}<code>${v.code}</code></p>
              <p class="gb-variant__text">${v.text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'estados',
      L('Estados', 'States', 'Estados'),
      L('O gráfico responde ao ponteiro, ao teclado e aos dados. Os dois primeiros começam com o estado aplicado — interaja para ver de novo.', 'The chart responds to the pointer, the keyboard, and the data. The first two start with the state applied — interact to see it again.', 'El gráfico responde al puntero, al teclado y a los datos. Los dos primeros empiezan con el estado aplicado — interactúa para verlo de nuevo.'),
      `<div class="gb-states">
        ${STATES().map(
          ([id, name, text]) => `<article class="gb-variant">
            <div class="gb-variant__chart" data-state-chart="${id}"></div>
            <div class="gb-variant__body">
              <p class="gb-variant__name">${name}${id === 'carregando' ? `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-reload>${icon('refresh', { size: 16 })}${L('Recarregar', 'Reload', 'Recargar')}</button>` : ''}</p>
              <p class="gb-variant__text">${text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'anatomia',
      L('Anatomia', 'Anatomy', 'Anatomía'),
      L('Seis medidas fixas fazem o visual calmo. O dado é a única coisa que pode chamar atenção.', 'Six fixed measurements make the calm look. The data is the only thing allowed to draw attention.', 'Seis medidas fijas hacen el aspecto tranquilo. El dato es lo único que puede llamar la atención.'),
      `<div class="gb-anatomy">
        <div class="gb-anatomy__stage" aria-hidden="true">${anatomySvg()}</div>
        <ol class="gb-anatomy__legend" role="list">
          ${[
            [L('Linha de base', 'Baseline', 'Línea base'), L(`Toda barra nasce do zero, numa linha de 1 px em ${ic('chart.axis')}. Barra não corta eixo.`, `Every bar grows from zero, on a 1 px line in ${ic('chart.axis')}. Bars don’t cut the axis.`, `Toda barra nace del cero, en una línea de 1 px en ${ic('chart.axis')}. La barra no corta el eje.`)],
            [L('Barra', 'Bar', 'Barra'), L('No máximo 24 px de espessura. O que sobra da faixa é respiro, não barra mais gorda.', 'At most 24 px thick. What’s left of the band is breathing room, not a fatter bar.', 'Como máximo 24 px de grosor. Lo que sobra de la franja es respiro, no una barra más gruesa.')],
            [L('Ponta de dados', 'Data end', 'Extremo de datos'), L('Raio de 4 px só na ponta que carrega o valor. A base fica reta, colada no zero.', 'A 4 px radius only on the end that carries the value. The base stays flat, on zero.', 'Radio de 4 px solo en el extremo que lleva el valor. La base queda recta, pegada al cero.')],
            [L('Respiro', 'Breathing room', 'Respiro'), L('2 px entre barras vizinhas e entre segmentos empilhados, deixando a superfície aparecer. Nunca um contorno.', '2 px between neighboring bars and between stacked segments, letting the surface show through. Never an outline.', '2 px entre barras vecinas y entre segmentos apilados, dejando ver la superficie. Nunca un contorno.')],
            [L('Rótulo de valor', 'Value label', 'Etiqueta de valor'), L(`Na ponta, em ${ic('fg.default')} — texto nunca usa a cor da série. Só onde conta a história.`, `At the end, in ${ic('fg.default')} — text never uses the series color. Only where it tells the story.`, `En el extremo, en ${ic('fg.default')} — el texto nunca usa el color de la serie. Solo donde cuenta la historia.`)],
            [L('Grade e eixo', 'Grid and axis', 'Cuadrícula y eje'), L(`Fios de 1 px, sólidos, em ${ic('chart.grid')}. Marcas redondas, compactas a partir de mil.`, `Solid 1 px lines in ${ic('chart.grid')}. Round ticks, compact from a thousand.`, `Líneas de 1 px, sólidas, en ${ic('chart.grid')}. Marcas redondas, compactas a partir de mil.`)],
          ]
            .map(([title, text], i) => `<li><span class="gb-anatomy__num">${i + 1}</span><div><p class="gb-anatomy__title">${title}</p><p class="gb-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('Todo gráfico de barras já sai assim. O que continua sendo seu: um título claro e um formato de número que faça sentido.', 'Every bar chart comes out like this. What’s still yours: a clear title and a number format that makes sense.', 'Todo gráfico de barras ya sale así. Lo que sigue siendo tuyo: un título claro y un formato de número que tenga sentido.'),
      a11yList([
        [L('Tabela sempre à mão', 'A table always at hand', 'Tabla siempre a mano'), L(`O botão no cabeçalho troca o gráfico por uma ${ic('&lt;table&gt;')} com todos os valores — inclusive os que o gráfico não rotula. O tooltip nunca é o único caminho até um número.`, `The button in the header swaps the chart for a ${ic('&lt;table&gt;')} with every value — including the ones the chart doesn’t label. The tooltip is never the only way to a number.`, `El botón del encabezado cambia el gráfico por una ${ic('&lt;table&gt;')} con todos los valores — incluso los que el gráfico no etiqueta. El tooltip nunca es el único camino hasta un número.`)],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab foca o gráfico; as setas percorrem as categorias; Home e End vão às pontas; Esc fecha o tooltip.', 'Tab focuses the chart; the arrows walk through the categories; Home and End go to the ends; Esc closes the tooltip.', 'Tab enfoca el gráfico; las flechas recorren las categorías; Home y End van a los extremos; Esc cierra el tooltip.'), ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        [L('Leitor de tela', 'Screen reader', 'Lector de pantalla'), L('O gráfico se anuncia com título, tipo e número de categorias. A cada seta, uma região ao vivo lê a categoria e o valor de cada série.', 'The chart announces itself with title, type, and number of categories. On each arrow press, a live region reads the category and each series’ value.', 'El gráfico se anuncia con título, tipo y número de categorías. Con cada flecha, una región en vivo lee la categoría y el valor de cada serie.')],
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L(`Com duas séries ou mais há legenda; posição e rótulos ajudam. Para daltonismo total, impressão e alto contraste, ligue ${ic('texture')}.`, `With two or more series there’s a legend; position and labels help. For total color blindness, print, and high contrast, turn on ${ic('texture')}.`, `Con dos series o más hay leyenda; posición y etiquetas ayudan. Para daltonismo total, impresión y alto contraste, activa ${ic('texture')}.`)],
        [L('Contraste verificado', 'Contrast checked', 'Contraste verificado'), L(`As 8 cores de série passam de 3:1 sobre a superfície nos três temas — a menor fica em ${minRatio}. A ordem das cores foi validada para protanopia e deuteranopia.`, `All 8 series colors pass 3:1 on the surface in all three themes — the lowest sits at ${minRatio}. The color order was validated for protanopia and deuteranopia.`, `Los 8 colores de serie superan 3:1 sobre la superficie en los tres temas — el menor queda en ${minRatio}. El orden de los colores se validó para protanopia y deuteranopia.`)],
        [L('Movimento', 'Motion', 'Movimiento'), L('As barras crescem uma vez, quando aparecem. Com movimento reduzido, nada anima.', 'The bars grow once, when they appear. With reduced motion, nothing animates.', 'Las barras crecen una vez, cuando aparecen. Con movimiento reducido, nada se anima.')],
      ]),
    )}

    ${section(
      'tokens',
      L('Tokens usados', 'Tokens used', 'Tokens usados'),
      L('Marcas usam as cores de gráfico; textos usam sempre os tokens de texto.', 'Marks use the chart colors; text always uses the text tokens.', 'Las marcas usan los colores de gráfico; los textos usan siempre los tokens de texto.'),
      tokenTable([
        ['color.chart.series.1', L('Série 1 (e a única, quando há uma)', 'Series 1 (and the only one, when there’s one)', 'Serie 1 (y la única, cuando hay una)')],
        ['color.chart.series.2', L('Série 2 — e assim até a 8', 'Series 2 — and so on up to 8', 'Serie 2 — y así hasta la 8')],
        ['color.chart.muted', L('Contexto em cinza (ênfase)', 'Gray context (emphasis)', 'Contexto en gris (énfasis)')],
        ['color.chart.div.2', L('Abaixo da referência', 'Below the reference', 'Por debajo de la referencia')],
        ['color.chart.div.6', L('Acima da referência', 'Above the reference', 'Por encima de la referencia')],
        ['color.chart.ord.5', L('Primeira etapa do funil', 'First funnel step', 'Primera etapa del embudo')],
        ['color.chart.ord.1', L('Última etapa do funil', 'Last funnel step', 'Última etapa del embudo')],
        ['color.chart.grid', L('Linhas de grade', 'Grid lines', 'Líneas de cuadrícula')],
        ['color.chart.axis', L('Linha de base', 'Baseline', 'Línea base')],
        ['color.fg.default', L('Rótulos de valor', 'Value labels', 'Etiquetas de valor')],
        ['color.fg.muted', L('Rótulos de categoria', 'Category labels', 'Etiquetas de categoría')],
        ['color.fg.subtle', L('Marcas do eixo', 'Axis ticks', 'Marcas del eje')],
        ['color.bg.hover', L('Faixa da categoria no hover', 'Category band on hover', 'Franja de la categoría con hover')],
        ['color.bg.raised', L('Fundo do tooltip', 'Tooltip background', 'Fondo del tooltip')],
        ['shadow.md', L('Sombra do tooltip', 'Tooltip shadow', 'Sombra del tooltip')],
        ['color.border.focus', L('Anel de foco do gráfico', 'Chart focus ring', 'Anillo de foco del gráfico')],
      ]),
    )}

    ${section(
      'uso',
      L('Uso', 'Usage', 'Uso'),
      L('Barras comparam comprimento. Quase todo erro vem de esquecer isso.', 'Bars compare length. Almost every mistake comes from forgetting that.', 'Las barras comparan longitud. Casi todo error viene de olvidarlo.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: comece do zero', 'Do: start at zero', 'Haz: empieza en cero')}</p>
          <div class="gb-usage__preview">${miniBars([62, 64, 66, 63], { labels: ['0', ''] })}</div>
          <p class="usage-card__text">${L('O comprimento da barra é o valor. Com a base no zero, 66 parece um pouco maior que 62 — porque é.', 'The bar’s length is the value. With the base at zero, 66 looks a little bigger than 62 — because it is.', 'La longitud de la barra es el valor. Con la base en cero, 66 parece un poco mayor que 62 — porque lo es.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: eixo cortado', 'Avoid: a truncated axis', 'Evita: eje cortado')}</p>
          <div class="gb-usage__preview">${miniBars([62, 64, 66, 63], { base: 60, labels: ['60', ''] })}</div>
          <p class="usage-card__text">${L('Começar em 60 faz 6% de diferença parecer o triplo. Se a variação pequena é a história, use uma linha.', 'Starting at 60 makes a 6% difference look three times bigger. If the small change is the story, use a line.', 'Empezar en 60 hace que un 6% de diferencia parezca el triple. Si la variación pequeña es la historia, usa una línea.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Nomes longos? Deite as barras', 'Long names? Lay the bars down', '¿Nombres largos? Acuesta las barras')}</p>
          <div class="gb-usage__preview">${miniHorizontal([tm[2], tm[4], tm[5]])}</div>
          <p class="usage-card__text">${L('Na horizontal o rótulo cabe inteiro, sem girar texto, e o ranking se lê de cima para baixo.', 'Horizontally the label fits whole, without rotating text, and the ranking reads top to bottom.', 'En horizontal la etiqueta cabe entera, sin girar texto, y el ranking se lee de arriba abajo.')}</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: uma série, uma cor', 'Do: one series, one color', 'Haz: una serie, un color')}</p>
          <div class="gb-usage__preview">${miniBars([48, 41, 33, 27, 19])}</div>
          <p class="usage-card__text">${L('Times, produtos e regiões não têm ordem. Todas as barras na cor do slot 1; o comprimento já diz quem é maior.', 'Teams, products, and regions have no order. All bars in slot 1’s color; length already says who’s bigger.', 'Equipos, productos y regiones no tienen orden. Todas las barras en el color del slot 1; la longitud ya dice quién es mayor.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: pintar cada barra', 'Avoid: coloring each bar', 'Evita: pintar cada barra')}</p>
          <div class="gb-usage__preview">${miniBars([48, 41, 33, 27, 19], { colors: RAINBOW })}</div>
          <p class="usage-card__text">${L('Cores diferentes prometem séries diferentes. Para categorias nominais, isso é ruído — e gasta as cores de que você vai precisar.', 'Different colors promise different series. For nominal categories, that’s noise — and it uses up colors you’ll need.', 'Colores distintos prometen series distintas. Para categorías nominales, eso es ruido — y gasta los colores que vas a necesitar.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Mais de 4 séries', 'More than 4 series', 'Más de 4 series')}</p>
          <div class="gb-usage__preview gb-usage__preview--text">
            <span class="ds-badge ds-badge--neutral">${L('Empilhe', 'Stack', 'Apila')}</span><span class="ds-badge ds-badge--neutral">${L('Agrupe em “Outros”', 'Group into “Others”', 'Agrupa en “Otros”')}</span><span class="ds-badge ds-badge--neutral">${L('Pequenos múltiplos', 'Small multiples', 'Pequeños múltiplos')}</span>
          </div>
          <p class="usage-card__text">${L('Agrupadas com 5 séries ou mais viram um pente ilegível. Empilhe, junte a cauda em “Outros” ou divida em vários gráficos pequenos.', 'Grouped bars with 5 or more series turn into an illegible comb. Stack, gather the tail into “Others”, or split into several small charts.', 'Agrupadas con 5 series o más se vuelven un peine ilegible. Apila, junta la cola en “Otros” o divide en varios gráficos pequeños.')}</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      L(`Uma chamada monta o gráfico; ${ic('update()')} troca os dados sem recriar a moldura.`, `One call mounts the chart; ${ic('update()')} swaps the data without recreating the frame.`, `Una llamada monta el gráfico; ${ic('update()')} cambia los datos sin recrear el marco.`),
      `<div class="doc-table gb-api">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Opção', 'Option', 'Opción')}</span><span>${L('Valores', 'Values', 'Valores')}</span><span>${L('Padrão', 'Default', 'Predeterminado')}</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
        ${API().map(
          ([name, values, def, text]) => `<div class="doc-table__row">
            <code class="gb-api__name">${name}</code>
            <span class="gb-api__values">${values}</span>
            <span class="gb-api__default">${def}</span>
            <span class="gb-api__text">${text}</span>
          </div>`,
        ).join('')}
      </div>
      <div class="gb-api__code">${codeBlock(`const chart = barChart(el, { title: '${L('Vendas', 'Sales', 'Ventas')}', categories, series });\n\nchart.update({ series: ${L('novasSeries', 'nextSeries', 'nuevasSeries')} });   // ${L('redesenha mantendo legenda e tabela', 'redraws keeping legend and table', 'redibuja manteniendo leyenda y tabla')}\nchart.setLoading(true);                   // ${L('meia opacidade enquanto busca', 'half opacity while fetching', 'media opacidad mientras busca')}\nchart.destroy();                          // ${L('remove tudo e os observadores', 'removes everything and the observers', 'quita todo y los observadores')}`)}</div>`,
    )}
  </div>`;
}

/* ───────── Anatomia (desenho estático, medidas reais) ───────── */

function anatomySvg() {
  const base = 196;
  const bar = (x, h, cls = '') => `<path class="gb-anat__bar ${cls}" d="M${x} ${base}V${base - h + 4}A4 4 0 0 1 ${x + 4} ${base - h}H${x + 20}A4 4 0 0 1 ${x + 24} ${base - h + 4}V${base}Z"/>`;
  const groups = [
    [92, [96, 70]],
    [196, [130, 104]],
    [300, [112, 84]],
    [404, [150, 120]],
  ];
  const bars = groups.map(([x, [a, b]]) => bar(x, a) + bar(x + 26, b, 'gb-anat__bar--2')).join('');
  const grid = [46, 96, 146].map((y) => `<line x1="56" x2="500" y1="${y + 0.5}" y2="${y + 0.5}" class="gb-anat__grid"/>`).join('');
  const ticks = [
    [base, '0'],
    [146, '20'],
    [96, '40'],
    [46, '60'],
  ]
    .map(([y, t]) => `<text x="46" y="${y + 4}" class="gb-anat__tick" text-anchor="end">${t}</text>`)
    .join('');
  const num = (n, x, y) => `<g class="gb-anat__callout"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 4}" text-anchor="middle">${n}</text></g>`;
  return `<svg viewBox="0 0 540 240" class="gb-anat">
    ${grid}${ticks}
    <line x1="56" x2="500" y1="${base + 0.5}" y2="${base + 0.5}" class="gb-anat__base"/>
    ${bars}
    <text x="416" y="${base - 158}" class="gb-anat__value" text-anchor="middle">58</text>
    <!-- medidas -->
    <path class="gb-anat__dim" d="M404 ${base + 14}h24M404 ${base + 10}v8M428 ${base + 10}v8"/>
    <text x="416" y="${base + 32}" class="gb-anat__dim-text" text-anchor="middle">24</text>
    <path class="gb-anat__dim" d="M428.5 ${base - 132}v10M429.5 ${base - 132}v10"/>
    <text x="436" y="${base - 124}" class="gb-anat__dim-text">2</text>
    <circle cx="200" cy="${base - 126}" r="8" class="gb-anat__ring"/>
    ${num(1, 520, base)}
    ${num(2, 104, base - 114)}
    ${num(3, 200, base - 154)}
    ${num(4, 476, base - 128)}
    ${num(5, 380, base - 166)}
    ${num(6, 18, 96)}
  </svg>`;
}

/* ───────── Montagem ───────── */

export function mount(root) {
  const charts = [];

  const unmountPlayground = mountPlayground(root, {
    id: 'graficos-barras',
    controls: [
      { id: 'orientation', label: L('Orientação', 'Orientation', 'Orientación'), value: 'vertical', options: ORIENTATIONS().map(([value, label]) => ({ value, label })) },
      { id: 'layout', label: 'Layout', value: 'grouped', options: LAYOUTS().map(([value, label]) => ({ value, label })) },
      { id: 'series', label: L('Séries', 'Series', 'Series'), value: '3', options: ['1', '2', '3', '4'].map((value) => ({ value, label: value })) },
      { id: 'labels', label: L('Rótulos', 'Labels', 'Etiquetas'), value: 'none', options: LABELS().map(([value, label]) => ({ value, label })) },
      { id: 'highlight', label: L('Destaque', 'Highlight', 'Destacado'), value: 'none', options: [{ value: 'none', label: L('Nenhum', 'None', 'Ninguno') }, { value: 'one', label: monthName(5) }] },
    ],
    render: () => '<div class="gb-play" data-chart></div>',
    mount: (preview, state) => {
      const chart = barChart(preview.querySelector('[data-chart]'), playOptions(state));
      return () => chart.destroy();
    },
    code: playCode,
  });

  for (const v of VARIANTS()) {
    charts.push(barChart(root.querySelector(`[data-variant="${v.id}"]`), { height: 240, ...v.options }));
  }

  // Estados: os dois primeiros começam aplicados, como um data-state.
  const stateEl = (id) => root.querySelector(`[data-state-chart="${id}"]`);
  const ch = channels();
  const hover = barChart(stateEl('hover'), { title: salesByChannel(), categories: ch.categories, series: ch.series.slice(0, 2), height: 220 });
  const hidden = barChart(stateEl('escondida'), { title: salesByChannel(), categories: ch.categories, series: ch.series.slice(0, 3), height: 220 });
  const loading = barChart(stateEl('carregando'), { title: L('Receita por mês', 'Revenue by month', 'Ingresos por mes'), categories: months().slice(6), series: [{ name: revenueLabel(), values: revenue[2026].slice(6) }], format: 'currency', height: 220 });
  const empty = barChart(stateEl('vazio'), { title: L('Vendas na semana', 'Sales this week', 'Ventas de la semana'), categories: [], series: [], height: 220, empty: L('Nenhuma venda neste período.', 'No sales in this period.', 'Ninguna venta en este período.') });
  charts.push(hover, hidden, loading, empty);

  const timers = [];
  timers.push(
    setTimeout(() => {
      const plot = hover.el.querySelector('[data-plot]');
      const svg = plot.querySelector('svg');
      if (!svg) return;
      const r = plot.getBoundingClientRect();
      plot.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + r.width * 0.58, clientY: r.top + r.height / 2, bubbles: true }));
    }, 60),
  );
  hidden.el.querySelectorAll('.ds-chart__legend-item')[1]?.click();
  loading.setLoading(true);

  // Recarregar: mantém o desenho anterior enquanto "busca" e troca os dados no fim.
  let flip = false;
  const reloadBtn = root.querySelector('[data-reload]');
  const onReload = () => {
    loading.setLoading(true);
    reloadBtn.disabled = true;
    timers.push(
      setTimeout(() => {
        flip = !flip;
        loading.update({ series: [{ name: revenueLabel(), values: (flip ? revenue[2025] : revenue[2026]).slice(6) }] });
        loading.setLoading(false);
        reloadBtn.disabled = false;
      }, 1200),
    );
  };
  reloadBtn?.addEventListener('click', onReload);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    timers.forEach(clearTimeout);
    reloadBtn?.removeEventListener('click', onReload);
    unmountPlayground();
    charts.forEach((c) => c.destroy());
    unmountCopy();
    unmountNav();
  };
}
