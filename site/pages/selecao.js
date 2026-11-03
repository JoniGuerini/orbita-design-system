import { icon } from '../../ds/icons/icons.js';
import { attachMenu } from '../../ds/js/menu.js';
import { mountSelects } from '../../ds/js/select.js';
import { locale, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/selecao.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const SIZES = () => [
  ['sm', L('Pequeno', 'Small', 'Pequeño'), 32],
  ['md', L('Médio', 'Medium', 'Mediano'), 40],
  ['lg', L('Grande', 'Large', 'Grande'), 48],
];

const STATES = () => [
  ['default', L('Padrão', 'Default', 'Predeterminado'), L('Contorno discreto e seta à direita.', 'A quiet outline and a chevron on the right.', 'Contorno discreto y flecha a la derecha.')],
  ['hover', 'Hover', L('O contorno fica mais forte.', 'The outline gets stronger.', 'El contorno se vuelve más fuerte.')],
  ['focus', L('Foco ou aberto', 'Focus or open', 'Foco o abierto'), L('Contorno na cor de foco, halo suave e a seta gira.', 'An outline in the focus color, a soft halo, and the chevron rotates.', 'Contorno en el color de foco, halo suave y la flecha gira.')],
  ['placeholder', L('Sem escolha', 'No choice', 'Sin elección'), L('O texto vazio aparece apagado, como um placeholder.', 'The empty text shows faded, like a placeholder.', 'El texto vacío aparece atenuado, como un placeholder.')],
  ['disabled', L('Desativado', 'Disabled', 'Desactivado'), L('Opacidade reduzida e fora da ordem de foco.', 'Reduced opacity and out of the focus order.', 'Opacidad reducida y fuera del orden de foco.')],
  ['invalid', L('Inválido', 'Invalid', 'Inválido'), L('Contorno e mensagem de perigo.', 'A danger outline and message.', 'Contorno y mensaje de peligro.')],
];

const ICONS = () => [
  ['none', L('Sem ícone', 'No icon', 'Sin ícono')],
  ['globe', L('Globo', 'Globe', 'Globo')],
  ['calendar', L('Calendário', 'Calendar', 'Calendario')],
  ['users', L('Pessoas', 'People', 'Personas')],
  ['tag', L('Etiqueta', 'Tag', 'Etiqueta')],
];

// nomes dos idiomas no próprio idioma: iguais em qualquer versão do site
const LANGUAGES = ['Português (Brasil)', 'English (US)', 'Español', 'Français', 'Deutsch', 'Italiano', 'Nederlands', 'Polski', '日本語', '한국어'];

const TIMEZONES = () => [
  [L('Brasil', 'Brazil', 'Brasil'), [['Brasília (UTC−3)', true], ['Manaus (UTC−4)'], ['Fernando de Noronha (UTC−2)'], ['Rio Branco (UTC−5)', false, true]]],
  [L('Europa', 'Europe', 'Europa'), [[L('Lisboa (UTC+0)', 'Lisbon (UTC+0)', 'Lisboa (UTC+0)')], [L('Madri (UTC+1)', 'Madrid (UTC+1)', 'Madrid (UTC+1)')], [L('Berlim (UTC+1)', 'Berlin (UTC+1)', 'Berlín (UTC+1)')]]],
  [L('América do Norte', 'North America', 'América del Norte'), [[L('Nova York (UTC−5)', 'New York (UTC−5)', 'Nueva York (UTC−5)')], [L('Cidade do México (UTC−6)', 'Mexico City (UTC−6)', 'Ciudad de México (UTC−6)')]]],
];

// países pelo código: o nome vem do Intl, no idioma atual, em ordem alfabética
const COUNTRY_CODES = [
  [() => L('América do Sul', 'South America', 'América del Sur'), ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'PY', 'PE', 'UY', 'VE']],
  [() => L('América do Norte', 'North America', 'América del Norte'), ['CA', 'CR', 'US', 'MX', 'PA']],
  [() => L('Europa', 'Europe', 'Europa'), ['DE', 'AT', 'BE', 'ES', 'FR', 'IE', 'IT', 'NO', 'NL', 'PT', 'GB', 'SE', 'CH']],
  [() => L('Ásia e Oceania', 'Asia and Oceania', 'Asia y Oceanía'), ['AU', 'KR', 'IN', 'JP', 'NZ', 'SG']],
  [() => L('África', 'Africa', 'África'), ['ZA', 'AO', 'CV', 'EG', 'MA', 'MZ', 'NG']],
];
const countryName = (code) => new Intl.DisplayNames([locale()], { type: 'region' }).of(code);
const COUNTRIES = () =>
  COUNTRY_CODES.map(([group, codes]) => [group(), codes.map(countryName).sort((a, b) => a.localeCompare(b, locale()))]);
const brazil = () => countryName('BR');

const PEOPLE = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Ramos', 'Elisa Prado', 'Fábio Nunes', 'Gabriela Rocha', 'Heitor Melo', 'Isabela Torres', 'João Pedro Alves', 'Lívia Castro', 'Marcos Vieira'];

const TAGS = () => [
  [L('Produto', 'Product', 'Producto'), [L('Pesquisa', 'Research', 'Investigación'), 'Roadmap', L('Lançamento', 'Launch', 'Lanzamiento'), L('Métrica', 'Metric', 'Métrica'), L('Experimento', 'Experiment', 'Experimento')]],
  ['Design', [L('Componente', 'Component', 'Componente'), 'Token', L('Acessibilidade', 'Accessibility', 'Accesibilidad'), L('Ícone', 'Icon', 'Ícono'), L('Protótipo', 'Prototype', 'Prototipo')]],
  [L('Engenharia', 'Engineering', 'Ingeniería'), ['Front-end', 'API', L('Performance', 'Performance', 'Rendimiento'), 'Bug', L('Dívida técnica', 'Tech debt', 'Deuda técnica'), L('Teste', 'Test', 'Prueba')]],
];

const CATEGORIES = () => [
  L('Alimentação', 'Food', 'Alimentación'), L('Transporte', 'Transport', 'Transporte'), L('Moradia', 'Housing', 'Vivienda'), L('Saúde', 'Health', 'Salud'), L('Educação', 'Education', 'Educación'),
  L('Lazer', 'Leisure', 'Ocio'), L('Assinaturas', 'Subscriptions', 'Suscripciones'), L('Viagem', 'Travel', 'Viajes'), 'Pets', L('Presentes', 'Gifts', 'Regalos'),
];

