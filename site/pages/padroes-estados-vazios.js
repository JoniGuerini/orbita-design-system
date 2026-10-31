import { icon } from '../../ds/icons/icons.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-estados-vazios.css'];

/* ───────── Dados ───────── */

const normalize = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** As seis situações — o mesmo texto alimenta o playground, o código e as seções. */
const SITUATIONS = {
  primeiro: {
    label: 'Primeiro uso',
    icon: 'folder',
    title: 'Nenhum projeto ainda',
    desc: 'Projetos reúnem tarefas, arquivos e pessoas. Crie o primeiro e convide o time.',
    actions: [['primary', 'plus', 'Criar projeto'], ['inline', 'arrow-right', 'Ver um exemplo']],
  },
  busca: {
    label: 'Sem resultados',
    icon: 'search-x',
    title: 'Nada encontrado para “orçamento 2019”',
    desc: 'Confira a grafia ou tente outra palavra. A busca olha títulos e autores.',
    actions: [['secondary', 'x', 'Limpar busca'], ['inline', 'filter', 'Limpar filtros']],
    role: 'status',
  },
  erro: {
    label: 'Erro',
    tone: 'danger',
    icon: 'alert-circle',
    title: 'Não conseguimos carregar os pagamentos',
    desc: 'Pode ser instabilidade do nosso lado. Seus dados estão seguros — tente de novo em alguns segundos.',
    actions: [['secondary', 'refresh', 'Tentar de novo'], ['inline', 'external-link', 'Ver status do serviço']],
    meta: 'Erro 503 · 14:32',
  },
  permissao: {
    label: 'Sem permissão',
    tone: 'muted',
    icon: 'lock',
    title: 'Você não tem acesso a este relatório',
    desc: 'Ele é do time de Finanças. Peça acesso a quem criou — a pessoa recebe um aviso.',
    actions: [['primary', 'mail', 'Pedir acesso'], ['inline', 'arrow-left', 'Voltar para relatórios']],
  },
  offline: {
    label: 'Offline',
    tone: 'warning',
    icon: 'wifi-off',
    title: 'Sem conexão',
    desc: 'Não há uma versão salva desta lista. Ela carrega sozinha quando a internet voltar.',
    actions: [['secondary', 'refresh', 'Tentar agora']],
  },
  carregando: {
    label: 'Carregando',
    tone: 'loading',
    icon: 'loader',
    title: 'Carregando os projetos…',
    desc: 'Costuma levar poucos segundos.',
    actions: [],
    role: 'status',
  },
};

const PLACES = [
  ['pagina', 'Página inteira', ''],
  ['painel', 'Dentro de painel', 'ds-empty--compact'],
  ['lista', 'Linha de lista', 'ds-empty--inline'],
];

const DOCS = [
  ['Relatório trimestral Q3', 'Ana Souza', 'pdf'],
  ['Plano de metas 2026', 'Bruno Lima', 'planilha'],
  ['Ata da reunião de produto', 'Carla Dias', 'pdf'],
  ['Contrato de parceria', 'Diego Rocha', 'pdf'],
  ['Guia de marca Órbita', 'Elisa Prado', 'pdf'],
  ['Orçamento de marketing', 'Fábio Nunes', 'planilha'],
];

const PAYMENTS = [
  ['Mercado Central', 'Pix', 'R$ 182,40'],
  ['Livraria Atlas', 'Cartão de crédito', 'R$ 96,90'],
  ['Posto Avenida', 'Cartão de débito', 'R$ 210,00'],
  ['Farmácia Bem', 'Pix', 'R$ 43,75'],
];

const WRITING = [
  ['Primeiro uso', 'Nenhum dado.', 'Nenhum projeto ainda. Crie o primeiro e convide o time.'],
  ['Sem resultados', '0 resultados', 'Nada encontrado para “orçamento 2019”. Confira a grafia ou limpe os filtros.'],
  ['Erro', 'Ocorreu um erro!', 'Não conseguimos carregar os pagamentos. Tente de novo em alguns segundos.'],
  ['Sem permissão', 'Acesso negado (403)', 'Você não tem acesso a este relatório. Peça a quem o criou.'],
  ['Offline', 'Network error', 'Sem conexão. Mostrando a última versão salva, das 14:32.'],
  ['Carregando', 'Aguarde…', 'Carregando os projetos… Costuma levar poucos segundos.'],
];

