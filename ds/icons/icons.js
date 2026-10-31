/**
 * Órbita — biblioteca de ícones
 *
 * Grid de 24×24, traço 1,5 (1,75 em tamanhos ≤ 16 px), pontas e junções arredondadas,
 * área útil de 2 px de respiro. Todos usam currentColor.
 *
 * Uso em JS:   icon('home', { size: 20 })            → string <svg>
 * Uso em HTML: <ds-icon name="home" size="20"></ds-icon>
 */

const path = (d) => `<path d="${d}"/>`;
const circle = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const rect = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const dot = (cx, cy) => `<path d="M${cx} ${cy}h.01"/>`;
const fillDot = (cx, cy, r = 1.1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;

/** Engrenagem gerada por geometria polar, para dentes perfeitamente simétricos. */
function gear({ teeth = 8, rOut = 9.5, rIn = 7.4, half = 9, base = 15 } = {}) {
  const pt = (r, deg) => {
    const a = (deg * Math.PI) / 180;
    return `${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`;
  };
  const step = 360 / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step - 90;
    d += `${i === 0 ? 'M' : 'L'}${pt(rIn, a - base)} L${pt(rOut, a - half)} A${rOut} ${rOut} 0 0 1 ${pt(rOut, a + half)} L${pt(rIn, a + base)} A${rIn} ${rIn} 0 0 1 ${pt(rIn, a + step - base)} `;
  }
  return `${path(`${d.trim()}Z`)}${circle(12, 12, 3)}`;
}

