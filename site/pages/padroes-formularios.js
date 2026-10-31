import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { enhanceForm } from '../../ds/js/form.js';
import { mountSelects } from '../../ds/js/select.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-formularios.css'];

/* ───────── Dados ───────── */

const TEAMS = ['Pagamentos', 'Cartões', 'Investimentos', 'Seguros', 'Plataforma'];
const TAKEN = new Set(['pagamentos', 'cartoes', 'orbita', 'admin']);

const RULES = [
  ['required', 'Preencha este campo. · Escolha uma opção. · Marque esta opção para continuar.'],
  ['type="email"', 'Use um e-mail no formato nome@empresa.com.'],
  ['type="url"', 'Use um endereço completo, que comece com https://.'],
  ['minlength', 'Use pelo menos 3 caracteres (faltam 1).'],
  ['data-max', 'Use no máximo 40 caracteres (sobram 2). — o contador acompanha'],
  ['min · max', 'Use um valor a partir de 1. · Use um valor até 99.'],
  ['pattern', 'O texto do atributo title — escreva-o como instrução.'],
  ['data-min (fieldset)', 'Marque pelo menos 2.'],
  ['rules (JS)', 'Qualquer regra sua: devolva a mensagem, ou null quando estiver tudo certo.'],
];

const WRITING = [
  ['Campo vazio', 'Obrigatório', 'Preencha o nome do projeto.'],
  ['Formato', 'E-mail inválido', 'Use um e-mail no formato nome@empresa.com.'],
  ['Tamanho', 'Mínimo 8', 'Use pelo menos 8 caracteres — faltam 3.'],
  ['Conflito', 'Erro 409', 'Esse endereço já está em uso. Que tal pagamentos-2?'],
  ['Data', 'Data inválida', 'Use dia, mês e ano, como 31/10/2026.'],
  ['Servidor', 'Ocorreu um erro inesperado!', 'Não conseguimos salvar agora. Seus dados continuam aqui — tente de novo.'],
];

const MODES = [
  ['blur', 'Ao sair do campo', 'Padrão. O erro aparece quando a pessoa termina — nunca no meio da digitação.'],
  ['submit', 'Ao enviar', 'Tudo de uma vez, com o resumo no topo. Bom para formulários curtos.'],
  ['input', 'A cada tecla', 'Evite: acusa erro na primeira letra, antes de a pessoa terminar.'],
];

const errorContrast = (() => {
  const c = contrast.find((x) => x.fg === 'color.danger.fg' && x.bg === 'color.danger.subtle' && x.mode === 'dark');
  return c ? c.ratio.toFixed(1).replace('.', ',') : '—';
})();

/* ───────── Peças ───────── */

function textField({ id, name = id, label, type = 'text', required = true, optional = !required, hint, max, minlength, pattern, title, affix, placeholder, autocomplete, multiline, rows = 3, value = '', errors = {}, className = '' }) {
  const hintId = hint ? `${id}-hint` : null;
  const attrs = [
    `id="${id}"`,
    `name="${name}"`,
    multiline ? '' : `type="${type}"`,
    required ? 'required' : '',
    minlength ? `minlength="${minlength}"` : '',
    max ? `data-max="${max}"` : '',
    pattern ? `pattern="${escapeHtml(pattern)}"` : '',
    title ? `title="${escapeHtml(title)}"` : '',
    placeholder ? `placeholder="${escapeHtml(placeholder)}"` : '',
    autocomplete ? `autocomplete="${autocomplete}"` : '',
    hintId ? `aria-describedby="${hintId}"` : '',
    'spellcheck="false"',
    ...Object.entries(errors).map(([k, v]) => `data-error-${k}="${escapeHtml(v)}"`),
  ]
    .filter(Boolean)
    .join(' ');
  const control = multiline
    ? `<textarea class="ds-field__input" rows="${rows}" ${attrs}>${escapeHtml(value)}</textarea>`
    : `<input class="ds-field__input" ${attrs}${value ? ` value="${escapeHtml(value)}"` : ''}>`;
  const footer =
    hint || max
      ? `<div class="ds-form-field__footer">${hint ? `<p class="ds-form-field__hint" id="${hintId}">${hint}</p>` : ''}${max ? `<span class="ds-form-field__counter" aria-hidden="true">0/${max}</span>` : ''}</div>`
      : '';
  return `<div class="ds-form-field${className ? ` ${className}` : ''}">
    <label class="ds-form-field__label" for="${id}">${label}${optional ? '<span class="ds-form-field__optional">opcional</span>' : ''}</label>
    <div class="ds-field${multiline ? ' ds-field--multiline' : ''}">${affix ? `<span class="ds-field__affix" aria-hidden="true">${affix}</span>` : ''}${control}</div>
    ${footer}
  </div>`;
}

