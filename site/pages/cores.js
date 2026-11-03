import { icon } from '../../ds/icons/icons.js';
import { palettes, tokens, contrast } from '../../ds/tokens.js';
import { attachMenu } from '../../ds/js/menu.js';
import { copyText } from '../../ds/js/toast.js';
import { tr, formatNumber } from '../../ds/js/i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { T, paletteLabel, tokenDescription, ratio } from '../i18n.js';
import { THEME_IDS, themeLabel } from '../themes.js';

export const styles = 'site/pages/cores.css';

/* ───────── Textos ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const COPY = T(
  {
    lead: 'Uma paleta quente gerada em OKLCH e tokens semânticos que se adaptam ao tema. Os componentes nunca usam cor solta — sempre um token.',
    stats: ['paletas', 'cores primitivas', 'tokens semânticos', 'contrastes WCAG'],
    onThisPage: 'Nesta página',
    nav: ['Paletas', 'Tokens semânticos', 'Temas', 'Contraste', 'Uso'],
    formats: ['HEX', 'OKLCH', 'Variável CSS'],
    format: 'Formato',
    paletteMeta: (hue, chroma, n) => `hue ${hue} · croma ${chroma} · ${n} tons`,
    palettes: { title: 'Paletas primitivas', desc: 'A matéria-prima. Cada paleta nasce de um matiz e um croma em OKLCH, com luminosidade perceptualmente uniforme. Clique numa cor para copiar.' },
    support: ['Paletas de apoio', 'status, dados e ilustração'],
    howto: `Para recriar uma paleta inteira, mude o <strong>hue</strong> em ${ic('tokens/palettes.json')}. O build gera os tons, ajusta ao gamut sRGB e verifica o contraste.`,
    groups: [
      ['Fundo', 'Fundos e camadas de superfície — do app ao painel elevado.'],
      ['Texto', 'Texto e ícones, do mais forte ao mais apagado.'],
      ['Borda', 'Contornos, divisores e o anel de foco.'],
      ['Marca', 'Ação principal, destaques e o indicador de novidade.'],
      ['Sucesso', 'Confirmações e estados concluídos.'],
      ['Aviso', 'Atenção sem bloquear.'],
      ['Perigo', 'Erros e ações destrutivas.'],
      ['Informação', 'Dicas e mensagens neutras.'],
      ['Gráficos', 'Séries em ordem fixa, escalas sequencial, ordinal e divergente, grade e eixo. Regras em Gráficos › Visão geral.'],
    ],
    semantic: { title: 'Tokens semânticos', desc: 'É isso que os componentes consomem. Cada token aponta para uma primitiva diferente em cada tema — o nome descreve a função, não a cor.', groupLabel: 'Grupo de tokens' },
    copyVar: (v) => `Copiar var(${v})`,
    copyTooltip: 'Copiar variável',
    head: { token: 'Token', dark: 'Escuro', light: 'Claro', refugio: 'Refúgio' },
    themes: {
      title: 'Temas',
      desc: 'O Lume é o padrão, em claro e escuro: a ardósia e a terracota do app Lume. A paleta Laranja, o pêssego quente, também vem em claro e escuro, e “Sistema” escolhe entre os dois. Como os temas vivem em atributos, dá até para misturar: um bloco claro dentro de uma tela escura.',
      dark: 'Escuro',
      light: 'Claro',
      refugio: 'Refúgio',
      default: 'padrão',
      card: ['Exemplo', 'Lançamento da versão 0.1', 'Os mesmos componentes e os mesmos tokens — só o tema muda.', 'Tom direto', 'Pronto', 'Revisar', 'Publicar', 'Cancelar'],
      code: ['tema aninhado: só este bloco fica escuro', '“Sistema” é resolvido no JS: claro ou escuro da paleta escolhida'],
    },
    contrast: {
      title: 'Contraste',
      desc: 'Toda combinação de texto e fundo usada pelos componentes é verificada no build, nos três temas, contra o WCAG 2.2. Texto comum pede 4,5:1; texto terciário, 3:1.',
      approved: 'combinações aprovadas',
      head: ['Texto sobre fundo', 'Escuro', 'Claro', 'Refúgio', 'Mínimo'],
      on: (bg) => `sobre ${bg}`,
      levels: { large: 'AA grande', fail: 'Falha' },
    },
    usage: {
      title: 'Uso',
      desc: 'Três regras que mantêm a interface consistente quando o sistema cresce.',
      do: ['Faça: use tokens semânticos', 'O nome descreve a função. Quando o tema ou a marca mudam, o componente acompanha sozinho.'],
      dont: ['Evite: cor solta ou primitiva', 'Hex fixo ou primitiva no componente quebra o tema claro e trava a troca de marca.'],
      tip: ['Pêssego com moderação', 'Reserve a cor da marca para a ação principal e para indicadores. O resto da interface vive nos neutros quentes.'],
      tipCode: ['uma por tela', 'novidade'],
    },
  },
  {
    lead: 'A warm palette generated in OKLCH and semantic tokens that adapt to the theme. Components never use a loose color — always a token.',
    stats: ['palettes', 'primitive colors', 'semantic tokens', 'WCAG contrast checks'],
    onThisPage: 'On this page',
    nav: ['Palettes', 'Semantic tokens', 'Themes', 'Contrast', 'Usage'],
    formats: ['HEX', 'OKLCH', 'CSS variable'],
    format: 'Format',
    paletteMeta: (hue, chroma, n) => `hue ${hue} · chroma ${chroma} · ${n} shades`,
    palettes: { title: 'Primitive palettes', desc: 'The raw material. Each palette starts from one hue and one chroma in OKLCH, with perceptually uniform lightness. Click a color to copy it.' },
    support: ['Supporting palettes', 'status, data, and illustration'],
    howto: `To recreate a whole palette, change the <strong>hue</strong> in ${ic('tokens/palettes.json')}. The build generates the shades, fits them to the sRGB gamut, and checks contrast.`,
    groups: [
      ['Background', 'Backgrounds and surface layers — from the app to the raised panel.'],
      ['Text', 'Text and icons, from strongest to most faded.'],
      ['Border', 'Outlines, dividers, and the focus ring.'],
      ['Brand', 'Main action, highlights, and the what’s-new indicator.'],
      ['Success', 'Confirmations and completed states.'],
      ['Warning', 'Attention without blocking.'],
      ['Danger', 'Errors and destructive actions.'],
      ['Info', 'Hints and neutral messages.'],
      ['Charts', 'Series in a fixed order, sequential, ordinal, and diverging scales, grid, and axis. Rules in Charts › Overview.'],
    ],
    semantic: { title: 'Semantic tokens', desc: 'This is what components consume. Each token points to a different primitive in each theme — the name describes the role, not the color.', groupLabel: 'Token group' },
    copyVar: (v) => `Copy var(${v})`,
    copyTooltip: 'Copy variable',
    head: { token: 'Token', dark: 'Dark', light: 'Light', refugio: 'Refúgio' },
    themes: {
      title: 'Themes',
      desc: 'Lume is the default, in light and dark: the Lume app’s slate and terracotta. The Orange palette, the warm peach, also comes in light and dark, and “System” picks between them. Since themes live in attributes, you can even mix them: a light block inside a dark screen.',
      dark: 'Dark',
      light: 'Light',
      refugio: 'Refúgio',
      default: 'default',
      card: ['Example', 'Version 0.1 launch', 'The same components and the same tokens — only the theme changes.', 'Direct tone', 'Done', 'Review', 'Publish', 'Cancel'],
      code: ['nested theme: only this block turns dark', '“System” is resolved in JS: light or dark of the chosen palette'],
    },
    contrast: {
      title: 'Contrast',
      desc: 'Every text and background pair the components use is checked in the build, in all three themes, against WCAG 2.2. Regular text needs 4.5:1; tertiary text, 3:1.',
      approved: 'pairs passing',
      head: ['Text on background', 'Dark', 'Light', 'Refúgio', 'Minimum'],
      on: (bg) => `on ${bg}`,
      levels: { large: 'AA large', fail: 'Fail' },
    },
    usage: {
      title: 'Usage',
      desc: 'Three rules that keep the interface consistent as the system grows.',
      do: ['Do: use semantic tokens', 'The name describes the role. When the theme or brand changes, the component follows on its own.'],
      dont: ['Avoid: loose or primitive colors', 'A fixed hex or a primitive in a component breaks the light theme and locks the brand swap.'],
      tip: ['Go easy on the peach', 'Save the brand color for the main action and for indicators. The rest of the interface lives in the warm neutrals.'],
      tipCode: ['one per screen', 'what’s new'],
    },
  },
  {
    lead: 'Una paleta cálida generada en OKLCH y tokens semánticos que se adaptan al tema. Los componentes nunca usan un color suelto — siempre un token.',
    stats: ['paletas', 'colores primitivos', 'tokens semánticos', 'contrastes WCAG'],
    onThisPage: 'En esta página',
    nav: ['Paletas', 'Tokens semánticos', 'Temas', 'Contraste', 'Uso'],
    formats: ['HEX', 'OKLCH', 'Variable CSS'],
    format: 'Formato',
    paletteMeta: (hue, chroma, n) => `hue ${hue} · croma ${chroma} · ${n} tonos`,
    palettes: { title: 'Paletas primitivas', desc: 'La materia prima. Cada paleta nace de un matiz y un croma en OKLCH, con luminosidad perceptualmente uniforme. Haz clic en un color para copiarlo.' },
    support: ['Paletas de apoyo', 'estado, datos e ilustración'],
    howto: `Para recrear una paleta entera, cambia el <strong>hue</strong> en ${ic('tokens/palettes.json')}. El build genera los tonos, los ajusta al gamut sRGB y comprueba el contraste.`,
    groups: [
      ['Fondo', 'Fondos y capas de superficie — del app al panel elevado.'],
      ['Texto', 'Texto e íconos, del más fuerte al más atenuado.'],
      ['Borde', 'Contornos, divisores y el anillo de foco.'],
      ['Marca', 'Acción principal, destacados y el indicador de novedad.'],
      ['Éxito', 'Confirmaciones y estados completados.'],
      ['Aviso', 'Atención sin bloquear.'],
      ['Peligro', 'Errores y acciones destructivas.'],
      ['Información', 'Pistas y mensajes neutros.'],
      ['Gráficos', 'Series en orden fijo, escalas secuencial, ordinal y divergente, cuadrícula y eje. Reglas en Gráficos › Visión general.'],
    ],
    semantic: { title: 'Tokens semánticos', desc: 'Esto es lo que consumen los componentes. Cada token apunta a una primitiva distinta en cada tema — el nombre describe la función, no el color.', groupLabel: 'Grupo de tokens' },
    copyVar: (v) => `Copiar var(${v})`,
    copyTooltip: 'Copiar variable',
    head: { token: 'Token', dark: 'Oscuro', light: 'Claro', refugio: 'Refúgio' },
    themes: {
      title: 'Temas',
      desc: 'Lume es el predeterminado, en claro y oscuro: la pizarra y la terracota de la app Lume. La paleta Naranja, el melocotón cálido, también viene en claro y oscuro, y “Sistema” elige entre los dos. Como los temas viven en atributos, hasta se pueden mezclar: un bloque claro dentro de una pantalla oscura.',
      dark: 'Oscuro',
      light: 'Claro',
      refugio: 'Refúgio',
      default: 'predeterminado',
      card: ['Ejemplo', 'Lanzamiento de la versión 0.1', 'Los mismos componentes y los mismos tokens — solo cambia el tema.', 'Tono directo', 'Listo', 'Revisar', 'Publicar', 'Cancelar'],
      code: ['tema anidado: solo este bloque queda oscuro', '“Sistema” se resuelve en JS: claro u oscuro de la paleta elegida'],
    },
    contrast: {
      title: 'Contraste',
      desc: 'Cada combinación de texto y fondo que usan los componentes se comprueba en el build, en los tres temas, contra WCAG 2.2. El texto común pide 4,5:1; el texto terciario, 3:1.',
      approved: 'combinaciones aprobadas',
      head: ['Texto sobre fondo', 'Oscuro', 'Claro', 'Refúgio', 'Mínimo'],
      on: (bg) => `sobre ${bg}`,
      levels: { large: 'AA grande', fail: 'Falla' },
    },
    usage: {
      title: 'Uso',
      desc: 'Tres reglas que mantienen la interfaz consistente cuando el sistema crece.',
      do: ['Haz: usa tokens semánticos', 'El nombre describe la función. Cuando cambian el tema o la marca, el componente los sigue solo.'],
      dont: ['Evita: color suelto o primitivo', 'Un hex fijo o una primitiva en el componente rompe el tema claro y traba el cambio de marca.'],
      tip: ['Melocotón con moderación', 'Reserva el color de la marca para la acción principal y los indicadores. El resto de la interfaz vive en los neutros cálidos.'],
      tipCode: ['uno por pantalla', 'novedad'],
    },
  },
);

/* ───────── Dados ───────── */

