# Lume Design System

O design system do app Lume (até a versão 0.7, chamado Órbita).
Design system escuro-quente, plano e calmo: acento pêssego, contornos finos, títulos bem apertados e páginas montadas como painéis.
Sem dependências: HTML, CSS custom properties e JavaScript nativo (ES modules). Funciona com qualquer stack.

## Rodar

```bash
npm run dev
```

Abre em http://localhost:5173. O servidor gera os tokens ao iniciar e de novo sempre que um arquivo em `tokens/` muda.

Para só gerar os tokens: `npm run tokens`. Para exportar para o Figma e outras ferramentas: `npm run tokens:export` (gera `dist/tokens/`; veja Recursos › Tokens para Figma).

Para publicar: `npm run build` gera os tokens e monta em `dist/site/` só o site (`index.html`, `ds/`, `site/` e o favicon). O `vercel.json` já aponta o Vercel para esse comando e essa pasta.

### Plugin do Figma

```bash
npm run figma
```

Gera `dist/figma-plugin/`. No Figma para desktop: **Plugins → Desenvolvimento → Importar plugin do manifesto…** e escolha `dist/figma-plugin/manifest.json`. O plugin cria as variáveis, os estilos, os ícones e os componentes em blocos de documentação (modos Claro e Escuro), em português, inglês ou espanhol (opção Idioma na janela); rodar de novo atualiza sem duplicar. O código fica em `figma/plugin/` (um arquivo por grupo). `npm run figma:test` roda o plugin numa imitação da API do Figma e gera `dist/figma-plugin/preview.html`.

## Estrutura

```
tokens/              ← fonte da verdade (edite aqui)
  palettes.json      paletas primitivas em OKLCH (hue + chroma → 11 a 16 tons)
  foundation.json    espaço, raio, tamanhos, layout, z-index, movimento
  typography.json    famílias, pesos e 19 estilos de texto
  semantic.json      tokens de cor por tema (escuro e claro) + checagens de contraste
  effects.json       sombras e o gradiente do divisor
figma/
  plugin/            o plugin do Figma, um arquivo por grupo (00 núcleo · 01–06 idiomas e dicionário · 10 fundamentos · 20 ícones · 30+ blocos · 99 main)
  ui.html            a janela do plugin
scripts/
  build-tokens.mjs   tokens/*.json → ds/tokens.css + ds/tokens.js (com relatório WCAG)
  build-figma-plugin.mjs  figma/plugin/*.js + tokens + ícones → dist/figma-plugin/
  test-figma-plugin.mjs   roda o plugin em figma-mock.mjs (imitação da API) e gera a prévia
  export-tokens.mjs  tokens → dist/tokens/ (variáveis do Figma, plugin, DTCG, JSON plano, CSS)
  build-site.mjs     só o site → dist/site/ (o que o Vercel publica)
  serve.mjs          servidor de desenvolvimento
ds/                  ← o design system em si
  ds.css             ponto de entrada (importa tudo)
  tokens.css/js      gerados — não edite
  base.css           reset, tipografia base, foco, acessibilidade
  components/        um CSS por componente (botão, chip, campo, seleção, checkbox, switch, abas,
                     tabela, modal, menu, toast, painel, avatar, alerta, filtros, conversa,
                     gráficos, shell, ⌘K…)
  icons/icons.js     126 ícones próprios + função icon() + <ds-icon>
  js/                theme, tooltip, menu, select, tabs, modal, toast, shell, command-palette,
                     composer (conversa), form (validação), filters (barra de filtros),
                     i18n + messages (idioma e os textos dos componentes em PT, EN e ES)
  js/charts.js       gráficos em SVG: barras, linhas e áreas, rosca, heatmap, calendário,
                     dispersão, indicador, sparkline e medidor (núcleo em js/charts/)
site/                ← o site de documentação (usa o DS)
  nav.js             mapa do site: sidebar, rotas, breadcrumb e busca (nomes nos três idiomas)
  i18n.js            textos do shell e da busca em PT, EN e ES
  docs.css           layout das páginas de documentação (cabeçalho, nav da página, seções, tabelas)
  doc-nav.js         navegação "nesta página" (rolagem + seção ativa)
  component-doc.*    peças das páginas de componente: playground com código, tokens usados, acessibilidade
  changelog.js       versões, próximas versões e o indicador de Novidades da sidebar
  brand.js           troca da cor da marca ao vivo (demonstração)
  chart-data.js      dados de exemplo (fixos) das páginas de gráficos
  pages/             páginas (cada uma com seu .css): home, primeiros-passos, novidades,
                     8 fundamentos, 16 componentes, 7 de gráficos, 5 padrões, 4 recursos,
                     placeholder, 404
```

