import { icon } from '../../ds/icons/icons.js';
import { formatNumber } from '../../ds/js/i18n.js';
import { toast, toastContent, toastClasses, clearToasts, getToastPosition, setToastPosition } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/toast.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const seconds = (n) => `${formatNumber(n)} s`;

const TONES = () => [
  ['neutral', L('Neutro', 'Neutral', 'Neutro'), L('Link copiado', 'Link copied', 'Enlace copiado'), L('O padrão: confirmações simples do que a pessoa acabou de fazer.', 'The default: simple confirmations of what someone just did.', 'El predeterminado: confirmaciones simples de lo que la persona acaba de hacer.')],
  ['success', L('Sucesso', 'Success', 'Éxito'), L('Alterações salvas', 'Changes saved', 'Cambios guardados'), L('Algo que demorou ou importava terminou bem.', 'Something that took a while or mattered finished well.', 'Algo que tardó o importaba terminó bien.')],
  ['info', L('Informação', 'Info', 'Información'), L('Nova versão disponível', 'New version available', 'Nueva versión disponible'), L('Uma novidade que não pede ação imediata.', 'News that doesn’t call for immediate action.', 'Una novedad que no pide acción inmediata.')],
  ['warning', L('Aviso', 'Warning', 'Aviso'), L('Você está sem conexão', 'You’re offline', 'Estás sin conexión'), L('Atenção, sem bloquear. O app continua funcionando.', 'Attention, without blocking. The app keeps working.', 'Atención, sin bloquear. La app sigue funcionando.')],
  ['danger', L('Perigo', 'Danger', 'Peligro'), L('Não foi possível enviar', 'Couldn’t send', 'No se pudo enviar'), L('Falhou, mas dá para tentar de novo. Erros graves ficam na tela.', 'It failed, but you can try again. Serious errors stay on screen.', 'Falló, pero se puede intentar de nuevo. Los errores graves quedan en pantalla.')],
];

const DURATIONS = () => [
  ['short', L(`Curta · ${seconds(2.2)}`, `Short · ${seconds(2.2)}`, `Corta · ${seconds(2.2)}`)],
  ['long', L(`Longa · ${seconds(5)}`, `Long · ${seconds(5)}`, `Larga · ${seconds(5)}`)],
  ['sticky', L('Até fechar', 'Until closed', 'Hasta cerrar')],
];

const durationMs = (id) => (id === 'long' ? 5000 : id === 'sticky' ? Infinity : undefined);

const POSITIONS = () => [
  ['top-start', L('Em cima, à esquerda', 'Top left', 'Arriba, a la izquierda')],
  ['top-center', L('Em cima, ao centro', 'Top center', 'Arriba, al centro')],
  ['top-end', L('Em cima, à direita', 'Top right', 'Arriba, a la derecha')],
  ['bottom-start', L('Embaixo, à esquerda', 'Bottom left', 'Abajo, a la izquierda')],
  ['bottom-center', L('Embaixo, ao centro', 'Bottom center', 'Abajo, al centro')],
  ['bottom-end', L('Embaixo, à direita', 'Bottom right', 'Abajo, a la derecha')],
];

const positionLabel = (id) => POSITIONS().find(([p]) => p === id)?.[1] ?? id;
const appDefaultLabel = (id) => L(`Padrão do app: ${positionLabel(id).toLowerCase()}`, `App default: ${positionLabel(id).toLowerCase()}`, `Predeterminado de la app: ${positionLabel(id).toLowerCase()}`);
const undo = () => L('Desfazer', 'Undo', 'Deshacer');
const show = () => L('Mostrar', 'Show', 'Mostrar');

