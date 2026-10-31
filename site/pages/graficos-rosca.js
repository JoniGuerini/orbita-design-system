import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { donutChart, barChart, meter } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { payments } from '../chart-data.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-rosca.css'];

/* ───────── Dados ───────── */

const THICKNESS = [
  ['14', 'Fina', 14],
  ['24', 'Média', 24],
  ['36', 'Grossa', 36],
];

const CENTERS = [
  ['total', 'Total'],
  ['custom', 'Personalizado'],
  ['none', 'Nenhum'],
];

const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

/** Divisão por região com valores próximos — o caso em que a rosca não ajuda. */
const REGIONS = [
  { name: 'Sudeste', value: 2210 },
  { name: 'Norte', value: 2130 },
  { name: 'Nordeste', value: 2040 },
  { name: 'Centro-Oeste', value: 1930 },
  { name: 'Sul', value: 1820 },
];

const minContrast = (() => {
  const ratios = contrast.filter((c) => /^color\.chart\.series\.[1-6]$/.test(c.fg) && c.bg === 'color.bg.surface').map((c) => c.ratio);
  return Math.min(...ratios).toFixed(2).replace('.', ',');
})();

/* ───────── Playground ───────── */

function playOptions(state) {
  const items = payments.slice(0, Number(state.slices));
  const total = items.reduce((a, it) => a + it.value, 0);
  const center = state.center === 'custom' ? { value: pct.format(items[0].value / total), label: 'via Pix' } : state.center === 'none' ? false : 'total';
  return {
    title: 'Pagamentos por método',
    subtitle: 'Transações em outubro',
    items,
    format: 'integer',
    thickness: Number(state.thickness),
    center,
    centerLabel: 'transações',
    texture: state.texture === 'on',
  };
}

function playCode(state) {
  const o = playOptions(state);
  const center = o.center === false ? 'center: false,' : typeof o.center === 'object' ? `center: { value: '${o.center.value}', label: '${o.center.label}' },` : "centerLabel: 'transações',";
  const lines = [
    "title: 'Pagamentos por método',",
    "subtitle: 'Transações em outubro',",
    'items: [',
    ...o.items.map((it) => `  { name: '${it.name}', value: ${it.value} },`),
    '],',
    "format: 'integer',",
    o.thickness !== 24 && `thickness: ${o.thickness},`,
    center,
    o.texture && 'texture: true,',
  ].filter(Boolean);
  const fold = o.items.length > 6 ? '\n// Mais de 6 itens: os menores viram “Outros”, em cinza.' : '';
  return `import { donutChart } from './ds/js/charts.js';${fold}\n\ndonutChart(document.querySelector('#pagamentos'), {\n${lines.map((l) => `  ${l}`).join('\n')}\n});`;
}

/* ───────── Variantes ───────── */

const VARIANTS = [
  {
    id: 'total',
    name: 'Total no miolo',
    code: "center: 'total'",
    text: 'O padrão. O miolo soma tudo; no hover, mostra a fatia. A lista ao lado é a legenda e o rótulo de cada parte.',
    options: { title: 'Pagamentos por método', items: payments.slice(0, 5), format: 'integer', centerLabel: 'transações' },
  },
  {
    id: 'outros',
    name: 'Cauda em “Outros”',
    code: 'maxSegments: 6',
    text: 'Da 6ª fatia em diante, as menores viram “Outros”, em cinza e sempre por último. A tabela abre a cauda.',
    options: { title: 'Todos os métodos', items: payments, format: 'integer', centerLabel: 'transações' },
  },
  {
    id: 'textura',
    name: 'Com textura',
    code: 'texture: true',
    text: 'Hachura em 45° e 135° para daltonismo total, impressão e alto contraste. Na impressão, liga sozinha.',
    options: { title: 'Pagamentos por método', items: payments.slice(0, 4), format: 'integer', centerLabel: 'transações', texture: true },
  },
  {
    id: 'fina',
    name: 'Fina, com miolo próprio',
    code: 'thickness: 14',
    text: 'Anel fino quando o número do miolo é a mensagem. Diga o que ele significa no rótulo.',
    options: { title: 'Aprovação de cadastros', items: [{ name: 'Aprovados', value: 812, color: 1 }, { name: 'Em análise', value: 146, color: 2 }, { name: 'Recusados', value: 42, color: 'other' }], format: 'integer', thickness: 14, center: { value: '81%', label: 'aprovados' } },
  },
];

