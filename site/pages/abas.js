import { icon } from '../../ds/icons/icons.js';
import { mountTabs } from '../../ds/js/tabs.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/abas.css'];

/* ───────── Dados ───────── */

const ITEMS = [
  { id: 'geral', label: 'Visão geral', icon: 'layout', text: 'Resumo do projeto, responsáveis e próximos passos.' },
  { id: 'atividade', label: 'Atividade', icon: 'history', count: 12, text: '12 atualizações desde ontem: revisões, comentários e publicações.' },
  { id: 'arquivos', label: 'Arquivos', icon: 'folder', count: 3, text: 'Três arquivos anexados: roteiro, paleta e especificação.' },
  { id: 'ajustes', label: 'Ajustes', icon: 'settings', text: 'Permissões, notificações e integrações do projeto.' },
];

const APPEARANCES = [
  ['underline', 'Sublinhada'],
  ['segmented', 'Segmentada'],
];

const KEYS = [
  [['Tab'], 'Entra na aba ativa. Tab de novo vai para o painel.'],
  [['←', '→'], 'Aba anterior ou próxima. No fim, volta ao começo.'],
  [['Home', 'End'], 'Primeira ou última aba.'],
  [['Enter', 'Espaço'], 'Ativa a aba focada — só no modo manual.'],
];

/* ───────── Montagem das abas ───────── */

function classes({ appearance = 'underline', size = 'md', fill = 'natural' }) {
  return ['ds-tabs', appearance === 'segmented' && 'ds-tabs--segmented', size === 'sm' && 'ds-tabs--sm', fill === 'fill' && 'ds-tabs--fill'].filter(Boolean).join(' ');
}

function panelContent(item) {
  return `<div class="tb-panel">
    <p class="tb-panel__title">${item.label}</p>
    <p class="tb-panel__text">${item.text}</p>
  </div>`;
}

/**
 * Abas reais. opts: id (prefixo único), appearance, size, fill, icons, counts, disabled, manual, items, label
 */
function tabs(opts) {
  const { id, icons = 'no', counts = 'no', disabled = 'no', manual = false, label = 'Projeto' } = opts;
  const items = opts.items ?? ITEMS;
  const iconSize = opts.size === 'sm' ? 14 : 16;
  return `<div class="${classes(opts)}" data-ds-tabs${manual ? ' data-activation="manual"' : ''}>
    <div class="ds-tabs__list" role="tablist" aria-label="${label}">
      ${items
        .map((item, i) => {
          const off = disabled === 'yes' && i === items.length - 1;
          return `<button type="button" class="ds-tabs__tab" role="tab" id="${id}-tab-${item.id}" aria-controls="${id}-panel-${item.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"${off ? ' disabled' : ''}>
            ${icons === 'yes' ? icon(item.icon, { size: iconSize }) : ''}<span>${item.label}</span>${counts === 'yes' && item.count ? `<span class="ds-tabs__count">${item.count}</span>` : ''}
          </button>`;
        })
        .join('')}
    </div>
    ${items.map((item, i) => `<div class="ds-tabs__panel" role="tabpanel" id="${id}-panel-${item.id}" aria-labelledby="${id}-tab-${item.id}" tabindex="0"${i ? ' hidden' : ''}>${panelContent(item)}</div>`).join('')}
  </div>`;
}

function tabsCode(state) {
  const lines = [`<div class="${classes(state)}" data-ds-tabs>`, '  <div class="ds-tabs__list" role="tablist" aria-label="Projeto">'];
  ITEMS.forEach((item, i) => {
    const off = state.disabled === 'yes' && i === ITEMS.length - 1;
    lines.push(`    <button type="button" class="ds-tabs__tab" role="tab" id="aba-${item.id}" aria-controls="painel-${item.id}" aria-selected="${i === 0}"${off ? ' disabled' : ''}>`);
    if (state.icons === 'yes') lines.push(`      <ds-icon name="${item.icon}" size="${state.size === 'sm' ? 14 : 16}"></ds-icon>`);
    lines.push(`      ${item.label}`);
    if (state.counts === 'yes' && item.count) lines.push(`      <span class="ds-tabs__count">${item.count}</span>`);
    lines.push('    </button>');
  });
  lines.push('  </div>');
  ITEMS.forEach((item, i) => lines.push(`  <div class="ds-tabs__panel" role="tabpanel" id="painel-${item.id}" aria-labelledby="aba-${item.id}"${i ? ' hidden' : ''}>…</div>`));
  lines.push('</div>');
  return lines.join('\n');
}

/* ───────── Página ───────── */

