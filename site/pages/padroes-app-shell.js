import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { resolvedTheme } from '../../ds/js/theme.js';
import { locale } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-app-shell.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const byName = new Map(tokens.map((t) => [t.name, t]));
const px = (name) => byName.get(name)?.px ?? '—';
const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
const MOD = isMac ? '⌘' : 'Ctrl';

const DEVICES = () => [
  { value: 'desktop', label: L('Desktop', 'Desktop', 'Escritorio'), w: 1280, h: 800 },
  { value: 'tablet', label: 'Tablet', w: 820, h: 1000 },
  { value: 'phone', label: L('Celular', 'Phone', 'Móvil'), w: 390, h: 780 },
];

// [seletor do marcador, [x, y] em fração da caixa + deslocamento em px, nome, descrição, seletor do destaque]
const PARTS = () => [
  ['.ds-sidebar', [1, 0.72, 0, 0], 'Sidebar', L(`Painel flutuante de ${px('layout.sidebar')} px, raio xl, separado do conteúdo por ${px('layout.frame-gap')} px de fundo do app.`, `A floating ${px('layout.sidebar')} px panel, xl radius, separated from the content by ${px('layout.frame-gap')} px of app background.`, `Panel flotante de ${px('layout.sidebar')} px, radio xl, separado del contenido por ${px('layout.frame-gap')} px de fondo de la app.`)],
  ['.ds-brand', [1, 0.5, 16, 0], L('Marca', 'Brand', 'Marca'), L('A chama do Lume e o nome, em Geist Serif. Leva ao Início.', 'The Lume flame and the name, in Geist Serif. It goes to Home.', 'La llama de Lume y el nombre, en Geist Serif. Lleva al Inicio.')],
  ['.ds-sidebar-search', [1, 0.5, 0, 0], L('Busca', 'Search', 'Búsqueda'), L(`Abre a paleta de comandos — o mesmo que ${MOD} K ou /.`, `Opens the command palette — the same as ${MOD} K or /.`, `Abre la paleta de comandos — lo mismo que ${MOD} K o /.`)],
  ['.ds-sidebar__nav .ds-nav-group__header', [0.62, 0.5, 0, 0], L('Navegação com grupos', 'Grouped navigation', 'Navegación con grupos'), L('Navegação principal no topo; depois, grupos que recolhem e lembram o estado.', 'Main navigation at the top; then, groups that collapse and remember their state.', 'Navegación principal arriba; después, grupos que se contraen y recuerdan su estado.'), '.ds-sidebar__nav'],
  ['.ds-account', [1, 0.5, 0, 0], L('Cartão da conta', 'Account card', 'Tarjeta de la cuenta'), L('Fica preso no pé da sidebar: conta, versão ou workspace.', 'Pinned to the foot of the sidebar: account, version, or workspace.', 'Queda fija al pie de la sidebar: cuenta, versión o workspace.')],
  ['.ds-main', [0.94, 0.16, 0, 0], L('Painel principal', 'Main panel', 'Panel principal'), L(`O conteúdo da página, com respiro lateral de ${px('layout.gutter')} px e largura de leitura limitada.`, `The page content, with ${px('layout.gutter')} px side padding and a limited reading width.`, `El contenido de la página, con respiro lateral de ${px('layout.gutter')} px y ancho de lectura limitado.`)],
  ['#breadcrumb', [1, 0.5, 16, 0], L('Topbar e trilha', 'Top bar and breadcrumb', 'Barra superior y ruta'), L(`${px('layout.topbar')} px, fixa no topo do painel: transparente no início, opaca ao rolar.`, `${px('layout.topbar')} px, fixed at the top of the panel: transparent at first, opaque on scroll.`, `${px('layout.topbar')} px, fija arriba del panel: transparente al inicio, opaca al desplazarse.`), '.ds-topbar'],
  ['.ds-topbar .ds-segmented', [0, 0.5, -16, 0], L('Tema', 'Theme', 'Tema'), L('Escuro, claro ou o do sistema. A escolha vale para o app inteiro.', 'Dark, light, or the system’s. The choice applies to the whole app.', 'Oscuro, claro o el del sistema. La elección vale para toda la app.')],
];

const SHORTCUTS = () => [
  [[MOD, 'B'], L('Recolher ou expandir a sidebar', 'Collapse or expand the sidebar', 'Contraer o expandir la sidebar'), L('No celular, abre e fecha a gaveta.', 'On phones, opens and closes the drawer.', 'En el móvil, abre y cierra el cajón.')],
  [[MOD, 'K'], L('Abrir a busca', 'Open search', 'Abrir la búsqueda'), L('Abre a paleta de comandos de qualquer lugar.', 'Opens the command palette from anywhere.', 'Abre la paleta de comandos desde cualquier lugar.')],
  [['/'], L('Abrir a busca', 'Open search', 'Abrir la búsqueda'), L('Só fora de campos de texto — dentro deles, / é só uma barra.', 'Only outside text fields — inside them, / is just a slash.', 'Solo fuera de campos de texto — dentro de ellos, / es solo una barra.')],
  [['Esc'], L('Fechar', 'Close', 'Cerrar'), L('Fecha a busca, a gaveta, menus e tooltips, e devolve o foco.', 'Closes search, the drawer, menus, and tooltips, and returns focus.', 'Cierra la búsqueda, el cajón, menús y tooltips, y devuelve el foco.')],
  [['Tab'], L('Pular para o conteúdo', 'Skip to content', 'Saltar al contenido'), L('O primeiro Tab da página mostra o atalho para o painel principal.', 'The page’s first Tab shows the shortcut to the main panel.', 'El primer Tab de la página muestra el atajo al panel principal.')],
];

const embedded = () => document.documentElement.hasAttribute('data-embed');

/* ───────── Peças ───────── */

const section = (id, title, desc, body, aside = '') => `
  <section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        <p class="doc-section__desc">${desc}</p>
      </div>
      ${aside}
    </header>
    ${body}
  </section>`;

const kbd = (keys) => keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('');

const segmented = (name, label, options, value) => `
  <div class="ds-segmented pa-segmented" role="radiogroup" aria-label="${label}" data-segmented="${name}">
    ${options
      .map(
        (o) => `<button type="button" class="ds-segmented__item" role="radio" data-value="${o.value}" aria-checked="${o.value === value}" tabindex="${o.value === value ? 0 : -1}"${o.icon ? ` aria-label="${o.label}"` : ''}>${o.icon ? icon(o.icon, { size: 16 }) : o.label}</button>`,
      )
      .join('')}
  </div>`;

