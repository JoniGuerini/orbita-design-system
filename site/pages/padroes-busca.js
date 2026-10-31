import { icon } from '../../ds/icons/icons.js';
import { createCommandPalette, scoreCommand } from '../../ds/js/command-palette.js';
import { createFilters, filtersToQuery, filtersFromQuery } from '../../ds/js/filters.js';
import { attachMenu } from '../../ds/js/menu.js';
import { toast, copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-busca.css'];

/* ───────── Dados de exemplo (um app de pedidos fictício) ───────── */

const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
const MOD = isMac ? '⌘' : 'Ctrl';

const COMMANDS = [
  { id: 'go-pedidos', label: 'Pedidos', group: 'Ir para', icon: 'inbox', keywords: ['vendas', 'compras'] },
  { id: 'go-clientes', label: 'Clientes', group: 'Ir para', icon: 'users', keywords: ['contatos', 'pessoas'] },
  { id: 'go-produtos', label: 'Produtos', group: 'Ir para', icon: 'package', keywords: ['estoque', 'catálogo'] },
  { id: 'go-relatorios', label: 'Relatórios', group: 'Ir para', icon: 'bar-chart', keywords: ['métricas', 'gráficos'] },
  { id: 'new-pedido', label: 'Novo pedido', group: 'Criar', icon: 'plus', hint: 'N', keywords: ['venda'] },
  { id: 'new-cliente', label: 'Novo cliente', group: 'Criar', icon: 'user', keywords: ['cadastro', 'contato'] },
  { id: 'export', label: 'Exportar pedidos em CSV', group: 'Ações', icon: 'download', keywords: ['planilha', 'excel'] },
  { id: 'archive', label: 'Arquivar pedidos concluídos', group: 'Ações', icon: 'folder', description: 'Move para o arquivo os pedidos entregues há mais de 30 dias.' },
  { id: 'shortcuts', label: 'Ver atalhos de teclado', group: 'Ajuda', icon: 'keyboard', hint: '?' },
  { id: 'theme', label: 'Alternar tema', group: 'Preferências', icon: 'moon', keywords: ['escuro', 'claro', 'dark', 'light'] },
];

const TRY = ['rela', 'planilha', 'novo cli', 'pedidos', 'xyz'];
const SCORE_LABEL = { 3: ['brand', 'começa com'], 2: ['info', 'contém'], 1: ['neutral', 'outro campo'] };

const NAMES = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Ramos', 'Elisa Prado', 'Fábio Teixeira', 'Gabriela Rocha', 'Henrique Alves', 'Isabela Duarte', 'João Pedro Nunes', 'Karina Lopes', 'Lucas Ferreira', 'Marina Costa', 'Nicolas Barros', 'Olívia Martins', 'Paulo Henrique', 'Rafaela Santos', 'Rafael Moreira', 'Sofia Almeida', 'Tiago Ribeiro', 'Úrsula Campos', 'Vinícius Pires', 'Wesley Cardoso', 'Yasmin Freitas'];
const STATUS = [
  { value: 'pago', label: 'Pago', tone: 'success' },
  { value: 'pendente', label: 'Pendente', tone: 'warning' },
  { value: 'cancelado', label: 'Cancelado', tone: 'danger' },
  { value: 'reembolsado', label: 'Reembolsado', tone: 'neutral' },
];
const CHANNELS = [
  { value: 'app', label: 'App' },
  { value: 'loja', label: 'Loja' },
  { value: 'site', label: 'Site' },
];
const SORTS = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'antigos', label: 'Mais antigos' },
  { value: 'maior', label: 'Maior valor' },
  { value: 'menor', label: 'Menor valor' },
  { value: 'cliente', label: 'Cliente A–Z' },
];
const STATUS_CYCLE = ['pago', 'pago', 'pendente', 'pago', 'cancelado', 'pago', 'pendente', 'reembolsado'];

const ORDERS = NAMES.map((cliente, i) => {
  const day = new Date(2026, 9, 31 - Math.floor(i * 1.3));
  return {
    id: `#${4821 - i * 7}`,
    cliente,
    status: STATUS_CYCLE[(i * 3) % STATUS_CYCLE.length],
    canal: CHANNELS[(i * 7 + 1) % 3].value,
    valor: Math.round((84 + ((i * 47) % 260) + (i % 4) * 19.9) * 100) / 100,
    desconto: i % 3 === 1,
    data: day,
  };
});

