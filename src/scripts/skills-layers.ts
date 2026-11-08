const controls = document.querySelector<HTMLElement>('.layer-controls')
const tabs = [
  ...(controls?.querySelectorAll<HTMLButtonElement>('[data-layer-tab]') ?? []),
]
const details = [
  ...document.querySelectorAll<HTMLElement>('[data-layer-detail]'),
]
const plate = document.querySelector<HTMLElement>('[data-layer-plate]')
const radii = [54, 96, 138, 180]
const colors = [
  'var(--c-layer-1)',
  'var(--c-layer-2)',
  'var(--c-layer-3)',
  'var(--c-layer-4)',
]
let active = 1
let tween = 0
const multipliers: number[] = tabs.map((_, i) => (i === active ? 1.08 : 1))
function radius(i: number) {
  return (radii[i] ?? 54 + i * 42) * (multipliers[i] ?? 1)
}
function point(ring: number, node: number) {
  const angle = (node / (6 + ring * 2)) * Math.PI * 2 + (ring * Math.PI) / 12
  return {
    x: 340 + radius(ring) * Math.cos(angle),
    y: 225 + radius(ring) * Math.sin(angle),
  }
}
function paint() {
  plate
    ?.querySelectorAll<SVGElement>('[data-disc], [data-ring-circle]')
    .forEach((circle) =>
      circle.setAttribute(
        'r',
        String(
          radius(
            Number(
              circle.dataset.disc ??
                circle.closest('[data-ring]')?.getAttribute('data-ring'),
            ),
          ),
        ),
      ),
    )
  plate?.querySelectorAll<SVGElement>('[data-node-ring]').forEach((node) => {
    const p = point(
      Number(node.dataset.nodeRing),
      Number(node.dataset.nodeIndex),
    )
    node.setAttribute('cx', String(p.x))
    node.setAttribute('cy', String(p.y))
  })
  plate?.querySelectorAll<SVGElement>('[data-index-ring]').forEach((index) => {
    const r = radius(Number(index.dataset.indexRing))
    index.setAttribute('x', String(340 - (r - 14) * 0.62))
    index.setAttribute('y', String(225 - (r - 14) * 0.62))
  })
  plate
    ?.querySelectorAll<SVGElement>('[data-packet]')
    .forEach((packet) =>
      packet.setAttribute(
        'cx',
        String(
          340 +
            radius(
              Number(packet.closest('[data-ring]')?.getAttribute('data-ring')),
            ),
        ),
      ),
    )
  plate
    ?.querySelectorAll<SVGElement>('[data-link-ring]')
    .forEach((link, index) => {
      const inner = Number(link.dataset.linkRing) - 1
      const previous = [...plate.querySelectorAll('[data-link-ring]')]
        .slice(0, index)
        .filter(
          (item) =>
            item.getAttribute('data-link-ring') === link.dataset.linkRing,
        ).length
      const angle =
        (previous / (6 + inner * 2)) * Math.PI * 2 + (inner * Math.PI) / 12
      const count = 8 + inner * 2
      const outer =
        ((Math.round(
          (angle - ((inner + 1) * Math.PI) / 12) / ((Math.PI * 2) / count),
        ) %
          count) +
          count) %
        count
      const from = point(inner, previous)
      const to = point(inner + 1, outer)
      link.setAttribute('x1', String(from.x))
      link.setAttribute('y1', String(from.y))
      link.setAttribute('x2', String(to.x))
      link.setAttribute('y2', String(to.y))
    })
}
function select(index: number, focus = false) {
  if (index < 0 || index >= tabs.length) return
  active = index
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index))
    tab.tabIndex = i === index ? 0 : -1
    tab.dataset.selected = String(i === index)
  })
  details.forEach((detail, i) => {
    detail.hidden = i !== index
  })
  document
    .querySelector('#skills-layer-detail')
    ?.setAttribute('aria-labelledby', `skills-layer-tab-${index}`)
  plate
    ?.querySelectorAll<SVGElement>('[data-disc]')
    .forEach((disc) =>
      disc.setAttribute(
        'fill-opacity',
        disc.dataset.disc === String(index) ? '0.09' : '0.025',
      ),
    )
  plate?.querySelectorAll<SVGElement>('[data-ring]').forEach((ring) => {
    const i = Number(ring.dataset.ring)
    const selected = i === index
    ring.classList.toggle('is-active', selected)
    ring
      .querySelector('[data-ring-circle]')
      ?.setAttribute('stroke-opacity', String(selected ? 1 : 0.32))
    ring
      .querySelector('[data-ring-circle]')
      ?.setAttribute('stroke-width', String(selected ? 1.8 : 1))
    ring
      .querySelector('.packet-orbit')
      ?.classList.toggle('is-flowing', selected)
    ring
      .querySelector('[data-packet]')
      ?.setAttribute('opacity', String(selected ? 0.95 : 0.28))
  })
  plate?.querySelectorAll<SVGElement>('[data-node-ring]').forEach((node) => {
    const selected = node.dataset.nodeRing === String(index)
    node.setAttribute('opacity', String(selected ? 0.85 : 0.24))
    node.setAttribute('r', String(selected ? 3.2 : 2.2))
  })
  plate
    ?.querySelectorAll<SVGElement>('[data-index-ring]')
    .forEach((node) =>
      node.setAttribute(
        'opacity',
        node.dataset.indexRing === String(index) ? '1' : '0.4',
      ),
    )
  plate?.querySelectorAll<SVGElement>('[data-link-ring]').forEach((link) => {
    const selected = link.dataset.linkRing === String(index)
    link.setAttribute(
      'stroke',
      selected ? colors[index % colors.length]! : 'var(--c-line-strong)',
    )
    link.setAttribute('opacity', String(selected ? 0.82 : 0.28))
    link.classList.toggle('is-flowing', selected)
  })
  if (focus) tabs[index]?.focus()
  cancelAnimationFrame(tween)
  const from = [...multipliers]
  const start = performance.now()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  function step(now: number) {
    const progress = reduced ? 1 : Math.min(1, (now - start) / 420)
    const eased = 1 - Math.pow(1 - progress, 3)
    multipliers.forEach((_, i) => {
      multipliers[i] = from[i]! + ((i === index ? 1.08 : 1) - from[i]!) * eased
    })
    paint()
    if (progress < 1) tween = requestAnimationFrame(step)
  }
  tween = requestAnimationFrame(step)
}
tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)))
controls?.addEventListener('keydown', (event) => {
  const next = {
    ArrowRight: (active + 1) % tabs.length,
    ArrowDown: (active + 1) % tabs.length,
    ArrowLeft: (active - 1 + tabs.length) % tabs.length,
    ArrowUp: (active - 1 + tabs.length) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  }[event.key]
  if (next === undefined) return
  event.preventDefault()
  select(next, true)
})
if (plate && 'IntersectionObserver' in window)
  new IntersectionObserver(([entry]) => {
    plate.classList.toggle('is-paused', !entry?.isIntersecting)
  }).observe(plate)
