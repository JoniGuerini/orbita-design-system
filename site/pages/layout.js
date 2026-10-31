import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { copyText } from '../../ds/js/toast.js';
import { tr } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T } from '../i18n.js';

export const styles = 'site/pages/layout.css';

/* ───────── Dados (tokens reais) ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const tk = (name) => byName.get(name);
const px = (name) => tk(name).px;
const short = (t) => t.name.split('.').pop();

const breakpoints = tokens.filter((t) => t.name.startsWith('breakpoint.')).sort((a, b) => a.px - b.px);
const layers = tokens.filter((t) => t.name.startsWith('z.')).sort((a, b) => Number(b.css) - Number(a.css));

// faixas: [mínimo, máximo] de cada breakpoint (mobile-first)
const RANGES = [
  { name: 'base', min: 0, max: breakpoints[0].px - 1 },
  ...breakpoints.map((b, i) => ({ name: short(b), min: b.px, max: breakpoints[i + 1] ? breakpoints[i + 1].px - 1 : Infinity })),
];
const RULER_MAX = 1920;

const SHELL_TOKENS = ['layout.sidebar', 'layout.sidebar-collapsed', 'layout.topbar', 'layout.frame-gap', 'radius.2xl'];
const WIDTHS = ['layout.content-max', 'layout.prose-max', 'layout.gutter'];

/* ───────── Textos ───────── */