const WHERE = () => [
  ['bottom-center', L('Confirmações em geral. Longe da navegação e das ações do topo. É o padrão.', 'Confirmations in general. Away from navigation and top actions. It’s the default.', 'Confirmaciones en general. Lejos de la navegación y de las acciones de arriba. Es el predeterminado.')],
  ['bottom-end', L('Telas com trabalho no centro — editores, tabelas largas: o canto não cobre o conteúdo.', 'Screens with work in the center — editors, wide tables: the corner doesn’t cover the content.', 'Pantallas con trabajo en el centro — editores, tablas anchas: la esquina no tapa el contenido.')],
  ['top-center', L('Avisos do sistema que valem para a tela toda, como conexão ou sessão.', 'System notices that apply to the whole screen, like connection or session.', 'Avisos del sistema que valen para toda la pantalla, como conexión o sesión.')],
  ['top-end', L('Notificações que chegam de fora (mensagens, convites). Fica abaixo da topbar, sem cobrir as ações dela.', 'Notifications coming from outside (messages, invites). It sits below the topbar, without covering its actions.', 'Notificaciones que llegan de fuera (mensajes, invitaciones). Queda debajo de la barra superior, sin tapar sus acciones.')],
  ['bottom-start', L('Evite no app shell: no desktop cobre o rodapé da sidebar.', 'Avoid in the app shell: on desktop it covers the sidebar footer.', 'Evítalo en el app shell: en escritorio tapa el pie de la barra lateral.')],
  ['top-start', L('Raramente: fica sobre a navegação da sidebar.', 'Rarely: it sits over the sidebar navigation.', 'Raramente: queda sobre la navegación de la barra lateral.')],
];

/** Miniatura de tela com os seis pontos — cada um dispara um toast de verdade ali. */
function positionPicker(selected) {
  const appDefault = getToastPosition();
  const defaultNote = L(' (padrão do app)', ' (app default)', ' (predeterminado de la app)');
  return `<div class="ts-picker" role="group" aria-label="${L('Posição do toast', 'Toast position', 'Posición del toast')}">
    <div class="ts-picker__screen" aria-hidden="true"><span class="ts-picker__sidebar"></span><span class="ts-picker__topbar"></span></div>
    ${POSITIONS().map(
      ([id, label]) => `<button type="button" class="ts-picker__dot ts-picker__dot--${id}" data-position="${id}" aria-pressed="${id === selected}"${id === appDefault ? ' data-default' : ''}
        aria-label="${label}${id === appDefault ? defaultNote : ''}" data-ds-tooltip="${label}" data-ds-tooltip-placement="${id.startsWith('top') ? 'bottom' : 'top'}"><span class="ts-picker__mark"></span></button>`,
    ).join('')}
  </div>`;
}

/* ───────── Montagem ───────── */

function pinned({ message, tone = 'neutral', action, dismissible }) {
  return `<div class="${toastClasses({ tone })} ts-pinned" data-open inert>${toastContent(message, { tone, action, dismissible })}</div>`;
}

function stateOptions(state) {
  return {
    message: state.message || L('Aviso', 'Notice', 'Aviso'),
    tone: state.tone,
    action: state.action === 'undo' ? { label: undo() } : undefined,
    dismissible: state.duration === 'sticky',
  };
}

