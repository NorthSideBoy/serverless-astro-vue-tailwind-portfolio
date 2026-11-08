<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import IdentityPlateSheet from './IdentityPlateSheet.vue'

/**
 * IdentityPlate — the live sheet plus its negative impressions.
 * A short calibration: one full, stepped misregistration burst after the plate
 * appears, followed by a single quick echo. Then the sheet holds still. It
 * stops offscreen, when the tab is hidden, and never runs under reduced motion.
 * The negative duplicate is a light impression on the dark theme and a
 * deep-ink impression on the light one.
 */
withDefaults(defineProps<{ alt?: string }>(), { alt: '' })

const FULL_MS = 640
const QUICK_MS = 360
const END_PAD_MS = 40
const FIRST_DELAY_MS = 900
const ECHO_GAP_MS = 1600
const REPLAY_DELAY_MS = 240
const RETURN_DELAY_MS = 4800
const MAX_PASSES = 2

type GlitchKind = 'full' | 'quick'

const stage = ref<HTMLElement | null>(null)
const glitchKind = ref<GlitchKind | null>(null)

const motionQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null
let motionOK = !(motionQuery?.matches ?? false)

let observer: IntersectionObserver | null = null
let burstTimer = 0
let endTimer = 0
let returnTimer = 0
let visible = false
let hasSurfaced = false
let passesLeft = MAX_PASSES
let nextDelay = FIRST_DELAY_MS

function clearBurstTimer() {
  if (!burstTimer) return
  window.clearTimeout(burstTimer)
  burstTimer = 0
}

function clearEndTimer() {
  if (!endTimer) return
  window.clearTimeout(endTimer)
  endTimer = 0
}

function clearReturnTimer() {
  if (!returnTimer) return
  window.clearTimeout(returnTimer)
  returnTimer = 0
}

function canRun() {
  return motionOK && visible && !document.hidden
}

function trigger() {
  if (!canRun() || glitchKind.value || passesLeft <= 0) return

  const kind: GlitchKind = passesLeft === MAX_PASSES ? 'full' : 'quick'
  passesLeft -= 1
  glitchKind.value = kind
  const duration = kind === 'full' ? FULL_MS : QUICK_MS

  endTimer = window.setTimeout(() => {
    endTimer = 0
    glitchKind.value = null

    if (passesLeft > 0) schedule(ECHO_GAP_MS)
  }, duration + END_PAD_MS)
}

function schedule(delay: number) {
  clearBurstTimer()
  if (!canRun() || glitchKind.value || passesLeft <= 0) return

  burstTimer = window.setTimeout(() => {
    burstTimer = 0
    trigger()
  }, delay)
}

function scheduleReturnReset() {
  clearReturnTimer()
  if (!hasSurfaced || visible || passesLeft > 0) return

  returnTimer = window.setTimeout(() => {
    returnTimer = 0
    if (visible || !motionOK || document.hidden) return

    // Only a short echo returns. The full misregistration remains a first-visit
    // calibration; returning to the hero should feel like checking the plate,
    // not watching the whole sequence again.
    passesLeft = 1
    nextDelay = REPLAY_DELAY_MS
  }, RETURN_DELAY_MS)
}

function onIntersect(entries: IntersectionObserverEntry[]) {
  const entry = entries[0]
  if (!entry) return

  const nowVisible = entry.isIntersecting
  if (nowVisible === visible) return

  visible = nowVisible

  if (visible) {
    hasSurfaced = true
    clearReturnTimer()

    if (passesLeft > 0) schedule(nextDelay)
    return
  }

  clearBurstTimer()
  scheduleReturnReset()
}

function onVisibilityChange() {
  if (document.hidden) {
    clearBurstTimer()
    clearEndTimer()
    clearReturnTimer()
    glitchKind.value = null
    return
  }

  if (visible) {
    if (passesLeft > 0) schedule(nextDelay)
  } else {
    scheduleReturnReset()
  }
}

