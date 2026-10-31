import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList, escapeHtml } from '../component-doc.js';
import { navigation } from '../nav.js';
import { releases, CURRENT_VERSION, TYPES } from '../changelog.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-contribuir.css'];

/* ───────── Dados ───────── */

const countGroup = (id) => navigation.find((g) => g.id === id)?.items.length ?? 0;

const STAGES = () => [
  {
    name: L('Ideia', 'Idea', 'Idea'),
    text: L('Um problema que aparece em mais de uma tela — ou uma peça que três times já desenharam cada um do seu jeito.', 'A problem that shows up on more than one screen — or a piece three teams have already drawn, each in their own way.', 'Un problema que aparece en más de una pantalla — o una pieza que tres equipos ya diseñaron cada uno a su manera.'),
    who: L('Qualquer pessoa do time', 'Anyone on the team', 'Cualquier persona del equipo'),
    out: L('Uma nota com exemplos reais', 'A note with real examples', 'Una nota con ejemplos reales'),
  },
  {
    name: L('Proposta', 'Proposal', 'Propuesta'),
    text: L('O modelo preenchido: o problema, quem usa, o que já existe e o impacto em tokens e acessibilidade.', 'The filled-in template: the problem, who uses it, what already exists, and the impact on tokens and accessibility.', 'La plantilla completa: el problema, quién lo usa, lo que ya existe y el impacto en tokens y accesibilidad.'),
    who: L('Quem teve a ideia + alguém do Órbita', 'Whoever had the idea + someone from Órbita', 'Quien tuvo la idea + alguien de Órbita'),
    out: L('Aceita, ajustada ou recusada com motivo', 'Accepted, adjusted, or declined with a reason', 'Aceptada, ajustada o rechazada con motivo'),
  },
  {
    name: L('Rascunho', 'Draft', 'Borrador'),
    text: L('Tokens, CSS, JS e a página com playground. Estados forçados com data-state, nos dois temas.', 'Tokens, CSS, JS, and the page with a playground. States forced with data-state, in both themes.', 'Tokens, CSS, JS y la página con playground. Estados forzados con data-state, en los dos temas.'),
    who: L('Quem vai construir', 'Whoever will build it', 'Quien lo va a construir'),
    out: L('Pull request em rascunho', 'A draft pull request', 'Pull request en borrador'),
  },
  {
    name: L('Revisão', 'Review', 'Revisión'),
    text: L('Uma pessoa olha o design, outra o código. Os dois passam pelo mesmo checklist.', 'One person looks at the design, another at the code. Both go through the same checklist.', 'Una persona mira el diseño, otra el código. Los dos pasan por el mismo checklist.'),
    who: L('Duas pessoas, design e código', 'Two people, design and code', 'Dos personas, diseño y código'),
    out: L('Aprovado ou pedidos de ajuste', 'Approved or change requests', 'Aprobado o pedidos de ajuste'),
  },
  {
    name: L('Publicado', 'Published', 'Publicado'),
    text: L('Entra em Novidades com uma versão nova. A bolinha da sidebar avisa todo mundo.', 'It goes into What’s new with a new version. The dot in the sidebar lets everyone know.', 'Entra en Novedades con una versión nueva. El puntito de la sidebar avisa a todo el mundo.'),
    who: L('Quem mantém o Órbita', 'Whoever maintains Órbita', 'Quien mantiene Órbita'),
    out: L(`Versão nova — hoje, ${CURRENT_VERSION}`, `A new version — today, ${CURRENT_VERSION}`, `Versión nueva — hoy, ${CURRENT_VERSION}`),
  },
];

const KINDS = () => [
  ['droplet', 'Token', L('Muda só um valor — uma cor, um espaço, um raio — e vale para o sistema todo.', 'Changes just one value — a color, a space, a radius — and applies to the whole system.', 'Cambia solo un valor — un color, un espacio, un radio — y vale para todo el sistema.'), L('color.chart.status.critical nasceu porque o vermelho de perigo parecia o pêssego no escuro.', 'color.chart.status.critical was born because the danger red looked like the peach in dark mode.', 'color.chart.status.critical nació porque el rojo de peligro se parecía al durazno en el oscuro.')],
  ['shapes', L('Variante', 'Variant', 'Variante'), L('O mesmo componente com outro peso, tamanho ou tom. Mesma anatomia, mesmo teclado.', 'The same component with another weight, size, or tone. Same anatomy, same keyboard.', 'El mismo componente con otro peso, tamaño o tono. Misma anatomía, mismo teclado.'), L('ds-btn--danger é um botão; só muda a intenção.', 'ds-btn--danger is a button; only the intent changes.', 'ds-btn--danger es un botón; solo cambia la intención.')],
  ['layers', L('Padrão', 'Pattern', 'Patrón'), L('Uma combinação de peças que já existem, com regras de uso. Não cria CSS novo — ou cria pouco.', 'A combination of pieces that already exist, with usage rules. It adds no new CSS — or very little.', 'Una combinación de piezas que ya existen, con reglas de uso. No crea CSS nuevo — o crea poco.'), L('Formulários: campos + validação + resumo de erros.', 'Forms: fields + validation + error summary.', 'Formularios: campos + validación + resumen de errores.')],
  ['component', L('Componente', 'Component', 'Componente'), L('Uma peça nova, com anatomia, estados e acessibilidade próprios.', 'A new piece, with its own anatomy, states, and accessibility.', 'Una pieza nueva, con anatomía, estados y accesibilidad propios.'), L('ds-alert entrou na 0.3 porque nenhum componente dava um aviso inline.', 'ds-alert arrived in 0.3 because no component gave an inline notice.', 'ds-alert entró en la 0.3 porque ningún componente daba un aviso inline.')],
];

/* Ajudante "isso é do design system?" — perguntas em sequência até uma recomendação */
const QUESTIONS = () => [
  { id: 'repete', text: L('Aparece em mais de uma tela ou produto?', 'Does it appear on more than one screen or product?', '¿Aparece en más de una pantalla o producto?'), hint: L('Ou vai aparecer logo — não só "um dia, talvez".', 'Or will soon — not just "someday, maybe".', 'O va a aparecer pronto — no solo "algún día, quizás".'), no: 'local' },
  { id: 'valor', text: L('A diferença é só um valor — uma cor, um espaço, um raio?', 'Is the difference just a value — a color, a space, a radius?', '¿La diferencia es solo un valor — un color, un espacio, un radio?'), yes: 'token' },
  { id: 'mesmo', text: L('É um componente que já existe, com outro peso, tamanho ou tom?', 'Is it an existing component with another weight, size, or tone?', '¿Es un componente que ya existe, con otro peso, tamaño o tono?'), yes: 'variante' },
  { id: 'monta', text: L('Dá para montar com peças que já existem?', 'Can it be built from pieces that already exist?', '¿Se puede armar con piezas que ya existen?'), yes: 'padrao', no: 'componente' },
];

