import { icon } from '../../ds/icons/icons.js';
import { createCalendar, localeWeekStart } from '../../ds/js/calendar.js';
import { toast } from '../../ds/js/toast.js';
import { dateFormat } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/calendario.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

/** Eventos de exemplo em volta de hoje, para o calendário nunca abrir vazio. */
function sampleEvents() {
  const at = (day, h, m = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + day);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const day = (n) => at(n, 0);
  return [
    { id: 'daily', title: L('Daily do time', 'Team daily', 'Daily del equipo'), start: at(0, 9), end: at(0, 9, 15) },
    { id: 'roteiro', title: L('Revisão do roteiro', 'Script review', 'Revisión del guion'), start: at(0, 10), end: at(0, 11), tone: 'brand' },
    { id: 'cafe', title: L('Café com a Ana', 'Coffee with Ana', 'Café con Ana'), start: at(0, 10, 30), end: at(0, 11, 30), tone: 'info' },
    { id: 'gravacao', title: L('Gravação', 'Recording', 'Grabación'), start: at(0, 14), end: at(0, 16, 30), tone: 'warning' },
    { id: 'corte', title: L('Entrega do corte', 'Cut delivery', 'Entrega del corte'), start: at(1, 11), end: at(1, 11, 30), tone: 'danger' },
    { id: 'planejamento', title: L('Planejamento', 'Planning', 'Planificación'), start: at(-1, 13), end: at(-1, 15), tone: 'brand' },
    { id: 'um-a-um', title: L('1:1 com o Léo', '1:1 with Léo', '1:1 con Léo'), start: at(2, 16), end: at(2, 16, 30) },
    { id: 'evento', title: L('Evento de lançamento', 'Launch event', 'Evento de lanzamiento'), start: day(3), end: day(5), allDay: true, tone: 'success' },
    { id: 'retro', title: L('Retrospectiva', 'Retrospective', 'Retrospectiva'), start: at(-3, 17), end: at(-3, 18), tone: 'info' },
    { id: 'design', title: L('Crítica de design', 'Design critique', 'Crítica de diseño'), start: at(7, 10), end: at(7, 11, 30), tone: 'brand' },
    { id: 'prazo', title: L('Prazo do relatório', 'Report deadline', 'Plazo del informe'), start: day(9), end: day(10), allDay: true, tone: 'warning' },
    { id: 'treino', title: L('Treinamento', 'Training', 'Capacitación'), start: at(-8, 9), end: at(-8, 12) },
    { id: 'cliente', title: L('Reunião com cliente', 'Client meeting', 'Reunión con cliente'), start: at(12, 15), end: at(12, 16), tone: 'info' },
  ];
}

const TONES = () => [
  ['neutral', L('Neutro', 'Neutral', 'Neutro'), L('O padrão: compromisso comum.', 'The default: a regular commitment.', 'El predeterminado: un compromiso común.')],
  ['brand', L('Marca', 'Brand', 'Marca'), L('O que é seu ou está em foco.', 'What’s yours or in focus.', 'Lo que es tuyo o está en foco.')],
  ['info', 'Info', L('Reuniões e conversas.', 'Meetings and conversations.', 'Reuniones y conversaciones.')],
  ['success', L('Sucesso', 'Success', 'Éxito'), L('Concluído, feriado, lançamento.', 'Done, holiday, launch.', 'Hecho, feriado, lanzamiento.')],
  ['warning', L('Aviso', 'Warning', 'Aviso'), L('Prazo chegando.', 'An upcoming deadline.', 'Un plazo que se acerca.')],
  ['danger', L('Perigo', 'Danger', 'Peligro'), L('Atrasado ou cancelado.', 'Late or canceled.', 'Atrasado o cancelado.')],
];

