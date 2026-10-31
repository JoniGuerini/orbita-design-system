import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/botao.css'];

/* ───────── Dados ───────── */

const VARIANTS = [
  ['primary', 'Primário', 'A ação principal da tela. Uma por vez.'],
  ['secondary', 'Secundário', 'Alternativa à principal: cancelar, voltar, ações de apoio.'],
  ['ghost', 'Ghost', 'Ações discretas em barras, cabeçalhos e listas.'],
  ['subtle', 'Sutil', 'Apoio com um pouco mais de presença que o ghost.'],
  ['danger', 'Perigo', 'Ações destrutivas e irreversíveis — sempre com confirmação.'],
];

const SIZES = [
  ['sm', 'Pequeno', 32, 12, 'label-sm', 'radius.sm · 8 px'],
  ['md', 'Médio', 40, 16, 'label-md', 'radius.md · 12 px'],
  ['lg', 'Grande', 48, 20, 'label-lg', 'radius.md · 12 px'],
];

const STATES = [
  ['default', 'Normal'],
  ['hover', 'Hover'],
  ['pressed', 'Pressionado'],
  ['focus', 'Foco'],
  ['disabled', 'Desativado'],
];

const ICONS = [
  ['none', 'Sem ícone'],
  ['pencil-start', 'Lápis à esquerda'],
  ['plus-start', 'Mais à esquerda'],
  ['download-start', 'Download à esquerda'],
  ['arrow-right-end', 'Seta à direita'],
];

