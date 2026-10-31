import { icon, icons, iconList, iconCategories } from '../../ds/icons/icons.js';
import { tokens } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';

export const styles = 'site/pages/icones.css';

/* ───────── Dados ───────── */

const SIZES = [
  { value: '16', label: '16 px' },
  { value: '20', label: '20 px' },
  { value: '24', label: '24 px' },
  { value: '32', label: '32 px' },
];

const SIZE_USAGE = {
  xs: 'Metadados e badges',
  sm: 'Botões pequenos e chips',
  md: 'Padrão da interface',
  lg: 'Navegação e destaques',
  xl: 'Estados vazios',
};

const ANATOMY_ICONS = ['home', 'settings', 'palette', 'bell', 'calendar', 'user'];

const iconSizes = tokens.filter((t) => t.name.startsWith('size.icon.'));
const categories = Object.entries(iconCategories);

let query = '';
let category = 'all';
let size = '24';
let anatomyIcon = 'home';

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const snippet = (name) => `<ds-icon name="${name}"></ds-icon>`;
const countIn = (id) => (id === 'all' ? iconList.length : iconList.filter((i) => i.category === id).length);

function filtered() {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return iconList.filter((i) => {
    if (category !== 'all' && i.category !== category) return false;
    if (!words.length) return true;
    const haystack = normalize(`${i.name} ${i.keywords.join(' ')} ${iconCategories[i.category]}`);
    return words.every((w) => haystack.includes(w));
  });
}

/* ───────── Biblioteca ───────── */

function libraryGrid() {
  const list = filtered();
  if (!list.length) {
    return `<div class="ic-empty">
      <span class="ic-empty__icon">${icon('search', { size: 24 })}</span>
      <p class="ic-empty__title">Nenhum ícone para “${escape(query)}”</p>
      <p class="ic-empty__text">Tente outra palavra — a busca olha o nome e palavras-chave em português.</p>
      <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-clear>Limpar busca</button>
    </div>`;
  }
  return `<ul class="ic-grid" role="list">
    ${list
      .map(
        (i) => `<li><button type="button" class="ic-cell" data-icon="${i.name}" aria-label="Copiar o ícone ${i.name}">
          <span class="ic-cell__glyph">${icon(i.name, { size: Number(size) })}</span>
          <span class="ic-cell__name">${i.name}</span>
        </button></li>`,
      )
      .join('')}
  </ul>`;
}

const resultLabel = () => {
  const n = filtered().length;
  return `${n} ${n === 1 ? 'ícone' : 'ícones'}`;
};

/* ───────── Anatomia ───────── */

