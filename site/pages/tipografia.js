import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/tipografia.css';

/* ───────── Dados ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const styles_ = tokens.filter((t) => t.type === 'typography');
const weights = tokens.filter((t) => t.name.startsWith('font.weight.'));
const weightOf = (w) => Number(byName.get(`font.weight.${w}`)?.css ?? 400);
const short = (t) => t.name.replace(/^text\./, '');

const FAMILIES = [
  { id: 'display', name: 'Inter Tight', role: 'Títulos e números', note: 'Desenho mais estreito, tracking negativo nos tamanhos grandes.', weight: 600, weights: [500, 600, 700, 800] },
  { id: 'sans', name: 'Inter', role: 'Leitura e interface', note: 'Feita para tela: legível de 12 a 18 px, com eixo óptico.', weight: 400, weights: [400, 500, 600, 700] },
  { id: 'mono', name: 'JetBrains Mono', role: 'Código e tokens', note: 'Caracteres distintos (0/O, 1/l) e largura fixa.', weight: 400, weights: [400, 500, 600] },
];

const CATEGORIES = [
  ['all', 'Todos'],
  ['display', 'Display'],
  ['heading', 'Títulos'],
  ['body', 'Corpo'],
  ['label', 'Rótulos'],
  ['other', 'Outros'],
];

const categoryOf = (t) => {
  const n = short(t);
  return ['display', 'heading', 'body', 'label'].find((c) => n.startsWith(`${c}-`)) ?? 'other';
};

const COPY_FORMATS = [
  { value: 'class', label: 'Classe CSS' },
  { value: 'token', label: 'Tokens (font + tracking)' },
];

const DEFAULT_SAMPLE = 'Vamos construir com refinamento.';
let sample = DEFAULT_SAMPLE;
let category = 'all';
let copyFormat = 'class';

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = (n) => String(n).replace('.', ',');
const trackingLabel = (t) => (t.tracking === '0' ? '0' : t.tracking.replace('.', ','));

function copyValue(t) {
  const n = short(t);
  return copyFormat === 'class' ? `ds-text-${n}` : `font: var(--ds-text-${n});\nletter-spacing: var(--ds-text-${n}-tracking);`;
}

/* ───────── Seções ───────── */

function familyCard(f) {
  const t = byName.get(`font.family.${f.id}`);
  return `<article class="ty-family ty-family--${f.id}">
    <div class="ty-family__specimen" style="font-family:var(${t.cssVar});font-weight:${f.weight}">Aa</div>
    <div class="ty-family__body">
      <p class="ty-family__role">${f.role}</p>
      <h3 class="ty-family__name">${f.name}</h3>
      <p class="ty-family__note">${f.note}</p>
      <p class="ty-family__glyphs" style="font-family:var(${t.cssVar})">ABCDEFGHIJKLM<br>abcdefghijklm<br>0123456789 ?!&amp;@ áçõ</p>
      <div class="ty-family__weights">${f.weights.map((w) => `<span style="font-family:var(${t.cssVar});font-weight:${w}">${w}</span>`).join('')}</div>
    </div>
    <button type="button" class="ty-family__copy ds-inline-action" data-copy="var(${t.cssVar})">${icon('copy', { size: 16 })}<code>${t.cssVar}</code></button>
  </article>`;
}