const RESULTS = () => ({
  local: {
    tone: 'info',
    icon: 'info',
    title: L('Fica no produto, por enquanto', 'It stays in the product, for now', 'Se queda en el producto, por ahora'),
    text: L('Construa com os tokens e componentes do Órbita e anote onde usou. Quando aparecer na segunda tela, volte aqui.', 'Build it with Órbita’s tokens and components and note where you used it. When it shows up on a second screen, come back here.', 'Constrúyelo con los tokens y componentes de Órbita y anota dónde lo usaste. Cuando aparezca en una segunda pantalla, vuelve aquí.'),
  },
  token: {
    tone: 'success',
    icon: 'droplet',
    title: L('Um token — ou um que já existe', 'A token — or one that already exists', 'Un token — o uno que ya existe'),
    text: L('Procure em Fundamentos › Cores antes. Se faltar, proponha um token semântico (nunca uma cor solta no CSS) com o contraste conferido no build.', 'Look in Foundations › Color first. If it’s missing, propose a semantic token (never a loose color in the CSS) with its contrast checked in the build.', 'Busca primero en Fundamentos › Color. Si falta, propón un token semántico (nunca un color suelto en el CSS) con el contraste revisado en el build.'),
    href: '/fundamentos/cores',
    link: L('Ver tokens de cor', 'See color tokens', 'Ver tokens de color'),
  },
  variante: {
    tone: 'success',
    icon: 'shapes',
    title: L('Uma variante', 'A variant', 'Una variante'),
    text: L('Proponha um modificador (ds-bloco--nome) no componente que já existe. A anatomia, os estados e o teclado continuam os mesmos.', 'Propose a modifier (ds-block--name) on the existing component. The anatomy, states, and keyboard stay the same.', 'Propón un modificador (ds-bloque--nombre) en el componente que ya existe. La anatomía, los estados y el teclado siguen iguales.'),
    href: '/componentes/botao',
    link: L('Ver como o Botão documenta variantes', 'See how Button documents variants', 'Ver cómo el Botón documenta variantes'),
  },
  padrao: {
    tone: 'success',
    icon: 'layers',
    title: L('Um padrão', 'A pattern', 'Un patrón'),
    text: L('Documente a combinação em Padrões: quando usar, como as peças conversam e um exemplo que funciona. CSS novo, só o que faltar.', 'Document the combination in Patterns: when to use it, how the pieces work together, and a working example. New CSS only for what’s missing.', 'Documenta la combinación en Patrones: cuándo usarla, cómo se relacionan las piezas y un ejemplo que funcione. CSS nuevo, solo lo que falte.'),
    href: '/padroes/formularios',
    link: L('Ver um padrão pronto', 'See a finished pattern', 'Ver un patrón listo'),
  },
  componente: {
    tone: 'warning',
    icon: 'component',
    title: L('Um componente novo — abra uma proposta', 'A new component — open a proposal', 'Un componente nuevo — abre una propuesta'),
    text: L('É o caminho mais longo, e tudo bem. Use o modelo abaixo: problema, quem usa, alternativas, tokens e acessibilidade.', 'It’s the longest path, and that’s fine. Use the template below: problem, who uses it, alternatives, tokens, and accessibility.', 'Es el camino más largo, y está bien. Usa la plantilla de abajo: problema, quién lo usa, alternativas, tokens y accesibilidad.'),
    href: null,
    link: L('Ir para o modelo', 'Go to the template', 'Ir a la plantilla'),
    target: 'rc-modelo',
  },
});

const TEMPLATE = () =>
  L(
    `## Proposta: <nome da peça>

### Problema
O que acontece hoje e onde. Links ou prints de pelo menos duas telas.

### Quem usa
Times, produtos e com que frequência.

### O que já existe
Componentes, padrões ou tokens do Órbita que chegam perto — e por que não bastam.

### Proposta
Anatomia, variantes e estados (normal, hover, pressionado, foco, desativado, erro).

### Alternativas
O que mais foi considerado e por que ficou de fora.

### Impacto em tokens
Tokens novos ou alterados. Contraste nos dois temas.

### Acessibilidade
Papel ARIA, teclado, foco, leitor de tela e movimento reduzido.

### Fora do escopo
O que esta proposta não resolve.`,
    `## Proposal: <name of the piece>

### Problem
What happens today and where. Links or screenshots from at least two screens.

### Who uses it
Teams, products, and how often.

### What already exists
Órbita components, patterns, or tokens that come close — and why they aren’t enough.

### Proposal
Anatomy, variants, and states (default, hover, pressed, focus, disabled, error).

### Alternatives
What else was considered and why it was left out.

### Token impact
New or changed tokens. Contrast in both themes.

### Accessibility
ARIA role, keyboard, focus, screen reader, and reduced motion.

### Out of scope
What this proposal doesn’t solve.`,
    `## Propuesta: <nombre de la pieza>

### Problema
Qué pasa hoy y dónde. Enlaces o capturas de al menos dos pantallas.

### Quién lo usa
Equipos, productos y con qué frecuencia.

### Lo que ya existe
Componentes, patrones o tokens de Órbita que se acercan — y por qué no alcanzan.

### Propuesta
Anatomía, variantes y estados (normal, hover, presionado, foco, desactivado, error).

### Alternativas
Qué más se consideró y por qué quedó fuera.

### Impacto en tokens
Tokens nuevos o modificados. Contraste en los dos temas.

### Accesibilidad
Rol ARIA, teclado, foco, lector de pantalla y movimiento reducido.

### Fuera de alcance
Lo que esta propuesta no resuelve.`,
  );

const code = (t) => `<code class="ds-inline-code">${escapeHtml(t)}</code>`;

const RULES = () => [
  ['package', L('Zero dependências', 'Zero dependencies', 'Cero dependencias'), L(`HTML, CSS e JavaScript nativos. Nada de ${code('npm install')} para usar — os scripts de Node só geram tokens e servem o site.`, `Native HTML, CSS, and JavaScript. No ${code('npm install')} to use it — the Node scripts only generate tokens and serve the site.`, `HTML, CSS y JavaScript nativos. Nada de ${code('npm install')} para usarlo — los scripts de Node solo generan tokens y sirven el sitio.`)],
  ['droplet', L('Só tokens semânticos', 'Semantic tokens only', 'Solo tokens semánticos'), L(`Componentes leem ${code('var(--ds-color-fg-muted)')}, nunca um hex nem uma paleta crua como ${code('--ds-color-neutral-400')}.`, `Components read ${code('var(--ds-color-fg-muted)')}, never a hex or a raw palette like ${code('--ds-color-neutral-400')}.`, `Los componentes leen ${code('var(--ds-color-fg-muted)')}, nunca un hex ni una paleta cruda como ${code('--ds-color-neutral-400')}.`)],
  ['code', L('Nomes ds-bloco__parte--variação', 'Names ds-block__part--variation', 'Nombres ds-bloque__parte--variación'), L(`${code('.ds-panel__header')}, ${code('.ds-btn--primary')}. O prefixo ${code('ds-')} é do sistema; páginas da documentação usam o próprio prefixo.`, `${code('.ds-panel__header')}, ${code('.ds-btn--primary')}. The ${code('ds-')} prefix belongs to the system; documentation pages use their own prefix.`, `${code('.ds-panel__header')}, ${code('.ds-btn--primary')}. El prefijo ${code('ds-')} es del sistema; las páginas de la documentación usan su propio prefijo.`)],
  ['eye', L('Estados forçados com data-state', 'States forced with data-state', 'Estados forzados con data-state'), L(`${code('data-state="hover|pressed|focus"')} desenha o estado sem interação — para documentar e testar.`, `${code('data-state="hover|pressed|focus"')} draws the state without interaction — for documenting and testing.`, `${code('data-state="hover|pressed|focus"')} dibuja el estado sin interacción — para documentar y probar.`)],
  ['accessibility', L('Padrões ARIA de verdade', 'Real ARIA patterns', 'Patrones ARIA de verdad'), L('combobox e listbox na Seleção, menu no Menu, tablist nas Abas, dialog no Modal, status no Toast.', 'combobox and listbox in Select, menu in Menu, tablist in Tabs, dialog in Modal, status in Toast.', 'combobox y listbox en el Selector, menu en el Menú, tablist en las Pestañas, dialog en el Modal, status en el Toast.')],
  ['refresh', L('Tudo que liga, desliga', 'Whatever turns on, turns off', 'Todo lo que se enciende, se apaga'), L(`Módulos devolvem ${code('destroy()')} ou uma função de limpeza: listeners, timers e observadores saem junto.`, `Modules return ${code('destroy()')} or a cleanup function: listeners, timers, and observers go with it.`, `Los módulos devuelven ${code('destroy()')} o una función de limpieza: listeners, timers y observadores se van junto.`)],
];

