import { icon, icons, iconList, iconCategories } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { tr, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T } from '../i18n.js';
import { ICON_KEYWORDS } from '../icon-keywords.js';

export const styles = 'site/pages/icones.css';

/* ───────── Textos ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const COPY = T(
  {
    lead: 'Uma biblioteca própria, desenhada no mesmo grid e com o mesmo traço. Contorno fino, pontas redondas e cor herdada do texto.',
    stats: ['ícones', 'categorias', 'grid', 'traço'],
    onThisPage: 'Nesta página',
    nav: ['Biblioteca', 'Anatomia', 'Tamanhos', 'Em código', 'Uso'],
    categories: { navegacao: 'Navegação', acoes: 'Ações', status: 'Status e feedback', interface: 'Interface', objetos: 'Objetos', design: 'Design', graficos: 'Gráficos', pessoas: 'Pessoas' },
    all: 'Todos',
    category: 'Categoria',
    library: { title: 'Biblioteca', desc: 'Busque pelo nome ou por palavras em português, inglês ou espanhol. Clique num ícone para copiar o código.', search: 'Buscar ícones', placeholder: 'Buscar: casa, seta, calendário…' },
    count: (n) => `${n} ${n === 1 ? 'ícone' : 'ícones'}`,
    empty: { title: (q) => `Nenhum ícone para “${q}”`, text: 'Tente outra palavra — a busca olha o nome e palavras-chave em português, inglês e espanhol.', clear: 'Limpar busca' },
    copyIcon: (n) => `Copiar o ícone ${n}`,
    previewSize: 'Tamanho da prévia',
    anatomy: {
      title: 'Anatomia',
      desc: 'As mesmas regras para todos os ícones. É isso que faz a biblioteca parecer uma família.',
      svg: (n) => `Ícone ${n} sobre o grid de 24 por 24`,
      legend: ['Área útil 20 × 20', 'Keylines', 'Grid de 1 px'],
      picker: 'Ícone de exemplo',
      see: (n) => `Ver ${n}`,
    },
    rules: [
      ['Grid de 24 × 24', 'Todo ícone é desenhado na mesma prancheta, para alinhar em qualquer tamanho.'],
      ['Respiro de 2 px', 'A área útil é 20 × 20. A borda livre dá equilíbrio óptico entre formas diferentes.'],
      ['Keylines', 'Círculo, quadrado e retângulos guiam o peso visual: um círculo e um quadrado parecem do mesmo tamanho.'],
      ['Traço 1,5', 'Contorno de 1,5 px; em 16 px ou menos sobe para 1,75 para não sumir.'],
      ['Pontas redondas', 'Pontas e junções arredondadas, coerentes com os raios generosos do sistema.'],
      ['currentColor', 'O ícone herda a cor do texto ao redor — muda junto com o tema e o estado.'],
    ],
    sizes: {
      title: 'Tamanhos',
      desc: 'Cinco tamanhos, todos em tokens. Abaixo de 16 px o traço engrossa sozinho para manter a leitura.',
      usage: { xs: 'Metadados e badges', sm: 'Botões pequenos e chips', md: 'Padrão da interface', lg: 'Navegação e destaques', xl: 'Estados vazios' },
      copyVar: (v) => `Copiar var(${v})`,
      context: ['Publicado', 'Tom direto', 'Exportar', 'Gerar ideias'],
      caption: 'O ícone acompanha o tamanho do componente: 14 no badge, 16 no chip, 20 no botão padrão, 24 no botão grande.',
    },
    code: {
      title: 'Em código',
      desc: `Dois jeitos de usar: a função ${ic('icon()')} em JavaScript ou o elemento ${ic('&lt;ds-icon&gt;')} direto no HTML.`,
      jsComment: 'com rótulo para leitores de tela',
      jsLabel: 'Notificações',
      htmlComment: 'ícone sozinho, com significado',
      htmlLabel: 'Início',
      a11y: [
        ['Decorativo, ao lado de texto', `Sem ${ic('label')}: o SVG sai com ${ic('aria-hidden="true"')} e o leitor de tela lê só o texto.`],
        ['Sozinho, com significado', `Com ${ic('label')}: vira ${ic('role="img"')} com nome acessível. Em botões só de ícone, prefira o ${ic('aria-label')} no botão.`],
      ],
    },
    usage: {
      title: 'Uso',
      desc: 'Ícone ajuda a reconhecer, não substitui a palavra.',
      do: ['Faça: ícone com texto', 'Na navegação e em botões, o rótulo diz o que acontece; o ícone ajuda a achar mais rápido.', 'Exportar'],
      dont: ['Evite: misturar estilos', 'Ícones preenchidos, de outra biblioteca ou com outro traço quebram a família. Se faltar um, desenhe no grid.'],
      tip: ['Ícone sozinho? Nome e dica', `Botões só de ícone precisam de ${ic('aria-label')} e de um tooltip com o mesmo texto.`, 'Configurações'],
    },
  },
  {
    lead: 'A custom library, drawn on the same grid with the same stroke. Thin outlines, round caps, and color inherited from the text.',
    stats: ['icons', 'categories', 'grid', 'stroke'],
    onThisPage: 'On this page',
    nav: ['Library', 'Anatomy', 'Sizes', 'In code', 'Usage'],
    categories: { navegacao: 'Navigation', acoes: 'Actions', status: 'Status and feedback', interface: 'Interface', objetos: 'Objects', design: 'Design', graficos: 'Charts', pessoas: 'People' },
    all: 'All',
    category: 'Category',
    library: { title: 'Library', desc: 'Search by name or by words in English, Portuguese, or Spanish. Click an icon to copy its code.', search: 'Search icons', placeholder: 'Search: house, arrow, calendar…' },
    count: (n) => `${n} ${n === 1 ? 'icon' : 'icons'}`,
    empty: { title: (q) => `No icons for “${q}”`, text: 'Try another word — the search looks at the name and at keywords in English, Portuguese, and Spanish.', clear: 'Clear search' },
    copyIcon: (n) => `Copy the ${n} icon`,
    previewSize: 'Preview size',
    anatomy: {
      title: 'Anatomy',
      desc: 'The same rules for every icon. That’s what makes the library feel like one family.',
      svg: (n) => `${n} icon on the 24 by 24 grid`,
      legend: ['Live area 20 × 20', 'Keylines', '1 px grid'],
      picker: 'Example icon',
      see: (n) => `View ${n}`,
    },
    rules: [
      ['24 × 24 grid', 'Every icon is drawn on the same artboard, so it lines up at any size.'],
      ['2 px padding', 'The live area is 20 × 20. The free edge gives optical balance between different shapes.'],
      ['Keylines', 'Circle, square, and rectangles guide visual weight: a circle and a square look the same size.'],
      ['1.5 stroke', 'A 1.5 px outline; at 16 px or less it goes up to 1.75 so it doesn’t fade away.'],
      ['Round caps', 'Rounded caps and joins, in line with the system’s generous radii.'],
      ['currentColor', 'The icon inherits the color of the surrounding text — it changes with the theme and the state.'],
    ],
    sizes: {
      title: 'Sizes',
      desc: 'Five sizes, all tokens. Below 16 px the stroke thickens on its own to stay legible.',
      usage: { xs: 'Metadata and badges', sm: 'Small buttons and chips', md: 'Interface default', lg: 'Navigation and highlights', xl: 'Empty states' },
      copyVar: (v) => `Copy var(${v})`,
      context: ['Published', 'Direct tone', 'Export', 'Generate ideas'],
      caption: 'The icon follows the component’s size: 14 in the badge, 16 in the chip, 20 in the default button, 24 in the large button.',
    },
    code: {
      title: 'In code',
      desc: `Two ways to use them: the ${ic('icon()')} function in JavaScript or the ${ic('&lt;ds-icon&gt;')} element right in the HTML.`,
      jsComment: 'with a label for screen readers',
      jsLabel: 'Notifications',
      htmlComment: 'icon on its own, with meaning',
      htmlLabel: 'Home',
      a11y: [
        ['Decorative, next to text', `Without ${ic('label')}: the SVG gets ${ic('aria-hidden="true"')} and the screen reader reads only the text.`],
        ['On its own, with meaning', `With ${ic('label')}: it becomes ${ic('role="img"')} with an accessible name. In icon-only buttons, prefer ${ic('aria-label')} on the button.`],
      ],
    },
    usage: {
      title: 'Usage',
      desc: 'An icon helps recognition; it doesn’t replace the word.',
      do: ['Do: icon with text', 'In navigation and buttons, the label says what happens; the icon helps people find it faster.', 'Export'],
      dont: ['Avoid: mixing styles', 'Filled icons, icons from another library, or with another stroke break the family. If one is missing, draw it on the grid.'],
      tip: ['Icon on its own? Name and hint', `Icon-only buttons need an ${ic('aria-label')} and a tooltip with the same text.`, 'Settings'],
    },
  },
  {
    lead: 'Una biblioteca propia, dibujada en la misma cuadrícula y con el mismo trazo. Contorno fino, extremos redondeados y color heredado del texto.',
    stats: ['íconos', 'categorías', 'cuadrícula', 'trazo'],
    onThisPage: 'En esta página',
    nav: ['Biblioteca', 'Anatomía', 'Tamaños', 'En código', 'Uso'],
    categories: { navegacao: 'Navegación', acoes: 'Acciones', status: 'Estado y feedback', interface: 'Interfaz', objetos: 'Objetos', design: 'Diseño', graficos: 'Gráficos', pessoas: 'Personas' },
    all: 'Todos',
    category: 'Categoría',
    library: { title: 'Biblioteca', desc: 'Busca por nombre o por palabras en español, portugués o inglés. Haz clic en un ícono para copiar el código.', search: 'Buscar íconos', placeholder: 'Buscar: casa, flecha, calendario…' },
    count: (n) => `${n} ${n === 1 ? 'ícono' : 'íconos'}`,
    empty: { title: (q) => `Ningún ícono para “${q}”`, text: 'Prueba otra palabra — la búsqueda mira el nombre y palabras clave en español, portugués e inglés.', clear: 'Borrar búsqueda' },
    copyIcon: (n) => `Copiar el ícono ${n}`,
    previewSize: 'Tamaño de la vista previa',
    anatomy: {
      title: 'Anatomía',
      desc: 'Las mismas reglas para todos los íconos. Es lo que hace que la biblioteca parezca una familia.',
      svg: (n) => `Ícono ${n} sobre la cuadrícula de 24 por 24`,
      legend: ['Área útil 20 × 20', 'Keylines', 'Cuadrícula de 1 px'],
      picker: 'Ícono de ejemplo',
      see: (n) => `Ver ${n}`,
    },
    rules: [
      ['Cuadrícula de 24 × 24', 'Todo ícono se dibuja en la misma mesa de trabajo, para alinearse en cualquier tamaño.'],
      ['Margen de 2 px', 'El área útil es 20 × 20. El borde libre da equilibrio óptico entre formas distintas.'],
      ['Keylines', 'Círculo, cuadrado y rectángulos guían el peso visual: un círculo y un cuadrado parecen del mismo tamaño.'],
      ['Trazo de 1,5', 'Contorno de 1,5 px; en 16 px o menos sube a 1,75 para no desaparecer.'],
      ['Extremos redondeados', 'Extremos y uniones redondeados, coherentes con los radios generosos del sistema.'],
      ['currentColor', 'El ícono hereda el color del texto que lo rodea — cambia junto con el tema y el estado.'],
    ],
    sizes: {
      title: 'Tamaños',
      desc: 'Cinco tamaños, todos en tokens. Por debajo de 16 px el trazo se engrosa solo para mantener la lectura.',
      usage: { xs: 'Metadatos e insignias', sm: 'Botones pequeños y chips', md: 'Predeterminado de la interfaz', lg: 'Navegación y destacados', xl: 'Estados vacíos' },
      copyVar: (v) => `Copiar var(${v})`,
      context: ['Publicado', 'Tono directo', 'Exportar', 'Generar ideas'],
      caption: 'El ícono acompaña el tamaño del componente: 14 en la insignia, 16 en el chip, 20 en el botón estándar, 24 en el botón grande.',
    },
    code: {
      title: 'En código',
      desc: `Dos formas de usarlos: la función ${ic('icon()')} en JavaScript o el elemento ${ic('&lt;ds-icon&gt;')} directo en el HTML.`,
      jsComment: 'con etiqueta para lectores de pantalla',
      jsLabel: 'Notificaciones',
      htmlComment: 'ícono solo, con significado',
      htmlLabel: 'Inicio',
      a11y: [
        ['Decorativo, junto al texto', `Sin ${ic('label')}: el SVG sale con ${ic('aria-hidden="true"')} y el lector de pantalla lee solo el texto.`],
        ['Solo, con significado', `Con ${ic('label')}: se vuelve ${ic('role="img"')} con nombre accesible. En botones solo de ícono, prefiere el ${ic('aria-label')} en el botón.`],
      ],
    },
    usage: {
      title: 'Uso',
      desc: 'El ícono ayuda a reconocer; no reemplaza la palabra.',
      do: ['Haz: ícono con texto', 'En la navegación y en los botones, la etiqueta dice qué pasa; el ícono ayuda a encontrarlo más rápido.', 'Exportar'],
      dont: ['Evita: mezclar estilos', 'Íconos rellenos, de otra biblioteca o con otro trazo rompen la familia. Si falta uno, dibújalo en la cuadrícula.'],
      tip: ['¿Ícono solo? Nombre y pista', `Los botones solo de ícono necesitan ${ic('aria-label')} y un tooltip con el mismo texto.`, 'Configuración'],
    },
  },
);

/* ───────── Dados ───────── */

