/**
 * Órbita — gráfico de barras (colunas e barras horizontais).
 *
 * barChart(host, {
 *   categories: ['Jan', 'Fev', …],
 *   series: [{ name: 'Receita', values: [12, 18, …], color? }],
 *   orientation: 'vertical' | 'horizontal',
 *   layout: 'grouped' | 'stacked' | 'percent',
 *   labels: 'auto' | 'none' | 'all' | 'max' | 'last',
 *   highlight: índice da categoria em destaque (o resto fica cinza),
 *   diverging: true — acima/abaixo de zero nas cores divergentes,
 *   ordinal: true — categorias em sequência (funil, faixas) numa rampa de um tom,
 *   format, axisFormat, height, title, subtitle, label, card, table, texture, tooltipLabels,
 * }) → { update(options), setLoading(bool), destroy(), el }
 *
 * Marcas: no máximo 24 px de espessura, ponta de dados com raio de 4 px e base reta,
 * 2 px de respiro entre barras vizinhas e entre segmentos empilhados.
 */
import {
  createFrame, normalizeSeries, formatter, axisFormatter, niceTicks, linear, textWidth, fitText, labelStep,
  barPath, tag, escapeHtml, yAxis, xAxis, texturePatterns, clamp, FONTS,
} from './core.js';

const GAP = 2;
const MAX_BAR = 24;

