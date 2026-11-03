import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList } from '../component-doc.js';
import { tr } from '../../ds/js/i18n.js';
import { L } from '../i18n.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-figma.css'];

const SUMMARY_URL = 'dist/figma-plugin/summary.json';

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const STEPS = () => [
  [L('Gere o plugin', 'Build the plugin', 'Genera el plugin'), L('Na pasta do projeto. Ele lê os tokens e os ícones atuais — rode de novo sempre que eles mudarem.', 'In the project folder. It reads the current tokens and icons — run it again whenever they change.', 'En la carpeta del proyecto. Lee los tokens y los íconos actuales — ejecútalo de nuevo cada vez que cambien.'), 'npm run figma'],
  [L('Abra o Figma para desktop', 'Open Figma for desktop', 'Abre Figma para escritorio'), L('Plugins de desenvolvimento só rodam no app. Abra o arquivo onde a biblioteca vai morar (de preferência um arquivo só para ela).', 'Development plugins only run in the app. Open the file where the library will live (ideally a file just for it).', 'Los plugins de desarrollo solo funcionan en la app. Abre el archivo donde vivirá la biblioteca (de preferencia, un archivo solo para ella).'), null],
  [L('Importe pelo manifesto', 'Import from the manifest', 'Importa desde el manifiesto'), L('Menu Plugins → Desenvolvimento → Importar plugin do manifesto… e escolha o arquivo abaixo. É uma vez só; depois ele aparece em Plugins → Desenvolvimento.', 'Menu Plugins → Development → Import plugin from manifest… and pick the file below. It’s a one-time step; afterwards it shows up under Plugins → Development.', 'Menú Plugins → Development → Import plugin from manifest… (los nombres siguen el idioma de tu Figma) y elige el archivo de abajo. Es una sola vez; después aparece en Plugins → Development.'), 'dist/figma-plugin/manifest.json'],
  [L('Rode “Lume para Figma”', 'Run “Lume para Figma”', 'Ejecuta “Lume para Figma”'), L('Escolha o que gerar — Fundamentos, Ícones, Componentes —, os modos e o idioma, e clique em Gerar no arquivo. Variáveis e estilos de texto sempre são atualizados.', 'Choose what to generate — Foundations, Icons, Components — the modes, and the language, then click Generate in file. Variables and text styles are always updated.', 'Elige qué generar — Fundamentos, Íconos, Componentes —, los modos y el idioma, y haz clic en Generar en el archivo. Las variables y los estilos de texto siempre se actualizan.'), null],
  [L('Publique como biblioteca', 'Publish as a library', 'Publica como biblioteca'), L('Com tudo gerado, publique o arquivo (Recursos → Bibliotecas) para o time usar os componentes nos próprios arquivos.', 'With everything generated, publish the file (Assets → Libraries) so the team can use the components in their own files.', 'Con todo generado, publica el archivo (Recursos → Bibliotecas) para que el equipo use los componentes en sus propios archivos.'), null],
];

const CREATES = () => [
  ['layers', L('Variáveis', 'Variables', 'Variables'), L('Primitivas, Semânticos (modos Escuro e Claro) e Dimensões — com aliases, escopos e o nome CSS em “código”.', 'Primitives, Semantic (Dark and Light modes), and Dimensions — with aliases, scopes, and the CSS name in “code”.', 'Primitivas, Semánticos (modos Oscuro y Claro) y Dimensiones — con alias, ámbitos y el nombre CSS en “código”.')],
  ['type', L('Estilos', 'Styles', 'Estilos'), L('Os 19 estilos de texto e as sombras, uma versão por tema (estilos do Figma não têm modos).', 'The 19 text styles and the shadows, one version per theme (Figma styles don’t have modes).', 'Los 19 estilos de texto y las sombras, una versión por tema (los estilos de Figma no tienen modos).')],
  ['shapes', L('Ícones', 'Icons', 'Íconos'), L('Cada ícone vira um componente de 24 px, com a cor ligada a color/fg/default.', 'Each icon becomes a 24 px component, with its color bound to color/fg/default.', 'Cada ícono se vuelve un componente de 24 px, con el color vinculado a color/fg/default.')],
  ['component', L('Componentes', 'Components', 'Componentes'), L('Conjuntos de variantes com auto layout, propriedades de texto, booleano e troca de ícone — tudo ligado às variáveis.', 'Variant sets with auto layout, text, boolean, and icon-swap properties — all bound to the variables.', 'Conjuntos de variantes con auto layout, propiedades de texto, booleano e intercambio de ícono — todo vinculado a las variables.')],
];

