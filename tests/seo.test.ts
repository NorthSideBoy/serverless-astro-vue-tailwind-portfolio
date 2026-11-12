import { describe, expect, it } from 'vitest'
import { articlesForLocale } from '../src/data/articleUtils'
import { content } from '../src/data/content'
import { loadFixtureContent } from '../src/lib/server/fixtures'
import {
  buildArticleGraph,
  buildBlogGraph,
  buildHomeGraph,
  buildProjectsGraph,
  isSocialRaster,
  serializeJsonLd,
} from '../src/lib/seo'
import { buildSitemapXml, sitemapEntries } from '../src/lib/sitemap'

const site = new URL('https://fixture.example.test')
const fixture = loadFixtureContent()
const bilingual = fixture.articles.find((article) => article.slug === 'fixture-article')!
const spanishOnly = {
  ...bilingual,
  slug: 'solo-es',
  translations: { es: bilingual.translations.es! },
}
const englishOnly = {
  ...bilingual,
  slug: 'solo-en',
  translations: { en: bilingual.translations.en! },
}

function graphNodes(graph: Record<string, unknown>): Record<string, unknown>[] {
  return graph['@graph'] as Record<string, unknown>[]
}

function typeOf(node: Record<string, unknown>): string {
  return String(node['@type'])
}

describe('locale-specific article routes', () => {
  it('only returns articles with a translation for the requested locale', () => {
    expect(articlesForLocale([spanishOnly, englishOnly, bilingual], 'es'))
      .toHaveLength(2)
    expect(articlesForLocale([spanishOnly, englishOnly, bilingual], 'en'))
      .toHaveLength(2)
    expect(articlesForLocale([spanishOnly], 'en')).toHaveLength(0)
  })
})

describe('JSON-LD builders', () => {
  it('serializes safely inside a script tag', () => {
    const serialized = serializeJsonLd({ value: '</script><script>alert(1)</script>' })
    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003c')
  })

  it('builds the home profile graph', () => {
    const graph = buildHomeGraph({
      site,
      locale: 'es',
      copy: content.es,
      knowsAbout: ['TypeScript'],
    })
    const nodes = graphNodes(graph)
    expect(nodes.map(typeOf)).toEqual(
      expect.arrayContaining(['WebSite', 'Person', 'ProfilePage']),
    )
    const person = nodes.find((node) => typeOf(node) === 'Person')!
    expect(person['@id']).toBe('https://fixture.example.test/#person')
    expect(person.knowsAbout).toEqual(['TypeScript'])
  })

  it('builds article, blog and projects graphs', () => {
    const translation = { ...bilingual.translations.es!, lang: 'es' as const }
    const articleGraph = buildArticleGraph({
      site,
      locale: 'es',
      copy: content.es,
      article: bilingual,
      translation,
      blogTitle: 'Blog',
      blogDescription: 'Fixture blog',
    })
    const articleNodes = graphNodes(articleGraph)
    const posting = articleNodes.find((node) => typeOf(node) === 'BlogPosting')!
    expect(posting.headline).toBe('Artículo de prueba')
    expect(posting.inLanguage).toBe('es')
    expect(posting.image).toEqual([
      'https://fixture.example.test/images/fixture/cover.png',
    ])
    expect(posting.dateModified).toBe('2024-01-02')
    expect(posting.author).toEqual({ '@type': 'Person', name: 'Fixture Author' })
    expect(articleNodes.map(typeOf)).toContain('BreadcrumbList')

    expect(isSocialRaster('cover.png')).toBe(true)
    expect(isSocialRaster('cover.jpeg')).toBe(true)
    expect(isSocialRaster('cover.svg')).toBe(false)
    expect(isSocialRaster('cover.webp')).toBe(false)

    const svgArticle = {
      ...bilingual,
      cover: { ...bilingual.cover, src: '/images/fixture/cover.svg' },
    }
    const svgGraph = buildArticleGraph({
      site,
      locale: 'es',
      copy: content.es,
      article: svgArticle,
      translation,
      blogTitle: 'Blog',
      blogDescription: 'Fixture blog',
    })
    const svgPosting = graphNodes(svgGraph).find(
      (node) => typeOf(node) === 'BlogPosting',
    )!
    expect(svgPosting.image).toEqual([
      'https://fixture.example.test/og-default.png',
    ])

    const blogGraph = buildBlogGraph({
      site,
      locale: 'es',
      copy: content.es,
      articles: [bilingual],
      title: 'Blog',
      description: 'Fixture blog',
    })
    const blogPage = graphNodes(blogGraph).find(
      (node) => typeOf(node) === 'CollectionPage',
    )!
    expect(blogPage.mainEntity).toMatchObject({
      '@type': 'ItemList',
      numberOfItems: 1,
    })

    expect(() =>
      buildBlogGraph({
        site,
        locale: 'es',
        copy: content.es,
        articles: [englishOnly],
        title: 'Blog',
        description: 'Fixture blog',
      }),
    ).toThrow('has no es translation')

    const projectsGraph = buildProjectsGraph({
      site,
      locale: 'es',
      copy: content.es,
      projects: fixture.projects,
      title: 'Proyectos',
      description: 'Fixture projects',
    })
    const projectsPage = graphNodes(projectsGraph).find(
      (node) => typeOf(node) === 'CollectionPage',
    )!
    expect(projectsPage.mainEntity).toMatchObject({
      '@type': 'ItemList',
      numberOfItems: 2,
    })
  })
})

describe('sitemap', () => {
  it('includes lastmod, hreflang and only indexable routes', () => {
    const xml = buildSitemapXml(
      sitemapEntries({
        site,
        articles: [bilingual, spanishOnly, englishOnly],
      }),
    )

    expect(xml).toContain('https://fixture.example.test/blog/fixture-article/')
    expect(xml).toContain('https://fixture.example.test/en/blog/fixture-article/')
    expect(xml).toContain('<lastmod>2024-01-02</lastmod>')
    expect(xml).toContain('hreflang="es"')
    expect(xml).toContain('hreflang="en"')
    expect(xml).toContain('hreflang="x-default"')
    expect(xml).toContain('https://fixture.example.test/proyectos/')
    expect(xml).toContain('https://fixture.example.test/en/projects/')
    expect(xml).not.toContain('https://fixture.example.test/projects/')
    expect(xml).not.toContain('/resenas/')
    expect(xml).not.toContain('/reviews/')
    expect(xml).not.toContain('/404')

    const spanishOnlyEntry = xml.match(
      /<url><loc>https:\/\/fixture\.example\.test\/blog\/solo-es\/<\/loc>.*?<\/url>/,
    )?.[0]
    expect(spanishOnlyEntry).toBeDefined()
    expect(spanishOnlyEntry).not.toContain('xhtml:link')

    const englishOnlyEntry = xml.match(
      /<url><loc>https:\/\/fixture\.example\.test\/en\/blog\/solo-en\/<\/loc>.*?<\/url>/,
    )?.[0]
    expect(englishOnlyEntry).toBeDefined()
    expect(englishOnlyEntry).not.toContain('xhtml:link')
  })
})