export function barChart(host, input) {
  let source = input;
  let o = normalize(source);
  const hidden = new Set();
  const frame = createFrame(host, o, { kind: 'bar' });
  let geo = null;

  function normalize(opts) {
    return {
      orientation: 'vertical',
      layout: 'grouped',
      labels: 'auto',
      height: 280,
      categories: [],
      ...opts,
      series: normalizeSeries(opts.series),
    };
  }

  const visible = () => o.series.filter((s) => !hidden.has(s.index));
  const isStack = () => o.layout === 'stacked' || o.layout === 'percent';

  function color(s, c, v) {
    if (o.highlight != null) return c === o.highlight ? s.paint : 'var(--ds-color-chart-muted)';
    if (o.diverging) return v < 0 ? 'var(--ds-color-chart-div-2)' : 'var(--ds-color-chart-div-6)';
    if (o.ordinal) {
      const n = o.categories.length;
      const step = n > 1 ? Math.round((c / (n - 1)) * 4) : 0;
      return `var(--ds-color-chart-ord-${5 - step})`;
    }
    return s.paint;
  }

  const textured = () => o.texture && o.highlight == null && !o.diverging && !o.ordinal;

  function legend() {
    if (o.series.length > 1 && !o.ordinal) {
      frame.setLegend(
        o.series.map((s) => ({ name: s.name, color: s.paint, mark: 'rect', hidden: hidden.has(s.index) })),
        (i) => {
          if (hidden.has(i)) hidden.delete(i);
          else if (visible().length > 1) hidden.add(i);
          legend();
          render();
        },
      );
    } else if (o.diverging && (o.positiveLabel || o.negativeLabel)) {
      frame.setLegend([
        { name: o.positiveLabel ?? 'Acima', color: 'var(--ds-color-chart-div-6)' },
        { name: o.negativeLabel ?? 'Abaixo', color: 'var(--ds-color-chart-div-2)' },
      ]);
    } else frame.setLegend([]);
  }

  /** Valores prontos para desenhar (percent normaliza por categoria). */
  function matrix(vs) {
    return o.categories.map((_, c) => {
      const row = vs.map((s) => s.values[c]);
      if (o.layout !== 'percent') return row;
      const total = row.reduce((a, v) => a + Math.max(0, v ?? 0), 0);
      return row.map((v) => (v == null ? null : total ? Math.max(0, v) / total : 0));
    });
  }

  function domain(rows) {
    if (o.layout === 'percent') return [0, 1];
    if (isStack()) return [0, Math.max(0, ...rows.map((r) => r.reduce((a, v) => a + Math.max(0, v ?? 0), 0)))];
    const all = rows.flat().filter((v) => v != null);
    return [Math.min(0, ...all), Math.max(0, ...all)];
  }

  function labelMode() {
    if (o.labels !== 'auto') return o.labels;
    return o.orientation === 'horizontal' && (visible().length === 1 || isStack()) ? 'all' : 'none';
  }

  function render() {
    const W = frame.width;
    if (!W) return;
    const vs = visible();
    const n = o.categories.length;
    if (!n || !vs.length) {
      geo = null;
      frame.empty();
      return;
    }
    const rows = matrix(vs);
    const fmt = formatter(o.layout === 'percent' ? 'percent' : o.format);
    const afmt = axisFormatter(o.layout === 'percent' ? 'percent' : o.format, o.layout === 'percent' ? undefined : o.axisFormat);
    const mode = labelMode();
    const [dmin, dmax] = domain(rows);

    /** Quais posições ganham rótulo de valor: seletivo, nunca um número em cada barra por padrão. */
    const totals = rows.map((r) => (isStack() ? r.reduce((a, v) => a + Math.max(0, v ?? 0), 0) : null));
    const peak = (() => {
      let best = null;
      rows.forEach((r, c) => r.forEach((v, j) => {
        const val = isStack() ? totals[c] : v;
        if (val != null && (best == null || val > best.v)) best = { c, j: isStack() ? null : j, v: val };
      }));
      return best;
    })();
    const wantsLabel = (c, j) => {
      if (mode === 'all') return true;
      if (mode === 'last') return c === n - 1;
      if (mode === 'max') return peak && peak.c === c && (peak.j == null || peak.j === j);
      return false;
    };

    const defs = textured() ? `<defs>${texturePatterns(frame.id, o.series.map((s) => s.paint))}</defs>` : '';
    const fill = (s, c, v) => {
      const base = `--c:${color(s, c, v)}`;
      return textured() ? `${base};--t:url(#${frame.id}-t${s.index})` : base;
    };

    let svg = '';
    let H;
    const marks = [];

    if (o.orientation === 'horizontal') {
      const k = isStack() ? 1 : vs.length;
      const thick = clamp(o.barSize ?? (k > 1 ? 12 : 20), 4, MAX_BAR);
      const groupH = k * thick + (k - 1) * GAP;
      const rowH = Math.max(o.rowHeight ?? 36, groupH + 14);
      const showAxis = mode !== 'all';
      const top = 4;
      const bottom = showAxis ? 28 : 4;
      H = top + n * rowH + bottom;
      const catW = Math.min(W * 0.38, Math.max(...o.categories.map((l) => textWidth(l, FONTS.label))));
      const left = Math.ceil(catW) + 14;
      const valueStrings = rows.flatMap((r, c) => (isStack() ? [fmt(totals[c])] : r.map((v) => (v == null ? '' : fmt(v)))));
      const right = mode === 'none' ? 12 : Math.ceil(Math.max(...valueStrings.map((s) => textWidth(s, FONTS.value)))) + 12;
      // Barras negativas levam o valor à esquerda da ponta: reserve esse espaço antes do eixo.
      const negatives = isStack() || mode === 'none' ? [] : rows.flat().filter((v) => v != null && v < 0).map((v) => textWidth(fmt(v), FONTS.value));
      const negPad = negatives.length ? Math.ceil(Math.max(...negatives)) + 8 : 0;
      const plotW = Math.max(40, W - left - negPad - right);
      const { ticks, min, max } = niceTicks(dmin, dmax, Math.max(2, Math.round(plotW / 90)));
      const x = linear(min, max, left + negPad, left + negPad + plotW);
      const x0 = x(0);

      svg += showAxis
        ? xAxis({ ticks, x, top, bottom: top + n * rowH, format: afmt })
        : tag('line', { x1: Math.round(x0) + 0.5, x2: Math.round(x0) + 0.5, y1: top, y2: top + n * rowH, class: 'ds-chart__baseline' });
      svg += tag('rect', { class: 'ds-chart__band', 'data-band': '', x: 0, y: 0, width: 0, height: 0, rx: 8 });

      o.categories.forEach((cat, c) => {
        const rowY = top + c * rowH;
        const gy = rowY + (rowH - groupH) / 2;
        svg += tag('text', { x: left - 14, y: rowY + rowH / 2, class: 'ds-chart__label', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, escapeHtml(fitText(cat, catW)));
        let cum = 0;
        const segs = rows[c].map((v, j) => ({ v, s: vs[j] })).filter((d) => d.v != null && (!isStack() || d.v > 0));
        let edge = x0;
        segs.forEach(({ v, s }, j) => {
          const by = isStack() ? gy : gy + vs.indexOf(s) * (thick + GAP);
          let xa;
          let xb;
          let end;
          if (isStack()) {
            xa = x(cum) + (j > 0 ? GAP : 0);
            cum += v;
            xb = x(cum);
            end = j === segs.length - 1 ? 'right' : 'none-h';
          } else {
            xa = Math.min(x0, x(v));
            xb = Math.max(x0, x(v));
            end = v < 0 ? 'left' : 'right';
          }
          edge = Math.max(edge, xb);
          const d = barPath(xa, by, xb - xa, thick, end);
          if (d) svg += tag('path', { d, class: 'ds-chart__bar', 'data-c': c, 'data-end': end, style: `${fill(s, c, v)};--d:${Math.min(c, 12) * 28}ms` });
          if (!isStack() && wantsLabel(c, vs.indexOf(s))) {
            const tx = v < 0 ? xa - 6 : xb + 6;
            svg += tag('text', { x: tx, y: by + thick / 2, class: 'ds-chart__value', 'text-anchor': v < 0 ? 'end' : 'start', 'dominant-baseline': 'middle' }, escapeHtml(fmt(v)));
          }
        });
        if (isStack() && wantsLabel(c)) svg += tag('text', { x: edge + 6, y: gy + thick / 2, class: 'ds-chart__value', 'dominant-baseline': 'middle' }, escapeHtml(fmt(totals[c])));
        marks.push({ c, x: Math.max(edge, x0), y: rowY + rowH / 2, band: [0, rowY + 2, W, rowH - 4] });
      });

      geo = { horizontal: true, rowH, top, n, marks };
    } else {
      H = o.height;
      const valueSpace = mode === 'none' ? 0 : 18;
      const top = 10 + valueSpace;
      const bottom = 28;
      const plotH = Math.max(40, H - top - bottom);
      const { ticks, min, max } = niceTicks(dmin, dmax, Math.max(2, Math.round(plotH / 56)));
      const left = Math.ceil(Math.max(...ticks.map((t) => textWidth(afmt(t))))) + 14;
      const right = 8;
      const plotW = Math.max(40, W - left - right);
      const y = linear(min, max, top + plotH, top);
      const y0 = y(0);
      const band = plotW / n;
      const k = isStack() ? 1 : vs.length;
      const barW = isStack() ? clamp(band * 0.56, 2, MAX_BAR) : clamp((band * 0.72 - (k - 1) * GAP) / k, 2, MAX_BAR);
      const groupW = k * barW + (k - 1) * GAP;

      svg += yAxis({ ticks, y, left, right: left + plotW, format: afmt });
      svg += tag('rect', { class: 'ds-chart__band', 'data-band': '', x: 0, y: 0, width: 0, height: 0, rx: 8 });

      const step = labelStep(o.categories, band);
      o.categories.forEach((cat, c) => {
        const bx = left + c * band;
        const gx = bx + (band - groupW) / 2;
        let topY = y0;
        let cum = 0;
        const segs = rows[c].map((v, j) => ({ v, s: vs[j], j })).filter((d) => d.v != null && (!isStack() || d.v > 0));
        segs.forEach(({ v, s, j }, idx) => {
          let ya;
          let yb;
          let end;
          const bx2 = isStack() ? gx : gx + j * (barW + GAP);
          if (isStack()) {
            ya = y(cum + v);
            yb = y(cum) - (idx > 0 ? GAP : 0);
            cum += v;
            end = idx === segs.length - 1 ? 'top' : 'none';
          } else {
            ya = Math.min(y0, y(v));
            yb = Math.max(y0, y(v));
            end = v < 0 ? 'bottom' : 'top';
          }
          topY = Math.min(topY, ya);
          const d = barPath(bx2, ya, barW, yb - ya, end);
          if (d) svg += tag('path', { d, class: 'ds-chart__bar', 'data-c': c, 'data-end': end, style: `${fill(s, c, v)};--d:${Math.min(c, 16) * 24}ms` });
          if (!isStack() && wantsLabel(c, j)) {
            const ty = v < 0 ? yb + 14 : ya - 7;
            svg += tag('text', { x: bx2 + barW / 2, y: ty, class: 'ds-chart__value', 'text-anchor': 'middle' }, escapeHtml(fmt(v)));
          }
        });
        if (isStack() && wantsLabel(c)) svg += tag('text', { x: gx + barW / 2, y: topY - 7, class: 'ds-chart__value', 'text-anchor': 'middle' }, escapeHtml(fmt(totals[c])));
        if (c % step === 0) {
          svg += tag('text', { x: bx + band / 2, y: top + plotH + 20, class: 'ds-chart__tick', 'text-anchor': 'middle' }, escapeHtml(fitText(cat, band * step - 6, FONTS.tick)));
        }
        marks.push({ c, x: bx + band / 2, y: topY, band: [bx + 2, top - valueSpace - 6, band - 4, plotH + valueSpace + 6] });
      });

      geo = { horizontal: false, band, left, top, plotH, n, marks };
    }

    frame.plot.innerHTML = `<svg class="ds-chart__svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${defs}${svg}</svg>`;

    // Tabela: os números de verdade, mesmo os que o gráfico não rotula.
    const raw = formatter(o.format);
    const cols = [{ label: o.categoryLabel ?? 'Categoria' }, ...o.series.map((s) => ({ label: s.name ?? 'Valor', num: true }))];
    if (isStack() && o.series.length > 1) cols.push({ label: 'Total', num: true });
    frame.setTable({
      columns: cols,
      rows: o.categories.map((cat, c) => {
        const vals = o.series.map((s) => s.values[c]);
        const row = [cat, ...vals.map((v) => (v == null ? '—' : raw(v)))];
        if (isStack() && o.series.length > 1) row.push(raw(vals.reduce((a, v) => a + (v ?? 0), 0)));
        return row;
      }),
    });
    frame.refresh();
  }

  frame.interact({
    count: () => (geo ? geo.n : 0),
    hit(px, py) {
      if (!geo) return null;
      if (geo.horizontal) {
        const c = Math.floor((py - geo.top) / geo.rowH);
        return c >= 0 && c < geo.n ? c : null;
      }
      if (px < geo.left) return null;
      const c = Math.floor((px - geo.left) / geo.band);
      return c >= 0 && c < geo.n ? c : null;
    },
    anchor: (c) => geo.marks[c],
    highlight(c) {
      const svg = frame.plot.querySelector('svg');
      if (!svg) return;
      const band = svg.querySelector('[data-band]');
      svg.querySelectorAll('[data-active]').forEach((el) => el.removeAttribute('data-active'));
      if (c == null || !geo) {
        band.setAttribute('width', 0);
        return;
      }
      const [bx, by, bw, bh] = geo.marks[c].band;
      band.setAttribute('x', bx);
      band.setAttribute('y', by);
      band.setAttribute('width', bw);
      band.setAttribute('height', bh);
      svg.querySelectorAll(`[data-c="${c}"]`).forEach((el) => el.setAttribute('data-active', ''));
    },
    describe(c) {
      const vs = visible();
      const raw = formatter(o.format);
      const pct = formatter('percent');
      const vals = vs.map((s) => s.values[c]);
      const total = vals.reduce((a, v) => a + Math.max(0, v ?? 0), 0);
      const rows = vs.map((s, j) => {
        const v = vals[j];
        let value = v == null ? '—' : raw(v);
        if (o.layout === 'percent' && v != null && total) value = `${pct(Math.max(0, v) / total)} · ${raw(v)}`;
        return { color: color(s, c, v ?? 0), mark: 'rect', value, name: s.name ?? '' };
      });
      let note;
      if (isStack() && vs.length > 1) note = `Total: ${raw(total)}`;
      if (o.ordinal && c > 0) {
        const prev = vs[0].values[c - 1];
        const cur = vs[0].values[c];
        if (prev && cur != null) note = `${pct(cur / prev)} da etapa anterior`;
      }
      return { title: o.tooltipLabels?.[c] ?? o.categories[c], rows, note };
    },
  });

  function summary() {
    const kind = o.orientation === 'horizontal' ? 'barras horizontais' : 'colunas';
    const layout = { stacked: ', empilhadas', percent: ', empilhadas em 100%' }[o.layout] ?? '';
    const series = o.series.length > 1 ? `, ${o.series.length} séries` : '';
    return `${o.title ?? o.label ?? 'Gráfico'}. Gráfico de ${kind}${layout}, ${o.categories.length} categorias${series}`;
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
