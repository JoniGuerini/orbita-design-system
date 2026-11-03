/**
 * Lume — mapas de calor: matriz e calendário.
 *
 * heatmap(host, {
 *   rows: ['Seg', …], columns: ['0h', …], values: [[…], …],   values[linha][coluna]; null = sem dado
 *   scale: 'sequential' | 'diverging',                           sequencial = um tom; divergente = dois tons + meio neutro
 *   steps: 5 | 7, domain: [min, max], center: 0,
 *   format, valueLabel: 'pedidos', cellHeight, scaleLabels: ['Menos', 'Mais'],
 *   title, subtitle, label, card, table,
 * })
 *
 * calendarHeatmap(host, { start: '2025-11-02', values: [...um por dia], format, valueLabel, … })
 *
 * Ambos → { update(options), setLoading(bool), destroy(), el }. Até 7 faixas de cor; acima disso, use uma tabela.
 */
import { createFrame, formatter, textWidth, fitText, labelStep, tag, escapeHtml, round, clamp, FONTS } from './core.js';
import { locale, msg, dateFormat } from '../i18n.js';

const GAP = 2;
const SEQ_INDEX = { 3: [2, 4, 7], 4: [1, 3, 5, 7], 5: [1, 2, 4, 6, 7], 6: [1, 2, 3, 5, 6, 7], 7: [1, 2, 3, 4, 5, 6, 7] };

/** Faixas de cor: devolve (v) → { color, bin } e as faixas para a legenda de escala. */
function makeScale(o, flat) {
  const steps = clamp(o.steps ?? 5, 3, 7);
  const tokens = SEQ_INDEX[steps];
  const present = flat.filter((v) => v != null);
  if (o.scale === 'diverging') {
    const center = o.center ?? 0;
    const [lo, hi] = o.domain ?? [Math.min(...present), Math.max(...present)];
    const m = Math.max(Math.abs(lo - center), Math.abs(hi - center)) || 1;
    const half = (steps - 1) / 2;
    const div = steps === 7 ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 4, 6, 7];
    const n = steps === 7 ? 7 : 5;
    const h = (n - 1) / 2;
    return {
      kind: 'diverging',
      color(v) {
        if (v == null) return { color: 'var(--ds-color-chart-grid)', bin: null };
        const k = clamp(Math.round(((v - center) / m) * h) + h, 0, n - 1);
        return { color: `var(--ds-color-chart-div-${div[k]})`, bin: k };
      },
      bins: div.slice(0, n).map((t) => `var(--ds-color-chart-div-${t})`),
      // As cores são simétricas em torno do meio; a legenda mostra só a faixa que os dados ocupam
      // (uma contagem centrada na média não tem extremo negativo).
      ends: [Math.max(center - m, lo), Math.min(center + m, hi)],
      center,
      half,
    };
  }
  const lo = o.domain?.[0] ?? Math.min(0, ...present);
  const hi = o.domain?.[1] ?? Math.max(...present, lo + 1);
  return {
    kind: 'sequential',
    color(v) {
      if (v == null || (v === 0 && o.zeroEmpty !== false && lo >= 0)) return { color: 'var(--ds-color-chart-grid)', bin: null, empty: true };
      const k = clamp(Math.ceil(((v - lo) / (hi - lo || 1)) * steps), 1, steps);
      return { color: `var(--ds-color-chart-seq-${tokens[k - 1]})`, bin: k };
    },
    bins: tokens.map((t) => `var(--ds-color-chart-seq-${t})`),
    ends: [lo, hi],
  };
}

function scaleLegend(o, scale, fmt) {
  const labels = o.scaleLabels ?? [fmt(scale.ends[0]), fmt(scale.ends[1])];
  const empty = scale.kind === 'sequential' ? '<span class="ds-chart__scale-bin" style="--c:var(--ds-color-chart-grid)"></span>' : '';
  return `<div class="ds-chart__scale" aria-hidden="true">
    <span>${escapeHtml(labels[0])}</span>
    <span class="ds-chart__scale-bins">${empty}${scale.bins.map((c) => `<span class="ds-chart__scale-bin" style="--c:${c}"></span>`).join('')}</span>
    <span>${escapeHtml(labels[1])}</span>
  </div>`;
}

/* ───────── Matriz ───────── */

