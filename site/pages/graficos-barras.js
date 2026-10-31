import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { barChart } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { MONTHS, revenue, channels, teams, funnel, npsDelta } from '../chart-data.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-barras.css'];

/* ───────── Dados ───────── */

const ORIENTATIONS = [
  ['vertical', 'Vertical'],
  ['horizontal', 'Horizontal'],
];

const LAYOUTS = [
  ['grouped', 'Agrupado'],
  ['stacked', 'Empilhado'],
  ['percent', '100%'],
];

const LABELS = [
  ['none', 'Nenhum'],
  ['max', 'Só o maior'],
  ['last', 'Só o último'],
  ['all', 'Todos'],
];

/** Menor contraste das cores de série sobre a superfície, nos dois temas (vem do build). */
const minSeriesContrast = (() => {
  const ratios = contrast.filter((c) => c.fg.startsWith('color.chart.series.') && c.bg === 'color.bg.surface').map((c) => c.ratio);
  return Math.min(...ratios).toFixed(2).replace('.', ',');
})();

const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)} pts`;

/** Código JS legível de uma chamada de barChart. */
const list = (arr) => `[${arr.map((v) => (typeof v === 'string' ? `'${v}'` : v)).join(', ')}]`;

function chartCode(fn, target, lines) {
  return `import { ${fn} } from './ds/js/charts.js';\n\n${fn}(document.querySelector('${target}'), {\n${lines.filter(Boolean).map((l) => `  ${l}`).join('\n')}\n});`;
}

/* ───────── Playground ───────── */

function playOptions(state) {
  const count = Number(state.series);
  const series = channels.series.slice(0, count);
  return {
    title: count === 1 ? 'Vendas no app' : 'Vendas por canal',
    subtitle: 'Mil unidades · 1º semestre',
    categories: channels.categories,
    series,
    orientation: state.orientation,
    layout: count === 1 ? 'grouped' : state.layout,
    labels: state.labels,
    highlight: state.highlight === 'one' ? channels.categories.length - 1 : undefined,
    height: 300,
  };
}

function playCode(state) {
  const o = playOptions(state);
  return chartCode('barChart', '#vendas', [
    `title: '${o.title}',`,
    `subtitle: '${o.subtitle}',`,
    `categories: ${list(o.categories)},`,
    'series: [',
    ...o.series.map((s) => `  { name: '${s.name}', values: ${list(s.values)} },`),
    '],',
    o.orientation !== 'vertical' && `orientation: '${o.orientation}',`,
    o.layout !== 'grouped' && `layout: '${o.layout}',`,
    `labels: '${o.labels}',`,
    o.highlight != null && `highlight: ${o.highlight}, // ${o.categories[o.highlight]} em destaque; o resto em cinza`,
  ]);
}

/* ───────── Variantes ───────── */

