import { icon } from '../../ds/icons/icons.js';
import { heatmap, calendarHeatmap } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { WEEKDAYS, HOURS, ordersByHour, yearActivity, YEAR_START } from '../chart-data.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-heatmap.css'];

/* ───────── Dados ───────── */

const total = ordersByHour.flat().reduce((a, v) => a + v, 0);
const mean = Math.round(total / ordersByHour.flat().length);
const avgByHour = HOURS.map((_, h) => ordersByHour.reduce((a, row) => a + row[h], 0) / ordersByHour.length);
/** Diferença de cada dia para a média da semana naquela hora (null nas horas sem pedidos). */
const variation = ordersByHour.map((row) => row.map((v, h) => (avgByHour[h] >= 1 ? Math.round(v - avgByHour[h]) : null)));

const SIGNED = { signDisplay: 'exceptZero', maximumFractionDigits: 0 };
const SIGNED_CODE = "{ signDisplay: 'exceptZero', maximumFractionDigits: 0 }";

/* ───────── Playground ───────── */

function playgroundOptions(state) {
  const steps = +state.steps;
  if (state.data === 'variation') {
    return {
      title: 'Pedidos contra a média da hora',
      subtitle: 'Diferença de cada dia para a média da semana naquela hora',
      rows: WEEKDAYS,
      columns: HOURS,
      values: variation,
      scale: state.scale,
      steps,
      valueLabel: 'pedidos',
      format: SIGNED,
    };
  }
  return {
    title: 'Pedidos por hora',
    subtitle: state.scale === 'diverging' ? `Acima e abaixo da média de ${mean} pedidos` : 'Última semana',
    rows: WEEKDAYS,
    columns: HOURS,
    values: ordersByHour,
    scale: state.scale,
    steps,
    ...(state.scale === 'diverging' ? { center: mean } : {}),
    valueLabel: 'pedidos',
    format: 'integer',
  };
}

function playgroundCode(state) {
  const o = playgroundOptions(state);
  const lines = [
    `  title: '${o.title}',`,
    `  subtitle: '${o.subtitle}',`,
    `  rows: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],`,
    `  columns: ['0h', '1h', '2h', /* … */ '23h'],`,
    `  values: ${state.data === 'variation' ? 'variacao' : 'pedidos'}, // 7 linhas × 24 colunas; null = sem dado`,
    o.scale === 'diverging' && `  scale: 'diverging',`,
    o.center != null && `  center: ${o.center}, // o meio neutro: a média`,
    o.steps !== 5 && `  steps: ${o.steps},`,
    o.valueLabel && `  valueLabel: '${o.valueLabel}',`,
    `  format: ${typeof o.format === 'string' ? `'${o.format}'` : SIGNED_CODE},`,
  ].filter(Boolean);
  return `import { heatmap } from './ds/js/charts.js';

const chart = heatmap(document.querySelector('#pedidos'), {
${lines.join('\n')}
});`;
}

/* ───────── Escalas ───────── */

const SEQ = [1, 2, 3, 4, 5, 6, 7];
const FIVE = [1, 2, 4, 6, 7];

function scalePanel(theme) {
  const swatch = (token, label, used = true) =>
    `<span class="gh-step${used ? '' : ' gh-step--off'}"><span class="gh-step__chip" style="background:var(--ds-color-chart-${token})"></span><span class="gh-step__label">${label}</span></span>`;
  return `<div class="gh-scales__panel" data-theme="${theme}">
    <p class="gh-scales__theme">${icon(theme === 'dark' ? 'moon' : 'sun', { size: 16 })}${theme === 'dark' ? 'Escuro' : 'Claro'}</p>
    <div class="gh-scales__row">
      <p class="gh-scales__name">Sequencial · 7 faixas</p>
      <div class="gh-steps">${swatch('grid', 'vazio')}${SEQ.map((n) => swatch(`seq-${n}`, n)).join('')}</div>
    </div>
    <div class="gh-scales__row">
      <p class="gh-scales__name">Sequencial · 5 faixas</p>
      <div class="gh-steps">${swatch('grid', 'vazio')}${SEQ.map((n) => swatch(`seq-${n}`, n, FIVE.includes(n))).join('')}</div>
    </div>
    <div class="gh-scales__row">
      <p class="gh-scales__name">Divergente · 7 faixas</p>
      <div class="gh-steps gh-steps--7">${SEQ.map((n) => swatch(`div-${n}`, n === 4 ? 'meio' : n < 4 ? `−${4 - n}` : `+${n - 4}`)).join('')}</div>
    </div>
    <div class="gh-scales__legend" aria-hidden="true">
      <div class="ds-chart__scale"><span>Menos</span><span class="ds-chart__scale-bins"><span class="ds-chart__scale-bin" style="--c:var(--ds-color-chart-grid)"></span>${FIVE.map((n) => `<span class="ds-chart__scale-bin" style="--c:var(--ds-color-chart-seq-${n})"></span>`).join('')}</span><span>Mais</span></div>
      <div class="ds-chart__scale"><span>−8</span><span class="ds-chart__scale-bins">${SEQ.map((n) => `<span class="ds-chart__scale-bin" style="--c:var(--ds-color-chart-div-${n})"></span>`).join('')}</span><span>+8</span></div>
    </div>
  </div>`;
}

