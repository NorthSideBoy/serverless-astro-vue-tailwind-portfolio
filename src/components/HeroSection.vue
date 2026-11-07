<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { useRevealCycle } from '@/composables/useRevealCycle'
import IdentityPlate from '@/components/IdentityPlate.vue'
import SealEyebrow from '@/components/ui/SealEyebrow.vue'

const { copy } = usePreferences()
const copyRoot = ref<HTMLElement | null>(null)
const { armed } = useRevealCycle(copyRoot, { threshold: 0.3 })
</script>

<template>
  <section
    id="top"
    class="hero-texture dot-field relative overflow-hidden border-b border-line bg-page"
    aria-labelledby="hero-title"
  >
    <div class="shell relative">
      <div
        class="grid items-start gap-12 pb-16 pt-[76px] md:gap-14 md:pb-20 md:pt-[100px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-20 xl:pb-[168px] xl:pt-12"
      >
        <div ref="copyRoot" class="hero-copy max-w-[640px]" :class="{ 'is-armed': armed }">
          <div class="flex items-center gap-3">
            <p class="mono-label text-soft">
              <SealEyebrow seal="零" :label="copy.hero.eyebrow" />
            </p>
            <span class="h-px w-16 bg-line-strong/70" aria-hidden="true" />
          </div>

          <h1
            id="hero-title"
            class="mt-5 font-serif text-[clamp(34px,7.6vw,76px)] font-black leading-[1.02] tracking-[-0.035em] text-ink xl:mt-6"
          >
            {{ copy.hero.name }}
          </h1>

          <p
            class="mt-3 font-display text-[18px] font-medium leading-tight text-ink/80 md:text-[21px]"
          >
            {{ copy.about.name }}
          </p>

          <p
            class="mt-4 font-mono text-[13px] font-medium uppercase leading-relaxed tracking-[0.16em] text-ink/85 md:text-[14px]"
          >
            {{ copy.hero.role }}
          </p>

          <p class="mt-5 max-w-[620px] text-[19px] leading-[1.55] text-muted md:text-xl">
            {{ copy.hero.statement }}
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <RouterLink :to="{ path: '/', hash: '#projects' }" class="btn-primary min-w-[196px]">
              {{ copy.hero.primary }}
            </RouterLink>
            <RouterLink :to="{ path: '/', hash: '#contact' }" class="btn-ghost min-w-[168px]">
              {{ copy.hero.secondary }}
            </RouterLink>
          </div>

          <p
            class="mt-7 flex items-start gap-2.5 font-mono text-[11px] leading-relaxed text-muted md:text-[12px]"
          >
            <span
              class="relative mt-[0.45em] flex h-2 w-2 shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              <span class="status-ping absolute inset-0 rounded-full bg-status/70" />
              <span class="h-2 w-2 rounded-full bg-status ring-4 ring-status/10" />
            </span>
            {{ copy.hero.availability }}
          </p>
        </div>

        <div class="flex justify-center xl:justify-end">
          <IdentityPlate
            :alt="copy.hero.imageAlt"
            class="hero-mark w-full max-w-[280px] md:max-w-[320px] xl:max-w-[400px]"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-texture {
  --dot-field-height: 100%;
  --dot-field-strength: 100%;
  --dot-field-mask: none;
}

@media (prefers-reduced-motion: no-preference) {
  .hero-copy > * {
    animation: hero-rise 620ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .hero-copy > *:nth-child(2) {
    animation-delay: 50ms;
  }

  .hero-copy > *:nth-child(3) {
    animation-delay: 100ms;
  }

  .hero-copy > *:nth-child(4) {
    animation-delay: 150ms;
  }

  .hero-copy > *:nth-child(5) {
    animation-delay: 200ms;
  }

  .hero-copy > *:nth-child(6) {
    animation-delay: 250ms;
  }

  .hero-copy > *:nth-child(7) {
    animation-delay: 300ms;
  }

  /* Re-arm while the copy is offscreen. Removing the class replays the same
     authored stagger, so returning to the top feels like re-entering the file
     rather than a static page jumping back into place. */
  .hero-copy.is-armed > * {
    animation: none;
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }

  .hero-copy.is-armed .status-ping {
    animation: none;
  }

  .hero-copy:not(.is-armed) .status-ping {
    animation: status-ping 2.6s cubic-bezier(0, 0, 0.2, 1) 3 forwards;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-ping {
    display: none;
  }
}

@keyframes status-ping {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70%,
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
