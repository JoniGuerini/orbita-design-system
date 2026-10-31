import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/tabela.css'];

/* ───────── Dados ───────── */

const ROWS = [
  { name: 'Botão', status: 'ready', owner: 'Ana Ribeiro', updated: '2026-10-31', screens: 248 },
  { name: 'Tooltip', status: 'ready', owner: 'Davi Lima', updated: '2026-10-22', screens: 201 },
  { name: 'Campo de texto', status: 'review', owner: 'Davi Lima', updated: '2026-10-27', screens: 164 },
  { name: 'Chip', status: 'ready', owner: 'Caio Mendes', updated: '2026-10-30', screens: 132 },
  { name: 'Menu', status: 'review', owner: 'Bia Santos', updated: '2026-10-28', screens: 87 },
  { name: 'Abas', status: 'ready', owner: 'Bia Santos', updated: '2026-10-25', screens: 56 },
  { name: 'Tabela', status: 'progress', owner: 'Caio Mendes', updated: '2026-10-31', screens: 12 },
  { name: 'Modal', status: 'planned', owner: 'Ana Ribeiro', updated: '2026-10-20', screens: 0 },
];

const STATUS = {
  ready: ['success', 'Pronto', 0],
  review: ['warning', 'Em revisão', 1],
  progress: ['brand', 'Em andamento', 2],
  planned: ['neutral', 'Planejado', 3],
};

const COLUMNS = [
  { key: 'name', label: 'Componente', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'owner', label: 'Responsável' },
  { key: 'updated', label: 'Atualizado', sortable: true },
  { key: 'screens', label: 'Telas', sortable: true, num: true },
];

const CAPTION = ['Componentes', 'Uso nas telas do produto'];

const fmtDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
const fmtNum = (n) => n.toLocaleString('pt-BR');
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function compare(key) {
  if (key === 'status') return (a, b) => STATUS[a.status][2] - STATUS[b.status][2];
  if (key === 'screens') return (a, b) => a.screens - b.screens;
  return (a, b) => String(a[key]).localeCompare(String(b[key]), 'pt-BR');
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const sorted = [...rows].sort(compare(sort.key));
  return sort.dir === 'descending' ? sorted.reverse() : sorted;
}

/* ───────── Montagem da tabela ───────── */

function cell(row, col) {
  if (col.key === 'name') return `<td class="ds-table__strong">${escape(row.name)}</td>`;
  if (col.key === 'status') {
    const [tone, label] = STATUS[row.status];
    return `<td><span class="ds-badge ds-badge--sm${tone === 'neutral' ? '' : ` ds-badge--${tone}`}">${label}</span></td>`;
  }
  if (col.key === 'updated') return `<td class="ds-table__muted">${fmtDate(row.updated)}</td>`;
  if (col.key === 'screens') return `<td class="ds-table__num">${fmtNum(row.screens)}</td>`;
  return `<td>${escape(row[col.key])}</td>`;
}

function sortIcon(dir) {
  if (dir === 'ascending') return icon('chevron-up', { size: 14 });
  if (dir === 'descending') return icon('chevron-down', { size: 14 });
  return icon('chevrons-up-down', { size: 14 });
}

/**
 * opts: columns, rows, density ('comfortable'|'compact'), hover, select, sticky, caption,
 *       sortable, sort { key, dir }, selected (Set de nomes), state ('rows'|'empty'|'loading'), pins
 */
