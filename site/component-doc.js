/**
 * Peças compartilhadas das páginas de componente.
 *
 *   playgroundMarkup(id)  → HTML do playground (palco + controles + código)
 *   mountPlayground(root, { id, controls, text?, render, code }) → liga tudo, devolve limpeza
 *   tokenTable(names)     → tabela "Tokens usados" com valores reais nos três temas
 *   a11yList(items)       → checklist de acessibilidade
 *   codeBlock(code)       → bloco de código com botão copiar
 */
import { icon } from '../ds/icons/icons.js';
import { tokens } from '../ds/tokens.js';
import { attachMenu } from '../ds/js/menu.js';
import { resolvedTheme } from '../ds/js/theme.js';
import { copyText } from '../ds/js/toast.js';
import { tr } from '../ds/js/i18n.js';
import { T } from './i18n.js';

const TEXT = T(
  { copy: 'Copiar código', copied: 'Código copiado', stageTheme: 'Tema do palco', dark: 'Escuro', light: 'Claro', refugio: 'Refúgio', token: 'Token', role: 'Papel' },
  { copy: 'Copy code', copied: 'Code copied', stageTheme: 'Stage theme', dark: 'Dark', light: 'Light', refugio: 'Refúgio', token: 'Token', role: 'Role' },
  { copy: 'Copiar código', copied: 'Código copiado', stageTheme: 'Tema del escenario', dark: 'Oscuro', light: 'Claro', refugio: 'Refúgio', token: 'Token', role: 'Función' },
);

export const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const byName = new Map(tokens.map((t) => [t.name, t]));

/* ───────── Bloco de código com copiar ───────── */

export function codeBlock(code, { label = tr(TEXT).copy } = {}) {
  return `<div class="cd-code">
    <pre class="ds-code"><code>${escapeHtml(code)}</code></pre>
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted cd-code__copy" data-copy-code aria-label="${label}" data-ds-tooltip="${label}">${icon('copy', { size: 16 })}</button>
  </div>`;
}

/* ───────── Palcos com tema próprio ───────── */

/** Tema em que os palcos de exemplo começam: o do site (Sistema vira Escuro ou Claro). */
export const siteTheme = () => resolvedTheme();

/**
 * Os palcos (stageSelector) acompanham o tema do site quando ele muda; os botões [data-<attr>] do palco
 * marcam o tema atual. Dá para trocar só o palco depois, pelo próprio seletor. Devolve a limpeza.
 */
export function followSiteTheme(root, stageSelector, attr) {
  const onTheme = (event) => {
    const theme = event.detail.resolved;
    root.querySelectorAll(stageSelector).forEach((stage) => {
      stage.dataset.theme = theme;
      stage.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-checked', String(b.getAttribute(`data-${attr}`) === theme)));
    });
  };
  document.documentElement.addEventListener('ds:themechange', onTheme);
  return () => document.documentElement.removeEventListener('ds:themechange', onTheme);
}

/* ───────── Playground ───────── */

export function playgroundMarkup(id, { wide = false } = {}) {
  const t = tr(TEXT);
  const th = siteTheme();
  return `<div class="cd-playground${wide ? ' cd-playground--wide' : ''}" data-playground="${id}">
    <div class="cd-playground__stage" data-stage data-theme="${th}">
      <div class="cd-playground__preview" data-preview></div>
      <div class="ds-segmented cd-playground__theme" role="radiogroup" aria-label="${t.stageTheme}">
        <button type="button" class="ds-segmented__item" role="radio" data-stage-theme="dark" aria-checked="${th === 'dark'}" aria-label="${t.dark}">${icon('moon', { size: 16 })}</button>
        <button type="button" class="ds-segmented__item" role="radio" data-stage-theme="light" aria-checked="${th === 'light'}" aria-label="${t.light}">${icon('sun', { size: 16 })}</button>
        <button type="button" class="ds-segmented__item" role="radio" data-stage-theme="refugio" aria-checked="${th === 'refugio'}" aria-label="${t.refugio}">${icon('mountain', { size: 16 })}</button>
      </div>
    </div>
    <div class="cd-playground__controls" data-controls></div>
    <div class="cd-playground__code" data-code></div>
  </div>`;
}

/**
 * controls: [{ id, label, value, options: [{ value, label, icon? }] }]
 * text: { id, label, value }   (campo de texto opcional, ex.: rótulo do botão)
 * render(state) → HTML do componente; code(state) → string de código
 * mount(preview, state) → opcional, para componentes montados em JS (ex.: gráficos); devolve limpeza
 */
