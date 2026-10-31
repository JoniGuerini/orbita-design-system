import { icon } from '../../ds/icons/icons.js';
import { attachMenu } from '../../ds/js/menu.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/chip.css'];

/* ───────── Dados ───────── */

const TYPES = [
  ['filter', 'Filtro', 'Liga e desliga um critério. Vários podem ficar ligados ao mesmo tempo.'],
  ['select', 'Seletor', 'Mostra a escolha atual e abre um menu para trocar.'],
  ['removable', 'Removível', 'Mostra algo que a pessoa adicionou — e deixa tirar.'],
];

const STATES = [
  ['default', 'Normal'],
  ['hover', 'Hover'],
  ['focus', 'Foco'],
  ['selected', 'Selecionado'],
  ['disabled', 'Desativado'],
];

const ITEMS = [
  ['Botão', 'ready'],
  ['Chip', 'ready'],
  ['Menu', 'review'],
  ['Campo de texto', 'review'],
  ['Tabela', 'progress'],
  ['Modal', 'planned'],
];

const STATUS = {
  ready: ['success', 'Pronto', 'Prontos'],
  review: ['warning', 'Em revisão', 'Em revisão'],
  progress: ['brand', 'Em andamento', 'Em andamento'],
  planned: ['neutral', 'Planejado', 'Planejados'],
};

const TAGS = ['Design', 'Tokens', 'Acessibilidade', 'Movimento'];

const SORTS = [
  { value: 'recent', label: 'Recentes' },
  { value: 'usage', label: 'Mais usados' },
  { value: 'az', label: 'A–Z' },
];

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
    return `<span class="${cls}"${forced}${off}>${glyph}${label}<button type="button" class="ds-chip__remove" aria-label="Remover ${label}"${tab}>${icon('x', { size: sm ? 12 : 14 })}</button></span>`;
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
    return `<span class="${cls}"${off}>${glyph}\n  ${label}\n  <button type="button" class="ds-chip__remove" aria-label="Remover ${label}">\n    <ds-icon name="x" size="${sm ? 12 : 14}"></ds-icon>\n  </button>\n</span>`;
  }
  const dis = state.state === 'disabled' ? ' disabled' : '';
  if (state.type === 'select') {
    return `<button type="button" class="${cls}" aria-haspopup="menu" aria-expanded="${state.state === 'selected'}"${dis}>${glyph}\n  ${label}\n  <span class="ds-chip__chevron"><ds-icon name="chevron-down" size="14"></ds-icon></span>\n</button>\n<!-- o menu: attachMenu(chip, { options, value, onChange }) -->`;
  }
  return `<button type="button" class="${cls}" aria-pressed="${state.state === 'selected'}"${dis}>\n  <span class="ds-chip__check"><ds-icon name="check" size="14"></ds-icon></span>${glyph}\n  ${label}\n</button>`;
}

const statusBadge = (status) => {
  const [tone, label] = STATUS[status];
  return `<span class="ds-badge ds-badge--sm${tone === 'neutral' ? '' : ` ds-badge--${tone}`}">${label}</span>`;
};

/* ───────── Página ───────── */