const ANATOMY = () => [
  ['1', L('Cabeçalho', 'Header', 'Encabezado'), L('Grupo, título, descrição e tags. Escuro nos dois modos, como uma capa.', 'Group, title, description, and tags. Dark in both modes, like a cover.', 'Grupo, título, descripción y etiquetas. Oscuro en los dos modos, como una portada.')],
  ['2', L('Conjunto de variantes', 'Variant set', 'Conjunto de variantes'), L('Em matriz, com o nome das colunas e das linhas. A borda tracejada roxa é do próprio Figma.', 'In a matrix, with column and row names. The dashed purple border is Figma’s own.', 'En matriz, con el nombre de las columnas y de las filas. El borde discontinuo violeta es del propio Figma.')],
  ['3', L('Exemplos', 'Examples', 'Ejemplos'), L('Instâncias montadas como na tela — com ícone, hierarquia, estados.', 'Instances assembled as on screen — with icon, hierarchy, states.', 'Instancias armadas como en pantalla — con ícono, jerarquía, estados.')],
  ['4', L('Claro e Escuro', 'Light and Dark', 'Claro y Oscuro'), L('O mesmo exemplo em dois frames, cada um com o modo da coleção Semânticos fixado.', 'The same example in two frames, each with the Semantic collection mode pinned.', 'El mismo ejemplo en dos frames, cada uno con el modo de la colección Semánticos fijado.')],
];

const PROPS = () => [
  [L('Variantes', 'Variants', 'Variantes'), L('Variante, Tamanho, Estado…', 'Variant, Size, State…', 'Variante, Tamaño, Estado…'), L('Os valores seguem a documentação, no idioma escolhido na janela: Primário, Secundário, Hover, Foco, Desativado.', 'The values follow the documentation, in the language chosen in the window: Primary, Secondary, Hover, Focus, Disabled.', 'Los valores siguen la documentación, en el idioma elegido en la ventana: Primario, Secundario, Hover, Foco, Desactivado.')],
  [L('Texto', 'Text', 'Texto'), L('Rótulo, Valor', 'Label, Value', 'Etiqueta, Valor'), L('Troque o texto na instância sem desanexar.', 'Change the text on the instance without detaching.', 'Cambia el texto en la instancia sin desvincular.')],
  [L('Booleano', 'Boolean', 'Booleano'), L('Ícone', 'Icon', 'Ícono'), L('Liga e desliga partes opcionais.', 'Turns optional parts on and off.', 'Activa y desactiva partes opcionales.')],
  [L('Troca de instância', 'Instance swap', 'Intercambio de instancia'), L('Trocar ícone', 'Swap icon', 'Cambiar ícono'), L('Escolhe o ícone entre os preferidos, sem caçar na biblioteca.', 'Picks the icon from the preferred ones, without hunting through the library.', 'Elige el ícono entre los preferidos, sin buscar en la biblioteca.')],
];

