# Vídeo do Órbita

Vídeo de apresentação do Órbita (~94 s, 1920×1080, 60 fps) feito em **React + [Motion](https://motion.dev)**.
Usa o CSS, os tokens e os ícones reais do DS (`../ds`) — nenhuma cor ou medida inventada.

Esta pasta é separada de propósito: o design system continua sem dependências, e o `npm run build` do site não copia nada daqui.

## Rodar

```bash
cd video
npm install
npm run dev        # prévia em loop: http://localhost:5180  (?t=20 começa no segundo 20)
npm run render     # gera out/orbita.mp4
```

O `render` precisa do Playwright com o Chromium (`npm i -D playwright && npx playwright install chromium`) e do `ffmpeg` no PATH.
Opções: `npm run render -- --fps 30` e `npm run render -- --stills 2,8,20` (só capturas desses instantes, para conferir).

## Como funciona

- Tudo é função de um relógio só (`time`, um `MotionValue` em segundos). Cada elemento usa `useTransform` sobre ele, com as curvas do Órbita (`EASE` em `src/time.jsx`). Dentro de uma cena, `useTime()` devolve o tempo local (0 = início da cena).
- Ordem e duração das cenas em `src/timeline.js`: abertura · cores · tipografia · ícones · componentes (com a troca para o tema claro) · formulários e seleção · abas, menus, tooltips e modais · tabela e filtros · conversa e ⌘K · painel de gráficos · seis formas de gráfico · números · encerramento. As cenas ficam em `src/scenes/`.
- Os componentes usam as classes reais do DS; os ícones vêm de `ds/icons/icons.js` (os desenhados ganham `pathLength=1` e o traço anda com `--p`).
- Os gráficos são os de verdade (`ds/js/charts.js`) com os dados de exemplo do site (`site/chart-data.js`). A entrada deles é a animação CSS do próprio DS: o `main.jsx` pausa todas as animações CSS e posiciona cada uma pelo relógio, a partir do `data-anim-start` do gráfico. O tooltip aparece com eventos de ponteiro reais.
- Na prévia o relógio anda com `useAnimationFrame`; no `render.mjs` o Playwright posiciona o relógio quadro a quadro e manda as capturas para o ffmpeg. Por isso o MP4 sai sempre igual e sem quadros pulados. Transições de CSS ficam desligadas no vídeo.
