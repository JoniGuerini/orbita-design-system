import { icon } from '../../ds/icons/icons.js';
import { openModal, confirmModal, modalContent, modalClasses } from '../../ds/js/modal.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/modal.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const SIZES = () => [
  ['sm', L('Pequeno', 'Small', 'Pequeño'), 400, L('Confirmações e avisos de uma frase.', 'Confirmations and one-sentence notices.', 'Confirmaciones y avisos de una frase.')],
  ['md', L('Médio', 'Medium', 'Mediano'), 520, L('O padrão: decisões com contexto e formulários curtos.', 'The default: decisions with context and short forms.', 'El predeterminado: decisiones con contexto y formularios cortos.')],
  ['lg', L('Grande', 'Large', 'Grande'), 720, L('Conteúdo maior, como uma prévia ou uma lista para revisar.', 'Larger content, like a preview or a list to review.', 'Contenido más grande, como una vista previa o una lista para revisar.')],
];

const project = () => L('Lançamento 0.1', 'Launch 0.1', 'Lanzamiento 0.1');

const BODIES = () => ({
  default: L('As mudanças ficam visíveis para toda a equipe assim que você publicar.', 'The changes become visible to the whole team as soon as you publish.', 'Los cambios quedan visibles para todo el equipo en cuanto publiques.'),
  danger: L('O projeto e os 12 arquivos dele serão apagados. Não dá para desfazer.', 'The project and its 12 files will be deleted. This can’t be undone.', 'El proyecto y sus 12 archivos se borrarán. No se puede deshacer.'),
});

const longBody = () =>
  Array.from({ length: 8 }, (_, i) =>
    `<p>${i + 1}. ${L('Cada alteração entra no histórico com autor, data e o que mudou. Você pode comparar versões e voltar a qualquer uma delas antes de publicar.', 'Every change goes into the history with author, date, and what changed. You can compare versions and go back to any of them before publishing.', 'Cada cambio entra en el historial con autor, fecha y qué cambió. Puedes comparar versiones y volver a cualquiera de ellas antes de publicar.')}</p>`,
  ).join('');

const formBody = () => `<div class="md-form">
  <label class="md-form__label" for="md-form-name">${L('Nome do projeto', 'Project name', 'Nombre del proyecto')}</label>
  <div class="ds-field"><input class="ds-field__input" id="md-form-name" type="text" value="${project()}" autofocus></div>
  <p class="md-form__hint">${L('Aparece na sidebar e nos convites.', 'Shows in the sidebar and in invites.', 'Aparece en la barra lateral y en las invitaciones.')}</p>
</div>`;

const cancel = () => L('Cancelar', 'Cancel', 'Cancelar');
const deleteProject = () => L('Excluir projeto', 'Delete project', 'Eliminar proyecto');
const deleteTitle = () => L(`Excluir “${project()}”?`, `Delete “${project()}”?`, `¿Eliminar “${project()}”?`);
const publishTitle = () => L('Publicar alterações?', 'Publish changes?', '¿Publicar cambios?');
const projectEyebrow = () => L('Projeto', 'Project', 'Proyecto');
const gotIt = () => L('Entendi', 'Got it', 'Entendido');

/** Opções do modal a partir do estado do playground. */
function optionsFrom(state) {
  const danger = state.tone === 'danger';
  const actions =
    state.footer === 'two'
      ? [
          { label: cancel(), value: 'cancel', autofocus: danger },
          { label: danger ? L('Excluir', 'Delete', 'Eliminar') : L('Publicar', 'Publish', 'Publicar'), value: 'confirm', variant: danger ? 'danger' : 'primary' },
        ]
      : state.footer === 'one'
        ? [{ label: gotIt(), value: 'ok', variant: 'primary' }]
        : [];
  return {
    eyebrow: state.eyebrow === 'yes' ? projectEyebrow() : undefined,
    title: state.title || L('Sem título', 'Untitled', 'Sin título'),
    body: BODIES()[danger ? 'danger' : 'default'],
    size: state.size,
    tone: danger ? 'danger' : undefined,
    // sem rodapé, o × é a única saída: o modal sempre pode ser fechado
    dismissible: state.footer === 'none' ? true : state.dismiss === 'yes',
    actions,
  };
}

function inlineModal(opts) {
  return `<div class="${modalClasses(opts)} ds-modal--inline" role="presentation" inert>${modalContent({ ...opts, id: `md-prev-${Math.random().toString(36).slice(2, 7)}` })}</div>`;
}

