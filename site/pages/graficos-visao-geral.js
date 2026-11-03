import { icon } from '../../ds/icons/icons.js';
import { tokens, contrast } from '../../ds/tokens.js';
import { barChart, lineChart, donutChart, statTile, formatter } from '../../ds/js/charts.js';
import { locale, dateFormat, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { seeded, months, channels, payments } from '../chart-data.js';
import { L, ratio } from '../i18n.js';
import { THEME_IDS, themeLabel, themeIcon, perTheme } from '../themes.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-visao-geral.css'];

/* ───────── Dados: cores (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const fmt1 = (n) => formatNumber(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const byName = new Map(tokens.map((t) => [t.name, t]));
const SLOT_NAMES = () => ({
  brand: L('Marca', 'Brand', 'Marca'),
  blue: L('Azul', 'Blue', 'Azul'),
  pink: L('Rosa', 'Pink', 'Rosa'),
  amber: L('Âmbar', 'Amber', 'Ámbar'),
  teal: L('Verde-azulado', 'Teal', 'Verde azulado'),
  red: L('Vermelho', 'Red', 'Rojo'),
  violet: L('Violeta', 'Violet', 'Violeta'),
  green: L('Verde', 'Green', 'Verde'),
});
const refName = (ref) => /^\{color\.([^}]+)\}$/.exec(ref)?.[1] ?? ref;

const SLOTS = Array.from({ length: 8 }, (_, i) => {
  const t = byName.get(`color.chart.series.${i + 1}`);
  const step = refName(t.modes.dark.ref);
  return { n: i + 1, step, dark: t.modes.dark.value, light: t.modes.light.value, cssVar: t.cssVar };
});
const slotName = (s) => SLOT_NAMES()[s.step.split('.')[0]] ?? s.step;

const seriesContrast = contrast.filter((c) => c.fg.startsWith('color.chart.series.'));
const minContrast = (mode) => Math.min(...seriesContrast.filter((c) => !mode || c.mode === mode).map((c) => c.ratio));

/* Simulação de daltonismo (Machado, Oliveira & Fernandes, 2009, severidade 1,0) — a mesma do validador */
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
};
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function simulate(hex, kind) {
  const rgb = [1, 3, 5].map((i) => toLin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const m = MACHADO[kind];
  const out = m.map((row) => row.reduce((a, k, j) => a + k * rgb[j], 0));
  return `#${out.map((c) => Math.round(Math.min(1, Math.max(0, toSrgb(Math.min(1, Math.max(0, c))))) * 255).toString(16).padStart(2, '0')).join('')}`;
}

const SCALES = () => [
  ['seq', L('Sequencial', 'Sequential', 'Secuencial'), 7, L('Magnitude: um tom só, de pouco a muito. No escuro a âncora inverte — mais é mais claro.', 'Magnitude: a single hue, from little to a lot. In dark mode the anchor flips — more is lighter.', 'Magnitud: un solo tono, de poco a mucho. En el oscuro el ancla se invierte — más es más claro.'), [L('pouco', 'little', 'poco'), L('muito', 'a lot', 'mucho')]],
  ['ord', L('Ordinal', 'Ordinal', 'Ordinal'), 5, L(`Etapas em ordem (funil, faixas). A ponta mais fraca ainda passa de ${ratio(2, 0)} sobre a superfície.`, `Steps in order (funnel, bands). The faintest end still passes ${ratio(2, 0)} on the surface.`, `Etapas en orden (embudo, rangos). El extremo más débil aún supera ${ratio(2, 0)} sobre la superficie.`), [L('1ª etapa', '1st step', '1.ª etapa'), L('5ª etapa', '5th step', '5.ª etapa')]],
  ['div', L('Divergente', 'Diverging', 'Divergente'), 7, L('Abaixo e acima de uma referência: frio e quente, com o meio neutro e cinza.', 'Below and above a reference: cool and warm, with a neutral gray middle.', 'Por debajo y por encima de una referencia: frío y cálido, con el medio neutro y gris.'), [L('abaixo', 'below', 'debajo'), L('acima', 'above', 'encima')]],
];

const STATUS = () => [
  ['success', 'check-circle', L('Bom', 'Good', 'Bueno'), L('Meta batida, operação normal', 'Goal met, normal operation', 'Meta cumplida, operación normal'), 'chart-status-good'],
  ['warning', 'alert-triangle', L('Atenção', 'Warning', 'Atención'), L('Perto do limite', 'Close to the limit', 'Cerca del límite'), 'chart-status-warning'],
  ['danger', 'alert-circle', L('Crítico', 'Critical', 'Crítico'), L('Acima do limite, falha', 'Over the limit, failure', 'Por encima del límite, falla'), 'chart-status-critical'],
  ['info', 'info', L('Informação', 'Info', 'Información'), L('Neutro, só para avisar', 'Neutral, just to inform', 'Neutro, solo para avisar'), 'info-solid'],
];

/* ───────── Dados: exemplo ao vivo (determinísticos) ───────── */

const END = new Date(2026, 9, 31);
const DAYS = 730;
const cap = (s) => s.charAt(0).toLocaleUpperCase(locale()) + s.slice(1).replace('.', '');

const daily = (() => {
  const rnd = seeded(21);
  return Array.from({ length: DAYS }, (_, i) => {
    const date = new Date(END.getFullYear(), END.getMonth(), END.getDate() - (DAYS - 1 - i));
    const week = [0.9, 1, 0.98, 1.01, 1.04, 1.1, 0.96][date.getDay()];
    const t = i / DAYS;
    const season = 1 + 0.08 * Math.sin((i / 365) * Math.PI * 2 + 1.2);
    const revenue = Math.round(3900 * week * (1 + 0.42 * t) * season * (1 + (rnd() - 0.5) * 0.08));
    const ticket = 84 + (rnd() - 0.5) * 8 + 6 * t;
    const orders = Math.round(revenue / ticket);
    const visits = Math.round(orders / (0.029 + 0.004 * t + (rnd() - 0.5) * 0.004));
    return { date, revenue, orders, visits };
  });
})();

const RANGES = () => [
  { value: '7d', label: L('7 dias', '7 days', '7 días'), days: 7, bucket: 'day', prev: L('vs. 7 dias anteriores', 'vs. previous 7 days', 'vs. 7 días anteriores') },
  { value: '30d', label: L('30 dias', '30 days', '30 días'), days: 30, bucket: 'day', prev: L('vs. 30 dias anteriores', 'vs. previous 30 days', 'vs. 30 días anteriores') },
  { value: '90d', label: L('90 dias', '90 days', '90 días'), days: 91, bucket: 'week', prev: L('vs. trimestre anterior', 'vs. previous quarter', 'vs. trimestre anterior') },
  { value: '12m', label: L('12 meses', '12 months', '12 meses'), days: 365, bucket: 'month', prev: L('vs. 12 meses anteriores', 'vs. previous 12 months', 'vs. 12 meses anteriores') },
];
const RANGE_IDS = ['7d', '30d', '90d', '12m'];

function group(days, bucket) {
  if (bucket === 'day') return days.map((d) => [d]);
  if (bucket === 'week') return Array.from({ length: Math.ceil(days.length / 7) }, (_, k) => days.slice(k * 7, k * 7 + 7));
  const byMonth = new Map();
  days.forEach((d) => {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(d);
  });
  return [...byMonth.values()];
}

const sum = (list, key) => list.reduce((a, d) => a + d[key], 0);

function slice(rangeId) {
  const ranges = RANGES();
  const range = ranges.find((r) => r.value === rangeId);
  const cur = daily.slice(-range.days);
  const prev = daily.slice(-range.days * 2, -range.days);
  const gc = group(cur, range.bucket);
  const gp = group(prev, range.bucket);
  const dayFmt = dateFormat({ day: '2-digit', month: '2-digit' });
  const dayLong = dateFormat({ weekday: 'short', day: 'numeric', month: 'short' });
  const weekLong = dateFormat({ day: 'numeric', month: 'short' });
  const monthShort = dateFormat({ month: 'short' });
  const monthLong = dateFormat({ month: 'long', year: 'numeric' });
  const label = (g) => (range.bucket === 'month' ? cap(monthShort.format(g[0].date)) : dayFmt.format(g[0].date));
  const long = (g) => {
    if (range.bucket === 'day') return dayLong.format(g[0].date);
    if (range.bucket === 'week') return L(`Semana de ${weekLong.format(g[0].date)}`, `Week of ${weekLong.format(g[0].date)}`, `Semana del ${weekLong.format(g[0].date)}`);
    return cap(monthLong.format(g[0].date));
  };
  const k = ranges.indexOf(range);
  const totals = (days) => ({ revenue: sum(days, 'revenue'), orders: sum(days, 'orders'), visits: sum(days, 'visits') });
  return {
    range,
    categories: gc.map(label),
    tooltipLabels: gc.map(long),
    revenue: gc.map((g) => sum(g, 'revenue')),
    previous: gc.map((_, i) => (gp[i] ? sum(gp[i], 'revenue') : null)),
    ordersTrend: gc.map((g) => sum(g, 'orders')),
    ticketTrend: gc.map((g) => sum(g, 'revenue') / sum(g, 'orders')),
    conversionTrend: gc.map((g) => sum(g, 'orders') / sum(g, 'visits')),
    now: totals(cur),
    before: totals(prev),
    shares: [0.43 + k * 0.012, 0.29 - k * 0.008, 0.19 - k * 0.003, 0.09 - k * 0.001],
    payShift: k,
  };
}

const PP = (v) => `${formatNumber(v * 100, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ${L('p.p.', 'pp', 'p. p.')}`;
const TICKET = { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 };
const revenueLabel = () => L('Receita', 'Revenue', 'Ingresos');

function kpis(d) {
  const ticket = d.now.revenue / d.now.orders;
  const ticketBefore = d.before.revenue / d.before.orders;
  const conv = d.now.orders / d.now.visits;
  const convBefore = d.before.orders / d.before.visits;
  const change = (a, b) => a / b - 1;
  return [
    statTile({ label: revenueLabel(), value: d.now.revenue, format: 'currency-compact', delta: change(d.now.revenue, d.before.revenue), deltaLabel: d.range.prev, trend: d.revenue }),
    statTile({ label: L('Pedidos', 'Orders', 'Pedidos'), value: d.now.orders, format: 'integer', delta: change(d.now.orders, d.before.orders), deltaLabel: d.range.prev, trend: d.ordersTrend }),
    statTile({ label: L('Ticket médio', 'Average order', 'Ticket medio'), value: ticket, format: TICKET, delta: change(ticket, ticketBefore), deltaLabel: d.range.prev, trend: d.ticketTrend }),
    statTile({ label: L('Conversão', 'Conversion', 'Conversión'), value: conv, format: { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }, delta: conv - convBefore, deltaFormat: PP, deltaLabel: d.range.prev, trend: d.conversionTrend }),
  ].join('');
}

function channelData(d) {
  const names = channels().series.map((s) => s.name);
  const rows = names.map((name, i) => [name, Math.round(d.now.revenue * d.shares[i])]).sort((a, b) => b[1] - a[1]);
  return { categories: rows.map((r) => r[0]), series: [{ name: revenueLabel(), values: rows.map((r) => r[1]) }] };
}

/** Formas de pagamento somando exatamente o total de pedidos — os números do painel concordam. */
function paymentData(d) {
  const list = payments();
  const weights = list.map((p, i) => p.value * (1 + (i === 0 ? 0.02 : i === 1 ? -0.015 : 0) * d.payShift));
  const total = weights.reduce((a, w) => a + w, 0);
  const items = list.map((p, i) => ({ name: p.name, value: Math.floor((weights[i] / total) * d.now.orders) }));
  items[0].value += d.now.orders - items.reduce((a, it) => a + it.value, 0);
  return items;
}

/* ───────── Prévias estáticas (só tokens) ───────── */

const S = (n) => `var(--ds-color-chart-series-${n})`;

const MINI = {
  bars: () => `<svg viewBox="0 0 120 64" aria-hidden="true">
    <path class="ds-chart__grid" d="M8 63.5H112"/>
    ${[26, 38, 31, 46, 52, 44, 58].map((h, i) => `<rect x="${12 + i * 14}" y="${63 - h}" width="8" height="${h}" rx="2" class="ds-chart__bar" style="--c:${S(1)}"/>`).join('')}
  </svg>`,
  line: () => `<svg viewBox="0 0 120 64" aria-hidden="true">
    <path class="ds-chart__grid" d="M8 63.5H112M8 32.5H112"/>
    <path class="ds-chart__line" style="--c:var(--ds-color-chart-muted)" d="M10 50 26 46 42 47 58 40 74 38 90 34 108 30"/>
    <path class="ds-chart__line" style="--c:${S(1)}" d="M10 46 26 40 42 42 58 30 74 26 90 20 108 10"/>
    <circle class="ds-chart__dot" cx="108" cy="10" r="3.5" style="--c:${S(1)}"/>
  </svg>`,
  donut: () => {
    const r = 22;
    const c = 2 * Math.PI * r;
    let off = 0;
    const segs = [0.46, 0.28, 0.16, 0.1].map((s, i) => {
      const len = s * c - 2;
      const el = `<circle cx="60" cy="32" r="${r}" fill="none" stroke="${i === 3 ? 'var(--ds-color-chart-other)' : S(i + 1)}" stroke-width="9" stroke-dasharray="${len.toFixed(1)} ${(c - len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 60 32)"/>`;
      off += s * c;
      return el;
    });
    return `<svg viewBox="0 0 120 64" aria-hidden="true">${segs.join('')}</svg>`;
  },
  scatter: () => {
    const rnd = seeded(9);
    const dots = Array.from({ length: 16 }, (_, i) => {
      const x = 14 + rnd() * 92;
      const y = 56 - (x - 14) * 0.42 - rnd() * 18;
      return `<circle class="ds-chart__dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" style="--c:${S(i % 3 === 0 ? 2 : 1)}"/>`;
    });
    return `<svg viewBox="0 0 120 64" aria-hidden="true"><path class="ds-chart__baseline" d="M8.5 4V63.5H112"/>${dots.join('')}</svg>`;
  },
  heat: () => {
    const rnd = seeded(4);
    let cells = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 9; c++) {
        const v = Math.max(1, Math.min(7, Math.round(1 + Math.sin((c / 8) * Math.PI) * 5 + rnd() * 2 - r * 0.6)));
        cells += `<rect x="${6 + c * 12}" y="${6 + r * 13.5}" width="10" height="11.5" rx="2.5" style="fill:var(--ds-color-chart-seq-${v})"/>`;
      }
    }
    return `<svg viewBox="0 0 120 64" aria-hidden="true">${cells}</svg>`;
  },
  number: () => `<div class="gv-mini-number"><span>${formatNumber(38200, { notation: 'compact', maximumFractionDigits: 1 })}</span><span class="gv-mini-number__delta">${icon('trending-up', { size: 14 })}${formatNumber(0.137, { style: 'percent', signDisplay: 'always', maximumFractionDigits: 1 })}</span></div>`,
};