const VARIANTS = [
  {
    id: 'colunas',
    name: 'Colunas',
    code: "orientation: 'vertical'",
    text: 'Uma série, uma cor. Só o maior valor ganha rótulo; o eixo carrega o resto.',
    options: { title: 'Receita por mês', subtitle: 'Em reais · 2026', categories: MONTHS, series: [{ name: 'Receita', values: revenue[2026] }], format: 'currency', labels: 'max' },
  },
  {
    id: 'agrupadas',
    name: 'Agrupadas',
    code: "layout: 'grouped'",
    text: 'Compara séries dentro de cada categoria. Até 4 séries, com 2 px entre barras vizinhas.',
    options: { title: 'Vendas por canal', subtitle: 'Mil unidades', categories: channels.categories, series: channels.series.slice(0, 3) },
  },
  {
    id: 'empilhadas',
    name: 'Empilhadas',
    code: "layout: 'stacked'",
    text: 'O total e a composição juntos. Só a ponta do topo é arredondada; o total vai em cima.',
    options: { title: 'Vendas por canal', subtitle: 'Total e composição · mil unidades', categories: channels.categories, series: channels.series, layout: 'stacked', labels: 'last' },
  },
  {
    id: 'cem',
    name: '100%',
    code: "layout: 'percent'",
    text: 'Só a composição: cada coluna soma 100%. O tooltip mostra a parte e o valor real.',
    options: { title: 'Participação de cada canal', subtitle: 'Por mês', categories: channels.categories, series: channels.series, layout: 'percent' },
  },
  {
    id: 'horizontais',
    name: 'Horizontais',
    code: "orientation: 'horizontal'",
    text: 'Para rankings e nomes longos. O valor vai na ponta, então o eixo some.',
    options: { title: 'Entregas por time', subtitle: '3º trimestre', categories: teams.categories, series: [{ name: 'Entregas', values: teams.values }], orientation: 'horizontal', format: 'integer' },
  },
  {
    id: 'divergentes',
    name: 'Divergentes',
    code: 'diverging: true',
    text: 'Acima e abaixo de uma referência, nas duas pontas da escala divergente. O zero é a meta.',
    options: {
      title: 'NPS contra a meta',
      subtitle: 'Diferença em pontos, por região',
      categories: npsDelta.categories,
      series: [{ name: 'Diferença', values: npsDelta.values }],
      orientation: 'horizontal',
      diverging: true,
      positiveLabel: 'Acima da meta',
      negativeLabel: 'Abaixo da meta',
      labels: 'all',
      format: signed,
    },
  },
  {
    id: 'enfase',
    name: 'Ênfase',
    code: 'highlight: 11',
    text: 'Quando a história é uma barra só: ela fica na cor, o resto vira contexto em cinza.',
    options: { title: 'Receita de dezembro', subtitle: 'Contra os outros meses de 2026', categories: MONTHS, series: [{ name: 'Receita', values: revenue[2026] }], format: 'currency', highlight: 11, labels: 'last' },
  },
  {
    id: 'funil',
    name: 'Funil',
    code: 'ordinal: true',
    text: 'Etapas em sequência numa rampa de um tom. O tooltip mostra quanto passou da etapa anterior.',
    options: { title: 'Funil de ativação', subtitle: 'Pessoas em outubro', categories: funnel.categories, series: [{ name: 'Pessoas', values: funnel.values }], orientation: 'horizontal', ordinal: true, format: 'integer' },
  },
];

/* ───────── Estados ───────── */

