import { computed, inject, onBeforeUnmount, onMounted, provide, shallowRef, type InjectionKey } from 'vue'
import { content, type Locale } from '@/data/content'
import { themeStore, type Theme } from '@/stores/theme'

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
  return {
    theme,
    locale: pageLocale,
    copy: computed(() => content[pageLocale.value]),
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
