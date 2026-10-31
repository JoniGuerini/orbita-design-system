import { icon } from '../../ds/icons/icons.js';
import { mountTabs } from '../../ds/js/tabs.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/abas.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const ITEMS = () => [
  { id: 'geral', label: L('Visão geral', 'Overview', 'Resumen'), icon: 'layout', text: L('Resumo do projeto, responsáveis e próximos passos.', 'Project summary, owners, and next steps.', 'Resumen del proyecto, responsables y próximos pasos.') },
  { id: 'atividade', label: L('Atividade', 'Activity', 'Actividad'), icon: 'history', count: 12, text: L('12 atualizações desde ontem: revisões, comentários e publicações.', '12 updates since yesterday: reviews, comments, and releases.', '12 actualizaciones desde ayer: revisiones, comentarios y publicaciones.') },
  { id: 'arquivos', label: L('Arquivos', 'Files', 'Archivos'), icon: 'folder', count: 3, text: L('Três arquivos anexados: roteiro, paleta e especificação.', 'Three attached files: script, palette, and spec.', 'Tres archivos adjuntos: guion, paleta y especificación.') },
  { id: 'ajustes', label: L('Ajustes', 'Settings', 'Ajustes'), icon: 'settings', text: L('Permissões, notificações e integrações do projeto.', 'Project permissions, notifications, and integrations.', 'Permisos, notificaciones e integraciones del proyecto.') },
];

const APPEARANCES = () => [
  ['underline', L('Sublinhada', 'Underline', 'Subrayada')],
  ['segmented', L('Segmentada', 'Segmented', 'Segmentada')],
];

const KEYS = () => [
  [['Tab'], L('Entra na aba ativa. Tab de novo vai para o painel.', 'Enters the active tab. Tab again moves to the panel.', 'Entra en la pestaña activa. Tab otra vez va al panel.')],
  [['←', '→'], L('Aba anterior ou próxima. No fim, volta ao começo.', 'Previous or next tab. At the end, wraps to the start.', 'Pestaña anterior o siguiente. Al final, vuelve al principio.')],
  [['Home', 'End'], L('Primeira ou última aba.', 'First or last tab.', 'Primera o última pestaña.')],
  [['Enter', L('Espaço', 'Space', 'Espacio')], L('Ativa a aba focada — só no modo manual.', 'Activates the focused tab — manual mode only.', 'Activa la pestaña enfocada — solo en el modo manual.')],
];

const projectLabel = () => L('Projeto', 'Project', 'Proyecto');

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
  const { id, icons = 'no', counts = 'no', disabled = 'no', manual = false, label = projectLabel() } = opts;
  const items = opts.items ?? ITEMS();
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
  const items = ITEMS();
  const [tab, panel] = [L('aba', 'tab', 'pestana'), L('painel', 'panel', 'panel')];
  const lines = [`<div class="${classes(state)}" data-ds-tabs>`, `  <div class="ds-tabs__list" role="tablist" aria-label="${projectLabel()}">`];
  items.forEach((item, i) => {
    const off = state.disabled === 'yes' && i === items.length - 1;
    lines.push(`    <button type="button" class="ds-tabs__tab" role="tab" id="${tab}-${item.id}" aria-controls="${panel}-${item.id}" aria-selected="${i === 0}"${off ? ' disabled' : ''}>`);
    if (state.icons === 'yes') lines.push(`      <ds-icon name="${item.icon}" size="${state.size === 'sm' ? 14 : 16}"></ds-icon>`);
    lines.push(`      ${item.label}`);
    if (state.counts === 'yes' && item.count) lines.push(`      <span class="ds-tabs__count">${item.count}</span>`);
    lines.push('    </button>');
  });
  lines.push('  </div>');
  items.forEach((item, i) => lines.push(`  <div class="ds-tabs__panel" role="tabpanel" id="${panel}-${item.id}" aria-labelledby="${tab}-${item.id}"${i ? ' hidden' : ''}>…</div>`));
  lines.push('</div>');
  return lines.join('\n');
}

/* ───────── Página ───────── */