const SIZES = ['16', '20', '24', '32'].map((value) => ({ value, label: `${value} px` }));
const ANATOMY_ICONS = ['home', 'settings', 'palette', 'bell', 'calendar', 'user'];

const iconSizes = tokens.filter((t) => t.name.startsWith('size.icon.'));
const categoryIds = Object.keys(iconCategories);

let query = '';
let category = 'all';
let size = '24';
let anatomyIcon = 'home';

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const snippet = (name) => `<ds-icon name="${name}"></ds-icon>`;
const countIn = (id) => (id === 'all' ? iconList.length : iconList.filter((i) => i.category === id).length);

// palavras das três línguas juntas: quem busca “house” em português também acha
const haystacks = new Map(
  iconList.map((i) => {
    const [en = '', es = ''] = ICON_KEYWORDS[i.name] ?? [];
    const categoryNames = ['pt-BR', 'en', 'es'].map((l) => COPY[l].categories[i.category]).join(' ');
    return [i.name, normalize(`${i.name} ${i.keywords.join(' ')} ${en} ${es} ${categoryNames}`)];
  }),
);

function filtered() {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return iconList.filter((i) => {
    if (category !== 'all' && i.category !== category) return false;
    if (!words.length) return true;
    const haystack = haystacks.get(i.name);
    return words.every((w) => haystack.includes(w));
  });
}

