import type { APIRoute } from 'astro'
import { loadContent } from '@/lib/server/content'
import { buildSitemapXml, sitemapEntries } from '@/lib/sitemap'

export const prerender = true

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('SITE_URL is required to generate the sitemap')

  const data = await loadContent()
  const body = buildSitemapXml(sitemapEntries({ site, articles: data.articles }))

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
