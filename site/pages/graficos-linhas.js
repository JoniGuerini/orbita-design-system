import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { lineChart } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { months, revenue, activeUsers } from '../chart-data.js';
import { L, ratio } from '../i18n.js';
import { perTheme } from '../themes.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-linhas.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const lerp = (a, b, t) => a + (b - a) * t;
const SHARES = () => [
  ['App', 0.48, 0.6],
  [L('Site', 'Website', 'Sitio web'), 0.3, 0.22],
  [L('Loja', 'Store', 'Tienda'), 0.15, 0.12],
  [L('Parceiros', 'Partners', 'Socios'), 0.07, 0.06],
];
const byChannel = (totals) =>
  SHARES().map(([name, from, to]) => ({ name, values: totals.map((v, i) => Math.round(v * lerp(from, to, i / (totals.length - 1)))) }));

const channels2026 = () => byChannel(activeUsers[2026]);
const channels2025 = () => byChannel(activeUsers[2025]);
const index100 = (vals) => vals.map((v) => Math.round((v / vals[0]) * 100));

const minContrast = (mode) => ratio(Math.min(...contrast.filter((c) => c.fg.startsWith('color.chart.series') && c.mode === mode).map((c) => c.ratio)));

const revenueLabel = () => L('Receita', 'Revenue', 'Ingresos');
const activeLabel = () => L('Usuários ativos', 'Active users', 'Usuarios activos');
const activeByChannel = () => L('Usuários ativos por canal', 'Active users by channel', 'Usuarios activos por canal');
const byMonth2026 = () => L('Por mês · 2026', 'By month · 2026', 'Por mes · 2026');
const goal = () => L('Meta', 'Goal', 'Meta');

/* ───────── Playground ───────── */

const TYPES = () => [
  ['line', L('Linha', 'Line', 'Línea')],
  ['area', L('Área', 'Area', 'Área')],
  ['stacked', L('Áreas empilhadas', 'Stacked areas', 'Áreas apiladas')],
];

function playgroundOptions(state) {
  const count = +state.series;
  const single = count === 1;
  const series = single ? [{ name: activeLabel(), values: activeUsers[2026] }] : channels2026().slice(0, count).map((s) => ({ ...s }));
  if (state.compare === 'on' && state.type !== 'stacked') {
    const prev = channels2025()[0];
    series.push(single ? { name: '2025', values: activeUsers[2025], muted: true } : { name: `${prev.name} · 2025`, values: prev.values, muted: true });
  }
  const options = {
    title: single ? activeLabel() : activeByChannel(),
    subtitle: byMonth2026(),
    categories: months(),
    series,
    format: 'integer',
  };
  if (state.type === 'area') options.area = true;
  if (state.type === 'stacked') options.stacked = true;
  if (state.curve === 'smooth') options.curve = 'smooth';
  if (state.markers !== 'end') options.markers = state.markers;
  if (state.target === 'on') options.target = { value: single || state.type === 'stacked' ? 35000 : 20000, label: goal() };
  return options;
}

const list = (vals) => `[${vals.join(', ')}]`;

function playgroundCode(state) {
  const o = playgroundOptions(state);
  const series = o.series
    .map((s) => `    { name: '${s.name}', values: ${list(s.values)}${s.muted ? ', muted: true' : ''} },`)
    .join('\n');
  const extra = [
    o.area && '  area: true,',
    o.stacked && '  stacked: true,',
    o.curve && `  curve: '${o.curve}',`,
    o.markers && `  markers: '${o.markers}',`,
    o.target && `  target: { value: ${o.target.value}, label: '${o.target.label}' },`,
  ]
    .filter(Boolean)
    .join('\n');
  return `import { lineChart } from './ds/js/charts.js';

const chart = lineChart(document.querySelector('#${L('usuarios', 'users', 'usuarios')}'), {
  title: '${o.title}',
  subtitle: '${o.subtitle}',
  categories: ${list(o.categories.map((m) => `'${m}'`))},
  series: [
${series}
  ],
${extra ? `${extra}\n` : ''}  format: 'integer',
});`;
}

/* ───────── Variantes ───────── */

const withGaps = revenue[2026].map((v, i) => (i === 3 || i === 4 ? null : v));

