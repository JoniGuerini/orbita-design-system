# Vídeo do Órbita

Vídeo de apresentação do Órbita (39,5 s, 1920×1080, 60 fps) feito em **React + [Motion](https://motion.dev)**.
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

- Tudo é função de um relógio só (`time`, um `MotionValue` em segundos). Cada elemento usa `useTransform` sobre ele, com as curvas do Órbita (`EASE` em `src/time.jsx`).
- Na prévia o relógio anda com `useAnimationFrame`; no `render.mjs` o Playwright posiciona o relógio quadro a quadro e manda as capturas para o ffmpeg. Por isso o MP4 sai sempre igual e sem quadros pulados. Transições de CSS ficam desligadas no vídeo.
- Cenas e tempos em `src/scenes.jsx` (`TIMELINE`): abertura · cores · tipografia · componentes (com a troca para o tema claro abrindo do segmentado) · gráficos · números · encerramento.