const STATES = [
  ['hover', 'Hover e teclado', 'A fatia sai 4 px do anel, as outras apagam e o miolo mostra o percentual. A linha da lista acende junto.'],
  ['carregando', 'Carregando', 'Ao buscar dados novos, a rosca anterior fica a meia opacidade — sem esqueleto, sem pulo.'],
  ['vazio', 'Vazio', 'Sem valores, um aviso ocupa o lugar do anel. Uma rosca vazia não é um círculo cinza.'],
];

/* ───────── API ───────── */

const API = [
  ['items', '[{ name, value, color? }]', '—', 'Uma entrada por fatia, na ordem em que aparecem a partir das 12 h. Ordene da maior para a menor.'],
  ['format', 'preset | Intl | função', "'number'", 'Formato dos valores no miolo, na lista e na tabela. O percentual é calculado.'],
  ['center', "'total' | { value, label } | false", "'total'", 'O que o miolo mostra fora do hover.'],
  ['centerLabel', 'string', "'Total'", 'Rótulo sob o total. Diga a unidade: “transações”, “clientes”.'],
  ['maxSegments', 'número', '6', 'Acima disso, as menores fatias viram “Outros”.'],
  ['otherLabel', 'string', "'Outros'", 'Nome da fatia que agrupa a cauda.'],
  ['size · thickness', 'px', '200 · 24', 'Diâmetro e espessura do anel. A lista vai para baixo quando não cabe ao lado.'],
  ['texture', 'boolean', 'false', 'Hachura de reserva para quando a cor não basta.'],
  ['title · subtitle', 'string', '—', 'Cabeçalho. Sem título, passe <code class="ds-inline-code">label</code> para nomear o gráfico.'],
  ['categoryLabel · valueLabel', 'string', "'Categoria' · 'Valor'", 'Cabeçalhos das colunas da vista em tabela.'],
];

/* ───────── Anatomia (desenho estático) ───────── */