const VARIANTS = () => {
  const m = months();
  const ch = channels2026();
  return [
    {
      id: 'unica',
      name: L('Linha única', 'Single line', 'Línea única'),
      code: L('1 série', '1 series', '1 serie'),
      text: L('Uma série não precisa de legenda: o título diz o que é, e o último valor fica escrito no fim da linha.', 'A single series needs no legend: the title says what it is, and the last value is written at the end of the line.', 'Una serie no necesita leyenda: el título dice qué es, y el último valor queda escrito al final de la línea.'),
      options: { title: revenueLabel(), subtitle: byMonth2026(), categories: m, series: [{ name: revenueLabel(), values: revenue[2026] }], format: 'currency-compact' },
    },
    {
      id: 'varias',
      name: L('Várias séries', 'Several series', 'Varias series'),
      code: 'endLabels',
      text: L('Até quatro linhas ganham o nome no fim — quando cabem sem colidir. Se as linhas se encontram ali, ficam a legenda e o tooltip.', 'Up to four lines get their name at the end — when it fits without colliding. If the lines meet there, the legend and tooltip remain.', 'Hasta cuatro líneas reciben el nombre al final — cuando caben sin chocar. Si las líneas se encuentran ahí, quedan la leyenda y el tooltip.'),
      options: { title: activeByChannel(), subtitle: byMonth2026(), categories: m, series: ch.slice(0, 3), format: 'integer' },
    },
    {
      id: 'comparacao',
      name: L('Contra o período anterior', 'Against the previous period', 'Contra el período anterior'),
      code: 'muted: true',
      text: L('O ano passado entra em cinza, por baixo: é contexto, não protagonista. Continua nomeado na legenda e no tooltip.', 'Last year goes in gray, underneath: it’s context, not the lead. It stays named in the legend and tooltip.', 'El año pasado entra en gris, por debajo: es contexto, no protagonista. Sigue nombrado en la leyenda y en el tooltip.'),
      options: { title: activeLabel(), subtitle: L('2026 contra 2025', '2026 vs. 2025', '2026 contra 2025'), categories: m, series: [{ name: '2026', values: activeUsers[2026] }, { name: '2025', values: activeUsers[2025], muted: true }], format: 'integer' },
    },
    {
      id: 'enfase',
      name: L('Ênfase', 'Emphasis', 'Énfasis'),
      code: 'highlight: 0',
      text: L('Quando a história é uma série, ela fica na cor e as outras viram cinza. Mais claro que quatro cores disputando o olho.', 'When the story is one series, it keeps the color and the others turn gray. Clearer than four colors fighting for the eye.', 'Cuando la historia es una serie, queda en color y las demás se vuelven gris. Más claro que cuatro colores disputando la mirada.'),
      options: { title: L('O App puxa o crescimento', 'The App drives growth', 'La App impulsa el crecimiento'), subtitle: activeByChannel(), categories: m, series: ch, highlight: 0, format: 'integer' },
    },
    {
      id: 'area',
      name: L('Área', 'Area', 'Área'),
      code: 'area: true',
      text: L('Para uma série só, quando o volume importa. A área é uma lavagem de 10% da cor — a linha continua mandando.', 'For a single series, when volume matters. The area is a 10% wash of the color — the line stays in charge.', 'Para una sola serie, cuando el volumen importa. El área es un lavado del 10% del color — la línea sigue mandando.'),
      options: { title: activeLabel(), subtitle: byMonth2026(), categories: m, series: [{ name: activeLabel(), values: activeUsers[2026] }], area: true, curve: 'smooth', format: 'integer' },
    },
    {
      id: 'empilhadas',
      name: L('Áreas empilhadas', 'Stacked areas', 'Áreas apiladas'),
      code: 'stacked: true',
      text: L('Partes que somam um total no tempo. A borda de cada faixa é a linha; o total aparece no tooltip.', 'Parts that add up to a total over time. Each band’s edge is the line; the total shows in the tooltip.', 'Partes que suman un total en el tiempo. El borde de cada franja es la línea; el total aparece en el tooltip.'),
      options: { title: activeByChannel(), subtitle: L('Soma dos canais · 2026', 'Sum of channels · 2026', 'Suma de los canales · 2026'), categories: m, series: ch.slice(0, 3), stacked: true, format: 'integer' },
    },
    {
      id: 'meta',
      name: L('Com meta', 'With a goal', 'Con meta'),
      code: 'target',
      text: L('A meta é a única linha tracejada do sistema — tracejado quer dizer referência, nunca grade.', 'The goal is the only dashed line in the system — dashes mean reference, never grid.', 'La meta es la única línea discontinua del sistema — discontinua quiere decir referencia, nunca cuadrícula.'),
      options: { title: revenueLabel(), subtitle: byMonth2026(), categories: m, series: [{ name: revenueLabel(), values: revenue[2026] }], target: { value: 140000, label: goal() }, format: 'currency-compact' },
    },
    {
      id: 'lacunas',
      name: L('Com lacunas', 'With gaps', 'Con huecos'),
      code: 'null',
      text: L('Sem dado em abril e maio: a linha quebra em vez de inventar uma ponte. No tooltip e na tabela, aparece “—”.', 'No data in April and May: the line breaks instead of inventing a bridge. In the tooltip and table, “—” shows.', 'Sin dato en abril y mayo: la línea se corta en vez de inventar un puente. En el tooltip y en la tabla, aparece “—”.'),
      options: { title: revenueLabel(), subtitle: L('Abril e maio sem fechamento', 'April and May not closed', 'Abril y mayo sin cierre'), categories: m, series: [{ name: revenueLabel(), values: withGaps }], markers: 'all', format: 'currency-compact' },
    },
  ];
};