function onMotionChange(event: MediaQueryListEvent) {
  motionOK = !event.matches

  if (!motionOK) {
    clearBurstTimer()
    clearEndTimer()
    clearReturnTimer()
    glitchKind.value = null
    return
  }

  if (visible && passesLeft > 0) schedule(nextDelay)
  else scheduleReturnReset()
}

onMounted(() => {
  if (!('IntersectionObserver' in window) || !stage.value) return

  observer = new IntersectionObserver(onIntersect, { threshold: 0.25 })
  observer.observe(stage.value)
  document.addEventListener('visibilitychange', onVisibilityChange)
  motionQuery?.addEventListener?.('change', onMotionChange)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  clearBurstTimer()
  clearEndTimer()
  clearReturnTimer()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  motionQuery?.removeEventListener?.('change', onMotionChange)
})
</script>

<template>
  <div
    ref="stage"
    class="identity-plate-stage"
    :class="{
      'is-glitching': glitchKind !== null,
      'is-glitching--quick': glitchKind === 'quick',
    }"
  >
    <div class="ip-main">
      <IdentityPlateSheet
        role="img"
        :aria-label="alt"
        :glitching="glitchKind !== null"
        :quick="glitchKind === 'quick'"
      />
    </div>

    <div class="ip-ghost ip-ghost--full" aria-hidden="true">
      <IdentityPlateSheet tone="ghost" id-prefix="ip-ghost-full" />
    </div>
    <div class="ip-ghost ip-ghost--bands" aria-hidden="true">
      <IdentityPlateSheet tone="ghost" id-prefix="ip-ghost-bands" />
    </div>
  </div>
</template>

<style scoped>
.identity-plate-stage {
  position: relative;
  isolation: isolate;

  --ip-ghost-scale: 1;
  --ip-ghost-duration: 640ms;
  --ip-ghost-alpha: 1;
  --ip-scan-alpha: 1;
}

.identity-plate-stage.is-glitching--quick {
  --ip-ghost-scale: 0.5;
  --ip-ghost-duration: 360ms;
  --ip-ghost-alpha: 0.8;
  --ip-scan-alpha: 0.72;
}

.ip-main {
  position: relative;
  z-index: 1;
  line-height: 0;
}

.ip-ghost {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.ip-ghost--bands {
  z-index: 3;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 17%,
    #000 17%,
    #000 25%,
    transparent 25%,
    transparent 46%,
    #000 46%,
    #000 54%,
    transparent 54%,
    transparent 72%,
    #000 72%,
    #000 79%,
    transparent 79%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 17%,
    #000 17%,
    #000 25%,
    transparent 25%,
    transparent 46%,
    #000 46%,
    #000 54%,
    transparent 54%,
    transparent 72%,
    #000 72%,
    #000 79%,
    transparent 79%,
    transparent 100%
  );
}

.identity-plate-stage.is-glitching .ip-ghost {
  visibility: visible;
}

/* A plotter head passing over the sheet: one faint line, twice. */
.identity-plate-stage::after {
  content: '';
  position: absolute;
  z-index: 4;
  top: 0;
  right: -2%;
  left: -2%;
  height: 12%;
  color: var(--c-ink);
  background: linear-gradient(
    to bottom,
    transparent 0%,
    currentColor 46%,
    currentColor 54%,
    transparent 100%
  );
  opacity: 0;
  pointer-events: none;
  transform: translateY(-140%);
}

