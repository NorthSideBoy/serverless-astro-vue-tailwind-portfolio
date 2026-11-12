import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  reactive,
  type InjectionKey,
} from 'vue'
import type { Locale } from '@/data/content'
import {
  alternateLocalePath,
  articlePath,
  blogPath,
  homePath,
  projectsPath,
  reviewPanelPath,
  reviewsPath,
} from '@/data/paths'

type Page = 'home' | 'projects' | 'blog' | 'article' | 'reviews' | 'review-panel' | 'not-found'
type Destination = string | {
  path?: string
  name?: Page
  slug?: string
  hash?: string
  query?: Record<string, string>
}
type Route = { name: Page; path: string; hash: string; fullPath: string; query: Record<string, string>; locale: Locale }

const routeKey: InjectionKey<Route> = Symbol('astroRoute')

export function provideRoute(page: Page, locale: Locale, pagePath?: string) {
  const path =
    pagePath ??
    (typeof window === 'undefined'
      ? page === 'home'
        ? homePath('es')
        : page === 'projects'
          ? projectsPath('es')
          : page === 'blog'
            ? blogPath('es')
            : page === 'reviews'
              ? reviewsPath('es')
              : page === 'review-panel'
                ? reviewPanelPath('es')
                : '/'
      : window.location.pathname)
  const hash = typeof window === 'undefined' ? '' : window.location.hash
  const route = reactive({ name: page, path, hash, fullPath: path + hash, query: {}, locale })
  provide(routeKey, route)

  if (typeof window === 'undefined') return

  // Native anchor navigation updates the URL fragment without going through
  // this router. Keep the reactive route in sync so hash-driven UI (reviews,
  // deep links) sees the fragment the visitor just followed.
  const syncFromLocation = () => {
    route.path = window.location.pathname
    route.hash = window.location.hash
    route.fullPath = route.path + route.hash
  }

  window.addEventListener('hashchange', syncFromLocation)
  onBeforeUnmount(() => window.removeEventListener('hashchange', syncFromLocation))
}

export function useRoute(): Route {
  return inject(routeKey, reactive({ name: 'home' as Page, path: '/', hash: '', fullPath: '/', query: {}, locale: 'es' as Locale }))
}

export function toHref(to: Destination, locale: Locale, currentPath: string): string {
  if (typeof to === 'string') {
    if (to.startsWith('#')) return currentPath + to
    if (locale !== 'en' || !to.startsWith('/')) return to

    return alternateLocalePath(to, 'en')
  }

  const namedPath =
    to.name === 'projects'
      ? projectsPath(locale)
      : to.name === 'blog'
        ? blogPath(locale)
        : to.name === 'article' && to.slug
          ? articlePath(locale, to.slug)
          : to.name === 'reviews'
            ? reviewsPath(locale)
            : to.name === 'review-panel'
              ? reviewPanelPath(locale)
              : to.name === 'home'
                ? homePath(locale)
                : undefined

  const rawPath = to.path ?? namedPath ?? currentPath
  const localized =
    to.path && locale === 'en' ? alternateLocalePath(rawPath, 'en') : rawPath

  return localized + (to.hash ?? '')
}

export const RouterLink = defineComponent({
  name: 'RouterLink',
  inheritAttrs: false,
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots, attrs }) {
    const route = useRoute()
    const href = computed(() => toHref(props.to as Destination, route.locale, route.path))
    return () => h('a', { ...attrs, href: href.value }, slots.default?.())
  },
})
