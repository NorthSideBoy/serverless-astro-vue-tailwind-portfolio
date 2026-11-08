// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL;

if (!site) {
  throw new Error(
    'SITE_URL is required. Set it in .env, in the production environment, and in build:fixture.',
  );
}

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  site,
  trailingSlash: 'always',
  redirects: { '/projects': '/proyectos/' },
  vite: {
    plugins: [tailwindcss()],
  },
});