const OPTIONS = () => [
  ['view', "'month' | 'week' | 'day'", "'month'", L('Visão inicial.', 'Initial view.', 'Vista inicial.')],
  ['date', 'Date', L('hoje', 'today', 'hoy'), L('Dia em foco: define o mês, a semana ou o dia que aparece.', 'Day in focus: sets the month, week, or day shown.', 'Día en foco: define el mes, la semana o el día que aparece.')],
  ['events', '{ id, title, start, end, allDay?, tone? }[]', '[]', L('Fim exclusivo: 9:00 às 10:00 termina em 10:00; dia todo termina à meia-noite seguinte.', 'Exclusive end: 9:00 to 10:00 ends at 10:00; all-day ends at the next midnight.', 'Fin exclusivo: 9:00 a 10:00 termina a las 10:00; todo el día termina a la medianoche siguiente.')],
  ['weekStartsOn', '0 | 1', L('o do idioma', 'the locale’s', 'el del idioma'), L('0 = domingo, 1 = segunda.', '0 = Sunday, 1 = Monday.', '0 = domingo, 1 = lunes.')],
  ['views', 'string[]', "['month', 'week', 'day']", L('As visões do seletor. Com uma só, o seletor some.', 'The views in the switch. With only one, the switch disappears.', 'Las vistas del selector. Con una sola, el selector desaparece.')],
  ['scrollToHour', 'number', '8', L('Hora em que a grade de horas abre.', 'Hour the time grid opens at.', 'Hora en que se abre la cuadrícula de horas.')],
  ['onEventClick', '(event) => void', '—', L('Clique num evento. Sem ela, clicar no mês abre o dia.', 'Click on an event. Without it, clicking in the month opens the day.', 'Clic en un evento. Sin ella, hacer clic en el mes abre el día.')],
  ['onDateClick', '(date) => void', L('abre o dia', 'opens the day', 'abre el día'), L('Clique ou Enter num dia do mês.', 'Click or Enter on a day in the month.', 'Clic o Enter en un día del mes.')],
  ['onChange', '({ view, date }) => void', '—', L('Mudou a visão ou o período.', 'The view or the period changed.', 'Cambió la vista o el período.')],
];

const METHODS = () => [
  ['setView(view) · setDate(date)', L('Troca a visão ou o dia em foco.', 'Changes the view or the day in focus.', 'Cambia la vista o el día en foco.')],
  ['today() · prev() · next()', L('Volta para hoje ou anda um período.', 'Goes back to today or moves one period.', 'Vuelve a hoy o avanza un período.')],
  ['setEvents(list)', L('Troca os eventos e redesenha.', 'Replaces the events and redraws.', 'Cambia los eventos y redibuja.')],
  ['view · date', L('A visão e o dia atuais (só leitura).', 'The current view and day (read-only).', 'La vista y el día actuales (solo lectura).')],
  ['destroy()', L('Desliga tudo e limpa o elemento.', 'Turns everything off and clears the element.', 'Desconecta todo y limpia el elemento.')],
];

const KEYS = () => [
  [['←', '→'], L('Dia anterior ou seguinte', 'Previous or next day', 'Día anterior o siguiente')],
  [['↑', '↓'], L('Mesma data na semana anterior ou seguinte', 'Same day in the previous or next week', 'Mismo día en la semana anterior o siguiente')],
  [['Home', 'End'], L('Começo ou fim da semana', 'Start or end of the week', 'Inicio o fin de la semana')],
  [['PageUp', 'PageDown'], L('Mês anterior ou seguinte', 'Previous or next month', 'Mes anterior o siguiente')],
  [['Enter'], L('Abre o dia', 'Opens the day', 'Abre el día')],
];

/* ───────── Playground ───────── */

const weekLabel = (n) => dateFormat({ weekday: 'long' }).format(new Date(2026, 10, 1 + n)); // 1/11/2026 é domingo

