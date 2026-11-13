<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { projectAnchor } from '@/data/anchors'
import type { Project } from '@/data/projects'
import type { ExperienceEntry } from '@/data/experience'
import type { Testimonial } from '@/data/testimonials'
import type { SiteSections } from '@/data/schemas/siteSection'
import SealEyebrow from '@/components/ui/vue/SealEyebrow.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import ProjectsFilter from './ProjectsFilter.vue'
import ProjectTile from './ProjectTile.vue'

const props = defineProps<{
  sections: SiteSections
  projects: Project[]
  experiences: ExperienceEntry[]
  reviews: Testimonial[]
}>()
const { copy, locale } = usePreferences()
const selected = shallowRef<'all' | 'own' | 'collaborations'>('all')
const counts = computed(() => ({
  all: props.projects.length,
  own: props.projects.filter((project) => !project.collaboration).length,
  collaborations: props.projects.filter((project) => project.collaboration)
    .length,
}))

async function focusDeepLink() {
  const id = window.location.hash.slice(1)
  if (
    !id.startsWith('project-') ||
    !props.projects.some((project) => projectAnchor(project.slug) === id)
  )
    return
  selected.value = 'all'
  await nextTick()
  requestAnimationFrame(() =>
    document.getElementById(id)?.focus({ preventScroll: true }),
  )
}
onMounted(() => {
  void focusDeepLink()
  window.addEventListener('hashchange', focusDeepLink)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', focusDeepLink))
</script>
<template>
  <main id="main">
    <section
      class="projects-index-texture dot-field relative overflow-hidden border-b border-line bg-page"
    >
      <div class="shell page-intro-pad relative pt-12 md:pt-16 xl:pt-20">
        <a
          :href="locale === 'en' ? '/en/' : '/'"
          class="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition hover:text-soft"
          ><UiIcon name="arrow-left" :size="14" />{{
            copy.projectsPage.back
          }}</a
        >
        <div class="section-marker mt-8 max-w-[760px]">
          <p class="mono-label text-soft">
            <SealEyebrow seal="五" :label="copy.projectsPage.eyebrow" />
          </p>
          <h1
            class="type-page mt-5 font-display font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            {{ props.sections.projects[locale].index?.title }}
          </h1>
          <p class="section-header__lead section-lead text-muted">
            {{ props.sections.projects[locale].index?.lead }}
          </p>
        </div>
      </div>
    </section>
    <section class="page-content-pad bg-section">
      <div class="shell">
        <ProjectsFilter
          v-model="selected"
          :label="copy.projectsPage.filterLabel"
          :labels="copy.projectsPage.filters"
          :count-label="copy.projectsPage.countLabel"
          :counts="counts"
        />
        <div
          v-if="projects.length"
          id="projects-grid"
          class="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5"
        >
          <ProjectTile
            v-for="project in projects"
            :key="project.slug"
            :project="project"
            :experiences="experiences"
            :reviews="reviews"
            variant="index"
            :heading-level="2"
            :data-project-kind="
              project.collaboration ? 'collaborations' : 'own'
            "
            data-project-card
            :hidden="
              selected !== 'all' &&
              (project.collaboration ? 'collaborations' : 'own') !== selected
            "
          />
        </div>
        <p
          v-else
          class="type-support mt-10 border border-line p-8 text-center text-muted"
          role="status"
        >
          {{ copy.projectsPage.empty }}
        </p>
      </div>
    </section>
  </main>
</template>
<style>
.projects-index-texture {
  --dot-field-height: 100%;
  --dot-field-strength: 65%;
  --dot-field-mask: linear-gradient(to right, black 0%, transparent 75%);
  --tex-dot-core: var(--c-muted);
  --tex-dot-edge: var(--c-line-strong);
}
#projects-grid [data-project-card][hidden] {
  display: none !important;
}
</style>
