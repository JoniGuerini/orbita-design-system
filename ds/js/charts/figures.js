/**
 * Lume — quando o gráfico é um número: indicador (stat), sparkline e medidor.
 *
 * Geram HTML (string), sem estado — use em qualquer lugar:
 *
 *   sparkline([12, 14, 13, 18, 21], { width: 112, height: 32, label: 'Receita nos últimos 12 meses' })
 *   statTile({ label: 'Receita', value: 128400, format: 'currency-compact',
 *              delta: 0.124, deltaLabel: 'vs. mês anterior', good: 'up', trend: [...] })
 *   meter({ label: 'Armazenamento', value: 72, max: 100, format: v => `${v} GB`, thresholds: { warning: 0.75, danger: 0.9 } })
 *
 * O valor grande usa algarismos proporcionais; tabular só em colunas que precisam alinhar.
 */
import { icon } from '../../icons/icons.js';
import { formatter, escapeHtml, round, linePath, monotonePath, clamp } from './core.js';
import { msg } from '../i18n.js';

/**
 * Linha de tendência sem eixos: tom de contexto, o ponto atual na cor de destaque.
 * Estica na largura do contêiner (width é o padrão quando nada manda nele).
 */
export function sparkline(values, { width = 112, height = 32, label, area = true, curve = 'smooth', color, highlight = 'last', domain, className = '' } = {}) {
  const vals = values.map((v) => (v == null ? null : +v));
  const present = vals.filter((v) => v != null);
  if (present.length < 2) return '';
  let [lo, hi] = domain ?? [Math.min(...present), Math.max(...present)];
  // Série quase estável não vira serra: a escala cobre ao menos 10% do valor (honesto, sem exagerar ruído).
  const floor = Math.abs((lo + hi) / 2) * 0.1;
  if (!domain && hi - lo < floor) {
    const mid = (lo + hi) / 2;
    lo = mid - floor / 2;
    hi = mid + floor / 2;
  }
  // Coordenadas em %: o SVG estica sem deformar o traço (non-scaling-stroke) e o ponto é HTML.
  const VW = 100;
  const padX = 3;
  const padY = 4;
  const x = (i) => padX + (i * (VW - padX * 2)) / (vals.length - 1);
  const y = (v) => padY + (1 - (v - lo) / (hi - lo || 1)) * (height - padY * 2);
  const pts = vals.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
  const d = curve === 'smooth' ? monotonePath(pts) : linePath(pts);
  const lineColor = color ?? 'var(--ds-color-chart-other)';
  const end = pts.at(-1);
  const fill = area ? `<path class="ds-sparkline__area" d="${d}L${round(end[0])} ${height}L${round(pts[0][0])} ${height}Z" style="--c:${lineColor}"/>` : '';
  const dot = highlight === 'last' ? `<i class="ds-sparkline__dot" style="left:${round(end[0])}%;top:${round((end[1] / height) * 100)}%"></i>` : '';
  const a11y = label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true"';
  return `<span class="ds-sparkline${className ? ` ${className}` : ''}" style="--w:${width}px;--h:${height}px" ${a11y}><svg viewBox="0 0 ${VW} ${height}" preserveAspectRatio="none" aria-hidden="true">${fill}<path class="ds-sparkline__line" d="${d}" vector-effect="non-scaling-stroke" style="--c:${lineColor}"/></svg>${dot}</span>`;
}

/**
 * Indicador: rótulo · valor · variação (opcional) · tendência (opcional).
 * good: 'up' (subir é bom) | 'down' (cair é bom) | 'none' (neutro).
 */
export function statTile({ label, value, format = 'number', delta, deltaFormat = 'percent', deltaLabel, good = 'up', trend, trendLabel, hero = false, href, className = '' } = {}) {
  const shown = typeof value === 'number' ? formatter(format)(value) : value;
  let deltaHtml = '';
  if (delta != null) {
    const dir = Math.abs(delta) < 1e-9 ? 'flat' : delta > 0 ? 'up' : 'down';
    const tone = dir === 'flat' || good === 'none' ? 'neutral' : dir === good ? 'good' : 'bad';
    const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
    const text = `${sign}${formatter(deltaFormat)(Math.abs(delta))}`;
    const ic = dir === 'up' ? 'trending-up' : dir === 'down' ? 'trending-down' : 'minus';
    const meaning = msg({ good: 'chart.better', bad: 'chart.worse', neutral: 'chart.stable' }[tone]);
    deltaHtml = `<p class="ds-stat__delta" data-tone="${tone}">
      <span class="ds-stat__change">${icon(ic, { size: 16 })}<span>${escapeHtml(text)}</span><span class="ds-visually-hidden"> (${meaning})</span></span>
      ${deltaLabel ? `<span class="ds-stat__period">${escapeHtml(deltaLabel)}</span>` : ''}
    </p>`;
  }
  const spark = trend?.length ? `<div class="ds-stat__trend">${sparkline(trend, { width: hero ? 160 : 112, height: hero ? 44 : 32, label: trendLabel ?? msg('chart.trendOf', label) })}</div>` : '';
  const tagName = href ? 'a' : 'article';
  return `<${tagName} class="ds-stat${hero ? ' ds-stat--hero' : ''}${className ? ` ${className}` : ''}"${href ? ` href="${escapeHtml(href)}"` : ''}>
    <p class="ds-stat__label">${escapeHtml(label)}</p>
    <p class="ds-stat__value">${escapeHtml(shown)}</p>
    ${deltaHtml}
    ${spark}
  </${tagName}>`;
}

/**
 * Medidor: uma razão contra um limite. O preenchimento carrega a gravidade (marca → alerta → perigo)
 * e a trilha é um tom mais claro da mesma rampa.
 */
export function meter({ label, value, max = 1, min = 0, format, thresholds = { warning: 0.75, danger: 0.9 }, tone, caption, size = 'md', className = '' } = {}) {
  const ratio = clamp((value - min) / (max - min || 1), 0, 1);
  const t = tone ?? (thresholds?.danger != null && ratio >= thresholds.danger ? 'danger' : thresholds?.warning != null && ratio >= thresholds.warning ? 'warning' : 'brand');
  const fmt = format ? formatter(format) : (v) => formatter('percent')((v - min) / (max - min || 1));
  const valueText = fmt(value);
  const maxText = format ? formatter(format)(max) : null;
  const status = { warning: msg('chart.warning'), danger: msg('chart.critical'), success: msg('chart.ok') }[t] ?? '';
  return `<div class="ds-meter ds-meter--${t}${size === 'sm' ? ' ds-meter--sm' : ''}${className ? ` ${className}` : ''}" role="meter" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${value}" aria-valuetext="${escapeHtml(`${valueText}${maxText ? ` ${msg('chart.of')} ${maxText}` : ''}${status ? `, ${status}` : ''}`)}" aria-label="${escapeHtml(label)}">
    <div class="ds-meter__head">
      <span class="ds-meter__label">${escapeHtml(label)}</span>
      <span class="ds-meter__value">${t === 'warning' || t === 'danger' ? icon(t === 'danger' ? 'alert-circle' : 'alert-triangle', { size: 16 }) : ''}<strong>${escapeHtml(valueText)}</strong>${maxText ? `<span> ${msg('chart.of')} ${escapeHtml(maxText)}</span>` : ''}</span>
    </div>
    <div class="ds-meter__track"><span class="ds-meter__fill" style="--value:${round(ratio, 4)}"></span></div>
    ${caption ? `<p class="ds-meter__caption">${escapeHtml(caption)}</p>` : ''}
  </div>`;
}
