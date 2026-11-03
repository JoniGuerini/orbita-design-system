import { icon } from '../../ds/icons/icons.js';
import { toast } from '../../ds/js/toast.js';
import { locale, dateFormat, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, a11yList, escapeHtml, siteTheme, followSiteTheme } from '../component-doc.js';
import { themeSwitch } from '../themes.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-estados-vazios.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const normalize = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const brl = (v) => formatNumber(v, { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const searchExample = () => L('orçamento 2019', 'budget 2019', 'presupuesto 2019');

/** As seis situações — o mesmo texto alimenta o playground, o código e as seções. */
const SITUATIONS = () => ({
  primeiro: {
    label: L('Primeiro uso', 'First use', 'Primer uso'),
    icon: 'folder',
    title: L('Nenhum projeto ainda', 'No projects yet', 'Ningún proyecto todavía'),
    desc: L('Projetos reúnem tarefas, arquivos e pessoas. Crie o primeiro e convide o time.', 'Projects bring together tasks, files, and people. Create the first one and invite the team.', 'Los proyectos reúnen tareas, archivos y personas. Crea el primero e invita al equipo.'),
    actions: [['primary', 'plus', L('Criar projeto', 'Create project', 'Crear proyecto')], ['inline', 'arrow-right', L('Ver um exemplo', 'See an example', 'Ver un ejemplo')]],
  },
  busca: {
    label: L('Sem resultados', 'No results', 'Sin resultados'),
    icon: 'search-x',
    title: L(`Nada encontrado para “${searchExample()}”`, `Nothing found for “${searchExample()}”`, `Nada encontrado para “${searchExample()}”`),
    desc: L('Confira a grafia ou tente outra palavra. A busca olha títulos e autores.', 'Check the spelling or try another word. Search looks at titles and authors.', 'Revisa la ortografía o prueba otra palabra. La búsqueda mira títulos y autores.'),
    actions: [['secondary', 'x', L('Limpar busca', 'Clear search', 'Limpiar búsqueda')], ['inline', 'filter', L('Limpar filtros', 'Clear filters', 'Limpiar filtros')]],
    role: 'status',
  },
  erro: {
    label: L('Erro', 'Error', 'Error'),
    tone: 'danger',
    icon: 'alert-circle',
    title: L('Não conseguimos carregar os pagamentos', 'We couldn’t load the payments', 'No pudimos cargar los pagos'),
    desc: L('Pode ser instabilidade do nosso lado. Seus dados estão seguros — tente de novo em alguns segundos.', 'It may be instability on our side. Your data is safe — try again in a few seconds.', 'Puede ser inestabilidad de nuestro lado. Tus datos están seguros — inténtalo de nuevo en unos segundos.'),
    actions: [['secondary', 'refresh', L('Tentar de novo', 'Try again', 'Intentar de nuevo')], ['inline', 'external-link', L('Ver status do serviço', 'See service status', 'Ver estado del servicio')]],
    meta: L('Erro 503 · 14:32', 'Error 503 · 14:32', 'Error 503 · 14:32'),
  },
  permissao: {
    label: L('Sem permissão', 'No permission', 'Sin permiso'),
    tone: 'muted',
    icon: 'lock',
    title: L('Você não tem acesso a este relatório', 'You don’t have access to this report', 'No tienes acceso a este informe'),
    desc: L('Ele é do time de Finanças. Peça acesso a quem criou — a pessoa recebe um aviso.', 'It belongs to the Finance team. Ask whoever created it for access — they get a notice.', 'Es del equipo de Finanzas. Pide acceso a quien lo creó — la persona recibe un aviso.'),
    actions: [['primary', 'mail', L('Pedir acesso', 'Request access', 'Pedir acceso')], ['inline', 'arrow-left', L('Voltar para relatórios', 'Back to reports', 'Volver a informes')]],
  },
  offline: {
    label: 'Offline',
    tone: 'warning',
    icon: 'wifi-off',
    title: L('Sem conexão', 'Offline', 'Sin conexión'),
    desc: L('Não há uma versão salva desta lista. Ela carrega sozinha quando a internet voltar.', 'There’s no saved version of this list. It loads on its own when the internet comes back.', 'No hay una versión guardada de esta lista. Se carga sola cuando vuelva internet.'),
    actions: [['secondary', 'refresh', L('Tentar agora', 'Try now', 'Intentar ahora')]],
  },
  carregando: {
    label: L('Carregando', 'Loading', 'Cargando'),
    tone: 'loading',
    icon: 'loader',
    title: L('Carregando os projetos…', 'Loading the projects…', 'Cargando los proyectos…'),
    desc: L('Costuma levar poucos segundos.', 'It usually takes a few seconds.', 'Suele tardar pocos segundos.'),
    actions: [],
    role: 'status',
  },
});

const PLACES = () => [
  ['pagina', L('Página inteira', 'Full page', 'Página entera'), ''],
  ['painel', L('Dentro de painel', 'Inside a panel', 'Dentro de panel'), 'ds-empty--compact'],
  ['lista', L('Linha de lista', 'List row', 'Fila de lista'), 'ds-empty--inline'],
];

const kindName = (k) => (k === 'pdf' ? 'PDF' : L('Planilha', 'Spreadsheet', 'Hoja de cálculo'));

const DOCS = () => [
  [L('Relatório trimestral Q3', 'Q3 quarterly report', 'Informe trimestral T3'), 'Ana Souza', 'pdf'],
  [L('Plano de metas 2026', '2026 goals plan', 'Plan de metas 2026'), 'Bruno Lima', 'planilha'],
  [L('Ata da reunião de produto', 'Product meeting minutes', 'Acta de la reunión de producto'), 'Carla Dias', 'pdf'],
  [L('Contrato de parceria', 'Partnership agreement', 'Contrato de asociación'), 'Diego Rocha', 'pdf'],
  [L('Guia de marca Lume', 'Lume brand guide', 'Guía de marca Lume'), 'Elisa Prado', 'pdf'],
  [L('Orçamento de marketing', 'Marketing budget', 'Presupuesto de marketing'), 'Fábio Nunes', 'planilha'],
];

const PAYMENTS = () => [
  ['Mercado Central', 'Pix', brl(182.4)],
  [L('Livraria Atlas', 'Atlas Bookstore', 'Librería Atlas'), L('Cartão de crédito', 'Credit card', 'Tarjeta de crédito'), brl(96.9)],
  [L('Posto Avenida', 'Avenida Gas Station', 'Gasolinera Avenida'), L('Cartão de débito', 'Debit card', 'Tarjeta de débito'), brl(210)],
  [L('Farmácia Bem', 'Bem Pharmacy', 'Farmacia Bem'), 'Pix', brl(43.75)],
];

const WRITING = () => [
  [L('Primeiro uso', 'First use', 'Primer uso'), L('Nenhum dado.', 'No data.', 'Sin datos.'), L('Nenhum projeto ainda. Crie o primeiro e convide o time.', 'No projects yet. Create the first one and invite the team.', 'Ningún proyecto todavía. Crea el primero e invita al equipo.')],
  [L('Sem resultados', 'No results', 'Sin resultados'), L('0 resultados', '0 results', '0 resultados'), L(`Nada encontrado para “${searchExample()}”. Confira a grafia ou limpe os filtros.`, `Nothing found for “${searchExample()}”. Check the spelling or clear the filters.`, `Nada encontrado para “${searchExample()}”. Revisa la ortografía o limpia los filtros.`)],
  [L('Erro', 'Error', 'Error'), L('Ocorreu um erro!', 'An error occurred!', '¡Ocurrió un error!'), L('Não conseguimos carregar os pagamentos. Tente de novo em alguns segundos.', 'We couldn’t load the payments. Try again in a few seconds.', 'No pudimos cargar los pagos. Inténtalo de nuevo en unos segundos.')],
  [L('Sem permissão', 'No permission', 'Sin permiso'), L('Acesso negado (403)', 'Access denied (403)', 'Acceso denegado (403)'), L('Você não tem acesso a este relatório. Peça a quem o criou.', 'You don’t have access to this report. Ask whoever created it.', 'No tienes acceso a este informe. Pídelo a quien lo creó.')],
  ['Offline', 'Network error', L('Sem conexão. Mostrando a última versão salva, das 14:32.', 'Offline. Showing the last saved version, from 14:32.', 'Sin conexión. Mostrando la última versión guardada, de las 14:32.')],
  [L('Carregando', 'Loading', 'Cargando'), L('Aguarde…', 'Please wait…', 'Espere…'), L('Carregando os projetos… Costuma levar poucos segundos.', 'Loading the projects… It usually takes a few seconds.', 'Cargando los proyectos… Suele tardar pocos segundos.')],
];

