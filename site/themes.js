/**
 * Os três temas da documentação: Lume claro, Lume escuro e Laranja (o pêssego quente).
 * As páginas que comparam temas percorrem THEME_IDS — a ordem é a dos seletores (o Lume primeiro).
 */
import { icon } from '../ds/icons/icons.js';
import { locale } from '../ds/js/i18n.js';
import { L } from './i18n.js';

export const THEME_IDS = ['light', 'dark', 'orange'];
export const isDarkTheme = (id) => id === 'dark';

const LABELS = () => ({
  light: L('Lume claro', 'Lume light', 'Lume claro'),
  dark: L('Lume escuro', 'Lume dark', 'Lume oscuro'),
  orange: L('Laranja', 'Orange', 'Naranja'),
});
const ICONS = { light: 'sun', dark: 'moon', orange: 'palette' };

export const themeLabel = (id) => LABELS()[id];
export const themeIcon = (id) => ICONS[id];

/** Segmentado com os três temas para um palco de exemplo: botões [data-<attr>="<tema>"]. */
export function themeSwitch(attr, current, { label = L('Tema do exemplo', 'Example theme', 'Tema del ejemplo'), className = '' } = {}) {
  return `<div class="ds-segmented ${className}" role="radiogroup" aria-label="${label}">
    ${THEME_IDS.map((id) => `<button type="button" class="ds-segmented__item" role="radio" data-${attr}="${id}" aria-checked="${id === current}" aria-label="${themeLabel(id)}" data-ds-tooltip="${themeLabel(id)}">${icon(ICONS[id], { size: 16 })}</button>`).join('')}
  </div>`;
}

/** “4,5:1 no Lume claro, 5:1 no Lume escuro e 6:1 no Laranja” — fn(id) dá o valor de cada tema. */
export function perTheme(fn) {
  const at = L('no', 'in', 'en');
  return new Intl.ListFormat(locale(), { type: 'conjunction' }).format(THEME_IDS.map((id) => `${fn(id)} ${at} ${themeLabel(id)}`));
}
