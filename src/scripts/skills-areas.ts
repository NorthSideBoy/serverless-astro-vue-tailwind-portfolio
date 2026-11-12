/**
 * Work areas: one roving tablist drives the four route areas and the
 * architecture band. The server renders the default area selected, so the
 * panel is readable and complete without this script.
 */
const flow = document.querySelector<HTMLElement>('[data-areas-flow]')
const panel = document.querySelector<HTMLElement>('[data-area-panel]')
const tabs = [
  ...(flow?.querySelectorAll<HTMLButtonElement>('[data-area-tab]') ?? []),
]
const details = [
  ...document.querySelectorAll<HTMLElement>('[data-area-detail]'),
]

if (flow && panel && tabs.length) {
  let active = Math.max(
    0,
    tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'),
  )

  function paint(index: number, focus = false) {
    active = index
    tabs.forEach((tab, i) => {
      const selected = i === index
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
      tab.dataset.state = selected ? 'active' : 'idle'
    })
    details.forEach((detail, i) => {
      detail.hidden = i !== index
    })
    panel?.setAttribute('aria-labelledby', `skills-area-tab-${index}`)
    if (focus) tabs[index]?.focus()
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => paint(index))
  })

  flow.addEventListener('keydown', (event) => {
    const count = tabs.length
    // Move from the tab that owns focus; roving tabindex usually keeps that
    // equal to the selected tab, but a direct focus must not jump elsewhere.
    const focused = tabs.indexOf(document.activeElement as HTMLButtonElement)
    const base = focused >= 0 ? focused : active
    const next: Record<string, number> = {
      ArrowRight: (base + 1) % count,
      ArrowDown: (base + 1) % count,
      ArrowLeft: (base - 1 + count) % count,
      ArrowUp: (base - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }
    const target = next[event.key]
    if (target === undefined) return
    event.preventDefault()
    paint(target, true)
  })
}
