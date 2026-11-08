import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { withIslandContext } from '../src/lib/withIslandContext'
import { usePreferences } from '../src/composables/usePreferences'
import { useRoute } from '../src/router/astroRouter'

describe('independent Astro islands', () => {
  it('renders each locale and route with its own server-side context', async () => {
    const View = defineComponent({
      setup() {
        const { locale, theme } = usePreferences()
        const route = useRoute()
        return () => h('span', `${locale.value}:${route.path}:${theme.value}`)
      },
    })
    const Island = withIslandContext(View)

    const english = await renderToString(createSSRApp(Island, {
      locale: 'en', page: 'projects', path: '/en/proyectos',
    }))
    const spanish = await renderToString(createSSRApp(Island, {
      locale: 'es', page: 'home', path: '/',
    }))

    expect(english).toContain('en:/en/proyectos:dark')
    expect(spanish).toContain('es:/:dark')
  })

  it('forwards static children to a named slot in an interactive shell', async () => {
    const Footer = defineComponent({
      setup(_, { slots }) {
        return () => h('footer', slots.contact?.())
      },
    })
    const Island = withIslandContext(Footer)
    const app = createSSRApp({
      render: () => h(Island, { locale: 'es' }, {
        contact: () => h('a', { href: 'mailto:hello@example.com' }, 'Contacto'),
      }),
    })

    expect(await renderToString(app)).toContain('<footer><a href="mailto:hello@example.com">Contacto</a></footer>')
  })
})