const tokenCode = () => `// tokens/semantic.json — ${L('a fonte da verdade', 'the source of truth', 'la fuente de la verdad')}
"chart": {
  "grid": { "dark": "{color.neutral.800}", "light": "{color.neutral.200}" }
}

// ${L('e, se for cor de marca ou texto, a checagem de contraste:', 'and, for a brand or text color, the contrast check:', 'y, si es color de marca o de texto, la verificación de contraste:')}
"$checks": [["color.chart.series.1", "color.bg.surface", 3]]`;

/* saída do script, que escreve em português */
const TOKEN_RUN = `npm run tokens
# ✓ tokens: … tokens, 13 paletas → ds/tokens.css, ds/tokens.js
#   contraste: …/… combinações atingem o mínimo`;

const cssCode = () => `/*
 * ${L('Alerta — mensagem inline com tom, ícone, título, texto e ações.', 'Alert — an inline message with tone, icon, title, text, and actions.', 'Alerta — mensaje inline con tono, ícono, título, texto y acciones.')}
 *
 * <div class="ds-alert ds-alert--danger" role="alert">…</div>
 *
 * ${L('Tons: neutro (padrão) · --info · --success · --warning · --danger.', 'Tones: neutral (default) · --info · --success · --warning · --danger.', 'Tonos: neutro (predeterminado) · --info · --success · --warning · --danger.')}
 */
.ds-alert {
  padding: var(--ds-space-200) var(--ds-space-250);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-color-bg-surface);
  border: 1px solid var(--ds-color-border-subtle);
}

/* ${L('e no ponto de entrada, ds/ds.css', 'and in the entry point, ds/ds.css', 'y en el punto de entrada, ds/ds.css')} */
@import url("./components/alert.css");`;

/* Nome de exemplo no idioma da página: meu-componente, my-component, mi-componente */
const sample = () => ({
  file: L('meu-componente', 'my-component', 'mi-componente'),
  fn: L('createMeuComponente', 'createMyComponent', 'createMiComponente'),
});

const jsCode = () => `// ds/js/${sample().file}.js
export function ${sample().fn}(el, { onChange } = {}) {
  const onClick = (event) => { /* … */ onChange?.(); };
  el.addEventListener('click', onClick);

  return {
    destroy() {
      el.removeEventListener('click', onClick);
    },
  };
}`;

const iconCode = () => `// ds/icons/icons.js — ${L('grid de 24, traço 1,5, pontas redondas, currentColor', '24 grid, 1.5 stroke, round caps, currentColor', 'cuadrícula de 24, trazo 1,5, puntas redondas, currentColor')}
// ${L('[nome, categoria, palavras-chave em português, desenho]', '[name, category, Portuguese keywords, drawing]', '[nombre, categoría, palabras clave en portugués, dibujo]')}
['send', 'acoes', 'enviar mensagem avião', path('M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z')],

// site/icon-keywords.js — ${L('as palavras-chave em inglês e espanhol', 'the English and Spanish keywords', 'las palabras clave en inglés y español')}
send: ['send message plane', 'enviar mensaje avión'],`;

const pageCode = () => `// site/pages/${sample().file}.js
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/${sample().file}.css'];

export default function render(page) {
  return \`<div class="page doc">
    <h1 class="doc-header__title">\${page.label}</h1>
    <p>\${L('Olá', 'Hello', 'Hola')}</p>
  </div>\`;
}

export function mount(root) {
  const offNav = mountDocNav(root);
  const offCopy = mountCodeCopy(root);
  return () => { offNav(); offCopy(); };
}`;

const navCode = () => `// site/nav.js — ${L('textos em T(pt-BR, en, es)', 'text in T(pt-BR, en, es)', 'textos en T(pt-BR, en, es)')}
{
  label: T('Meu componente', 'My component', 'Mi componente'),
  icon: 'component',
  path: '/componentes/${sample().file}',
  load: () => import('./pages/${sample().file}.js'),
  description: T('Uma frase sobre para que serve.', 'One sentence on what it’s for.', 'Una frase sobre para qué sirve.'),
}`;

const BUILD_STEPS = () => [
  [L('Token, se faltar', 'A token, if one is missing', 'Token, si falta'), L('Edite o JSON em tokens/ e rode o build. Nunca edite ds/tokens.css nem ds/tokens.js — eles são gerados e o servidor de desenvolvimento os refaz a cada mudança.', 'Edit the JSON in tokens/ and run the build. Never edit ds/tokens.css or ds/tokens.js — they’re generated, and the development server rebuilds them on every change.', 'Edita el JSON en tokens/ y corre el build. Nunca edites ds/tokens.css ni ds/tokens.js — se generan y el servidor de desarrollo los rehace con cada cambio.'), [tokenCode(), TOKEN_RUN]],
  [L('O CSS', 'The CSS', 'El CSS'), L('Um arquivo por componente em ds/components/, com o markup no comentário do topo, e uma linha de import em ds/ds.css.', 'One file per component in ds/components/, with the markup in the top comment, and an import line in ds/ds.css.', 'Un archivo por componente en ds/components/, con el markup en el comentario de arriba, y una línea de import en ds/ds.css.'), [cssCode()]],
  [L('O JavaScript, se for interativo', 'The JavaScript, if it’s interactive', 'El JavaScript, si es interactivo'), L('Um módulo em ds/js/ que liga o comportamento e devolve como desligar.', 'A module in ds/js/ that turns the behavior on and returns how to turn it off.', 'Un módulo en ds/js/ que enciende el comportamiento y devuelve cómo apagarlo.'), [jsCode()]],
  [L('Ícones novos', 'New icons', 'Íconos nuevos'), L('Entram na lista de ds/icons/icons.js, com as palavras-chave em inglês e espanhol em site/icon-keywords.js, e já aparecem na busca de Ícones.', 'They go into the list in ds/icons/icons.js, with English and Spanish keywords in site/icon-keywords.js, and show up in the Icons search right away.', 'Entran en la lista de ds/icons/icons.js, con las palabras clave en inglés y español en site/icon-keywords.js, y ya aparecen en la búsqueda de Íconos.'), [iconCode()]],
  [L('A página', 'The page', 'La página'), L('Componentes seguem a página do Botão: playground com código, variantes, tamanhos, estados, anatomia, acessibilidade, tokens e uso. Todo texto vai nos três idiomas.', 'Components follow the Button page: playground with code, variants, sizes, states, anatomy, accessibility, tokens, and usage. All text goes in all three languages.', 'Los componentes siguen la página del Botón: playground con código, variantes, tamaños, estados, anatomía, accesibilidad, tokens y uso. Todo texto va en los tres idiomas.'), [pageCode(), navCode()]],
];