function anatomySvg(name) {
  const grid = Array.from({ length: 25 }, (_, i) => `M${i} 0V24M0 ${i}H24`).join('');
  return `<svg class="ic-anatomy__svg" viewBox="-0.5 -0.5 25 25" role="img" aria-label="Ícone ${name} sobre o grid de 24 por 24">
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

const RULES = [
  ['Grid de 24 × 24', 'Todo ícone é desenhado na mesma prancheta, para alinhar em qualquer tamanho.'],
  ['Respiro de 2 px', 'A área útil é 20 × 20. A borda livre dá equilíbrio óptico entre formas diferentes.'],
  ['Keylines', 'Círculo, quadrado e retângulos guiam o peso visual: um círculo e um quadrado parecem do mesmo tamanho.'],
  ['Traço 1,5', 'Contorno de 1,5 px; em 16 px ou menos sobe para 1,75 para não sumir.'],
  ['Pontas redondas', 'Pontas e junções arredondadas, coerentes com os raios generosos do sistema.'],
  ['currentColor', 'O ícone herda a cor do texto ao redor — muda junto com o tema e o estado.'],
];

/* ───────── Página ───────── */

export default function renderIcones(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Ícones</h1>
        <p class="doc-header__lead">Uma biblioteca própria, desenhada no mesmo grid e com o mesmo traço. Contorno fino, pontas redondas e cor herdada do texto.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">ícones</dt><dd class="doc-stat__value">${iconList.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">categorias</dt><dd class="doc-stat__value">${categories.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">grid</dt><dd class="doc-stat__value">24 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">traço</dt><dd class="doc-stat__value">1,5</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      <button type="button" class="doc-nav__link" data-target="biblioteca">Biblioteca</button>
      <button type="button" class="doc-nav__link" data-target="anatomia">Anatomia</button>
      <button type="button" class="doc-nav__link" data-target="tamanhos">Tamanhos</button>
      <button type="button" class="doc-nav__link" data-target="codigo">Em código</button>
      <button type="button" class="doc-nav__link" data-target="uso">Uso</button>
    </nav>

    <section class="doc-section" id="biblioteca" aria-labelledby="biblioteca-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="biblioteca-title">Biblioteca</h2>
          <p class="doc-section__desc">Busque pelo nome ou por palavras em português. Clique num ícone para copiar o código.</p>
        </div>
      </header>

      <div class="ic-toolbar">
        <label class="ds-field ic-search">
          ${icon('search', { size: 18 })}
          <span class="ds-visually-hidden">Buscar ícones</span>
          <input class="ds-field__input" type="search" placeholder="Buscar: casa, seta, calendário…" autocomplete="off" spellcheck="false" data-search>
        </label>
        <button type="button" class="ds-chip" data-menu="size"><span class="ds-chip__icon">${icon('spacing', { size: 16 })}</span><span data-label>24 px</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
        <span class="ic-count" data-count aria-live="polite">${resultLabel()}</span>
      </div>

      <div class="ic-categories" role="group" aria-label="Categoria">
        <button type="button" class="ds-chip ds-chip--sm" data-category="all" aria-pressed="true">Todos<span class="ic-categories__count">${countIn('all')}</span></button>
        ${categories.map(([id, label]) => `<button type="button" class="ds-chip ds-chip--sm" data-category="${id}" aria-pressed="false">${label}<span class="ic-categories__count">${countIn(id)}</span></button>`).join('')}
      </div>

      <div class="ic-library" data-library>${libraryGrid()}</div>
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">Anatomia</h2>
          <p class="doc-section__desc">As mesmas regras para todos os ícones. É isso que faz a biblioteca parecer uma família.</p>
        </div>
      </header>
      <div class="ic-anatomy">
        <figure class="ic-anatomy__stage">
          <div class="ic-anatomy__frame" data-anatomy>${anatomySvg(anatomyIcon)}</div>
          <figcaption class="ic-anatomy__legend">
            <span><i class="ic-swatch ic-swatch--live"></i>Área útil 20 × 20</span>
            <span><i class="ic-swatch ic-swatch--key"></i>Keylines</span>
            <span><i class="ic-swatch ic-swatch--grid"></i>Grid de 1 px</span>
          </figcaption>
          <div class="ic-anatomy__picker" role="group" aria-label="Ícone de exemplo">
            ${ANATOMY_ICONS.map((n) => `<button type="button" class="ds-icon-btn ds-icon-btn--outline" data-anatomy-icon="${n}" aria-pressed="${n === anatomyIcon}" aria-label="Ver ${n}" data-ds-tooltip="${n}" data-ds-tooltip-placement="bottom">${icon(n, { size: 20 })}</button>`).join('')}
          </div>
        </figure>
        <ol class="ic-rules" role="list">
          ${RULES.map(
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
          <h2 class="doc-section__title" id="tamanhos-title">Tamanhos</h2>
          <p class="doc-section__desc">Cinco tamanhos, todos em tokens. Abaixo de 16 px o traço engrossa sozinho para manter a leitura.</p>
        </div>
      </header>
      <div class="ic-sizes">
        ${iconSizes
          .map((t) => {
            const key = t.name.split('.').at(-1);
            return `<button type="button" class="ic-size" data-copy="var(${t.cssVar})" aria-label="Copiar var(${t.cssVar})">
              <span class="ic-size__glyph">${icon('bell', { size: t.px })}</span>
              <span class="ic-size__name">${key}<span class="ic-size__px">${t.px} px</span></span>
              <span class="ic-size__usage">${SIZE_USAGE[key] ?? ''}</span>
              <span class="ic-size__token">${t.cssVar}</span>
            </button>`;
          })
          .join('')}
      </div>
      <div class="ic-context">
        <span class="ds-badge ds-badge--success">${icon('check', { size: 14 })}Publicado</span>
        <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 16 })}</span>Tom direto</span>
        <span class="ds-btn ds-btn--secondary">${icon('download', { size: 20 })}Exportar</span>
        <span class="ds-btn ds-btn--primary ds-btn--lg">${icon('zap', { size: 24 })}Gerar ideias</span>
      </div>
      <p class="ic-context__caption">O ícone acompanha o tamanho do componente: 14 no badge, 16 no chip, 20 no botão padrão, 24 no botão grande.</p>
    </section>

    <section class="doc-section" id="codigo" aria-labelledby="codigo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="codigo-title">Em código</h2>
          <p class="doc-section__desc">Dois jeitos de usar: a função <code class="ds-inline-code">icon()</code> em JavaScript ou o elemento <code class="ds-inline-code">&lt;ds-icon&gt;</code> direto no HTML.</p>
        </div>
      </header>
      <div class="ic-code">
        <article class="ic-code__card">
          <p class="ic-code__title">${icon('code', { size: 18 })}JavaScript</p>
          <pre class="ds-code ds-code--sm"><code>import { icon } from './ds/icons/icons.js';

button.innerHTML = icon('home', { size: 20 });
<span class="ds-code__comment">// com rótulo para leitores de tela</span>
icon('bell', { size: 20, label: 'Notificações' });</code></pre>
        </article>
        <article class="ic-code__card">
          <p class="ic-code__title">${icon('file-text', { size: 18 })}HTML</p>
          <pre class="ds-code ds-code--sm"><code>&lt;ds-icon name="home"&gt;&lt;/ds-icon&gt;
&lt;ds-icon name="home" size="16"&gt;&lt;/ds-icon&gt;
<span class="ds-code__comment">&lt;!-- ícone sozinho, com significado --&gt;</span>
&lt;ds-icon name="home" size="20" label="Início"&gt;&lt;/ds-icon&gt;</code></pre>
        </article>
      </div>
      <div class="ic-a11y">
        <div class="ic-a11y__item">
          <span class="ic-a11y__icon">${icon('eye', { size: 20 })}</span>
          <div><p class="ic-a11y__title">Decorativo, ao lado de texto</p><p class="ic-a11y__text">Sem <code class="ds-inline-code">label</code>: o SVG sai com <code class="ds-inline-code">aria-hidden="true"</code> e o leitor de tela lê só o texto.</p></div>
        </div>
        <div class="ic-a11y__item">
          <span class="ic-a11y__icon">${icon('accessibility', { size: 20 })}</span>
          <div><p class="ic-a11y__title">Sozinho, com significado</p><p class="ic-a11y__text">Com <code class="ds-inline-code">label</code>: vira <code class="ds-inline-code">role="img"</code> com nome acessível. Em botões só de ícone, prefira o <code class="ds-inline-code">aria-label</code> no botão.</p></div>
        </div>
      </div>
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Ícone ajuda a reconhecer, não substitui a palavra.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: ícone com texto</p>
          <p class="usage-card__text">Na navegação e em botões, o rótulo diz o que acontece; o ícone ajuda a achar mais rápido.</p>
          <div class="ic-example"><span class="ds-btn ds-btn--secondary ds-btn--sm">${icon('download', { size: 16 })}Exportar</span></div>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: misturar estilos</p>
          <p class="usage-card__text">Ícones preenchidos, de outra biblioteca ou com outro traço quebram a família. Se faltar um, desenhe no grid.</p>
          <div class="ic-example ic-example--mixed">${icon('home', { size: 20 })}<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"/></svg>${icon('bell', { size: 20, strokeWidth: 2.6 })}</div>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Ícone sozinho? Nome e dica</p>
          <p class="usage-card__text">Botões só de ícone precisam de <code class="ds-inline-code">aria-label</code> e de um tooltip com o mesmo texto.</p>
          <div class="ic-example"><span class="ds-icon-btn ds-icon-btn--outline">${icon('settings', { size: 20 })}</span><span class="ic-example__tip">Configurações</span></div>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const library = root.querySelector('[data-library]');
  const count = root.querySelector('[data-count]');
  const search = root.querySelector('[data-search]');
  const refresh = () => {
    library.innerHTML = libraryGrid();
    count.textContent = resultLabel();
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
      root.querySelectorAll('[data-category]').forEach((c) => c.setAttribute('aria-pressed', String(c === cat)));
      refresh();
      return;
    }

    const pick = event.target.closest('[data-anatomy-icon]');
    if (pick) {
      anatomyIcon = pick.dataset.anatomyIcon;
      root.querySelector('[data-anatomy]').innerHTML = anatomySvg(anatomyIcon);
      root.querySelectorAll('[data-anatomy-icon]').forEach((b) => b.setAttribute('aria-pressed', String(b === pick)));
    }
  };

  root.addEventListener('input', onInput);
  root.addEventListener('click', onClick);

  // categoria salva entre visitas: sincroniza os chips
  root.querySelectorAll('[data-category]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.category === category)));
  root.querySelectorAll('[data-anatomy-icon]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.anatomyIcon === anatomyIcon)));

  const sizeChip = root.querySelector('[data-menu="size"]');
  const setSizeLabel = () => (sizeChip.querySelector('[data-label]').textContent = SIZES.find((s) => s.value === size).label);
  setSizeLabel();
  const sizeMenu = attachMenu(sizeChip, {
    label: 'Tamanho da prévia',
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
