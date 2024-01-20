import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import * as fs from 'fs';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync('../ssl/domain.key'),
      cert: fs.readFileSync('../ssl/domain.crt'),
    },
    hmr: {
      host: 'localtest.me',
      port: 5111,
      clientPort: 5111,
      protocol: 'wss',
    },
    fs: {
      allow: ['./static'],
    },
  },
});
