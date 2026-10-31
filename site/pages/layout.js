import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/layout.css';

/* ───────── Dados (tokens reais) ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const T = (name) => byName.get(name);
const px = (name) => T(name).px;
const short = (t) => t.name.split('.').pop();

const breakpoints = tokens.filter((t) => t.name.startsWith('breakpoint.')).sort((a, b) => a.px - b.px);
const layers = tokens.filter((t) => t.name.startsWith('z.')).sort((a, b) => Number(b.css) - Number(a.css));

// faixas: [mínimo, máximo] de cada breakpoint (mobile-first)
const RANGES = [
  { name: 'base', min: 0, max: breakpoints[0].px - 1 },
  ...breakpoints.map((b, i) => ({ name: short(b), min: b.px, max: breakpoints[i + 1] ? breakpoints[i + 1].px - 1 : Infinity })),
];
const RULER_MAX = 1920;

// o que o app muda em cada ponto (conferido nos CSS de ds/components e site/)
const BREAKPOINT_NOTES = {
  sm: 'Ainda sem regra no app — disponível para componentes.',
  md: 'Abaixo dele, margens e painéis compactam, a trilha da topbar mostra só a página atual e as tabelas viram cartões.',
  lg: 'Abaixo dele, a sidebar vira gaveta com fundo escurecido e o menu aparece na topbar. A partir dele, a sidebar fica fixa e recolhível (⌘B).',
  xl: 'Abaixo dele, o hero do Início empilha e as grades de 4 colunas passam para 2.',
  '2xl': 'Ainda sem regra no app — telas largas mantêm a largura máxima de conteúdo.',
};

const SHELL_TOKENS = [
  ['layout.sidebar', 'Sidebar expandida.'],
  ['layout.sidebar-collapsed', 'Sidebar recolhida — só os ícones, todos centrados no mesmo eixo.'],
  ['layout.topbar', 'Altura da topbar e do cabeçalho da sidebar.'],
  ['layout.frame-gap', 'Respiro entre a borda da janela e os dois painéis.'],
  ['radius.2xl', 'Raio dos painéis do shell.'],
];

const LAYER_USE = {
  tooltip: 'Tooltips e o link “Pular para o conteúdo”.',
  toast: 'Avisos de confirmação.',
  popover: 'Menus que os chips abrem.',
  modal: 'Reservado. A busca ⌘K usa <dialog>, que já vai para a camada superior do navegador.',
  overlay: 'Fundo escurecido da gaveta — a gaveta fica um nível acima.',
  sticky: 'Topbar fixa e a navegação desta página.',
  dropdown: 'Reservado para listas suspensas.',
  raised: 'Reservado para algo que precise ficar acima dos vizinhos.',
  base: 'Conteúdo no fluxo normal.',
};

const WIDTHS = [
  ['layout.content-max', 'Largura máxima do conteúdo das páginas.'],
  ['layout.prose-max', 'Medida confortável para texto corrido.'],
  ['layout.gutter', 'Margem lateral do conteúdo no desktop.'],
];

const PROSE = 'Uma boa linha de leitura tem entre 60 e 80 caracteres. Mais curta, o olho pula de linha o tempo todo; mais longa, ele se perde no caminho de volta. Por isso o texto corrido tem largura máxima própria, menor que a do conteúdo, e os títulos podem ocupar a largura inteira sem prejudicar a leitura.';

const pct = (value) => +((Math.min(value, RULER_MAX) / RULER_MAX) * 100).toFixed(3);
const rangeOf = (width) => RANGES.find((r) => width >= r.min && width <= r.max) ?? RANGES.at(-1);
const rangeLabel = (r) => (r.max === Infinity ? `${r.min} px ou mais` : r.min === 0 ? `até ${r.max} px` : `${r.min}–${r.max} px`);
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const copyBtn = (value, label = 'Copiar variável') =>
  `<button type="button" class="ds-icon-btn ds-icon-btn--muted" data-copy="${escape(value)}" aria-label="${escape(`${label}: ${value}`)}" data-ds-tooltip="${label}">${icon('copy', { size: 18 })}</button>`;

/* ───────── Página ───────── */