const CHECKLIST = () => [
  {
    id: 'visual',
    name: 'Visual',
    items: [
      [L('Plano', 'Flat', 'Plano'), L('Sem degradê, vidro, brilho, blur ou imagem de fundo.', 'No gradient, glass, glow, blur, or background image.', 'Sin degradado, vidrio, brillo, blur ni imagen de fondo.')],
      [L('Só tokens', 'Tokens only', 'Solo tokens'), L('Nenhum hex, px de cor ou paleta crua no CSS do componente.', 'No hex, hard-coded color, or raw palette in the component’s CSS.', 'Ningún hex, color fijo ni paleta cruda en el CSS del componente.')],
      [L('Dois temas', 'Both themes', 'Dos temas'), L('Conferido no escuro e no claro, inclusive com tema aninhado.', 'Checked in dark and light, including with a nested theme.', 'Revisado en el oscuro y en el claro, incluso con tema anidado.')],
      [L('Todos os estados', 'Every state', 'Todos los estados'), L('Normal, hover, pressionado, foco, desativado e erro — com data-state.', 'Default, hover, pressed, focus, disabled, and error — with data-state.', 'Normal, hover, presionado, foco, desactivado y error — con data-state.')],
    ],
  },
  {
    id: 'a11y',
    name: L('Acessibilidade', 'Accessibility', 'Accesibilidad'),
    items: [
      [L('Contraste', 'Contrast', 'Contraste'), L('Texto ≥ 4,5:1 e contornos e ícones ≥ 3:1, nos dois temas.', 'Text ≥ 4.5:1 and outlines and icons ≥ 3:1, in both themes.', 'Texto ≥ 4,5:1 y contornos e íconos ≥ 3:1, en los dos temas.')],
      [L('Teclado', 'Keyboard', 'Teclado'), L('Tudo alcançável com Tab; setas, Enter, Espaço e Esc onde o padrão ARIA pede.', 'Everything reachable with Tab; arrows, Enter, Space, and Esc where the ARIA pattern calls for them.', 'Todo alcanzable con Tab; flechas, Enter, Espacio y Esc donde el patrón ARIA lo pide.')],
      [L('Nomes', 'Names', 'Nombres'), L('Botões de ícone com aria-label; campos com rótulo de verdade.', 'Icon buttons with aria-label; fields with a real label.', 'Botones de ícono con aria-label; campos con etiqueta de verdad.')],
      [L('Movimento', 'Motion', 'Movimiento'), L('prefers-reduced-motion respeitado; nada pisca nem anima sem motivo.', 'prefers-reduced-motion respected; nothing flashes or animates without a reason.', 'prefers-reduced-motion respetado; nada parpadea ni se anima sin motivo.')],
    ],
  },
  {
    id: 'codigo',
    name: L('Código', 'Code', 'Código'),
    items: [
      [L('Sem dependências', 'No dependencies', 'Sin dependencias'), L('Nada novo em package.json, nenhum script de terceiros.', 'Nothing new in package.json, no third-party scripts.', 'Nada nuevo en package.json, ningún script de terceros.')],
      [L('Limpeza', 'Cleanup', 'Limpieza'), L('destroy() ou a função de mount remove listeners, timers e observadores.', 'destroy() or the mount function removes listeners, timers, and observers.', 'destroy() o la función de mount quita listeners, timers y observadores.')],
      [L('Ids únicos', 'Unique ids', 'Ids únicos'), L('Nenhum id repetido na página, nem colidindo com os do app.', 'No repeated id on the page, and none colliding with the app’s.', 'Ningún id repetido en la página, ni chocando con los de la app.')],
      [L('Console limpo', 'Clean console', 'Consola limpia'), L('Nenhum erro ou aviso no navegador.', 'No errors or warnings in the browser.', 'Ningún error ni aviso en el navegador.')],
    ],
  },
  {
    id: 'docs',
    name: L('Documentação', 'Documentation', 'Documentación'),
    items: [
      [L('Página', 'Page', 'Página'), L('Ligada em site/nav.js com load e uma descrição de uma frase.', 'Wired in site/nav.js with load and a one-sentence description.', 'Conectada en site/nav.js con load y una descripción de una frase.')],
      [L('Três idiomas', 'Three languages', 'Tres idiomas'), L('Textos em português, inglês e espanhol; números e datas pelo idioma atual.', 'Text in Portuguese, English, and Spanish; numbers and dates in the current language.', 'Textos en portugués, inglés y español; números y fechas según el idioma actual.')],
      ['Playground', L('Controles, os dois temas e o código exato do que está no palco.', 'Controls, both themes, and the exact code for what’s on stage.', 'Controles, los dos temas y el código exacto de lo que está en escena.')],
      [L('Uso', 'Usage', 'Uso'), L('Faça e evite com exemplos — e quando não usar.', 'Do and don’t with examples — and when not to use it.', 'Haz y evita con ejemplos — y cuándo no usarlo.')],
      [L('Novidades', 'What’s new', 'Novedades'), L('Entrada em site/changelog.js com o link para a página.', 'An entry in site/changelog.js with the link to the page.', 'Entrada en site/changelog.js con el enlace a la página.')],
    ],
  },
];
const total = (list) => list.reduce((n, g) => n + g.items.length, 0);

const BLOCKERS = () => [
  L('Qualquer ✗ no relatório de contraste do build', 'Any ✗ in the build’s contrast report', 'Cualquier ✗ en el informe de contraste del build'),
  L('Cor, espaço ou raio fixo no CSS em vez de token', 'A hard-coded color, space, or radius in the CSS instead of a token', 'Color, espacio o radio fijo en el CSS en vez de token'),
  L('Uma dependência nova', 'A new dependency', 'Una dependencia nueva'),
  L('Algo que só funciona com mouse', 'Something that only works with a mouse', 'Algo que solo funciona con mouse'),
  L('Página sem playground ou sem a seção de acessibilidade', 'A page without a playground or the accessibility section', 'Página sin playground o sin la sección de accesibilidad'),
  L('Erro no console ou id duplicado', 'A console error or a duplicate id', 'Error en la consola o id duplicado'),
];

const SEMVER = () => [
  ['1.0.0', 0, L('Maior', 'Major', 'Mayor'), L('Muda algo que você usa: um nome de classe, um token removido. Vem com guia de migração.', 'Changes something you use: a class name, a removed token. Comes with a migration guide.', 'Cambia algo que usas: un nombre de clase, un token eliminado. Viene con guía de migración.')],
  ['0.3.0', 1, L('Menor', 'Minor', 'Menor'), L('Coisas novas sem quebrar nada: uma seção, um componente, tokens novos.', 'New things without breaking anything: a section, a component, new tokens.', 'Cosas nuevas sin romper nada: una sección, un componente, tokens nuevos.')],
  ['0.3.1', 2, L('Correção', 'Patch', 'Parche'), L('Ajustes e bugs. Ninguém precisa mudar nada.', 'Tweaks and bugs. Nobody needs to change anything.', 'Ajustes y bugs. Nadie necesita cambiar nada.')],
];

const TYPE_INFO = () => ({
  novo: [L('Novo', 'New', 'Nuevo'), L('Algo que não existia: componente, página, token, ícone.', 'Something that didn’t exist: a component, page, token, icon.', 'Algo que no existía: componente, página, token, ícono.')],
  melhoria: [L('Melhoria', 'Improvement', 'Mejora'), L('Algo que existia e ficou melhor, sem mudar como se usa.', 'Something that existed and got better, without changing how it’s used.', 'Algo que existía y mejoró, sin cambiar cómo se usa.')],
  correcao: [L('Correção', 'Fix', 'Corrección'), L('Algo que estava errado e agora está certo.', 'Something that was wrong and is now right.', 'Algo que estaba mal y ahora está bien.')],
});

