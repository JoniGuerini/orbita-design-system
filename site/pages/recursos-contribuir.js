import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, escapeHtml } from '../component-doc.js';
import { navigation } from '../nav.js';
import { releases, CURRENT_VERSION, TYPES } from '../changelog.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-contribuir.css'];

/* ───────── Dados ───────── */

const countGroup = (id) => navigation.find((g) => g.id === id)?.items.length ?? 0;

const STAGES = [
  {
    name: 'Ideia',
    text: 'Um problema que aparece em mais de uma tela — ou uma peça que três times já desenharam cada um do seu jeito.',
    who: 'Qualquer pessoa do time',
    out: 'Uma nota com exemplos reais',
  },
  {
    name: 'Proposta',
    text: 'O modelo preenchido: o problema, quem usa, o que já existe e o impacto em tokens e acessibilidade.',
    who: 'Quem teve a ideia + alguém do Órbita',
    out: 'Aceita, ajustada ou recusada com motivo',
  },
  {
    name: 'Rascunho',
    text: 'Tokens, CSS, JS e a página com playground. Estados forçados com data-state, nos dois temas.',
    who: 'Quem vai construir',
    out: 'Pull request em rascunho',
  },
  {
    name: 'Revisão',
    text: 'Uma pessoa olha o design, outra o código. Os dois passam pelo mesmo checklist.',
    who: 'Duas pessoas, design e código',
    out: 'Aprovado ou pedidos de ajuste',
  },
  {
    name: 'Publicado',
    text: 'Entra em Novidades com uma versão nova. A bolinha da sidebar avisa todo mundo.',
    who: 'Quem mantém o Órbita',
    out: `Versão nova — hoje, ${CURRENT_VERSION}`,
  },
];

const KINDS = [
  ['droplet', 'Token', 'Muda só um valor — uma cor, um espaço, um raio — e vale para o sistema todo.', 'color.chart.status.critical nasceu porque o vermelho de perigo parecia o pêssego no escuro.'],
  ['shapes', 'Variante', 'O mesmo componente com outro peso, tamanho ou tom. Mesma anatomia, mesmo teclado.', 'ds-btn--danger é um botão; só muda a intenção.'],
  ['layers', 'Padrão', 'Uma combinação de peças que já existem, com regras de uso. Não cria CSS novo — ou cria pouco.', 'Formulários: campos + validação + resumo de erros.'],
  ['component', 'Componente', 'Uma peça nova, com anatomia, estados e acessibilidade próprios.', 'ds-alert entrou na 0.3 porque nenhum componente dava um aviso inline.'],
];

/* Ajudante "isso é do design system?" — perguntas em sequência até uma recomendação */
const QUESTIONS = [
  { id: 'repete', text: 'Aparece em mais de uma tela ou produto?', hint: 'Ou vai aparecer logo — não só "um dia, talvez".', no: 'local' },
  { id: 'valor', text: 'A diferença é só um valor — uma cor, um espaço, um raio?', yes: 'token' },
  { id: 'mesmo', text: 'É um componente que já existe, com outro peso, tamanho ou tom?', yes: 'variante' },
  { id: 'monta', text: 'Dá para montar com peças que já existem?', yes: 'padrao', no: 'componente' },
];

const RESULTS = {
  local: {
    tone: 'info',
    icon: 'info',
    title: 'Fica no produto, por enquanto',
    text: 'Construa com os tokens e componentes do Órbita e anote onde usou. Quando aparecer na segunda tela, volte aqui.',
  },
  token: {
    tone: 'success',
    icon: 'droplet',
    title: 'Um token — ou um que já existe',
    text: 'Procure em Fundamentos › Cores antes. Se faltar, proponha um token semântico (nunca uma cor solta no CSS) com o contraste conferido no build.',
    href: '/fundamentos/cores',
    link: 'Ver tokens de cor',
  },
  variante: {
    tone: 'success',
    icon: 'shapes',
    title: 'Uma variante',
    text: 'Proponha um modificador (ds-bloco--nome) no componente que já existe. A anatomia, os estados e o teclado continuam os mesmos.',
    href: '/componentes/botao',
    link: 'Ver como o Botão documenta variantes',
  },
  padrao: {
    tone: 'success',
    icon: 'layers',
    title: 'Um padrão',
    text: 'Documente a combinação em Padrões: quando usar, como as peças conversam e um exemplo que funciona. CSS novo, só o que faltar.',
    href: '/padroes/formularios',
    link: 'Ver um padrão pronto',
  },
  componente: {
    tone: 'warning',
    icon: 'component',
    title: 'Um componente novo — abra uma proposta',
    text: 'É o caminho mais longo, e tudo bem. Use o modelo abaixo: problema, quem usa, alternativas, tokens e acessibilidade.',
    href: null,
    link: 'Ir para o modelo',
    target: 'rc-modelo',
  },
};