export default function renderLayout(page) {
  return `
  <div class="page doc lo-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Layout</h1>
        <p class="doc-header__lead">Onde as coisas ficam e como se reorganizam. Cinco breakpoints, um shell com medidas fixas e larguras máximas que protegem a leitura.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">breakpoints</dt><dd class="doc-stat__value">${breakpoints.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">sidebar (px)</dt><dd class="doc-stat__value">${px('layout.sidebar')}/${px('layout.sidebar-collapsed')}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">topbar (px)</dt><dd class="doc-stat__value">${px('layout.topbar')}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">conteúdo máx. (px)</dt><dd class="doc-stat__value">${px('layout.content-max')}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="breakpoints">Breakpoints</button>
      <button type="button" class="doc-nav__link" data-target="anatomia-shell">App shell</button>
      <button type="button" class="doc-nav__link" data-target="larguras">Larguras</button>
      <button type="button" class="doc-nav__link" data-target="grade">Grade</button>
      <button type="button" class="doc-nav__link" data-target="camadas">Camadas</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="breakpoints" aria-labelledby="breakpoints-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="breakpoints-title">Breakpoints</h2>
          <p class="doc-section__desc">Mobile primeiro: o layout base vale para telas pequenas e cada breakpoint acrescenta regras a partir da sua largura. Redimensione a janela para ver o marcador andar.</p>
        </div>
        <p class="lo-now-readout"><span class="lo-now-readout__value" data-now-value>—</span><span data-now-range>—</span></p>
      </header>

      <div class="lo-ruler" aria-hidden="true">
        <div class="lo-ruler__bar">
          ${RANGES.map((r) => `<span class="lo-ruler__seg" data-range="${r.name}" style="left:${pct(r.min)}%;width:${(pct(r.max === Infinity ? RULER_MAX : r.max + 1) - pct(r.min)).toFixed(3)}%"><span>${r.name}</span></span>`).join('')}
          <span class="lo-ruler__now" data-now></span>
        </div>
        <div class="lo-ruler__ticks">
          <span style="left:0%">0</span>
          ${breakpoints.map((b) => `<span style="left:${pct(b.px)}%">${b.px}</span>`).join('')}
          <span class="lo-ruler__tick-end" style="left:100%">${RULER_MAX}+</span>
        </div>
      </div>

      <div class="doc-table lo-bp-table">
        <div class="doc-table__head" aria-hidden="true"><span>Nome</span><span>A partir de</span><span>Media query</span><span>O que muda no app</span></div>
        ${breakpoints
          .map((b) => {
            const query = `@media (min-width: ${b.px}px)`;
            return `<div class="doc-table__row" data-bp-row="${short(b)}">
              <span class="lo-bp-name">${short(b)}</span>
              <span class="lo-mono">${b.px} px</span>
              <button type="button" class="ds-inline-action lo-mono" data-copy="${query}">${query}</button>
              <span class="lo-bp-note">${BREAKPOINT_NOTES[short(b)] ?? ''}</span>
            </div>`;
          })
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="anatomia-shell" aria-labelledby="shell-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="shell-title">App shell</h2>
          <p class="doc-section__desc">Dois painéis sobre o fundo do app: sidebar e conteúdo, com a topbar dentro do conteúdo. O diagrama está em escala de uma janela de 1440 × 900.</p>
        </div>
        <div class="lo-shell-modes" role="group" aria-label="Estado da sidebar">
          <button type="button" class="ds-chip ds-chip--sm" data-shell-mode="expanded" aria-pressed="true">Expandida</button>
          <button type="button" class="ds-chip ds-chip--sm" data-shell-mode="collapsed" aria-pressed="false">Recolhida</button>
          <button type="button" class="ds-chip ds-chip--sm" data-shell-mode="drawer" aria-pressed="false">Gaveta</button>
        </div>
      </header>

      <figure class="lo-shell" data-mode="expanded"
        style="--lo-side:${px('layout.sidebar')};--lo-side-collapsed:${px('layout.sidebar-collapsed')};--lo-topbar:${px('layout.topbar')};--lo-gap:${px('layout.frame-gap')};--lo-radius:${px('radius.2xl')}">
        <div class="lo-shell__stage" aria-hidden="true">
          <div class="lo-shell__side">
            <span class="lo-dim lo-dim--width" data-side-label>${px('layout.sidebar')} px</span>
            <i></i><i></i><i></i><i></i><i></i>
          </div>
          <div class="lo-shell__main">
            <div class="lo-shell__topbar"><span class="lo-dim lo-dim--height">${px('layout.topbar')} px</span></div>
            <div class="lo-shell__content"><i></i><i></i><i></i></div>
            <span class="lo-shell__scrim"></span>
          </div>
        </div>
        <figcaption class="lo-shell__caption">
          <span data-shell-caption></span>
          <span class="lo-shell__legend">
            <span class="ds-inline-code">frame-gap ${px('layout.frame-gap')} px</span>
            <span class="ds-inline-code">radius.2xl ${px('radius.2xl')} px</span>
          </span>
        </figcaption>
      </figure>

      <div class="doc-table lo-token-table">
        ${SHELL_TOKENS.map(
          ([name, use]) => `<div class="doc-table__row">
            <div class="lo-token"><span class="lo-token__name">${name}</span><span class="lo-token__var">${T(name).cssVar}</span></div>
            <span class="lo-mono">${px(name)} px</span>
            <span class="lo-token__use">${use}</span>
            ${copyBtn(`var(${T(name).cssVar})`)}
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="larguras" aria-labelledby="larguras-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="larguras-title">Larguras</h2>
          <p class="doc-section__desc">Telas largas não devem esticar o conteúdo até a borda. As páginas param em ${px('layout.content-max')} px e o texto corrido em ${px('layout.prose-max')} px.</p>
        </div>
      </header>

      <div class="lo-widths">
        ${WIDTHS.map(
          ([name, use]) => `<div class="lo-width">
            <div class="lo-width__label"><span class="lo-token__name">${name.split('.').pop()}</span><span class="lo-token__use">${use}</span></div>
            <div class="lo-width__track"><span class="lo-width__bar" style="width:${((px(name) / px('layout.content-max')) * 100).toFixed(2)}%"></span></div>
            <span class="lo-mono">${px(name)} px</span>
            ${copyBtn(`var(${T(name).cssVar})`)}
          </div>`,
        ).join('')}
      </div>

      <div class="lo-prose-demo">
        <div class="lo-prose-demo__head">
          <span class="lo-token__name">prose-max na prática</span>
          <span class="lo-token__use" data-prose-measure>—</span>
        </div>
        <p class="lo-prose" data-prose>${PROSE}</p>
      </div>
    </section>

    <section class="doc-section" id="grade" aria-labelledby="grade-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="grade-title">Grade</h2>
          <p class="doc-section__desc">Dois padrões de grade cobrem o site. Arraste para mudar a largura do contêiner e veja como cada um se reorganiza. O espaço entre itens é sempre space.150 (12 px).</p>
        </div>
      </header>

      <div class="lo-grid-controls">
        <label class="lo-grid-controls__label" for="lo-grid-width">Largura do contêiner</label>
        <input class="lo-range" id="lo-grid-width" type="range" min="320" max="1160" step="10" value="1160" data-grid-width>
        <output class="lo-mono" for="lo-grid-width" data-grid-width-value>—</output>
      </div>

      <div class="lo-grid-frame" data-grid-frame>
        <div class="lo-grid-demo">
          <div class="lo-grid-demo__head"><span class="lo-token__name">Colunas fixas que colapsam</span><span class="lo-token__use" data-cols-fixed>—</span></div>
          <div class="lo-grid lo-grid--fixed" data-grid-fixed>${'<span></span>'.repeat(8)}</div>
        </div>
        <div class="lo-grid-demo">
          <div class="lo-grid-demo__head"><span class="lo-token__name">auto-fill com mínimo</span><span class="lo-token__use" data-cols-auto>—</span></div>
          <div class="lo-grid lo-grid--auto" data-grid-auto>${'<span></span>'.repeat(8)}</div>
        </div>
      </div>

      <div class="lo-grid-code">
        <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">/* colunas fixas: cartões de mesma importância */</span>
grid-template-columns: repeat(4, minmax(0, 1fr));
<span class="ds-code__comment">/* e menos colunas em cada breakpoint */</span></code></pre>
        <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">/* auto-fill: as colunas aparecem sozinhas */</span>
grid-template-columns:
  repeat(auto-fill, minmax(min(100%, 15rem), 1fr));</code></pre>
      </div>
    </section>

    <section class="doc-section" id="camadas" aria-labelledby="camadas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="camadas-title">Camadas</h2>
          <p class="doc-section__desc">A ordem de empilhamento é uma escala fixa: nada de z-index 9999. Quanto mais alto na lista, mais na frente.</p>
        </div>
      </header>
      <div class="doc-table lo-layers">
        ${layers
          .map(
            (t, i) => `<div class="doc-table__row">
              <span class="lo-layer-stack" aria-hidden="true" style="--lo-depth:${layers.length - 1 - i}"><i></i></span>
              <div class="lo-token"><span class="lo-token__name">${short(t)}</span><span class="lo-token__var">${t.cssVar}</span></div>
              <span class="lo-mono">${t.css}</span>
              <span class="lo-token__use">${escape(LAYER_USE[short(t)] ?? '')}</span>
              ${copyBtn(`var(${t.cssVar})`)}
            </div>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Regras para o layout continuar previsível em qualquer tela.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: limite a largura com tokens</p>
          <p class="usage-card__text">Conteúdo até content-max, texto corrido até prose-max. Em telas pequenas, a largura vem do contêiner.</p>
          <pre class="ds-code ds-code--sm"><code>max-width: var(--ds-layout-prose-max);
margin-inline: auto;</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: medidas mágicas</p>
          <p class="usage-card__text">Breakpoints e larguras inventados na hora criam saltos que ninguém consegue prever.</p>
          <pre class="ds-code ds-code--sm"><code>@media (max-width: 913px) { … }
width: 1037px;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}@media não lê variáveis</p>
          <p class="usage-card__text">Custom properties não funcionam dentro de media queries. Use o valor em px do token e, para “abaixo de”, subtraia uma fração.</p>
          <pre class="ds-code ds-code--sm"><code>@media (min-width: 1024px)     <span class="ds-code__comment">/* lg+ */</span>
@media (max-width: 1023.98px)  <span class="ds-code__comment">/* &lt; lg */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

/* ───────── Interações ───────── */

const SHELL_CAPTIONS = {
  expanded: `Expandida: sidebar com ${px('layout.sidebar')} px. A partir de ${px('breakpoint.lg')} px.`,
  collapsed: `Recolhida: ${px('layout.sidebar-collapsed')} px, só ícones e tooltips. Alterne com ⌘B.`,
  drawer: `Gaveta: abaixo de ${px('breakpoint.lg')} px a sidebar sai do fluxo e abre por cima do conteúdo, com fundo escurecido.`,
};

export function mount(root) {
  const nowMarker = root.querySelector('[data-now]');
  const nowValue = root.querySelector('[data-now-value]');
  const nowRange = root.querySelector('[data-now-range]');

  function updateNow() {
    const width = window.innerWidth;
    const range = rangeOf(width);
    nowMarker.style.left = `${pct(width)}%`;
    nowValue.textContent = `${width} px`;
    nowRange.textContent = `sua janela · faixa ${range.name} (${rangeLabel(range)})`;
    root.querySelectorAll('[data-range]').forEach((s) => s.toggleAttribute('data-active', s.dataset.range === range.name));
    root.querySelectorAll('[data-bp-row]').forEach((row) => {
      const b = T(`breakpoint.${row.dataset.bpRow}`);
      row.toggleAttribute('data-reached', width >= b.px);
    });
  }

  // App shell
  const shell = root.querySelector('.lo-shell');
  const sideLabel = root.querySelector('[data-side-label]');
  const caption = root.querySelector('[data-shell-caption]');
  const setMode = (mode) => {
    shell.dataset.mode = mode;
    root.querySelectorAll('[data-shell-mode]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.shellMode === mode)));
    sideLabel.textContent = `${mode === 'collapsed' ? px('layout.sidebar-collapsed') : px('layout.sidebar')} px`;
    caption.textContent = SHELL_CAPTIONS[mode];
  };
  setMode('expanded');

  // Medida de leitura (caracteres por linha) com a fonte real
  const prose = root.querySelector('[data-prose]');
  const proseMeasure = root.querySelector('[data-prose-measure]');
  const ctx = document.createElement('canvas').getContext('2d');
  function updateProse() {
    const style = getComputedStyle(prose);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const avg = ctx.measureText(PROSE).width / PROSE.length;
    const chars = Math.round(prose.clientWidth / avg);
    proseMeasure.textContent = `${Math.round(prose.clientWidth)} px · ≈ ${chars} caracteres por linha`;
  }

  // Grade
  const range = root.querySelector('[data-grid-width]');
  const rangeValue = root.querySelector('[data-grid-width-value]');
  const frame = root.querySelector('[data-grid-frame]');
  const gridFixed = root.querySelector('[data-grid-fixed]');
  const gridAuto = root.querySelector('[data-grid-auto]');
  const cols = (grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  const plural = (n) => `${n} ${n === 1 ? 'coluna' : 'colunas'}`;
  function updateGrid() {
    const available = Math.floor(frame.parentElement.clientWidth);
    range.max = String(Math.max(320, Math.min(px('layout.content-max'), available)));
    if (Number(range.value) > Number(range.max)) range.value = range.max;
    frame.style.width = `${range.value}px`;
    rangeValue.textContent = `${range.value} px`;
    root.querySelector('[data-cols-fixed]').textContent = plural(cols(gridFixed));
    root.querySelector('[data-cols-auto]').textContent = plural(cols(gridAuto));
  }

  const onClick = (event) => {
    const copy = event.target.closest('[data-copy]');
    if (copy) return copyText(copy.dataset.copy);
    const mode = event.target.closest('[data-shell-mode]');
    if (mode) setMode(mode.dataset.shellMode);
  };
  root.addEventListener('click', onClick);
  range.addEventListener('input', updateGrid);

  let raf = 0;
  const onResize = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      updateNow();
      updateProse();
      updateGrid();
    });
  };
  addEventListener('resize', onResize);
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(root.querySelector('.lo-page'));
  document.fonts?.ready.then(() => prose.isConnected && updateProse());

  updateNow();
  updateProse();
  updateGrid();

  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    range.removeEventListener('input', updateGrid);
    removeEventListener('resize', onResize);
    resizeObserver.disconnect();
    cancelAnimationFrame(raf);
    unmountNav();
  };
}
