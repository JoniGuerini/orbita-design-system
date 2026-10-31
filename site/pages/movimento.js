import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { tr } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T } from '../i18n.js';

export const styles = 'site/pages/movimento.css';

/* ───────── Textos ───────── */

const COPY = T(
  {
    lead: 'Movimento explica o que mudou e de onde veio. Poucas durações, poucas curvas e sempre o mesmo par para o mesmo tipo de mudança.',
    stats: ['durações', 'curvas', 'receitas', 'movimento reduzido'],
    onThisPage: 'Nesta página',
    nav: ['Durações', 'Curvas', 'Receitas', 'Movimento reduzido', 'Uso'],
    copyVar: (v) => `Copiar var(${v})`,
    copyTooltip: 'Copiar variável',
    play: (n) => `Tocar ${n}`,
    playAll: 'Tocar todas',
    durationUse: {
      instant: 'Mudança sem transição — troca imediata de estado.',
      fast: 'Hover, foco e cor. A maior parte das interações.',
      base: 'Menus, tooltips, chevrons e popovers.',
      slow: 'Sidebar, gaveta, grupos do menu e entrada de página.',
      slower: 'Reservada para transições grandes e raras.',
    },
    easingUse: {
      standard: 'Padrão para quase tudo: sai rápido e assenta suave.',
      emphasized: 'Superfícies que se deslocam: menus, sidebar, gaveta.',
      decelerate: 'Entradas: o elemento chega e desacelera.',
      accelerate: 'Saídas: o elemento ganha velocidade ao sair.',
      linear: 'Progresso e loops contínuos, sem aceleração.',
    },
    recipes: [
      ['Hover, foco e cor', 'Botões, chips, itens de navegação, campos e ações inline.'],
      ['Menus e popovers', 'Menu dos chips, chevron que gira e a busca ⌘K. A opacidade usa fast + standard.'],
      ['Sidebar e gaveta', 'Recolher a sidebar (⌘B), a gaveta no celular e abrir os grupos do menu.'],
      ['Entrada de página', 'Toda troca de página do site: o conteúdo sobe 6 px e aparece.'],
    ],
    copyTransition: 'Copiar transição',
    stage: { button: 'Botão', inline: 'Ação inline', theme: 'Tema', dark: 'Escuro', light: 'Claro', system: 'Sistema', collapse: 'Recolher', expand: 'Expandir', eyebrow: 'Fundamentos', title: 'Movimento', replay: 'Repetir' },
    durations: { title: 'Durações', desc: 'Quanto maior a superfície e a distância percorrida, maior a duração. Toque uma por vez ou todas juntas para comparar — todas com a curva standard.', head: ['Token', 'Valor', 'Demonstração'] },
    curves: { title: 'Curvas', desc: (ms, name) => `A curva define o ritmo. Os gráficos usam os quatro números reais de cada token; as demonstrações rodam em ${ms} ms (duration.${name}) para dar tempo de perceber a diferença.` },
    recipesSection: { title: 'Receitas', desc: 'As combinações que os componentes usam de verdade. Cada demonstração abaixo roda com o mesmo CSS dos componentes.' },
    reduced: {
      title: 'Movimento reduzido',
      desc: 'Quem pede menos movimento no sistema operacional recebe a mesma interface, com as mudanças de estado instantâneas. Nada depende de animação para funcionar.',
      system: 'Preferência do seu sistema',
      simulate: 'Simular nesta página',
      on: 'Ligado',
      off: 'Desligado',
      text: 'Com a simulação ligada, todas as demonstrações desta página passam a trocar de estado sem animar. Também em movimento reduzido: o tema troca sem transição e a navegação da página rola sem suavização.',
      reducedOn: 'Movimento reduzido',
      reducedOff: 'Sem restrição',
    },
    usage: {
      title: 'Uso',
      desc: 'Movimento bom passa despercebido. Três regras para manter assim.',
      do: ['Faça: use os pares de tokens', 'Duração e curva sempre dos tokens, no par da receita certa. Prefira animar opacity e transform.'],
      dont: ['Evite: valores soltos', 'Números e curvas inventados na hora deixam cada componente com um ritmo diferente.'],
      tip: ['Interação frequente, movimento curto', 'O que acontece toda hora (hover, foco) fica em fast. Durações longas só para mudanças grandes e raras.'],
      tipCode: ['hover, foco, cor', 'painéis, gaveta  '],
    },
  },
  {
    lead: 'Motion explains what changed and where it came from. Few durations, few curves, and always the same pair for the same kind of change.',
    stats: ['durations', 'curves', 'recipes', 'reduced motion'],
    onThisPage: 'On this page',
    nav: ['Durations', 'Curves', 'Recipes', 'Reduced motion', 'Usage'],
    copyVar: (v) => `Copy var(${v})`,
    copyTooltip: 'Copy variable',
    play: (n) => `Play ${n}`,
    playAll: 'Play all',
    durationUse: {
      instant: 'Change with no transition — an immediate state swap.',
      fast: 'Hover, focus, and color. Most interactions.',
      base: 'Menus, tooltips, chevrons, and popovers.',
      slow: 'Sidebar, drawer, menu groups, and page entrance.',
      slower: 'Reserved for large, rare transitions.',
    },
    easingUse: {
      standard: 'The default for almost everything: leaves fast and settles softly.',
      emphasized: 'Surfaces that move: menus, sidebar, drawer.',
      decelerate: 'Entrances: the element arrives and slows down.',
      accelerate: 'Exits: the element speeds up as it leaves.',
      linear: 'Progress and continuous loops, with no acceleration.',
    },
    recipes: [
      ['Hover, focus, and color', 'Buttons, chips, navigation items, fields, and inline actions.'],
      ['Menus and popovers', 'Chip menus, the rotating chevron, and ⌘K search. Opacity uses fast + standard.'],
      ['Sidebar and drawer', 'Collapsing the sidebar (⌘B), the mobile drawer, and opening menu groups.'],
      ['Page entrance', 'Every page change on the site: the content rises 6 px and appears.'],
    ],
    copyTransition: 'Copy transition',
    stage: { button: 'Button', inline: 'Inline action', theme: 'Theme', dark: 'Dark', light: 'Light', system: 'System', collapse: 'Collapse', expand: 'Expand', eyebrow: 'Foundations', title: 'Motion', replay: 'Replay' },
    durations: { title: 'Durations', desc: 'The bigger the surface and the distance traveled, the longer the duration. Play one at a time or all together to compare — all with the standard curve.', head: ['Token', 'Value', 'Demo'] },
    curves: { title: 'Curves', desc: (ms, name) => `The curve sets the rhythm. The graphs use each token’s four real numbers; the demos run at ${ms} ms (duration.${name}) so there’s time to notice the difference.` },
    recipesSection: { title: 'Recipes', desc: 'The combinations the components actually use. Each demo below runs on the same CSS as the components.' },
    reduced: {
      title: 'Reduced motion',
      desc: 'People who ask the operating system for less motion get the same interface, with instant state changes. Nothing depends on animation to work.',
      system: 'Your system preference',
      simulate: 'Simulate on this page',
      on: 'On',
      off: 'Off',
      text: 'With the simulation on, every demo on this page changes state without animating. Also in reduced motion: the theme switches without a transition and in-page navigation scrolls without smoothing.',
      reducedOn: 'Reduced motion',
      reducedOff: 'No restriction',
    },
    usage: {
      title: 'Usage',
      desc: 'Good motion goes unnoticed. Three rules to keep it that way.',
      do: ['Do: use the token pairs', 'Duration and curve always from the tokens, in the right recipe’s pair. Prefer animating opacity and transform.'],
      dont: ['Avoid: loose values', 'Numbers and curves made up on the spot give each component a different rhythm.'],
      tip: ['Frequent interaction, short motion', 'What happens all the time (hover, focus) stays at fast. Long durations only for big, rare changes.'],
      tipCode: ['hover, focus, color', 'panels, drawer     '],
    },
  },
  {
    lead: 'El movimiento explica qué cambió y de dónde vino. Pocas duraciones, pocas curvas y siempre el mismo par para el mismo tipo de cambio.',
    stats: ['duraciones', 'curvas', 'recetas', 'movimiento reducido'],
    onThisPage: 'En esta página',
    nav: ['Duraciones', 'Curvas', 'Recetas', 'Movimiento reducido', 'Uso'],
    copyVar: (v) => `Copiar var(${v})`,
    copyTooltip: 'Copiar variable',
    play: (n) => `Reproducir ${n}`,
    playAll: 'Reproducir todas',
    durationUse: {
      instant: 'Cambio sin transición — cambio de estado inmediato.',
      fast: 'Hover, foco y color. La mayoría de las interacciones.',
      base: 'Menús, tooltips, chevrons y popovers.',
      slow: 'Sidebar, cajón, grupos del menú y entrada de página.',
      slower: 'Reservada para transiciones grandes y poco frecuentes.',
    },
    easingUse: {
      standard: 'La predeterminada para casi todo: sale rápido y se asienta suave.',
      emphasized: 'Superficies que se desplazan: menús, sidebar, cajón.',
      decelerate: 'Entradas: el elemento llega y desacelera.',
      accelerate: 'Salidas: el elemento gana velocidad al salir.',
      linear: 'Progreso y bucles continuos, sin aceleración.',
    },
    recipes: [
      ['Hover, foco y color', 'Botones, chips, elementos de navegación, campos y acciones en línea.'],
      ['Menús y popovers', 'El menú de los chips, el chevron que gira y la búsqueda ⌘K. La opacidad usa fast + standard.'],
      ['Sidebar y cajón', 'Contraer la sidebar (⌘B), el cajón en el móvil y abrir los grupos del menú.'],
      ['Entrada de página', 'Cada cambio de página del sitio: el contenido sube 6 px y aparece.'],
    ],
    copyTransition: 'Copiar transición',
    stage: { button: 'Botón', inline: 'Acción en línea', theme: 'Tema', dark: 'Oscuro', light: 'Claro', system: 'Sistema', collapse: 'Contraer', expand: 'Expandir', eyebrow: 'Fundamentos', title: 'Movimiento', replay: 'Repetir' },
    durations: { title: 'Duraciones', desc: 'Cuanto mayor la superficie y la distancia recorrida, mayor la duración. Reproduce una por vez o todas juntas para comparar — todas con la curva standard.', head: ['Token', 'Valor', 'Demostración'] },
    curves: { title: 'Curvas', desc: (ms, name) => `La curva define el ritmo. Los gráficos usan los cuatro números reales de cada token; las demostraciones corren a ${ms} ms (duration.${name}) para dar tiempo a notar la diferencia.` },
    recipesSection: { title: 'Recetas', desc: 'Las combinaciones que los componentes usan de verdad. Cada demostración de abajo corre con el mismo CSS de los componentes.' },
    reduced: {
      title: 'Movimiento reducido',
      desc: 'Quien pide menos movimiento en el sistema operativo recibe la misma interfaz, con los cambios de estado instantáneos. Nada depende de la animación para funcionar.',
      system: 'Preferencia de tu sistema',
      simulate: 'Simular en esta página',
      on: 'Activado',
      off: 'Desactivado',
      text: 'Con la simulación activada, todas las demostraciones de esta página cambian de estado sin animar. También con movimiento reducido: el tema cambia sin transición y la navegación de la página se desplaza sin suavizado.',
      reducedOn: 'Movimiento reducido',
      reducedOff: 'Sin restricción',
    },
    usage: {
      title: 'Uso',
      desc: 'El buen movimiento pasa desapercibido. Tres reglas para mantenerlo así.',
      do: ['Haz: usa los pares de tokens', 'Duración y curva siempre de los tokens, en el par de la receta correcta. Prefiere animar opacity y transform.'],
      dont: ['Evita: valores sueltos', 'Los números y curvas inventados en el momento dejan a cada componente con un ritmo distinto.'],
      tip: ['Interacción frecuente, movimiento corto', 'Lo que pasa todo el tiempo (hover, foco) queda en fast. Duraciones largas solo para cambios grandes y poco frecuentes.'],
      tipCode: ['hover, foco, color', 'paneles, cajón    '],
    },
  },
);

