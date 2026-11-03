import { icon } from '../../ds/icons/icons.js';
import { attachMenu, menuContent } from '../../ds/js/menu.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, codeBlock } from '../component-doc.js';
import { navigation } from '../nav.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/menu.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const SORT = () => [
  { value: 'recent', label: L('Mais recentes', 'Most recent', 'Más recientes'), icon: 'clock' },
  { value: 'name', label: L('Nome', 'Name', 'Nombre'), icon: 'type' },
  { value: 'size', label: L('Tamanho', 'Size', 'Tamaño'), icon: 'bar-chart' },
  { value: 'kind', label: L('Tipo de arquivo', 'File type', 'Tipo de archivo'), icon: 'file-text' },
];

const ACTIONS = () => [
  { value: 'duplicate', label: L('Duplicar', 'Duplicate', 'Duplicar'), icon: 'copy', shortcut: '⌘D' },
  { value: 'rename', label: L('Renomear', 'Rename', 'Renombrar'), icon: 'pencil', shortcut: '⌘R' },
  { value: 'move', label: L('Mover para…', 'Move to…', 'Mover a…'), icon: 'folder' },
  { type: 'separator' },
  { value: 'archive', label: L('Arquivar', 'Archive', 'Archivar'), icon: 'inbox' },
  { value: 'delete', label: L('Excluir', 'Delete', 'Eliminar'), icon: 'trash', tone: 'danger' },
];

const SHOWCASE_ACTIONS = () => [
  { type: 'group', label: L('Arquivo', 'File', 'Archivo') },
  { value: 'duplicate', label: L('Duplicar', 'Duplicate', 'Duplicar'), icon: 'copy', shortcut: '⌘D' },
  { value: 'export', label: L('Exportar PDF', 'Export PDF', 'Exportar PDF'), icon: 'download', shortcut: '⌘E' },
  { value: 'share', label: L('Compartilhar', 'Share', 'Compartir'), icon: 'link', disabled: true },
  { type: 'separator' },
  { value: 'delete', label: L('Excluir', 'Delete', 'Eliminar'), icon: 'trash', tone: 'danger' },
];

const sortBy = () => L('Ordenar por', 'Sort by', 'Ordenar por');
const actionsLabel = () => L('Ações', 'Actions', 'Acciones');
const done = (label) => L(`${label}: feito`, `${label}: done`, `${label}: hecho`);

const stripIcons = (options) => options.map(({ icon: _i, ...rest }) => rest);
const labelOf = (options, value) => options.find((o) => o.value === value)?.label ?? value;
const chevron = `<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>`;

function optionsFor(state) {
  const base = state.mode === 'action' ? ACTIONS() : SORT();
  return state.icons === 'yes' ? base : stripIcons(base);
}

/* ───────── Playground ───────── */