function table(opts) {
  const {
    columns = COLUMNS,
    rows = ROWS,
    density = 'comfortable',
    hover = 'yes',
    select = 'no',
    sticky = 'no',
    caption = 'yes',
    sortable = false,
    sort = null,
    selected = new Set(),
    state = 'rows',
    maxHeight = 280,
    minWidth = true,
  } = opts;
  const cls = ['ds-table', density === 'compact' && 'ds-table--compact', hover === 'yes' && 'ds-table--hover', minWidth && 'tl-wide'].filter(Boolean).join(' ');
  const scroll = sticky === 'yes';
  const allSelected = select === 'yes' && rows.length > 0 && rows.every((r) => selected.has(r.name));

  const head = `<tr>
    ${select === 'yes' ? `<th scope="col" class="ds-table__check"><input type="checkbox" data-select-all aria-label="Selecionar todos"${allSelected ? ' checked' : ''}></th>` : ''}
    ${columns
      .map((col) => {
        const dir = sort?.key === col.key ? sort.dir : null;
        const label = sortable && col.sortable ? `<button type="button" class="ds-table__sort" data-sort="${col.key}">${col.label}${sortIcon(dir)}</button>` : col.label;
        return `<th scope="col"${col.num ? ' class="ds-table__num"' : ''}${dir ? ` aria-sort="${dir}"` : ''}>${label}</th>`;
      })
      .join('')}
  </tr>`;

  const span = columns.length + (select === 'yes' ? 1 : 0);
  let body;
  if (state === 'empty') {
    body = `<tr class="ds-table__empty"><td colspan="${span}">
      <span class="ds-table__empty-inner">
        ${icon('inbox', { size: 24 })}
        <span class="ds-table__empty-title">Nenhum componente com esse filtro</span>
        <span>Tente outro status ou limpe a busca.</span>
        <span class="ds-btn ds-btn--secondary ds-btn--sm tl-empty-action">Limpar filtros</span>
      </span>
    </td></tr>`;
  } else if (state === 'loading') {
    const widths = ['70%', '48%', '60%', '40%', '30%'];
    body = [0, 1, 2]
      .map(
        (r) => `<tr>${select === 'yes' ? '<td class="ds-table__check"></td>' : ''}${columns
          .map((col, c) => `<td${col.num ? ' class="ds-table__num"' : ''}><span class="ds-table__skeleton" style="--w:${widths[(c + r) % widths.length]}"></span></td>`)
          .join('')}</tr>`,
      )
      .join('');
  } else {
    body = sortRows(rows, sort)
      .map((row) => {
        const on = selected.has(row.name);
        return `<tr${on ? ' data-selected' : ''}>
          ${select === 'yes' ? `<td class="ds-table__check"><input type="checkbox" data-select-row="${escape(row.name)}" aria-label="Selecionar ${escape(row.name)}"${on ? ' checked' : ''}></td>` : ''}
          ${columns.map((col) => cell(row, col)).join('')}
        </tr>`;
      })
      .join('');
  }

  const region = scroll ? ` role="region" aria-label="${CAPTION[0]}" tabindex="0" style="--ds-table-max-height:${maxHeight}px"` : '';
  return `<div class="ds-table-wrap${scroll ? ' ds-table-wrap--scroll' : ''}"${region}>
    <table class="${cls}">
      ${caption === 'yes' ? `<caption>${CAPTION[0]} <span class="ds-table__caption-desc">${CAPTION[1]}</span></caption>` : ''}
      <thead>${head}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

function tableCode(state) {
  const cls = ['ds-table', state.density === 'compact' && 'ds-table--compact', state.hover === 'yes' && 'ds-table--hover'].filter(Boolean).join(' ');
  const scroll = state.sticky === 'yes';
  const check = state.select === 'yes';
  const L = [];
  L.push(scroll ? `<div class="ds-table-wrap ds-table-wrap--scroll" role="region" aria-label="Componentes" tabindex="0">` : '<div class="ds-table-wrap">');
  L.push(`  <table class="${cls}">`);
  if (state.caption === 'yes') L.push('    <caption>Componentes <span class="ds-table__caption-desc">Uso nas telas do produto</span></caption>');
  L.push('    <thead>', '      <tr>');
  if (check) L.push('        <th scope="col" class="ds-table__check"><input type="checkbox" aria-label="Selecionar todos"></th>');
  L.push('        <th scope="col">Componente</th>', '        <th scope="col">Status</th>', '        <th scope="col" class="ds-table__num">Telas</th>', '      </tr>', '    </thead>', '    <tbody>');
  for (const row of ROWS.slice(0, 2)) {
    const [tone, label] = STATUS[row.status];
    L.push('      <tr>');
    if (check) L.push(`        <td class="ds-table__check"><input type="checkbox" aria-label="Selecionar ${row.name}"></td>`);
    L.push(`        <td class="ds-table__strong">${row.name}</td>`);
    L.push(`        <td><span class="ds-badge ds-badge--sm ds-badge--${tone}">${label}</span></td>`);
    L.push(`        <td class="ds-table__num">${fmtNum(row.screens)}</td>`);
    L.push('      </tr>');
  }
  L.push('      …', '    </tbody>', '  </table>', '</div>');
  return L.join('\n');
}

/* ───────── Página ───────── */

const SHORT_COLS = [COLUMNS[0], COLUMNS[1], COLUMNS[4]];

export default function renderTabela(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Tabela</h1>
        <p class="doc-header__lead">Para comparar dados em linhas e colunas. Números alinhados, cabeçalho que ordena e seleção que não depende só da cor.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">densidades</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estados</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">altura da linha</dt><dd class="doc-stat__value">52 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">elemento</dt><dd class="doc-stat__value">&lt;table&gt;</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['interacao', 'Ordenar e selecionar'],
        ['anatomia', 'Anatomia'],
        ['densidade', 'Densidade'],
        ['estados', 'Estados'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="playground-title">Playground</h2>
          <p class="doc-section__desc">Combine densidade, seleção, cabeçalho fixo e legenda. O código mostra duas linhas de exemplo.</p>
        </div>
      </header>
      ${playgroundMarkup('tabela')}
    </section>

    <section class="doc-section" id="interacao" aria-labelledby="interacao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="interacao-title">Ordenar e selecionar</h2>
          <p class="doc-section__desc">Clique num cabeçalho para ordenar (de novo inverte). Marque linhas para agir em lote — a contagem aparece em cima.</p>
        </div>
      </header>
      <div class="tl-demo">
        <div class="tl-demo__bar">
          <p class="tl-demo__count" data-count>Nenhum selecionado</p>
          <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-clear hidden>${icon('x', { size: 16 })}Limpar seleção</button>
        </div>
        <div data-demo-table></div>
        <p class="ds-visually-hidden" aria-live="polite" data-live></p>
      </div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">Anatomia</h2>
          <p class="doc-section__desc">Uma tabela nativa com cinco peças. Nada de grid de divs: a semântica vem pronta.</p>
        </div>
      </header>
      <div class="tl-anatomy">
        <div class="tl-anatomy__stage" aria-hidden="true" inert>
          <div class="ds-table-wrap">
            <table class="ds-table">
              <caption>Componentes <span class="tl-pin">1</span></caption>
              <thead><tr>
                <th class="ds-table__check"><input type="checkbox" tabindex="-1"><span class="tl-pin tl-pin--check">5</span></th>
                <th aria-sort="descending"><span class="ds-table__sort">Componente${icon('chevron-down', { size: 14 })}</span><span class="tl-pin">2</span></th>
                <th class="ds-table__num">Telas</th>
              </tr></thead>
              <tbody>
                <tr data-selected><td class="ds-table__check"><input type="checkbox" checked tabindex="-1"></td><td class="ds-table__strong">Botão <span class="tl-pin">3</span></td><td class="ds-table__num">248 <span class="tl-pin">4</span></td></tr>
                <tr><td class="ds-table__check"><input type="checkbox" tabindex="-1"></td><td class="ds-table__strong">Chip</td><td class="ds-table__num">132</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <ol class="tl-anatomy__legend" role="list">
          <li><span class="tl-anatomy__num">1</span><div><p class="tl-anatomy__title">Legenda</p><p class="tl-anatomy__text"><code class="ds-inline-code">&lt;caption&gt;</code> nomeia a tabela para leitores de tela. Pode ter uma descrição curta.</p></div></li>
          <li><span class="tl-anatomy__num">2</span><div><p class="tl-anatomy__title">Cabeçalho</p><p class="tl-anatomy__text"><code class="ds-inline-code">&lt;th scope="col"&gt;</code> em <code class="ds-inline-code">label-sm</code>, apagado. Ordenável com um botão dentro e <code class="ds-inline-code">aria-sort</code>.</p></div></li>
          <li><span class="tl-anatomy__num">3</span><div><p class="tl-anatomy__title">Linha</p><p class="tl-anatomy__text">52 px (40 px na compacta), divisor fino. Hover opcional; selecionada ganha <code class="ds-inline-code">bg.selected</code>.</p></div></li>
          <li><span class="tl-anatomy__num">4</span><div><p class="tl-anatomy__title">Célula numérica</p><p class="tl-anatomy__text"><code class="ds-inline-code">ds-table__num</code>: à direita e com algarismos tabulares, para as casas se alinharem.</p></div></li>
          <li><span class="tl-anatomy__num">5</span><div><p class="tl-anatomy__title">Seleção <span class="tl-anatomy__optional">opcional</span></p><p class="tl-anatomy__text">Checkbox nativo com rótulo por linha e “selecionar todos” no cabeçalho.</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="densidade" aria-labelledby="densidade-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="densidade-title">Densidade</h2>
          <p class="doc-section__desc">Confortável é o padrão. Compacta para telas de operação, com muitas linhas para varrer.</p>
        </div>
      </header>
      <div class="tl-pair">
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: SHORT_COLS, rows: ROWS.slice(0, 3), caption: 'no', hover: 'no', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">Confortável<code>padrão · 52 px</code></p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: SHORT_COLS, rows: ROWS.slice(0, 3), caption: 'no', hover: 'no', density: 'compact', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">Compacta<code>ds-table--compact · 40 px</code></p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estados-title">Estados</h2>
          <p class="doc-section__desc">Uma tabela sem dados ainda é uma tabela: mantenha o cabeçalho e diga o que fazer. Carregando, mostre a forma das linhas — sem brilho.</p>
        </div>
      </header>
      <div class="tl-pair">
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: SHORT_COLS, caption: 'no', state: 'empty', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">Vazio<code>ds-table__empty</code></p><p class="cd-example__text">Ícone, frase curta e uma saída.</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: SHORT_COLS, caption: 'no', state: 'loading', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">Carregando<code>ds-table__skeleton</code></p><p class="cd-example__text">Barras planas que pulsam devagar; param com movimento reduzido.</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">Use a tabela nativa e quase tudo vem de graça.</p>
        </div>
      </header>
      ${a11yList([
        ['Tabela de verdade', '<code class="ds-inline-code">&lt;table&gt;</code>, <code class="ds-inline-code">&lt;caption&gt;</code> e <code class="ds-inline-code">&lt;th scope="col"&gt;</code>: o leitor de tela anuncia a coluna de cada célula.'],
        ['Ordenação anunciada', 'O cabeçalho ordenável é um botão; o <code class="ds-inline-code">th</code> recebe <code class="ds-inline-code">aria-sort</code> e uma região viva confirma a mudança.'],
        ['Seleção pelo checkbox', 'Cada linha tem um checkbox com nome (“Selecionar Botão”). O “selecionar todos” mostra o estado misto quando só parte está marcada.'],
        ['Rolagem pelo teclado', 'Com cabeçalho fixo, o contêiner vira <code class="ds-inline-code">role="region"</code> com nome e <code class="ds-inline-code">tabindex="0"</code> para rolar com as setas.', ['Tab', '↑', '↓']],
        ['Cor nunca sozinha', 'Status vai em texto no badge; a linha selecionada também fica com o checkbox marcado.'],
        ['Não use para layout', 'Tabela é para dados tabulares. Para alinhar elementos da interface, use grid.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Tudo o que a tabela consome.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.surface', 'Fundo e cabeçalho fixo'],
        ['color.border.subtle', 'Contorno e divisores'],
        ['color.fg.subtle', 'Cabeçalho e texto apagado'],
        ['color.fg.default', 'Células'],
        ['color.bg.hover', 'Hover da linha'],
        ['color.bg.selected', 'Linha selecionada'],
        ['color.fg.brand', 'Ícone da coluna ordenada'],
        ['color.brand.solid', 'Checkbox marcado'],
        ['color.bg.muted', 'Barras de carregamento'],
        ['text.body-sm', 'Células'],
        ['text.label-sm', 'Cabeçalho'],
        ['radius.xl', 'Contêiner'],
        ['space.200', 'Respiro lateral das células'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três regras para tabelas fáceis de ler.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: números à direita</p>
          <div class="tl-usage__preview" inert>
            <span class="tl-usage__num tl-usage__num--good"><span>1.248</span><span>87</span><span>12</span></span>
          </div>
          <p class="usage-card__text">Alinhados à direita e com algarismos tabulares, os valores se comparam de relance.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: tabela para pouca coisa</p>
          <div class="tl-usage__preview" inert>
            <span class="tl-usage__num"><span>Nome · Ana</span><span>Cargo · Design</span></span>
          </div>
          <p class="usage-card__text">Duas colunas de “rótulo e valor” ficam melhores numa lista de detalhes.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Poucas colunas</p>
          <p class="usage-card__text">Mostre só o que ajuda a decidir. O resto vai para o detalhe da linha.</p>
          <pre class="ds-code ds-code--sm"><code>&lt;td class="ds-table__num"&gt;248&lt;/td&gt;
<span class="ds-code__comment">&lt;!-- direita + tabular-nums --&gt;</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'tabela',
    controls: [
      { id: 'density', label: 'Densidade', value: 'comfortable', options: [{ value: 'comfortable', label: 'Confortável' }, { value: 'compact', label: 'Compacta' }] },
      { id: 'select', label: 'Seleção', value: 'no', options: [{ value: 'no', label: 'Sem' }, { value: 'yes', label: 'Com' }] },
      { id: 'hover', label: 'Hover', value: 'yes', options: [{ value: 'yes', label: 'Com' }, { value: 'no', label: 'Sem' }] },
      { id: 'sticky', label: 'Cabeçalho fixo', value: 'no', options: [{ value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim' }] },
      { id: 'caption', label: 'Legenda', value: 'yes', options: [{ value: 'yes', label: 'Com' }, { value: 'no', label: 'Sem' }] },
    ],
    render: (state) => `<div class="tl-stage">${table({ ...state, selected: state.select === 'yes' ? new Set(['Chip']) : new Set(), maxHeight: 240 })}</div>`,
    code: tableCode,
  });

  // demo interativa: ordenação + seleção
  const host = root.querySelector('[data-demo-table]');
  const countEl = root.querySelector('[data-count]');
  const clearBtn = root.querySelector('[data-clear]');
  const live = root.querySelector('[data-live]');
  const demo = { sort: { key: 'screens', dir: 'descending' }, selected: new Set() };

  const render = (focus) => {
    host.innerHTML = table({ select: 'yes', sticky: 'yes', sortable: true, sort: demo.sort, selected: demo.selected, maxHeight: 360 });
    const all = host.querySelector('[data-select-all]');
    const n = demo.selected.size;
    all.indeterminate = n > 0 && n < ROWS.length;
    countEl.textContent = n === 0 ? 'Nenhum selecionado' : n === 1 ? '1 selecionado' : `${n} selecionados`;
    clearBtn.hidden = n === 0;
    if (focus) host.querySelector(focus)?.focus();
  };

  const onClick = (event) => {
    const sortBtn = event.target.closest('[data-sort]');
    if (sortBtn && host.contains(sortBtn)) {
      const key = sortBtn.dataset.sort;
      const dir = demo.sort?.key === key && demo.sort.dir === 'ascending' ? 'descending' : 'ascending';
      demo.sort = { key, dir };
      render(`[data-sort="${key}"]`);
      const label = COLUMNS.find((c) => c.key === key).label;
      live.textContent = `Ordenado por ${label}, ${dir === 'ascending' ? 'crescente' : 'decrescente'}.`;
      return;
    }
    if (event.target.closest('[data-clear]')) {
      demo.selected.clear();
      render();
      live.textContent = 'Seleção limpa.';
    }
  };

  const onChange = (event) => {
    const input = event.target;
    if (!host.contains(input)) return;
    if (input.matches('[data-select-all]')) {
      if (input.checked) ROWS.forEach((r) => demo.selected.add(r.name));
      else demo.selected.clear();
      render('[data-select-all]');
    } else if (input.matches('[data-select-row]')) {
      const name = input.dataset.selectRow;
      if (input.checked) demo.selected.add(name);
      else demo.selected.delete(name);
      render(`[data-select-row="${CSS.escape(name)}"]`);
    }
  };

  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  render();

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    root.removeEventListener('click', onClick);
    root.removeEventListener('change', onChange);
    unmountCopy();
    unmountNav();
  };
}
