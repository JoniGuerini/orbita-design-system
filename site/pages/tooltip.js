import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L, ratio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/tooltip.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const PLACEMENTS = () => [
  ['top', L('Em cima', 'Top', 'Arriba'), L('Dica em cima', 'Tooltip on top', 'Tooltip arriba')],
  ['right', L('À direita', 'Right', 'A la derecha'), L('Dica à direita', 'Tooltip on the right', 'Tooltip a la derecha')],
  ['bottom', L('Embaixo', 'Bottom', 'Abajo'), L('Dica embaixo', 'Tooltip at the bottom', 'Tooltip abajo')],
  ['left', L('À esquerda', 'Left', 'A la izquierda'), L('Dica à esquerda', 'Tooltip on the left', 'Tooltip a la izquierda')],
];

const TRIGGERS = () => [
  ['icon', L('Botão de ícone', 'Icon button', 'Botón de ícono')],
  ['button', L('Botão com rótulo', 'Labeled button', 'Botón con etiqueta')],
  ['text', L('Termo no texto', 'Term in text', 'Término en el texto')],
];

const KBDS = () => [
  ['none', L('Sem atalho', 'No shortcut', 'Sin atajo')],
  ['⌘K', '⌘K'],
  ['⌘B', '⌘B'],
  ['Esc', 'Esc'],
];

const hint = () => L('Dica', 'Tip', 'Pista');
const exportLabel = () => L('Exportar', 'Export', 'Exportar');

/* ───────── Montagem ───────── */

const attrs = (text, placement, kbd) =>
  `data-ds-tooltip="${escapeHtml(text)}" data-ds-tooltip-placement="${placement}"${kbd && kbd !== 'none' ? ` data-ds-tooltip-kbd="${escapeHtml(kbd)}"` : ''}`;

function trigger(state) {
  const a = attrs(state.text || hint(), state.placement, state.kbd);
  if (state.trigger === 'button') return `<button type="button" class="ds-btn ds-btn--secondary" ${a}>${icon('download', { size: 18 })}${exportLabel()}</button>`;
  if (state.trigger === 'text') return `<span class="tt-term" tabindex="0" ${a}>OKLCH</span>`;
  return `<button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="${escapeHtml(state.text || hint())}" ${a}>${icon('search')}</button>`;
}

/** Tooltip "fixo" (só para mostrar o visual; o de verdade aparece no hover/foco). */
const pinned = (text, kbd) =>
  `<span class="ds-tooltip tt-pinned" data-open>${escapeHtml(text)}${kbd && kbd !== 'none' ? `<kbd class="ds-kbd">${escapeHtml(kbd)}</kbd>` : ''}</span>`;

function triggerCode(state) {
  const text = state.text || hint();
  const kbd = state.kbd && state.kbd !== 'none' ? `\n  data-ds-tooltip-kbd="${state.kbd}"` : '';
  const place = state.placement !== 'top' ? `\n  data-ds-tooltip-placement="${state.placement}"` : '';
  if (state.trigger === 'button') return `<button type="button" class="ds-btn ds-btn--secondary"\n  data-ds-tooltip="${text}"${place}${kbd}>\n  <ds-icon name="download"></ds-icon>\n  ${exportLabel()}\n</button>`;
  if (state.trigger === 'text') return `<span tabindex="0"\n  data-ds-tooltip="${text}"${place}${kbd}>\n  OKLCH\n</span>`;
  return `<button type="button" class="ds-icon-btn" aria-label="${text}"\n  data-ds-tooltip="${text}"${place}${kbd}>\n  <ds-icon name="search"></ds-icon>\n</button>`;
}

/* ───────── Página ───────── */

