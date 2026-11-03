import { icon } from '../../ds/icons/icons.js';
import { tokens, palettes } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { tr, locale } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock } from '../component-doc.js';
import { applyBrand, getBrand, brandOptions, brandLabel } from '../brand.js';
import { T } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/primeiros-passos.css'];

/* ───────── Textos ───────── */

const code = (s) => `<code class="ds-inline-code">${s}</code>`;

const COPY = T(
  {
    lead: 'Sem dependências e sem build obrigatório: um CSS, os módulos que você usar e pronto.',
    stats: ['dependências', 'arquivo de CSS', 'tokens', 'temas'],
    onThisPage: 'Nesta página',
    nav: ['Instalação', 'Primeira tela', 'Tokens', 'JavaScript', 'Sua marca', 'Estrutura', 'Próximos passos'],
    install: { title: 'Instalação', desc: 'Quatro passos. Nenhum precisa de terminal além do primeiro.', step: (n) => `Passo ${n}: ` },
    steps: [
      ['Copie o design system', `O Lume não tem dependências nem build obrigatório. Leve a pasta ${code('ds/')} para o seu projeto.`],
      ['Carregue as fontes e o CSS', 'Um arquivo só traz tokens, base e todos os componentes. As fontes vêm do Google Fonts.'],
      ['Escolha o tema', `Escuro é o padrão da marca. Use ${code('light')} para o claro ou ${code('system')} para seguir o sistema.`],
      ['Ligue só o JavaScript que usar', 'Componentes visuais funcionam só com CSS. Os interativos têm um módulo cada — importe e ligue os que a tela usa.'],
    ],
    first: { title: 'Sua primeira tela', desc: 'Escolha um ponto de partida, veja nos dois temas e copie. O código abaixo é exatamente o que está no palco.' },
    tokens: { title: 'Usando tokens', desc: 'No seu CSS, use sempre um token semântico — nunca um valor solto. Assim o tema, a marca e a densidade mudam sem tocar no seu código.' },
    tokenGroups: ['Cor', 'Texto', 'Espaço', 'Raio', 'Sombra', 'Movimento', 'Layout'],
    js: { title: 'Módulos JavaScript', desc: 'Cada componente interativo tem o seu módulo, sem dependência entre eles. Importe só o que a tela usa.', head: ['Módulo', 'Para quê', 'Como ligar'], docsOf: (f) => `Documentação de ${f}`, docs: 'Ver documentação' },
    modules: ['Ícones como <ds-icon> e a função icon()', 'Tema escuro, claro ou do sistema', 'Dicas por data-ds-tooltip', 'Menus que abrem de um gatilho', 'Seleção com lista própria', 'Abas com teclado', 'Modal e confirmação', 'Avisos rápidos e cópia', 'Busca ⌘K', 'App shell com sidebar'],
    brand: {
      title: 'Use a sua marca',
      desc: 'A marca inteira sai de um matiz. Mude um número e o build recria a paleta, ajusta ao sRGB e confere o contraste de novo.',
      steps: [
        `Em ${code('tokens/palettes.json')}, troque o <strong>hue</strong> (e, se quiser, o <strong>chroma</strong>) da paleta ${code('brand')}.`,
        `Rode ${code('npm run tokens')} — ou deixe o ${code('npm run dev')} aberto, que ele refaz sozinho.`,
        'Veja o relatório de contraste no terminal. Se algo cair abaixo de 4,5:1, ajuste o token semântico.',
      ],
      try: 'Experimente agora',
      preview: ['Publicar', 'Novo', 'Ver detalhes'],
      menu: 'Cor da marca',
    },
    structure: { title: 'Estrutura', desc: `Onde cada coisa mora. Você edita ${code('tokens/')}; o resto é consumido.` },
    tree: ['ponto de entrada: tokens + base + componentes', 'gerado a partir de tokens/*.json — não edite', 'reset, tipografia base, foco', 'um CSS por componente', 'um módulo por componente interativo', 'biblioteca de ícones', 'a fonte da verdade: cores, tipografia, espaço…', 'gera tokens.css e confere o contraste'],
    next: {
      title: 'Próximos passos',
      cards: [
        ['Entenda os fundamentos', 'Cores, tipografia e espaço — as decisões por trás de tudo.'],
        ['Monte com componentes', 'Playground, código e acessibilidade de cada peça.'],
        ['Acompanhe as novidades', 'O que mudou em cada versão e o que vem por aí.'],
      ],
    },
    start: { label: 'Ponto de partida', options: ['Formulário', 'Painel', 'Lista de ajustes'] },
    examples: {
      form: ['Criar projeto', 'Nome do projeto', 'Ex.: Portal do cliente', 'Aparece no menu e nos convites.', 'Projeto privado', 'Criar projeto', 'Cancelar'],
      panel: ['Roteiro', 'Lançamento da versão 0.1', 'Fechar', 'Abertura', 'Comece pelo problema de quem vai ler e por que ele importa agora.', 'Publicar'],
      settings: ['Notificações', 'Comentários', 'Quando alguém responder você.', 'Resumo semanal', 'Toda segunda, por e-mail.'],
    },
  },
  {
    lead: 'No dependencies and no required build: one CSS file, the modules you use, and you’re done.',
    stats: ['dependencies', 'CSS file', 'tokens', 'themes'],
    onThisPage: 'On this page',
    nav: ['Installation', 'First screen', 'Tokens', 'JavaScript', 'Your brand', 'Structure', 'Next steps'],
    install: { title: 'Installation', desc: 'Four steps. Only the first one needs a terminal.', step: (n) => `Step ${n}: ` },
    steps: [
      ['Copy the design system', `Lume has no dependencies and no required build. Take the ${code('ds/')} folder into your project.`],
      ['Load the fonts and the CSS', 'A single file brings the tokens, the base, and every component. The fonts come from Google Fonts.'],
      ['Pick the theme', `Dark is the brand default. Use ${code('light')} for light or ${code('system')} to follow the system.`],
      ['Turn on only the JavaScript you use', 'Visual components work with CSS alone. Interactive ones have a module each — import and turn on the ones your screen uses.'],
    ],
    first: { title: 'Your first screen', desc: 'Pick a starting point, check it in both themes, and copy it. The code below is exactly what’s on the stage.' },
    tokens: { title: 'Using tokens', desc: 'In your CSS, always use a semantic token — never a loose value. That way the theme, the brand, and the density change without touching your code.' },
    tokenGroups: ['Color', 'Text', 'Space', 'Radius', 'Shadow', 'Motion', 'Layout'],
    js: { title: 'JavaScript modules', desc: 'Each interactive component has its own module, with no dependencies between them. Import only what your screen uses.', head: ['Module', 'What for', 'How to turn on'], docsOf: (f) => `${f} documentation`, docs: 'See documentation' },
    modules: ['Icons as <ds-icon> and the icon() function', 'Dark, light, or system theme', 'Hints via data-ds-tooltip', 'Menus that open from a trigger', 'Select with its own list', 'Tabs with keyboard support', 'Modal and confirmation', 'Quick notices and copy', '⌘K search', 'App shell with sidebar'],
    brand: {
      title: 'Use your brand',
      desc: 'The whole brand comes from one hue. Change a number and the build recreates the palette, fits it to sRGB, and checks the contrast again.',
      steps: [
        `In ${code('tokens/palettes.json')}, change the <strong>hue</strong> (and, if you like, the <strong>chroma</strong>) of the ${code('brand')} palette.`,
        `Run ${code('npm run tokens')} — or keep ${code('npm run dev')} open, which rebuilds on its own.`,
        'Check the contrast report in the terminal. If anything drops below 4.5:1, adjust the semantic token.',
      ],
      try: 'Try it now',
      preview: ['Publish', 'New', 'See details'],
      menu: 'Brand color',
    },
    structure: { title: 'Structure', desc: `Where everything lives. You edit ${code('tokens/')}; the rest is consumed.` },
    tree: ['entry point: tokens + base + components', 'generated from tokens/*.json — don’t edit', 'reset, base typography, focus', 'one CSS file per component', 'one module per interactive component', 'icon library', 'the source of truth: color, typography, space…', 'generates tokens.css and checks contrast'],
    next: {
      title: 'Next steps',
      cards: [
        ['Learn the foundations', 'Color, typography, and space — the decisions behind everything.'],
        ['Build with components', 'Playground, code, and accessibility for every piece.'],
        ['Follow what’s new', 'What changed in each version and what’s coming next.'],
      ],
    },
    start: { label: 'Starting point', options: ['Form', 'Panel', 'Settings list'] },
    examples: {
      form: ['Create project', 'Project name', 'E.g. Customer portal', 'Shows up in the menu and in invites.', 'Private project', 'Create project', 'Cancel'],
      panel: ['Script', 'Version 0.1 launch', 'Close', 'Opening', 'Start with the reader’s problem and why it matters now.', 'Publish'],
      settings: ['Notifications', 'Comments', 'When someone replies to you.', 'Weekly summary', 'Every Monday, by email.'],
    },
  },
  {
    lead: 'Sin dependencias y sin build obligatorio: un CSS, los módulos que uses y listo.',
    stats: ['dependencias', 'archivo de CSS', 'tokens', 'temas'],
    onThisPage: 'En esta página',
    nav: ['Instalación', 'Primera pantalla', 'Tokens', 'JavaScript', 'Tu marca', 'Estructura', 'Siguientes pasos'],
    install: { title: 'Instalación', desc: 'Cuatro pasos. Solo el primero necesita terminal.', step: (n) => `Paso ${n}: ` },
    steps: [
      ['Copia el design system', `Lume no tiene dependencias ni build obligatorio. Lleva la carpeta ${code('ds/')} a tu proyecto.`],
      ['Carga las fuentes y el CSS', 'Un solo archivo trae los tokens, la base y todos los componentes. Las fuentes vienen de Google Fonts.'],
      ['Elige el tema', `Oscuro es el predeterminado de la marca. Usa ${code('light')} para el claro o ${code('system')} para seguir el sistema.`],
      ['Activa solo el JavaScript que uses', 'Los componentes visuales funcionan solo con CSS. Los interactivos tienen un módulo cada uno — importa y activa los que use la pantalla.'],
    ],
    first: { title: 'Tu primera pantalla', desc: 'Elige un punto de partida, míralo en los dos temas y cópialo. El código de abajo es exactamente lo que está en el escenario.' },
    tokens: { title: 'Usar tokens', desc: 'En tu CSS, usa siempre un token semántico — nunca un valor suelto. Así el tema, la marca y la densidad cambian sin tocar tu código.' },
    tokenGroups: ['Color', 'Texto', 'Espacio', 'Radio', 'Sombra', 'Movimiento', 'Layout'],
    js: { title: 'Módulos de JavaScript', desc: 'Cada componente interactivo tiene su módulo, sin dependencias entre ellos. Importa solo lo que use la pantalla.', head: ['Módulo', 'Para qué', 'Cómo activarlo'], docsOf: (f) => `Documentación de ${f}`, docs: 'Ver documentación' },
    modules: ['Íconos como <ds-icon> y la función icon()', 'Tema oscuro, claro o del sistema', 'Pistas con data-ds-tooltip', 'Menús que se abren desde un disparador', 'Selector con lista propia', 'Pestañas con teclado', 'Modal y confirmación', 'Avisos rápidos y copia', 'Búsqueda ⌘K', 'App shell con sidebar'],
    brand: {
      title: 'Usa tu marca',
      desc: 'Toda la marca sale de un matiz. Cambia un número y el build recrea la paleta, la ajusta a sRGB y vuelve a comprobar el contraste.',
      steps: [
        `En ${code('tokens/palettes.json')}, cambia el <strong>hue</strong> (y, si quieres, el <strong>chroma</strong>) de la paleta ${code('brand')}.`,
        `Ejecuta ${code('npm run tokens')} — o deja ${code('npm run dev')} abierto, que lo rehace solo.`,
        'Mira el informe de contraste en la terminal. Si algo baja de 4,5:1, ajusta el token semántico.',
      ],
      try: 'Pruébalo ahora',
      preview: ['Publicar', 'Nuevo', 'Ver detalles'],
      menu: 'Color de marca',
    },
    structure: { title: 'Estructura', desc: `Dónde vive cada cosa. Tú editas ${code('tokens/')}; el resto se consume.` },
    tree: ['punto de entrada: tokens + base + componentes', 'generado a partir de tokens/*.json — no lo edites', 'reset, tipografía base, foco', 'un CSS por componente', 'un módulo por componente interactivo', 'biblioteca de íconos', 'la fuente de verdad: color, tipografía, espacio…', 'genera tokens.css y comprueba el contraste'],
    next: {
      title: 'Siguientes pasos',
      cards: [
        ['Entiende los fundamentos', 'Color, tipografía y espacio — las decisiones detrás de todo.'],
        ['Construye con componentes', 'Playground, código y accesibilidad de cada pieza.'],
        ['Sigue las novedades', 'Qué cambió en cada versión y qué viene después.'],
      ],
    },
    start: { label: 'Punto de partida', options: ['Formulario', 'Panel', 'Lista de ajustes'] },
    examples: {
      form: ['Crear proyecto', 'Nombre del proyecto', 'Ej.: Portal del cliente', 'Aparece en el menú y en las invitaciones.', 'Proyecto privado', 'Crear proyecto', 'Cancelar'],
      panel: ['Guion', 'Lanzamiento de la versión 0.1', 'Cerrar', 'Apertura', 'Empieza por el problema de quien va a leer y por qué importa ahora.', 'Publicar'],
      settings: ['Notificaciones', 'Comentarios', 'Cuando alguien te responda.', 'Resumen semanal', 'Todos los lunes, por correo.'],
    },
  },
);

