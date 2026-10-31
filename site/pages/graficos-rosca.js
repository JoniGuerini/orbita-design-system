import { icon } from '../../ds/icons/icons.js';
import { contrast } from '../../ds/tokens.js';
import { donutChart, barChart, meter } from '../../ds/js/charts.js';
import { formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';
import { payments } from '../chart-data.js';
import { L, ratio } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-rosca.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const THICKNESS = () => [
  ['14', L('Fina', 'Thin', 'Fina'), 14],
  ['24', L('Média', 'Medium', 'Media'), 24],
  ['36', L('Grossa', 'Thick', 'Gruesa'), 36],
];

const CENTERS = () => [
  ['total', 'Total'],
  ['custom', L('Personalizado', 'Custom', 'Personalizado')],
  ['none', L('Nenhum', 'None', 'Ninguno')],
];

const pct = (v) => formatNumber(v, { style: 'percent', maximumFractionDigits: 1 });

/** Divisão por região com valores próximos — o caso em que a rosca não ajuda. */
const REGIONS = () => [
  { name: L('Sudeste', 'Southeast', 'Sureste'), value: 2210 },
  { name: L('Norte', 'North', 'Norte'), value: 2130 },
  { name: L('Nordeste', 'Northeast', 'Noreste'), value: 2040 },
  { name: L('Centro-Oeste', 'Center-West', 'Centro-Oeste'), value: 1930 },
  { name: L('Sul', 'South', 'Sur'), value: 1820 },
];

const minContrast = Math.min(...contrast.filter((c) => /^color\.chart\.series\.[1-6]$/.test(c.fg) && c.bg === 'color.bg.surface').map((c) => c.ratio));

const byMethod = () => L('Pagamentos por método', 'Payments by method', 'Pagos por método');
const transactions = () => L('transações', 'transactions', 'transacciones');
const others = () => L('Outros', 'Others', 'Otros');

/* ───────── Playground ───────── */

function playOptions(state) {
  const items = payments().slice(0, Number(state.slices));
  const total = items.reduce((a, it) => a + it.value, 0);
  const center = state.center === 'custom' ? { value: pct(items[0].value / total), label: L('via Pix', 'via Pix', 'vía Pix') } : state.center === 'none' ? false : 'total';
  return {
    title: byMethod(),
    subtitle: L('Transações em outubro', 'Transactions in October', 'Transacciones en octubre'),
    items,
    format: 'integer',
    thickness: Number(state.thickness),
    center,
    centerLabel: transactions(),
    texture: state.texture === 'on',
  };
}

function playCode(state) {
  const o = playOptions(state);
  const center = o.center === false ? 'center: false,' : typeof o.center === 'object' ? `center: { value: '${o.center.value}', label: '${o.center.label}' },` : `centerLabel: '${transactions()}',`;
  const lines = [
    `title: '${o.title}',`,
    `subtitle: '${o.subtitle}',`,
    'items: [',
    ...o.items.map((it) => `  { name: '${it.name}', value: ${it.value} },`),
    '],',
    "format: 'integer',",
    o.thickness !== 24 && `thickness: ${o.thickness},`,
    center,
    o.texture && 'texture: true,',
  ].filter(Boolean);
  const fold = o.items.length > 6 ? `\n// ${L('Mais de 6 itens: os menores viram “Outros”, em cinza.', 'More than 6 items: the smallest become “Others”, in gray.', 'Más de 6 elementos: los menores se vuelven “Otros”, en gris.')}` : '';
  return `import { donutChart } from './ds/js/charts.js';${fold}\n\ndonutChart(document.querySelector('#${L('pagamentos', 'payments', 'pagos')}'), {\n${lines.map((l) => `  ${l}`).join('\n')}\n});`;
}

/* ───────── Variantes ───────── */

const VARIANTS = () => {
  const pay = payments();
  return [
    {
      id: 'total',
      name: L('Total no miolo', 'Total in the center', 'Total en el centro'),
      code: "center: 'total'",
      text: L('O padrão. O miolo soma tudo; no hover, mostra a fatia. A lista ao lado é a legenda e o rótulo de cada parte.', 'The default. The center adds everything up; on hover, it shows the slice. The list beside it is the legend and the label for each part.', 'El predeterminado. El centro suma todo; con hover, muestra la porción. La lista al lado es la leyenda y la etiqueta de cada parte.'),
      options: { title: byMethod(), items: pay.slice(0, 5), format: 'integer', centerLabel: transactions() },
    },
    {
      id: 'outros',
      name: L('Cauda em “Outros”', 'Tail in “Others”', 'Cola en “Otros”'),
      code: 'maxSegments: 6',
      text: L('Da 6ª fatia em diante, as menores viram “Outros”, em cinza e sempre por último. A tabela abre a cauda.', 'From the 6th slice on, the smallest become “Others”, in gray and always last. The table opens up the tail.', 'De la 6.ª porción en adelante, las menores se vuelven “Otros”, en gris y siempre al final. La tabla abre la cola.'),
      options: { title: L('Todos os métodos', 'All methods', 'Todos los métodos'), items: pay, format: 'integer', centerLabel: transactions() },
    },
    {
      id: 'textura',
      name: L('Com textura', 'With texture', 'Con textura'),
      code: 'texture: true',
      text: L('Hachura em 45° e 135° para daltonismo total, impressão e alto contraste. Na impressão, liga sozinha.', 'Hatching at 45° and 135° for total color blindness, print, and high contrast. In print, it turns on by itself.', 'Rayado a 45° y 135° para daltonismo total, impresión y alto contraste. En la impresión, se activa sola.'),
      options: { title: byMethod(), items: pay.slice(0, 4), format: 'integer', centerLabel: transactions(), texture: true },
    },
    {
      id: 'fina',
      name: L('Fina, com miolo próprio', 'Thin, with a custom center', 'Fina, con centro propio'),
      code: 'thickness: 14',
      text: L('Anel fino quando o número do miolo é a mensagem. Diga o que ele significa no rótulo.', 'A thin ring when the center number is the message. Say what it means in the label.', 'Anillo fino cuando el número del centro es el mensaje. Di qué significa en la etiqueta.'),
      options: {
        title: L('Aprovação de cadastros', 'Sign-up approval', 'Aprobación de registros'),
        items: [
          { name: L('Aprovados', 'Approved', 'Aprobados'), value: 812, color: 1 },
          { name: L('Em análise', 'Under review', 'En análisis'), value: 146, color: 2 },
          { name: L('Recusados', 'Declined', 'Rechazados'), value: 42, color: 'other' },
        ],
        format: 'integer',
        thickness: 14,
        center: { value: formatNumber(0.81, { style: 'percent' }), label: L('aprovados', 'approved', 'aprobados') },
      },
    },
  ];
};

const STATES = () => [
  ['hover', L('Hover e teclado', 'Hover and keyboard', 'Hover y teclado'), L('A fatia sai 4 px do anel, as outras apagam e o miolo mostra o percentual. A linha da lista acende junto.', 'The slice moves 4 px out of the ring, the others fade, and the center shows the percentage. The list row lights up too.', 'La porción sale 4 px del anillo, las demás se atenúan y el centro muestra el porcentaje. La fila de la lista se ilumina a la vez.')],
  ['carregando', L('Carregando', 'Loading', 'Cargando'), L('Ao buscar dados novos, a rosca anterior fica a meia opacidade — sem esqueleto, sem pulo.', 'While fetching new data, the previous donut stays at half opacity — no skeleton, no jump.', 'Al buscar datos nuevos, la dona anterior queda a media opacidad — sin esqueleto, sin saltos.')],
  ['vazio', L('Vazio', 'Empty', 'Vacío'), L('Sem valores, um aviso ocupa o lugar do anel. Uma rosca vazia não é um círculo cinza.', 'With no values, a notice takes the ring’s place. An empty donut isn’t a gray circle.', 'Sin valores, un aviso ocupa el lugar del anillo. Una dona vacía no es un círculo gris.')],
];

/* ───────── API ───────── */

const API = () => [
  ['items', '[{ name, value, color? }]', '—', L('Uma entrada por fatia, na ordem em que aparecem a partir das 12 h. Ordene da maior para a menor.', 'One entry per slice, in the order they appear from 12 o’clock. Sort from largest to smallest.', 'Una entrada por porción, en el orden en que aparecen desde las 12. Ordena de mayor a menor.')],
  ['format', L('preset | Intl | função', 'preset | Intl | function', 'preset | Intl | función'), "'number'", L('Formato dos valores no miolo, na lista e na tabela. O percentual é calculado.', 'Format of the values in the center, the list, and the table. The percentage is computed.', 'Formato de los valores en el centro, la lista y la tabla. El porcentaje se calcula.')],
  ['center', "'total' | { value, label } | false", "'total'", L('O que o miolo mostra fora do hover.', 'What the center shows outside of hover.', 'Lo que muestra el centro fuera del hover.')],
  ['centerLabel', 'string', "'Total'", L('Rótulo sob o total. Diga a unidade: “transações”, “clientes”.', 'Label under the total. Say the unit: “transactions”, “customers”.', 'Etiqueta bajo el total. Di la unidad: “transacciones”, “clientes”.')],
  ['maxSegments', L('número', 'number', 'número'), '6', L('Acima disso, as menores fatias viram “Outros”.', 'Above that, the smallest slices become “Others”.', 'Por encima de eso, las porciones menores se vuelven “Otros”.')],
  ['otherLabel', 'string', `'${others()}'`, L('Nome da fatia que agrupa a cauda.', 'Name of the slice that groups the tail.', 'Nombre de la porción que agrupa la cola.')],
  ['size · thickness', 'px', '200 · 24', L('Diâmetro e espessura do anel. A lista vai para baixo quando não cabe ao lado.', 'Diameter and thickness of the ring. The list moves below when it doesn’t fit beside it.', 'Diámetro y grosor del anillo. La lista baja cuando no cabe al lado.')],
  ['texture', 'boolean', 'false', L('Hachura de reserva para quando a cor não basta.', 'Backup hatching for when color isn’t enough.', 'Rayado de reserva para cuando el color no basta.')],
  ['title · subtitle', 'string', '—', L(`Cabeçalho. Sem título, passe ${ic('label')} para nomear o gráfico.`, `Header. Without a title, pass ${ic('label')} to name the chart.`, `Encabezado. Sin título, pasa ${ic('label')} para nombrar el gráfico.`)],
  ['categoryLabel · valueLabel', 'string', L("'Categoria' · 'Valor'", "'Category' · 'Value'", "'Categoría' · 'Valor'"), L('Cabeçalhos das colunas da vista em tabela.', 'Column headers of the table view.', 'Encabezados de las columnas de la vista en tabla.')],
];

/* ───────── Anatomia (desenho estático) ───────── */

function anatomySvg() {
  const cx = 120;
  const cy = 110;
  const R = 88;
  const r = 64;
  const shares = [0.46, 0.29, 0.14, 0.07, 0.04];
  const colors = [1, 2, 3, 4, 'other'];
  const gap = 2 / ((R + r) / 2);
  const f = (n) => Math.round(n * 100) / 100;
  const p = (rad, a) => `${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`;
  let a = -Math.PI / 2;
  const segs = shares
    .map((s, i) => {
      const a0 = a + gap / 2;
      const a1 = a + s * Math.PI * 2 - gap / 2;
      a += s * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const c = colors[i] === 'other' ? 'var(--ds-color-chart-other)' : `var(--ds-color-chart-series-${colors[i]})`;
      return `<path d="M${p(R, a0)}A${R} ${R} 0 ${large} 1 ${p(R, a1)}L${p(r, a1)}A${r} ${r} 0 ${large} 0 ${p(r, a0)}Z" style="fill:${c}"/>`;
    })
    .join('');
  const rows = [
    ['Pix', 4210, 0.46, 1],
    [L('Crédito', 'Credit', 'Crédito'), 2630, 0.29, 2],
    [L('Débito', 'Debit', 'Débito'), 1290, 0.14, 3],
    ['Boleto', 610, 0.07, 4],
    [others(), 380, 0.04, 'other'],
  ]
    .map(([name, value, share, c], i) => {
      const y = 38 + i * 36;
      const fill = c === 'other' ? 'var(--ds-color-chart-other)' : `var(--ds-color-chart-series-${c})`;
      return `${i ? `<line x1="268" x2="540" y1="${y - 18}" y2="${y - 18}" class="gr-anat__rule"/>` : ''}
        <rect x="276" y="${y - 5}" width="10" height="10" rx="3" style="fill:${fill}"/>
        <text x="298" y="${y}" class="gr-anat__name" dominant-baseline="middle">${name}</text>
        <text x="482" y="${y}" class="gr-anat__value" text-anchor="end" dominant-baseline="middle">${formatNumber(value)}</text>
        <text x="532" y="${y}" class="gr-anat__share" text-anchor="end" dominant-baseline="middle">${formatNumber(share, { style: 'percent' })}</text>`;
    })
    .join('');
  const num = (n, x, y) => `<g class="gr-anat__callout"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 4}" text-anchor="middle">${n}</text></g>`;
  // respiro entre a 1ª e a 2ª fatia (fim da 1ª): ângulo a1 da fatia 0
  const ag = -Math.PI / 2 + shares[0] * Math.PI * 2;
  return `<svg viewBox="0 0 560 220" class="gr-anat">
    ${segs}
    <text x="${cx}" y="${cy - 2}" class="gr-anat__center" text-anchor="middle">${formatNumber(9120)}</text>
    <text x="${cx}" y="${cy + 18}" class="gr-anat__center-label" text-anchor="middle">${transactions()}</text>
    <path class="gr-anat__dim" d="M${p(R + 6, -Math.PI / 2 - 0.5)}L${p(r - 6, -Math.PI / 2 - 0.5)}"/>
    <circle cx="${f(cx + ((R + r) / 2) * Math.cos(ag))}" cy="${f(cy + ((R + r) / 2) * Math.sin(ag))}" r="9" class="gr-anat__ring"/>
    ${rows}
    ${num(1, 28, 34)}
    ${num(2, f(cx + (R + 22) * Math.cos(ag)), f(cy + (R + 22) * Math.sin(ag)))}
    ${num(3, cx, cy - 40)}
    ${num(4, 254, 38)}
    ${num(5, 254, 182)}
  </svg>`;
}

/* ───────── Página ───────── */

const section = (id, title, desc, body) => `
  <section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        <p class="doc-section__desc">${desc}</p>
      </div>
    </header>
    ${body}
  </section>`;

export default function renderRosca(page) {
  const minRatio = ratio(minContrast);
  const regions = REGIONS();
  const regionTotal = regions.reduce((a, r) => a + r.value, 0);
  const [top, second] = regions.map((r) => pct(r.value / regionTotal));
  return `
  <div class="page doc gr-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('A parte do todo de relance. Até seis fatias, o total no miolo e uma lista que é legenda e rótulo ao mesmo tempo.', 'Part of a whole at a glance. Up to six slices, the total in the center, and a list that’s legend and label at once.', 'La parte del todo de un vistazo. Hasta seis porciones, el total en el centro y una lista que es leyenda y etiqueta a la vez.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('fatias no máximo', 'max slices', 'porciones como máximo')}</dt><dd class="doc-stat__value">6</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('espessura padrão', 'default thickness', 'grosor predeterminado')}</dt><dd class="doc-stat__value">24 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('respiro entre fatias', 'gap between slices', 'respiro entre porciones')}</dt><dd class="doc-stat__value">2 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('contraste mínimo', 'minimum contrast', 'contraste mínimo')}</dt><dd class="doc-stat__value">${minRatio}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['variantes', L('Variantes', 'Variants', 'Variantes')],
        ['rosca-ou-barras', L('Rosca ou barras', 'Donut or bars', 'Dona o barras')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['anatomia', L('Anatomia', 'Anatomy', 'Anatomía')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
        ['api', 'API'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section('playground', 'Playground', L('Mude o número de fatias, a espessura e o miolo. Com 7 fatias, veja a cauda virar “Outros”. Passe o mouse no anel ou na lista.', 'Change the number of slices, the thickness, and the center. With 7 slices, watch the tail become “Others”. Hover the ring or the list.', 'Cambia el número de porciones, el grosor y el centro. Con 7 porciones, mira cómo la cola se vuelve “Otros”. Pasa el mouse por el anillo o la lista.'), playgroundMarkup('graficos-rosca', { wide: true }))}

    ${section(
      'variantes',
      L('Variantes', 'Variants', 'Variantes'),
      L('Mesma anatomia, quatro ajustes. A rosca nunca ganha 3D, sombra ou fatia descolada.', 'Same anatomy, four tweaks. The donut never gets 3D, shadows, or an exploded slice.', 'Misma anatomía, cuatro ajustes. La dona nunca recibe 3D, sombra ni porción despegada.'),
      `<div class="gr-variants">
        ${VARIANTS().map(
          (v) => `<article class="gr-variant">
            <div class="gr-variant__chart" data-variant="${v.id}"></div>
            <div class="gr-variant__body">
              <p class="gr-variant__name">${v.name}<code>${v.code}</code></p>
              <p class="gr-variant__text">${v.text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>
      <h3 class="doc-subhead">${L('Lado a lado ou empilhada', 'Side by side or stacked', 'Lado a lado o apilada')}<span class="doc-subhead__meta">${L('automático, pela largura', 'automatic, by width', 'automático, por el ancho')}</span></h3>
      <article class="gr-variant">
        <div class="gr-layouts">
          <div class="gr-layouts__wide"><p class="gr-layouts__label">${L('Com espaço: lista ao lado', 'With room: list beside', 'Con espacio: lista al lado')}</p><div data-layout-chart="side"></div></div>
          <div class="gr-layouts__narrow"><p class="gr-layouts__label">${L('No estreito: lista embaixo', 'When narrow: list below', 'En lo estrecho: lista debajo')}</p><div data-layout-chart="stack"></div></div>
        </div>
        <div class="gr-variant__body">
          <p class="gr-variant__text">${L('Com espaço (diâmetro + 260 px), a lista fica ao lado da rosca. No estreito, desce para baixo dela — sem você configurar nada.', 'With room (diameter + 260 px), the list sits beside the donut. When narrow, it drops below — without you configuring anything.', 'Con espacio (diámetro + 260 px), la lista queda al lado de la dona. En lo estrecho, baja debajo de ella — sin que configures nada.')}</p>
        </div>
      </article>`,
    )}

    ${section(
      'rosca-ou-barras',
      L('Rosca ou barras?', 'Donut or bars?', '¿Dona o barras?'),
      L('A rosca mostra proporção; ninguém compara ângulos com precisão. Quando os valores são próximos, use barras.', 'A donut shows proportion; no one compares angles precisely. When values are close, use bars.', 'La dona muestra proporción; nadie compara ángulos con precisión. Cuando los valores son cercanos, usa barras.'),
      `<div class="gr-compare">
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: rosca para valores próximos', 'Avoid: a donut for close values', 'Evita: dona para valores cercanos')}</p>
          <div class="gr-compare__chart" data-compare="donut"></div>
          <p class="usage-card__text">${L(`Qual região é a maior? Com ${top} contra ${second}, o ângulo não responde — a pessoa precisa ler a lista.`, `Which region is largest? With ${top} against ${second}, the angle doesn’t answer — people have to read the list.`, `¿Qué región es la mayor? Con ${top} contra ${second}, el ángulo no responde — la persona necesita leer la lista.`)}</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: barras ordenadas', 'Do: sorted bars', 'Haz: barras ordenadas')}</p>
          <div class="gr-compare__chart" data-compare="bars"></div>
          <p class="usage-card__text">${L('Comprimento sobre a mesma base: a ordem salta aos olhos e o valor fica na ponta.', 'Length on the same base: the order jumps out and the value sits at the end.', 'Longitud sobre la misma base: el orden salta a la vista y el valor queda en el extremo.')}</p>
        </article>
      </div>`,
    )}

    ${section(
      'estados',
      L('Estados', 'States', 'Estados'),
      L('O primeiro começa com uma fatia em destaque — passe o mouse ou use as setas para trocar.', 'The first starts with a slice highlighted — hover or use the arrows to switch.', 'El primero empieza con una porción destacada — pasa el mouse o usa las flechas para cambiar.'),
      `<div class="gr-states">
        ${STATES().map(
          ([id, name, text]) => `<article class="gr-variant">
            <div class="gr-variant__chart" data-state-chart="${id}"></div>
            <div class="gr-variant__body">
              <p class="gr-variant__name">${name}${id === 'carregando' ? `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-reload>${icon('refresh', { size: 16 })}${L('Recarregar', 'Reload', 'Recargar')}</button>` : ''}</p>
              <p class="gr-variant__text">${text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'anatomia',
      L('Anatomia', 'Anatomy', 'Anatomía'),
      L('Cinco partes. A rosca é só o resumo visual; quem carrega os números é a lista.', 'Five parts. The donut is just the visual summary; the list carries the numbers.', 'Cinco partes. La dona es solo el resumen visual; quien lleva los números es la lista.'),
      `<div class="gr-anatomy">
        <div class="gr-anatomy__stage" aria-hidden="true">${anatomySvg()}</div>
        <ol class="gr-anatomy__legend" role="list">
          ${[
            [L('Anel', 'Ring', 'Anillo'), L('Espessura de 24 px por padrão (14 a 36). As fatias começam às 12 h e seguem no sentido horário, da maior para a menor.', '24 px thick by default (14 to 36). Slices start at 12 o’clock and go clockwise, from largest to smallest.', 'Grosor de 24 px por defecto (14 a 36). Las porciones empiezan a las 12 y siguen en sentido horario, de mayor a menor.')],
            [L('Respiro', 'Gap', 'Respiro'), L('2 px entre fatias, abertos no próprio desenho — a superfície aparece. Nunca um contorno em volta da fatia.', '2 px between slices, cut into the drawing itself — the surface shows through. Never an outline around the slice.', '2 px entre porciones, abiertos en el propio dibujo — se ve la superficie. Nunca un contorno alrededor de la porción.')],
            [L('Miolo', 'Center', 'Centro'), L('O total em sans semibold, com algarismos proporcionais, e o rótulo com a unidade. No hover, vira o percentual da fatia.', 'The total in sans semibold, with proportional figures, and the label with the unit. On hover, it becomes the slice’s percentage.', 'El total en sans semibold, con cifras proporcionales, y la etiqueta con la unidad. Con hover, se vuelve el porcentaje de la porción.')],
            [L('Lista', 'List', 'Lista'), L('Legenda e rótulo direto ao mesmo tempo: cor, nome, valor e percentual, com números alinhados em colunas.', 'Legend and direct label at once: color, name, value, and percentage, with numbers aligned in columns.', 'Leyenda y etiqueta directa a la vez: color, nombre, valor y porcentaje, con números alineados en columnas.')],
            [others(), L(`A cauda agrupada, em ${ic('chart.other')}, sempre por último. Nunca uma 7ª cor.`, `The grouped tail, in ${ic('chart.other')}, always last. Never a 7th color.`, `La cola agrupada, en ${ic('chart.other')}, siempre al final. Nunca un 7.º color.`)],
          ]
            .map(([title, text], i) => `<li><span class="gr-anatomy__num">${i + 1}</span><div><p class="gr-anatomy__title">${title}</p><p class="gr-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'acessibilidade',
      L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
      L('A rosca já sai acessível. O que continua sendo seu: um título claro e o rótulo da unidade no miolo.', 'The donut comes out accessible. What’s still yours: a clear title and the unit label in the center.', 'La dona ya sale accesible. Lo que sigue siendo tuyo: un título claro y la etiqueta de la unidad en el centro.'),
      a11yList([
        [L('Tabela sempre à mão', 'A table always at hand', 'Tabla siempre a mano'), L('O botão no cabeçalho troca a rosca por uma tabela com nome, valor e percentual — inclusive os itens agrupados em “Outros”, um por um.', 'The button in the header swaps the donut for a table with name, value, and percentage — including the items grouped into “Others”, one by one.', 'El botón del encabezado cambia la dona por una tabla con nombre, valor y porcentaje — incluso los elementos agrupados en “Otros”, uno por uno.')],
        [L('Teclado', 'Keyboard', 'Teclado'), L('Tab foca o gráfico; as setas percorrem as fatias; Home e End vão à primeira e à última; Esc volta ao total.', 'Tab focuses the chart; the arrows walk through the slices; Home and End go to the first and last; Esc returns to the total.', 'Tab enfoca el gráfico; las flechas recorren las porciones; Home y End van a la primera y a la última; Esc vuelve al total.'), ['Tab', '←', '→', 'Home', 'End', 'Esc']],
        [L('Leitor de tela', 'Screen reader', 'Lector de pantalla'), L('O gráfico se anuncia com título e número de fatias. A cada seta, uma região ao vivo lê o nome, o percentual e o valor.', 'The chart announces itself with title and number of slices. On each arrow press, a live region reads the name, percentage, and value.', 'El gráfico se anuncia con título y número de porciones. Con cada flecha, una región en vivo lee el nombre, el porcentaje y el valor.')],
        [L('Cor nunca sozinha', 'Never color alone', 'Nunca solo color'), L(`Cada fatia tem nome e número na lista, na mesma ordem do anel. Para daltonismo total, impressão e alto contraste, ligue ${ic('texture')}.`, `Each slice has a name and number in the list, in the same order as the ring. For total color blindness, print, and high contrast, turn on ${ic('texture')}.`, `Cada porción tiene nombre y número en la lista, en el mismo orden del anillo. Para daltonismo total, impresión y alto contraste, activa ${ic('texture')}.`)],
        [L('Contraste verificado', 'Contrast checked', 'Contraste verificado'), L(`As 6 primeiras cores de série passam de 3:1 sobre a superfície nos dois temas — a menor fica em ${minRatio}.`, `The first 6 series colors pass 3:1 on the surface in both themes — the lowest sits at ${minRatio}.`, `Los 6 primeros colores de serie superan 3:1 sobre la superficie en los dos temas — el menor queda en ${minRatio}.`)],
        [L('Movimento', 'Motion', 'Movimiento'), L('As fatias aparecem uma vez, em fade. Com movimento reduzido, nada anima — nem o destaque da fatia.', 'The slices appear once, with a fade. With reduced motion, nothing animates — not even the slice highlight.', 'Las porciones aparecen una vez, con fundido. Con movimiento reducido, nada se anima — ni el destacado de la porción.')],
      ]),
    )}

    ${section(
      'tokens',
      L('Tokens usados', 'Tokens used', 'Tokens usados'),
      L('Fatias usam as cores de gráfico, na ordem fixa; textos usam sempre os tokens de texto.', 'Slices use the chart colors, in fixed order; text always uses the text tokens.', 'Las porciones usan los colores de gráfico, en orden fijo; los textos usan siempre los tokens de texto.'),
      tokenTable([
        ['color.chart.series.1', L('Primeira fatia', 'First slice', 'Primera porción')],
        ['color.chart.series.2', L('Segunda fatia — e assim até a 5ª', 'Second slice — and so on up to the 5th', 'Segunda porción — y así hasta la 5.ª')],
        ['color.chart.other', L('“Outros”', '“Others”', '“Otros”')],
        ['color.fg.default', L('Valor do miolo e da lista', 'Center and list value', 'Valor del centro y de la lista')],
        ['color.fg.muted', L('Nome na lista', 'Name in the list', 'Nombre en la lista')],
        ['color.fg.subtle', L('Rótulo do miolo e percentual', 'Center label and percentage', 'Etiqueta del centro y porcentaje')],
        ['color.bg.hover', L('Linha da lista em destaque', 'Highlighted list row', 'Fila de la lista destacada')],
        ['color.border.subtle', L('Divisória da lista', 'List divider', 'Divisor de la lista')],
        ['color.border.focus', L('Anel de foco do gráfico', 'Chart focus ring', 'Anillo de foco del gráfico')],
        ['duration.base', L('Fatia saindo do anel', 'Slice moving out of the ring', 'Porción saliendo del anillo')],
      ]),
    )}

    ${section(
      'uso',
      L('Uso', 'Usage', 'Uso'),
      L('A rosca é a forma mais fácil de errar. Use pouco, e só para parte do todo.', 'The donut is the easiest form to get wrong. Use it sparingly, and only for part of a whole.', 'La dona es la forma más fácil de equivocarse. Úsala poco, y solo para parte del todo.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: partes de um todo', 'Do: parts of a whole', 'Haz: partes de un todo')}</p>
          <p class="usage-card__text">${L('As fatias somam 100% de uma coisa só — transações, orçamento, clientes. Nada de categorias que se sobrepõem.', 'The slices add up to 100% of a single thing — transactions, budget, customers. No overlapping categories.', 'Las porciones suman el 100% de una sola cosa — transacciones, presupuesto, clientes. Nada de categorías que se superponen.')}</p>
        </article>
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: até 6 fatias, em ordem', 'Do: up to 6 slices, in order', 'Haz: hasta 6 porciones, en orden')}</p>
          <p class="usage-card__text">${L('Da maior para a menor, começando às 12 h. A partir da 6ª, junte em “Outros” — o componente faz isso por você.', 'From largest to smallest, starting at 12 o’clock. From the 6th on, group into “Others” — the component does it for you.', 'De mayor a menor, empezando a las 12. A partir de la 6.ª, junta en “Otros” — el componente lo hace por ti.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: 3D, sombra e fatia descolada', 'Avoid: 3D, shadows, and exploded slices', 'Evita: 3D, sombra y porción despegada')}</p>
          <p class="usage-card__text">${L('Perspectiva distorce os ângulos e a sombra vira ruído. O destaque já vem no hover, e só enquanto dura.', 'Perspective distorts the angles and shadows become noise. The highlight comes on hover, and only while it lasts.', 'La perspectiva distorsiona los ángulos y la sombra se vuelve ruido. El destacado ya viene con el hover, y solo mientras dura.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: rosca de duas fatias', 'Avoid: a two-slice donut', 'Evita: dona de dos porciones')}</p>
          <div class="gr-usage__meter">${meter({ label: L('Cota de armazenamento', 'Storage quota', 'Cuota de almacenamiento'), value: 72, max: 100, format: (v) => `${v} GB` })}</div>
          <p class="usage-card__text">${L('“72% usado” é uma razão contra um limite. Um medidor diz isso numa linha, sem pedir que ninguém leia ângulos.', '“72% used” is a ratio against a limit. A meter says it in one line, without asking anyone to read angles.', '“72% usado” es una razón contra un límite. Un medidor lo dice en una línea, sin pedir que nadie lea ángulos.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Comparar? Use barras', 'Comparing? Use bars', '¿Comparar? Usa barras')}</p>
          <p class="usage-card__text">${L('Se a pergunta é “quem é maior”, “quanto mudou” ou “como foi ao longo do tempo”, a resposta é barra ou linha — nunca várias roscas lado a lado.', 'If the question is “which is bigger”, “how much did it change”, or “how did it go over time”, the answer is a bar or a line — never several donuts side by side.', 'Si la pregunta es “quién es mayor”, “cuánto cambió” o “cómo fue a lo largo del tiempo”, la respuesta es barra o línea — nunca varias donas lado a lado.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Diga a unidade no miolo', 'Say the unit in the center', 'Di la unidad en el centro')}</p>
          <p class="usage-card__text">${L(`“${formatNumber(9120)}” não diz nada sozinho. ${ic(`centerLabel: '${transactions()}'`)} diz.`, `“${formatNumber(9120)}” says nothing on its own. ${ic(`centerLabel: '${transactions()}'`)} does.`, `“${formatNumber(9120)}” no dice nada solo. ${ic(`centerLabel: '${transactions()}'`)} sí.`)}</p>
        </article>
      </div>`,
    )}

    ${section(
      'api',
      'API',
      L(`Uma chamada monta a rosca, a lista e a tabela; ${ic('update()')} troca os itens.`, `One call mounts the donut, the list, and the table; ${ic('update()')} swaps the items.`, `Una llamada monta la dona, la lista y la tabla; ${ic('update()')} cambia los elementos.`),
      `<div class="doc-table gr-api">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Opção', 'Option', 'Opción')}</span><span>${L('Valores', 'Values', 'Valores')}</span><span>${L('Padrão', 'Default', 'Predeterminado')}</span><span>${L('O que faz', 'What it does', 'Qué hace')}</span></div>
        ${API().map(
          ([name, values, def, text]) => `<div class="doc-table__row">
            <code class="gr-api__name">${name}</code>
            <span class="gr-api__values">${values}</span>
            <span class="gr-api__default">${def}</span>
            <span class="gr-api__text">${text}</span>
          </div>`,
        ).join('')}
      </div>
      <div class="gr-api__code">${codeBlock(`const chart = donutChart(el, { title: '${L('Pagamentos', 'Payments', 'Pagos')}', items, format: 'integer' });\n\nchart.update({ items: ${L('novosItens', 'nextItems', 'nuevosItems')} });   // ${L('redesenha mantendo a moldura', 'redraws keeping the frame', 'redibuja manteniendo el marco')}\nchart.setLoading(true);                 // ${L('meia opacidade enquanto busca', 'half opacity while fetching', 'media opacidad mientras busca')}\nchart.destroy();`)}</div>`,
    )}
  </div>`;
}

/* ───────── Montagem ───────── */

export function mount(root) {
  const charts = [];
  const pay = payments();

  const unmountPlayground = mountPlayground(root, {
    id: 'graficos-rosca',
    controls: [
      { id: 'slices', label: L('Fatias', 'Slices', 'Porciones'), value: '5', options: ['2', '3', '4', '5', '6', '7'].map((value) => ({ value, label: value === '7' ? L('7 (vira “Outros”)', '7 (becomes “Others”)', '7 (se vuelve “Otros”)') : value })) },
      { id: 'thickness', label: L('Espessura', 'Thickness', 'Grosor'), value: '24', options: THICKNESS().map(([value, label, px]) => ({ value, label: `${label} · ${px} px` })) },
      { id: 'center', label: L('Miolo', 'Center', 'Centro'), value: 'total', options: CENTERS().map(([value, label]) => ({ value, label })) },
      { id: 'texture', label: L('Textura', 'Texture', 'Textura'), value: 'off', options: [{ value: 'off', label: L('Desligada', 'Off', 'Desactivada') }, { value: 'on', label: L('Ligada', 'On', 'Activada') }] },
    ],
    render: () => '<div class="gr-play" data-chart></div>',
    mount: (preview, state) => {
      const chart = donutChart(preview.querySelector('[data-chart]'), playOptions(state));
      return () => chart.destroy();
    },
    code: playCode,
  });

  for (const v of VARIANTS()) charts.push(donutChart(root.querySelector(`[data-variant="${v.id}"]`), { size: 176, ...v.options }));

  const layoutOptions = { title: byMethod(), items: pay.slice(0, 5), format: 'integer', centerLabel: transactions(), size: 176 };
  charts.push(donutChart(root.querySelector('[data-layout-chart="side"]'), layoutOptions));
  charts.push(donutChart(root.querySelector('[data-layout-chart="stack"]'), layoutOptions));

  // Rosca × barras com valores próximos
  const regions = REGIONS();
  const byRegion = L('Clientes por região', 'Customers by region', 'Clientes por región');
  charts.push(donutChart(root.querySelector('[data-compare="donut"]'), { label: byRegion, items: regions, format: 'integer', centerLabel: L('clientes', 'customers', 'clientes'), size: 160, table: false }));
  charts.push(
    barChart(root.querySelector('[data-compare="bars"]'), {
      label: byRegion,
      categories: regions.map((r) => r.name),
      series: [{ name: L('Clientes', 'Customers', 'Clientes'), values: regions.map((r) => r.value) }],
      orientation: 'horizontal',
      format: 'integer',
      table: false,
    }),
  );

  // Estados
  const stateEl = (id) => root.querySelector(`[data-state-chart="${id}"]`);
  const hover = donutChart(stateEl('hover'), { title: byMethod(), items: pay.slice(0, 4), format: 'integer', centerLabel: transactions(), size: 160 });
  const loading = donutChart(stateEl('carregando'), { title: byMethod(), items: pay.slice(0, 4), format: 'integer', centerLabel: transactions(), size: 160 });
  const empty = donutChart(stateEl('vazio'), { title: byMethod(), items: [], size: 160, height: 220, empty: L('Nenhum pagamento neste período.', 'No payments in this period.', 'Ningún pago en este período.') });
  charts.push(hover, loading, empty);

  const timers = [];
  timers.push(
    setTimeout(() => {
      const item = hover.el.querySelectorAll('.ds-donut__item')[1];
      if (!item) return;
      const r = item.getBoundingClientRect();
      item.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 12, clientY: r.top + r.height / 2, bubbles: true }));
    }, 60),
  );
  loading.setLoading(true);

  let flip = false;
  const reloadBtn = root.querySelector('[data-reload]');
  const onReload = () => {
    loading.setLoading(true);
    reloadBtn.disabled = true;
    timers.push(
      setTimeout(() => {
        flip = !flip;
        loading.update({ items: pay.slice(flip ? 1 : 0, flip ? 5 : 4) });
        loading.setLoading(false);
        reloadBtn.disabled = false;
      }, 1200),
    );
  };
  reloadBtn?.addEventListener('click', onReload);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    timers.forEach(clearTimeout);
    reloadBtn?.removeEventListener('click', onReload);
    unmountPlayground();
    charts.forEach((c) => c.destroy());
    unmountCopy();
    unmountNav();
  };
}