const TEMPLATE = `## Proposta: <nome da peça>

### Problema
O que acontece hoje e onde. Links ou prints de pelo menos duas telas.

### Quem usa
Times, produtos e com que frequência.

### O que já existe
Componentes, padrões ou tokens do Órbita que chegam perto — e por que não bastam.

### Proposta
Anatomia, variantes e estados (normal, hover, pressionado, foco, desativado, erro).

### Alternativas
O que mais foi considerado e por que ficou de fora.

### Impacto em tokens
Tokens novos ou alterados. Contraste nos dois temas.

### Acessibilidade
Papel ARIA, teclado, foco, leitor de tela e movimento reduzido.

### Fora do escopo
O que esta proposta não resolve.`;

const code = (t) => `<code class="ds-inline-code">${escapeHtml(t)}</code>`;

const RULES = [
  ['package', 'Zero dependências', `HTML, CSS e JavaScript nativos. Nada de ${code('npm install')} para usar — os scripts de Node só geram tokens e servem o site.`],
  ['droplet', 'Só tokens semânticos', `Componentes leem ${code('var(--ds-color-fg-muted)')}, nunca um hex nem uma paleta crua como ${code('--ds-color-neutral-400')}.`],
  ['code', 'Nomes ds-bloco__parte--variação', `${code('.ds-panel__header')}, ${code('.ds-btn--primary')}. O prefixo ${code('ds-')} é do sistema; páginas da documentação usam o próprio prefixo.`],
  ['eye', 'Estados forçados com data-state', `${code('data-state="hover|pressed|focus"')} desenha o estado sem interação — para documentar e testar.`],
  ['accessibility', 'Padrões ARIA de verdade', 'combobox e listbox na Seleção, menu no Menu, tablist nas Abas, dialog no Modal, status no Toast.'],
  ['refresh', 'Tudo que liga, desliga', `Módulos devolvem ${code('destroy()')} ou uma função de limpeza: listeners, timers e observadores saem junto.`],
];

const TOKEN_CODE = `// tokens/semantic.json — a fonte da verdade
"chart": {
  "grid": { "dark": "{color.neutral.800}", "light": "{color.neutral.200}" }
}

// e, se for cor de marca ou texto, a checagem de contraste:
"$checks": [["color.chart.series.1", "color.bg.surface", 3]]`;

const TOKEN_RUN = `npm run tokens
# ✓ tokens: … tokens, 13 paletas → ds/tokens.css, ds/tokens.js
#   contraste: …/… combinações atingem o mínimo`;

const CSS_CODE = `/*
 * Alerta — mensagem inline com tom, ícone, título, texto e ações.
 *
 * <div class="ds-alert ds-alert--danger" role="alert">…</div>
 *
 * Tons: neutro (padrão) · --info · --success · --warning · --danger.
 */
.ds-alert {
  padding: var(--ds-space-200) var(--ds-space-250);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-color-bg-surface);
  border: 1px solid var(--ds-color-border-subtle);
}

/* e no ponto de entrada, ds/ds.css */
@import url("./components/alert.css");`;

const JS_CODE = `// ds/js/meu-componente.js
export function createMeuComponente(el, { onChange } = {}) {
  const onClick = (event) => { /* … */ onChange?.(); };
  el.addEventListener('click', onClick);

  return {
    destroy() {
      el.removeEventListener('click', onClick);
    },
  };
}`;

const ICON_CODE = `// ds/icons/icons.js — grid de 24, traço 1,5, pontas redondas, currentColor
// [nome, categoria, palavras-chave para a busca, desenho]
['send', 'acoes', 'enviar mensagem avião', path('M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z')],`;