const byName = new Map(tokens.map((t) => [t.name, t]));
const semantic = tokens.filter((t) => t.type === 'color' && t.themed);
const canvas = byName.get('color.bg.canvas').modes;
const colorCount = palettes.reduce((n, p) => n + p.steps.length, 0);
const passed = contrast.filter((c) => c.pass).length;

const FEATURED = ['brand', 'neutral'];
const FORMAT_VALUES = ['hex', 'oklch', 'var'];
const formats = (c) => FORMAT_VALUES.map((value, i) => ({ value, label: c.formats[i] }));
const GROUP_IDS = ['bg', 'fg', 'border', 'brand', 'success', 'warning', 'danger', 'info', 'chart'];

let format = 'hex';
let group = 'bg';

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const short = (name) => name.replace(/^color\./, '');

function describeRef(ref) {
  const alpha = /^alpha\(\{color\.([^}]+)\},\s*([\d.]+)\)$/.exec(ref);
  if (alpha) return `${alpha[1]} · ${Math.round(Number(alpha[2]) * 100)}%`;
  const plain = /^\{color\.([^}]+)\}$/.exec(ref);
  return plain ? plain[1] : ref;
}

/** Cores com transparência (#rrggbbaa) são mostradas sobre o canvas do tema. */
const paint = (value, mode) => (value.length === 9 ? `linear-gradient(${value}, ${value}), ${canvas[mode].value}` : value);
const valueOf = (p, s) => (format === 'hex' ? s.hex : format === 'oklch' ? s.oklch : `var(${s.cssVar})`);
const inkFor = (s) => (s.contrastOnBlack > s.contrastOnWhite ? 'dark' : 'light');