/* ───────── Dados (tokens reais) ───────── */

const durations = tokens.filter((t) => t.type === 'duration');
const easings = tokens.filter((t) => t.type === 'cubicBezier');
const byName = new Map(tokens.map((t) => [t.name, t]));

const ms = (t) => parseFloat(t.css);
const bezier = (t) => t.css.match(/-?[\d.]+/g).map(Number);
const short = (t) => t.name.split('.').pop();

// duração usada nas demos de curva: a mais longa da escala, para dar tempo de ver
const DEMO_DURATION = byName.get('duration.slower');

const RECIPES = [
  { id: 'hover', tokens: ['duration.fast', 'easing.standard'], code: 'transition: background-color var(--ds-duration-fast) var(--ds-easing-standard);' },
  { id: 'popover', tokens: ['duration.base', 'easing.emphasized'], code: 'transition:\n  opacity var(--ds-duration-fast) var(--ds-easing-standard),\n  transform var(--ds-duration-base) var(--ds-easing-emphasized);' },
  { id: 'sidebar', tokens: ['duration.slow', 'easing.emphasized'], code: 'transition: width var(--ds-duration-slow) var(--ds-easing-emphasized);' },
  { id: 'enter', tokens: ['duration.slow', 'easing.decelerate'], code: 'animation: page-enter var(--ds-duration-slow) var(--ds-easing-decelerate) both;' },
];

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ───────── Peças ───────── */

