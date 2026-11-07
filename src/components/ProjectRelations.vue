<script setup lang="ts">
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { experienceAnchor, reviewAnchor } from '@/data/anchors'
import type { ExperienceEntry } from '@/data/experience'
import type { Testimonial } from '@/data/testimonials'
import UiIcon from './ui/UiIcon.vue'

defineProps<{
  experiences: ExperienceEntry[]
  reviews: Testimonial[]
}>()

const { copy } = usePreferences()

function reviewName(review: Testimonial) {
  return `${review.author.firstName} ${review.author.lastName}`
}

function experienceLabel(entry: ExperienceEntry) {
  return `${copy.value.projects.experienceLabel}: ${entry.org}, ${entry.role}`
}

function reviewLabel(review: Testimonial) {
  const role = review.author.roles[0]
  return `${copy.value.projects.reviewLabel}: ${reviewName(review)}${role ? `, ${role}` : ''}`
}
</script>

<template>
  <div
    v-if="experiences.length || reviews.length"
    class="flex flex-wrap items-center gap-x-4 gap-y-1.5"
  >
    <span
      class="shrink-0 font-mono text-[10px] uppercase leading-none tracking-[0.14em] text-muted"
    >
      {{ copy.projects.relationsLabel }}
    </span>

    <RouterLink
      v-for="entry in experiences"
      :key="entry.id"
      :to="{ name: 'home', hash: `#${experienceAnchor(entry.id)}` }"
      :aria-label="experienceLabel(entry)"
      class="group/link inline-flex min-h-8 max-w-full items-center gap-1.5 text-[11.5px] leading-snug text-soft transition hover:text-ink"
    >
      <UiIcon name="layers" :size="12" class="shrink-0 text-muted" />
      <span class="min-w-0 break-words">{{ entry.org }}</span>
      <UiIcon
        name="arrow-up"
        :size="11"
        class="shrink-0 transition-transform group-hover/link:-translate-y-0.5"
      />
    </RouterLink>

    <RouterLink
      v-for="review in reviews"
      :key="review.id"
      :to="{ name: 'home', hash: `#${reviewAnchor(review.id)}` }"
      :aria-label="reviewLabel(review)"
      class="group/link inline-flex min-h-8 max-w-full items-center gap-1.5 text-[11.5px] leading-snug text-soft transition hover:text-ink"
    >
      <img
        :src="review.author.photo"
        alt=""
        width="20"
        height="20"
        loading="lazy"
        decoding="async"
        class="h-5 w-5 shrink-0 rounded-full border border-line-strong object-cover"
      />
      <span class="min-w-0 break-words">{{ review.author.firstName }}</span>
      <UiIcon
        name="arrow-down"
        :size="11"
        class="shrink-0 transition-transform group-hover/link:translate-y-0.5"
      />
    </RouterLink>
  </div>
</template>
