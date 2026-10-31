import { icon } from '../../ds/icons/icons.js';
import { locale, dateFormat, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/tabela.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

/* a seleção usa o id (estável entre idiomas); o nome é só o que aparece */
const ROWS = () => [
  { id: 'botao', name: L('Botão', 'Button', 'Botón'), status: 'ready', owner: 'Ana Ribeiro', updated: '2026-10-31', screens: 248 },
  { id: 'tooltip', name: 'Tooltip', status: 'ready', owner: 'Davi Lima', updated: '2026-10-22', screens: 201 },
  { id: 'campo', name: L('Campo de texto', 'Text field', 'Campo de texto'), status: 'review', owner: 'Davi Lima', updated: '2026-10-27', screens: 164 },
  { id: 'chip', name: 'Chip', status: 'ready', owner: 'Caio Mendes', updated: '2026-10-30', screens: 132 },
  { id: 'menu', name: L('Menu', 'Menu', 'Menú'), status: 'review', owner: 'Bia Santos', updated: '2026-10-28', screens: 87 },
  { id: 'abas', name: L('Abas', 'Tabs', 'Pestañas'), status: 'ready', owner: 'Bia Santos', updated: '2026-10-25', screens: 56 },
  { id: 'tabela', name: L('Tabela', 'Table', 'Tabla'), status: 'progress', owner: 'Caio Mendes', updated: '2026-10-31', screens: 12 },
  { id: 'modal', name: 'Modal', status: 'planned', owner: 'Ana Ribeiro', updated: '2026-10-20', screens: 0 },
];

const STATUS = () => ({
  ready: ['success', L('Pronto', 'Done', 'Listo'), 0],
  review: ['warning', L('Em revisão', 'In review', 'En revisión'), 1],
  progress: ['brand', L('Em andamento', 'In progress', 'En curso'), 2],
  planned: ['neutral', L('Planejado', 'Planned', 'Planificado'), 3],
});

const COLUMNS = () => [
  { key: 'name', label: L('Componente', 'Component', 'Componente'), sortable: true },
  { key: 'status', label: L('Status', 'Status', 'Estado'), sortable: true },
  { key: 'owner', label: L('Responsável', 'Owner', 'Responsable') },
  { key: 'updated', label: L('Atualizado', 'Updated', 'Actualizado'), sortable: true },
  { key: 'screens', label: L('Telas', 'Screens', 'Pantallas'), sortable: true, num: true },
];
const shortCols = () => {
  const cols = COLUMNS();
  return [cols[0], cols[1], cols[4]];
};

const CAPTION = () => [L('Componentes', 'Components', 'Componentes'), L('Uso nas telas do produto', 'Usage across product screens', 'Uso en las pantallas del producto')];

const fmtDate = (iso) => dateFormat({ day: '2-digit', month: 'short' }).format(new Date(`${iso}T12:00:00`)).replace('.', '');
const fmtNum = (n) => formatNumber(n);
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const selectAll = () => L('Selecionar todos', 'Select all', 'Seleccionar todos');
const selectRow = (name) => L(`Selecionar ${name}`, `Select ${name}`, `Seleccionar ${name}`);

function compare(key) {
  const status = STATUS();
  if (key === 'status') return (a, b) => status[a.status][2] - status[b.status][2];
  if (key === 'screens') return (a, b) => a.screens - b.screens;
  return (a, b) => String(a[key]).localeCompare(String(b[key]), locale());
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const sorted = [...rows].sort(compare(sort.key));
  return sort.dir === 'descending' ? sorted.reverse() : sorted;
}

/* ───────── Montagem da tabela ───────── */

function cell(row, col, status) {
  if (col.key === 'name') return `<td class="ds-table__strong">${escape(row.name)}</td>`;
  if (col.key === 'status') {
    const [tone, label] = status[row.status];
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
 *       sortable, sort { key, dir }, selected (Set de ids), state ('rows'|'empty'|'loading'), pins
 */
function table(opts) {
  const {
    columns = COLUMNS(),
    rows = ROWS(),
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
  const status = STATUS();
  const [captionTitle, captionDesc] = CAPTION();
  const cls = ['ds-table', density === 'compact' && 'ds-table--compact', hover === 'yes' && 'ds-table--hover', minWidth && 'tl-wide'].filter(Boolean).join(' ');
  const scroll = sticky === 'yes';
  const allSelected = select === 'yes' && rows.length > 0 && rows.every((r) => selected.has(r.id));

  const head = `<tr>
    ${select === 'yes' ? `<th scope="col" class="ds-table__check"><input type="checkbox" data-select-all aria-label="${selectAll()}"${allSelected ? ' checked' : ''}></th>` : ''}
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
        <span class="ds-table__empty-title">${L('Nenhum componente com esse filtro', 'No components match this filter', 'Ningún componente con ese filtro')}</span>
        <span>${L('Tente outro status ou limpe a busca.', 'Try another status or clear the search.', 'Prueba otro estado o limpia la búsqueda.')}</span>
        <span class="ds-btn ds-btn--secondary ds-btn--sm tl-empty-action">${L('Limpar filtros', 'Clear filters', 'Limpiar filtros')}</span>
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
        const on = selected.has(row.id);
        return `<tr${on ? ' data-selected' : ''}>
          ${select === 'yes' ? `<td class="ds-table__check"><input type="checkbox" data-select-row="${row.id}" aria-label="${escape(selectRow(row.name))}"${on ? ' checked' : ''}></td>` : ''}
          ${columns.map((col) => cell(row, col, status)).join('')}
        </tr>`;
      })
      .join('');
  }

  const region = scroll ? ` role="region" aria-label="${captionTitle}" tabindex="0" style="--ds-table-max-height:${maxHeight}px"` : '';
  return `<div class="ds-table-wrap${scroll ? ' ds-table-wrap--scroll' : ''}"${region}>
    <table class="${cls}">
      ${caption === 'yes' ? `<caption>${captionTitle} <span class="ds-table__caption-desc">${captionDesc}</span></caption>` : ''}
      <thead>${head}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

function tableCode(state) {
  const cls = ['ds-table', state.density === 'compact' && 'ds-table--compact', state.hover === 'yes' && 'ds-table--hover'].filter(Boolean).join(' ');
  const scroll = state.sticky === 'yes';
  const check = state.select === 'yes';
  const status = STATUS();
  const [captionTitle, captionDesc] = CAPTION();
  const [colName, colStatus, , , colScreens] = COLUMNS().map((c) => c.label);
  const lines = [];
  lines.push(scroll ? `<div class="ds-table-wrap ds-table-wrap--scroll" role="region" aria-label="${captionTitle}" tabindex="0">` : '<div class="ds-table-wrap">');
  lines.push(`  <table class="${cls}">`);
  if (state.caption === 'yes') lines.push(`    <caption>${captionTitle} <span class="ds-table__caption-desc">${captionDesc}</span></caption>`);
  lines.push('    <thead>', '      <tr>');
  if (check) lines.push(`        <th scope="col" class="ds-table__check"><input type="checkbox" aria-label="${selectAll()}"></th>`);
  lines.push(`        <th scope="col">${colName}</th>`, `        <th scope="col">${colStatus}</th>`, `        <th scope="col" class="ds-table__num">${colScreens}</th>`, '      </tr>', '    </thead>', '    <tbody>');
  for (const row of ROWS().slice(0, 2)) {
    const [tone, label] = status[row.status];
    lines.push('      <tr>');
    if (check) lines.push(`        <td class="ds-table__check"><input type="checkbox" aria-label="${selectRow(row.name)}"></td>`);
    lines.push(`        <td class="ds-table__strong">${row.name}</td>`);
    lines.push(`        <td><span class="ds-badge ds-badge--sm ds-badge--${tone}">${label}</span></td>`);
    lines.push(`        <td class="ds-table__num">${fmtNum(row.screens)}</td>`);
    lines.push('      </tr>');
  }
  lines.push('      …', '    </tbody>', '  </table>', '</div>');
  return lines.join('\n');
}

/* ───────── Página ───────── */

export default function renderTabela(page) {
  const rows = ROWS();
  const cols = shortCols();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Para comparar dados em linhas e colunas. Números alinhados, cabeçalho que ordena e seleção que não depende só da cor.', 'For comparing data in rows and columns. Aligned numbers, a header that sorts, and selection that doesn’t rely on color alone.', 'Para comparar datos en filas y columnas. Números alineados, encabezado que ordena y selección que no depende solo del color.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('densidades', 'densities', 'densidades')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estados', 'states', 'estados')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('altura da linha', 'row height', 'altura de fila')}</dt><dd class="doc-stat__value">52 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('elemento', 'element', 'elemento')}</dt><dd class="doc-stat__value">&lt;table&gt;</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['interacao', L('Ordenar e selecionar', 'Sort and select', 'Ordenar y seleccionar')],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['densidade', L('Densidade', 'Density', 'Densidad')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="playground-title">Playground</h2>
          <p class="doc-section__desc">${L('Combine densidade, seleção, cabeçalho fixo e legenda. O código mostra duas linhas de exemplo.', 'Combine density, selection, sticky header, and caption. The code shows two sample rows.', 'Combina densidad, selección, encabezado fijo y leyenda. El código muestra dos filas de ejemplo.')}</p>
        </div>
      </header>
      ${playgroundMarkup('tabela')}
    </section>

    <section class="doc-section" id="interacao" aria-labelledby="interacao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="interacao-title">${L('Ordenar e selecionar', 'Sort and select', 'Ordenar y seleccionar')}</h2>
          <p class="doc-section__desc">${L('Clique num cabeçalho para ordenar (de novo inverte). Marque linhas para agir em lote — a contagem aparece em cima.', 'Click a header to sort (again to reverse). Check rows to act in bulk — the count shows on top.', 'Haz clic en un encabezado para ordenar (otra vez invierte). Marca filas para actuar en lote — el conteo aparece arriba.')}</p>
        </div>
      </header>
      <div class="tl-demo">
        <div class="tl-demo__bar">
          <p class="tl-demo__count" data-count>${L('Nenhum selecionado', 'None selected', 'Ninguno seleccionado')}</p>
          <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-clear hidden>${icon('x', { size: 16 })}${L('Limpar seleção', 'Clear selection', 'Limpiar selección')}</button>
        </div>
        <div data-demo-table></div>
        <p class="ds-visually-hidden" aria-live="polite" data-live></p>
      </div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">${L('Anatomia', 'Anatomy', 'Anatomía')}</h2>
          <p class="doc-section__desc">${L('Uma tabela nativa com cinco peças. Nada de grid de divs: a semântica vem pronta.', 'A native table with five pieces. No grid of divs: the semantics come built in.', 'Una tabla nativa con cinco piezas. Nada de grid de divs: la semántica viene lista.')}</p>
        </div>
      </header>
      <div class="tl-anatomy">
        <div class="tl-anatomy__stage" aria-hidden="true" inert>
          <div class="ds-table-wrap">
            <table class="ds-table">
              <caption>${CAPTION()[0]} <span class="tl-pin">1</span></caption>
              <thead><tr>
                <th class="ds-table__check"><input type="checkbox" tabindex="-1"><span class="tl-pin tl-pin--check">5</span></th>
                <th aria-sort="descending"><span class="ds-table__sort">${cols[0].label}${icon('chevron-down', { size: 14 })}</span><span class="tl-pin">2</span></th>
                <th class="ds-table__num">${cols[2].label}</th>
              </tr></thead>
              <tbody>
                <tr data-selected><td class="ds-table__check"><input type="checkbox" checked tabindex="-1"></td><td class="ds-table__strong">${rows[0].name} <span class="tl-pin">3</span></td><td class="ds-table__num">${fmtNum(248)} <span class="tl-pin">4</span></td></tr>
                <tr><td class="ds-table__check"><input type="checkbox" tabindex="-1"></td><td class="ds-table__strong">Chip</td><td class="ds-table__num">${fmtNum(132)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <ol class="tl-anatomy__legend" role="list">
          <li><span class="tl-anatomy__num">1</span><div><p class="tl-anatomy__title">${L('Legenda', 'Caption', 'Leyenda')}</p><p class="tl-anatomy__text">${L(`${ic('&lt;caption&gt;')} nomeia a tabela para leitores de tela. Pode ter uma descrição curta.`, `${ic('&lt;caption&gt;')} names the table for screen readers. It can have a short description.`, `${ic('&lt;caption&gt;')} nombra la tabla para lectores de pantalla. Puede tener una descripción corta.`)}</p></div></li>
          <li><span class="tl-anatomy__num">2</span><div><p class="tl-anatomy__title">${L('Cabeçalho', 'Header', 'Encabezado')}</p><p class="tl-anatomy__text">${L(`${ic('&lt;th scope="col"&gt;')} em ${ic('label-sm')}, apagado. Ordenável com um botão dentro e ${ic('aria-sort')}.`, `${ic('&lt;th scope="col"&gt;')} in ${ic('label-sm')}, muted. Sortable with a button inside and ${ic('aria-sort')}.`, `${ic('&lt;th scope="col"&gt;')} en ${ic('label-sm')}, atenuado. Ordenable con un botón dentro y ${ic('aria-sort')}.`)}</p></div></li>
          <li><span class="tl-anatomy__num">3</span><div><p class="tl-anatomy__title">${L('Linha', 'Row', 'Fila')}</p><p class="tl-anatomy__text">${L(`52 px (40 px na compacta), divisor fino. Hover opcional; selecionada ganha ${ic('bg.selected')}.`, `52 px (40 px in compact), a thin divider. Optional hover; selected rows get ${ic('bg.selected')}.`, `52 px (40 px en la compacta), divisor fino. Hover opcional; la seleccionada recibe ${ic('bg.selected')}.`)}</p></div></li>
          <li><span class="tl-anatomy__num">4</span><div><p class="tl-anatomy__title">${L('Célula numérica', 'Numeric cell', 'Celda numérica')}</p><p class="tl-anatomy__text">${L(`${ic('ds-table__num')}: à direita e com algarismos tabulares, para as casas se alinharem.`, `${ic('ds-table__num')}: right-aligned with tabular figures, so the digits line up.`, `${ic('ds-table__num')}: a la derecha y con cifras tabulares, para que los dígitos se alineen.`)}</p></div></li>
          <li><span class="tl-anatomy__num">5</span><div><p class="tl-anatomy__title">${L('Seleção', 'Selection', 'Selección')} <span class="tl-anatomy__optional">${L('opcional', 'optional', 'opcional')}</span></p><p class="tl-anatomy__text">${L('Checkbox nativo com rótulo por linha e “selecionar todos” no cabeçalho.', 'A native checkbox with a label per row and “select all” in the header.', 'Checkbox nativo con etiqueta por fila y “seleccionar todos” en el encabezado.')}</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="densidade" aria-labelledby="densidade-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="densidade-title">${L('Densidade', 'Density', 'Densidad')}</h2>
          <p class="doc-section__desc">${L('Confortável é o padrão. Compacta para telas de operação, com muitas linhas para varrer.', 'Comfortable is the default. Compact for operational screens, with many rows to scan.', 'Cómoda es el predeterminado. Compacta para pantallas de operación, con muchas filas para recorrer.')}</p>
        </div>
      </header>
      <div class="tl-pair">
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: cols, rows: rows.slice(0, 3), caption: 'no', hover: 'no', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Confortável', 'Comfortable', 'Cómoda')}<code>${L('padrão', 'default', 'predeterminado')} · 52 px</code></p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: cols, rows: rows.slice(0, 3), caption: 'no', hover: 'no', density: 'compact', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Compacta', 'Compact', 'Compacta')}<code>ds-table--compact · 40 px</code></p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estados-title">${L('Estados', 'States', 'Estados')}</h2>
          <p class="doc-section__desc">${L('Uma tabela sem dados ainda é uma tabela: mantenha o cabeçalho e diga o que fazer. Carregando, mostre a forma das linhas — sem brilho.', 'A table without data is still a table: keep the header and say what to do. While loading, show the shape of the rows — no shimmer.', 'Una tabla sin datos sigue siendo una tabla: mantén el encabezado y di qué hacer. Al cargar, muestra la forma de las filas — sin brillo.')}</p>
        </div>
      </header>
      <div class="tl-pair">
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: cols, caption: 'no', state: 'empty', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Vazio', 'Empty', 'Vacío')}<code>ds-table__empty</code></p><p class="cd-example__text">${L('Ícone, frase curta e uma saída.', 'An icon, a short sentence, and a way out.', 'Ícono, frase corta y una salida.')}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tl-example" inert>${table({ columns: cols, caption: 'no', state: 'loading', minWidth: false })}</div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Carregando', 'Loading', 'Cargando')}<code>ds-table__skeleton</code></p><p class="cd-example__text">${L('Barras planas que pulsam devagar; param com movimento reduzido.', 'Flat bars that pulse slowly; they stop with reduced motion.', 'Barras planas que pulsan despacio; se detienen con movimiento reducido.')}</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('Use a tabela nativa e quase tudo vem de graça.', 'Use the native table and almost everything comes for free.', 'Usa la tabla nativa y casi todo viene gratis.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Tabela de verdade', 'A real table', 'Tabla de verdad'), L(`${ic('&lt;table&gt;')}, ${ic('&lt;caption&gt;')} e ${ic('&lt;th scope="col"&gt;')}: o leitor de tela anuncia a coluna de cada célula.`, `${ic('&lt;table&gt;')}, ${ic('&lt;caption&gt;')}, and ${ic('&lt;th scope="col"&gt;')}: the screen reader announces each cell’s column.`, `${ic('&lt;table&gt;')}, ${ic('&lt;caption&gt;')} y ${ic('&lt;th scope="col"&gt;')}: el lector de pantalla anuncia la columna de cada celda.`)],
        [L('Ordenação anunciada', 'Announced sorting', 'Ordenación anunciada'), L(`O cabeçalho ordenável é um botão; o ${ic('th')} recebe ${ic('aria-sort')} e uma região viva confirma a mudança.`, `The sortable header is a button; the ${ic('th')} gets ${ic('aria-sort')} and a live region confirms the change.`, `El encabezado ordenable es un botón; el ${ic('th')} recibe ${ic('aria-sort')} y una región viva confirma el cambio.`)],
        [L('Seleção pelo checkbox', 'Selection by checkbox', 'Selección con checkbox'), L('Cada linha tem um checkbox com nome (“Selecionar Botão”). O “selecionar todos” mostra o estado misto quando só parte está marcada.', 'Each row has a named checkbox (“Select Button”). “Select all” shows the mixed state when only some are checked.', 'Cada fila tiene un checkbox con nombre (“Seleccionar Botón”). El “seleccionar todos” muestra el estado mixto cuando solo una parte está marcada.')],
        [L('Rolagem pelo teclado', 'Keyboard scrolling', 'Desplazamiento con teclado'), L(`Com cabeçalho fixo, o contêiner vira ${ic('role="region"')} com nome e ${ic('tabindex="0"')} para rolar com as setas.`, `With a sticky header, the container becomes a named ${ic('role="region"')} with ${ic('tabindex="0"')} to scroll with the arrows.`, `Con encabezado fijo, el contenedor se vuelve ${ic('role="region"')} con nombre y ${ic('tabindex="0"')} para desplazarse con las flechas.`), ['Tab', '↑', '↓']],
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L('Status vai em texto no badge; a linha selecionada também fica com o checkbox marcado.', 'Status goes as text in the badge; the selected row also has its checkbox checked.', 'El estado va como texto en el badge; la fila seleccionada también queda con el checkbox marcado.')],
        [L('Não use para layout', 'Don’t use it for layout', 'No la uses para layout'), L('Tabela é para dados tabulares. Para alinhar elementos da interface, use grid.', 'Tables are for tabular data. To align interface elements, use grid.', 'La tabla es para datos tabulares. Para alinear elementos de la interfaz, usa grid.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Tudo o que a tabela consome.', 'Everything the table consumes.', 'Todo lo que consume la tabla.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.surface', L('Fundo e cabeçalho fixo', 'Background and sticky header', 'Fondo y encabezado fijo')],
        ['color.border.subtle', L('Contorno e divisores', 'Outline and dividers', 'Contorno y divisores')],
        ['color.fg.subtle', L('Cabeçalho e texto apagado', 'Header and muted text', 'Encabezado y texto atenuado')],
        ['color.fg.default', L('Células', 'Cells', 'Celdas')],
        ['color.bg.hover', L('Hover da linha', 'Row hover', 'Hover de la fila')],
        ['color.bg.selected', L('Linha selecionada', 'Selected row', 'Fila seleccionada')],
        ['color.fg.brand', L('Ícone da coluna ordenada', 'Sorted column icon', 'Ícono de la columna ordenada')],
        ['color.brand.solid', L('Checkbox marcado', 'Checked checkbox', 'Checkbox marcado')],
        ['color.bg.muted', L('Barras de carregamento', 'Loading bars', 'Barras de carga')],
        ['text.body-sm', L('Células', 'Cells', 'Celdas')],
        ['text.label-sm', L('Cabeçalho', 'Header', 'Encabezado')],
        ['radius.xl', L('Contêiner', 'Container', 'Contenedor')],
        ['space.200', L('Respiro lateral das células', 'Cell side padding', 'Espacio lateral de las celdas')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Três regras para tabelas fáceis de ler.', 'Three rules for easy-to-read tables.', 'Tres reglas para tablas fáciles de leer.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: números à direita', 'Do: numbers on the right', 'Haz: números a la derecha')}</p>
          <div class="tl-usage__preview" inert>
            <span class="tl-usage__num tl-usage__num--good"><span>${fmtNum(1248)}</span><span>87</span><span>12</span></span>
          </div>
          <p class="usage-card__text">${L('Alinhados à direita e com algarismos tabulares, os valores se comparam de relance.', 'Right-aligned and with tabular figures, values compare at a glance.', 'Alineados a la derecha y con cifras tabulares, los valores se comparan de un vistazo.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: tabela para pouca coisa', 'Avoid: a table for very little', 'Evita: tabla para poca cosa')}</p>
          <div class="tl-usage__preview" inert>
            <span class="tl-usage__num"><span>${L('Nome · Ana', 'Name · Ana', 'Nombre · Ana')}</span><span>${L('Cargo · Design', 'Role · Design', 'Cargo · Diseño')}</span></span>
          </div>
          <p class="usage-card__text">${L('Duas colunas de “rótulo e valor” ficam melhores numa lista de detalhes.', 'Two columns of “label and value” work better as a details list.', 'Dos columnas de “etiqueta y valor” quedan mejor en una lista de detalles.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Poucas colunas', 'Few columns', 'Pocas columnas')}</p>
          <p class="usage-card__text">${L('Mostre só o que ajuda a decidir. O resto vai para o detalhe da linha.', 'Show only what helps decide. The rest goes into the row’s detail.', 'Muestra solo lo que ayuda a decidir. El resto va al detalle de la fila.')}</p>
          <pre class="ds-code ds-code--sm"><code>&lt;td class="ds-table__num"&gt;248&lt;/td&gt;
<span class="ds-code__comment">&lt;!-- ${L('direita + tabular-nums', 'right + tabular-nums', 'derecha + tabular-nums')} --&gt;</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const withOpt = L('Com', 'With', 'Con');
  const without = L('Sem', 'Without', 'Sin');
  const unmountPlayground = mountPlayground(root, {
    id: 'tabela',
    controls: [
      { id: 'density', label: L('Densidade', 'Density', 'Densidad'), value: 'comfortable', options: [{ value: 'comfortable', label: L('Confortável', 'Comfortable', 'Cómoda') }, { value: 'compact', label: L('Compacta', 'Compact', 'Compacta') }] },
      { id: 'select', label: L('Seleção', 'Selection', 'Selección'), value: 'no', options: [{ value: 'no', label: without }, { value: 'yes', label: withOpt }] },
      { id: 'hover', label: 'Hover', value: 'yes', options: [{ value: 'yes', label: withOpt }, { value: 'no', label: without }] },
      { id: 'sticky', label: L('Cabeçalho fixo', 'Sticky header', 'Encabezado fijo'), value: 'no', options: [{ value: 'no', label: L('Não', 'No', 'No') }, { value: 'yes', label: L('Sim', 'Yes', 'Sí') }] },
      { id: 'caption', label: L('Legenda', 'Caption', 'Leyenda'), value: 'yes', options: [{ value: 'yes', label: withOpt }, { value: 'no', label: without }] },
    ],
    render: (state) => `<div class="tl-stage">${table({ ...state, selected: state.select === 'yes' ? new Set(['chip']) : new Set(), maxHeight: 240 })}</div>`,
    code: tableCode,
  });

  // demo interativa: ordenação + seleção
  const host = root.querySelector('[data-demo-table]');
  const countEl = root.querySelector('[data-count]');
  const clearBtn = root.querySelector('[data-clear]');
  const live = root.querySelector('[data-live]');
  const demo = { sort: { key: 'screens', dir: 'descending' }, selected: new Set() };
  const total = ROWS().length;

  const render = (focus) => {
    host.innerHTML = table({ select: 'yes', sticky: 'yes', sortable: true, sort: demo.sort, selected: demo.selected, maxHeight: 360 });
    const all = host.querySelector('[data-select-all]');
    const n = demo.selected.size;
    all.indeterminate = n > 0 && n < total;
    countEl.textContent =
      n === 0 ? L('Nenhum selecionado', 'None selected', 'Ninguno seleccionado') : n === 1 ? L('1 selecionado', '1 selected', '1 seleccionado') : L(`${n} selecionados`, `${n} selected`, `${n} seleccionados`);
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
      const label = COLUMNS().find((c) => c.key === key).label;
      live.textContent =
        dir === 'ascending'
          ? L(`Ordenado por ${label}, crescente.`, `Sorted by ${label}, ascending.`, `Ordenado por ${label}, ascendente.`)
          : L(`Ordenado por ${label}, decrescente.`, `Sorted by ${label}, descending.`, `Ordenado por ${label}, descendente.`);
      return;
    }
    if (event.target.closest('[data-clear]')) {
      demo.selected.clear();
      render();
      live.textContent = L('Seleção limpa.', 'Selection cleared.', 'Selección limpia.');
    }
  };

  const onChange = (event) => {
    const input = event.target;
    if (!host.contains(input)) return;
    if (input.matches('[data-select-all]')) {
      if (input.checked) ROWS().forEach((r) => demo.selected.add(r.id));
      else demo.selected.clear();
      render('[data-select-all]');
    } else if (input.matches('[data-select-row]')) {
      const id = input.dataset.selectRow;
      if (input.checked) demo.selected.add(id);
      else demo.selected.delete(id);
      render(`[data-select-row="${CSS.escape(id)}"]`);
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
