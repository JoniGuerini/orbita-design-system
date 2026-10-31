import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { lineChart } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { MONTHS, revenue, activeUsers } from '../chart-data.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-linhas.css'];

/* ───────── Dados ───────── */

const lerp = (a, b, t) => a + (b - a) * t;
const SHARES = [
  ['App', 0.48, 0.6],
  ['Site', 0.3, 0.22],
  ['Loja', 0.15, 0.12],
  ['Parceiros', 0.07, 0.06],
];
const byChannel = (totals) =>
  SHARES.map(([name, from, to]) => ({ name, values: totals.map((v, i) => Math.round(v * lerp(from, to, i / (totals.length - 1)))) }));

const CHANNELS = byChannel(activeUsers[2026]);
const CHANNELS_2025 = byChannel(activeUsers[2025]);
const index100 = (vals) => vals.map((v) => Math.round((v / vals[0]) * 100));

const minContrast = (mode) =>
  Math.min(...contrast.filter((c) => c.fg.startsWith('color.chart.series') && c.mode === mode).map((c) => c.ratio))
    .toFixed(2)
    .replace('.', ',');

/* ───────── Playground ───────── */

const TYPES = [
  ['line', 'Linha'],
  ['area', 'Área'],
  ['stacked', 'Áreas empilhadas'],
];

