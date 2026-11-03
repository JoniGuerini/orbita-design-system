import { icon } from '../../ds/icons/icons.js';
import { toast, copyText } from '../../ds/js/toast.js';
import { createComposer, composerHtml, messageHtml, typingHtml, streamText, attachmentHtml } from '../../ds/js/composer.js';
import { dateFormat, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/padroes-conversa.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

/* o id é o que aparece depois da barra (/roteiro, /script…); a chave decide a resposta simulada */
const COMMANDS = () => [
  { key: 'roteiro', id: L('roteiro', 'script', 'guion'), label: L('Criar roteiro', 'Write a script', 'Crear guion'), description: L('Monta um roteiro em cenas', 'Builds a script in scenes', 'Arma un guion en escenas'), icon: 'list' },
  { key: 'resumir', id: L('resumir', 'summarize', 'resumir'), label: L('Resumir', 'Summarize', 'Resumir'), description: L('Resume um texto em três frases', 'Sums up a text in three sentences', 'Resume un texto en tres frases'), icon: 'file-text' },
  { key: 'traduzir', id: L('traduzir', 'translate', 'traducir'), label: L('Traduzir', 'Translate', 'Traducir'), description: L('Traduz para inglês', 'Translates into Portuguese', 'Traduce al inglés'), icon: 'globe' },
  { key: 'tom', id: L('tom', 'tone', 'tono'), label: L('Mudar o tom', 'Change the tone', 'Cambiar el tono'), description: L('Reescreve mais direto', 'Rewrites it more directly', 'Lo reescribe más directo'), icon: 'pencil' },
];
const commandKey = (id) => COMMANDS().find((c) => c.id === id)?.key ?? id;

const SUGGESTIONS = () => {
  const [script, summary] = COMMANDS();
  return [
    ['list', L('Crie um roteiro de 3 cenas', 'Write a 3-scene script', 'Crea un guion de 3 escenas'), script.id],
    ['file-text', L('Resuma o que é o Lume', 'Sum up what Lume is', 'Resume qué es Lume'), summary.id],
    ['palette', L('Por onde começo os tokens?', 'Where do I start with tokens?', '¿Por dónde empiezo los tokens?'), null],
  ];
};

const KEYS = () => [
  [['Enter'], L('Envia a mensagem', 'Sends the message', 'Envía el mensaje')],
  [['Shift', 'Enter'], L('Quebra a linha', 'Adds a line break', 'Salto de línea')],
  [['/'], L('No começo do campo, abre os comandos', 'At the start of the field, opens the commands', 'Al principio del campo, abre los comandos')],
  [['↑', '↓'], L('Percorrem os comandos', 'Move through the commands', 'Recorren los comandos')],
  [['Enter', 'Tab'], L('Escolhem o comando', 'Pick the command', 'Eligen el comando'), L('ou', 'or', 'o')],
  [['Esc'], L('Fecha os comandos; com a resposta chegando, para a resposta', 'Closes the commands; while a reply is arriving, stops the reply', 'Cierra los comandos; con la respuesta llegando, detiene la respuesta')],
  [['Backspace'], L('No começo do campo, remove o comando escolhido', 'At the start of the field, removes the chosen command', 'Al principio del campo, quita el comando elegido')],
];

const kbd = (keys, joiner = '+') => keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join(` <span class="pc-keys__join">${joiner}</span> `);
const now = () => dateFormat({ hour: '2-digit', minute: '2-digit' }).format(new Date());
const placeholder = () => L('Pergunte algo ou digite / para comandos', 'Ask something or type / for commands', 'Pregunta algo o escribe / para comandos');
const composerLabel = () => L('Mensagem para o Lume', 'Message to Lume', 'Mensaje para Lume');
const askShort = () => L('Pergunte ou digite /', 'Ask or type /', 'Pregunta o escribe /');

/* ───────── Cartões de resultado ───────── */

const tools = (label) => `<div class="ds-result-card__tools">
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-action="copy-card" aria-label="${L(`Copiar ${label}`, `Copy ${label}`, `Copiar ${label}`)}" data-ds-tooltip="${L('Copiar', 'Copy', 'Copiar')}">${icon('copy', { size: 16 })}</button>
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" aria-label="${L('Mais opções', 'More options', 'Más opciones')}" data-ds-tooltip="${L('Mais opções', 'More options', 'Más opciones')}">${icon('more-horizontal', { size: 16 })}</button>
  </div>`;

const SCENES = () => [
  ['01', L('Abertura', 'Opening', 'Apertura'), L('Tela escura. O nome Lume aparece, sem enfeite.', 'Dark screen. The name Lume appears, no frills.', 'Pantalla oscura. El nombre Lume aparece, sin adornos.')],
  ['02', L('O problema', 'The problem', 'El problema'), L('Três telas do mesmo produto, cada uma de um jeito.', 'Three screens of the same product, each one different.', 'Tres pantallas del mismo producto, cada una distinta.')],
  ['03', L('A virada', 'The turn', 'El giro'), L('Um token muda e todas as telas mudam juntas.', 'One token changes and every screen changes with it.', 'Un token cambia y todas las pantallas cambian juntas.')],
];

function roteiroCard(title = L('Lançamento do Lume 0.2', 'Lume 0.2 launch', 'Lanzamiento de Lume 0.2')) {
  return `<section class="ds-result-card" aria-label="${L('Roteiro', 'Script', 'Guion')}: ${escapeHtml(title)}">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">${L('Roteiro · 3 cenas · ~45 s', 'Script · 3 scenes · ~45 s', 'Guion · 3 escenas · ~45 s')}</p><p class="ds-result-card__title">${escapeHtml(title)}</p></div>
      ${tools(L('roteiro', 'script', 'guion'))}
    </header>
    <ol class="ds-result-card__list" role="list">
      ${SCENES().map(([n, name, text]) => `<li><p class="ds-section__head"><span class="ds-section__stamp">${n}</span><span>${name}</span></p><p class="ds-section__text">${text}</p></li>`).join('')}
    </ol>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action" data-action="open">${L('Abrir no editor', 'Open in the editor', 'Abrir en el editor')}${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
      <button type="button" class="ds-inline-action" data-action="copy-card">${icon('copy', { size: 16 })}${L('Copiar roteiro', 'Copy script', 'Copiar guion')}</button>
    </div>
  </section>`;
}

function summaryCard() {
  return `<section class="ds-result-card" aria-label="${L('Resumo em três frases', 'Three-sentence summary', 'Resumen en tres frases')}">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">${L('Resumo · 3 frases', 'Summary · 3 sentences', 'Resumen · 3 frases')}</p><p class="ds-result-card__title">${L('O Lume em poucas palavras', 'Lume in a few words', 'Lume en pocas palabras')}</p></div>
      ${tools(L('resumo', 'summary', 'resumen'))}
    </header>
    <p class="ds-result-card__text">${L('Design system escuro e quente, com tokens em OKLCH. Os componentes só consomem tokens semânticos. Tema claro e escuro, contraste verificado e teclado em tudo.', 'A dark, warm design system with OKLCH tokens. Components only consume semantic tokens. Light and dark themes, checked contrast, and keyboard support everywhere.', 'Design system oscuro y cálido, con tokens en OKLCH. Los componentes solo consumen tokens semánticos. Tema claro y oscuro, contraste verificado y teclado en todo.')}</p>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action" data-action="open">${L('Usar como descrição', 'Use as description', 'Usar como descripción')}${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
    </div>
  </section>`;
}

function stepsCard() {
  return `<section class="ds-result-card" aria-label="${L('Próximos passos', 'Next steps', 'Próximos pasos')}">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">${L('Próximos passos · 3', 'Next steps · 3', 'Próximos pasos · 3')}</p><p class="ds-result-card__title">${L('Começando pelos tokens', 'Starting with the tokens', 'Empezando por los tokens')}</p></div>
      ${tools(L('passos', 'steps', 'pasos'))}
    </header>
    <ol class="ds-result-card__list" role="list">
      <li><p class="ds-section__head"><span class="ds-section__stamp">01</span><span>${L('Cores', 'Color', 'Colores')}</span></p><p class="ds-section__text">${L('Troque o tom da marca em tokens/palettes.json.', 'Change the brand hue in tokens/palettes.json.', 'Cambia el tono de la marca en tokens/palettes.json.')}</p></li>
      <li><p class="ds-section__head"><span class="ds-section__stamp">02</span><span>${L('Tipografia', 'Typography', 'Tipografía')}</span></p><p class="ds-section__text">${L('Use os 19 estilos de texto, nunca tamanhos soltos.', 'Use the 19 text styles, never loose sizes.', 'Usa los 19 estilos de texto, nunca tamaños sueltos.')}</p></li>
      <li><p class="ds-section__head"><span class="ds-section__stamp">03</span><span>${L('Componentes', 'Components', 'Componentes')}</span></p><p class="ds-section__text">${L('Consuma só tokens semânticos nos estilos.', 'Consume only semantic tokens in the styles.', 'Consume solo tokens semánticos en los estilos.')}</p></li>
    </ol>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action" data-action="open">${L('Abrir Primeiros passos', 'Open Getting started', 'Abrir Primeros pasos')}${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
    </div>
  </section>`;
}

function fileCard() {
  return `<section class="ds-result-card" aria-label="${L('Arquivo gerado', 'Generated file', 'Archivo generado')}">
    <header class="ds-result-card__head">
      <div><p class="ds-result-card__eyebrow">${L('Arquivo · CSV', 'File · CSV', 'Archivo · CSV')}</p><p class="ds-result-card__title">${L('Tokens de cor, tema escuro', 'Color tokens, dark theme', 'Tokens de color, tema oscuro')}</p></div>
      ${tools(L('arquivo', 'file', 'archivo'))}
    </header>
    <div>${attachmentHtml({ name: L('tokens-escuro.csv', 'tokens-dark.csv', 'tokens-oscuro.csv'), size: 18640, type: 'text/csv' })}</div>
    <div class="ds-result-card__actions">
      <button type="button" class="ds-inline-action">${icon('download', { size: 16 })}${L('Baixar', 'Download', 'Descargar')}</button>
      <button type="button" class="ds-inline-action">${L('Ver prévia', 'Preview', 'Ver vista previa')}${icon('arrow-right', { size: 16, className: 'ds-inline-action__arrow' })}</button>
    </div>
  </section>`;
}

/* ───────── Respostas simuladas ───────── */

const short = (s, n = 60) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const KEYWORDS = [
  ['roteiro', ['roteiro', 'script', 'guion']],
  ['resumir', ['resum', 'summar', 'sum up']],
  ['traduzir', ['tradu', 'transl']],
  ['tom', ['tom', 'tone', 'tono']],
];

function replyFor({ text, command, attachments }, mode, variant = 0) {
  const t = text.toLowerCase();
  const n = attachments.length;
  const read = n ? [n === 1 ? L(`Li o arquivo ${attachments[0].name}.`, `I read the file ${attachments[0].name}.`, `Leí el archivo ${attachments[0].name}.`) : L(`Li os ${n} arquivos.`, `I read the ${n} files.`, `Leí los ${n} archivos.`)] : [];
  const withCard = mode !== 'text';
  const key = command ? commandKey(command) : KEYWORDS.find(([, words]) => words.some((w) => t.includes(w)))?.[0] ?? null;
  const alt = variant % 2 === 1;
  switch (key) {
    case 'roteiro':
      return {
        paragraphs: [...read, alt ? L('Outra versão, mais curta: três cenas de 15 segundos.', 'Another version, shorter: three 15-second scenes.', 'Otra versión, más corta: tres escenas de 15 segundos.') : L('Montei um roteiro curto, em três cenas. Cada uma cabe em até 20 segundos.', 'I put together a short script in three scenes. Each fits in up to 20 seconds.', 'Armé un guion corto, en tres escenas. Cada una cabe en hasta 20 segundos.')],
        card: withCard ? roteiroCard(alt ? L('Lume 0.2 em 45 segundos', 'Lume 0.2 in 45 seconds', 'Lume 0.2 en 45 segundos') : undefined) : '',
      };
    case 'resumir':
      return {
        paragraphs: [
          ...read,
          L('Em três frases:', 'In three sentences:', 'En tres frases:'),
          L('O Lume é um design system escuro e quente, com tokens gerados em OKLCH. Os componentes consomem só tokens semânticos, então a marca muda trocando uma cor. Tudo tem tema claro e escuro, contraste verificado e teclado.', 'Lume is a dark, warm design system with tokens generated in OKLCH. Components only consume semantic tokens, so the brand changes by swapping one color. Everything has light and dark themes, checked contrast, and keyboard support.', 'Lume es un design system oscuro y cálido, con tokens generados en OKLCH. Los componentes solo consumen tokens semánticos, así que la marca cambia cambiando un color. Todo tiene tema claro y oscuro, contraste verificado y teclado.'),
        ],
        card: withCard ? summaryCard() : '',
      };
    case 'traduzir':
      return {
        paragraphs: [
          ...read,
          L('Em inglês:', 'In Portuguese:', 'En inglés:'),
          L('“Build with refinement. Every screen starts consistent, accessible and carefully detailed.”', '“Construa com refinamento. Cada tela começa consistente, acessível e cuidadosamente detalhada.”', '“Build with refinement. Every screen starts consistent, accessible and carefully detailed.”'),
        ],
        card: '',
      };
    case 'tom':
      return { paragraphs: [...read, L('Mais direto:', 'More direct:', 'Más directo:'), L('“Comece agora: tokens, componentes e gráficos prontos para usar.”', '“Start now: tokens, components, and charts ready to use.”', '“Empieza ya: tokens, componentes y gráficos listos para usar.”')], card: '' };
    default:
      return {
        paragraphs: [
          ...read,
          text ? L(`Sobre “${short(text)}”:`, `About “${short(text)}”:`, `Sobre “${short(text)}”:`) : L('Recebi.', 'Got it.', 'Recibido.'),
          alt
            ? L('Outro caminho: comece pelos componentes que você mais usa e ajuste os tokens conforme aparecerem.', 'Another route: start with the components you use most and adjust the tokens as they come up.', 'Otro camino: empieza por los componentes que más usas y ajusta los tokens a medida que aparezcan.')
            : L('Eu começaria por três coisas: as cores da marca, a tipografia e os componentes que você mais usa. Quer que eu monte um roteiro com isso?', 'I’d start with three things: the brand colors, the typography, and the components you use most. Want me to put together a script with that?', 'Empezaría por tres cosas: los colores de la marca, la tipografía y los componentes que más usas. ¿Quieres que arme un guion con eso?'),
        ],
        card: withCard ? stepsCard() : '',
      };
  }
}

/* ───────── Demo ao vivo ───────── */

function demoMarkup() {
  return `<div class="pc-demo">
    <header class="pc-demo__head">
      <div><p class="ds-panel__eyebrow">${L('Assistente', 'Assistant', 'Asistente')}</p><p class="pc-demo__title">${L('Nova conversa', 'New conversation', 'Nueva conversación')}</p></div>
      <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-demo-reset aria-label="${L('Começar outra conversa', 'Start another conversation', 'Empezar otra conversación')}" data-ds-tooltip="${L('Nova conversa', 'New conversation', 'Nueva conversación')}">${icon('plus', { size: 20 })}</button>
    </header>
    <div class="pc-demo__scroll" data-scroll>
      <div class="pc-welcome" data-welcome>
        <span class="ds-message__mark pc-welcome__mark" aria-hidden="true">L</span>
        <p class="pc-welcome__title">${L('Como posso ajudar?', 'How can I help?', '¿Cómo puedo ayudar?')}</p>
        <p class="pc-welcome__text">${L('Pergunte em português, anexe um arquivo ou digite <kbd class="ds-kbd">/</kbd> para ver os comandos.', 'Ask in English, attach a file, or type <kbd class="ds-kbd">/</kbd> to see the commands.', 'Pregunta en español, adjunta un archivo o escribe <kbd class="ds-kbd">/</kbd> para ver los comandos.')}</p>
        <div class="ds-suggestions">
          ${SUGGESTIONS().map(([glyph, label, cmd]) => `<button type="button" class="ds-chip ds-chip--sm" data-suggest="${escapeHtml(label)}"${cmd ? ` data-command="${cmd}"` : ''}><span class="ds-chip__icon">${icon(glyph, { size: 14 })}</span>${label}</button>`).join('')}
        </div>
      </div>
      <div class="ds-thread" role="log" aria-live="polite" aria-relevant="additions" aria-label="${L('Conversa', 'Conversation', 'Conversación')}" data-thread></div>
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
    label: composerLabel(),
    placeholder: placeholder(),
    commands: COMMANDS(),
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
        say(L('A mensagem não foi enviada. Use Tentar de novo.', 'The message wasn’t sent. Use Try again.', 'El mensaje no se envió. Usa Intentar de nuevo.'));
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
      meta: interrupted ? L('Resposta interrompida.', 'Reply interrupted.', 'Respuesta interrumpida.') : undefined,
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
    if (phase === 'typing') el.querySelector('[data-body]').innerHTML = `<p class="pc-muted">${L('Parei antes de começar.', 'I stopped before starting.', 'Me detuve antes de empezar.')}</p>`;
    finish(el, payload, { paragraphs: [el.querySelector('[data-body]').textContent], card: '' }, 0, { interrupted: true });
    say(L('Resposta interrompida.', 'Reply interrupted.', 'Respuesta interrumpida.'));
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

  const copied = (what) => (what === 'card' ? L('Cartão copiado', 'Card copied', 'Tarjeta copiada') : L('Resposta copiada', 'Reply copied', 'Respuesta copiada'));

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
      navigator.clipboard?.writeText(text).then(() => toast(copied('reply'), { icon: 'check' }), () => copyText(text, copied('reply')));
      if (!navigator.clipboard) copyText(text, copied('reply'));
    } else if (action === 'copy-card') {
      const card = btn.closest('.ds-result-card');
      const text = card ? card.innerText.trim() : '';
      navigator.clipboard?.writeText(text).then(() => toast(copied('card'), { icon: 'check' }), () => copyText(text, copied('card')));
    } else if (action === 'retry') {
      if (pending) return;
      respond(msg._payload ?? { text: '', attachments: [] }, msg, (msg._variant ?? 0) + 1);
    } else if (action === 'like' || action === 'dislike') {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      msg.querySelectorAll('[data-action="like"], [data-action="dislike"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', String(on));
      say(on ? L('Obrigado pela avaliação.', 'Thanks for the feedback.', 'Gracias por la valoración.') : L('Avaliação removida.', 'Feedback removed.', 'Valoración eliminada.'));
    } else if (action === 'resend') {
      const payload = msg._payload;
      msg.remove();
      send(payload, { retry: true });
      composer.focus();
    } else if (action === 'open') {
      toast(L('No app, isto abriria o resultado', 'In the app, this would open the result', 'En la app, esto abriría el resultado'), { icon: 'external-link' });
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
  const [script, summary] = COMMANDS();
  const cmd = (c) => `{ id: '${c.id}', label: '${c.label}', description: '${c.description}', icon: '${c.icon}' }`;
  return `import { createComposer, messageHtml, typingHtml, streamText } from './ds/js/composer.js';

const thread = document.querySelector('.ds-thread');   // role="log" aria-live="polite"

const composer = createComposer(document.querySelector('#composer'), {
  label: '${composerLabel()}',
  placeholder: '${placeholder()}',
  maxLength: 2000,
  commands: [
    ${cmd(script)},
    ${cmd(summary)},
  ],
  async onSend({ text, attachments, command }) {
    thread.insertAdjacentHTML('beforeend', messageHtml({ role: 'user', text, attachments }));
    ${state.reply === 'error' ? `// ${L('falhou? mostre o erro na própria mensagem, com "Tentar de novo"', 'failed? show the error on the message itself, with "Try again"', '¿falló? muestra el error en el propio mensaje, con "Intentar de nuevo"')}
    // messageHtml({ role: 'user', text, status: 'error' })
    ` : ''}composer.setBusy(true);                       // ${L('enviar vira "parar"; Esc também para', 'send becomes "stop"; Esc stops too', 'enviar se vuelve "detener"; Esc también detiene')}
    thread.insertAdjacentHTML('beforeend', messageHtml({ html: typingHtml(), busy: true, actions: false }));
    const body = thread.lastElementChild.querySelector('[data-body]');
    body.innerHTML = '';
    await streamText(body, await ${L('pedirResposta', 'fetchReply', 'pedirRespuesta')}(text, command)${state.speed === 'instant' ? ', { delay: 0 }' : ''});
    thread.lastElementChild.removeAttribute('aria-busy');
    composer.setBusy(false);
  },
  onStop() { /* ${L('cancele a requisição e marque "Resposta interrompida."', 'cancel the request and mark "Reply interrupted."', 'cancela la solicitud y marca "Respuesta interrumpida."')} */ },
});`;
}

/* ───────── Exemplos estáticos ───────── */

const thread = (inner, cls = '') => `<div class="ds-thread ${cls}" inert>${inner}</div>`;
const askSummary = () => L('Resuma o que é o Lume', 'Sum up what Lume is', 'Resume qué es Lume');
const scriptReply = () => L('Montei um roteiro curto, em três cenas. Cada uma cabe em até 20 segundos.', 'I put together a short script in three scenes. Each fits in up to 20 seconds.', 'Armé un guion corto, en tres escenas. Cada una cabe en hasta 20 segundos.');

const BALLOONS = () => [
  [
    L('Pergunta', 'Question', 'Pregunta'),
    'ds-message--user',
    L('Balão sólido, à direita. O canto de baixo, mais fechado, aponta quem falou.', 'A solid bubble, on the right. The tighter bottom corner points to who spoke.', 'Burbuja sólida, a la derecha. La esquina de abajo, más cerrada, señala quién habló.'),
    messageHtml({ role: 'user', text: L('Monte um roteiro para o lançamento da versão 0.2', 'Write a script for the version 0.2 launch', 'Arma un guion para el lanzamiento de la versión 0.2'), time: '14:32' }),
  ],
  [
    L('Resposta', 'Reply', 'Respuesta'),
    'ds-message',
    L('Sem balão: texto de leitura de até 68 caracteres por linha, com autor e hora em cima.', 'No bubble: reading text of up to 68 characters per line, with author and time above.', 'Sin burbuja: texto de lectura de hasta 68 caracteres por línea, con autor y hora arriba.'),
    messageHtml({ role: 'assistant', time: '14:32', text: scriptReply(), latest: true }),
  ],
  [
    L('Com anexos', 'With attachments', 'Con adjuntos'),
    'ds-message__attachments',
    L('Anexos vêm antes do texto, em pílulas com tipo, nome e tamanho.', 'Attachments come before the text, in pills with type, name, and size.', 'Los adjuntos vienen antes del texto, en píldoras con tipo, nombre y tamaño.'),
    messageHtml({ role: 'user', text: L('Resuma esses dois arquivos', 'Summarize these two files', 'Resume estos dos archivos'), attachments: [{ name: 'briefing.pdf', size: 248000 }, { name: L('tela-inicial.png', 'home-screen.png', 'pantalla-inicial.png'), size: 1320000, type: 'image/png' }] }),
  ],
  [
    L('Lista e código', 'List and code', 'Lista y código'),
    'ds-message__body',
    L('Listas só a partir de três itens. Código curto entra inline.', 'Lists only from three items. Short code goes inline.', 'Listas solo a partir de tres elementos. El código corto va en línea.'),
    messageHtml({
      role: 'assistant',
      actions: false,
      html: L(
        '<p>Para trocar a marca:</p><ol><li>Abra <code>tokens/palettes.json</code>.</li><li>Mude o <code>hue</code> de <code>brand</code>.</li><li>Rode <code>npm run tokens</code>.</li></ol>',
        '<p>To change the brand:</p><ol><li>Open <code>tokens/palettes.json</code>.</li><li>Change the <code>hue</code> of <code>brand</code>.</li><li>Run <code>npm run tokens</code>.</li></ol>',
        '<p>Para cambiar la marca:</p><ol><li>Abre <code>tokens/palettes.json</code>.</li><li>Cambia el <code>hue</code> de <code>brand</code>.</li><li>Ejecuta <code>npm run tokens</code>.</li></ol>',
      ),
    }),
  ],
  [
    L('Divisor e aviso', 'Divider and notice', 'Divisor y aviso'),
    'ds-thread__divider',
    L('O divisor separa dias; o aviso do sistema fica centrado e apagado, sem balão.', 'The divider separates days; the system notice is centered and muted, with no bubble.', 'El divisor separa días; el aviso del sistema queda centrado y atenuado, sin burbuja.'),
    `<p class="ds-thread__divider">${L('Hoje', 'Today', 'Hoy')}</p><p class="ds-thread__notice">${L('Ana Souza entrou na conversa.', 'Ana Souza joined the conversation.', 'Ana Souza se unió a la conversación.')}</p>`,
  ],
  [L('Escrevendo', 'Typing', 'Escribiendo'), 'ds-typing', L('Três pontos e um texto curto. Com movimento reduzido, os pontos ficam parados.', 'Three dots and a short text. With reduced motion, the dots stay still.', 'Tres puntos y un texto corto. Con movimiento reducido, los puntos quedan quietos.'), messageHtml({ role: 'assistant', actions: false, html: typingHtml(), busy: false })],
];

const STATES = () => [
  [
    L('Primeira mensagem', 'First message', 'Primer mensaje'),
    L('Conversa vazia: um convite curto e três sugestões concretas, que ensinam o que dá para pedir.', 'An empty conversation: a short invitation and three concrete suggestions that teach what you can ask for.', 'Conversación vacía: una invitación corta y tres sugerencias concretas, que enseñan qué se puede pedir.'),
    `<div class="pc-welcome pc-welcome--static">
      <span class="ds-message__mark pc-welcome__mark" aria-hidden="true">L</span>
      <p class="pc-welcome__title">${L('Como posso ajudar?', 'How can I help?', '¿Cómo puedo ayudar?')}</p>
      <div class="ds-suggestions">${SUGGESTIONS().map(([glyph, label]) => `<span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon(glyph, { size: 14 })}</span>${label}</span>`).join('')}</div>
    </div>`,
  ],
  [
    L('Respondendo', 'Replying', 'Respondiendo'),
    L('A resposta chega com os pontos de “escrevendo”. O enviar vira parar.', 'The reply arrives with the “typing” dots. Send becomes stop.', 'La respuesta llega con los puntos de “escribiendo”. Enviar se vuelve detener.'),
    thread(`${messageHtml({ role: 'user', text: askSummary(), time: '14:32' })}${messageHtml({ role: 'assistant', actions: false, html: typingHtml() })}`),
  ],
  [
    L('Erro ao enviar', 'Send error', 'Error al enviar'),
    L('O texto fica na tela, com o motivo e um jeito de seguir. Nada some.', 'The text stays on screen, with the reason and a way forward. Nothing disappears.', 'El texto queda en pantalla, con el motivo y una forma de seguir. Nada desaparece.'),
    thread(messageHtml({ role: 'user', text: askSummary(), status: 'error' })),
  ],
  [
    L('Resposta interrompida', 'Interrupted reply', 'Respuesta interrumpida'),
    L('O que já chegou fica. Uma linha diz que parou; as ações continuam valendo.', 'What already arrived stays. A line says it stopped; the actions still work.', 'Lo que ya llegó queda. Una línea dice que se detuvo; las acciones siguen valiendo.'),
    thread(messageHtml({ role: 'assistant', time: '14:33', text: L('Eu começaria por três coisas: as cores da marca, a tipografia e', 'I’d start with three things: the brand colors, the typography, and', 'Empezaría por tres cosas: los colores de la marca, la tipografía y'), meta: L('Resposta interrompida.', 'Reply interrupted.', 'Respuesta interrumpida.'), latest: true })),
  ],
  [
    L('Limite de caracteres', 'Character limit', 'Límite de caracteres'),
    L('A contagem aparece perto do limite. Passou: borda e número em perigo, e o enviar desliga.', 'The count appears near the limit. Over it: border and number in danger, and send turns off.', 'El conteo aparece cerca del límite. Si pasa: borde y número en peligro, y enviar se desactiva.'),
    `<div inert>${composerHtml({ value: L('Texto longo colado de um documento, passando do limite de caracteres da mensagem…', 'Long text pasted from a document, going past the message character limit…', 'Texto largo pegado de un documento, pasando el límite de caracteres del mensaje…'), maxLength: 72, hint: false, rows: 2 })}</div>`,
  ],
];

const COMPOSER_STATES = () => [
  [L('Vazio', 'Empty', 'Vacío'), L('Placeholder diz o que dá para fazer. Enviar fica desligado.', 'The placeholder says what you can do. Send stays off.', 'El placeholder dice qué se puede hacer. Enviar queda desactivado.'), { placeholder: askShort() }],
  [L('Em foco', 'Focused', 'Con foco'), L('Borda e anel da marca. Cresce com o texto até 216 px, depois rola.', 'Brand border and ring. Grows with the text up to 216 px, then scrolls.', 'Borde y anillo de la marca. Crece con el texto hasta 216 px, después se desplaza.'), { value: L('Monte um roteiro', 'Write a script', 'Arma un guion'), state: 'focus' }],
  [L('Com comando e anexo', 'With command and attachment', 'Con comando y adjunto'), L('O comando vira uma pílula da marca; anexos, pílulas com contorno.', 'The command becomes a brand pill; attachments, outlined pills.', 'El comando se vuelve una píldora de la marca; los adjuntos, píldoras con contorno.'), { value: L('para o lançamento da 0.2', 'for the 0.2 launch', 'para el lanzamiento de la 0.2'), command: COMMANDS()[0], attachments: [{ name: 'briefing.pdf', size: 248000 }] }],
  [L('Respondendo', 'Replying', 'Respondiendo'), L('Enviar vira parar (Esc). Dá para ir escrevendo a próxima.', 'Send becomes stop (Esc). You can keep writing the next one.', 'Enviar se vuelve detener (Esc). Se puede ir escribiendo la siguiente.'), { value: '', busy: true, placeholder: askShort() }],
  [L('Desativado', 'Disabled', 'Desactivado'), L('Só quando não dá para enviar mesmo (sem conexão, sem permissão) — e diga por quê.', 'Only when sending truly isn’t possible (offline, no permission) — and say why.', 'Solo cuando de verdad no se puede enviar (sin conexión, sin permiso) — y di por qué.'), { disabled: true, placeholder: L('Sem conexão', 'Offline', 'Sin conexión') }],
];

const ANATOMY = () => [
  ['1', L('Pergunta', 'Question', 'Pregunta'), L('Balão sólido em bg.raised, à direita.', 'A solid bubble in bg.raised, on the right.', 'Burbuja sólida en bg.raised, a la derecha.')],
  ['2', L('Anexo', 'Attachment', 'Adjunto'), L('Pílula com tipo, nome e tamanho.', 'A pill with type, name, and size.', 'Píldora con tipo, nombre y tamaño.')],
  ['3', L('Autor e hora', 'Author and time', 'Autor y hora'), L('Marca, nome e hora em eyebrow apagado.', 'Mark, name, and time in a muted eyebrow.', 'Marca, nombre y hora en eyebrow atenuado.')],
  ['4', L('Resposta', 'Reply', 'Respuesta'), L('Texto de leitura, sem balão, até 68 caracteres.', 'Reading text, no bubble, up to 68 characters.', 'Texto de lectura, sin burbuja, hasta 68 caracteres.')],
  ['5', L('Cartão de resultado', 'Result card', 'Tarjeta de resultado'), L('O que dá para usar: carimbo, título, conteúdo e ações.', 'What you can use: stamp, title, content, and actions.', 'Lo que se puede usar: sello, título, contenido y acciones.')],
  ['6', L('Ações', 'Actions', 'Acciones'), L('Copiar, gerar de novo e avaliar — no hover e na última resposta.', 'Copy, regenerate, and rate — on hover and on the latest reply.', 'Copiar, generar de nuevo y valorar — con hover y en la última respuesta.')],
  ['7', 'Composer', L('Campo que cresce, anexos e comandos em cima.', 'A growing field, with attachments and commands above.', 'Campo que crece, adjuntos y comandos arriba.')],
  ['8', L('Ferramentas', 'Tools', 'Herramientas'), L('Anexar e comandos, botões de ícone sem fundo.', 'Attach and commands, icon buttons with no background.', 'Adjuntar y comandos, botones de ícono sin fondo.')],
  ['9', L('Enviar', 'Send', 'Enviar'), L('O único ponto de cor. Vira parar enquanto responde.', 'The only spot of color. It becomes stop while replying.', 'El único punto de color. Se vuelve detener mientras responde.')],
];

/* ───────── Página ───────── */

const section = (id, title, desc, body) => `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header"><div><h2 class="doc-section__title" id="${id}-title">${title}</h2>${desc ? `<p class="doc-section__desc">${desc}</p>` : ''}</div></header>
    ${body}
  </section>`;

const NAV = () => [
  ['ao-vivo', L('Ao vivo', 'Live', 'En vivo')],
  ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
  ['baloes', L('Balões', 'Bubbles', 'Burbujas')],
  ['cartao', L('Cartão de resultado', 'Result card', 'Tarjeta de resultado')],
  ['composer', 'Composer'],
  ['comandos', L('Atalhos com /', '/ shortcuts', 'Atajos con /')],
  ['estados', L('Estados', 'States', 'Estados')],
  ['escrita', L('Escrita', 'Writing', 'Escritura')],
  ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
  ['tokens', 'Tokens'],
  ['codigo', L('Código', 'Code', 'Código')],
  ['uso', L('Uso', 'Usage', 'Uso')],
];

function anatomyMarkup() {
  return `<div class="pc-anatomy">
    <div class="pc-anatomy__stage" inert aria-hidden="true">
      <div class="ds-thread">
        <article class="ds-message ds-message--user">
          <div class="ds-message__attachments"><span class="pc-pin-wrap" data-pin="2">${attachmentHtml({ name: 'briefing.pdf', size: 248000 })}</span></div>
          <div class="ds-message__body" data-pin="1"><p>${L('Monte um roteiro para o lançamento da 0.2', 'Write a script for the 0.2 launch', 'Arma un guion para el lanzamiento de la 0.2')}</p></div>
        </article>
        <article class="ds-message" data-latest>
          <header class="ds-message__head" data-pin="3"><span class="ds-message__mark">L</span><span class="ds-message__author">Lume</span><time>14:32</time></header>
          <div class="ds-message__body" data-pin="4"><p>${L('Li o briefing. Montei um roteiro curto, em três cenas.', 'I read the briefing. I put together a short script in three scenes.', 'Leí el briefing. Armé un guion corto, en tres escenas.')}</p></div>
          <div class="pc-pin-block" data-pin="5">${roteiroCard()}</div>
          <div class="ds-message__actions" data-pin="6">
            ${['copy', 'refresh', 'thumbs-up', 'thumbs-down'].map((n) => `<span class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted">${icon(n, { size: 16 })}</span>`).join('')}
          </div>
        </article>
      </div>
      <div class="pc-anatomy__composer" data-pin="7">${composerHtml({ value: '', hint: false, placeholder: placeholder() })}</div>
    </div>
    <ol class="pc-legend" role="list">
      ${ANATOMY().map(([n, name, text]) => `<li><span class="pc-legend__num">${n}</span><div><p class="pc-legend__name">${name}</p><p class="pc-legend__text">${text}</p></div></li>`).join('')}
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
  const options = COMMANDS().map(
    (c, i) => `<div class="ds-composer__option" aria-selected="${i === 0}">${icon(c.icon, { size: 18 })}<span class="ds-composer__option-label">/${c.id}</span><span class="ds-composer__option-desc">${c.description}</span></div>`,
  ).join('');
  return composerHtml({ value: '/', hint: false }).replace(
    /<div class="ds-composer__menu"([^>]*) hidden><\/div>/,
    `<div class="ds-composer__menu"$1><p class="ds-composer__menu-label">${L('Comandos', 'Commands', 'Comandos')}</p>${options}</div>`,
  );
}

export default function renderConversa(page) {
  const keys = KEYS();
  const states = STATES();
  return `
  <div class="page doc pc-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Pergunta em balão, resposta em texto de leitura, resultado em cartão e uma caixa de mensagem que cresce com o texto, aceita anexos e comandos com <kbd class="ds-kbd">/</kbd>.', 'The question in a bubble, the reply as reading text, the result in a card, and a message box that grows with the text and accepts attachments and <kbd class="ds-kbd">/</kbd> commands.', 'Pregunta en burbuja, respuesta en texto de lectura, resultado en tarjeta y una caja de mensaje que crece con el texto y acepta adjuntos y comandos con <kbd class="ds-kbd">/</kbd>.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tipos de mensagem', 'message types', 'tipos de mensaje')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('atalhos', 'shortcuts', 'atajos')}</dt><dd class="doc-stat__value">${keys.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estados', 'states', 'estados')}</dt><dd class="doc-stat__value">${states.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('ponto de cor', 'spot of color', 'punto de color')}</dt><dd class="doc-stat__value">1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'ao-vivo',
      L('Ao vivo', 'Live', 'En vivo'),
      L('Uma conversa de verdade, com respostas simuladas. Envie, digite <kbd class="ds-kbd">/</kbd>, anexe um arquivo, pare uma resposta no meio ou copie o resultado.', 'A real conversation, with simulated replies. Send, type <kbd class="ds-kbd">/</kbd>, attach a file, stop a reply midway, or copy the result.', 'Una conversación de verdad, con respuestas simuladas. Envía, escribe <kbd class="ds-kbd">/</kbd>, adjunta un archivo, detén una respuesta a la mitad o copia el resultado.'),
      playgroundMarkup('conversa', { wide: true }),
    )}

    ${section('anatomia', L('Anatomia', 'Anatomy', 'Anatomía'), L('Nove peças. Só uma tem cor: o enviar. O resto é contorno, superfície e texto.', 'Nine pieces. Only one has color: send. The rest is outline, surface, and text.', 'Nueve piezas. Solo una tiene color: enviar. El resto es contorno, superficie y texto.'), anatomyMarkup())}

    ${section(
      'baloes',
      L('Balões', 'Bubbles', 'Burbujas'),
      L('Quem pergunta ganha balão; quem responde, não. Assim a pergunta se acha de relance e a resposta se lê sem moldura.', 'Whoever asks gets a bubble; whoever replies doesn’t. That way the question is found at a glance and the reply reads without a frame.', 'Quien pregunta recibe burbuja; quien responde, no. Así la pregunta se encuentra de un vistazo y la respuesta se lee sin marco.'),
      `<div class="pc-examples">${BALLOONS().map(([name, code, text, preview]) => exampleCard(name, code, text, thread(preview))).join('')}</div>
      <dl class="pc-specs">
        <div><dt>${L('Balão', 'Bubble', 'Burbuja')}</dt><dd>${L('bg.raised · contorno sutil · raio xl, canto xs', 'bg.raised · subtle outline · xl radius, xs corner', 'bg.raised · contorno sutil · radio xl, esquina xs')}</dd></div>
        <div><dt>${L('Resposta', 'Reply', 'Respuesta')}</dt><dd>${L('text.body-md · 16/28 · até 68 caracteres', 'text.body-md · 16/28 · up to 68 characters', 'text.body-md · 16/28 · hasta 68 caracteres')}</dd></div>
        <div><dt>${L('Entre mensagens', 'Between messages', 'Entre mensajes')}</dt><dd>space.400 · 32 px</dd></div>
        <div><dt>${L('Ações', 'Actions', 'Acciones')}</dt><dd>${L('botões de ícone de 28 px, sem fundo', '28 px icon buttons, no background', 'botones de ícono de 28 px, sin fondo')}</dd></div>
      </dl>`,
    )}

    ${section(
      'cartao',
      L('Cartão de resultado', 'Result card', 'Tarjeta de resultado'),
      L('Quando a resposta é algo para usar — um roteiro, um resumo, um arquivo —, ela vira cartão: carimbo e tipo, título, conteúdo curto e no máximo duas ações. Conversa comum continua em texto.', 'When the reply is something to use — a script, a summary, a file — it becomes a card: stamp and type, title, short content, and at most two actions. Regular conversation stays as text.', 'Cuando la respuesta es algo para usar — un guion, un resumen, un archivo —, se vuelve tarjeta: sello y tipo, título, contenido corto y como máximo dos acciones. La conversación común sigue en texto.'),
      `<div class="pc-cards">
        ${exampleCard(L('Roteiro', 'Script', 'Guion'), 'ds-result-card', L('Seções com carimbo, como no painel. Ação principal com seta.', 'Stamped sections, like in the panel. Main action with an arrow.', 'Secciones con sello, como en el panel. Acción principal con flecha.'), thread(messageHtml({ role: 'assistant', actions: false, text: L('Montei um roteiro curto, em três cenas.', 'I put together a short script in three scenes.', 'Armé un guion corto, en tres escenas.'), card: roteiroCard() })))}
        ${exampleCard(L('Resumo', 'Summary', 'Resumen'), 'ds-result-card__text', L('Texto curto em muted. Uma ação, para levar o resultado adiante.', 'Short muted text. One action, to take the result forward.', 'Texto corto en muted. Una acción, para llevar el resultado adelante.'), thread(messageHtml({ role: 'assistant', actions: false, text: L('Em três frases:', 'In three sentences:', 'En tres frases:'), card: summaryCard() })))}
        ${exampleCard(L('Arquivo gerado', 'Generated file', 'Archivo generado'), 'ds-attachment', L('O arquivo é uma pílula de anexo; baixar e ver prévia são ações inline.', 'The file is an attachment pill; download and preview are inline actions.', 'El archivo es una píldora de adjunto; descargar y ver vista previa son acciones en línea.'), thread(messageHtml({ role: 'assistant', actions: false, text: L('Exportei os tokens do tema escuro.', 'I exported the dark theme tokens.', 'Exporté los tokens del tema oscuro.'), card: fileCard() })))}
      </div>`,
    )}

    ${section(
      'composer',
      'Composer',
      L('A caixa de mensagem: comando e anexos em cima, o campo no meio, ferramentas e o enviar embaixo. Cresce com o texto até 216 px e depois rola.', 'The message box: command and attachments on top, the field in the middle, tools and send at the bottom. It grows with the text up to 216 px and then scrolls.', 'La caja de mensaje: comando y adjuntos arriba, el campo en el medio, herramientas y enviar abajo. Crece con el texto hasta 216 px y después se desplaza.'),
      `<div class="pc-composer-states">
        ${COMPOSER_STATES().map(([name, text, opts]) => `<article class="pc-cstate"><div class="pc-cstate__preview" inert>${composerHtml({ hint: false, ...opts })}</div><p class="pc-example__name">${name}</p><p class="pc-example__text">${text}</p></article>`).join('')}
      </div>`,
    )}

    ${section(
      'comandos',
      L('Atalhos com /', '/ shortcuts', 'Atajos con /'),
      L('Uma barra no começo do campo abre os comandos. O foco não sai do campo: as setas escolhem, Enter confirma, e o comando vira uma pílula antes do texto.', 'A slash at the start of the field opens the commands. Focus doesn’t leave the field: the arrows choose, Enter confirms, and the command becomes a pill before the text.', 'Una barra al principio del campo abre los comandos. El foco no sale del campo: las flechas eligen, Enter confirma y el comando se vuelve una píldora antes del texto.'),
      `<div class="pc-commands">
        <div class="pc-commands__preview" inert aria-hidden="true">${commandMenuStatic()}</div>
        <div class="pc-commands__tables">
          <div class="doc-table pc-table">
            <div class="doc-table__head" aria-hidden="true"><span>${L('Comando', 'Command', 'Comando')}</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
            ${COMMANDS().map((c) => `<div class="doc-table__row"><span class="pc-table__cmd">${icon(c.icon, { size: 16 })}<code>/${c.id}</code></span><span class="pc-table__text">${c.description}</span></div>`).join('')}
          </div>
          <div class="doc-table pc-table">
            <div class="doc-table__head" aria-hidden="true"><span>${L('Tecla', 'Key', 'Tecla')}</span><span>${L('No composer', 'In the composer', 'En el composer')}</span></div>
            ${keys.map(([k, text, joiner]) => `<div class="doc-table__row"><span class="pc-keys">${kbd(k, joiner)}</span><span class="pc-table__text">${text}</span></div>`).join('')}
          </div>
        </div>
      </div>`,
    )}

    ${section(
      'estados',
      L('Estados', 'States', 'Estados'),
      L('Cada estado diz o que está acontecendo e qual é o próximo passo. Nada some sem aviso.', 'Each state says what’s happening and what the next step is. Nothing disappears without notice.', 'Cada estado dice qué está pasando y cuál es el siguiente paso. Nada desaparece sin aviso.'),
      `<div class="pc-examples">${states.map(([name, text, preview]) => exampleCard(name, '', text, preview)).join('')}</div>`,
    )}

    ${section(
      'escrita',
      L('Escrita', 'Writing', 'Escritura'),
      L('A resposta é interface. Escreva como o resto do produto: curto, direto, em português do Brasil.', 'The reply is interface. Write like the rest of the product: short, direct, in plain language.', 'La respuesta es interfaz. Escribe como el resto del producto: corto, directo, en lenguaje claro.'),
      `<div class="pc-writing">
        ${[
          [L('Responda primeiro', 'Answer first', 'Responde primero'), L('São três passos: cores, tipografia e componentes.', 'There are three steps: color, typography, and components.', 'Son tres pasos: colores, tipografía y componentes.'), L('Ótima pergunta! Vamos explorar juntos esse tema tão interessante…', 'Great question! Let’s explore this fascinating topic together…', '¡Excelente pregunta! Exploremos juntos este tema tan interesante…')],
          [L('Frases curtas, voz ativa', 'Short sentences, active voice', 'Frases cortas, voz activa'), L('Troque o hue da marca e rode o build.', 'Change the brand hue and run the build.', 'Cambia el hue de la marca y ejecuta el build.'), L('O hue da marca pode ser trocado, e em seguida o build deverá ser executado.', 'The brand hue can be changed, after which the build should be run.', 'El hue de la marca puede ser cambiado, y a continuación el build deberá ser ejecutado.')],
          [L('Diga quando não sabe', 'Say when you don’t know', 'Di cuando no sabes'), L('Não encontrei esse dado no arquivo. Quer que eu procure em outro?', 'I didn’t find that figure in the file. Want me to look in another one?', 'No encontré ese dato en el archivo. ¿Quieres que busque en otro?'), L(`O faturamento foi de ${formatNumber(1200000, { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 })}. (sem fonte)`, `Revenue was ${formatNumber(1200000, { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 })}. (no source)`, `La facturación fue de ${formatNumber(1200000, { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 })}. (sin fuente)`)],
          [L('Lista só com três ou mais', 'Lists only with three or more', 'Lista solo con tres o más'), L('Abra o arquivo e mude o hue.', 'Open the file and change the hue.', 'Abre el archivo y cambia el hue.'), L('• Abra o arquivo\n• Mude o hue', '• Open the file\n• Change the hue', '• Abre el archivo\n• Cambia el hue')],
          [L('Termos da tela', 'Use the screen’s terms', 'Términos de la pantalla'), L('Clique em Exportar tokens.', 'Click Export tokens.', 'Haz clic en Exportar tokens.'), L('Acione a funcionalidade de exportação de design tokens.', 'Trigger the design token export functionality.', 'Accione la funcionalidad de exportación de design tokens.')],
          [L('Um próximo passo, no fim', 'One next step, at the end', 'Un siguiente paso, al final'), L('Quer que eu monte o roteiro?', 'Want me to put the script together?', '¿Quieres que arme el guion?'), L('Posso ajudar com mais alguma coisa? Estou aqui para o que precisar!', 'Can I help with anything else? I’m here for whatever you need!', '¿Puedo ayudar con algo más? ¡Estoy aquí para lo que necesites!')],
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
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('A conversa se lê e se usa inteira pelo teclado e por leitor de tela.', 'The whole conversation can be read and used by keyboard and screen reader.', 'La conversación se lee y se usa entera con el teclado y el lector de pantalla.'),
      a11yList([
        [L('Conversa como log', 'Conversation as a log', 'Conversación como log'), L(`A lista de mensagens tem ${ic('role="log"')} e ${ic('aria-live="polite"')}: respostas novas são lidas sem roubar o foco.`, `The message list has ${ic('role="log"')} and ${ic('aria-live="polite"')}: new replies are read without stealing focus.`, `La lista de mensajes tiene ${ic('role="log"')} y ${ic('aria-live="polite"')}: las respuestas nuevas se leen sin robar el foco.`)],
        [L('Resposta lida inteira', 'The reply read in full', 'Respuesta leída entera'), L(`Enquanto chega, a resposta fica com ${ic('aria-busy="true"')}, e o leitor espera terminar em vez de ler palavra por palavra.`, `While it arrives, the reply has ${ic('aria-busy="true"')}, and the reader waits for it to finish instead of reading word by word.`, `Mientras llega, la respuesta queda con ${ic('aria-busy="true"')}, y el lector espera a que termine en vez de leer palabra por palabra.`)],
        [L('Foco fica no composer', 'Focus stays in the composer', 'El foco queda en el composer'), L('Depois de enviar, o foco continua no campo, pronto para a próxima pergunta.', 'After sending, focus stays in the field, ready for the next question.', 'Después de enviar, el foco sigue en el campo, listo para la siguiente pregunta.')],
        [L('Campo com rótulo', 'A labeled field', 'Campo con etiqueta'), L(`O campo tem rótulo (pode ser visualmente oculto) e ${ic('aria-describedby')} aponta para os atalhos.`, `The field has a label (it can be visually hidden) and ${ic('aria-describedby')} points to the shortcuts.`, `El campo tiene etiqueta (puede estar visualmente oculta) y ${ic('aria-describedby')} apunta a los atajos.`)],
        [L('Comandos pelo teclado', 'Commands by keyboard', 'Comandos con el teclado'), L(`A lista de comandos usa ${ic('aria-activedescendant')}: o foco não sai do campo e as setas escolhem.`, `The command list uses ${ic('aria-activedescendant')}: focus doesn’t leave the field and the arrows choose.`, `La lista de comandos usa ${ic('aria-activedescendant')}: el foco no sale del campo y las flechas eligen.`), ['/', '↑', '↓', 'Enter']],
        [L('Parar sem mouse', 'Stop without a mouse', 'Detener sin mouse'), L('Esc para a resposta, e o enviar passa a se chamar “Parar resposta”.', 'Esc stops the reply, and send is renamed “Stop reply”.', 'Esc detiene la respuesta, y enviar pasa a llamarse “Detener respuesta”.'), ['Esc']],
        [L('Ações sempre alcançáveis', 'Actions always reachable', 'Acciones siempre alcanzables'), L('As ações de cada resposta aparecem no hover e no foco, e ficam sempre visíveis em telas de toque e na última resposta.', 'Each reply’s actions appear on hover and focus, and are always visible on touch screens and on the latest reply.', 'Las acciones de cada respuesta aparecen con hover y foco, y quedan siempre visibles en pantallas táctiles y en la última respuesta.')],
        [L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido'), L(`Com ${ic('prefers-reduced-motion')}, a resposta aparece de uma vez e os pontos de “escrevendo” param.`, `With ${ic('prefers-reduced-motion')}, the reply appears all at once and the “typing” dots stop.`, `Con ${ic('prefers-reduced-motion')}, la respuesta aparece de una vez y los puntos de “escribiendo” se detienen.`)],
      ]),
    )}

    ${section(
      'tokens',
      'Tokens',
      L('Clique no nome para copiar a variável.', 'Click the name to copy the variable.', 'Haz clic en el nombre para copiar la variable.'),
      tokenTable([
        ['color.bg.raised', L('Balão da pergunta e composer', 'Question bubble and composer', 'Burbuja de la pregunta y composer')],
        ['color.bg.surface', L('Cartão de resultado', 'Result card', 'Tarjeta de resultado')],
        ['color.border.subtle', L('Contorno do balão e do cartão', 'Bubble and card outline', 'Contorno de la burbuja y de la tarjeta')],
        ['color.border.control', L('Composer e anexos', 'Composer and attachments', 'Composer y adjuntos')],
        ['color.border.focus', L('Composer em foco', 'Focused composer', 'Composer con foco')],
        ['color.fg.default', L('Texto da conversa', 'Conversation text', 'Texto de la conversación')],
        ['color.fg.muted', L('Texto do cartão', 'Card text', 'Texto de la tarjeta')],
        ['color.fg.subtle', L('Autor, hora, placeholder e atalhos', 'Author, time, placeholder, and shortcuts', 'Autor, hora, placeholder y atajos')],
        ['color.brand.solid', L('Enviar', 'Send', 'Enviar')],
        ['color.brand.on-solid', L('Ícone do enviar', 'Send icon', 'Ícono de enviar')],
        ['color.brand.subtle', L('Marca do autor e comando escolhido', 'Author mark and chosen command', 'Marca del autor y comando elegido')],
        ['color.brand.fg', L('Letra da marca e do comando', 'Mark and command lettering', 'Letra de la marca y del comando')],
        ['color.danger.fg', L('Falha ao enviar e limite passado', 'Send failure and limit exceeded', 'Fallo al enviar y límite superado')],
        ['radius.xl', L('Balão e cartão', 'Bubble and card', 'Burbuja y tarjeta')],
        ['radius.2xl', 'Composer'],
        ['space.400', L('Entre mensagens', 'Between messages', 'Entre mensajes')],
      ]),
    )}

    ${section(
      'codigo',
      L('Código', 'Code', 'Código'),
      L(`O CSS vem em ${ic('ds/ds.css')}; o comportamento, em ${ic('ds/js/composer.js')}.`, `The CSS comes in ${ic('ds/ds.css')}; the behavior, in ${ic('ds/js/composer.js')}.`, `El CSS viene en ${ic('ds/ds.css')}; el comportamiento, en ${ic('ds/js/composer.js')}.`),
      `<div class="pc-code">
        ${codeBlock(`<div class="ds-thread" role="log" aria-live="polite" aria-label="${L('Conversa', 'Conversation', 'Conversación')}">
  <article class="ds-message ds-message--user">
    <div class="ds-message__body"><p>${L('Monte um roteiro', 'Write a script', 'Arma un guion')}</p></div>
    <p class="ds-message__meta">${L('Enviada', 'Sent', 'Enviado')} · <time>14:32</time></p>
  </article>
  <article class="ds-message">
    <header class="ds-message__head">
      <span class="ds-message__mark" aria-hidden="true">L</span>
      <span class="ds-message__author">Lume</span><time>14:32</time>
    </header>
    <div class="ds-message__body"><p>${L('Montei um roteiro em três cenas.', 'I put together a script in three scenes.', 'Armé un guion en tres escenas.')}</p></div>
    <section class="ds-result-card">…</section>
    <div class="ds-message__actions">…ds-icon-btn ds-icon-btn--sm…</div>
  </article>
</div>

<div id="composer"></div>`)}
        ${codeBlock(`import { createComposer } from './ds/js/composer.js';

const composer = createComposer(document.querySelector('#composer'), {
  label: '${composerLabel()}',
  commands: [{ id: '${COMMANDS()[1].id}', label: '${COMMANDS()[1].label}', description: '${L('Resume em três frases', 'Sums up in three sentences', 'Resume en tres frases')}', icon: 'file-text' }],
  maxLength: 2000,
  onSend({ text, attachments, command }) {
    // ${L('envie; devolva false para manter o texto no campo', 'send it; return false to keep the text in the field', 'envía; devuelve false para mantener el texto en el campo')}
  },
  onStop() {
    // ${L('cancele a resposta em andamento', 'cancel the reply in progress', 'cancela la respuesta en curso')}
  },
});

composer.setBusy(true);   // ${L('enviar vira "parar"', 'send becomes "stop"', 'enviar se vuelve "detener"')}
composer.focus();`)}
      </div>`,
    )}

    ${section(
      'uso',
      L('Uso', 'Usage', 'Uso'),
      '',
      `<div class="usage-grid">
        ${[
          ['do', 'check-circle', L('Balão só na pergunta', 'Bubbles only on the question', 'Burbuja solo en la pregunta'), L('O balão marca quem pergunta; a resposta é texto de leitura, com espaço para respirar.', 'The bubble marks who asks; the reply is reading text, with room to breathe.', 'La burbuja marca quién pregunta; la respuesta es texto de lectura, con espacio para respirar.')],
          ['dont', 'x-circle', L('Cor em todo balão', 'Color on every bubble', 'Color en cada burbuja'), L('Nada de balões coloridos ou degradês. A única cor da conversa é o enviar.', 'No colored bubbles or gradients. The only color in the conversation is send.', 'Nada de burbujas de colores ni degradados. El único color de la conversación es enviar.')],
          ['do', 'check-circle', L('Cartão para o que dá para usar', 'Cards for what can be used', 'Tarjeta para lo que se puede usar'), L('Roteiros, resumos e arquivos viram cartão com ações. Conversa comum fica em texto.', 'Scripts, summaries, and files become cards with actions. Regular conversation stays as text.', 'Guiones, resúmenes y archivos se vuelven tarjeta con acciones. La conversación común queda en texto.')],
          ['dont', 'x-circle', L('Ações gritando em toda mensagem', 'Actions shouting on every message', 'Acciones gritando en cada mensaje'), L('Copiar e avaliar aparecem no hover e no foco; ficam fixas só na última resposta e no toque.', 'Copy and rate appear on hover and focus; they stay fixed only on the latest reply and on touch.', 'Copiar y valorar aparecen con hover y foco; quedan fijas solo en la última respuesta y en pantallas táctiles.')],
          ['tip', 'zap', L('Comece com sugestões', 'Start with suggestions', 'Empieza con sugerencias'), L('Na conversa vazia, três sugestões concretas ensinam o que dá para pedir.', 'In an empty conversation, three concrete suggestions teach what you can ask for.', 'En la conversación vacía, tres sugerencias concretas enseñan qué se puede pedir.')],
          ['dont', 'x-circle', L('Enter que não envia', 'Enter that doesn’t send', 'Enter que no envía'), L('Enter envia, Shift + Enter quebra linha. Não inverta, e não envie no meio de um acento (IME).', 'Enter sends, Shift + Enter breaks the line. Don’t swap them, and don’t send in the middle of an accent (IME).', 'Enter envía, Shift + Enter hace salto de línea. No los inviertas, y no envíes en medio de un acento (IME).')],
        ]
          .map(([kind, glyph, title, text]) => `<article class="usage-card usage-card--${kind}"><p class="usage-card__head">${icon(glyph, { size: 18 })}${title}</p><p class="usage-card__text">${text}</p></article>`)
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
          label: L('Resposta', 'Reply', 'Respuesta'),
          value: 'card',
          options: [
            { value: 'card', label: L('Texto e cartão', 'Text and card', 'Texto y tarjeta'), icon: 'card' },
            { value: 'text', label: L('Só texto', 'Text only', 'Solo texto'), icon: 'type' },
            { value: 'error', label: L('Falha no envio', 'Send failure', 'Fallo al enviar'), icon: 'alert-circle' },
          ],
        },
        {
          id: 'speed',
          label: L('Escrita', 'Writing', 'Escritura'),
          value: 'stream',
          options: [
            { value: 'stream', label: L('Aos poucos', 'Gradually', 'Poco a poco'), icon: 'play' },
            { value: 'instant', label: L('De uma vez', 'All at once', 'De una vez'), icon: 'zap' },
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
