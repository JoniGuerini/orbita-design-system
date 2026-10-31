/**
 * Órbita — composer (caixa de mensagem) e ajudantes de conversa.
 *
 *   const composer = createComposer(document.querySelector('#composer'), {
 *     label: 'Mensagem para o Órbita',
 *     placeholder: 'Pergunte algo ou digite / para comandos',
 *     commands: [{ id: 'resumir', label: 'Resumir', description: 'Resume em três frases', icon: 'file-text' }],
 *     maxLength: 2000,
 *     onSend({ text, attachments, command }) { … },   // devolva false para manter o texto no campo
 *     onStop() { … },                                   // botão parar ou Esc, enquanto ocupado
 *   });
 *   composer.setBusy(true) · composer.focus() · composer.clear() · composer.setValue('…') · composer.destroy()
 *
 * Teclado: Enter envia · Shift + Enter quebra linha · "/" no começo abre os comandos
 * (setas, Enter ou Tab escolhem, Esc fecha) · Backspace no começo remove o comando · Esc para a resposta.
 *
 * Também exporta markup estático para documentar estados e montar conversas:
 *   composerHtml(opts), messageHtml(opts), attachmentHtml(file), typingHtml(label), streamText(el, paragraphs, opts)
 */
import { icon } from '../icons/icons.js';

let uid = 0;

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const NF = new Intl.NumberFormat('pt-BR');
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function formatBytes(n) {
  if (n == null) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1048576).toFixed(1).replace('.', ',')} MB`;
}

/* ───────── Markup estático ───────── */

/** Anexo: { name, size?, type?, id?, removable? } */
export function attachmentHtml({ name, size, type, id, removable = false }) {
  const ic = /^image\//.test(type ?? '') || /\.(png|jpe?g|gif|webp|svg)$/i.test(name) ? 'image' : 'file-text';
  return `<span class="ds-attachment"${id ? ` data-attachment="${esc(id)}"` : ''}>
    <span class="ds-attachment__icon" aria-hidden="true">${icon(ic, { size: 14 })}</span>
    <span class="ds-attachment__name">${esc(name)}</span>
    ${size != null ? `<span class="ds-attachment__size">${formatBytes(size)}</span>` : ''}
    ${removable ? `<button type="button" class="ds-attachment__remove" data-remove="${esc(id)}" aria-label="Remover ${esc(name)}">${icon('x', { size: 14 })}</button>` : ''}
  </span>`;
}

function commandChip(command) {
  return `<span class="ds-composer__command">${icon(command.icon ?? 'slash', { size: 14 })}<span>${esc(command.label)}</span>
    <button type="button" class="ds-attachment__remove" data-remove="command" aria-label="Remover comando ${esc(command.label)}">${icon('x', { size: 14 })}</button></span>`;
}

const sendIcon = (busy) => (busy ? '<span class="ds-composer__stop" aria-hidden="true"></span>' : icon('arrow-up', { size: 18, strokeWidth: 2 }));

/**
 * Markup do composer (createComposer usa o mesmo). Para documentar estados, passe:
 * value, attachments, command, busy, disabled, maxLength, state ('focus').
 */
export function composerHtml({
  id = `ds-composer-${++uid}`,
  label = 'Mensagem',
  placeholder = 'Escreva uma mensagem ou / para comandos',
  value = '',
  attachments = [],
  command = null,
  busy = false,
  disabled = false,
  maxLength = 0,
  state,
  hint = true,
  attach = true,
  commands = true,
  mic = false,
  rows = 1,
} = {}) {
  const len = value.length;
  const showCount = maxLength && len >= maxLength * 0.8;
  const over = maxLength && len > maxLength;
  const tokens = `${command ? commandChip(command) : ''}${attachments.map((a, i) => attachmentHtml({ ...a, id: a.id ?? `${id}-a${i}`, removable: true })).join('')}`;
  const canSend = (len || attachments.length) && !over && !disabled;
  const flags = [busy && 'data-busy', disabled && 'data-disabled', over && 'data-over', state && `data-state="${esc(state)}"`].filter(Boolean).join(' ');
  return `<div class="ds-composer" ${flags}>
    <div class="ds-composer__tokens" data-tokens${tokens ? '' : ' hidden'}>${tokens}</div>
    <label class="ds-visually-hidden" for="${id}-input">${esc(label)}</label>
    <textarea class="ds-composer__input" id="${id}-input" rows="${rows}" placeholder="${esc(placeholder)}" aria-autocomplete="list" aria-controls="${id}-menu"${hint ? ` aria-describedby="${id}-hint"` : ''}${disabled ? ' disabled' : ''}>${esc(value)}</textarea>
    <div class="ds-composer__bar">
      ${
        attach
          ? `<button type="button" class="ds-icon-btn ds-icon-btn--muted" data-attach aria-label="Anexar arquivo" data-ds-tooltip="Anexar arquivo">${icon('paperclip', { size: 18 })}</button>
             <input type="file" multiple hidden data-file tabindex="-1">`
          : ''
      }
      ${commands ? `<button type="button" class="ds-icon-btn ds-icon-btn--muted" data-commands aria-label="Comandos" data-ds-tooltip="Comandos" data-ds-tooltip-kbd="/">${icon('slash', { size: 18 })}</button>` : ''}
      ${mic ? `<button type="button" class="ds-icon-btn ds-icon-btn--muted" data-mic aria-label="Ditar" data-ds-tooltip="Ditar">${icon('mic', { size: 18 })}</button>` : ''}
      <span class="ds-composer__spacer"></span>
      <span class="ds-composer__count" data-count aria-hidden="true"${showCount ? '' : ' hidden'}>${maxLength ? `${NF.format(len)} / ${NF.format(maxLength)}` : ''}</span>
      <button type="button" class="ds-composer__send" data-send aria-label="${busy ? 'Parar resposta' : 'Enviar mensagem'}" data-ds-tooltip="${busy ? 'Parar resposta' : 'Enviar'}" data-ds-tooltip-kbd="${busy ? 'Esc' : '↵'}"${!busy && !canSend ? ' aria-disabled="true"' : ''}>${sendIcon(busy)}</button>
    </div>
    <div class="ds-composer__menu" id="${id}-menu" role="listbox" aria-label="Comandos" hidden></div>
  </div>
  ${
    hint
      ? `<p class="ds-composer__hint" id="${id}-hint">
          <span><kbd class="ds-kbd">Enter</kbd> envia</span>
          <span><kbd class="ds-kbd">Shift</kbd> + <kbd class="ds-kbd">Enter</kbd> quebra linha</span>
          ${commands ? '<span><kbd class="ds-kbd">/</kbd> comandos</span>' : ''}
        </p>`
      : ''
  }`;
}

/** Indicador "escrevendo" (pontos param com movimento reduzido). */
export function typingHtml(label = 'Órbita está escrevendo') {
  return `<div class="ds-typing"><span class="ds-typing__dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(label)}</span></div>`;
}

