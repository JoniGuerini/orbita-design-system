/**
 * Textos do site que não são de uma página: shell, busca, breadcrumb e seletor de idioma.
 * No index.html, data-i18n="chave" troca o texto e data-i18n-attr="aria-label:chave; data-ds-tooltip:chave" os atributos.
 * Textos das páginas ficam na própria página, em T(pt-BR, en, es).
 */
import { tr, locale } from '../ds/js/i18n.js';

export const T = (pt, en, es) => ({ 'pt-BR': pt, en, es });

/** Texto no idioma atual, direto no template: L('Copiar', 'Copy', 'Copiar'). Chame na renderização, não no topo do módulo. */
export const L = (pt, en, es) => tr(T(pt, en, es));

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

/* ───────── Textos que vêm dos tokens (os JSON ficam em português) ───────── */

const PALETTE_LABELS = {
  neutral: T('Neutro quente', 'Warm neutral', 'Neutro cálido'),
  brand: T('Marca · Pêssego', 'Brand · Peach', 'Marca · Melocotón'),
  sand: T('Areia', 'Sand', 'Arena'),
  clay: T('Argila', 'Clay', 'Arcilla'),
  ochre: T('Ocre', 'Ochre', 'Ocre'),
  slate: T('Ardósia', 'Slate', 'Pizarra'),
  red: T('Vermelho', 'Red', 'Rojo'),
  amber: T('Âmbar', 'Amber', 'Ámbar'),
  green: T('Verde', 'Green', 'Verde'),
  teal: T('Verde-azulado', 'Teal', 'Verde azulado'),
  blue: T('Azul', 'Blue', 'Azul'),
  violet: T('Violeta', 'Violet', 'Violeta'),
  pink: T('Rosa', 'Pink', 'Rosa'),
};

const TOKEN_DESCRIPTIONS = {
  'color.bg.app': T(null, 'Background behind the app shell panels.', 'Fondo detrás de los paneles del app shell.'),
  'color.bg.canvas': T(null, 'Background of the content panel.', 'Fondo del panel de contenido.'),
  'color.bg.surface': T(null, 'Cards and blocks on the canvas.', 'Tarjetas y bloques sobre el canvas.'),
  'color.bg.raised': T(null, 'Modals, popovers, floating panels.', 'Modales, popovers, paneles flotantes.'),
  'color.bg.sunken': T(null, 'Fields and recessed areas.', 'Campos y áreas hundidas.'),
  'color.fg.subtle': T(null, 'Faded text (axis ticks, metadata). Passes 4.5:1 on every surface, in both themes.', 'Texto atenuado (marcas de eje, metadatos). Supera 4,5:1 en todas las superficies, en los dos temas.'),
  'color.border.control': T(null, 'Outline for chips and buttons with text — the label already identifies the control (WCAG 1.4.11 doesn’t require 3:1 here).', 'Contorno de chips y botones con texto — la etiqueta ya identifica el control (WCAG 1.4.11 no exige 3:1 aquí).'),
  'color.border.field': T(null, 'Outline for fields, select, composer, and the off switch: the outline is what identifies the control, so it passes 3:1 on every surface.', 'Contorno de campos, selector, composer y switch apagado: el contorno es lo que identifica el control, así que supera 3:1 en todas las superficies.'),
  'color.border.field-hover': T(null, 'Field outline on hover — stronger than at rest.', 'Contorno del campo al pasar el cursor — más fuerte que en reposo.'),
  'color.brand.indicator': T(null, 'Notification or what’s-new dot.', 'Puntito de notificación o novedad.'),
  'color.chart.muted': T(null, 'Emphasis: the context in gray, so one series stands out.', 'Énfasis: el contexto en gris, para que una serie destaque.'),
  'color.chart.other': T(null, '“Other”: the grouped tail after the 8th series or the 6th slice.', '“Otros”: la cola agrupada después de la 8.ª serie o la 6.ª porción.'),
  'color.chart.grid': T(null, 'Grid lines: a solid 1 px hairline, one step off the surface.', 'Líneas de cuadrícula: hilo sólido de 1 px, un paso fuera de la superficie.'),
  'color.chart.axis': T(null, 'Baseline and axes.', 'Línea de base y ejes.'),
};

/** Nome da paleta no idioma atual. */
export const paletteLabel = (p) => tr(PALETTE_LABELS[p.name]) ?? p.label;

/** Descrição do token no idioma atual (em português, a do próprio JSON). */
export const tokenDescription = (t) => (locale() === 'pt-BR' ? t.description : TOKEN_DESCRIPTIONS[t.name]?.[locale()] ?? t.description);

/** Razão de contraste no formato do idioma: 4,5:1 · 4.5:1. */
export const ratio = (n, digits = 2) => `${new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)}:1`;
