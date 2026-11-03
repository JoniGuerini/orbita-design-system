/**
 * Site de documentação do Lume — monta o shell, a navegação, a busca e o roteador (hash).
 */
import '../ds/icons/icons.js';
import { icon } from '../ds/icons/icons.js';
import { initTheme, bindThemeControls, setTheme } from '../ds/js/theme.js';
import { initLocale, setLocale, getLocalePreference, locale, LOCALES, LOCALE_NAMES } from '../ds/js/i18n.js';
import { attachMenu } from '../ds/js/menu.js';
import { initTooltips } from '../ds/js/tooltip.js';
import { initScrollbars } from '../ds/js/scrollbar.js';
import { createShell, renderSidebarNav, renderNavbarNav, setActiveNavItem } from '../ds/js/shell.js';
import { createCommandPalette } from '../ds/js/command-palette.js';
import { navigation, pages, findPage } from './nav.js';
import { CURRENT_VERSION, SEEN_KEY } from './changelog.js';
import { t, applyStrings } from './i18n.js';

/*
 * Modo demonstração (?embed): o app roda dentro de um iframe nas páginas de documentação
 * (ex.: Padrões › App shell). Nada é gravado — tema, sidebar e grupos ficam só na memória —
 * e a página que embute controla tudo por window.lumeEmbed.
 */
const params = new URLSearchParams(location.search);
const EMBED = params.has('embed');
const THEMES = ['refugio', 'dark', 'light', 'system'];

if (EMBED) {
  document.documentElement.dataset.embed = '';
  // rede de segurança: nenhuma escrita no armazenamento compartilhado com o app de verdade
  try {
    Storage.prototype.setItem = function setItem() {};
    Storage.prototype.removeItem = function removeItem() {};
  } catch {}
}

/** Tema só na memória, para o modo demonstração. */
function embedTheme(preference) {
  if (!THEMES.includes(preference)) return;
  document.documentElement.dataset.theme = preference;
  document.querySelectorAll('[data-theme-option]').forEach((btn) => {
    const on = btn.dataset.themeOption === preference;
    btn.setAttribute('aria-checked', String(on));
    btn.tabIndex = on ? 0 : -1;
  });
  document.documentElement.dispatchEvent(new CustomEvent('ds:themechange', { detail: { preference, resolved: preference } }));
}

function bindEmbedThemeControls() {
  const options = [...document.querySelectorAll('[data-theme-option]')];
  options.forEach((btn) => btn.addEventListener('click', () => embedTheme(btn.dataset.themeOption)));
  options[0]?.closest('[role="radiogroup"]')?.addEventListener('keydown', (event) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = options[(options.indexOf(document.activeElement) + delta + options.length) % options.length];
    next.focus();
    embedTheme(next.dataset.themeOption);
  });
  embedTheme(THEMES.includes(params.get('theme')) ? params.get('theme') : document.documentElement.dataset.theme);
}

const applyTheme = EMBED ? embedTheme : setTheme;

initTheme();
initLocale();
applyStrings();
if (EMBED) bindEmbedThemeControls();
else bindThemeControls();
initTooltips();
initScrollbars();

/** A bolinha de Novidades some depois que a versão atual foi vista. */
const newsSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === CURRENT_VERSION;
  } catch {
    return false;
  }
};

// o cartão da conta mostra a versão atual (Lume 0.7) e só aparece enquanto ela não foi vista;
// nos exemplos embutidos do App shell ele fica sempre, porque a anatomia aponta para ele
const shortVersion = CURRENT_VERSION.replace(/\.0$/, '');
function renderAccount() {
  document.querySelectorAll('.ds-account').forEach((card) => {
    card.dataset.dsTooltip = t('accountTooltip', shortVersion);
    const title = card.querySelector('.ds-account__title');
    if (title) title.textContent = `Lume ${shortVersion}`;
    const footer = card.closest('.ds-sidebar__footer');
    if (footer) footer.hidden = !EMBED && newsSeen();
  });
}
renderAccount();

