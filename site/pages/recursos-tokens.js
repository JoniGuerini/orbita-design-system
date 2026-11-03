import { icon } from '../../ds/icons/icons.js';
import data, { contrast } from '../../ds/tokens.js';
import { tokenModel, figmaVariables, figmaRestPayload, figmaPlugin, toDTCG, toFlat, exportCounts, figmaName, COLLECTIONS, MODES } from '../../ds/js/token-export.js';
import { createFilters } from '../../ds/js/filters.js';
import { mountTabs } from '../../ds/js/tabs.js';
import { toast } from '../../ds/js/toast.js';
import { formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, escapeHtml } from '../component-doc.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-tokens.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;
const model = tokenModel(data);
const counts = exportCounts(data);
const passed = contrast.filter((c) => c.pass).length;
const n = (v) => formatNumber(v);
const json = (v) => `${JSON.stringify(v, null, 2)}\n`;
const kb = (s) => `${formatNumber(new Blob([s]).size / 1024, { maximumFractionDigits: 1 })} KB`;
const styleCount = counts.textStyles + counts.effectStyles;

/** Os arquivos só são montados quando alguém pede (a página abre leve). */
const cache = new Map();
const lazy = (key, make) => () => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};
const plugin = lazy('plugin', () => figmaPlugin(data));
const restFile = lazy('rest', () => json(figmaRestPayload(data)));
const figmaFile = lazy('figma', () => json(figmaVariables(data)));
const dtcgFile = lazy('dtcg', () => json(toDTCG(data)));
const flatFile = lazy('flat', () => json(toFlat(data)));

const FORMATS = () => [
  {
    id: 'plugin',
    label: L('Plugin do Figma', 'Figma plugin', 'Plugin de Figma'),
    icon: 'package',
    for: L('Qualquer plano do Figma. Cria e, nas próximas vezes, atualiza variáveis e estilos pelo nome.', 'Any Figma plan. It creates variables and styles and, on later runs, updates them by name.', 'Cualquier plan de Figma. Crea y, en las próximas veces, actualiza variables y estilos por el nombre.'),
    meta: L(`${counts.variables} variáveis · ${styleCount} estilos`, `${counts.variables} variables · ${styleCount} styles`, `${counts.variables} variables · ${styleCount} estilos`),
    files: [
      { name: 'manifest.json', type: 'application/json', content: () => plugin().manifest },
      { name: 'code.js', type: 'text/javascript', content: () => plugin().code },
    ],
    preview: () => {
      const runtime = plugin().code.split('\n').slice(3, 15).join('\n');
      return `// manifest.json\n${plugin().manifest}\n// code.js\nconst DATA = { /* ${L(`${counts.variables} variáveis, ${styleCount} estilos`, `${counts.variables} variables, ${styleCount} styles`, `${counts.variables} variables, ${styleCount} estilos`)} */ };\n${runtime}\n…`;
    },
  },
  {
    id: 'rest',
    label: L('API REST', 'REST API', 'API REST'),
    icon: 'globe',
    for: L('Corpo do POST /v1/files/:file_key/variables. Cria as três coleções num arquivo novo de uma vez.', 'Body of POST /v1/files/:file_key/variables. Creates the three collections in a new file at once.', 'Cuerpo del POST /v1/files/:file_key/variables. Crea las tres colecciones en un archivo nuevo de una vez.'),
    meta: L(`${counts.variables} variáveis · ${n(counts.primitives + counts.semantic * 2 + counts.dimensions)} valores por modo`, `${counts.variables} variables · ${n(counts.primitives + counts.semantic * 2 + counts.dimensions)} values per mode`, `${counts.variables} variables · ${n(counts.primitives + counts.semantic * 2 + counts.dimensions)} valores por modo`),
    files: [{ name: 'figma-variables.rest.json', type: 'application/json', content: restFile }],
  },
  {
    id: 'figma',
    label: 'Figma (JSON)',
    icon: 'layers',
    for: L('As coleções, os modos e os estilos num formato simples de ler — é o que o plugin usa por dentro.', 'The collections, modes, and styles in an easy-to-read format — it’s what the plugin uses internally.', 'Las colecciones, los modos y los estilos en un formato fácil de leer — es lo que el plugin usa por dentro.'),
    meta: L(`3 coleções · ${counts.aliases} aliases · ${counts.resolved} cores com transparência`, `3 collections · ${counts.aliases} aliases · ${counts.resolved} colors with transparency`, `3 colecciones · ${counts.aliases} alias · ${counts.resolved} colores con transparencia`),
    files: [{ name: 'figma-variables.json', type: 'application/json', content: figmaFile }],
  },
  {
    id: 'dtcg',
    label: 'DTCG',
    icon: 'file-text',
    for: L('Padrão W3C de design tokens. Para Tokens Studio, Style Dictionary e outros leitores do formato.', 'The W3C design tokens standard. For Tokens Studio, Style Dictionary, and other readers of the format.', 'Estándar W3C de design tokens. Para Tokens Studio, Style Dictionary y otros lectores del formato.'),
    meta: L(`${n(counts.tokens)} tokens · temas em $extensions`, `${n(counts.tokens)} tokens · themes in $extensions`, `${n(counts.tokens)} tokens · temas en $extensions`),
    files: [{ name: 'tokens.dtcg.json', type: 'application/json', content: dtcgFile }],
  },
  {
    id: 'flat',
    label: L('JSON plano', 'Flat JSON', 'JSON plano'),
    icon: 'code',
    for: L('Nome → valor, com escuro e claro lado a lado. Para scripts, testes e apps em JS ou TS.', 'Name → value, with dark and light side by side. For scripts, tests, and JS or TS apps.', 'Nombre → valor, con oscuro y claro lado a lado. Para scripts, pruebas y apps en JS o TS.'),
    meta: L(`${n(counts.tokens)} tokens · uma chave por token`, `${n(counts.tokens)} tokens · one key per token`, `${n(counts.tokens)} tokens · una clave por token`),
    files: [{ name: 'tokens.flat.json', type: 'application/json', content: flatFile }],
  },
  {
    id: 'css',
    label: 'CSS',
    icon: 'hash',
    for: L('As variáveis que os componentes consomem — o mesmo ds/tokens.css que o site usa.', 'The variables the components consume — the same ds/tokens.css the site uses.', 'Las variables que consumen los componentes — el mismo ds/tokens.css que usa el sitio.'),
    meta: L(`${n(data.tokens.length + counts.primitives)} variáveis · 2 temas`, `${n(data.tokens.length + counts.primitives)} variables · 2 themes`, `${n(data.tokens.length + counts.primitives)} variables · 2 temas`),
    files: [{ name: 'tokens.css', type: 'text/css', content: () => fetchCss() }],
  },
];

let cssPromise = null;
const fetchCss = () => (cssPromise ??= fetch(new URL('ds/tokens.css', document.baseURI)).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status)))));

const preview = async (f) => {
  if (f.preview) return f.preview();
  const content = await f.files[0].content();
  const lines = content.split('\n');
  return `${lines.slice(0, 18).join('\n')}${lines.length > 18 ? '\n…' : ''}`;
};

/* Mapa: um token por linha, como ele aparece no Figma */