// [nome, categoria, palavras-chave, conteúdo SVG]
const DEFINITIONS = [
  // Navegação
  ['home', 'navegacao', 'casa início inicial', path('M3.5 10.5 12 3.5l8.5 7') + path('M5.5 9v10.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9')],
  ['menu', 'navegacao', 'hambúrguer navegação lista', path('M4 7h16M4 12h16M4 17h16')],
  ['panel-left', 'navegacao', 'sidebar barra lateral recolher', rect(3.5, 4.5, 17, 15, 3) + path('M9.5 4.5v15')],
  ['chevron-down', 'navegacao', 'seta baixo expandir', path('m6 9 6 6 6-6')],
  ['chevron-up', 'navegacao', 'seta cima recolher', path('m6 15 6-6 6 6')],
  ['chevron-left', 'navegacao', 'seta esquerda voltar', path('m15 6-6 6 6 6')],
  ['chevron-right', 'navegacao', 'seta direita avançar', path('m9 6 6 6-6 6')],
  ['chevrons-up-down', 'navegacao', 'select seletor ordenar', path('m8 9 4-4 4 4M8 15l4 4 4-4')],
  ['arrow-right', 'navegacao', 'seta próximo', path('M5 12h14M13 6l6 6-6 6')],
  ['arrow-left', 'navegacao', 'seta anterior voltar', path('M19 12H5M11 6l-6 6 6 6')],
  ['arrow-up', 'navegacao', 'seta enviar topo', path('M12 19V5M6 11l6-6 6 6')],
  ['arrow-up-right', 'navegacao', 'diagonal abrir link', path('M7 17 17 7M8 7h9v9')],
  ['arrow-down', 'navegacao', 'seta baixo descer', path('M12 5v14M18 13l-6 6-6-6')],
  ['external-link', 'navegacao', 'link externo abrir nova aba', path('M14 4h6v6M20 4l-9 9') + path('M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10')],
  ['corner-down-left', 'navegacao', 'enter confirmar retornar', path('M20 5v7a3 3 0 0 1-3 3H5M9 11l-4 4 4 4')],
  ['log-out', 'navegacao', 'sair desconectar', path('M9.5 20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h3.5M15.5 16.5 20 12l-4.5-4.5M20 12H9.5')],
  ['compass', 'navegacao', 'explorar bússola descobrir', circle(12, 12, 8.5) + path('m15.5 8.5-2 5-5 2 2-5z')],

  // Ações
  ['search', 'acoes', 'buscar procurar lupa', circle(11, 11, 6.5) + path('m20 20-4.2-4.2')],
  ['search-x', 'acoes', 'sem resultados busca vazia nada encontrado', circle(11, 11, 6.5) + path('m20 20-4.2-4.2M8.8 8.8l4.4 4.4M13.2 8.8l-4.4 4.4')],
  ['send', 'acoes', 'enviar mensagem avião', path('M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z')],
  ['paperclip', 'acoes', 'anexar arquivo clipe anexo', path('m20 11.5-7.8 7.8a5 5 0 0 1-7-7l8.4-8.4a3.3 3.3 0 0 1 4.7 4.7l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6')],
  ['stop-circle', 'acoes', 'parar interromper gerar', circle(12, 12, 8.5) + rect(9, 9, 6, 6, 1.5)],
  ['thumbs-up', 'acoes', 'gostei útil positivo avaliar', path('M7.5 10.5v9.5H5a1.5 1.5 0 0 1-1.5-1.5V12A1.5 1.5 0 0 1 5 10.5zM7.5 10.5 11 3.5a2.5 2.5 0 0 1 2.5 2.5v3.5h5a2 2 0 0 1 2 2.3l-1.2 6.5a2 2 0 0 1-2 1.7H7.5')],
  ['thumbs-down', 'acoes', 'não gostei negativo avaliar', path('M16.5 13.5V4H19a1.5 1.5 0 0 1 1.5 1.5V12a1.5 1.5 0 0 1-1.5 1.5zM16.5 13.5 13 20.5a2.5 2.5 0 0 1-2.5-2.5v-3.5h-5a2 2 0 0 1-2-2.3l1.2-6.5a2 2 0 0 1 2-1.7h9.8')],
  ['at-sign', 'acoes', 'arroba mencionar email', circle(12, 12, 3.5) + path('M15.5 8.5v4.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8')],
  ['plus', 'acoes', 'adicionar novo criar mais', path('M12 5v14M5 12h14')],
  ['minus', 'acoes', 'remover menos', path('M5 12h14')],
  ['x', 'acoes', 'fechar cancelar remover', path('M6 6l12 12M18 6 6 18')],
  ['check', 'acoes', 'confirmar ok concluído', path('m5 12.5 4.5 4.5L19 7.5')],
  ['pencil', 'acoes', 'editar criar escrever lápis', path('M16 4.5a2.12 2.12 0 0 1 3 3L8 18.5l-4 1 1-4z') + path('m14 6.5 3 3')],
  ['copy', 'acoes', 'copiar duplicar', rect(8.5, 8.5, 12, 12, 2) + path('M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3')],
  ['trash', 'acoes', 'excluir apagar lixeira', path('M4 6.5h16M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5M6 6.5l1 13a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5l1-13M10 11v6M14 11v6')],
  ['download', 'acoes', 'baixar exportar', path('M12 4v11M7 10.5l5 5 5-5M4.5 20h15')],
  ['upload', 'acoes', 'enviar importar subir', path('M12 15.5v-11M7 9l5-5 5 5M4.5 20h15')],
  ['link', 'acoes', 'link url corrente', path('M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7') + path('M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7')],
  ['filter', 'acoes', 'filtrar funil', path('M4 5h16l-6 7.5V19l-4 1.5v-8z')],
  ['refresh', 'acoes', 'atualizar recarregar sincronizar', path('M20 11a8 8 0 0 0-14.3-4.6L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.6l1.7-2.1M20 20v-4.5h-4.5')],
  ['more-horizontal', 'acoes', 'mais opções reticências', `<g fill="currentColor">${circle(6, 12, 0.75)}${circle(12, 12, 0.75)}${circle(18, 12, 0.75)}</g>`],
  ['more-vertical', 'acoes', 'mais opções menu', `<g fill="currentColor">${circle(12, 6, 0.75)}${circle(12, 12, 0.75)}${circle(12, 18, 0.75)}</g>`],
  ['zap', 'acoes', 'raio rápido começar', path('M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z')],
  ['play', 'acoes', 'tocar reproduzir iniciar animação', path('M7.5 4.8v14.4a1 1 0 0 0 1.5.86l11.2-7.2a1 1 0 0 0 0-1.72L9 3.94a1 1 0 0 0-1.5.86z')],
  ['megaphone', 'acoes', 'novidades anúncio comunicado changelog', path('M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z') + path('M17 9a3.5 3.5 0 0 1 0 6M8 15.5V19a1.5 1.5 0 0 0 3 0v-2')],
  ['slash', 'acoes', 'atalho comando barra', path('M15 4 9 20')],
  ['mic', 'acoes', 'microfone áudio voz', rect(9, 3, 6, 11, 3) + path('M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21')],
  ['video', 'acoes', 'vídeo câmera gravar cena', rect(2.5, 6, 13.5, 12, 2.5) + path('m16 10.5 5.5-3v9l-5.5-3')],

  // Status e feedback
  ['info', 'status', 'informação ajuda', circle(12, 12, 8.5) + path('M12 11v5.5') + dot(12, 7.75)],
  ['alert-circle', 'status', 'alerta erro atenção', circle(12, 12, 8.5) + path('M12 7.5V13') + dot(12, 16.5)],
  ['alert-triangle', 'status', 'aviso perigo atenção', path('M10.3 4.2 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z') + path('M12 9.5v4') + dot(12, 17)],
  ['check-circle', 'status', 'sucesso concluído ok', circle(12, 12, 8.5) + path('m8.5 12 2.5 2.5 4.5-5')],
  ['x-circle', 'status', 'erro falha cancelar', circle(12, 12, 8.5) + path('m9 9 6 6M15 9l-6 6')],
  ['help-circle', 'status', 'ajuda dúvida pergunta', circle(12, 12, 8.5) + path('M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.3') + dot(12, 17)],
  ['bell', 'status', 'notificação sino alerta', path('M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z') + path('M10 20.5a2.2 2.2 0 0 0 4 0')],
  ['loader', 'status', 'carregando spinner progresso', path('M12 3.5a8.5 8.5 0 1 0 8.5 8.5')],
  ['clock', 'status', 'tempo hora relógio', circle(12, 12, 8.5) + path('M12 7.5V12l3 2')],
  ['history', 'status', 'histórico changelog versões', path('M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5M3.5 4v4.5H8M12 7.5V12l3 2')],
  ['shield', 'status', 'segurança proteção', path('M12 3.5l7.5 2.8v5.4c0 4.4-3.1 7.9-7.5 8.8-4.4-.9-7.5-4.4-7.5-8.8V6.3z')],
  ['lock', 'status', 'bloqueado privado senha', rect(4.5, 10.5, 15, 10, 2.5) + path('M8 10.5v-3a4 4 0 0 1 8 0v3')],
  ['wifi-off', 'status', 'sem conexão offline internet rede', path('M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.3-2.4M19 12.9a10 10 0 0 0-2.1-1.6M2 9.4a15 15 0 0 1 3.7-2.6M22 9.4A15 15 0 0 0 10.6 5.6') + dot(12, 20)],
  ['star', 'status', 'favorito destaque exemplo', path('M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z')],
  ['heart', 'status', 'curtir favorito amor', path('M12 19.5C6 15.6 3.5 12.6 3.5 9.3A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.3c0 3.3-2.5 6.3-8.5 10.2z')],
  ['flag', 'status', 'bandeira marco denunciar', path('M5 21V4M5 4.5h11l-2 4 2 4H5')],

  // Interface e componentes
  ['settings', 'interface', 'configurações engrenagem ajustes', gear()],
  ['sliders', 'interface', 'ajustes controles preferências', path('M4 7h9M17 7h3M4 17h3M11 17h9') + circle(15, 7, 2) + circle(9, 17, 2)],
  ['sun', 'interface', 'tema claro dia', circle(12, 12, 4) + path('M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4')],
  ['moon', 'interface', 'tema escuro noite', path('M10.5 3.5a7.5 7.5 0 0 0 10 10A8.5 8.5 0 1 1 10.5 3.5z')],
  ['monitor', 'interface', 'sistema tela desktop', rect(3, 4, 18, 12.5, 2.5) + path('M8.5 20.5h7M12 16.5v4')],
  ['eye', 'interface', 'visualizar mostrar ver', path('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z') + circle(12, 12, 3)],
  ['eye-off', 'interface', 'ocultar esconder senha', path('M10 5.7a9.6 9.6 0 0 1 2-.2c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.6C4 8.3 2.5 12 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3.5 3.5l17 17')],
  ['keyboard', 'interface', 'teclado atalhos teclas', rect(2.5, 6, 19, 12, 2.5) + path('M6 10h.01M9.3 10h.01M12.6 10h.01M15.9 10h.01M18 10h.01M7 14h10')],
  ['command', 'interface', 'comando cmd atalho mac', path('M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0h-6m6 0v2.5a2.5 2.5 0 1 0 2.5-2.5H15zm-6 0v2.5A2.5 2.5 0 1 1 6.5 15H9z')],
  ['app-shell', 'interface', 'layout estrutura janela sidebar', rect(3, 4, 18, 16, 3) + path('M9 4v16M9 9h12')],
  ['layout', 'interface', 'dashboard grade blocos', rect(3.5, 3.5, 7, 9, 2) + rect(13.5, 3.5, 7, 5, 2) + rect(13.5, 11.5, 7, 9, 2) + rect(3.5, 15.5, 7, 5, 2)],
  ['button', 'interface', 'botão ação cta', rect(3, 7, 18, 10, 3.5) + path('M8.5 12h7')],
  ['input', 'interface', 'campo texto formulário', rect(2.5, 6.5, 19, 11, 3) + path('M7 9.5v5')],
  ['check-square', 'interface', 'checkbox seleção marcar', rect(3.5, 3.5, 17, 17, 4) + path('m8 12 3 3 5-6')],
  ['radio', 'interface', 'opção única radio', circle(12, 12, 8.5) + fillDot(12, 12, 3.5)],
  ['toggle', 'interface', 'switch alternar ligar', rect(2.5, 6.5, 19, 11, 5.5) + circle(16, 12, 2.75)],
  ['tag', 'interface', 'badge etiqueta rótulo', path('M3.5 5v6.2a1.5 1.5 0 0 0 .44 1.06l8 8a1.5 1.5 0 0 0 2.12 0l6.2-6.2a1.5 1.5 0 0 0 0-2.12l-8-8A1.5 1.5 0 0 0 11.2 3.5H5A1.5 1.5 0 0 0 3.5 5z') + dot(8, 8)],
  ['card', 'interface', 'cartão bloco conteúdo', rect(3, 4.5, 18, 15, 3) + path('M3 10h18')],
  ['dialog', 'interface', 'modal janela diálogo', rect(2.5, 4.5, 19, 15, 3) + path('M2.5 9h19') + dot(6, 6.8) + dot(8.5, 6.8)],
  ['tabs', 'interface', 'abas guias navegação', rect(3, 4, 18, 16, 3) + path('M3 9h18M9.5 4v5')],
  ['tooltip', 'interface', 'dica balão ajuda', path('M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4.5L12 19.5l-2.5-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z')],
  ['table', 'interface', 'tabela dados grade', rect(3.5, 4, 17, 16, 2.5) + path('M3.5 9.5h17M3.5 15h17M9.5 9.5V20')],
  ['list', 'interface', 'lista itens', path('M9 6h11M9 12h11M9 18h11') + dot(4.5, 6) + dot(4.5, 12) + dot(4.5, 18)],
  ['message-square', 'interface', 'mensagem toast chat comentário', path('M20.5 15a2 2 0 0 1-2 2H8l-4.5 3.5V5.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z')],
  ['stack', 'interface', 'conteúdos coleção pilha', rect(3.5, 8.5, 17, 12, 2.5) + path('M5.5 5.5h13M7.5 3h9')],

  // Objetos
  ['calendar', 'objetos', 'calendário data agenda evento', rect(3.5, 5, 17, 15.5, 3) + path('M3.5 10h17M8 3v4M16 3v4') + dot(8, 14) + dot(12, 14) + dot(16, 14) + dot(8, 17.2) + dot(12, 17.2)],
  ['file-text', 'objetos', 'documento arquivo página', path('M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z') + path('M14 3.5v5h5M9 13h6M9 16.5h4')],
  ['folder', 'objetos', 'pasta diretório', path('M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z')],
  ['inbox', 'objetos', 'caixa entrada vazio', path('M3.5 13h5l1.5 2.5h4l1.5-2.5h5') + path('M6 4.5h12l2.5 8.5v5.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V13z')],
  ['image', 'objetos', 'imagem foto mídia', rect(3.5, 3.5, 17, 17, 3) + circle(9, 9, 1.5) + path('m20.5 15-4.5-4.5L5.5 20.5')],
  ['package', 'objetos', 'pacote versão release', path('M12 3 20 7.5v9L12 21l-8-4.5v-9z') + path('M4 7.5 12 12l8-4.5M12 12v9')],
  ['book-open', 'objetos', 'documentação guia livro', path('M12 7c-1.8-1.6-4.5-2.5-8.5-2.5v13c4 0 6.7.9 8.5 2.5 1.8-1.6 4.5-2.5 8.5-2.5v-13c-4 0-6.7.9-8.5 2.5zM12 7v13')],
  ['code', 'objetos', 'código desenvolvimento', path('m8.5 7-5 5 5 5M15.5 7l5 5-5 5')],
  ['terminal', 'objetos', 'linha de comando console', path('m5 7.5 4.5 4.5L5 16.5M12 17h7')],
  ['git-branch', 'objetos', 'branch versão ramificação', circle(6.5, 5.5, 2) + circle(6.5, 18.5, 2) + circle(17.5, 7.5, 2) + path('M6.5 7.5v9M17.5 9.5a6 6 0 0 1-6 6h-3')],
  ['git-pull-request', 'objetos', 'contribuir pull request revisão', circle(6, 6, 2) + circle(6, 18, 2) + circle(18, 18, 2) + path('M6 8v8M18 16V9a2 2 0 0 0-2-2h-4M14 4.5 11.5 7 14 9.5')],
  ['mail', 'objetos', 'email mensagem carta', rect(3, 5, 18, 14, 3) + path('m3.5 7.5 8.5 6 8.5-6')],
  ['globe', 'objetos', 'mundo idioma web', circle(12, 12, 8.5) + path('M3.5 12h17M12 3.5c2.3 2.3 3.5 5.2 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.2-3.5-8.5s1.2-6.2 3.5-8.5z')],
  ['target', 'objetos', 'alvo objetivo foco', circle(12, 12, 8.5) + circle(12, 12, 5) + circle(12, 12, 1.5)],
  ['hash', 'objetos', 'número tag canal', path('M5 9h14M5 15h14M10 4 8 20M16 4l-2 16')],

  // Gráficos
  ['dashboard', 'graficos', 'painel visão geral indicadores gráficos', rect(3.5, 3.5, 17, 17, 3) + path('M3.5 9h17M8 16.5v-3M12 16.5v-4.5M16 16.5v-2')],
  ['bar-chart', 'graficos', 'gráfico barras colunas resultados métricas', path('M5 20v-5M9.7 20V9M14.3 20v-7.5M19 20V4.5')],
  ['line-chart', 'graficos', 'gráfico linha tendência série temporal', path('M3.5 4v14.5a1.5 1.5 0 0 0 1.5 1.5h15.5') + path('m7.5 15 3.5-4.5 3 3 5.5-7')],
  ['area-chart', 'graficos', 'gráfico área volume acumulado', path('M3.5 4v14.5a1.5 1.5 0 0 0 1.5 1.5h15.5') + path('M7.5 16.5V14l3.5-4 3 2.5 5-5.5v9.5z')],
  ['donut', 'graficos', 'gráfico rosca pizza proporção parte do todo', circle(12, 12, 8.5) + circle(12, 12, 3.5) + path('M12 3.5v5M20.5 12h-5')],
  ['heatmap', 'graficos', 'mapa de calor matriz intensidade calendário', `<rect x="3.5" y="3.5" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none"/><rect x="9.75" y="3.5" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none" fill-opacity="0.35"/><rect x="16" y="3.5" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none" fill-opacity="0.7"/><rect x="3.5" y="9.75" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none" fill-opacity="0.35"/><rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none"/><rect x="16" y="9.75" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none" fill-opacity="0.35"/><rect x="3.5" y="16" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none" fill-opacity="0.7"/><rect x="9.75" y="16" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none" fill-opacity="0.35"/><rect x="16" y="16" width="4.5" height="4.5" rx="1.25" fill="currentColor" stroke="none"/>`],
  ['scatter', 'graficos', 'dispersão pontos correlação bolhas', path('M3.5 4v14.5a1.5 1.5 0 0 0 1.5 1.5h15.5') + fillDot(8.5, 14.5, 1.5) + fillDot(11.5, 9.5, 1.5) + fillDot(15, 12.5, 1.5) + fillDot(18, 6.5, 1.5)],
  ['gauge', 'graficos', 'indicador medidor progresso kpi', path('M4.2 17.5a8.5 8.5 0 1 1 15.6 0') + path('m12 14 3.5-5') + fillDot(12, 14, 1.6)],
  ['trending-up', 'graficos', 'alta subir crescimento variação', path('m3.5 16.5 5.5-5.5 4 4 7.5-7.5') + path('M14.5 7.5h6v6')],
  ['trending-down', 'graficos', 'baixa cair queda variação', path('m3.5 7.5 5.5 5.5 4-4 7.5 7.5') + path('M14.5 16.5h6v-6')],

  // Design
  ['palette', 'design', 'cores paleta tinta', path('M12 3.5a8.5 8.5 0 0 0 0 17c1.1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8h2.1a3.8 3.8 0 0 0 3.8-3.8C20.5 6.9 16.7 3.5 12 3.5z') + fillDot(7.8, 11.2) + fillDot(9.6, 7.3) + fillDot(14.2, 6.9) + fillDot(17.2, 9.6)],
  ['droplet', 'design', 'cor gota preenchimento', path('M12 3.5c3 3.5 5.5 6.6 5.5 10a5.5 5.5 0 0 1-11 0c0-3.4 2.5-6.5 5.5-10z')],
  ['type', 'design', 'tipografia texto fonte', path('M5 7V5h14v2M12 5v14M9 19h6')],
  ['shapes', 'design', 'ícones formas geometria', path('M7.5 3.5 11.5 10.5h-8z') + rect(13, 3.5, 7.5, 7, 2) + circle(12, 17, 3.5)],
  ['grid', 'design', 'grade layout colunas', rect(4, 4, 6.5, 6.5, 2) + rect(13.5, 4, 6.5, 6.5, 2) + rect(4, 13.5, 6.5, 6.5, 2) + rect(13.5, 13.5, 6.5, 6.5, 2)],
  ['layers', 'design', 'camadas componentes contexto', path('m12 3.5 8.5 4.5-8.5 4.5L3.5 8z') + path('m3.5 12 8.5 4.5 8.5-4.5') + path('m3.5 16 8.5 4.5 8.5-4.5')],
  ['component', 'design', 'componente biblioteca símbolo', path('M12 2.5 15 5.5 12 8.5 9 5.5zM5.5 9 8.5 12 5.5 15 2.5 12zM18.5 9l3 3-3 3-3-3zM12 15.5l3 3-3 3-3-3z')],
  ['spacing', 'design', 'espaçamento distância medida', path('M3.5 4v16M20.5 4v16M7.5 12h9M10 9.5 7.5 12l2.5 2.5M14 9.5l2.5 2.5-2.5 2.5')],
  ['radius', 'design', 'raio canto arredondado borda', path('M4 20v-8a8 8 0 0 1 8-8h8')],
  ['elevation', 'design', 'elevação sombra profundidade', rect(3.5, 3.5, 13, 13, 3) + path('M20.5 8v10.5a2 2 0 0 1-2 2H8')],
  ['motion', 'design', 'movimento animação onda', path('M3 12h4l2.5-6 5 12L17 12h4')],
  ['accessibility', 'design', 'acessibilidade a11y inclusão', circle(12, 4.5, 1.5) + path('M5 8.5l7 1.5 7-1.5M12 10v4.5M9.5 20.5l2.5-6 2.5 6')],

  // Pessoas
  ['user', 'pessoas', 'usuário pessoa perfil', circle(12, 8, 4) + path('M4.5 20.5a7.5 7.5 0 0 1 15 0')],
  ['user-circle', 'pessoas', 'avatar conta perfil', circle(12, 12, 8.5) + circle(12, 10, 3) + path('M6.7 18.4a6.5 6.5 0 0 1 10.6 0')],
  ['users', 'pessoas', 'equipe grupo pessoas', circle(9, 8, 3.5) + path('M2.5 20a6.5 6.5 0 0 1 13 0') + path('M15.5 4.7a3.5 3.5 0 0 1 0 6.6M18 14.2a6.5 6.5 0 0 1 3.5 5.8')],
];

