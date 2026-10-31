import { icon } from '../../ds/icons/icons.js';
import { attachMenu, menuContent } from '../../ds/js/menu.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/menu.css'];

/* ───────── Dados ───────── */

const SORT = [
  { value: 'recent', label: 'Mais recentes', icon: 'clock' },
  { value: 'name', label: 'Nome', icon: 'type' },
  { value: 'size', label: 'Tamanho', icon: 'bar-chart' },
  { value: 'kind', label: 'Tipo de arquivo', icon: 'file-text' },
];

const ACTIONS = [
  { value: 'duplicate', label: 'Duplicar', icon: 'copy', shortcut: '⌘D' },
  { value: 'rename', label: 'Renomear', icon: 'pencil', shortcut: '⌘R' },
  { value: 'move', label: 'Mover para…', icon: 'folder' },
  { type: 'separator' },
  { value: 'archive', label: 'Arquivar', icon: 'inbox' },
  { value: 'delete', label: 'Excluir', icon: 'trash', tone: 'danger' },
];

const SHOWCASE_ACTIONS = [
  { type: 'group', label: 'Arquivo' },
  { value: 'duplicate', label: 'Duplicar', icon: 'copy', shortcut: '⌘D' },
  { value: 'export', label: 'Exportar PDF', icon: 'download', shortcut: '⌘E' },
  { value: 'share', label: 'Compartilhar', icon: 'link', disabled: true },
  { type: 'separator' },
  { value: 'delete', label: 'Excluir', icon: 'trash', tone: 'danger' },
];

const stripIcons = (options) => options.map(({ icon: _i, ...rest }) => rest);
const labelOf = (options, value) => options.find((o) => o.value === value)?.label ?? value;
const chevron = `<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>`;

function optionsFor(state) {
  const base = state.mode === 'action' ? ACTIONS : SORT;
  return state.icons === 'yes' ? base : stripIcons(base);
}

/* ───────── Playground ───────── */

function trigger(state, value) {
  const action = state.mode === 'action';
  if (state.trigger === 'icon') {
    return `<button type="button" class="ds-icon-btn ds-icon-btn--outline" data-mn-trigger aria-label="${action ? 'Mais opções' : 'Ordenar'}">${icon(action ? 'more-horizontal' : 'filter')}</button>`;
  }
  if (state.trigger === 'button') {
    return `<button type="button" class="ds-btn ds-btn--secondary" data-mn-trigger>${action ? 'Ações' : `Ordenar: <span data-mn-label>${labelOf(SORT, value)}</span>`}${icon('chevron-down', { size: 16 })}</button>`;
  }
  return `<button type="button" class="ds-chip" data-mn-trigger>${action ? '' : `<span class="ds-chip__icon">${icon('filter', { size: 16 })}</span>`}<span data-mn-label>${action ? 'Ações' : labelOf(SORT, value)}</span>${chevron}</button>`;
}

const staticMenu = (opts) => `<div class="ds-menu mn-static"${opts.mode === 'action' ? ' data-mode="action"' : ''} data-open inert>${menuContent(opts)}</div>`;