const changelogCode = () => `// site/changelog.js
export const CURRENT_VERSION = '0.5.0';   // ← ${L('a versão nova', 'the new version', 'la versión nueva')}

const RELEASES = [
  {
    version: '0.5.0',
    date: '2026-12-01',
    title: T('Nome curto da entrega', 'Short name for the release', 'Nombre corto de la entrega'),
    summary: T('Uma frase sobre o que muda para quem usa.', 'One sentence on what changes for users.', 'Una frase sobre lo que cambia para quien lo usa.'),
    groups: [
      {
        name: 'Componentes',
        items: [
          // [${L('tipo, texto, link', 'type, text, link', 'tipo, texto, enlace')}]
          ['novo', '${L('Alerta inline com tons e ações', 'Inline alert with tones and actions', 'Alerta inline con tonos y acciones')}', '/padroes/formularios'],
          ['melhoria', '${L('Toast com seis posições', 'Toast with six positions', 'Toast con seis posiciones')}', '/componentes/toast'],
          ['correcao', '${L('A busca encontra “calendário”', 'Search finds “calendar”', 'La búsqueda encuentra “calendario”')}', '/fundamentos/icones'],
        ],
      },
    ],
  },
  // ${L('…versões anteriores, da mais nova para a mais antiga', '…earlier versions, newest to oldest', '…versiones anteriores, de la más nueva a la más antigua')}
];`;

const AFTER = () => [
  ['megaphone', L('A bolinha de Novidades volta na sidebar para quem ainda não viu a versão.', 'The What’s new dot comes back in the sidebar for anyone who hasn’t seen the version yet.', 'El puntito de Novedades vuelve a la sidebar para quien todavía no vio la versión.')],
  ['package', L(`O cartão da conta mostra a versão nova — hoje, Órbita ${CURRENT_VERSION.replace(/\.0$/, '')}.`, `The account card shows the new version — today, Órbita ${CURRENT_VERSION.replace(/\.0$/, '')}.`, `La tarjeta de la cuenta muestra la versión nueva — hoy, Órbita ${CURRENT_VERSION.replace(/\.0$/, '')}.`)],
  ['history', L('O roadmap do Início e a página Novidades leem o mesmo arquivo; não há outro lugar para atualizar.', 'The Home roadmap and the What’s new page read the same file; there’s nowhere else to update.', 'El roadmap del Inicio y la página Novedades leen el mismo archivo; no hay otro lugar que actualizar.')],
];

const DONE = () => [
  [L('Resolve um problema real', 'Solves a real problem', 'Resuelve un problema real'), L('Aparece em pelo menos duas telas, com exemplos.', 'Shows up on at least two screens, with examples.', 'Aparece en al menos dos pantallas, con ejemplos.')],
  [L('Funciona sem o mouse', 'Works without a mouse', 'Funciona sin el mouse'), L('Teclado, foco visível e leitor de tela conferidos.', 'Keyboard, visible focus, and screen reader checked.', 'Teclado, foco visible y lector de pantalla revisados.')],
  [L('Vive de tokens', 'Runs on tokens', 'Vive de tokens'), L('Muda junto quando a marca ou o tema mudam.', 'Changes along with the brand or theme.', 'Cambia junto cuando cambian la marca o el tema.')],
  [L('Está documentado', 'Is documented', 'Está documentado'), L('Página com playground, estados, acessibilidade e uso, nos três idiomas.', 'A page with playground, states, accessibility, and usage, in all three languages.', 'Página con playground, estados, accesibilidad y uso, en los tres idiomas.')],
  [L('Passou na revisão', 'Passed review', 'Pasó la revisión'), L('Design e código, com o checklist inteiro marcado.', 'Design and code, with the whole checklist checked.', 'Diseño y código, con todo el checklist marcado.')],
  [L('Está em Novidades', 'Is in What’s new', 'Está en Novedades'), L('Com versão, data e link para a página.', 'With version, date, and a link to the page.', 'Con versión, fecha y enlace a la página.')],
];

const FAQ = () => [
  [L('Preciso pedir permissão para usar algo que não está no Órbita?', 'Do I need permission to use something that isn’t in Órbita?', '¿Necesito pedir permiso para usar algo que no está en Órbita?'), L('Não. Construa no seu produto com os tokens e componentes que existem. A proposta vem quando a peça se repete.', 'No. Build it in your product with the tokens and components that exist. The proposal comes when the piece repeats.', 'No. Constrúyelo en tu producto con los tokens y componentes que existen. La propuesta llega cuando la pieza se repite.')],
  [L('E se o meu caso for diferente de tudo?', 'What if my case is unlike anything else?', '¿Y si mi caso es distinto de todo?'), L('Comece pela conversa, não pelo código: traga os exemplos. Às vezes é uma variante; às vezes, um padrão com peças que já existem.', 'Start with a conversation, not code: bring the examples. Sometimes it’s a variant; sometimes, a pattern with pieces that already exist.', 'Empieza por la conversación, no por el código: trae los ejemplos. A veces es una variante; a veces, un patrón con piezas que ya existen.')],
  [L('Posso criar um token só para o meu componente?', 'Can I create a token just for my component?', '¿Puedo crear un token solo para mi componente?'), L('Só se ele tiver um papel que outros componentes também possam ter. Tokens nomeiam papéis (fg.muted, border.focus), não lugares.', 'Only if it has a role other components could have too. Tokens name roles (fg.muted, border.focus), not places.', 'Solo si tiene un rol que otros componentes también puedan tener. Los tokens nombran roles (fg.muted, border.focus), no lugares.')],
  [L('Quanto tempo leva uma revisão?', 'How long does a review take?', '¿Cuánto tarda una revisión?'), L('Depende do tamanho. Uma correção ou um token passa rápido; um componente novo leva mais, porque passa por design e por código — e pela página com playground.', 'It depends on the size. A fix or a token goes quickly; a new component takes longer, because it goes through design and code — and the page with a playground.', 'Depende del tamaño. Una corrección o un token pasa rápido; un componente nuevo tarda más, porque pasa por diseño y por código — y por la página con playground.')],
  [L('Dá para mudar o nome de uma classe?', 'Can a class name change?', '¿Se puede cambiar el nombre de una clase?'), L('Dá, mas é uma mudança que quebra: só numa versão maior, com guia de migração. Enquanto isso, mantenha o nome antigo funcionando.', 'Yes, but it’s a breaking change: only in a major version, with a migration guide. Meanwhile, keep the old name working.', 'Sí, pero es un cambio que rompe: solo en una versión mayor, con guía de migración. Mientras tanto, mantén funcionando el nombre antiguo.')],
  [L('Onde ficam as decisões que já foram tomadas?', 'Where are the decisions already made?', '¿Dónde quedan las decisiones ya tomadas?'), L('Nas páginas: cada componente diz quando usar e quando não usar. O que mudou, e por quê, fica em Novidades.', 'In the pages: each component says when to use it and when not to. What changed, and why, is in What’s new.', 'En las páginas: cada componente dice cuándo usarlo y cuándo no. Lo que cambió, y por qué, queda en Novedades.')],
];

const NAV = () => [
  ['rc-caminho', L('Caminho', 'Path', 'Camino')],
  ['rc-propor', L('Propor', 'Propose', 'Proponer')],
  ['rc-construir', L('Construir', 'Build', 'Construir')],
  ['rc-revisar', L('Revisar', 'Review', 'Revisar')],
  ['rc-publicar', L('Publicar', 'Publish', 'Publicar')],
  ['rc-pronto', L('Pronto', 'Done', 'Listo')],
  ['rc-faq', L('Perguntas', 'Questions', 'Preguntas')],
];

/* ───────── Peças ───────── */

const section = (id, title, desc, body) => `
  <section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header">
      <div>
        <h2 class="doc-section__title" id="${id}-title">${title}</h2>
        ${desc ? `<p class="doc-section__desc">${desc}</p>` : ''}
      </div>
    </header>
    ${body}
  </section>`;

const stamp = (n) => String(n).padStart(2, '0');

