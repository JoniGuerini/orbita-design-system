import { icon } from '../../ds/icons/icons.js';
import { attachMenu } from '../../ds/js/menu.js';
import { mountSelects } from '../../ds/js/select.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/selecao.css'];

/* ───────── Dados ───────── */

const SIZES = [
  ['sm', 'Pequeno', 32],
  ['md', 'Médio', 40],
  ['lg', 'Grande', 48],
];

const STATES = [
  ['default', 'Padrão', 'Contorno discreto e seta à direita.'],
  ['hover', 'Hover', 'O contorno fica mais forte.'],
  ['focus', 'Foco ou aberto', 'Contorno na cor de foco, halo suave e a seta gira.'],
  ['placeholder', 'Sem escolha', 'O texto vazio aparece apagado, como um placeholder.'],
  ['disabled', 'Desativado', 'Opacidade reduzida e fora da ordem de foco.'],
  ['invalid', 'Inválido', 'Contorno e mensagem de perigo.'],
];

const ICONS = [
  ['none', 'Sem ícone'],
  ['globe', 'Globo'],
  ['calendar', 'Calendário'],
  ['users', 'Pessoas'],
  ['tag', 'Etiqueta'],
];

const LANGUAGES = ['Português (Brasil)', 'English (US)', 'Español', 'Français', 'Deutsch', 'Italiano', 'Nederlands', 'Polski', '日本語', '한국어'];

const TIMEZONES = [
  ['Brasil', [['Brasília (UTC−3)', true], ['Manaus (UTC−4)'], ['Fernando de Noronha (UTC−2)'], ['Rio Branco (UTC−5)', false, true]]],
  ['Europa', [['Lisboa (UTC+0)'], ['Madri (UTC+1)'], ['Berlim (UTC+1)']]],
  ['América do Norte', [['Nova York (UTC−5)'], ['Cidade do México (UTC−6)']]],
];

const COUNTRIES = [
  ['América do Sul', ['Argentina', 'Bolívia', 'Brasil', 'Chile', 'Colômbia', 'Equador', 'Paraguai', 'Peru', 'Uruguai', 'Venezuela']],
  ['América do Norte', ['Canadá', 'Costa Rica', 'Estados Unidos', 'México', 'Panamá']],
  ['Europa', ['Alemanha', 'Áustria', 'Bélgica', 'Espanha', 'França', 'Irlanda', 'Itália', 'Noruega', 'Países Baixos', 'Portugal', 'Reino Unido', 'Suécia', 'Suíça']],
  ['Ásia e Oceania', ['Austrália', 'Coreia do Sul', 'Índia', 'Japão', 'Nova Zelândia', 'Singapura']],
  ['África', ['África do Sul', 'Angola', 'Cabo Verde', 'Egito', 'Marrocos', 'Moçambique', 'Nigéria']],
];

const PEOPLE = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Ramos', 'Elisa Prado', 'Fábio Nunes', 'Gabriela Rocha', 'Heitor Melo', 'Isabela Torres', 'João Pedro Alves', 'Lívia Castro', 'Marcos Vieira'];

const TAGS = [
  ['Produto', ['Pesquisa', 'Roadmap', 'Lançamento', 'Métrica', 'Experimento']],
  ['Design', ['Componente', 'Token', 'Acessibilidade', 'Ícone', 'Protótipo']],
  ['Engenharia', ['Front-end', 'API', 'Performance', 'Bug', 'Dívida técnica', 'Teste']],
];

const CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Viagem', 'Pets', 'Presentes'];

const WHICH = [
  ['Quando', 'Uma escolha num formulário, poucas opções.', 'Uma escolha numa lista longa: país, cidade, pessoa.', 'Várias escolhas: etiquetas, responsáveis, categorias.', 'Filtro rápido que muda a tela na hora.'],
  ['Opções', '5 a ~15', '15 a centenas', 'De poucas a centenas (com busca)', 'Até ~7'],
  ['Efeito', 'Vale ao enviar', 'Vale ao enviar', 'Vale ao enviar', 'Imediato'],
  ['Valor', '<code class="ds-inline-code">&lt;select&gt;</code> real', '<code class="ds-inline-code">&lt;select&gt;</code> real', '<code class="ds-inline-code">&lt;select multiple&gt;</code> real', 'Estado da tela'],
  ['Atributos', '<code class="ds-inline-code">data-ds-select</code>', '+ <code class="ds-inline-code">data-search</code>', '+ <code class="ds-inline-code">multiple</code>', 'ds-chip + attachMenu'],
];