const WHICH = () => [
  [L('Quando', 'When', 'Cuándo'), L('Uma escolha num formulário, poucas opções.', 'One choice in a form, few options.', 'Una elección en un formulario, pocas opciones.'), L('Uma escolha numa lista longa: país, cidade, pessoa.', 'One choice in a long list: country, city, person.', 'Una elección en una lista larga: país, ciudad, persona.'), L('Várias escolhas: etiquetas, responsáveis, categorias.', 'Several choices: tags, assignees, categories.', 'Varias elecciones: etiquetas, responsables, categorías.'), L('Filtro rápido que muda a tela na hora.', 'A quick filter that changes the screen right away.', 'Filtro rápido que cambia la pantalla al instante.')],
  [L('Opções', 'Options', 'Opciones'), L('5 a ~15', '5 to ~15', '5 a ~15'), L('15 a centenas', '15 to hundreds', '15 a cientos'), L('De poucas a centenas (com busca)', 'From few to hundreds (with search)', 'De pocas a cientos (con búsqueda)'), L('Até ~7', 'Up to ~7', 'Hasta ~7')],
  [L('Efeito', 'Effect', 'Efecto'), L('Vale ao enviar', 'Applies on submit', 'Vale al enviar'), L('Vale ao enviar', 'Applies on submit', 'Vale al enviar'), L('Vale ao enviar', 'Applies on submit', 'Vale al enviar'), L('Imediato', 'Immediate', 'Inmediato')],
  [L('Valor', 'Value', 'Valor'), L(`${ic('&lt;select&gt;')} real`, `A real ${ic('&lt;select&gt;')}`, `${ic('&lt;select&gt;')} real`), L(`${ic('&lt;select&gt;')} real`, `A real ${ic('&lt;select&gt;')}`, `${ic('&lt;select&gt;')} real`), L(`${ic('&lt;select multiple&gt;')} real`, `A real ${ic('&lt;select multiple&gt;')}`, `${ic('&lt;select multiple&gt;')} real`), L('Estado da tela', 'Screen state', 'Estado de la pantalla')],
  [L('Atributos', 'Attributes', 'Atributos'), ic('data-ds-select'), `+ ${ic('data-search')}`, `+ ${ic('multiple')}`, 'ds-chip + attachMenu'],
];

/* ───────── Seleção (playground, exemplos e código) ───────── */

const isSelected = (o, label, i) => (o.selected ? o.selected.includes(label) : !o.multiple && i === 0);
const soon = () => L(' — em breve', ' — coming soon', ' — pronto');

function optionsHtml(o) {
  if (o.groups) {
    let n = 0;
    return o.groups
      .map(([group, items]) => {
        const rows = items.map((item) => {
          const [label, selected, disabled] = Array.isArray(item) ? item : [item];
          const on = o.selected ? o.selected.includes(label) : Boolean(selected) || (!o.multiple && !o.placeholderOption && n === 0 && o.groups[0][1][0] === item);
          n += 1;
          return `<option${on ? ' selected' : ''}${disabled ? ' disabled' : ''}>${escapeHtml(label)}${disabled ? soon() : ''}</option>`;
        });
        return `<optgroup label="${escapeHtml(group)}">${rows.join('')}</optgroup>`;
      })
      .join('');
  }
  const empty = !o.multiple && (o.state === 'placeholder' || o.state === 'invalid' || o.placeholderOption);
  const list = o.options ?? LANGUAGES;
  return [
    empty ? `<option value="" selected>${escapeHtml(o.placeholder ?? L('Escolha um idioma', 'Choose a language', 'Elige un idioma'))}</option>` : '',
    ...list.map((label, i) => `<option${!empty && !(o.multiple && ['placeholder', 'invalid'].includes(o.state)) && isSelected(o, label, i) ? ' selected' : ''}>${escapeHtml(label)}</option>`),
  ].join('');
}

function select(o) {
  const id = o.id;
  const invalid = o.state === 'invalid';
  const describedBy = invalid ? `${id}-error` : o.hint ? `${id}-hint` : '';
  const attrs = [
    `id="${id}"`,
    o.name && `name="${o.name}"`,
    'data-ds-select',
    o.multiple && 'multiple',
    o.size && o.size !== 'md' && `data-size="${o.size}"`,
    o.icon && o.icon !== 'none' && `data-icon="${o.icon}"`,
    o.search && 'data-search',
    o.search && o.searchPlaceholder && `data-search-placeholder="${escapeHtml(o.searchPlaceholder)}"`,
    o.multiple && o.display === 'count' && 'data-display="count"',
    o.multiple && o.max && `data-max="${o.max}"`,
    o.multiple && o.footer && 'data-footer',
    o.multiple && o.placeholder && `data-placeholder="${escapeHtml(o.placeholder)}"`,
    ['hover', 'focus'].includes(o.state) && `data-ds-state="${o.state}"`,
    (o.state === 'disabled' || o.disabled) && 'disabled',
    invalid && 'aria-invalid="true"',
    describedBy && `aria-describedby="${describedBy}"`,
    o.required && 'required',
  ].filter(Boolean);
  return `<div class="ds-form-field">
    <label class="ds-form-field__label" for="${id}">${escapeHtml(o.label || L('Idioma', 'Language', 'Idioma'))}</label>
    <select ${attrs.join(' ')}>${optionsHtml(o)}</select>
    ${invalid ? `<div class="ds-form-field__footer"><p class="ds-form-field__error" id="${id}-error">${icon('alert-circle', { size: 16 })}<span>${escapeHtml(o.error ?? L('Escolha pelo menos uma opção para continuar.', 'Choose at least one option to continue.', 'Elige al menos una opción para continuar.'))}</span></p></div>` : ''}
    ${!invalid && o.hint ? `<div class="ds-form-field__footer"><p class="ds-form-field__hint" id="${id}-hint">${escapeHtml(o.hint)}</p></div>` : ''}
  </div>`;
}