const PAGE_CODE = `// site/pages/meu-componente.js
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/meu-componente.css'];

export default function render(page) {
  return \`<div class="page doc">…</div>\`;
}

export function mount(root) {
  const offNav = mountDocNav(root);
  const offCopy = mountCodeCopy(root);
  return () => { offNav(); offCopy(); };
}`;

const NAV_CODE = `// site/nav.js
{
  label: 'Meu componente',
  icon: 'component',
  path: '/componentes/meu-componente',
  load: () => import('./pages/meu-componente.js'),
  description: 'Uma frase sobre para que serve.',
}`;

const BUILD_STEPS = [
  ['Token, se faltar', 'Edite o JSON em tokens/ e rode o build. Nunca edite ds/tokens.css nem ds/tokens.js — eles são gerados e o servidor de desenvolvimento os refaz a cada mudança.', [TOKEN_CODE, TOKEN_RUN]],
  ['O CSS', 'Um arquivo por componente em ds/components/, com o markup no comentário do topo, e uma linha de import em ds/ds.css.', [CSS_CODE]],
  ['O JavaScript, se for interativo', 'Um módulo em ds/js/ que liga o comportamento e devolve como desligar.', [JS_CODE]],
  ['Ícones novos', 'Entram na lista de ds/icons/icons.js e já aparecem na busca de Ícones.', [ICON_CODE]],
  ['A página', 'Componentes seguem a página do Botão: playground com código, variantes, tamanhos, estados, anatomia, acessibilidade, tokens e uso.', [PAGE_CODE, NAV_CODE]],
];

const CHECKLIST = [
  {
    id: 'visual',
    name: 'Visual',
    items: [
      ['Plano', 'Sem degradê, vidro, brilho, blur ou imagem de fundo.'],
      ['Só tokens', 'Nenhum hex, px de cor ou paleta crua no CSS do componente.'],
      ['Dois temas', 'Conferido no escuro e no claro, inclusive com tema aninhado.'],
      ['Todos os estados', 'Normal, hover, pressionado, foco, desativado e erro — com data-state.'],
    ],
  },
  {
    id: 'a11y',
    name: 'Acessibilidade',
    items: [
      ['Contraste', 'Texto ≥ 4,5:1 e contornos e ícones ≥ 3:1, nos dois temas.'],
      ['Teclado', 'Tudo alcançável com Tab; setas, Enter, Espaço e Esc onde o padrão ARIA pede.'],
      ['Nomes', 'Botões de ícone com aria-label; campos com rótulo de verdade.'],
      ['Movimento', 'prefers-reduced-motion respeitado; nada pisca nem anima sem motivo.'],
    ],
  },
  {
    id: 'codigo',
    name: 'Código',
    items: [
      ['Sem dependências', 'Nada novo em package.json, nenhum script de terceiros.'],
      ['Limpeza', 'destroy() ou a função de mount remove listeners, timers e observadores.'],
      ['Ids únicos', 'Nenhum id repetido na página, nem colidindo com os do app.'],
      ['Console limpo', 'Nenhum erro ou aviso no navegador.'],
    ],
  },
  {
    id: 'docs',
    name: 'Documentação',
    items: [
      ['Página', 'Ligada em site/nav.js com load e uma descrição de uma frase.'],
      ['Playground', 'Controles, os dois temas e o código exato do que está no palco.'],
      ['Uso', 'Faça e evite com exemplos — e quando não usar.'],
      ['Novidades', 'Entrada em site/changelog.js com o link para a página.'],
    ],
  },
];
const TOTAL = CHECKLIST.reduce((n, g) => n + g.items.length, 0);

const BLOCKERS = [
  'Qualquer ✗ no relatório de contraste do build',
  'Cor, espaço ou raio fixo no CSS em vez de token',
  'Uma dependência nova',
  'Algo que só funciona com mouse',
  'Página sem playground ou sem a seção de acessibilidade',
  'Erro no console ou id duplicado',
];

const SEMVER = [
  ['1.0.0', 0, 'Maior', 'Muda algo que você usa: um nome de classe, um token removido. Vem com guia de migração.'],
  ['0.3.0', 1, 'Menor', 'Coisas novas sem quebrar nada: uma seção, um componente, tokens novos.'],
  ['0.3.1', 2, 'Correção', 'Ajustes e bugs. Ninguém precisa mudar nada.'],
];

