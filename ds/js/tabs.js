/**
 * Abas — padrão ARIA de tabs (tablist / tab / tabpanel).
 *
 *   const unmount = mountTabs(root);   // liga todas as abas [data-ds-tabs] dentro de root, inclusive as que entrarem depois
 *   selectTab(tabElement);             // troca de aba por código
 *   root.addEventListener('ds:tabchange', (e) => e.detail.tab);
 *
 * Marcação: veja ds/components/tabs.css. Use data-activation="manual" quando trocar de painel for caro:
 * as setas só movem o foco e Enter/Espaço ativam.
 */

const TAB = '[role="tab"]';
const isDisabled = (tab) => tab.disabled || tab.getAttribute('aria-disabled') === 'true';
// só as abas deste conjunto (ignora abas aninhadas em outro [data-ds-tabs])
const tabsOf = (root) => [...root.querySelectorAll(`[role="tablist"] ${TAB}`)].filter((t) => t.closest('[data-ds-tabs]') === root);
const panelOf = (tab) => (tab.getAttribute('aria-controls') ? document.getElementById(tab.getAttribute('aria-controls')) : null);

function apply(root, selected, { announce }) {
  for (const tab of tabsOf(root)) {
    const on = tab === selected;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    const panel = panelOf(tab);
    if (panel) {
      panel.hidden = !on;
      if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;
    }
  }
  if (announce) root.dispatchEvent(new CustomEvent('ds:tabchange', { bubbles: true, detail: { tab: selected, id: selected.id } }));
}

/** Normaliza o estado (aria-selected, tabindex, hidden) a partir da marcação. */
export function syncTabs(root) {
  const tabs = tabsOf(root);
  const selected = tabs.find((t) => t.getAttribute('aria-selected') === 'true' && !isDisabled(t)) ?? tabs.find((t) => !isDisabled(t));
  if (selected) apply(root, selected, { announce: false });
}

export function selectTab(tab) {
  const root = tab?.closest('[data-ds-tabs]');
  if (!root || isDisabled(tab)) return;
  if (tab.getAttribute('aria-selected') === 'true') return;
  apply(root, tab, { announce: true });
}

export function mountTabs(scope = document) {
  const container = scope === document ? document.body : scope;
  container.querySelectorAll('[data-ds-tabs]').forEach(syncTabs);

  const onClick = (event) => {
    const tab = event.target.closest(TAB);
    if (tab && tab.closest('[data-ds-tabs]') && container.contains(tab)) selectTab(tab);
  };

  const onKeydown = (event) => {
    const tab = event.target.closest?.(TAB);
    const root = tab?.closest('[data-ds-tabs]');
    if (!root || !container.contains(root)) return;
    const list = tab.closest('[role="tablist"]');
    const vertical = list?.getAttribute('aria-orientation') === 'vertical';
    const enabled = tabsOf(root).filter((t) => !isDisabled(t));
    const i = enabled.indexOf(tab);
    const keys = vertical ? { ArrowDown: 1, ArrowUp: -1 } : { ArrowRight: 1, ArrowLeft: -1 };
    let next = null;
    if (event.key in keys) next = enabled[(i + keys[event.key] + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled.at(-1);
    else if ((event.key === 'Enter' || event.key === ' ') && root.dataset.activation === 'manual') {
      event.preventDefault();
      selectTab(tab);
      return;
    }
    if (!next) return;
    event.preventDefault();
    next.focus();
    if (root.dataset.activation !== 'manual') selectTab(next);
  };

  container.addEventListener('click', onClick);
  container.addEventListener('keydown', onKeydown);

  // abas que entrarem depois (conteúdo renderizado por JS) já chegam normalizadas
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches('[data-ds-tabs]')) syncTabs(node);
        node.querySelectorAll('[data-ds-tabs]').forEach(syncTabs);
      }
    }
  });
  observer.observe(container, { childList: true, subtree: true });

  return () => {
    container.removeEventListener('click', onClick);
    container.removeEventListener('keydown', onKeydown);
    observer.disconnect();
  };
}
