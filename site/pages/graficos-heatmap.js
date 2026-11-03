import { icon } from '../../ds/icons/icons.js';
import { heatmap, calendarHeatmap } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { weekdays, hours, ordersByHour, yearActivity, YEAR_START } from '../chart-data.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-heatmap.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const total = ordersByHour.flat().reduce((a, v) => a + v, 0);
const mean = Math.round(total / ordersByHour.flat().length);
const avgByHour = Array.from({ length: 24 }, (_, h) => ordersByHour.reduce((a, row) => a + row[h], 0) / ordersByHour.length);
/** Diferença de cada dia para a média da semana naquela hora (null nas horas sem pedidos). */
const variation = ordersByHour.map((row) => row.map((v, h) => (avgByHour[h] >= 1 ? Math.round(v - avgByHour[h]) : null)));

const SIGNED = { signDisplay: 'exceptZero', maximumFractionDigits: 0 };
const SIGNED_CODE = "{ signDisplay: 'exceptZero', maximumFractionDigits: 0 }";

const ordersLabel = () => L('pedidos', 'orders', 'pedidos');
const ordersByHourTitle = () => L('Pedidos por hora', 'Orders by hour', 'Pedidos por hora');
const lastWeek = () => L('Última semana', 'Last week', 'Última semana');
const quote = (list) => list.map((s) => `'${s}'`).join(', ');

/* ───────── Playground ───────── */

function playgroundOptions(state) {
  const steps = +state.steps;
  if (state.data === 'variation') {
    return {
      title: L('Pedidos contra a média da hora', 'Orders vs. the hourly average', 'Pedidos contra la media de la hora'),
      subtitle: L('Diferença de cada dia para a média da semana naquela hora', 'Each day’s difference from the weekly average at that hour', 'Diferencia de cada día con la media de la semana a esa hora'),
      rows: weekdays(),
      columns: hours(),
      values: variation,
      scale: state.scale,
      steps,
      valueLabel: ordersLabel(),
      format: SIGNED,
    };
  }
  return {
    title: ordersByHourTitle(),
    subtitle: state.scale === 'diverging' ? L(`Acima e abaixo da média de ${mean} pedidos`, `Above and below the average of ${mean} orders`, `Por encima y por debajo de la media de ${mean} pedidos`) : lastWeek(),
    rows: weekdays(),
    columns: hours(),
    values: ordersByHour,
    scale: state.scale,
    steps,
    ...(state.scale === 'diverging' ? { center: mean } : {}),
    valueLabel: ordersLabel(),
    format: 'integer',
  };
}

function playgroundCode(state) {
  const o = playgroundOptions(state);
  const h = hours();
  const lines = [
    `  title: '${o.title}',`,
    `  subtitle: '${o.subtitle}',`,
    `  rows: [${quote(o.rows)}],`,
    `  columns: [${quote(h.slice(0, 3))}, /* … */ '${h[23]}'],`,
    `  values: ${state.data === 'variation' ? L('variacao', 'variation', 'variacion') : L('pedidos', 'orders', 'pedidos')}, // ${L('7 linhas × 24 colunas; null = sem dado', '7 rows × 24 columns; null = no data', '7 filas × 24 columnas; null = sin dato')}`,
    o.scale === 'diverging' && `  scale: 'diverging',`,
    o.center != null && `  center: ${o.center}, // ${L('o meio neutro: a média', 'the neutral middle: the average', 'el medio neutro: la media')}`,
    o.steps !== 5 && `  steps: ${o.steps},`,
    o.valueLabel && `  valueLabel: '${o.valueLabel}',`,
    `  format: ${typeof o.format === 'string' ? `'${o.format}'` : SIGNED_CODE},`,
  ].filter(Boolean);
  return `import { heatmap } from './ds/js/charts.js';

const chart = heatmap(document.querySelector('#${L('pedidos', 'orders', 'pedidos')}'), {
${lines.join('\n')}
});`;
}