const FILTER_CONFIG = {
  label: 'Filtrar pedidos',
  search: { placeholder: 'Buscar por cliente ou número', label: 'Buscar pedidos por cliente ou número' },
  fields: [
    { id: 'status', label: 'Status', options: STATUS.map(({ value, label }) => ({ value, label })) },
    { id: 'canal', label: 'Canal', options: CHANNELS },
  ],
  toggles: [{ id: 'desconto', label: 'Com desconto' }],
  sort: { id: 'ordem', label: 'Ordenar', options: SORTS, value: 'recentes' },
  noun: ['pedido', 'pedidos'],
};

const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

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
    cliente: (a, b) => a.cliente.localeCompare(b.cliente, 'pt-BR'),
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

function rowHtml(o) {
  const st = STATUS.find((s) => s.value === o.status);
  return `<tr>
    <td class="pb-orders__id">${o.id}</td>
    <td>${escapeHtml(o.cliente)}${o.desconto ? ' <span class="ds-badge ds-badge--sm ds-badge--brand">Desconto</span>' : ''}</td>
    <td><span class="ds-badge ds-badge--sm${st.tone === 'neutral' ? ' ds-badge--neutral' : ` ds-badge--${st.tone}`}"><span class="ds-badge__dot"></span>${st.label}</span></td>
    <td class="ds-table__muted">${CHANNELS.find((c) => c.value === o.canal).label}</td>
    <td class="ds-table__muted">${dateFmt.format(o.data).replace('.', '')}</td>
    <td class="ds-table__num">${money.format(o.valor)}</td>
  </tr>`;
}

/** Prévia estática da paleta, com marcadores. */
const paletteMock = () => `<div class="pb-mock" inert aria-hidden="true">
    <div class="ds-command__search">${icon('search', { size: 20 })}<span class="pb-mock__query">rel<span class="pb-mock__caret"></span></span><kbd class="ds-kbd">Esc</kbd><span class="pb-pin pb-pin--start">1</span></div>
    <div class="ds-command__list">
      <div class="ds-command__group"><div class="ds-command__group-label">Ir para<span class="pb-pin pb-pin--inline">2</span></div>
        <div class="ds-command__item" aria-selected="true">${icon('bar-chart', { size: 18 })}<span class="ds-command__label">Relatórios</span>${icon('corner-down-left', { size: 16, className: 'ds-command__enter' })}<span class="pb-pin pb-pin--end">3</span></div>
      </div>
      <div class="ds-command__group"><div class="ds-command__group-label">Ações</div>
        <div class="ds-command__item">${icon('folder', { size: 18 })}<span class="ds-command__label">Arquivar pedidos concluídos</span></div>
        <div class="ds-command__item">${icon('keyboard', { size: 18 })}<span class="ds-command__label">Ver atalhos de teclado</span><span class="ds-command__hint">?</span><span class="pb-pin pb-pin--end">4</span></div>
      </div>
    </div>
    <footer class="ds-command__footer"><span>${kbd('↑', '↓')} navegar</span><span>${kbd('↵')} abrir</span><span>${kbd('Esc')} fechar</span><span class="pb-pin pb-pin--end">5</span></footer>
  </div>`;

const PALETTE_PARTS = [
  ['Campo de busca', 'Já vem focado. Digitar filtra na hora — sem botão de buscar.'],
  ['Grupo', 'Agrupa por intenção: ir para, criar, ações, ajuda. A ordem dos grupos é a de registro.'],
  ['Item ativo', 'Fundo de seleção e o ↵ à direita. ↑ ↓ movem; o mouse também move.'],
  ['Dica', 'Um atalho ou um estado curto (“Em breve”). Nunca uma frase.'],
  ['Rodapé', 'Lembra as teclas. Some no celular, onde não há teclado físico.'],
];

