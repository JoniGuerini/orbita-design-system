/**
 * Modal — diálogo modal sobre <dialog> (showModal): foco preso pelo navegador,
 * Esc e clique fora fecham, o foco volta ao gatilho e a saída é animada.
 *
 *   const escolha = await openModal({
 *     eyebrow: 'Projeto', title: 'Publicar alterações?', body: 'Texto ou HTML',
 *     size: 'sm' | 'md' | 'lg', tone: 'danger', icon: 'alert-triangle',
 *     dismissible: true,
 *     actions: [{ label: 'Cancelar', value: 'cancel' }, { label: 'Publicar', value: 'confirm', variant: 'primary' }],
 *   });                                   // → valor da ação, ou undefined se fechou sem escolher
 *
 *   const ok = await confirmModal({ title: 'Excluir projeto?', body: '…', confirmLabel: 'Excluir', tone: 'danger' }); // → boolean
 *
 *   const modal = createModal({ … });     // controle manual: modal.open(), modal.close(valor), modal.destroy()
 */
import { icon } from '../icons/icons.js';
import { msg } from './i18n.js';

let uid = 0;
const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Duração da saída, lida do token --ds-duration-fast. */
function exitDuration(el) {
  const value = getComputedStyle(el).getPropertyValue('--ds-duration-fast').trim();
  return (parseFloat(value) || 120) + 20;
}

/** HTML interno do modal — usado pela API e pelas prévias estáticas da documentação. */
export function modalContent({ id = `ds-modal-${++uid}`, eyebrow, title, body, tone, icon: glyph, actions = [], dismissible = true, closeLabel = msg('common.close') } = {}) {
  const lead = glyph ?? (tone === 'danger' ? 'alert-triangle' : null);
  return `
    <header class="ds-modal__header">
      ${lead ? `<span class="ds-modal__icon">${icon(lead, { size: 20 })}</span>` : ''}
      <div class="ds-modal__heading">
        ${eyebrow ? `<p class="ds-modal__eyebrow">${escape(eyebrow)}</p>` : ''}
        <h2 class="ds-modal__title" id="${id}-title">${escape(title)}</h2>
      </div>
      ${dismissible ? `<button type="button" class="ds-icon-btn ds-icon-btn--muted ds-modal__close" data-ds-modal-close aria-label="${escape(closeLabel)}">${icon('x', { size: 20 })}</button>` : ''}
    </header>
    ${body !== undefined && body !== null ? `<div class="ds-modal__body" id="${id}-body">${typeof body === 'string' ? body : ''}</div>` : ''}
    ${
      actions.length
        ? `<footer class="ds-modal__footer">${actions
            .map(
              (a) => `<button type="button" class="ds-btn ds-btn--${a.variant ?? 'secondary'}" data-ds-modal-close="${escape(a.value ?? '')}"${a.autofocus ? ' data-ds-autofocus' : ''}>${a.icon ? icon(a.icon, { size: 18 }) : ''}${escape(a.label)}</button>`,
            )
            .join('')}</footer>`
        : ''
    }`;
}

export const modalClasses = ({ size = 'md', tone } = {}) => ['ds-modal', size !== 'md' && `ds-modal--${size}`, tone && `ds-modal--${tone}`].filter(Boolean).join(' ');

/** Liga o comportamento a um <dialog class="ds-modal"> existente. */
export function enhanceModal(dialog, { dismissible = true, onClose } = {}) {
  let returnFocus = null;
  let closing = false;
  let resolve = null;
  let timer;

  const onCancel = (event) => {
    event.preventDefault();
    if (dismissible) close();
  };

  const onClick = (event) => {
    if (event.target === dialog && dismissible) {
      const r = dialog.getBoundingClientRect();
      const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
      if (!inside) close();
      return;
    }
    const btn = event.target.closest('[data-ds-modal-close]');
    if (btn && dialog.contains(btn)) close(btn.dataset.dsModalClose || undefined);
  };

  // fechado por fora (dialog.close() direto, navegação…): resolve como "sem escolha"
  const onNativeClose = () => {
    if (!resolve) return;
    const done = resolve;
    resolve = null;
    clearTimeout(timer);
    closing = false;
    dialog.removeAttribute('data-closing');
    onClose?.(undefined);
    done(undefined);
  };

  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('close', onNativeClose);

  function open() {
    if (dialog.open) return Promise.resolve(undefined);
    returnFocus = document.activeElement;
    closing = false;
    dialog.removeAttribute('data-closing');
    dialog.showModal();
    const target =
      dialog.querySelector('[autofocus], [data-ds-autofocus]') ??
      dialog.querySelector('.ds-modal__body :is(input, select, textarea, button, a[href])') ??
      dialog.querySelector('.ds-modal__footer .ds-btn:last-child') ??
      dialog.querySelector('.ds-modal__close');
    target?.focus();
    return new Promise((r) => (resolve = r));
  }

  function close(value) {
    if (!dialog.open || closing) return;
    closing = true;
    const finish = () => {
      clearTimeout(timer);
      const done = resolve;
      resolve = null;
      dialog.removeAttribute('data-closing');
      dialog.close();
      closing = false;
      returnFocus?.focus?.({ preventScroll: true });
      onClose?.(value);
      done?.(value);
    };
    if (reducedMotion()) return finish();
    dialog.setAttribute('data-closing', '');
    timer = setTimeout(finish, exitDuration(dialog));
  }

  function destroy() {
    clearTimeout(timer);
    if (dialog.open) dialog.close();
    dialog.removeEventListener('cancel', onCancel);
    dialog.removeEventListener('click', onClick);
    dialog.removeEventListener('close', onNativeClose);
  }

  return { el: dialog, open, close, destroy, get isOpen() { return dialog.open; } };
}

/** Cria um modal novo no fim do <body>. */
export function createModal(options = {}) {
  const id = `ds-modal-${++uid}`;
  const dialog = document.createElement('dialog');
  dialog.className = modalClasses(options);
  dialog.setAttribute('aria-labelledby', `${id}-title`);
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody) dialog.setAttribute('aria-describedby', `${id}-body`);
  dialog.innerHTML = modalContent({ ...options, id });
  if (hasBody && typeof options.body !== 'string') dialog.querySelector('.ds-modal__body').append(options.body);
  document.body.append(dialog);
  const api = enhanceModal(dialog, { dismissible: options.dismissible ?? true, onClose: options.onClose });
  return {
    ...api,
    destroy() {
      api.destroy();
      dialog.remove();
    },
  };
}

/** Abre um modal e resolve com o valor da ação escolhida (undefined se fechou sem escolher). */
export function openModal(options = {}) {
  const modal = createModal(options);
  const result = modal.open();
  result.then(() => modal.destroy());
  return result;
}

/** Confirmação: resolve true se a pessoa confirmou. Em tom de perigo, o foco começa em "Cancelar". */
export function confirmModal({ title, body, eyebrow, confirmLabel = msg('modal.confirm'), cancelLabel = msg('modal.cancel'), tone, icon: glyph } = {}) {
  const danger = tone === 'danger';
  return openModal({
    title,
    body,
    eyebrow,
    tone,
    icon: glyph,
    size: 'sm',
    actions: [
      { label: cancelLabel, value: 'cancel', autofocus: danger },
      { label: confirmLabel, value: 'confirm', variant: danger ? 'danger' : 'primary', autofocus: !danger },
    ],
  }).then((value) => value === 'confirm');
}
