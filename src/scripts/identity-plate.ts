const stage = document.querySelector<HTMLElement>('.identity-plate-stage')
const sheet = stage?.querySelector<SVGElement>('.ip-main .identity-plate')
const motion = matchMedia('(prefers-reduced-motion: reduce)')
let visible = false
let surfaced = false
let passesLeft = 2
let delay = 900
let startTimer = 0
let endTimer = 0
let returnTimer = 0
function clearTimers() {
  clearTimeout(startTimer)
  clearTimeout(endTimer)
  clearTimeout(returnTimer)
  startTimer = endTimer = returnTimer = 0
}
function stop() {
  clearTimers()
  stage?.classList.remove('is-glitching', 'is-glitching--quick')
  sheet?.classList.remove('is-glitching', 'is-glitching--quick')
}
function canRun() {
  return visible && !motion.matches && !document.hidden
}
function schedule(ms: number) {
  clearTimeout(startTimer)
  if (!canRun() || !passesLeft || stage?.classList.contains('is-glitching'))
    return
  startTimer = window.setTimeout(() => {
    if (!canRun() || !stage || !sheet) return
    const quick = passesLeft === 1
    passesLeft--
    stage.classList.add('is-glitching')
    sheet.classList.add('is-glitching')
    stage.classList.toggle('is-glitching--quick', quick)
    sheet.classList.toggle('is-glitching--quick', quick)
    endTimer = window.setTimeout(
      () => {
        stage.classList.remove('is-glitching', 'is-glitching--quick')
        sheet.classList.remove('is-glitching', 'is-glitching--quick')
        if (passesLeft) schedule(1600)
        else if (!visible) scheduleReturn()
      },
      (quick ? 360 : 640) + 40,
    )
  }, ms)
}
function scheduleReturn() {
  clearTimeout(returnTimer)
  if (!surfaced || visible || passesLeft) return
  returnTimer = window.setTimeout(() => {
    if (!visible && !motion.matches && !document.hidden) {
      passesLeft = 1
      delay = 240
    }
  }, 4800)
}
if (stage && 'IntersectionObserver' in window) {
  new IntersectionObserver(
    ([entry]) => {
      const wasVisible = visible
      visible = Boolean(entry?.isIntersecting)
      if (visible === wasVisible) return
      if (visible) {
        surfaced = true
        clearTimeout(returnTimer)
        schedule(delay)
      } else {
        clearTimeout(startTimer)
        scheduleReturn()
      }
    },
    { threshold: 0.25 },
  ).observe(stage)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else if (visible) schedule(delay)
    else scheduleReturn()
  })
  motion.addEventListener('change', () => {
    if (motion.matches) stop()
    else if (visible) schedule(delay)
    else scheduleReturn()
  })
}
