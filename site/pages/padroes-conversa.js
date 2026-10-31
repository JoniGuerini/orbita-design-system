import { icon } from '../../ds/icons/icons.js';
import { toast, copyText } from '../../ds/js/toast.js';
import { createComposer, composerHtml, messageHtml, typingHtml, streamText, attachmentHtml } from '../../ds/js/composer.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-conversa.css'];

/* ───────── Dados ───────── */

const COMMANDS = [
  { id: 'roteiro', label: 'Criar roteiro', description: 'Monta um roteiro em cenas', icon: 'list' },
  { id: 'resumir', label: 'Resumir', description: 'Resume um texto em três frases', icon: 'file-text' },
  { id: 'traduzir', label: 'Traduzir', description: 'Traduz para inglês', icon: 'globe' },
  { id: 'tom', label: 'Mudar o tom', description: 'Reescreve mais direto', icon: 'pencil' },
];

const SUGGESTIONS = [
  ['list', 'Crie um roteiro de 3 cenas', 'roteiro'],
  ['file-text', 'Resuma o que é o Órbita', 'resumir'],
  ['palette', 'Por onde começo os tokens?', null],
];

const KEYS = [
  [['Enter'], 'Envia a mensagem'],
  [['Shift', 'Enter'], 'Quebra a linha'],
  [['/'], 'No começo do campo, abre os comandos'],
  [['↑', '↓'], 'Percorrem os comandos'],
  [['Enter', 'Tab'], 'Escolhem o comando', 'ou'],
  [['Esc'], 'Fecha os comandos; com a resposta chegando, para a resposta'],
  [['Backspace'], 'No começo do campo, remove o comando escolhido'],
];

const kbd = (keys, joiner = '+') => keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join(` <span class="pc-keys__join">${joiner}</span> `);
const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/* ───────── Cartões de resultado ───────── */

const tools = (label) => `<div class="ds-result-card__tools">
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-action="copy-card" aria-label="Copiar ${label}" data-ds-tooltip="Copiar">${icon('copy', { size: 16 })}</button>
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" aria-label="Mais opções" data-ds-tooltip="Mais opções">${icon('more-horizontal', { size: 16 })}</button>
  </div>`;

const SCENES = [
  ['01', 'Abertura', 'Tela escura. O nome Órbita aparece, sem enfeite.'],
  ['02', 'O problema', 'Três telas do mesmo produto, cada uma de um jeito.'],
  ['03', 'A virada', 'Um token muda e todas as telas mudam juntas.'],
];

function roteiroCard(title = 'Lançamento do Órbita 0.2') {
  return `<section class="ds-result-card" aria-label="Roteiro: ${escapeHtml(title)}">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">Roteiro · 3 cenas · ~45 s</p><p class="ds-result-card__title">${escapeHtml(title)}</p></div>
      ${tools('roteiro')}
    </header>
    <ol class="ds-result-card__list" role="list">
      ${SCENES.map(([n, name, text]) => `<li><p class="ds-section__head"><span class="ds-section__stamp">${n}</span><span>${name}</span></p><p class="ds-section__text">${text}</p></li>`).join('')}
    </ol>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action" data-action="open">Abrir no editor${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
      <button type="button" class="ds-inline-action" data-action="copy-card">${icon('copy', { size: 16 })}Copiar roteiro</button>
    </div>
  </section>`;
}

function summaryCard() {
  return `<section class="ds-result-card" aria-label="Resumo em três frases">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">Resumo · 3 frases</p><p class="ds-result-card__title">O Órbita em poucas palavras</p></div>
      ${tools('resumo')}
    </header>
    <p class="ds-result-card__text">Design system escuro e quente, com tokens em OKLCH. Os componentes só consomem tokens semânticos. Tema claro e escuro, contraste verificado e teclado em tudo.</p>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action" data-action="open">Usar como descrição${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
    </div>
  </section>`;
}

function stepsCard() {
  return `<section class="ds-result-card" aria-label="Próximos passos">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">Próximos passos · 3</p><p class="ds-result-card__title">Começando pelos tokens</p></div>
      ${tools('passos')}
    </header>
    <ol class="ds-result-card__list" role="list">
      <li><p class="ds-section__head"><span class="ds-section__stamp">01</span><span>Cores</span></p><p class="ds-section__text">Troque o tom da marca em tokens/palettes.json.</p></li>
      <li><p class="ds-section__head"><span class="ds-section__stamp">02</span><span>Tipografia</span></p><p class="ds-section__text">Use os 19 estilos de texto, nunca tamanhos soltos.</p></li>
      <li><p class="ds-section__head"><span class="ds-section__stamp">03</span><span>Componentes</span></p><p class="ds-section__text">Consuma só tokens semânticos nos estilos.</p></li>
    </ol>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action" data-action="open">Abrir Primeiros passos${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
    </div>
  </section>`;
}