const FORMS = () => [
  ['bars', L('Comparar quantidades', 'Compare quantities', 'Comparar cantidades'), L('Barras', 'Bars', 'Barras'), L('Do maior ao menor, entre categorias ou ao longo do tempo. Começa sempre no zero.', 'From largest to smallest, across categories or over time. Always starts at zero.', 'De mayor a menor, entre categorías o a lo largo del tiempo. Siempre empieza en cero.'), '/graficos/barras'],
  ['line', L('Mostrar tendência', 'Show a trend', 'Mostrar tendencia'), L('Linhas e áreas', 'Lines and areas', 'Líneas y áreas'), L('Como algo muda no tempo. Compare com o período anterior em cinza.', 'How something changes over time. Compare with the previous period in gray.', 'Cómo cambia algo en el tiempo. Compara con el período anterior en gris.'), '/graficos/linhas'],
  ['donut', L('Parte do todo', 'Part of a whole', 'Parte del todo'), L('Rosca', 'Donut', 'Dona'), L('A proporção de relance, com até 6 fatias. Valores próximos pedem barras.', 'The proportion at a glance, with up to 6 slices. Close values call for bars.', 'La proporción de un vistazo, con hasta 6 porciones. Valores cercanos piden barras.'), '/graficos/rosca'],
  ['scatter', L('Relação entre medidas', 'Relationship between measures', 'Relación entre medidas'), L('Dispersão', 'Scatter', 'Dispersión'), L('Duas grandezas por item: correlação, grupos e pontos fora da curva.', 'Two quantities per item: correlation, clusters, and outliers.', 'Dos magnitudes por elemento: correlación, grupos y valores atípicos.'), '/graficos/dispersao'],
  ['heat', L('Intensidade numa grade', 'Intensity on a grid', 'Intensidad en una cuadrícula'), L('Heatmap', 'Heatmap', 'Mapa de calor'), L('Dia × hora, semana × mês: onde concentra. Até 7 faixas de cor.', 'Day × hour, week × month: where it concentrates. Up to 7 color bands.', 'Día × hora, semana × mes: dónde se concentra. Hasta 7 rangos de color.'), '/graficos/heatmap'],
  ['number', L('Um número que importa', 'A number that matters', 'Un número que importa'), L('Indicadores', 'Indicators', 'Indicadores'), L('O valor de agora, a variação e a tendência. O número é o gráfico.', 'The current value, the change, and the trend. The number is the chart.', 'El valor actual, la variación y la tendencia. El número es el gráfico.'), '/graficos/indicadores'],
];

/* ───────── Marcas e respiro ───────── */