/* ───────── Peças ───────── */

function actionButton([kind, ic, label], data = '') {
  if (kind === 'inline') return `<button type="button" class="ds-inline-action"${data}>${label}${icon(ic, { size: 14 })}</button>`;
  return `<button type="button" class="ds-btn ds-btn--${kind}"${data}>${icon(ic, { size: 18 })}${label}</button>`;
}

/** Monta um .ds-empty. actions: [[kind, icon, label, dataAttr?]] */
function empty({ icon: ic, title, desc, actions = [], meta, tone, role, place = '', plain, extra = '', titleId }) {
  const cls = ['ds-empty', place, tone && `ds-empty--${tone}`, plain && 'ds-empty--plain', extra].filter(Boolean).join(' ');
  const acts = actions.length ? `<div class="ds-empty__actions">${actions.map((a) => actionButton(a, a[3] ? ` ${a[3]}` : '')).join('')}</div>` : '';
  return `<div class="${cls}"${role ? ` role="${role}"` : ''}>
    <span class="ds-empty__icon">${icon(ic, { size: place ? 20 : 24 })}</span>
    <p class="ds-empty__title"${titleId ? ` id="${titleId}" tabindex="-1"` : ''}>${title}</p>
    ${desc ? `<p class="ds-empty__description">${desc}</p>` : ''}
    ${acts}
    ${meta ? `<p class="ds-empty__meta">${meta}</p>` : ''}
  </div>`;
}

/** Código HTML legível de um estado. */
function emptyCode(s, placeClass, onlyPrimary) {
  const cls = ['ds-empty', placeClass, s.tone && `ds-empty--${s.tone}`].filter(Boolean).join(' ');
  const acts = (onlyPrimary ? s.actions.slice(0, 1) : s.actions).map(([kind, ic, label]) =>
    kind === 'inline' ? `    <button type="button" class="ds-inline-action">${label}<ds-icon name="${ic}" size="14"></ds-icon></button>` : `    <button type="button" class="ds-btn ds-btn--${kind}"><ds-icon name="${ic}"></ds-icon>${label}</button>`,
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
    return `<div class="pe-ctx pe-ctx--panel"><div class="pe-ctx__head"><span class="pe-ctx__title">Projetos</span><span class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted">${icon('more-horizontal', { size: 16 })}</span></div>${html}</div>`;
  }
  if (place === 'lista') {
    return `<div class="pe-ctx pe-ctx--list">
      <div class="pe-ctx__row pe-ctx__row--head"><span>Nome</span><span>Atualizado</span></div>
      ${html}
    </div>`;
  }
  return `<div class="pe-ctx pe-ctx--page">${html}</div>`;
}