/* ───────── Peças ───────── */

function actionButton([kind, glyph, label], data = '') {
  if (kind === 'inline') return `<button type="button" class="ds-inline-action"${data}>${label}${icon(glyph, { size: 14 })}</button>`;
  return `<button type="button" class="ds-btn ds-btn--${kind}"${data}>${icon(glyph, { size: 18 })}${label}</button>`;
}

/** Monta um .ds-empty. actions: [[kind, icon, label, dataAttr?]] */
function empty({ icon: glyph, title, desc, actions = [], meta, tone, role, place = '', plain, extra = '', titleId }) {
  const cls = ['ds-empty', place, tone && `ds-empty--${tone}`, plain && 'ds-empty--plain', extra].filter(Boolean).join(' ');
  const acts = actions.length ? `<div class="ds-empty__actions">${actions.map((a) => actionButton(a, a[3] ? ` ${a[3]}` : '')).join('')}</div>` : '';
  return `<div class="${cls}"${role ? ` role="${role}"` : ''}>
    <span class="ds-empty__icon">${icon(glyph, { size: place ? 20 : 24 })}</span>
    <p class="ds-empty__title"${titleId ? ` id="${titleId}" tabindex="-1"` : ''}>${title}</p>
    ${desc ? `<p class="ds-empty__description">${desc}</p>` : ''}
    ${acts}
    ${meta ? `<p class="ds-empty__meta">${meta}</p>` : ''}
  </div>`;
}

