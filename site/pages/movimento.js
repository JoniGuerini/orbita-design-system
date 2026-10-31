import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/movimento.css';

/* ───────── Dados (tokens reais) ───────── */

const durations = tokens.filter((t) => t.type === 'duration');
const easings = tokens.filter((t) => t.type === 'cubicBezier');
const byName = new Map(tokens.map((t) => [t.name, t]));

const ms = (t) => parseFloat(t.css);
const bezier = (t) => t.css.match(/-?[\d.]+/g).map(Number);
const short = (t) => t.name.split('.').pop();

// duração usada nas demos de curva: a mais longa da escala, para dar tempo de ver
const DEMO_DURATION = byName.get('duration.slower');

const DURATION_USE = {
  instant: 'Mudança sem transição — troca imediata de estado.',
  fast: 'Hover, foco e cor. A maior parte das interações.',
  base: 'Menus, tooltips, chevrons e popovers.',
  slow: 'Sidebar, gaveta, grupos do menu e entrada de página.',
  slower: 'Reservada para transições grandes e raras.',
};

const EASING_USE = {
  standard: 'Padrão para quase tudo: sai rápido e assenta suave.',
  emphasized: 'Superfícies que se deslocam: menus, sidebar, gaveta.',
  decelerate: 'Entradas: o elemento chega e desacelera.',
  accelerate: 'Saídas: o elemento ganha velocidade ao sair.',
  linear: 'Progresso e loops contínuos, sem aceleração.',
};

