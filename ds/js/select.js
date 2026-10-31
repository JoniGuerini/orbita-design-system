/**
 * Seleção personalizada — melhoria progressiva de um <select> real.
 *
 *   <label class="ds-form-field__label" for="idioma">Idioma</label>
 *   <select id="idioma" name="idioma" data-ds-select
 *           data-size="sm|lg" data-icon="globe"                 ← aparência
 *           data-search data-search-placeholder="Buscar país"  ← campo de busca no topo da lista
 *           multiple data-display="chips|count" data-max="3"   ← múltipla escolha
 *           data-footer data-placeholder="Escolha…">           ← rodapé (todos/limpar) e texto vazio
 *     <option value="">Escolha um idioma</option>             ← (único) opção vazia = placeholder
 *     <optgroup label="Américas"><option>…</option></optgroup>
 *   </select>
 *
 *   const off = mountSelects(document);       // liga todo select[data-ds-select]; off() desfaz
 *   const s = enhanceSelect(el, { search: true, max: 3 });   // opções também podem vir por JS
 *   s.open(); s.close(); s.sync(); s.destroy(); s.trigger; s.control; s.select
 *
 * O <select> continua no DOM (escondido, fora do foco e da árvore de acessibilidade) e guarda o valor:
 * envio de formulário, validação nativa (required) e o evento "change" seguem funcionando.
 *
 * Padrões ARIA
 * - Único, sem busca: "select-only combobox" — gatilho role="combobox" + popup role="listbox".
 * - Com busca: o campo de busca vira o combobox (aria-autocomplete="list"); o gatilho mantém aria-expanded.
 * - Múltipla: listbox com aria-multiselectable="true"; Espaço e Enter alternam sem fechar.
 */
import { icon } from '../icons/icons.js';
import { msg } from './i18n.js';

let uid = 0;
let current = null;
const instances = new WeakMap();

const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Destaca o trecho encontrado sem mudar o texto lido pelo leitor de tela. */
function highlight(label, query) {
  if (!query) return escape(label);
  const at = normalize(label).indexOf(query);
  if (at < 0) return escape(label);
  return `${escape(label.slice(0, at))}<span class="ds-select-popup__match">${escape(label.slice(at, at + query.length))}</span>${escape(label.slice(at + query.length))}`;
}

