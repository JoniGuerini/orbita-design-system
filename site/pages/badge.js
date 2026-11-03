import { icon } from '../../ds/icons/icons.js';
import { tokens, contrast } from '../../ds/tokens.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L, ratio as fmtRatio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/badge.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const TONES = () => [
  ['neutral', L('Neutro', 'Neutral', 'Neutro'), L('Rascunho', 'Draft', 'Borrador'), L('Estado sem urgência: rascunho, arquivado, planejado.', 'A non-urgent state: draft, archived, planned.', 'Estado sin urgencia: borrador, archivado, planificado.')],
  ['brand', L('Marca', 'Brand', 'Marca'), L('Novo', 'New', 'Nuevo'), L('Raro. Algo recém-adicionado dentro de uma lista — nunca como chamada.', 'Rare. Something just added inside a list — never as a call to action.', 'Raro. Algo recién agregado dentro de una lista — nunca como llamado.')],
  ['success', L('Sucesso', 'Success', 'Éxito'), L('Pronto', 'Done', 'Listo'), L('Concluído, ativo, aprovado.', 'Completed, active, approved.', 'Completado, activo, aprobado.')],
  ['warning', L('Aviso', 'Warning', 'Aviso'), L('Em revisão', 'In review', 'En revisión'), L('Precisa de atenção, mas não bloqueia.', 'Needs attention, but doesn’t block.', 'Necesita atención, pero no bloquea.')],
  ['danger', L('Perigo', 'Danger', 'Peligro'), L('Falhou', 'Failed', 'Falló'), L('Erro ou bloqueio que pede ação.', 'An error or blocker that calls for action.', 'Error o bloqueo que pide acción.')],
  ['info', L('Informação', 'Info', 'Información'), 'Beta', L('Contexto neutro: beta, em análise.', 'Neutral context: beta, under review.', 'Contexto neutro: beta, en análisis.')],
];

const ready = () => L('Pronto', 'Done', 'Listo');
const inReview = () => L('Em revisão', 'In review', 'En revisión');

const byName = new Map(tokens.map((t) => [t.name, t]));

