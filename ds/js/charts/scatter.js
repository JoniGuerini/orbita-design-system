/**
 * Órbita — dispersão e bolhas.
 *
 * scatterChart(host, {
 *   series: [{ name, color?, points: [{ x, y, size?, label? }] }],   até 3 séries (todas as cores se tocam)
 *   x: { label, format, zero: false, reference, referenceLabel },
 *   y: { label, format, zero: false, reference, referenceLabel },
 *   size: { label, format, range: [4, 18] },                         com `size` nos pontos, vira bolhas
 *   height, title, subtitle, label, card, table,
 * }) → { update(options), setLoading(bool), destroy(), el }
 *
 * Pontos de 8 px com anel de 2 px da cor da superfície; o hover acha o ponto mais próximo
 * (até 24 px), então ninguém precisa acertar o centro.
 */
import { createFrame, paint, formatter, axisFormatter, niceTicks, linear, textWidth, tag, escapeHtml, yAxis, xAxis, round, FONTS } from './core.js';

const HIT = 24;
let warned = false;

export function scatterChart(host, input) {
  let source = input;
  let o = normalize(source);
  const hidden = new Set();
  const frame = createFrame(host, o, { kind: 'scatter' });
  let geo = null;

  function normalize(opts) {
    const series = (opts.series ?? []).map((s, i) => ({ ...s, index: i, paint: paint(s.color, i), points: (s.points ?? []).filter((p) => Number.isFinite(+p.x) && Number.isFinite(+p.y)) }));
    if (series.length > 3 && !warned) {
      warned = true;
      console.warn('[Órbita] Dispersão com mais de 3 séries: as cores deixam de ser distinguíveis entre si. Agrupe ou use pequenos múltiplos.');
    }
    return { height: 320, x: {}, y: {}, ...opts, series };
  }

  const visible = () => o.series.filter((s) => !hidden.has(s.index));

  function legend() {
    if (o.series.length < 2) return frame.setLegend([]);
    frame.setLegend(
      o.series.map((s) => ({ name: s.name, color: s.paint, mark: 'dot', hidden: hidden.has(s.index) })),
      (i) => {
        if (hidden.has(i)) hidden.delete(i);
        else if (visible().length > 1) hidden.add(i);
        legend();
        render();
      },
    );
  }

  function render() {
    const W = frame.width;
    if (!W) return;
    const vs = visible();
    const pts = vs.flatMap((s) => s.points.map((p) => ({ ...p, x: +p.x, y: +p.y, s })));
    if (!pts.length) {
      geo = null;
      frame.empty();
      return;
    }
    const fx = formatter(o.x.format);
    const fy = formatter(o.y.format);
    const ax = axisFormatter(o.x.format, o.x.axisFormat);
    const ay = axisFormatter(o.y.format, o.y.axisFormat);
    const bubbles = pts.some((p) => p.size != null);
    const [r0, r1] = o.size?.range ?? [4, 18];
    const sizes = pts.map((p) => +p.size || 0);
    const smax = Math.max(...sizes, 1);
    let rMax = r1;
    const radius = (p) => (bubbles ? r0 + (rMax - r0) * Math.sqrt((+p.size || 0) / smax) : 4);

    const ext = (key, axis) => {
      const vals = pts.map((p) => p[key]);
      if (axis.reference != null) vals.push(axis.reference);
      let lo = Math.min(...vals);
      let hi = Math.max(...vals);
      if (axis.zero) {
        lo = Math.min(0, lo);
        hi = Math.max(0, hi);
      }
      const pad = (hi - lo || 1) * 0.04;
      return [axis.zero && lo >= 0 ? lo : lo - pad, hi + pad];
    };

    const H = o.height;
    const top = o.y.label ? 26 : 12;
    const bottom = o.x.label ? 48 : 28;
    const plotH = Math.max(60, H - top - bottom);
    const yt = niceTicks(...ext('y', o.y), Math.max(2, Math.round(plotH / 56)));
    const left = Math.ceil(Math.max(...yt.ticks.map((t) => textWidth(ay(t))))) + 14;
    const right = 16;
    const plotW = Math.max(60, W - left - right);
    // Em telas estreitas as bolhas encolhem junto, para a nuvem não virar uma mancha.
    rMax = Math.max(r0 + 4, Math.min(r1, plotW / 22));
    const xt = niceTicks(...ext('x', o.x), Math.max(2, Math.round(plotW / 90)));
    const x = linear(xt.min, xt.max, left, left + plotW);
    const y = linear(yt.min, yt.max, top + plotH, top);

    let svg = yAxis({ ticks: yt.ticks, y, left, right: left + plotW, format: ay, baseline: yt.min });
    svg += xAxis({ ticks: xt.ticks, x, top, bottom: top + plotH, format: ax, baseline: xt.min });
    if (o.y.label) svg += tag('text', { x: left - 14, y: 10, class: 'ds-chart__axis-label' }, escapeHtml(o.y.label));
    if (o.x.label) svg += tag('text', { x: left + plotW, y: H - 6, class: 'ds-chart__axis-label', 'text-anchor': 'end' }, escapeHtml(o.x.label));

    // referências (mediana, meta): tracejado = limite, nunca grade
    if (o.x.reference != null) {
      const px = round(Math.round(x(o.x.reference)) + 0.5, 1);
      svg += tag('line', { x1: px, x2: px, y1: top, y2: top + plotH, class: 'ds-chart__target' });
      if (o.x.referenceLabel) svg += tag('text', { x: px + 6, y: top + 12, class: 'ds-chart__target-label' }, escapeHtml(o.x.referenceLabel));
    }
    if (o.y.reference != null) {
      const py = round(Math.round(y(o.y.reference)) + 0.5, 1);
      svg += tag('line', { x1: left, x2: left + plotW, y1: py, y2: py, class: 'ds-chart__target' });
      if (o.y.referenceLabel) svg += tag('text', { x: left + plotW - 4, y: py - 7, class: 'ds-chart__target-label', 'text-anchor': 'end' }, escapeHtml(o.y.referenceLabel));
    }

    const placed = pts.map((p, i) => ({ ...p, i, px: x(p.x), py: y(p.y), r: radius(p) }));
    // maiores atrás, para as pequenas não sumirem
    const drawOrder = [...placed].sort((a, b) => b.r - a.r);
    svg += drawOrder
      .map((p) => tag('circle', { cx: round(p.px), cy: round(p.py), r: round(p.r), class: `ds-chart__dot${bubbles ? ' ds-chart__dot--bubble' : ''}`, 'data-i': p.i, style: `--c:${p.s.paint};--d:${Math.min(p.i, 40) * 10}ms` }))
      .join('');
    // rótulos seletivos: só nos pontos marcados com `label`
    svg += placed
      .filter((p) => p.label && p.showLabel !== false)
      .map((p) => {
        const w = textWidth(p.label, FONTS.label);
        const toLeft = p.px + p.r + 6 + w > left + plotW;
        return tag('text', { x: toLeft ? p.px - p.r - 6 : p.px + p.r + 6, y: p.py, class: 'ds-chart__label', 'text-anchor': toLeft ? 'end' : 'start', 'dominant-baseline': 'middle' }, escapeHtml(p.label));
      })
      .join('');
    svg += tag('circle', { class: 'ds-chart__point-ring', 'data-ring': '', cx: 0, cy: 0, r: 0 });

    frame.plot.innerHTML = `<svg class="ds-chart__svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg}</svg>`;
    const byX = [...placed].sort((a, b) => a.px - b.px || a.py - b.py);
    geo = { placed, byX, fx, fy };

    const fs = formatter(o.size?.format);
    frame.setTable({
      columns: [{ label: o.pointLabel ?? 'Ponto' }, ...(o.series.length > 1 ? [{ label: 'Série' }] : []), { label: o.x.label ?? 'x', num: true }, { label: o.y.label ?? 'y', num: true }, ...(bubbles ? [{ label: o.size?.label ?? 'Tamanho', num: true }] : [])],
      rows: o.series.flatMap((s) =>
        s.points.map((p, k) => [p.label ?? `${s.name ?? 'Ponto'} ${k + 1}`, ...(o.series.length > 1 ? [s.name ?? ''] : []), fx(+p.x), fy(+p.y), ...(bubbles ? [p.size == null ? '—' : fs(+p.size)] : [])]),
      ),
    });
    frame.refresh();
  }

  frame.interact({
    count: () => (geo ? geo.byX.length : 0),
    hit(px, py) {
      if (!geo) return null;
      let best = null;
      let bestD = Infinity;
      geo.byX.forEach((p, k) => {
        const d = Math.hypot(p.px - px, p.py - py) - (p.r - 4);
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      });
      return bestD <= HIT ? best : null;
    },
    anchor: (k) => ({ x: geo.byX[k].px, y: geo.byX[k].py - geo.byX[k].r }),
    highlight(k) {
      const ring = frame.plot.querySelector('[data-ring]');
      if (!ring) return;
      frame.plot.querySelectorAll('.ds-chart__dot[data-active]').forEach((el) => el.removeAttribute('data-active'));
      if (k == null || !geo) return ring.setAttribute('r', 0);
      const p = geo.byX[k];
      ring.setAttribute('cx', round(p.px));
      ring.setAttribute('cy', round(p.py));
      ring.setAttribute('r', round(p.r + 4));
      ring.style.setProperty('--c', p.s.paint);
      frame.plot.querySelector(`.ds-chart__dot[data-i="${p.i}"]`)?.setAttribute('data-active', '');
    },
    describe(k) {
      const p = geo.byX[k];
      const rows = [
        { value: geo.fx(p.x), name: o.x.label ?? 'x' },
        { value: geo.fy(p.y), name: o.y.label ?? 'y' },
      ];
      if (p.size != null) rows.push({ value: formatter(o.size?.format)(+p.size), name: o.size?.label ?? 'Tamanho' });
      return { title: p.label ?? p.s.name ?? 'Ponto', rows, note: p.label && o.series.length > 1 ? p.s.name : undefined };
    },
  });

  function summary() {
    const n = o.series.reduce((a, s) => a + s.points.length, 0);
    return `${o.title ?? o.label ?? 'Gráfico'}. Gráfico de dispersão com ${n} pontos`;
  }

  frame.setLabel(summary());
  frame.onResize(render);
  legend();
  render();

  return {
    el: frame.figure,
    update(next) {
      source = { ...source, ...next };
      o = normalize(source);
      [...hidden].forEach((i) => i >= o.series.length && hidden.delete(i));
      frame.setHead(o);
      frame.setLabel(summary());
      legend();
      render();
    },
    setLoading: frame.setLoading,
    destroy: frame.destroy,
  };
}
