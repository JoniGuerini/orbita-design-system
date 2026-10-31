import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { tr, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T } from '../i18n.js';

export const styles = 'site/pages/espacamento.css';

/* ───────── Textos ───────── */

const COPY = T(
  {
    lead: 'Uma escala de 4 em 4 px que dá ritmo à interface. Espaço pequeno junta, espaço grande separa — sempre com um token.',
    stats: ['passos', 'base', 'space-100', 'unidade'],
    onThisPage: 'Nesta página',
    nav: ['Escala', 'Na prática', 'Ritmo', 'Uso'],
    densities: ['Compacto', 'Confortável', 'Espaçoso'],
    density: 'Densidade',
    roles: [
      ['Padding', 'Respiro interno do card'],
      ['Gap', 'Entre itens lado a lado'],
      ['Pilha', 'Entre linhas do mesmo grupo'],
      ['Entre grupos', 'Separa blocos diferentes'],
    ],
    copyVar: (v, px) => `Copiar var(${v}), ${px} px`,
    scale: {
      title: 'Escala',
      desc: 'Cada passo é um múltiplo de 4 px, em rem — acompanha o zoom do navegador. Clique num passo para copiar a variável.',
      naming: '<strong>Por que 100 = 8 px?</strong> O nome é a fração de 8 px vezes 100. Assim cabem passos novos no meio (025, 075, 150…) sem renomear nada.',
    },
    practice: { title: 'Na prática', desc: 'Um componente usa poucos tokens, cada um com um papel. Troque a densidade para ver a escala trabalhando junta.', measures: 'Medidas', used: 'Tokens usados' },
    card: ['Marina Duarte', 'Editora · há 2 horas', 'Revisei o roteiro de lançamento. Ajustei a abertura e deixei duas opções de chamada para você escolher.', '3 comentários · 1 arquivo', 'Aprovar', 'Comentar'],
    rhythm: {
      title: 'Ritmo',
      desc: 'Proximidade agrupa. Use espaço pequeno dentro de um grupo e um salto claro entre grupos — o olho entende a estrutura antes de ler.',
      groups: ['Perfil', 'Notificações', 'Privacidade'],
      flat: ['Sem ritmo', 'Tudo a 16 px: os grupos se misturam.'],
      good: ['Com ritmo', '8 px dentro do grupo, 40 px entre grupos.'],
    },
    usage: {
      title: 'Uso',
      desc: 'Poucas regras, aplicadas sempre.',
      do: ['Faça: um token por papel', 'Padding, gap e pilha vêm da escala. Mudar a densidade vira trocar três tokens.'],
      dont: ['Evite: números mágicos', 'Valores fora da escala parecem detalhe, mas somam desalinhamentos pela tela toda.'],
      tip: ['Dica: dobre para separar', 'Se dois blocos precisam parecer separados, o espaço entre eles deve ser pelo menos o dobro do espaço interno.'],
      tipCode: ['dentro', 'entre '],
    },
  },
  {
    lead: 'A 4 px scale that gives the interface its rhythm. Small space groups, large space separates — always with a token.',
    stats: ['steps', 'base', 'space-100', 'unit'],
    onThisPage: 'On this page',
    nav: ['Scale', 'In practice', 'Rhythm', 'Usage'],
    densities: ['Compact', 'Comfortable', 'Spacious'],
    density: 'Density',
    roles: [
      ['Padding', 'The card’s inner breathing room'],
      ['Gap', 'Between items side by side'],
      ['Stack', 'Between lines in the same group'],
      ['Between groups', 'Separates different blocks'],
    ],
    copyVar: (v, px) => `Copy var(${v}), ${px} px`,
    scale: {
      title: 'Scale',
      desc: 'Each step is a multiple of 4 px, in rem — it follows the browser zoom. Click a step to copy the variable.',
      naming: '<strong>Why does 100 = 8 px?</strong> The name is the fraction of 8 px times 100. That leaves room for new steps in between (025, 075, 150…) without renaming anything.',
    },
    practice: { title: 'In practice', desc: 'A component uses few tokens, each with one role. Change the density to see the scale working together.', measures: 'Measures', used: 'Tokens used' },
    card: ['Marina Duarte', 'Editor · 2 hours ago', 'I reviewed the launch script. I tweaked the opening and left two call-to-action options for you to pick from.', '3 comments · 1 file', 'Approve', 'Comment'],
    rhythm: {
      title: 'Rhythm',
      desc: 'Proximity groups. Use small space inside a group and a clear jump between groups — the eye understands the structure before reading.',
      groups: ['Profile', 'Notifications', 'Privacy'],
      flat: ['No rhythm', 'Everything at 16 px: the groups blend together.'],
      good: ['With rhythm', '8 px inside the group, 40 px between groups.'],
    },
    usage: {
      title: 'Usage',
      desc: 'Few rules, always applied.',
      do: ['Do: one token per role', 'Padding, gap, and stack come from the scale. Changing density becomes swapping three tokens.'],
      dont: ['Avoid: magic numbers', 'Off-scale values look like a detail, but they add up to misalignments across the whole screen.'],
      tip: ['Tip: double it to separate', 'If two blocks need to feel separate, the space between them should be at least twice the inner space.'],
      tipCode: ['inside ', 'between'],
    },
  },
  {
    lead: 'Una escala de 4 en 4 px que da ritmo a la interfaz. El espacio pequeño agrupa, el grande separa — siempre con un token.',
    stats: ['pasos', 'base', 'space-100', 'unidad'],
    onThisPage: 'En esta página',
    nav: ['Escala', 'En la práctica', 'Ritmo', 'Uso'],
    densities: ['Compacto', 'Cómodo', 'Espacioso'],
    density: 'Densidad',
    roles: [
      ['Padding', 'Respiro interno de la tarjeta'],
      ['Gap', 'Entre elementos lado a lado'],
      ['Pila', 'Entre líneas del mismo grupo'],
      ['Entre grupos', 'Separa bloques distintos'],
    ],
    copyVar: (v, px) => `Copiar var(${v}), ${px} px`,
    scale: {
      title: 'Escala',
      desc: 'Cada paso es un múltiplo de 4 px, en rem — acompaña el zoom del navegador. Haz clic en un paso para copiar la variable.',
      naming: '<strong>¿Por qué 100 = 8 px?</strong> El nombre es la fracción de 8 px por 100. Así caben pasos nuevos en el medio (025, 075, 150…) sin renombrar nada.',
    },
    practice: { title: 'En la práctica', desc: 'Un componente usa pocos tokens, cada uno con un papel. Cambia la densidad para ver la escala trabajando en conjunto.', measures: 'Medidas', used: 'Tokens usados' },
    card: ['Marina Duarte', 'Editora · hace 2 horas', 'Revisé el guion del lanzamiento. Ajusté la apertura y dejé dos opciones de llamado para que elijas.', '3 comentarios · 1 archivo', 'Aprobar', 'Comentar'],
    rhythm: {
      title: 'Ritmo',
      desc: 'La proximidad agrupa. Usa espacio pequeño dentro de un grupo y un salto claro entre grupos — el ojo entiende la estructura antes de leer.',
      groups: ['Perfil', 'Notificaciones', 'Privacidad'],
      flat: ['Sin ritmo', 'Todo a 16 px: los grupos se mezclan.'],
      good: ['Con ritmo', '8 px dentro del grupo, 40 px entre grupos.'],
    },
    usage: {
      title: 'Uso',
      desc: 'Pocas reglas, aplicadas siempre.',
      do: ['Haz: un token por papel', 'Padding, gap y pila vienen de la escala. Cambiar la densidad se vuelve cambiar tres tokens.'],
      dont: ['Evita: números mágicos', 'Los valores fuera de la escala parecen un detalle, pero suman desalineaciones por toda la pantalla.'],
      tip: ['Consejo: duplica para separar', 'Si dos bloques deben parecer separados, el espacio entre ellos debe ser al menos el doble del espacio interno.'],
      tipCode: ['dentro', 'entre '],
    },
  },
);