const frame = (kind, label) =>
  embedded()
    ? `<div class="pa-device pa-device--off"><p>${icon('app-shell', { size: 20 })}${L('O exemplo fica desligado aqui dentro — senão seria um app dentro do app, dentro do app…', 'The example is off in here — otherwise it would be an app inside the app, inside the app…', 'El ejemplo queda apagado aquí dentro — si no, sería una app dentro de la app, dentro de la app…')}</p></div>`
    : `<div class="pa-device" data-device-frame="${kind}">
        <div class="pa-device__viewport" data-viewport>
          <iframe class="pa-device__iframe" data-iframe="${kind}" title="${label}"${kind === 'anatomy' ? ' tabindex="-1" aria-hidden="true"' : ''}></iframe>
        </div>
        ${kind === 'anatomy' ? '<div class="pa-anatomy__marks" data-marks aria-hidden="true"></div>' : ''}
        <p class="pa-device__loading" data-loading>${icon('loader', { size: 18 })}${L('Carregando o app…', 'Loading the app…', 'Cargando la app…')}</p>
      </div>`;

const skeleton = () => `<a class="ds-skip-link" href="#${L('conteudo', 'content', 'contenido')}">${L('Pular para o conteúdo', 'Skip to content', 'Saltar al contenido')}</a>

<div class="ds-shell" id="shell">
  <button class="ds-shell__edge" data-shell-toggle aria-controls="sidebar"><ds-icon name="chevron-left" size="16"></ds-icon></button>
  <aside class="ds-sidebar" id="sidebar" aria-label="${L('Barra lateral', 'Sidebar', 'Barra lateral')}">
    <div class="ds-sidebar__header">
      <a class="ds-brand" href="#/" aria-label="Lume"><img class="ds-brand__mark" src="assets/favicon.svg" alt="">Lume</a>
      <button class="ds-icon-btn ds-icon-btn--outline ds-icon-btn--lg ds-sidebar__toggle"
              data-shell-toggle aria-controls="sidebar">
        <img class="ds-sidebar__toggle-mark" src="assets/favicon.svg" alt="">
        <ds-icon name="panel-left" class="ds-sidebar__toggle-collapse"></ds-icon>
        <ds-icon name="x" class="ds-sidebar__toggle-close"></ds-icon>
      </button>
    </div>
    <div class="ds-sidebar__search">${L('…botão que abre a busca…', '…button that opens search…', '…botón que abre la búsqueda…')}</div>
    <nav class="ds-sidebar__nav" id="sidebar-nav" aria-label="${L('Principal', 'Main', 'Principal')}"></nav>
    <div class="ds-sidebar__footer"><a class="ds-account" href="…">…</a></div>
  </aside>

  <div class="ds-shell__scrim" data-shell-scrim></div>

  <div class="ds-main">
    <div class="ds-main__scroll">
      <header class="ds-topbar">
        <button class="ds-icon-btn ds-icon-btn--outline ds-topbar__menu"
                data-shell-toggle aria-controls="sidebar"><ds-icon name="menu"></ds-icon></button>
        <nav class="ds-breadcrumb" aria-label="${L('Você está em', 'You are here', 'Estás en')}"></nav>
        <div class="ds-topbar__spacer"></div>
        ${L('…busca e tema…', '…search and theme…', '…búsqueda y tema…')}
      </header>
      <main id="${L('conteudo', 'content', 'contenido')}" class="ds-main__content" tabindex="-1"></main>
    </div>
  </div>
</div>`;

const script = () => `import { createShell, renderSidebarNav, setActiveNavItem } from './ds/js/shell.js';

const nav = document.getElementById('sidebar-nav');
renderSidebarNav(nav, [
  { id: 'main', items: [{ label: '${L('Início', 'Home', 'Inicio')}', icon: 'home', href: '#/' }] },
  { id: '${L('vendas', 'sales', 'ventas')}', label: '${L('Vendas', 'Sales', 'Ventas')}', items: [
    { label: '${L('Pedidos', 'Orders', 'Pedidos')}', icon: 'inbox', href: '#/${L('pedidos', 'orders', 'pedidos')}', dot: true },
    { label: '${L('Clientes', 'Customers', 'Clientes')}', icon: 'users', href: '#/${L('clientes', 'customers', 'clientes')}' },
  ] },
]);

const shell = createShell(document.getElementById('shell'));
setActiveNavItem(nav, location.hash);            // ${L('marca aria-current e abre o grupo', 'sets aria-current and opens the group', 'marca aria-current y abre el grupo')}

shell.toggle();                                 // ${L('recolhe (desktop) ou abre a gaveta (celular)', 'collapses (desktop) or opens the drawer (phone)', 'contrae (escritorio) o abre el cajón (móvil)')}
shell.closeMobile();                            // ${L('ao navegar no celular', 'when navigating on a phone', 'al navegar en el móvil')}
document.getElementById('shell')
  .addEventListener('ds:shellchange', (e) => console.log(e.detail));
  // → { sidebar: 'expanded' | 'collapsed', mobile: false, mobileOpen: false }`;

const embedCode = () => `<!-- ${L('o app de verdade, sem gravar preferências', 'the real app, without saving preferences', 'la app de verdad, sin guardar preferencias')} -->
<iframe src="index.html?embed&theme=light&sidebar=collapsed#/"></iframe>

<script type="module">
  const app = iframe.contentWindow.lumeEmbed;   // ${L('mesma origem', 'same origin', 'mismo origen')}
  app.shell.toggle();
  app.setTheme('dark');
  app.setLocale('${locale()}');
  app.go('/componentes/botao');
</script>`;

/* ───────── Página ───────── */

