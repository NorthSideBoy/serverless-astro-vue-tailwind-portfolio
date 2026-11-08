import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * A quiet period out of view before an entrance is allowed to play again.
 * Shorter absences — a quick scroll-by, a rubber-band bounce — keep the
 * section settled instead of replaying a reveal the visitor never left.
 */
const REVEAL_RESET_DELAY = 2400

interface RevealOptions {
  /** Time fully out of view before the target re-arms. */
  resetDelay?: number
  /** Fraction of the viewport used to decide whether the target loads settled. */
  mountThreshold?: number
  /** Only measure visibility inside this root margin. */
  rootMargin?: string
  /** How much of the target must be visible before it reveals. */
  threshold?: number
  /** Lets a component opt out without mounting an observer. */
  enabled?: boolean
}

const DEFAULT_RESET_DELAY = REVEAL_RESET_DELAY

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function canObserve() {
  return (
    typeof window !== 'undefined' && !prefersReducedMotion() && 'IntersectionObserver' in window
  )
}

function isInView(element: HTMLElement, mountThreshold: number) {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight * mountThreshold && rect.bottom > 0
}

/**
 * A conservative "is any part of this element on screen?" check.
 *
 * Observer state can be stale after a tab switch, a layout change or a node
 * replacement. Before hiding a target for a replay, the DOM is the authority:
 * content that still occupies the viewport must never be armed.
 */
function isOnScreen(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

/**
 * Repeatable entrance state for a single element.
 *
 * `armed` means "hidden and ready to play". A target that is below the fold
 * mounts armed; if it is already in view it mounts settled, so content never
 * flashes in after paint. Once it has been fully out of view for `resetDelay`
 * it arms again, and the next entry releases it exactly once. The observer
 * stays mounted for the lifetime of the component.
 */
export function useRevealCycle(target: Ref<HTMLElement | null>, options: RevealOptions = {}) {
  const {
    resetDelay = DEFAULT_RESET_DELAY,
    // Any visible part means "already on screen" for a hydrated island: the
    // element may have been server-rendered and visible before hydration, so
    // hiding it to replay an entrance would flash. Below-fold targets still
    // arm normally.
    mountThreshold = 1,
    rootMargin = '0px 0px -6% 0px',
    threshold = 0.05,
    enabled = true,
  } = options

  const armed = ref(false)
  let observer: IntersectionObserver | null = null
  let resetTimer = 0
  let visible = false

  function clearReset() {
    if (!resetTimer) return
    window.clearTimeout(resetTimer)
    resetTimer = 0
  }

  function onIntersect(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]
    if (!entry) return

    if (entry.isIntersecting) {
      visible = true
      clearReset()
      armed.value = false
      return
    }

    visible = false
    if (armed.value) return

    clearReset()
    resetTimer = window.setTimeout(() => {
      resetTimer = 0
      const element = target.value
      if (!element) return

      // The last observer entry may be stale by the time the delay expires.
      // Check the live rectangle so a target that came back on screen (or was
      // replaced) is never hidden without a notification to release it.
      if (isOnScreen(element)) {
        visible = true
        armed.value = false
        return
      }

      if (!visible) armed.value = true
    }, resetDelay)
  }

  onMounted(() => {
    const element = target.value
    if (!enabled || !element || !canObserve()) return

    visible = isInView(element, mountThreshold)
    armed.value = !visible

    observer = new IntersectionObserver(onIntersect, { threshold, rootMargin })
    observer.observe(element)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    clearReset()
  })

  return { armed }
}

/**
 * Repeatable entrance state for a list of sibling items inside one container.
 *
 * Each item owns its cycle, so a long list reveals row by row instead of
 * firing the whole section at once. `shown` marks the settled/visible state;
 * `armed` marks items that are fully out of view and ready to replay. If the
 * observer is unavailable or reduced motion is requested, every item starts
 * shown and nothing hides.
 */
