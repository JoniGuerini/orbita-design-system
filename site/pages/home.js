import { icon, iconList } from '../../ds/icons/icons.js';
import { palettes, tokens, contrast, generatedAt } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { getThemePreference, setTheme } from '../../ds/js/theme.js';
import { tr, numberFormat, dateFormat } from '../../ds/js/i18n.js';
import { navigation } from '../nav.js';
import { applyBrand, getBrand, brandOptions, brandLabel } from '../brand.js';
import { releases, upcoming, CURRENT_VERSION } from '../changelog.js';
import { T } from '../i18n.js';

/* ───────── Textos ───────── */

const COPY = T(
  {
    themes: { dark: 'Escuro', light: 'Claro', refugio: 'Refúgio', system: 'Sistema' },
    stats: ['cores em OKLCH', 'tokens de cor', 'estilos de texto', 'ícones próprios', 'contrastes WCAG'],
    statsLabel: 'O sistema em números',
    ready: 'Pronto',
    kpi: 'Receita',
    previews: {
      button: ['Botão', 'Primário chapado, contorno, ghost e de ícone.', 'Criar', 'Cancelar'],
      chip: ['Chip', 'Pílula com contorno que vira seletor.', 'Direto', 'Escuro'],
      menu: ['Menu', 'Lista de opções com seleção e teclado.', 'Escuro', 'Claro'],
      panel: ['Painel', 'Rótulo, título, controles e seções.', 'Abertura', 'Detalhes'],
    },
    hero: {
      title: 'Vamos construir com refinamento.',
      lead: 'O Lume reúne tokens, tipografia, ícones, componentes e gráficos para que cada tela nasça consistente, acessível e cuidada nos detalhes.',
      start: 'Começar agora',
      components: 'Ver componentes',
      try: 'Experimente ao vivo',
    },
    collage: {
      eyebrow: 'Exemplo',
      title: (v) => `Lançamento da versão ${v}`,
      tone: 'Tom direto',
      dark: 'Escuro',
      section: 'Fundamentos prontos',
      text: 'Cores, tipografia e ícones já estão em tokens, nos três temas.',
      demo: 'Ver demonstração',
      template: 'Escolher modelo',
      examples: 'Exemplos',
      badges: ['Pronto', 'Novo', 'Beta'],
      search: 'Buscar',
    },
    foundations: { title: 'As decisões que sustentam tudo', desc: 'Cada decisão visual vira um token. Os componentes só consomem tokens — por isso o sistema muda inteiro quando a marca muda.' },
    components: { title: 'Planos, calmos e precisos', desc: (n) => `Contornos finos, nada de brilho. ${n} componentes, cada um com anatomia, estados e acessibilidade.`, all: 'Ver todos' },
    charts: { title: 'Dados que se leem de relance', desc: 'Cores em ordem fixa validadas para daltonismo, marcas finas e tooltip também no teclado. Todo gráfico vira tabela com um clique.', overview: 'Ver visão geral' },
    patterns: 'Como as peças se encaixam',
    roadmap: { title: 'Do token ao componente', history: 'Histórico de versões' },
    footer: (colors, count, date) => `${colors} cores · ${count} tokens semânticos e de fundação · gerado em ${date}`,
    brand: 'Cor da marca',
    theme: 'Tema',
  },
  {
    themes: { dark: 'Dark', light: 'Light', refugio: 'Refúgio', system: 'System' },
    stats: ['OKLCH colors', 'color tokens', 'text styles', 'custom icons', 'WCAG contrast checks'],
    statsLabel: 'The system in numbers',
    ready: 'Done',
    kpi: 'Revenue',
    previews: {
      button: ['Button', 'Flat primary, outline, ghost, and icon.', 'Create', 'Cancel'],
      chip: ['Chip', 'An outlined pill that becomes a picker.', 'Direct', 'Dark'],
      menu: ['Menu', 'A list of options with selection and keyboard support.', 'Dark', 'Light'],
      panel: ['Panel', 'Label, title, controls, and sections.', 'Opening', 'Details'],
    },
    hero: {
      title: 'Let’s build with refinement.',
      lead: 'Lume brings together tokens, typography, icons, components, and charts so every screen starts out consistent, accessible, and carefully detailed.',
      start: 'Get started',
      components: 'See components',
      try: 'Try it live',
    },
    collage: {
      eyebrow: 'Example',
      title: (v) => `Version ${v} launch`,
      tone: 'Direct tone',
      dark: 'Dark',
      section: 'Foundations ready',
      text: 'Color, typography, and icons are already tokens, in all three themes.',
      demo: 'Watch demo',
      template: 'Choose template',
      examples: 'Examples',
      badges: ['Done', 'New', 'Beta'],
      search: 'Search',
    },
    foundations: { title: 'The decisions that hold it all up', desc: 'Every visual decision becomes a token. Components only consume tokens — that’s why the whole system changes when the brand does.' },
    components: { title: 'Flat, calm, and precise', desc: (n) => `Thin outlines, no shine. ${n} components, each with anatomy, states, and accessibility.`, all: 'See all' },
    charts: { title: 'Data you can read at a glance', desc: 'Colors in a fixed order validated for color blindness, thin marks, and tooltips that work from the keyboard too. Every chart turns into a table with one click.', overview: 'See overview' },
    patterns: 'How the pieces fit together',
    roadmap: { title: 'From token to component', history: 'Version history' },
    footer: (colors, count, date) => `${colors} colors · ${count} semantic and foundation tokens · generated on ${date}`,
    brand: 'Brand color',
    theme: 'Theme',
  },
  {
    themes: { dark: 'Oscuro', light: 'Claro', refugio: 'Refúgio', system: 'Sistema' },
    stats: ['colores en OKLCH', 'tokens de color', 'estilos de texto', 'íconos propios', 'contrastes WCAG'],
    statsLabel: 'El sistema en números',
    ready: 'Listo',
    kpi: 'Ingresos',
    previews: {
      button: ['Botón', 'Primario plano, contorno, ghost y de ícono.', 'Crear', 'Cancelar'],
      chip: ['Chip', 'Píldora con contorno que se vuelve selector.', 'Directo', 'Oscuro'],
      menu: ['Menú', 'Lista de opciones con selección y teclado.', 'Oscuro', 'Claro'],
      panel: ['Panel', 'Etiqueta, título, controles y secciones.', 'Apertura', 'Detalles'],
    },
    hero: {
      title: 'Construyamos con refinamiento.',
      lead: 'Lume reúne tokens, tipografía, íconos, componentes y gráficos para que cada pantalla nazca consistente, accesible y cuidada en los detalles.',
      start: 'Empezar ahora',
      components: 'Ver componentes',
      try: 'Pruébalo en vivo',
    },
    collage: {
      eyebrow: 'Ejemplo',
      title: (v) => `Lanzamiento de la versión ${v}`,
      tone: 'Tono directo',
      dark: 'Oscuro',
      section: 'Fundamentos listos',
      text: 'Color, tipografía e íconos ya están en tokens, en los tres temas.',
      demo: 'Ver demostración',
      template: 'Elegir plantilla',
      examples: 'Ejemplos',
      badges: ['Listo', 'Nuevo', 'Beta'],
      search: 'Buscar',
    },
    foundations: { title: 'Las decisiones que lo sostienen todo', desc: 'Cada decisión visual se vuelve un token. Los componentes solo consumen tokens — por eso todo el sistema cambia cuando cambia la marca.' },
    components: { title: 'Planos, tranquilos y precisos', desc: (n) => `Contornos finos, nada de brillo. ${n} componentes, cada uno con anatomía, estados y accesibilidad.`, all: 'Ver todos' },
    charts: { title: 'Datos que se leen de un vistazo', desc: 'Colores en un orden fijo validado para daltonismo, marcas finas y tooltip también con el teclado. Todo gráfico se vuelve tabla con un clic.', overview: 'Ver visión general' },
    patterns: 'Cómo encajan las piezas',
    roadmap: { title: 'Del token al componente', history: 'Historial de versiones' },
    footer: (colors, count, date) => `${colors} colores · ${count} tokens semánticos y de fundación · generado el ${date}`,
    brand: 'Color de marca',
    theme: 'Tema',
  },
);

