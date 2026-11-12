import type { Locale } from './content'

/** Canonical public paths. Every page URL ends with a slash. */
export function homePath(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/'
}

export function blogPath(locale: Locale): string {
  return locale === 'en' ? '/en/blog/' : '/blog/'
}

export function projectsPath(locale: Locale): string {
  return locale === 'en' ? '/en/projects/' : '/proyectos/'
}

export function reviewsPath(locale: Locale): string {
  return locale === 'en' ? '/en/reviews/' : '/resenas/'
}

export function reviewPanelPath(locale: Locale): string {
  return locale === 'en' ? '/en/reviews/panel/' : '/resenas/panel/'
}

export function articlePath(locale: Locale, slug: string): string {
  return `${blogPath(locale)}${slug}/`
}

export type PublicRouteName =
  | 'home'
  | 'projects'
  | 'blog'
  | 'article'
  | 'reviews'
  | 'review-panel'

export interface PublicRoute {
  name: PublicRouteName
  slug?: string
}

/**
 * Translate the locale-specific vocabulary of a pathname back to the Spanish
 * canonical segments. Matching happens on this normalized form so a route can
 * be recognized in either locale.
 */
function normalizeSegments(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/en(?=\/|$)/, '') || '/'

  switch (withoutLocale.replace(/\/$/, '')) {
    case '':
      return '/'
    case '/projects':
      return '/proyectos/'
    case '/reviews':
      return '/resenas/'
    case '/reviews/panel':
      return '/resenas/panel/'
    default:
      return withoutLocale.endsWith('/') ? withoutLocale : `${withoutLocale}/`
  }
}

/** Resolve a pathname in either locale to a named public route. */
export function matchPublicRoute(path: string): PublicRoute | null {
  const pathname = path.split(/[?#]/)[0] ?? path
  const normalized = normalizeSegments(pathname)

  if (normalized === '/') return { name: 'home' }
  if (normalized === '/proyectos/') return { name: 'projects' }
  if (normalized === '/blog/') return { name: 'blog' }
  if (normalized === '/resenas/') return { name: 'reviews' }
  if (normalized === '/resenas/panel/') return { name: 'review-panel' }

  const article = normalized.match(/^\/blog\/([^/]+)\/$/)
  if (article?.[1]) return { name: 'article', slug: decodeURIComponent(article[1]) }

  return null
}

/** Build the localized URL of a named public route. */
export function routePath(route: PublicRoute, locale: Locale): string | null {
  switch (route.name) {
    case 'home':
      return homePath(locale)
    case 'projects':
      return projectsPath(locale)
    case 'blog':
      return blogPath(locale)
    case 'reviews':
      return reviewsPath(locale)
    case 'review-panel':
      return reviewPanelPath(locale)
    case 'article':
      return route.slug ? articlePath(locale, route.slug) : null
  }
}

/**
 * Translate a pathname to the same page in `locale`. Known routes swap their
 * localized segments (`/proyectos/` ↔ `/en/projects/`); an unknown path keeps
 * the previous prefix-only behavior so redirects and utility URLs still work.
 */
export function alternateLocalePath(path: string, locale: Locale): string {
  const route = matchPublicRoute(path)
  const localized = route ? routePath(route, locale) : null
  if (localized) return localized

  if (locale === 'en') {
    if (path === '/en' || path.startsWith('/en/')) return path
    return path === '/' ? '/en/' : `/en${path}`
  }

  return path.replace(/^\/en(?=\/|$)/, '') || '/'
}