## Usar em outro projeto

```html
<link rel="stylesheet" href="ds/ds.css">
<script type="module" src="ds/icons/icons.js"></script>

<button class="ds-btn ds-btn--primary ds-btn--lg"><ds-icon name="pencil"></ds-icon>Criar</button>
```

Nos estilos, consuma sempre tokens semânticos: `var(--ds-color-fg-muted)`, `var(--ds-radius-xl)`, `font: var(--ds-text-body-md)`.

### Gráficos

```js
import { barChart } from './ds/js/charts.js';

const chart = barChart(document.querySelector('#vendas'), {
  title: 'Vendas por mês',
  categories: ['Jan', 'Fev', 'Mar'],
  series: [{ name: 'Loja', values: [120, 180, 150] }],
  format: 'currency',
});

chart.update({ series: [{ name: 'Loja', values: [130, 170, 160] }] });
chart.destroy();
```

### Padrões

```js
import { enhanceForm } from './ds/js/form.js';          // validação em português, a partir dos atributos nativos
import { createComposer } from './ds/js/composer.js';   // caixa de mensagem com anexos e comandos "/"
import { createFilters } from './ds/js/filters.js';     // busca + filtros + pílulas ativas + contagem

enhanceForm(document.querySelector('form'), { onSubmit: (data) => salvar(data) });
```

O app shell aceita `createShell(el, { persist: false })` para demonstrações que não devem salvar preferências; abra o site com `?embed` para o mesmo efeito.

### Idiomas

Os textos dos componentes (validação, “Fechar”, “Nenhum resultado”, gráficos) e a formatação de números e datas seguem o idioma: português, inglês ou espanhol. Por padrão vale o idioma do sistema; o que não for um dos três vira inglês.

```js
import { setLocale, locale } from './ds/js/i18n.js';

setLocale('en');        // 'pt-BR' | 'en' | 'es' | 'system' — salva a escolha e avisa com ds:localechange
locale();               // 'en'
```

Todos os gráficos seguem o tema sozinhos (as cores são tokens `--ds-color-chart-*`), têm tooltip no hover e no teclado, legenda que esconde séries e uma vista em tabela. As 8 cores de série têm ordem fixa, validada para daltonismo nos dois temas: não recicle nem invente uma 9ª — agrupe em “Outros”.

## Personalizar

- **Cor da marca:** em `tokens/palettes.json`, mude `hue` (e `chroma`) de `brand`. Ex.: `50` pêssego, `275` índigo, `150` verde.
- **Temas:** `<html data-theme="dark|light|system">`. Escuro é o padrão. Qualquer elemento pode ter um `data-theme` próprio (temas aninhados).
- **Sem imagens nem texturas:** a personalidade vem das superfícies opacas em camadas, dos contornos finos, da tipografia e do acento pêssego. Fundos são sempre cores sólidas — nada de degradê, vidro ou blur.
- **Nova página:** crie `site/pages/minha-pagina.js` exportando `default function render(page)` (e, se quiser, `mount(root)` que devolve uma função de limpeza, e `styles = 'site/pages/minha-pagina.css'`). Depois adicione `load: () => import('./pages/minha-pagina.js')` ao item em `site/nav.js`. Páginas de fundamentos seguem o modelo de `cores.js`: `.doc-header` → `.doc-nav` → `.doc-section`.

## Atalhos

| Atalho | Ação |
| --- | --- |
| `⌘K` / `Ctrl K` / `/` | Busca rápida |
| `⌘B` / `Ctrl B` | Recolher ou expandir a sidebar |
| `Esc` | Fechar busca ou menu mobile |