export function mountPlayground(root, { id, controls, text, render, code, mount }) {
  const el = root.querySelector(`[data-playground="${id}"]`);
  const stage = el.querySelector('[data-stage]');
  const preview = el.querySelector('[data-preview]');
  const codeEl = el.querySelector('[data-code]');
  const controlsEl = el.querySelector('[data-controls]');
  const state = Object.fromEntries(controls.map((c) => [c.id, c.value]));
  if (text) state[text.id] = text.value;

  const optionLabel = (c, v) => c.options.find((o) => o.value === v)?.label ?? v;

  controlsEl.innerHTML =
    controls
      .map(
        (c) => `<button type="button" class="ds-chip cd-control" data-control="${c.id}">
          <span class="cd-control__label">${c.label}</span><span data-label>${optionLabel(c, c.value)}</span>
          <span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>
        </button>`,
      )
      .join('') +
    (text
      ? `<label class="ds-field cd-control-text"><span class="cd-control__label">${text.label}</span>
          <input class="ds-field__input" type="text" value="${escapeHtml(text.value)}" data-text spellcheck="false"></label>`
      : '');

  let unmount = null;
  const update = () => {
    unmount?.();
    preview.innerHTML = render(state);
    unmount = mount?.(preview, state) ?? null;
    codeEl.innerHTML = codeBlock(code(state));
  };

  const menus = controls.map((c) => {
    const chip = controlsEl.querySelector(`[data-control="${c.id}"]`);
    return attachMenu(chip, {
      label: c.label,
      value: c.value,
      options: c.options,
      onChange: (value) => {
        state[c.id] = value;
        chip.querySelector('[data-label]').textContent = optionLabel(c, value);
        update();
      },
    });
  });

  const input = controlsEl.querySelector('[data-text]');
  const onInput = () => {
    state[text.id] = input.value;
    update();
  };
  input?.addEventListener('input', onInput);

  const onStageTheme = (event) => {
    const btn = event.target.closest('[data-stage-theme]');
    if (!btn) return;
    stage.dataset.theme = btn.dataset.stageTheme;
    stage.querySelectorAll('[data-stage-theme]').forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
  };
  stage.addEventListener('click', onStageTheme);
  const unfollow = followSiteTheme(el, '[data-stage]', 'stage-theme');

  update();

  return () => {
    unmount?.();
    menus.forEach((m) => m.destroy());
    input?.removeEventListener('input', onInput);
    stage.removeEventListener('click', onStageTheme);
    unfollow();
  };
}

/** Copia blocos de código (delegação no root da página). */
export function mountCodeCopy(root) {
  const onClick = (event) => {
    const btn = event.target.closest('[data-copy-code]');
    if (btn) copyText(btn.parentElement.querySelector('code').textContent, tr(TEXT).copied);
    const token = event.target.closest('[data-copy-token]');
    if (token) copyText(token.dataset.copyToken);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

/* ───────── Tokens usados ───────── */

function tokenValue(t, mode) {
  if (t.type === 'color') return t.modes[mode].value.toUpperCase();
  if (t.type === 'typography') return `${t.size}/${t.line} · ${t.weight}`;
  if (t.modes) return t.modes[mode];
  if (t.px !== undefined) return `${t.px} px`;
  return t.css;
}

export function tokenTable(groups) {
  const t = tr(TEXT);
  return `<div class="doc-table cd-tokens">
    <div class="doc-table__head" aria-hidden="true"><span>${t.token}</span><span>${t.role}</span><span>${t.dark}</span><span>${t.light}</span><span>${t.refugio}</span></div>
    ${groups
      .map(([name, role]) => {
        const t = byName.get(name);
        if (!t) return '';
        const dark = tokenValue(t, 'dark');
        const light = tokenValue(t, 'light');
        const refugio = tokenValue(t, 'refugio');
        const swatch = (mode) => (t.type === 'color' ? `<span class="cd-tokens__swatch" style="background:${t.modes[mode].value}"></span>` : '');
        return `<div class="doc-table__row">
          <button type="button" class="cd-tokens__name" data-copy-token="var(${t.cssVar})"><span>${name}</span><code>${t.cssVar}</code></button>
          <span class="cd-tokens__role">${role}</span>
          <span class="cd-tokens__value">${swatch('dark')}${escapeHtml(dark)}</span>
          <span class="cd-tokens__value">${swatch('light')}${escapeHtml(light)}</span>
          <span class="cd-tokens__value">${swatch('refugio')}${escapeHtml(refugio)}</span>
        </div>`;
      })
      .join('')}
  </div>`;
}

/* ───────── Acessibilidade ───────── */

export function a11yList(items) {
  return `<ul class="cd-a11y" role="list">
    ${items
      .map(
        ([title, text, kbd]) => `<li class="cd-a11y__item">
          <span class="cd-a11y__icon">${icon('check', { size: 16 })}</span>
          <div><p class="cd-a11y__title">${title}${kbd ? ` <span class="cd-a11y__kbd">${kbd.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('')}</span>` : ''}</p><p class="cd-a11y__text">${text}</p></div>
        </li>`,
      )
      .join('')}
  </ul>`;
}
