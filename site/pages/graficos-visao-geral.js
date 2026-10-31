import { icon } from '../../ds/icons/icons.js';
import { tokens, contrast } from '../../ds/tokens.js';
import { barChart, lineChart, donutChart, statTile, formatter } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { seeded, channels, payments } from '../chart-data.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-visao-geral.css'];

/* ───────── Dados: cores ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const SLOT_NAMES = { brand: 'Marca', blue: 'Azul', pink: 'Rosa', amber: 'Âmbar', teal: 'Verde-azulado', red: 'Vermelho', violet: 'Violeta', green: 'Verde' };
const refName = (ref) => /^\{color\.([^}]+)\}$/.exec(ref)?.[1] ?? ref;

const SLOTS = Array.from({ length: 8 }, (_, i) => {
  const t = byName.get(`color.chart.series.${i + 1}`);
  const step = refName(t.modes.dark.ref);
  return { n: i + 1, step, name: SLOT_NAMES[step.split('.')[0]] ?? step, dark: t.modes.dark.value, light: t.modes.light.value, cssVar: t.cssVar };
});

const seriesContrast = contrast.filter((c) => c.fg.startsWith('color.chart.series.'));
const minContrast = (mode) => Math.min(...seriesContrast.filter((c) => !mode || c.mode === mode).map((c) => c.ratio));
const ratio = (n) => n.toFixed(1).replace('.', ',');

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

const SCALES = [
  ['seq', 'Sequencial', 7, 'Magnitude: um tom só, de pouco a muito. No escuro a âncora inverte — mais é mais claro.', ['pouco', 'muito']],
  ['ord', 'Ordinal', 5, 'Etapas em ordem (funil, faixas). A ponta mais fraca ainda passa de 2:1 sobre a superfície.', ['1ª etapa', '5ª etapa']],
  ['div', 'Divergente', 7, 'Abaixo e acima de uma referência: frio e quente, com o meio neutro e cinza.', ['abaixo', 'acima']],
];

const STATUS = [
  ['success', 'check-circle', 'Bom', 'Meta batida, operação normal', 'chart-status-good'],
  ['warning', 'alert-triangle', 'Atenção', 'Perto do limite', 'chart-status-warning'],
  ['danger', 'alert-circle', 'Crítico', 'Acima do limite, falha', 'chart-status-critical'],
  ['info', 'info', 'Informação', 'Neutro, só para avisar', 'info-solid'],
];

/* ───────── Dados: exemplo ao vivo (determinísticos) ───────── */

const END = new Date(2026, 9, 31);
const DAYS = 730;
const DAY_FMT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const DAY_LONG = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
const WEEK_LONG = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
const MONTH_SHORT = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const MONTH_LONG = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');

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

const RANGES = [
  { value: '7d', label: '7 dias', days: 7, bucket: 'day', prev: 'vs. 7 dias anteriores' },
  { value: '30d', label: '30 dias', days: 30, bucket: 'day', prev: 'vs. 30 dias anteriores' },
  { value: '90d', label: '90 dias', days: 91, bucket: 'week', prev: 'vs. trimestre anterior' },
  { value: '12m', label: '12 meses', days: 365, bucket: 'month', prev: 'vs. 12 meses anteriores' },
];

function group(days, bucket) {
  if (bucket === 'day') return days.map((d) => [d]);
  if (bucket === 'week') return Array.from({ length: Math.ceil(days.length / 7) }, (_, k) => days.slice(k * 7, k * 7 + 7));
  const months = new Map();
  days.forEach((d) => {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    if (!months.has(key)) months.set(key, []);
    months.get(key).push(d);
  });
  return [...months.values()];
}

const sum = (list, key) => list.reduce((a, d) => a + d[key], 0);

