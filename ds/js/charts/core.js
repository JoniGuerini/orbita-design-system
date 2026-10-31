/**
 * Órbita — gráficos: núcleo compartilhado.
 *
 * Tudo o que os gráficos têm em comum: formatação de números (pt-BR), escalas, cores por papel,
 * medição de texto, a moldura (<figure> com título, legenda, tooltip, tabela e região ao vivo)
 * e a camada de interação (ponteiro + teclado).
 *
 * Os gráficos em si ficam em bar.js, line.js, donut.js, heatmap.js, scatter.js e figures.js.
 */
import { icon } from '../../icons/icons.js';

let uid = 0;
export const nextId = (prefix = 'chart') => `ds-${prefix}-${++uid}`;

export const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── Números ───────── */

const NF = (options) => new Intl.NumberFormat('pt-BR', options);

const PRESETS = {
  number: NF({ maximumFractionDigits: 1 }).format,
  integer: NF({ maximumFractionDigits: 0 }).format,
  compact: NF({ notation: 'compact', maximumFractionDigits: 1 }).format,
  percent: NF({ style: 'percent', maximumFractionDigits: 1 }).format,
  currency: NF({ style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format,
  'currency-compact': NF({ style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format,
};

const AXIS = {
  percent: NF({ style: 'percent', maximumFractionDigits: 0 }).format,
  currency: PRESETS['currency-compact'],
  'currency-compact': PRESETS['currency-compact'],
};

/**
 * Formatação de valores: um preset ('number', 'integer', 'compact', 'percent' — razão 0–1 —,
 * 'currency', 'currency-compact'), opções de Intl.NumberFormat ou uma função.
 */
export function formatter(format = 'number') {
  if (typeof format === 'function') return format;
  if (format && typeof format === 'object') return NF(format).format;
  return PRESETS[format] ?? PRESETS.number;
}

/** Eixos arredondam e compactam a partir de mil (0 · 1 mil · 2 mil). */
export function axisFormatter(format = 'number', axisFormat) {
  if (axisFormat) return formatter(axisFormat);
  if (typeof format === 'function' || (format && typeof format === 'object')) return formatter(format);
  return AXIS[format] ?? PRESETS.compact;
}

/* ───────── Escalas ───────── */

/** Marcas "redondas" para o eixo: 0, 25, 50… ou 0, 2 mil, 4 mil… */
export function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, step: 1, ticks: [0, 1] };
  if (min === max) {
    if (min === 0) max = 1;
    else if (min > 0) min = 0;
    else max = 0;
  }
  const raw = (max - min) / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm > 5 ? 10 : norm > 2.5 ? 5 : norm > 2 ? 2.5 : norm > 1 ? 2 : 1) * mag;
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(round(v, 10));
  return { min: lo, max: hi, step, ticks };
}

export const linear = (d0, d1, r0, r1) => {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (v) => r0 + (v - d0) * k;
};

/* ───────── Cores (sempre por papel, nunca por posição na tela) ───────── */

/** Status (bom/ruim) usa a escala reservada dos gráficos — sempre com ícone e rótulo. */
const STATUS = {
  success: 'var(--ds-color-chart-status-good)',
  good: 'var(--ds-color-chart-status-good)',
  warning: 'var(--ds-color-chart-status-warning)',
  danger: 'var(--ds-color-chart-status-critical)',
  critical: 'var(--ds-color-chart-status-critical)',
  info: 'var(--ds-color-info-solid)',
};
let warnedPalette = false;

/**
 * color: número do slot (1–8), 'muted' | 'other', 'success' | 'warning' | 'danger' | 'info' (status),
 * 'seq-N' | 'ord-N' | 'div-N' ou qualquer cor CSS. Sem cor, a série usa o slot da sua posição
 * original — então esconder uma série não repinta as outras. Da 9ª em diante: 'other', nunca um tom novo.
 */
export function paint(color, index = 0) {
  if (color == null) {
    if (index < 8) return `var(--ds-color-chart-series-${index + 1})`;
    if (!warnedPalette) {
      warnedPalette = true;
      console.warn('[Órbita] Mais de 8 séries: as extras viram “Outros”. Agrupe a cauda ou use pequenos múltiplos.');
    }
    return 'var(--ds-color-chart-other)';
  }
  if (typeof color === 'number') return `var(--ds-color-chart-series-${clamp(color, 1, 8)})`;
  if (color === 'muted' || color === 'other') return `var(--ds-color-chart-${color})`;
  if (STATUS[color]) return STATUS[color];
  if (/^(seq|ord|div)-\d$/.test(color)) return `var(--ds-color-chart-${color})`;
  return color;
}

/* ───────── Texto ───────── */

export const FONTS = {
  tick: '400 12px Inter, system-ui, sans-serif',
  label: '500 13px Inter, system-ui, sans-serif',
  value: '600 12px Inter, system-ui, sans-serif',
};

let ctx;
export function textWidth(text, font = FONTS.tick) {
  ctx ??= document.createElement('canvas').getContext('2d');
  ctx.font = font;
  return ctx.measureText(String(text)).width;
}

/** Corta o texto com reticências para caber em `max` px. */
export function fitText(text, max, font = FONTS.label) {
  const s = String(text);
  if (textWidth(s, font) <= max) return s;
  let lo = 0;
  let hi = s.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (textWidth(`${s.slice(0, mid)}…`, font) <= max) lo = mid;
    else hi = mid - 1;
  }
  return lo ? `${s.slice(0, lo).trimEnd()}…` : '';
}

