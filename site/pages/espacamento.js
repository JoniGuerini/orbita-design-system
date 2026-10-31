import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/espacamento.css';

/* ───────── Dados ───────── */

const scale = tokens.filter((t) => t.name.startsWith('space.'));
const space = (step) => scale.find((t) => t.name === `space.${step}`);

const DENSITIES = [
  { value: 'compact', label: 'Compacto', icon: 'minus', tokens: { pad: '200', gap: '100', stack: '075', group: '200' }, button: 'ds-btn--sm' },
  { value: 'comfortable', label: 'Confortável', icon: 'layout', tokens: { pad: '300', gap: '150', stack: '100', group: '300' }, button: '' },
  { value: 'spacious', label: 'Espaçoso', icon: 'plus', tokens: { pad: '400', gap: '200', stack: '150', group: '400' }, button: 'ds-btn--lg' },
];

const ROLES = [
  ['pad', 'Padding', 'Respiro interno do card'],
  ['gap', 'Gap', 'Entre itens lado a lado'],
  ['stack', 'Pilha', 'Entre linhas do mesmo grupo'],
  ['group', 'Entre grupos', 'Separa blocos diferentes'],
];

let density = 'comfortable';
let measuring = true;

const rem = (t) => (t.px === 0 ? '0' : `${String(t.px / 16).replace('.', ',')} rem`);
const label = (t) => t.name.replace('space.', 'space-');

/* ───────── Escala ───────── */

function scaleRows() {
  return scale
    .map(
      (t) => `<button type="button" class="sp-row" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar}), ${t.px} px">
        <span class="sp-row__name">${label(t)}</span>
        <span class="sp-row__value"><span class="sp-row__px">${t.px} px</span><span class="sp-row__rem">${rem(t)}</span></span>
        <span class="sp-row__track"><span class="sp-row__bar" style="width:var(${t.cssVar})" data-zero="${t.px === 0}"></span></span>
        <span class="sp-row__ratio">${t.px ? `${t.px / 4} × 4` : '—'}</span>
        <span class="sp-row__copy" aria-hidden="true">${icon('copy', { size: 16 })}</span>
      </button>`,
    )
    .join('');
}

/* ───────── Na prática ───────── */

const current = () => DENSITIES.find((d) => d.value === density);

function legendRows() {
  const d = current();
  return ROLES.map(([role, name, hint]) => {
    const t = space(d.tokens[role]);
    return `<div class="sp-legend__row">
      <span class="sp-legend__mark sp-legend__mark--${role}" aria-hidden="true"></span>
      <span class="sp-legend__text"><span class="sp-legend__name">${name}</span><span class="sp-legend__hint">${hint}</span></span>
      <span class="sp-legend__token"><span>${label(t)}</span><span class="sp-legend__px">${t.px} px</span></span>
    </div>`;
  }).join('');
}

function stageVars() {
  const d = current();
  return ROLES.map(([role]) => `--sp-${role}: var(${space(d.tokens[role]).cssVar})`).join(';');
}

function demoCard() {
  const d = current();
  return `<article class="sp-card">
    <header class="sp-card__head">
      <span class="ds-avatar sp-card__avatar">${icon('user', { size: 20 })}</span>
      <span class="sp-card__who"><span class="sp-card__title">Marina Duarte</span><span class="sp-card__meta">Editora · há 2 horas</span></span>
    </header>
    <div class="sp-card__body">
      <p class="sp-card__text">Revisei o roteiro de lançamento. Ajustei a abertura e deixei duas opções de chamada para você escolher.</p>
      <p class="sp-card__text sp-card__text--muted">3 comentários · 1 arquivo</p>
    </div>
    <footer class="sp-card__actions">
      <span class="ds-btn ds-btn--primary ${d.button}">Aprovar</span>
      <span class="ds-btn ds-btn--secondary ${d.button}">Comentar</span>
    </footer>
  </article>`;
}

/* ───────── Ritmo ───────── */

const RHYTHM_GROUPS = [
  ['Perfil', [72, 48]],
  ['Notificações', [64, 80, 40]],
  ['Privacidade', [56]],
];

function marker(step, kind) {
  const t = space(step);
  return `<div class="sp-marker sp-marker--${kind}" style="height:var(${t.cssVar})"><span class="sp-marker__label">${t.px}</span></div>`;
}

function rhythm(inside, between) {
  return RHYTHM_GROUPS.map(([title, lines], g) => {
    const items = [`<p class="sp-rhythm__title">${title}</p>`, ...lines.map((w) => `<span class="sp-rhythm__line" style="width:${w}%"></span>`)];
    const group = items.map((item, i) => (i ? marker(inside, 'inside') + item : item)).join('');
    return (g ? marker(between, 'between') : '') + `<div class="sp-rhythm__group">${group}</div>`;
  }).join('');
}

/* ───────── Página ───────── */

