import { defineComponent, h, type Component, type PropType } from 'vue'
import type { Locale } from '@/data/content'
import { providePreferences } from '@/composables/usePreferences'
import { provideRoute } from '@/router/astroRouter'

type Page = 'home' | 'projects' | 'blog' | 'article' | 'not-found'

/** Give each independently hydrated Vue root its own page context. */
export function withIslandContext(view: Component) {
  return defineComponent({
    props: {
      locale: { type: String as PropType<Locale>, required: true },
      page: { type: String as PropType<Page>, default: 'home' },
      path: String,
      content: Object as PropType<Record<string, unknown>>,
    },
    setup(props, { slots }) {
      providePreferences(props.locale)
      provideRoute(props.page, props.locale, props.path)
      // Forward Astro-rendered children to Vue's <slot /> when a feature needs
      // static HTML inside an interactive shell.
      return () => h(view, props.content ?? {}, slots)
    },
  })
}