function code(s) {
  const lines = [`import { createCalendar } from './ds/js/calendar.js';`, '', `createCalendar(document.querySelector('#${L('agenda', 'calendar', 'agenda')}'), {`];
  if (s.view !== 'month') lines.push(`  view: '${s.view}',`);
  if (s.start !== 'auto') lines.push(`  weekStartsOn: ${s.start}, // ${weekLabel(Number(s.start))}`);
  lines.push(
    s.data === 'empty'
      ? '  events: [],'
      : `  events: [\n    { id: '${L('roteiro', 'script', 'guion')}', title: '${L('Revisão do roteiro', 'Script review', 'Revisión del guion')}', start, end, tone: 'brand' },\n    { id: '${L('evento', 'event', 'evento')}', title: '${L('Evento de lançamento', 'Launch event', 'Evento de lanzamiento')}', start, end, allDay: true, tone: 'success' },\n  ],`,
  );
  lines.push(`  onEventClick: (event) => ${L('abrir', 'open', 'abrir')}(event.id),`, '});');
  return lines.join('\n');
}

function mountCalendar(preview, s) {
  const el = preview.querySelector('[data-cal]');
  const time = dateFormat({ hour: 'numeric', minute: '2-digit' });
  const cal = createCalendar(el, {
    view: s.view,
    events: s.data === 'empty' ? [] : sampleEvents(),
    weekStartsOn: s.start === 'auto' ? undefined : Number(s.start),
    onEventClick: (event) => toast(event.allDay ? event.title : `${event.title} · ${time.format(event.start)}`, { icon: 'calendar' }),
  });
  return () => cal.destroy();
}

/* ───────── Exemplos estáticos (as mesmas classes do componente) ───────── */

const sample = (tone, title, timeText) => `<span class="ds-calendar__event ds-calendar__event--${tone} cl-block"><span class="ds-calendar__event-title">${title}</span><span class="ds-calendar__event-time">${timeText}</span></span>`;

function forms() {
  const t = (h, m = 0) => dateFormat({ hour: 'numeric', minute: '2-digit' }).format(new Date(2026, 10, 4, h, m));
  return [
    [
      L('Com horário', 'Timed', 'Con horario'),
      L('No mês, uma linha: ponto no tom, hora e título. Na semana e no dia, um bloco do tamanho da duração.', 'In the month, one line: a dot in the tone, time, and title. In the week and day, a block as tall as the duration.', 'En el mes, una línea: punto en el tono, hora y título. En la semana y el día, un bloque del tamaño de la duración.'),
      `<div class="cl-stack">
        <span class="ds-calendar__item ds-calendar__item--brand"><span class="ds-calendar__dot"></span><span class="ds-calendar__item-time">${t(10)}</span><span class="ds-calendar__item-title">${L('Revisão do roteiro', 'Script review', 'Revisión del guion')}</span></span>
        ${sample('brand', L('Revisão do roteiro', 'Script review', 'Revisión del guion'), t(10))}
      </div>`,
    ],
    [
      L('Dia todo', 'All day', 'Todo el día'),
      L('Uma barra preenchida, no topo do dia — no mês e na faixa “Dia todo” da semana. Pode durar vários dias.', 'A filled bar at the top of the day — in the month and in the week’s “All day” row. It can span several days.', 'Una barra rellena, arriba del día — en el mes y en la franja “Todo el día” de la semana. Puede durar varios días.'),
      `<div class="cl-stack"><span class="ds-calendar__chip ds-calendar__chip--success">${L('Evento de lançamento', 'Launch event', 'Evento de lanzamiento')}</span></div>`,
    ],
    [
      L('Ao mesmo tempo', 'At the same time', 'Al mismo tiempo'),
      L('Eventos que se sobrepõem dividem a coluna. No mês, até três por dia; o resto vira “+2 outros”, que abre o dia.', 'Overlapping events split the column. In the month, up to three per day; the rest becomes “+2 more”, which opens the day.', 'Los eventos que se superponen dividen la columna. En el mes, hasta tres por día; el resto se vuelve “+2 otros”, que abre el día.'),
      `<div class="cl-overlap">${sample('brand', L('Roteiro', 'Script', 'Guion'), t(10))}${sample('info', L('Café', 'Coffee', 'Café'), t(10, 30))}</div>`,
    ],
  ];
}

/* ───────── Página ───────── */

const NAV = () => [
  ['playground', 'Playground'],
  ['eventos', L('Eventos', 'Events', 'Eventos')],
  ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
  ['api', 'API'],
  ['tokens', 'Tokens'],
  ['uso', L('Uso', 'Usage', 'Uso')],
];

