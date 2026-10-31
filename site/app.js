/**
 * Site de documentação do Órbita — monta o shell, a navegação, a busca e o roteador (hash).
 */
import '../ds/icons/icons.js';
import { icon } from '../ds/icons/icons.js';
import { initTheme, bindThemeControls, setTheme } from '../ds/js/theme.js';
import { initTooltips } from '../ds/js/tooltip.js';
import { createShell, renderSidebarNav, setActiveNavItem } from '../ds/js/shell.js';
import { createCommandPalette } from '../ds/js/command-palette.js';
import { navigation, pages, findPage } from './nav.js';
import { CURRENT_VERSION, SEEN_KEY } from './changelog.js';

/*
 * Modo demonstração (?embed): o app roda dentro de um iframe nas páginas de documentação
 * (ex.: Padrões › App shell). Nada é gravado — tema, sidebar e grupos ficam só na memória —
 * e a página que embute controla tudo por window.orbitaEmbed.
 */
const params = new URLSearchParams(location.search);
const EMBED = params.has('embed');
const THEMES = ['dark', 'light', 'system'];

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
if (EMBED) bindEmbedThemeControls();
else bindThemeControls();
initTooltips();

/** A bolinha de Novidades some depois que a versão atual foi vista. */
const newsSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === CURRENT_VERSION;
  } catch {
    return false;
  }
};

// o cartão da conta mostra a versão atual (Órbita 0.2)
const shortVersion = CURRENT_VERSION.replace(/\.0$/, '');
document.querySelectorAll('.ds-account').forEach((card) => {
  card.dataset.dsTooltip = `Órbita ${shortVersion} · novidades`;
  const title = card.querySelector('.ds-account__title');
  if (title) title.textContent = `Órbita ${shortVersion}`;
});

const navEl = document.getElementById('sidebar-nav');
const content = document.getElementById('conteudo');
const breadcrumb = document.getElementById('breadcrumb');

renderSidebarNav(
  navEl,
  navigation.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.items.map((item) => ({ label: item.label, icon: item.icon, href: `#${item.path}`, dot: item.dot && !newsSeen() })),
  })),
);

const shell = createShell(
  document.getElementById('shell'),
  EMBED ? { persist: false, initial: params.get('sidebar') === 'collapsed' ? 'collapsed' : 'expanded' } : undefined,
);
const go = (path) => (location.hash = path);

const palette = createCommandPalette({
  placeholder: 'Buscar páginas e ações…',
  items: () => [
    ...pages.map((page) => ({
      id: page.path,
      label: page.label,
      group: page.group ?? 'Geral',
      icon: page.icon,
      description: page.description,
      keywords: page.topics,
      hint: page.load ? undefined : 'Em breve',
      perform: () => go(page.path),
    })),
    { id: 'theme-dark', label: 'Usar tema escuro', group: 'Ações', icon: 'moon', keywords: ['dark'], perform: () => applyTheme('dark') },
    { id: 'theme-light', label: 'Usar tema claro', group: 'Ações', icon: 'sun', keywords: ['light'], perform: () => applyTheme('light') },
    { id: 'theme-system', label: 'Seguir tema do sistema', group: 'Ações', icon: 'monitor', keywords: ['system', 'automático'], perform: () => applyTheme('system') },
    { id: 'sidebar', label: 'Recolher ou expandir menu', group: 'Ações', icon: 'panel-left', hint: `${palette.modifierLabel} B`, keywords: ['sidebar', 'barra lateral'], perform: () => shell.toggle() },
  ],
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
  if (page?.path !== '/') crumbs.push({ label: 'Início', href: '#/' });
  if (page?.group) crumbs.push({ label: page.group });
  crumbs.push({ label: page ? page.label : 'Página não encontrada', current: true });
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

  setActiveNavItem(navEl, page ? `#${page.path}` : null);
  renderBreadcrumb(page);
  document.title = !page ? 'Página não encontrada · Órbita' : page.path === '/' ? 'Órbita Design System' : `${page.label} · Órbita`;

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
if (EMBED) window.orbitaEmbed = { shell, palette, go, setTheme: embedTheme, root: document.getElementById('shell') };