const MESSAGE_ACTIONS = [
  ['copy', 'copy', 'Copiar resposta'],
  ['retry', 'refresh', 'Gerar de novo'],
  ['like', 'thumbs-up', 'Gostei'],
  ['dislike', 'thumbs-down', 'Não gostei'],
];

/**
 * Mensagem.
 * { role: 'user' | 'assistant', id?, author = 'Órbita', time?, html? | text?, attachments?, card? (HTML),
 *   actions = true (só na resposta), status?: 'error', meta? (texto extra), busy? }
 */
export function messageHtml({ role = 'assistant', id, author = 'Órbita', time, html, text, attachments = [], card = '', actions = true, status, meta, busy = false, latest = false } = {}) {
  const body = html ?? (text ? String(text).split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('') : '');
  const attrs = [`class="ds-message${role === 'user' ? ' ds-message--user' : ''}"`, id && `data-message="${esc(id)}"`, status && `data-status="${esc(status)}"`, busy && 'aria-busy="true"', latest && 'data-latest'].filter(Boolean).join(' ');
  const files = attachments.length ? `<div class="ds-message__attachments">${attachments.map((a) => attachmentHtml(a)).join('')}</div>` : '';
  if (role === 'user') {
    const footer =
      status === 'error'
        ? `<p class="ds-message__error"><span>${icon('alert-circle', { size: 16 })}Não foi enviada.</span><button type="button" class="ds-inline-action" data-action="resend">${icon('refresh', { size: 16 })}Tentar de novo</button></p>`
        : time || meta
          ? `<p class="ds-message__meta">${esc(meta ?? 'Enviada')}${time ? ` · <time>${esc(time)}</time>` : ''}</p>`
          : '';
    return `<article ${attrs} aria-label="Você disse">${files}${body ? `<div class="ds-message__body">${body}</div>` : ''}${footer}</article>`;
  }
  return `<article ${attrs} aria-label="${esc(author)} respondeu">
    <header class="ds-message__head"><span class="ds-message__mark" aria-hidden="true">Ó</span><span class="ds-message__author">${esc(author)}</span>${time ? `<time>${esc(time)}</time>` : ''}</header>
    ${files}
    <div class="ds-message__body" data-body>${body}</div>
    ${card}
    ${meta ? `<p class="ds-message__meta">${esc(meta)}</p>` : ''}
    ${
      actions
        ? `<div class="ds-message__actions" role="group" aria-label="Ações da resposta">${MESSAGE_ACTIONS.map(
            ([action, ic, label]) =>
              `<button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted" data-action="${action}" aria-label="${label}" data-ds-tooltip="${label}"${action === 'like' || action === 'dislike' ? ' aria-pressed="false"' : ''}>${icon(ic, { size: 16 })}</button>`,
          ).join('')}</div>`
        : ''
    }
  </article>`;
}

