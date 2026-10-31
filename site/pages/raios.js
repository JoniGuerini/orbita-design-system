import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/raios.css';

/* ───────── Dados ───────── */

const radii = tokens.filter((t) => t.name.startsWith('radius.'));
const byKey = new Map(radii.map((t) => [t.name.slice('radius.'.length), t]));
const key = (t) => t.name.slice('radius.'.length);
const finite = radii.filter((t) => t.px > 0 && t.px < 1000);

// onde cada raio aparece nos componentes (conferido em ds/components/*.css)
const USES = {
  none: 'Reservado para mídia que encosta na borda.',
  xs: 'Kbd, código inline, foco da ação inline.',
  sm: 'Botão pequeno, botão de ícone.',
  md: 'Botão, campo, toast, item do ⌘K.',
  lg: 'Menu, bloco de código, cartão da conta.',
  xl: 'Card; painel no celular.',
  '2xl': 'Painel, ⌘K, sidebar e área principal.',
  '3xl': 'Livre para superfícies muito grandes.',
  full: 'Chip, badge, controle segmentado, avatar.',
};

const OUTER = ['lg', 'xl', '2xl', '3xl'];
const PADDING = [
  ['050', 4],
  ['100', 8],
  ['150', 12],
  ['200', 16],
];

let outer = 'xl';
let pad = '100';

const px = (t) => (t.px >= 1000 ? 'pílula' : `${t.px} px`);

/** Token cujo valor é o raio interno (ou o mais próximo). */
function matchInner(value) {
  if (value <= 0) return { exact: true, token: byKey.get('none') };
  const sorted = [...finite].sort((a, b) => Math.abs(a.px - value) - Math.abs(b.px - value));
  return { exact: sorted[0].px === value, token: sorted[0] };
}

/* ───────── Seções ───────── */