/* ───────── Paletas ───────── */

function strip(p, size) {
  // paletas longas (neutros com 18 tons) têm amostras estreitas: números menores para caber
  return `<div class="swatches swatches--${size}${p.steps.length > 12 ? ' swatches--dense' : ''}">
    ${p.steps
      .map(
        (s) => `<button type="button" class="swatch swatch--ink-${inkFor(s)}" style="background:${s.hex}"
          data-palette="${p.name}" data-step="${s.step}" aria-label="${escape(`${paletteLabel(p)} ${s.step}, ${s.hex}`)}"
          ${size === 'sm' ? `data-ds-tooltip="${p.name}.${s.step} · ${s.hex}"` : ''}>
          ${size === 'sm' ? '' : `<span class="swatch__step">${s.step}</span><span class="swatch__value" data-value>${escape(valueOf(p, s))}</span>`}
        </button>`,
      )
      .join('')}
  </div>`;
}

const paletteMeta = (c, p) => c.paletteMeta(p.hue, formatNumber(p.chroma), p.steps.length);

function featuredCard(c, p) {
  return `<article class="palette-card palette-card--featured">
    <header class="palette-card__head">
      <div>
        <h3 class="palette-card__name">${paletteLabel(p)}</h3>
        <p class="palette-card__meta">${paletteMeta(c, p)}</p>
      </div>
      <code class="ds-inline-code">--ds-color-${p.name}-*</code>
    </header>
    ${strip(p, 'lg')}
  </article>`;
}

