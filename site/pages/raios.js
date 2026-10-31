import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { tr } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T } from '../i18n.js';

export const styles = 'site/pages/raios.css';

/* ───────── Textos ───────── */

const COPY = T(
  {
    lead: 'Cantos generosos dão o tom calmo do Órbita. Uma escala curta — do detalhe à pílula — e uma regra simples para cantos dentro de cantos.',
    stats: (small, large) => ['tokens de raio', `px, do ${small} ao ${large}`, 'px no botão', 'para pílulas'],
    onThisPage: 'Nesta página',
    nav: ['Escala', 'Raios aninhados', 'Onde usar', 'Uso'],
    pill: 'pílula',
    copyVar: (v) => `Copiar var(${v})`,
    // onde cada raio aparece nos componentes (conferido em ds/components/*.css)
    uses: {
      none: 'Reservado para mídia que encosta na borda.',
      xs: 'Kbd, código inline, foco da ação inline.',
      sm: 'Botão pequeno, botão de ícone.',
      md: 'Botão, campo, toast, item do ⌘K.',
      lg: 'Menu, bloco de código, cartão da conta.',
      xl: 'Card; painel no celular.',
      '2xl': 'Painel, ⌘K, sidebar e área principal.',
      '3xl': 'Livre para superfícies muito grandes.',
      full: 'Chip, badge, controle segmentado, avatar.',
    },
    scale: { title: 'Escala', desc: 'Nove passos. Quanto maior a superfície, maior o raio. Clique num raio para copiar a variável.' },
    nested: {
      title: 'Raios aninhados',
      desc: 'Quando uma superfície arredondada fica dentro de outra, o raio de dentro é o de fora menos o espaçamento. Assim as curvas ficam paralelas.',
      outer: 'Raio externo',
      pad: 'Espaçamento',
      ok: 'Certo — curvas paralelas',
      bad: 'Errado — mesmo raio dentro e fora',
    },
    where: { title: 'Onde usar', desc: 'Cada componente já vem com o raio certo. Os exemplos abaixo são os componentes reais.', head: ['Raio', 'Componentes', 'Exemplo'] },
    examples: { ready: 'Pronto', small: 'Pequeno', save: 'Salvar', search: 'Buscar', dark: 'Escuro', light: 'Claro', panel: 'Painel', surface: 'Superfície principal' },
    usage: {
      title: 'Uso',
      desc: 'O raio também é hierarquia: cantos menores para o que é pequeno, maiores para o que contém.',
      do: ['Faça: use a escala', 'Raio por token mantém tudo coerente — e muda junto se a escala mudar.'],
      dont: ['Evite: raio solto ou repetido', 'Valor fixo foge da escala; o mesmo raio dentro e fora deixa a curva interna “gorda”.', 'card xl com filho também xl'],
      tip: ['Pílula só no que é compacto', 'Chips, badges, avatares e o seletor de tema. Botões e campos ficam com md.'],
    },
  },
  {
    lead: 'Generous corners set Órbita’s calm tone. A short scale — from detail to pill — and one simple rule for corners inside corners.',
    stats: (small, large) => ['radius tokens', `px, from ${small} to ${large}`, 'px on the button', 'for pills'],
    onThisPage: 'On this page',
    nav: ['Scale', 'Nested radii', 'Where to use', 'Usage'],
    pill: 'pill',
    copyVar: (v) => `Copy var(${v})`,
    uses: {
      none: 'Reserved for media that touches the edge.',
      xs: 'Kbd, inline code, inline action focus.',
      sm: 'Small button, icon button.',
      md: 'Button, field, toast, ⌘K item.',
      lg: 'Menu, code block, account card.',
      xl: 'Card; panel on mobile.',
      '2xl': 'Panel, ⌘K, sidebar, and main area.',
      '3xl': 'Free for very large surfaces.',
      full: 'Chip, badge, segmented control, avatar.',
    },
    scale: { title: 'Scale', desc: 'Nine steps. The bigger the surface, the bigger the radius. Click a radius to copy the variable.' },
    nested: {
      title: 'Nested radii',
      desc: 'When a rounded surface sits inside another, the inner radius is the outer one minus the padding. That keeps the curves parallel.',
      outer: 'Outer radius',
      pad: 'Padding',
      ok: 'Right — parallel curves',
      bad: 'Wrong — same radius inside and out',
    },
    where: { title: 'Where to use', desc: 'Each component already comes with the right radius. The examples below are the real components.', head: ['Radius', 'Components', 'Example'] },
    examples: { ready: 'Done', small: 'Small', save: 'Save', search: 'Search', dark: 'Dark', light: 'Light', panel: 'Panel', surface: 'Main surface' },
    usage: {
      title: 'Usage',
      desc: 'Radius is hierarchy too: smaller corners for small things, larger ones for what contains them.',
      do: ['Do: use the scale', 'A token-based radius keeps everything coherent — and changes with the scale.'],
      dont: ['Avoid: loose or repeated radii', 'A fixed value escapes the scale; the same radius inside and out makes the inner curve look “fat”.', 'xl card with an xl child'],
      tip: ['Pills only for compact things', 'Chips, badges, avatars, and the theme picker. Buttons and fields stay at md.'],
    },
  },
  {
    lead: 'Las esquinas generosas dan el tono tranquilo de Órbita. Una escala corta — del detalle a la píldora — y una regla simple para esquinas dentro de esquinas.',
    stats: (small, large) => ['tokens de radio', `px, de ${small} a ${large}`, 'px en el botón', 'para píldoras'],
    onThisPage: 'En esta página',
    nav: ['Escala', 'Radios anidados', 'Dónde usar', 'Uso'],
    pill: 'píldora',
    copyVar: (v) => `Copiar var(${v})`,
    uses: {
      none: 'Reservado para medios que tocan el borde.',
      xs: 'Kbd, código en línea, foco de la acción en línea.',
      sm: 'Botón pequeño, botón de ícono.',
      md: 'Botón, campo, toast, elemento del ⌘K.',
      lg: 'Menú, bloque de código, tarjeta de la cuenta.',
      xl: 'Tarjeta; panel en el móvil.',
      '2xl': 'Panel, ⌘K, sidebar y área principal.',
      '3xl': 'Libre para superficies muy grandes.',
      full: 'Chip, insignia, control segmentado, avatar.',
    },
    scale: { title: 'Escala', desc: 'Nueve pasos. Cuanto más grande la superficie, mayor el radio. Haz clic en un radio para copiar la variable.' },
    nested: {
      title: 'Radios anidados',
      desc: 'Cuando una superficie redondeada queda dentro de otra, el radio interno es el externo menos el espaciado. Así las curvas quedan paralelas.',
      outer: 'Radio externo',
      pad: 'Espaciado',
      ok: 'Bien — curvas paralelas',
      bad: 'Mal — el mismo radio dentro y fuera',
    },
    where: { title: 'Dónde usar', desc: 'Cada componente ya viene con el radio correcto. Los ejemplos de abajo son los componentes reales.', head: ['Radio', 'Componentes', 'Ejemplo'] },
    examples: { ready: 'Listo', small: 'Pequeño', save: 'Guardar', search: 'Buscar', dark: 'Oscuro', light: 'Claro', panel: 'Panel', surface: 'Superficie principal' },
    usage: {
      title: 'Uso',
      desc: 'El radio también es jerarquía: esquinas más pequeñas para lo pequeño, más grandes para lo que contiene.',
      do: ['Haz: usa la escala', 'El radio por token mantiene todo coherente — y cambia junto si cambia la escala.'],
      dont: ['Evita: radio suelto o repetido', 'Un valor fijo se sale de la escala; el mismo radio dentro y fuera deja la curva interna “gorda”.', 'tarjeta xl con hijo también xl'],
      tip: ['Píldora solo en lo compacto', 'Chips, insignias, avatares y el selector de tema. Botones y campos quedan en md.'],
    },
  },
);

