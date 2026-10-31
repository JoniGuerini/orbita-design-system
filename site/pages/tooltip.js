import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/tooltip.css'];

/* ───────── Dados ───────── */

const PLACEMENTS = [
  ['top', 'Em cima'],
  ['right', 'À direita'],
  ['bottom', 'Embaixo'],
  ['left', 'À esquerda'],
];

const TRIGGERS = [
  ['icon', 'Botão de ícone'],
  ['button', 'Botão com rótulo'],
  ['text', 'Termo no texto'],
];

const KBDS = [
  ['none', 'Sem atalho'],
  ['⌘K', '⌘K'],
  ['⌘B', '⌘B'],
  ['Esc', 'Esc'],
];

/* ───────── Montagem ───────── */

const attrs = (text, placement, kbd) =>
  `data-ds-tooltip="${escapeHtml(text)}" data-ds-tooltip-placement="${placement}"${kbd && kbd !== 'none' ? ` data-ds-tooltip-kbd="${escapeHtml(kbd)}"` : ''}`;

function trigger(state) {
  const a = attrs(state.text || 'Dica', state.placement, state.kbd);
  if (state.trigger === 'button') return `<button type="button" class="ds-btn ds-btn--secondary" ${a}>${icon('download', { size: 18 })}Exportar</button>`;
  if (state.trigger === 'text') return `<span class="tt-term" tabindex="0" ${a}>OKLCH</span>`;
  return `<button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="${escapeHtml(state.text || 'Dica')}" ${a}>${icon('search')}</button>`;
}

/** Tooltip "fixo" (só para mostrar o visual; o de verdade aparece no hover/foco). */
const pinned = (text, kbd) =>
  `<span class="ds-tooltip tt-pinned" data-open>${escapeHtml(text)}${kbd && kbd !== 'none' ? `<kbd class="ds-kbd">${escapeHtml(kbd)}</kbd>` : ''}</span>`;

function triggerCode(state) {
  const text = state.text || 'Dica';
  const kbd = state.kbd && state.kbd !== 'none' ? `\n  data-ds-tooltip-kbd="${state.kbd}"` : '';
  const place = state.placement !== 'top' ? `\n  data-ds-tooltip-placement="${state.placement}"` : '';
  if (state.trigger === 'button') return `<button type="button" class="ds-btn ds-btn--secondary"\n  data-ds-tooltip="${text}"${place}${kbd}>\n  <ds-icon name="download"></ds-icon>\n  Exportar\n</button>`;
  if (state.trigger === 'text') return `<span tabindex="0"\n  data-ds-tooltip="${text}"${place}${kbd}>\n  OKLCH\n</span>`;
  return `<button type="button" class="ds-icon-btn" aria-label="${text}"\n  data-ds-tooltip="${text}"${place}${kbd}>\n  <ds-icon name="search"></ds-icon>\n</button>`;
}

/* ───────── Página ───────── */