function selectCode(s) {
  const multiple = s.multiple === 'yes';
  const search = s.search === 'yes';
  const id = multiple ? L('idiomas', 'languages', 'idiomas') : L('idioma', 'language', 'idioma');
  const errorId = `${id}-${L('erro', 'error', 'error')}`;
  const invalid = s.state === 'invalid';
  const empty = !multiple && (s.state === 'placeholder' || invalid);
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    'data-ds-select',
    multiple && 'multiple',
    s.size !== 'md' && `data-size="${s.size}"`,
    s.icon !== 'none' && `data-icon="${s.icon}"`,
    search && `data-search data-search-placeholder="${L('Buscar idioma', 'Search language', 'Buscar idioma')}"`,
    multiple && s.display === 'count' && 'data-display="count"',
    multiple && s.max !== 'none' && `data-max="${s.max}"`,
    multiple && 'data-footer',
    s.state === 'disabled' && 'disabled',
    invalid && `aria-invalid="true" aria-describedby="${errorId}"`,
  ].filter(Boolean);
  const lines = [`<div class="ds-form-field">`, `  <label class="ds-form-field__label" for="${id}">${s.label || L('Idioma', 'Language', 'Idioma')}</label>`, `  <select ${attrs.join(' ')}>`];
  if (empty) lines.push(`    <option value="">${L('Escolha um idioma', 'Choose a language', 'Elige un idioma')}</option>`);
  const pre = multiple && !['placeholder', 'invalid'].includes(s.state);
  lines.push(`    <option${pre || (!multiple && !empty) ? ' selected' : ''}>Português (Brasil)</option>`, `    <option${pre ? ' selected' : ''}>English (US)</option>`, `    <option>Español</option>`, `  </select>`);
  if (invalid) lines.push(`  <p class="ds-form-field__error" id="${errorId}">${multiple ? L('Escolha pelo menos uma opção para continuar.', 'Choose at least one option to continue.', 'Elige al menos una opción para continuar.') : L('Escolha um idioma para continuar.', 'Choose a language to continue.', 'Elige un idioma para continuar.')}</p>`);
  lines.push(`</div>`, ``, `<script type="module">`, `  import { mountSelects } from './ds/js/select.js';`, `  mountSelects(document);`, `</script>`);
  return lines.join('\n');
}

/* ───────── Página ───────── */

const sectionHead = (id, title, desc) => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>
</header>`;

const PERIODS = () => [
  { value: '7', label: L('Últimos 7 dias', 'Last 7 days', 'Últimos 7 días') },
  { value: '30', label: L('Últimos 30 dias', 'Last 30 days', 'Últimos 30 días') },
  { value: '90', label: L('Últimos 90 dias', 'Last 90 days', 'Últimos 90 días') },
  { value: 'year', label: L('Este ano', 'This year', 'Este año') },
];

const keysTable = (rows) => {
  const closed = L('Fechado', 'Closed', 'Cerrado');
  const open = L('Aberto', 'Open', 'Abierto');
  return `<div class="doc-table sl-keys">
  <div class="doc-table__head" aria-hidden="true"><span>${L('Tecla', 'Key', 'Tecla')}</span><span>${closed}</span><span>${open}</span></div>
  ${rows
    .map(([keys, c, o]) => `<div class="doc-table__row"><span class="sl-keys__keys">${keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('')}</span><span class="sl-table__cell" data-when="${closed}">${c}</span><span class="sl-table__cell" data-when="${open}">${o}</span></div>`)
    .join('')}