function question(q, i) {
  const name = `rc-q-${q.id}`;
  return `<fieldset class="ds-choice-group rc-decide__question" data-question="${q.id}"${i ? ' hidden' : ''}>
    <legend class="ds-choice-group__legend rc-decide__legend"><span class="ds-section__stamp">${stamp(i + 1)}</span>${escapeHtml(q.text)}</legend>
    ${q.hint ? `<p class="rc-decide__hint">${escapeHtml(q.hint)}</p>` : ''}
    <div class="rc-decide__answers">
      <label class="ds-radio"><input type="radio" class="ds-radio__input" name="${name}" value="sim"><span class="ds-choice__text"><span class="ds-choice__label">${L('Sim', 'Yes', 'Sí')}</span></span></label>
      <label class="ds-radio"><input type="radio" class="ds-radio__input" name="${name}" value="nao"><span class="ds-choice__text"><span class="ds-choice__label">${L('Não', 'No', 'No')}</span></span></label>
    </div>
  </fieldset>`;
}

function resultHtml(key) {
  const r = RESULTS()[key];
  const link = r.href
    ? `<a class="ds-inline-action" href="#${r.href}">${escapeHtml(r.link)}${icon('arrow-right', { size: 14 })}</a>`
    : r.target
      ? `<button type="button" class="ds-inline-action" data-rc-goto="${r.target}">${escapeHtml(r.link)}${icon('arrow-down', { size: 14 })}</button>`
      : '';
  return `<div class="ds-alert ds-alert--${r.tone}">
    <span class="ds-alert__icon">${icon(r.icon, { size: 20 })}</span>
    <div class="ds-alert__body">
      <p class="ds-alert__title">${escapeHtml(r.title)}</p>
      <p class="ds-alert__text">${escapeHtml(r.text)}</p>
      <div class="ds-alert__actions">${link}<button type="button" class="ds-inline-action" data-rc-restart>${icon('refresh', { size: 14 })}${L('Recomeçar', 'Start over', 'Empezar de nuevo')}</button></div>
    </div>
  </div>`;
}

/* ───────── Página ───────── */