/**
 * Escreve parágrafos aos poucos em `el` (palavra a palavra). Com movimento reduzido, escreve de uma vez.
 * Devolve uma Promise com { stopped }. Pare com um AbortSignal (opts.signal).
 */
export function streamText(el, paragraphs, { delay = 32, signal } = {}) {
  const list = [].concat(paragraphs);
  if (reducedMotion() || delay <= 0) {
    el.innerHTML = list.map((p) => `<p>${esc(p)}</p>`).join('');
    return Promise.resolve({ stopped: false });
  }
  return new Promise((resolve) => {
    let pi = 0;
    let words = [];
    let wi = 0;
    let p = null;
    let timer = 0;
    const stop = () => {
      clearTimeout(timer);
      resolve({ stopped: true });
    };
    signal?.addEventListener('abort', stop, { once: true });
    const tick = () => {
      if (signal?.aborted) return;
      if (!p) {
        if (pi >= list.length) {
          signal?.removeEventListener('abort', stop);
          resolve({ stopped: false });
          return;
        }
        p = document.createElement('p');
        el.append(p);
        words = String(list[pi]).split(/(\s+)/);
        wi = 0;
      }
      // duas "palavras" por passo (texto + espaço)
      p.textContent += words.slice(wi, wi + 2).join('');
      wi += 2;
      if (wi >= words.length) {
        p = null;
        pi += 1;
      }
      timer = setTimeout(tick, delay);
    };
    tick();
  });
}

/* ───────── Composer vivo ───────── */

