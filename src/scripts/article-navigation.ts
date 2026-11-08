// The article's Firestore content is server-rendered by Vue. These lightweight
// reading affordances do not hydrate the article or replace its HTML.
const links = document.querySelectorAll<HTMLAnchorElement>(
  '[data-article-toc] a[href^="#"]',
)
const headings = [...new Set([...links].map((link) => link.hash.slice(1)))]
  .map((id) => document.getElementById(id))
  .filter((item): item is HTMLElement => item !== null)
if ('IntersectionObserver' in window && links.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
      if (!visible.length) return
      const active = visible.reduce((a, b) =>
        a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
      ).target.id
      links.forEach((link) => {
        if (link.hash === `#${active}`)
          link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
    },
    { rootMargin: '-96px 0px -55% 0px', threshold: 0 },
  )
  headings.forEach((heading) => observer.observe(heading))
  window.addEventListener('pagehide', () => observer.disconnect(), {
    once: true,
  })
}

const progress = document.querySelector<HTMLElement>('[data-reading-progress]')
if (progress) {
  let frame = 0
  const update = () => {
    frame = 0
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  update()
  window.addEventListener(
    'pagehide',
    () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    },
    { once: true },
  )
}