function modalCode(state) {
  const o = optionsFrom(state);
  const choice = L('escolha', 'choice', 'eleccion');
  const lines = ["import { openModal } from './ds/js/modal.js';", '', `const ${choice} = await openModal({`];
  if (o.eyebrow) lines.push(`  eyebrow: '${o.eyebrow}',`);
  lines.push(`  title: '${o.title.replace(/'/g, "\\'")}',`);
  lines.push(`  body: '${o.body.replace(/'/g, "\\'")}',`);
  if (o.size !== 'md') lines.push(`  size: '${o.size}',`);
  if (o.tone) lines.push(`  tone: '${o.tone}',`);
  if (!o.dismissible) lines.push('  dismissible: false,');
  if (o.actions.length) {
    lines.push('  actions: [');
    o.actions.forEach((a) => {
      const extra = [a.variant && `variant: '${a.variant}'`, a.autofocus && 'autofocus: true'].filter(Boolean).join(', ');
      lines.push(`    { label: '${a.label}', value: '${a.value}'${extra ? `, ${extra}` : ''} },`);
    });
    lines.push('  ],');
  }
  lines.push('});', '', `// ${L('escolha → valor da ação, ou undefined se fechou pelo ×, Esc ou clique fora', 'choice → the action’s value, or undefined if closed with ×, Esc, or an outside click', 'eleccion → valor de la acción, o undefined si se cerró con ×, Esc o clic fuera')}`);
  return lines.join('\n');
}

const describe = (value, actions) => {
  if (value === undefined) return L('Fechado sem escolher', 'Closed without choosing', 'Cerrado sin elegir');
  const action = actions.find((a) => a.value === value);
  return L(`Escolheu: ${action?.label ?? value}`, `Chose: ${action?.label ?? value}`, `Eligió: ${action?.label ?? value}`);
};

/* ───────── Página ───────── */