export default function renderContribuir(page) {
  const stages = STAGES();
  const checklist = CHECKLIST();
  const TOTAL = total(checklist);
  const types = TYPE_INFO();
  return `
  <div class="page doc rc-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('O Órbita cresce com o que os times precisam. Este é o caminho de uma ideia até virar versão — com as regras da casa, o checklist da revisão e como publicar.', 'Órbita grows with what teams need. This is the path from an idea to a version — with the house rules, the review checklist, and how to publish.', 'Órbita crece con lo que los equipos necesitan. Este es el camino de una idea hasta convertirse en versión — con las reglas de la casa, el checklist de la revisión y cómo publicar.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('etapas', 'stages', 'etapas')}</dt><dd class="doc-stat__value">${stages.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('itens na revisão', 'review items', 'ítems en la revisión')}</dt><dd class="doc-stat__value">${TOTAL}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('dependências', 'dependencies', 'dependencias')}</dt><dd class="doc-stat__value">0</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('versão atual', 'current version', 'versión actual')}</dt><dd class="doc-stat__value">${CURRENT_VERSION}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV()
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'rc-caminho',
      L('O caminho de uma mudança', 'The path of a change', 'El camino de un cambio'),
      L('Cinco etapas, sempre nesta ordem. Uma correção pequena pode pular a proposta; uma peça nova, nunca.', 'Five stages, always in this order. A small fix can skip the proposal; a new piece, never.', 'Cinco etapas, siempre en este orden. Una corrección pequeña puede saltarse la propuesta; una pieza nueva, nunca.'),
      `<ol class="rc-path" role="list">
        ${stages.map(
          (s, i) => `<li class="rc-stage">
            <span class="rc-stage__dot" aria-hidden="true"></span>
            <p class="ds-section__head rc-stage__head"><span class="ds-section__stamp">${stamp(i + 1)}</span><span>${s.name}</span></p>
            <p class="rc-stage__text">${s.text}</p>
            <dl class="rc-stage__meta">
              <div><dt>${L('Quem', 'Who', 'Quién')}</dt><dd>${s.who}</dd></div>
              <div><dt>${L('Sai daqui', 'Comes out', 'Sale de aquí')}</dt><dd>${escapeHtml(s.out)}</dd></div>
            </dl>
          </li>`,
        ).join('')}
      </ol>`,
    )}

    ${section(
      'rc-propor',
      L('Propor', 'Propose', 'Proponer'),
      L('Antes do código, a pergunta: que tipo de mudança é esta? Quanto menor, mais rápido sai.', 'Before the code, the question: what kind of change is this? The smaller it is, the faster it ships.', 'Antes del código, la pregunta: ¿qué tipo de cambio es este? Cuanto más pequeño, más rápido sale.'),
      `<div class="rc-kinds">
        ${KINDS().map(
          ([ic, name, text, example]) => `<article class="rc-kind">
            <span class="rc-kind__icon">${icon(ic, { size: 20 })}</span>
            <h3 class="rc-kind__name">${name}</h3>
            <p class="rc-kind__text">${text}</p>
            <p class="rc-kind__example"><span>${L('Exemplo', 'Example', 'Ejemplo')}</span>${escapeHtml(example)}</p>
          </article>`,
        ).join('')}
      </div>

      <h3 class="doc-subhead">${L('Isso é do design system?', 'Does this belong in the design system?', '¿Esto es del design system?')} <span class="doc-subhead__meta">${L('quatro perguntas, no máximo', 'four questions, at most', 'cuatro preguntas, como máximo')}</span></h3>
      <div class="rc-decide" data-rc-decide>
        <div class="rc-decide__questions">
          ${QUESTIONS().map(question).join('')}
        </div>
        <div class="rc-decide__result" data-rc-result role="status" aria-live="polite"></div>
      </div>

      <h3 class="doc-subhead" id="rc-modelo">${L('Modelo de proposta', 'Proposal template', 'Plantilla de propuesta')} <span class="doc-subhead__meta">${L('copie e preencha', 'copy and fill in', 'copia y completa')}</span></h3>
      <p class="rc-note">${L('Uma proposta boa cabe numa tela. Traga prints de onde o problema aparece — eles convencem mais que qualquer parágrafo.', 'A good proposal fits on one screen. Bring screenshots of where the problem shows up — they convince more than any paragraph.', 'Una buena propuesta cabe en una pantalla. Trae capturas de dónde aparece el problema — convencen más que cualquier párrafo.')}</p>
      <div data-rc-template>${codeBlock(TEMPLATE(), { label: L('Copiar modelo', 'Copy template', 'Copiar plantilla') })}</div>`,
    )}

    ${section(
      'rc-construir',
      L('Construir', 'Build', 'Construir'),
      L('As regras da casa e o passo a passo de uma peça nova, com os arquivos de verdade deste repositório.', 'The house rules and the step-by-step for a new piece, with the real files in this repository.', 'Las reglas de la casa y el paso a paso de una pieza nueva, con los archivos reales de este repositorio.'),
      `<ul class="rc-rules" role="list">
        ${RULES().map(
          ([ic, title, text]) => `<li class="rc-rule">
            <span class="rc-rule__icon">${icon(ic, { size: 18 })}</span>
            <div><p class="rc-rule__title">${title}</p><p class="rc-rule__text">${text}</p></div>
          </li>`,
        ).join('')}
      </ul>

      <h3 class="doc-subhead">${L('Passo a passo', 'Step by step', 'Paso a paso')} <span class="doc-subhead__meta">${L('da pasta tokens/ até a página', 'from the tokens/ folder to the page', 'de la carpeta tokens/ hasta la página')}</span></h3>
      <ol class="rc-steps" role="list">
        ${BUILD_STEPS().map(
          ([title, text, codes], i) => `<li class="rc-step">
            <span class="rc-step__num" aria-hidden="true">${i + 1}</span>
            <div class="rc-step__body">
              <h4 class="rc-step__title"><span class="ds-visually-hidden">${L(`Passo ${i + 1}: `, `Step ${i + 1}: `, `Paso ${i + 1}: `)}</span>${title}</h4>
              <p class="rc-step__text">${escapeHtml(text)}</p>
              ${codes.map((c) => codeBlock(c)).join('')}
            </div>
          </li>`,
        ).join('')}
      </ol>`,
    )}

    ${section(
      'rc-revisar',
      L('Revisar', 'Review', 'Revisar'),
      L(`Quem revisa marca; quem construiu já passou por aqui antes. Para os detalhes de contraste, teclado e leitores de tela, veja <a class="rc-link" href="#/recursos/acessibilidade">Acessibilidade</a>.`, `The reviewer checks; the builder has already been through it. For the details on contrast, keyboard, and screen readers, see <a class="rc-link" href="#/recursos/acessibilidade">Accessibility</a>.`, `Quien revisa marca; quien construyó ya pasó por aquí antes. Para los detalles de contraste, teclado y lectores de pantalla, mira <a class="rc-link" href="#/recursos/acessibilidade">Accesibilidad</a>.`),
      `<div class="rc-review" data-rc-review>
        <div class="rc-review__bar">
          <div class="ds-meter rc-review__meter" role="progressbar" aria-label="${L('Itens conferidos', 'Items checked', 'Ítems revisados')}" aria-valuemin="0" aria-valuemax="${TOTAL}" aria-valuenow="0" data-rc-meter>
            <div class="ds-meter__head">
              <span class="ds-meter__label">${L('Itens conferidos', 'Items checked', 'Ítems revisados')}</span>
              <span class="ds-meter__value"><strong data-rc-count>0</strong><span> ${L('de', 'of', 'de')} ${TOTAL}</span></span>
            </div>
            <div class="ds-meter__track"><span class="ds-meter__fill" style="--value:0" data-rc-fill></span></div>
          </div>
          <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-rc-clear>${icon('refresh', { size: 16 })}${L('Desmarcar tudo', 'Uncheck all', 'Desmarcar todo')}</button>
        </div>
        <div class="rc-review__groups">
          ${checklist.map(
            (g, gi) => `<fieldset class="ds-choice-group rc-review__group">
              <legend class="ds-choice-group__legend rc-review__legend"><span class="ds-section__stamp">${stamp(gi + 1)}</span>${g.name}<span class="rc-review__group-count" data-rc-group-count="${g.id}">0/${g.items.length}</span></legend>
              <div class="ds-choice-group__items rc-review__items">
                ${g.items
                  .map(
                    ([label, desc], i) => `<label class="ds-checkbox">
                      <input type="checkbox" class="ds-checkbox__input" data-rc-check="${g.id}" name="rc-${g.id}-${i}">
                      <span class="ds-choice__text"><span class="ds-choice__label">${label}</span><span class="ds-choice__description">${escapeHtml(desc)}</span></span>
                    </label>`,
                  )
                  .join('')}
              </div>
            </fieldset>`,
          ).join('')}
        </div>
        <div class="rc-review__done" data-rc-done role="status" aria-live="polite"></div>
      </div>

      <div class="rc-split">
        <div>
          <h3 class="doc-subhead">${L('O que bloqueia', 'What blocks', 'Lo que bloquea')}</h3>
          <ul class="rc-blockers" role="list">
            ${BLOCKERS().map((b) => `<li>${icon('x-circle', { size: 18 })}<span>${b}</span></li>`).join('')}
          </ul>
        </div>
        <div>
          <h3 class="doc-subhead">${L('Como comentar', 'How to comment', 'Cómo comentar')}</h3>
          <ul class="rc-tips" role="list">
            <li>${icon('check', { size: 18 })}<span>${L('<strong>Aponte o lugar.</strong> “O foco do item 3 do menu some no claro” ajuda mais que “o foco está estranho”.', '<strong>Point to the spot.</strong> “Focus on menu item 3 disappears in light mode” helps more than “focus looks weird”.', '<strong>Señala el lugar.</strong> “El foco del ítem 3 del menú desaparece en el claro” ayuda más que “el foco está raro”.')}</span></li>
            <li>${icon('check', { size: 18 })}<span>${L('<strong>Diga se bloqueia.</strong> Separe o que impede a publicação do que é sugestão para depois.', '<strong>Say whether it blocks.</strong> Separate what prevents publishing from what’s a suggestion for later.', '<strong>Di si bloquea.</strong> Separa lo que impide la publicación de lo que es sugerencia para después.')}</span></li>
            <li>${icon('check', { size: 18 })}<span>${L('<strong>Proponha.</strong> Se der, mostre o token ou o trecho que resolve.', '<strong>Suggest.</strong> If you can, show the token or the snippet that fixes it.', '<strong>Propón.</strong> Si puedes, muestra el token o el fragmento que lo resuelve.')}</span></li>
          </ul>
        </div>
      </div>`,
    )}

    ${section(
      'rc-publicar',
      L('Publicar', 'Publish', 'Publicar'),
      L('Toda versão sai de um arquivo só: <code class="ds-inline-code">site/changelog.js</code>. Ele alimenta Novidades, o roadmap do Início, a bolinha da sidebar e o cartão da versão.', 'Every version comes from a single file: <code class="ds-inline-code">site/changelog.js</code>. It feeds What’s new, the Home roadmap, the sidebar dot, and the version card.', 'Toda versión sale de un solo archivo: <code class="ds-inline-code">site/changelog.js</code>. Alimenta Novedades, el roadmap del Inicio, el puntito de la sidebar y la tarjeta de la versión.'),
      `<div class="rc-semver">
        ${SEMVER().map(
          ([v, part, name, text]) => `<article class="rc-semver__card">
            <p class="rc-semver__number">${v.split('.').map((n, i) => `<span${i === part ? ' class="rc-semver__part"' : ''}>${n}</span>`).join('.')}</p>
            <h3 class="rc-semver__name">${name}</h3>
            <p class="rc-semver__text">${text}</p>
          </article>`,
        ).join('')}
      </div>
      <p class="rc-note">${L('Enquanto estivermos em 0.x, uma versão menor ainda pode trazer uma mudança que quebra — sempre avisada em Novidades. Cada entrega grande vira uma versão menor:', 'While we’re on 0.x, a minor version can still bring a breaking change — always announced in What’s new. Every big delivery becomes a minor version:', 'Mientras estemos en 0.x, una versión menor todavía puede traer un cambio que rompe — siempre avisado en Novedades. Cada entrega grande se convierte en una versión menor:')} ${releases
        .slice()
        .reverse()
        .map((r) => `${r.version.replace(/\.0$/, '')} ${r.title}`)
        .join(', ')}.</p>

      <h3 class="doc-subhead">${L('Uma entrada em Novidades', 'An entry in What’s new', 'Una entrada en Novedades')}</h3>
      <div class="rc-types">
        ${Object.entries(TYPES)
          .map(
            ([id, [tone]]) => `<div class="rc-type">
              <span class="ds-badge ds-badge--sm ds-badge--${tone}">${types[id][0]}</span>
              <p>${types[id][1]}</p>
              <code class="ds-inline-code">'${id}'</code>
            </div>`,
          )
          .join('')}
      </div>
      ${codeBlock(changelogCode())}

      <h3 class="doc-subhead">${L('Depois de publicar', 'After publishing', 'Después de publicar')} <span class="doc-subhead__meta">${L('sem passo manual', 'no manual step', 'sin paso manual')}</span></h3>
      <ul class="rc-after" role="list">
        ${AFTER().map(([ic, text]) => `<li><span class="rc-after__icon">${icon(ic, { size: 18 })}</span><span>${escapeHtml(text)}</span></li>`).join('')}
      </ul>
      <p class="rc-note">${L('Sem calendário fixo: uma versão menor sai quando uma entrega fica pronta; correções saem assim que estão revisadas.', 'No fixed schedule: a minor version ships when a delivery is ready; fixes ship as soon as they’re reviewed.', 'Sin calendario fijo: una versión menor sale cuando una entrega está lista; las correcciones salen en cuanto están revisadas.')}</p>`,
    )}

    ${section('rc-pronto', L('Definição de pronto', 'Definition of done', 'Definición de listo'), L('Uma peça só entra numa versão quando tudo isto é verdade.', 'A piece only goes into a version when all of this is true.', 'Una pieza solo entra en una versión cuando todo esto es verdad.'), a11yList(DONE()))}

    ${section(
      'rc-faq',
      L('Perguntas frequentes', 'Frequently asked questions', 'Preguntas frecuentes'),
      '',
      `<div class="rc-faq">
        ${FAQ().map(
          ([q, a]) => `<details class="ds-disclosure rc-faq__item">
            <summary class="ds-inline-action rc-faq__question"><span>${q}</span>${icon('plus', { size: 16, className: 'ds-inline-action__plus' })}</summary>
            <div class="ds-disclosure__content rc-faq__answer"><p>${a}</p></div>
          </details>`,
        ).join('')}
      </div>

      <aside class="rc-cta" aria-label="${L('Próximos passos', 'Next steps', 'Próximos pasos')}">
        <div>
          <p class="rc-cta__title">${L('Pronto para começar?', 'Ready to start?', '¿Listo para empezar?')}</p>
          <p class="rc-cta__text">${L(`Veja o que mudou nas últimas versões ou monte sua primeira tela com o Órbita — ${countGroup('componentes')} componentes e ${countGroup('padroes')} padrões esperando.`, `See what changed in the latest versions or build your first screen with Órbita — ${countGroup('componentes')} components and ${countGroup('padroes')} patterns waiting.`, `Mira lo que cambió en las últimas versiones o arma tu primera pantalla con Órbita — ${countGroup('componentes')} componentes y ${countGroup('padroes')} patrones esperando.`)}</p>
        </div>
        <div class="rc-cta__actions">
          <a class="ds-btn ds-btn--secondary" href="#/novidades">${icon('megaphone', { size: 18 })}${L('Ver Novidades', 'See What’s new', 'Ver Novedades')}</a>
          <a class="ds-btn ds-btn--primary" href="#/primeiros-passos">${L('Primeiros passos', 'Getting started', 'Primeros pasos')}${icon('arrow-right', { size: 18 })}</a>
        </div>
      </aside>`,
    )}
  </div>`;
}