function selectField({ id, label, options, hint, placeholder = 'Escolha…', required = true }) {
  return `<div class="ds-form-field">
    <label class="ds-form-field__label" for="${id}">${label}${required ? '' : '<span class="ds-form-field__optional">opcional</span>'}</label>
    <select id="${id}" name="${id}" data-ds-select ${required ? 'required' : ''}${hint ? ` aria-describedby="${id}-hint"` : ''}>
      <option value="">${placeholder}</option>
      ${options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}
    </select>
    ${hint ? `<div class="ds-form-field__footer"><p class="ds-form-field__hint" id="${id}-hint">${hint}</p></div>` : ''}
  </div>`;
}

const radio = (name, value, label, desc, checked) => `<label class="ds-radio">
    <input type="radio" class="ds-radio__input" name="${name}" value="${value}"${checked ? ' checked' : ''}>
    <span class="ds-choice__text"><span class="ds-choice__label">${label}</span>${desc ? `<span class="ds-choice__description">${desc}</span>` : ''}</span>
  </label>`;

const checkbox = ({ id, name = id, label, desc, required, checked }) => `<label class="ds-checkbox">
    <input type="checkbox" class="ds-checkbox__input" id="${id}" name="${name}"${required ? ' required' : ''}${checked ? ' checked' : ''}>
    <span class="ds-choice__text"><span class="ds-choice__label">${label}</span>${desc ? `<span class="ds-choice__description">${desc}</span>` : ''}</span>
  </label>`;

const legend = (n, text) => `<legend class="ds-form__legend"><span class="ds-section__stamp">${n}</span>${text}</legend>`;

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

const example = (name, text, preview, cls = '') => `<article class="cd-example${cls ? ` ${cls}` : ''}">
    <div class="cd-example__preview pf-example__preview" inert>${preview}</div>
    <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
  </article>`;

/* ───────── Exemplo ao vivo ───────── */

function demoForm() {
  return `<form class="ds-form pf-demo__form" id="pf-demo" aria-labelledby="pf-demo-title">
    <header class="pf-demo__head">
      <p class="ds-panel__eyebrow">Novo projeto</p>
      <h3 class="pf-demo__title" id="pf-demo-title">Criar projeto</h3>
      <p class="ds-form__note">Todos os campos são obrigatórios, exceto os marcados como opcionais.</p>
    </header>
    <div data-form-summary></div>

    <fieldset class="ds-form__section">
      ${legend('01', 'Sobre o projeto')}
      <div class="ds-form__row">
        ${textField({ id: 'pf-demo-nome', name: 'nome', label: 'Nome do projeto', minlength: 3, max: 40, hint: 'Aparece no menu e na busca.', autocomplete: 'off', errors: { required: 'Dê um nome ao projeto.' } })}
        ${textField({
          id: 'pf-demo-endereco',
          name: 'endereco',
          label: 'Endereço',
          affix: 'orbita.app/',
          pattern: '[a-z0-9]+(-[a-z0-9]+)*',
          title: 'Use letras minúsculas, números e hífen, como time-de-pagamentos.',
          hint: 'Letras minúsculas, números e hífen.',
          autocomplete: 'off',
          errors: { required: 'Escolha um endereço para o projeto.' },
        })}
      </div>
      ${textField({ id: 'pf-demo-descricao', name: 'descricao', label: 'Descrição', required: false, multiline: true, max: 160, hint: 'Uma frase sobre o objetivo. Ajuda quem chega depois.' })}
    </fieldset>

    <fieldset class="ds-form__section">
      ${legend('02', 'Time e acesso')}
      <div class="ds-form__row">
        ${selectField({ id: 'pf-demo-time', label: 'Time', options: TEAMS, placeholder: 'Escolha o time', hint: 'Quem cuida do projeto no dia a dia.' })}
        ${textField({ id: 'pf-demo-email', name: 'email', type: 'email', label: 'E-mail para avisos', autocomplete: 'email', hint: 'Mandamos o resumo semanal para cá.', errors: { required: 'Informe um e-mail para receber os avisos.' } })}
      </div>
      <fieldset class="ds-choice-group">
        <legend class="ds-choice-group__legend">Visibilidade</legend>
        <div class="ds-choice-group__items pf-demo__choices">
          ${radio('visibilidade', 'privado', 'Privado', 'Só quem você convidar.', true)}
          ${radio('visibilidade', 'time', 'Time', 'Todo mundo do time escolhido.')}
          ${radio('visibilidade', 'empresa', 'Empresa', 'Qualquer pessoa com conta.')}
        </div>
      </fieldset>
      <label class="ds-switch ds-switch--end pf-demo__switch">
        <input type="checkbox" role="switch" class="ds-switch__input" name="resumo" checked>
        <span class="ds-choice__text"><span class="ds-choice__label">Resumo semanal por e-mail</span><span class="ds-choice__description">Toda segunda, com o que mudou no projeto.</span></span>
      </label>
    </fieldset>

    <fieldset class="ds-form__section">
      ${legend('03', 'Confirmação')}
      <div>${checkbox({ id: 'pf-demo-termos', name: 'termos', label: 'Li e aceito as regras de uso', desc: 'Projetos ficam visíveis para auditoria interna.', required: true })}</div>
    </fieldset>

    <div class="ds-form__actions">
      <button type="reset" class="ds-btn ds-btn--secondary">Limpar</button>
      <button type="submit" class="ds-btn ds-btn--primary" data-demo-submit>${icon('plus', { size: 18 })}<span>Criar projeto</span></button>
    </div>
  </form>`;
}