export default function renderAbas(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Abas</h1>
        <p class="doc-header__lead">Alternam entre vistas do mesmo assunto sem sair da página. Uma aba ativa por vez, sempre com o painel logo abaixo.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">aparências</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">modos de ativação</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">atalhos de teclado</dt><dd class="doc-stat__value">${KEYS.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['aparencias', 'Aparências'],
        ['anatomia', 'Anatomia'],
        ['comportamento', 'Comportamento'],
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
          <p class="doc-section__desc">Monte as abas e use de verdade: clique ou navegue com as setas. O código acompanha.</p>
        </div>
      </header>
      ${playgroundMarkup('abas')}
    </section>

    <section class="doc-section" id="aparencias" aria-labelledby="aparencias-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="aparencias-title">Aparências</h2>
          <p class="doc-section__desc">A sublinhada organiza seções de conteúdo; a segmentada troca a vista de uma mesma coisa. As duas vêm em médio e pequeno.</p>
        </div>
      </header>
      <div class="tb-appearances">
        <article class="cd-example">
          <div class="cd-example__preview tb-example">
            ${tabs({ id: 'ap-u', appearance: 'underline', counts: 'yes' })}
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">Sublinhada<code>ds-tabs</code></p>
            <p class="cd-example__text">Para seções de um mesmo objeto — perfil, projeto, configurações. Fica no topo do conteúdo, alinhada à esquerda.</p>
          </div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tb-example">
            ${tabs({
              id: 'ap-s',
              appearance: 'segmented',
              icons: 'yes',
              label: 'Visualização',
              items: [
                { id: 'lista', label: 'Lista', icon: 'list', text: 'Itens em linhas, bom para comparar detalhes.' },
                { id: 'quadro', label: 'Quadro', icon: 'layout', text: 'Itens em colunas por status, bom para acompanhar o fluxo.' },
                { id: 'agenda', label: 'Agenda', icon: 'calendar', text: 'Itens no calendário, bom para prazos.' },
              ],
            })}
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">Segmentada<code>ds-tabs--segmented</code></p>
            <p class="cd-example__text">Para alternar a vista de um mesmo conjunto — lista, quadro, agenda. Duas a quatro opções curtas.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">Anatomia</h2>
          <p class="doc-section__desc">Quatro partes. Cada aba aponta para o seu painel, e o painel aponta de volta.</p>
        </div>
      </header>
      <div class="tb-anatomy">
        <div class="tb-anatomy__stage" aria-hidden="true" inert>
          <div class="ds-tabs" data-anatomy>
            <div class="ds-tabs__list tb-pin" data-num="1">
              <span class="ds-tabs__tab tb-pin" data-num="2" aria-selected="true">Visão geral</span>
              <span class="ds-tabs__tab">Atividade <span class="ds-tabs__count tb-pin" data-num="3">12</span></span>
              <span class="ds-tabs__tab">Arquivos</span>
            </div>
            <div class="ds-tabs__panel tb-pin" data-num="4">${panelContent(ITEMS[0])}</div>
          </div>
        </div>
        <ol class="tb-anatomy__legend" role="list">
          <li><span class="tb-anatomy__num">1</span><div><p class="tb-anatomy__title">Lista de abas</p><p class="tb-anatomy__text"><code class="ds-inline-code">role="tablist"</code> com nome (<code class="ds-inline-code">aria-label</code>). Rola na horizontal quando não cabe.</p></div></li>
          <li><span class="tb-anatomy__num">2</span><div><p class="tb-anatomy__title">Aba ativa</p><p class="tb-anatomy__text">Texto em <code class="ds-inline-code">fg.default</code> e indicador de 2 px na cor da marca. As outras ficam em <code class="ds-inline-code">fg.subtle</code>.</p></div></li>
          <li><span class="tb-anatomy__num">3</span><div><p class="tb-anatomy__title">Contagem <span class="tb-anatomy__optional">opcional</span></p><p class="tb-anatomy__text">Número curto do que há dentro. Sem cor de status — ela não é um alerta.</p></div></li>
          <li><span class="tb-anatomy__num">4</span><div><p class="tb-anatomy__title">Painel</p><p class="tb-anatomy__text"><code class="ds-inline-code">role="tabpanel"</code>, focável, logo abaixo da lista. Só o painel ativo aparece.</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="comportamento" aria-labelledby="comportamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="comportamento-title">Comportamento</h2>
          <p class="doc-section__desc">Na ativação automática, as setas já trocam o painel. Na manual, as setas só movem o foco — use quando abrir um painel custa caro (busca, carregamento).</p>
        </div>
      </header>
      <div class="tb-modes">
        <article class="cd-example">
          <div class="cd-example__preview tb-example">${tabs({ id: 'md-a', size: 'sm' })}</div>
          <div class="cd-example__body">
            <p class="cd-example__name">Automática<code>padrão</code></p>
            <p class="cd-example__text">Foque uma aba e use ← →: o painel troca junto.</p>
          </div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tb-example">${tabs({ id: 'md-m', size: 'sm', manual: true })}</div>
          <div class="cd-example__body">
            <p class="cd-example__name">Manual<code>data-activation="manual"</code></p>
            <p class="cd-example__text">As setas movem o foco; Enter ou Espaço ativam.</p>
          </div>
        </article>
      </div>

      <h3 class="doc-subhead">Teclado</h3>
      <div class="doc-table tb-keys">
        ${KEYS.map(([keys, text]) => `<div class="doc-table__row"><span class="tb-keys__keys">${keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('')}</span><span class="tb-keys__text">${text}</span></div>`).join('')}
      </div>

      <h3 class="doc-subhead">Em código</h3>
      ${codeBlock(`import { mountTabs } from './ds/js/tabs.js';

// liga todas as abas [data-ds-tabs] da página — inclusive as que entrarem depois
const unmount = mountTabs(document);

document.addEventListener('ds:tabchange', (event) => {
  console.log(event.detail.id); // id da aba ativa
});`)}
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">O script cuida dos estados e do teclado. A marcação certa é com você.</p>
        </div>
      </header>
      ${a11yList([
        ['Papéis e ligações', '<code class="ds-inline-code">tablist</code> → <code class="ds-inline-code">tab</code> com <code class="ds-inline-code">aria-controls</code>; o <code class="ds-inline-code">tabpanel</code> responde com <code class="ds-inline-code">aria-labelledby</code>.'],
        ['Um ponto de parada', 'Só a aba ativa recebe Tab (<code class="ds-inline-code">tabindex</code> móvel). As outras se alcançam com as setas.', ['←', '→']],
        ['Estado anunciado', '<code class="ds-inline-code">aria-selected</code> diz qual está ativa; o leitor de tela lê “aba, 2 de 4, selecionada”.'],
        ['Painel focável', 'O painel recebe <code class="ds-inline-code">tabindex="0"</code> para quem navega por Tab chegar ao conteúdo, mesmo sem links.'],
        ['Nome da lista', 'Dê um <code class="ds-inline-code">aria-label</code> ao tablist (“Projeto”, “Visualização”) para diferenciar conjuntos.'],
        ['Abas não são navegação', 'Para ir a outra página, use links. Abas trocam conteúdo dentro da mesma página.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Tudo o que as abas consomem.</p>
        </div>
      </header>
      ${tokenTable([
        ['size.control.md', 'Altura da aba (médio)'],
        ['size.control.sm', 'Altura da aba (pequeno)'],
        ['text.label-md', 'Rótulo'],
        ['color.fg.subtle', 'Aba inativa'],
        ['color.fg.default', 'Aba ativa'],
        ['color.brand.solid', 'Indicador da aba ativa'],
        ['color.border.subtle', 'Linha de base'],
        ['color.bg.hover', 'Hover'],
        ['color.bg.sunken', 'Trilho da segmentada'],
        ['color.bg.muted', 'Aba ativa da segmentada'],
        ['color.bg.selected', 'Fundo da contagem'],
        ['radius.full', 'Segmentada e contagem'],
        ['duration.fast', 'Transição de cor'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três regras para abas que não confundem.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: rótulos curtos e paralelos</p>
          <div class="tb-usage__preview" inert>${tabs({ id: 'us-do', size: 'sm' })}</div>
          <p class="usage-card__text">Substantivos de uma ou duas palavras, de duas a seis abas.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: abas como etapas</p>
          <div class="tb-usage__preview" inert>${tabs({
            id: 'us-dont',
            size: 'sm',
            label: 'Etapas',
            items: [
              { id: 'a', label: '1. Dados', text: '—' },
              { id: 'b', label: '2. Pagamento', text: '—' },
              { id: 'c', label: '3. Revisão', text: '—' },
            ],
          })}</div>
          <p class="usage-card__text">Abas não têm ordem. Para um fluxo em passos, use etapas com “Continuar”.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Guarde a aba ativa</p>
          <p class="usage-card__text">Se faz sentido compartilhar ou voltar para a mesma vista, guarde a aba no endereço ou na sessão.</p>
          <pre class="ds-code ds-code--sm"><code>tabs.addEventListener('ds:tabchange',
  (e) => history.replaceState(null, '', '?aba=' + e.detail.id));</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountTabs = mountTabs(root);
  const unmountPlayground = mountPlayground(root, {
    id: 'abas',
    controls: [
      { id: 'appearance', label: 'Aparência', value: 'underline', options: APPEARANCES.map(([value, label]) => ({ value, label })) },
      { id: 'size', label: 'Tamanho', value: 'md', options: [{ value: 'md', label: 'Médio' }, { value: 'sm', label: 'Pequeno' }] },
      { id: 'icons', label: 'Ícones', value: 'no', options: [{ value: 'no', label: 'Sem' }, { value: 'yes', label: 'Com' }] },
      { id: 'counts', label: 'Contagem', value: 'yes', options: [{ value: 'no', label: 'Sem' }, { value: 'yes', label: 'Com' }] },
      { id: 'fill', label: 'Largura', value: 'natural', options: [{ value: 'natural', label: 'Natural' }, { value: 'fill', label: 'Preencher' }] },
      { id: 'disabled', label: 'Última aba', value: 'no', options: [{ value: 'no', label: 'Ativa' }, { value: 'yes', label: 'Desativada' }] },
    ],
    render: (state) => `<div class="tb-stage">${tabs({ ...state, id: 'pg' })}</div>`,
    code: tabsCode,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
    unmountTabs();
  };
}

