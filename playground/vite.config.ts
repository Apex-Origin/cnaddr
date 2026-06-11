import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Playground 直接消费已构建的库（运行前请先在根目录执行 `pnpm build`）。
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      cnaddr: fileURLToPath(new URL('../dist/index.js', import.meta.url)),
    },
  },
  server: { port: 5173, open: true },
});