/** Código HTML legível de um estado. */
function emptyCode(s, placeClass, onlyPrimary) {
  const cls = ['ds-empty', placeClass, s.tone && `ds-empty--${s.tone}`].filter(Boolean).join(' ');
  const acts = (onlyPrimary ? s.actions.slice(0, 1) : s.actions).map(([kind, glyph, label]) =>
    kind === 'inline' ? `    <button type="button" class="ds-inline-action">${label}<ds-icon name="${glyph}" size="14"></ds-icon></button>` : `    <button type="button" class="ds-btn ds-btn--${kind}"><ds-icon name="${glyph}"></ds-icon>${label}</button>`,
  );
  return [
    `<div class="${cls}"${s.role ? ` role="${s.role}"` : ''}>`,
    `  <span class="ds-empty__icon"><ds-icon name="${s.icon}"></ds-icon></span>`,
    `  <p class="ds-empty__title">${s.title}</p>`,
    s.desc ? `  <p class="ds-empty__description">${s.desc}</p>` : null,
    acts.length ? `  <div class="ds-empty__actions">\n${acts.join('\n')}\n  </div>` : null,
    s.meta ? `  <p class="ds-empty__meta">${s.meta}</p>` : null,
    `</div>`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Coloca o estado no lugar onde ele aparece: página, painel ou linha de lista. */
function inPlace(place, html) {
  if (place === 'painel') {
    return `<div class="pe-ctx pe-ctx--panel"><div class="pe-ctx__head"><span class="pe-ctx__title">${L('Projetos', 'Projects', 'Proyectos')}</span><span class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted">${icon('more-horizontal', { size: 16 })}</span></div>${html}</div>`;
  }
  if (place === 'lista') {
    return `<div class="pe-ctx pe-ctx--list">
      <div class="pe-ctx__row pe-ctx__row--head"><span>${L('Nome', 'Name', 'Nombre')}</span><span>${L('Atualizado', 'Updated', 'Actualizado')}</span></div>
      ${html}
    </div>`;
  }
  return `<div class="pe-ctx pe-ctx--page">${html}</div>`;
}

/** Palco com tema próprio, para ver o estado em cada tema. */
const stage = (id, inner, label, th = siteTheme()) => `<div class="pe-stage" data-pe-stage data-theme="${th}">
    ${themeSwitch('pe-theme', th, { label: `${L('Tema do exemplo', 'Example theme', 'Tema del ejemplo')}: ${label}`, className: 'pe-stage__theme' })}
    <div class="pe-stage__body" data-demo="${id}">${inner}</div>
  </div>`;

/** Mini app onde o estado acontece. */
const app = (title, tools, body, { id, sub } = {}) => `<section class="pe-app"${id ? ` aria-labelledby="${id}-title"` : ''}>
    <header class="pe-app__head">
      <div><p class="pe-app__title"${id ? ` id="${id}-title"` : ''}>${title}</p>${sub ? `<p class="pe-app__sub">${sub}</p>` : ''}</div>
      <div class="pe-app__tools">${tools}</div>
    </header>
    <div class="pe-app__body" data-body>${body}</div>
  </section>`;

function section(id, title, desc, body) {
  return `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        <p class="doc-section__desc">${desc}</p>
      </div>
    </header>
    ${body}
  </section>`;
}

const tips = (items) => `<ul class="pe-tips" role="list">${items.map(([glyph, text]) => `<li class="pe-tips__item pe-tips__item--${glyph === 'x-circle' ? 'dont' : 'do'}">${icon(glyph, { size: 16, label: glyph === 'x-circle' ? L('Evite', 'Avoid', 'Evita') : L('Faça', 'Do', 'Haz') })}<span>${text}</span></li>`).join('')}</ul>`;

/* ───────── Demos: corpo de cada estado ───────── */

const projectRow = (name, meta, example) => `<li class="pe-row"><span class="pe-row__icon">${icon('folder', { size: 18 })}</span><span class="pe-row__text"><a href="#/padroes/estados-vazios" class="pe-row__name" data-noop>${name}</a><span class="pe-row__meta">${meta}</span></span>${example ? `<span class="ds-badge ds-badge--sm">${L('exemplo', 'example', 'ejemplo')}</span>` : ''}</li>`;
const loadingPayments = () => L('Carregando os pagamentos…', 'Loading the payments…', 'Cargando los pagos…');

const views = {
  primeiroEmpty: () => empty({ ...SITUATIONS().primeiro, plain: true, actions: [['primary', 'plus', L('Criar projeto', 'Create project', 'Crear proyecto'), 'data-act="create"'], ['inline', 'arrow-right', L('Ver um exemplo', 'See an example', 'Ver un ejemplo'), 'data-act="sample"']] }),
  primeiroList: (sample) => `<ul class="pe-list" role="list" aria-label="${L('Projetos', 'Projects', 'Proyectos')}">${
    sample
      ? [
          [L('Lançamento do app', 'App launch', 'Lanzamiento de la app'), L('Exemplo · 12 tarefas', 'Example · 12 tasks', 'Ejemplo · 12 tareas')],
          [L('Pesquisa com clientes', 'Customer research', 'Investigación con clientes'), L('Exemplo · 5 tarefas', 'Example · 5 tasks', 'Ejemplo · 5 tareas')],
          [L('Site novo', 'New website', 'Sitio nuevo'), L('Exemplo · 8 tarefas', 'Example · 8 tasks', 'Ejemplo · 8 tareas')],
        ]
          .map(([n, m]) => projectRow(n, m, true))
          .join('')
      : projectRow(L('Projeto sem título', 'Untitled project', 'Proyecto sin título'), L('Criado agora · só você', 'Created just now · only you', 'Creado ahora · solo tú'))
  }</ul>
    <div class="pe-app__foot"><button type="button" class="ds-inline-action" data-act="reset">${sample ? L('Remover exemplos', 'Remove examples', 'Quitar ejemplos') : L('Voltar ao vazio', 'Back to empty', 'Volver al vacío')}${icon('refresh', { size: 14 })}</button></div>`,
  erroEmpty: (alert) => empty({ ...SITUATIONS().erro, plain: true, role: alert ? 'alert' : undefined, actions: [['secondary', 'refresh', L('Tentar de novo', 'Try again', 'Intentar de nuevo'), 'data-act="retry"'], ['inline', 'external-link', L('Ver status do serviço', 'See service status', 'Ver estado del servicio'), 'data-act="status"']] }),
  loading: (title = L('Carregando…', 'Loading…', 'Cargando…'), desc = '') => empty({ icon: 'loader', tone: 'loading', title, desc, plain: true, place: 'ds-empty--compact', role: 'status' }),
  payments: () => `<ul class="pe-list" role="list" aria-label="${L('Pagamentos', 'Payments', 'Pagos')}" tabindex="-1" data-focus>${PAYMENTS().map(
    ([name, method, value]) => `<li class="pe-row"><span class="pe-row__icon">${icon('check-circle', { size: 18 })}</span><span class="pe-row__text"><span class="pe-row__name">${name}</span><span class="pe-row__meta">${method}</span></span><span class="pe-row__value">${value}</span></li>`,
  ).join('')}</ul>
    <div class="pe-app__foot"><button type="button" class="ds-inline-action" data-act="fail">${L('Simular erro de novo', 'Simulate the error again', 'Simular el error de nuevo')}${icon('alert-triangle', { size: 14 })}</button></div>`,
  permissao: () => empty({ ...SITUATIONS().permissao, plain: true, actions: [['primary', 'mail', L('Pedir acesso', 'Request access', 'Pedir acceso'), 'data-act="request"'], ['inline', 'arrow-left', L('Voltar para relatórios', 'Back to reports', 'Volver a informes'), 'data-act="back"']] }),
  permissaoSent: () =>
    empty({
      icon: 'check-circle',
      title: L('Pedido enviado', 'Request sent', 'Solicitud enviada'),
      desc: L('Avisamos Ana Souza, do time de Finanças. Você recebe um e-mail quando o acesso for liberado.', 'We let Ana Souza, from the Finance team, know. You’ll get an email when access is granted.', 'Avisamos a Ana Souza, del equipo de Finanzas. Recibirás un correo cuando se libere el acceso.'),
      plain: true,
      role: 'status',
      titleId: 'pe-perm-sent',
      extra: 'pe-empty--success',
      actions: [['secondary', 'x', L('Cancelar pedido', 'Cancel request', 'Cancelar solicitud'), 'data-act="cancel"']],
    }),
};

function docsList(items) {
  return `<ul class="pe-list" role="list" aria-label="${L('Documentos', 'Documents', 'Documentos')}">${items
    .map(([name, author, kind]) => `<li class="pe-row"><span class="pe-row__icon">${icon(kind === 'pdf' ? 'file-text' : 'table', { size: 18 })}</span><span class="pe-row__text"><span class="pe-row__name">${escapeHtml(name)}</span><span class="pe-row__meta">${escapeHtml(author)} · ${kindName(kind)}</span></span></li>`)
    .join('')}</ul>`;
}

/* ───────── Página ───────── */

const NAV = () => [
  ['pe-playground', 'Playground'],
  ['pe-primeiro-uso', L('Primeiro uso', 'First use', 'Primer uso')],
  ['pe-sem-resultados', L('Sem resultados', 'No results', 'Sin resultados')],
  ['pe-erro', L('Erro', 'Error', 'Error')],
  ['pe-permissao', L('Sem permissão', 'No permission', 'Sin permiso')],
  ['pe-offline', 'Offline'],
  ['pe-carregando', L('Carregando', 'Loading', 'Cargando')],
  ['pe-anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
  ['pe-escrita', L('Escrita', 'Writing', 'Escritura')],
  ['pe-onde', L('Onde aparece', 'Where it appears', 'Dónde aparece')],
  ['pe-acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
  ['pe-codigo', L('Código', 'Code', 'Código')],
  ['pe-uso', L('Uso', 'Usage', 'Uso')],
];

export default function renderEstadosVazios(page) {
  const s = SITUATIONS();
  const monthYear = dateFormat({ month: 'long', year: 'numeric' }).format(new Date(2026, 9, 15));
  return `
  <div class="page doc pe-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Quando não há nada para mostrar — ainda, por causa de um filtro ou por um erro — a tela diz o que aconteceu e oferece o próximo passo. Nunca uma área em branco.', 'When there’s nothing to show — yet, because of a filter, or because of an error — the screen says what happened and offers the next step. Never a blank area.', 'Cuando no hay nada que mostrar — todavía, por un filtro o por un error — la pantalla dice qué pasó y ofrece el siguiente paso. Nunca un área en blanco.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('situações', 'situations', 'situaciones')}</dt><dd class="doc-stat__value">${Object.keys(s).length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('lugares', 'places', 'lugares')}</dt><dd class="doc-stat__value">${PLACES().length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('partes', 'parts', 'partes')}</dt><dd class="doc-stat__value">4</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('próximo passo', 'next step', 'siguiente paso')}</dt><dd class="doc-stat__value">${L('sempre', 'always', 'siempre')}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section('pe-playground', 'Playground', L('Escolha a situação e o lugar. O texto muda com a situação; o tamanho, com o lugar.', 'Pick the situation and the place. The text changes with the situation; the size, with the place.', 'Elige la situación y el lugar. El texto cambia con la situación; el tamaño, con el lugar.'), playgroundMarkup('estados-vazios'))}

    ${section(
      'pe-primeiro-uso',
      L('Primeiro uso', 'First use', 'Primer uso'),
      L('A primeira vez é a melhor hora para ensinar: diga o que vai aparecer aqui e dê o botão que faz aparecer. Clique em “Criar projeto”.', 'The first time is the best moment to teach: say what will show up here and give the button that makes it appear. Click “Create project”.', 'La primera vez es el mejor momento para enseñar: di qué va a aparecer aquí y da el botón que lo hace aparecer. Haz clic en “Crear proyecto”.'),
      `${stage('primeiro', app(L('Projetos', 'Projects', 'Proyectos'), '', views.primeiroEmpty(), { id: 'pe-demo-primeiro' }), L('primeiro uso', 'first use', 'primer uso'))}
      ${tips([
        ['check-circle', L('Ação principal com verbo: “Criar projeto”. Uma alternativa discreta ao lado, se houver.', 'A primary action with a verb: “Create project”. A quiet alternative beside it, if there is one.', 'Acción principal con verbo: “Crear proyecto”. Una alternativa discreta al lado, si la hay.')],
        ['check-circle', L('Depois de criar, o foco vai para o item novo — a pessoa vê o resultado na hora.', 'After creating, focus moves to the new item — people see the result right away.', 'Después de crear, el foco va al elemento nuevo — la persona ve el resultado al instante.')],
        ['x-circle', L('Nada de tela vazia com um “+” solto no canto. O vazio é o próprio convite.', 'No empty screen with a lone “+” in the corner. The empty state is the invitation itself.', 'Nada de pantalla vacía con un “+” suelto en la esquina. El vacío es la propia invitación.')],
      ])}`,
    )}

    ${section(
      'pe-sem-resultados',
      L('Sem resultados', 'No results', 'Sin resultados'),
      L('O vazio foi causado pela pessoa — por uma busca ou um filtro. Repita o que ela pediu, sugira o que tentar e deixe os controles à vista.', 'The emptiness was caused by the person — by a search or a filter. Repeat what they asked for, suggest what to try, and keep the controls in view.', 'El vacío lo causó la persona — con una búsqueda o un filtro. Repite lo que pidió, sugiere qué probar y deja los controles a la vista.'),
      `${stage(
        'busca',
        app(
          L('Documentos', 'Documents', 'Documentos'),
          '',
          `<div class="pe-search">
            <div class="ds-field ds-field--sm pe-search__field">${icon('search', { size: 16 })}<input class="ds-field__input" type="search" value="${searchExample()}" aria-label="${L('Buscar documentos', 'Search documents', 'Buscar documentos')}" data-search spellcheck="false" autocomplete="off"></div>
            <div class="pe-search__filters" role="group" aria-label="${L('Tipo', 'Type', 'Tipo')}">
              <button type="button" class="ds-chip ds-chip--sm" data-kind="all" aria-pressed="false">${L('Todos', 'All', 'Todos')}</button>
              <button type="button" class="ds-chip ds-chip--sm" data-kind="pdf" aria-pressed="true">PDF</button>
              <button type="button" class="ds-chip ds-chip--sm" data-kind="planilha" aria-pressed="false">${kindName('planilha')}</button>
            </div>
          </div>
          <p class="pe-search__count" role="status" data-count></p>
          <div data-results></div>`,
          { id: 'pe-demo-busca' },
        ),
        L('sem resultados', 'no results', 'sin resultados'),
      )}
      ${tips([
        ['check-circle', L('O título repete a busca entre aspas: a pessoa confere se digitou certo.', 'The title repeats the search in quotes: people can check they typed it right.', 'El título repite la búsqueda entre comillas: la persona comprueba si escribió bien.')],
        ['check-circle', L('“Limpar busca” devolve a lista e o foco ao campo. A contagem é anunciada sem roubar o foco.', '“Clear search” brings back the list and returns focus to the field. The count is announced without stealing focus.', '“Limpiar búsqueda” devuelve la lista y el foco al campo. El conteo se anuncia sin robar el foco.')],
        ['x-circle', L('Não esconda a busca nem os filtros no estado vazio: são justamente o caminho de volta.', 'Don’t hide search or filters in the empty state: they’re precisely the way back.', 'No escondas la búsqueda ni los filtros en el estado vacío: son justamente el camino de vuelta.')],
      ])}`,
    )}

    ${section(
      'pe-erro',
      L('Erro', 'Error', 'Error'),
      L('Algo falhou do nosso lado. Diga o que não carregou, tranquilize sobre os dados e ofereça tentar de novo. Clique em “Tentar de novo”.', 'Something failed on our side. Say what didn’t load, reassure about the data, and offer to try again. Click “Try again”.', 'Algo falló de nuestro lado. Di qué no se cargó, tranquiliza sobre los datos y ofrece intentar de nuevo. Haz clic en “Intentar de nuevo”.'),
      `${stage('erro', app(L('Pagamentos', 'Payments', 'Pagos'), '', views.erroEmpty(false), { id: 'pe-demo-erro', sub: monthYear.charAt(0).toLocaleUpperCase(locale()) + monthYear.slice(1) }), L('erro', 'error', 'error'))}
      ${tips([
        ['check-circle', L('Tom de perigo no ícone, não na tela toda. O texto diz o mesmo que a cor.', 'The danger tone on the icon, not the whole screen. The text says the same as the color.', 'Tono de peligro en el ícono, no en toda la pantalla. El texto dice lo mismo que el color.')],
        ['check-circle', L(`Código e hora em ${ic('.ds-empty__meta')}: o suporte agradece, e não atrapalha quem não precisa.`, `Code and time in ${ic('.ds-empty__meta')}: support will thank you, and it doesn’t bother those who don’t need it.`, `Código y hora en ${ic('.ds-empty__meta')}: el soporte lo agradece, y no estorba a quien no lo necesita.`)],
        ['x-circle', L('Sem culpa (“Você fez algo errado”) e sem exclamação. Erro do sistema é do sistema.', 'No blame (“You did something wrong”) and no exclamation marks. A system error belongs to the system.', 'Sin culpa (“Hiciste algo mal”) y sin exclamación. El error del sistema es del sistema.')],
      ])}`,
    )}

    ${section(
      'pe-permissao',
      L('Sem permissão', 'No permission', 'Sin permiso'),
      L('O conteúdo existe, mas não para esta pessoa. Diga de quem é e como pedir acesso — sem expor o que ela não pode ver.', 'The content exists, but not for this person. Say whose it is and how to request access — without exposing what they can’t see.', 'El contenido existe, pero no para esta persona. Di de quién es y cómo pedir acceso — sin exponer lo que no puede ver.'),
      `${stage('permissao', app(L('Relatório de custos', 'Cost report', 'Informe de costos'), '', views.permissao(), { id: 'pe-demo-permissao', sub: L('Finanças', 'Finance', 'Finanzas') }), L('sem permissão', 'no permission', 'sin permiso'))}
      ${tips([
        ['check-circle', L('Ícone neutro (cadeado), não de erro: ninguém errou.', 'A neutral icon (lock), not an error one: no one made a mistake.', 'Ícono neutro (candado), no de error: nadie se equivocó.')],
        ['check-circle', L('Depois de pedir, confirme no mesmo lugar e diga o que acontece em seguida.', 'After requesting, confirm in the same place and say what happens next.', 'Después de pedir, confirma en el mismo lugar y di qué pasa a continuación.')],
        ['x-circle', L('“Acesso negado (403)” não ajuda ninguém a chegar onde precisa.', '“Access denied (403)” helps no one get where they need to go.', '“Acceso denegado (403)” no ayuda a nadie a llegar a donde necesita.')],
      ])}`,
    )}

    ${section(
      'pe-offline',
      'Offline',
      L('Sem internet, mostre o que já estava salvo com um aviso discreto; sem nada salvo, um estado vazio que se resolve sozinho. Este exemplo também segue a sua conexão de verdade.', 'Without internet, show what was already saved with a quiet notice; with nothing saved, an empty state that resolves on its own. This example also follows your real connection.', 'Sin internet, muestra lo que ya estaba guardado con un aviso discreto; sin nada guardado, un estado vacío que se resuelve solo. Este ejemplo también sigue tu conexión de verdad.'),
      `${stage(
        'offline',
        app(
          L('Tarefas', 'Tasks', 'Tareas'),
          `<label class="ds-switch ds-switch--sm pe-toggle"><input type="checkbox" role="switch" class="ds-switch__input" data-offline><span class="ds-choice__text"><span class="ds-choice__label">${L('Sem conexão', 'Offline', 'Sin conexión')}</span></span></label>
           <label class="ds-switch ds-switch--sm pe-toggle"><input type="checkbox" role="switch" class="ds-switch__input" data-cache checked><span class="ds-choice__text"><span class="ds-choice__label">${L('Versão salva', 'Saved version', 'Versión guardada')}</span></span></label>`,
          '',
          { id: 'pe-demo-offline' },
        ),
        'offline',
      )}
      ${tips([
        ['check-circle', L('Com versão salva: alerta compacto no topo e o conteúdo continua legível.', 'With a saved version: a compact alert on top and the content stays legible.', 'Con versión guardada: alerta compacta arriba y el contenido sigue legible.')],
        ['check-circle', L('Volte sozinho quando a conexão voltar — e avise com um toast curto.', 'Come back on your own when the connection returns — and say so with a short toast.', 'Vuelve solo cuando vuelva la conexión — y avisa con un toast corto.')],
        ['x-circle', L('Não apague o que a pessoa já via só porque a rede caiu.', 'Don’t wipe what people were already seeing just because the network dropped.', 'No borres lo que la persona ya veía solo porque se cayó la red.')],
      ])}`,
    )}

    ${section(
      'pe-carregando',
      L('Carregando', 'Loading', 'Cargando'),
      L('Até 1 segundo, nada — um spinner que pisca atrapalha mais que ajuda. Até 10, spinner com texto. Passou disso, diga que está demorando e ofereça cancelar.', 'Up to 1 second, nothing — a flashing spinner hurts more than it helps. Up to 10, a spinner with text. Beyond that, say it’s taking a while and offer to cancel.', 'Hasta 1 segundo, nada — un spinner que parpadea estorba más que ayuda. Hasta 10, spinner con texto. Si pasa de eso, di que está tardando y ofrece cancelar.'),
      `${stage(
        'carregando',
        app(L('Relatórios', 'Reports', 'Informes'), `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="reload">${icon('refresh', { size: 16 })}${L('Recarregar', 'Reload', 'Recargar')}</button>`, '', { id: 'pe-demo-carregando' }),
        L('carregando', 'loading', 'cargando'),
      )}
      ${tips([
        ['check-circle', L('Texto junto do spinner: “Carregando os relatórios…”. Ícone girando sozinho não diz nada a um leitor de tela.', 'Text next to the spinner: “Loading the reports…”. A spinning icon alone tells a screen reader nothing.', 'Texto junto al spinner: “Cargando los informes…”. Un ícono girando solo no le dice nada a un lector de pantalla.')],
        ['check-circle', L('Recarregar algo que já está na tela? Mantenha o conteúdo esmaecido em vez de trocar por um vazio.', 'Reloading something already on screen? Keep the content dimmed instead of swapping it for an empty state.', '¿Recargar algo que ya está en pantalla? Mantén el contenido atenuado en vez de cambiarlo por un vacío.')],
        ['check-circle', L('Com movimento reduzido, o ícone para e o texto continua.', 'With reduced motion, the icon stops and the text stays.', 'Con movimiento reducido, el ícono se detiene y el texto sigue.')],
      ])}`,
    )}

    ${section(
      'pe-anatomia',
      L('Anatomia', 'Anatomy', 'Anatomía'),
      L('Quatro partes — e só a ação é obrigatória quando existe uma saída. Tudo centrado, numa coluna estreita.', 'Four parts — and only the action is required when there’s a way out. Everything centered, in a narrow column.', 'Cuatro partes — y solo la acción es obligatoria cuando existe una salida. Todo centrado, en una columna estrecha.'),
      `<div class="pe-anatomy" inert>
        <div class="pe-anatomy__figure">
          <div class="ds-empty">
            <span class="ds-empty__icon pe-anatomy__part" data-num="1">${icon('folder', { size: 24 })}</span>
            <p class="ds-empty__title pe-anatomy__part" data-num="2">${s.primeiro.title}</p>
            <p class="ds-empty__description pe-anatomy__part" data-num="3">${s.primeiro.desc}</p>
            <div class="ds-empty__actions pe-anatomy__part" data-num="4"><span class="ds-btn ds-btn--primary">${icon('plus', { size: 18 })}${s.primeiro.actions[0][2]}</span><span class="ds-inline-action">${s.primeiro.actions[1][2]}${icon('arrow-right', { size: 14 })}</span></div>
          </div>
        </div>
        <ol class="pe-anatomy__list" role="list">
          <li><span class="pe-pin" data-num="1"></span><div>${L('<strong>Ícone.</strong> Dá o contexto em um olhar. Um ícone da biblioteca, nunca ilustração ou emoji. Opcional dentro de listas.', '<strong>Icon.</strong> It gives context at a glance. An icon from the library, never an illustration or emoji. Optional inside lists.', '<strong>Ícono.</strong> Da el contexto de un vistazo. Un ícono de la biblioteca, nunca ilustración ni emoji. Opcional dentro de listas.')}</div></li>
          <li><span class="pe-pin" data-num="2"></span><div>${L('<strong>Título.</strong> O que aconteceu, em até seis palavras. Sem ponto final.', '<strong>Title.</strong> What happened, in up to six words. No period.', '<strong>Título.</strong> Qué pasó, en hasta seis palabras. Sin punto final.')}</div></li>
          <li><span class="pe-pin" data-num="3"></span><div>${L('<strong>Descrição.</strong> Por que está vazio e o que fazer. Uma ou duas frases.', '<strong>Description.</strong> Why it’s empty and what to do. One or two sentences.', '<strong>Descripción.</strong> Por qué está vacío y qué hacer. Una o dos frases.')}</div></li>
          <li><span class="pe-pin" data-num="4"></span><div>${L('<strong>Ações.</strong> Uma principal — o próximo passo — e, se fizer sentido, uma alternativa em ação inline.', '<strong>Actions.</strong> One primary — the next step — and, if it makes sense, an alternative as an inline action.', '<strong>Acciones.</strong> Una principal — el siguiente paso — y, si tiene sentido, una alternativa en acción en línea.')}</div></li>
        </ol>
      </div>`,
    )}

    ${section(
      'pe-escrita',
      L('Escrita', 'Writing', 'Escritura'),
      L('Diga o que aconteceu, por que (quando ajuda) e o que fazer. Tom calmo, sem culpa, sem exclamação — e sempre com uma saída.', 'Say what happened, why (when it helps), and what to do. A calm tone, no blame, no exclamation marks — and always a way out.', 'Di qué pasó, por qué (cuando ayuda) y qué hacer. Tono tranquilo, sin culpa, sin exclamación — y siempre con una salida.'),
      `<div class="doc-table pe-writing" style="--doc-table-cols: minmax(110px, 0.55fr) minmax(0, 0.8fr) minmax(0, 1.7fr)">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Situação', 'Situation', 'Situación')}</span><span>${L('Evite', 'Avoid', 'Evita')}</span><span>${L('Prefira', 'Prefer', 'Prefiere')}</span></div>
        ${WRITING().map(
          ([situation, bad, good]) => `<div class="doc-table__row">
            <span class="pe-writing__situation">${situation}</span>
            <span class="pe-writing__bad">${icon('x-circle', { size: 16 })}<span>${escapeHtml(bad)}</span></span>
            <span class="pe-writing__good">${icon('check-circle', { size: 16 })}<span>${escapeHtml(good)}</span></span>
          </div>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'pe-onde',
      L('Onde aparece', 'Where it appears', 'Dónde aparece'),
      L('O mesmo estado muda de tamanho conforme o lugar. Página inteira tem espaço; dentro de um painel, encolhe; numa lista, vira uma linha.', 'The same state changes size depending on the place. A full page has room; inside a panel, it shrinks; in a list, it becomes a row.', 'El mismo estado cambia de tamaño según el lugar. La página entera tiene espacio; dentro de un panel, se encoge; en una lista, se vuelve una fila.'),
      `<div class="pe-places" inert>
        <article class="cd-example">
          <div class="cd-example__preview pe-place__preview">${inPlace('pagina', empty({ ...s.primeiro, actions: s.primeiro.actions.slice(0, 1) }))}</div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Página inteira', 'Full page', 'Página entera')}<code>ds-empty</code></p><p class="cd-example__text">${L('A tela toda está vazia. Ícone grande, título, descrição e ação.', 'The whole screen is empty. Large icon, title, description, and action.', 'Toda la pantalla está vacía. Ícono grande, título, descripción y acción.')}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview pe-place__preview">${inPlace('painel', empty({ ...s.busca, place: 'ds-empty--compact', actions: s.busca.actions.slice(0, 1) }))}</div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Dentro de painel', 'Inside a panel', 'Dentro de panel')}<code>ds-empty--compact</code></p><p class="cd-example__text">${L('Um bloco da tela está vazio; o resto continua funcionando.', 'One block of the screen is empty; the rest keeps working.', 'Un bloque de la pantalla está vacío; el resto sigue funcionando.')}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview pe-place__preview">${inPlace('lista', empty({ ...s.erro, place: 'ds-empty--inline', actions: s.erro.actions.slice(0, 1), desc: L('Tente de novo em alguns segundos.', 'Try again in a few seconds.', 'Inténtalo de nuevo en unos segundos.') }))}</div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Linha de lista ou tabela', 'List or table row', 'Fila de lista o tabla')}<code>ds-empty--inline</code></p><p class="cd-example__text">${L(`Ícone à esquerda, ação à direita. Numa tabela, vai numa célula com ${ic('colspan')}.`, `Icon on the left, action on the right. In a table, it goes in a cell with ${ic('colspan')}.`, `Ícono a la izquierda, acción a la derecha. En una tabla, va en una celda con ${ic('colspan')}.`)}</p></div>
        </article>
      </div>`,
    )}

    ${section(
      'pe-acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('Estado vazio também é conteúdo: precisa ser anunciado, ter foco previsível e nunca depender só de ícone ou cor.', 'An empty state is content too: it needs to be announced, have predictable focus, and never rely on icon or color alone.', 'El estado vacío también es contenido: necesita anunciarse, tener foco predecible y nunca depender solo de ícono o color.'),
      a11yList([
        [L('Anuncie sem roubar o foco', 'Announce without stealing focus', 'Anuncia sin robar el foco'), L(`Resultado vazio e contagem em ${ic('role="status"')}: o leitor de tela fala “Nada encontrado” e a pessoa continua no campo de busca.`, `Empty result and count in ${ic('role="status"')}: the screen reader says “Nothing found” and the person stays in the search field.`, `Resultado vacío y conteo en ${ic('role="status"')}: el lector de pantalla dice “Nada encontrado” y la persona sigue en el campo de búsqueda.`)],
        [L('Alerta só depois de uma ação', 'Alerts only after an action', 'Alerta solo después de una acción'), L(`Erro que aparece ao tentar de novo usa ${ic('role="alert"')}. Na carga da página, nada de alerta — o conteúdo já está ali.`, `An error that appears on retry uses ${ic('role="alert"')}. On page load, no alert — the content is already there.`, `El error que aparece al intentar de nuevo usa ${ic('role="alert"')}. En la carga de la página, nada de alerta — el contenido ya está ahí.`)],
        [L('Foco que segue a ação', 'Focus that follows the action', 'Foco que sigue a la acción'), L('“Limpar busca” devolve o foco ao campo; “Tentar de novo” com sucesso leva ao conteúdo; “Criar” leva ao item novo.', '“Clear search” returns focus to the field; a successful “Try again” goes to the content; “Create” goes to the new item.', '“Limpiar búsqueda” devuelve el foco al campo; “Intentar de nuevo” con éxito lleva al contenido; “Crear” lleva al elemento nuevo.'), ['Tab', 'Enter']],
        [L('Carregando com texto', 'Loading with text', 'Cargando con texto'), L(`O contêiner ganha ${ic('aria-busy="true"')} e o spinner vem com uma frase. Ícone girando sozinho não diz nada.`, `The container gets ${ic('aria-busy="true"')} and the spinner comes with a sentence. A spinning icon alone says nothing.`, `El contenedor recibe ${ic('aria-busy="true"')} y el spinner viene con una frase. Un ícono girando solo no dice nada.`)],
        [L('Ícones decorativos', 'Decorative icons', 'Íconos decorativos'), L(`O ícone do estado é ${ic('aria-hidden')}; o título e a descrição carregam o sentido.`, `The state icon is ${ic('aria-hidden')}; the title and description carry the meaning.`, `El ícono del estado es ${ic('aria-hidden')}; el título y la descripción llevan el sentido.`)],
        [L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido'), L(`Com ${ic('prefers-reduced-motion')}, o spinner para. O texto continua dizendo o que está acontecendo.`, `With ${ic('prefers-reduced-motion')}, the spinner stops. The text keeps saying what’s happening.`, `Con ${ic('prefers-reduced-motion')}, el spinner se detiene. El texto sigue diciendo qué está pasando.`)],
        [L('Controles à vista', 'Controls in view', 'Controles a la vista'), L('Busca, filtros e navegação continuam na tela no estado vazio — são o caminho de volta.', 'Search, filters, and navigation stay on screen in the empty state — they’re the way back.', 'Búsqueda, filtros y navegación siguen en pantalla en el estado vacío — son el camino de vuelta.')],
      ]),
    )}

    ${section(
      'pe-codigo',
      L('Código', 'Code', 'Código'),
      L('Uma classe base e modificadores para lugar e tom. As ações são os botões e ações inline de sempre.', 'One base class and modifiers for place and tone. The actions are the usual buttons and inline actions.', 'Una clase base y modificadores para lugar y tono. Las acciones son los botones y acciones en línea de siempre.'),
      `${codeBlock(emptyCode(s.erro, '', false))}
      <div class="doc-table pe-classes" style="--doc-table-cols: minmax(170px, 0.7fr) minmax(0, 1.6fr)">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Classe', 'Class', 'Clase')}</span><span>${L('Quando usar', 'When to use', 'Cuándo usar')}</span></div>
        ${[
          ['ds-empty', L('Página inteira ou área principal vazia.', 'Full page or empty main area.', 'Página entera o área principal vacía.')],
          ['ds-empty--compact', L('Dentro de painel, cartão ou coluna.', 'Inside a panel, card, or column.', 'Dentro de panel, tarjeta o columna.')],
          ['ds-empty--inline', L('Uma linha de lista ou tabela; ícone à esquerda, ação à direita.', 'A list or table row; icon on the left, action on the right.', 'Una fila de lista o tabla; ícono a la izquierda, acción a la derecha.')],
          ['ds-empty--plain', L('Sem contorno nem fundo, quando já está dentro de uma superfície.', 'No outline or background, when it’s already inside a surface.', 'Sin contorno ni fondo, cuando ya está dentro de una superficie.')],
          ['ds-empty--danger', L('Erro: ícone no tom de perigo.', 'Error: icon in the danger tone.', 'Error: ícono en el tono de peligro.')],
          ['ds-empty--warning', L('Offline e situações de atenção.', 'Offline and warning situations.', 'Offline y situaciones de atención.')],
          ['ds-empty--muted', L('Neutro, como sem permissão.', 'Neutral, like no permission.', 'Neutro, como sin permiso.')],
          ['ds-empty--loading', L('Carregando: o ícone gira (para com movimento reduzido).', 'Loading: the icon spins (stops with reduced motion).', 'Cargando: el ícono gira (se detiene con movimiento reducido).')],
          ['ds-empty__meta', L('Código do erro, hora, versão — linha pequena no fim.', 'Error code, time, version — a small line at the end.', 'Código del error, hora, versión — línea pequeña al final.')],
        ]
          .map(([cls, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${cls}</code><span class="pe-classes__text">${text}</span></div>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pe-uso',
      L('Uso', 'Usage', 'Uso'),
      L('Seis regras para o vazio não virar beco sem saída.', 'Six rules so the empty state doesn’t become a dead end.', 'Seis reglas para que el vacío no se vuelva un callejón sin salida.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: sempre um próximo passo', 'Do: always a next step', 'Haz: siempre un siguiente paso')}</p><p class="usage-card__text">${L('Criar, limpar filtros, tentar de novo, pedir acesso. Se não há o que fazer, diga quando vai mudar.', 'Create, clear filters, try again, request access. If there’s nothing to do, say when it will change.', 'Crear, limpiar filtros, intentar de nuevo, pedir acceso. Si no hay nada que hacer, di cuándo va a cambiar.')}</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: “Nenhum dado”', 'Avoid: “No data”', 'Evita: “Sin datos”')}</p><p class="usage-card__text">${L('Não explica nada. A pessoa não sabe se é erro, filtro ou se ainda não começou.', 'It explains nothing. People don’t know whether it’s an error, a filter, or that they haven’t started yet.', 'No explica nada. La persona no sabe si es error, filtro o si todavía no empezó.')}</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}${L('Diferencie as causas', 'Tell the causes apart', 'Diferencia las causas')}</p><p class="usage-card__text">${L('Primeiro uso, sem resultados e erro pedem textos e ações diferentes — mesmo com o mesmo layout.', 'First use, no results, and errors call for different text and actions — even with the same layout.', 'Primer uso, sin resultados y error piden textos y acciones distintos — aun con el mismo layout.')}</p></article>
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: ícone da biblioteca', 'Do: a library icon', 'Haz: ícono de la biblioteca')}</p><p class="usage-card__text">${L('Um ícone dá o contexto e combina com o resto. Ilustração grande e emoji competem com a mensagem.', 'An icon gives context and matches the rest. Large illustrations and emoji compete with the message.', 'Un ícono da el contexto y combina con el resto. Las ilustraciones grandes y los emoji compiten con el mensaje.')}</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: trocar conteúdo por spinner', 'Avoid: swapping content for a spinner', 'Evita: cambiar contenido por spinner')}</p><p class="usage-card__text">${L('Ao recarregar, mantenha o que já estava na tela esmaecido. Piscar para vazio parece que tudo sumiu.', 'When reloading, keep what was already on screen dimmed. Flashing to empty makes it look like everything vanished.', 'Al recargar, mantén lo que ya estaba en pantalla atenuado. Parpadear a vacío parece que todo desapareció.')}</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}${L('Uma ação principal', 'One primary action', 'Una acción principal')}</p><p class="usage-card__text">${L('Dois botões primários no vazio dividem a atenção. A alternativa vai em ação inline.', 'Two primary buttons in an empty state split attention. The alternative goes as an inline action.', 'Dos botones primarios en el vacío dividen la atención. La alternativa va en acción en línea.')}</p></article>
      </div>`,
    )}
  </div>`;
}

/* ───────── Comportamento ───────── */

export function mount(root) {
  const cleanups = [];
  const timers = new Set();
  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };
  const cancel = (t) => {
    clearTimeout(t);
    timers.delete(t);
  };
  const demo = (id) => root.querySelector(`[data-demo="${id}"]`);
  const bodyOf = (id) => demo(id).querySelector('[data-body]');
  const focusIn = (el) => el?.focus({ preventScroll: true });
  const backOnline = () => L('Conexão de volta · lista atualizada', 'Back online · list updated', 'Conexión de vuelta · lista actualizada');
  const tryNow = () => L('Tentar agora', 'Try now', 'Intentar ahora');

  /* Playground */
  const places = PLACES();
  cleanups.push(
    mountPlayground(root, {
      id: 'estados-vazios',
      controls: [
        { id: 'situation', label: L('Situação', 'Situation', 'Situación'), value: 'primeiro', options: Object.entries(SITUATIONS()).map(([value, v]) => ({ value, label: v.label })) },
        { id: 'place', label: L('Onde', 'Where', 'Dónde'), value: 'pagina', options: places.map(([value, label]) => ({ value, label })) },
        { id: 'actions', label: L('Ações', 'Actions', 'Acciones'), value: 'all', options: [{ value: 'all', label: L('Principal e alternativa', 'Primary and alternative', 'Principal y alternativa') }, { value: 'one', label: L('Só a principal', 'Primary only', 'Solo la principal') }] },
      ],
      render(state) {
        const sit = SITUATIONS()[state.situation];
        const place = places.find(([id]) => id === state.place)[2];
        const actions = state.actions === 'one' ? sit.actions.slice(0, 1) : sit.actions;
        return `<div class="pe-play" inert>${inPlace(state.place, empty({ ...sit, place, actions, role: undefined }))}</div>`;
      },
      code(state) {
        const sit = SITUATIONS()[state.situation];
        const place = places.find(([id]) => id === state.place)[2];
        return emptyCode(sit, place, state.actions === 'one');
      },
    }),
  );

  /* Temas dos palcos */
  const onTheme = (event) => {
    const btn = event.target.closest('[data-pe-theme]');
    if (!btn) return;
    const st = btn.closest('[data-pe-stage]');
    st.dataset.theme = btn.dataset.peTheme;
    st.querySelectorAll('[data-pe-theme]').forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
  };
  root.addEventListener('click', onTheme);
  cleanups.push(() => root.removeEventListener('click', onTheme));
  cleanups.push(followSiteTheme(root, '[data-pe-stage]', 'pe-theme'));

  /* Primeiro uso */
  const primeiro = bodyOf('primeiro');
  const onPrimeiro = (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (event.target.closest('[data-noop]')) event.preventDefault();
    if (!act) return;
    if (act === 'create' || act === 'sample') {
      primeiro.innerHTML = views.primeiroList(act === 'sample');
      focusIn(primeiro.querySelector('.pe-row__name'));
      if (act === 'create') toast(L('Projeto criado', 'Project created', 'Proyecto creado'), { tone: 'success' });
    } else if (act === 'reset') {
      primeiro.innerHTML = views.primeiroEmpty();
      focusIn(primeiro.querySelector('[data-act="create"]'));
    }
  };
  primeiro.addEventListener('click', onPrimeiro);
  cleanups.push(() => primeiro.removeEventListener('click', onPrimeiro));

  /* Sem resultados: busca e filtro de verdade */
  const busca = demo('busca');
  const input = busca.querySelector('[data-search]');
  const results = busca.querySelector('[data-results]');
  const countEl = busca.querySelector('[data-count]');
  const docs = DOCS();
  let kind = 'pdf';
  const renderBusca = () => {
    const q = normalize(input.value.trim());
    const list = docs.filter(([name, author, k]) => (kind === 'all' || k === kind) && (!q || q.split(/\s+/).every((w) => normalize(`${name} ${author} ${kindName(k)}`).includes(w))));
    busca.querySelectorAll('[data-kind]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.kind === kind)));
    if (list.length) {
      results.innerHTML = docsList(list);
      countEl.textContent = list.length === 1 ? L('1 documento', '1 document', '1 documento') : L(`${list.length} documentos`, `${list.length} documents`, `${list.length} documentos`);
      return;
    }
    const term = input.value.trim();
    const filtered = kind !== 'all';
    countEl.textContent = L('Nenhum documento', 'No documents', 'Ningún documento');
    results.innerHTML = empty({
      icon: 'search-x',
      title: term ? L(`Nada encontrado para “${escapeHtml(term)}”`, `Nothing found for “${escapeHtml(term)}”`, `Nada encontrado para “${escapeHtml(term)}”`) : L('Nenhum documento deste tipo', 'No documents of this type', 'Ningún documento de este tipo'),
      desc: term
        ? filtered
          ? L('Confira a grafia ou tente outra palavra — ou limpe o filtro de tipo.', 'Check the spelling or try another word — or clear the type filter.', 'Revisa la ortografía o prueba otra palabra — o limpia el filtro de tipo.')
          : L('Confira a grafia ou tente outra palavra.', 'Check the spelling or try another word.', 'Revisa la ortografía o prueba otra palabra.')
        : L('Escolha outro tipo ou veja todos.', 'Pick another type or see all.', 'Elige otro tipo o ve todos.'),
      plain: true,
      place: 'ds-empty--compact',
      actions: [term && ['secondary', 'x', L('Limpar busca', 'Clear search', 'Limpiar búsqueda'), 'data-act="clear-search"'], filtered && ['inline', 'filter', L('Limpar filtros', 'Clear filters', 'Limpiar filtros'), 'data-act="clear-filters"']].filter(Boolean),
    });
  };
  const onBuscaClick = (event) => {
    const chip = event.target.closest('[data-kind]');
    if (chip) {
      kind = chip.dataset.kind;
      renderBusca();
      return;
    }
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (act === 'clear-search') {
      input.value = '';
      renderBusca();
      focusIn(input);
    } else if (act === 'clear-filters') {
      kind = 'all';
      renderBusca();
      focusIn(busca.querySelector('[data-kind="all"]'));
    }
  };
  input.addEventListener('input', renderBusca);
  busca.addEventListener('click', onBuscaClick);
  renderBusca();
  cleanups.push(() => {
    input.removeEventListener('input', renderBusca);
    busca.removeEventListener('click', onBuscaClick);
  });

  /* Erro → carregando → sucesso */
  const erro = bodyOf('erro');
  let erroTimer = null;
  const onErro = (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'retry') {
      erro.setAttribute('aria-busy', 'true');
      erro.innerHTML = views.loading(loadingPayments());
      erroTimer = later(() => {
        erro.removeAttribute('aria-busy');
        erro.innerHTML = views.payments();
        focusIn(erro.querySelector('[data-focus]'));
      }, 1200);
    } else if (act === 'fail') {
      erro.innerHTML = views.erroEmpty(true);
      focusIn(erro.querySelector('[data-act="retry"]'));
    } else if (act === 'status') {
      toast(L('Todos os serviços operando · atualizado agora', 'All services operational · updated just now', 'Todos los servicios funcionando · actualizado ahora'), { tone: 'info' });
    }
  };
  erro.addEventListener('click', onErro);
  cleanups.push(() => {
    cancel(erroTimer);
    erro.removeEventListener('click', onErro);
  });

  /* Sem permissão */
  const perm = bodyOf('permissao');
  const onPerm = (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (act === 'request') {
      perm.innerHTML = views.permissaoSent();
      focusIn(perm.querySelector('#pe-perm-sent'));
    } else if (act === 'cancel') {
      perm.innerHTML = views.permissao();
      focusIn(perm.querySelector('[data-act="request"]'));
      toast(L('Pedido cancelado', 'Request canceled', 'Solicitud cancelada'));
    } else if (act === 'back') {
      toast(L('Aqui voltaria para a lista de relatórios', 'This would go back to the report list', 'Aquí volvería a la lista de informes'));
    }
  };
  perm.addEventListener('click', onPerm);
  cleanups.push(() => perm.removeEventListener('click', onPerm));

  /* Offline: simulado ou de verdade */
  const off = demo('offline');
  const offBody = off.querySelector('[data-body]');
  const offSwitch = off.querySelector('[data-offline]');
  const cacheSwitch = off.querySelector('[data-cache]');
  const TASKS = [
    [L('Revisar contrato de parceria', 'Review partnership agreement', 'Revisar contrato de asociación'), L('Hoje', 'Today', 'Hoy')],
    [L('Enviar orçamento para Bruno', 'Send budget to Bruno', 'Enviar presupuesto a Bruno'), L('Amanhã', 'Tomorrow', 'Mañana')],
    [L('Preparar apresentação Q4', 'Prepare Q4 presentation', 'Preparar presentación T4'), L('Sexta', 'Friday', 'Viernes')],
  ];
  const taskList = (stale) => `<ul class="pe-list${stale ? ' pe-list--stale' : ''}" role="list" aria-label="${L('Tarefas', 'Tasks', 'Tareas')}">${TASKS.map(
    ([t, d]) => `<li class="pe-row"><span class="pe-row__icon">${icon('check-square', { size: 18 })}</span><span class="pe-row__text"><span class="pe-row__name">${t}</span><span class="pe-row__meta">${d}</span></span></li>`,
  ).join('')}</ul>`;
  let offTimer = null;
  const renderOff = () => {
    const offline = offSwitch.checked;
    cacheSwitch.disabled = !offline;
    cacheSwitch.closest('.ds-switch').toggleAttribute('data-disabled', !offline);
    if (!offline) {
      offBody.innerHTML = taskList(false);
      return;
    }
    if (cacheSwitch.checked) {
      offBody.innerHTML = `<div class="ds-alert ds-alert--warning ds-alert--compact pe-offline-alert" role="status">
          <span class="ds-alert__icon">${icon('wifi-off', { size: 18 })}</span>
          <div class="ds-alert__body"><p class="ds-alert__title">${L('Sem conexão', 'Offline', 'Sin conexión')}</p><p class="ds-alert__text">${L('Mostrando a versão salva, das 14:32.', 'Showing the saved version, from 14:32.', 'Mostrando la versión guardada, de las 14:32.')}</p></div>
          <div class="ds-alert__actions"><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-act="retry-net">${icon('refresh', { size: 16 })}${tryNow()}</button></div>
        </div>${taskList(true)}`;
    } else {
      offBody.innerHTML = empty({ ...SITUATIONS().offline, plain: true, place: 'ds-empty--compact', role: 'status', actions: [['secondary', 'refresh', tryNow(), 'data-act="retry-net"']] });
    }
  };
  const onOffChange = () => renderOff();
  const onOffClick = (event) => {
    if (!event.target.closest('[data-act="retry-net"]')) return;
    if (navigator.onLine && offSwitch.dataset.real !== 'true') {
      // no exemplo, "tentar agora" encontra a internet de volta
      const btn = event.target.closest('[data-act]');
      btn.innerHTML = `${icon('loader', { size: 16, className: 'pe-spin' })}${L('Tentando…', 'Trying…', 'Intentando…')}`;
      btn.setAttribute('aria-disabled', 'true');
      offTimer = later(() => {
        offSwitch.checked = false;
        renderOff();
        toast(backOnline(), { tone: 'success' });
      }, 900);
    } else {
      toast(L('Ainda sem conexão. Tentamos de novo sozinhos.', 'Still offline. We’ll try again on our own.', 'Todavía sin conexión. Lo intentamos de nuevo solos.'), { tone: 'warning' });
    }
  };
  const onNet = () => {
    offSwitch.checked = !navigator.onLine;
    offSwitch.dataset.real = String(!navigator.onLine);
    renderOff();
    if (navigator.onLine) toast(backOnline(), { tone: 'success' });
  };
  offSwitch.checked = !navigator.onLine;
  offSwitch.addEventListener('change', onOffChange);
  cacheSwitch.addEventListener('change', onOffChange);
  offBody.addEventListener('click', onOffClick);
  addEventListener('online', onNet);
  addEventListener('offline', onNet);
  renderOff();
  cleanups.push(() => {
    cancel(offTimer);
    offSwitch.removeEventListener('change', onOffChange);
    cacheSwitch.removeEventListener('change', onOffChange);
    offBody.removeEventListener('click', onOffClick);
    removeEventListener('online', onNet);
    removeEventListener('offline', onNet);
  });

  /* Carregando: rápido, lento, cancelado */
  const load = demo('carregando');
  const loadBody = load.querySelector('[data-body]');
  const REPORTS = [
    [L('Vendas de outubro', 'October sales', 'Ventas de octubre'), L('Atualizado há 2 h', 'Updated 2 h ago', 'Actualizado hace 2 h')],
    [L('Custos por time', 'Costs by team', 'Costos por equipo'), L('Atualizado ontem', 'Updated yesterday', 'Actualizado ayer')],
    [L('Churn trimestral', 'Quarterly churn', 'Churn trimestral'), L('Atualizado há 3 dias', 'Updated 3 days ago', 'Actualizado hace 3 días')],
  ];
  const reportList = (stale) => `<ul class="pe-list${stale ? ' pe-list--stale' : ''}" role="list" aria-label="${L('Relatórios', 'Reports', 'Informes')}" tabindex="-1" data-focus>${REPORTS.map(
    ([t, d]) => `<li class="pe-row"><span class="pe-row__icon">${icon('bar-chart', { size: 18 })}</span><span class="pe-row__text"><span class="pe-row__name">${t}</span><span class="pe-row__meta">${d}</span></span></li>`,
  ).join('')}</ul>`;
  let slowTimer = null;
  let doneTimer = null;
  const showReports = (focus) => {
    loadBody.removeAttribute('aria-busy');
    loadBody.innerHTML = reportList(false);
    if (focus) focusIn(loadBody.querySelector('[data-focus]'));
  };
  const onLoadClick = (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (act === 'reload') {
      cancel(slowTimer);
      cancel(doneTimer);
      loadBody.setAttribute('aria-busy', 'true');
      loadBody.innerHTML = views.loading(L('Carregando os relatórios…', 'Loading the reports…', 'Cargando los informes…'), L('Costuma levar poucos segundos.', 'It usually takes a few seconds.', 'Suele tardar pocos segundos.'));
      slowTimer = later(() => {
        loadBody.innerHTML = empty({
          icon: 'loader',
          tone: 'loading',
          title: L('Ainda carregando…', 'Still loading…', 'Todavía cargando…'),
          desc: L('Está demorando mais que o normal. Pode continuar navegando — avisamos quando terminar.', 'It’s taking longer than usual. You can keep browsing — we’ll let you know when it’s done.', 'Está tardando más de lo normal. Puedes seguir navegando — avisamos cuando termine.'),
          plain: true,
          place: 'ds-empty--compact',
          role: 'status',
          actions: [['secondary', 'x', L('Cancelar', 'Cancel', 'Cancelar'), 'data-act="cancel-load"']],
        });
      }, 2600);
      doneTimer = later(() => {
        showReports(true);
        toast(L('Relatórios atualizados', 'Reports updated', 'Informes actualizados'), { tone: 'success' });
      }, 5200);
    } else if (act === 'cancel-load') {
      cancel(slowTimer);
      cancel(doneTimer);
      showReports(false);
      focusIn(load.querySelector('[data-act="reload"]'));
      toast(L('Carregamento cancelado — mostrando a última versão', 'Loading canceled — showing the last version', 'Carga cancelada — mostrando la última versión'));
    }
  };
  load.addEventListener('click', onLoadClick);
  loadBody.innerHTML = reportList(false);
  cleanups.push(() => {
    cancel(slowTimer);
    cancel(doneTimer);
    load.removeEventListener('click', onLoadClick);
  });

  cleanups.push(mountDocNav(root), mountCodeCopy(root));

  return () => {
    timers.forEach(clearTimeout);
    timers.clear();
    cleanups.forEach((fn) => fn?.());
  };
}
