/**
 * Menu (dropdown) ligado a um gatilho — um .ds-chip, botão ou botão de ícone.
 *
 * Seleção (padrão) — escolhe um valor, o item atual ganha a marca:
 *   const menu = attachMenu(chip, {
 *     label: 'Tema',
 *     options: [{ value: 'dark', label: 'Escuro', icon: 'moon' }, …],   // ou swatch: 'var(--cor)'
 *     value: 'dark',
 *     onChange: (value) => …,
 *   });
 *
 * Ação — dispara comandos, sem valor selecionado:
 *   attachMenu(botao, {
 *     mode: 'action',
 *     options: [
 *       { value: 'duplicate', label: 'Duplicar', icon: 'copy', shortcut: '⌘D' },
 *       { type: 'separator' },
 *       { value: 'delete', label: 'Excluir', icon: 'trash', tone: 'danger' },
 *     ],
 *     onChange: (value) => …,
 *   });
 *
 * Itens especiais: { type: 'separator' }, { type: 'group', label } e { …, disabled: true }.
 *
 * Colunas — listas longas viram uma grade em vez de rolar: maxRows é o máximo de itens por coluna;
 * passando disso, os itens seguem para a coluna do lado, equilibrados (16 itens com maxRows 5 → 4 × 4).
 *   attachMenu(botao, { label: 'Componentes', options, maxRows: 5, onChange });
 * ↑/↓ andam na ordem (desce a coluna e passa para a próxima); ←/→ pulam de coluna.
 * menu.destroy() ao sair da página.
 *
 * Padrão ARIA: gatilho com aria-haspopup="menu" + menu com menuitemradio (seleção) ou menuitem (ação).
 * Teclado: ↓/↑ abrem e movem, Home/End, Enter/Espaço escolhem, Esc fecha, letras pulam para o item.
 */
import { icon } from '../icons/icons.js';

let uid = 0;
let openMenu = null;

const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const normalize = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** HTML dos itens — usado pelo menu e pelas prévias estáticas da documentação. */
/** Linhas da grade: o mínimo de colunas que respeita maxRows, com os itens divididos por igual. */
export function menuRows(count, maxRows) {
  if (!maxRows || count <= maxRows) return 0;
  return Math.ceil(count / Math.ceil(count / maxRows));
}

export function menuContent({ label, options = [], value, mode = 'radio', rows = 0 } = {}) {
  const radio = mode !== 'action';
  const items = options
      .map((o) => {
        if (o.type === 'separator') return '<div class="ds-menu__separator" role="separator"></div>';
        if (o.type === 'group') return `<p class="ds-menu__group" aria-hidden="true">${escape(o.label)}</p>`;
        const lead = o.swatch ? `<span class="ds-menu__swatch" style="background:${o.swatch}"></span>` : o.icon ? icon(o.icon, { size: 18 }) : '';
        const trail = radio
          ? icon('check', { size: 16, className: 'ds-menu__check' })
          : o.shortcut
            ? `<span class="ds-menu__shortcut">${escape(o.shortcut)}</span>`
            : '';
        const cls = `ds-menu__item${o.tone === 'danger' ? ' ds-menu__item--danger' : ''}`;
        const state = radio ? ` aria-checked="${o.value === value}"` : '';
        const disabled = o.disabled ? ' aria-disabled="true"' : '';
        return `<button type="button" class="${cls}" role="${radio ? 'menuitemradio' : 'menuitem'}" tabindex="-1"${state}${disabled} data-value="${escape(o.value)}">
          ${lead}<span class="ds-menu__text">${escape(o.label)}</span>${trail}
        </button>`;
      })
      .join('');
  return (
    (label ? `<p class="ds-menu__label" aria-hidden="true">${escape(label)}</p>` : '') +
    (rows ? `<div class="ds-menu__grid" style="--_rows:${rows}">${items}</div>` : items)
  );
}

