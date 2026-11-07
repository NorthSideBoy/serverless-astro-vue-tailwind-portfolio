/**
 * Theme-aware artwork without duplicate <img> elements.
 *
 * Server-rendered covers carry both URLs; this script keeps the visible one
 * pointed at the current `data-theme`. A single source means the hidden
 * variant is never downloaded, and the swap stays instant when the visitor
 * toggles the theme.
 */

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function applyThemeMedia() {
  const theme = currentTheme()

  document.querySelectorAll<HTMLImageElement>('img[data-theme-dark][data-theme-light]').forEach(
    (image) => {
      const next = theme === 'light' ? image.dataset.themeLight : image.dataset.themeDark
      if (next && image.getAttribute('src') !== next) image.setAttribute('src', next)
    },
  )
}

export function initThemeMedia() {
  if (typeof window === 'undefined') return

  applyThemeMedia()

  const themeObserver = new MutationObserver(applyThemeMedia)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  // Cards are replaced by filters and island hydration; keep every newly
  // rendered theme image pointed at the current source.
  let scheduled = 0
  const contentObserver = new MutationObserver(() => {
    if (scheduled) return
    scheduled = requestAnimationFrame(() => {
      scheduled = 0
      applyThemeMedia()
    })
  })
  contentObserver.observe(document.body, { childList: true, subtree: true })

  // Astro's client router (if adopted later) swaps the document body without
  // reloading; re-apply the source after each navigation.
  document.addEventListener('astro:page-load', applyThemeMedia)
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeMedia, { once: true })
  } else {
    initThemeMedia()
  }
}
