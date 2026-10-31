import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/elevacao.css';

/* ───────── Dados ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const shadows = tokens.filter((t) => t.name.startsWith('shadow.'));
const zLayers = tokens.filter((t) => t.name.startsWith('z.')).sort((a, b) => Number(b.css) - Number(a.css));

const THEMES = [
  ['dark', 'Escuro'],
  ['light', 'Claro'],
];

// do fundo para cima
const LAYERS = [
  ['app', 'Atrás dos painéis do app shell.'],
  ['sunken', 'Campos e áreas rebaixadas.'],
  ['canvas', 'Fundo do painel de conteúdo.'],
  ['surface', 'Cards e blocos. A sidebar usa a mesma cor.'],
  ['raised', 'Painéis, menus e modais.'],
];

const SHADOW_USE = {
  xs: 'Detalhes mínimos.',
  sm: 'Controles levemente destacados.',
  md: 'Cards em destaque.',
  lg: 'Painéis, sidebar, tooltip e toast.',
  xl: 'Menus e popovers.',
  '2xl': '⌘K e gaveta do celular.',
};

// conferido em ds/components/*.css
const COMPONENTS = [
  ['Card', 'Bloco de conteúdo sobre o canvas.', 'surface', null, null],
  ['Painel', 'Superfície principal, como o “Roteiro”.', 'raised', 'lg', null],
  ['Sidebar e área principal', 'Os dois painéis do app shell.', 'surface', 'lg', null],
  ['Topbar', 'Fica presa no topo ao rolar.', 'canvas', null, 'sticky'],
  ['Menu', 'Abre a partir de um chip ou botão.', 'raised', 'xl', 'popover'],
  ['Tooltip', 'Dica sobre qualquer elemento.', 'raised', 'lg', 'tooltip'],
  ['Toast', 'Aviso curto e passageiro.', 'inverse', 'lg', 'toast'],
  ['Paleta ⌘K', 'Diálogo modal sobre o fundo escurecido.', 'raised', '2xl', 'modal'],
  ['Gaveta do celular', 'A sidebar em telas pequenas.', 'surface', '2xl', 'overlay'],
];

const Z_USE = {
  tooltip: 'Tooltip — sempre por cima de tudo.',
  toast: 'Toast.',
  popover: 'Menus e popovers.',
  modal: 'Modais (o ⌘K usa a camada nativa do <dialog>).',
  overlay: 'Fundo escurecido e gaveta do celular.',
  sticky: 'Topbar.',
  dropdown: 'Listas suspensas no fluxo.',
  raised: 'Algo que precisa passar à frente dos vizinhos.',
  base: 'Fluxo normal da página.',
};

const short = (name) => name.split('.').slice(1).join('.');
const hexOf = (layer, mode) => byName.get(`color.bg.${layer}`).modes[mode].value.toUpperCase();

/* ───────── Seções ───────── */

function stairs(mode, label) {
  return `<figure class="el-theme">
    <div class="el-stairs" data-theme="${mode}">
      ${LAYERS.map(
        ([layer], i) => `<div class="el-step" style="--el-step:${i};background:var(--ds-color-bg-${layer})">
          <span class="el-step__name">${layer}</span>
          <span class="el-step__hex">${hexOf(layer, mode)}</span>
        </div>`,
      ).join('')}
    </div>
    <figcaption class="el-theme__label"><span>${label}</span><span class="el-theme__hint">do fundo para cima ${icon('arrow-right', { size: 14 })}</span></figcaption>
  </figure>`;
}

function shadowStage(mode, label) {
  return `<figure class="el-theme">
    <div class="el-shadows" data-theme="${mode}">
      ${shadows
        .map(
          (t) => `<button type="button" class="el-shadow" style="box-shadow:var(${t.cssVar})" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})">
            <span class="el-shadow__name">${short(t.name)}</span>
            <span class="el-shadow__use">${SHADOW_USE[short(t.name)] ?? ''}</span>
          </button>`,
        )
        .join('')}
    </div>
    <figcaption class="el-theme__label"><span>${label}</span><code class="ds-inline-code">data-theme="${mode}"</code></figcaption>
  </figure>`;
}

/** Etiqueta copiável de token; `label` é o nome curto (ex.: bg.raised), `cssPrefix` monta a variável. */
const tokenTag = (cssPrefix, label, value) =>
  value
    ? `<button type="button" class="el-tag" data-copy="var(--ds-${cssPrefix}-${value})" aria-label="Copiar var(--ds-${cssPrefix}-${value})">${label}.${value}</button>`
    : '<span class="el-tag el-tag--none" aria-label="nenhuma">—</span>';

/* ───────── Página ───────── */

