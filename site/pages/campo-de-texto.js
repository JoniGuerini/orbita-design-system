import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/campo-de-texto.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const SIZES = () => [
  ['sm', L('Pequeno', 'Small', 'Pequeño'), 32, L('Filtros e barras densas.', 'Filters and dense bars.', 'Filtros y barras densas.')],
  ['md', L('Médio', 'Medium', 'Mediano'), 40, L('Padrão de formulário.', 'The form default.', 'Predeterminado de formulario.')],
  ['lg', L('Grande', 'Large', 'Grande'), 48, L('Telas de toque e formulários curtos de destaque.', 'Touch screens and short, prominent forms.', 'Pantallas táctiles y formularios cortos destacados.')],
];

const STATES = () => [
  ['default', L('Padrão', 'Default', 'Predeterminado'), L('Contorno discreto; o rótulo identifica o campo.', 'A quiet outline; the label identifies the field.', 'Contorno discreto; la etiqueta identifica el campo.')],
  ['hover', 'Hover', L('O contorno fica mais forte.', 'The outline gets stronger.', 'El contorno se vuelve más fuerte.')],
  ['focus', L('Foco', 'Focus', 'Foco'), L('Contorno na cor de foco e um halo suave.', 'An outline in the focus color and a soft halo.', 'Contorno en el color de foco y un halo suave.')],
  ['readonly', L('Somente leitura', 'Read-only', 'Solo lectura'), L('Fundo rebaixado: dá para ler e copiar, não para editar.', 'A recessed background: you can read and copy, not edit.', 'Fondo hundido: se puede leer y copiar, no editar.')],
  ['disabled', L('Desativado', 'Disabled', 'Desactivado'), L('Opacidade reduzida e fora da ordem de foco.', 'Reduced opacity and out of the focus order.', 'Opacidad reducida y fuera del orden de foco.')],
  ['invalid', L('Inválido', 'Invalid', 'Inválido'), L('Contorno e mensagem de perigo, ligados por aria-describedby.', 'A danger outline and message, linked by aria-describedby.', 'Contorno y mensaje de peligro, vinculados por aria-describedby.')],
];

const ICONS = () => [
  ['none', L('Sem ícone', 'No icon', 'Sin ícono')],
  ['search', L('Busca à esquerda', 'Search on the left', 'Búsqueda a la izquierda')],
  ['mail', L('E-mail à esquerda', 'Email on the left', 'Correo a la izquierda')],
  ['clear', L('Limpar à direita', 'Clear on the right', 'Borrar a la derecha')],
];

const COUNTER_MAX = 40;
const slugError = () => L('Use só letras, números e hífen.', 'Use only letters, numbers, and hyphens.', 'Usa solo letras, números y guion.');
const projectHint = () => L('Aparece no menu e na busca.', 'Shows up in the menu and in search.', 'Aparece en el menú y en la búsqueda.');
const emailHint = () => L('Vamos usar para avisos da conta.', 'We’ll use it for account notices.', 'La usaremos para avisos de la cuenta.');
const emailError = () => L('Use um e-mail completo, como nome@empresa.com.', 'Use a full email, like name@company.com.', 'Usa un correo completo, como nombre@empresa.com.');
const examplePlaceholder = () => L('Ex.: Lume', 'E.g. Lume', 'Ej.: Lume');

/* ───────── Campo (playground, exemplos e código) ───────── */

