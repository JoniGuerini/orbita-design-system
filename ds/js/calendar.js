/**
 * Calendário — visões de mês, semana e dia, com eventos.
 *
 *   const cal = createCalendar(document.querySelector('#agenda'), {
 *     view: 'month',                 // 'month' | 'week' | 'day'
 *     date: new Date(),              // dia em foco
 *     events: [
 *       { id: 'a', title: 'Revisão do roteiro', start: new Date(…), end: new Date(…), tone: 'brand' },
 *       { id: 'b', title: 'Feriado', start: new Date(…), end: new Date(…), allDay: true, tone: 'success' },
 *     ],
 *     onEventClick: (event) => abrir(event),
 *     onChange: ({ view, date }) => salvar(view, date),
 *   });
 *   cal.setView('week'); cal.setDate(d); cal.today(); cal.prev(); cal.next();
 *   cal.setEvents(lista); cal.destroy();
 *
 * Opções: weekStartsOn (0 domingo · 1 segunda; padrão: o do idioma), scrollToHour (8: a grade de horas
 * abre nessa hora), views (['month', 'week', 'day']: as que aparecem no seletor), onDateClick(date)
 * (padrão: abre a visão do dia).
 * Tons dos eventos: neutral (padrão) · brand · info · success · warning · danger.
 * Fim exclusivo: um evento de 9:00 às 10:00 termina em 10:00; um de dia todo, à meia-noite do dia seguinte.
 *
 * Teclado (visão do mês, padrão de grade): setas andam um dia ou uma semana, Home/End vão ao começo
 * e ao fim da semana, PageUp/PageDown trocam de mês, Enter abre o dia. Nas grades de horas, cada evento
 * é um botão com nome, horário e dia. Textos e datas no idioma atual (Intl).
 */
import { icon } from '../icons/icons.js';
import { msg, locale, dateFormat } from './i18n.js';

const VIEWS = ['month', 'week', 'day'];
const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger'];
const HOUR = 60 * 60 * 1000;
const MAX_IN_CELL = 3;
const MIN_MINUTES = 24; // evento curto ganha altura para o texto caber (e conta assim nas sobreposições)
let uid = 0;

const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const capitalize = (s) => s.charAt(0).toLocaleUpperCase(locale()) + s.slice(1);

/* ───────── Datas (sempre no horário local) ───────── */

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d, n) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
};
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const startOfWeek = (d, weekStartsOn) => addDays(startOfDay(d), -((d.getDay() - weekStartsOn + 7) % 7));
const minutesOf = (d) => d.getHours() * 60 + d.getMinutes();

/** Primeiro dia da semana no idioma (Intl.Locale.weekInfo, onde houver). */
export function localeWeekStart(tag = locale()) {
  try {
    const loc = new Intl.Locale(tag);
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info?.firstDay) return info.firstDay % 7;
  } catch {}
  return tag.startsWith('es') ? 1 : 0;
}

/** O evento acontece neste dia? (fim exclusivo) */
const onDay = (event, day) => {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  return event.start < dayEnd && (event.end > dayStart || +event.start === +event.end);
};

function normalize(list) {
  return (list ?? [])
    .map((e, i) => {
      const start = new Date(e.start);
      const end = e.end ? new Date(e.end) : e.allDay ? addDays(startOfDay(start), 1) : new Date(+start + HOUR);
      return { ...e, id: e.id ?? `evento-${i}`, start, end, allDay: Boolean(e.allDay), tone: TONES.includes(e.tone) ? e.tone : 'neutral' };
    })
    .sort((a, b) => b.allDay - a.allDay || a.start - b.start || b.end - b.start - (a.end - a.start));
}