function anatomySvg() {
  const cx = 120;
  const cy = 110;
  const R = 88;
  const r = 64;
  const shares = [0.46, 0.29, 0.14, 0.07, 0.04];
  const colors = [1, 2, 3, 4, 'other'];
  const gap = 2 / ((R + r) / 2);
  const f = (n) => Math.round(n * 100) / 100;
  const p = (rad, a) => `${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`;
  let a = -Math.PI / 2;
  const segs = shares
    .map((s, i) => {
      const a0 = a + gap / 2;
      const a1 = a + s * Math.PI * 2 - gap / 2;
      a += s * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const c = colors[i] === 'other' ? 'var(--ds-color-chart-other)' : `var(--ds-color-chart-series-${colors[i]})`;
      return `<path d="M${p(R, a0)}A${R} ${R} 0 ${large} 1 ${p(R, a1)}L${p(r, a1)}A${r} ${r} 0 ${large} 0 ${p(r, a0)}Z" style="fill:${c}"/>`;
    })
    .join('');
  const rows = [
    ['Pix', '4.210', '46%', 1],
    ['Crédito', '2.630', '29%', 2],
    ['Débito', '1.290', '14%', 3],
    ['Boleto', '610', '7%', 4],
    ['Outros', '380', '4%', 'other'],
  ]
    .map(([name, value, share, c], i) => {
      const y = 38 + i * 36;
      const fill = c === 'other' ? 'var(--ds-color-chart-other)' : `var(--ds-color-chart-series-${c})`;
      return `${i ? `<line x1="268" x2="540" y1="${y - 18}" y2="${y - 18}" class="gr-anat__rule"/>` : ''}
        <rect x="276" y="${y - 5}" width="10" height="10" rx="3" style="fill:${fill}"/>
        <text x="298" y="${y}" class="gr-anat__name" dominant-baseline="middle">${name}</text>
        <text x="482" y="${y}" class="gr-anat__value" text-anchor="end" dominant-baseline="middle">${value}</text>
        <text x="532" y="${y}" class="gr-anat__share" text-anchor="end" dominant-baseline="middle">${share}</text>`;
    })
    .join('');
  const num = (n, x, y) => `<g class="gr-anat__callout"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 4}" text-anchor="middle">${n}</text></g>`;
  // respiro entre a 1ª e a 2ª fatia (fim da 1ª): ângulo a1 da fatia 0
  const ag = -Math.PI / 2 + shares[0] * Math.PI * 2;
  return `<svg viewBox="0 0 560 220" class="gr-anat">
    ${segs}
    <text x="${cx}" y="${cy - 2}" class="gr-anat__center" text-anchor="middle">9.120</text>
    <text x="${cx}" y="${cy + 18}" class="gr-anat__center-label" text-anchor="middle">transações</text>
    <path class="gr-anat__dim" d="M${p(R + 6, -Math.PI / 2 - 0.5)}L${p(r - 6, -Math.PI / 2 - 0.5)}"/>
    <circle cx="${f(cx + ((R + r) / 2) * Math.cos(ag))}" cy="${f(cy + ((R + r) / 2) * Math.sin(ag))}" r="9" class="gr-anat__ring"/>
    ${rows}
    ${num(1, 28, 34)}
    ${num(2, f(cx + (R + 22) * Math.cos(ag)), f(cy + (R + 22) * Math.sin(ag)))}
    ${num(3, cx, cy - 40)}
    ${num(4, 254, 38)}
    ${num(5, 254, 182)}
  </svg>`;
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

export default function renderRosca(page) {
  return `
  <div class="page doc gr-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Rosca</h1>
        <p class="doc-header__lead">A parte do todo de relance. Até seis fatias, o total no miolo e uma lista que é legenda e rótulo ao mesmo tempo.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">fatias no máximo</dt><dd class="doc-stat__value">6</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">espessura padrão</dt><dd class="doc-stat__value">24 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">respiro entre fatias</dt><dd class="doc-stat__value">2 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">contraste mínimo</dt><dd class="doc-stat__value">${minContrast}:1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['variantes', 'Variantes'],
        ['rosca-ou-barras', 'Rosca ou barras'],
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

    ${section('playground', 'Playground', 'Mude o número de fatias, a espessura e o miolo. Com 7 fatias, veja a cauda virar “Outros”. Passe o mouse no anel ou na lista.', playgroundMarkup('graficos-rosca', { wide: true }))}

    ${section(
      'variantes',
      'Variantes',
      'Mesma anatomia, quatro ajustes. A rosca nunca ganha 3D, sombra ou fatia descolada.',
      `<div class="gr-variants">
        ${VARIANTS.map(
          (v) => `<article class="gr-variant">
            <div class="gr-variant__chart" data-variant="${v.id}"></div>
            <div class="gr-variant__body">
              <p class="gr-variant__name">${v.name}<code>${v.code}</code></p>
              <p class="gr-variant__text">${v.text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>
      <h3 class="doc-subhead">Lado a lado ou empilhada<span class="doc-subhead__meta">automático, pela largura</span></h3>
      <article class="gr-variant">
        <div class="gr-layouts">
          <div class="gr-layouts__wide"><p class="gr-layouts__label">Com espaço: lista ao lado</p><div data-layout-chart="side"></div></div>
          <div class="gr-layouts__narrow"><p class="gr-layouts__label">No estreito: lista embaixo</p><div data-layout-chart="stack"></div></div>
        </div>
        <div class="gr-variant__body">
          <p class="gr-variant__text">Com espaço (diâmetro + 260 px), a lista fica ao lado da rosca. No estreito, desce para baixo dela — sem você configurar nada.</p>
        </div>
      </article>`,
    )}

    ${section(
      'rosca-ou-barras',
      'Rosca ou barras?',
      'A rosca mostra proporção; ninguém compara ângulos com precisão. Quando os valores são próximos, use barras.',
      `<div class="gr-compare">
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: rosca para valores próximos</p>
          <div class="gr-compare__chart" data-compare="donut"></div>
          <p class="usage-card__text">Qual região é a maior? Com 21,8% contra 21%, o ângulo não responde — a pessoa precisa ler a lista.</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: barras ordenadas</p>
          <div class="gr-compare__chart" data-compare="bars"></div>
          <p class="usage-card__text">Comprimento sobre a mesma base: a ordem salta aos olhos e o valor fica na ponta.</p>
        </article>
      </div>`,
    )}

    ${section(
      'estados',
      'Estados',
      'O primeiro começa com uma fatia em destaque — passe o mouse ou use as setas para trocar.',
      `<div class="gr-states">
        ${STATES.map(
          ([id, name, text]) => `<article class="gr-variant">
            <div class="gr-variant__chart" data-state-chart="${id}"></div>
            <div class="gr-variant__body">
              <p class="gr-variant__name">${name}${id === 'carregando' ? `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-reload>${icon('refresh', { size: 16 })}Recarregar</button>` : ''}</p>
              <p class="gr-variant__text">${text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'anatomia',
      'Anatomia',
      'Cinco partes. A rosca é só o resumo visual; quem carrega os números é a lista.',
      `<div class="gr-anatomy">
        <div class="gr-anatomy__stage" aria-hidden="true">${anatomySvg()}</div>
        <ol class="gr-anatomy__legend" role="list">
          ${[
            ['Anel', 'Espessura de 24 px por padrão (14 a 36). As fatias começam às 12 h e seguem no sentido horário, da maior para a menor.'],
            ['Respiro', '2 px entre fatias, abertos no próprio desenho — a superfície aparece. Nunca um contorno em volta da fatia.'],
            ['Miolo', 'O total em sans semibold, com algarismos proporcionais, e o rótulo com a unidade. No hover, vira o percentual da fatia.'],
            ['Lista', 'Legenda e rótulo direto ao mesmo tempo: cor, nome, valor e percentual, com números alinhados em colunas.'],
            ['Outros', 'A cauda agrupada, em <code class="ds-inline-code">chart.other</code>, sempre por último. Nunca uma 7ª cor.'],
          ]
            .map(([title, text], i) => `<li><span class="gr-anatomy__num">${i + 1}</span><div><p class="gr-anatomy__title">${title}</p><p class="gr-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'acessibilidade',
      'Acessibilidade',
      'A rosca já sai acessível. O que continua sendo seu: um título claro e o rótulo da unidade no miolo.',
      a11yList([
        ['Tabela sempre à mão', 'O botão no cabeçalho troca a rosca por uma tabela com nome, valor e percentual — inclusive os itens agrupados em “Outros”, um por um.'],
        ['Teclado', 'Tab foca o gráfico; as setas percorrem as fatias; Home e End vão à primeira e à última; Esc volta ao total.', ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        ['Leitor de tela', 'O gráfico se anuncia com título e número de fatias. A cada seta, uma região ao vivo lê o nome, o percentual e o valor.'],
        ['Cor nunca sozinha', 'Cada fatia tem nome e número na lista, na mesma ordem do anel. Para daltonismo total, impressão e alto contraste, ligue <code class="ds-inline-code">texture</code>.'],
        ['Contraste verificado', `As 6 primeiras cores de série passam de 3:1 sobre a superfície nos dois temas — a menor fica em ${minContrast}:1.`],
        ['Movimento', 'As fatias aparecem uma vez, em fade. Com movimento reduzido, nada anima — nem o destaque da fatia.'],
      ]),
    )}

    ${section(
      'tokens',
      'Tokens usados',
      'Fatias usam as cores de gráfico, na ordem fixa; textos usam sempre os tokens de texto.',
      tokenTable([
        ['color.chart.series.1', 'Primeira fatia'],
        ['color.chart.series.2', 'Segunda fatia — e assim até a 5ª'],
        ['color.chart.other', '“Outros”'],
        ['color.fg.default', 'Valor do miolo e da lista'],
        ['color.fg.muted', 'Nome na lista'],
        ['color.fg.subtle', 'Rótulo do miolo e percentual'],
        ['color.bg.hover', 'Linha da lista em destaque'],
        ['color.border.subtle', 'Divisória da lista'],
        ['color.border.focus', 'Anel de foco do gráfico'],
        ['duration.base', 'Fatia saindo do anel'],
      ]),
    )}

    ${section(
      'uso',
      'Uso',
      'A rosca é a forma mais fácil de errar. Use pouco, e só para parte do todo.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: partes de um todo</p>
          <p class="usage-card__text">As fatias somam 100% de uma coisa só — transações, orçamento, clientes. Nada de categorias que se sobrepõem.</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: até 6 fatias, em ordem</p>
          <p class="usage-card__text">Da maior para a menor, começando às 12 h. A partir da 6ª, junte em “Outros” — o componente faz isso por você.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: 3D, sombra e fatia descolada</p>
          <p class="usage-card__text">Perspectiva distorce os ângulos e a sombra vira ruído. O destaque já vem no hover, e só enquanto dura.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: rosca de duas fatias</p>
          <div class="gr-usage__meter">${meter({ label: 'Cota de armazenamento', value: 72, max: 100, format: (v) => `${v} GB` })}</div>
          <p class="usage-card__text">“72% usado” é uma razão contra um limite. Um medidor diz isso numa linha, sem pedir que ninguém leia ângulos.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Comparar? Use barras</p>
          <p class="usage-card__text">Se a pergunta é “quem é maior”, “quanto mudou” ou “como foi ao longo do tempo”, a resposta é barra ou linha — nunca várias roscas lado a lado.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Diga a unidade no miolo</p>
          <p class="usage-card__text">“9.120” não diz nada sozinho. <code class="ds-inline-code">centerLabel: 'transações'</code> diz.</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      'Uma chamada monta a rosca, a lista e a tabela; <code class="ds-inline-code">update()</code> troca os itens.',
      `<div class="doc-table gr-api">
        <div class="doc-table__head" aria-hidden="true"><span>Opção</span><span>Valores</span><span>Padrão</span><span>O que faz</span></div>
        ${API.map(
          ([name, values, def, text]) => `<div class="doc-table__row">
            <code class="gr-api__name">${name}</code>
            <span class="gr-api__values">${values}</span>
            <span class="gr-api__default">${def}</span>
            <span class="gr-api__text">${text}</span>
          </div>`,
        ).join('')}
      </div>
      <div class="gr-api__code">${codeBlock(`const chart = donutChart(el, { title: 'Pagamentos', items, format: 'integer' });\n\nchart.update({ items: novosItens });   // redesenha mantendo a moldura\nchart.setLoading(true);                 // meia opacidade enquanto busca\nchart.destroy();`)}</div>`,
    )}
  </div>`;
}

/* ───────── Montagem ───────── */

export function mount(root) {
  const charts = [];

  const unmountPlayground = mountPlayground(root, {
    id: 'graficos-rosca',
    controls: [
      { id: 'slices', label: 'Fatias', value: '5', options: ['2', '3', '4', '5', '6', '7'].map((value) => ({ value, label: value === '7' ? '7 (vira “Outros”)' : value })) },
      { id: 'thickness', label: 'Espessura', value: '24', options: THICKNESS.map(([value, label, px]) => ({ value, label: `${label} · ${px} px` })) },
      { id: 'center', label: 'Miolo', value: 'total', options: CENTERS.map(([value, label]) => ({ value, label })) },
      { id: 'texture', label: 'Textura', value: 'off', options: [{ value: 'off', label: 'Desligada' }, { value: 'on', label: 'Ligada' }] },
    ],
    render: () => '<div class="gr-play" data-chart></div>',
    mount: (preview, state) => {
      const chart = donutChart(preview.querySelector('[data-chart]'), playOptions(state));
      return () => chart.destroy();
    },
    code: playCode,
  });

  for (const v of VARIANTS) charts.push(donutChart(root.querySelector(`[data-variant="${v.id}"]`), { size: 176, ...v.options }));

  const layoutOptions = { title: 'Pagamentos por método', items: payments.slice(0, 5), format: 'integer', centerLabel: 'transações', size: 176 };
  charts.push(donutChart(root.querySelector('[data-layout-chart="side"]'), layoutOptions));
  charts.push(donutChart(root.querySelector('[data-layout-chart="stack"]'), layoutOptions));

  // Rosca × barras com valores próximos
  charts.push(donutChart(root.querySelector('[data-compare="donut"]'), { label: 'Clientes por região', items: REGIONS, format: 'integer', centerLabel: 'clientes', size: 160, table: false }));
  charts.push(
    barChart(root.querySelector('[data-compare="bars"]'), {
      label: 'Clientes por região',
      categories: REGIONS.map((r) => r.name),
      series: [{ name: 'Clientes', values: REGIONS.map((r) => r.value) }],
      orientation: 'horizontal',
      format: 'integer',
      table: false,
    }),
  );

  // Estados
  const stateEl = (id) => root.querySelector(`[data-state-chart="${id}"]`);
  const hover = donutChart(stateEl('hover'), { title: 'Pagamentos por método', items: payments.slice(0, 4), format: 'integer', centerLabel: 'transações', size: 160 });
  const loading = donutChart(stateEl('carregando'), { title: 'Pagamentos por método', items: payments.slice(0, 4), format: 'integer', centerLabel: 'transações', size: 160 });
  const empty = donutChart(stateEl('vazio'), { title: 'Pagamentos por método', items: [], size: 160, height: 220, empty: 'Nenhum pagamento neste período.' });
  charts.push(hover, loading, empty);

  const timers = [];
  timers.push(
    setTimeout(() => {
      const item = hover.el.querySelectorAll('.ds-donut__item')[1];
      if (!item) return;
      const r = item.getBoundingClientRect();
      item.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 12, clientY: r.top + r.height / 2, bubbles: true }));
    }, 60),
  );
  loading.setLoading(true);

  let flip = false;
  const reloadBtn = root.querySelector('[data-reload]');
  const onReload = () => {
    loading.setLoading(true);
    reloadBtn.disabled = true;
    timers.push(
      setTimeout(() => {
        flip = !flip;
        loading.update({ items: payments.slice(flip ? 1 : 0, flip ? 5 : 4) });
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
