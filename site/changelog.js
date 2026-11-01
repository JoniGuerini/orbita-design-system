/**
 * Histórico de versões do Órbita — fonte da página Novidades e do indicador da sidebar.
 * Tipos: 'novo' | 'melhoria' | 'correcao'.
 * Textos em T(pt-BR, en, es): títulos, resumos, nomes dos grupos e itens. Em `releases`, `upcoming`
 * e `TYPES` eles viram getters no idioma atual.
 */
import { tr } from '../ds/js/i18n.js';

const T = (pt, en, es) => ({ 'pt-BR': pt, en, es });

export const CURRENT_VERSION = '0.6.1';
export const SEEN_KEY = 'ds-novidades-vista';

const RELEASES = [
  {
    version: '0.6.1',
    date: '2026-10-31',
    title: T('Plugin no plano gratuito', 'Plugin on the free plan', 'Plugin en el plan gratuito'),
    summary: T(
      'O plugin do Figma passou a funcionar no plano gratuito, que aceita um modo por coleção de variáveis e 3 páginas por arquivo: você escolhe os modos na janela e completa depois, sem duplicar nada.',
      'The Figma plugin now works on the free plan, which allows one mode per variable collection and 3 pages per file: you pick the modes in the window and add the rest later, without duplicating anything.',
      'El plugin de Figma ahora funciona en el plan gratuito, que admite un modo por colección de variables y 3 páginas por archivo: eliges los modos en la ventana y completas después, sin duplicar nada.',
    ),
    groups: [
      {
        name: T('Figma', 'Figma', 'Figma'),
        items: [
          ['novo', T(
            'Modos na janela do plugin: Claro e Escuro, Só Escuro ou Só Claro. A escolha fica guardada no computador',
            'Modes in the plugin window: Light and Dark, Dark only, or Light only. The choice is saved on your computer',
            'Modos en la ventana del plugin: Claro y Oscuro, Solo Oscuro o Solo Claro. La elección queda guardada en tu computadora',
          ), '/recursos/figma'],
          ['melhoria', T(
            'A “Page 1” vazia do arquivo novo vira uma página do Órbita: as 3 páginas cabem no plano gratuito',
            'The empty “Page 1” of a new file becomes an Órbita page: all 3 pages fit in the free plan',
            'La “Page 1” vacía del archivo nuevo se convierte en una página de Órbita: las 3 páginas caben en el plan gratuito',
          ), '/recursos/figma'],
          ['melhoria', T(
            'Num arquivo gerado com um modo só, rodar de novo com Claro e Escuro acrescenta o outro modo e mantém os componentes e as instâncias',
            'In a file generated with a single mode, running again with Light and Dark adds the other mode and keeps the components and instances',
            'En un archivo generado con un solo modo, ejecutarlo de nuevo con Claro y Oscuro agrega el otro modo y mantiene los componentes y las instancias',
          ), '/recursos/figma'],
          ['correcao', T(
            'As recusas do plano gratuito (modos e páginas) viraram explicações em português, com o que fazer',
            'Free-plan refusals (modes and pages) now come with a clear explanation and what to do',
            'Los rechazos del plan gratuito (modos y páginas) ahora vienen con una explicación clara y qué hacer',
          ), '/recursos/figma'],
          ['melhoria', T(
            'O teste do plugin simula o plano gratuito e a passagem para um plano pago',
            'The plugin test simulates the free plan and the move to a paid plan',
            'La prueba del plugin simula el plan gratuito y el paso a un plan de pago',
          ), '/recursos/figma'],
        ],
      },
      {
        name: T('Site', 'Site', 'Sitio'),
        items: [
          ['novo', T(
            'Dourado na troca da cor da marca, ao lado de Pêssego, Violeta, Azul, Verde e Rosa',
            'Gold in the brand color switcher, alongside Peach, Violet, Blue, Green, and Pink',
            'Dorado en el selector de color de marca, junto a Melocotón, Violeta, Azul, Verde y Rosa',
          ), '/'],
          ['correcao', T(
            'Com Dourado e Verde, os links do tema claro descem um tom e passam de 4,5:1',
            'With Gold and Green, light-theme links go one shade darker and pass 4.5:1',
            'Con Dorado y Verde, los enlaces del tema claro bajan un tono y superan 4,5:1',
          ), '/recursos/acessibilidade'],
          ['correcao', T(
            'Com Dourado e Azul, a série de gráfico da mesma cor troca de lugar com a 1ª: nada se repete, e a ordem segue validada para daltonismo',
            'With Gold and Blue, the chart series of the same color swaps places with the 1st: nothing repeats, and the order stays validated for color blindness',
            'Con Dorado y Azul, la serie de gráfico del mismo color cambia de lugar con la 1.ª: nada se repite y el orden sigue validado para daltonismo',
          ), '/graficos/visao-geral'],
          ['correcao', T(
            'Na troca da cor da marca, a bolinha do Pêssego não imita mais a cor escolhida',
            'In the brand color switcher, the Peach swatch no longer mimics the chosen color',
            'En el selector de color de marca, el círculo de Melocotón ya no imita el color elegido',
          ), '/'],
          ['correcao', T(
            'Subir o servidor não regrava mais a data dos tokens quando nada mudou',
            'Starting the server no longer rewrites the token date when nothing changed',
            'Iniciar el servidor ya no reescribe la fecha de los tokens cuando nada cambió',
          ), '/recursos/tokens'],
        ],
      },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-10-31',
    title: T('Plugin completo', 'Complete plugin', 'Plugin completo'),
    summary: T(
      'O plugin do Figma passou a cobrir o design system inteiro: 7 blocos novos, as variações que faltavam e as correções que só apareceram rodando no Figma de verdade.',
      'The Figma plugin now covers the whole design system: 7 new blocks, the missing variants, and the fixes that only showed up when running in the real Figma.',
      'El plugin de Figma ahora cubre todo el design system: 7 bloques nuevos, las variantes que faltaban y las correcciones que solo aparecieron al ejecutarlo en Figma de verdad.',
    ),
    groups: [
      {
        name: T('Figma', 'Figma', 'Figma'),
        items: [
          ['novo', T(
            'Blocos novos: Movimento, Layout, Código, Dispersão, Paleta de comandos, Barra de filtros e Formulário — 42 no total',
            'New blocks: Motion, Layout, Code, Scatter, Command palette, Filter bar, and Form — 42 in total',
            'Bloques nuevos: Movimiento, Layout, Código, Dispersión, Paleta de comandos, Barra de filtros y Formulario — 42 en total',
          ), '/recursos/figma'],
          ['novo', T(
            'Gráficos: barras 100%, divergentes e funil, áreas empilhadas, heatmap em calendário e o número de destaque',
            'Charts: 100% bars, diverging bars and funnel, stacked areas, calendar heatmap, and the hero number',
            'Gráficos: barras al 100 %, divergentes y embudo, áreas apiladas, heatmap de calendario y el número destacado',
          ), '/graficos/barras'],
          ['novo', T(
            'Estado vazio sem permissão, offline e carregando; anexo, sugestões e composer com anexo; seleção com busca; avatar quadrado e divisor',
            'Empty state for no permission, offline, and loading; attachment, suggestions, and composer with an attachment; select with search; square avatar and divider',
            'Estado vacío sin permiso, sin conexión y cargando; adjunto, sugerencias y composer con adjunto; selector con búsqueda; avatar cuadrado y divisor',
          ), '/padroes/estados-vazios'],
          ['novo', T(
            'O bloco de Cores mostra também as escalas sequencial, ordinal e divergente e as cores de apoio dos gráficos',
            'The Colors block also shows the sequential, ordinal, and diverging scales and the chart support colors',
            'El bloque de Colores también muestra las escalas secuencial, ordinal y divergente y los colores de apoyo de los gráficos',
          ), '/fundamentos/cores'],
          ['correcao', T(
            'Opacidade própria em cor de variável (véu do avatar, hover sutil, lavagens dos gráficos): o Figma a trocava pela da variável',
            'Custom opacity on a variable color (avatar veil, subtle hover, chart washes): Figma replaced it with the variable’s own',
            'Opacidad propia en un color de variable (velo del avatar, hover sutil, lavados de los gráficos): Figma la cambiaba por la de la variable',
          ), '/recursos/figma'],
          ['correcao', T(
            'Ícones numa camada só, com o traço em contorno: trocar o ícone mantém a cor e nunca deixa um ícone preenchido',
            'Icons in a single layer, with the stroke outlined: swapping the icon keeps the color and never leaves a filled icon',
            'Íconos en una sola capa, con el trazo contorneado: cambiar el ícono mantiene el color y nunca deja un ícono relleno',
          ), '/fundamentos/icones'],
          ['correcao', T(
            'Etiquetas do cabeçalho dentro da borda, anel de foco no tamanho real de cada campo e status do avatar aplicado',
            'Header tags inside the border, a focus ring at each field’s real size, and the avatar status applied',
            'Etiquetas del encabezado dentro del borde, anillo de foco del tamaño real de cada campo y estado del avatar aplicado',
          ), '/recursos/figma'],
          ['melhoria', T(
            'O teste do plugin acusa conteúdo vazando da borda, opacidade perdida e ícone fora do formato',
            'The plugin test flags content overflowing the border, lost opacity, and off-format icons',
            'La prueba del plugin detecta contenido que se sale del borde, opacidad perdida e íconos fuera de formato',
          ), '/recursos/figma'],
        ],
      },
      {
        name: T('Tokens', 'Tokens', 'Tokens'),
        items: [
          ['novo', T(
            'As durações (duration.*) viram variáveis de Dimensões no Figma, em milissegundos — 59 dimensões',
            'Durations (duration.*) become dimension variables in Figma, in milliseconds — 59 dimensions',
            'Las duraciones (duration.*) se convierten en variables de dimensión en Figma, en milisegundos — 59 dimensiones',
          ), '/fundamentos/movimento'],
        ],
      },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-10-31',
    title: T('Plugin do Figma', 'Figma plugin', 'Plugin de Figma'),
    summary: T(
      'Os componentes do Órbita dentro do Figma, sem redesenhar: um plugin que você importa pelo manifesto e que gera variáveis, estilos, ícones e 35 blocos de documentação nos modos Claro e Escuro.',
      'Órbita’s components inside Figma, without redrawing: a plugin you import from its manifest that generates variables, styles, icons, and 35 documentation blocks in Light and Dark modes.',
      'Los componentes de Órbita dentro de Figma, sin redibujar: un plugin que importas desde el manifiesto y que genera variables, estilos, íconos y 35 bloques de documentación en los modos Claro y Oscuro.',
    ),
    groups: [
      {
        name: T('Figma', 'Figma', 'Figma'),
        items: [
          ['novo', T(
            'Plugin “Órbita para Figma”: Plugins → Desenvolvimento → Importar plugin do manifesto',
            'The “Órbita para Figma” plugin: Plugins → Development → Import plugin from manifest',
            'Plugin “Órbita para Figma”: Plugins → Development → Import plugin from manifest',
          ), '/recursos/figma'],
          ['novo', T(
            '35 blocos com cabeçalho, matriz de variantes rotulada, exemplos e prévias Claro e Escuro — 42 conjuntos e 474 variantes',
            '35 blocks with a header, a labeled variant matrix, examples, and Light and Dark previews — 42 sets and 474 variants',
            '35 bloques con encabezado, matriz de variantes rotulada, ejemplos y vistas previas Claro y Oscuro — 42 conjuntos y 474 variantes',
          ), '/recursos/figma'],
          ['novo', T(
            'Páginas de Fundamentos (cores nos dois modos, tipografia, espaço, raio, sombra) e de Ícones (126 componentes)',
            'Foundations pages (colors in both modes, typography, spacing, radius, shadow) and Icons (126 components)',
            'Páginas de Fundamentos (colores en los dos modos, tipografía, espaciado, radio, sombra) y de Íconos (126 componentes)',
          ), '/recursos/figma'],
          ['novo', T(
            'Propriedades de componente: rótulo, ícone opcional e troca de ícone',
            'Component properties: label, optional icon, and icon swap',
            'Propiedades de componente: etiqueta, ícono opcional y cambio de ícono',
          ), '/recursos/figma'],
          ['melhoria', T(
            'Rodar de novo atualiza sem duplicar: componentes mantêm o id e as instâncias continuam ligadas',
            'Running again updates without duplicating: components keep their id and instances stay linked',
            'Ejecutarlo de nuevo actualiza sin duplicar: los componentes mantienen el id y las instancias siguen vinculadas',
          ), '/recursos/figma'],
          ['novo', T(
            'npm run figma e npm run figma:test — o teste roda o plugin numa imitação da API do Figma e gera uma prévia',
            'npm run figma and npm run figma:test — the test runs the plugin against a mock of the Figma API and generates a preview',
            'npm run figma y npm run figma:test — la prueba ejecuta el plugin en una imitación de la API de Figma y genera una vista previa',
          ), '/recursos/figma'],
        ],
      },
    ],
  },
  {
    version: '0.4.1',
    date: '2026-10-31',
    title: T('Contraste em dia', 'Contrast sorted', 'Contraste al día'),
    summary: T(
      'As três pendências de acessibilidade foram resolvidas: contorno de campos, switch desligado e texto apagado no tema claro. O build agora mede 70 combinações.',
      'The three open accessibility issues are fixed: field borders, the off switch, and faded text in the light theme. The build now measures 70 pairs.',
      'Se resolvieron los tres pendientes de accesibilidad: el borde de los campos, el switch apagado y el texto atenuado en el tema claro. El build ahora mide 70 combinaciones.',
    ),
    groups: [
      {
        name: T('Acessibilidade', 'Accessibility', 'Accesibilidad'),
        items: [
          ['correcao', T(
            'Campos, seleção, composer e switch ganharam o contorno border.field, que passa de 3:1 em todas as superfícies',
            'Fields, select, composer, and switch got the border.field outline, which passes 3:1 on every surface',
            'Campos, selector, composer y switch recibieron el contorno border.field, que supera 3:1 en todas las superficies',
          ), '/componentes/campo-de-texto'],
          ['correcao', T(
            'O switch desligado agora tem contorno visível em qualquer fundo',
            'The off switch now has a visible outline on any background',
            'El switch apagado ahora tiene un contorno visible sobre cualquier fondo',
          ), '/componentes/switch'],
          ['correcao', T(
            'fg.subtle no tema claro passa de 4,5:1 (novo tom neutral.550); fg.muted desceu para neutral.650 para manter a hierarquia',
            'fg.subtle in the light theme passes 4.5:1 (new neutral.550 shade); fg.muted moved down to neutral.650 to keep the hierarchy',
            'fg.subtle en el tema claro supera 4,5:1 (nuevo tono neutral.550); fg.muted bajó a neutral.650 para mantener la jerarquía',
          ), '/fundamentos/cores'],
          ['melhoria', T(
            'O build mede fg.subtle a 4,5:1 e border.field a 3:1 contra canvas, surface, raised e sunken',
            'The build checks fg.subtle at 4.5:1 and border.field at 3:1 against canvas, surface, raised, and sunken',
            'El build mide fg.subtle a 4,5:1 y border.field a 3:1 contra canvas, surface, raised y sunken',
          ), '/recursos/acessibilidade'],
          ['melhoria', T(
            'Chips, botões e a busca da sidebar mantêm o contorno fino: o rótulo já identifica o controle',
            'Chips, buttons, and the sidebar search keep the thin outline: the label already identifies the control',
            'Chips, botones y la búsqueda de la sidebar mantienen el contorno fino: la etiqueta ya identifica el control',
          ), '/recursos/acessibilidade'],
        ],
      },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-10-31',
    title: T('Recursos', 'Resources', 'Recursos'),
    summary: T(
      'O que o time precisa para adotar e evoluir o Órbita: guia de acessibilidade com as pendências à vista, tokens exportados para o Figma e o caminho de uma contribuição.',
      'What the team needs to adopt and evolve Órbita: an accessibility guide with open issues in plain sight, tokens exported to Figma, and the path for a contribution.',
      'Lo que el equipo necesita para adoptar y hacer crecer Órbita: una guía de accesibilidad con los pendientes a la vista, tokens exportados a Figma y el camino de una contribución.',
    ),
    groups: [
      {
        name: T('Recursos', 'Resources', 'Recursos'),
        items: [
          ['novo', T(
            'Acessibilidade: verificador de contraste com qualquer par de tokens, nos dois temas, e o mapa de teclado de cada componente',
            'Accessibility: a contrast checker for any pair of tokens, in both themes, and the keyboard map for each component',
            'Accesibilidad: verificador de contraste con cualquier par de tokens, en los dos temas, y el mapa de teclado de cada componente',
          ), '/recursos/acessibilidade'],
          ['novo', T(
            'Pendências de acessibilidade calculadas ao vivo: contorno de campos e chips, switch desligado e texto apagado no tema claro',
            'Accessibility issues calculated live: field and chip outlines, the off switch, and faded text in the light theme',
            'Pendientes de accesibilidad calculados en vivo: contorno de campos y chips, switch apagado y texto atenuado en el tema claro',
          ), '/recursos/acessibilidade'],
          ['novo', T(
            'Tokens para Figma: variáveis com modos Escuro e Claro, aliases, estilos de texto e sombra, no formato da API REST e num plugin local',
            'Tokens for Figma: variables with Dark and Light modes, aliases, text and shadow styles, in the REST API format and as a local plugin',
            'Tokens para Figma: variables con modos Oscuro y Claro, alias, estilos de texto y sombra, en el formato de la API REST y en un plugin local',
          ), '/recursos/tokens'],
          ['novo', T(
            'Exportação em DTCG, JSON plano e CSS com npm run tokens:export',
            'Export to DTCG, flat JSON, and CSS with npm run tokens:export',
            'Exportación en DTCG, JSON plano y CSS con npm run tokens:export',
          ), '/recursos/tokens'],
          ['novo', T(
            'Como contribuir: do pedido à publicação, com modelo de proposta, “Isso é do design system?” e checklist de revisão',
            'How to contribute: from request to release, with a proposal template, “Does this belong in the design system?”, and a review checklist',
            'Cómo contribuir: del pedido a la publicación, con plantilla de propuesta, “¿Esto es del design system?” y checklist de revisión',
          ), '/recursos/contribuir'],
        ],
      },
      {
        name: T('Componentes', 'Components', 'Componentes'),
        items: [
          ['melhoria', T(
            'Tooltip segue a WCAG 1.4.13: dá para passar o mouse por cima, fecha com Esc e não some enquanto você lê',
            'Tooltip follows WCAG 1.4.13: you can hover over it, it closes with Esc, and it doesn’t vanish while you read',
            'El tooltip sigue la WCAG 1.4.13: puedes pasar el mouse por encima, se cierra con Esc y no desaparece mientras lees',
          ), '/recursos/acessibilidade'],
          ['melhoria', T(
            'O Início lista os Recursos junto dos Padrões',
            'Home lists Resources alongside Patterns',
            'El Inicio lista los Recursos junto a los Patrones',
          ), '/'],
        ],
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-10-31',
    title: T('Padrões', 'Patterns', 'Patrones'),
    summary: T(
      'Como as peças se encaixam em telas reais: app shell, conversa, formulários, estados vazios e busca — cada padrão com um exemplo que funciona de verdade.',
      'How the pieces fit together in real screens: app shell, chat, forms, empty states, and search — each pattern with an example that actually works.',
      'Cómo encajan las piezas en pantallas reales: app shell, conversación, formularios, estados vacíos y búsqueda — cada patrón con un ejemplo que funciona de verdad.',
    ),
    groups: [
      {
        name: T('Padrões', 'Patterns', 'Patrones'),
        items: [
          ['novo', T(
            'App shell com o app real embutido, em tamanho de desktop e de celular, sem mexer nas suas preferências',
            'App shell with the real app embedded, at desktop and mobile sizes, without touching your preferences',
            'App shell con la app real incrustada, en tamaño de escritorio y de móvil, sin tocar tus preferencias',
          ), '/padroes/app-shell'],
          ['novo', T(
            'Conversa e composer: mensagens, cartão de resultado, anexos e comandos com “/”',
            'Chat and composer: messages, result card, attachments, and “/” commands',
            'Conversación y composer: mensajes, tarjeta de resultado, adjuntos y comandos con “/”',
          ), '/padroes/conversa'],
          ['novo', T(
            'Formulários com validação na saída do campo, resumo de erros que leva a cada campo e ações fixas',
            'Forms with validation when leaving a field, an error summary that takes you to each field, and sticky actions',
            'Formularios con validación al salir del campo, resumen de errores que lleva a cada campo y acciones fijas',
          ), '/padroes/formularios'],
          ['novo', T(
            'Estados vazios para primeiro uso, sem resultados, erro, sem permissão, offline e carregando',
            'Empty states for first use, no results, error, no permission, offline, and loading',
            'Estados vacíos para primer uso, sin resultados, error, sin permiso, sin conexión y cargando',
          ), '/padroes/estados-vazios'],
          ['novo', T(
            'Busca e comandos: paleta ⌘K, barra de filtros com estado na URL e mapa de atalhos',
            'Search and commands: ⌘K palette, filter bar with state in the URL, and a shortcut map',
            'Búsqueda y comandos: paleta ⌘K, barra de filtros con estado en la URL y mapa de atajos',
          ), '/padroes/busca'],
        ],
      },
      {
        name: T('Componentes e JavaScript', 'Components and JavaScript', 'Componentes y JavaScript'),
        items: [
          ['novo', T(
            'Alerta inline com tons, título, lista, ações e versão compacta (.ds-alert)',
            'Inline alert with tones, title, list, actions, and a compact version (.ds-alert)',
            'Alerta inline con tonos, título, lista, acciones y versión compacta (.ds-alert)',
          ), '/padroes/formularios'],
          ['novo', T(
            'Composer e mensagens (.ds-composer, .ds-message, createComposer)',
            'Composer and messages (.ds-composer, .ds-message, createComposer)',
            'Composer y mensajes (.ds-composer, .ds-message, createComposer)',
          ), '/padroes/conversa'],
          ['novo', T(
            'Validação de formulários a partir dos atributos nativos, em português (enhanceForm)',
            'Form validation built on native attributes, with its own messages (enhanceForm)',
            'Validación de formularios a partir de los atributos nativos, con mensajes propios (enhanceForm)',
          ), '/padroes/formularios'],
          ['novo', T(
            'Barra de filtros com pílulas removíveis e contagem anunciada (createFilters)',
            'Filter bar with removable pills and an announced count (createFilters)',
            'Barra de filtros con píldoras removibles y conteo anunciado (createFilters)',
          ), '/padroes/busca'],
          ['melhoria', T(
            'Estado vazio ganhou versões compacta, inline, sem borda, de erro e carregando',
            'Empty state got compact, inline, borderless, error, and loading versions',
            'El estado vacío ganó versiones compacta, inline, sin borde, de error y cargando',
          ), '/padroes/estados-vazios'],
          ['melhoria', T(
            'App shell aceita modo de demonstração (persist: false) e avisa mudanças com ds:shellchange',
            'App shell accepts a demo mode (persist: false) and announces changes with ds:shellchange',
            'El app shell acepta un modo de demostración (persist: false) y avisa los cambios con ds:shellchange',
          ), '/padroes/app-shell'],
          ['melhoria', T(
            'Paleta de comandos aceita várias instâncias e pode ser destruída',
            'Command palette accepts multiple instances and can be destroyed',
            'La paleta de comandos acepta varias instancias y puede destruirse',
          ), '/padroes/busca'],
          ['novo', T(
            '12 ícones novos: enviar, anexar, parar, gostei, teclado, comando, sem conexão e outros',
            '12 new icons: send, attach, stop, like, keyboard, command, offline, and more',
            '12 íconos nuevos: enviar, adjuntar, detener, me gusta, teclado, comando, sin conexión y otros',
          ), '/fundamentos/icones'],
        ],
      },
      {
        name: T('Correções', 'Fixes', 'Correcciones'),
        items: [
          ['correcao', T(
            'Marcar o item ativo da sidebar não rola mais a página inteira junto',
            'Marking the active sidebar item no longer scrolls the whole page along with it',
            'Marcar el ítem activo de la sidebar ya no desplaza toda la página',
          ), '/padroes/app-shell'],
        ],
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-10-31',
    title: T('Gráficos', 'Charts', 'Gráficos'),
    summary: T(
      'Uma seção inteira de gráficos: seis formas, indicadores e uma paleta validada para daltonismo nos dois temas. Tudo em SVG, sem dependências.',
      'A whole section of charts: six shapes, indicators, and a palette validated for color blindness in both themes. All in SVG, with no dependencies.',
      'Una sección entera de gráficos: seis formas, indicadores y una paleta validada para daltonismo en los dos temas. Todo en SVG, sin dependencias.',
    ),
    groups: [
      {
        name: T('Gráficos', 'Charts', 'Gráficos'),
        items: [
          ['novo', T(
            'Sete páginas: visão geral, barras, linhas e áreas, rosca, heatmap, dispersão e indicadores',
            'Seven pages: overview, bars, lines and areas, donut, heatmap, scatter, and indicators',
            'Siete páginas: visión general, barras, líneas y áreas, dona, heatmap, dispersión e indicadores',
          ), '/graficos/visao-geral'],
          ['novo', T(
            'Paleta categórica de 8 cores em ordem fixa, validada para daltonismo e visão normal nos dois temas',
            'An 8-color categorical palette in a fixed order, validated for color blindness and normal vision in both themes',
            'Paleta categórica de 8 colores en orden fijo, validada para daltonismo y visión normal en los dos temas',
          ), '/graficos/visao-geral'],
          ['novo', T(
            'Escalas sequencial, ordinal e divergente, grade e eixo como tokens color.chart.*',
            'Sequential, ordinal, and diverging scales, grid, and axis as color.chart.* tokens',
            'Escalas secuencial, ordinal y divergente, cuadrícula y eje como tokens color.chart.*',
          ), '/fundamentos/cores'],
          ['novo', T(
            'Biblioteca em SVG puro: barChart, lineChart, donutChart, heatmap, calendarHeatmap e scatterChart',
            'A pure-SVG library: barChart, lineChart, donutChart, heatmap, calendarHeatmap, and scatterChart',
            'Biblioteca en SVG puro: barChart, lineChart, donutChart, heatmap, calendarHeatmap y scatterChart',
          ), '/graficos/barras'],
          ['novo', T(
            'Indicador, número de destaque, sparkline e medidor para quando o gráfico é um número',
            'Indicator, hero number, sparkline, and meter for when the chart is a number',
            'Indicador, número destacado, sparkline y medidor para cuando el gráfico es un número',
          ), '/graficos/indicadores'],
          ['melhoria', T(
            'Tooltip no hover e no teclado, legenda que esconde séries sem repintar as outras e vista em tabela',
            'Tooltip on hover and keyboard, a legend that hides series without repainting the others, and a table view',
            'Tooltip al pasar el cursor y con teclado, leyenda que oculta series sin repintar las demás y vista de tabla',
          ), '/graficos/visao-geral'],
          ['melhoria', T(
            'Textura opcional em 45° e 135° para daltonismo total, impressão e alto contraste',
            'Optional 45° and 135° texture for total color blindness, printing, and high contrast',
            'Textura opcional a 45° y 135° para daltonismo total, impresión y alto contraste',
          ), '/graficos/rosca'],
        ],
      },
      {
        name: T('Fundamentos e documentação', 'Foundations and docs', 'Fundamentos y documentación'),
        items: [
          ['novo', T(
            '10 ícones de gráfico, numa categoria própria',
            '10 chart icons, in their own category',
            '10 íconos de gráfico, en una categoría propia',
          ), '/fundamentos/icones'],
          ['melhoria', T(
            'Cores ganhou o grupo de tokens Gráficos',
            'Colors got the Charts token group',
            'Colores ganó el grupo de tokens Gráficos',
          ), '/fundamentos/cores'],
          ['melhoria', T(
            'O Início mostra os gráficos e o roadmap traz todas as versões',
            'Home shows the charts, and the roadmap lists every version',
            'El Inicio muestra los gráficos y el roadmap trae todas las versiones',
          ), '/'],
        ],
      },
      {
        name: T('Correções', 'Fixes', 'Correcciones'),
        items: [
          ['correcao', T(
            'O Início não diz mais que os componentes estão “a caminho”',
            'Home no longer says the components are “on the way”',
            'El Inicio ya no dice que los componentes están “en camino”',
          ), '/'],
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-10-31',
    title: T('Primeira versão', 'First version', 'Primera versión'),
    summary: T(
      'Fundamentos completos, 16 componentes documentados e o app shell. A base para começar a construir.',
      'Complete foundations, 16 documented components, and the app shell. The base to start building on.',
      'Fundamentos completos, 16 componentes documentados y el app shell. La base para empezar a construir.',
    ),
    groups: [
      {
        name: T('Fundamentos', 'Foundations', 'Fundamentos'),
        items: [
          ['novo', T(
            'Tokens gerados em OKLCH, com 13 paletas e temas escuro e claro',
            'Tokens generated in OKLCH, with 13 palettes and dark and light themes',
            'Tokens generados en OKLCH, con 13 paletas y temas oscuro y claro',
          ), '/fundamentos/cores'],
          ['novo', T(
            'Contraste WCAG verificado a cada build, nos dois temas',
            'WCAG contrast checked on every build, in both themes',
            'Contraste WCAG verificado en cada build, en los dos temas',
          ), '/fundamentos/cores'],
          ['novo', T(
            'Tipografia com Inter Tight, Inter e JetBrains Mono em 19 estilos',
            'Typography with Inter Tight, Inter, and JetBrains Mono in 19 styles',
            'Tipografía con Inter Tight, Inter y JetBrains Mono en 19 estilos',
          ), '/fundamentos/tipografia'],
          ['novo', T(
            'Biblioteca própria de ícones em grid de 24 px, traço 1,5',
            'Our own icon library on a 24 px grid, 1.5 stroke',
            'Biblioteca propia de íconos en una grilla de 24 px, trazo 1,5',
          ), '/fundamentos/icones'],
          ['novo', T(
            'Escalas de espaçamento, raio, elevação, movimento e layout',
            'Spacing, radius, elevation, motion, and layout scales',
            'Escalas de espaciado, radio, elevación, movimiento y layout',
          ), '/fundamentos/espacamento'],
        ],
      },
      {
        name: T('Componentes', 'Components', 'Componentes'),
        items: [
          ['novo', T(
            '16 componentes, cada um com playground, código, acessibilidade e tokens',
            '16 components, each with a playground, code, accessibility, and tokens',
            '16 componentes, cada uno con playground, código, accesibilidad y tokens',
          ), '/componentes/botao'],
          ['novo', T(
            'Modal, Abas, Tabela, Checkbox e radio e Switch',
            'Modal, Tabs, Table, Checkbox and radio, and Switch',
            'Modal, Pestañas, Tabla, Checkbox y radio, y Switch',
          ), '/componentes/modal'],
          ['novo', T(
            'Seleção com lista própria, busca e múltipla escolha',
            'Select with its own list, search, and multiple choice',
            'Selector con lista propia, búsqueda y selección múltiple',
          ), '/componentes/selecao'],
          ['melhoria', T(
            'Toast com tons, ação de desfazer e seis posições',
            'Toast with tones, an undo action, and six positions',
            'Toast con tonos, acción de deshacer y seis posiciones',
          ), '/componentes/toast'],
          ['melhoria', T(
            'Menu com grupos, separadores, atalhos e modo de ação',
            'Menu with groups, separators, shortcuts, and action mode',
            'Menú con grupos, separadores, atajos y modo de acción',
          ), '/componentes/menu'],
          ['melhoria', T(
            'Estados forçados com data-state para documentar e testar',
            'Forced states with data-state for documenting and testing',
            'Estados forzados con data-state para documentar y probar',
          ), '/componentes/botao'],
        ],
      },
      {
        name: T('App shell e documentação', 'App shell and docs', 'App shell y documentación'),
        items: [
          ['novo', T(
            'Sidebar recolhível (⌘B), gaveta no celular e busca ⌘K',
            'Collapsible sidebar (⌘B), mobile drawer, and ⌘K search',
            'Sidebar plegable (⌘B), panel deslizante en el móvil y búsqueda ⌘K',
          ), '/padroes/app-shell'],
          ['novo', T(
            'Páginas de documentação com navegação “nesta página”',
            'Documentation pages with “on this page” navigation',
            'Páginas de documentación con navegación “en esta página”',
          ), '/fundamentos/cores'],
          ['melhoria', T(
            'Visual plano: superfícies opacas, sem vidro, brilho ou blur',
            'Flat look: opaque surfaces, no glass, glow, or blur',
            'Estética plana: superficies opacas, sin vidrio, brillo ni blur',
          ), '/fundamentos/elevacao'],
          ['melhoria', T(
            'Logotipo só tipográfico',
            'Type-only logo',
            'Logotipo solo tipográfico',
          ), '/'],
        ],
      },
      {
        name: T('Correções', 'Fixes', 'Correcciones'),
        items: [
          ['correcao', T(
            'Trocar o tema duas vezes seguidas não ignora mais a segunda troca',
            'Switching the theme twice in a row no longer ignores the second switch',
            'Cambiar el tema dos veces seguidas ya no ignora el segundo cambio',
          ), '/fundamentos/cores'],
          ['correcao', T(
            'A busca de ícones encontra “calendário”',
            'Icon search finds “calendar”',
            'La búsqueda de íconos encuentra “calendario”',
          ), '/fundamentos/icones'],
          ['correcao', T(
            'Seções das páginas não repetem ids do app',
            'Page sections no longer repeat app ids',
            'Las secciones de las páginas ya no repiten ids de la app',
          ), '/fundamentos/layout'],
          ['correcao', T(
            'No celular, a trilha da topbar não cobre mais a busca',
            'On mobile, the topbar breadcrumb no longer covers the search',
            'En el móvil, la ruta de la topbar ya no cubre la búsqueda',
          ), '/'],
        ],
      },
    ],
  },
];

/** Os grupos no idioma atual: nome e texto de cada item. */
const localGroups = (groups) => groups.map((g) => ({ name: tr(g.name), items: g.items.map(([type, text, href]) => [type, tr(text), href]) }));

/** Cada campo traduzido vira um getter no idioma atual. */
function live(source) {
  const out = {};
  for (const [key, value] of Object.entries(source)) {
    const get = key === 'groups' ? () => localGroups(value) : () => tr(value);
    Object.defineProperty(out, key, { enumerable: true, get });
  }
  return out;
}

export const releases = RELEASES.map(live);

export const upcoming = [
  {
    version: '1.0',
    title: T('Estável', 'Stable', 'Estable'),
    status: T(['brand', 'Próximo'], ['brand', 'Next'], ['brand', 'Próximo']),
    text: T('API congelada e pronta para escalar.', 'A frozen API, ready to scale.', 'API congelada y lista para escalar.'),
    items: T(
      ['Pacote para instalar', 'Testes visuais com data-state', 'Compromisso de compatibilidade'],
      ['An installable package', 'Visual tests with data-state', 'A compatibility promise'],
      ['Paquete para instalar', 'Pruebas visuales con data-state', 'Compromiso de compatibilidad'],
    ),
  },
].map(live);

/** Tipos de mudança: o tom do badge e o rótulo (getter no idioma atual). */
export const TYPES = {
  novo: live({ tone: 'brand', label: T('Novo', 'New', 'Nuevo') }),
  melhoria: live({ tone: 'info', label: T('Melhoria', 'Improvement', 'Mejora') }),
  correcao: live({ tone: 'success', label: T('Correção', 'Fix', 'Corrección') }),
};
