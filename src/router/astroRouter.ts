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

type Page = 'home' | 'projects' | 'blog' | 'article' | 'not-found'
type Destination = string | { path?: string; name?: Page; hash?: string; query?: Record<string, string> }
type Route = { name: Page; path: string; hash: string; fullPath: string; query: Record<string, string>; locale: Locale }

const routeKey: InjectionKey<Route> = Symbol('astroRoute')

export function provideRoute(page: Page, locale: Locale, pagePath?: string) {
  const path =
    pagePath ??
    (typeof window === 'undefined' ? (page === 'home' ? '/' : `/${page}`) : window.location.pathname)
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
  if (typeof to === 'string') return to.startsWith('#') ? currentPath + to : (locale === 'en' && to.startsWith('/') ? `/en${to === '/' ? '/' : to}` : to)
  const named = to.name === 'projects' ? '/proyectos' : to.name === 'blog' ? '/blog' : '/'
  const path = to.path ?? (to.name ? named : currentPath)
  const localized = locale === 'en' && path.startsWith('/') && path !== '/en' && !path.startsWith('/en/') ? `/en${path === '/' ? '/' : path}` : path
  return localized + (to.hash ?? '')
}

export function useRouter() {
  const route = useRoute()
  return {
    async replace(to: Destination) {
      if (typeof window === 'undefined') return
      const href = toHref(to, route.locale, route.path)
      window.history.replaceState(window.history.state, '', href)
      route.hash = window.location.hash
      route.fullPath = window.location.pathname + route.hash
    },
  }
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
