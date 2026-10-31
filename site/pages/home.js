import { icon, iconList } from '../../ds/icons/icons.js';
import { palettes, tokens, contrast, generatedAt } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { getThemePreference, setTheme } from '../../ds/js/theme.js';
import { navigation } from '../nav.js';
import { BRANDS, applyBrand, getBrand, brandOptions } from '../brand.js';
import { releases, upcoming, CURRENT_VERSION } from '../changelog.js';

/* ───────── Dados ───────── */

const group = (id) => navigation.find((g) => g.id === id);
const fundamentos = group('fundamentos').items;
const componentes = group('componentes').items;
const padroes = group('padroes').items;
const recursos = group('recursos').items;
const graficos = group('graficos').items.filter((item) => item.path !== '/graficos/visao-geral');

const THEMES = [
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'system', label: 'Sistema', icon: 'monitor' },
];

const colorCount = palettes.reduce((n, p) => n + p.steps.length, 0);
const passed = contrast.filter((c) => c.pass).length;
const generated = new Date(generatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const stats = [
  [colorCount, 'cores em OKLCH'],
  [tokens.filter((t) => t.type === 'color' && t.themed).length, 'tokens de cor'],
  [tokens.filter((t) => t.type === 'typography').length, 'estilos de texto'],
  [iconList.length, 'ícones próprios'],
  [`${passed}/${contrast.length}`, 'contrastes WCAG'],
];

const roadmap = [
  ...[...releases].reverse().map((r) => [`v${r.version.replace(/\.0$/, '')}`, r.title, ['success', 'Pronto'], r.summary]),
  ...upcoming.map((u) => [`v${u.version}`, u.title, u.status, `${u.text} ${u.items.join(', ')}.`]),
];

/* ───────── Prévias visuais dos fundamentos (só tokens, sem imagens) ───────── */

const swatchRow = (palette, steps) => `<div class="pv-colors__row">${steps.map((s) => `<span style="background:var(--ds-color-${palette}-${s})"></span>`).join('')}</div>`;
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

const previews = {
  '/fundamentos/cores': () => `<div class="pv pv-colors">
      ${swatchRow('brand', STEPS)}
      ${swatchRow('neutral', STEPS)}
      <div class="pv-colors__row">${['red', 'amber', 'green', 'teal', 'blue', 'violet', 'pink', 'clay'].map((p) => `<span style="background:var(--ds-color-${p}-400)"></span>`).join('')}</div>
    </div>`,
  '/fundamentos/tipografia': () => `<div class="pv pv-type"><span class="pv-type__aa">Aa</span><span class="pv-type__meta">Inter Tight<br>Inter</span></div>`,
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
  '/graficos/indicadores': () => `<div class="pv pv-kpi">
      <span class="pv-kpi__label">Receita</span>
      <span class="pv-kpi__value">R$ 1,3 mi</span>
      <span class="pv-kpi__delta">${icon('trending-up', { size: 14 })}+12,4%</span>
      <span class="pv-kpi__meter"><span></span></span>
    </div>`,
};

/* ───────── Prévias dos componentes (componentes reais, inertes) ───────── */

const chev = `<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>`;

const componentPreviews = [
  ['/componentes/botao', 'Botão', 'Primário chapado, contorno, ghost e de ícone.', `<div class="pv pv-stack">
      <span class="ds-btn ds-btn--primary ds-btn--sm">${icon('pencil', { size: 16 })}Criar</span>
      <span class="ds-btn ds-btn--secondary ds-btn--sm">Cancelar</span>
      <span class="ds-icon-btn ds-icon-btn--outline">${icon('more-horizontal')}</span>
    </div>`],
  ['/componentes/chip', 'Chip', 'Pílula com contorno que vira seletor.', `<div class="pv pv-stack">
      <span class="ds-chip"><span class="ds-chip__icon">${icon('pencil', { size: 16 })}</span>Direto${chev}</span>
      <span class="ds-chip">Escuro${chev}</span>
    </div>`],
  ['/componentes/menu', 'Menu', 'Lista de opções com seleção e teclado.', `<div class="pv pv-menu">
      <div class="pv-menu__list">
        <span class="ds-menu__item" aria-checked="true">${icon('moon', { size: 18 })}<span>Escuro</span>${icon('check', { size: 16, className: 'ds-menu__check' })}</span>
        <span class="ds-menu__item">${icon('sun', { size: 18 })}<span>Claro</span></span>
      </div>
    </div>`],
  ['/componentes/painel', 'Painel', 'Rótulo, título, controles e seções.', `<div class="pv pv-panel">
      <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>Abertura</span></p>
      <span class="pv-panel__line"></span><span class="pv-panel__line pv-panel__line--short"></span>
      <span class="ds-inline-action">${icon('file-text', { size: 16 })}Detalhes${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span>
    </div>`],
];

const listItems = (items) => `<ul class="home-list__items" role="list">
  ${items
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
  return `
  <div class="page page--home">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__content">
        <h1 class="home-hero__title" id="home-title">Vamos construir com refinamento.</h1>
        <p class="home-hero__lead">O Órbita reúne tokens, tipografia, ícones, componentes e gráficos para que cada tela nasça consistente, acessível e cuidada nos detalhes.</p>
        <div class="home-hero__actions">
          <a class="ds-btn ds-btn--primary ds-btn--lg" href="#/primeiros-passos">${icon('zap', { size: 20 })}Começar agora</a>
          <a class="ds-btn ds-btn--secondary ds-btn--lg" href="#/componentes/botao">Ver componentes</a>
        </div>
        <div class="home-hero__try">
          <span>Experimente ao vivo</span>
          <button type="button" class="ds-chip" data-menu="brand"><span class="ds-chip__icon">${icon('palette', { size: 16 })}</span><span data-label>Pêssego</span>${chev}</button>
          <button type="button" class="ds-chip" data-menu="theme"><span class="ds-chip__icon">${icon('moon', { size: 16 })}</span><span data-label>Escuro</span>${chev}</button>
        </div>
      </div>

      <div class="home-collage" aria-hidden="true" inert>
        <div class="collage-card collage-card--wide">
          <div class="collage-card__head">
            <div>
              <p class="ds-panel__eyebrow">Exemplo</p>
              <p class="collage-card__title">Lançamento da versão ${CURRENT_VERSION.replace(/\.0$/, '')}</p>
            </div>
            <div class="collage-card__icons"><span class="ds-icon-btn">${icon('stack')}</span><span class="ds-icon-btn">${icon('x')}</span></div>
          </div>
          <div class="collage-card__chips">
            <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>Tom direto${chev}</span>
            <span class="ds-chip ds-chip--sm">Escuro${chev}</span>
            <span class="collage-card__meta">~3 min</span>
          </div>
          <p class="ds-section__head"><span class="ds-section__stamp">01</span><span>Fundamentos prontos</span></p>
          <p class="collage-card__text">Cores, tipografia e ícones já estão em tokens, nos dois temas.</p>
          <span class="ds-inline-action">${icon('video', { size: 16 })}Ver demonstração${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span>
        </div>
        <div class="collage-card">
          <div class="collage-card__buttons">
            <span class="ds-btn ds-btn--primary">${icon('video', { size: 18 })}Escolher modelo</span>
            <span class="ds-btn ds-btn--ghost">${icon('star', { size: 18 })}Exemplos</span>
          </div>
        </div>
        <div class="collage-card">
          <div class="collage-card__badges">
            <span class="ds-badge ds-badge--success"><span class="ds-badge__dot"></span>Pronto</span>
            <span class="ds-badge ds-badge--brand">Novo</span>
            <span class="ds-badge">Beta</span>
          </div>
          <div class="ds-field collage-card__field">${icon('search', { size: 18 })}<span class="ds-field__placeholder">Buscar</span><kbd class="ds-kbd">⌘K</kbd></div>
        </div>
      </div>
    </section>

    <section class="home-stats" aria-label="O sistema em números">
      ${stats.map(([value, label]) => `<div class="home-stat"><p class="home-stat__value">${value}</p><p class="home-stat__label">${label}</p></div>`).join('')}
    </section>

    <section class="home-section" aria-labelledby="fundamentos-title">
      <header class="home-section__header">
        <div>
          <p class="home-section__eyebrow">Fundamentos</p>
          <h2 class="home-section__title" id="fundamentos-title">As decisões que sustentam tudo</h2>
          <p class="home-section__desc">Cada decisão visual vira um token. Os componentes só consomem tokens — por isso o sistema muda inteiro quando a marca muda.</p>
        </div>
      </header>
      <div class="tile-grid">
        ${fundamentos
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
          <p class="home-section__eyebrow">Componentes</p>
          <h2 class="home-section__title" id="componentes-title">Planos, calmos e precisos</h2>
          <p class="home-section__desc">Contornos finos, nada de brilho. ${componentes.length} componentes, cada um com anatomia, estados e acessibilidade.</p>
        </div>
        <a class="ds-btn ds-btn--ghost" href="#/componentes/botao">Ver todos${icon('arrow-right', { size: 18 })}</a>
      </header>
      <div class="tile-grid tile-grid--4">
        ${componentPreviews
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
          <p class="home-section__eyebrow">Gráficos</p>
          <h2 class="home-section__title" id="graficos-title">Dados que se leem de relance</h2>
          <p class="home-section__desc">Cores em ordem fixa validadas para daltonismo, marcas finas e tooltip também no teclado. Todo gráfico vira tabela com um clique.</p>
        </div>
        <a class="ds-btn ds-btn--ghost" href="#/graficos/visao-geral">Ver visão geral${icon('arrow-right', { size: 18 })}</a>
      </header>
      <div class="tile-grid tile-grid--3">
        ${graficos
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
        <p class="home-section__eyebrow">Padrões</p>
        <h2 class="home-list__title" id="padroes-title">Como as peças se encaixam</h2>
        ${listItems(padroes)}
        <p class="home-section__eyebrow home-list__eyebrow">Recursos</p>
        ${listItems(recursos)}
      </section>

      <section class="ds-card home-list" aria-labelledby="novidades-title">
        <p class="home-section__eyebrow">Roadmap</p>
        <h2 class="home-list__title" id="novidades-title">Do token ao componente</h2>
        <ol class="home-roadmap" role="list">
          ${roadmap
            .map(
              ([stamp, title, [tone, status], text]) => `<li class="home-roadmap__item">
                <p class="ds-section__head"><span class="ds-section__stamp">${stamp}</span><span class="home-roadmap__title">${title}</span><span class="ds-badge ds-badge--sm${tone === 'neutral' ? '' : ` ds-badge--${tone}`}">${status}</span></p>
                <p class="home-roadmap__text">${text}</p>
              </li>`,
            )
            .join('')}
        </ol>
        <a class="ds-inline-action" href="#/novidades">${icon('history', { size: 16 })}Histórico de versões${icon('arrow-right', { size: 14 })}</a>
      </section>
    </div>

    <footer class="site-footer">
      <p>Órbita Design System · v${CURRENT_VERSION}</p>
      <p>${colorCount} cores · ${tokens.length} tokens semânticos e de fundação · gerado em ${generated}</p>
    </footer>
  </div>`;
}

export function mount(root) {
  const brandChip = root.querySelector('[data-menu="brand"]');
  const themeChip = root.querySelector('[data-menu="theme"]');
  const setLabel = (chip, options, value) => {
    const option = options.find((o) => o.value === value);
    chip.querySelector('[data-label]').textContent = option?.label ?? '';
    if (option?.icon) chip.querySelector('.ds-chip__icon').innerHTML = icon(option.icon, { size: 16 });
  };

  setLabel(brandChip, BRANDS, getBrand());
  const brandMenu = attachMenu(brandChip, {
    label: 'Cor da marca',
    value: getBrand(),
    options: brandOptions(),
    onChange: (value) => {
      applyBrand(value);
      setLabel(brandChip, BRANDS, value);
    },
  });

  setLabel(themeChip, THEMES, getThemePreference());
  const themeMenu = attachMenu(themeChip, {
    label: 'Tema',
    value: getThemePreference(),
    options: THEMES,
    onChange: (value) => setTheme(value),
  });
  const onTheme = (event) => {
    themeMenu.setValue(event.detail.preference);
    setLabel(themeChip, THEMES, event.detail.preference);
  };
  document.documentElement.addEventListener('ds:themechange', onTheme);

  return () => {
    brandMenu.destroy();
    themeMenu.destroy();
    document.documentElement.removeEventListener('ds:themechange', onTheme);
  };
}
