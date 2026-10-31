/**
 * Paleta de comandos (⌘K / Ctrl K / "/").
 *
 * const palette = createCommandPalette({
 *   items: () => [{ id, label, group, icon, keywords?, description?, hint?, perform }],
 *   placeholder: 'Buscar…',
 *   label: 'Busca rápida',     // nome do diálogo para leitores de tela
 *   hotkeys: true,             // false = só abre por palette.open() (ex.: uma paleta de demonstração)
 * });
 * palette.open(); palette.close(); palette.isOpen(); palette.destroy(); palette.modifierLabel  // '⌘' ou 'Ctrl'
 *
 * filterCommands(items, query) → itens encontrados, na ordem da paleta (útil para testar a busca).
 * Padrão ARIA: combobox + listbox com aria-activedescendant.
 */
import { icon } from '../icons/icons.js';

const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const isTyping = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]');
const isMac = navigator.platform.includes('Mac');

/**
 * Sem acento e sem maiúscula; todas as palavras precisam aparecer (rótulo, grupo, descrição ou keywords).
 * Ordem: rótulo que começa com a busca (3) → rótulo que contém (2) → só nos outros campos (1).
 */
export function scoreCommand(item, query) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const full = words.join(' ');
  const label = normalize(item.label);
  const haystack = `${label} ${normalize(item.group)} ${normalize(item.description)} ${normalize((item.keywords ?? []).join(' '))}`;
  if (!words.every((w) => haystack.includes(w))) return -1;
  return label.startsWith(full) ? 3 : label.includes(full) ? 2 : 1;
}

export function filterCommands(items, query) {
  if (!normalize(query).trim()) return items;
  return items
    .map((item) => ({ item, score: scoreCommand(item, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}

let instances = 0;

export function createCommandPalette({ items, placeholder = 'Buscar páginas, tokens e ações…', label = 'Busca rápida', hotkeys = true }) {
  // a primeira paleta mantém os ids de sempre; as outras ganham sufixo (sem ids repetidos)
  const n = ++instances;
  const pre = n === 1 ? 'ds-command' : `ds-command-${n}`;
  const dialog = document.createElement('dialog');
  dialog.className = 'ds-command';
  dialog.setAttribute('aria-label', label);
  dialog.innerHTML = `
    <div class="ds-command__search">
      ${icon('search', { size: 20 })}
      <input class="ds-command__input" type="text" role="combobox" aria-expanded="true" aria-controls="${pre}-list"
        aria-autocomplete="list" autocomplete="off" spellcheck="false" aria-label="${escape(label)}" placeholder="${escape(placeholder)}">
      <kbd class="ds-kbd">Esc</kbd>
    </div>
    <div class="ds-command__list" id="${pre}-list" role="listbox" aria-label="Resultados"></div>
    <footer class="ds-command__footer" aria-hidden="true">
      <span><kbd class="ds-kbd">↑</kbd><kbd class="ds-kbd">↓</kbd> navegar</span>
      <span><kbd class="ds-kbd">↵</kbd> abrir</span>
      <span><kbd class="ds-kbd">Esc</kbd> fechar</span>
    </footer>`;
  document.body.append(dialog);

  const input = dialog.querySelector('.ds-command__input');
  const list = dialog.querySelector('.ds-command__list');
  let results = [];
  let active = 0;
  let returnFocus = null;

  function render() {
    const found = filterCommands(typeof items === 'function' ? items() : items, input.value);

    // agrupa mantendo a ordem de aparição; "results" segue a ordem visual
    const groups = new Map();
    for (const item of found) {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group).push(item);
    }
    results = [...groups.values()].flat();
    active = Math.min(active, Math.max(results.length - 1, 0));

    if (!results.length) {
      list.innerHTML = `<p class="ds-command__empty">Nada encontrado para “${escape(input.value)}”.</p>`;
      input.removeAttribute('aria-activedescendant');
      return;
    }

    let index = 0;
    list.innerHTML = [...groups]
      .map(([group, entries], g) => {
        const options = entries
          .map((item) => {
            const i = index++;
            return `<div class="ds-command__item" role="option" id="${pre}-option-${i}" data-index="${i}" aria-selected="false">
              ${icon(item.icon ?? 'arrow-right', { size: 18 })}
              <span class="ds-command__label">${escape(item.label)}</span>
              ${item.hint ? `<span class="ds-command__hint">${escape(item.hint)}</span>` : ''}
              ${icon('corner-down-left', { size: 16, className: 'ds-command__enter' })}
            </div>`;
          })
          .join('');
        return `<div class="ds-command__group" role="group" aria-labelledby="${pre}-group-${g}">
          <div class="ds-command__group-label" id="${pre}-group-${g}">${escape(group)}</div>${options}</div>`;
      })
      .join('');
    highlight(true);
  }

  function highlight(scroll) {
    list.querySelectorAll('[role="option"]').forEach((el) => {
      el.setAttribute('aria-selected', String(Number(el.dataset.index) === active));
    });
    const el = list.querySelector(`[data-index="${active}"]`);
    if (!el) return;
    input.setAttribute('aria-activedescendant', el.id);
    if (scroll) el.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    input.value = '';
    active = 0;
    render();
    dialog.showModal();
    input.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function run(item) {
    if (!item) return;
    returnFocus = null;
    close();
    item.perform();
  }

  input.addEventListener('input', () => {
    active = 0;
    render();
  });

  input.addEventListener('keydown', (event) => {
    const n = results.length;
    if (!n) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      active = (active + (event.key === 'ArrowDown' ? 1 : -1) + n) % n;
      highlight(true);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(results[active]);
    }
  });

  list.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) run(results[Number(option.dataset.index)]);
  });

  list.addEventListener('pointermove', (event) => {
    const option = event.target.closest('[role="option"]');
    if (option && Number(option.dataset.index) !== active) {
      active = Number(option.dataset.index);
      highlight(false);
    }
  });

  // clique fora do painel (no backdrop)
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });

  dialog.addEventListener('close', () => {
    returnFocus?.focus?.({ preventScroll: true });
    returnFocus = null;
  });

  const onKey = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      dialog.open ? close() : open();
    } else if (event.key === '/' && !dialog.open && !isTyping(event.target)) {
      event.preventDefault();
      open();
    }
  };
  if (hotkeys) document.addEventListener('keydown', onKey);

  function destroy() {
    document.removeEventListener('keydown', onKey);
    close();
    dialog.remove();
  }

  return { open, close, destroy, isOpen: () => dialog.open, modifierLabel: isMac ? '⌘' : 'Ctrl' };
}