</div>`;
};

export default function renderSelecao(page) {
  const sizes = SIZES();
  const states = STATES();
  const timezones = TIMEZONES();
  const countries = COUNTRIES();
  const tags = TAGS();
  const categories = CATEGORIES();
  const countryCount = countries.reduce((n, [, list]) => n + list.length, 0);
  const tagCount = tags.reduce((n, [, list]) => n + list.length, 0);
  const space = L('Espaço', 'Space', 'Espacio');
  const which = [L('Única', 'Single', 'Única'), L('Com busca', 'Searchable', 'Con búsqueda'), L('Múltipla', 'Multiple', 'Múltiple'), L('Chip de filtro', 'Filter chip', 'Chip de filtro')];
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L(`Para escolher uma ou várias opções numa lista. A lista é do Lume — mesmo visual dos menus, com busca quando cresce —, mas o valor mora num ${ic('&lt;select&gt;')} real, que vai junto no formulário.`, `For choosing one or several options from a list. The list is Lume’s own — the same look as menus, with search when it grows — but the value lives in a real ${ic('&lt;select&gt;')} that goes along with the form.`, `Para elegir una o varias opciones de una lista. La lista es de Lume — el mismo aspecto de los menús, con búsqueda cuando crece —, pero el valor vive en un ${ic('&lt;select&gt;')} real, que va junto con el formulario.`)}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tipos', 'types', 'tipos')}</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">${sizes.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('padrão ARIA', 'ARIA pattern', 'patrón ARIA')}</dt><dd class="doc-stat__value">combobox</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('sem JS', 'without JS', 'sin JS')}</dt><dd class="doc-stat__value">${L('nativo', 'native', 'nativo')}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['qual', L('Qual usar', 'Which to use', 'Cuál usar')],
        ['com-busca', L('Com busca', 'Searchable', 'Con búsqueda')],
        ['multipla', L('Múltipla escolha', 'Multiple choice', 'Selección múltiple')],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
        ['estados', L('Estados', 'States', 'Estados')],
        ['grupos', L('Grupos e desativados', 'Groups and disabled', 'Grupos y desactivados')],
        ['teclado', L('Teclado e acessibilidade', 'Keyboard and accessibility', 'Teclado y accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', L('Combine busca, múltipla escolha, exibição e limite. A lista do palco funciona de verdade — teclado incluído.', 'Combine search, multiple choice, display, and limit. The list on the stage really works — keyboard included.', 'Combina búsqueda, selección múltiple, visualización y límite. La lista del escenario funciona de verdad — teclado incluido.'))}
      ${playgroundMarkup('selecao')}
    </section>

    <section class="doc-section" id="qual" aria-labelledby="qual-title">
      ${sectionHead('qual', L('Qual usar', 'Which to use', 'Cuál usar'), L('Três tipos de seleção para formulários e o chip com menu para filtros. As listas têm o mesmo visual; muda o que acontece ao escolher.', 'Three kinds of select for forms, and the chip with a menu for filters. The lists look the same; what changes is what happens on choosing.', 'Tres tipos de selector para formularios y el chip con menú para filtros. Las listas tienen el mismo aspecto; cambia lo que pasa al elegir.'))}
      <div class="sl-compare">
        <article class="sl-compare__card">
          <div class="sl-compare__stage">
            <form class="sl-compare__form" data-native-form>
              ${select({ id: 'sl-form-tz', name: 'fuso', label: L('Fuso horário', 'Time zone', 'Zona horaria'), icon: 'globe', groups: timezones, hint: L('Usado nos lembretes e relatórios.', 'Used in reminders and reports.', 'Se usa en recordatorios e informes.') })}
              <div class="sl-compare__actions">
                <button type="submit" class="ds-btn ds-btn--primary ds-btn--sm">${L('Salvar', 'Save', 'Guardar')}</button>
                <span class="sl-compare__result" data-form-result aria-live="polite"></span>
              </div>
            </form>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${page.label}<code>select[data-ds-select]</code></p><p class="cd-example__text">${L('No formulário. O valor vai junto ao salvar.', 'In the form. The value goes along on save.', 'En el formulario. El valor va junto al guardar.')}</p></div>
        </article>
        <article class="sl-compare__card">
          <div class="sl-compare__stage sl-compare__stage--toolbar">
            <div class="sl-toolbar">
              <p class="sl-toolbar__title">${L('Visitas', 'Visits', 'Visitas')}</p>
              <button type="button" class="ds-chip" data-period><span class="ds-chip__icon">${icon('calendar', { size: 16 })}</span><span data-label>${PERIODS()[1].label}</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
            </div>
            <p class="sl-toolbar__value"><span data-period-value>${formatNumber(12480)}</span><span class="sl-toolbar__unit">${L('visitas', 'visits', 'visitas')}</span></p>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">${L('Chip com menu', 'Chip with menu', 'Chip con menú')}<code>ds-chip + attachMenu</code></p><p class="cd-example__text">${L('No filtro. Muda a tela na hora.', 'In the filter. Changes the screen right away.', 'En el filtro. Cambia la pantalla al instante.')}</p></div>
        </article>
      </div>
      <div class="doc-table sl-which">
        <div class="doc-table__head" aria-hidden="true"><span></span>${which.map((w) => `<span>${w}</span>`).join('')}</div>
        ${WHICH().map(([key, ...cells]) => `<div class="doc-table__row"><span class="sl-table__key">${key}</span>${cells.map((c, i) => `<span class="sl-table__cell" data-when="${which[i]}">${c}</span>`).join('')}</div>`).join('')}
      </div>
    </section>

    <section class="doc-section" id="com-busca" aria-labelledby="com-busca-title">
      ${sectionHead('com-busca', L('Com busca', 'Searchable', 'Con búsqueda'), L(`Com ${ic('data-search')}, a lista ganha um campo no topo e o foco vai direto para ele. Filtra sem acento e sem diferenciar maiúsculas — inclusive pelo nome do grupo.`, `With ${ic('data-search')}, the list gets a field at the top and focus goes straight to it. It filters ignoring accents and case — group names included.`, `Con ${ic('data-search')}, la lista gana un campo arriba y el foco va directo a él. Filtra sin tildes y sin distinguir mayúsculas — incluso por el nombre del grupo.`))}
      <div class="sl-feature">
        <div class="sl-feature__demo">
          ${select({ id: 'sl-search-country', name: 'pais', label: L('País', 'Country', 'País'), icon: 'globe', search: true, searchPlaceholder: L('Buscar país ou continente', 'Search country or continent', 'Buscar país o continente'), groups: countries, placeholderOption: true, selected: [brazil()], hint: L(`${countryCount} países em 5 continentes. Experimente “euro” ou “mexico”, sem acento.`, `${countryCount} countries on 5 continents. Try “euro” or “mexico”.`, `${countryCount} países en 5 continentes. Prueba “euro” o “mexico”, sin tilde.`) })}
          ${select({ id: 'sl-search-person', name: 'responsavel', label: L('Responsável', 'Assignee', 'Responsable'), icon: 'users', search: true, searchPlaceholder: L('Buscar pessoa', 'Search person', 'Buscar persona'), options: PEOPLE, hint: L('Digite com a lista fechada: a busca já começa com a letra.', 'Type with the list closed: the search starts with that letter.', 'Escribe con la lista cerrada: la búsqueda empieza con esa letra.') })}
        </div>
        <ul class="sl-feature__list" role="list">
          <li>${icon('search', { size: 16 })}<span>${L('<strong>Filtra ao digitar</strong> e destaca o trecho encontrado, sem mudar o texto lido pelo leitor de tela.', '<strong>Filters as you type</strong> and highlights the match, without changing the text the screen reader reads.', '<strong>Filtra al escribir</strong> y destaca el fragmento encontrado, sin cambiar el texto que lee el lector de pantalla.')}</span></li>
          <li>${icon('arrow-up', { size: 16 })}<span>${L('<strong>↑ ↓ andam só pelas visíveis</strong>; Enter escolhe e fecha.', '<strong>↑ ↓ move only through the visible ones</strong>; Enter picks and closes.', '<strong>↑ ↓ recorren solo las visibles</strong>; Enter elige y cierra.')}</span></li>
          <li>${icon('x', { size: 16 })}<span>${L('<strong>Esc limpa a busca</strong>; com a busca vazia, fecha.', '<strong>Esc clears the search</strong>; with the search empty, it closes.', '<strong>Esc borra la búsqueda</strong>; con la búsqueda vacía, cierra.')}</span></li>
          <li>${icon('inbox', { size: 16 })}<span>${L('<strong>Nada encontrado?</strong> A lista avisa “Nada encontrado para …” no lugar das opções.', '<strong>Nothing found?</strong> The list says “Nothing found for …” in place of the options.', '<strong>¿Nada encontrado?</strong> La lista avisa “No hay resultados para …” en lugar de las opciones.')}</span></li>
        </ul>
      </div>
      <div class="sl-code">${codeBlock(`<select id="${L('pais', 'country', 'pais')}" name="${L('pais', 'country', 'pais')}" data-ds-select data-search
        data-search-placeholder="${L('Buscar país ou continente', 'Search country or continent', 'Buscar país o continente')}">
  <optgroup label="${countries[0][0]}">
    <option>${countryName('AR')}</option>
    <option selected>${brazil()}</option>
  </optgroup>
  …
