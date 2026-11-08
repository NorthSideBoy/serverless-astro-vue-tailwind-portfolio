import type { APIRoute } from 'astro'
import { escapeXml } from '@/lib/sitemap'

export const prerender = true

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('SITE_URL is required to generate the sitemap index')

  const sitemapURL = new URL('sitemap-0.xml', site)
  const body = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${escapeXml(sitemapURL.href)}</loc></sitemap></sitemapindex>`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