const LIMITS = () => [
  [L('O Figma não lê CSS', 'Figma doesn’t read CSS', 'Figma no lee CSS'), L('Cada componente é redesenhado a partir dos mesmos tokens. Quando o CSS de um componente muda, o desenho dele no plugin muda junto (figma/plugin/).', 'Each component is redrawn from the same tokens. When a component’s CSS changes, its drawing in the plugin changes with it (figma/plugin/).', 'Cada componente se redibuja a partir de los mismos tokens. Cuando cambia el CSS de un componente, su dibujo en el plugin cambia a la vez (figma/plugin/).')],
  [L('Alguns componentes ficam mais simples', 'Some components get simpler', 'Algunos componentes quedan más simples'), L('Tabela, gráficos e composer viram exemplos montados, sem todos os comportamentos da web.', 'Table, charts, and composer become assembled examples, without every web behavior.', 'Tabla, gráficos y composer se vuelven ejemplos armados, sin todos los comportamientos de la web.')],
  [L('Fontes', 'Fonts', 'Fuentes'), L('Inter, Inter Tight e JetBrains Mono precisam estar disponíveis. Sem uma delas, o plugin usa Inter no mesmo peso e avisa no fim.', 'Inter, Inter Tight, and JetBrains Mono need to be available. Without one of them, the plugin uses Inter at the same weight and warns at the end.', 'Inter, Inter Tight y JetBrains Mono tienen que estar disponibles. Sin alguna de ellas, el plugin usa Inter con el mismo peso y avisa al final.')],
  [L('Sombras não têm modo', 'Shadows have no mode', 'Las sombras no tienen modo'), L('Os estilos de sombra vêm em pares (Escuro/… e Claro/…); nos componentes, a sombra usa a cor de overlay, que tem modo.', 'Shadow styles come in pairs (Dark/… and Light/…); in the components, the shadow uses the overlay color, which has modes.', 'Los estilos de sombra vienen en pares (Oscuro/… y Claro/…); en los componentes, la sombra usa el color de overlay, que tiene modo.')],
  [L('Plano gratuito: um modo e 3 páginas', 'Free plan: one mode and 3 pages', 'Plan gratuito: un modo y 3 páginas'), L('Em Modos, escolha “Só Escuro” ou “Só Claro”. O Lume usa exatamente 3 páginas e aproveita a “Page 1” vazia do arquivo novo. Publicar como biblioteca pede plano pago; quando o arquivo for para um, rode de novo com Claro e Escuro e o que já existe é atualizado, sem duplicar.', 'In Modes, choose “Dark only” or “Light only”. Lume uses exactly 3 pages and reuses the empty “Page 1” of a new file. Publishing as a library requires a paid plan; when the file moves to one, run it again with Light and Dark and what already exists is updated, without duplicating.', 'En Modos, elige “Solo Oscuro” o “Solo Claro”. Lume usa exactamente 3 páginas y aprovecha la “Page 1” vacía del archivo nuevo. Publicar como biblioteca requiere un plan de pago; cuando el archivo pase a uno, ejecútalo de nuevo con Claro y Oscuro y lo que ya existe se actualiza, sin duplicar.')],
  [L('Só no app para desktop', 'Desktop app only', 'Solo en la app de escritorio'), L('Plugins de desenvolvimento não rodam no Figma do navegador.', 'Development plugins don’t run in Figma in the browser.', 'Los plugins de desarrollo no funcionan en Figma en el navegador.')],
];

const CODE_BLOCK = `// figma/plugin/31-meu-componente.js
(function () {
  defineBlock({
    id: 'etiqueta',
    page: 'Componentes',
    row: 'Ações',
    order: 6,
    group: 'Ações',
    title: 'Etiqueta',
    description: 'Rótulo curto para marcar um item.',
    build: async function () {
      var set = await variants('etiqueta', 'Etiqueta', [
        { props: { Tom: 'Neutro' }, build: async function (c) {
          box(c.name, { dir: 'H', pad: [4, 'space/100'], radius: 'radius/full', fill: 'color/bg/selected' }, c);
          add(c, await text('Etiqueta', { style: 'label-sm', prop: 'Rótulo' }));
        } },
      ], { props: { 'Rótulo': ['TEXT', 'Etiqueta'] } });

      return { sections: [{ title: 'Tons', node: set }].concat(themed('Etiqueta', async function () {
        return instance(set, { Tom: 'Neutro' }, { 'Rótulo': 'Novo' });
      })) };
    },
  });
})();`;

