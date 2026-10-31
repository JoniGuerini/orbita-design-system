import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/painel.css'];

/* ───────── Montagem do painel (playground, anatomia, variações) ───────── */

const chev = `<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span>`;

const SECTIONS = [
  ['00', 'Abertura', 'Comece pelo problema de quem vai ler: o que está travando hoje e por que isso importa agora.', 'Na cena'],
  ['01', 'Proposta', 'Mostre o caminho em uma frase. Os detalhes entram depois, quando a pessoa já sabe aonde vai.', 'Referências'],
];

function panel(s) {
  const mods = [s.title === 'hero' && 'ds-panel--hero', s.density === 'compact' && 'ds-panel--compact', s.surface === 'flat' && 'ds-panel--flat'].filter(Boolean).join(' ');
  const title = escapeHtml(s.label || 'Roteiro de lançamento');
  const sections = SECTIONS.slice(0, s.density === 'compact' ? 1 : 2);
  return `<article class="ds-panel ${mods}" aria-label="${title}">
    <header class="ds-panel__header">
      <div>
        <p class="ds-panel__eyebrow">Roteiro</p>
        <h3 class="ds-panel__title">${title}</h3>
      </div>
      ${
        s.actions === 'on'
          ? `<div class="ds-panel__actions"><button type="button" class="ds-icon-btn" aria-label="Duplicar">${icon('stack')}</button><button type="button" class="ds-icon-btn" aria-label="Fechar">${icon('x')}</button></div>`
          : ''
      }
      ${s.aside === 'on' ? `<div class="ds-panel__aside"><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm">${icon('star', { size: 18 })}Exemplos</button></div>` : ''}
    </header>
    ${
      s.toolbar === 'on'
        ? `<div class="ds-panel__toolbar">
          <button type="button" class="ds-chip"><span class="ds-chip__icon">${icon('pencil', { size: 16 })}</span>Tom direto${chev}</button>
          <span class="ds-panel__spacer"></span>
          <button type="button" class="ds-chip">Informal${chev}</button>
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
    ${s.footer === 'on' ? `<footer class="ds-panel__footer"><button type="button" class="ds-btn ds-btn--primary">${icon('video', { size: 18 })}Escolher formato</button></footer>` : ''}
  </article>`;
}

function panelCode(s) {
  const mods = [s.title === 'hero' && 'ds-panel--hero', s.density === 'compact' && 'ds-panel--compact', s.surface === 'flat' && 'ds-panel--flat'].filter(Boolean);
  const title = s.label || 'Roteiro de lançamento';
  const lines = [`<article class="${['ds-panel', ...mods].join(' ')}" aria-labelledby="roteiro-titulo">`, '  <header class="ds-panel__header">', '    <div>', '      <p class="ds-panel__eyebrow">Roteiro</p>', `      <h2 class="ds-panel__title" id="roteiro-titulo">${title}</h2>`, '    </div>'];
  if (s.actions === 'on') {
    lines.push('    <div class="ds-panel__actions">', '      <button class="ds-icon-btn" aria-label="Fechar"><ds-icon name="x"></ds-icon></button>', '    </div>');
  }
  if (s.aside === 'on') {
    lines.push('    <div class="ds-panel__aside">', '      <button class="ds-btn ds-btn--ghost ds-btn--sm"><ds-icon name="star"></ds-icon>Exemplos</button>', '    </div>');
  }
  lines.push('  </header>');
  if (s.toolbar === 'on') {
    lines.push('  <div class="ds-panel__toolbar">', '    <button class="ds-chip">Tom direto …</button>', '    <span class="ds-panel__spacer"></span>', '    <span class="ds-panel__meta">~3 min</span>', '  </div>');
  }
  lines.push(
    '  <div class="ds-panel__body">',
    '    <section class="ds-section">',
    '      <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>Abertura</span></p>',
    '      <p class="ds-section__text">…</p>',
    '    </section>',
    '  </div>',
  );
  if (s.footer === 'on') lines.push('  <footer class="ds-panel__footer">', '    <button class="ds-btn ds-btn--primary">Escolher formato</button>', '  </footer>');
  lines.push('</article>');
  return lines.join('\n');
}

const ON_OFF = (on, off) => [
  { value: 'on', label: on },
  { value: 'off', label: off },
];

const ANATOMY = [
  ['1', 'Rótulo', 'O tipo do conteúdo, apagado: “Roteiro”, “Pedido”, “Revisão”.', 'text.eyebrow · fg.subtle'],
  ['2', 'Título', 'O assunto, com tracking justo. Um por painel.', 'text.heading-lg'],
  ['3', 'Ações de ícone', 'Fechar, duplicar, expandir — sem fundo, sempre com nome.', 'ds-icon-btn'],
  ['4', 'Aside', 'Uma ação secundária em ghost, como “Exemplos”.', 'ds-btn--ghost'],
  ['5', 'Barra de controles', 'Chips que ajustam o conteúdo; a meta fica à direita.', 'ds-chip · ds-panel__meta'],
  ['6', 'Seção', 'Carimbo + rótulo, texto com respiro e ações inline.', 'ds-section'],
  ['7', 'Rodapé', 'A ação principal do painel. Só uma.', 'ds-btn--primary'],
];

/* ───────── Página ───────── */

export default function renderPainel(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Painel</h1>
        <p class="doc-header__lead">A superfície de uma tarefa do produto: rótulo, título, controles e conteúdo em seções com respiro. Tudo plano — o destaque vem da hierarquia, não de efeito.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">partes</dt><dd class="doc-stat__value">${ANATOMY.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">variações</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">raio</dt><dd class="doc-stat__value">28 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">ação primária</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['anatomia', 'Anatomia'],
        ['secoes', 'Seções'],
        ['variacoes', 'Variações'],
        ['painel-card', 'Painel ou card'],
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
          <p class="doc-section__desc">Ligue e desligue as partes. Só o cabeçalho e o conteúdo são obrigatórios.</p>
        </div>
      </header>
      ${playgroundMarkup('painel')}
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">Anatomia</h2>
          <p class="doc-section__desc">Sete partes, sempre na mesma ordem. Quem já viu um painel sabe ler qualquer outro.</p>
        </div>
      </header>
      <div class="pn-anatomy">
        <div class="pn-anatomy__stage" aria-hidden="true" inert>
          <article class="ds-panel ds-panel--compact pn-anatomy__panel">
            <header class="ds-panel__header">
              <div>
                <p class="ds-panel__eyebrow"><span class="pn-mark" data-num="1">Roteiro</span></p>
                <p class="ds-panel__title"><span class="pn-mark" data-num="2">Roteiro de lançamento</span></p>
              </div>
              <div class="ds-panel__actions pn-mark" data-num="3"><span class="ds-icon-btn">${icon('stack')}</span><span class="ds-icon-btn">${icon('x')}</span></div>
              <div class="ds-panel__aside"><span class="ds-btn ds-btn--ghost ds-btn--sm pn-mark" data-num="4">${icon('star', { size: 18 })}Exemplos</span></div>
            </header>
            <div class="ds-panel__toolbar pn-mark" data-num="5">
              <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>Tom direto${chev}</span>
              <span class="ds-panel__spacer"></span>
              <span class="ds-panel__meta">~3 min</span>
            </div>
            <div class="ds-panel__body">
              <section class="ds-section pn-mark" data-num="6">
                <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>Abertura</span></p>
                <p class="ds-section__text">Comece pelo problema de quem vai ler.</p>
                <div class="ds-section__actions"><span class="ds-inline-action">${icon('video', { size: 16 })}Na cena${icon('plus', { size: 14, className: 'ds-inline-action__plus' })}</span></div>
              </section>
            </div>
            <footer class="ds-panel__footer"><span class="ds-btn ds-btn--primary pn-mark" data-num="7">${icon('video', { size: 18 })}Escolher formato</span></footer>
          </article>
        </div>
        <ol class="pn-anatomy__legend" role="list">
          ${ANATOMY.map(
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
          <h2 class="doc-section__title" id="secoes-title">Seções</h2>
          <p class="doc-section__desc">O carimbo dá ordem ao conteúdo. Use números para etapas, tempos para roteiros e só o rótulo quando a ordem não importa.</p>
        </div>
      </header>
      <div class="cd-grid pn-sections">
        ${[
          ['Numerada', 'Etapas e listas de decisão.', [['01', 'Contexto'], ['02', 'Proposta']]],
          ['Temporal', 'Roteiros, vídeos e cronogramas.', [['00s', 'Abra com a situação'], ['14s', 'Apresente o produto']]],
          ['Só rótulo', 'Blocos sem ordem: notas, detalhes.', [['', 'Observações'], ['', 'Anexos']]],
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
          <h2 class="doc-section__title" id="variacoes-title">Variações</h2>
          <p class="doc-section__desc">Uma estrutura, três jeitos de encaixar na tela.</p>
        </div>
      </header>
      <div class="pn-variants">
        ${[
          ['Padrão', 'ds-panel', 'A tarefa principal da tela, com sombra e fundo elevado.', { title: 'default', density: 'default' }],
          ['Compacto', 'ds-panel--compact', 'Gavetas, painéis laterais e espaços menores.', { title: 'default', density: 'compact' }],
          ['Plano', 'ds-panel--flat', 'Dentro de outra superfície — sem sombra própria.', { title: 'default', density: 'compact', surface: 'flat' }],
        ]
          .map(
            ([name, cls, text, s]) => `<article class="pn-variant">
              <div class="pn-variant__stage${s.surface === 'flat' ? ' pn-variant__stage--raised' : ''}" inert aria-hidden="true">
                ${panel({ ...s, actions: 'on', aside: 'off', toolbar: 'off', footer: 'off', label: 'Roteiro de lançamento' })}
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
          <h2 class="doc-section__title" id="painel-card-title">Painel ou card?</h2>
          <p class="doc-section__desc">Os dois são superfícies, mas resolvem coisas diferentes.</p>
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
          <h3 class="pn-compare__title">Painel</h3>
          <ul class="pn-compare__list" role="list">
            <li>${icon('check', { size: 16 })}Uma tarefa inteira: ler, ajustar e decidir.</li>
            <li>${icon('check', { size: 16 })}Tem controles, seções e uma ação principal.</li>
            <li>${icon('check', { size: 16 })}Normalmente um por tela ou por gaveta.</li>
          </ul>
        </article>
        <article class="pn-compare__col">
          <div class="pn-compare__preview" inert aria-hidden="true">
            <div class="pn-mini-cards">
              ${['', '', '', ''].map(() => '<div class="pn-mini-card"><span class="pn-mini-card__icon"></span><span class="pn-line"></span><span class="pn-line pn-line--short"></span></div>').join('')}
            </div>
          </div>
          <h3 class="pn-compare__title">Card</h3>
          <ul class="pn-compare__list" role="list">
            <li>${icon('check', { size: 16 })}Um item de uma coleção: um resumo para abrir.</li>
            <li>${icon('check', { size: 16 })}Clicável por inteiro, sem controles próprios.</li>
            <li>${icon('check', { size: 16 })}Aparece em grade ou lista, vários por tela.</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">A ordem visual do painel já é a ordem de leitura. Mantenha assim.</p>
        </div>
      </header>
      ${a11yList([
        ['Região com nome', 'Use <code class="ds-inline-code">&lt;article aria-labelledby&gt;</code> apontando para o título.'],
        ['Título no nível certo', 'O título é um heading de verdade (h2 numa página, h1 num modal). O rótulo apagado é só texto.'],
        ['Ações de ícone com nome', 'Fechar, duplicar e expandir levam <code class="ds-inline-code">aria-label</code> e dica com o mesmo texto.'],
        ['Ordem de leitura', 'Cabeçalho → controles → seções → ação. Não reordene com CSS.'],
        ['Controles pelo teclado', 'Os chips abrem menus navegáveis por setas; Esc fecha e devolve o foco.', ['↑', '↓', 'Esc']],
        ['Carimbos são conteúdo', '“00 · Abertura” é lido em ordem. Não use o carimbo como única pista de sequência em listas longas — numere o texto também.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">O painel não tem cor própria: tudo vem de superfície, texto e espaço.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', 'Fundo'],
        ['color.border.subtle', 'Contorno'],
        ['radius.2xl', 'Raio'],
        ['shadow.lg', 'Sombra'],
        ['space.600', 'Padding lateral e inferior'],
        ['space.400', 'Entre cabeçalho, controles e conteúdo'],
        ['space.500', 'Entre seções'],
        ['text.eyebrow', 'Rótulo'],
        ['text.heading-lg', 'Título'],
        ['text.display-sm', 'Título em destaque'],
        ['text.caption', 'Carimbo'],
        ['text.body-md', 'Texto das seções'],
        ['color.fg.subtle', 'Rótulo, carimbo e meta'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">O painel é para telas do produto — não para páginas inteiras.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: uma tarefa por painel</p>
          <p class="usage-card__text">Um roteiro, um pedido, uma revisão. Se a tela tem duas tarefas, são dois painéis — ou um painel e uma gaveta.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: painel como página</p>
          <p class="usage-card__text">Início, landing e documentação têm layouts próprios. Enfiar tudo num painel vira um bloco de texto sem hierarquia de página.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Uma ação no rodapé</p>
          <p class="usage-card__text">O primário fecha a tarefa. Ações de apoio vão para o aside ou para as ações inline das seções.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'painel',
    controls: [
      { id: 'actions', label: 'Ações', value: 'on', options: ON_OFF('Com ícones', 'Sem ícones') },
      { id: 'aside', label: 'Aside', value: 'on', options: ON_OFF('Com “Exemplos”', 'Sem aside') },
      { id: 'toolbar', label: 'Barra', value: 'on', options: ON_OFF('Com chips', 'Sem barra') },
      { id: 'footer', label: 'Rodapé', value: 'on', options: ON_OFF('Com ação', 'Sem rodapé') },
      { id: 'title', label: 'Título', value: 'default', options: [{ value: 'default', label: 'Padrão' }, { value: 'hero', label: 'Destaque' }] },
      { id: 'density', label: 'Densidade', value: 'default', options: [{ value: 'default', label: 'Padrão' }, { value: 'compact', label: 'Compacto' }] },
    ],
    text: { id: 'label', label: 'Título', value: 'Roteiro de lançamento' },
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