</select>`)}</div>
    </section>

    <section class="doc-section" id="multipla" aria-labelledby="multipla-title">
      ${sectionHead('multipla', L('Múltipla escolha', 'Multiple choice', 'Selección múltiple'), L(`Com ${ic('multiple')}, cada opção ganha uma caixa de marcação e a lista não fecha ao escolher. Os escolhidos viram chips no campo — até duas linhas, depois “+N”.`, `With ${ic('multiple')}, each option gets a checkbox and the list doesn’t close on choosing. The chosen ones become chips in the field — up to two lines, then “+N”.`, `Con ${ic('multiple')}, cada opción gana una casilla y la lista no se cierra al elegir. Los elegidos se vuelven chips en el campo — hasta dos líneas, después “+N”.`))}
      <form class="sl-multi" data-tags-form>
        <article class="sl-multi__card sl-multi__card--main">
          <p class="sl-multi__eyebrow">${L('Caso principal: etiquetas', 'Main case: tags', 'Caso principal: etiquetas')}</p>
          ${select({ id: 'sl-tags', name: 'etiquetas', label: L('Etiquetas', 'Tags', 'Etiquetas'), icon: 'tag', multiple: true, search: true, searchPlaceholder: L('Buscar etiqueta', 'Search tag', 'Buscar etiqueta'), footer: true, max: 5, groups: tags, selected: [tags[1][1][0], tags[1][1][1], tags[1][1][2]], placeholder: L('Adicione etiquetas', 'Add tags', 'Añade etiquetas'), hint: L(`Até 5 de ${tagCount}. Backspace na busca vazia remove a última.`, `Up to 5 of ${tagCount}. Backspace in the empty search removes the last one.`, `Hasta 5 de ${tagCount}. Backspace en la búsqueda vacía quita la última.`) })}
          <div class="sl-multi__actions">
            <button type="submit" class="ds-btn ds-btn--primary ds-btn--sm">${L('Salvar', 'Save', 'Guardar')}</button>
            <span class="sl-compare__result" data-tags-result aria-live="polite"></span>
          </div>
          <p class="sl-multi__attrs"><code class="ds-inline-code">multiple data-search data-max="5" data-footer</code></p>
        </article>
        <article class="sl-multi__card">
          <p class="sl-multi__eyebrow">${L('Sem busca, com chips', 'No search, with chips', 'Sin búsqueda, con chips')}</p>
          ${select({ id: 'sl-people', name: 'pessoas', label: L('Revisores', 'Reviewers', 'Revisores'), icon: 'users', multiple: true, options: PEOPLE.slice(0, 7), selected: ['Ana Souza', 'Carla Dias'], placeholder: L('Escolha quem revisa', 'Choose who reviews', 'Elige quién revisa') })}
          <p class="sl-multi__attrs"><code class="ds-inline-code">multiple</code></p>
        </article>
        <article class="sl-multi__card">
          <p class="sl-multi__eyebrow">${L('Contagem no lugar dos chips', 'A count instead of chips', 'Conteo en lugar de chips')}</p>
          ${select({ id: 'sl-categories', name: 'categorias', label: L('Categorias', 'Categories', 'Categorías'), multiple: true, display: 'count', footer: true, options: categories, selected: categories.slice(0, 3), placeholder: L('Todas as categorias', 'All categories', 'Todas las categorías') })}
          <p class="sl-multi__attrs"><code class="ds-inline-code">multiple data-display="count" data-footer</code></p>
        </article>
      </form>
      <ul class="sl-feature__list sl-feature__list--inline" role="list">
        <li>${icon('check-square', { size: 16 })}<span>${L('<strong>Clique, Espaço ou Enter alternam</strong> sem fechar. Na busca, Espaço digita — use Enter.', '<strong>Click, Space, or Enter toggle</strong> without closing. In the search, Space types — use Enter.', '<strong>Clic, Espacio o Enter alternan</strong> sin cerrar. En la búsqueda, Espacio escribe — usa Enter.')}</span></li>
        <li>${icon('x', { size: 16 })}<span>${L('<strong>Remover um</strong>: o × do chip, desmarcar na lista ou Backspace. <strong>Todos</strong>: o × do campo ou “Limpar”.', '<strong>Remove one</strong>: the chip’s ×, unchecking in the list, or Backspace. <strong>All</strong>: the field’s × or “Clear”.', '<strong>Quitar uno</strong>: la × del chip, desmarcar en la lista o Backspace. <strong>Todos</strong>: la × del campo o “Borrar”.')}</span></li>
        <li>${icon('list', { size: 16 })}<span>${L('<strong>Selecionar todos</strong> respeita a busca atual e o limite.', '<strong>Select all</strong> respects the current search and the limit.', '<strong>Seleccionar todos</strong> respeta la búsqueda actual y el límite.')}</span></li>
        <li>${icon('info', { size: 16 })}<span>${L('<strong>Com limite</strong>, o resto fica desativado e a lista explica por quê.', '<strong>With a limit</strong>, the rest is disabled and the list explains why.', '<strong>Con límite</strong>, el resto queda desactivado y la lista explica por qué.')}</span></li>
      </ul>
      <div class="sl-code">${codeBlock(`<select id="${L('etiquetas', 'tags', 'etiquetas')}" name="${L('etiquetas', 'tags', 'etiquetas')}" multiple data-ds-select
        data-search data-max="5" data-footer
        data-placeholder="${L('Adicione etiquetas', 'Add tags', 'Añade etiquetas')}">
  <optgroup label="Design">
    <option selected>${tags[1][1][0]}</option>
    <option selected>Token</option>
  </optgroup>
  …
</select>

<!-- ${L('os escolhidos chegam como uma lista', 'the chosen ones arrive as a list', 'los elegidos llegan como una lista')} -->
<script>
  new FormData(form).getAll('${L('etiquetas', 'tags', 'etiquetas')}'); // ['${tags[1][1][0]}', 'Token']