const section = (id, title, desc, body) => `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        <p class="doc-section__desc">${desc}</p>
      </div>
    </header>
    ${body}
  </section>`;

export default function renderCalendario(page) {
  const firstDay = weekLabel(localeWeekStart());
  return `
  <div class="page doc cl-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Mês, semana e dia na mesma peça, com eventos. Datas, nomes e o primeiro dia da semana vêm do idioma — e dá para usar inteiro pelo teclado.', 'Month, week, and day in the same piece, with events. Dates, names, and the first day of the week come from the locale — and it’s fully usable by keyboard.', 'Mes, semana y día en la misma pieza, con eventos. Las fechas, los nombres y el primer día de la semana vienen del idioma — y se puede usar entero con el teclado.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('visões', 'views', 'vistas')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tons de evento', 'event tones', 'tonos de evento')}</dt><dd class="doc-stat__value">6</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('semana começa', 'week starts', 'la semana empieza')}</dt><dd class="doc-stat__value cl-stat-text">${firstDay}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('dependências', 'dependencies', 'dependencias')}</dt><dd class="doc-stat__value">0</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'playground',
      'Playground',
      L('O calendário de verdade, com eventos em volta de hoje. Troque a visão no próprio calendário, clique num evento ou num dia, use as setas no mês.', 'The real calendar, with events around today. Switch views in the calendar itself, click an event or a day, use the arrows in the month.', 'El calendario de verdad, con eventos alrededor de hoy. Cambia la vista en el propio calendario, haz clic en un evento o en un día, usa las flechas en el mes.'),
      playgroundMarkup('calendario', { wide: true }),
    )}

    ${section(
      'eventos',
      L('Eventos', 'Events', 'Eventos'),
      L('Três formas, conforme a duração, e seis tons. O tom nunca é a única pista: o título diz o que é.', 'Three shapes, depending on duration, and six tones. Tone is never the only cue: the title says what it is.', 'Tres formas, según la duración, y seis tonos. El tono nunca es la única pista: el título dice qué es.'),
      `<div class="cd-grid cl-forms">
        ${forms()
          .map(
            ([name, text, preview]) => `<article class="cd-example">
              <div class="cd-example__preview cl-preview" inert>${preview}</div>
              <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
            </article>`,
          )
          .join('')}
      </div>
      <h3 class="doc-subhead">${L('Tons', 'Tones', 'Tonos')} <span class="doc-subhead__meta">tone</span></h3>
      <div class="cl-tones">
        ${TONES()
          .map(
            ([tone, name, text]) => `<article class="cl-tone">
              ${sample(tone, name, `'${tone}'`)}
              <p class="cl-tone__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>`,
    )}

    ${section(
      'acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('O mês é uma grade de verdade (role="grid"): um só ponto de parada no Tab, e as setas andam pelos dias.', 'The month is a real grid (role="grid"): a single Tab stop, and the arrows move through the days.', 'El mes es una cuadrícula de verdad (role="grid"): una sola parada de Tab, y las flechas recorren los días.'),
      `${a11yList([
        [L('Cada dia diz o que tem', 'Each day says what it holds', 'Cada día dice lo que tiene'), L('O leitor de tela ouve “quarta-feira, 4 de novembro, hoje, 6 eventos” — nunca só “4”.', 'The screen reader hears “Wednesday, November 4, today, 6 events” — never just “4”.', 'El lector de pantalla oye “miércoles, 4 de noviembre, hoy, 6 eventos” — nunca solo “4”.')],
        [L('Hoje marcado', 'Today marked', 'Hoy marcado'), L(`O dia de hoje tem ${ic('aria-current="date"')}, além do círculo na cor da marca.`, `Today has ${ic('aria-current="date"')}, besides the circle in the brand color.`, `El día de hoy tiene ${ic('aria-current="date"')}, además del círculo en el color de la marca.`)],
        [L('Eventos com nome completo', 'Events with full names', 'Eventos con nombre completo'), L('Na semana e no dia, cada evento é um botão com título, horário e dia. No mês, Enter abre o dia, onde os eventos são botões.', 'In the week and day, each event is a button with title, time, and day. In the month, Enter opens the day, where events are buttons.', 'En la semana y el día, cada evento es un botón con título, horario y día. En el mes, Enter abre el día, donde los eventos son botones.')],
        [L('O título avisa a troca', 'The title announces changes', 'El título avisa el cambio'), L(`Ao trocar de mês, semana ou dia, o título (${ic('aria-live="polite"')}) é lido de novo.`, `When switching month, week, or day, the title (${ic('aria-live="polite"')}) is read again.`, `Al cambiar de mes, semana o día, el título (${ic('aria-live="polite"')}) se lee de nuevo.`)],
        [L('Tom nunca sozinho', 'Tone never alone', 'Tono nunca solo'), L('A cor ajuda a agrupar, mas o título do evento é o que conta. O texto do evento passa de 4,5:1 sobre o fundo do tom.', 'Color helps grouping, but the event title is what matters. Event text passes 4.5:1 on the tone background.', 'El color ayuda a agrupar, pero lo que cuenta es el título del evento. El texto del evento supera 4,5:1 sobre el fondo del tono.')],
      ])}
      <h3 class="doc-subhead">${L('Teclado no mês', 'Keyboard in the month', 'Teclado en el mes')}</h3>
      <div class="doc-table cl-keys">
        ${KEYS()
          .map(([keys, text]) => `<div class="doc-table__row"><span class="cl-keys__keys">${keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('')}</span><span class="cl-keys__text">${text}</span></div>`)
          .join('')}
      </div>`,
    )}

    ${section(
      'api',
      'API',
      L(`Um elemento vazio e ${ic('createCalendar')}. O componente desenha tudo dentro dele.`, `An empty element and ${ic('createCalendar')}. The component draws everything inside it.`, `Un elemento vacío y ${ic('createCalendar')}. El componente dibuja todo dentro de él.`),
      `<div class="doc-table cl-api">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Opção', 'Option', 'Opción')}</span><span>${L('Tipo', 'Type', 'Tipo')}</span><span>${L('Padrão', 'Default', 'Predeterminado')}</span><span>${L('Para quê', 'What for', 'Para qué')}</span></div>
        ${OPTIONS()
          .map(([name, type, def, text]) => `<div class="doc-table__row"><span><code class="ds-inline-code">${name}</code></span><span class="cl-api__type">${type}</span><span class="cl-api__type">${def}</span><span class="cl-api__text">${text}</span></div>`)
          .join('')}
      </div>
      <h3 class="doc-subhead">${L('Métodos', 'Methods', 'Métodos')}</h3>
      <div class="doc-table cl-methods">
        ${METHODS()
          .map(([name, text]) => `<div class="doc-table__row"><span><code class="ds-inline-code">${name}</code></span><span class="cl-api__text">${text}</span></div>`)
          .join('')}
      </div>
      <h3 class="doc-subhead">${L('Altura', 'Height', 'Altura')} <span class="doc-subhead__meta">CSS</span></h3>
      ${codeBlock(`.${L('agenda', 'calendar', 'agenda')} {\n  --ds-calendar-hour: 48px;    /* ${L('altura de uma hora', 'height of one hour', 'altura de una hora')} */\n  --ds-calendar-height: 600px; /* ${L('altura da grade de horas', 'height of the time grid', 'altura de la cuadrícula de horas')} */\n  --ds-calendar-cell: 112px;   /* ${L('altura mínima do dia no mês', 'minimum day height in the month', 'altura mínima del día en el mes')} */\n}`)}`,
    )}

    ${section(
      'tokens',
      L('Tokens usados', 'Tokens used', 'Tokens usados'),
      L('Superfícies e linhas do sistema; os tons dos eventos são os mesmos do Badge e do Alerta.', 'System surfaces and lines; event tones are the same as the Badge and Alert.', 'Superficies y líneas del sistema; los tonos de los eventos son los mismos del Badge y la Alerta.'),
      tokenTable([
        ['color.bg.surface', L('Fundo', 'Background', 'Fondo')],
        ['color.bg.sunken', L('Dias de fora do mês', 'Days outside the month', 'Días fuera del mes')],
        ['color.border.subtle', L('Linhas da grade', 'Grid lines', 'Líneas de la cuadrícula')],
        ['color.brand.solid', L('Círculo de hoje', 'Today’s circle', 'Círculo de hoy')],
        ['color.brand.indicator', L('Linha de agora', 'Now line', 'Línea de ahora')],
        ['color.brand.subtle', L('Evento no tom da marca', 'Brand-tone event', 'Evento en el tono de la marca')],
        ['color.info.subtle', L('Evento no tom info', 'Info-tone event', 'Evento en el tono info')],
        ['text.heading-md', L('Título', 'Title', 'Título')],
        ['text.caption', L('Dias da semana, horas e eventos', 'Weekdays, hours, and events', 'Días de la semana, horas y eventos')],
        ['radius.xl', L('Cantos', 'Corners', 'Esquinas')],
      ]),
    )}

    ${section(
      'uso',
      L('Uso', 'Usage', 'Uso'),
      L('O calendário mostra o tempo. Para escolher uma data num formulário, um campo de data basta.', 'The calendar shows time. To pick a date in a form, a date field is enough.', 'El calendario muestra el tiempo. Para elegir una fecha en un formulario, basta un campo de fecha.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: abra na visão da tarefa', 'Do: open in the task’s view', 'Haz: abre en la vista de la tarea')}</p>
          <p class="usage-card__text">${L('Agenda do dia abre no dia; planejamento, na semana; visão geral, no mês. Guarde a última escolha com onChange.', 'A day’s agenda opens on the day; planning, on the week; overview, on the month. Remember the last choice with onChange.', 'La agenda del día abre en el día; la planificación, en la semana; la vista general, en el mes. Guarda la última elección con onChange.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: um tom para cada evento', 'Avoid: one tone per event', 'Evita: un tono para cada evento')}</p>
          <p class="usage-card__text">${L('Cor demais vira ruído. Use o neutro como padrão e os tons para o que pede atenção: prazo, foco, cancelado.', 'Too much color becomes noise. Use neutral by default and tones for what needs attention: deadlines, focus, canceled.', 'Demasiado color se vuelve ruido. Usa el neutro por defecto y los tonos para lo que pide atención: plazo, foco, cancelado.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Títulos curtos', 'Short titles', 'Títulos cortos')}</p>
          <p class="usage-card__text">${L('No mês cabe pouco: “Revisão do roteiro”, não “Reunião para revisar o roteiro do vídeo”. O detalhe vai no clique.', 'Little fits in the month: “Script review”, not “Meeting to review the video script”. The details come on click.', 'En el mes cabe poco: “Revisión del guion”, no “Reunión para revisar el guion del video”. El detalle llega con el clic.')}</p>
        </article>
      </div>`,
    )}
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'calendario',
    controls: [
      { id: 'view', label: L('Abre em', 'Opens on', 'Abre en'), value: 'month', options: [{ value: 'month', label: L('Mês', 'Month', 'Mes') }, { value: 'week', label: L('Semana', 'Week', 'Semana') }, { value: 'day', label: L('Dia', 'Day', 'Día') }] },
      { id: 'start', label: L('Semana começa', 'Week starts', 'La semana empieza'), value: 'auto', options: [{ value: 'auto', label: L('Do idioma', 'From the locale', 'Del idioma') }, { value: '0', label: weekLabel(0) }, { value: '1', label: weekLabel(1) }] },
      { id: 'data', label: L('Eventos', 'Events', 'Eventos'), value: 'full', options: [{ value: 'full', label: L('Com eventos', 'With events', 'Con eventos') }, { value: 'empty', label: L('Sem eventos', 'No events', 'Sin eventos') }] },
    ],
    render: () => '<div class="cl-cal" data-cal></div>',
    mount: mountCalendar,
    code,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}