/* ───────── Escalas ───────── */

const SEQ = [1, 2, 3, 4, 5, 6, 7];
const FIVE = [1, 2, 4, 6, 7];

function scalePanel(theme) {
  const swatch = (token, label, used = true) =>
    `<span class="gh-step${used ? '' : ' gh-step--off'}"><span class="gh-step__chip" style="background:var(--ds-color-chart-${token})"></span><span class="gh-step__label">${label}</span></span>`;
  const empty = L('vazio', 'empty', 'vacío');
  return `<div class="gh-scales__panel" data-theme="${theme}">
    <p class="gh-scales__theme">${icon({ dark: 'moon', light: 'sun', refugio: 'mountain' }[theme], { size: 16 })}${{ dark: L('Escuro', 'Dark', 'Oscuro'), light: L('Claro', 'Light', 'Claro'), refugio: 'Refúgio' }[theme]}</p>
    <div class="gh-scales__row">
      <p class="gh-scales__name">${L('Sequencial · 7 faixas', 'Sequential · 7 bands', 'Secuencial · 7 rangos')}</p>
      <div class="gh-steps">${swatch('grid', empty)}${SEQ.map((n) => swatch(`seq-${n}`, n)).join('')}</div>
    </div>
    <div class="gh-scales__row">
      <p class="gh-scales__name">${L('Sequencial · 5 faixas', 'Sequential · 5 bands', 'Secuencial · 5 rangos')}</p>
      <div class="gh-steps">${swatch('grid', empty)}${SEQ.map((n) => swatch(`seq-${n}`, n, FIVE.includes(n))).join('')}</div>
    </div>
    <div class="gh-scales__row">
      <p class="gh-scales__name">${L('Divergente · 7 faixas', 'Diverging · 7 bands', 'Divergente · 7 rangos')}</p>
      <div class="gh-steps gh-steps--7">${SEQ.map((n) => swatch(`div-${n}`, n === 4 ? L('meio', 'middle', 'medio') : n < 4 ? `−${4 - n}` : `+${n - 4}`)).join('')}</div>
    </div>
    <div class="gh-scales__legend" aria-hidden="true">
      <div class="ds-chart__scale"><span>${L('Menos', 'Less', 'Menos')}</span><span class="ds-chart__scale-bins"><span class="ds-chart__scale-bin" style="--c:var(--ds-color-chart-grid)"></span>${FIVE.map((n) => `<span class="ds-chart__scale-bin" style="--c:var(--ds-color-chart-seq-${n})"></span>`).join('')}</span><span>${L('Mais', 'More', 'Más')}</span></div>
      <div class="ds-chart__scale"><span>−8</span><span class="ds-chart__scale-bins">${SEQ.map((n) => `<span class="ds-chart__scale-bin" style="--c:var(--ds-color-chart-div-${n})"></span>`).join('')}</span><span>+8</span></div>
    </div>
  </div>`;
}

/* ───────── API ───────── */