export default function renderEspacamento(page) {
  const base = space('050');
  const unit = space('100');
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Espaçamento</h1>
        <p class="doc-header__lead">Uma escala de 4 em 4 px que dá ritmo à interface. Espaço pequeno junta, espaço grande separa — sempre com um token.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">passos</dt><dd class="doc-stat__value">${scale.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">base</dt><dd class="doc-stat__value">${base.px} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">space-100</dt><dd class="doc-stat__value">${unit.px} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">unidade</dt><dd class="doc-stat__value">rem</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="escala">Escala</button>
      <button type="button" class="doc-nav__link" data-target="pratica">Na prática</button>
      <button type="button" class="doc-nav__link" data-target="ritmo">Ritmo</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="escala" aria-labelledby="escala-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="escala-title">Escala</h2>
          <p class="doc-section__desc">Cada passo é um múltiplo de 4 px, em rem — acompanha o zoom do navegador. Clique num passo para copiar a variável.</p>
        </div>
      </header>
      <div class="sp-scale">${scaleRows()}</div>
      <div class="sp-naming">
        <p class="sp-naming__text">${icon('hash', { size: 18 })}<span><strong>Por que 100 = 8 px?</strong> O nome é a fração de 8 px vezes 100. Assim cabem passos novos no meio (025, 075, 150…) sem renomear nada.</span></p>
        <pre class="ds-code ds-code--sm"><code>gap: var(--ds-space-150);      <span class="ds-code__comment">/* 12 px */</span>
padding: var(--ds-space-300);  <span class="ds-code__comment">/* 24 px */</span></code></pre>
      </div>
    </section>

    <section class="doc-section" id="pratica" aria-labelledby="pratica-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="pratica-title">Na prática</h2>
          <p class="doc-section__desc">Um componente usa poucos tokens, cada um com um papel. Troque a densidade para ver a escala trabalhando junta.</p>
        </div>
        <div class="sp-controls">
          <button type="button" class="ds-chip" data-menu="density"><span class="ds-chip__icon">${icon('sliders', { size: 16 })}</span><span data-label>Confortável</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
          <button type="button" class="ds-chip" data-measure aria-pressed="${measuring}">${icon('spacing', { size: 16 })}Medidas</button>
        </div>
      </header>
      <div class="sp-practice">
        <div class="sp-stage" data-stage data-measuring="${measuring}" style="${stageVars()}" inert>${demoCard()}</div>
        <div class="sp-legend">
          <p class="sp-legend__title">Tokens usados</p>
          <div data-legend>${legendRows()}</div>
        </div>
      </div>
    </section>

    <section class="doc-section" id="ritmo" aria-labelledby="ritmo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="ritmo-title">Ritmo</h2>
          <p class="doc-section__desc">Proximidade agrupa. Use espaço pequeno dentro de um grupo e um salto claro entre grupos — o olho entende a estrutura antes de ler.</p>
        </div>
      </header>
      <div class="sp-rhythm-compare">
        <figure class="sp-rhythm sp-rhythm--flat">
          <div class="sp-rhythm__stage" aria-hidden="true">${rhythm('200', '200')}</div>
          <figcaption class="sp-rhythm__caption"><span class="sp-rhythm__verdict">${icon('x-circle', { size: 18 })}Sem ritmo</span><span>Tudo a 16 px: os grupos se misturam.</span></figcaption>
        </figure>
        <figure class="sp-rhythm sp-rhythm--good">
          <div class="sp-rhythm__stage" aria-hidden="true">${rhythm('100', '500')}</div>
          <figcaption class="sp-rhythm__caption"><span class="sp-rhythm__verdict">${icon('check-circle', { size: 18 })}Com ritmo</span><span>8 px dentro do grupo, 40 px entre grupos.</span></figcaption>
        </figure>
      </div>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Poucas regras, aplicadas sempre.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: um token por papel</p>
          <p class="usage-card__text">Padding, gap e pilha vêm da escala. Mudar a densidade vira trocar três tokens.</p>
          <pre class="ds-code ds-code--sm"><code>padding: var(--ds-space-300);
gap: var(--ds-space-150);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: números mágicos</p>
          <p class="usage-card__text">Valores fora da escala parecem detalhe, mas somam desalinhamentos pela tela toda.</p>
          <pre class="ds-code ds-code--sm"><code>margin-top: 13px;
padding: 10px 18px;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Dica: dobre para separar</p>
          <p class="usage-card__text">Se dois blocos precisam parecer separados, o espaço entre eles deve ser pelo menos o dobro do espaço interno.</p>
          <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">/* dentro */</span> var(--ds-space-100)
<span class="ds-code__comment">/* entre  */</span> var(--ds-space-300)</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const stage = root.querySelector('[data-stage]');
  const legend = root.querySelector('[data-legend]');
  const measure = root.querySelector('[data-measure]');

  const applyDensity = () => {
    stage.setAttribute('style', stageVars());
    stage.innerHTML = demoCard();
    legend.innerHTML = legendRows();
  };

  const onClick = (event) => {
    const copy = event.target.closest('[data-copy]');
    if (copy) return copyText(copy.dataset.copy);
    if (event.target.closest('[data-measure]')) {
      measuring = !measuring;
      measure.setAttribute('aria-pressed', String(measuring));
      stage.dataset.measuring = String(measuring);
    }
  };
  root.addEventListener('click', onClick);

  const densityChip = root.querySelector('[data-menu="density"]');
  const setLabel = () => (densityChip.querySelector('[data-label]').textContent = current().label);
  setLabel();
  const densityMenu = attachMenu(densityChip, {
    label: 'Densidade',
    value: density,
    options: DENSITIES.map(({ value, label: text, icon: ic }) => ({ value, label: text, icon: ic })),
    onChange: (value) => {
      density = value;
      setLabel();
      applyDensity();
    },
  });

  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    densityMenu.destroy();
    unmountNav();
  };
}
