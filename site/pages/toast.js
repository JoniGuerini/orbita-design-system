import { icon } from '../../ds/icons/icons.js';
import { toast, toastContent, toastClasses, clearToasts, getToastPosition, setToastPosition } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/toast.css'];

/* ───────── Dados ───────── */

const TONES = [
  ['neutral', 'Neutro', 'Link copiado', 'O padrão: confirmações simples do que a pessoa acabou de fazer.'],
  ['success', 'Sucesso', 'Alterações salvas', 'Algo que demorou ou importava terminou bem.'],
  ['info', 'Informação', 'Nova versão disponível', 'Uma novidade que não pede ação imediata.'],
  ['warning', 'Aviso', 'Você está sem conexão', 'Atenção, sem bloquear. O app continua funcionando.'],
  ['danger', 'Perigo', 'Não foi possível enviar', 'Falhou, mas dá para tentar de novo. Erros graves ficam na tela.'],
];

const DURATIONS = [
  ['short', 'Curta · 2,2 s'],
  ['long', 'Longa · 5 s'],
  ['sticky', 'Até fechar'],
];

const durationMs = (id) => (id === 'long' ? 5000 : id === 'sticky' ? Infinity : undefined);

const POSITIONS = [
  ['top-start', 'Em cima, à esquerda'],
  ['top-center', 'Em cima, ao centro'],
  ['top-end', 'Em cima, à direita'],
  ['bottom-start', 'Embaixo, à esquerda'],
  ['bottom-center', 'Embaixo, ao centro'],
  ['bottom-end', 'Embaixo, à direita'],
];

const positionLabel = (id) => POSITIONS.find(([p]) => p === id)?.[1] ?? id;

const WHERE = [
  ['bottom-center', 'Confirmações em geral. Longe da navegação e das ações do topo. É o padrão.'],
  ['bottom-end', 'Telas com trabalho no centro — editores, tabelas largas: o canto não cobre o conteúdo.'],
  ['top-center', 'Avisos do sistema que valem para a tela toda, como conexão ou sessão.'],
  ['top-end', 'Notificações que chegam de fora (mensagens, convites). Fica abaixo da topbar, sem cobrir as ações dela.'],
  ['bottom-start', 'Evite no app shell: no desktop cobre o rodapé da sidebar.'],
  ['top-start', 'Raramente: fica sobre a navegação da sidebar.'],
];

/** Miniatura de tela com os seis pontos — cada um dispara um toast de verdade ali. */
function positionPicker(selected) {
  const appDefault = getToastPosition();
  return `<div class="ts-picker" role="group" aria-label="Posição do toast">
    <div class="ts-picker__screen" aria-hidden="true"><span class="ts-picker__sidebar"></span><span class="ts-picker__topbar"></span></div>
    ${POSITIONS.map(
      ([id, label]) => `<button type="button" class="ts-picker__dot ts-picker__dot--${id}" data-position="${id}" aria-pressed="${id === selected}"${id === appDefault ? ' data-default' : ''}
        aria-label="${label}${id === appDefault ? ' (padrão do app)' : ''}" data-ds-tooltip="${label}" data-ds-tooltip-placement="${id.startsWith('top') ? 'bottom' : 'top'}"><span class="ts-picker__mark"></span></button>`,
    ).join('')}
  </div>`;
}

/* ───────── Montagem ───────── */

function pinned({ message, tone = 'neutral', action, dismissible }) {
  return `<div class="${toastClasses({ tone })} ts-pinned" data-open inert>${toastContent(message, { tone, action, dismissible })}</div>`;
}

function stateOptions(state) {
  return {
    message: state.message || 'Aviso',
    tone: state.tone,
    action: state.action === 'undo' ? { label: 'Desfazer' } : undefined,
    dismissible: state.duration === 'sticky',
  };
}

