/**
 * Histórico de versões do Órbita — fonte da página Novidades e do indicador da sidebar.
 * Tipos: 'novo' | 'melhoria' | 'correcao'.
 * Títulos e resumos em T(pt-BR, en, es): em `releases` e `upcoming` eles são getters no idioma atual.
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
        name: 'Figma',
        items: [
          ['novo', 'Modos na janela do plugin: Claro e Escuro, Só Escuro ou Só Claro. A escolha fica guardada no computador', '/recursos/figma'],
          ['melhoria', 'A “Page 1” vazia do arquivo novo vira uma página do Órbita: as 3 páginas cabem no plano gratuito', '/recursos/figma'],
          ['melhoria', 'Num arquivo gerado com um modo só, rodar de novo com Claro e Escuro acrescenta o outro modo e mantém os componentes e as instâncias', '/recursos/figma'],
          ['correcao', 'As recusas do plano gratuito (modos e páginas) viraram explicações em português, com o que fazer', '/recursos/figma'],
          ['melhoria', 'O teste do plugin simula o plano gratuito e a passagem para um plano pago', '/recursos/figma'],
        ],
      },
      {
        name: 'Site',
        items: [
          ['novo', 'Dourado na troca da cor da marca, ao lado de Pêssego, Violeta, Azul, Verde e Rosa', '/'],
          ['correcao', 'Com Dourado e Verde, os links do tema claro descem um tom e passam de 4,5:1', '/recursos/acessibilidade'],
          ['correcao', 'Com Dourado e Azul, a série de gráfico da mesma cor troca de lugar com a 1ª: nada se repete, e a ordem segue validada para daltonismo', '/graficos/visao-geral'],
          ['correcao', 'Na troca da cor da marca, a bolinha do Pêssego não imita mais a cor escolhida', '/'],
          ['correcao', 'Subir o servidor não regrava mais a data dos tokens quando nada mudou', '/recursos/tokens'],
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
        name: 'Figma',
        items: [
          ['novo', 'Blocos novos: Movimento, Layout, Código, Dispersão, Paleta de comandos, Barra de filtros e Formulário — 42 no total', '/recursos/figma'],
          ['novo', 'Gráficos: barras 100%, divergentes e funil, áreas empilhadas, heatmap em calendário e o número de destaque', '/graficos/barras'],
          ['novo', 'Estado vazio sem permissão, offline e carregando; anexo, sugestões e composer com anexo; seleção com busca; avatar quadrado e divisor', '/padroes/estados-vazios'],
          ['novo', 'O bloco de Cores mostra também as escalas sequencial, ordinal e divergente e as cores de apoio dos gráficos', '/fundamentos/cores'],
          ['correcao', 'Opacidade própria em cor de variável (véu do avatar, hover sutil, lavagens dos gráficos): o Figma a trocava pela da variável', '/recursos/figma'],
          ['correcao', 'Ícones numa camada só, com o traço em contorno: trocar o ícone mantém a cor e nunca deixa um ícone preenchido', '/fundamentos/icones'],
          ['correcao', 'Etiquetas do cabeçalho dentro da borda, anel de foco no tamanho real de cada campo e status do avatar aplicado', '/recursos/figma'],
          ['melhoria', 'O teste do plugin acusa conteúdo vazando da borda, opacidade perdida e ícone fora do formato', '/recursos/figma'],
        ],
      },
      {
        name: 'Tokens',
        items: [
          ['novo', 'As durações (duration.*) viram variáveis de Dimensões no Figma, em milissegundos — 59 dimensões', '/fundamentos/movimento'],
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
        name: 'Figma',
        items: [
          ['novo', 'Plugin “Órbita para Figma”: Plugins → Desenvolvimento → Importar plugin do manifesto', '/recursos/figma'],
          ['novo', '35 blocos com cabeçalho, matriz de variantes rotulada, exemplos e prévias Claro e Escuro — 42 conjuntos e 474 variantes', '/recursos/figma'],
          ['novo', 'Páginas de Fundamentos (cores nos dois modos, tipografia, espaço, raio, sombra) e de Ícones (126 componentes)', '/recursos/figma'],
          ['novo', 'Propriedades de componente: rótulo, ícone opcional e troca de ícone', '/recursos/figma'],
          ['melhoria', 'Rodar de novo atualiza sem duplicar: componentes mantêm o id e as instâncias continuam ligadas', '/recursos/figma'],
          ['novo', 'npm run figma e npm run figma:test — o teste roda o plugin numa imitação da API do Figma e gera uma prévia', '/recursos/figma'],
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
        name: 'Acessibilidade',
        items: [
          ['correcao', 'Campos, seleção, composer e switch ganharam o contorno border.field, que passa de 3:1 em todas as superfícies', '/componentes/campo-de-texto'],
          ['correcao', 'O switch desligado agora tem contorno visível em qualquer fundo', '/componentes/switch'],
          ['correcao', 'fg.subtle no tema claro passa de 4,5:1 (novo tom neutral.550); fg.muted desceu para neutral.650 para manter a hierarquia', '/fundamentos/cores'],
          ['melhoria', 'O build mede fg.subtle a 4,5:1 e border.field a 3:1 contra canvas, surface, raised e sunken', '/recursos/acessibilidade'],
          ['melhoria', 'Chips, botões e a busca da sidebar mantêm o contorno fino: o rótulo já identifica o controle', '/recursos/acessibilidade'],
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
        name: 'Recursos',
        items: [
          ['novo', 'Acessibilidade: verificador de contraste com qualquer par de tokens, nos dois temas, e o mapa de teclado de cada componente', '/recursos/acessibilidade'],
          ['novo', 'Pendências de acessibilidade calculadas ao vivo: contorno de campos e chips, switch desligado e texto apagado no tema claro', '/recursos/acessibilidade'],
          ['novo', 'Tokens para Figma: variáveis com modos Escuro e Claro, aliases, estilos de texto e sombra, no formato da API REST e num plugin local', '/recursos/tokens'],
          ['novo', 'Exportação em DTCG, JSON plano e CSS com npm run tokens:export', '/recursos/tokens'],
          ['novo', 'Como contribuir: do pedido à publicação, com modelo de proposta, “Isso é do design system?” e checklist de revisão', '/recursos/contribuir'],
        ],
      },
      {
        name: 'Componentes',
        items: [
          ['melhoria', 'Tooltip segue a WCAG 1.4.13: dá para passar o mouse por cima, fecha com Esc e não some enquanto você lê', '/recursos/acessibilidade'],
          ['melhoria', 'O Início lista os Recursos junto dos Padrões', '/'],
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
        name: 'Padrões',
        items: [
          ['novo', 'App shell com o app real embutido, em tamanho de desktop e de celular, sem mexer nas suas preferências', '/padroes/app-shell'],
          ['novo', 'Conversa e composer: mensagens, cartão de resultado, anexos e comandos com “/”', '/padroes/conversa'],
          ['novo', 'Formulários com validação na saída do campo, resumo de erros que leva a cada campo e ações fixas', '/padroes/formularios'],
          ['novo', 'Estados vazios para primeiro uso, sem resultados, erro, sem permissão, offline e carregando', '/padroes/estados-vazios'],
          ['novo', 'Busca e comandos: paleta ⌘K, barra de filtros com estado na URL e mapa de atalhos', '/padroes/busca'],
        ],
      },
      {
        name: 'Componentes e JavaScript',
        items: [
          ['novo', 'Alerta inline com tons, título, lista, ações e versão compacta (.ds-alert)', '/padroes/formularios'],
          ['novo', 'Composer e mensagens (.ds-composer, .ds-message, createComposer)', '/padroes/conversa'],
          ['novo', 'Validação de formulários a partir dos atributos nativos, em português (enhanceForm)', '/padroes/formularios'],
          ['novo', 'Barra de filtros com pílulas removíveis e contagem anunciada (createFilters)', '/padroes/busca'],
          ['melhoria', 'Estado vazio ganhou versões compacta, inline, sem borda, de erro e carregando', '/padroes/estados-vazios'],
          ['melhoria', 'App shell aceita modo de demonstração (persist: false) e avisa mudanças com ds:shellchange', '/padroes/app-shell'],
          ['melhoria', 'Paleta de comandos aceita várias instâncias e pode ser destruída', '/padroes/busca'],
          ['novo', '12 ícones novos: enviar, anexar, parar, gostei, teclado, comando, sem conexão e outros', '/fundamentos/icones'],
        ],
      },
      {
        name: 'Correções',
        items: [['correcao', 'Marcar o item ativo da sidebar não rola mais a página inteira junto', '/padroes/app-shell']],
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
        name: 'Gráficos',
        items: [
          ['novo', 'Sete páginas: visão geral, barras, linhas e áreas, rosca, heatmap, dispersão e indicadores', '/graficos/visao-geral'],
          ['novo', 'Paleta categórica de 8 cores em ordem fixa, validada para daltonismo e visão normal nos dois temas', '/graficos/visao-geral'],
          ['novo', 'Escalas sequencial, ordinal e divergente, grade e eixo como tokens color.chart.*', '/fundamentos/cores'],
          ['novo', 'Biblioteca em SVG puro: barChart, lineChart, donutChart, heatmap, calendarHeatmap e scatterChart', '/graficos/barras'],
          ['novo', 'Indicador, número de destaque, sparkline e medidor para quando o gráfico é um número', '/graficos/indicadores'],
          ['melhoria', 'Tooltip no hover e no teclado, legenda que esconde séries sem repintar as outras e vista em tabela', '/graficos/visao-geral'],
          ['melhoria', 'Textura opcional em 45° e 135° para daltonismo total, impressão e alto contraste', '/graficos/rosca'],
        ],
      },
      {
        name: 'Fundamentos e documentação',
        items: [
          ['novo', '10 ícones de gráfico, numa categoria própria', '/fundamentos/icones'],
          ['melhoria', 'Cores ganhou o grupo de tokens Gráficos', '/fundamentos/cores'],
          ['melhoria', 'O Início mostra os gráficos e o roadmap traz todas as versões', '/'],
        ],
      },
      {
        name: 'Correções',
        items: [['correcao', 'O Início não diz mais que os componentes estão “a caminho”', '/']],
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
        name: 'Fundamentos',
        items: [
          ['novo', 'Tokens gerados em OKLCH, com 13 paletas e temas escuro e claro', '/fundamentos/cores'],
          ['novo', 'Contraste WCAG verificado a cada build, nos dois temas', '/fundamentos/cores'],
          ['novo', 'Tipografia com Inter Tight, Inter e JetBrains Mono em 19 estilos', '/fundamentos/tipografia'],
          ['novo', 'Biblioteca própria de ícones em grid de 24 px, traço 1,5', '/fundamentos/icones'],
          ['novo', 'Escalas de espaçamento, raio, elevação, movimento e layout', '/fundamentos/espacamento'],
        ],
      },
      {
        name: 'Componentes',
        items: [
          ['novo', '16 componentes, cada um com playground, código, acessibilidade e tokens', '/componentes/botao'],
          ['novo', 'Modal, Abas, Tabela, Checkbox e radio e Switch', '/componentes/modal'],
          ['novo', 'Seleção com lista própria, busca e múltipla escolha', '/componentes/selecao'],
          ['melhoria', 'Toast com tons, ação de desfazer e seis posições', '/componentes/toast'],
          ['melhoria', 'Menu com grupos, separadores, atalhos e modo de ação', '/componentes/menu'],
          ['melhoria', 'Estados forçados com data-state para documentar e testar', '/componentes/botao'],
        ],
      },
      {
        name: 'App shell e documentação',
        items: [
          ['novo', 'Sidebar recolhível (⌘B), gaveta no celular e busca ⌘K', '/padroes/app-shell'],
          ['novo', 'Páginas de documentação com navegação “nesta página”', '/fundamentos/cores'],
          ['melhoria', 'Visual plano: superfícies opacas, sem vidro, brilho ou blur', '/fundamentos/elevacao'],
          ['melhoria', 'Logotipo só tipográfico', '/'],
        ],
      },
      {
        name: 'Correções',
        items: [
          ['correcao', 'Trocar o tema duas vezes seguidas não ignora mais a segunda troca', '/fundamentos/cores'],
          ['correcao', 'A busca de ícones encontra “calendário”', '/fundamentos/icones'],
          ['correcao', 'Seções das páginas não repetem ids do app', '/fundamentos/layout'],
          ['correcao', 'No celular, a trilha da topbar não cobre mais a busca', '/'],
        ],
      },
    ],
  },
];

/** Cada campo traduzido vira um getter no idioma atual (as listas de itens seguem como estão). */
function live(source) {
  const out = {};
  for (const [key, value] of Object.entries(source)) Object.defineProperty(out, key, { enumerable: true, get: () => tr(value) });
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

export const TYPES = {
  novo: ['brand', 'Novo'],
  melhoria: ['info', 'Melhoria'],
  correcao: ['success', 'Correção'],
};