const swatch = (hex) => `<span class="rt-swatch" style="--c:${hex}"></span>`;
const aliasCell = (v) =>
  v.alias
    ? `${swatch(v.hex)}<span class="rt-value"><code>${escapeHtml(figmaName(v.alias).replace(/^color\//, ''))}</code><span class="rt-value__hex">${v.hex.toUpperCase()}</span></span>`
    : `${swatch(v.hex)}<span class="rt-value"><code>${v.hex.toUpperCase()}</code><span class="rt-value__hex">RGBA</span></span>`;

const ROWS = () => {
  const same = `<span class="rt-same">${L('mesmo valor', 'same value', 'mismo valor')}</span>`;
  const color = L('Cor', 'Color', 'Color');
  return [
    ...model.primitives.map((p) => ({ kind: 'primitivas', token: p.name, figma: figmaName(p.name), collection: COLLECTIONS.primitives, type: color, dark: `${swatch(p.value)}<code>${p.value.toUpperCase()}</code>`, light: same })),
    ...model.semantic.map((s) => ({ kind: 'semanticos', token: s.name, figma: figmaName(s.name), collection: COLLECTIONS.semantic, type: color, dark: aliasCell(s.values.dark), light: aliasCell(s.values.light) })),
    ...model.dimensions.map((d) => ({ kind: 'dimensoes', token: d.name, figma: figmaName(d.name), collection: COLLECTIONS.dimensions, type: L('Número', 'Number', 'Número'), dark: `<code>${n(d.value)}</code><span class="rt-unit">${d.unit}</span>`, light: same })),
    ...model.textStyles.map((t) => ({
      kind: 'texto',
      token: t.name,
      figma: figmaName(t.name),
      collection: L('Estilo de texto', 'Text style', 'Estilo de texto'),
      type: L('Texto', 'Text', 'Texto'),
      dark: `<span class="rt-value"><code>${escapeHtml(`${t.fontFamily} ${t.fontStyle}`)}</code><span class="rt-value__hex">${t.fontSize}/${t.lineHeight} · ${n(t.letterSpacing)}%${t.textCase === 'UPPER' ? ` · ${L('maiúsculas', 'uppercase', 'mayúsculas')}` : ''}</span></span>`,
      light: `<span class="rt-same">${L('sem tema', 'no theme', 'sin tema')}</span>`,
    })),
    ...[...new Set(model.effectStyles.map((e) => e.token))].map((token) => {
      const cell = (mode) => {
        const e = model.effectStyles.find((x) => x.token === token && x.mode === mode);
        const layers = e.layers.length;
        return `<span class="rt-value"><code>${escapeHtml(`${MODES[mode]}/${figmaName(token)}`)}</code><span class="rt-value__hex">${layers} ${layers > 1 ? L('camadas', 'layers', 'capas') : L('camada', 'layer', 'capa')}</span></span>`;
      };
      return { kind: 'sombra', token, figma: `${MODES.dark}|${MODES.light}/${figmaName(token)}`, collection: L('Estilo de sombra', 'Shadow style', 'Estilo de sombra'), type: L('Efeito', 'Effect', 'Efecto'), dark: cell('dark'), light: cell('light') };
    }),
  ];
};

const KINDS = () => [
  { value: 'primitivas', label: COLLECTIONS.primitives },
  { value: 'semanticos', label: COLLECTIONS.semantic },
  { value: 'dimensoes', label: COLLECTIONS.dimensions },
  { value: 'texto', label: L('Estilos de texto', 'Text styles', 'Estilos de texto') },
  { value: 'sombra', label: L('Estilos de sombra', 'Shadow styles', 'Estilos de sombra') },
];

const normalize = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const rowHtml = (r) => `<tr>
  <td><span class="rt-name"><code class="rt-figma">${escapeHtml(r.figma)}</code><code class="rt-token">${escapeHtml(r.token)}</code></span></td>
  <td><span class="ds-badge ds-badge--sm">${escapeHtml(r.collection)}</span></td>
  <td><span class="rt-cell">${r.dark}</span></td>
  <td><span class="rt-cell">${r.light}</span></td>
</tr>`;

/* Textos */

const CHANGES = () => [
  [L('Cor em OKLCH', 'Color in OKLCH', 'Color en OKLCH'), L('Hex sRGB', 'sRGB hex', 'Hex sRGB'), L('O build já recorta cada tom para caber no sRGB; o Figma recebe o hex final. O OKLCH fica na descrição da variável.', 'The build already clips each tone to fit sRGB; Figma gets the final hex. The OKLCH value goes in the variable’s description.', 'El build ya recorta cada tono para que quepa en sRGB; Figma recibe el hex final. El OKLCH queda en la descripción de la variable.')],
  ['alpha({cor}, 0.06)', L('RGBA resolvida', 'Resolved RGBA', 'RGBA resuelto'), L('O Figma não mistura transparência com alias. Bordas e fundos translúcidos viram uma cor com alfa, sem vínculo com a primitiva.', 'Figma doesn’t mix transparency with aliases. Translucent borders and backgrounds become a color with alpha, unlinked from the primitive.', 'Figma no mezcla transparencia con alias. Bordes y fondos translúcidos se vuelven un color con alfa, sin vínculo con la primitiva.')],
  [L('Tema escuro e claro', 'Dark and light theme', 'Tema oscuro y claro'), L('Modos Escuro e Claro', 'Escuro and Claro modes', 'Modos Escuro y Claro'), L('Só a coleção Semânticos tem modos. Troque o modo num frame e tudo dentro dele muda de tema.', 'Only the Semânticos collection has modes. Switch the mode on a frame and everything inside changes theme.', 'Solo la colección Semânticos tiene modos. Cambia el modo en un frame y todo lo que está dentro cambia de tema.')],
  ['rem (1rem = 16 px)', 'px', L('Dimensões chegam em pixels. Opacidade vai de 0 a 100, como o Figma pede.', 'Dimensions arrive in pixels. Opacity goes from 0 to 100, as Figma expects.', 'Las dimensiones llegan en píxeles. La opacidad va de 0 a 100, como pide Figma.')],
  ['font: 600 16px/28px Inter', L('Estilo de texto', 'Text style', 'Estilo de texto'), L('Família, peso, tamanho, entrelinha em px e espaçamento em %. text-transform: uppercase vira maiúsculas.', 'Family, weight, size, line height in px, and letter spacing in %. text-transform: uppercase becomes uppercase.', 'Familia, peso, tamaño, interlineado en px y espaciado en %. text-transform: uppercase se vuelve mayúsculas.')],
  [L('box-shadow por tema', 'box-shadow per theme', 'box-shadow por tema'), L('Dois estilos de sombra', 'Two shadow styles', 'Dos estilos de sombra'), L('Estilos do Figma não têm modos: cada sombra vira Escuro/shadow/md e Claro/shadow/md.', 'Figma styles have no modes: each shadow becomes Escuro/shadow/md and Claro/shadow/md.', 'Los estilos de Figma no tienen modos: cada sombra se vuelve Escuro/shadow/md y Claro/shadow/md.')],
];

