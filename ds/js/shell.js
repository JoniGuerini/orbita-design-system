/**
 * Comportamento do app shell: recolher sidebar (desktop), gaveta (mobile),
 * grupos de navegação, item ativo e borda da topbar ao rolar.
 *
 *   const shell = createShell(document.getElementById('shell'));
 *   createShell(el, { persist: false, initial: 'collapsed' });   // demos: nada vai para o localStorage
 *
 * A cada mudança, o shell dispara "ds:shellchange" com { sidebar, mobile, mobileOpen }.
 */
import { icon } from '../icons/icons.js';
import { msg } from './i18n.js';

const SIDEBAR_KEY = 'ds-sidebar';
const GROUPS_KEY = 'ds-nav-groups';
const mobileQuery = matchMedia('(max-width: 1023.98px)');

const store = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

const isTyping = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]');

export function createShell(root, { persist = true, initial } = {}) {
  const save = (key, value) => persist && store.set(key, value);
  const sidebar = root.querySelector('.ds-sidebar');
  const scrim = root.querySelector('[data-shell-scrim]');
  const main = root.querySelector('.ds-main');
  const scroller = root.querySelector('.ds-main__scroll');
  const toggles = [...root.querySelectorAll('[data-shell-toggle]')];

  root.dataset.sidebar = initial ?? (persist ? store.get(SIDEBAR_KEY, 'expanded') : 'expanded');
  root.dataset.mobileOpen = 'false';

  const isMobile = () => mobileQuery.matches;
  const isCollapsed = () => root.dataset.sidebar === 'collapsed';
  const isMobileOpen = () => root.dataset.mobileOpen === 'true';

  function sync() {
    const mobile = isMobile();
    const expanded = mobile ? isMobileOpen() : !isCollapsed();
    const label = msg(mobile ? (expanded ? 'shell.closeMenu' : 'shell.openMenu') : expanded ? 'shell.collapse' : 'shell.expand');
    for (const btn of toggles) {
      btn.setAttribute('aria-expanded', String(expanded));
      btn.setAttribute('aria-label', label);
      btn.dataset.dsTooltip = label;
      if (!mobile) btn.dataset.dsTooltipKbd = navigator.platform.includes('Mac') ? '⌘B' : 'Ctrl B';
    }
    sidebar.dataset.dsTooltips = !mobile && isCollapsed() ? 'on' : 'off';
    root.querySelectorAll('.ds-nav-group__header').forEach((h) => (h.tabIndex = !mobile && isCollapsed() ? -1 : 0));
    root.dispatchEvent(new CustomEvent('ds:shellchange', { detail: { sidebar: root.dataset.sidebar, mobile, mobileOpen: isMobileOpen() } }));
  }

  function setCollapsed(collapsed) {
    root.dataset.sidebar = collapsed ? 'collapsed' : 'expanded';
    save(SIDEBAR_KEY, root.dataset.sidebar);
    sync();
  }

  function setMobileOpen(open) {
    if (open === isMobileOpen()) return;
    root.dataset.mobileOpen = String(open);
    sync();
    if (open) (sidebar.querySelector('[aria-current="page"]') ?? sidebar.querySelector('a, button'))?.focus({ preventScroll: true });
  }

  function toggle() {
    if (isMobile()) setMobileOpen(!isMobileOpen());
    else setCollapsed(!isCollapsed());
  }

  toggles.forEach((btn) => btn.addEventListener('click', toggle));
  scrim?.addEventListener('click', () => setMobileOpen(false));
  document.documentElement.addEventListener('ds:localechange', sync);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMobile() && isMobileOpen()) {
      setMobileOpen(false);
      root.querySelector('.ds-topbar [data-shell-toggle]')?.focus();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b' && !isTyping(event.target)) {
      event.preventDefault();
      toggle();
    }
  });

  mobileQuery.addEventListener('change', () => {
    root.dataset.mobileOpen = 'false';
    sync();
  });

  scroller?.addEventListener(
    'scroll',
    () => main.toggleAttribute('data-scrolled', scroller.scrollTop > 4),
    { passive: true },
  );

  // Grupos recolhíveis
  root.addEventListener('click', (event) => {
    const header = event.target.closest('.ds-nav-group__header');
    if (!header) return;
    const group = header.closest('.ds-nav-group');
    const open = group.dataset.open !== 'true';
    group.dataset.open = String(open);
    header.setAttribute('aria-expanded', String(open));
    const state = store.get(GROUPS_KEY, {});
    state[group.dataset.group] = open;
    save(GROUPS_KEY, state);
  });

  sync();
  requestAnimationFrame(() => requestAnimationFrame(() => root.setAttribute('data-ready', '')));

  return {
    toggle,
    setCollapsed,
    setMobileOpen,
    closeMobile: () => setMobileOpen(false),
    isCollapsed,
    isMobile,
    isMobileOpen,
    scrollToTop: () => scroller?.scrollTo({ top: 0 }),
  };
}

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function navItem(item, large) {
  return `<li><a class="ds-nav-item${large ? ' ds-nav-item--lg' : ''}" href="${escape(item.href)}" data-ds-tooltip="${escape(item.label)}" data-ds-tooltip-placement="right">
    ${icon(item.icon, { size: 20 })}
    <span class="ds-nav-item__label">${escape(item.label)}</span>
    ${item.dot ? '<span class="ds-dot" aria-label="Novidade"></span>' : ''}
  </a></li>`;
}

/**
 * Renderiza a navegação.
 * groups: [{ id, label?, items: [{ label, icon, href, dot? }] }] — o grupo sem label vira a navegação principal.
 */
export function renderSidebarNav(container, groups) {
  const openState = store.get(GROUPS_KEY, {});
  container.innerHTML = groups
    .map((group) => {
      if (!group.label) {
        return `<ul class="ds-nav-list" role="list">${group.items.map((i) => navItem(i, true)).join('')}</ul>
          <hr class="ds-divider ds-divider--fade ds-sidebar__divider">`;
      }
      const open = openState[group.id] ?? true;
      const id = `nav-group-${group.id}`;
      return `<section class="ds-nav-group" data-group="${group.id}" data-open="${open}">
        <button type="button" class="ds-nav-group__header" aria-expanded="${open}" aria-controls="${id}">
          <span class="ds-nav-group__label">${escape(group.label)}</span>
          <span class="ds-nav-group__toggle" aria-hidden="true">${icon('chevron-down', { size: 16 })}</span>
        </button>
        <div class="ds-nav-group__items" id="${id}">
          <ul class="ds-nav-list" role="list">${group.items.map((i) => navItem(i, false)).join('')}</ul>
        </div>
      </section>`;
    })
    .join('');
}

/** Marca o item ativo e garante que o grupo dele esteja aberto e visível. */
export function setActiveNavItem(container, href) {
  container.querySelectorAll('.ds-nav-item').forEach((a) => {
    if (a.getAttribute('href') === href) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const active = container.querySelector('[aria-current="page"]');
  const group = active?.closest('.ds-nav-group');
  if (group && group.dataset.open === 'false') {
    group.dataset.open = 'true';
    group.querySelector('.ds-nav-group__header')?.setAttribute('aria-expanded', 'true');
  }
  // rola só a lista da sidebar (scrollIntoView rolaria também a página — e a página-mãe, num iframe)
  if (!active) return;
  const list = container.closest('.ds-sidebar__nav') ?? container;
  const a = active.getBoundingClientRect();
  const l = list.getBoundingClientRect();
  if (a.top < l.top) list.scrollTop += a.top - l.top - 8;
  else if (a.bottom > l.bottom) list.scrollTop += a.bottom - l.bottom + 8;
}