/* ───────── Validação: comparar os momentos ───────── */

function modeDemo() {
  return `<div class="pf-modes">
    <div class="pf-modes__bar">
      <span class="pf-modes__label" id="pf-modes-label">Validar</span>
      <div class="ds-segmented" role="radiogroup" aria-labelledby="pf-modes-label">
        ${MODES.map(([id, label], i) => `<button type="button" class="ds-segmented__item pf-modes__item" role="radio" data-mode="${id}" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}
      </div>
    </div>
    <p class="pf-modes__desc" data-mode-desc>${MODES[0][2]}</p>
    <form class="pf-modes__form" id="pf-val" novalidate>
      ${textField({ id: 'pf-val-email', name: 'email', type: 'email', label: 'E-mail de trabalho', autocomplete: 'email', hint: 'Digite “ana” e saia do campo — ou envie.' })}
      <button type="submit" class="ds-btn ds-btn--secondary pf-modes__submit">Enviar</button>
    </form>
  </div>`;
}

/* ───────── Mensagens de erro (estáticos) ───────── */

const errorAnatomy = `<div class="pf-anatomy" inert>
  <div class="pf-anatomy__form">
    <span class="pf-pin" data-num="1"></span>
    <div class="ds-alert ds-alert--danger">
      <span class="ds-alert__icon">${icon('alert-circle', { size: 18 })}</span>
      <div class="ds-alert__body">
        <p class="ds-alert__title">Revise 2 campos para continuar</p>
        <ul class="ds-alert__list" role="list"><li><a href="#pf-ex-nome">Nome do projeto: dê um nome ao projeto</a></li><li><a href="#pf-ex-mail">E-mail para avisos: use um e-mail no formato nome@empresa.com</a></li></ul>
      </div>
    </div>
    <div class="ds-form-field pf-anatomy__field">
      <label class="ds-form-field__label" for="pf-ex-nome">Nome do projeto</label>
      <div class="ds-field"><span class="pf-pin pf-pin--inline" data-num="3"></span><input class="ds-field__input" id="pf-ex-nome" aria-invalid="true" tabindex="-1"></div>
      <div class="ds-form-field__footer"><p class="ds-form-field__error"><span class="pf-pin pf-pin--inline" data-num="2"></span>${icon('alert-circle', { size: 16 })}<span>Dê um nome ao projeto.</span></p></div>
    </div>
  </div>
  <ol class="pf-anatomy__list" role="list">
    <li><span class="pf-pin pf-pin--static" data-num="1"></span><div><strong>Resumo no topo.</strong> Recebe o foco ao enviar e diz quantos campos faltam. Cada linha é um link que leva ao campo.</div></li>
    <li><span class="pf-pin pf-pin--static" data-num="2"></span><div><strong>Erro embaixo do campo.</strong> Ícone e texto em <code class="ds-inline-code">danger.fg</code>, no lugar da dica. Diz como resolver.</div></li>
    <li><span class="pf-pin pf-pin--static" data-num="3"></span><div><strong>Campo marcado.</strong> Contorno de perigo e <code class="ds-inline-code">aria-invalid="true"</code>. Some assim que a pessoa corrige.</div></li>
  </ol>
</div>`;

const alertTones = [
  ['danger', 'alert-circle', 'Não conseguimos criar o projeto', 'Seus dados continuam aqui. Tente de novo em alguns segundos.', `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm">${icon('refresh', { size: 16 })}Tentar de novo</button><span class="ds-alert__meta">Erro 503 · 14:32</span>`],
  ['warning', 'alert-triangle', 'O endereço muda os links antigos', 'Quem tiver o link anterior vai cair numa página de aviso por 30 dias.', ''],
  ['success', 'check-circle', 'Rascunho salvo', 'Você pode fechar e continuar depois, de qualquer aparelho.', ''],
  ['info', 'info', 'Convites vão por e-mail', 'Quem ainda não tem conta recebe um link para criar.', ''],
];