/* ───────── API ───────── */

const API = () => [
  ['categories', 'string[]', '—', L('Rótulos do eixo x, em ordem.', 'X-axis labels, in order.', 'Etiquetas del eje x, en orden.')],
  ['series', '{ name, values, color?, muted? }[]', '—', L(`Uma entrada por linha. ${ic('null')} em values quebra a linha. Sem ${ic('color')}, a série usa o slot da sua posição.`, `One entry per line. ${ic('null')} in values breaks the line. Without ${ic('color')}, the series uses the slot for its position.`, `Una entrada por línea. ${ic('null')} en values corta la línea. Sin ${ic('color')}, la serie usa el slot de su posición.`)],
  ['area', 'boolean', 'false', L('Lavagem de 10% sob a linha.', 'A 10% wash under the line.', 'Lavado del 10% bajo la línea.')],
  ['stacked', 'boolean', 'false', L('Faixas somadas; o tooltip mostra o total.', 'Summed bands; the tooltip shows the total.', 'Franjas sumadas; el tooltip muestra el total.')],
  ['curve', "'linear' | 'smooth'", "'linear'", L('Suave é monotônica: não cria picos que não existem.', 'Smooth is monotone: it doesn’t create peaks that don’t exist.', 'Suave es monótona: no crea picos que no existen.')],
  ['markers', "'end' | 'all' | 'none'", "'end'", L(`Pontos de 8 px com anel de 2 px. ${ic('all')} só até 40 pontos.`, `8 px dots with a 2 px ring. ${ic('all')} only up to 40 points.`, `Puntos de 8 px con anillo de 2 px. ${ic('all')} solo hasta 40 puntos.`)],
  ['endLabels', 'boolean', 'true', L('Nome (ou valor, com uma série) no fim da linha, se couber sem colidir.', 'Name (or value, with one series) at the end of the line, if it fits without colliding.', 'Nombre (o valor, con una serie) al final de la línea, si cabe sin chocar.')],
  ['highlight', 'number', '—', L('Índice da série em destaque; as outras ficam em cinza.', 'Index of the highlighted series; the others go gray.', 'Índice de la serie destacada; las demás quedan en gris.')],
  ['target', '{ value, label }', '—', L('Linha de referência tracejada.', 'Dashed reference line.', 'Línea de referencia discontinua.')],
  ['zero', 'boolean', 'true', L('O eixo começa no zero. Áreas sempre começam.', 'The axis starts at zero. Areas always do.', 'El eje empieza en cero. Las áreas siempre empiezan.')],
  ['format · axisFormat', L('preset | Intl | função', 'preset | Intl | function', 'preset | Intl | función'), "'number'", L('Valores no tooltip e na tabela; o eixo compacta a partir de mil.', 'Values in the tooltip and table; the axis compacts from a thousand.', 'Valores en el tooltip y en la tabla; el eje se compacta a partir de mil.')],
  ['height', 'number', '280', L('Altura total, já com a faixa do eixo x.', 'Total height, including the x-axis band.', 'Altura total, ya con la franja del eje x.')],
  ['title · subtitle · label', 'string', '—', L('Título visível ou, sem ele, o nome acessível do gráfico.', 'Visible title or, without it, the chart’s accessible name.', 'Título visible o, sin él, el nombre accesible del gráfico.')],
  ['card · table · tooltipLabels', 'boolean · boolean · string[]', 'false · true · —', L('Superfície com contorno, botão de tabela e rótulos longos para o tooltip.', 'Outlined surface, table button, and long labels for the tooltip.', 'Superficie con contorno, botón de tabla y etiquetas largas para el tooltip.')],
];