/* ───────── Dados ───────── */

const radii = tokens.filter((t) => t.name.startsWith('radius.'));
const byKey = new Map(radii.map((t) => [t.name.slice('radius.'.length), t]));
const key = (t) => t.name.slice('radius.'.length);
const finite = radii.filter((t) => t.px > 0 && t.px < 1000);

const OUTER = ['lg', 'xl', '2xl', '3xl'];
const PADDING = [
  ['050', 4],
  ['100', 8],
  ['150', 12],
  ['200', 16],
];

let outer = 'xl';
let pad = '100';

const px = (c, t) => (t.px >= 1000 ? c.pill : `${t.px} px`);

/** Token cujo valor é o raio interno (ou o mais próximo). */
function matchInner(value) {
  if (value <= 0) return { exact: true, token: byKey.get('none') };
  const sorted = [...finite].sort((a, b) => Math.abs(a.px - value) - Math.abs(b.px - value));
  return { exact: sorted[0].px === value, token: sorted[0] };
}

/* ───────── Seções ───────── */

function scaleTile(c, t) {
  return `<button type="button" class="rd-tile" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar)}">
    <span class="rd-tile__stage" aria-hidden="true"><span class="rd-tile__shape" style="border-radius:var(${t.cssVar})"></span></span>
    <span class="rd-tile__name">${key(t)}<span class="rd-tile__px">${px(c, t)}</span></span>
    <span class="rd-tile__use">${c.uses[key(t)] ?? ''}</span>
    <span class="rd-tile__var">${t.cssVar}${icon('copy', { size: 14 })}</span>
  </button>`;
}

