/**
 * Mapa do site — alimenta a sidebar, o roteador, o breadcrumb e a busca (⌘K).
 * Para criar uma página: adicione `load: () => import('./pages/arquivo.js')` ao item.
 * Itens sem `load` mostram a página "em construção" com os `topics` planejados.
 */

const COMPONENT_TOPICS = ['Anatomia', 'Variantes e tamanhos', 'Estados', 'Acessibilidade', 'Tokens usados', 'Código'];

export const navigation = [
  {
    id: 'main',
    items: [
      { label: 'Início', icon: 'home', path: '/', load: () => import('./pages/home.js'), description: 'Visão geral do Órbita Design System.' },
      { label: 'Primeiros passos', icon: 'zap', path: '/primeiros-passos', load: () => import('./pages/primeiros-passos.js'), description: 'Como instalar, importar os estilos e usar os tokens no seu projeto.' },
      { label: 'Novidades', icon: 'megaphone', path: '/novidades', load: () => import('./pages/novidades.js'), dot: true, description: 'Tudo o que mudou em cada versão.' },
    ],
  },
  {
    id: 'fundamentos',
    label: 'Fundamentos',
    items: [
      { label: 'Cores', icon: 'palette', path: '/fundamentos/cores', load: () => import('./pages/cores.js'), description: 'Paletas em OKLCH, tokens semânticos e temas escuro e claro.' },
      { label: 'Tipografia', icon: 'type', path: '/fundamentos/tipografia', load: () => import('./pages/tipografia.js'), description: 'Inter Tight para títulos, Inter para leitura e 19 estilos de texto.' },
      { label: 'Ícones', icon: 'shapes', path: '/fundamentos/icones', load: () => import('./pages/icones.js'), description: 'Biblioteca própria em grid de 24 px com traço de 1,5.' },
      { label: 'Espaçamento', icon: 'spacing', path: '/fundamentos/espacamento', load: () => import('./pages/espacamento.js'), description: 'Escala de 4 em 4 px para ritmo e alinhamento.' },
      { label: 'Raios', icon: 'radius', path: '/fundamentos/raios', load: () => import('./pages/raios.js'), description: 'Cantos generosos — do sutil à pílula.' },
      { label: 'Elevação', icon: 'elevation', path: '/fundamentos/elevacao', load: () => import('./pages/elevacao.js'), description: 'Camadas de superfície e sombras para dar hierarquia.' },
      { label: 'Movimento', icon: 'motion', path: '/fundamentos/movimento', load: () => import('./pages/movimento.js'), description: 'Durações e curvas para transições com propósito.' },
      { label: 'Layout', icon: 'layout', path: '/fundamentos/layout', load: () => import('./pages/layout.js'), description: 'Breakpoints, grid e dimensões do app shell.' },
    ],
  },
  {
    id: 'componentes',
    label: 'Componentes',
    items: [
      { label: 'Botão', icon: 'button', path: '/componentes/botao', load: () => import('./pages/botao.js'), description: 'Dispara uma ação. Primário, secundário, ghost, sutil e perigo.' },
      { label: 'Chip', icon: 'tag', path: '/componentes/chip', load: () => import('./pages/chip.js'), description: 'Pílula para filtrar, escolher e mostrar seleções.' },
      { label: 'Menu', icon: 'list', path: '/componentes/menu', load: () => import('./pages/menu.js'), description: 'Lista que abre de um gatilho, para escolher um valor ou disparar ações.' },
      { label: 'Painel', icon: 'card', path: '/componentes/painel', load: () => import('./pages/painel.js'), description: 'A superfície de uma tarefa: rótulo, título, controles e seções.' },
      { label: 'Ação inline', icon: 'plus', path: '/componentes/acao-inline', load: () => import('./pages/acao-inline.js'), description: 'A ação mais discreta: dentro do conteúdo, com + ou →.' },
      { label: 'Campo de texto', icon: 'input', path: '/componentes/campo-de-texto', load: () => import('./pages/campo-de-texto.js'), description: 'Rótulo, dica, erro e contador — em linha única ou multilinha.' },
      { label: 'Seleção', icon: 'chevrons-up-down', path: '/componentes/selecao', load: () => import('./pages/selecao.js'), description: 'Única, com busca ou múltipla — lista no visual dos menus, select real por baixo.' },
      { label: 'Checkbox e radio', icon: 'check-square', path: '/componentes/checkbox-radio', load: () => import('./pages/checkbox-radio.js'), description: 'Várias escolhas ou uma só, com grupos e estado indeterminado.' },
      { label: 'Switch', icon: 'toggle', path: '/componentes/switch', load: () => import('./pages/switch.js'), description: 'Liga e desliga com efeito imediato.' },
      { label: 'Badge', icon: 'flag', path: '/componentes/badge', load: () => import('./pages/badge.js'), description: 'Rótulo curto de status ou contagem — nunca enfeite.' },
      { label: 'Avatar', icon: 'user-circle', path: '/componentes/avatar', load: () => import('./pages/avatar.js'), description: 'Pessoa ou conta: foto, iniciais num tom estável, status e grupo.' },
      { label: 'Abas', icon: 'tabs', path: '/componentes/abas', load: () => import('./pages/abas.js'), description: 'Alternam vistas do mesmo assunto. Sublinhada ou segmentada.' },
      { label: 'Tooltip', icon: 'tooltip', path: '/componentes/tooltip', load: () => import('./pages/tooltip.js'), description: 'Dica curta no hover e no foco — nomeia ícones e ensina atalhos.' },
      { label: 'Modal', icon: 'dialog', path: '/componentes/modal', load: () => import('./pages/modal.js'), description: 'Interrompe para uma decisão ou tarefa curta, com confirmação destrutiva.' },
      { label: 'Toast', icon: 'message-square', path: '/componentes/toast', load: () => import('./pages/toast.js'), description: 'Confirma o que aconteceu sem interromper; tons, desfazer e seis posições.' },
      { label: 'Tabela', icon: 'table', path: '/componentes/tabela', load: () => import('./pages/tabela.js'), description: 'Dados em linhas e colunas, com ordenação e seleção.' },
    ].map((item) => ({ ...item, topics: COMPONENT_TOPICS })),
  },
  {
    id: 'graficos',
    label: 'Gráficos',
    items: [
      { label: 'Visão geral', icon: 'dashboard', path: '/graficos/visao-geral', load: () => import('./pages/graficos-visao-geral.js'), description: 'Qual gráfico usar, cores validadas para daltonismo, anatomia, interação e acessibilidade.' },
      { label: 'Barras', icon: 'bar-chart', path: '/graficos/barras', load: () => import('./pages/graficos-barras.js'), description: 'Colunas e barras horizontais: agrupadas, empilhadas, 100%, divergentes e funil.' },
      { label: 'Linhas e áreas', icon: 'line-chart', path: '/graficos/linhas', load: () => import('./pages/graficos-linhas.js'), description: 'Tendência no tempo, com mira, rótulos no fim da linha, meta e áreas empilhadas.' },
      { label: 'Rosca', icon: 'donut', path: '/graficos/rosca', load: () => import('./pages/graficos-rosca.js'), description: 'Parte do todo de relance, com até 6 fatias e o total no miolo.' },
      { label: 'Heatmap', icon: 'heatmap', path: '/graficos/heatmap', load: () => import('./pages/graficos-heatmap.js'), description: 'Intensidade numa grade ou num calendário, em escala sequencial ou divergente.' },
      { label: 'Dispersão', icon: 'scatter', path: '/graficos/dispersao', load: () => import('./pages/graficos-dispersao.js'), description: 'Relação entre duas medidas, com bolhas, referências e rótulos seletivos.' },
      { label: 'Indicadores', icon: 'gauge', path: '/graficos/indicadores', load: () => import('./pages/graficos-indicadores.js'), description: 'Quando o gráfico é um número: indicador, número de destaque, sparkline e medidor.' },
    ],
  },
  {
    id: 'padroes',
    label: 'Padrões',
    items: [
      { label: 'App shell', icon: 'app-shell', path: '/padroes/app-shell', load: () => import('./pages/padroes-app-shell.js'), description: 'Sidebar flutuante, painel principal, topbar e busca ⌘K.', topics: ['Anatomia', 'Recolhido e expandido', 'Mobile', 'Atalhos'] },
      { label: 'Conversa e composer', icon: 'message-square', path: '/padroes/conversa', load: () => import('./pages/padroes-conversa.js'), description: 'Balões, respostas, anexos e a caixa de mensagem.', topics: ['Balões', 'Cartão de resultado', 'Composer', 'Atalhos com /'] },
      { label: 'Formulários', icon: 'file-text', path: '/padroes/formularios', load: () => import('./pages/padroes-formularios.js'), description: 'Campos, validação e mensagens de erro que ajudam a seguir.', topics: ['Layout', 'Validação', 'Mensagens de erro'] },
      { label: 'Estados vazios', icon: 'inbox', path: '/padroes/estados-vazios', load: () => import('./pages/padroes-estados-vazios.js'), description: 'Primeiro uso, sem resultados e erro — sempre com um próximo passo.', topics: ['Primeiro uso', 'Sem resultados', 'Erro'] },
      { label: 'Busca e comandos', icon: 'search', path: '/padroes/busca', load: () => import('./pages/padroes-busca.js'), description: 'Paleta ⌘K, filtros e atalhos de teclado.', topics: ['Paleta de comandos', 'Filtros', 'Atalhos de teclado'] },
    ],
  },
  {
    id: 'recursos',
    label: 'Recursos',
    items: [
      { label: 'Acessibilidade', icon: 'accessibility', path: '/recursos/acessibilidade', load: () => import('./pages/recursos-acessibilidade.js'), description: 'Diretrizes para produtos que todo mundo consegue usar.', topics: ['Contraste', 'Foco e teclado', 'Leitores de tela', 'Movimento'] },
      { label: 'Tokens para Figma', icon: 'download', path: '/recursos/tokens', load: () => import('./pages/recursos-tokens.js'), description: 'Exportação dos tokens para Figma e outras ferramentas.', topics: ['Formato', 'Variáveis do Figma', 'Sincronização'] },
      { label: 'Plugin do Figma', icon: 'component', path: '/recursos/figma', load: () => import('./pages/recursos-figma.js'), description: 'Os componentes dentro do Figma, em blocos de documentação, sem redesenhar.', topics: ['Instalar', 'Blocos', 'Rodar de novo'] },
      { label: 'Como contribuir', icon: 'git-pull-request', path: '/recursos/contribuir', load: () => import('./pages/recursos-contribuir.js'), description: 'Processo para propor e evoluir componentes.', topics: ['Propor', 'Revisar', 'Publicar'] },
    ],
  },
];

export const pages = navigation.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    group: group.label,
    groupId: group.id,
    description: item.description ?? `Documentação do componente ${item.label.toLowerCase()}.`,
  })),
);

export const findPage = (path) => pages.find((p) => p.path === path);