/* ───────── API ───────── */

const API = [
  ['rows · columns', 'string[]', '—', 'Rótulos das linhas (à esquerda) e das colunas (embaixo).'],
  ['values', '(number | null)[][]', '—', '<code class="ds-inline-code">values[linha][coluna]</code>. <code class="ds-inline-code">null</code> vira célula vazia, com “Sem dado” no tooltip.'],
  ['scale', "'sequential' | 'diverging'", "'sequential'", 'Um tom do pouco ao muito, ou dois tons com o meio neutro.'],
  ['steps', '3 – 7', '5', 'Quantas faixas de cor. Mais de 7 deixa vizinhas indistinguíveis.'],
  ['domain', '[min, max]', 'dos dados', 'Fixe para comparar mapas diferentes na mesma escala.'],
  ['center', 'number', '0', 'O valor do meio neutro na escala divergente (ex.: a média).'],
  ['zeroEmpty', 'boolean', 'true', 'Zero aparece como célula vazia na sequencial.'],
  ['format · valueLabel', 'preset | Intl | função · string', "'number' · —", 'Valor no tooltip, na tabela e na legenda; unidade depois do número.'],
  ['cellHeight', 'number', 'quadrada', 'Altura da célula; por padrão acompanha a largura, entre 14 e 32 px.'],
  ['scaleLegend · scaleLabels', 'boolean · [string, string]', 'true · mín./máx.', 'Legenda de escala embaixo, com os extremos ou “Menos/Mais”.'],
  ['title · subtitle · label · card · table', '—', '—', 'Iguais aos de todos os gráficos.'],
];

const API_CAL = [
  ['start', "'AAAA-MM-DD' | Date", 'hoje', 'Primeiro dia. As colunas são semanas, de domingo a sábado.'],
  ['values', '(number | null)[]', '—', 'Um valor por dia, a partir de start.'],
  ['steps · format · valueLabel', '—', "5 · 'integer' · —", 'Como no heatmap; a escala é sempre sequencial.'],
  ['scaleLabels', '[string, string]', "['Menos', 'Mais']", 'Extremos da legenda de escala.'],
];