const METHODS = () => [
  ['update(options)', L('Mescla as opções e redesenha. Séries escondidas na legenda continuam escondidas.', 'Merges the options and redraws. Series hidden in the legend stay hidden.', 'Combina las opciones y redibuja. Las series ocultas en la leyenda siguen ocultas.')],
  ['setLoading(bool)', L('Mantém o desenho anterior a 45% enquanto os dados chegam — sem esqueleto, sem pulo.', 'Keeps the previous drawing at 45% while data arrives — no skeleton, no jump.', 'Mantiene el dibujo anterior al 45% mientras llegan los datos — sin esqueleto, sin saltos.')],
  ['destroy()', L('Desliga observadores e eventos e limpa o contêiner.', 'Disconnects observers and events and clears the container.', 'Desconecta observadores y eventos y limpia el contenedor.')],
];

function apiTable() {
  return `<div class="doc-table gl-api">
    <div class="doc-table__head" aria-hidden="true"><span>${L('Opção', 'Option', 'Opción')}</span><span>${L('Tipo', 'Type', 'Tipo')}</span><span>${L('Padrão', 'Default', 'Predeterminado')}</span><span>${L('Para quê', 'What for', 'Para qué')}</span></div>
    ${API().map(
      ([name, type, def, text]) => `<div class="doc-table__row">
        <span><code class="ds-inline-code">${name}</code></span>
        <span class="gl-api__type">${type}</span>
        <span class="gl-api__type">${def}</span>
        <span class="gl-api__text">${text}</span>
      </div>`,
    ).join('')}
  </div>
  <div class="doc-table gl-api gl-api--methods">
    <div class="doc-table__head" aria-hidden="true"><span>${L('Método', 'Method', 'Método')}</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
    ${METHODS().map(([name, text]) => `<div class="doc-table__row"><span><code class="ds-inline-code">${name}</code></span><span class="gl-api__text">${text}</span></div>`).join('')}
  </div>`;
}

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