const COPY = T(
  {
    lead: 'Onde as coisas ficam e como se reorganizam. Cinco breakpoints, um shell com medidas fixas e larguras máximas que protegem a leitura.',
    stats: ['breakpoints', 'sidebar (px)', 'topbar (px)', 'conteúdo máx. (px)'],
    onThisPage: 'Nesta página',
    nav: ['Breakpoints', 'App shell', 'Larguras', 'Grade', 'Camadas', 'Uso'],
    copy: 'Copiar variável',
    // o que o app muda em cada ponto (conferido nos CSS de ds/components e site/)
    bpNotes: {
      sm: 'Ainda sem regra no app — disponível para componentes.',
      md: 'Abaixo dele, margens e painéis compactam, a trilha da topbar mostra só a página atual e as tabelas viram cartões.',
      lg: 'Abaixo dele, a sidebar vira gaveta com fundo escurecido e o menu aparece na topbar. A partir dele, a sidebar fica fixa e recolhível (⌘B).',
      xl: 'Abaixo dele, o hero do Início empilha e as grades de 4 colunas passam para 2.',
      '2xl': 'Ainda sem regra no app — telas largas mantêm a largura máxima de conteúdo.',
    },
    shellUse: ['Sidebar expandida.', 'Sidebar recolhida — só os ícones, todos centrados no mesmo eixo.', 'Altura da topbar e do cabeçalho da sidebar.', 'Respiro entre a borda da janela e os dois painéis.', 'Raio dos painéis do shell.'],
    layerUse: {
      tooltip: 'Tooltips e o link “Pular para o conteúdo”.',
      toast: 'Avisos de confirmação.',
      popover: 'Menus que os chips abrem.',
      modal: 'Reservado. A busca ⌘K usa <dialog>, que já vai para a camada superior do navegador.',
      overlay: 'Fundo escurecido da gaveta — a gaveta fica um nível acima.',
      sticky: 'Topbar fixa e a navegação desta página.',
      dropdown: 'Reservado para listas suspensas.',
      raised: 'Reservado para algo que precise ficar acima dos vizinhos.',
      base: 'Conteúdo no fluxo normal.',
    },
    widthUse: ['Largura máxima do conteúdo das páginas.', 'Medida confortável para texto corrido.', 'Margem lateral do conteúdo no desktop.'],
    prose: 'Uma boa linha de leitura tem entre 60 e 80 caracteres. Mais curta, o olho pula de linha o tempo todo; mais longa, ele se perde no caminho de volta. Por isso o texto corrido tem largura máxima própria, menor que a do conteúdo, e os títulos podem ocupar a largura inteira sem prejudicar a leitura.',
    rangeLabel: { from: (min) => `${min} px ou mais`, upTo: (max) => `até ${max} px` },
    breakpoints: { title: 'Breakpoints', desc: 'Mobile primeiro: o layout base vale para telas pequenas e cada breakpoint acrescenta regras a partir da sua largura. Redimensione a janela para ver o marcador andar.', head: ['Nome', 'A partir de', 'Media query', 'O que muda no app'], now: (name, range) => `sua janela · faixa ${name} (${range})` },
    shell: {
      title: 'App shell',
      desc: 'Dois painéis sobre o fundo do app: sidebar e conteúdo, com a topbar dentro do conteúdo. O diagrama está em escala de uma janela de 1440 × 900.',
      modes: ['Expandida', 'Recolhida', 'Gaveta'],
      modesLabel: 'Estado da sidebar',
      captions: {
        expanded: (side, lg) => `Expandida: sidebar com ${side} px. A partir de ${lg} px.`,
        collapsed: (collapsed) => `Recolhida: ${collapsed} px, só ícones e tooltips. Alterne com ⌘B.`,
        drawer: (lg) => `Gaveta: abaixo de ${lg} px a sidebar sai do fluxo e abre por cima do conteúdo, com fundo escurecido.`,
      },
    },
    widths: { title: 'Larguras', desc: (content, prose) => `Telas largas não devem esticar o conteúdo até a borda. As páginas param em ${content} px e o texto corrido em ${prose} px.`, practice: 'prose-max na prática', measure: (w, chars) => `${w} px · ≈ ${chars} caracteres por linha` },
    grid: {
      title: 'Grade',
      desc: 'Dois padrões de grade cobrem o site. Arraste para mudar a largura do contêiner e veja como cada um se reorganiza. O espaço entre itens é sempre space.150 (12 px).',
      width: 'Largura do contêiner',
      fixed: 'Colunas fixas que colapsam',
      auto: 'auto-fill com mínimo',
      columns: (n) => `${n} ${n === 1 ? 'coluna' : 'colunas'}`,
      code: ['colunas fixas: cartões de mesma importância', 'e menos colunas em cada breakpoint', 'auto-fill: as colunas aparecem sozinhas'],
    },
    layers: { title: 'Camadas', desc: 'A ordem de empilhamento é uma escala fixa: nada de z-index 9999. Quanto mais alto na lista, mais na frente.' },
    usage: {
      title: 'Uso',
      desc: 'Regras para o layout continuar previsível em qualquer tela.',
      do: ['Faça: limite a largura com tokens', 'Conteúdo até content-max, texto corrido até prose-max. Em telas pequenas, a largura vem do contêiner.'],
      dont: ['Evite: medidas mágicas', 'Breakpoints e larguras inventados na hora criam saltos que ninguém consegue prever.'],
      tip: ['@media não lê variáveis', 'Custom properties não funcionam dentro de media queries. Use o valor em px do token e, para “abaixo de”, subtraia uma fração.'],
    },
  },
  {
    lead: 'Where things go and how they rearrange. Five breakpoints, a shell with fixed measures, and maximum widths that protect reading.',
    stats: ['breakpoints', 'sidebar (px)', 'top bar (px)', 'max content (px)'],
    onThisPage: 'On this page',
    nav: ['Breakpoints', 'App shell', 'Widths', 'Grid', 'Layers', 'Usage'],
    copy: 'Copy variable',
    bpNotes: {
      sm: 'No rule in the app yet — available for components.',
      md: 'Below it, margins and panels compact, the top bar trail shows only the current page, and tables become cards.',
      lg: 'Below it, the sidebar becomes a drawer over a dimmed background and the menu appears in the top bar. From it up, the sidebar is fixed and collapsible (⌘B).',
      xl: 'Below it, the Home hero stacks and 4-column grids go down to 2.',
      '2xl': 'No rule in the app yet — wide screens keep the maximum content width.',
    },
    shellUse: ['Expanded sidebar.', 'Collapsed sidebar — icons only, all centered on the same axis.', 'Height of the top bar and of the sidebar header.', 'Breathing room between the window edge and the two panels.', 'Radius of the shell panels.'],
    layerUse: {
      tooltip: 'Tooltips and the “Skip to content” link.',
      toast: 'Confirmation notices.',
      popover: 'Menus that chips open.',
      modal: 'Reserved. ⌘K search uses <dialog>, which already goes to the browser’s top layer.',
      overlay: 'The drawer’s dimmed background — the drawer sits one level above.',
      sticky: 'The fixed top bar and this page’s navigation.',
      dropdown: 'Reserved for dropdown lists.',
      raised: 'Reserved for something that needs to sit above its neighbors.',
      base: 'Content in the normal flow.',
    },
    widthUse: ['Maximum width of page content.', 'Comfortable measure for running text.', 'Side margin of the content on desktop.'],
    prose: 'A good reading line has between 60 and 80 characters. Shorter, and the eye jumps lines all the time; longer, and it gets lost on the way back. That’s why running text has its own maximum width, narrower than the content, while headings can take the full width without hurting reading.',
    rangeLabel: { from: (min) => `${min} px or more`, upTo: (max) => `up to ${max} px` },
    breakpoints: { title: 'Breakpoints', desc: 'Mobile first: the base layout covers small screens and each breakpoint adds rules from its width up. Resize the window to watch the marker move.', head: ['Name', 'From', 'Media query', 'What changes in the app'], now: (name, range) => `your window · ${name} range (${range})` },
    shell: {
      title: 'App shell',
      desc: 'Two panels over the app background: sidebar and content, with the top bar inside the content. The diagram is scaled to a 1440 × 900 window.',
      modes: ['Expanded', 'Collapsed', 'Drawer'],
      modesLabel: 'Sidebar state',
      captions: {
        expanded: (side, lg) => `Expanded: ${side} px sidebar. From ${lg} px.`,
        collapsed: (collapsed) => `Collapsed: ${collapsed} px, icons and tooltips only. Toggle with ⌘B.`,
        drawer: (lg) => `Drawer: below ${lg} px the sidebar leaves the flow and opens over the content, with a dimmed background.`,
      },
    },
    widths: { title: 'Widths', desc: (content, prose) => `Wide screens shouldn’t stretch content to the edge. Pages stop at ${content} px and running text at ${prose} px.`, practice: 'prose-max in practice', measure: (w, chars) => `${w} px · ≈ ${chars} characters per line` },
    grid: {
      title: 'Grid',
      desc: 'Two grid patterns cover the site. Drag to change the container width and watch how each one rearranges. The space between items is always space.150 (12 px).',
      width: 'Container width',
      fixed: 'Fixed columns that collapse',
      auto: 'auto-fill with a minimum',
      columns: (n) => `${n} ${n === 1 ? 'column' : 'columns'}`,
      code: ['fixed columns: cards of equal importance', 'and fewer columns at each breakpoint', 'auto-fill: columns appear on their own'],
    },
    layers: { title: 'Layers', desc: 'Stacking order is a fixed scale: no z-index 9999. The higher on the list, the further in front.' },
    usage: {
      title: 'Usage',
      desc: 'Rules to keep the layout predictable on any screen.',
      do: ['Do: cap width with tokens', 'Content up to content-max, running text up to prose-max. On small screens, the width comes from the container.'],
      dont: ['Avoid: magic measures', 'Breakpoints and widths made up on the spot create jumps nobody can predict.'],
      tip: ['@media doesn’t read variables', 'Custom properties don’t work inside media queries. Use the token’s px value and, for “below”, subtract a fraction.'],
    },
  },
  {
    lead: 'Dónde quedan las cosas y cómo se reorganizan. Cinco breakpoints, un shell con medidas fijas y anchos máximos que protegen la lectura.',
    stats: ['breakpoints', 'sidebar (px)', 'barra superior (px)', 'contenido máx. (px)'],
    onThisPage: 'En esta página',
    nav: ['Breakpoints', 'App shell', 'Anchos', 'Cuadrícula', 'Capas', 'Uso'],
    copy: 'Copiar variable',
    bpNotes: {
      sm: 'Todavía sin regla en el app — disponible para componentes.',
      md: 'Por debajo, márgenes y paneles se compactan, la ruta de la barra superior muestra solo la página actual y las tablas se vuelven tarjetas.',
      lg: 'Por debajo, la sidebar se vuelve un cajón con fondo oscurecido y el menú aparece en la barra superior. Desde él, la sidebar queda fija y contraíble (⌘B).',
      xl: 'Por debajo, el héroe del Inicio se apila y las cuadrículas de 4 columnas pasan a 2.',
      '2xl': 'Todavía sin regla en el app — las pantallas anchas mantienen el ancho máximo de contenido.',
    },
    shellUse: ['Sidebar expandida.', 'Sidebar contraída — solo los íconos, todos centrados en el mismo eje.', 'Altura de la barra superior y del encabezado de la sidebar.', 'Respiro entre el borde de la ventana y los dos paneles.', 'Radio de los paneles del shell.'],
    layerUse: {
      tooltip: 'Tooltips y el enlace “Saltar al contenido”.',
      toast: 'Avisos de confirmación.',
      popover: 'Menús que abren los chips.',
      modal: 'Reservado. La búsqueda ⌘K usa <dialog>, que ya va a la capa superior del navegador.',
      overlay: 'Fondo oscurecido del cajón — el cajón queda un nivel arriba.',
      sticky: 'La barra superior fija y la navegación de esta página.',
      dropdown: 'Reservado para listas desplegables.',
      raised: 'Reservado para algo que deba quedar por encima de sus vecinos.',
      base: 'Contenido en el flujo normal.',
    },
    widthUse: ['Ancho máximo del contenido de las páginas.', 'Medida cómoda para texto corrido.', 'Margen lateral del contenido en el escritorio.'],
    prose: 'Una buena línea de lectura tiene entre 60 y 80 caracteres. Más corta, el ojo salta de línea todo el tiempo; más larga, se pierde en el camino de vuelta. Por eso el texto corrido tiene su propio ancho máximo, menor que el del contenido, y los títulos pueden ocupar todo el ancho sin perjudicar la lectura.',
    rangeLabel: { from: (min) => `${min} px o más`, upTo: (max) => `hasta ${max} px` },
    breakpoints: { title: 'Breakpoints', desc: 'Móvil primero: el layout base vale para pantallas pequeñas y cada breakpoint suma reglas desde su ancho. Cambia el tamaño de la ventana para ver moverse el marcador.', head: ['Nombre', 'Desde', 'Media query', 'Qué cambia en el app'], now: (name, range) => `tu ventana · rango ${name} (${range})` },
    shell: {
      title: 'App shell',
      desc: 'Dos paneles sobre el fondo del app: sidebar y contenido, con la barra superior dentro del contenido. El diagrama está a escala de una ventana de 1440 × 900.',
      modes: ['Expandida', 'Contraída', 'Cajón'],
      modesLabel: 'Estado de la sidebar',
      captions: {
        expanded: (side, lg) => `Expandida: sidebar de ${side} px. Desde ${lg} px.`,
        collapsed: (collapsed) => `Contraída: ${collapsed} px, solo íconos y tooltips. Alterna con ⌘B.`,
        drawer: (lg) => `Cajón: por debajo de ${lg} px la sidebar sale del flujo y se abre sobre el contenido, con fondo oscurecido.`,
      },
    },
    widths: { title: 'Anchos', desc: (content, prose) => `Las pantallas anchas no deben estirar el contenido hasta el borde. Las páginas paran en ${content} px y el texto corrido en ${prose} px.`, practice: 'prose-max en la práctica', measure: (w, chars) => `${w} px · ≈ ${chars} caracteres por línea` },
    grid: {
      title: 'Cuadrícula',
      desc: 'Dos patrones de cuadrícula cubren el sitio. Arrastra para cambiar el ancho del contenedor y mira cómo se reorganiza cada uno. El espacio entre elementos es siempre space.150 (12 px).',
      width: 'Ancho del contenedor',
      fixed: 'Columnas fijas que colapsan',
      auto: 'auto-fill con mínimo',
      columns: (n) => `${n} ${n === 1 ? 'columna' : 'columnas'}`,
      code: ['columnas fijas: tarjetas de igual importancia', 'y menos columnas en cada breakpoint', 'auto-fill: las columnas aparecen solas'],
    },
    layers: { title: 'Capas', desc: 'El orden de apilamiento es una escala fija: nada de z-index 9999. Cuanto más arriba en la lista, más adelante.' },
    usage: {
      title: 'Uso',
      desc: 'Reglas para que el layout siga siendo previsible en cualquier pantalla.',
      do: ['Haz: limita el ancho con tokens', 'Contenido hasta content-max, texto corrido hasta prose-max. En pantallas pequeñas, el ancho viene del contenedor.'],
      dont: ['Evita: medidas mágicas', 'Los breakpoints y anchos inventados en el momento crean saltos que nadie puede prever.'],
      tip: ['@media no lee variables', 'Las custom properties no funcionan dentro de media queries. Usa el valor en px del token y, para “por debajo de”, resta una fracción.'],
    },
  },
);