export default function renderAppShell(page) {
  const theme = resolvedTheme();
  return `
  <div class="page doc pa-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('A moldura de toda tela: sidebar flutuante, painel principal e topbar. Recolhe no desktop, vira gaveta no celular e responde ao teclado.', 'The frame of every screen: a floating sidebar, the main panel, and the top bar. It collapses on desktop, becomes a drawer on phones, and responds to the keyboard.', 'El marco de toda pantalla: sidebar flotante, panel principal y barra superior. Se contrae en escritorio, se vuelve cajón en el móvil y responde al teclado.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">sidebar</dt><dd class="doc-stat__value">${px('layout.sidebar')} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('recolhida', 'collapsed', 'contraída')}</dt><dd class="doc-stat__value">${px('layout.sidebar-collapsed')} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">topbar</dt><dd class="doc-stat__value">${px('layout.topbar')} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('gaveta abaixo de', 'drawer below', 'cajón por debajo de')}</dt><dd class="doc-stat__value">${px('breakpoint.lg')} px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['pa-vivo', L('Ao vivo', 'Live', 'En vivo')],
        ['pa-anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['pa-recolhido', L('Recolhido e expandido', 'Collapsed and expanded', 'Contraído y expandido')],
        ['pa-mobile', L('Mobile', 'Mobile', 'Móvil')],
        ['pa-comportamento', L('Comportamento', 'Behavior', 'Comportamiento')],
        ['pa-atalhos', L('Atalhos', 'Shortcuts', 'Atajos')],
        ['pa-acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['pa-medidas', L('Medidas', 'Measurements', 'Medidas')],
        ['pa-codigo', L('Código', 'Code', 'Código')],
        ['pa-uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'pa-vivo',
      L('Ao vivo', 'Live', 'En vivo'),
      L('É o próprio app, rodando aqui dentro. Troque o tamanho da tela e veja a sidebar virar gaveta; recolha, troque o tema, navegue. Nada do que você fizer aqui muda as suas preferências.', 'It’s the app itself, running in here. Change the screen size and watch the sidebar become a drawer; collapse it, switch the theme, navigate. Nothing you do here changes your preferences.', 'Es la propia app, funcionando aquí dentro. Cambia el tamaño de pantalla y mira cómo la sidebar se vuelve cajón; contráela, cambia el tema, navega. Nada de lo que hagas aquí cambia tus preferencias.'),
      `<div class="pa-demo">
        <div class="pa-demo__toolbar">
          ${segmented('device', L('Tamanho da tela', 'Screen size', 'Tamaño de pantalla'), DEVICES(), 'desktop')}
          ${segmented('layout', L('Layout do exemplo', 'Example layout', 'Diseño del ejemplo'), [{ value: 'sidebar', label: L('Sidebar', 'Sidebar', 'Sidebar'), icon: 'panel-left' }, { value: 'navbar', label: L('Navbar', 'Navbar', 'Navbar'), icon: 'panel-top' }], 'sidebar')}
          <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-demo-toggle disabled>${icon('panel-left', { size: 16 })}<span data-demo-toggle-label>${L('Recolher menu', 'Collapse menu', 'Contraer menú')}</span></button>
          <span class="pa-demo__spacer"></span>
          ${segmented('theme', L('Tema do exemplo', 'Example theme', 'Tema del ejemplo'), [{ value: 'refugio', label: 'Refúgio', icon: 'mountain' }, { value: 'dark', label: L('Escuro', 'Dark', 'Oscuro'), icon: 'moon' }, { value: 'light', label: L('Claro', 'Light', 'Claro'), icon: 'sun' }], theme)}
          <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-demo-reload aria-label="${L('Recarregar o exemplo', 'Reload the example', 'Recargar el ejemplo')}" data-ds-tooltip="${L('Recarregar o exemplo', 'Reload the example', 'Recargar el ejemplo')}">${icon('refresh', { size: 18 })}</button>
        </div>
        ${frame('live', L('Exemplo ao vivo do Lume', 'Live Lume example', 'Ejemplo en vivo de Lume'))}
        <p class="pa-demo__status" data-demo-status aria-live="polite"></p>
      </div>`,
    )}

    ${section(
      'pa-anatomia',
      L('Anatomia', 'Anatomy', 'Anatomía'),
      L('Oito partes, marcadas sobre o app de verdade — as posições vêm do próprio DOM. Passe o mouse ou foque um item da lista para destacá-lo.', 'Eight parts, marked over the real app — the positions come from the DOM itself. Hover or focus a list item to highlight it.', 'Ocho partes, marcadas sobre la app de verdad — las posiciones vienen del propio DOM. Pasa el mouse o enfoca un elemento de la lista para destacarlo.'),
      `<div class="pa-anatomy">
        ${frame('anatomy', L('Anatomia do app shell', 'App shell anatomy', 'Anatomía del app shell'))}
        <ol class="pa-anatomy__list" role="list">
          ${PARTS().map(
            ([, , name, text], i) => `<li><button type="button" class="pa-anatomy__item" data-part="${i}">
              <span class="pa-anatomy__num">${i + 1}</span>
              <span><span class="pa-anatomy__name">${name}</span><span class="pa-anatomy__text">${text}</span></span>
            </button></li>`,
          ).join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'pa-recolhido',
      L('Recolhido e expandido', 'Collapsed and expanded', 'Contraído y expandido'),
      L(`No desktop, a sidebar recolhe para ${px('layout.sidebar-collapsed')} px e deixa o conteúdo respirar. Os ícones ficam na mesma coluna nos dois estados — por isso nada pula na animação.`, `On desktop, the sidebar collapses to ${px('layout.sidebar-collapsed')} px and lets the content breathe. The icons stay in the same column in both states — so nothing jumps during the animation.`, `En escritorio, la sidebar se contrae a ${px('layout.sidebar-collapsed')} px y deja respirar el contenido. Los íconos quedan en la misma columna en los dos estados — por eso nada salta en la animación.`),
      `<div class="pa-states">
        <article class="pa-state">
          <div class="pa-state__art" aria-hidden="true">
            <div class="pa-mini" data-mode="expanded">
              <span class="pa-mini__brand"><img src="assets/favicon.svg" alt="">Lume</span><span class="pa-mini__search"><i></i><b></b></span>
              ${[64, 52, 70].map((w) => `<span class="pa-mini__item"><i></i><b style="width:${w}%"></b></span>`).join('')}
              <span class="pa-mini__group"><b></b></span>
              ${[58, 44].map((w) => `<span class="pa-mini__item"><i></i><b style="width:${w}%"></b></span>`).join('')}
            </div>
          </div>
          <div class="pa-state__body">
            <p class="pa-state__name">${L('Expandida', 'Expanded', 'Expandida')} <span>${px('layout.sidebar')} px</span></p>
            <ul class="pa-state__list" role="list">
              <li>${L('Rótulos, títulos de grupo e o atalho da busca à vista.', 'Labels, group titles, and the search shortcut in view.', 'Etiquetas, títulos de grupo y el atajo de la búsqueda a la vista.')}</li>
              <li>${L('Sem tooltips — o nome já está escrito.', 'No tooltips — the name is already written.', 'Sin tooltips — el nombre ya está escrito.')}</li>
              <li>${L('Para recolher, a aba na borda, na altura da marca: aparece com o mouse sobre a sidebar ou com o foco.', 'To collapse, the tab on the edge, level with the brand: it shows with the pointer over the sidebar or with focus.', 'Para contraer, la pestaña en el borde, a la altura de la marca: aparece con el puntero sobre la sidebar o con el foco.')}</li>
              <li>${L('O padrão para quem chega pela primeira vez.', 'The default for first-time visitors.', 'El predeterminado para quien llega por primera vez.')}</li>
            </ul>
          </div>
        </article>
        <article class="pa-state">
          <div class="pa-state__art" aria-hidden="true">
            <div class="pa-mini" data-mode="collapsed">
              <span class="pa-mini__brand"><img src="assets/favicon.svg" alt=""></span><span class="pa-mini__search"><i></i></span>
              ${[1, 2, 3].map(() => '<span class="pa-mini__item"><i></i></span>').join('')}
              <span class="pa-mini__group"></span>
              ${[1, 2].map(() => '<span class="pa-mini__item"><i></i></span>').join('')}
            </div>
          </div>
          <div class="pa-state__body">
            <p class="pa-state__name">${L('Recolhida', 'Collapsed', 'Contraída')} <span>${px('layout.sidebar-collapsed')} px</span></p>
            <ul class="pa-state__list" role="list">
              <li>${L('Só ícones; os textos somem por opacidade, sem mudar de lugar.', 'Icons only; the text fades out by opacity, without moving.', 'Solo íconos; los textos desaparecen por opacidad, sin cambiar de lugar.')}</li>
              <li>${L('Cada item ganha tooltip com o nome — e o atalho, quando tem.', 'Each item gets a tooltip with its name — and its shortcut, when it has one.', 'Cada elemento recibe un tooltip con el nombre — y el atajo, cuando lo tiene.')}</li>
              <li>${L('Títulos de grupo viram um fio divisor; a busca vira a lupa.', 'Group titles become a thin divider; search becomes the magnifier.', 'Los títulos de grupo se vuelven una línea divisoria; la búsqueda se vuelve la lupa.')}</li>
              <li>${L('A chama fica no topo, maior; com o mouse ou o foco, vira o botão de expandir.', 'The flame stays at the top, larger; with the pointer or focus, it becomes the expand button.', 'La llama queda arriba, más grande; con el puntero o el foco, se vuelve el botón de expandir.')}</li>
            </ul>
          </div>
        </article>
      </div>
      <div class="pa-notes">
        <p>${icon('history', { size: 18 })}<span>${L(`A escolha fica salva (${ic('ds-sidebar')}) e é aplicada antes do primeiro desenho — a página não pisca ao abrir.`, `The choice is saved (${ic('ds-sidebar')}) and applied before the first paint — the page doesn’t flash on open.`, `La elección queda guardada (${ic('ds-sidebar')}) y se aplica antes del primer dibujo — la página no parpadea al abrir.`)}</span></p>
        <p>${icon('motion', { size: 18 })}<span>${L(`A largura anima em ${ic('duration.slow')} com ${ic('easing.emphasized')}; com movimento reduzido, a troca é imediata.`, `The width animates with ${ic('duration.slow')} and ${ic('easing.emphasized')}; with reduced motion, the change is immediate.`, `El ancho se anima con ${ic('duration.slow')} y ${ic('easing.emphasized')}; con movimiento reducido, el cambio es inmediato.`)}</span></p>
        <button type="button" class="ds-inline-action" data-try="collapse">${icon('panel-left', { size: 16 })}${L('Recolher no exemplo ao vivo', 'Collapse in the live example', 'Contraer en el ejemplo en vivo')}${icon('arrow-up', { size: 14 })}</button>
      </div>`,
    )}

    ${section(
      'pa-mobile',
      L('Mobile', 'Mobile', 'Móvil'),
      L(`Abaixo de ${px('breakpoint.lg')} px a sidebar sai da tela e vira gaveta. O conteúdo ganha a largura toda; a topbar ganha o botão de menu e a lupa.`, `Below ${px('breakpoint.lg')} px the sidebar leaves the screen and becomes a drawer. The content gets the full width; the top bar gets the menu button and the magnifier.`, `Por debajo de ${px('breakpoint.lg')} px la sidebar sale de la pantalla y se vuelve cajón. El contenido gana todo el ancho; la barra superior gana el botón de menú y la lupa.`),
      `<div class="pa-mobile">
        <ol class="pa-steps" role="list">
          <li><span class="pa-steps__num">1</span><div><p class="pa-steps__title">${L('Abrir', 'Open', 'Abrir')}</p><p class="pa-steps__text">${L(`O botão de menu da topbar (ou ${MOD} B) desliza a gaveta e escurece o fundo. O foco vai para o item ativo.`, `The top bar’s menu button (or ${MOD} B) slides the drawer in and dims the background. Focus moves to the active item.`, `El botón de menú de la barra superior (o ${MOD} B) desliza el cajón y oscurece el fondo. El foco va al elemento activo.`)}</p></div></li>
          <li><span class="pa-steps__num">2</span><div><p class="pa-steps__title">${L('Navegar', 'Navigate', 'Navegar')}</p><p class="pa-steps__text">${L(`Escolher uma página fecha a gaveta. A largura é ${px('layout.sidebar')} px, mas nunca encosta na borda: sobram 48 px para tocar fora.`, `Choosing a page closes the drawer. The width is ${px('layout.sidebar')} px, but it never touches the edge: 48 px remain to tap outside.`, `Elegir una página cierra el cajón. El ancho es ${px('layout.sidebar')} px, pero nunca toca el borde: quedan 48 px para tocar fuera.`)}</p></div></li>
          <li><span class="pa-steps__num">3</span><div><p class="pa-steps__title">${L('Fechar', 'Close', 'Cerrar')}</p><p class="pa-steps__text">${L('Toque no fundo, no X ou aperte Esc. O foco volta para o botão de menu.', 'Tap the background, the X, or press Esc. Focus returns to the menu button.', 'Toca el fondo, la X o pulsa Esc. El foco vuelve al botón de menú.')}</p></div></li>
        </ol>
        <div class="pa-mobile__aside">
          <p class="pa-mobile__note">${icon('info', { size: 18 })}<span>${L(`Abaixo de ${px('breakpoint.md')} px a trilha mostra só a página atual e o respiro lateral cai para 16 px.`, `Below ${px('breakpoint.md')} px the breadcrumb shows only the current page and the side padding drops to 16 px.`, `Por debajo de ${px('breakpoint.md')} px la ruta muestra solo la página actual y el respiro lateral baja a 16 px.`)}</span></p>
          <button type="button" class="ds-btn ds-btn--secondary" data-try="phone">${icon('arrow-up', { size: 16 })}${L('Ver no celular, ao vivo', 'See it on a phone, live', 'Verlo en el móvil, en vivo')}</button>
        </div>
      </div>`,
    )}

    ${section(
      'pa-comportamento',
      L('Comportamento', 'Behavior', 'Comportamiento'),
      L('Os detalhes que fazem o shell parecer quieto: nada muda sem motivo e tudo volta como estava.', 'The details that make the shell feel quiet: nothing changes without a reason and everything comes back as it was.', 'Los detalles que hacen que el shell parezca tranquilo: nada cambia sin motivo y todo vuelve como estaba.'),
      `<div class="pa-cards">
        ${[
          ['layout', L('Topbar que aparece ao rolar', 'A top bar that appears on scroll', 'Barra superior que aparece al desplazarse'), L('No topo da página ela é transparente e some no fundo. Ao rolar, fica opaca e ganha um fio embaixo (data-scrolled no painel).', 'At the top of the page it’s transparent and blends into the background. On scroll, it turns opaque and gains a thin line below (data-scrolled on the panel).', 'Arriba de la página es transparente y se funde con el fondo. Al desplazarse, se vuelve opaca y gana una línea debajo (data-scrolled en el panel).')],
          ['target', L('Item ativo sempre à vista', 'The active item always in view', 'Elemento activo siempre a la vista'), L('A página atual ganha aria-current="page"; se estiver num grupo fechado, o grupo abre e a lista rola até ela.', 'The current page gets aria-current="page"; if it’s in a closed group, the group opens and the list scrolls to it.', 'La página actual recibe aria-current="page"; si está en un grupo cerrado, el grupo se abre y la lista se desplaza hasta ella.')],
          ['chevron-down', L('Grupos que lembram', 'Groups that remember', 'Grupos que recuerdan'), L('Cada grupo recolhe pelo título e o estado fica salvo (ds-nav-groups). Recolhida, a sidebar mostra todos os ícones.', 'Each group collapses by its title and the state is saved (ds-nav-groups). When collapsed, the sidebar shows every icon.', 'Cada grupo se contrae por el título y el estado queda guardado (ds-nav-groups). Contraída, la sidebar muestra todos los íconos.')],
          ['monitor', L('Três larguras', 'Three widths', 'Tres anchos'), L(`A partir de ${px('breakpoint.lg')} px: sidebar recolhível. Abaixo: gaveta. Abaixo de ${px('breakpoint.md')} px: trilha curta e menos respiro.`, `From ${px('breakpoint.lg')} px: collapsible sidebar. Below: drawer. Below ${px('breakpoint.md')} px: short breadcrumb and less padding.`, `A partir de ${px('breakpoint.lg')} px: sidebar contraíble. Por debajo: cajón. Por debajo de ${px('breakpoint.md')} px: ruta corta y menos respiro.`)],
        ]
          .map(
            ([glyph, title, text]) => `<article class="pa-card">
              <span class="pa-card__icon">${icon(glyph, { size: 20 })}</span>
              <p class="pa-card__title">${title}</p>
              <p class="pa-card__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>`,
    )}

    ${section(
      'pa-atalhos',
      L('Atalhos', 'Shortcuts', 'Atajos'),
      L('Funcionam em qualquer página. Atalhos de uma tecla só valem fora de campos de texto — ninguém perde o que está digitando.', 'They work on any page. Single-key shortcuts only apply outside text fields — no one loses what they’re typing.', 'Funcionan en cualquier página. Los atajos de una sola tecla solo valen fuera de campos de texto — nadie pierde lo que está escribiendo.'),
      `<div class="doc-table pa-keys">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Teclas', 'Keys', 'Teclas')}</span><span>${L('Ação', 'Action', 'Acción')}</span><span>${L('Detalhe', 'Detail', 'Detalle')}</span></div>
        ${SHORTCUTS().map(
          ([keys, action, detail]) => `<div class="doc-table__row">
            <span class="pa-keys__keys">${kbd(keys)}</span>
            <span class="pa-keys__action">${action}</span>
            <span class="pa-keys__detail">${detail}</span>
          </div>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'pa-acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('O shell é a primeira coisa que o teclado e o leitor de tela encontram. Ele precisa ser previsível.', 'The shell is the first thing the keyboard and screen reader meet. It has to be predictable.', 'El shell es lo primero que encuentran el teclado y el lector de pantalla. Tiene que ser predecible.'),
      a11yList([
        [L('Regiões com nome', 'Named regions', 'Regiones con nombre'), L(`Sidebar em ${ic('aside')} “Barra lateral”, navegação “Principal”, trilha “Você está em”, conteúdo em ${ic('main')}. Dá para pular entre elas pelo leitor de tela.`, `Sidebar in an ${ic('aside')} “Sidebar”, navigation “Main”, breadcrumb “You are here”, content in ${ic('main')}. You can jump between them with a screen reader.`, `Sidebar en ${ic('aside')} “Barra lateral”, navegación “Principal”, ruta “Estás en”, contenido en ${ic('main')}. Se puede saltar entre ellas con el lector de pantalla.`)],
        [L('Pular para o conteúdo', 'Skip to content', 'Saltar al contenido'), L('O primeiro Tab mostra o link; Enter leva o foco direto ao painel principal, sem passar pela navegação toda.', 'The first Tab shows the link; Enter takes focus straight to the main panel, without going through all the navigation.', 'El primer Tab muestra el enlace; Enter lleva el foco directo al panel principal, sin pasar por toda la navegación.'), ['Tab']],
        [L('Página atual', 'Current page', 'Página actual'), L(`O item ativo tem ${ic('aria-current="page"')} — não depende só do destaque visual.`, `The active item has ${ic('aria-current="page"')} — it doesn’t rely on the visual highlight alone.`, `El elemento activo tiene ${ic('aria-current="page"')} — no depende solo del destacado visual.`)],
        [L('Botões que dizem o estado', 'Buttons that state their state', 'Botones que dicen su estado'), L(`Recolher, abrir gaveta e grupos usam ${ic('aria-expanded')} e ${ic('aria-controls')}; o rótulo muda junto (“Recolher menu” ↔ “Expandir menu”).`, `Collapse, open drawer, and groups use ${ic('aria-expanded')} and ${ic('aria-controls')}; the label changes with them (“Collapse menu” ↔ “Expand menu”).`, `Contraer, abrir cajón y grupos usan ${ic('aria-expanded')} y ${ic('aria-controls')}; la etiqueta cambia a la vez (“Contraer menú” ↔ “Expandir menú”).`)],
        [L('Foco na gaveta', 'Focus in the drawer', 'Foco en el cajón'), L('Ao abrir, o foco vai para o item ativo; Esc fecha e devolve o foco ao botão de menu.', 'On open, focus goes to the active item; Esc closes and returns focus to the menu button.', 'Al abrir, el foco va al elemento activo; Esc cierra y devuelve el foco al botón de menú.'), ['Esc']],
        [L('Nomes quando recolhida', 'Names when collapsed', 'Nombres cuando está contraída'), L('Só ícones na tela, mas cada item mantém o rótulo para o leitor e ganha tooltip no hover e no foco.', 'Only icons on screen, but each item keeps its label for the reader and gets a tooltip on hover and focus.', 'Solo íconos en pantalla, pero cada elemento mantiene la etiqueta para el lector y recibe tooltip con hover y foco.')],
        [L('Atalhos que não atrapalham', 'Shortcuts that don’t get in the way', 'Atajos que no estorban'), L(`${MOD} B e / não disparam dentro de campos de texto. Os atalhos aparecem nos tooltips e em ${ic('aria-keyshortcuts')}.`, `${MOD} B and / don’t fire inside text fields. Shortcuts show in tooltips and in ${ic('aria-keyshortcuts')}.`, `${MOD} B y / no se disparan dentro de campos de texto. Los atajos aparecen en los tooltips y en ${ic('aria-keyshortcuts')}.`)],
        [L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido'), L('Com a preferência do sistema ligada, sidebar e gaveta trocam de estado sem animação.', 'With the system preference on, the sidebar and drawer change state without animation.', 'Con la preferencia del sistema activada, la sidebar y el cajón cambian de estado sin animación.')],
      ]),
    )}

    ${section(
      'pa-medidas',
      L('Medidas', 'Measurements', 'Medidas'),
      L('Tudo vem de tokens de layout — mude um número e o shell inteiro acompanha.', 'Everything comes from layout tokens — change one number and the whole shell follows.', 'Todo viene de tokens de layout — cambia un número y todo el shell lo sigue.'),
      tokenTable([
        ['layout.sidebar', L('Largura da sidebar (e máxima da gaveta)', 'Sidebar width (and drawer max)', 'Ancho de la sidebar (y máximo del cajón)')],
        ['layout.sidebar-collapsed', L('Largura recolhida', 'Collapsed width', 'Ancho contraído')],
        ['layout.topbar', L('Altura da topbar', 'Top bar height', 'Altura de la barra superior')],
        ['layout.frame-gap', L('Fundo entre os painéis e a borda da janela', 'Background between the panels and the window edge', 'Fondo entre los paneles y el borde de la ventana')],
        ['layout.gutter', L('Respiro lateral do conteúdo', 'Content side padding', 'Respiro lateral del contenido')],
        ['layout.content-max', L('Largura máxima do conteúdo', 'Content max width', 'Ancho máximo del contenido')],
        ['radius.2xl', L('Raio dos dois painéis', 'Radius of both panels', 'Radio de los dos paneles')],
        ['breakpoint.lg', L('A partir daqui, sidebar; abaixo, gaveta', 'From here, sidebar; below, drawer', 'A partir de aquí, sidebar; por debajo, cajón')],
        ['color.bg.app', L('Fundo atrás dos painéis', 'Background behind the panels', 'Fondo detrás de los paneles')],
        ['color.bg.sidebar', 'Sidebar'],
        ['color.bg.canvas', L('Painel principal e topbar ao rolar', 'Main panel and top bar on scroll', 'Panel principal y barra superior al desplazarse')],
        ['duration.slow', L('Recolher, expandir e gaveta', 'Collapse, expand, and drawer', 'Contraer, expandir y cajón')],
      ]),
    )}

    ${section(
      'pa-codigo',
      L('Código', 'Code', 'Código'),
      L('O HTML é fixo; a navegação é montada por JS a partir de uma lista. O mesmo arquivo serve o site inteiro.', 'The HTML is fixed; the navigation is built by JS from a list. The same file serves the whole site.', 'El HTML es fijo; la navegación se arma con JS a partir de una lista. El mismo archivo sirve a todo el sitio.'),
      `<h3 class="doc-subhead">HTML</h3>
      ${codeBlock(skeleton())}
      <h3 class="doc-subhead">JavaScript</h3>
      ${codeBlock(script())}
      <div class="doc-table pa-api">
        <div class="doc-table__head" aria-hidden="true"><span>API</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
        ${[
          ['createShell(el, { persist, initial })', L(`Liga recolher, gaveta, grupos e topbar. ${ic('persist: false')} não grava nada; ${ic('initial')} força “expanded” ou “collapsed”.`, `Wires collapse, drawer, groups, and top bar. ${ic('persist: false')} saves nothing; ${ic('initial')} forces “expanded” or “collapsed”.`, `Conecta contraer, cajón, grupos y barra superior. ${ic('persist: false')} no guarda nada; ${ic('initial')} fuerza “expanded” o “collapsed”.`)],
          ['shell.toggle() · setCollapsed(bool) · setMobileOpen(bool)', L('Mudam o estado como os botões e o atalho fazem.', 'Change the state the way the buttons and the shortcut do.', 'Cambian el estado como lo hacen los botones y el atajo.')],
          ['shell.isCollapsed() · isMobile() · isMobileOpen()', L('Leem o estado atual.', 'Read the current state.', 'Leen el estado actual.')],
          ['renderSidebarNav(el, groups)', L('Desenha a navegação: o grupo sem rótulo vira a principal; os outros recolhem.', 'Draws the navigation: the unlabeled group becomes the main one; the others collapse.', 'Dibuja la navegación: el grupo sin etiqueta se vuelve el principal; los demás se contraen.')],
          ['setActiveNavItem(el, href)', L('Marca a página atual, abre o grupo dela e rola até ela.', 'Marks the current page, opens its group, and scrolls to it.', 'Marca la página actual, abre su grupo y se desplaza hasta ella.')],
          [L('evento ds:shellchange', 'ds:shellchange event', 'evento ds:shellchange'), L('Disparado no shell a cada mudança, com { sidebar, mobile, mobileOpen }.', 'Fired on the shell at every change, with { sidebar, mobile, mobileOpen }.', 'Disparado en el shell con cada cambio, con { sidebar, mobile, mobileOpen }.')],
        ]
          .map(([api, text]) => `<div class="doc-table__row"><code class="pa-api__name">${api}</code><span class="pa-api__text">${text}</span></div>`)
          .join('')}
      </div>
      <h3 class="doc-subhead">${L('Modo demonstração', 'Demo mode', 'Modo demostración')} <span class="doc-subhead__meta">?embed</span></h3>
      <p class="pa-paragraph">${L(`É o que esta página usa. Com ${ic('?embed')} na URL, o app não grava tema, sidebar nem grupos, e quem embute controla tudo por ${ic('lumeEmbed')}.`, `It’s what this page uses. With ${ic('?embed')} in the URL, the app doesn’t save theme, sidebar, or groups, and the embedding page controls everything through ${ic('lumeEmbed')}.`, `Es lo que usa esta página. Con ${ic('?embed')} en la URL, la app no guarda tema, sidebar ni grupos, y quien la incrusta controla todo con ${ic('lumeEmbed')}.`)}</p>
      ${codeBlock(embedCode())}`,
    )}

    ${section(
      'pa-uso',
      L('Uso', 'Usage', 'Uso'),
      L('O shell some quando está bem feito. Três regras ajudam.', 'The shell disappears when it’s done well. Three rules help.', 'El shell desaparece cuando está bien hecho. Tres reglas ayudan.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: poucos grupos, nomes curtos', 'Do: few groups, short names', 'Haz: pocos grupos, nombres cortos')}</p>
          <p class="usage-card__text">${L('Até seis grupos, com rótulos de uma ou duas palavras. Se um item precisa de explicação, ele mora numa página, não no menu.', 'Up to six groups, with one- or two-word labels. If an item needs explaining, it lives on a page, not in the menu.', 'Hasta seis grupos, con etiquetas de una o dos palabras. Si un elemento necesita explicación, vive en una página, no en el menú.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: ações e níveis demais na sidebar', 'Avoid: too many actions and levels in the sidebar', 'Evita: demasiadas acciones y niveles en la sidebar')}</p>
          <p class="usage-card__text">${L('A sidebar leva a lugares. Botões de criar, excluir ou um terceiro nível de navegação vão para o conteúdo da página.', 'The sidebar takes you places. Create and delete buttons, or a third navigation level, go in the page content.', 'La sidebar lleva a lugares. Los botones de crear, eliminar o un tercer nivel de navegación van al contenido de la página.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Tudo também pela busca', 'Everything via search too', 'Todo también por la búsqueda')}</p>
          <p class="usage-card__text">${L(`Toda página e ação da sidebar aparece na paleta (${MOD} K). Quem usa teclado nem precisa abrir o menu.`, `Every sidebar page and action shows up in the palette (${MOD} K). Keyboard users don’t even need to open the menu.`, `Toda página y acción de la sidebar aparece en la paleta (${MOD} K). Quien usa teclado ni necesita abrir el menú.`)}</p>
        </article>
      </div>`,
    )}
  </div>`;
}

/* ───────── Comportamento ───────── */

/** Liga um .ds-segmented com role="radiogroup": clique e setas. */
function bindSegmented(group, onChange) {
  const items = [...group.querySelectorAll('[role="radio"]')];
  const select = (btn, focus) => {
    items.forEach((b) => {
      const on = b === btn;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    onChange(btn.dataset.value);
  };
  const onClick = (e) => {
    const btn = e.target.closest('[role="radio"]');
    if (btn && btn.getAttribute('aria-checked') !== 'true') select(btn);
  };
  const onKey = (e) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const i = items.findIndex((b) => b.getAttribute('aria-checked') === 'true');
    select(items[(i + delta + items.length) % items.length], true);
  };
  group.addEventListener('click', onClick);
  group.addEventListener('keydown', onKey);
  return {
    set: (value) => {
      const btn = items.find((b) => b.dataset.value === value);
      if (!btn) return;
      items.forEach((b) => {
        b.setAttribute('aria-checked', String(b === btn));
        b.tabIndex = b === btn ? 0 : -1;
      });
    },
    off: () => {
      group.removeEventListener('click', onClick);
      group.removeEventListener('keydown', onKey);
    },
  };
}

/** Espera o app do iframe expor window.lumeEmbed. */
function whenReady(iframe, cb) {
  let tries = 0;
  let timer;
  const check = () => {
    const api = iframe.contentWindow?.lumeEmbed;
    if (api) return cb(api);
    if (++tries < 80) timer = setTimeout(check, 100);
  };
  const onLoad = () => {
    clearTimeout(timer);
    tries = 0;
    check();
  };
  iframe.addEventListener('load', onLoad);
  return () => {
    clearTimeout(timer);
    iframe.removeEventListener('load', onLoad);
  };
}

/** Escala o "aparelho" para caber na largura disponível. */
function fitDevice(frameEl, size, maxHeight) {
  const viewport = frameEl.querySelector('[data-viewport]');
  const avail = frameEl.clientWidth;
  const scale = Math.min(1, avail / size.w, maxHeight / size.h);
  viewport.style.width = `${size.w}px`;
  viewport.style.height = `${size.h}px`;
  viewport.style.transform = `scale(${scale})`;
  viewport.style.left = `${Math.max(0, (avail - size.w * scale) / 2)}px`;
  frameEl.style.height = `${Math.round(size.h * scale)}px`;
  return scale;
}

const srcFor = (theme) => `index.html?embed&theme=${theme}#/`;

export function mount(root) {
  const cleanups = [mountCodeCopy(root), mountDocNav(root)];
  if (embedded()) return () => cleanups.forEach((fn) => fn());

  const devices = DEVICES();
  const parts = PARTS();
  let theme = resolvedTheme();
  let device = devices[0];
  let layout = 'sidebar';

  /* ───────── Ao vivo ───────── */
  const live = root.querySelector('[data-device-frame="live"]');
  const liveFrame = live.querySelector('iframe');
  const toggleBtn = root.querySelector('[data-demo-toggle]');
  const toggleLabel = root.querySelector('[data-demo-toggle-label]');
  const status = root.querySelector('[data-demo-status]');
  let liveApi = null;

  const maxLiveHeight = () => Math.min(620, Math.max(360, innerHeight * 0.68));

  function describe(detail) {
    if (!detail) return;
    // na navbar não há o que recolher: o botão volta a valer no celular (gaveta) ou na sidebar
    toggleBtn.disabled = !liveApi || (!detail.mobile && detail.layout === 'navbar');
    const mode = detail.mobile
      ? detail.mobileOpen
        ? L('Gaveta aberta', 'Drawer open', 'Cajón abierto')
        : L('Gaveta fechada', 'Drawer closed', 'Cajón cerrado')
      : detail.layout === 'navbar'
        ? L('Navbar', 'Navbar', 'Navbar')
        : detail.sidebar === 'collapsed'
        ? L('Sidebar recolhida', 'Sidebar collapsed', 'Sidebar contraída')
        : L('Sidebar expandida', 'Sidebar expanded', 'Sidebar expandida');
    toggleLabel.textContent = detail.mobile
      ? detail.mobileOpen
        ? L('Fechar gaveta', 'Close drawer', 'Cerrar cajón')
        : L('Abrir gaveta', 'Open drawer', 'Abrir cajón')
      : detail.sidebar === 'collapsed'
        ? L('Expandir menu', 'Expand menu', 'Expandir menú')
        : L('Recolher menu', 'Collapse menu', 'Contraer menú');
    toggleBtn.querySelector('.ds-icon')?.replaceWith(document.createRange().createContextualFragment(icon(detail.mobile ? 'menu' : 'panel-left', { size: 16 })));
    status.textContent = `${mode} · ${device.label} ${device.w} × ${device.h}`;
  }

  const onShellChange = (e) => describe(e.detail);
  const readState = () =>
    liveApi && {
      sidebar: liveApi.root.dataset.sidebar,
      layout: liveApi.root.dataset.layout,
      mobile: liveApi.shell.isMobile(),
      mobileOpen: liveApi.shell.isMobileOpen(),
    };

  cleanups.push(
    whenReady(liveFrame, (api) => {
      liveApi = api;
      live.querySelector('[data-loading]').hidden = true;
      api.root.addEventListener('ds:shellchange', onShellChange);
      api.setTheme(theme);
      api.setLocale?.(locale());
      api.setLayout?.(layout);
      toggleBtn.disabled = false;
      describe(readState());
    }),
  );
  liveFrame.src = srcFor(theme);

  const fitLive = () => fitDevice(live, device, maxLiveHeight());
  live.dataset.device = device.value;

  const deviceGroup = bindSegmented(root.querySelector('[data-segmented="device"]'), (value) => {
    live.setAttribute('data-fitted', '');
    device = devices.find((d) => d.value === value);
    live.dataset.device = value;
    fitLive();
    // a largura do iframe muda → o app passa sozinho de sidebar para gaveta (mesmo media query)
    setTimeout(() => describe(readState()), 60);
  });
  const layoutGroup = bindSegmented(root.querySelector('[data-segmented="layout"]'), (value) => {
    layout = value;
    liveApi?.setLayout?.(value);
  });
  const themeGroup = bindSegmented(root.querySelector('[data-segmented="theme"]'), (value) => {
    theme = value;
    liveApi?.setTheme(value);
    anatomyApi?.setTheme(value);
  });

  const onToggle = () => liveApi?.shell.toggle();
  toggleBtn.addEventListener('click', onToggle);

  const onReload = () => {
    liveApi = null;
    toggleBtn.disabled = true;
    live.querySelector('[data-loading]').hidden = false;
    liveFrame.src = `${srcFor(theme)}&t=${Date.now()}`;
  };
  const reloadBtn = root.querySelector('[data-demo-reload]');
  reloadBtn.addEventListener('click', onReload);

  const scrollToLive = () => root.querySelector('#pa-vivo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  const onTry = (e) => {
    const btn = e.target.closest('[data-try]');
    if (!btn) return;
    if (btn.dataset.try === 'phone') {
      const openDrawer = () => liveApi?.shell.setMobileOpen(true);
      if (liveApi && !liveApi.shell.isMobile()) {
        // espera o app do iframe perceber a tela estreita (media query) antes de abrir a gaveta
        const once = (ev) => {
          if (!ev.detail.mobile) return;
          liveApi.root.removeEventListener('ds:shellchange', once);
          setTimeout(openDrawer, 120);
        };
        liveApi.root.addEventListener('ds:shellchange', once);
      } else setTimeout(openDrawer, 120);
      root.querySelector('[data-segmented="device"] [data-value="phone"]').click();
    } else if (btn.dataset.try === 'collapse') {
      if (device.value !== 'desktop') root.querySelector('[data-segmented="device"] [data-value="desktop"]').click();
      setTimeout(() => liveApi?.shell.setCollapsed(true), 100);
    }
    scrollToLive();
  };
  root.addEventListener('click', onTry);

  /* ───────── Anatomia ───────── */
  const anatomy = root.querySelector('[data-device-frame="anatomy"]');
  const anatomyFrame = anatomy.querySelector('iframe');
  const marks = anatomy.querySelector('[data-marks]');
  const ANATOMY = { w: 1280, h: 800 };
  let anatomyApi = null;
  let anatomyScale = 1;
  let rects = [];

  function placeMarks() {
    const doc = anatomyFrame.contentDocument;
    if (!doc || !anatomyApi) return;
    anatomyScale = fitDevice(anatomy, ANATOMY, 560);
    const offset = parseFloat(anatomy.querySelector('[data-viewport]').style.left) || 0;
    // só a parte visível da janela de exemplo (o conteúdo continua abaixo da dobra)
    const measure = (sel) => {
      const b = sel && doc.querySelector(sel)?.getBoundingClientRect();
      if (!b || !b.width) return null;
      const top = Math.max(0, b.top);
      const bottom = Math.min(ANATOMY.h, b.bottom);
      return { left: b.left, top, width: b.width, height: Math.max(0, bottom - top) };
    };
    rects = parts.map(([sel]) => measure(sel));
    marks.innerHTML = parts.map(([, [ax, ay, dx, dy], , , boxSel], i) => {
      const r = rects[i];
      if (!r) return '';
      const x = offset + (r.left + r.width * ax) * anatomyScale + dx;
      const y = (r.top + r.height * ay) * anatomyScale + dy;
      const b = measure(boxSel) ?? r;
      const box = `left:${offset + b.left * anatomyScale}px;top:${b.top * anatomyScale}px;width:${b.width * anatomyScale}px;height:${b.height * anatomyScale}px`;
      return `<span class="pa-anatomy__box" data-box="${i}" style="${box}"></span><span class="pa-anatomy__pin" data-pin="${i}" style="left:${x}px;top:${y}px">${i + 1}</span>`;
    }).join('');
  }

  cleanups.push(
    whenReady(anatomyFrame, (api) => {
      anatomyApi = api;
      anatomy.querySelector('[data-loading]').hidden = true;
      api.setTheme(theme);
      api.setLocale?.(locale());
      // as fontes e a navegação chegam depois do load: mede de novo quando assentar
      placeMarks();
      setTimeout(placeMarks, 300);
      setTimeout(placeMarks, 1200);
      anatomyFrame.contentDocument.fonts?.ready.then(placeMarks);
    }),
  );
  anatomyFrame.src = srcFor(theme);

  const highlight = (i) => {
    marks.querySelectorAll('[data-box]').forEach((b) => b.toggleAttribute('data-on', b.dataset.box === String(i)));
    marks.querySelectorAll('[data-pin]').forEach((p) => p.toggleAttribute('data-on', p.dataset.pin === String(i)));
    root.querySelectorAll('[data-part]').forEach((b) => b.toggleAttribute('data-on', b.dataset.part === String(i)));
  };
  const list = root.querySelector('.pa-anatomy__list');
  const onPartOver = (e) => {
    const item = e.target.closest('[data-part]');
    highlight(item ? item.dataset.part : null);
  };
  const onPartOut = () => highlight(null);
  list.addEventListener('pointerover', onPartOver);
  list.addEventListener('focusin', onPartOver);
  list.addEventListener('pointerleave', onPartOut);
  list.addEventListener('focusout', onPartOut);

  /* ───────── Tamanho ───────── */
  let raf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      fitLive();
      placeMarks();
    });
  });
  ro.observe(live);
  ro.observe(anatomy);
  fitLive();
  fitDevice(anatomy, ANATOMY, 560);
  // no celular, o exemplo já começa no tamanho de celular
  if (matchMedia('(max-width: 767.98px)').matches) root.querySelector('[data-segmented="device"] [data-value="phone"]').click();

  // segue o tema do site quando ele muda (o usuário ainda pode escolher outro só para o exemplo)
  const onSiteTheme = (e) => {
    theme = e.detail.resolved;
    themeGroup.set(theme);
    liveApi?.setTheme(theme);
    anatomyApi?.setTheme(theme);
  };
  document.documentElement.addEventListener('ds:themechange', onSiteTheme);

  return () => {
    cleanups.forEach((fn) => fn());
    deviceGroup.off();
    themeGroup.off();
    layoutGroup.off();
    toggleBtn.removeEventListener('click', onToggle);
    reloadBtn.removeEventListener('click', onReload);
    root.removeEventListener('click', onTry);
    list.removeEventListener('pointerover', onPartOver);
    list.removeEventListener('focusin', onPartOver);
    list.removeEventListener('pointerleave', onPartOut);
    list.removeEventListener('focusout', onPartOut);
    liveApi?.root.removeEventListener('ds:shellchange', onShellChange);
    document.documentElement.removeEventListener('ds:themechange', onSiteTheme);
    ro.disconnect();
    cancelAnimationFrame(raf);
  };
}