export default function renderLinhas(page) {
  const variants = VARIANTS();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Para mostrar como algo muda no tempo. Traço de 2 px, um eixo só, a mira encontra o mês e o nome fica no fim da linha — sem caixa de legenda para decifrar.', 'To show how something changes over time. A 2 px stroke, a single axis, the crosshair finds the month, and the name sits at the end of the line — no legend box to decipher.', 'Para mostrar cómo cambia algo en el tiempo. Trazo de 2 px, un solo eje, la mira encuentra el mes y el nombre queda al final de la línea — sin caja de leyenda que descifrar.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('variantes', 'variants', 'variantes')}</dt><dd class="doc-stat__value">${variants.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('traço', 'stroke', 'trazo')}</dt><dd class="doc-stat__value">2 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('nomes no fim', 'end labels', 'nombres al final')}</dt><dd class="doc-stat__value">${L('até 4', 'up to 4', 'hasta 4')}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('eixo y', 'y axis', 'eje y')}</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['variantes', L('Variantes', 'Variants', 'Variantes')],
        ['mira', L('Mira e tooltip', 'Crosshair and tooltip', 'Mira y tooltip')],
        ['um-eixo', L('Um eixo só', 'A single axis', 'Un solo eje')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', L('Troque o tipo, as séries e os detalhes. O gráfico segue o tema do palco e o código acompanha.', 'Change the type, the series, and the details. The chart follows the stage theme and the code follows along.', 'Cambia el tipo, las series y los detalles. El gráfico sigue el tema del escenario y el código acompaña.'), playgroundMarkup('linhas', { wide: true }))}

    ${section(
      'variantes',
      L('Variantes', 'Variants', 'Variantes'),
      L('O mesmo componente cobre as perguntas mais comuns sobre o tempo. Passe o mouse em qualquer uma.', 'The same component covers the most common questions about time. Hover any of them.', 'El mismo componente cubre las preguntas más comunes sobre el tiempo. Pasa el mouse por cualquiera.'),
      `<div class="gl-grid">
        ${variants.map(
          (v) => `<article class="gl-card">
            <div class="gl-card__chart" data-variant="${v.id}"></div>
            <div class="gl-card__body">
              <p class="cd-example__name">${v.name}<code>${v.code}</code></p>
              <p class="cd-example__text">${v.text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'mira',
      L('Mira e tooltip', 'Crosshair and tooltip', 'Mira y tooltip'),
      L('Ninguém mira numa linha de 2 px. A mira vertical acha o mês mais próximo e um único tooltip mostra todas as séries ali.', 'No one aims at a 2 px line. The vertical crosshair finds the closest month and a single tooltip shows every series there.', 'Nadie apunta a una línea de 2 px. La mira vertical encuentra el mes más cercano y un único tooltip muestra todas las series ahí.'),
      `<div class="gl-split">
        <div class="gl-card gl-card--flush"><div class="gl-card__chart" data-crosshair></div></div>
        <ul class="gl-points" role="list">
          <li>${icon('target', { size: 18 })}<div><p class="gl-points__title">${L('Encontra o x, não a linha', 'Finds the x, not the line', 'Encuentra la x, no la línea')}</p><p class="gl-points__text">${L('A mira se prende ao ponto de dados mais perto do ponteiro, em qualquer altura da área.', 'The crosshair snaps to the data point closest to the pointer, at any height in the area.', 'La mira se engancha al punto de datos más cercano al puntero, a cualquier altura del área.')}</p></div></li>
          <li>${icon('list', { size: 18 })}<div><p class="gl-points__title">${L('Um tooltip, todas as séries', 'One tooltip, every series', 'Un tooltip, todas las series')}</p><p class="gl-points__text">${L('A leitura lista cada série visível naquele mês, na ordem da legenda.', 'The readout lists each visible series in that month, in legend order.', 'La lectura lista cada serie visible en ese mes, en el orden de la leyenda.')}</p></div></li>
          <li>${icon('type', { size: 18 })}<div><p class="gl-points__title">${L('Valor primeiro, nome depois', 'Value first, name after', 'Valor primero, nombre después')}</p><p class="gl-points__text">${L('Quem olha já sabe a série; quer o número. Ele vem forte, o nome vem apagado, com um traço da cor como chave.', 'The reader already knows the series; they want the number. It comes strong, the name comes muted, with a stroke of color as the key.', 'Quien mira ya conoce la serie; quiere el número. Viene fuerte, el nombre viene atenuado, con un trazo del color como clave.')}</p></div></li>
          <li>${icon('input', { size: 18 })}<div><p class="gl-points__title">${L('O mesmo no teclado', 'The same on the keyboard', 'Lo mismo con el teclado')}</p><p class="gl-points__text">${L('Tab foca o gráfico, as setas andam pelos meses e o valor é lido por leitores de tela.', 'Tab focuses the chart, the arrows walk through the months, and screen readers read the value.', 'Tab enfoca el gráfico, las flechas recorren los meses y los lectores de pantalla leen el valor.')}</p></div></li>
        </ul>
      </div>`,
    )}

    ${section(
      'um-eixo',
      L('Um eixo só', 'A single axis', 'Un solo eje'),
      L('Nada de dois eixos y. Duas grandezas de escalas diferentes viram um índice comum ou dois gráficos alinhados.', 'No dual y-axes. Two quantities on different scales become a common index or two aligned charts.', 'Nada de dos ejes y. Dos magnitudes de escalas distintas se vuelven un índice común o dos gráficos alineados.'),
      `<div class="gl-why">
        <span class="gl-why__icon">${icon('alert-triangle', { size: 18 })}</span>
        <p>${L('Com dois eixos, a escala de cada lado é escolhida à mão. O ponto em que as linhas se cruzam — e a impressão de que andam juntas — passa a ser decisão de quem montou o gráfico, não dos dados.', 'With two axes, the scale on each side is picked by hand. Where the lines cross — and the impression that they move together — becomes the chart maker’s decision, not the data’s.', 'Con dos ejes, la escala de cada lado se elige a mano. El punto donde se cruzan las líneas — y la impresión de que van juntas — pasa a ser decisión de quien armó el gráfico, no de los datos.')}</p>
      </div>
      <div class="gl-grid">
        <article class="gl-card">
          <div class="gl-card__chart" data-axis="indice"></div>
          <div class="gl-card__body">
            <p class="cd-example__name">${L('Índice com base 100', 'Index based at 100', 'Índice con base 100')}<code>zero: false</code></p>
            <p class="cd-example__text">${L('As duas medidas partem de 100 em janeiro. Agora dá para comparar o ritmo: usuários cresceram mais que a receita.', 'Both measures start at 100 in January. Now you can compare the pace: users grew faster than revenue.', 'Las dos medidas parten de 100 en enero. Ahora se puede comparar el ritmo: los usuarios crecieron más que los ingresos.')}</p>
          </div>
        </article>
        <article class="gl-card">
          <div class="gl-card__chart gl-card__chart--stack">
            <div data-axis="usuarios"></div>
            <div data-axis="receita"></div>
          </div>
          <div class="gl-card__body">
            <p class="cd-example__name">${L('Dois gráficos, mesmo eixo x', 'Two charts, same x-axis', 'Dos gráficos, mismo eje x')}<code>${L('pequenos múltiplos', 'small multiples', 'pequeños múltiplos')}</code></p>
            <p class="cd-example__text">${L('Cada medida na sua escala, um gráfico embaixo do outro, com os meses alinhados.', 'Each measure on its own scale, one chart below the other, with the months aligned.', 'Cada medida en su escala, un gráfico debajo del otro, con los meses alineados.')}</p>
          </div>
        </article>
      </div>`,
    )}

    ${section(
      'acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('O gráfico já nasce com teclado, tabela e nomes. Estas são as decisões que continuam sendo suas.', 'The chart is born with keyboard, table, and names. These are the decisions that are still yours.', 'El gráfico ya nace con teclado, tabla y nombres. Estas son las decisiones que siguen siendo tuyas.'),
      a11yList([
        [L('Tabela sempre à mão', 'A table always at hand', 'Tabla siempre a mano'), L('O botão de tabela no cabeçalho troca o desenho pelos números — todos, inclusive os que o gráfico não rotula. O tooltip nunca é o único caminho até um valor.', 'The table button in the header swaps the drawing for the numbers — all of them, including the ones the chart doesn’t label. The tooltip is never the only way to a value.', 'El botón de tabla del encabezado cambia el dibujo por los números — todos, incluso los que el gráfico no etiqueta. El tooltip nunca es el único camino hasta un valor.')],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab foca o gráfico; as setas andam pelos pontos, Home e End vão às pontas e Esc fecha o tooltip.', 'Tab focuses the chart; the arrows walk through the points, Home and End go to the ends, and Esc closes the tooltip.', 'Tab enfoca el gráfico; las flechas recorren los puntos, Home y End van a los extremos y Esc cierra el tooltip.'), ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        [L('Leitor de tela', 'Screen reader', 'Lector de pantalla'), L('O gráfico tem nome e resumo (tipo, pontos e séries). Cada ponto visitado pelo teclado é anunciado numa região ao vivo.', 'The chart has a name and a summary (type, points, and series). Each point visited by keyboard is announced in a live region.', 'El gráfico tiene nombre y resumen (tipo, puntos y series). Cada punto visitado con el teclado se anuncia en una región en vivo.')],
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L('Com duas séries ou mais, sempre há legenda — e nomes no fim da linha quando cabem. A série de contexto é cinza e continua nomeada.', 'With two or more series, there’s always a legend — and names at the end of the line when they fit. The context series is gray and stays named.', 'Con dos series o más, siempre hay leyenda — y nombres al final de la línea cuando caben. La serie de contexto es gris y sigue nombrada.')],
        [L('Contraste verificado', 'Contrast checked', 'Contraste verificado'), L(`Toda cor de série passa de 3:1 contra a superfície — a menor é ${perTheme(minContrast)}. Textos usam tokens de texto, nunca a cor da série.`, `Every series color passes 3:1 against the surface — the lowest is ${perTheme(minContrast)}. Text uses text tokens, never the series color.`, `Todo color de serie supera 3:1 contra la superficie — el menor es ${perTheme(minContrast)}. Los textos usan tokens de texto, nunca el color de la serie.`)],
        [L('Movimento com moderação', 'Motion in moderation', 'Movimiento con moderación'), L(`A linha se desenha uma vez, quando aparece na tela, e não anima com ${ic('prefers-reduced-motion')}.`, `The line draws once, when it appears on screen, and doesn’t animate with ${ic('prefers-reduced-motion')}.`, `La línea se dibuja una vez, cuando aparece en pantalla, y no se anima con ${ic('prefers-reduced-motion')}.`)],
      ]),
    )}

    ${section(
      'tokens',
      L('Tokens usados', 'Tokens used', 'Tokens usados'),
      L('Marcas consomem as cores de gráfico; tudo o que é texto consome tokens de texto.', 'Marks consume the chart colors; everything that’s text consumes text tokens.', 'Las marcas consumen los colores de gráfico; todo lo que es texto consume tokens de texto.'),
      tokenTable([
        ['color.chart.series.1', L('Primeira série', 'First series', 'Primera serie')],
        ['color.chart.series.2', L('Segunda série', 'Second series', 'Segunda serie')],
        ['color.chart.series.3', L('Terceira série', 'Third series', 'Tercera serie')],
        ['color.chart.series.4', L('Quarta série', 'Fourth series', 'Cuarta serie')],
        ['color.chart.muted', L('Contexto e séries fora da ênfase', 'Context and non-emphasized series', 'Contexto y series fuera del énfasis')],
        ['color.chart.grid', L('Linhas de grade', 'Grid lines', 'Líneas de cuadrícula')],
        ['color.chart.axis', L('Linha de base e mira', 'Baseline and crosshair', 'Línea base y mira')],
        ['color.fg.subtle', L('Rótulos dos eixos e linha de meta', 'Axis labels and goal line', 'Etiquetas de los ejes y línea de meta')],
        ['color.fg.muted', L('Nome no fim da linha', 'Name at the end of the line', 'Nombre al final de la línea')],
        ['color.fg.default', L('Valor no fim da linha', 'Value at the end of the line', 'Valor al final de la línea')],
        ['color.bg.raised', L('Fundo do tooltip', 'Tooltip background', 'Fondo del tooltip')],
        ['color.border.focus', L('Foco do gráfico', 'Chart focus', 'Foco del gráfico')],
      ]),
    )}

    ${section(
      'uso',
      L('Uso', 'Usage', 'Uso'),
      L('Escolha a linha quando a pergunta tem “quando” ou “desde”. Quatro cuidados resolvem quase tudo.', 'Choose a line when the question has “when” or “since”. Four precautions solve almost everything.', 'Elige la línea cuando la pregunta tiene “cuándo” o “desde”. Cuatro cuidados resuelven casi todo.'),
      `<div class="usage-grid gl-usage">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: tempo no eixo x', 'Do: time on the x-axis', 'Haz: tiempo en el eje x')}</p>
          <p class="usage-card__text">${L('Linhas ligam pontos em sequência. Se a ordem não é tempo (ou outra sequência real), use barras.', 'Lines connect points in sequence. If the order isn’t time (or another real sequence), use bars.', 'Las líneas unen puntos en secuencia. Si el orden no es tiempo (u otra secuencia real), usa barras.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: dois eixos y', 'Avoid: dual y-axes', 'Evita: dos ejes y')}</p>
          <p class="usage-card__text">${L('Cria correlação que não existe. Indexe as duas medidas na mesma base ou faça dois gráficos.', 'It creates a correlation that doesn’t exist. Index both measures to the same base or make two charts.', 'Crea una correlación que no existe. Indexa las dos medidas en la misma base o haz dos gráficos.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Mais de 4 séries?', 'More than 4 series?', '¿Más de 4 series?')}</p>
          <p class="usage-card__text">${L('Destaque a que importa e deixe o resto em cinza, agrupe a cauda em “Outros” ou separe em pequenos múltiplos. Nunca invente uma 9ª cor.', 'Highlight the one that matters and leave the rest gray, group the tail into “Others”, or split into small multiples. Never invent a 9th color.', 'Destaca la que importa y deja el resto en gris, agrupa la cola en “Otros” o separa en pequeños múltiplos. Nunca inventes un 9.º color.')}</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: rótulo seletivo', 'Do: selective labels', 'Haz: etiqueta selectiva')}</p>
          <p class="usage-card__text">${L('O valor final, o pico ou a série da história. Um número em cada ponto ninguém lê.', 'The final value, the peak, or the series that tells the story. A number on every point, no one reads.', 'El valor final, el pico o la serie de la historia. Un número en cada punto nadie lo lee.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: área sobreposta', 'Avoid: overlapping areas', 'Evita: áreas superpuestas')}</p>
          <p class="usage-card__text">${L('Áreas de várias séries umas sobre as outras escondem dados. Para partes de um total, empilhe; para comparar, use linhas.', 'Areas of several series on top of each other hide data. For parts of a total, stack; to compare, use lines.', 'Áreas de varias series unas sobre otras ocultan datos. Para partes de un total, apila; para comparar, usa líneas.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Zero no eixo', 'Zero on the axis', 'Cero en el eje')}</p>
          <p class="usage-card__text">${L(`Áreas sempre começam no zero. Em linhas, desligue com ${ic('zero: false')} só quando a variação é a história — e diga isso no subtítulo.`, `Areas always start at zero. On lines, turn it off with ${ic('zero: false')} only when the variation is the story — and say so in the subtitle.`, `Las áreas siempre empiezan en cero. En líneas, desactívalo con ${ic('zero: false')} solo cuando la variación es la historia — y dilo en el subtítulo.`)}</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      L('Uma função, as mesmas regras de todos os gráficos do Lume.', 'One function, the same rules as every Lume chart.', 'Una función, las mismas reglas de todos los gráficos de Lume.'),
      `${codeBlock(`import { lineChart } from './ds/js/charts.js';

const chart = lineChart(document.querySelector('#${L('receita', 'revenue', 'ingresos')}'), {
  title: '${revenueLabel()}',
  categories: [${months().slice(0, 3).map((m) => `'${m}'`).join(', ')}],
  series: [{ name: '${revenueLabel()}', values: [82000, 91000, 88000] }],
  format: 'currency-compact',
});

chart.update({ target: { value: 90000, label: '${goal()}' } });`)}
      ${apiTable()}`,
    )}
  </div>`;
}

export function mount(root) {
  const charts = [];
  const make = (el, options) => el && charts.push(lineChart(el, options));
  const without = L('Sem', 'Without', 'Sin');
  const withOpt = L('Com', 'With', 'Con');

  const unmountPlayground = mountPlayground(root, {
    id: 'linhas',
    controls: [
      { id: 'type', label: L('Tipo', 'Type', 'Tipo'), value: 'line', options: TYPES().map(([value, label]) => ({ value, label })) },
      { id: 'series', label: L('Séries', 'Series', 'Series'), value: '1', options: ['1', '2', '3', '4'].map((value) => ({ value, label: value })) },
      { id: 'curve', label: L('Curva', 'Curve', 'Curva'), value: 'linear', options: [{ value: 'linear', label: L('Reta', 'Straight', 'Recta') }, { value: 'smooth', label: L('Suave', 'Smooth', 'Suave') }] },
      { id: 'markers', label: L('Marcadores', 'Markers', 'Marcadores'), value: 'end', options: [{ value: 'end', label: L('No fim', 'At the end', 'Al final') }, { value: 'all', label: L('Todos', 'All', 'Todos') }, { value: 'none', label: L('Nenhum', 'None', 'Ninguno') }] },
      { id: 'target', label: goal(), value: 'off', options: [{ value: 'off', label: without }, { value: 'on', label: withOpt }] },
      { id: 'compare', label: L('Ano anterior', 'Previous year', 'Año anterior'), value: 'off', options: [{ value: 'off', label: without }, { value: 'on', label: withOpt }] },
    ],
    render: () => '<div class="gl-stage" data-playground-chart></div>',
    mount(preview, state) {
      const chart = lineChart(preview.querySelector('[data-playground-chart]'), { ...playgroundOptions(state), height: 300 });
      return () => chart.destroy();
    },
    code: playgroundCode,
  });

  VARIANTS().forEach((v) => make(root.querySelector(`[data-variant="${v.id}"]`), { ...v.options, height: 240 }));

  // Mira: já aberta num mês, para quem só está lendo.
  const m = months();
  const crossEl = root.querySelector('[data-crosshair]');
  make(crossEl, {
    title: revenueLabel(),
    subtitle: L('2026 contra 2025', '2026 vs. 2025', '2026 contra 2025'),
    categories: m,
    series: [
      { name: '2026', values: revenue[2026] },
      { name: '2025', values: revenue[2025], muted: true },
    ],
    format: 'currency-compact',
    height: 300,
  });
  const plot = crossEl?.querySelector('[data-plot]');
  if (plot) {
    const r = plot.getBoundingClientRect();
    plot.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + r.width * 0.68, clientY: r.top + r.height * 0.4, bubbles: true }));
  }

  make(root.querySelector('[data-axis="indice"]'), {
    title: L('Receita e usuários', 'Revenue and users', 'Ingresos y usuarios'),
    subtitle: L('Índice · janeiro = 100', 'Index · January = 100', 'Índice · enero = 100'),
    categories: m,
    series: [
      { name: activeLabel(), values: index100(activeUsers[2026]) },
      { name: revenueLabel(), values: index100(revenue[2026]) },
    ],
    zero: false,
    target: { value: 100, label: L('Base', 'Base', 'Base') },
    format: 'integer',
    height: 300,
  });
  // A cor segue a medida: as mesmas do índice acima.
  make(root.querySelector('[data-axis="usuarios"]'), { title: activeLabel(), categories: m, series: [{ name: activeLabel(), values: activeUsers[2026] }], format: 'integer', height: 150 });
  make(root.querySelector('[data-axis="receita"]'), { title: revenueLabel(), categories: m, series: [{ name: revenueLabel(), values: revenue[2026], color: 2 }], format: 'currency-compact', height: 150 });

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    charts.forEach((c) => c.destroy());
    unmountCopy();
    unmountNav();
  };
}
