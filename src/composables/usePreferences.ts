import { computed, inject, onBeforeUnmount, onMounted, provide, shallowRef, type InjectionKey } from 'vue'
import { content, type Locale } from '@/data/content'
import { setTheme, themeStore, toggleTheme, type Theme } from '@/stores/theme'

export type { Theme } from '@/stores/theme'

type Preferences = ReturnType<typeof createPagePreferences>
const pagePreferencesKey: InjectionKey<Preferences> = Symbol('pagePreferences')

function useTheme() {
  // Match the dark HTML emitted at build time for the first client render.
  // Once mounted, subscribe to the visitor's stored or system preference.
  const theme = shallowRef<Theme>('dark')
  let unsubscribe: (() => void) | undefined
  onMounted(() => {
    unsubscribe = themeStore.subscribe((value) => { theme.value = value })
  })
  onBeforeUnmount(() => unsubscribe?.())
  return theme
}

function createPagePreferences(initialLocale: Locale) {
  const pageLocale = shallowRef(initialLocale)
  const theme = useTheme()
  function changeLocale(value: Locale) {
    if (typeof window === 'undefined' || value === pageLocale.value) return
    const path = window.location.pathname.replace(/^\/en(?=\/|$)/, '') || '/'
    // Keep the visitor where they were reading: the fragment is part of the
    // address, and the exact offset is carried through session storage so a
    // language switch behaves like the in-place switch in the Vue app rather
    // than a trip back to the top.
    const hash = window.location.hash
    try {
      if (window.scrollY > 0) {
        window.sessionStorage.setItem(
          'sl-locale-scroll',
          JSON.stringify({ y: window.scrollY, at: Date.now() }),
        )
      }
    } catch {
      // Storage may be disabled; the hash still preserves the section.
    }
    window.location.assign(`${value === 'en' ? `/en${path}` : path}${hash}`)
  }
  return {
    theme,
    locale: pageLocale,
    copy: computed(() => content[pageLocale.value]),
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
    toggleTheme,
    setLocale: changeLocale,
    toggleLocale: () => changeLocale(pageLocale.value === 'es' ? 'en' : 'es'),
  }
}

export function providePreferences(pageLocale: Locale) {
  provide(pagePreferencesKey, createPagePreferences(pageLocale))
}

export function usePreferences() {
  const preferences = inject(pagePreferencesKey, null)
  if (!preferences) throw new Error('usePreferences requires a page island context')
  return preferences
}
