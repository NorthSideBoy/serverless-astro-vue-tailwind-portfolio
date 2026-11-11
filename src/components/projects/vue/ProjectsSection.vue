<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { useRevealList } from '@/composables/useRevealCycle'
import { projectAnchor } from '@/data/anchors'
import { MAX_HOME_CAROUSEL_PROJECTS, type Project } from '@/data/projects'
import type { ExperienceEntry } from '@/data/experience'
import type { Testimonial } from '@/data/testimonials'
import type { Locale } from '@/data/content'
import type { SectionText } from '@/data/schemas/registry'
import { experiencesForProject, reviewsForProject } from '@/data/relations'
import { primaryProjectLink } from '@/data/projectLinks'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import TechChip from '@/components/ui/vue/TechChip.vue'
import CodeBlock from '@/components/ui/vue/CodeBlock.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import ProjectBadges from './ProjectBadges.vue'
import ProjectMedia from './ProjectMedia.vue'
import ProjectRelations from './ProjectRelations.vue'
import ProjectsCarousel from './ProjectsCarousel.vue'
import ContentState from '@/components/ui/vue/ContentState.vue'

const { copy, locale } = usePreferences()
const props = defineProps<{
  projects: Project[]
  experiences: ExperienceEntry[]
  reviews: Testimonial[]
  section: Record<Locale, SectionText>
  loading: boolean
  error: string | null
}>()
defineEmits<{ retry: [] }>()

const featuredProjects = computed(() =>
  props.projects
    .filter((project) => project.featured)
    .map((project) => ({
      project,
      primaryLink: primaryProjectLink(project),
      visibleTech: project.tech.slice(0, 6),
      relatedExperiences: experiencesForProject(project, props.experiences),
      relatedReviews: reviewsForProject(project.slug, props.reviews),
    })),
)

const otherProjects = computed(() =>
  props.projects
    .filter((project) => !project.featured)
    .slice(0, MAX_HOME_CAROUSEL_PROJECTS),
)

const featuredList = ref<HTMLElement | null>(null)
const { armed: featuredArmed } = useRevealList(featuredList, '[data-featured-project]', {
  threshold: 0.12,
})

function metaLine(project: Project) {
  return [project.meta, project.period?.[locale.value]].filter(Boolean).join(' · ')
}
</script>

