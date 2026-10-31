import { icon } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { resolvedTheme } from '../../ds/js/theme.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-app-shell.css'];

/* ───────── Dados ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const px = (name) => byName.get(name)?.px ?? '—';
const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
const MOD = isMac ? '⌘' : 'Ctrl';

const DEVICES = [
  { value: 'desktop', label: 'Desktop', w: 1280, h: 800 },
  { value: 'tablet', label: 'Tablet', w: 820, h: 1000 },
  { value: 'phone', label: 'Celular', w: 390, h: 780 },
];

// [seletor do marcador, [x, y] em fração da caixa + deslocamento em px, nome, descrição, seletor do destaque]
const PARTS = [
  ['.ds-sidebar', [1, 0.72, 0, 0], 'Sidebar', `Painel flutuante de ${px('layout.sidebar')} px, raio 2xl, separado do conteúdo por ${px('layout.frame-gap')} px de fundo do app.`],
  ['.ds-brand', [1, 0.5, 16, 0], 'Marca', 'Só o nome, em Inter Tight. Leva ao Início.'],
  ['.ds-sidebar-search', [1, 0.5, 0, 0], 'Busca', `Abre a paleta de comandos — o mesmo que ${MOD} K ou /.`],
  ['.ds-sidebar__nav .ds-nav-group__header', [0.62, 0.5, 0, 0], 'Navegação com grupos', 'Navegação principal no topo; depois, grupos que recolhem e lembram o estado.', '.ds-sidebar__nav'],
  ['.ds-account', [1, 0.5, 0, 0], 'Cartão da conta', 'Fica preso no pé da sidebar: conta, versão ou workspace.'],
  ['.ds-main', [0.94, 0.16, 0, 0], 'Painel principal', `O conteúdo da página, com respiro lateral de ${px('layout.gutter')} px e largura de leitura limitada.`],
  ['#breadcrumb', [1, 0.5, 16, 0], 'Topbar e trilha', `${px('layout.topbar')} px, fixa no topo do painel: transparente no início, opaca ao rolar.`, '.ds-topbar'],
  ['.ds-topbar .ds-segmented', [0, 0.5, -16, 0], 'Tema', 'Escuro, claro ou o do sistema. A escolha vale para o app inteiro.'],
];

const SHORTCUTS = [
  [[MOD, 'B'], 'Recolher ou expandir a sidebar', 'No celular, abre e fecha a gaveta.'],
  [[MOD, 'K'], 'Abrir a busca', 'Abre a paleta de comandos de qualquer lugar.'],
  [['/'], 'Abrir a busca', 'Só fora de campos de texto — dentro deles, / é só uma barra.'],
  [['Esc'], 'Fechar', 'Fecha a busca, a gaveta, menus e tooltips, e devolve o foco.'],
  [['Tab'], 'Pular para o conteúdo', 'O primeiro Tab da página mostra o atalho para o painel principal.'],
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
    ? `<div class="pa-device pa-device--off"><p>${icon('app-shell', { size: 20 })}O exemplo fica desligado aqui dentro — senão seria um app dentro do app, dentro do app…</p></div>`
    : `<div class="pa-device" data-device-frame="${kind}">
        <div class="pa-device__viewport" data-viewport>
          <iframe class="pa-device__iframe" data-iframe="${kind}" title="${label}"${kind === 'anatomy' ? ' tabindex="-1" aria-hidden="true"' : ''}></iframe>
        </div>
        ${kind === 'anatomy' ? '<div class="pa-anatomy__marks" data-marks aria-hidden="true"></div>' : ''}
        <p class="pa-device__loading" data-loading>${icon('loader', { size: 18 })}Carregando o app…</p>
      </div>`;

const SKELETON = `<a class="ds-skip-link" href="#conteudo">Pular para o conteúdo</a>

<div class="ds-shell" id="shell">
  <aside class="ds-sidebar" id="sidebar" aria-label="Barra lateral">
    <div class="ds-sidebar__header">
      <a class="ds-brand" href="#/">Órbita</a>
      <button class="ds-icon-btn ds-icon-btn--outline ds-icon-btn--lg ds-sidebar__toggle"
              data-shell-toggle aria-controls="sidebar">
        <ds-icon name="panel-left" class="ds-sidebar__toggle-collapse"></ds-icon>
        <ds-icon name="x" class="ds-sidebar__toggle-close"></ds-icon>
      </button>
    </div>
    <div class="ds-sidebar__search">…botão que abre a busca…</div>
    <nav class="ds-sidebar__nav" id="sidebar-nav" aria-label="Principal"></nav>
    <div class="ds-sidebar__footer"><a class="ds-account" href="…">…</a></div>
  </aside>

  <div class="ds-shell__scrim" data-shell-scrim></div>

  <div class="ds-main">
    <div class="ds-main__scroll">
      <header class="ds-topbar">
        <button class="ds-icon-btn ds-icon-btn--outline ds-topbar__menu"
                data-shell-toggle aria-controls="sidebar"><ds-icon name="menu"></ds-icon></button>
        <nav class="ds-breadcrumb" aria-label="Você está em"></nav>
        <div class="ds-topbar__spacer"></div>
        …busca e tema…
      </header>
      <main id="conteudo" class="ds-main__content" tabindex="-1"></main>
    </div>
  </div>
</div>`;

const SCRIPT = `import { createShell, renderSidebarNav, setActiveNavItem } from './ds/js/shell.js';

const nav = document.getElementById('sidebar-nav');
renderSidebarNav(nav, [
  { id: 'main', items: [{ label: 'Início', icon: 'home', href: '#/' }] },
  { id: 'vendas', label: 'Vendas', items: [
    { label: 'Pedidos', icon: 'inbox', href: '#/pedidos', dot: true },
    { label: 'Clientes', icon: 'users', href: '#/clientes' },
  ] },
]);

const shell = createShell(document.getElementById('shell'));
setActiveNavItem(nav, location.hash);            // marca aria-current e abre o grupo

shell.toggle();                                 // recolhe (desktop) ou abre a gaveta (celular)
shell.closeMobile();                            // ao navegar no celular
document.getElementById('shell')
  .addEventListener('ds:shellchange', (e) => console.log(e.detail));
  // → { sidebar: 'expanded' | 'collapsed', mobile: false, mobileOpen: false }`;

const EMBED_CODE = `<!-- o app de verdade, sem gravar preferências -->
<iframe src="index.html?embed&theme=light&sidebar=collapsed#/"></iframe>

<script type="module">
  const app = iframe.contentWindow.orbitaEmbed;   // mesma origem
  app.shell.toggle();
  app.setTheme('dark');
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
        <h1 class="doc-header__title">App shell</h1>
        <p class="doc-header__lead">A moldura de toda tela: sidebar flutuante, painel principal e topbar. Recolhe no desktop, vira gaveta no celular e responde ao teclado.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">sidebar</dt><dd class="doc-stat__value">${px('layout.sidebar')} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">recolhida</dt><dd class="doc-stat__value">${px('layout.sidebar-collapsed')} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">topbar</dt><dd class="doc-stat__value">${px('layout.topbar')} px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">gaveta abaixo de</dt><dd class="doc-stat__value">${px('breakpoint.lg')} px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['pa-vivo', 'Ao vivo'],
        ['pa-anatomia', 'Anatomia'],
        ['pa-recolhido', 'Recolhido e expandido'],
        ['pa-mobile', 'Mobile'],
        ['pa-comportamento', 'Comportamento'],
        ['pa-atalhos', 'Atalhos'],
        ['pa-acessibilidade', 'Acessibilidade'],
        ['pa-medidas', 'Medidas'],
        ['pa-codigo', 'Código'],
        ['pa-uso', 'Uso'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'pa-vivo',
      'Ao vivo',
      'É o próprio app, rodando aqui dentro. Troque o tamanho da tela e veja a sidebar virar gaveta; recolha, troque o tema, navegue. Nada do que você fizer aqui muda as suas preferências.',
      `<div class="pa-demo">
        <div class="pa-demo__toolbar">
          ${segmented('device', 'Tamanho da tela', DEVICES, 'desktop')}
          <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-demo-toggle disabled>${icon('panel-left', { size: 16 })}<span data-demo-toggle-label>Recolher menu</span></button>
          <span class="pa-demo__spacer"></span>
          ${segmented('theme', 'Tema do exemplo', [{ value: 'dark', label: 'Escuro', icon: 'moon' }, { value: 'light', label: 'Claro', icon: 'sun' }], theme)}
          <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-demo-reload aria-label="Recarregar o exemplo" data-ds-tooltip="Recarregar o exemplo">${icon('refresh', { size: 18 })}</button>
        </div>
        ${frame('live', 'Exemplo ao vivo do Órbita')}
        <p class="pa-demo__status" data-demo-status aria-live="polite"></p>
      </div>`,
    )}

    ${section(
      'pa-anatomia',
      'Anatomia',
      'Oito partes, marcadas sobre o app de verdade — as posições vêm do próprio DOM. Passe o mouse ou foque um item da lista para destacá-lo.',
      `<div class="pa-anatomy">
        ${frame('anatomy', 'Anatomia do app shell')}
        <ol class="pa-anatomy__list" role="list">
          ${PARTS.map(
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
      'Recolhido e expandido',
      `No desktop, a sidebar recolhe para ${px('layout.sidebar-collapsed')} px e deixa o conteúdo respirar. Os ícones ficam na mesma coluna nos dois estados — por isso nada pula na animação.`,
      `<div class="pa-states">
        <article class="pa-state">
          <div class="pa-state__art" aria-hidden="true">
            <div class="pa-mini" data-mode="expanded">
              <span class="pa-mini__brand">Órbita</span><span class="pa-mini__search"><i></i><b></b></span>
              ${[64, 52, 70].map((w) => `<span class="pa-mini__item"><i></i><b style="width:${w}%"></b></span>`).join('')}
              <span class="pa-mini__group"><b></b></span>
              ${[58, 44].map((w) => `<span class="pa-mini__item"><i></i><b style="width:${w}%"></b></span>`).join('')}
            </div>
          </div>
          <div class="pa-state__body">
            <p class="pa-state__name">Expandida <span>${px('layout.sidebar')} px</span></p>
            <ul class="pa-state__list" role="list">
              <li>Rótulos, títulos de grupo e o atalho da busca à vista.</li>
              <li>Sem tooltips — o nome já está escrito.</li>
              <li>O padrão para quem chega pela primeira vez.</li>
            </ul>
          </div>
        </article>
        <article class="pa-state">
          <div class="pa-state__art" aria-hidden="true">
            <div class="pa-mini" data-mode="collapsed">
              <span class="pa-mini__brand"></span><span class="pa-mini__search"><i></i></span>
              ${[1, 2, 3].map(() => '<span class="pa-mini__item"><i></i></span>').join('')}
              <span class="pa-mini__group"></span>
              ${[1, 2].map(() => '<span class="pa-mini__item"><i></i></span>').join('')}
            </div>
          </div>
          <div class="pa-state__body">
            <p class="pa-state__name">Recolhida <span>${px('layout.sidebar-collapsed')} px</span></p>
            <ul class="pa-state__list" role="list">
              <li>Só ícones; os textos somem por opacidade, sem mudar de lugar.</li>
              <li>Cada item ganha tooltip com o nome — e o atalho, quando tem.</li>
              <li>Títulos de grupo viram um fio divisor; a busca vira a lupa.</li>
            </ul>
          </div>
        </article>
      </div>
      <div class="pa-notes">
        <p>${icon('history', { size: 18 })}<span>A escolha fica salva (<code class="ds-inline-code">ds-sidebar</code>) e é aplicada antes do primeiro desenho — a página não pisca ao abrir.</span></p>
        <p>${icon('motion', { size: 18 })}<span>A largura anima em <code class="ds-inline-code">duration.slow</code> com <code class="ds-inline-code">easing.emphasized</code>; com movimento reduzido, a troca é imediata.</span></p>
        <button type="button" class="ds-inline-action" data-try="collapse">${icon('panel-left', { size: 16 })}Recolher no exemplo ao vivo${icon('arrow-up', { size: 14 })}</button>
      </div>`,
    )}

    ${section(
      'pa-mobile',
      'Mobile',
      `Abaixo de ${px('breakpoint.lg')} px a sidebar sai da tela e vira gaveta. O conteúdo ganha a largura toda; a topbar ganha o botão de menu e a lupa.`,
      `<div class="pa-mobile">
        <ol class="pa-steps" role="list">
          <li><span class="pa-steps__num">1</span><div><p class="pa-steps__title">Abrir</p><p class="pa-steps__text">O botão de menu da topbar (ou ${MOD} B) desliza a gaveta e escurece o fundo. O foco vai para o item ativo.</p></div></li>
          <li><span class="pa-steps__num">2</span><div><p class="pa-steps__title">Navegar</p><p class="pa-steps__text">Escolher uma página fecha a gaveta. A largura é ${px('layout.sidebar')} px, mas nunca encosta na borda: sobram 48 px para tocar fora.</p></div></li>
          <li><span class="pa-steps__num">3</span><div><p class="pa-steps__title">Fechar</p><p class="pa-steps__text">Toque no fundo, no X ou aperte Esc. O foco volta para o botão de menu.</p></div></li>
        </ol>
        <div class="pa-mobile__aside">
          <p class="pa-mobile__note">${icon('info', { size: 18 })}<span>Abaixo de ${px('breakpoint.md')} px a trilha mostra só a página atual e o respiro lateral cai para 16 px.</span></p>
          <button type="button" class="ds-btn ds-btn--secondary" data-try="phone">${icon('arrow-up', { size: 16 })}Ver no celular, ao vivo</button>
        </div>
      </div>`,
    )}

    ${section(
      'pa-comportamento',
      'Comportamento',
      'Os detalhes que fazem o shell parecer quieto: nada muda sem motivo e tudo volta como estava.',
      `<div class="pa-cards">
        ${[
          ['layout', 'Topbar que aparece ao rolar', 'No topo da página ela é transparente e some no fundo. Ao rolar, fica opaca e ganha um fio embaixo (data-scrolled no painel).'],
          ['target', 'Item ativo sempre à vista', 'A página atual ganha aria-current="page"; se estiver num grupo fechado, o grupo abre e a lista rola até ela.'],
          ['chevron-down', 'Grupos que lembram', 'Cada grupo recolhe pelo título e o estado fica salvo (ds-nav-groups). Recolhida, a sidebar mostra todos os ícones.'],
          ['monitor', 'Três larguras', `A partir de ${px('breakpoint.lg')} px: sidebar recolhível. Abaixo: gaveta. Abaixo de ${px('breakpoint.md')} px: trilha curta e menos respiro.`],
        ]
          .map(
            ([ic, title, text]) => `<article class="pa-card">
              <span class="pa-card__icon">${icon(ic, { size: 20 })}</span>
              <p class="pa-card__title">${title}</p>
              <p class="pa-card__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>`,
    )}

    ${section(
      'pa-atalhos',
      'Atalhos',
      'Funcionam em qualquer página. Atalhos de uma tecla só valem fora de campos de texto — ninguém perde o que está digitando.',
      `<div class="doc-table pa-keys">
        <div class="doc-table__head" aria-hidden="true"><span>Teclas</span><span>Ação</span><span>Detalhe</span></div>
        ${SHORTCUTS.map(
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
      'Acessibilidade',
      'O shell é a primeira coisa que o teclado e o leitor de tela encontram. Ele precisa ser previsível.',
      a11yList([
        ['Regiões com nome', 'Sidebar em <code class="ds-inline-code">aside</code> “Barra lateral”, navegação “Principal”, trilha “Você está em”, conteúdo em <code class="ds-inline-code">main</code>. Dá para pular entre elas pelo leitor de tela.'],
        ['Pular para o conteúdo', 'O primeiro Tab mostra o link; Enter leva o foco direto ao painel principal, sem passar pela navegação toda.', ['Tab']],
        ['Página atual', 'O item ativo tem <code class="ds-inline-code">aria-current="page"</code> — não depende só do destaque visual.'],
        ['Botões que dizem o estado', 'Recolher, abrir gaveta e grupos usam <code class="ds-inline-code">aria-expanded</code> e <code class="ds-inline-code">aria-controls</code>; o rótulo muda junto (“Recolher menu” ↔ “Expandir menu”).'],
        ['Foco na gaveta', 'Ao abrir, o foco vai para o item ativo; Esc fecha e devolve o foco ao botão de menu.', ['Esc']],
        ['Nomes quando recolhida', 'Só ícones na tela, mas cada item mantém o rótulo para o leitor e ganha tooltip no hover e no foco.'],
        ['Atalhos que não atrapalham', `${MOD} B e / não disparam dentro de campos de texto. Os atalhos aparecem nos tooltips e em <code class="ds-inline-code">aria-keyshortcuts</code>.`],
        ['Movimento reduzido', 'Com a preferência do sistema ligada, sidebar e gaveta trocam de estado sem animação.'],
      ]),
    )}

    ${section(
      'pa-medidas',
      'Medidas',
      'Tudo vem de tokens de layout — mude um número e o shell inteiro acompanha.',
      tokenTable([
        ['layout.sidebar', 'Largura da sidebar (e máxima da gaveta)'],
        ['layout.sidebar-collapsed', 'Largura recolhida'],
        ['layout.topbar', 'Altura da topbar'],
        ['layout.frame-gap', 'Fundo entre os painéis e a borda da janela'],
        ['layout.gutter', 'Respiro lateral do conteúdo'],
        ['layout.content-max', 'Largura máxima do conteúdo'],
        ['radius.2xl', 'Raio dos dois painéis'],
        ['breakpoint.lg', 'A partir daqui, sidebar; abaixo, gaveta'],
        ['color.bg.app', 'Fundo atrás dos painéis'],
        ['color.bg.sidebar', 'Sidebar'],
        ['color.bg.canvas', 'Painel principal e topbar ao rolar'],
        ['duration.slow', 'Recolher, expandir e gaveta'],
      ]),
    )}

    ${section(
      'pa-codigo',
      'Código',
      'O HTML é fixo; a navegação é montada por JS a partir de uma lista. O mesmo arquivo serve o site inteiro.',
      `<h3 class="doc-subhead">HTML</h3>
      ${codeBlock(SKELETON)}
      <h3 class="doc-subhead">JavaScript</h3>
      ${codeBlock(SCRIPT)}
      <div class="doc-table pa-api">
        <div class="doc-table__head" aria-hidden="true"><span>API</span><span>O que faz</span></div>
        ${[
          ['createShell(el, { persist, initial })', 'Liga recolher, gaveta, grupos e topbar. <code class="ds-inline-code">persist: false</code> não grava nada; <code class="ds-inline-code">initial</code> força “expanded” ou “collapsed”.'],
          ['shell.toggle() · setCollapsed(bool) · setMobileOpen(bool)', 'Mudam o estado como os botões e o atalho fazem.'],
          ['shell.isCollapsed() · isMobile() · isMobileOpen()', 'Leem o estado atual.'],
          ['renderSidebarNav(el, groups)', 'Desenha a navegação: o grupo sem rótulo vira a principal; os outros recolhem.'],
          ['setActiveNavItem(el, href)', 'Marca a página atual, abre o grupo dela e rola até ela.'],
          ['evento ds:shellchange', 'Disparado no shell a cada mudança, com { sidebar, mobile, mobileOpen }.'],
        ]
          .map(([api, text]) => `<div class="doc-table__row"><code class="pa-api__name">${api}</code><span class="pa-api__text">${text}</span></div>`)
          .join('')}
      </div>
      <h3 class="doc-subhead">Modo demonstração <span class="doc-subhead__meta">?embed</span></h3>
      <p class="pa-paragraph">É o que esta página usa. Com <code class="ds-inline-code">?embed</code> na URL, o app não grava tema, sidebar nem grupos, e quem embute controla tudo por <code class="ds-inline-code">orbitaEmbed</code>.</p>
      ${codeBlock(EMBED_CODE)}`,
    )}

    ${section(
      'pa-uso',
      'Uso',
      'O shell some quando está bem feito. Três regras ajudam.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: poucos grupos, nomes curtos</p>
          <p class="usage-card__text">Até seis grupos, com rótulos de uma ou duas palavras. Se um item precisa de explicação, ele mora numa página, não no menu.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: ações e níveis demais na sidebar</p>
          <p class="usage-card__text">A sidebar leva a lugares. Botões de criar, excluir ou um terceiro nível de navegação vão para o conteúdo da página.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Tudo também pela busca</p>
          <p class="usage-card__text">Toda página e ação da sidebar aparece na paleta (${MOD} K). Quem usa teclado nem precisa abrir o menu.</p>
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

/** Espera o app do iframe expor window.orbitaEmbed. */
function whenReady(iframe, cb) {
  let tries = 0;
  let timer;
  const check = () => {
    const api = iframe.contentWindow?.orbitaEmbed;
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

  let theme = resolvedTheme();
  let device = DEVICES[0];

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
    const mode = detail.mobile ? (detail.mobileOpen ? 'Gaveta aberta' : 'Gaveta fechada') : detail.sidebar === 'collapsed' ? 'Sidebar recolhida' : 'Sidebar expandida';
    toggleLabel.textContent = detail.mobile ? (detail.mobileOpen ? 'Fechar gaveta' : 'Abrir gaveta') : detail.sidebar === 'collapsed' ? 'Expandir menu' : 'Recolher menu';
    toggleBtn.querySelector('.ds-icon')?.replaceWith(document.createRange().createContextualFragment(icon(detail.mobile ? 'menu' : 'panel-left', { size: 16 })));
    status.textContent = `${mode} · ${device.label} ${device.w} × ${device.h}`;
  }

  const onShellChange = (e) => describe(e.detail);
  const readState = () =>
    liveApi && {
      sidebar: liveApi.root.dataset.sidebar,
      mobile: liveApi.shell.isMobile(),
      mobileOpen: liveApi.shell.isMobileOpen(),
    };

  cleanups.push(
    whenReady(liveFrame, (api) => {
      liveApi = api;
      live.querySelector('[data-loading]').hidden = true;
      api.root.addEventListener('ds:shellchange', onShellChange);
      api.setTheme(theme);
      toggleBtn.disabled = false;
      describe(readState());
    }),
  );
  liveFrame.src = srcFor(theme);

  const fitLive = () => fitDevice(live, device, maxLiveHeight());
  live.dataset.device = device.value;

  const deviceGroup = bindSegmented(root.querySelector('[data-segmented="device"]'), (value) => {
    live.setAttribute('data-fitted', '');
    device = DEVICES.find((d) => d.value === value);
    live.dataset.device = value;
    fitLive();
    // a largura do iframe muda → o app passa sozinho de sidebar para gaveta (mesmo media query)
    setTimeout(() => describe(readState()), 60);
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
    rects = PARTS.map(([sel]) => measure(sel));
    marks.innerHTML = PARTS.map(([, [ax, ay, dx, dy], , , boxSel], i) => {
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
