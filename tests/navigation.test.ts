import { describe, expect, it } from 'vitest'
import { toHref } from '../src/router/astroRouter'
import {
  alternateLocalePath,
  matchPublicRoute,
  reviewPanelPath,
} from '../src/data/paths'

describe('links between Astro pages and Vue islands', () => {
  it('localizes named routes and keeps the trailing slash', () => {
    expect(toHref({ name: 'projects', hash: '#project-example' }, 'en', '/en/'))
      .toBe('/en/projects/#project-example')
    expect(toHref({ name: 'blog' }, 'es', '/'))
      .toBe('/blog/')
    expect(toHref({ name: 'article', slug: 'example' }, 'en', ''))
      .toBe('/en/blog/example/')
  })

  it('localizes explicit paths with locale-specific segments', () => {
    expect(toHref('/blog/example/', 'en', '/en/')).toBe('/en/blog/example/')
    expect(toHref('/en/blog/example/', 'en', '/en/')).toBe('/en/blog/example/')
    expect(toHref('/proyectos/', 'en', '/')).toBe('/en/projects/')
    expect(toHref('/resenas/panel/', 'en', '/resenas/panel/'))
      .toBe('/en/reviews/panel/')
  })

  it('preserves native fragments and the Spanish root', () => {
    expect(toHref('#contact', 'en', '/en/')).toBe('/en/#contact')
    expect(toHref({ name: 'home', hash: '#experience' }, 'es', '/proyectos/'))
      .toBe('/#experience')
  })
})

describe('locale-aware route paths', () => {
  it('matches a path in either locale to the same route', () => {
    expect(matchPublicRoute('/proyectos/')).toEqual({ name: 'projects' })
    expect(matchPublicRoute('/en/projects/')).toEqual({ name: 'projects' })
    expect(matchPublicRoute('/en/reviews/panel/')).toEqual({ name: 'review-panel' })
    expect(matchPublicRoute('/blog/hello-world/')).toEqual({
      name: 'article',
      slug: 'hello-world',
    })
    expect(matchPublicRoute('/en/blog/hello-world/')).toEqual({
      name: 'article',
      slug: 'hello-world',
    })
  })

  it('swaps localized segments in both directions', () => {
    expect(alternateLocalePath('/proyectos/', 'en')).toBe('/en/projects/')
    expect(alternateLocalePath('/en/projects/', 'es')).toBe('/proyectos/')
    expect(alternateLocalePath('/resenas/', 'en')).toBe('/en/reviews/')
    expect(alternateLocalePath('/en/reviews/panel/', 'es')).toBe('/resenas/panel/')
    expect(alternateLocalePath('/en/blog/hello-world/', 'es')).toBe('/blog/hello-world/')
    expect(reviewPanelPath('en')).toBe('/en/reviews/panel/')
  })

  it('falls back to prefixing unknown utility paths', () => {
    expect(alternateLocalePath('/en/sitemap-0.xml', 'es')).toBe('/sitemap-0.xml')
    expect(alternateLocalePath('/en/privacidad/', 'es')).toBe('/privacidad/')
  })
})
