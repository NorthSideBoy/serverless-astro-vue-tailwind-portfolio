/**
 * Shared scroll state for router navigation and the header's scroll spy.
 */
const HASH_SYNC_HOLD_MS = 1200

let hashSyncHoldUntil = 0

export const scrollControl = {
  /**
   * Set while the header rewrites the hash in the background. The router must
   * not treat that bookkeeping as a reason to move the page.
   */
  preserve: false,

  /**
   * Pausing the scroll spy while a navigation scroll is running prevents the
   * address bar from rewriting the destination mid-flight, which used to
   * supersede the user's click with the section they were leaving.
   */
  holdHashSync(duration = HASH_SYNC_HOLD_MS) {
    hashSyncHoldUntil = Date.now() + duration
  },

  get hashSyncHeld() {
    return Date.now() < hashSyncHoldUntil
  },

  reset() {
    this.preserve = false
    hashSyncHoldUntil = 0
  },
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * One smooth path back to the top for the header and footer seals.
 */
export function scrollToTop() {
  if (typeof window === 'undefined') return

  const reduced = prefersReducedMotion()
  scrollControl.holdHashSync(reduced ? 0 : HASH_SYNC_HOLD_MS)
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}
