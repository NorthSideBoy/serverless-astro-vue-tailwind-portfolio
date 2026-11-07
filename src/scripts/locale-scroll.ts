/**
 * Preserve the reading offset across the URL-based locale switch.
 *
 * The Vue original swapped language in place, so the visitor stayed exactly
 * where they were. Astro navigates to /en or back, which resets scroll; this
 * one-shot restore keeps the reading position while still leaving a real URL.
 */

const KEY = 'sl-locale-scroll'
const MAX_AGE = 10_000

function restore() {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return

    window.sessionStorage.removeItem(KEY)
    const saved = JSON.parse(raw) as { y?: number; at?: number }
    if (typeof saved.y !== 'number' || typeof saved.at !== 'number') return
    if (Date.now() - saved.at > MAX_AGE) return

    window.scrollTo({ top: saved.y, behavior: 'auto' })
  } catch {
    // A disabled or full storage is not a reason to break the page.
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    requestAnimationFrame(restore)
  } else {
    window.addEventListener(
      'load',
      () => {
        requestAnimationFrame(restore)
      },
      { once: true },
    )
  }
}