const NAMING = () => [
  ['color.bg.canvas', 'color/bg/canvas', L('Pontos viram barras — e cada barra vira uma pasta no Figma.', 'Dots become slashes — and each slash becomes a folder in Figma.', 'Los puntos se vuelven barras — y cada barra se vuelve una carpeta en Figma.')],
  ['--ds-color-bg-canvas', 'var(--ds-color-bg-canvas)', L('Vai como “code syntax” (Web): no Dev Mode, quem inspeciona copia a variável CSS certa.', 'It goes as “code syntax” (Web): in Dev Mode, whoever inspects copies the right CSS variable.', 'Va como “code syntax” (Web): en Dev Mode, quien inspecciona copia la variable CSS correcta.')],
  ['color.neutral.925', `${COLLECTIONS.primitives} › color/neutral/925`, L('Primitivas ficam escondidas da publicação e sem escopo: servem só de alias.', 'Primitives are hidden from publishing and have no scope: they only serve as aliases.', 'Las primitivas quedan ocultas de la publicación y sin ámbito: solo sirven de alias.')],
  ['text.heading-md', 'text/heading-md', L('Estilos de texto usam o mesmo nome do token, sem o prefixo ds.', 'Text styles use the same name as the token, without the ds prefix.', 'Los estilos de texto usan el mismo nombre del token, sin el prefijo ds.')],
];

const SCOPES = () => [
  ['bg.*', L('Preenchimento de frame e de forma', 'Frame and shape fill', 'Relleno de frame y de forma')],
  ['fg.*, *.fg, *.on-solid', L('Texto, forma e traço (ícones)', 'Text, shape, and stroke (icons)', 'Texto, forma y trazo (íconos)')],
  ['border.*, *.border', L('Traço', 'Stroke', 'Trazo')],
  ['brand, success, warning, danger, info', L('Preenchimentos e traço', 'Fills and stroke', 'Rellenos y trazo')],
  ['chart.*', L('Forma e traço', 'Shape and stroke', 'Forma y trazo')],
  ['space.*', L('Espaçamento (gap) e tamanho', 'Spacing (gap) and size', 'Espaciado (gap) y tamaño')],
  ['radius.*', L('Raio de canto', 'Corner radius', 'Radio de esquina')],
  ['size, layout, breakpoint', L('Largura e altura', 'Width and height', 'Ancho y alto')],
  ['border-width, focus-ring', L('Espessura de traço', 'Stroke width', 'Grosor de trazo')],
  ['blur.*', L('Desfoque de efeito', 'Effect blur', 'Desenfoque de efecto')],
  ['opacity.*', L('Opacidade', 'Opacity', 'Opacidad')],
];

const LIMITS = () => [
  [L('A API REST de variáveis só escreve em planos Enterprise', 'The variables REST API only writes on Enterprise plans', 'La API REST de variables solo escribe en planes Enterprise'), L('E o corpo só cria (CREATE): rodar duas vezes no mesmo arquivo duplica tudo. Para manter em dia, use o plugin.', 'And the body only creates (CREATE): running it twice on the same file duplicates everything. To keep things current, use the plugin.', 'Y el cuerpo solo crea (CREATE): ejecutarlo dos veces en el mismo archivo duplica todo. Para mantenerlo al día, usa el plugin.')],
  [L('Transparência não vira alias', 'Transparency doesn’t become an alias', 'La transparencia no se vuelve alias'), L(`${counts.resolved} valores semânticos com alfa chegam como RGBA. Se a primitiva mudar, esses mudam na próxima exportação — não sozinhos.`, `${counts.resolved} semantic values with alpha arrive as RGBA. If the primitive changes, they change on the next export — not on their own.`, `${counts.resolved} valores semánticos con alfa llegan como RGBA. Si la primitiva cambia, estos cambian en la próxima exportación — no solos.`)],
  [L('Estilos não têm modos', 'Styles have no modes', 'Los estilos no tienen modos'), L('Sombras viram dois estilos, um por tema. Texto não muda com o tema, então é um estilo só.', 'Shadows become two styles, one per theme. Text doesn’t change with the theme, so it’s a single style.', 'Las sombras se vuelven dos estilos, uno por tema. El texto no cambia con el tema, así que es un solo estilo.')],
  [L('Fontes precisam estar instaladas', 'Fonts need to be installed', 'Las fuentes tienen que estar instaladas'), L('O plugin pula o estilo de texto cuja fonte falta (Inter, Inter Tight, JetBrains Mono) e avisa qual foi no fim.', 'The plugin skips the text style whose font is missing (Inter, Inter Tight, JetBrains Mono) and says which one at the end.', 'El plugin salta el estilo de texto cuya fuente falta (Inter, Inter Tight, JetBrains Mono) y avisa cuál fue al final.')],
  [L('Movimento, z-index e degradê ficam fora do Figma', 'Motion, z-index, and gradients stay out of Figma', 'Movimiento, z-index y degradado quedan fuera de Figma'), L('Durações, curvas, camadas e o degradê do divisor estão no DTCG e no CSS, mas não viram variáveis.', 'Durations, curves, layers, and the divider gradient are in the DTCG and the CSS, but don’t become variables.', 'Duraciones, curvas, capas y el degradado del divisor están en el DTCG y en el CSS, pero no se vuelven variables.')],
  [L('Renomear é criar', 'Renaming is creating', 'Renombrar es crear'), L('O plugin acha cada variável pelo nome. Um token renomeado nasce como variável nova e a antiga continua no arquivo até alguém apagar.', 'The plugin finds each variable by name. A renamed token is born as a new variable and the old one stays in the file until someone deletes it.', 'El plugin encuentra cada variable por el nombre. Un token renombrado nace como variable nueva y la antigua sigue en el archivo hasta que alguien la borre.')],
];

const SYNC = () => [
  ['01', L('Edite o JSON', 'Edit the JSON', 'Edita el JSON'), L('Toda mudança começa em tokens/*.json, num pull request. É ali que a revisão acontece.', 'Every change starts in tokens/*.json, in a pull request. That’s where review happens.', 'Todo cambio empieza en tokens/*.json, en un pull request. Ahí ocurre la revisión.')],
  ['02', L('Gere e confira', 'Build and check', 'Genera y revisa'), L(`npm run tokens recria o CSS e o JS e confere o contraste (hoje ${passed}/${contrast.length}). Se cair abaixo do mínimo, o relatório avisa.`, `npm run tokens rebuilds the CSS and the JS and checks contrast (currently ${passed}/${contrast.length}). If it drops below the minimum, the report warns.`, `npm run tokens recrea el CSS y el JS y revisa el contraste (hoy ${passed}/${contrast.length}). Si baja del mínimo, el informe avisa.`)],
  ['03', L('Exporte', 'Export', 'Exporta'), L('npm run tokens:export escreve dist/tokens/ — os mesmos arquivos que esta página baixa.', 'npm run tokens:export writes dist/tokens/ — the same files this page downloads.', 'npm run tokens:export escribe dist/tokens/ — los mismos archivos que descarga esta página.')],
  ['04', L('Rode o plugin na biblioteca', 'Run the plugin in the library', 'Ejecuta el plugin en la biblioteca'), L('No arquivo da biblioteca do Figma, rode o plugin de novo: ele atualiza pelo nome, sem duplicar.', 'In the Figma library file, run the plugin again: it updates by name, without duplicating.', 'En el archivo de la biblioteca de Figma, ejecuta el plugin de nuevo: actualiza por el nombre, sin duplicar.')],
  ['05', L('Publique e anote', 'Publish and log it', 'Publica y anota'), L('Publique a biblioteca e registre a mudança em Novidades. Renomear ou remover token é versão maior.', 'Publish the library and record the change in What’s new. Renaming or removing a token is a major version.', 'Publica la biblioteca y registra el cambio en Novedades. Renombrar o quitar un token es versión mayor.')],
];

