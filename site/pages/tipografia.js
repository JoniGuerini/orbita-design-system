import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { tr, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T } from '../i18n.js';

export const styles = 'site/pages/tipografia.css';

/* ───────── Textos ───────── */

const COPY = T(
  {
    lead: (n) => `Inter Tight dá voz aos títulos, Inter cuida da leitura e JetBrains Mono, do código. ${n} estilos prontos cobrem do herói ao menor rótulo.`,
    stats: ['famílias', 'pesos', 'estilos de texto', 'tamanho base'],
    onThisPage: 'Nesta página',
    nav: ['Famílias', 'Escala', 'Hierarquia', 'Pesos e tracking', 'Uso'],
    families: {
      title: 'Famílias',
      desc: 'Três famílias, cada uma com um trabalho. Nunca misture duas no mesmo papel.',
      roles: [
        ['Títulos e números', 'Desenho mais estreito, tracking negativo nos tamanhos grandes.'],
        ['Leitura e interface', 'Feita para tela: legível de 12 a 18 px, com eixo óptico.'],
        ['Código e tokens', 'Caracteres distintos (0/O, 1/l) e largura fixa.'],
      ],
    },
    categories: ['Todos', 'Display', 'Títulos', 'Corpo', 'Rótulos', 'Outros'],
    category: 'Categoria',
    copyFormats: ['Classe CSS', 'Tokens (font + tracking)'],
    copyAs: 'Copiar como',
    sample: 'Vamos construir com refinamento.',
    scale: { title: 'Escala', desc: 'Cada estilo junta família, tamanho, altura de linha, peso e tracking num token só. Escreva abaixo para testar o seu texto em todos eles.', sampleLabel: 'Texto de exemplo', reset: 'Restaurar texto', resetShort: 'Restaurar', copyOf: (n) => `Copiar ${n}`, copy: 'Copiar' },
    hierarchy: {
      title: 'Hierarquia na prática',
      desc: 'Uma tela típica usa poucos estilos. O contraste vem do tamanho e da cor — não de muitos pesos diferentes.',
      lines: ['Guia de lançamento', 'Do token ao componente', 'Tudo o que muda na versão 0.1, em ordem de impacto para quem já usa o sistema.', '01 · Fundamentos', 'Cores, tipografia e ícones agora são tokens. Os componentes leem esses valores e se ajustam ao tema sem nenhuma linha a mais.', 'Ver o que mudou →', 'Atualizado em 31 de outubro · 4 min de leitura'],
    },
    tracking: { title: 'Pesos e tracking', desc: 'Quanto maior o texto, mais justo o espaçamento entre letras. Só o overline, em caixa alta, abre o tracking.', weights: 'Pesos', perStyle: 'Tracking por estilo', order: 'do maior para o menor' },
    usage: {
      title: 'Uso',
      desc: 'Três regras para manter o texto consistente.',
      do: ['Faça: use um estilo pronto', 'Família, tamanho, linha, peso e tracking vêm juntos — e mudam juntos.'],
      dont: ['Evite: tamanho e peso soltos', 'Valores avulsos criam variações quase iguais e quebram o ritmo da página.'],
      tip: ['Medida de leitura', 'Para textos longos, mantenha 60 a 75 caracteres por linha. O token de layout já limita isso.'],
    },
  },
  {
    lead: (n) => `Inter Tight gives headings their voice, Inter handles reading, and JetBrains Mono, code. ${n} ready-made styles cover everything from the hero to the smallest label.`,
    stats: ['families', 'weights', 'text styles', 'base size'],
    onThisPage: 'On this page',
    nav: ['Families', 'Scale', 'Hierarchy', 'Weights and tracking', 'Usage'],
    families: {
      title: 'Families',
      desc: 'Three families, each with one job. Never mix two in the same role.',
      roles: [
        ['Headings and numbers', 'A narrower design, with negative tracking at large sizes.'],
        ['Reading and interface', 'Made for screens: legible from 12 to 18 px, with an optical size axis.'],
        ['Code and tokens', 'Distinct characters (0/O, 1/l) and fixed width.'],
      ],
    },
    categories: ['All', 'Display', 'Headings', 'Body', 'Labels', 'Other'],
    category: 'Category',
    copyFormats: ['CSS class', 'Tokens (font + tracking)'],
    copyAs: 'Copy as',
    sample: 'Let’s build with refinement.',
    scale: { title: 'Scale', desc: 'Each style bundles family, size, line height, weight, and tracking into a single token. Type below to test your own text in all of them.', sampleLabel: 'Sample text', reset: 'Reset text', resetShort: 'Reset', copyOf: (n) => `Copy ${n}`, copy: 'Copy' },
    hierarchy: {
      title: 'Hierarchy in practice',
      desc: 'A typical screen uses few styles. Contrast comes from size and color — not from many different weights.',
      lines: ['Launch guide', 'From token to component', 'Everything that changes in version 0.1, in order of impact for people already using the system.', '01 · Foundations', 'Color, typography, and icons are tokens now. Components read those values and adapt to the theme without a single extra line.', 'See what changed →', 'Updated on October 31 · 4 min read'],
    },
    tracking: { title: 'Weights and tracking', desc: 'The bigger the text, the tighter the letter spacing. Only the all-caps overline opens the tracking up.', weights: 'Weights', perStyle: 'Tracking per style', order: 'largest to smallest' },
    usage: {
      title: 'Usage',
      desc: 'Three rules to keep text consistent.',
      do: ['Do: use a ready-made style', 'Family, size, line height, weight, and tracking come together — and change together.'],
      dont: ['Avoid: loose sizes and weights', 'One-off values create near-duplicate variations and break the page’s rhythm.'],
      tip: ['Reading measure', 'For long text, keep 60 to 75 characters per line. The layout token already limits this.'],
    },
  },
  {
    lead: (n) => `Inter Tight da voz a los títulos, Inter se ocupa de la lectura y JetBrains Mono, del código. ${n} estilos listos cubren desde el héroe hasta la etiqueta más pequeña.`,
    stats: ['familias', 'pesos', 'estilos de texto', 'tamaño base'],
    onThisPage: 'En esta página',
    nav: ['Familias', 'Escala', 'Jerarquía', 'Pesos y tracking', 'Uso'],
    families: {
      title: 'Familias',
      desc: 'Tres familias, cada una con un trabajo. Nunca mezcles dos en el mismo papel.',
      roles: [
        ['Títulos y números', 'Un diseño más estrecho, con tracking negativo en los tamaños grandes.'],
        ['Lectura e interfaz', 'Hecha para pantalla: legible de 12 a 18 px, con eje óptico.'],
        ['Código y tokens', 'Caracteres distintos (0/O, 1/l) y ancho fijo.'],
      ],
    },
    categories: ['Todos', 'Display', 'Títulos', 'Cuerpo', 'Etiquetas', 'Otros'],
    category: 'Categoría',
    copyFormats: ['Clase CSS', 'Tokens (font + tracking)'],
    copyAs: 'Copiar como',
    sample: 'Construyamos con refinamiento.',
    scale: { title: 'Escala', desc: 'Cada estilo reúne familia, tamaño, altura de línea, peso y tracking en un solo token. Escribe abajo para probar tu texto en todos ellos.', sampleLabel: 'Texto de ejemplo', reset: 'Restaurar texto', resetShort: 'Restaurar', copyOf: (n) => `Copiar ${n}`, copy: 'Copiar' },
    hierarchy: {
      title: 'Jerarquía en la práctica',
      desc: 'Una pantalla típica usa pocos estilos. El contraste viene del tamaño y del color — no de muchos pesos distintos.',
      lines: ['Guía de lanzamiento', 'Del token al componente', 'Todo lo que cambia en la versión 0.1, en orden de impacto para quien ya usa el sistema.', '01 · Fundamentos', 'Color, tipografía e íconos ahora son tokens. Los componentes leen esos valores y se ajustan al tema sin ninguna línea de más.', 'Ver qué cambió →', 'Actualizado el 31 de octubre · 4 min de lectura'],
    },
    tracking: { title: 'Pesos y tracking', desc: 'Cuanto más grande el texto, más justo el espacio entre letras. Solo el overline, en mayúsculas, abre el tracking.', weights: 'Pesos', perStyle: 'Tracking por estilo', order: 'del mayor al menor' },
    usage: {
      title: 'Uso',
      desc: 'Tres reglas para mantener el texto consistente.',
      do: ['Haz: usa un estilo listo', 'Familia, tamaño, línea, peso y tracking vienen juntos — y cambian juntos.'],
      dont: ['Evita: tamaños y pesos sueltos', 'Los valores sueltos crean variaciones casi iguales y rompen el ritmo de la página.'],
      tip: ['Medida de lectura', 'Para textos largos, mantén de 60 a 75 caracteres por línea. El token de layout ya lo limita.'],
    },
  },
);

