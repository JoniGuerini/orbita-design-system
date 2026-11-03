import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O vídeo importa o CSS e os ícones reais do Órbita (../ds), por isso o servidor pode ler a pasta de cima.
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, fs: { allow: ['..'] } },
});
