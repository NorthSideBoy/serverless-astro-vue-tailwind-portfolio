import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site, url }) => {
  const origin = site ?? url.origin;
  const sitemapURL = new URL('sitemap-index.xml', origin);

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${sitemapURL.href}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