/* ───────── Seleção (playground, exemplos e código) ───────── */

const isSelected = (o, label, i) => (o.selected ? o.selected.includes(label) : !o.multiple && i === 0);

function optionsHtml(o) {
  if (o.groups) {
    let n = 0;
    return o.groups
      .map(([group, items]) => {
        const rows = items.map((item) => {
          const [label, selected, disabled] = Array.isArray(item) ? item : [item];
          const on = o.selected ? o.selected.includes(label) : Boolean(selected) || (!o.multiple && !o.placeholderOption && n === 0 && o.groups[0][1][0] === item);
          n += 1;
          return `<option${on ? ' selected' : ''}${disabled ? ' disabled' : ''}>${escapeHtml(label)}${disabled ? ' — em breve' : ''}</option>`;
        });
        return `<optgroup label="${escapeHtml(group)}">${rows.join('')}</optgroup>`;
      })
      .join('');
  }
  const empty = !o.multiple && (o.state === 'placeholder' || o.state === 'invalid' || o.placeholderOption);
  const list = o.options ?? LANGUAGES;
  return [
    empty ? `<option value="" selected>${escapeHtml(o.placeholder ?? 'Escolha um idioma')}</option>` : '',
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
    <label class="ds-form-field__label" for="${id}">${escapeHtml(o.label || 'Idioma')}</label>
    <select ${attrs.join(' ')}>${optionsHtml(o)}</select>
    ${invalid ? `<div class="ds-form-field__footer"><p class="ds-form-field__error" id="${id}-error">${icon('alert-circle', { size: 16 })}<span>${escapeHtml(o.error ?? 'Escolha pelo menos uma opção para continuar.')}</span></p></div>` : ''}
    ${!invalid && o.hint ? `<div class="ds-form-field__footer"><p class="ds-form-field__hint" id="${id}-hint">${escapeHtml(o.hint)}</p></div>` : ''}
  </div>`;
}

function selectCode(s) {
  const multiple = s.multiple === 'yes';
  const search = s.search === 'yes';
  const id = multiple ? 'idiomas' : 'idioma';
  const invalid = s.state === 'invalid';
  const empty = !multiple && (s.state === 'placeholder' || invalid);
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    'data-ds-select',
    multiple && 'multiple',
    s.size !== 'md' && `data-size="${s.size}"`,
    s.icon !== 'none' && `data-icon="${s.icon}"`,
    search && 'data-search data-search-placeholder="Buscar idioma"',
    multiple && s.display === 'count' && 'data-display="count"',
    multiple && s.max !== 'none' && `data-max="${s.max}"`,
    multiple && 'data-footer',
    s.state === 'disabled' && 'disabled',
    invalid && `aria-invalid="true" aria-describedby="${id}-erro"`,
  ].filter(Boolean);
  const lines = [`<div class="ds-form-field">`, `  <label class="ds-form-field__label" for="${id}">${s.label || 'Idioma'}</label>`, `  <select ${attrs.join(' ')}>`];
  if (empty) lines.push(`    <option value="">Escolha um idioma</option>`);
  const pre = multiple && !['placeholder', 'invalid'].includes(s.state);
  lines.push(`    <option${pre || (!multiple && !empty) ? ' selected' : ''}>Português (Brasil)</option>`, `    <option${pre ? ' selected' : ''}>English (US)</option>`, `    <option>Español</option>`, `  </select>`);
  if (invalid) lines.push(`  <p class="ds-form-field__error" id="${id}-erro">${multiple ? 'Escolha pelo menos uma opção para continuar.' : 'Escolha um idioma para continuar.'}</p>`);
  lines.push(`</div>`, ``, `<script type="module">`, `  import { mountSelects } from './ds/js/select.js';`, `  mountSelects(document);`, `</script>`);
  return lines.join('\n');
}

/* ───────── Página ───────── */

const NAV = [
  ['playground', 'Playground'],
  ['qual', 'Qual usar'],
  ['com-busca', 'Com busca'],
  ['multipla', 'Múltipla escolha'],
  ['tamanhos', 'Tamanhos'],
  ['estados', 'Estados'],
  ['grupos', 'Grupos e desativados'],
  ['teclado', 'Teclado e acessibilidade'],
  ['tokens', 'Tokens'],
  ['uso', 'Uso'],
];

const sectionHead = (id, title, desc) => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>
</header>`;

const PERIODS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: 'year', label: 'Este ano' },
];