export function useRevealList(
  container: Ref<HTMLElement | null>,
  selector: string,
  options: RevealOptions = {},
) {
  const {
    resetDelay = DEFAULT_RESET_DELAY,
    mountThreshold = 1,
    rootMargin = '0px 0px -6% 0px',
    threshold = 0.05,
    enabled = true,
  } = options

  const armed = ref<boolean[]>([])
  const shown = ref<boolean[]>([])
  let observer: IntersectionObserver | null = null
  let mutations: MutationObserver | null = null
  const resetTimers = new Map<number, number>()
  const visibility = new Map<number, boolean>()
  let items: HTMLElement[] = []

  function setItem(index: number, revealed: boolean) {
    const nextShown = [...shown.value]
    nextShown[index] = revealed
    shown.value = nextShown

    const nextArmed = [...armed.value]
    nextArmed[index] = !revealed
    armed.value = nextArmed
  }

  function clearTimer(index: number) {
    const timer = resetTimers.get(index)
    if (!timer) return
    window.clearTimeout(timer)
    resetTimers.delete(index)
  }

  function scheduleReset(index: number) {
    clearTimer(index)
    resetTimers.set(
      index,
      window.setTimeout(() => {
        resetTimers.delete(index)
        const item = items[index]
        if (!item) return

        // Observer entries can lag behind scroll, tab switches or a replaced
        // node. Only arm a row that is physically out of the viewport.
        if (isOnScreen(item)) {
          visibility.set(index, true)
          if (!shown.value[index]) setItem(index, true)
          return
        }

        if (!visibility.get(index)) setItem(index, false)
      }, resetDelay),
    )
  }

  /**
   * Re-scan the container after Vue replaces its rows.
   *
   * Locale-aware keys (About's fact labels, Education's titles) swap the DOM
   * nodes while the observer still watches the old ones. Without this pass the
   * fresh rows inherit `is-armed` and nothing is left to release them, leaving
   * blank rows on screen. State is kept per index when the node survives; a
   * replaced node takes the state its current position deserves.
   */
  function refresh() {
    const root = container.value
    if (!enabled || !root || !observer) return

    const nextItems = Array.from(root.querySelectorAll<HTMLElement>(selector))
    const unchanged =
      nextItems.length === items.length && nextItems.every((item, index) => items[index] === item)
    if (unchanged) return

    const previousItems = items
    const previousShown = shown.value
    const previousArmed = armed.value
    const nextShown: boolean[] = []
    const nextArmed: boolean[] = []
    const nextVisibility = new Map<number, boolean>()

    nextItems.forEach((item, index) => {
      const previous = previousItems[index]
      const sameNode = previous === item
      const onScreen = sameNode ? visibility.get(index) === true : isOnScreen(item)

      if (sameNode) {
        nextShown[index] = previousShown[index] ?? true
        nextArmed[index] = previousArmed[index] ?? false
      } else if (onScreen) {
        nextShown[index] = true
        nextArmed[index] = false
      } else {
        nextShown[index] = previousShown[index] ?? false
        nextArmed[index] = previousArmed[index] ?? true
      }

      nextVisibility.set(index, onScreen)

      if (!sameNode) {
        if (previous) observer?.unobserve(previous)
        observer?.observe(item)
      }
    })

    previousItems.slice(nextItems.length).forEach((item) => observer?.unobserve(item))

    for (const index of resetTimers.keys()) {
      if (!nextItems[index] || nextVisibility.get(index)) clearTimer(index)
    }

    items = nextItems
    shown.value = nextShown
    armed.value = nextArmed
    visibility.clear()
    nextVisibility.forEach((value, index) => visibility.set(index, value))
  }

  function onIntersect(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const index = items.indexOf(entry.target as HTMLElement)
      if (index < 0) continue

      if (entry.isIntersecting) {
        visibility.set(index, true)
        clearTimer(index)
        if (!shown.value[index]) setItem(index, true)
        continue
      }

      visibility.set(index, false)
      if (shown.value[index]) scheduleReset(index)
    }
  }

  onMounted(() => {
    const root = container.value
    if (!enabled || !root) return

    items = Array.from(root.querySelectorAll<HTMLElement>(selector))

    if (!canObserve()) {
      shown.value = items.map(() => true)
      armed.value = items.map(() => false)
      return
    }

    const initialShown = items.map((item) => isInView(item, mountThreshold))
    shown.value = initialShown
    armed.value = initialShown.map((revealed) => !revealed)
    items.forEach((_, index) => visibility.set(index, initialShown[index] ?? false))

    observer = new IntersectionObserver(onIntersect, { threshold, rootMargin })
    items.forEach((item) => observer?.observe(item))

    // Rows can be replaced after mount (for example when the site switches
    // language and a translated :key changes). Re-observe them as they appear
    // so a re-armed entrance can always be released.
    if (typeof MutationObserver !== 'undefined') {
      mutations = new MutationObserver(refresh)
      mutations.observe(root, { childList: true, subtree: true })
    }
  })

  onBeforeUnmount(() => {
    mutations?.disconnect()
    mutations = null
    observer?.disconnect()
    observer = null
    resetTimers.forEach((timer) => window.clearTimeout(timer))
    resetTimers.clear()
  })

  return { armed, shown }
}