function slice(rangeId) {
  const range = RANGES.find((r) => r.value === rangeId);
  const cur = daily.slice(-range.days);
  const prev = daily.slice(-range.days * 2, -range.days);
  const gc = group(cur, range.bucket);
  const gp = group(prev, range.bucket);
  const label = (g) => (range.bucket === 'month' ? cap(MONTH_SHORT.format(g[0].date)) : DAY_FMT.format(g[0].date));
  const long = (g) => (range.bucket === 'day' ? DAY_LONG.format(g[0].date) : range.bucket === 'week' ? `Semana de ${WEEK_LONG.format(g[0].date)}` : MONTH_LONG.format(g[0].date));
  const k = RANGES.indexOf(range);
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

const PP = (v) => `${(v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} p.p.`;
const TICKET = { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 };

function kpis(d) {
  const ticket = d.now.revenue / d.now.orders;
  const ticketBefore = d.before.revenue / d.before.orders;
  const conv = d.now.orders / d.now.visits;
  const convBefore = d.before.orders / d.before.visits;
  const change = (a, b) => a / b - 1;
  return [
    statTile({ label: 'Receita', value: d.now.revenue, format: 'currency-compact', delta: change(d.now.revenue, d.before.revenue), deltaLabel: d.range.prev, trend: d.revenue }),
    statTile({ label: 'Pedidos', value: d.now.orders, format: 'integer', delta: change(d.now.orders, d.before.orders), deltaLabel: d.range.prev, trend: d.ordersTrend }),
    statTile({ label: 'Ticket médio', value: ticket, format: TICKET, delta: change(ticket, ticketBefore), deltaLabel: d.range.prev, trend: d.ticketTrend }),
    statTile({ label: 'Conversão', value: conv, format: { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }, delta: conv - convBefore, deltaFormat: PP, deltaLabel: d.range.prev, trend: d.conversionTrend }),
  ].join('');
}

function channelData(d) {
  const names = channels.series.map((s) => s.name);
  const rows = names.map((name, i) => [name, Math.round(d.now.revenue * d.shares[i])]).sort((a, b) => b[1] - a[1]);
  return { categories: rows.map((r) => r[0]), series: [{ name: 'Receita', values: rows.map((r) => r[1]) }] };
}

/** Formas de pagamento somando exatamente o total de pedidos — os números do painel concordam. */
function paymentData(d) {
  const weights = payments.map((p, i) => p.value * (1 + (i === 0 ? 0.02 : i === 1 ? -0.015 : 0) * d.payShift));
  const total = weights.reduce((a, w) => a + w, 0);
  const items = payments.map((p, i) => ({ name: p.name, value: Math.floor((weights[i] / total) * d.now.orders) }));
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
  number: () => `<div class="gv-mini-number"><span>38,2 mil</span><span class="gv-mini-number__delta">${icon('trending-up', { size: 14 })}+13,7%</span></div>`,
};

const FORMS = [
  ['bars', 'Comparar quantidades', 'Barras', 'Do maior ao menor, entre categorias ou ao longo do tempo. Começa sempre no zero.', '/graficos/barras'],
  ['line', 'Mostrar tendência', 'Linhas e áreas', 'Como algo muda no tempo. Compare com o período anterior em cinza.', '/graficos/linhas'],
  ['donut', 'Parte do todo', 'Rosca', 'A proporção de relance, com até 6 fatias. Valores próximos pedem barras.', '/graficos/rosca'],
  ['scatter', 'Relação entre medidas', 'Dispersão', 'Duas grandezas por item: correlação, grupos e pontos fora da curva.', '/graficos/dispersao'],
  ['heat', 'Intensidade numa grade', 'Heatmap', 'Dia × hora, semana × mês: onde concentra. Até 7 faixas de cor.', '/graficos/heatmap'],
  ['number', 'Um número que importa', 'Indicadores', 'O valor de agora, a variação e a tendência. O número é o gráfico.', '/graficos/indicadores'],
];

/* ───────── Marcas e respiro ───────── */

const MARKS = [
  ['Barra', 'Até 24 px de espessura. Ponta de dados com raio de 4 px; a base, reta, nasce de uma linha só.', `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__baseline" d="M20 84.5H140"/>
      <path class="ds-chart__bar" style="--c:${S(1)}" d="M68 84V28A4 4 0 0 1 72 24H88A4 4 0 0 1 92 28V84Z"/>
      <path class="gv-measure" d="M68 14H92M68 10V18M92 10V18"/>
      <text class="gv-measure__text" x="80" y="8" text-anchor="middle">24</text>
      <path class="gv-measure gv-measure--strong" d="M88 24A4 4 0 0 1 92 28"/><path class="gv-measure" d="M96 26H104"/><text class="gv-measure__text" x="107" y="29">raio 4</text>
      <path class="gv-measure" d="M96 84H104"/><text class="gv-measure__text" x="107" y="87">base reta</text>
    </svg>`],
  ['Linha', '2 px, com pontas e junções arredondadas. Nada de linhas finas demais para ler nem grossas a ponto de pesar.', `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__grid" d="M16 76.5H144M16 44.5H144"/>
      <path class="ds-chart__line" style="--c:${S(2)}" d="M16 70 44 58 72 62 100 36 128 30 144 22"/>
      <text class="gv-measure__text" x="100" y="24" text-anchor="middle">2 px</text>
    </svg>`],
  ['Marcador', '8 px, com anel de 2 px na cor da superfície — o ponto continua legível onde cruza uma linha.', `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__line" style="--c:${S(2)}" d="M16 70 80 40 144 30"/>
      <path class="ds-chart__line" style="--c:${S(1)}" d="M16 30 80 44 144 72"/>
      <circle class="ds-chart__dot" style="--c:${S(1)}" cx="80" cy="44" r="6"/>
      <circle class="gv-ring-guide" cx="80" cy="44" r="10"/>
    </svg>`],
  ['Respiro de 2 px', 'Um vão na cor da superfície separa segmentos empilhados e barras vizinhas. Nunca um contorno em volta.', `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__baseline" d="M20 84.5H140"/>
      <path class="ds-chart__bar" style="--c:${S(1)}" d="M52 84H76V60H52Z"/>
      <path class="ds-chart__bar" style="--c:${S(2)}" d="M52 58H76V38H52Z"/>
      <path class="ds-chart__bar" style="--c:${S(3)}" d="M52 36H76V24A4 4 0 0 0 72 20H56A4 4 0 0 0 52 24Z"/>
      <path class="ds-chart__bar" style="--c:${S(1)}" d="M88 84V44A4 4 0 0 1 92 40H104A4 4 0 0 1 108 44V84Z"/>
      <path class="ds-chart__bar" style="--c:${S(2)}" d="M110 84V54A4 4 0 0 1 114 50H126A4 4 0 0 1 130 54V84Z"/>
    </svg>`],
  ['Área', 'A cor da série a 10% sob a linha: uma lavagem, nunca um bloco saturado.', `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__area" style="--c:${S(1)}" d="M16 66 44 54 72 58 100 34 128 28 144 20V84H16Z"/>
      <path class="ds-chart__line" style="--c:${S(1)}" d="M16 66 44 54 72 58 100 34 128 28 144 20"/>
      <path class="ds-chart__baseline" d="M16 84.5H144"/>
    </svg>`],
  ['Grade e meta', 'Grade de 1 px, sólida e um passo fora da superfície. O tracejado é reservado para meta e limite.', `<svg viewBox="0 0 160 96" aria-hidden="true">
      <path class="ds-chart__grid" d="M16 20.5H144M16 44.5H144M16 68.5H144"/>
      <path class="ds-chart__baseline" d="M16 84.5H144"/>
      <path class="ds-chart__target" d="M16 32.5H144"/>
      <text class="ds-chart__target-label" x="18" y="27">Meta</text>
    </svg>`],
];

/* ───────── Uso ───────── */

const USAGE = [
  ['dont', 'Evite: dois eixos verticais', 'O alinhamento entre as escalas é arbitrário e inventa uma correlação. Use dois gráficos ou um índice com base 100.', `<svg viewBox="0 0 200 72" aria-hidden="true">
      <path class="ds-chart__baseline" d="M24.5 6V64.5H176.5V6"/>
      <path class="ds-chart__line" style="--c:${S(1)}" d="M28 56 60 48 92 50 124 30 172 14"/>
      <path class="ds-chart__line" style="--c:${S(2)}" d="M28 20 60 30 92 26 124 40 172 52"/>
      <text class="ds-chart__tick" x="18" y="12" text-anchor="end">30k</text><text class="ds-chart__tick" x="182" y="12">800k</text>
    </svg>`],
  ['dont', 'Evite: arco-íris na escala', 'Magnitude é um tom só, do claro ao escuro. Vários tons fazem o olho procurar categorias que não existem.', `<div class="gv-usage-strip">${['blue-500', 'teal-500', 'green-500', 'amber-500', 'red-500', 'pink-500', 'violet-500'].map((c) => `<span style="background:var(--ds-color-${c})"></span>`).join('')}</div>`],
  ['do', 'Faça: a cor segue a entidade', 'Filtrou ou escondeu uma série? As que ficaram mantêm a cor. Quem aprendeu “App é azul” não pode ser enganado.', `<div class="gv-usage-keys">${['App', 'Loja', 'Site'].map((n, i) => `<span class="gv-usage-key${i === 1 ? ' is-off' : ''}"><i style="--c:${S(i + 1)}"></i>${n}</span>`).join('')}</div>`],
  ['tip', 'Rosca só para parte do todo', 'Até 6 fatias; da 6ª em diante, “Outros”. Para comparar valores próximos, barras leem muito melhor.', `<div class="gv-usage-donut">${MINI.donut()}</div>`],
  ['dont', 'Evite: um número em cada ponto', 'Rotule o fim, o pico ou a série da história. O eixo, o tooltip e a tabela levam o resto.', `<svg viewBox="0 0 200 72" aria-hidden="true">
      <path class="ds-chart__line" style="--c:${S(1)}" d="M16 56 44 48 72 50 100 34 128 30 156 22 184 14"/>
      ${[[16, 56], [44, 48], [72, 50], [100, 34], [128, 30], [156, 22], [184, 14]].map(([x, y], i) => `<text class="ds-chart__value" x="${x}" y="${y - 8}" text-anchor="middle">${[12, 15, 14, 21, 23, 26, 30][i]}</text>`).join('')}
    </svg>`],
  ['do', 'Faça: mais de 8 séries, agrupe', 'Não existe 9ª cor. A cauda vira “Outros”, ou o gráfico vira pequenos múltiplos.', `<div class="gv-usage-keys">${[1, 2, 3, 4, 5].map((n) => `<span class="gv-usage-key"><i style="--c:${S(n)}"></i>${n}</span>`).join('')}<span class="gv-usage-key"><i style="--c:var(--ds-color-chart-other)"></i>Outros</span></div>`],
];

/* ───────── API ───────── */

const OPTIONS = [
  ['title · subtitle', 'Título e linha de apoio na moldura. O título também nomeia o gráfico para leitores de tela.'],
  ['label', 'Nome acessível quando não há título visível.'],
  ['card', 'Superfície com contorno e raio — para painéis.'],
  ['height', 'Altura total, já contando a faixa do eixo x. Barras horizontais crescem com o número de linhas.'],
  ['format · axisFormat', 'Formato dos valores (tooltip, rótulos, tabela) e do eixo. O eixo compacta sozinho a partir de mil.'],
  ['table', 'Botão “Ver como tabela”. Ligado por padrão — desligue só se a tabela estiver na tela.'],
  ['texture', 'Hachura em 45° e 135° como canal de reserva (daltonismo total, impressão).'],
  ['empty', 'Texto do estado vazio.'],
];

const PRESETS = [
  ['number', 1234.56],
  ['integer', 1234.56],
  ['compact', 1284000],
  ['percent', 0.124],
  ['currency', 1234.56],
  ['currency-compact', 1284000],
];

const NAV = [
  ['vg-exemplo', 'Exemplo'],
  ['vg-forma', 'Qual gráfico'],
  ['vg-cores', 'Cores'],
  ['vg-anatomia', 'Anatomia'],
  ['vg-marcas', 'Marcas'],
  ['vg-interacao', 'Interação'],
  ['vg-acessibilidade', 'Acessibilidade'],
  ['vg-tokens', 'Tokens'],
  ['vg-uso', 'Uso'],
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
  return `
  <div class="page doc gv">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Gráficos</h1>
        <p class="doc-header__lead">Dados que se leem de relance e aguentam um segundo olhar. Marcas finas, uma cor por papel, rótulos só onde importam — e toda informação acessível por teclado e em tabela.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">formas</dt><dd class="doc-stat__value">6</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">cores categóricas</dt><dd class="doc-stat__value">${SLOTS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">pior ΔE entre vizinhas</dt><dd class="doc-stat__value">11,7</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">contraste das marcas</dt><dd class="doc-stat__value">≥ ${ratio(Math.floor(minContrast() * 10) / 10)}:1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'vg-exemplo',
      'Exemplo ao vivo',
      'Um painel com filtro único no topo: o período vale para tudo abaixo dele, então os números sempre concordam. Ao trocar, os gráficos seguram o desenho anterior enquanto atualizam — sem esqueleto, sem pulo.',
      `<div class="gv-dash" data-dash>
        <div class="gv-dash__filters">
          <span class="gv-dash__filter-label" id="vg-periodo-label">Período</span>
          <div class="ds-segmented gv-range" role="radiogroup" aria-labelledby="vg-periodo-label">
            ${RANGES.map((r) => `<button type="button" class="ds-segmented__item" role="radio" data-range="${r.value}" aria-checked="${r.value === '30d'}" tabindex="${r.value === '30d' ? 0 : -1}">${r.label}</button>`).join('')}
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
      'Qual gráfico usar',
      'Escolha pela tarefa de quem lê, antes de pensar em cor. Às vezes a resposta certa nem é um gráfico.',
      `<div class="gv-forms">
        ${FORMS.map(
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
      <h3 class="doc-subhead">Quando não é gráfico</h3>
      <div class="gv-notchart">
        <div class="gv-notchart__item">${icon('gauge', { size: 20 })}<div><p class="gv-notchart__title">Um valor só</p><p class="gv-notchart__text">Uma coluna sozinha ou uma pizza de duas fatias viram um <a href="#/graficos/indicadores">indicador</a>. O número é o gráfico.</p></div></div>
        <div class="gv-notchart__item">${icon('table', { size: 20 })}<div><p class="gv-notchart__title">Valores exatos ou mais de 7 classes</p><p class="gv-notchart__text">Acima de 7 cores com significado, as vizinhas se confundem. Use uma <a href="#/componentes/tabela">tabela</a> — ou tabela e gráfico juntos.</p></div></div>
        <div class="gv-notchart__item">${icon('target', { size: 20 })}<div><p class="gv-notchart__title">Uma série é a história</p><p class="gv-notchart__text">Destaque essa série na cor e deixe as outras em cinza. Ênfase é mais clara que oito cores disputando atenção.</p></div></div>
      </div>`,
    )}

    ${section(
      'vg-cores',
      'Cores',
      'Cada cor faz um trabalho só: identidade (categórica), quantidade (sequencial), etapa (ordinal), lado de uma referência (divergente) ou estado (status). E nenhuma foi escolhida no olho — a ordem saiu de um validador.',
      `<h3 class="doc-subhead">Categóricas <span class="doc-subhead__meta">identidade · ordem fixa, nunca recicle</span></h3>
      <ol class="gv-slots" role="list">
        ${SLOTS.map(
          (s) => `<li class="gv-slot">
            <span class="gv-slot__swatch" style="background:var(${s.cssVar})"></span>
            <div class="gv-slot__body">
              <p class="gv-slot__name"><span class="gv-slot__n">${s.n}</span>${s.name}</p>
              <p class="gv-slot__meta"><code>${s.step}</code><span>${s.dark.toUpperCase()}</span></p>
            </div>
          </li>`,
        ).join('')}
      </ol>
      <p class="gv-note">Os mesmos tons passaram nos dois temas — validados contra a superfície escura e a clara. Da 9ª série em diante não existe cor nova: a cauda vira “Outros”.</p>

      <div class="gv-checks">
        <div class="gv-check"><p class="gv-check__value">11,7</p><p class="gv-check__label">pior ΔE entre vizinhas com protanopia e deuteranopia</p><p class="gv-check__goal">alvo ≥ 8</p></div>
        <div class="gv-check"><p class="gv-check__value">18,5</p><p class="gv-check__label">pior ΔE entre vizinhas com visão típica</p><p class="gv-check__goal">mínimo 15</p></div>
        <div class="gv-check"><p class="gv-check__value">11,8 · 15,1</p><p class="gv-check__label">as 3 primeiras em todos os pares, para dispersão</p><p class="gv-check__goal">daltonismo · visão típica</p></div>
        <div class="gv-check"><p class="gv-check__value">${ratio(minContrast('dark'))} · ${ratio(minContrast('light'))}</p><p class="gv-check__label">menor contraste de uma marca com a superfície</p><p class="gv-check__goal">escuro · claro · mínimo 3:1</p></div>
      </div>

      <div class="gv-cvd">
        ${[
          ['Visão típica', null],
          ['Protanopia', 'protan'],
          ['Deuteranopia', 'deutan'],
        ]
          .map(
            ([label, kind]) => `<div class="gv-cvd__row">
              <span class="gv-cvd__label">${label}</span>
              <span class="gv-cvd__swatches">${SLOTS.map((s) => `<span style="background:${kind ? simulate(s.dark, kind) : s.dark}"></span>`).join('')}</span>
            </div>`,
          )
          .join('')}
        <p class="gv-cvd__caption">Simulação de Machado, Oliveira e Fernandes (2009). Vizinhas continuam distintas mesmo sem distinguir vermelho e verde.</p>
      </div>

      <h3 class="doc-subhead">Escalas <span class="doc-subhead__meta">um tom por trabalho · cada tema com os seus passos</span></h3>
      <div class="gv-themes">
        ${['dark', 'light']
          .map(
            (mode) => `<div class="gv-theme" data-theme="${mode}">
              <p class="gv-theme__name">${icon(mode === 'dark' ? 'moon' : 'sun', { size: 16 })}${mode === 'dark' ? 'Escuro' : 'Claro'}</p>
              ${SCALES.map(
                ([prefix, name, n, , ends]) => `<div class="gv-scale">
                  <p class="gv-scale__name">${name}<code>chart.${prefix}.1–${n}</code></p>
                  ${strip(prefix, n)}
                  <p class="gv-scale__ends"><span>${ends[0]}</span>${prefix === 'div' ? '<span>neutro</span>' : ''}<span>${ends[1]}</span></p>
                </div>`,
              ).join('')}
            </div>`,
          )
          .join('')}
      </div>
      <ul class="gv-scale-notes" role="list">
        ${SCALES.map(([, name, , text]) => `<li><strong>${name}.</strong> ${text}</li>`).join('')}
      </ul>

      <div class="gv-split">
        <div>
          <h3 class="doc-subhead">Status <span class="doc-subhead__meta">reservadas</span></h3>
          <ul class="gv-status" role="list">
            ${STATUS.map(
              ([tone, ic, label, text, token]) => `<li class="gv-status__item">
                <span class="gv-status__swatch" style="background:var(--ds-color-${token})"></span>
                <span class="gv-status__label" data-tone="${tone}">${icon(ic, { size: 16 })}${label}</span>
                <span class="gv-status__text">${text}</span>
              </li>`,
            ).join('')}
          </ul>
          <p class="gv-note">Só quando a cor <em>significa</em> bom ou ruim — e sempre com ícone e texto. Nunca como “série 4”.</p>
        </div>
        <div>
          <h3 class="doc-subhead">Contexto</h3>
          <ul class="gv-status" role="list">
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-muted)"></span><span class="gv-status__label"><code>chart.muted</code></span><span class="gv-status__text">Ênfase: o resto em cinza, para uma série se destacar</span></li>
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-other)"></span><span class="gv-status__label"><code>chart.other</code></span><span class="gv-status__text">“Outros”: a cauda agrupada</span></li>
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-grid)"></span><span class="gv-status__label"><code>chart.grid</code></span><span class="gv-status__text">Grade e célula sem dado</span></li>
            <li class="gv-status__item"><span class="gv-status__swatch" style="background:var(--ds-color-chart-axis)"></span><span class="gv-status__label"><code>chart.axis</code></span><span class="gv-status__text">Linha de base, eixos e mira</span></li>
          </ul>
        </div>
      </div>

      <h3 class="doc-subhead">A cor segue a entidade <span class="doc-subhead__meta">experimente</span></h3>
      <div data-color-demo></div>`,
    )}

    ${section(
      'vg-anatomia',
      'Anatomia',
      'Sete peças, sempre no mesmo lugar. O título nomeia o que está plotado; com uma série só, nem precisa de legenda.',
      `<div class="gv-anatomy">
        <div class="gv-anatomy__stage" data-anatomy-stage>
          <div class="gv-anatomy__chart" data-anatomy inert></div>
          <div class="gv-anatomy__pins" data-anatomy-pins aria-hidden="true"></div>
        </div>
        <ol class="gv-anatomy__legend" role="list">
          ${[
            ['Título e subtítulo', 'O que está plotado e em que unidade. Frase curta, sem dois-pontos.'],
            ['Legenda', 'Sempre que houver duas séries ou mais. A chave espelha a marca: traço para linha, quadrado para barra.'],
            ['Eixo e grade', 'Fios de 1 px, recessivos. Marcas redondas, compactadas a partir de mil.'],
            ['Marca', 'A única coisa com cor forte. Linha de 2 px, ponto final de 8 px com anel.'],
            ['Rótulo direto', 'No fim da linha, só se não colidir. Texto na cor de texto — nunca na cor da série.'],
            ['Tooltip', 'No hover e no foco. O valor vem primeiro e forte; o nome da série, depois.'],
            ['Tabela', 'O gêmeo acessível: todos os números, inclusive os que o gráfico não rotula.'],
          ]
            .map(([title, text], i) => `<li><span class="gv-anatomy__num">${i + 1}</span><div><p class="gv-anatomy__title">${title}</p><p class="gv-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'vg-marcas',
      'Marcas e respiro',
      'O visual calmo vem de poucas medidas fixas e de dois espaços negativos. Só o dado pode ser barulhento.',
      `<div class="gv-marks">
        ${MARKS.map(([title, text, svg]) => `<article class="gv-mark"><div class="gv-mark__preview">${svg}</div><div class="gv-mark__body"><p class="gv-mark__title">${title}</p><p class="gv-mark__text">${text}</p></div></article>`).join('')}
      </div>`,
    )}

    ${section(
      'vg-interacao',
      'Interação',
      'Todo gráfico já vem interativo. O tooltip complementa, nunca é o único caminho até um valor.',
      `<div class="gv-interact">
        <div data-interact-chart></div>
        <ul class="gv-interact__list" role="list">
          <li>${icon('message-square', { size: 18 })}<div><p class="gv-interact__title">Tooltip</p><p class="gv-interact__text">Valor forte, nome apagado, chave em traço. Em linhas, mostra todas as séries daquele ponto.</p></div></li>
          <li>${icon('line-chart', { size: 18 })}<div><p class="gv-interact__title">Mira</p><p class="gv-interact__text">Um fio vertical encontra a data mais próxima. Ninguém precisa acertar uma linha de 2 px.</p></div></li>
          <li>${icon('eye', { size: 18 })}<div><p class="gv-interact__title">Legenda que esconde</p><p class="gv-interact__text">Clique numa série para tirá-la do gráfico. As outras não mudam de cor.</p></div></li>
          <li>${icon('table', { size: 18 })}<div><p class="gv-interact__title">Tabela</p><p class="gv-interact__text">O ícone no canto troca o gráfico pelos números.</p></div></li>
          <li>${icon('corner-down-left', { size: 18 })}<div><p class="gv-interact__title">Teclado <span class="gv-interact__kbd"><kbd class="ds-kbd">Tab</kbd><kbd class="ds-kbd">←</kbd><kbd class="ds-kbd">→</kbd><kbd class="ds-kbd">Home</kbd><kbd class="ds-kbd">End</kbd><kbd class="ds-kbd">Esc</kbd></span></p><p class="gv-interact__text">Tab foca o gráfico; as setas percorrem os pontos e o leitor de tela anuncia cada um.</p></div></li>
        </ul>
      </div>`,
    )}

    ${section(
      'vg-acessibilidade',
      'Acessibilidade',
      'Decisões que já vêm prontas em todos os gráficos — e as que continuam sendo suas.',
      a11yList([
        ['Cor nunca sozinha', 'Duas séries ou mais têm legenda; até quatro, também rótulo direto. Status vem com ícone e texto.'],
        ['Paleta validada para daltonismo', 'Vizinhas separadas por ΔE ≥ 8 com protanopia e deuteranopia, e ≥ 15 com visão típica, nos dois temas.'],
        ['Tabela em todo gráfico', 'O botão “Ver como tabela” mostra todos os números. É o equivalente acessível, não um extra.'],
        ['Teclado e leitor de tela', 'O gráfico recebe foco, as setas percorrem os valores e uma região ao vivo anuncia cada um.', ['Tab', '←', '→', 'Esc']],
        ['Contraste das marcas', `Toda cor categórica passa de 3:1 contra a superfície — ${ratio(minContrast('dark'))}:1 no escuro e ${ratio(minContrast('light'))}:1 no claro, no pior caso.`],
        ['Textura de reserva', 'Com <code class="ds-inline-code">texture: true</code>, barras e fatias ganham hachura em 45° e 135° — também na impressão e em alto contraste.'],
        ['Movimento reduzido', 'A entrada anima uma vez, quando o gráfico aparece. Com <code class="ds-inline-code">prefers-reduced-motion</code>, não anima.'],
        ['Texto dos dados é seu', 'Nomes de série e categoria entram como texto, nunca como HTML — vêm de planilhas e APIs.'],
      ]),
    )}

    ${section(
      'vg-tokens',
      'Tokens',
      'Marcas consomem <code class="ds-inline-code">color.chart.*</code>; textos, sempre <code class="ds-inline-code">color.fg.*</code>. Troque a marca e o gráfico troca junto.',
      tokenTable([
        ...SLOTS.map((s) => [`color.chart.series.${s.n}`, `Série ${s.n} · ${s.name}`]),
        ['color.chart.muted', 'Contexto em cinza (ênfase)'],
        ['color.chart.other', '“Outros”'],
        ...Array.from({ length: 7 }, (_, i) => [`color.chart.seq.${i + 1}`, `Sequencial ${i + 1}${i === 0 ? ' · pouco' : i === 6 ? ' · muito' : ''}`]),
        ...Array.from({ length: 5 }, (_, i) => [`color.chart.ord.${i + 1}`, `Ordinal ${i + 1}`]),
        ...Array.from({ length: 7 }, (_, i) => [`color.chart.div.${i + 1}`, `Divergente ${i + 1}${i === 3 ? ' · neutro' : i < 3 ? ' · abaixo' : ' · acima'}`]),
        ['color.chart.status.good', 'Status · bom'],
        ['color.chart.status.warning', 'Status · atenção'],
        ['color.chart.status.critical', 'Status · crítico'],
        ['color.chart.grid', 'Grade e célula vazia'],
        ['color.chart.axis', 'Linha de base, eixo e mira'],
        ['color.fg.subtle', 'Marcas do eixo'],
        ['color.fg.muted', 'Rótulos e nomes'],
        ['color.bg.raised', 'Fundo do tooltip'],
      ]),
    )}

    ${section(
      'vg-uso',
      'Uso',
      'O que mais dá errado em gráfico — e o que fazer no lugar.',
      `<div class="usage-grid gv-usage">
        ${USAGE.map(
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
      'Uma função por forma, a mesma conversa em todas: monta num elemento, recebe opções e devolve controles.',
      `${codeBlock(`import { barChart } from './ds/js/charts.js';

const grafico = barChart(document.querySelector('#vendas'), {
  title: 'Receita por mês',
  subtitle: 'Em reais · 2026',
  categories: ['Jan', 'Fev', 'Mar'],
  series: [{ name: 'Receita', values: [82000, 91000, 88000] }],
  format: 'currency',
});

grafico.setLoading(true);           // segura o desenho enquanto busca
grafico.update({ series: novas });  // redesenha com as novas opções
grafico.setLoading(false);
grafico.destroy();                  // limpa tudo ao sair da tela`)}
      <div class="gv-api">
        <div>
          <h3 class="doc-subhead">Opções em comum</h3>
          <div class="doc-table gv-api__table">
            ${OPTIONS.map(([name, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${name}</code><span>${text}</span></div>`).join('')}
          </div>
        </div>
        <div>
          <h3 class="doc-subhead">Formatos <span class="doc-subhead__meta">pt-BR</span></h3>
          <div class="doc-table gv-api__table gv-api__table--formats">
            ${PRESETS.map(([name, v]) => `<div class="doc-table__row"><code class="ds-inline-code">'${name}'</code><span class="gv-api__out">${escapeHtml(formatter(name)(v))}</span></div>`).join('')}
            <div class="doc-table__row"><code class="ds-inline-code">{ … } · (v) =&gt; …</code><span>Opções de Intl.NumberFormat ou uma função</span></div>
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
    noteEl.textContent = `Comparado com o período anterior · ${data.categories.length} pontos`;
  };
  renderKpis();

  const lineOpts = () => ({
    title: 'Receita',
    subtitle: `${data.range.label} · em reais`,
    categories: data.categories,
    tooltipLabels: data.tooltipLabels,
    series: [
      { name: 'Este período', values: data.revenue },
      { name: 'Período anterior', values: data.previous, muted: true },
    ],
    format: 'currency',
    // diário é ruidoso: segmentos retos e eixo do zero mostram a variação no tamanho real
    curve: data.range.bucket === 'day' ? 'linear' : 'smooth',
    height: 260,
  });
  const line = lineChart($('[data-dash-line]'), { card: true, ...lineOpts() });
  const bars = barChart($('[data-dash-bars]'), { card: true, title: 'Receita por canal', subtitle: data.range.label, orientation: 'horizontal', format: 'currency-compact', categoryLabel: 'Canal', ...channelData(data) });
  const donut = donutChart($('[data-dash-donut]'), { card: true, title: 'Pedidos por forma de pagamento', subtitle: data.range.label, items: paymentData(data), format: 'integer', size: 168, thickness: 20, categoryLabel: 'Forma de pagamento', valueLabel: 'Pedidos' });
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
    const i = RANGES.findIndex((r) => r.value === range);
    select(RANGES[(i + keys[e.key] + RANGES.length) % RANGES.length].value, true);
  };
  rangeGroup.addEventListener('click', onRangeClick);
  rangeGroup.addEventListener('keydown', onRangeKey);
  cleanups.push(() => {
    clearTimeout(timer);
    rangeGroup.removeEventListener('click', onRangeClick);
    rangeGroup.removeEventListener('keydown', onRangeKey);
  });

  /* A cor segue a entidade */
  charts.push(
    barChart($('[data-color-demo]'), {
      card: true,
      title: 'Vendas por canal',
      subtitle: 'Mil unidades · esconda uma série na legenda: as outras mantêm a cor',
      categories: channels.categories,
      series: channels.series,
      format: 'integer',
      height: 260,
    }),
  );

  /* Anatomia: gráfico real com marcadores numerados por cima */
  const anatomyEl = $('[data-anatomy]');
  const pins = $('[data-anatomy-pins]');
  const stage = $('[data-anatomy-stage]');
  const anatomy = lineChart(anatomyEl, {
    title: 'Usuários ativos',
    subtitle: 'Por mês · 2026 contra 2025',
    categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'],
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
      title: 'Pedidos por canal',
      subtitle: 'Passe o mouse, use Tab e as setas, ou clique na legenda',
      categories: channels.categories,
      series: channels.series.slice(0, 3),
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