function toastCode(state) {
  const opts = [];
  if (state.tone !== 'neutral') opts.push(`tone: '${state.tone}'`);
  if (state.position && state.position !== 'bottom-center') opts.push(`position: '${state.position}'`);
  if (state.action === 'undo') opts.push("action: { label: 'Desfazer', onClick: desfazer }");
  if (state.duration === 'long') opts.push('duration: 5000');
  if (state.duration === 'sticky') opts.push('duration: Infinity');
  const message = (state.message || 'Aviso').replace(/'/g, "\\'");
  const call = opts.length ? `toast('${message}', {\n  ${opts.join(',\n  ')},\n});` : `toast('${message}');`;
  const body = state.duration === 'sticky' ? `const aviso = ${call}\n// … depois: aviso.close();` : call;
  const appWide = state.position && state.position !== 'bottom-center' ? `\n\n// ou, para o app inteiro (salvo no navegador):\n// setToastPosition('${state.position}');` : '';
  return `import { toast } from './ds/js/toast.js';\n\n${body}${appWide}`;
}

/* ───────── Página ───────── */

export default function renderToast(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Toast</h1>
        <p class="doc-header__lead">Confirma que algo aconteceu, sem interromper. Aparece embaixo, some sozinho e pode trazer uma ação curta, como desfazer.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tons</dt><dd class="doc-stat__value">${TONES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">duração padrão</dt><dd class="doc-stat__value">2,2 s</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">na tela ao mesmo tempo</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">posições</dt><dd class="doc-stat__value">${POSITIONS.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['tons', 'Tons'],
        ['acao', 'Com ação'],
        ['comportamento', 'Comportamento'],
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
          <p class="doc-section__desc">A prévia mostra o visual. “Mostrar toast” — ou um dos seis pontos da miniatura — dispara o de verdade, na posição escolhida.</p>
        </div>
      </header>
      ${playgroundMarkup('toast')}
    </section>

    <section class="doc-section" id="tons" aria-labelledby="tons-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tons-title">Tons</h2>
          <p class="doc-section__desc">O fundo é sempre o invertido — o toast se destaca de qualquer tela. O tom aparece só no ícone, para a cor não gritar.</p>
        </div>
      </header>
      <div class="ts-tones">
        ${TONES.map(
          ([id, name, message, text]) => `<article class="cd-example">
            <div class="cd-example__preview">${pinned({ message, tone: id })}</div>
            <div class="cd-example__body">
              <p class="cd-example__name">${name}<code>${id === 'neutral' ? '—' : `tone: '${id}'`}</code></p>
              <p class="cd-example__text">${text}</p>
              <button type="button" class="ds-inline-action ts-tones__try" data-show-tone="${id}">${icon('play', { size: 16 })}Mostrar</button>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="acao" aria-labelledby="acao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="acao-title">Com ação</h2>
          <p class="doc-section__desc">Uma ação só, curta e reversível — “Desfazer”, “Ver”, “Tentar de novo”. Com ação, o toast fica 5 s.</p>
        </div>
      </header>
      <div class="ts-action">
        <div class="ts-action__demo">
          <ul class="ts-files" role="list" data-files>
            ${['Roteiro de lançamento', 'Paleta da campanha', 'Notas da reunião']
              .map((name) => `<li class="ts-file" data-file="${name}"><span class="ts-file__icon">${icon('file-text', { size: 18 })}</span><span class="ts-file__name">${name}</span><button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-archive aria-label="Arquivar ${name}" data-ds-tooltip="Arquivar">${icon('inbox', { size: 16 })}</button></li>`)
              .join('')}
          </ul>
          <p class="ts-files__empty" data-files-empty hidden>Tudo arquivado. <button type="button" class="ds-inline-action" data-files-reset>${icon('refresh', { size: 16 })}Recomeçar</button></p>
        </div>
        <div class="ts-action__text">
          <p class="ts-action__lead">Arquive um arquivo e desfaça pelo toast.</p>
          <p class="ts-action__note">Desfazer no toast é melhor do que pedir confirmação antes: a pessoa age rápido e corrige se errar.</p>
        </div>
      </div>
    </section>

    <section class="doc-section" id="comportamento" aria-labelledby="comportamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="comportamento-title">Comportamento</h2>
          <p class="doc-section__desc">Previsível: sempre no mesmo lugar, sempre saindo sozinho.</p>
        </div>
      </header>
      <div class="ts-behaviors">
        ${[
          ['layout', 'Seis posições', 'Embaixo ao centro é o padrão. Em cima, fica abaixo da topbar. O mais novo entra junto da borda e o toast desliza do lado de onde vem.', ['corners', 'Testar os seis']],
          ['layers', 'No máximo 3 por posição', 'O quarto empurra o mais antigo para fora. Cada posição tem a própria região anunciada.', ['burst', 'Mostrar 4 seguidos']],
          ['monitor', 'No celular', 'Abaixo de 768 px, os cantos viram o centro do mesmo lado — em cima ou embaixo.'],
          ['clock', 'Pausa com o ponteiro', 'Passou o mouse ou chegou com Tab, o tempo para. Saiu, continua.'],
          ['x', 'Até fechar', 'Com <code class="ds-inline-code">duration: Infinity</code> ganha um ×. Feche pelo código com <code class="ds-inline-code">.close()</code>.', ['sticky', 'Mostrar até fechar']],
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
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">Avisa sem roubar o foco de ninguém.</p>
        </div>
      </header>
      ${a11yList([
        ['Anunciado com educação', 'A região é <code class="ds-inline-code">role="status"</code> com <code class="ds-inline-code">aria-live="polite"</code>: o leitor de tela lê quando terminar o que está falando.'],
        ['Não move o foco', 'A pessoa continua onde estava. A ação do toast é alcançável com Tab.', ['Tab']],
        ['Tempo suficiente', 'Pausa no hover e no foco. Com ação, 5 s; para algo importante, use “até fechar”.'],
        ['Não depende da cor', 'Cada tom tem ícone próprio — sucesso, aviso, perigo e informação se distinguem sem cor.'],
        ['Mensagem completa', 'Escreva o que aconteceu, não só “Pronto!”. Quem só ouve o anúncio precisa entender.'],
        ['Erro sério fica na tela', 'Se a pessoa precisa agir para resolver, mostre o erro perto do problema — não num aviso que some.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Fundo invertido para destacar; tons só no ícone.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.inverse', 'Fundo'],
        ['color.fg.inverse', 'Texto e ação'],
        ['radius.md', 'Raio'],
        ['shadow.lg', 'Sombra'],
        ['text.label-md', 'Mensagem'],
        ['color.success.solid', 'Ícone de sucesso'],
        ['color.warning.solid', 'Ícone de aviso'],
        ['color.danger.solid', 'Ícone de perigo'],
        ['color.info.solid', 'Ícone de informação'],
        ['duration.base', 'Entrada e saída'],
        ['easing.emphasized', 'Curva da entrada'],
        ['z.toast', 'Camada'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Para confirmar, não para conversar.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: confirme o que aconteceu</p>
          <div class="ts-usage" inert>${pinned({ message: 'Link copiado' })}</div>
          <p class="usage-card__text">Curto, no passado, dizendo o resultado — embaixo, onde não cobre a navegação.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: erro importante que some</p>
          <div class="ts-usage" inert>${pinned({ message: 'Cartão recusado', tone: 'danger' })}</div>
          <p class="usage-card__text">Se a pessoa precisa resolver, o erro fica na tela, perto do campo.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Desfazer em vez de confirmar</p>
          <div class="ts-usage" inert>${pinned({ message: 'Projeto arquivado', action: { label: 'Desfazer' } })}</div>
          <p class="usage-card__text">Para ações reversíveis, agir direto e oferecer desfazer é mais rápido do que um modal.</p>
        </article>
      </div>
      <h3 class="doc-subhead">Onde posicionar <span class="doc-subhead__meta">uma posição só para o app inteiro</span></h3>
      <div class="doc-table ts-where">
        <div class="doc-table__head" aria-hidden="true"><span>Posição</span><span>Quando usar</span><span></span></div>
        ${WHERE.map(
          ([id, text]) => `<div class="doc-table__row">
            <span class="ts-where__pos"><span class="ts-where__mini ts-where__mini--${id}" aria-hidden="true"><i></i></span><span><span class="ts-where__label">${positionLabel(id)}</span><code>${id}</code></span></span>
            <span class="ts-where__text">${text}</span>
            <button type="button" class="ds-inline-action" data-show-at="${id}">${icon('play', { size: 16 })}Mostrar</button>
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
      { id: 'tone', label: 'Tom', value: 'success', options: TONES.map(([value, label]) => ({ value, label })) },
      { id: 'action', label: 'Ação', value: 'none', options: [{ value: 'none', label: 'Sem ação' }, { value: 'undo', label: 'Desfazer' }] },
      { id: 'duration', label: 'Duração', value: 'short', options: DURATIONS.map(([value, label]) => ({ value, label })) },
      { id: 'position', label: 'Posição', value: getToastPosition(), options: POSITIONS.map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'message', label: 'Mensagem', value: 'Alterações salvas' },
    render: (state) => {
      current = state;
      const isDefault = state.position === getToastPosition();
      return `<div class="ts-pg">
        <div class="ts-pg__main">
          ${pinned(stateOptions(state))}
          <div class="ts-pg__actions">
            <button type="button" class="ds-btn ds-btn--secondary" data-show-playground>${icon('play', { size: 16 })}Mostrar toast</button>
            <button type="button" class="ds-btn ds-btn--ghost" data-set-default aria-pressed="${isDefault}">${icon(isDefault ? 'check' : 'target', { size: 16 })}${isDefault ? 'É o padrão do app' : 'Usar como padrão do app'}</button>
          </div>
          <p class="ts-pg__note">Padrão do app: ${positionLabel(getToastPosition()).toLowerCase()}</p>
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
      action: o.action ? { label: 'Desfazer', onClick: () => toast('Desfeito', { icon: 'refresh', position }) } : undefined,
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
      toast(`Padrão do app: ${positionLabel(position).toLowerCase()}`, { icon: 'target' });
      root.querySelector('[data-playground="toast"] [data-set-default]')?.focus({ preventScroll: true });
      return;
    }

    const at = event.target.closest('[data-show-at]')?.dataset.showAt;
    if (at) return toast(positionLabel(at), { icon: 'layout', position: at });

    const tone = event.target.closest('[data-show-tone]')?.dataset.showTone;
    if (tone) {
      const [, , message] = TONES.find(([id]) => id === tone);
      toast(message, { tone });
      return;
    }

    const archive = event.target.closest('[data-archive]');
    if (archive) {
      const item = archive.closest('.ts-file');
      item.hidden = true;
      syncEmpty();
      toast(`“${item.dataset.file}” arquivado`, {
        tone: 'success',
        action: {
          label: 'Desfazer',
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
      POSITIONS.forEach(([position, label], i) => setTimeout(() => toast(label, { icon: 'layout', position }), i * 180));
    } else if (demo === 'burst') {
      ['Primeiro aviso', 'Segundo aviso', 'Terceiro aviso', 'Quarto aviso — o primeiro sai'].forEach((m, i) => setTimeout(() => toast(m, { icon: 'bell' }), i * 260));
    } else if (demo === 'sticky') {
      toast('Sincronizando 3 arquivos…', { icon: 'refresh', duration: Infinity });
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