/* ───────── Dados ───────── */

const group = (id) => navigation.find((g) => g.id === id);
const items = (id) => group(id).items;

const THEME_ICONS = { refugio: 'mountain', dark: 'moon', light: 'sun', system: 'monitor' };
const themes = (c) => Object.entries(THEME_ICONS).map(([value, ic]) => ({ value, label: c.themes[value], icon: ic }));

const colorCount = palettes.reduce((n, p) => n + p.steps.length, 0);
const passed = contrast.filter((c) => c.pass).length;

const stats = (c) =>
  [
    colorCount,
    tokens.filter((t) => t.type === 'color' && t.themed).length,
    tokens.filter((t) => t.type === 'typography').length,
    iconList.length,
    `${passed}/${contrast.length}`,
  ].map((value, i) => [value, c.stats[i]]);

// o card não cresce a cada lançamento: mostra as versões recentes que cabem na altura do card ao lado
// (fitRoadmap) e as próximas; o histórico inteiro fica em Novidades
const ROADMAP_MAX = 6;
const ROADMAP_MIN = 2;
const roadmap = (c) => [
  ...releases.slice(0, ROADMAP_MAX).reverse().map((r) => [`v${r.version.replace(/\.0$/, '')}`, r.title, ['success', c.ready], r.summary, true]),
  ...upcoming.map((u) => [`v${u.version}`, u.title, u.status, `${u.text} ${u.items.join(', ')}.`, false]),
];