function fileCard() {
  return `<section class="ds-result-card" aria-label="Arquivo gerado">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">Arquivo · CSV</p><p class="ds-result-card__title">Tokens de cor, tema escuro</p></div>
      ${tools('arquivo')}
    </header>
    <div>${attachmentHtml({ name: 'tokens-escuro.csv', size: 18640, type: 'text/csv' })}</div>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action">${icon('download', { size: 16 })}Baixar</button>
      <button type="button" class="ds-inline-action">Ver prévia${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
    </div>
  </section>`;
}

/* ───────── Respostas simuladas ───────── */

const short = (s, n = 60) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function replyFor({ text, command, attachments }, mode, variant = 0) {
  const t = text.toLowerCase();
  const read = attachments.length ? [`Li ${attachments.length === 1 ? `o arquivo ${attachments[0].name}` : `os ${attachments.length} arquivos`}.`] : [];
  const withCard = mode !== 'text';
  const key = command ?? (t.includes('roteiro') ? 'roteiro' : t.includes('resum') ? 'resumir' : t.includes('tradu') ? 'traduzir' : t.includes('tom') ? 'tom' : null);
  const alt = variant % 2 === 1;
  switch (key) {
    case 'roteiro':
      return {
        paragraphs: [...read, alt ? 'Outra versão, mais curta: três cenas de 15 segundos.' : 'Montei um roteiro curto, em três cenas. Cada uma cabe em até 20 segundos.'],
        card: withCard ? roteiroCard(alt ? 'Órbita 0.2 em 45 segundos' : undefined) : '',
      };
    case 'resumir':
      return {
        paragraphs: [...read, 'Em três frases:', 'O Órbita é um design system escuro e quente, com tokens gerados em OKLCH. Os componentes consomem só tokens semânticos, então a marca muda trocando uma cor. Tudo tem tema claro e escuro, contraste verificado e teclado.'],
        card: withCard ? summaryCard() : '',
      };
    case 'traduzir':
      return { paragraphs: [...read, 'Em inglês:', '“Build with refinement. Every screen starts consistent, accessible and carefully detailed.”'], card: '' };
    case 'tom':
      return { paragraphs: [...read, 'Mais direto:', '“Comece agora: tokens, componentes e gráficos prontos para usar.”'], card: '' };
    default:
      return {
        paragraphs: [
          ...read,
          text ? `Sobre “${short(text)}”:` : 'Recebi.',
          alt ? 'Outro caminho: comece pelos componentes que você mais usa e ajuste os tokens conforme aparecerem.' : 'Eu começaria por três coisas: as cores da marca, a tipografia e os componentes que você mais usa. Quer que eu monte um roteiro com isso?',
        ],
        card: withCard ? stepsCard() : '',
      };
  }
}

/* ───────── Demo ao vivo ───────── */

function demoMarkup() {
  return `<div class="pc-demo">
    <header class="pc-demo__head">
      <div><p class="ds-panel__eyebrow">Assistente</p><p class="pc-demo__title">Nova conversa</p></div>
      <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-demo-reset aria-label="Começar outra conversa" data-ds-tooltip="Nova conversa">${icon('plus', { size: 20 })}</button>
    </header>
    <div class="pc-demo__scroll" data-scroll>
      <div class="pc-welcome" data-welcome>
        <span class="ds-message__mark pc-welcome__mark" aria-hidden="true">Ó</span>
        <p class="pc-welcome__title">Como posso ajudar?</p>
        <p class="pc-welcome__text">Pergunte em português, anexe um arquivo ou digite <kbd class="ds-kbd">/</kbd> para ver os comandos.</p>
        <div class="ds-suggestions">
          ${SUGGESTIONS.map(([ic, label, cmd]) => `<button type="button" class="ds-chip ds-chip--sm" data-suggest="${escapeHtml(label)}"${cmd ? ` data-command="${cmd}"` : ''}><span class="ds-chip__icon">${icon(ic, { size: 14 })}</span>${label}</button>`).join('')}
        </div>
      </div>
      <div class="ds-thread" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversa" data-thread></div>
    </div>
    <div class="pc-demo__composer" data-composer></div>
    <p class="ds-visually-hidden" aria-live="polite" data-demo-live></p>
  </div>`;
}