/* ───────── Dados ───────── */

const tokenCount = tokens.length + palettes.reduce((n, p) => n + p.steps.length, 0);
const countPrefix = (prefix) => tokens.filter((t) => t.name.startsWith(prefix)).length;

const STEP_CODE = [
  'cp -R lume/ds ./ds',
  `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=Inter+Tight:wght@500..800&family=JetBrains+Mono:wght@400..600&display=swap">
<link rel="stylesheet" href="ds/ds.css">`,
  () => `<html lang="${locale()}" data-theme="dark">`,
  `<script type="module">
  import './ds/icons/icons.js';
  import { initTooltips } from './ds/js/tooltip.js';
  import { mountSelects } from './ds/js/select.js';

  initTooltips();
  mountSelects(document);
</script>`,
];

const examples = ({ examples: e }) => ({
  form: `<form class="ds-card" style="display:grid;gap:var(--ds-space-250);width:min(420px,100%)">
  <h2 class="ds-text-heading-md">${e.form[0]}</h2>
  <div class="ds-form-field">
    <label class="ds-form-field__label" for="gs-nome">${e.form[1]}</label>
    <div class="ds-field"><input class="ds-field__input" id="gs-nome" placeholder="${e.form[2]}"></div>
    <p class="ds-form-field__hint">${e.form[3]}</p>
  </div>
  <label class="ds-switch">
    <input type="checkbox" role="switch" class="ds-switch__input" checked>
    <span class="ds-choice__text"><span class="ds-choice__label">${e.form[4]}</span></span>
  </label>
  <div style="display:flex;gap:var(--ds-space-100)">
    <button type="button" class="ds-btn ds-btn--primary">${e.form[5]}</button>
    <button type="button" class="ds-btn ds-btn--ghost">${e.form[6]}</button>
  </div>
</form>`,
  panel: `<article class="ds-panel ds-panel--compact" style="width:min(520px,100%)">
  <header class="ds-panel__header">
    <div>
      <p class="ds-panel__eyebrow">${e.panel[0]}</p>
      <h2 class="ds-panel__title">${e.panel[1]}</h2>
    </div>
    <div class="ds-panel__actions">
      <button type="button" class="ds-icon-btn" aria-label="${e.panel[2]}"><ds-icon name="x"></ds-icon></button>
    </div>
  </header>
  <div class="ds-panel__body">
    <section class="ds-section">
      <p class="ds-section__head"><span class="ds-section__stamp">01</span><span>${e.panel[3]}</span></p>
      <p class="ds-section__text">${e.panel[4]}</p>
    </section>
  </div>
  <footer class="ds-panel__footer">
    <button type="button" class="ds-btn ds-btn--primary">${e.panel[5]}</button>
  </footer>
</article>`,
  settings: `<div class="ds-card" style="display:grid;gap:var(--ds-space-200);width:min(420px,100%)">
  <h2 class="ds-text-heading-sm">${e.settings[0]}</h2>
  <label class="ds-switch ds-switch--end">
    <input type="checkbox" role="switch" class="ds-switch__input" checked>
    <span class="ds-choice__text">
      <span class="ds-choice__label">${e.settings[1]}</span>
      <span class="ds-choice__description">${e.settings[2]}</span>
    </span>
  </label>
  <label class="ds-switch ds-switch--end">
    <input type="checkbox" role="switch" class="ds-switch__input">
    <span class="ds-choice__text">
      <span class="ds-choice__label">${e.settings[3]}</span>
      <span class="ds-choice__description">${e.settings[4]}</span>
    </span>
  </label>
</div>`,
});