/* ───────── Biblioteca ───────── */

function libraryGrid(c) {
  const list = filtered();
  if (!list.length) {
    return `<div class="ic-empty">
      <span class="ic-empty__icon">${icon('search', { size: 24 })}</span>
      <p class="ic-empty__title">${c.empty.title(escape(query))}</p>
      <p class="ic-empty__text">${c.empty.text}</p>
      <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-clear>${c.empty.clear}</button>
    </div>`;
  }
  return `<ul class="ic-grid" role="list">
    ${list
      .map(
        (i) => `<li><button type="button" class="ic-cell" data-icon="${i.name}" aria-label="${c.copyIcon(i.name)}">
          <span class="ic-cell__glyph">${icon(i.name, { size: Number(size) })}</span>
          <span class="ic-cell__name">${i.name}</span>
        </button></li>`,
      )
      .join('')}
  </ul>`;
}

const resultLabel = (c) => c.count(filtered().length);

/* ───────── Anatomia ───────── */

function anatomySvg(c, name) {
  const grid = Array.from({ length: 25 }, (_, i) => `M${i} 0V24M0 ${i}H24`).join('');
  return `<svg class="ic-anatomy__svg" viewBox="-0.5 -0.5 25 25" role="img" aria-label="${c.anatomy.svg(name)}">
    <rect class="ic-anatomy__canvas" x="0" y="0" width="24" height="24"/>
    <path class="ic-anatomy__grid" d="${grid}" vector-effect="non-scaling-stroke"/>
    <rect class="ic-anatomy__padding" x="0" y="0" width="24" height="24" vector-effect="non-scaling-stroke"/>
    <rect class="ic-anatomy__live" x="2" y="2" width="20" height="20" vector-effect="non-scaling-stroke"/>
    <circle class="ic-anatomy__key" cx="12" cy="12" r="10" vector-effect="non-scaling-stroke"/>
    <rect class="ic-anatomy__key" x="3" y="3" width="18" height="18" rx="2" vector-effect="non-scaling-stroke"/>
    <rect class="ic-anatomy__key" x="4" y="2" width="16" height="20" rx="2" vector-effect="non-scaling-stroke"/>
    <rect class="ic-anatomy__key" x="2" y="4" width="20" height="16" rx="2" vector-effect="non-scaling-stroke"/>
    <g class="ic-anatomy__glyph" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[name].body}</g>
  </svg>`;
}

