import { icon } from '../../ds/icons/icons.js';
import { createCommandPalette, scoreCommand } from '../../ds/js/command-palette.js';
import { createFilters, filtersToQuery, filtersFromQuery } from '../../ds/js/filters.js';
import { attachMenu } from '../../ds/js/menu.js';
import { toast, copyText } from '../../ds/js/toast.js';
import { locale, dateFormat, numberFormat } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-busca.css'];

/* ───────── Dados de exemplo (um app de pedidos fictício; textos no idioma atual) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
const MOD = isMac ? '⌘' : 'Ctrl';

const goTo = () => L('Ir para', 'Go to', 'Ir a');
const createGroup = () => L('Criar', 'Create', 'Crear');
const actionsGroup = () => L('Ações', 'Actions', 'Acciones');

const COMMANDS = () => [
  { id: 'go-pedidos', label: L('Pedidos', 'Orders', 'Pedidos'), group: goTo(), icon: 'inbox', keywords: L(['vendas', 'compras'], ['sales', 'purchases'], ['ventas', 'compras']) },
  { id: 'go-clientes', label: L('Clientes', 'Customers', 'Clientes'), group: goTo(), icon: 'users', keywords: L(['contatos', 'pessoas'], ['contacts', 'people'], ['contactos', 'personas']) },
  { id: 'go-produtos', label: L('Produtos', 'Products', 'Productos'), group: goTo(), icon: 'package', keywords: L(['estoque', 'catálogo'], ['stock', 'catalog'], ['inventario', 'catálogo']) },
  { id: 'go-relatorios', label: L('Relatórios', 'Reports', 'Informes'), group: goTo(), icon: 'bar-chart', keywords: L(['métricas', 'gráficos'], ['metrics', 'charts'], ['métricas', 'gráficos']) },
  { id: 'new-pedido', label: L('Novo pedido', 'New order', 'Nuevo pedido'), group: createGroup(), icon: 'plus', hint: 'N', keywords: L(['venda'], ['sale'], ['venta']) },
  { id: 'new-cliente', label: L('Novo cliente', 'New customer', 'Nuevo cliente'), group: createGroup(), icon: 'user', keywords: L(['cadastro', 'contato'], ['sign-up', 'contact'], ['registro', 'contacto']) },
  { id: 'export', label: L('Exportar pedidos em CSV', 'Export orders as CSV', 'Exportar pedidos en CSV'), group: actionsGroup(), icon: 'download', keywords: L(['planilha', 'excel'], ['spreadsheet', 'excel'], ['hoja de cálculo', 'excel']) },
  { id: 'archive', label: L('Arquivar pedidos concluídos', 'Archive completed orders', 'Archivar pedidos completados'), group: actionsGroup(), icon: 'folder', description: L('Move para o arquivo os pedidos entregues há mais de 30 dias.', 'Moves orders delivered more than 30 days ago to the archive.', 'Mueve al archivo los pedidos entregados hace más de 30 días.') },
  { id: 'shortcuts', label: L('Ver atalhos de teclado', 'See keyboard shortcuts', 'Ver atajos de teclado'), group: L('Ajuda', 'Help', 'Ayuda'), icon: 'keyboard', hint: '?' },
  { id: 'theme', label: L('Alternar tema', 'Toggle theme', 'Cambiar tema'), group: L('Preferências', 'Preferences', 'Preferencias'), icon: 'moon', keywords: L(['escuro', 'claro', 'dark', 'light'], ['dark', 'light'], ['oscuro', 'claro', 'dark', 'light']) },
];

const TRY = () => L(['rela', 'planilha', 'novo cli', 'pedidos', 'xyz'], ['rep', 'spreadsheet', 'new cus', 'orders', 'xyz'], ['inf', 'hoja', 'nuevo cli', 'pedidos', 'xyz']);
const SCORE_LABEL = () => ({ 3: ['brand', L('começa com', 'starts with', 'empieza con')], 2: ['info', L('contém', 'contains', 'contiene')], 1: ['neutral', L('outro campo', 'other field', 'otro campo')] });

const NAMES = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Ramos', 'Elisa Prado', 'Fábio Teixeira', 'Gabriela Rocha', 'Henrique Alves', 'Isabela Duarte', 'João Pedro Nunes', 'Karina Lopes', 'Lucas Ferreira', 'Marina Costa', 'Nicolas Barros', 'Olívia Martins', 'Paulo Henrique', 'Rafaela Santos', 'Rafael Moreira', 'Sofia Almeida', 'Tiago Ribeiro', 'Úrsula Campos', 'Vinícius Pires', 'Wesley Cardoso', 'Yasmin Freitas'];
const STATUS = () => [
  { value: 'pago', label: L('Pago', 'Paid', 'Pagado'), tone: 'success' },
  { value: 'pendente', label: L('Pendente', 'Pending', 'Pendiente'), tone: 'warning' },
  { value: 'cancelado', label: L('Cancelado', 'Canceled', 'Cancelado'), tone: 'danger' },
  { value: 'reembolsado', label: L('Reembolsado', 'Refunded', 'Reembolsado'), tone: 'neutral' },
];
const CHANNEL_IDS = ['app', 'loja', 'site'];
const CHANNELS = () => [
  { value: 'app', label: 'App' },
  { value: 'loja', label: L('Loja', 'Store', 'Tienda') },
  { value: 'site', label: L('Site', 'Website', 'Sitio web') },
];
const SORTS = () => [
  { value: 'recentes', label: L('Mais recentes', 'Newest', 'Más recientes') },
  { value: 'antigos', label: L('Mais antigos', 'Oldest', 'Más antiguos') },
  { value: 'maior', label: L('Maior valor', 'Highest value', 'Mayor valor') },
  { value: 'menor', label: L('Menor valor', 'Lowest value', 'Menor valor') },
  { value: 'cliente', label: L('Cliente A–Z', 'Customer A–Z', 'Cliente A–Z') },
];
const STATUS_CYCLE = ['pago', 'pago', 'pendente', 'pago', 'cancelado', 'pago', 'pendente', 'reembolsado'];

const ORDERS = NAMES.map((cliente, i) => {
  const day = new Date(2026, 9, 31 - Math.floor(i * 1.3));
  return {
    id: `#${4821 - i * 7}`,
    cliente,
    status: STATUS_CYCLE[(i * 3) % STATUS_CYCLE.length],
    canal: CHANNEL_IDS[(i * 7 + 1) % 3],
    valor: Math.round((84 + ((i * 47) % 260) + (i % 4) * 19.9) * 100) / 100,
    desconto: i % 3 === 1,
    data: day,
  };
});

/* os ids (status, canal, ordem) ficam fixos — só os rótulos mudam com o idioma; a URL continua valendo */
const filterConfig = () => ({
  label: L('Filtrar pedidos', 'Filter orders', 'Filtrar pedidos'),
  search: { placeholder: L('Buscar por cliente ou número', 'Search by customer or number', 'Buscar por cliente o número'), label: L('Buscar pedidos por cliente ou número', 'Search orders by customer or number', 'Buscar pedidos por cliente o número') },
  fields: [
    { id: 'status', label: L('Status', 'Status', 'Estado'), options: STATUS().map(({ value, label }) => ({ value, label })) },
    { id: 'canal', label: L('Canal', 'Channel', 'Canal'), options: CHANNELS() },
  ],
  toggles: [{ id: 'desconto', label: L('Com desconto', 'Discounted', 'Con descuento') }],
  sort: { id: 'ordem', label: L('Ordenar', 'Sort', 'Ordenar'), options: SORTS(), value: 'recentes' },
  noun: L(['pedido', 'pedidos'], ['order', 'orders'], ['pedido', 'pedidos']),
});

