import { articlesForLocale } from '@/data/articleUtils'
import type { Locale } from '@/data/content'
import { articlePath, blogPath, homePath, projectsPath } from '@/data/paths'
import type { Article } from '@/data/schemas/article'

export interface SitemapEntry {
  loc: string
  lastmod?: string
  group: string
  locale: Locale
}

export function sitemapEntries({
  site,
  articles,
}: {
  site: URL
  articles: readonly Article[]
}): SitemapEntry[] {
  const entries: SitemapEntry[] = []

  for (const locale of ['es', 'en'] as const) {
    entries.push({
      loc: new URL(homePath(locale), site).href,
      group: 'home',
      locale,
    })
    entries.push({
      loc: new URL(projectsPath(locale), site).href,
      group: 'projects',
      locale,
    })

    const localized = articlesForLocale(articles, locale)
    if (localized.length) {
      const lastmod = localized
        .map((article) => article.updatedAt)
        .sort()
        .at(-1)

      entries.push({
        loc: new URL(blogPath(locale), site).href,
        lastmod,
        group: 'blog',
        locale,
      })
    }

    for (const article of localized) {
      entries.push({
        loc: new URL(articlePath(locale, article.slug), site).href,
        lastmod: article.updatedAt,
        group: `article:${article.slug}`,
        locale,
      })
    }
  }

  return entries
}

export function buildSitemapXml(entries: readonly SitemapEntry[]): string {
  const groups = new Map<string, SitemapEntry[]>()

  for (const entry of entries) {
    const group = groups.get(entry.group) ?? []
    group.push(entry)
    groups.set(entry.group, group)
  }

  const urls = entries.map((entry) => {
    const group = groups.get(entry.group) ?? []
    const hasAlternates = group.length > 1
    const alternates = hasAlternates
      ? group
          .map(
            (alternate) =>
              `<xhtml:link rel="alternate" hreflang="${alternate.locale}" href="${escapeXml(alternate.loc)}" />`,
          )
          .join('')
      : ''
    const spanish = group.find((alternate) => alternate.locale === 'es')
    const xDefault =
      hasAlternates && spanish
        ? `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(spanish.loc)}" />`
        : ''
    const lastmod = entry.lastmod
      ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
      : ''

    return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmod}${alternates}${xDefault}</url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
