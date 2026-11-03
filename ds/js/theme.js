/**
 * Tema = modo × paleta.
 *   modo: 'light', 'dark' ou 'system' (segue o sistema) — salvo em ds-theme
 *   paleta: 'lume' (padrão: ardósia e terracota) ou 'orange' (o pêssego quente) — salva em ds-palette
 * O <html data-theme> recebe o tema resolvido: light · dark (Lume) ou orange · orange-dark (Laranja).
 */

const KEY = 'ds-theme';
const PALETTE_KEY = 'ds-palette';
const PREFERENCES = ['light', 'dark', 'system'];
export const PALETTES = ['lume', 'orange'];
const DEFAULT = 'light';
const DEFAULT_PALETTE = 'lume';
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
  const saved = read(KEY);
  if (saved === 'refugio') return 'light';
  return PREFERENCES.includes(saved) ? saved : DEFAULT;
}

export function getPalette() {
  const saved = read(PALETTE_KEY);
  if (PALETTES.includes(saved)) return saved;
  // antes das paletas, Claro e Escuro eram o pêssego quente: quem os tinha escolhido continua no Laranja
  const legacy = read(KEY);
  if ((legacy === 'light' || legacy === 'dark') && !read('ds-theme-migrated')) return 'orange';
  return DEFAULT_PALETTE;
}

/** Tema resolvido para um modo (claro/escuro) na paleta atual ou na indicada. */
export function themeFor(mode, palette = getPalette()) {
  const dark = mode === 'dark' || (mode === 'system' && darkQuery.matches);
  if (palette === 'orange') return dark ? 'orange-dark' : 'orange';
  return dark ? 'dark' : 'light';
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
    syncControls();
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduced) {
    // trocas rápidas cancelam a transição anterior — isso é esperado, não é erro
    const transition = document.startViewTransition(run);
    [transition.ready, transition.finished, transition.updateCallbackDone].forEach((p) => p?.catch(() => {}));
  } else run();
}

function announce() {
  root.dispatchEvent(new CustomEvent('ds:themechange', { detail: { preference: getThemePreference(), palette: getPalette(), resolved: resolvedTheme() } }));
}

export function setTheme(preference) {
  if (!PREFERENCES.includes(preference)) return;
  write(KEY, preference);
  write('ds-theme-migrated', '1');
  apply(resolvedTheme());
  syncControls();
  announce();
}

export function setPalette(palette) {
  if (!PALETTES.includes(palette)) return;
  write(PALETTE_KEY, palette);
  write('ds-theme-migrated', '1');
  apply(resolvedTheme());
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
