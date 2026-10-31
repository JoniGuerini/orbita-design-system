/**
 * Barra de filtros: busca, filtros de escolha única, filtros liga/desliga, ordenação,
 * filtros ativos removíveis, "Limpar tudo" e a contagem de resultados (anunciada).
 *
 *   const filters = createFilters(document.querySelector('#filtros'), {
 *     label: 'Filtrar pedidos',
 *     search: { placeholder: 'Buscar por cliente ou número' },       // false = sem busca
 *     fields: [{ id: 'status', label: 'Status', options: [{ value: 'pago', label: 'Pago' }, …] }],
 *     toggles: [{ id: 'desconto', label: 'Com desconto' }],
 *     sort: { id: 'ordem', label: 'Ordenar', options: [...], value: 'recentes' },
 *     value: { status: 'pago' },                                      // estado inicial
 *     noun: ['pedido', 'pedidos'],
 *     onChange: (state) => { …; filters.setCount(mostrados, total); },
 *   });
 *   filters.state · filters.set({ status: '' }) · filters.clear() · filters.setCount(n, total)
 *   filters.focusSearch() · filters.destroy()
 *
 *   filtersToQuery(state, config)   → 'q=ana&status=pago'   (só o que difere do padrão)
 *   filtersFromQuery(query, config) → estado               (para restaurar a partir da URL)
 *
 * A ordenação muda a ordem, não o conjunto: não aparece em "Filtros ativos" nem conta para "Limpar tudo".
 */
import { icon } from '../icons/icons.js';
import { attachMenu } from './menu.js';
import { msg, formatNumber } from './i18n.js';

let uid = 0;
const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function defaults({ search, fields = [], toggles = [], sort } = {}) {
  const state = {};
  if (search !== false) state.q = '';
  fields.forEach((f) => (state[f.id] = ''));
  toggles.forEach((t) => (state[t.id] = false));
  if (sort) state[sort.id] = sort.value ?? sort.options[0]?.value ?? '';
  return state;
}

export function filtersToQuery(state, config) {
  const base = defaults(config);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    if (!(key in base) || value === base[key]) continue;
    params.set(key, value === true ? '1' : String(value).trim());
  }
  return params.toString();
}

export function filtersFromQuery(query, config) {
  const state = defaults(config);
  const params = new URLSearchParams(query);
  const fields = config.fields ?? [];
  const toggles = config.toggles ?? [];
  if ('q' in state && params.has('q')) state.q = params.get('q');
  fields.forEach((f) => {
    const v = params.get(f.id);
    if (v && f.options.some((o) => o.value === v)) state[f.id] = v;
  });
  toggles.forEach((t) => (state[t.id] = params.get(t.id) === '1'));
  if (config.sort) {
    const v = params.get(config.sort.id);
    if (v && config.sort.options.some((o) => o.value === v)) state[config.sort.id] = v;
  }
  return state;
}

