import { articleReadTime } from '@/data/articleUtils'
import { projectAnchor } from '@/data/anchors'
import type { Locale, SiteContent } from '@/data/content'
import { articlePath, blogPath, homePath, projectsPath } from '@/data/paths'
import type { Project } from '@/data/projects'
import type {
  Article,
  ArticleLang,
  ArticleTranslation,
} from '@/data/schemas/article'

export type JsonLd = Record<string, unknown>

type LocalizedArticleTranslation = ArticleTranslation & { lang: ArticleLang }

export function absoluteUrl(path: string, site: URL): string {
  return new URL(path, site).href
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function ogLocale(locale: Locale): string {
  return locale === 'es' ? 'es_VE' : 'en_US'
}

/**
 * Open Graph consumers are inconsistent with SVG/WebP/AVIF covers. Use the
 * default PNG when the editorial cover is not a broadly supported raster.
 */
export function isSocialRaster(src: string): boolean {
  return /\.(png|jpe?g)(?:[?#].*)?$/i.test(src)
}

const personId = (site: URL) => absoluteUrl('/#person', site)
const websiteId = (site: URL) => absoluteUrl('/#website', site)

function websiteNode(site: URL, locale: Locale, copy: SiteContent): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': websiteId(site),
    url: absoluteUrl(homePath(locale), site),
    name: copy.seo.alternateName,
    alternateName: copy.seo.personName,
    description: copy.meta.description,
    inLanguage: locale,
    publisher: { '@id': personId(site) },
  }
}

function personNode(
  site: URL,
  locale: Locale,
  copy: SiteContent,
  knowsAbout?: string[],
): JsonLd {
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: copy.seo.personName,
    alternateName: copy.seo.alternateName,
    jobTitle: copy.seo.jobTitle,
    url: absoluteUrl(homePath(locale), site),
    email: copy.seo.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: copy.seo.locality,
      addressCountry: copy.seo.country,
    },
    sameAs: copy.seo.sameAs,
    ...(knowsAbout?.length ? { knowsAbout } : {}),
  }
}

function blogNode(
  site: URL,
  locale: Locale,
  title: string,
  description: string,
): JsonLd {
  const url = absoluteUrl(blogPath(locale), site)

  return {
    '@type': 'Blog',
    '@id': `${url}#blog`,
    url,
    name: title,
    description,
    inLanguage: locale,
    publisher: { '@id': personId(site) },
    isPartOf: { '@id': websiteId(site) },
  }
}

interface CollectionItem {
  url: string
  name: string
}

function collectionPage(
  site: URL,
  locale: Locale,
  path: string,
  title: string,
  description: string,
  items: CollectionItem[],
): JsonLd {
  const url = absoluteUrl(path, site)

  return {
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name: title,
    description,
    isPartOf: { '@id': websiteId(site) },
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      '@id': `${url}#items`,
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    },
  }
}

export function buildHomeGraph({
  site,
  locale,
  copy,
  knowsAbout,
}: {
  site: URL
  locale: Locale
  copy: SiteContent
  knowsAbout?: string[]
}): JsonLd {
  const homeUrl = absoluteUrl(homePath(locale), site)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      websiteNode(site, locale, copy),
      personNode(site, locale, copy, knowsAbout),
      {
        '@type': 'ProfilePage',
        '@id': `${homeUrl}#profile`,
        url: homeUrl,
        name: copy.meta.title,
        description: copy.meta.description,
        isPartOf: { '@id': websiteId(site) },
        mainEntity: { '@id': personId(site) },
        inLanguage: locale,
      },
    ],
  }
}

/** `articles` must already be scoped to `locale` with `articlesForLocale`. */
export function buildBlogGraph({
  site,
  locale,
  copy,
  articles,
  title,
  description,
}: {
  site: URL
  locale: Locale
  copy: SiteContent
  articles: readonly Article[]
  title: string
  description: string
}): JsonLd {
  const items = articles.map((article) => {
    const translation = article.translations[locale]
    if (!translation) {
      throw new Error(`Article ${article.slug} has no ${locale} translation`)
    }

    return {
      url: absoluteUrl(articlePath(locale, article.slug), site),
      name: translation.title,
    }
  })

  return {
    '@context': 'https://schema.org',
    '@graph': [
      websiteNode(site, locale, copy),
      personNode(site, locale, copy),
      collectionPage(site, locale, blogPath(locale), title, description, items),
    ],
  }
}

export function buildProjectsGraph({
  site,
  locale,
  copy,
  projects,
  title,
  description,
}: {
  site: URL
  locale: Locale
  copy: SiteContent
  projects: readonly Project[]
  title: string
  description: string
}): JsonLd {
  const projectsUrl = absoluteUrl(projectsPath(locale), site)
  const items = projects.map((project) => ({
    url: `${projectsUrl}#${projectAnchor(project.slug)}`,
    name: project.title[locale],
  }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      websiteNode(site, locale, copy),
      personNode(site, locale, copy),
      collectionPage(site, locale, projectsPath(locale), title, description, items),
    ],
  }
}

export function buildBreadcrumbList({
  site,
  locale,
  copy,
  articleTitle,
  blogTitle,
  articleUrl,
}: {
  site: URL
  locale: Locale
  copy: SiteContent
  articleTitle: string
  blogTitle: string
  articleUrl: string
}): JsonLd {
  const blogUrl = absoluteUrl(blogPath(locale), site)

  return {
    '@type': 'BreadcrumbList',
    '@id': `${articleUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: copy.nav.homeBreadcrumb,
        item: absoluteUrl(homePath(locale), site),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: blogTitle,
        item: blogUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: articleTitle,
        item: articleUrl,
      },
    ],
  }
}

export function buildArticleGraph({
  site,
  locale,
  copy,
  article,
  translation,
  blogTitle,
  blogDescription,
}: {
  site: URL
  locale: Locale
  copy: SiteContent
  article: Article
  translation: LocalizedArticleTranslation
  blogTitle: string
  blogDescription: string
}): JsonLd {
  const articleUrl = absoluteUrl(articlePath(locale, article.slug), site)
  const blogUrl = absoluteUrl(blogPath(locale), site)
  const coverUrl = isSocialRaster(article.cover.src)
    ? absoluteUrl(article.cover.src, site)
    : absoluteUrl('/og-default.png', site)
  const author =
    article.author.name === copy.seo.personName
      ? { '@id': personId(site) }
      : { '@type': 'Person', name: article.author.name }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      websiteNode(site, locale, copy),
      personNode(site, locale, copy),
      blogNode(site, locale, blogTitle, blogDescription),
      {
        '@type': 'BlogPosting',
        '@id': `${articleUrl}#article`,
        url: articleUrl,
        mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
        headline: translation.title,
        description: translation.excerpt,
        image: [coverUrl],
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author,
        publisher: { '@id': personId(site) },
        isPartOf: { '@id': `${blogUrl}#blog` },
        inLanguage: locale,
        articleSection: translation.category,
        timeRequired: `PT${articleReadTime(translation)}M`,
      },
      buildBreadcrumbList({
        site,
        locale,
        copy,
        articleTitle: translation.title,
        blogTitle,
        articleUrl,
      }),
    ],
  }
}