const TOKEN_GROUPS = [
  ['palette', '--ds-color-*', 'color.', '/fundamentos/cores'],
  ['type', '--ds-text-*', 'text.', '/fundamentos/tipografia'],
  ['spacing', '--ds-space-*', 'space.', '/fundamentos/espacamento'],
  ['radius', '--ds-radius-*', 'radius.', '/fundamentos/raios'],
  ['elevation', '--ds-shadow-*', 'shadow.', '/fundamentos/elevacao'],
  ['motion', '--ds-duration-* · --ds-easing-*', 'duration.', '/fundamentos/movimento'],
  ['layout', '--ds-layout-* · --ds-z-*', 'layout.', '/fundamentos/layout'],
];

const MODULES = [
  ['icons/icons.js', "import './ds/icons/icons.js'", '/fundamentos/icones'],
  ['js/theme.js', 'initTheme(); setTheme("light")', '/fundamentos/cores'],
  ['js/tooltip.js', 'initTooltips()', '/componentes/tooltip'],
  ['js/menu.js', 'attachMenu(botao, { options, onChange })', '/componentes/menu'],
  ['js/select.js', 'mountSelects(document)', '/componentes/selecao'],
  ['js/tabs.js', 'mountTabs(document)', '/componentes/abas'],
  ['js/modal.js', 'await confirmModal({ title })', '/componentes/modal'],
  ['js/toast.js', 'toast("Salvo"); copyText(valor)', '/componentes/toast'],
  ['js/command-palette.js', 'createCommandPalette({ items })', '/padroes/busca'],
  ['js/shell.js', 'createShell(document.querySelector(".ds-shell"))', '/padroes/app-shell'],
];

