import { icon } from '../../ds/icons/icons.js';
import data, { contrast } from '../../ds/tokens.js';
import { tokenModel, figmaVariables, figmaRestPayload, figmaPlugin, toDTCG, toFlat, exportCounts, figmaName, COLLECTIONS, MODES } from '../../ds/js/token-export.js';
import { createFilters } from '../../ds/js/filters.js';
import { mountTabs } from '../../ds/js/tabs.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-tokens.css'];

/* ───────── Dados ───────── */

const model = tokenModel(data);
const counts = exportCounts(data);
const passed = contrast.filter((c) => c.pass).length;
const n = (v) => v.toLocaleString('pt-BR');
const json = (v) => `${JSON.stringify(v, null, 2)}\n`;
const kb = (s) => `${(new Blob([s]).size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`;

/** Os arquivos só são montados quando alguém pede (a página abre leve). */
const cache = new Map();
const lazy = (key, make) => () => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};
const plugin = lazy('plugin', () => figmaPlugin(data));

const FORMATS = [
  {
    id: 'plugin',
    label: 'Plugin do Figma',
    icon: 'package',
    for: 'Qualquer plano do Figma. Cria e, nas próximas vezes, atualiza variáveis e estilos pelo nome.',
    meta: `${counts.variables} variáveis · ${counts.textStyles + counts.effectStyles} estilos`,
    files: [
      { name: 'manifest.json', type: 'application/json', content: () => plugin().manifest },
      { name: 'code.js', type: 'text/javascript', content: () => plugin().code },
    ],
    preview: () => {
      const runtime = plugin().code.split('\n').slice(3, 15).join('\n');
      return `// manifest.json\n${plugin().manifest}\n// code.js\nconst DATA = { /* ${counts.variables} variáveis, ${counts.textStyles + counts.effectStyles} estilos */ };\n${runtime}\n…`;
    },
  },
  {
    id: 'rest',
    label: 'API REST',
    icon: 'globe',
    for: 'Corpo do POST /v1/files/:file_key/variables. Cria as três coleções num arquivo novo de uma vez.',
    meta: `${counts.variables} variáveis · ${n(counts.primitives + counts.semantic * 2 + counts.dimensions)} valores por modo`,
    files: [{ name: 'figma-variables.rest.json', type: 'application/json', content: lazy('rest', () => json(figmaRestPayload(data))) }],
  },
  {
    id: 'figma',
    label: 'Figma (JSON)',
    icon: 'layers',
    for: 'As coleções, os modos e os estilos num formato simples de ler — é o que o plugin usa por dentro.',
    meta: `3 coleções · ${counts.aliases} aliases · ${counts.resolved} cores com transparência`,
    files: [{ name: 'figma-variables.json', type: 'application/json', content: lazy('figma', () => json(figmaVariables(data))) }],
  },
  {
    id: 'dtcg',
    label: 'DTCG',
    icon: 'file-text',
    for: 'Padrão W3C de design tokens. Para Tokens Studio, Style Dictionary e outros leitores do formato.',
    meta: `${n(counts.tokens)} tokens · temas em $extensions`,
    files: [{ name: 'tokens.dtcg.json', type: 'application/json', content: lazy('dtcg', () => json(toDTCG(data))) }],
  },
  {
    id: 'flat',
    label: 'JSON plano',
    icon: 'code',
    for: 'Nome → valor, com escuro e claro lado a lado. Para scripts, testes e apps em JS ou TS.',
    meta: `${n(counts.tokens)} tokens · uma chave por token`,
    files: [{ name: 'tokens.flat.json', type: 'application/json', content: lazy('flat', () => json(toFlat(data))) }],
  },
  {
    id: 'css',
    label: 'CSS',
    icon: 'hash',
    for: 'As variáveis que os componentes consomem — o mesmo ds/tokens.css que o site usa.',
    meta: `${n(data.tokens.length + counts.primitives)} variáveis · 2 temas`,
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

const ROWS = [
  ...model.primitives.map((p) => ({ kind: 'primitivas', token: p.name, figma: figmaName(p.name), collection: COLLECTIONS.primitives, type: 'Cor', dark: `${swatch(p.value)}<code>${p.value.toUpperCase()}</code>`, light: '<span class="rt-same">mesmo valor</span>' })),
  ...model.semantic.map((s) => ({ kind: 'semanticos', token: s.name, figma: figmaName(s.name), collection: COLLECTIONS.semantic, type: 'Cor', dark: aliasCell(s.values.dark), light: aliasCell(s.values.light) })),
  ...model.dimensions.map((d) => ({ kind: 'dimensoes', token: d.name, figma: figmaName(d.name), collection: COLLECTIONS.dimensions, type: 'Número', dark: `<code>${n(d.value)}</code><span class="rt-unit">${d.unit}</span>`, light: '<span class="rt-same">mesmo valor</span>' })),
  ...model.textStyles.map((t) => ({
    kind: 'texto',
    token: t.name,
    figma: figmaName(t.name),
    collection: 'Estilo de texto',
    type: 'Texto',
    dark: `<span class="rt-value"><code>${escapeHtml(`${t.fontFamily} ${t.fontStyle}`)}</code><span class="rt-value__hex">${t.fontSize}/${t.lineHeight} · ${n(t.letterSpacing)}%${t.textCase === 'UPPER' ? ' · maiúsculas' : ''}</span></span>`,
    light: '<span class="rt-same">sem tema</span>',
  })),
  ...[...new Set(model.effectStyles.map((e) => e.token))].map((token) => {
    const cell = (mode) => {
      const e = model.effectStyles.find((x) => x.token === token && x.mode === mode);
      return `<span class="rt-value"><code>${escapeHtml(`${MODES[mode]}/${figmaName(token)}`)}</code><span class="rt-value__hex">${e.layers.length} ${e.layers.length > 1 ? 'camadas' : 'camada'}</span></span>`;
    };
    return { kind: 'sombra', token, figma: `${MODES.dark}|${MODES.light}/${figmaName(token)}`, collection: 'Estilo de sombra', type: 'Efeito', dark: cell('dark'), light: cell('light') };
  }),
];

const KINDS = [
  { value: 'primitivas', label: COLLECTIONS.primitives },
  { value: 'semanticos', label: COLLECTIONS.semantic },
  { value: 'dimensoes', label: COLLECTIONS.dimensions },
  { value: 'texto', label: 'Estilos de texto' },
  { value: 'sombra', label: 'Estilos de sombra' },
];

const normalize = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const rowHtml = (r) => `<tr>
  <td><span class="rt-name"><code class="rt-figma">${escapeHtml(r.figma)}</code><code class="rt-token">${escapeHtml(r.token)}</code></span></td>
  <td><span class="ds-badge ds-badge--sm">${escapeHtml(r.collection)}</span></td>
  <td><span class="rt-cell">${r.dark}</span></td>
  <td><span class="rt-cell">${r.light}</span></td>
</tr>`;

/* Textos */

const CHANGES = [
  ['Cor em OKLCH', 'Hex sRGB', 'O build já recorta cada tom para caber no sRGB; o Figma recebe o hex final. O OKLCH fica na descrição da variável.'],
  ['alpha({cor}, 0.06)', 'RGBA resolvida', 'O Figma não mistura transparência com alias. Bordas e fundos translúcidos viram uma cor com alfa, sem vínculo com a primitiva.'],
  ['Tema escuro e claro', 'Modos Escuro e Claro', 'Só a coleção Semânticos tem modos. Troque o modo num frame e tudo dentro dele muda de tema.'],
  ['rem (1rem = 16 px)', 'px', 'Dimensões chegam em pixels. Opacidade vai de 0 a 100, como o Figma pede.'],
  ['font: 600 16px/28px Inter', 'Estilo de texto', 'Família, peso, tamanho, entrelinha em px e espaçamento em %. text-transform: uppercase vira maiúsculas.'],
  ['box-shadow por tema', 'Dois estilos de sombra', 'Estilos do Figma não têm modos: cada sombra vira Escuro/shadow/md e Claro/shadow/md.'],
];

const NAMING = [
  ['color.bg.canvas', 'color/bg/canvas', 'Pontos viram barras — e cada barra vira uma pasta no Figma.'],
  ['--ds-color-bg-canvas', 'var(--ds-color-bg-canvas)', 'Vai como “code syntax” (Web): no Dev Mode, quem inspeciona copia a variável CSS certa.'],
  ['color.neutral.925', 'Primitivas › color/neutral/925', 'Primitivas ficam escondidas da publicação e sem escopo: servem só de alias.'],
  ['text.heading-md', 'text/heading-md', 'Estilos de texto usam o mesmo nome do token, sem o prefixo ds.'],
];

const SCOPES = [
  ['bg.*', 'Preenchimento de frame e de forma'],
  ['fg.*, *.fg, *.on-solid', 'Texto, forma e traço (ícones)'],
  ['border.*, *.border', 'Traço'],
  ['brand, success, warning, danger, info', 'Preenchimentos e traço'],
  ['chart.*', 'Forma e traço'],
  ['space.*', 'Espaçamento (gap) e tamanho'],
  ['radius.*', 'Raio de canto'],
  ['size, layout, breakpoint', 'Largura e altura'],
  ['border-width, focus-ring', 'Espessura de traço'],
  ['blur.*', 'Desfoque de efeito'],
  ['opacity.*', 'Opacidade'],
];

const LIMITS = [
  ['A API REST de variáveis só escreve em planos Enterprise', 'E o corpo só cria (CREATE): rodar duas vezes no mesmo arquivo duplica tudo. Para manter em dia, use o plugin.'],
  ['Transparência não vira alias', `${counts.resolved} valores semânticos com alfa chegam como RGBA. Se a primitiva mudar, esses mudam na próxima exportação — não sozinhos.`],
  ['Estilos não têm modos', 'Sombras viram dois estilos, um por tema. Texto não muda com o tema, então é um estilo só.'],
  ['Fontes precisam estar instaladas', 'O plugin pula o estilo de texto cuja fonte falta (Inter, Inter Tight, JetBrains Mono) e avisa qual foi no fim.'],
  ['Movimento, z-index e degradê ficam fora do Figma', 'Durações, curvas, camadas e o degradê do divisor estão no DTCG e no CSS, mas não viram variáveis.'],
  ['Renomear é criar', 'O plugin acha cada variável pelo nome. Um token renomeado nasce como variável nova e a antiga continua no arquivo até alguém apagar.'],
];

const SYNC = [
  ['01', 'Edite o JSON', 'Toda mudança começa em tokens/*.json, num pull request. É ali que a revisão acontece.'],
  ['02', 'Gere e confira', `npm run tokens recria o CSS e o JS e confere o contraste (hoje ${passed}/${contrast.length}). Se cair abaixo do mínimo, o relatório avisa.`],
  ['03', 'Exporte', 'npm run tokens:export escreve dist/tokens/ — os mesmos arquivos que esta página baixa.'],
  ['04', 'Rode o plugin na biblioteca', 'No arquivo da biblioteca do Figma, rode o plugin de novo: ele atualiza pelo nome, sem duplicar.'],
  ['05', 'Publique e anote', 'Publique a biblioteca e registre a mudança em Novidades. Renomear ou remover token é versão maior.'],
];

const CURL = `# 1. Gere os arquivos
npm run tokens:export

# 2. Use um token pessoal com escopo file_variables:write — nunca no código
export FIGMA_TOKEN="seu-token-pessoal"
export FILE_KEY="chave-do-arquivo"   # o trecho depois de /design/ na URL

# 3. Envie as variáveis (cria as três coleções)
curl -X POST "https://api.figma.com/v1/files/$FILE_KEY/variables" \\
  -H "X-Figma-Token: $FIGMA_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data @dist/tokens/figma-variables.rest.json`;

const PLUGIN_STEPS = [
  ['Gere os arquivos', 'npm run tokens:export — ou baixe manifest.json e code.js nesta página, na mesma pasta.'],
  ['Importe o plugin', 'No Figma desktop: Plugins › Desenvolvimento › Importar plugin do manifesto… e escolha dist/tokens/figma-plugin/manifest.json.'],
  ['Rode no arquivo da biblioteca', 'Plugins › Desenvolvimento › Órbita · importar tokens. Ele cria as coleções, os modos, as variáveis e os estilos.'],
  ['Confira o recado no fim', 'O plugin diz quantas variáveis criou ou atualizou e se faltou alguma fonte.'],
  ['Para atualizar, rode de novo', 'Exporte outra vez e rode o mesmo plugin: ele acha tudo pelo nome e troca só os valores.'],
];

const CODE_API = `import data from './ds/tokens.js';
import { figmaVariables, figmaRestPayload, figmaPlugin, toDTCG, toFlat } from './ds/js/token-export.js';

figmaVariables(data);    // coleções + estilos, formato simples
figmaRestPayload(data);  // corpo do POST /v1/files/:file_key/variables
figmaPlugin(data);       // { manifest, code } do plugin de desenvolvimento
toDTCG(data);            // W3C Design Tokens
toFlat(data);            // { tokens: { 'color.bg.canvas': { dark, light, cssVar } } }`;

const CODE_FLAT = `import flat from './dist/tokens/tokens.flat.json' with { type: 'json' };

const canvas = flat.tokens['color.bg.canvas'];
canvas.dark;    // '#1d1b18'
canvas.light;   // '#f9f5f1'
canvas.cssVar;  // '--ds-color-bg-canvas'`;

const CODE_SCRIPTS = `npm run tokens          # tokens/*.json → ds/tokens.css e ds/tokens.js (+ contraste)
npm run tokens:export   # ds/tokens.js → dist/tokens/ (Figma, DTCG, JSON plano, CSS)`;

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

const flowNode = (ic, title, lines, code) => `<div class="rt-flow__node">
  <span class="rt-flow__icon">${icon(ic, { size: 18 })}</span>
  <p class="rt-flow__title">${title}</p>
  ${code ? `<code class="rt-flow__code">${code}</code>` : ''}
  <ul class="rt-flow__list" role="list">${lines.map((l) => `<li>${l}</li>`).join('')}</ul>
</div>`;

const arrow = `<span class="rt-flow__arrow" aria-hidden="true">${icon('arrow-right', { size: 18 })}</span>`;

export default function renderTokens(page) {
  return `
  <div class="page doc rt-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Tokens para Figma</h1>
        <p class="doc-header__lead">Os mesmos tokens do código, no Figma e em qualquer ferramenta: variáveis com modo escuro e claro, estilos de texto e sombra — tudo gerado do JSON, sem copiar valor à mão.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">variáveis no Figma</dt><dd class="doc-stat__value">${counts.variables}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">modos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estilos</dt><dd class="doc-stat__value">${counts.textStyles + counts.effectStyles}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">formatos</dt><dd class="doc-stat__value">${FORMATS.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['rt-origem', 'De onde vem'],
        ['rt-formatos', 'Formato'],
        ['rt-figma', 'Variáveis do Figma'],
        ['rt-mapa', 'Mapa de tokens'],
        ['rt-nomes', 'Regras de nome'],
        ['rt-conversao', 'O que muda'],
        ['rt-importar', 'Importar'],
        ['rt-sync', 'Sincronização'],
        ['rt-limites', 'Limitações'],
        ['rt-codigo', 'Código'],
        ['rt-uso', 'Uso'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    ${section(
      'rt-origem',
      'De onde vem',
      'Uma fonte só: os arquivos em <code class="ds-inline-code">tokens/</code>. O resto é gerado — por isso o Figma e o código nunca discordam.',
      `<div class="rt-flow">
        ${flowNode('file-text', 'Fonte', ['palettes.json · 13 paletas em OKLCH', 'foundation.json · espaço, raio, tamanhos', 'typography.json · 19 estilos', 'semantic.json · cores por tema', 'effects.json · sombras'], 'tokens/*.json')}
        ${arrow}
        ${flowNode('refresh', 'Build', ['OKLCH → hex dentro do sRGB', 'referências e transparências resolvidas', `contraste conferido · ${passed}/${contrast.length}`], 'npm run tokens')}
        ${arrow}
        ${flowNode('layers', 'Saídas', ['ds/tokens.css · os componentes', 'ds/tokens.js · esta documentação', 'dist/tokens/ · Figma, DTCG e JSON, com npm run tokens:export'])}
      </div>`,
    )}

    ${section(
      'rt-formatos',
      'Formato',
      'Seis arquivos, um para cada destino. Tudo é montado aqui mesmo, no navegador, a partir dos tokens desta versão — nada sai da sua máquina.',
      `<div class="ds-tabs rt-formats" data-ds-tabs>
        <div class="ds-tabs__list" role="tablist" aria-label="Formatos de exportação">
          ${FORMATS.map((f, i) => `<button type="button" class="ds-tabs__tab" role="tab" id="rt-tab-${f.id}" aria-controls="rt-panel-${f.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${icon(f.icon, { size: 16 })}<span>${f.label}</span></button>`).join('')}
        </div>
        ${FORMATS.map(
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
                        <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-copy-file="${f.id}:${file.name}">${icon('copy', { size: 16 })}Copiar</button>
                        <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-download="${f.id}:${file.name}">${icon('download', { size: 16 })}Baixar</button>
                      </span>
                    </div>`,
                  )
                  .join('')}
              </div>
            </div>
            <pre class="ds-code ds-code--sm rt-format__preview" aria-label="Começo do arquivo ${escapeHtml(f.files.at(-1).name)}"><code data-preview="${f.id}">Montando…</code></pre>
          </div>`,
        ).join('')}
      </div>
      <p class="rt-note">${icon('terminal', { size: 16 })}<span>Para gerar todos de uma vez, na pasta do projeto: <code class="ds-inline-code">npm run tokens:export</code>. Eles vão para <code class="ds-inline-code">dist/tokens/</code>.</span></p>`,
    )}

    ${section(
      'rt-figma',
      'Variáveis do Figma',
      'Três coleções e dois tipos de estilo. As primitivas guardam os tons; as semânticas dizem para que serve cada cor e mudam com o modo.',
      `<p class="rt-note rt-note--plugin">${icon('component', { size: 16 })}<span>Quer os componentes também? O <a class="rt-link" href="#/recursos/figma">Plugin do Figma</a> cria estas mesmas variáveis e, por cima delas, ícones e componentes com variantes, em blocos de documentação.</span></p>
      <div class="rt-collections">
        <article class="rt-collection">
          <div class="rt-collection__preview" aria-hidden="true">${['100', '300', '500', '600', '800', '950'].map((s) => `<span style="background:var(--ds-color-brand-${s})"></span>`).join('')}</div>
          <p class="rt-collection__name">${COLLECTIONS.primitives}</p>
          <p class="rt-collection__count">${counts.primitives} cores · 1 modo</p>
          <p class="rt-collection__text">Todas as paletas, mais branco e preto. Escondidas da publicação e sem escopo: ninguém pinta com elas direto.</p>
        </article>
        <article class="rt-collection">
          <div class="rt-collection__preview rt-collection__preview--modes" aria-hidden="true">
            <span data-theme="dark"><i style="background:var(--ds-color-bg-canvas)"></i><i style="background:var(--ds-color-fg-default)"></i><i style="background:var(--ds-color-brand-solid)"></i></span>
            <span data-theme="light"><i style="background:var(--ds-color-bg-canvas)"></i><i style="background:var(--ds-color-fg-default)"></i><i style="background:var(--ds-color-brand-solid)"></i></span>
          </div>
          <p class="rt-collection__name">${COLLECTIONS.semantic}</p>
          <p class="rt-collection__count">${counts.semantic} cores · ${MODES.dark} e ${MODES.light}</p>
          <p class="rt-collection__text">${counts.aliases} valores apontam para uma primitiva (alias). Os ${counts.resolved} com transparência chegam como RGBA.</p>
        </article>
        <article class="rt-collection">
          <div class="rt-collection__preview rt-collection__preview--space" aria-hidden="true">${['100', '200', '300', '400', '600'].map((s) => `<span style="width:var(--ds-space-${s})"></span>`).join('')}</div>
          <p class="rt-collection__name">${COLLECTIONS.dimensions}</p>
          <p class="rt-collection__count">${counts.dimensions} números · 1 modo</p>
          <p class="rt-collection__text">Espaço, raio, traço, tamanhos, layout, breakpoints, desfoque e opacidade — cada um com o escopo certo.</p>
        </article>
        <article class="rt-collection">
          <div class="rt-collection__preview rt-collection__preview--styles" aria-hidden="true"><span class="rt-aa">Aa</span><span class="rt-shadow"></span></div>
          <p class="rt-collection__name">Estilos</p>
          <p class="rt-collection__count">${counts.textStyles} de texto · ${counts.effectStyles} de sombra</p>
          <p class="rt-collection__text">Os 19 estilos de texto e as 6 sombras, uma versão por tema — estilos do Figma não têm modos.</p>
        </article>
      </div>`,
    )}

    ${section(
      'rt-mapa',
      'Mapa de tokens',
      'Cada token, com o nome que ele ganha no Figma e o valor em cada modo. Procure por nome — no código ou no Figma.',
      `<div class="rt-map">
        <div data-rt-filters></div>
        <div class="ds-table-wrap ds-table-wrap--scroll rt-map__table" role="region" aria-label="Mapa de tokens para o Figma" tabindex="0">
          <table class="ds-table ds-table--compact">
            <thead><tr><th scope="col">No Figma · no código</th><th scope="col">Onde</th><th scope="col">${MODES.dark}</th><th scope="col">${MODES.light}</th></tr></thead>
            <tbody data-rt-rows></tbody>
          </table>
          <div class="ds-empty ds-empty--compact rt-map__empty" data-rt-empty hidden>
            <span class="ds-empty__icon">${icon('search-x', { size: 24 })}</span>
            <p class="ds-empty__title">Nenhum token com esses filtros</p>
            <p class="ds-empty__description">Tente parte do nome, como “canvas” ou “space/200”, ou procure em todas as coleções.</p>
            <div class="ds-empty__actions"><button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-rt-clear>Limpar filtros</button></div>
          </div>
        </div>
      </div>`,
    )}

    ${section(
      'rt-nomes',
      'Regras de nome',
      'O nome é o mesmo dos dois lados, só muda a pontuação. Quem conhece o token no código acha a variável no Figma.',
      `<div class="doc-table rt-naming">
        <div class="doc-table__head" aria-hidden="true"><span>No código</span><span>No Figma</span><span>Por quê</span></div>
        ${NAMING.map(([a, b, why]) => `<div class="doc-table__row"><code>${escapeHtml(a)}</code><code class="rt-naming__figma">${escapeHtml(b)}</code><span class="rt-naming__why">${why}</span></div>`).join('')}
      </div>
      <h3 class="doc-subhead">Escopos <span class="doc-subhead__meta">onde cada variável aparece no seletor</span></h3>
      <div class="doc-table rt-scopes">
        <div class="doc-table__head" aria-hidden="true"><span>Tokens</span><span>Aparece em</span></div>
        ${SCOPES.map(([a, b]) => `<div class="doc-table__row"><code>${escapeHtml(a)}</code><span>${b}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'rt-conversao',
      'O que muda no Figma',
      'Quase tudo chega igual. O que o Figma não representa vira a forma mais próxima — e fica registrado aqui.',
      `<div class="doc-table rt-changes">
        <div class="doc-table__head" aria-hidden="true"><span>No código</span><span>No Figma</span><span>Detalhe</span></div>
        ${CHANGES.map(([a, b, d]) => `<div class="doc-table__row"><code>${escapeHtml(a)}</code><span class="rt-changes__to">${icon('arrow-right', { size: 14 })}${b}</span><span class="rt-changes__detail">${d}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'rt-importar',
      'Passo a passo de importação',
      'Dois caminhos. O plugin funciona em qualquer plano e atualiza sem duplicar; a API REST é para criar tudo de uma vez num arquivo novo, em planos Enterprise.',
      `<div class="rt-routes">
        <article class="rt-route">
          <p class="rt-route__head"><span class="ds-badge ds-badge--sm ds-badge--brand">Recomendado</span><span class="rt-route__title">Plugin de desenvolvimento</span></p>
          <ol class="rt-steps" role="list">
            ${PLUGIN_STEPS.map(([t, d], i) => `<li class="rt-step"><span class="rt-step__num">${i + 1}</span><div><p class="rt-step__title">${t}</p><p class="rt-step__text">${d}</p></div></li>`).join('')}
          </ol>
        </article>
        <article class="rt-route">
          <p class="rt-route__head"><span class="ds-badge ds-badge--sm">Enterprise</span><span class="rt-route__title">API REST</span></p>
          <p class="rt-route__text">Um POST com o arquivo <code class="ds-inline-code">figma-variables.rest.json</code>. Os ids no arquivo são temporários: o Figma troca pelos definitivos e devolve o mapa na resposta.</p>
          ${codeBlock(CURL)}
          <p class="rt-route__text">${icon('lock', { size: 16 })}<span>O token pessoal é seu. Use variável de ambiente e nunca escreva o valor em arquivo do projeto.</span></p>
        </article>
      </div>`,
    )}

    ${section(
      'rt-sync',
      'Sincronização',
      'O JSON ganha. Mudou no Figma? A mudança volta como pull request nos tokens — e só depois de revisada chega de novo ao Figma.',
      `<ol class="rt-sync" role="list">
        ${SYNC.map(([stamp, t, d]) => `<li class="rt-sync__item"><p class="ds-section__head"><span class="ds-section__stamp">${stamp}</span><span>${t}</span></p><p class="rt-sync__text">${d}</p></li>`).join('')}
      </ol>
      <div class="rt-versions">
        <div class="rt-version"><p class="rt-version__num"><span>1</span>.0.0</p><p class="rt-version__text">Renomear ou remover token: quebra quem usa. Versão maior, com o nome antigo e o novo nas Novidades.</p></div>
        <div class="rt-version"><p class="rt-version__num">0.<span>1</span>.0</p><p class="rt-version__text">Token novo ou valor ajustado: versão menor.</p></div>
        <div class="rt-version"><p class="rt-version__num">0.0.<span>1</span></p><p class="rt-version__text">Descrição, escopo ou correção sem mudar valor: correção.</p></div>
      </div>
      <a class="ds-inline-action rt-sync__link" href="#/novidades">${icon('history', { size: 16 })}Ver o histórico em Novidades${icon('arrow-right', { size: 14 })}</a>`,
    )}

    ${section(
      'rt-limites',
      'Limitações',
      'O que a exportação não faz — para ninguém descobrir no meio de uma entrega.',
      `<ul class="rt-limits" role="list">
        ${LIMITS.map(([t, d]) => `<li class="rt-limit"><span class="rt-limit__icon">${icon('alert-triangle', { size: 16 })}</span><div><p class="rt-limit__title">${t}</p><p class="rt-limit__text">${d}</p></div></li>`).join('')}
      </ul>`,
    )}

    ${section(
      'rt-codigo',
      'Código',
      'O exportador é um módulo puro: as mesmas funções rodam no navegador (esta página) e no Node (o script).',
      `${codeBlock(CODE_SCRIPTS)}
      <h3 class="doc-subhead">No JavaScript</h3>
      ${codeBlock(CODE_API)}
      <h3 class="doc-subhead">Lendo o JSON plano</h3>
      ${codeBlock(CODE_FLAT)}`,
    )}

    ${section(
      'rt-uso',
      'Uso',
      'Variáveis só ajudam se todo mundo pinta com as mesmas.',
      `<div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: pinte com as semânticas</p>
          <p class="usage-card__text"><code class="ds-inline-code">color/bg/canvas</code> no fundo, <code class="ds-inline-code">color/fg/muted</code> no texto de apoio. Troque o modo do frame e a tela inteira muda de tema.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: primitivas no layout</p>
          <p class="usage-card__text"><code class="ds-inline-code">neutral/925</code> não muda com o tema e não diz para que serve. Por isso as primitivas ficam fora do seletor.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: editar valor no Figma</p>
          <p class="usage-card__text">A próxima exportação sobrescreve. Precisa de outro tom? Abra um pull request em <code class="ds-inline-code">tokens/</code>.</p>
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

async function copyFile(name, text) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    ok = legacyCopy(text);
  }
  toast(ok ? `${name} copiado` : 'Não foi possível copiar', { icon: ok ? 'check' : 'alert-circle' });
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
  toast(`${name} pronto`, { icon: 'download' });
}

const findFile = (key) => {
  const [id, name] = key.split(':');
  const format = FORMATS.find((f) => f.id === id);
  return { format, file: format?.files.find((f) => f.name === name) };
};

export function mount(root) {
  const cleanups = [mountCodeCopy(root), mountDocNav(root), mountTabs(root)];
  let alive = true;
  cleanups.push(() => (alive = false));

  /* Prévias e tamanhos: só quando a aba aparece */
  const shown = new Set();
  const fill = async (id) => {
    if (shown.has(id)) return;
    shown.add(id);
    const f = FORMATS.find((x) => x.id === id);
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
      if (alive) el.textContent = 'Não foi possível montar este arquivo agora.';
      shown.delete(id);
    }
  };
  fill(FORMATS[0].id);
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
      toast('Não foi possível montar este arquivo agora.', { icon: 'alert-circle' });
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
    const rows = ROWS.filter((r) => {
      if (state.onde && r.kind !== state.onde) return false;
      if (!q) return true;
      const hay = normalize(`${r.token} ${r.figma}`);
      return hay.includes(q) || hay.includes(q.replaceAll('/', '.'));
    });
    tbody.innerHTML = rows.map(rowHtml).join('');
    tbody.closest('table').hidden = !rows.length;
    empty.hidden = rows.length > 0;
    filters?.setCount(rows.length, ROWS.length);
  };
  filters = createFilters(root.querySelector('[data-rt-filters]'), {
    label: 'Filtrar tokens',
    search: { placeholder: 'Buscar token ou variável — ex.: canvas, space/200' },
    fields: [{ id: 'onde', label: 'Onde', allLabel: 'Tudo', options: KINDS }],
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
