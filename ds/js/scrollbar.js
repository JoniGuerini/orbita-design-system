/**
 * Barra de rolagem sobreposta.
 *
 * initScrollbars() esconde a barra nativa em todo o app (marca [data-ds-scrollbars] em <html>; o CSS
 * está em components/scrollbar.css) e desenha por cima de qualquer área que rola só a barra — sem
 * trilho nem setas. Ela aparece enquanto a pessoa rola e some um instante depois de parar.
 * Enquanto está visível dá para arrastá-la; com o ponteiro em cima, ela não some.
 *
 * Funciona por delegação: um ouvinte de scroll na fase de captura pega qualquer área, inclusive as
 * que entram depois — não há nada para registrar. A barra fica numa camada própria (no <body>, ou
 * dentro do <dialog> aberto, para aparecer na camada do topo) e não mexe no layout da área.
 *
 * Só aparece em rolagem feita pela pessoa (roda, toque, teclado, clique): um scrollTo do código
 * logo ao abrir uma página não faz a barra piscar.
 *
 * Para adiantar a marca e evitar o salto de layout no primeiro desenho, ponha
 * document.documentElement.setAttribute('data-ds-scrollbars', '') no script que roda antes do CSS.
 */

const HIDE_DELAY = 900;
const INTENT_WINDOW = 1200;
const MIN_THUMB = 28;
const RAIL = 12; // largura da área de pegar (a barra visível é mais fina, no CSS)
const PAD = 3; // folga nas pontas do trilho

const entries = new Map();
const dirty = new Set(); // rolou: reposiciona e mostra
const moved = new Set(); // mudou de lugar: só reposiciona
let installed = false;
let lastIntent = 0;
let frame = 0;

const root = () => document.scrollingElement ?? document.documentElement;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const intersect = (a, b) => ({ left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) });

/** Ancestrais que recortam a área (overflow diferente de visible), até a camada da barra. */
function clipAncestors(el, host) {
  const list = [];
  for (let a = el.parentElement; a && a !== host && a !== document.body && a !== document.documentElement; a = a.parentElement) {
    const cs = getComputedStyle(a);
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') list.push(a);
  }
  return list;
}

function entryFor(el) {
  let e = entries.get(el);
  if (e) return e;
  const isRoot = el === root();
  const cs = getComputedStyle(el);
  if (cs.getPropertyValue('--ds-scrollbar').trim() === 'none') return null;
  const host = (!isRoot && el.closest('dialog[open]')) || document.body;
  e = {
    el,
    host,
    fixed: host === document.body,
    isRoot,
    start: parseFloat(cs.getPropertyValue('--ds-scrollbar-start')) || 0,
    end: parseFloat(cs.getPropertyValue('--ds-scrollbar-end')) || 0,
    canY: isRoot || !/hidden|clip/.test(cs.overflowY),
    canX: isRoot || !/hidden|clip/.test(cs.overflowX),
    clips: isRoot ? [] : clipAncestors(el, host),
    rails: { y: null, x: null },
    geo: { y: null, x: null },
    timer: 0,
    hover: false,
    drag: false,
    visible: false,
  };
  entries.set(el, e);
  return e;
}

function railFor(e, axis) {
  const existing = e.rails[axis];
  if (existing?.isConnected) return existing;
  const rail = document.createElement('div');
  rail.className = `ds-scrollbar ds-scrollbar--${axis}`;
  rail.setAttribute('aria-hidden', 'true');
  if (!e.fixed) rail.style.position = 'absolute';
  rail.addEventListener('pointerdown', (ev) => startDrag(e, axis, ev));
  rail.addEventListener('pointerenter', () => {
    e.hover = true;
    show(e);
  });
  rail.addEventListener('pointerleave', () => {
    e.hover = false;
    scheduleHide(e);
  });
  e.host.append(rail);
  e.rails[axis] = rail;
  return rail;
}

/** Calcula e posiciona as barras de uma área. */
function update(e) {
  const el = e.el;
  let box;
  if (e.isRoot) box = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  else {
    const b = el.getBoundingClientRect();
    const left = b.left + el.clientLeft;
    const top = b.top + el.clientTop;
    box = { left, top, right: left + el.clientWidth, bottom: top + el.clientHeight };
  }
  let clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  for (const a of e.clips) clip = intersect(clip, a.getBoundingClientRect());
  let ox = 0;
  let oy = 0;
  if (!e.fixed) {
    const h = e.host.getBoundingClientRect();
    ox = h.left + e.host.clientLeft;
    oy = h.top + e.host.clientTop;
  }

  const maxY = el.scrollHeight - el.clientHeight;
  const maxX = el.scrollWidth - el.clientWidth;
  const hasY = e.canY && maxY > 1;
  const hasX = e.canX && maxX > 1;

  // vertical: na borda direita, se ela estiver à vista
  e.geo.y = null;
  if (hasY && box.right <= clip.right + 1) {
    const top = Math.max(box.top + e.start, clip.top) + PAD;
    const bottom = Math.min(box.bottom - e.end, clip.bottom) - PAD - (hasX ? RAIL : 0);
    const track = bottom - top;
    if (track >= MIN_THUMB * 1.5) {
      const thumb = clamp((track * el.clientHeight) / el.scrollHeight, MIN_THUMB, track);
      const pos = top + clamp(el.scrollTop / maxY, 0, 1) * (track - thumb);
      const rail = railFor(e, 'y');
      rail.style.transform = `translate(${Math.round(box.right - RAIL - ox)}px, ${Math.round(pos - oy)}px)`;
      rail.style.height = `${Math.round(thumb)}px`;
      e.geo.y = { track, thumb };
    }
  }
  // horizontal: na borda de baixo, se ela estiver à vista
  e.geo.x = null;
  if (hasX && box.bottom <= clip.bottom + 1) {
    const left = Math.max(box.left, clip.left) + PAD;
    const right = Math.min(box.right, clip.right) - PAD - (hasY ? RAIL : 0);
    const track = right - left;
    if (track >= MIN_THUMB * 1.5) {
      const thumb = clamp((track * el.clientWidth) / el.scrollWidth, MIN_THUMB, track);
      const pos = left + clamp(Math.abs(el.scrollLeft) / maxX, 0, 1) * (track - thumb);
      const rail = railFor(e, 'x');
      rail.style.transform = `translate(${Math.round(pos - ox)}px, ${Math.round(box.bottom - RAIL - oy)}px)`;
      rail.style.width = `${Math.round(thumb)}px`;
      e.geo.x = { track, thumb };
    }
  }
}