// a página Novidades avisa quando a versão foi vista: some a bolinha e o cartão
document.addEventListener('ds:newsseen', () => {
  document.querySelectorAll('.ds-sidebar .ds-nav-item[href="#/novidades"] .ds-dot, .ds-navbar__item[href="#/novidades"] .ds-dot').forEach((d) => d.remove());
  renderAccount();
});

const navEl = document.getElementById('sidebar-nav');
const content = document.getElementById('conteudo');
const breadcrumb = document.getElementById('breadcrumb');

// os mesmos grupos alimentam a sidebar e a navbar
const navGroups = () =>
  navigation.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.items.map((item) => ({ label: item.label, icon: item.icon, href: `#${item.path}`, dot: item.dot && !newsSeen() })),
  }));

function renderSidebar() {
  renderSidebarNav(navEl, navGroups());
}
renderSidebar();

const shell = createShell(
  document.getElementById('shell'),
  EMBED ? { persist: false, initial: params.get('sidebar') === 'collapsed' ? 'collapsed' : 'expanded', layout: params.get('layout') ?? 'sidebar' } : undefined,
);
const go = (path) => (location.hash = path);

/* ───────── Navbar ───────── */

const navbarEl = document.getElementById('navbar-nav');
let navbar = null;
let activeHref = null;
function renderNavbar() {
  navbar?.destroy();
  navbar = renderNavbarNav(navbarEl, navGroups(), { attachMenu, go });
  if (activeHref) navbar.setActive(activeHref);
}
renderNavbar();

const applyLocale = (preference) => setLocale(preference, { persist: !EMBED });

const palette = createCommandPalette({
  placeholder: () => t('palettePlaceholder'),
  items: () => [
    ...pages.map((page) => ({
      id: page.path,
      label: page.label,
      group: page.group ?? t('general'),
      icon: page.icon,
      description: page.description,
      keywords: page.topics,
      hint: page.load ? undefined : t('soon'),
      perform: () => go(page.path),
    })),
    { id: 'theme-refugio', label: t('useRefugio'), group: t('actions'), icon: 'cabin', keywords: ['refúgio', 'refugio', 'lume', 'ardósia', 'slate'], perform: () => applyTheme('refugio') },
    { id: 'theme-dark', label: t('useDark'), group: t('actions'), icon: 'moon', keywords: ['dark', 'escuro', 'oscuro'], perform: () => applyTheme('dark') },
    { id: 'theme-light', label: t('useLight'), group: t('actions'), icon: 'sun', keywords: ['light', 'claro'], perform: () => applyTheme('light') },
    { id: 'theme-system', label: t('useSystem'), group: t('actions'), icon: 'monitor', keywords: ['system', 'sistema', 'automático'], perform: () => applyTheme('system') },
    ...LOCALES.map((l) => ({ id: `locale-${l}`, label: `${t('language')}: ${LOCALE_NAMES[l]}`, group: t('actions'), icon: 'globe', keywords: ['idioma', 'language', 'lenguaje'], perform: () => applyLocale(l) })),
    { id: 'layout-sidebar', label: t('layoutSidebarTip'), group: t('actions'), icon: 'panel-left', keywords: ['layout', 'sidebar', 'lateral'], perform: () => shell.setLayout('sidebar') },
    { id: 'layout-navbar', label: t('layoutNavbarTip'), group: t('actions'), icon: 'panel-top', keywords: ['layout', 'navbar', 'topo', 'top', 'superior'], perform: () => shell.setLayout('navbar') },
    { id: 'sidebar', label: t('toggleMenu'), group: t('actions'), icon: 'panel-left', hint: `${palette.modifierLabel} B`, keywords: ['sidebar', 'barra lateral'], perform: () => shell.toggle() },
  ],
});

/* ───────── Idioma ───────── */

const localeChip = document.querySelector('[data-locale-menu]');
const SHORT = { 'pt-BR': 'PT', en: 'EN', es: 'ES' };
let localeMenu = null;