/** Colunas para eventos que se sobrepõem num dia: grupos encadeados dividem a largura. */
function layoutDay(events) {
  const placed = [];
  let cluster = [];
  let clusterEnd = 0;
  let columns = [];
  const flush = () => {
    cluster.forEach((p) => (p.cols = columns.length));
    cluster = [];
    columns = [];
  };
  for (const event of events) {
    const end = Math.max(+event.end, +event.start + MIN_MINUTES * 60000);
    if (cluster.length && +event.start >= clusterEnd) flush();
    let col = columns.findIndex((e) => e <= +event.start);
    if (col === -1) {
      col = columns.length;
      columns.push(end);
    } else columns[col] = end;
    const p = { event, col, cols: 1 };
    cluster.push(p);
    placed.push(p);
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();
  return placed;
}

/* ───────── Componente ───────── */

export function createCalendar(root, options = {}) {
  const o = {
    view: 'month',
    date: new Date(),
    events: [],
    scrollToHour: 8,
    views: VIEWS,
    ...options,
  };
  const id = `ds-calendar-${++uid}`;
  let view = VIEWS.includes(o.view) ? o.view : 'month';
  let date = startOfDay(new Date(o.date));
  let events = normalize(o.events);
  let focusKey = key(date);
  let nowTimer = null;
  let scrollTop = null;

  const weekStart = () => o.weekStartsOn ?? localeWeekStart();
  const fmt = {
    time: () => {
      const h12 = new Intl.DateTimeFormat(locale(), { hour: 'numeric' }).resolvedOptions().hour12;
      return dateFormat(h12 ? { hour: 'numeric', minute: '2-digit' } : { hour: '2-digit', minute: '2-digit' });
    },
    hour: () => {
      const h12 = new Intl.DateTimeFormat(locale(), { hour: 'numeric' }).resolvedOptions().hour12;
      return dateFormat(h12 ? { hour: 'numeric' } : { hour: '2-digit', minute: '2-digit' });
    },
  };

  root.classList.add('ds-calendar');

  /* Título e navegação */

  function range() {
    if (view === 'month') {
      const first = new Date(date.getFullYear(), date.getMonth(), 1);
      const start = startOfWeek(first, weekStart());
      const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const weeks = Math.ceil(((last - start) / (24 * HOUR) + 1) / 7);
      return { start, days: weeks * 7 };
    }
    if (view === 'week') return { start: startOfWeek(date, weekStart()), days: 7 };
    return { start: date, days: 1 };
  }

  function title() {
    if (view === 'month') return capitalize(dateFormat({ month: 'long', year: 'numeric' }).format(date));
    if (view === 'week') {
      const { start } = range();
      const end = addDays(start, 6);
      const f = dateFormat({ day: 'numeric', month: 'long', year: 'numeric' });
      return capitalize(f.formatRange ? f.formatRange(start, end) : `${f.format(start)} – ${f.format(end)}`);
    }
    return capitalize(dateFormat({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date));
  }

  const header = () => `<header class="ds-calendar__header">
      <h2 class="ds-calendar__title" id="${id}-title" aria-live="polite">${escape(title())}</h2>
      <div class="ds-calendar__nav">
        <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-cal="today">${msg('calendar.today')}</button>
        <button type="button" class="ds-icon-btn ds-icon-btn--sm" data-cal="prev" aria-label="${msg(`calendar.prev.${view}`)}" data-ds-tooltip="${msg(`calendar.prev.${view}`)}">${icon('chevron-left', { size: 18 })}</button>
        <button type="button" class="ds-icon-btn ds-icon-btn--sm" data-cal="next" aria-label="${msg(`calendar.next.${view}`)}" data-ds-tooltip="${msg(`calendar.next.${view}`)}">${icon('chevron-right', { size: 18 })}</button>
      </div>
      ${
        o.views.length > 1
          ? `<div class="ds-segmented ds-calendar__views" role="radiogroup" aria-label="${msg('calendar.view')}">
          ${o.views
            .map((v) => `<button type="button" class="ds-segmented__item" role="radio" data-cal-view="${v}" aria-checked="${v === view}" tabindex="${v === view ? 0 : -1}">${msg(`calendar.${v}`)}</button>`)
            .join('')}
        </div>`
          : ''
      }
    </header>`;

  /* Visão do mês */

  const eventLabel = (e) => {
    const when = e.allDay ? msg('calendar.allDay') : dateFormat({ hour: 'numeric', minute: '2-digit' }).formatRange?.(e.start, e.end) ?? `${fmt.time().format(e.start)}–${fmt.time().format(e.end)}`;
    return `${e.title}, ${when}, ${dateFormat({ weekday: 'long', day: 'numeric', month: 'long' }).format(e.start)}`;
  };

  function monthView() {
    const { start, days } = range();
    const today = new Date();
    const weekdays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const short = dateFormat({ weekday: 'short' });
    const long = dateFormat({ weekday: 'long' });
    const cellLabel = dateFormat({ weekday: 'long', day: 'numeric', month: 'long' });
    const time = fmt.time();
    const rows = [];
    for (let w = 0; w < days / 7; w++) {
      const cells = [];
      for (let i = 0; i < 7; i++) {
        const day = addDays(start, w * 7 + i);
        const k = key(day);
        const list = events.filter((e) => onDay(e, day));
        const shown = list.length > MAX_IN_CELL ? list.slice(0, MAX_IN_CELL - 1) : list;
        const extra = list.length - shown.length;
        const isToday = sameDay(day, today);
        const outside = day.getMonth() !== date.getMonth();
        const label = [cellLabel.format(day), isToday ? msg('calendar.isToday') : '', msg('calendar.events', list.length)].filter(Boolean).join(', ');
        cells.push(`<div class="ds-calendar__day" role="gridcell" data-date="${k}" tabindex="${k === focusKey ? 0 : -1}" aria-label="${escape(label)}"${isToday ? ' data-today aria-current="date"' : ''}${outside ? ' data-outside' : ''}>
          <span class="ds-calendar__date" aria-hidden="true">${day.getDate()}</span>
          ${
            list.length
              ? `<div class="ds-calendar__items" aria-hidden="true">
              ${shown
                .map((e) =>
                  e.allDay
                    ? `<span class="ds-calendar__chip ds-calendar__chip--${e.tone}" data-event-id="${escape(e.id)}" title="${escape(e.title)}">${escape(e.title)}</span>`
                    : `<span class="ds-calendar__item ds-calendar__item--${e.tone}" data-event-id="${escape(e.id)}" title="${escape(e.title)}"><span class="ds-calendar__dot"></span><span class="ds-calendar__item-time">${time.format(e.start)}</span><span class="ds-calendar__item-title">${escape(e.title)}</span></span>`,
                )
                .join('')}
              ${extra ? `<span class="ds-calendar__more">${msg('calendar.more', extra)}</span>` : ''}
            </div>`
              : ''
          }
        </div>`);
      }
      rows.push(`<div class="ds-calendar__week" role="row">${cells.join('')}</div>`);
    }
    return `<div class="ds-calendar__month" role="grid" aria-labelledby="${id}-title" style="--_weeks: ${days / 7}">
      <div class="ds-calendar__weekdays" role="row">
        ${weekdays.map((d) => `<div class="ds-calendar__weekday" role="columnheader"><abbr title="${escape(long.format(d))}">${escape(short.format(d).replace('.', ''))}</abbr></div>`).join('')}
      </div>
      ${rows.join('')}
    </div>`;
  }

  /* Visões de semana e dia: grade de horas */

  function timeView() {
    const { start, days } = range();
    const list = Array.from({ length: days }, (_, i) => addDays(start, i));
    const today = new Date();
    const hour = fmt.hour();
    const time = fmt.time();
    const weekday = dateFormat({ weekday: 'short' });
    const allDay = list.map((d) => events.filter((e) => e.allDay && onDay(e, d)));
    const hasAllDay = allDay.some((l) => l.length);
    const cols = `--_days: ${days}`;

    const head = `<div class="ds-calendar__cols-head" style="${cols}">
        <span class="ds-calendar__gutter" aria-hidden="true"></span>
        ${list
          .map((d) => {
            const isToday = sameDay(d, today);
            const label = dateFormat({ weekday: 'long', day: 'numeric', month: 'long' }).format(d);
            const inner = `<span class="ds-calendar__col-weekday">${escape(weekday.format(d).replace('.', ''))}</span><span class="ds-calendar__col-date">${d.getDate()}</span>`;
            return view === 'week'
              ? `<button type="button" class="ds-calendar__col-head" data-cal-open="${key(d)}" aria-label="${escape(label)}"${isToday ? ' data-today aria-current="date"' : ''}>${inner}</button>`
              : `<div class="ds-calendar__col-head"${isToday ? ' data-today' : ''}>${inner}</div>`;
          })
          .join('')}
      </div>`;

    const allDayRow = hasAllDay
      ? `<div class="ds-calendar__allday" style="${cols}">
          <span class="ds-calendar__gutter ds-calendar__allday-label">${msg('calendar.allDay')}</span>
          ${allDay
            .map((l) => `<div class="ds-calendar__allday-cell">${l.map((e) => `<button type="button" class="ds-calendar__chip ds-calendar__chip--${e.tone}" data-event-id="${escape(e.id)}" aria-label="${escape(eventLabel(e))}">${escape(e.title)}</button>`).join('')}</div>`)
            .join('')}
        </div>`
      : '';

    const hours = Array.from({ length: 24 }, (_, h) => `<span class="ds-calendar__hour">${h ? escape(hour.format(new Date(2026, 0, 1, h))) : ''}</span>`).join('');

    const columns = list
      .map((d, i) => {
        const dayStart = startOfDay(d);
        const timed = events.filter((e) => !e.allDay && onDay(e, d));
        const blocks = layoutDay(timed).map(({ event: e, col, cols: n }) => {
          const from = Math.max(0, (e.start - dayStart) / 60000);
          const to = Math.min(24 * 60, (e.end - dayStart) / 60000);
          const short = to - from < 45;
          return `<button type="button" class="ds-calendar__event ds-calendar__event--${e.tone}${short ? ' ds-calendar__event--short' : ''}" data-event-id="${escape(e.id)}" aria-label="${escape(eventLabel(e))}"
            style="--_from: ${from}; --_len: ${Math.max(to - from, MIN_MINUTES)}; --_col: ${col}; --_cols: ${n}">
            <span class="ds-calendar__event-title">${escape(e.title)}</span>
            <span class="ds-calendar__event-time">${time.format(e.start)}</span>
          </button>`;
        });
        const isToday = sameDay(d, today);
        return `<div class="ds-calendar__col" style="grid-column: ${i + 2}"${isToday ? ' data-today' : ''}>
          ${isToday ? `<span class="ds-calendar__now" aria-hidden="true" style="--_from: ${minutesOf(today)}"></span>` : ''}
          ${blocks.join('')}
        </div>`;
      })
      .join('');

    return `<div class="ds-calendar__time" role="region" aria-labelledby="${id}-title">
      ${head}
      ${allDayRow}
      <div class="ds-calendar__scroll" data-cal-scroll tabindex="-1">
        <div class="ds-calendar__grid" style="${cols}">
          <div class="ds-calendar__hours" aria-hidden="true">${hours}</div>
          <div class="ds-calendar__lines" aria-hidden="true">${'<span></span>'.repeat(24)}</div>
          ${columns}
        </div>
      </div>
    </div>`;
  }

  /* Desenho */

  function render({ focus = false } = {}) {
    const scroller = root.querySelector('[data-cal-scroll]');
    if (scroller && view !== 'month') scrollTop = scroller.scrollTop;
    root.dataset.view = view;
    root.innerHTML = `${header()}<div class="ds-calendar__body">${view === 'month' ? monthView() : timeView()}</div>`;
    clearInterval(nowTimer);
    if (view !== 'month') {
      const next = root.querySelector('[data-cal-scroll]');
      const hourPx = parseFloat(getComputedStyle(root).getPropertyValue('--ds-calendar-hour')) || 48;
      next.scrollTop = scrollTop ?? Math.max(0, o.scrollToHour * hourPx - 8);
      nowTimer = setInterval(() => {
        const now = root.querySelector('.ds-calendar__now');
        if (now) now.style.setProperty('--_from', minutesOf(new Date()));
      }, 60 * 1000);
    }
    if (focus && view === 'month') root.querySelector(`.ds-calendar__day[data-date="${focusKey}"]`)?.focus();
  }

  const changed = () => o.onChange?.({ view, date: new Date(date) });

  function setView(next, { focus = false } = {}) {
    if (!VIEWS.includes(next)) return;
    if (next !== view) scrollTop = null;
    view = next;
    focusKey = key(date);
    render();
    if (focus) root.querySelector(`[data-cal-view="${view}"]`)?.focus();
    changed();
  }

  function setDate(next, { focus = false } = {}) {
    date = startOfDay(new Date(next));
    focusKey = key(date);
    render({ focus });
    changed();
  }

  const step = (dir) => {
    if (view === 'month') setDate(addMonths(date, dir));
    else setDate(addDays(date, view === 'week' ? 7 * dir : dir));
  };

  const openDay = (day) => {
    if (o.onDateClick) return o.onDateClick(new Date(day));
    date = startOfDay(day);
    setView('day');
  };

  /* Eventos do DOM */

  const findEvent = (el) => events.find((e) => String(e.id) === el.dataset.eventId);

  const onClick = (event) => {
    const act = event.target.closest('[data-cal]')?.dataset.cal;
    if (act === 'today') return setDate(new Date());
    if (act === 'prev') return step(-1);
    if (act === 'next') return step(1);
    const v = event.target.closest('[data-cal-view]')?.dataset.calView;
    if (v) return setView(v);
    const open = event.target.closest('[data-cal-open]');
    if (open) return openDay(fromKey(open.dataset.calOpen));
    const chip = event.target.closest('[data-event-id]');
    if (chip && o.onEventClick) {
      const found = findEvent(chip);
      if (found) return o.onEventClick({ ...found });
    }
    const cell = event.target.closest('.ds-calendar__day');
    if (cell) {
      focusKey = cell.dataset.date;
      openDay(fromKey(cell.dataset.date));
    }
  };

  const onKeydown = (event) => {
    const views = event.target.closest('.ds-calendar__views');
    if (views) {
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!delta) return;
      event.preventDefault();
      const i = o.views.indexOf(view);
      setView(o.views[(i + delta + o.views.length) % o.views.length], { focus: true });
      return;
    }
    const cell = event.target.closest('.ds-calendar__day');
    if (!cell) return;
    const day = fromKey(cell.dataset.date);
    const ws = weekStart();
    const moves = {
      ArrowRight: () => addDays(day, 1),
      ArrowLeft: () => addDays(day, -1),
      ArrowDown: () => addDays(day, 7),
      ArrowUp: () => addDays(day, -7),
      Home: () => startOfWeek(day, ws),
      End: () => addDays(startOfWeek(day, ws), 6),
      PageDown: () => addMonths(day, 1),
      PageUp: () => addMonths(day, -1),
    };
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDay(day);
      return;
    }
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const target = move();
    focusKey = key(target);
    if (target.getMonth() !== date.getMonth() || target.getFullYear() !== date.getFullYear()) {
      date = target;
      render({ focus: true });
      changed();
    } else {
      root.querySelectorAll('.ds-calendar__day[tabindex="0"]').forEach((c) => (c.tabIndex = -1));
      const next = root.querySelector(`.ds-calendar__day[data-date="${focusKey}"]`);
      next.tabIndex = 0;
      next.focus();
    }
  };

  // textos e datas acompanham a troca de idioma
  const onLocale = () => render();

  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKeydown);
  document.documentElement.addEventListener('ds:localechange', onLocale);
  render();

  return {
    get view() {
      return view;
    },
    get date() {
      return new Date(date);
    },
    setView: (v) => setView(v),
    setDate: (d) => setDate(d),
    today: () => setDate(new Date()),
    prev: () => step(-1),
    next: () => step(1),
    setEvents(list) {
      events = normalize(list);
      render();
    },
    destroy() {
      clearInterval(nowTimer);
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeydown);
      document.documentElement.removeEventListener('ds:localechange', onLocale);
      root.innerHTML = '';
      root.classList.remove('ds-calendar');
      delete root.dataset.view;
    },
  };
}
