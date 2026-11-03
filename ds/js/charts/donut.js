/**
 * Lume — gráfico de rosca (parte do todo).
 *
 * donutChart(host, {
 *   items: [{ name: 'Pix', value: 420, color? }],
 *   format: 'number',
 *   center: 'total' | { value, label } | false,   o miolo mostra o total e, no hover, a fatia
 *   centerLabel: 'Total',
 *   maxSegments: 6,                                 da 6ª fatia em diante, tudo vira “Outros”
 *   size: 200, thickness: 24,
 *   title, subtitle, label, card, table, texture,
 * }) → { update(options), setLoading(bool), destroy(), el }
 *
 * Use para ver a proporção de relance, com até 6 fatias. Para comparar valores próximos, use barras.
 */
import { createFrame, formatter, paint, escapeHtml, tag, round, clamp, texturePatterns } from './core.js';
import { msg } from '../i18n.js';

const GAP = 2;

export function donutChart(host, input) {
  let source = input;
  let o = normalize(source);
  const frame = createFrame(host, o, { kind: 'donut' });
  let geo = null;

  function normalize(opts) {
    return { format: 'number', center: 'total', centerLabel: msg('chart.total'), maxSegments: 6, size: 200, thickness: 24, items: [], ...opts };
  }

  /** Cor segue a entidade (posição original); a cauda vira “Outros”. */
  function parts() {
    const items = o.items.map((it, i) => ({ ...it, value: Math.max(0, +it.value || 0), paint: paint(it.color, i) }));
    if (items.length <= o.maxSegments) return items;
    const keep = new Set([...items].sort((a, b) => b.value - a.value).slice(0, o.maxSegments - 1));
    const kept = items.filter((it) => keep.has(it));
    const rest = items.filter((it) => !keep.has(it));
    return [...kept, { name: o.otherLabel ?? msg('chart.others'), value: rest.reduce((a, it) => a + it.value, 0), paint: 'var(--ds-color-chart-other)', folded: rest }];
  }

  function arc(cx, cy, R, r, a0, a1) {
    const f = (n) => round(n, 2);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad, a) => `${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`;
    return `M${p(R, a0)}A${f(R)} ${f(R)} 0 ${large} 1 ${p(R, a1)}L${p(r, a1)}A${f(r)} ${f(r)} 0 ${large} 0 ${p(r, a0)}Z`;
  }

  function ring(cx, cy, R, r) {
    const c = (rad) => `M${round(cx - rad)} ${round(cy)}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0`;
    return `${c(R)}${c(r)}`;
  }

  function render() {
    const W = frame.width;
    if (!W) return;
    const items = parts();
    const total = items.reduce((a, it) => a + it.value, 0);
    if (!items.length || !total) {
      geo = null;
      frame.empty();
      return;
    }
    const fmt = formatter(o.format);
    const pct = formatter('percent');
    const size = Math.min(o.size, W);
    const side = W >= size + 260;
    const R = size / 2 - 6;
    const r = Math.max(8, R - clamp(o.thickness, 8, R - 8));
    const cx = size / 2;
    const cy = size / 2;
    const midR = (R + r) / 2;
    const gap = items.filter((it) => it.value > 0).length > 1 ? GAP / midR : 0;

    let a = -Math.PI / 2;
    const segs = items.map((it, i) => {
      const span = (it.value / total) * Math.PI * 2;
      const a0 = a + gap / 2;
      const a1 = a + span - gap / 2;
      a += span;
      const full = span >= Math.PI * 2 - 1e-6;
      const d = !it.value ? '' : full ? ring(cx, cy, R, r) : a1 > a0 ? arc(cx, cy, R, r, a0, a1) : '';
      const pop = !it.value ? '' : full ? ring(cx, cy, R + 4, r) : a1 > a0 ? arc(cx, cy, R + 4, r, a0, a1) : '';
      return { ...it, i, d, pop, mid: (a0 + a1) / 2, share: it.value / total };
    });

    const defs = o.texture ? `<defs>${texturePatterns(frame.id, segs.map((s) => s.paint))}</defs>` : '';
    const paths = segs
      .map((s) =>
        s.d
          ? tag('path', {
              d: s.d,
              class: 'ds-donut__seg',
              'data-i': s.i,
              'fill-rule': 'evenodd',
              style: `--c:${s.paint}${o.texture ? `;--t:url(#${frame.id}-t${s.i})` : ''};--d:${s.i * 40}ms`,
            })
          : '',
      )
      .join('');

    const list = segs
      .map(
        (s) => `<li class="ds-donut__item" data-i="${s.i}">
          <span class="ds-chart__key-mark" data-mark="rect" style="--c:${s.paint}"></span>
          <span class="ds-donut__name">${escapeHtml(s.name)}</span>
          <span class="ds-donut__value">${escapeHtml(fmt(s.value))}</span>
          <span class="ds-donut__share">${escapeHtml(pct(s.share))}</span>
        </li>`,
      )
      .join('');

    frame.plot.innerHTML = `<div class="ds-donut" data-layout="${side ? 'side' : 'stack'}">
      <div class="ds-donut__figure" style="width:${size}px;height:${size}px">
        <svg class="ds-chart__svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">${defs}${paths}</svg>
        ${o.center === false ? '' : `<div class="ds-donut__center" aria-hidden="true"><span class="ds-donut__center-value" data-center-value></span><span class="ds-donut__center-label" data-center-label></span></div>`}
      </div>
      <ul class="ds-donut__list" role="list" aria-hidden="true">${list}</ul>
    </div>`;

    geo = { segs, total, size, R, r, cx, cy, fmt, pct };
    setCenter(null);

    frame.setTable({
      columns: [{ label: o.categoryLabel ?? msg('chart.category') }, { label: o.valueLabel ?? msg('chart.value'), num: true }, { label: '%', num: true }],
      rows: [...segs.flatMap((s) => (s.folded ? s.folded.map((f) => [f.name, fmt(f.value), pct(f.value / total)]) : [[s.name, fmt(s.value), pct(s.share)]])), [msg('chart.total'), fmt(total), pct(1)]],
    });
    frame.refresh();
  }

  function setCenter(i) {
    const v = frame.plot.querySelector('[data-center-value]');
    const l = frame.plot.querySelector('[data-center-label]');
    if (!v || !geo) return;
    if (i == null) {
      const c = typeof o.center === 'object' ? o.center : null;
      v.textContent = c?.value ?? geo.fmt(geo.total);
      l.textContent = c?.label ?? o.centerLabel;
    } else {
      const s = geo.segs[i];
      v.textContent = geo.pct(s.share);
      l.textContent = s.name;
    }
  }

  frame.interact({
    tooltip: false,
    count: () => (geo ? geo.segs.length : 0),
    hit(px, py, event) {
      if (!geo) return null;
      const item = event?.target?.closest?.('[data-i]');
      if (item && item.classList.contains('ds-donut__item')) return +item.dataset.i;
      const fig = frame.plot.querySelector('.ds-donut__figure').getBoundingClientRect();
      const box = frame.plot.getBoundingClientRect();
      const dx = px - (fig.left - box.left) - geo.cx;
      const dy = py - (fig.top - box.top) - geo.cy;
      const dist = Math.hypot(dx, dy);
      if (dist < geo.r - 6 || dist > geo.R + 8) return null;
      let ang = Math.atan2(dy, dx) + Math.PI / 2;
      if (ang < 0) ang += Math.PI * 2;
      let acc = 0;
      for (const s of geo.segs) {
        acc += s.share * Math.PI * 2;
        if (ang <= acc) return s.i;
      }
      return geo.segs.length - 1;
    },
    anchor: () => ({ x: 0, y: 0 }),
    highlight(i) {
      if (!geo) return;
      frame.plot.querySelectorAll('.ds-donut__seg').forEach((el) => {
        const s = geo.segs[+el.dataset.i];
        const on = +el.dataset.i === i;
        el.setAttribute('d', on ? s.pop : s.d);
        el.toggleAttribute('data-active', on);
        el.toggleAttribute('data-dim', i != null && !on);
      });
      frame.plot.querySelectorAll('.ds-donut__item').forEach((el) => el.toggleAttribute('data-active', +el.dataset.i === i));
      setCenter(i);
    },
    describe(i) {
      const s = geo.segs[i];
      return { title: s.name, rows: [{ value: `${geo.pct(s.share)} · ${geo.fmt(s.value)}`, name: '' }] };
    },
  });

  function summary() {
    return msg('chart.summaryDonut', o.title ?? o.label ?? msg('chart.chart'), Math.min(o.items.length, o.maxSegments));
  }

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