const pct = (value) => +((Math.min(value, RULER_MAX) / RULER_MAX) * 100).toFixed(3);
const rangeOf = (width) => RANGES.find((r) => width >= r.min && width <= r.max) ?? RANGES.at(-1);
const rangeLabel = (c, r) => (r.max === Infinity ? c.rangeLabel.from(r.min) : r.min === 0 ? c.rangeLabel.upTo(r.max) : `${r.min}–${r.max} px`);
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const copyBtn = (c, value) =>
  `<button type="button" class="ds-icon-btn ds-icon-btn--muted" data-copy="${escape(value)}" aria-label="${escape(`${c.copy}: ${value}`)}" data-ds-tooltip="${c.copy}">${icon('copy', { size: 18 })}</button>`;

/* ───────── Página ───────── */

const NAV_IDS = ['breakpoints', 'anatomia-shell', 'larguras', 'grade', 'camadas', 'uso'];
const SHELL_MODES = ['expanded', 'collapsed', 'drawer'];

export default function renderLayout(page) {
  const c = tr(COPY);
  return `
  <div class="page doc lo-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[breakpoints.length, `${px('layout.sidebar')}/${px('layout.sidebar-collapsed')}`, px('layout.topbar'), px('layout.content-max')].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="breakpoints" aria-labelledby="breakpoints-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="breakpoints-title">${c.breakpoints.title}</h2>
          <p class="doc-section__desc">${c.breakpoints.desc}</p>
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
        <div class="doc-table__head" aria-hidden="true">${c.breakpoints.head.map((h) => `<span>${h}</span>`).join('')}</div>
        ${breakpoints
          .map((b) => {
            const query = `@media (min-width: ${b.px}px)`;
            return `<div class="doc-table__row" data-bp-row="${short(b)}">
              <span class="lo-bp-name">${short(b)}</span>
              <span class="lo-mono">${b.px} px</span>
              <button type="button" class="ds-inline-action lo-mono" data-copy="${query}">${query}</button>
              <span class="lo-bp-note">${c.bpNotes[short(b)] ?? ''}</span>
            </div>`;
          })
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="anatomia-shell" aria-labelledby="shell-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="shell-title">${c.shell.title}</h2>
          <p class="doc-section__desc">${c.shell.desc}</p>
        </div>
        <div class="lo-shell-modes" role="group" aria-label="${c.shell.modesLabel}">
          ${SHELL_MODES.map((mode, i) => `<button type="button" class="ds-chip ds-chip--sm" data-shell-mode="${mode}" aria-pressed="${i === 0}">${c.shell.modes[i]}</button>`).join('')}
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
          (name, i) => `<div class="doc-table__row">
            <div class="lo-token"><span class="lo-token__name">${name}</span><span class="lo-token__var">${tk(name).cssVar}</span></div>
            <span class="lo-mono">${px(name)} px</span>
            <span class="lo-token__use">${c.shellUse[i]}</span>
            ${copyBtn(c, `var(${tk(name).cssVar})`)}
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="larguras" aria-labelledby="larguras-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="larguras-title">${c.widths.title}</h2>
          <p class="doc-section__desc">${c.widths.desc(px('layout.content-max'), px('layout.prose-max'))}</p>
        </div>
      </header>

      <div class="lo-widths">
        ${WIDTHS.map(
          (name, i) => `<div class="lo-width">
            <div class="lo-width__label"><span class="lo-token__name">${name.split('.').pop()}</span><span class="lo-token__use">${c.widthUse[i]}</span></div>
            <div class="lo-width__track"><span class="lo-width__bar" style="width:${((px(name) / px('layout.content-max')) * 100).toFixed(2)}%"></span></div>
            <span class="lo-mono">${px(name)} px</span>
            ${copyBtn(c, `var(${tk(name).cssVar})`)}
          </div>`,
        ).join('')}
      </div>

      <div class="lo-prose-demo">
        <div class="lo-prose-demo__head">
          <span class="lo-token__name">${c.widths.practice}</span>
          <span class="lo-token__use" data-prose-measure>—</span>
        </div>
        <p class="lo-prose" data-prose>${c.prose}</p>
      </div>
    </section>

    <section class="doc-section" id="grade" aria-labelledby="grade-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="grade-title">${c.grid.title}</h2>
          <p class="doc-section__desc">${c.grid.desc}</p>
        </div>
      </header>

      <div class="lo-grid-controls">
        <label class="lo-grid-controls__label" for="lo-grid-width">${c.grid.width}</label>
        <input class="lo-range" id="lo-grid-width" type="range" min="320" max="1160" step="10" value="1160" data-grid-width>
        <output class="lo-mono" for="lo-grid-width" data-grid-width-value>—</output>
      </div>

      <div class="lo-grid-frame" data-grid-frame>
        <div class="lo-grid-demo">
          <div class="lo-grid-demo__head"><span class="lo-token__name">${c.grid.fixed}</span><span class="lo-token__use" data-cols-fixed>—</span></div>
          <div class="lo-grid lo-grid--fixed" data-grid-fixed>${'<span></span>'.repeat(8)}</div>
        </div>
        <div class="lo-grid-demo">
          <div class="lo-grid-demo__head"><span class="lo-token__name">${c.grid.auto}</span><span class="lo-token__use" data-cols-auto>—</span></div>
          <div class="lo-grid lo-grid--auto" data-grid-auto>${'<span></span>'.repeat(8)}</div>
        </div>
      </div>

      <div class="lo-grid-code">
        <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">/* ${c.grid.code[0]} */</span>
grid-template-columns: repeat(4, minmax(0, 1fr));
<span class="ds-code__comment">/* ${c.grid.code[1]} */</span></code></pre>
        <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">/* ${c.grid.code[2]} */</span>
grid-template-columns:
  repeat(auto-fill, minmax(min(100%, 15rem), 1fr));</code></pre>
      </div>
    </section>

    <section class="doc-section" id="camadas" aria-labelledby="camadas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="camadas-title">${c.layers.title}</h2>
          <p class="doc-section__desc">${c.layers.desc}</p>
        </div>
      </header>
      <div class="doc-table lo-layers">
        ${layers
          .map(
            (t, i) => `<div class="doc-table__row">
              <span class="lo-layer-stack" aria-hidden="true" style="--lo-depth:${layers.length - 1 - i}"><i></i></span>
              <div class="lo-token"><span class="lo-token__name">${short(t)}</span><span class="lo-token__var">${t.cssVar}</span></div>
              <span class="lo-mono">${t.css}</span>
              <span class="lo-token__use">${escape(c.layerUse[short(t)] ?? '')}</span>
              ${copyBtn(c, `var(${t.cssVar})`)}
            </div>`,
          )
          .join('')}
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
          <pre class="ds-code ds-code--sm"><code>max-width: var(--ds-layout-prose-max);
margin-inline: auto;</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <pre class="ds-code ds-code--sm"><code>@media (max-width: 913px) { … }
width: 1037px;</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
          <pre class="ds-code ds-code--sm"><code>@media (min-width: 1024px)     <span class="ds-code__comment">/* lg+ */</span>
@media (max-width: 1023.98px)  <span class="ds-code__comment">/* &lt; lg */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

/* ───────── Interações ───────── */

export function mount(root) {
  const c = tr(COPY);
  const shellCaptions = {
    expanded: c.shell.captions.expanded(px('layout.sidebar'), px('breakpoint.lg')),
    collapsed: c.shell.captions.collapsed(px('layout.sidebar-collapsed')),
    drawer: c.shell.captions.drawer(px('breakpoint.lg')),
  };

  const nowMarker = root.querySelector('[data-now]');
  const nowValue = root.querySelector('[data-now-value]');
  const nowRange = root.querySelector('[data-now-range]');

  function updateNow() {
    const width = window.innerWidth;
    const range = rangeOf(width);
    nowMarker.style.left = `${pct(width)}%`;
    nowValue.textContent = `${width} px`;
    nowRange.textContent = c.breakpoints.now(range.name, rangeLabel(c, range));
    root.querySelectorAll('[data-range]').forEach((s) => s.toggleAttribute('data-active', s.dataset.range === range.name));
    root.querySelectorAll('[data-bp-row]').forEach((row) => {
      const b = tk(`breakpoint.${row.dataset.bpRow}`);
      row.toggleAttribute('data-reached', width >= b.px);
    });
  }

  // App shell
  const shell = root.querySelector('.lo-shell');
  const sideLabel = root.querySelector('[data-side-label]');
  const caption = root.querySelector('[data-shell-caption]');
  const setMode = (mode) => {
    shell.dataset.mode = mode;
    root.querySelectorAll('[data-shell-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.shellMode === mode)));
    sideLabel.textContent = `${mode === 'collapsed' ? px('layout.sidebar-collapsed') : px('layout.sidebar')} px`;
    caption.textContent = shellCaptions[mode];
  };
  setMode('expanded');

  // Medida de leitura (caracteres por linha) com a fonte real
  const prose = root.querySelector('[data-prose]');
  const proseMeasure = root.querySelector('[data-prose-measure]');
  const ctx = document.createElement('canvas').getContext('2d');
  function updateProse() {
    const style = getComputedStyle(prose);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const avg = ctx.measureText(c.prose).width / c.prose.length;
    const chars = Math.round(prose.clientWidth / avg);
    proseMeasure.textContent = c.widths.measure(Math.round(prose.clientWidth), chars);
  }

  // Grade
  const range = root.querySelector('[data-grid-width]');
  const rangeValue = root.querySelector('[data-grid-width-value]');
  const frame = root.querySelector('[data-grid-frame]');
  const gridFixed = root.querySelector('[data-grid-fixed]');
  const gridAuto = root.querySelector('[data-grid-auto]');
  const cols = (grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  function updateGrid() {
    const available = Math.floor(frame.parentElement.clientWidth);
    range.max = String(Math.max(320, Math.min(px('layout.content-max'), available)));
    if (Number(range.value) > Number(range.max)) range.value = range.max;
    frame.style.width = `${range.value}px`;
    rangeValue.textContent = `${range.value} px`;
    root.querySelector('[data-cols-fixed]').textContent = c.grid.columns(cols(gridFixed));
    root.querySelector('[data-cols-auto]').textContent = c.grid.columns(cols(gridAuto));
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
