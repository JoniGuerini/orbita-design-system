/**
 * Validação de formulários — acessível, em português e sem pressa.
 *
 *   const form = enhanceForm(document.querySelector('#projeto'), {
 *     rules: { slug: (value) => (taken.has(value) ? 'Esse endereço já está em uso.' : null) },
 *     messages: { nome: { required: 'Dê um nome ao projeto.' } },
 *     onSubmit: (data) => salvar(data),
 *   });
 *   form.validate();   // valida tudo e mostra os erros (sem mover o foco); devolve true/false
 *   form.reset();      // limpa valores, erros e o resumo
 *   form.destroy();
 *
 * Quando valida (validateOn):
 *   'blur'   (padrão) — ao sair de um campo em que a pessoa digitou algo; listas e escolhas, ao mudar
 *   'submit' — só ao enviar
 *   'input'  — a cada tecla (evite: acusa erro antes de a pessoa terminar)
 * Em qualquer modo, um campo com erro é revalidado enquanto a pessoa corrige — o erro some na hora.
 *
 * Regras nativas: required, type="email" | "url" | "number", minlength, maxlength, min, max, pattern.
 * Mensagens próprias por campo: data-error-required, data-error-email, data-error-pattern… ou `messages`.
 * Grupos de checkbox: data-min="2" no <fieldset> pede pelo menos N marcados.
 *
 * Acessibilidade: aria-invalid, erro ligado por aria-describedby, ícone + texto (nunca só cor),
 * resumo no topo que recebe o foco no envio, com links que levam a cada campo.
 */
import { icon } from '../icons/icons.js';
import { enhanceSelect } from './select.js';
import { msg } from './i18n.js';

const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
let uid = 0;

const SKIP = new Set(['submit', 'button', 'reset', 'hidden', 'image', 'file']);