function mountDemo(preview, state) {
  const $ = (s) => preview.querySelector(s);
  const thread = $('[data-thread]');
  const scroll = $('[data-scroll]');
  const welcome = $('[data-welcome]');
  const live = $('[data-demo-live]');
  const timers = new Set();
  let controller = null;
  let pending = null; // resposta em andamento: { el, phase }
  let seq = 0;

  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };
  const toBottom = () => scroll.scrollTo({ top: scroll.scrollHeight });
  const say = (text) => {
    live.textContent = '';
    later(() => (live.textContent = text), 30);
  };

  const composer = createComposer($('[data-composer]'), {
    label: 'Mensagem para o Órbita',
    placeholder: 'Pergunte algo ou digite / para comandos',
    commands: COMMANDS,
    maxLength: 2000,
    onSend: (payload) => send(payload),
    onStop: () => stop(),
  });

  function userHtml(payload, id, status) {
    const cmd = payload.command ? `<span class="ds-message__command">/${payload.command}</span>` : '';
    const text = payload.text ? escapeHtml(payload.text).replace(/\n/g, '<br>') : '';
    return messageHtml({
      role: 'user',
      id,
      html: cmd || text ? `<p>${cmd}${cmd && text ? ' ' : ''}${text}</p>` : '',
      attachments: payload.attachments,
      time: now(),
      status,
    });
  }

  function send(payload, { retry = false } = {}) {
    welcome.hidden = true;
    const id = `m${++seq}`;
    thread.insertAdjacentHTML('beforeend', userHtml(payload, id));
    const msg = thread.querySelector(`[data-message="${id}"]`);
    msg._payload = payload;
    toBottom();
    if (state.reply === 'error' && !retry) {
      composer.setBusy(true);
      later(() => {
        composer.setBusy(false);
        msg.outerHTML = userHtml(payload, id, 'error');
        thread.querySelector(`[data-message="${id}"]`)._payload = payload;
        say('A mensagem não foi enviada. Use Tentar de novo.');
        toBottom();
      }, 700);
      return;
    }
    respond(payload);
  }

  function respond(payload, target = null, variant = 0) {
    thread.querySelectorAll('[data-latest]').forEach((el) => el.removeAttribute('data-latest'));
    const id = `m${++seq}`;
    const html = messageHtml({ role: 'assistant', id, time: now(), html: typingHtml(), actions: false, busy: true });
    if (target) target.outerHTML = html;
    else thread.insertAdjacentHTML('beforeend', html);
    const el = thread.querySelector(`[data-message="${id}"]`);
    const body = el.querySelector('[data-body]');
    const reply = replyFor(payload, state.reply, variant);
    composer.setBusy(true);
    controller = new AbortController();
    pending = { el, phase: 'typing', payload };
    toBottom();

    const instant = state.speed === 'instant';
    later(() => {
      if (!pending || pending.el !== el) return;
      pending.phase = 'writing';
      body.innerHTML = '';
      streamText(body, reply.paragraphs, { delay: instant ? 0 : 34, signal: controller.signal }).then(({ stopped }) => {
        if (stopped) return;
        finish(el, payload, reply, variant);
      });
      const follow = setInterval(toBottom, 120);
      timers.add(follow);
      controller.signal.addEventListener('abort', () => clearInterval(follow), { once: true });
      later(() => clearInterval(follow), 8000);
    }, instant ? 250 : 750);
  }

  function finish(el, payload, reply, variant, { interrupted = false } = {}) {
    pending = null;
    controller = null;
    composer.setBusy(false);
    const body = el.querySelector('[data-body]');
    const done = messageHtml({
      role: 'assistant',
      id: el.dataset.message,
      time: el.querySelector('time')?.textContent,
      html: body.innerHTML,
      card: interrupted ? '' : reply.card,
      meta: interrupted ? 'Resposta interrompida.' : undefined,
      latest: true,
    });
    el.outerHTML = done;
    const fresh = thread.querySelector(`[data-message="${el.dataset.message}"]`);
    fresh._payload = payload;
    fresh._variant = variant;
    fresh._text = reply.paragraphs.join('\n\n');
    toBottom();
  }

  function stop() {
    if (!pending) return;
    const { el, phase } = pending;
    controller?.abort();
    const payload = pending.payload ?? { text: '', attachments: [] };
    if (phase === 'typing') el.querySelector('[data-body]').innerHTML = '<p class="pc-muted">Parei antes de começar.</p>';
    finish(el, payload, { paragraphs: [el.querySelector('[data-body]').textContent], card: '' }, 0, { interrupted: true });
    say('Resposta interrompida.');
    composer.focus();
  }

  function reset() {
    controller?.abort();
    timers.forEach((t) => (clearTimeout(t), clearInterval(t)));
    timers.clear();
    pending = null;
    thread.innerHTML = '';
    welcome.hidden = false;
    composer.setBusy(false);
    composer.clear();
    composer.focus();
  }

  const onClick = (event) => {
    const t = event.target;
    const suggest = t.closest('[data-suggest]');
    if (suggest) {
      if (pending) return;
      send({ text: suggest.dataset.suggest, attachments: [], command: suggest.dataset.command ?? null });
      composer.focus();
      return;
    }
    if (t.closest('[data-demo-reset]')) return reset();
    const btn = t.closest('[data-action]');
    if (!btn) return;
    const msg = btn.closest('.ds-message');
    const action = btn.dataset.action;
    if (action === 'copy') {
      const text = msg._text ?? msg.querySelector('[data-body]').innerText;
      navigator.clipboard?.writeText(text).then(() => toast('Resposta copiada', { icon: 'check' }), () => copyText(text, 'Resposta copiada'));
      if (!navigator.clipboard) copyText(text, 'Resposta copiada');
    } else if (action === 'copy-card') {
      const card = btn.closest('.ds-result-card');
      const text = card ? card.innerText.trim() : '';
      navigator.clipboard?.writeText(text).then(() => toast('Cartão copiado', { icon: 'check' }), () => copyText(text, 'Cartão copiado'));
    } else if (action === 'retry') {
      if (pending) return;
      respond(msg._payload ?? { text: '', attachments: [] }, msg, (msg._variant ?? 0) + 1);
    } else if (action === 'like' || action === 'dislike') {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      msg.querySelectorAll('[data-action="like"], [data-action="dislike"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', String(on));
      say(on ? 'Obrigado pela avaliação.' : 'Avaliação removida.');
    } else if (action === 'resend') {
      const payload = msg._payload;
      msg.remove();
      send(payload, { retry: true });
      composer.focus();
    } else if (action === 'open') {
      toast('No app, isto abriria o resultado', { icon: 'external-link' });
    }
  };
  preview.addEventListener('click', onClick);

  return () => {
    controller?.abort();
    timers.forEach((t) => (clearTimeout(t), clearInterval(t)));
    preview.removeEventListener('click', onClick);
    composer.destroy();
  };
}