const keysTable = (rows) => `<div class="doc-table sl-keys">
  <div class="doc-table__head" aria-hidden="true"><span>Tecla</span><span>Fechado</span><span>Aberto</span></div>
  ${rows
    .map(([keys, closed, open]) => `<div class="doc-table__row"><span class="sl-keys__keys">${keys.map((k) => `<kbd class="ds-kbd">${k}</kbd>`).join('')}</span><span class="sl-table__cell" data-when="Fechado">${closed}</span><span class="sl-table__cell" data-when="Aberto">${open}</span></div>`)
    .join('')}
</div>`;

const countryCount = COUNTRIES.reduce((n, [, list]) => n + list.length, 0);
const tagCount = TAGS.reduce((n, [, list]) => n + list.length, 0);

export default function renderSelecao(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Seleção</h1>
        <p class="doc-header__lead">Para escolher uma ou várias opções numa lista. A lista é do Órbita — mesmo visual dos menus, com busca quando cresce —, mas o valor mora num <code class="ds-inline-code">&lt;select&gt;</code> real, que vai junto no formulário.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tipos</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">${SIZES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">padrão ARIA</dt><dd class="doc-stat__value">combobox</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">sem JS</dt><dd class="doc-stat__value">nativo</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', 'Combine busca, múltipla escolha, exibição e limite. A lista do palco funciona de verdade — teclado incluído.')}
      ${playgroundMarkup('selecao')}
    </section>

    <section class="doc-section" id="qual" aria-labelledby="qual-title">
      ${sectionHead('qual', 'Qual usar', 'Três tipos de seleção para formulários e o chip com menu para filtros. As listas têm o mesmo visual; muda o que acontece ao escolher.')}
      <div class="sl-compare">
        <article class="sl-compare__card">
          <div class="sl-compare__stage">
            <form class="sl-compare__form" data-native-form>
              ${select({ id: 'sl-form-tz', name: 'fuso', label: 'Fuso horário', icon: 'globe', groups: TIMEZONES, hint: 'Usado nos lembretes e relatórios.' })}
              <div class="sl-compare__actions">
                <button type="submit" class="ds-btn ds-btn--primary ds-btn--sm">Salvar</button>
                <span class="sl-compare__result" data-form-result aria-live="polite"></span>
              </div>
            </form>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Seleção<code>select[data-ds-select]</code></p><p class="cd-example__text">No formulário. O valor vai junto ao salvar.</p></div>
        </article>
        <article class="sl-compare__card">
          <div class="sl-compare__stage sl-compare__stage--toolbar">
            <div class="sl-toolbar">
              <p class="sl-toolbar__title">Visitas</p>
              <button type="button" class="ds-chip" data-period><span class="ds-chip__icon">${icon('calendar', { size: 16 })}</span><span data-label>Últimos 30 dias</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
            </div>
            <p class="sl-toolbar__value"><span data-period-value>12.480</span><span class="sl-toolbar__unit">visitas</span></p>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Chip com menu<code>ds-chip + attachMenu</code></p><p class="cd-example__text">No filtro. Muda a tela na hora.</p></div>
        </article>
      </div>
      <div class="doc-table sl-which">
        <div class="doc-table__head" aria-hidden="true"><span></span><span>Única</span><span>Com busca</span><span>Múltipla</span><span>Chip de filtro</span></div>
        ${WHICH.map(([key, ...cells]) => `<div class="doc-table__row"><span class="sl-table__key">${key}</span>${cells.map((c, i) => `<span class="sl-table__cell" data-when="${['Única', 'Com busca', 'Múltipla', 'Chip de filtro'][i]}">${c}</span>`).join('')}</div>`).join('')}
      </div>
    </section>

    <section class="doc-section" id="com-busca" aria-labelledby="com-busca-title">
      ${sectionHead('com-busca', 'Com busca', 'Com <code class="ds-inline-code">data-search</code>, a lista ganha um campo no topo e o foco vai direto para ele. Filtra sem acento e sem diferenciar maiúsculas — inclusive pelo nome do grupo.')}
      <div class="sl-feature">
        <div class="sl-feature__demo">
          ${select({ id: 'sl-search-country', name: 'pais', label: 'País', icon: 'globe', search: true, searchPlaceholder: 'Buscar país ou continente', groups: COUNTRIES, placeholderOption: true, selected: ['Brasil'], hint: `${countryCount} países em 5 continentes. Experimente “euro” ou “mexico”, sem acento.` })}
          ${select({ id: 'sl-search-person', name: 'responsavel', label: 'Responsável', icon: 'users', search: true, searchPlaceholder: 'Buscar pessoa', options: PEOPLE, hint: 'Digite com a lista fechada: a busca já começa com a letra.' })}
        </div>
        <ul class="sl-feature__list" role="list">
          <li>${icon('search', { size: 16 })}<span><strong>Filtra ao digitar</strong> e destaca o trecho encontrado, sem mudar o texto lido pelo leitor de tela.</span></li>
          <li>${icon('arrow-up', { size: 16 })}<span><strong>↑ ↓ andam só pelas visíveis</strong>; Enter escolhe e fecha.</span></li>
          <li>${icon('x', { size: 16 })}<span><strong>Esc limpa a busca</strong>; com a busca vazia, fecha.</span></li>
          <li>${icon('inbox', { size: 16 })}<span><strong>Nada encontrado?</strong> A lista avisa “Nada encontrado para …” no lugar das opções.</span></li>
        </ul>
      </div>
      <div class="sl-code">${codeBlock(`<select id="pais" name="pais" data-ds-select data-search
        data-search-placeholder="Buscar país ou continente">
  <optgroup label="América do Sul">
    <option>Argentina</option>
    <option selected>Brasil</option>
  </optgroup>
  …
</select>`)}</div>
    </section>

    <section class="doc-section" id="multipla" aria-labelledby="multipla-title">
      ${sectionHead('multipla', 'Múltipla escolha', 'Com <code class="ds-inline-code">multiple</code>, cada opção ganha uma caixa de marcação e a lista não fecha ao escolher. Os escolhidos viram chips no campo — até duas linhas, depois “+N”.')}
      <form class="sl-multi" data-tags-form>
        <article class="sl-multi__card sl-multi__card--main">
          <p class="sl-multi__eyebrow">Caso principal: etiquetas</p>
          ${select({ id: 'sl-tags', name: 'etiquetas', label: 'Etiquetas', icon: 'tag', multiple: true, search: true, searchPlaceholder: 'Buscar etiqueta', footer: true, max: 5, groups: TAGS, selected: ['Componente', 'Token', 'Acessibilidade'], placeholder: 'Adicione etiquetas', hint: `Até 5 de ${tagCount}. Backspace na busca vazia remove a última.` })}
          <div class="sl-multi__actions">
            <button type="submit" class="ds-btn ds-btn--primary ds-btn--sm">Salvar</button>
            <span class="sl-compare__result" data-tags-result aria-live="polite"></span>
          </div>
          <p class="sl-multi__attrs"><code class="ds-inline-code">multiple data-search data-max="5" data-footer</code></p>
        </article>
        <article class="sl-multi__card">
          <p class="sl-multi__eyebrow">Sem busca, com chips</p>
          ${select({ id: 'sl-people', name: 'pessoas', label: 'Revisores', icon: 'users', multiple: true, options: PEOPLE.slice(0, 7), selected: ['Ana Souza', 'Carla Dias'], placeholder: 'Escolha quem revisa' })}
          <p class="sl-multi__attrs"><code class="ds-inline-code">multiple</code></p>
        </article>
        <article class="sl-multi__card">
          <p class="sl-multi__eyebrow">Contagem no lugar dos chips</p>
          ${select({ id: 'sl-categories', name: 'categorias', label: 'Categorias', multiple: true, display: 'count', footer: true, options: CATEGORIES, selected: ['Alimentação', 'Transporte', 'Moradia'], placeholder: 'Todas as categorias' })}
          <p class="sl-multi__attrs"><code class="ds-inline-code">multiple data-display="count" data-footer</code></p>
        </article>
      </form>
      <ul class="sl-feature__list sl-feature__list--inline" role="list">
        <li>${icon('check-square', { size: 16 })}<span><strong>Clique, Espaço ou Enter alternam</strong> sem fechar. Na busca, Espaço digita — use Enter.</span></li>
        <li>${icon('x', { size: 16 })}<span><strong>Remover um</strong>: o × do chip, desmarcar na lista ou Backspace. <strong>Todos</strong>: o × do campo ou “Limpar”.</span></li>
        <li>${icon('list', { size: 16 })}<span><strong>Selecionar todos</strong> respeita a busca atual e o limite.</span></li>
        <li>${icon('info', { size: 16 })}<span><strong>Com limite</strong>, o resto fica desativado e a lista explica por quê.</span></li>
      </ul>
      <div class="sl-code">${codeBlock(`<select id="etiquetas" name="etiquetas" multiple data-ds-select
        data-search data-max="5" data-footer
        data-placeholder="Adicione etiquetas">
  <optgroup label="Design">
    <option selected>Componente</option>
    <option selected>Token</option>
  </optgroup>
  …
</select>

<!-- os escolhidos chegam como uma lista -->
<script>
  new FormData(form).getAll('etiquetas'); // ['Componente', 'Token']
</script>`)}</div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      ${sectionHead('tamanhos', 'Tamanhos', 'Os mesmos três do campo de texto — alinham lado a lado num formulário. Use <code class="ds-inline-code">data-size</code> no select; na múltipla, os chips acompanham.')}
      <div class="sl-sizes">
        ${SIZES.map(
          ([id, name, h]) => `<article class="cd-example">
            <div class="cd-example__preview sl-preview sl-preview--stack" inert>
              ${select({ id: `sl-size-${id}`, label: name, size: id, icon: 'globe' })}
              ${select({ id: `sl-size-multi-${id}`, label: `${name} · múltipla`, size: id, multiple: true, options: LANGUAGES.slice(0, 4), selected: LANGUAGES.slice(0, 2) })}
            </div>
            <div class="cd-example__body"><p class="cd-example__name">${name}<code>${id === 'md' ? 'padrão' : `data-size="${id}"`}</code></p><p class="cd-example__text">${h} px de altura mínima.</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', 'Estados', 'Iguais aos do campo de texto, na única e na múltipla. Para documentar e testar, force hover ou foco com <code class="ds-inline-code">data-ds-state</code> no select.')}
      <div class="cd-grid sl-states">
        ${STATES.map(
          ([id, name, text]) => `<article class="cd-example">
            <div class="cd-example__preview sl-preview sl-preview--stack" inert>
              ${select({ id: `sl-state-${id}`, label: 'Idioma', state: id })}
              ${select({ id: `sl-state-multi-${id}`, label: 'Idiomas', state: id, multiple: true, options: LANGUAGES.slice(0, 4), selected: ['Português (Brasil)', 'Español'], placeholder: 'Escolha idiomas' })}
            </div>
            <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="grupos" aria-labelledby="grupos-title">
      ${sectionHead('grupos', 'Grupos e desativados', '<code class="ds-inline-code">&lt;optgroup&gt;</code> vira um rótulo de grupo na lista; <code class="ds-inline-code">&lt;option disabled&gt;</code> aparece, mas o teclado e o clique pulam a opção.')}
      <div class="sl-groups">
        <div class="sl-groups__demo">
          ${select({ id: 'sl-groups-tz', label: 'Fuso horário', icon: 'globe', groups: TIMEZONES, hint: 'Rio Branco ainda não está disponível.' })}
          ${select({ id: 'sl-groups-off', label: 'Plano', disabled: true, options: ['Equipe (fixo pelo administrador)'], hint: 'Só quem administra a conta pode trocar.' })}
        </div>
        <div class="sl-groups__code">${codeBlock(`<select id="fuso" data-ds-select data-icon="globe">
  <optgroup label="Brasil">
    <option selected>Brasília (UTC−3)</option>
    <option disabled>Rio Branco (UTC−5) — em breve</option>
  </optgroup>
  <optgroup label="Europa">
    <option>Lisboa (UTC+0)</option>
  </optgroup>
</select>`)}</div>
      </div>
      <p class="sl-fallback">${icon('info', { size: 16 })}<span>Sem JavaScript, o mesmo <code class="ds-inline-code">&lt;select&gt;</code> aparece como lista nativa do sistema, já com o visual básico do campo. Nada se perde.</span></p>
    </section>

    <section class="doc-section" id="teclado" aria-labelledby="teclado-title">
      ${sectionHead('teclado', 'Teclado e acessibilidade', 'Segue o padrão de combobox do WAI-ARIA. A opção ativa é anunciada por <code class="ds-inline-code">aria-activedescendant</code>, no gatilho ou no campo de busca.')}
      <h3 class="doc-subhead">Todos os tipos</h3>
      ${keysTable([
        [['Enter', 'Espaço'], 'Abre a lista', 'Única: escolhe e fecha · Múltipla: marca ou desmarca'],
        [['↓', '↑'], 'Abre na opção escolhida', 'Move entre as opções visíveis (pula as desativadas)'],
        [['Home', 'End'], 'Abre na primeira ou na última', 'Vai para a primeira ou a última (sem busca)'],
        [['Page ↓', 'Page ↑'], '—', 'Pula 10 opções'],
        [['Esc'], '—', 'Fecha sem mudar nada'],
        [['Tab'], 'Segue para o próximo campo', 'Única sem busca: escolhe a ativa e segue · Demais: fecha e segue'],
      ])}
      <h3 class="doc-subhead">Sem busca</h3>
      ${keysTable([[['A–Z'], 'Abre na primeira que começa com a letra', 'Pula para a próxima com a letra']])}
      <h3 class="doc-subhead">Com busca</h3>
      ${keysTable([
        [['A–Z'], 'Abre a lista e começa a busca com a letra', 'Filtra a lista'],
        [['Espaço'], 'Abre a lista', 'Digita um espaço na busca'],
        [['Esc'], '—', 'Limpa a busca; vazia, fecha'],
      ])}
      <h3 class="doc-subhead">Múltipla</h3>
      ${keysTable([
        [['Backspace'], 'Remove o último escolhido', 'Na busca vazia, remove o último escolhido'],
        [['Ctrl', 'A'], '—', 'Marca todas as visíveis (sem busca), respeitando o limite'],
      ])}
      <div class="sl-a11y">
        ${a11yList([
          ['Papéis certos', 'Gatilho com <code class="ds-inline-code">role="combobox"</code>, <code class="ds-inline-code">aria-haspopup="listbox"</code> e <code class="ds-inline-code">aria-expanded</code>; lista <code class="ds-inline-code">role="listbox"</code>; opções com <code class="ds-inline-code">aria-selected</code>.'],
          ['Busca é o combobox', 'Com busca, o campo do topo tem <code class="ds-inline-code">role="combobox"</code> e <code class="ds-inline-code">aria-autocomplete="list"</code>; o destaque do trecho não muda o texto lido.'],
          ['Múltipla anunciada', 'A lista tem <code class="ds-inline-code">aria-multiselectable="true"</code>; o gatilho lê “3 selecionados: …” e cada chip tem um botão “Remover X”.'],
          ['Um só valor, no lugar certo', 'O select real fica escondido da leitura e do foco, mas guarda o valor e dispara <code class="ds-inline-code">change</code> — seu código não muda.'],
          ['Validação nativa', '<code class="ds-inline-code">required</code> funciona nos três tipos: sem escolha, o gatilho recebe o foco e fica inválido.'],
          ['Limite explicado', 'Com <code class="ds-inline-code">data-max</code>, as opções restantes ficam desativadas e a lista mostra por quê.'],
        ])}
      </div>
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', 'Tokens usados', 'O gatilho usa os tokens do campo de texto; a lista, os mesmos do menu; os chips, os do chip pequeno.')}
      ${tokenTable([
        ['size.control.md', 'Altura (médio)'],
        ['radius.md', 'Raio do gatilho'],
        ['text.body-sm', 'Valor escolhido'],
        ['color.border.control', 'Contorno do gatilho'],
        ['color.border.strong', 'Hover e borda da lista'],
        ['color.border.focus', 'Foco e lista aberta'],
        ['color.fg.subtle', 'Seta, ícone, placeholder, grupo e caixa vazia'],
        ['color.bg.raised', 'Fundo da lista'],
        ['radius.lg', 'Raio da lista'],
        ['shadow.xl', 'Sombra da lista'],
        ['color.bg.hover', 'Opção ativa e aviso de limite'],
        ['color.fg.brand', 'Marca da escolhida e trecho encontrado'],
        ['color.brand.solid', 'Caixa marcada (múltipla)'],
        ['color.bg.selected', 'Chips escolhidos'],
        ['color.danger.solid', 'Contorno inválido'],
        ['duration.base', 'Seta e entrada da lista'],
        ['easing.emphasized', 'Curva da entrada'],
        ['opacity.disabled', 'Desativado e acima do limite'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', 'Uso', 'Escolha o tipo pelo tamanho da lista e pelo número de escolhas.')}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: lista longa com busca</p>
          <p class="usage-card__text">Acima de ~15 opções, ligue a busca. Agrupe quando houver uma divisão natural (continente, área).</p>
          <div class="sl-usage" inert>${select({ id: 'sl-do', label: 'País', search: true, groups: COUNTRIES.slice(0, 2), selected: ['Brasil'] })}</div>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: múltipla com poucas opções</p>
          <p class="usage-card__text">Com até 5 opções, checkboxes mostram tudo de uma vez e pedem um clique a menos.</p>
          <div class="sl-usage" inert>${select({ id: 'sl-dont', label: 'Avisar por', multiple: true, options: ['E-mail', 'SMS', 'Push'], selected: ['E-mail'] })}</div>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Limite? Diga qual</p>
          <p class="usage-card__text">Coloque o limite na dica (“até 5”) — a lista também avisa quando ele chega.</p>
          <div class="sl-usage" inert>${select({ id: 'sl-tip', label: 'Etiquetas', multiple: true, max: 2, options: ['Design', 'Produto', 'Engenharia'], selected: ['Design', 'Produto'], hint: 'Até 2.' })}</div>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'selecao',
    controls: [
      { id: 'search', label: 'Busca', value: 'no', options: [{ value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim' }] },
      { id: 'multiple', label: 'Múltipla', value: 'no', options: [{ value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim' }] },
      { id: 'display', label: 'Exibição', value: 'chips', options: [{ value: 'chips', label: 'Chips' }, { value: 'count', label: 'Contagem' }] },
      { id: 'max', label: 'Limite', value: 'none', options: [{ value: 'none', label: 'Sem limite' }, { value: '3', label: 'Até 3' }, { value: '5', label: 'Até 5' }] },
      { id: 'size', label: 'Tamanho', value: 'md', options: SIZES.map(([value, label]) => ({ value, label })) },
      { id: 'icon', label: 'Ícone', value: 'globe', options: ICONS.map(([value, label]) => ({ value, label })) },
      { id: 'state', label: 'Estado', value: 'default', options: STATES.map(([value, label]) => ({ value, label })) },
    ],
    text: { id: 'label', label: 'Rótulo', value: 'Idioma' },
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
        searchPlaceholder: 'Buscar idioma',
        display: s.display,
        max: s.max === 'none' ? 0 : Number(s.max),
        footer: multiple,
        selected: multiple ? LANGUAGES.slice(0, 2) : undefined,
        placeholder: multiple ? 'Escolha idiomas' : undefined,
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
  const VISITS = { 7: '2.904', 30: '12.480', 90: '35.112', year: '118.640' };
  const menu = attachMenu(chip, {
    label: 'Período',
    value: '30',
    options: PERIODS,
    onChange: (v) => {
      chip.querySelector('[data-label]').textContent = PERIODS.find((p) => p.value === v).label;
      value.textContent = VISITS[v];
    },
  });

  // formulários: mostram o valor que seria enviado (vem do select real)
  const form = root.querySelector('[data-native-form]');
  const result = form.querySelector('[data-form-result]');
  const onSubmit = (event) => {
    event.preventDefault();
    result.textContent = `Enviado: fuso = ${new FormData(form).get('fuso')}`;
  };
  form.addEventListener('submit', onSubmit);

  const tagsForm = root.querySelector('[data-tags-form]');
  const tagsResult = tagsForm.querySelector('[data-tags-result]');
  const onTagsSubmit = (event) => {
    event.preventDefault();
    const tags = new FormData(tagsForm).getAll('etiquetas');
    tagsResult.textContent = tags.length ? `Enviado: ${tags.join(', ')}` : 'Enviado: nenhuma etiqueta';
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