const alertsPreview = `<div class="pf-alerts" inert>
  ${alertTones
    .map(
      ([tone, ic, title, text, actions]) => `<div class="ds-alert ds-alert--${tone}">
        <span class="ds-alert__icon">${icon(ic, { size: 18 })}</span>
        <div class="ds-alert__body"><p class="ds-alert__title">${title}</p><p class="ds-alert__text">${text}</p>${actions ? `<div class="ds-alert__actions">${actions}</div>` : ''}</div>
      </div>`,
    )
    .join('')}
  <div class="ds-alert ds-alert--compact">
    <span class="ds-alert__icon">${icon('info', { size: 18 })}</span>
    <div class="ds-alert__body"><p class="ds-alert__title">Compacto</p><p class="ds-alert__text">uma linha, dentro de painéis.</p></div>
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-alert__close" aria-label="Fechar aviso">${icon('x', { size: 16 })}</button>
  </div>
</div>`;

/* ───────── Ações (estáticos) ───────── */

const actionsExamples = [
  [
    'Principal à direita',
    'O olho termina a leitura à direita, onde está a ação que conclui. Cancelar fica ao lado, mais discreto.',
    `<div class="ds-form__actions pf-actions-demo"><button type="button" class="ds-btn ds-btn--secondary">Cancelar</button><button type="button" class="ds-btn ds-btn--primary">Salvar alterações</button></div>`,
  ],
  [
    'Destrutiva longe da principal',
    'Excluir vai para a outra ponta, com o tom de perigo — e sempre pede confirmação.',
    `<div class="ds-form__actions pf-actions-demo"><button type="button" class="ds-btn ds-btn--ghost pf-danger-ghost ds-form__actions-start">${icon('trash', { size: 18 })}Excluir projeto</button><button type="button" class="ds-btn ds-btn--secondary">Cancelar</button><button type="button" class="ds-btn ds-btn--primary">Salvar</button></div>`,
  ],
  [
    'Enviando',
    'O botão diz o que está acontecendo e não aceita um segundo clique. O resto do formulário continua legível.',
    `<div class="ds-form__actions pf-actions-demo"><button type="button" class="ds-btn ds-btn--secondary">Cancelar</button><button type="button" class="ds-btn ds-btn--primary" aria-disabled="true" data-busy>${icon('loader', { size: 18, className: 'pf-spin' })}Criando…</button></div>`,
  ],
  [
    'No celular',
    'As ações ocupam a largura e a principal sobe para o topo, perto do polegar e do fim da leitura.',
    `<div class="pf-phone"><div class="ds-form__actions pf-actions-demo pf-actions-demo--stacked"><button type="button" class="ds-btn ds-btn--primary">Salvar alterações</button><button type="button" class="ds-btn ds-btn--secondary">Cancelar</button></div></div>`,
  ],
];

/* ───────── Formulário longo ───────── */

function longForm() {
  return `<div class="pf-long" role="region" aria-label="Exemplo de formulário longo com ações fixas" tabindex="0">
    <form class="ds-form pf-long__form" id="pf-long" novalidate>
      <fieldset class="ds-form__section">
        ${legend('01', 'Dados da empresa')}
        <div class="ds-form__row">
          ${textField({ id: 'pf-long-razao', name: 'razao', label: 'Razão social', value: 'Órbita Tecnologia Ltda.', required: false, optional: false })}
          ${textField({ id: 'pf-long-fantasia', name: 'fantasia', label: 'Nome fantasia', value: 'Órbita', required: false, optional: false })}
        </div>
      </fieldset>
      <fieldset class="ds-form__section">
        ${legend('02', 'Endereço')}
        <div class="ds-form__row pf-long__cep">
          ${textField({ id: 'pf-long-cep', name: 'cep', label: 'CEP', value: '01310-100', required: false, optional: false, className: 'pf-w-short' })}
          <span></span>
        </div>
        ${textField({ id: 'pf-long-rua', name: 'rua', label: 'Rua', value: 'Avenida Paulista', required: false, optional: false })}
        <div class="ds-form__row ds-form__row--3">
          ${textField({ id: 'pf-long-numero', name: 'numero', label: 'Número', value: '1000', required: false, optional: false })}
          ${textField({ id: 'pf-long-cidade', name: 'cidade', label: 'Cidade', value: 'São Paulo', required: false, optional: false })}
          ${textField({ id: 'pf-long-uf', name: 'uf', label: 'UF', value: 'SP', required: false, optional: false })}
        </div>
      </fieldset>
      <fieldset class="ds-form__section">
        ${legend('03', 'Faturamento')}
        ${textField({ id: 'pf-long-email', name: 'emailfat', type: 'email', label: 'E-mail para notas fiscais', value: 'financeiro@orbita.app', required: false, optional: false })}
        ${textField({ id: 'pf-long-obs', name: 'obs', label: 'Observações', required: false, optional: false, multiline: true, hint: 'Vai impressa na nota.' })}
      </fieldset>
      <div class="ds-form__actions ds-form__actions--sticky">
        <span class="ds-form__actions-meta" data-long-status role="status">Nenhuma alteração</span>
        <button type="reset" class="ds-btn ds-btn--secondary">Descartar</button>
        <button type="submit" class="ds-btn ds-btn--primary">Salvar</button>
      </div>
    </form>
  </div>`;
}

