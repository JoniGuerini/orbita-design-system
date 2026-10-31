import { icon } from '../../ds/icons/icons.js';
import { scatterChart } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { customers } from '../chart-data.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-dispersao.css'];

/* ───────── Dados ───────── */

const pad = (n) => String(n).padStart(2, '0');
const median = (vals) => {
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

const X = { label: 'Custo de aquisição', format: 'currency' };
const Y = { label: 'NPS', format: 'integer' };
const SIZE = { label: 'Receita mensal', format: 'currency-compact' };

/**
 * Monta as séries: cada ponto tem nome (aparece no tooltip e na tabela);
 * o rótulo direto só aparece nos extremos quando `labels` está ligado.
 */
function build(segments, { bubbles = false, labels = false } = {}) {
  const all = segments.flatMap((s) => s.points.map((p, k) => ({ s: s.name, k, ...p })));
  const extremes = new Set();
  if (labels) {
    const by = (fn) => all.reduce((best, p) => (fn(p) > fn(best) ? p : best));
    [by((p) => p.y), by((p) => -p.y), by((p) => p.x)].forEach((p) => extremes.add(`${p.s}-${p.k}`));
  }
  return segments.map((s) => ({
    name: s.name,
    points: s.points.map((p, k) => ({
      x: p.x,
      y: p.y,
      label: `${s.name} · ${pad(k + 1)}`,
      showLabel: extremes.has(`${s.name}-${k}`),
      ...(bubbles ? { size: p.size * 1000 } : {}),
    })),
  }));
}

const references = (segments) => {
  const pts = segments.flatMap((s) => s.points);
  return {
    x: { ...X, reference: median(pts.map((p) => p.x)), referenceLabel: 'Mediana' },
    y: { ...Y, reference: median(pts.map((p) => p.y)), referenceLabel: 'Mediana' },
  };
};

/* ───────── Playground ───────── */

function playgroundOptions(state) {
  const segments = customers.slice(0, +state.series);
  const series = build(segments, { bubbles: state.bubbles === 'on', labels: state.labels === 'on' });
  const refs = state.reference === 'on' ? references(segments) : { x: X, y: Y };
  return {
    title: segments.length === 1 ? 'Varejo: custo × satisfação' : 'Custo × satisfação por segmento',
    subtitle: 'Cada ponto é uma conta',
    series,
    x: refs.x,
    y: refs.y,
    ...(state.bubbles === 'on' ? { size: SIZE } : {}),
    height: 340,
  };
}

const axisCode = (a) =>
  `{ label: '${a.label}', format: '${a.format}'${a.reference != null ? `, reference: ${a.reference}, referenceLabel: '${a.referenceLabel}'` : ''} }`;

function playgroundCode(state) {
  const o = playgroundOptions(state);
  const varName = { Varejo: 'varejo', Empresas: 'empresas', Autônomos: 'autonomos' };
  const series = o.series.map((s) => `    { name: '${s.name}', points: ${varName[s.name]} },`).join('\n');
  const point = `{ x, y, label${state.bubbles === 'on' ? ', size' : ''}${state.labels === 'on' ? ', showLabel' : ''} }`;
  return `import { scatterChart } from './ds/js/charts.js';

// cada ponto: ${point}
const chart = scatterChart(document.querySelector('#contas'), {
  title: '${o.title}',
  subtitle: '${o.subtitle}',
  series: [
${series}
  ],
  x: ${axisCode(o.x)},
  y: ${axisCode(o.y)},${o.size ? `\n  size: { label: '${SIZE.label}', format: '${SIZE.format}' },` : ''}
});`;
}

/* ───────── Variantes ───────── */

const VARIANTS = [
  {
    id: 'simples',
    name: 'Simples',
    code: '1 série',
    text: 'Uma série, um tom. Sem legenda: o título diz o que cada ponto é.',
    options: () => ({ title: 'Varejo: custo × satisfação', subtitle: 'Cada ponto é uma conta', series: build(customers.slice(0, 1)), x: X, y: Y }),
  },
  {
    id: 'segmentos',
    name: 'Por segmento',
    code: 'series: 3',
    text: 'Até três séries. Numa dispersão, qualquer ponto pode encostar em qualquer outro — por isso o teto é menor que nas linhas.',
    options: () => ({ title: 'Custo × satisfação por segmento', series: build(customers), x: X, y: Y }),
  },
  {
    id: 'bolhas',
    name: 'Bolhas',
    code: 'size',
    text: 'Uma terceira medida vira a área da bolha. Serve para comparar ordens de grandeza, não para ler o valor.',
    options: () => ({ title: 'Receita por conta', subtitle: 'Área da bolha = receita mensal', series: build(customers.slice(0, 2), { bubbles: true }), x: X, y: Y, size: SIZE }),
  },
  {
    id: 'referencias',
    name: 'Com referências',
    code: 'reference',
    text: 'As medianas dividem o plano em quadrantes: acima e à esquerda está o melhor — satisfeito e barato.',
    options: () => ({ title: 'Onde cada segmento está', subtitle: 'Linhas nas medianas de custo e NPS', series: build(customers), ...references(customers) }),
  },
  {
    id: 'rotulos',
    name: 'Rótulos seletivos',
    code: 'showLabel',
    text: 'Nome só nos extremos — o maior NPS, o menor e o custo mais alto. O resto fica no tooltip e na tabela.',
    options: () => ({ title: 'Os extremos', subtitle: 'Rótulo direto só onde a história está', series: build(customers, { labels: true }), x: X, y: Y }),
  },
];

/* ───────── API ───────── */

const API = [
  ['series', '{ name, color?, points }[]', '—', 'Até 3 séries. Acima disso, o Órbita avisa no console: agrupe ou use pequenos múltiplos.'],
  ['points', '{ x, y, size?, label?, showLabel? }[]', '—', '<code class="ds-inline-code">label</code> nomeia o ponto no tooltip e na tabela; <code class="ds-inline-code">showLabel: false</code> tira só o rótulo direto.'],
  ['x · y', '{ label, format, zero, reference, referenceLabel }', 'zero: false', 'Título do eixo, formato, se começa no zero e uma linha de referência tracejada.'],
  ['size', '{ label, format, range }', 'range: [4, 18]', 'Com <code class="ds-inline-code">size</code> nos pontos, o raio segue a raiz do valor (área proporcional).'],
  ['height', 'number', '320', 'Altura total, com os eixos.'],
  ['title · subtitle · label · card · table · pointLabel', '—', '—', 'Iguais aos de todos os gráficos; pointLabel nomeia a coluna da tabela.'],
];

function apiTable() {
  return `<div class="doc-table gd-api">
    <div class="doc-table__head" aria-hidden="true"><span>Opção</span><span>Tipo</span><span>Padrão</span><span>Para quê</span></div>
    ${API.map(
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

const targetFigure = `<svg class="gd-target__svg" viewBox="0 0 240 160" aria-hidden="true">
  <circle cx="120" cy="80" r="24" class="gd-target__hit"/>
  <circle cx="120" cy="80" r="6" class="gd-target__ring"/>
  <circle cx="120" cy="80" r="4" class="gd-target__dot"/>
  <line x1="144" y1="80" x2="196" y2="80" class="gd-target__lead"/>
  <text x="200" y="76" class="gd-target__num">24 px</text><text x="200" y="92" class="gd-target__cap">alvo</text>
  <line x1="116" y1="80" x2="64" y2="40" class="gd-target__lead"/>
  <text x="60" y="36" text-anchor="end" class="gd-target__num">8 px</text><text x="60" y="52" text-anchor="end" class="gd-target__cap">ponto</text>
  <line x1="125" y1="84" x2="160" y2="128" class="gd-target__lead"/>
  <text x="164" y="132" class="gd-target__num">2 px</text><text x="164" y="148" class="gd-target__cap">anel</text>
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
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Dispersão</h1>
        <p class="doc-header__lead">A relação entre duas medidas: cada ponto é um item. Pontos de 8 px com anel, até três séries, nome só em quem merece — e um alvo generoso para o hover achar o ponto mais próximo.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">séries</dt><dd class="doc-stat__value">até 3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">ponto</dt><dd class="doc-stat__value">8 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">anel</dt><dd class="doc-stat__value">2 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">alvo do hover</dt><dd class="doc-stat__value">24 px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['variantes', 'Variantes'],
        ['alvo', 'Alvo de 24 px'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', 'Ligue séries, bolhas, referências e rótulos. Passe o mouse perto de um ponto — não precisa acertar o centro.', playgroundMarkup('dispersao', { wide: true }))}

    ${section(
      'variantes',
      'Variantes',
      'Da nuvem simples às bolhas. Em todas, o hover acha o ponto mais próximo e a tabela lista cada um.',
      `<div class="gd-grid">
        ${VARIANTS.map(
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
      'Alvo de 24 px',
      'Um ponto de 8 px é pequeno demais para mirar. O hover procura o ponto mais perto do ponteiro, até 24 px de distância.',
      `<div class="gd-target">
        <div class="gd-target__figure">${targetFigure}</div>
        <ul class="gd-target__list" role="list">
          <li><p class="gd-target__title">Ponto de 8 px</p><p class="gd-target__text">Raio 4, na cor da série. Pequeno o bastante para a nuvem respirar.</p></li>
          <li><p class="gd-target__title">Anel de 2 px</p><p class="gd-target__text">Da cor da superfície, separa pontos sobrepostos sem desenhar contorno de tinta.</p></li>
          <li><p class="gd-target__title">Alvo de 24 px</p><p class="gd-target__text">O mais próximo dentro do raio acende, com um anel da cor dele. Em bolhas, a distância conta a partir da borda.</p></li>
        </ul>
      </div>
      <article class="gd-card gd-card--dense">
        <div class="gd-card__chart" data-dense></div>
        <div class="gd-card__body">
          <p class="cd-example__name">Experimente na nuvem<code>${customers.reduce((n, s) => n + s.points.length, 0)} pontos</code></p>
          <p class="cd-example__text">Passe o mouse no meio dos pontos: sempre há um aceso, o mais perto do ponteiro.</p>
        </div>
      </article>`,
    )}

    ${section(
      'acessibilidade',
      'Acessibilidade',
      'Cada ponto é alcançável sem mouse e sem cor.',
      a11yList([
        ['Tabela com todos os pontos', 'O botão de tabela lista cada ponto com nome, série, x, y e tamanho — o caminho para quem não enxerga a nuvem.'],
        ['Teclado', 'Tab foca o gráfico; as setas andam pelos pontos da esquerda para a direita, Home e End vão às pontas e Esc fecha o tooltip.', ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        ['Leitor de tela', 'O gráfico anuncia quantos pontos tem; cada ponto visitado é lido com nome e os dois valores.'],
        ['Cores validadas em todos os pares', 'Na dispersão qualquer cor encosta em qualquer outra. As três primeiras séries do Órbita foram validadas par a par para daltonismo — por isso o limite de três.'],
        ['Cor nunca sozinha', 'Com duas séries ou mais há legenda, e o tooltip repete o nome da série.'],
        ['Alvo generoso', 'O hover pega o ponto mais próximo até 24 px, o mínimo confortável para mouse e toque.'],
      ]),
    )}

    ${section(
      'tokens',
      'Tokens usados',
      'As três primeiras cores de série, as linhas do plano e a cor da superfície para o anel.',
      tokenTable([
        ['color.chart.series.1', 'Primeira série'],
        ['color.chart.series.2', 'Segunda série'],
        ['color.chart.series.3', 'Terceira série'],
        ['color.bg.surface', 'Anel dos pontos (cor da superfície)'],
        ['color.chart.grid', 'Linhas de grade'],
        ['color.chart.axis', 'Eixos'],
        ['color.fg.subtle', 'Valores e títulos dos eixos, referência'],
        ['color.fg.muted', 'Rótulos diretos'],
        ['color.bg.raised', 'Fundo do tooltip'],
      ]),
    )}

    ${section(
      'uso',
      'Uso',
      'Dispersão responde “uma coisa anda com a outra?”. Para o resto, há gráficos melhores.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: até 3 séries</p>
          <p class="usage-card__text">Mais que isso, as cores começam a se confundir. Agrupe em “Outros” ou separe em pequenos múltiplos.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: bolha para valor exato</p>
          <p class="usage-card__text">O olho erra a área de círculos. A bolha diz “bem maior” ou “bem menor”; o número fica no tooltip.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Zero é opcional</p>
          <p class="usage-card__text">Diferente das barras, os eixos podem começar perto dos dados — a posição é a mensagem, não o comprimento. Ligue <code class="ds-inline-code">zero</code> quando a distância até zero importa.</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: uma referência</p>
          <p class="usage-card__text">Mediana, média ou meta dão sentido aos quadrantes. Sem elas, a pessoa não sabe o que é “alto”.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: tempo no eixo x</p>
          <p class="usage-card__text">Se os pontos são uma sequência no tempo, ligue-os: use um gráfico de linha.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Rótulo só nos extremos</p>
          <p class="usage-card__text">Nome em todos os pontos vira ruído. Rotule o que a história pede e deixe o resto no tooltip.</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      'Uma função, com update, setLoading e destroy como em todos os gráficos.',
      `${codeBlock(`import { scatterChart } from './ds/js/charts.js';

const chart = scatterChart(document.querySelector('#contas'), {
  title: 'Custo × satisfação',
  series: [{ name: 'Varejo', points: [{ x: 42, y: 61, label: 'Conta 01' }, { x: 58, y: 47, label: 'Conta 02' }] }],
  x: { label: 'Custo de aquisição', format: 'currency' },
  y: { label: 'NPS', format: 'integer', reference: 50, referenceLabel: 'Meta' },
});`)}
      ${apiTable()}`,
    )}
  </div>`;
}

export function mount(root) {
  const charts = [];

  const unmountPlayground = mountPlayground(root, {
    id: 'dispersao',
    controls: [
      { id: 'series', label: 'Séries', value: '3', options: ['1', '2', '3'].map((value) => ({ value, label: value })) },
      { id: 'bubbles', label: 'Bolhas', value: 'off', options: [{ value: 'off', label: 'Sem' }, { value: 'on', label: 'Com' }] },
      { id: 'reference', label: 'Referência', value: 'off', options: [{ value: 'off', label: 'Sem' }, { value: 'on', label: 'Medianas' }] },
      { id: 'labels', label: 'Rótulos', value: 'off', options: [{ value: 'off', label: 'Sem' }, { value: 'on', label: 'Extremos' }] },
    ],
    render: () => '<div data-playground-chart></div>',
    mount(preview, state) {
      const chart = scatterChart(preview.querySelector('[data-playground-chart]'), playgroundOptions(state));
      return () => chart.destroy();
    },
    code: playgroundCode,
  });

  VARIANTS.forEach((v) => {
    const el = root.querySelector(`[data-variant="${v.id}"]`);
    if (el) charts.push(scatterChart(el, { ...v.options(), height: 300 }));
  });
  const dense = root.querySelector('[data-dense]');
  if (dense) charts.push(scatterChart(dense, { title: 'Todas as contas', series: build(customers), x: X, y: Y, height: 320 }));

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    charts.forEach((c) => c.destroy());
    unmountCopy();
    unmountNav();
  };
}