function apiTable(rows, first = 'Opção') {
  return `<div class="doc-table gh-api">
    <div class="doc-table__head" aria-hidden="true"><span>${first}</span><span>Tipo</span><span>Padrão</span><span>Para quê</span></div>
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
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Heatmap</h1>
        <p class="doc-header__lead">Intensidade numa grade — dia × hora, ou dia a dia no ano. Um tom só que fica mais forte com o valor; dois tons com o meio neutro quando a pergunta é acima ou abaixo de uma referência.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">formatos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">escalas</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">faixas</dt><dd class="doc-stat__value">até 7</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">respiro</dt><dd class="doc-stat__value">2 px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['variantes', 'Variantes'],
        ['escalas', 'Escala e faixas'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', 'Troque a escala, as faixas e os dados. Passe o mouse nas células ou foque o mapa e use as setas.', playgroundMarkup('heatmap', { wide: true }))}

    ${section(
      'variantes',
      'Variantes',
      'Matriz para padrões que se repetem (dia da semana × hora); calendário para o ano inteiro de uma vez.',
      `<div class="gh-grid">
        <article class="gh-card">
          <div class="gh-card__chart" data-variant="matriz"></div>
          <div class="gh-card__body">
            <p class="cd-example__name">Matriz<code>heatmap()</code></p>
            <p class="cd-example__text">Linhas e colunas com significado. O pico do meio-dia e o vale da madrugada saltam à vista — sem ler um número.</p>
          </div>
        </article>
        <article class="gh-card">
          <div class="gh-card__chart" data-variant="divergente"></div>
          <div class="gh-card__body">
            <p class="cd-example__name">Divergente<code>scale: 'diverging'</code></p>
            <p class="cd-example__text">Frio abaixo da média, quente acima, cinza no meio. O meio precisa ler como “nada”.</p>
          </div>
        </article>
        <article class="gh-card gh-card--wide">
          <div class="gh-card__chart" data-variant="calendario"></div>
          <div class="gh-card__body">
            <p class="cd-example__name">Calendário<code>calendarHeatmap()</code></p>
            <p class="cd-example__text">Um quadrado por dia, uma coluna por semana. Abre na semana mais recente; em telas estreitas, role para o passado. A tabela resume por mês.</p>
          </div>
        </article>
      </div>`,
    )}

    ${section(
      'escalas',
      'Escala e faixas',
      'O valor vira uma faixa de cor, não um tom contínuo — faixas o olho consegue comparar. No escuro, a âncora inverte: mais é mais claro.',
      `<div class="gh-scales">${scalePanel('dark')}${scalePanel('light')}</div>
      <ul class="gh-notes" role="list">
        <li>${icon('layers', { size: 18 })}<div><p class="gh-notes__title">Faixas iguais</p><p class="gh-notes__text">O intervalo entre o mínimo e o máximo é dividido em partes iguais. Com 5 faixas, usamos os passos 1, 2, 4, 6 e 7, para cobrir toda a rampa.</p></div></li>
        <li>${icon('minus', { size: 18 })}<div><p class="gh-notes__title">Vazio não é zero</p><p class="gh-notes__text">Célula sem dado (e o zero, na sequencial) usa a cor da grade — fica claro que ali não há nada, e não “pouco”.</p></div></li>
        <li>${icon('target', { size: 18 })}<div><p class="gh-notes__title">O meio é uma decisão</p><p class="gh-notes__text">Na divergente, <code class="ds-inline-code">center</code> define o que é neutro: zero numa variação, a média numa contagem, a meta num resultado.</p></div></li>
      </ul>`,
    )}

    ${section(
      'acessibilidade',
      'Acessibilidade',
      'Cor sozinha não carrega número. Por isso o mapa sempre tem outro caminho até o valor.',
      a11yList([
        ['Tabela sempre à mão', 'O botão de tabela troca o mapa pelos números: linhas × colunas na matriz e um resumo por mês no calendário — 365 linhas não ajudam ninguém.'],
        ['Teclado em duas direções', 'Tab foca o mapa; as setas andam entre as células, Home e End vão ao começo e ao fim da linha, Esc fecha o tooltip. No calendário, ← e → pulam semanas e ↑ e ↓ andam dias.', ['←', '↑', '↓', '→', 'Home', 'End']],
        ['Leitor de tela', 'O mapa é anunciado com o tamanho da grade; cada célula visitada pelo teclado é lida com linha, coluna e valor.'],
        ['Contorno no hover', 'A célula ativa ganha um anel de 1,5 px na cor do texto, visível sobre qualquer faixa, nos dois temas.'],
        ['Faixas contáveis', 'No máximo 7 cores com significado. Acima disso, vizinhas se confundem — use uma tabela.'],
        ['Ponta clara permitida', 'Na sequencial, o passo mais fraco pode quase sumir na superfície: ele quer dizer “perto de zero”. O valor exato continua no tooltip e na tabela.'],
      ]),
    )}

    ${section(
      'tokens',
      'Tokens usados',
      'Duas rampas e a cor da grade. Nenhuma cor de série categórica entra aqui.',
      tokenTable([
        ['color.chart.seq.1', 'Sequencial: o mínimo'],
        ['color.chart.seq.4', 'Sequencial: o meio'],
        ['color.chart.seq.7', 'Sequencial: o máximo'],
        ['color.chart.div.1', 'Divergente: extremo abaixo (frio)'],
        ['color.chart.div.4', 'Divergente: meio neutro'],
        ['color.chart.div.7', 'Divergente: extremo acima (quente)'],
        ['color.chart.grid', 'Célula vazia'],
        ['color.fg.default', 'Anel da célula ativa'],
        ['color.fg.subtle', 'Rótulos e legenda de escala'],
        ['color.bg.raised', 'Fundo do tooltip'],
      ]),
    )}

    ${section(
      'uso',
      'Uso',
      'O heatmap mostra padrão, não valor exato. Use quando a pergunta é “onde concentra?”.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: um tom só</p>
          <p class="usage-card__text">Magnitude é uma rampa de um tom, do claro ao forte. O olho lê “mais” sem precisar de legenda.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: arco-íris</p>
          <p class="usage-card__text">Vermelho, amarelo, verde e azul não têm ordem. Ninguém sabe se o verde é mais ou menos que o amarelo.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Divergente com meio neutro</p>
          <p class="usage-card__text">Dois tons opostos — frio e quente — e cinza no meio. Dois tons frios não leem como “lados”.</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: até 7 faixas</p>
          <p class="usage-card__text">Cinco resolvem quase sempre. Sete é o teto: acima disso, faixas vizinhas se misturam.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: valor exato pela cor</p>
          <p class="usage-card__text">Se a pessoa precisa do número para decidir, mostre o número — numa tabela ou em barras.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Mesma escala para comparar</p>
          <p class="usage-card__text">Dois mapas lado a lado? Fixe o mesmo <code class="ds-inline-code">domain</code> nos dois, ou a mesma cor vai significar valores diferentes.</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      'Duas funções com as mesmas regras de todos os gráficos do Órbita: update, setLoading e destroy.',
      `${codeBlock(`import { heatmap, calendarHeatmap } from './ds/js/charts.js';

heatmap(document.querySelector('#pedidos'), {
  title: 'Pedidos por hora',
  rows: ['Seg', 'Ter', 'Qua'],
  columns: ['8h', '9h', '10h'],
  values: [[12, 30, 41], [9, 28, 44], [14, 26, 39]],
  valueLabel: 'pedidos',
});

calendarHeatmap(document.querySelector('#atividade'), {
  title: 'Atividade no ano',
  start: '2025-11-02',
  values: atividadePorDia, // um número por dia
  valueLabel: 'entregas',
});`)}
      <h3 class="doc-subhead">heatmap()</h3>
      ${apiTable(API)}
      <h3 class="doc-subhead">calendarHeatmap()</h3>
      ${apiTable(API_CAL)}`,
    )}
  </div>`;
}

