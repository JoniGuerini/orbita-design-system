/**
 * Órbita — gráfico de linhas e de áreas.
 *
 * lineChart(host, {
 *   categories: ['01/10', '02/10', …],
 *   series: [{ name, values, color?, muted? }],   muted: série de contexto (ex.: período anterior), em cinza
 *   area: false, stacked: false,                   área = lavagem de 10% sob a linha; empilhada = faixas somadas
 *   curve: 'linear' | 'smooth',                    smooth é monotônica: não inventa picos
 *   markers: 'end' | 'none' | 'all',
 *   endLabels: true,                               nome no fim de cada linha quando cabem sem colidir (até 4 séries)
 *   highlight: índice da série em destaque (as outras ficam cinza),
 *   target: { value, label },                      linha de referência tracejada (meta, limite)
 *   zero: true,                                    o eixo começa no zero
 *   format, axisFormat, height, title, subtitle, label, card, table, tooltipLabels,
 * }) → { update(options), setLoading(bool), destroy(), el }
 *
 * Um eixo só. Duas grandezas de escalas diferentes = dois gráficos (ou índice com base 100).
 */
import {
  createFrame, normalizeSeries, formatter, axisFormatter, niceTicks, linear, textWidth, fitText, labelStep,
  tag, escapeHtml, yAxis, monotonePath, linePath, segments, FONTS, round,
} from './core.js';
import { msg } from '../i18n.js';

