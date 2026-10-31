import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/acao-inline.css'];

/* ───────── Montagem (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const inScene = () => L('Na cena', 'In the scene', 'En la escena');
const defaultAction = () => L('Ação', 'Action', 'Acción');

const ICONS = () => [
  ['none', L('Sem ícone', 'No icon', 'Sin ícono')],
  ['video', L('Vídeo', 'Video', 'Video')],
  ['file-text', L('Documento', 'Document', 'Documento')],
  ['clock', L('Relógio', 'Clock', 'Reloj')],
  ['link', 'Link'],
];

function inlineAction(s) {
  const cls = ['ds-inline-action', s.emphasis === 'strong' && 'ds-inline-action--strong'].filter(Boolean).join(' ');
  const forced = s.state === 'hover' ? ' data-state="hover"' : '';
  const disabled = s.state === 'disabled';
  const glyph = s.icon && s.icon !== 'none' ? icon(s.icon, { size: 16 }) : '';
  const sign =
    s.sign === 'plus' ? icon('plus', { size: 14, className: 'ds-inline-action__plus' }) : s.sign === 'arrow' ? icon('arrow-right', { size: 14, className: 'ds-inline-action__arrow' }) : '';
  const label = escapeHtml(s.label || defaultAction());
  if (s.element === 'link') {
    return `<a class="${cls}" href="#/componentes/acao-inline"${forced}${disabled ? ' aria-disabled="true" tabindex="-1"' : ''}>${glyph}${label}${sign}</a>`;
  }
  return `<button type="button" class="${cls}"${forced}${disabled ? ' disabled' : ''}>${glyph}${label}${sign}</button>`;
}

function inlineActionCode(s) {
  const cls = ['ds-inline-action', s.emphasis === 'strong' && 'ds-inline-action--strong'].filter(Boolean).join(' ');
  const disabled = s.state === 'disabled';
  const inner = [
    s.icon && s.icon !== 'none' ? `  <ds-icon name="${s.icon}" size="16"></ds-icon>` : null,
    `  ${s.label || defaultAction()}`,
    s.sign === 'plus' ? '  <ds-icon name="plus" size="14" class="ds-inline-action__plus"></ds-icon>' : null,
    s.sign === 'arrow' ? '  <ds-icon name="arrow-right" size="14" class="ds-inline-action__arrow"></ds-icon>' : null,
  ].filter(Boolean);
  const open = s.element === 'link' ? `<a class="${cls}" href="/${L('historico', 'history', 'historial')}"${disabled ? ' aria-disabled="true"' : ''}>` : `<button type="button" class="${cls}"${disabled ? ' disabled' : ''}>`;
  return [open, ...inner, s.element === 'link' ? '</a>' : '</button>'].join('\n');
}

const FORMS = () => [
  [L('Ação no lugar', 'In-place action', 'Acción en el lugar'), L('Faz algo sem sair do contexto: adicionar, anexar, gerar.', 'Does something without leaving the context: add, attach, generate.', 'Hace algo sin salir del contexto: añadir, adjuntar, generar.'), { element: 'button', icon: 'file-text', sign: 'plus', label: L('Adicionar nota', 'Add note', 'Añadir nota') }, 'button'],
  [L('Navegação', 'Navigation', 'Navegación'), L('Leva a outra tela. A seta diz “ir para”.', 'Takes you to another screen. The arrow says “go to”.', 'Lleva a otra pantalla. La flecha dice “ir a”.'), { element: 'link', icon: 'none', sign: 'arrow', label: L('Ver histórico', 'See history', 'Ver historial') }, 'a'],
  [L('Com ícone', 'With icon', 'Con ícono'), L('O ícone antecipa o tipo de conteúdo.', 'The icon hints at the type of content.', 'El ícono anticipa el tipo de contenido.'), { element: 'button', icon: 'video', sign: 'plus', label: inScene() }, 'button'],
  [L('Forte', 'Strong', 'Fuerte'), L('Um pouco mais de presença, para o próximo passo de um texto.', 'A bit more presence, for the next step after some text.', 'Un poco más de presencia, para el siguiente paso de un texto.'), { element: 'link', icon: 'none', sign: 'arrow', emphasis: 'strong', label: L('Ver o que mudou', 'See what changed', 'Ver qué cambió') }, 'a'],
  [L('Desativada', 'Disabled', 'Desactivada'), L('Ainda não disponível. Diga por quê por perto.', 'Not available yet. Say why nearby.', 'Todavía no disponible. Di por qué cerca.'), { element: 'button', icon: 'clock', sign: 'none', state: 'disabled', label: L('Em breve', 'Coming soon', 'Pronto') }, 'button'],
];

/* ───────── Página ───────── */