export default function renderTooltip(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Tooltip</h1>
        <p class="doc-header__lead">Uma dica curta que aparece no hover ou no foco. Nomeia ícones e mostra atalhos — nunca guarda informação que a pessoa precisa para seguir.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">posições</dt><dd class="doc-stat__value">${PLACEMENTS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">espera</dt><dd class="doc-stat__value">450 ms</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">largura máxima</dt><dd class="doc-stat__value">240 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">JavaScript</dt><dd class="doc-stat__value">0 linhas</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['posicoes', 'Posições'],
        ['atalhos', 'Com atalho'],
        ['comportamento', 'Comportamento'],
        ['quando-nao', 'Quando não usar'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="playground-title">Playground</h2>
          <p class="doc-section__desc">A dica fixa mostra o visual. Passe o mouse ou chegue com Tab no gatilho para ver a de verdade.</p>
        </div>
      </header>
      ${playgroundMarkup('tooltip')}
    </section>

    <section class="doc-section" id="posicoes" aria-labelledby="posicoes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="posicoes-title">Posições</h2>
          <p class="doc-section__desc">Em cima é o padrão. Escolha outra quando a dica cobriria algo importante ou quando o gatilho está numa borda — perto do limite da tela, ela se ajusta sozinha.</p>
        </div>
      </header>
      <div class="tt-compass">
        ${PLACEMENTS.map(
          ([id, label]) => `<div class="tt-compass__cell tt-compass__cell--${id}">
            <button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="Dica ${label.toLowerCase()}" ${attrs(label, id)}>${icon({ top: 'arrow-up', right: 'arrow-right', bottom: 'chevron-down', left: 'arrow-left' }[id])}</button>
            <code class="ds-inline-code">${id}</code>
          </div>`,
        ).join('')}
        <p class="tt-compass__center">Passe o mouse</p>
      </div>
    </section>

    <section class="doc-section" id="atalhos" aria-labelledby="atalhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="atalhos-title">Com atalho</h2>
          <p class="doc-section__desc">O melhor lugar para ensinar um atalho é a dica da ação. Use <code class="ds-inline-code">data-ds-tooltip-kbd</code>.</p>
        </div>
      </header>
      <div class="cd-grid">
        ${[
          ['search', 'Buscar', '⌘K'],
          ['panel-left', 'Recolher menu', '⌘B'],
          ['x', 'Fechar', 'Esc'],
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
          <h2 class="doc-section__title" id="comportamento-title">Comportamento</h2>
          <p class="doc-section__desc">Uma espera curta evita dicas piscando quando o ponteiro só passa. Depois da primeira, as próximas aparecem na hora.</p>
        </div>
      </header>
      <div class="tt-timeline" aria-hidden="true">
        <div class="tt-timeline__track">
          <span class="tt-timeline__phase tt-timeline__phase--wait" style="flex:450">espera · 450 ms</span>
          <span class="tt-timeline__phase tt-timeline__phase--show" style="flex:600">visível enquanto o ponteiro está no gatilho</span>
          <span class="tt-timeline__phase tt-timeline__phase--warm" style="flex:400">aquecido · 400 ms</span>
        </div>
        <div class="tt-timeline__marks"><span>ponteiro entra</span><span>dica aparece</span><span>ponteiro sai</span><span>esfria</span></div>
      </div>
      <div class="tt-try">
        <p class="tt-try__label">Experimente: pare no primeiro e deslize para os outros.</p>
        <div class="tt-try__row">
          ${[
            ['home', 'Início'],
            ['search', 'Buscar'],
            ['bell', 'Notificações'],
            ['calendar', 'Calendário'],
            ['settings', 'Configurações'],
            ['user-circle', 'Sua conta'],
          ]
            .map(([glyph, label]) => `<button type="button" class="ds-icon-btn" aria-label="${label}" ${attrs(label, 'bottom')}>${icon(glyph)}</button>`)
            .join('')}
        </div>
      </div>
      <ul class="tt-rules" role="list">
        <li>${icon('check', { size: 16 })}<span>No foco por teclado aparece na hora, sem espera.</span></li>
        <li>${icon('check', { size: 16 })}<span>Some ao sair, clicar, rolar a página ou apertar Esc.</span></li>
        <li>${icon('check', { size: 16 })}<span>No toque não aparece — por isso nada essencial pode depender dela.</span></li>
        <li>${icon('check', { size: 16 })}<span>Um tooltip por vez: há um só elemento na página, reposicionado a cada gatilho.</span></li>
      </ul>
    </section>

    <section class="doc-section" id="quando-nao" aria-labelledby="quando-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="quando-title">Quando não usar</h2>
          <p class="doc-section__desc">Se a pessoa precisa da informação para continuar, ela não pode ficar escondida.</p>
        </div>
      </header>
      <div class="tt-avoid">
        ${[
          ['Informação essencial', 'Regras de senha, prazos, preços: escreva na tela, perto do campo.'],
          ['Conteúdo interativo', 'Links ou botões dentro da dica não são alcançáveis. Use um menu ou um painel.'],
          ['Texto longo', 'Mais de uma linha curta vira leitura. Até ~240 px; passou disso, é texto da página.'],
          ['Elemento desativado', 'Botão desativado não recebe foco nem hover — a dica nunca aparece. Explique o motivo ao lado.'],
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
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">A dica complementa — o nome acessível vem sempre do próprio elemento.</p>
        </div>
      </header>
      ${a11yList([
        ['Nome no elemento', 'Botão de ícone leva <code class="ds-inline-code">aria-label</code> com o mesmo texto da dica. O tooltip em si é <code class="ds-inline-code">aria-hidden</code>, para não ser lido duas vezes.'],
        ['Teclado', 'Aparece no foco visível e some com Esc, sem mover o foco.', ['Tab', 'Esc']],
        ['Persistente', 'Fica visível enquanto o ponteiro está no gatilho ou ele tem foco.'],
        ['Termos no texto', 'Um termo com dica precisa de <code class="ds-inline-code">tabindex="0"</code> para ser alcançável pelo teclado.'],
        ['Contraste', 'Texto padrão sobre a superfície elevada: acima de 4,5:1 nos dois temas.'],
        ['Desligar por região', 'Use <code class="ds-inline-code">data-ds-tooltips="off"</code> num ancestral quando o rótulo já está visível — como na sidebar expandida.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Uma superfície pequena, elevada e acima de tudo.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', 'Fundo'],
        ['color.border.default', 'Borda'],
        ['color.fg.default', 'Texto'],
        ['shadow.lg', 'Sombra'],
        ['radius.sm', 'Raio'],
        ['text.label-sm', 'Texto'],
        ['duration.fast', 'Entrada e saída'],
        ['z.tooltip', 'Camada (a mais alta)'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Curta, útil e só quando o elemento não fala por si.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: nomeie ícones</p>
          <div class="tt-usage" inert>${pinned('Notificações')}<span class="ds-icon-btn ds-icon-btn--outline">${icon('bell')}</span></div>
          <p class="usage-card__text">Duas ou três palavras dizendo o que o botão faz.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: repetir o rótulo</p>
          <div class="tt-usage" inert>${pinned('Exportar')}<span class="ds-btn ds-btn--secondary ds-btn--sm">Exportar</span></div>
          <p class="usage-card__text">Se o texto já está visível, a dica só atrapalha.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Mostre o atalho</p>
          <div class="tt-usage" inert>${pinned('Exportar', '⌘E')}<span class="ds-btn ds-btn--secondary ds-btn--sm">Exportar</span></div>
          <p class="usage-card__text">Num botão com rótulo, a dica vale a pena quando ensina algo novo — como o atalho.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'tooltip',
    controls: [
      { id: 'placement', label: 'Posição', value: 'top', options: PLACEMENTS.map(([value, label]) => ({ value, label })) },
      { id: 'trigger', label: 'Gatilho', value: 'icon', options: TRIGGERS.map(([value, label]) => ({ value, label })) },
      { id: 'kbd', label: 'Atalho', value: '⌘K', options: KBDS.map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'text', label: 'Texto', value: 'Buscar' },
    render: (state) => `<div class="tt-pg tt-pg--${state.placement}">
        <span class="tt-pg__trigger">${trigger(state)}</span>
        ${pinned(state.text || 'Dica', state.kbd)}
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