/** De quantos em quantos rótulos mostrar para que não colidam. */
export function labelStep(labels, band, font = FONTS.tick, pad = 12) {
  const widest = Math.max(0, ...labels.map((l) => textWidth(l, font)));
  return Math.max(1, Math.ceil((widest + pad) / Math.max(1, band)));
}

/* ───────── SVG ───────── */

export function attrs(o) {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${escapeHtml(v)}"`))
    .join(' ');
}

export const tag = (name, o = {}, children) => (children === undefined ? `<${name} ${attrs(o)}/>` : `<${name} ${attrs(o)}>${children}</${name}>`);

/** Retângulo com a ponta de dados arredondada e a base reta. end: 'top' | 'bottom' | 'right' | 'left' | 'none'. */
export function barPath(x, y, w, h, end = 'top', radius = 4) {
  if (w <= 0 || h <= 0) return '';
  const vertical = end === 'top' || end === 'bottom';
  const r = end === 'none' ? 0 : Math.max(0, Math.min(radius, vertical ? w / 2 : h / 2, vertical ? h : w));
  const f = (n) => round(n, 2);
  const [x0, y0, x1, y1] = [f(x), f(y), f(x + w), f(y + h)];
  if (!r) return `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  const a = (tx, ty, sweep = 1) => `A${f(r)} ${f(r)} 0 0 ${sweep} ${f(tx)} ${f(ty)}`;
  switch (end) {
    case 'top':
      return `M${x0} ${y1}V${f(y + r)}${a(x + r, y)}H${f(x + w - r)}${a(x + w, y + r)}V${y1}Z`;
    case 'bottom':
      return `M${x0} ${y0}V${f(y + h - r)}${a(x + r, y + h, 0)}H${f(x + w - r)}${a(x + w, y + h - r, 0)}V${y0}Z`;
    case 'right':
      return `M${x0} ${y0}H${f(x + w - r)}${a(x + w, y + r)}V${f(y + h - r)}${a(x + w - r, y + h)}H${x0}Z`;
    case 'left':
      return `M${x1} ${y0}H${f(x + r)}${a(x, y + r, 0)}V${f(y + h - r)}${a(x + r, y + h, 0)}H${x1}Z`;
    default:
      return `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  }
}

