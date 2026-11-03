import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { tr } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T } from '../i18n.js';

export const styles = 'site/pages/elevacao.css';

/* ───────── Textos ───────── */

const COPY = T(
  {
    lead: 'No Lume, profundidade vem primeiro da cor da superfície e só depois da sombra. Camadas claras, sombras macias e uma ordem de empilhamento sem surpresas.',
    stats: ['camadas de superfície', 'sombras', 'níveis de z-index'],
    onThisPage: 'Nesta página',
    nav: ['Camadas', 'Sombras', 'Quando elevar', 'Empilhamento', 'Uso'],
    themes: { dark: 'Escuro', light: 'Claro', refugio: 'Refúgio' },
    copyVar: (v) => `Copiar var(${v})`,
    copyTooltip: 'Copiar variável',
    none: 'nenhuma',
    layers: {
      app: 'Atrás dos painéis do app shell.',
      sunken: 'Campos e áreas rebaixadas.',
      canvas: 'Fundo do painel de conteúdo.',
      surface: 'Cards e blocos. A sidebar usa a mesma cor.',
      raised: 'Painéis, menus e modais.',
    },
    upward: 'do fundo para cima',
    shadowUse: { xs: 'Detalhes mínimos.', sm: 'Controles levemente destacados.', md: 'Cards em destaque.', lg: 'Painéis, sidebar, tooltip e toast.', xl: 'Menus e popovers.', '2xl': '⌘K e gaveta do celular.' },
    components: [
      ['Card', 'Bloco de conteúdo sobre o canvas.'],
      ['Painel', 'Superfície principal, como o “Roteiro”.'],
      ['Sidebar e área principal', 'Os dois painéis do app shell.'],
      ['Topbar', 'Fica presa no topo ao rolar.'],
      ['Menu', 'Abre a partir de um chip ou botão.'],
      ['Tooltip', 'Dica sobre qualquer elemento.'],
      ['Toast', 'Aviso curto e passageiro.'],
      ['Paleta ⌘K', 'Diálogo modal sobre o fundo escurecido.'],
      ['Gaveta do celular', 'A sidebar em telas pequenas.'],
    ],
    zUse: {
      tooltip: 'Tooltip — sempre por cima de tudo.',
      toast: 'Toast.',
      popover: 'Menus e popovers.',
      modal: 'Modais (o ⌘K usa a camada nativa do <dialog>).',
      overlay: 'Fundo escurecido e gaveta do celular.',
      sticky: 'Topbar.',
      dropdown: 'Listas suspensas no fluxo.',
      raised: 'Algo que precisa passar à frente dos vizinhos.',
      base: 'Fluxo normal da página.',
    },
    layersSection: { title: 'Camadas de superfície', desc: 'Cada degrau é uma superfície um pouco mais alta. No escuro, subir é clarear; no claro e no Refúgio, a camada mais alta é o branco.' },
    shadows: { title: 'Sombras', desc: 'Seis sombras em duas camadas — uma curta e definida, outra longa e difusa. No escuro são pretas e densas; no claro, um marrom quente bem suave; no Refúgio, a ardósia. Clique numa sombra para copiar.', values: 'Valores', valuesMeta: 'mesmo token, valor diferente em cada tema', head: ['Token', 'Escuro', 'Claro', 'Refúgio'] },
    when: { title: 'Quando elevar', desc: 'O que fica no fluxo usa só cor de superfície. Sombra é para o que se separa da página; sombra forte, só para o que flutua por cima de tudo.', head: ['Componente', 'Superfície', 'Sombra', 'Camada'] },
    stacking: { title: 'Empilhamento', desc: 'A ordem de quem fica por cima. Use sempre o token: os intervalos de 100 deixam espaço para casos especiais sem briga de números.' },
    usage: {
      title: 'Uso',
      desc: 'Menos sombra, mais intenção.',
      do: ['Faça: camada de cor primeiro', 'Um card sobre o canvas só precisa da superfície e de uma borda sutil.'],
      dont: ['Evite: sombra forte no fluxo', 'Sombra grande em algo que não flutua cria ruído e rouba a hierarquia dos menus e modais.'],
      tip: ['z-index só por token', 'Números soltos viram uma corrida (999, 9999…). Os tokens já dizem quem fica por cima.'],
    },
  },
  {
    lead: 'In Lume, depth comes first from the surface color and only then from the shadow. Clear layers, soft shadows, and a stacking order with no surprises.',
    stats: ['surface layers', 'shadows', 'z-index levels'],
    onThisPage: 'On this page',
    nav: ['Layers', 'Shadows', 'When to elevate', 'Stacking', 'Usage'],
    themes: { dark: 'Dark', light: 'Light', refugio: 'Refúgio' },
    copyVar: (v) => `Copy var(${v})`,
    copyTooltip: 'Copy variable',
    none: 'none',
    layers: {
      app: 'Behind the app shell panels.',
      sunken: 'Fields and recessed areas.',
      canvas: 'Background of the content panel.',
      surface: 'Cards and blocks. The sidebar uses the same color.',
      raised: 'Panels, menus, and modals.',
    },
    upward: 'from the back up',
    shadowUse: { xs: 'Minimal details.', sm: 'Slightly raised controls.', md: 'Highlighted cards.', lg: 'Panels, sidebar, tooltip, and toast.', xl: 'Menus and popovers.', '2xl': '⌘K and the mobile drawer.' },
    components: [
      ['Card', 'A content block on the canvas.'],
      ['Panel', 'The main surface, like the “Script” panel.'],
      ['Sidebar and main area', 'The two panels of the app shell.'],
      ['Top bar', 'Sticks to the top while scrolling.'],
      ['Menu', 'Opens from a chip or a button.'],
      ['Tooltip', 'A hint over any element.'],
      ['Toast', 'A short, passing notice.'],
      ['⌘K palette', 'A modal dialog over the dimmed background.'],
      ['Mobile drawer', 'The sidebar on small screens.'],
    ],
    zUse: {
      tooltip: 'Tooltip — always on top of everything.',
      toast: 'Toast.',
      popover: 'Menus and popovers.',
      modal: 'Modals (⌘K uses the native <dialog> layer).',
      overlay: 'Dimmed background and the mobile drawer.',
      sticky: 'Top bar.',
      dropdown: 'In-flow dropdown lists.',
      raised: 'Something that needs to sit in front of its neighbors.',
      base: 'Normal page flow.',
    },
    layersSection: { title: 'Surface layers', desc: 'Each step is a slightly higher surface. In dark, going up means lighter; in light, the highest layer is white.' },
    shadows: { title: 'Shadows', desc: 'Six two-layer shadows — one short and defined, one long and diffuse. In dark they’re black and dense; in light, a very soft warm brown; in Refúgio, slate. Click a shadow to copy it.', values: 'Values', valuesMeta: 'same token, different value in each theme', head: ['Token', 'Dark', 'Light', 'Refúgio'] },
    when: { title: 'When to elevate', desc: 'What stays in the flow uses surface color only. Shadows are for what separates from the page; strong shadows, only for what floats above everything.', head: ['Component', 'Surface', 'Shadow', 'Layer'] },
    stacking: { title: 'Stacking', desc: 'The order of who sits on top. Always use the token: the gaps of 100 leave room for special cases without a numbers fight.' },
    usage: {
      title: 'Usage',
      desc: 'Less shadow, more intent.',
      do: ['Do: color layer first', 'A card on the canvas only needs the surface and a subtle border.'],
      dont: ['Avoid: strong shadows in the flow', 'A large shadow on something that doesn’t float adds noise and steals the hierarchy from menus and modals.'],
      tip: ['z-index only via tokens', 'Loose numbers turn into a race (999, 9999…). The tokens already say who sits on top.'],
    },
  },
  {
    lead: 'En Lume, la profundidad viene primero del color de la superficie y solo después de la sombra. Capas claras, sombras suaves y un orden de apilamiento sin sorpresas.',
    stats: ['capas de superficie', 'sombras', 'niveles de z-index'],
    onThisPage: 'En esta página',
    nav: ['Capas', 'Sombras', 'Cuándo elevar', 'Apilamiento', 'Uso'],
    themes: { dark: 'Oscuro', light: 'Claro', refugio: 'Refúgio' },
    copyVar: (v) => `Copiar var(${v})`,
    copyTooltip: 'Copiar variable',
    none: 'ninguna',
    layers: {
      app: 'Detrás de los paneles del app shell.',
      sunken: 'Campos y áreas hundidas.',
      canvas: 'Fondo del panel de contenido.',
      surface: 'Tarjetas y bloques. La sidebar usa el mismo color.',
      raised: 'Paneles, menús y modales.',
    },
    upward: 'del fondo hacia arriba',
    shadowUse: { xs: 'Detalles mínimos.', sm: 'Controles levemente destacados.', md: 'Tarjetas destacadas.', lg: 'Paneles, sidebar, tooltip y toast.', xl: 'Menús y popovers.', '2xl': '⌘K y el cajón del móvil.' },
    components: [
      ['Tarjeta', 'Bloque de contenido sobre el canvas.'],
      ['Panel', 'La superficie principal, como el panel “Guion”.'],
      ['Sidebar y área principal', 'Los dos paneles del app shell.'],
      ['Barra superior', 'Queda fija arriba al desplazarse.'],
      ['Menú', 'Se abre desde un chip o un botón.'],
      ['Tooltip', 'Pista sobre cualquier elemento.'],
      ['Toast', 'Aviso corto y pasajero.'],
      ['Paleta ⌘K', 'Diálogo modal sobre el fondo oscurecido.'],
      ['Cajón del móvil', 'La sidebar en pantallas pequeñas.'],
    ],
    zUse: {
      tooltip: 'Tooltip — siempre por encima de todo.',
      toast: 'Toast.',
      popover: 'Menús y popovers.',
      modal: 'Modales (el ⌘K usa la capa nativa del <dialog>).',
      overlay: 'Fondo oscurecido y cajón del móvil.',
      sticky: 'Barra superior.',
      dropdown: 'Listas desplegables en el flujo.',
      raised: 'Algo que necesita pasar por delante de sus vecinos.',
      base: 'Flujo normal de la página.',
    },
    layersSection: { title: 'Capas de superficie', desc: 'Cada escalón es una superficie un poco más alta. En oscuro, subir es aclarar; en claro y en Refúgio, la capa más alta es el blanco.' },
    shadows: { title: 'Sombras', desc: 'Seis sombras en dos capas — una corta y definida, otra larga y difusa. En oscuro son negras y densas; en claro, un marrón cálido muy suave; en Refúgio, la pizarra. Haz clic en una sombra para copiarla.', values: 'Valores', valuesMeta: 'mismo token, valor distinto en cada tema', head: ['Token', 'Oscuro', 'Claro', 'Refúgio'] },
    when: { title: 'Cuándo elevar', desc: 'Lo que queda en el flujo usa solo color de superficie. La sombra es para lo que se separa de la página; la sombra fuerte, solo para lo que flota por encima de todo.', head: ['Componente', 'Superficie', 'Sombra', 'Capa'] },
    stacking: { title: 'Apilamiento', desc: 'El orden de quién queda encima. Usa siempre el token: los intervalos de 100 dejan espacio para casos especiales sin pelea de números.' },
    usage: {
      title: 'Uso',
      desc: 'Menos sombra, más intención.',
      do: ['Haz: primero la capa de color', 'Una tarjeta sobre el canvas solo necesita la superficie y un borde sutil.'],
      dont: ['Evita: sombra fuerte en el flujo', 'Una sombra grande en algo que no flota crea ruido y le roba la jerarquía a menús y modales.'],
      tip: ['z-index solo con tokens', 'Los números sueltos se vuelven una carrera (999, 9999…). Los tokens ya dicen quién queda encima.'],
    },
  },
);

