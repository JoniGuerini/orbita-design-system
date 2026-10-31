import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/painel.css'];

/* ───────── Montagem do painel (playground, anatomia, variações) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const chev = `<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>`;

// textos no idioma atual: chame na renderização
const script = () => L('Roteiro', 'Script', 'Guion');
const launchScript = () => L('Roteiro de lançamento', 'Launch script', 'Guion de lanzamiento');
const directTone = () => L('Tom direto', 'Direct tone', 'Tono directo');
const examples = () => L('Exemplos', 'Examples', 'Ejemplos');
const chooseFormat = () => L('Escolher formato', 'Choose format', 'Elegir formato');
const opening = () => L('Abertura', 'Opening', 'Apertura');

const SECTIONS = () => [
  ['00', opening(), L('Comece pelo problema de quem vai ler: o que está travando hoje e por que isso importa agora.', 'Start with the reader’s problem: what’s stuck today and why it matters now.', 'Empieza por el problema de quien va a leer: qué está trabado hoy y por qué importa ahora.'), L('Na cena', 'In the scene', 'En la escena')],
  ['01', L('Proposta', 'Proposal', 'Propuesta'), L('Mostre o caminho em uma frase. Os detalhes entram depois, quando a pessoa já sabe aonde vai.', 'Show the path in one sentence. Details come later, once the person knows where they’re headed.', 'Muestra el camino en una frase. Los detalles llegan después, cuando la persona ya sabe adónde va.'), L('Referências', 'References', 'Referencias')],
];

function panel(s) {
  const mods = [s.title === 'hero' && 'ds-panel--hero', s.density === 'compact' && 'ds-panel--compact', s.surface === 'flat' && 'ds-panel--flat'].filter(Boolean).join(' ');
  const title = escapeHtml(s.label || launchScript());
  const sections = SECTIONS().slice(0, s.density === 'compact' ? 1 : 2);
  return `<article class="ds-panel ${mods}" aria-label="${title}">
    <header class="ds-panel__header">
      <div>
        <p class="ds-panel__eyebrow">${script()}</p>
        <h3 class="ds-panel__title">${title}</h3>
      </div>
      ${
        s.actions === 'on'
          ? `<div class="ds-panel__actions"><button type="button" class="ds-icon-btn" aria-label="${L('Duplicar', 'Duplicate', 'Duplicar')}">${icon('stack')}</button><button type="button" class="ds-icon-btn" aria-label="${L('Fechar', 'Close', 'Cerrar')}">${icon('x')}</button></div>`
          : ''
      }
      ${s.aside === 'on' ? `<div class="ds-panel__aside"><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm">${icon('star', { size: 18 })}${examples()}</button></div>` : ''}
    </header>
    ${
      s.toolbar === 'on'
        ? `<div class="ds-panel__toolbar">
          <button type="button" class="ds-chip"><span class="ds-chip__icon">${icon('pencil', { size: 16 })}</span>${directTone()}${chev}</button>
          <span class="ds-panel__spacer"></span>
          <button type="button" class="ds-chip">${L('Informal', 'Casual', 'Informal')}${chev}</button>
          <button type="button" class="ds-chip">3 min${chev}</button>
          <span class="ds-panel__meta">~3 min</span>
        </div>`
        : ''
    }
    <div class="ds-panel__body">
      ${sections
        .map(
          ([stamp, label, text, action]) => `<section class="ds-section">
            <p class="ds-section__head"><span class="ds-section__stamp">${stamp}</span><span>${label}</span></p>
            <p class="ds-section__text">${text}</p>
            <div class="ds-section__actions"><button type="button" class="ds-inline-action">${icon(stamp === '00' ? 'video' : 'file-text', { size: 16 })}${action}${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</button></div>
          </section>`,
        )
        .join('')}
    </div>
    ${s.footer === 'on' ? `<footer class="ds-panel__footer"><button type="button" class="ds-btn ds-btn--primary">${icon('video', { size: 18 })}${chooseFormat()}</button></footer>` : ''}
  </article>`;
}

function panelCode(s) {
  const mods = [s.title === 'hero' && 'ds-panel--hero', s.density === 'compact' && 'ds-panel--compact', s.surface === 'flat' && 'ds-panel--flat'].filter(Boolean);
  const title = s.label || launchScript();
  const id = L('roteiro-titulo', 'script-title', 'guion-titulo');
  const lines = [`<article class="${['ds-panel', ...mods].join(' ')}" aria-labelledby="${id}">`, '  <header class="ds-panel__header">', '    <div>', `      <p class="ds-panel__eyebrow">${script()}</p>`, `      <h2 class="ds-panel__title" id="${id}">${title}</h2>`, '    </div>'];
  if (s.actions === 'on') {
    lines.push('    <div class="ds-panel__actions">', `      <button class="ds-icon-btn" aria-label="${L('Fechar', 'Close', 'Cerrar')}"><ds-icon name="x"></ds-icon></button>`, '    </div>');
  }
  if (s.aside === 'on') {
    lines.push('    <div class="ds-panel__aside">', `      <button class="ds-btn ds-btn--ghost ds-btn--sm"><ds-icon name="star"></ds-icon>${examples()}</button>`, '    </div>');
  }
  lines.push('  </header>');
  if (s.toolbar === 'on') {
    lines.push('  <div class="ds-panel__toolbar">', `    <button class="ds-chip">${directTone()} …</button>`, '    <span class="ds-panel__spacer"></span>', '    <span class="ds-panel__meta">~3 min</span>', '  </div>');
  }
  lines.push(
    '  <div class="ds-panel__body">',
    '    <section class="ds-section">',
    `      <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>${opening()}</span></p>`,
    '      <p class="ds-section__text">…</p>',
    '    </section>',
    '  </div>',
  );
  if (s.footer === 'on') lines.push('  <footer class="ds-panel__footer">', `    <button class="ds-btn ds-btn--primary">${chooseFormat()}</button>`, '  </footer>');
  lines.push('</article>');
  return lines.join('\n');
}

const ON_OFF = (on, off) => [
  { value: 'on', label: on },
  { value: 'off', label: off },
];

const ANATOMY = () => [
  ['1', L('Rótulo', 'Label', 'Etiqueta'), L('O tipo do conteúdo, apagado: “Roteiro”, “Pedido”, “Revisão”.', 'The content type, faded: “Script”, “Order”, “Review”.', 'El tipo de contenido, atenuado: “Guion”, “Pedido”, “Revisión”.'), 'text.eyebrow · fg.subtle'],
  ['2', L('Título', 'Title', 'Título'), L('O assunto, com tracking justo. Um por painel.', 'The subject, with tight tracking. One per panel.', 'El tema, con tracking justo. Uno por panel.'), 'text.heading-lg'],
  ['3', L('Ações de ícone', 'Icon actions', 'Acciones de ícono'), L('Fechar, duplicar, expandir — sem fundo, sempre com nome.', 'Close, duplicate, expand — no background, always named.', 'Cerrar, duplicar, expandir — sin fondo, siempre con nombre.'), 'ds-icon-btn'],
  ['4', 'Aside', L('Uma ação secundária em ghost, como “Exemplos”.', 'A secondary ghost action, like “Examples”.', 'Una acción secundaria en ghost, como “Ejemplos”.'), 'ds-btn--ghost'],
  ['5', L('Barra de controles', 'Control bar', 'Barra de controles'), L('Chips que ajustam o conteúdo; a meta fica à direita.', 'Chips that adjust the content; the meta sits on the right.', 'Chips que ajustan el contenido; la meta queda a la derecha.'), 'ds-chip · ds-panel__meta'],
  ['6', L('Seção', 'Section', 'Sección'), L('Carimbo + rótulo, texto com respiro e ações inline.', 'Stamp + label, airy text, and inline actions.', 'Sello + etiqueta, texto con respiro y acciones en línea.'), 'ds-section'],
  ['7', L('Rodapé', 'Footer', 'Pie'), L('A ação principal do painel. Só uma.', 'The panel’s main action. Just one.', 'La acción principal del panel. Solo una.'), 'ds-btn--primary'],
];

/* ───────── Página ───────── */