const TYPE_TEXT = {
  novo: 'Algo que não existia: componente, página, token, ícone.',
  melhoria: 'Algo que existia e ficou melhor, sem mudar como se usa.',
  correcao: 'Algo que estava errado e agora está certo.',
};

const CHANGELOG_CODE = `// site/changelog.js
export const CURRENT_VERSION = '0.5.0';   // ← a versão nova

export const releases = [
  {
    version: '0.5.0',
    date: '2026-12-01',
    title: 'Nome curto da entrega',
    summary: 'Uma frase sobre o que muda para quem usa.',
    groups: [
      {
        name: 'Componentes',
        items: [
          // [tipo, texto, link]
          ['novo', 'Alerta inline com tons e ações', '/padroes/formularios'],
          ['melhoria', 'Toast com seis posições', '/componentes/toast'],
          ['correcao', 'A busca encontra “calendário”', '/fundamentos/icones'],
        ],
      },
    ],
  },
  // …versões anteriores, da mais nova para a mais antiga
];`;

const AFTER = [
  ['megaphone', 'A bolinha de Novidades volta na sidebar para quem ainda não viu a versão.'],
  ['package', `O cartão da conta mostra a versão nova — hoje, Órbita ${CURRENT_VERSION.replace(/\.0$/, '')}.`],
  ['history', 'O roadmap do Início e a página Novidades leem o mesmo arquivo; não há outro lugar para atualizar.'],
];

const DONE = [
  ['Resolve um problema real', 'Aparece em pelo menos duas telas, com exemplos.'],
  ['Funciona sem o mouse', 'Teclado, foco visível e leitor de tela conferidos.'],
  ['Vive de tokens', 'Muda junto quando a marca ou o tema mudam.'],
  ['Está documentado', 'Página com playground, estados, acessibilidade e uso.'],
  ['Passou na revisão', 'Design e código, com o checklist inteiro marcado.'],
  ['Está em Novidades', 'Com versão, data e link para a página.'],
];

const FAQ = [
  ['Preciso pedir permissão para usar algo que não está no Órbita?', 'Não. Construa no seu produto com os tokens e componentes que existem. A proposta vem quando a peça se repete.'],
  ['E se o meu caso for diferente de tudo?', 'Comece pela conversa, não pelo código: traga os exemplos. Às vezes é uma variante; às vezes, um padrão com peças que já existem.'],
  ['Posso criar um token só para o meu componente?', 'Só se ele tiver um papel que outros componentes também possam ter. Tokens nomeiam papéis (fg.muted, border.focus), não lugares.'],
  ['Quanto tempo leva uma revisão?', 'Depende do tamanho. Uma correção ou um token passa rápido; um componente novo leva mais, porque passa por design e por código — e pela página com playground.'],
  ['Dá para mudar o nome de uma classe?', 'Dá, mas é uma mudança que quebra: só numa versão maior, com guia de migração. Enquanto isso, mantenha o nome antigo funcionando.'],
  ['Onde ficam as decisões que já foram tomadas?', 'Nas páginas: cada componente diz quando usar e quando não usar. O que mudou, e por quê, fica em Novidades.'],
];

/* ───────── Peças ───────── */

const section = (id, title, desc, body) => `
  <section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        ${desc ? `<p class="doc-section__desc">${desc}</p>` : ''}
      </div>
    </header>
    ${body}
  </section>`;

const stamp = (n) => String(n).padStart(2, '0');

function question(q, i) {
  const name = `rc-q-${q.id}`;
  return `<fieldset class="ds-choice-group rc-decide__question" data-question="${q.id}"${i ? ' hidden' : ''}>
    <legend class="ds-choice-group__legend rc-decide__legend"><span class="ds-section__stamp">${stamp(i + 1)}</span>${escapeHtml(q.text)}</legend>
    ${q.hint ? `<p class="rc-decide__hint">${escapeHtml(q.hint)}</p>` : ''}
    <div class="rc-decide__answers">
      <label class="ds-radio"><input type="radio" class="ds-radio__input" name="${name}" value="sim"><span class="ds-choice__text"><span class="ds-choice__label">Sim</span></span></label>
      <label class="ds-radio"><input type="radio" class="ds-radio__input" name="${name}" value="nao"><span class="ds-choice__text"><span class="ds-choice__label">Não</span></span></label>
    </div>
  </fieldset>`;
}