const curl = () => `# 1. ${L('Gere os arquivos', 'Build the files', 'Genera los archivos')}
npm run tokens:export

# 2. ${L('Use um token pessoal com escopo file_variables:write — nunca no código', 'Use a personal token with the file_variables:write scope — never in code', 'Usa un token personal con el ámbito file_variables:write — nunca en el código')}
export FIGMA_TOKEN="${L('seu-token-pessoal', 'your-personal-token', 'tu-token-personal')}"
export FILE_KEY="${L('chave-do-arquivo', 'file-key', 'clave-del-archivo')}"   # ${L('o trecho depois de /design/ na URL', 'the part after /design/ in the URL', 'el tramo después de /design/ en la URL')}

# 3. ${L('Envie as variáveis (cria as três coleções)', 'Send the variables (creates the three collections)', 'Envía las variables (crea las tres colecciones)')}
curl -X POST "https://api.figma.com/v1/files/$FILE_KEY/variables" \\
  -H "X-Figma-Token: $FIGMA_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data @dist/tokens/figma-variables.rest.json`;

const PLUGIN_STEPS = () => [
  [L('Gere os arquivos', 'Build the files', 'Genera los archivos'), L('npm run tokens:export — ou baixe manifest.json e code.js nesta página, na mesma pasta.', 'npm run tokens:export — or download manifest.json and code.js on this page, into the same folder.', 'npm run tokens:export — o descarga manifest.json y code.js en esta página, en la misma carpeta.')],
  [L('Importe o plugin', 'Import the plugin', 'Importa el plugin'), L('No Figma desktop: Plugins › Desenvolvimento › Importar plugin do manifesto… e escolha dist/tokens/figma-plugin/manifest.json.', 'In Figma desktop: Plugins › Development › Import plugin from manifest… and pick dist/tokens/figma-plugin/manifest.json.', 'En Figma de escritorio: Plugins › Development › Import plugin from manifest… (los nombres siguen el idioma de tu Figma) y elige dist/tokens/figma-plugin/manifest.json.')],
  [L('Rode no arquivo da biblioteca', 'Run it in the library file', 'Ejecútalo en el archivo de la biblioteca'), L('Plugins › Desenvolvimento › Lume · importar tokens. Ele cria as coleções, os modos, as variáveis e os estilos.', 'Plugins › Development › Lume · importar tokens. It creates the collections, modes, variables, and styles.', 'Plugins › Development › Lume · importar tokens. Crea las colecciones, los modos, las variables y los estilos.')],
  [L('Confira o recado no fim', 'Check the message at the end', 'Revisa el mensaje al final'), L('O plugin diz quantas variáveis criou ou atualizou e se faltou alguma fonte.', 'The plugin says how many variables it created or updated and whether a font was missing.', 'El plugin dice cuántas variables creó o actualizó y si faltó alguna fuente.')],
  [L('Para atualizar, rode de novo', 'To update, run it again', 'Para actualizar, ejecútalo de nuevo'), L('Exporte outra vez e rode o mesmo plugin: ele acha tudo pelo nome e troca só os valores.', 'Export again and run the same plugin: it finds everything by name and changes only the values.', 'Exporta otra vez y ejecuta el mismo plugin: encuentra todo por el nombre y cambia solo los valores.')],
];

const codeApi = () => `import data from './ds/tokens.js';
import { figmaVariables, figmaRestPayload, figmaPlugin, toDTCG, toFlat } from './ds/js/token-export.js';

figmaVariables(data);    // ${L('coleções + estilos, formato simples', 'collections + styles, simple format', 'colecciones + estilos, formato simple')}
figmaRestPayload(data);  // ${L('corpo do POST /v1/files/:file_key/variables', 'body of POST /v1/files/:file_key/variables', 'cuerpo del POST /v1/files/:file_key/variables')}
figmaPlugin(data);       // ${L('{ manifest, code } do plugin de desenvolvimento', '{ manifest, code } of the development plugin', '{ manifest, code } del plugin de desarrollo')}
toDTCG(data);            // W3C Design Tokens
toFlat(data);            // { tokens: { 'color.bg.canvas': { dark, light, cssVar } } }`;

const CODE_FLAT = `import flat from './dist/tokens/tokens.flat.json' with { type: 'json' };

const canvas = flat.tokens['color.bg.canvas'];
canvas.dark;    // '#1d1b18'
canvas.light;   // '#f9f5f1'
canvas.cssVar;  // '--ds-color-bg-canvas'`;

const codeScripts = () => `npm run tokens          # tokens/*.json → ds/tokens.css ${L('e', 'and', 'y')} ds/tokens.js (+ ${L('contraste', 'contrast', 'contraste')})
npm run tokens:export   # ds/tokens.js → dist/tokens/ (Figma, DTCG, ${L('JSON plano', 'flat JSON', 'JSON plano')}, CSS)`;

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

const flowNode = (glyph, title, lines, code) => `<div class="rt-flow__node">
  <span class="rt-flow__icon">${icon(glyph, { size: 18 })}</span>
  <p class="rt-flow__title">${title}</p>
  ${code ? `<code class="rt-flow__code">${code}</code>` : ''}
  <ul class="rt-flow__list" role="list">${lines.map((l) => `<li>${l}</li>`).join('')}</ul>
</div>`;

const arrow = `<span class="rt-flow__arrow" aria-hidden="true">${icon('arrow-right', { size: 18 })}</span>`;

