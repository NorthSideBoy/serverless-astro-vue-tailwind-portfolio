import { atom } from 'nanostores'

export type Theme = 'dark' | 'light'

const key = 'sl-theme'
const isBrowser = typeof window !== 'undefined'
const systemTheme = isBrowser && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-color-scheme: light)')
  : null

function storedTheme(): Theme | null {
  if (!isBrowser) return null
  try {
    const value = window.localStorage.getItem(key)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const saved = storedTheme()
let followsSystem = saved === null

// Only client actions mutate this atom; server prerendering always sees dark.
export const themeStore = atom<Theme>(saved ?? (systemTheme?.matches ? 'light' : 'dark'))

function applyTheme(value: Theme) {
  if (!isBrowser) return
  document.documentElement.dataset.theme = value
  document.documentElement.style.colorScheme = value
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', value === 'light' ? '#DCE6EB' : '#06090B')
}

if (isBrowser) {
  applyTheme(themeStore.get())
  themeStore.listen(applyTheme)
  systemTheme?.addEventListener('change', (event) => {
    if (followsSystem) themeStore.set(event.matches ? 'light' : 'dark')
  })
}

export function setTheme(value: Theme) {
  if (!isBrowser) return
  followsSystem = false
  themeStore.set(value)
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // The theme still applies for this visit when storage is unavailable.
  }
}

export function toggleTheme() {
  setTheme(themeStore.get() === 'dark' ? 'light' : 'dark')
}