export function heatmap(host, input) {
  let source = input;
  let o = normalize(source);
  const frame = createFrame(host, o, { kind: 'heatmap' });
  let geo = null;

  function normalize(opts) {
    return { scale: 'sequential', steps: 5, rows: [], columns: [], values: [], ...opts };
  }

  function render() {
    const W = frame.width;
    if (!W) return;
    const R = o.rows.length;
    const C = o.columns.length;
    const flat = o.values.flat().map((v) => (v == null ? null : +v));
    if (!R || !C || flat.every((v) => v == null)) {
      geo = null;
      frame.empty();
      return;
    }
    const fmt = formatter(o.format);
    const scale = makeScale(o, flat);
    const left = Math.ceil(Math.max(...o.rows.map((l) => textWidth(l, FONTS.tick)))) + 12;
    const plotW = Math.max(60, W - left - 2);
    const cw = (plotW - (C - 1) * GAP) / C;
    const ch = o.cellHeight ?? clamp(cw, 14, 32);
    const top = 2;
    const gridH = R * (ch + GAP) - GAP;
    const H = top + gridH + 26;
    const rx = Math.min(4, cw / 4, ch / 4);

    let svg = '';
    o.rows.forEach((label, r) => {
      svg += tag('text', { x: left - 12, y: top + r * (ch + GAP) + ch / 2, class: 'ds-chart__tick', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, escapeHtml(label));
    });
    const step = labelStep(o.columns, cw + GAP);
    o.columns.forEach((label, c) => {
      if (c % step) return;
      svg += tag('text', { x: left + c * (cw + GAP) + cw / 2, y: top + gridH + 18, class: 'ds-chart__tick', 'text-anchor': 'middle' }, escapeHtml(fitText(label, (cw + GAP) * step - 4, FONTS.tick)));
    });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const v = o.values[r]?.[c];
        const { color } = scale.color(v == null ? null : +v);
        svg += tag('rect', {
          x: round(left + c * (cw + GAP)),
          y: round(top + r * (ch + GAP)),
          width: round(cw),
          height: round(ch),
          rx: round(rx),
          class: 'ds-chart__cell',
          style: `--c:${color};--d:${Math.min(c + r, 30) * 12}ms`,
        });
      }
    }
    svg += tag('rect', { class: 'ds-chart__cell-ring', 'data-ring': '', x: 0, y: 0, width: 0, height: 0, rx: round(rx + 1) });

    frame.plot.innerHTML = `<svg class="ds-chart__svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg}</svg>${o.scaleLegend === false ? '' : scaleLegend(o, scale, fmt)}`;
    geo = { R, C, left, top, cw, ch, fmt, scale };

    frame.setTable({
      columns: [{ label: o.rowLabel ?? '' }, ...o.columns.map((c) => ({ label: c, num: true }))],
      rows: o.rows.map((label, r) => [label, ...o.columns.map((_, c) => (o.values[r]?.[c] == null ? '—' : fmt(o.values[r][c])))]),
    });
    frame.refresh();
  }

  frame.interact({
    count: () => (geo ? geo.R * geo.C : 0),
    hit(px, py) {
      if (!geo) return null;
      const c = Math.floor((px - geo.left + GAP / 2) / (geo.cw + GAP));
      const r = Math.floor((py - geo.top + GAP / 2) / (geo.ch + GAP));
      return c >= 0 && c < geo.C && r >= 0 && r < geo.R ? r * geo.C + c : null;
    },
    move(i, key) {
      if (!geo) return undefined;
      const cur = i ?? -1;
      const r = cur < 0 ? 0 : Math.floor(cur / geo.C);
      const c = cur < 0 ? -1 : cur % geo.C;
      const to = (rr, cc) => clamp(rr, 0, geo.R - 1) * geo.C + clamp(cc, 0, geo.C - 1);
      if (key === 'ArrowRight') return to(r, c + 1);
      if (key === 'ArrowLeft') return to(r, Math.max(0, c - 1));
      if (key === 'ArrowDown') return to(r + 1, Math.max(0, c));
      if (key === 'ArrowUp') return to(r - 1, Math.max(0, c));
      if (key === 'Home') return to(r, 0);
      if (key === 'End') return to(r, geo.C - 1);
      return undefined;
    },
    anchor(i) {
      const r = Math.floor(i / geo.C);
      const c = i % geo.C;
      return { x: geo.left + c * (geo.cw + GAP) + geo.cw / 2, y: geo.top + r * (geo.ch + GAP) };
    },
    highlight(i) {
      const ring = frame.plot.querySelector('[data-ring]');
      if (!ring) return;
      if (i == null || !geo) return ring.setAttribute('width', 0);
      const r = Math.floor(i / geo.C);
      const c = i % geo.C;
      ring.setAttribute('x', round(geo.left + c * (geo.cw + GAP) - 1));
      ring.setAttribute('y', round(geo.top + r * (geo.ch + GAP) - 1));
      ring.setAttribute('width', round(geo.cw + 2));
      ring.setAttribute('height', round(geo.ch + 2));
    },
    describe(i) {
      const r = Math.floor(i / geo.C);
      const c = i % geo.C;
      const v = o.values[r]?.[c];
      const { color } = geo.scale.color(v == null ? null : +v);
      return { title: `${o.rows[r]} · ${o.columns[c]}`, rows: [{ color, mark: 'rect', value: v == null ? msg('chart.noValue') : geo.fmt(v), name: v == null ? '' : o.valueLabel ?? '' }] };
    },
  });

  const summary = () => msg('chart.summaryHeatmap', o.title ?? o.label ?? msg('chart.heatmap'), o.rows.length, o.columns.length);
  frame.setLabel(summary());
  frame.onResize(render);
  render();

  return {
    el: frame.figure,
    update(next) {
      source = { ...source, ...next };
      o = normalize(source);
      frame.setHead(o);
      frame.setLabel(summary());
      render();
    },
    setLoading: frame.setLoading,
    destroy: frame.destroy,
  };
}