export function createComposer(host, options = {}) {
  const o = {
    label: 'Mensagem',
    placeholder: 'Escreva uma mensagem ou / para comandos',
    commands: [],
    maxLength: 4000,
    attach: true,
    mic: false,
    hint: true,
    ...options,
  };
  const id = `ds-composer-${++uid}`;
  host.innerHTML = `${composerHtml({ ...o, id, commands: o.commands.length > 0 })}<p class="ds-visually-hidden" aria-live="polite" data-live></p>`;

  const root = host.querySelector('.ds-composer');
  const input = root.querySelector('.ds-composer__input');
  const tokensEl = root.querySelector('[data-tokens]');
  const sendBtn = root.querySelector('[data-send]');
  const countEl = root.querySelector('[data-count]');
  const menu = root.querySelector('.ds-composer__menu');
  const fileInput = root.querySelector('[data-file]');
  const live = host.querySelector('[data-live]');

  let attachments = [];
  let command = null;
  let busy = false;
  let options$ = [];
  let active = -1;
  let fileSeq = 0;

  const announce = (text) => {
    live.textContent = '';
    requestAnimationFrame(() => (live.textContent = text));
  };

  function autosize() {
    input.style.height = '';
    if (!input.value || !input.clientWidth) return; // vazio: uma linha (rows="1")
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }
  // a largura muda (painel, rotação): a altura acompanha
  let lastWidth = 0;
  const ro = new ResizeObserver(([entry]) => {
    const w = Math.round(entry.contentRect.width);
    if (w && w !== lastWidth) {
      lastWidth = w;
      autosize();
    }
  });
  ro.observe(input);

  const canSend = () => (input.value.trim().length > 0 || attachments.length > 0) && !(o.maxLength && input.value.length > o.maxLength);

  function sync() {
    const len = input.value.length;
    const over = o.maxLength && len > o.maxLength;
    root.toggleAttribute('data-over', !!over);
    if (o.maxLength) {
      countEl.hidden = len < o.maxLength * 0.8;
      countEl.textContent = `${NF.format(len)} / ${NF.format(o.maxLength)}`;
    }
    if (busy || canSend()) sendBtn.removeAttribute('aria-disabled');
    else sendBtn.setAttribute('aria-disabled', 'true');
  }

  function renderTokens() {
    tokensEl.innerHTML = `${command ? commandChip(command) : ''}${attachments.map((a) => attachmentHtml({ ...a, removable: true })).join('')}`;
    tokensEl.hidden = !command && !attachments.length;
  }

  /* comandos */
  function openMenu(query) {
    const q = normalize(query);
    // o nome do comando vem antes da descrição: /tr acha /traduzir, não "três"
    const score = (c) => {
      if (!q) return 1;
      const idn = normalize(c.id);
      const label = normalize(c.label);
      if (idn.startsWith(q)) return 4;
      if (label.startsWith(q) || label.split(/\s+/).some((w) => w.startsWith(q))) return 3;
      if (idn.includes(q) || label.includes(q)) return 2;
      return normalize(c.description).includes(q) ? 1 : 0;
    };
    options$ = o.commands
      .map((c, i) => ({ c, i, s: score(c) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .map((r) => r.c);
    active = options$.length ? 0 : -1;
    menu.innerHTML =
      `<p class="ds-composer__menu-label" aria-hidden="true">Comandos</p>` +
      (options$.length
        ? options$
            .map(
              (c, i) => `<div class="ds-composer__option" role="option" id="${id}-opt-${esc(c.id)}" data-index="${i}" aria-selected="${i === active}">
                ${icon(c.icon ?? 'slash', { size: 18 })}<span class="ds-composer__option-label">/${esc(c.id)}</span><span class="ds-composer__option-desc">${esc(c.description ?? c.label)}</span>
              </div>`,
            )
            .join('')
        : `<p class="ds-composer__empty">Nenhum comando com “${esc(query)}”.</p>`);
    const wasOpen = !menu.hidden;
    menu.hidden = false;
    setActive(active);
    if (!wasOpen) announce(options$.length ? `${options$.length} comandos. Use as setas e Enter.` : 'Nenhum comando.');
  }

  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function setActive(i) {
    active = i;
    menu.querySelectorAll('[role="option"]').forEach((el, k) => el.setAttribute('aria-selected', String(k === i)));
    const el = menu.querySelector(`[data-index="${i}"]`);
    if (el) {
      input.setAttribute('aria-activedescendant', el.id);
      el.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  function choose(c) {
    if (!c) return;
    command = c;
    input.value = input.value.replace(/^\/\S*\s?/, '');
    closeMenu();
    renderTokens();
    autosize();
    sync();
    input.focus();
    announce(`Comando ${c.label} escolhido.`);
  }

  function checkSlash() {
    if (!o.commands.length || command) return closeMenu();
    const before = input.value.slice(0, input.selectionStart ?? 0);
    const m = /^\/(\S*)$/.exec(before);
    if (m) openMenu(m[1]);
    else closeMenu();
  }

  /* anexos */
  function addFiles(files) {
    const list = [...(files ?? [])];
    if (!list.length) return;
    for (const f of list) attachments.push({ id: `${id}-f${++fileSeq}`, name: f.name, size: f.size, type: f.type });
    renderTokens();
    sync();
    announce(list.length === 1 ? `${list[0].name} anexado.` : `${list.length} arquivos anexados.`);
  }

  /* enviar e parar */
  function send() {
    if (busy) return stop();
    if (!canSend()) {
      if (o.maxLength && input.value.length > o.maxLength) announce(`A mensagem passou de ${NF.format(o.maxLength)} caracteres.`);
      return;
    }
    const payload = { text: input.value.trim(), attachments: attachments.map(({ id: _, ...a }) => a), command: command?.id ?? null };
    const result = o.onSend?.(payload);
    if (result !== false) clear();
    input.focus();
  }

  function stop() {
    if (busy) o.onStop?.();
  }

  function clear() {
    input.value = '';
    attachments = [];
    command = null;
    renderTokens();
    closeMenu();
    autosize();
    sync();
  }

  /* eventos */
  const onInput = () => {
    autosize();
    sync();
    checkSlash();
  };

  const onKeyDown = (event) => {
    if (!menu.hidden) {
      const n = options$.length;
      if (event.key === 'ArrowDown' && n) {
        event.preventDefault();
        return setActive((active + 1) % n);
      }
      if (event.key === 'ArrowUp' && n) {
        event.preventDefault();
        return setActive((active - 1 + n) % n);
      }
      if ((event.key === 'Enter' || event.key === 'Tab') && n && active >= 0 && !event.isComposing) {
        event.preventDefault();
        return choose(options$[active]);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        return closeMenu();
      }
    }
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      if (!busy) send();
      return;
    }
    if (event.key === 'Escape' && busy) {
      event.preventDefault();
      event.stopPropagation();
      return stop();
    }
    if (event.key === 'Backspace' && command && input.selectionStart === 0 && input.selectionEnd === 0) {
      event.preventDefault();
      const removed = command;
      command = null;
      renderTokens();
      sync();
      announce(`Comando ${removed.label} removido.`);
    }
  };

  const onClick = (event) => {
    const t = event.target;
    if (t.closest('[data-send]')) return send();
    if (t.closest('[data-attach]')) return fileInput?.click();
    if (t.closest('[data-commands]')) {
      if (command) {
        command = null;
        renderTokens();
      }
      if (!input.value.startsWith('/')) input.value = `/${input.value}`;
      input.focus();
      input.setSelectionRange(1, 1);
      autosize();
      sync();
      return checkSlash();
    }
    const remove = t.closest('[data-remove]');
    if (remove) {
      const key = remove.dataset.remove;
      if (key === 'command') {
        announce(`Comando ${command?.label ?? ''} removido.`);
        command = null;
      } else {
        const a = attachments.find((x) => x.id === key);
        attachments = attachments.filter((x) => x.id !== key);
        if (a) announce(`${a.name} removido.`);
      }
      renderTokens();
      sync();
      input.focus();
    }
  };

  const onMenuPointerDown = (event) => {
    const opt = event.target.closest('[role="option"]');
    event.preventDefault(); // mantém o foco no campo
    if (opt) choose(options$[+opt.dataset.index]);
  };
  const onMenuMove = (event) => {
    const opt = event.target.closest('[role="option"]');
    if (opt && +opt.dataset.index !== active) setActive(+opt.dataset.index);
  };
  const onDocPointerDown = (event) => {
    if (!root.contains(event.target)) closeMenu();
  };
  const onFile = () => {
    addFiles(fileInput.files);
    fileInput.value = '';
  };
  const onDragOver = (event) => {
    if (!o.attach || !event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    root.setAttribute('data-drop', '');
  };
  const onDragLeave = (event) => {
    if (!root.contains(event.relatedTarget)) root.removeAttribute('data-drop');
  };
  const onDrop = (event) => {
    if (!o.attach || !event.dataTransfer?.files?.length) return;
    event.preventDefault();
    root.removeAttribute('data-drop');
    addFiles(event.dataTransfer.files);
  };

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeyDown);
  input.addEventListener('click', checkSlash);
  input.addEventListener('blur', () => setTimeout(() => !root.contains(document.activeElement) && closeMenu(), 0));
  root.addEventListener('click', onClick);
  menu.addEventListener('pointerdown', onMenuPointerDown);
  menu.addEventListener('pointermove', onMenuMove);
  document.addEventListener('pointerdown', onDocPointerDown);
  fileInput?.addEventListener('change', onFile);
  root.addEventListener('dragover', onDragOver);
  root.addEventListener('dragleave', onDragLeave);
  root.addEventListener('drop', onDrop);

  autosize();
  sync();

  return {
    el: root,
    input,
    focus: () => input.focus(),
    clear,
    getValue: () => ({ text: input.value, attachments: [...attachments], command: command?.id ?? null }),
    setValue(text) {
      input.value = text;
      autosize();
      sync();
      checkSlash();
    },
    setBusy(on) {
      busy = !!on;
      root.toggleAttribute('data-busy', busy);
      const label = busy ? 'Parar resposta' : 'Enviar mensagem';
      sendBtn.setAttribute('aria-label', label);
      sendBtn.dataset.dsTooltip = busy ? 'Parar resposta' : 'Enviar';
      sendBtn.dataset.dsTooltipKbd = busy ? 'Esc' : '↵';
      sendBtn.innerHTML = sendIcon(busy);
      sync();
    },
    get busy() {
      return busy;
    },
    destroy() {
      ro.disconnect();
      document.removeEventListener('pointerdown', onDocPointerDown);
      host.innerHTML = '';
    },
  };
}