function scaleTile(t) {
  return `<button type="button" class="rd-tile" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})">
    <span class="rd-tile__stage" aria-hidden="true"><span class="rd-tile__shape" style="border-radius:var(${t.cssVar})"></span></span>
    <span class="rd-tile__name">${key(t)}<span class="rd-tile__px">${px(t)}</span></span>
    <span class="rd-tile__use">${USES[key(t)] ?? ''}</span>
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

const USAGE_ROWS = [
  ['full', `<span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>Chip</span>
    <span class="ds-badge ds-badge--sm ds-badge--success">Pronto</span>
    <span class="ds-avatar rd-avatar">${icon('user', { size: 16 })}</span>`],
  ['xs', `<kbd class="ds-kbd">⌘</kbd><kbd class="ds-kbd">K</kbd><code class="ds-inline-code">var(--ds-radius-xs)</code>`],
  ['sm', `<span class="ds-btn ds-btn--secondary ds-btn--sm">Pequeno</span><span class="ds-icon-btn ds-icon-btn--outline">${icon('more-horizontal')}</span>`],
  ['md', `<span class="ds-btn ds-btn--primary">${icon('check', { size: 18 })}Salvar</span>
    <span class="ds-field rd-field">${icon('search', { size: 18 })}<span class="ds-field__placeholder">Buscar</span></span>`],
  ['lg', `<span class="rd-menu"><span class="ds-menu__item" aria-checked="true">${icon('moon', { size: 18 })}<span>Escuro</span>${icon('check', { size: 16, className: 'ds-menu__check' })}</span><span class="ds-menu__item">${icon('sun', { size: 18 })}<span>Claro</span></span></span>`],
  ['xl', `<span class="rd-card"><span class="rd-card__title">Card</span><span class="rd-card__line"></span><span class="rd-card__line rd-card__line--short"></span></span>`],
  ['2xl', `<span class="rd-panel"><span class="ds-panel__eyebrow">Painel</span><span class="rd-panel__title">Superfície principal</span></span>`],
];

/* ───────── Página ───────── */

export default function renderRaios(page) {
  const small = finite[0];
  const large = finite.at(-1);
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Raios</h1>
        <p class="doc-header__lead">Cantos generosos dão o tom calmo do Órbita. Uma escala curta — do detalhe à pílula — e uma regra simples para cantos dentro de cantos.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tokens de raio</dt><dd class="doc-stat__value">${radii.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">px, do ${key(small)} ao ${key(large)}</dt><dd class="doc-stat__value">${small.px}–${large.px}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">px no botão</dt><dd class="doc-stat__value">${byKey.get('md').px}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">para pílulas</dt><dd class="doc-stat__value">full</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="escala">Escala</button>
      <button type="button" class="doc-nav__link" data-target="aninhados">Raios aninhados</button>
      <button type="button" class="doc-nav__link" data-target="onde-usar">Onde usar</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="escala" aria-labelledby="escala-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="escala-title">Escala</h2>
          <p class="doc-section__desc">Nove passos. Quanto maior a superfície, maior o raio. Clique num raio para copiar a variável.</p>
        </div>
      </header>
      <div class="rd-scale">${radii.map(scaleTile).join('')}</div>
    </section>

    <section class="doc-section" id="aninhados" aria-labelledby="aninhados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="aninhados-title">Raios aninhados</h2>
          <p class="doc-section__desc">Quando uma superfície arredondada fica dentro de outra, o raio de dentro é o de fora menos o espaçamento. Assim as curvas ficam paralelas.</p>
        </div>
      </header>
      <div class="rd-nested" data-nested>
        <div class="rd-nested__controls">
          ${chipGroup('outer', 'Raio externo', OUTER.map((k) => [k, `${k} · ${byKey.get(k).px}`]), outer)}
          ${chipGroup('pad', 'Espaçamento', PADDING.map(([k, v]) => [k, `${v} px`]), pad)}
          <p class="rd-math" data-math aria-live="polite"></p>
        </div>
        <div class="rd-nested__cases">
          <figure class="rd-case">
            <div class="rd-case__outer"><div class="rd-case__inner rd-case__inner--ok"></div></div>
            <figcaption class="rd-case__caption">${icon('check-circle', { size: 18 })}<span>Certo — curvas paralelas</span></figcaption>
          </figure>
          <figure class="rd-case">
            <div class="rd-case__outer"><div class="rd-case__inner rd-case__inner--bad"></div></div>
            <figcaption class="rd-case__caption rd-case__caption--bad">${icon('x-circle', { size: 18 })}<span>Errado — mesmo raio dentro e fora</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="doc-section" id="onde-usar" aria-labelledby="onde-usar-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="onde-usar-title">Onde usar</h2>
          <p class="doc-section__desc">Cada componente já vem com o raio certo. Os exemplos abaixo são os componentes reais.</p>
        </div>
      </header>
      <div class="doc-table rd-usage">
        <div class="doc-table__head" aria-hidden="true"><span>Raio</span><span>Componentes</span><span>Exemplo</span></div>
        ${USAGE_ROWS.map(([k, preview]) => {
          const t = byKey.get(k);
          return `<div class="doc-table__row">
            <div class="rd-usage__token"><span class="rd-usage__swatch" style="border-radius:var(${t.cssVar})" aria-hidden="true"></span><span><span class="rd-usage__name">${k}</span><span class="rd-usage__px">${px(t)}</span></span></div>
            <p class="rd-usage__uses">${USES[k]}</p>
            <div class="rd-usage__preview" inert aria-hidden="true">${preview}</div>
          </div>`;
        }).join('')}
      </div>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">O raio também é hierarquia: cantos menores para o que é pequeno, maiores para o que contém.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: use a escala</p>
          <p class="usage-card__text">Raio por token mantém tudo coerente — e muda junto se a escala mudar.</p>
          <pre class="ds-code ds-code--sm"><code>border-radius: var(--ds-radius-md);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: raio solto ou repetido</p>
          <p class="usage-card__text">Valor fixo foge da escala; o mesmo raio dentro e fora deixa a curva interna “gorda”.</p>
          <pre class="ds-code ds-code--sm"><code>border-radius: 14px;
<span class="ds-code__comment">/* card xl com filho também xl */</span></code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Pílula só no que é compacto</p>
          <p class="usage-card__text">Chips, badges, avatares e o seletor de tema. Botões e campos ficam com md.</p>
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
    root.querySelectorAll('[data-outer]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.outer === outer)));
    root.querySelectorAll('[data-pad]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.pad === pad)));
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
