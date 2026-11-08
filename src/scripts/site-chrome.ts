import { toggleTheme } from '@/stores/theme'
import { scrollControl } from '@/router/scrollControl'

const header = document.querySelector<HTMLElement>('.site-header')
const menu = header?.querySelector<HTMLElement>('#mobile-menu')
const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]')
const home = header?.dataset.page === 'home'
let open = false
let closeTimer = 0

function closeMenu(returnFocus = false) {
  if (!open || !menu || !toggle) return
  open = false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) menu.hidden = true
  else {
    menu.dataset.closing = 'true'
    menu.inert = true
    closeTimer = window.setTimeout(() => {
      menu.hidden = true
      delete menu.dataset.closing
      closeTimer = 0
    }, 180)
  }
  toggle.setAttribute('aria-expanded', 'false')
  toggle.setAttribute('aria-label', toggle.dataset.openLabel ?? '')
  toggle.querySelector<HTMLElement>('[data-menu-icon]')!.hidden = false
  toggle.querySelector<HTMLElement>('[data-close-icon]')!.hidden = true
  document.body.style.overflow = ''
  if (returnFocus) toggle.focus()
}

toggle?.addEventListener('click', () => {
  if (open) return closeMenu(true)
  if (!menu) return
  clearTimeout(closeTimer)
  delete menu.dataset.closing
  menu.inert = false
  open = true
  menu.hidden = false
  toggle.setAttribute('aria-expanded', 'true')
  toggle.setAttribute('aria-label', toggle.dataset.closeLabel ?? '')
  toggle.querySelector<HTMLElement>('[data-menu-icon]')!.hidden = true
  toggle.querySelector<HTMLElement>('[data-close-icon]')!.hidden = false
  document.body.style.overflow = 'hidden'
  menu.focus()
})

menu?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return
  const focusables = menu.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled])',
  )
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (!first || !last) return
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === menu)
  ) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu(true)
})
menu
  ?.querySelectorAll('a')
  .forEach((link) => link.addEventListener('click', () => closeMenu()))
const wide = matchMedia('(min-width: 1280px)')
wide.addEventListener('change', (event) => {
  if (event.matches) closeMenu()
})

document
  .querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
  .forEach((button) => button.addEventListener('click', toggleTheme))
document
  .querySelectorAll<HTMLAnchorElement>('[data-locale-link]')
  .forEach((link) =>
    link.addEventListener('click', (event) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      if (link.getAttribute('aria-current')) {
        event.preventDefault()
        return
      }
      try {
        if (window.scrollY > 0)
          sessionStorage.setItem(
            'sl-locale-scroll',
            JSON.stringify({ y: window.scrollY, at: Date.now() }),
          )
      } catch {
        /* Storage is optional. */
      }
      link.hash = window.location.hash
    }),
  )

const navLinks =
  header?.querySelectorAll<HTMLAnchorElement>('[data-nav-id]') ?? []
const homeLink = header?.querySelector<HTMLAnchorElement>('[data-home-link]')
const sections = document.querySelectorAll<HTMLElement>(
  'main > section[id], main > astro-island > section[id]',
)
let currentSection = ''
let hashHoldUntil = 0
function updateNav() {
  header?.classList.toggle('border-line', window.scrollY > 8)
  header?.classList.toggle('bg-page/92', window.scrollY > 8)
  header?.classList.toggle('border-transparent', window.scrollY <= 8)
  header?.classList.toggle('bg-page/75', window.scrollY <= 8)
  if (!home) return
  const marker = Math.max(window.innerHeight * 0.35, 160)
  let section = ''
  let nav = ''
  for (const item of sections) {
    if (item.getBoundingClientRect().top > marker) continue
    section = item.id
    if ([...navLinks].some((link) => link.dataset.navId === item.id))
      nav = item.id
  }
  navLinks.forEach((link) => {
    const active = link.dataset.navId === nav
    link.classList.toggle('text-soft', active)
    link.classList.toggle('text-muted', !active)
    link
      .querySelector('.nav-underline')
      ?.classList.toggle('scale-x-100', active)
    link.querySelector('.nav-underline')?.classList.toggle('scale-x-0', !active)
    if (active) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
  if (nav) homeLink?.removeAttribute('aria-current')
  else homeLink?.setAttribute('aria-current', 'page')
  const next = section === 'top' ? '' : section
  if (next === currentSection) return
  currentSection = next
  const anchor = window.location.hash.slice(1)
  const target = anchor && document.getElementById(anchor)
  if (anchor.startsWith('review-') && !target) {
    hashHoldUntil = Date.now() + 1200
    return
  }
  if (target && target.tagName !== 'SECTION') {
    const rect = target.getBoundingClientRect()
    if (rect.bottom > 0 && rect.top < window.innerHeight) return
  }
  if (
    Date.now() < hashHoldUntil ||
    scrollControl.hashSyncHeld ||
    window.location.hash === (next ? `#${next}` : '')
  )
    return
  history.replaceState(
    history.state,
    '',
    `${location.pathname}${location.search}${next ? `#${next}` : ''}`,
  )
}
window.addEventListener('scroll', updateNav, { passive: true })
window.addEventListener('resize', updateNav, { passive: true })
document
  .querySelectorAll<HTMLAnchorElement>(
    'a[href^="#"], a[href^="/#"], a[href^="/en/#"]',
  )
  .forEach((link) =>
    link.addEventListener('click', () => {
      hashHoldUntil = Date.now() + 1200
    }),
  )
if (home) {
  const initial = window.location.hash.slice(1)
  if (initial && !initial.startsWith('review-')) {
    const target = document.getElementById(initial)
    const section = target?.closest<HTMLElement>('section[id]')
    if (section) currentSection = section.id === 'top' ? '' : section.id
  }
  document
    .querySelectorAll<HTMLAnchorElement>('[data-home-link]')
    .forEach((link) =>
      link.addEventListener('click', (event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        closeMenu()
        hashHoldUntil = Date.now() + 1400
        history.replaceState(
          history.state,
          '',
          location.pathname + location.search,
        )
        window.scrollTo({
          top: 0,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        })
      }),
    )
}
updateNav()