export default function renderPainel(page) {
  const anatomy = ANATOMY();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('A superfície de uma tarefa do produto: rótulo, título, controles e conteúdo em seções com respiro. Tudo plano — o destaque vem da hierarquia, não de efeito.', 'The surface of a product task: label, title, controls, and content in airy sections. All flat — emphasis comes from hierarchy, not effects.', 'La superficie de una tarea del producto: etiqueta, título, controles y contenido en secciones con respiro. Todo plano — el destaque viene de la jerarquía, no de efectos.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('partes', 'parts', 'partes')}</dt><dd class="doc-stat__value">${anatomy.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('variações', 'variations', 'variaciones')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('raio', 'radius', 'radio')}</dt><dd class="doc-stat__value">28 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('ação primária', 'primary action', 'acción primaria')}</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['secoes', L('Seções', 'Sections', 'Secciones')],
        ['variacoes', L('Variações', 'Variations', 'Variaciones')],
        ['painel-card', L('Painel ou card', 'Panel or card', 'Panel o tarjeta')],
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
          <p class="doc-section__desc">${L('Ligue e desligue as partes. Só o cabeçalho e o conteúdo são obrigatórios.', 'Turn the parts on and off. Only the header and the content are required.', 'Activa y desactiva las partes. Solo el encabezado y el contenido son obligatorios.')}</p>
        </div>
      </header>
      ${playgroundMarkup('painel')}
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">${L('Anatomia', 'Anatomy', 'Anatomía')}</h2>
          <p class="doc-section__desc">${L('Sete partes, sempre na mesma ordem. Quem já viu um painel sabe ler qualquer outro.', 'Seven parts, always in the same order. Anyone who has seen one panel can read any other.', 'Siete partes, siempre en el mismo orden. Quien ya vio un panel sabe leer cualquier otro.')}</p>
        </div>
      </header>
      <div class="pn-anatomy">
        <div class="pn-anatomy__stage" aria-hidden="true" inert>
          <article class="ds-panel ds-panel--compact pn-anatomy__panel">
            <header class="ds-panel__header">
              <div>
                <p class="ds-panel__eyebrow"><span class="pn-mark" data-num="1">${script()}</span></p>
                <p class="ds-panel__title"><span class="pn-mark" data-num="2">${launchScript()}</span></p>
              </div>
              <div class="ds-panel__actions pn-mark" data-num="3"><span class="ds-icon-btn">${icon('stack')}</span><span class="ds-icon-btn">${icon('x')}</span></div>
              <div class="ds-panel__aside"><span class="ds-btn ds-btn--ghost ds-btn--sm pn-mark" data-num="4">${icon('star', { size: 18 })}${examples()}</span></div>
            </header>
            <div class="ds-panel__toolbar pn-mark" data-num="5">
              <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>${directTone()}${chev}</span>
              <span class="ds-panel__spacer"></span>
              <span class="ds-panel__meta">~3 min</span>
            </div>
            <div class="ds-panel__body">
              <section class="ds-section pn-mark" data-num="6">
                <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>${opening()}</span></p>
                <p class="ds-section__text">${L('Comece pelo problema de quem vai ler.', 'Start with the reader’s problem.', 'Empieza por el problema de quien va a leer.')}</p>
                <div class="ds-section__actions"><span class="ds-inline-action">${icon('video', { size: 16 })}${L('Na cena', 'In the scene', 'En la escena')}${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span></div>
              </section>
            </div>
            <footer class="ds-panel__footer"><span class="ds-btn ds-btn--primary pn-mark" data-num="7">${icon('video', { size: 18 })}${chooseFormat()}</span></footer>
          </article>
        </div>
        <ol class="pn-anatomy__legend" role="list">
          ${anatomy.map(
            ([n, title, text, ref]) => `<li>
              <span class="pn-anatomy__num">${n}</span>
              <div><p class="pn-anatomy__title">${title}</p><p class="pn-anatomy__text">${text}</p><code class="pn-anatomy__ref">${ref}</code></div>
            </li>`,
          ).join('')}
        </ol>
      </div>
    </section>

    <section class="doc-section" id="secoes" aria-labelledby="secoes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="secoes-title">${L('Seções', 'Sections', 'Secciones')}</h2>
          <p class="doc-section__desc">${L('O carimbo dá ordem ao conteúdo. Use números para etapas, tempos para roteiros e só o rótulo quando a ordem não importa.', 'The stamp gives the content order. Use numbers for steps, times for scripts, and just the label when order doesn’t matter.', 'El sello da orden al contenido. Usa números para etapas, tiempos para guiones y solo la etiqueta cuando el orden no importa.')}</p>
        </div>
      </header>
      <div class="cd-grid pn-sections">
        ${[
          [L('Numerada', 'Numbered', 'Numerada'), L('Etapas e listas de decisão.', 'Steps and decision lists.', 'Etapas y listas de decisión.'), [['01', L('Contexto', 'Context', 'Contexto')], ['02', L('Proposta', 'Proposal', 'Propuesta')]]],
          [L('Temporal', 'Timed', 'Temporal'), L('Roteiros, vídeos e cronogramas.', 'Scripts, videos, and schedules.', 'Guiones, videos y cronogramas.'), [['00s', L('Abra com a situação', 'Open with the situation', 'Abre con la situación')], ['14s', L('Apresente o produto', 'Introduce the product', 'Presenta el producto')]]],
          [L('Só rótulo', 'Label only', 'Solo etiqueta'), L('Blocos sem ordem: notas, detalhes.', 'Unordered blocks: notes, details.', 'Bloques sin orden: notas, detalles.'), [['', L('Observações', 'Notes', 'Observaciones')], ['', L('Anexos', 'Attachments', 'Adjuntos')]]],
        ]
          .map(
            ([name, text, rows]) => `<article class="cd-example">
              <div class="cd-example__preview pn-sections__preview">
                ${rows
                  .map(
                    ([stamp, label]) => `<div class="pn-sections__item">
                      <p class="ds-section__head">${stamp ? `<span class="ds-section__stamp">${stamp}</span>` : ''}<span>${label}</span></p>
                      <span class="pn-line"></span><span class="pn-line pn-line--short"></span>
                    </div>`,
                  )
                  .join('')}
              </div>
              <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="variacoes" aria-labelledby="variacoes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="variacoes-title">${L('Variações', 'Variations', 'Variaciones')}</h2>
          <p class="doc-section__desc">${L('Uma estrutura, três jeitos de encaixar na tela.', 'One structure, three ways to fit on the screen.', 'Una estructura, tres formas de encajar en la pantalla.')}</p>
        </div>
      </header>
      <div class="pn-variants">
        ${[
          [L('Padrão', 'Default', 'Predeterminado'), 'ds-panel', L('A tarefa principal da tela, com sombra e fundo elevado.', 'The screen’s main task, with a shadow and a raised background.', 'La tarea principal de la pantalla, con sombra y fondo elevado.'), { title: 'default', density: 'default' }],
          [L('Compacto', 'Compact', 'Compacto'), 'ds-panel--compact', L('Gavetas, painéis laterais e espaços menores.', 'Drawers, side panels, and smaller spaces.', 'Cajones, paneles laterales y espacios más pequeños.'), { title: 'default', density: 'compact' }],
          [L('Plano', 'Flat', 'Plano'), 'ds-panel--flat', L('Dentro de outra superfície — sem sombra própria.', 'Inside another surface — no shadow of its own.', 'Dentro de otra superficie — sin sombra propia.'), { title: 'default', density: 'compact', surface: 'flat' }],
        ]
          .map(
            ([name, cls, text, s]) => `<article class="pn-variant">
              <div class="pn-variant__stage${s.surface === 'flat' ? ' pn-variant__stage--raised' : ''}" inert aria-hidden="true">
                ${panel({ ...s, actions: 'on', aside: 'off', toolbar: 'off', footer: 'off', label: launchScript() })}
              </div>
              <p class="cd-example__name">${name}<code>${cls}</code></p>
              <p class="cd-example__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="painel-card" aria-labelledby="painel-card-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="painel-card-title">${L('Painel ou card?', 'Panel or card?', '¿Panel o tarjeta?')}</h2>
          <p class="doc-section__desc">${L('Os dois são superfícies, mas resolvem coisas diferentes.', 'Both are surfaces, but they solve different things.', 'Los dos son superficies, pero resuelven cosas distintas.')}</p>
        </div>
      </header>
      <div class="pn-compare">
        <article class="pn-compare__col">
          <div class="pn-compare__preview" inert aria-hidden="true">
            <div class="pn-mini-panel">
              <span class="pn-mini-panel__eyebrow"></span><span class="pn-mini-panel__title"></span>
              <span class="pn-mini-panel__chips"><i></i><i></i></span>
              <span class="pn-line"></span><span class="pn-line"></span><span class="pn-line pn-line--short"></span>
              <span class="pn-mini-panel__cta"></span>
            </div>
          </div>
          <h3 class="pn-compare__title">${L('Painel', 'Panel', 'Panel')}</h3>
          <ul class="pn-compare__list" role="list">
            <li>${icon('check', { size: 16 })}${L('Uma tarefa inteira: ler, ajustar e decidir.', 'A whole task: read, adjust, and decide.', 'Una tarea entera: leer, ajustar y decidir.')}</li>
            <li>${icon('check', { size: 16 })}${L('Tem controles, seções e uma ação principal.', 'Has controls, sections, and one main action.', 'Tiene controles, secciones y una acción principal.')}</li>
            <li>${icon('check', { size: 16 })}${L('Normalmente um por tela ou por gaveta.', 'Usually one per screen or per drawer.', 'Normalmente uno por pantalla o por cajón.')}</li>
          </ul>
        </article>
        <article class="pn-compare__col">
          <div class="pn-compare__preview" inert aria-hidden="true">
            <div class="pn-mini-cards">
              ${['', '', '', ''].map(() => '<div class="pn-mini-card"><span class="pn-mini-card__icon"></span><span class="pn-line"></span><span class="pn-line pn-line--short"></span></div>').join('')}
            </div>
          </div>
          <h3 class="pn-compare__title">${L('Card', 'Card', 'Tarjeta')}</h3>
          <ul class="pn-compare__list" role="list">
            <li>${icon('check', { size: 16 })}${L('Um item de uma coleção: um resumo para abrir.', 'One item from a collection: a summary to open.', 'Un elemento de una colección: un resumen para abrir.')}</li>
            <li>${icon('check', { size: 16 })}${L('Clicável por inteiro, sem controles próprios.', 'Clickable as a whole, with no controls of its own.', 'Clicable entera, sin controles propios.')}</li>
            <li>${icon('check', { size: 16 })}${L('Aparece em grade ou lista, vários por tela.', 'Appears in a grid or list, several per screen.', 'Aparece en cuadrícula o lista, varias por pantalla.')}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('A ordem visual do painel já é a ordem de leitura. Mantenha assim.', 'The panel’s visual order is already the reading order. Keep it that way.', 'El orden visual del panel ya es el orden de lectura. Mantenlo así.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Região com nome', 'A named region', 'Región con nombre'), L(`Use ${ic('&lt;article aria-labelledby&gt;')} apontando para o título.`, `Use ${ic('&lt;article aria-labelledby&gt;')} pointing to the title.`, `Usa ${ic('&lt;article aria-labelledby&gt;')} apuntando al título.`)],
        [L('Título no nível certo', 'Title at the right level', 'Título en el nivel correcto'), L('O título é um heading de verdade (h2 numa página, h1 num modal). O rótulo apagado é só texto.', 'The title is a real heading (h2 on a page, h1 in a modal). The faded label is just text.', 'El título es un heading de verdad (h2 en una página, h1 en un modal). La etiqueta atenuada es solo texto.')],
        [L('Ações de ícone com nome', 'Named icon actions', 'Acciones de ícono con nombre'), L(`Fechar, duplicar e expandir levam ${ic('aria-label')} e dica com o mesmo texto.`, `Close, duplicate, and expand get an ${ic('aria-label')} and a hint with the same text.`, `Cerrar, duplicar y expandir llevan ${ic('aria-label')} y una pista con el mismo texto.`)],
        [L('Ordem de leitura', 'Reading order', 'Orden de lectura'), L('Cabeçalho → controles → seções → ação. Não reordene com CSS.', 'Header → controls → sections → action. Don’t reorder with CSS.', 'Encabezado → controles → secciones → acción. No reordenes con CSS.')],
        [L('Controles pelo teclado', 'Keyboard controls', 'Controles por teclado'), L('Os chips abrem menus navegáveis por setas; Esc fecha e devolve o foco.', 'Chips open menus you can navigate with arrows; Esc closes and returns focus.', 'Los chips abren menús navegables con flechas; Esc cierra y devuelve el foco.'), ['↑', '↓', 'Esc']],
        [L('Carimbos são conteúdo', 'Stamps are content', 'Los sellos son contenido'), L('“00 · Abertura” é lido em ordem. Não use o carimbo como única pista de sequência em listas longas — numere o texto também.', '“00 · Opening” is read in order. Don’t use the stamp as the only sequence cue in long lists — number the text too.', '“00 · Apertura” se lee en orden. No uses el sello como única pista de secuencia en listas largas — numera el texto también.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('O painel não tem cor própria: tudo vem de superfície, texto e espaço.', 'The panel has no color of its own: everything comes from surface, text, and space.', 'El panel no tiene color propio: todo viene de superficie, texto y espacio.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', L('Fundo', 'Background', 'Fondo')],
        ['color.border.subtle', L('Contorno', 'Outline', 'Contorno')],
        ['radius.2xl', L('Raio', 'Radius', 'Radio')],
        ['shadow.lg', L('Sombra', 'Shadow', 'Sombra')],
        ['space.600', L('Padding lateral e inferior', 'Side and bottom padding', 'Padding lateral e inferior')],
        ['space.400', L('Entre cabeçalho, controles e conteúdo', 'Between header, controls, and content', 'Entre encabezado, controles y contenido')],
        ['space.500', L('Entre seções', 'Between sections', 'Entre secciones')],
        ['text.eyebrow', L('Rótulo', 'Label', 'Etiqueta')],
        ['text.heading-lg', L('Título', 'Title', 'Título')],
        ['text.display-sm', L('Título em destaque', 'Hero title', 'Título destacado')],
        ['text.caption', L('Carimbo', 'Stamp', 'Sello')],
        ['text.body-md', L('Texto das seções', 'Section text', 'Texto de las secciones')],
        ['color.fg.subtle', L('Rótulo, carimbo e meta', 'Label, stamp, and meta', 'Etiqueta, sello y meta')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('O painel é para telas do produto — não para páginas inteiras.', 'The panel is for product screens — not for whole pages.', 'El panel es para pantallas del producto — no para páginas enteras.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: uma tarefa por painel', 'Do: one task per panel', 'Haz: una tarea por panel')}</p>
          <p class="usage-card__text">${L('Um roteiro, um pedido, uma revisão. Se a tela tem duas tarefas, são dois painéis — ou um painel e uma gaveta.', 'A script, an order, a review. If the screen has two tasks, that’s two panels — or a panel and a drawer.', 'Un guion, un pedido, una revisión. Si la pantalla tiene dos tareas, son dos paneles — o un panel y un cajón.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: painel como página', 'Avoid: a panel as a page', 'Evita: panel como página')}</p>
          <p class="usage-card__text">${L('Início, landing e documentação têm layouts próprios. Enfiar tudo num painel vira um bloco de texto sem hierarquia de página.', 'Home, landing pages, and docs have their own layouts. Cramming everything into a panel turns it into a block of text with no page hierarchy.', 'El inicio, la landing y la documentación tienen layouts propios. Meter todo en un panel lo vuelve un bloque de texto sin jerarquía de página.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Uma ação no rodapé', 'One action in the footer', 'Una acción en el pie')}</p>
          <p class="usage-card__text">${L('O primário fecha a tarefa. Ações de apoio vão para o aside ou para as ações inline das seções.', 'The primary closes the task. Supporting actions go in the aside or in the sections’ inline actions.', 'El primario cierra la tarea. Las acciones de apoyo van al aside o a las acciones en línea de las secciones.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'painel',
    controls: [
      { id: 'actions', label: L('Ações', 'Actions', 'Acciones'), value: 'on', options: ON_OFF(L('Com ícones', 'With icons', 'Con íconos'), L('Sem ícones', 'Without icons', 'Sin íconos')) },
      { id: 'aside', label: 'Aside', value: 'on', options: ON_OFF(L('Com “Exemplos”', 'With “Examples”', 'Con “Ejemplos”'), L('Sem aside', 'No aside', 'Sin aside')) },
      { id: 'toolbar', label: L('Barra', 'Bar', 'Barra'), value: 'on', options: ON_OFF(L('Com chips', 'With chips', 'Con chips'), L('Sem barra', 'No bar', 'Sin barra')) },
      { id: 'footer', label: L('Rodapé', 'Footer', 'Pie'), value: 'on', options: ON_OFF(L('Com ação', 'With action', 'Con acción'), L('Sem rodapé', 'No footer', 'Sin pie')) },
      { id: 'title', label: L('Título', 'Title', 'Título'), value: 'default', options: [{ value: 'default', label: L('Padrão', 'Default', 'Predeterminado') }, { value: 'hero', label: L('Destaque', 'Hero', 'Destacado') }] },
      { id: 'density', label: L('Densidade', 'Density', 'Densidad'), value: 'default', options: [{ value: 'default', label: L('Padrão', 'Default', 'Predeterminada') }, { value: 'compact', label: L('Compacto', 'Compact', 'Compacta') }] },
    ],
    text: { id: 'label', label: L('Título', 'Title', 'Título'), value: launchScript() },
    render: (s) => `<div class="pn-stage" inert>${panel(s)}</div>`,
    code: panelCode,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