function demoCode(state) {
  return `import { createComposer, messageHtml, typingHtml, streamText } from './ds/js/composer.js';

const thread = document.querySelector('.ds-thread');   // role="log" aria-live="polite"

const composer = createComposer(document.querySelector('#composer'), {
  label: 'Mensagem para o Órbita',
  placeholder: 'Pergunte algo ou digite / para comandos',
  maxLength: 2000,
  commands: [
    { id: 'roteiro', label: 'Criar roteiro', description: 'Monta um roteiro em cenas', icon: 'list' },
    { id: 'resumir', label: 'Resumir', description: 'Resume um texto em três frases', icon: 'file-text' },
  ],
  async onSend({ text, attachments, command }) {
    thread.insertAdjacentHTML('beforeend', messageHtml({ role: 'user', text, attachments }));
    ${state.reply === 'error' ? `// falhou? mostre o erro na própria mensagem, com "Tentar de novo"
    // messageHtml({ role: 'user', text, status: 'error' })
    ` : ''}composer.setBusy(true);                       // enviar vira "parar"; Esc também para
    thread.insertAdjacentHTML('beforeend', messageHtml({ html: typingHtml(), busy: true, actions: false }));
    const body = thread.lastElementChild.querySelector('[data-body]');
    body.innerHTML = '';
    await streamText(body, await pedirResposta(text, command)${state.speed === 'instant' ? ', { delay: 0 }' : ''});
    thread.lastElementChild.removeAttribute('aria-busy');
    composer.setBusy(false);
  },
  onStop() { /* cancele a requisição e marque "Resposta interrompida." */ },
});`;
}

/* ───────── Exemplos estáticos ───────── */

const thread = (inner, cls = '') => `<div class="ds-thread ${cls}" inert>${inner}</div>`;

const BALLOONS = [
  [
    'Pergunta',
    'ds-message--user',
    'Balão sólido, à direita. O canto de baixo, mais fechado, aponta quem falou.',
    messageHtml({ role: 'user', text: 'Monte um roteiro para o lançamento da versão 0.2', time: '14:32' }),
  ],
  [
    'Resposta',
    'ds-message',
    'Sem balão: texto de leitura de até 68 caracteres por linha, com autor e hora em cima.',
    messageHtml({ role: 'assistant', time: '14:32', text: 'Montei um roteiro curto, em três cenas. Cada uma cabe em até 20 segundos.', latest: true }),
  ],
  [
    'Com anexos',
    'ds-message__attachments',
    'Anexos vêm antes do texto, em pílulas com tipo, nome e tamanho.',
    messageHtml({ role: 'user', text: 'Resuma esses dois arquivos', attachments: [{ name: 'briefing.pdf', size: 248000 }, { name: 'tela-inicial.png', size: 1320000, type: 'image/png' }] }),
  ],
  [
    'Lista e código',
    'ds-message__body',
    'Listas só a partir de três itens. Código curto entra inline.',
    messageHtml({
      role: 'assistant',
      actions: false,
      html: '<p>Para trocar a marca:</p><ol><li>Abra <code>tokens/palettes.json</code>.</li><li>Mude o <code>hue</code> de <code>brand</code>.</li><li>Rode <code>npm run tokens</code>.</li></ol>',
    }),
  ],
  [
    'Divisor e aviso',
    'ds-thread__divider',
    'O divisor separa dias; o aviso do sistema fica centrado e apagado, sem balão.',
    `<p class="ds-thread__divider">Hoje</p><p class="ds-thread__notice">Ana Souza entrou na conversa.</p>`,
  ],
  ['Escrevendo', 'ds-typing', 'Três pontos e um texto curto. Com movimento reduzido, os pontos ficam parados.', messageHtml({ role: 'assistant', actions: false, html: typingHtml(), busy: false })],
];

