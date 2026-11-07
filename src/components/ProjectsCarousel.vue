<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import type { Project } from '@/data/projects'
import type { ExperienceEntry } from '@/data/experience'
import type { Testimonial } from '@/data/testimonials'
import ProjectTile from './ProjectTile.vue'
import UiIcon from './ui/UiIcon.vue'

const props = defineProps<{
  projects: Project[]
  experiences: ExperienceEntry[]
  reviews: Testimonial[]
  labelId: string
}>()

const { copy } = usePreferences()

const track = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)

function updateBounds() {
  const element = track.value
  if (!element) return

  canPrev.value = element.scrollLeft > 4
  canNext.value = element.scrollLeft + element.clientWidth < element.scrollWidth - 4
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function scrollCards(direction: -1 | 1) {
  const element = track.value
  if (!element) return

  const card = element.querySelector<HTMLElement>('[data-carousel-item]')
  const gap = Number.parseFloat(getComputedStyle(element).columnGap || '0') || 16
  const distance = card ? card.getBoundingClientRect().width + gap : element.clientWidth * 0.8

  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'

  if (typeof element.scrollBy === 'function') {
    element.scrollBy({ left: direction * distance, behavior })
  } else {
    element.scrollLeft += direction * distance
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    scrollCards(-1)
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    scrollCards(1)
  }
}

onMounted(() => {
  updateBounds()
  window.addEventListener('resize', updateBounds)
})

watch(
  () => props.projects,
  async () => {
    await nextTick()
    updateBounds()
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateBounds)
})
</script>

<template>
  <div class="mt-8">
    <div class="mb-4 flex items-center justify-end gap-2">
      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel/20 text-soft transition hover:border-soft disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="!canPrev"
        :aria-label="copy.ui.carouselPrev"
        @click="scrollCards(-1)"
      >
        <UiIcon name="arrow-left" :size="16" />
      </button>
      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel/20 text-soft transition hover:border-soft disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="!canNext"
        :aria-label="copy.ui.carouselNext"
        @click="scrollCards(1)"
      >
        <UiIcon name="arrow-right" :size="16" />
      </button>
    </div>

    <div
      ref="track"
      class="carousel-track -mx-6 flex snap-x snap-mandatory scroll-pl-6 items-start gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:scroll-pl-0 md:px-0"
      role="region"
      :aria-labelledby="labelId"
      tabindex="0"
      @scroll.passive="updateBounds"
      @keydown="onKeydown"
    >
      <div
        v-for="project in projects"
        :key="project.slug"
        data-carousel-item
        class="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[360px]"
      >
        <ProjectTile
          :project="project"
          :experiences="experiences"
          :reviews="reviews"
          variant="preview"
          :heading-level="4"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-track {
  scrollbar-color: var(--c-line-strong) transparent;
  scrollbar-width: thin;
}

.carousel-track::-webkit-scrollbar {
  height: 6px;
}

.carousel-track::-webkit-scrollbar-track {
  background: transparent;
}

.carousel-track::-webkit-scrollbar-thumb {
  background: var(--c-line-strong);
  border-radius: 9999px;
}
</style>