export function createFilters(host, config) {
  const { label = msg('filters.label'), search = {}, fields = [], toggles = [], sort, noun, onChange } = config;
  const id = `ds-filters-${++uid}`;
  const base = defaults(config);
  let state = { ...base, ...(config.value ?? {}) };
  let count = null;

  const optionLabel = (field, value) => field.options.find((o) => o.value === value)?.label ?? '';
  const plural = (n) => (noun ? `${formatNumber(n)} ${n === 1 ? noun[0] : noun[1]}` : msg('filters.results', n));

  host.innerHTML = `<div class="ds-filters" role="search" aria-label="${escape(label)}">
    <div class="ds-filters__bar">
      ${
        search !== false
          ? `<label class="ds-field ds-filters__search">
              ${icon('search', { size: 18 })}
              <input class="ds-field__input" type="search" data-filter-search placeholder="${escape(search.placeholder ?? msg('common.search'))}" aria-label="${escape(search.label ?? search.placeholder ?? msg('common.search'))}" autocomplete="off" spellcheck="false">
              <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-field__action" data-filter-clear-search aria-label="${msg('filters.clearSearch')}" hidden>${icon('x', { size: 16 })}</button>
            </label>`
          : ''
      }
      <div class="ds-filters__controls">
        ${fields
          .map(
            (f) => `<button type="button" class="ds-chip ds-filters__field" data-filter-field="${escape(f.id)}">
              ${f.icon ? `<span class="ds-chip__icon">${icon(f.icon, { size: 16 })}</span>` : ''}<span data-label></span>
              <span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>
            </button>`,
          )
          .join('')}
        ${toggles
          .map(
            (t) => `<button type="button" class="ds-chip" data-filter-toggle="${escape(t.id)}" aria-pressed="false">
              <span class="ds-chip__check">${icon('check', { size: 16 })}</span>${escape(t.label)}
            </button>`,
          )
          .join('')}
      </div>
      ${
        sort
          ? `<button type="button" class="ds-chip ds-filters__sort" data-filter-sort>
              <span class="ds-chip__icon">${icon('sliders', { size: 16 })}</span><span data-label></span>
              <span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>
            </button>`
          : ''
      }
    </div>
    <div class="ds-filters__summary">
      <p class="ds-filters__count" id="${id}-count" role="status" aria-live="polite" aria-atomic="true"></p>
      <ul class="ds-filters__active" role="list" aria-label="${msg('filters.active')}" data-filter-active></ul>
      <button type="button" class="ds-inline-action ds-filters__clear" data-filter-clear hidden>${icon('x', { size: 14 })}${msg('filters.clearAll')}</button>
    </div>
  </div>`;

  const root = host.firstElementChild;
  const input = root.querySelector('[data-filter-search]');
  const clearSearch = root.querySelector('[data-filter-clear-search]');
  const activeList = root.querySelector('[data-filter-active]');
  const clearAll = root.querySelector('[data-filter-clear]');
  const countEl = root.querySelector(`#${id}-count`);

  const menus = fields.map((f) => {
    const chip = root.querySelector(`[data-filter-field="${CSS.escape(f.id)}"]`);
    const menu = attachMenu(chip, {
      label: f.label,
      value: state[f.id],
      options: [{ value: '', label: f.allLabel ?? msg('filters.all') }, ...f.options],
      onChange: (value) => set({ [f.id]: value }),
    });
    return { f, chip, menu };
  });

  let sortMenu = null;
  if (sort) {
    const chip = root.querySelector('[data-filter-sort]');
    sortMenu = attachMenu(chip, { label: sort.label ?? msg('filters.sort'), value: state[sort.id], options: sort.options, onChange: (value) => set({ [sort.id]: value }) });
  }

  /** Filtros ativos: busca, escolhas e liga/desliga (a ordenação fica de fora). */
  function actives() {
    const list = [];
    if (input && state.q.trim()) list.push({ key: 'q', text: `“${state.q.trim()}”`, reset: { q: '' } });
    fields.forEach((f) => state[f.id] && list.push({ key: f.id, text: `${f.label}: ${optionLabel(f, state[f.id])}`, reset: { [f.id]: '' } }));
    toggles.forEach((t) => state[t.id] && list.push({ key: t.id, text: t.label, reset: { [t.id]: false } }));
    return list;
  }

  function paint() {
    if (input && input.value !== state.q) input.value = state.q;
    if (clearSearch) clearSearch.hidden = !state.q;
    menus.forEach(({ f, chip, menu }) => {
      const v = state[f.id];
      chip.querySelector('[data-label]').textContent = v ? `${f.label}: ${optionLabel(f, v)}` : f.label;
      chip.toggleAttribute('data-active', !!v);
      menu.setValue(v);
    });
    toggles.forEach((t) => root.querySelector(`[data-filter-toggle="${CSS.escape(t.id)}"]`).setAttribute('aria-pressed', String(!!state[t.id])));
    if (sort) {
      const chip = root.querySelector('[data-filter-sort]');
      chip.querySelector('[data-label]').textContent = `${sort.label ?? msg('filters.sort')}: ${sort.options.find((o) => o.value === state[sort.id])?.label ?? ''}`;
      sortMenu.setValue(state[sort.id]);
    }
    const list = actives();
    activeList.innerHTML = list
      .map(
        (a) => `<li><span class="ds-chip ds-chip--sm ds-chip--removable">${escape(a.text)}<button type="button" class="ds-chip__remove" data-filter-remove="${escape(a.key)}" aria-label="${escape(msg('filters.remove', a.text))}">${icon('x', { size: 14 })}</button></span></li>`,
      )
      .join('');
    activeList.hidden = !list.length;
    clearAll.hidden = !list.length;
    root.toggleAttribute('data-filtered', !!list.length);
  }

  function emit() {
    paint();
    onChange?.({ ...state });
  }

  function set(partial) {
    state = { ...state, ...partial };
    emit();
  }

  function clear() {
    const keep = sort ? { [sort.id]: state[sort.id] } : {};
    state = { ...base, ...keep };
    emit();
  }

  let timer;
  const onInput = () => {
    clearTimeout(timer);
    if (clearSearch) clearSearch.hidden = !input.value;
    timer = setTimeout(() => set({ q: input.value }), search.debounce ?? 150);
  };
  const onClick = (event) => {
    const toggle = event.target.closest('[data-filter-toggle]');
    if (toggle) set({ [toggle.dataset.filterToggle]: toggle.getAttribute('aria-pressed') !== 'true' });

    const remove = event.target.closest('[data-filter-remove]');
    if (remove) {
      const items = [...activeList.querySelectorAll('[data-filter-remove]')];
      const at = items.indexOf(remove);
      const a = actives().find((x) => x.key === remove.dataset.filterRemove);
      if (a) set(a.reset);
      // o foco segue para o próximo filtro ativo — ou para a busca, se não sobrar nenhum
      const next = activeList.querySelectorAll('[data-filter-remove]')[Math.min(at, activeList.childElementCount - 1)];
      (next ?? input ?? root.querySelector('button'))?.focus();
    }

    if (event.target.closest('[data-filter-clear]')) {
      clear();
      (input ?? root.querySelector('button'))?.focus();
    }

    if (event.target.closest('[data-filter-clear-search]')) {
      clearTimeout(timer);
      set({ q: '' });
      input.focus();
    }
  };
  const onKeydown = (event) => {
    if (event.key === 'Escape' && input && event.target === input && input.value) {
      event.preventDefault();
      clearTimeout(timer);
      set({ q: '' });
    }
  };

  input?.addEventListener('input', onInput);
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKeydown);
  paint();

  return {
    el: root,
    get state() {
      return { ...state };
    },
    set,
    clear,
    /** Contagem anunciada: "8 de 24 pedidos" com filtro, "24 pedidos" sem. */
    setCount(shown, total = shown) {
      const text = actives().length || shown !== total ? msg('filters.shownOf', shown, plural(total)) : plural(total);
      if (text === count) return;
      count = text;
      countEl.textContent = text;
    },
    focusSearch: () => input?.focus(),
    destroy() {
      clearTimeout(timer);
      menus.forEach(({ menu }) => menu.destroy());
      sortMenu?.destroy();
      input?.removeEventListener('input', onInput);
      host.innerHTML = '';
    },
  };
}