/** Esconde as versões mais antigas até o roadmap caber na altura natural do card de padrões (lado a lado). */
function fitRoadmap(split) {
  const [list, card] = split.children;
  const recent = [...card.querySelectorAll('[data-recent]')];
  recent.forEach((item) => (item.hidden = false));
  const sideBySide = getComputedStyle(split).gridTemplateColumns.split(' ').length > 1;
  // altura do conteúdo sem o esticamento da grade: do topo do card ao fim do último filho, mais o respiro de baixo
  const natural = (el, last) => last.getBoundingClientRect().bottom - el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingBottom);
  const listHeight = natural(list, list.lastElementChild);
  const link = card.querySelector(':scope > .ds-inline-action');
  const roadmapHeight = () => natural(card, card.querySelector('.home-roadmap')) + link.offsetHeight + parseFloat(getComputedStyle(card.querySelector('.home-roadmap')).marginBottom);
  let shown = recent.length;
  if (!sideBySide) {
    // um embaixo do outro, a altura não importa: as 3 mais recentes bastam
    while (shown > 3) recent[recent.length - shown--].hidden = true;
    return;
  }
  // tira a mais antiga só enquanto passar da altura deixar mais sobra do que o vão que ficaria sem ela
  while (shown > ROADMAP_MIN) {
    const over = roadmapHeight() - listHeight;
    const oldest = recent[recent.length - shown];
    const step = oldest.offsetHeight + parseFloat(getComputedStyle(oldest.parentElement).rowGap);
    if (over <= 0 || over < step - over) break;
    oldest.hidden = true;
    shown--;
  }
}

/* ───────── Prévias visuais dos fundamentos (só tokens, sem imagens) ───────── */

const swatchRow = (palette, steps) => `<div class="pv-colors__row">${steps.map((s) => `<span style="background:var(--ds-color-${palette}-${s})"></span>`).join('')}</div>`;
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

const previews = {
  '/fundamentos/cores': () => `<div class="pv pv-colors">
      ${swatchRow('brand', STEPS)}
      ${swatchRow('neutral', STEPS)}
      <div class="pv-colors__row">${['red', 'amber', 'green', 'teal', 'blue', 'violet', 'pink', 'clay'].map((p) => `<span style="background:var(--ds-color-${p}-400)"></span>`).join('')}</div>
    </div>`,
  '/fundamentos/tipografia': () => `<div class="pv pv-type"><span class="pv-type__aa">Aa</span><span class="pv-type__meta">Geist Serif<br>Geist Sans</span></div>`,
  '/fundamentos/icones': () => `<div class="pv pv-icons">${['home', 'search', 'palette', 'layers', 'bell', 'star', 'calendar', 'settings'].map((n) => icon(n, { size: 22 })).join('')}</div>`,
  '/fundamentos/espacamento': () => `<div class="pv pv-space">${['050', '100', '200', '300', '400', '600', '800'].map((s) => `<span style="width:var(--ds-space-${s})"></span>`).join('')}</div>`,
  '/fundamentos/raios': () => `<div class="pv pv-radius">${['xs', 'md', 'xl', 'full'].map((r) => `<span style="border-radius:var(--ds-radius-${r})"></span>`).join('')}</div>`,
  '/fundamentos/elevacao': () => `<div class="pv pv-elevation"><span></span><span></span><span></span></div>`,
  '/fundamentos/movimento': () => `<div class="pv pv-motion"><svg viewBox="0 0 160 80" aria-hidden="true"><path class="pv-motion__grid" d="M0 79.5H160M.5 0V80"/><path class="pv-motion__curve" d="M4 76C36 76 4 4 156 4"/><circle class="pv-motion__dot" cx="156" cy="4" r="4"/></svg></div>`,
  '/fundamentos/layout': () => `<div class="pv pv-layout"><span class="pv-layout__side"></span><span class="pv-layout__main"><i></i><i></i><i></i></span></div>`,
};