/* contraste: usa as verificações do build; o neutro é calculado aqui (fundo translúcido sobre o canvas) */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
}
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function ratio(fgName, bgName, mode) {
  const canvas = hexToRgb(byName.get('color.bg.canvas').modes[mode].value).rgb;
  const solid = (name) => {
    const c = hexToRgb(byName.get(name).modes[mode].value);
    return c.rgb.map((v, i) => Math.round(v * c.a + canvas[i] * (1 - c.a)));
  };
  const [hi, lo] = [lum(solid(fgName)), lum(solid(bgName))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function toneRatio(tone, mode) {
  if (tone === 'neutral') return ratio('color.fg.muted', 'color.bg.selected', mode);
  return contrast.find((c) => c.fg === `color.${tone}.fg` && c.bg === `color.${tone}.subtle` && c.mode === mode)?.ratio ?? ratio(`color.${tone}.fg`, `color.${tone}.subtle`, mode);
}

/* ───────── Montagem do badge ───────── */

function badge({ tone = 'neutral', size = 'md', dot = 'no', kind = 'label', label = ready() }) {
  const cls = ['ds-badge', tone !== 'neutral' && `ds-badge--${tone}`, size === 'sm' && 'ds-badge--sm', kind === 'count' && 'ds-badge--count'].filter(Boolean).join(' ');
  const text = kind === 'count' ? countLabel(label) : escapeHtml(label || 'Badge');
  return `<span class="${cls}">${dot === 'yes' && kind !== 'count' ? '<span class="ds-badge__dot"></span>' : ''}${text}</span>`;
}

function countLabel(value) {
  const n = Number.parseInt(String(value).replace(/\D/g, ''), 10);
  if (!Number.isFinite(n)) return '12';
  return n > 99 ? '99+' : String(n);
}

function badgeCode(state) {
  const cls = ['ds-badge', state.tone !== 'neutral' && `ds-badge--${state.tone}`, state.size === 'sm' && 'ds-badge--sm', state.kind === 'count' && 'ds-badge--count'].filter(Boolean).join(' ');
  const text = state.kind === 'count' ? countLabel(state.label) : state.label || 'Badge';
  if (state.dot === 'yes' && state.kind !== 'count') return `<span class="${cls}">\n  <span class="ds-badge__dot"></span>\n  ${text}\n</span>`;
  return `<span class="${cls}">${text}</span>`;
}

/* ───────── Página ───────── */

export default function renderBadge(page) {
  const tones = TONES();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Rótulo curto de status ou de contagem. Pequeno, discreto e sempre com significado — nunca enfeite.', 'A short status or count label. Small, quiet, and always meaningful — never decoration.', 'Etiqueta corta de estado o de conteo. Pequeña, discreta y siempre con significado — nunca adorno.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tons', 'tones', 'tonos')}</dt><dd class="doc-stat__value">${tones.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('altura (md / sm)', 'height (md / sm)', 'altura (md / sm)')}</dt><dd class="doc-stat__value">24/20</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('interativo', 'interactive', 'interactivo')}</dt><dd class="doc-stat__value">${L('não', 'no', 'no')}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['tons', L('Tons', 'Tones', 'Tonos')],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
        ['contagem', L('Contagem', 'Count', 'Conteo')],
        ['onde', L('Onde usar', 'Where to use', 'Dónde usar')],
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
          <p class="doc-section__desc">${L('Escolha o tom, o tamanho e o tipo. Na contagem, o rótulo vira número (acima de 99, “99+”).', 'Pick the tone, size, and type. In count mode, the label becomes a number (above 99, “99+”).', 'Elige el tono, el tamaño y el tipo. En el conteo, la etiqueta se vuelve número (por encima de 99, “99+”).')}</p>
        </div>
      </header>
      ${playgroundMarkup('badge')}
    </section>

    <section class="doc-section" id="tons" aria-labelledby="tons-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tons-title">${L('Tons', 'Tones', 'Tonos')}</h2>
          <p class="doc-section__desc">${L('O tom diz o tipo de status. Fundo suave, texto forte e contorno fino — legível nos três temas, sem gritar.', 'The tone says the type of status. A soft background, strong text, and a thin outline — legible in all three themes, without shouting.', 'El tono dice el tipo de estado. Fondo suave, texto fuerte y contorno fino — legible en los tres temas, sin gritar.')}</p>
        </div>
      </header>
      <div class="cd-grid bd-tones">
        ${tones.map(
          ([tone, name, sample, text]) => `<article class="cd-example">
            <div class="cd-example__preview" inert>
              ${badge({ tone, label: sample })}
              ${badge({ tone, label: sample, dot: 'yes' })}
              ${badge({ tone, label: sample, size: 'sm' })}
            </div>
            <div class="cd-example__body">
              <p class="cd-example__name">${name}<code>${tone === 'neutral' ? 'ds-badge' : `ds-badge--${tone}`}</code></p>
              <p class="cd-example__text">${text}</p>
              <p class="bd-ratio">${L(`Contraste ${fmtRatio(toneRatio(tone, 'dark'))} escuro · ${fmtRatio(toneRatio(tone, 'light'))} claro · ${fmtRatio(toneRatio(tone, 'refugio'))} Refúgio`, `Contrast ${fmtRatio(toneRatio(tone, 'dark'))} dark · ${fmtRatio(toneRatio(tone, 'light'))} light · ${fmtRatio(toneRatio(tone, 'refugio'))} Refúgio`, `Contraste ${fmtRatio(toneRatio(tone, 'dark'))} oscuro · ${fmtRatio(toneRatio(tone, 'light'))} claro · ${fmtRatio(toneRatio(tone, 'refugio'))} Refúgio`)}</p>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">${L('Tamanhos', 'Sizes', 'Tamaños')}</h2>
          <p class="doc-section__desc">${L('Médio ao lado de texto comum; pequeno em tabelas, listas densas e cabeçalhos de card.', 'Medium next to regular text; small in tables, dense lists, and card headers.', 'Mediano junto a texto común; pequeño en tablas, listas densas y encabezados de tarjeta.')}</p>
        </div>
      </header>
      <div class="bd-sizes">
        ${[
          ['md', L('Médio', 'Medium', 'Mediano'), '24 px', 'label-sm · 13 px', L('padrão', 'default', 'predeterminado')],
          ['sm', L('Pequeno', 'Small', 'Pequeño'), '20 px', 'caption · 12 px', 'ds-badge--sm'],
        ]
          .map(
            ([size, name, h, text, cls]) => `<article class="cd-example">
              <div class="cd-example__preview" inert>
                ${badge({ tone: 'success', size, label: ready(), dot: 'yes' })}
                ${badge({ tone: 'warning', size, label: inReview() })}
                ${badge({ size, kind: 'count', label: '12' })}
              </div>
              <div class="cd-example__body">
                <p class="cd-example__name">${name}<code>${cls}</code></p>
                <p class="cd-example__text">${L(`Altura ${h} · texto ${text}`, `Height ${h} · text ${text}`, `Altura ${h} · texto ${text}`)}</p>
              </div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="contagem" aria-labelledby="contagem-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="contagem-title">${L('Contagem', 'Count', 'Conteo')}</h2>
          <p class="doc-section__desc">${L(`${ic('ds-badge--count')} centraliza o número e mantém a largura mínima de um círculo. Zero não aparece; acima de 99, mostre “99+”.`, `${ic('ds-badge--count')} centers the number and keeps a circle’s minimum width. Zero doesn’t show; above 99, show “99+”.`, `${ic('ds-badge--count')} centra el número y mantiene el ancho mínimo de un círculo. El cero no aparece; por encima de 99, muestra “99+”.`)}</p>
        </div>
      </header>
      <div class="bd-count" inert>
        <ul class="bd-count__list" role="list">
          ${[
            ['inbox', L('Caixa de entrada', 'Inbox', 'Bandeja de entrada'), 12, 'brand'],
            ['message-square', L('Comentários', 'Comments', 'Comentarios'), 128, 'neutral'],
            ['check-circle', L('Aprovações', 'Approvals', 'Aprobaciones'), 3, 'neutral'],
            ['folder', L('Arquivados', 'Archived', 'Archivados'), 0, 'neutral'],
          ]
            .map(
              ([glyph, label, n, tone]) => `<li class="bd-count__item">
                ${icon(glyph, { size: 18 })}<span class="bd-count__label">${label}</span>
                ${n > 0 ? badge({ tone, kind: 'count', size: 'sm', label: String(n) }) : `<span class="bd-count__zero">${L('sem badge', 'no badge', 'sin badge')}</span>`}
              </li>`,
            )
            .join('')}
        </ul>
        <div class="bd-count__rules">
          <p class="bd-count__rule"><span>12</span>${L('número exato até 99', 'exact number up to 99', 'número exacto hasta 99')}</p>
          <p class="bd-count__rule"><span>99+</span>${L('acima de 99', 'above 99', 'por encima de 99')}</p>
          <p class="bd-count__rule"><span>—</span>${L('zero: sem badge', 'zero: no badge', 'cero: sin badge')}</p>
        </div>
      </div>
    </section>

    <section class="doc-section" id="onde" aria-labelledby="onde-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="onde-title">${L('Onde usar', 'Where to use', 'Dónde usar')}</h2>
          <p class="doc-section__desc">${L('Badge acompanha algo — uma linha, um título, um item. Ele nunca está sozinho na tela.', 'A badge goes with something — a row, a title, an item. It’s never alone on the screen.', 'El badge acompaña algo — una fila, un título, un elemento. Nunca está solo en la pantalla.')}</p>
        </div>
      </header>
      <div class="bd-contexts" inert>
        <article class="cd-example">
          <div class="cd-example__preview bd-ctx">
            <div class="bd-ctx__row"><span>${L('Botão', 'Button', 'Botón')}</span>${badge({ tone: 'success', size: 'sm', label: ready() })}</div>
            <div class="bd-ctx__row"><span>${L('Menu', 'Menu', 'Menú')}</span>${badge({ tone: 'warning', size: 'sm', label: inReview() })}</div>
            <div class="bd-ctx__row"><span>Modal</span>${badge({ size: 'sm', label: L('Planejado', 'Planned', 'Planificado') })}</div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Linha de lista ou tabela', 'A list or table row', 'Fila de lista o tabla')}</p><p class="cd-example__text">${L('O status de cada item, sempre na mesma coluna.', 'Each item’s status, always in the same column.', 'El estado de cada elemento, siempre en la misma columna.')}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview bd-ctx">
            <div class="bd-ctx__card">
              <p class="bd-ctx__title">${L('Integração com o Figma', 'Figma integration', 'Integración con Figma')} ${badge({ tone: 'info', size: 'sm', label: 'Beta' })}</p>
              <p class="bd-ctx__text">${L('Sincroniza tokens e componentes com a biblioteca.', 'Syncs tokens and components with the library.', 'Sincroniza tokens y componentes con la biblioteca.')}</p>
            </div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Ao lado de um título', 'Next to a title', 'Junto a un título')}</p><p class="cd-example__text">${L('Qualifica o que está escrito: beta, em teste.', 'Qualifies what’s written: beta, in testing.', 'Califica lo que está escrito: beta, en prueba.')}</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview bd-ctx">
            <div class="bd-ctx__row bd-ctx__row--nav">${icon('inbox', { size: 18 })}<span>${L('Revisões', 'Reviews', 'Revisiones')}</span>${badge({ kind: 'count', size: 'sm', label: '3' })}</div>
            <div class="bd-ctx__row bd-ctx__row--nav">${icon('bell', { size: 18 })}<span>${L('Menções', 'Mentions', 'Menciones')}</span>${badge({ tone: 'brand', kind: 'count', size: 'sm', label: '128' })}</div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Contagem num item', 'A count on an item', 'Conteo en un elemento')}</p><p class="cd-example__text">${L('Quanto há para ver, na ponta direita.', 'How much there is to see, on the far right.', 'Cuánto hay para ver, en el extremo derecho.')}</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('Badge é texto. Trate como texto.', 'A badge is text. Treat it like text.', 'El badge es texto. Trátalo como texto.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L('O status está escrito (“Em revisão”). O ponto e o tom só reforçam.', 'The status is written out (“In review”). The dot and the tone only reinforce it.', 'El estado está escrito (“En revisión”). El punto y el tono solo refuerzan.')],
        [L('Contraste verificado', 'Contrast checked', 'Contraste verificado'), L(`O texto de cada tom passa de ${fmtRatio(4.5, 1)} sobre o próprio fundo — sucesso: ${fmtRatio(toneRatio('success', 'dark'))} no escuro, ${fmtRatio(toneRatio('success', 'light'))} no claro.`, `Each tone’s text passes ${fmtRatio(4.5, 1)} on its own background — success: ${fmtRatio(toneRatio('success', 'dark'))} in dark, ${fmtRatio(toneRatio('success', 'light'))} in light.`, `El texto de cada tono supera ${fmtRatio(4.5, 1)} sobre su propio fondo — éxito: ${fmtRatio(toneRatio('success', 'dark'))} en oscuro, ${fmtRatio(toneRatio('success', 'light'))} en claro.`)],
        [L('Não é interativo', 'Not interactive', 'No es interactivo'), L('Badge não recebe clique nem foco. Se precisa filtrar ou abrir algo, use chip, link ou botão.', 'A badge takes no clicks or focus. If it needs to filter or open something, use a chip, link, or button.', 'El badge no recibe clic ni foco. Si necesita filtrar o abrir algo, usa chip, enlace o botón.')],
        [L('Contagem com contexto', 'A count with context', 'Conteo con contexto'), L('Um “12” solto não diz nada ao leitor de tela. Complete com texto oculto: “12 não lidas”.', 'A bare “12” tells the screen reader nothing. Complete it with hidden text: “12 unread”.', 'Un “12” suelto no dice nada al lector de pantalla. Complétalo con texto oculto: “12 sin leer”.')],
        [L('Mudou? Anuncie', 'Changed? Announce it', '¿Cambió? Anúncialo'), L(`Quando o status muda sem recarregar, coloque a mensagem numa região ${ic('aria-live="polite"')}.`, `When the status changes without a reload, put the message in an ${ic('aria-live="polite"')} region.`, `Cuando el estado cambia sin recargar, pon el mensaje en una región ${ic('aria-live="polite"')}.`)],
        [L('Curto de verdade', 'Truly short', 'Corto de verdad'), L('Uma ou duas palavras. Frase inteira vira texto comum, não badge.', 'One or two words. A whole sentence becomes regular text, not a badge.', 'Una o dos palabras. Una frase entera se vuelve texto común, no badge.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Cada tom usa o trio subtle / fg / border do seu status. Aqui, o neutro e o de sucesso como exemplo.', 'Each tone uses its status’s subtle / fg / border trio. Here, neutral and success as examples.', 'Cada tono usa el trío subtle / fg / border de su estado. Aquí, el neutro y el de éxito como ejemplo.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.selected', L('Fundo (neutro)', 'Background (neutral)', 'Fondo (neutro)')],
        ['color.fg.muted', L('Texto (neutro)', 'Text (neutral)', 'Texto (neutro)')],
        ['color.border.subtle', L('Contorno (neutro)', 'Outline (neutral)', 'Contorno (neutro)')],
        ['color.success.subtle', L('Fundo (sucesso)', 'Background (success)', 'Fondo (éxito)')],
        ['color.success.fg', L('Texto (sucesso)', 'Text (success)', 'Texto (éxito)')],
        ['color.success.border', L('Contorno (sucesso)', 'Outline (success)', 'Contorno (éxito)')],
        ['color.brand.subtle', L('Fundo (marca)', 'Background (brand)', 'Fondo (marca)')],
        ['color.brand.fg', L('Texto (marca)', 'Text (brand)', 'Texto (marca)')],
        ['text.label-sm', L('Texto (médio)', 'Text (medium)', 'Texto (mediano)')],
        ['text.caption', L('Texto (pequeno)', 'Text (small)', 'Texto (pequeño)')],
        ['radius.full', L('Forma de pílula', 'Pill shape', 'Forma de píldora')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Badge é informação. Se não informa nada, não é badge.', 'A badge is information. If it doesn’t inform, it isn’t a badge.', 'El badge es información. Si no informa nada, no es badge.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: status e contagens', 'Do: status and counts', 'Haz: estados y conteos')}</p>
          <div class="bd-usage__preview" inert>${badge({ tone: 'success', label: ready() })}${badge({ tone: 'warning', label: inReview() })}${badge({ kind: 'count', label: '12' })}</div>
          <p class="usage-card__text">${L('Diz o estado de algo ou quanto há dele, numa ou duas palavras.', 'Says the state of something or how much of it there is, in one or two words.', 'Dice el estado de algo o cuánto hay, en una o dos palabras.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: badge decorativo', 'Avoid: a decorative badge', 'Evita: badge decorativo')}</p>
          <div class="bd-usage__preview" inert><span class="ds-badge ds-badge--brand"><span class="ds-badge__dot"></span>${L('Versão 0.1 · veja as novidades', 'Version 0.1 · see what’s new', 'Versión 0.1 · ve las novedades')}</span></div>
          <p class="usage-card__text">${L('Badge não é chamada nem enfeite de herói. Novidade se escreve no texto ou vira um link de verdade.', 'A badge isn’t a call to action or hero decoration. News goes in the text or becomes a real link.', 'El badge no es un llamado ni adorno del héroe. La novedad se escribe en el texto o se vuelve un enlace de verdad.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Um por linha', 'One per row', 'Uno por fila')}</p>
          <p class="usage-card__text">${L('Mais de um badge no mesmo item compete pela atenção. Escolha o status que importa agora.', 'More than one badge on the same item competes for attention. Pick the status that matters now.', 'Más de un badge en el mismo elemento compite por la atención. Elige el estado que importa ahora.')}</p>
          <pre class="ds-code ds-code--sm"><code>&lt;span class="ds-badge ds-badge--success"&gt;
  ${ready()}
&lt;/span&gt;</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'badge',
    controls: [
      { id: 'tone', label: L('Tom', 'Tone', 'Tono'), value: 'success', options: TONES().map(([value, label]) => ({ value, label })) },
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: [{ value: 'md', label: L('Médio', 'Medium', 'Mediano') }, { value: 'sm', label: L('Pequeno', 'Small', 'Pequeño') }] },
      { id: 'dot', label: L('Ponto', 'Dot', 'Punto'), value: 'yes', options: [{ value: 'no', label: L('Sem', 'Without', 'Sin') }, { value: 'yes', label: L('Com', 'With', 'Con') }] },
      { id: 'kind', label: L('Tipo', 'Type', 'Tipo'), value: 'label', options: [{ value: 'label', label: L('Rótulo', 'Label', 'Etiqueta') }, { value: 'count', label: L('Contagem', 'Count', 'Conteo') }] },
    ],
    text: { id: 'label', label: L('Texto', 'Text', 'Texto'), value: ready() },
    render: (state) => badge(state),
    code: badgeCode,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