/* ───────── Dados ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const styles_ = tokens.filter((t) => t.type === 'typography');
const weights = tokens.filter((t) => t.name.startsWith('font.weight.'));
const weightOf = (w) => Number(byName.get(`font.weight.${w}`)?.css ?? 400);
const short = (t) => t.name.replace(/^text\./, '');

const FAMILIES = [
  { id: 'display', name: 'Inter Tight', weight: 600, weights: [500, 600, 700, 800] },
  { id: 'sans', name: 'Inter', weight: 400, weights: [400, 500, 600, 700] },
  { id: 'mono', name: 'JetBrains Mono', weight: 400, weights: [400, 500, 600] },
];

const CATEGORY_IDS = ['all', 'display', 'heading', 'body', 'label', 'other'];

const categoryOf = (t) => {
  const n = short(t);
  return ['display', 'heading', 'body', 'label'].find((c) => n.startsWith(`${c}-`)) ?? 'other';
};

const FORMAT_VALUES = ['class', 'token'];
const copyFormats = (c) => FORMAT_VALUES.map((value, i) => ({ value, label: c.copyFormats[i] }));

// null = o texto padrão do idioma atual; o que a pessoa digitar fica até ela restaurar
let sample = null;
let category = 'all';
let copyFormat = 'class';

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = (n) => formatNumber(n);
const trackingLabel = (t) => (t.tracking === '0' ? '0' : `${formatNumber(parseFloat(t.tracking))}em`);
const sampleText = (c) => sample ?? c.sample;

function copyValue(t) {
  const n = short(t);
  return copyFormat === 'class' ? `ds-text-${n}` : `font: var(--ds-text-${n});\nletter-spacing: var(--ds-text-${n}-tracking);`;
}

/* ───────── Seções ───────── */

