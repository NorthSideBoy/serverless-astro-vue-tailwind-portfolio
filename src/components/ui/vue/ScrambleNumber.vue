<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { REVEAL_RESET_DELAY } from '@/composables/useRevealCycle'

const props = withDefaults(
  defineProps<{
    value: string
    delay?: number
  }>(),
  { delay: 0 },
)

const DURATION = 600
const MIN_TICK = 44
const MAX_TICK = 92
const MAX_DELAY = 400

const root = ref<HTMLElement | null>(null)
const output = ref(props.value)

let animating = false
let observer: IntersectionObserver | null = null
let frame = 0
let startTimer = 0
let resetTimer = 0
let startedAt = 0
let lastTick = Number.NEGATIVE_INFINITY
let hasPlayed = false
let replayArmed = false
let visible = false

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function randomDigit(previous: string | undefined) {
  let digit = Math.floor(Math.random() * 10)

  if (String(digit) === previous) {
    digit = (digit + 1 + Math.floor(Math.random() * 9)) % 10
  }

  return String(digit)
}

function scramble(target: string) {
  return [...target].map((char) => (/\d/.test(char) ? randomDigit(char) : char)).join('')
}

function lockPoint(position: number, total: number) {
  return Math.min(0.84, 0.5 + ((position + 1) / total) * 0.34)
}

function finish() {
  animating = false
  output.value = props.value
  frame = 0
}

function tick(now: number) {
  if (!animating) return

  const progress = Math.min(1, (now - startedAt) / DURATION)

  if (progress >= 1) {
    finish()
    return
  }

  const interval = MIN_TICK + (MAX_TICK - MIN_TICK) * progress

  if (now - lastTick >= interval) {
    lastTick = now

    const previous = output.value
    const chars = [...props.value]
    const digitCount = chars.filter((char) => /\d/.test(char)).length
    let digitPosition = 0

    output.value = chars
      .map((char, index) => {
        if (!/\d/.test(char)) return char

        const position = digitPosition
        digitPosition += 1

        return progress >= lockPoint(position, digitCount)
          ? char
          : randomDigit(previous[index] ?? char)
      })
      .join('')
  }

  frame = requestAnimationFrame(tick)
}

function clearStartTimer() {
  if (!startTimer) return
  window.clearTimeout(startTimer)
  startTimer = 0
}

function clearResetTimer() {
  if (!resetTimer) return
  window.clearTimeout(resetTimer)
  resetTimer = 0
}

function scheduleReplay() {
  clearResetTimer()
  resetTimer = window.setTimeout(() => {
    resetTimer = 0
    if (!visible) replayArmed = true
  }, REVEAL_RESET_DELAY)
}

function start() {
  if (animating) return

  clearStartTimer()
  animating = true
  hasPlayed = true
  replayArmed = false
  startedAt = performance.now()
  lastTick = Number.NEGATIVE_INFINITY
  output.value = scramble(props.value)
  frame = requestAnimationFrame(tick)
}

function handleIntersect(entries: IntersectionObserverEntry[]) {
  const entry = entries[0]
  if (!entry) return

  visible = entry.isIntersecting

  if (visible) {
    clearResetTimer()
    if (animating || (hasPlayed && !replayArmed)) return

    const delay = Math.min(Math.max(props.delay, 0), MAX_DELAY)

    if (delay > 0) {
      clearStartTimer()
      startTimer = window.setTimeout(start, delay)
    } else {
      start()
    }

    return
  }

  // Leaving while the delayed start is still pending cancels it; the next
  // entry may play the first scramble after all.
  clearStartTimer()
  if (hasPlayed) scheduleReplay()
}

watch(
  () => props.value,
  (value) => {
    if (!animating) output.value = value
  },
)

onMounted(() => {
  if (prefersReducedMotion() || !('IntersectionObserver' in window) || !root.value) return

  observer = new IntersectionObserver(handleIntersect, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0,
  })
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null

  if (frame) cancelAnimationFrame(frame)
  clearStartTimer()
  clearResetTimer()
})
</script>

<template>
  <span ref="root">
    <span class="sr-only">{{ value }}</span>
    <span aria-hidden="true" class="tabular-nums">{{ output }}</span>
  </span>
</template>