export function lineChart(host, input) {
  let source = input;
  let o = normalize(source);
  const hidden = new Set();
  const frame = createFrame(host, o, { kind: 'line' });
  let geo = null;

  function normalize(opts) {
    return { curve: 'linear', markers: 'end', endLabels: true, zero: true, height: 280, categories: [], ...opts, series: normalizeSeries(opts.series) };
  }

  const visible = () => o.series.filter((s) => !hidden.has(s.index));
  const stroke = (s) => (s.muted || (o.highlight != null && s.index !== o.highlight) ? 'var(--ds-color-chart-muted)' : s.paint);
  const path = (pts) => (o.curve === 'smooth' ? monotonePath(pts) : linePath(pts));

  function legend() {
    if (o.series.length < 2) return frame.setLegend([]);
    frame.setLegend(
      o.series.map((s) => ({ name: s.name, color: stroke(s), mark: o.area || o.stacked ? 'rect' : 'line', hidden: hidden.has(s.index) })),
      (i) => {
        if (hidden.has(i)) hidden.delete(i);
        else if (visible().length > 1) hidden.add(i);
        legend();
        render();
      },
    );
  }

  /** Para empilhadas: base e topo de cada série em cada categoria. */
  function stackValues(vs) {
    const base = o.categories.map(() => 0);
    return vs.map((s) =>
      o.categories.map((_, c) => {
        const v = s.values[c];
        const b = base[c];
        if (v == null) return null;
        base[c] += v;
        return [b, b + v];
      }),
    );
  }

  function render() {
    const W = frame.width;
    if (!W) return;
    const vs = visible();
    const n = o.categories.length;
    if (!n || !vs.length || vs.every((s) => s.values.every((v) => v == null))) {
      geo = null;
      frame.empty();
      return;
    }
    const fmt = formatter(o.format);
    const afmt = axisFormatter(o.format, o.axisFormat);
    const stacks = o.stacked ? stackValues(vs) : null;
    const tops = (j) => (stacks ? stacks[j].map((p) => (p ? p[1] : null)) : vs[j].values);

    const all = vs.flatMap((_, j) => tops(j)).filter((v) => v != null);
    if (o.target?.value != null) all.push(o.target.value);
    let dmin = Math.min(...all);
    let dmax = Math.max(...all);
    if (o.zero !== false || o.area || o.stacked) {
      dmin = Math.min(0, dmin);
      dmax = Math.max(0, dmax);
    }

    const H = o.height;
    const top = 12;
    const bottom = 28;
    const plotH = Math.max(40, H - top - bottom);
    const { ticks, min, max } = niceTicks(dmin, dmax, Math.max(2, Math.round(plotH / 56)));
    const y = linear(min, max, top + plotH, top);
    const left = Math.ceil(Math.max(...ticks.map((t) => textWidth(afmt(t))))) + 14;

    // Rótulos no fim das linhas: só se não colidirem (senão, legenda + tooltip).
    const last = (vals) => {
      for (let i = vals.length - 1; i >= 0; i--) if (vals[i] != null) return [i, vals[i]];
      return null;
    };
    let ends = vs.map((s, j) => ({ s, at: last(tops(j)) })).filter((e) => e.at);
    let endText = (e) => (vs.length === 1 ? fmt(e.at[1]) : e.s.name);
    let showEnds = o.endLabels !== false && vs.length <= 4 && n > 1;
    if (showEnds) {
      const ys = ends.map((e) => y(e.at[1])).sort((a, b) => a - b);
      showEnds = ys.every((v, i) => !i || v - ys[i - 1] >= 16);
    }
    // Na ênfase, a série em destaque sempre leva o nome — as cinzas ficam com a legenda.
    if (!showEnds && o.endLabels !== false && o.highlight != null && n > 1) {
      ends = ends.filter((e) => e.s.index === o.highlight);
      endText = (e) => e.s.name;
      showEnds = ends.length === 1;
    }
    const right = showEnds ? Math.ceil(Math.max(...ends.map((e) => textWidth(endText(e), vs.length === 1 ? FONTS.value : FONTS.label)))) + 18 : 10;
    const plotW = Math.max(40, W - left - right);
    const x = (i) => left + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));

    let svg = yAxis({ ticks, y, left, right: left + plotW, format: afmt });

    // eixo x
    const band = n > 1 ? plotW / (n - 1) : plotW;
    const step = labelStep(o.categories, band);
    // rótulos centrados no ponto; só encostam na borda quando passariam dela (sem colidir com o vizinho)
    o.categories.forEach((cat, i) => {
      if (i % step) return;
      const text = fitText(cat, band * step - 6, FONTS.tick);
      const half = textWidth(text, FONTS.tick) / 2;
      let anchor = 'middle';
      let tx = x(i);
      if (tx - half < 0) [anchor, tx] = ['start', 0];
      else if (tx + half > W) [anchor, tx] = ['end', W];
      svg += tag('text', { x: tx, y: top + plotH + 20, class: 'ds-chart__tick', 'text-anchor': anchor }, escapeHtml(text));
    });

    // meta / limite
    if (o.target?.value != null) {
      const ty = round(Math.round(y(o.target.value)) + 0.5, 1);
      svg += tag('line', { x1: left, x2: left + plotW, y1: ty, y2: ty, class: 'ds-chart__target' });
      const label = `${o.target.label ?? msg('chart.goal')} · ${fmt(o.target.value)}`;
      svg += tag('text', { x: left + 4, y: ty - 7, class: 'ds-chart__target-label' }, escapeHtml(label));
    }

    svg += tag('line', { class: 'ds-chart__crosshair', 'data-cross': '', x1: 0, x2: 0, y1: top, y2: top + plotH, opacity: 0 });

    // séries de contexto embaixo, destaque por cima
    const order = vs.map((s, j) => j).sort((a, b) => rank(vs[a]) - rank(vs[b]));
    function rank(s) {
      if (s.muted) return 0;
      if (o.highlight != null) return s.index === o.highlight ? 2 : 0;
      return 1;
    }

    const baseY = y(Math.max(min, 0));
    for (const j of order) {
      const s = vs[j];
      const c = stroke(s);
      const pts = o.categories.map((_, i) => (tops(j)[i] == null ? null : [x(i), y(tops(j)[i])]));
      for (const seg of segments(pts)) {
        if (o.stacked) {
          const idx = pts.indexOf(seg[0]);
          const basePts = seg.map((p, k) => [p[0], y(stacks[j][idx + k][0])]).reverse();
          const back = o.curve === 'smooth' ? monotonePath(basePts).replace(/^M/, 'L') : linePath(basePts).replace(/^M/, 'L');
          svg += tag('path', { d: `${path(seg)}${back}Z`, class: 'ds-chart__area ds-chart__area--stacked', style: `--c:${c}` });
        } else if (o.area) {
          svg += tag('path', { d: `${path(seg)}L${round(seg.at(-1)[0])} ${round(baseY)}L${round(seg[0][0])} ${round(baseY)}Z`, class: 'ds-chart__area', style: `--c:${c}` });
        }
        svg += tag('path', { d: path(seg), class: 'ds-chart__line', pathLength: 1, style: `--c:${c}` });
      }
      if (o.markers === 'all' && n <= 40) {
        pts.forEach((p) => p && (svg += tag('circle', { cx: round(p[0]), cy: round(p[1]), r: 4, class: 'ds-chart__dot', style: `--c:${c}` })));
      } else if (o.markers !== 'none') {
        const e = last(tops(j));
        if (e) svg += tag('circle', { cx: round(x(e[0])), cy: round(y(e[1])), r: 4, class: 'ds-chart__dot ds-chart__dot--end', style: `--c:${c}` });
      }
    }

    if (showEnds) {
      for (const e of ends) {
        const single = vs.length === 1;
        svg += tag(
          'text',
          { x: x(e.at[0]) + 10, y: y(e.at[1]), class: single ? 'ds-chart__value' : 'ds-chart__label', 'dominant-baseline': 'middle' },
          escapeHtml(endText(e)),
        );
      }
    }

    svg += '<g data-hover-dots></g>';
    frame.plot.innerHTML = `<svg class="ds-chart__svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg}</svg>`;
    geo = { x, y, n, left, plotW, top, plotH, tops, vs, step: n > 1 ? plotW / (n - 1) : plotW };

    frame.setTable({
      columns: [{ label: o.categoryLabel ?? msg('chart.period') }, ...o.series.map((s) => ({ label: s.name ?? msg('chart.value'), num: true }))],
      rows: o.categories.map((cat, i) => [o.tooltipLabels?.[i] ?? cat, ...o.series.map((s) => (s.values[i] == null ? '—' : fmt(s.values[i])))]),
    });
    frame.refresh();
  }

  frame.interact({
    count: () => (geo ? geo.n : 0),
    first: () => (geo ? geo.n - 1 : 0),
    hit(px) {
      if (!geo) return null;
      if (px < geo.left - 12 || px > geo.left + geo.plotW + 12) return null;
      return Math.max(0, Math.min(geo.n - 1, Math.round((px - geo.left) / (geo.step || 1))));
    },
    anchor(i) {
      const ys = geo.vs.map((_, j) => geo.tops(j)[i]).filter((v) => v != null).map(geo.y);
      return { x: geo.x(i), y: ys.length ? Math.min(...ys) : geo.top + geo.plotH / 2 };
    },
    highlight(i) {
      const svg = frame.plot.querySelector('svg');
      if (!svg) return;
      const cross = svg.querySelector('[data-cross]');
      const dots = svg.querySelector('[data-hover-dots]');
      if (i == null || !geo) {
        cross.setAttribute('opacity', 0);
        dots.innerHTML = '';
        return;
      }
      const px = round(Math.round(geo.x(i)) + 0.5, 1);
      cross.setAttribute('x1', px);
      cross.setAttribute('x2', px);
      cross.setAttribute('opacity', 1);
      dots.innerHTML = geo.vs
        .map((s, j) => {
          const v = geo.tops(j)[i];
          return v == null ? '' : tag('circle', { cx: round(geo.x(i)), cy: round(geo.y(v)), r: 4, class: 'ds-chart__dot ds-chart__dot--hover', style: `--c:${stroke(s)}` });
        })
        .join('');
    },
    describe(i) {
      const fmt = formatter(o.format);
      const rows = visible().map((s) => ({ color: stroke(s), mark: 'line', value: s.values[i] == null ? '—' : fmt(s.values[i]), name: s.name ?? '' }));
      const notes = [];
      if (o.stacked && rows.length > 1) notes.push(`${msg('chart.total')}: ${fmt(visible().reduce((a, s) => a + (s.values[i] ?? 0), 0))}`);
      if (o.target?.value != null) notes.push(`${o.target.label ?? msg('chart.goal')}: ${fmt(o.target.value)}`);
      return { title: o.tooltipLabels?.[i] ?? o.categories[i], rows, note: notes.join(' · ') || undefined };
    },
  });

  function summary() {
    return msg('chart.summaryLine', o.title ?? o.label ?? msg('chart.chart'), o.stacked ? 'stacked' : o.area ? 'area' : 'line', o.categories.length, o.series.length);
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