@media (prefers-reduced-motion: no-preference) {
  .identity-plate-stage.is-glitching .ip-ghost {
    will-change: transform, opacity;
  }

  .identity-plate-stage.is-glitching .ip-ghost--full {
    animation: ip-ghost-full var(--ip-ghost-duration) steps(1, end) both;
  }

  .identity-plate-stage.is-glitching .ip-ghost--bands {
    animation: ip-ghost-bands var(--ip-ghost-duration) steps(1, end) both;
  }

  .identity-plate-stage.is-glitching::after {
    animation: ip-scan-sweep var(--ip-ghost-duration) steps(1, end) both;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ip-ghost,
  .identity-plate-stage::after {
    display: none;
  }
}

@keyframes ip-ghost-full {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }

  6% {
    opacity: calc(0.62 * var(--ip-ghost-alpha));
    transform: translate(calc(-18px * var(--ip-ghost-scale)), calc(-4px * var(--ip-ghost-scale)));
  }

  18% {
    opacity: calc(0.3 * var(--ip-ghost-alpha));
    transform: translate(calc(10px * var(--ip-ghost-scale)), calc(3px * var(--ip-ghost-scale)));
  }

  30% {
    opacity: calc(0.68 * var(--ip-ghost-alpha));
    transform: translate(calc(-26px * var(--ip-ghost-scale)), calc(-2px * var(--ip-ghost-scale)));
  }

  46% {
    opacity: calc(0.4 * var(--ip-ghost-alpha));
    transform: translate(calc(14px * var(--ip-ghost-scale)), calc(5px * var(--ip-ghost-scale)));
  }

  60% {
    opacity: calc(0.55 * var(--ip-ghost-alpha));
    transform: translate(calc(-12px * var(--ip-ghost-scale)), calc(1px * var(--ip-ghost-scale)));
  }

  76% {
    opacity: calc(0.22 * var(--ip-ghost-alpha));
    transform: translate(calc(6px * var(--ip-ghost-scale)), calc(-2px * var(--ip-ghost-scale)));
  }

  100% {
    opacity: 0;
    transform: translate(0, 0);
  }
}

@keyframes ip-ghost-bands {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }

  8% {
    opacity: calc(0.9 * var(--ip-ghost-alpha));
    transform: translate(calc(20px * var(--ip-ghost-scale)), calc(3px * var(--ip-ghost-scale)));
  }

  20% {
    opacity: calc(0.55 * var(--ip-ghost-alpha));
    transform: translate(calc(-14px * var(--ip-ghost-scale)), calc(-4px * var(--ip-ghost-scale)));
  }

  33% {
    opacity: calc(0.95 * var(--ip-ghost-alpha));
    transform: translate(calc(24px * var(--ip-ghost-scale)), calc(1px * var(--ip-ghost-scale)));
  }

  47% {
    opacity: calc(0.65 * var(--ip-ghost-alpha));
    transform: translate(calc(-18px * var(--ip-ghost-scale)), calc(4px * var(--ip-ghost-scale)));
  }

  61% {
    opacity: calc(0.82 * var(--ip-ghost-alpha));
    transform: translate(calc(12px * var(--ip-ghost-scale)), calc(-2px * var(--ip-ghost-scale)));
  }

  76% {
    opacity: calc(0.25 * var(--ip-ghost-alpha));
    transform: translate(calc(-6px * var(--ip-ghost-scale)), calc(1px * var(--ip-ghost-scale)));
  }

  100% {
    opacity: 0;
    transform: translate(0, 0);
  }
}

@keyframes ip-scan-sweep {
  0% {
    opacity: 0;
    transform: translateY(-140%);
  }

  8% {
    opacity: calc(0.2 * var(--ip-scan-alpha));
    transform: translateY(40%);
  }

  22% {
    opacity: calc(0.18 * var(--ip-scan-alpha));
    transform: translateY(310%);
  }

  30% {
    opacity: calc(0.12 * var(--ip-scan-alpha));
    transform: translateY(480%);
  }

  34% {
    opacity: 0;
    transform: translateY(540%);
  }

  60% {
    opacity: calc(0.14 * var(--ip-scan-alpha));
    transform: translateY(820%);
  }

  70% {
    opacity: 0;
    transform: translateY(900%);
  }

  100% {
    opacity: 0;
    transform: translateY(-140%);
  }
}
</style>