function compactCard(c, p) {
  return `<article class="palette-card">
    <header class="palette-card__head">
      <h3 class="palette-card__name palette-card__name--sm">${paletteLabel(p)}</h3>
      <p class="palette-card__meta">${paletteMeta(c, p)}</p>
    </header>
    ${strip(p, 'sm')}
  </article>`;
}

/* ───────── Tokens semânticos ───────── */

function tokenValue(t, mode) {
  const { ref, value } = t.modes[mode];
  return `<div class="token-value">
    <span class="token-swatch" style="background:${paint(value, mode)}"></span>
    <span class="token-value__text">
      <span class="token-value__ref">${escape(describeRef(ref))}</span>
      <span class="token-value__hex">${value.toUpperCase()}</span>
    </span>
  </div>`;
}

function tokenRows(c) {
  return semantic
    .filter((t) => t.name.startsWith(`color.${group}.`))
    .map((t) => {
      const desc = tokenDescription(t);
      return `<div class="doc-table__row">
        <div class="token-name">
          <span class="token-name__label">${short(t.name)}</span>
          <span class="token-name__var">${t.cssVar}</span>
          ${desc ? `<span class="token-name__desc">${escape(desc)}</span>` : ''}
        </div>
        ${THEME_IDS.map((id) => tokenValue(t, id)).join('')}
        <button type="button" class="ds-icon-btn ds-icon-btn--muted" data-copy="var(${t.cssVar})" aria-label="${c.copyVar(t.cssVar)}" data-ds-tooltip="${c.copyTooltip}">${icon('copy', { size: 18 })}</button>
      </div>`;
    })
    .join('');
}