const DEFAULTS = {
  required: (f) => msg(f.kind === 'select' || f.kind === 'radio' ? 'form.requiredChoice' : f.kind === 'check' ? 'form.requiredCheck' : f.kind === 'group' ? 'form.requiredGroup' : 'form.required'),
  email: () => msg('form.email'),
  url: () => msg('form.url'),
  number: () => msg('form.number'),
  minlength: (f, v) => msg('form.minlength', f.el.minLength, f.el.minLength - v.length),
  maxlength: (f, v) => msg('form.maxlength', f.max, v.length - f.max),
  min: (f) => msg('form.min', f.el.min),
  max: (f) => msg('form.max', f.el.max),
  pattern: (f) => f.el.title || msg('form.pattern'),
  groupMin: (f) => msg('form.groupMin', f.min),
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function enhanceForm(form, options = {}) {
  const o = { validateOn: 'blur', summary: true, ...options };
  const rules = o.rules ?? {};
  const messages = o.messages ?? {};
  form.noValidate = true;

  const touched = new Set();
  const errors = new Map(); // name → { field, message }
  let submitted = false;
  let summaryEl = null;
  const fieldCache = new Map();
  const formId = form.id || `ds-form-${++uid}`;

  /* ───────── Campos ───────── */

  const textOf = (label) => {
    const choice = label.querySelector('.ds-choice__label');
    if (choice) return choice.textContent.trim();
    const clone = label.cloneNode(true);
    clone.querySelectorAll('.ds-form-field__optional, .ds-visually-hidden').forEach((n) => n.remove());
    return clone.textContent.trim();
  };

  const labelOf = (el) => {
    // a seleção personalizada tira o "for" do rótulo e o liga ao gatilho
    const trigger = el.matches('select[data-enhanced]') ? document.getElementById(`${el.id}-trigger`) : null;
    const label = el.labels?.[0] ?? (trigger && document.getElementById(trigger.getAttribute('aria-labelledby'))) ?? el.closest('.ds-form-field')?.querySelector('.ds-form-field__label');
    if (label) return textOf(label);
    return el.getAttribute('aria-label') ?? el.name;
  };

  /** Um "campo" é um controle — ou um grupo de radios/checkboxes com o mesmo name. */
  function fieldFor(el) {
    const name = el.name || el.id;
    if (fieldCache.has(name)) return fieldCache.get(name);
    const all = [...form.elements].filter((x) => x.name && x.name === el.name);
    let field;
    if (el.type === 'radio' || (el.type === 'checkbox' && all.length > 1)) {
      const group = el.closest('fieldset');
      field = {
        name,
        kind: el.type === 'radio' ? 'radio' : 'group',
        el: all[0],
        inputs: all,
        container: group,
        required: all.some((x) => x.required) || group?.hasAttribute('data-required'),
        min: Number(group?.dataset.min) || 0,
        label: group?.querySelector('legend')?.textContent.trim() ?? labelOf(all[0]),
        focusTarget: () => all.find((x) => x.checked) ?? all[0],
      };
    } else {
      const kind = el.tagName === 'SELECT' ? 'select' : el.type === 'checkbox' ? 'check' : 'text';
      const counter = el.closest('.ds-form-field')?.querySelector('.ds-form-field__counter');
      field = {
        name,
        kind,
        el,
        inputs: [el],
        container: el.closest('.ds-form-field'),
        required: el.required,
        max: Number(el.dataset.max) || (counter && el.maxLength > 0 ? el.maxLength : 0),
        counter,
        label: labelOf(el),
        focusTarget: () => (el.matches('select[data-enhanced]') ? document.getElementById(`${el.id}-trigger`) ?? el : el),
      };
    }
    field.describedby = field.kind === 'radio' || field.kind === 'group' ? field.container?.getAttribute('aria-describedby') ?? '' : field.el.getAttribute('aria-describedby') ?? '';
    field.errorId = `${field.el.id || `ds-form-${++uid}`}-error`;
    fieldCache.set(name, field);
    return field;
  }

  const fields = () => {
    const seen = new Set();
    return [...form.elements]
      .filter((el) => el.matches('input, select, textarea') && (el.name || el.id) && !SKIP.has(el.type) && !el.disabled && !el.closest('[data-form-ignore]'))
      .map(fieldFor)
      .filter((f) => !seen.has(f.name) && seen.add(f.name));
  };

  /* ───────── Regras ───────── */

  const msg = (field, key, value) => {
    const custom = messages[field.name]?.[key] ?? field.el.dataset[`error${key[0].toUpperCase()}${key.slice(1)}`] ?? (key === 'groupMin' ? field.container?.dataset.errorMin : undefined);
    if (custom) return custom;
    return DEFAULTS[key](field, value);
  };

  function check(field) {
    const { el, kind } = field;
    if (kind === 'radio') {
      if (field.required && !field.inputs.some((x) => x.checked)) return msg(field, 'required');
    } else if (kind === 'group') {
      const n = field.inputs.filter((x) => x.checked).length;
      if (field.required && !n) return msg(field, 'required');
      if (field.min && n < field.min) return msg(field, 'groupMin');
    } else if (kind === 'check') {
      if (field.required && !el.checked) return msg(field, 'required');
    } else {
      const value = kind === 'select' && el.multiple ? [...el.selectedOptions].map((x) => x.value).join(',') : el.value.trim();
      if (!value) {
        if (field.required) return msg(field, 'required');
      } else if (kind === 'text') {
        if (el.type === 'email' && !EMAIL.test(value)) return msg(field, 'email', value);
        if (el.type === 'url' && !/^https?:\/\/\S+\.\S+/.test(value)) return msg(field, 'url', value);
        if (el.type === 'number' && Number.isNaN(Number(value))) return msg(field, 'number', value);
        if (el.minLength > 0 && value.length < el.minLength) return msg(field, 'minlength', value);
        if (field.max && value.length > field.max) return msg(field, 'maxlength', value);
        if (el.min !== '' && el.type === 'number' && Number(value) < Number(el.min)) return msg(field, 'min', value);
        if (el.max !== '' && el.type === 'number' && Number(value) > Number(el.max)) return msg(field, 'max', value);
        if (el.pattern && !new RegExp(`^(?:${el.pattern})$`, 'u').test(value)) return msg(field, 'pattern', value);
      }
    }
    const custom = rules[field.name];
    if (custom) {
      for (const rule of [].concat(custom)) {
        const result = rule(field.kind === 'text' || field.kind === 'select' ? field.el.value.trim() : field.inputs.filter((x) => x.checked).map((x) => x.value), field.el, form);
        if (result) return result;
      }
    }
    return null;
  }

  /* ───────── Mensagens na tela ───────── */

  function setDescribedby(field, withError) {
    const ids = [withError && field.errorId, field.describedby].filter(Boolean).join(' ');
    const targets = field.kind === 'radio' || field.kind === 'group' ? [field.container].filter(Boolean) : field.inputs;
    targets.forEach((t) => (ids ? t.setAttribute('aria-describedby', ids) : t.removeAttribute('aria-describedby')));
  }

  function showError(field, message) {
    errors.set(field.name, { field, message });
    field.inputs.forEach((x) => x.setAttribute('aria-invalid', 'true'));
    setDescribedby(field, true);

    let err = document.getElementById(field.errorId);
    if (!err) {
      err = document.createElement('p');
      err.id = field.errorId;
      if (field.kind === 'radio' || field.kind === 'group') {
        err.className = 'ds-choice-group__error';
        field.container?.append(err);
      } else if (field.container) {
        err.className = 'ds-form-field__error';
        let footer = field.container.querySelector('.ds-form-field__footer');
        if (!footer) {
          footer = document.createElement('div');
          footer.className = 'ds-form-field__footer';
          field.container.append(footer);
        }
        footer.prepend(err);
      } else {
        err.className = 'ds-form-field__error ds-form__choice-error';
        (field.el.closest('label') ?? field.el).after(err);
      }
    }
    err.innerHTML = `${icon('alert-circle', { size: 16 })}<span>${escape(message)}</span>`;
    // a dica dá lugar ao erro (continua ligada por aria-describedby)
    hintsOf(field).forEach((h) => (h.hidden = true));
    if (field.kind === 'select' && field.el.matches('[data-enhanced]')) enhanceSelect(field.el).sync();
  }

  function clearError(field) {
    if (!errors.has(field.name) && !document.getElementById(field.errorId)) return;
    errors.delete(field.name);
    field.inputs.forEach((x) => x.removeAttribute('aria-invalid'));
    setDescribedby(field, false);
    document.getElementById(field.errorId)?.remove();
    hintsOf(field).forEach((h) => (h.hidden = false));
    if (field.kind === 'select' && field.el.matches('[data-enhanced]')) enhanceSelect(field.el).sync();
  }

  const hintsOf = (field) => [...(field.container?.querySelectorAll('.ds-form-field__hint, .ds-choice-group__hint') ?? [])];

  function run(field) {
    const message = check(field);
    if (message) showError(field, message);
    else clearError(field);
    return !message;
  }

  /* ───────── Resumo ───────── */

  function summaryHost() {
    if (o.summary === false) return null;
    if (o.summary instanceof Element) return o.summary;
    return form.querySelector('[data-form-summary]');
  }

  function renderSummary() {
    if (o.summary === false) return null;
    if (!errors.size) {
      summaryEl?.remove();
      summaryEl = null;
      return null;
    }
    const list = fields()
      .filter((f) => errors.has(f.name))
      .map((f) => `<li><a href="#${escape(f.focusTarget()?.id ?? '')}" data-form-error="${escape(f.name)}">${escape(f.label)}: ${escape(errors.get(f.name).message.replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase()))}</a></li>`)
      .join('');
    const title = o.summaryTitle?.(errors.size) ?? msg('form.summary', errors.size);
    if (!summaryEl) {
      summaryEl = document.createElement('div');
      summaryEl.className = 'ds-alert ds-alert--danger ds-form__summary';
      summaryEl.tabIndex = -1;
      summaryEl.setAttribute('role', 'group');
      const host = summaryHost();
      if (host) host.append(summaryEl);
      else form.prepend(summaryEl);
    }
    const titleId = `${formId}-summary-title`;
    summaryEl.setAttribute('aria-labelledby', titleId);
    summaryEl.innerHTML = `<span class="ds-alert__icon">${icon('alert-circle', { size: 18 })}</span>
      <div class="ds-alert__body">
        <p class="ds-alert__title" id="${titleId}">${escape(title)}</p>
        <ul class="ds-alert__list" role="list">${list}</ul>
      </div>`;
    return summaryEl;
  }

  /* ───────── Eventos ───────── */

  const fieldOfEvent = (target) => {
    if (!target?.matches?.('input, select, textarea') || target.form !== form || !(target.name || target.id) || SKIP.has(target.type)) return null;
    return fieldFor(target);
  };

  function updateCounter(field) {
    if (!field.counter || !field.max) return;
    const len = field.el.value.length;
    field.counter.textContent = `${len}/${field.max}`;
    field.counter.toggleAttribute('data-over', len > field.max);
  }

  const onInput = (event) => {
    const field = fieldOfEvent(event.target);
    if (!field) return;
    updateCounter(field);
    if (field.kind !== 'text') return;
    if (o.validateOn === 'input' || errors.has(field.name)) {
      touched.add(field.name);
      run(field);
      if (summaryEl) renderSummary();
    } else if (event.target.value) touched.add(field.name);
  };

  const onChange = (event) => {
    const field = fieldOfEvent(event.target);
    if (!field || field.kind === 'text') return;
    touched.add(field.name);
    if (o.validateOn !== 'submit' || errors.has(field.name) || submitted) run(field);
    if (summaryEl) renderSummary();
  };

  const onFocusOut = (event) => {
    const field = fieldOfEvent(event.target);
    if (!field || field.kind !== 'text') return;
    if (o.validateOn === 'blur' && (touched.has(field.name) || errors.has(field.name))) {
      run(field);
      if (summaryEl) renderSummary();
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    submitted = true;
    const ok = validate();
    if (!ok) {
      const summary = renderSummary();
      if (summary) {
        summary.focus({ preventScroll: true });
        summary.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      } else {
        const first = fields().find((f) => errors.has(f.name));
        first?.focusTarget()?.focus();
      }
      o.onInvalid?.([...errors.values()].map(({ field, message }) => ({ name: field.name, label: field.label, message })));
      return;
    }
    summaryEl?.remove();
    summaryEl = null;
    o.onSubmit?.(data(), form);
  };

  const onSummaryClick = (event) => {
    const link = event.target.closest('[data-form-error]');
    if (!link || !summaryEl?.contains(link)) return;
    event.preventDefault();
    const field = fieldCache.get(link.dataset.formError);
    const target = field?.focusTarget();
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const onReset = () => setTimeout(() => clearAll());

  form.addEventListener('input', onInput);
  form.addEventListener('change', onChange);
  form.addEventListener('focusout', onFocusOut);
  form.addEventListener('submit', onSubmit);
  form.addEventListener('click', onSummaryClick);
  form.addEventListener('reset', onReset);
  fields().forEach(updateCounter);

  /* ───────── API ───────── */

  function data() {
    const out = {};
    for (const [key, value] of new FormData(form)) {
      if (key in out) out[key] = [].concat(out[key], value);
      else out[key] = value;
    }
    return out;
  }

  function validate() {
    let ok = true;
    fields().forEach((f) => {
      touched.add(f.name);
      if (!run(f)) ok = false;
    });
    if (summaryEl) renderSummary();
    return ok;
  }

  function clearAll() {
    fields().forEach(clearError);
    errors.clear();
    touched.clear();
    submitted = false;
    summaryEl?.remove();
    summaryEl = null;
    fields().forEach(updateCounter);
  }

  return {
    validate,
    data,
    errors: () => [...errors.values()].map(({ field, message }) => ({ name: field.name, label: field.label, message })),
    reset() {
      form.reset();
      clearAll();
    },
    destroy() {
      clearAll();
      form.removeEventListener('input', onInput);
      form.removeEventListener('change', onChange);
      form.removeEventListener('focusout', onFocusOut);
      form.removeEventListener('submit', onSubmit);
      form.removeEventListener('click', onSummaryClick);
      form.removeEventListener('reset', onReset);
    },
  };
}