const PALETTE_CODE = `import { createCommandPalette } from './ds/js/command-palette.js';

const palette = createCommandPalette({
  placeholder: 'Buscar páginas e ações…',
  items: () => [
    { id: 'pedidos', label: 'Pedidos', group: 'Ir para', icon: 'inbox',
      keywords: ['vendas'], perform: () => go('/pedidos') },
    { id: 'novo', label: 'Novo pedido', group: 'Criar', icon: 'plus',
      hint: 'N', perform: () => openNewOrder() },
    { id: 'csv', label: 'Exportar em CSV', group: 'Ações', icon: 'download',
      keywords: ['planilha', 'excel'], perform: exportCsv },
  ],
});

// ⌘K, Ctrl K e / já abrem. Para um botão:
button.addEventListener('click', () => palette.open());`;

const ITEM_FIELDS = [
  ['id', 'Único. Identifica o item.'],
  ['label', 'O que aparece e o que mais pesa na busca. Comece pelo verbo ou pelo nome do lugar.'],
  ['group', 'Título do grupo. Itens do mesmo grupo aparecem juntos.'],
  ['icon', 'Um ícone da biblioteca. Ajuda a ler a lista de relance.'],
  ['keywords', 'Sinônimos que a pessoa pode digitar (“planilha” acha “Exportar em CSV”). Não aparecem.'],
  ['description', 'Também entra na busca. Use para ações que precisam de contexto.'],
  ['hint', 'Atalho ou estado curto, à direita.'],
  ['perform()', 'O que acontece no Enter ou no clique. A paleta fecha antes.'],
];

const FILTERS_CODE = `import { createFilters } from './ds/js/filters.js';

const filters = createFilters(document.querySelector('#filtros'), {
  label: 'Filtrar pedidos',
  search: { placeholder: 'Buscar por cliente ou número' },
  fields: [
    { id: 'status', label: 'Status', options: [{ value: 'pago', label: 'Pago' }, …] },
    { id: 'canal', label: 'Canal', options: [{ value: 'app', label: 'App' }, …] },
  ],
  toggles: [{ id: 'desconto', label: 'Com desconto' }],
  sort: { id: 'ordem', label: 'Ordenar', options: [...], value: 'recentes' },
  noun: ['pedido', 'pedidos'],
  onChange(state) {
    const rows = buscar(state);            // { q, status, canal, desconto, ordem }
    render(rows);
    filters.setCount(rows.length, total);  // "8 de 24 pedidos", anunciado ao leitor de tela
  },
});

filters.clear();                           // limpa tudo, menos a ordenação`;

const URL_CODE = `import { filtersToQuery, filtersFromQuery } from './ds/js/filters.js';

// ao filtrar: troca a URL sem empilhar uma entrada por letra digitada
history.replaceState(null, '', '?' + filtersToQuery(filters.state, config));

// ao abrir a página (ou num link compartilhado): restaura
filters.set(filtersFromQuery(location.search, config));`;

/* ───────── Página ───────── */