export const iconCategories = {
  navegacao: 'Navegação',
  acoes: 'Ações',
  status: 'Status e feedback',
  interface: 'Interface',
  objetos: 'Objetos',
  design: 'Design',
  graficos: 'Gráficos',
  pessoas: 'Pessoas',
};

export const icons = Object.fromEntries(
  DEFINITIONS.map(([name, category, keywords, body]) => [name, { name, category, keywords: keywords.split(' '), body }]),
);

export const iconList = Object.values(icons);

const FALLBACK = rect(4, 4, 16, 16, 3).replace('/>', ' stroke-dasharray="2 2"/>');
const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Retorna o SVG de um ícone como string. */
export function icon(name, { size = 20, strokeWidth, label, className = '' } = {}) {
  const def = icons[name];
  if (!def) console.warn(`[órbita] ícone "${name}" não existe.`);
  const px = Number(size);
  const sw = strokeWidth ?? (px <= 16 ? 1.75 : 1.5);
  const a11y = label ? `role="img" aria-label="${escapeAttr(label)}"` : 'aria-hidden="true"';
  return `<svg class="ds-icon${className ? ` ${className}` : ''}" width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" focusable="false" ${a11y}>${def?.body ?? FALLBACK}</svg>`;
}

/** <ds-icon name="home" size="20" label="Início"></ds-icon> */
class DsIcon extends HTMLElement {
  static observedAttributes = ['name', 'size', 'stroke', 'label'];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const size = this.getAttribute('size') ?? 20;
    const stroke = this.getAttribute('stroke');
    this.style.width = this.style.height = `${size}px`;
    this.innerHTML = icon(this.getAttribute('name'), {
      size,
      strokeWidth: stroke ? Number(stroke) : undefined,
      label: this.getAttribute('label') ?? undefined,
    });
  }
}

if (!customElements.get('ds-icon')) customElements.define('ds-icon', DsIcon);
