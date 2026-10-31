/**
 * Textos do site que não são de uma página: shell, busca, breadcrumb e seletor de idioma.
 * No index.html, data-i18n="chave" troca o texto e data-i18n-attr="aria-label:chave; data-ds-tooltip:chave" os atributos.
 * Textos das páginas ficam na própria página, em T(pt-BR, en, es).
 */
import { tr } from '../ds/js/i18n.js';

export const T = (pt, en, es) => ({ 'pt-BR': pt, en, es });

const STRINGS = {
  skip: T('Pular para o conteúdo', 'Skip to content', 'Saltar al contenido'),
  sidebar: T('Barra lateral', 'Sidebar', 'Barra lateral'),
  goHome: T('Órbita, ir para o início', 'Órbita, go to home', 'Órbita, ir al inicio'),
  search: T('Buscar', 'Search', 'Buscar'),
  searchOrbita: T('Buscar no Órbita', 'Search Órbita', 'Buscar en Órbita'),
  mainNav: T('Principal', 'Main', 'Principal'),
  whatsNew: T('Ver o que há de novo', 'See what’s new', 'Ver las novedades'),
  accountTooltip: T((v) => `Órbita ${v} · novidades`, (v) => `Órbita ${v} · what’s new`, (v) => `Órbita ${v} · novedades`),
  youAreHere: T('Você está em', 'You are here', 'Estás en'),
  theme: T('Tema', 'Theme', 'Tema'),
  dark: T('Escuro', 'Dark', 'Oscuro'),
  light: T('Claro', 'Light', 'Claro'),
  system: T('Sistema', 'System', 'Sistema'),
  darkTheme: T('Tema escuro', 'Dark theme', 'Tema oscuro'),
  lightTheme: T('Tema claro', 'Light theme', 'Tema claro'),
  followSystem: T('Seguir o sistema', 'Match system', 'Seguir el sistema'),
  language: T('Idioma', 'Language', 'Idioma'),
  languageSystem: T((name) => `Sistema · ${name}`, (name) => `System · ${name}`, (name) => `Sistema · ${name}`),
  home: T('Início', 'Home', 'Inicio'),
  notFound: T('Página não encontrada', 'Page not found', 'Página no encontrada'),
  palettePlaceholder: T('Buscar páginas e ações…', 'Search pages and actions…', 'Buscar páginas y acciones…'),
  general: T('Geral', 'General', 'General'),
  actions: T('Ações', 'Actions', 'Acciones'),
  soon: T('Em breve', 'Soon', 'Pronto'),
  useDark: T('Usar tema escuro', 'Use dark theme', 'Usar tema oscuro'),
  useLight: T('Usar tema claro', 'Use light theme', 'Usar tema claro'),
  useSystem: T('Seguir tema do sistema', 'Match system theme', 'Seguir el tema del sistema'),
  toggleMenu: T('Recolher ou expandir menu', 'Collapse or expand menu', 'Contraer o expandir el menú'),
};

/** Texto do site no idioma atual; textos com valores são funções: t('accountTooltip', '0.6.1'). */
export function t(key, ...args) {
  const value = tr(STRINGS[key]);
  return typeof value === 'function' ? value(...args) : value ?? key;
}

/** Aplica data-i18n e data-i18n-attr dentro de root. */
export function applyStrings(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
}