function familyCard(c, f, i) {
  const t = byName.get(`font.family.${f.id}`);
  const [role, note] = c.families.roles[i];
  return `<article class="ty-family ty-family--${f.id}">
    <div class="ty-family__specimen" style="font-family:var(${t.cssVar});font-weight:${f.weight}">Aa</div>
    <div class="ty-family__body">
      <p class="ty-family__role">${role}</p>
      <h3 class="ty-family__name">${f.name}</h3>
      <p class="ty-family__note">${note}</p>
      <p class="ty-family__glyphs" style="font-family:var(${t.cssVar})">ABCDEFGHIJKLM<br>abcdefghijklm<br>0123456789 ?!&amp;@ áçõ</p>
      <div class="ty-family__weights">${f.weights.map((w) => `<span style="font-family:var(${t.cssVar});font-weight:${w}">${w}</span>`).join('')}</div>
    </div>
    <button type="button" class="ty-family__copy ds-inline-action" data-copy="var(${t.cssVar})">${icon('copy', { size: 16 })}<code>${t.cssVar}</code></button>
  </article>`;
}

function scaleRows(c) {
  return styles_
    .filter((t) => category === 'all' || categoryOf(t) === category)
    .map((t) => {
      const n = short(t);
      const family = FAMILIES.find((f) => f.id === (t.family ?? 'sans'));
      return `<div class="ty-row" data-style="${n}">
        <div class="ty-row__meta">
          <span class="ty-row__name">${n}</span>
          <span class="ty-row__spec">${fmt(t.size)}/${fmt(t.line)} · ${weightOf(t.weight)} · ${trackingLabel(t)}</span>
          <span class="ty-row__family">${family.name}</span>
        </div>
        <p class="ty-row__sample ds-text-${n}" data-sample>${escape(sampleText(c))}</p>
        <button type="button" class="ds-icon-btn ds-icon-btn--muted ty-row__copy" data-copy-style="${n}" aria-label="${c.scale.copyOf(n)}" data-ds-tooltip="${c.scale.copy}">${icon('copy', { size: 18 })}</button>
      </div>`;
    })
    .join('');
}