function show(e) {
  clearTimeout(e.timer);
  e.visible = true;
  for (const axis of ['y', 'x']) e.rails[axis]?.toggleAttribute('data-visible', Boolean(e.geo[axis]));
}

function hide(e) {
  e.visible = false;
  e.rails.y?.removeAttribute('data-visible');
  e.rails.x?.removeAttribute('data-visible');
  if (!e.el.isConnected) dispose(e);
}

function scheduleHide(e) {
  clearTimeout(e.timer);
  if (e.hover || e.drag) return;
  e.timer = setTimeout(() => hide(e), HIDE_DELAY);
}

function dispose(e) {
  clearTimeout(e.timer);
  e.rails.y?.remove();
  e.rails.x?.remove();
  entries.delete(e.el);
}

function startDrag(e, axis, ev) {
  const geo = e.geo[axis];
  if (ev.button !== 0 || !geo) return;
  ev.preventDefault();
  const el = e.el;
  const rail = e.rails[axis];
  const vertical = axis === 'y';
  const range = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
  const ratio = range / Math.max(1, geo.track - geo.thumb);
  const start = vertical ? el.scrollTop : el.scrollLeft;
  const origin = vertical ? ev.clientY : ev.clientX;
  rail.setPointerCapture(ev.pointerId);
  rail.setAttribute('data-active', '');
  e.drag = true;
  show(e);
  const move = (m) => {
    const delta = ((vertical ? m.clientY : m.clientX) - origin) * ratio;
    if (vertical) el.scrollTop = start + delta;
    else el.scrollLeft = start + delta;
  };
  const end = () => {
    rail.removeEventListener('pointermove', move);
    rail.removeEventListener('pointerup', end);
    rail.removeEventListener('pointercancel', end);
    rail.removeAttribute('data-active');
    e.drag = false;
    scheduleHide(e);
  };
  rail.addEventListener('pointermove', move);
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointercancel', end);
}

function flush() {
  frame = 0;
  for (const e of entries.values()) if (!e.el.isConnected && !e.visible) dispose(e);
  for (const e of dirty) {
    if (!e.el.isConnected) {
      dispose(e);
      continue;
    }
    update(e);
    show(e);
    scheduleHide(e);
  }
  for (const e of moved) {
    if (dirty.has(e) || !e.el.isConnected || !e.visible) continue;
    update(e);
    for (const axis of ['y', 'x']) e.rails[axis]?.toggleAttribute('data-visible', Boolean(e.geo[axis]));
  }
  dirty.clear();
  moved.clear();
}

function onScroll(event) {
  const target = event.target === document ? root() : event.target;
  if (!(target instanceof Element) || target.tagName === 'INPUT' || target.tagName === 'SELECT') return;
  const known = entries.get(target);
  const byPerson = performance.now() - lastIntent < INTENT_WINDOW;
  if (!byPerson && !known?.visible && !known?.drag) return;
  const e = known ?? entryFor(target);
  if (!e) return;
  dirty.add(e);
  frame ||= requestAnimationFrame(flush);
}

const onIntent = () => (lastIntent = performance.now());

/** A área mudou de lugar ou de tamanho (janela, gaveta que terminou de deslizar): reposiciona sem segurar a barra na tela. */
function onMove(event) {
  if (event?.target?.classList?.contains('ds-scrollbar')) return;
  for (const e of entries.values()) if (e.visible) moved.add(e);
  if (moved.size) frame ||= requestAnimationFrame(flush);
}

/** Liga a barra sobreposta no documento inteiro. Chamar mais de uma vez não duplica nada. */
export function initScrollbars() {
  if (installed) return;
  installed = true;
  document.documentElement.setAttribute('data-ds-scrollbars', '');
  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  for (const type of ['wheel', 'touchmove', 'keydown', 'pointerdown']) document.addEventListener(type, onIntent, { capture: true, passive: true });
  addEventListener('resize', onMove, { passive: true });
  document.addEventListener('transitionend', onMove, { capture: true, passive: true });
}
