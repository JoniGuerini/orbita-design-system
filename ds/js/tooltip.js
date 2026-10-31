/**
 * Tooltip global por delegação.
 *
 * <button data-ds-tooltip="Recolher menu" data-ds-tooltip-placement="top|right|bottom|left" data-ds-tooltip-kbd="⌘B">
 *
 * Desative em uma região com data-ds-tooltips="off" num ancestral
 * (o shell usa isso para só mostrar tooltips da sidebar quando ela está recolhida).
 *
 * WCAG 1.4.13 (conteúdo em hover ou foco):
 * - dá para apontar o próprio tooltip sem que ele suma (ponte entre gatilho e balão + tolerância de saída);
 * - Esc fecha sem mover o foco nem o ponteiro, e ele não volta até você sair do gatilho;
 * - fica aberto enquanto o gatilho estiver em hover ou foco — nada de sumir sozinho.
 */

const DELAY = 450;
const WARM_WINDOW = 400;
const GRACE = 160;
const GAP = 10;
const MARGIN = 8;

let tip;
let anchor = null;
let showTimer;
let hideTimer;
let coolTimer;
let warm = false;
let overAnchor = false;
let overTip = false;
let focusAnchor = false;
/** Gatilho fechado com Esc (ou clicado): não reabre até o ponteiro sair dele ou o foco ir para outro lugar. */
let dismissed = null;
let frame = 0;

function enabled(el) {
  return el && !el.closest('[data-ds-tooltips="off"]');
}

function position(el) {
  const placement = el.dataset.dsTooltipPlacement ?? 'top';
  const r = el.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  let x;
  let y;
  if (placement === 'right') {
    x = r.right + GAP;
    y = r.top + r.height / 2 - t.height / 2;
  } else if (placement === 'left') {
    x = r.left - t.width - GAP;
    y = r.top + r.height / 2 - t.height / 2;
  } else if (placement === 'bottom') {
    x = r.left + r.width / 2 - t.width / 2;
    y = r.bottom + GAP;
  } else {
    x = r.left + r.width / 2 - t.width / 2;
    y = r.top - t.height - GAP;
  }
  x = Math.min(Math.max(MARGIN, x), innerWidth - t.width - MARGIN);
  y = Math.min(Math.max(MARGIN, y), innerHeight - t.height - MARGIN);
  tip.dataset.placement = placement;
  tip.style.transform = '';
  tip.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
}

function show(el) {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  clearTimeout(coolTimer);
  if (!el.isConnected) return;
  anchor = el;
  const kbd = el.dataset.dsTooltipKbd;
  tip.textContent = el.dataset.dsTooltip;
  if (kbd) {
    const k = document.createElement('kbd');
    k.className = 'ds-kbd';
    k.textContent = kbd;
    tip.append(k);
  }
  position(el);
  tip.setAttribute('data-open', '');
  warm = true;
}

function hide() {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  overAnchor = false;
  overTip = false;
  focusAnchor = false;
  if (!anchor) return;
  anchor = null;
  tip.removeAttribute('data-open');
  coolTimer = setTimeout(() => (warm = false), WARM_WINDOW);
}

/** Só fecha se nem o gatilho nem o balão estiverem em hover ou foco — com uma tolerância para cruzar o vão. */
function release() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!anchor) return;
    if (!anchor.isConnected || (!overAnchor && !overTip && !focusAnchor)) hide();
  }, GRACE);
}

function schedule(el) {
  clearTimeout(showTimer);
  if (warm) show(el);
  else showTimer = setTimeout(() => show(el), DELAY);
}

export function initTooltips() {
  if (tip) return;
  tip = document.createElement('div');
  tip.className = 'ds-tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('aria-hidden', 'true');
  document.body.append(tip);

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType === 'touch') return;
    if (tip.contains(event.target)) {
      if (anchor) {
        overTip = true;
        clearTimeout(hideTimer);
      }
      return;
    }
    const el = event.target.closest?.('[data-ds-tooltip]');
    if (!enabled(el)) {
      clearTimeout(showTimer);
      if (anchor) {
        overAnchor = false;
        release();
      }
      return;
    }
    if (el === dismissed) return;
    if (el === anchor) {
      overAnchor = true;
      clearTimeout(hideTimer);
      return;
    }
    if (anchor) hide();
    overAnchor = true;
    schedule(el);
  });

  document.addEventListener('pointerout', (event) => {
    const to = event.relatedTarget;
    if (dismissed && dismissed.contains(event.target) && !dismissed.contains(to)) dismissed = null;
    if (!anchor) {
      if (!to || !event.target.closest?.('[data-ds-tooltip]')?.contains(to)) clearTimeout(showTimer);
      return;
    }
    if (tip.contains(event.target) && !tip.contains(to)) {
      overTip = false;
      if (!anchor.contains(to)) release();
    } else if (anchor.contains(event.target) && !anchor.contains(to)) {
      overAnchor = false;
      if (!tip.contains(to)) release();
    }
  });

  document.addEventListener('focusin', (event) => {
    const el = event.target.closest?.('[data-ds-tooltip]');
    if (dismissed && dismissed !== el) dismissed = null;
    if (!enabled(el) || el === dismissed || !el.matches(':focus-visible')) return;
    if (anchor && anchor !== el) hide();
    focusAnchor = true;
    show(el);
  });

  document.addEventListener('focusout', (event) => {
    if (dismissed?.contains(event.target) && !dismissed.matches(':hover')) dismissed = null;
    if (!anchor || !anchor.contains(event.target)) return;
    focusAnchor = false;
    if (!overAnchor && !overTip) hide();
  });

  document.addEventListener('pointerdown', (event) => {
    if (tip.contains(event.target)) return;
    const el = event.target.closest?.('[data-ds-tooltip]');
    if (el) dismissed = el;
    hide();
  });

  // Rolar não fecha: o balão acompanha o gatilho e só some se o gatilho sair da tela.
  document.addEventListener(
    'scroll',
    () => {
      if (!anchor) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!anchor) return;
        const r = anchor.getBoundingClientRect();
        if (!anchor.isConnected || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) hide();
        else position(anchor);
      });
    },
    true,
  );
  addEventListener('resize', hide);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !anchor) return;
    dismissed = anchor;
    hide();
  });
}