function resultHtml(key) {
  const r = RESULTS[key];
  const link = r.href
    ? `<a class="ds-inline-action" href="#${r.href}">${escapeHtml(r.link)}${icon('arrow-right', { size: 14 })}</a>`
    : r.target
      ? `<button type="button" class="ds-inline-action" data-rc-goto="${r.target}">${escapeHtml(r.link)}${icon('arrow-down', { size: 14 })}</button>`
      : '';
  return `<div class="ds-alert ds-alert--${r.tone}">
    <span class="ds-alert__icon">${icon(r.icon, { size: 20 })}</span>
    <div class="ds-alert__body">
      <p class="ds-alert__title">${escapeHtml(r.title)}</p>
      <p class="ds-alert__text">${escapeHtml(r.text)}</p>
      <div class="ds-alert__actions">${link}<button type="button" class="ds-inline-action" data-rc-restart>${icon('refresh', { size: 14 })}Recomeçar</button></div>
    </div>
  </div>`;
}

/* ───────── Página ───────── */

export default function renderContribuir(page) {
  return `
  <div class="page doc rc-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Como contribuir</h1>
        <p class="doc-header__lead">O Órbita cresce com o que os times precisam. Este é o caminho de uma ideia até virar versão — com as regras da casa, o checklist da revisão e como publicar.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">etapas</dt><dd class="doc-stat__value">${STAGES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">itens na revisão</dt><dd class="doc-stat__value">${TOTAL}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">dependências</dt><dd class="doc-stat__value">0</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">versão atual</dt><dd class="doc-stat__value">${CURRENT_VERSION}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['rc-caminho', 'Caminho'],
        ['rc-propor', 'Propor'],
        ['rc-construir', 'Construir'],
        ['rc-revisar', 'Revisar'],
        ['rc-publicar', 'Publicar'],
        ['rc-pronto', 'Pronto'],
        ['rc-faq', 'Perguntas'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'rc-caminho',
      'O caminho de uma mudança',
      'Cinco etapas, sempre nesta ordem. Uma correção pequena pode pular a proposta; uma peça nova, nunca.',
      `<ol class="rc-path" role="list">
        ${STAGES.map(
          (s, i) => `<li class="rc-stage">
            <span class="rc-stage__dot" aria-hidden="true"></span>
            <p class="ds-section__head rc-stage__head"><span class="ds-section__stamp">${stamp(i + 1)}</span><span>${s.name}</span></p>
            <p class="rc-stage__text">${s.text}</p>
            <dl class="rc-stage__meta">
              <div><dt>Quem</dt><dd>${s.who}</dd></div>
              <div><dt>Sai daqui</dt><dd>${escapeHtml(s.out)}</dd></div>
            </dl>
          </li>`,
        ).join('')}
      </ol>`,
    )}

    ${section(
      'rc-propor',
      'Propor',
      'Antes do código, a pergunta: que tipo de mudança é esta? Quanto menor, mais rápido sai.',
      `<div class="rc-kinds">
        ${KINDS.map(
          ([ic, name, text, example]) => `<article class="rc-kind">
            <span class="rc-kind__icon">${icon(ic, { size: 20 })}</span>
            <h3 class="rc-kind__name">${name}</h3>
            <p class="rc-kind__text">${text}</p>
            <p class="rc-kind__example"><span>Exemplo</span>${escapeHtml(example)}</p>
          </article>`,
        ).join('')}
      </div>

      <h3 class="doc-subhead">Isso é do design system? <span class="doc-subhead__meta">quatro perguntas, no máximo</span></h3>
      <div class="rc-decide" data-rc-decide>
        <div class="rc-decide__questions">
          ${QUESTIONS.map(question).join('')}
        </div>
        <div class="rc-decide__result" data-rc-result role="status" aria-live="polite"></div>
      </div>

      <h3 class="doc-subhead" id="rc-modelo">Modelo de proposta <span class="doc-subhead__meta">copie e preencha</span></h3>
      <p class="rc-note">Uma proposta boa cabe numa tela. Traga prints de onde o problema aparece — eles convencem mais que qualquer parágrafo.</p>
      <div data-rc-template>${codeBlock(TEMPLATE, { label: 'Copiar modelo' })}</div>`,
    )}

    ${section(
      'rc-construir',
      'Construir',
      'As regras da casa e o passo a passo de uma peça nova, com os arquivos de verdade deste repositório.',
      `<ul class="rc-rules" role="list">
        ${RULES.map(
          ([ic, title, text]) => `<li class="rc-rule">
            <span class="rc-rule__icon">${icon(ic, { size: 18 })}</span>
            <div><p class="rc-rule__title">${title}</p><p class="rc-rule__text">${text}</p></div>
          </li>`,
        ).join('')}
      </ul>

      <h3 class="doc-subhead">Passo a passo <span class="doc-subhead__meta">da pasta tokens/ até a página</span></h3>
      <ol class="rc-steps" role="list">
        ${BUILD_STEPS.map(
          ([title, text, codes], i) => `<li class="rc-step">
            <span class="rc-step__num" aria-hidden="true">${i + 1}</span>
            <div class="rc-step__body">
              <h4 class="rc-step__title"><span class="ds-visually-hidden">Passo ${i + 1}: </span>${title}</h4>
              <p class="rc-step__text">${escapeHtml(text)}</p>
              ${codes.map((c) => codeBlock(c)).join('')}
            </div>
          </li>`,
        ).join('')}
      </ol>`,
    )}

    ${section(
      'rc-revisar',
      'Revisar',
      `Quem revisa marca; quem construiu já passou por aqui antes. Para os detalhes de contraste, teclado e leitores de tela, veja <a class="rc-link" href="#/recursos/acessibilidade">Acessibilidade</a>.`,
      `<div class="rc-review" data-rc-review>
        <div class="rc-review__bar">
          <div class="ds-meter rc-review__meter" role="progressbar" aria-label="Itens conferidos" aria-valuemin="0" aria-valuemax="${TOTAL}" aria-valuenow="0" data-rc-meter>
            <div class="ds-meter__head">
              <span class="ds-meter__label">Itens conferidos</span>
              <span class="ds-meter__value"><strong data-rc-count>0</strong><span> de ${TOTAL}</span></span>
            </div>
            <div class="ds-meter__track"><span class="ds-meter__fill" style="--value:0" data-rc-fill></span></div>
          </div>
          <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-rc-clear>${icon('refresh', { size: 16 })}Desmarcar tudo</button>
        </div>
        <div class="rc-review__groups">
          ${CHECKLIST.map(
            (g, gi) => `<fieldset class="ds-choice-group rc-review__group">
              <legend class="ds-choice-group__legend rc-review__legend"><span class="ds-section__stamp">${stamp(gi + 1)}</span>${g.name}<span class="rc-review__group-count" data-rc-group-count="${g.id}">0/${g.items.length}</span></legend>
              <div class="ds-choice-group__items rc-review__items">
                ${g.items
                  .map(
                    ([label, desc], i) => `<label class="ds-checkbox">
                      <input type="checkbox" class="ds-checkbox__input" data-rc-check="${g.id}" name="rc-${g.id}-${i}">
                      <span class="ds-choice__text"><span class="ds-choice__label">${label}</span><span class="ds-choice__description">${escapeHtml(desc)}</span></span>
                    </label>`,
                  )
                  .join('')}
              </div>
            </fieldset>`,
          ).join('')}
        </div>
        <div class="rc-review__done" data-rc-done role="status" aria-live="polite"></div>
      </div>

      <div class="rc-split">
        <div>
          <h3 class="doc-subhead">O que bloqueia</h3>
          <ul class="rc-blockers" role="list">
            ${BLOCKERS.map((b) => `<li>${icon('x-circle', { size: 18 })}<span>${b}</span></li>`).join('')}
          </ul>
        </div>
        <div>
          <h3 class="doc-subhead">Como comentar</h3>
          <ul class="rc-tips" role="list">
            <li>${icon('check', { size: 18 })}<span><strong>Aponte o lugar.</strong> “O foco do item 3 do menu some no claro” ajuda mais que “o foco está estranho”.</span></li>
            <li>${icon('check', { size: 18 })}<span><strong>Diga se bloqueia.</strong> Separe o que impede a publicação do que é sugestão para depois.</span></li>
            <li>${icon('check', { size: 18 })}<span><strong>Proponha.</strong> Se der, mostre o token ou o trecho que resolve.</span></li>
          </ul>
        </div>
      </div>`,
    )}

    ${section(
      'rc-publicar',
      'Publicar',
      'Toda versão sai de um arquivo só: <code class="ds-inline-code">site/changelog.js</code>. Ele alimenta Novidades, o roadmap do Início, a bolinha da sidebar e o cartão da versão.',
      `<div class="rc-semver">
        ${SEMVER.map(
          ([v, part, name, text]) => `<article class="rc-semver__card">
            <p class="rc-semver__number">${v.split('.').map((n, i) => `<span${i === part ? ' class="rc-semver__part"' : ''}>${n}</span>`).join('.')}</p>
            <h3 class="rc-semver__name">${name}</h3>
            <p class="rc-semver__text">${text}</p>
          </article>`,
        ).join('')}
      </div>
      <p class="rc-note">Enquanto estivermos em 0.x, uma versão menor ainda pode trazer uma mudança que quebra — sempre avisada em Novidades. Cada entrega grande vira uma versão menor: ${releases
        .slice()
        .reverse()
        .map((r) => `${r.version.replace(/\.0$/, '')} ${r.title}`)
        .join(', ')}.</p>

      <h3 class="doc-subhead">Uma entrada em Novidades</h3>
      <div class="rc-types">
        ${Object.entries(TYPES)
          .map(
            ([id, [tone, label]]) => `<div class="rc-type">
              <span class="ds-badge ds-badge--sm ds-badge--${tone}">${label}</span>
              <p>${TYPE_TEXT[id]}</p>
              <code class="ds-inline-code">'${id}'</code>
            </div>`,
          )
          .join('')}
      </div>
      ${codeBlock(CHANGELOG_CODE)}

      <h3 class="doc-subhead">Depois de publicar <span class="doc-subhead__meta">sem passo manual</span></h3>
      <ul class="rc-after" role="list">
        ${AFTER.map(([ic, text]) => `<li><span class="rc-after__icon">${icon(ic, { size: 18 })}</span><span>${escapeHtml(text)}</span></li>`).join('')}
      </ul>
      <p class="rc-note">Sem calendário fixo: uma versão menor sai quando uma entrega fica pronta; correções saem assim que estão revisadas.</p>`,
    )}

    ${section('rc-pronto', 'Definição de pronto', 'Uma peça só entra numa versão quando tudo isto é verdade.', a11yList(DONE))}

    ${section(
      'rc-faq',
      'Perguntas frequentes',
      '',
      `<div class="rc-faq">
        ${FAQ.map(
          ([q, a]) => `<details class="ds-disclosure rc-faq__item">
            <summary class="ds-inline-action rc-faq__question"><span>${q}</span>${icon('plus', { size: 16, className: 'ds-inline-action__plus' })}</summary>
            <div class="ds-disclosure__content rc-faq__answer"><p>${a}</p></div>
          </details>`,
        ).join('')}
      </div>

      <aside class="rc-cta" aria-label="Próximos passos">
        <div>
          <p class="rc-cta__title">Pronto para começar?</p>
          <p class="rc-cta__text">Veja o que mudou nas últimas versões ou monte sua primeira tela com o Órbita — ${countGroup('componentes')} componentes e ${countGroup('padroes')} padrões esperando.</p>
        </div>
        <div class="rc-cta__actions">
          <a class="ds-btn ds-btn--secondary" href="#/novidades">${icon('megaphone', { size: 18 })}Ver Novidades</a>
          <a class="ds-btn ds-btn--primary" href="#/primeiros-passos">Primeiros passos${icon('arrow-right', { size: 18 })}</a>
        </div>
      </aside>`,
    )}
  </div>`;
}

