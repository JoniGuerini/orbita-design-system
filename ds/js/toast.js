/**
 * Toast — aviso curto e passageiro, anunciado para leitores de tela.
 *
 *   toast('Link copiado');
 *   toast('Projeto arquivado', { tone: 'success', action: { label: 'Desfazer', onClick: () => … } });
 *   const t = toast('Sincronizando…', { duration: Infinity });  t.close();
 *   copyText('var(--ds-color-brand-500)');   // copia e avisa
 *
 *   toast('Nova mensagem', { position: 'top-end' });
 *   setToastPosition('bottom-end');   // padrão do app (salvo no navegador)
 *
 * Opções: icon (nome do ícone), tone ('neutral' | 'success' | 'warning' | 'danger' | 'info'),
 * action ({ label, onClick }), duration (ms; padrão 2200, 5000 com ação; Infinity = até fechar),
 * position ('top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end').
 * O tempo pausa enquanto o ponteiro ou o foco estão no toast. No máximo 3 por posição.
 * Cada posição tem a própria região (role="status", aria-live="polite"), criada quando é usada.
 */
import { icon } from '../icons/icons.js';
import { msg } from './i18n.js';

const DURATION = 2200;
const DURATION_WITH_ACTION = 5000;
const MAX_VISIBLE = 3;
const TONE_ICONS = { success: 'check-circle', warning: 'alert-triangle', danger: 'alert-circle', info: 'info' };

export const TOAST_POSITIONS = ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'];
const DEFAULT_POSITION = 'bottom-center';
const POSITION_KEY = 'ds-toast-position';
const regions = new Map();

const isPosition = (value) => TOAST_POSITIONS.includes(value);

/** Posição padrão do app (a salva no navegador, ou embaixo ao centro). */
export function getToastPosition() {
  try {
    const saved = localStorage.getItem(POSITION_KEY);
    if (isPosition(saved)) return saved;
  } catch {}
  return DEFAULT_POSITION;
}

/** Define a posição padrão do app e salva no navegador. Devolve a posição aplicada. */
export function setToastPosition(position) {
  const next = isPosition(position) ? position : DEFAULT_POSITION;
  try {
    if (next === DEFAULT_POSITION) localStorage.removeItem(POSITION_KEY);
    else localStorage.setItem(POSITION_KEY, next);
  } catch {}
  return next;
}

function ensureRegion(position) {
  const existing = regions.get(position);
  if (existing?.isConnected) return existing;
  const region = document.createElement('div');
  region.className = `ds-toast-region ds-toast-region--${position}`;
  region.dataset.position = position;
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.append(region);
  regions.set(position, region);
  return region;
}

const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** HTML interno do toast — usado pela API e pelas prévias estáticas da documentação. */
export function toastContent(message, { icon: name, tone = 'neutral', action, dismissible = false } = {}) {
  const toned = tone !== 'neutral';
  const glyph = name ?? TONE_ICONS[tone] ?? 'check';
  return `<span class="ds-toast__icon">${icon(glyph, { size: toned ? 14 : 18 })}</span>
    <span class="ds-toast__message">${escape(message)}</span>
    ${action ? `<button type="button" class="ds-toast__action" data-toast-action>${escape(action.label)}</button>` : ''}
    ${dismissible ? `<button type="button" class="ds-toast__close" data-toast-close aria-label="${msg('toast.close')}">${icon('x', { size: 16 })}</button>` : ''}`;
}

export const toastClasses = ({ tone = 'neutral' } = {}) => `ds-toast${tone !== 'neutral' ? ` ds-toast--${tone}` : ''}`;

export function toast(message, options = {}) {
  const { action, duration } = options;
  const position = isPosition(options.position) ? options.position : getToastPosition();
  const time = duration ?? (action ? DURATION_WITH_ACTION : DURATION);
  const persistent = !Number.isFinite(time) || time <= 0;

  const el = document.createElement('div');
  el.className = toastClasses(options);
  el.innerHTML = toastContent(message, { ...options, dismissible: persistent });

  const host = ensureRegion(position);
  host.append(el);
  // excesso: os mais antigos saem primeiro
  const visible = [...host.querySelectorAll('.ds-toast:not([data-leaving])')];
  visible.slice(0, Math.max(0, visible.length - MAX_VISIBLE)).forEach((old) => old.dsClose?.());

  let timer;
  let remaining = time;
  let started = 0;
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    el.setAttribute('data-leaving', '');
    el.removeAttribute('data-open');
    setTimeout(() => el.remove(), 320);
  };
  el.dsClose = close;

  const start = () => {
    if (persistent || closed) return;
    started = Date.now();
    timer = setTimeout(close, remaining);
  };
  const pause = () => {
    if (persistent || closed) return;
    clearTimeout(timer);
    remaining = Math.max(800, remaining - (Date.now() - started));
  };

  el.addEventListener('pointerenter', pause);
  el.addEventListener('pointerleave', start);
  el.addEventListener('focusin', pause);
  el.addEventListener('focusout', start);
  el.addEventListener('click', (event) => {
    if (event.target.closest('[data-toast-action]')) {
      action?.onClick?.();
      close();
    } else if (event.target.closest('[data-toast-close]')) {
      close();
    }
  });

  requestAnimationFrame(() => requestAnimationFrame(() => el.setAttribute('data-open', '')));
  start();

  return { el, close, position };
}

/** Fecha todos os toasts visíveis, em todas as posições (útil ao sair de uma página). */
export function clearToasts() {
  regions.forEach((region) => region.querySelectorAll('.ds-toast').forEach((el) => el.dsClose?.()));
}

/** Plano B para navegadores/contextos sem a API de clipboard. */
function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {}
  area.remove();
  return ok;
}

export async function copyText(text, label = msg('toast.copied')) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    ok = legacyCopy(text);
  }
  if (ok) toast(`${label}: ${text}`);
  else toast(msg('toast.copyFailed'), { icon: 'alert-circle' });
}