export default function renderElevacao(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Elevação</h1>
        <p class="doc-header__lead">No Órbita, profundidade vem primeiro da cor da superfície e só depois da sombra. Camadas claras, sombras macias e uma ordem de empilhamento sem surpresas.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">camadas de superfície</dt><dd class="doc-stat__value">${LAYERS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">sombras</dt><dd class="doc-stat__value">${shadows.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">níveis de z-index</dt><dd class="doc-stat__value">${zLayers.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="camadas">Camadas</button>
      <button type="button" class="doc-nav__link" data-target="sombras">Sombras</button>
      <button type="button" class="doc-nav__link" data-target="quando-elevar">Quando elevar</button>
      <button type="button" class="doc-nav__link" data-target="empilhamento">Empilhamento</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="camadas" aria-labelledby="camadas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="camadas-title">Camadas de superfície</h2>
          <p class="doc-section__desc">Cada degrau é uma superfície um pouco mais alta. No escuro, subir é clarear; no claro, a camada mais alta é o branco.</p>
        </div>
      </header>
      <div class="el-themes">${THEMES.map(([m, l]) => stairs(m, l)).join('')}</div>
      <ol class="el-legend" role="list">
        ${LAYERS.map(
          ([layer, desc], i) => `<li class="el-legend__item">
            <span class="el-legend__index">${String(i + 1).padStart(2, '0')}</span>
            <button type="button" class="el-tag" data-copy="var(--ds-color-bg-${layer})" aria-label="Copiar var(--ds-color-bg-${layer})">bg.${layer}</button>
            <span class="el-legend__desc">${desc}</span>
          </li>`,
        ).join('')}
      </ol>
    </section>

    <section class="doc-section" id="sombras" aria-labelledby="sombras-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="sombras-title">Sombras</h2>
          <p class="doc-section__desc">Seis sombras em duas camadas — uma curta e definida, outra longa e difusa. No escuro são pretas e densas; no claro, um marrom quente bem suave. Clique numa sombra para copiar.</p>
        </div>
      </header>
      <div class="el-themes">${THEMES.map(([m, l]) => shadowStage(m, l)).join('')}</div>

      <h3 class="doc-subhead">Valores <span class="doc-subhead__meta">mesmo token, valor diferente em cada tema</span></h3>
      <div class="doc-table el-values">
        <div class="doc-table__head" aria-hidden="true"><span>Token</span><span>Escuro</span><span>Claro</span><span></span></div>
        ${shadows
          .map(
            (t) => `<div class="doc-table__row">
              <div class="el-values__token"><span class="el-values__name">${t.name}</span><span class="el-values__var">${t.cssVar}</span></div>
              <code class="el-values__code">${t.modes.dark}</code>
              <code class="el-values__code">${t.modes.light}</code>
              <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})" data-ds-tooltip="Copiar variável">${icon('copy', { size: 18 })}</button>
            </div>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="quando-elevar" aria-labelledby="quando-elevar-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="quando-elevar-title">Quando elevar</h2>
          <p class="doc-section__desc">O que fica no fluxo usa só cor de superfície. Sombra é para o que se separa da página; sombra forte, só para o que flutua por cima de tudo.</p>
        </div>
      </header>
      <div class="doc-table el-components">
        <div class="doc-table__head" aria-hidden="true"><span>Componente</span><span>Superfície</span><span>Sombra</span><span>Camada</span></div>
        ${COMPONENTS.map(
          ([name, desc, surface, shadow, z]) => `<div class="doc-table__row">
            <div class="el-components__name"><span class="el-components__label">${name}</span><span class="el-components__desc">${desc}</span></div>
            <div class="el-components__cell el-components__surface" data-label="Superfície"><span class="el-swatch" style="background:var(--ds-color-bg-${surface})" aria-hidden="true"></span>${tokenTag('color-bg', 'bg', surface)}</div>
            <div class="el-components__cell" data-label="Sombra">${tokenTag('shadow', 'shadow', shadow)}</div>
            <div class="el-components__cell" data-label="Camada">${tokenTag('z', 'z', z)}</div>
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="empilhamento" aria-labelledby="empilhamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="empilhamento-title">Empilhamento</h2>
          <p class="doc-section__desc">A ordem de quem fica por cima. Use sempre o token: os intervalos de 100 deixam espaço para casos especiais sem briga de números.</p>
        </div>
      </header>
      <ol class="el-z" role="list">
        ${zLayers
          .map(
            (t, i) => `<li class="el-z__row" style="--el-i:${i}">
              <span class="el-z__value">${t.css}</span>
              <button type="button" class="el-z__bar" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})">
                <span class="el-z__name">${short(t.name)}</span>
                <span class="el-z__use">${Z_USE[short(t.name)] ?? ''}</span>
              </button>
            </li>`,
          )
          .join('')}
      </ol>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Menos sombra, mais intenção.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: camada de cor primeiro</p>
          <p class="usage-card__text">Um card sobre o canvas só precisa da superfície e de uma borda sutil.</p>
          <pre class="ds-code ds-code--sm"><code>background: var(--ds-color-bg-surface);
border: 1px solid var(--ds-color-border-subtle);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: sombra forte no fluxo</p>
          <p class="usage-card__text">Sombra grande em algo que não flutua cria ruído e rouba a hierarquia dos menus e modais.</p>
          <pre class="ds-code ds-code--sm"><code>.card { box-shadow: var(--ds-shadow-2xl); }</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}z-index só por token</p>
          <p class="usage-card__text">Números soltos viram uma corrida (999, 9999…). Os tokens já dizem quem fica por cima.</p>
          <pre class="ds-code ds-code--sm"><code>z-index: var(--ds-z-popover);</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const onClick = (event) => {
    const copy = event.target.closest('[data-copy]');
    if (copy) copyText(copy.dataset.copy);
  };
  root.addEventListener('click', onClick);
  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    unmountNav();
  };
}
