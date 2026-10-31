import { icon } from '../../ds/icons/icons.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/switch.css'];

/* ───────── Dados ───────── */

const STATES = [
  ['off', 'Desligado'],
  ['on', 'Ligado'],
  ['hover', 'Hover'],
  ['focus', 'Foco'],
  ['disabled', 'Desativado'],
];

const SETTINGS = [
  ['sw-set-email', 'Resumo por e-mail', 'Toda segunda, com o que mudou na semana.', true],
  ['sw-set-push', 'Notificações no celular', 'Menções e respostas, na hora.', true],
  ['sw-set-sound', 'Som ao receber mensagem', 'Só quando a aba está aberta.', false],
  ['sw-set-beta', 'Recursos em teste', 'Pode mudar sem aviso.', false],
];

let uid = 0;

/* ───────── Switch (playground, exemplos e código) ───────── */

function toggle(o) {
  const id = o.id ?? `sw-${++uid}`;
  const cls = ['ds-switch', o.size === 'sm' && 'ds-switch--sm', o.end && 'ds-switch--end', o.className].filter(Boolean).join(' ');
  const attrs = [
    `type="checkbox"`,
    `role="switch"`,
    `class="ds-switch__input"`,
    `id="${id}"`,
    (o.state === 'on' || o.checked) && 'checked',
    o.state === 'disabled' && 'disabled',
    ['hover', 'focus'].includes(o.state) && `data-state="${o.state}"`,
    o.inert && 'tabindex="-1"',
    o.extra,
  ].filter(Boolean);
  const text = o.label
    ? `<span class="ds-choice__text"><span class="ds-choice__label">${escapeHtml(o.label)}</span>${o.description ? `<span class="ds-choice__description">${escapeHtml(o.description)}</span>` : ''}</span>`
    : '';
  return `<label class="${cls}"><input ${attrs.join(' ')}>${text}</label>`;
}

function toggleCode(s) {
  const cls = ['ds-switch', s.size === 'sm' && 'ds-switch--sm', s.position === 'end' && 'ds-switch--end'].filter(Boolean).join(' ');
  const attrs = ['type="checkbox"', 'role="switch"', 'class="ds-switch__input"', s.state === 'on' && 'checked', s.state === 'disabled' && 'disabled'].filter(Boolean);
  const lines = [`<label class="${cls}">`, `  <input ${attrs.join(' ')}>`, `  <span class="ds-choice__text">`, `    <span class="ds-choice__label">${s.label || 'Rótulo'}</span>`];
  if (s.description === 'on') lines.push(`    <span class="ds-choice__description">Avisamos quando alguém comentar.</span>`);
  lines.push(`  </span>`, `</label>`);
  return lines.join('\n');
}

/* ───────── Página ───────── */

const NAV = [
  ['playground', 'Playground'],
  ['quando', 'Switch ou checkbox'],
  ['tamanhos', 'Tamanhos'],
  ['estados', 'Estados'],
  ['ajustes', 'Lista de ajustes'],
  ['movimento', 'Movimento'],
  ['acessibilidade', 'Acessibilidade'],
  ['tokens', 'Tokens'],
  ['uso', 'Uso'],
];