<template>
  <section
    id="projects"
    class="home-feature dot-field dot-field--peak dot-field--echo dot-field--body section-pad-lg relative isolate overflow-hidden border-y border-line bg-page"
    aria-labelledby="projects-title"
  >
    <span class="dot-extra" style="--dot-extra-focus: 0% 50%" aria-hidden="true" />
    <span class="dot-extra" style="--dot-extra-top: 80%; --dot-extra-height: 760px; --dot-field-strength: 62%" aria-hidden="true" />
    <div class="shell relative">
      <SectionHeader
        seal="六"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="projects-title"
        signal
        density="feature"
      />

      <ContentState
        v-if="loading || error || !projects.length"
        :loading="loading"
        :error="error"
        @retry="$emit('retry')"
      />
      <div v-show="!loading && !error && projects.length" ref="featuredList">
        <article
          v-for="(entry, index) in featuredProjects"
          :id="projectAnchor(entry.project.slug)"
          :key="entry.project.slug"
          data-featured-project
          class="featured-project group grid scroll-mt-28 grid-cols-[minmax(0,1fr)] gap-8 md:items-start md:gap-8 lg:gap-12 xl:gap-16"
          :class="[
            index === 0
              ? 'md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]'
              : 'md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:grid-cols-2',
            index > 0 ? 'mt-14 border-t border-line pt-14 md:mt-20 md:pt-20' : '',
            { 'is-armed': featuredArmed[index] },
          ]"
        >
          <ProjectMedia
            :media="entry.project.media"
            variant="featured"
            :eager="index === 0"
            :trace="index === 0"
            :class="index % 2 === 1 ? 'md:order-2' : ''"
          />

          <div class="featured-copy min-w-0" :class="index % 2 === 1 ? 'md:order-1' : ''">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <ProjectBadges
                :project="entry.project"
                variant="featured"
                class="featured-copy__badges"
              />
              <span class="font-mono text-[10px] tracking-[0.12em] text-muted" aria-hidden="true">
                {{ String(index + 1).padStart(2, '0') }} / {{ String(featuredProjects.length).padStart(2, '0') }}
              </span>
            </div>

            <h3
              class="featured-copy__title mt-4 font-display font-semibold leading-[1.15] tracking-[-0.025em] text-ink"
              :class="index === 0 ? 'text-[26px] md:text-[34px] xl:text-[38px]' : 'text-[24px] md:text-[28px]'"
            >
              {{ entry.project.title[locale] }}
            </h3>

            <p
              v-if="metaLine(entry.project)"
              class="featured-copy__meta mt-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted"
            >
              {{ metaLine(entry.project) }}
            </p>

            <p
              class="featured-copy__description mt-4 max-w-[64ch] leading-[1.72] text-muted"
              :class="index === 0 ? 'text-[15px] md:text-[16px]' : 'text-[14px] md:text-[15px]'"
            >
              {{ (entry.project.description ?? entry.project.summary)[locale] }}
            </p>

            <div class="featured-copy__tech mt-4 flex flex-wrap gap-1.5">
              <TechChip v-for="tech in entry.visibleTech" :key="tech">{{ tech }}</TechChip>
              <span
                v-if="entry.project.tech.length > entry.visibleTech.length"
                class="inline-flex items-center rounded-sm border border-line px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em] text-muted"
              >
                +{{ entry.project.tech.length - entry.visibleTech.length }}
                <span class="sr-only"> : {{ entry.project.tech.slice(6).join(', ') }} </span>
              </span>
            </div>

            <ProjectRelations
              :experiences="entry.relatedExperiences"
              :reviews="entry.relatedReviews"
              class="featured-copy__relations mt-4 border-t border-line pt-3"
            />

            <details
              v-if="entry.project.code"
              class="code-disclosure featured-copy__code mt-4 border border-line bg-panel/10"
            >
              <summary
                class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5"
              >
                <span
                  class="inline-flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-soft"
                >
                  <UiIcon name="code" :size="13" class="shrink-0" />
                  {{ copy.projects.codeLabel }}
                  <span class="sr-only">: {{ entry.project.title[locale] }}</span>
                </span>
                <span
                  class="code-disclosure__action inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                >
                  <span class="code-disclosure__open-label">{{ copy.projects.viewSnippet }}</span>
                  <span class="code-disclosure__close-label">{{ copy.projects.hideSnippet }}</span>
                  <UiIcon name="arrow-down" :size="12" class="code-disclosure__chevron" />
                </span>
              </summary>

              <div class="border-t border-line p-3 md:p-4">
                <CodeBlock
                  :code="entry.project.code"
                  :label="`${entry.project.title[locale]} — ${copy.projects.codeLabel}`"
                  bare
                />
              </div>
            </details>

            <div class="featured-copy__actions mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <RouterLink
                :to="{ name: 'projects', hash: `#${projectAnchor(entry.project.slug)}` }"
                :aria-label="`${entry.project.title[locale]} — ${copy.projects.viewProject}`"
                class="group inline-flex min-h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-soft transition hover:text-ink"
              >
                {{ copy.projects.viewProject }}
                <UiIcon
                  name="arrow-right"
                  :size="12"
                  class="transition group-hover:translate-x-0.5"
                />
              </RouterLink>

              <a
                v-if="entry.primaryLink"
                :href="entry.primaryLink.href"
                target="_blank"
                rel="noreferrer"
                class="group inline-flex min-h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-soft transition hover:text-ink"
              >
                {{ entry.primaryLink.label[locale] }}
                <UiIcon
                  name="arrow-up-right"
                  :size="12"
                  class="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
                <span class="sr-only"> ({{ copy.ui.opensInNewTab }})</span>
              </a>

              <span
                v-if="!entry.primaryLink && entry.project.visibility === 'private'"
                class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
              >
                {{ copy.projects.privateCode }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <div
        v-if="!loading && !error && projects.length"
        class="mt-16 border-t border-line pt-10 xl:mt-20"
      >
        <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-4">
              <p class="mono-label shrink-0 text-soft">
                {{ section[locale].moreEyebrow }}
              </p>
              <span class="h-px flex-1 bg-line" aria-hidden="true" />
            </div>

            <h3
              id="more-projects-title"
              class="mt-5 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em] text-ink md:text-[30px]"
            >
              {{ section[locale].moreTitle }}
            </h3>

            <p class="mt-3 max-w-[620px] text-[13.5px] leading-[1.7] text-muted md:text-[14px]">
              {{ section[locale].moreLead }}
            </p>
          </div>

          <RouterLink :to="{ name: 'projects' }" class="btn-ghost w-full shrink-0 sm:w-auto">
            {{ copy.projects.viewAll }}
            <UiIcon name="arrow-right" :size="15" />
          </RouterLink>
        </div>

        <ProjectsCarousel
          v-if="otherProjects.length"
          :projects="otherProjects"
          :experiences="experiences"
          :reviews="reviews"
          label-id="more-projects-title"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .featured-copy > * {
    transition:
      opacity 460ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 460ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .featured-copy__title {
    transition-delay: 55ms;
  }

  .featured-copy__meta {
    transition-delay: 100ms;
  }

  .featured-copy__description {
    transition-delay: 145ms;
  }

  .featured-copy__tech {
    transition-delay: 190ms;
  }

  .featured-copy__relations {
    transition-delay: 235ms;
  }

  .featured-copy__code {
    transition-delay: 280ms;
  }

  .featured-copy__actions {
    transition-delay: 315ms;
  }

  .featured-project.is-armed .featured-copy > * {
    opacity: 0;
    transform: translate3d(0, 9px, 0);
    transition: none;
  }
}

.code-disclosure > summary::-webkit-details-marker {
  display: none;
}

.code-disclosure__close-label {
  display: none;
}

.code-disclosure[open] .code-disclosure__open-label {
  display: none;
}

.code-disclosure[open] .code-disclosure__close-label {
  display: inline;
}

.code-disclosure__chevron {
  transition: transform 180ms ease;
}

.code-disclosure[open] .code-disclosure__chevron {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .code-disclosure__chevron {
    transition: none;
  }
}
</style>