/* ───────── Código ───────── */

const HTML_CODE = `<form class="ds-form" id="projeto" novalidate>
  <div data-form-summary></div>

  <fieldset class="ds-form__section">
    <legend class="ds-form__legend"><span class="ds-section__stamp">01</span>Sobre o projeto</legend>
    <div class="ds-form__row">
      <div class="ds-form-field">
        <label class="ds-form-field__label" for="nome">Nome do projeto</label>
        <div class="ds-field"><input class="ds-field__input" id="nome" name="nome"
          required minlength="3" data-max="40" aria-describedby="nome-dica"></div>
        <div class="ds-form-field__footer">
          <p class="ds-form-field__hint" id="nome-dica">Aparece no menu e na busca.</p>
          <span class="ds-form-field__counter" aria-hidden="true">0/40</span>
        </div>
      </div>
      <!-- outro campo… -->
    </div>
  </fieldset>

  <div class="ds-form__actions">
    <button type="reset" class="ds-btn ds-btn--secondary">Cancelar</button>
    <button type="submit" class="ds-btn ds-btn--primary">Criar projeto</button>
  </div>
</form>`;

const JS_CODE = `import { enhanceForm } from './ds/js/form.js';

const form = enhanceForm(document.querySelector('#projeto'), {
  rules: {
    // regra sua: devolva a mensagem, ou null quando estiver tudo certo
    endereco: (valor) => (ocupados.has(valor) ? 'Esse endereço já está em uso.' : null),
  },
  messages: { nome: { required: 'Dê um nome ao projeto.' } },
  onSubmit: async (dados) => {
    await salvar(dados);
    toast('Projeto criado', { tone: 'success' });
  },
});`;

const API = [
  ['validateOn', "'blur' (padrão) · 'submit' · 'input'", 'Quando mostrar o erro. Com erro na tela, o campo sempre revalida enquanto a pessoa corrige.'],
  ['rules', '{ nome: (valor, el, form) => string | null }', 'Regras próprias, depois das nativas. Pode ser uma lista.'],
  ['messages', "{ nome: { required: '…' } }", 'Troca a mensagem de uma regra. No HTML: data-error-required, data-error-email…'],
  ['summary', 'true · Element · false', 'Resumo de erros no topo (em [data-form-summary] ou no início do form).'],
  ['onSubmit', '(dados, form) => void', 'Só roda com tudo válido. dados vem do FormData; nomes repetidos viram lista.'],
  ['onInvalid', '(erros) => void', 'Roda quando o envio para por erro: [{ name, label, message }].'],
  ['validate()', 'boolean', 'Valida tudo e mostra os erros, sem mover o foco.'],
  ['reset() · destroy()', '', 'Limpa valores, erros e o resumo · desliga tudo.'],
];

/* ───────── Página ───────── */

const NAV = [
  ['pf-exemplo', 'Exemplo'],
  ['pf-layout', 'Layout'],
  ['pf-validacao', 'Validação'],
  ['pf-erros', 'Mensagens de erro'],
  ['pf-acoes', 'Ações'],
  ['pf-longo', 'Formulário longo'],
  ['pf-acessibilidade', 'Acessibilidade'],
  ['pf-codigo', 'Código'],
  ['pf-uso', 'Uso'],
];