export default function renderAcaoInline(page) {
  const forms = FORMS();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('A ação mais discreta do sistema. Vive dentro do conteúdo — “Na cena +”, “Ver histórico →” — e só se destaca quando o ponteiro chega.', 'The quietest action in the system. It lives inside the content — “In the scene +”, “See history →” — and only stands out when the pointer arrives.', 'La acción más discreta del sistema. Vive dentro del contenido — “En la escena +”, “Ver historial →” — y solo destaca cuando llega el puntero.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('formas', 'forms', 'formas')}</dt><dd class="doc-stat__value">${forms.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('altura mínima', 'min height', 'altura mínima')}</dt><dd class="doc-stat__value">28 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('texto', 'text', 'texto')}</dt><dd class="doc-stat__value">13 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('elementos', 'elements', 'elementos')}</dt><dd class="doc-stat__value">a · button</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['formas', L('Formas', 'Forms', 'Formas')],
        ['disclosure', L('Mostrar e esconder', 'Show and hide', 'Mostrar y ocultar')],
        ['inline-ghost', L('Inline ou ghost', 'Inline or ghost', 'En línea o ghost')],
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
          <p class="doc-section__desc">${L('Escolha o elemento, o ícone e o sinal. O palco mostra a ação dentro de uma seção, onde ela costuma morar.', 'Pick the element, icon, and sign. The stage shows the action inside a section, where it usually lives.', 'Elige el elemento, el ícono y el signo. El escenario muestra la acción dentro de una sección, donde suele vivir.')}</p>
        </div>
      </header>
      ${playgroundMarkup('acao-inline')}
    </section>

    <section class="doc-section" id="formas" aria-labelledby="formas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="formas-title">${L('Formas', 'Forms', 'Formas')}</h2>
          <p class="doc-section__desc">${L('O sinal no fim conta o que acontece: <strong>+</strong> adiciona ou abre algo aqui; <strong>→</strong> leva para outro lugar.', 'The sign at the end tells what happens: <strong>+</strong> adds or opens something here; <strong>→</strong> takes you elsewhere.', 'El signo al final cuenta qué pasa: <strong>+</strong> añade o abre algo aquí; <strong>→</strong> lleva a otro lugar.')}</p>
        </div>
      </header>
      <div class="cd-grid">
        ${forms.map(
          ([name, text, s, el]) => `<article class="cd-example">
            <div class="cd-example__preview" inert>${inlineAction(s)}</div>
            <div class="cd-example__body"><p class="cd-example__name">${name}<code>&lt;${el}&gt;</code></p><p class="cd-example__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="disclosure" aria-labelledby="disclosure-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="disclosure-title">${L('Mostrar e esconder', 'Show and hide', 'Mostrar y ocultar')}</h2>
          <p class="doc-section__desc">${L(`Com ${ic('&lt;details&gt;')}, a ação inline abre conteúdo extra no lugar. O <strong>+</strong> gira e vira <strong>×</strong> quando está aberto. Experimente:`, `With ${ic('&lt;details&gt;')}, the inline action opens extra content in place. The <strong>+</strong> rotates into an <strong>×</strong> when open. Try it:`, `Con ${ic('&lt;details&gt;')}, la acción en línea abre contenido extra en el lugar. El <strong>+</strong> gira y se vuelve <strong>×</strong> cuando está abierto. Pruébalo:`)}</p>
        </div>
      </header>
      <div class="ia-disclosure">
        <div class="ia-disclosure__demo">
          <section class="ds-section">
            <p class="ds-section__head"><span class="ds-section__stamp">24s</span><span>${L('Convide para conhecer', 'Invite people to check it out', 'Invita a conocer')}</span></p>
            <p class="ds-section__text">${L('Quer ver como ficaria a sua rotina? Conheça pelo link do perfil.', 'Want to see what your routine would look like? Check it out through the link in the profile.', '¿Quieres ver cómo quedaría tu rutina? Conócelo por el enlace del perfil.')}</p>
            <div class="ds-section__actions">
              <details class="ds-disclosure ia-disclosure__details">
                <summary class="ds-inline-action">${icon('file-text', { size: 16 })}${L('Mais detalhes', 'More details', 'Más detalles')}${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</summary>
                <div class="ds-disclosure__content ia-disclosure__content">
                  <p><span>${L('Formato', 'Format', 'Formato')}</span>${L('Vídeo vertical, 9:16', 'Vertical video, 9:16', 'Video vertical, 9:16')}</p>
                  <p><span>${L('Público', 'Audience', 'Público')}</span>${L('Pequenos negócios', 'Small businesses', 'Pequeños negocios')}</p>
                  <p><span>${L('Chamada', 'Call to action', 'Llamado')}</span>${L('Link no perfil', 'Link in profile', 'Enlace en el perfil')}</p>
                </div>
              </details>
            </div>
          </section>
        </div>
        ${codeBlock(`<details class="ds-disclosure">\n  <summary class="ds-inline-action">\n    <ds-icon name="file-text" size="16"></ds-icon>\n    ${L('Mais detalhes', 'More details', 'Más detalles')}\n    <ds-icon name="plus" size="14" class="ds-inline-action__plus"></ds-icon>\n  </summary>\n  <div class="ds-disclosure__content">…</div>\n</details>`)}
      </div>
    </section>

    <section class="doc-section" id="inline-ghost" aria-labelledby="inline-ghost-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="inline-ghost-title">${L('Inline ou ghost?', 'Inline or ghost?', '¿En línea o ghost?')}</h2>
          <p class="doc-section__desc">${L('Os dois são discretos. A diferença é onde estão.', 'Both are quiet. The difference is where they live.', 'Los dos son discretos. La diferencia es dónde están.')}</p>
        </div>
      </header>
      <div class="ia-compare">
        <article class="ia-compare__col">
          <div class="ia-compare__preview" inert aria-hidden="true">
            <div class="ia-compare__text">
              <span class="ia-line"></span><span class="ia-line"></span><span class="ia-line ia-line--short"></span>
              <div class="ia-compare__actions">
                <span class="ds-inline-action">${icon('video', { size: 16 })}${inScene()}${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span>
                <span class="ds-inline-action">${L('Ver exemplo', 'See example', 'Ver ejemplo')}${icon('arrow-right', { size: 14, className: 'ds-inline-action__arrow' })}</span>
              </div>
            </div>
          </div>
          <h3 class="ia-compare__title">${L('Ação inline', 'Inline action', 'Acción en línea')}</h3>
          <ul class="ia-compare__list" role="list">
            <li>${icon('check', { size: 16 })}${L('Dentro do conteúdo, logo depois do que ela afeta.', 'Inside the content, right after what it affects.', 'Dentro del contenido, justo después de lo que afecta.')}</li>
            <li>${icon('check', { size: 16 })}${L('Sem área visível: só texto, ícone e sinal.', 'No visible area: just text, icon, and sign.', 'Sin área visible: solo texto, ícono y signo.')}</li>
            <li>${icon('check', { size: 16 })}${L('Várias por tela, uma por bloco.', 'Several per screen, one per block.', 'Varias por pantalla, una por bloque.')}</li>
          </ul>
        </article>
        <article class="ia-compare__col">
          <div class="ia-compare__preview" inert aria-hidden="true">
            <div class="ia-compare__bar">
              <span class="ia-line ia-line--title"></span>
              <span class="ia-compare__spacer"></span>
              <span class="ds-btn ds-btn--ghost ds-btn--sm">${icon('star', { size: 16 })}${L('Exemplos', 'Examples', 'Ejemplos')}</span>
              <span class="ds-btn ds-btn--ghost ds-btn--sm">${icon('download', { size: 16 })}${L('Exportar', 'Export', 'Exportar')}</span>
            </div>
          </div>
          <h3 class="ia-compare__title">${L('Botão ghost', 'Ghost button', 'Botón ghost')}</h3>
          <ul class="ia-compare__list" role="list">
            <li>${icon('check', { size: 16 })}${L('Em barras, cabeçalhos e listas — fora do texto.', 'In bars, headers, and lists — outside the text.', 'En barras, encabezados y listas — fuera del texto.')}</li>
            <li>${icon('check', { size: 16 })}${L('Área de clique aparece no hover.', 'The click area shows on hover.', 'El área de clic aparece al pasar el cursor.')}</li>
            <li>${icon('check', { size: 16 })}${L('Para ações que valem para a tela inteira.', 'For actions that apply to the whole screen.', 'Para acciones que valen para toda la pantalla.')}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('Discreta para os olhos, clara para quem usa teclado e leitor de tela.', 'Quiet to the eye, clear to keyboard and screen reader users.', 'Discreta para los ojos, clara para quien usa teclado y lector de pantalla.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Elemento certo', 'The right element', 'El elemento correcto'), L(`Navega? ${ic('&lt;a href&gt;')}. Faz algo aqui? ${ic('&lt;button&gt;')}. Abre e fecha? ${ic('&lt;details&gt;&lt;summary&gt;')}.`, `Navigates? ${ic('&lt;a href&gt;')}. Does something here? ${ic('&lt;button&gt;')}. Opens and closes? ${ic('&lt;details&gt;&lt;summary&gt;')}.`, `¿Navega? ${ic('&lt;a href&gt;')}. ¿Hace algo aquí? ${ic('&lt;button&gt;')}. ¿Abre y cierra? ${ic('&lt;details&gt;&lt;summary&gt;')}.`)],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab foca; Enter aciona links e botões; Espaço também aciona botões e o summary.', 'Tab focuses; Enter activates links and buttons; Space also activates buttons and the summary.', 'Tab enfoca; Enter activa enlaces y botones; Espacio también activa botones y el summary.'), ['Tab', 'Enter', L('Espaço', 'Space', 'Espacio')]],
        [L('Área de toque', 'Touch target', 'Área táctil'), L('Altura mínima de 28 px, acima dos 24 px do WCAG 2.2 (tamanho do alvo).', 'A minimum height of 28 px, above WCAG 2.2’s 24 px (target size).', 'Altura mínima de 28 px, por encima de los 24 px de WCAG 2.2 (tamaño del objetivo).')],
        [L('Ícones e sinais são decorativos', 'Icons and signs are decorative', 'Íconos y signos son decorativos'), L('O texto diz a ação. O <strong>+</strong> e a <strong>→</strong> saem com aria-hidden.', 'The text says the action. The <strong>+</strong> and the <strong>→</strong> get aria-hidden.', 'El texto dice la acción. El <strong>+</strong> y la <strong>→</strong> salen con aria-hidden.')],
        [L('Estado do disclosure', 'Disclosure state', 'Estado del disclosure'), L('O summary nativo anuncia expandido e recolhido — não precisa de aria-expanded.', 'The native summary announces expanded and collapsed — no aria-expanded needed.', 'El summary nativo anuncia expandido y contraído — no necesita aria-expanded.')],
        [L('Desativada com motivo', 'Disabled with a reason', 'Desactivada con motivo'), L('Prefira explicar ao lado (“Em breve”). Links desativados levam aria-disabled e saem do Tab.', 'Prefer explaining next to it (“Coming soon”). Disabled links get aria-disabled and leave the Tab order.', 'Prefiere explicarlo al lado (“Pronto”). Los enlaces desactivados llevan aria-disabled y salen del Tab.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Poucos e todos de texto: é isso que a mantém leve.', 'Few, and all text tokens: that’s what keeps it light.', 'Pocos y todos de texto: eso es lo que la mantiene liviana.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['text.label-sm', L('Rótulo', 'Label', 'Etiqueta')],
        ['color.fg.subtle', L('Cor em repouso', 'Resting color', 'Color en reposo')],
        ['color.fg.default', L('Cor no hover e da forma forte', 'Hover and strong form color', 'Color en hover y de la forma fuerte')],
        ['color.fg.brand', L('Hover da forma forte', 'Strong form hover', 'Hover de la forma fuerte')],
        ['space.100', L('Espaço entre ícone, rótulo e sinal', 'Space between icon, label, and sign', 'Espacio entre ícono, etiqueta y signo')],
        ['radius.xs', L('Raio do anel de foco', 'Focus ring radius', 'Radio del anillo de foco')],
        ['duration.fast', L('Transição de cor', 'Color transition', 'Transición de color')],
        ['duration.base', L('Giro do + e passo da seta', 'The + rotation and the arrow step', 'Giro del + y paso de la flecha')],
        ['easing.emphasized', L('Curva do giro e da seta', 'Rotation and arrow curve', 'Curva del giro y de la flecha')],
        ['opacity.muted', L('Desativada', 'Disabled', 'Desactivada')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Três regras para ela continuar discreta.', 'Three rules to keep it quiet.', 'Tres reglas para que siga discreta.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: perto do que ela afeta', 'Do: close to what it affects', 'Haz: cerca de lo que afecta')}</p>
          <div class="ia-usage__preview" inert>
            <p class="ia-usage__text">${L('Abra com a situação do cliente.', 'Open with the customer’s situation.', 'Abre con la situación del cliente.')}</p>
            ${inlineAction({ element: 'button', icon: 'video', sign: 'plus', label: inScene() })}
          </div>
          <p class="usage-card__text">${L('Logo abaixo do bloco, alinhada ao texto.', 'Right below the block, aligned with the text.', 'Justo debajo del bloque, alineada al texto.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: a ação principal', 'Avoid: the main action', 'Evita: la acción principal')}</p>
          <div class="ia-usage__preview" inert>${inlineAction({ element: 'button', icon: 'none', sign: 'none', label: L('Publicar roteiro', 'Publish script', 'Publicar guion') })}</div>
          <p class="usage-card__text">${L('O que fecha a tarefa é um botão primário. Inline é para o caminho secundário.', 'What closes the task is a primary button. Inline is for the secondary path.', 'Lo que cierra la tarea es un botón primario. La acción en línea es para el camino secundario.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Um sinal por ação', 'One sign per action', 'Un signo por acción')}</p>
          <div class="ia-usage__preview" inert>${inlineAction({ element: 'button', icon: 'none', sign: 'plus', label: L('Adicionar', 'Add', 'Añadir') })}${inlineAction({ element: 'link', icon: 'none', sign: 'arrow', label: L('Abrir', 'Open', 'Abrir') })}</div>
          <p class="usage-card__text">${L('<strong>+</strong> adiciona ou abre aqui; <strong>→</strong> vai para outro lugar. Nunca os dois juntos.', '<strong>+</strong> adds or opens here; <strong>→</strong> goes elsewhere. Never both together.', '<strong>+</strong> añade o abre aquí; <strong>→</strong> va a otro lugar. Nunca los dos juntos.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'acao-inline',
    controls: [
      { id: 'element', label: L('Elemento', 'Element', 'Elemento'), value: 'button', options: [{ value: 'button', label: L('Botão', 'Button', 'Botón') }, { value: 'link', label: 'Link' }] },
      { id: 'icon', label: L('Ícone', 'Icon', 'Ícono'), value: 'video', options: ICONS().map(([value, label]) => ({ value, label })) },
      { id: 'sign', label: L('Sinal', 'Sign', 'Signo'), value: 'plus', options: [{ value: 'plus', label: L('Mais (+)', 'Plus (+)', 'Más (+)') }, { value: 'arrow', label: L('Seta (→)', 'Arrow (→)', 'Flecha (→)') }, { value: 'none', label: L('Nenhum', 'None', 'Ninguno') }] },
      { id: 'emphasis', label: L('Ênfase', 'Emphasis', 'Énfasis'), value: 'default', options: [{ value: 'default', label: L('Discreta', 'Quiet', 'Discreta') }, { value: 'strong', label: L('Forte', 'Strong', 'Fuerte') }] },
      { id: 'state', label: L('Estado', 'State', 'Estado'), value: 'default', options: [{ value: 'default', label: L('Normal', 'Default', 'Normal') }, { value: 'hover', label: 'Hover' }, { value: 'disabled', label: L('Desativada', 'Disabled', 'Desactivada') }] },
    ],
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: inScene() },
    render: (s) => `<div class="ia-stage" inert>
      <section class="ds-section">
        <p class="ds-section__head"><span class="ds-section__stamp">00s</span><span>${L('Abra com a situação', 'Open with the situation', 'Abre con la situación')}</span></p>
        <p class="ds-section__text">${L('Seu cliente marcou pelo WhatsApp e anotou no papel. Na hora de atender, precisa procurar nos dois lugares.', 'Your customer booked on WhatsApp and wrote it down on paper. When it’s time to serve them, you have to look in both places.', 'Tu cliente reservó por WhatsApp y lo anotó en papel. A la hora de atender, hay que buscar en los dos lugares.')}</p>
        <div class="ds-section__actions">${inlineAction(s)}</div>
      </section>
    </div>`,
    code: inlineActionCode,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