export default function renderAbas(page) {
  const items = ITEMS();
  const keys = KEYS();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Alternam entre vistas do mesmo assunto sem sair da página. Uma aba ativa por vez, sempre com o painel logo abaixo.', 'Switch between views of the same subject without leaving the page. One active tab at a time, always with its panel right below.', 'Alternan entre vistas del mismo asunto sin salir de la página. Una pestaña activa a la vez, siempre con el panel justo debajo.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('aparências', 'appearances', 'apariencias')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('modos de ativação', 'activation modes', 'modos de activación')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('atalhos de teclado', 'keyboard shortcuts', 'atajos de teclado')}</dt><dd class="doc-stat__value">${keys.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['aparencias', L('Aparências', 'Appearances', 'Apariencias')],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['comportamento', L('Comportamento', 'Behavior', 'Comportamiento')],
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
          <p class="doc-section__desc">${L('Monte as abas e use de verdade: clique ou navegue com as setas. O código acompanha.', 'Build the tabs and use them for real: click or navigate with the arrows. The code follows along.', 'Arma las pestañas y úsalas de verdad: haz clic o navega con las flechas. El código acompaña.')}</p>
        </div>
      </header>
      ${playgroundMarkup('abas')}
    </section>

    <section class="doc-section" id="aparencias" aria-labelledby="aparencias-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="aparencias-title">${L('Aparências', 'Appearances', 'Apariencias')}</h2>
          <p class="doc-section__desc">${L('A sublinhada organiza seções de conteúdo; a segmentada troca a vista de uma mesma coisa. As duas vêm em médio e pequeno.', 'Underline organizes content sections; segmented switches the view of the same thing. Both come in medium and small.', 'La subrayada organiza secciones de contenido; la segmentada cambia la vista de una misma cosa. Las dos vienen en mediano y pequeño.')}</p>
        </div>
      </header>
      <div class="tb-appearances">
        <article class="cd-example">
          <div class="cd-example__preview tb-example">
            ${tabs({ id: 'ap-u', appearance: 'underline', counts: 'yes' })}
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">${L('Sublinhada', 'Underline', 'Subrayada')}<code>ds-tabs</code></p>
            <p class="cd-example__text">${L('Para seções de um mesmo objeto — perfil, projeto, configurações. Fica no topo do conteúdo, alinhada à esquerda.', 'For sections of the same object — profile, project, settings. It sits at the top of the content, left-aligned.', 'Para secciones de un mismo objeto — perfil, proyecto, configuración. Queda arriba del contenido, alineada a la izquierda.')}</p>
          </div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tb-example">
            ${tabs({
              id: 'ap-s',
              appearance: 'segmented',
              icons: 'yes',
              label: L('Visualização', 'View', 'Vista'),
              items: [
                { id: 'lista', label: L('Lista', 'List', 'Lista'), icon: 'list', text: L('Itens em linhas, bom para comparar detalhes.', 'Items in rows, good for comparing details.', 'Elementos en filas, bueno para comparar detalles.') },
                { id: 'quadro', label: L('Quadro', 'Board', 'Tablero'), icon: 'layout', text: L('Itens em colunas por status, bom para acompanhar o fluxo.', 'Items in columns by status, good for following the flow.', 'Elementos en columnas por estado, bueno para seguir el flujo.') },
                { id: 'agenda', label: L('Agenda', 'Calendar', 'Agenda'), icon: 'calendar', text: L('Itens no calendário, bom para prazos.', 'Items on the calendar, good for deadlines.', 'Elementos en el calendario, bueno para plazos.') },
              ],
            })}
          </div>
          <div class="cd-example__body">
            <p class="cd-example__name">${L('Segmentada', 'Segmented', 'Segmentada')}<code>ds-tabs--segmented</code></p>
            <p class="cd-example__text">${L('Para alternar a vista de um mesmo conjunto — lista, quadro, agenda. Duas a quatro opções curtas.', 'For switching the view of the same set — list, board, calendar. Two to four short options.', 'Para alternar la vista de un mismo conjunto — lista, tablero, agenda. De dos a cuatro opciones cortas.')}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">${L('Anatomia', 'Anatomy', 'Anatomía')}</h2>
          <p class="doc-section__desc">${L('Quatro partes. Cada aba aponta para o seu painel, e o painel aponta de volta.', 'Four parts. Each tab points to its panel, and the panel points back.', 'Cuatro partes. Cada pestaña apunta a su panel, y el panel apunta de vuelta.')}</p>
        </div>
      </header>
      <div class="tb-anatomy">
        <div class="tb-anatomy__stage" aria-hidden="true" inert>
          <div class="ds-tabs" data-anatomy>
            <div class="ds-tabs__list tb-pin" data-num="1">
              <span class="ds-tabs__tab tb-pin" data-num="2" aria-selected="true">${items[0].label}</span>
              <span class="ds-tabs__tab">${items[1].label} <span class="ds-tabs__count tb-pin" data-num="3">12</span></span>
              <span class="ds-tabs__tab">${items[2].label}</span>
            </div>
            <div class="ds-tabs__panel tb-pin" data-num="4">${panelContent(items[0])}</div>
          </div>
        </div>
        <ol class="tb-anatomy__legend" role="list">
          <li><span class="tb-anatomy__num">1</span><div><p class="tb-anatomy__title">${L('Lista de abas', 'Tab list', 'Lista de pestañas')}</p><p class="tb-anatomy__text">${L(`${ic('role="tablist"')} com nome (${ic('aria-label')}). Rola na horizontal quando não cabe.`, `${ic('role="tablist"')} with a name (${ic('aria-label')}). Scrolls horizontally when it doesn’t fit.`, `${ic('role="tablist"')} con nombre (${ic('aria-label')}). Se desplaza en horizontal cuando no cabe.`)}</p></div></li>
          <li><span class="tb-anatomy__num">2</span><div><p class="tb-anatomy__title">${L('Aba ativa', 'Active tab', 'Pestaña activa')}</p><p class="tb-anatomy__text">${L(`Texto em ${ic('fg.default')} e indicador de 2 px na cor da marca. As outras ficam em ${ic('fg.subtle')}.`, `Text in ${ic('fg.default')} and a 2 px indicator in the brand color. The others use ${ic('fg.subtle')}.`, `Texto en ${ic('fg.default')} e indicador de 2 px en el color de la marca. Las demás quedan en ${ic('fg.subtle')}.`)}</p></div></li>
          <li><span class="tb-anatomy__num">3</span><div><p class="tb-anatomy__title">${L('Contagem', 'Count', 'Conteo')} <span class="tb-anatomy__optional">${L('opcional', 'optional', 'opcional')}</span></p><p class="tb-anatomy__text">${L('Número curto do que há dentro. Sem cor de status — ela não é um alerta.', 'A short number for what’s inside. No status color — it isn’t an alert.', 'Número corto de lo que hay dentro. Sin color de estado — no es una alerta.')}</p></div></li>
          <li><span class="tb-anatomy__num">4</span><div><p class="tb-anatomy__title">${L('Painel', 'Panel', 'Panel')}</p><p class="tb-anatomy__text">${L(`${ic('role="tabpanel"')}, focável, logo abaixo da lista. Só o painel ativo aparece.`, `${ic('role="tabpanel"')}, focusable, right below the list. Only the active panel shows.`, `${ic('role="tabpanel"')}, enfocable, justo debajo de la lista. Solo aparece el panel activo.`)}</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="comportamento" aria-labelledby="comportamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="comportamento-title">${L('Comportamento', 'Behavior', 'Comportamiento')}</h2>
          <p class="doc-section__desc">${L('Na ativação automática, as setas já trocam o painel. Na manual, as setas só movem o foco — use quando abrir um painel custa caro (busca, carregamento).', 'With automatic activation, the arrows switch the panel right away. With manual, the arrows only move focus — use it when opening a panel is expensive (search, loading).', 'En la activación automática, las flechas ya cambian el panel. En la manual, las flechas solo mueven el foco — úsala cuando abrir un panel es costoso (búsqueda, carga).')}</p>
        </div>
      </header>
      <div class="tb-modes">
        <article class="cd-example">
          <div class="cd-example__preview tb-example">${tabs({ id: 'md-a', size: 'sm' })}</div>
          <div class="cd-example__body">
            <p class="cd-example__name">${L('Automática', 'Automatic', 'Automática')}<code>${L('padrão', 'default', 'predeterminado')}</code></p>
            <p class="cd-example__text">${L('Foque uma aba e use ← →: o painel troca junto.', 'Focus a tab and use ← →: the panel switches along.', 'Enfoca una pestaña y usa ← →: el panel cambia a la vez.')}</p>
          </div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview tb-example">${tabs({ id: 'md-m', size: 'sm', manual: true })}</div>
          <div class="cd-example__body">
            <p class="cd-example__name">Manual<code>data-activation="manual"</code></p>
            <p class="cd-example__text">${L('As setas movem o foco; Enter ou Espaço ativam.', 'The arrows move focus; Enter or Space activate.', 'Las flechas mueven el foco; Enter o Espacio activan.')}</p>
          </div>
        </article>
      </div>

      <h3 class="doc-subhead">${L('Teclado', 'Keyboard', 'Teclado')}</h3>
      <div class="doc-table tb-keys">
        ${keys.map(([k, text]) => `<div class="doc-table__row"><span class="tb-keys__keys">${k.map((key) => `<kbd class="ds-kbd">${key}</kbd>`).join('')}</span><span class="tb-keys__text">${text}</span></div>`).join('')}
      </div>

      <h3 class="doc-subhead">${L('Em código', 'In code', 'En código')}</h3>
      ${codeBlock(`import { mountTabs } from './ds/js/tabs.js';

// ${L('liga todas as abas [data-ds-tabs] da página — inclusive as que entrarem depois', 'wires every [data-ds-tabs] on the page — including ones added later', 'conecta todas las pestañas [data-ds-tabs] de la página — incluso las que entren después')}
const unmount = mountTabs(document);

document.addEventListener('ds:tabchange', (event) => {
  console.log(event.detail.id); // ${L('id da aba ativa', 'active tab id', 'id de la pestaña activa')}
});`)}
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('O script cuida dos estados e do teclado. A marcação certa é com você.', 'The script handles states and the keyboard. The right markup is up to you.', 'El script se encarga de los estados y del teclado. El marcado correcto depende de ti.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Papéis e ligações', 'Roles and links', 'Roles y vínculos'), L(`${ic('tablist')} → ${ic('tab')} com ${ic('aria-controls')}; o ${ic('tabpanel')} responde com ${ic('aria-labelledby')}.`, `${ic('tablist')} → ${ic('tab')} with ${ic('aria-controls')}; the ${ic('tabpanel')} answers with ${ic('aria-labelledby')}.`, `${ic('tablist')} → ${ic('tab')} con ${ic('aria-controls')}; el ${ic('tabpanel')} responde con ${ic('aria-labelledby')}.`)],
        [L('Um ponto de parada', 'One tab stop', 'Una sola parada'), L(`Só a aba ativa recebe Tab (${ic('tabindex')} móvel). As outras se alcançam com as setas.`, `Only the active tab takes Tab (roving ${ic('tabindex')}). The others are reached with the arrows.`, `Solo la pestaña activa recibe Tab (${ic('tabindex')} móvil). Las demás se alcanzan con las flechas.`), ['←', '→']],
        [L('Estado anunciado', 'Announced state', 'Estado anunciado'), L(`${ic('aria-selected')} diz qual está ativa; o leitor de tela lê “aba, 2 de 4, selecionada”.`, `${ic('aria-selected')} says which one is active; the screen reader reads “tab, 2 of 4, selected”.`, `${ic('aria-selected')} dice cuál está activa; el lector de pantalla lee “pestaña, 2 de 4, seleccionada”.`)],
        [L('Painel focável', 'Focusable panel', 'Panel enfocable'), L(`O painel recebe ${ic('tabindex="0"')} para quem navega por Tab chegar ao conteúdo, mesmo sem links.`, `The panel gets ${ic('tabindex="0"')} so Tab users reach the content, even without links.`, `El panel recibe ${ic('tabindex="0"')} para que quien navega con Tab llegue al contenido, incluso sin enlaces.`)],
        [L('Nome da lista', 'List name', 'Nombre de la lista'), L(`Dê um ${ic('aria-label')} ao tablist (“Projeto”, “Visualização”) para diferenciar conjuntos.`, `Give the tablist an ${ic('aria-label')} (“Project”, “View”) to tell sets apart.`, `Dale un ${ic('aria-label')} al tablist (“Proyecto”, “Vista”) para diferenciar conjuntos.`)],
        [L('Abas não são navegação', 'Tabs aren’t navigation', 'Las pestañas no son navegación'), L('Para ir a outra página, use links. Abas trocam conteúdo dentro da mesma página.', 'To go to another page, use links. Tabs switch content within the same page.', 'Para ir a otra página, usa enlaces. Las pestañas cambian contenido dentro de la misma página.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Tudo o que as abas consomem.', 'Everything the tabs consume.', 'Todo lo que consumen las pestañas.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['size.control.md', L('Altura da aba (médio)', 'Tab height (medium)', 'Altura de la pestaña (mediano)')],
        ['size.control.sm', L('Altura da aba (pequeno)', 'Tab height (small)', 'Altura de la pestaña (pequeño)')],
        ['text.label-md', L('Rótulo', 'Label', 'Etiqueta')],
        ['color.fg.subtle', L('Aba inativa', 'Inactive tab', 'Pestaña inactiva')],
        ['color.fg.default', L('Aba ativa', 'Active tab', 'Pestaña activa')],
        ['color.brand.solid', L('Indicador da aba ativa', 'Active tab indicator', 'Indicador de la pestaña activa')],
        ['color.border.subtle', L('Linha de base', 'Baseline', 'Línea base')],
        ['color.bg.hover', 'Hover'],
        ['color.bg.sunken', L('Trilho da segmentada', 'Segmented track', 'Riel de la segmentada')],
        ['color.bg.muted', L('Aba ativa da segmentada', 'Segmented active tab', 'Pestaña activa de la segmentada')],
        ['color.bg.selected', L('Fundo da contagem', 'Count background', 'Fondo del conteo')],
        ['radius.full', L('Segmentada e contagem', 'Segmented and count', 'Segmentada y conteo')],
        ['duration.fast', L('Transição de cor', 'Color transition', 'Transición de color')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Três regras para abas que não confundem.', 'Three rules for tabs that don’t confuse.', 'Tres reglas para pestañas que no confunden.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: rótulos curtos e paralelos', 'Do: short, parallel labels', 'Haz: etiquetas cortas y paralelas')}</p>
          <div class="tb-usage__preview" inert>${tabs({ id: 'us-do', size: 'sm' })}</div>
          <p class="usage-card__text">${L('Substantivos de uma ou duas palavras, de duas a seis abas.', 'Nouns of one or two words, two to six tabs.', 'Sustantivos de una o dos palabras, de dos a seis pestañas.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: abas como etapas', 'Avoid: tabs as steps', 'Evita: pestañas como etapas')}</p>
          <div class="tb-usage__preview" inert>${tabs({
            id: 'us-dont',
            size: 'sm',
            label: L('Etapas', 'Steps', 'Etapas'),
            items: [
              { id: 'a', label: L('1. Dados', '1. Details', '1. Datos'), text: '—' },
              { id: 'b', label: L('2. Pagamento', '2. Payment', '2. Pago'), text: '—' },
              { id: 'c', label: L('3. Revisão', '3. Review', '3. Revisión'), text: '—' },
            ],
          })}</div>
          <p class="usage-card__text">${L('Abas não têm ordem. Para um fluxo em passos, use etapas com “Continuar”.', 'Tabs have no order. For a step-by-step flow, use steps with “Continue”.', 'Las pestañas no tienen orden. Para un flujo por pasos, usa etapas con “Continuar”.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Guarde a aba ativa', 'Remember the active tab', 'Guarda la pestaña activa')}</p>
          <p class="usage-card__text">${L('Se faz sentido compartilhar ou voltar para a mesma vista, guarde a aba no endereço ou na sessão.', 'If it makes sense to share or come back to the same view, keep the tab in the URL or the session.', 'Si tiene sentido compartir o volver a la misma vista, guarda la pestaña en la dirección o en la sesión.')}</p>
          <pre class="ds-code ds-code--sm"><code>tabs.addEventListener('ds:tabchange',
  (e) => history.replaceState(null, '', '?${L('aba', 'tab', 'pestana')}=' + e.detail.id));</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountTabs = mountTabs(root);
  const without = L('Sem', 'Without', 'Sin');
  const withOpt = L('Com', 'With', 'Con');
  const unmountPlayground = mountPlayground(root, {
    id: 'abas',
    controls: [
      { id: 'appearance', label: L('Aparência', 'Appearance', 'Apariencia'), value: 'underline', options: APPEARANCES().map(([value, label]) => ({ value, label })) },
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: [{ value: 'md', label: L('Médio', 'Medium', 'Mediano') }, { value: 'sm', label: L('Pequeno', 'Small', 'Pequeño') }] },
      { id: 'icons', label: L('Ícones', 'Icons', 'Íconos'), value: 'no', options: [{ value: 'no', label: without }, { value: 'yes', label: withOpt }] },
      { id: 'counts', label: L('Contagem', 'Count', 'Conteo'), value: 'yes', options: [{ value: 'no', label: without }, { value: 'yes', label: withOpt }] },
      { id: 'fill', label: L('Largura', 'Width', 'Ancho'), value: 'natural', options: [{ value: 'natural', label: 'Natural' }, { value: 'fill', label: L('Preencher', 'Fill', 'Llenar') }] },
      { id: 'disabled', label: L('Última aba', 'Last tab', 'Última pestaña'), value: 'no', options: [{ value: 'no', label: L('Ativa', 'Enabled', 'Activa') }, { value: 'yes', label: L('Desativada', 'Disabled', 'Desactivada') }] },
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
