<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { experienceAnchor, projectAnchor } from '@/data/anchors'
import type { ReviewExperience, ReviewProject, Testimonial } from '@/data/testimonials'
import Avatar from '@/components/ui/vue/Avatar.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = withDefaults(
  defineProps<{
    review: Testimonial
    experiences: ReviewExperience[]
    projects: ReviewProject[]
    preview?: boolean
  }>(),
  { preview: false },
)

const { copy, locale } = usePreferences()

const relatedExperiences = computed(() =>
  props.review.experienceIds.flatMap((id) => {
    const entry = props.experiences.find((item) => item.id === id)
    return entry ? [entry] : []
  }),
)
const relatedProjects = computed(() =>
  props.review.projectSlugs.flatMap((slug) => {
    const project = props.projects.find((item) => item.slug === slug)
    return project ? [project] : []
  }),
)
const hasRelations = computed(
  () => relatedExperiences.value.length > 0 || relatedProjects.value.length > 0,
)
const displayQuote = computed(
  () => props.review.quote.trim() || copy.value.reviews.panel.preview.placeholder,
)
const quoteIsPlaceholder = computed(() => !props.review.quote.trim())
const displayRoles = computed(() =>
  props.review.author.roles.length
    ? props.review.author.roles
    : [copy.value.reviews.panel.preview.rolesPlaceholder],
)
const rolesArePlaceholder = computed(() => props.review.author.roles.length === 0)
</script>

<template>
  <figure
    class="review-card-item flex min-w-0 flex-col border border-line bg-panel/15 p-5 transition-colors md:p-7"
    :class="preview ? 'review-card-item--preview' : 'hover:border-line-strong'"
  >
    <figcaption class="min-w-0">
      <div class="flex min-w-0 items-center gap-3.5">
        <Avatar :name="review.author.name" :photo="review.author.photo" :size="48" />
        <div class="min-w-0 flex-1">
          <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <p class="font-display text-[16px] font-semibold leading-tight text-ink">
              {{ review.author.name }}
            </p>
            <span
              v-if="review.author.provider === 'Google'"
              data-review-google
              class="inline-flex items-center gap-1 border border-line px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted"
            >
              <UiIcon name="google" :size="11" />
              Google
            </span>
          </div>
          <a
            v-if="review.author.email"
            :href="`mailto:${review.author.email}`"
            class="mt-1 inline-flex min-h-8 max-w-full items-center gap-1.5 text-[12px] text-muted transition hover:text-soft"
          >
            <UiIcon name="mail" :size="12" class="shrink-0" />
            <span class="min-w-0 break-all">{{ review.author.email }}</span>
          </a>
        </div>
      </div>
      <ul class="mt-4 flex flex-wrap gap-1.5" :aria-label="copy.testimonials.rolesLabel">
        <li
          v-for="role in displayRoles"
          :key="role"
          class="border border-line px-2.5 py-1 text-[11px] leading-tight"
          :class="rolesArePlaceholder ? 'text-muted' : 'text-soft'"
        >
          {{ role }}
        </li>
      </ul>
    </figcaption>

    <blockquote
      class="mt-6 flex-1 border-l-2 border-soft/60 pl-5 text-[15.5px] leading-[1.75] md:text-[16.5px]"
      :class="quoteIsPlaceholder ? 'text-muted' : 'text-ink'"
      :lang="review.locale"
    >
      <span class="font-serif text-[27px] leading-none text-soft" aria-hidden="true">“</span>
      {{ displayQuote }}
    </blockquote>

    <div class="mt-7 flex flex-col gap-5 border-t border-line pt-5">
      <div v-if="relatedExperiences.length">
        <p class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          {{
            relatedExperiences.length === 1
              ? copy.testimonials.relatedExperience
              : copy.testimonials.relatedExperiences
          }}
        </p>
        <div class="mt-3 flex flex-col gap-2">
          <template v-for="entry in relatedExperiences" :key="entry.id">
            <RouterLink
              v-if="!preview"
              :to="{ name: 'home', hash: `#${experienceAnchor(entry.id)}` }"
              class="group inline-flex min-h-11 max-w-full items-center gap-3 border border-line-strong px-3 py-2 text-left transition-colors hover:border-soft"
            >
              <span class="min-w-0">
                <span class="block text-[12px] leading-snug text-ink">{{ entry.org }}</span>
                <span
                  class="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                >
                  {{ entry.role }}
                </span>
              </span>
              <UiIcon
                name="arrow-up"
                :size="13"
                class="shrink-0 text-soft transition-transform group-hover:-translate-y-0.5"
              />
            </RouterLink>
            <span
              v-else
              class="inline-flex max-w-full items-center gap-3 border border-line-strong px-3 py-2 text-left"
            >
              <span class="min-w-0">
                <span class="block text-[12px] leading-snug text-ink">{{ entry.org }}</span>
                <span
                  class="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                >
                  {{ entry.role }}
                </span>
              </span>
            </span>
          </template>
        </div>
      </div>

      <div v-if="relatedProjects.length">
        <p class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          {{
            relatedProjects.length === 1
              ? copy.testimonials.relatedProject
              : copy.testimonials.relatedProjects
          }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <template v-for="project in relatedProjects" :key="project.slug">
            <RouterLink
              v-if="!preview"
              :to="{ name: 'projects', hash: `#${projectAnchor(project.slug)}` }"
              class="group inline-flex min-h-11 max-w-full items-center gap-2 border border-line-strong px-3 py-2 text-left text-[12px] leading-snug text-ink transition-colors hover:border-soft hover:text-soft"
            >
              <span class="min-w-0">{{ project.title[locale] }}</span>
              <UiIcon
                name="arrow-right"
                :size="13"
                class="shrink-0 text-soft transition-transform group-hover:translate-x-0.5"
              />
            </RouterLink>
            <span
              v-else
              class="inline-flex max-w-full items-center gap-2 border border-line-strong px-3 py-2 text-left text-[12px] leading-snug text-ink"
            >
              <span class="min-w-0">{{ project.title[locale] }}</span>
            </span>
          </template>
        </div>
      </div>

      <p
        v-if="!hasRelations"
        class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
      >
        {{ copy.testimonials.generalReview }}
      </p>
    </div>
  </figure>
</template>

<style scoped>
.review-card-item[hidden] {
  display: none;
}

@media (prefers-reduced-motion: no-preference) {
  .review-card-item.is-entering {
    animation: review-card-enter 520ms cubic-bezier(0.16, 1, 0.3, 1)
      calc(var(--review-order, 0) * 60ms) both;
  }
}

@keyframes review-card-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