/* ───────── Comportamento ───────── */

export function mount(root) {
  const cleanups = [mountDocNav(root), mountCodeCopy(root)];
  const questions = QUESTIONS();
  const checklist = CHECKLIST();
  const TOTAL = total(checklist);

  /* Ajudante de decisão */
  const decide = root.querySelector('[data-rc-decide]');
  const result = decide.querySelector('[data-rc-result]');
  const fieldsets = [...decide.querySelectorAll('[data-question]')];

  function evaluate() {
    let outcome = null;
    let reached = 0;
    for (const [i, q] of questions.entries()) {
      reached = i;
      const answer = decide.querySelector(`input[name="rc-q-${q.id}"]:checked`)?.value;
      if (!answer) break;
      const next = answer === 'sim' ? q.yes : q.no;
      if (next) {
        outcome = next;
        break;
      }
      reached = i + 1;
    }
    fieldsets.forEach((fs, i) => {
      const show = i <= reached;
      fs.hidden = !show;
      if (!show) fs.querySelectorAll('input').forEach((input) => (input.checked = false));
    });
    result.innerHTML = outcome ? resultHtml(outcome) : '';
    decide.toggleAttribute('data-done', !!outcome);
    return reached;
  }

  const onDecideChange = (event) => {
    if (!event.target.matches('input[type="radio"]')) return;
    const before = fieldsets.filter((fs) => !fs.hidden).length;
    evaluate();
    // a próxima pergunta recebe o foco, para quem navega pelo teclado seguir em frente
    const visible = fieldsets.filter((fs) => !fs.hidden);
    if (visible.length > before && !decide.hasAttribute('data-done')) visible.at(-1).querySelector('input')?.focus();
  };
  const onDecideClick = (event) => {
    if (event.target.closest('[data-rc-restart]')) {
      decide.querySelectorAll('input').forEach((input) => (input.checked = false));
      evaluate();
      fieldsets[0].querySelector('input')?.focus();
    }
    const goto = event.target.closest('[data-rc-goto]');
    if (goto) {
      const target = root.querySelector(`#${goto.dataset.rcGoto}`);
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      // o foco vai para o botão de copiar o modelo — o próximo passo natural
      root.querySelector('[data-rc-template] [data-copy-code]')?.focus({ preventScroll: true });
    }
  };
  decide.addEventListener('change', onDecideChange);
  decide.addEventListener('click', onDecideClick);
  cleanups.push(() => {
    decide.removeEventListener('change', onDecideChange);
    decide.removeEventListener('click', onDecideClick);
  });
  evaluate();

  /* Checklist da revisão — progresso só na memória da página */
  const review = root.querySelector('[data-rc-review]');
  const checks = [...review.querySelectorAll('[data-rc-check]')];
  const meter = review.querySelector('[data-rc-meter]');
  const fill = review.querySelector('[data-rc-fill]');
  const count = review.querySelector('[data-rc-count]');
  const done = review.querySelector('[data-rc-done]');

  function syncReview() {
    const n = checks.filter((c) => c.checked).length;
    count.textContent = String(n);
    fill.style.setProperty('--value', String(n / TOTAL));
    meter.setAttribute('aria-valuenow', String(n));
    meter.setAttribute('aria-valuetext', L(`${n} de ${TOTAL} itens conferidos`, `${n} of ${TOTAL} items checked`, `${n} de ${TOTAL} ítems revisados`));
    meter.classList.toggle('ds-meter--success', n === TOTAL);
    for (const g of checklist) {
      const own = checks.filter((c) => c.dataset.rcCheck === g.id);
      review.querySelector(`[data-rc-group-count="${g.id}"]`).textContent = `${own.filter((c) => c.checked).length}/${own.length}`;
    }
    done.innerHTML =
      n === TOTAL
        ? `<div class="ds-alert ds-alert--success ds-alert--compact"><span class="ds-alert__icon">${icon('check-circle', { size: 20 })}</span><div class="ds-alert__body"><p class="ds-alert__title">${L('Pronto para aprovar', 'Ready to approve', 'Listo para aprobar')}</p><p class="ds-alert__text">${L(`Os ${TOTAL} itens foram conferidos. Falta só a entrada em Novidades.`, `All ${TOTAL} items have been checked. Only the What’s new entry is left.`, `Los ${TOTAL} ítems fueron revisados. Solo falta la entrada en Novedades.`)}</p></div></div>`
        : '';
  }

  const onReviewChange = (event) => {
    if (event.target.matches('[data-rc-check]')) syncReview();
  };
  const onClear = () => {
    checks.forEach((c) => (c.checked = false));
    syncReview();
    checks[0]?.focus();
  };
  const clearBtn = review.querySelector('[data-rc-clear]');
  review.addEventListener('change', onReviewChange);
  clearBtn.addEventListener('click', onClear);
  cleanups.push(() => {
    review.removeEventListener('change', onReviewChange);
    clearBtn.removeEventListener('click', onClear);
  });
  syncReview();

  return () => cleanups.forEach((fn) => fn());
}