function field(o) {
  const id = o.id;
  const sizeClass = o.size && o.size !== 'md' ? ` ds-field--${o.size}` : '';
  const forced = ['hover', 'focus'].includes(o.state) ? ` data-state="${o.state}"` : '';
  const invalid = o.state === 'invalid';
  const describedBy = [o.hint && !invalid && `${id}-hint`, invalid && `${id}-error`].filter(Boolean).join(' ');
  const value = o.state === 'readonly' ? o.value || 'lume-design-system' : o.value || '';
  const attrs = [
    `class="ds-field__input"`,
    `id="${id}"`,
    `type="${o.type ?? 'text'}"`,
    o.placeholder && `placeholder="${escapeHtml(o.placeholder)}"`,
    value && `value="${escapeHtml(value)}"`,
    o.state === 'disabled' && 'disabled',
    o.state === 'readonly' && 'readonly',
    invalid && 'aria-invalid="true"',
    describedBy && `aria-describedby="${describedBy}"`,
    o.counter && `maxlength="${COUNTER_MAX}"`,
    o.inert && 'tabindex="-1"',
  ].filter(Boolean);
  const lead = o.icon === 'search' || o.icon === 'mail' ? icon(o.icon, { size: o.size === 'sm' ? 16 : 18 }) : '';
  const clear =
    o.icon === 'clear'
      ? `<button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-field__action" aria-label="${L('Limpar', 'Clear', 'Borrar')}"${o.inert ? ' tabindex="-1"' : ''}>${icon('x', { size: 16 })}</button>`
      : '';
  const footer =
    invalid || o.hint || o.counter
      ? `<div class="ds-form-field__footer">
          ${invalid ? `<p class="ds-form-field__error" id="${id}-error">${icon('alert-circle', { size: 16 })}<span>${escapeHtml(o.error || slugError())}</span></p>` : ''}
          ${!invalid && o.hint ? `<p class="ds-form-field__hint" id="${id}-hint">${escapeHtml(o.hint)}</p>` : ''}
          ${o.counter ? `<span class="ds-form-field__counter" data-counter-for="${id}">${value.length}/${COUNTER_MAX}</span>` : ''}
        </div>`
      : '';
  return `<div class="ds-form-field${o.className ? ` ${o.className}` : ''}">
    <label class="ds-form-field__label" for="${id}">${escapeHtml(o.label || L('Rótulo', 'Label', 'Etiqueta'))}${o.optional ? `<span class="ds-form-field__optional">${L('opcional', 'optional', 'opcional')}</span>` : ''}</label>
    <div class="ds-field${sizeClass}"${forced}>${lead}<input ${attrs.join(' ')}>${clear}</div>
    ${footer}
  </div>`;
}

function fieldCode(s) {
  const id = L('nome-projeto', 'project-name', 'nombre-proyecto');
  const hintId = `${id}-${L('dica', 'hint', 'pista')}`;
  const errorId = `${id}-${L('erro', 'error', 'error')}`;
  const sizeClass = s.size !== 'md' ? ` ds-field--${s.size}` : '';
  const invalid = s.state === 'invalid';
  const describedBy = [s.hint === 'on' && !invalid && hintId, invalid && errorId].filter(Boolean).join(' ');
  const inputAttrs = [
    `class="ds-field__input"`,
    `id="${id}"`,
    `type="text"`,
    `placeholder="${examplePlaceholder()}"`,
    s.state === 'disabled' && 'disabled',
    s.state === 'readonly' && 'readonly value="lume-design-system"',
    invalid && 'aria-invalid="true"',
    describedBy && `aria-describedby="${describedBy}"`,
    s.counter === 'on' && `maxlength="${COUNTER_MAX}"`,
  ].filter(Boolean);
  const lines = [`<div class="ds-form-field">`, `  <label class="ds-form-field__label" for="${id}">${s.label || L('Rótulo', 'Label', 'Etiqueta')}</label>`, `  <div class="ds-field${sizeClass}">`];
  if (s.icon === 'search' || s.icon === 'mail') lines.push(`    <ds-icon name="${s.icon}" size="18"></ds-icon>`);
  lines.push(`    <input ${inputAttrs.join(' ')}>`);
  if (s.icon === 'clear') lines.push(`    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-field__action" aria-label="${L('Limpar', 'Clear', 'Borrar')}">`, `      <ds-icon name="x" size="16"></ds-icon>`, `    </button>`);
  lines.push(`  </div>`);
  if (invalid || s.hint === 'on' || s.counter === 'on') {
    lines.push(`  <div class="ds-form-field__footer">`);
    if (invalid) lines.push(`    <p class="ds-form-field__error" id="${errorId}">${slugError()}</p>`);
    else if (s.hint === 'on') lines.push(`    <p class="ds-form-field__hint" id="${hintId}">${projectHint()}</p>`);
    if (s.counter === 'on') lines.push(`    <span class="ds-form-field__counter">0/${COUNTER_MAX}</span>`);
    lines.push(`  </div>`);
  }
  lines.push(`</div>`);
  return lines.join('\n');
}

/* ───────── Página ───────── */

