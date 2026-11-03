import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { enhanceForm } from '../../ds/js/form.js';
import { mountSelects } from '../../ds/js/select.js';
import { toast } from '../../ds/js/toast.js';
import { msg, dateFormat } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, escapeHtml } from '../component-doc.js';
import { L, ratio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-formularios.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const TEAMS = () => [L('Pagamentos', 'Payments', 'Pagos'), L('Cartões', 'Cards', 'Tarjetas'), L('Investimentos', 'Investments', 'Inversiones'), L('Seguros', 'Insurance', 'Seguros'), L('Plataforma', 'Platform', 'Plataforma')];
const TAKEN = new Set(['pagamentos', 'cartoes', 'payments', 'cards', 'pagos', 'tarjetas', 'lume', 'admin']);
const takenExample = () => L('pagamentos', 'payments', 'pagos');

const RULES = () => [
  ['required', `${msg('form.required')} · ${msg('form.requiredChoice')} · ${msg('form.requiredCheck')}`],
  ['type="email"', msg('form.email')],
  ['type="url"', msg('form.url')],
  ['minlength', msg('form.minlength', 3, 1)],
  ['data-max', `${msg('form.maxlength', 40, 2)} — ${L('o contador acompanha', 'the counter follows along', 'el contador acompaña')}`],
  ['min · max', `${msg('form.min', 1)} · ${msg('form.max', 99)}`],
  ['pattern', L('O texto do atributo title — escreva-o como instrução.', 'The text of the title attribute — write it as an instruction.', 'El texto del atributo title — escríbelo como instrucción.')],
  ['data-min (fieldset)', msg('form.groupMin', 2)],
  ['rules (JS)', L('Qualquer regra sua: devolva a mensagem, ou null quando estiver tudo certo.', 'Any rule of your own: return the message, or null when everything’s fine.', 'Cualquier regla tuya: devuelve el mensaje, o null cuando todo esté bien.')],
];

const WRITING = () => [
  [L('Campo vazio', 'Empty field', 'Campo vacío'), L('Obrigatório', 'Required', 'Obligatorio'), L('Preencha o nome do projeto.', 'Fill in the project name.', 'Completa el nombre del proyecto.')],
  [L('Formato', 'Format', 'Formato'), L('E-mail inválido', 'Invalid email', 'Correo inválido'), msg('form.email')],
  [L('Tamanho', 'Length', 'Longitud'), L('Mínimo 8', 'Min 8', 'Mínimo 8'), L('Use pelo menos 8 caracteres — faltam 3.', 'Use at least 8 characters — 3 to go.', 'Usa al menos 8 caracteres — faltan 3.')],
  [L('Conflito', 'Conflict', 'Conflicto'), L('Erro 409', 'Error 409', 'Error 409'), L(`Esse endereço já está em uso. Que tal ${takenExample()}-2?`, `That address is already in use. How about ${takenExample()}-2?`, `Esa dirección ya está en uso. ¿Qué tal ${takenExample()}-2?`)],
  [L('Data', 'Date', 'Fecha'), L('Data inválida', 'Invalid date', 'Fecha inválida'), L(`Use dia, mês e ano, como ${dateFormat().format(new Date(2026, 9, 31))}.`, `Use the full date, like ${dateFormat().format(new Date(2026, 9, 31))}.`, `Usa día, mes y año, como ${dateFormat().format(new Date(2026, 9, 31))}.`)],
  [L('Servidor', 'Server', 'Servidor'), L('Ocorreu um erro inesperado!', 'An unexpected error occurred!', '¡Ocurrió un error inesperado!'), L('Não conseguimos salvar agora. Seus dados continuam aqui — tente de novo.', 'We couldn’t save right now. Your data is still here — try again.', 'No pudimos guardar ahora. Tus datos siguen aquí — inténtalo de nuevo.')],
];

const MODES = () => [
  ['blur', L('Ao sair do campo', 'On leaving the field', 'Al salir del campo'), L('Padrão. O erro aparece quando a pessoa termina — nunca no meio da digitação.', 'Default. The error appears when the person is done — never mid-typing.', 'Predeterminado. El error aparece cuando la persona termina — nunca en medio de la escritura.')],
  ['submit', L('Ao enviar', 'On submit', 'Al enviar'), L('Tudo de uma vez, com o resumo no topo. Bom para formulários curtos.', 'All at once, with the summary on top. Good for short forms.', 'Todo de una vez, con el resumen arriba. Bueno para formularios cortos.')],
  ['input', L('A cada tecla', 'On every keystroke', 'Con cada tecla'), L('Evite: acusa erro na primeira letra, antes de a pessoa terminar.', 'Avoid: it flags an error on the first letter, before the person is done.', 'Evítalo: marca error en la primera letra, antes de que la persona termine.')],
];

const errorContrast = (() => {
  const c = contrast.find((x) => x.fg === 'color.danger.fg' && x.bg === 'color.danger.subtle' && x.mode === 'dark');
  return c ? c.ratio : null;
})();

const optionalTag = () => `<span class="ds-form-field__optional">${L('opcional', 'optional', 'opcional')}</span>`;
const projectName = () => L('Nome do projeto', 'Project name', 'Nombre del proyecto');
const giveName = () => L('Dê um nome ao projeto.', 'Give the project a name.', 'Ponle un nombre al proyecto.');
const createProject = () => L('Criar projeto', 'Create project', 'Crear proyecto');
const creating = () => L('Criando…', 'Creating…', 'Creando…');
const addressHint = () => L('Letras minúsculas, números e hífen.', 'Lowercase letters, numbers, and hyphens.', 'Letras minúsculas, números y guion.');
const addressLabel = () => L('Endereço', 'Address', 'Dirección');
const emailLabel = () => L('E-mail para avisos', 'Email for notices', 'Correo para avisos');
const allRequiredNote = () => L('Todos os campos são obrigatórios, exceto os marcados como opcionais.', 'All fields are required, except those marked optional.', 'Todos los campos son obligatorios, excepto los marcados como opcionales.');

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
    <label class="ds-form-field__label" for="${id}">${label}${optional ? optionalTag() : ''}</label>
    <div class="ds-field${multiline ? ' ds-field--multiline' : ''}">${affix ? `<span class="ds-field__affix" aria-hidden="true">${affix}</span>` : ''}${control}</div>
    ${footer}
  </div>`;
}

function selectField({ id, label, options, hint, placeholder = L('Escolha…', 'Choose…', 'Elige…'), required = true }) {
  return `<div class="ds-form-field">
    <label class="ds-form-field__label" for="${id}">${label}${required ? '' : optionalTag()}</label>
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
      <p class="ds-panel__eyebrow">${L('Novo projeto', 'New project', 'Nuevo proyecto')}</p>
      <h3 class="pf-demo__title" id="pf-demo-title">${createProject()}</h3>
      <p class="ds-form__note">${allRequiredNote()}</p>
    </header>
    <div data-form-summary></div>

    <fieldset class="ds-form__section">
      ${legend('01', L('Sobre o projeto', 'About the project', 'Sobre el proyecto'))}
      <div class="ds-form__row">
        ${textField({ id: 'pf-demo-nome', name: 'nome', label: projectName(), minlength: 3, max: 40, hint: L('Aparece no menu e na busca.', 'Shows in the menu and in search.', 'Aparece en el menú y en la búsqueda.'), autocomplete: 'off', errors: { required: giveName() } })}
        ${textField({
          id: 'pf-demo-endereco',
          name: 'endereco',
          label: addressLabel(),
          affix: 'lume.app/',
          pattern: '[a-z0-9]+(-[a-z0-9]+)*',
          title: L('Use letras minúsculas, números e hífen, como time-de-pagamentos.', 'Use lowercase letters, numbers, and hyphens, like payments-team.', 'Usa letras minúsculas, números y guion, como equipo-de-pagos.'),
          hint: addressHint(),
          autocomplete: 'off',
          errors: { required: L('Escolha um endereço para o projeto.', 'Choose an address for the project.', 'Elige una dirección para el proyecto.') },
        })}
      </div>
      ${textField({ id: 'pf-demo-descricao', name: 'descricao', label: L('Descrição', 'Description', 'Descripción'), required: false, multiline: true, max: 160, hint: L('Uma frase sobre o objetivo. Ajuda quem chega depois.', 'One sentence about the goal. It helps whoever comes later.', 'Una frase sobre el objetivo. Ayuda a quien llega después.') })}
    </fieldset>

    <fieldset class="ds-form__section">
      ${legend('02', L('Time e acesso', 'Team and access', 'Equipo y acceso'))}
      <div class="ds-form__row">
        ${selectField({ id: 'pf-demo-time', label: L('Time', 'Team', 'Equipo'), options: TEAMS(), placeholder: L('Escolha o time', 'Choose the team', 'Elige el equipo'), hint: L('Quem cuida do projeto no dia a dia.', 'Who looks after the project day to day.', 'Quién cuida del proyecto día a día.') })}
        ${textField({ id: 'pf-demo-email', name: 'email', type: 'email', label: emailLabel(), autocomplete: 'email', hint: L('Mandamos o resumo semanal para cá.', 'We send the weekly summary here.', 'Enviamos el resumen semanal aquí.'), errors: { required: L('Informe um e-mail para receber os avisos.', 'Enter an email to receive the notices.', 'Indica un correo para recibir los avisos.') } })}
      </div>
      <fieldset class="ds-choice-group">
        <legend class="ds-choice-group__legend">${L('Visibilidade', 'Visibility', 'Visibilidad')}</legend>
        <div class="ds-choice-group__items pf-demo__choices">
          ${radio('visibilidade', 'privado', L('Privado', 'Private', 'Privado'), L('Só quem você convidar.', 'Only people you invite.', 'Solo quien invites.'), true)}
          ${radio('visibilidade', 'time', L('Time', 'Team', 'Equipo'), L('Todo mundo do time escolhido.', 'Everyone on the chosen team.', 'Todo el equipo elegido.'))}
          ${radio('visibilidade', 'empresa', L('Empresa', 'Company', 'Empresa'), L('Qualquer pessoa com conta.', 'Anyone with an account.', 'Cualquier persona con cuenta.'))}
        </div>
      </fieldset>
      <label class="ds-switch ds-switch--end pf-demo__switch">
        <input type="checkbox" role="switch" class="ds-switch__input" name="resumo" checked>
        <span class="ds-choice__text"><span class="ds-choice__label">${L('Resumo semanal por e-mail', 'Weekly email summary', 'Resumen semanal por correo')}</span><span class="ds-choice__description">${L('Toda segunda, com o que mudou no projeto.', 'Every Monday, with what changed in the project.', 'Cada lunes, con lo que cambió en el proyecto.')}</span></span>
      </label>
    </fieldset>

    <fieldset class="ds-form__section">
      ${legend('03', L('Confirmação', 'Confirmation', 'Confirmación'))}
      <div>${checkbox({ id: 'pf-demo-termos', name: 'termos', label: L('Li e aceito as regras de uso', 'I’ve read and accept the usage rules', 'Leí y acepto las reglas de uso'), desc: L('Projetos ficam visíveis para auditoria interna.', 'Projects are visible to internal audit.', 'Los proyectos quedan visibles para auditoría interna.'), required: true })}</div>
    </fieldset>

    <div class="ds-form__actions">
      <button type="reset" class="ds-btn ds-btn--secondary">${L('Limpar', 'Clear', 'Limpiar')}</button>
      <button type="submit" class="ds-btn ds-btn--primary" data-demo-submit>${icon('plus', { size: 18 })}<span>${createProject()}</span></button>
    </div>
  </form>`;
}

/* ───────── Validação: comparar os momentos ───────── */

function modeDemo() {
  const modes = MODES();
  return `<div class="pf-modes">
    <div class="pf-modes__bar">
      <span class="pf-modes__label" id="pf-modes-label">${L('Validar', 'Validate', 'Validar')}</span>
      <div class="ds-segmented" role="radiogroup" aria-labelledby="pf-modes-label">
        ${modes.map(([id, label], i) => `<button type="button" class="ds-segmented__item pf-modes__item" role="radio" data-mode="${id}" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}
      </div>
    </div>
    <p class="pf-modes__desc" data-mode-desc>${modes[0][2]}</p>
    <form class="pf-modes__form" id="pf-val" novalidate>
      ${textField({ id: 'pf-val-email', name: 'email', type: 'email', label: L('E-mail de trabalho', 'Work email', 'Correo de trabajo'), autocomplete: 'email', hint: L('Digite “ana” e saia do campo — ou envie.', 'Type “ana” and leave the field — or submit.', 'Escribe “ana” y sal del campo — o envía.') })}
      <button type="submit" class="ds-btn ds-btn--secondary pf-modes__submit">${L('Enviar', 'Submit', 'Enviar')}</button>
    </form>
  </div>`;
}

/* ───────── Mensagens de erro (estáticos) ───────── */

const errorAnatomy = () => `<div class="pf-anatomy" inert>
  <div class="pf-anatomy__form">
    <span class="pf-pin" data-num="1"></span>
    <div class="ds-alert ds-alert--danger">
      <span class="ds-alert__icon">${icon('alert-circle', { size: 18 })}</span>
      <div class="ds-alert__body">
        <p class="ds-alert__title">${msg('form.summary', 2)}</p>
        <ul class="ds-alert__list" role="list"><li><a href="#pf-ex-nome">${projectName()}: ${giveName().replace(/\.$/, '').toLowerCase()}</a></li><li><a href="#pf-ex-mail">${emailLabel()}: ${msg('form.email').replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())}</a></li></ul>
      </div>
    </div>
    <div class="ds-form-field pf-anatomy__field">
      <label class="ds-form-field__label" for="pf-ex-nome">${projectName()}</label>
      <div class="ds-field"><span class="pf-pin pf-pin--inline" data-num="3"></span><input class="ds-field__input" id="pf-ex-nome" aria-invalid="true" tabindex="-1"></div>
      <div class="ds-form-field__footer"><p class="ds-form-field__error"><span class="pf-pin pf-pin--inline" data-num="2"></span>${icon('alert-circle', { size: 16 })}<span>${giveName()}</span></p></div>
    </div>
  </div>
  <ol class="pf-anatomy__list" role="list">
    <li><span class="pf-pin pf-pin--static" data-num="1"></span><div>${L('<strong>Resumo no topo.</strong> Recebe o foco ao enviar e diz quantos campos faltam. Cada linha é um link que leva ao campo.', '<strong>Summary on top.</strong> It takes focus on submit and says how many fields are left. Each line is a link to the field.', '<strong>Resumen arriba.</strong> Recibe el foco al enviar y dice cuántos campos faltan. Cada línea es un enlace que lleva al campo.')}</div></li>
    <li><span class="pf-pin pf-pin--static" data-num="2"></span><div>${L(`<strong>Erro embaixo do campo.</strong> Ícone e texto em ${ic('danger.fg')}, no lugar da dica. Diz como resolver.`, `<strong>Error below the field.</strong> Icon and text in ${ic('danger.fg')}, in place of the hint. It says how to fix it.`, `<strong>Error debajo del campo.</strong> Ícono y texto en ${ic('danger.fg')}, en lugar de la pista. Dice cómo resolverlo.`)}</div></li>
    <li><span class="pf-pin pf-pin--static" data-num="3"></span><div>${L(`<strong>Campo marcado.</strong> Contorno de perigo e ${ic('aria-invalid="true"')}. Some assim que a pessoa corrige.`, `<strong>Marked field.</strong> Danger outline and ${ic('aria-invalid="true"')}. It goes away as soon as the person fixes it.`, `<strong>Campo marcado.</strong> Contorno de peligro y ${ic('aria-invalid="true"')}. Desaparece en cuanto la persona corrige.`)}</div></li>
  </ol>
</div>`;

const alertTones = () => [
  ['danger', 'alert-circle', L('Não conseguimos criar o projeto', 'We couldn’t create the project', 'No pudimos crear el proyecto'), L('Seus dados continuam aqui. Tente de novo em alguns segundos.', 'Your data is still here. Try again in a few seconds.', 'Tus datos siguen aquí. Inténtalo de nuevo en unos segundos.'), `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm">${icon('refresh', { size: 16 })}${L('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button><span class="ds-alert__meta">${L('Erro 503', 'Error 503', 'Error 503')} · 14:32</span>`],
  ['warning', 'alert-triangle', L('O endereço muda os links antigos', 'The address changes old links', 'La dirección cambia los enlaces antiguos'), L('Quem tiver o link anterior vai cair numa página de aviso por 30 dias.', 'Anyone with the previous link will land on a notice page for 30 days.', 'Quien tenga el enlace anterior caerá en una página de aviso durante 30 días.'), ''],
  ['success', 'check-circle', L('Rascunho salvo', 'Draft saved', 'Borrador guardado'), L('Você pode fechar e continuar depois, de qualquer aparelho.', 'You can close it and continue later, from any device.', 'Puedes cerrar y continuar después, desde cualquier dispositivo.'), ''],
  ['info', 'info', L('Convites vão por e-mail', 'Invites go by email', 'Las invitaciones van por correo'), L('Quem ainda não tem conta recebe um link para criar.', 'Anyone without an account gets a link to create one.', 'Quien aún no tiene cuenta recibe un enlace para crearla.'), ''],
];

const alertsPreview = () => `<div class="pf-alerts" inert>
  ${alertTones()
    .map(
      ([tone, glyph, title, text, actions]) => `<div class="ds-alert ds-alert--${tone}">
        <span class="ds-alert__icon">${icon(glyph, { size: 18 })}</span>
        <div class="ds-alert__body"><p class="ds-alert__title">${title}</p><p class="ds-alert__text">${text}</p>${actions ? `<div class="ds-alert__actions">${actions}</div>` : ''}</div>
      </div>`,
    )
    .join('')}
  <div class="ds-alert ds-alert--compact">
    <span class="ds-alert__icon">${icon('info', { size: 18 })}</span>
    <div class="ds-alert__body"><p class="ds-alert__title">${L('Compacto', 'Compact', 'Compacto')}</p><p class="ds-alert__text">${L('uma linha, dentro de painéis.', 'one line, inside panels.', 'una línea, dentro de paneles.')}</p></div>
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-alert__close" aria-label="${L('Fechar aviso', 'Close notice', 'Cerrar aviso')}">${icon('x', { size: 16 })}</button>
  </div>
</div>`;

/* ───────── Ações (estáticos) ───────── */

const actionsExamples = () => {
  const cancel = L('Cancelar', 'Cancel', 'Cancelar');
  const saveChanges = L('Salvar alterações', 'Save changes', 'Guardar cambios');
  return [
    [
      L('Principal à direita', 'Primary on the right', 'Principal a la derecha'),
      L('O olho termina a leitura à direita, onde está a ação que conclui. Cancelar fica ao lado, mais discreto.', 'The eye finishes reading on the right, where the concluding action is. Cancel sits beside it, quieter.', 'El ojo termina la lectura a la derecha, donde está la acción que concluye. Cancelar queda al lado, más discreto.'),
      `<div class="ds-form__actions pf-actions-demo"><button type="button" class="ds-btn ds-btn--secondary">${cancel}</button><button type="button" class="ds-btn ds-btn--primary">${saveChanges}</button></div>`,
    ],
    [
      L('Destrutiva longe da principal', 'Destructive away from primary', 'Destructiva lejos de la principal'),
      L('Excluir vai para a outra ponta, com o tom de perigo — e sempre pede confirmação.', 'Delete goes to the other end, in the danger tone — and always asks for confirmation.', 'Eliminar va al otro extremo, con el tono de peligro — y siempre pide confirmación.'),
      `<div class="ds-form__actions pf-actions-demo"><button type="button" class="ds-btn ds-btn--ghost pf-danger-ghost ds-form__actions-start">${icon('trash', { size: 18 })}${L('Excluir projeto', 'Delete project', 'Eliminar proyecto')}</button><button type="button" class="ds-btn ds-btn--secondary">${cancel}</button><button type="button" class="ds-btn ds-btn--primary">${L('Salvar', 'Save', 'Guardar')}</button></div>`,
    ],
    [
      L('Enviando', 'Submitting', 'Enviando'),
      L('O botão diz o que está acontecendo e não aceita um segundo clique. O resto do formulário continua legível.', 'The button says what’s happening and doesn’t accept a second click. The rest of the form stays legible.', 'El botón dice qué está pasando y no acepta un segundo clic. El resto del formulario sigue legible.'),
      `<div class="ds-form__actions pf-actions-demo"><button type="button" class="ds-btn ds-btn--secondary">${cancel}</button><button type="button" class="ds-btn ds-btn--primary" aria-disabled="true" data-busy>${icon('loader', { size: 18, className: 'pf-spin' })}${creating()}</button></div>`,
    ],
    [
      L('No celular', 'On phones', 'En el móvil'),
      L('As ações ocupam a largura e a principal sobe para o topo, perto do polegar e do fim da leitura.', 'The actions take the full width and the primary moves to the top, near the thumb and the end of reading.', 'Las acciones ocupan el ancho y la principal sube arriba, cerca del pulgar y del final de la lectura.'),
      `<div class="pf-phone"><div class="ds-form__actions pf-actions-demo pf-actions-demo--stacked"><button type="button" class="ds-btn ds-btn--primary">${saveChanges}</button><button type="button" class="ds-btn ds-btn--secondary">${cancel}</button></div></div>`,
    ],
  ];
};

/* ───────── Formulário longo ───────── */

const noChanges = () => L('Nenhuma alteração', 'No changes', 'Ningún cambio');

function longForm() {
  const plain = { required: false, optional: false };
  return `<div class="pf-long" role="region" aria-label="${L('Exemplo de formulário longo com ações fixas', 'Example of a long form with sticky actions', 'Ejemplo de formulario largo con acciones fijas')}" tabindex="0">
    <form class="ds-form pf-long__form" id="pf-long" novalidate>
      <fieldset class="ds-form__section">
        ${legend('01', L('Dados da empresa', 'Company details', 'Datos de la empresa'))}
        <div class="ds-form__row">
          ${textField({ id: 'pf-long-razao', name: 'razao', label: L('Razão social', 'Legal name', 'Razón social'), value: 'Lume Tecnologia Ltda.', ...plain })}
          ${textField({ id: 'pf-long-fantasia', name: 'fantasia', label: L('Nome fantasia', 'Trade name', 'Nombre comercial'), value: 'Lume', ...plain })}
        </div>
      </fieldset>
      <fieldset class="ds-form__section">
        ${legend('02', addressLabel())}
        <div class="ds-form__row pf-long__cep">
          ${textField({ id: 'pf-long-cep', name: 'cep', label: L('CEP', 'Postal code', 'Código postal'), value: '01310-100', ...plain, className: 'pf-w-short' })}
          <span></span>
        </div>
        ${textField({ id: 'pf-long-rua', name: 'rua', label: L('Rua', 'Street', 'Calle'), value: 'Avenida Paulista', ...plain })}
        <div class="ds-form__row ds-form__row--3">
          ${textField({ id: 'pf-long-numero', name: 'numero', label: L('Número', 'Number', 'Número'), value: '1000', ...plain })}
          ${textField({ id: 'pf-long-cidade', name: 'cidade', label: L('Cidade', 'City', 'Ciudad'), value: 'São Paulo', ...plain })}
          ${textField({ id: 'pf-long-uf', name: 'uf', label: L('UF', 'State', 'Estado'), value: 'SP', ...plain })}
        </div>
      </fieldset>
      <fieldset class="ds-form__section">
        ${legend('03', L('Faturamento', 'Billing', 'Facturación'))}
        ${textField({ id: 'pf-long-email', name: 'emailfat', type: 'email', label: L('E-mail para notas fiscais', 'Email for invoices', 'Correo para facturas'), value: 'financeiro@lume.app', ...plain })}
        ${textField({ id: 'pf-long-obs', name: 'obs', label: L('Observações', 'Notes', 'Observaciones'), ...plain, multiline: true, hint: L('Vai impressa na nota.', 'Printed on the invoice.', 'Va impresa en la factura.') })}
      </fieldset>
      <div class="ds-form__actions ds-form__actions--sticky">
        <span class="ds-form__actions-meta" data-long-status role="status">${noChanges()}</span>
        <button type="reset" class="ds-btn ds-btn--secondary">${L('Descartar', 'Discard', 'Descartar')}</button>
        <button type="submit" class="ds-btn ds-btn--primary">${L('Salvar', 'Save', 'Guardar')}</button>
      </div>
    </form>
  </div>`;
}

/* ───────── Código ───────── */

const htmlCode = () => `<form class="ds-form" id="${L('projeto', 'project', 'proyecto')}" novalidate>
  <div data-form-summary></div>

  <fieldset class="ds-form__section">
    <legend class="ds-form__legend"><span class="ds-section__stamp">01</span>${L('Sobre o projeto', 'About the project', 'Sobre el proyecto')}</legend>
    <div class="ds-form__row">
      <div class="ds-form-field">
        <label class="ds-form-field__label" for="${L('nome', 'name', 'nombre')}">${projectName()}</label>
        <div class="ds-field"><input class="ds-field__input" id="${L('nome', 'name', 'nombre')}" name="${L('nome', 'name', 'nombre')}"
          required minlength="3" data-max="40" aria-describedby="${L('nome-dica', 'name-hint', 'nombre-pista')}"></div>
        <div class="ds-form-field__footer">
          <p class="ds-form-field__hint" id="${L('nome-dica', 'name-hint', 'nombre-pista')}">${L('Aparece no menu e na busca.', 'Shows in the menu and in search.', 'Aparece en el menú y en la búsqueda.')}</p>
          <span class="ds-form-field__counter" aria-hidden="true">0/40</span>
        </div>
      </div>
      <!-- ${L('outro campo…', 'another field…', 'otro campo…')} -->
    </div>
  </fieldset>

  <div class="ds-form__actions">
    <button type="reset" class="ds-btn ds-btn--secondary">${L('Cancelar', 'Cancel', 'Cancelar')}</button>
    <button type="submit" class="ds-btn ds-btn--primary">${createProject()}</button>
  </div>
</form>`;

const jsCode = () => `import { enhanceForm } from './ds/js/form.js';

const form = enhanceForm(document.querySelector('#${L('projeto', 'project', 'proyecto')}'), {
  rules: {
    // ${L('regra sua: devolva a mensagem, ou null quando estiver tudo certo', 'your own rule: return the message, or null when everything’s fine', 'regla tuya: devuelve el mensaje, o null cuando todo esté bien')}
    ${L('endereco', 'address', 'direccion')}: (${L('valor', 'value', 'valor')}) => (${L('ocupados', 'taken', 'ocupadas')}.has(${L('valor', 'value', 'valor')}) ? '${L('Esse endereço já está em uso.', 'That address is already in use.', 'Esa dirección ya está en uso.')}' : null),
  },
  messages: { ${L('nome', 'name', 'nombre')}: { required: '${giveName()}' } },
  onSubmit: async (${L('dados', 'data', 'datos')}) => {
    await ${L('salvar', 'save', 'guardar')}(${L('dados', 'data', 'datos')});
    toast('${L('Projeto criado', 'Project created', 'Proyecto creado')}', { tone: 'success' });
  },
});`;

const API = () => [
  ['validateOn', L("'blur' (padrão) · 'submit' · 'input'", "'blur' (default) · 'submit' · 'input'", "'blur' (predeterminado) · 'submit' · 'input'"), L('Quando mostrar o erro. Com erro na tela, o campo sempre revalida enquanto a pessoa corrige.', 'When to show the error. With an error on screen, the field always revalidates while the person fixes it.', 'Cuándo mostrar el error. Con error en pantalla, el campo siempre revalida mientras la persona corrige.')],
  ['rules', L('{ nome: (valor, el, form) => string | null }', '{ name: (value, el, form) => string | null }', '{ nombre: (valor, el, form) => string | null }'), L('Regras próprias, depois das nativas. Pode ser uma lista.', 'Your own rules, after the native ones. Can be a list.', 'Reglas propias, después de las nativas. Puede ser una lista.')],
  ['messages', L("{ nome: { required: '…' } }", "{ name: { required: '…' } }", "{ nombre: { required: '…' } }"), L('Troca a mensagem de uma regra. No HTML: data-error-required, data-error-email…', 'Replaces a rule’s message. In HTML: data-error-required, data-error-email…', 'Cambia el mensaje de una regla. En el HTML: data-error-required, data-error-email…')],
  ['summary', 'true · Element · false', L('Resumo de erros no topo (em [data-form-summary] ou no início do form).', 'Error summary on top (in [data-form-summary] or at the start of the form).', 'Resumen de errores arriba (en [data-form-summary] o al principio del form).')],
  ['onSubmit', L('(dados, form) => void', '(data, form) => void', '(datos, form) => void'), L('Só roda com tudo válido. dados vem do FormData; nomes repetidos viram lista.', 'Only runs when everything is valid. data comes from FormData; repeated names become a list.', 'Solo se ejecuta con todo válido. datos viene del FormData; los nombres repetidos se vuelven lista.')],
  ['onInvalid', L('(erros) => void', '(errors) => void', '(errores) => void'), L('Roda quando o envio para por erro: [{ name, label, message }].', 'Runs when submission stops because of an error: [{ name, label, message }].', 'Se ejecuta cuando el envío se detiene por error: [{ name, label, message }].')],
  ['validate()', 'boolean', L('Valida tudo e mostra os erros, sem mover o foco.', 'Validates everything and shows the errors, without moving focus.', 'Valida todo y muestra los errores, sin mover el foco.')],
  ['reset() · destroy()', '', L('Limpa valores, erros e o resumo · desliga tudo.', 'Clears values, errors, and the summary · turns everything off.', 'Limpia valores, errores y el resumen · desconecta todo.')],
];

/* ───────── Página ───────── */

const NAV = () => [
  ['pf-exemplo', L('Exemplo', 'Example', 'Ejemplo')],
  ['pf-layout', 'Layout'],
  ['pf-validacao', L('Validação', 'Validation', 'Validación')],
  ['pf-erros', L('Mensagens de erro', 'Error messages', 'Mensajes de error')],
  ['pf-acoes', L('Ações', 'Actions', 'Acciones')],
  ['pf-longo', L('Formulário longo', 'Long form', 'Formulario largo')],
  ['pf-acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
  ['pf-codigo', L('Código', 'Code', 'Código')],
  ['pf-uso', L('Uso', 'Usage', 'Uso')],
];

export default function renderFormularios(page) {
  return `
  <div class="page doc pf-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Pedir informação sem fazer a pessoa adivinhar: um rótulo claro por campo, a dica antes do erro e erros que dizem como resolver — no momento certo.', 'Asking for information without making people guess: one clear label per field, the hint before the error, and errors that say how to fix them — at the right moment.', 'Pedir información sin hacer adivinar a la persona: una etiqueta clara por campo, la pista antes del error y errores que dicen cómo resolverlos — en el momento justo.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('regras nativas', 'native rules', 'reglas nativas')}</dt><dd class="doc-stat__value">9</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('momentos de validar', 'moments to validate', 'momentos de validar')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('ação principal', 'primary action', 'acción principal')}</dt><dd class="doc-stat__value">1</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('contraste do erro', 'error contrast', 'contraste del error')}</dt><dd class="doc-stat__value">${errorContrast ? ratio(errorContrast, 1) : '—'}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'pf-exemplo',
      L('Exemplo ao vivo', 'Live example', 'Ejemplo en vivo'),
      L(`Um formulário de verdade, com ${ic('enhanceForm')}. Envie vazio, digite “ab” no nome, tente o endereço “${takenExample()}” — e veja o erro sumir enquanto corrige.`, `A real form, with ${ic('enhanceForm')}. Submit it empty, type “ab” in the name, try the address “${takenExample()}” — and watch the error disappear as you fix it.`, `Un formulario de verdad, con ${ic('enhanceForm')}. Envíalo vacío, escribe “ab” en el nombre, prueba la dirección “${takenExample()}” — y mira cómo el error desaparece mientras corriges.`),
      `<div class="pf-stage">
        <div class="ds-panel pf-demo">${demoForm()}</div>
      </div>
      <ul class="pf-tries" role="list">
        <li>${icon('corner-down-left', { size: 16 })}${L('Envie vazio: o resumo recebe o foco e cada link leva ao campo.', 'Submit it empty: the summary takes focus and each link leads to the field.', 'Envíalo vacío: el resumen recibe el foco y cada enlace lleva al campo.')}</li>
        <li>${icon('pencil', { size: 16 })}${L('Erro só ao sair do campo — e some na primeira tecla certa.', 'Errors only on leaving the field — and they go away on the first right keystroke.', 'Error solo al salir del campo — y desaparece con la primera tecla correcta.')}</li>
        <li>${icon('check-circle', { size: 16 })}${L('Com tudo certo, o toast confirma e o formulário volta ao começo.', 'With everything right, the toast confirms and the form goes back to the start.', 'Con todo bien, el toast confirma y el formulario vuelve al principio.')}</li>
      </ul>`,
    )}

    ${section(
      'pf-layout',
      'Layout',
      L('Uma coluna, de cima para baixo, na ordem em que a pessoa pensa. O layout responde a uma pergunta: qual é a próxima coisa a preencher?', 'One column, top to bottom, in the order people think. The layout answers one question: what’s the next thing to fill in?', 'Una columna, de arriba abajo, en el orden en que piensa la persona. El layout responde a una pregunta: ¿qué es lo siguiente que hay que completar?'),
      `<div class="cd-grid pf-layout-grid">
        ${example(
          L('Uma coluna, rótulo em cima', 'One column, label on top', 'Una columna, etiqueta arriba'),
          L('O olho desce numa linha só. Rótulo ao lado do campo obriga a ler em zigue-zague — e não cabe no celular.', 'The eye goes down a single line. A label beside the field forces zigzag reading — and doesn’t fit on phones.', 'El ojo baja en una sola línea. La etiqueta al lado del campo obliga a leer en zigzag — y no cabe en el móvil.'),
          `<div class="pf-mini">${textField({ id: 'pf-ex-l1', label: L('Nome completo', 'Full name', 'Nombre completo'), required: true })}${textField({ id: 'pf-ex-l2', label: L('E-mail', 'Email', 'Correo'), required: true })}</div>`,
        )}
        ${example(
          L('Lado a lado, só o que anda junto', 'Side by side, only what goes together', 'Lado a lado, solo lo que va junto'),
          L(`Cidade e UF, início e fim, nome e sobrenome. Use ${ic('.ds-form__row')}; no celular vira uma coluna.`, `City and state, start and end, first and last name. Use ${ic('.ds-form__row')}; on phones it becomes one column.`, `Ciudad y estado, inicio y fin, nombre y apellido. Usa ${ic('.ds-form__row')}; en el móvil se vuelve una columna.`),
          `<div class="pf-mini"><div class="ds-form__row pf-row-wide">${textField({ id: 'pf-ex-l3', label: L('Cidade', 'City', 'Ciudad') })}${textField({ id: 'pf-ex-l4', label: L('UF', 'State', 'Estado'), className: 'pf-w-tiny' })}</div></div>`,
        )}
        ${example(
          L('A largura conta o tamanho da resposta', 'Width tells the size of the answer', 'El ancho cuenta el tamaño de la respuesta'),
          L('CEP curto, rua longa. Um campo largo para quatro dígitos parece pedir mais do que pede.', 'Short postal code, long street. A wide field for four digits seems to ask for more than it does.', 'Código postal corto, calle larga. Un campo ancho para cuatro dígitos parece pedir más de lo que pide.'),
          `<div class="pf-mini">${textField({ id: 'pf-ex-l5', label: L('CEP', 'Postal code', 'Código postal'), className: 'pf-w-short' })}${textField({ id: 'pf-ex-l6', label: L('Rua', 'Street', 'Calle') })}</div>`,
        )}
        ${example(
          L('Marque o opcional, não o obrigatório', 'Mark the optional, not the required', 'Marca lo opcional, no lo obligatorio'),
          L('A maioria dos campos é obrigatória: avise isso uma vez no topo e marque só a exceção com “opcional”. Nada de asterisco.', 'Most fields are required: say so once at the top and mark only the exception as “optional”. No asterisks.', 'La mayoría de los campos son obligatorios: avísalo una vez arriba y marca solo la excepción con “opcional”. Nada de asteriscos.'),
          `<div class="pf-mini"><p class="ds-form__note">${allRequiredNote()}</p>${textField({ id: 'pf-ex-l7', label: L('Telefone', 'Phone', 'Teléfono'), required: false })}</div>`,
        )}
        ${example(
          L('Seções com carimbo', 'Stamped sections', 'Secciones con sello'),
          L(`Formulário com mais de seis campos ganha seções numeradas, como no painel: ${ic('01 · Endereço')}.`, `A form with more than six fields gets numbered sections, like in the panel: ${ic('01 · Address')}.`, `Un formulario con más de seis campos recibe secciones numeradas, como en el panel: ${ic('01 · Dirección')}.`),
          `<div class="pf-mini"><fieldset class="ds-form__section">${legend('02', addressLabel())}${textField({ id: 'pf-ex-l8', label: L('Rua', 'Street', 'Calle') })}</fieldset></div>`,
        )}
        ${example(
          L('A dica fica embaixo, sempre visível', 'The hint sits below, always visible', 'La pista queda debajo, siempre visible'),
          L('Placeholder some na primeira letra. O que a pessoa precisa saber para acertar vai na dica, que continua lá.', 'A placeholder disappears on the first letter. What people need to know to get it right goes in the hint, which stays there.', 'El placeholder desaparece con la primera letra. Lo que la persona necesita saber para acertar va en la pista, que sigue ahí.'),
          `<div class="pf-mini">${textField({ id: 'pf-ex-l9', label: addressLabel(), affix: 'lume.app/', hint: addressHint() })}</div>`,
        )}
      </div>`,
    )}

    ${section(
      'pf-validacao',
      L('Validação', 'Validation', 'Validación'),
      L('Valide quando a pessoa termina, não enquanto ela digita. E, com o erro na tela, revalide a cada tecla — ninguém deve corrigir e continuar vendo o erro.', 'Validate when the person is done, not while they type. And, with the error on screen, revalidate on every keystroke — no one should fix it and keep seeing the error.', 'Valida cuando la persona termina, no mientras escribe. Y, con el error en pantalla, revalida con cada tecla — nadie debería corregir y seguir viendo el error.'),
      `<div class="pf-moments">
        ${[
          ['log-out', L('Ao sair do campo', 'On leaving the field', 'Al salir del campo'), L('Se a pessoa digitou algo. Passar pelo campo com Tab não acusa nada.', 'If the person typed something. Tabbing through the field flags nothing.', 'Si la persona escribió algo. Pasar por el campo con Tab no marca nada.')],
          ['corner-down-left', L('Ao enviar', 'On submit', 'Al enviar'), L('Valida tudo, mostra o resumo no topo e leva o foco até ele.', 'Validates everything, shows the summary on top, and moves focus to it.', 'Valida todo, muestra el resumen arriba y lleva el foco hasta él.')],
          ['check-circle', L('Enquanto corrige', 'While fixing', 'Mientras corrige'), L('Campo com erro revalida a cada tecla — o erro some na hora certa.', 'A field with an error revalidates on every keystroke — the error goes away at the right time.', 'Un campo con error revalida con cada tecla — el error desaparece en el momento justo.')],
        ]
          .map(
            ([glyph, title, text], i) => `<article class="pf-moment">
              <span class="pf-moment__icon">${icon(glyph, { size: 20 })}</span>
              <p class="ds-section__head"><span class="ds-section__stamp">${String(i + 1).padStart(2, '0')}</span><span class="pf-moment__title">${title}</span></p>
              <p class="pf-moment__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>
      <h3 class="doc-subhead">${L('Compare', 'Compare', 'Compara')} <span class="doc-subhead__meta">${L('o mesmo campo, três momentos', 'the same field, three moments', 'el mismo campo, tres momentos')}</span></h3>
      ${modeDemo()}
      <h3 class="doc-subhead">${L('Regras prontas', 'Ready-made rules', 'Reglas listas')} <span class="doc-subhead__meta">${L('vêm dos atributos do HTML', 'they come from HTML attributes', 'vienen de los atributos del HTML')}</span></h3>
      <div class="doc-table pf-rules" style="--doc-table-cols: minmax(140px, 0.7fr) minmax(0, 2fr)">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Atributo', 'Attribute', 'Atributo')}</span><span>${L('Mensagem padrão', 'Default message', 'Mensaje predeterminado')}</span></div>
        ${RULES().map(([attr, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${escapeHtml(attr)}</code><span class="pf-rules__text">${escapeHtml(text)}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'pf-erros',
      L('Mensagens de erro', 'Error messages', 'Mensajes de error'),
      L('O erro é uma instrução, não uma bronca: diz o que fazer para seguir. Ícone e texto sempre juntos — a cor sozinha não conta nada para quem não a vê.', 'An error is an instruction, not a scolding: it says what to do to move on. Icon and text always together — color alone tells nothing to those who can’t see it.', 'El error es una instrucción, no un regaño: dice qué hacer para seguir. Ícono y texto siempre juntos — el color solo no le dice nada a quien no lo ve.'),
      `${errorAnatomy()}
      <h3 class="doc-subhead">${L('Como escrever', 'How to write', 'Cómo escribir')} <span class="doc-subhead__meta">${L('evite → prefira', 'avoid → prefer', 'evita → prefiere')}</span></h3>
      <div class="doc-table pf-writing" style="--doc-table-cols: minmax(96px, 0.5fr) minmax(0, 1fr) minmax(0, 1.6fr)">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Situação', 'Situation', 'Situación')}</span><span>${L('Evite', 'Avoid', 'Evita')}</span><span>${L('Prefira', 'Prefer', 'Prefiere')}</span></div>
        ${WRITING().map(
          ([situation, bad, good]) => `<div class="doc-table__row">
            <span class="pf-writing__situation">${situation}</span>
            <span class="pf-writing__bad">${icon('x-circle', { size: 16 })}<span>${escapeHtml(bad)}</span></span>
            <span class="pf-writing__good">${icon('check-circle', { size: 16 })}<span>${escapeHtml(good)}</span></span>
          </div>`,
        ).join('')}
      </div>
      <h3 class="doc-subhead">${L('Quando o erro não é de um campo', 'When the error isn’t about a field', 'Cuando el error no es de un campo')} <span class="doc-subhead__meta">.ds-alert</span></h3>
      <p class="pf-lead">${L('Falha ao salvar, conflito, aviso antes de uma mudança: um alerta no topo do formulário, com o tom certo e uma saída.', 'A save failure, a conflict, a warning before a change: an alert at the top of the form, with the right tone and a way out.', 'Fallo al guardar, conflicto, aviso antes de un cambio: una alerta arriba del formulario, con el tono justo y una salida.')}</p>
      ${alertsPreview()}`,
    )}

    ${section(
      'pf-acoes',
      L('Ações', 'Actions', 'Acciones'),
      L('Uma ação principal, com verbo que diz o que acontece: “Criar projeto”, não “OK”. E o botão de enviar nunca fica desativado — deixe enviar e explique o que falta.', 'One primary action, with a verb that says what happens: “Create project”, not “OK”. And the submit button is never disabled — let people submit and explain what’s missing.', 'Una acción principal, con un verbo que dice qué pasa: “Crear proyecto”, no “OK”. Y el botón de enviar nunca queda desactivado — deja enviar y explica qué falta.'),
      `<div class="cd-grid pf-actions-grid">${actionsExamples().map(([name, text, preview]) => example(name, text, preview)).join('')}</div>`,
    )}

    ${section(
      'pf-longo',
      L('Formulário longo', 'Long form', 'Formulario largo'),
      L('Seções numeradas, ações fixas no rodapé e um status do que ainda não foi salvo. Edite um campo abaixo e veja o rodapé acompanhar.', 'Numbered sections, sticky actions in the footer, and a status of what isn’t saved yet. Edit a field below and watch the footer follow along.', 'Secciones numeradas, acciones fijas en el pie y un estado de lo que aún no se guardó. Edita un campo abajo y mira cómo el pie acompaña.'),
      `<div class="pf-stage pf-stage--tight">${longForm()}</div>`,
    )}

    ${section(
      'pf-acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L(`O que ${ic('enhanceForm')} e os estilos garantem — e o que fica com você.`, `What ${ic('enhanceForm')} and the styles guarantee — and what’s left to you.`, `Lo que ${ic('enhanceForm')} y los estilos garantizan — y lo que queda contigo.`),
      a11yList([
        [L('Rótulo visível e ligado ao campo', 'A visible label tied to the field', 'Etiqueta visible y vinculada al campo'), L(`Todo campo tem ${ic('&lt;label for&gt;')}. Placeholder não é rótulo: some ao digitar e tem contraste baixo.`, `Every field has a ${ic('&lt;label for&gt;')}. A placeholder isn’t a label: it disappears on typing and has low contrast.`, `Todo campo tiene ${ic('&lt;label for&gt;')}. El placeholder no es etiqueta: desaparece al escribir y tiene contraste bajo.`)],
        [L('Erro ligado ao campo', 'An error tied to the field', 'Error vinculado al campo'), L(`O texto do erro entra no ${ic('aria-describedby')} e o campo ganha ${ic('aria-invalid="true"')}. A dica continua ligada.`, `The error text goes into ${ic('aria-describedby')} and the field gets ${ic('aria-invalid="true"')}. The hint stays connected.`, `El texto del error entra en el ${ic('aria-describedby')} y el campo recibe ${ic('aria-invalid="true"')}. La pista sigue vinculada.`)],
        [L('Resumo recebe o foco', 'The summary takes focus', 'El resumen recibe el foco'), L('Ao enviar com erro, o foco vai para o resumo; cada link leva ao campo (na seleção, ao gatilho; no grupo, à opção).', 'On submitting with errors, focus goes to the summary; each link leads to the field (for a select, to the trigger; for a group, to the option).', 'Al enviar con error, el foco va al resumen; cada enlace lleva al campo (en el selector, al disparador; en el grupo, a la opción).'), ['Tab', 'Enter']],
        [L('Nunca só cor', 'Never color alone', 'Nunca solo color'), L(`Erro tem ícone e texto; o contorno de perigo é reforço. O contraste do texto de erro passa de ${ratio(4.5, 1)} nos dois temas.`, `An error has an icon and text; the danger outline is reinforcement. The error text contrast passes ${ratio(4.5, 1)} in both themes.`, `El error tiene ícono y texto; el contorno de peligro es refuerzo. El contraste del texto de error supera ${ratio(4.5, 1)} en los dos temas.`)],
        [L('Grupos com fieldset', 'Groups with fieldset', 'Grupos con fieldset'), L(`Radios e checkboxes relacionados ficam em ${ic('&lt;fieldset&gt;')} com ${ic('&lt;legend&gt;')}; o erro do grupo fica ligado ao fieldset.`, `Related radios and checkboxes go in a ${ic('&lt;fieldset&gt;')} with a ${ic('&lt;legend&gt;')}; the group’s error is tied to the fieldset.`, `Radios y checkboxes relacionados van en ${ic('&lt;fieldset&gt;')} con ${ic('&lt;legend&gt;')}; el error del grupo queda vinculado al fieldset.`)],
        [L('Preenchimento automático', 'Autofill', 'Autocompletado'), L(`Use ${ic('autocomplete')} (email, name, postal-code…) e o ${ic('type')} certo, que abre o teclado certo no celular.`, `Use ${ic('autocomplete')} (email, name, postal-code…) and the right ${ic('type')}, which opens the right keyboard on phones.`, `Usa ${ic('autocomplete')} (email, name, postal-code…) y el ${ic('type')} correcto, que abre el teclado correcto en el móvil.`)],
        [L('Botão sempre ativo', 'A button that’s always enabled', 'Botón siempre activo'), L(`Desativar o envio esconde o motivo. Deixe enviar e mostre o que falta; durante o envio, use ${ic('aria-disabled')} e diga “Criando…”.`, `Disabling submit hides the reason. Let people submit and show what’s missing; while submitting, use ${ic('aria-disabled')} and say “Creating…”.`, `Desactivar el envío esconde el motivo. Deja enviar y muestra qué falta; durante el envío, usa ${ic('aria-disabled')} y di “Creando…”.`)],
      ]),
    )}

    ${section(
      'pf-codigo',
      L('Código', 'Code', 'Código'),
      L('Estrutura em HTML com as classes do formulário; o comportamento vem de uma linha de JS.', 'Structure in HTML with the form classes; the behavior comes from one line of JS.', 'Estructura en HTML con las clases del formulario; el comportamiento viene de una línea de JS.'),
      `<div class="pf-code">
        <div><h3 class="doc-subhead">HTML</h3>${codeBlock(htmlCode())}</div>
        <div><h3 class="doc-subhead">JavaScript</h3>${codeBlock(jsCode())}</div>
      </div>
      <h3 class="doc-subhead">${L('enhanceForm(form, opções)', 'enhanceForm(form, options)', 'enhanceForm(form, opciones)')} <span class="doc-subhead__meta">ds/js/form.js</span></h3>
      <div class="doc-table pf-api" style="--doc-table-cols: minmax(130px, 0.6fr) minmax(0, 1fr) minmax(0, 1.4fr)">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Opção ou método', 'Option or method', 'Opción o método')}</span><span>${L('Valor', 'Value', 'Valor')}</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
        ${API().map(([name, value, text]) => `<div class="doc-table__row"><code class="ds-inline-code">${escapeHtml(name)}</code><code class="pf-api__value">${escapeHtml(value)}</code><span class="pf-api__text">${escapeHtml(text)}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'pf-uso',
      L('Uso', 'Usage', 'Uso'),
      L('Seis regras que evitam a maioria dos formulários ruins.', 'Six rules that prevent most bad forms.', 'Seis reglas que evitan la mayoría de los formularios malos.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: peça só o necessário', 'Do: ask only for what’s needed', 'Haz: pide solo lo necesario')}</p><p class="usage-card__text">${L('Cada campo a mais é uma razão para desistir. O que dá para descobrir depois, pergunte depois.', 'Every extra field is a reason to give up. What can be found out later, ask later.', 'Cada campo de más es una razón para abandonar. Lo que se puede averiguar después, pregúntalo después.')}</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: placeholder como rótulo', 'Avoid: placeholder as label', 'Evita: placeholder como etiqueta')}</p><p class="usage-card__text">${L('Some na primeira letra, e a pessoa esquece o que estava preenchendo no meio da frase.', 'It disappears on the first letter, and people forget what they were filling in mid-sentence.', 'Desaparece con la primera letra, y la persona olvida qué estaba completando en medio de la frase.')}</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}${L('Escolha um padrão seguro', 'Pick a safe default', 'Elige un valor predeterminado seguro')}</p><p class="usage-card__text">${L('Visibilidade começa em “Privado”. O padrão certo evita uma pergunta — e um erro.', 'Visibility starts at “Private”. The right default avoids a question — and a mistake.', 'La visibilidad empieza en “Privado”. El valor correcto evita una pregunta — y un error.')}</p></article>
        <article class="usage-card usage-card--do"><p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: erro que ensina', 'Do: errors that teach', 'Haz: error que enseña')}</p><p class="usage-card__text">${L('“Use pelo menos 8 caracteres — faltam 3” diz o que fazer. “Senha inválida” só diz que errou.', '“Use at least 8 characters — 3 to go” says what to do. “Invalid password” only says you got it wrong.', '“Usa al menos 8 caracteres — faltan 3” dice qué hacer. “Contraseña inválida” solo dice que te equivocaste.')}</p></article>
        <article class="usage-card usage-card--dont"><p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: limpar o que a pessoa digitou', 'Avoid: clearing what people typed', 'Evita: borrar lo que la persona escribió')}</p><p class="usage-card__text">${L('Em erro, nunca apague os campos. Mantenha tudo e marque só o que precisa mudar.', 'On error, never clear the fields. Keep everything and mark only what needs to change.', 'Con error, nunca borres los campos. Mantén todo y marca solo lo que tiene que cambiar.')}</p></article>
        <article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('zap', { size: 20 })}${L('Confirme com toast', 'Confirm with a toast', 'Confirma con toast')}</p><p class="usage-card__text">${L('Deu certo? Um toast curto (“Projeto criado”) e a tela segue. Modal de sucesso interrompe à toa.', 'Did it work? A short toast (“Project created”) and the screen moves on. A success modal interrupts for nothing.', '¿Salió bien? Un toast corto (“Proyecto creado”) y la pantalla sigue. Un modal de éxito interrumpe sin motivo.')}</p></article>
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
      endereco: (value) => (TAKEN.has(value) ? L(`Esse endereço já está em uso. Que tal ${value}-2?`, `That address is already in use. How about ${value}-2?`, `Esa dirección ya está en uso. ¿Qué tal ${value}-2?`) : null),
    },
    onSubmit(data) {
      submit.setAttribute('aria-disabled', 'true');
      submit.dataset.busy = '';
      submit.innerHTML = `${icon('loader', { size: 18, className: 'pf-spin' })}<span>${creating()}</span>`;
      later(() => {
        submit.removeAttribute('aria-disabled');
        delete submit.dataset.busy;
        submit.innerHTML = `${icon('plus', { size: 18 })}<span>${createProject()}</span>`;
        toast(L(`Projeto “${data.nome}” criado`, `Project “${data.nome}” created`, `Proyecto “${data.nome}” creado`), { tone: 'success' });
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
  const modes = MODES();
  const modesEl = root.querySelector('.pf-modes');
  const valForm = root.querySelector('#pf-val');
  const desc = modesEl.querySelector('[data-mode-desc]');
  let valCtrl = null;
  const setMode = (mode, focus) => {
    valCtrl?.destroy();
    valCtrl = enhanceForm(valForm, {
      validateOn: mode,
      summary: false,
      onSubmit: () => toast(L('E-mail aceito', 'Email accepted', 'Correo aceptado'), { tone: 'success' }),
    });
    modesEl.querySelectorAll('[data-mode]').forEach((b) => {
      const on = b.dataset.mode === mode;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    desc.textContent = modes.find(([id]) => id === mode)[2];
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
    const ids = modes.map(([id]) => id);
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
    status.textContent = n
      ? n === 1
        ? L('1 alteração não salva', '1 unsaved change', '1 cambio sin guardar')
        : L(`${n} alterações não salvas`, `${n} unsaved changes`, `${n} cambios sin guardar`)
      : noChanges();
    status.toggleAttribute('data-dirty', n > 0);
  };
  const onLongSubmit = (event) => {
    event.preventDefault();
    [...long.elements].filter((el) => el.name).forEach((el) => initial.set(el.name, el.value));
    count();
    toast(L('Alterações salvas', 'Changes saved', 'Cambios guardados'), { tone: 'success' });
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
