import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/acao-inline.css'];

/* ───────── Montagem ───────── */

const ICONS = [
  ['none', 'Sem ícone'],
  ['video', 'Vídeo'],
  ['file-text', 'Documento'],
  ['clock', 'Relógio'],
  ['link', 'Link'],
];

function inlineAction(s) {
  const cls = ['ds-inline-action', s.emphasis === 'strong' && 'ds-inline-action--strong'].filter(Boolean).join(' ');
  const forced = s.state === 'hover' ? ' data-state="hover"' : '';
  const disabled = s.state === 'disabled';
  const glyph = s.icon && s.icon !== 'none' ? icon(s.icon, { size: 16 }) : '';
  const sign =
    s.sign === 'plus' ? icon('plus', { size: 14, className: 'ds-inline-action__plus' }) : s.sign === 'arrow' ? icon('arrow-right', { size: 14, className: 'ds-inline-action__arrow' }) : '';
  const label = escapeHtml(s.label || 'Ação');
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
    `  ${s.label || 'Ação'}`,
    s.sign === 'plus' ? '  <ds-icon name="plus" size="14" class="ds-inline-action__plus"></ds-icon>' : null,
    s.sign === 'arrow' ? '  <ds-icon name="arrow-right" size="14" class="ds-inline-action__arrow"></ds-icon>' : null,
  ].filter(Boolean);
  const open = s.element === 'link' ? `<a class="${cls}" href="/historico"${disabled ? ' aria-disabled="true"' : ''}>` : `<button type="button" class="${cls}"${disabled ? ' disabled' : ''}>`;
  return [open, ...inner, s.element === 'link' ? '</a>' : '</button>'].join('\n');
}

const FORMS = [
  ['Ação no lugar', 'Faz algo sem sair do contexto: adicionar, anexar, gerar.', { element: 'button', icon: 'file-text', sign: 'plus', label: 'Adicionar nota' }, 'button'],
  ['Navegação', 'Leva a outra tela. A seta diz “ir para”.', { element: 'link', icon: 'none', sign: 'arrow', label: 'Ver histórico' }, 'a'],
  ['Com ícone', 'O ícone antecipa o tipo de conteúdo.', { element: 'button', icon: 'video', sign: 'plus', label: 'Na cena' }, 'button'],
  ['Forte', 'Um pouco mais de presença, para o próximo passo de um texto.', { element: 'link', icon: 'none', sign: 'arrow', emphasis: 'strong', label: 'Ver o que mudou' }, 'a'],
  ['Desativada', 'Ainda não disponível. Diga por quê por perto.', { element: 'button', icon: 'clock', sign: 'none', state: 'disabled', label: 'Em breve' }, 'button'],
];

/* ───────── Página ───────── */