/* ───────── Página ───────── */

const NAV_IDS = ['biblioteca', 'anatomia', 'tamanhos', 'codigo', 'uso'];

export default function renderIcones(page) {
  const c = tr(COPY);
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[iconList.length, categoryIds.length, '24 px', formatNumber(1.5)].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="biblioteca" aria-labelledby="biblioteca-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="biblioteca-title">${c.library.title}</h2>
          <p class="doc-section__desc">${c.library.desc}</p>
        </div>
      </header>

      <div class="ic-toolbar">
        <label class="ds-field ic-search">
          ${icon('search', { size: 18 })}
          <span class="ds-visually-hidden">${c.library.search}</span>
          <input class="ds-field__input" type="search" placeholder="${c.library.placeholder}" autocomplete="off" spellcheck="false" data-search>
        </label>
        <button type="button" class="ds-chip" data-menu="size"><span class="ds-chip__icon">${icon('spacing', { size: 16 })}</span><span data-label>24 px</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
        <span class="ic-count" data-count aria-live="polite">${resultLabel(c)}</span>
      </div>

      <div class="ic-categories" role="group" aria-label="${c.category}">
        <button type="button" class="ds-chip ds-chip--sm" data-category="all" aria-pressed="true">${c.all}<span class="ic-categories__count">${countIn('all')}</span></button>
        ${categoryIds.map((id) => `<button type="button" class="ds-chip ds-chip--sm" data-category="${id}" aria-pressed="false">${c.categories[id]}<span class="ic-categories__count">${countIn(id)}</span></button>`).join('')}
      </div>

      <div class="ic-library" data-library>${libraryGrid(c)}</div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">${c.anatomy.title}</h2>
          <p class="doc-section__desc">${c.anatomy.desc}</p>
        </div>
      </header>
      <div class="ic-anatomy">
        <figure class="ic-anatomy__stage">
          <div class="ic-anatomy__frame" data-anatomy>${anatomySvg(c, anatomyIcon)}</div>
          <figcaption class="ic-anatomy__legend">
            <span><i class="ic-swatch ic-swatch--live"></i>${c.anatomy.legend[0]}</span>
            <span><i class="ic-swatch ic-swatch--key"></i>${c.anatomy.legend[1]}</span>
            <span><i class="ic-swatch ic-swatch--grid"></i>${c.anatomy.legend[2]}</span>
          </figcaption>
          <div class="ic-anatomy__picker" role="group" aria-label="${c.anatomy.picker}">
            ${ANATOMY_ICONS.map((n) => `<button type="button" class="ds-icon-btn ds-icon-btn--outline" data-anatomy-icon="${n}" aria-pressed="${n === anatomyIcon}" aria-label="${c.anatomy.see(n)}" data-ds-tooltip="${n}" data-ds-tooltip-placement="bottom">${icon(n, { size: 20 })}</button>`).join('')}
          </div>
        </figure>
        <ol class="ic-rules" role="list">
          ${c.rules.map(
            ([title, text], i) => `<li class="ic-rule">
              <span class="ic-rule__stamp">${String(i + 1).padStart(2, '0')}</span>
              <div><p class="ic-rule__title">${title}</p><p class="ic-rule__text">${text}</p></div>
            </li>`,
          ).join('')}
        </ol>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">${c.sizes.title}</h2>
          <p class="doc-section__desc">${c.sizes.desc}</p>
        </div>
      </header>
      <div class="ic-sizes">
        ${iconSizes
          .map((t) => {
            const key = t.name.split('.').at(-1);
            return `<button type="button" class="ic-size" data-copy="var(${t.cssVar})" aria-label="${c.sizes.copyVar(t.cssVar)}">
              <span class="ic-size__glyph">${icon('bell', { size: t.px })}</span>
              <span class="ic-size__name">${key}<span class="ic-size__px">${t.px} px</span></span>
              <span class="ic-size__usage">${c.sizes.usage[key] ?? ''}</span>
              <span class="ic-size__token">${t.cssVar}</span>
            </button>`;
          })
          .join('')}
      </div>
      <div class="ic-context">
        <span class="ds-badge ds-badge--success">${icon('check', { size: 14 })}${c.sizes.context[0]}</span>
        <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 16 })}</span>${c.sizes.context[1]}</span>
        <span class="ds-btn ds-btn--secondary">${icon('download', { size: 20 })}${c.sizes.context[2]}</span>
        <span class="ds-btn ds-btn--primary ds-btn--lg">${icon('zap', { size: 24 })}${c.sizes.context[3]}</span>
      </div>
      <p class="ic-context__caption">${c.sizes.caption}</p>
    </section>

    <section class="doc-section" id="codigo" aria-labelledby="codigo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="codigo-title">${c.code.title}</h2>
          <p class="doc-section__desc">${c.code.desc}</p>
        </div>
      </header>
      <div class="ic-code">
        <article class="ic-code__card">
          <p class="ic-code__title">${icon('code', { size: 18 })}JavaScript</p>
          <pre class="ds-code ds-code--sm"><code>import { icon } from './ds/icons/icons.js';