const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function applyFilters(state) {
  const q = normalize(state.q).trim();
  const list = ORDERS.filter(
    (o) =>
      (!q || normalize(`${o.cliente} ${o.id}`).includes(q)) &&
      (!state.status || o.status === state.status) &&
      (!state.canal || o.canal === state.canal) &&
      (!state.desconto || o.desconto),
  );
  const by = {
    recentes: (a, b) => b.data - a.data,
    antigos: (a, b) => a.data - b.data,
    maior: (a, b) => b.valor - a.valor,
    menor: (a, b) => a.valor - b.valor,
    cliente: (a, b) => a.cliente.localeCompare(b.cliente, locale()),
  }[state.ordem];
  return by ? [...list].sort(by) : list;
}

/* ───────── Peças ───────── */

const section = (id, title, desc, body) => `
  <section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        <p class="doc-section__desc">${desc}</p>
      </div>
    </header>
    ${body}
  </section>`;

const kbd = (...keys) => keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('');

function rowRenderer() {
  const status = STATUS();
  const channels = CHANNELS();
  const money = numberFormat({ style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol' });
  const dateFmt = dateFormat({ day: '2-digit', month: 'short' });
  const discount = L('Desconto', 'Discount', 'Descuento');
  return (o) => {
    const st = status.find((s) => s.value === o.status);
    return `<tr>
      <td class="pb-orders__id">${o.id}</td>
      <td>${escapeHtml(o.cliente)}${o.desconto ? ` <span class="ds-badge ds-badge--sm ds-badge--brand">${discount}</span>` : ''}</td>
      <td><span class="ds-badge ds-badge--sm${st.tone === 'neutral' ? ' ds-badge--neutral' : ` ds-badge--${st.tone}`}"><span class="ds-badge__dot"></span>${st.label}</span></td>
      <td class="ds-table__muted">${channels.find((c) => c.value === o.canal).label}</td>
      <td class="ds-table__muted">${dateFmt.format(o.data).replace('.', '')}</td>
      <td class="ds-table__num">${money.format(o.valor)}</td>
    </tr>`;
  };
}

/** Prévia estática da paleta, com marcadores. */
const paletteMock = () => {
  const cmds = COMMANDS();
  const find = (id) => cmds.find((c) => c.id === id);
  return `<div class="pb-mock" inert aria-hidden="true">
    <div class="ds-command__search">${icon('search', { size: 20 })}<span class="pb-mock__query">${L('rel', 'rep', 'inf')}<span class="pb-mock__caret"></span></span><kbd class="ds-kbd">Esc</kbd><span class="pb-pin pb-pin--start">1</span></div>
    <div class="ds-command__list">
      <div class="ds-command__group"><div class="ds-command__group-label">${goTo()}<span class="pb-pin pb-pin--inline">2</span></div>
        <div class="ds-command__item" aria-selected="true">${icon('bar-chart', { size: 18 })}<span class="ds-command__label">${find('go-relatorios').label}</span>${icon('corner-down-left', { size: 16, className: 'ds-command__enter' })}<span class="pb-pin pb-pin--end">3</span></div>
      </div>
      <div class="ds-command__group"><div class="ds-command__group-label">${actionsGroup()}</div>
        <div class="ds-command__item">${icon('folder', { size: 18 })}<span class="ds-command__label">${find('archive').label}</span></div>
        <div class="ds-command__item">${icon('keyboard', { size: 18 })}<span class="ds-command__label">${find('shortcuts').label}</span><span class="ds-command__hint">?</span><span class="pb-pin pb-pin--end">4</span></div>
      </div>
    </div>
    <footer class="ds-command__footer"><span>${kbd('↑', '↓')} ${L('navegar', 'navigate', 'navegar')}</span><span>${kbd('↵')} ${L('abrir', 'open', 'abrir')}</span><span>${kbd('Esc')} ${L('fechar', 'close', 'cerrar')}</span><span class="pb-pin pb-pin--end">5</span></footer>
  </div>`;
};

const PALETTE_PARTS = () => [
  [L('Campo de busca', 'Search field', 'Campo de búsqueda'), L('Já vem focado. Digitar filtra na hora — sem botão de buscar.', 'It comes focused. Typing filters right away — no search button.', 'Ya viene enfocado. Escribir filtra al instante — sin botón de buscar.')],
  [L('Grupo', 'Group', 'Grupo'), L('Agrupa por intenção: ir para, criar, ações, ajuda. A ordem dos grupos é a de registro.', 'Groups by intent: go to, create, actions, help. Group order is registration order.', 'Agrupa por intención: ir a, crear, acciones, ayuda. El orden de los grupos es el de registro.')],
  [L('Item ativo', 'Active item', 'Elemento activo'), L('Fundo de seleção e o ↵ à direita. ↑ ↓ movem; o mouse também move.', 'Selection background and ↵ on the right. ↑ ↓ move; the mouse moves too.', 'Fondo de selección y el ↵ a la derecha. ↑ ↓ mueven; el mouse también.')],
  [L('Dica', 'Hint', 'Pista'), L('Um atalho ou um estado curto (“Em breve”). Nunca uma frase.', 'A shortcut or a short state (“Coming soon”). Never a sentence.', 'Un atajo o un estado corto (“Próximamente”). Nunca una frase.')],
  [L('Rodapé', 'Footer', 'Pie'), L('Lembra as teclas. Some no celular, onde não há teclado físico.', 'Reminds you of the keys. It disappears on phones, where there’s no physical keyboard.', 'Recuerda las teclas. Desaparece en el móvil, donde no hay teclado físico.')],
];

const paletteCode = () => `import { createCommandPalette } from './ds/js/command-palette.js';

const palette = createCommandPalette({
  placeholder: '${L('Buscar páginas e ações…', 'Search pages and actions…', 'Buscar páginas y acciones…')}',
  items: () => [
    { id: '${L('pedidos', 'orders', 'pedidos')}', label: '${L('Pedidos', 'Orders', 'Pedidos')}', group: '${goTo()}', icon: 'inbox',
      keywords: ['${L('vendas', 'sales', 'ventas')}'], perform: () => go('/${L('pedidos', 'orders', 'pedidos')}') },
    { id: '${L('novo', 'new', 'nuevo')}', label: '${L('Novo pedido', 'New order', 'Nuevo pedido')}', group: '${createGroup()}', icon: 'plus',
      hint: 'N', perform: () => openNewOrder() },
    { id: 'csv', label: '${L('Exportar em CSV', 'Export as CSV', 'Exportar en CSV')}', group: '${actionsGroup()}', icon: 'download',
      keywords: [${L("'planilha', 'excel'", "'spreadsheet', 'excel'", "'hoja de cálculo', 'excel'")}], perform: exportCsv },
  ],
});

// ${L('⌘K, Ctrl K e / já abrem. Para um botão:', '⌘K, Ctrl K, and / already open it. For a button:', '⌘K, Ctrl K y / ya la abren. Para un botón:')}
button.addEventListener('click', () => palette.open());`;

const ITEM_FIELDS = () => [
  ['id', L('Único. Identifica o item.', 'Unique. Identifies the item.', 'Único. Identifica el elemento.')],
  ['label', L('O que aparece e o que mais pesa na busca. Comece pelo verbo ou pelo nome do lugar.', 'What shows and what weighs most in search. Start with the verb or the name of the place.', 'Lo que aparece y lo que más pesa en la búsqueda. Empieza por el verbo o por el nombre del lugar.')],
  ['group', L('Título do grupo. Itens do mesmo grupo aparecem juntos.', 'Group title. Items in the same group appear together.', 'Título del grupo. Los elementos del mismo grupo aparecen juntos.')],
  ['icon', L('Um ícone da biblioteca. Ajuda a ler a lista de relance.', 'An icon from the library. It helps read the list at a glance.', 'Un ícono de la biblioteca. Ayuda a leer la lista de un vistazo.')],
  ['keywords', L('Sinônimos que a pessoa pode digitar (“planilha” acha “Exportar em CSV”). Não aparecem.', 'Synonyms people might type (“spreadsheet” finds “Export as CSV”). They don’t show.', 'Sinónimos que la persona puede escribir (“hoja” encuentra “Exportar en CSV”). No aparecen.')],
  ['description', L('Também entra na busca. Use para ações que precisam de contexto.', 'Also part of search. Use it for actions that need context.', 'También entra en la búsqueda. Úsala para acciones que necesitan contexto.')],
  ['hint', L('Atalho ou estado curto, à direita.', 'A shortcut or short state, on the right.', 'Atajo o estado corto, a la derecha.')],
  ['perform()', L('O que acontece no Enter ou no clique. A paleta fecha antes.', 'What happens on Enter or click. The palette closes first.', 'Lo que pasa con Enter o con el clic. La paleta se cierra antes.')],
];

const filtersCode = () => `import { createFilters } from './ds/js/filters.js';

const filters = createFilters(document.querySelector('#${L('filtros', 'filters', 'filtros')}'), {
  label: '${L('Filtrar pedidos', 'Filter orders', 'Filtrar pedidos')}',
  search: { placeholder: '${L('Buscar por cliente ou número', 'Search by customer or number', 'Buscar por cliente o número')}' },
  fields: [
    { id: 'status', label: '${L('Status', 'Status', 'Estado')}', options: [{ value: 'pago', label: '${L('Pago', 'Paid', 'Pagado')}' }, …] },
    { id: 'canal', label: '${L('Canal', 'Channel', 'Canal')}', options: [{ value: 'app', label: 'App' }, …] },
  ],
  toggles: [{ id: 'desconto', label: '${L('Com desconto', 'Discounted', 'Con descuento')}' }],
  sort: { id: 'ordem', label: '${L('Ordenar', 'Sort', 'Ordenar')}', options: [...], value: 'recentes' },
  noun: [${L("'pedido', 'pedidos'", "'order', 'orders'", "'pedido', 'pedidos'")}],
  onChange(state) {
    const rows = ${L('buscar', 'search', 'buscar')}(state);            // { q, status, canal, desconto, ordem }
    render(rows);
    filters.setCount(rows.length, total);  // ${L('"8 de 24 pedidos", anunciado ao leitor de tela', '"8 of 24 orders", announced to the screen reader', '"8 de 24 pedidos", anunciado al lector de pantalla')}
  },
});

filters.clear();                           // ${L('limpa tudo, menos a ordenação', 'clears everything except sorting', 'limpia todo, menos el orden')}`;

const urlCode = () => `import { filtersToQuery, filtersFromQuery } from './ds/js/filters.js';

// ${L('ao filtrar: troca a URL sem empilhar uma entrada por letra digitada', 'on filtering: replace the URL without stacking one entry per typed letter', 'al filtrar: cambia la URL sin apilar una entrada por letra escrita')}
history.replaceState(null, '', '?' + filtersToQuery(filters.state, config));

// ${L('ao abrir a página (ou num link compartilhado): restaura', 'on opening the page (or a shared link): restore', 'al abrir la página (o en un enlace compartido): restaura')}
filters.set(filtersFromQuery(location.search, config));`;

/* ───────── Página ───────── */

export default function renderBusca(page) {
  return `
  <div class="page doc pb-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L(`Três jeitos de encontrar: a paleta (${MOD} K) leva a qualquer lugar, os filtros recortam uma lista e os atalhos poupam o caminho de quem já sabe para onde vai.`, `Three ways to find things: the palette (${MOD} K) takes you anywhere, filters narrow down a list, and shortcuts save the trip for those who already know where they’re going.`, `Tres maneras de encontrar: la paleta (${MOD} K) lleva a cualquier lugar, los filtros recortan una lista y los atajos ahorran el camino a quien ya sabe adónde va.`)}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('abre a busca', 'opens search', 'abre la búsqueda')}</dt><dd class="doc-stat__value">${MOD} K</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('também abre', 'also opens', 'también abre')}</dt><dd class="doc-stat__value">/</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('níveis de relevância', 'relevance levels', 'niveles de relevancia')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('linha de filtros', 'filter row', 'fila de filtros')}</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['pb-paleta', L('Paleta de comandos', 'Command palette', 'Paleta de comandos')],
        ['pb-registrar', L('Registrar itens', 'Registering items', 'Registrar elementos')],
        ['pb-relevancia', L('Como a busca acha', 'How search finds', 'Cómo encuentra la búsqueda')],
        ['pb-filtros', L('Filtros', 'Filters', 'Filtros')],
        ['pb-url', L('Estado na URL', 'State in the URL', 'Estado en la URL')],
        ['pb-atalhos', L('Atalhos de teclado', 'Keyboard shortcuts', 'Atajos de teclado')],
        ['pb-acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['pb-codigo', L('Código', 'Code', 'Código')],
        ['pb-uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'pb-paleta',
      L('Paleta de comandos', 'Command palette', 'Paleta de comandos'),
      L(`Uma caixa só para ir a qualquer página ou disparar qualquer ação. Abre com ${MOD} K, com / ou pela lupa — e volta o foco para onde estava ao fechar.`, `A single box to go to any page or trigger any action. It opens with ${MOD} K, with /, or from the magnifier — and returns focus to where it was on close.`, `Una sola caja para ir a cualquier página o disparar cualquier acción. Se abre con ${MOD} K, con / o desde la lupa — y devuelve el foco a donde estaba al cerrar.`),
      `<div class="pb-palette">
        <div class="pb-palette__stage">
          ${paletteMock()}
        </div>
        <div class="pb-palette__side">
          <ol class="pb-parts" role="list">
            ${PALETTE_PARTS().map(([name, text], i) => `<li><span class="pb-parts__num">${i + 1}</span><div><p class="pb-parts__name">${name}</p><p class="pb-parts__text">${text}</p></div></li>`).join('')}
          </ol>
          <div class="pb-palette__try">
            <button type="button" class="ds-btn ds-btn--primary" data-open-demo>${icon('search', { size: 18 })}${L('Abrir a paleta de exemplo', 'Open the example palette', 'Abrir la paleta de ejemplo')}</button>
            <p class="pb-note">${L(`Uma paleta só deste exemplo, com os comandos de um app de pedidos. ${kbd(MOD, 'K')} continua abrindo a do Lume.`, `A palette just for this example, with the commands of an orders app. ${kbd(MOD, 'K')} still opens Lume’s.`, `Una paleta solo de este ejemplo, con los comandos de una app de pedidos. ${kbd(MOD, 'K')} sigue abriendo la de Lume.`)}</p>
          </div>
        </div>
      </div>`,
    )}

    ${section(
      'pb-registrar',
      L('Registrar itens', 'Registering items', 'Registrar elementos'),
      L(`Cada item é um objeto. Passe uma função em ${ic('items')} e a lista é lida de novo a cada abertura — itens que dependem do contexto aparecem sozinhos.`, `Each item is an object. Pass a function in ${ic('items')} and the list is read again on every open — context-dependent items show up on their own.`, `Cada elemento es un objeto. Pasa una función en ${ic('items')} y la lista se lee de nuevo en cada apertura — los elementos que dependen del contexto aparecen solos.`),
      `<div class="doc-table pb-fields">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Campo', 'Field', 'Campo')}</span><span>${L('Para que serve', 'What it’s for', 'Para qué sirve')}</span></div>
        ${ITEM_FIELDS().map(([f, t]) => `<div class="doc-table__row"><code class="pb-fields__name">${f}</code><span class="pb-fields__text">${t}</span></div>`).join('')}
      </div>
      ${codeBlock(paletteCode())}`,
    )}

    ${section(
      'pb-relevancia',
      L('Como a busca acha', 'How search finds', 'Cómo encuentra la búsqueda'),
      L('Sem acento e sem maiúscula: “relatorio” acha “Relatórios”. Todas as palavras precisam aparecer — no rótulo, no grupo, na descrição ou nas palavras-chave. Depois, a ordem: o rótulo que começa com o texto vem primeiro.', 'Accent- and case-insensitive: “resume” finds “Résumé”. Every word has to appear — in the label, the group, the description, or the keywords. Then, the order: the label that starts with the text comes first.', 'Sin acento y sin mayúscula: “informacion” encuentra “Información”. Todas las palabras tienen que aparecer — en la etiqueta, el grupo, la descripción o las palabras clave. Después, el orden: la etiqueta que empieza con el texto va primero.'),
      `<div class="pb-tester">
        <div class="pb-tester__input">
          <label class="ds-field">
            ${icon('search', { size: 18 })}
            <input class="ds-field__input" type="search" value="${TRY()[0]}" data-tester aria-label="${L('Testar a busca da paleta', 'Test the palette search', 'Probar la búsqueda de la paleta')}" autocomplete="off" spellcheck="false">
          </label>
          <div class="pb-tester__try" role="group" aria-label="${L('Exemplos', 'Examples', 'Ejemplos')}">
            <span>${L('Experimente', 'Try', 'Prueba')}</span>
            ${TRY().map((t) => `<button type="button" class="ds-chip ds-chip--sm" data-try-query="${t}">${t}</button>`).join('')}
          </div>
        </div>
        <ol class="pb-tester__results" data-tester-results role="list" aria-live="polite"></ol>
        <ul class="pb-tester__legend" role="list">
          <li><span class="ds-badge ds-badge--sm ds-badge--brand">${SCORE_LABEL()[3][1]}</span>${L('O rótulo começa com o texto.', 'The label starts with the text.', 'La etiqueta empieza con el texto.')}</li>
          <li><span class="ds-badge ds-badge--sm ds-badge--info">${SCORE_LABEL()[2][1]}</span>${L('O rótulo tem o texto no meio.', 'The label has the text in the middle.', 'La etiqueta tiene el texto en el medio.')}</li>
          <li><span class="ds-badge ds-badge--sm ds-badge--neutral">${SCORE_LABEL()[1][1]}</span>${L('Achou no grupo, na descrição ou nas palavras-chave.', 'Found in the group, the description, or the keywords.', 'Encontrado en el grupo, la descripción o las palabras clave.')}</li>
        </ul>
      </div>`,
    )}

    ${section(
      'pb-filtros',
      L('Filtros', 'Filters', 'Filtros'),
      L('Uma linha acima da lista que ela recorta: busca primeiro, depois os filtros mais usados e a ordenação no fim. O que está ligado aparece embaixo, com um X para tirar — e a contagem diz quanto sobrou.', 'A row above the list it narrows: search first, then the most-used filters, and sorting at the end. What’s on shows below, with an X to remove it — and the count says how much is left.', 'Una fila encima de la lista que recorta: búsqueda primero, después los filtros más usados y el orden al final. Lo que está activo aparece debajo, con una X para quitarlo — y el conteo dice cuánto queda.'),
      `<div class="pb-filters">
        <div data-filters-demo></div>
        <div class="ds-table-wrap pb-orders" role="region" aria-label="${L('Pedidos filtrados', 'Filtered orders', 'Pedidos filtrados')}" tabindex="0">
          <table class="ds-table ds-table--hover">
            <thead><tr>
              <th scope="col">${L('Pedido', 'Order', 'Pedido')}</th><th scope="col">${L('Cliente', 'Customer', 'Cliente')}</th><th scope="col">${L('Status', 'Status', 'Estado')}</th><th scope="col">${L('Canal', 'Channel', 'Canal')}</th><th scope="col">${L('Data', 'Date', 'Fecha')}</th><th scope="col" class="ds-table__num">${L('Valor', 'Value', 'Valor')}</th>
            </tr></thead>
            <tbody data-orders></tbody>
          </table>
          <div class="pb-orders__empty" data-orders-empty hidden>
            <div class="ds-empty">
              <span class="ds-empty__icon">${icon('search-x', { size: 26 })}</span>
              <p class="ds-empty__title">${L('Nenhum pedido com esses filtros', 'No orders with these filters', 'Ningún pedido con esos filtros')}</p>
              <p class="ds-empty__description">${L('Tire um filtro ou busque por outro nome. Os pedidos continuam aqui.', 'Remove a filter or search for another name. The orders are still here.', 'Quita un filtro o busca otro nombre. Los pedidos siguen aquí.')}</p>
              <div class="ds-empty__actions"><button type="button" class="ds-btn ds-btn--secondary" data-clear-demo>${icon('x', { size: 16 })}${L('Limpar filtros', 'Clear filters', 'Limpiar filtros')}</button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="pb-rules">
        ${[
          [L('Busca primeiro', 'Search first', 'Búsqueda primero'), L('É o filtro que todo mundo tenta antes. Ela filtra enquanto você digita (com uma pausa curta) e Esc limpa.', 'It’s the filter everyone tries first. It filters as you type (with a short pause) and Esc clears it.', 'Es el filtro que todo el mundo prueba antes. Filtra mientras escribes (con una pausa corta) y Esc limpia.')],
          [L('Os mais usados à vista', 'The most used in view', 'Los más usados a la vista'), L('Dois ou três filtros na linha. O resto vai para um botão “Mais filtros” — nunca uma segunda linha.', 'Two or three filters in the row. The rest go into a “More filters” button — never a second row.', 'Dos o tres filtros en la fila. El resto va a un botón “Más filtros” — nunca una segunda fila.')],
          [L('Ordenar não é filtrar', 'Sorting isn’t filtering', 'Ordenar no es filtrar'), L('A ordenação fica no fim da linha e não aparece nos filtros ativos: muda a ordem, não o que sobra.', 'Sorting sits at the end of the row and doesn’t appear in the active filters: it changes the order, not what’s left.', 'El orden queda al final de la fila y no aparece en los filtros activos: cambia el orden, no lo que queda.')],
          [L('Sem resultado, um caminho', 'No results, a way out', 'Sin resultado, un camino'), L('A lista vazia explica por quê e oferece “Limpar filtros”. Nunca uma tabela vazia sem aviso.', 'The empty list explains why and offers “Clear filters”. Never an empty table without notice.', 'La lista vacía explica por qué y ofrece “Limpiar filtros”. Nunca una tabla vacía sin aviso.')],
        ]
          .map(([t, d]) => `<article class="pb-rule"><p class="pb-rule__title">${t}</p><p class="pb-rule__text">${d}</p></article>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pb-url',
      L('Estado na URL', 'State in the URL', 'Estado en la URL'),
      L('Filtro que só existe na memória se perde no recarregar e não dá para compartilhar. Guarde o estado na URL — só o que difere do padrão.', 'A filter that only exists in memory is lost on reload and can’t be shared. Keep the state in the URL — only what differs from the default.', 'Un filtro que solo existe en la memoria se pierde al recargar y no se puede compartir. Guarda el estado en la URL — solo lo que difiere del predeterminado.'),
      `<div class="pb-url">
        <div class="pb-url__bar">
          <span class="pb-url__origin">pedidos.app/pedidos</span><code class="pb-url__query" data-url-query></code>
          <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-copy-url aria-label="${L('Copiar link', 'Copy link', 'Copiar enlace')}" data-ds-tooltip="${L('Copiar link', 'Copy link', 'Copiar enlace')}">${icon('link', { size: 16 })}</button>
        </div>
        <div class="pb-url__examples" role="group" aria-label="${L('Abrir um link de exemplo', 'Open an example link', 'Abrir un enlace de ejemplo')}">
          <span>${L('Abrir um link:', 'Open a link:', 'Abrir un enlace:')}</span>
          ${['?status=pendente&canal=app', '?q=souza', '?desconto=1&ordem=maior', '?']
            .map((q) => `<button type="button" class="ds-chip ds-chip--sm" data-restore="${q}"><code>${q === '?' ? L('sem filtros', 'no filters', 'sin filtros') : q}</code></button>`)
            .join('')}
        </div>
        <ul class="pb-url__notes" role="list">
          <li>${icon('history', { size: 16 })}${L(`Use ${ic('replaceState')}: o botão Voltar não deve desfazer letra por letra.`, `Use ${ic('replaceState')}: the Back button shouldn’t undo letter by letter.`, `Usa ${ic('replaceState')}: el botón Atrás no debe deshacer letra por letra.`)}</li>
          <li>${icon('link', { size: 16 })}${L('Quem recebe o link vê a mesma lista — inclusive a ordenação.', 'Whoever gets the link sees the same list — including the sorting.', 'Quien recibe el enlace ve la misma lista — incluido el orden.')}</li>
          <li>${icon('x-circle', { size: 16 })}${L('Valor que não existe (um status apagado) é ignorado, não quebra a página.', 'A value that doesn’t exist (a deleted status) is ignored; it doesn’t break the page.', 'Un valor que no existe (un estado borrado) se ignora, no rompe la página.')}</li>
        </ul>
      </div>
      ${codeBlock(urlCode())}`,
    )}

    ${section(
      'pb-atalhos',
      L('Atalhos de teclado', 'Keyboard shortcuts', 'Atajos de teclado'),
      L('Atalho é um caminho a mais, nunca o único. Mostre-o onde a ação aparece — no tooltip, no menu, na paleta — e quem usa muito aprende sozinho.', 'A shortcut is one more path, never the only one. Show it where the action appears — in the tooltip, the menu, the palette — and frequent users learn it on their own.', 'Un atajo es un camino más, nunca el único. Muéstralo donde aparece la acción — en el tooltip, en el menú, en la paleta — y quien lo usa mucho lo aprende solo.'),
      `<div class="pb-shortcuts">
        <div class="doc-table pb-keys">
          <div class="doc-table__head" aria-hidden="true"><span>${L('Teclas', 'Keys', 'Teclas')}</span><span>${L('No Lume', 'In Lume', 'En Lume')}</span></div>
          ${[
            [[MOD, 'K'], L('Abrir ou fechar a busca', 'Open or close search', 'Abrir o cerrar la búsqueda')],
            [['/'], L('Abrir a busca (fora de campos)', 'Open search (outside fields)', 'Abrir la búsqueda (fuera de campos)')],
            [[MOD, 'B'], L('Recolher a sidebar ou abrir a gaveta', 'Collapse the sidebar or open the drawer', 'Contraer la sidebar o abrir el cajón')],
            [['↑', '↓'], L('Mover nas listas, menus e na paleta', 'Move through lists, menus, and the palette', 'Moverse en las listas, menús y en la paleta')],
            [['↵'], L('Abrir o item ativo', 'Open the active item', 'Abrir el elemento activo')],
            [['Esc'], L('Fechar busca, menu, gaveta ou limpar a busca dos filtros', 'Close search, menu, drawer, or clear the filter search', 'Cerrar búsqueda, menú, cajón o limpiar la búsqueda de los filtros')],
          ]
            .map(([keys, t]) => `<div class="doc-table__row"><span class="pb-keys__keys">${kbd(...keys)}</span><span class="pb-keys__text">${t}</span></div>`)
            .join('')}
        </div>
        <div class="pb-showcase">
          <p class="pb-showcase__title">${L('Onde mostrar', 'Where to show it', 'Dónde mostrarlo')}</p>
          <div class="pb-showcase__row">
            <span class="pb-showcase__demo"><button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="${L('Novo pedido', 'New order', 'Nuevo pedido')}" data-ds-tooltip="${L('Novo pedido', 'New order', 'Nuevo pedido')}" data-ds-tooltip-kbd="N" aria-keyshortcuts="N">${icon('plus')}</button></span>
            <span class="pb-showcase__text">${L('No tooltip, ao lado do nome. Passe o mouse ou foque.', 'In the tooltip, next to the name. Hover or focus.', 'En el tooltip, junto al nombre. Pasa el mouse o enfoca.')}</span>
          </div>
          <div class="pb-showcase__row">
            <span class="pb-showcase__demo"><button type="button" class="ds-chip" data-shortcut-menu>${L('Pedido', 'Order', 'Pedido')}<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button></span>
            <span class="pb-showcase__text">${L('No menu, alinhado à direita.', 'In the menu, right-aligned.', 'En el menú, alineado a la derecha.')}</span>
          </div>
          <div class="pb-showcase__row">
            <span class="pb-showcase__demo pb-showcase__hint">${kbd(MOD, 'K')}</span>
            <span class="pb-showcase__text">${L('Na paleta, como dica do item.', 'In the palette, as the item’s hint.', 'En la paleta, como pista del elemento.')}</span>
          </div>
        </div>
      </div>
      <div class="pb-rules">
        ${[
          [L(`${MOD} no Mac, Ctrl no resto`, `${MOD} on Mac, Ctrl elsewhere`, `${MOD} en Mac, Ctrl en el resto`), L('Escreva o modificador do sistema da pessoa. Cada tecla é um <kbd class="ds-kbd">kbd</kbd> separado.', 'Write the modifier for the person’s system. Each key is a separate <kbd class="ds-kbd">kbd</kbd>.', 'Escribe el modificador del sistema de la persona. Cada tecla es un <kbd class="ds-kbd">kbd</kbd> aparte.')],
          [L('Uma tecla só, fora de campos', 'Single keys, outside fields', 'Una sola tecla, fuera de campos'), L('“/” ou “N” não disparam enquanto alguém digita. Com modificador, valem em qualquer lugar.', '“/” or “N” don’t fire while someone is typing. With a modifier, they work anywhere.', '“/” o “N” no se disparan mientras alguien escribe. Con modificador, valen en cualquier lugar.')],
          [L('Não brigue com o navegador', 'Don’t fight the browser', 'No pelees con el navegador'), L(`Nada de ${MOD} T, ${MOD} W, ${MOD} L ou ${MOD} R: são do navegador e do sistema.`, `No ${MOD} T, ${MOD} W, ${MOD} L, or ${MOD} R: they belong to the browser and the system.`, `Nada de ${MOD} T, ${MOD} W, ${MOD} L o ${MOD} R: son del navegador y del sistema.`)],
          [L('Diga para a tecnologia assistiva', 'Tell assistive technology', 'Díselo a la tecnología de asistencia'), L(`Use ${ic('aria-keyshortcuts')} no controle que o atalho aciona.`, `Use ${ic('aria-keyshortcuts')} on the control the shortcut triggers.`, `Usa ${ic('aria-keyshortcuts')} en el control que activa el atajo.`)],
        ]
          .map(([t, d]) => `<article class="pb-rule"><p class="pb-rule__title">${t}</p><p class="pb-rule__text">${d}</p></article>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pb-acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('Buscar é a forma mais rápida de navegar com teclado e leitor de tela — desde que cada peça diga o que é.', 'Search is the fastest way to navigate with keyboard and screen reader — as long as each piece says what it is.', 'Buscar es la forma más rápida de navegar con teclado y lector de pantalla — siempre que cada pieza diga qué es.'),
      a11yList([
        [L('Paleta é um diálogo com combobox', 'The palette is a dialog with a combobox', 'La paleta es un diálogo con combobox'), L(`O campo é um ${ic('combobox')} ligado à lista (${ic('listbox')}); o item ativo é anunciado por ${ic('aria-activedescendant')} sem tirar o foco do campo.`, `The field is a ${ic('combobox')} tied to the list (${ic('listbox')}); the active item is announced through ${ic('aria-activedescendant')} without taking focus from the field.`, `El campo es un ${ic('combobox')} vinculado a la lista (${ic('listbox')}); el elemento activo se anuncia con ${ic('aria-activedescendant')} sin quitar el foco del campo.`), ['↑', '↓', '↵']],
        [L('Foco que volta', 'Focus that returns', 'Foco que vuelve'), L('Ao fechar a paleta, o foco volta para quem a abriu. Ao executar um item, vai para onde a ação levar.', 'On closing the palette, focus returns to whatever opened it. On running an item, it goes wherever the action leads.', 'Al cerrar la paleta, el foco vuelve a quien la abrió. Al ejecutar un elemento, va a donde lleve la acción.'), ['Esc']],
        [L('Filtros numa região de busca', 'Filters in a search region', 'Filtros en una región de búsqueda'), L(`A barra tem ${ic('role="search"')} com nome; cada filtro é um botão com menu, com rótulo e valor no texto.`, `The bar has a named ${ic('role="search"')}; each filter is a menu button, with label and value in its text.`, `La barra tiene ${ic('role="search"')} con nombre; cada filtro es un botón con menú, con etiqueta y valor en el texto.`)],
        [L('Contagem anunciada', 'Announced count', 'Conteo anunciado'), L(`O “8 de 24 pedidos” fica numa região ${ic('aria-live="polite"')}: o leitor fala o resultado depois de cada mudança, sem interromper.`, `The “8 of 24 orders” sits in an ${ic('aria-live="polite"')} region: the reader speaks the result after each change, without interrupting.`, `El “8 de 24 pedidos” queda en una región ${ic('aria-live="polite"')}: el lector dice el resultado después de cada cambio, sin interrumpir.`)],
        [L('Remover com nome', 'Named removal', 'Quitar con nombre'), L('O X de cada filtro ativo diz o que remove (“Remover filtro Status: Pago”). Depois de remover, o foco vai para o próximo — ou para a busca.', 'Each active filter’s X says what it removes (“Remove filter Status: Paid”). After removing, focus moves to the next one — or to search.', 'La X de cada filtro activo dice qué quita (“Quitar filtro Estado: Pagado”). Después de quitar, el foco va al siguiente — o a la búsqueda.')],
        [L('Lista vazia explicada', 'An explained empty list', 'Lista vacía explicada'), L('Sem resultados, a tabela dá lugar a uma mensagem com o motivo e um botão para limpar.', 'With no results, the table gives way to a message with the reason and a button to clear.', 'Sin resultados, la tabla da lugar a un mensaje con el motivo y un botón para limpiar.')],
      ]),
    )}

    ${section(
      'pb-codigo',
      L('Código', 'Code', 'Código'),
      L('A paleta e os filtros são módulos independentes; os dois só pedem dados e uma função para cada ação.', 'The palette and the filters are independent modules; both only ask for data and a function for each action.', 'La paleta y los filtros son módulos independientes; los dos solo piden datos y una función para cada acción.'),
      `<h3 class="doc-subhead">${L('Filtros', 'Filters', 'Filtros')}</h3>
      ${codeBlock(filtersCode())}
      <div class="doc-table pb-fields">
        <div class="doc-table__head" aria-hidden="true"><span>API</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
        ${[
          ['createFilters(el, config)', L('Monta a barra (busca, filtros, liga/desliga, ordenação, ativos, contagem) e devolve o controle.', 'Builds the bar (search, filters, toggles, sorting, active filters, count) and returns the controller.', 'Arma la barra (búsqueda, filtros, interruptores, orden, activos, conteo) y devuelve el control.')],
          ['filters.state · set(parcial) · clear()', L(`Lê e muda o estado; cada mudança chama ${ic('onChange')}.`, `Reads and changes the state; each change calls ${ic('onChange')}.`, `Lee y cambia el estado; cada cambio llama a ${ic('onChange')}.`)],
          ['filters.setCount(mostrados, total)', L('Atualiza a contagem anunciada.', 'Updates the announced count.', 'Actualiza el conteo anunciado.')],
          ['filtersToQuery · filtersFromQuery', L('Estado ⇄ URL, ignorando o que é padrão ou não existe.', 'State ⇄ URL, ignoring what’s default or doesn’t exist.', 'Estado ⇄ URL, ignorando lo que es predeterminado o no existe.')],
          [L('.ds-filters e partes', '.ds-filters and parts', '.ds-filters y partes'), L('As classes também servem para uma barra montada à mão (veja o comentário em filters.css).', 'The classes also work for a hand-built bar (see the comment in filters.css).', 'Las clases también sirven para una barra armada a mano (mira el comentario en filters.css).')],
        ]
          .map(([a, t]) => `<div class="doc-table__row"><code class="pb-fields__name">${a}</code><span class="pb-fields__text">${t}</span></div>`)
          .join('')}
      </div>
      <h3 class="doc-subhead">${L('Paleta', 'Palette', 'Paleta')}</h3>
      <div class="doc-table pb-fields">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Opção', 'Option', 'Opción')}</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
        ${[
          ['items', L('Lista de itens — ou uma função que devolve a lista a cada abertura.', 'List of items — or a function that returns the list on every open.', 'Lista de elementos — o una función que devuelve la lista en cada apertura.')],
          ['placeholder · label', L('Texto do campo e o nome do diálogo para leitores de tela.', 'Field text and the dialog’s name for screen readers.', 'Texto del campo y el nombre del diálogo para lectores de pantalla.')],
          ['hotkeys: false', L('Não liga ⌘K nem /. Para paletas extras, como a de exemplo desta página.', 'Doesn’t bind ⌘K or /. For extra palettes, like this page’s example.', 'No conecta ⌘K ni /. Para paletas extra, como la de ejemplo de esta página.')],
          ['open() · close() · isOpen() · destroy()', L('Controle manual; destroy() remove o diálogo e os atalhos.', 'Manual control; destroy() removes the dialog and the shortcuts.', 'Control manual; destroy() quita el diálogo y los atajos.')],
          ['filterCommands(items, busca)', L('A mesma busca da paleta, para testes ou outras listas.', 'The same search as the palette, for tests or other lists.', 'La misma búsqueda de la paleta, para pruebas u otras listas.')],
        ]
          .map(([a, t]) => `<div class="doc-table__row"><code class="pb-fields__name">${a}</code><span class="pb-fields__text">${t}</span></div>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pb-uso',
      L('Uso', 'Usage', 'Uso'),
      L('Encontrar deve ser mais rápido do que lembrar onde fica.', 'Finding should be faster than remembering where things are.', 'Encontrar debe ser más rápido que recordar dónde está.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: tudo também pela paleta', 'Do: everything via the palette too', 'Haz: todo también por la paleta')}</p>
          <p class="usage-card__text">${L('Toda página e toda ação frequente entra na paleta, com sinônimos. Quem conhece o atalho nunca precisa caçar um menu.', 'Every page and every frequent action goes into the palette, with synonyms. Whoever knows the shortcut never has to hunt for a menu.', 'Toda página y toda acción frecuente entra en la paleta, con sinónimos. Quien conoce el atajo nunca necesita buscar un menú.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: filtros espalhados', 'Avoid: scattered filters', 'Evita: filtros dispersos')}</p>
          <p class="usage-card__text">${L('Um filtro dentro de cada cartão ou coluna confunde o que vale para quê. Uma linha só, acima de tudo o que ela recorta.', 'A filter inside each card or column confuses what applies to what. A single row, above everything it narrows.', 'Un filtro dentro de cada tarjeta o columna confunde qué vale para qué. Una sola fila, encima de todo lo que recorta.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Rótulo com a palavra da pessoa', 'Labels in the person’s words', 'Etiqueta con la palabra de la persona')}</p>
          <p class="usage-card__text">${L('“Exportar em CSV” com a palavra-chave “planilha”. Pense no que alguém digitaria, não no nome interno da função.', '“Export as CSV” with the keyword “spreadsheet”. Think about what someone would type, not the function’s internal name.', '“Exportar en CSV” con la palabra clave “hoja de cálculo”. Piensa en lo que alguien escribiría, no en el nombre interno de la función.')}</p>
        </article>
      </div>`,
    )}
  </div>`;
}

/* ───────── Comportamento ───────── */

export function mount(root) {
  const cleanups = [mountCodeCopy(root), mountDocNav(root)];
  const commands = COMMANDS();
  const config = filterConfig();
  const rowHtml = rowRenderer();

  /* Paleta de exemplo: instância própria, sem atalhos globais */
  const palette = createCommandPalette({
    placeholder: L('Buscar no app de pedidos…', 'Search the orders app…', 'Buscar en la app de pedidos…'),
    label: L('Paleta de exemplo', 'Example palette', 'Paleta de ejemplo'),
    hotkeys: false,
    items: () => commands.map((c) => ({ ...c, perform: () => toast(L(`Exemplo: “${c.label}”`, `Example: “${c.label}”`, `Ejemplo: “${c.label}”`), { icon: c.icon }) })),
  });
  cleanups.push(() => palette.destroy());

  /* Testador de relevância */
  const scoreLabels = SCORE_LABEL();
  const tester = root.querySelector('[data-tester]');
  const results = root.querySelector('[data-tester-results]');
  const renderTester = () => {
    const q = tester.value;
    const scored = commands.map((c) => ({ c, score: scoreCommand(c, q) }))
      .filter((r) => r.score > 0 || !q.trim())
      .sort((a, b) => b.score - a.score);
    if (!scored.length) {
      results.innerHTML = `<li class="pb-tester__empty">${icon('search-x', { size: 18 })}${L(`Nada encontrado para “${escapeHtml(q)}”. A paleta mostra isso também.`, `Nothing found for “${escapeHtml(q)}”. The palette shows this too.`, `Nada encontrado para “${escapeHtml(q)}”. La paleta también lo muestra.`)}</li>`;
      return;
    }
    results.innerHTML = scored
      .map(({ c, score }) => {
        const [tone, label] = scoreLabels[score] ?? ['neutral', L('tudo', 'all', 'todo')];
        return `<li class="pb-tester__row">
          ${icon(c.icon, { size: 18 })}
          <span class="pb-tester__label">${escapeHtml(c.label)}</span>
          <span class="pb-tester__group">${escapeHtml(c.group)}</span>
          ${q.trim() ? `<span class="ds-badge ds-badge--sm ${tone === 'neutral' ? 'ds-badge--neutral' : `ds-badge--${tone}`}">${label}</span>` : ''}
        </li>`;
      })
      .join('');
  };
  tester.addEventListener('input', renderTester);
  cleanups.push(() => tester.removeEventListener('input', renderTester));
  renderTester();

  /* Filtros + tabela + URL */
  const tbody = root.querySelector('[data-orders]');
  const empty = root.querySelector('[data-orders-empty]');
  const table = tbody.closest('table');
  const queryEl = root.querySelector('[data-url-query]');
  const filters = createFilters(root.querySelector('[data-filters-demo]'), {
    ...config,
    onChange: (state) => renderOrders(state),
  });
  function renderOrders(state) {
    const rows = applyFilters(state);
    tbody.innerHTML = rows.map(rowHtml).join('');
    table.hidden = !rows.length;
    empty.hidden = rows.length > 0;
    filters?.setCount(rows.length, ORDERS.length);
    const q = filtersToQuery(state, config);
    queryEl.textContent = q ? `?${q}` : '';
    queryEl.dataset.empty = q ? 'false' : 'true';
  }
  renderOrders(filters.state);
  cleanups.push(() => filters.destroy());

  /* Atalhos: menu com atalhos à direita */
  const menuLabels = {
    new: L('Novo pedido', 'New order', 'Nuevo pedido'),
    dup: L('Duplicar', 'Duplicate', 'Duplicar'),
    search: L('Buscar', 'Search', 'Buscar'),
    archive: L('Arquivar', 'Archive', 'Archivar'),
  };
  const shortcutMenu = attachMenu(root.querySelector('[data-shortcut-menu]'), {
    label: L('Pedido', 'Order', 'Pedido'),
    mode: 'action',
    options: [
      { value: 'new', label: menuLabels.new, icon: 'plus', shortcut: 'N' },
      { value: 'dup', label: menuLabels.dup, icon: 'copy', shortcut: `${MOD} D` },
      { value: 'search', label: menuLabels.search, icon: 'search', shortcut: `${MOD} K` },
      { type: 'separator' },
      { value: 'archive', label: menuLabels.archive, icon: 'folder', shortcut: 'E' },
    ],
    onChange: (value) => toast(L(`Exemplo: ${menuLabels[value].toLocaleLowerCase(locale())}`, `Example: ${menuLabels[value].toLocaleLowerCase(locale())}`, `Ejemplo: ${menuLabels[value].toLocaleLowerCase(locale())}`)),
  });
  cleanups.push(() => shortcutMenu.destroy());

  const onClick = (e) => {
    if (e.target.closest('[data-open-demo]')) palette.open();
    const t = e.target.closest('[data-try-query]');
    if (t) {
      tester.value = t.dataset.tryQuery;
      renderTester();
      tester.focus();
    }
    if (e.target.closest('[data-clear-demo]')) {
      filters.clear();
      filters.focusSearch();
    }
    const r = e.target.closest('[data-restore]');
    if (r) filters.set(filtersFromQuery(r.dataset.restore, config));
    if (e.target.closest('[data-copy-url]')) {
      const q = filtersToQuery(filters.state, config);
      copyText(`https://pedidos.app/pedidos${q ? `?${q}` : ''}`, L('Link copiado', 'Link copied', 'Enlace copiado'));
    }
  };
  root.addEventListener('click', onClick);
  cleanups.push(() => root.removeEventListener('click', onClick));

  return () => cleanups.forEach((fn) => fn());
}