const groupDesc = (c) => c.groups[GROUP_IDS.indexOf(group)][1];
const countIn = (id) => semantic.filter((t) => t.name.startsWith(`color.${id}.`)).length;

/* ───────── Contraste ───────── */

const pairs = [];
for (const item of contrast) {
  let pair = pairs.find((p) => p.fg === item.fg && p.bg === item.bg);
  if (!pair) pairs.push((pair = { fg: item.fg, bg: item.bg, min: item.min }));
  pair[item.mode] = item;
}

function level(c, value) {
  if (value >= 7) return ['success', 'AAA'];
  if (value >= 4.5) return ['success', 'AA'];
  if (value >= 3) return ['warning', c.contrast.levels.large];
  return ['danger', c.contrast.levels.fail];
}

function contrastCell(c, pair, mode) {
  const item = pair[mode];
  const fg = byName.get(pair.fg).modes[mode].value;
  const bg = byName.get(pair.bg).modes[mode].value;
  const [tone, label] = level(c, item.ratio);
  return `<div class="contrast-cell">
    <span class="contrast-sample" style="color:${fg};background:${paint(bg, mode)}">Aa</span>
    <span class="contrast-ratio">${ratio(item.ratio)}</span>
    <span class="ds-badge ds-badge--sm ds-badge--${tone}">${label}</span>
  </div>`;
}

/* ───────── Página ───────── */

const NAV_IDS = ['paletas', 'semanticos', 'temas', 'contraste', 'uso'];