/* ───────── Calendário ───────── */

const DAY = 86400000;
const dateCache = new Map();
/** Datas do calendário no idioma atual; dias da semana curtos e sem ponto (Dom, Seg… · Sun, Mon…). */
function dates() {
  if (!dateCache.has(locale())) {
    const weekday = dateFormat({ weekday: 'short' });
    dateCache.set(locale(), {
      // 7 de janeiro de 2024 foi um domingo
      weekdays: Array.from({ length: 7 }, (_, d) => {
        const s = weekday.format(new Date(2024, 0, 7 + d)).replace('.', '');
        return s.charAt(0).toUpperCase() + s.slice(1);
      }),
      month: dateFormat({ month: 'short' }),
      monthLong: dateFormat({ month: 'long', year: 'numeric' }),
      full: dateFormat({ day: 'numeric', month: 'short', year: 'numeric' }),
    });
  }
  return dateCache.get(locale());
}

const parseDay = (d) => {
  if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const [y, m, day] = String(d).split('-').map(Number);
  return new Date(y, m - 1, day);
};

export function calendarHeatmap(host, input) {
  let source = input;
  let o = normalize(source);
  const frame = createFrame(host, o, { kind: 'calendar' });
  let geo = null;

  function normalize(opts) {
    return { steps: 5, values: [], valueLabel: '', start: new Date(), ...opts, scale: 'sequential' };
  }

  const dateAt = (i) => {
    const s = parseDay(o.start);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate() + i);
  };

  function render() {
    const W = frame.width;
    if (!W) return;
    const values = o.values.map((v) => (v == null ? null : +v));
    const n = values.length;
    if (!n || values.every((v) => v == null)) {
      geo = null;
      frame.empty();
      return;
    }
    const fmt = formatter(o.format ?? 'integer');
    const scale = makeScale(o, values);
    const offset = parseDay(o.start).getDay();
    const cols = Math.ceil((n + offset) / 7);
    const left = Math.ceil(textWidth('Qua', FONTS.tick)) + 10;
    const top = 20;
    const avail = W - left - 2;
    const size = clamp(Math.floor((avail - (cols - 1) * GAP) / cols), 9, 16);
    const gridW = cols * (size + GAP) - GAP;
    // Os dias da semana ficam parados à esquerda; só a grade rola (abre no mais recente).
    const width = Math.max(W - left, gridW + 2);
    const H = top + 7 * (size + GAP) - GAP + 4;
    const rx = Math.min(3, size / 4);

    let labels = '';
    [1, 3, 5].forEach((d) => {
      labels += tag('text', { x: left - 10, y: top + d * (size + GAP) + size / 2, class: 'ds-chart__tick', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, dates().weekdays[d]);
    });
    let svg = '';
    let lastMonth = -1;
    let lastX = -Infinity;
    for (let c = 0; c < cols; c++) {
      const firstDay = Math.max(0, c * 7 - offset);
      if (firstDay >= n) break;
      const date = dateAt(firstDay);
      const x = c * (size + GAP);
      if (date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        if (x - lastX >= 30 && (c === 0 ? dateAt(0).getDate() <= 21 : true)) {
          svg += tag('text', { x, y: top - 8, class: 'ds-chart__tick' }, escapeHtml(dates().month.format(date).replace('.', '')));
          lastX = x;
        }
      }
    }
    values.forEach((v, i) => {
      const slot = i + offset;
      const c = Math.floor(slot / 7);
      const r = slot % 7;
      svg += tag('rect', {
        x: c * (size + GAP),
        y: top + r * (size + GAP),
        width: size,
        height: size,
        rx: round(rx),
        class: 'ds-chart__cell',
        style: `--c:${scale.color(v).color};--d:${Math.min(c, 52) * 8}ms`,
      });
    });
    svg += tag('rect', { class: 'ds-chart__cell-ring', 'data-ring': '', x: 0, y: 0, width: 0, height: 0, rx: round(rx + 1) });

    const prevScroll = frame.plot.querySelector('.ds-chart__scroll');
    const keep = prevScroll && prevScroll.scrollLeft < prevScroll.scrollWidth - prevScroll.clientWidth - 1 ? prevScroll.scrollLeft : null;
    frame.plot.innerHTML = `<div style="display:flex;min-width:0">
        <svg class="ds-chart__svg" width="${left}" height="${H}" viewBox="0 0 ${left} ${H}" style="flex:none" aria-hidden="true">${labels}</svg>
        <div class="ds-chart__scroll" style="flex:1;min-width:0"><svg class="ds-chart__svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" style="max-width:none" aria-hidden="true">${svg}</svg></div>
      </div>${o.scaleLegend === false ? '' : scaleLegend({ ...o, scaleLabels: o.scaleLabels ?? [msg('chart.less'), msg('chart.more')] }, scale, fmt)}`;
    const scroller = frame.plot.querySelector('.ds-chart__scroll');
    scroller.scrollLeft = keep ?? scroller.scrollWidth;
    geo = { n, offset, left, top, size, fmt, scale, values };

    // Tabela por mês: 365 linhas não ajudam ninguém.
    const months = new Map();
    values.forEach((v, i) => {
      const d = dateAt(i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.get(key) ?? { label: dates().monthLong.format(d), total: 0, active: 0, max: 0, maxDay: null };
      if (v) {
        m.total += v;
        m.active += 1;
        if (v > m.max) {
          m.max = v;
          m.maxDay = d;
        }
      }
      months.set(key, m);
    });
    frame.setTable({
      columns: [{ label: msg('chart.month') }, { label: msg('chart.total'), num: true }, { label: msg('chart.daysWithData'), num: true }, { label: msg('chart.biggestDay'), num: true }],
      rows: [...months.values()].map((m) => [m.label, fmt(m.total), String(m.active), m.maxDay ? `${fmt(m.max)} · ${dates().full.format(m.maxDay)}` : '—']),
    });
    frame.refresh();
  }

  const cellXY = (i) => {
    const slot = i + geo.offset;
    return { c: Math.floor(slot / 7), r: slot % 7 };
  };

  frame.interact({
    count: () => (geo ? geo.n : 0),
    first: () => (geo ? geo.n - 1 : 0),
    hit(px, py) {
      if (!geo) return null;
      const scroll = frame.plot.querySelector('.ds-chart__scroll')?.scrollLeft ?? 0;
      const c = Math.floor((px + scroll - geo.left + GAP / 2) / (geo.size + GAP));
      const r = Math.floor((py - geo.top + GAP / 2) / (geo.size + GAP));
      if (c < 0 || r < 0 || r > 6) return null;
      const i = c * 7 + r - geo.offset;
      return i >= 0 && i < geo.n ? i : null;
    },
    move(i, key) {
      if (!geo) return undefined;
      const cur = i ?? geo.n - 1;
      const delta = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 }[key];
      if (key === 'Home') return 0;
      if (key === 'End') return geo.n - 1;
      if (delta === undefined) return undefined;
      return clamp(cur + delta, 0, geo.n - 1);
    },
    anchor(i) {
      const { c, r } = cellXY(i);
      const scroll = frame.plot.querySelector('.ds-chart__scroll')?.scrollLeft ?? 0;
      return { x: geo.left + c * (geo.size + GAP) + geo.size / 2 - scroll, y: geo.top + r * (geo.size + GAP) };
    },
    highlight(i) {
      const ring = frame.plot.querySelector('[data-ring]');
      if (!ring) return;
      if (i == null || !geo) return ring.setAttribute('width', 0);
      const { c, r } = cellXY(i);
      ring.setAttribute('x', c * (geo.size + GAP) - 1);
      ring.setAttribute('y', geo.top + r * (geo.size + GAP) - 1);
      ring.setAttribute('width', geo.size + 2);
      ring.setAttribute('height', geo.size + 2);
    },
    describe(i) {
      const v = geo.values[i];
      const label = o.valueLabel ? ` ${o.valueLabel}` : '';
      return { title: `${dates().weekdays[dateAt(i).getDay()]}, ${dates().full.format(dateAt(i))}`, rows: [{ color: geo.scale.color(v).color, mark: 'rect', value: v == null ? msg('chart.noValue') : `${geo.fmt(v)}${label}`, name: '' }] };
    },
  });

  const summary = () => msg('chart.summaryCalendar', o.title ?? o.label ?? msg('chart.calendar'), o.values.length);
  frame.setLabel(summary());
  frame.onResize(render);
  render();

  return {
    el: frame.figure,
    update(next) {
      source = { ...source, ...next };
      o = normalize(source);
      frame.setHead(o);
      frame.setLabel(summary());
      render();
    },
    setLoading: frame.setLoading,
    destroy: frame.destroy,
  };
}
