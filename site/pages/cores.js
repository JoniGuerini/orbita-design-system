import { icon } from '../../ds/icons/icons.js';
import { palettes, tokens, contrast } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/cores.css';

/* ───────── Dados ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const semantic = tokens.filter((t) => t.type === 'color' && t.themed);
const canvas = byName.get('color.bg.canvas').modes;
const colorCount = palettes.reduce((n, p) => n + p.steps.length, 0);
const passed = contrast.filter((c) => c.pass).length;

const FEATURED = ['brand', 'neutral'];
const FORMATS = [
  { value: 'hex', label: 'HEX' },
  { value: 'oklch', label: 'OKLCH' },
  { value: 'var', label: 'Variável CSS' },
];

const GROUPS = [
  ['bg', 'Fundo', 'Fundos e camadas de superfície — do app ao painel elevado.'],
  ['fg', 'Texto', 'Texto e ícones, do mais forte ao mais apagado.'],
  ['border', 'Borda', 'Contornos, divisores e o anel de foco.'],
  ['brand', 'Marca', 'Ação principal, destaques e o indicador de novidade.'],
  ['success', 'Sucesso', 'Confirmações e estados concluídos.'],
  ['warning', 'Aviso', 'Atenção sem bloquear.'],
  ['danger', 'Perigo', 'Erros e ações destrutivas.'],
  ['info', 'Informação', 'Dicas e mensagens neutras.'],
  ['chart', 'Gráficos', 'Séries em ordem fixa, escalas sequencial, ordinal e divergente, grade e eixo. Regras em Gráficos › Visão geral.'],
];

let format = 'hex';
let group = 'bg';

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const short = (name) => name.replace(/^color\./, '');

function describeRef(ref) {
  const alpha = /^alpha\(\{color\.([^}]+)\},\s*([\d.]+)\)$/.exec(ref);
  if (alpha) return `${alpha[1]} · ${Math.round(Number(alpha[2]) * 100)}%`;
  const plain = /^\{color\.([^}]+)\}$/.exec(ref);
  return plain ? plain[1] : ref;
}

/** Cores com transparência (#rrggbbaa) são mostradas sobre o canvas do tema. */
const paint = (value, mode) => (value.length === 9 ? `linear-gradient(${value}, ${value}), ${canvas[mode].value}` : value);
const valueOf = (p, s) => (format === 'hex' ? s.hex : format === 'oklch' ? s.oklch : `var(${s.cssVar})`);
const inkFor = (s) => (s.contrastOnBlack > s.contrastOnWhite ? 'dark' : 'light');

/* ───────── Paletas ───────── */

function strip(p, size) {
  return `<div class="swatches swatches--${size}">
    ${p.steps
      .map(
        (s) => `<button type="button" class="swatch swatch--ink-${inkFor(s)}" style="background:${s.hex}"
          data-palette="${p.name}" data-step="${s.step}" aria-label="${escape(`${p.label} ${s.step}, ${s.hex}`)}"
          ${size === 'sm' ? `data-ds-tooltip="${p.name}.${s.step} · ${s.hex}"` : ''}>
          ${size === 'sm' ? '' : `<span class="swatch__step">${s.step}</span><span class="swatch__value" data-value>${escape(valueOf(p, s))}</span>`}
        </button>`,
      )
      .join('')}
  </div>`;
}

const paletteMeta = (p) => `hue ${p.hue} · croma ${String(p.chroma).replace('.', ',')} · ${p.steps.length} tons`;

function featuredCard(p) {
  return `<article class="palette-card palette-card--featured">
    <header class="palette-card__head">
      <div>
        <h3 class="palette-card__name">${p.label}</h3>
        <p class="palette-card__meta">${paletteMeta(p)}</p>
      </div>
      <code class="ds-inline-code">--ds-color-${p.name}-*</code>
    </header>
    ${strip(p, 'lg')}
  </article>`;
}

function compactCard(p) {
  return `<article class="palette-card">
    <header class="palette-card__head">
      <h3 class="palette-card__name palette-card__name--sm">${p.label}</h3>
      <p class="palette-card__meta">${paletteMeta(p)}</p>
    </header>
    ${strip(p, 'sm')}
  </article>`;
}

