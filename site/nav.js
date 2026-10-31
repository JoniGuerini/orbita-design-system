/**
 * Mapa do site — alimenta a sidebar, o roteador, o breadcrumb e a busca (⌘K).
 * Para criar uma página: adicione `load: () => import('./pages/arquivo.js')` ao item.
 * Itens sem `load` mostram a página "em construção" com os `topics` planejados.
 *
 * Textos em T(pt-BR, en, es). Em `navigation` e `pages`, label, description, group e topics são getters:
 * devolvem sempre o idioma atual (os caminhos ficam em português, como ids estáveis).
 */
import { tr } from '../ds/js/i18n.js';

const T = (pt, en, es) => ({ 'pt-BR': pt, en, es });

const COMPONENT_TOPICS = T(
  ['Anatomia', 'Variantes e tamanhos', 'Estados', 'Acessibilidade', 'Tokens usados', 'Código'],
  ['Anatomy', 'Variants and sizes', 'States', 'Accessibility', 'Tokens used', 'Code'],
  ['Anatomía', 'Variantes y tamaños', 'Estados', 'Accesibilidad', 'Tokens usados', 'Código'],
);

const RAW = [
  {
    id: 'main',
    items: [
      { label: T('Início', 'Home', 'Inicio'), icon: 'home', path: '/', load: () => import('./pages/home.js'), description: T('Visão geral do Órbita Design System.', 'An overview of the Órbita Design System.', 'Visión general del Órbita Design System.') },
      { label: T('Primeiros passos', 'Getting started', 'Primeros pasos'), icon: 'zap', path: '/primeiros-passos', load: () => import('./pages/primeiros-passos.js'), description: T('Como instalar, importar os estilos e usar os tokens no seu projeto.', 'How to install, import the styles, and use the tokens in your project.', 'Cómo instalar, importar los estilos y usar los tokens en tu proyecto.') },
      { label: T('Novidades', 'What’s new', 'Novedades'), icon: 'megaphone', path: '/novidades', load: () => import('./pages/novidades.js'), dot: true, description: T('Tudo o que mudou em cada versão.', 'Everything that changed in each version.', 'Todo lo que cambió en cada versión.') },
    ],
  },
  {
    id: 'fundamentos',
    label: T('Fundamentos', 'Foundations', 'Fundamentos'),
    items: [
      { label: T('Cores', 'Color', 'Color'), icon: 'palette', path: '/fundamentos/cores', load: () => import('./pages/cores.js'), description: T('Paletas em OKLCH, tokens semânticos e temas escuro e claro.', 'OKLCH palettes, semantic tokens, and dark and light themes.', 'Paletas en OKLCH, tokens semánticos y temas oscuro y claro.') },
      { label: T('Tipografia', 'Typography', 'Tipografía'), icon: 'type', path: '/fundamentos/tipografia', load: () => import('./pages/tipografia.js'), description: T('Inter Tight para títulos, Inter para leitura e 19 estilos de texto.', 'Inter Tight for headings, Inter for reading, and 19 text styles.', 'Inter Tight para títulos, Inter para lectura y 19 estilos de texto.') },
      { label: T('Ícones', 'Icons', 'Íconos'), icon: 'shapes', path: '/fundamentos/icones', load: () => import('./pages/icones.js'), description: T('Biblioteca própria em grid de 24 px com traço de 1,5.', 'A custom library on a 24 px grid with a 1.5 stroke.', 'Biblioteca propia en una cuadrícula de 24 px con trazo de 1,5.') },
      { label: T('Espaçamento', 'Spacing', 'Espaciado'), icon: 'spacing', path: '/fundamentos/espacamento', load: () => import('./pages/espacamento.js'), description: T('Escala de 4 em 4 px para ritmo e alinhamento.', 'A 4 px scale for rhythm and alignment.', 'Escala de 4 en 4 px para ritmo y alineación.') },
      { label: T('Raios', 'Radius', 'Radios'), icon: 'radius', path: '/fundamentos/raios', load: () => import('./pages/raios.js'), description: T('Cantos generosos — do sutil à pílula.', 'Generous corners — from subtle to pill.', 'Esquinas generosas — de sutil a píldora.') },
      { label: T('Elevação', 'Elevation', 'Elevación'), icon: 'elevation', path: '/fundamentos/elevacao', load: () => import('./pages/elevacao.js'), description: T('Camadas de superfície e sombras para dar hierarquia.', 'Surface layers and shadows that create hierarchy.', 'Capas de superficie y sombras para dar jerarquía.') },
      { label: T('Movimento', 'Motion', 'Movimiento'), icon: 'motion', path: '/fundamentos/movimento', load: () => import('./pages/movimento.js'), description: T('Durações e curvas para transições com propósito.', 'Durations and curves for purposeful transitions.', 'Duraciones y curvas para transiciones con propósito.') },
      { label: T('Layout', 'Layout', 'Layout'), icon: 'layout', path: '/fundamentos/layout', load: () => import('./pages/layout.js'), description: T('Breakpoints, grid e dimensões do app shell.', 'Breakpoints, grid, and app shell dimensions.', 'Breakpoints, cuadrícula y dimensiones del app shell.') },
    ],
  },
  {
    id: 'componentes',
    label: T('Componentes', 'Components', 'Componentes'),
    items: [
      { label: T('Botão', 'Button', 'Botón'), icon: 'button', path: '/componentes/botao', load: () => import('./pages/botao.js'), description: T('Dispara uma ação. Primário, secundário, ghost, sutil e perigo.', 'Triggers an action. Primary, secondary, ghost, subtle, and danger.', 'Dispara una acción. Primario, secundario, ghost, sutil y peligro.') },
      { label: T('Chip', 'Chip', 'Chip'), icon: 'tag', path: '/componentes/chip', load: () => import('./pages/chip.js'), description: T('Pílula para filtrar, escolher e mostrar seleções.', 'A pill to filter, choose, and show selections.', 'Píldora para filtrar, elegir y mostrar selecciones.') },
      { label: T('Menu', 'Menu', 'Menú'), icon: 'list', path: '/componentes/menu', load: () => import('./pages/menu.js'), description: T('Lista que abre de um gatilho, para escolher um valor ou disparar ações.', 'A list that opens from a trigger, to pick a value or run actions.', 'Lista que se abre desde un disparador, para elegir un valor o ejecutar acciones.') },
      { label: T('Painel', 'Panel', 'Panel'), icon: 'card', path: '/componentes/painel', load: () => import('./pages/painel.js'), description: T('A superfície de uma tarefa: rótulo, título, controles e seções.', 'The surface of a task: label, title, controls, and sections.', 'La superficie de una tarea: etiqueta, título, controles y secciones.') },
      { label: T('Ação inline', 'Inline action', 'Acción en línea'), icon: 'plus', path: '/componentes/acao-inline', load: () => import('./pages/acao-inline.js'), description: T('A ação mais discreta: dentro do conteúdo, com + ou →.', 'The quietest action: inside the content, with + or →.', 'La acción más discreta: dentro del contenido, con + o →.') },
      { label: T('Campo de texto', 'Text field', 'Campo de texto'), icon: 'input', path: '/componentes/campo-de-texto', load: () => import('./pages/campo-de-texto.js'), description: T('Rótulo, dica, erro e contador — em linha única ou multilinha.', 'Label, hint, error, and counter — single line or multiline.', 'Etiqueta, pista, error y contador — en una línea o en varias.') },
      { label: T('Seleção', 'Select', 'Selector'), icon: 'chevrons-up-down', path: '/componentes/selecao', load: () => import('./pages/selecao.js'), description: T('Única, com busca ou múltipla — lista no visual dos menus, select real por baixo.', 'Single, searchable, or multiple — a list that looks like a menu, with a real select underneath.', 'Única, con búsqueda o múltiple — lista con el estilo de los menús y un select real debajo.') },
      { label: T('Checkbox e radio', 'Checkbox and radio', 'Checkbox y radio'), icon: 'check-square', path: '/componentes/checkbox-radio', load: () => import('./pages/checkbox-radio.js'), description: T('Várias escolhas ou uma só, com grupos e estado indeterminado.', 'Many choices or just one, with groups and an indeterminate state.', 'Varias opciones o una sola, con grupos y estado indeterminado.') },
      { label: T('Switch', 'Switch', 'Switch'), icon: 'toggle', path: '/componentes/switch', load: () => import('./pages/switch.js'), description: T('Liga e desliga com efeito imediato.', 'Turns something on or off, right away.', 'Enciende y apaga con efecto inmediato.') },
      { label: T('Badge', 'Badge', 'Badge'), icon: 'flag', path: '/componentes/badge', load: () => import('./pages/badge.js'), description: T('Rótulo curto de status ou contagem — nunca enfeite.', 'A short status or count label — never decoration.', 'Etiqueta corta de estado o conteo — nunca adorno.') },
      { label: T('Avatar', 'Avatar', 'Avatar'), icon: 'user-circle', path: '/componentes/avatar', load: () => import('./pages/avatar.js'), description: T('Pessoa ou conta: foto, iniciais num tom estável, status e grupo.', 'A person or account: photo, initials in a stable tone, status, and group.', 'Persona o cuenta: foto, iniciales en un tono estable, estado y grupo.') },
      { label: T('Abas', 'Tabs', 'Pestañas'), icon: 'tabs', path: '/componentes/abas', load: () => import('./pages/abas.js'), description: T('Alternam vistas do mesmo assunto. Sublinhada ou segmentada.', 'Switch between views of the same subject. Underlined or segmented.', 'Alternan vistas del mismo tema. Subrayadas o segmentadas.') },
      { label: T('Tooltip', 'Tooltip', 'Tooltip'), icon: 'tooltip', path: '/componentes/tooltip', load: () => import('./pages/tooltip.js'), description: T('Dica curta no hover e no foco — nomeia ícones e ensina atalhos.', 'A short hint on hover and focus — names icons and teaches shortcuts.', 'Pista corta al pasar el cursor y al enfocar — nombra íconos y enseña atajos.') },
      { label: T('Modal', 'Modal', 'Modal'), icon: 'dialog', path: '/componentes/modal', load: () => import('./pages/modal.js'), description: T('Interrompe para uma decisão ou tarefa curta, com confirmação destrutiva.', 'Interrupts for a decision or short task, with destructive confirmation.', 'Interrumpe para una decisión o tarea corta, con confirmación destructiva.') },
      { label: T('Toast', 'Toast', 'Toast'), icon: 'message-square', path: '/componentes/toast', load: () => import('./pages/toast.js'), description: T('Confirma o que aconteceu sem interromper; tons, desfazer e seis posições.', 'Confirms what happened without interrupting; tones, undo, and six positions.', 'Confirma lo que pasó sin interrumpir; tonos, deshacer y seis posiciones.') },
      { label: T('Tabela', 'Table', 'Tabla'), icon: 'table', path: '/componentes/tabela', load: () => import('./pages/tabela.js'), description: T('Dados em linhas e colunas, com ordenação e seleção.', 'Data in rows and columns, with sorting and selection.', 'Datos en filas y columnas, con orden y selección.') },
    ].map((item) => ({ ...item, topics: COMPONENT_TOPICS })),
  },
  {
    id: 'graficos',
    label: T('Gráficos', 'Charts', 'Gráficos'),
    items: [
      { label: T('Visão geral', 'Overview', 'Visión general'), icon: 'dashboard', path: '/graficos/visao-geral', load: () => import('./pages/graficos-visao-geral.js'), description: T('Qual gráfico usar, cores validadas para daltonismo, anatomia, interação e acessibilidade.', 'Which chart to use, colorblind-safe colors, anatomy, interaction, and accessibility.', 'Qué gráfico usar, colores validados para daltonismo, anatomía, interacción y accesibilidad.') },
      { label: T('Barras', 'Bars', 'Barras'), icon: 'bar-chart', path: '/graficos/barras', load: () => import('./pages/graficos-barras.js'), description: T('Colunas e barras horizontais: agrupadas, empilhadas, 100%, divergentes e funil.', 'Columns and horizontal bars: grouped, stacked, 100%, diverging, and funnel.', 'Columnas y barras horizontales: agrupadas, apiladas, 100%, divergentes y embudo.') },
      { label: T('Linhas e áreas', 'Lines and areas', 'Líneas y áreas'), icon: 'line-chart', path: '/graficos/linhas', load: () => import('./pages/graficos-linhas.js'), description: T('Tendência no tempo, com mira, rótulos no fim da linha, meta e áreas empilhadas.', 'Trends over time, with a crosshair, end-of-line labels, goals, and stacked areas.', 'Tendencia en el tiempo, con mira, etiquetas al final de la línea, meta y áreas apiladas.') },
      { label: T('Rosca', 'Donut', 'Dona'), icon: 'donut', path: '/graficos/rosca', load: () => import('./pages/graficos-rosca.js'), description: T('Parte do todo de relance, com até 6 fatias e o total no miolo.', 'Part of a whole at a glance, with up to 6 slices and the total in the middle.', 'Parte del todo de un vistazo, con hasta 6 porciones y el total en el centro.') },
      { label: T('Heatmap', 'Heatmap', 'Mapa de calor'), icon: 'heatmap', path: '/graficos/heatmap', load: () => import('./pages/graficos-heatmap.js'), description: T('Intensidade numa grade ou num calendário, em escala sequencial ou divergente.', 'Intensity on a grid or a calendar, on a sequential or diverging scale.', 'Intensidad en una cuadrícula o un calendario, en escala secuencial o divergente.') },
      { label: T('Dispersão', 'Scatter', 'Dispersión'), icon: 'scatter', path: '/graficos/dispersao', load: () => import('./pages/graficos-dispersao.js'), description: T('Relação entre duas medidas, com bolhas, referências e rótulos seletivos.', 'The relationship between two measures, with bubbles, reference lines, and selective labels.', 'Relación entre dos medidas, con burbujas, referencias y etiquetas selectivas.') },
      { label: T('Indicadores', 'Indicators', 'Indicadores'), icon: 'gauge', path: '/graficos/indicadores', load: () => import('./pages/graficos-indicadores.js'), description: T('Quando o gráfico é um número: indicador, número de destaque, sparkline e medidor.', 'When the chart is a number: stat, hero number, sparkline, and meter.', 'Cuando el gráfico es un número: indicador, número destacado, sparkline y medidor.') },
    ],
  },
  {
    id: 'padroes',
    label: T('Padrões', 'Patterns', 'Patrones'),
    items: [
      { label: T('App shell', 'App shell', 'App shell'), icon: 'app-shell', path: '/padroes/app-shell', load: () => import('./pages/padroes-app-shell.js'), description: T('Sidebar flutuante, painel principal, topbar e busca ⌘K.', 'Floating sidebar, main panel, top bar, and ⌘K search.', 'Sidebar flotante, panel principal, barra superior y búsqueda ⌘K.'), topics: T(['Anatomia', 'Recolhido e expandido', 'Mobile', 'Atalhos'], ['Anatomy', 'Collapsed and expanded', 'Mobile', 'Shortcuts'], ['Anatomía', 'Contraído y expandido', 'Móvil', 'Atajos']) },
      { label: T('Conversa e composer', 'Chat and composer', 'Conversación y composer'), icon: 'message-square', path: '/padroes/conversa', load: () => import('./pages/padroes-conversa.js'), description: T('Balões, respostas, anexos e a caixa de mensagem.', 'Bubbles, responses, attachments, and the message box.', 'Burbujas, respuestas, adjuntos y la caja de mensaje.'), topics: T(['Balões', 'Cartão de resultado', 'Composer', 'Atalhos com /'], ['Bubbles', 'Result card', 'Composer', '/ shortcuts'], ['Burbujas', 'Tarjeta de resultado', 'Composer', 'Atajos con /']) },
      { label: T('Formulários', 'Forms', 'Formularios'), icon: 'file-text', path: '/padroes/formularios', load: () => import('./pages/padroes-formularios.js'), description: T('Campos, validação e mensagens de erro que ajudam a seguir.', 'Fields, validation, and error messages that help people move on.', 'Campos, validación y mensajes de error que ayudan a seguir.'), topics: T(['Layout', 'Validação', 'Mensagens de erro'], ['Layout', 'Validation', 'Error messages'], ['Layout', 'Validación', 'Mensajes de error']) },
      { label: T('Estados vazios', 'Empty states', 'Estados vacíos'), icon: 'inbox', path: '/padroes/estados-vazios', load: () => import('./pages/padroes-estados-vazios.js'), description: T('Primeiro uso, sem resultados e erro — sempre com um próximo passo.', 'First use, no results, and errors — always with a next step.', 'Primer uso, sin resultados y error — siempre con un siguiente paso.'), topics: T(['Primeiro uso', 'Sem resultados', 'Erro'], ['First use', 'No results', 'Error'], ['Primer uso', 'Sin resultados', 'Error']) },
      { label: T('Busca e comandos', 'Search and commands', 'Búsqueda y comandos'), icon: 'search', path: '/padroes/busca', load: () => import('./pages/padroes-busca.js'), description: T('Paleta ⌘K, filtros e atalhos de teclado.', '⌘K palette, filters, and keyboard shortcuts.', 'Paleta ⌘K, filtros y atajos de teclado.'), topics: T(['Paleta de comandos', 'Filtros', 'Atalhos de teclado'], ['Command palette', 'Filters', 'Keyboard shortcuts'], ['Paleta de comandos', 'Filtros', 'Atajos de teclado']) },
    ],
  },
  {
    id: 'recursos',
    label: T('Recursos', 'Resources', 'Recursos'),
    items: [
      { label: T('Acessibilidade', 'Accessibility', 'Accesibilidad'), icon: 'accessibility', path: '/recursos/acessibilidade', load: () => import('./pages/recursos-acessibilidade.js'), description: T('Diretrizes para produtos que todo mundo consegue usar.', 'Guidelines for products everyone can use.', 'Pautas para productos que todo el mundo puede usar.'), topics: T(['Contraste', 'Foco e teclado', 'Leitores de tela', 'Movimento'], ['Contrast', 'Focus and keyboard', 'Screen readers', 'Motion'], ['Contraste', 'Foco y teclado', 'Lectores de pantalla', 'Movimiento']) },
      { label: T('Tokens para Figma', 'Tokens for Figma', 'Tokens para Figma'), icon: 'download', path: '/recursos/tokens', load: () => import('./pages/recursos-tokens.js'), description: T('Exportação dos tokens para Figma e outras ferramentas.', 'Token export for Figma and other tools.', 'Exportación de los tokens para Figma y otras herramientas.'), topics: T(['Formato', 'Variáveis do Figma', 'Sincronização'], ['Format', 'Figma variables', 'Sync'], ['Formato', 'Variables de Figma', 'Sincronización']) },
      { label: T('Plugin do Figma', 'Figma plugin', 'Plugin de Figma'), icon: 'component', path: '/recursos/figma', load: () => import('./pages/recursos-figma.js'), description: T('Os componentes dentro do Figma, em blocos de documentação, sem redesenhar.', 'The components inside Figma, in documentation blocks, without redrawing.', 'Los componentes dentro de Figma, en bloques de documentación, sin redibujar.'), topics: T(['Instalar', 'Blocos', 'Rodar de novo'], ['Install', 'Blocks', 'Run again'], ['Instalar', 'Bloques', 'Ejecutar de nuevo']) },
      { label: T('Como contribuir', 'How to contribute', 'Cómo contribuir'), icon: 'git-pull-request', path: '/recursos/contribuir', load: () => import('./pages/recursos-contribuir.js'), description: T('Processo para propor e evoluir componentes.', 'How to propose and evolve components.', 'Proceso para proponer y evolucionar componentes.'), topics: T(['Propor', 'Revisar', 'Publicar'], ['Propose', 'Review', 'Publish'], ['Proponer', 'Revisar', 'Publicar']) },
    ],
  },
];

/** Cada campo vira um getter que devolve o idioma atual (tr deixa caminhos, ícones e funções como estão). */
function live(source) {
  const out = {};
  for (const [key, value] of Object.entries(source)) Object.defineProperty(out, key, { enumerable: true, get: () => tr(value) });
  return out;
}

export const navigation = RAW.map(({ items, ...group }) => Object.assign(live(group), { items: items.map(live) }));

export const pages = RAW.flatMap((group) => group.items.map((item) => live({ ...item, group: group.label, groupId: group.id })));

export const findPage = (path) => pages.find((p) => p.path === path);