/* ───────── Dados ───────── */

const scale = tokens.filter((t) => t.name.startsWith('space.'));
const space = (step) => scale.find((t) => t.name === `space.${step}`);

const DENSITIES = [
  { value: 'compact', icon: 'minus', tokens: { pad: '200', gap: '100', stack: '075', group: '200' }, button: 'ds-btn--sm' },
  { value: 'comfortable', icon: 'layout', tokens: { pad: '300', gap: '150', stack: '100', group: '300' }, button: '' },
  { value: 'spacious', icon: 'plus', tokens: { pad: '400', gap: '200', stack: '150', group: '400' }, button: 'ds-btn--lg' },
];

const ROLE_IDS = ['pad', 'gap', 'stack', 'group'];

let density = 'comfortable';
let measuring = true;

const rem = (t) => (t.px === 0 ? '0' : `${formatNumber(t.px / 16)} rem`);
const label = (t) => t.name.replace('space.', 'space-');

/* ───────── Escala ───────── */

function scaleRows(c) {
  return scale
    .map(
      (t) => `<button type="button" class="sp-row" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar, t.px)}">
        <span class="sp-row__name">${label(t)}</span>
        <span class="sp-row__value"><span class="sp-row__px">${t.px} px</span><span class="sp-row__rem">${rem(t)}</span></span>
        <span class="sp-row__track"><span class="sp-row__bar" style="width:var(${t.cssVar})" data-zero="${t.px === 0}"></span></span>
        <span class="sp-row__ratio">${t.px ? `${formatNumber(t.px / 4)} × 4` : '—'}</span>
        <span class="sp-row__copy" aria-hidden="true">${icon('copy', { size: 16 })}</span>
      </button>`,
    )
    .join('');
}

