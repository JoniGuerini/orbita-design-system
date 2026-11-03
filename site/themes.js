/**
 * Os quatro temas da documentação: duas paletas (Lume e Laranja), cada uma com claro e escuro.
 * As páginas que comparam temas percorrem THEME_IDS — a ordem é a dos seletores (Lume primeiro).
 */
import { locale } from '../ds/js/i18n.js';
import { L } from './i18n.js';

export const THEME_IDS = ['light', 'dark', 'orange', 'orange-dark'];
export const isDarkTheme = (id) => id === 'dark' || id === 'orange-dark';

const LABELS = () => ({
  light: L('Lume claro', 'Lume light', 'Lume claro'),
  dark: L('Lume escuro', 'Lume dark', 'Lume oscuro'),
  orange: L('Laranja claro', 'Orange light', 'Naranja claro'),
  'orange-dark': L('Laranja escuro', 'Orange dark', 'Naranja oscuro'),
});

export const themeLabel = (id) => LABELS()[id];
export const themeIcon = (id) => (isDarkTheme(id) ? 'moon' : 'sun');

/** “4,5:1 no Lume claro, 5:1 no Lume escuro, … e 6:1 no Laranja escuro” — fn(id) dá o valor de cada tema. */
export function perTheme(fn) {
  const at = L('no', 'in', 'en');
  return new Intl.ListFormat(locale(), { type: 'conjunction' }).format(THEME_IDS.map((id) => `${fn(id)} ${at} ${themeLabel(id)}`));
}
