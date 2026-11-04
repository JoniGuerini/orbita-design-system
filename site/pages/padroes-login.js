import { icon } from '../../ds/icons/icons.js';
import { enhanceForm } from '../../ds/js/form.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, escapeHtml, siteTheme, followSiteTheme } from '../component-doc.js';
import { themeSwitch } from '../themes.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-login.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

// conta de demonstração: o exemplo ao vivo só aceita esta senha
const DEMO_PASSWORD = 'lume2026';
const TAKEN_EMAILS = new Set(['ana@lume.app', 'time@lume.app']);

const signIn = () => L('Entrar', 'Sign in', 'Entrar');
const signingIn = () => L('Entrando…', 'Signing in…', 'Entrando…');
const createAccount = () => L('Criar conta', 'Create account', 'Crear cuenta');
const creating = () => L('Criando…', 'Creating…', 'Creando…');
const sendLink = () => L('Enviar link', 'Send link', 'Enviar enlace');
const sending = () => L('Enviando…', 'Sending…', 'Enviando…');
const emailLabel = () => L('E-mail', 'Email', 'Correo');
const passwordLabel = () => L('Senha', 'Password', 'Contraseña');
const nameLabel = () => L('Nome', 'Name', 'Nombre');
const forgot = () => L('Esqueci a senha', 'Forgot password', 'Olvidé la contraseña');
const showPassword = () => L('Mostrar senha', 'Show password', 'Mostrar contraseña');
const backToSignIn = () => L('Voltar para entrar', 'Back to sign in', 'Volver a entrar');
const wrongCredentials = () => L('E-mail ou senha incorretos.', 'Incorrect email or password.', 'Correo o contraseña incorrectos.');
const wrongCredentialsText = () => L('Confira e tente de novo, ou redefina a senha.', 'Check them and try again, or reset your password.', 'Revísalos e inténtalo de nuevo, o restablece la contraseña.');
const takenEmail = () => L('Já existe uma conta com esse e-mail.', 'There’s already an account with that email.', 'Ya existe una cuenta con ese correo.');

const VIEWS = () => [
  { value: 'login', label: signIn() },
  { value: 'signup', label: createAccount() },
  { value: 'recover', label: L('Recuperar senha', 'Reset password', 'Recuperar contraseña') },
];

// requisitos da senha nova: [id, texto, teste]
const REQS = () => [
  ['len', L('Pelo menos 8 caracteres', 'At least 8 characters', 'Al menos 8 caracteres'), (v) => v.length >= 8],
  ['letter', L('Uma letra', 'A letter', 'Una letra'), (v) => /\p{L}/u.test(v)],
  ['number', L('Um número', 'A number', 'Un número'), (v) => /\d/.test(v)],
];

const RULES = () => [
  ['file-text', L('Só o necessário', 'Only what’s needed', 'Solo lo necesario'), L('Entrar pede e-mail e senha. Criar conta pede nome, e-mail e senha. O resto — foto, empresa, cargo — fica para depois, dentro do produto.', 'Signing in asks for email and password. Creating an account asks for name, email, and password. Everything else — photo, company, role — waits until later, inside the product.', 'Entrar pide correo y contraseña. Crear cuenta pide nombre, correo y contraseña. El resto — foto, empresa, cargo — queda para después, dentro del producto.')],
  ['eye', L('Mostrar a senha', 'Show the password', 'Mostrar la contraseña'), L(`Um botão dentro do campo (${ic('.ds-field__action')}) mostra o que foi digitado. É ele que evita o erro de digitação — não um segundo campo.`, `A button inside the field (${ic('.ds-field__action')}) shows what was typed. That’s what prevents typos — not a second field.`, `Un botón dentro del campo (${ic('.ds-field__action')}) muestra lo que se escribió. Es lo que evita el error de tipeo — no un segundo campo.`)],
  ['x-circle', L('Sem “confirmar senha”', 'No “confirm password”', 'Sin “confirmar contraseña”'), L('Nem “confirmar e-mail”. Repetir o campo dobra o trabalho e não pega o erro que importa. Quem errou o e-mail recupera pelo link.', 'Nor “confirm email”. Repeating the field doubles the work and doesn’t catch the error that matters. Anyone who mistyped their email recovers through the link.', 'Ni “confirmar correo”. Repetir el campo duplica el trabajo y no detecta el error que importa. Quien se equivocó de correo lo recupera con el enlace.')],
  ['check-circle', L('Requisitos à vista', 'Requirements in view', 'Requisitos a la vista'), L('As regras da senha aparecem antes de digitar e vão sendo marcadas enquanto a pessoa escreve — não depois de um erro.', 'The password rules show up before typing and get checked off as the person writes — not after an error.', 'Las reglas de la contraseña aparecen antes de escribir y se van marcando mientras la persona escribe — no después de un error.')],
  ['shield', L('O erro não entrega quem tem conta', 'Errors don’t reveal who has an account', 'El error no revela quién tiene cuenta'), L('No login, “e-mail ou senha incorretos” — nunca qual dos dois. Na recuperação, a mesma resposta exista a conta ou não.', 'On sign-in, “incorrect email or password” — never which one. On reset, the same answer whether the account exists or not.', 'Al entrar, “correo o contraseña incorrectos” — nunca cuál de los dos. Al recuperar, la misma respuesta exista o no la cuenta.')],
  ['lock', L('Deixe colar e preencher', 'Let people paste and autofill', 'Deja pegar y autocompletar'), L(`Nada de bloquear colar. Com ${ic('autocomplete')} certo, o gerenciador de senhas preenche o login e sugere uma senha forte no cadastro.`, `Never block pasting. With the right ${ic('autocomplete')}, the password manager fills in sign-in and suggests a strong password on sign-up.`, `Nada de bloquear pegar. Con el ${ic('autocomplete')} correcto, el gestor de contraseñas completa el inicio de sesión y sugiere una contraseña fuerte en el registro.`)],
];