const STATES = [
  ['hover', 'Hover e foco', 'A faixa da categoria acende e o tooltip lista todas as séries. Com Tab e setas, o mesmo — e um leitor de tela ouve os valores.'],
  ['escondida', 'Série escondida', 'Clique na legenda para esconder uma série. As outras mantêm a cor: a cor segue a série, não a posição.'],
  ['carregando', 'Carregando', 'Ao buscar dados novos, o desenho anterior fica a meia opacidade. Sem esqueleto, sem pulo de layout.'],
  ['vazio', 'Vazio', 'Sem dados, a área do gráfico vira um aviso com a mesma altura. Diga o que fazer, se houver.'],
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

const API = [
  ['categories', 'string[]', '—', 'Rótulos das categorias, na ordem do eixo.'],
  ['series', '[{ name, values, color? }]', '—', 'Uma entrada por série. Sem <code class="ds-inline-code">color</code>, a série usa o slot da sua posição (1–8).'],
  ['orientation', "'vertical' | 'horizontal'", "'vertical'", 'Horizontal para rankings e nomes longos.'],
  ['layout', "'grouped' | 'stacked' | 'percent'", "'grouped'", 'Lado a lado, empilhado ou empilhado em 100%.'],
  ['labels', "'auto' | 'none' | 'max' | 'last' | 'all'", "'auto'", 'Rótulos de valor. <code class="ds-inline-code">auto</code> mostra todos só em barras horizontais de uma série ou empilhadas.'],
  ['highlight', 'número', '—', 'Índice da categoria em destaque; as outras ficam em <code class="ds-inline-code">chart.muted</code>.'],
  ['diverging', 'boolean', 'false', 'Positivo e negativo nas pontas da escala divergente. Legenda com <code class="ds-inline-code">positiveLabel</code> e <code class="ds-inline-code">negativeLabel</code>.'],
  ['ordinal', 'boolean', 'false', 'Categorias em sequência (funil, faixas) numa rampa de um tom.'],
  ['format', 'preset | Intl | função', "'number'", "<code class=\"ds-inline-code\">'integer'</code>, <code class=\"ds-inline-code\">'compact'</code>, <code class=\"ds-inline-code\">'percent'</code>, <code class=\"ds-inline-code\">'currency'</code>… O eixo compacta sozinho; troque com <code class=\"ds-inline-code\">axisFormat</code>."],
  ['height', 'px', '280', 'Altura total das colunas, incluindo o eixo. Barras horizontais calculam a altura pelas linhas.'],
  ['title · subtitle', 'string', '—', 'Cabeçalho do gráfico. Sem título, passe <code class="ds-inline-code">label</code> para nomeá-lo.'],
  ['card · table · texture', 'boolean', 'false · true · false', 'Superfície com contorno, botão de tabela e hachura de reserva.'],
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
  return `
  <div class="page doc gb-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Barras</h1>
        <p class="doc-header__lead">Compara grandezas lado a lado. Uma base no zero, barras finas, a ponta arredondada carregando o dado — e o número só onde ele conta a história.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">layouts</dt><dd class="doc-stat__value">${LAYOUTS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">orientações</dt><dd class="doc-stat__value">${ORIENTATIONS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">espessura máxima</dt><dd class="doc-stat__value">24 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">contraste mínimo</dt><dd class="doc-stat__value">${minSeriesContrast}:1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['variantes', 'Variantes'],
        ['estados', 'Estados'],
        ['anatomia', 'Anatomia'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', 'Troque orientação, layout, séries e rótulos. O gráfico é o de verdade: passe o mouse, use as setas, esconda séries na legenda ou abra a tabela.', playgroundMarkup('graficos-barras', { wide: true }))}

    ${section(
      'variantes',
      'Variantes',
      'Cada forma responde a uma pergunta. Escolha pela pergunta, não pela aparência.',
      `<div class="gb-variants">
        ${VARIANTS.map(
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
      'Estados',
      'O gráfico responde ao ponteiro, ao teclado e aos dados. Os dois primeiros começam com o estado aplicado — interaja para ver de novo.',
      `<div class="gb-states">
        ${STATES.map(
          ([id, name, text]) => `<article class="gb-variant">
            <div class="gb-variant__chart" data-state-chart="${id}"></div>
            <div class="gb-variant__body">
              <p class="gb-variant__name">${name}${id === 'carregando' ? `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-reload>${icon('refresh', { size: 16 })}Recarregar</button>` : ''}</p>
              <p class="gb-variant__text">${text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'anatomia',
      'Anatomia',
      'Seis medidas fixas fazem o visual calmo. O dado é a única coisa que pode chamar atenção.',
      `<div class="gb-anatomy">
        <div class="gb-anatomy__stage" aria-hidden="true">${anatomySvg()}</div>
        <ol class="gb-anatomy__legend" role="list">
          ${[
            ['Linha de base', 'Toda barra nasce do zero, numa linha de 1 px em <code class="ds-inline-code">chart.axis</code>. Barra não corta eixo.'],
            ['Barra', 'No máximo 24 px de espessura. O que sobra da faixa é respiro, não barra mais gorda.'],
            ['Ponta de dados', 'Raio de 4 px só na ponta que carrega o valor. A base fica reta, colada no zero.'],
            ['Respiro', '2 px entre barras vizinhas e entre segmentos empilhados, deixando a superfície aparecer. Nunca um contorno.'],
            ['Rótulo de valor', 'Na ponta, em <code class="ds-inline-code">fg.default</code> — texto nunca usa a cor da série. Só onde conta a história.'],
            ['Grade e eixo', 'Fios de 1 px, sólidos, em <code class="ds-inline-code">chart.grid</code>. Marcas redondas, compactas a partir de mil.'],
          ]
            .map(([title, text], i) => `<li><span class="gb-anatomy__num">${i + 1}</span><div><p class="gb-anatomy__title">${title}</p><p class="gb-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'acessibilidade',
      'Acessibilidade',
      'Todo gráfico de barras já sai assim. O que continua sendo seu: um título claro e um formato de número que faça sentido.',
      a11yList([
        ['Tabela sempre à mão', 'O botão no cabeçalho troca o gráfico por uma <code class="ds-inline-code">&lt;table&gt;</code> com todos os valores — inclusive os que o gráfico não rotula. O tooltip nunca é o único caminho até um número.'],
        ['Teclado', 'Tab foca o gráfico; as setas percorrem as categorias; Home e End vão às pontas; Esc fecha o tooltip.', ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        ['Leitor de tela', 'O gráfico se anuncia com título, tipo e número de categorias. A cada seta, uma região ao vivo lê a categoria e o valor de cada série.'],
        ['Cor nunca sozinha', 'Com duas séries ou mais há legenda; posição e rótulos ajudam. Para daltonismo total, impressão e alto contraste, ligue <code class="ds-inline-code">texture</code>.'],
        ['Contraste verificado', `As 8 cores de série passam de 3:1 sobre a superfície nos dois temas — a menor fica em ${minSeriesContrast}:1. A ordem das cores foi validada para protanopia e deuteranopia.`],
        ['Movimento', 'As barras crescem uma vez, quando aparecem. Com movimento reduzido, nada anima.'],
      ]),
    )}

    ${section(
      'tokens',
      'Tokens usados',
      'Marcas usam as cores de gráfico; textos usam sempre os tokens de texto.',
      tokenTable([
        ['color.chart.series.1', 'Série 1 (e a única, quando há uma)'],
        ['color.chart.series.2', 'Série 2 — e assim até a 8'],
        ['color.chart.muted', 'Contexto em cinza (ênfase)'],
        ['color.chart.div.2', 'Abaixo da referência'],
        ['color.chart.div.6', 'Acima da referência'],
        ['color.chart.ord.5', 'Primeira etapa do funil'],
        ['color.chart.ord.1', 'Última etapa do funil'],
        ['color.chart.grid', 'Linhas de grade'],
        ['color.chart.axis', 'Linha de base'],
        ['color.fg.default', 'Rótulos de valor'],
        ['color.fg.muted', 'Rótulos de categoria'],
        ['color.fg.subtle', 'Marcas do eixo'],
        ['color.bg.hover', 'Faixa da categoria no hover'],
        ['color.bg.raised', 'Fundo do tooltip'],
        ['shadow.md', 'Sombra do tooltip'],
        ['color.border.focus', 'Anel de foco do gráfico'],
      ]),
    )}

    ${section(
      'uso',
      'Uso',
      'Barras comparam comprimento. Quase todo erro vem de esquecer isso.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: comece do zero</p>
          <div class="gb-usage__preview">${miniBars([62, 64, 66, 63], { labels: ['0', ''] })}</div>
          <p class="usage-card__text">O comprimento da barra é o valor. Com a base no zero, 66 parece um pouco maior que 62 — porque é.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: eixo cortado</p>
          <div class="gb-usage__preview">${miniBars([62, 64, 66, 63], { base: 60, labels: ['60', ''] })}</div>
          <p class="usage-card__text">Começar em 60 faz 6% de diferença parecer o triplo. Se a variação pequena é a história, use uma linha.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Nomes longos? Deite as barras</p>
          <div class="gb-usage__preview">${miniHorizontal(['Investimentos', 'Empréstimos', 'Plataforma'])}</div>
          <p class="usage-card__text">Na horizontal o rótulo cabe inteiro, sem girar texto, e o ranking se lê de cima para baixo.</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: uma série, uma cor</p>
          <div class="gb-usage__preview">${miniBars([48, 41, 33, 27, 19])}</div>
          <p class="usage-card__text">Times, produtos e regiões não têm ordem. Todas as barras na cor do slot 1; o comprimento já diz quem é maior.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: pintar cada barra</p>
          <div class="gb-usage__preview">${miniBars([48, 41, 33, 27, 19], { colors: RAINBOW })}</div>
          <p class="usage-card__text">Cores diferentes prometem séries diferentes. Para categorias nominais, isso é ruído — e gasta as cores de que você vai precisar.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Mais de 4 séries</p>
          <div class="gb-usage__preview gb-usage__preview--text">
            <span class="ds-badge ds-badge--neutral">Empilhe</span><span class="ds-badge ds-badge--neutral">Agrupe em “Outros”</span><span class="ds-badge ds-badge--neutral">Pequenos múltiplos</span>
          </div>
          <p class="usage-card__text">Agrupadas com 5 séries ou mais viram um pente ilegível. Empilhe, junte a cauda em “Outros” ou divida em vários gráficos pequenos.</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      'Uma chamada monta o gráfico; <code class="ds-inline-code">update()</code> troca os dados sem recriar a moldura.',
      `<div class="doc-table gb-api">
        <div class="doc-table__head" aria-hidden="true"><span>Opção</span><span>Valores</span><span>Padrão</span><span>O que faz</span></div>
        ${API.map(
          ([name, values, def, text]) => `<div class="doc-table__row">
            <code class="gb-api__name">${name}</code>
            <span class="gb-api__values">${values}</span>
            <span class="gb-api__default">${def}</span>
            <span class="gb-api__text">${text}</span>
          </div>`,
        ).join('')}
      </div>
      <div class="gb-api__code">${codeBlock(`const chart = barChart(el, { title: 'Vendas', categories, series });\n\nchart.update({ series: novasSeries });   // redesenha mantendo legenda e tabela\nchart.setLoading(true);                   // meia opacidade enquanto busca\nchart.destroy();                          // remove tudo e os observadores`)}</div>`,
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
      { id: 'orientation', label: 'Orientação', value: 'vertical', options: ORIENTATIONS.map(([value, label]) => ({ value, label })) },
      { id: 'layout', label: 'Layout', value: 'grouped', options: LAYOUTS.map(([value, label]) => ({ value, label })) },
      { id: 'series', label: 'Séries', value: '3', options: ['1', '2', '3', '4'].map((value) => ({ value, label: value })) },
      { id: 'labels', label: 'Rótulos', value: 'none', options: LABELS.map(([value, label]) => ({ value, label })) },
      { id: 'highlight', label: 'Destaque', value: 'none', options: [{ value: 'none', label: 'Nenhum' }, { value: 'one', label: 'Junho' }] },
    ],
    render: () => '<div class="gb-play" data-chart></div>',
    mount: (preview, state) => {
      const chart = barChart(preview.querySelector('[data-chart]'), playOptions(state));
      return () => chart.destroy();
    },
    code: playCode,
  });

  for (const v of VARIANTS) {
    charts.push(barChart(root.querySelector(`[data-variant="${v.id}"]`), { height: 240, ...v.options }));
  }

  // Estados: os dois primeiros começam aplicados, como um data-state.
  const stateEl = (id) => root.querySelector(`[data-state-chart="${id}"]`);
  const hover = barChart(stateEl('hover'), { title: 'Vendas por canal', categories: channels.categories, series: channels.series.slice(0, 2), height: 220 });
  const hidden = barChart(stateEl('escondida'), { title: 'Vendas por canal', categories: channels.categories, series: channels.series.slice(0, 3), height: 220 });
  const loading = barChart(stateEl('carregando'), { title: 'Receita por mês', categories: MONTHS.slice(6), series: [{ name: 'Receita', values: revenue[2026].slice(6) }], format: 'currency', height: 220 });
  const empty = barChart(stateEl('vazio'), { title: 'Vendas na semana', categories: [], series: [], height: 220, empty: 'Nenhuma venda neste período.' });
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
        loading.update({ series: [{ name: 'Receita', values: (flip ? revenue[2025] : revenue[2026]).slice(6) }] });
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