/** Curva monotônica (Fritsch–Carlson): suaviza sem inventar picos entre os pontos. */
export function monotonePath(pts) {
  const n = pts.length;
  if (n < 3) return linePath(pts);
  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1);
  }
  const t = [m[0]];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  t[n - 1] = m[n - 2];
  const f = (v) => round(v, 2);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${f(pts[i][0] + h)} ${f(pts[i][1] + t[i] * h)} ${f(pts[i + 1][0] - h)} ${f(pts[i + 1][1] - t[i + 1] * h)} ${f(pts[i + 1][0])} ${f(pts[i + 1][1])}`;
  }
  return d;
}

export const linePath = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${round(x, 2)} ${round(y, 2)}`).join('');

/** Divide uma série nos trechos sem lacunas (valores nulos quebram a linha). */
export function segments(points) {
  const out = [];
  let cur = [];
  for (const p of points) {
    if (p == null) {
      if (cur.length) out.push(cur);
      cur = [];
    } else cur.push(p);
  }
  if (cur.length) out.push(cur);
  return out;
}

/* Textura: o canal de reserva para daltonismo total, impressão e alto contraste. Só 45° e 135°. */
export function texturePatterns(id, colors) {
  return colors
    .map((c, i) => {
      const angle = i % 2 ? 135 : 45;
      const gap = [4, 4, 6, 6][i % 4];
      return `<pattern id="${id}-t${i}" patternUnits="userSpaceOnUse" width="${gap}" height="${gap}" patternTransform="rotate(${angle})">
        <rect width="${gap}" height="${gap}" style="fill:${c}"/><line x1="0" y1="0" x2="0" y2="${gap}" class="ds-chart__hatch"/></pattern>`;
    })
    .join('');
}

/* ───────── Moldura ───────── */

const TABLE_ON = 'Ver como gráfico';
const TABLE_OFF = 'Ver como tabela';

/**
 * Monta a <figure> do gráfico dentro de `host`.
 * options: { title, subtitle, label, card, table (true), empty, height }
 */