const WRITING = () => [
  [L('Senha errada', 'Wrong password', 'Contraseña incorrecta'), L('Senha inválida para este usuário', 'Invalid password for this user', 'Contraseña inválida para este usuario'), `${wrongCredentials()} ${wrongCredentialsText()}`],
  [L('Muitas tentativas', 'Too many attempts', 'Demasiados intentos'), L('Conta bloqueada!', 'Account locked!', '¡Cuenta bloqueada!'), L('Muitas tentativas seguidas. Tente de novo em 5 minutos ou redefina a senha.', 'Too many attempts in a row. Try again in 5 minutes or reset your password.', 'Demasiados intentos seguidos. Inténtalo de nuevo en 5 minutos o restablece la contraseña.')],
  [L('E-mail já usado', 'Email in use', 'Correo en uso'), L('Erro 409: conflito', 'Error 409: conflict', 'Error 409: conflicto'), `${takenEmail()} ${L('Quer entrar?', 'Want to sign in?', '¿Quieres entrar?')}`],
  [L('Senha fraca', 'Weak password', 'Contraseña débil'), L('Senha não atende à política', 'Password does not meet policy', 'La contraseña no cumple la política'), L('Use pelo menos 8 caracteres, com uma letra e um número.', 'Use at least 8 characters, with a letter and a number.', 'Usa al menos 8 caracteres, con una letra y un número.')],
  [L('Link enviado', 'Link sent', 'Enlace enviado'), L('E-mail enviado com sucesso!', 'Email sent successfully!', '¡Correo enviado con éxito!'), L('Se houver uma conta com esse e-mail, o link chega em alguns minutos.', 'If there’s an account with that email, the link arrives in a few minutes.', 'Si hay una cuenta con ese correo, el enlace llega en unos minutos.')],
  [L('Link vencido', 'Expired link', 'Enlace vencido'), L('Token inválido', 'Invalid token', 'Token inválido'), L('Esse link venceu — ele vale por 1 hora. Peça um novo.', 'That link has expired — it’s valid for 1 hour. Request a new one.', 'Ese enlace venció — vale por 1 hora. Pide uno nuevo.')],
];

/* ───────── Peças ───────── */

function field({ id, name, label, type = 'text', autocomplete, hint, describedBy, errors = {}, extra = '', action = '' }) {
  const ids = [hint ? `${id}-hint` : null, describedBy].filter(Boolean).join(' ');
  const attrs = [
    `id="${id}"`,
    `name="${name}"`,
    `type="${type}"`,
    'required',
    autocomplete ? `autocomplete="${autocomplete}"` : '',
    type === 'email' ? 'inputmode="email" autocapitalize="none"' : '',
    'spellcheck="false"',
    ids ? `aria-describedby="${ids}"` : '',
    extra,
    ...Object.entries(errors).map(([k, v]) => `data-error-${k}="${escapeHtml(v)}"`),
  ]
    .filter(Boolean)
    .join(' ');
  return `<div class="ds-form-field">
    <label class="ds-form-field__label" for="${id}">${label}</label>
    <div class="ds-field"><input class="ds-field__input" ${attrs}>${action}</div>
    ${hint ? `<div class="ds-form-field__footer"><p class="ds-form-field__hint" id="${id}-hint">${hint}</p></div>` : ''}
  </div>`;
}

const revealButton = () =>
  `<button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-field__action" data-lc-reveal aria-pressed="false" aria-label="${showPassword()}" data-ds-tooltip="${showPassword()}">${icon('eye', { size: 16 })}</button>`;