export default function renderTooltip(page) {
  const placements = PLACEMENTS();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Uma dica curta que aparece no hover ou no foco. Nomeia ícones e mostra atalhos — nunca guarda informação que a pessoa precisa para seguir.', 'A short hint that appears on hover or focus. It names icons and shows shortcuts — it never holds information people need to move on.', 'Una pista corta que aparece al pasar el mouse o al enfocar. Nombra íconos y muestra atajos — nunca guarda información que la persona necesita para seguir.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('posições', 'placements', 'posiciones')}</dt><dd class="doc-stat__value">${placements.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('espera', 'delay', 'espera')}</dt><dd class="doc-stat__value">450 ms</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('largura máxima', 'max width', 'ancho máximo')}</dt><dd class="doc-stat__value">240 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">JavaScript</dt><dd class="doc-stat__value">${L('0 linhas', '0 lines', '0 líneas')}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['posicoes', L('Posições', 'Placements', 'Posiciones')],
        ['atalhos', L('Com atalho', 'With a shortcut', 'Con atajo')],
        ['comportamento', L('Comportamento', 'Behavior', 'Comportamiento')],
        ['quando-nao', L('Quando não usar', 'When not to use', 'Cuándo no usar')],
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
          <p class="doc-section__desc">${L('A dica fixa mostra o visual. Passe o mouse ou chegue com Tab no gatilho para ver a de verdade.', 'The pinned tooltip shows the look. Hover or Tab to the trigger to see the real one.', 'La pista fija muestra el aspecto. Pasa el mouse o llega con Tab al disparador para ver la de verdad.')}</p>
        </div>
      </header>
      ${playgroundMarkup('tooltip')}
    </section>

    <section class="doc-section" id="posicoes" aria-labelledby="posicoes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="posicoes-title">${L('Posições', 'Placements', 'Posiciones')}</h2>
          <p class="doc-section__desc">${L('Em cima é o padrão. Escolha outra quando a dica cobriria algo importante ou quando o gatilho está numa borda — perto do limite da tela, ela se ajusta sozinha.', 'Top is the default. Pick another when the tooltip would cover something important or the trigger sits on an edge — near the screen limit, it adjusts on its own.', 'Arriba es el predeterminado. Elige otra cuando la pista taparía algo importante o cuando el disparador está en un borde — cerca del límite de la pantalla, se ajusta sola.')}</p>
        </div>
      </header>
      <div class="tt-compass">
        ${placements.map(
          ([id, label, aria]) => `<div class="tt-compass__cell tt-compass__cell--${id}">
            <button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="${aria}" ${attrs(label, id)}>${icon({ top: 'arrow-up', right: 'arrow-right', bottom: 'chevron-down', left: 'arrow-left' }[id])}</button>
            <code class="ds-inline-code">${id}</code>
          </div>`,
        ).join('')}
        <p class="tt-compass__center">${L('Passe o mouse', 'Hover here', 'Pasa el mouse')}</p>
      </div>
    </section>

    <section class="doc-section" id="atalhos" aria-labelledby="atalhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="atalhos-title">${L('Com atalho', 'With a shortcut', 'Con atajo')}</h2>
          <p class="doc-section__desc">${L(`O melhor lugar para ensinar um atalho é a dica da ação. Use ${ic('data-ds-tooltip-kbd')}.`, `The best place to teach a shortcut is the action’s tooltip. Use ${ic('data-ds-tooltip-kbd')}.`, `El mejor lugar para enseñar un atajo es la pista de la acción. Usa ${ic('data-ds-tooltip-kbd')}.`)}</p>
        </div>
      </header>
      <div class="cd-grid">
        ${[
          ['search', L('Buscar', 'Search', 'Buscar'), '⌘K'],
          ['panel-left', L('Recolher menu', 'Collapse menu', 'Contraer menú'), '⌘B'],
          ['x', L('Fechar', 'Close', 'Cerrar'), 'Esc'],
        ]
          .map(
            ([glyph, label, kbd]) => `<article class="cd-example">
              <div class="cd-example__preview tt-shortcut">
                ${pinned(label, kbd)}
                <button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="${label}" ${attrs(label, 'top', kbd)}>${icon(glyph)}</button>
              </div>
              <div class="cd-example__body"><p class="cd-example__name">${label}<code>${kbd}</code></p></div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="comportamento" aria-labelledby="comportamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="comportamento-title">${L('Comportamento', 'Behavior', 'Comportamiento')}</h2>
          <p class="doc-section__desc">${L('Uma espera curta evita dicas piscando quando o ponteiro só passa. Depois da primeira, as próximas aparecem na hora.', 'A short delay keeps tooltips from flickering when the pointer just passes by. After the first one, the next ones show right away.', 'Una espera corta evita pistas parpadeando cuando el puntero solo pasa. Después de la primera, las siguientes aparecen al instante.')}</p>
        </div>
      </header>
      <div class="tt-timeline" aria-hidden="true">
        <div class="tt-timeline__track">
          <span class="tt-timeline__phase tt-timeline__phase--wait" style="flex:450">${L('espera · 450 ms', 'delay · 450 ms', 'espera · 450 ms')}</span>
          <span class="tt-timeline__phase tt-timeline__phase--show" style="flex:600">${L('visível enquanto o ponteiro está no gatilho', 'visible while the pointer is on the trigger', 'visible mientras el puntero está en el disparador')}</span>
          <span class="tt-timeline__phase tt-timeline__phase--warm" style="flex:400">${L('aquecido · 400 ms', 'warm · 400 ms', 'caliente · 400 ms')}</span>
        </div>
        <div class="tt-timeline__marks"><span>${L('ponteiro entra', 'pointer enters', 'entra el puntero')}</span><span>${L('dica aparece', 'tooltip shows', 'aparece la pista')}</span><span>${L('ponteiro sai', 'pointer leaves', 'sale el puntero')}</span><span>${L('esfria', 'cools down', 'se enfría')}</span></div>
      </div>
      <div class="tt-try">
        <p class="tt-try__label">${L('Experimente: pare no primeiro e deslize para os outros.', 'Try it: rest on the first one and slide to the others.', 'Pruébalo: detente en el primero y desliza hacia los demás.')}</p>
        <div class="tt-try__row">
          ${[
            ['home', L('Início', 'Home', 'Inicio')],
            ['search', L('Buscar', 'Search', 'Buscar')],
            ['bell', L('Notificações', 'Notifications', 'Notificaciones')],
            ['calendar', L('Calendário', 'Calendar', 'Calendario')],
            ['settings', L('Configurações', 'Settings', 'Configuración')],
            ['user-circle', L('Sua conta', 'Your account', 'Tu cuenta')],
          ]
            .map(([glyph, label]) => `<button type="button" class="ds-icon-btn" aria-label="${label}" ${attrs(label, 'bottom')}>${icon(glyph)}</button>`)
            .join('')}
        </div>
      </div>
      <ul class="tt-rules" role="list">
        <li>${icon('check', { size: 16 })}<span>${L('No foco por teclado aparece na hora, sem espera.', 'On keyboard focus it shows right away, no delay.', 'Con el foco del teclado aparece al instante, sin espera.')}</span></li>
        <li>${icon('check', { size: 16 })}<span>${L('Some ao sair, clicar, rolar a página ou apertar Esc.', 'It hides on leave, click, page scroll, or Esc.', 'Desaparece al salir, hacer clic, desplazar la página o pulsar Esc.')}</span></li>
        <li>${icon('check', { size: 16 })}<span>${L('No toque não aparece — por isso nada essencial pode depender dela.', 'It doesn’t show on touch — so nothing essential can depend on it.', 'En pantallas táctiles no aparece — por eso nada esencial puede depender de ella.')}</span></li>
        <li>${icon('check', { size: 16 })}<span>${L('Um tooltip por vez: há um só elemento na página, reposicionado a cada gatilho.', 'One tooltip at a time: there’s a single element on the page, repositioned for each trigger.', 'Un tooltip a la vez: hay un solo elemento en la página, reposicionado en cada disparador.')}</span></li>
      </ul>
    </section>

    <section class="doc-section" id="quando-nao" aria-labelledby="quando-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="quando-title">${L('Quando não usar', 'When not to use', 'Cuándo no usar')}</h2>
          <p class="doc-section__desc">${L('Se a pessoa precisa da informação para continuar, ela não pode ficar escondida.', 'If people need the information to continue, it can’t be hidden.', 'Si la persona necesita la información para continuar, no puede quedar oculta.')}</p>
        </div>
      </header>
      <div class="tt-avoid">
        ${[
          [L('Informação essencial', 'Essential information', 'Información esencial'), L('Regras de senha, prazos, preços: escreva na tela, perto do campo.', 'Password rules, deadlines, prices: write them on screen, near the field.', 'Reglas de contraseña, plazos, precios: escríbelos en pantalla, cerca del campo.')],
          [L('Conteúdo interativo', 'Interactive content', 'Contenido interactivo'), L('Links ou botões dentro da dica não são alcançáveis. Use um menu ou um painel.', 'Links or buttons inside the tooltip can’t be reached. Use a menu or a panel.', 'Los enlaces o botones dentro de la pista no se pueden alcanzar. Usa un menú o un panel.')],
          [L('Texto longo', 'Long text', 'Texto largo'), L('Mais de uma linha curta vira leitura. Até ~240 px; passou disso, é texto da página.', 'More than one short line becomes reading. Up to ~240 px; beyond that, it’s page text.', 'Más de una línea corta se vuelve lectura. Hasta ~240 px; si pasa de eso, es texto de la página.')],
          [L('Elemento desativado', 'Disabled element', 'Elemento desactivado'), L('Botão desativado não recebe foco nem hover — a dica nunca aparece. Explique o motivo ao lado.', 'A disabled button gets no focus or hover — the tooltip never shows. Explain the reason beside it.', 'Un botón desactivado no recibe foco ni hover — la pista nunca aparece. Explica el motivo al lado.')],
        ]
          .map(
            ([title, text]) => `<article class="tt-avoid__item">
              <span class="tt-avoid__icon">${icon('x', { size: 16 })}</span>
              <div><p class="tt-avoid__title">${title}</p><p class="tt-avoid__text">${text}</p></div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('A dica complementa — o nome acessível vem sempre do próprio elemento.', 'The tooltip complements — the accessible name always comes from the element itself.', 'La pista complementa — el nombre accesible siempre viene del propio elemento.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Nome no elemento', 'Name on the element', 'Nombre en el elemento'), L(`Botão de ícone leva ${ic('aria-label')} com o mesmo texto da dica. O tooltip em si é ${ic('aria-hidden')}, para não ser lido duas vezes.`, `An icon button gets an ${ic('aria-label')} with the same text as the tooltip. The tooltip itself is ${ic('aria-hidden')}, so it isn’t read twice.`, `El botón de ícono lleva ${ic('aria-label')} con el mismo texto de la pista. El tooltip en sí es ${ic('aria-hidden')}, para no leerse dos veces.`)],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Aparece no foco visível e some com Esc, sem mover o foco.', 'It shows on visible focus and hides with Esc, without moving focus.', 'Aparece con el foco visible y desaparece con Esc, sin mover el foco.'), ['Tab', 'Esc']],
        [L('Persistente', 'Persistent', 'Persistente'), L('Fica visível enquanto o ponteiro está no gatilho ou ele tem foco.', 'It stays visible while the pointer is on the trigger or it has focus.', 'Queda visible mientras el puntero está en el disparador o este tiene foco.')],
        [L('Termos no texto', 'Terms in text', 'Términos en el texto'), L(`Um termo com dica precisa de ${ic('tabindex="0"')} para ser alcançável pelo teclado.`, `A term with a tooltip needs ${ic('tabindex="0"')} to be reachable by keyboard.`, `Un término con pista necesita ${ic('tabindex="0"')} para ser alcanzable con el teclado.`)],
        [L('Contraste', 'Contrast', 'Contraste'), L(`Texto padrão sobre a superfície elevada: acima de ${ratio(4.5, 1)} nos dois temas.`, `Default text on the raised surface: above ${ratio(4.5, 1)} in both themes.`, `Texto predeterminado sobre la superficie elevada: por encima de ${ratio(4.5, 1)} en los dos temas.`)],
        [L('Desligar por região', 'Turn off by region', 'Desactivar por región'), L(`Use ${ic('data-ds-tooltips="off"')} num ancestral quando o rótulo já está visível — como na sidebar expandida.`, `Use ${ic('data-ds-tooltips="off"')} on an ancestor when the label is already visible — like in the expanded sidebar.`, `Usa ${ic('data-ds-tooltips="off"')} en un ancestro cuando la etiqueta ya está visible — como en la barra lateral expandida.`)],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Uma superfície pequena, elevada e acima de tudo.', 'A small, raised surface above everything else.', 'Una superficie pequeña, elevada y por encima de todo.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', L('Fundo', 'Background', 'Fondo')],
        ['color.border.default', L('Borda', 'Border', 'Borde')],
        ['color.fg.default', L('Texto', 'Text', 'Texto')],
        ['shadow.lg', L('Sombra', 'Shadow', 'Sombra')],
        ['radius.sm', L('Raio', 'Radius', 'Radio')],
        ['text.label-sm', L('Texto', 'Text', 'Texto')],
        ['duration.fast', L('Entrada e saída', 'Enter and exit', 'Entrada y salida')],
        ['z.tooltip', L('Camada (a mais alta)', 'Layer (the highest)', 'Capa (la más alta)')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Curta, útil e só quando o elemento não fala por si.', 'Short, useful, and only when the element doesn’t speak for itself.', 'Corta, útil y solo cuando el elemento no habla por sí mismo.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: nomeie ícones', 'Do: name icons', 'Haz: nombra íconos')}</p>
          <div class="tt-usage" inert>${pinned(L('Notificações', 'Notifications', 'Notificaciones'))}<span class="ds-icon-btn ds-icon-btn--outline">${icon('bell')}</span></div>
          <p class="usage-card__text">${L('Duas ou três palavras dizendo o que o botão faz.', 'Two or three words saying what the button does.', 'Dos o tres palabras que dicen qué hace el botón.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: repetir o rótulo', 'Avoid: repeating the label', 'Evita: repetir la etiqueta')}</p>
          <div class="tt-usage" inert>${pinned(exportLabel())}<span class="ds-btn ds-btn--secondary ds-btn--sm">${exportLabel()}</span></div>
          <p class="usage-card__text">${L('Se o texto já está visível, a dica só atrapalha.', 'If the text is already visible, the tooltip only gets in the way.', 'Si el texto ya está visible, la pista solo estorba.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Mostre o atalho', 'Show the shortcut', 'Muestra el atajo')}</p>
          <div class="tt-usage" inert>${pinned(exportLabel(), '⌘E')}<span class="ds-btn ds-btn--secondary ds-btn--sm">${exportLabel()}</span></div>
          <p class="usage-card__text">${L('Num botão com rótulo, a dica vale a pena quando ensina algo novo — como o atalho.', 'On a labeled button, a tooltip is worth it when it teaches something new — like the shortcut.', 'En un botón con etiqueta, la pista vale la pena cuando enseña algo nuevo — como el atajo.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'tooltip',
    controls: [
      { id: 'placement', label: L('Posição', 'Placement', 'Posición'), value: 'top', options: PLACEMENTS().map(([value, label]) => ({ value, label })) },
      { id: 'trigger', label: L('Gatilho', 'Trigger', 'Disparador'), value: 'icon', options: TRIGGERS().map(([value, label]) => ({ value, label })) },
      { id: 'kbd', label: L('Atalho', 'Shortcut', 'Atajo'), value: '⌘K', options: KBDS().map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'text', label: L('Texto', 'Text', 'Texto'), value: L('Buscar', 'Search', 'Buscar') },
    render: (state) => `<div class="tt-pg tt-pg--${state.placement}">
        <span class="tt-pg__trigger">${trigger(state)}</span>
        ${pinned(state.text || hint(), state.kbd)}
      </div>`,
    code: triggerCode,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