export function enhanceSelect(select, config = {}) {
  if (instances.has(select)) return instances.get(select);

  const multiple = select.multiple;
  const opts = {
    search: config.search ?? select.hasAttribute('data-search'),
    searchPlaceholder: config.searchPlaceholder ?? select.dataset.searchPlaceholder ?? msg('select.search'),
    display: config.display ?? select.dataset.display ?? 'chips',
    max: Number(config.max ?? select.dataset.max) || Infinity,
    footer: config.footer ?? select.hasAttribute('data-footer'),
    placeholder: config.placeholder ?? select.dataset.placeholder ?? (multiple ? msg('select.placeholderMultiple') : ''),
  };

  const id = select.id || `ds-select-${++uid}`;
  select.id = id;
  const listId = `${id}-listbox`;
  const size = select.dataset.size;
  const iconName = select.dataset.icon;

  /* ───────── Estrutura ───────── */

  const wrapper = document.createElement('div');
  wrapper.className = ['ds-select', size && size !== 'md' && `ds-select--${size}`, multiple && 'ds-select--multiple'].filter(Boolean).join(' ');
  if (select.dataset.dsState) wrapper.dataset.state = select.dataset.dsState;
  select.before(wrapper);
  wrapper.append(select);

  const prev = { tabindex: select.getAttribute('tabindex'), ariaHidden: select.getAttribute('aria-hidden') };
  select.classList.add('ds-select__native');
  select.setAttribute('data-enhanced', '');
  select.setAttribute('tabindex', '-1');
  select.setAttribute('aria-hidden', 'true');

  const leadIcon = iconName ? icon(iconName, { size: size === 'sm' ? 16 : 18, className: 'ds-select__icon' }) : '';
  const chevron = icon('chevron-down', { size: 16, className: 'ds-select__chevron' });

  // trigger = elemento com role="combobox" que recebe o foco; control = a caixa visual
  let trigger;
  let control;
  let valueEl;
  let chipsEl;
  let summaryEl;
  let srEl;
  let clearBtn;

  if (!multiple) {
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ds-select__trigger';
    trigger.innerHTML = `${leadIcon}<span class="ds-select__value"></span>${chevron}`;
    wrapper.append(trigger);
    control = trigger;
    valueEl = trigger.querySelector('.ds-select__value');
  } else {
    control = document.createElement('div');
    control.className = 'ds-select__trigger ds-select__trigger--multi';
    control.innerHTML = `${leadIcon}
      <div class="ds-select__values">
        ${opts.display === 'chips' ? '<ul class="ds-select__chips" role="list"></ul>' : ''}
        <button type="button" class="ds-select__combobox"><span class="ds-select__summary"></span><span class="ds-visually-hidden" data-sr></span></button>
      </div>
      <button type="button" class="ds-select__clear" tabindex="-1" aria-label="${msg('select.clear')}" hidden>${icon('x', { size: 14 })}</button>
      ${chevron}`;
    wrapper.append(control);
    trigger = control.querySelector('.ds-select__combobox');
    chipsEl = control.querySelector('.ds-select__chips');
    summaryEl = control.querySelector('.ds-select__summary');
    srEl = control.querySelector('[data-sr]');
    clearBtn = control.querySelector('.ds-select__clear');
  }

  trigger.id = `${id}-trigger`;
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', listId);

  // o rótulo passa a nomear o gatilho (e clicar nele foca o gatilho, sem abrir)
  const label = select.labels?.[0] ?? null;
  let labelId = null;
  let labelFor = null;
  const labelText = () => label?.textContent.trim() || select.getAttribute('aria-label') || '';
  const onLabelClick = (event) => {
    event.preventDefault();
    if (!trigger.disabled) trigger.focus();
  };
  if (label) {
    labelId = label.id || `${id}-label`;
    label.id = labelId;
    labelFor = label.getAttribute('for');
    label.removeAttribute('for');
    label.addEventListener('click', onLabelClick);
    trigger.setAttribute('aria-labelledby', labelId);
  } else if (select.getAttribute('aria-label')) {
    trigger.setAttribute('aria-label', select.getAttribute('aria-label'));
  }

  /* ───────── Modelo ───────── */

  const options = () => [...select.options];
  const selectedOptions = () => options().filter((o) => o.selected && !(multiple && o.value === ''));
  const limitReached = () => multiple && selectedOptions().length >= opts.max;

  // entradas da lista aberta: { index, label, group, disabled, placeholder, visible }
  let entries = new Map();

  function buildEntries() {
    entries = new Map(
      options()
        .filter((o) => !(multiple && o.value === ''))
        .map((o) => [
          o.index,
          {
            index: o.index,
            label: o.textContent.trim(),
            group: o.parentElement?.tagName === 'OPTGROUP' ? o.parentElement.label : '',
            disabled: o.disabled || Boolean(o.parentElement?.disabled),
            placeholder: !multiple && o.value === '',
            visible: true,
          },
        ]),
    );
  }

  const order = () => [...entries.keys()];

  function enabled(i) {
    const e = entries.get(i);
    if (!e || !e.visible || e.disabled) return false;
    if (limitReached() && !select.options[i].selected) return false;
    return true;
  }

  /* ───────── Gatilho: valor, chips e contagem ───────── */

  function syncAria() {
    ['aria-invalid', 'aria-describedby', 'aria-required'].forEach((attr) => {
      if (select.hasAttribute(attr)) trigger.setAttribute(attr, select.getAttribute(attr));
      else trigger.removeAttribute(attr);
    });
    if (select.required) trigger.setAttribute('aria-required', 'true');
    trigger.disabled = select.disabled;
    control.toggleAttribute('data-disabled', select.disabled);
    control.toggleAttribute('data-invalid', select.getAttribute('aria-invalid') === 'true');
  }

  function layoutChips() {
    if (!chipsEl) return;
    const chosen = selectedOptions();
    const chip = (o) => `<li class="ds-select__chip-item"><span class="ds-chip ds-chip--sm ds-chip--removable ds-select__chip">
      <span class="ds-select__chip-label">${escape(o.textContent.trim())}</span>
      <button type="button" class="ds-chip__remove" tabindex="-1" data-remove="${o.index}" aria-label="${escape(msg('common.remove', o.textContent.trim()))}"${select.disabled ? ' disabled' : ''}>${icon('x', { size: 12 })}</button>
    </span></li>`;
    chipsEl.innerHTML = chosen.map(chip).join('');
    if (!chosen.length || !wrapper.isConnected) return;

    // até 2 linhas; o que sobrar vira "+N"
    const values = control.querySelector('.ds-select__values');
    const first = chipsEl.querySelector('.ds-select__chip-item');
    const line = first.offsetHeight;
    if (!line) return;
    const gap = parseFloat(getComputedStyle(values).rowGap) || 4;
    const limit = line * 2 + gap + 1;
    let hidden = 0;
    const items = [...chipsEl.querySelectorAll('.ds-select__chip-item')];
    const more = document.createElement('li');
    more.className = 'ds-select__chip-item';
    while (values.scrollHeight > limit && hidden < items.length) {
      items[items.length - 1 - hidden].hidden = true;
      hidden += 1;
      more.innerHTML = `<span class="ds-chip ds-chip--sm ds-select__more" aria-hidden="true">+${hidden}</span>`;
      if (!more.isConnected) chipsEl.append(more);
    }
  }

  function syncTrigger() {
    syncAria();
    if (!multiple) {
      const opt = select.options[select.selectedIndex];
      const placeholder = !opt || opt.value === '';
      valueEl.textContent = opt ? opt.textContent.trim() : '';
      valueEl.toggleAttribute('data-placeholder', placeholder);
      return;
    }
    const chosen = selectedOptions();
    const n = chosen.length;
    const names = chosen.map((o) => o.textContent.trim()).join(', ');
    clearBtn.hidden = n === 0 || select.disabled;
    if (opts.display === 'count') {
      summaryEl.textContent = n ? msg('select.selected', n) : opts.placeholder;
      srEl.textContent = n ? `: ${names}` : '';
    } else {
      summaryEl.textContent = n ? '' : opts.placeholder;
      srEl.textContent = n ? `${msg('select.selected', n)}: ${names}` : '';
      layoutChips();
    }
    summaryEl.toggleAttribute('data-placeholder', n === 0);
  }

  /* ───────── Popup ───────── */

  let popup = null;
  let listEl = null;
  let searchEl = null;
  let active = -1;
  let typed = '';
  let typedTimer = 0;
  const focusEl = () => (popup && searchEl) || trigger;

  function optionMarkup(e) {
    const selected = select.options[e.index].selected;
    return `<div class="ds-select-popup__option${e.placeholder ? ' ds-select-popup__option--placeholder' : ''}" role="option" id="${id}-opt-${e.index}" data-index="${e.index}" aria-selected="${selected}"${e.disabled ? ' aria-disabled="true"' : ''}>
      ${multiple ? '<span class="ds-select-popup__box" aria-hidden="true"></span>' : ''}
      <span class="ds-select-popup__label" data-label>${escape(e.label)}</span>
      ${multiple ? '' : icon('check', { size: 16, className: 'ds-select-popup__check' })}
    </div>`;
  }

  function renderPopup() {
    buildEntries();
    popup = document.createElement('div');
    popup.className = ['ds-select-popup', multiple && 'ds-select-popup--multiple', opts.search && 'ds-select-popup--search'].filter(Boolean).join(' ');

    let g = 0;
    const body = [...select.children]
      .map((child) => {
        if (child.tagName === 'OPTGROUP') {
          const gid = `${id}-group-${g++}`;
          const items = [...child.children].filter((o) => entries.has(o.index)).map((o) => optionMarkup(entries.get(o.index))).join('');
          return items ? `<div role="group" aria-labelledby="${gid}" data-group><div class="ds-select-popup__group" id="${gid}" role="presentation">${escape(child.label)}</div>${items}</div>` : '';
        }
        return child.tagName === 'OPTION' && entries.has(child.index) ? optionMarkup(entries.get(child.index)) : '';
      })
      .join('');

    const name = labelText();
    popup.innerHTML = `
      ${opts.search ? `<div class="ds-select-popup__search"><div class="ds-field ds-field--sm">${icon('search', { size: 16 })}<input class="ds-field__input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="${listId}"${name ? ` aria-label="${escape(msg('select.searchIn', name))}"` : ''} placeholder="${escape(opts.searchPlaceholder)}" autocomplete="off" spellcheck="false"></div></div>` : ''}
      <div class="ds-select-popup__list" role="listbox" id="${listId}" tabindex="-1"${labelId ? ` aria-labelledby="${labelId}"` : ''}${multiple ? ' aria-multiselectable="true"' : ''}>${body}</div>
      <p class="ds-select-popup__empty" role="status" hidden></p>
      ${multiple && Number.isFinite(opts.max) ? `<p class="ds-select-popup__note" hidden>${icon('info', { size: 14 })}<span>Limite de ${opts.max}. Desmarque uma opção para escolher outra.</span></p>` : ''}
      ${multiple && opts.footer ? `<div class="ds-select-popup__footer"><span class="ds-select-popup__count" aria-live="polite"></span><span class="ds-select-popup__actions"><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" tabindex="-1" data-select-all>Selecionar todos</button><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" tabindex="-1" data-clear-all>Limpar</button></span></div>` : ''}`;
    document.body.append(popup);
    listEl = popup.querySelector('.ds-select-popup__list');
    searchEl = popup.querySelector('.ds-select-popup__search input');
    refreshOptions();
  }

  const optionEl = (i) => listEl?.querySelector(`[data-index="${i}"]`);

  /** Atualiza seleção, limite, contagem e rodapé da lista aberta. */
  function refreshOptions() {
    if (!popup) return;
    const limit = limitReached();
    entries.forEach((e) => {
      const el = optionEl(e.index);
      if (!el) return;
      const selected = select.options[e.index].selected;
      el.setAttribute('aria-selected', String(selected));
      const off = e.disabled || (limit && !selected);
      if (off) el.setAttribute('aria-disabled', 'true');
      else el.removeAttribute('aria-disabled');
    });
    const note = popup.querySelector('.ds-select-popup__note');
    if (note) note.hidden = !limit;
    const count = popup.querySelector('.ds-select-popup__count');
    if (count) {
      const n = selectedOptions().length;
      count.textContent = Number.isFinite(opts.max) ? msg('select.count', n, opts.max) : msg('select.selected', n);
      popup.querySelector('[data-clear-all]').disabled = n === 0;
      popup.querySelector('[data-select-all]').disabled = limit || ![...entries.values()].some((e) => enabled(e.index) && !select.options[e.index].selected);
    }
  }

  function applyFilter() {
    if (!popup) return;
    const raw = searchEl?.value.trim() ?? '';
    const query = normalize(raw);
    let visible = 0;
    entries.forEach((e) => {
      e.visible = !query || (!e.placeholder && (normalize(e.label).includes(query) || normalize(e.group).includes(query)));
      const el = optionEl(e.index);
      if (!el) return;
      el.hidden = !e.visible;
      el.querySelector('[data-label]').innerHTML = highlight(e.label, query);
      if (e.visible) visible += 1;
    });
    listEl.querySelectorAll('[data-group]').forEach((group) => {
      group.hidden = !group.querySelector('[role="option"]:not([hidden])');
    });
    const empty = popup.querySelector('.ds-select-popup__empty');
    empty.hidden = visible > 0;
    empty.textContent = visible ? '' : msg('select.empty', raw);
    listEl.hidden = visible === 0;
    if (!enabled(active)) setActive(first());
    refreshOptions();
    position();
  }

  function position() {
    if (!popup) return;
    const r = control.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const below = innerHeight - r.bottom - gap - margin;
    const above = r.top - gap - margin;
    const cap = opts.search || opts.footer ? 380 : 320;
    popup.style.maxHeight = 'none';
    const natural = Math.min(popup.scrollHeight, cap);
    const up = below < Math.min(natural, 200) && above > below;
    const maxH = Math.max(140, Math.min(cap, up ? above : below));
    popup.style.minWidth = `${Math.round(r.width)}px`;
    popup.style.maxWidth = `${Math.max(Math.round(r.width), Math.min(420, innerWidth - 2 * margin))}px`;
    popup.style.maxHeight = `${Math.round(maxH)}px`;
    const height = Math.min(popup.scrollHeight, maxH);
    const width = popup.getBoundingClientRect().width;
    const x = Math.min(Math.max(margin, r.left), innerWidth - width - margin);
    const y = up ? r.top - gap - height : r.bottom + gap;
    popup.dataset.placement = up ? 'top' : 'bottom';
    popup.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
  }

  function setActive(i, { scroll = true } = {}) {
    if (!popup) return;
    listEl.querySelector('[data-active]')?.removeAttribute('data-active');
    active = i;
    const el = optionEl(i);
    const target = focusEl();
    if (!el || el.hidden) {
      target.removeAttribute('aria-activedescendant');
      return;
    }
    el.setAttribute('data-active', '');
    target.setAttribute('aria-activedescendant', el.id);
    if (scroll) el.scrollIntoView({ block: 'nearest' });
  }

  function move(from, step) {
    const list = order();
    const pos = list.indexOf(from);
    const start = pos < 0 ? (step > 0 ? -1 : list.length) : pos;
    for (let p = start + step; p >= 0 && p < list.length; p += step) if (enabled(list[p])) return list[p];
    return from;
  }

  const first = () => {
    const list = order();
    return list.find((i) => enabled(i)) ?? -1;
  };
  const last = () => {
    const list = order();
    return [...list].reverse().find((i) => enabled(i)) ?? -1;
  };

  function initialActive(target) {
    if (target === 'first') return first();
    if (target === 'last') return last();
    if (multiple) return selectedOptions().map((o) => o.index).find((i) => enabled(i)) ?? first();
    return enabled(select.selectedIndex) ? select.selectedIndex : first();
  }

  function open(target, seed = '') {
    if (popup || trigger.disabled) return;
    if (current && current !== api) current.close();
    current = api;
    renderPopup();
    position();
    trigger.setAttribute('aria-expanded', 'true');
    wrapper.setAttribute('data-open', '');
    const start = initialActive(target);
    setActive(start);
    optionEl(start)?.scrollIntoView({ block: 'center' });
    requestAnimationFrame(() => popup?.setAttribute('data-open', ''));

    if (searchEl) {
      searchEl.focus({ preventScroll: true });
      if (seed) {
        searchEl.value = seed;
        applyFilter();
      }
      searchEl.addEventListener('input', applyFilter);
      searchEl.addEventListener('keydown', onSearchKeyDown);
    }
    popup.addEventListener('pointermove', onPopupMove);
    popup.addEventListener('click', onPopupClick);
    popup.addEventListener('mousedown', preventBlur);
    popup.addEventListener('focusout', onFocusOut);
    document.addEventListener('pointerdown', onOutside, true);
    document.addEventListener('scroll', onScroll, true);
    addEventListener('resize', onResize);
  }

  function close({ focus = false } = {}) {
    if (!popup) return;
    const el = popup;
    const hadFocusInside = el.contains(document.activeElement);
    popup = null;
    listEl = null;
    searchEl = null;
    active = -1;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    wrapper.removeAttribute('data-open');
    el.removeAttribute('data-open');
    el.removeEventListener('pointermove', onPopupMove);
    el.removeEventListener('click', onPopupClick);
    el.removeEventListener('mousedown', preventBlur);
    el.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('pointerdown', onOutside, true);
    document.removeEventListener('scroll', onScroll, true);
    removeEventListener('resize', onResize);
    setTimeout(() => el.remove(), reduced() ? 0 : 160);
    if (current === api) current = null;
    if (focus || hadFocusInside) trigger.focus({ preventScroll: true });
  }

  /* ───────── Escolher ───────── */

  function emit() {
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function choose(i) {
    if (!enabled(i)) return;
    const changed = select.selectedIndex !== i;
    select.selectedIndex = i;
    syncTrigger();
    if (changed) emit();
  }

  function toggle(i) {
    const opt = select.options[i];
    if (!opt || (!opt.selected && !enabled(i)) || entries.get(i)?.disabled) return;
    opt.selected = !opt.selected;
    if (select.getAttribute('aria-invalid') === 'true' && selectedOptions().length) select.removeAttribute('aria-invalid');
    syncTrigger();
    refreshOptions();
    emit();
    if (popup) position();
  }

  function setMany(fn) {
    let changed = false;
    fn((opt, value) => {
      if (opt.selected !== value) {
        opt.selected = value;
        changed = true;
      }
    });
    if (!changed) return;
    syncTrigger();
    refreshOptions();
    emit();
    if (popup) position();
  }

  const selectAllVisible = () =>
    setMany((set) => {
      for (const e of entries.values()) {
        if (!e.visible || e.disabled) continue;
        if (selectedOptions().length >= opts.max) break;
        set(select.options[e.index], true);
      }
    });

  const clearAll = () => setMany((set) => selectedOptions().forEach((o) => set(o, false)));

  const removeLast = () => {
    const chosen = selectedOptions();
    if (chosen.length) toggle(chosen[chosen.length - 1].index);
  };

  /* ───────── Busca por letra (sem campo de busca) ───────── */

  function typeahead(char) {
    clearTimeout(typedTimer);
    typed += normalize(char);
    typedTimer = setTimeout(() => (typed = ''), 600);
    if (!popup) buildEntries();
    const list = order();
    const from = popup ? active : multiple ? -1 : select.selectedIndex;
    const query = typed.split('').every((c) => c === typed[0]) ? typed[0] : typed;
    const pos = Math.max(-1, list.indexOf(from));
    const rotated = list.map((_, k) => list[(pos + 1 + k) % list.length]);
    return rotated.find((i) => enabled(i) && normalize(entries.get(i).label).startsWith(query)) ?? -1;
  }

  /* ───────── Eventos ───────── */

  const preventBlur = (event) => {
    if (!event.target.closest('input')) event.preventDefault();
  };

  function onPopupMove(event) {
    const el = event.target.closest('[role="option"]');
    if (el && !el.hasAttribute('aria-disabled') && Number(el.dataset.index) !== active) setActive(Number(el.dataset.index), { scroll: false });
  }

  function onPopupClick(event) {
    if (event.target.closest('[data-select-all]')) return selectAllVisible();
    if (event.target.closest('[data-clear-all]')) return clearAll();
    const el = event.target.closest('[role="option"]');
    if (!el || el.hasAttribute('aria-disabled')) return;
    const i = Number(el.dataset.index);
    if (multiple) {
      toggle(i);
      setActive(i, { scroll: false });
      return;
    }
    choose(i);
    close({ focus: true });
  }

  function onOutside(event) {
    if (!popup || popup.contains(event.target) || wrapper.contains(event.target)) return;
    close();
  }

  function onScroll(event) {
    if (popup && !popup.contains(event.target)) close();
  }

  const onResize = () => close();

  function onFocusOut(event) {
    if (!popup) return;
    const to = event.relatedTarget;
    if (to && (popup.contains(to) || wrapper.contains(to))) return;
    close();
  }

  function onControlClick(event) {
    if (select.disabled) return;
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      event.stopPropagation();
      toggle(Number(remove.dataset.remove));
      if (!popup) trigger.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest('.ds-select__clear')) {
      clearAll();
      trigger.focus({ preventScroll: true });
      return;
    }
    if (popup) close({ focus: true });
    else {
      if (!opts.search) trigger.focus({ preventScroll: true });
      open();
    }
  }

  const printable = (event) => event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey;

  /** Teclas com a lista aberta — compartilhado pelo gatilho e pelo campo de busca. */
  function listKeys(event, inSearch) {
    const { key } = event;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setActive(move(active, 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey && !multiple) {
          choose(active);
          close({ focus: true });
        } else setActive(move(active, -1));
        return;
      case 'Home':
      case 'End':
        if (inSearch) return; // no campo de busca, Home/End movem o cursor do texto
        event.preventDefault();
        setActive(key === 'Home' ? first() : last());
        return;
      case 'PageDown':
      case 'PageUp': {
        event.preventDefault();
        let i = active;
        for (let n = 0; n < 10; n++) i = move(i, key === 'PageDown' ? 1 : -1);
        setActive(i);
        return;
      }
      case 'Enter':
        event.preventDefault();
        if (multiple) toggle(active);
        else {
          choose(active);
          close({ focus: true });
        }
        return;
      case ' ':
        if (inSearch) return; // na busca, Espaço digita
        event.preventDefault();
        if (multiple) toggle(active);
        else {
          choose(active);
          close();
        }
        return;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        if (inSearch && searchEl.value) {
          searchEl.value = '';
          applyFilter();
        } else close({ focus: true });
        return;
      case 'Tab':
        // único sem busca: escolhe a ativa e segue; nos demais, só fecha e segue
        if (!multiple && !inSearch) choose(active);
        close();
        trigger.focus({ preventScroll: true }); // o Tab padrão continua a partir do gatilho
        return;
      case 'Backspace':
        if (inSearch && multiple && !searchEl.value) {
          event.preventDefault();
          removeLast();
        }
        return;
      default:
        if (multiple && !inSearch && (event.metaKey || event.ctrlKey) && key.toLowerCase() === 'a') {
          event.preventDefault();
          selectAllVisible();
        } else if (!inSearch && printable(event)) {
          const hit = typeahead(key);
          if (hit >= 0) setActive(hit);
        }
    }
  }

  function onTriggerKeyDown(event) {
    const { key } = event;
    if (popup) {
      if (!searchEl) listKeys(event, false);
      return;
    }
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
      event.preventDefault();
      open();
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      open(key === 'Home' ? 'first' : 'last');
    } else if (multiple && (key === 'Backspace' || key === 'Delete')) {
      event.preventDefault();
      removeLast();
    } else if (printable(event)) {
      if (opts.search) {
        event.preventDefault();
        open(undefined, key); // começa a busca com a tecla digitada
      } else {
        const hit = typeahead(key);
        if (hit >= 0) {
          open();
          setActive(hit);
        }
      }
    }
  }

  const onSearchKeyDown = (event) => listKeys(event, true);

  // validação nativa: o select escondido não recebe foco — o gatilho assume
  function onInvalid(event) {
    event.preventDefault();
    trigger.setAttribute('aria-invalid', 'true');
    control.setAttribute('data-invalid', '');
    trigger.focus();
  }

  const onNativeChange = () => {
    syncTrigger();
    refreshOptions();
  };
  const onReset = () => setTimeout(syncTrigger);

  // largura muda → recalcula as linhas de chips
  let lastWidth = 0;
  const resizeObserver =
    multiple && opts.display === 'chips' && 'ResizeObserver' in window
      ? new ResizeObserver(([entry]) => {
          const w = Math.round(entry.contentRect.width);
          if (w !== lastWidth) {
            lastWidth = w;
            layoutChips();
          }
        })
      : null;
  resizeObserver?.observe(control);

  if (multiple) control.addEventListener('click', onControlClick);
  else trigger.addEventListener('click', onControlClick);
  trigger.addEventListener('keydown', onTriggerKeyDown);
  trigger.addEventListener('focusout', onFocusOut);
  select.addEventListener('invalid', onInvalid);
  select.addEventListener('change', onNativeChange);
  select.form?.addEventListener('reset', onReset);

  syncTrigger();

  const api = {
    trigger,
    control,
    select,
    open: () => open(),
    close: () => close(),
    sync: () => {
      syncTrigger();
      refreshOptions();
    },
    destroy() {
      close();
      resizeObserver?.disconnect();
      control.remove();
      wrapper.before(select);
      wrapper.remove();
      select.classList.remove('ds-select__native');
      select.removeAttribute('data-enhanced');
      prev.tabindex === null ? select.removeAttribute('tabindex') : select.setAttribute('tabindex', prev.tabindex);
      prev.ariaHidden === null ? select.removeAttribute('aria-hidden') : select.setAttribute('aria-hidden', prev.ariaHidden);
      select.removeEventListener('invalid', onInvalid);
      select.removeEventListener('change', onNativeChange);
      select.form?.removeEventListener('reset', onReset);
      if (label) {
        label.removeEventListener('click', onLabelClick);
        if (labelFor) label.setAttribute('for', labelFor);
      }
      instances.delete(select);
    },
  };
  instances.set(select, api);
  return api;
}

/** Liga todo select[data-ds-select] dentro de root. Devolve uma função que desfaz tudo. */
export function mountSelects(root = document) {
  const list = [...root.querySelectorAll('select[data-ds-select]')].map((el) => enhanceSelect(el));
  return () => list.forEach((s) => s.destroy());
}