const chipGroup = (name, label, options, current) =>
  `<div class="rd-control" role="group" aria-label="${label}">
    <span class="rd-control__label">${label}</span>
    <div class="rd-control__chips">
      ${options.map(([value, text]) => `<button type="button" class="ds-chip ds-chip--sm" data-${name}="${value}" aria-pressed="${value === current}">${text}</button>`).join('')}
    </div>
  </div>`;

const usageRows = ({ examples: e }) => [
  ['full', `<span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>Chip</span>
    <span class="ds-badge ds-badge--sm ds-badge--success">${e.ready}</span>
    <span class="ds-avatar rd-avatar">${icon('user', { size: 16 })}</span>`],
  ['xs', `<kbd class="ds-kbd">⌘</kbd><kbd class="ds-kbd">K</kbd><code class="ds-inline-code">var(--ds-radius-xs)</code>`],
  ['sm', `<span class="ds-btn ds-btn--secondary ds-btn--sm">${e.small}</span><span class="ds-icon-btn ds-icon-btn--outline">${icon('more-horizontal')}</span>`],
  ['md', `<span class="ds-btn ds-btn--primary">${icon('check', { size: 18 })}${e.save}</span>
    <span class="ds-field rd-field">${icon('search', { size: 18 })}<span class="ds-field__placeholder">${e.search}</span></span>`],
  ['lg', `<span class="rd-menu"><span class="ds-menu__item" aria-checked="true">${icon('moon', { size: 18 })}<span>${e.dark}</span>${icon('check', { size: 16, className: 'ds-menu__check' })}</span><span class="ds-menu__item">${icon('sun', { size: 18 })}<span>${e.light}</span></span></span>`],
  ['xl', `<span class="rd-card"><span class="rd-card__title">Card</span><span class="rd-card__line"></span><span class="rd-card__line rd-card__line--short"></span></span>`],
  ['2xl', `<span class="rd-panel"><span class="ds-panel__eyebrow">${e.panel}</span><span class="rd-panel__title">${e.surface}</span></span>`],
];

/* ───────── Página ───────── */

const NAV_IDS = ['escala', 'aninhados', 'onde-usar', 'uso'];