function menuCode(state) {
  const action = state.mode === 'action';
  const options = optionsFor(state);
  const fmt = (o) => {
    if (o.type === 'separator') return "    { type: 'separator' },";
    const parts = [`value: '${o.value}'`, `label: '${o.label}'`];
    if (o.icon) parts.push(`icon: '${o.icon}'`);
    if (o.shortcut) parts.push(`shortcut: '${o.shortcut}'`);
    if (o.tone) parts.push(`tone: '${o.tone}'`);
    return `    { ${parts.join(', ')} },`;
  };
  return [
    "import { attachMenu } from './ds/js/menu.js';",
    '',
    `const menu = attachMenu(gatilho, {`,
    action ? "  mode: 'action'," : null,
    state.label === 'yes' ? `  label: '${action ? 'Ações' : 'Ordenar por'}',` : null,
    action ? null : "  value: 'recent',",
    '  options: [',
    ...options.map(fmt),
    '  ],',
    `  onChange: (valor) => ${action ? 'executar(valor)' : 'ordenar(valor)'},`,
    '});',
    '',
    '// ao sair da página: menu.destroy();',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/* ───────── Página ───────── */

export default function renderMenu(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Menu</h1>
        <p class="doc-header__lead">Uma lista de opções que abre a partir de um gatilho. Serve para escolher um valor — como nos chips — ou para disparar ações.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">modos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tipos de item</dt><dd class="doc-stat__value">6</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">teclas</dt><dd class="doc-stat__value">8</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">função</dt><dd class="doc-stat__value">attachMenu</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['modos', 'Modos'],
        ['itens', 'Itens'],
        ['teclado', 'Teclado'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="playground-title">Playground</h2>
          <p class="doc-section__desc">Abra o menu pelo gatilho — com clique ou com ↓ no teclado. Ao lado, a prévia do que vai abrir.</p>
        </div>
      </header>
      ${playgroundMarkup('menu')}
    </section>

    <section class="doc-section" id="modos" aria-labelledby="modos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="modos-title">Modos</h2>
          <p class="doc-section__desc">A mesma função, dois trabalhos. Escolha pelo que acontece depois do clique.</p>
        </div>
      </header>
      <div class="mn-modes">
        <article class="cd-example">
          <div class="cd-example__preview">
            <button type="button" class="ds-chip" data-mn-demo="radio"><span class="ds-chip__icon">${icon('filter', { size: 16 })}</span><span data-mn-label>Mais recentes</span>${chevron}</button>
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">Seleção<code>mode: 'radio'</code></p>
            <p class="cd-example__text">Guarda um valor. O item atual ganha a marca e o gatilho mostra a escolha. É o padrão.</p>
          </div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview">
            <button type="button" class="ds-icon-btn ds-icon-btn--outline" data-mn-demo="action" aria-label="Mais opções" data-ds-tooltip="Mais opções" data-ds-tooltip-placement="bottom">${icon('more-horizontal')}</button>
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">Ação<code>mode: 'action'</code></p>
            <p class="cd-example__text">Dispara um comando e some. Sem marca de seleção; aceita atalhos, separadores e item de perigo.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="itens" aria-labelledby="itens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="itens-title">Itens</h2>
          <p class="doc-section__desc">Cada item é um objeto em <code class="ds-inline-code">options</code>. Os especiais organizam a lista sem virar opção.</p>
        </div>
      </header>
      <div class="mn-items">
        <div class="mn-items__menus" aria-hidden="true">
          ${staticMenu({ label: 'Ordenar por', options: SORT, value: 'name' })}
          ${staticMenu({ mode: 'action', options: SHOWCASE_ACTIONS })}
        </div>
        <ul class="mn-items__legend" role="list">
          ${[
            ['Rótulo do menu', "label: 'Ordenar por'", 'Opcional. Diz o que está sendo escolhido e vira o nome do menu.'],
            ['Item com ícone', "{ value, label, icon: 'clock' }", 'Ícone de 18 px à esquerda. Use em todos os itens ou em nenhum.'],
            ['Selecionado', "value: 'name'", 'No modo seleção, a marca na cor da marca indica o valor atual.'],
            ['Grupo', "{ type: 'group', label: 'Arquivo' }", 'Um título pequeno para separar assuntos numa lista longa.'],
            ['Atalho', "shortcut: '⌘D'", 'Só no modo ação. Ensina a tecla sem ocupar espaço.'],
            ['Desativado', 'disabled: true', 'Fica visível, mas pulado pelo teclado. Prefira esconder se nunca vai funcionar.'],
            ['Separador', "{ type: 'separator' }", 'Uma linha entre blocos — antes do que é destrutivo, por exemplo.'],
            ['Perigo', "tone: 'danger'", 'Para excluir e afins. Sempre por último, depois de um separador.'],
          ]
            .map(
              ([title, code, text]) => `<li class="mn-legend">
                <p class="mn-legend__title">${title}<code class="ds-inline-code">${code}</code></p>
                <p class="mn-legend__text">${text}</p>
              </li>`,
            )
            .join('')}
        </ul>
      </div>
    </section>

    <section class="doc-section" id="teclado" aria-labelledby="teclado-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="teclado-title">Teclado</h2>
          <p class="doc-section__desc">Tudo que dá para fazer com o mouse dá para fazer sem ele.</p>
        </div>
      </header>
      <div class="doc-table mn-keys">
        <div class="doc-table__head" aria-hidden="true"><span>Tecla</span><span>No gatilho</span><span>Com o menu aberto</span></div>
        ${[
          [['↓'], 'Abre o menu no item atual', 'Vai para o próximo item (dá a volta no fim)'],
          [['↑'], 'Abre o menu (no modo ação, pelo último item)', 'Vai para o item anterior'],
          [['Home'], '—', 'Primeiro item'],
          [['End'], '—', 'Último item'],
          [['Enter'], 'Abre ou fecha', 'Escolhe o item com foco'],
          [['Espaço'], 'Abre ou fecha', 'Escolhe o item com foco'],
          [['A–Z'], '—', 'Pula para o próximo item que começa com a letra'],
          [['Esc'], '—', 'Fecha e devolve o foco ao gatilho'],
          [['Tab'], '—', 'Fecha e segue para o próximo elemento'],
        ]
          .map(
            ([keys, onTrigger, onMenu]) => `<div class="doc-table__row">
              <span class="mn-keys__keys">${keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('')}</span>
              <span class="mn-keys__text">${onTrigger}</span>
              <span class="mn-keys__text">${onMenu}</span>
            </div>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">attachMenu já liga os atributos ARIA no gatilho e no menu.</p>
        </div>
      </header>
      ${a11yList([
        ['Gatilho anunciado', 'Recebe <code class="ds-inline-code">aria-haspopup="menu"</code>, <code class="ds-inline-code">aria-expanded</code> e <code class="ds-inline-code">aria-controls</code> — o leitor de tela sabe que abre algo.'],
        ['Papéis certos', 'Seleção usa <code class="ds-inline-code">menuitemradio</code> com <code class="ds-inline-code">aria-checked</code>; ação usa <code class="ds-inline-code">menuitem</code>.'],
        ['Foco com sentido', 'Ao abrir, vai para o item selecionado (ou o primeiro). Ao fechar com Esc ou escolher, volta ao gatilho.', ['↓', 'Esc']],
        ['Fecha sozinho', 'Clique fora, rolar a página ou redimensionar fecham o menu sem prender ninguém.'],
        ['Botão de ícone com nome', 'Se o gatilho é só um ícone, dê <code class="ds-inline-code">aria-label</code> e uma dica.'],
        ['Não depende da cor', 'O selecionado tem marca; o perigo tem ícone e posição própria, além da cor.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Flutua acima do conteúdo, por isso borda forte e sombra maior.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', 'Fundo'],
        ['color.border.strong', 'Borda'],
        ['radius.lg', 'Raio do menu'],
        ['shadow.xl', 'Sombra'],
        ['text.label-md', 'Itens'],
        ['color.bg.hover', 'Item com foco'],
        ['color.fg.brand', 'Marca de selecionado'],
        ['color.danger.fg', 'Item de perigo'],
        ['color.danger.subtle', 'Perigo com foco'],
        ['color.border.subtle', 'Separador'],
        ['duration.fast', 'Abrir e fechar'],
        ['easing.emphasized', 'Curva do deslize'],
        ['z.popover', 'Camada'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Menu esconde opções. Vale a pena quando são muitas para mostrar e poucas para buscar.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: de 3 a 12 opções</p>
          <p class="usage-card__text">Ordenação, filtros, ações secundárias de um item — o que não precisa estar sempre visível.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: 2 opções ou 40</p>
          <p class="usage-card__text">Duas cabem num controle segmentado ou em chips. Dezenas pedem uma seleção com busca.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Destrutivo por último</p>
          <div class="mn-usage" inert>${staticMenu({ mode: 'action', options: [{ value: 'a', label: 'Renomear', icon: 'pencil' }, { type: 'separator' }, { value: 'b', label: 'Excluir', icon: 'trash', tone: 'danger' }] })}</div>
          <p class="usage-card__text">Separado por uma linha, longe do que é seguro clicar.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  let previewMenu = null;
  let sortValue = 'recent';
  let state = null;

  const attachPreview = () => {
    previewMenu?.destroy();
    previewMenu = null;
    const trig = root.querySelector('[data-playground="menu"] [data-mn-trigger]');
    if (!trig || !state) return;
    const action = state.mode === 'action';
    const options = optionsFor(state);
    previewMenu = attachMenu(trig, {
      mode: action ? 'action' : 'radio',
      label: state.label === 'yes' ? (action ? 'Ações' : 'Ordenar por') : undefined,
      value: sortValue,
      options,
      onChange: (value) => {
        if (action) return toast(`${labelOf(options, value)}: feito`, { tone: value === 'delete' ? 'danger' : 'neutral', icon: options.find((o) => o.value === value)?.icon });
        sortValue = value;
        const label = trig.querySelector('[data-mn-label]');
        if (label) label.textContent = labelOf(SORT, value);
        const preview = root.querySelector('[data-playground="menu"] .mn-pg__static');
        if (preview) preview.innerHTML = staticMenu({ label: state.label === 'yes' ? 'Ordenar por' : undefined, options, value });
        toast(`Ordenado por: ${labelOf(SORT, value).toLowerCase()}`);
      },
    });
  };

  const unmountPlayground = mountPlayground(root, {
    id: 'menu',
    controls: [
      { id: 'mode', label: 'Modo', value: 'radio', options: [{ value: 'radio', label: 'Seleção' }, { value: 'action', label: 'Ação' }] },
      { id: 'trigger', label: 'Gatilho', value: 'chip', options: [{ value: 'chip', label: 'Chip' }, { value: 'button', label: 'Botão' }, { value: 'icon', label: 'Botão de ícone' }] },
      { id: 'icons', label: 'Ícones', value: 'yes', options: [{ value: 'yes', label: 'Com ícones' }, { value: 'no', label: 'Sem ícones' }] },
      { id: 'label', label: 'Rótulo', value: 'yes', options: [{ value: 'yes', label: 'Com rótulo' }, { value: 'no', label: 'Sem rótulo' }] },
    ],
    render: (next) => {
      state = next;
      // o menu real é ligado depois que o HTML entra na página
      queueMicrotask(attachPreview);
      const action = next.mode === 'action';
      return `<div class="mn-pg">
        <div class="mn-pg__trigger">${trigger(next, sortValue)}<p class="mn-pg__hint">Clique ou use ↓</p></div>
        <div class="mn-pg__static" aria-hidden="true">${staticMenu({ mode: next.mode, label: next.label === 'yes' ? (action ? 'Ações' : 'Ordenar por') : undefined, options: optionsFor(next), value: sortValue })}</div>
      </div>`;
    },
    code: menuCode,
  });

  // menus fixos da seção "Modos"
  const demoRadio = root.querySelector('[data-mn-demo="radio"]');
  const demoAction = root.querySelector('[data-mn-demo="action"]');
  const modeMenus = [
    attachMenu(demoRadio, {
      label: 'Ordenar por',
      value: 'recent',
      options: SORT,
      onChange: (value) => (demoRadio.querySelector('[data-mn-label]').textContent = labelOf(SORT, value)),
    }),
    attachMenu(demoAction, {
      mode: 'action',
      options: ACTIONS,
      onChange: (value) => toast(`${labelOf(ACTIONS, value)}: feito`, { tone: value === 'delete' ? 'danger' : 'neutral', icon: ACTIONS.find((o) => o.value === value)?.icon }),
    }),
  ];

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    previewMenu?.destroy();
    modeMenus.forEach((m) => m.destroy());
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