/** Palco com tema próprio, para ver o estado no escuro e no claro. */
const stage = (id, inner, label) => `<div class="pe-stage" data-pe-stage data-theme="dark">
    <div class="ds-segmented pe-stage__theme" role="radiogroup" aria-label="Tema do exemplo: ${label}">
      <button type="button" class="ds-segmented__item" role="radio" data-pe-theme="dark" aria-checked="true" aria-label="Escuro">${icon('moon', { size: 16 })}</button>
      <button type="button" class="ds-segmented__item" role="radio" data-pe-theme="light" aria-checked="false" aria-label="Claro">${icon('sun', { size: 16 })}</button>
    </div>
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

const tips = (items) => `<ul class="pe-tips" role="list">${items.map(([ic, text]) => `<li class="pe-tips__item pe-tips__item--${ic === 'x-circle' ? 'dont' : 'do'}">${icon(ic, { size: 16, label: ic === 'x-circle' ? 'Evite' : 'Faça' })}<span>${text}</span></li>`).join('')}</ul>`;

/* ───────── Demos: corpo de cada estado ───────── */

const s = SITUATIONS;

const projectRow = (name, meta, example) => `<li class="pe-row"><span class="pe-row__icon">${icon('folder', { size: 18 })}</span><span class="pe-row__text"><a href="#/padroes/estados-vazios" class="pe-row__name" data-noop>${name}</a><span class="pe-row__meta">${meta}</span></span>${example ? '<span class="ds-badge ds-badge--sm">exemplo</span>' : ''}</li>`;

const views = {
  primeiroEmpty: () => empty({ ...s.primeiro, plain: true, actions: [['primary', 'plus', 'Criar projeto', 'data-act="create"'], ['inline', 'arrow-right', 'Ver um exemplo', 'data-act="sample"']] }),
  primeiroList: (sample) => `<ul class="pe-list" role="list" aria-label="Projetos">${
    sample
      ? [['Lançamento do app', 'Exemplo · 12 tarefas'], ['Pesquisa com clientes', 'Exemplo · 5 tarefas'], ['Site novo', 'Exemplo · 8 tarefas']].map(([n, m]) => projectRow(n, m, true)).join('')
      : projectRow('Projeto sem título', 'Criado agora · só você')
  }</ul>
    <div class="pe-app__foot"><button type="button" class="ds-inline-action" data-act="reset">${sample ? 'Remover exemplos' : 'Voltar ao vazio'}${icon('refresh', { size: 14 })}</button></div>`,
  erroEmpty: (alert) => empty({ ...s.erro, plain: true, role: alert ? 'alert' : undefined, actions: [['secondary', 'refresh', 'Tentar de novo', 'data-act="retry"'], ['inline', 'external-link', 'Ver status do serviço', 'data-act="status"']] }),
  loading: (title = 'Carregando…', desc = '') => empty({ icon: 'loader', tone: 'loading', title, desc, plain: true, place: 'ds-empty--compact', role: 'status' }),
  payments: () => `<ul class="pe-list" role="list" aria-label="Pagamentos" tabindex="-1" data-focus>${PAYMENTS.map(
    ([name, method, value]) => `<li class="pe-row"><span class="pe-row__icon">${icon('check-circle', { size: 18 })}</span><span class="pe-row__text"><span class="pe-row__name">${name}</span><span class="pe-row__meta">${method}</span></span><span class="pe-row__value">${value}</span></li>`,
  ).join('')}</ul>
    <div class="pe-app__foot"><button type="button" class="ds-inline-action" data-act="fail">Simular erro de novo${icon('alert-triangle', { size: 14 })}</button></div>`,
  permissao: () => empty({ ...s.permissao, plain: true, actions: [['primary', 'mail', 'Pedir acesso', 'data-act="request"'], ['inline', 'arrow-left', 'Voltar para relatórios', 'data-act="back"']] }),
  permissaoSent: () =>
    empty({
      icon: 'check-circle',
      title: 'Pedido enviado',
      desc: 'Avisamos Ana Souza, do time de Finanças. Você recebe um e-mail quando o acesso for liberado.',
      plain: true,
      role: 'status',
      titleId: 'pe-perm-sent',
      extra: 'pe-empty--success',
      actions: [['secondary', 'x', 'Cancelar pedido', 'data-act="cancel"']],
    }),
};

function docsList(items) {
  return `<ul class="pe-list" role="list" aria-label="Documentos">${items
    .map(([name, author, kind]) => `<li class="pe-row"><span class="pe-row__icon">${icon(kind === 'pdf' ? 'file-text' : 'table', { size: 18 })}</span><span class="pe-row__text"><span class="pe-row__name">${escapeHtml(name)}</span><span class="pe-row__meta">${escapeHtml(author)} · ${kind === 'pdf' ? 'PDF' : 'Planilha'}</span></span></li>`)
    .join('')}</ul>`;
}

/* ───────── Página ───────── */

const NAV = [
  ['pe-playground', 'Playground'],
  ['pe-primeiro-uso', 'Primeiro uso'],
  ['pe-sem-resultados', 'Sem resultados'],
  ['pe-erro', 'Erro'],
  ['pe-permissao', 'Sem permissão'],
  ['pe-offline', 'Offline'],
  ['pe-carregando', 'Carregando'],
  ['pe-anatomia', 'Anatomia'],
  ['pe-escrita', 'Escrita'],
  ['pe-onde', 'Onde aparece'],
  ['pe-acessibilidade', 'Acessibilidade'],
  ['pe-codigo', 'Código'],
  ['pe-uso', 'Uso'],
];

export default function renderEstadosVazios(page) {
  return `
  <div class="page doc pe-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Estados vazios</h1>
        <p class="doc-header__lead">Quando não há nada para mostrar — ainda, por causa de um filtro ou por um erro — a tela diz o que aconteceu e oferece o próximo passo. Nunca uma área em branco.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">situações</dt><dd class="doc-stat__value">${Object.keys(SITUATIONS).length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">lugares</dt><dd class="doc-stat__value">${PLACES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">partes</dt><dd class="doc-stat__value">4</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">próximo passo</dt><dd class="doc-stat__value">sempre</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section('pe-playground', 'Playground', 'Escolha a situação e o lugar. O texto muda com a situação; o tamanho, com o lugar.', playgroundMarkup('estados-vazios'))}

    ${section(
      'pe-primeiro-uso',
      'Primeiro uso',
      'A primeira vez é a melhor hora para ensinar: diga o que vai aparecer aqui e dê o botão que faz aparecer. Clique em “Criar projeto”.',
      `${stage('primeiro', app('Projetos', '', views.primeiroEmpty(), { id: 'pe-demo-primeiro' }), 'primeiro uso')}
      ${tips([
        ['check-circle', 'Ação principal com verbo: “Criar projeto”. Uma alternativa discreta ao lado, se houver.'],
        ['check-circle', 'Depois de criar, o foco vai para o item novo — a pessoa vê o resultado na hora.'],
        ['x-circle', 'Nada de tela vazia com um “+” solto no canto. O vazio é o próprio convite.'],
      ])}`,
    )}

    ${section(
      'pe-sem-resultados',
      'Sem resultados',
      'O vazio foi causado pela pessoa — por uma busca ou um filtro. Repita o que ela pediu, sugira o que tentar e deixe os controles à vista.',
      `${stage(
        'busca',
        app(
          'Documentos',
          '',
          `<div class="pe-search">
            <div class="ds-field ds-field--sm pe-search__field">${icon('search', { size: 16 })}<input class="ds-field__input" type="search" value="orçamento 2019" aria-label="Buscar documentos" data-search spellcheck="false" autocomplete="off"></div>
            <div class="pe-search__filters" role="group" aria-label="Tipo">
              <button type="button" class="ds-chip ds-chip--sm" data-kind="all" aria-pressed="false">Todos</button>
              <button type="button" class="ds-chip ds-chip--sm" data-kind="pdf" aria-pressed="true">PDF</button>
              <button type="button" class="ds-chip ds-chip--sm" data-kind="planilha" aria-pressed="false">Planilha</button>
            </div>
          </div>
          <p class="pe-search__count" role="status" data-count></p>
          <div data-results></div>`,
          { id: 'pe-demo-busca' },
        ),
        'sem resultados',
      )}
      ${tips([
        ['check-circle', 'O título repete a busca entre aspas: a pessoa confere se digitou certo.'],
        ['check-circle', '“Limpar busca” devolve a lista e o foco ao campo. A contagem é anunciada sem roubar o foco.'],
        ['x-circle', 'Não esconda a busca nem os filtros no estado vazio: são justamente o caminho de volta.'],
      ])}`,
    )}

    ${section(
      'pe-erro',
      'Erro',
      'Algo falhou do nosso lado. Diga o que não carregou, tranquilize sobre os dados e ofereça tentar de novo. Clique em “Tentar de novo”.',
      `${stage('erro', app('Pagamentos', '', views.erroEmpty(false), { id: 'pe-demo-erro', sub: 'Outubro de 2026' }), 'erro')}
      ${tips([
        ['check-circle', 'Tom de perigo no ícone, não na tela toda. O texto diz o mesmo que a cor.'],
        ['check-circle', 'Código e hora em <code class="ds-inline-code">.ds-empty__meta</code>: o suporte agradece, e não atrapalha quem não precisa.'],
        ['x-circle', 'Sem culpa (“Você fez algo errado”) e sem exclamação. Erro do sistema é do sistema.'],
      ])}`,
    )}

    ${section(
      'pe-permissao',
      'Sem permissão',
      'O conteúdo existe, mas não para esta pessoa. Diga de quem é e como pedir acesso — sem expor o que ela não pode ver.',
      `${stage('permissao', app('Relatório de custos', '', views.permissao(), { id: 'pe-demo-permissao', sub: 'Finanças' }), 'sem permissão')}
      ${tips([
        ['check-circle', 'Ícone neutro (cadeado), não de erro: ninguém errou.'],
        ['check-circle', 'Depois de pedir, confirme no mesmo lugar e diga o que acontece em seguida.'],
        ['x-circle', '“Acesso negado (403)” não ajuda ninguém a chegar onde precisa.'],
      ])}`,
    )}

    ${section(
      'pe-offline',
      'Offline',
      'Sem internet, mostre o que já estava salvo com um aviso discreto; sem nada salvo, um estado vazio que se resolve sozinho. Este exemplo também segue a sua conexão de verdade.',
      `${stage(
        'offline',
        app(
          'Tarefas',
          `<label class="ds-switch ds-switch--sm pe-toggle"><input type="checkbox" role="switch" class="ds-switch__input" data-offline><span class="ds-choice__text"><span class="ds-choice__label">Sem conexão</span></span></label>
           <label class="ds-switch ds-switch--sm pe-toggle"><input type="checkbox" role="switch" class="ds-switch__input" data-cache checked><span class="ds-choice__text"><span class="ds-choice__label">Versão salva</span></span></label>`,
          '',
          { id: 'pe-demo-offline' },
        ),
        'offline',
      )}
      ${tips([
        ['check-circle', 'Com versão salva: alerta compacto no topo e o conteúdo continua legível.'],
        ['check-circle', 'Volte sozinho quando a conexão voltar — e avise com um toast curto.'],
        ['x-circle', 'Não apague o que a pessoa já via só porque a rede caiu.'],
      ])}`,
    )}

    ${section(
      'pe-carregando',
      'Carregando',
      'Até 1 segundo, nada — um spinner que pisca atrapalha mais que ajuda. Até 10, spinner com texto. Passou disso, diga que está demorando e ofereça cancelar.',
      `${stage(
        'carregando',
        app('Relatórios', `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="reload">${icon('refresh', { size: 16 })}Recarregar</button>`, '', { id: 'pe-demo-carregando' }),
        'carregando',
      )}
      ${tips([
        ['check-circle', 'Texto junto do spinner: “Carregando os relatórios…”. Ícone girando sozinho não diz nada a um leitor de tela.'],
        ['check-circle', 'Recarregar algo que já está na tela? Mantenha o conteúdo esmaecido em vez de trocar por um vazio.'],
        ['check-circle', 'Com movimento reduzido, o ícone para e o texto continua.'],
      ])}`,
    )}

    ${section(
      'pe-anatomia',
      'Anatomia',
      'Quatro partes — e só a ação é obrigatória quando existe uma saída. Tudo centrado, numa coluna estreita.',
      `<div class="pe-anatomy" inert>
        <div class="pe-anatomy__figure">
          <div class="ds-empty">
            <span class="ds-empty__icon pe-anatomy__part" data-num="1">${icon('folder', { size: 24 })}</span>
            <p class="ds-empty__title pe-anatomy__part" data-num="2">Nenhum projeto ainda</p>
            <p class="ds-empty__description pe-anatomy__part" data-num="3">Projetos reúnem tarefas, arquivos e pessoas. Crie o primeiro e convide o time.</p>
            <div class="ds-empty__actions pe-anatomy__part" data-num="4"><span class="ds-btn ds-btn--primary">${icon('plus', { size: 18 })}Criar projeto</span><span class="ds-inline-action">Ver um exemplo${icon('arrow-right', { size: 14 })}</span></div>
          </div>
        </div>
        <ol class="pe-anatomy__list" role="list">
          <li><span class="pe-pin" data-num="1"></span><div><strong>Ícone.</strong> Dá o contexto em um olhar. Um ícone da biblioteca, nunca ilustração ou emoji. Opcional dentro de listas.</div></li>
          <li><span class="pe-pin" data-num="2"></span><div><strong>Título.</strong> O que aconteceu, em até seis palavras. Sem ponto final.</div></li>
          <li><span class="pe-pin" data-num="3"></span><div><strong>Descrição.</strong> Por que está vazio e o que fazer. Uma ou duas frases.</div></li>
          <li><span class="pe-pin" data-num="4"></span><div><strong>Ações.</strong> Uma principal — o próximo passo — e, se fizer sentido, uma alternativa em ação inline.</div></li>
        </ol>
      </div>`,
    )}

    ${section(
      'pe-escrita',
      'Escrita',
      'Diga o que aconteceu, por que (quando ajuda) e o que fazer. Tom calmo, sem culpa, sem exclamação — e sempre com uma saída.',
      `<div class="doc-table pe-writing" style="--doc-table-cols: minmax(110px, 0.55fr) minmax(0, 0.8fr) minmax(0, 1.7fr)">
        <div class="doc-table__head" aria-hidden="true"><span>Situação</span><span>Evite</span><span>Prefira</span></div>
        ${WRITING.map(
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
      'Onde aparece',
      'O mesmo estado muda de tamanho conforme o lugar. Página inteira tem espaço; dentro de um painel, encolhe; numa lista, vira uma linha.',
      `<div class="pe-places" inert>
        <article class="cd-example">
          <div class="cd-example__preview pe-place__preview">${inPlace('pagina', empty({ ...s.primeiro, actions: s.primeiro.actions.slice(0, 1) }))}</div>
          <div class="cd-example__body"><p class="cd-example__name">Página inteira<code>ds-empty</code></p><p class="cd-example__text">A tela toda está vazia. Ícone grande, título, descrição e ação.</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview pe-place__preview">${inPlace('painel', empty({ ...s.busca, place: 'ds-empty--compact', actions: s.busca.actions.slice(0, 1) }))}</div>
          <div class="cd-example__body"><p class="cd-example__name">Dentro de painel<code>ds-empty--compact</code></p><p class="cd-example__text">Um bloco da tela está vazio; o resto continua funcionando.</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview pe-place__preview">${inPlace('lista', empty({ ...s.erro, place: 'ds-empty--inline', actions: s.erro.actions.slice(0, 1), desc: 'Tente de novo em alguns segundos.' }))}</div>
          <div class="cd-example__body"><p class="cd-example__name">Linha de lista ou tabela<code>ds-empty--inline</code></p><p class="cd-example__text">Ícone à esquerda, ação à direita. Numa tabela, vai numa célula com <code class="ds-inline-code">colspan</code>.</p></div>
        </article>
      </div>`,
    )}

    ${section(
      'pe-acessibilidade',
      'Acessibilidade',
      'Estado vazio também é conteúdo: precisa ser anunciado, ter foco previsível e nunca depender só de ícone ou cor.',
      a11yList([
        ['Anuncie sem roubar o foco', 'Resultado vazio e contagem em <code class="ds-inline-code">role="status"</code>: o leitor de tela fala “Nada encontrado” e a pessoa continua no campo de busca.'],
        ['Alerta só depois de uma ação', 'Erro que aparece ao tentar de novo usa <code class="ds-inline-code">role="alert"</code>. Na carga da página, nada de alerta — o conteúdo já está ali.'],
        ['Foco que segue a ação', '“Limpar busca” devolve o foco ao campo; “Tentar de novo” com sucesso leva ao conteúdo; “Criar” leva ao item novo.', ['Tab', 'Enter']],
        ['Carregando com texto', 'O contêiner ganha <code class="ds-inline-code">aria-busy="true"</code> e o spinner vem com uma frase. Ícone girando sozinho não diz nada.'],
        ['Ícones decorativos', 'O ícone do estado é <code class="ds-inline-code">aria-hidden</code>; o título e a descrição carregam o sentido.'],
        ['Movimento reduzido', 'Com <code class="ds-inline-code">prefers-reduced-motion</code>, o spinner para. O texto continua dizendo o que está acontecendo.'],
        ['Controles à vista', 'Busca, filtros e navegação continuam na tela no estado vazio — são o caminho de volta.'],
      ]),
    )}

    ${section(
      'pe-codigo',
      'Código',
      'Uma classe base e modificadores para lugar e tom. As ações são os botões e ações inline de sempre.',
      `${codeBlock(emptyCode(SITUATIONS.erro, '', false))}
      <div class="doc-table pe-classes" style="--doc-table-cols: minmax(170px, 0.7fr) minmax(0, 1.6fr)">
        <div class="doc-table__head" aria-hidden="true"><span>Classe</span><span>Quando usar</span></div>
        ${[
          ['ds-empty', 'Página inteira ou área principal vazia.'],
          ['ds-empty--compact', 'Dentro de painel, cartão ou coluna.'],
          ['ds-empty--inline', 'Uma linha de lista ou tabela; ícone à esquerda, ação à direita.'],
          ['ds-empty--plain', 'Sem contorno nem fundo, quando já está dentro de uma superfície.'],
          ['ds-empty--danger', 'Erro: ícone no tom de perigo.'],
          ['ds-empty--warning', 'Offline e situações de atenção.'],
          ['ds-empty--muted', 'Neutro, como sem permissão.'],
          ['ds-empty--loading', 'Carregando: o ícone gira (para com movimento reduzido).'],
          ['ds-empty__meta', 'Código do erro, hora, versão — linha pequena no fim.'],
        ]
          .map(([cls, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${cls}</code><span class="pe-classes__text">${text}</span></div>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'pe-uso',
      'Uso',
      'Seis regras para o vazio não virar beco sem saída.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: sempre um próximo passo</p><p class="usage-card__text">Criar, limpar filtros, tentar de novo, pedir acesso. Se não há o que fazer, diga quando vai mudar.</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: “Nenhum dado”</p><p class="usage-card__text">Não explica nada. A pessoa não sabe se é erro, filtro ou se ainda não começou.</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}Diferencie as causas</p><p class="usage-card__text">Primeiro uso, sem resultados e erro pedem textos e ações diferentes — mesmo com o mesmo layout.</p></article>
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: ícone da biblioteca</p><p class="usage-card__text">Um ícone dá o contexto e combina com o resto. Ilustração grande e emoji competem com a mensagem.</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: trocar conteúdo por spinner</p><p class="usage-card__text">Ao recarregar, mantenha o que já estava na tela esmaecido. Piscar para vazio parece que tudo sumiu.</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}Uma ação principal</p><p class="usage-card__text">Dois botões primários no vazio dividem a atenção. A alternativa vai em ação inline.</p></article>
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

  /* Playground */
  cleanups.push(
    mountPlayground(root, {
      id: 'estados-vazios',
      controls: [
        { id: 'situation', label: 'Situação', value: 'primeiro', options: Object.entries(SITUATIONS).map(([value, v]) => ({ value, label: v.label })) },
        { id: 'place', label: 'Onde', value: 'pagina', options: PLACES.map(([value, label]) => ({ value, label })) },
        { id: 'actions', label: 'Ações', value: 'all', options: [{ value: 'all', label: 'Principal e alternativa' }, { value: 'one', label: 'Só a principal' }] },
      ],
      render(state) {
        const sit = SITUATIONS[state.situation];
        const place = PLACES.find(([id]) => id === state.place)[2];
        const actions = state.actions === 'one' ? sit.actions.slice(0, 1) : sit.actions;
        return `<div class="pe-play" inert>${inPlace(state.place, empty({ ...sit, place, actions, role: undefined }))}</div>`;
      },
      code(state) {
        const sit = SITUATIONS[state.situation];
        const place = PLACES.find(([id]) => id === state.place)[2];
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

  /* Primeiro uso */
  const primeiro = bodyOf('primeiro');
  const onPrimeiro = (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (event.target.closest('[data-noop]')) event.preventDefault();
    if (!act) return;
    if (act === 'create' || act === 'sample') {
      primeiro.innerHTML = views.primeiroList(act === 'sample');
      focusIn(primeiro.querySelector('.pe-row__name'));
      if (act === 'create') toast('Projeto criado', { tone: 'success' });
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
  let kind = 'pdf';
  const renderBusca = () => {
    const q = normalize(input.value.trim());
    const list = DOCS.filter(([name, author, k]) => (kind === 'all' || k === kind) && (!q || q.split(/\s+/).every((w) => normalize(`${name} ${author} ${k === 'pdf' ? 'pdf' : 'planilha'}`).includes(w))));
    busca.querySelectorAll('[data-kind]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.kind === kind)));
    if (list.length) {
      results.innerHTML = docsList(list);
      countEl.textContent = `${list.length} ${list.length === 1 ? 'documento' : 'documentos'}`;
      return;
    }
    const term = input.value.trim();
    const filtered = kind !== 'all';
    countEl.textContent = 'Nenhum documento';
    results.innerHTML = empty({
      icon: 'search-x',
      title: term ? `Nada encontrado para “${escapeHtml(term)}”` : 'Nenhum documento deste tipo',
      desc: term ? `Confira a grafia ou tente outra palavra${filtered ? ' — ou limpe o filtro de tipo' : ''}.` : 'Escolha outro tipo ou veja todos.',
      plain: true,
      place: 'ds-empty--compact',
      actions: [term && ['secondary', 'x', 'Limpar busca', 'data-act="clear-search"'], filtered && ['inline', 'filter', 'Limpar filtros', 'data-act="clear-filters"']].filter(Boolean),
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
      erro.innerHTML = views.loading('Carregando os pagamentos…');
      erroTimer = later(() => {
        erro.removeAttribute('aria-busy');
        erro.innerHTML = views.payments();
        focusIn(erro.querySelector('[data-focus]'));
      }, 1200);
    } else if (act === 'fail') {
      erro.innerHTML = views.erroEmpty(true);
      focusIn(erro.querySelector('[data-act="retry"]'));
    } else if (act === 'status') {
      toast('Todos os serviços operando · atualizado agora', { tone: 'info' });
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
      toast('Pedido cancelado');
    } else if (act === 'back') {
      toast('Aqui voltaria para a lista de relatórios');
    }
  };
  perm.addEventListener('click', onPerm);
  cleanups.push(() => perm.removeEventListener('click', onPerm));

  /* Offline: simulado ou de verdade */
  const off = demo('offline');
  const offBody = off.querySelector('[data-body]');
  const offSwitch = off.querySelector('[data-offline]');
  const cacheSwitch = off.querySelector('[data-cache]');
  const TASKS = [['Revisar contrato de parceria', 'Hoje'], ['Enviar orçamento para Bruno', 'Amanhã'], ['Preparar apresentação Q4', 'Sexta']];
  const taskList = (stale) => `<ul class="pe-list${stale ? ' pe-list--stale' : ''}" role="list" aria-label="Tarefas">${TASKS.map(
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
          <div class="ds-alert__body"><p class="ds-alert__title">Sem conexão</p><p class="ds-alert__text">Mostrando a versão salva, das 14:32.</p></div>
          <div class="ds-alert__actions"><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-act="retry-net">${icon('refresh', { size: 16 })}Tentar agora</button></div>
        </div>${taskList(true)}`;
    } else {
      offBody.innerHTML = empty({ ...SITUATIONS.offline, plain: true, place: 'ds-empty--compact', role: 'status', actions: [['secondary', 'refresh', 'Tentar agora', 'data-act="retry-net"']] });
    }
  };
  const onOffChange = () => renderOff();
  const onOffClick = (event) => {
    if (!event.target.closest('[data-act="retry-net"]')) return;
    if (navigator.onLine && offSwitch.dataset.real !== 'true') {
      // no exemplo, "tentar agora" encontra a internet de volta
      const btn = event.target.closest('[data-act]');
      btn.innerHTML = `${icon('loader', { size: 16, className: 'pe-spin' })}Tentando…`;
      btn.setAttribute('aria-disabled', 'true');
      offTimer = later(() => {
        offSwitch.checked = false;
        renderOff();
        toast('Conexão de volta · lista atualizada', { tone: 'success' });
      }, 900);
    } else {
      toast('Ainda sem conexão. Tentamos de novo sozinhos.', { tone: 'warning' });
    }
  };
  const onNet = () => {
    offSwitch.checked = !navigator.onLine;
    offSwitch.dataset.real = String(!navigator.onLine);
    renderOff();
    if (navigator.onLine) toast('Conexão de volta · lista atualizada', { tone: 'success' });
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
  const REPORTS = [['Vendas de outubro', 'Atualizado há 2 h'], ['Custos por time', 'Atualizado ontem'], ['Churn trimestral', 'Atualizado há 3 dias']];
  const reportList = (stale) => `<ul class="pe-list${stale ? ' pe-list--stale' : ''}" role="list" aria-label="Relatórios" tabindex="-1" data-focus>${REPORTS.map(
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
      loadBody.innerHTML = views.loading('Carregando os relatórios…', 'Costuma levar poucos segundos.');
      slowTimer = later(() => {
        loadBody.innerHTML = empty({
          icon: 'loader',
          tone: 'loading',
          title: 'Ainda carregando…',
          desc: 'Está demorando mais que o normal. Pode continuar navegando — avisamos quando terminar.',
          plain: true,
          place: 'ds-empty--compact',
          role: 'status',
          actions: [['secondary', 'x', 'Cancelar', 'data-act="cancel-load"']],
        });
      }, 2600);
      doneTimer = later(() => {
        showReports(true);
        toast('Relatórios atualizados', { tone: 'success' });
      }, 5200);
    } else if (act === 'cancel-load') {
      cancel(slowTimer);
      cancel(doneTimer);
      showReports(false);
      focusIn(load.querySelector('[data-act="reload"]'));
      toast('Carregamento cancelado — mostrando a última versão');
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