const API = () => [
  ['rows · columns', 'string[]', '—', L('Rótulos das linhas (à esquerda) e das colunas (embaixo).', 'Row labels (on the left) and column labels (at the bottom).', 'Etiquetas de las filas (a la izquierda) y de las columnas (abajo).')],
  ['values', '(number | null)[][]', '—', L(`${ic('values[linha][coluna]')}. ${ic('null')} vira célula vazia, com “Sem dado” no tooltip.`, `${ic('values[row][column]')}. ${ic('null')} becomes an empty cell, with “No data” in the tooltip.`, `${ic('values[fila][columna]')}. ${ic('null')} se vuelve celda vacía, con “Sin dato” en el tooltip.`)],
  ['scale', "'sequential' | 'diverging'", "'sequential'", L('Um tom do pouco ao muito, ou dois tons com o meio neutro.', 'One hue from little to a lot, or two hues with a neutral middle.', 'Un tono de poco a mucho, o dos tonos con el medio neutro.')],
  ['steps', '3 – 7', '5', L('Quantas faixas de cor. Mais de 7 deixa vizinhas indistinguíveis.', 'How many color bands. More than 7 makes neighbors indistinguishable.', 'Cuántos rangos de color. Más de 7 vuelve indistinguibles a los vecinos.')],
  ['domain', '[min, max]', L('dos dados', 'from the data', 'de los datos'), L('Fixe para comparar mapas diferentes na mesma escala.', 'Fix it to compare different maps on the same scale.', 'Fíjalo para comparar mapas distintos en la misma escala.')],
  ['center', 'number', '0', L('O valor do meio neutro na escala divergente (ex.: a média).', 'The value of the neutral middle on the diverging scale (e.g., the average).', 'El valor del medio neutro en la escala divergente (p. ej., la media).')],
  ['zeroEmpty', 'boolean', 'true', L('Zero aparece como célula vazia na sequencial.', 'Zero shows as an empty cell on the sequential scale.', 'El cero aparece como celda vacía en la secuencial.')],
  ['format · valueLabel', L('preset | Intl | função · string', 'preset | Intl | function · string', 'preset | Intl | función · string'), "'number' · —", L('Valor no tooltip, na tabela e na legenda; unidade depois do número.', 'Value in the tooltip, table, and legend; unit after the number.', 'Valor en el tooltip, en la tabla y en la leyenda; unidad después del número.')],
  ['cellHeight', 'number', L('quadrada', 'square', 'cuadrada'), L('Altura da célula; por padrão acompanha a largura, entre 14 e 32 px.', 'Cell height; by default it follows the width, between 14 and 32 px.', 'Altura de la celda; por defecto sigue al ancho, entre 14 y 32 px.')],
  ['scaleLegend · scaleLabels', 'boolean · [string, string]', L('true · mín./máx.', 'true · min./max.', 'true · mín./máx.'), L('Legenda de escala embaixo, com os extremos ou “Menos/Mais”.', 'Scale legend at the bottom, with the extremes or “Less/More”.', 'Leyenda de escala abajo, con los extremos o “Menos/Más”.')],
  ['title · subtitle · label · card · table', '—', '—', L('Iguais aos de todos os gráficos.', 'Same as every chart.', 'Iguales a los de todos los gráficos.')],
];

const API_CAL = () => [
  ['start', L("'AAAA-MM-DD' | Date", "'YYYY-MM-DD' | Date", "'AAAA-MM-DD' | Date"), L('hoje', 'today', 'hoy'), L('Primeiro dia. As colunas são semanas, de domingo a sábado.', 'First day. Columns are weeks, Sunday to Saturday.', 'Primer día. Las columnas son semanas, de domingo a sábado.')],
  ['values', '(number | null)[]', '—', L('Um valor por dia, a partir de start.', 'One value per day, from start.', 'Un valor por día, a partir de start.')],
  ['steps · format · valueLabel', '—', "5 · 'integer' · —", L('Como no heatmap; a escala é sempre sequencial.', 'As in the heatmap; the scale is always sequential.', 'Como en el heatmap; la escala es siempre secuencial.')],
  ['scaleLabels', '[string, string]', L("['Menos', 'Mais']", "['Less', 'More']", "['Menos', 'Más']"), L('Extremos da legenda de escala.', 'Ends of the scale legend.', 'Extremos de la leyenda de escala.')],
];