const MARKS = () => [
  [L('Barra', 'Bar', 'Barra'), L('Até 24 px de espessura. Ponta de dados com raio de 4 px; a base, reta, nasce de uma linha só.', 'Up to 24 px thick. The data end has a 4 px radius; the straight base grows from a single line.', 'Hasta 24 px de grosor. El extremo de datos con radio de 4 px; la base, recta, nace de una sola línea.'), `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__baseline" d="M20 84.5H140"/>
      <path class="ds-chart__bar" style="--c:${S(1)}" d="M68 84V28A4 4 0 0 1 72 24H88A4 4 0 0 1 92 28V84Z"/>
      <path class="gv-measure" d="M68 14H92M68 10V18M92 10V18"/>
      <text class="gv-measure__text" x="80" y="8" text-anchor="middle">24</text>
      <path class="gv-measure gv-measure--strong" d="M88 24A4 4 0 0 1 92 28"/><path class="gv-measure" d="M96 26H104"/><text class="gv-measure__text" x="107" y="29">${L('raio 4', 'radius 4', 'radio 4')}</text>
      <path class="gv-measure" d="M96 84H104"/><text class="gv-measure__text" x="107" y="87">${L('base reta', 'flat base', 'base recta')}</text>
    </svg>`],
  [L('Linha', 'Line', 'Línea'), L('2 px, com pontas e junções arredondadas. Nada de linhas finas demais para ler nem grossas a ponto de pesar.', '2 px, with rounded caps and joins. No lines too thin to read or so thick they weigh the chart down.', '2 px, con extremos y uniones redondeados. Nada de líneas demasiado finas para leer ni tan gruesas que pesen.'), `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__grid" d="M16 76.5H144M16 44.5H144"/>
      <path class="ds-chart__line" style="--c:${S(2)}" d="M16 70 44 58 72 62 100 36 128 30 144 22"/>
      <text class="gv-measure__text" x="100" y="24" text-anchor="middle">2 px</text>
    </svg>`],
  [L('Marcador', 'Marker', 'Marcador'), L('8 px, com anel de 2 px na cor da superfície — o ponto continua legível onde cruza uma linha.', '8 px, with a 2 px ring in the surface color — the dot stays legible where it crosses a line.', '8 px, con anillo de 2 px del color de la superficie — el punto sigue legible donde cruza una línea.'), `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__line" style="--c:${S(2)}" d="M16 70 80 40 144 30"/>
      <path class="ds-chart__line" style="--c:${S(1)}" d="M16 30 80 44 144 72"/>
      <circle class="ds-chart__dot" style="--c:${S(1)}" cx="80" cy="44" r="6"/>
      <circle class="gv-ring-guide" cx="80" cy="44" r="10"/>
    </svg>`],
  [L('Respiro de 2 px', '2 px of breathing room', 'Respiro de 2 px'), L('Um vão na cor da superfície separa segmentos empilhados e barras vizinhas. Nunca um contorno em volta.', 'A gap in the surface color separates stacked segments and neighboring bars. Never an outline around them.', 'Un hueco del color de la superficie separa segmentos apilados y barras vecinas. Nunca un contorno alrededor.'), `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__baseline" d="M20 84.5H140"/>
      <path class="ds-chart__bar" style="--c:${S(1)}" d="M52 84H76V60H52Z"/>
      <path class="ds-chart__bar" style="--c:${S(2)}" d="M52 58H76V38H52Z"/>
      <path class="ds-chart__bar" style="--c:${S(3)}" d="M52 36H76V24A4 4 0 0 0 72 20H56A4 4 0 0 0 52 24Z"/>
      <path class="ds-chart__bar" style="--c:${S(1)}" d="M88 84V44A4 4 0 0 1 92 40H104A4 4 0 0 1 108 44V84Z"/>
      <path class="ds-chart__bar" style="--c:${S(2)}" d="M110 84V54A4 4 0 0 1 114 50H126A4 4 0 0 1 130 54V84Z"/>
    </svg>`],
  [L('Área', 'Area', 'Área'), L('A cor da série a 10% sob a linha: uma lavagem, nunca um bloco saturado.', 'The series color at 10% under the line: a wash, never a saturated block.', 'El color de la serie al 10% bajo la línea: un lavado, nunca un bloque saturado.'), `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__area" style="--c:${S(1)}" d="M16 66 44 54 72 58 100 34 128 28 144 20V84H16Z"/>
      <path class="ds-chart__line" style="--c:${S(1)}" d="M16 66 44 54 72 58 100 34 128 28 144 20"/>
      <path class="ds-chart__baseline" d="M16 84.5H144"/>
    </svg>`],
  [L('Grade e meta', 'Grid and goal', 'Cuadrícula y meta'), L('Grade de 1 px, sólida e um passo fora da superfície. O tracejado é reservado para meta e limite.', 'A 1 px grid, solid and one step off the surface. Dashes are reserved for goals and limits.', 'Cuadrícula de 1 px, sólida y un paso fuera de la superficie. El trazo discontinuo se reserva para meta y límite.'), `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__grid" d="M16 20.5H144M16 44.5H144M16 68.5H144"/>
      <path class="ds-chart__baseline" d="M16 84.5H144"/>
      <path class="ds-chart__target" d="M16 32.5H144"/>
      <text class="ds-chart__target-label" x="18" y="27">${L('Meta', 'Goal', 'Meta')}</text>
    </svg>`],
];

/* ───────── Uso ───────── */

const others = () => L('Outros', 'Others', 'Otros');

const USAGE = () => [
  ['dont', L('Evite: dois eixos verticais', 'Avoid: two vertical axes', 'Evita: dos ejes verticales'), L('O alinhamento entre as escalas é arbitrário e inventa uma correlação. Use dois gráficos ou um índice com base 100.', 'The alignment between the scales is arbitrary and invents a correlation. Use two charts or an index based at 100.', 'La alineación entre las escalas es arbitraria e inventa una correlación. Usa dos gráficos o un índice con base 100.'), `<svg viewBox="0 0 200 72" aria-hidden="true">
      <path class="ds-chart__baseline" d="M24.5 6V64.5H176.5V6"/>
      <path class="ds-chart__line" style="--c:${S(1)}" d="M28 56 60 48 92 50 124 30 172 14"/>
      <path class="ds-chart__line" style="--c:${S(2)}" d="M28 20 60 30 92 26 124 40 172 52"/>
      <text class="ds-chart__tick" x="18" y="12" text-anchor="end">30k</text><text class="ds-chart__tick" x="182" y="12">800k</text>
    </svg>`],
  ['dont', L('Evite: arco-íris na escala', 'Avoid: a rainbow scale', 'Evita: arcoíris en la escala'), L('Magnitude é um tom só, do claro ao escuro. Vários tons fazem o olho procurar categorias que não existem.', 'Magnitude is a single hue, from light to dark. Many hues make the eye look for categories that don’t exist.', 'La magnitud es un solo tono, del claro al oscuro. Varios tonos hacen que el ojo busque categorías que no existen.'), `<div class="gv-usage-strip">${['blue-500', 'teal-500', 'green-500', 'amber-500', 'red-500', 'pink-500', 'violet-500'].map((c) => `<span style="background:var(--ds-color-${c})"></span>`).join('')}</div>`],
  ['do', L('Faça: a cor segue a entidade', 'Do: color follows the entity', 'Haz: el color sigue a la entidad'), L('Filtrou ou escondeu uma série? As que ficaram mantêm a cor. Quem aprendeu “App é azul” não pode ser enganado.', 'Filtered or hid a series? The remaining ones keep their color. Whoever learned “App is blue” must not be misled.', '¿Filtraste u ocultaste una serie? Las que quedaron mantienen el color. Quien aprendió “App es azul” no puede ser engañado.'), `<div class="gv-usage-keys">${channels().series.slice(0, 3).map((s, i) => `<span class="gv-usage-key${i === 1 ? ' is-off' : ''}"><i style="--c:${S(i + 1)}"></i>${s.name}</span>`).join('')}</div>`],
  ['tip', L('Rosca só para parte do todo', 'Donuts only for part of a whole', 'Dona solo para parte del todo'), L('Até 6 fatias; da 6ª em diante, “Outros”. Para comparar valores próximos, barras leem muito melhor.', 'Up to 6 slices; from the 6th on, “Others”. To compare close values, bars read much better.', 'Hasta 6 porciones; de la 6.ª en adelante, “Otros”. Para comparar valores cercanos, las barras se leen mucho mejor.'), `<div class="gv-usage-donut">${MINI.donut()}</div>`],
  ['dont', L('Evite: um número em cada ponto', 'Avoid: a number on every point', 'Evita: un número en cada punto'), L('Rotule o fim, o pico ou a série da história. O eixo, o tooltip e a tabela levam o resto.', 'Label the end, the peak, or the series that tells the story. The axis, tooltip, and table carry the rest.', 'Etiqueta el final, el pico o la serie de la historia. El eje, el tooltip y la tabla llevan el resto.'), `<svg viewBox="0 0 200 72" aria-hidden="true">
      <path class="ds-chart__line" style="--c:${S(1)}" d="M16 56 44 48 72 50 100 34 128 30 156 22 184 14"/>
      ${[[16, 56], [44, 48], [72, 50], [100, 34], [128, 30], [156, 22], [184, 14]].map(([x, y], i) => `<text class="ds-chart__value" x="${x}" y="${y - 8}" text-anchor="middle">${[12, 15, 14, 21, 23, 26, 30][i]}</text>`).join('')}
    </svg>`],
  ['do', L('Faça: mais de 8 séries, agrupe', 'Do: more than 8 series, group them', 'Haz: más de 8 series, agrupa'), L('Não existe 9ª cor. A cauda vira “Outros”, ou o gráfico vira pequenos múltiplos.', 'There’s no 9th color. The tail becomes “Others”, or the chart becomes small multiples.', 'No existe 9.º color. La cola se vuelve “Otros”, o el gráfico se vuelve pequeños múltiplos.'), `<div class="gv-usage-keys">${[1, 2, 3, 4, 5].map((n) => `<span class="gv-usage-key"><i style="--c:${S(n)}"></i>${n}</span>`).join('')}<span class="gv-usage-key"><i style="--c:var(--ds-color-chart-other)"></i>${others()}</span></div>`],
];