export default function renderAcaoInline(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Ação inline</h1>
        <p class="doc-header__lead">A ação mais discreta do sistema. Vive dentro do conteúdo — “Na cena +”, “Ver histórico →” — e só se destaca quando o ponteiro chega.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">formas</dt><dd class="doc-stat__value">${FORMS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">altura mínima</dt><dd class="doc-stat__value">28 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">texto</dt><dd class="doc-stat__value">13 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">elementos</dt><dd class="doc-stat__value">a · button</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['formas', 'Formas'],
        ['disclosure', 'Mostrar e esconder'],
        ['inline-ghost', 'Inline ou ghost'],
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
          <p class="doc-section__desc">Escolha o elemento, o ícone e o sinal. O palco mostra a ação dentro de uma seção, onde ela costuma morar.</p>
        </div>
      </header>
      ${playgroundMarkup('acao-inline')}
    </section>

    <section class="doc-section" id="formas" aria-labelledby="formas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="formas-title">Formas</h2>
          <p class="doc-section__desc">O sinal no fim conta o que acontece: <strong>+</strong> adiciona ou abre algo aqui; <strong>→</strong> leva para outro lugar.</p>
        </div>
      </header>
      <div class="cd-grid">
        ${FORMS.map(
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
          <h2 class="doc-section__title" id="disclosure-title">Mostrar e esconder</h2>
          <p class="doc-section__desc">Com <code class="ds-inline-code">&lt;details&gt;</code>, a ação inline abre conteúdo extra no lugar. O <strong>+</strong> gira e vira <strong>×</strong> quando está aberto. Experimente:</p>
        </div>
      </header>
      <div class="ia-disclosure">
        <div class="ia-disclosure__demo">
          <section class="ds-section">
            <p class="ds-section__head"><span class="ds-section__stamp">24s</span><span>Convide para conhecer</span></p>
            <p class="ds-section__text">Quer ver como ficaria a sua rotina? Conheça pelo link do perfil.</p>
            <div class="ds-section__actions">
              <details class="ds-disclosure ia-disclosure__details">
                <summary class="ds-inline-action">${icon('file-text', { size: 16 })}Mais detalhes${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</summary>
                <div class="ds-disclosure__content ia-disclosure__content">
                  <p><span>Formato</span>Vídeo vertical, 9:16</p>
                  <p><span>Público</span>Pequenos negócios</p>
                  <p><span>Chamada</span>Link no perfil</p>
                </div>
              </details>
            </div>
          </section>
        </div>
        ${codeBlock('<details class="ds-disclosure">\n  <summary class="ds-inline-action">\n    <ds-icon name="file-text" size="16"></ds-icon>\n    Mais detalhes\n    <ds-icon name="plus" size="14" class="ds-inline-action__plus"></ds-icon>\n  </summary>\n  <div class="ds-disclosure__content">…</div>\n</details>')}
      </div>
    </section>

    <section class="doc-section" id="inline-ghost" aria-labelledby="inline-ghost-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="inline-ghost-title">Inline ou ghost?</h2>
          <p class="doc-section__desc">Os dois são discretos. A diferença é onde estão.</p>
        </div>
      </header>
      <div class="ia-compare">
        <article class="ia-compare__col">
          <div class="ia-compare__preview" inert aria-hidden="true">
            <div class="ia-compare__text">
              <span class="ia-line"></span><span class="ia-line"></span><span class="ia-line ia-line--short"></span>
              <div class="ia-compare__actions">
                <span class="ds-inline-action">${icon('video', { size: 16 })}Na cena${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span>
                <span class="ds-inline-action">Ver exemplo${icon('arrow-right', { size: 14, className: 'ds-inline-action__arrow' })}</span>
              </div>
            </div>
          </div>
          <h3 class="ia-compare__title">Ação inline</h3>
          <ul class="ia-compare__list" role="list">
            <li>${icon('check', { size: 16 })}Dentro do conteúdo, logo depois do que ela afeta.</li>
            <li>${icon('check', { size: 16 })}Sem área visível: só texto, ícone e sinal.</li>
            <li>${icon('check', { size: 16 })}Várias por tela, uma por bloco.</li>
          </ul>
        </article>
        <article class="ia-compare__col">
          <div class="ia-compare__preview" inert aria-hidden="true">
            <div class="ia-compare__bar">
              <span class="ia-line ia-line--title"></span>
              <span class="ia-compare__spacer"></span>
              <span class="ds-btn ds-btn--ghost ds-btn--sm">${icon('star', { size: 16 })}Exemplos</span>
              <span class="ds-btn ds-btn--ghost ds-btn--sm">${icon('download', { size: 16 })}Exportar</span>
            </div>
          </div>
          <h3 class="ia-compare__title">Botão ghost</h3>
          <ul class="ia-compare__list" role="list">
            <li>${icon('check', { size: 16 })}Em barras, cabeçalhos e listas — fora do texto.</li>
            <li>${icon('check', { size: 16 })}Área de clique aparece no hover.</li>
            <li>${icon('check', { size: 16 })}Para ações que valem para a tela inteira.</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">Discreta para os olhos, clara para quem usa teclado e leitor de tela.</p>
        </div>
      </header>
      ${a11yList([
        ['Elemento certo', 'Navega? <code class="ds-inline-code">&lt;a href&gt;</code>. Faz algo aqui? <code class="ds-inline-code">&lt;button&gt;</code>. Abre e fecha? <code class="ds-inline-code">&lt;details&gt;&lt;summary&gt;</code>.'],
        ['Teclado', 'Tab foca; Enter aciona links e botões; Espaço também aciona botões e o summary.', ['Tab', 'Enter', 'Espaço']],
        ['Área de toque', 'Altura mínima de 28 px, acima dos 24 px do WCAG 2.2 (tamanho do alvo).'],
        ['Ícones e sinais são decorativos', 'O texto diz a ação. O <strong>+</strong> e a <strong>→</strong> saem com aria-hidden.'],
        ['Estado do disclosure', 'O summary nativo anuncia expandido e recolhido — não precisa de aria-expanded.'],
        ['Desativada com motivo', 'Prefira explicar ao lado (“Em breve”). Links desativados levam aria-disabled e saem do Tab.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Poucos e todos de texto: é isso que a mantém leve.</p>
        </div>
      </header>
      ${tokenTable([
        ['text.label-sm', 'Rótulo'],
        ['color.fg.subtle', 'Cor em repouso'],
        ['color.fg.default', 'Cor no hover e da forma forte'],
        ['color.fg.brand', 'Hover da forma forte'],
        ['space.100', 'Espaço entre ícone, rótulo e sinal'],
        ['radius.xs', 'Raio do anel de foco'],
        ['duration.fast', 'Transição de cor'],
        ['duration.base', 'Giro do + e passo da seta'],
        ['easing.emphasized', 'Curva do giro e da seta'],
        ['opacity.muted', 'Desativada'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três regras para ela continuar discreta.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: perto do que ela afeta</p>
          <div class="ia-usage__preview" inert>
            <p class="ia-usage__text">Abra com a situação do cliente.</p>
            ${inlineAction({ element: 'button', icon: 'video', sign: 'plus', label: 'Na cena' })}
          </div>
          <p class="usage-card__text">Logo abaixo do bloco, alinhada ao texto.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: a ação principal</p>
          <div class="ia-usage__preview" inert>${inlineAction({ element: 'button', icon: 'none', sign: 'none', label: 'Publicar roteiro' })}</div>
          <p class="usage-card__text">O que fecha a tarefa é um botão primário. Inline é para o caminho secundário.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Um sinal por ação</p>
          <div class="ia-usage__preview" inert>${inlineAction({ element: 'button', icon: 'none', sign: 'plus', label: 'Adicionar' })}${inlineAction({ element: 'link', icon: 'none', sign: 'arrow', label: 'Abrir' })}</div>
          <p class="usage-card__text"><strong>+</strong> adiciona ou abre aqui; <strong>→</strong> vai para outro lugar. Nunca os dois juntos.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'acao-inline',
    controls: [
      { id: 'element', label: 'Elemento', value: 'button', options: [{ value: 'button', label: 'Botão' }, { value: 'link', label: 'Link' }] },
      { id: 'icon', label: 'Ícone', value: 'video', options: ICONS.map(([value, label]) => ({ value, label })) },
      { id: 'sign', label: 'Sinal', value: 'plus', options: [{ value: 'plus', label: 'Mais (+)' }, { value: 'arrow', label: 'Seta (→)' }, { value: 'none', label: 'Nenhum' }] },
      { id: 'emphasis', label: 'Ênfase', value: 'default', options: [{ value: 'default', label: 'Discreta' }, { value: 'strong', label: 'Forte' }] },
      { id: 'state', label: 'Estado', value: 'default', options: [{ value: 'default', label: 'Normal' }, { value: 'hover', label: 'Hover' }, { value: 'disabled', label: 'Desativada' }] },
    ],
    text: { id: 'label', label: 'Rótulo', value: 'Na cena' },
    render: (s) => `<div class="ia-stage" inert>
      <section class="ds-section">
        <p class="ds-section__head"><span class="ds-section__stamp">00s</span><span>Abra com a situação</span></p>
        <p class="ds-section__text">Seu cliente marcou pelo WhatsApp e anotou no papel. Na hora de atender, precisa procurar nos dois lugares.</p>
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