export default function renderModal(page) {
  const sizes = SIZES();
  const bodies = BODIES();
  const anatomy = {
    eyebrow: projectEyebrow(),
    title: publishTitle(),
    body: bodies.default,
    actions: [
      { label: cancel(), value: 'cancel' },
      { label: L('Publicar', 'Publish', 'Publicar'), value: 'confirm', variant: 'primary' },
    ],
  };
  const danger = {
    title: deleteTitle(),
    body: bodies.danger,
    tone: 'danger',
    size: 'sm',
    actions: [
      { label: cancel(), value: 'cancel' },
      { label: deleteProject(), value: 'confirm', variant: 'danger' },
    ],
  };

  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Interrompe o fluxo para uma decisão ou uma tarefa curta. Use pouco: tudo o que pode ficar na página, fica na página.', 'Interrupts the flow for a decision or a short task. Use it sparingly: whatever can stay on the page, stays on the page.', 'Interrumpe el flujo para una decisión o una tarea corta. Úsalo poco: todo lo que puede quedarse en la página, se queda en la página.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">${sizes.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tons', 'tones', 'tonos')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('fecha com', 'closes with', 'se cierra con')}</dt><dd class="doc-stat__value">Esc</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('base', 'built on', 'base')}</dt><dd class="doc-stat__value">&lt;dialog&gt;</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
        ['confirmacao', L('Confirmação', 'Confirmation', 'Confirmación')],
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
          <p class="doc-section__desc">${L('A prévia acompanha as escolhas. “Abrir de verdade” mostra o modal sobre a página, com foco, Esc e clique fora funcionando.', 'The preview follows your choices. “Open for real” shows the modal over the page, with focus, Esc, and outside click working.', 'La vista previa sigue tus elecciones. “Abrir de verdad” muestra el modal sobre la página, con foco, Esc y clic fuera funcionando.')}</p>
        </div>
      </header>
      ${playgroundMarkup('modal')}
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">${L('Anatomia', 'Anatomy', 'Anatomía')}</h2>
          <p class="doc-section__desc">${L('Cinco partes. Título e ao menos uma saída são obrigatórios; o resto depende da decisão.', 'Five parts. A title and at least one way out are required; the rest depends on the decision.', 'Cinco partes. El título y al menos una salida son obligatorios; el resto depende de la decisión.')}</p>
        </div>
      </header>
      <div class="md-anatomy">
        <div class="md-anatomy__stage" aria-hidden="true">
          <div class="md-anatomy__page"><i></i><i></i><i></i><i></i></div>
          <span class="md-anatomy__pin md-anatomy__pin--backdrop">5</span>
          <div class="md-anatomy__modal">
            ${inlineModal(anatomy)}
            <span class="md-anatomy__pin md-anatomy__pin--header">1</span>
            <span class="md-anatomy__pin md-anatomy__pin--close">2</span>
            <span class="md-anatomy__pin md-anatomy__pin--body">3</span>
            <span class="md-anatomy__pin md-anatomy__pin--footer">4</span>
          </div>
        </div>
        <ol class="md-anatomy__legend" role="list">
          <li><span class="md-anatomy__num">1</span><div><p class="md-anatomy__title">${L('Cabeçalho', 'Header', 'Encabezado')}</p><p class="md-anatomy__text">${L(`Rótulo opcional e título em ${ic('text.heading-lg')}. O título é a pergunta: “Publicar alterações?”.`, `An optional label and a title in ${ic('text.heading-lg')}. The title is the question: “Publish changes?”.`, `Etiqueta opcional y título en ${ic('text.heading-lg')}. El título es la pregunta: “¿Publicar cambios?”.`)}</p></div></li>
          <li><span class="md-anatomy__num">2</span><div><p class="md-anatomy__title">${L('Fechar', 'Close', 'Cerrar')}</p><p class="md-anatomy__text">${L(`Botão de ícone com ${ic('aria-label')}. Some quando o modal exige uma escolha (${ic('dismissible: false')}).`, `An icon button with an ${ic('aria-label')}. It disappears when the modal requires a choice (${ic('dismissible: false')}).`, `Botón de ícono con ${ic('aria-label')}. Desaparece cuando el modal exige una elección (${ic('dismissible: false')}).`)}</p></div></li>
          <li><span class="md-anatomy__num">3</span><div><p class="md-anatomy__title">${L('Corpo', 'Body', 'Cuerpo')}</p><p class="md-anatomy__text">${L(`Texto em ${ic('text.body-md')} e cor secundária. Se crescer, só o corpo rola — cabeçalho e ações ficam no lugar.`, `Text in ${ic('text.body-md')} and a secondary color. If it grows, only the body scrolls — header and actions stay put.`, `Texto en ${ic('text.body-md')} y color secundario. Si crece, solo el cuerpo se desplaza — encabezado y acciones quedan en su lugar.`)}</p></div></li>
          <li><span class="md-anatomy__num">4</span><div><p class="md-anatomy__title">${L('Rodapé', 'Footer', 'Pie')}</p><p class="md-anatomy__text">${L('Ações à direita, a principal por último. No celular elas empilham, com a principal em cima.', 'Actions on the right, the primary one last. On phones they stack, with the primary on top.', 'Acciones a la derecha, la principal al final. En el móvil se apilan, con la principal arriba.')}</p></div></li>
          <li><span class="md-anatomy__num">5</span><div><p class="md-anatomy__title">${L('Fundo', 'Backdrop', 'Fondo')}</p><p class="md-anatomy__text">${L(`${ic('color.bg.overlay')}, chapado e sem desfoque. A página continua visível — e fica inerte até o modal fechar.`, `${ic('color.bg.overlay')}, flat and unblurred. The page stays visible — and inert until the modal closes.`, `${ic('color.bg.overlay')}, plano y sin desenfoque. La página sigue visible — e inerte hasta que el modal se cierra.`)}</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">${L('Tamanhos', 'Sizes', 'Tamaños')}</h2>
          <p class="doc-section__desc">${L('A largura acompanha o conteúdo, nunca a tela. No celular todos ocupam a largura disponível.', 'The width follows the content, never the screen. On phones they all take the available width.', 'El ancho sigue al contenido, nunca a la pantalla. En el móvil todos ocupan el ancho disponible.')}</p>
        </div>
      </header>
      <div class="md-sizes">
        ${sizes.map(
          ([id, name, px, text]) => `<article class="md-size">
            <div class="md-size__ruler" aria-hidden="true">
              <span class="md-size__bar" style="width:${Math.round((px / 720) * 100)}%"><span>${px} px</span></span>
            </div>
            <div class="md-size__body">
              <p class="cd-example__name">${name}${id === 'md' ? ` <span class="md-size__default">${L('padrão', 'default', 'predeterminado')}</span>` : ''}<code>${id === 'md' ? '—' : `size: '${id}'`}</code></p>
              <p class="cd-example__text">${text}</p>
              <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm md-size__open" data-open-size="${id}">${icon('arrow-up-right', { size: 16 })}${L('Abrir', 'Open', 'Abrir')}</button>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="confirmacao" aria-labelledby="confirmacao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="confirmacao-title">${L('Confirmação destrutiva', 'Destructive confirmation', 'Confirmación destructiva')}</h2>
          <p class="doc-section__desc">${L('Para o que não tem volta. O tom de perigo muda o ícone e a ação — e o foco começa em “Cancelar”.', 'For what can’t be undone. The danger tone changes the icon and the action — and focus starts on “Cancel”.', 'Para lo que no tiene vuelta atrás. El tono de peligro cambia el ícono y la acción — y el foco empieza en “Cancelar”.')}</p>
        </div>
      </header>
      <div class="md-confirm">
        <div class="md-confirm__preview" aria-hidden="true">${inlineModal(danger)}</div>
        <div class="md-confirm__rules">
          <ul class="md-rules" role="list">
            <li>${icon('check', { size: 16 })}<span>${L(`Título com o objeto: “Excluir ‘${project()}’?”, nunca “Tem certeza?”.`, `A title with the object: “Delete ‘${project()}’?”, never “Are you sure?”.`, `Título con el objeto: “¿Eliminar ‘${project()}’?”, nunca “¿Estás seguro?”.`)}</span></li>
            <li>${icon('check', { size: 16 })}<span>${L('O corpo diz a consequência e se dá para desfazer.', 'The body states the consequence and whether it can be undone.', 'El cuerpo dice la consecuencia y si se puede deshacer.')}</span></li>
            <li>${icon('check', { size: 16 })}<span>${L('O botão repete o verbo: “Excluir projeto”, não “Sim”.', 'The button repeats the verb: “Delete project”, not “Yes”.', 'El botón repite el verbo: “Eliminar proyecto”, no “Sí”.')}</span></li>
            <li>${icon('check', { size: 16 })}<span>${L('Foco inicial na saída segura, para Enter não apagar nada por engano.', 'Initial focus on the safe way out, so Enter doesn’t delete anything by mistake.', 'Foco inicial en la salida segura, para que Enter no borre nada por error.')}</span></li>
          </ul>
          ${codeBlock(`const ok = await confirmModal({\n  title: '${deleteTitle()}',\n  body: '${L('O projeto e os 12 arquivos dele serão apagados.', 'The project and its 12 files will be deleted.', 'El proyecto y sus 12 archivos se borrarán.')}',\n  confirmLabel: '${deleteProject()}',\n  tone: 'danger',\n}); // → ${L('true ou false', 'true or false', 'true o false')}`)}
          <button type="button" class="ds-btn ds-btn--danger" data-open-confirm>${icon('trash', { size: 18 })}${deleteProject()}…</button>
        </div>
      </div>
    </section>

    <section class="doc-section" id="comportamento" aria-labelledby="comportamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="comportamento-title">${L('Comportamento', 'Behavior', 'Comportamiento')}</h2>
          <p class="doc-section__desc">${L('O &lt;dialog&gt; nativo resolve foco e camadas. O componente cuida do resto.', 'The native &lt;dialog&gt; handles focus and layering. The component takes care of the rest.', 'El &lt;dialog&gt; nativo resuelve el foco y las capas. El componente se encarga del resto.')}</p>
        </div>
      </header>
      <div class="md-behaviors">
        ${[
          ['zap', L('Foco inicial', 'Initial focus', 'Foco inicial'), L('Vai para o primeiro campo do corpo; sem campos, para a ação principal (ou para “Cancelar”, no tom de perigo).', 'Goes to the first field in the body; with no fields, to the primary action (or to “Cancel”, in the danger tone).', 'Va al primer campo del cuerpo; sin campos, a la acción principal (o a “Cancelar”, en el tono de peligro).'), ['form', L('Abrir com formulário', 'Open with a form', 'Abrir con formulario')]],
          ['x', L('Três saídas', 'Three ways out', 'Tres salidas'), L(`Esc, clique fora e o botão ×. Com ${ic('dismissible: false')}, só as ações fecham.`, `Esc, outside click, and the × button. With ${ic('dismissible: false')}, only the actions close it.`, `Esc, clic fuera y el botón ×. Con ${ic('dismissible: false')}, solo las acciones lo cierran.`), null],
          ['arrow-left', L('Foco devolvido', 'Focus returned', 'Foco devuelto'), L('Ao fechar, o foco volta para quem abriu o modal — a pessoa continua de onde estava.', 'On close, focus returns to whatever opened the modal — people pick up where they were.', 'Al cerrar, el foco vuelve a quien abrió el modal — la persona sigue desde donde estaba.'), null],
          ['list', L('Conteúdo longo', 'Long content', 'Contenido largo'), L('O modal nunca passa da altura da tela: o corpo rola, cabeçalho e rodapé ficam fixos.', 'The modal never exceeds the screen height: the body scrolls, header and footer stay fixed.', 'El modal nunca supera la altura de la pantalla: el cuerpo se desplaza, encabezado y pie quedan fijos.'), ['long', L('Abrir com texto longo', 'Open with long text', 'Abrir con texto largo')]],
          ['motion', L('Movimento', 'Motion', 'Movimiento'), L(`Entra em ${ic('duration.base')} + emphasized e sai em ${ic('duration.fast')} + accelerate. Com movimento reduzido, aparece direto.`, `Enters with ${ic('duration.base')} + emphasized and exits with ${ic('duration.fast')} + accelerate. With reduced motion, it appears directly.`, `Entra con ${ic('duration.base')} + emphasized y sale con ${ic('duration.fast')} + accelerate. Con movimiento reducido, aparece directamente.`), null],
          ['layers', L('Uma camada só', 'A single layer', 'Una sola capa'), L('Nada de modal sobre modal. Se a tarefa pede um segundo passo, ele acontece dentro do mesmo modal.', 'No modal on top of a modal. If the task needs a second step, it happens inside the same modal.', 'Nada de modal sobre modal. Si la tarea pide un segundo paso, ocurre dentro del mismo modal.'), null],
        ]
          .map(
            ([glyph, title, text, demo]) => `<article class="md-behavior">
              <span class="md-behavior__icon">${icon(glyph, { size: 18 })}</span>
              <p class="md-behavior__title">${title}</p>
              <p class="md-behavior__text">${text}</p>
              ${demo ? `<button type="button" class="ds-inline-action md-behavior__demo" data-open-demo="${demo[0]}">${icon('arrow-up-right', { size: 16 })}${demo[1]}</button>` : ''}
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('Por ser um &lt;dialog&gt; aberto com showModal, o navegador já anuncia, prende o foco e deixa o resto da página inerte.', 'Because it’s a &lt;dialog&gt; opened with showModal, the browser already announces it, traps focus, and makes the rest of the page inert.', 'Por ser un &lt;dialog&gt; abierto con showModal, el navegador ya lo anuncia, atrapa el foco y deja el resto de la página inerte.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Nome e descrição', 'Name and description', 'Nombre y descripción'), L(`O título vira ${ic('aria-labelledby')} e o corpo, ${ic('aria-describedby')} — o leitor de tela lê os dois ao abrir.`, `The title becomes ${ic('aria-labelledby')} and the body, ${ic('aria-describedby')} — the screen reader reads both on open.`, `El título se vuelve ${ic('aria-labelledby')} y el cuerpo, ${ic('aria-describedby')} — el lector de pantalla lee los dos al abrir.`)],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab circula só dentro do modal; Esc fecha (quando permitido).', 'Tab cycles only inside the modal; Esc closes it (when allowed).', 'Tab circula solo dentro del modal; Esc lo cierra (cuando se permite).'), ['Tab', 'Shift Tab', 'Esc']],
        [L('Foco preso e devolvido', 'Focus trapped and returned', 'Foco atrapado y devuelto'), L('Ninguém se perde atrás do fundo. Ao fechar, o foco volta ao gatilho.', 'No one gets lost behind the backdrop. On close, focus returns to the trigger.', 'Nadie se pierde detrás del fondo. Al cerrar, el foco vuelve al disparador.')],
        [L('Fechar com nome', 'A named close button', 'Cerrar con nombre'), L(`O × tem ${ic('aria-label="Fechar"')}. Troque com ${ic('closeLabel')} se o contexto pedir.`, `The × has ${ic('aria-label="Close"')}. Change it with ${ic('closeLabel')} if the context calls for it.`, `El × tiene ${ic('aria-label="Cerrar"')}. Cámbialo con ${ic('closeLabel')} si el contexto lo pide.`)],
        [L('Sem armadilha', 'No trap', 'Sin trampa'), L('Todo modal tem uma saída por teclado. Sem rodapé, o × é obrigatório.', 'Every modal has a keyboard way out. Without a footer, the × is required.', 'Todo modal tiene una salida por teclado. Sin pie, el × es obligatorio.')],
        [L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido'), L(`Com ${ic('prefers-reduced-motion')}, o modal aparece e some sem animação.`, `With ${ic('prefers-reduced-motion')}, the modal appears and disappears without animation.`, `Con ${ic('prefers-reduced-motion')}, el modal aparece y desaparece sin animación.`)],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Superfície elevada, fundo chapado e movimento curto.', 'A raised surface, a flat backdrop, and short motion.', 'Superficie elevada, fondo plano y movimiento corto.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', L('Fundo do modal', 'Modal background', 'Fondo del modal')],
        ['color.border.subtle', L('Borda', 'Border', 'Borde')],
        ['radius.2xl', L('Raio', 'Radius', 'Radio')],
        ['shadow.2xl', L('Sombra', 'Shadow', 'Sombra')],
        ['color.bg.overlay', L('Fundo da página por trás', 'Page backdrop behind', 'Fondo de la página detrás')],
        ['text.heading-lg', L('Título', 'Title', 'Título')],
        ['text.body-md', L('Corpo', 'Body', 'Cuerpo')],
        ['color.fg.muted', L('Cor do corpo', 'Body color', 'Color del cuerpo')],
        ['color.danger.subtle', L('Ícone no tom de perigo', 'Icon in the danger tone', 'Ícono en el tono de peligro')],
        ['space.400', L('Respiro interno', 'Inner padding', 'Espacio interno')],
        ['duration.base', L('Entrada', 'Enter', 'Entrada')],
        ['easing.emphasized', L('Curva da entrada', 'Enter curve', 'Curva de entrada')],
        ['duration.fast', L('Saída', 'Exit', 'Salida')],
        ['easing.accelerate', L('Curva da saída', 'Exit curve', 'Curva de salida')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Antes de abrir um modal, pergunte se a página não resolve.', 'Before opening a modal, ask whether the page can handle it.', 'Antes de abrir un modal, pregúntate si la página no lo resuelve.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: decisões que bloqueiam', 'Do: blocking decisions', 'Haz: decisiones que bloquean')}</p>
          <p class="usage-card__text">${L('Confirmar algo irreversível, escolher antes de seguir, uma tarefa de um passo só.', 'Confirming something irreversible, choosing before moving on, a one-step task.', 'Confirmar algo irreversible, elegir antes de seguir, una tarea de un solo paso.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: modal para avisar', 'Avoid: a modal to notify', 'Evita: modal para avisar')}</p>
          <p class="usage-card__text">${L('“Salvo com sucesso” não precisa parar ninguém — use um toast. E nunca abra um modal sobre outro.', '“Saved successfully” doesn’t need to stop anyone — use a toast. And never open a modal on top of another.', '“Guardado con éxito” no necesita detener a nadie — usa un toast. Y nunca abras un modal sobre otro.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Título pergunta, botão responde', 'The title asks, the button answers', 'El título pregunta, el botón responde')}</p>
          <p class="usage-card__text">${L('“Excluir projeto?” → “Excluir projeto”. Dá para decidir lendo só o título e o botão.', '“Delete project?” → “Delete project”. You can decide by reading just the title and the button.', '“¿Eliminar proyecto?” → “Eliminar proyecto”. Se puede decidir leyendo solo el título y el botón.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  let current = null;
  let alive = true;

  const unmountPlayground = mountPlayground(root, {
    id: 'modal',
    controls: [
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: SIZES().map(([value, label]) => ({ value, label })) },
      { id: 'tone', label: L('Tom', 'Tone', 'Tono'), value: 'default', options: [{ value: 'default', label: L('Padrão', 'Default', 'Predeterminado') }, { value: 'danger', label: L('Perigo', 'Danger', 'Peligro') }] },
      { id: 'footer', label: L('Rodapé', 'Footer', 'Pie'), value: 'two', options: [{ value: 'two', label: L('Duas ações', 'Two actions', 'Dos acciones') }, { value: 'one', label: L('Uma ação', 'One action', 'Una acción') }, { value: 'none', label: L('Sem rodapé', 'No footer', 'Sin pie') }] },
      { id: 'dismiss', label: L('Fechar', 'Close', 'Cerrar'), value: 'yes', options: [{ value: 'yes', label: L('Esc, fora e ×', 'Esc, outside, and ×', 'Esc, fuera y ×') }, { value: 'no', label: L('Só pelas ações', 'Actions only', 'Solo con las acciones') }] },
      { id: 'eyebrow', label: L('Rótulo', 'Label', 'Etiqueta'), value: 'yes', options: [{ value: 'yes', label: L('Com rótulo', 'With label', 'Con etiqueta') }, { value: 'no', label: L('Sem rótulo', 'No label', 'Sin etiqueta') }] },
    ],
    text: { id: 'title', label: L('Título', 'Title', 'Título'), value: publishTitle() },
    render: (state) => {
      current = state;
      const opts = optionsFrom(state);
      return `<div class="md-pg">
        <div class="md-pg__preview" aria-hidden="true">${inlineModal(opts)}</div>
        <button type="button" class="ds-btn ds-btn--primary" data-open-playground>${icon('arrow-up-right', { size: 18 })}${L('Abrir de verdade', 'Open for real', 'Abrir de verdad')}</button>
        ${state.footer === 'none' && state.dismiss === 'no' ? `<p class="md-pg__note">${L('Sem rodapé, o × fica sempre — senão não haveria saída.', 'Without a footer, the × always stays — otherwise there’d be no way out.', 'Sin pie, el × siempre queda — si no, no habría salida.')}</p>` : ''}
      </div>`;
    },
    code: modalCode,
  });

  const show = async (opts) => {
    const value = await openModal(opts);
    if (!alive) return;
    toast(describe(value, opts.actions ?? []), { tone: value === undefined ? 'neutral' : 'success', icon: value === undefined ? 'x' : undefined });
  };

  const onClick = async (event) => {
    if (event.target.closest('[data-open-playground]') && current) return show(optionsFrom(current));

    const size = event.target.closest('[data-open-size]')?.dataset.openSize;
    if (size) {
      const [, name, px] = SIZES().find(([id]) => id === size);
      const long = longBody();
      return show({
        eyebrow: `${name} · ${px} px`,
        title: size === 'sm' ? L('Sair sem salvar?', 'Leave without saving?', '¿Salir sin guardar?') : size === 'md' ? L('Convidar para o projeto', 'Invite to the project', 'Invitar al proyecto') : L('Revisar alterações', 'Review changes', 'Revisar cambios'),
        body: size === 'lg' ? long.split('</p>').slice(0, 3).join('</p>') + '</p>' : BODIES().default,
        size,
        actions: [
          { label: cancel(), value: 'cancel' },
          { label: L('Continuar', 'Continue', 'Continuar'), value: 'confirm', variant: 'primary' },
        ],
      });
    }

    if (event.target.closest('[data-open-confirm]')) {
      const ok = await confirmModal({
        title: deleteTitle(),
        body: BODIES().danger,
        confirmLabel: deleteProject(),
        tone: 'danger',
      });
      if (!alive) return;
      return toast(ok ? L('Projeto excluído (de mentirinha)', 'Project deleted (just pretend)', 'Proyecto eliminado (de mentira)') : L('Nada foi excluído', 'Nothing was deleted', 'No se eliminó nada'), { tone: ok ? 'danger' : 'neutral', icon: ok ? 'trash' : 'check' });
    }

    const demo = event.target.closest('[data-open-demo]')?.dataset.openDemo;
    if (demo === 'form') {
      return show({
        eyebrow: projectEyebrow(),
        title: L('Renomear projeto', 'Rename project', 'Renombrar proyecto'),
        body: formBody(),
        actions: [
          { label: cancel(), value: 'cancel' },
          { label: L('Salvar', 'Save', 'Guardar'), value: 'save', variant: 'primary' },
        ],
      });
    }
    if (demo === 'long') {
      return show({
        eyebrow: L('Histórico', 'History', 'Historial'),
        title: L('Como funciona o histórico', 'How the history works', 'Cómo funciona el historial'),
        body: longBody(),
        size: 'md',
        actions: [{ label: gotIt(), value: 'ok', variant: 'primary' }],
      });
    }
  };
  root.addEventListener('click', onClick);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    alive = false;
    root.removeEventListener('click', onClick);
    // fecha qualquer modal ainda aberto por esta página
    document.querySelectorAll('dialog.ds-modal[open]').forEach((d) => d.close());
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
