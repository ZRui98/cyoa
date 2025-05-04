import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      fallback: 'index.html',
      strict: true,
    }),
    alias: {
      '@backend/models/*': '../server/src/models/*',
      '@backend/utils/*': '../server/src/util/*',
    },
  },
};

export default config;
