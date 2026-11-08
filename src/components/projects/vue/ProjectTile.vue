<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { projectAnchor } from '@/data/anchors'
import type { Project } from '@/data/projects'
import type { ExperienceEntry } from '@/data/experience'
import type { Testimonial } from '@/data/testimonials'
import { experiencesForProject, reviewsForProject } from '@/data/relations'
import { primaryProjectLink } from '@/data/projectLinks'
import ProjectBadges from './ProjectBadges.vue'
import ProjectMedia from './ProjectMedia.vue'
import ProjectRelations from './ProjectRelations.vue'
import TechChip from '@/components/ui/vue/TechChip.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = withDefaults(
  defineProps<{
    project: Project
    experiences: ExperienceEntry[]
    reviews: Testimonial[]
    variant?: 'preview' | 'index'
    headingLevel?: 2 | 3 | 4
  }>(),
  { variant: 'preview', headingLevel: 4 },
)

const { copy, locale } = usePreferences()

const headingTag = computed(() => `h${props.headingLevel}` as 'h2' | 'h3' | 'h4')
const primaryLink = computed(() => primaryProjectLink(props.project))
const projectAnchorId = computed(() => projectAnchor(props.project.slug))
const projectHref = computed(() => ({ name: 'projects', hash: `#${projectAnchorId.value}` }))
const relatedExperiences = computed(() => experiencesForProject(props.project, props.experiences))
const relatedReviews = computed(() => reviewsForProject(props.project.slug, props.reviews))
const hasRelations = computed(
  () => relatedExperiences.value.length > 0 || relatedReviews.value.length > 0,
)
const caseHref = computed(() => (props.project.featured ? `/#${projectAnchorId.value}` : null))
const cardDescription = computed(() => props.project.description ?? props.project.summary)
const clampDescription = computed(() => props.variant === 'preview' || props.project.featured)
const visibleTech = computed(() => props.project.tech.slice(0, props.variant === 'preview' ? 2 : 3))
const repoLine = computed(() => {
  if (props.project.repos?.length) return props.project.repos.join(' · ')
  return props.project.meta ?? ''
})
const metaPeriod = computed(() => {
  const parts = [props.project.context[locale.value]]
  if (props.project.period) parts.push(props.project.period[locale.value])
  if (props.project.platforms?.length) parts.push(props.project.platforms.join(' · '))
  return parts.join(' · ')
})
</script>

<template>
  <article
    :id="variant === 'index' ? projectAnchorId : undefined"
    :tabindex="variant === 'index' ? -1 : undefined"
    class="group relative flex flex-col border border-line bg-panel/10 transition-colors hover:border-soft/50 hover:bg-panel/20 focus-within:border-soft"
    :class="variant === 'index' ? 'scroll-mt-28' : ''"
  >
    <ProjectMedia :media="project.media" variant="card" />

    <div class="flex flex-1 flex-col p-5">
      <ProjectBadges :project="project" variant="card" />

      <component
        :is="headingTag"
        class="mt-3 font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-[19px]"
      >
        <RouterLink
          v-if="variant === 'preview'"
          :to="projectHref"
          :aria-label="`${project.title[locale]} — ${copy.projects.viewProject}`"
          class="tile-link inline-block min-h-11 py-2 transition hover:text-soft"
        >
          {{ project.title[locale] }}
        </RouterLink>
        <a
          v-else-if="primaryLink"
          :href="primaryLink.href"
          target="_blank"
          rel="noreferrer"
          class="inline-block min-h-11 py-2 transition hover:text-soft"
        >
          {{ project.title[locale] }}
          <span class="sr-only"> ({{ copy.ui.opensInNewTab }})</span>
        </a>
        <template v-else>
          {{ project.title[locale] }}
        </template>
      </component>

      <p
        class="mt-2 text-[13.5px] leading-[1.65] text-muted"
        :class="clampDescription ? 'line-clamp-3' : ''"
      >
        {{ cardDescription[locale] }}
      </p>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <TechChip v-for="tech in visibleTech" :key="tech">{{ tech }}</TechChip>
        <span
          v-if="project.tech.length > visibleTech.length"
          class="inline-flex items-center rounded-sm border border-line px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em] text-muted"
        >
          +{{ project.tech.length - visibleTech.length }}
        </span>
      </div>

      <div class="mt-auto pt-4">
        <div class="border-t border-line pt-3">
          <div v-if="variant === 'preview'" class="relative z-10">
            <ProjectRelations
              v-if="hasRelations"
              :experiences="relatedExperiences"
              :reviews="relatedReviews"
            />
          </div>
          <ProjectRelations
            v-else-if="hasRelations"
            :experiences="relatedExperiences"
            :reviews="relatedReviews"
            class="mb-2"
          />

          <p
            class="font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-muted"
            :class="hasRelations ? 'mt-2' : ''"
          >
            {{ metaPeriod }}
          </p>

          <p
            v-if="variant === 'index' && project.role"
            class="mt-1 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-ink/85"
          >
            {{ project.role[locale] }}
          </p>

          <p
            v-if="variant === 'index' && repoLine"
            class="mt-1 break-words font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-muted"
          >
            {{ repoLine }}
          </p>
        </div>

        <div
          v-if="variant === 'preview'"
          class="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3"
        >
          <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-soft">
            {{ copy.projects.viewProject }}
          </span>
          <UiIcon
            name="arrow-right"
            :size="12"
            class="text-soft transition group-hover:translate-x-0.5"
          />
        </div>

        <div
          v-else
          class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3"
        >
          <RouterLink
            v-if="caseHref"
            :to="caseHref"
            class="inline-flex min-h-11 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-soft transition hover:text-ink"
          >
            {{ copy.projects.viewCase }}
            <UiIcon name="arrow-right" :size="12" />
          </RouterLink>

          <a
            v-for="link in project.links"
            :key="link.kind + link.href"
            :href="link.href"
            target="_blank"
            rel="noreferrer"
            class="inline-flex min-h-11 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-soft transition hover:text-ink"
          >
            {{ link.label[locale] }}
            <UiIcon name="arrow-up-right" :size="12" />
            <span class="sr-only"> ({{ copy.ui.opensInNewTab }})</span>
          </a>

          <span
            v-if="!caseHref && !project.links.length && project.visibility === 'private'"
            class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
          >
            {{ copy.projects.privateCode }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.tile-link::after {
  content: '';
  position: absolute;
  inset: 0;
}
</style>