const HIERARCHY = [
  ['eyebrow', 'p'],
  ['heading-xl', 'h3'],
  ['body-lg', 'p'],
  ['body-sm', 'p'],
  ['body-md', 'p'],
  ['label-md', 'p'],
  ['caption', 'p'],
  ['code-sm', 'p', 'font: var(--ds-text-body-md);'],
];

function hierarchy(c) {
  return HIERARCHY.map(([style, tag, fixed], i) => {
    const t = byName.get(`text.${style}`);
    return `<div class="ty-hier__line" data-hier="${style}">
      <${tag} class="ty-hier__text ds-text-${style}">${escape(fixed ?? c.hierarchy.lines[i])}</${tag}>
      <span class="ty-hier__tag"><span>${style}</span><span class="ty-hier__tag-spec">${fmt(t.size)}/${fmt(t.line)}</span></span>
    </div>`;
  }).join('');
}

/** Mapa de tracking: de −0,05em (mais justo) a +0,1em (mais aberto). */
const TRACK_MIN = -0.05;
const TRACK_MAX = 0.1;
const trackPos = (em) => ((parseFloat(em) - TRACK_MIN) / (TRACK_MAX - TRACK_MIN)) * 100;

function trackingChart() {
  return [...styles_]
    .sort((a, b) => b.size - a.size)
    .map(
      (t) => `<div class="ty-track__row">
        <span class="ty-track__name">${short(t)}</span>
        <span class="ty-track__lane"><span class="ty-track__zero" style="left:${trackPos(0)}%"></span><span class="ty-track__dot" style="left:${trackPos(t.tracking)}%"></span></span>
        <span class="ty-track__value">${trackingLabel(t)}</span>
      </div>`,
    )
    .join('');
}

/* ───────── Página ───────── */

const NAV_IDS = ['familias', 'escala', 'hierarquia', 'tracking', 'uso'];