function apiTable(rows) {
  return `<div class="doc-table gh-api">
    <div class="doc-table__head" aria-hidden="true"><span>${L('Opção', 'Option', 'Opción')}</span><span>${L('Tipo', 'Type', 'Tipo')}</span><span>${L('Padrão', 'Default', 'Predeterminado')}</span><span>${L('Para quê', 'What for', 'Para qué')}</span></div>
    ${rows
      .map(
        ([name, type, def, text]) => `<div class="doc-table__row">
          <span><code class="ds-inline-code">${name}</code></span>
          <span class="gh-api__type">${type}</span>
          <span class="gh-api__type">${def}</span>
          <span class="gh-api__text">${text}</span>
        </div>`,
      )
      .join('')}
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

export default function renderHeatmap(page) {
  const wd = weekdays();
  const h = hours();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Intensidade numa grade — dia × hora, ou dia a dia no ano. Um tom só que fica mais forte com o valor; dois tons com o meio neutro quando a pergunta é acima ou abaixo de uma referência.', 'Intensity on a grid — day × hour, or day by day across the year. A single hue that gets stronger with the value; two hues with a neutral middle when the question is above or below a reference.', 'Intensidad en una cuadrícula — día × hora, o día a día en el año. Un solo tono que se vuelve más fuerte con el valor; dos tonos con el medio neutro cuando la pregunta es por encima o por debajo de una referencia.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('formatos', 'formats', 'formatos')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('escalas', 'scales', 'escalas')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('faixas', 'bands', 'rangos')}</dt><dd class="doc-stat__value">${L('até 7', 'up to 7', 'hasta 7')}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('respiro', 'gap', 'respiro')}</dt><dd class="doc-stat__value">2 px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['variantes', L('Variantes', 'Variants', 'Variantes')],
        ['escalas', L('Escala e faixas', 'Scale and bands', 'Escala y rangos')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', L('Troque a escala, as faixas e os dados. Passe o mouse nas células ou foque o mapa e use as setas.', 'Change the scale, the bands, and the data. Hover the cells or focus the map and use the arrows.', 'Cambia la escala, los rangos y los datos. Pasa el mouse por las celdas o enfoca el mapa y usa las flechas.'), playgroundMarkup('heatmap', { wide: true }))}

    ${section(
      'variantes',
      L('Variantes', 'Variants', 'Variantes'),
      L('Matriz para padrões que se repetem (dia da semana × hora); calendário para o ano inteiro de uma vez.', 'A matrix for repeating patterns (weekday × hour); a calendar for the whole year at once.', 'Matriz para patrones que se repiten (día de la semana × hora); calendario para el año entero de una vez.'),
      `<div class="gh-grid">
        <article class="gh-card">
          <div class="gh-card__chart" data-variant="matriz"></div>
          <div class="gh-card__body">
            <p class="cd-example__name">${L('Matriz', 'Matrix', 'Matriz')}<code>heatmap()</code></p>
            <p class="cd-example__text">${L('Linhas e colunas com significado. O pico do meio-dia e o vale da madrugada saltam à vista — sem ler um número.', 'Rows and columns with meaning. The midday peak and the early-morning dip jump out — without reading a number.', 'Filas y columnas con significado. El pico del mediodía y el valle de la madrugada saltan a la vista — sin leer un número.')}</p>
          </div>
        </article>
        <article class="gh-card">
          <div class="gh-card__chart" data-variant="divergente"></div>
          <div class="gh-card__body">
            <p class="cd-example__name">${L('Divergente', 'Diverging', 'Divergente')}<code>scale: 'diverging'</code></p>
            <p class="cd-example__text">${L('Frio abaixo da média, quente acima, cinza no meio. O meio precisa ler como “nada”.', 'Cool below the average, warm above, gray in the middle. The middle has to read as “nothing”.', 'Frío por debajo de la media, cálido por encima, gris en el medio. El medio tiene que leerse como “nada”.')}</p>
          </div>
        </article>
        <article class="gh-card gh-card--wide">
          <div class="gh-card__chart" data-variant="calendario"></div>
          <div class="gh-card__body">
            <p class="cd-example__name">${L('Calendário', 'Calendar', 'Calendario')}<code>calendarHeatmap()</code></p>
            <p class="cd-example__text">${L('Um quadrado por dia, uma coluna por semana. Abre na semana mais recente; em telas estreitas, role para o passado. A tabela resume por mês.', 'One square per day, one column per week. It opens on the most recent week; on narrow screens, scroll back into the past. The table summarizes by month.', 'Un cuadrado por día, una columna por semana. Abre en la semana más reciente; en pantallas estrechas, desplázate hacia el pasado. La tabla resume por mes.')}</p>
          </div>
        </article>
      </div>`,
    )}

    ${section(
      'escalas',
      L('Escala e faixas', 'Scale and bands', 'Escala y rangos'),
      L('O valor vira uma faixa de cor, não um tom contínuo — faixas o olho consegue comparar. No escuro, a âncora inverte: mais é mais claro.', 'The value becomes a color band, not a continuous tone — bands are something the eye can compare. In dark mode, the anchor flips: more is lighter.', 'El valor se vuelve un rango de color, no un tono continuo — los rangos el ojo los puede comparar. En el oscuro, el ancla se invierte: más es más claro.'),
      `<div class="gh-scales">${scalePanel('refugio')}${scalePanel('dark')}${scalePanel('light')}</div>
      <ul class="gh-notes" role="list">
        <li>${icon('layers', { size: 18 })}<div><p class="gh-notes__title">${L('Faixas iguais', 'Equal bands', 'Rangos iguales')}</p><p class="gh-notes__text">${L('O intervalo entre o mínimo e o máximo é dividido em partes iguais. Com 5 faixas, usamos os passos 1, 2, 4, 6 e 7, para cobrir toda a rampa.', 'The range between minimum and maximum is split into equal parts. With 5 bands, we use steps 1, 2, 4, 6, and 7, to cover the whole ramp.', 'El intervalo entre el mínimo y el máximo se divide en partes iguales. Con 5 rangos, usamos los pasos 1, 2, 4, 6 y 7, para cubrir toda la rampa.')}</p></div></li>
        <li>${icon('minus', { size: 18 })}<div><p class="gh-notes__title">${L('Vazio não é zero', 'Empty isn’t zero', 'Vacío no es cero')}</p><p class="gh-notes__text">${L('Célula sem dado (e o zero, na sequencial) usa a cor da grade — fica claro que ali não há nada, e não “pouco”.', 'A cell with no data (and zero, on the sequential scale) uses the grid color — it’s clear there’s nothing there, not “a little”.', 'Una celda sin dato (y el cero, en la secuencial) usa el color de la cuadrícula — queda claro que ahí no hay nada, y no “poco”.')}</p></div></li>
        <li>${icon('target', { size: 18 })}<div><p class="gh-notes__title">${L('O meio é uma decisão', 'The middle is a decision', 'El medio es una decisión')}</p><p class="gh-notes__text">${L(`Na divergente, ${ic('center')} define o que é neutro: zero numa variação, a média numa contagem, a meta num resultado.`, `On the diverging scale, ${ic('center')} defines what’s neutral: zero for a change, the average for a count, the goal for a result.`, `En la divergente, ${ic('center')} define qué es neutro: cero en una variación, la media en un conteo, la meta en un resultado.`)}</p></div></li>
      </ul>`,
    )}

    ${section(
      'acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('Cor sozinha não carrega número. Por isso o mapa sempre tem outro caminho até o valor.', 'Color alone doesn’t carry a number. That’s why the map always has another way to the value.', 'El color solo no lleva un número. Por eso el mapa siempre tiene otro camino hasta el valor.'),
      a11yList([
        [L('Tabela sempre à mão', 'A table always at hand', 'Tabla siempre a mano'), L('O botão de tabela troca o mapa pelos números: linhas × colunas na matriz e um resumo por mês no calendário — 365 linhas não ajudam ninguém.', 'The table button swaps the map for the numbers: rows × columns in the matrix and a monthly summary in the calendar — 365 rows help no one.', 'El botón de tabla cambia el mapa por los números: filas × columnas en la matriz y un resumen por mes en el calendario — 365 filas no ayudan a nadie.')],
        [L('Teclado em duas direções', 'Keyboard in two directions', 'Teclado en dos direcciones'), L('Tab foca o mapa; as setas andam entre as células, Home e End vão ao começo e ao fim da linha, Esc fecha o tooltip. No calendário, ← e → pulam semanas e ↑ e ↓ andam dias.', 'Tab focuses the map; the arrows move between cells, Home and End go to the start and end of the row, Esc closes the tooltip. In the calendar, ← and → jump weeks and ↑ and ↓ move days.', 'Tab enfoca el mapa; las flechas se mueven entre las celdas, Home y End van al principio y al final de la fila, Esc cierra el tooltip. En el calendario, ← y → saltan semanas y ↑ y ↓ avanzan días.'), ['←', '↑', '↓', '→', 'Home', 'End']],
        [L('Leitor de tela', 'Screen reader', 'Lector de pantalla'), L('O mapa é anunciado com o tamanho da grade; cada célula visitada pelo teclado é lida com linha, coluna e valor.', 'The map is announced with the grid size; each cell visited by keyboard is read with row, column, and value.', 'El mapa se anuncia con el tamaño de la cuadrícula; cada celda visitada con el teclado se lee con fila, columna y valor.')],
        [L('Contorno no hover', 'Outline on hover', 'Contorno con hover'), L('A célula ativa ganha um anel de 1,5 px na cor do texto, visível sobre qualquer faixa, nos três temas.', 'The active cell gets a 1.5 px ring in the text color, visible over any band, in all three themes.', 'La celda activa recibe un anillo de 1,5 px del color del texto, visible sobre cualquier rango, en los tres temas.')],
        [L('Faixas contáveis', 'Countable bands', 'Rangos contables'), L('No máximo 7 cores com significado. Acima disso, vizinhas se confundem — use uma tabela.', 'At most 7 meaningful colors. Beyond that, neighbors get confused — use a table.', 'Como máximo 7 colores con significado. Por encima de eso, los vecinos se confunden — usa una tabla.')],
        [L('Ponta clara permitida', 'A faint end is allowed', 'Extremo claro permitido'), L('Na sequencial, o passo mais fraco pode quase sumir na superfície: ele quer dizer “perto de zero”. O valor exato continua no tooltip e na tabela.', 'On the sequential scale, the faintest step can nearly vanish into the surface: it means “close to zero”. The exact value stays in the tooltip and the table.', 'En la secuencial, el paso más débil puede casi desaparecer en la superficie: quiere decir “cerca de cero”. El valor exacto sigue en el tooltip y en la tabla.')],
      ]),
    )}

    ${section(
      'tokens',
      L('Tokens usados', 'Tokens used', 'Tokens usados'),
      L('Duas rampas e a cor da grade. Nenhuma cor de série categórica entra aqui.', 'Two ramps and the grid color. No categorical series color comes in here.', 'Dos rampas y el color de la cuadrícula. Ningún color de serie categórico entra aquí.'),
      tokenTable([
        ['color.chart.seq.1', L('Sequencial: o mínimo', 'Sequential: the minimum', 'Secuencial: el mínimo')],
        ['color.chart.seq.4', L('Sequencial: o meio', 'Sequential: the middle', 'Secuencial: el medio')],
        ['color.chart.seq.7', L('Sequencial: o máximo', 'Sequential: the maximum', 'Secuencial: el máximo')],
        ['color.chart.div.1', L('Divergente: extremo abaixo (frio)', 'Diverging: low end (cool)', 'Divergente: extremo inferior (frío)')],
        ['color.chart.div.4', L('Divergente: meio neutro', 'Diverging: neutral middle', 'Divergente: medio neutro')],
        ['color.chart.div.7', L('Divergente: extremo acima (quente)', 'Diverging: high end (warm)', 'Divergente: extremo superior (cálido)')],
        ['color.chart.grid', L('Célula vazia', 'Empty cell', 'Celda vacía')],
        ['color.fg.default', L('Anel da célula ativa', 'Active cell ring', 'Anillo de la celda activa')],
        ['color.fg.subtle', L('Rótulos e legenda de escala', 'Labels and scale legend', 'Etiquetas y leyenda de escala')],
        ['color.bg.raised', L('Fundo do tooltip', 'Tooltip background', 'Fondo del tooltip')],
      ]),
    )}

    ${section(
      'uso',
      L('Uso', 'Usage', 'Uso'),
      L('O heatmap mostra padrão, não valor exato. Use quando a pergunta é “onde concentra?”.', 'A heatmap shows a pattern, not an exact value. Use it when the question is “where does it concentrate?”.', 'El heatmap muestra un patrón, no un valor exacto. Úsalo cuando la pregunta es “¿dónde se concentra?”.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: um tom só', 'Do: a single hue', 'Haz: un solo tono')}</p>
          <p class="usage-card__text">${L('Magnitude é uma rampa de um tom, do claro ao forte. O olho lê “mais” sem precisar de legenda.', 'Magnitude is a single-hue ramp, from light to strong. The eye reads “more” without needing a legend.', 'La magnitud es una rampa de un tono, de claro a fuerte. El ojo lee “más” sin necesitar leyenda.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: arco-íris', 'Avoid: rainbows', 'Evita: arcoíris')}</p>
          <p class="usage-card__text">${L('Vermelho, amarelo, verde e azul não têm ordem. Ninguém sabe se o verde é mais ou menos que o amarelo.', 'Red, yellow, green, and blue have no order. No one knows whether green is more or less than yellow.', 'Rojo, amarillo, verde y azul no tienen orden. Nadie sabe si el verde es más o menos que el amarillo.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Divergente com meio neutro', 'Diverging with a neutral middle', 'Divergente con medio neutro')}</p>
          <p class="usage-card__text">${L('Dois tons opostos — frio e quente — e cinza no meio. Dois tons frios não leem como “lados”.', 'Two opposite hues — cool and warm — and gray in the middle. Two cool hues don’t read as “sides”.', 'Dos tonos opuestos — frío y cálido — y gris en el medio. Dos tonos fríos no se leen como “lados”.')}</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: até 7 faixas', 'Do: up to 7 bands', 'Haz: hasta 7 rangos')}</p>
          <p class="usage-card__text">${L('Cinco resolvem quase sempre. Sete é o teto: acima disso, faixas vizinhas se misturam.', 'Five almost always do it. Seven is the ceiling: beyond that, neighboring bands blend together.', 'Cinco resuelven casi siempre. Siete es el techo: por encima de eso, los rangos vecinos se mezclan.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: valor exato pela cor', 'Avoid: exact values by color', 'Evita: valor exacto por el color')}</p>
          <p class="usage-card__text">${L('Se a pessoa precisa do número para decidir, mostre o número — numa tabela ou em barras.', 'If people need the number to decide, show the number — in a table or in bars.', 'Si la persona necesita el número para decidir, muestra el número — en una tabla o en barras.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Mesma escala para comparar', 'Same scale to compare', 'Misma escala para comparar')}</p>
          <p class="usage-card__text">${L(`Dois mapas lado a lado? Fixe o mesmo ${ic('domain')} nos dois, ou a mesma cor vai significar valores diferentes.`, `Two maps side by side? Fix the same ${ic('domain')} on both, or the same color will mean different values.`, `¿Dos mapas lado a lado? Fija el mismo ${ic('domain')} en los dos, o el mismo color significará valores distintos.`)}</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      L('Duas funções com as mesmas regras de todos os gráficos do Lume: update, setLoading e destroy.', 'Two functions with the same rules as every Lume chart: update, setLoading, and destroy.', 'Dos funciones con las mismas reglas de todos los gráficos de Lume: update, setLoading y destroy.'),
      `${codeBlock(`import { heatmap, calendarHeatmap } from './ds/js/charts.js';

heatmap(document.querySelector('#${L('pedidos', 'orders', 'pedidos')}'), {
  title: '${ordersByHourTitle()}',
  rows: [${quote(wd.slice(0, 3))}],
  columns: [${quote(h.slice(8, 11))}],
  values: [[12, 30, 41], [9, 28, 44], [14, 26, 39]],
  valueLabel: '${ordersLabel()}',
});

calendarHeatmap(document.querySelector('#${L('atividade', 'activity', 'actividad')}'), {
  title: '${L('Atividade no ano', 'Activity this year', 'Actividad en el año')}',
  start: '2025-11-02',
  values: ${L('atividadePorDia', 'activityByDay', 'actividadPorDia')}, // ${L('um número por dia', 'one number per day', 'un número por día')}
  valueLabel: '${L('entregas', 'deliveries', 'entregas')}',
});`)}
      <h3 class="doc-subhead">heatmap()</h3>
      ${apiTable(API())}
      <h3 class="doc-subhead">calendarHeatmap()</h3>
      ${apiTable(API_CAL())}`,
    )}
  </div>`;
}