const sectionHead = (id, title, desc) => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>
</header>`;

export default function renderSwitch(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Switch</h1>
        <p class="doc-header__lead">Liga ou desliga algo na hora, sem botão de salvar. Se a mudança só vale ao enviar, use checkbox.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estados</dt><dd class="doc-stat__value">${STATES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">transição</dt><dd class="doc-stat__value">200 ms</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">papel ARIA</dt><dd class="doc-stat__value">switch</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', 'Um checkbox nativo com <code class="ds-inline-code">role="switch"</code>. O do palco funciona.')}
      ${playgroundMarkup('switch')}
    </section>

    <section class="doc-section" id="quando" aria-labelledby="quando-title">
      ${sectionHead('quando', 'Switch ou checkbox?', 'Os dois guardam um sim/não. A diferença é quando a escolha passa a valer.')}
      <div class="sw-compare">
        <article class="sw-compare__card">
          <div class="sw-compare__stage">
            ${toggle({ id: 'sw-q-dark', label: 'Modo foco', description: 'Esconde notificações enquanto estiver ligado.', checked: true, extra: 'data-live' })}
            <p class="sw-compare__status" data-live-status>Ligado agora</p>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Switch<code>ds-switch</code></p><p class="cd-example__text">Efeito imediato. Não precisa de botão de salvar.</p></div>
        </article>
        <article class="sw-compare__card">
          <div class="sw-compare__stage">
            <label class="ds-checkbox"><input type="checkbox" class="ds-checkbox__input" checked><span class="ds-choice__text"><span class="ds-choice__label">Receber o contrato por e-mail</span><span class="ds-choice__description">Vale quando você enviar o formulário.</span></span></label>
            <button type="button" class="ds-btn ds-btn--primary ds-btn--sm sw-compare__submit" tabindex="-1" aria-hidden="true">Enviar</button>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Checkbox<code>ds-checkbox</code></p><p class="cd-example__text">Faz parte de um formulário e vale ao enviar.</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      ${sectionHead('tamanhos', 'Tamanhos', 'Médio é o padrão. O pequeno cabe em linhas de tabela e barras densas.')}
      <div class="sw-sizes">
        ${[
          ['md', 'Médio', '36 × 20 px', 'padrão'],
          ['sm', 'Pequeno', '28 × 16 px', 'ds-switch--sm'],
        ]
          .map(
            ([size, name, dims, cls]) => `<article class="cd-example">
              <div class="cd-example__preview" inert>${toggle({ size, checked: true, inert: true, label: 'Ligado' })}${toggle({ size, inert: true, label: 'Desligado' })}</div>
              <div class="cd-example__body"><p class="cd-example__name">${name}<code>${cls}</code></p><p class="cd-example__text">${dims}</p></div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', 'Estados', 'Ligado ganha a cor da marca e o polegar vai para a direita — a posição também comunica, não só a cor.')}
      <div class="sw-states" inert>
        ${STATES.map(
          ([state, label]) => `<div class="sw-states__item">
            ${toggle({ state, inert: true })}
            <span class="sw-states__label">${label}</span>
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="ajustes" aria-labelledby="ajustes-title">
      ${sectionHead('ajustes', 'Lista de ajustes', 'O uso mais comum: rótulo e descrição à esquerda, switch à direita com <code class="ds-inline-code">.ds-switch--end</code>. Cada mudança vale na hora.')}
      <div class="sw-settings" data-settings>
        <p class="sw-settings__title">Notificações</p>
        <ul class="sw-settings__list" role="list">
          ${SETTINGS.map(([id, label, description, checked]) => `<li class="sw-settings__row">${toggle({ id, label, description, checked, end: true })}</li>`).join('')}
        </ul>
      </div>
    </section>

    <section class="doc-section" id="movimento" aria-labelledby="movimento-title">
      ${sectionHead('movimento', 'Movimento', 'O polegar anda em <code class="ds-inline-code">duration.base</code> (200 ms) com <code class="ds-inline-code">easing.emphasized</code>: sai rápido e assenta suave. Com movimento reduzido, a troca é instantânea.')}
      <div class="sw-motion">
        <div class="sw-motion__demo" data-motion>
          <div class="sw-motion__big">${toggle({ id: 'sw-motion', checked: false, extra: 'aria-label="Exemplo de movimento"' })}</div>
          <div class="sw-motion__controls">
            <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-motion-play>${icon('play', { size: 16 })}Alternar</button>
            <button type="button" class="ds-chip ds-chip--sm" data-motion-reduce aria-pressed="false">${icon('motion', { size: 14 })}Simular movimento reduzido</button>
          </div>
        </div>
        <div class="sw-motion__code">${codeBlock(`.ds-switch__input::before {
  transition: translate var(--ds-duration-base) var(--ds-easing-emphasized);
}

@media (prefers-reduced-motion: reduce) {
  .ds-switch__input::before { transition: none; }
}`)}</div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="acessibilidade-title">
      ${sectionHead('acessibilidade', 'Acessibilidade', 'Um checkbox nativo por baixo, anunciado como interruptor.')}
      ${a11yList([
        ['role="switch"', 'O leitor de tela anuncia “interruptor, ligado” em vez de “caixa de seleção, marcada”.'],
        ['Teclado', 'Tab leva o foco; Espaço liga e desliga.', ['Tab', 'Espaço']],
        ['Rótulo descreve o que liga', '“Notificações por e-mail”, não “Ligado”. O estado já é anunciado pelo controle.'],
        ['Não depende só da cor', 'A posição do polegar muda junto com a cor — funciona para quem não distingue o pêssego.'],
        ['Efeito visível', 'Se a mudança acontece fora da tela, confirme com um aviso curto (toast) para quem não vê o resultado.'],
        ['Movimento reduzido', 'Com <code class="ds-inline-code">prefers-reduced-motion</code>, o polegar troca de lado sem animar.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', 'Tokens usados', 'Tudo o que o switch consome.')}
      ${tokenTable([
        ['color.bg.muted', 'Trilho desligado'],
        ['color.fg.muted', 'Polegar desligado'],
        ['color.brand.solid', 'Trilho ligado'],
        ['color.brand.on-solid', 'Polegar ligado'],
        ['color.border.default', 'Contorno do trilho'],
        ['color.border.strong', 'Contorno no hover'],
        ['color.border.focus', 'Anel de foco'],
        ['radius.full', 'Trilho e polegar'],
        ['duration.base', 'Polegar e cor'],
        ['easing.emphasized', 'Curva do polegar'],
        ['text.label-md', 'Rótulo'],
        ['text.body-sm', 'Descrição'],
        ['opacity.disabled', 'Desativado'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', 'Uso', 'Três regras para não confundir.')}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: efeito na hora</p>
          <div class="sw-usage" inert>${toggle({ label: 'Mostrar prévia dos links', checked: true, end: true, inert: true })}</div>
          <p class="usage-card__text">Liga e a interface muda. Nenhum “salvar” depois.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: switch com botão de enviar</p>
          <div class="sw-usage sw-usage--row" inert>${toggle({ label: 'Aceito os termos', inert: true })}<span class="ds-btn ds-btn--primary ds-btn--sm">Enviar</span></div>
          <p class="usage-card__text">Se precisa confirmar, é checkbox. O switch promete efeito imediato.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Rótulo sem “ligar/desligar”</p>
          <div class="sw-usage" inert>${toggle({ label: 'Modo escuro', checked: true, end: true, inert: true })}</div>
          <p class="usage-card__text">“Modo escuro” basta. “Ligar modo escuro” fica estranho quando já está ligado.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'switch',
    controls: [
      { id: 'size', label: 'Tamanho', value: 'md', options: [{ value: 'md', label: 'Médio' }, { value: 'sm', label: 'Pequeno' }] },
      { id: 'state', label: 'Estado', value: 'on', options: STATES.map(([value, label]) => ({ value, label })) },
      { id: 'position', label: 'Posição', value: 'start', options: [{ value: 'start', label: 'Antes do rótulo' }, { value: 'end', label: 'À direita' }] },
      { id: 'description', label: 'Descrição', value: 'on', options: [{ value: 'on', label: 'Com descrição' }, { value: 'off', label: 'Sem descrição' }] },
    ],
    text: { id: 'label', label: 'Rótulo', value: 'Avisar sobre comentários' },
    render: (s) =>
      `<div class="sw-stage${s.position === 'end' ? ' sw-stage--end' : ''}">${toggle({
        id: 'sw-playground',
        size: s.size,
        state: s.state,
        end: s.position === 'end',
        label: s.label || 'Rótulo',
        description: s.description === 'on' ? 'Avisamos quando alguém comentar.' : '',
      })}</div>`,
    code: toggleCode,
  });

  const onChange = (event) => {
    // comparação: o status acompanha o switch
    if (event.target.matches('[data-live]')) {
      root.querySelector('[data-live-status]').textContent = event.target.checked ? 'Ligado agora' : 'Desligado agora';
    }
    // lista de ajustes: confirma com um aviso curto
    if (event.target.closest('[data-settings]')) {
      const label = event.target.closest('.ds-switch').querySelector('.ds-choice__label').textContent;
      toast(`${label}: ${event.target.checked ? 'ligado' : 'desligado'}`);
    }
  };
  root.addEventListener('change', onChange);

  // movimento: alternar e simular movimento reduzido só nesta demo
  const motion = root.querySelector('[data-motion]');
  const motionInput = motion.querySelector('#sw-motion');
  const reduce = motion.querySelector('[data-motion-reduce]');
  const onMotionClick = (event) => {
    if (event.target.closest('[data-motion-play]')) motionInput.checked = !motionInput.checked;
    if (event.target.closest('[data-motion-reduce]')) {
      const on = reduce.getAttribute('aria-pressed') !== 'true';
      reduce.setAttribute('aria-pressed', String(on));
      motion.toggleAttribute('data-reduced', on);
    }
  };
  motion.addEventListener('click', onMotionClick);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    unmountPlayground();
    root.removeEventListener('change', onChange);
    motion.removeEventListener('click', onMotionClick);
    unmountCopy();
    unmountNav();
  };
}