const NAV = () => [
  ['rf-instalar', L('Instalar', 'Install', 'Instalar')],
  ['rf-cria', L('O que cria', 'What it creates', 'Qué crea')],
  ['rf-blocos', L('Blocos', 'Blocks', 'Bloques')],
  ['rf-lista', L('Componentes', 'Components', 'Componentes')],
  ['rf-atualizar', L('Rodar de novo', 'Run again', 'Ejecutar de nuevo')],
  ['rf-propriedades', L('Propriedades', 'Properties', 'Propiedades')],
  ['rf-testar', L('Testar sem o Figma', 'Test without Figma', 'Probar sin Figma')],
  ['rf-limites', L('Limitações', 'Limitations', 'Limitaciones')],
  ['rf-manter', L('Para quem mantém', 'For maintainers', 'Para quien mantiene')],
];

function section(id, title, desc, body) {
  return `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header"><div>
      <h2 class="doc-section__title" id="${id}-title">${title}</h2>
      ${desc ? `<p class="doc-section__desc">${desc}</p>` : ''}
    </div></header>
    ${body}
  </section>`;
}

export default function renderFigma(page) {
  return `
  <div class="page doc rf-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Os componentes do Lume dentro do Figma, sem redesenhar nada: um plugin que cria variáveis, estilos, ícones e cada componente com variantes — organizados em blocos de documentação, nos modos Claro e Escuro.', 'Lume’s components inside Figma, without redrawing anything: a plugin that creates variables, styles, icons, and every component with variants — organized into documentation blocks, in Light and Dark modes.', 'Los componentes de Lume dentro de Figma, sin redibujar nada: un plugin que crea variables, estilos, íconos y cada componente con variantes — organizados en bloques de documentación, en los modos Claro y Oscuro.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('páginas no arquivo', 'pages in the file', 'páginas en el archivo')}</dt><dd class="doc-stat__value" data-stat="pages">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('blocos', 'blocks', 'bloques')}</dt><dd class="doc-stat__value" data-stat="blocks">—</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('variantes', 'variants', 'variantes')}</dt><dd class="doc-stat__value" data-stat="variants">—</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('ícones', 'icons', 'íconos')}</dt><dd class="doc-stat__value" data-stat="icons">—</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${NAV().map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'rf-instalar',
      L('Instalar', 'Install', 'Instalar'),
      L('Cinco passos, uma vez. Depois é só rodar o plugin de novo quando o design system mudar.', 'Five steps, once. After that, just run the plugin again when the design system changes.', 'Cinco pasos, una vez. Después solo hay que ejecutar el plugin de nuevo cuando cambie el design system.'),
      `<ol class="rf-steps" role="list">
        ${STEPS().map(
          ([title, text, code], i) => `<li class="rf-step">
            <p class="ds-section__head"><span class="ds-section__stamp">${String(i + 1).padStart(2, '0')}</span><span>${title}</span></p>
            <p class="rf-step__text">${text}</p>
            ${code ? codeBlock(code) : ''}
          </li>`,
        ).join('')}
      </ol>`,
    )}

    ${section(
      'rf-cria',
      L('O que cria', 'What it creates', 'Qué crea'),
      L('Três páginas — <strong>Lume · Fundamentos</strong>, <strong>Lume · Ícones</strong> e <strong>Lume · Componentes</strong> — sobre as variáveis e os estilos do arquivo.', 'Three pages — <strong>Lume · Fundamentos</strong>, <strong>Lume · Ícones</strong>, and <strong>Lume · Componentes</strong> — on top of the file’s variables and styles.', 'Tres páginas — <strong>Lume · Fundamentos</strong>, <strong>Lume · Ícones</strong> y <strong>Lume · Componentes</strong> — sobre las variables y los estilos del archivo.'),
      `<div class="rf-creates">
        ${CREATES().map(([glyph, title, text]) => `<article class="rf-create"><span class="rf-create__icon">${icon(glyph, { size: 20 })}</span><h3 class="rf-create__title">${title}</h3><p class="rf-create__text">${text}</p></article>`).join('')}
      </div>`,
    )}

    ${section(
      'rf-blocos',
      L('Blocos', 'Blocks', 'Bloques'),
      L('Cada componente vira um bloco de documentação, lado a lado com os outros da mesma categoria — com espaço para respirar.', 'Each component becomes a documentation block, side by side with the others in the same category — with room to breathe.', 'Cada componente se vuelve un bloque de documentación, lado a lado con los otros de la misma categoría — con espacio para respirar.'),
      `<div class="rf-anatomy">
        <div class="rf-mock" aria-hidden="true">
          <div class="rf-mock__head" data-num="1">
            <span class="rf-mock__eyebrow">${L('SELEÇÃO', 'SELECT', 'SELECTOR')}</span>
            <span class="rf-mock__title">${L('Seleção múltipla com busca', 'Searchable multi-select', 'Selector múltiple con búsqueda')}</span>
            <span class="rf-mock__row"><span class="rf-mock__desc">${L('Um campo que aceita várias opções, com busca no menu.', 'A field that accepts several options, with search in the menu.', 'Un campo que acepta varias opciones, con búsqueda en el menú.')}</span><span class="rf-mock__tags"><i>${L('Componente', 'Component', 'Componente')}</i><i>${L('Claro · Escuro', 'Light · Dark', 'Claro · Oscuro')}</i></span></span>
          </div>
          <div class="rf-mock__body">
            <div class="rf-mock__sec"><b>${L('Opção', 'Option', 'Opción')}</b><span class="rf-mock__set" data-num="2"><i></i><i></i><i></i><i></i></span></div>
            <div class="rf-mock__sec"><b>${L('Menu', 'Menu', 'Menú')}</b><span class="rf-mock__menu" data-num="3"><i></i><i></i><i></i><i></i></span></div>
            <div class="rf-mock__sec"><b>${L('Claro', 'Light', 'Claro')}</b><span class="rf-mock__theme" data-theme="light" data-num="4"><i></i><i></i></span></div>
            <div class="rf-mock__sec"><b>${L('Escuro', 'Dark', 'Oscuro')}</b><span class="rf-mock__theme" data-theme="dark"><i></i><i></i></span></div>
          </div>
        </div>
        <ol class="rf-legend" role="list">
          ${ANATOMY().map(([n, title, text]) => `<li><span class="rf-legend__num">${n}</span><div><p class="rf-legend__title">${title}</p><p class="rf-legend__text">${text}</p></div></li>`).join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'rf-lista',
      L('Componentes', 'Components', 'Componentes'),
      L('Os blocos da última geração, por página. A lista vem do teste do plugin (npm run figma:test).', 'The blocks from the latest generation, by page. The list comes from the plugin test (npm run figma:test).', 'Los bloques de la última generación, por página. La lista viene de la prueba del plugin (npm run figma:test).'),
      `<div class="rf-list" data-blocks><p class="rf-list__empty">${L(`Rode ${ic('npm run figma:test')} para ver a lista aqui.`, `Run ${ic('npm run figma:test')} to see the list here.`, `Ejecuta ${ic('npm run figma:test')} para ver la lista aquí.`)}</p></div>`,
    )}

    ${section(
      'rf-atualizar',
      L('Rodar de novo', 'Run again', 'Ejecutar de nuevo'),
      L('O plugin marca tudo o que cria. Na próxima execução, ele atualiza em vez de duplicar.', 'The plugin tags everything it creates. On the next run, it updates instead of duplicating.', 'El plugin marca todo lo que crea. En la próxima ejecución, actualiza en vez de duplicar.'),
      a11yList([
        [L('Componentes mantêm o id', 'Components keep their id', 'Los componentes mantienen el id'), L('O conteúdo de cada variante é refeito, mas o componente é o mesmo — instâncias espalhadas pelos seus arquivos continuam ligadas.', 'Each variant’s content is rebuilt, but the component is the same — instances spread across your files stay connected.', 'El contenido de cada variante se rehace, pero el componente es el mismo — las instancias repartidas por tus archivos siguen vinculadas.')],
        [L('Variáveis e estilos pelo nome', 'Variables and styles by name', 'Variables y estilos por el nombre'), L('Mudou um valor no tokens/*.json? Rode npm run tokens, npm run figma e o plugin: o valor muda no Figma, sem trocar a variável.', 'Changed a value in tokens/*.json? Run npm run tokens, npm run figma, and the plugin: the value changes in Figma, without replacing the variable.', '¿Cambiaste un valor en tokens/*.json? Ejecuta npm run tokens, npm run figma y el plugin: el valor cambia en Figma, sin reemplazar la variable.')],
        [L('Blocos são refeitos', 'Blocks are rebuilt', 'Los bloques se rehacen'), L('Cabeçalhos, exemplos e prévias são documentação: o plugin apaga e monta de novo, então não edite dentro deles.', 'Headers, examples, and previews are documentation: the plugin deletes and rebuilds them, so don’t edit inside them.', 'Encabezados, ejemplos y vistas previas son documentación: el plugin los borra y los arma de nuevo, así que no edites dentro de ellos.')],
        [L('Outro idioma renomeia', 'Another language renames', 'Otro idioma renombra'), L('Em Idioma, escolha Português, English ou Español (Sistema segue o computador). Rodar de novo em outro idioma renomeia páginas, coleções, modos, componentes, propriedades e textos no lugar — os ids e as instâncias continuam.', 'Under Language, choose Português, English, or Español (System follows the computer). Running again in another language renames pages, collections, modes, components, properties, and text in place — ids and instances stay.', 'En Idioma, elige Português, English o Español (Sistema sigue a la computadora). Ejecutarlo de nuevo en otro idioma renombra páginas, colecciones, modos, componentes, propiedades y textos en el lugar — los ids y las instancias se mantienen.')],
        [L('O que você criou fica', 'What you created stays', 'Lo que creaste se queda'), L('Páginas, frames e componentes que não vieram do plugin não são tocados.', 'Pages, frames, and components that didn’t come from the plugin aren’t touched.', 'Las páginas, frames y componentes que no vinieron del plugin no se tocan.')],
      ]),
    )}

    ${section(
      'rf-propriedades',
      L('Propriedades', 'Properties', 'Propiedades'),
      L('Para trocar o que importa na instância, sem desanexar.', 'To change what matters on the instance, without detaching.', 'Para cambiar lo que importa en la instancia, sin desvincular.'),
      `<div class="doc-table rf-props">
        <div class="doc-table__head" aria-hidden="true"><span>${L('Tipo', 'Type', 'Tipo')}</span><span>${L('Exemplos', 'Examples', 'Ejemplos')}</span><span>${L('Para quê', 'What for', 'Para qué')}</span></div>
        ${PROPS().map(([t, ex, text]) => `<div class="doc-table__row"><span class="rf-props__type">${t}</span><code class="ds-inline-code">${ex}</code><span class="rf-props__text">${text}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'rf-testar',
      L('Testar sem o Figma', 'Test without Figma', 'Probar sin Figma'),
      L('O teste roda o plugin numa imitação da API do Figma, com as mesmas regras (fonte carregada antes do texto, preencher só em auto layout, propriedades válidas), roda de novo para garantir que nada duplica e gera uma prévia.', 'The test runs the plugin against an imitation of the Figma API, with the same rules (font loaded before text, fill only in auto layout, valid properties), runs it again to make sure nothing duplicates, and generates a preview.', 'La prueba ejecuta el plugin en una imitación de la API de Figma, con las mismas reglas (fuente cargada antes del texto, rellenar solo en auto layout, propiedades válidas), lo ejecuta de nuevo para garantizar que nada se duplica y genera una vista previa.'),
      `${codeBlock('npm run figma:test')}
      <p class="rf-note">${icon('eye', { size: 16 })}<span>${L('A prévia fica em <a class="rf-link" href="dist/figma-plugin/preview.html" target="_blank" rel="noopener">dist/figma-plugin/preview.html</a> — uma aproximação (auto layout vira flexbox). O Figma de verdade é a palavra final.', 'The preview is at <a class="rf-link" href="dist/figma-plugin/preview.html" target="_blank" rel="noopener">dist/figma-plugin/preview.html</a> — an approximation (auto layout becomes flexbox). The real Figma has the final word.', 'La vista previa queda en <a class="rf-link" href="dist/figma-plugin/preview.html" target="_blank" rel="noopener">dist/figma-plugin/preview.html</a> — una aproximación (auto layout se vuelve flexbox). El Figma de verdad tiene la última palabra.')}</span></p>`,
    )}

    ${section(
      'rf-limites',
      L('Limitações', 'Limitations', 'Limitaciones'),
      L('O que o plugin não faz — de propósito ou por limite do Figma.', 'What the plugin doesn’t do — on purpose or because of a Figma limit.', 'Lo que el plugin no hace — a propósito o por un límite de Figma.'),
      `<div class="usage-grid">
        ${LIMITS().map(([title, text]) => `<article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('info', { size: 18 })}${title}</p><p class="usage-card__text">${text}</p></article>`).join('')}
      </div>`,
    )}

    ${section(
      'rf-manter',
      L('Para quem mantém', 'For maintainers', 'Para quien mantiene'),
      L(`Um arquivo por grupo em ${ic('figma/plugin/')}, em ordem: o núcleo (00), os idiomas (01 a 06), os modelos (30, 40) e os blocos. Cada arquivo registra os seus com ${ic('defineBlock')}. Os textos são escritos em português e o dicionário traz o inglês e o espanhol — o ${ic('npm run figma:test')} lista o que ficou sem tradução.`, `One file per group in ${ic('figma/plugin/')}, in order: the core (00), the languages (01 to 06), the templates (30, 40), and the blocks. Each file registers its own with ${ic('defineBlock')}. Text is written in Portuguese and the dictionary brings the English and Spanish — ${ic('npm run figma:test')} lists anything left untranslated.`, `Un archivo por grupo en ${ic('figma/plugin/')}, en orden: el núcleo (00), los idiomas (01 a 06), las plantillas (30, 40) y los bloques. Cada archivo registra los suyos con ${ic('defineBlock')}. Los textos se escriben en portugués y el diccionario trae el inglés y el español — ${ic('npm run figma:test')} lista lo que quedó sin traducir.`),
      codeBlock(CODE_BLOCK),
    )}
  </div>`;
}

export function mount(root) {
  const unmountNav = mountDocNav(root);
  const unmountCopy = mountCodeCopy(root);
  let alive = true;

  fetch(SUMMARY_URL, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!alive || !data) return;
      const set = (k, v) => {
        const el = root.querySelector(`[data-stat="${k}"]`);
        if (el) el.textContent = v;
      };
      set('pages', data.pages.length);
      set('blocks', data.blocks.length);
      set('variants', data.blocks.reduce((a, b) => a + b.variants, 0));
      set('icons', data.icons);
      const byPage = {};
      // nomes nos três idiomas (summary.json antigo: só o português)
      data.blocks.forEach((b) => (byPage[tr(b.page)] ??= []).push(b));
      const list = root.querySelector('[data-blocks]');
      list.replaceChildren();
      for (const [pageName, blocks] of Object.entries(byPage)) {
        const group = document.createElement('div');
        group.className = 'rf-list__group';
        const h = document.createElement('p');
        h.className = 'rf-list__page';
        h.textContent = `Lume · ${pageName}`;
        group.append(h);
        const ul = document.createElement('ul');
        ul.className = 'rf-list__items';
        ul.setAttribute('role', 'list');
        for (const b of blocks) {
          const li = document.createElement('li');
          li.className = 'rf-list__item';
          const name = document.createElement('span');
          name.textContent = tr(b.title);
          const meta = document.createElement('span');
          meta.className = 'rf-list__meta';
          meta.textContent = b.variants
            ? L(`${b.variants} variantes`, `${b.variants} variants`, `${b.variants} variantes`)
            : b.sets
              ? L(`${b.sets} conjuntos`, `${b.sets} sets`, `${b.sets} conjuntos`)
              : L('documentação', 'documentation', 'documentación');
          li.append(name, meta);
          ul.append(li);
        }
        group.append(ul);
        list.append(group);
      }
    })
    .catch(() => {});

  return () => {
    alive = false;
    unmountNav();
    unmountCopy();
  };
}
