<script setup lang="ts">
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { experienceAnchor, reviewAnchor } from '@/data/anchors'
import type { ExperienceEntry } from '@/data/experience'
import type { Testimonial } from '@/data/testimonials'
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import Avatar from '@/components/ui/vue/Avatar.vue'

defineProps<{
  experiences: ExperienceEntry[]
  reviews: Testimonial[]
}>()

const { copy } = usePreferences()

function experienceLabel(entry: ExperienceEntry) {
  return `${copy.value.projects.experienceLabel}: ${entry.org}, ${entry.role}`
}

function reviewLabel(review: Testimonial) {
  const role = review.author.roles[0]
  return `${copy.value.projects.reviewLabel}: ${review.author.name}${role ? `, ${role}` : ''}`
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
       class="type-action group/link inline-flex min-h-8 max-w-full items-center gap-1.5 leading-snug text-soft transition hover:text-ink"
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
      :key="review.anchorId"
      :to="{ name: 'home', hash: `#${reviewAnchor(review.anchorId)}` }"
      :aria-label="reviewLabel(review)"
       class="type-action group/link inline-flex min-h-8 max-w-full items-center gap-1.5 leading-snug text-soft transition hover:text-ink"
    >
      <Avatar :name="review.author.name" :photo="review.author.photo" :size="20" />
      <span class="min-w-0 break-words">{{ review.author.name }}</span>
      <UiIcon
        name="arrow-down"
        :size="11"
        class="shrink-0 transition-transform group-hover/link:translate-y-0.5"
      />
    </RouterLink>
  </div>
</template>
