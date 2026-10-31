import { icon } from '../../ds/icons/icons.js';
import { attachMenu } from '../../ds/js/menu.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/chip.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const TYPES = () => [
  ['filter', L('Filtro', 'Filter', 'Filtro'), L('Liga e desliga um critério. Vários podem ficar ligados ao mesmo tempo.', 'Turns a criterion on and off. Several can be on at the same time.', 'Activa y desactiva un criterio. Varios pueden estar activos a la vez.')],
  ['select', L('Seletor', 'Picker', 'Selector'), L('Mostra a escolha atual e abre um menu para trocar.', 'Shows the current choice and opens a menu to change it.', 'Muestra la elección actual y abre un menú para cambiarla.')],
  ['removable', L('Removível', 'Removable', 'Removible'), L('Mostra algo que a pessoa adicionou — e deixa tirar.', 'Shows something the person added — and lets them remove it.', 'Muestra algo que la persona agregó — y deja quitarlo.')],
];

const STATES = () => [
  ['default', L('Normal', 'Default', 'Normal')],
  ['hover', 'Hover'],
  ['focus', L('Foco', 'Focus', 'Foco')],
  ['selected', L('Selecionado', 'Selected', 'Seleccionado')],
  ['disabled', L('Desativado', 'Disabled', 'Desactivado')],
];

const ITEMS = () => [
  [L('Botão', 'Button', 'Botón'), 'ready'],
  ['Chip', 'ready'],
  [L('Menu', 'Menu', 'Menú'), 'review'],
  [L('Campo de texto', 'Text field', 'Campo de texto'), 'review'],
  [L('Tabela', 'Table', 'Tabla'), 'progress'],
  ['Modal', 'planned'],
];

const STATUS = () => ({
  ready: ['success', L('Pronto', 'Done', 'Listo'), L('Prontos', 'Done', 'Listos')],
  review: ['warning', L('Em revisão', 'In review', 'En revisión'), L('Em revisão', 'In review', 'En revisión')],
  progress: ['brand', L('Em andamento', 'In progress', 'En curso'), L('Em andamento', 'In progress', 'En curso')],
  planned: ['neutral', L('Planejado', 'Planned', 'Planificado'), L('Planejados', 'Planned', 'Planificados')],
});

const TAGS = () => ['Design', 'Tokens', L('Acessibilidade', 'Accessibility', 'Accesibilidad'), L('Movimento', 'Motion', 'Movimiento')];

const SORTS = () => [
  { value: 'recent', label: L('Recentes', 'Recent', 'Recientes') },
  { value: 'usage', label: L('Mais usados', 'Most used', 'Más usados') },
  { value: 'az', label: 'A–Z' },
];

const sortedBy = (label) => L(`Ordenado por: ${label}`, `Sorted by: ${label}`, `Ordenado por: ${label}`);

/* ───────── Montagem do chip ───────── */

/** opts: type, size, withIcon, state, label, iconName, interactive */
function chip(opts) {
  const { type = 'filter', size = 'md', withIcon = 'no', state = 'default', iconName = 'moon', interactive = false } = opts;
  const label = escapeHtml(opts.label || 'Chip');
  const sm = size === 'sm';
  const cls = ['ds-chip', sm && 'ds-chip--sm', type === 'removable' && 'ds-chip--removable'].filter(Boolean).join(' ');
  const glyph = withIcon === 'yes' ? `<span class="ds-chip__icon">${icon(iconName, { size: sm ? 14 : 16 })}</span>` : '';
  const forced = ['hover', 'focus'].includes(state) ? ` data-state="${state}"` : '';
  const tab = interactive ? '' : ' tabindex="-1"';
  if (type === 'removable') {
    const off = state === 'disabled' ? ' aria-disabled="true"' : '';
    return `<span class="${cls}"${forced}${off}>${glyph}${label}<button type="button" class="ds-chip__remove" aria-label="${L('Remover', 'Remove', 'Quitar')} ${label}"${tab}>${icon('x', { size: sm ? 12 : 14 })}</button></span>`;
  }
  const dis = state === 'disabled' ? ' disabled' : '';
  if (type === 'select') {
    return `<button type="button" class="${cls}" aria-haspopup="menu" aria-expanded="${state === 'selected'}"${forced}${dis}${tab}>${glyph}${label}<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>`;
  }
  return `<button type="button" class="${cls}" aria-pressed="${state === 'selected'}"${forced}${dis}${tab}><span class="ds-chip__check">${icon('check', { size: 14 })}</span>${glyph}${label}</button>`;
}

