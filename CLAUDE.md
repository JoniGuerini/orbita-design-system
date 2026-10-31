# Órbita Design System — contexto para o Claude

O Claude Code lê este arquivo sozinho em qualquer computador. Ele guarda o que o código não conta: as preferências e os vetos de quem toca o projeto, o jeito de trabalhar aqui e as armadilhas que já custaram tempo. Estrutura de pastas e comandos estão no [README](README.md).

Quando aprender uma preferência nova ou fechar uma versão, atualize este arquivo — a memória local de cada máquina não viaja junto.

## Quem pede e como julga

- Conversa em português do Brasil. O texto original é PT-BR, curto e direto; o site também fala inglês e espanhol (veja Idiomas).
- Julga pelo **refinamento visual**, não só pela completude. Prefere menos elementos a mais enfeite.
- **Figma: entregue o manifesto e deixe a conferência com ele.** Depois de mudar `figma/plugin/*`, rode `npm run figma` e `npm run figma:test`, passe o caminho de `dist/figma-plugin/manifest.json` e diga o que vale olhar. Não valide pedaço por pedaço pelo conector do Figma com capturas — em 31/10/2026 isso levou mais de uma hora, e ele confere tudo em 5 minutos. O conector só serve para uma dúvida pontual da API, com um teste pequeno e descartável.

## Direção visual

- Escuro quente, acento pêssego (`#ff945e`) com texto escuro no botão primário, raios grandes, títulos em Inter Tight bem apertados.
- **Tudo plano**: superfícies opacas e lisas, contornos finos, sem vidro, reflexo, brilho interno, blur, degradê de fundo ou textura de pontinhos. A personalidade vem das superfícies, dos contornos, da tipografia e do pêssego.
- **Sem imagens.** Arte por código (canvas) e imagens geradas foram testadas e vetadas. Os arquivos em `assets/art/` ficaram sem uso — não reintroduzir sem ele pedir.
- A referência que vale para componentes é o painel “Roteiro”: botões de ícone sem fundo, chips em pílula só com contorno, rótulos pequenos e apagados (“00 · Sobre”), ações inline mínimas (“Na cena +”), texto de leitura com respiro.
- A referência serve aos **componentes**, não para copiar telas: o Início é uma landing de design system (hero, colagem de componentes, números, fundamentos, padrões, roadmap), não um painel.
- Consistência com o próprio app vale mais que invenção: o hover das Abas é igual ao da `.doc-nav`; Seleção usa lista própria (nada de menu nativo do sistema); Toast tem posição configurável.
- **Barra de rolagem sobreposta** em todo o app (`ds/js/scrollbar.js` + `components/scrollbar.css`): a nativa some e fica só a barra, sem trilho nem setas. Ela aparece enquanto a pessoa rola e some ~1 s depois de parar. Dá para arrastá-la. Funciona por delegação (qualquer área que rola, inclusive dentro de `<dialog>`). O recuo nas pontas é `--ds-scrollbar-start/end`; o painel principal começa abaixo da topbar. Para desligar numa área, use `--ds-scrollbar: none` (abas e `.doc-nav`). No navegador do app com o painel oculto, a rolagem não dispara eventos: para testar, use rolagem real ou um screenshot para forçar o desenho.
- Componentes consomem só tokens semânticos.

## Vetos

- Logotipo é só o nome “Órbita” (Inter Tight bold). Nada de ponto laranja depois do nome (“clichê”) nem “| Design System”.
- Nunca o ícone de *sparkles* (estrela grande + pequena) — saiu da biblioteca. Novidades usa `megaphone`.
- Nada de enfeite “vibe coded”, como o badge “Versão 0.1 · veja as novidades” no hero.
- Contornos discretos: chips, botões e a busca da sidebar mantêm `border.control` fino (o rótulo já identifica). Campos, seleção, composer e switch usam `border.field` (3:1).

## Idiomas