const STATES = [
  [
    'Primeira mensagem',
    'Conversa vazia: um convite curto e três sugestões concretas, que ensinam o que dá para pedir.',
    `<div class="pc-welcome pc-welcome--static">
      <span class="ds-message__mark pc-welcome__mark" aria-hidden="true">Ó</span>
      <p class="pc-welcome__title">Como posso ajudar?</p>
      <div class="ds-suggestions">${SUGGESTIONS.map(([ic, label]) => `<span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon(ic, { size: 14 })}</span>${label}</span>`).join('')}</div>
    </div>`,
  ],
  [
    'Respondendo',
    'A resposta chega com os pontos de “escrevendo”. O enviar vira parar.',
    thread(`${messageHtml({ role: 'user', text: 'Resuma o que é o Órbita', time: '14:32' })}${messageHtml({ role: 'assistant', actions: false, html: typingHtml() })}`),
  ],
  [
    'Erro ao enviar',
    'O texto fica na tela, com o motivo e um jeito de seguir. Nada some.',
    thread(messageHtml({ role: 'user', text: 'Resuma o que é o Órbita', status: 'error' })),
  ],
  [
    'Resposta interrompida',
    'O que já chegou fica. Uma linha diz que parou; as ações continuam valendo.',
    thread(messageHtml({ role: 'assistant', time: '14:33', text: 'Eu começaria por três coisas: as cores da marca, a tipografia e', meta: 'Resposta interrompida.', latest: true })),
  ],
  [
    'Limite de caracteres',
    'A contagem aparece perto do limite. Passou: borda e número em perigo, e o enviar desliga.',
    `<div inert>${composerHtml({ value: 'Texto longo colado de um documento, passando do limite de caracteres da mensagem…', maxLength: 72, hint: false, rows: 2 })}</div>`,
  ],
];

const COMPOSER_STATES = [
  ['Vazio', 'Placeholder diz o que dá para fazer. Enviar fica desligado.', { placeholder: 'Pergunte ou digite /' }],
  ['Em foco', 'Borda e anel da marca. Cresce com o texto até 216 px, depois rola.', { value: 'Monte um roteiro', state: 'focus' }],
  ['Com comando e anexo', 'O comando vira uma pílula da marca; anexos, pílulas com contorno.', { value: 'para o lançamento da 0.2', command: COMMANDS[0], attachments: [{ name: 'briefing.pdf', size: 248000 }] }],
  ['Respondendo', 'Enviar vira parar (Esc). Dá para ir escrevendo a próxima.', { value: '', busy: true, placeholder: 'Pergunte ou digite /' }],
  ['Desativado', 'Só quando não dá para enviar mesmo (sem conexão, sem permissão) — e diga por quê.', { disabled: true, placeholder: 'Sem conexão' }],
];

const ANATOMY = [
  ['1', 'Pergunta', 'Balão sólido em bg.raised, à direita.'],
  ['2', 'Anexo', 'Pílula com tipo, nome e tamanho.'],
  ['3', 'Autor e hora', 'Marca, nome e hora em eyebrow apagado.'],
  ['4', 'Resposta', 'Texto de leitura, sem balão, até 68 caracteres.'],
  ['5', 'Cartão de resultado', 'O que dá para usar: carimbo, título, conteúdo e ações.'],
  ['6', 'Ações', 'Copiar, gerar de novo e avaliar — no hover e na última resposta.'],
  ['7', 'Composer', 'Campo que cresce, anexos e comandos em cima.'],
  ['8', 'Ferramentas', 'Anexar e comandos, botões de ícone sem fundo.'],
  ['9', 'Enviar', 'O único ponto de cor. Vira parar enquanto responde.'],
];

/* ───────── Página ───────── */

const section = (id, title, desc, body) => `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header"><div><h2 class="doc-section__title" id="${id}-title">${title}</h2>${desc ? `<p class="doc-section__desc">${desc}</p>` : ''}</div></header>
    ${body}
  </section>`;

const NAV = [
  ['ao-vivo', 'Ao vivo'],
  ['anatomia', 'Anatomia'],
  ['baloes', 'Balões'],
  ['cartao', 'Cartão de resultado'],
  ['composer', 'Composer'],
  ['comandos', 'Atalhos com /'],
  ['estados', 'Estados'],
  ['escrita', 'Escrita'],
  ['acessibilidade', 'Acessibilidade'],
  ['tokens', 'Tokens'],
  ['codigo', 'Código'],
  ['uso', 'Uso'],
];

