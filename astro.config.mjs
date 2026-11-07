// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [vue(), sitemap()],
  site: process.env.SITE_URL || 'https://northsideboy-portfolio.web.app',
  redirects: { '/projects': '/proyectos' },
  vite: {
    plugins: [tailwindcss()],
  },
});