- PT-BR, inglês e espanhol. O padrão segue o idioma do sistema; o que o Órbita não tiver vira **inglês**. O seletor fica na topbar, ao lado do tema (Sistema · Português · English · Español), e a escolha fica salva (`ds-locale`).
- `ds/js/i18n.js`: `locale()`, `setLocale()`, `tr()`, `msg()`, Intl no idioma atual e o evento `ds:localechange`. Textos dos componentes do DS em `ds/js/messages.js` (chave nova = nos três idiomas). Nada de `'pt-BR'` fixo em `Intl`.
- Site: textos em `T(pt, en, es)`. Shell e busca em `site/i18n.js` (o `index.html` usa `data-i18n` e `data-i18n-attr`); nomes e descrições das páginas em `site/nav.js` (getters no idioma atual); cada página tem um `COPY = T({…}, {…}, {…})` e lê `tr(COPY)` ao renderizar, ou usa `L(pt, en, es)` direto no texto (padrão das páginas de componentes; dados que têm texto viram funções, como `const TONES = () => […]`, chamadas na renderização). Trocar o idioma redesenha a página aberta. Os caminhos (`#/componentes/botao`) ficam em português.
- Componentes que ficam abertos (busca ⌘K, shell) se atualizam sozinhos com `ds:localechange`; os que a página cria são recriados no redesenho.
- Em andamento (31/10/2026): fase 1 (base, textos do DS, shell, sidebar, busca, Início, Primeiros passos, 404, títulos e resumos das versões), fase 2 (as 8 páginas de Fundamentos), fase 3 (as 16 de Componentes), fase 4 (as 7 de Gráficos) e fase 5 (as 5 de Padrões) feitas. Faltam, uma fase e um commit cada: Recursos, Novidades (itens das versões e tipos) e, por último, o plugin do Figma.
- Textos que vêm dos JSON de tokens (nomes de paleta, descrições de token) são traduzidos em `site/i18n.js` (`paletteLabel`, `tokenDescription`); números com decimais passam por `formatNumber`/`ratio`, nunca `.replace('.', ',')`. Dados de exemplo dos gráficos (`site/chart-data.js`) que têm texto são funções (`months()`, `weekdays()`, `channels()`, `payments()`…): meses e dias saem do Intl. Valores em real usam `currency: 'BRL', currencyDisplay: 'narrowSymbol'` (sem isso o espanhol mostra “BRL” em vez de “R$”). Estado de demonstração guarda ids, não textos (a seleção da Tabela usa `row.id`; os filtros da Busca usam ids fixos na URL, como `?status=pendente`), para não quebrar quando o idioma muda. Os iframes `?embed` do App shell recebem o idioma da página com `orbitaEmbed.setLocale(locale())`. Dentro de um módulo, não crie função local chamada `msg`: ela esconde a `msg` de tradução (já quebrou o resumo de erros do `form.js`). A busca de ícones olha as palavras-chave das três línguas juntas (`site/icon-keywords.js`; ícone novo entra lá também). A versão no changelog (0.7.0 · Idiomas) entra quando o site estiver todo traduzido.

## Como trabalhar aqui

- **Sem dependências**: HTML, CSS e JavaScript nativos + scripts Node (`npm run …` só chama scripts). No computador de trabalho o registry npm corporativo estava fora do ar; se um dia der para instalar pacotes, migrar para React/Vite é possível — mas só se ele pedir.
- **Git e GitHub**: repositório privado [JoniGuerini/orbita-design-system](https://github.com/JoniGuerini/orbita-design-system), branch `main`. Commits com o e-mail anônimo do GitHub (`37719576+JoniGuerini@users.noreply.github.com`), nunca o Gmail; em máquina nova, configure com `git config user.email` dentro do repositório. `dist/` fica fora do git: é gerado por `npm run figma`, `figma:test` e `tokens:export`.
- **Tokens são a fonte da verdade**: edite `tokens/*.json`; `ds/tokens.css` e `ds/tokens.js` são gerados. O build mede 70 pares de contraste (WCAG).
- O site está completo: 8 fundamentos, 16 componentes, 7 páginas de gráficos, 5 padrões e 4 recursos — nenhuma página “em construção”. Páginas internas podem usar `.ds-panel`; o Início, não.
- **Cada entrega grande vira uma versão** em `site/changelog.js` (página Novidades e o ponto da sidebar). Atual: **0.6.1**. Histórico: 0.1 base · 0.2 Gráficos · 0.3 Padrões · 0.4 Recursos · 0.4.1 Contraste · 0.5 Plugin do Figma · 0.6 Plugin completo · 0.6.1 Plugin no plano gratuito. Próximo no roadmap: **1.0 Estável**, mas antes ele quer refinar componentes e criar os que faltam, sem pressa. O caminho proposto para depois (31/10/2026): 0.7 Testes (estados com `data-state` em todos, testes visuais sem dependência) · 0.8 API (o que é público, convenção única no JS) · 0.9 Pacote (build com CSS único, instalação pelo GitHub, versão única, licença) · 1.0 Estável. Ainda não foi para o site.
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
- **Plano gratuito do Figma: 1 modo por coleção e 3 páginas por arquivo** (`addMode` recusa com “Limited to 1 modes only”; `createPage`, com “The Starter plan only comes with 3 pages”). A janela tem Modos (Claro e Escuro · Só Escuro · Só Claro), guardado no `clientStorage`; `ORB.active` decide os modos das variáveis e das prévias. O Órbita usa exatamente 3 páginas e reaproveita a “Page 1” vazia do arquivo novo — não crie uma 4ª página. A imitação cobra os dois limites com `createMockFigma({ maxModes: 1, maxPages: 3 })` e o teste confere a passagem para o plano pago sem duplicar. Publicar biblioteca também é do plano pago.
- Não faça manifestos paralelos (um por modo): `setPluginData` é privado de cada id de plugin, então outro plugin não reconheceria o que este gerou e duplicaria tudo. Variações vão como opção na janela.
- Pendências conhecidas: o divisor esmaecido do site não entrou (o Figma não liga variável às cores de um degradê). Se a Inter Tight não estiver instalada, o plugin usa a Inter e avisa.
- `scripts/build-figma-mcp.mjs` gera `dist/figma-mcp/` só para rodar o plugin pelo conector do Figma — não é o caminho normal.
