<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

interface LayerInfo {
  index: string
  label: string
  detail: string
}

const props = defineProps<{
  layers: LayerInfo[]
  active: number
}>()

// Onion rings, data at the core: aqua → blue → deep → violet.
// The semantic tokens keep this ramp readable in both themes.
const ringColors = ['var(--c-layer-1)', 'var(--c-layer-2)', 'var(--c-layer-3)', 'var(--c-layer-4)']

const CX = 340
const CY = 225
const baseRadii = [54, 96, 138, 180]
const ringOffset = Math.PI / 12
const motionQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null
const motionOK = ref(!(motionQuery?.matches ?? false))
const root = ref<HTMLElement | null>(null)
const paused = ref(false)
const pulse = ref(0)
// Server and client must paint the same first frame. The selected layer starts
// at its resting scale (1.08); the initial explode then has nothing to tween,
// while every explicit tab choice still animates from the current radii.
const mult = reactive<number[]>(baseRadii.map((_, index) => (index === props.active ? 1.08 : 1)))

let tweenRaf = 0
let observer: IntersectionObserver | null = null

function onMotionChange(event: MediaQueryListEvent) {
  motionOK.value = !event.matches
  explode(props.active)
}

function baseRadius(i: number) {
  return baseRadii[i] ?? 54 + i * 42
}

function nodeCount(i: number) {
  return 6 + i * 2
}

function ringRadius(i: number) {
  return baseRadius(i) * (mult[i] ?? 1)
}

function nodeAngle(ring: number, node: number) {
  return (node / nodeCount(ring)) * Math.PI * 2 + ring * ringOffset
}

function nodePos(ring: number, node: number) {
  const angle = nodeAngle(ring, node)
  const radius = ringRadius(ring)
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  }
}

const rings = computed(() =>
  props.layers.map((layer, i) => ({
    layer,
    i,
    radius: ringRadius(i),
    color: ringColors[i % ringColors.length] ?? 'var(--c-cyan)',
  })),
)

const nodes = computed(() =>
  rings.value.flatMap((ring) =>
    Array.from({ length: nodeCount(ring.i) }, (_, j) => ({
      ring: ring.i,
      node: j,
      color: ring.color,
      ...nodePos(ring.i, j),
    })),
  ),
)

const links = computed(() => {
  const result: { ring: number; x1: number; y1: number; x2: number; y2: number }[] = []
  for (let i = 0; i < props.layers.length - 1; i++) {
    const innerCount = nodeCount(i)
    const outerCount = nodeCount(i + 1)
    for (let j = 0; j < innerCount; j++) {
      const from = nodePos(i, j)
      const angle = nodeAngle(i, j)
      const raw = (angle - (i + 1) * ringOffset) / ((Math.PI * 2) / outerCount)
      const outerIndex = ((Math.round(raw) % outerCount) + outerCount) % outerCount
      const to = nodePos(i + 1, outerIndex)
      result.push({ ring: i + 1, x1: from.x, y1: from.y, x2: to.x, y2: to.y })
    }
  }
  return result
})

function explode(target: number) {
  const goals = props.layers.map((_, i) => (i === target ? 1.08 : 1))
  const from = [...mult]
  if (from.length < goals.length) goals.length = from.length

  if (typeof window === 'undefined' || !motionOK.value) {
    goals.forEach((value, i) => {
      mult[i] = value ?? 1
    })
    return
  }

  cancelAnimationFrame(tweenRaf)
  const start = performance.now()
  const duration = 420

  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    goals.forEach((goal, i) => {
      const current = from[i] ?? 1
      mult[i] = current + ((goal ?? 1) - current) * eased
    })
    if (progress < 1) tweenRaf = requestAnimationFrame(step)
  }

  tweenRaf = requestAnimationFrame(step)
}

watch(() => props.active, explode, { immediate: true })

watch(
  () => props.active,
  () => {
    if (!paused.value) pulse.value += 1
  },
)

onMounted(() => {
  explode(props.active)
  motionQuery?.addEventListener('change', onMotionChange)
  if (!('IntersectionObserver' in window) || !root.value) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry) paused.value = !entry.isIntersecting
    },
    { threshold: 0 },
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', onMotionChange)
  cancelAnimationFrame(tweenRaf)
  observer?.disconnect()
})
</script>