/* ───────── Dados ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const shadows = tokens.filter((t) => t.name.startsWith('shadow.'));
const zLayers = tokens.filter((t) => t.name.startsWith('z.')).sort((a, b) => Number(b.css) - Number(a.css));

// o terceiro tema vai para a linha de baixo, ocupando a largura das duas colunas
const THEMES = ['dark', 'light', 'refugio'];

// do fundo para cima
const LAYERS = ['app', 'sunken', 'canvas', 'surface', 'raised'];

// conferido em ds/components/*.css: [superfície, sombra, camada]
const COMPONENTS = [
  ['surface', null, null],
  ['raised', 'lg', null],
  ['surface', 'lg', null],
  ['canvas', null, 'sticky'],
  ['raised', 'xl', 'popover'],
  ['raised', 'lg', 'tooltip'],
  ['inverse', 'lg', 'toast'],
  ['raised', '2xl', 'modal'],
  ['surface', '2xl', 'overlay'],
];

const short = (name) => name.split('.').slice(1).join('.');
const hexOf = (layer, mode) => byName.get(`color.bg.${layer}`).modes[mode].value.toUpperCase();
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ───────── Seções ───────── */

function stairs(c, mode) {
  return `<figure class="el-theme">
    <div class="el-stairs" data-theme="${mode}">
      ${LAYERS.map(
        (layer, i) => `<div class="el-step" style="--el-step:${i};background:var(--ds-color-bg-${layer})">
          <span class="el-step__name">${layer}</span>
          <span class="el-step__hex">${hexOf(layer, mode)}</span>
        </div>`,
      ).join('')}
    </div>
    <figcaption class="el-theme__label"><span>${c.themes[mode]}</span><span class="el-theme__hint">${c.upward} ${icon('arrow-right', { size: 14 })}</span></figcaption>
  </figure>`;
}