function curveSvg(t) {
  const [x1, y1, x2, y2] = bezier(t);
  const P = 10;
  const S = 80;
  const X = (v) => +(P + v * S).toFixed(2);
  const Y = (v) => +(P + (1 - v) * S).toFixed(2);
  return `<svg class="mo-curve" viewBox="0 0 100 100" aria-hidden="true">
    <path class="mo-curve__axis" d="M${P} ${P}V${P + S}H${P + S}"/>
    <path class="mo-curve__diag" d="M${X(0)} ${Y(0)}L${X(1)} ${Y(1)}"/>
    <path class="mo-curve__handle" d="M${X(0)} ${Y(0)}L${X(x1)} ${Y(y1)}M${X(1)} ${Y(1)}L${X(x2)} ${Y(y2)}"/>
    <path class="mo-curve__line" d="M${X(0)} ${Y(0)}C${X(x1)} ${Y(y1)} ${X(x2)} ${Y(y2)} ${X(1)} ${Y(1)}"/>
    <circle class="mo-curve__knob" cx="${X(x1)}" cy="${Y(y1)}" r="2.6"/>
    <circle class="mo-curve__knob" cx="${X(x2)}" cy="${Y(y2)}" r="2.6"/>
  </svg>`;
}

const track = (attrs) => `<div class="mo-track"><span class="mo-track__dot" ${attrs}></span></div>`;