export function mount(root) {
  const charts = [];

  const unmountPlayground = mountPlayground(root, {
    id: 'heatmap',
    controls: [
      { id: 'scale', label: L('Escala', 'Scale', 'Escala'), value: 'sequential', options: [{ value: 'sequential', label: L('Sequencial', 'Sequential', 'Secuencial') }, { value: 'diverging', label: L('Divergente', 'Diverging', 'Divergente') }] },
      { id: 'steps', label: L('Faixas', 'Bands', 'Rangos'), value: '5', options: [{ value: '5', label: '5' }, { value: '7', label: '7' }] },
      { id: 'data', label: L('Dados', 'Data', 'Datos'), value: 'orders', options: [{ value: 'orders', label: ordersByHourTitle() }, { value: 'variation', label: L('Diferença da média', 'Difference from average', 'Diferencia con la media') }] },
    ],
    render: () => '<div data-playground-chart></div>',
    mount(preview, state) {
      const chart = heatmap(preview.querySelector('[data-playground-chart]'), playgroundOptions(state));
      return () => chart.destroy();
    },
    code: playgroundCode,
  });

  const at = (id) => root.querySelector(`[data-variant="${id}"]`);
  const wd = weekdays();
  const h = hours();
  charts.push(
    heatmap(at('matriz'), { title: ordersByHourTitle(), subtitle: lastWeek(), rows: wd, columns: h, values: ordersByHour, valueLabel: ordersLabel(), format: 'integer' }),
    heatmap(at('divergente'), { title: L('Contra a média da hora', 'Against the hourly average', 'Contra la media de la hora'), subtitle: L('O fim de semana fica acima da média a partir das 10h', 'The weekend runs above average from 10:00 on', 'El fin de semana queda por encima de la media a partir de las 10 h'), rows: wd, columns: h, values: variation, scale: 'diverging', steps: 7, valueLabel: ordersLabel(), format: SIGNED }),
    calendarHeatmap(at('calendario'), { title: L('Entregas no ano', 'Deliveries this year', 'Entregas en el año'), subtitle: L('Um quadrado por dia · novembro de 2025 a outubro de 2026', 'One square per day · November 2025 to October 2026', 'Un cuadrado por día · noviembre de 2025 a octubre de 2026'), start: YEAR_START, values: yearActivity, valueLabel: L('entregas', 'deliveries', 'entregas') }),
  );

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    charts.forEach((c) => c.destroy());
    unmountCopy();
    unmountNav();
  };
}