export function attachMenu(trigger, { label, options, value, onChange, mode = 'radio', maxRows = 0 }) {
  const id = `ds-menu-${++uid}`;
  const menu = document.createElement('div');
  menu.className = 'ds-menu';
  menu.id = id;
  menu.setAttribute('role', 'menu');
  if (label) menu.setAttribute('aria-label', label);
  if (mode === 'action') menu.dataset.mode = 'action';
  const rows = menuRows(options.filter((o) => !o.type).length, maxRows);
  if (rows) menu.classList.add('ds-menu--columns');
  document.body.append(menu);

  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', id);

  let current = value;
  const items = () => [...menu.querySelectorAll('.ds-menu__item:not([aria-disabled="true"])')];

  function render() {
    menu.innerHTML = menuContent({ label, options, value: current, mode, rows });
  }

  function position() {
    const r = trigger.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    let x = r.left;
    let y = r.bottom + 6;
    // passou da direita: alinha pela direita do gatilho; se ainda não couber (menu largo, em colunas), desliza só o necessário
    if (x + m.width > innerWidth - 8) x = r.right - m.width >= 8 ? r.right - m.width : innerWidth - 8 - m.width;
    if (y + m.height > innerHeight - 8) y = r.top - m.height - 6;
    menu.style.translate = `${Math.round(Math.max(8, x))}px ${Math.round(Math.max(8, y))}px`;
  }

  function open(focus = 'current') {
    if (openMenu && openMenu !== api) openMenu.close(false);
    render();
    position();
    menu.setAttribute('data-open', '');
    trigger.setAttribute('aria-expanded', 'true');
    openMenu = api;
    const list = items();
    const target = focus === 'last' ? list.at(-1) : (mode !== 'action' && list.find((i) => i.getAttribute('aria-checked') === 'true')) || list[0];
    target?.focus({ preventScroll: true });
  }

  function close(returnFocus = true) {
    if (!menu.hasAttribute('data-open')) return;
    menu.removeAttribute('data-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (openMenu === api) openMenu = null;
    if (returnFocus) trigger.focus({ preventScroll: true });
  }

  function select(next) {
    if (mode !== 'action') current = next;
    close();
    onChange?.(next);
  }

  const onTriggerClick = () => (menu.hasAttribute('data-open') ? close() : open());
  const onTriggerKey = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open(event.key === 'ArrowUp' && mode === 'action' ? 'last' : 'current');
    }
  };
  trigger.addEventListener('click', onTriggerClick);
  trigger.addEventListener('keydown', onTriggerKey);

  menu.addEventListener('click', (event) => {
    const item = event.target.closest('.ds-menu__item');
    if (item && item.getAttribute('aria-disabled') !== 'true') select(item.dataset.value);
  });

  menu.addEventListener('keydown', (event) => {
    const list = items();
    if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    const move = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[event.key];
    const jump = rows ? { ArrowRight: i + rows, ArrowLeft: i - rows }[event.key] : undefined;
    if (jump !== undefined) {
      // ←/→ na grade: mesma linha da coluna vizinha (sem dar a volta)
      event.preventDefault();
      list[Math.min(Math.max(jump, 0), list.length - 1)].focus();
    } else if (move !== undefined) {
      event.preventDefault();
      list[(move + list.length) % list.length].focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close(false);
    } else if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      // busca por letra: próximo item que começa com ela
      const ch = normalize(event.key);
      const order = [...list.slice(i + 1), ...list.slice(0, i + 1)];
      order.find((item) => normalize(item.textContent.trim()).startsWith(ch))?.focus();
    }
  });

  const api = {
    open,
    close,
    get isOpen() {
      return menu.hasAttribute('data-open');
    },
    get value() {
      return current;
    },
    setValue(next) {
      current = next;
      if (menu.hasAttribute('data-open')) render();
    },
    destroy() {
      close(false);
      trigger.removeEventListener('click', onTriggerClick);
      trigger.removeEventListener('keydown', onTriggerKey);
      trigger.removeAttribute('aria-haspopup');
      trigger.removeAttribute('aria-expanded');
      trigger.removeAttribute('aria-controls');
      menu.remove();
    },
  };
  return api;
}

// fecha ao clicar fora, rolar ou redimensionar
document.addEventListener('pointerdown', (event) => {
  if (openMenu && !event.target.closest('.ds-menu, [aria-haspopup="menu"]')) openMenu.close(false);
});
document.addEventListener('scroll', (event) => !event.target.closest?.('.ds-menu') && openMenu?.close(false), true);
addEventListener('resize', () => openMenu?.close(false));