function durationRow(c, t) {
  const name = short(t);
  return `<div class="doc-table__row">
    <button type="button" class="mo-token" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar)}" data-ds-tooltip="${c.copyTooltip}">
      <span class="mo-token__name">${name}</span>
      <span class="mo-token__var">${t.cssVar}</span>
      <span class="mo-token__desc">${c.durationUse[name] ?? ''}</span>
    </button>
    <span class="mo-value">${ms(t)} ms</span>
    ${track(`data-duration="${ms(t)}" data-easing="${escape(byName.get('easing.standard').css)}"`)}
    <button type="button" class="ds-icon-btn ds-icon-btn--outline" data-play-row aria-label="${c.play(name)}">${icon('play', { size: 16 })}</button>
  </div>`;
}

function easingCard(c, t) {
  const name = short(t);
  const [x1, y1, x2, y2] = bezier(t);
  return `<article class="mo-easing">
    <header class="mo-easing__head">
      <h3 class="mo-easing__name">${name}</h3>
      <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar)}" data-ds-tooltip="${c.copyTooltip}">${icon('copy', { size: 16 })}</button>
    </header>
    <p class="mo-easing__desc">${c.easingUse[name] ?? ''}</p>
    <div class="mo-easing__graph">${curveSvg(t)}</div>
    <div class="mo-easing__demo">
      ${track(`data-duration="${ms(DEMO_DURATION)}" data-easing="${escape(t.css)}"`)}
      <button type="button" class="ds-icon-btn ds-icon-btn--outline" data-play-row aria-label="${c.play(name)}">${icon('play', { size: 16 })}</button>
    </div>
    <button type="button" class="ds-inline-action mo-easing__code" data-copy="${escape(t.css)}">${icon('code', { size: 16 })}cubic-bezier(${[x1, y1, x2, y2].join(', ')})</button>
  </article>`;
}

function recipeStage({ stage: s }, id) {
  if (id === 'hover') {
    return `<div class="mo-stage mo-stage--row">
      <button type="button" class="ds-btn ds-btn--secondary">${s.button}</button>
      <button type="button" class="ds-chip">Chip<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      <a class="ds-inline-action" href="#/fundamentos/movimento" data-noop>${icon('file-text', { size: 16 })}${s.inline}</a>
    </div>`;
  }
  if (id === 'popover') {
    return `<div class="mo-stage mo-stage--top">
      <button type="button" class="ds-chip" data-toggle-pop aria-expanded="false">${s.theme}<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      <div class="mo-pop" role="presentation">
        <span class="mo-pop__item">${icon('moon', { size: 18 })}${s.dark}${icon('check', { size: 16, className: 'mo-pop__check' })}</span>
        <span class="mo-pop__item">${icon('sun', { size: 18 })}${s.light}</span>
        <span class="mo-pop__item">${icon('monitor', { size: 18 })}${s.system}</span>
      </div>
    </div>`;
  }
  if (id === 'sidebar') {
    return `<div class="mo-stage">
      <div class="mo-shell" data-collapsed="false">
        <div class="mo-shell__side"><i></i><i></i><i></i><i></i></div>
        <div class="mo-shell__main"><i></i><i></i></div>
      </div>
      <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm mo-stage__action" data-toggle-shell>${icon('panel-left', { size: 16 })}<span>${s.collapse}</span></button>
    </div>`;
  }
  return `<div class="mo-stage">
    <div class="mo-enter is-playing">
      <p class="ds-panel__eyebrow">${s.eyebrow}</p>
      <p class="mo-enter__title">${s.title}</p>
      <span class="mo-enter__line"></span><span class="mo-enter__line mo-enter__line--short"></span>
    </div>
    <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm mo-stage__action" data-replay-enter>${icon('refresh', { size: 16 })}${s.replay}</button>
  </div>`;
}

