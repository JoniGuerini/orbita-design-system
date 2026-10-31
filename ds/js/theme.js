/**
 * Tema: 'dark' (padrão da marca), 'light' ou 'system'.
 * Aplica em <html data-theme="…"> e persiste em localStorage.
 */

const KEY = 'ds-theme';
const PREFERENCES = ['dark', 'light', 'system'];
const DEFAULT = 'dark';
const root = document.documentElement;

export function getThemePreference() {
  try {
    const saved = localStorage.getItem(KEY);
    if (PREFERENCES.includes(saved)) return saved;
  } catch {}
  return DEFAULT;
}

export function resolvedTheme() {
  const pref = getThemePreference();
  if (pref !== 'system') return pref;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// tema pedido que ainda não foi aplicado (a transição aplica de forma assíncrona)
let pending = null;

export function setTheme(preference) {
  if (!PREFERENCES.includes(preference) || preference === (pending ?? root.dataset.theme)) return;
  pending = preference;
  try {
    localStorage.setItem(KEY, preference);
  } catch {}
  const apply = () => {
    root.dataset.theme = preference;
    if (pending === preference) pending = null;
    syncControls();
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduced) {
    // trocas rápidas cancelam a transição anterior — isso é esperado, não é erro
    const transition = document.startViewTransition(apply);
    [transition.ready, transition.finished, transition.updateCallbackDone].forEach((p) => p?.catch(() => {}));
  } else apply();
  root.dispatchEvent(new CustomEvent('ds:themechange', { detail: { preference, resolved: resolvedTheme() } }));
}

function syncControls() {
  const pref = getThemePreference();
  document.querySelectorAll('[data-theme-option]').forEach((btn) => {
    const checked = btn.dataset.themeOption === pref;
    btn.setAttribute('aria-checked', String(checked));
    btn.tabIndex = checked ? 0 : -1;
  });
}

/** Liga botões [data-theme-option] (dentro de um role="radiogroup"). */
export function bindThemeControls(scope = document) {
  scope.querySelectorAll('[data-theme-option]').forEach((btn) => {
    btn.addEventListener('click', () => setTheme(btn.dataset.themeOption));
  });

  scope.querySelectorAll('[role="radiogroup"]').forEach((group) => {
    const options = [...group.querySelectorAll('[data-theme-option]')];
    if (!options.length) return;
    group.addEventListener('keydown', (event) => {
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!delta) return;
      event.preventDefault();
      const index = options.indexOf(document.activeElement);
      const next = options[(index + delta + options.length) % options.length];
      next.focus();
      setTheme(next.dataset.themeOption);
    });
  });

  syncControls();
}

export function initTheme() {
  root.dataset.theme = getThemePreference();
}