const brand = () => `<p class="lc-brand"><img class="lc-brand__mark" src="assets/favicon.svg" alt="" width="24" height="24">Lume</p>`;

const head = (title, text) => `<header class="lc-card__head">
    ${brand()}
    <h3 class="lc-card__title">${title}</h3>
    ${text ? `<p class="lc-card__text">${text}</p>` : ''}
  </header>`;

const reqList = (id) => `<ul class="lc-reqs" id="${id}" role="list">
    ${REQS()
      .map(([key, text]) => `<li class="lc-req" data-req="${key}">${icon('check', { size: 14 })}<span>${text}</span><span class="ds-visually-hidden" data-req-state>${L('— falta', '— missing', '— falta')}</span></li>`)
      .join('')}
  </ul>`;

function loginView() {
  return `<form class="ds-form lc-card" data-lc-view="login" id="lc-login" aria-labelledby="lc-login-title" novalidate>
    ${head(`<span id="lc-login-title">${L('Entrar no Lume', 'Sign in to Lume', 'Entrar en Lume')}</span>`)}
    <div data-lc-alert></div>
    ${field({ id: 'lc-login-email', name: 'email', label: emailLabel(), type: 'email', autocomplete: 'username', errors: { required: L('Informe o e-mail da conta.', 'Enter your account email.', 'Indica el correo de la cuenta.') } })}
    <div class="lc-password">
      ${field({ id: 'lc-login-senha', name: 'senha', label: passwordLabel(), type: 'password', autocomplete: 'current-password', errors: { required: L('Informe a senha.', 'Enter your password.', 'Indica la contraseña.') }, action: revealButton() })}
      <button type="button" class="ds-inline-action lc-forgot" data-lc-go="recover">${forgot()}</button>
    </div>
    <button type="submit" class="ds-btn ds-btn--primary lc-submit" data-lc-submit>${signIn()}</button>
    <p class="lc-switch">${L('Não tem conta?', 'Don’t have an account?', '¿No tienes cuenta?')} <button type="button" class="lc-link" data-lc-go="signup">${createAccount()}</button></p>
  </form>`;
}

function signupView() {
  return `<form class="ds-form lc-card" data-lc-view="signup" id="lc-signup" aria-labelledby="lc-signup-title" novalidate hidden>
    ${head(`<span id="lc-signup-title">${L('Criar sua conta', 'Create your account', 'Crear tu cuenta')}</span>`)}
    ${field({ id: 'lc-signup-nome', name: 'nome', label: nameLabel(), autocomplete: 'name', errors: { required: L('Como podemos te chamar?', 'What should we call you?', '¿Cómo te llamamos?') } })}
    ${field({ id: 'lc-signup-email', name: 'email', label: emailLabel(), type: 'email', autocomplete: 'email', hint: L('Para entrar e recuperar a senha.', 'To sign in and reset your password.', 'Para entrar y recuperar la contraseña.'), errors: { required: L('Informe um e-mail.', 'Enter an email.', 'Indica un correo.') } })}
    ${field({ id: 'lc-signup-senha', name: 'senha', label: passwordLabel(), type: 'password', autocomplete: 'new-password', describedBy: 'lc-signup-reqs', errors: { required: L('Crie uma senha.', 'Create a password.', 'Crea una contraseña.') }, action: revealButton() })}
    ${reqList('lc-signup-reqs')}
    <button type="submit" class="ds-btn ds-btn--primary lc-submit" data-lc-submit>${createAccount()}</button>
    <p class="lc-legal">${L('Ao criar a conta, você aceita os <a href="#/padroes/login">Termos</a> e a <a href="#/padroes/login">Privacidade</a>.', 'By creating an account, you accept the <a href="#/padroes/login">Terms</a> and <a href="#/padroes/login">Privacy</a>.', 'Al crear la cuenta, aceptas los <a href="#/padroes/login">Términos</a> y la <a href="#/padroes/login">Privacidad</a>.')}</p>
    <p class="lc-switch">${L('Já tem conta?', 'Already have an account?', '¿Ya tienes cuenta?')} <button type="button" class="lc-link" data-lc-go="login">${signIn()}</button></p>
  </form>`;
}