/* ───────── API ───────── */

const OPTIONS = () => [
  ['title · subtitle', L('Título e linha de apoio na moldura. O título também nomeia o gráfico para leitores de tela.', 'Title and supporting line in the frame. The title also names the chart for screen readers.', 'Título y línea de apoyo en el marco. El título también nombra el gráfico para lectores de pantalla.')],
  ['label', L('Nome acessível quando não há título visível.', 'Accessible name when there’s no visible title.', 'Nombre accesible cuando no hay título visible.')],
  ['card', L('Superfície com contorno e raio — para painéis.', 'A surface with outline and radius — for dashboards.', 'Superficie con contorno y radio — para paneles.')],
  ['height', L('Altura total, já contando a faixa do eixo x. Barras horizontais crescem com o número de linhas.', 'Total height, including the x-axis band. Horizontal bars grow with the number of rows.', 'Altura total, contando la franja del eje x. Las barras horizontales crecen con el número de filas.')],
  ['format · axisFormat', L('Formato dos valores (tooltip, rótulos, tabela) e do eixo. O eixo compacta sozinho a partir de mil.', 'Format of the values (tooltip, labels, table) and of the axis. The axis compacts on its own from a thousand.', 'Formato de los valores (tooltip, etiquetas, tabla) y del eje. El eje se compacta solo a partir de mil.')],
  ['table', L('Botão “Ver como tabela”. Ligado por padrão — desligue só se a tabela estiver na tela.', '“View as table” button. On by default — turn it off only if the table is on screen.', 'Botón “Ver como tabla”. Activado por defecto — desactívalo solo si la tabla está en pantalla.')],
  ['texture', L('Hachura em 45° e 135° como canal de reserva (daltonismo total, impressão).', 'Hatching at 45° and 135° as a backup channel (total color blindness, print).', 'Rayado a 45° y 135° como canal de reserva (daltonismo total, impresión).')],
  ['empty', L('Texto do estado vazio.', 'Empty state text.', 'Texto del estado vacío.')],
];

const PRESETS = [
  ['number', 1234.56],
  ['integer', 1234.56],
  ['compact', 1284000],
  ['percent', 0.124],
  ['currency', 1234.56],
  ['currency-compact', 1284000],
];