button.innerHTML = icon('home', { size: 20 });
<span class="ds-code__comment">// ${c.code.jsComment}</span>
icon('bell', { size: 20, label: '${c.code.jsLabel}' });</code></pre>
        </article>
        <article class="ic-code__card">
          <p class="ic-code__title">${icon('file-text', { size: 18 })}HTML</p>
          <pre class="ds-code ds-code--sm"><code>&lt;ds-icon name="home"&gt;&lt;/ds-icon&gt;
&lt;ds-icon name="home" size="16"&gt;&lt;/ds-icon&gt;
<span class="ds-code__comment">&lt;!-- ${c.code.htmlComment} --&gt;</span>
&lt;ds-icon name="home" size="20" label="${c.code.htmlLabel}"&gt;&lt;/ds-icon&gt;</code></pre>
        </article>
      </div>
      <div class="ic-a11y">
        ${c.code.a11y
          .map(
            ([title, text], i) => `<div class="ic-a11y__item">
          <span class="ic-a11y__icon">${icon(i ? 'accessibility' : 'eye', { size: 20 })}</span>
          <div><p class="ic-a11y__title">${title}</p><p class="ic-a11y__text">${text}</p></div>
        </div>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${c.usage.title}</h2>
          <p class="doc-section__desc">${c.usage.desc}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${c.usage.do[0]}</p>
          <p class="usage-card__text">${c.usage.do[1]}</p>
          <div class="ic-example"><span class="ds-btn ds-btn--secondary ds-btn--sm">${icon('download', { size: 16 })}${c.usage.do[2]}</span></div>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <div class="ic-example ic-example--mixed">${icon('home', { size: 20 })}<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"/></svg>${icon('bell', { size: 20, strokeWidth: 2.6 })}</div>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
          <div class="ic-example"><span class="ds-icon-btn ds-icon-btn--outline">${icon('settings', { size: 20 })}</span><span class="ic-example__tip">${c.usage.tip[2]}</span></div>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const c = tr(COPY);
  const library = root.querySelector('[data-library]');
  const count = root.querySelector('[data-count]');
  const search = root.querySelector('[data-search]');
  const refresh = () => {
    library.innerHTML = libraryGrid(c);
    count.textContent = resultLabel(c);
  };

  search.value = query;

  const onInput = (event) => {
    if (event.target !== search) return;
    query = search.value;
    refresh();
  };

  const onClick = (event) => {
    const cell = event.target.closest('[data-icon]');
    if (cell) return copyText(snippet(cell.dataset.icon));

    const copy = event.target.closest('[data-copy]');
    if (copy) return copyText(copy.dataset.copy);

    if (event.target.closest('[data-clear]')) {
      query = '';
      search.value = '';
      refresh();
      search.focus();
      return;
    }

    const cat = event.target.closest('[data-category]');
    if (cat) {
      category = cat.dataset.category;
      root.querySelectorAll('[data-category]').forEach((x) => x.setAttribute('aria-pressed', String(x === cat)));
      refresh();
      return;
    }

    const pick = event.target.closest('[data-anatomy-icon]');
    if (pick) {
      anatomyIcon = pick.dataset.anatomyIcon;
      root.querySelector('[data-anatomy]').innerHTML = anatomySvg(c, anatomyIcon);
      root.querySelectorAll('[data-anatomy-icon]').forEach((b) => b.setAttribute('aria-pressed', String(b === pick)));
    }
  };

  root.addEventListener('input', onInput);
  root.addEventListener('click', onClick);

  // categoria salva entre visitas: sincroniza os chips
  root.querySelectorAll('[data-category]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.category === category)));
  root.querySelectorAll('[data-anatomy-icon]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.anatomyIcon === anatomyIcon)));

  const sizeChip = root.querySelector('[data-menu="size"]');
  const setSizeLabel = () => (sizeChip.querySelector('[data-label]').textContent = SIZES.find((s) => s.value === size).label);
  setSizeLabel();
  const sizeMenu = attachMenu(sizeChip, {
    label: c.previewSize,
    value: size,
    options: SIZES,
    onChange: (value) => {
      size = value;
      setSizeLabel();
      refresh();
    },
  });

  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('input', onInput);
    root.removeEventListener('click', onClick);
    sizeMenu.destroy();
    unmountNav();
  };
}