/* ───────── Comportamento ───────── */

export function mount(root) {
  const cleanups = [mountDocNav(root), mountCodeCopy(root)];

  /* Ajudante de decisão */
  const decide = root.querySelector('[data-rc-decide]');
  const result = decide.querySelector('[data-rc-result]');
  const fieldsets = [...decide.querySelectorAll('[data-question]')];

  function evaluate() {
    let outcome = null;
    let reached = 0;
    for (const [i, q] of QUESTIONS.entries()) {
      reached = i;
      const answer = decide.querySelector(`input[name="rc-q-${q.id}"]:checked`)?.value;
      if (!answer) break;
      const next = answer === 'sim' ? q.yes : q.no;
      if (next) {
        outcome = next;
        break;
      }
      reached = i + 1;
    }
    fieldsets.forEach((fs, i) => {
      const show = i <= reached;
      fs.hidden = !show;
      if (!show) fs.querySelectorAll('input').forEach((input) => (input.checked = false));
    });
    result.innerHTML = outcome ? resultHtml(outcome) : '';
    decide.toggleAttribute('data-done', !!outcome);
    return reached;
  }

  const onDecideChange = (event) => {
    if (!event.target.matches('input[type="radio"]')) return;
    const before = fieldsets.filter((fs) => !fs.hidden).length;
    evaluate();
    // a próxima pergunta recebe o foco, para quem navega pelo teclado seguir em frente
    const visible = fieldsets.filter((fs) => !fs.hidden);
    if (visible.length > before && !decide.hasAttribute('data-done')) visible.at(-1).querySelector('input')?.focus();
  };
  const onDecideClick = (event) => {
    if (event.target.closest('[data-rc-restart]')) {
      decide.querySelectorAll('input').forEach((input) => (input.checked = false));
      evaluate();
      fieldsets[0].querySelector('input')?.focus();
    }
    const goto = event.target.closest('[data-rc-goto]');
    if (goto) {
      const target = root.querySelector(`#${goto.dataset.rcGoto}`);
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      // o foco vai para o botão de copiar o modelo — o próximo passo natural
      root.querySelector('[data-rc-template] [data-copy-code]')?.focus({ preventScroll: true });
    }
  };
  decide.addEventListener('change', onDecideChange);
  decide.addEventListener('click', onDecideClick);
  cleanups.push(() => {
    decide.removeEventListener('change', onDecideChange);
    decide.removeEventListener('click', onDecideClick);
  });
  evaluate();

  /* Checklist da revisão — progresso só na memória da página */
  const review = root.querySelector('[data-rc-review]');
  const checks = [...review.querySelectorAll('[data-rc-check]')];
  const meter = review.querySelector('[data-rc-meter]');
  const fill = review.querySelector('[data-rc-fill]');
  const count = review.querySelector('[data-rc-count]');
  const done = review.querySelector('[data-rc-done]');

  function syncReview() {
    const n = checks.filter((c) => c.checked).length;
    count.textContent = String(n);
    fill.style.setProperty('--value', String(n / TOTAL));
    meter.setAttribute('aria-valuenow', String(n));
    meter.setAttribute('aria-valuetext', `${n} de ${TOTAL} itens conferidos`);
    meter.classList.toggle('ds-meter--success', n === TOTAL);
    for (const g of CHECKLIST) {
      const own = checks.filter((c) => c.dataset.rcCheck === g.id);
      review.querySelector(`[data-rc-group-count="${g.id}"]`).textContent = `${own.filter((c) => c.checked).length}/${own.length}`;
    }
    done.innerHTML =
      n === TOTAL
        ? `<div class="ds-alert ds-alert--success ds-alert--compact"><span class="ds-alert__icon">${icon('check-circle', { size: 20 })}</span><div class="ds-alert__body"><p class="ds-alert__title">Pronto para aprovar</p><p class="ds-alert__text">Os ${TOTAL} itens foram conferidos. Falta só a entrada em Novidades.</p></div></div>`
        : '';
  }

  const onReviewChange = (event) => {
    if (event.target.matches('[data-rc-check]')) syncReview();
  };
  const onClear = () => {
    checks.forEach((c) => (c.checked = false));
    syncReview();
    checks[0]?.focus();
  };
  const clearBtn = review.querySelector('[data-rc-clear]');
  review.addEventListener('change', onReviewChange);
  clearBtn.addEventListener('click', onClear);
  cleanups.push(() => {
    review.removeEventListener('change', onReviewChange);
    clearBtn.removeEventListener('click', onClear);
  });
  syncReview();

  return () => cleanups.forEach((fn) => fn());
}
