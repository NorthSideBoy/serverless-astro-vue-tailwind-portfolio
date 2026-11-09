import type { Locale } from './content'

/** Canonical public paths. Every page URL ends with a slash. */
export function homePath(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/'
}

export function blogPath(locale: Locale): string {
  return locale === 'en' ? '/en/blog/' : '/blog/'
}

export function projectsPath(locale: Locale): string {
  return locale === 'en' ? '/en/proyectos/' : '/proyectos/'
}

export function reviewsPath(locale: Locale): string {
  return locale === 'en' ? '/en/resenas/' : '/resenas/'
}

export function reviewPanelPath(locale: Locale): string {
  return locale === 'en' ? '/en/resenas/panel/' : '/resenas/panel/'
}

export function articlePath(locale: Locale, slug: string): string {
  return `${blogPath(locale)}${slug}/`
}