export default function renderBusca(page) {
  return `
  <div class="page doc pb-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Busca e comandos</h1>
        <p class="doc-header__lead">Três jeitos de encontrar: a paleta (${MOD} K) leva a qualquer lugar, os filtros recortam uma lista e os atalhos poupam o caminho de quem já sabe para onde vai.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">abre a busca</dt><dd class="doc-stat__value">${MOD} K</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">também abre</dt><dd class="doc-stat__value">/</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">níveis de relevância</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">linha de filtros</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['pb-paleta', 'Paleta de comandos'],
        ['pb-registrar', 'Registrar itens'],
        ['pb-relevancia', 'Como a busca acha'],
        ['pb-filtros', 'Filtros'],
        ['pb-url', 'Estado na URL'],
        ['pb-atalhos', 'Atalhos de teclado'],
        ['pb-acessibilidade', 'Acessibilidade'],
        ['pb-codigo', 'Código'],
        ['pb-uso', 'Uso'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'pb-paleta',
      'Paleta de comandos',
      `Uma caixa só para ir a qualquer página ou disparar qualquer ação. Abre com ${MOD} K, com / ou pela lupa — e volta o foco para onde estava ao fechar.`,
      `<div class="pb-palette">
        <div class="pb-palette__stage">
          ${paletteMock()}
        </div>
        <div class="pb-palette__side">
          <ol class="pb-parts" role="list">
            ${PALETTE_PARTS.map(([name, text], i) => `<li><span class="pb-parts__num">${i + 1}</span><div><p class="pb-parts__name">${name}</p><p class="pb-parts__text">${text}</p></div></li>`).join('')}
          </ol>
          <div class="pb-palette__try">
            <button type="button" class="ds-btn ds-btn--primary" data-open-demo>${icon('search', { size: 18 })}Abrir a paleta de exemplo</button>
            <p class="pb-note">Uma paleta só deste exemplo, com os comandos de um app de pedidos. ${kbd(MOD, 'K')} continua abrindo a do Órbita.</p>
          </div>
        </div>
      </div>`,
    )}

    ${section(
      'pb-registrar',
      'Registrar itens',
      'Cada item é um objeto. Passe uma função em <code class="ds-inline-code">items</code> e a lista é lida de novo a cada abertura — itens que dependem do contexto aparecem sozinhos.',
      `<div class="doc-table pb-fields">
        <div class="doc-table__head" aria-hidden="true"><span>Campo</span><span>Para que serve</span></div>
        ${ITEM_FIELDS.map(([f, t]) => `<div class="doc-table__row"><code class="pb-fields__name">${f}</code><span class="pb-fields__text">${t}</span></div>`).join('')}
      </div>
      ${codeBlock(PALETTE_CODE)}`,
    )}

    ${section(
      'pb-relevancia',
      'Como a busca acha',
      'Sem acento e sem maiúscula: “relatorio” acha “Relatórios”. Todas as palavras precisam aparecer — no rótulo, no grupo, na descrição ou nas palavras-chave. Depois, a ordem: o rótulo que começa com o texto vem primeiro.',
      `<div class="pb-tester">
        <div class="pb-tester__input">
          <label class="ds-field">
            ${icon('search', { size: 18 })}
            <input class="ds-field__input" type="search" value="rela" data-tester aria-label="Testar a busca da paleta" autocomplete="off" spellcheck="false">
          </label>
          <div class="pb-tester__try" role="group" aria-label="Exemplos">
            <span>Experimente</span>
            ${TRY.map((t) => `<button type="button" class="ds-chip ds-chip--sm" data-try-query="${t}">${t}</button>`).join('')}
          </div>
        </div>
        <ol class="pb-tester__results" data-tester-results role="list" aria-live="polite"></ol>
        <ul class="pb-tester__legend" role="list">
          <li><span class="ds-badge ds-badge--sm ds-badge--brand">começa com</span>O rótulo começa com o texto.</li>
          <li><span class="ds-badge ds-badge--sm ds-badge--info">contém</span>O rótulo tem o texto no meio.</li>
          <li><span class="ds-badge ds-badge--sm ds-badge--neutral">outro campo</span>Achou no grupo, na descrição ou nas palavras-chave.</li>
        </ul>
      </div>`,
    )}

    ${section(
      'pb-filtros',
      'Filtros',
      'Uma linha acima da lista que ela recorta: busca primeiro, depois os filtros mais usados e a ordenação no fim. O que está ligado aparece embaixo, com um X para tirar — e a contagem diz quanto sobrou.',
      `<div class="pb-filters">
        <div data-filters-demo></div>
        <div class="ds-table-wrap pb-orders" role="region" aria-label="Pedidos filtrados" tabindex="0">
          <table class="ds-table ds-table--hover">
            <thead><tr>
              <th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Status</th><th scope="col">Canal</th><th scope="col">Data</th><th scope="col" class="ds-table__num">Valor</th>
            </tr></thead>
            <tbody data-orders></tbody>
          </table>
          <div class="pb-orders__empty" data-orders-empty hidden>
            <div class="ds-empty">
              <span class="ds-empty__icon">${icon('search-x', { size: 26 })}</span>
              <p class="ds-empty__title">Nenhum pedido com esses filtros</p>
              <p class="ds-empty__description">Tire um filtro ou busque por outro nome. Os pedidos continuam aqui.</p>
              <div class="ds-empty__actions"><button type="button" class="ds-btn ds-btn--secondary" data-clear-demo>${icon('x', { size: 16 })}Limpar filtros</button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="pb-rules">
        ${[
          ['Busca primeiro', 'É o filtro que todo mundo tenta antes. Ela filtra enquanto você digita (com uma pausa curta) e Esc limpa.'],
          ['Os mais usados à vista', 'Dois ou três filtros na linha. O resto vai para um botão “Mais filtros” — nunca uma segunda linha.'],
          ['Ordenar não é filtrar', 'A ordenação fica no fim da linha e não aparece nos filtros ativos: muda a ordem, não o que sobra.'],
          ['Sem resultado, um caminho', 'A lista vazia explica por quê e oferece “Limpar filtros”. Nunca uma tabela vazia sem aviso.'],
        ]
          .map(([t, d]) => `<article class="pb-rule"><p class="pb-rule__title">${t}</p><p class="pb-rule__text">${d}</p></article>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pb-url',
      'Estado na URL',
      'Filtro que só existe na memória se perde no recarregar e não dá para compartilhar. Guarde o estado na URL — só o que difere do padrão.',
      `<div class="pb-url">
        <div class="pb-url__bar">
          <span class="pb-url__origin">pedidos.app/pedidos</span><code class="pb-url__query" data-url-query></code>
          <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-copy-url aria-label="Copiar link" data-ds-tooltip="Copiar link">${icon('link', { size: 16 })}</button>
        </div>
        <div class="pb-url__examples" role="group" aria-label="Abrir um link de exemplo">
          <span>Abrir um link:</span>
          ${['?status=pendente&canal=app', '?q=souza', '?desconto=1&ordem=maior', '?']
            .map((q) => `<button type="button" class="ds-chip ds-chip--sm" data-restore="${q}"><code>${q === '?' ? 'sem filtros' : q}</code></button>`)
            .join('')}
        </div>
        <ul class="pb-url__notes" role="list">
          <li>${icon('history', { size: 16 })}Use <code class="ds-inline-code">replaceState</code>: o botão Voltar não deve desfazer letra por letra.</li>
          <li>${icon('link', { size: 16 })}Quem recebe o link vê a mesma lista — inclusive a ordenação.</li>
          <li>${icon('x-circle', { size: 16 })}Valor que não existe (um status apagado) é ignorado, não quebra a página.</li>
        </ul>
      </div>
      ${codeBlock(URL_CODE)}`,
    )}

    ${section(
      'pb-atalhos',
      'Atalhos de teclado',
      'Atalho é um caminho a mais, nunca o único. Mostre-o onde a ação aparece — no tooltip, no menu, na paleta — e quem usa muito aprende sozinho.',
      `<div class="pb-shortcuts">
        <div class="doc-table pb-keys">
          <div class="doc-table__head" aria-hidden="true"><span>Teclas</span><span>No Órbita</span></div>
          ${[
            [[MOD, 'K'], 'Abrir ou fechar a busca'],
            [['/'], 'Abrir a busca (fora de campos)'],
            [[MOD, 'B'], 'Recolher a sidebar ou abrir a gaveta'],
            [['↑', '↓'], 'Mover nas listas, menus e na paleta'],
            [['↵'], 'Abrir o item ativo'],
            [['Esc'], 'Fechar busca, menu, gaveta ou limpar a busca dos filtros'],
          ]
            .map(([keys, t]) => `<div class="doc-table__row"><span class="pb-keys__keys">${kbd(...keys)}</span><span class="pb-keys__text">${t}</span></div>`)
            .join('')}
        </div>
        <div class="pb-showcase">
          <p class="pb-showcase__title">Onde mostrar</p>
          <div class="pb-showcase__row">
            <span class="pb-showcase__demo"><button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="Novo pedido" data-ds-tooltip="Novo pedido" data-ds-tooltip-kbd="N" aria-keyshortcuts="N">${icon('plus')}</button></span>
            <span class="pb-showcase__text">No tooltip, ao lado do nome. Passe o mouse ou foque.</span>
          </div>
          <div class="pb-showcase__row">
            <span class="pb-showcase__demo"><button type="button" class="ds-chip" data-shortcut-menu>Pedido<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button></span>
            <span class="pb-showcase__text">No menu, alinhado à direita.</span>
          </div>
          <div class="pb-showcase__row">
            <span class="pb-showcase__demo pb-showcase__hint">${kbd(MOD, 'K')}</span>
            <span class="pb-showcase__text">Na paleta, como dica do item.</span>
          </div>
        </div>
      </div>
      <div class="pb-rules">
        ${[
          [`${MOD} no Mac, Ctrl no resto`, 'Escreva o modificador do sistema da pessoa. Cada tecla é um <kbd class="ds-kbd">kbd</kbd> separado.'],
          ['Uma tecla só, fora de campos', '“/” ou “N” não disparam enquanto alguém digita. Com modificador, valem em qualquer lugar.'],
          ['Não brigue com o navegador', `Nada de ${MOD} T, ${MOD} W, ${MOD} L ou ${MOD} R: são do navegador e do sistema.`],
          ['Diga para a tecnologia assistiva', 'Use <code class="ds-inline-code">aria-keyshortcuts</code> no controle que o atalho aciona.'],
        ]
          .map(([t, d]) => `<article class="pb-rule"><p class="pb-rule__title">${t}</p><p class="pb-rule__text">${d}</p></article>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pb-acessibilidade',
      'Acessibilidade',
      'Buscar é a forma mais rápida de navegar com teclado e leitor de tela — desde que cada peça diga o que é.',
      a11yList([
        ['Paleta é um diálogo com combobox', 'O campo é um <code class="ds-inline-code">combobox</code> ligado à lista (<code class="ds-inline-code">listbox</code>); o item ativo é anunciado por <code class="ds-inline-code">aria-activedescendant</code> sem tirar o foco do campo.', ['↑', '↓', '↵']],
        ['Foco que volta', 'Ao fechar a paleta, o foco volta para quem a abriu. Ao executar um item, vai para onde a ação levar.', ['Esc']],
        ['Filtros numa região de busca', 'A barra tem <code class="ds-inline-code">role="search"</code> com nome; cada filtro é um botão com menu, com rótulo e valor no texto.'],
        ['Contagem anunciada', 'O “8 de 24 pedidos” fica numa região <code class="ds-inline-code">aria-live="polite"</code>: o leitor fala o resultado depois de cada mudança, sem interromper.'],
        ['Remover com nome', 'O X de cada filtro ativo diz o que remove (“Remover filtro Status: Pago”). Depois de remover, o foco vai para o próximo — ou para a busca.'],
        ['Lista vazia explicada', 'Sem resultados, a tabela dá lugar a uma mensagem com o motivo e um botão para limpar.'],
      ]),
    )}

    ${section(
      'pb-codigo',
      'Código',
      'A paleta e os filtros são módulos independentes; os dois só pedem dados e uma função para cada ação.',
      `<h3 class="doc-subhead">Filtros</h3>
      ${codeBlock(FILTERS_CODE)}
      <div class="doc-table pb-fields">
        <div class="doc-table__head" aria-hidden="true"><span>API</span><span>O que faz</span></div>
        ${[
          ['createFilters(el, config)', 'Monta a barra (busca, filtros, liga/desliga, ordenação, ativos, contagem) e devolve o controle.'],
          ['filters.state · set(parcial) · clear()', 'Lê e muda o estado; cada mudança chama <code class="ds-inline-code">onChange</code>.'],
          ['filters.setCount(mostrados, total)', 'Atualiza a contagem anunciada.'],
          ['filtersToQuery · filtersFromQuery', 'Estado ⇄ URL, ignorando o que é padrão ou não existe.'],
          ['.ds-filters e partes', 'As classes também servem para uma barra montada à mão (veja o comentário em filters.css).'],
        ]
          .map(([a, t]) => `<div class="doc-table__row"><code class="pb-fields__name">${a}</code><span class="pb-fields__text">${t}</span></div>`)
          .join('')}
      </div>
      <h3 class="doc-subhead">Paleta</h3>
      <div class="doc-table pb-fields">
        <div class="doc-table__head" aria-hidden="true"><span>Opção</span><span>O que faz</span></div>
        ${[
          ['items', 'Lista de itens — ou uma função que devolve a lista a cada abertura.'],
          ['placeholder · label', 'Texto do campo e o nome do diálogo para leitores de tela.'],
          ['hotkeys: false', 'Não liga ⌘K nem /. Para paletas extras, como a de exemplo desta página.'],
          ['open() · close() · isOpen() · destroy()', 'Controle manual; destroy() remove o diálogo e os atalhos.'],
          ['filterCommands(items, busca)', 'A mesma busca da paleta, para testes ou outras listas.'],
        ]
          .map(([a, t]) => `<div class="doc-table__row"><code class="pb-fields__name">${a}</code><span class="pb-fields__text">${t}</span></div>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pb-uso',
      'Uso',
      'Encontrar deve ser mais rápido do que lembrar onde fica.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: tudo também pela paleta</p>
          <p class="usage-card__text">Toda página e toda ação frequente entra na paleta, com sinônimos. Quem conhece o atalho nunca precisa caçar um menu.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: filtros espalhados</p>
          <p class="usage-card__text">Um filtro dentro de cada cartão ou coluna confunde o que vale para quê. Uma linha só, acima de tudo o que ela recorta.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Rótulo com a palavra da pessoa</p>
          <p class="usage-card__text">“Exportar em CSV” com a palavra-chave “planilha”. Pense no que alguém digitaria, não no nome interno da função.</p>
        </article>
      </div>`,
    )}
  </div>`;
}

/* ───────── Comportamento ───────── */

export function mount(root) {
  const cleanups = [mountCodeCopy(root), mountDocNav(root)];

  /* Paleta de exemplo: instância própria, sem atalhos globais */
  const palette = createCommandPalette({
    placeholder: 'Buscar no app de pedidos…',
    label: 'Paleta de exemplo',
    hotkeys: false,
    items: () => COMMANDS.map((c) => ({ ...c, perform: () => toast(`Exemplo: “${c.label}”`, { icon: c.icon }) })),
  });
  cleanups.push(() => palette.destroy());

  /* Testador de relevância */
  const tester = root.querySelector('[data-tester]');
  const results = root.querySelector('[data-tester-results]');
  const renderTester = () => {
    const q = tester.value;
    const scored = COMMANDS.map((c) => ({ c, score: scoreCommand(c, q) }))
      .filter((r) => r.score > 0 || !q.trim())
      .sort((a, b) => b.score - a.score);
    if (!scored.length) {
      results.innerHTML = `<li class="pb-tester__empty">${icon('search-x', { size: 18 })}Nada encontrado para “${escapeHtml(q)}”. A paleta mostra isso também.</li>`;
      return;
    }
    results.innerHTML = scored
      .map(({ c, score }) => {
        const [tone, label] = SCORE_LABEL[score] ?? ['neutral', 'tudo'];
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
    ...FILTER_CONFIG,
    onChange: (state) => renderOrders(state),
  });
  function renderOrders(state) {
    const rows = applyFilters(state);
    tbody.innerHTML = rows.map(rowHtml).join('');
    table.hidden = !rows.length;
    empty.hidden = rows.length > 0;
    filters?.setCount(rows.length, ORDERS.length);
    const q = filtersToQuery(state, FILTER_CONFIG);
    queryEl.textContent = q ? `?${q}` : '';
    queryEl.dataset.empty = q ? 'false' : 'true';
  }
  renderOrders(filters.state);
  cleanups.push(() => filters.destroy());

  /* Atalhos: menu com atalhos à direita */
  const shortcutMenu = attachMenu(root.querySelector('[data-shortcut-menu]'), {
    label: 'Pedido',
    mode: 'action',
    options: [
      { value: 'new', label: 'Novo pedido', icon: 'plus', shortcut: 'N' },
      { value: 'dup', label: 'Duplicar', icon: 'copy', shortcut: `${MOD} D` },
      { value: 'search', label: 'Buscar', icon: 'search', shortcut: `${MOD} K` },
      { type: 'separator' },
      { value: 'archive', label: 'Arquivar', icon: 'folder', shortcut: 'E' },
    ],
    onChange: (value) => toast(`Exemplo: ${{ new: 'novo pedido', dup: 'duplicar', search: 'buscar', archive: 'arquivar' }[value]}`),
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
    if (r) filters.set(filtersFromQuery(r.dataset.restore, FILTER_CONFIG));
    if (e.target.closest('[data-copy-url]')) {
      const q = filtersToQuery(filters.state, FILTER_CONFIG);
      copyText(`https://pedidos.app/pedidos${q ? `?${q}` : ''}`, 'Link copiado');
    }
  };
  root.addEventListener('click', onClick);
  cleanups.push(() => root.removeEventListener('click', onClick));

  return () => cleanups.forEach((fn) => fn());
}