export default function renderCores(page) {
  const c = tr(COPY);
  const others = palettes.filter((p) => !FEATURED.includes(p.name));
  const th = c.themes;
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${c.lead}</p>
      </div>
      <dl class="doc-stats">
        ${[palettes.length, colorCount, semantic.length, `${passed}/${contrast.length}`].map((value, i) => `<div class="doc-stat"><dt class="doc-stat__label">${c.stats[i]}</dt><dd class="doc-stat__value">${value}</dd></div>`).join('')}
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${c.onThisPage}">
      ${NAV_IDS.map((id, i) => `<button type="button" class="doc-nav__link" data-target="${id}">${c.nav[i]}</button>`).join('')}
    </nav>

    <section class="doc-section" id="paletas" aria-labelledby="paletas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="paletas-title">${c.palettes.title}</h2>
          <p class="doc-section__desc">${c.palettes.desc}</p>
        </div>
        <button type="button" class="ds-chip" data-menu="format"><span class="ds-chip__icon">${icon('code', { size: 16 })}</span><span data-label>HEX</span><span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></button>
      </header>

      <div class="palette-stack">
        ${FEATURED.map((name) => featuredCard(c, palettes.find((p) => p.name === name))).join('')}
      </div>

      <h3 class="doc-subhead">${c.support[0]} <span class="doc-subhead__meta">${c.support[1]}</span></h3>
      <div class="palette-grid">${others.map((p) => compactCard(c, p)).join('')}</div>

      <div class="palette-howto">
        <p class="palette-howto__text">${icon('refresh', { size: 18 })}<span>${c.howto}</span></p>
        <pre class="ds-code ds-code--sm"><code><span class="ds-code__comment">// tokens/palettes.json</span>
"brand": { "hue": <span class="ds-code__accent">50</span>, "chroma": 0.175 }</code></pre>
      </div>
    </section>

    <section class="doc-section" id="semanticos" aria-labelledby="semanticos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="semanticos-title">${c.semantic.title}</h2>
          <p class="doc-section__desc">${c.semantic.desc}</p>
        </div>
      </header>
      <div class="token-filters" role="group" aria-label="${c.semantic.groupLabel}">
        ${GROUP_IDS.map((id, i) => `<button type="button" class="ds-chip ds-chip--sm" data-group="${id}" aria-pressed="${id === group}">${c.groups[i][0]}<span class="token-filters__count">${countIn(id)}</span></button>`).join('')}
      </div>
      <p class="token-group-desc" data-group-desc>${groupDesc(c)}</p>
      <div class="doc-table token-table">
        <div class="doc-table__head" aria-hidden="true"><span>${c.head.token}</span>${THEME_IDS.map((id) => `<span>${themeLabel(id)}</span>`).join('')}<span></span></div>
        <div data-token-rows>${tokenRows(c)}</div>
      </div>
    </section>

    <section class="doc-section" id="temas" aria-labelledby="temas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="temas-title">${th.title}</h2>
          <p class="doc-section__desc">${th.desc}</p>
        </div>
      </header>
      <div class="theme-previews">
        ${[
          ...THEME_IDS.map((id) => [id, themeLabel(id), id === 'light' ? th.default : '']),
        ]
          .map(
            ([mode, label, note]) => `<figure class="theme-preview">
              <div class="theme-preview__stage" data-theme="${mode}" inert>
                <div class="tp-card">
                  <div class="tp-card__head">
                    <div><p class="ds-panel__eyebrow">${th.card[0]}</p><p class="tp-card__title">${th.card[1]}</p></div>
                    <span class="ds-icon-btn ds-icon-btn--sm">${icon('x', { size: 18 })}</span>
                  </div>
                  <p class="tp-card__text">${th.card[2]}</p>
                  <div class="tp-card__row">
                    <span class="ds-chip ds-chip--sm"><span class="ds-chip__icon">${icon('pencil', { size: 14 })}</span>${th.card[3]}<span class="ds-chip__chevron">${icon('chevron-down', { size: 14 })}</span></span>
                    <span class="ds-badge ds-badge--sm ds-badge--success">${th.card[4]}</span>
                    <span class="ds-badge ds-badge--sm ds-badge--warning">${th.card[5]}</span>
                  </div>
                  <div class="tp-card__row">
                    <span class="ds-btn ds-btn--primary ds-btn--sm">${th.card[6]}</span>
                    <span class="ds-btn ds-btn--secondary ds-btn--sm">${th.card[7]}</span>
                  </div>
                </div>
              </div>
              <figcaption class="theme-preview__label"><span>${label}${note ? ` <span class="theme-preview__note">· ${note}</span>` : ''}</span><code class="ds-inline-code">data-theme="${mode}"</code></figcaption>
            </figure>`,
          )
          .join('')}
      </div>
      <pre class="ds-code theme-code"><code>${THEME_IDS.map((id) => `&lt;html data-theme="${id}"&gt;${' '.repeat(13 - id.length)}<span class="ds-code__comment">&lt;!-- ${themeLabel(id)}${id === 'light' ? ` · ${th.default}` : ''} --&gt;</span>`).join('\n')}
<span class="ds-code__comment">&lt;!-- ${th.code[1]} --&gt;</span>

&lt;section data-theme="dark"&gt;  <span class="ds-code__comment">&lt;!-- ${th.code[0]} --&gt;</span></code></pre>
    </section>

    <section class="doc-section" id="contraste" aria-labelledby="contraste-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="contraste-title">${c.contrast.title}</h2>
          <p class="doc-section__desc">${c.contrast.desc}</p>
        </div>
        <p class="contrast-summary"><span class="contrast-summary__value">${passed}/${contrast.length}</span><span>${c.contrast.approved}</span></p>
      </header>
      <div class="doc-table contrast-table">
        <div class="doc-table__head" aria-hidden="true">${[c.contrast.head[0], ...THEME_IDS.map(themeLabel), c.contrast.head.at(-1)].map((h) => `<span>${h}</span>`).join('')}</div>
        ${pairs
          .map(
            (p) => `<div class="doc-table__row">
              <div class="token-name"><span class="token-name__label">${short(p.fg)}</span><span class="token-name__var">${c.contrast.on(short(p.bg))}</span></div>
              ${THEME_IDS.map((id) => contrastCell(c, p, id)).join('')}
              <span class="contrast-min">${ratio(p.min, Number.isInteger(p.min) ? 0 : 1)}</span>
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
          <pre class="ds-code ds-code--sm"><code>color: var(--ds-color-fg-muted);
background: var(--ds-color-bg-surface);</code></pre>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${c.usage.dont[0]}</p>
          <p class="usage-card__text">${c.usage.dont[1]}</p>
          <pre class="ds-code ds-code--sm"><code>color: #9c9792;
background: var(--ds-color-neutral-900);</code></pre>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${c.usage.tip[0]}</p>
          <p class="usage-card__text">${c.usage.tip[1]}</p>
          <pre class="ds-code ds-code--sm"><code>.ds-btn--primary  <span class="ds-code__comment">/* ${c.usage.tipCode[0]} */</span>
.ds-dot           <span class="ds-code__comment">/* ${c.usage.tipCode[1]} */</span></code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const c = tr(COPY);
  const FORMATS = formats(c);
  // copiar cor ao clicar no swatch
  const onClick = (event) => {
    const swatch = event.target.closest('.swatch');
    if (swatch) {
      const p = palettes.find((x) => x.name === swatch.dataset.palette);
      const s = p.steps.find((x) => x.step === swatch.dataset.step);
      copyText(valueOf(p, s));
      return;
    }
    const copy = event.target.closest('[data-copy]');
    if (copy) copyText(copy.dataset.copy);
  };
  root.addEventListener('click', onClick);

  // formato exibido/copiado
  const formatChip = root.querySelector('[data-menu="format"]');
  const formatMenu = attachMenu(formatChip, {
    label: c.format,
    value: format,
    options: FORMATS,
    onChange: (value) => {
      format = value;
      formatChip.querySelector('[data-label]').textContent = FORMATS.find((f) => f.value === value).label;
      root.querySelectorAll('.swatch [data-value]').forEach((el) => {
        const sw = el.closest('.swatch');
        const p = palettes.find((x) => x.name === sw.dataset.palette);
        el.textContent = valueOf(p, p.steps.find((x) => x.step === sw.dataset.step));
      });
    },
  });
  formatChip.querySelector('[data-label]').textContent = FORMATS.find((f) => f.value === format).label;

  // filtro de grupo dos tokens semânticos
  const rows = root.querySelector('[data-token-rows]');
  const desc = root.querySelector('[data-group-desc]');
  root.querySelectorAll('[data-group]').forEach((chip) =>
    chip.addEventListener('click', () => {
      group = chip.dataset.group;
      root.querySelectorAll('[data-group]').forEach((x) => x.setAttribute('aria-pressed', String(x === chip)));
      rows.innerHTML = tokenRows(c);
      desc.textContent = groupDesc(c);
    }),
  );

  const unmountNav = mountDocNav(root);

  return () => {
    root.removeEventListener('click', onClick);
    formatMenu.destroy();
    unmountNav();
  };
}
