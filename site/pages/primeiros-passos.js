import { icon } from '../../ds/icons/icons.js';
import { tokens, palettes } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock } from '../component-doc.js';
import { BRANDS, applyBrand, getBrand, brandOptions } from '../brand.js';

export const styles = ['site/component-doc.css', 'site/pages/primeiros-passos.css'];

/* ───────── Dados ───────── */

const tokenCount = tokens.length + palettes.reduce((n, p) => n + p.steps.length, 0);
const countPrefix = (prefix) => tokens.filter((t) => t.name.startsWith(prefix)).length;

const STEPS = [
  {
    title: 'Copie o design system',
    text: 'O Órbita não tem dependências nem build obrigatório. Leve a pasta <code class="ds-inline-code">ds/</code> para o seu projeto.',
    code: 'cp -R orbita/ds ./ds',
  },
  {
    title: 'Carregue as fontes e o CSS',
    text: 'Um arquivo só traz tokens, base e todos os componentes. As fontes vêm do Google Fonts.',
    code: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=Inter+Tight:wght@500..800&family=JetBrains+Mono:wght@400..600&display=swap">
<link rel="stylesheet" href="ds/ds.css">`,
  },
  {
    title: 'Escolha o tema',
    text: 'Escuro é o padrão da marca. Use <code class="ds-inline-code">light</code> para o claro ou <code class="ds-inline-code">system</code> para seguir o sistema.',
    code: '<html lang="pt-BR" data-theme="dark">',
  },
  {
    title: 'Ligue só o JavaScript que usar',
    text: 'Componentes visuais funcionam só com CSS. Os interativos têm um módulo cada — importe e ligue os que a tela usa.',
    code: `<script type="module">
  import './ds/icons/icons.js';
  import { initTooltips } from './ds/js/tooltip.js';
  import { mountSelects } from './ds/js/select.js';

  initTooltips();
  mountSelects(document);
</script>`,
  },
];

const EXAMPLES = {
  form: `<form class="ds-card" style="display:grid;gap:var(--ds-space-250);width:min(420px,100%)">
  <h2 class="ds-text-heading-md">Criar projeto</h2>
  <div class="ds-form-field">
    <label class="ds-form-field__label" for="gs-nome">Nome do projeto</label>
    <div class="ds-field"><input class="ds-field__input" id="gs-nome" placeholder="Ex.: Portal do cliente"></div>
    <p class="ds-form-field__hint">Aparece no menu e nos convites.</p>
  </div>
  <label class="ds-switch">
    <input type="checkbox" role="switch" class="ds-switch__input" checked>
    <span class="ds-choice__text"><span class="ds-choice__label">Projeto privado</span></span>
  </label>
  <div style="display:flex;gap:var(--ds-space-100)">
    <button type="button" class="ds-btn ds-btn--primary">Criar projeto</button>
    <button type="button" class="ds-btn ds-btn--ghost">Cancelar</button>
  </div>
</form>`,
  panel: `<article class="ds-panel ds-panel--compact" style="width:min(520px,100%)">
  <header class="ds-panel__header">
    <div>
      <p class="ds-panel__eyebrow">Roteiro</p>
      <h2 class="ds-panel__title">Lançamento da versão 0.1</h2>
    </div>
    <div class="ds-panel__actions">
      <button type="button" class="ds-icon-btn" aria-label="Fechar"><ds-icon name="x"></ds-icon></button>
    </div>
  </header>
  <div class="ds-panel__body">
    <section class="ds-section">
      <p class="ds-section__head"><span class="ds-section__stamp">01</span><span>Abertura</span></p>
      <p class="ds-section__text">Comece pelo problema de quem vai ler e por que ele importa agora.</p>
    </section>
  </div>
  <footer class="ds-panel__footer">
    <button type="button" class="ds-btn ds-btn--primary">Publicar</button>
  </footer>
</article>`,
  settings: `<div class="ds-card" style="display:grid;gap:var(--ds-space-200);width:min(420px,100%)">
  <h2 class="ds-text-heading-sm">Notificações</h2>
  <label class="ds-switch ds-switch--end">
    <input type="checkbox" role="switch" class="ds-switch__input" checked>
    <span class="ds-choice__text">
      <span class="ds-choice__label">Comentários</span>
      <span class="ds-choice__description">Quando alguém responder você.</span>
    </span>
  </label>
  <label class="ds-switch ds-switch--end">
    <input type="checkbox" role="switch" class="ds-switch__input">
    <span class="ds-choice__text">
      <span class="ds-choice__label">Resumo semanal</span>
      <span class="ds-choice__description">Toda segunda, por e-mail.</span>
    </span>
  </label>
</div>`,
};

const TOKEN_GROUPS = [
  ['palette', 'Cor', '--ds-color-*', 'color.', '/fundamentos/cores'],
  ['type', 'Texto', '--ds-text-*', 'text.', '/fundamentos/tipografia'],
  ['spacing', 'Espaço', '--ds-space-*', 'space.', '/fundamentos/espacamento'],
  ['radius', 'Raio', '--ds-radius-*', 'radius.', '/fundamentos/raios'],
  ['elevation', 'Sombra', '--ds-shadow-*', 'shadow.', '/fundamentos/elevacao'],
  ['motion', 'Movimento', '--ds-duration-* · --ds-easing-*', 'duration.', '/fundamentos/movimento'],
  ['layout', 'Layout', '--ds-layout-* · --ds-z-*', 'layout.', '/fundamentos/layout'],
];

const MODULES = [
  ['icons/icons.js', 'Ícones como <ds-icon> e a função icon()', "import './ds/icons/icons.js'", '/fundamentos/icones'],
  ['js/theme.js', 'Tema escuro, claro ou do sistema', 'initTheme(); setTheme("light")', '/fundamentos/cores'],
  ['js/tooltip.js', 'Dicas por data-ds-tooltip', 'initTooltips()', '/componentes/tooltip'],
  ['js/menu.js', 'Menus que abrem de um gatilho', 'attachMenu(botao, { options, onChange })', '/componentes/menu'],
  ['js/select.js', 'Seleção com lista própria', 'mountSelects(document)', '/componentes/selecao'],
  ['js/tabs.js', 'Abas com teclado', 'mountTabs(document)', '/componentes/abas'],
  ['js/modal.js', 'Modal e confirmação', 'await confirmModal({ title })', '/componentes/modal'],
  ['js/toast.js', 'Avisos rápidos e cópia', 'toast("Salvo"); copyText(valor)', '/componentes/toast'],
  ['js/command-palette.js', 'Busca ⌘K', 'createCommandPalette({ items })', '/padroes/busca'],
  ['js/shell.js', 'App shell com sidebar', 'createShell(document.querySelector(".ds-shell"))', '/padroes/app-shell'],
];

const TREE = `ds/
├─ ds.css              <span class="ds-code__comment">ponto de entrada: tokens + base + componentes</span>
├─ tokens.css          <span class="ds-code__comment">gerado a partir de tokens/*.json — não edite</span>
├─ base.css            <span class="ds-code__comment">reset, tipografia base, foco</span>
├─ components/         <span class="ds-code__comment">um CSS por componente</span>
├─ js/                 <span class="ds-code__comment">um módulo por componente interativo</span>
└─ icons/icons.js      <span class="ds-code__comment">biblioteca de ícones</span>
tokens/                <span class="ds-code__comment">a fonte da verdade: cores, tipografia, espaço…</span>
scripts/build-tokens.mjs <span class="ds-code__comment">gera tokens.css e confere o contraste</span>`;

/* ───────── Página ───────── */

export default function renderPrimeirosPassos(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">Órbita</p>
        <h1 class="doc-header__title">Primeiros passos</h1>
        <p class="doc-header__lead">${page.description} Sem dependências e sem build obrigatório: um CSS, os módulos que você usar e pronto.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">dependências</dt><dd class="doc-stat__value">0</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">arquivo de CSS</dt><dd class="doc-stat__value">1</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tokens</dt><dd class="doc-stat__value">${tokenCount}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">temas</dt><dd class="doc-stat__value">2</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['instalacao', 'Instalação'],
        ['primeira-tela', 'Primeira tela'],
        ['usando-tokens', 'Tokens'],
        ['javascript', 'JavaScript'],
        ['marca', 'Sua marca'],
        ['estrutura', 'Estrutura'],
        ['proximos', 'Próximos passos'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="instalacao" aria-labelledby="instalacao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="instalacao-title">Instalação</h2>
          <p class="doc-section__desc">Quatro passos. Nenhum precisa de terminal além do primeiro.</p>
        </div>
      </header>
      <ol class="gs-steps" role="list">
        ${STEPS.map(
          (s, i) => `<li class="gs-step">
            <span class="gs-step__num" aria-hidden="true">${i + 1}</span>
            <div class="gs-step__body">
              <h3 class="gs-step__title"><span class="ds-visually-hidden">Passo ${i + 1}: </span>${s.title}</h3>
              <p class="gs-step__text">${s.text}</p>
              ${codeBlock(s.code)}
            </div>
          </li>`,
        ).join('')}
      </ol>
    </section>

    <section class="doc-section" id="primeira-tela" aria-labelledby="primeira-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="primeira-title">Sua primeira tela</h2>
          <p class="doc-section__desc">Escolha um ponto de partida, veja nos dois temas e copie. O código abaixo é exatamente o que está no palco.</p>
        </div>
      </header>
      ${playgroundMarkup('primeira-tela')}
    </section>

    <section class="doc-section" id="usando-tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Usando tokens</h2>
          <p class="doc-section__desc">No seu CSS, use sempre um token semântico — nunca um valor solto. Assim o tema, a marca e a densidade mudam sem tocar no seu código.</p>
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
            ([ic, name, prefix, start, href]) => `<li><a class="gs-token-group" href="#${href}">
              <span class="gs-token-group__icon">${icon(ic, { size: 18 })}</span>
              <span class="gs-token-group__text"><span class="gs-token-group__name">${name}</span><code>${prefix}</code></span>
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
          <h2 class="doc-section__title" id="js-title">Módulos JavaScript</h2>
          <p class="doc-section__desc">Cada componente interativo tem o seu módulo, sem dependência entre eles. Importe só o que a tela usa.</p>
        </div>
      </header>
      <div class="doc-table gs-modules">
        <div class="doc-table__head" aria-hidden="true"><span>Módulo</span><span>Para quê</span><span>Como ligar</span><span></span></div>
        ${MODULES.map(
          ([file, what, how, href]) => `<div class="doc-table__row">
            <code class="gs-modules__file">ds/${file}</code>
            <span class="gs-modules__what">${what.replace(/</g, '&lt;')}</span>
            <code class="gs-modules__how">${how}</code>
            <a class="ds-icon-btn ds-icon-btn--muted" href="#${href}" aria-label="Documentação de ${file}" data-ds-tooltip="Ver documentação">${icon('arrow-right', { size: 18 })}</a>
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="marca" aria-labelledby="marca-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="marca-title">Use a sua marca</h2>
          <p class="doc-section__desc">A marca inteira sai de um matiz. Mude um número e o build recria a paleta, ajusta ao sRGB e confere o contraste de novo.</p>
        </div>
      </header>
      <div class="gs-brand">
        <ol class="gs-brand__steps" role="list">
          <li><span class="gs-brand__num">1</span><p>Em <code class="ds-inline-code">tokens/palettes.json</code>, troque o <strong>hue</strong> (e, se quiser, o <strong>chroma</strong>) da paleta <code class="ds-inline-code">brand</code>.</p></li>
          <li><span class="gs-brand__num">2</span><p>Rode <code class="ds-inline-code">npm run tokens</code> — ou deixe o <code class="ds-inline-code">npm run dev</code> aberto, que ele refaz sozinho.</p></li>
          <li><span class="gs-brand__num">3</span><p>Veja o relatório de contraste no terminal. Se algo cair abaixo de 4,5:1, ajuste o token semântico.</p></li>
        </ol>
        <div class="gs-brand__try">
          ${codeBlock('"brand": { "hue": 50, "chroma": 0.175 }')}
          <div class="gs-brand__demo">
            <p class="gs-brand__label">Experimente agora</p>
            <button type="button" class="ds-chip" data-brand-chip><span class="ds-chip__icon">${icon('palette', { size: 16 })}</span><span data-label>Pêssego</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
            <div class="gs-brand__preview" inert>
              <span class="ds-btn ds-btn--primary ds-btn--sm">Publicar</span>
              <span class="ds-badge ds-badge--brand">Novo</span>
              <span class="gs-brand__link">Ver detalhes</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="doc-section" id="estrutura" aria-labelledby="estrutura-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estrutura-title">Estrutura</h2>
          <p class="doc-section__desc">Onde cada coisa mora. Você edita <code class="ds-inline-code">tokens/</code>; o resto é consumido.</p>
        </div>
      </header>
      <pre class="ds-code gs-tree"><code>${TREE}</code></pre>
    </section>

    <section class="doc-section" id="proximos" aria-labelledby="proximos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="proximos-title">Próximos passos</h2>
        </div>
      </header>
      <div class="gs-next">
        ${[
          ['palette', 'Entenda os fundamentos', 'Cores, tipografia e espaço — as decisões por trás de tudo.', '/fundamentos/cores'],
          ['button', 'Monte com componentes', 'Playground, código e acessibilidade de cada peça.', '/componentes/botao'],
          ['megaphone', 'Acompanhe as novidades', 'O que mudou em cada versão e o que vem por aí.', '/novidades'],
        ]
          .map(
            ([ic, title, text, href]) => `<a class="gs-next__card" href="#${href}">
              <span class="gs-next__icon">${icon(ic, { size: 20 })}</span>
              <span class="gs-next__title">${title}${icon('arrow-up-right', { size: 18, className: 'gs-next__arrow' })}</span>
              <span class="gs-next__text">${text}</span>
            </a>`,
          )
          .join('')}
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'primeira-tela',
    controls: [
      {
        id: 'example',
        label: 'Ponto de partida',
        value: 'form',
        options: [
          { value: 'form', label: 'Formulário' },
          { value: 'panel', label: 'Painel' },
          { value: 'settings', label: 'Lista de ajustes' },
        ],
      },
    ],
    render: (s) => EXAMPLES[s.example],
    code: (s) => EXAMPLES[s.example],
  });

  const chip = root.querySelector('[data-brand-chip]');
  const label = (value) => (chip.querySelector('[data-label]').textContent = BRANDS.find((b) => b.value === value).label);
  label(getBrand());
  const brandMenu = attachMenu(chip, {
    label: 'Cor da marca',
    value: getBrand(),
    options: brandOptions(),
    onChange: (value) => {
      applyBrand(value);
      label(value);
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