function shadowStage(c, mode) {
  return `<figure class="el-theme">
    <div class="el-shadows" data-theme="${mode}">
      ${shadows
        .map(
          (t) => `<button type="button" class="el-shadow" style="box-shadow:var(${t.cssVar})" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar)}">
            <span class="el-shadow__name">${short(t.name)}</span>
            <span class="el-shadow__use">${c.shadowUse[short(t.name)] ?? ''}</span>
          </button>`,
        )
        .join('')}
    </div>
    <figcaption class="el-theme__label"><span>${c.themes[mode]}</span><code class="ds-inline-code">data-theme="${mode}"</code></figcaption>
  </figure>`;
}

/** Etiqueta copiável de token; `label` é o nome curto (ex.: bg.raised), `cssPrefix` monta a variável. */
const tokenTag = (c, cssPrefix, label, value) =>
  value
    ? `<button type="button" class="el-tag" data-copy="var(--ds-${cssPrefix}-${value})" aria-label="${c.copyVar(`--ds-${cssPrefix}-${value}`)}">${label}.${value}</button>`
    : `<span class="el-tag el-tag--none" aria-label="${c.none}">—</span>`;

/* ───────── Página ───────── */

const NAV_IDS = ['camadas', 'sombras', 'quando-elevar', 'empilhamento', 'uso'];

