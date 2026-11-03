import { icon } from '../../ds/icons/icons.js';
import { tokens, contrast } from '../../ds/tokens.js';
import { siteTheme, followSiteTheme } from '../component-doc.js';
import { mountSelects, enhanceSelect } from '../../ds/js/select.js';
import { barChart, meter } from '../../ds/js/charts.js';
import { typingHtml } from '../../ds/js/composer.js';
import { formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, tokenTable, escapeHtml } from '../component-doc.js';
import { weekdays } from '../chart-data.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-acessibilidade.css'];

/* ───────── Contraste: a mesma conta do build (WCAG 2.x, alfa composto sobre o fundo) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const MODE_IDS = ['refugio', 'dark', 'light'];
const MODES = () => [
  ['refugio', 'Refúgio'],
  ['dark', L('Escuro', 'Dark', 'Oscuro')],
  ['light', L('Claro', 'Light', 'Claro')],
];
const byName = new Map(tokens.map((t) => [t.name, t]));
const short = (name) => name.replace(/^color\./, '');
const num = (n, d = 2) => formatNumber(n, { minimumFractionDigits: d, maximumFractionDigits: d });

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

const passed = contrast.filter((c) => c.pass).length;

/** Pares do build agrupados (um por linha, os três temas lado a lado). */
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

const FG_GROUPS = () => [
  [L('Texto', 'Text', 'Texto'), names('fg', ['default', 'muted', 'subtle', 'disabled', 'brand', 'link', 'link-hover', 'inverse'])],
  [L('Marca e status', 'Brand and status', 'Marca y estado'), [...names('brand', ['fg', 'solid', 'on-solid']), ...['success', 'warning', 'danger', 'info'].flatMap((s) => names(s, ['fg', 'solid', 'on-solid']))]],
  [L('Bordas e foco', 'Borders and focus', 'Bordes y foco'), names('border', ['subtle', 'default', 'strong', 'control', 'focus'])],
  [L('Gráficos', 'Charts', 'Gráficos'), [...names('chart', ['muted', 'other', 'grid', 'axis']), ...names('chart.series', ['1', '2', '3', '4', '5', '6', '7', '8']), ...names('chart.status', ['good', 'warning', 'critical'])]],
];

const BG_GROUPS = () => [
  [L('Fundos', 'Backgrounds', 'Fondos'), names('bg', ['app', 'canvas', 'sidebar', 'surface', 'raised', 'sunken', 'muted', 'inverse', 'hover', 'selected'])],
  [L('Marca e status', 'Brand and status', 'Marca y estado'), [...names('brand', ['solid', 'subtle']), ...['success', 'warning', 'danger', 'info'].flatMap((s) => names(s, ['solid', 'subtle']))]],
];

const options = (groups, selected) =>
  groups
    .map(([label, list]) => `<optgroup label="${label}">${list.map((n) => `<option value="${n}"${n === selected ? ' selected' : ''}>${short(n)}</option>`).join('')}</optgroup>`)
    .join('');

const RULES = () => [
  [L('Texto normal', 'Normal text', 'Texto normal'), L('até 18 px, ou até 14 px em negrito', 'up to 18 px, or up to 14 px bold', 'hasta 18 px, o hasta 14 px en negrita'), [['AA', 4.5], ['AAA', 7]]],
  [L('Texto grande', 'Large text', 'Texto grande'), L(`a partir de 24 px, ou ${formatNumber(18.66)} px em negrito`, `from 24 px, or ${formatNumber(18.66)} px bold`, `a partir de 24 px, o ${formatNumber(18.66)} px en negrita`), [['AA', 3], ['AAA', 4.5]]],
  [L('Componentes e gráficos', 'Components and charts', 'Componentes y gráficos'), L('bordas que identificam o controle, ícones, marcas', 'borders that identify the control, icons, marks', 'bordes que identifican el control, íconos, marcas'), [['AA', 3]]],
];

const verdict = (ok, level) =>
  `<span class="ds-badge ds-badge--sm ${ok ? 'ds-badge--success' : 'ds-badge--danger'} ra-verdict">${icon(ok ? 'check' : 'x', { size: 12 })}${level} ${ok ? L('passa', 'passes', 'pasa') : L('não passa', 'fails', 'no pasa')}</span>`;

