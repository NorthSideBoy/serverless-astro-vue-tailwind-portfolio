<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { useRevealCycle } from '@/composables/useRevealCycle'
import { hasThemeVariant } from '@/data/themeMedia'
import type { ProjectMedia } from '@/data/projects'

const props = withDefaults(
  defineProps<{
    media: ProjectMedia
    variant?: 'featured' | 'card'
    eager?: boolean
    trace?: boolean
  }>(),
  { variant: 'card', eager: false, trace: false },
)

const { locale } = usePreferences()

const root = ref<HTMLElement | null>(null)
const mounted = ref(false)
const { armed } = useRevealCycle(root, { enabled: props.trace, threshold: 0.3 })
const traced = computed(() => mounted.value && props.trace && !armed.value)
const hasCoverThemeVariant = computed(() =>
  props.media.type === 'cover'
    ? hasThemeVariant(props.media.light, props.media.dark)
    : false,
)

onMounted(() => {
  mounted.value = true
})

</script>

<template>
  <figure
    ref="root"
    class="project-media"
    :class="[
      variant === 'featured'
        ? 'relative min-w-0 overflow-hidden border border-line bg-sunken'
        : 'relative aspect-[16/10] overflow-hidden border-b border-line bg-sunken',
      traced ? 'is-traced' : '',
    ]"
  >
    <span
      class="project-media__scan scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:hidden"
      aria-hidden="true"
    />
    <span class="project-media__trace project-media__trace--top" aria-hidden="true" />
    <span class="project-media__trace project-media__trace--bottom" aria-hidden="true" />
    <template v-if="media.type === 'cover'">
      <template v-if="hasCoverThemeVariant">
        <img
          :src="media.dark"
          :alt="variant === 'featured' ? media.alt[locale] : ''"
          :width="media.width"
          :height="media.height"
          :loading="eager ? 'eager' : 'lazy'"
          decoding="async"
          :class="[
            'theme-media-dark',
            variant === 'featured'
              ? 'aspect-[16/10] w-full object-cover'
              : 'h-full w-full object-cover',
          ]"
        />
        <img
          :src="media.light"
          :alt="variant === 'featured' ? media.alt[locale] : ''"
          :width="media.width"
          :height="media.height"
          :loading="eager ? 'eager' : 'lazy'"
          decoding="async"
          :class="[
            'theme-media-light',
            variant === 'featured'
              ? 'aspect-[16/10] w-full object-cover'
              : 'h-full w-full object-cover',
          ]"
        />
      </template>
      <img
        v-else
        :src="media.light"
        :alt="variant === 'featured' ? media.alt[locale] : ''"
        :width="media.width"
        :height="media.height"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        :class="[
          variant === 'featured'
            ? 'aspect-[16/10] w-full object-cover'
            : 'h-full w-full object-cover',
        ]"
      />
    </template>

    <div v-else class="flex aspect-[16/10] w-full items-center justify-center bg-sunken p-6">
      <div
        v-if="media.type === 'logo'"
        class="flex items-center justify-center border border-line p-3"
        :class="[
          variant === 'featured' ? 'h-24 w-24' : 'h-16 w-16 md:h-20 md:w-20',
          media.surface === 'dark' ? 'bg-ink' : 'bg-white',
        ]"
      >
        <img
          :src="media.src"
          alt=""
          :width="media.width"
          :height="media.height"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-contain"
        />
      </div>

      <span
        v-else
        class="font-display font-bold leading-none tracking-[-0.05em] text-soft/85"
        :class="variant === 'featured' ? 'text-[72px] md:text-[88px]' : 'text-[48px]'"
        aria-hidden="true"
      >
        {{ media.label }}
      </span>
    </div>
  </figure>
</template>

<style scoped>
.project-media__scan {
  position: absolute;
  inset-inline: 0;
  top: 0;
  z-index: 2;
  height: 1px;
  pointer-events: none;
  transform-origin: left center;
  background-image: linear-gradient(90deg, var(--c-soft), var(--c-aqua) 55%, transparent);
}

.project-media__trace {
  position: absolute;
  inset-inline: 0;
  z-index: 2;
  height: 1px;
  pointer-events: none;
  opacity: 0;
  background-image: linear-gradient(
    90deg,
    transparent,
    var(--c-soft) 16%,
    var(--c-aqua) 84%,
    transparent
  );
}

.project-media__trace--top {
  top: 11px;
  transform-origin: left center;
}

.project-media__trace--bottom {
  bottom: 11px;
  transform-origin: right center;
}

@media (prefers-reduced-motion: no-preference) {
  .project-media__scan {
    transition: scale 520ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .is-traced .project-media__trace {
    animation: project-media-trace 980ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .is-traced .project-media__trace--top {
    animation-delay: 80ms;
  }

  .is-traced .project-media__trace--bottom {
    animation-delay: 200ms;
  }
}

@keyframes project-media-trace {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }

  10% {
    opacity: 1;
  }

  56% {
    opacity: 1;
    transform: scaleX(1);
  }

  100% {
    opacity: 0;
    transform: scaleX(1);
  }
}
</style>
