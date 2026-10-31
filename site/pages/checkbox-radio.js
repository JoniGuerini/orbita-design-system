import { icon } from '../../ds/icons/icons.js';
import { formatNumber, numberFormat } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L, ratio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/checkbox-radio.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const STATES = () => [
  ['unchecked', L('Desmarcado', 'Unchecked', 'Desmarcado')],
  ['checked', L('Marcado', 'Checked', 'Marcado')],
  ['indeterminate', L('Indeterminado', 'Indeterminate', 'Indeterminado')],
  ['hover', 'Hover'],
  ['focus', L('Foco', 'Focus', 'Foco')],
  ['disabled', L('Desativado', 'Disabled', 'Desactivado')],
  ['invalid', L('Inválido', 'Invalid', 'Inválido')],
];

const monthly = () => L('Uma vez por mês, sem spam.', 'Once a month, no spam.', 'Una vez al mes, sin spam.');
const price = (n) => numberFormat({ style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(n);

let uid = 0;

/* ───────── Controle (playground, exemplos e código) ───────── */

function choice(o) {
  const kind = o.kind === 'radio' ? 'radio' : 'checkbox';
  const state = kind === 'radio' && o.state === 'indeterminate' ? 'unchecked' : o.state;
  const id = o.id ?? `cr-${++uid}`;
  const attrs = [
    `type="${kind}"`,
    `class="ds-${kind}__input"`,
    `id="${id}"`,
    o.name && `name="${o.name}"`,
    o.value && `value="${escapeHtml(o.value)}"`,
    (state === 'checked' || o.checked) && 'checked',
    state === 'disabled' && 'disabled',
    state === 'invalid' && 'aria-invalid="true"',
    state === 'indeterminate' && 'data-indeterminate',
    ['hover', 'focus'].includes(state) && `data-state="${state}"`,
    o.inert && 'tabindex="-1"',
    o.extra,
  ].filter(Boolean);
  const description = o.description ? `<span class="ds-choice__description">${escapeHtml(o.description)}</span>` : '';
  return `<label class="ds-${kind}">
    <input ${attrs.join(' ')}>
    <span class="ds-choice__text"><span class="ds-choice__label">${escapeHtml(o.label)}</span>${description}</span>
  </label>`;
}

function choiceCode(s) {
  const kind = s.kind === 'radio' ? 'radio' : 'checkbox';
  const state = kind === 'radio' && s.state === 'indeterminate' ? 'unchecked' : s.state;
  const attrs = [
    `type="${kind}"`,
    `class="ds-${kind}__input"`,
    kind === 'radio' && `name="${L('plano', 'plan', 'plan')}"`,
    state === 'checked' && 'checked',
    state === 'disabled' && 'disabled',
    state === 'invalid' && `aria-invalid="true" aria-describedby="${L('erro-termos', 'terms-error', 'error-terminos')}"`,
  ].filter(Boolean);
  const lines = [`<label class="ds-${kind}">`, `  <input ${attrs.join(' ')}>`, `  <span class="ds-choice__text">`, `    <span class="ds-choice__label">${s.label || L('Rótulo', 'Label', 'Etiqueta')}</span>`];
  if (s.description === 'on') lines.push(`    <span class="ds-choice__description">${monthly()}</span>`);
  lines.push(`  </span>`, `</label>`);
  if (state === 'indeterminate') lines.push('', `<!-- ${L('indeterminado só existe via JavaScript', 'indeterminate only exists through JavaScript', 'el indeterminado solo existe vía JavaScript')} -->`, `<script>input.indeterminate = true;</script>`);
  return lines.join('\n');
}

/** :indeterminate não tem atributo: aplica a propriedade em quem pediu. */
function applyIndeterminate(scope) {
  scope.querySelectorAll('input[data-indeterminate]').forEach((input) => (input.indeterminate = true));
}

/* ───────── Página ───────── */

const sectionHead = (id, title, desc) => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>
</header>`;

const TEAM = ['Ana Souza', 'Bruno Lima', 'Carla Dias'];

export default function renderCheckboxRadio(page) {
  const states = STATES();
  const space = L('Espaço', 'Space', 'Espacio');
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Checkbox para marcar itens independentes; radio para escolher um só entre poucas opções. Os dois com rótulo clicável.', 'A checkbox to check independent items; a radio to pick just one among a few options. Both with a clickable label.', 'Checkbox para marcar elementos independientes; radio para elegir uno solo entre pocas opciones. Los dos con etiqueta clicable.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('controles', 'controls', 'controles')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estados', 'states', 'estados')}</dt><dd class="doc-stat__value">${states.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanho', 'size', 'tamaño')}</dt><dd class="doc-stat__value">18 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('área de clique', 'click area', 'área de clic')}</dt><dd class="doc-stat__value">${L('rótulo', 'label', 'etiqueta')}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['qual', L('Checkbox ou radio', 'Checkbox or radio', 'Checkbox o radio')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['grupos', L('Grupos', 'Groups', 'Grupos')],
        ['todos', L('Selecionar todos', 'Select all', 'Seleccionar todos')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', L('Inputs nativos com aparência própria. O do palco funciona — clique no rótulo.', 'Native inputs with their own look. The one on the stage works — click the label.', 'Inputs nativos con aspecto propio. El del escenario funciona — haz clic en la etiqueta.'))}
      ${playgroundMarkup('escolha')}
    </section>

    <section class="doc-section" id="qual" aria-labelledby="qual-title">
      ${sectionHead('qual', L('Checkbox ou radio?', 'Checkbox or radio?', '¿Checkbox o radio?'), L('A pergunta é uma só: dá para marcar mais de uma opção?', 'There’s only one question: can people pick more than one option?', 'La pregunta es una sola: ¿se puede marcar más de una opción?'))}
      <div class="cr-compare">
        <article class="cr-compare__card">
          <div class="cr-compare__stage">
            <fieldset class="ds-choice-group">
              <legend class="ds-choice-group__legend">${L('Avisar por', 'Notify by', 'Avisar por')}</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'checkbox', id: 'cr-q-email', label: L('E-mail', 'Email', 'Correo'), checked: true })}
                ${choice({ kind: 'checkbox', id: 'cr-q-push', label: L('Notificação no celular', 'Phone notification', 'Notificación en el móvil'), checked: true })}
                ${choice({ kind: 'checkbox', id: 'cr-q-sms', label: 'SMS' })}
              </div>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Checkbox<code>ds-checkbox</code></p><p class="cd-example__text">${L('Várias, nenhuma ou todas. Cada uma vale sozinha.', 'Several, none, or all. Each one stands on its own.', 'Varias, ninguna o todas. Cada una vale sola.')}</p></div>
        </article>
        <article class="cr-compare__card">
          <div class="cr-compare__stage">
            <fieldset class="ds-choice-group">
              <legend class="ds-choice-group__legend">${L('Plano', 'Plan', 'Plan')}</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'radio', id: 'cr-q-mensal', name: 'cr-plano', value: 'mensal', label: L('Mensal', 'Monthly', 'Mensual'), description: L(`${price(49)} por mês`, `${price(49)} per month`, `${price(49)} al mes`) })}
                ${choice({ kind: 'radio', id: 'cr-q-anual', name: 'cr-plano', value: 'anual', label: L('Anual', 'Yearly', 'Anual'), description: L(`${price(490)} por ano — dois meses grátis`, `${price(490)} per year — two months free`, `${price(490)} al año — dos meses gratis`), checked: true })}
              </div>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Radio<code>ds-radio</code></p><p class="cd-example__text">${L('Exatamente uma. Escolher outra desmarca a anterior.', 'Exactly one. Picking another unchecks the previous one.', 'Exactamente una. Elegir otra desmarca la anterior.')}</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', L('Estados', 'States', 'Estados'), L(`Marcado usa a cor da marca; o contorno desmarcado tem contraste de ${ratio(3, 0)} para ser visto sem depender do rótulo. Hover e foco podem ser forçados com ${ic('data-state')}.`, `Checked uses the brand color; the unchecked outline has ${ratio(3, 0)} contrast so it can be seen without relying on the label. Hover and focus can be forced with ${ic('data-state')}.`, `Marcado usa el color de la marca; el contorno desmarcado tiene contraste de ${ratio(3, 0)} para verse sin depender de la etiqueta. Hover y foco se pueden forzar con ${ic('data-state')}.`))}
      <div class="cr-states" inert>
        <div class="cr-states__grid">
          <span></span>
          ${states.map(([, label]) => `<span class="cr-states__head">${label}</span>`).join('')}
          ${['checkbox', 'radio']
            .map(
              (kind) => `<span class="cr-states__row">${kind === 'checkbox' ? 'Checkbox' : 'Radio'}</span>
                ${states.map(([state]) =>
                  kind === 'radio' && state === 'indeterminate'
                    ? '<span class="cr-states__cell cr-states__cell--na">—</span>'
                    : `<span class="cr-states__cell"><span class="ds-${kind}">${choice({ kind, state, label: '', inert: true }).match(/<input[^>]*>/)[0]}</span></span>`,
                ).join('')}`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="doc-section" id="grupos" aria-labelledby="grupos-title">
      ${sectionHead('grupos', L('Grupos', 'Groups', 'Grupos'), L(`Opções relacionadas ficam num ${ic('&lt;fieldset&gt;')} com ${ic('&lt;legend&gt;')}: o leitor de tela anuncia a pergunta antes das respostas.`, `Related options sit in a ${ic('&lt;fieldset&gt;')} with a ${ic('&lt;legend&gt;')}: the screen reader announces the question before the answers.`, `Las opciones relacionadas van en un ${ic('&lt;fieldset&gt;')} con ${ic('&lt;legend&gt;')}: el lector de pantalla anuncia la pregunta antes de las respuestas.`))}
      <div class="cd-grid cr-groups">
        <article class="cd-example">
          <div class="cd-example__preview cr-group-preview">
            <fieldset class="ds-choice-group" aria-describedby="cr-g1-hint">
              <legend class="ds-choice-group__legend">${L('Mostrar no painel', 'Show on the dashboard', 'Mostrar en el panel')}</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'checkbox', label: L('Visitas', 'Visits', 'Visitas'), checked: true })}
                ${choice({ kind: 'checkbox', label: L('Conversões', 'Conversions', 'Conversiones'), checked: true })}
                ${choice({ kind: 'checkbox', label: L('Receita', 'Revenue', 'Ingresos') })}
              </div>
              <p class="ds-choice-group__hint" id="cr-g1-hint">${L('Escolha até três métricas.', 'Choose up to three metrics.', 'Elige hasta tres métricas.')}</p>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Vertical', 'Vertical', 'Vertical')}<code>${L('padrão', 'default', 'predeterminado')}</code></p><p class="cd-example__text">${L('Uma opção por linha — mais fácil de ler e de clicar.', 'One option per line — easier to read and to click.', 'Una opción por línea — más fácil de leer y de hacer clic.')}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview cr-group-preview">
            <fieldset class="ds-choice-group ds-choice-group--inline">
              <legend class="ds-choice-group__legend">${L('Tema', 'Theme', 'Tema')}</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'radio', name: 'cr-g2', label: L('Escuro', 'Dark', 'Oscuro'), checked: true })}
                ${choice({ kind: 'radio', name: 'cr-g2', label: L('Claro', 'Light', 'Claro') })}
                ${choice({ kind: 'radio', name: 'cr-g2', label: L('Sistema', 'System', 'Sistema') })}
              </div>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Em linha', 'Inline', 'En línea')}<code>ds-choice-group--inline</code></p><p class="cd-example__text">${L('Para duas ou três opções curtas.', 'For two or three short options.', 'Para dos o tres opciones cortas.')}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview cr-group-preview">
            <fieldset class="ds-choice-group" aria-describedby="cr-g3-error">
              <legend class="ds-choice-group__legend">${L('Termos', 'Terms', 'Términos')}</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'checkbox', state: 'invalid', label: L('Li e aceito os termos de uso', 'I have read and accept the terms of use', 'Leí y acepto los términos de uso'), extra: 'aria-describedby="cr-g3-error"' })}
              </div>
              <p class="ds-choice-group__error" id="cr-g3-error">${icon('alert-circle', { size: 16 })}<span>${L('Aceite os termos para criar a conta.', 'Accept the terms to create the account.', 'Acepta los términos para crear la cuenta.')}</span></p>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Com erro', 'With error', 'Con error')}</p><p class="cd-example__text">${L(`Mensagem abaixo do grupo, ligada por ${ic('aria-describedby')}.`, `A message below the group, linked by ${ic('aria-describedby')}.`, `Mensaje debajo del grupo, vinculado por ${ic('aria-describedby')}.`)}</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="todos" aria-labelledby="todos-title">
      ${sectionHead('todos', L('Selecionar todos', 'Select all', 'Seleccionar todos'), L('O estado indeterminado só faz sentido num checkbox que resume outros: alguns marcados, outros não.', 'The indeterminate state only makes sense in a checkbox that summarizes others: some checked, some not.', 'El estado indeterminado solo tiene sentido en un checkbox que resume otros: algunos marcados, otros no.'))}
      <div class="cr-all">
        <div class="cr-all__demo" data-select-all>
          ${choice({ kind: 'checkbox', id: 'cr-all', label: L('Toda a equipe', 'The whole team', 'Todo el equipo'), description: L(`${formatNumber(TEAM.length)} pessoas`, `${formatNumber(TEAM.length)} people`, `${formatNumber(TEAM.length)} personas`), extra: 'data-parent aria-controls="cr-all-list"' })}
          <div class="cr-all__children" id="cr-all-list">
            ${TEAM.map((name, i) => choice({ kind: 'checkbox', id: `cr-all-${i}`, label: name, checked: i === 0, extra: 'data-child' })).join('')}
          </div>
        </div>
        <div class="cr-all__code">${codeBlock(L(
          'const marcados = filhos.filter((c) => c.checked).length;\npai.checked = marcados === filhos.length;\npai.indeterminate = marcados > 0 && marcados < filhos.length;',
          'const checked = children.filter((c) => c.checked).length;\nparent.checked = checked === children.length;\nparent.indeterminate = checked > 0 && checked < children.length;',
          'const marcados = hijos.filter((c) => c.checked).length;\npadre.checked = marcados === hijos.length;\npadre.indeterminate = marcados > 0 && marcados < hijos.length;',
        ))}</div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="acessibilidade-title">
      ${sectionHead('acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad'), L('Por baixo são inputs nativos — teclado e leitor de tela já funcionam.', 'Underneath they’re native inputs — keyboard and screen reader already work.', 'Por debajo son inputs nativos — teclado y lector de pantalla ya funcionan.'))}
      ${a11yList([
        [L('Rótulo envolve o input', 'The label wraps the input', 'La etiqueta envuelve el input'), L(`O ${ic('&lt;label&gt;')} inteiro é área de clique, e o nome do controle vem do texto.`, `The whole ${ic('&lt;label&gt;')} is clickable, and the control’s name comes from the text.`, `Toda la ${ic('&lt;label&gt;')} es área de clic, y el nombre del control viene del texto.`)],
        [L('Checkbox: Espaço marca', 'Checkbox: Space checks', 'Checkbox: Espacio marca'), L('Tab vai de um checkbox ao próximo; Espaço marca e desmarca.', 'Tab moves from one checkbox to the next; Space checks and unchecks.', 'Tab va de un checkbox al siguiente; Espacio marca y desmarca.'), ['Tab', space]],
        [L('Radio: setas escolhem', 'Radio: arrows choose', 'Radio: las flechas eligen'), L('O grupo é uma parada de Tab só; as setas mudam a opção escolhida.', 'The group is a single Tab stop; the arrows change the chosen option.', 'El grupo es una sola parada de Tab; las flechas cambian la opción elegida.'), ['Tab', '↑', '↓']],
        [L('Pergunta anunciada', 'An announced question', 'Pregunta anunciada'), L(`Com ${ic('&lt;fieldset&gt;')} e ${ic('&lt;legend&gt;')}, o leitor diz “Plano, grupo” antes das opções.`, `With ${ic('&lt;fieldset&gt;')} and ${ic('&lt;legend&gt;')}, the reader says “Plan, group” before the options.`, `Con ${ic('&lt;fieldset&gt;')} y ${ic('&lt;legend&gt;')}, el lector dice “Plan, grupo” antes de las opciones.`)],
        [L('Indeterminado = “misto”', 'Indeterminate = “mixed”', 'Indeterminado = “mixto”'), L(`A propriedade ${ic('indeterminate')} é anunciada como parcialmente marcada.`, `The ${ic('indeterminate')} property is announced as partially checked.`, `La propiedad ${ic('indeterminate')} se anuncia como parcialmente marcada.`)],
        [L('Contraste do contorno', 'Outline contrast', 'Contraste del contorno'), L(`O contorno desmarcado usa ${ic('fg.subtle')}: pelo menos ${ratio(3, 0)} contra o fundo nos dois temas.`, `The unchecked outline uses ${ic('fg.subtle')}: at least ${ratio(3, 0)} against the background in both themes.`, `El contorno desmarcado usa ${ic('fg.subtle')}: al menos ${ratio(3, 0)} contra el fondo en los dos temas.`)],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', L('Tokens usados', 'Tokens used', 'Tokens usados'), L('Tudo o que checkbox e radio consomem.', 'Everything checkbox and radio consume.', 'Todo lo que consumen checkbox y radio.'))}
      ${tokenTable([
        ['color.fg.subtle', L('Contorno desmarcado', 'Unchecked outline', 'Contorno desmarcado')],
        ['color.fg.muted', L('Contorno no hover', 'Outline on hover', 'Contorno en hover')],
        ['color.brand.solid', L('Fundo marcado (checkbox) e ponto (radio)', 'Checked background (checkbox) and dot (radio)', 'Fondo marcado (checkbox) y punto (radio)')],
        ['color.brand.solid-hover', L('Marcado no hover', 'Checked on hover', 'Marcado en hover')],
        ['color.brand.on-solid', L('Marca de seleção', 'Check mark', 'Marca de selección')],
        ['color.border.focus', L('Anel de foco', 'Focus ring', 'Anillo de foco')],
        ['color.danger.solid', L('Contorno inválido', 'Invalid outline', 'Contorno inválido')],
        ['color.danger.fg', L('Mensagem de erro', 'Error message', 'Mensaje de error')],
        ['radius.xs', L('Raio do checkbox', 'Checkbox radius', 'Radio del checkbox')],
        ['radius.full', 'Radio'],
        ['text.label-md', L('Rótulo', 'Label', 'Etiqueta')],
        ['text.body-sm', L('Descrição', 'Description', 'Descripción')],
        ['space.150', L('Controle → texto e entre opções', 'Control → text and between options', 'Control → texto y entre opciones')],
        ['duration.fast', L('Marca aparecendo', 'Mark appearing', 'Marca apareciendo')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', L('Uso', 'Usage', 'Uso'), L('Três regras para escolhas claras.', 'Three rules for clear choices.', 'Tres reglas para elecciones claras.'))}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: rótulo que se lê sozinho', 'Do: a label that reads on its own', 'Haz: una etiqueta que se lee sola')}</p>
          <div class="cr-usage" inert>${choice({ kind: 'checkbox', label: L('Enviar resumo semanal por e-mail', 'Send a weekly summary by email', 'Enviar un resumen semanal por correo'), checked: true, inert: true })}</div>
          <p class="usage-card__text">${L('Marcado ou não, a frase continua fazendo sentido.', 'Checked or not, the sentence still makes sense.', 'Marcada o no, la frase sigue teniendo sentido.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: negação no rótulo', 'Avoid: negation in the label', 'Evita: negación en la etiqueta')}</p>
          <div class="cr-usage" inert>${choice({ kind: 'checkbox', label: L('Não deixar de enviar o resumo', 'Don’t stop sending the summary', 'No dejar de enviar el resumen'), inert: true })}</div>
          <p class="usage-card__text">${L('Marcar um “não” exige parar e pensar duas vezes.', 'Checking a “don’t” makes people stop and think twice.', 'Marcar un “no” obliga a parar y pensar dos veces.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Efeito imediato? Use switch', 'Immediate effect? Use a switch', '¿Efecto inmediato? Usa un switch')}</p>
          <p class="usage-card__text">${L('Checkbox vale ao enviar o formulário. Se a mudança acontece na hora (ligar notificações), o switch comunica melhor.', 'A checkbox applies when the form is submitted. If the change happens right away (turning on notifications), a switch communicates better.', 'El checkbox vale al enviar el formulario. Si el cambio pasa al instante (activar notificaciones), el switch comunica mejor.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'escolha',
    controls: [
      { id: 'kind', label: L('Tipo', 'Type', 'Tipo'), value: 'checkbox', options: [{ value: 'checkbox', label: 'Checkbox' }, { value: 'radio', label: 'Radio' }] },
      { id: 'state', label: L('Estado', 'State', 'Estado'), value: 'checked', options: STATES().map(([value, label]) => ({ value, label })) },
      { id: 'description', label: L('Descrição', 'Description', 'Descripción'), value: 'on', options: [{ value: 'on', label: L('Com descrição', 'With description', 'Con descripción') }, { value: 'off', label: L('Sem descrição', 'Without description', 'Sin descripción') }] },
    ],
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: L('Receber novidades', 'Get updates', 'Recibir novedades') },
    render: (s) =>
      choice({
        kind: s.kind,
        id: 'cr-playground',
        name: 'cr-playground',
        state: s.state,
        label: s.label || L('Rótulo', 'Label', 'Etiqueta'),
        description: s.description === 'on' ? monthly() : '',
      }),
    code: choiceCode,
  });

  // indeterminado: aplica agora e sempre que o playground redesenhar
  applyIndeterminate(root);
  const preview = root.querySelector('[data-playground="escolha"] [data-preview]');
  const observer = new MutationObserver(() => applyIndeterminate(preview));
  observer.observe(preview, { childList: true });

  // "selecionar todos"
  const group = root.querySelector('[data-select-all]');
  const parent = group.querySelector('[data-parent]');
  const children = [...group.querySelectorAll('[data-child]')];
  const syncParent = () => {
    const marked = children.filter((c) => c.checked).length;
    parent.checked = marked === children.length;
    parent.indeterminate = marked > 0 && marked < children.length;
  };
  const onChange = (event) => {
    if (event.target === parent) children.forEach((c) => (c.checked = parent.checked));
    syncParent();
  };
  group.addEventListener('change', onChange);
  syncParent();

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    unmountPlayground();
    observer.disconnect();
    group.removeEventListener('change', onChange);
    unmountCopy();
    unmountNav();
  };
}