export default function renderElevacao(page) {
  const c = tr(COPY);
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[LAYERS.length, shadows.length, zLayers.length].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="camadas" aria-labelledby="camadas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="camadas-title">${c.layersSection.title}</h2>
          <p class="doc-section__desc">${c.layersSection.desc}</p>
        </div>
      </header>
      <div class="el-themes">${THEMES.map((m) => stairs(c, m)).join('')}</div>
      <ol class="el-legend" role="list">
        ${LAYERS.map(
          (layer, i) => `<li class="el-legend__item">
            <span class="el-legend__index">${String(i + 1).padStart(2, '0')}</span>
            <button type="button" class="el-tag" data-copy="var(--ds-color-bg-${layer})" aria-label="${c.copyVar(`--ds-color-bg-${layer}`)}">bg.${layer}</button>
            <span class="el-legend__desc">${c.layers[layer]}</span>
          </li>`,
        ).join('')}
      </ol>
    </section>

    <section class="doc-section" id="sombras" aria-labelledby="sombras-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="sombras-title">${c.shadows.title}</h2>
          <p class="doc-section__desc">${c.shadows.desc}</p>
        </div>
      </header>
      <div class="el-themes">${THEMES.map((m) => shadowStage(c, m)).join('')}</div>

      <h3 class="doc-subhead">${c.shadows.values} <span class="doc-subhead__meta">${c.shadows.valuesMeta}</span></h3>
      <div class="doc-table el-values">
        <div class="doc-table__head" aria-hidden="true">${c.shadows.head.map((h) => `<span>${h}</span>`).join('')}<span></span></div>
        ${shadows
          .map(
            (t) => `<div class="doc-table__row">
              <div class="el-values__token"><span class="el-values__name">${t.name}</span><span class="el-values__var">${t.cssVar}</span></div>
              <code class="el-values__code">${t.modes.dark}</code>
              <code class="el-values__code">${t.modes.light}</code>
              <code class="el-values__code">${t.modes.refugio}</code>
              <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar)}" data-ds-tooltip="${c.copyTooltip}">${icon('copy', { size: 18 })}</button>
            </div>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="quando-elevar" aria-labelledby="quando-elevar-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="quando-elevar-title">${c.when.title}</h2>
          <p class="doc-section__desc">${c.when.desc}</p>
        </div>
      </header>
      <div class="doc-table el-components">
        <div class="doc-table__head" aria-hidden="true">${c.when.head.map((h) => `<span>${h}</span>`).join('')}</div>
        ${COMPONENTS.map(([surface, shadow, z], i) => {
          const [name, desc] = c.components[i];
          return `<div class="doc-table__row">
            <div class="el-components__name"><span class="el-components__label">${name}</span><span class="el-components__desc">${desc}</span></div>
            <div class="el-components__cell el-components__surface" data-label="${c.when.head[1]}"><span class="el-swatch" style="background:var(--ds-color-bg-${surface})" aria-hidden="true"></span>${tokenTag(c, 'color-bg', 'bg', surface)}</div>
            <div class="el-components__cell" data-label="${c.when.head[2]}">${tokenTag(c, 'shadow', 'shadow', shadow)}</div>
            <div class="el-components__cell" data-label="${c.when.head[3]}">${tokenTag(c, 'z', 'z', z)}</div>
          </div>`;
        }).join('')}
      </div>
    </section>

    <section class="doc-section" id="empilhamento" aria-labelledby="empilhamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="empilhamento-title">${c.stacking.title}</h2>
          <p class="doc-section__desc">${c.stacking.desc}</p>
        </div>
      </header>
      <ol class="el-z" role="list">
        ${zLayers
          .map(
            (t, i) => `<li class="el-z__row" style="--el-i:${i}">
              <span class="el-z__value">${t.css}</span>
              <button type="button" class="el-z__bar" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar)}">
                <span class="el-z__name">${short(t.name)}</span>
                <span class="el-z__use">${escape(c.zUse[short(t.name)] ?? '')}</span>
              </button>
            </li>`,
          )
          .join('')}
      </ol>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${c.usage.title}</h2>
          <p class="doc-section__desc">${c.usage.desc}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${c.usage.do[0]}</p>
          <p class="usage-card__text">${c.usage.do[1]}</p>
          <pre class="ds-code ds-code--sm"><code>background: var(--ds-color-bg-surface);
border: 1px solid var(--ds-color-border-subtle);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <pre class="ds-code ds-code--sm"><code>.card { box-shadow: var(--ds-shadow-2xl); }</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
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