export default function renderTipografia(page) {
  const c = tr(COPY);
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead(styles_.length)}</p>
      </div>
      <dl class="doc-stats">
        ${[FAMILIES.length, weights.length, styles_.length, '16 px'].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="familias" aria-labelledby="familias-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="familias-title">${c.families.title}</h2>
          <p class="doc-section__desc">${c.families.desc}</p>
        </div>
      </header>
      <div class="ty-families">${FAMILIES.map((f, i) => familyCard(c, f, i)).join('')}</div>
    </section>

    <section class="doc-section" id="escala" aria-labelledby="escala-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="escala-title">${c.scale.title}</h2>
          <p class="doc-section__desc">${c.scale.desc}</p>
        </div>
        <button type="button" class="ds-chip" data-menu="copy-format"><span class="ds-chip__icon">${icon('copy', { size: 16 })}</span><span data-label>${c.copyFormats[0]}</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      </header>

      <div class="ty-controls">
        <label class="ds-field ty-controls__field">
          ${icon('type', { size: 18 })}
          <input class="ds-field__input" type="text" value="${escape(sampleText(c))}" data-sample-input aria-label="${c.scale.sampleLabel}" spellcheck="false">
          <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-sample-reset aria-label="${c.scale.reset}" data-ds-tooltip="${c.scale.resetShort}">${icon('refresh', { size: 16 })}</button>
        </label>
        <div class="ty-controls__filters" role="group" aria-label="${c.category}">
          ${CATEGORY_IDS.map((id, i) => `<button type="button" class="ds-chip ds-chip--sm" data-category="${id}" aria-pressed="${id === category}">${c.categories[i]}</button>`).join('')}
        </div>
      </div>

      <div class="ty-scale" data-scale>${scaleRows(c)}</div>
    </section>

    <section class="doc-section" id="hierarquia" aria-labelledby="hierarquia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="hierarquia-title">${c.hierarchy.title}</h2>
          <p class="doc-section__desc">${c.hierarchy.desc}</p>
        </div>
      </header>
      <div class="ty-hier">${hierarchy(c)}</div>
    </section>

    <section class="doc-section" id="tracking" aria-labelledby="tracking-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tracking-title">${c.tracking.title}</h2>
          <p class="doc-section__desc">${c.tracking.desc}</p>
        </div>
      </header>
      <div class="ty-details">
        <article class="ty-weights">
          <h3 class="doc-subhead">${c.tracking.weights} <span class="doc-subhead__meta">font.weight.*</span></h3>
          ${weights
            .map(
              (w) => `<button type="button" class="ty-weight" data-copy="var(${w.cssVar})">
                <span class="ty-weight__sample" style="font-weight:${w.css}">Aa</span>
                <span class="ty-weight__name">${w.name.replace('font.weight.', '')}</span>
                <span class="ty-weight__value">${w.css}</span>
              </button>`,
            )
            .join('')}
        </article>
        <article class="ty-track">
          <h3 class="doc-subhead">${c.tracking.perStyle} <span class="doc-subhead__meta">${c.tracking.order}</span></h3>
          <div class="ty-track__scale" aria-hidden="true"><span>${formatNumber(-0.05)}em</span><span>0</span><span>+${formatNumber(0.1)}em</span></div>
          ${trackingChart()}
        </article>
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
          <pre class="ds-code ds-code--sm"><code>font: var(--ds-text-body-md);
letter-spacing: var(--ds-text-body-md-tracking);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <pre class="ds-code ds-code--sm"><code>font-size: 15px;
font-weight: 550;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('book-open', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
          <pre class="ds-code ds-code--sm"><code>max-width: var(--ds-layout-prose-max);
<span class="ds-code__comment">/* 720 px */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const c = tr(COPY);
  const COPY_FORMATS = copyFormats(c);
  const scale = root.querySelector('[data-scale]');
  const input = root.querySelector('[data-sample-input]');

  const onClick = (event) => {
    const copy = event.target.closest('[data-copy]');
    if (copy) return copyText(copy.dataset.copy);
    const styleBtn = event.target.closest('[data-copy-style]');
    if (styleBtn) return copyText(copyValue(byName.get(`text.${styleBtn.dataset.copyStyle}`)));
    const cat = event.target.closest('[data-category]');
    if (cat) {
      category = cat.dataset.category;
      root.querySelectorAll('[data-category]').forEach((x) => x.setAttribute('aria-pressed', String(x === cat)));
      scale.innerHTML = scaleRows(c);
      return;
    }
    if (event.target.closest('[data-sample-reset]')) {
      sample = null;
      input.value = c.sample;
      scale.querySelectorAll('[data-sample]').forEach((el) => (el.textContent = c.sample));
    }
  };
  root.addEventListener('click', onClick);

  const onInput = () => {
    sample = input.value || null;
    scale.querySelectorAll('[data-sample]').forEach((el) => (el.textContent = sampleText(c)));
  };
  input.addEventListener('input', onInput);

  // passar o mouse numa etiqueta destaca a linha da hierarquia
  const onOver = (event) => {
    const line = event.target.closest('[data-hier]');
    root.querySelectorAll('[data-hier]').forEach((l) => l.toggleAttribute('data-dim', Boolean(line) && l !== line));
  };
  const hier = root.querySelector('.ty-hier');
  hier.addEventListener('pointerover', onOver);
  hier.addEventListener('pointerleave', () => root.querySelectorAll('[data-hier]').forEach((l) => l.removeAttribute('data-dim')));

  const chip = root.querySelector('[data-menu="copy-format"]');
  chip.querySelector('[data-label]').textContent = COPY_FORMATS.find((f) => f.value === copyFormat).label;
  const menu = attachMenu(chip, {
    label: c.copyAs,
    value: copyFormat,
    options: COPY_FORMATS,
    onChange: (value) => {
      copyFormat = value;
      chip.querySelector('[data-label]').textContent = COPY_FORMATS.find((f) => f.value === value).label;
    },
  });

  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    menu.destroy();
    unmountNav();
  };
}