export function mount(root) {
  const charts = [];

  const unmountPlayground = mountPlayground(root, {
    id: 'heatmap',
    controls: [
      { id: 'scale', label: 'Escala', value: 'sequential', options: [{ value: 'sequential', label: 'Sequencial' }, { value: 'diverging', label: 'Divergente' }] },
      { id: 'steps', label: 'Faixas', value: '5', options: [{ value: '5', label: '5' }, { value: '7', label: '7' }] },
      { id: 'data', label: 'Dados', value: 'orders', options: [{ value: 'orders', label: 'Pedidos por hora' }, { value: 'variation', label: 'Diferença da média' }] },
    ],
    render: () => '<div data-playground-chart></div>',
    mount(preview, state) {
      const chart = heatmap(preview.querySelector('[data-playground-chart]'), playgroundOptions(state));
      return () => chart.destroy();
    },
    code: playgroundCode,
  });

  const at = (id) => root.querySelector(`[data-variant="${id}"]`);
  charts.push(
    heatmap(at('matriz'), { title: 'Pedidos por hora', subtitle: 'Última semana', rows: WEEKDAYS, columns: HOURS, values: ordersByHour, valueLabel: 'pedidos', format: 'integer' }),
    heatmap(at('divergente'), { title: 'Contra a média da hora', subtitle: 'O fim de semana fica acima da média a partir das 10h', rows: WEEKDAYS, columns: HOURS, values: variation, scale: 'diverging', steps: 7, valueLabel: 'pedidos', format: SIGNED }),
    calendarHeatmap(at('calendario'), { title: 'Entregas no ano', subtitle: 'Um quadrado por dia · novembro de 2025 a outubro de 2026', start: YEAR_START, values: yearActivity, valueLabel: 'entregas' }),
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