export function createFrame(host, options, { kind, describe: summary } = {}) {
  const id = nextId(kind);
  const figure = document.createElement('figure');
  figure.className = ['ds-chart', options.card && 'ds-chart--card', options.className].filter(Boolean).join(' ');
  figure.dataset.kind = kind;
  if (options.texture) figure.dataset.texture = '';

  const hasHead = options.title || options.subtitle || options.table !== false || options.actions;
  figure.innerHTML = `
    ${
      hasHead
        ? `<figcaption class="ds-chart__head">
            <div class="ds-chart__titles">
              ${options.title ? `<p class="ds-chart__title" id="${id}-title">${escapeHtml(options.title)}</p>` : ''}
              ${options.subtitle ? `<p class="ds-chart__subtitle">${escapeHtml(options.subtitle)}</p>` : ''}
            </div>
            <div class="ds-chart__actions">
              ${options.actions ?? ''}
              ${
                options.table !== false
                  ? `<button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-chart__toggle" data-chart-toggle aria-pressed="false" aria-label="${TABLE_OFF}" data-ds-tooltip="${TABLE_OFF}">${icon('table', { size: 16 })}</button>`
                  : ''
              }
            </div>
          </figcaption>`
        : ''
    }
    <div class="ds-chart__legend" data-legend hidden></div>
    <div class="ds-chart__body" data-body>
      <div class="ds-chart__plot" data-plot tabindex="0" role="group" aria-roledescription="gráfico" aria-describedby="${id}-hint"></div>
      <div class="ds-chart__tooltip" data-tooltip hidden></div>
    </div>
    <div class="ds-chart__table" data-table hidden></div>
    <p class="ds-visually-hidden" id="${id}-hint">Use as setas para percorrer os valores. A tabela tem todos os dados.</p>
    <p class="ds-visually-hidden" aria-live="polite" data-live></p>`;
  host.replaceChildren(figure);

  const $ = (sel) => figure.querySelector(sel);
  const body = $('[data-body]');
  const plot = $('[data-plot]');
  const tip = $('[data-tooltip]');
  const legendEl = $('[data-legend]');
  const tableEl = $('[data-table]');
  const live = $('[data-live]');
  const toggle = $('[data-chart-toggle]');
  const cleanups = [];

  plot.setAttribute('aria-label', [options.title ?? options.label ?? 'Gráfico', summary].filter(Boolean).join('. '));

  /* Tabela: o gêmeo acessível de todo gráfico */
  const onToggle = () => {
    const showTable = figure.dataset.view !== 'table';
    figure.dataset.view = showTable ? 'table' : 'chart';
    body.hidden = showTable;
    legendEl.hidden = showTable || !legendEl.childElementCount;
    tableEl.hidden = !showTable;
    toggle.setAttribute('aria-pressed', String(showTable));
    const label = showTable ? TABLE_ON : TABLE_OFF;
    toggle.setAttribute('aria-label', label);
    toggle.dataset.dsTooltip = label;
    toggle.innerHTML = icon(showTable ? 'bar-chart' : 'table', { size: 16 });
  };
  toggle?.addEventListener('click', onToggle);
  cleanups.push(() => toggle?.removeEventListener('click', onToggle));

  /* Tamanho */
  let width = 0;
  const resizeHandlers = [];
  let frameReq = 0;
  const ro = new ResizeObserver((entries) => {
    const w = Math.floor(entries[0].contentRect.width);
    if (!w || w === width) return;
    width = w;
    cancelAnimationFrame(frameReq);
    frameReq = requestAnimationFrame(() => resizeHandlers.forEach((fn) => fn(width)));
  });
  ro.observe(body);
  cleanups.push(() => ro.disconnect());

  // As fontes podem chegar depois do primeiro desenho; a medição de texto precisa delas.
  document.fonts?.ready.then(() => figure.isConnected && resizeHandlers.forEach((fn) => fn(width)));

  /* Entrada: anima uma vez, quando o gráfico aparece na tela */
  let entered = false;
  const io = new IntersectionObserver(
    (entries) => {
      if (entered || !entries.some((e) => e.isIntersecting)) return;
      entered = true;
      io.disconnect();
      if (reducedMotion()) return;
      figure.dataset.animate = '';
      setTimeout(() => delete figure.dataset.animate, 1100);
    },
    { threshold: 0.25 },
  );
  io.observe(figure);
  cleanups.push(() => io.disconnect());

  /* Tooltip */
  function renderTooltip(content) {
    tip.replaceChildren();
    if (content.title) {
      const t = document.createElement('p');
      t.className = 'ds-chart__tooltip-title';
      t.textContent = content.title;
      tip.append(t);
    }
    if (content.rows?.length) {
      const list = document.createElement('ul');
      list.className = 'ds-chart__tooltip-rows';
      for (const row of content.rows) {
        const li = document.createElement('li');
        li.className = 'ds-chart__tooltip-row';
        if (row.active) li.dataset.active = '';
        if (row.color) {
          const key = document.createElement('span');
          key.className = 'ds-chart__key-mark';
          key.dataset.mark = row.mark ?? 'line';
          key.style.setProperty('--c', row.color);
          li.append(key);
        }
        const value = document.createElement('span');
        value.className = 'ds-chart__tooltip-value';
        value.textContent = row.value;
        const name = document.createElement('span');
        name.className = 'ds-chart__tooltip-name';
        name.textContent = row.name ?? '';
        li.append(value, name);
        list.append(li);
      }
      tip.append(list);
    }
    if (content.note) {
      const n = document.createElement('p');
      n.className = 'ds-chart__tooltip-note';
      n.textContent = content.note;
      tip.append(n);
    }
  }

  function placeTooltip({ x, y }) {
    tip.hidden = false;
    const bw = body.clientWidth;
    const { offsetWidth: tw, offsetHeight: th } = tip;
    const gap = 12;
    let left = x + gap;
    if (left + tw > bw) left = x - gap - tw;
    if (left < 0) left = clamp(x - tw / 2, 0, Math.max(0, bw - tw));
    // acima da marca; sem espaço, ao lado (já deslocado na horizontal), dentro da área
    let top = y - th - gap;
    if (top < 0) top = clamp(y - th / 2, 0, Math.max(0, body.clientHeight - th));
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }

  const plainText = (c) => [c.title, ...(c.rows ?? []).map((r) => `${r.name ? `${r.name}: ` : ''}${r.value}`), c.note].filter(Boolean).join('. ');

  /* Interação: ponteiro + teclado, com a mesma informação nos dois */
  let api = null;
  let active = null;

  function show(index, { keyboard = false } = {}) {
    if (!api || index == null) return hide();
    active = index;
    api.highlight(index);
    const content = api.describe(index);
    if (api.tooltip === false) tip.hidden = true;
    else {
      renderTooltip(content);
      placeTooltip(api.anchor(index));
    }
    if (keyboard) live.textContent = plainText(content);
  }

  function hide() {
    active = null;
    api?.highlight(null);
    tip.hidden = true;
  }

  const point = (event) => {
    const r = plot.getBoundingClientRect();
    return [event.clientX - r.left, event.clientY - r.top];
  };

  const onMove = (event) => {
    if (!api) return;
    const i = api.hit(...point(event), event);
    if (i == null) hide();
    else if (i !== active || (tip.hidden && api.tooltip !== false)) show(i);
    else if (api.tooltip !== false) placeTooltip(api.anchor(i));
  };
  const onLeave = (event) => {
    if (event.pointerType === 'touch') return;
    hide();
  };
  const onKey = (event) => {
    if (!api) return;
    if (event.key === 'Escape') return hide();
    const next = api.move ? api.move(active, event.key) : moveLinear(active, event.key, api.count());
    if (next === undefined) return;
    event.preventDefault();
    show(next, { keyboard: true });
  };
  const onFocus = () => {
    if (plot.matches(':focus-visible') && api?.count()) show(active ?? api.first?.() ?? 0, { keyboard: true });
  };
  const onBlur = () => hide();

  plot.addEventListener('pointermove', onMove);
  plot.addEventListener('pointerdown', onMove);
  plot.addEventListener('pointerleave', onLeave);
  plot.addEventListener('keydown', onKey);
  plot.addEventListener('focus', onFocus);
  plot.addEventListener('blur', onBlur);
  cleanups.push(() => {
    plot.removeEventListener('pointermove', onMove);
    plot.removeEventListener('pointerdown', onMove);
    plot.removeEventListener('pointerleave', onLeave);
    plot.removeEventListener('keydown', onKey);
    plot.removeEventListener('focus', onFocus);
    plot.removeEventListener('blur', onBlur);
  });

  return {
    id,
    figure,
    plot,
    body,
    get width() {
      return width || Math.floor(body.clientWidth);
    },
    onResize(fn) {
      resizeHandlers.push(fn);
    },
    /** api: { count(), hit(x, y), anchor(i), describe(i), highlight(i|null), move?(i, key), first?() } */
    interact(next) {
      api = next;
    },
    refresh() {
      if (active == null) return;
      if (api && active < api.count()) show(active);
      else hide();
    },
    hide,
    setLabel(text) {
      plot.setAttribute('aria-label', text);
    },
    /** Título e subtítulo novos num update(). */
    setHead({ title, subtitle }) {
      const titles = figure.querySelector('.ds-chart__titles');
      if (!titles) return;
      titles.innerHTML = `${title ? `<p class="ds-chart__title" id="${id}-title">${escapeHtml(title)}</p>` : ''}${subtitle ? `<p class="ds-chart__subtitle">${escapeHtml(subtitle)}</p>` : ''}`;
    },
    /** items: [{ name, color, mark, hidden }] · onToggle(index) ou null para legenda estática */
    setLegend(items, onToggle) {
      legendEl.replaceChildren();
      if (!items?.length) {
        legendEl.hidden = true;
        return;
      }
      for (const [i, item] of items.entries()) {
        const el = document.createElement(onToggle ? 'button' : 'span');
        el.className = 'ds-chart__legend-item';
        if (onToggle) {
          el.type = 'button';
          el.setAttribute('aria-pressed', String(!item.hidden));
          el.addEventListener('click', () => onToggle(i));
        }
        const mark = document.createElement('span');
        mark.className = 'ds-chart__key-mark';
        mark.dataset.mark = item.mark ?? 'rect';
        mark.style.setProperty('--c', item.color);
        const name = document.createElement('span');
        name.textContent = item.name;
        el.append(mark, name);
        legendEl.append(el);
      }
      legendEl.setAttribute('role', 'group');
      legendEl.setAttribute('aria-label', onToggle ? 'Séries — clique para mostrar ou esconder' : 'Legenda');
      legendEl.hidden = figure.dataset.view === 'table';
    },
    /** { caption?, columns: [{ label, num? }], rows: [[...cells]] } */
    setTable({ columns, rows, caption }) {
      const head = columns.map((c) => `<th scope="col"${c.num ? ' class="ds-table__num"' : ''}>${escapeHtml(c.label)}</th>`).join('');
      const bodyRows = rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell, i) => (i === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td${columns[i]?.num ? ' class="ds-table__num"' : ''}>${escapeHtml(cell)}</td>`))
              .join('')}</tr>`,
        )
        .join('');
      tableEl.innerHTML = `<div class="ds-table-wrap" role="region" tabindex="0" aria-label="${escapeHtml(caption ?? options.title ?? 'Dados do gráfico')}">
        <table class="ds-table ds-table--compact"><thead><tr>${head}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
    },
    setLoading(on) {
      figure.toggleAttribute('data-loading', !!on);
      figure.setAttribute('aria-busy', String(!!on));
    },
    empty(text = options.empty ?? 'Sem dados para mostrar.') {
      plot.innerHTML = `<div class="ds-chart__empty" style="height:${options.height ?? 240}px">${icon('bar-chart', { size: 20 })}<span>${escapeHtml(text)}</span></div>`;
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      host.replaceChildren();
    },
  };
}

/** Setas percorrem índices 0…n-1; Home e End vão às pontas. */
export function moveLinear(active, key, count) {
  if (!count) return undefined;
  const i = active ?? -1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return Math.min(count - 1, i + 1);
  if (key === 'ArrowLeft' || key === 'ArrowUp') return Math.max(0, i < 0 ? 0 : i - 1);
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return undefined;
}

/* ───────── Eixos ───────── */

/** Grade horizontal + rótulos do eixo y (valores). */
export function yAxis({ ticks, y, left, right, format, baseline = 0, grid = true }) {
  return ticks
    .map((t) => {
      const py = round(Math.round(y(t)) + 0.5, 1);
      const isBase = t === baseline;
      const line = grid || isBase ? tag('line', { x1: left, x2: right, y1: py, y2: py, class: isBase ? 'ds-chart__baseline' : 'ds-chart__grid' }) : '';
      return `${line}${tag('text', { x: left - 10, y: py, class: 'ds-chart__tick', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, escapeHtml(format(t)))}`;
    })
    .join('');
}

/** Grade vertical + rótulos do eixo x (valores) — para barras horizontais e dispersão. */
export function xAxis({ ticks, x, top, bottom, format, baseline = 0, grid = true, labels = true }) {
  return ticks
    .map((t) => {
      const px = round(Math.round(x(t)) + 0.5, 1);
      const isBase = t === baseline;
      const line = grid || isBase ? tag('line', { x1: px, x2: px, y1: top, y2: bottom, class: isBase ? 'ds-chart__baseline' : 'ds-chart__grid' }) : '';
      const text = labels ? tag('text', { x: px, y: bottom + 18, class: 'ds-chart__tick', 'text-anchor': 'middle' }, escapeHtml(format(t))) : '';
      return line + text;
    })
    .join('');
}

/** Normaliza as séries de bar/line: { name, values, color, … } com o slot da posição original. */
export function normalizeSeries(series = []) {
  return series.map((s, i) => ({ ...s, index: i, values: (s.values ?? []).map((v) => (v == null || Number.isNaN(+v) ? null : +v)), paint: paint(s.color, i) }));
}