function recoverView() {
  return `<div class="lc-card" data-lc-view="recover" hidden>
    <form class="ds-form lc-card__form" id="lc-recover" aria-labelledby="lc-recover-title" novalidate>
      ${head(`<span id="lc-recover-title">${L('Recuperar a senha', 'Reset your password', 'Recuperar la contraseña')}</span>`, L('Mandamos um link para criar uma senha nova.', 'We’ll send a link to create a new password.', 'Te enviamos un enlace para crear una contraseña nueva.'))}
      ${field({ id: 'lc-recover-email', name: 'email', label: emailLabel(), type: 'email', autocomplete: 'username', errors: { required: L('Informe o e-mail da conta.', 'Enter your account email.', 'Indica el correo de la cuenta.') } })}
      <button type="submit" class="ds-btn ds-btn--primary lc-submit" data-lc-submit>${sendLink()}</button>
      <p class="lc-switch"><button type="button" class="lc-link" data-lc-go="login">${icon('arrow-left', { size: 16 })}${backToSignIn()}</button></p>
    </form>
    <div class="lc-sent" data-lc-sent hidden tabindex="-1">
      ${brand()}
      <span class="lc-sent__icon">${icon('mail', { size: 22 })}</span>
      <h3 class="lc-card__title">${L('Confira seu e-mail', 'Check your email', 'Revisa tu correo')}</h3>
      <p class="lc-card__text" data-lc-sent-text></p>
      <button type="button" class="ds-btn ds-btn--secondary lc-submit" data-lc-go="login">${backToSignIn()}</button>
    </div>
  </div>`;
}

function stage() {
  const th = siteTheme();
  return `<div class="lc-stage" data-lc-stage data-theme="${th}">
    <div class="lc-stage__bar">
      <div class="ds-segmented lc-segmented" role="radiogroup" aria-label="${L('Tela do exemplo', 'Example screen', 'Pantalla del ejemplo')}" data-lc-views>
        ${VIEWS()
          .map((v, i) => `<button type="button" class="ds-segmented__item" role="radio" data-lc-view-option="${v.value}" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${v.label}</button>`)
          .join('')}
      </div>
      ${themeSwitch('lc-theme', th, { className: 'lc-stage__theme' })}
    </div>
    <div class="lc-screen">
      ${loginView()}
      ${signupView()}
      ${recoverView()}
    </div>
  </div>`;
}

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

/* ───────── Código ───────── */

const htmlCode = () => `<form class="ds-form" id="${L('entrar', 'sign-in', 'entrar')}" novalidate>
  <div class="ds-form-field">
    <label class="ds-form-field__label" for="email">${emailLabel()}</label>
    <div class="ds-field">
      <input class="ds-field__input" id="email" name="email" type="email" required
        autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false">
    </div>
  </div>
  <div class="ds-form-field">
    <label class="ds-form-field__label" for="${L('senha', 'password', 'contrasena')}">${passwordLabel()}</label>
    <div class="ds-field">
      <input class="ds-field__input" id="${L('senha', 'password', 'contrasena')}" name="${L('senha', 'password', 'contrasena')}" type="password" required
        autocomplete="current-password">
      <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-field__action"
        aria-pressed="false" aria-label="${showPassword()}" data-${L('mostrar-senha', 'show-password', 'mostrar-contrasena')}>
        <ds-icon name="eye" size="16"></ds-icon>
      </button>
    </div>
  </div>
  <button type="submit" class="ds-btn ds-btn--primary">${signIn()}</button>
</form>`;

const jsCode = () => `import { enhanceForm } from './ds/js/form.js';

// ${L('mostrar senha: troca o tipo do campo e marca o botão', 'show password: switches the field type and marks the button', 'mostrar contraseña: cambia el tipo del campo y marca el botón')}
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-${L('mostrar-senha', 'show-password', 'mostrar-contrasena')}]');
  if (!button) return;
  const input = button.closest('.ds-field').querySelector('input');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(show));
});

enhanceForm(document.querySelector('#${L('entrar', 'sign-in', 'entrar')}'), {
  summary: false, // ${L('dois campos: o erro aparece em cada um', 'two fields: the error shows on each one', 'dos campos: el error aparece en cada uno')}
  async onSubmit(${L('dados', 'data', 'datos')}) {
    const ok = await ${L('entrar', 'signIn', 'entrar')}(${L('dados', 'data', 'datos')}.email, ${L('dados', 'data', 'datos')}.${L('senha', 'password', 'contrasena')});
    if (!ok) ${L('mostrarAlerta', 'showAlert', 'mostrarAlerta')}('${wrongCredentials()}'); // ${L('nunca diga qual dos dois', 'never say which one', 'nunca digas cuál de los dos')}
  },
});`;

/* ───────── Página ───────── */