function anatomyMarkup() {
  return `<div class="pc-anatomy">
    <div class="pc-anatomy__stage" inert aria-hidden="true">
      <div class="ds-thread">
        <article class="ds-message ds-message--user">
          <div class="ds-message__attachments"><span class="pc-pin-wrap" data-pin="2">${attachmentHtml({ name: 'briefing.pdf', size: 248000 })}</span></div>
          <div class="ds-message__body" data-pin="1"><p>Monte um roteiro para o lançamento da 0.2</p></div>
        </article>
        <article class="ds-message" data-latest>
          <header class="ds-message__head" data-pin="3"><span class="ds-message__mark">Ó</span><span class="ds-message__author">Órbita</span><time>14:32</time></header>
          <div class="ds-message__body" data-pin="4"><p>Li o briefing. Montei um roteiro curto, em três cenas.</p></div>
          <div class="pc-pin-block" data-pin="5">${roteiroCard()}</div>
          <div class="ds-message__actions" data-pin="6">
            ${['copy', 'refresh', 'thumbs-up', 'thumbs-down'].map((n) => `<span class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted">${icon(n, { size: 16 })}</span>`).join('')}
          </div>
        </article>
      </div>
      <div class="pc-anatomy__composer" data-pin="7">${composerHtml({ value: '', hint: false, placeholder: 'Pergunte algo ou digite / para comandos' })}</div>
    </div>
    <ol class="pc-legend" role="list">
      ${ANATOMY.map(([n, name, text]) => `<li><span class="pc-legend__num">${n}</span><div><p class="pc-legend__name">${name}</p><p class="pc-legend__text">${text}</p></div></li>`).join('')}
    </ol>
  </div>`;
}

function exampleCard(name, code, text, preview, cls = '') {
  return `<article class="pc-example ${cls}">
    <div class="pc-example__preview">${preview}</div>
    <div class="pc-example__body">
      <p class="pc-example__name">${name}${code ? `<code>${code}</code>` : ''}</p>
      <p class="pc-example__text">${text}</p>
    </div>
  </article>`;
}

function commandMenuStatic() {
  const options = COMMANDS.map(
    (c, i) => `<div class="ds-composer__option" aria-selected="${i === 0}">${icon(c.icon, { size: 18 })}<span class="ds-composer__option-label">/${c.id}</span><span class="ds-composer__option-desc">${c.description}</span></div>`,
  ).join('');
  return composerHtml({ value: '/', hint: false }).replace(
    /<div class="ds-composer__menu"([^>]*) hidden><\/div>/,
    `<div class="ds-composer__menu"$1><p class="ds-composer__menu-label">Comandos</p>${options}</div>`,
  );
}

export default function renderConversa(page) {
  return `
  <div class="page doc pc-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Conversa e composer</h1>
        <p class="doc-header__lead">Pergunta em balão, resposta em texto de leitura, resultado em cartão e uma caixa de mensagem que cresce com o texto, aceita anexos e comandos com <kbd class="ds-kbd">/</kbd>.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tipos de mensagem</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">atalhos</dt><dd class="doc-stat__value">${KEYS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estados</dt><dd class="doc-stat__value">${STATES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">ponto de cor</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'ao-vivo',
      'Ao vivo',
      'Uma conversa de verdade, com respostas simuladas. Envie, digite <kbd class="ds-kbd">/</kbd>, anexe um arquivo, pare uma resposta no meio ou copie o resultado.',
      playgroundMarkup('conversa', { wide: true }),
    )}

    ${section('anatomia', 'Anatomia', 'Nove peças. Só uma tem cor: o enviar. O resto é contorno, superfície e texto.', anatomyMarkup())}

    ${section(
      'baloes',
      'Balões',
      'Quem pergunta ganha balão; quem responde, não. Assim a pergunta se acha de relance e a resposta se lê sem moldura.',
      `<div class="pc-examples">${BALLOONS.map(([name, code, text, preview]) => exampleCard(name, code, text, thread(preview))).join('')}</div>
      <dl class="pc-specs">
        <div><dt>Balão</dt><dd>bg.raised · contorno sutil · raio xl, canto xs</dd></div>
        <div><dt>Resposta</dt><dd>text.body-md · 16/28 · até 68 caracteres</dd></div>
        <div><dt>Entre mensagens</dt><dd>space.400 · 32 px</dd></div>
        <div><dt>Ações</dt><dd>botões de ícone de 28 px, sem fundo</dd></div>
      </dl>`,
    )}

    ${section(
      'cartao',
      'Cartão de resultado',
      'Quando a resposta é algo para usar — um roteiro, um resumo, um arquivo —, ela vira cartão: carimbo e tipo, título, conteúdo curto e no máximo duas ações. Conversa comum continua em texto.',
      `<div class="pc-cards">
        ${exampleCard('Roteiro', 'ds-result-card', 'Seções com carimbo, como no painel. Ação principal com seta.', thread(messageHtml({ role: 'assistant', actions: false, text: 'Montei um roteiro curto, em três cenas.', card: roteiroCard() })))}
        ${exampleCard('Resumo', 'ds-result-card__text', 'Texto curto em muted. Uma ação, para levar o resultado adiante.', thread(messageHtml({ role: 'assistant', actions: false, text: 'Em três frases:', card: summaryCard() })))}
        ${exampleCard('Arquivo gerado', 'ds-attachment', 'O arquivo é uma pílula de anexo; baixar e ver prévia são ações inline.', thread(messageHtml({ role: 'assistant', actions: false, text: 'Exportei os tokens do tema escuro.', card: fileCard() })))}
      </div>`,
    )}

    ${section(
      'composer',
      'Composer',
      'A caixa de mensagem: comando e anexos em cima, o campo no meio, ferramentas e o enviar embaixo. Cresce com o texto até 216 px e depois rola.',
      `<div class="pc-composer-states">
        ${COMPOSER_STATES.map(([name, text, opts]) => `<article class="pc-cstate"><div class="pc-cstate__preview" inert>${composerHtml({ hint: false, ...opts })}</div><p class="pc-example__name">${name}</p><p class="pc-example__text">${text}</p></article>`).join('')}
      </div>`,
    )}

    ${section(
      'comandos',
      'Atalhos com /',
      'Uma barra no começo do campo abre os comandos. O foco não sai do campo: as setas escolhem, Enter confirma, e o comando vira uma pílula antes do texto.',
      `<div class="pc-commands">
        <div class="pc-commands__preview" inert aria-hidden="true">${commandMenuStatic()}</div>
        <div class="pc-commands__tables">
          <div class="doc-table pc-table">
            <div class="doc-table__head" aria-hidden="true"><span>Comando</span><span>O que faz</span></div>
            ${COMMANDS.map((c) => `<div class="doc-table__row"><span class="pc-table__cmd">${icon(c.icon, { size: 16 })}<code>/${c.id}</code></span><span class="pc-table__text">${c.description}</span></div>`).join('')}
          </div>
          <div class="doc-table pc-table">
            <div class="doc-table__head" aria-hidden="true"><span>Tecla</span><span>No composer</span></div>
            ${KEYS.map(([keys, text, joiner]) => `<div class="doc-table__row"><span class="pc-keys">${kbd(keys, joiner)}</span><span class="pc-table__text">${text}</span></div>`).join('')}
          </div>
        </div>
      </div>`,
    )}

    ${section(
      'estados',
      'Estados',
      'Cada estado diz o que está acontecendo e qual é o próximo passo. Nada some sem aviso.',
      `<div class="pc-examples">${STATES.map(([name, text, preview]) => exampleCard(name, '', text, preview)).join('')}</div>`,
    )}

    ${section(
      'escrita',
      'Escrita',
      'A resposta é interface. Escreva como o resto do produto: curto, direto, em português do Brasil.',
      `<div class="pc-writing">
        ${[
          ['Responda primeiro', 'São três passos: cores, tipografia e componentes.', 'Ótima pergunta! Vamos explorar juntos esse tema tão interessante…'],
          ['Frases curtas, voz ativa', 'Troque o hue da marca e rode o build.', 'O hue da marca pode ser trocado, e em seguida o build deverá ser executado.'],
          ['Diga quando não sabe', 'Não encontrei esse dado no arquivo. Quer que eu procure em outro?', 'O faturamento foi de R$ 1,2 mi. (sem fonte)'],
          ['Lista só com três ou mais', 'Abra o arquivo e mude o hue.', '• Abra o arquivo\n• Mude o hue'],
          ['Termos da tela', 'Clique em Exportar tokens.', 'Acione a funcionalidade de exportação de design tokens.'],
          ['Um próximo passo, no fim', 'Quer que eu monte o roteiro?', 'Posso ajudar com mais alguma coisa? Estou aqui para o que precisar!'],
        ]
          .map(
            ([title, good, bad]) => `<article class="pc-rule">
              <p class="pc-rule__title">${title}</p>
              <p class="pc-rule__line pc-rule__line--do">${icon('check', { size: 16 })}<span>${escapeHtml(good)}</span></p>
              <p class="pc-rule__line pc-rule__line--dont">${icon('x', { size: 16 })}<span>${escapeHtml(bad).replace(/\n/g, '<br>')}</span></p>
            </article>`,
          )
          .join('')}
      </div>`,
    )}

    ${section(
      'acessibilidade',
      'Acessibilidade',
      'A conversa se lê e se usa inteira pelo teclado e por leitor de tela.',
      a11yList([
        ['Conversa como log', 'A lista de mensagens tem <code class="ds-inline-code">role="log"</code> e <code class="ds-inline-code">aria-live="polite"</code>: respostas novas são lidas sem roubar o foco.'],
        ['Resposta lida inteira', 'Enquanto chega, a resposta fica com <code class="ds-inline-code">aria-busy="true"</code>, e o leitor espera terminar em vez de ler palavra por palavra.'],
        ['Foco fica no composer', 'Depois de enviar, o foco continua no campo, pronto para a próxima pergunta.'],
        ['Campo com rótulo', 'O campo tem rótulo (pode ser visualmente oculto) e <code class="ds-inline-code">aria-describedby</code> aponta para os atalhos.'],
        ['Comandos pelo teclado', 'A lista de comandos usa <code class="ds-inline-code">aria-activedescendant</code>: o foco não sai do campo e as setas escolhem.', ['/', '↑', '↓', 'Enter']],
        ['Parar sem mouse', 'Esc para a resposta, e o enviar passa a se chamar “Parar resposta”.', ['Esc']],
        ['Ações sempre alcançáveis', 'As ações de cada resposta aparecem no hover e no foco, e ficam sempre visíveis em telas de toque e na última resposta.'],
        ['Movimento reduzido', 'Com <code class="ds-inline-code">prefers-reduced-motion</code>, a resposta aparece de uma vez e os pontos de “escrevendo” param.'],
      ]),
    )}

    ${section(
      'tokens',
      'Tokens',
      'Clique no nome para copiar a variável.',
      tokenTable([
        ['color.bg.raised', 'Balão da pergunta e composer'],
        ['color.bg.surface', 'Cartão de resultado'],
        ['color.border.subtle', 'Contorno do balão e do cartão'],
        ['color.border.control', 'Composer e anexos'],
        ['color.border.focus', 'Composer em foco'],
        ['color.fg.default', 'Texto da conversa'],
        ['color.fg.muted', 'Texto do cartão'],
        ['color.fg.subtle', 'Autor, hora, placeholder e atalhos'],
        ['color.brand.solid', 'Enviar'],
        ['color.brand.on-solid', 'Ícone do enviar'],
        ['color.brand.subtle', 'Marca do autor e comando escolhido'],
        ['color.brand.fg', 'Letra da marca e do comando'],
        ['color.danger.fg', 'Falha ao enviar e limite passado'],
        ['radius.xl', 'Balão e cartão'],
        ['radius.2xl', 'Composer'],
        ['space.400', 'Entre mensagens'],
      ]),
    )}

    ${section(
      'codigo',
      'Código',
      'O CSS vem em <code class="ds-inline-code">ds/ds.css</code>; o comportamento, em <code class="ds-inline-code">ds/js/composer.js</code>.',
      `<div class="pc-code">
        ${codeBlock(`<div class="ds-thread" role="log" aria-live="polite" aria-label="Conversa">
  <article class="ds-message ds-message--user">
    <div class="ds-message__body"><p>Monte um roteiro</p></div>
    <p class="ds-message__meta">Enviada · <time>14:32</time></p>
  </article>
  <article class="ds-message">
    <header class="ds-message__head">
      <span class="ds-message__mark" aria-hidden="true">Ó</span>
      <span class="ds-message__author">Órbita</span><time>14:32</time>
    </header>
    <div class="ds-message__body"><p>Montei um roteiro em três cenas.</p></div>
    <section class="ds-result-card">…</section>
    <div class="ds-message__actions">…ds-icon-btn ds-icon-btn--sm…</div>
  </article>
</div>

<div id="composer"></div>`)}
        ${codeBlock(`import { createComposer } from './ds/js/composer.js';

const composer = createComposer(document.querySelector('#composer'), {
  label: 'Mensagem para o Órbita',
  commands: [{ id: 'resumir', label: 'Resumir', description: 'Resume em três frases', icon: 'file-text' }],
  maxLength: 2000,
  onSend({ text, attachments, command }) {
    // envie; devolva false para manter o texto no campo
  },
  onStop() {
    // cancele a resposta em andamento
  },
});

composer.setBusy(true);   // enviar vira "parar"
composer.focus();`)}
      </div>`,
    )}

    ${section(
      'uso',
      'Uso',
      '',
      `<div class="usage-grid">
        ${[
          ['do', 'check-circle', 'Balão só na pergunta', 'O balão marca quem pergunta; a resposta é texto de leitura, com espaço para respirar.'],
          ['dont', 'x-circle', 'Cor em todo balão', 'Nada de balões coloridos ou degradês. A única cor da conversa é o enviar.'],
          ['do', 'check-circle', 'Cartão para o que dá para usar', 'Roteiros, resumos e arquivos viram cartão com ações. Conversa comum fica em texto.'],
          ['dont', 'x-circle', 'Ações gritando em toda mensagem', 'Copiar e avaliar aparecem no hover e no foco; ficam fixas só na última resposta e no toque.'],
          ['tip', 'zap', 'Comece com sugestões', 'Na conversa vazia, três sugestões concretas ensinam o que dá para pedir.'],
          ['dont', 'x-circle', 'Enter que não envia', 'Enter envia, Shift + Enter quebra linha. Não inverta, e não envie no meio de um acento (IME).'],
        ]
          .map(([kind, ic, title, text]) => `<article class="usage-card usage-card--${kind}"><p class="usage-card__head">${icon(ic, { size: 18 })}${title}</p><p class="usage-card__text">${text}</p></article>`)
          .join('')}
      </div>`,
    )}
  </div>`;
}

export function mount(root) {
  const cleanups = [
    mountDocNav(root),
    mountCodeCopy(root),
    mountPlayground(root, {
      id: 'conversa',
      controls: [
        {
          id: 'reply',
          label: 'Resposta',
          value: 'card',
          options: [
            { value: 'card', label: 'Texto e cartão', icon: 'card' },
            { value: 'text', label: 'Só texto', icon: 'type' },
            { value: 'error', label: 'Falha no envio', icon: 'alert-circle' },
          ],
        },
        {
          id: 'speed',
          label: 'Escrita',
          value: 'stream',
          options: [
            { value: 'stream', label: 'Aos poucos', icon: 'play' },
            { value: 'instant', label: 'De uma vez', icon: 'zap' },
          ],
        },
      ],
      render: demoMarkup,
      mount: mountDemo,
      code: demoCode,
    }),
  ];
  return () => cleanups.forEach((fn) => fn?.());
}
