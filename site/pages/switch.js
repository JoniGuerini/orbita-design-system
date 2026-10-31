import { icon } from '../../ds/icons/icons.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/switch.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const STATES = () => [
  ['off', L('Desligado', 'Off', 'Apagado')],
  ['on', L('Ligado', 'On', 'Encendido')],
  ['hover', 'Hover'],
  ['focus', L('Foco', 'Focus', 'Foco')],
  ['disabled', L('Desativado', 'Disabled', 'Desactivado')],
];

const SETTINGS = () => [
  ['sw-set-email', L('Resumo por e-mail', 'Email summary', 'Resumen por correo'), L('Toda segunda, com o que mudou na semana.', 'Every Monday, with what changed during the week.', 'Todos los lunes, con lo que cambió en la semana.'), true],
  ['sw-set-push', L('Notificações no celular', 'Phone notifications', 'Notificaciones en el móvil'), L('Menções e respostas, na hora.', 'Mentions and replies, right away.', 'Menciones y respuestas, al instante.'), true],
  ['sw-set-sound', L('Som ao receber mensagem', 'Sound on new messages', 'Sonido al recibir mensajes'), L('Só quando a aba está aberta.', 'Only when the tab is open.', 'Solo cuando la pestaña está abierta.'), false],
  ['sw-set-beta', L('Recursos em teste', 'Features in testing', 'Funciones en prueba'), L('Pode mudar sem aviso.', 'May change without notice.', 'Puede cambiar sin aviso.'), false],
];

const commentsHint = () => L('Avisamos quando alguém comentar.', 'We’ll let you know when someone comments.', 'Te avisamos cuando alguien comente.');

let uid = 0;

/* ───────── Switch (playground, exemplos e código) ───────── */

function toggle(o) {
  const id = o.id ?? `sw-${++uid}`;
  const cls = ['ds-switch', o.size === 'sm' && 'ds-switch--sm', o.end && 'ds-switch--end', o.className].filter(Boolean).join(' ');
  const attrs = [
    `type="checkbox"`,
    `role="switch"`,
    `class="ds-switch__input"`,
    `id="${id}"`,
    (o.state === 'on' || o.checked) && 'checked',
    o.state === 'disabled' && 'disabled',
    ['hover', 'focus'].includes(o.state) && `data-state="${o.state}"`,
    o.inert && 'tabindex="-1"',
    o.extra,
  ].filter(Boolean);
  const text = o.label
    ? `<span class="ds-choice__text"><span class="ds-choice__label">${escapeHtml(o.label)}</span>${o.description ? `<span class="ds-choice__description">${escapeHtml(o.description)}</span>` : ''}</span>`
    : '';
  return `<label class="${cls}"><input ${attrs.join(' ')}>${text}</label>`;
}

function toggleCode(s) {
  const cls = ['ds-switch', s.size === 'sm' && 'ds-switch--sm', s.position === 'end' && 'ds-switch--end'].filter(Boolean).join(' ');
  const attrs = ['type="checkbox"', 'role="switch"', 'class="ds-switch__input"', s.state === 'on' && 'checked', s.state === 'disabled' && 'disabled'].filter(Boolean);
  const lines = [`<label class="${cls}">`, `  <input ${attrs.join(' ')}>`, `  <span class="ds-choice__text">`, `    <span class="ds-choice__label">${s.label || L('Rótulo', 'Label', 'Etiqueta')}</span>`];
  if (s.description === 'on') lines.push(`    <span class="ds-choice__description">${commentsHint()}</span>`);
  lines.push(`  </span>`, `</label>`);
  return lines.join('\n');
}

/* ───────── Página ───────── */

