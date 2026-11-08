const reduced = matchMedia('(prefers-reduced-motion: reduce)')
if (!reduced.matches && 'IntersectionObserver' in window) {
  const numbers = document.querySelectorAll<HTMLElement>('[data-scramble]')
  const states = new WeakMap<
    Element,
    {
      played: boolean
      armed: boolean
      start: number
      reset: number
      frame: number
    }
  >()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const root = entry.target as HTMLElement
        const state = states.get(root)
        if (!state) continue
        if (!entry.isIntersecting) {
          clearTimeout(state.start)
          state.start = 0
          if (state.played) {
            clearTimeout(state.reset)
            state.reset = window.setTimeout(() => {
              const rect = root.getBoundingClientRect()
              if (rect.bottom <= 0 || rect.top >= window.innerHeight)
                state.armed = true
            }, 2400)
          }
          continue
        }
        clearTimeout(state.reset)
        if (state.played && !state.armed) continue
        const output = root.querySelector<HTMLElement>('[aria-hidden="true"]')
        const value = root.querySelector('.sr-only')?.textContent ?? ''
        clearTimeout(state.start)
        state.start = window.setTimeout(
          () => {
            state.played = true
            state.armed = false
            state.start = 0
            const began = performance.now()
            let last = 0
            function frame(now: number) {
              if (!output) return
              const progress = Math.min(1, (now - began) / 600)
              if (progress === 1) {
                output.textContent = value
                state!.frame = 0
                return
              }
              if (now - last > 44 + progress * 48) {
                last = now
                let digit = 0
                const count = [...value].filter((char) =>
                  /\d/.test(char),
                ).length
                output.textContent = [...value]
                  .map((char) => {
                    if (!/\d/.test(char)) return char
                    return progress >=
                      Math.min(0.84, 0.5 + (++digit / count) * 0.34)
                      ? char
                      : String(Math.floor(Math.random() * 10))
                  })
                  .join('')
              }
              state!.frame = requestAnimationFrame(frame)
            }
            state.frame = requestAnimationFrame(frame)
          },
          Math.min(Number(root.dataset.delay) || 0, 400),
        )
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  )
  numbers.forEach((root) => {
    states.set(root, {
      played: false,
      armed: false,
      start: 0,
      reset: 0,
      frame: 0,
    })
    observer.observe(root)
  })
  window.addEventListener(
    'pagehide',
    () => {
      observer.disconnect()
      numbers.forEach((root) => {
        const state = states.get(root)
        if (state) {
          clearTimeout(state.start)
          clearTimeout(state.reset)
          cancelAnimationFrame(state.frame)
        }
      })
    },
    { once: true },
  )
}