/* ───────── Tokens semânticos ───────── */

function tokenValue(t, mode) {
  const { ref, value } = t.modes[mode];
  return `<div class="token-value">
    <span class="token-swatch" style="background:${paint(value, mode)}"></span>
    <span class="token-value__text">
      <span class="token-value__ref">${escape(describeRef(ref))}</span>
      <span class="token-value__hex">${value.toUpperCase()}</span>
    </span>
  </div>`;
}

function tokenRows() {
  return semantic
    .filter((t) => t.name.startsWith(`color.${group}.`))
    .map(
      (t) => `<div class="doc-table__row">
        <div class="token-name">
          <span class="token-name__label">${short(t.name)}</span>
          <span class="token-name__var">${t.cssVar}</span>
          ${t.description ? `<span class="token-name__desc">${escape(t.description)}</span>` : ''}
        </div>
        ${tokenValue(t, 'dark')}
        ${tokenValue(t, 'light')}
        <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})" data-ds-tooltip="Copiar variável">${icon('copy', { size: 18 })}</button>
      </div>`,
    )
    .join('');
}

const groupInfo = () => GROUPS.find(([id]) => id === group);
const countIn = (id) => semantic.filter((t) => t.name.startsWith(`color.${id}.`)).length;

/* ───────── Contraste ───────── */

const pairs = [];
for (const c of contrast) {
  let pair = pairs.find((p) => p.fg === c.fg && p.bg === c.bg);
  if (!pair) pairs.push((pair = { fg: c.fg, bg: c.bg, min: c.min }));
  pair[c.mode] = c;
}

function level(ratio) {
  if (ratio >= 7) return ['success', 'AAA'];
  if (ratio >= 4.5) return ['success', 'AA'];
  if (ratio >= 3) return ['warning', 'AA grande'];
  return ['danger', 'Falha'];
}

function contrastCell(pair, mode) {
  const c = pair[mode];
  const fg = byName.get(pair.fg).modes[mode].value;
  const bg = byName.get(pair.bg).modes[mode].value;
  const [tone, label] = level(c.ratio);
  return `<div class="contrast-cell">
    <span class="contrast-sample" style="color:${fg};background:${paint(bg, mode)}">Aa</span>
    <span class="contrast-ratio">${c.ratio.toFixed(2).replace('.', ',')}:1</span>
    <span class="ds-badge ds-badge--sm ds-badge--${tone}">${label}</span>
  </div>`;
}

/* ───────── Página ───────── */