function resultCard(fg, bg, mode, label) {
  const m = measure(fg, bg, mode);
  return `<article class="ra-result" data-theme="${mode}">
    <div class="ra-result__preview" style="background:${m.bg};color:${m.fg}">
      <span class="ra-result__big">Aa</span>
      <span class="ra-result__text">${L('Texto de exemplo em 14 px', 'Sample text at 14 px', 'Texto de ejemplo en 14 px')}</span>
      <span class="ra-result__mark" style="background:${m.fg}" aria-hidden="true"></span>
    </div>
    <div class="ra-result__body">
      <p class="ra-result__mode">${label}</p>
      <p class="ra-result__ratio"><strong>${num(m.ratio)}</strong>:1</p>
      <p class="ra-result__hex">${L(`${m.fg.toUpperCase()} sobre ${m.bg.toUpperCase()}`, `${m.fg.toUpperCase()} on ${m.bg.toUpperCase()}`, `${m.fg.toUpperCase()} sobre ${m.bg.toUpperCase()}`)}</p>
      <ul class="ra-result__rules" role="list">
        ${RULES().map(
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

const KEYMAP = () => {
  const space = L('Espaço', 'Space', 'Espacio');
  return [
    [L('Botão e link', 'Button and link', 'Botón y enlace'), '/componentes/botao', [[k('Enter'), L('ativa (o botão também com', 'activates (the button also with', 'activa (el botón también con'), k(space) + ')']]],
    [L('Menu', 'Menu', 'Menú'), '/componentes/menu', [[k('↓') + k('↑'), L('abrem e percorrem', 'open and move through', 'abren y recorren')], [k('Home') + k('End'), L('primeira e última opção', 'first and last option', 'primera y última opción')], [k('Enter') + k(space), L('escolhem', 'choose', 'eligen')], [L('letras', 'letters', 'letras'), L('pulam para a opção', 'jump to the option', 'saltan a la opción')], [k('Esc'), L('fecha e volta ao gatilho', 'closes and returns to the trigger', 'cierra y vuelve al disparador')]]],
    [L('Seleção', 'Select', 'Selector'), '/componentes/selecao', [[k('Enter') + k('↓'), L('abre a lista', 'opens the list', 'abre la lista')], [k('↑') + k('↓') + k('PgUp') + k('PgDn'), L('percorrem', 'move through', 'recorren')], [L('digitar', 'typing', 'escribir'), L('filtra (com busca) ou pula', 'filters (with search) or jumps', 'filtra (con búsqueda) o salta')], [k('Backspace'), L('remove o último chip (múltipla)', 'removes the last chip (multiple)', 'quita el último chip (múltiple)')], [k('Esc'), L('fecha sem mudar', 'closes without changing', 'cierra sin cambiar')]]],
    [L('Abas', 'Tabs', 'Pestañas'), '/componentes/abas', [[k('←') + k('→'), L('trocam de aba', 'switch tabs', 'cambian de pestaña')], [k('Home') + k('End'), L('primeira e última', 'first and last', 'primera y última')], [k('Enter'), L('ativa, no modo manual', 'activates, in manual mode', 'activa, en el modo manual')]]],
    ['Modal', '/componentes/modal', [[k('Tab'), L('circula só dentro do modal', 'cycles only inside the modal', 'circula solo dentro del modal')], [k('Esc'), L('fecha', 'closes', 'cierra')], [L('ao fechar', 'on close', 'al cerrar'), L('o foco volta para quem abriu', 'focus returns to what opened it', 'el foco vuelve a quien lo abrió')]]],
    ['Toast', '/componentes/toast', [[L('nunca', 'never', 'nunca'), L('rouba o foco', 'steals focus', 'roba el foco')], [k('Tab'), L('alcança a ação (Desfazer)', 'reaches the action (Undo)', 'alcanza la acción (Deshacer)')], [L('foco ou hover', 'focus or hover', 'foco o hover'), L('pausam o tempo', 'pause the timer', 'pausan el tiempo')]]],
    [L('Tabela', 'Table', 'Tabla'), '/componentes/tabela', [[k('Tab'), L('vai aos botões de ordenar e às caixas', 'goes to the sort buttons and checkboxes', 'va a los botones de ordenar y a las casillas')], [k('Enter'), L('ordena a coluna', 'sorts the column', 'ordena la columna')], [k(space), L('marca a linha', 'checks the row', 'marca la fila')]]],
    [L('Gráficos', 'Charts', 'Gráficos'), '/graficos/visao-geral', [[k('Tab'), L('foca o gráfico', 'focuses the chart', 'enfoca el gráfico')], [k('←') + k('→'), L('percorrem os valores (anunciados)', 'move through the values (announced)', 'recorren los valores (anunciados)')], [k('↑') + k('↓'), L('trocam de linha no heatmap', 'switch rows in the heatmap', 'cambian de fila en el heatmap')], [k('Home') + k('End'), L('primeiro e último', 'first and last', 'primero y último')], [k('Esc'), L('esconde o tooltip', 'hides the tooltip', 'oculta el tooltip')]]],
    [L('Busca ⌘K', '⌘K search', 'Búsqueda ⌘K'), '/padroes/busca', [[k('⌘ K') + k('/'), L('abrem', 'open', 'abren')], [k('↑') + k('↓'), L('percorrem', 'move through', 'recorren')], [k('Enter'), L('vai', 'goes', 'va')], [k('Esc'), L('fecha e devolve o foco', 'closes and returns focus', 'cierra y devuelve el foco')]]],
    ['Composer', '/padroes/conversa', [[k('Enter'), L('envia', 'sends', 'envía')], [k('Shift') + k('Enter'), L('quebra a linha', 'adds a line break', 'salto de línea')], [k('/'), L('abre os comandos', 'opens the commands', 'abre los comandos')], [k('Esc'), L('fecha o menu ou para a resposta', 'closes the menu or stops the reply', 'cierra el menú o detiene la respuesta')]]],
    ['App shell', '/padroes/app-shell', [[k('⌘ B'), L('recolhe ou expande a sidebar', 'collapses or expands the sidebar', 'contrae o expande la sidebar')], [k('Esc'), L('fecha a gaveta no celular', 'closes the drawer on phones', 'cierra el cajón en el móvil')], [L('primeiro Tab', 'first Tab', 'primer Tab'), L('mostra “Pular para o conteúdo”', 'shows “Skip to content”', 'muestra “Saltar al contenido”')]]],
    ['Tooltip', '/componentes/tooltip', [[L('foco do teclado', 'keyboard focus', 'foco del teclado'), L('mostra a dica', 'shows the tooltip', 'muestra la pista')], [k('Esc'), L('fecha sem mover o foco', 'closes without moving focus', 'cierra sin mover el foco')], ['hover', L('dá para apontar o balão sem ele sumir', 'you can point at the bubble without it disappearing', 'se puede apuntar al globo sin que desaparezca')]]],
  ];
};

/* ───────── Leitores de tela ───────── */

const LIVE = () => [
  ['role="status"', L('educado: espera a pessoa terminar', 'polite: waits for the person to finish', 'educado: espera a que la persona termine'), L('Toast, contagem de filtros, “nenhum resultado”, anúncio ao navegar num gráfico', 'Toast, filter count, “no results”, announcement while navigating a chart', 'Toast, conteo de filtros, “ningún resultado”, anuncio al navegar un gráfico')],
  ['role="log"', L('educado, em ordem', 'polite, in order', 'educado, en orden'), L('Respostas novas na conversa', 'New replies in the conversation', 'Respuestas nuevas en la conversación')],
  ['role="alert"', L('interrompe: use pouco', 'interrupts: use sparingly', 'interrumpe: úsalo poco'), L('Falha que exige atenção agora. Erros de formulário preferem o resumo com foco', 'A failure that needs attention now. Form errors prefer the summary with focus', 'Fallo que exige atención ahora. Los errores de formulario prefieren el resumen con foco')],
  ['aria-busy="true"', L('avisa que está mudando', 'says it’s changing', 'avisa que está cambiando'), L('Gráfico recarregando, resposta sendo escrita', 'A chart reloading, a reply being written', 'Gráfico recargando, respuesta escribiéndose')],
];

const codeLandmarks = () => `<a class="ds-skip-link" href="#${L('conteudo', 'content', 'contenido')}">${L('Pular para o conteúdo', 'Skip to content', 'Saltar al contenido')}</a>
<aside class="ds-sidebar" aria-label="${L('Barra lateral', 'Sidebar', 'Barra lateral')}">
  <nav class="ds-sidebar__nav" aria-label="${L('Principal', 'Main', 'Principal')}">…</nav>
</aside>
<div class="ds-main">
  <header class="ds-topbar">
    <nav class="ds-breadcrumb" aria-label="${L('Você está em', 'You are here', 'Estás en')}">…</nav>
  </header>
  <main id="${L('conteudo', 'content', 'contenido')}" tabindex="-1">…</main>
</div>`;

const codeNames = () => `<!-- ${L('Botão só com ícone: o nome vem do aria-label; o tooltip mostra o mesmo texto', 'Icon-only button: the name comes from aria-label; the tooltip shows the same text', 'Botón solo con ícono: el nombre viene del aria-label; el tooltip muestra el mismo texto')} -->
<button class="ds-icon-btn" aria-label="${L('Copiar link', 'Copy link', 'Copiar enlace')}" data-ds-tooltip="${L('Copiar link', 'Copy link', 'Copiar enlace')}">
  <ds-icon name="copy"></ds-icon>
</button>

<!-- ${L('Ícone decorativo ao lado de texto: escondido do leitor', 'Decorative icon next to text: hidden from the reader', 'Ícono decorativo junto al texto: oculto para el lector')} -->
<button class="ds-btn ds-btn--primary">
  <ds-icon name="plus"></ds-icon>${L('Criar projeto', 'Create project', 'Crear proyecto')}
</button>`;

const codeLive = () => `<!-- ${L('A região existe antes; só o texto muda', 'The region exists beforehand; only the text changes', 'La región existe antes; solo cambia el texto')} -->
<p class="ds-visually-hidden" role="status" data-count></p>

count.textContent = '${L('12 pedidos encontrados', '12 orders found', '12 pedidos encontrados')}';`;

const codeHidden = () => `<!-- ${L('Visível só para leitores de tela: completa o que a cor e o ícone dizem', 'Visible only to screen readers: completes what the color and icon say', 'Visible solo para lectores de pantalla: completa lo que dicen el color y el ícono')} -->
<span class="ds-stat__change">
  <ds-icon name="trending-up"></ds-icon>${formatNumber(0.124, { style: 'percent', signDisplay: 'always', maximumFractionDigits: 1 })}
  <span class="ds-visually-hidden">${L('(melhora)', '(better)', '(mejora)')}</span>
</span>`;

const MOTION_CHANGES = () => [
  [L('Troca de tema', 'Theme switch', 'Cambio de tema'), L('Transição suave da página inteira', 'A smooth transition of the whole page', 'Transición suave de toda la página'), L('Troca na hora', 'Switches instantly', 'Cambia al instante')],
  [L('Gráficos', 'Charts', 'Gráficos'), L('Barras crescem, linhas se desenham', 'Bars grow, lines draw themselves', 'Las barras crecen, las líneas se dibujan'), L('Aparecem prontos', 'They appear ready', 'Aparecen listos')],
  [L('Conversa', 'Conversation', 'Conversación'), L('Pontinhos pulsam, a resposta aparece aos poucos', 'Dots pulse, the reply appears gradually', 'Los puntitos pulsan, la respuesta aparece poco a poco'), L('Pontinhos parados, resposta inteira de uma vez', 'Still dots, the whole reply at once', 'Puntitos quietos, respuesta entera de una vez')],
  [L('Navegação na página', 'In-page navigation', 'Navegación en la página'), L('Rolagem suave até a seção', 'Smooth scroll to the section', 'Desplazamiento suave hasta la sección'), L('Salto direto', 'A direct jump', 'Salto directo')],
  [L('Menus, modais, toasts', 'Menus, modals, toasts', 'Menús, modales, toasts'), L('Entram com um deslize curto', 'Enter with a short slide', 'Entran con un deslizamiento corto'), L('Só aparecem', 'They just appear', 'Solo aparecen')],
];

/* ───────── Pendências conhecidas (calculadas agora, com os tokens atuais) ───────── */

function issues() {
  const r = (fg, bg, mode) => measure(fg, bg, mode).ratio;
  const row = (label, fg, bg, min) => ({ label, pass: MODE_IDS.every((mode) => r(fg, bg, mode) >= min), fg, bg, min });
  const pairRow = ({ label, fg, bg, min }) =>
    `<tr><th scope="row">${label}</th>${MODE_IDS.map((mode) => {
      const v = r(fg, bg, mode);
      return `<td class="ds-table__num"><span class="ra-ratio ${v >= min ? 'ra-ratio--ok' : 'ra-ratio--low'}">${icon(v >= min ? 'check' : 'alert-triangle', { size: 14 })}${num(v)}:1</span></td>`;
    }).join('')}</tr>`;
  const on = L('sobre', 'on', 'sobre');

  const list = [
    {
      title: L('Contorno de campos', 'Field outline', 'Contorno de campos'),
      rule: L('WCAG 1.4.11 · contraste de componentes, 3:1', 'WCAG 1.4.11 · component contrast, 3:1', 'WCAG 1.4.11 · contraste de componentes, 3:1'),
      text: L(`Composer e o switch desligado usam ${ic('border.field')}, que passa de 3:1 em todas as superfícies. Desde a 0.9, campo, seleção e chip que abre menu usam o fundo do menu que abrem (${ic('bg.field')}, igual ao ${ic('bg.raised')}) com o contorno fino de ${ic('border.default')} — escolha de visual: o contorno fica abaixo de 3:1, e quem identifica o campo é o rótulo acima dele e o contraste do fundo. Chips e botões com texto seguem com ${ic('border.control')}.`, `The composer and the off switch use ${ic('border.field')}, which passes 3:1 on every surface. Since 0.9, fields, selects, and menu chips use the background of the menu they open (${ic('bg.field')}, same as ${ic('bg.raised')}) with the thin ${ic('border.default')} outline — a visual choice: the outline is below 3:1, and the label above the field plus the background contrast identify it. Chips and text buttons keep ${ic('border.control')}.`, `El composer y el switch apagado usan ${ic('border.field')}, que supera 3:1 en todas las superficies. Desde la 0.9, campos, selector y chip que abre menú usan el fondo del menú que abren (${ic('bg.field')}, igual a ${ic('bg.raised')}) con el contorno fino de ${ic('border.default')} — decisión visual: el contorno queda por debajo de 3:1, y la etiqueta encima del campo y el contraste del fondo lo identifican. Chips y botones con texto siguen con ${ic('border.control')}.`),
      rows: ['canvas', 'surface', 'raised', 'sunken'].map((bg) => row(`border.field ${on} bg.${bg}`, 'color.border.field', `color.bg.${bg}`, 3)),
      path: L(`Resolvida em 0.4.1. O build agora mede ${ic('border.field')} contra as quatro superfícies a cada mudança.`, `Resolved in 0.4.1. The build now measures ${ic('border.field')} against all four surfaces on every change.`, `Resuelta en 0.4.1. El build ahora mide ${ic('border.field')} contra las cuatro superficies con cada cambio.`),
    },
    {
      title: L('Switch desligado', 'Off switch', 'Switch apagado'),
      rule: 'WCAG 1.4.11 · 3:1',
      text: L('A trilha desligada ganhou a borda de campo: o contorno do controle aparece em qualquer fundo, e a bolinha continua contrastando com a trilha.', 'The off track got the field border: the control’s outline shows on any background, and the knob still contrasts with the track.', 'El riel apagado recibió el borde de campo: el contorno del control aparece en cualquier fondo, y la bolita sigue contrastando con el riel.'),
      rows: [row(L('Borda da trilha (border.field) sobre bg.canvas', 'Track border (border.field) on bg.canvas', 'Borde del riel (border.field) sobre bg.canvas'), 'color.border.field', 'color.bg.canvas', 3), row(L('Bolinha (fg.muted) sobre a trilha', 'Knob (fg.muted) on the track', 'Bolita (fg.muted) sobre el riel'), 'color.fg.muted', 'color.bg.muted', 3)],
      path: L('Resolvida em 0.4.1, com o mesmo token dos campos — um ajuste resolveu os dois.', 'Resolved in 0.4.1, with the same token as the fields — one change fixed both.', 'Resuelta en 0.4.1, con el mismo token de los campos — un ajuste resolvió los dos.'),
    },
    {
      title: L('Texto apagado no tema claro', 'Muted text in the light theme', 'Texto atenuado en el tema claro'),
      rule: L(`WCAG 1.4.3 · texto, ${num(4.5, 1)}:1`, `WCAG 1.4.3 · text, ${num(4.5, 1)}:1`, `WCAG 1.4.3 · texto, ${num(4.5, 1)}:1`),
      text: L(`${ic('fg.subtle')} aparece em placeholders, legendas e marcas de eixo de 12–14 px. No claro ele foi para ${ic('neutral.550')}, um passo novo; e ${ic('fg.muted')} desceu para ${ic('neutral.650')}, para os dois não ficarem iguais.`, `${ic('fg.subtle')} appears in placeholders, captions, and 12–14 px axis ticks. In light mode it moved to ${ic('neutral.550')}, a new step; and ${ic('fg.muted')} went down to ${ic('neutral.650')}, so the two don’t end up the same.`, `${ic('fg.subtle')} aparece en placeholders, leyendas y marcas de eje de 12–14 px. En el claro pasó a ${ic('neutral.550')}, un paso nuevo; y ${ic('fg.muted')} bajó a ${ic('neutral.650')}, para que los dos no queden iguales.`),
      rows: ['canvas', 'surface', 'raised', 'sunken'].map((bg) => row(`fg.subtle ${on} bg.${bg}`, 'color.fg.subtle', `color.bg.${bg}`, 4.5)),
      path: L(`Resolvida em 0.4.1. A checagem do build subiu de 3:1 para ${num(4.5, 1)}:1.`, `Resolved in 0.4.1. The build check went up from 3:1 to ${num(4.5, 1)}:1.`, `Resuelta en 0.4.1. La verificación del build subió de 3:1 a ${num(4.5, 1)}:1.`),
    },
  ];
  return list.map((it) => ({ ...it, open: !it.rows.every((x) => x.pass), rows: it.rows.map(pairRow) }));
}

/* ───────── Checklist ───────── */

const CHECKLIST = () => [
  [L('Ver', 'See', 'Ver'), [
    L(`Texto passa de ${num(4.5, 1)}:1 (3:1 se for grande) nos três temas`, `Text passes ${num(4.5, 1)}:1 (3:1 if large) in all three themes`, `El texto supera ${num(4.5, 1)}:1 (3:1 si es grande) en los tres temas`),
    L('Nada depende só de cor: status tem ícone e texto; séries têm legenda', 'Nothing relies on color alone: status has an icon and text; series have a legend', 'Nada depende solo del color: el estado tiene ícono y texto; las series tienen leyenda'),
    L('Funciona com zoom de 200% e numa tela de 320 px sem rolagem lateral', 'Works at 200% zoom and on a 320 px screen without horizontal scrolling', 'Funciona con zoom de 200% y en una pantalla de 320 px sin desplazamiento lateral'),
    L('Imagens e ícones que informam têm texto alternativo; os decorativos, não', 'Informative images and icons have alt text; decorative ones don’t', 'Las imágenes e íconos que informan tienen texto alternativo; los decorativos, no'),
  ]],
  [L('Operar', 'Operate', 'Operar'), [
    L('Tudo funciona só com teclado, na ordem de leitura', 'Everything works with the keyboard alone, in reading order', 'Todo funciona solo con teclado, en el orden de lectura'),
    L('O foco está sempre visível e nunca fica escondido atrás de algo fixo', 'Focus is always visible and never hidden behind something fixed', 'El foco siempre está visible y nunca queda oculto detrás de algo fijo'),
    L('Ao fechar modal, menu ou gaveta, o foco volta para quem abriu', 'On closing a modal, menu, or drawer, focus returns to what opened it', 'Al cerrar un modal, menú o cajón, el foco vuelve a quien lo abrió'),
    L('Alvos de toque com pelo menos 24 × 24 px', 'Touch targets of at least 24 × 24 px', 'Objetivos táctiles de al menos 24 × 24 px'),
  ]],
  [L('Entender', 'Understand', 'Entender'), [
    L('Todo controle tem nome — botões só com ícone usam aria-label', 'Every control has a name — icon-only buttons use aria-label', 'Todo control tiene nombre — los botones solo con ícono usan aria-label'),
    L('Erros dizem o que houve e como resolver, perto do campo', 'Errors say what happened and how to fix it, near the field', 'Los errores dicen qué pasó y cómo resolverlo, cerca del campo'),
    L('Mudanças importantes são anunciadas (status, log) sem roubar o foco', 'Important changes are announced (status, log) without stealing focus', 'Los cambios importantes se anuncian (status, log) sin robar el foco'),
  ]],
  [L('Movimento', 'Motion', 'Movimiento'), [
    L('Com movimento reduzido, nada pisca, desliza ou se anima sozinho', 'With reduced motion, nothing flashes, slides, or animates on its own', 'Con movimiento reducido, nada parpadea, se desliza ni se anima solo'),
    L('Nada some sozinho antes de a pessoa conseguir ler ou agir', 'Nothing disappears on its own before people can read or act', 'Nada desaparece solo antes de que la persona pueda leer o actuar'),
  ]],
];

const COMPONENT_LINKS = () => [
  [L('Botão', 'Button', 'Botón'), '/componentes/botao'],
  [L('Menu', 'Menu', 'Menú'), '/componentes/menu'],
  [L('Seleção', 'Select', 'Selector'), '/componentes/selecao'],
  [L('Campo de texto', 'Text field', 'Campo de texto'), '/componentes/campo-de-texto'],
  [L('Abas', 'Tabs', 'Pestañas'), '/componentes/abas'],
  ['Modal', '/componentes/modal'],
  ['Toast', '/componentes/toast'],
  [L('Tabela', 'Table', 'Tabla'), '/componentes/tabela'],
  [L('Gráficos', 'Charts', 'Gráficos'), '/graficos/visao-geral'],
  [L('Conversa', 'Conversation', 'Conversación'), '/padroes/conversa'],
  [L('Formulários', 'Forms', 'Formularios'), '/padroes/formularios'],
];

/* ───────── Página ───────── */

const NAV = () => [
  ['ra-principios', L('Princípios', 'Principles', 'Principios')],
  ['ra-contraste', L('Contraste', 'Contrast', 'Contraste')],
  ['ra-foco', L('Foco e teclado', 'Focus and keyboard', 'Foco y teclado')],
  ['ra-leitores', L('Leitores de tela', 'Screen readers', 'Lectores de pantalla')],
  ['ra-movimento', L('Movimento', 'Motion', 'Movimiento')],
  ['ra-pendencias', L('Pendências', 'Known issues', 'Pendientes')],
  ['ra-checklist', 'Checklist'],
  ['ra-testar', L('Como testar', 'How to test', 'Cómo probar')],
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

const themeSwitch = (label, th = siteTheme()) => `<div class="ds-segmented ra-stage__theme" role="radiogroup" aria-label="${L('Tema do exemplo', 'Example theme', 'Tema del ejemplo')}: ${label}">
    <button type="button" class="ds-segmented__item" role="radio" data-ra-theme="refugio" aria-checked="${th === 'refugio'}" aria-label="Refúgio">${icon('mountain', { size: 16 })}</button>
    <button type="button" class="ds-segmented__item" role="radio" data-ra-theme="dark" aria-checked="${th === 'dark'}" aria-label="${L('Escuro', 'Dark', 'Oscuro')}">${icon('moon', { size: 16 })}</button>
    <button type="button" class="ds-segmented__item" role="radio" data-ra-theme="light" aria-checked="${th === 'light'}" aria-label="${L('Claro', 'Light', 'Claro')}">${icon('sun', { size: 16 })}</button>
  </div>`;

const PRINCIPLES = () => [
  ['eye', L('Perceptível', 'Perceivable', 'Perceptible'), L('Contraste medido, nada só por cor, texto que aguenta zoom. Os três temas valem igual.', 'Measured contrast, nothing by color alone, text that holds up to zoom. All three themes count the same.', 'Contraste medido, nada solo por color, texto que aguanta zoom. Los tres temas valen igual.')],
  ['keyboard', L('Operável', 'Operable', 'Operable'), L('Tudo pelo teclado, foco sempre visível, nada com tempo curto demais para agir.', 'Everything by keyboard, focus always visible, nothing with too little time to act.', 'Todo con el teclado, foco siempre visible, nada con tiempo demasiado corto para actuar.')],
  ['message-square', L('Compreensível', 'Understandable', 'Comprensible'), L('Rótulos claros, erros que dizem como resolver, comportamento previsível.', 'Clear labels, errors that say how to fix them, predictable behavior.', 'Etiquetas claras, errores que dicen cómo resolverlos, comportamiento predecible.')],
  ['code', L('Robusto', 'Robust', 'Robusto'), L('HTML nativo primeiro, padrões ARIA conhecidos quando o nativo não basta.', 'Native HTML first, well-known ARIA patterns when native isn’t enough.', 'HTML nativo primero, patrones ARIA conocidos cuando lo nativo no basta.')],
];

export default function renderAcessibilidade(page) {
  const issueList = issues();
  const focusDark = measure('color.border.focus', 'color.bg.canvas', 'dark').ratio;
  const focusLight = measure('color.border.focus', 'color.bg.canvas', 'light').ratio;
  const focusRefugio = measure('color.border.focus', 'color.bg.canvas', 'refugio').ratio;
  const modes = MODES();
  const keymap = KEYMAP();
  return `
  <div class="page doc ra-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Telas que todo mundo consegue usar: no teclado, com leitor de tela, com zoom, com pouca visão de cor ou pedindo menos movimento. A meta é WCAG 2.2 nível AA, nos três temas.', 'Screens everyone can use: by keyboard, with a screen reader, with zoom, with low color vision, or asking for less motion. The goal is WCAG 2.2 level AA, in all three themes.', 'Pantallas que todo el mundo puede usar: con teclado, con lector de pantalla, con zoom, con poca visión de color o pidiendo menos movimiento. La meta es WCAG 2.2 nivel AA, en los tres temas.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('contrastes no build', 'contrasts in the build', 'contrastes en el build')}</dt><dd class="doc-stat__value">${passed}/${contrast.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">WCAG 2.2</dt><dd class="doc-stat__value">AA</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('temas medidos', 'themes measured', 'temas medidos')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('pendências abertas', 'open issues', 'pendientes abiertos')}</dt><dd class="doc-stat__value">${issueList.filter((it) => it.open).length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'ra-principios',
      L('Princípios', 'Principles', 'Principios'),
      L('Quatro ideias guiam cada componente. Elas não são um anexo no fim do projeto: entram no token, no CSS e no JavaScript.', 'Four ideas guide every component. They aren’t an appendix at the end of the project: they go into the token, the CSS, and the JavaScript.', 'Cuatro ideas guían cada componente. No son un anexo al final del proyecto: entran en el token, en el CSS y en el JavaScript.'),
      `<div class="ra-principles">
        ${PRINCIPLES().map(([glyph, title, text], i) => `<article class="ra-principle">
          <div class="ra-principle__top"><span class="ra-principle__icon">${icon(glyph, { size: 20 })}</span><span class="ds-section__stamp">0${i + 1}</span></div>
          <h3 class="ra-principle__title">${title}</h3>
          <p class="ra-principle__text">${text}</p>
        </article>`).join('')}
      </div>
      <div class="ra-measure">
        <div class="ra-measure__head">
          <p class="ra-measure__title">${L('Como medimos', 'How we measure', 'Cómo medimos')}</p>
          <p class="ra-measure__total">${L(`<strong>${passed} de ${contrast.length}</strong> pares passam agora`, `<strong>${passed} of ${contrast.length}</strong> pairs pass now`, `<strong>${passed} de ${contrast.length}</strong> pares pasan ahora`)}</p>
        </div>
        <p class="ra-measure__text">${L(`A referência é a WCAG 2.2, nível AA. A cada build, ${ic('scripts/build-tokens.mjs')} mede todos os pares de texto e fundo declarados em ${ic('tokens/semantic.json')}, nos três temas — transparências são compostas sobre o fundo antes da conta. Um par que cai abaixo do mínimo aparece no terminal na hora. O que o build não mede (foco, teclado, leitores de tela) está nas seções abaixo, e o que ainda não está bom fica em <a class="ra-link" href="#" data-goto="ra-pendencias">Pendências</a>.`, `The reference is WCAG 2.2, level AA. On every build, ${ic('scripts/build-tokens.mjs')} measures every text and background pair declared in ${ic('tokens/semantic.json')}, in all three themes — transparencies are composited over the background before the math. A pair that drops below the minimum shows up in the terminal right away. What the build doesn’t measure (focus, keyboard, screen readers) is in the sections below, and what still isn’t right goes in <a class="ra-link" href="#" data-goto="ra-pendencias">Known issues</a>.`, `La referencia es WCAG 2.2, nivel AA. En cada build, ${ic('scripts/build-tokens.mjs')} mide todos los pares de texto y fondo declarados en ${ic('tokens/semantic.json')}, en los tres temas — las transparencias se componen sobre el fondo antes de la cuenta. Un par que baja del mínimo aparece en la terminal al instante. Lo que el build no mide (foco, teclado, lectores de pantalla) está en las secciones de abajo, y lo que aún no está bien queda en <a class="ra-link" href="#" data-goto="ra-pendencias">Pendientes</a>.`)}</p>
      </div>`,
    )}

    ${section(
      'ra-contraste',
      L('Contraste', 'Contrast', 'Contraste'),
      L('Escolha um texto ou marca e um fundo: a conta é a mesma do build, nos três temas. Use para conferir uma combinação antes de usá-la.', 'Pick a text or mark and a background: the math is the same as the build’s, in all three themes. Use it to check a combination before using it.', 'Elige un texto o marca y un fondo: la cuenta es la misma del build, en los tres temas. Úsalo para revisar una combinación antes de usarla.'),
      `<div class="ra-checker">
        <div class="ra-checker__controls">
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="ra-fg">${L('Texto ou marca', 'Text or mark', 'Texto o marca')}</label>
            <select id="ra-fg" data-ds-select data-search data-search-placeholder="${L('Buscar token', 'Search token', 'Buscar token')}" data-ra-fg>${options(FG_GROUPS(), 'color.fg.muted')}</select>
          </div>
          <button type="button" class="ds-icon-btn ds-icon-btn--outline ra-checker__swap" data-ra-swap aria-label="${L('Inverter texto e fundo', 'Swap text and background', 'Invertir texto y fondo')}" data-ds-tooltip="${L('Inverter', 'Swap', 'Invertir')}">${icon('chevrons-up-down', { size: 18 })}</button>
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="ra-bg">${L('Fundo', 'Background', 'Fondo')}</label>
            <select id="ra-bg" data-ds-select data-search data-search-placeholder="${L('Buscar token', 'Search token', 'Buscar token')}" data-ra-bg>${options(BG_GROUPS(), 'color.bg.canvas')}</select>
          </div>
        </div>
        <p class="ra-checker__note" data-ra-note></p>
        <div class="ra-results" data-ra-results aria-live="polite"></div>
      </div>

      <div class="ra-palette">
        <div class="ra-palette__swatches" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<span style="background:var(--ds-color-chart-series-${i + 1})"></span>`).join('')}</div>
        <div class="ra-palette__body">
          <p class="ra-palette__title">${L('Cores de gráfico, em ordem validada', 'Chart colors, in a validated order', 'Colores de gráfico, en orden validado')}</p>
          <p class="ra-palette__text">${L(`As 8 cores de série seguem uma ordem escolhida para protanopia e deuteranopia: a pior dupla vizinha ainda tem ΔE ${num(11.7, 1)} (meta: 8), ${num(18.5, 1)} na visão normal, e todas passam de 3:1 sobre a superfície nos três temas. <a class="ra-link" href="#/graficos/visao-geral">Ver em Gráficos</a>`, `The 8 series colors follow an order chosen for protanopia and deuteranopia: the worst neighboring pair still has ΔE ${num(11.7, 1)} (target: 8), ${num(18.5, 1)} with typical vision, and all pass 3:1 on the surface in all three themes. <a class="ra-link" href="#/graficos/visao-geral">See in Charts</a>`, `Los 8 colores de serie siguen un orden elegido para protanopia y deuteranopia: el peor par vecino aún tiene ΔE ${num(11.7, 1)} (meta: 8), ${num(18.5, 1)} con visión típica, y todos superan 3:1 sobre la superficie en los tres temas. <a class="ra-link" href="#/graficos/visao-geral">Ver en Gráficos</a>`)}</p>
        </div>
      </div>

      <h3 class="doc-subhead">${L('Pares verificados no build', 'Pairs checked in the build', 'Pares verificados en el build')} <span class="doc-subhead__meta">${L(`${buildPairs.length} pares × ${modes.length} temas`, `${buildPairs.length} pairs × ${modes.length} themes`, `${buildPairs.length} pares × ${modes.length} temas`)}</span></h3>
      <div class="doc-table ra-pairs">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Texto ou marca', 'Text or mark', 'Texto o marca')}</span><span>${L('Fundo', 'Background', 'Fondo')}</span><span>${L('Mínimo', 'Minimum', 'Mínimo')}</span><span>${modes[0][1]}</span><span>${modes[1][1]}</span><span>${modes[2][1]}</span></div>
        ${buildPairs
          .map(
            (p) => `<div class="doc-table__row">
              <span class="ra-pairs__name"><span class="ra-pairs__swatch" style="background:${valueOf(p.fg, 'dark')}"></span>${short(p.fg)}</span>
              <span class="ra-pairs__bg">${short(p.bg)}</span>
              <span class="ra-pairs__min">${num(p.min, 1)}:1</span>
              ${modes.map(([mode, label]) => {
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
      L('Foco e teclado', 'Focus and keyboard', 'Foco y teclado'),
      L('Quem navega pelo teclado precisa saber onde está e chegar a tudo. Aperte Tab dentro do exemplo: todos os controles mostram o mesmo anel.', 'Keyboard users need to know where they are and reach everything. Press Tab inside the example: every control shows the same ring.', 'Quien navega con el teclado necesita saber dónde está y llegar a todo. Pulsa Tab dentro del ejemplo: todos los controles muestran el mismo anillo.'),
      `<div class="ra-focus">
        <div class="ra-stage" data-ra-stage data-theme="${siteTheme()}">
          ${themeSwitch(L('foco', 'focus', 'foco'))}
          <div class="ra-focus__row">
            <button type="button" class="ds-btn ds-btn--primary" data-state="focus">${icon('plus', { size: 18 })}${L('Criar', 'Create', 'Crear')}</button>
            <button type="button" class="ds-btn ds-btn--secondary">${L('Cancelar', 'Cancel', 'Cancelar')}</button>
            <button type="button" class="ds-icon-btn ds-icon-btn--outline" aria-label="${L('Copiar link', 'Copy link', 'Copiar enlace')}" data-ds-tooltip="${L('Copiar link', 'Copy link', 'Copiar enlace')}">${icon('link')}</button>
            <button type="button" class="ds-chip" aria-pressed="false" data-ra-chip>${L('Favoritos', 'Favorites', 'Favoritos')}</button>
            <label class="ds-checkbox"><input type="checkbox" class="ds-checkbox__input"><span class="ds-choice__text"><span class="ds-choice__label">${L('Lembrar', 'Remember', 'Recordar')}</span></span></label>
            <label class="ds-switch"><input type="checkbox" role="switch" class="ds-switch__input" checked><span class="ds-choice__text"><span class="ds-choice__label">${L('Avisos', 'Notices', 'Avisos')}</span></span></label>
            <div class="ds-field ds-field--sm ra-focus__field">${icon('search', { size: 16 })}<input class="ds-field__input" type="search" placeholder="${L('Buscar', 'Search', 'Buscar')}" aria-label="${L('Buscar no exemplo', 'Search in the example', 'Buscar en el ejemplo')}"></div>
            <a class="ds-inline-action" href="#" data-ra-noop>${L('Ver detalhes', 'See details', 'Ver detalles')}${icon('arrow-right', { size: 14 })}</a>
          </div>
          <p class="ra-focus__note">${L(`“Criar” mostra o anel fixo, com ${ic('data-state="focus"')}, para você ver sem teclado.`, `“Create” shows the ring pinned, with ${ic('data-state="focus"')}, so you can see it without a keyboard.`, `“Crear” muestra el anillo fijo, con ${ic('data-state="focus"')}, para que lo veas sin teclado.`)}</p>
        </div>
        <dl class="ra-spec">
          <div><dt>${L('Espessura', 'Width', 'Grosor')}</dt><dd>${ic('focus-ring.width')} · 2 px</dd></div>
          <div><dt>${L('Distância', 'Offset', 'Distancia')}</dt><dd>${ic('focus-ring.offset')} · 2 px</dd></div>
          <div><dt>${L('Cor', 'Color', 'Color')}</dt><dd>${ic('border.focus')} · ${L(`${num(focusDark)}:1 no escuro, ${num(focusLight)}:1 no claro, ${num(focusRefugio)}:1 no Refúgio, sobre o canvas`, `${num(focusDark)}:1 in dark, ${num(focusLight)}:1 in light, ${num(focusRefugio)}:1 in Refúgio, on the canvas`, `${num(focusDark)}:1 en el oscuro, ${num(focusLight)}:1 en el claro, ${num(focusRefugio)}:1 en Refúgio, sobre el canvas`)}</dd></div>
          <div><dt>${L('Quando', 'When', 'Cuándo')}</dt><dd>${L(`Só com ${ic(':focus-visible')} — o clique do mouse não acende o anel`, `Only with ${ic(':focus-visible')} — a mouse click doesn’t light the ring`, `Solo con ${ic(':focus-visible')} — el clic del mouse no enciende el anillo`)}</dd></div>
        </dl>
      </div>
      ${a11yList([
        [L('Nunca remova o contorno', 'Never remove the outline', 'Nunca quites el contorno'), L(`Sem ${ic('outline: none')} sem trocar por outro indicador igualmente visível. O anel vem do ${ic('base.css')} para todo elemento focável.`, `No ${ic('outline: none')} without replacing it with an equally visible indicator. The ring comes from ${ic('base.css')} for every focusable element.`, `Nada de ${ic('outline: none')} sin cambiarlo por otro indicador igual de visible. El anillo viene del ${ic('base.css')} para todo elemento enfocable.`)],
        [L('A ordem do foco é a ordem de leitura', 'Focus order is reading order', 'El orden del foco es el orden de lectura'), L(`Nada de ${ic('tabindex')} positivo. Se a ordem parece errada, a ordem do HTML é que está.`, `No positive ${ic('tabindex')}. If the order looks wrong, it’s the HTML order that is.`, `Nada de ${ic('tabindex')} positivo. Si el orden parece incorrecto, es el orden del HTML el que lo está.`)],
        [L('Um ponto de parada por grupo', 'One tab stop per group', 'Una parada por grupo'), L('Abas, grupos de rádio e listas usam “roving tabindex”: Tab entra no grupo, as setas andam dentro dele.', 'Tabs, radio groups, and lists use a “roving tabindex”: Tab enters the group, the arrows move within it.', 'Pestañas, grupos de radio y listas usan “roving tabindex”: Tab entra en el grupo, las flechas se mueven dentro de él.')],
        [L('O foco sempre volta', 'Focus always returns', 'El foco siempre vuelve'), L('Ao fechar modal, menu, gaveta ou a busca ⌘K, o foco volta para o elemento que abriu.', 'On closing a modal, menu, drawer, or the ⌘K search, focus returns to the element that opened it.', 'Al cerrar un modal, menú, cajón o la búsqueda ⌘K, el foco vuelve al elemento que lo abrió.')],
        [L('Pular a navegação', 'Skip the navigation', 'Saltar la navegación'), L('O primeiro Tab da página mostra “Pular para o conteúdo”, que leva direto ao painel principal.', 'The page’s first Tab shows “Skip to content”, which goes straight to the main panel.', 'El primer Tab de la página muestra “Saltar al contenido”, que lleva directo al panel principal.'), ['Tab']],
      ])}

      <h3 class="doc-subhead">${L('Mapa de teclado', 'Keyboard map', 'Mapa de teclado')} <span class="doc-subhead__meta">${L(`${keymap.length} componentes e padrões`, `${keymap.length} components and patterns`, `${keymap.length} componentes y patrones`)}</span></h3>
      <div class="doc-table ra-keymap">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Componente', 'Component', 'Componente')}</span><span>${L('Teclas', 'Keys', 'Teclas')}</span></div>
        ${keymap.map(
          ([name, href, rows]) => `<div class="doc-table__row">
            <a class="ra-keymap__name" href="#${href}">${name}</a>
            <ul class="ra-keys" role="list">${rows.map(([keys, action, extra]) => `<li><span class="ra-keys__k">${keys}</span><span class="ra-keys__a">${action}${extra ? ` ${extra}` : ''}</span></li>`).join('')}</ul>
          </div>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'ra-leitores',
      L('Leitores de tela', 'Screen readers', 'Lectores de pantalla'),
      L('O leitor de tela lê a estrutura, não o desenho. Marcos, nomes e regiões ao vivo fazem a tela ter sentido sem ver.', 'A screen reader reads the structure, not the drawing. Landmarks, names, and live regions make the screen make sense without seeing it.', 'El lector de pantalla lee la estructura, no el dibujo. Puntos de referencia, nombres y regiones en vivo hacen que la pantalla tenga sentido sin verla.'),
      `<div class="ra-sr">
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('layout', { size: 18 })}${L('Marcos', 'Landmarks', 'Puntos de referencia')}</p>
          <p class="ra-sr__text">${L('Sidebar, navegação, trilha e conteúdo são marcos com nome. Quem usa leitor pula direto entre eles.', 'Sidebar, navigation, breadcrumb, and content are named landmarks. Screen reader users jump straight between them.', 'Sidebar, navegación, ruta y contenido son puntos de referencia con nombre. Quien usa lector salta directo entre ellos.')}</p>
          ${codeBlock(codeLandmarks())}
        </article>
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('tag', { size: 18 })}${L('Nomes', 'Names', 'Nombres')}</p>
          <p class="ra-sr__text">${L(`Todo controle tem nome. Botão só com ícone leva ${ic('aria-label')}; o tooltip repete o mesmo texto para quem vê. Ícones ao lado de texto ficam escondidos.`, `Every control has a name. An icon-only button gets an ${ic('aria-label')}; the tooltip repeats the same text for sighted users. Icons next to text stay hidden.`, `Todo control tiene nombre. El botón solo con ícono lleva ${ic('aria-label')}; el tooltip repite el mismo texto para quien ve. Los íconos junto al texto quedan ocultos.`)}</p>
          ${codeBlock(codeNames())}
        </article>
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('message-square', { size: 18 })}${L('Regiões ao vivo', 'Live regions', 'Regiones en vivo')}</p>
          <p class="ra-sr__text">${L('A região precisa existir antes da mudança — só o texto troca. Anuncie o resultado, não cada letra digitada.', 'The region needs to exist before the change — only the text changes. Announce the result, not each typed letter.', 'La región tiene que existir antes del cambio — solo cambia el texto. Anuncia el resultado, no cada letra escrita.')}</p>
          ${codeBlock(codeLive())}
        </article>
        <article class="ra-sr__card">
          <p class="ra-sr__title">${icon('eye-off', { size: 18 })}${L('Texto só para o leitor', 'Text only for the reader', 'Texto solo para el lector')}</p>
          <p class="ra-sr__text">${L(`${ic('.ds-visually-hidden')} esconde da tela, não do leitor. Use para completar o que a cor ou o ícone dizem.`, `${ic('.ds-visually-hidden')} hides from the screen, not from the reader. Use it to complete what the color or icon says.`, `${ic('.ds-visually-hidden')} oculta de la pantalla, no del lector. Úsalo para completar lo que dicen el color o el ícono.`)}</p>
          ${codeBlock(codeHidden())}
        </article>
      </div>

      <h3 class="doc-subhead">${L('Qual região usar', 'Which region to use', 'Qué región usar')}</h3>
      <div class="doc-table ra-grid3" role="table" aria-label="${L('Regiões ao vivo', 'Live regions', 'Regiones en vivo')}">
        <div class="doc-table__head" role="row"><span role="columnheader">${L('Região', 'Region', 'Región')}</span><span role="columnheader">${L('Como anuncia', 'How it announces', 'Cómo anuncia')}</span><span role="columnheader">${L('Onde usamos', 'Where we use it', 'Dónde la usamos')}</span></div>
        ${LIVE().map(([role, how, where]) => `<div class="doc-table__row" role="row"><span role="rowheader"><code class="ds-inline-code">${escapeHtml(role)}</code></span><span role="cell" class="ra-grid3__muted" data-label="${L('Como anuncia', 'How it announces', 'Cómo anuncia')}">${how}</span><span role="cell" data-label="${L('Onde usamos', 'Where we use it', 'Dónde la usamos')}">${where}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'ra-movimento',
      L('Movimento', 'Motion', 'Movimiento'),
      L('Movimento orienta, mas pode enjoar quem tem sensibilidade vestibular. Quando o sistema pede menos movimento, o Lume troca animação por mudança imediata — o resultado é o mesmo, sem o caminho.', 'Motion orients, but it can sicken people with vestibular sensitivity. When the system asks for less motion, Lume swaps animation for an immediate change — the result is the same, without the journey.', 'El movimiento orienta, pero puede marear a quien tiene sensibilidad vestibular. Cuando el sistema pide menos movimiento, Lume cambia la animación por un cambio inmediato — el resultado es el mismo, sin el recorrido.'),
      `<p class="ra-pref" data-ra-pref></p>
      <div class="ra-motion">
        <div class="ra-motion__head"><span></span><p>${L('Com movimento', 'With motion', 'Con movimiento')}</p><p>${L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido')}</p></div>
        <div class="ra-motion__row">
          <div class="ra-motion__label"><p>${L('Troca de tema', 'Theme switch', 'Cambio de tema')}</p><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-ra-replay="theme">${icon('refresh', { size: 16 })}${L('Trocar', 'Switch', 'Cambiar')}</button></div>
          <div class="ra-motion__cell"><div class="ra-mini ra-mini--animated" data-theme="dark" data-ra-mini><span class="ra-mini__bar"></span><span class="ra-mini__line"></span><span class="ra-mini__line ra-mini__line--short"></span></div></div>
          <div class="ra-motion__cell ra-reduced"><div class="ra-mini" data-theme="dark" data-ra-mini><span class="ra-mini__bar"></span><span class="ra-mini__line"></span><span class="ra-mini__line ra-mini__line--short"></span></div></div>
        </div>
        <div class="ra-motion__row">
          <div class="ra-motion__label"><p>${L('Entrada de gráfico', 'Chart entrance', 'Entrada de gráfico')}</p><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-ra-replay="chart">${icon('refresh', { size: 16 })}${L('Repetir', 'Replay', 'Repetir')}</button></div>
          <div class="ra-motion__cell"><div data-ra-chart="normal"></div></div>
          <div class="ra-motion__cell ra-reduced"><div data-ra-chart="reduced"></div></div>
        </div>
        <div class="ra-motion__row">
          <div class="ra-motion__label"><p>${L('Escrevendo…', 'Typing…', 'Escribiendo…')}</p></div>
          <div class="ra-motion__cell">${typingHtml(L('Lume está escrevendo', 'Lume is typing', 'Lume está escribiendo'))}</div>
          <div class="ra-motion__cell ra-reduced">${typingHtml(L('Lume está escrevendo', 'Lume is typing', 'Lume está escribiendo'))}</div>
        </div>
      </div>

      <h3 class="doc-subhead">${L('O que muda', 'What changes', 'Qué cambia')}</h3>
      <div class="doc-table ra-grid3" role="table" aria-label="${L('O que muda com movimento reduzido', 'What changes with reduced motion', 'Qué cambia con movimiento reducido')}">
        <div class="doc-table__head" role="row"><span role="columnheader">${L('Onde', 'Where', 'Dónde')}</span><span role="columnheader">${L('Com movimento', 'With motion', 'Con movimiento')}</span><span role="columnheader">${L('Reduzido', 'Reduced', 'Reducido')}</span></div>
        ${MOTION_CHANGES().map(([where, normal, reduced]) => `<div class="doc-table__row" role="row"><span role="rowheader" class="ra-grid3__name">${where}</span><span role="cell" class="ra-grid3__muted" data-label="${L('Com movimento', 'With motion', 'Con movimiento')}">${normal}</span><span role="cell" data-label="${L('Reduzido', 'Reduced', 'Reducido')}">${reduced}</span></div>`).join('')}
      </div>

      <h3 class="doc-subhead">${L('Durações e curvas', 'Durations and curves', 'Duraciones y curvas')}</h3>
      ${tokenTable([
        ['duration.fast', L('Hover, pequenas trocas de cor', 'Hover, small color changes', 'Hover, pequeños cambios de color')],
        ['duration.base', L('Menus, chips, campos', 'Menus, chips, fields', 'Menús, chips, campos')],
        ['duration.slow', L('Modais, painéis, troca de tema', 'Modals, panels, theme switch', 'Modales, paneles, cambio de tema')],
        ['duration.slower', L('Entrada de gráficos', 'Chart entrance', 'Entrada de gráficos')],
        ['easing.standard', L('A maioria das transições', 'Most transitions', 'La mayoría de las transiciones')],
        ['easing.emphasized', L('Entradas com mais presença', 'Entrances with more presence', 'Entradas con más presencia')],
      ])}`,
    )}

    ${section(
      'ra-pendencias',
      L('Pendências conhecidas', 'Known issues', 'Pendientes conocidos'),
      L('O que estava abaixo da regra e como foi resolvido, medido agora com os tokens atuais. Se algo voltar a falhar, o selo volta a “Aberta” sozinho — nada de esconder.', 'What was below the rule and how it was resolved, measured now with the current tokens. If something fails again, the badge goes back to “Open” on its own — no hiding.', 'Lo que estaba por debajo de la regla y cómo se resolvió, medido ahora con los tokens actuales. Si algo vuelve a fallar, el sello vuelve a “Abierto” solo — nada de esconder.'),
      `<div class="ra-issues">
        ${issueList
          .map(
            (it) => `<article class="ra-issue${it.open ? '' : ' ra-issue--done'}">
              <div class="ra-issue__head">
                <p class="ra-issue__title">${it.title}</p>
                ${it.open ? `<span class="ds-badge ds-badge--sm ds-badge--warning">${icon('alert-triangle', { size: 12 })}${L('Aberta', 'Open', 'Abierto')}</span>` : `<span class="ds-badge ds-badge--sm ds-badge--success">${icon('check', { size: 12 })}${L('Resolvida', 'Resolved', 'Resuelto')}</span>`}
              </div>
              <p class="ra-issue__rule">${it.rule}</p>
              <p class="ra-issue__text">${it.text}</p>
              <div class="ds-table-wrap ra-issue__table"><table class="ds-table ds-table--compact">
                <thead><tr><th scope="col">${L('Par', 'Pair', 'Par')}</th><th scope="col" class="ds-table__num">${modes[0][1]}</th><th scope="col" class="ds-table__num">${modes[1][1]}</th><th scope="col" class="ds-table__num">${modes[2][1]}</th></tr></thead>
                <tbody>${it.rows.join('')}</tbody></table></div>
              <p class="ra-issue__path">${it.path}</p>
            </article>`,
          )
          .join('')}
        <article class="ra-issue ra-issue--done">
          <div class="ra-issue__head">
            <p class="ra-issue__title">${L('Tooltip que some ao ser apontado', 'A tooltip that disappears when pointed at', 'Tooltip que desaparece al apuntarlo')}</p>
            <span class="ds-badge ds-badge--sm ds-badge--success">${icon('check', { size: 12 })}${L('Resolvida', 'Resolved', 'Resuelto')}</span>
          </div>
          <p class="ra-issue__rule">${L('WCAG 1.4.13 · conteúdo em hover ou foco', 'WCAG 1.4.13 · content on hover or focus', 'WCAG 1.4.13 · contenido con hover o foco')}</p>
          <p class="ra-issue__text">${L('Agora dá para levar o ponteiro até o balão sem ele sumir, ele fica aberto enquanto o gatilho estiver em hover ou foco, e <kbd class="ds-kbd">Esc</kbd> fecha sem mover o foco. Teste no botão de copiar em <a class="ra-link" href="#" data-goto="ra-foco">Foco e teclado</a>.', 'Now you can move the pointer to the bubble without it disappearing, it stays open while the trigger has hover or focus, and <kbd class="ds-kbd">Esc</kbd> closes it without moving focus. Try it on the copy button in <a class="ra-link" href="#" data-goto="ra-foco">Focus and keyboard</a>.', 'Ahora se puede llevar el puntero hasta el globo sin que desaparezca, queda abierto mientras el disparador tenga hover o foco, y <kbd class="ds-kbd">Esc</kbd> lo cierra sin mover el foco. Pruébalo en el botón de copiar en <a class="ra-link" href="#" data-goto="ra-foco">Foco y teclado</a>.')}</p>
        </article>
        <article class="ra-issue ra-issue--note">
          <div class="ra-issue__head">
            <p class="ra-issue__title">${L('Fora da regra, de propósito', 'Outside the rule, on purpose', 'Fuera de la regla, a propósito')}</p>
            <span class="ds-badge ds-badge--sm">${icon('info', { size: 12 })}${L('Nota', 'Note', 'Nota')}</span>
          </div>
          <p class="ra-issue__text">${L(`${ic('fg.disabled')} fica perto de ${num(measure('color.fg.disabled', 'color.bg.canvas', 'dark').ratio)}:1. A WCAG dispensa controles desativados — mas, se a pessoa precisa saber por que algo está desativado, diga em texto ao lado.`, `${ic('fg.disabled')} sits around ${num(measure('color.fg.disabled', 'color.bg.canvas', 'dark').ratio)}:1. WCAG exempts disabled controls — but if people need to know why something is disabled, say it in text next to it.`, `${ic('fg.disabled')} queda cerca de ${num(measure('color.fg.disabled', 'color.bg.canvas', 'dark').ratio)}:1. WCAG exime a los controles desactivados — pero, si la persona necesita saber por qué algo está desactivado, dilo en texto al lado.`)}</p>
        </article>
      </div>`,
    )}

    ${section(
      'ra-checklist',
      L('Checklist para cada tela', 'Checklist for every screen', 'Checklist para cada pantalla'),
      L('Antes de abrir o PR, passe por aqui. Marcar é só para você acompanhar — nada fica salvo.', 'Before opening the PR, go through this. Checking is just for you to keep track — nothing is saved.', 'Antes de abrir el PR, pasa por aquí. Marcar es solo para que lleves la cuenta — nada se guarda.'),
      `<div class="ra-checklist">
        <div class="ra-checklist__progress" data-ra-progress></div>
        <div class="ra-checklist__groups">
          ${CHECKLIST().map(
            ([group, items], g) => `<fieldset class="ra-checklist__group">
              <legend class="ra-checklist__legend"><span class="ds-section__stamp">0${g + 1}</span>${group}</legend>
              ${items.map((text) => `<label class="ds-checkbox ra-checklist__item"><input type="checkbox" class="ds-checkbox__input" data-ra-check><span class="ds-choice__text"><span class="ds-choice__label">${text}</span></span></label>`).join('')}
            </fieldset>`,
          ).join('')}
        </div>
        <div class="ra-checklist__foot">
          <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-ra-clear>${icon('x', { size: 16 })}${L('Desmarcar tudo', 'Uncheck all', 'Desmarcar todo')}</button>
        </div>
      </div>
      <h3 class="doc-subhead">${L('Acessibilidade de cada peça', 'Accessibility of each piece', 'Accesibilidad de cada pieza')}</h3>
      <p class="ra-links-lead">${L('Cada página de componente e padrão tem a própria seção de acessibilidade, com teclado e leitores de tela.', 'Each component and pattern page has its own accessibility section, with keyboard and screen readers.', 'Cada página de componente y patrón tiene su propia sección de accesibilidad, con teclado y lectores de pantalla.')}</p>
      <div class="ra-links">${COMPONENT_LINKS().map(([label, href]) => `<a class="ds-chip ds-chip--sm" href="#${href}">${label}${icon('arrow-up-right', { size: 14 })}</a>`).join('')}</div>`,
    )}

    ${section(
      'ra-testar',
      L('Como testar', 'How to test', 'Cómo probar'),
      L('Ferramenta automática pega uma parte; o resto pede usar a tela do jeito que outras pessoas usam. Dez minutos por tela já pegam a maioria dos problemas.', 'Automated tools catch part of it; the rest takes using the screen the way other people do. Ten minutes per screen catches most problems.', 'La herramienta automática detecta una parte; el resto pide usar la pantalla como la usan otras personas. Diez minutos por pantalla ya detectan la mayoría de los problemas.'),
      `<div class="ra-tools">
        ${[
          ['keyboard', L('Só teclado', 'Keyboard only', 'Solo teclado'), L('Guarde o mouse. Chegue a tudo com Tab, setas, Enter e Esc — e veja sempre onde está o foco.', 'Put the mouse away. Reach everything with Tab, the arrows, Enter, and Esc — and always see where focus is.', 'Guarda el mouse. Llega a todo con Tab, flechas, Enter y Esc — y mira siempre dónde está el foco.')],
          ['mic', L('Leitor de tela', 'Screen reader', 'Lector de pantalla'), L('VoiceOver no Mac (⌘ F5) ou NVDA no Windows. Navegue por títulos e marcos; ouça se os nomes fazem sentido.', 'VoiceOver on Mac (⌘ F5) or NVDA on Windows. Navigate by headings and landmarks; listen for whether the names make sense.', 'VoiceOver en Mac (⌘ F5) o NVDA en Windows. Navega por títulos y puntos de referencia; escucha si los nombres tienen sentido.')],
          ['search', L('Zoom e tela estreita', 'Zoom and narrow screen', 'Zoom y pantalla estrecha'), L('Zoom de 200% e janela de 320 px: nada pode sumir ou exigir rolagem lateral.', '200% zoom and a 320 px window: nothing may disappear or require horizontal scrolling.', 'Zoom de 200% y ventana de 320 px: nada puede desaparecer ni exigir desplazamiento lateral.')],
          ['monitor', L('Alto contraste', 'High contrast', 'Alto contraste'), L('Ative o contraste do sistema (forced-colors). Bordas e foco precisam continuar visíveis.', 'Turn on the system contrast (forced-colors). Borders and focus need to stay visible.', 'Activa el contraste del sistema (forced-colors). Bordes y foco tienen que seguir visibles.')],
          ['eye', L('Visão de cor', 'Color vision', 'Visión de color'), L('No DevTools, Rendering › Emulate vision deficiencies. Status e séries precisam se ler sem a cor.', 'In DevTools, Rendering › Emulate vision deficiencies. Status and series need to read without color.', 'En DevTools, Rendering › Emulate vision deficiencies. Estados y series tienen que leerse sin el color.')],
          ['motion', L('Movimento reduzido', 'Reduced motion', 'Movimiento reducido'), L('Ligue nos ajustes do sistema (ou emule no DevTools) e confira que nada se anima sozinho.', 'Turn it on in the system settings (or emulate it in DevTools) and check that nothing animates on its own.', 'Actívalo en los ajustes del sistema (o emúlalo en DevTools) y revisa que nada se anime solo.')],
        ]
          .map(
            ([glyph, title, text]) => `<article class="ra-tool">
              <span class="ra-tool__icon">${icon(glyph, { size: 20 })}</span>
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
  const modes = MODES();

  /* Verificador */
  const fgSel = root.querySelector('[data-ra-fg]');
  const bgSel = root.querySelector('[data-ra-bg]');
  const results = root.querySelector('[data-ra-results]');
  const note = root.querySelector('[data-ra-note]');
  const renderResults = () => {
    const fg = fgSel.value;
    const bg = bgSel.value;
    results.innerHTML = modes.map(([mode, label]) => resultCard(fg, bg, mode, label)).join('');
    const alpha = [fg, bg].filter((n) => parse(valueOf(n, 'dark')).a < 1 || parse(valueOf(n, 'light')).a < 1);
    if (!alpha.length) {
      note.textContent = '';
      return;
    }
    const list = alpha.map(short).join(L(' e ', ' and ', ' y '));
    const over = alpha.includes(bg) ? L('o canvas', 'the canvas', 'el canvas') : L('o fundo escolhido', 'the chosen background', 'el fondo elegido');
    note.textContent =
      alpha.length > 1
        ? L(`${list} têm transparência: a cor foi composta sobre ${over}, como no build.`, `${list} have transparency: the color was composited over ${over}, as in the build.`, `${list} tienen transparencia: el color se compuso sobre ${over}, como en el build.`)
        : L(`${list} tem transparência: a cor foi composta sobre ${over}, como no build.`, `${list} has transparency: the color was composited over ${over}, as in the build.`, `${list} tiene transparencia: el color se compuso sobre ${over}, como en el build.`);
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
      group.label = L('Invertidos', 'Swapped', 'Invertidos');
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
  cleanups.push(followSiteTheme(root, '[data-ra-stage]', 'ra-theme'));

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
    const text = on
      ? L('Seu sistema está <strong>pedindo menos movimento</strong> — a coluna “Com movimento” também fica parada, como deve.', 'Your system is <strong>asking for less motion</strong> — the “With motion” column stays still too, as it should.', 'Tu sistema está <strong>pidiendo menos movimiento</strong> — la columna “Con movimiento” también queda quieta, como debe.')
      : L('Seu sistema está com o <strong>movimento normal</strong>. A coluna da direita mostra como fica para quem pede menos.', 'Your system has <strong>normal motion</strong>. The right column shows how it looks for people who ask for less.', 'Tu sistema tiene el <strong>movimiento normal</strong>. La columna de la derecha muestra cómo queda para quien pide menos.');
    pref.innerHTML = `${icon(on ? 'check-circle' : 'info', { size: 16 })}<span>${text}</span>`;
    pref.dataset.on = String(on);
  };
  showPref();
  reducedQuery.addEventListener('change', showPref);
  cleanups.push(() => reducedQuery.removeEventListener('change', showPref));

  const chartData = { categories: weekdays().slice(0, 5), series: [{ name: L('Pedidos', 'Orders', 'Pedidos'), values: [32, 41, 38, 52, 47] }] };
  const charts = ['normal', 'reduced'].map((kind) =>
    barChart(root.querySelector(`[data-ra-chart="${kind}"]`), { ...chartData, label: kind === 'normal' ? L('Exemplo com movimento', 'Example with motion', 'Ejemplo con movimiento') : L('Exemplo com movimento reduzido', 'Example with reduced motion', 'Ejemplo con movimiento reducido'), height: 132, table: false }),
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
  const total = checks.length;
  const renderProgress = () => {
    const done = checks.filter((c) => c.checked).length;
    progress.innerHTML = meter({
      label: done === total ? L('Tudo conferido', 'All checked', 'Todo revisado') : L('Conferido nesta tela', 'Checked on this screen', 'Revisado en esta pantalla'),
      value: done,
      max: total,
      format: (v) => String(v),
      thresholds: null,
      tone: done === total ? 'success' : undefined,
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