</script>`)}</div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      ${sectionHead('tamanhos', L('Tamanhos', 'Sizes', 'Tamaños'), L(`Os mesmos três do campo de texto — alinham lado a lado num formulário. Use ${ic('data-size')} no select; na múltipla, os chips acompanham.`, `The same three as the text field — they line up side by side in a form. Use ${ic('data-size')} on the select; in multiple, the chips follow.`, `Los mismos tres del campo de texto — se alinean lado a lado en un formulario. Usa ${ic('data-size')} en el select; en el múltiple, los chips acompañan.`))}
      <div class="sl-sizes">
        ${sizes.map(
          ([id, name, h]) => `<article class="cd-example">
            <div class="cd-example__preview sl-preview sl-preview--stack" inert>
              ${select({ id: `sl-size-${id}`, label: name, size: id, icon: 'globe' })}
              ${select({ id: `sl-size-multi-${id}`, label: `${name} · ${L('múltipla', 'multiple', 'múltiple')}`, size: id, multiple: true, options: LANGUAGES.slice(0, 4), selected: LANGUAGES.slice(0, 2) })}
            </div>
            <div class="cd-example__body"><p class="cd-example__name">${name}<code>${id === 'md' ? L('padrão', 'default', 'predeterminado') : `data-size="${id}"`}</code></p><p class="cd-example__text">${L(`${h} px de altura mínima.`, `${h} px minimum height.`, `${h} px de altura mínima.`)}</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', L('Estados', 'States', 'Estados'), L(`Iguais aos do campo de texto, na única e na múltipla. Para documentar e testar, force hover ou foco com ${ic('data-ds-state')} no select.`, `The same as the text field’s, in single and multiple. To document and test, force hover or focus with ${ic('data-ds-state')} on the select.`, `Iguales a los del campo de texto, en el único y en el múltiple. Para documentar y probar, fuerza hover o foco con ${ic('data-ds-state')} en el select.`))}
      <div class="cd-grid sl-states">
        ${states.map(
          ([id, name, text]) => `<article class="cd-example">
            <div class="cd-example__preview sl-preview sl-preview--stack" inert>
              ${select({ id: `sl-state-${id}`, label: L('Idioma', 'Language', 'Idioma'), state: id })}
              ${select({ id: `sl-state-multi-${id}`, label: L('Idiomas', 'Languages', 'Idiomas'), state: id, multiple: true, options: LANGUAGES.slice(0, 4), selected: ['Português (Brasil)', 'Español'], placeholder: L('Escolha idiomas', 'Choose languages', 'Elige idiomas') })}
            </div>
            <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="grupos" aria-labelledby="grupos-title">
      ${sectionHead('grupos', L('Grupos e desativados', 'Groups and disabled', 'Grupos y desactivados'), L(`${ic('&lt;optgroup&gt;')} vira um rótulo de grupo na lista; ${ic('&lt;option disabled&gt;')} aparece, mas o teclado e o clique pulam a opção.`, `${ic('&lt;optgroup&gt;')} becomes a group label in the list; ${ic('&lt;option disabled&gt;')} shows, but the keyboard and clicks skip it.`, `${ic('&lt;optgroup&gt;')} se vuelve una etiqueta de grupo en la lista; ${ic('&lt;option disabled&gt;')} aparece, pero el teclado y el clic saltan la opción.`))}
      <div class="sl-groups">
        <div class="sl-groups__demo">
          ${select({ id: 'sl-groups-tz', label: L('Fuso horário', 'Time zone', 'Zona horaria'), icon: 'globe', groups: timezones, hint: L('Rio Branco ainda não está disponível.', 'Rio Branco isn’t available yet.', 'Rio Branco todavía no está disponible.') })}
          ${select({ id: 'sl-groups-off', label: L('Plano', 'Plan', 'Plan'), disabled: true, options: [L('Equipe (fixo pelo administrador)', 'Team (set by the admin)', 'Equipo (fijado por el administrador)')], hint: L('Só quem administra a conta pode trocar.', 'Only account admins can change it.', 'Solo quien administra la cuenta puede cambiarlo.') })}
        </div>
        <div class="sl-groups__code">${codeBlock(`<select id="${L('fuso', 'timezone', 'zona')}" data-ds-select data-icon="globe">
  <optgroup label="${timezones[0][0]}">
    <option selected>Brasília (UTC−3)</option>
    <option disabled>Rio Branco (UTC−5)${soon()}</option>
  </optgroup>
  <optgroup label="${timezones[1][0]}">
    <option>${timezones[1][1][0][0]}</option>
  </optgroup>
</select>`)}</div>
      </div>
      <p class="sl-fallback">${icon('info', { size: 16 })}<span>${L(`Sem JavaScript, o mesmo ${ic('&lt;select&gt;')} aparece como lista nativa do sistema, já com o visual básico do campo. Nada se perde.`, `Without JavaScript, the same ${ic('&lt;select&gt;')} shows as the system’s native list, already with the field’s basic look. Nothing is lost.`, `Sin JavaScript, el mismo ${ic('&lt;select&gt;')} aparece como lista nativa del sistema, ya con el aspecto básico del campo. No se pierde nada.`)}</span></p>
    </section>

    <section class="doc-section" id="teclado" aria-labelledby="teclado-title">
      ${sectionHead('teclado', L('Teclado e acessibilidade', 'Keyboard and accessibility', 'Teclado y accesibilidad'), L(`Segue o padrão de combobox do WAI-ARIA. A opção ativa é anunciada por ${ic('aria-activedescendant')}, no gatilho ou no campo de busca.`, `It follows the WAI-ARIA combobox pattern. The active option is announced through ${ic('aria-activedescendant')}, on the trigger or the search field.`, `Sigue el patrón de combobox de WAI-ARIA. La opción activa se anuncia con ${ic('aria-activedescendant')}, en el disparador o en el campo de búsqueda.`))}
      <h3 class="doc-subhead">${L('Todos os tipos', 'All types', 'Todos los tipos')}</h3>
      ${keysTable([
        [['Enter', space], L('Abre a lista', 'Opens the list', 'Abre la lista'), L('Única: escolhe e fecha · Múltipla: marca ou desmarca', 'Single: picks and closes · Multiple: checks or unchecks', 'Única: elige y cierra · Múltiple: marca o desmarca')],
        [['↓', '↑'], L('Abre na opção escolhida', 'Opens on the chosen option', 'Abre en la opción elegida'), L('Move entre as opções visíveis (pula as desativadas)', 'Moves through the visible options (skips disabled ones)', 'Recorre las opciones visibles (salta las desactivadas)')],
        [['Home', 'End'], L('Abre na primeira ou na última', 'Opens on the first or last', 'Abre en la primera o en la última'), L('Vai para a primeira ou a última (sem busca)', 'Goes to the first or last (without search)', 'Va a la primera o a la última (sin búsqueda)')],
        [['Page ↓', 'Page ↑'], '—', L('Pula 10 opções', 'Jumps 10 options', 'Salta 10 opciones')],
        [['Esc'], '—', L('Fecha sem mudar nada', 'Closes without changing anything', 'Cierra sin cambiar nada')],
        [['Tab'], L('Segue para o próximo campo', 'Moves to the next field', 'Sigue al siguiente campo'), L('Única sem busca: escolhe a ativa e segue · Demais: fecha e segue', 'Single without search: picks the active one and moves on · Others: closes and moves on', 'Única sin búsqueda: elige la activa y sigue · Demás: cierra y sigue')],
      ])}
      <h3 class="doc-subhead">${L('Sem busca', 'Without search', 'Sin búsqueda')}</h3>
      ${keysTable([[['A–Z'], L('Abre na primeira que começa com a letra', 'Opens on the first one starting with the letter', 'Abre en la primera que empieza con la letra'), L('Pula para a próxima com a letra', 'Jumps to the next one with that letter', 'Salta a la siguiente con la letra')]])}
      <h3 class="doc-subhead">${L('Com busca', 'With search', 'Con búsqueda')}</h3>
      ${keysTable([
        [['A–Z'], L('Abre a lista e começa a busca com a letra', 'Opens the list and starts the search with the letter', 'Abre la lista y empieza la búsqueda con la letra'), L('Filtra a lista', 'Filters the list', 'Filtra la lista')],
        [[space], L('Abre a lista', 'Opens the list', 'Abre la lista'), L('Digita um espaço na busca', 'Types a space in the search', 'Escribe un espacio en la búsqueda')],
        [['Esc'], '—', L('Limpa a busca; vazia, fecha', 'Clears the search; when empty, closes', 'Borra la búsqueda; vacía, cierra')],
      ])}
      <h3 class="doc-subhead">${L('Múltipla', 'Multiple', 'Múltiple')}</h3>
      ${keysTable([
        [['Backspace'], L('Remove o último escolhido', 'Removes the last chosen', 'Quita el último elegido'), L('Na busca vazia, remove o último escolhido', 'In the empty search, removes the last chosen', 'En la búsqueda vacía, quita el último elegido')],
        [['Ctrl', 'A'], '—', L('Marca todas as visíveis (sem busca), respeitando o limite', 'Checks all visible ones (without search), respecting the limit', 'Marca todas las visibles (sin búsqueda), respetando el límite')],
      ])}
      <div class="sl-a11y">
        ${a11yList([
          [L('Papéis certos', 'The right roles', 'Los roles correctos'), L(`Gatilho com ${ic('role="combobox"')}, ${ic('aria-haspopup="listbox"')} e ${ic('aria-expanded')}; lista ${ic('role="listbox"')}; opções com ${ic('aria-selected')}.`, `A trigger with ${ic('role="combobox"')}, ${ic('aria-haspopup="listbox"')}, and ${ic('aria-expanded')}; a ${ic('role="listbox"')} list; options with ${ic('aria-selected')}.`, `Disparador con ${ic('role="combobox"')}, ${ic('aria-haspopup="listbox"')} y ${ic('aria-expanded')}; lista ${ic('role="listbox"')}; opciones con ${ic('aria-selected')}.`)],
          [L('Busca é o combobox', 'Search is the combobox', 'La búsqueda es el combobox'), L(`Com busca, o campo do topo tem ${ic('role="combobox"')} e ${ic('aria-autocomplete="list"')}; o destaque do trecho não muda o texto lido.`, `With search, the top field has ${ic('role="combobox"')} and ${ic('aria-autocomplete="list"')}; the match highlight doesn’t change the text read.`, `Con búsqueda, el campo de arriba tiene ${ic('role="combobox"')} y ${ic('aria-autocomplete="list"')}; el destaque del fragmento no cambia el texto leído.`)],
          [L('Múltipla anunciada', 'Announced multiple', 'Múltiple anunciado'), L(`A lista tem ${ic('aria-multiselectable="true"')}; o gatilho lê “3 selecionados: …” e cada chip tem um botão “Remover X”.`, `The list has ${ic('aria-multiselectable="true"')}; the trigger reads “3 selected: …” and each chip has a “Remove X” button.`, `La lista tiene ${ic('aria-multiselectable="true"')}; el disparador lee “3 seleccionados: …” y cada chip tiene un botón “Quitar X”.`)],
          [L('Um só valor, no lugar certo', 'One value, in the right place', 'Un solo valor, en el lugar correcto'), L(`O select real fica escondido da leitura e do foco, mas guarda o valor e dispara ${ic('change')} — seu código não muda.`, `The real select is hidden from reading and focus, but it keeps the value and fires ${ic('change')} — your code doesn’t change.`, `El select real queda oculto a la lectura y al foco, pero guarda el valor y dispara ${ic('change')} — tu código no cambia.`)],
          [L('Validação nativa', 'Native validation', 'Validación nativa'), L(`${ic('required')} funciona nos três tipos: sem escolha, o gatilho recebe o foco e fica inválido.`, `${ic('required')} works in all three types: with no choice, the trigger gets focus and becomes invalid.`, `${ic('required')} funciona en los tres tipos: sin elección, el disparador recibe el foco y queda inválido.`)],
          [L('Limite explicado', 'An explained limit', 'Límite explicado'), L(`Com ${ic('data-max')}, as opções restantes ficam desativadas e a lista mostra por quê.`, `With ${ic('data-max')}, the remaining options are disabled and the list shows why.`, `Con ${ic('data-max')}, las opciones restantes quedan desactivadas y la lista muestra por qué.`)],
        ])}
      </div>
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', L('Tokens usados', 'Tokens used', 'Tokens usados'), L('O gatilho usa os tokens do campo de texto; a lista, os mesmos do menu; os chips, os do chip pequeno.', 'The trigger uses the text field’s tokens; the list, the menu’s; the chips, the small chip’s.', 'El disparador usa los tokens del campo de texto; la lista, los del menú; los chips, los del chip pequeño.'))}
      ${tokenTable([
        ['size.control.md', L('Altura (médio)', 'Height (medium)', 'Altura (mediano)')],
        ['radius.md', L('Raio do gatilho', 'Trigger radius', 'Radio del disparador')],
        ['text.body-sm', L('Valor escolhido', 'Chosen value', 'Valor elegido')],
        ['color.border.control', L('Contorno do gatilho', 'Trigger outline', 'Contorno del disparador')],
        ['color.border.strong', L('Hover e borda da lista', 'Hover and list border', 'Hover y borde de la lista')],
        ['color.border.focus', L('Foco e lista aberta', 'Focus and open list', 'Foco y lista abierta')],
        ['color.fg.subtle', L('Seta, ícone, placeholder, grupo e caixa vazia', 'Chevron, icon, placeholder, group, and empty box', 'Flecha, ícono, placeholder, grupo y casilla vacía')],
        ['color.bg.raised', L('Fundo da lista', 'List background', 'Fondo de la lista')],
        ['radius.lg', L('Raio da lista', 'List radius', 'Radio de la lista')],
        ['shadow.xl', L('Sombra da lista', 'List shadow', 'Sombra de la lista')],
        ['color.bg.hover', L('Opção ativa e aviso de limite', 'Active option and limit notice', 'Opción activa y aviso de límite')],
        ['color.fg.brand', L('Marca da escolhida e trecho encontrado', 'Chosen mark and found match', 'Marca de la elegida y fragmento encontrado')],
        ['color.brand.solid', L('Caixa marcada (múltipla)', 'Checked box (multiple)', 'Casilla marcada (múltiple)')],
        ['color.bg.selected', L('Chips escolhidos', 'Chosen chips', 'Chips elegidos')],
        ['color.danger.solid', L('Contorno inválido', 'Invalid outline', 'Contorno inválido')],
        ['duration.base', L('Seta e entrada da lista', 'Chevron and list entrance', 'Flecha y entrada de la lista')],
        ['easing.emphasized', L('Curva da entrada', 'Entrance curve', 'Curva de la entrada')],
        ['opacity.disabled', L('Desativado e acima do limite', 'Disabled and over the limit', 'Desactivado y por encima del límite')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', L('Uso', 'Usage', 'Uso'), L('Escolha o tipo pelo tamanho da lista e pelo número de escolhas.', 'Pick the type by the size of the list and the number of choices.', 'Elige el tipo según el tamaño de la lista y la cantidad de elecciones.'))}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: lista longa com busca', 'Do: a long list with search', 'Haz: lista larga con búsqueda')}</p>
          <p class="usage-card__text">${L('Acima de ~15 opções, ligue a busca. Agrupe quando houver uma divisão natural (continente, área).', 'Above ~15 options, turn on search. Group when there’s a natural division (continent, area).', 'Por encima de ~15 opciones, activa la búsqueda. Agrupa cuando haya una división natural (continente, área).')}</p>
          <div class="sl-usage" inert>${select({ id: 'sl-do', label: L('País', 'Country', 'País'), search: true, groups: countries.slice(0, 2), selected: [brazil()] })}</div>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: múltipla com poucas opções', 'Avoid: multiple with few options', 'Evita: múltiple con pocas opciones')}</p>
          <p class="usage-card__text">${L('Com até 5 opções, checkboxes mostram tudo de uma vez e pedem um clique a menos.', 'With up to 5 options, checkboxes show everything at once and take one click less.', 'Con hasta 5 opciones, los checkboxes muestran todo de una vez y piden un clic menos.')}</p>
          <div class="sl-usage" inert>${select({ id: 'sl-dont', label: L('Avisar por', 'Notify by', 'Avisar por'), multiple: true, options: [L('E-mail', 'Email', 'Correo'), 'SMS', 'Push'], selected: [L('E-mail', 'Email', 'Correo')] })}</div>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Limite? Diga qual', 'A limit? Say what it is', '¿Límite? Di cuál')}</p>
          <p class="usage-card__text">${L('Coloque o limite na dica (“até 5”) — a lista também avisa quando ele chega.', 'Put the limit in the hint (“up to 5”) — the list also warns when it’s reached.', 'Pon el límite en la pista (“hasta 5”) — la lista también avisa cuando se alcanza.')}</p>
          <div class="sl-usage" inert>${select({ id: 'sl-tip', label: L('Etiquetas', 'Tags', 'Etiquetas'), multiple: true, max: 2, options: ['Design', L('Produto', 'Product', 'Producto'), L('Engenharia', 'Engineering', 'Ingeniería')], selected: ['Design', L('Produto', 'Product', 'Producto')], hint: L('Até 2.', 'Up to 2.', 'Hasta 2.') })}</div>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const no = L('Não', 'No', 'No');
  const yes = L('Sim', 'Yes', 'Sí');
  const unmountPlayground = mountPlayground(root, {
    id: 'selecao',
    controls: [
      { id: 'search', label: L('Busca', 'Search', 'Búsqueda'), value: 'no', options: [{ value: 'no', label: no }, { value: 'yes', label: yes }] },
      { id: 'multiple', label: L('Múltipla', 'Multiple', 'Múltiple'), value: 'no', options: [{ value: 'no', label: no }, { value: 'yes', label: yes }] },
      { id: 'display', label: L('Exibição', 'Display', 'Visualización'), value: 'chips', options: [{ value: 'chips', label: 'Chips' }, { value: 'count', label: L('Contagem', 'Count', 'Conteo') }] },
      { id: 'max', label: L('Limite', 'Limit', 'Límite'), value: 'none', options: [{ value: 'none', label: L('Sem limite', 'No limit', 'Sin límite') }, { value: '3', label: L('Até 3', 'Up to 3', 'Hasta 3') }, { value: '5', label: L('Até 5', 'Up to 5', 'Hasta 5') }] },
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'md', options: SIZES().map(([value, label]) => ({ value, label })) },
      { id: 'icon', label: L('Ícone', 'Icon', 'Ícono'), value: 'globe', options: ICONS().map(([value, label]) => ({ value, label })) },
      { id: 'state', label: L('Estado', 'State', 'Estado'), value: 'default', options: STATES().map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'label', label: L('Rótulo', 'Label', 'Etiqueta'), value: L('Idioma', 'Language', 'Idioma') },
    render: (s) => {
      const multiple = s.multiple === 'yes';
      return `<div class="sl-stage">${select({
        id: 'sl-playground',
        label: s.label,
        size: s.size,
        icon: s.icon,
        state: s.state,
        multiple,
        search: s.search === 'yes',
        searchPlaceholder: L('Buscar idioma', 'Search language', 'Buscar idioma'),
        display: s.display,
        max: s.max === 'none' ? 0 : Number(s.max),
        footer: multiple,
        selected: multiple ? LANGUAGES.slice(0, 2) : undefined,
        placeholder: multiple ? L('Escolha idiomas', 'Choose languages', 'Elige idiomas') : undefined,
      })}</div>`;
    },
    code: selectCode,
  });

  // liga todas as seleções da página; o playground recria a dele a cada mudança
  const unmountSelects = mountSelects(root);
  const preview = root.querySelector('[data-playground="selecao"] [data-preview]');
  let unmountPreview = () => {};
  const observer = new MutationObserver(() => {
    unmountPreview();
    unmountPreview = mountSelects(preview);
  });
  observer.observe(preview, { childList: true });

  // chip com menu: muda o número na hora
  const chip = root.querySelector('[data-period]');
  const value = root.querySelector('[data-period-value]');
  const periods = PERIODS();
  const VISITS = { 7: 2904, 30: 12480, 90: 35112, year: 118640 };
  const menu = attachMenu(chip, {
    label: L('Período', 'Period', 'Período'),
    value: '30',
    options: periods,
    onChange: (v) => {
      chip.querySelector('[data-label]').textContent = periods.find((p) => p.value === v).label;
      value.textContent = formatNumber(VISITS[v]);
    },
  });

  // formulários: mostram o valor que seria enviado (vem do select real)
  const sent = L('Enviado', 'Sent', 'Enviado');
  const form = root.querySelector('[data-native-form]');
  const result = form.querySelector('[data-form-result]');
  const onSubmit = (event) => {
    event.preventDefault();
    result.textContent = `${sent}: ${L('fuso', 'time zone', 'zona')} = ${new FormData(form).get('fuso')}`;
  };
  form.addEventListener('submit', onSubmit);

  const tagsForm = root.querySelector('[data-tags-form]');
  const tagsResult = tagsForm.querySelector('[data-tags-result]');
  const onTagsSubmit = (event) => {
    event.preventDefault();
    const tags = new FormData(tagsForm).getAll('etiquetas');
    tagsResult.textContent = tags.length ? `${sent}: ${tags.join(', ')}` : `${sent}: ${L('nenhuma etiqueta', 'no tags', 'ninguna etiqueta')}`;
  };
  tagsForm.addEventListener('submit', onTagsSubmit);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    observer.disconnect();
    unmountPreview();
    unmountSelects();
    unmountPlayground();
    menu.destroy();
    form.removeEventListener('submit', onSubmit);
    tagsForm.removeEventListener('submit', onTagsSubmit);
    unmountCopy();
    unmountNav();
  };
}