const NAV = () => [
  ['vg-exemplo', L('Exemplo', 'Example', 'Ejemplo')],
  ['vg-forma', L('Qual gráfico', 'Which chart', 'Qué gráfico')],
  ['vg-cores', L('Cores', 'Color', 'Colores')],
  ['vg-anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
  ['vg-marcas', L('Marcas', 'Marks', 'Marcas')],
  ['vg-interacao', L('Interação', 'Interaction', 'Interacción')],
  ['vg-acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
  ['vg-tokens', 'Tokens'],
  ['vg-uso', L('Uso', 'Usage', 'Uso')],
  ['vg-api', 'API'],
];

const section = (id, title, desc, body) => `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header"><div>
      <h2 class="doc-section__title" id="${id}-title">${title}</h2>
      <p class="doc-section__desc">${desc}</p>
    </div></header>
    ${body}
  </section>`;

const strip = (prefix, n) => `<div class="gv-strip">${Array.from({ length: n }, (_, i) => `<span style="background:var(--ds-color-chart-${prefix}-${i + 1})"${prefix === 'div' && i === 3 ? ' data-mid' : ''}></span>`).join('')}</div>`;

/* ───────── Página ───────── */

export default function renderVisaoGeral(page) {
  const scales = SCALES();
  const minIn = perTheme((id) => ratio(minContrast(id), 1));
  return `
  <div class="page doc gv">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${L('Gráficos', 'Charts', 'Gráficos')}</h1>
        <p class="doc-header__lead">${L('Dados que se leem de relance e aguentam um segundo olhar. Marcas finas, uma cor por papel, rótulos só onde importam — e toda informação acessível por teclado e em tabela.', 'Data that reads at a glance and holds up to a second look. Thin marks, one color per role, labels only where they matter — and every piece of information reachable by keyboard and as a table.', 'Datos que se leen de un vistazo y aguantan una segunda mirada. Marcas finas, un color por función, etiquetas solo donde importan — y toda la información accesible por teclado y en tabla.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('formas', 'forms', 'formas')}</dt><dd class="doc-stat__value">6</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('cores categóricas', 'categorical colors', 'colores categóricos')}</dt><dd class="doc-stat__value">${SLOTS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('pior ΔE entre vizinhas', 'worst ΔE between neighbors', 'peor ΔE entre vecinos')}</dt><dd class="doc-stat__value">${fmt1(11.7)}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('contraste das marcas', 'mark contrast', 'contraste de las marcas')}</dt><dd class="doc-stat__value">≥ ${ratio(Math.floor(minContrast() * 10) / 10, 1)}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'vg-exemplo',
      L('Exemplo ao vivo', 'Live example', 'Ejemplo en vivo'),
      L('Um painel com filtro único no topo: o período vale para tudo abaixo dele, então os números sempre concordam. Ao trocar, os gráficos seguram o desenho anterior enquanto atualizam — sem esqueleto, sem pulo.', 'A dashboard with a single filter at the top: the period applies to everything below it, so the numbers always agree. When it changes, the charts hold the previous drawing while they update — no skeleton, no jump.', 'Un panel con un solo filtro arriba: el período vale para todo lo que está debajo, así que los números siempre concuerdan. Al cambiar, los gráficos mantienen el dibujo anterior mientras se actualizan — sin esqueleto, sin saltos.'),
      `<div class="gv-dash" data-dash>
        <div class="gv-dash__filters">
          <span class="gv-dash__filter-label" id="vg-periodo-label">${L('Período', 'Period', 'Período')}</span>
          <div class="ds-segmented gv-range" role="radiogroup" aria-labelledby="vg-periodo-label">
            ${RANGES().map((r) => `<button type="button" class="ds-segmented__item" role="radio" data-range="${r.value}" aria-checked="${r.value === '30d'}" tabindex="${r.value === '30d' ? 0 : -1}">${r.label}</button>`).join('')}
          </div>
          <span class="gv-dash__note" data-dash-note></span>
        </div>
        <div class="gv-dash__kpis" data-dash-kpis aria-live="polite"></div>
        <div class="gv-dash__line" data-dash-line></div>
        <div class="gv-dash__row">
          <div data-dash-bars></div>
          <div data-dash-donut></div>
        </div>
      </div>`,
    )}

    ${section(
      'vg-forma',
      L('Qual gráfico usar', 'Which chart to use', 'Qué gráfico usar'),
      L('Escolha pela tarefa de quem lê, antes de pensar em cor. Às vezes a resposta certa nem é um gráfico.', 'Choose by the reader’s task, before thinking about color. Sometimes the right answer isn’t a chart at all.', 'Elige por la tarea de quien lee, antes de pensar en el color. A veces la respuesta correcta ni siquiera es un gráfico.'),
      `<div class="gv-forms">
        ${FORMS().map(
          ([mini, job, name, text, href]) => `<a class="gv-form" href="#${href}">
            <div class="gv-form__preview">${MINI[mini]()}</div>
            <div class="gv-form__body">
              <p class="gv-form__job">${job}</p>
              <p class="gv-form__name">${name}${icon('arrow-right', { size: 16 })}</p>
              <p class="gv-form__text">${text}</p>
            </div>
          </a>`,
        ).join('')}
      </div>
      <h3 class="doc-subhead">${L('Quando não é gráfico', 'When it isn’t a chart', 'Cuándo no es un gráfico')}</h3>
      <div class="gv-notchart">
        <div class="gv-notchart__item">${icon('gauge', { size: 20 })}<div><p class="gv-notchart__title">${L('Um valor só', 'A single value', 'Un solo valor')}</p><p class="gv-notchart__text">${L('Uma coluna sozinha ou uma pizza de duas fatias viram um <a href="#/graficos/indicadores">indicador</a>. O número é o gráfico.', 'A lone column or a two-slice pie becomes an <a href="#/graficos/indicadores">indicator</a>. The number is the chart.', 'Una columna sola o una torta de dos porciones se vuelven un <a href="#/graficos/indicadores">indicador</a>. El número es el gráfico.')}</p></div></div>
        <div class="gv-notchart__item">${icon('table', { size: 20 })}<div><p class="gv-notchart__title">${L('Valores exatos ou mais de 7 classes', 'Exact values or more than 7 classes', 'Valores exactos o más de 7 clases')}</p><p class="gv-notchart__text">${L('Acima de 7 cores com significado, as vizinhas se confundem. Use uma <a href="#/componentes/tabela">tabela</a> — ou tabela e gráfico juntos.', 'Beyond 7 meaningful colors, neighbors get confused. Use a <a href="#/componentes/tabela">table</a> — or a table and a chart together.', 'Por encima de 7 colores con significado, los vecinos se confunden. Usa una <a href="#/componentes/tabela">tabla</a> — o tabla y gráfico juntos.')}</p></div></div>
        <div class="gv-notchart__item">${icon('target', { size: 20 })}<div><p class="gv-notchart__title">${L('Uma série é a história', 'One series is the story', 'Una serie es la historia')}</p><p class="gv-notchart__text">${L('Destaque essa série na cor e deixe as outras em cinza. Ênfase é mais clara que oito cores disputando atenção.', 'Highlight that series in color and leave the others gray. Emphasis is clearer than eight colors fighting for attention.', 'Destaca esa serie en color y deja las demás en gris. El énfasis es más claro que ocho colores disputando la atención.')}</p></div></div>
      </div>`,
    )}

    ${section(
      'vg-cores',
      L('Cores', 'Color', 'Colores'),
      L('Cada cor faz um trabalho só: identidade (categórica), quantidade (sequencial), etapa (ordinal), lado de uma referência (divergente) ou estado (status). E nenhuma foi escolhida no olho — a ordem saiu de um validador.', 'Each color does one job: identity (categorical), quantity (sequential), step (ordinal), side of a reference (diverging), or state (status). And none was picked by eye — the order came from a validator.', 'Cada color hace un solo trabajo: identidad (categórico), cantidad (secuencial), etapa (ordinal), lado de una referencia (divergente) o estado (status). Y ninguno se eligió a ojo — el orden salió de un validador.'),
      `<h3 class="doc-subhead">${L('Categóricas', 'Categorical', 'Categóricos')} <span class="doc-subhead__meta">${L('identidade · ordem fixa, nunca recicle', 'identity · fixed order, never recycle', 'identidad · orden fijo, nunca recicles')}</span></h3>
      <ol class="gv-slots" role="list">
        ${SLOTS.map(
          (s) => `<li class="gv-slot">
            <span class="gv-slot__swatch" style="background:var(${s.cssVar})"></span>
            <div class="gv-slot__body">
              <p class="gv-slot__name"><span class="gv-slot__n">${s.n}</span>${slotName(s)}</p>
              <p class="gv-slot__meta"><code>${s.step}</code><span>${s.dark.toUpperCase()}</span></p>
            </div>
          </li>`,
        ).join('')}
      </ol>
      <p class="gv-note">${L('Os mesmos tons passaram nos dois temas — validados contra a superfície escura e a clara; o Lume claro usa os mesmos do Laranja. Da 9ª série em diante não existe cor nova: a cauda vira “Outros”.', 'The same hues passed in both themes — validated against the dark and the light surface; Lume light uses the same as Orange. From the 9th series on there’s no new color: the tail becomes “Others”.', 'Los mismos tonos pasaron en los dos temas — validados contra la superficie oscura y la clara; Lume claro usa los mismos que el Naranja. De la 9.ª serie en adelante no hay color nuevo: la cola se vuelve “Otros”.')}</p>

      <div class="gv-checks">
        <div class="gv-check"><p class="gv-check__value">${fmt1(11.7)}</p><p class="gv-check__label">${L('pior ΔE entre vizinhas com protanopia e deuteranopia', 'worst ΔE between neighbors with protanopia and deuteranopia', 'peor ΔE entre vecinos con protanopia y deuteranopia')}</p><p class="gv-check__goal">${L('alvo ≥ 8', 'target ≥ 8', 'objetivo ≥ 8')}</p></div>
        <div class="gv-check"><p class="gv-check__value">${fmt1(18.5)}</p><p class="gv-check__label">${L('pior ΔE entre vizinhas com visão típica', 'worst ΔE between neighbors with typical vision', 'peor ΔE entre vecinos con visión típica')}</p><p class="gv-check__goal">${L('mínimo 15', 'minimum 15', 'mínimo 15')}</p></div>
        <div class="gv-check"><p class="gv-check__value">${fmt1(11.8)} · ${fmt1(15.1)}</p><p class="gv-check__label">${L('as 3 primeiras em todos os pares, para dispersão', 'the first 3 across all pairs, for scatter', 'los 3 primeros en todos los pares, para dispersión')}</p><p class="gv-check__goal">${L('daltonismo · visão típica', 'color blindness · typical vision', 'daltonismo · visión típica')}</p></div>
        <div class="gv-check"><p class="gv-check__value">${THEME_IDS.map((id) => fmt1(minContrast(id))).join(' · ')}</p><p class="gv-check__label">${L('menor contraste de uma marca com a superfície', 'lowest contrast of a mark against the surface', 'menor contraste de una marca con la superficie')}</p><p class="gv-check__goal">${THEME_IDS.map(themeLabel).join(' · ')} · ${L('mínimo 3:1', 'minimum 3:1', 'mínimo 3:1')}</p></div>
      </div>

      <div class="gv-cvd">
        ${[
          [L('Visão típica', 'Typical vision', 'Visión típica'), null],
          [L('Protanopia', 'Protanopia', 'Protanopia'), 'protan'],
          [L('Deuteranopia', 'Deuteranopia', 'Deuteranopia'), 'deutan'],
        ]
          .map(
            ([label, kind]) => `<div class="gv-cvd__row">
              <span class="gv-cvd__label">${label}</span>
              <span class="gv-cvd__swatches">${SLOTS.map((s) => `<span style="background:${kind ? simulate(s.dark, kind) : s.dark}"></span>`).join('')}</span>
            </div>`,
          )
          .join('')}
        <p class="gv-cvd__caption">${L('Simulação de Machado, Oliveira e Fernandes (2009). Vizinhas continuam distintas mesmo sem distinguir vermelho e verde.', 'Simulation by Machado, Oliveira, and Fernandes (2009). Neighbors stay distinct even without telling red from green.', 'Simulación de Machado, Oliveira y Fernandes (2009). Los vecinos siguen siendo distintos aun sin distinguir rojo y verde.')}</p>
      </div>

      <h3 class="doc-subhead">${L('Escalas', 'Scales', 'Escalas')} <span class="doc-subhead__meta">${L('um tom por trabalho · cada tema com os seus passos', 'one hue per job · each theme with its own steps', 'un tono por trabajo · cada tema con sus pasos')}</span></h3>
      <div class="gv-themes">
        ${THEME_IDS.map((id) => [id, themeIcon(id), themeLabel(id)])
          .map(
            ([mode, glyph, label]) => `<div class="gv-theme" data-theme="${mode}">
              <p class="gv-theme__name">${icon(glyph, { size: 16 })}${label}</p>
              ${scales.map(
                ([prefix, name, n, , ends]) => `<div class="gv-scale">
                  <p class="gv-scale__name">${name}<code>chart.${prefix}.1–${n}</code></p>
                  ${strip(prefix, n)}
                  <p class="gv-scale__ends"><span>${ends[0]}</span>${prefix === 'div' ? `<span>${L('neutro', 'neutral', 'neutro')}</span>` : ''}<span>${ends[1]}</span></p>
                </div>`,
              ).join('')}
            </div>`,
          )
          .join('')}
      </div>
      <ul class="gv-scale-notes" role="list">
        ${scales.map(([, name, , text]) => `<li><strong>${name}.</strong> ${text}</li>`).join('')}
      </ul>

      <div class="gv-split">
        <div>
          <h3 class="doc-subhead">Status <span class="doc-subhead__meta">${L('reservadas', 'reserved', 'reservados')}</span></h3>
          <ul class="gv-status" role="list">
            ${STATUS().map(
              ([tone, glyph, label, text, token]) => `<li class="gv-status__item">
                <span class="gv-status__swatch" style="background:var(--ds-color-${token})"></span>
                <span class="gv-status__label" data-tone="${tone}">${icon(glyph, { size: 16 })}${label}</span>
                <span class="gv-status__text">${text}</span>
              </li>`,
            ).join('')}
          </ul>
          <p class="gv-note">${L('Só quando a cor <em>significa</em> bom ou ruim — e sempre com ícone e texto. Nunca como “série 4”.', 'Only when the color <em>means</em> good or bad — and always with an icon and text. Never as “series 4”.', 'Solo cuando el color <em>significa</em> bueno o malo — y siempre con ícono y texto. Nunca como “serie 4”.')}</p>
        </div>
        <div>
          <h3 class="doc-subhead">${L('Contexto', 'Context', 'Contexto')}</h3>
          <ul class="gv-status" role="list">
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-muted)"></span><span class="gv-status__label"><code>chart.muted</code></span><span class="gv-status__text">${L('Ênfase: o resto em cinza, para uma série se destacar', 'Emphasis: the rest in gray, so one series stands out', 'Énfasis: el resto en gris, para que una serie destaque')}</span></li>
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-other)"></span><span class="gv-status__label"><code>chart.other</code></span><span class="gv-status__text">${L('“Outros”: a cauda agrupada', '“Others”: the grouped tail', '“Otros”: la cola agrupada')}</span></li>
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-grid)"></span><span class="gv-status__label"><code>chart.grid</code></span><span class="gv-status__text">${L('Grade e célula sem dado', 'Grid and cells without data', 'Cuadrícula y celda sin dato')}</span></li>
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-axis)"></span><span class="gv-status__label"><code>chart.axis</code></span><span class="gv-status__text">${L('Linha de base, eixos e mira', 'Baseline, axes, and crosshair', 'Línea base, ejes y mira')}</span></li>
          </ul>
        </div>
      </div>

      <h3 class="doc-subhead">${L('A cor segue a entidade', 'Color follows the entity', 'El color sigue a la entidad')} <span class="doc-subhead__meta">${L('experimente', 'try it', 'pruébalo')}</span></h3>
      <div data-color-demo></div>`,
    )}

    ${section(
      'vg-anatomia',
      L('Anatomia', 'Anatomy', 'Anatomía'),
      L('Sete peças, sempre no mesmo lugar. O título nomeia o que está plotado; com uma série só, nem precisa de legenda.', 'Seven pieces, always in the same place. The title names what’s plotted; with a single series, there’s no need for a legend.', 'Siete piezas, siempre en el mismo lugar. El título nombra lo que está graficado; con una sola serie, ni hace falta leyenda.'),
      `<div class="gv-anatomy">
        <div class="gv-anatomy__stage" data-anatomy-stage>
          <div class="gv-anatomy__chart" data-anatomy inert></div>
          <div class="gv-anatomy__pins" data-anatomy-pins aria-hidden="true"></div>
        </div>
        <ol class="gv-anatomy__legend" role="list">
          ${[
            [L('Título e subtítulo', 'Title and subtitle', 'Título y subtítulo'), L('O que está plotado e em que unidade. Frase curta, sem dois-pontos.', 'What’s plotted and in which unit. A short phrase, no colon.', 'Qué está graficado y en qué unidad. Frase corta, sin dos puntos.')],
            [L('Legenda', 'Legend', 'Leyenda'), L('Sempre que houver duas séries ou mais. A chave espelha a marca: traço para linha, quadrado para barra.', 'Whenever there are two or more series. The key mirrors the mark: a stroke for lines, a square for bars.', 'Siempre que haya dos series o más. La clave refleja la marca: trazo para línea, cuadrado para barra.')],
            [L('Eixo e grade', 'Axis and grid', 'Eje y cuadrícula'), L('Fios de 1 px, recessivos. Marcas redondas, compactadas a partir de mil.', '1 px recessive lines. Round ticks, compacted from a thousand.', 'Líneas de 1 px, recesivas. Marcas redondas, compactadas a partir de mil.')],
            [L('Marca', 'Mark', 'Marca'), L('A única coisa com cor forte. Linha de 2 px, ponto final de 8 px com anel.', 'The only thing with strong color. A 2 px line, an 8 px end dot with a ring.', 'Lo único con color fuerte. Línea de 2 px, punto final de 8 px con anillo.')],
            [L('Rótulo direto', 'Direct label', 'Etiqueta directa'), L('No fim da linha, só se não colidir. Texto na cor de texto — nunca na cor da série.', 'At the end of the line, only if it doesn’t collide. Text in the text color — never in the series color.', 'Al final de la línea, solo si no choca. Texto en el color de texto — nunca en el color de la serie.')],
            ['Tooltip', L('No hover e no foco. O valor vem primeiro e forte; o nome da série, depois.', 'On hover and focus. The value comes first and strong; the series name, after.', 'Con hover y foco. El valor viene primero y fuerte; el nombre de la serie, después.')],
            [L('Tabela', 'Table', 'Tabla'), L('O gêmeo acessível: todos os números, inclusive os que o gráfico não rotula.', 'The accessible twin: every number, including the ones the chart doesn’t label.', 'El gemelo accesible: todos los números, incluso los que el gráfico no etiqueta.')],
          ]
            .map(([title, text], i) => `<li><span class="gv-anatomy__num">${i + 1}</span><div><p class="gv-anatomy__title">${title}</p><p class="gv-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'vg-marcas',
      L('Marcas e respiro', 'Marks and breathing room', 'Marcas y respiro'),
      L('O visual calmo vem de poucas medidas fixas e de dois espaços negativos. Só o dado pode ser barulhento.', 'The calm look comes from a few fixed measurements and two negative spaces. Only the data gets to be loud.', 'El aspecto tranquilo viene de pocas medidas fijas y de dos espacios negativos. Solo el dato puede ser ruidoso.'),
      `<div class="gv-marks">
        ${MARKS().map(([title, text, svg]) => `<article class="gv-mark"><div class="gv-mark__preview">${svg}</div><div class="gv-mark__body"><p class="gv-mark__title">${title}</p><p class="gv-mark__text">${text}</p></div></article>`).join('')}
      </div>`,
    )}

    ${section(
      'vg-interacao',
      L('Interação', 'Interaction', 'Interacción'),
      L('Todo gráfico já vem interativo. O tooltip complementa, nunca é o único caminho até um valor.', 'Every chart comes interactive. The tooltip complements — it’s never the only way to a value.', 'Todo gráfico ya viene interactivo. El tooltip complementa, nunca es el único camino hasta un valor.'),
      `<div class="gv-interact">
        <div data-interact-chart></div>
        <ul class="gv-interact__list" role="list">
          <li>${icon('message-square', { size: 18 })}<div><p class="gv-interact__title">Tooltip</p><p class="gv-interact__text">${L('Valor forte, nome apagado, chave em traço. Em linhas, mostra todas as séries daquele ponto.', 'Strong value, muted name, a stroke key. On lines, it shows every series at that point.', 'Valor fuerte, nombre atenuado, clave en trazo. En líneas, muestra todas las series de ese punto.')}</p></div></li>
          <li>${icon('line-chart', { size: 18 })}<div><p class="gv-interact__title">${L('Mira', 'Crosshair', 'Mira')}</p><p class="gv-interact__text">${L('Um fio vertical encontra a data mais próxima. Ninguém precisa acertar uma linha de 2 px.', 'A vertical line finds the closest date. No one has to hit a 2 px line.', 'Una línea vertical encuentra la fecha más cercana. Nadie necesita acertar una línea de 2 px.')}</p></div></li>
          <li>${icon('eye', { size: 18 })}<div><p class="gv-interact__title">${L('Legenda que esconde', 'A legend that hides', 'Leyenda que oculta')}</p><p class="gv-interact__text">${L('Clique numa série para tirá-la do gráfico. As outras não mudam de cor.', 'Click a series to remove it from the chart. The others don’t change color.', 'Haz clic en una serie para sacarla del gráfico. Las demás no cambian de color.')}</p></div></li>
          <li>${icon('table', { size: 18 })}<div><p class="gv-interact__title">${L('Tabela', 'Table', 'Tabla')}</p><p class="gv-interact__text">${L('O ícone no canto troca o gráfico pelos números.', 'The icon in the corner swaps the chart for the numbers.', 'El ícono de la esquina cambia el gráfico por los números.')}</p></div></li>
          <li>${icon('corner-down-left', { size: 18 })}<div><p class="gv-interact__title">${L('Teclado', 'Keyboard', 'Teclado')} <span class="gv-interact__kbd"><kbd class="ds-kbd">Tab</kbd><kbd class="ds-kbd">←</kbd><kbd class="ds-kbd">→</kbd><kbd class="ds-kbd">Home</kbd><kbd class="ds-kbd">End</kbd><kbd class="ds-kbd">Esc</kbd></span></p><p class="gv-interact__text">${L('Tab foca o gráfico; as setas percorrem os pontos e o leitor de tela anuncia cada um.', 'Tab focuses the chart; the arrows walk through the points and the screen reader announces each one.', 'Tab enfoca el gráfico; las flechas recorren los puntos y el lector de pantalla anuncia cada uno.')}</p></div></li>
        </ul>
      </div>`,
    )}

    ${section(
      'vg-acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('Decisões que já vêm prontas em todos os gráficos — e as que continuam sendo suas.', 'Decisions that come built into every chart — and the ones that are still yours.', 'Decisiones que ya vienen listas en todos los gráficos — y las que siguen siendo tuyas.'),
      a11yList([
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L('Duas séries ou mais têm legenda; até quatro, também rótulo direto. Status vem com ícone e texto.', 'Two or more series get a legend; up to four, a direct label too. Status comes with an icon and text.', 'Dos series o más tienen leyenda; hasta cuatro, también etiqueta directa. El estado viene con ícono y texto.')],
        [L('Paleta validada para daltonismo', 'A colorblind-validated palette', 'Paleta validada para daltonismo'), L('Vizinhas separadas por ΔE ≥ 8 com protanopia e deuteranopia, e ≥ 15 com visão típica, nos três temas.', 'Neighbors separated by ΔE ≥ 8 with protanopia and deuteranopia, and ≥ 15 with typical vision, in all three themes.', 'Vecinos separados por ΔE ≥ 8 con protanopia y deuteranopia, y ≥ 15 con visión típica, en los tres temas.')],
        [L('Tabela em todo gráfico', 'A table in every chart', 'Tabla en todo gráfico'), L('O botão “Ver como tabela” mostra todos os números. É o equivalente acessível, não um extra.', 'The “View as table” button shows every number. It’s the accessible equivalent, not an extra.', 'El botón “Ver como tabla” muestra todos los números. Es el equivalente accesible, no un extra.')],
        [L('Teclado e leitor de tela', 'Keyboard and screen reader', 'Teclado y lector de pantalla'), L('O gráfico recebe foco, as setas percorrem os valores e uma região ao vivo anuncia cada um.', 'The chart takes focus, the arrows walk through the values, and a live region announces each one.', 'El gráfico recibe foco, las flechas recorren los valores y una región en vivo anuncia cada uno.'), ['Tab', '←', '→', 'Esc']],
        [L('Contraste das marcas', 'Mark contrast', 'Contraste de las marcas'), L(`Toda cor categórica passa de 3:1 contra a superfície — ${minIn}, no pior caso.`, `Every categorical color passes 3:1 against the surface — ${minIn}, in the worst case.`, `Todo color categórico supera 3:1 contra la superficie — ${minIn}, en el peor caso.`)],
        [L('Textura de reserva', 'Backup texture', 'Textura de reserva'), L(`Com ${ic('texture: true')}, barras e fatias ganham hachura em 45° e 135° — também na impressão e em alto contraste.`, `With ${ic('texture: true')}, bars and slices get hatching at 45° and 135° — in print and high contrast too.`, `Con ${ic('texture: true')}, barras y porciones reciben rayado a 45° y 135° — también en la impresión y en alto contraste.`)],
        [L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido'), L(`A entrada anima uma vez, quando o gráfico aparece. Com ${ic('prefers-reduced-motion')}, não anima.`, `The entrance animates once, when the chart appears. With ${ic('prefers-reduced-motion')}, it doesn’t.`, `La entrada se anima una vez, cuando aparece el gráfico. Con ${ic('prefers-reduced-motion')}, no se anima.`)],
        [L('Texto dos dados é seu', 'Data text is yours', 'El texto de los datos es tuyo'), L('Nomes de série e categoria entram como texto, nunca como HTML — vêm de planilhas e APIs.', 'Series and category names go in as text, never as HTML — they come from spreadsheets and APIs.', 'Los nombres de serie y categoría entran como texto, nunca como HTML — vienen de planillas y APIs.')],
      ]),
    )}

    ${section(
      'vg-tokens',
      'Tokens',
      L(`Marcas consomem ${ic('color.chart.*')}; textos, sempre ${ic('color.fg.*')}. Troque a marca e o gráfico troca junto.`, `Marks consume ${ic('color.chart.*')}; text, always ${ic('color.fg.*')}. Change the brand and the chart changes with it.`, `Las marcas consumen ${ic('color.chart.*')}; los textos, siempre ${ic('color.fg.*')}. Cambia la marca y el gráfico cambia con ella.`),
      tokenTable([
        ...SLOTS.map((s) => [`color.chart.series.${s.n}`, `${L('Série', 'Series', 'Serie')} ${s.n} · ${slotName(s)}`]),
        ['color.chart.muted', L('Contexto em cinza (ênfase)', 'Gray context (emphasis)', 'Contexto en gris (énfasis)')],
        ['color.chart.other', L('“Outros”', '“Others”', '“Otros”')],
        ...Array.from({ length: 7 }, (_, i) => [`color.chart.seq.${i + 1}`, `${L('Sequencial', 'Sequential', 'Secuencial')} ${i + 1}${i === 0 ? ` · ${L('pouco', 'little', 'poco')}` : i === 6 ? ` · ${L('muito', 'a lot', 'mucho')}` : ''}`]),
        ...Array.from({ length: 5 }, (_, i) => [`color.chart.ord.${i + 1}`, `Ordinal ${i + 1}`]),
        ...Array.from({ length: 7 }, (_, i) => [`color.chart.div.${i + 1}`, `${L('Divergente', 'Diverging', 'Divergente')} ${i + 1} · ${i === 3 ? L('neutro', 'neutral', 'neutro') : i < 3 ? L('abaixo', 'below', 'debajo') : L('acima', 'above', 'encima')}`]),
        ['color.chart.status.good', L('Status · bom', 'Status · good', 'Status · bueno')],
        ['color.chart.status.warning', L('Status · atenção', 'Status · warning', 'Status · atención')],
        ['color.chart.status.critical', L('Status · crítico', 'Status · critical', 'Status · crítico')],
        ['color.chart.grid', L('Grade e célula vazia', 'Grid and empty cell', 'Cuadrícula y celda vacía')],
        ['color.chart.axis', L('Linha de base, eixo e mira', 'Baseline, axis, and crosshair', 'Línea base, eje y mira')],
        ['color.fg.subtle', L('Marcas do eixo', 'Axis ticks', 'Marcas del eje')],
        ['color.fg.muted', L('Rótulos e nomes', 'Labels and names', 'Etiquetas y nombres')],
        ['color.bg.raised', L('Fundo do tooltip', 'Tooltip background', 'Fondo del tooltip')],
      ]),
    )}

    ${section(
      'vg-uso',
      L('Uso', 'Usage', 'Uso'),
      L('O que mais dá errado em gráfico — e o que fazer no lugar.', 'What goes wrong most often in charts — and what to do instead.', 'Lo que más sale mal en un gráfico — y qué hacer en su lugar.'),
      `<div class="usage-grid gv-usage">
        ${USAGE().map(
          ([kind, title, text, visual]) => `<article class="usage-card usage-card--${kind}">
            <p class="usage-card__head">${icon(kind === 'do' ? 'check-circle' : kind === 'dont' ? 'x-circle' : 'zap', { size: 20 })}${title}</p>
            <div class="gv-usage__preview">${visual}</div>
            <p class="usage-card__text">${text}</p>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'vg-api',
      'API',
      L('Uma função por forma, a mesma conversa em todas: monta num elemento, recebe opções e devolve controles.', 'One function per form, the same conversation in all of them: mount on an element, take options, and return controls.', 'Una función por forma, la misma conversación en todas: se monta en un elemento, recibe opciones y devuelve controles.'),
      `${codeBlock(`import { barChart } from './ds/js/charts.js';

const ${L('grafico', 'chart', 'grafico')} = barChart(document.querySelector('#${L('vendas', 'sales', 'ventas')}'), {
  title: '${L('Receita por mês', 'Revenue by month', 'Ingresos por mes')}',
  subtitle: '${L('Em reais · 2026', 'In reais · 2026', 'En reales · 2026')}',
  categories: [${months().slice(0, 3).map((m) => `'${m}'`).join(', ')}],
  series: [{ name: '${revenueLabel()}', values: [82000, 91000, 88000] }],
  format: 'currency',
});

${L('grafico', 'chart', 'grafico')}.setLoading(true);           // ${L('segura o desenho enquanto busca', 'holds the drawing while fetching', 'mantiene el dibujo mientras busca')}
${L('grafico', 'chart', 'grafico')}.update({ series: ${L('novas', 'next', 'nuevas')} });  // ${L('redesenha com as novas opções', 'redraws with the new options', 'redibuja con las nuevas opciones')}
${L('grafico', 'chart', 'grafico')}.setLoading(false);
${L('grafico', 'chart', 'grafico')}.destroy();                  // ${L('limpa tudo ao sair da tela', 'cleans everything up when leaving the screen', 'limpia todo al salir de la pantalla')}`)}
      <div class="gv-api">
        <div>
          <h3 class="doc-subhead">${L('Opções em comum', 'Common options', 'Opciones en común')}</h3>
          <div class="doc-table gv-api__table">
            ${OPTIONS().map(([name, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${name}</code><span>${text}</span></div>`).join('')}
          </div>
        </div>
        <div>
          <h3 class="doc-subhead">${L('Formatos', 'Formats', 'Formatos')} <span class="doc-subhead__meta">${locale()}</span></h3>
          <div class="doc-table gv-api__table gv-api__table--formats">
            ${PRESETS.map(([name, v]) => `<div class="doc-table__row"><code class="ds-inline-code">'${name}'</code><span class="gv-api__out">${escapeHtml(formatter(name)(v))}</span></div>`).join('')}
            <div class="doc-table__row"><code class="ds-inline-code">{ … } · (v) =&gt; …</code><span>${L('Opções de Intl.NumberFormat ou uma função', 'Intl.NumberFormat options or a function', 'Opciones de Intl.NumberFormat o una función')}</span></div>
          </div>
        </div>
      </div>
      <div class="gv-api__forms">
        ${[
          ['barChart', '/graficos/barras'],
          ['lineChart', '/graficos/linhas'],
          ['donutChart', '/graficos/rosca'],
          ['heatmap · calendarHeatmap', '/graficos/heatmap'],
          ['scatterChart', '/graficos/dispersao'],
          ['statTile · sparkline · meter', '/graficos/indicadores'],
        ]
          .map(([fn, href]) => `<a class="gv-api__form" href="#${href}"><code>${fn}</code>${icon('arrow-right', { size: 16 })}</a>`)
          .join('')}
      </div>`,
    )}
  </div>`;
}

/* ───────── Montagem ───────── */

export function mount(root) {
  const charts = [];
  const cleanups = [];
  const $ = (sel) => root.querySelector(sel);

  /* Exemplo ao vivo */
  let range = '30d';
  let data = slice(range);
  const kpiEl = $('[data-dash-kpis]');
  const noteEl = $('[data-dash-note]');
  const renderKpis = () => {
    kpiEl.innerHTML = kpis(data);
    const n = data.categories.length;
    noteEl.textContent = L(`Comparado com o período anterior · ${n} pontos`, `Compared with the previous period · ${n} points`, `Comparado con el período anterior · ${n} puntos`);
  };
  renderKpis();

  const lineOpts = () => ({
    title: revenueLabel(),
    subtitle: L(`${data.range.label} · em reais`, `${data.range.label} · in reais`, `${data.range.label} · en reales`),
    categories: data.categories,
    tooltipLabels: data.tooltipLabels,
    series: [
      { name: L('Este período', 'This period', 'Este período'), values: data.revenue },
      { name: L('Período anterior', 'Previous period', 'Período anterior'), values: data.previous, muted: true },
    ],
    format: 'currency',
    // diário é ruidoso: segmentos retos e eixo do zero mostram a variação no tamanho real
    curve: data.range.bucket === 'day' ? 'linear' : 'smooth',
    height: 260,
  });
  const line = lineChart($('[data-dash-line]'), { card: true, ...lineOpts() });
  const bars = barChart($('[data-dash-bars]'), { card: true, title: L('Receita por canal', 'Revenue by channel', 'Ingresos por canal'), subtitle: data.range.label, orientation: 'horizontal', format: 'currency-compact', categoryLabel: L('Canal', 'Channel', 'Canal'), ...channelData(data) });
  const donut = donutChart($('[data-dash-donut]'), { card: true, title: L('Pedidos por forma de pagamento', 'Orders by payment method', 'Pedidos por forma de pago'), subtitle: data.range.label, items: paymentData(data), format: 'integer', size: 168, thickness: 20, categoryLabel: L('Forma de pagamento', 'Payment method', 'Forma de pago'), valueLabel: L('Pedidos', 'Orders', 'Pedidos') });
  charts.push(line, bars, donut);
  const dashCharts = [line, bars, donut];

  const rangeGroup = $('.gv-range');
  let timer = 0;
  const select = (value, focus) => {
    if (value === range) return;
    range = value;
    rangeGroup.querySelectorAll('[data-range]').forEach((b) => {
      const on = b.dataset.range === value;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    dashCharts.forEach((c) => c.setLoading(true));
    kpiEl.toggleAttribute('data-loading', true);
    clearTimeout(timer);
    timer = setTimeout(() => {
      data = slice(range);
      renderKpis();
      line.update(lineOpts());
      bars.update({ subtitle: data.range.label, ...channelData(data) });
      donut.update({ subtitle: data.range.label, items: paymentData(data) });
      dashCharts.forEach((c) => c.setLoading(false));
      kpiEl.toggleAttribute('data-loading', false);
    }, 320);
  };
  const onRangeClick = (e) => {
    const b = e.target.closest('[data-range]');
    if (b) select(b.dataset.range);
  };
  const onRangeKey = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const i = RANGE_IDS.indexOf(range);
    select(RANGE_IDS[(i + keys[e.key] + RANGE_IDS.length) % RANGE_IDS.length], true);
  };
  rangeGroup.addEventListener('click', onRangeClick);
  rangeGroup.addEventListener('keydown', onRangeKey);
  cleanups.push(() => {
    clearTimeout(timer);
    rangeGroup.removeEventListener('click', onRangeClick);
    rangeGroup.removeEventListener('keydown', onRangeKey);
  });

  /* A cor segue a entidade */
  const ch = channels();
  charts.push(
    barChart($('[data-color-demo]'), {
      card: true,
      title: L('Vendas por canal', 'Sales by channel', 'Ventas por canal'),
      subtitle: L('Mil unidades · esconda uma série na legenda: as outras mantêm a cor', 'Thousand units · hide a series in the legend: the others keep their color', 'Miles de unidades · oculta una serie en la leyenda: las demás mantienen el color'),
      categories: ch.categories,
      series: ch.series,
      format: 'integer',
      height: 260,
    }),
  );

  /* Anatomia: gráfico real com marcadores numerados por cima */
  const anatomyEl = $('[data-anatomy]');
  const pins = $('[data-anatomy-pins]');
  const stage = $('[data-anatomy-stage]');
  const anatomy = lineChart(anatomyEl, {
    title: L('Usuários ativos', 'Active users', 'Usuarios activos'),
    subtitle: L('Por mês · 2026 contra 2025', 'By month · 2026 vs. 2025', 'Por mes · 2026 contra 2025'),
    categories: months().slice(0, 10),
    series: [
      { name: '2026', values: [12100, 13800, 13200, 17900, 20600, 23800, 23100, 26900, 29800, 31200] },
      { name: '2025', values: [10200, 10900, 11100, 12800, 14100, 15900, 16800, 17700, 18900, 20800] },
    ],
    format: 'integer',
    curve: 'smooth',
    height: 250,
  });
  charts.push(anatomy);
  const showTip = () => {
    const plot = anatomyEl.querySelector('[data-plot]');
    const r = plot.getBoundingClientRect();
    if (!r.width) return;
    plot.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 72, clientY: r.top + 60, bubbles: true }));
    // Para a anatomia, o tooltip fica no canto vazio, ao lado da mira
    const tip = anatomyEl.querySelector('[data-tooltip]');
    const cross = anatomyEl.querySelector('[data-cross]');
    if (tip && cross) tip.style.transform = `translate(${Math.round(+cross.getAttribute('x1') + 14)}px, 0px)`;
  };
  const placePins = () => {
    showTip();
    const box = stage.getBoundingClientRect();
    if (!box.width) return;
    const at = (sel, dx = 0, dy = 0, where = 'left') => {
      const el = typeof sel === 'string' ? anatomyEl.querySelector(sel) : sel;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const x = where === 'right' ? r.right : where === 'center' ? r.left + r.width / 2 : r.left;
      return [x - box.left + dx, r.top - box.top + r.height / 2 + dy];
    };
    const spots = [
      at('.ds-chart__title', -14),
      at('.ds-chart__legend-item', -10),
      at(topTick(), -12),
      at([...anatomyEl.querySelectorAll('.ds-chart__dot--end')].at(-1), 0, 16, 'center'),
      at('.ds-chart__label', 14, 0, 'right'),
      at('.ds-chart__tooltip:not([hidden])', -8, 0),
      at('[data-chart-toggle]', -16),
    ];
    pins.innerHTML = spots.map((p, i) => (p ? `<span class="gv-pin" style="left:${Math.round(p[0])}px;top:${Math.round(p[1])}px">${i + 1}</span>` : '')).join('');
  };
  const topTick = () => [...anatomyEl.querySelectorAll('.ds-chart__tick[text-anchor="end"]')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
  let pinDebounce = 0;
  const ro = new ResizeObserver(() => {
    clearTimeout(pinDebounce);
    pinDebounce = setTimeout(placePins, 80);
  });
  ro.observe(stage);
  const pinTimer = setTimeout(placePins, 400);
  const pinTimer2 = setTimeout(placePins, 1200);
  cleanups.push(() => {
    ro.disconnect();
    clearTimeout(pinTimer);
    clearTimeout(pinTimer2);
    clearTimeout(pinDebounce);
  });

  /* Interação */
  charts.push(
    lineChart($('[data-interact-chart]'), {
      card: true,
      title: L('Pedidos por canal', 'Orders by channel', 'Pedidos por canal'),
      subtitle: L('Passe o mouse, use Tab e as setas, ou clique na legenda', 'Hover, use Tab and the arrows, or click the legend', 'Pasa el mouse, usa Tab y las flechas, o haz clic en la leyenda'),
      categories: ch.categories,
      series: ch.series.slice(0, 3),
      format: 'integer',
      height: 250,
    }),
  );

  const unCopy = mountCodeCopy(root);
  const unNav = mountDocNav(root);
  return () => {
    cleanups.forEach((fn) => fn());
    charts.forEach((c) => c.destroy());
    unCopy();
    unNav();
  };
}