const tree = ({ tree: t }) => {
  const note = (s) => `<span class="ds-code__comment">${s}</span>`;
  return `ds/
├─ ds.css              ${note(t[0])}
├─ tokens.css          ${note(t[1])}
├─ base.css            ${note(t[2])}
├─ components/         ${note(t[3])}
├─ js/                 ${note(t[4])}
└─ icons/icons.js      ${note(t[5])}
tokens/                ${note(t[6])}
scripts/build-tokens.mjs ${note(t[7])}`;
};

const NAV_IDS = ['instalacao', 'primeira-tela', 'usando-tokens', 'javascript', 'marca', 'estrutura', 'proximos'];
const NEXT = [
  ['palette', '/fundamentos/cores'],
  ['button', '/componentes/botao'],
  ['megaphone', '/novidades'],
];

/* ───────── Página ───────── */

export default function renderPrimeirosPassos(page) {
  const c = tr(COPY);
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">Lume</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${page.description} ${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[0, 1, tokenCount, 2].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="instalacao" aria-labelledby="instalacao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="instalacao-title">${c.install.title}</h2>
          <p class="doc-section__desc">${c.install.desc}</p>
        </div>
      </header>
      <ol class="gs-steps" role="list">
        ${c.steps.map(
          ([title, text], i) => `<li class="gs-step">
            <span class="gs-step__num" aria-hidden="true">${i + 1}</span>
            <div class="gs-step__body">
              <h3 class="gs-step__title"><span class="ds-visually-hidden">${c.install.step(i + 1)}</span>${title}</h3>
              <p class="gs-step__text">${text}</p>
              ${codeBlock(typeof STEP_CODE[i] === 'function' ? STEP_CODE[i]() : STEP_CODE[i])}
            </div>
          </li>`,
        ).join('')}
      </ol>
    </section>

    <section class="doc-section" id="primeira-tela" aria-labelledby="primeira-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="primeira-title">${c.first.title}</h2>
          <p class="doc-section__desc">${c.first.desc}</p>
        </div>
      </header>
      ${playgroundMarkup('primeira-tela')}
    </section>

    <section class="doc-section" id="usando-tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${c.tokens.title}</h2>
          <p class="doc-section__desc">${c.tokens.desc}</p>
        </div>
      </header>
      <div class="gs-tokens">
        ${codeBlock(`.meu-card {
  padding: var(--ds-space-300);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-color-bg-surface);
  border: 1px solid var(--ds-color-border-subtle);
  color: var(--ds-color-fg-default);
  font: var(--ds-text-body-md);
}`)}
        <ul class="gs-token-groups" role="list">
          ${TOKEN_GROUPS.map(
            ([ic, prefix, start, href], i) => `<li><a class="gs-token-group" href="#${href}">
              <span class="gs-token-group__icon">${icon(ic, { size: 18 })}</span>
              <span class="gs-token-group__text"><span class="gs-token-group__name">${c.tokenGroups[i]}</span><code>${prefix}</code></span>
              <span class="gs-token-group__count">${countPrefix(start) || ''}</span>
              ${icon('chevron-right', { size: 16, className: 'gs-token-group__chevron' })}
            </a></li>`,
          ).join('')}
        </ul>
      </div>
    </section>

    <section class="doc-section" id="javascript" aria-labelledby="js-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="js-title">${c.js.title}</h2>
          <p class="doc-section__desc">${c.js.desc}</p>
        </div>
      </header>
      <div class="doc-table gs-modules">
        <div class="doc-table__head" aria-hidden="true">${c.js.head.map((h) => `<span>${h}</span>`).join('')}<span></span></div>
        ${MODULES.map(
          ([file, how, href], i) => `<div class="doc-table__row">
            <code class="gs-modules__file">ds/${file}</code>
            <span class="gs-modules__what">${c.modules[i].replace(/</g, '&lt;')}</span>
            <code class="gs-modules__how">${how}</code>
            <a class="ds-icon-btn ds-icon-btn--muted" href="#${href}" aria-label="${c.js.docsOf(file)}" data-ds-tooltip="${c.js.docs}">${icon('arrow-right', { size: 18 })}</a>
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="marca" aria-labelledby="marca-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="marca-title">${c.brand.title}</h2>
          <p class="doc-section__desc">${c.brand.desc}</p>
        </div>
      </header>
      <div class="gs-brand">
        <ol class="gs-brand__steps" role="list">
          ${c.brand.steps.map((text, i) => `<li><span class="gs-brand__num">${i + 1}</span><p>${text}</p></li>`).join('')}
        </ol>
        <div class="gs-brand__try">
          ${codeBlock('"brand": { "hue": 50, "chroma": 0.175 }')}
          <div class="gs-brand__demo">
            <p class="gs-brand__label">${c.brand.try}</p>
            <button type="button" class="ds-chip" data-brand-chip><span class="ds-chip__icon">${icon('palette', { size: 16 })}</span><span data-label>${brandLabel(getBrand())}</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
            <div class="gs-brand__preview" inert>
              <span class="ds-btn ds-btn--primary ds-btn--sm">${c.brand.preview[0]}</span>
              <span class="ds-badge ds-badge--brand">${c.brand.preview[1]}</span>
              <span class="gs-brand__link">${c.brand.preview[2]}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="doc-section" id="estrutura" aria-labelledby="estrutura-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estrutura-title">${c.structure.title}</h2>
          <p class="doc-section__desc">${c.structure.desc}</p>
        </div>
      </header>
      <pre class="ds-code gs-tree"><code>${tree(c)}</code></pre>
    </section>

    <section class="doc-section" id="proximos" aria-labelledby="proximos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="proximos-title">${c.next.title}</h2>
        </div>
      </header>
      <div class="gs-next">
        ${NEXT.map(
          ([ic, href], i) => `<a class="gs-next__card" href="#${href}">
              <span class="gs-next__icon">${icon(ic, { size: 20 })}</span>
              <span class="gs-next__title">${c.next.cards[i][0]}${icon('arrow-up-right', { size: 18, className: 'gs-next__arrow' })}</span>
              <span class="gs-next__text">${c.next.cards[i][1]}</span>
            </a>`,
        ).join('')}
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const c = tr(COPY);
  const EXAMPLES = examples(c);
  const unmountPlayground = mountPlayground(root, {
    id: 'primeira-tela',
    controls: [
      {
        id: 'example',
        label: c.start.label,
        value: 'form',
        options: ['form', 'panel', 'settings'].map((value, i) => ({ value, label: c.start.options[i] })),
      },
    ],
    render: (s) => EXAMPLES[s.example],
    code: (s) => EXAMPLES[s.example],
  });

  const chip = root.querySelector('[data-brand-chip]');
  const brandMenu = attachMenu(chip, {
    label: c.brand.menu,
    value: getBrand(),
    options: brandOptions(),
    onChange: (value) => {
      applyBrand(value);
      chip.querySelector('[data-label]').textContent = brandLabel(value);
    },
  });

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    brandMenu.destroy();
    unmountCopy();
    unmountNav();
  };
}
