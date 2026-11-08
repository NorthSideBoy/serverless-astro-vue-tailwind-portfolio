/**
 * Hash-sync hold shared by the header script and review deep links.
 */
const HASH_SYNC_HOLD_MS = 1200

let hashSyncHoldUntil = 0

export const scrollControl = {
  /**
   * Pausing the scroll spy while a navigation scroll is running prevents the
   * address bar from rewriting the destination mid-flight.
   */
  holdHashSync(duration = HASH_SYNC_HOLD_MS) {
    hashSyncHoldUntil = Date.now() + duration
  },

  get hashSyncHeld() {
    return Date.now() < hashSyncHoldUntil
  },
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