function recipeCard(c, r, i) {
  const label = r.tokens.map((n) => short(byName.get(n))).join(' + ');
  const [title, used] = c.recipes[i];
  return `<article class="mo-recipe" data-recipe="${r.id}">
    <header class="mo-recipe__head">
      <h3 class="mo-recipe__title">${title}</h3>
      <span class="ds-inline-code">${label}</span>
    </header>
    ${recipeStage(c, r.id)}
    <p class="mo-recipe__used">${used}</p>
    <pre class="ds-code ds-code--sm"><code>${escape(r.code)}</code></pre>
    <button type="button" class="ds-inline-action" data-copy="${escape(r.code)}">${icon('copy', { size: 16 })}${c.copyTransition}</button>
  </article>`;
}

/* ───────── Página ───────── */

const NAV_IDS = ['duracoes', 'curvas', 'receitas', 'reduzido', 'uso'];

export default function renderMovimento(page) {
  const c = tr(COPY);
  return `
  <div class="page doc mo-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[durations.length, easings.length, RECIPES.length, icon('check', { size: 24 })].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="duracoes" aria-labelledby="duracoes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="duracoes-title">${c.durations.title}</h2>
          <p class="doc-section__desc">${c.durations.desc}</p>
        </div>
        <button type="button" class="ds-btn ds-btn--secondary" data-play-all>${icon('play', { size: 16 })}${c.playAll}</button>
      </header>
      <div class="doc-table mo-durations">
        <div class="doc-table__head" aria-hidden="true">${c.durations.head.map((h) => `<span>${h}</span>`).join('')}<span></span></div>
        ${durations.map((t) => durationRow(c, t)).join('')}
      </div>
    </section>

    <section class="doc-section" id="curvas" aria-labelledby="curvas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="curvas-title">${c.curves.title}</h2>
          <p class="doc-section__desc">${c.curves.desc(ms(DEMO_DURATION), short(DEMO_DURATION))}</p>
        </div>
        <button type="button" class="ds-btn ds-btn--secondary" data-play-curves>${icon('play', { size: 16 })}${c.playAll}</button>
      </header>
      <div class="mo-easings">${easings.map((t) => easingCard(c, t)).join('')}</div>
    </section>

    <section class="doc-section" id="receitas" aria-labelledby="receitas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="receitas-title">${c.recipesSection.title}</h2>
          <p class="doc-section__desc">${c.recipesSection.desc}</p>
        </div>
      </header>
      <div class="mo-recipes">${RECIPES.map((r, i) => recipeCard(c, r, i)).join('')}</div>
    </section>

    <section class="doc-section" id="reduzido" aria-labelledby="reduzido-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="reduzido-title">${c.reduced.title}</h2>
          <p class="doc-section__desc">${c.reduced.desc}</p>
        </div>
      </header>
      <div class="mo-reduced">
        <div class="mo-reduced__status">
          <div class="mo-reduced__row">
            <span class="mo-reduced__label">${c.reduced.system}</span>
            <span class="ds-badge" data-system-pref>—</span>
          </div>
          <div class="mo-reduced__row">
            <span class="mo-reduced__label">${c.reduced.simulate}</span>
            <button type="button" class="ds-chip ds-chip--sm" data-simulate aria-pressed="false">${icon('motion', { size: 14 })}<span data-simulate-label>${c.reduced.off}</span></button>
          </div>
          <p class="mo-reduced__text">${c.reduced.text}</p>
        </div>
        <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">/* ds/base.css */</span>
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}</code></pre>
      </div>
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
          <pre class="ds-code ds-code--sm"><code>transition: transform
  var(--ds-duration-base)
  var(--ds-easing-emphasized);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <pre class="ds-code ds-code--sm"><code>transition: all 300ms ease-in-out;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
          <pre class="ds-code ds-code--sm"><code>fast  <span class="ds-code__comment">/* ${c.usage.tipCode[0]} */</span>
slow  <span class="ds-code__comment">/* ${c.usage.tipCode[1]} */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

/* ───────── Interações ───────── */

export function mount(root) {
  const c = tr(COPY);
  const page = root.querySelector('.mo-page');
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let simulated = false;
  const reduced = () => reducedQuery.matches || simulated;

  /** Move o ponto até a outra ponta da trilha usando a duração e a curva do token. */
  function play(dot, { forceForward = false } = {}) {
    const lane = dot.parentElement;
    const distance = Math.max(0, lane.clientWidth - dot.offsetWidth - 8);
    const atEnd = dot.dataset.at === 'end' && !forceForward;
    const from = forceForward ? 0 : atEnd ? distance : 0;
    const to = atEnd ? 0 : distance;
    dot.dataset.at = atEnd ? 'start' : 'end';
    dot.getAnimations().forEach((a) => a.cancel());
    dot.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], {
      duration: reduced() ? 0 : Number(dot.dataset.duration),
      easing: dot.dataset.easing,
      fill: 'forwards',
    });
  }

  const resetDots = () =>
    root.querySelectorAll('.mo-track__dot').forEach((dot) => {
      dot.getAnimations().forEach((a) => a.cancel());
      dot.dataset.at = 'start';
    });

  const playAll = (selector) =>
    root.querySelectorAll(selector).forEach((dot) => {
      dot.getAnimations().forEach((a) => a.cancel());
      play(dot, { forceForward: true });
    });

  const onClick = (event) => {
    const t = event.target;
    const copy = t.closest('[data-copy]');
    if (copy) return copyText(copy.dataset.copy);

    const rowPlay = t.closest('[data-play-row]');
    if (rowPlay) {
      const dot = rowPlay.parentElement.querySelector('.mo-track__dot');
      return dot && play(dot);
    }
    if (t.closest('[data-play-all]')) return playAll('.mo-durations .mo-track__dot');
    if (t.closest('[data-play-curves]')) return playAll('.mo-easings .mo-track__dot');

    const pop = t.closest('[data-toggle-pop]');
    if (pop) {
      const open = pop.getAttribute('aria-expanded') !== 'true';
      pop.setAttribute('aria-expanded', String(open));
      pop.parentElement.querySelector('.mo-pop').toggleAttribute('data-open', open);
      return;
    }

    const shellBtn = t.closest('[data-toggle-shell]');
    if (shellBtn) {
      const shell = shellBtn.parentElement.querySelector('.mo-shell');
      const collapsed = shell.dataset.collapsed !== 'true';
      shell.dataset.collapsed = String(collapsed);
      shellBtn.querySelector('span').textContent = collapsed ? c.stage.expand : c.stage.collapse;
      return;
    }

    if (t.closest('[data-replay-enter]')) {
      const card = root.querySelector('.mo-enter');
      card.classList.remove('is-playing');
      void card.offsetWidth; // reinicia a animação
      card.classList.add('is-playing');
      return;
    }

    if (t.closest('[data-noop]')) event.preventDefault();

    const sim = t.closest('[data-simulate]');
    if (sim) {
      simulated = !simulated;
      sim.setAttribute('aria-pressed', String(simulated));
      sim.querySelector('[data-simulate-label]').textContent = simulated ? c.reduced.on : c.reduced.off;
      page.classList.toggle('mo-page--reduced', simulated);
    }
  };
  root.addEventListener('click', onClick);

  const badge = root.querySelector('[data-system-pref]');
  const syncPref = () => {
    badge.textContent = reducedQuery.matches ? c.reduced.reducedOn : c.reduced.reducedOff;
    badge.classList.toggle('ds-badge--brand', reducedQuery.matches);
  };
  syncPref();
  reducedQuery.addEventListener('change', syncPref);

  // a distância das trilhas muda com a largura: volta tudo para o início
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resetDots, 120);
  };
  addEventListener('resize', onResize);

  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    reducedQuery.removeEventListener('change', syncPref);
    removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);
    root.querySelectorAll('.mo-track__dot').forEach((dot) => dot.getAnimations().forEach((a) => a.cancel()));
    unmountNav();
  };
}
