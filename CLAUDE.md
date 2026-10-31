# Órbita Design System — contexto para o Claude

O Claude Code lê este arquivo sozinho em qualquer computador. Ele guarda o que o código não conta: as preferências e os vetos de quem toca o projeto, o jeito de trabalhar aqui e as armadilhas que já custaram tempo. Estrutura de pastas e comandos estão no [README](README.md).

Quando aprender uma preferência nova ou fechar uma versão, atualize este arquivo — a memória local de cada máquina não viaja junto.

## Quem pede e como julga

- Conversa em português do Brasil; todo texto do site e do plugin é em PT-BR, curto e direto.
- Julga pelo **refinamento visual**, não só pela completude. Prefere menos elementos a mais enfeite.
- **Figma: entregue o manifesto e deixe a conferência com ele.** Depois de mudar `figma/plugin/*`, rode `npm run figma` e `npm run figma:test`, passe o caminho de `dist/figma-plugin/manifest.json` e diga o que vale olhar. Não valide pedaço por pedaço pelo conector do Figma com capturas — em 31/10/2026 isso levou mais de uma hora, e ele confere tudo em 5 minutos. O conector só serve para uma dúvida pontual da API, com um teste pequeno e descartável.

## Direção visual

- Escuro quente, acento pêssego (`#ff945e`) com texto escuro no botão primário, raios grandes, títulos em Inter Tight bem apertados.
- **Tudo plano**: superfícies opacas e lisas, contornos finos, sem vidro, reflexo, brilho interno, blur, degradê de fundo ou textura de pontinhos. A personalidade vem das superfícies, dos contornos, da tipografia e do pêssego.
- **Sem imagens.** Arte por código (canvas) e imagens geradas foram testadas e vetadas. Os arquivos em `assets/art/` ficaram sem uso — não reintroduzir sem ele pedir.
- A referência que vale para componentes é o painel “Roteiro”: botões de ícone sem fundo, chips em pílula só com contorno, rótulos pequenos e apagados (“00 · Sobre”), ações inline mínimas (“Na cena +”), texto de leitura com respiro.
- A referência serve aos **componentes**, não para copiar telas: o Início é uma landing de design system (hero, colagem de componentes, números, fundamentos, padrões, roadmap), não um painel.
- Consistência com o próprio app vale mais que invenção: o hover das Abas é igual ao da `.doc-nav`; Seleção usa lista própria (nada de menu nativo do sistema); Toast tem posição configurável.
- Componentes consomem só tokens semânticos.

## Vetos

- Logotipo é só o nome “Órbita” (Inter Tight bold). Nada de ponto laranja depois do nome (“clichê”) nem “| Design System”.
- Nunca o ícone de *sparkles* (estrela grande + pequena) — saiu da biblioteca. Novidades usa `megaphone`.
- Nada de enfeite “vibe coded”, como o badge “Versão 0.1 · veja as novidades” no hero.
- Contornos discretos: chips, botões e a busca da sidebar mantêm `border.control` fino (o rótulo já identifica). Campos, seleção, composer e switch usam `border.field` (3:1).

## Como trabalhar aqui

- **Sem dependências**: HTML, CSS e JavaScript nativos + scripts Node (`npm run …` só chama scripts). No computador de trabalho o registry npm corporativo estava fora do ar; se um dia der para instalar pacotes, migrar para React/Vite é possível — mas só se ele pedir.
- **Git e GitHub**: repositório privado [JoniGuerini/orbita-design-system](https://github.com/JoniGuerini/orbita-design-system), branch `main`. Commits com o e-mail anônimo do GitHub (`37719576+JoniGuerini@users.noreply.github.com`), nunca o Gmail; em máquina nova, configure com `git config user.email` dentro do repositório. `dist/` fica fora do git: é gerado por `npm run figma`, `figma:test` e `tokens:export`.
- **Tokens são a fonte da verdade**: edite `tokens/*.json`; `ds/tokens.css` e `ds/tokens.js` são gerados. O build mede 70 pares de contraste (WCAG).
- O site está completo: 8 fundamentos, 16 componentes, 7 páginas de gráficos, 5 padrões e 4 recursos — nenhuma página “em construção”. Páginas internas podem usar `.ds-panel`; o Início, não.
- **Cada entrega grande vira uma versão** em `site/changelog.js` (página Novidades e o ponto da sidebar). Atual: **0.6.0**. Histórico: 0.1 base · 0.2 Gráficos · 0.3 Padrões · 0.4 Recursos · 0.4.1 Contraste · 0.5 Plugin do Figma · 0.6 Plugin completo. Próximo no roadmap: **1.0 Estável**.
- Modelos de página: fundamentos seguem `site/pages/cores.js`; componentes, `site/pages/botao.js` + `site/component-doc.js` (playground, variantes, estados via `data-state`, anatomia, acessibilidade, tokens usados).
- Gráficos (`ds/js/charts.js`, núcleo em `ds/js/charts/`): a paleta `color.chart.series.1–8` (brand, blue, pink, amber, teal, red, violet, green) foi ordenada por um validador de daltonismo (ΔE ≥ 11,7 entre vizinhas nos dois temas). **Não reordene sem revalidar.** Uma série = sem legenda; duas ou mais = sempre legenda; um eixo só; tracejado só para meta.

## Plugin do Figma

- Código em `figma/plugin/` (um arquivo por grupo; `00-runtime.js` é o núcleo). `npm run figma` gera `dist/figma-plugin/`; `npm run figma:test` roda o plugin duas vezes em `scripts/figma-mock.mjs` (imitação da API com as regras do Figma), confere que os ids se mantêm, acusa conteúdo vazando da borda e gera `dist/figma-plugin/preview.html`.
- Estado em 0.6.0: 42 blocos, 50 conjuntos, 527 variantes, 126 ícones e 305 variáveis. Cada componente é um bloco com cabeçalho escuro (grupo, título, descrição, tags), matriz de variantes rotulada, exemplos e prévias Claro e Escuro — layout que ele pediu a partir de outro DS dele.
- Regras do Figma de verdade (a imitação já cobra todas):
  - Ao trocar a variável de uma pintura, o Figma põe a transparência da variável na opacidade. Para uma opacidade própria (ex.: véu de 24%), aplique de novo com a mesma ligação — é o `setPaints` do núcleo.
  - Na troca de ícone, a cor passa pela camada de mesmo nome e posição. Por isso cada ícone é uma camada só, “Ícone”, com o traço em contorno.
  - `outlineStroke()` devolve o contorno solto na página; quem chama recoloca.
  - Instância de variante nasce com o nome do conjunto, não com “Prop=Valor”.
  - Propriedade de texto em conjunto de variantes mostra o mesmo valor padrão em todas as variantes.
- Pendências conhecidas: o divisor esmaecido do site não entrou (o Figma não liga variável às cores de um degradê). Se a Inter Tight não estiver instalada, o plugin usa a Inter e avisa.
- `scripts/build-figma-mcp.mjs` gera `dist/figma-mcp/` só para rodar o plugin pelo conector do Figma — não é o caminho normal.
