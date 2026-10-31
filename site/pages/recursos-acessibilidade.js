import { icon } from '../../ds/icons/icons.js';
import { tokens, contrast } from '../../ds/tokens.js';
import { mountSelects, enhanceSelect } from '../../ds/js/select.js';
import { barChart, meter } from '../../ds/js/charts.js';
import { typingHtml } from '../../ds/js/composer.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, tokenTable, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-acessibilidade.css'];

/* ───────── Contraste: a mesma conta do build (WCAG 2.x, alfa composto sobre o fundo) ───────── */

const MODES = [
  ['dark', 'Escuro'],
  ['light', 'Claro'],
];
const byName = new Map(tokens.map((t) => [t.name, t]));
const short = (name) => name.replace(/^color\./, '');
const num = (n, d = 2) => n.toFixed(d).replace('.', ',');

function parse(hex) {
  let h = hex.replace('#', '');
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
}
const decode = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => decode(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratioOf = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const composite = (c, bg) => c.rgb.map((v, i) => Math.round(v * c.a + bg[i] * (1 - c.a)));
const toHex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const valueOf = (name, mode) => byName.get(name).modes[mode].value;

/** Cor opaca de um fundo: transparências são compostas sobre o canvas do tema, como no build. */
function solid(name, mode, over = 'color.bg.canvas') {
  const c = parse(valueOf(name, mode));
  if (c.a >= 1) return c.rgb;
  return composite(c, solid(over, mode));
}

function measure(fg, bg, mode) {
  const back = solid(bg, mode);
  const front = parse(valueOf(fg, mode));
  const rgb = front.a < 1 ? composite(front, back) : front.rgb;
  return { ratio: ratioOf(rgb, back), fg: toHex(rgb), bg: toHex(back) };
}

/** Para uma cor sólida qualquer (passo de paleta) contra um token de fundo. */

const passed = contrast.filter((c) => c.pass).length;

/** Pares do build agrupados (um por linha, os dois temas lado a lado). */
const buildPairs = (() => {
  const map = new Map();
  for (const c of contrast) {
    const key = `${c.fg}|${c.bg}|${c.min}`;
    if (!map.has(key)) map.set(key, { fg: c.fg, bg: c.bg, min: c.min });
    map.get(key)[c.mode] = c;
  }
  return [...map.values()];
})();

/* ───────── Opções do verificador ───────── */

const has = (name) => byName.has(name);
const names = (prefix, list) => list.map((n) => `color.${prefix}.${n}`).filter(has);

const FG_GROUPS = [
  ['Texto', names('fg', ['default', 'muted', 'subtle', 'disabled', 'brand', 'link', 'link-hover', 'inverse'])],
  ['Marca e status', [...names('brand', ['fg', 'solid', 'on-solid']), ...['success', 'warning', 'danger', 'info'].flatMap((s) => names(s, ['fg', 'solid', 'on-solid']))]],
  ['Bordas e foco', names('border', ['subtle', 'default', 'strong', 'control', 'focus'])],
  ['Gráficos', [...names('chart', ['muted', 'other', 'grid', 'axis']), ...names('chart.series', ['1', '2', '3', '4', '5', '6', '7', '8']), ...names('chart.status', ['good', 'warning', 'critical'])]],
];

const BG_GROUPS = [
  ['Fundos', names('bg', ['app', 'canvas', 'sidebar', 'surface', 'raised', 'sunken', 'muted', 'inverse', 'hover', 'selected'])],
  ['Marca e status', [...names('brand', ['solid', 'subtle']), ...['success', 'warning', 'danger', 'info'].flatMap((s) => names(s, ['solid', 'subtle']))]],
];

const options = (groups, selected) =>
  groups
    .map(([label, list]) => `<optgroup label="${label}">${list.map((n) => `<option value="${n}"${n === selected ? ' selected' : ''}>${short(n)}</option>`).join('')}</optgroup>`)
    .join('');

const RULES = [
  ['Texto normal', 'até 18 px, ou até 14 px em negrito', [['AA', 4.5], ['AAA', 7]]],
  ['Texto grande', 'a partir de 24 px, ou 18,66 px em negrito', [['AA', 3], ['AAA', 4.5]]],
  ['Componentes e gráficos', 'bordas que identificam o controle, ícones, marcas', [['AA', 3]]],
];

const verdict = (ok, level) =>
  `<span class="ds-badge ds-badge--sm ${ok ? 'ds-badge--success' : 'ds-badge--danger'} ra-verdict">${icon(ok ? 'check' : 'x', { size: 12 })}${level} ${ok ? 'passa' : 'não passa'}</span>`;

function resultCard(fg, bg, mode, label) {
  const m = measure(fg, bg, mode);
  return `<article class="ra-result" data-theme="${mode}">
    <div class="ra-result__preview" style="background:${m.bg};color:${m.fg}">
      <span class="ra-result__big">Aa</span>
      <span class="ra-result__text">Texto de exemplo em 14 px</span>
      <span class="ra-result__mark" style="background:${m.fg}" aria-hidden="true"></span>
    </div>
    <div class="ra-result__body">
      <p class="ra-result__mode">${label}</p>
      <p class="ra-result__ratio"><strong>${num(m.ratio)}</strong>:1</p>
      <p class="ra-result__hex">${m.fg.toUpperCase()} sobre ${m.bg.toUpperCase()}</p>
      <ul class="ra-result__rules" role="list">
        ${RULES.map(
          ([name, desc, levels]) => `<li class="ra-result__rule">
            <span class="ra-result__rule-name">${name}<span>${desc}</span></span>
            <span class="ra-result__rule-verdicts">${levels.map(([lvl, min]) => verdict(m.ratio >= min, `${lvl} ${num(min, 1)}`)).join('')}</span>
          </li>`,
        ).join('')}
      </ul>
    </div>
  </article>`;
}

/* ───────── Teclado ───────── */

const k = (...keys) => keys.map((key) => `<kbd class="ds-kbd">${key}</kbd>`).join('');

const KEYMAP = [
  ['Botão e link', '/componentes/botao', [[k('Enter'), 'ativa (o botão também com', k('Espaço') + ')']]],
  ['Menu', '/componentes/menu', [[k('↓') + k('↑'), 'abrem e percorrem'], [k('Home') + k('End'), 'primeira e última opção'], [k('Enter') + k('Espaço'), 'escolhem'], ['letras', 'pulam para a opção'], [k('Esc'), 'fecha e volta ao gatilho']]],
  ['Seleção', '/componentes/selecao', [[k('Enter') + k('↓'), 'abre a lista'], [k('↑') + k('↓') + k('PgUp') + k('PgDn'), 'percorrem'], ['digitar', 'filtra (com busca) ou pula'], [k('Backspace'), 'remove o último chip (múltipla)'], [k('Esc'), 'fecha sem mudar']]],
  ['Abas', '/componentes/abas', [[k('←') + k('→'), 'trocam de aba'], [k('Home') + k('End'), 'primeira e última'], [k('Enter'), 'ativa, no modo manual']]],
  ['Modal', '/componentes/modal', [[k('Tab'), 'circula só dentro do modal'], [k('Esc'), 'fecha'], ['ao fechar', 'o foco volta para quem abriu']]],
  ['Toast', '/componentes/toast', [['nunca', 'rouba o foco'], [k('Tab'), 'alcança a ação (Desfazer)'], ['foco ou hover', 'pausam o tempo']]],
  ['Tabela', '/componentes/tabela', [[k('Tab'), 'vai aos botões de ordenar e às caixas'], [k('Enter'), 'ordena a coluna'], [k('Espaço'), 'marca a linha']]],
  ['Gráficos', '/graficos/visao-geral', [[k('Tab'), 'foca o gráfico'], [k('←') + k('→'), 'percorrem os valores (anunciados)'], [k('↑') + k('↓'), 'trocam de linha no heatmap'], [k('Home') + k('End'), 'primeiro e último'], [k('Esc'), 'esconde o tooltip']]],
  ['Busca ⌘K', '/padroes/busca', [[k('⌘ K') + k('/'), 'abrem'], [k('↑') + k('↓'), 'percorrem'], [k('Enter'), 'vai'], [k('Esc'), 'fecha e devolve o foco']]],
  ['Composer', '/padroes/conversa', [[k('Enter'), 'envia'], [k('Shift') + k('Enter'), 'quebra a linha'], [k('/'), 'abre os comandos'], [k('Esc'), 'fecha o menu ou para a resposta']]],
  ['App shell', '/padroes/app-shell', [[k('⌘ B'), 'recolhe ou expande a sidebar'], [k('Esc'), 'fecha a gaveta no celular'], ['primeiro Tab', 'mostra “Pular para o conteúdo”']]],
  ['Tooltip', '/componentes/tooltip', [['foco do teclado', 'mostra a dica'], [k('Esc'), 'fecha sem mover o foco'], ['hover', 'dá para apontar o balão sem ele sumir']]],
];

/* ───────── Leitores de tela ───────── */

const LIVE = [
  ['role="status"', 'educado: espera a pessoa terminar', 'Toast, contagem de filtros, “nenhum resultado”, anúncio ao navegar num gráfico'],
  ['role="log"', 'educado, em ordem', 'Respostas novas na conversa'],
  ['role="alert"', 'interrompe: use pouco', 'Falha que exige atenção agora. Erros de formulário preferem o resumo com foco'],
  ['aria-busy="true"', 'avisa que está mudando', 'Gráfico recarregando, resposta sendo escrita'],
];

const CODE_LANDMARKS = `<a class="ds-skip-link" href="#conteudo">Pular para o conteúdo</a>
<aside class="ds-sidebar" aria-label="Barra lateral">
  <nav class="ds-sidebar__nav" aria-label="Principal">…</nav>
</aside>
<div class="ds-main">
  <header class="ds-topbar">
    <nav class="ds-breadcrumb" aria-label="Você está em">…</nav>
  </header>
  <main id="conteudo" tabindex="-1">…</main>
</div>`;

const CODE_NAMES = `<!-- Botão só com ícone: o nome vem do aria-label; o tooltip mostra o mesmo texto -->
<button class="ds-icon-btn" aria-label="Copiar link" data-ds-tooltip="Copiar link">
  <ds-icon name="copy"></ds-icon>
</button>

<!-- Ícone decorativo ao lado de texto: escondido do leitor -->
<button class="ds-btn ds-btn--primary">
  <ds-icon name="plus"></ds-icon>Criar projeto
</button>`;

const CODE_LIVE = `<!-- A região existe antes; só o texto muda -->
<p class="ds-visually-hidden" role="status" data-count></p>

count.textContent = '12 pedidos encontrados';`;

const CODE_HIDDEN = `<!-- Visível só para leitores de tela: completa o que a cor e o ícone dizem -->
<span class="ds-stat__change">
  <ds-icon name="trending-up"></ds-icon>+12,4%
  <span class="ds-visually-hidden">(melhora)</span>
</span>`;

const MOTION_CHANGES = [
  ['Troca de tema', 'Transição suave da página inteira', 'Troca na hora'],
  ['Gráficos', 'Barras crescem, linhas se desenham', 'Aparecem prontos'],
  ['Conversa', 'Pontinhos pulsam, a resposta aparece aos poucos', 'Pontinhos parados, resposta inteira de uma vez'],
  ['Navegação na página', 'Rolagem suave até a seção', 'Salto direto'],
  ['Menus, modais, toasts', 'Entram com um deslize curto', 'Só aparecem'],
];

/* ───────── Pendências conhecidas (calculadas agora, com os tokens atuais) ───────── */

function issues() {
  const r = (fg, bg, mode) => measure(fg, bg, mode).ratio;
  const row = (label, fg, bg, min) => ({ label, pass: MODES.every(([mode]) => r(fg, bg, mode) >= min), fg, bg, min });
  const pairRow = ({ label, fg, bg, min }) =>
    `<tr><th scope="row">${label}</th>${MODES.map(([mode]) => {
      const v = r(fg, bg, mode);
      return `<td class="ds-table__num"><span class="ra-ratio ${v >= min ? 'ra-ratio--ok' : 'ra-ratio--low'}">${icon(v >= min ? 'check' : 'alert-triangle', { size: 14 })}${num(v)}:1</span></td>`;
    }).join('')}</tr>`;

  const list = [
    {
      title: 'Contorno de campos',
      rule: 'WCAG 1.4.11 · contraste de componentes, 3:1',
      text: 'Campos, seleção, composer e o switch desligado usam o novo <code class="ds-inline-code">border.field</code>, que passa de 3:1 em todas as superfícies. Chips e botões com texto continuam com o contorno fino de <code class="ds-inline-code">border.control</code>: neles o rótulo já identifica o controle, e a regra não exige a borda.',
      rows: ['canvas', 'surface', 'raised', 'sunken'].map((bg) => row(`border.field sobre bg.${bg}`, 'color.border.field', `color.bg.${bg}`, 3)),
      path: 'Resolvida em 0.4.1. O build agora mede <code class="ds-inline-code">border.field</code> contra as quatro superfícies a cada mudança.',
    },
    {
      title: 'Switch desligado',
      rule: 'WCAG 1.4.11 · 3:1',
      text: 'A trilha desligada ganhou a borda de campo: o contorno do controle aparece em qualquer fundo, e a bolinha continua contrastando com a trilha.',
      rows: [row('Borda da trilha (border.field) sobre bg.canvas', 'color.border.field', 'color.bg.canvas', 3), row('Bolinha (fg.muted) sobre a trilha', 'color.fg.muted', 'color.bg.muted', 3)],
      path: 'Resolvida em 0.4.1, com o mesmo token dos campos — um ajuste resolveu os dois.',
    },
    {
      title: 'Texto apagado no tema claro',
      rule: 'WCAG 1.4.3 · texto, 4,5:1',
      text: '<code class="ds-inline-code">fg.subtle</code> aparece em placeholders, legendas e marcas de eixo de 12–14 px. No claro ele foi para <code class="ds-inline-code">neutral.550</code>, um passo novo; e <code class="ds-inline-code">fg.muted</code> desceu para <code class="ds-inline-code">neutral.650</code>, para os dois não ficarem iguais.',
      rows: ['canvas', 'surface', 'raised', 'sunken'].map((bg) => row(`fg.subtle sobre bg.${bg}`, 'color.fg.subtle', `color.bg.${bg}`, 4.5)),
      path: 'Resolvida em 0.4.1. A checagem do build subiu de 3:1 para 4,5:1.',
    },
  ];
  return list.map((it) => ({ ...it, open: !it.rows.every((x) => x.pass), rows: it.rows.map(pairRow) }));
}

/* ───────── Checklist ───────── */

const CHECKLIST = [
  ['Ver', [
    'Texto passa de 4,5:1 (3:1 se for grande) nos dois temas',
    'Nada depende só de cor: status tem ícone e texto; séries têm legenda',
    'Funciona com zoom de 200% e numa tela de 320 px sem rolagem lateral',
    'Imagens e ícones que informam têm texto alternativo; os decorativos, não',
  ]],
  ['Operar', [
    'Tudo funciona só com teclado, na ordem de leitura',
    'O foco está sempre visível e nunca fica escondido atrás de algo fixo',
    'Ao fechar modal, menu ou gaveta, o foco volta para quem abriu',
    'Alvos de toque com pelo menos 24 × 24 px',
  ]],
  ['Entender', [
    'Todo controle tem nome — botões só com ícone usam aria-label',
    'Erros dizem o que houve e como resolver, perto do campo',
    'Mudanças importantes são anunciadas (status, log) sem roubar o foco',
  ]],
  ['Movimento', [
    'Com movimento reduzido, nada pisca, desliza ou se anima sozinho',
    'Nada some sozinho antes de a pessoa conseguir ler ou agir',
  ]],
];
const CHECK_TOTAL = CHECKLIST.reduce((n, [, items]) => n + items.length, 0);

const COMPONENT_LINKS = [
  ['Botão', '/componentes/botao'],
  ['Menu', '/componentes/menu'],
  ['Seleção', '/componentes/selecao'],
  ['Campo de texto', '/componentes/campo-de-texto'],
  ['Abas', '/componentes/abas'],
  ['Modal', '/componentes/modal'],
  ['Toast', '/componentes/toast'],
  ['Tabela', '/componentes/tabela'],
  ['Gráficos', '/graficos/visao-geral'],
  ['Conversa', '/padroes/conversa'],
  ['Formulários', '/padroes/formularios'],
];

/* ───────── Página ───────── */

const NAV = [
  ['ra-principios', 'Princípios'],
  ['ra-contraste', 'Contraste'],
  ['ra-foco', 'Foco e teclado'],
  ['ra-leitores', 'Leitores de tela'],
  ['ra-movimento', 'Movimento'],
  ['ra-pendencias', 'Pendências'],
  ['ra-checklist', 'Checklist'],
  ['ra-testar', 'Como testar'],
];

function section(id, title, desc, body) {
  return `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        <p class="doc-section__desc">${desc}</p>
      </div>
    </header>
    ${body}
  </section>`;
}

const themeSwitch = (label) => `<div class="ds-segmented ra-stage__theme" role="radiogroup" aria-label="Tema do exemplo: ${label}">
    <button type="button" class="ds-segmented__item" role="radio" data-ra-theme="dark" aria-checked="true" aria-label="Escuro">${icon('moon', { size: 16 })}</button>
    <button type="button" class="ds-segmented__item" role="radio" data-ra-theme="light" aria-checked="false" aria-label="Claro">${icon('sun', { size: 16 })}</button>
  </div>`;

const PRINCIPLES = [
  ['eye', 'Perceptível', 'Contraste medido, nada só por cor, texto que aguenta zoom. Os dois temas valem igual.'],
  ['keyboard', 'Operável', 'Tudo pelo teclado, foco sempre visível, nada com tempo curto demais para agir.'],
  ['message-square', 'Compreensível', 'Rótulos claros, erros que dizem como resolver, comportamento previsível.'],
  ['code', 'Robusto', 'HTML nativo primeiro, padrões ARIA conhecidos quando o nativo não basta.'],
];

const issueList = issues();

export default function renderAcessibilidade(page) {
  const focusDark = measure('color.border.focus', 'color.bg.canvas', 'dark').ratio;
  const focusLight = measure('color.border.focus', 'color.bg.canvas', 'light').ratio;
  return `
  <div class="page doc ra-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Acessibilidade</h1>
        <p class="doc-header__lead">Telas que todo mundo consegue usar: no teclado, com leitor de tela, com zoom, com pouca visão de cor ou pedindo menos movimento. A meta é WCAG 2.2 nível AA, nos dois temas.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">contrastes no build</dt><dd class="doc-stat__value">${passed}/${contrast.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">WCAG 2.2</dt><dd class="doc-stat__value">AA</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">temas medidos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">pendências abertas</dt><dd class="doc-stat__value">${issueList.filter((it) => it.open).length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'ra-principios',
      'Princípios',
      'Quatro ideias guiam cada componente. Elas não são um anexo no fim do projeto: entram no token, no CSS e no JavaScript.',
      `<div class="ra-principles">
        ${PRINCIPLES.map(([ic, title, text], i) => `<article class="ra-principle">
          <div class="ra-principle__top"><span class="ra-principle__icon">${icon(ic, { size: 20 })}</span><span class="ds-section__stamp">0${i + 1}</span></div>
          <h3 class="ra-principle__title">${title}</h3>
          <p class="ra-principle__text">${text}</p>
        </article>`).join('')}
      </div>
      <div class="ra-measure">
        <div class="ra-measure__head">
          <p class="ra-measure__title">Como medimos</p>
          <p class="ra-measure__total"><strong>${passed} de ${contrast.length}</strong> pares passam agora</p>
        </div>
        <p class="ra-measure__text">A referência é a WCAG 2.2, nível AA. A cada build, <code class="ds-inline-code">scripts/build-tokens.mjs</code> mede todos os pares de texto e fundo declarados em <code class="ds-inline-code">tokens/semantic.json</code>, nos dois temas — transparências são compostas sobre o fundo antes da conta. Um par que cai abaixo do mínimo aparece no terminal na hora. O que o build não mede (foco, teclado, leitores de tela) está nas seções abaixo, e o que ainda não está bom fica em <a class="ra-link" href="#" data-goto="ra-pendencias">Pendências</a>.</p>
      </div>`,
    )}

    ${section(
      'ra-contraste',
      'Contraste',
      'Escolha um texto ou marca e um fundo: a conta é a mesma do build, nos dois temas. Use para conferir uma combinação antes de usá-la.',
      `<div class="ra-checker">
        <div class="ra-checker__controls">
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="ra-fg">Texto ou marca</label>
            <select id="ra-fg" data-ds-select data-search data-search-placeholder="Buscar token" data-ra-fg>${options(FG_GROUPS, 'color.fg.muted')}</select>
          </div>
          <button type="button" class="ds-icon-btn ds-icon-btn--outline ra-checker__swap" data-ra-swap aria-label="Inverter texto e fundo" data-ds-tooltip="Inverter">${icon('chevrons-up-down', { size: 18 })}</button>
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="ra-bg">Fundo</label>
            <select id="ra-bg" data-ds-select data-search data-search-placeholder="Buscar token" data-ra-bg>${options(BG_GROUPS, 'color.bg.canvas')}</select>
          </div>
        </div>
        <p class="ra-checker__note" data-ra-note></p>
        <div class="ra-results" data-ra-results aria-live="polite"></div>
      </div>

      <div class="ra-palette">
        <div class="ra-palette__swatches" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<span style="background:var(--ds-color-chart-series-${i + 1})"></span>`).join('')}</div>
        <div class="ra-palette__body">
          <p class="ra-palette__title">Cores de gráfico, em ordem validada</p>
          <p class="ra-palette__text">As 8 cores de série seguem uma ordem escolhida para protanopia e deuteranopia: a pior dupla vizinha ainda tem ΔE 11,7 (meta: 8), 18,5 na visão normal, e todas passam de 3:1 sobre a superfície nos dois temas. <a class="ra-link" href="#/graficos/visao-geral">Ver em Gráficos</a></p>
        </div>
      </div>

      <h3 class="doc-subhead">Pares verificados no build <span class="doc-subhead__meta">${buildPairs.length} pares × 2 temas</span></h3>
      <div class="doc-table ra-pairs">
        <div class="doc-table__head" aria-hidden="true"><span>Texto ou marca</span><span>Fundo</span><span>Mínimo</span><span>Escuro</span><span>Claro</span></div>
        ${buildPairs
          .map(
            (p) => `<div class="doc-table__row">
              <span class="ra-pairs__name"><span class="ra-pairs__swatch" style="background:${valueOf(p.fg, 'dark')}"></span>${short(p.fg)}</span>
              <span class="ra-pairs__bg">${short(p.bg)}</span>
              <span class="ra-pairs__min">${num(p.min, 1)}:1</span>
              ${MODES.map(([mode, label]) => {
                const c = p[mode];
                return `<span class="ra-ratio ${c.pass ? 'ra-ratio--ok' : 'ra-ratio--low'}"><span class="ra-ratio__mode">${label}</span>${icon(c.pass ? 'check' : 'alert-triangle', { size: 14 })}${num(c.ratio)}:1</span>`;
              }).join('')}
            </div>`,
          )
          .join('')}
      </div>`,
    )}

    ${section(
      'ra-foco',
      'Foco e teclado',
      'Quem navega pelo teclado precisa saber onde está e chegar a tudo. Aperte Tab dentro do exemplo: todos os controles mostram o mesmo anel.',
      `<div class="ra-focus">
        <div class="ra-stage" data-ra-stage data-theme="dark">
          ${themeSwitch('foco')}
          <div class="ra-focus__row">
            <button type="button" class="ds-btn ds-btn--primary" data-state="focus">${icon('plus', { size: 18 })}Criar</button>
            <button type="button" class="ds-btn ds-btn--secondary">Cancelar</button>
            <button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="Copiar link" data-ds-tooltip="Copiar link">${icon('link')}</button>
            <button type="button" class="ds-chip" aria-pressed="false" data-ra-chip>Favoritos</button>
            <label class="ds-checkbox"><input type="checkbox" class="ds-checkbox__input"><span class="ds-choice__text"><span class="ds-choice__label">Lembrar</span></span></label>
            <label class="ds-switch"><input type="checkbox" role="switch" class="ds-switch__input" checked><span class="ds-choice__text"><span class="ds-choice__label">Avisos</span></span></label>
            <div class="ds-field ds-field--sm ra-focus__field">${icon('search', { size: 16 })}<input class="ds-field__input" type="search" placeholder="Buscar" aria-label="Buscar no exemplo"></div>
            <a class="ds-inline-action" href="#" data-ra-noop>Ver detalhes${icon('arrow-right', { size: 14 })}</a>
          </div>
          <p class="ra-focus__note">“Criar” mostra o anel fixo, com <code class="ds-inline-code">data-state="focus"</code>, para você ver sem teclado.</p>
        </div>
        <dl class="ra-spec">
          <div><dt>Espessura</dt><dd><code class="ds-inline-code">focus-ring.width</code> · 2 px</dd></div>
          <div><dt>Distância</dt><dd><code class="ds-inline-code">focus-ring.offset</code> · 2 px</dd></div>
          <div><dt>Cor</dt><dd><code class="ds-inline-code">border.focus</code> · ${num(focusDark)}:1 no escuro, ${num(focusLight)}:1 no claro, sobre o canvas</dd></div>
          <div><dt>Quando</dt><dd>Só com <code class="ds-inline-code">:focus-visible</code> — o clique do mouse não acende o anel</dd></div>
        </dl>
      </div>
      ${a11yList([
        ['Nunca remova o contorno', 'Sem <code class="ds-inline-code">outline: none</code> sem trocar por outro indicador igualmente visível. O anel vem do <code class="ds-inline-code">base.css</code> para todo elemento focável.'],
        ['A ordem do foco é a ordem de leitura', 'Nada de <code class="ds-inline-code">tabindex</code> positivo. Se a ordem parece errada, a ordem do HTML é que está.'],
        ['Um ponto de parada por grupo', 'Abas, grupos de rádio e listas usam “roving tabindex”: Tab entra no grupo, as setas andam dentro dele.'],
        ['O foco sempre volta', 'Ao fechar modal, menu, gaveta ou a busca ⌘K, o foco volta para o elemento que abriu.'],
        ['Pular a navegação', 'O primeiro Tab da página mostra “Pular para o conteúdo”, que leva direto ao painel principal.', ['Tab']],
      ])}

      <h3 class="doc-subhead">Mapa de teclado <span class="doc-subhead__meta">${KEYMAP.length} componentes e padrões</span></h3>
      <div class="doc-table ra-keymap">
        <div class="doc-table__head" aria-hidden="true"><span>Componente</span><span>Teclas</span></div>
        ${KEYMAP.map(
          ([name, href, rows]) => `<div class="doc-table__row">
            <a class="ra-keymap__name" href="#${href}">${name}</a>
            <ul class="ra-keys" role="list">${rows.map(([keys, action, extra]) => `<li><span class="ra-keys__k">${keys}</span><span class="ra-keys__a">${action}${extra ? ` ${extra}` : ''}</span></li>`).join('')}</ul>
          </div>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'ra-leitores',
      'Leitores de tela',
      'O leitor de tela lê a estrutura, não o desenho. Marcos, nomes e regiões ao vivo fazem a tela ter sentido sem ver.',
      `<div class="ra-sr">
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('layout', { size: 18 })}Marcos</p>
          <p class="ra-sr__text">Sidebar, navegação, trilha e conteúdo são marcos com nome. Quem usa leitor pula direto entre eles.</p>
          ${codeBlock(CODE_LANDMARKS)}
        </article>
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('tag', { size: 18 })}Nomes</p>
          <p class="ra-sr__text">Todo controle tem nome. Botão só com ícone leva <code class="ds-inline-code">aria-label</code>; o tooltip repete o mesmo texto para quem vê. Ícones ao lado de texto ficam escondidos.</p>
          ${codeBlock(CODE_NAMES)}
        </article>
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('message-square', { size: 18 })}Regiões ao vivo</p>
          <p class="ra-sr__text">A região precisa existir antes da mudança — só o texto troca. Anuncie o resultado, não cada letra digitada.</p>
          ${codeBlock(CODE_LIVE)}
        </article>
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('eye-off', { size: 18 })}Texto só para o leitor</p>
          <p class="ra-sr__text"><code class="ds-inline-code">.ds-visually-hidden</code> esconde da tela, não do leitor. Use para completar o que a cor ou o ícone dizem.</p>
          ${codeBlock(CODE_HIDDEN)}
        </article>
      </div>

      <h3 class="doc-subhead">Qual região usar</h3>
      <div class="doc-table ra-grid3" role="table" aria-label="Regiões ao vivo">
        <div class="doc-table__head" role="row"><span role="columnheader">Região</span><span role="columnheader">Como anuncia</span><span role="columnheader">Onde usamos</span></div>
        ${LIVE.map(([role, how, where]) => `<div class="doc-table__row" role="row"><span role="rowheader"><code class="ds-inline-code">${escapeHtml(role)}</code></span><span role="cell" class="ra-grid3__muted" data-label="Como anuncia">${how}</span><span role="cell" data-label="Onde usamos">${where}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'ra-movimento',
      'Movimento',
      'Movimento orienta, mas pode enjoar quem tem sensibilidade vestibular. Quando o sistema pede menos movimento, o Órbita troca animação por mudança imediata — o resultado é o mesmo, sem o caminho.',
      `<p class="ra-pref" data-ra-pref></p>
      <div class="ra-motion">
        <div class="ra-motion__head"><span></span><p>Com movimento</p><p>Movimento reduzido</p></div>
        <div class="ra-motion__row">
          <div class="ra-motion__label"><p>Troca de tema</p><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-ra-replay="theme">${icon('refresh', { size: 16 })}Trocar</button></div>
          <div class="ra-motion__cell"><div class="ra-mini ra-mini--animated" data-theme="dark" data-ra-mini><span class="ra-mini__bar"></span><span class="ra-mini__line"></span><span class="ra-mini__line ra-mini__line--short"></span></div></div>
          <div class="ra-motion__cell ra-reduced"><div class="ra-mini" data-theme="dark" data-ra-mini><span class="ra-mini__bar"></span><span class="ra-mini__line"></span><span class="ra-mini__line ra-mini__line--short"></span></div></div>
        </div>
        <div class="ra-motion__row">
          <div class="ra-motion__label"><p>Entrada de gráfico</p><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-ra-replay="chart">${icon('refresh', { size: 16 })}Repetir</button></div>
          <div class="ra-motion__cell"><div data-ra-chart="normal"></div></div>
          <div class="ra-motion__cell ra-reduced"><div data-ra-chart="reduced"></div></div>
        </div>
        <div class="ra-motion__row">
          <div class="ra-motion__label"><p>Escrevendo…</p></div>
          <div class="ra-motion__cell">${typingHtml('Órbita está escrevendo')}</div>
          <div class="ra-motion__cell ra-reduced">${typingHtml('Órbita está escrevendo')}</div>
        </div>
      </div>

      <h3 class="doc-subhead">O que muda</h3>
      <div class="doc-table ra-grid3" role="table" aria-label="O que muda com movimento reduzido">
        <div class="doc-table__head" role="row"><span role="columnheader">Onde</span><span role="columnheader">Com movimento</span><span role="columnheader">Reduzido</span></div>
        ${MOTION_CHANGES.map(([where, normal, reduced]) => `<div class="doc-table__row" role="row"><span role="rowheader" class="ra-grid3__name">${where}</span><span role="cell" class="ra-grid3__muted" data-label="Com movimento">${normal}</span><span role="cell" data-label="Reduzido">${reduced}</span></div>`).join('')}
      </div>

      <h3 class="doc-subhead">Durações e curvas</h3>
      ${tokenTable([
        ['duration.fast', 'Hover, pequenas trocas de cor'],
        ['duration.base', 'Menus, chips, campos'],
        ['duration.slow', 'Modais, painéis, troca de tema'],
        ['duration.slower', 'Entrada de gráficos'],
        ['easing.standard', 'A maioria das transições'],
        ['easing.emphasized', 'Entradas com mais presença'],
      ])}`,
    )}

    ${section(
      'ra-pendencias',
      'Pendências conhecidas',
      'O que estava abaixo da regra e como foi resolvido, medido agora com os tokens atuais. Se algo voltar a falhar, o selo volta a “Aberta” sozinho — nada de esconder.',
      `<div class="ra-issues">
        ${issueList
          .map(
            (it) => `<article class="ra-issue${it.open ? '' : ' ra-issue--done'}">
              <div class="ra-issue__head">
                <p class="ra-issue__title">${it.title}</p>
                ${it.open ? `<span class="ds-badge ds-badge--sm ds-badge--warning">${icon('alert-triangle', { size: 12 })}Aberta</span>` : `<span class="ds-badge ds-badge--sm ds-badge--success">${icon('check', { size: 12 })}Resolvida</span>`}
              </div>
              <p class="ra-issue__rule">${it.rule}</p>
              <p class="ra-issue__text">${it.text}</p>
              <div class="ds-table-wrap ra-issue__table"><table class="ds-table ds-table--compact">
                <thead><tr><th scope="col">Par</th><th scope="col" class="ds-table__num">Escuro</th><th scope="col" class="ds-table__num">Claro</th></tr></thead>
                <tbody>${it.rows.join('')}</tbody></table></div>
              <p class="ra-issue__path">${it.path}</p>
            </article>`,
          )
          .join('')}
        <article class="ra-issue ra-issue--done">
          <div class="ra-issue__head">
            <p class="ra-issue__title">Tooltip que some ao ser apontado</p>
            <span class="ds-badge ds-badge--sm ds-badge--success">${icon('check', { size: 12 })}Resolvida</span>
          </div>
          <p class="ra-issue__rule">WCAG 1.4.13 · conteúdo em hover ou foco</p>
          <p class="ra-issue__text">Agora dá para levar o ponteiro até o balão sem ele sumir, ele fica aberto enquanto o gatilho estiver em hover ou foco, e <kbd class="ds-kbd">Esc</kbd> fecha sem mover o foco. Teste no botão de copiar em <a class="ra-link" href="#" data-goto="ra-foco">Foco e teclado</a>.</p>
        </article>
        <article class="ra-issue ra-issue--note">
          <div class="ra-issue__head">
            <p class="ra-issue__title">Fora da regra, de propósito</p>
            <span class="ds-badge ds-badge--sm">${icon('info', { size: 12 })}Nota</span>
          </div>
          <p class="ra-issue__text"><code class="ds-inline-code">fg.disabled</code> fica perto de ${num(measure('color.fg.disabled', 'color.bg.canvas', 'dark').ratio)}:1. A WCAG dispensa controles desativados — mas, se a pessoa precisa saber por que algo está desativado, diga em texto ao lado.</p>
        </article>
      </div>`,
    )}

    ${section(
      'ra-checklist',
      'Checklist para cada tela',
      'Antes de abrir o PR, passe por aqui. Marcar é só para você acompanhar — nada fica salvo.',
      `<div class="ra-checklist">
        <div class="ra-checklist__progress" data-ra-progress></div>
        <div class="ra-checklist__groups">
          ${CHECKLIST.map(
            ([group, items], g) => `<fieldset class="ra-checklist__group">
              <legend class="ra-checklist__legend"><span class="ds-section__stamp">0${g + 1}</span>${group}</legend>
              ${items.map((text) => `<label class="ds-checkbox ra-checklist__item"><input type="checkbox" class="ds-checkbox__input" data-ra-check><span class="ds-choice__text"><span class="ds-choice__label">${text}</span></span></label>`).join('')}
            </fieldset>`,
          ).join('')}
        </div>
        <div class="ra-checklist__foot">
          <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-ra-clear>${icon('x', { size: 16 })}Desmarcar tudo</button>
        </div>
      </div>
      <h3 class="doc-subhead">Acessibilidade de cada peça</h3>
      <p class="ra-links-lead">Cada página de componente e padrão tem a própria seção de acessibilidade, com teclado e leitores de tela.</p>
      <div class="ra-links">${COMPONENT_LINKS.map(([label, href]) => `<a class="ds-chip ds-chip--sm" href="#${href}">${label}${icon('arrow-up-right', { size: 14 })}</a>`).join('')}</div>`,
    )}

    ${section(
      'ra-testar',
      'Como testar',
      'Ferramenta automática pega uma parte; o resto pede usar a tela do jeito que outras pessoas usam. Dez minutos por tela já pegam a maioria dos problemas.',
      `<div class="ra-tools">
        ${[
          ['keyboard', 'Só teclado', 'Guarde o mouse. Chegue a tudo com Tab, setas, Enter e Esc — e veja sempre onde está o foco.'],
          ['mic', 'Leitor de tela', 'VoiceOver no Mac (⌘ F5) ou NVDA no Windows. Navegue por títulos e marcos; ouça se os nomes fazem sentido.'],
          ['search', 'Zoom e tela estreita', 'Zoom de 200% e janela de 320 px: nada pode sumir ou exigir rolagem lateral.'],
          ['monitor', 'Alto contraste', 'Ative o contraste do sistema (forced-colors). Bordas e foco precisam continuar visíveis.'],
          ['eye', 'Visão de cor', 'No DevTools, Rendering › Emulate vision deficiencies. Status e séries precisam se ler sem a cor.'],
          ['motion', 'Movimento reduzido', 'Ligue nos ajustes do sistema (ou emule no DevTools) e confira que nada se anima sozinho.'],
        ]
          .map(
            ([ic, title, text]) => `<article class="ra-tool">
              <span class="ra-tool__icon">${icon(ic, { size: 20 })}</span>
              <p class="ra-tool__title">${title}</p>
              <p class="ra-tool__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>`,
    )}
  </div>`;
}

export function mount(root) {
  const cleanups = [mountDocNav(root), mountCodeCopy(root), mountSelects(root)];
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');

  /* Verificador */
  const fgSel = root.querySelector('[data-ra-fg]');
  const bgSel = root.querySelector('[data-ra-bg]');
  const results = root.querySelector('[data-ra-results]');
  const note = root.querySelector('[data-ra-note]');
  const renderResults = () => {
    const fg = fgSel.value;
    const bg = bgSel.value;
    results.innerHTML = MODES.map(([mode, label]) => resultCard(fg, bg, mode, label)).join('');
    const alpha = [fg, bg].filter((n) => parse(valueOf(n, 'dark')).a < 1 || parse(valueOf(n, 'light')).a < 1);
    note.textContent = alpha.length
      ? `${alpha.map(short).join(' e ')} ${alpha.length > 1 ? 'têm' : 'tem'} transparência: a cor foi composta sobre ${alpha.includes(bg) ? 'o canvas' : 'o fundo escolhido'}, como no build.`
      : '';
  };
  fgSel.addEventListener('change', renderResults);
  bgSel.addEventListener('change', renderResults);
  renderResults();

  const swap = root.querySelector('[data-ra-swap]');
  /** Garante que o token exista na lista de destino (num grupo “Invertidos”) antes de escolher. */
  const ensure = (select, value) => {
    if ([...select.options].some((o) => o.value === value)) return;
    let group = select.querySelector('optgroup[data-ra-swapped]');
    if (!group) {
      group = document.createElement('optgroup');
      group.label = 'Invertidos';
      group.dataset.raSwapped = '';
      select.append(group);
    }
    group.append(new Option(short(value), value));
  };
  const onSwap = () => {
    const fg = fgSel.value;
    const bg = bgSel.value;
    ensure(fgSel, bg);
    ensure(bgSel, fg);
    fgSel.value = bg;
    bgSel.value = fg;
    enhanceSelect(fgSel).sync();
    enhanceSelect(bgSel).sync();
    renderResults();
  };
  swap.addEventListener('click', onSwap);
  cleanups.push(() => swap.removeEventListener('click', onSwap));

  /* Palcos com tema próprio, chip e links internos */
  const onClick = (event) => {
    const themeBtn = event.target.closest('[data-ra-theme]');
    if (themeBtn) {
      const stage = themeBtn.closest('[data-ra-stage]');
      stage.dataset.theme = themeBtn.dataset.raTheme;
      stage.querySelectorAll('[data-ra-theme]').forEach((b) => b.setAttribute('aria-checked', String(b === themeBtn)));
    }
    const chip = event.target.closest('[data-ra-chip]');
    if (chip) chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    if (event.target.closest('[data-ra-noop]')) event.preventDefault();
    const go = event.target.closest('[data-goto]');
    if (go) {
      event.preventDefault();
      root.querySelector(`#${go.dataset.goto}`)?.scrollIntoView({ behavior: reducedQuery.matches ? 'auto' : 'smooth', block: 'start' });
    }
  };
  root.addEventListener('click', onClick);
  cleanups.push(() => root.removeEventListener('click', onClick));

  /* Movimento */
  const pref = root.querySelector('[data-ra-pref]');
  const showPref = () => {
    const on = reducedQuery.matches;
    pref.innerHTML = `${icon(on ? 'check-circle' : 'info', { size: 16 })}<span>Seu sistema está ${on ? '<strong>pedindo menos movimento</strong> — a coluna “Com movimento” também fica parada, como deve' : 'com o <strong>movimento normal</strong>. A coluna da direita mostra como fica para quem pede menos'}.</span>`;
    pref.dataset.on = String(on);
  };
  showPref();
  reducedQuery.addEventListener('change', showPref);
  cleanups.push(() => reducedQuery.removeEventListener('change', showPref));

  const chartData = { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], series: [{ name: 'Pedidos', values: [32, 41, 38, 52, 47] }] };
  const charts = ['normal', 'reduced'].map((kind) =>
    barChart(root.querySelector(`[data-ra-chart="${kind}"]`), { ...chartData, label: kind === 'normal' ? 'Exemplo com movimento' : 'Exemplo com movimento reduzido', height: 132, table: false }),
  );
  cleanups.push(() => charts.forEach((c) => c.destroy()));

  let replayTimer;
  const onReplay = (event) => {
    const btn = event.target.closest('[data-ra-replay]');
    if (!btn) return;
    if (btn.dataset.raReplay === 'theme') {
      root.querySelectorAll('[data-ra-mini]').forEach((mini) => (mini.dataset.theme = mini.dataset.theme === 'dark' ? 'light' : 'dark'));
      return;
    }
    if (reducedQuery.matches) return;
    const fig = charts[0].el;
    delete fig.dataset.animate;
    void fig.offsetWidth;
    fig.dataset.animate = '';
    clearTimeout(replayTimer);
    replayTimer = setTimeout(() => delete fig.dataset.animate, 1100);
  };
  root.addEventListener('click', onReplay);
  cleanups.push(() => {
    root.removeEventListener('click', onReplay);
    clearTimeout(replayTimer);
  });

  /* Checklist (só na memória) */
  const progress = root.querySelector('[data-ra-progress]');
  const checks = [...root.querySelectorAll('[data-ra-check]')];
  const renderProgress = () => {
    const done = checks.filter((c) => c.checked).length;
    progress.innerHTML = meter({
      label: done === CHECK_TOTAL ? 'Tudo conferido' : 'Conferido nesta tela',
      value: done,
      max: CHECK_TOTAL,
      format: (v) => String(v),
      thresholds: null,
      tone: done === CHECK_TOTAL ? 'success' : undefined,
    });
  };
  const onCheck = (event) => event.target.matches('[data-ra-check]') && renderProgress();
  root.addEventListener('change', onCheck);
  const clearBtn = root.querySelector('[data-ra-clear]');
  const onClear = () => {
    checks.forEach((c) => (c.checked = false));
    renderProgress();
  };
  clearBtn.addEventListener('click', onClear);
  renderProgress();
  cleanups.push(() => {
    root.removeEventListener('change', onCheck);
    clearBtn.removeEventListener('click', onClear);
  });

  return () => cleanups.forEach((fn) => fn?.());
}