function scaleRows() {
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
        <p class="ty-row__sample ds-text-${n}" data-sample>${escape(sample)}</p>
        <button type="button" class="ds-icon-btn ds-icon-btn--muted ty-row__copy" data-copy-style="${n}" aria-label="Copiar ${n}" data-ds-tooltip="Copiar">${icon('copy', { size: 18 })}</button>
      </div>`;
    })
    .join('');
}

const HIERARCHY = [
  ['eyebrow', 'p', 'Guia de lançamento'],
  ['heading-xl', 'h3', 'Do token ao componente'],
  ['body-lg', 'p', 'Tudo o que muda na versão 0.1, em ordem de impacto para quem já usa o sistema.'],
  ['body-sm', 'p', '01 · Fundamentos'],
  ['body-md', 'p', 'Cores, tipografia e ícones agora são tokens. Os componentes leem esses valores e se ajustam ao tema sem nenhuma linha a mais.'],
  ['label-md', 'p', 'Ver o que mudou →'],
  ['caption', 'p', 'Atualizado em 31 de outubro · 4 min de leitura'],
  ['code-sm', 'p', 'font: var(--ds-text-body-md);'],
];

function hierarchy() {
  return HIERARCHY.map(([style, tag, text]) => {
    const t = byName.get(`text.${style}`);
    return `<div class="ty-hier__line" data-hier="${style}">
      <${tag} class="ty-hier__text ds-text-${style}">${escape(text)}</${tag}>
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

export default function renderTipografia(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Tipografia</h1>
        <p class="doc-header__lead">Inter Tight dá voz aos títulos, Inter cuida da leitura e JetBrains Mono, do código. ${styles_.length} estilos prontos cobrem do herói ao menor rótulo.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">famílias</dt><dd class="doc-stat__value">${FAMILIES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">pesos</dt><dd class="doc-stat__value">${weights.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estilos de texto</dt><dd class="doc-stat__value">${styles_.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tamanho base</dt><dd class="doc-stat__value">16 px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="familias">Famílias</button>
      <button type="button" class="doc-nav__link" data-target="escala">Escala</button>
      <button type="button" class="doc-nav__link" data-target="hierarquia">Hierarquia</button>
      <button type="button" class="doc-nav__link" data-target="tracking">Pesos e tracking</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="familias" aria-labelledby="familias-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="familias-title">Famílias</h2>
          <p class="doc-section__desc">Três famílias, cada uma com um trabalho. Nunca misture duas no mesmo papel.</p>
        </div>
      </header>
      <div class="ty-families">${FAMILIES.map(familyCard).join('')}</div>
    </section>

    <section class="doc-section" id="escala" aria-labelledby="escala-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="escala-title">Escala</h2>
          <p class="doc-section__desc">Cada estilo junta família, tamanho, altura de linha, peso e tracking num token só. Escreva abaixo para testar o seu texto em todos eles.</p>
        </div>
        <button type="button" class="ds-chip" data-menu="copy-format"><span class="ds-chip__icon">${icon('copy', { size: 16 })}</span><span data-label>Classe CSS</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      </header>

      <div class="ty-controls">
        <label class="ds-field ty-controls__field">
          ${icon('type', { size: 18 })}
          <input class="ds-field__input" type="text" value="${escape(sample)}" data-sample-input aria-label="Texto de exemplo" spellcheck="false">
          <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-sample-reset aria-label="Restaurar texto" data-ds-tooltip="Restaurar">${icon('refresh', { size: 16 })}</button>
        </label>
        <div class="ty-controls__filters" role="group" aria-label="Categoria">
          ${CATEGORIES.map(([id, label]) => `<button type="button" class="ds-chip ds-chip--sm" data-category="${id}" aria-pressed="${id === category}">${label}</button>`).join('')}
        </div>
      </div>

      <div class="ty-scale" data-scale>${scaleRows()}</div>
    </section>

    <section class="doc-section" id="hierarquia" aria-labelledby="hierarquia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="hierarquia-title">Hierarquia na prática</h2>
          <p class="doc-section__desc">Uma tela típica usa poucos estilos. O contraste vem do tamanho e da cor — não de muitos pesos diferentes.</p>
        </div>
      </header>
      <div class="ty-hier">${hierarchy()}</div>
    </section>

    <section class="doc-section" id="tracking" aria-labelledby="tracking-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tracking-title">Pesos e tracking</h2>
          <p class="doc-section__desc">Quanto maior o texto, mais justo o espaçamento entre letras. Só o overline, em caixa alta, abre o tracking.</p>
        </div>
      </header>
      <div class="ty-details">
        <article class="ty-weights">
          <h3 class="doc-subhead">Pesos <span class="doc-subhead__meta">font.weight.*</span></h3>
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
          <h3 class="doc-subhead">Tracking por estilo <span class="doc-subhead__meta">do maior para o menor</span></h3>
          <div class="ty-track__scale" aria-hidden="true"><span>−0,05em</span><span>0</span><span>+0,1em</span></div>
          ${trackingChart()}
        </article>
      </div>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três regras para manter o texto consistente.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: use um estilo pronto</p>
          <p class="usage-card__text">Família, tamanho, linha, peso e tracking vêm juntos — e mudam juntos.</p>
          <pre class="ds-code ds-code--sm"><code>font: var(--ds-text-body-md);
letter-spacing: var(--ds-text-body-md-tracking);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: tamanho e peso soltos</p>
          <p class="usage-card__text">Valores avulsos criam variações quase iguais e quebram o ritmo da página.</p>
          <pre class="ds-code ds-code--sm"><code>font-size: 15px;
font-weight: 550;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('book-open', { size: 20 })}Medida de leitura</p>
          <p class="usage-card__text">Para textos longos, mantenha 60 a 75 caracteres por linha. O token de layout já limita isso.</p>
          <pre class="ds-code ds-code--sm"><code>max-width: var(--ds-layout-prose-max);
<span class="ds-code__comment">/* 720 px */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
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
      root.querySelectorAll('[data-category]').forEach((c) => c.setAttribute('aria-pressed', String(c === cat)));
      scale.innerHTML = scaleRows();
      return;
    }
    if (event.target.closest('[data-sample-reset]')) {
      sample = DEFAULT_SAMPLE;
      input.value = sample;
      scale.querySelectorAll('[data-sample]').forEach((el) => (el.textContent = sample));
    }
  };
  root.addEventListener('click', onClick);

  const onInput = () => {
    sample = input.value || DEFAULT_SAMPLE;
    scale.querySelectorAll('[data-sample]').forEach((el) => (el.textContent = sample));
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
    label: 'Copiar como',
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
