import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L, ratio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/botao.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const VARIANTS = () => [
  ['primary', L('Primário', 'Primary', 'Primario'), L('A ação principal da tela. Uma por vez.', 'The screen’s main action. One at a time.', 'La acción principal de la pantalla. Una a la vez.')],
  ['secondary', L('Secundário', 'Secondary', 'Secundario'), L('Alternativa à principal: cancelar, voltar, ações de apoio.', 'An alternative to the main one: cancel, go back, supporting actions.', 'Alternativa a la principal: cancelar, volver, acciones de apoyo.')],
  ['ghost', 'Ghost', L('Ações discretas em barras, cabeçalhos e listas.', 'Quiet actions in bars, headers, and lists.', 'Acciones discretas en barras, encabezados y listas.')],
  ['subtle', L('Sutil', 'Subtle', 'Sutil'), L('Apoio com um pouco mais de presença que o ghost.', 'Support with a bit more presence than ghost.', 'Apoyo con un poco más de presencia que el ghost.')],
  ['danger', L('Perigo', 'Danger', 'Peligro'), L('Ações destrutivas e irreversíveis — sempre com confirmação.', 'Destructive, irreversible actions — always with confirmation.', 'Acciones destructivas e irreversibles — siempre con confirmación.')],
];

const SIZES = () => [
  ['sm', L('Pequeno', 'Small', 'Pequeño'), 32, 12, 'label-sm', 'radius.sm · 8 px'],
  ['md', L('Médio', 'Medium', 'Mediano'), 40, 16, 'label-md', 'radius.md · 12 px'],
  ['lg', L('Grande', 'Large', 'Grande'), 48, 20, 'label-lg', 'radius.md · 12 px'],
];

const STATES = () => [
  ['default', L('Normal', 'Default', 'Normal')],
  ['hover', 'Hover'],
  ['pressed', L('Pressionado', 'Pressed', 'Presionado')],
  ['focus', L('Foco', 'Focus', 'Foco')],
  ['disabled', L('Desativado', 'Disabled', 'Desactivado')],
];

const ICONS = () => [
  ['none', L('Sem ícone', 'No icon', 'Sin ícono')],
  ['pencil-start', L('Lápis à esquerda', 'Pencil on the left', 'Lápiz a la izquierda')],
  ['plus-start', L('Mais à esquerda', 'Plus on the left', 'Más a la izquierda')],
  ['download-start', L('Download à esquerda', 'Download on the left', 'Descarga a la izquierda')],
  ['arrow-right-end', L('Seta à direita', 'Arrow on the right', 'Flecha a la derecha')],
];

const pair = (id) => {
  const fg = contrast.filter((c) => c.fg === 'color.brand.on-solid' && c.bg === 'color.brand.solid');
  return ratio(Object.fromEntries(fg.map((c) => [c.mode, c.ratio]))[id]);
};

/* ───────── Montagem do botão (playground e exemplos) ───────── */

function classes({ variant = 'primary', size = 'md', shape = 'default' }) {
  return ['ds-btn', `ds-btn--${variant}`, size !== 'md' && `ds-btn--${size}`, shape !== 'default' && `ds-btn--${shape}`].filter(Boolean).join(' ');
}

function parseIcon(value) {
  if (!value || value === 'none') return null;
  const end = value.endsWith('-end');
  return { name: value.replace(/-(start|end)$/, ''), end };
}

const iconSize = (size) => (size === 'sm' ? 16 : size === 'lg' ? 20 : 18);
const defaultLabel = () => L('Botão', 'Button', 'Botón');

function button(state) {
  const icn = parseIcon(state.icon);
  const glyph = icn ? icon(icn.name, { size: iconSize(state.size) }) : '';
  const label = escapeHtml(state.label || defaultLabel());
  const forced = ['hover', 'pressed', 'focus'].includes(state.state) ? ` data-state="${state.state}"` : '';
  const disabled = state.state === 'disabled' ? ' disabled' : '';
  return `<button type="button" class="${classes(state)}"${forced}${disabled} tabindex="-1">${icn && !icn.end ? glyph : ''}${label}${icn?.end ? glyph : ''}</button>`;
}