const sectionHead = (id, title, desc) => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>
</header>`;

export default function renderSwitch(page) {
  const states = STATES();
  const send = L('Enviar', 'Send', 'Enviar');
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Liga ou desliga algo na hora, sem botão de salvar. Se a mudança só vale ao enviar, use checkbox.', 'Turns something on or off right away, with no save button. If the change only applies on submit, use a checkbox.', 'Enciende o apaga algo al instante, sin botón de guardar. Si el cambio solo vale al enviar, usa un checkbox.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estados', 'states', 'estados')}</dt><dd class="doc-stat__value">${states.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('transição', 'transition', 'transición')}</dt><dd class="doc-stat__value">200 ms</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('papel ARIA', 'ARIA role', 'rol ARIA')}</dt><dd class="doc-stat__value">switch</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['quando', L('Switch ou checkbox', 'Switch or checkbox', 'Switch o checkbox')],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['ajustes', L('Lista de ajustes', 'Settings list', 'Lista de ajustes')],
        ['movimento', L('Movimento', 'Motion', 'Movimiento')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', L(`Um checkbox nativo com ${ic('role="switch"')}. O do palco funciona.`, `A native checkbox with ${ic('role="switch"')}. The one on the stage works.`, `Un checkbox nativo con ${ic('role="switch"')}. El del escenario funciona.`))}
      ${playgroundMarkup('switch')}
    </section>

    <section class="doc-section" id="quando" aria-labelledby="quando-title">
      ${sectionHead('quando', L('Switch ou checkbox?', 'Switch or checkbox?', '¿Switch o checkbox?'), L('Os dois guardam um sim/não. A diferença é quando a escolha passa a valer.', 'Both hold a yes/no. The difference is when the choice takes effect.', 'Los dos guardan un sí/no. La diferencia es cuándo la elección empieza a valer.'))}
      <div class="sw-compare">
        <article class="sw-compare__card">
          <div class="sw-compare__stage">
            ${toggle({ id: 'sw-q-dark', label: L('Modo foco', 'Focus mode', 'Modo foco'), description: L('Esconde notificações enquanto estiver ligado.', 'Hides notifications while it’s on.', 'Oculta las notificaciones mientras esté encendido.'), checked: true, extra: 'data-live' })}
            <p class="sw-compare__status" data-live-status>${L('Ligado agora', 'On now', 'Encendido ahora')}</p>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Switch<code>ds-switch</code></p><p class="cd-example__text">${L('Efeito imediato. Não precisa de botão de salvar.', 'Immediate effect. No save button needed.', 'Efecto inmediato. No necesita botón de guardar.')}</p></div>
        </article>
        <article class="sw-compare__card">
          <div class="sw-compare__stage">
            <label class="ds-checkbox"><input type="checkbox" class="ds-checkbox__input" checked><span class="ds-choice__text"><span class="ds-choice__label">${L('Receber o contrato por e-mail', 'Get the contract by email', 'Recibir el contrato por correo')}</span><span class="ds-choice__description">${L('Vale quando você enviar o formulário.', 'Applies when you submit the form.', 'Vale cuando envíes el formulario.')}</span></span></label>
            <button type="button" class="ds-btn ds-btn--primary ds-btn--sm sw-compare__submit" tabindex="-1" aria-hidden="true">${send}</button>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Checkbox<code>ds-checkbox</code></p><p class="cd-example__text">${L('Faz parte de um formulário e vale ao enviar.', 'Part of a form, applies on submit.', 'Forma parte de un formulario y vale al enviar.')}</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      ${sectionHead('tamanhos', L('Tamanhos', 'Sizes', 'Tamaños'), L('Médio é o padrão. O pequeno cabe em linhas de tabela e barras densas.', 'Medium is the default. Small fits in table rows and dense bars.', 'Mediano es el predeterminado. El pequeño cabe en filas de tabla y barras densas.'))}
      <div class="sw-sizes">
        ${[
          ['md', L('Médio', 'Medium', 'Mediano'), '36 × 20 px', L('padrão', 'default', 'predeterminado')],
          ['sm', L('Pequeno', 'Small', 'Pequeño'), '28 × 16 px', 'ds-switch--sm'],
        ]
          .map(
            ([size, name, dims, cls]) => `<article class="cd-example">
              <div class="cd-example__preview" inert>${toggle({ size, checked: true, inert: true, label: states[1][1] })}${toggle({ size, inert: true, label: states[0][1] })}</div>
              <div class="cd-example__body"><p class="cd-example__name">${name}<code>${cls}</code></p><p class="cd-example__text">${dims}</p></div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', L('Estados', 'States', 'Estados'), L('Ligado ganha a cor da marca e o polegar vai para a direita — a posição também comunica, não só a cor.', 'On gets the brand color and the thumb moves right — the position communicates too, not just the color.', 'Encendido gana el color de la marca y el pulgar va a la derecha — la posición también comunica, no solo el color.'))}
      <div class="sw-states" inert>
        ${states.map(
          ([state, label]) => `<div class="sw-states__item">
            ${toggle({ state, inert: true })}
            <span class="sw-states__label">${label}</span>
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="ajustes" aria-labelledby="ajustes-title">
      ${sectionHead('ajustes', L('Lista de ajustes', 'Settings list', 'Lista de ajustes'), L(`O uso mais comum: rótulo e descrição à esquerda, switch à direita com ${ic('.ds-switch--end')}. Cada mudança vale na hora.`, `The most common use: label and description on the left, the switch on the right with ${ic('.ds-switch--end')}. Each change applies right away.`, `El uso más común: etiqueta y descripción a la izquierda, switch a la derecha con ${ic('.ds-switch--end')}. Cada cambio vale al instante.`))}
      <div class="sw-settings" data-settings>
        <p class="sw-settings__title">${L('Notificações', 'Notifications', 'Notificaciones')}</p>
        <ul class="sw-settings__list" role="list">
          ${SETTINGS().map(([id, label, description, checked]) => `<li class="sw-settings__row">${toggle({ id, label, description, checked, end: true })}</li>`).join('')}
        </ul>
      </div>
    </section>

    <section class="doc-section" id="movimento" aria-labelledby="movimento-title">
      ${sectionHead('movimento', L('Movimento', 'Motion', 'Movimiento'), L(`O polegar anda em ${ic('duration.base')} (200 ms) com ${ic('easing.emphasized')}: sai rápido e assenta suave. Com movimento reduzido, a troca é instantânea.`, `The thumb moves in ${ic('duration.base')} (200 ms) with ${ic('easing.emphasized')}: it leaves fast and settles softly. With reduced motion, the change is instant.`, `El pulgar se mueve en ${ic('duration.base')} (200 ms) con ${ic('easing.emphasized')}: sale rápido y se asienta suave. Con movimiento reducido, el cambio es instantáneo.`))}
      <div class="sw-motion">
        <div class="sw-motion__demo" data-motion>
          <div class="sw-motion__big">${toggle({ id: 'sw-motion', checked: false, extra: `aria-label="${L('Exemplo de movimento', 'Motion example', 'Ejemplo de movimiento')}"` })}</div>
          <div class="sw-motion__controls">
            <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-motion-play>${icon('play', { size: 16 })}${L('Alternar', 'Toggle', 'Alternar')}</button>
            <button type="button" class="ds-chip ds-chip--sm" data-motion-reduce aria-pressed="false">${icon('motion', { size: 14 })}${L('Simular movimento reduzido', 'Simulate reduced motion', 'Simular movimiento reducido')}</button>
          </div>
        </div>
        <div class="sw-motion__code">${codeBlock(`.ds-switch__input::before {
  transition: translate var(--ds-duration-base) var(--ds-easing-emphasized);
}

@media (prefers-reduced-motion: reduce) {
  .ds-switch__input::before { transition: none; }
}`)}</div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="acessibilidade-title">
      ${sectionHead('acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad'), L('Um checkbox nativo por baixo, anunciado como interruptor.', 'A native checkbox underneath, announced as a switch.', 'Un checkbox nativo por debajo, anunciado como interruptor.'))}
      ${a11yList([
        ['role="switch"', L('O leitor de tela anuncia “interruptor, ligado” em vez de “caixa de seleção, marcada”.', 'The screen reader announces “switch, on” instead of “checkbox, checked”.', 'El lector de pantalla anuncia “interruptor, activado” en vez de “casilla, marcada”.')],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab leva o foco; Espaço liga e desliga.', 'Tab moves focus; Space turns it on and off.', 'Tab lleva el foco; Espacio enciende y apaga.'), ['Tab', L('Espaço', 'Space', 'Espacio')]],
        [L('Rótulo descreve o que liga', 'The label describes what it turns on', 'La etiqueta describe qué enciende'), L('“Notificações por e-mail”, não “Ligado”. O estado já é anunciado pelo controle.', '“Email notifications”, not “On”. The control already announces its state.', '“Notificaciones por correo”, no “Encendido”. El control ya anuncia el estado.')],
        [L('Não depende só da cor', 'Not color alone', 'No depende solo del color'), L('A posição do polegar muda junto com a cor — funciona para quem não distingue o pêssego.', 'The thumb position changes along with the color — it works for people who can’t tell the peach apart.', 'La posición del pulgar cambia junto con el color — funciona para quien no distingue el melocotón.')],
        [L('Efeito visível', 'A visible effect', 'Efecto visible'), L('Se a mudança acontece fora da tela, confirme com um aviso curto (toast) para quem não vê o resultado.', 'If the change happens off screen, confirm it with a short notice (toast) for people who can’t see the result.', 'Si el cambio pasa fuera de la pantalla, confírmalo con un aviso corto (toast) para quien no ve el resultado.')],
        [L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido'), L(`Com ${ic('prefers-reduced-motion')}, o polegar troca de lado sem animar.`, `With ${ic('prefers-reduced-motion')}, the thumb switches sides without animating.`, `Con ${ic('prefers-reduced-motion')}, el pulgar cambia de lado sin animar.`)],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', L('Tokens usados', 'Tokens used', 'Tokens usados'), L('Tudo o que o switch consome.', 'Everything the switch consumes.', 'Todo lo que consume el switch.'))}
      ${tokenTable([
        ['color.bg.muted', L('Trilho desligado', 'Off track', 'Riel apagado')],
        ['color.fg.muted', L('Polegar desligado', 'Off thumb', 'Pulgar apagado')],
        ['color.brand.solid', L('Trilho ligado', 'On track', 'Riel encendido')],
        ['color.brand.on-solid', L('Polegar ligado', 'On thumb', 'Pulgar encendido')],
        ['color.border.default', L('Contorno do trilho', 'Track outline', 'Contorno del riel')],
        ['color.border.strong', L('Contorno no hover', 'Outline on hover', 'Contorno en hover')],
        ['color.border.focus', L('Anel de foco', 'Focus ring', 'Anillo de foco')],
        ['radius.full', L('Trilho e polegar', 'Track and thumb', 'Riel y pulgar')],
        ['duration.base', L('Polegar e cor', 'Thumb and color', 'Pulgar y color')],
        ['easing.emphasized', L('Curva do polegar', 'Thumb curve', 'Curva del pulgar')],
        ['text.label-md', L('Rótulo', 'Label', 'Etiqueta')],
        ['text.body-sm', L('Descrição', 'Description', 'Descripción')],
        ['opacity.disabled', L('Desativado', 'Disabled', 'Desactivado')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', L('Uso', 'Usage', 'Uso'), L('Três regras para não confundir.', 'Three rules to avoid confusion.', 'Tres reglas para no confundir.'))}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: efeito na hora', 'Do: an immediate effect', 'Haz: efecto al instante')}</p>
          <div class="sw-usage" inert>${toggle({ label: L('Mostrar prévia dos links', 'Show link previews', 'Mostrar vista previa de los enlaces'), checked: true, end: true, inert: true })}</div>
          <p class="usage-card__text">${L('Liga e a interface muda. Nenhum “salvar” depois.', 'Turn it on and the interface changes. No “save” afterwards.', 'Lo enciendes y la interfaz cambia. Ningún “guardar” después.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: switch com botão de enviar', 'Avoid: a switch with a submit button', 'Evita: switch con botón de enviar')}</p>
          <div class="sw-usage sw-usage--row" inert>${toggle({ label: L('Aceito os termos', 'I accept the terms', 'Acepto los términos'), inert: true })}<span class="ds-btn ds-btn--primary ds-btn--sm">${send}</span></div>
          <p class="usage-card__text">${L('Se precisa confirmar, é checkbox. O switch promete efeito imediato.', 'If it needs confirming, it’s a checkbox. A switch promises an immediate effect.', 'Si necesita confirmación, es checkbox. El switch promete efecto inmediato.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Rótulo sem “ligar/desligar”', 'No “turn on/off” in the label', 'Etiqueta sin “encender/apagar”')}</p>
          <div class="sw-usage" inert>${toggle({ label: L('Modo escuro', 'Dark mode', 'Modo oscuro'), checked: true, end: true, inert: true })}</div>
          <p class="usage-card__text">${L('“Modo escuro” basta. “Ligar modo escuro” fica estranho quando já está ligado.', '“Dark mode” is enough. “Turn on dark mode” reads oddly when it’s already on.', '“Modo oscuro” basta. “Encender modo oscuro” suena raro cuando ya está encendido.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const states = STATES();
  const unmountPlayground = mountPlayground(root, {
    id: 'switch',
    controls: [
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: [{ value: 'md', label: L('Médio', 'Medium', 'Mediano') }, { value: 'sm', label: L('Pequeno', 'Small', 'Pequeño') }] },
      { id: 'state', label: L('Estado', 'State', 'Estado'), value: 'on', options: states.map(([value, label]) => ({ value, label })) },
      { id: 'position', label: L('Posição', 'Position', 'Posición'), value: 'start', options: [{ value: 'start', label: L('Antes do rótulo', 'Before the label', 'Antes de la etiqueta') }, { value: 'end', label: L('À direita', 'On the right', 'A la derecha') }] },
      { id: 'description', label: L('Descrição', 'Description', 'Descripción'), value: 'on', options: [{ value: 'on', label: L('Com descrição', 'With description', 'Con descripción') }, { value: 'off', label: L('Sem descrição', 'Without description', 'Sin descripción') }] },
    ],
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: L('Avisar sobre comentários', 'Notify about comments', 'Avisar sobre comentarios') },
    render: (s) =>
      `<div class="sw-stage${s.position === 'end' ? ' sw-stage--end' : ''}">${toggle({
        id: 'sw-playground',
        size: s.size,
        state: s.state,
        end: s.position === 'end',
        label: s.label || L('Rótulo', 'Label', 'Etiqueta'),
        description: s.description === 'on' ? commentsHint() : '',
      })}</div>`,
    code: toggleCode,
  });

  const onChange = (event) => {
    // comparação: o status acompanha o switch
    if (event.target.matches('[data-live]')) {
      root.querySelector('[data-live-status]').textContent = event.target.checked ? L('Ligado agora', 'On now', 'Encendido ahora') : L('Desligado agora', 'Off now', 'Apagado ahora');
    }
    // lista de ajustes: confirma com um aviso curto
    if (event.target.closest('[data-settings]')) {
      const label = event.target.closest('.ds-switch').querySelector('.ds-choice__label').textContent;
      toast(`${label}: ${event.target.checked ? L('ligado', 'on', 'encendido') : L('desligado', 'off', 'apagado')}`);
    }
  };
  root.addEventListener('change', onChange);

  // movimento: alternar e simular movimento reduzido só nesta demo
  const motion = root.querySelector('[data-motion]');
  const motionInput = motion.querySelector('#sw-motion');
  const reduce = motion.querySelector('[data-motion-reduce]');
  const onMotionClick = (event) => {
    if (event.target.closest('[data-motion-play]')) motionInput.checked = !motionInput.checked;
    if (event.target.closest('[data-motion-reduce]')) {
      const on = reduce.getAttribute('aria-pressed') !== 'true';
      reduce.setAttribute('aria-pressed', String(on));
      motion.toggleAttribute('data-reduced', on);
    }
  };
  motion.addEventListener('click', onMotionClick);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    unmountPlayground();
    root.removeEventListener('change', onChange);
    motion.removeEventListener('click', onMotionClick);
    unmountCopy();
    unmountNav();
  };
}