export default function renderTokens(page) {
  const formats = FORMATS();
  return `
  <div class="page doc rt-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Os mesmos tokens do código, no Figma e em qualquer ferramenta: variáveis com modo escuro e claro, estilos de texto e sombra — tudo gerado do JSON, sem copiar valor à mão.', 'The same tokens as the code, in Figma and in any tool: variables with dark and light modes, text and shadow styles — all generated from the JSON, without copying values by hand.', 'Los mismos tokens del código, en Figma y en cualquier herramienta: variables con modo oscuro y claro, estilos de texto y sombra — todo generado desde el JSON, sin copiar valores a mano.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('variáveis no Figma', 'variables in Figma', 'variables en Figma')}</dt><dd class="doc-stat__value">${counts.variables}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('modos', 'modes', 'modos')}</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('estilos', 'styles', 'estilos')}</dt><dd class="doc-stat__value">${styleCount}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('formatos', 'formats', 'formatos')}</dt><dd class="doc-stat__value">${formats.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['rt-origem', L('De onde vem', 'Where it comes from', 'De dónde viene')],
        ['rt-formatos', L('Formato', 'Format', 'Formato')],
        ['rt-figma', L('Variáveis do Figma', 'Figma variables', 'Variables de Figma')],
        ['rt-mapa', L('Mapa de tokens', 'Token map', 'Mapa de tokens')],
        ['rt-nomes', L('Regras de nome', 'Naming rules', 'Reglas de nombre')],
        ['rt-conversao', L('O que muda', 'What changes', 'Qué cambia')],
        ['rt-importar', L('Importar', 'Import', 'Importar')],
        ['rt-sync', L('Sincronização', 'Sync', 'Sincronización')],
        ['rt-limites', L('Limitações', 'Limitations', 'Limitaciones')],
        ['rt-codigo', L('Código', 'Code', 'Código')],
        ['rt-uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'rt-origem',
      L('De onde vem', 'Where it comes from', 'De dónde viene'),
      L(`Uma fonte só: os arquivos em ${ic('tokens/')}. O resto é gerado — por isso o Figma e o código nunca discordam.`, `A single source: the files in ${ic('tokens/')}. The rest is generated — that’s why Figma and the code never disagree.`, `Una sola fuente: los archivos en ${ic('tokens/')}. El resto se genera — por eso Figma y el código nunca discrepan.`),
      `<div class="rt-flow">
        ${flowNode('file-text', L('Fonte', 'Source', 'Fuente'), [L('palettes.json · 13 paletas em OKLCH', 'palettes.json · 13 palettes in OKLCH', 'palettes.json · 13 paletas en OKLCH'), L('foundation.json · espaço, raio, tamanhos', 'foundation.json · space, radius, sizes', 'foundation.json · espacio, radio, tamaños'), L('typography.json · 19 estilos', 'typography.json · 19 styles', 'typography.json · 19 estilos'), L('semantic.json · cores por tema', 'semantic.json · colors per theme', 'semantic.json · colores por tema'), L('effects.json · sombras', 'effects.json · shadows', 'effects.json · sombras')], 'tokens/*.json')}
        ${arrow}
        ${flowNode('refresh', 'Build', [L('OKLCH → hex dentro do sRGB', 'OKLCH → hex within sRGB', 'OKLCH → hex dentro de sRGB'), L('referências e transparências resolvidas', 'references and transparencies resolved', 'referencias y transparencias resueltas'), L(`contraste conferido · ${passed}/${contrast.length}`, `contrast checked · ${passed}/${contrast.length}`, `contraste verificado · ${passed}/${contrast.length}`)], 'npm run tokens')}
        ${arrow}
        ${flowNode('layers', L('Saídas', 'Outputs', 'Salidas'), [L('ds/tokens.css · os componentes', 'ds/tokens.css · the components', 'ds/tokens.css · los componentes'), L('ds/tokens.js · esta documentação', 'ds/tokens.js · this documentation', 'ds/tokens.js · esta documentación'), L('dist/tokens/ · Figma, DTCG e JSON, com npm run tokens:export', 'dist/tokens/ · Figma, DTCG, and JSON, with npm run tokens:export', 'dist/tokens/ · Figma, DTCG y JSON, con npm run tokens:export')])}
      </div>`,
    )}

    ${section(
      'rt-formatos',
      L('Formato', 'Format', 'Formato'),
      L('Seis arquivos, um para cada destino. Tudo é montado aqui mesmo, no navegador, a partir dos tokens desta versão — nada sai da sua máquina.', 'Six files, one for each destination. Everything is assembled right here, in the browser, from this version’s tokens — nothing leaves your machine.', 'Seis archivos, uno para cada destino. Todo se arma aquí mismo, en el navegador, a partir de los tokens de esta versión — nada sale de tu máquina.'),
      `<div class="ds-tabs rt-formats" data-ds-tabs>
        <div class="ds-tabs__list" role="tablist" aria-label="${L('Formatos de exportação', 'Export formats', 'Formatos de exportación')}">
          ${formats.map((f, i) => `<button type="button" class="ds-tabs__tab" role="tab" id="rt-tab-${f.id}" aria-controls="rt-panel-${f.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${icon(f.icon, { size: 16 })}<span>${f.label}</span></button>`).join('')}
        </div>
        ${formats.map(
          (f, i) => `<div class="ds-tabs__panel rt-format" role="tabpanel" id="rt-panel-${f.id}" aria-labelledby="rt-tab-${f.id}" tabindex="0"${i ? ' hidden' : ''}>
            <div class="rt-format__head">
              <div>
                <p class="rt-format__for">${escapeHtml(f.for)}</p>
                <p class="rt-format__meta">${escapeHtml(f.meta)}</p>
              </div>
              <div class="rt-format__files">
                ${f.files
                  .map(
                    (file) => `<div class="rt-file">
                      <span class="rt-file__name">${icon('file-text', { size: 16 })}<code>${file.name}</code><span class="rt-file__size" data-size="${f.id}:${file.name}"></span></span>
                      <span class="rt-file__actions">
                        <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-copy-file="${f.id}:${file.name}">${icon('copy', { size: 16 })}${L('Copiar', 'Copy', 'Copiar')}</button>
                        <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-download="${f.id}:${file.name}">${icon('download', { size: 16 })}${L('Baixar', 'Download', 'Descargar')}</button>
                      </span>
                    </div>`,
                  )
                  .join('')}
              </div>
            </div>
            <pre class="ds-code ds-code--sm rt-format__preview" aria-label="${L('Começo do arquivo', 'Start of the file', 'Comienzo del archivo')} ${escapeHtml(f.files.at(-1).name)}"><code data-preview="${f.id}">${L('Montando…', 'Building…', 'Armando…')}</code></pre>
          </div>`,
        ).join('')}
      </div>
      <p class="rt-note">${icon('terminal', { size: 16 })}<span>${L(`Para gerar todos de uma vez, na pasta do projeto: ${ic('npm run tokens:export')}. Eles vão para ${ic('dist/tokens/')}.`, `To generate all of them at once, in the project folder: ${ic('npm run tokens:export')}. They go to ${ic('dist/tokens/')}.`, `Para generarlos todos de una vez, en la carpeta del proyecto: ${ic('npm run tokens:export')}. Van a ${ic('dist/tokens/')}.`)}</span></p>`,
    )}

    ${section(
      'rt-figma',
      L('Variáveis do Figma', 'Figma variables', 'Variables de Figma'),
      L('Três coleções e dois tipos de estilo. As primitivas guardam os tons; as semânticas dizem para que serve cada cor e mudam com o modo.', 'Three collections and two kinds of style. Primitives hold the tones; semantics say what each color is for and change with the mode.', 'Tres colecciones y dos tipos de estilo. Las primitivas guardan los tonos; las semánticas dicen para qué sirve cada color y cambian con el modo.'),
      `<p class="rt-note rt-note--plugin">${icon('component', { size: 16 })}<span>${L('Quer os componentes também? O <a class="rt-link" href="#/recursos/figma">Plugin do Figma</a> cria estas mesmas variáveis e, por cima delas, ícones e componentes com variantes, em blocos de documentação.', 'Want the components too? The <a class="rt-link" href="#/recursos/figma">Figma plugin</a> creates these same variables and, on top of them, icons and components with variants, in documentation blocks.', '¿Quieres los componentes también? El <a class="rt-link" href="#/recursos/figma">Plugin de Figma</a> crea estas mismas variables y, sobre ellas, íconos y componentes con variantes, en bloques de documentación.')}</span></p>
      <div class="rt-collections">
        <article class="rt-collection">
          <div class="rt-collection__preview" aria-hidden="true">${['100', '300', '500', '600', '800', '950'].map((s) => `<span style="background:var(--ds-color-brand-${s})"></span>`).join('')}</div>
          <p class="rt-collection__name">${COLLECTIONS.primitives}</p>
          <p class="rt-collection__count">${L(`${counts.primitives} cores · 1 modo`, `${counts.primitives} colors · 1 mode`, `${counts.primitives} colores · 1 modo`)}</p>
          <p class="rt-collection__text">${L('Todas as paletas, mais branco e preto. Escondidas da publicação e sem escopo: ninguém pinta com elas direto.', 'Every palette, plus white and black. Hidden from publishing and with no scope: no one paints with them directly.', 'Todas las paletas, más blanco y negro. Ocultas de la publicación y sin ámbito: nadie pinta con ellas directamente.')}</p>
        </article>
        <article class="rt-collection">
          <div class="rt-collection__preview rt-collection__preview--modes" aria-hidden="true">
            <span data-theme="dark"><i style="background:var(--ds-color-bg-canvas)"></i><i style="background:var(--ds-color-fg-default)"></i><i style="background:var(--ds-color-brand-solid)"></i></span>
            <span data-theme="light"><i style="background:var(--ds-color-bg-canvas)"></i><i style="background:var(--ds-color-fg-default)"></i><i style="background:var(--ds-color-brand-solid)"></i></span>
          </div>
          <p class="rt-collection__name">${COLLECTIONS.semantic}</p>
          <p class="rt-collection__count">${L(`${counts.semantic} cores · ${MODES.dark} e ${MODES.light}`, `${counts.semantic} colors · ${MODES.dark} (dark) and ${MODES.light} (light)`, `${counts.semantic} colores · ${MODES.dark} (oscuro) y ${MODES.light} (claro)`)}</p>
          <p class="rt-collection__text">${L(`${counts.aliases} valores apontam para uma primitiva (alias). Os ${counts.resolved} com transparência chegam como RGBA.`, `${counts.aliases} values point to a primitive (alias). The ${counts.resolved} with transparency arrive as RGBA.`, `${counts.aliases} valores apuntan a una primitiva (alias). Los ${counts.resolved} con transparencia llegan como RGBA.`)}</p>
        </article>
        <article class="rt-collection">
          <div class="rt-collection__preview rt-collection__preview--space" aria-hidden="true">${['100', '200', '300', '400', '600'].map((s) => `<span style="width:var(--ds-space-${s})"></span>`).join('')}</div>
          <p class="rt-collection__name">${COLLECTIONS.dimensions}</p>
          <p class="rt-collection__count">${L(`${counts.dimensions} números · 1 modo`, `${counts.dimensions} numbers · 1 mode`, `${counts.dimensions} números · 1 modo`)}</p>
          <p class="rt-collection__text">${L('Espaço, raio, traço, tamanhos, layout, breakpoints, desfoque e opacidade — cada um com o escopo certo.', 'Space, radius, stroke, sizes, layout, breakpoints, blur, and opacity — each with the right scope.', 'Espacio, radio, trazo, tamaños, layout, breakpoints, desenfoque y opacidad — cada uno con el ámbito correcto.')}</p>
        </article>
        <article class="rt-collection">
          <div class="rt-collection__preview rt-collection__preview--styles" aria-hidden="true"><span class="rt-aa">Aa</span><span class="rt-shadow"></span></div>
          <p class="rt-collection__name">${L('Estilos', 'Styles', 'Estilos')}</p>
          <p class="rt-collection__count">${L(`${counts.textStyles} de texto · ${counts.effectStyles} de sombra`, `${counts.textStyles} text · ${counts.effectStyles} shadow`, `${counts.textStyles} de texto · ${counts.effectStyles} de sombra`)}</p>
          <p class="rt-collection__text">${L('Os 19 estilos de texto e as 6 sombras, uma versão por tema — estilos do Figma não têm modos.', 'The 19 text styles and the 6 shadows, one version per theme — Figma styles have no modes.', 'Los 19 estilos de texto y las 6 sombras, una versión por tema — los estilos de Figma no tienen modos.')}</p>
        </article>
      </div>`,
    )}

    ${section(
      'rt-mapa',
      L('Mapa de tokens', 'Token map', 'Mapa de tokens'),
      L('Cada token, com o nome que ele ganha no Figma e o valor em cada modo. Procure por nome — no código ou no Figma.', 'Every token, with the name it gets in Figma and the value in each mode. Search by name — in code or in Figma.', 'Cada token, con el nombre que recibe en Figma y el valor en cada modo. Busca por nombre — en el código o en Figma.'),
      `<div class="rt-map">
        <div data-rt-filters></div>
        <div class="ds-table-wrap ds-table-wrap--scroll rt-map__table" role="region" aria-label="${L('Mapa de tokens para o Figma', 'Token map for Figma', 'Mapa de tokens para Figma')}" tabindex="0">
          <table class="ds-table ds-table--compact">
            <thead><tr><th scope="col">${L('No Figma · no código', 'In Figma · in code', 'En Figma · en el código')}</th><th scope="col">${L('Onde', 'Where', 'Dónde')}</th><th scope="col">${MODES.dark}</th><th scope="col">${MODES.light}</th></tr></thead>
            <tbody data-rt-rows></tbody>
          </table>
          <div class="ds-empty ds-empty--compact rt-map__empty" data-rt-empty hidden>
            <span class="ds-empty__icon">${icon('search-x', { size: 24 })}</span>
            <p class="ds-empty__title">${L('Nenhum token com esses filtros', 'No tokens with these filters', 'Ningún token con esos filtros')}</p>
            <p class="ds-empty__description">${L('Tente parte do nome, como “canvas” ou “space/200”, ou procure em todas as coleções.', 'Try part of the name, like “canvas” or “space/200”, or search all collections.', 'Prueba parte del nombre, como “canvas” o “space/200”, o busca en todas las colecciones.')}</p>
            <div class="ds-empty__actions"><button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-rt-clear>${L('Limpar filtros', 'Clear filters', 'Limpiar filtros')}</button></div>
          </div>
        </div>
      </div>`,
    )}

    ${section(
      'rt-nomes',
      L('Regras de nome', 'Naming rules', 'Reglas de nombre'),
      L('O nome é o mesmo dos dois lados, só muda a pontuação. Quem conhece o token no código acha a variável no Figma.', 'The name is the same on both sides; only the punctuation changes. Whoever knows the token in code finds the variable in Figma.', 'El nombre es el mismo de los dos lados, solo cambia la puntuación. Quien conoce el token en el código encuentra la variable en Figma.'),
      `<div class="doc-table rt-naming">
        <div class="doc-table__head" aria-hidden="true"><span>${L('No código', 'In code', 'En el código')}</span><span>${L('No Figma', 'In Figma', 'En Figma')}</span><span>${L('Por quê', 'Why', 'Por qué')}</span></div>
        ${NAMING().map(([a, b, why]) => `<div class="doc-table__row"><code>${escapeHtml(a)}</code><code class="rt-naming__figma">${escapeHtml(b)}</code><span class="rt-naming__why">${why}</span></div>`).join('')}
      </div>
      <h3 class="doc-subhead">${L('Escopos', 'Scopes', 'Ámbitos')} <span class="doc-subhead__meta">${L('onde cada variável aparece no seletor', 'where each variable shows in the picker', 'dónde aparece cada variable en el selector')}</span></h3>
      <div class="doc-table rt-scopes">
        <div class="doc-table__head" aria-hidden="true"><span>Tokens</span><span>${L('Aparece em', 'Shows in', 'Aparece en')}</span></div>
        ${SCOPES().map(([a, b]) => `<div class="doc-table__row"><code>${escapeHtml(a)}</code><span>${b}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'rt-conversao',
      L('O que muda no Figma', 'What changes in Figma', 'Qué cambia en Figma'),
      L('Quase tudo chega igual. O que o Figma não representa vira a forma mais próxima — e fica registrado aqui.', 'Almost everything arrives the same. What Figma can’t represent becomes the closest form — and it’s recorded here.', 'Casi todo llega igual. Lo que Figma no representa se vuelve la forma más cercana — y queda registrado aquí.'),
      `<div class="doc-table rt-changes">
        <div class="doc-table__head" aria-hidden="true"><span>${L('No código', 'In code', 'En el código')}</span><span>${L('No Figma', 'In Figma', 'En Figma')}</span><span>${L('Detalhe', 'Detail', 'Detalle')}</span></div>
        ${CHANGES().map(([a, b, d]) => `<div class="doc-table__row"><code>${escapeHtml(a)}</code><span class="rt-changes__to">${icon('arrow-right', { size: 14 })}${b}</span><span class="rt-changes__detail">${d}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'rt-importar',
      L('Passo a passo de importação', 'Import step by step', 'Paso a paso de importación'),
      L('Dois caminhos. O plugin funciona em qualquer plano e atualiza sem duplicar; a API REST é para criar tudo de uma vez num arquivo novo, em planos Enterprise.', 'Two paths. The plugin works on any plan and updates without duplicating; the REST API is for creating everything at once in a new file, on Enterprise plans.', 'Dos caminos. El plugin funciona en cualquier plan y actualiza sin duplicar; la API REST es para crear todo de una vez en un archivo nuevo, en planes Enterprise.'),
      `<div class="rt-routes">
        <article class="rt-route">
          <p class="rt-route__head"><span class="ds-badge ds-badge--sm ds-badge--brand">${L('Recomendado', 'Recommended', 'Recomendado')}</span><span class="rt-route__title">${L('Plugin de desenvolvimento', 'Development plugin', 'Plugin de desarrollo')}</span></p>
          <ol class="rt-steps" role="list">
            ${PLUGIN_STEPS().map(([t, d], i) => `<li class="rt-step"><span class="rt-step__num">${i + 1}</span><div><p class="rt-step__title">${t}</p><p class="rt-step__text">${d}</p></div></li>`).join('')}
          </ol>
        </article>
        <article class="rt-route">
          <p class="rt-route__head"><span class="ds-badge ds-badge--sm">Enterprise</span><span class="rt-route__title">${L('API REST', 'REST API', 'API REST')}</span></p>
          <p class="rt-route__text">${L(`Um POST com o arquivo ${ic('figma-variables.rest.json')}. Os ids no arquivo são temporários: o Figma troca pelos definitivos e devolve o mapa na resposta.`, `A POST with the ${ic('figma-variables.rest.json')} file. The ids in the file are temporary: Figma replaces them with the final ones and returns the map in the response.`, `Un POST con el archivo ${ic('figma-variables.rest.json')}. Los ids en el archivo son temporales: Figma los cambia por los definitivos y devuelve el mapa en la respuesta.`)}</p>
          ${codeBlock(curl())}
          <p class="rt-route__text">${icon('lock', { size: 16 })}<span>${L('O token pessoal é seu. Use variável de ambiente e nunca escreva o valor em arquivo do projeto.', 'The personal token is yours. Use an environment variable and never write the value in a project file.', 'El token personal es tuyo. Usa una variable de entorno y nunca escribas el valor en un archivo del proyecto.')}</span></p>
        </article>
      </div>`,
    )}

    ${section(
      'rt-sync',
      L('Sincronização', 'Sync', 'Sincronización'),
      L('O JSON ganha. Mudou no Figma? A mudança volta como pull request nos tokens — e só depois de revisada chega de novo ao Figma.', 'The JSON wins. Changed something in Figma? The change comes back as a pull request on the tokens — and only after review does it reach Figma again.', 'El JSON gana. ¿Cambió en Figma? El cambio vuelve como pull request en los tokens — y solo después de revisado llega de nuevo a Figma.'),
      `<ol class="rt-sync" role="list">
        ${SYNC().map(([stamp, t, d]) => `<li class="rt-sync__item"><p class="ds-section__head"><span class="ds-section__stamp">${stamp}</span><span>${t}</span></p><p class="rt-sync__text">${d}</p></li>`).join('')}
      </ol>
      <div class="rt-versions">
        <div class="rt-version"><p class="rt-version__num"><span>1</span>.0.0</p><p class="rt-version__text">${L('Renomear ou remover token: quebra quem usa. Versão maior, com o nome antigo e o novo nas Novidades.', 'Renaming or removing a token: breaks whoever uses it. A major version, with the old and new names in What’s new.', 'Renombrar o quitar un token: rompe a quien lo usa. Versión mayor, con el nombre antiguo y el nuevo en Novedades.')}</p></div>
        <div class="rt-version"><p class="rt-version__num">0.<span>1</span>.0</p><p class="rt-version__text">${L('Token novo ou valor ajustado: versão menor.', 'New token or adjusted value: minor version.', 'Token nuevo o valor ajustado: versión menor.')}</p></div>
        <div class="rt-version"><p class="rt-version__num">0.0.<span>1</span></p><p class="rt-version__text">${L('Descrição, escopo ou correção sem mudar valor: correção.', 'Description, scope, or a fix without changing values: patch.', 'Descripción, ámbito o corrección sin cambiar valor: corrección.')}</p></div>
      </div>
      <a class="ds-inline-action rt-sync__link" href="#/novidades">${icon('history', { size: 16 })}${L('Ver o histórico em Novidades', 'See the history in What’s new', 'Ver el historial en Novedades')}${icon('arrow-right', { size: 14 })}</a>`,
    )}

    ${section(
      'rt-limites',
      L('Limitações', 'Limitations', 'Limitaciones'),
      L('O que a exportação não faz — para ninguém descobrir no meio de uma entrega.', 'What the export doesn’t do — so no one finds out in the middle of a delivery.', 'Lo que la exportación no hace — para que nadie lo descubra en medio de una entrega.'),
      `<ul class="rt-limits" role="list">
        ${LIMITS().map(([t, d]) => `<li class="rt-limit"><span class="rt-limit__icon">${icon('alert-triangle', { size: 16 })}</span><div><p class="rt-limit__title">${t}</p><p class="rt-limit__text">${d}</p></div></li>`).join('')}
      </ul>`,
    )}

    ${section(
      'rt-codigo',
      L('Código', 'Code', 'Código'),
      L('O exportador é um módulo puro: as mesmas funções rodam no navegador (esta página) e no Node (o script).', 'The exporter is a pure module: the same functions run in the browser (this page) and in Node (the script).', 'El exportador es un módulo puro: las mismas funciones se ejecutan en el navegador (esta página) y en Node (el script).'),
      `${codeBlock(codeScripts())}
      <h3 class="doc-subhead">${L('No JavaScript', 'In JavaScript', 'En JavaScript')}</h3>
      ${codeBlock(codeApi())}
      <h3 class="doc-subhead">${L('Lendo o JSON plano', 'Reading the flat JSON', 'Leyendo el JSON plano')}</h3>
      ${codeBlock(CODE_FLAT)}`,
    )}

    ${section(
      'rt-uso',
      L('Uso', 'Usage', 'Uso'),
      L('Variáveis só ajudam se todo mundo pinta com as mesmas.', 'Variables only help if everyone paints with the same ones.', 'Las variables solo ayudan si todo el mundo pinta con las mismas.'),
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: pinte com as semânticas', 'Do: paint with semantics', 'Haz: pinta con las semánticas')}</p>
          <p class="usage-card__text">${L(`${ic('color/bg/canvas')} no fundo, ${ic('color/fg/muted')} no texto de apoio. Troque o modo do frame e a tela inteira muda de tema.`, `${ic('color/bg/canvas')} for the background, ${ic('color/fg/muted')} for supporting text. Switch the frame’s mode and the whole screen changes theme.`, `${ic('color/bg/canvas')} en el fondo, ${ic('color/fg/muted')} en el texto de apoyo. Cambia el modo del frame y toda la pantalla cambia de tema.`)}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: primitivas no layout', 'Avoid: primitives in layouts', 'Evita: primitivas en el layout')}</p>
          <p class="usage-card__text">${L(`${ic('neutral/925')} não muda com o tema e não diz para que serve. Por isso as primitivas ficam fora do seletor.`, `${ic('neutral/925')} doesn’t change with the theme and doesn’t say what it’s for. That’s why primitives stay out of the picker.`, `${ic('neutral/925')} no cambia con el tema y no dice para qué sirve. Por eso las primitivas quedan fuera del selector.`)}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: editar valor no Figma', 'Avoid: editing values in Figma', 'Evita: editar valores en Figma')}</p>
          <p class="usage-card__text">${L(`A próxima exportação sobrescreve. Precisa de outro tom? Abra um pull request em ${ic('tokens/')}.`, `The next export overwrites it. Need another tone? Open a pull request in ${ic('tokens/')}.`, `La próxima exportación lo sobrescribe. ¿Necesitas otro tono? Abre un pull request en ${ic('tokens/')}.`)}</p>
        </article>
      </div>`,
    )}
  </div>`;
}

/* ───────── Comportamento ───────── */

function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {}
  area.remove();
  return ok;
}

const cantBuild = () => L('Não foi possível montar este arquivo agora.', 'Couldn’t build this file right now.', 'No se pudo armar este archivo ahora.');

async function copyFile(name, text) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    ok = legacyCopy(text);
  }
  toast(ok ? L(`${name} copiado`, `${name} copied`, `${name} copiado`) : L('Não foi possível copiar', 'Couldn’t copy', 'No se pudo copiar'), { icon: ok ? 'check' : 'alert-circle' });
}

function downloadFile(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast(L(`${name} pronto`, `${name} ready`, `${name} listo`), { icon: 'download' });
}

export function mount(root) {
  const cleanups = [mountCodeCopy(root), mountDocNav(root), mountTabs(root)];
  const formats = FORMATS();
  const rows = ROWS();
  let alive = true;
  cleanups.push(() => (alive = false));

  const findFile = (key) => {
    const [id, name] = key.split(':');
    const format = formats.find((f) => f.id === id);
    return { format, file: format?.files.find((f) => f.name === name) };
  };

  /* Prévias e tamanhos: só quando a aba aparece */
  const shown = new Set();
  const fill = async (id) => {
    if (shown.has(id)) return;
    shown.add(id);
    const f = formats.find((x) => x.id === id);
    const el = root.querySelector(`[data-preview="${id}"]`);
    try {
      const text = await preview(f);
      if (!alive) return;
      el.textContent = text;
      for (const file of f.files) {
        const size = root.querySelector(`[data-size="${id}:${file.name}"]`);
        if (size) size.textContent = kb(await file.content());
      }
    } catch {
      if (alive) el.textContent = cantBuild();
      shown.delete(id);
    }
  };
  fill(formats[0].id);
  const onTab = (event) => {
    const id = event.detail?.id?.replace('rt-tab-', '');
    if (id) fill(id);
  };
  root.addEventListener('ds:tabchange', onTab);
  cleanups.push(() => root.removeEventListener('ds:tabchange', onTab));

  const onClick = async (event) => {
    const copy = event.target.closest('[data-copy-file]');
    const down = event.target.closest('[data-download]');
    const target = copy ?? down;
    if (!target) return;
    const { file } = findFile(copy ? copy.dataset.copyFile : down.dataset.download);
    if (!file) return;
    try {
      const text = await file.content();
      if (!alive) return;
      if (copy) copyFile(file.name, text);
      else downloadFile(file.name, text, file.type);
    } catch {
      toast(cantBuild(), { icon: 'alert-circle' });
    }
  };
  root.addEventListener('click', onClick);
  cleanups.push(() => root.removeEventListener('click', onClick));

  /* Mapa de tokens com filtros */
  const tbody = root.querySelector('[data-rt-rows]');
  const empty = root.querySelector('[data-rt-empty]');
  let filters = null;
  const render = (state) => {
    const q = normalize(state.q ?? '').trim().replace(/\s+/g, ' ');
    const list = rows.filter((r) => {
      if (state.onde && r.kind !== state.onde) return false;
      if (!q) return true;
      const hay = normalize(`${r.token} ${r.figma}`);
      return hay.includes(q) || hay.includes(q.replaceAll('/', '.'));
    });
    tbody.innerHTML = list.map(rowHtml).join('');
    tbody.closest('table').hidden = !list.length;
    empty.hidden = list.length > 0;
    filters?.setCount(list.length, rows.length);
  };
  filters = createFilters(root.querySelector('[data-rt-filters]'), {
    label: L('Filtrar tokens', 'Filter tokens', 'Filtrar tokens'),
    search: { placeholder: L('Buscar token ou variável — ex.: canvas, space/200', 'Search token or variable — e.g., canvas, space/200', 'Buscar token o variable — p. ej.: canvas, space/200') },
    fields: [{ id: 'onde', label: L('Onde', 'Where', 'Dónde'), allLabel: L('Tudo', 'All', 'Todo'), options: KINDS() }],
    value: { onde: 'semanticos' },
    noun: ['token', 'tokens'],
    onChange: render,
  });
  render(filters.state);
  cleanups.push(() => filters.destroy());

  const onClear = (event) => {
    if (event.target.closest('[data-rt-clear]')) filters.clear();
  };
  root.addEventListener('click', onClear);
  cleanups.push(() => root.removeEventListener('click', onClear));

  return () => cleanups.forEach((fn) => fn?.());
}
