/**
 * Renderiza o vídeo quadro a quadro: sobe o Vite, abre a página com ?render,
 * posiciona o relógio em cada quadro, tira a captura e manda para o ffmpeg.
 *
 *   npm run render                      → out/orbita.mp4 (1920×1080, 60 fps)
 *   npm run render -- --fps 30          → outra taxa de quadros
 *   npm run render -- --stills 2,8,20   → só capturas desses instantes (out/still-*.png)
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import { createRequire } from 'node:module';

// Playwright: o do projeto ou um instalado globalmente (NODE_PATH)
const { chromium } = createRequire(import.meta.url)('playwright');

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const FPS = Number(opt('fps', 60));
const SCALE = 1.5; // palco 1280×720 → 1920×1080
const stills = opt('stills');
const outDir = new URL('./out/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const server = await createServer({ configFile: new URL('./vite.config.js', import.meta.url).pathname, server: { port: 5181 }, logLevel: 'error' });
await server.listen();
const url = `http://localhost:${server.config.server.port}/?render`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: SCALE });
await page.goto(url);
await page.waitForFunction(() => window.__ready && window.__seek);
const duration = await page.evaluate(() => window.__duration);

const frame = async (t) => {
  await page.evaluate(
    (t) =>
      new Promise((resolve) => {
        window.__seek(t);
        // um quadro para o Motion escrever no DOM, outro para o React assentar estados
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
    t,
  );
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1280, height: 720 } });
};

if (stills) {
  for (const t of stills.split(',').map(Number)) {
    const png = await frame(t);
    const file = `${outDir}still-${String(t).replace('.', '_')}.png`;
    (await import('node:fs')).writeFileSync(file, png);
    console.log(file);
  }
} else {
  const total = Math.round(duration * FPS);
  const file = `${outDir}orbita.mp4`;
  const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => ffmpeg.on('close', (code) => (code ? reject(new Error(`ffmpeg saiu com ${code}`)) : resolve())));
  for (let i = 0; i < total; i++) {
    const png = await frame(i / FPS);
    if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
    if (i % FPS === 0) process.stdout.write(`\r${Math.round((i / total) * 100)}%`);
  }
  ffmpeg.stdin.end();
  await done;
  console.log(`\r${file}`);
}

await browser.close();
await server.close();