function playgroundOptions(state) {
  const count = +state.series;
  const single = count === 1;
  const series = single ? [{ name: 'Usuários ativos', values: activeUsers[2026] }] : CHANNELS.slice(0, count).map((s) => ({ ...s }));
  if (state.compare === 'on' && state.type !== 'stacked') {
    series.push(single ? { name: '2025', values: activeUsers[2025], muted: true } : { name: `${CHANNELS_2025[0].name} · 2025`, values: CHANNELS_2025[0].values, muted: true });
  }
  const options = {
    title: single ? 'Usuários ativos' : 'Usuários ativos por canal',
    subtitle: 'Por mês · 2026',
    categories: MONTHS,
    series,
    format: 'integer',
  };
  if (state.type === 'area') options.area = true;
  if (state.type === 'stacked') options.stacked = true;
  if (state.curve === 'smooth') options.curve = 'smooth';
  if (state.markers !== 'end') options.markers = state.markers;
  if (state.target === 'on') options.target = { value: single || state.type === 'stacked' ? 35000 : 20000, label: 'Meta' };
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

const chart = lineChart(document.querySelector('#usuarios'), {
  title: '${o.title}',
  subtitle: '${o.subtitle}',
  categories: ${list(MONTHS.map((m) => `'${m}'`))},
  series: [
${series}
  ],
${extra ? `${extra}\n` : ''}  format: 'integer',
});`;
}

/* ───────── Variantes ───────── */

const withGaps = revenue[2026].map((v, i) => (i === 3 || i === 4 ? null : v));

const VARIANTS = [
  {
    id: 'unica',
    name: 'Linha única',
    code: '1 série',
    text: 'Uma série não precisa de legenda: o título diz o que é, e o último valor fica escrito no fim da linha.',
    options: { title: 'Receita', subtitle: 'Por mês · 2026', categories: MONTHS, series: [{ name: 'Receita', values: revenue[2026] }], format: 'currency-compact' },
  },
  {
    id: 'varias',
    name: 'Várias séries',
    code: 'endLabels',
    text: 'Até quatro linhas ganham o nome no fim — quando cabem sem colidir. Se as linhas se encontram ali, ficam a legenda e o tooltip.',
    options: { title: 'Usuários ativos por canal', subtitle: 'Por mês · 2026', categories: MONTHS, series: CHANNELS.slice(0, 3), format: 'integer' },
  },
  {
    id: 'comparacao',
    name: 'Contra o período anterior',
    code: 'muted: true',
    text: 'O ano passado entra em cinza, por baixo: é contexto, não protagonista. Continua nomeado na legenda e no tooltip.',
    options: { title: 'Usuários ativos', subtitle: '2026 contra 2025', categories: MONTHS, series: [{ name: '2026', values: activeUsers[2026] }, { name: '2025', values: activeUsers[2025], muted: true }], format: 'integer' },
  },
  {
    id: 'enfase',
    name: 'Ênfase',
    code: 'highlight: 0',
    text: 'Quando a história é uma série, ela fica na cor e as outras viram cinza. Mais claro que quatro cores disputando o olho.',
    options: { title: 'O App puxa o crescimento', subtitle: 'Usuários ativos por canal', categories: MONTHS, series: CHANNELS, highlight: 0, format: 'integer' },
  },
  {
    id: 'area',
    name: 'Área',
    code: 'area: true',
    text: 'Para uma série só, quando o volume importa. A área é uma lavagem de 10% da cor — a linha continua mandando.',
    options: { title: 'Usuários ativos', subtitle: 'Por mês · 2026', categories: MONTHS, series: [{ name: 'Usuários ativos', values: activeUsers[2026] }], area: true, curve: 'smooth', format: 'integer' },
  },
  {
    id: 'empilhadas',
    name: 'Áreas empilhadas',
    code: 'stacked: true',
    text: 'Partes que somam um total no tempo. A borda de cada faixa é a linha; o total aparece no tooltip.',
    options: { title: 'Usuários ativos por canal', subtitle: 'Soma dos canais · 2026', categories: MONTHS, series: CHANNELS.slice(0, 3), stacked: true, format: 'integer' },
  },
  {
    id: 'meta',
    name: 'Com meta',
    code: 'target',
    text: 'A meta é a única linha tracejada do sistema — tracejado quer dizer referência, nunca grade.',
    options: { title: 'Receita', subtitle: 'Por mês · 2026', categories: MONTHS, series: [{ name: 'Receita', values: revenue[2026] }], target: { value: 140000, label: 'Meta' }, format: 'currency-compact' },
  },
  {
    id: 'lacunas',
    name: 'Com lacunas',
    code: 'null',
    text: 'Sem dado em abril e maio: a linha quebra em vez de inventar uma ponte. No tooltip e na tabela, aparece “—”.',
    options: { title: 'Receita', subtitle: 'Abril e maio sem fechamento', categories: MONTHS, series: [{ name: 'Receita', values: withGaps }], markers: 'all', format: 'currency-compact' },
  },
];

/* ───────── API ───────── */

const API = [
  ['categories', 'string[]', '—', 'Rótulos do eixo x, em ordem.'],
  ['series', '{ name, values, color?, muted? }[]', '—', 'Uma entrada por linha. <code class="ds-inline-code">null</code> em values quebra a linha. Sem <code class="ds-inline-code">color</code>, a série usa o slot da sua posição.'],
  ['area', 'boolean', 'false', 'Lavagem de 10% sob a linha.'],
  ['stacked', 'boolean', 'false', 'Faixas somadas; o tooltip mostra o total.'],
  ['curve', "'linear' | 'smooth'", "'linear'", 'Suave é monotônica: não cria picos que não existem.'],
  ['markers', "'end' | 'all' | 'none'", "'end'", 'Pontos de 8 px com anel de 2 px. <code class="ds-inline-code">all</code> só até 40 pontos.'],
  ['endLabels', 'boolean', 'true', 'Nome (ou valor, com uma série) no fim da linha, se couber sem colidir.'],
  ['highlight', 'number', '—', 'Índice da série em destaque; as outras ficam em cinza.'],
  ['target', '{ value, label }', '—', 'Linha de referência tracejada.'],
  ['zero', 'boolean', 'true', 'O eixo começa no zero. Áreas sempre começam.'],
  ['format · axisFormat', 'preset | Intl | função', "'number'", 'Valores no tooltip e na tabela; o eixo compacta a partir de mil.'],
  ['height', 'number', '280', 'Altura total, já com a faixa do eixo x.'],
  ['title · subtitle · label', 'string', '—', 'Título visível ou, sem ele, o nome acessível do gráfico.'],
  ['card · table · tooltipLabels', 'boolean · boolean · string[]', 'false · true · —', 'Superfície com contorno, botão de tabela e rótulos longos para o tooltip.'],
];

const METHODS = [
  ['update(options)', 'Mescla as opções e redesenha. Séries escondidas na legenda continuam escondidas.'],
  ['setLoading(bool)', 'Mantém o desenho anterior a 45% enquanto os dados chegam — sem esqueleto, sem pulo.'],
  ['destroy()', 'Desliga observadores e eventos e limpa o contêiner.'],
];

function apiTable() {
  return `<div class="doc-table gl-api">
    <div class="doc-table__head" aria-hidden="true"><span>Opção</span><span>Tipo</span><span>Padrão</span><span>Para quê</span></div>
    ${API.map(
      ([name, type, def, text]) => `<div class="doc-table__row">
        <span><code class="ds-inline-code">${name}</code></span>
        <span class="gl-api__type">${type}</span>
        <span class="gl-api__type">${def}</span>
        <span class="gl-api__text">${text}</span>
      </div>`,
    ).join('')}
  </div>
  <div class="doc-table gl-api gl-api--methods">
    <div class="doc-table__head" aria-hidden="true"><span>Método</span><span>O que faz</span></div>
    ${METHODS.map(([name, text]) => `<div class="doc-table__row"><span><code class="ds-inline-code">${name}</code></span><span class="gl-api__text">${text}</span></div>`).join('')}
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
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Linhas e áreas</h1>
        <p class="doc-header__lead">Para mostrar como algo muda no tempo. Traço de 2 px, um eixo só, a mira encontra o mês e o nome fica no fim da linha — sem caixa de legenda para decifrar.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">variantes</dt><dd class="doc-stat__value">${VARIANTS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">traço</dt><dd class="doc-stat__value">2 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">nomes no fim</dt><dd class="doc-stat__value">até 4</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">eixo y</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['variantes', 'Variantes'],
        ['mira', 'Mira e tooltip'],
        ['um-eixo', 'Um eixo só'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', 'Troque o tipo, as séries e os detalhes. O gráfico segue o tema do palco e o código acompanha.', playgroundMarkup('linhas', { wide: true }))}

    ${section(
      'variantes',
      'Variantes',
      'O mesmo componente cobre as perguntas mais comuns sobre o tempo. Passe o mouse em qualquer uma.',
      `<div class="gl-grid">
        ${VARIANTS.map(
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
      'Mira e tooltip',
      'Ninguém mira numa linha de 2 px. A mira vertical acha o mês mais próximo e um único tooltip mostra todas as séries ali.',
      `<div class="gl-split">
        <div class="gl-card gl-card--flush"><div class="gl-card__chart" data-crosshair></div></div>
        <ul class="gl-points" role="list">
          <li>${icon('target', { size: 18 })}<div><p class="gl-points__title">Encontra o x, não a linha</p><p class="gl-points__text">A mira se prende ao ponto de dados mais perto do ponteiro, em qualquer altura da área.</p></div></li>
          <li>${icon('list', { size: 18 })}<div><p class="gl-points__title">Um tooltip, todas as séries</p><p class="gl-points__text">A leitura lista cada série visível naquele mês, na ordem da legenda.</p></div></li>
          <li>${icon('type', { size: 18 })}<div><p class="gl-points__title">Valor primeiro, nome depois</p><p class="gl-points__text">Quem olha já sabe a série; quer o número. Ele vem forte, o nome vem apagado, com um traço da cor como chave.</p></div></li>
          <li>${icon('input', { size: 18 })}<div><p class="gl-points__title">O mesmo no teclado</p><p class="gl-points__text">Tab foca o gráfico, as setas andam pelos meses e o valor é lido por leitores de tela.</p></div></li>
        </ul>
      </div>`,
    )}

    ${section(
      'um-eixo',
      'Um eixo só',
      'Nada de dois eixos y. Duas grandezas de escalas diferentes viram um índice comum ou dois gráficos alinhados.',
      `<div class="gl-why">
        <span class="gl-why__icon">${icon('alert-triangle', { size: 18 })}</span>
        <p>Com dois eixos, a escala de cada lado é escolhida à mão. O ponto em que as linhas se cruzam — e a impressão de que andam juntas — passa a ser decisão de quem montou o gráfico, não dos dados.</p>
      </div>
      <div class="gl-grid">
        <article class="gl-card">
          <div class="gl-card__chart" data-axis="indice"></div>
          <div class="gl-card__body">
            <p class="cd-example__name">Índice com base 100<code>zero: false</code></p>
            <p class="cd-example__text">As duas medidas partem de 100 em janeiro. Agora dá para comparar o ritmo: usuários cresceram mais que a receita.</p>
          </div>
        </article>
        <article class="gl-card">
          <div class="gl-card__chart gl-card__chart--stack">
            <div data-axis="usuarios"></div>
            <div data-axis="receita"></div>
          </div>
          <div class="gl-card__body">
            <p class="cd-example__name">Dois gráficos, mesmo eixo x<code>pequenos múltiplos</code></p>
            <p class="cd-example__text">Cada medida na sua escala, um gráfico embaixo do outro, com os meses alinhados.</p>
          </div>
        </article>
      </div>`,
    )}

    ${section(
      'acessibilidade',
      'Acessibilidade',
      'O gráfico já nasce com teclado, tabela e nomes. Estas são as decisões que continuam sendo suas.',
      a11yList([
        ['Tabela sempre à mão', 'O botão de tabela no cabeçalho troca o desenho pelos números — todos, inclusive os que o gráfico não rotula. O tooltip nunca é o único caminho até um valor.'],
        ['Teclado', 'Tab foca o gráfico; as setas andam pelos pontos, Home e End vão às pontas e Esc fecha o tooltip.', ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        ['Leitor de tela', 'O gráfico tem nome e resumo (tipo, pontos e séries). Cada ponto visitado pelo teclado é anunciado numa região ao vivo.'],
        ['Cor nunca sozinha', 'Com duas séries ou mais, sempre há legenda — e nomes no fim da linha quando cabem. A série de contexto é cinza e continua nomeada.'],
        ['Contraste verificado', `Toda cor de série passa de 3:1 contra a superfície — a menor é ${minContrast('dark')}:1 no escuro e ${minContrast('light')}:1 no claro. Textos usam tokens de texto, nunca a cor da série.`],
        ['Movimento com moderação', 'A linha se desenha uma vez, quando aparece na tela, e não anima com <code class="ds-inline-code">prefers-reduced-motion</code>.'],
      ]),
    )}

    ${section(
      'tokens',
      'Tokens usados',
      'Marcas consomem as cores de gráfico; tudo o que é texto consome tokens de texto.',
      tokenTable([
        ['color.chart.series.1', 'Primeira série'],
        ['color.chart.series.2', 'Segunda série'],
        ['color.chart.series.3', 'Terceira série'],
        ['color.chart.series.4', 'Quarta série'],
        ['color.chart.muted', 'Contexto e séries fora da ênfase'],
        ['color.chart.grid', 'Linhas de grade'],
        ['color.chart.axis', 'Linha de base e mira'],
        ['color.fg.subtle', 'Rótulos dos eixos e linha de meta'],
        ['color.fg.muted', 'Nome no fim da linha'],
        ['color.fg.default', 'Valor no fim da linha'],
        ['color.bg.raised', 'Fundo do tooltip'],
        ['color.border.focus', 'Foco do gráfico'],
      ]),
    )}

    ${section(
      'uso',
      'Uso',
      'Escolha a linha quando a pergunta tem “quando” ou “desde”. Quatro cuidados resolvem quase tudo.',
      `<div class="usage-grid gl-usage">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: tempo no eixo x</p>
          <p class="usage-card__text">Linhas ligam pontos em sequência. Se a ordem não é tempo (ou outra sequência real), use barras.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: dois eixos y</p>
          <p class="usage-card__text">Cria correlação que não existe. Indexe as duas medidas na mesma base ou faça dois gráficos.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Mais de 4 séries?</p>
          <p class="usage-card__text">Destaque a que importa e deixe o resto em cinza, agrupe a cauda em “Outros” ou separe em pequenos múltiplos. Nunca invente uma 9ª cor.</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: rótulo seletivo</p>
          <p class="usage-card__text">O valor final, o pico ou a série da história. Um número em cada ponto ninguém lê.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: área sobreposta</p>
          <p class="usage-card__text">Áreas de várias séries umas sobre as outras escondem dados. Para partes de um total, empilhe; para comparar, use linhas.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Zero no eixo</p>
          <p class="usage-card__text">Áreas sempre começam no zero. Em linhas, desligue com <code class="ds-inline-code">zero: false</code> só quando a variação é a história — e diga isso no subtítulo.</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      'Uma função, as mesmas regras de todos os gráficos do Órbita.',
      `${codeBlock(`import { lineChart } from './ds/js/charts.js';

const chart = lineChart(document.querySelector('#receita'), {
  title: 'Receita',
  categories: ['Jan', 'Fev', 'Mar'],
  series: [{ name: 'Receita', values: [82000, 91000, 88000] }],
  format: 'currency-compact',
});

chart.update({ target: { value: 90000, label: 'Meta' } });`)}
      ${apiTable()}`,
    )}
  </div>`;
}

export function mount(root) {
  const charts = [];
  const make = (el, options) => el && charts.push(lineChart(el, options));

  const unmountPlayground = mountPlayground(root, {
    id: 'linhas',
    controls: [
      { id: 'type', label: 'Tipo', value: 'line', options: TYPES.map(([value, label]) => ({ value, label })) },
      { id: 'series', label: 'Séries', value: '1', options: ['1', '2', '3', '4'].map((value) => ({ value, label: value })) },
      { id: 'curve', label: 'Curva', value: 'linear', options: [{ value: 'linear', label: 'Reta' }, { value: 'smooth', label: 'Suave' }] },
      { id: 'markers', label: 'Marcadores', value: 'end', options: [{ value: 'end', label: 'No fim' }, { value: 'all', label: 'Todos' }, { value: 'none', label: 'Nenhum' }] },
      { id: 'target', label: 'Meta', value: 'off', options: [{ value: 'off', label: 'Sem' }, { value: 'on', label: 'Com' }] },
      { id: 'compare', label: 'Ano anterior', value: 'off', options: [{ value: 'off', label: 'Sem' }, { value: 'on', label: 'Com' }] },
    ],
    render: () => '<div class="gl-stage" data-playground-chart></div>',
    mount(preview, state) {
      const chart = lineChart(preview.querySelector('[data-playground-chart]'), { ...playgroundOptions(state), height: 300 });
      return () => chart.destroy();
    },
    code: playgroundCode,
  });

  VARIANTS.forEach((v) => make(root.querySelector(`[data-variant="${v.id}"]`), { ...v.options, height: 240 }));

  // Mira: já aberta num mês, para quem só está lendo.
  const crossEl = root.querySelector('[data-crosshair]');
  make(crossEl, {
    title: 'Receita',
    subtitle: '2026 contra 2025',
    categories: MONTHS,
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
    title: 'Receita e usuários',
    subtitle: 'Índice · janeiro = 100',
    categories: MONTHS,
    series: [
      { name: 'Usuários ativos', values: index100(activeUsers[2026]) },
      { name: 'Receita', values: index100(revenue[2026]) },
    ],
    zero: false,
    target: { value: 100, label: 'Base' },
    format: 'integer',
    height: 300,
  });
  // A cor segue a medida: as mesmas do índice acima.
  make(root.querySelector('[data-axis="usuarios"]'), { title: 'Usuários ativos', categories: MONTHS, series: [{ name: 'Usuários ativos', values: activeUsers[2026] }], format: 'integer', height: 150 });
  make(root.querySelector('[data-axis="receita"]'), { title: 'Receita', categories: MONTHS, series: [{ name: 'Receita', values: revenue[2026], color: 2 }], format: 'currency-compact', height: 150 });

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    charts.forEach((c) => c.destroy());
    unmountCopy();
    unmountNav();
  };
}
