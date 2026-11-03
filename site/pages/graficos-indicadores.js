import { icon } from '../../ds/icons/icons.js';
import { statTile, sparkline, meter } from '../../ds/js/charts.js';
import { formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { revenue, activeUsers } from '../chart-data.js';
import { L, ratio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-indicadores.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const brlCompact = (v) => formatNumber(v, { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 });
const brl = (v) => formatNumber(v, { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
const compact = (v) => formatNumber(v, { notation: 'compact', maximumFractionDigits: 1 });
const signedPct = (v) => formatNumber(v, { style: 'percent', signDisplay: 'always', maximumFractionDigits: 1 });

const TRENDS = {
  up: [8, 9, 9, 11, 10, 12, 13, 12, 14, 15, 15, 17],
  down: [17, 16, 16, 14, 15, 13, 12, 13, 11, 10, 10, 9],
  flat: [12, 13, 12, 12, 13, 12, 11, 12, 13, 12, 12, 12],
};
const DELTAS = { up: 0.124, down: -0.083, flat: 0, none: null };

const revenueLabel = () => L('Receita', 'Revenue', 'Ingresos');
const vsLastMonth = () => L('vs. mês anterior', 'vs. last month', 'vs. mes anterior');
const vsLastWeek = () => L('vs. semana anterior', 'vs. last week', 'vs. semana anterior');
const vsNovember = () => L('vs. novembro', 'vs. November', 'vs. noviembre');
const activeCustomers = () => L('Clientes ativos', 'Active customers', 'Clientes activos');
const responseTime = () => L('Tempo de resposta', 'Response time', 'Tiempo de respuesta');

const CONTROLS = () => [
  { id: 'delta', label: L('Variação', 'Change', 'Variación'), value: 'up', options: [{ value: 'up', label: L('Alta', 'Up', 'Alza') }, { value: 'down', label: L('Queda', 'Down', 'Baja') }, { value: 'flat', label: L('Estável', 'Flat', 'Estable') }, { value: 'none', label: L('Sem variação', 'No change', 'Sin variación') }] },
  { id: 'good', label: L('Bom quando', 'Good when', 'Bueno cuando'), value: 'up', options: [{ value: 'up', label: L('Sobe', 'It rises', 'Sube') }, { value: 'down', label: L('Cai', 'It falls', 'Baja') }, { value: 'none', label: L('Neutro', 'Neutral', 'Neutro') }] },
  { id: 'trend', label: L('Tendência', 'Trend', 'Tendencia'), value: 'on', options: [{ value: 'on', label: L('Com sparkline', 'With sparkline', 'Con sparkline') }, { value: 'off', label: L('Sem sparkline', 'Without sparkline', 'Sin sparkline') }] },
  { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'hero', label: L('Destaque', 'Hero', 'Destacado') }] },
];

const tileOptions = (s) => ({
  label: s.label || revenueLabel(),
  value: 1284000,
  format: 'currency-compact',
  delta: DELTAS[s.delta],
  deltaLabel: s.delta === 'none' ? undefined : vsLastMonth(),
  good: s.good,
  trend: s.trend === 'on' ? TRENDS[s.delta === 'none' ? 'up' : s.delta] : undefined,
  hero: s.size === 'hero',
});

function tileCode(s) {
  const o = tileOptions(s);
  const lines = [`  label: '${String(o.label).replace(/'/g, "\\'")}',`, '  value: 1284000,', "  format: 'currency-compact',"];
  if (o.delta != null) lines.push(`  delta: ${o.delta},`, `  deltaLabel: '${vsLastMonth()}',`);
  if (o.delta != null && o.good !== 'up') lines.push(`  good: '${o.good}',`);
  if (o.trend) lines.push(`  trend: [${o.trend.slice(0, 4).join(', ')}, …],`);
  if (o.hero) lines.push('  hero: true,');
  return `import { statTile } from './ds/js/charts.js';\n\nel.innerHTML = statTile({\n${lines.join('\n')}\n});`;
}

const KPIS = () => [
  { label: revenueLabel(), value: revenue[2026][11], format: 'currency-compact', delta: revenue[2026][11] / revenue[2026][10] - 1, deltaLabel: vsNovember(), trend: revenue[2026] },
  { label: activeCustomers(), value: activeUsers[2026][11], format: 'integer', delta: activeUsers[2026][11] / activeUsers[2026][10] - 1, deltaLabel: vsNovember(), trend: activeUsers[2026] },
  { label: responseTime(), value: '182 ms', delta: 0.08, deltaLabel: vsLastWeek(), good: 'down', trend: [150, 160, 155, 170, 165, 175, 180, 170, 178, 185, 180, 182] },
  { label: L('Chamados abertos', 'Open tickets', 'Tickets abiertos'), value: 46, format: 'integer', delta: -0.21, deltaLabel: vsLastWeek(), good: 'down', trend: [70, 66, 68, 61, 63, 58, 57, 55, 52, 50, 49, 46] },
];

const SPARKS = () => [
  [L('Com área', 'With area', 'Con área'), L('O padrão: linha no tom de contexto, lavagem leve e o ponto de agora na cor de destaque.', 'The default: a line in the context tone, a light wash, and the current point in the highlight color.', 'El predeterminado: línea en el tono de contexto, lavado leve y el punto actual en el color de destaque.'), {}],
  [L('Só a linha', 'Line only', 'Solo la línea'), L('Para linhas de tabela e lugares apertados, onde a área pesaria.', 'For table rows and tight spots, where the area would weigh it down.', 'Para filas de tabla y lugares estrechos, donde el área pesaría.'), { area: false }],
  [L('Sem ponto', 'No dot', 'Sin punto'), L('Quando “agora” não importa — só o formato da curva.', 'When “now” doesn’t matter — only the shape of the curve.', 'Cuando “ahora” no importa — solo la forma de la curva.'), { highlight: 'none', area: false }],
  [L('Reta', 'Straight', 'Recta'), L('Pontos ligados por segmentos, para séries curtas ou com degraus.', 'Points joined by segments, for short or stepped series.', 'Puntos unidos por segmentos, para series cortas o escalonadas.'), { curve: 'linear' }],
];

const PRODUCTS = () => [
  [L('Conta', 'Account', 'Cuenta'), [42, 44, 43, 47, 49, 52, 51, 55, 58, 60, 63, 66], 66000, 0.048],
  [L('Cartão', 'Card', 'Tarjeta'), [80, 78, 81, 79, 76, 77, 74, 75, 73, 72, 70, 71], 71000, -0.014],
  [L('Investimentos', 'Investments', 'Inversiones'), [20, 22, 25, 24, 28, 31, 30, 34, 37, 36, 40, 44], 44000, 0.111],
  [L('Seguros', 'Insurance', 'Seguros'), [12.1, 12.2, 12, 12.3, 12.2, 12.1, 12.3, 12.2, 12.1, 12.2, 12, 12.1], 12000, 0],
];

const METERS = () => [
  { label: L('Armazenamento', 'Storage', 'Almacenamiento'), value: 42, max: 100, format: (v) => `${v} GB`, caption: L('Limite do plano: 100 GB', 'Plan limit: 100 GB', 'Límite del plan: 100 GB') },
  { label: L('Cota de API', 'API quota', 'Cuota de API'), value: 78, max: 100, format: 'integer', caption: L('Atenção a partir de 75% — renova em 3 dias', 'Warning from 75% — renews in 3 days', 'Atención a partir del 75% — se renueva en 3 días') },
  { label: L('Limite usado', 'Limit used', 'Límite usado'), value: 4700, max: 5000, format: 'currency-compact', caption: L('Crítico a partir de 90%', 'Critical from 90%', 'Crítico a partir del 90%') },
];

const VARIATIONS = () => [
  [revenueLabel(), brlCompact(1300000), 0.124, 'up', L('Subiu e subir é bom: melhora.', 'It went up and up is good: better.', 'Subió y subir es bueno: mejora.')],
  [L('Custo de aquisição', 'Acquisition cost', 'Costo de adquisición'), brl(84), 0.08, 'down', L('Subiu, mas o bom é cair: piora.', 'It went up, but down is good: worse.', 'Subió, pero lo bueno es bajar: empeora.')],
  [responseTime(), '182 ms', -0.14, 'down', L('Caiu e cair é bom: melhora.', 'It went down and down is good: better.', 'Bajó y bajar es bueno: mejora.')],
  [activeCustomers(), formatNumber(38210), -0.031, 'up', L('Caiu e o bom é subir: piora.', 'It went down and up is good: worse.', 'Bajó y lo bueno es subir: empeora.')],
  [L('Visitas', 'Visits', 'Visitas'), formatNumber(12400), 0, 'up', L('Não mudou: estável, sem cor.', 'It didn’t change: flat, no color.', 'No cambió: estable, sin color.')],
  [L('Temperatura do servidor', 'Server temperature', 'Temperatura del servidor'), '41 °C', 0.02, 'none', L('Sem lado bom: só informa.', 'No good side: it just informs.', 'Sin lado bueno: solo informa.')],
];

const NAV = () => [
  ['in-playground', 'Playground'],
  ['in-anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
  ['in-kpis', L('Linha de indicadores', 'Indicator row', 'Fila de indicadores')],
  ['in-destaque', L('Número de destaque', 'Hero number', 'Número destacado')],
  ['in-sparkline', 'Sparkline'],
  ['in-medidor', L('Medidor', 'Meter', 'Medidor')],
  ['in-variacao', L('Variação', 'Change', 'Variación')],
  ['in-acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
  ['in-tokens', 'Tokens'],
  ['in-uso', L('Uso', 'Usage', 'Uso')],
  ['in-api', 'API'],
];

const section = (id, title, desc, body) => `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header"><div>
      <h2 class="doc-section__title" id="${id}-title">${title}</h2>
      <p class="doc-section__desc">${desc}</p>
    </div></header>
    ${body}
  </section>`;

const anatomyTile = () =>
  statTile({ label: activeCustomers(), value: 38210, format: 'integer', delta: 0.137, deltaLabel: vsLastMonth(), trend: activeUsers[2026] })
    .replace('class="ds-stat__label"', 'class="ds-stat__label" data-num="1"')
    .replace('class="ds-stat__value"', 'class="ds-stat__value" data-num="2"')
    .replace('class="ds-stat__change"', 'class="ds-stat__change" data-num="3"')
    .replace('class="ds-stat__period"', 'class="ds-stat__period" data-num="4"')
    .replace('class="ds-stat__trend"', 'class="ds-stat__trend" data-num="5"');

const fmtTable = (v) => (v === 0 ? formatNumber(0, { style: 'percent' }) : `${v > 0 ? '+' : '−'}${formatNumber(Math.abs(v), { style: 'percent', maximumFractionDigits: 1 })}`);

const API = () => [
  ['statTile(options)', L('Indicador completo. Devolve HTML.', 'A complete indicator. Returns HTML.', 'Indicador completo. Devuelve HTML.'), [
    ['label', L('Rótulo, em caixa de frase e sem dois-pontos.', 'Label, in sentence case and without a colon.', 'Etiqueta, en mayúscula inicial y sin dos puntos.')],
    ['value · format', L('Número e formato (\'currency-compact\', \'integer\'…) — ou um texto pronto, como \'182 ms\'.', 'Number and format (\'currency-compact\', \'integer\'…) — or ready-made text, like \'182 ms\'.', 'Número y formato (\'currency-compact\', \'integer\'…) — o un texto listo, como \'182 ms\'.')],
    ['delta · deltaFormat', L(`Variação (razão: ${formatNumber(0.124)} = ${signedPct(0.124)}) e como mostrá-la. Padrão: porcentagem.`, `Change (ratio: ${formatNumber(0.124)} = ${signedPct(0.124)}) and how to show it. Default: percentage.`, `Variación (razón: ${formatNumber(0.124)} = ${signedPct(0.124)}) y cómo mostrarla. Predeterminado: porcentaje.`)],
    ['deltaLabel', L('Contra o quê: “vs. mês anterior”. Sem período, a variação não diz nada.', 'Against what: “vs. last month”. Without a period, the change says nothing.', 'Contra qué: “vs. mes anterior”. Sin período, la variación no dice nada.')],
    ['good', L('\'up\' (subir é bom), \'down\' (cair é bom) ou \'none\' (sem lado bom).', '\'up\' (rising is good), \'down\' (falling is good), or \'none\' (no good side).', '\'up\' (subir es bueno), \'down\' (bajar es bueno) o \'none\' (sin lado bueno).')],
    ['trend · trendLabel', L('Série da sparkline e o nome acessível dela.', 'The sparkline series and its accessible name.', 'Serie de la sparkline y su nombre accesible.')],
    ['hero · href', L('Versão de destaque; com href, o indicador vira link.', 'Hero version; with href, the indicator becomes a link.', 'Versión destacada; con href, el indicador se vuelve enlace.')],
  ]],
  ['sparkline(values, options)', L('Linha de tendência sem eixos. Devolve HTML que estica na largura do contêiner.', 'A trend line without axes. Returns HTML that stretches to the container width.', 'Línea de tendencia sin ejes. Devuelve HTML que se estira al ancho del contenedor.'), [
    ['width · height', L('Tamanho padrão quando nada manda nele (112 × 32).', 'Default size when nothing else sets it (112 × 32).', 'Tamaño predeterminado cuando nada lo define (112 × 32).')],
    ['area · curve', L('Lavagem sob a linha (padrão) e \'smooth\' ou \'linear\'.', 'Wash under the line (default) and \'smooth\' or \'linear\'.', 'Lavado bajo la línea (predeterminado) y \'smooth\' o \'linear\'.')],
    ['highlight', L('\'last\' marca o ponto atual; \'none\' tira o ponto.', '\'last\' marks the current point; \'none\' removes the dot.', '\'last\' marca el punto actual; \'none\' quita el punto.')],
    ['color · label', L('Cor da linha (padrão: chart.other) e o nome acessível.', 'Line color (default: chart.other) and the accessible name.', 'Color de la línea (predeterminado: chart.other) y el nombre accesible.')],
    ['domain', L('Escala fixa [mín, máx]. Sem ela, a escala cobre ao menos 10% do valor — série estável não vira serra.', 'Fixed scale [min, max]. Without it, the scale covers at least 10% of the value — a flat series doesn’t turn into a saw.', 'Escala fija [mín, máx]. Sin ella, la escala cubre al menos el 10% del valor — una serie estable no se vuelve sierra.')],
  ]],
  ['meter(options)', L('Uma razão contra um limite. Devolve HTML com role="meter".', 'A ratio against a limit. Returns HTML with role="meter".', 'Una razón contra un límite. Devuelve HTML con role="meter".'), [
    ['label · value · max · min', L('O que mede e em que faixa.', 'What it measures and in which range.', 'Qué mide y en qué rango.')],
    ['format', L('Formato do valor; sem ele, mostra a porcentagem.', 'Value format; without it, shows the percentage.', 'Formato del valor; sin él, muestra el porcentaje.')],
    ['thresholds', L('Onde vira atenção e crítico. Padrão: { warning: 0.75, danger: 0.9 }.', 'Where it turns warning and critical. Default: { warning: 0.75, danger: 0.9 }.', 'Dónde pasa a atención y crítico. Predeterminado: { warning: 0.75, danger: 0.9 }.')],
    ['tone · size · caption', L('Força um tom (\'success\'…), versão \'sm\' e uma linha de apoio.', 'Forces a tone (\'success\'…), \'sm\' version, and a supporting line.', 'Fuerza un tono (\'success\'…), versión \'sm\' y una línea de apoyo.')],
  ]],
];

/* ───────── Página ───────── */

export default function renderIndicadores(page) {
  const yearTotal = revenue[2026].reduce((a, v) => a + v, 0);
  const prevTotal = revenue[2025].reduce((a, v) => a + v, 0);
  return `
  <div class="page doc gi">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Quando o gráfico é um número. O valor de agora, quanto mudou e para onde vai — sem eixo, sem legenda, sem esforço para ler.', 'When the chart is a number. The current value, how much it changed, and where it’s heading — no axis, no legend, no effort to read.', 'Cuando el gráfico es un número. El valor actual, cuánto cambió y hacia dónde va — sin eje, sin leyenda, sin esfuerzo para leer.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('peças', 'pieces', 'piezas')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('destaque por tela', 'hero per screen', 'destacado por pantalla')}</dt><dd class="doc-stat__value">1</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('sentidos da variação', 'change directions', 'sentidos de la variación')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tons do medidor', 'meter tones', 'tonos del medidor')}</dt><dd class="doc-stat__value">4</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section('in-playground', 'Playground', L('Monte o indicador, veja em cada tema e copie o código. Troque “Bom quando” para ver a mesma alta virar piora.', 'Build the indicator, see it in each theme, and copy the code. Switch “Good when” to watch the same rise become worse.', 'Arma el indicador, míralo en cada tema y copia el código. Cambia “Bueno cuando” para ver la misma alza volverse empeora.'), playgroundMarkup('indicador'))}

    ${section(
      'in-anatomia',
      L('Anatomia', 'Anatomy', 'Anatomía'),
      L('Cinco partes, sempre nesta ordem. Só o rótulo e o valor são obrigatórios.', 'Five parts, always in this order. Only the label and the value are required.', 'Cinco partes, siempre en este orden. Solo la etiqueta y el valor son obligatorios.'),
      `<div class="gi-anatomy">
        <div class="gi-anatomy__stage" aria-hidden="true"><div class="gi-anatomy__tile" inert>${anatomyTile()}</div></div>
        <ol class="gi-anatomy__legend" role="list">
          ${[
            [L('Rótulo', 'Label', 'Etiqueta'), L('O que é medido, em caixa de frase e sem dois-pontos.', 'What’s measured, in sentence case and without a colon.', 'Lo que se mide, en mayúscula inicial y sin dos puntos.')],
            [L('Valor', 'Value', 'Valor'), L(`Sans semibold, compactado (${compact(38200)}; ${brlCompact(1300000)}). Algarismos proporcionais.`, `Sans semibold, compacted (${compact(38200)}; ${brlCompact(1300000)}). Proportional figures.`, `Sans semibold, compactado (${compact(38200)}; ${brlCompact(1300000)}). Cifras proporcionales.`)],
            [L('Variação', 'Change', 'Variación'), L('Sinal, ícone e texto juntos. A cor diz se melhorou ou piorou — nunca sozinha.', 'Sign, icon, and text together. The color says whether it got better or worse — never alone.', 'Signo, ícono y texto juntos. El color dice si mejoró o empeoró — nunca solo.'), true],
            [L('Período', 'Period', 'Período'), L('Contra o quê a variação foi medida. Sem ele, o número não diz nada.', 'What the change was measured against. Without it, the number says nothing.', 'Contra qué se midió la variación. Sin él, el número no dice nada.'), true],
            [L('Tendência', 'Trend', 'Tendencia'), L('Sparkline no tom de contexto; o ponto de agora na cor de destaque.', 'Sparkline in the context tone; the current point in the highlight color.', 'Sparkline en el tono de contexto; el punto actual en el color de destaque.'), true],
          ]
            .map(([title, text, optional], i) => `<li><span class="gi-anatomy__num">${i + 1}</span><div><p class="gi-anatomy__title">${title}${optional ? ` <span class="gi-anatomy__optional">${L('opcional', 'optional', 'opcional')}</span>` : ''}</p><p class="gi-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'in-kpis',
      L('Linha de indicadores', 'Indicator row', 'Fila de indicadores'),
      L('Os números que abrem um painel. Mesma estrutura, mesmo período de comparação, do mais importante para o menos.', 'The numbers that open a dashboard. Same structure, same comparison period, from most to least important.', 'Los números que abren un panel. Misma estructura, mismo período de comparación, del más importante al menos.'),
      `<div class="gi-kpis">${KPIS().map((k) => statTile(k)).join('')}</div>
      <ul class="gi-rules" role="list">
        <li>${icon('check', { size: 16 })}${L('De 2 a 5 por linha. Mais que isso vira tabela.', '2 to 5 per row. More than that becomes a table.', 'De 2 a 5 por fila. Más que eso se vuelve tabla.')}</li>
        <li>${icon('check', { size: 16 })}${L('Todos comparados com o mesmo período — ou cada um diz o seu.', 'All compared with the same period — or each one says its own.', 'Todos comparados con el mismo período — o cada uno dice el suyo.')}</li>
        <li>${icon('check', { size: 16 })}${L(`Clicável quando leva a um detalhe (${ic('href')}).`, `Clickable when it leads to a detail (${ic('href')}).`, `Clicable cuando lleva a un detalle (${ic('href')}).`)}</li>
      </ul>`,
    )}

    ${section(
      'in-destaque',
      L('Número de destaque', 'Hero number', 'Número destacado'),
      L('O número que a tela inteira existe para mostrar. Um só por vista, na mesma sans do resto — fonte de display ou serifada parece enfeite.', 'The number the whole screen exists to show. Only one per view, in the same sans as the rest — a display or serif font looks like decoration.', 'El número que toda la pantalla existe para mostrar. Uno solo por vista, en la misma sans del resto — una fuente display o serif parece adorno.'),
      `<div class="gi-hero">
        <div class="gi-hero__tile">${statTile({ label: L('Receita em 2026', 'Revenue in 2026', 'Ingresos en 2026'), value: yearTotal, format: 'currency-compact', delta: yearTotal / prevTotal - 1, deltaLabel: 'vs. 2025', trend: revenue[2026], hero: true })}</div>
        <div class="gi-figures">
          <p class="gi-figures__title">${L('Algarismos proporcionais no número grande', 'Proportional figures in the big number', 'Cifras proporcionales en el número grande')}</p>
          <div class="gi-figures__compare">
            <div><span class="gi-figures__num" data-figures="proportional">${formatNumber(1121)}</span><span class="gi-figures__label">${icon('check-circle', { size: 16 })}${L('Proporcional', 'Proportional', 'Proporcional')}</span></div>
            <div><span class="gi-figures__num" data-figures="tabular">${formatNumber(1121)}</span><span class="gi-figures__label">${icon('x-circle', { size: 16 })}${L('Tabular', 'Tabular', 'Tabular')}</span></div>
          </div>
          <p class="gi-figures__text">${L(`Em tamanho grande, algarismos tabulares dão a cada dígito a largura de um zero e o “1” fica solto. Guarde ${ic('tabular-nums')} para colunas que precisam alinhar.`, `At large sizes, tabular figures give each digit the width of a zero and the “1” floats loose. Save ${ic('tabular-nums')} for columns that need to align.`, `En tamaño grande, las cifras tabulares dan a cada dígito el ancho de un cero y el “1” queda suelto. Guarda ${ic('tabular-nums')} para columnas que necesitan alinearse.`)}</p>
        </div>
      </div>`,
    )}

    ${section(
      'in-sparkline',
      'Sparkline',
      L('A tendência sem eixos, em linha com o texto. Estica na largura de quem a contém e o traço não deforma.', 'The trend without axes, inline with the text. It stretches to its container’s width and the stroke doesn’t distort.', 'La tendencia sin ejes, en línea con el texto. Se estira al ancho de quien la contiene y el trazo no se deforma.'),
      `<div class="gi-sparks">
        ${SPARKS().map(
          ([name, text, opts]) => `<article class="gi-spark">
            <div class="gi-spark__preview">${sparkline(activeUsers[2026], { height: 48, ...opts })}</div>
            <div class="gi-spark__body"><p class="gi-spark__name">${name}</p><p class="gi-spark__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
      <h3 class="doc-subhead">${L('Dentro de uma tabela', 'Inside a table', 'Dentro de una tabla')}</h3>
      <div class="ds-table-wrap gi-table" role="region" tabindex="0" aria-label="${L('Receita por produto', 'Revenue by product', 'Ingresos por producto')}">
        <table class="ds-table">
          <thead><tr><th scope="col">${L('Produto', 'Product', 'Producto')}</th><th scope="col" class="ds-table__num">${L('Receita no mês', 'Revenue this month', 'Ingresos del mes')}</th><th scope="col">${L('Últimos 12 meses', 'Last 12 months', 'Últimos 12 meses')}</th><th scope="col" class="ds-table__num">${L('Variação', 'Change', 'Variación')}</th></tr></thead>
          <tbody>
            ${PRODUCTS().map(([name, trend, value, delta]) => {
              const tone = delta === 0 ? 'neutral' : delta > 0 ? 'good' : 'bad';
              const glyph = delta === 0 ? 'minus' : delta > 0 ? 'trending-up' : 'trending-down';
              return `<tr>
                <th scope="row">${name}</th>
                <td class="ds-table__num">${escapeHtml(brl(value))}</td>
                <td>${sparkline(trend, { width: 96, height: 24, area: false, label: L(`Receita de ${name} nos últimos 12 meses`, `${name} revenue over the last 12 months`, `Ingresos de ${name} en los últimos 12 meses`) })}</td>
                <td class="ds-table__num"><span class="ds-stat__delta gi-delta" data-tone="${tone}"><span class="ds-stat__change">${icon(glyph, { size: 16 })}${fmtTable(delta)}</span></span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`,
    )}

    ${section(
      'in-medidor',
      L('Medidor', 'Meter', 'Medidor'),
      L('Uma razão contra um limite. O preenchimento carrega a gravidade — marca, atenção, crítico — e a trilha é um tom mais claro da mesma cor. A partir da atenção, ganha ícone.', 'A ratio against a limit. The fill carries the severity — brand, warning, critical — and the track is a lighter tint of the same color. From warning on, it gets an icon.', 'Una razón contra un límite. El relleno lleva la gravedad — marca, atención, crítico — y el riel es un tono más claro del mismo color. A partir de la atención, recibe ícono.'),
      `<div class="gi-meters">
        <div class="gi-meters__card">${METERS().map((m) => meter(m)).join('')}</div>
        <div class="gi-meters__card">
          ${meter({ label: L('Meta de vendas', 'Sales goal', 'Meta de ventas'), value: 112, max: 100, format: 'integer', tone: 'success', caption: L('Meta batida — tom de sucesso forçado com tone', 'Goal met — success tone forced with tone', 'Meta cumplida — tono de éxito forzado con tone') })}
          ${meter({ label: 'Onboarding', value: 3, max: 5, format: (v) => L(`${v} etapas`, `${v} steps`, `${v} etapas`), size: 'sm' })}
          ${meter({ label: L('Espaço do time', 'Team space', 'Espacio del equipo'), value: 0.86, max: 1, thresholds: { warning: 0.6, danger: 0.85 }, size: 'sm', caption: L('Limites próprios: atenção em 60%, crítico em 85%', 'Custom thresholds: warning at 60%, critical at 85%', 'Límites propios: atención en 60%, crítico en 85%') })}
        </div>
      </div>
      <p class="gi-note">${L('Duas fatias de pizza são um medidor. Para várias partes de um todo, use a <a href="#/graficos/rosca">rosca</a> ou barras empilhadas.', 'Two pie slices are a meter. For several parts of a whole, use the <a href="#/graficos/rosca">donut</a> or stacked bars.', 'Dos porciones de torta son un medidor. Para varias partes de un todo, usa la <a href="#/graficos/rosca">dona</a> o barras apiladas.')}</p>`,
    )}

    ${section(
      'in-variacao',
      L('Variação', 'Change', 'Variación'),
      L('A cor sai de dois fatos: para onde o número foi e se isso é bom. A mesma alta pode ser melhora ou piora — por isso o sinal, o ícone e o texto vêm sempre juntos.', 'The color comes from two facts: where the number went and whether that’s good. The same rise can be better or worse — that’s why the sign, icon, and text always come together.', 'El color sale de dos hechos: hacia dónde fue el número y si eso es bueno. La misma alza puede ser mejora o empeora — por eso el signo, el ícono y el texto vienen siempre juntos.'),
      `<div class="gi-variations">
        ${VARIATIONS().map(
          ([label, value, delta, good, text]) => `<div class="gi-variation">
            ${statTile({ label, value, delta, good, deltaLabel: good === 'none' ? L('vs. ontem', 'vs. yesterday', 'vs. ayer') : vsLastMonth() })}
            <p class="gi-variation__text">${text}</p>
          </div>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'in-acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('O indicador é texto, então já começa acessível. Estes detalhes completam.', 'The indicator is text, so it starts out accessible. These details complete it.', 'El indicador es texto, así que ya empieza accesible. Estos detalles lo completan.'),
      a11yList([
        [L('Número é texto', 'The number is text', 'El número es texto'), L('Valor, variação e período são texto de verdade — leitores de tela leem, buscadores acham, dá para copiar.', 'Value, change, and period are real text — screen readers read it, search engines find it, you can copy it.', 'Valor, variación y período son texto de verdad — los lectores de pantalla lo leen, los buscadores lo encuentran, se puede copiar.')],
        [L('Melhora ou piora, por escrito', 'Better or worse, in writing', 'Mejora o empeora, por escrito'), L('A variação leva um texto oculto — “(melhora)”, “(piora)” ou “(estável)” — porque a cor não chega ao leitor de tela.', 'The change carries hidden text — “(better)”, “(worse)”, or “(flat)” — because color doesn’t reach the screen reader.', 'La variación lleva un texto oculto — “(mejora)”, “(empeora)” o “(estable)” — porque el color no llega al lector de pantalla.')],
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L('Sinal (+ ou −) e ícone de alta ou queda acompanham a cor. Funciona em escala de cinza e para daltônicos.', 'The sign (+ or −) and an up or down icon go with the color. It works in grayscale and for colorblind people.', 'El signo (+ o −) y el ícono de alza o baja acompañan al color. Funciona en escala de grises y para daltónicos.')],
        [L('Sparkline com nome', 'A named sparkline', 'Sparkline con nombre'), L(`Com ${ic('trendLabel')} ou ${ic('label')}, vira uma imagem com descrição; sem, fica oculta — o número já disse tudo.`, `With ${ic('trendLabel')} or ${ic('label')}, it becomes an image with a description; without, it stays hidden — the number already said it all.`, `Con ${ic('trendLabel')} o ${ic('label')}, se vuelve una imagen con descripción; sin ellos, queda oculta — el número ya lo dijo todo.`)],
        [L('Medidor semântico', 'A semantic meter', 'Medidor semántico'), L(`${ic('role="meter"')} com valor, mínimo, máximo e um texto que inclui o estado: “92 de 100, crítico”.`, `${ic('role="meter"')} with value, minimum, maximum, and text that includes the state: “92 of 100, critical”.`, `${ic('role="meter"')} con valor, mínimo, máximo y un texto que incluye el estado: “92 de 100, crítico”.`)],
        [L('Contraste da variação', 'Change contrast', 'Contraste de la variación'), L(`Verde e vermelho de texto (${ic('success.fg')}, ${ic('danger.fg')}) passam de ${ratio(4.5, 1)} nos três temas.`, `Green and red text (${ic('success.fg')}, ${ic('danger.fg')}) pass ${ratio(4.5, 1)} in all three themes.`, `El verde y el rojo de texto (${ic('success.fg')}, ${ic('danger.fg')}) superan ${ratio(4.5, 1)} en los tres temas.`)],
      ]),
    )}

    ${section(
      'in-tokens',
      'Tokens',
      L('O que indicador, sparkline e medidor consomem.', 'What the indicator, sparkline, and meter consume.', 'Lo que consumen el indicador, la sparkline y el medidor.'),
      tokenTable([
        ['color.bg.surface', L('Fundo do indicador', 'Indicator background', 'Fondo del indicador')],
        ['color.border.subtle', L('Contorno', 'Outline', 'Contorno')],
        ['radius.xl', L('Raio do indicador', 'Indicator radius', 'Radio del indicador')],
        ['color.fg.muted', L('Rótulo', 'Label', 'Etiqueta')],
        ['color.fg.default', L('Valor', 'Value', 'Valor')],
        ['color.fg.subtle', L('Período', 'Period', 'Período')],
        ['color.success.fg', L('Variação que melhora', 'Change for the better', 'Variación que mejora')],
        ['color.danger.fg', L('Variação que piora', 'Change for the worse', 'Variación que empeora')],
        ['color.chart.other', L('Linha da sparkline', 'Sparkline line', 'Línea de la sparkline')],
        ['color.chart.series.1', L('Ponto atual da sparkline', 'Sparkline current point', 'Punto actual de la sparkline')],
        ['color.brand.solid', L('Medidor normal', 'Normal meter', 'Medidor normal')],
        ['color.brand.subtle', L('Trilha do medidor normal', 'Normal meter track', 'Riel del medidor normal')],
        ['color.chart.status.warning', L('Medidor em atenção', 'Meter in warning', 'Medidor en atención')],
        ['color.chart.status.critical', L('Medidor crítico', 'Critical meter', 'Medidor crítico')],
        ['color.chart.status.good', L('Medidor com meta batida', 'Meter with goal met', 'Medidor con meta cumplida')],
        ['radius.full', L('Trilha do medidor', 'Meter track', 'Riel del medidor')],
      ]),
    )}

    ${section(
      'in-uso',
      L('Uso', 'Usage', 'Uso'),
      L('Quando um número basta — e como não estragá-lo.', 'When a number is enough — and how not to ruin it.', 'Cuando un número basta — y cómo no estropearlo.'),
      `<div class="usage-grid gi-usage">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: um número no lugar de uma barra', 'Do: a number instead of a bar', 'Haz: un número en lugar de una barra')}</p>
          <div class="gi-usage__preview"><span class="gi-usage__big">${compact(38200)}</span></div>
          <p class="usage-card__text">${L('Um valor só não precisa de gráfico. Uma coluna sozinha ou uma pizza de duas fatias viram indicador.', 'A single value doesn’t need a chart. A lone column or a two-slice pie becomes an indicator.', 'Un solo valor no necesita gráfico. Una columna sola o una torta de dos porciones se vuelven indicador.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: variação sem período', 'Avoid: a change without a period', 'Evita: variación sin período')}</p>
          <div class="gi-usage__preview"><span class="ds-stat__delta" data-tone="good"><span class="ds-stat__change">${icon('trending-up', { size: 16 })}${signedPct(0.124)}</span></span><span class="gi-usage__vs">${L('em relação a quê?', 'compared to what?', '¿en relación con qué?')}</span></div>
          <p class="usage-card__text">${L('“+12%” sozinho não diz se é sobre ontem ou sobre o ano passado. Nomeie o período.', '“+12%” on its own doesn’t say whether it’s about yesterday or last year. Name the period.', '“+12%” solo no dice si es sobre ayer o sobre el año pasado. Nombra el período.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Um destaque por tela', 'One hero per screen', 'Un destacado por pantalla')}</p>
          <div class="gi-usage__preview"><span class="gi-usage__big gi-usage__big--lg">${brlCompact(1400000)}</span></div>
          <p class="usage-card__text">${L('Se dois números disputam o topo, nenhum ganha. Escolha o que a tela existe para mostrar.', 'If two numbers fight for the top, neither wins. Pick the one the screen exists to show.', 'Si dos números disputan la cima, ninguno gana. Elige el que la pantalla existe para mostrar.')}</p>
        </article>
      </div>`,
    )}

    ${section(
      'in-api',
      'API',
      L('Três funções que devolvem HTML, sem estado — use em qualquer lugar, inclusive dentro de tabelas e cards.', 'Three functions that return HTML, with no state — use them anywhere, including inside tables and cards.', 'Tres funciones que devuelven HTML, sin estado — úsalas en cualquier lugar, incluso dentro de tablas y tarjetas.'),
      `${codeBlock(`import { statTile, sparkline, meter } from './ds/js/charts.js';

kpis.innerHTML = [
  statTile({ label: '${revenueLabel()}', value: 1284000, format: 'currency-compact',
             delta: 0.124, deltaLabel: '${vsLastMonth()}', trend: ${L('receita', 'revenue', 'ingresos')} }),
  statTile({ label: '${responseTime()}', value: '182 ms',
             delta: 0.08, deltaLabel: '${vsLastWeek()}', good: 'down' }),
].join('');

${L('celula', 'cell', 'celda')}.innerHTML = sparkline(${L('receita', 'revenue', 'ingresos')}, { width: 96, height: 24, area: false });
${L('uso', 'usage', 'uso')}.innerHTML = meter({ label: '${L('Armazenamento', 'Storage', 'Almacenamiento')}', value: 72, max: 100, format: (v) => \`\${v} GB\` });`)}
      <div class="gi-api">
        ${API().map(
          ([fn, text, rows]) => `<div class="gi-api__fn">
            <p class="gi-api__name"><code>${escapeHtml(fn)}</code></p>
            <p class="gi-api__text">${escapeHtml(text)}</p>
            <div class="doc-table gi-api__table">
              ${rows.map(([name, desc]) => `<div class="doc-table__row"><code class="ds-inline-code">${escapeHtml(name)}</code><span>${escapeHtml(desc)}</span></div>`).join('')}
            </div>
          </div>`,
        ).join('')}
      </div>`,
    )}
  </div>`;
}

export function mount(root) {
  const unPlayground = mountPlayground(root, {
    id: 'indicador',
    controls: CONTROLS(),
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: revenueLabel() },
    render: (s) => `<div class="gi-preview${s.size === 'hero' ? ' gi-preview--hero' : ''}">${statTile(tileOptions(s))}</div>`,
    code: tileCode,
  });
  const unCopy = mountCodeCopy(root);
  const unNav = mountDocNav(root);
  return () => {
    unPlayground();
    unCopy();
    unNav();
  };
}