export default function renderFormularios(page) {
  return `
  <div class="page doc pf-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Formulários</h1>
        <p class="doc-header__lead">Pedir informação sem fazer a pessoa adivinhar: um rótulo claro por campo, a dica antes do erro e erros que dizem como resolver — no momento certo.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">regras nativas</dt><dd class="doc-stat__value">9</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">momentos de validar</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">ação principal</dt><dd class="doc-stat__value">1</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">contraste do erro</dt><dd class="doc-stat__value">${errorContrast}:1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'pf-exemplo',
      'Exemplo ao vivo',
      'Um formulário de verdade, com <code class="ds-inline-code">enhanceForm</code>. Envie vazio, digite “ab” no nome, tente o endereço “pagamentos” — e veja o erro sumir enquanto corrige.',
      `<div class="pf-stage">
        <div class="ds-panel pf-demo">${demoForm()}</div>
      </div>
      <ul class="pf-tries" role="list">
        <li>${icon('corner-down-left', { size: 16 })}Envie vazio: o resumo recebe o foco e cada link leva ao campo.</li>
        <li>${icon('pencil', { size: 16 })}Erro só ao sair do campo — e some na primeira tecla certa.</li>
        <li>${icon('check-circle', { size: 16 })}Com tudo certo, o toast confirma e o formulário volta ao começo.</li>
      </ul>`,
    )}

    ${section(
      'pf-layout',
      'Layout',
      'Uma coluna, de cima para baixo, na ordem em que a pessoa pensa. O layout responde a uma pergunta: qual é a próxima coisa a preencher?',
      `<div class="cd-grid pf-layout-grid">
        ${example(
          'Uma coluna, rótulo em cima',
          'O olho desce numa linha só. Rótulo ao lado do campo obriga a ler em zigue-zague — e não cabe no celular.',
          `<div class="pf-mini">${textField({ id: 'pf-ex-l1', label: 'Nome completo', required: true })}${textField({ id: 'pf-ex-l2', label: 'E-mail', required: true })}</div>`,
        )}
        ${example(
          'Lado a lado, só o que anda junto',
          'Cidade e UF, início e fim, nome e sobrenome. Use <code class="ds-inline-code">.ds-form__row</code>; no celular vira uma coluna.',
          `<div class="pf-mini"><div class="ds-form__row pf-row-wide">${textField({ id: 'pf-ex-l3', label: 'Cidade' })}${textField({ id: 'pf-ex-l4', label: 'UF', className: 'pf-w-tiny' })}</div></div>`,
        )}
        ${example(
          'A largura conta o tamanho da resposta',
          'CEP curto, rua longa. Um campo largo para quatro dígitos parece pedir mais do que pede.',
          `<div class="pf-mini">${textField({ id: 'pf-ex-l5', label: 'CEP', className: 'pf-w-short' })}${textField({ id: 'pf-ex-l6', label: 'Rua' })}</div>`,
        )}
        ${example(
          'Marque o opcional, não o obrigatório',
          'A maioria dos campos é obrigatória: avise isso uma vez no topo e marque só a exceção com “opcional”. Nada de asterisco.',
          `<div class="pf-mini"><p class="ds-form__note">Todos os campos são obrigatórios, exceto os marcados como opcionais.</p>${textField({ id: 'pf-ex-l7', label: 'Telefone', required: false })}</div>`,
        )}
        ${example(
          'Seções com carimbo',
          'Formulário com mais de seis campos ganha seções numeradas, como no painel: <code class="ds-inline-code">01 · Endereço</code>.',
          `<div class="pf-mini"><fieldset class="ds-form__section">${legend('02', 'Endereço')}${textField({ id: 'pf-ex-l8', label: 'Rua' })}</fieldset></div>`,
        )}
        ${example(
          'A dica fica embaixo, sempre visível',
          'Placeholder some na primeira letra. O que a pessoa precisa saber para acertar vai na dica, que continua lá.',
          `<div class="pf-mini">${textField({ id: 'pf-ex-l9', label: 'Endereço', affix: 'orbita.app/', hint: 'Letras minúsculas, números e hífen.' })}</div>`,
        )}
      </div>`,
    )}

    ${section(
      'pf-validacao',
      'Validação',
      'Valide quando a pessoa termina, não enquanto ela digita. E, com o erro na tela, revalide a cada tecla — ninguém deve corrigir e continuar vendo o erro.',
      `<div class="pf-moments">
        ${[
          ['log-out', 'Ao sair do campo', 'Se a pessoa digitou algo. Passar pelo campo com Tab não acusa nada.'],
          ['corner-down-left', 'Ao enviar', 'Valida tudo, mostra o resumo no topo e leva o foco até ele.'],
          ['check-circle', 'Enquanto corrige', 'Campo com erro revalida a cada tecla — o erro some na hora certa.'],
        ]
          .map(
            ([ic, title, text], i) => `<article class="pf-moment">
              <span class="pf-moment__icon">${icon(ic, { size: 20 })}</span>
              <p class="ds-section__head"><span class="ds-section__stamp">${String(i + 1).padStart(2, '0')}</span><span class="pf-moment__title">${title}</span></p>
              <p class="pf-moment__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>
      <h3 class="doc-subhead">Compare <span class="doc-subhead__meta">o mesmo campo, três momentos</span></h3>
      ${modeDemo()}
      <h3 class="doc-subhead">Regras prontas <span class="doc-subhead__meta">vêm dos atributos do HTML</span></h3>
      <div class="doc-table pf-rules" style="--doc-table-cols: minmax(140px, 0.7fr) minmax(0, 2fr)">
        <div class="doc-table__head" aria-hidden="true"><span>Atributo</span><span>Mensagem padrão</span></div>
        ${RULES.map(([attr, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${escapeHtml(attr)}</code><span class="pf-rules__text">${escapeHtml(text)}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'pf-erros',
      'Mensagens de erro',
      'O erro é uma instrução, não uma bronca: diz o que fazer para seguir. Ícone e texto sempre juntos — a cor sozinha não conta nada para quem não a vê.',
      `${errorAnatomy}
      <h3 class="doc-subhead">Como escrever <span class="doc-subhead__meta">evite → prefira</span></h3>
      <div class="doc-table pf-writing" style="--doc-table-cols: minmax(96px, 0.5fr) minmax(0, 1fr) minmax(0, 1.6fr)">
        <div class="doc-table__head" aria-hidden="true"><span>Situação</span><span>Evite</span><span>Prefira</span></div>
        ${WRITING.map(
          ([situation, bad, good]) => `<div class="doc-table__row">
            <span class="pf-writing__situation">${situation}</span>
            <span class="pf-writing__bad">${icon('x-circle', { size: 16 })}<span>${escapeHtml(bad)}</span></span>
            <span class="pf-writing__good">${icon('check-circle', { size: 16 })}<span>${escapeHtml(good)}</span></span>
          </div>`,
        ).join('')}
      </div>
      <h3 class="doc-subhead">Quando o erro não é de um campo <span class="doc-subhead__meta">.ds-alert</span></h3>
      <p class="pf-lead">Falha ao salvar, conflito, aviso antes de uma mudança: um alerta no topo do formulário, com o tom certo e uma saída.</p>
      ${alertsPreview}`,
    )}

    ${section(
      'pf-acoes',
      'Ações',
      'Uma ação principal, com verbo que diz o que acontece: “Criar projeto”, não “OK”. E o botão de enviar nunca fica desativado — deixe enviar e explique o que falta.',
      `<div class="cd-grid pf-actions-grid">${actionsExamples.map(([name, text, preview]) => example(name, text, preview)).join('')}</div>`,
    )}

    ${section(
      'pf-longo',
      'Formulário longo',
      'Seções numeradas, ações fixas no rodapé e um status do que ainda não foi salvo. Edite um campo abaixo e veja o rodapé acompanhar.',
      `<div class="pf-stage pf-stage--tight">${longForm()}</div>`,
    )}

    ${section(
      'pf-acessibilidade',
      'Acessibilidade',
      'O que <code class="ds-inline-code">enhanceForm</code> e os estilos garantem — e o que fica com você.',
      a11yList([
        ['Rótulo visível e ligado ao campo', 'Todo campo tem <code class="ds-inline-code">&lt;label for&gt;</code>. Placeholder não é rótulo: some ao digitar e tem contraste baixo.'],
        ['Erro ligado ao campo', 'O texto do erro entra no <code class="ds-inline-code">aria-describedby</code> e o campo ganha <code class="ds-inline-code">aria-invalid="true"</code>. A dica continua ligada.'],
        ['Resumo recebe o foco', 'Ao enviar com erro, o foco vai para o resumo; cada link leva ao campo (na seleção, ao gatilho; no grupo, à opção).', ['Tab', 'Enter']],
        ['Nunca só cor', 'Erro tem ícone e texto; o contorno de perigo é reforço. O contraste do texto de erro passa de 4,5:1 nos dois temas.'],
        ['Grupos com fieldset', 'Radios e checkboxes relacionados ficam em <code class="ds-inline-code">&lt;fieldset&gt;</code> com <code class="ds-inline-code">&lt;legend&gt;</code>; o erro do grupo fica ligado ao fieldset.'],
        ['Preenchimento automático', 'Use <code class="ds-inline-code">autocomplete</code> (email, name, postal-code…) e o <code class="ds-inline-code">type</code> certo, que abre o teclado certo no celular.'],
        ['Botão sempre ativo', 'Desativar o envio esconde o motivo. Deixe enviar e mostre o que falta; durante o envio, use <code class="ds-inline-code">aria-disabled</code> e diga “Criando…”.'],
      ]),
    )}

    ${section(
      'pf-codigo',
      'Código',
      'Estrutura em HTML com as classes do formulário; o comportamento vem de uma linha de JS.',
      `<div class="pf-code">
        <div><h3 class="doc-subhead">HTML</h3>${codeBlock(HTML_CODE)}</div>
        <div><h3 class="doc-subhead">JavaScript</h3>${codeBlock(JS_CODE)}</div>
      </div>
      <h3 class="doc-subhead">enhanceForm(form, opções) <span class="doc-subhead__meta">ds/js/form.js</span></h3>
      <div class="doc-table pf-api" style="--doc-table-cols: minmax(130px, 0.6fr) minmax(0, 1fr) minmax(0, 1.4fr)">
        <div class="doc-table__head" aria-hidden="true"><span>Opção ou método</span><span>Valor</span><span>O que faz</span></div>
        ${API.map(([name, value, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${escapeHtml(name)}</code><code class="pf-api__value">${escapeHtml(value)}</code><span class="pf-api__text">${escapeHtml(text)}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'pf-uso',
      'Uso',
      'Seis regras que evitam a maioria dos formulários ruins.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: peça só o necessário</p><p class="usage-card__text">Cada campo a mais é uma razão para desistir. O que dá para descobrir depois, pergunte depois.</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: placeholder como rótulo</p><p class="usage-card__text">Some na primeira letra, e a pessoa esquece o que estava preenchendo no meio da frase.</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}Escolha um padrão seguro</p><p class="usage-card__text">Visibilidade começa em “Privado”. O padrão certo evita uma pergunta — e um erro.</p></article>
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: erro que ensina</p><p class="usage-card__text">“Use pelo menos 8 caracteres — faltam 3” diz o que fazer. “Senha inválida” só diz que errou.</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: limpar o que a pessoa digitou</p><p class="usage-card__text">Em erro, nunca apague os campos. Mantenha tudo e marque só o que precisa mudar.</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}Confirme com toast</p><p class="usage-card__text">Deu certo? Um toast curto (“Projeto criado”) e a tela segue. Modal de sucesso interrompe à toa.</p></article>
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
  };

  cleanups.push(mountSelects(root.querySelector('#pf-demo')));

  /* Exemplo ao vivo */
  const demo = root.querySelector('#pf-demo');
  const submit = demo.querySelector('[data-demo-submit]');
  const demoForm = enhanceForm(demo, {
    rules: {
      endereco: (value) => (TAKEN.has(value) ? `Esse endereço já está em uso. Que tal ${value}-2?` : null),
    },
    onSubmit(data) {
      submit.setAttribute('aria-disabled', 'true');
      submit.dataset.busy = '';
      submit.innerHTML = `${icon('loader', { size: 18, className: 'pf-spin' })}<span>Criando…</span>`;
      later(() => {
        submit.removeAttribute('aria-disabled');
        delete submit.dataset.busy;
        submit.innerHTML = `${icon('plus', { size: 18 })}<span>Criar projeto</span>`;
        toast(`Projeto “${data.nome}” criado`, { tone: 'success' });
        demoForm.reset();
      }, 900);
    },
  });
  // não aceita um segundo envio enquanto cria
  const guard = (event) => {
    if (submit.hasAttribute('data-busy')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  demo.addEventListener('submit', guard, true);
  cleanups.push(() => demo.removeEventListener('submit', guard, true), () => demoForm.destroy());

  /* Momentos de validação */
  const modesEl = root.querySelector('.pf-modes');
  const valForm = root.querySelector('#pf-val');
  const desc = modesEl.querySelector('[data-mode-desc]');
  let valCtrl = null;
  const setMode = (mode, focus) => {
    valCtrl?.destroy();
    valCtrl = enhanceForm(valForm, {
      validateOn: mode,
      summary: false,
      onSubmit: () => toast('E-mail aceito', { tone: 'success' }),
    });
    modesEl.querySelectorAll('[data-mode]').forEach((b) => {
      const on = b.dataset.mode === mode;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    desc.textContent = MODES.find(([id]) => id === mode)[2];
    valForm.reset();
  };
  const onModeClick = (event) => {
    const b = event.target.closest('[data-mode]');
    if (b) setMode(b.dataset.mode);
  };
  const onModeKey = (event) => {
    const b = event.target.closest('[data-mode]');
    if (!b || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const ids = MODES.map(([id]) => id);
    const i = ids.indexOf(b.dataset.mode);
    const next = ids[(i + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + ids.length) % ids.length];
    setMode(next, true);
  };
  modesEl.addEventListener('click', onModeClick);
  modesEl.addEventListener('keydown', onModeKey);
  setMode('blur');
  cleanups.push(() => {
    modesEl.removeEventListener('click', onModeClick);
    modesEl.removeEventListener('keydown', onModeKey);
    valCtrl?.destroy();
  });

  /* Formulário longo: o rodapé conta o que mudou */
  const long = root.querySelector('#pf-long');
  const status = long.querySelector('[data-long-status]');
  const initial = new Map([...long.elements].filter((el) => el.name).map((el) => [el.name, el.value]));
  const count = () => {
    const n = [...long.elements].filter((el) => el.name && el.value !== initial.get(el.name)).length;
    status.textContent = n ? `${n} ${n === 1 ? 'alteração não salva' : 'alterações não salvas'}` : 'Nenhuma alteração';
    status.toggleAttribute('data-dirty', n > 0);
  };
  const onLongSubmit = (event) => {
    event.preventDefault();
    [...long.elements].filter((el) => el.name).forEach((el) => initial.set(el.name, el.value));
    count();
    toast('Alterações salvas', { tone: 'success' });
  };
  const onLongReset = () => later(count, 0);
  long.addEventListener('input', count);
  long.addEventListener('submit', onLongSubmit);
  long.addEventListener('reset', onLongReset);
  cleanups.push(() => {
    long.removeEventListener('input', count);
    long.removeEventListener('submit', onLongSubmit);
    long.removeEventListener('reset', onLongReset);
  });

  cleanups.push(mountDocNav(root), mountCodeCopy(root));

  return () => {
    timers.forEach(clearTimeout);
    cleanups.forEach((fn) => fn?.());
  };
}
