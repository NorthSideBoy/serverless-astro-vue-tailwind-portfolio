<script setup lang="ts">
import { ref } from 'vue'
import { useRevealCycle } from '@/composables/useRevealCycle'
import SealEyebrow from './SealEyebrow.vue'

defineProps<{
  eyebrow: string
  seal?: string
  title: string
  lead?: string
  titleId?: string
  signal?: boolean
}>()

const root = ref<HTMLElement | null>(null)
const { armed } = useRevealCycle(root, { once: true })

</script>

<template>
  <header
    ref="root"
    class="section-marker section-header"
    :class="[signal ? 'section-signal' : '', armed ? 'is-armed' : '']"
  >
    <div class="section-marker__meta flex items-center gap-4">
      <p class="mono-label min-w-0" :class="signal ? 'text-soft' : 'text-muted'">
        <SealEyebrow :seal="seal" :label="eyebrow" />
      </p>
      <span class="section-marker__rule h-px flex-1 bg-line" aria-hidden="true" />
    </div>
    <h2
      :id="titleId"
      class="section-marker__title type-chapter mt-5 font-display font-bold leading-[1.05] tracking-[-0.025em] text-ink"
    >
      {{ title }}
    </h2>
    <p
      v-if="lead"
      class="section-marker__lead section-header__lead section-lead text-muted"
    >
      {{ lead }}
    </p>
  </header>
</template>

<style scoped>
.section-marker__rule {
  transform-origin: left center;
}

@media (prefers-reduced-motion: no-preference) {
  .section-marker__rule {
    transition: transform 720ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .section-marker__meta,
  .section-marker__title,
  .section-marker__lead {
    transition:
      opacity 480ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 480ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .section-marker__title {
    transition-delay: 70ms;
  }

  .section-marker__lead {
    transition-delay: 130ms;
  }

  .section-marker__title::after {
    transition: opacity 420ms ease 180ms;
  }

  /* Re-arming happens fully offscreen: snap to the hidden state so the next
     entry always starts from zero instead of animating out of sight. */
  .section-marker.is-armed .section-marker__rule,
  .section-marker.is-armed .section-marker__meta,
  .section-marker.is-armed .section-marker__title,
  .section-marker.is-armed .section-marker__lead,
  .section-marker.is-armed .section-marker__title::after {
    transition: none;
  }

  .section-marker.is-armed .section-marker__rule {
    transform: scaleX(0);
  }

  .section-marker.is-armed .section-marker__meta,
  .section-marker.is-armed .section-marker__title,
  .section-marker.is-armed .section-marker__lead {
    opacity: 0;
    transform: translate3d(0, 7px, 0);
  }

  .section-marker.is-armed .section-marker__title::after {
    opacity: 0;
  }
}
</style>