export default function renderChip(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Chip</h1>
        <p class="doc-header__lead">Pílula com contorno para filtrar, escolher e mostrar seleções. Mais leve que um botão, pensada para aparecer em grupo.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tipos</dt><dd class="doc-stat__value">${TYPES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estados</dt><dd class="doc-stat__value">${STATES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">altura (md / sm)</dt><dd class="doc-stat__value">36/30</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['tipos', 'Tipos'],
        ['grupo', 'Filtros em grupo'],
        ['tamanhos', 'Tamanhos'],
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
          <p class="doc-section__desc">Escolha o tipo, o tamanho e o estado. O código acompanha.</p>
        </div>
      </header>
      ${playgroundMarkup('chip')}
    </section>

    <section class="doc-section" id="tipos" aria-labelledby="tipos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tipos-title">Tipos</h2>
          <p class="doc-section__desc">O mesmo visual, três trabalhos diferentes. Todos funcionam aqui.</p>
        </div>
      </header>
      <div class="ch-types">
        <article class="cd-example">
          <div class="cd-example__preview">
            <div class="ds-chip-group" role="group" aria-label="Plataformas" data-filter-demo>
              ${['Web', 'iOS', 'Android'].map((p, i) => chip({ type: 'filter', label: p, state: i === 0 ? 'selected' : 'default', interactive: true })).join('')}
            </div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${TYPES[0][1]}<code>aria-pressed</code></p><p class="cd-example__text">${TYPES[0][2]}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview ch-stack">
            ${chip({ type: 'select', label: 'Recentes', withIcon: 'yes', iconName: 'filter', interactive: true }).replace('<button', '<button data-sort-chip')}
            <p class="ch-caption" data-sort-caption>Ordenado por: Recentes</p>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${TYPES[1][1]}<code>aria-haspopup="menu"</code></p><p class="cd-example__text">${TYPES[1][2]}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview ch-stack">
            <div class="ds-chip-group" role="list" aria-label="Etiquetas" data-tags></div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${TYPES[2][1]}<code>ds-chip--removable</code></p><p class="cd-example__text">${TYPES[2][2]}</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="grupo" aria-labelledby="grupo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="grupo-title">Filtros em grupo</h2>
          <p class="doc-section__desc">Filtros combinam: ligue mais de um. Nenhum ligado é o mesmo que todos.</p>
        </div>
      </header>
      <div class="ch-filter">
        <div class="ch-filter__bar">
          <div class="ds-chip-group" role="group" aria-label="Filtrar por status" data-status-filter>
            ${Object.entries(STATUS).map(([id, [, , plural]]) => `<button type="button" class="ds-chip ds-chip--sm" aria-pressed="false" data-status="${id}"><span class="ds-chip__check">${icon('check', { size: 14 })}</span>${plural}</button>`).join('')}
          </div>
          <button type="button" class="ds-inline-action" data-status-clear hidden>${icon('x', { size: 16 })}Limpar filtros</button>
        </div>
        <p class="ch-filter__count" data-status-count aria-live="polite"></p>
        <ul class="ch-filter__list" role="list" data-status-list></ul>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">Tamanhos</h2>
          <p class="doc-section__desc">Médio acompanha botões e campos; pequeno vai em barras de filtro e dentro de cards.</p>
        </div>
      </header>
      <div class="ch-sizes">
        ${[
          ['md', 'Médio', '36 px', 'label-sm · 13 px', 'padrão'],
          ['sm', 'Pequeno', '30 px', 'caption · 12 px', 'ds-chip--sm'],
        ]
          .map(
            ([size, name, h, text, cls]) => `<article class="cd-example">
              <div class="cd-example__preview" inert>
                ${chip({ type: 'filter', size, label: 'Filtro', state: 'selected' })}
                ${chip({ type: 'select', size, label: 'Seletor', withIcon: 'yes', iconName: 'filter' })}
                ${chip({ type: 'removable', size, label: 'Etiqueta' })}
              </div>
              <div class="cd-example__body">
                <p class="cd-example__name">${name}<code>${cls}</code></p>
                <p class="cd-example__text">Altura ${h} · texto ${text}</p>
              </div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estados-title">Estados</h2>
          <p class="doc-section__desc">Selecionado ganha fundo e contorno mais forte — e, no filtro, a marca de check, para não depender só da cor. Force um estado com <code class="ds-inline-code">data-state</code>.</p>
        </div>
      </header>
      <div class="ch-states" inert>
        <div class="ch-states__grid">
          <span></span>
          ${STATES.map(([, label]) => `<span class="ch-states__head">${label}</span>`).join('')}
          ${TYPES.map(
            ([type, name]) => `<span class="ch-states__row">${name}</span>
              ${STATES.map(([state]) => `<span class="ch-states__cell">${type === 'removable' && state === 'selected' ? '<span class="ch-states__na">—</span>' : chip({ type, state, label: type === 'select' ? 'Recentes' : 'Web' })}</span>`).join('')}`,
          ).join('')}
        </div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">Cada tipo tem a sua semântica. O visual é o mesmo; o que o leitor de tela ouve, não.</p>
        </div>
      </header>
      ${a11yList([
        ['Filtro é um botão de alternância', '<code class="ds-inline-code">&lt;button aria-pressed&gt;</code>: o leitor anuncia “Web, botão de alternância, pressionado”.', ['Enter', 'Espaço']],
        ['Seletor abre um menu', '<code class="ds-inline-code">aria-haspopup="menu"</code> e <code class="ds-inline-code">aria-expanded</code> — o <code class="ds-inline-code">attachMenu</code> cuida dos dois e das setas.', ['↓', 'Esc']],
        ['Remover tem nome', 'O botão de remover diz o que remove (“Remover Tokens”). Depois, o foco vai para a etiqueta vizinha.'],
        ['Grupo com nome', 'Envolva os chips em <code class="ds-inline-code">role="group"</code> com <code class="ds-inline-code">aria-label</code> (“Filtrar por status”).'],
        ['Não só cor', 'O filtro ligado mostra um check, além do fundo. O resultado do filtro é anunciado numa região viva.'],
        ['Alvo confortável', '36 px no médio; o pequeno (30 px) deve ficar em barras com espaço entre os chips.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Tudo o que o chip consome.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.border.control', 'Contorno'],
        ['color.border.strong', 'Contorno no hover e selecionado'],
        ['color.bg.hover', 'Hover'],
        ['color.bg.selected', 'Selecionado e aberto'],
        ['color.fg.default', 'Rótulo'],
        ['color.fg.brand', 'Ícone à esquerda'],
        ['color.fg.subtle', 'Seta e botão de remover'],
        ['text.label-sm', 'Rótulo (médio)'],
        ['text.caption', 'Rótulo (pequeno)'],
        ['radius.full', 'Forma de pílula'],
        ['duration.fast', 'Transição'],
        ['opacity.disabled', 'Desativado'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três regras para chips que ajudam em vez de enfeitar.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: chips para escolhas rápidas</p>
          <div class="ch-usage__preview" inert>${chip({ type: 'filter', label: 'Prontos', state: 'selected', size: 'sm' })}${chip({ type: 'filter', label: 'Em revisão', size: 'sm' })}${chip({ type: 'select', label: 'Recentes', size: 'sm' })}</div>
          <p class="usage-card__text">Filtros, ordenação, etiquetas — coisas que mudam a vista, não que executam algo.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: chip como botão de ação</p>
          <div class="ch-usage__preview" inert>${chip({ type: 'filter', label: 'Publicar agora', withIcon: 'yes', iconName: 'upload' })}</div>
          <p class="usage-card__text">“Publicar”, “Excluir”, “Enviar” são ações: use botão.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Até seis por grupo</p>
          <p class="usage-card__text">Com mais opções que isso, troque por um seletor que abre menu — cabe numa linha e se lê melhor.</p>
          <pre class="ds-code ds-code--sm"><code>&lt;div class="ds-chip-group" role="group"
     aria-label="Filtrar por status"&gt;…&lt;/div&gt;</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'chip',
    controls: [
      { id: 'type', label: 'Tipo', value: 'filter', options: TYPES.map(([value, label]) => ({ value, label })) },
      { id: 'size', label: 'Tamanho', value: 'md', options: [{ value: 'md', label: 'Médio' }, { value: 'sm', label: 'Pequeno' }] },
      { id: 'withIcon', label: 'Ícone', value: 'no', options: [{ value: 'no', label: 'Sem' }, { value: 'yes', label: 'Com' }] },
      { id: 'state', label: 'Estado', value: 'selected', options: STATES.map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'label', label: 'Rótulo', value: 'Escuro' },
    render: (state) => chip(state),
    code: chipCode,
  });

  // seletor (Tipos)
  const sortChip = root.querySelector('[data-sort-chip]');
  const sortCaption = root.querySelector('[data-sort-caption]');
  const sortMenu = attachMenu(sortChip, {
    label: 'Ordenar por',
    value: 'recent',
    options: SORTS,
    onChange: (value) => {
      const label = SORTS.find((s) => s.value === value).label;
      sortChip.childNodes.forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) n.textContent = label;
      });
      sortCaption.textContent = `Ordenado por: ${label}`;
    },
  });

  // removíveis (Tipos)
  const tagsEl = root.querySelector('[data-tags]');
  let tags = [...TAGS];
  const renderTags = (focusIndex) => {
    tagsEl.innerHTML = tags.length
      ? tags.map((t) => `<span role="listitem">${chip({ type: 'removable', label: t, interactive: true })}</span>`).join('')
      : `<span class="ch-empty">Nenhuma etiqueta. <button type="button" class="ds-inline-action" data-tags-restore>${icon('refresh', { size: 16 })}Restaurar</button></span>`;
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
    const shown = ITEMS.filter(([, s]) => active.size === 0 || active.has(s));
    statusList.innerHTML = shown.map(([name, s]) => `<li class="ch-filter__item"><span>${name}</span>${statusBadge(s)}</li>`).join('');
    statusCount.textContent = `Mostrando ${shown.length} de ${ITEMS.length}`;
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
      tags = [...TAGS];
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