/* ───────── Na prática ───────── */

const current = () => DENSITIES.find((d) => d.value === density);
const densityLabel = (c) => c.densities[DENSITIES.indexOf(current())];

function legendRows(c) {
  const d = current();
  return ROLE_IDS.map((role, i) => {
    const t = space(d.tokens[role]);
    const [name, hint] = c.roles[i];
    return `<div class="sp-legend__row">
      <span class="sp-legend__mark sp-legend__mark--${role}" aria-hidden="true"></span>
      <span class="sp-legend__text"><span class="sp-legend__name">${name}</span><span class="sp-legend__hint">${hint}</span></span>
      <span class="sp-legend__token"><span>${label(t)}</span><span class="sp-legend__px">${t.px} px</span></span>
    </div>`;
  }).join('');
}

function stageVars() {
  const d = current();
  return ROLE_IDS.map((role) => `--sp-${role}: var(${space(d.tokens[role]).cssVar})`).join(';');
}

function demoCard(c) {
  const d = current();
  return `<article class="sp-card">
    <header class="sp-card__head">
      <span class="ds-avatar sp-card__avatar">${icon('user', { size: 20 })}</span>
      <span class="sp-card__who"><span class="sp-card__title">${c.card[0]}</span><span class="sp-card__meta">${c.card[1]}</span></span>
    </header>
    <div class="sp-card__body">
      <p class="sp-card__text">${c.card[2]}</p>
      <p class="sp-card__text sp-card__text--muted">${c.card[3]}</p>
    </div>
    <footer class="sp-card__actions">
      <span class="ds-btn ds-btn--primary ${d.button}">${c.card[4]}</span>
      <span class="ds-btn ds-btn--secondary ${d.button}">${c.card[5]}</span>
    </footer>
  </article>`;
}

/* ───────── Ritmo ───────── */

const RHYTHM_LINES = [[72, 48], [64, 80, 40], [56]];

function marker(step, kind) {
  const t = space(step);
  return `<div class="sp-marker sp-marker--${kind}" style="height:var(${t.cssVar})"><span class="sp-marker__label">${t.px}</span></div>`;
}

function rhythm(c, inside, between) {
  return RHYTHM_LINES.map((lines, g) => {
    const items = [`<p class="sp-rhythm__title">${c.rhythm.groups[g]}</p>`, ...lines.map((w) => `<span class="sp-rhythm__line" style="width:${w}%"></span>`)];
    const group = items.map((item, i) => (i ? marker(inside, 'inside') + item : item)).join('');
    return (g ? marker(between, 'between') : '') + `<div class="sp-rhythm__group">${group}</div>`;
  }).join('');
}