function chipCode(state) {
  const sm = state.size === 'sm';
  const cls = ['ds-chip', sm && 'ds-chip--sm', state.type === 'removable' && 'ds-chip--removable'].filter(Boolean).join(' ');
  const label = state.label || 'Chip';
  const glyph = state.withIcon === 'yes' ? `\n  <span class="ds-chip__icon"><ds-icon name="moon" size="${sm ? 14 : 16}"></ds-icon></span>` : '';
  if (state.type === 'removable') {
    const off = state.state === 'disabled' ? ' aria-disabled="true"' : '';
    return `<span class="${cls}"${off}>${glyph}\n  ${label}\n  <button type="button" class="ds-chip__remove" aria-label="${L('Remover', 'Remove', 'Quitar')} ${label}">\n    <ds-icon name="x" size="${sm ? 12 : 14}"></ds-icon>\n  </button>\n</span>`;
  }
  const dis = state.state === 'disabled' ? ' disabled' : '';
  if (state.type === 'select') {
    return `<button type="button" class="${cls}" aria-haspopup="menu" aria-expanded="${state.state === 'selected'}"${dis}>${glyph}\n  ${label}\n  <span class="ds-chip__chevron"><ds-icon name="chevron-down" size="14"></ds-icon></span>\n</button>\n<!-- ${L('o menu', 'the menu', 'el menú')}: attachMenu(chip, { options, value, onChange }) -->`;
  }
  return `<button type="button" class="${cls}" aria-pressed="${state.state === 'selected'}"${dis}>\n  <span class="ds-chip__check"><ds-icon name="check" size="14"></ds-icon></span>${glyph}\n  ${label}\n</button>`;
}

const statusBadge = (status) => {
  const [tone, label] = STATUS()[status];
  return `<span class="ds-badge ds-badge--sm${tone === 'neutral' ? '' : ` ds-badge--${tone}`}">${label}</span>`;
};

/* ───────── Página ───────── */