export default function renderCores(page) {
  const others = palettes.filter((p) => !FEATURED.includes(p.name));
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Cores</h1>
        <p class="doc-header__lead">Uma paleta quente gerada em OKLCH e tokens semânticos que se adaptam ao tema. Os componentes nunca usam cor solta — sempre um token.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">paletas</dt><dd class="doc-stat__value">${palettes.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">cores primitivas</dt><dd class="doc-stat__value">${colorCount}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tokens semânticos</dt><dd class="doc-stat__value">${semantic.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">contrastes WCAG</dt><dd class="doc-stat__value">${passed}/${contrast.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="paletas">Paletas</button>
      <button type="button" class="doc-nav__link" data-target="semanticos">Tokens semânticos</button>
      <button type="button" class="doc-nav__link" data-target="temas">Temas</button>
      <button type="button" class="doc-nav__link" data-target="contraste">Contraste</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="paletas" aria-labelledby="paletas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="paletas-title">Paletas primitivas</h2>
          <p class="doc-section__desc">A matéria-prima. Cada paleta nasce de um matiz e um croma em OKLCH, com luminosidade perceptualmente uniforme. Clique numa cor para copiar.</p>
        </div>
        <button type="button" class="ds-chip" data-menu="format"><span class="ds-chip__icon">${icon('code', { size: 16 })}</span><span data-label>HEX</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      </header>

      <div class="palette-stack">
        ${FEATURED.map((name) => featuredCard(palettes.find((p) => p.name === name))).join('')}
      </div>

      <h3 class="doc-subhead">Paletas de apoio <span class="doc-subhead__meta">status, dados e ilustração</span></h3>
      <div class="palette-grid">${others.map(compactCard).join('')}</div>

      <div class="palette-howto">
        <p class="palette-howto__text">${icon('refresh', { size: 18 })}<span>Para recriar uma paleta inteira, mude o <strong>hue</strong> em <code class="ds-inline-code">tokens/palettes.json</code>. O build gera os tons, ajusta ao gamut sRGB e verifica o contraste.</span></p>
        <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">// tokens/palettes.json</span>
"brand": { "hue": <span class="ds-code__accent">50</span>, "chroma": 0.175 }</code></pre>
      </div>
    </section>

    <section class="doc-section" id="semanticos" aria-labelledby="semanticos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="semanticos-title">Tokens semânticos</h2>
          <p class="doc-section__desc">É isso que os componentes consomem. Cada token aponta para uma primitiva diferente em cada tema — o nome descreve a função, não a cor.</p>
        </div>
      </header>
      <div class="token-filters" role="group" aria-label="Grupo de tokens">
        ${GROUPS.map(([id, label]) => `<button type="button" class="ds-chip ds-chip--sm" data-group="${id}" aria-pressed="${id === group}">${label}<span class="token-filters__count">${countIn(id)}</span></button>`).join('')}
      </div>
      <p class="token-group-desc" data-group-desc>${groupInfo()[2]}</p>
      <div class="doc-table token-table">
        <div class="doc-table__head" aria-hidden="true"><span>Token</span><span>Escuro</span><span>Claro</span><span></span></div>
        <div data-token-rows>${tokenRows()}</div>
      </div>
    </section>

    <section class="doc-section" id="temas" aria-labelledby="temas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="temas-title">Temas</h2>
          <p class="doc-section__desc">Escuro é o padrão da marca; claro e “seguir o sistema” vêm prontos. Como os temas vivem em atributos, dá até para misturar: um bloco claro dentro de uma tela escura.</p>
        </div>
      </header>
      <div class="theme-previews">
        ${[
          ['dark', 'Escuro', 'padrão'],
          ['light', 'Claro', ''],
        ]
          .map(
            ([mode, label, note]) => `<figure class="theme-preview">
              <div class="theme-preview__stage" data-theme="${mode}" inert>
                <div class="tp-card">
                  <div class="tp-card__head">
                    <div><p class="ds-panel__eyebrow">Exemplo</p><p class="tp-card__title">Lançamento da versão 0.1</p></div>
                    <span class="ds-icon-btn ds-icon-btn--sm">${icon('x', { size: 18 })}</span>
                  </div>
                  <p class="tp-card__text">Os mesmos componentes e os mesmos tokens — só o tema muda.</p>
                  <div class="tp-card__row">
                    <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>Tom direto<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></span>
                    <span class="ds-badge ds-badge--sm ds-badge--success">Pronto</span>
                    <span class="ds-badge ds-badge--sm ds-badge--warning">Revisar</span>
                  </div>
                  <div class="tp-card__row">
                    <span class="ds-btn ds-btn--primary ds-btn--sm">Publicar</span>
                    <span class="ds-btn ds-btn--secondary ds-btn--sm">Cancelar</span>
                  </div>
                </div>
              </div>
              <figcaption class="theme-preview__label"><span>${label}${note ? ` <span class="theme-preview__note">· ${note}</span>` : ''}</span><code class="ds-inline-code">data-theme="${mode}"</code></figcaption>
            </figure>`,
          )
          .join('')}
      </div>
      <pre class="ds-code theme-code"><code>&lt;html data-theme="dark"&gt;     <span class="ds-code__comment">&lt;!-- escuro (padrão) --&gt;</span>
&lt;html data-theme="light"&gt;    <span class="ds-code__comment">&lt;!-- claro --&gt;</span>
&lt;html data-theme="system"&gt;   <span class="ds-code__comment">&lt;!-- segue o sistema operacional --&gt;</span>

&lt;section data-theme="light"&gt; <span class="ds-code__comment">&lt;!-- tema aninhado: só este bloco fica claro --&gt;</span></code></pre>
    </section>

    <section class="doc-section" id="contraste" aria-labelledby="contraste-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="contraste-title">Contraste</h2>
          <p class="doc-section__desc">Toda combinação de texto e fundo usada pelos componentes é verificada no build, nos dois temas, contra o WCAG 2.2. Texto comum pede 4,5:1; texto terciário, 3:1.</p>
        </div>
        <p class="contrast-summary"><span class="contrast-summary__value">${passed}/${contrast.length}</span><span>combinações aprovadas</span></p>
      </header>
      <div class="doc-table contrast-table">
        <div class="doc-table__head" aria-hidden="true"><span>Texto sobre fundo</span><span>Escuro</span><span>Claro</span><span>Mínimo</span></div>
        ${pairs
          .map(
            (p) => `<div class="doc-table__row">
              <div class="token-name"><span class="token-name__label">${short(p.fg)}</span><span class="token-name__var">sobre ${short(p.bg)}</span></div>
              ${contrastCell(p, 'dark')}
              ${contrastCell(p, 'light')}
              <span class="contrast-min">${String(p.min).replace('.', ',')}:1</span>
            </div>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três regras que mantêm a interface consistente quando o sistema cresce.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: use tokens semânticos</p>
          <p class="usage-card__text">O nome descreve a função. Quando o tema ou a marca mudam, o componente acompanha sozinho.</p>
          <pre class="ds-code ds-code--sm"><code>color: var(--ds-color-fg-muted);
background: var(--ds-color-bg-surface);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: cor solta ou primitiva</p>
          <p class="usage-card__text">Hex fixo ou primitiva no componente quebra o tema claro e trava a troca de marca.</p>
          <pre class="ds-code ds-code--sm"><code>color: #9c9792;
background: var(--ds-color-neutral-900);</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Pêssego com moderação</p>
          <p class="usage-card__text">Reserve a cor da marca para a ação principal e para indicadores. O resto da interface vive nos neutros quentes.</p>
          <pre class="ds-code ds-code--sm"><code>.ds-btn--primary  <span class="ds-code__comment">/* uma por tela */</span>
.ds-dot           <span class="ds-code__comment">/* novidade */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  // copiar cor ao clicar no swatch
  const onClick = (event) => {
    const swatch = event.target.closest('.swatch');
    if (swatch) {
      const p = palettes.find((x) => x.name === swatch.dataset.palette);
      const s = p.steps.find((x) => x.step === swatch.dataset.step);
      copyText(valueOf(p, s));
      return;
    }
    const copy = event.target.closest('[data-copy]');
    if (copy) copyText(copy.dataset.copy);
  };
  root.addEventListener('click', onClick);

  // formato exibido/copiado
  const formatChip = root.querySelector('[data-menu="format"]');
  const formatMenu = attachMenu(formatChip, {
    label: 'Formato',
    value: format,
    options: FORMATS,
    onChange: (value) => {
      format = value;
      formatChip.querySelector('[data-label]').textContent = FORMATS.find((f) => f.value === value).label;
      root.querySelectorAll('.swatch [data-value]').forEach((el) => {
        const sw = el.closest('.swatch');
        const p = palettes.find((x) => x.name === sw.dataset.palette);
        el.textContent = valueOf(p, p.steps.find((x) => x.step === sw.dataset.step));
      });
    },
  });
  formatChip.querySelector('[data-label]').textContent = FORMATS.find((f) => f.value === format).label;

  // filtro de grupo dos tokens semânticos
  const rows = root.querySelector('[data-token-rows]');
  const desc = root.querySelector('[data-group-desc]');
  root.querySelectorAll('[data-group]').forEach((chip) =>
    chip.addEventListener('click', () => {
      group = chip.dataset.group;
      root.querySelectorAll('[data-group]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      rows.innerHTML = tokenRows();
      desc.textContent = groupInfo()[2];
    }),
  );

  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    formatMenu.destroy();
    unmountNav();
  };
}