function toastCode(state) {
  const opts = [];
  const undoFn = L('desfazer', 'undo', 'deshacer');
  if (state.tone !== 'neutral') opts.push(`tone: '${state.tone}'`);
  if (state.position && state.position !== 'bottom-center') opts.push(`position: '${state.position}'`);
  if (state.action === 'undo') opts.push(`action: { label: '${undo()}', onClick: ${undoFn} }`);
  if (state.duration === 'long') opts.push('duration: 5000');
  if (state.duration === 'sticky') opts.push('duration: Infinity');
  const message = (state.message || L('Aviso', 'Notice', 'Aviso')).replace(/'/g, "\\'");
  const call = opts.length ? `toast('${message}', {\n  ${opts.join(',\n  ')},\n});` : `toast('${message}');`;
  const handle = L('aviso', 'notice', 'aviso');
  const body = state.duration === 'sticky' ? `const ${handle} = ${call}\n// ${L('… depois', '… later', '… después')}: ${handle}.close();` : call;
  const appWide = state.position && state.position !== 'bottom-center' ? `\n\n// ${L('ou, para o app inteiro (salvo no navegador)', 'or, for the whole app (saved in the browser)', 'o, para toda la app (guardado en el navegador)')}:\n// setToastPosition('${state.position}');` : '';
  return `import { toast } from './ds/js/toast.js';\n\n${body}${appWide}`;
}

/* ───────── Página ───────── */

export default function renderToast(page) {
  const tones = TONES();
  const files = [L('Roteiro de lançamento', 'Launch plan', 'Guion de lanzamiento'), L('Paleta da campanha', 'Campaign palette', 'Paleta de la campaña'), L('Notas da reunião', 'Meeting notes', 'Notas de la reunión')];
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Confirma que algo aconteceu, sem interromper. Aparece embaixo, some sozinho e pode trazer uma ação curta, como desfazer.', 'Confirms that something happened, without interrupting. It shows at the bottom, goes away on its own, and can carry a short action, like undo.', 'Confirma que algo pasó, sin interrumpir. Aparece abajo, desaparece solo y puede traer una acción corta, como deshacer.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tons', 'tones', 'tonos')}</dt><dd class="doc-stat__value">${tones.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('duração padrão', 'default duration', 'duración predeterminada')}</dt><dd class="doc-stat__value">${seconds(2.2)}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('na tela ao mesmo tempo', 'on screen at once', 'en pantalla a la vez')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('posições', 'positions', 'posiciones')}</dt><dd class="doc-stat__value">${POSITIONS().length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['tons', L('Tons', 'Tones', 'Tonos')],
        ['acao', L('Com ação', 'With an action', 'Con acción')],
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
          <p class="doc-section__desc">${L('A prévia mostra o visual. “Mostrar toast” — ou um dos seis pontos da miniatura — dispara o de verdade, na posição escolhida.', 'The preview shows the look. “Show toast” — or one of the six dots in the thumbnail — fires the real one, in the chosen position.', 'La vista previa muestra el aspecto. “Mostrar toast” — o uno de los seis puntos de la miniatura — dispara el de verdad, en la posición elegida.')}</p>
        </div>
      </header>
      ${playgroundMarkup('toast')}
    </section>

    <section class="doc-section" id="tons" aria-labelledby="tons-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tons-title">${L('Tons', 'Tones', 'Tonos')}</h2>
          <p class="doc-section__desc">${L('O fundo é sempre o invertido — o toast se destaca de qualquer tela. O tom aparece só no ícone, para a cor não gritar.', 'The background is always inverse — the toast stands out on any screen. The tone shows only in the icon, so the color doesn’t shout.', 'El fondo es siempre el invertido — el toast destaca en cualquier pantalla. El tono aparece solo en el ícono, para que el color no grite.')}</p>
        </div>
      </header>
      <div class="ts-tones">
        ${tones.map(
          ([id, name, message, text]) => `<article class="cd-example">
            <div class="cd-example__preview">${pinned({ message, tone: id })}</div>
            <div class="cd-example__body">
              <p class="cd-example__name">${name}<code>${id === 'neutral' ? '—' : `tone: '${id}'`}</code></p>
              <p class="cd-example__text">${text}</p>
              <button type="button" class="ds-inline-action ts-tones__try" data-show-tone="${id}">${icon('play', { size: 16 })}${show()}</button>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="acao" aria-labelledby="acao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="acao-title">${L('Com ação', 'With an action', 'Con acción')}</h2>
          <p class="doc-section__desc">${L(`Uma ação só, curta e reversível — “Desfazer”, “Ver”, “Tentar de novo”. Com ação, o toast fica ${seconds(5)}.`, `A single action, short and reversible — “Undo”, “View”, “Try again”. With an action, the toast stays ${seconds(5)}.`, `Una sola acción, corta y reversible — “Deshacer”, “Ver”, “Intentar de nuevo”. Con acción, el toast queda ${seconds(5)}.`)}</p>
        </div>
      </header>
      <div class="ts-action">
        <div class="ts-action__demo">
          <ul class="ts-files" role="list" data-files>
            ${files
              .map((name) => `<li class="ts-file" data-file="${name}"><span class="ts-file__icon">${icon('file-text', { size: 18 })}</span><span class="ts-file__name">${name}</span><button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-archive aria-label="${L(`Arquivar ${name}`, `Archive ${name}`, `Archivar ${name}`)}" data-ds-tooltip="${L('Arquivar', 'Archive', 'Archivar')}">${icon('inbox', { size: 16 })}</button></li>`)
              .join('')}
          </ul>
          <p class="ts-files__empty" data-files-empty hidden>${L('Tudo arquivado.', 'All archived.', 'Todo archivado.')} <button type="button" class="ds-inline-action" data-files-reset>${icon('refresh', { size: 16 })}${L('Recomeçar', 'Start over', 'Empezar de nuevo')}</button></p>
        </div>
        <div class="ts-action__text">
          <p class="ts-action__lead">${L('Arquive um arquivo e desfaça pelo toast.', 'Archive a file and undo it from the toast.', 'Archiva un archivo y deshazlo desde el toast.')}</p>
          <p class="ts-action__note">${L('Desfazer no toast é melhor do que pedir confirmação antes: a pessoa age rápido e corrige se errar.', 'Undo in the toast beats asking for confirmation first: people act fast and fix it if they slip.', 'Deshacer en el toast es mejor que pedir confirmación antes: la persona actúa rápido y corrige si se equivoca.')}</p>
        </div>
      </div>
    </section>

    <section class="doc-section" id="comportamento" aria-labelledby="comportamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="comportamento-title">${L('Comportamento', 'Behavior', 'Comportamiento')}</h2>
          <p class="doc-section__desc">${L('Previsível: sempre no mesmo lugar, sempre saindo sozinho.', 'Predictable: always in the same place, always leaving on its own.', 'Predecible: siempre en el mismo lugar, siempre saliendo solo.')}</p>
        </div>
      </header>
      <div class="ts-behaviors">
        ${[
          ['layout', L('Seis posições', 'Six positions', 'Seis posiciones'), L('Embaixo ao centro é o padrão. Em cima, fica abaixo da topbar. O mais novo entra junto da borda e o toast desliza do lado de onde vem.', 'Bottom center is the default. At the top, it sits below the topbar. The newest enters next to the edge and the toast slides in from the side it comes from.', 'Abajo al centro es el predeterminado. Arriba, queda debajo de la barra superior. El más nuevo entra junto al borde y el toast se desliza desde el lado de donde viene.'), ['corners', L('Testar os seis', 'Try all six', 'Probar los seis')]],
          ['layers', L('No máximo 3 por posição', 'At most 3 per position', 'Como máximo 3 por posición'), L('O quarto empurra o mais antigo para fora. Cada posição tem a própria região anunciada.', 'The fourth pushes the oldest out. Each position has its own announced region.', 'El cuarto empuja al más antiguo fuera. Cada posición tiene su propia región anunciada.'), ['burst', L('Mostrar 4 seguidos', 'Show 4 in a row', 'Mostrar 4 seguidos')]],
          ['monitor', L('No celular', 'On phones', 'En el móvil'), L('Abaixo de 768 px, os cantos viram o centro do mesmo lado — em cima ou embaixo.', 'Below 768 px, the corners become the center of the same side — top or bottom.', 'Por debajo de 768 px, las esquinas pasan al centro del mismo lado — arriba o abajo.')],
          ['clock', L('Pausa com o ponteiro', 'Pauses with the pointer', 'Pausa con el puntero'), L('Passou o mouse ou chegou com Tab, o tempo para. Saiu, continua.', 'Hover or Tab to it and the timer stops. Leave and it resumes.', 'Si pasas el mouse o llegas con Tab, el tiempo se detiene. Si sales, sigue.')],
          ['x', L('Até fechar', 'Until closed', 'Hasta cerrar'), L(`Com ${ic('duration: Infinity')} ganha um ×. Feche pelo código com ${ic('.close()')}.`, `With ${ic('duration: Infinity')} it gets a ×. Close it from code with ${ic('.close()')}.`, `Con ${ic('duration: Infinity')} gana un ×. Ciérralo desde el código con ${ic('.close()')}.`), ['sticky', L('Mostrar até fechar', 'Show until closed', 'Mostrar hasta cerrar')]],
        ]
          .map(
            ([glyph, title, text, demo]) => `<article class="ts-behavior">
              <span class="ts-behavior__icon">${icon(glyph, { size: 18 })}</span>
              <p class="ts-behavior__title">${title}</p>
              <p class="ts-behavior__text">${text}</p>
              ${demo ? `<button type="button" class="ds-inline-action ts-behavior__demo" data-demo="${demo[0]}">${icon('play', { size: 16 })}${demo[1]}</button>` : ''}
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('Avisa sem roubar o foco de ninguém.', 'It notifies without stealing anyone’s focus.', 'Avisa sin robarle el foco a nadie.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Anunciado com educação', 'Politely announced', 'Anunciado con educación'), L(`A região é ${ic('role="status"')} com ${ic('aria-live="polite"')}: o leitor de tela lê quando terminar o que está falando.`, `The region is ${ic('role="status"')} with ${ic('aria-live="polite"')}: the screen reader reads it once it finishes what it’s saying.`, `La región es ${ic('role="status"')} con ${ic('aria-live="polite"')}: el lector de pantalla la lee cuando termina lo que está diciendo.`)],
        [L('Não move o foco', 'Doesn’t move focus', 'No mueve el foco'), L('A pessoa continua onde estava. A ação do toast é alcançável com Tab.', 'People stay where they were. The toast’s action is reachable with Tab.', 'La persona sigue donde estaba. La acción del toast se alcanza con Tab.'), ['Tab']],
        [L('Tempo suficiente', 'Enough time', 'Tiempo suficiente'), L(`Pausa no hover e no foco. Com ação, ${seconds(5)}; para algo importante, use “até fechar”.`, `Pauses on hover and focus. With an action, ${seconds(5)}; for something important, use “until closed”.`, `Pausa con hover y foco. Con acción, ${seconds(5)}; para algo importante, usa “hasta cerrar”.`)],
        [L('Não depende da cor', 'Doesn’t rely on color', 'No depende del color'), L('Cada tom tem ícone próprio — sucesso, aviso, perigo e informação se distinguem sem cor.', 'Each tone has its own icon — success, warning, danger, and info are told apart without color.', 'Cada tono tiene su propio ícono — éxito, aviso, peligro e información se distinguen sin color.')],
        [L('Mensagem completa', 'A complete message', 'Mensaje completo'), L('Escreva o que aconteceu, não só “Pronto!”. Quem só ouve o anúncio precisa entender.', 'Write what happened, not just “Done!”. Someone who only hears the announcement needs to understand.', 'Escribe lo que pasó, no solo “¡Listo!”. Quien solo oye el anuncio necesita entender.')],
        [L('Erro sério fica na tela', 'Serious errors stay on screen', 'El error serio queda en pantalla'), L('Se a pessoa precisa agir para resolver, mostre o erro perto do problema — não num aviso que some.', 'If people need to act to fix it, show the error near the problem — not in a notice that disappears.', 'Si la persona necesita actuar para resolverlo, muestra el error cerca del problema — no en un aviso que desaparece.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Fundo invertido para destacar; tons só no ícone.', 'An inverse background to stand out; tones only in the icon.', 'Fondo invertido para destacar; tonos solo en el ícono.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.inverse', L('Fundo', 'Background', 'Fondo')],
        ['color.fg.inverse', L('Texto e ação', 'Text and action', 'Texto y acción')],
        ['radius.md', L('Raio', 'Radius', 'Radio')],
        ['shadow.lg', L('Sombra', 'Shadow', 'Sombra')],
        ['text.label-md', L('Mensagem', 'Message', 'Mensaje')],
        ['color.success.solid', L('Ícone de sucesso', 'Success icon', 'Ícono de éxito')],
        ['color.warning.solid', L('Ícone de aviso', 'Warning icon', 'Ícono de aviso')],
        ['color.danger.solid', L('Ícone de perigo', 'Danger icon', 'Ícono de peligro')],
        ['color.info.solid', L('Ícone de informação', 'Info icon', 'Ícono de información')],
        ['duration.base', L('Entrada e saída', 'Enter and exit', 'Entrada y salida')],
        ['easing.emphasized', L('Curva da entrada', 'Enter curve', 'Curva de entrada')],
        ['z.toast', L('Camada', 'Layer', 'Capa')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Para confirmar, não para conversar.', 'To confirm, not to chat.', 'Para confirmar, no para conversar.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: confirme o que aconteceu', 'Do: confirm what happened', 'Haz: confirma lo que pasó')}</p>
          <div class="ts-usage" inert>${pinned({ message: L('Link copiado', 'Link copied', 'Enlace copiado') })}</div>
          <p class="usage-card__text">${L('Curto, no passado, dizendo o resultado — embaixo, onde não cobre a navegação.', 'Short, in the past tense, stating the result — at the bottom, where it doesn’t cover navigation.', 'Corto, en pasado, diciendo el resultado — abajo, donde no tapa la navegación.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: erro importante que some', 'Avoid: an important error that disappears', 'Evita: error importante que desaparece')}</p>
          <div class="ts-usage" inert>${pinned({ message: L('Cartão recusado', 'Card declined', 'Tarjeta rechazada'), tone: 'danger' })}</div>
          <p class="usage-card__text">${L('Se a pessoa precisa resolver, o erro fica na tela, perto do campo.', 'If people need to fix it, the error stays on screen, near the field.', 'Si la persona necesita resolverlo, el error queda en pantalla, cerca del campo.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Desfazer em vez de confirmar', 'Undo instead of confirm', 'Deshacer en vez de confirmar')}</p>
          <div class="ts-usage" inert>${pinned({ message: L('Projeto arquivado', 'Project archived', 'Proyecto archivado'), action: { label: undo() } })}</div>
          <p class="usage-card__text">${L('Para ações reversíveis, agir direto e oferecer desfazer é mais rápido do que um modal.', 'For reversible actions, acting right away and offering undo is faster than a modal.', 'Para acciones reversibles, actuar directo y ofrecer deshacer es más rápido que un modal.')}</p>
        </article>
      </div>
      <h3 class="doc-subhead">${L('Onde posicionar', 'Where to place it', 'Dónde ubicarlo')} <span class="doc-subhead__meta">${L('uma posição só para o app inteiro', 'one position for the whole app', 'una sola posición para toda la app')}</span></h3>
      <div class="doc-table ts-where">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Posição', 'Position', 'Posición')}</span><span>${L('Quando usar', 'When to use', 'Cuándo usar')}</span><span></span></div>
        ${WHERE().map(
          ([id, text]) => `<div class="doc-table__row">
            <span class="ts-where__pos"><span class="ts-where__mini ts-where__mini--${id}" aria-hidden="true"><i></i></span><span><span class="ts-where__label">${positionLabel(id)}</span><code>${id}</code></span></span>
            <span class="ts-where__text">${text}</span>
            <button type="button" class="ds-inline-action" data-show-at="${id}">${icon('play', { size: 16 })}${show()}</button>
          </div>`,
        ).join('')}
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  let current = null;

  const unmountPlayground = mountPlayground(root, {
    id: 'toast',
    controls: [
      { id: 'tone', label: L('Tom', 'Tone', 'Tono'), value: 'success', options: TONES().map(([value, label]) => ({ value, label })) },
      { id: 'action', label: L('Ação', 'Action', 'Acción'), value: 'none', options: [{ value: 'none', label: L('Sem ação', 'No action', 'Sin acción') }, { value: 'undo', label: undo() }] },
      { id: 'duration', label: L('Duração', 'Duration', 'Duración'), value: 'short', options: DURATIONS().map(([value, label]) => ({ value, label })) },
      { id: 'position', label: L('Posição', 'Position', 'Posición'), value: getToastPosition(), options: POSITIONS().map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'message', label: L('Mensagem', 'Message', 'Mensaje'), value: L('Alterações salvas', 'Changes saved', 'Cambios guardados') },
    render: (state) => {
      current = state;
      const isDefault = state.position === getToastPosition();
      return `<div class="ts-pg">
        <div class="ts-pg__main">
          ${pinned(stateOptions(state))}
          <div class="ts-pg__actions">
            <button type="button" class="ds-btn ds-btn--secondary" data-show-playground>${icon('play', { size: 16 })}${L('Mostrar toast', 'Show toast', 'Mostrar toast')}</button>
            <button type="button" class="ds-btn ds-btn--ghost" data-set-default aria-pressed="${isDefault}">${icon(isDefault ? 'check' : 'target', { size: 16 })}${isDefault ? L('É o padrão do app', 'It’s the app default', 'Es el predeterminado de la app') : L('Usar como padrão do app', 'Use as app default', 'Usar como predeterminado de la app')}</button>
          </div>
          <p class="ts-pg__note">${appDefaultLabel(getToastPosition())}</p>
        </div>
        ${positionPicker(state.position)}
      </div>`;
    },
    code: toastCode,
  });

  const files = root.querySelector('[data-files]');
  const empty = root.querySelector('[data-files-empty]');
  const syncEmpty = () => (empty.hidden = files.querySelector('.ts-file:not([hidden])') !== null);

  const showCurrent = (position) => {
    const o = stateOptions(current);
    toast(o.message, {
      tone: o.tone,
      position,
      duration: durationMs(current.duration),
      action: o.action ? { label: undo(), onClick: () => toast(L('Desfeito', 'Undone', 'Deshecho'), { icon: 'refresh', position }) } : undefined,
    });
  };

  /** Escolhe um valor num controle do playground (pelo próprio menu, para o estado e o código acompanharem). */
  const setControl = (id, value) => {
    const chip = root.querySelector(`[data-playground="toast"] [data-control="${id}"]`);
    if (!chip) return;
    chip.click();
    document.getElementById(chip.getAttribute('aria-controls'))?.querySelector(`[data-value="${value}"]`)?.click();
  };

  const onClick = (event) => {
    if (event.target.closest('[data-show-playground]') && current) return showCurrent(current.position);

    const dot = event.target.closest('[data-position]');
    if (dot && current) {
      const position = dot.dataset.position;
      setControl('position', position);
      showCurrent(position);
      root.querySelector(`[data-playground="toast"] [data-position="${position}"]`)?.focus({ preventScroll: true });
      return;
    }

    if (event.target.closest('[data-set-default]') && current) {
      const position = setToastPosition(current.position);
      setControl('position', position); // redesenha o botão e a miniatura
      toast(appDefaultLabel(position), { icon: 'target' });
      root.querySelector('[data-playground="toast"] [data-set-default]')?.focus({ preventScroll: true });
      return;
    }

    const at = event.target.closest('[data-show-at]')?.dataset.showAt;
    if (at) return toast(positionLabel(at), { icon: 'layout', position: at });

    const tone = event.target.closest('[data-show-tone]')?.dataset.showTone;
    if (tone) {
      const [, , message] = TONES().find(([id]) => id === tone);
      toast(message, { tone });
      return;
    }

    const archive = event.target.closest('[data-archive]');
    if (archive) {
      const item = archive.closest('.ts-file');
      item.hidden = true;
      syncEmpty();
      toast(L(`“${item.dataset.file}” arquivado`, `“${item.dataset.file}” archived`, `“${item.dataset.file}” archivado`), {
        tone: 'success',
        action: {
          label: undo(),
          onClick: () => {
            item.hidden = false;
            syncEmpty();
          },
        },
      });
      return;
    }

    if (event.target.closest('[data-files-reset]')) {
      files.querySelectorAll('.ts-file').forEach((f) => (f.hidden = false));
      syncEmpty();
      return;
    }

    const demo = event.target.closest('[data-demo]')?.dataset.demo;
    if (demo === 'corners') {
      POSITIONS().forEach(([position, label], i) => setTimeout(() => toast(label, { icon: 'layout', position }), i * 180));
    } else if (demo === 'burst') {
      [
        L('Primeiro aviso', 'First notice', 'Primer aviso'),
        L('Segundo aviso', 'Second notice', 'Segundo aviso'),
        L('Terceiro aviso', 'Third notice', 'Tercer aviso'),
        L('Quarto aviso — o primeiro sai', 'Fourth notice — the first one leaves', 'Cuarto aviso — el primero sale'),
      ].forEach((m, i) => setTimeout(() => toast(m, { icon: 'bell' }), i * 260));
    } else if (demo === 'sticky') {
      toast(L('Sincronizando 3 arquivos…', 'Syncing 3 files…', 'Sincronizando 3 archivos…'), { icon: 'refresh', duration: Infinity });
    }
  };
  root.addEventListener('click', onClick);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    clearToasts();
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