export default function renderChip(page) {
  const types = TYPES();
  const states = STATES();
  const recent = L('Recentes', 'Recent', 'Recientes');
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Pílula com contorno para filtrar, escolher e mostrar seleções. Mais leve que um botão, pensada para aparecer em grupo.', 'An outlined pill to filter, choose, and show selections. Lighter than a button, made to appear in groups.', 'Píldora con contorno para filtrar, elegir y mostrar selecciones. Más liviana que un botón, pensada para aparecer en grupo.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tipos', 'types', 'tipos')}</dt><dd class="doc-stat__value">${types.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estados', 'states', 'estados')}</dt><dd class="doc-stat__value">${states.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('altura (md / sm)', 'height (md / sm)', 'altura (md / sm)')}</dt><dd class="doc-stat__value">36/30</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['tipos', L('Tipos', 'Types', 'Tipos')],
        ['grupo', L('Filtros em grupo', 'Grouped filters', 'Filtros en grupo')],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
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
          <p class="doc-section__desc">${L('Escolha o tipo, o tamanho e o estado. O código acompanha.', 'Pick the type, size, and state. The code follows along.', 'Elige el tipo, el tamaño y el estado. El código acompaña.')}</p>
        </div>
      </header>
      ${playgroundMarkup('chip')}
    </section>

    <section class="doc-section" id="tipos" aria-labelledby="tipos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tipos-title">${L('Tipos', 'Types', 'Tipos')}</h2>
          <p class="doc-section__desc">${L('O mesmo visual, três trabalhos diferentes. Todos funcionam aqui.', 'The same look, three different jobs. They all work here.', 'El mismo aspecto, tres trabajos distintos. Todos funcionan aquí.')}</p>
        </div>
      </header>
      <div class="ch-types">
        <article class="cd-example">
          <div class="cd-example__preview">
            <div class="ds-chip-group" role="group" aria-label="${L('Plataformas', 'Platforms', 'Plataformas')}" data-filter-demo>
              ${['Web', 'iOS', 'Android'].map((p, i) => chip({ type: 'filter', label: p, state: i === 0 ? 'selected' : 'default', interactive: true })).join('')}
            </div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${types[0][1]}<code>aria-pressed</code></p><p class="cd-example__text">${types[0][2]}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview ch-stack">
            ${chip({ type: 'select', label: recent, withIcon: 'yes', iconName: 'filter', interactive: true }).replace('<button', '<button data-sort-chip')}
            <p class="ch-caption" data-sort-caption>${sortedBy(recent)}</p>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${types[1][1]}<code>aria-haspopup="menu"</code></p><p class="cd-example__text">${types[1][2]}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview ch-stack">
            <div class="ds-chip-group" role="list" aria-label="${L('Etiquetas', 'Tags', 'Etiquetas')}" data-tags></div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${types[2][1]}<code>ds-chip--removable</code></p><p class="cd-example__text">${types[2][2]}</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="grupo" aria-labelledby="grupo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="grupo-title">${L('Filtros em grupo', 'Grouped filters', 'Filtros en grupo')}</h2>
          <p class="doc-section__desc">${L('Filtros combinam: ligue mais de um. Nenhum ligado é o mesmo que todos.', 'Filters combine: turn on more than one. None on is the same as all.', 'Los filtros se combinan: activa más de uno. Ninguno activo es lo mismo que todos.')}</p>
        </div>
      </header>
      <div class="ch-filter">
        <div class="ch-filter__bar">
          <div class="ds-chip-group" role="group" aria-label="${L('Filtrar por status', 'Filter by status', 'Filtrar por estado')}" data-status-filter>
            ${Object.entries(STATUS()).map(([id, [, , plural]]) => `<button type="button" class="ds-chip ds-chip--sm" aria-pressed="false" data-status="${id}"><span class="ds-chip__check">${icon('check', { size: 14 })}</span>${plural}</button>`).join('')}
          </div>
          <button type="button" class="ds-inline-action" data-status-clear hidden>${icon('x', { size: 16 })}${L('Limpar filtros', 'Clear filters', 'Borrar filtros')}</button>
        </div>
        <p class="ch-filter__count" data-status-count aria-live="polite"></p>
        <ul class="ch-filter__list" role="list" data-status-list></ul>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">${L('Tamanhos', 'Sizes', 'Tamaños')}</h2>
          <p class="doc-section__desc">${L('Médio acompanha botões e campos; pequeno vai em barras de filtro e dentro de cards.', 'Medium goes with buttons and fields; small goes in filter bars and inside cards.', 'Mediano acompaña botones y campos; pequeño va en barras de filtro y dentro de tarjetas.')}</p>
        </div>
      </header>
      <div class="ch-sizes">
        ${[
          ['md', L('Médio', 'Medium', 'Mediano'), '36 px', 'label-sm · 13 px', L('padrão', 'default', 'predeterminado')],
          ['sm', L('Pequeno', 'Small', 'Pequeño'), '30 px', 'caption · 12 px', 'ds-chip--sm'],
        ]
          .map(
            ([size, name, h, text, cls]) => `<article class="cd-example">
              <div class="cd-example__preview" inert>
                ${chip({ type: 'filter', size, label: L('Filtro', 'Filter', 'Filtro'), state: 'selected' })}
                ${chip({ type: 'select', size, label: L('Seletor', 'Picker', 'Selector'), withIcon: 'yes', iconName: 'filter' })}
                ${chip({ type: 'removable', size, label: L('Etiqueta', 'Tag', 'Etiqueta') })}
              </div>
              <div class="cd-example__body">
                <p class="cd-example__name">${name}<code>${cls}</code></p>
                <p class="cd-example__text">${L(`Altura ${h} · texto ${text}`, `Height ${h} · text ${text}`, `Altura ${h} · texto ${text}`)}</p>
              </div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estados-title">${L('Estados', 'States', 'Estados')}</h2>
          <p class="doc-section__desc">${L(`Selecionado ganha fundo e contorno mais forte — e, no filtro, a marca de check, para não depender só da cor. Force um estado com ${ic('data-state')}.`, `Selected gets a background and a stronger outline — and, in the filter, a check mark, so it doesn’t rely on color alone. Force a state with ${ic('data-state')}.`, `Seleccionado gana fondo y un contorno más fuerte — y, en el filtro, la marca de check, para no depender solo del color. Fuerza un estado con ${ic('data-state')}.`)}</p>
        </div>
      </header>
      <div class="ch-states" inert>
        <div class="ch-states__grid">
          <span></span>
          ${states.map(([, label]) => `<span class="ch-states__head">${label}</span>`).join('')}
          ${types.map(
            ([type, name]) => `<span class="ch-states__row">${name}</span>
              ${states.map(([state]) => `<span class="ch-states__cell">${type === 'removable' && state === 'selected' ? '<span class="ch-states__na">—</span>' : chip({ type, state, label: type === 'select' ? recent : 'Web' })}</span>`).join('')}`,
          ).join('')}
        </div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('Cada tipo tem a sua semântica. O visual é o mesmo; o que o leitor de tela ouve, não.', 'Each type has its own semantics. The look is the same; what the screen reader hears isn’t.', 'Cada tipo tiene su semántica. El aspecto es el mismo; lo que oye el lector de pantalla, no.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Filtro é um botão de alternância', 'A filter is a toggle button', 'El filtro es un botón de alternancia'), L(`${ic('&lt;button aria-pressed&gt;')}: o leitor anuncia “Web, botão de alternância, pressionado”.`, `${ic('&lt;button aria-pressed&gt;')}: the reader announces “Web, toggle button, pressed”.`, `${ic('&lt;button aria-pressed&gt;')}: el lector anuncia “Web, botón de alternancia, presionado”.`), ['Enter', L('Espaço', 'Space', 'Espacio')]],
        [L('Seletor abre um menu', 'A picker opens a menu', 'El selector abre un menú'), L(`${ic('aria-haspopup="menu"')} e ${ic('aria-expanded')} — o ${ic('attachMenu')} cuida dos dois e das setas.`, `${ic('aria-haspopup="menu"')} and ${ic('aria-expanded')} — ${ic('attachMenu')} handles both, plus the arrow keys.`, `${ic('aria-haspopup="menu"')} y ${ic('aria-expanded')} — ${ic('attachMenu')} se encarga de los dos y de las flechas.`), ['↓', 'Esc']],
        [L('Remover tem nome', 'Remove has a name', 'Quitar tiene nombre'), L('O botão de remover diz o que remove (“Remover Tokens”). Depois, o foco vai para a etiqueta vizinha.', 'The remove button says what it removes (“Remove Tokens”). Afterwards, focus moves to the neighboring tag.', 'El botón de quitar dice qué quita (“Quitar Tokens”). Después, el foco pasa a la etiqueta vecina.')],
        [L('Grupo com nome', 'A named group', 'Grupo con nombre'), L(`Envolva os chips em ${ic('role="group"')} com ${ic('aria-label')} (“Filtrar por status”).`, `Wrap the chips in ${ic('role="group"')} with an ${ic('aria-label')} (“Filter by status”).`, `Envuelve los chips en ${ic('role="group"')} con ${ic('aria-label')} (“Filtrar por estado”).`)],
        [L('Não só cor', 'Not just color', 'No solo color'), L('O filtro ligado mostra um check, além do fundo. O resultado do filtro é anunciado numa região viva.', 'An active filter shows a check, not just a background. The filter result is announced in a live region.', 'El filtro activo muestra un check, además del fondo. El resultado del filtro se anuncia en una región viva.')],
        [L('Alvo confortável', 'A comfortable target', 'Objetivo cómodo'), L('36 px no médio; o pequeno (30 px) deve ficar em barras com espaço entre os chips.', '36 px for medium; small (30 px) should sit in bars with space between the chips.', '36 px en el mediano; el pequeño (30 px) debe ir en barras con espacio entre los chips.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Tudo o que o chip consome.', 'Everything the chip consumes.', 'Todo lo que consume el chip.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.border.control', L('Contorno', 'Outline', 'Contorno')],
        ['color.border.strong', L('Contorno no hover e selecionado', 'Outline on hover and when selected', 'Contorno en hover y seleccionado')],
        ['color.bg.hover', 'Hover'],
        ['color.bg.selected', L('Selecionado e aberto', 'Selected and open', 'Seleccionado y abierto')],
        ['color.fg.default', L('Rótulo', 'Label', 'Etiqueta')],
        ['color.fg.brand', L('Ícone à esquerda', 'Left icon', 'Ícono a la izquierda')],
        ['color.fg.subtle', L('Seta e botão de remover', 'Chevron and remove button', 'Flecha y botón de quitar')],
        ['text.label-sm', L('Rótulo (médio)', 'Label (medium)', 'Etiqueta (mediano)')],
        ['text.caption', L('Rótulo (pequeno)', 'Label (small)', 'Etiqueta (pequeño)')],
        ['radius.full', L('Forma de pílula', 'Pill shape', 'Forma de píldora')],
        ['duration.fast', L('Transição', 'Transition', 'Transición')],
        ['opacity.disabled', L('Desativado', 'Disabled', 'Desactivado')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Três regras para chips que ajudam em vez de enfeitar.', 'Three rules for chips that help instead of decorate.', 'Tres reglas para chips que ayudan en vez de adornar.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: chips para escolhas rápidas', 'Do: chips for quick choices', 'Haz: chips para elecciones rápidas')}</p>
          <div class="ch-usage__preview" inert>${chip({ type: 'filter', label: L('Prontos', 'Done', 'Listos'), state: 'selected', size: 'sm' })}${chip({ type: 'filter', label: L('Em revisão', 'In review', 'En revisión'), size: 'sm' })}${chip({ type: 'select', label: recent, size: 'sm' })}</div>
          <p class="usage-card__text">${L('Filtros, ordenação, etiquetas — coisas que mudam a vista, não que executam algo.', 'Filters, sorting, tags — things that change the view, not things that run something.', 'Filtros, orden, etiquetas — cosas que cambian la vista, no que ejecutan algo.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: chip como botão de ação', 'Avoid: a chip as an action button', 'Evita: chip como botón de acción')}</p>
          <div class="ch-usage__preview" inert>${chip({ type: 'filter', label: L('Publicar agora', 'Publish now', 'Publicar ahora'), withIcon: 'yes', iconName: 'upload' })}</div>
          <p class="usage-card__text">${L('“Publicar”, “Excluir”, “Enviar” são ações: use botão.', '“Publish”, “Delete”, “Send” are actions: use a button.', '“Publicar”, “Eliminar”, “Enviar” son acciones: usa un botón.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Até seis por grupo', 'Up to six per group', 'Hasta seis por grupo')}</p>
          <p class="usage-card__text">${L('Com mais opções que isso, troque por um seletor que abre menu — cabe numa linha e se lê melhor.', 'With more options than that, switch to a picker that opens a menu — it fits on one line and reads better.', 'Con más opciones, cámbialo por un selector que abre un menú — cabe en una línea y se lee mejor.')}</p>
          <pre class="ds-code ds-code--sm"><code>&lt;div class="ds-chip-group" role="group"
     aria-label="${L('Filtrar por status', 'Filter by status', 'Filtrar por estado')}"&gt;…&lt;/div&gt;</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const sorts = SORTS();
  const items = ITEMS();
  const unmountPlayground = mountPlayground(root, {
    id: 'chip',
    controls: [
      { id: 'type', label: L('Tipo', 'Type', 'Tipo'), value: 'filter', options: TYPES().map(([value, label]) => ({ value, label })) },
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: [{ value: 'md', label: L('Médio', 'Medium', 'Mediano') }, { value: 'sm', label: L('Pequeno', 'Small', 'Pequeño') }] },
      { id: 'withIcon', label: L('Ícone', 'Icon', 'Ícono'), value: 'no', options: [{ value: 'no', label: L('Sem', 'Without', 'Sin') }, { value: 'yes', label: L('Com', 'With', 'Con') }] },
      { id: 'state', label: L('Estado', 'State', 'Estado'), value: 'selected', options: STATES().map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: L('Escuro', 'Dark', 'Oscuro') },
    render: (state) => chip(state),
    code: chipCode,
  });

  // seletor (Tipos)
  const sortChip = root.querySelector('[data-sort-chip]');
  const sortCaption = root.querySelector('[data-sort-caption]');
  const sortMenu = attachMenu(sortChip, {
    label: L('Ordenar por', 'Sort by', 'Ordenar por'),
    value: 'recent',
    options: sorts,
    onChange: (value) => {
      const label = sorts.find((s) => s.value === value).label;
      sortChip.childNodes.forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) n.textContent = label;
      });
      sortCaption.textContent = sortedBy(label);
    },
  });

  // removíveis (Tipos)
  const tagsEl = root.querySelector('[data-tags]');
  let tags = TAGS();
  const renderTags = (focusIndex) => {
    tagsEl.innerHTML = tags.length
      ? tags.map((t) => `<span role="listitem">${chip({ type: 'removable', label: t, interactive: true })}</span>`).join('')
      : `<span class="ch-empty">${L('Nenhuma etiqueta.', 'No tags.', 'Ninguna etiqueta.')} <button type="button" class="ds-inline-action" data-tags-restore>${icon('refresh', { size: 16 })}${L('Restaurar', 'Restore', 'Restaurar')}</button></span>`;
    if (focusIndex !== undefined) {
      const buttons = tagsEl.querySelectorAll('.ds-chip__remove');
      (buttons[Math.min(focusIndex, buttons.length - 1)] ?? tagsEl.querySelector('[data-tags-restore]'))?.focus();
    }
  };
  renderTags();

  // filtros em grupo
  const statusList = root.querySelector('[data-status-list]');
  const statusCount = root.querySelector('[data-status-count]');
  const statusClear = root.querySelector('[data-status-clear]');
  const active = new Set();
  const renderStatus = () => {
    const shown = items.filter(([, s]) => active.size === 0 || active.has(s));
    statusList.innerHTML = shown.map(([name, s]) => `<li class="ch-filter__item"><span>${name}</span>${statusBadge(s)}</li>`).join('');
    statusCount.textContent = L(`Mostrando ${shown.length} de ${items.length}`, `Showing ${shown.length} of ${items.length}`, `Mostrando ${shown.length} de ${items.length}`);
    statusClear.hidden = active.size === 0;
    root.querySelectorAll('[data-status]').forEach((c) => c.setAttribute('aria-pressed', String(active.has(c.dataset.status))));
  };
  renderStatus();

  const onClick = (event) => {
    const filterChip = event.target.closest('[data-filter-demo] .ds-chip');
    if (filterChip) {
      filterChip.setAttribute('aria-pressed', String(filterChip.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    const remove = event.target.closest('[data-tags] .ds-chip__remove');
    if (remove) {
      const buttons = [...tagsEl.querySelectorAll('.ds-chip__remove')];
      const index = buttons.indexOf(remove);
      tags.splice(index, 1);
      renderTags(index);
      return;
    }
    if (event.target.closest('[data-tags-restore]')) {
      tags = TAGS();
      renderTags(0);
      return;
    }
    const status = event.target.closest('[data-status]');
    if (status) {
      const id = status.dataset.status;
      if (active.has(id)) active.delete(id);
      else active.add(id);
      renderStatus();
      return;
    }
    if (event.target.closest('[data-status-clear]')) {
      active.clear();
      renderStatus();
      root.querySelector('[data-status]')?.focus();
    }
  };
  root.addEventListener('click', onClick);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    sortMenu.destroy();
    root.removeEventListener('click', onClick);
    unmountCopy();
    unmountNav();
  };
}