/* ───────── Página ───────── */

const NAV_IDS = ['escala', 'pratica', 'ritmo', 'uso'];

export default function renderEspacamento(page) {
  const c = tr(COPY);
  const base = space('050');
  const unit = space('100');
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[scale.length, `${base.px} px`, `${unit.px} px`, 'rem'].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
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
      <div class="sp-scale">${scaleRows(c)}</div>
      <div class="sp-naming">
        <p class="sp-naming__text">${icon('hash', { size: 18 })}<span>${c.scale.naming}</span></p>
        <pre class="ds-code ds-code--sm"><code>gap: var(--ds-space-150);      <span class="ds-code__comment">/* 12 px */</span>
padding: var(--ds-space-300);  <span class="ds-code__comment">/* 24 px */</span></code></pre>
      </div>
    </section>

    <section class="doc-section" id="pratica" aria-labelledby="pratica-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="pratica-title">${c.practice.title}</h2>
          <p class="doc-section__desc">${c.practice.desc}</p>
        </div>
        <div class="sp-controls">
          <button type="button" class="ds-chip" data-menu="density"><span class="ds-chip__icon">${icon('sliders', { size: 16 })}</span><span data-label>${densityLabel(c)}</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
          <button type="button" class="ds-chip" data-measure aria-pressed="${measuring}">${icon('spacing', { size: 16 })}${c.practice.measures}</button>
        </div>
      </header>
      <div class="sp-practice">
        <div class="sp-stage" data-stage data-measuring="${measuring}" style="${stageVars()}" inert>${demoCard(c)}</div>
        <div class="sp-legend">
          <p class="sp-legend__title">${c.practice.used}</p>
          <div data-legend>${legendRows(c)}</div>
        </div>
      </div>
    </section>

    <section class="doc-section" id="ritmo" aria-labelledby="ritmo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="ritmo-title">${c.rhythm.title}</h2>
          <p class="doc-section__desc">${c.rhythm.desc}</p>
        </div>
      </header>
      <div class="sp-rhythm-compare">
        <figure class="sp-rhythm sp-rhythm--flat">
          <div class="sp-rhythm__stage" aria-hidden="true">${rhythm(c, '200', '200')}</div>
          <figcaption class="sp-rhythm__caption"><span class="sp-rhythm__verdict">${icon('x-circle', { size: 18 })}${c.rhythm.flat[0]}</span><span>${c.rhythm.flat[1]}</span></figcaption>
        </figure>
        <figure class="sp-rhythm sp-rhythm--good">
          <div class="sp-rhythm__stage" aria-hidden="true">${rhythm(c, '100', '500')}</div>
          <figcaption class="sp-rhythm__caption"><span class="sp-rhythm__verdict">${icon('check-circle', { size: 18 })}${c.rhythm.good[0]}</span><span>${c.rhythm.good[1]}</span></figcaption>
        </figure>
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
          <pre class="ds-code ds-code--sm"><code>padding: var(--ds-space-300);
gap: var(--ds-space-150);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <pre class="ds-code ds-code--sm"><code>margin-top: 13px;
padding: 10px 18px;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
          <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">/* ${c.usage.tipCode[0]} */</span> var(--ds-space-100)
<span class="ds-code__comment">/* ${c.usage.tipCode[1]} */</span> var(--ds-space-300)</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const c = tr(COPY);
  const stage = root.querySelector('[data-stage]');
  const legend = root.querySelector('[data-legend]');
  const measure = root.querySelector('[data-measure]');

  const applyDensity = () => {
    stage.setAttribute('style', stageVars());
    stage.innerHTML = demoCard(c);
    legend.innerHTML = legendRows(c);
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
  const setLabel = () => (densityChip.querySelector('[data-label]').textContent = densityLabel(c));
  setLabel();
  const densityMenu = attachMenu(densityChip, {
    label: c.density,
    value: density,
    options: DENSITIES.map(({ value, icon: ic }, i) => ({ value, label: c.densities[i], icon: ic })),
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