const NAV = () => [
  ['lc-exemplo', L('Exemplo', 'Example', 'Ejemplo')],
  ['lc-regras', L('Regras', 'Rules', 'Reglas')],
  ['lc-mensagens', L('Mensagens', 'Messages', 'Mensajes')],
  ['lc-acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
  ['lc-codigo', L('Código', 'Code', 'Código')],
  ['lc-uso', L('Uso', 'Usage', 'Uso')],
];

export default function renderLogin(page) {
  return `
  <div class="page doc lc-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('A primeira tela do produto — e a que mais gente abandona. Peça só o necessário, deixe ver a senha, explique o erro sem entregar quem tem conta e nunca prenda a pessoa do lado de fora.', 'The product’s first screen — and the one most people abandon. Ask only for what’s needed, let people see their password, explain errors without revealing who has an account, and never lock anyone out.', 'La primera pantalla del producto — y la que más gente abandona. Pide solo lo necesario, deja ver la contraseña, explica el error sin revelar quién tiene cuenta y nunca dejes a nadie afuera.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('campos para entrar', 'fields to sign in', 'campos para entrar')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('campos para criar conta', 'fields to sign up', 'campos para registrarse')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('ação principal', 'primary action', 'acción principal')}</dt><dd class="doc-stat__value">1</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('“confirmar senha”', '“confirm password”', '“confirmar contraseña”')}</dt><dd class="doc-stat__value">0</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'lc-exemplo',
      L('Exemplo ao vivo', 'Live example', 'Ejemplo en vivo'),
      L(`Três telas que se ligam: entrar, criar conta e recuperar a senha. A conta de teste aceita qualquer e-mail com a senha ${ic(DEMO_PASSWORD)}; ${ic('ana@lume.app')} já tem cadastro.`, `Three connected screens: sign in, create an account, and reset the password. The test account accepts any email with the password ${ic(DEMO_PASSWORD)}; ${ic('ana@lume.app')} is already registered.`, `Tres pantallas conectadas: entrar, crear cuenta y recuperar la contraseña. La cuenta de prueba acepta cualquier correo con la contraseña ${ic(DEMO_PASSWORD)}; ${ic('ana@lume.app')} ya está registrado.`),
      `${stage()}
      <ul class="lc-tries" role="list">
        <li>${icon('x-circle', { size: 16 })}${L('Entre com outra senha: o erro não diz qual dos dois está errado.', 'Sign in with another password: the error doesn’t say which one is wrong.', 'Entra con otra contraseña: el error no dice cuál de los dos está mal.')}</li>
        <li>${icon('eye', { size: 16 })}${L('O olho mostra a senha; os requisitos do cadastro marcam enquanto você digita.', 'The eye shows the password; the sign-up requirements check off as you type.', 'El ojo muestra la contraseña; los requisitos del registro se marcan mientras escribes.')}</li>
        <li>${icon('mail', { size: 16 })}${L('Na recuperação, a resposta é a mesma exista a conta ou não.', 'On reset, the answer is the same whether the account exists or not.', 'Al recuperar, la respuesta es la misma exista o no la cuenta.')}</li>
      </ul>`,
    )}

    ${section(
      'lc-regras',
      L('Regras', 'Rules', 'Reglas'),
      L('Seis decisões que valem para qualquer tela de acesso.', 'Six decisions that apply to any access screen.', 'Seis decisiones que valen para cualquier pantalla de acceso.'),
      `<div class="lc-rules">
        ${RULES()
          .map(
            ([glyph, title, text]) => `<article class="lc-rule">
              <span class="lc-rule__icon">${icon(glyph, { size: 18 })}</span>
              <p class="lc-rule__title">${title}</p>
              <p class="lc-rule__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>`,
    )}

    ${section(
      'lc-mensagens',
      L('Mensagens', 'Messages', 'Mensajes'),
      L('Toda mensagem diz o que fazer em seguida. No acesso, ela também não pode ajudar quem tenta adivinhar contas alheias.', 'Every message says what to do next. On access screens, it also mustn’t help anyone trying to guess other people’s accounts.', 'Todo mensaje dice qué hacer a continuación. En el acceso, además no puede ayudar a quien intenta adivinar cuentas ajenas.'),
      `<div class="doc-table lc-writing" style="--doc-table-cols: minmax(110px, 0.55fr) minmax(0, 1fr) minmax(0, 1.6fr)">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Situação', 'Situation', 'Situación')}</span><span>${L('Evite', 'Avoid', 'Evita')}</span><span>${L('Prefira', 'Prefer', 'Prefiere')}</span></div>
        ${WRITING()
          .map(
            ([situation, bad, good]) => `<div class="doc-table__row">
              <span class="lc-writing__situation">${situation}</span>
              <span class="lc-writing__bad">${icon('x-circle', { size: 16 })}<span>${escapeHtml(bad)}</span></span>
              <span class="lc-writing__good">${icon('check-circle', { size: 16 })}<span>${escapeHtml(good)}</span></span>
            </div>`,
          )
          .join('')}
      </div>`,
    )}

    ${section(
      'lc-acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('Entrar não pode depender de memória, visão perfeita ou pressa. A WCAG 2.2 tem um critério só para isso: autenticação acessível (3.3.8).', 'Signing in can’t depend on memory, perfect vision, or speed. WCAG 2.2 has a criterion just for this: accessible authentication (3.3.8).', 'Entrar no puede depender de la memoria, de una visión perfecta ni de la prisa. La WCAG 2.2 tiene un criterio solo para esto: autenticación accesible (3.3.8).'),
      a11yList([
        [L('autocomplete certo', 'The right autocomplete', 'El autocomplete correcto'), L(`${ic('username')} e ${ic('current-password')} no login, ${ic('email')} e ${ic('new-password')} no cadastro. O gerenciador de senhas preenche e sugere — ninguém precisa decorar nada.`, `${ic('username')} and ${ic('current-password')} on sign-in, ${ic('email')} and ${ic('new-password')} on sign-up. The password manager fills in and suggests — nobody has to memorize anything.`, `${ic('username')} y ${ic('current-password')} al entrar, ${ic('email')} y ${ic('new-password')} en el registro. El gestor de contraseñas completa y sugiere — nadie tiene que memorizar nada.`)],
        [L('Colar sempre funciona', 'Pasting always works', 'Pegar siempre funciona'), L('Bloquear colar empurra para senhas fracas e quebra os gerenciadores. Nem no e-mail, nem na senha.', 'Blocking paste pushes people toward weak passwords and breaks password managers. Not on email, not on password.', 'Bloquear pegar empuja a contraseñas débiles y rompe los gestores. Ni en el correo, ni en la contraseña.')],
        [L('Mostrar senha com estado', 'Show password with state', 'Mostrar contraseña con estado'), L(`O botão tem nome fixo (“${showPassword()}”) e ${ic('aria-pressed')} diz se está ligado. O foco não sai do lugar.`, `The button has a fixed name (“${showPassword()}”) and ${ic('aria-pressed')} says whether it’s on. Focus stays put.`, `El botón tiene un nombre fijo (“${showPassword()}”) y ${ic('aria-pressed')} dice si está activado. El foco no se mueve.`)],
        [L('Requisitos ligados ao campo', 'Requirements tied to the field', 'Requisitos ligados al campo'), L(`A lista entra no ${ic('aria-describedby')} da senha; cada item diz em texto se já foi atendido — não só pela cor do ✓.`, `The list is in the password’s ${ic('aria-describedby')}; each item says in text whether it’s met — not just through the ✓ color.`, `La lista está en el ${ic('aria-describedby')} de la contraseña; cada ítem dice en texto si ya se cumple — no solo por el color del ✓.`)],
        [L('Erro de acesso em alerta', 'Access errors as alerts', 'Error de acceso como alerta'), L(`“${wrongCredentials()}” aparece num ${ic('.ds-alert')} com ${ic('role="alert"')}; a senha é apagada e recebe o foco para a próxima tentativa.`, `“${wrongCredentials()}” shows in a ${ic('.ds-alert')} with ${ic('role="alert"')}; the password is cleared and gets focus for the next try.`, `“${wrongCredentials()}” aparece en un ${ic('.ds-alert')} con ${ic('role="alert"')}; la contraseña se borra y recibe el foco para el siguiente intento.`)],
        [L('Sem teste de memória', 'No memory tests', 'Sin pruebas de memoria'), L('Nada de CAPTCHA de imagem ou pergunta secreta como única saída. Se precisar barrar robôs, ofereça um caminho que não dependa de decifrar letras.', 'No image CAPTCHA or security question as the only way through. If you need to stop bots, offer a path that doesn’t depend on deciphering letters.', 'Nada de CAPTCHA de imagen ni pregunta secreta como única salida. Si necesitas frenar robots, ofrece un camino que no dependa de descifrar letras.')],
      ]),
    )}

    ${section(
      'lc-codigo',
      L('Código', 'Code', 'Código'),
      L(`O login é um formulário comum com ${ic('enhanceForm')}: os campos, o botão de mostrar senha e a resposta do servidor num alerta.`, `Sign-in is a regular form with ${ic('enhanceForm')}: the fields, the show-password button, and the server’s answer in an alert.`, `El inicio de sesión es un formulario común con ${ic('enhanceForm')}: los campos, el botón de mostrar contraseña y la respuesta del servidor en una alerta.`),
      `${codeBlock(htmlCode())}
      ${codeBlock(jsCode())}`,
    )}

    ${section(
      'lc-uso',
      L('Uso', 'Usage', 'Uso'),
      L('A tela de acesso fica fora do app: sem sidebar, sem navegação — só a marca e o formulário.', 'The access screen sits outside the app: no sidebar, no navigation — just the brand and the form.', 'La pantalla de acceso queda fuera de la app: sin sidebar, sin navegación — solo la marca y el formulario.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: entre direto depois do cadastro', 'Do: sign people in right after sign-up', 'Haz: entra directo después del registro')}</p>
          <p class="usage-card__text">${L('Quem acabou de criar a conta já está dentro. Pedir para entrar de novo, com os mesmos dados, é perder gente na porta.', 'Someone who just created an account is already in. Asking them to sign in again, with the same details, loses people at the door.', 'Quien acaba de crear la cuenta ya está dentro. Pedirle que entre de nuevo, con los mismos datos, es perder gente en la puerta.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: regras de senha escondidas', 'Avoid: hidden password rules', 'Evita: reglas de contraseña escondidas')}</p>
          <p class="usage-card__text">${L('Descobrir a regra só depois do erro — “precisa de um caractere especial” — faz a pessoa adivinhar duas vezes. Mostre antes, marque enquanto digita.', 'Finding out the rule only after the error — “needs a special character” — makes people guess twice. Show it first, check it off while they type.', 'Descubrir la regla solo después del error — “necesita un carácter especial” — hace adivinar dos veces. Muéstrala antes y márcala mientras escribe.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Um caminho de volta em cada tela', 'A way back on every screen', 'Un camino de vuelta en cada pantalla')}</p>
          <p class="usage-card__text">${L('Entrar leva a criar conta e a recuperar a senha; as duas voltam para entrar. Ninguém fica preso num beco.', 'Sign-in leads to sign-up and to password reset; both lead back to sign-in. Nobody gets stuck in a dead end.', 'Entrar lleva a crear cuenta y a recuperar la contraseña; las dos vuelven a entrar. Nadie queda atrapado en un callejón.')}</p>
        </article>
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

  const stageEl = root.querySelector('[data-lc-stage]');
  const viewsEl = stageEl.querySelector('[data-lc-views]');
  const views = [...stageEl.querySelectorAll('[data-lc-view]')];
  const options = [...viewsEl.querySelectorAll('[data-lc-view-option]')];

  /* Troca de tela */
  const show = (name, focus = false) => {
    views.forEach((v) => (v.hidden = v.dataset.lcView !== name));
    options.forEach((b) => {
      const on = b.dataset.lcViewOption === name;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (name === 'recover') resetRecover();
    if (focus) views.find((v) => !v.hidden)?.querySelector('input')?.focus();
  };
  const onStageClick = (event) => {
    // links de termos e privacidade: no exemplo, não saem da página
    if (event.target.closest('.lc-legal a')) return event.preventDefault();
    const option = event.target.closest('[data-lc-view-option]');
    if (option) return show(option.dataset.lcViewOption);
    const go = event.target.closest('[data-lc-go]');
    if (go) return show(go.dataset.lcGo, true);
    const reveal = event.target.closest('[data-lc-reveal]');
    if (reveal) {
      const input = reveal.closest('.ds-field').querySelector('input');
      const on = input.type === 'password';
      input.type = on ? 'text' : 'password';
      reveal.setAttribute('aria-pressed', String(on));
      reveal.innerHTML = icon(on ? 'eye-off' : 'eye', { size: 16 });
      return;
    }
    const theme = event.target.closest('[data-lc-theme]');
    if (theme) {
      stageEl.dataset.theme = theme.dataset.lcTheme;
      stageEl.querySelectorAll('[data-lc-theme]').forEach((b) => b.setAttribute('aria-checked', String(b === theme)));
    }
  };
  const onViewsKey = (event) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const i = options.findIndex((b) => b.getAttribute('aria-checked') === 'true');
    const next = options[(i + delta + options.length) % options.length];
    show(next.dataset.lcViewOption);
    next.focus();
  };
  stageEl.addEventListener('click', onStageClick);
  viewsEl.addEventListener('keydown', onViewsKey);
  cleanups.push(() => {
    stageEl.removeEventListener('click', onStageClick);
    viewsEl.removeEventListener('keydown', onViewsKey);
  });
  cleanups.push(followSiteTheme(root, '[data-lc-stage]', 'lc-theme'));

  /* Botão enviando: um envio por vez */
  const busy = (button, label) => {
    const original = button.innerHTML;
    button.dataset.busy = '';
    button.setAttribute('aria-disabled', 'true');
    button.innerHTML = `${icon('loader', { size: 18, className: 'lc-spin' })}<span>${label}</span>`;
    return () => {
      delete button.dataset.busy;
      button.removeAttribute('aria-disabled');
      button.innerHTML = original;
    };
  };
  const guard = (event) => {
    if (event.currentTarget.querySelector('[data-lc-submit][data-busy]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  /* Entrar */
  const login = stageEl.querySelector('#lc-login');
  const loginAlert = login.querySelector('[data-lc-alert]');
  const loginSubmit = login.querySelector('[data-lc-submit]');
  const loginPassword = login.querySelector('#lc-login-senha');
  const clearAlert = () => (loginAlert.innerHTML = '');
  const loginForm = enhanceForm(login, {
    summary: false,
    onSubmit(data) {
      clearAlert();
      const done = busy(loginSubmit, signingIn());
      later(() => {
        done();
        if (data.senha !== DEMO_PASSWORD) {
          loginAlert.innerHTML = `<div class="ds-alert ds-alert--danger" role="alert">
            <span class="ds-alert__icon">${icon('alert-circle', { size: 18 })}</span>
            <div class="ds-alert__body"><p class="ds-alert__title">${wrongCredentials()}</p><p class="ds-alert__text">${wrongCredentialsText()}</p></div>
          </div>`;
          loginPassword.value = '';
          loginPassword.focus();
          return;
        }
        toast(L('Você entrou (de mentirinha)', 'You’re in (just pretend)', 'Entraste (de mentira)'), { tone: 'success', icon: 'check' });
        loginForm.reset();
        clearAlert();
      }, 700);
    },
  });
  login.addEventListener('submit', guard, true);
  cleanups.push(() => login.removeEventListener('submit', guard, true), () => loginForm.destroy());

  /* Criar conta: requisitos marcam enquanto digita */
  const signup = stageEl.querySelector('#lc-signup');
  const signupSubmit = signup.querySelector('[data-lc-submit]');
  const signupPassword = signup.querySelector('#lc-signup-senha');
  const reqs = REQS();
  const updateReqs = () => {
    const value = signupPassword.value;
    reqs.forEach(([key, , test]) => {
      const item = signup.querySelector(`[data-req="${key}"]`);
      const ok = test(value);
      item.toggleAttribute('data-met', ok);
      item.querySelector('[data-req-state]').textContent = ok ? L('— feito', '— done', '— hecho') : L('— falta', '— missing', '— falta');
    });
  };
  signupPassword.addEventListener('input', updateReqs);
  const signupForm = enhanceForm(signup, {
    summary: false,
    rules: {
      email: (value) => (TAKEN_EMAILS.has(value.trim().toLowerCase()) ? `${takenEmail()} ${L('Entre ou recupere a senha.', 'Sign in or reset your password.', 'Entra o recupera la contraseña.')}` : null),
      senha: (value) => (value && !reqs.every(([, , test]) => test(value)) ? L('Falta cumprir os requisitos abaixo.', 'The requirements below aren’t met yet.', 'Faltan los requisitos de abajo.') : null),
    },
    onSubmit(data) {
      const done = busy(signupSubmit, creating());
      later(() => {
        done();
        toast(L(`Conta criada. Boas-vindas, ${data.nome.split(' ')[0]}!`, `Account created. Welcome, ${data.nome.split(' ')[0]}!`, `Cuenta creada. ¡Te damos la bienvenida, ${data.nome.split(' ')[0]}!`), { tone: 'success', icon: 'check' });
        signupForm.reset();
        updateReqs();
      }, 800);
    },
  });
  signup.addEventListener('submit', guard, true);
  cleanups.push(
    () => signup.removeEventListener('submit', guard, true),
    () => signupPassword.removeEventListener('input', updateReqs),
    () => signupForm.destroy(),
  );

  /* Recuperar senha: mesma resposta exista a conta ou não */
  const recoverCard = stageEl.querySelector('[data-lc-view="recover"]');
  const recover = recoverCard.querySelector('#lc-recover');
  const recoverSubmit = recover.querySelector('[data-lc-submit]');
  const sent = recoverCard.querySelector('[data-lc-sent]');
  function resetRecover() {
    recover.hidden = false;
    sent.hidden = true;
  }
  const recoverForm = enhanceForm(recover, {
    summary: false,
    onSubmit(data) {
      const done = busy(recoverSubmit, sending());
      later(() => {
        done();
        sent.querySelector('[data-lc-sent-text]').textContent = L(
          `Se houver uma conta com ${data.email}, o link chega em alguns minutos. Ele vale por 1 hora.`,
          `If there’s an account with ${data.email}, the link arrives in a few minutes. It’s valid for 1 hour.`,
          `Si hay una cuenta con ${data.email}, el enlace llega en unos minutos. Vale por 1 hora.`,
        );
        recoverForm.reset();
        recover.hidden = true;
        sent.hidden = false;
        sent.focus();
      }, 700);
    },
  });
  recover.addEventListener('submit', guard, true);
  cleanups.push(() => recover.removeEventListener('submit', guard, true), () => recoverForm.destroy());

  cleanups.push(mountDocNav(root), mountCodeCopy(root));

  return () => {
    timers.forEach(clearTimeout);
    cleanups.forEach((fn) => fn?.());
  };
}