function buttonCode(state) {
  const icn = parseIcon(state.icon);
  const glyph = icn ? `\n  <ds-icon name="${icn.name}"></ds-icon>` : '';
  const disabled = state.state === 'disabled' ? ' disabled' : '';
  const label = `\n  ${state.label || defaultLabel()}`;
  return `<button type="button" class="${classes(state)}"${disabled}>${icn && !icn.end ? glyph : ''}${label}${icn?.end ? glyph : ''}\n</button>`;
}

/* ───────── Página ───────── */

export default function renderBotao(page) {
  const variants = VARIANTS();
  const sizes = SIZES();
  const states = STATES();
  const create = L('Criar', 'Create', 'Crear');
  const save = L('Salvar', 'Save', 'Guardar');
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Dispara uma ação. Plano e direto: a cor fica para a ação principal, o resto se apoia em contorno e transparência.', 'Triggers an action. Flat and direct: color goes to the main action, the rest leans on outlines and transparency.', 'Dispara una acción. Plano y directo: el color queda para la acción principal, el resto se apoya en contorno y transparencia.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('variantes', 'variants', 'variantes')}</dt><dd class="doc-stat__value">${variants.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">${sizes.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estados', 'states', 'estados')}</dt><dd class="doc-stat__value">${states.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('contraste do primário', 'primary contrast', 'contraste del primario')}</dt><dd class="doc-stat__value">${pair('dark')}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['variantes', L('Variantes', 'Variants', 'Variantes')],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['icone', L('Botão de ícone', 'Icon button', 'Botón de ícono')],
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
          <p class="doc-section__desc">${L('Monte o botão, veja nos dois temas e copie o código pronto.', 'Build the button, check it in both themes, and copy the ready code.', 'Arma el botón, míralo en los dos temas y copia el código listo.')}</p>
        </div>
      </header>
      ${playgroundMarkup('botao')}
    </section>

    <section class="doc-section" id="variantes" aria-labelledby="variantes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="variantes-title">${L('Variantes', 'Variants', 'Variantes')}</h2>
          <p class="doc-section__desc">${L('A variante diz o peso da ação. Quanto mais importante, mais cor — e só uma ação ganha a cor da marca.', 'The variant says how much weight the action carries. The more important, the more color — and only one action gets the brand color.', 'La variante dice el peso de la acción. Cuanto más importante, más color — y solo una acción lleva el color de la marca.')}</p>
        </div>
      </header>
      <div class="cd-grid bt-variants">
        ${variants.map(
          ([id, name, text]) => `<article class="cd-example">
            <div class="cd-example__preview" inert>
              ${button({ variant: id, icon: id === 'danger' ? 'none' : 'pencil-start', label: id === 'danger' ? L('Excluir', 'Delete', 'Eliminar') : create })}
            </div>
            <div class="cd-example__body">
              <p class="cd-example__name">${name}<code>ds-btn--${id}</code></p>
              <p class="cd-example__text">${text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">${L('Tamanhos', 'Sizes', 'Tamaños')}</h2>
          <p class="doc-section__desc">${L('Médio é o padrão. Pequeno para barras densas e tabelas; grande para chamadas e telas de toque.', 'Medium is the default. Small for dense bars and tables; large for calls to action and touch screens.', 'Mediano es el predeterminado. Pequeño para barras densas y tablas; grande para llamados y pantallas táctiles.')}</p>
        </div>
      </header>
      <div class="bt-sizes">
        ${sizes.map(
          ([id, name, h, px, text, radius]) => `<article class="bt-size">
            <div class="bt-size__preview" inert>
              <span class="bt-size__guide" style="height:${h}px" aria-hidden="true"><span>${h}</span></span>
              ${button({ variant: 'primary', size: id, icon: 'pencil-start', label: create })}
            </div>
            <dl class="bt-size__specs">
              <div><dt>${L('Tamanho', 'Size', 'Tamaño')}</dt><dd>${name}${id === 'md' ? ` <span class="bt-size__default">${L('padrão', 'default', 'predeterminado')}</span>` : ''}</dd></div>
              <div><dt>${L('Altura', 'Height', 'Altura')}</dt><dd>size.control.${id} · ${h} px</dd></div>
              <div><dt>Padding</dt><dd>${px} px</dd></div>
              <div><dt>${L('Texto', 'Text', 'Texto')}</dt><dd>text.${text}</dd></div>
              <div><dt>${L('Raio', 'Radius', 'Radio')}</dt><dd>${radius}</dd></div>
              <div><dt>${L('Classe', 'Class', 'Clase')}</dt><dd><code class="ds-inline-code">${id === 'md' ? '—' : `ds-btn--${id}`}</code></dd></div>
            </dl>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estados-title">${L('Estados', 'States', 'Estados')}</h2>
          <p class="doc-section__desc">${L(`Todas as variantes reagem do mesmo jeito: hover clareia ou realça, pressionado escurece, foco ganha o anel. Para documentar e testar, force um estado com ${ic('data-state')}.`, `Every variant reacts the same way: hover lightens or highlights, pressed darkens, focus gets the ring. To document and test, force a state with ${ic('data-state')}.`, `Todas las variantes reaccionan igual: hover aclara o resalta, presionado oscurece, foco gana el anillo. Para documentar y probar, fuerza un estado con ${ic('data-state')}.`)}</p>
        </div>
      </header>
      <div class="bt-states" inert>
        <div class="bt-states__grid">
          <span></span>
          ${states.map(([, label]) => `<span class="bt-states__head">${label}</span>`).join('')}
          ${variants.map(
            ([id, name]) => `<span class="bt-states__row">${name}</span>
              ${states.map(([state]) => `<span class="bt-states__cell">${button({ variant: id, state, label: save })}</span>`).join('')}`,
          ).join('')}
        </div>
      </div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">${L('Anatomia', 'Anatomy', 'Anatomía')}</h2>
          <p class="doc-section__desc">${L('Três partes. O ícone é opcional; o rótulo, nunca — exceto no botão de ícone.', 'Three parts. The icon is optional; the label never is — except in the icon button.', 'Tres partes. El ícono es opcional; la etiqueta, nunca — excepto en el botón de ícono.')}</p>
        </div>
      </header>
      <div class="bt-anatomy">
        <div class="bt-anatomy__stage" aria-hidden="true">
          <span class="bt-anatomy__figure">
            <span class="ds-btn ds-btn--primary ds-btn--lg bt-anatomy__btn" data-num="1">
              <span class="bt-anatomy__part" data-num="2">${icon('pencil', { size: 20 })}</span>
              <span class="bt-anatomy__part" data-num="3">${L('Criar componente', 'Create component', 'Crear componente')}</span>
            </span>
          </span>
        </div>
        <ol class="bt-anatomy__legend" role="list">
          <li><span class="bt-anatomy__num">1</span><div><p class="bt-anatomy__title">${L('Contêiner', 'Container', 'Contenedor')}</p><p class="bt-anatomy__text">${L(`Altura ${ic('size.control.*')}, raio ${ic('radius.md')}, padding lateral de 12 a 20 px. Borda de 1 px sempre presente (transparente quando não aparece), para os tamanhos não mudarem.`, `Height ${ic('size.control.*')}, radius ${ic('radius.md')}, side padding from 12 to 20 px. A 1 px border is always there (transparent when hidden), so sizes don’t shift.`, `Altura ${ic('size.control.*')}, radio ${ic('radius.md')}, padding lateral de 12 a 20 px. Borde de 1 px siempre presente (transparente cuando no se ve), para que los tamaños no cambien.`)}</p></div></li>
          <li><span class="bt-anatomy__num">2</span><div><p class="bt-anatomy__title">${L('Ícone', 'Icon', 'Ícono')} <span class="bt-anatomy__optional">${L('opcional', 'optional', 'opcional')}</span></p><p class="bt-anatomy__text">${L('16 a 20 px, a 8 px do rótulo, herdando a cor. À esquerda para ações; à direita só para “avançar”.', '16 to 20 px, 8 px from the label, inheriting its color. On the left for actions; on the right only for “next”.', 'De 16 a 20 px, a 8 px de la etiqueta, heredando el color. A la izquierda para acciones; a la derecha solo para “avanzar”.')}</p></div></li>
          <li><span class="bt-anatomy__num">3</span><div><p class="bt-anatomy__title">${L('Rótulo', 'Label', 'Etiqueta')}</p><p class="bt-anatomy__text">${L(`Estilo ${ic('text.label-*')}, numa linha só. Comece com verbo: “Salvar alterações”, não “OK”.`, `${ic('text.label-*')} style, on a single line. Start with a verb: “Save changes”, not “OK”.`, `Estilo ${ic('text.label-*')}, en una sola línea. Empieza con un verbo: “Guardar cambios”, no “OK”.`)}</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="icone" aria-labelledby="icone-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="icone-title">${L('Botão de ícone', 'Icon button', 'Botón de ícono')}</h2>
          <p class="doc-section__desc">${L('Para ações reconhecíveis sem texto — fechar, buscar, mais opções. Sem fundo por padrão; passe o mouse para ver a dica.', 'For actions recognizable without text — close, search, more options. No background by default; hover to see the hint.', 'Para acciones reconocibles sin texto — cerrar, buscar, más opciones. Sin fondo por defecto; pasa el cursor para ver la pista.')}</p>
        </div>
      </header>
      <div class="cd-grid bt-icon-grid">
        ${[
          ['', L('Padrão', 'Default', 'Predeterminado'), 'ds-icon-btn', 'x', L('Fechar', 'Close', 'Cerrar')],
          ['ds-icon-btn--muted', L('Apagado', 'Muted', 'Atenuado'), 'ds-icon-btn--muted', 'more-horizontal', L('Mais opções', 'More options', 'Más opciones')],
          ['ds-icon-btn--outline', L('Contorno', 'Outline', 'Contorno'), 'ds-icon-btn--outline', 'panel-left', L('Recolher menu', 'Collapse menu', 'Contraer menú')],
          ['ds-icon-btn--subtle', L('Sutil', 'Subtle', 'Sutil'), 'ds-icon-btn--subtle', 'plus', L('Adicionar', 'Add', 'Añadir')],
          ['ds-icon-btn--outline ds-icon-btn--round', L('Redondo', 'Round', 'Redondo'), 'ds-icon-btn--round', 'mic', L('Gravar áudio', 'Record audio', 'Grabar audio')],
        ]
          .map(
            ([mod, name, cls, glyph, label]) => `<article class="cd-example">
              <div class="cd-example__preview">
                ${['sm', '', 'lg']
                  .map((size) => `<button type="button" class="ds-icon-btn ${mod} ${size ? `ds-icon-btn--${size}` : ''}" aria-label="${label}" data-ds-tooltip="${label}" data-ds-tooltip-placement="bottom">${icon(glyph, { size: size === 'sm' ? 16 : 20 })}</button>`)
                  .join('')}
              </div>
              <div class="cd-example__body"><p class="cd-example__name">${name}<code>${cls}</code></p></div>
            </article>`,
          )
          .join('')}
      </div>
      <div class="bt-icon-code">${codeBlock(`<button type="button" class="ds-icon-btn" aria-label="${L('Fechar', 'Close', 'Cerrar')}" data-ds-tooltip="${L('Fechar', 'Close', 'Cerrar')}">\n  <ds-icon name="x"></ds-icon>\n</button>`)}</div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('O botão já vem acessível. Estas são as decisões que continuam sendo suas.', 'The button comes accessible. These are the decisions that are still yours.', 'El botón ya viene accesible. Estas son las decisiones que siguen siendo tuyas.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Elemento certo', 'The right element', 'El elemento correcto'), L(`Use ${ic('&lt;button&gt;')} para ações e ${ic('&lt;a class="ds-btn"&gt;')} para navegar. O elemento traz teclado e leitor de tela de graça.`, `Use ${ic('&lt;button&gt;')} for actions and ${ic('&lt;a class="ds-btn"&gt;')} to navigate. The element brings keyboard and screen reader support for free.`, `Usa ${ic('&lt;button&gt;')} para acciones y ${ic('&lt;a class="ds-btn"&gt;')} para navegar. El elemento trae teclado y lector de pantalla gratis.`)],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab leva o foco; Enter e Espaço acionam.', 'Tab moves focus; Enter and Space activate.', 'Tab lleva el foco; Enter y Espacio lo activan.'), ['Tab', 'Enter', L('Espaço', 'Space', 'Espacio')]],
        [L('Foco sempre visível', 'Focus always visible', 'Foco siempre visible'), L('Anel de 2 px na cor de foco, com 2 px de respiro — nos dois temas, em todas as variantes.', 'A 2 px ring in the focus color, with 2 px of offset — in both themes, in every variant.', 'Anillo de 2 px en el color de foco, con 2 px de respiro — en los dos temas, en todas las variantes.')],
        [L('Contraste verificado', 'Contrast checked', 'Contraste verificado'), L(`Texto do primário sobre a marca: ${pair('dark')} no escuro e ${pair('light')} no claro, acima do mínimo de ${ratio(4.5, 1)}.`, `Primary text on the brand: ${pair('dark')} in dark and ${pair('light')} in light, above the ${ratio(4.5, 1)} minimum.`, `Texto del primario sobre la marca: ${pair('dark')} en oscuro y ${pair('light')} en claro, por encima del mínimo de ${ratio(4.5, 1)}.`)],
        [L('Só ícone? Dê um nome', 'Icon only? Give it a name', '¿Solo ícono? Dale un nombre'), L(`Coloque ${ic('aria-label')} no botão e uma dica com o mesmo texto.`, `Put an ${ic('aria-label')} on the button and a hint with the same text.`, `Pon ${ic('aria-label')} en el botón y una pista con el mismo texto.`)],
        [L('Desativado com cuidado', 'Disable with care', 'Desactivado con cuidado'), L(`${ic('disabled')} tira o botão do foco. Se a pessoa precisa descobrir a ação, use ${ic('aria-disabled="true"')} e explique o motivo.`, `${ic('disabled')} removes the button from focus. If people need to discover the action, use ${ic('aria-disabled="true"')} and explain why.`, `${ic('disabled')} saca el botón del foco. Si la persona necesita descubrir la acción, usa ${ic('aria-disabled="true"')} y explica el motivo.`)],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Tudo o que o botão consome. Mudou o token, mudou o botão — em todas as telas.', 'Everything the button consumes. Change the token, change the button — on every screen.', 'Todo lo que consume el botón. Cambias el token, cambia el botón — en todas las pantallas.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['size.control.md', L('Altura (médio)', 'Height (medium)', 'Altura (mediano)')],
        ['space.200', L('Padding lateral (médio)', 'Side padding (medium)', 'Padding lateral (mediano)')],
        ['space.100', L('Espaço entre ícone e rótulo', 'Space between icon and label', 'Espacio entre ícono y etiqueta')],
        ['radius.md', L('Raio', 'Radius', 'Radio')],
        ['text.label-md', L('Rótulo', 'Label', 'Etiqueta')],
        ['color.brand.solid', L('Fundo do primário', 'Primary background', 'Fondo del primario')],
        ['color.brand.solid-hover', L('Hover do primário', 'Primary hover', 'Hover del primario')],
        ['color.brand.solid-pressed', L('Primário pressionado', 'Primary pressed', 'Primario presionado')],
        ['color.brand.on-solid', L('Rótulo do primário', 'Primary label', 'Etiqueta del primario')],
        ['color.border.control', L('Contorno do secundário', 'Secondary outline', 'Contorno del secundario')],
        ['color.bg.hover', L('Hover do secundário e ghost', 'Secondary and ghost hover', 'Hover del secundario y ghost')],
        ['color.bg.muted', L('Fundo do sutil', 'Subtle background', 'Fondo del sutil')],
        ['color.danger.solid', L('Fundo do perigo', 'Danger background', 'Fondo del peligro')],
        ['color.border.focus', L('Anel de foco', 'Focus ring', 'Anillo de foco')],
        ['duration.fast', L('Transição de cor', 'Color transition', 'Transición de color')],
        ['opacity.disabled', L('Desativado', 'Disabled', 'Desactivado')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Três regras que resolvem a maioria das telas.', 'Three rules that solve most screens.', 'Tres reglas que resuelven la mayoría de las pantallas.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: uma ação primária por tela', 'Do: one primary action per screen', 'Haz: una acción primaria por pantalla')}</p>
          <div class="bt-usage__preview" inert>${button({ variant: 'primary', label: L('Publicar', 'Publish', 'Publicar') })}${button({ variant: 'secondary', label: L('Cancelar', 'Cancel', 'Cancelar') })}</div>
          <p class="usage-card__text">${L('A cor guia o olho. Uma ação principal, as outras em contorno ou ghost.', 'Color guides the eye. One main action, the others in outline or ghost.', 'El color guía la mirada. Una acción principal, las demás en contorno o ghost.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: tudo primário', 'Avoid: everything primary', 'Evita: todo primario')}</p>
          <div class="bt-usage__preview" inert>${button({ variant: 'primary', label: save })}${button({ variant: 'primary', label: L('Duplicar', 'Duplicate', 'Duplicar') })}${button({ variant: 'primary', label: L('Exportar', 'Export', 'Exportar') })}</div>
          <p class="usage-card__text">${L('Se tudo chama atenção, nada chama. A pessoa não sabe por onde começar.', 'If everything calls for attention, nothing does. People don’t know where to start.', 'Si todo llama la atención, nada lo hace. La persona no sabe por dónde empezar.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Rótulo com verbo', 'A label with a verb', 'Etiqueta con verbo')}</p>
          <div class="bt-usage__preview" inert>${button({ variant: 'primary', label: L('Salvar alterações', 'Save changes', 'Guardar cambios') })}<span class="bt-usage__vs">${L('em vez de', 'instead of', 'en vez de')}</span>${button({ variant: 'secondary', label: 'OK' })}</div>
          <p class="usage-card__text">${L('O rótulo diz o que vai acontecer. Ninguém precisa ler o resto da tela para decidir.', 'The label says what will happen. Nobody has to read the rest of the screen to decide.', 'La etiqueta dice qué va a pasar. Nadie necesita leer el resto de la pantalla para decidir.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'botao',
    controls: [
      { id: 'variant', label: L('Variante', 'Variant', 'Variante'), value: 'primary', options: VARIANTS().map(([value, label]) => ({ value, label })) },
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: SIZES().map(([value, label]) => ({ value, label })) },
      { id: 'icon', label: L('Ícone', 'Icon', 'Ícono'), value: 'pencil-start', options: ICONS().map(([value, label]) => ({ value, label })) },
      { id: 'shape', label: L('Forma', 'Shape', 'Forma'), value: 'default', options: [{ value: 'default', label: L('Padrão', 'Default', 'Predeterminada') }, { value: 'pill', label: L('Pílula', 'Pill', 'Píldora') }, { value: 'block', label: L('Largura total', 'Full width', 'Ancho completo') }] },
      { id: 'state', label: L('Estado', 'State', 'Estado'), value: 'default', options: STATES().map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: L('Criar componente', 'Create component', 'Crear componente') },
    render: (state) => (state.shape === 'block' ? `<div class="bt-block">${button(state)}</div>` : button(state)),
    code: buttonCode,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
