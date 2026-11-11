/**
 * Static reveal controller for the server-rendered sections.
 *
 * Static Astro sections and server-rendered Vue sections paint without
 * hydration. Their entrances still belong to the authored motion system:
 * this script owns the same arming / quiet-absence cycle as useRevealCycle,
 * without hydrating the sections themselves.
 *
 * Hydrated islands keep their Vue composables; every target inside an
 * `<astro-island>` is ignored here so the two systems never fight.
 */

const RESET_DELAY = 2400
const ROOT_MARGIN = '0px 0px -6% 0px'
const OBSERVER_THRESHOLD = 0.05

type RevealKind = 'header' | 'copy' | 'stagger' | 'experience' | 'record'

interface RevealTarget {
  el: HTMLElement
  kind: RevealKind
  once: boolean
  timer: number
  shown: boolean
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function canObserve() {
  return (
    typeof window !== 'undefined' &&
    !prefersReducedMotion() &&
    'IntersectionObserver' in window
  )
}

function isOnScreen(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

function setShown(target: RevealTarget, shown: boolean) {
  target.shown = shown
  target.el.classList.toggle('is-armed', !shown)

  if (target.kind === 'copy' || target.kind === 'record') {
    target.el.classList.toggle('is-shown', shown)
  }

  if (target.kind === 'experience') {
    target.el.classList.toggle('is-traced', shown)
  }
}

function collect(
  selector: string,
  kind: RevealKind,
  targets: RevealTarget[],
  seen: Set<HTMLElement>,
  once = false,
) {
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (seen.has(el) || el.closest('astro-island')) return
    seen.add(el)
    targets.push({ el, kind, once, timer: 0, shown: false })
  })
}

export function initReveals() {
  if (!canObserve()) return

  const targets: RevealTarget[] = []
  const seen = new Set<HTMLElement>()

  // The About plate's header is also its copy block: it owns both the marker
  // and the staged title, so it needs the copy treatment before the generic
  // `.section-marker` selector claims it. Chapter headers register once; a
  // return visit should find the file already open, not replay every chapter.
  collect('[data-about-copy]', 'copy', targets, seen, true)
  collect('.section-marker', 'header', targets, seen, true)
  collect('[data-service]', 'stagger', targets, seen)
  collect('[data-stack-group]', 'stagger', targets, seen)
  collect('.experience-entry', 'experience', targets, seen)
  collect('[data-education-item]', 'record', targets, seen)
  collect('[data-certification-item]', 'record', targets, seen)
  collect('[data-blog-card]', 'record', targets, seen)
  collect('[data-contact-panel]', 'stagger', targets, seen)
  collect('.capabilities', 'stagger', targets, seen)
  collect('.hero-copy', 'stagger', targets, seen)

  if (!targets.length) return

  const byElement = new Map<Element, RevealTarget>()
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const target = byElement.get(entry.target)
      if (!target) continue

      if (entry.isIntersecting) {
        if (target.timer) {
          window.clearTimeout(target.timer)
          target.timer = 0
        }
        if (!target.shown) setShown(target, true)
        continue
      }

      if (!target.shown || target.timer || target.once) continue

      target.timer = window.setTimeout(() => {
        target.timer = 0
        if (!target.el.isConnected) return

        // Observer state can lag behind scroll, a tab switch or a replaced
        // node. Only arm a target the DOM confirms is fully out of view.
        if (isOnScreen(target.el)) {
          setShown(target, true)
          return
        }

        setShown(target, false)
      }, RESET_DELAY)
    }
  }, { threshold: OBSERVER_THRESHOLD, rootMargin: ROOT_MARGIN })

  for (const target of targets) {
    // The page is already painted. Anything on screen must stay settled;
    // anything below the fold arms silently and enters on scroll.
    setShown(target, isOnScreen(target.el))
    byElement.set(target.el, target)
    observer.observe(target.el)
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveals, { once: true })
  } else {
    initReveals()
  }
}