const RECIPES = [
  {
    id: 'hover',
    title: 'Hover, foco e cor',
    tokens: ['duration.fast', 'easing.standard'],
    used: 'Botões, chips, itens de navegação, campos e ações inline.',
    code: 'transition: background-color var(--ds-duration-fast) var(--ds-easing-standard);',
    hint: 'Passe o mouse ou use Tab',
  },
  {
    id: 'popover',
    title: 'Menus e popovers',
    tokens: ['duration.base', 'easing.emphasized'],
    used: 'Menu dos chips, chevron que gira e a busca ⌘K. A opacidade usa fast + standard.',
    code: 'transition:\n  opacity var(--ds-duration-fast) var(--ds-easing-standard),\n  transform var(--ds-duration-base) var(--ds-easing-emphasized);',
    hint: 'Abra e feche',
  },
  {
    id: 'sidebar',
    title: 'Sidebar e gaveta',
    tokens: ['duration.slow', 'easing.emphasized'],
    used: 'Recolher a sidebar (⌘B), a gaveta no celular e abrir os grupos do menu.',
    code: 'transition: width var(--ds-duration-slow) var(--ds-easing-emphasized);',
    hint: 'Recolha e expanda',
  },
  {
    id: 'enter',
    title: 'Entrada de página',
    tokens: ['duration.slow', 'easing.decelerate'],
    used: 'Toda troca de página do site: o conteúdo sobe 6 px e aparece.',
    code: 'animation: page-enter var(--ds-duration-slow) var(--ds-easing-decelerate) both;',
    hint: 'Repita a entrada',
  },
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

function durationRow(t) {
  const name = short(t);
  return `<div class="doc-table__row">
    <button type="button" class="mo-token" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})" data-ds-tooltip="Copiar variável">
      <span class="mo-token__name">${name}</span>
      <span class="mo-token__var">${t.cssVar}</span>
      <span class="mo-token__desc">${DURATION_USE[name] ?? ''}</span>
    </button>
    <span class="mo-value">${ms(t)} ms</span>
    ${track(`data-duration="${ms(t)}" data-easing="${escape(byName.get('easing.standard').css)}"`)}
    <button type="button" class="ds-icon-btn ds-icon-btn--outline" data-play-row aria-label="Tocar ${name}">${icon('play', { size: 16 })}</button>
  </div>`;
}

function easingCard(t) {
  const name = short(t);
  const [x1, y1, x2, y2] = bezier(t);
  return `<article class="mo-easing">
    <header class="mo-easing__head">
      <h3 class="mo-easing__name">${name}</h3>
      <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})" data-ds-tooltip="Copiar variável">${icon('copy', { size: 16 })}</button>
    </header>
    <p class="mo-easing__desc">${EASING_USE[name] ?? ''}</p>
    <div class="mo-easing__graph">${curveSvg(t)}</div>
    <div class="mo-easing__demo">
      ${track(`data-duration="${ms(DEMO_DURATION)}" data-easing="${escape(t.css)}"`)}
      <button type="button" class="ds-icon-btn ds-icon-btn--outline" data-play-row aria-label="Tocar ${name}">${icon('play', { size: 16 })}</button>
    </div>
    <button type="button" class="ds-inline-action mo-easing__code" data-copy="${escape(t.css)}">${icon('code', { size: 16 })}cubic-bezier(${[x1, y1, x2, y2].join(', ')})</button>
  </article>`;
}

function recipeStage(id) {
  if (id === 'hover') {
    return `<div class="mo-stage mo-stage--row">
      <button type="button" class="ds-btn ds-btn--secondary">Botão</button>
      <button type="button" class="ds-chip">Chip<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      <a class="ds-inline-action" href="#/fundamentos/movimento" data-noop>${icon('file-text', { size: 16 })}Ação inline</a>
    </div>`;
  }
  if (id === 'popover') {
    return `<div class="mo-stage mo-stage--top">
      <button type="button" class="ds-chip" data-toggle-pop aria-expanded="false">Tema<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      <div class="mo-pop" role="presentation">
        <span class="mo-pop__item">${icon('moon', { size: 18 })}Escuro${icon('check', { size: 16, className: 'mo-pop__check' })}</span>
        <span class="mo-pop__item">${icon('sun', { size: 18 })}Claro</span>
        <span class="mo-pop__item">${icon('monitor', { size: 18 })}Sistema</span>
      </div>
    </div>`;
  }
  if (id === 'sidebar') {
    return `<div class="mo-stage">
      <div class="mo-shell" data-collapsed="false">
        <div class="mo-shell__side"><i></i><i></i><i></i><i></i></div>
        <div class="mo-shell__main"><i></i><i></i></div>
      </div>
      <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm mo-stage__action" data-toggle-shell>${icon('panel-left', { size: 16 })}<span>Recolher</span></button>
    </div>`;
  }
  return `<div class="mo-stage">
    <div class="mo-enter is-playing">
      <p class="ds-panel__eyebrow">Fundamentos</p>
      <p class="mo-enter__title">Movimento</p>
      <span class="mo-enter__line"></span><span class="mo-enter__line mo-enter__line--short"></span>
    </div>
    <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm mo-stage__action" data-replay-enter>${icon('refresh', { size: 16 })}Repetir</button>
  </div>`;
}

function recipeCard(r) {
  const label = r.tokens.map((n) => short(byName.get(n))).join(' + ');
  return `<article class="mo-recipe" data-recipe="${r.id}">
    <header class="mo-recipe__head">
      <h3 class="mo-recipe__title">${r.title}</h3>
      <span class="ds-inline-code">${label}</span>
    </header>
    ${recipeStage(r.id)}
    <p class="mo-recipe__used">${r.used}</p>
    <pre class="ds-code ds-code--sm"><code>${escape(r.code)}</code></pre>
    <button type="button" class="ds-inline-action" data-copy="${escape(r.code)}">${icon('copy', { size: 16 })}Copiar transição</button>
  </article>`;
}

/* ───────── Página ───────── */

export default function renderMovimento(page) {
  return `
  <div class="page doc mo-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Movimento</h1>
        <p class="doc-header__lead">Movimento explica o que mudou e de onde veio. Poucas durações, poucas curvas e sempre o mesmo par para o mesmo tipo de mudança.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">durações</dt><dd class="doc-stat__value">${durations.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">curvas</dt><dd class="doc-stat__value">${easings.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">receitas</dt><dd class="doc-stat__value">${RECIPES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">movimento reduzido</dt><dd class="doc-stat__value">${icon('check', { size: 24 })}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="duracoes">Durações</button>
      <button type="button" class="doc-nav__link" data-target="curvas">Curvas</button>
      <button type="button" class="doc-nav__link" data-target="receitas">Receitas</button>
      <button type="button" class="doc-nav__link" data-target="reduzido">Movimento reduzido</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="duracoes" aria-labelledby="duracoes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="duracoes-title">Durações</h2>
          <p class="doc-section__desc">Quanto maior a superfície e a distância percorrida, maior a duração. Toque uma por vez ou todas juntas para comparar — todas com a curva standard.</p>
        </div>
        <button type="button" class="ds-btn ds-btn--secondary" data-play-all>${icon('play', { size: 16 })}Tocar todas</button>
      </header>
      <div class="doc-table mo-durations">
        <div class="doc-table__head" aria-hidden="true"><span>Token</span><span>Valor</span><span>Demonstração</span><span></span></div>
        ${durations.map(durationRow).join('')}
      </div>
    </section>

    <section class="doc-section" id="curvas" aria-labelledby="curvas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="curvas-title">Curvas</h2>
          <p class="doc-section__desc">A curva define o ritmo. Os gráficos usam os quatro números reais de cada token; as demonstrações rodam em ${ms(DEMO_DURATION)} ms (duration.${short(DEMO_DURATION)}) para dar tempo de perceber a diferença.</p>
        </div>
        <button type="button" class="ds-btn ds-btn--secondary" data-play-curves>${icon('play', { size: 16 })}Tocar todas</button>
      </header>
      <div class="mo-easings">${easings.map(easingCard).join('')}</div>
    </section>

    <section class="doc-section" id="receitas" aria-labelledby="receitas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="receitas-title">Receitas</h2>
          <p class="doc-section__desc">As combinações que os componentes usam de verdade. Cada demonstração abaixo roda com o mesmo CSS dos componentes.</p>
        </div>
      </header>
      <div class="mo-recipes">${RECIPES.map(recipeCard).join('')}</div>
    </section>

    <section class="doc-section" id="reduzido" aria-labelledby="reduzido-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="reduzido-title">Movimento reduzido</h2>
          <p class="doc-section__desc">Quem pede menos movimento no sistema operacional recebe a mesma interface, com as mudanças de estado instantâneas. Nada depende de animação para funcionar.</p>
        </div>
      </header>
      <div class="mo-reduced">
        <div class="mo-reduced__status">
          <div class="mo-reduced__row">
            <span class="mo-reduced__label">Preferência do seu sistema</span>
            <span class="ds-badge" data-system-pref>—</span>
          </div>
          <div class="mo-reduced__row">
            <span class="mo-reduced__label">Simular nesta página</span>
            <button type="button" class="ds-chip ds-chip--sm" data-simulate aria-pressed="false">${icon('motion', { size: 14 })}<span data-simulate-label>Desligado</span></button>
          </div>
          <p class="mo-reduced__text">Com a simulação ligada, todas as demonstrações desta página passam a trocar de estado sem animar. Também em movimento reduzido: o tema troca sem transição e a navegação da página rola sem suavização.</p>
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
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Movimento bom passa despercebido. Três regras para manter assim.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: use os pares de tokens</p>
          <p class="usage-card__text">Duração e curva sempre dos tokens, no par da receita certa. Prefira animar opacity e transform.</p>
          <pre class="ds-code ds-code--sm"><code>transition: transform
  var(--ds-duration-base)
  var(--ds-easing-emphasized);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: valores soltos</p>
          <p class="usage-card__text">Números e curvas inventados na hora deixam cada componente com um ritmo diferente.</p>
          <pre class="ds-code ds-code--sm"><code>transition: all 300ms ease-in-out;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Interação frequente, movimento curto</p>
          <p class="usage-card__text">O que acontece toda hora (hover, foco) fica em fast. Durações longas só para mudanças grandes e raras.</p>
          <pre class="ds-code ds-code--sm"><code>fast  <span class="ds-code__comment">/* hover, foco, cor */</span>
slow  <span class="ds-code__comment">/* painéis, gaveta  */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

/* ───────── Interações ───────── */

export function mount(root) {
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
      shellBtn.querySelector('span').textContent = collapsed ? 'Expandir' : 'Recolher';
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
      sim.querySelector('[data-simulate-label]').textContent = simulated ? 'Ligado' : 'Desligado';
      page.classList.toggle('mo-page--reduced', simulated);
    }
  };
  root.addEventListener('click', onClick);

  const badge = root.querySelector('[data-system-pref]');
  const syncPref = () => {
    badge.textContent = reducedQuery.matches ? 'Movimento reduzido' : 'Sem restrição';
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