/* ───────── Prévias dos gráficos (SVG estático, cores dos tokens de gráfico) ───────── */

const series = (n) => `var(--ds-color-chart-series-${n})`;
const BARS = [38, 52, 46, 64, 58, 72, 80];
const LINE_A = [44, 40, 46, 36, 30, 32, 22, 16];
const LINE_B = [56, 54, 52, 50, 46, 46, 42, 40];
const HEAT = [
  [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
  [1, 3, 4, 6, 7, 7, 6, 4, 3, 2],
  [2, 3, 5, 6, 7, 6, 6, 5, 3, 1],
  [0, 1, 2, 3, 4, 4, 3, 2, 1, 0],
];
const DOTS = [[22, 60, 1], [34, 48, 1], [46, 54, 2], [58, 36, 1], [70, 42, 2], [82, 30, 1], [94, 38, 2], [106, 22, 1], [118, 28, 2], [130, 18, 1], [52, 64, 2], [88, 52, 1], [124, 40, 2]];
const pts = (values, step = 20, x0 = 10) => values.map((v, i) => `${x0 + i * step},${v}`).join(' ');

const chartPreviews = {
  '/graficos/barras': () => `<svg class="pv-chart" viewBox="0 0 160 88">
      <path class="pv-chart__axis" d="M8 80.5H152"/>
      ${BARS.map((h, i) => `<rect x="${14 + i * 20}" y="${80 - h}" width="12" height="${h}" rx="3" style="fill:${series(1)}"/>`).join('')}
    </svg>`,
  '/graficos/linhas': () => `<svg class="pv-chart" viewBox="0 0 160 88">
      <path class="pv-chart__grid" d="M8 20.5H152M8 50.5H152"/><path class="pv-chart__axis" d="M8 80.5H152"/>
      <polyline class="pv-chart__line" points="${pts(LINE_B)}" style="stroke:var(--ds-color-chart-muted)"/>
      <polyline class="pv-chart__line" points="${pts(LINE_A)}" style="stroke:${series(1)}"/>
      <circle class="pv-chart__dot" cx="150" cy="16" r="4" style="fill:${series(1)}"/>
    </svg>`,
  '/graficos/rosca': () => {
    const parts = [0.46, 0.28, 0.15, 0.11];
    const C = 2 * Math.PI * 28;
    let acc = 0;
    return `<svg class="pv-chart" viewBox="0 0 160 88">
      ${parts.map((p, i) => {
        const len = p * C - 3;
        const seg = `<circle cx="80" cy="44" r="28" fill="none" stroke-width="11" style="stroke:${series(i + 1)}" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-acc * C).toFixed(1)}" transform="rotate(-90 80 44)"/>`;
        acc += p;
        return seg;
      }).join('')}
    </svg>`;
  },
  '/graficos/heatmap': () => `<svg class="pv-chart" viewBox="0 0 160 88">
      ${HEAT.map((row, r) => row.map((v, c) => `<rect x="${12 + c * 14}" y="${12 + r * 17}" width="12" height="15" rx="3" style="fill:${v ? `var(--ds-color-chart-seq-${v})` : 'var(--ds-color-chart-grid)'}"/>`).join('')).join('')}
    </svg>`,
  '/graficos/dispersao': () => `<svg class="pv-chart" viewBox="0 0 160 88">
      <path class="pv-chart__axis" d="M12 80.5H152M12.5 8V80"/>
      ${DOTS.map(([x, y, s]) => `<circle class="pv-chart__dot" cx="${x + 8}" cy="${y}" r="4" style="fill:${series(s)}"/>`).join('')}
    </svg>`,
  // valores formatados no idioma atual (R$ 1,3 mi · R$1.3M · 1,3 M R$)
  '/graficos/indicadores': () => `<div class="pv pv-kpi">
      <span class="pv-kpi__label">${tr(COPY).kpi}</span>
      <span class="pv-kpi__value">${numberFormat({ style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 }).format(1300000)}</span>
      <span class="pv-kpi__delta">${icon('trending-up', { size: 14 })}${numberFormat({ style: 'percent', maximumFractionDigits: 1, signDisplay: 'always' }).format(0.124)}</span>
      <span class="pv-kpi__meter"><span></span></span>
    </div>`,
};

/* ───────── Prévias dos componentes (componentes reais, inertes) ───────── */

const chev = `<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>`;

const componentPreviews = ({ previews: p }) => [
  ['/componentes/botao', p.button[0], p.button[1], `<div class="pv pv-stack">
      <span class="ds-btn ds-btn--primary ds-btn--sm">${icon('pencil', { size: 16 })}${p.button[2]}</span>
      <span class="ds-btn ds-btn--secondary ds-btn--sm">${p.button[3]}</span>
      <span class="ds-icon-btn ds-icon-btn--outline">${icon('more-horizontal')}</span>
    </div>`],
  ['/componentes/chip', p.chip[0], p.chip[1], `<div class="pv pv-stack">
      <span class="ds-chip"><span class="ds-chip__icon">${icon('pencil', { size: 16 })}</span>${p.chip[2]}${chev}</span>
      <span class="ds-chip">${p.chip[3]}${chev}</span>
    </div>`],
  ['/componentes/menu', p.menu[0], p.menu[1], `<div class="pv pv-menu">
      <div class="pv-menu__list">
        <span class="ds-menu__item" aria-checked="true">${icon('moon', { size: 18 })}<span>${p.menu[2]}</span>${icon('check', { size: 16, className: 'ds-menu__check' })}</span>
        <span class="ds-menu__item">${icon('sun', { size: 18 })}<span>${p.menu[3]}</span></span>
      </div>
    </div>`],
  ['/componentes/painel', p.panel[0], p.panel[1], `<div class="pv pv-panel">
      <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>${p.panel[2]}</span></p>
      <span class="pv-panel__line"></span><span class="pv-panel__line pv-panel__line--short"></span>
      <span class="ds-inline-action">${icon('file-text', { size: 16 })}${p.panel[3]}${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span>
    </div>`],
];

const listItems = (list) => `<ul class="home-list__items" role="list">
  ${list
    .map(
      (p) => `<li><a class="home-list__item" href="#${p.path}">
        <span class="home-list__icon">${icon(p.icon, { size: 20 })}</span>
        <span class="home-list__text"><span class="home-list__label">${p.label}</span><span class="home-list__desc">${p.description}</span></span>
        ${icon('chevron-right', { size: 18, className: 'home-list__chevron' })}
      </a></li>`,
    )
    .join('')}
</ul>`;

/* ───────── Página ───────── */

export default function renderHome() {
  const c = tr(COPY);
  const generated = dateFormat({ day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(generatedAt));
  return `
  <div class="page page--home">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__content">
        <h1 class="home-hero__title" id="home-title">${c.hero.title}</h1>
        <p class="home-hero__lead">${c.hero.lead}</p>
        <div class="home-hero__actions">
          <a class="ds-btn ds-btn--primary ds-btn--lg" href="#/primeiros-passos">${icon('zap', { size: 20 })}${c.hero.start}</a>
          <a class="ds-btn ds-btn--secondary ds-btn--lg" href="#/componentes/botao">${c.hero.components}</a>
        </div>
        <div class="home-hero__try">
          <span>${c.hero.try}</span>
          <button type="button" class="ds-chip" data-menu="brand"><span class="ds-chip__icon">${icon('palette', { size: 16 })}</span><span data-label>${brandLabel(getBrand())}</span>${chev}</button>
          <button type="button" class="ds-chip" data-menu="theme"><span class="ds-chip__icon">${icon('moon', { size: 16 })}</span><span data-label>${c.themes.dark}</span>${chev}</button>
        </div>
      </div>

      <div class="home-collage" aria-hidden="true" inert>
        <div class="collage-card collage-card--wide">
          <div class="collage-card__head">
            <div>
              <p class="ds-panel__eyebrow">${c.collage.eyebrow}</p>
              <p class="collage-card__title">${c.collage.title(CURRENT_VERSION.replace(/\.0$/, ''))}</p>
            </div>
            <div class="collage-card__icons"><span class="ds-icon-btn">${icon('stack')}</span><span class="ds-icon-btn">${icon('x')}</span></div>
          </div>
          <div class="collage-card__chips">
            <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>${c.collage.tone}${chev}</span>
            <span class="ds-chip ds-chip--sm">${c.collage.dark}${chev}</span>
            <span class="collage-card__meta">~3 min</span>
          </div>
          <p class="ds-section__head"><span class="ds-section__stamp">01</span><span>${c.collage.section}</span></p>
          <p class="collage-card__text">${c.collage.text}</p>
          <span class="ds-inline-action">${icon('video', { size: 16 })}${c.collage.demo}${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span>
        </div>
        <div class="collage-card">
          <div class="collage-card__buttons">
            <span class="ds-btn ds-btn--primary">${icon('video', { size: 18 })}${c.collage.template}</span>
            <span class="ds-btn ds-btn--ghost">${icon('star', { size: 18 })}${c.collage.examples}</span>
          </div>
        </div>
        <div class="collage-card">
          <div class="collage-card__badges">
            <span class="ds-badge ds-badge--success"><span class="ds-badge__dot"></span>${c.collage.badges[0]}</span>
            <span class="ds-badge ds-badge--brand">${c.collage.badges[1]}</span>
            <span class="ds-badge">${c.collage.badges[2]}</span>
          </div>
          <div class="ds-field collage-card__field">${icon('search', { size: 18 })}<span class="ds-field__placeholder">${c.collage.search}</span><kbd class="ds-kbd">⌘K</kbd></div>
        </div>
      </div>
    </section>

    <section class="home-stats" aria-label="${c.statsLabel}">
      ${stats(c).map(([value, label]) => `<div class="home-stat"><p class="home-stat__value">${value}</p><p class="home-stat__label">${label}</p></div>`).join('')}
    </section>

    <section class="home-section" aria-labelledby="fundamentos-title">
      <header class="home-section__header">
        <div>
          <p class="home-section__eyebrow">${group('fundamentos').label}</p>
          <h2 class="home-section__title" id="fundamentos-title">${c.foundations.title}</h2>
          <p class="home-section__desc">${c.foundations.desc}</p>
        </div>
      </header>
      <div class="tile-grid">
        ${items('fundamentos')
          .map(
            (item) => `<a class="tile" href="#${item.path}">
              <span class="tile__preview" aria-hidden="true">${previews[item.path]?.() ?? icon(item.icon, { size: 28 })}</span>
              <span class="tile__title">${item.label}${icon('arrow-up-right', { size: 18, className: 'tile__arrow' })}</span>
              <span class="tile__desc">${item.description}</span>
            </a>`,
          )
          .join('')}
      </div>
    </section>

    <section class="home-section" aria-labelledby="componentes-title">
      <header class="home-section__header">
        <div>
          <p class="home-section__eyebrow">${group('componentes').label}</p>
          <h2 class="home-section__title" id="componentes-title">${c.components.title}</h2>
          <p class="home-section__desc">${c.components.desc(items('componentes').length)}</p>
        </div>
        <a class="ds-btn ds-btn--ghost" href="#/componentes/botao">${c.components.all}${icon('arrow-right', { size: 18 })}</a>
      </header>
      <div class="tile-grid tile-grid--4">
        ${componentPreviews(c)
          .map(
            ([href, label, desc, preview]) => `<a class="tile" href="#${href}">
              <span class="tile__preview" aria-hidden="true" inert>${preview}</span>
              <span class="tile__title">${label}${icon('arrow-up-right', { size: 18, className: 'tile__arrow' })}</span>
              <span class="tile__desc">${desc}</span>
            </a>`,
          )
          .join('')}
      </div>
    </section>

    <section class="home-section" aria-labelledby="graficos-title">
      <header class="home-section__header">
        <div>
          <p class="home-section__eyebrow">${group('graficos').label}</p>
          <h2 class="home-section__title" id="graficos-title">${c.charts.title}</h2>
          <p class="home-section__desc">${c.charts.desc}</p>
        </div>
        <a class="ds-btn ds-btn--ghost" href="#/graficos/visao-geral">${c.charts.overview}${icon('arrow-right', { size: 18 })}</a>
      </header>
      <div class="tile-grid tile-grid--3">
        ${items('graficos')
          .filter((item) => item.path !== '/graficos/visao-geral')
          .map(
            (item) => `<a class="tile" href="#${item.path}">
              <span class="tile__preview" aria-hidden="true" inert>${chartPreviews[item.path]?.() ?? icon(item.icon, { size: 28 })}</span>
              <span class="tile__title">${item.label}${icon('arrow-up-right', { size: 18, className: 'tile__arrow' })}</span>
              <span class="tile__desc">${item.description}</span>
            </a>`,
          )
          .join('')}
      </div>
    </section>

    <div class="home-split">
      <section class="ds-card home-list" aria-labelledby="padroes-title">
        <p class="home-section__eyebrow">${group('padroes').label}</p>
        <h2 class="home-list__title" id="padroes-title">${c.patterns}</h2>
        ${listItems(items('padroes'))}
        <p class="home-section__eyebrow home-list__eyebrow">${group('recursos').label}</p>
        ${listItems(items('recursos'))}
      </section>

      <section class="ds-card home-list" aria-labelledby="novidades-title">
        <p class="home-section__eyebrow">Roadmap</p>
        <h2 class="home-list__title" id="novidades-title">${c.roadmap.title}</h2>
        <ol class="home-roadmap" role="list">
          ${roadmap(c)
            .map(
              ([stamp, title, [tone, status], text, recent]) => `<li class="home-roadmap__item"${recent ? ' data-recent' : ''}>
                <p class="ds-section__head"><span class="ds-section__stamp">${stamp}</span><span class="home-roadmap__title">${title}</span><span class="ds-badge ds-badge--sm${tone === 'neutral' ? '' : ` ds-badge--${tone}`}">${status}</span></p>
                <p class="home-roadmap__text">${text}</p>
              </li>`,
            )
            .join('')}
        </ol>
        <a class="ds-inline-action" href="#/novidades">${icon('history', { size: 16 })}${c.roadmap.history}${icon('arrow-right', { size: 14 })}</a>
      </section>
    </div>

    <footer class="site-footer">
      <p>Lume Design System · v${CURRENT_VERSION}</p>
      <p>${c.footer(colorCount, tokens.length, generated)}</p>
    </footer>
  </div>`;
}

export function mount(root) {
  const c = tr(COPY);
  const THEMES = themes(c);
  const brandChip = root.querySelector('[data-menu="brand"]');
  const themeChip = root.querySelector('[data-menu="theme"]');
  const setLabel = (chip, options, value) => {
    const option = options.find((o) => o.value === value);
    chip.querySelector('[data-label]').textContent = option?.label ?? '';
    if (option?.icon) chip.querySelector('.ds-chip__icon').innerHTML = icon(option.icon, { size: 16 });
  };

  const brandMenu = attachMenu(brandChip, {
    label: c.brand,
    value: getBrand(),
    options: brandOptions(),
    onChange: (value) => {
      applyBrand(value);
      setLabel(brandChip, brandOptions(), value);
    },
  });

  setLabel(themeChip, THEMES, getThemePreference());
  const themeMenu = attachMenu(themeChip, {
    label: c.theme,
    value: getThemePreference(),
    options: THEMES,
    onChange: (value) => setTheme(value),
  });
  const onTheme = (event) => {
    themeMenu.setValue(event.detail.preference);
    setLabel(themeChip, THEMES, event.detail.preference);
  };
  document.documentElement.addEventListener('ds:themechange', onTheme);

  // refaz a conta quando a largura muda (o texto quebra diferente) e quando as fontes chegam
  const split = root.querySelector('.home-split');
  let width = 0;
  const fit = new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === width) return;
    width = entry.contentRect.width;
    fitRoadmap(split);
  });
  fit.observe(split);
  document.fonts.ready.then(() => split.isConnected && fitRoadmap(split));

  return () => {
    brandMenu.destroy();
    themeMenu.destroy();
    fit.disconnect();
    document.documentElement.removeEventListener('ds:themechange', onTheme);
  };
}
