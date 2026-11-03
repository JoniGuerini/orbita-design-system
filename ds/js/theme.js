/**
 * Tema: 'system' (padrão: segue o sistema entre o Lume claro e o Lume escuro), 'light' (Lume claro),
 * 'dark' (Lume escuro) ou 'orange' (Laranja, o pêssego quente). Salvo em ds-theme.
 * O <html data-theme> recebe o tema resolvido: light, dark ou orange — "system" só existe no JS.
 */

const KEY = 'ds-theme';
// versão dos valores salvos: até a 0.9, 'light' era o pêssego (hoje Laranja) e 'refugio' era o Lume claro
const VERSION_KEY = 'ds-theme-v';
const VERSION = '2';
export const THEMES = ['light', 'dark', 'orange'];
const PREFERENCES = ['system', ...THEMES];
const DEFAULT = 'system';
const root = document.documentElement;
const darkQuery = matchMedia('(prefers-color-scheme: dark)');

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

export function getThemePreference() {
  let saved = read(KEY);
  if (read(VERSION_KEY) !== VERSION) {
    saved = { refugio: 'light', light: 'orange' }[saved] ?? saved;
    if (PREFERENCES.includes(saved)) write(KEY, saved);
    write(VERSION_KEY, VERSION);
  }
  return PREFERENCES.includes(saved) ? saved : DEFAULT;
}

/** Tema resolvido de uma preferência: "system" vira o Lume claro ou o Lume escuro. */
export function themeFor(preference) {
  if (preference === 'system') return darkQuery.matches ? 'dark' : 'light';
  return THEMES.includes(preference) ? preference : 'light';
}

export function resolvedTheme() {
  return themeFor(getThemePreference());
}

// tema pedido que ainda não foi aplicado (a transição aplica de forma assíncrona)
let pending = null;

function apply(next) {
  if (next === (pending ?? root.dataset.theme)) return;
  pending = next;
  const run = () => {
    root.dataset.theme = next;
    if (pending === next) pending = null;
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduced) {
    // trocas rápidas cancelam a transição anterior — isso é esperado, não é erro
    const transition = document.startViewTransition(run);
    [transition.ready, transition.finished, transition.updateCallbackDone].forEach((p) => p?.catch(() => {}));
  } else run();
}

function announce() {
  root.dispatchEvent(new CustomEvent('ds:themechange', { detail: { preference: getThemePreference(), resolved: resolvedTheme() } }));
}

export function setTheme(preference) {
  if (!PREFERENCES.includes(preference)) return;
  write(KEY, preference);
  write(VERSION_KEY, VERSION);
  apply(resolvedTheme());
  syncControls();
  announce();
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
  root.dataset.theme = resolvedTheme();
  // "Sistema": acompanha a troca de claro/escuro do sistema
  darkQuery.addEventListener('change', () => {
    if (getThemePreference() !== 'system') return;
    apply(resolvedTheme());
    announce();
  });
}