<template>
  <div ref="root" class="plate-root" :class="paused ? 'is-paused' : ''" aria-hidden="true">
    <svg viewBox="0 0 680 450" focusable="false" class="block h-full w-full">
      <!-- registration corner marks, plate language -->
      <path
        d="M8 16V8h8M664 8h8v8M8 434v8h8M664 442h8v-8"
        fill="none"
        stroke="var(--c-line-strong)"
        stroke-width="1"
        opacity="0.8"
      />

      <!-- scanning ring: static structure, motion belongs to the selected layer -->
      <circle
        :cx="CX"
        :cy="CY"
        r="202"
        fill="none"
        stroke="var(--c-line-strong)"
        stroke-width="1"
        stroke-dasharray="2 12"
        opacity="0.42"
      />

      <!-- onion discs, outer shell first, data core last -->
      <circle
        v-for="ring in [...rings].reverse()"
        :key="`disc-${ring.layer.index}`"
        :cx="CX"
        :cy="CY"
        :r="ring.radius"
        :fill="ring.color"
        :fill-opacity="active === ring.i ? 0.09 : 0.025"
        stroke="none"
        class="layer-disc"
      />

      <!-- radial connectors between neighbouring rings -->
      <g>
        <line
          v-for="(link, index) in links"
          :key="`link-${index}`"
          class="link-flow"
          :class="{ 'is-flowing': active === link.ring }"
          :x1="link.x1"
          :y1="link.y1"
          :x2="link.x2"
          :y2="link.y2"
          :stroke="
            active === link.ring
              ? (rings[link.ring]?.color ?? 'var(--c-line-strong)')
              : 'var(--c-line-strong)'
          "
          :opacity="active === link.ring ? 0.82 : 0.28"
          :style="`animation-delay: ${(index % 6) * -0.7}s`"
        />
      </g>

      <!-- layer rings -->
      <g
        v-for="ring in rings"
        :key="`group-${ring.layer.index}`"
        :class="active === ring.i ? 'layer-ring-group is-active' : 'layer-ring-group'"
        :style="`color: ${ring.color}`"
      >
        <circle
          :cx="CX"
          :cy="CY"
          :r="ring.radius"
          fill="none"
          :stroke="ring.color"
          :stroke-opacity="active === ring.i ? 1 : 0.32"
          :stroke-width="active === ring.i ? 1.8 : 1"
          class="layer-ring"
        />

        <!-- only the selected layer keeps a live packet; the rest hold position -->
        <g
          class="packet-orbit"
          :class="{ 'is-flowing': active === ring.i }"
          :style="`--orbit-dur: ${(16 + ring.i * 4).toFixed(1)}s; --orbit-dir: ${ring.i % 2 ? 'reverse' : 'normal'}`"
        >
          <circle
            :cx="CX + ring.radius"
            :cy="CY"
            r="4.5"
            :fill="ring.color"
            :opacity="active === ring.i ? 0.95 : 0.28"
            class="packet"
          />
        </g>
      </g>

      <!-- stable nodes make the onion structure legible -->
      <circle
        v-for="node in nodes"
        :key="`node-${node.ring}-${node.node}`"
        class="layer-node"
        :cx="node.x"
        :cy="node.y"
        :r="active === node.ring ? 3.2 : 2.2"
        :fill="node.color"
        :opacity="active === node.ring ? 0.85 : 0.24"
      />

      <!-- one pulse acknowledges the layer chosen by the tabs -->
      <circle
        v-if="pulse > 0 && rings[active]"
        :key="`shock-${pulse}`"
        class="shockwave"
        :cx="CX"
        :cy="CY"
        :r="rings[active]?.radius ?? 90"
        fill="none"
        :stroke="rings[active]?.color ?? 'var(--c-soft)'"
        stroke-width="2"
      />

      <!-- ring indices -->
      <text
        v-for="ring in rings"
        :key="`index-${ring.layer.index}`"
        :x="CX - (ring.radius - 14) * 0.62"
        :y="CY - (ring.radius - 14) * 0.62"
        :fill="ring.color"
        :opacity="active === ring.i ? 1 : 0.4"
        class="plate-index"
      >
        {{ ring.layer.index }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.plate-root {
  position: relative;
  width: 100%;
  max-width: 680px;
  margin-inline: auto;
  aspect-ratio: 680 / 450;
  overflow: hidden;
  user-select: none;
}

.layer-disc,
.layer-ring,
.layer-node,
.link-flow,
.packet {
  transition:
    opacity 260ms ease,
    stroke-opacity 260ms ease,
    stroke-width 260ms ease,
    fill-opacity 260ms ease;
}

.plate-index {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-anchor: middle;
  dominant-baseline: central;
}

.link-flow {
  stroke-dasharray: 4 7;
}

.layer-ring-group.is-active .layer-ring {
  filter: drop-shadow(0 0 8px currentColor);
}

.packet {
  filter: drop-shadow(0 0 4px currentColor);
}

.shockwave {
  transform-box: view-box;
  transform-origin: 340px 225px;
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .shockwave {
    animation: shockwave 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .link-flow.is-flowing {
    animation: link-drift 6.4s linear infinite;
  }

  .packet-orbit.is-flowing {
    transform-box: view-box;
    transform-origin: 340px 225px;
    animation: packet-orbit var(--orbit-dur, 18s) linear infinite;
    animation-direction: var(--orbit-dir, normal);
  }
}

.is-paused *,
.is-paused {
  animation-play-state: paused !important;
}

@keyframes shockwave {
  from {
    transform: scale(0.88);
    opacity: 0.75;
  }
  to {
    transform: scale(1.16);
    opacity: 0;
  }
}

@keyframes link-drift {
  to {
    stroke-dashoffset: -22;
  }
}

@keyframes packet-orbit {
  to {
    transform: rotate(360deg);
  }
}
</style>
