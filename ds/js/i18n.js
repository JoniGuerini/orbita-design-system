/**
 * Idioma: 'pt-BR', 'en' ou 'es' — ou 'system', que segue o idioma do sistema (o que o Lume não tiver vira inglês).
 * Aplica em <html lang="…">, persiste em localStorage e avisa com o evento ds:localechange.
 *
 *   msg('select.empty', 'abc')          // texto de um componente do DS no idioma atual
 *   tr({ 'pt-BR': 'Olá', en: 'Hi', es: 'Hola' })
 *   numberFormat({ style: 'percent' })  // Intl no idioma atual
 */
import { MESSAGES } from './messages.js';

const KEY = 'ds-locale';
export const LOCALES = ['pt-BR', 'en', 'es'];
export const LOCALE_NAMES = { 'pt-BR': 'Português', en: 'English', es: 'Español' };
const PREFERENCES = ['system', ...LOCALES];
const FALLBACK = 'en';
const root = document.documentElement;

export function getLocalePreference() {
  try {
    const saved = localStorage.getItem(KEY);
    if (PREFERENCES.includes(saved)) return saved;
  } catch {}
  return 'system';
}

/** O primeiro idioma do sistema que o Lume tem; senão, inglês. */
export function systemLocale() {
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const lang = String(tag).toLowerCase();
    if (lang.startsWith('pt')) return 'pt-BR';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('en')) return 'en';
  }
  return FALLBACK;
}

const resolve = (preference) => (preference === 'system' ? systemLocale() : preference);
let current = resolve(getLocalePreference());

export const locale = () => current;

export function setLocale(preference, { persist = true } = {}) {
  if (!PREFERENCES.includes(preference)) return;
  if (persist) {
    try {
      localStorage.setItem(KEY, preference);
    } catch {}
  }
  current = resolve(preference);
  root.lang = current;
  root.dispatchEvent(new CustomEvent('ds:localechange', { detail: { preference, locale: current } }));
}

export function initLocale() {
  root.lang = current;
}

// quem segue o sistema acompanha a troca de idioma do navegador
addEventListener('languagechange', () => {
  if (getLocalePreference() === 'system' && systemLocale() !== current) setLocale('system', { persist: false });
});

/** Texto do idioma atual num objeto { 'pt-BR', en, es }; qualquer outro valor volta como veio. */
export function tr(text) {
  if (text && typeof text === 'object' && !Array.isArray(text) && 'pt-BR' in text) return text[current] ?? text[FALLBACK] ?? text['pt-BR'];
  return text;
}

/** Texto de um componente do DS. Mensagens com valores são funções: msg('form.min', 3). */
export function msg(key, ...args) {
  const value = MESSAGES[current]?.[key] ?? MESSAGES[FALLBACK][key] ?? key;
  return typeof value === 'function' ? value(...args) : value;
}

export const numberFormat = (options) => new Intl.NumberFormat(current, options);
export const dateFormat = (options) => new Intl.DateTimeFormat(current, options);
export const formatNumber = (n, options) => numberFormat(options).format(n);