const pair = (id) => {
  const fg = contrast.filter((c) => c.fg === 'color.brand.on-solid' && c.bg === 'color.brand.solid');
  return Object.fromEntries(fg.map((c) => [c.mode, c.ratio.toFixed(2).replace('.', ',')]))[id];
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

function button(state) {
  const ic = parseIcon(state.icon);
  const glyph = ic ? icon(ic.name, { size: iconSize(state.size) }) : '';
  const label = escapeHtml(state.label || 'Botão');
  const forced = ['hover', 'pressed', 'focus'].includes(state.state) ? ` data-state="${state.state}"` : '';
  const disabled = state.state === 'disabled' ? ' disabled' : '';
  return `<button type="button" class="${classes(state)}"${forced}${disabled} tabindex="-1">${ic && !ic.end ? glyph : ''}${label}${ic?.end ? glyph : ''}</button>`;
}

function buttonCode(state) {
  const ic = parseIcon(state.icon);
  const glyph = ic ? `\n  <ds-icon name="${ic.name}"></ds-icon>` : '';
  const disabled = state.state === 'disabled' ? ' disabled' : '';
  const label = `\n  ${state.label || 'Botão'}`;
  return `<button type="button" class="${classes(state)}"${disabled}>${ic && !ic.end ? glyph : ''}${label}${ic?.end ? glyph : ''}\n</button>`;
}

/* ───────── Página ───────── */

export default function renderBotao(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Botão</h1>
        <p class="doc-header__lead">Dispara uma ação. Plano e direto: a cor fica para a ação principal, o resto se apoia em contorno e transparência.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">variantes</dt><dd class="doc-stat__value">${VARIANTS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">${SIZES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estados</dt><dd class="doc-stat__value">${STATES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">contraste do primário</dt><dd class="doc-stat__value">${pair('dark')}:1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['variantes', 'Variantes'],
        ['tamanhos', 'Tamanhos'],
        ['estados', 'Estados'],
        ['anatomia', 'Anatomia'],
        ['icone', 'Botão de ícone'],
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
          <p class="doc-section__desc">Monte o botão, veja nos dois temas e copie o código pronto.</p>
        </div>
      </header>
      ${playgroundMarkup('botao')}
    </section>

    <section class="doc-section" id="variantes" aria-labelledby="variantes-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="variantes-title">Variantes</h2>
          <p class="doc-section__desc">A variante diz o peso da ação. Quanto mais importante, mais cor — e só uma ação ganha a cor da marca.</p>
        </div>
      </header>
      <div class="cd-grid bt-variants">
        ${VARIANTS.map(
          ([id, name, text]) => `<article class="cd-example">
            <div class="cd-example__preview" inert>
              ${button({ variant: id, icon: id === 'danger' ? 'none' : 'pencil-start', label: id === 'danger' ? 'Excluir' : 'Criar' })}
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
          <h2 class="doc-section__title" id="tamanhos-title">Tamanhos</h2>
          <p class="doc-section__desc">Médio é o padrão. Pequeno para barras densas e tabelas; grande para chamadas e telas de toque.</p>
        </div>
      </header>
      <div class="bt-sizes">
        ${SIZES.map(
          ([id, name, h, px, text, radius]) => `<article class="bt-size">
            <div class="bt-size__preview" inert>
              <span class="bt-size__guide" style="height:${h}px" aria-hidden="true"><span>${h}</span></span>
              ${button({ variant: 'primary', size: id, icon: 'pencil-start', label: 'Criar' })}
            </div>
            <dl class="bt-size__specs">
              <div><dt>Tamanho</dt><dd>${name}${id === 'md' ? ' <span class="bt-size__default">padrão</span>' : ''}</dd></div>
              <div><dt>Altura</dt><dd>size.control.${id} · ${h} px</dd></div>
              <div><dt>Padding</dt><dd>${px} px</dd></div>
              <div><dt>Texto</dt><dd>text.${text}</dd></div>
              <div><dt>Raio</dt><dd>${radius}</dd></div>
              <div><dt>Classe</dt><dd><code class="ds-inline-code">${id === 'md' ? '—' : `ds-btn--${id}`}</code></dd></div>
            </dl>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="estados-title">Estados</h2>
          <p class="doc-section__desc">Todas as variantes reagem do mesmo jeito: hover clareia ou realça, pressionado escurece, foco ganha o anel. Para documentar e testar, force um estado com <code class="ds-inline-code">data-state</code>.</p>
        </div>
      </header>
      <div class="bt-states" inert>
        <div class="bt-states__grid">
          <span></span>
          ${STATES.map(([, label]) => `<span class="bt-states__head">${label}</span>`).join('')}
          ${VARIANTS.map(
            ([id, name]) => `<span class="bt-states__row">${name}</span>
              ${STATES.map(([state]) => `<span class="bt-states__cell">${button({ variant: id, state, label: 'Salvar' })}</span>`).join('')}`,
          ).join('')}
        </div>
      </div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">Anatomia</h2>
          <p class="doc-section__desc">Três partes. O ícone é opcional; o rótulo, nunca — exceto no botão de ícone.</p>
        </div>
      </header>
      <div class="bt-anatomy">
        <div class="bt-anatomy__stage" aria-hidden="true">
          <span class="bt-anatomy__figure">
            <span class="ds-btn ds-btn--primary ds-btn--lg bt-anatomy__btn" data-num="1">
              <span class="bt-anatomy__part" data-num="2">${icon('pencil', { size: 20 })}</span>
              <span class="bt-anatomy__part" data-num="3">Criar componente</span>
            </span>
          </span>
        </div>
        <ol class="bt-anatomy__legend" role="list">
          <li><span class="bt-anatomy__num">1</span><div><p class="bt-anatomy__title">Contêiner</p><p class="bt-anatomy__text">Altura <code class="ds-inline-code">size.control.*</code>, raio <code class="ds-inline-code">radius.md</code>, padding lateral de 12 a 20 px. Borda de 1 px sempre presente (transparente quando não aparece), para os tamanhos não mudarem.</p></div></li>
          <li><span class="bt-anatomy__num">2</span><div><p class="bt-anatomy__title">Ícone <span class="bt-anatomy__optional">opcional</span></p><p class="bt-anatomy__text">16 a 20 px, a 8 px do rótulo, herdando a cor. À esquerda para ações; à direita só para “avançar”.</p></div></li>
          <li><span class="bt-anatomy__num">3</span><div><p class="bt-anatomy__title">Rótulo</p><p class="bt-anatomy__text">Estilo <code class="ds-inline-code">text.label-*</code>, numa linha só. Comece com verbo: “Salvar alterações”, não “OK”.</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="icone" aria-labelledby="icone-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="icone-title">Botão de ícone</h2>
          <p class="doc-section__desc">Para ações reconhecíveis sem texto — fechar, buscar, mais opções. Sem fundo por padrão; passe o mouse para ver a dica.</p>
        </div>
      </header>
      <div class="cd-grid bt-icon-grid">
        ${[
          ['', 'Padrão', 'ds-icon-btn', 'x', 'Fechar'],
          ['ds-icon-btn--muted', 'Apagado', 'ds-icon-btn--muted', 'more-horizontal', 'Mais opções'],
          ['ds-icon-btn--outline', 'Contorno', 'ds-icon-btn--outline', 'panel-left', 'Recolher menu'],
          ['ds-icon-btn--subtle', 'Sutil', 'ds-icon-btn--subtle', 'plus', 'Adicionar'],
          ['ds-icon-btn--outline ds-icon-btn--round', 'Redondo', 'ds-icon-btn--round', 'mic', 'Gravar áudio'],
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
      <div class="bt-icon-code">${codeBlock('<button type="button" class="ds-icon-btn" aria-label="Fechar" data-ds-tooltip="Fechar">\n  <ds-icon name="x"></ds-icon>\n</button>')}</div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">O botão já vem acessível. Estas são as decisões que continuam sendo suas.</p>
        </div>
      </header>
      ${a11yList([
        ['Elemento certo', 'Use <code class="ds-inline-code">&lt;button&gt;</code> para ações e <code class="ds-inline-code">&lt;a class="ds-btn"&gt;</code> para navegar. O elemento traz teclado e leitor de tela de graça.'],
        ['Teclado', 'Tab leva o foco; Enter e Espaço acionam.', ['Tab', 'Enter', 'Espaço']],
        ['Foco sempre visível', 'Anel de 2 px na cor de foco, com 2 px de respiro — nos dois temas, em todas as variantes.'],
        ['Contraste verificado', `Texto do primário sobre a marca: ${pair('dark')}:1 no escuro e ${pair('light')}:1 no claro, acima do mínimo de 4,5:1.`],
        ['Só ícone? Dê um nome', 'Coloque <code class="ds-inline-code">aria-label</code> no botão e uma dica com o mesmo texto.'],
        ['Desativado com cuidado', '<code class="ds-inline-code">disabled</code> tira o botão do foco. Se a pessoa precisa descobrir a ação, use <code class="ds-inline-code">aria-disabled="true"</code> e explique o motivo.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Tudo o que o botão consome. Mudou o token, mudou o botão — em todas as telas.</p>
        </div>
      </header>
      ${tokenTable([
        ['size.control.md', 'Altura (médio)'],
        ['space.200', 'Padding lateral (médio)'],
        ['space.100', 'Espaço entre ícone e rótulo'],
        ['radius.md', 'Raio'],
        ['text.label-md', 'Rótulo'],
        ['color.brand.solid', 'Fundo do primário'],
        ['color.brand.solid-hover', 'Hover do primário'],
        ['color.brand.solid-pressed', 'Primário pressionado'],
        ['color.brand.on-solid', 'Rótulo do primário'],
        ['color.border.control', 'Contorno do secundário'],
        ['color.bg.hover', 'Hover do secundário e ghost'],
        ['color.bg.muted', 'Fundo do sutil'],
        ['color.danger.solid', 'Fundo do perigo'],
        ['color.border.focus', 'Anel de foco'],
        ['duration.fast', 'Transição de cor'],
        ['opacity.disabled', 'Desativado'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três regras que resolvem a maioria das telas.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: uma ação primária por tela</p>
          <div class="bt-usage__preview" inert>${button({ variant: 'primary', label: 'Publicar' })}${button({ variant: 'secondary', label: 'Cancelar' })}</div>
          <p class="usage-card__text">A cor guia o olho. Uma ação principal, as outras em contorno ou ghost.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: tudo primário</p>
          <div class="bt-usage__preview" inert>${button({ variant: 'primary', label: 'Salvar' })}${button({ variant: 'primary', label: 'Duplicar' })}${button({ variant: 'primary', label: 'Exportar' })}</div>
          <p class="usage-card__text">Se tudo chama atenção, nada chama. A pessoa não sabe por onde começar.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Rótulo com verbo</p>
          <div class="bt-usage__preview" inert>${button({ variant: 'primary', label: 'Salvar alterações' })}<span class="bt-usage__vs">em vez de</span>${button({ variant: 'secondary', label: 'OK' })}</div>
          <p class="usage-card__text">O rótulo diz o que vai acontecer. Ninguém precisa ler o resto da tela para decidir.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'botao',
    controls: [
      { id: 'variant', label: 'Variante', value: 'primary', options: VARIANTS.map(([value, label]) => ({ value, label })) },
      { id: 'size', label: 'Tamanho', value: 'md', options: SIZES.map(([value, label]) => ({ value, label })) },
      { id: 'icon', label: 'Ícone', value: 'pencil-start', options: ICONS.map(([value, label]) => ({ value, label })) },
      { id: 'shape', label: 'Forma', value: 'default', options: [{ value: 'default', label: 'Padrão' }, { value: 'pill', label: 'Pílula' }, { value: 'block', label: 'Largura total' }] },
      { id: 'state', label: 'Estado', value: 'default', options: STATES.map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'label', label: 'Rótulo', value: 'Criar componente' },
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