function trigger(state, value) {
  const action = state.mode === 'action';
  if (state.trigger === 'icon') {
    return `<button type="button" class="ds-icon-btn ds-icon-btn--outline" data-mn-trigger aria-label="${action ? L('Mais opções', 'More options', 'Más opciones') : L('Ordenar', 'Sort', 'Ordenar')}">${icon(action ? 'more-horizontal' : 'filter')}</button>`;
  }
  if (state.trigger === 'button') {
    return `<button type="button" class="ds-btn ds-btn--secondary" data-mn-trigger>${action ? actionsLabel() : `${L('Ordenar', 'Sort', 'Ordenar')}: <span data-mn-label>${labelOf(SORT(), value)}</span>`}${icon('chevron-down', { size: 16 })}</button>`;
  }
  return `<button type="button" class="ds-chip" data-mn-trigger>${action ? '' : `<span class="ds-chip__icon">${icon('filter', { size: 16 })}</span>`}<span data-mn-label>${action ? actionsLabel() : labelOf(SORT(), value)}</span>${chevron}</button>`;
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
    `const menu = attachMenu(${L('gatilho', 'trigger', 'disparador')}, {`,
    action ? "  mode: 'action'," : null,
    state.label === 'yes' ? `  label: '${action ? actionsLabel() : sortBy()}',` : null,
    action ? null : "  value: 'recent',",
    '  options: [',
    ...options.map(fmt),
    '  ],',
    `  onChange: (${L('valor', 'value', 'valor')}) => ${action ? L('executar(valor)', 'run(value)', 'ejecutar(valor)') : L('ordenar(valor)', 'sort(value)', 'ordenar(valor)')},`,
    '});',
    '',
    L('// ao sair da página: menu.destroy();', '// when leaving the page: menu.destroy();', '// al salir de la página: menu.destroy();'),
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/* ───────── Página ───────── */

export default function renderMenu(page) {
  const sort = SORT();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Uma lista de opções que abre a partir de um gatilho. Serve para escolher um valor — como nos chips — ou para disparar ações.', 'A list of options that opens from a trigger. It’s for picking a value — like in chips — or for running actions.', 'Una lista de opciones que se abre desde un disparador. Sirve para elegir un valor — como en los chips — o para ejecutar acciones.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('modos', 'modes', 'modos')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tipos de item', 'item types', 'tipos de elemento')}</dt><dd class="doc-stat__value">6</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('teclas', 'keys', 'teclas')}</dt><dd class="doc-stat__value">8</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('função', 'function', 'función')}</dt><dd class="doc-stat__value">attachMenu</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['modos', L('Modos', 'Modes', 'Modos')],
        ['colunas', L('Colunas', 'Columns', 'Columnas')],
        ['itens', L('Itens', 'Items', 'Elementos')],
        ['teclado', L('Teclado', 'Keyboard', 'Teclado')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="playground-title">Playground</h2>
          <p class="doc-section__desc">${L('Abra o menu pelo gatilho — com clique ou com ↓ no teclado. Ao lado, a prévia do que vai abrir.', 'Open the menu from the trigger — with a click or ↓ on the keyboard. Next to it, a preview of what will open.', 'Abre el menú desde el disparador — con un clic o con ↓ en el teclado. Al lado, la vista previa de lo que se abrirá.')}</p>
        </div>
      </header>
      ${playgroundMarkup('menu')}
    </section>

    <section class="doc-section" id="modos" aria-labelledby="modos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="modos-title">${L('Modos', 'Modes', 'Modos')}</h2>
          <p class="doc-section__desc">${L('A mesma função, dois trabalhos. Escolha pelo que acontece depois do clique.', 'The same function, two jobs. Choose by what happens after the click.', 'La misma función, dos trabajos. Elige según lo que pasa después del clic.')}</p>
        </div>
      </header>
      <div class="mn-modes">
        <article class="cd-example">
          <div class="cd-example__preview">
            <button type="button" class="ds-chip" data-mn-demo="radio"><span class="ds-chip__icon">${icon('filter', { size: 16 })}</span><span data-mn-label>${sort[0].label}</span>${chevron}</button>
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">${L('Seleção', 'Selection', 'Selección')}<code>mode: 'radio'</code></p>
            <p class="cd-example__text">${L('Guarda um valor. O item atual ganha a marca e o gatilho mostra a escolha. É o padrão.', 'Holds a value. The current item gets the mark and the trigger shows the choice. It’s the default.', 'Guarda un valor. El elemento actual gana la marca y el disparador muestra la elección. Es el predeterminado.')}</p>
          </div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview">
            <button type="button" class="ds-icon-btn ds-icon-btn--outline" data-mn-demo="action" aria-label="${L('Mais opções', 'More options', 'Más opciones')}" data-ds-tooltip="${L('Mais opções', 'More options', 'Más opciones')}" data-ds-tooltip-placement="bottom">${icon('more-horizontal')}</button>
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">${L('Ação', 'Action', 'Acción')}<code>mode: 'action'</code></p>
            <p class="cd-example__text">${L('Dispara um comando e some. Sem marca de seleção; aceita atalhos, separadores e item de perigo.', 'Runs a command and disappears. No selection mark; supports shortcuts, separators, and a danger item.', 'Ejecuta un comando y desaparece. Sin marca de selección; admite atajos, separadores y un elemento de peligro.')}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="colunas" aria-labelledby="colunas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="colunas-title">${L('Colunas', 'Columns', 'Columnas')}</h2>
          <p class="doc-section__desc">${L('Lista longa não rola nem vira um menu gigante: com maxRows, cada coluna leva no máximo esse número de itens e o resto segue para a coluna do lado, dividido por igual. É o que a navbar usa nos grupos.', 'A long list doesn’t scroll or turn into a giant menu: with maxRows, each column holds at most that many items and the rest moves to the next column, split evenly. It’s what the navbar uses for its groups.', 'Una lista larga no se desplaza ni se vuelve un menú gigante: con maxRows, cada columna lleva como máximo esa cantidad de elementos y el resto pasa a la columna de al lado, repartido por igual. Es lo que usa la navbar en sus grupos.')}</p>
        </div>
      </header>
      <article class="cd-example">
        <div class="cd-example__preview">
          <button type="button" class="ds-chip" data-mn-demo="columns"><span>${navigation.find((g) => g.id === 'componentes').label}</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
        </div>
        <div class="cd-example__body">
          <p class="cd-example__name">${L('Em colunas', 'In columns', 'En columnas')}<code>maxRows: 5</code></p>
          <p class="cd-example__text">${L('16 itens com até 5 por coluna viram 4 colunas de 4 — não 5, 5, 5 e 1. ↑/↓ descem a coluna e passam para a próxima; ←/→ pulam de coluna. Perto da borda, o menu desliza para caber na tela.', '16 items with up to 5 per column become 4 columns of 4 — not 5, 5, 5, and 1. ↑/↓ go down the column and on to the next; ←/→ jump between columns. Near the edge, the menu slides to fit on screen.', '16 elementos con hasta 5 por columna se vuelven 4 columnas de 4 — no 5, 5, 5 y 1. ↑/↓ bajan por la columna y pasan a la siguiente; ←/→ saltan de columna. Cerca del borde, el menú se desliza para caber en la pantalla.')}</p>
        </div>
      </article>
      ${codeBlock(`attachMenu(${L('botao', 'button', 'boton')}, {
  label: '${navigation.find((g) => g.id === 'componentes').label}',
  options: ${L('paginas', 'pages', 'paginas')}.map((p) => ({ value: p.href, label: p.label, icon: p.icon })),
  maxRows: 5,   // ${L('no máximo 5 por coluna, equilibrado', 'at most 5 per column, balanced', 'como máximo 5 por columna, equilibrado')}
  onChange: (href) => (location.hash = href),
});`)}
    </section>

    <section class="doc-section" id="itens" aria-labelledby="itens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="itens-title">${L('Itens', 'Items', 'Elementos')}</h2>
          <p class="doc-section__desc">${L(`Cada item é um objeto em ${ic('options')}. Os especiais organizam a lista sem virar opção.`, `Each item is an object in ${ic('options')}. The special ones organize the list without becoming options.`, `Cada elemento es un objeto en ${ic('options')}. Los especiales organizan la lista sin volverse opciones.`)}</p>
        </div>
      </header>
      <div class="mn-items">
        <div class="mn-items__menus" aria-hidden="true">
          ${staticMenu({ label: sortBy(), options: sort, value: 'name' })}
          ${staticMenu({ mode: 'action', options: SHOWCASE_ACTIONS() })}
        </div>
        <ul class="mn-items__legend" role="list">
          ${[
            [L('Rótulo do menu', 'Menu label', 'Etiqueta del menú'), `label: '${sortBy()}'`, L('Opcional. Diz o que está sendo escolhido e vira o nome do menu.', 'Optional. Says what’s being chosen and becomes the menu’s name.', 'Opcional. Dice qué se está eligiendo y se vuelve el nombre del menú.')],
            [L('Item com ícone', 'Item with icon', 'Elemento con ícono'), "{ value, label, icon: 'clock' }", L('Ícone de 18 px à esquerda. Use em todos os itens ou em nenhum.', 'An 18 px icon on the left. Use it on every item or on none.', 'Ícono de 18 px a la izquierda. Úsalo en todos los elementos o en ninguno.')],
            [L('Selecionado', 'Selected', 'Seleccionado'), "value: 'name'", L('No modo seleção, a marca na cor da marca indica o valor atual.', 'In selection mode, the mark in the brand color shows the current value.', 'En el modo selección, la marca en el color de la marca indica el valor actual.')],
            [L('Grupo', 'Group', 'Grupo'), `{ type: 'group', label: '${L('Arquivo', 'File', 'Archivo')}' }`, L('Um título pequeno para separar assuntos numa lista longa.', 'A small heading to separate topics in a long list.', 'Un título pequeño para separar temas en una lista larga.')],
            [L('Atalho', 'Shortcut', 'Atajo'), "shortcut: '⌘D'", L('Só no modo ação. Ensina a tecla sem ocupar espaço.', 'Action mode only. Teaches the key without taking up space.', 'Solo en el modo acción. Enseña la tecla sin ocupar espacio.')],
            [L('Desativado', 'Disabled', 'Desactivado'), 'disabled: true', L('Fica visível, mas pulado pelo teclado. Prefira esconder se nunca vai funcionar.', 'Stays visible but is skipped by the keyboard. Prefer hiding it if it will never work.', 'Queda visible, pero el teclado lo salta. Prefiere ocultarlo si nunca va a funcionar.')],
            [L('Separador', 'Separator', 'Separador'), "{ type: 'separator' }", L('Uma linha entre blocos — antes do que é destrutivo, por exemplo.', 'A line between blocks — before what’s destructive, for example.', 'Una línea entre bloques — antes de lo destructivo, por ejemplo.')],
            [L('Perigo', 'Danger', 'Peligro'), "tone: 'danger'", L('Para excluir e afins. Sempre por último, depois de um separador.', 'For delete and the like. Always last, after a separator.', 'Para eliminar y similares. Siempre al final, después de un separador.')],
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
          <h2 class="doc-section__title" id="teclado-title">${L('Teclado', 'Keyboard', 'Teclado')}</h2>
          <p class="doc-section__desc">${L('Tudo que dá para fazer com o mouse dá para fazer sem ele.', 'Everything you can do with the mouse, you can do without it.', 'Todo lo que se puede hacer con el ratón se puede hacer sin él.')}</p>
        </div>
      </header>
      <div class="doc-table mn-keys">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Tecla', 'Key', 'Tecla')}</span><span>${L('No gatilho', 'On the trigger', 'En el disparador')}</span><span>${L('Com o menu aberto', 'With the menu open', 'Con el menú abierto')}</span></div>
        ${[
          [['↓'], L('Abre o menu no item atual', 'Opens the menu on the current item', 'Abre el menú en el elemento actual'), L('Vai para o próximo item (dá a volta no fim)', 'Moves to the next item (wraps at the end)', 'Va al siguiente elemento (vuelve al principio al final)')],
          [['↑'], L('Abre o menu (no modo ação, pelo último item)', 'Opens the menu (in action mode, on the last item)', 'Abre el menú (en el modo acción, por el último elemento)'), L('Vai para o item anterior', 'Moves to the previous item', 'Va al elemento anterior')],
          [['Home'], '—', L('Primeiro item', 'First item', 'Primer elemento')],
          [['End'], '—', L('Último item', 'Last item', 'Último elemento')],
          [['Enter'], L('Abre ou fecha', 'Opens or closes', 'Abre o cierra'), L('Escolhe o item com foco', 'Picks the focused item', 'Elige el elemento con foco')],
          [[L('Espaço', 'Space', 'Espacio')], L('Abre ou fecha', 'Opens or closes', 'Abre o cierra'), L('Escolhe o item com foco', 'Picks the focused item', 'Elige el elemento con foco')],
          [['A–Z'], '—', L('Pula para o próximo item que começa com a letra', 'Jumps to the next item starting with that letter', 'Salta al siguiente elemento que empieza con la letra')],
          [['Esc'], '—', L('Fecha e devolve o foco ao gatilho', 'Closes and returns focus to the trigger', 'Cierra y devuelve el foco al disparador')],
          [['Tab'], '—', L('Fecha e segue para o próximo elemento', 'Closes and moves on to the next element', 'Cierra y sigue al siguiente elemento')],
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
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('attachMenu já liga os atributos ARIA no gatilho e no menu.', 'attachMenu already sets the ARIA attributes on the trigger and the menu.', 'attachMenu ya pone los atributos ARIA en el disparador y en el menú.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Gatilho anunciado', 'An announced trigger', 'Disparador anunciado'), L(`Recebe ${ic('aria-haspopup="menu"')}, ${ic('aria-expanded')} e ${ic('aria-controls')} — o leitor de tela sabe que abre algo.`, `Gets ${ic('aria-haspopup="menu"')}, ${ic('aria-expanded')}, and ${ic('aria-controls')} — the screen reader knows it opens something.`, `Recibe ${ic('aria-haspopup="menu"')}, ${ic('aria-expanded')} y ${ic('aria-controls')} — el lector de pantalla sabe que abre algo.`)],
        [L('Papéis certos', 'The right roles', 'Los roles correctos'), L(`Seleção usa ${ic('menuitemradio')} com ${ic('aria-checked')}; ação usa ${ic('menuitem')}.`, `Selection uses ${ic('menuitemradio')} with ${ic('aria-checked')}; action uses ${ic('menuitem')}.`, `La selección usa ${ic('menuitemradio')} con ${ic('aria-checked')}; la acción usa ${ic('menuitem')}.`)],
        [L('Foco com sentido', 'Focus that makes sense', 'Foco con sentido'), L('Ao abrir, vai para o item selecionado (ou o primeiro). Ao fechar com Esc ou escolher, volta ao gatilho.', 'On open, it goes to the selected item (or the first). On closing with Esc or picking, it returns to the trigger.', 'Al abrir, va al elemento seleccionado (o al primero). Al cerrar con Esc o elegir, vuelve al disparador.'), ['↓', 'Esc']],
        [L('Fecha sozinho', 'Closes on its own', 'Se cierra solo'), L('Clique fora, rolar a página ou redimensionar fecham o menu sem prender ninguém.', 'Clicking outside, scrolling the page, or resizing closes the menu without trapping anyone.', 'Hacer clic fuera, desplazar la página o cambiar el tamaño cierran el menú sin atrapar a nadie.')],
        [L('Botão de ícone com nome', 'A named icon button', 'Botón de ícono con nombre'), L(`Se o gatilho é só um ícone, dê ${ic('aria-label')} e uma dica.`, `If the trigger is just an icon, give it an ${ic('aria-label')} and a hint.`, `Si el disparador es solo un ícono, dale ${ic('aria-label')} y una pista.`)],
        [L('Não depende da cor', 'Not color-dependent', 'No depende del color'), L('O selecionado tem marca; o perigo tem ícone e posição própria, além da cor.', 'The selected item has a mark; danger has its own icon and position, besides color.', 'El seleccionado tiene marca; el peligro tiene ícono y posición propia, además del color.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Flutua acima do conteúdo, por isso borda forte e sombra maior.', 'It floats above the content, hence the strong border and larger shadow.', 'Flota sobre el contenido, por eso el borde fuerte y la sombra mayor.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', L('Fundo', 'Background', 'Fondo')],
        ['color.border.strong', L('Borda', 'Border', 'Borde')],
        ['radius.lg', L('Raio do menu', 'Menu radius', 'Radio del menú')],
        ['shadow.xl', L('Sombra', 'Shadow', 'Sombra')],
        ['text.label-md', L('Itens', 'Items', 'Elementos')],
        ['color.bg.hover', L('Item com foco', 'Focused item', 'Elemento con foco')],
        ['color.fg.brand', L('Marca de selecionado', 'Selected mark', 'Marca de seleccionado')],
        ['color.danger.fg', L('Item de perigo', 'Danger item', 'Elemento de peligro')],
        ['color.danger.subtle', L('Perigo com foco', 'Focused danger', 'Peligro con foco')],
        ['color.border.subtle', L('Separador', 'Separator', 'Separador')],
        ['duration.fast', L('Abrir e fechar', 'Open and close', 'Abrir y cerrar')],
        ['easing.emphasized', L('Curva do deslize', 'Slide curve', 'Curva del deslizamiento')],
        ['z.popover', L('Camada', 'Layer', 'Capa')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Menu esconde opções. Vale a pena quando são muitas para mostrar e poucas para buscar.', 'A menu hides options. It’s worth it when there are too many to show and too few to search.', 'El menú esconde opciones. Vale la pena cuando son demasiadas para mostrar y pocas para buscar.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: de 3 a 12 opções', 'Do: 3 to 12 options', 'Haz: de 3 a 12 opciones')}</p>
          <p class="usage-card__text">${L('Ordenação, filtros, ações secundárias de um item — o que não precisa estar sempre visível.', 'Sorting, filters, an item’s secondary actions — what doesn’t need to be always visible.', 'Orden, filtros, acciones secundarias de un elemento — lo que no necesita estar siempre visible.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: 2 opções ou 40', 'Avoid: 2 options or 40', 'Evita: 2 opciones o 40')}</p>
          <p class="usage-card__text">${L('Duas cabem num controle segmentado ou em chips. Dezenas pedem uma seleção com busca.', 'Two fit in a segmented control or chips. Dozens call for a searchable select.', 'Dos caben en un control segmentado o en chips. Decenas piden un selector con búsqueda.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Destrutivo por último', 'Destructive last', 'Lo destructivo al final')}</p>
          <div class="mn-usage" inert>${staticMenu({ mode: 'action', options: [{ value: 'a', label: L('Renomear', 'Rename', 'Renombrar'), icon: 'pencil' }, { type: 'separator' }, { value: 'b', label: L('Excluir', 'Delete', 'Eliminar'), icon: 'trash', tone: 'danger' }] })}</div>
          <p class="usage-card__text">${L('Separado por uma linha, longe do que é seguro clicar.', 'Separated by a line, away from what’s safe to click.', 'Separado por una línea, lejos de lo que es seguro hacer clic.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  let previewMenu = null;
  let sortValue = 'recent';
  let state = null;
  const sort = SORT();
  const actions = ACTIONS();

  const attachPreview = () => {
    previewMenu?.destroy();
    previewMenu = null;
    const trig = root.querySelector('[data-playground="menu"] [data-mn-trigger]');
    if (!trig || !state) return;
    const action = state.mode === 'action';
    const options = optionsFor(state);
    previewMenu = attachMenu(trig, {
      mode: action ? 'action' : 'radio',
      label: state.label === 'yes' ? (action ? actionsLabel() : sortBy()) : undefined,
      value: sortValue,
      options,
      onChange: (value) => {
        if (action) return toast(done(labelOf(options, value)), { tone: value === 'delete' ? 'danger' : 'neutral', icon: options.find((o) => o.value === value)?.icon });
        sortValue = value;
        const label = trig.querySelector('[data-mn-label]');
        if (label) label.textContent = labelOf(sort, value);
        const preview = root.querySelector('[data-playground="menu"] .mn-pg__static');
        if (preview) preview.innerHTML = staticMenu({ label: state.label === 'yes' ? sortBy() : undefined, options, value });
        const chosen = labelOf(sort, value).toLowerCase();
        toast(L(`Ordenado por: ${chosen}`, `Sorted by: ${chosen}`, `Ordenado por: ${chosen}`));
      },
    });
  };

  const unmountPlayground = mountPlayground(root, {
    id: 'menu',
    controls: [
      { id: 'mode', label: L('Modo', 'Mode', 'Modo'), value: 'radio', options: [{ value: 'radio', label: L('Seleção', 'Selection', 'Selección') }, { value: 'action', label: L('Ação', 'Action', 'Acción') }] },
      { id: 'trigger', label: L('Gatilho', 'Trigger', 'Disparador'), value: 'chip', options: [{ value: 'chip', label: 'Chip' }, { value: 'button', label: L('Botão', 'Button', 'Botón') }, { value: 'icon', label: L('Botão de ícone', 'Icon button', 'Botón de ícono') }] },
      { id: 'icons', label: L('Ícones', 'Icons', 'Íconos'), value: 'yes', options: [{ value: 'yes', label: L('Com ícones', 'With icons', 'Con íconos') }, { value: 'no', label: L('Sem ícones', 'Without icons', 'Sin íconos') }] },
      { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: 'yes', options: [{ value: 'yes', label: L('Com rótulo', 'With label', 'Con etiqueta') }, { value: 'no', label: L('Sem rótulo', 'Without label', 'Sin etiqueta') }] },
    ],
    render: (next) => {
      state = next;
      // o menu real é ligado depois que o HTML entra na página
      queueMicrotask(attachPreview);
      const action = next.mode === 'action';
      return `<div class="mn-pg">
        <div class="mn-pg__trigger">${trigger(next, sortValue)}<p class="mn-pg__hint">${L('Clique ou use ↓', 'Click or use ↓', 'Haz clic o usa ↓')}</p></div>
        <div class="mn-pg__static" aria-hidden="true">${staticMenu({ mode: next.mode, label: next.label === 'yes' ? (action ? actionsLabel() : sortBy()) : undefined, options: optionsFor(next), value: sortValue })}</div>
      </div>`;
    },
    code: menuCode,
  });

  // menus fixos da seção "Modos"
  const demoRadio = root.querySelector('[data-mn-demo="radio"]');
  const demoAction = root.querySelector('[data-mn-demo="action"]');
  const demoColumns = root.querySelector('[data-mn-demo="columns"]');
  const componentsGroup = navigation.find((g) => g.id === 'componentes');
  const modeMenus = [
    attachMenu(demoColumns, {
      label: componentsGroup.label,
      options: componentsGroup.items.map((i) => ({ value: i.path, label: i.label, icon: i.icon })),
      maxRows: 5,
      onChange: (path) => (location.hash = path),
    }),
    attachMenu(demoRadio, {
      label: sortBy(),
      value: 'recent',
      options: sort,
      onChange: (value) => (demoRadio.querySelector('[data-mn-label]').textContent = labelOf(sort, value)),
    }),
    attachMenu(demoAction, {
      mode: 'action',
      options: actions,
      onChange: (value) => toast(done(labelOf(actions, value)), { tone: value === 'delete' ? 'danger' : 'neutral', icon: actions.find((o) => o.value === value)?.icon }),
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
