const button = document.querySelector<HTMLButtonElement>('[data-copy-email]')
const copyStatus = document.querySelector<HTMLElement>('[data-copy-status]')
const trace = document.querySelector<HTMLElement>('.contact-copy-trace')
let timer = 0
document
  .querySelector('#contact form')
  ?.addEventListener('submit', (event) => event.preventDefault())
button?.addEventListener('click', async () => {
  if (!copyStatus || !trace) return
  let copied = false
  try {
    await navigator.clipboard.writeText(button.dataset.email ?? '')
    copied = true
  } catch {
    /* A disabled clipboard is a normal failure. */
  }
  button.dataset.copied = String(copied)
  trace.dataset.active = String(copied)
  button.querySelector<HTMLElement>('[data-copy-icon]')!.hidden = copied
  button.querySelector<HTMLElement>('[data-check-icon]')!.hidden = !copied
  copyStatus.textContent = copied
    ? (copyStatus.dataset.success ?? '')
    : (copyStatus.dataset.failure ?? '')
  copyStatus.className = `font-mono text-[10.5px] uppercase tracking-[0.06em] ${copied ? 'text-soft' : 'text-danger'}`
  clearTimeout(timer)
  timer = window.setTimeout(() => {
    copyStatus.textContent = ''
    button.dataset.copied = 'false'
    trace.dataset.active = 'false'
    button.querySelector<HTMLElement>('[data-copy-icon]')!.hidden = false
    button.querySelector<HTMLElement>('[data-check-icon]')!.hidden = true
  }, 3200)
})