export default function renderRaios(page) {
  const c = tr(COPY);
  const small = finite[0];
  const large = finite.at(-1);
  const stats = c.stats(key(small), key(large));
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[radii.length, `${small.px}–${large.px}`, byKey.get('md').px, 'full'].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="escala" aria-labelledby="escala-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="escala-title">${c.scale.title}</h2>
          <p class="doc-section__desc">${c.scale.desc}</p>
        </div>
      </header>
      <div class="rd-scale">${radii.map((t) => scaleTile(c, t)).join('')}</div>
    </section>

    <section class="doc-section" id="aninhados" aria-labelledby="aninhados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="aninhados-title">${c.nested.title}</h2>
          <p class="doc-section__desc">${c.nested.desc}</p>
        </div>
      </header>
      <div class="rd-nested" data-nested>
        <div class="rd-nested__controls">
          ${chipGroup('outer', c.nested.outer, OUTER.map((k) => [k, `${k} · ${byKey.get(k).px}`]), outer)}
          ${chipGroup('pad', c.nested.pad, PADDING.map(([k, v]) => [k, `${v} px`]), pad)}
          <p class="rd-math" data-math aria-live="polite"></p>
        </div>
        <div class="rd-nested__cases">
          <figure class="rd-case">
            <div class="rd-case__outer"><div class="rd-case__inner rd-case__inner--ok"></div></div>
            <figcaption class="rd-case__caption">${icon('check-circle', { size: 18 })}<span>${c.nested.ok}</span></figcaption>
          </figure>
          <figure class="rd-case">
            <div class="rd-case__outer"><div class="rd-case__inner rd-case__inner--bad"></div></div>
            <figcaption class="rd-case__caption rd-case__caption--bad">${icon('x-circle', { size: 18 })}<span>${c.nested.bad}</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="doc-section" id="onde-usar" aria-labelledby="onde-usar-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="onde-usar-title">${c.where.title}</h2>
          <p class="doc-section__desc">${c.where.desc}</p>
        </div>
      </header>
      <div class="doc-table rd-usage">
        <div class="doc-table__head" aria-hidden="true">${c.where.head.map((h) => `<span>${h}</span>`).join('')}</div>
        ${usageRows(c).map(([k, preview]) => {
          const t = byKey.get(k);
          return `<div class="doc-table__row">
            <div class="rd-usage__token"><span class="rd-usage__swatch" style="border-radius:var(${t.cssVar})" aria-hidden="true"></span><span><span class="rd-usage__name">${k}</span><span class="rd-usage__px">${px(c, t)}</span></span></div>
            <p class="rd-usage__uses">${c.uses[k]}</p>
            <div class="rd-usage__preview" inert aria-hidden="true">${preview}</div>
          </div>`;
        }).join('')}
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
          <pre class="ds-code ds-code--sm"><code>border-radius: var(--ds-radius-md);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <pre class="ds-code ds-code--sm"><code>border-radius: 14px;
<span class="ds-code__comment">/* ${c.usage.dont[2]} */</span></code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
          <pre class="ds-code ds-code--sm"><code>.ds-chip  <span class="ds-code__comment">/* full */</span>
.ds-btn   <span class="ds-code__comment">/* md */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const nested = root.querySelector('[data-nested]');
  const math = root.querySelector('[data-math]');

  const update = () => {
    const o = byKey.get(outer).px;
    const p = PADDING.find(([k]) => k === pad)[1];
    const inner = Math.max(o - p, 0);
    const { exact, token } = matchInner(inner);
    nested.style.setProperty('--rd-outer', `${o}px`);
    nested.style.setProperty('--rd-pad', `${p}px`);
    nested.style.setProperty('--rd-inner', `${inner}px`);
    math.innerHTML = `<span class="rd-math__term">${o}</span><span class="rd-math__op">−</span><span class="rd-math__term">${p}</span><span class="rd-math__op">=</span><strong class="rd-math__result">${inner} px</strong>
      <span class="rd-math__token">${exact ? '' : '≈ '}<code class="ds-inline-code">radius.${key(token)}</code></span>`;
    root.querySelectorAll('[data-outer]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.outer === outer)));
    root.querySelectorAll('[data-pad]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.pad === pad)));
  };

  const onClick = (event) => {
    const o = event.target.closest('[data-outer]');
    const p = event.target.closest('[data-pad]');
    const copy = event.target.closest('[data-copy]');
    if (o) {
      outer = o.dataset.outer;
      update();
    } else if (p) {
      pad = p.dataset.pad;
      update();
    } else if (copy) {
      copyText(copy.dataset.copy);
    }
  };

  root.addEventListener('click', onClick);
  update();
  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    unmountNav();
  };
}