function renderLocaleMenu() {
  localeMenu?.destroy();
  localeChip.querySelector('[data-label]').textContent = SHORT[locale()];
  localeChip.setAttribute('aria-label', `${t('language')}: ${LOCALE_NAMES[locale()]}`);
  localeMenu = attachMenu(localeChip, {
    label: t('language'),
    value: EMBED ? locale() : getLocalePreference(),
    options: [
      { value: 'system', label: t('languageSystem', LOCALE_NAMES[locale()]), icon: 'monitor' },
      { type: 'separator' },
      ...LOCALES.map((l) => ({ value: l, label: LOCALE_NAMES[l] })),
    ],
    onChange: applyLocale,
  });
}
renderLocaleMenu();

// trocar o idioma refaz tudo que tem texto: shell, sidebar, seletor e a página aberta
document.documentElement.addEventListener('ds:localechange', () => {
  applyStrings();
  renderAccount();
  renderSidebar();
  renderNavbar();
  renderLocaleMenu();
  route();
});

document.querySelectorAll('[data-kbd-mod]').forEach((el) => (el.textContent = palette.modifierLabel));

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-command-open]')) {
    shell.closeMobile();
    palette.open();
  }
  if (event.target.closest('[data-skip-link]')) {
    event.preventDefault();
    content.focus();
  }
});

/* ───────── Roteador ───────── */

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function renderBreadcrumb(page) {
  const crumbs = [];
  if (page?.path !== '/') crumbs.push({ label: t('home'), href: '#/' });
  if (page?.group) crumbs.push({ label: page.group });
  crumbs.push({ label: page ? page.label : t('notFound'), current: true });
  breadcrumb.innerHTML = `<ol>${crumbs
    .map((c, i) => {
      const sep = i ? icon('chevron-right', { size: 14 }) : '';
      if (c.current) return `<li>${sep}<span aria-current="page">${escape(c.label)}</span></li>`;
      if (c.href) return `<li>${sep}<a href="${c.href}">${escape(c.label)}</a></li>`;
      return `<li>${sep}<span>${escape(c.label)}</span></li>`;
    })
    .join('')}</ol>`;
}

function currentPath() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!raw || raw === '/') return '/';
  return `/${raw.replace(/^\/+|\/+$/g, '')}`;
}

let renderId = 0;
let firstRender = true;
let cleanup = null;

/** CSS próprio de uma página (export const styles = 'site/pages/x.css'), carregado uma vez. */
const loadedStyles = new Map();
function loadStyles(href) {
  if (!href) return Promise.resolve();
  if (!loadedStyles.has(href)) {
    loadedStyles.set(
      href,
      new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = link.onerror = resolve;
        document.head.append(link);
      }),
    );
  }
  return loadedStyles.get(href);
}

async function route() {
  const id = ++renderId;
  const path = currentPath();
  const page = findPage(path);

  activeHref = page ? `#${page.path}` : null;
  setActiveNavItem(navEl, activeHref);
  navbar?.setActive(activeHref);
  renderBreadcrumb(page);
  document.title = !page ? `${t('notFound')} · Lume` : page.path === '/' ? 'Lume Design System' : `${page.label} · Lume`;

  const mod = await (page?.load?.() ?? import(page ? './pages/placeholder.js' : './pages/not-found.js'));
  await Promise.all([].concat(mod.styles ?? []).map(loadStyles));
  if (id !== renderId) return;

  cleanup?.();
  content.innerHTML = mod.default(page ?? { path });
  cleanup = mod.mount?.(content, { shell, palette, go }) ?? null;
  shell.scrollToTop();
  shell.closeMobile();
  if (!firstRender) content.focus({ preventScroll: true });
  firstRender = false;
}

addEventListener('hashchange', route);
route();

// a página que embute o app (mesma origem) controla a demonstração por aqui
if (EMBED) window.lumeEmbed = { shell, palette, go, setTheme: embedTheme, setLocale: applyLocale, setLayout: shell.setLayout, root: document.getElementById('shell') };