const sectionHead = (id, title, desc, aside = '') => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>${aside}
</header>`;

export default function renderCampoDeTexto(page) {
  const sizes = SIZES();
  const states = STATES();
  const fullName = L('Nome completo', 'Full name', 'Nombre completo');
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Para a pessoa escrever. Rótulo sempre visível, dica antes do erro e mensagens que dizem como resolver.', 'For people to type in. An always-visible label, a hint before the error, and messages that say how to fix it.', 'Para que la persona escriba. Etiqueta siempre visible, pista antes del error y mensajes que dicen cómo resolverlo.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">${sizes.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estados', 'states', 'estados')}</dt><dd class="doc-stat__value">${states.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('formatos', 'formats', 'formatos')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('altura padrão', 'default height', 'altura predeterminada')}</dt><dd class="doc-stat__value">40 px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['multilinha', L('Multilinha', 'Multiline', 'Multilínea')],
        ['validacao', L('Validação', 'Validation', 'Validación')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', L('Monte o campo, veja nos dois temas e copie o código. O campo do palco funciona: digite para ver o contador.', 'Build the field, check it in both themes, and copy the code. The field on the stage works: type to see the counter.', 'Arma el campo, míralo en los dos temas y copia el código. El campo del escenario funciona: escribe para ver el contador.'))}
      ${playgroundMarkup('campo')}
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      ${sectionHead('anatomia', L('Anatomia', 'Anatomy', 'Anatomía'), L('Seis partes; só rótulo e contêiner são obrigatórios.', 'Six parts; only the label and the container are required.', 'Seis partes; solo la etiqueta y el contenedor son obligatorios.'))}
      <div class="tf-anatomy">
        <div class="tf-anatomy__stage" aria-hidden="true" inert>
          <div class="ds-form-field tf-anatomy__field">
            <span class="ds-form-field__label tf-anatomy__part" data-num="1">${L('E-mail de trabalho', 'Work email', 'Correo de trabajo')}</span>
            <div class="ds-field tf-anatomy__part" data-num="2">
              <span class="tf-anatomy__part tf-anatomy__part--inline" data-num="3">${icon('mail', { size: 18 })}</span>
              <span class="tf-anatomy__part tf-anatomy__part--grow ds-field__placeholder" data-num="4">${L('nome@empresa.com', 'name@company.com', 'nombre@empresa.com')}</span>
            </div>
            <div class="ds-form-field__footer">
              <span class="ds-form-field__hint tf-anatomy__part" data-num="5">${emailHint()}</span>
              <span class="ds-form-field__counter tf-anatomy__part" data-num="6">0/40</span>
            </div>
          </div>
        </div>
        <ol class="tf-anatomy__legend" role="list">
          ${[
            [L('Rótulo', 'Label', 'Etiqueta'), L(`Sempre visível, acima do campo, em ${ic('text.label-md')}. Marque o que é <em>opcional</em> — não o obrigatório.`, `Always visible, above the field, in ${ic('text.label-md')}. Mark what’s <em>optional</em> — not what’s required.`, `Siempre visible, encima del campo, en ${ic('text.label-md')}. Marca lo que es <em>opcional</em> — no lo obligatorio.`)],
            [L('Contêiner', 'Container', 'Contenedor'), L(`Altura ${ic('size.control.*')}, contorno ${ic('border.control')}, raio ${ic('radius.md')}.`, `Height ${ic('size.control.*')}, outline ${ic('border.control')}, radius ${ic('radius.md')}.`, `Altura ${ic('size.control.*')}, contorno ${ic('border.control')}, radio ${ic('radius.md')}.`)],
            [L('Ícone', 'Icon', 'Ícono'), L('Opcional. Só quando ajuda a reconhecer o tipo de dado — busca, e-mail, data.', 'Optional. Only when it helps recognize the kind of data — search, email, date.', 'Opcional. Solo cuando ayuda a reconocer el tipo de dato — búsqueda, correo, fecha.')],
            [L('Texto e placeholder', 'Text and placeholder', 'Texto y placeholder'), L('O placeholder dá um exemplo do formato; nunca substitui o rótulo.', 'The placeholder gives an example of the format; it never replaces the label.', 'El placeholder da un ejemplo del formato; nunca reemplaza la etiqueta.')],
            [L('Dica ou erro', 'Hint or error', 'Pista o error'), L('Uma linha logo abaixo. O erro ocupa o lugar da dica e diz como resolver.', 'One line right below. The error takes the hint’s place and says how to fix it.', 'Una línea justo debajo. El error ocupa el lugar de la pista y dice cómo resolverlo.')],
            [L('Contador', 'Counter', 'Contador'), L('Só quando existe limite. Fica vermelho ao passar do máximo.', 'Only when there’s a limit. Turns red past the maximum.', 'Solo cuando hay un límite. Se pone rojo al pasar del máximo.')],
          ]
            .map(([title, text], i) => `<li><span class="tf-anatomy__num">${i + 1}</span><div><p class="tf-anatomy__title">${title}</p><p class="tf-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      ${sectionHead('tamanhos', L('Tamanhos', 'Sizes', 'Tamaños'), L(`Dentro de um ${ic('.ds-form-field')} o padrão é o médio. Use o mesmo tamanho dos botões ao lado.`, `Inside a ${ic('.ds-form-field')} the default is medium. Use the same size as the buttons next to it.`, `Dentro de un ${ic('.ds-form-field')} el predeterminado es el mediano. Usa el mismo tamaño de los botones al lado.`))}
      <div class="tf-sizes">
        ${sizes.map(
          ([id, name, h, text]) => `<article class="tf-size">
            <div class="tf-size__preview" inert>${field({ id: `tf-size-${id}`, label: name, size: id, icon: 'search', placeholder: L('Buscar', 'Search', 'Buscar'), inert: true })}</div>
            <div class="tf-size__body">
              <p class="cd-example__name">${name}<code>${id === 'md' ? L('padrão', 'default', 'predeterminado') : `ds-field--${id}`}</code></p>
              <p class="cd-example__text">${h} px · ${text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', L('Estados', 'States', 'Estados'), L(`Hover e foco também podem ser forçados com ${ic('data-state')} no ${ic('.ds-field')}, para documentar e testar.`, `Hover and focus can also be forced with ${ic('data-state')} on ${ic('.ds-field')}, to document and test.`, `Hover y foco también se pueden forzar con ${ic('data-state')} en ${ic('.ds-field')}, para documentar y probar.`))}
      <div class="cd-grid tf-states">
        ${states.map(
          ([id, name, text]) => `<article class="cd-example">
            <div class="cd-example__preview tf-states__preview" inert>
              ${field({ id: `tf-state-${id}`, label: L('Slug do projeto', 'Project slug', 'Slug del proyecto'), state: id, placeholder: 'lume-ds', value: id === 'invalid' ? 'Lume DS!' : '', inert: true })}
            </div>
            <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="multilinha" aria-labelledby="multilinha-title">
      ${sectionHead('multilinha', L('Multilinha', 'Multiline', 'Multilínea'), L(`Para textos de mais de uma frase. Mesmo contêiner, com ${ic('.ds-field--multiline')} e um ${ic('&lt;textarea&gt;')} que cresce na vertical.`, `For text longer than one sentence. The same container, with ${ic('.ds-field--multiline')} and a ${ic('&lt;textarea&gt;')} that grows vertically.`, `Para textos de más de una frase. El mismo contenedor, con ${ic('.ds-field--multiline')} y un ${ic('&lt;textarea&gt;')} que crece en vertical.`))}
      <div class="tf-split">
        <div class="tf-split__demo">
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="tf-bio">${L('Descrição do projeto', 'Project description', 'Descripción del proyecto')}<span class="ds-form-field__optional">${L('opcional', 'optional', 'opcional')}</span></label>
            <div class="ds-field ds-field--multiline">
              <textarea class="ds-field__input" id="tf-bio" rows="4" maxlength="200" aria-describedby="tf-bio-hint" placeholder="${L('Conte em poucas linhas para que serve.', 'Say in a few lines what it’s for.', 'Cuenta en pocas líneas para qué sirve.')}">${L('Um design system plano e calmo, com tokens em OKLCH.', 'A flat, calm design system, with OKLCH tokens.', 'Un design system plano y tranquilo, con tokens en OKLCH.')}</textarea>
            </div>
            <div class="ds-form-field__footer">
              <p class="ds-form-field__hint" id="tf-bio-hint">${L('Aparece no topo da página do projeto.', 'Shows up at the top of the project page.', 'Aparece arriba en la página del proyecto.')}</p>
              <span class="ds-form-field__counter" data-counter-for="tf-bio">0/200</span>
            </div>
          </div>
        </div>
        <div class="tf-split__code">${codeBlock(`<div class="ds-field ds-field--multiline">\n  <textarea class="ds-field__input" id="${L('descricao', 'description', 'descripcion')}" rows="4"></textarea>\n</div>`)}</div>
      </div>
    </section>

    <section class="doc-section" id="validacao" aria-labelledby="validacao-title">
      ${sectionHead('validacao', L('Validação', 'Validation', 'Validación'), L('Valide quando a pessoa sai do campo ou envia — nunca a cada tecla. A mensagem troca a dica e diz o que fazer.', 'Validate when people leave the field or submit — never on every keystroke. The message replaces the hint and says what to do.', 'Valida cuando la persona sale del campo o envía — nunca en cada tecla. El mensaje reemplaza la pista y dice qué hacer.'))}
      <form class="tf-validate" novalidate data-validate>
        <div class="tf-validate__fields">
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="tf-email">${L('E-mail de trabalho', 'Work email', 'Correo de trabajo')}</label>
            <div class="ds-field">${icon('mail', { size: 18 })}<input class="ds-field__input" id="tf-email" type="email" autocomplete="email" placeholder="${L('nome@empresa.com', 'name@company.com', 'nombre@empresa.com')}" aria-describedby="tf-email-msg"></div>
            <div class="ds-form-field__footer"><p class="ds-form-field__hint" id="tf-email-msg" data-msg>${emailHint()}</p></div>
          </div>
        </div>
        <div class="tf-validate__actions">
          <button type="submit" class="ds-btn ds-btn--primary">${L('Continuar', 'Continue', 'Continuar')}</button>
          <button type="reset" class="ds-btn ds-btn--ghost">${L('Limpar', 'Clear', 'Borrar')}</button>
        </div>
      </form>
      <div class="tf-messages">
        <div class="tf-message tf-message--dont"><p class="tf-message__head">${icon('x-circle', { size: 18 })}${L('Evite', 'Avoid', 'Evita')}</p><p class="tf-message__text">${L('“E-mail inválido.”', '“Invalid email.”', '“Correo inválido.”')}</p></div>
        <div class="tf-message tf-message--do"><p class="tf-message__head">${icon('check-circle', { size: 18 })}${L('Prefira', 'Prefer', 'Prefiere')}</p><p class="tf-message__text">“${emailError()}”</p></div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="acessibilidade-title">
      ${sectionHead('acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad'), L('O que garante que todo mundo consiga preencher.', 'What makes sure everyone can fill it in.', 'Lo que garantiza que todo el mundo pueda completarlo.'))}
      ${a11yList([
        [L('Rótulo de verdade', 'A real label', 'Una etiqueta de verdad'), L(`${ic('&lt;label for&gt;')} ligado ao ${ic('id')} do campo. Clicar no rótulo foca o campo; o leitor de tela anuncia o nome.`, `${ic('&lt;label for&gt;')} linked to the field’s ${ic('id')}. Clicking the label focuses the field; the screen reader announces the name.`, `${ic('&lt;label for&gt;')} vinculado al ${ic('id')} del campo. Hacer clic en la etiqueta enfoca el campo; el lector de pantalla anuncia el nombre.`)],
        [L('Placeholder não é rótulo', 'A placeholder isn’t a label', 'El placeholder no es una etiqueta'), L('Some ao digitar e tem contraste menor. Use só como exemplo de formato.', 'It disappears when typing and has lower contrast. Use it only as a format example.', 'Desaparece al escribir y tiene menos contraste. Úsalo solo como ejemplo de formato.')],
        [L('Dica e erro anunciados', 'Announced hint and error', 'Pista y error anunciados'), L(`${ic('aria-describedby')} aponta para a dica ou para o erro, e o campo inválido ganha ${ic('aria-invalid="true"')}.`, `${ic('aria-describedby')} points to the hint or the error, and the invalid field gets ${ic('aria-invalid="true"')}.`, `${ic('aria-describedby')} apunta a la pista o al error, y el campo inválido gana ${ic('aria-invalid="true"')}.`)],
        [L('Erro não depende só da cor', 'Errors don’t rely on color alone', 'El error no depende solo del color'), L('A mensagem tem ícone e texto, além do contorno vermelho.', 'The message has an icon and text, besides the red outline.', 'El mensaje tiene ícono y texto, además del contorno rojo.')],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab entra, Shift + Tab volta; nada prende o foco dentro do campo.', 'Tab enters, Shift + Tab goes back; nothing traps focus inside the field.', 'Tab entra, Shift + Tab vuelve; nada atrapa el foco dentro del campo.'), ['Tab', 'Shift + Tab']],
        [L('Preenchimento automático', 'Autofill', 'Autocompletar'), L(`Use ${ic('type')} e ${ic('autocomplete')} certos (email, name, tel) para o navegador e os gerenciadores ajudarem.`, `Use the right ${ic('type')} and ${ic('autocomplete')} (email, name, tel) so the browser and password managers can help.`, `Usa el ${ic('type')} y el ${ic('autocomplete')} correctos (email, name, tel) para que el navegador y los gestores ayuden.`)],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', L('Tokens usados', 'Tokens used', 'Tokens usados'), L('Tudo o que o campo consome.', 'Everything the field consumes.', 'Todo lo que consume el campo.'))}
      ${tokenTable([
        ['size.control.md', L('Altura (médio)', 'Height (medium)', 'Altura (mediano)')],
        ['radius.md', L('Raio', 'Radius', 'Radio')],
        ['text.label-md', L('Rótulo', 'Label', 'Etiqueta')],
        ['text.body-sm', L('Texto digitado, dica e erro', 'Typed text, hint, and error', 'Texto escrito, pista y error')],
        ['space.075', L('Rótulo → campo → dica', 'Label → field → hint', 'Etiqueta → campo → pista')],
        ['color.border.control', L('Contorno', 'Outline', 'Contorno')],
        ['color.border.strong', L('Contorno no hover', 'Outline on hover', 'Contorno en hover')],
        ['color.border.focus', L('Contorno e halo no foco', 'Focus outline and halo', 'Contorno y halo en el foco')],
        ['color.fg.subtle', L('Placeholder, ícone e dica', 'Placeholder, icon, and hint', 'Placeholder, ícono y pista')],
        ['color.bg.sunken', L('Fundo somente leitura', 'Read-only background', 'Fondo de solo lectura')],
        ['color.danger.solid', L('Contorno inválido', 'Invalid outline', 'Contorno inválido')],
        ['color.danger.fg', L('Mensagem de erro', 'Error message', 'Mensaje de error')],
        ['duration.fast', L('Transição do contorno', 'Outline transition', 'Transición del contorno')],
        ['opacity.disabled', L('Desativado', 'Disabled', 'Desactivado')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', L('Uso', 'Usage', 'Uso'), L('Três regras para formulários que não dão trabalho.', 'Three rules for forms that don’t give people a hard time.', 'Tres reglas para formularios que no dan trabajo.'))}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: rótulo em cima, dica embaixo', 'Do: label on top, hint below', 'Haz: etiqueta arriba, pista abajo')}</p>
          <div class="tf-usage" inert>${field({ id: 'tf-do', label: fullName, placeholder: L('Ex.: Ana Souza', 'E.g. Ana Souza', 'Ej.: Ana Souza'), hint: L('Como aparece nos documentos.', 'As it appears on your documents.', 'Como aparece en los documentos.'), inert: true })}</div>
          <p class="usage-card__text">${L('A pessoa sabe o que escrever antes de começar.', 'People know what to write before they start.', 'La persona sabe qué escribir antes de empezar.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: placeholder no lugar do rótulo', 'Avoid: a placeholder instead of a label', 'Evita: placeholder en lugar de etiqueta')}</p>
          <div class="tf-usage" inert><div class="ds-field ds-field--md"><input class="ds-field__input" placeholder="${fullName}" tabindex="-1" aria-label="${fullName}"></div></div>
          <p class="usage-card__text">${L('Ao digitar, o “rótulo” some — e com ele, o contexto.', 'When typing, the “label” disappears — and so does the context.', 'Al escribir, la “etiqueta” desaparece — y con ella, el contexto.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Tamanho conta o que cabe', 'Size tells what fits', 'El tamaño dice lo que cabe')}</p>
          <div class="tf-usage tf-usage--row" inert>
            <div class="ds-field ds-field--md tf-usage__short"><input class="ds-field__input" placeholder="${L('00000-000', '00000', '00000')}" tabindex="-1" aria-label="${L('CEP', 'ZIP code', 'Código postal')}"></div>
            <div class="ds-field ds-field--md"><input class="ds-field__input" placeholder="${L('Rua, número', 'Street, number', 'Calle, número')}" tabindex="-1" aria-label="${L('Endereço', 'Address', 'Dirección')}"></div>
          </div>
          <p class="usage-card__text">${L('Um CEP curto num campo curto já explica o formato.', 'A short ZIP code in a short field already explains the format.', 'Un código postal corto en un campo corto ya explica el formato.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

/* ───────── Comportamento ───────── */

function syncCounters(scope) {
  scope.querySelectorAll('[data-counter-for]').forEach((counter) => {
    const input = scope.querySelector(`#${counter.dataset.counterFor}`);
    if (!input) return;
    const max = Number(input.getAttribute('maxlength')) || COUNTER_MAX;
    counter.textContent = `${input.value.length}/${max}`;
    counter.toggleAttribute('data-over', input.value.length >= max);
  });
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'campo',
    controls: [
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: SIZES().map(([value, label]) => ({ value, label })) },
      { id: 'icon', label: L('Ícone', 'Icon', 'Ícono'), value: 'none', options: ICONS().map(([value, label]) => ({ value, label })) },
      { id: 'state', label: L('Estado', 'State', 'Estado'), value: 'default', options: STATES().map(([value, label]) => ({ value, label })) },
      { id: 'hint', label: L('Dica', 'Hint', 'Pista'), value: 'on', options: [{ value: 'on', label: L('Com dica', 'With hint', 'Con pista') }, { value: 'off', label: L('Sem dica', 'Without hint', 'Sin pista') }] },
      { id: 'counter', label: L('Contador', 'Counter', 'Contador'), value: 'off', options: [{ value: 'off', label: L('Sem contador', 'Without counter', 'Sin contador') }, { value: 'on', label: L('Com contador', 'With counter', 'Con contador') }] },
    ],
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: L('Nome do projeto', 'Project name', 'Nombre del proyecto') },
    render: (s) =>
      `<div class="tf-stage">${field({
        id: 'tf-playground',
        label: s.label,
        size: s.size,
        icon: s.icon,
        state: s.state,
        hint: s.hint === 'on' ? projectHint() : '',
        counter: s.counter === 'on',
        placeholder: examplePlaceholder(),
        value: s.state === 'invalid' ? 'Lume DS!' : '',
      })}</div>`,
    code: fieldCode,
  });

  // contadores ao vivo (playground e multilinha)
  const onInput = (event) => {
    if (event.target.matches?.('.ds-field__input')) syncCounters(root);
  };
  root.addEventListener('input', onInput);
  syncCounters(root);

  // botão "limpar" dentro do campo
  const onClick = (event) => {
    const clear = event.target.closest('.ds-field__action');
    if (!clear) return;
    const input = clear.parentElement.querySelector('.ds-field__input');
    input.value = '';
    input.focus();
    syncCounters(root);
  };
  root.addEventListener('click', onClick);

  // validação no envio e ao sair do campo
  const form = root.querySelector('[data-validate]');
  const email = form.querySelector('#tf-email');
  const msg = form.querySelector('[data-msg]');
  const validate = () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    email.setAttribute('aria-invalid', String(!ok));
    msg.className = ok ? 'ds-form-field__hint' : 'ds-form-field__error';
    msg.innerHTML = ok ? L('Tudo certo.', 'All good.', 'Todo bien.') : `${icon('alert-circle', { size: 16 })}<span>${emailError()}</span>`;
    return ok;
  };
  const onSubmit = (event) => {
    event.preventDefault();
    if (!validate()) email.focus();
  };
  const onBlur = () => email.value && validate();
  const onReset = () => {
    email.removeAttribute('aria-invalid');
    msg.className = 'ds-form-field__hint';
    msg.textContent = emailHint();
  };
  form.addEventListener('submit', onSubmit);
  form.addEventListener('reset', onReset);
  email.addEventListener('blur', onBlur);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  // o playground recria o campo a cada mudança: mantém o contador em dia
  const preview = root.querySelector('[data-playground="campo"] [data-preview]');
  const observer = new MutationObserver(() => syncCounters(root));
  observer.observe(preview, { childList: true });

  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
    observer.disconnect();
    root.removeEventListener('input', onInput);
    root.removeEventListener('click', onClick);
    form.removeEventListener('submit', onSubmit);
    form.removeEventListener('reset', onReset);
    email.removeEventListener('blur', onBlur);
  };
}
