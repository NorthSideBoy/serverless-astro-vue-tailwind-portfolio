<script setup lang="ts">
import { computed } from 'vue'
import { content, type Locale } from '@/data/content'
import type { ExperienceEntry } from '@/data/schemas/experience'
import type { Project } from '@/data/projects'
import type { Testimonial } from '@/data/testimonials'
import type { SiteSections } from '@/data/schemas/siteSection'
import { experienceAnchor, projectAnchor, reviewAnchor } from '@/data/anchors'
import { homePath, projectsPath } from '@/data/paths'
import { projectsForExperience, reviewsForExperience } from '@/data/relations'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = defineProps<{
  locale: Locale
  entries: ExperienceEntry[]
  projects: Project[]
  reviews: Testimonial[]
  section: SiteSections['experience']
}>()
const entriesWithRelations = computed(() =>
  props.entries.map((entry) => ({
    ...entry,
    relatedProjects: projectsForExperience(entry.id, props.projects),
    relatedReviews: reviewsForExperience(entry.id, props.reviews),
  })),
)
const highlightedId = computed(
  () => props.entries.find((entry) => entry.highlight)?.id,
)
const projectsHref = computed(() => projectsPath(props.locale))
const home = computed(() => homePath(props.locale))
</script>
<template>
  <section
    id="experience"
    class="dot-field dot-field--quiet dot-field--echo dot-field--body section-pad relative overflow-hidden border-t border-line bg-section"
    aria-labelledby="experience-title"
  >
    <span class="dot-extra" aria-hidden="true" />
    <span class="dot-extra" style="--dot-extra-top: 20%; --dot-extra-focus: 0% 50%; --dot-extra-height: 640px; --dot-field-strength: 60%" aria-hidden="true" />
    <div class="shell relative">
      <SectionHeader
        seal="五"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="experience-title"
        signal
      />
      <div class="experience-record border-t border-line">
        <article
          v-for="(entry, index) in entriesWithRelations"
          :id="experienceAnchor(entry.id)"
          :key="entry.id"
          :data-experience-entry="String(index)"
          class="experience-entry group relative grid scroll-mt-28 gap-4 border-b border-line pl-5 md:grid-cols-[110px_1px_minmax(0,1fr)] md:gap-x-6 md:pl-0 lg:grid-cols-[192px_1px_minmax(0,1fr)] lg:gap-x-10"
        >
          <div class="pt-7 md:py-8">
            <div
              data-experience-block
              style="--block-delay: 0ms"
              class="space-y-1 pt-1 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.1em] text-muted"
            >
              <p>{{ entry.period[locale] }}</p>
              <p>{{ entry.location[locale] }}</p>
            </div>
          </div>
          <div
            class="experience-rail absolute inset-y-0 left-0 w-px md:relative md:inset-auto md:w-auto"
            aria-hidden="true"
          >
            <span class="experience-rail__base" /><span
              class="experience-rail__trace"
            /><span
              class="experience-dot"
              :class="{ 'is-live': entry.id === highlightedId }"
              ><span class="experience-dot__ring" /></span
            ><span class="experience-branch" />
          </div>
          <div class="min-w-0 pb-7 md:py-8">
            <div data-experience-block style="--block-delay: 60ms">
              <h3
                class="type-card-title font-display font-semibold leading-tight tracking-[-0.02em] text-ink"
              >
                {{ entry.org }}
              </h3>
              <p
                class="mt-2 font-mono text-[10.5px] uppercase tracking-[0.1em]"
                :class="
                  entry.id === highlightedId ? 'text-soft' : 'text-ink/85'
                "
              >
                {{ entry.role }}
              </p>
            </div>
            <p
              data-experience-block
              style="--block-delay: 110ms"
              class="type-copy mt-4 max-w-[72ch] leading-[1.7] text-ink/90"
            >
              {{ entry.summary[locale] }}
            </p>
            <ul
              data-experience-block
              style="--block-delay: 160ms"
              class="mt-4 max-w-[72ch] space-y-2.5"
            >
              <li
                v-for="bullet in entry.bullets[locale]"
                :key="bullet"
                class="type-copy-compact flex gap-3 leading-[1.65] text-muted"
              >
                <span
                  class="mt-[0.62em] h-1 w-1 shrink-0 bg-muted/70"
                  aria-hidden="true"
                /><span>{{ bullet }}</span>
              </li>
            </ul>
            <div
              data-experience-block
              style="--block-delay: 210ms"
              class="mt-5 flex flex-wrap gap-x-4 gap-y-2"
            >
              <span
                v-for="tech in entry.tech"
                :key="tech"
                class="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em] text-muted"
                ><span
                  class="h-1 w-1 shrink-0 bg-soft/55"
                  aria-hidden="true"
                />{{ tech }}</span
              >
            </div>
            <div
              v-if="entry.relatedProjects.length || entry.relatedReviews.length"
              data-experience-block
              style="--block-delay: 260ms"
              class="mt-5 border-t border-line pt-4"
            >
              <div v-if="entry.relatedProjects.length">
                <p
                  class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                >
                  {{
                    entry.relatedProjects.length === 1
                      ? content[locale].experience.projectLabel
                      : content[locale].experience.projectsLabel
                  }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <a
                    v-for="project in entry.relatedProjects"
                    :key="project.slug"
                    :href="`${projectsHref}#${projectAnchor(project.slug)}`"
                    class="type-action group inline-flex min-h-11 max-w-full items-center gap-2 border border-line-strong px-3 py-2 text-left leading-snug text-ink transition-colors hover:border-soft hover:text-soft"
                    ><span class="min-w-0">{{ project.title[locale] }}</span
                    ><UiIcon
                      name="arrow-right"
                      :size="13"
                      class="shrink-0 text-soft transition-transform group-hover:translate-x-0.5"
                  /></a>
                </div>
              </div>
              <div
                v-if="entry.relatedReviews.length"
                :class="entry.relatedProjects.length ? 'mt-5' : ''"
              >
                <p
                  class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                >
                  {{
                    entry.relatedReviews.length === 1
                      ? content[locale].experience.reviewLabel
                      : content[locale].experience.reviewsLabel
                  }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <a
                    v-for="review in entry.relatedReviews"
                    :key="review.anchorId"
                    :href="`${home}#${reviewAnchor(review.anchorId)}`"
                    class="type-action group inline-flex min-h-11 max-w-full items-center gap-2 border border-line-strong px-3 py-2 text-left leading-snug text-ink transition-colors hover:border-soft hover:text-soft"
                    ><span class="min-w-0"
                      >{{ review.author.name }}
                      <span class="text-muted"
                        >· {{ review.author.roles[0] }}</span
                      ></span
                    ><UiIcon
                      name="arrow-down"
                      :size="13"
                      class="shrink-0 text-soft transition-transform group-hover:translate-y-0.5"
                  /></a>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div class="mt-10 flex justify-center md:mt-12">
        <a
          href="/cv/said-lucena-cv.pdf"
          download="Said-Lucena-CV.pdf"
          type="application/pdf"
          class="btn-primary w-full max-w-[280px] sm:w-auto sm:min-w-[220px]"
          ><UiIcon name="download" :size="15" />{{
            content[locale].experience.cv
          }}</a
        >
      </div>
    </div>
  </section>
</template>
<style scoped>
.experience-rail__base,
.experience-rail__trace {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 1px;
}
.experience-rail__base {
  background-color: var(--c-line);
}
.experience-rail__trace {
  background-image: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--c-soft) 65%, transparent),
    var(--c-aqua) 72%,
    color-mix(in srgb, var(--c-aqua) 35%, transparent) 100%
  );
  opacity: 0.9;
}
.experience-dot {
  position: absolute;
  top: 2rem;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: var(--c-muted);
  transform: translateX(-50%);
}
@media (min-width: 768px) {
  .experience-dot {
    top: 2.25rem;
  }
}
.experience-dot.is-live {
  background-color: var(--c-soft);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-soft) 12%, transparent);
}
.experience-dot__ring {
  position: absolute;
  inset: -1px;
  border: 1px solid var(--c-soft);
  border-radius: 9999px;
  opacity: 0;
}
.experience-branch {
  display: none;
  position: absolute;
  top: calc(2.25rem + 3.5px);
  left: 1px;
  width: 1.5rem;
  height: 1px;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left center;
  background-image: linear-gradient(to right, var(--c-soft), transparent);
}
@media (min-width: 768px) {
  .experience-branch {
    display: block;
  }
}
@media (min-width: 1024px) {
  .experience-branch {
    width: 2.5rem;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .experience-entry [data-experience-block] {
    transition:
      opacity 460ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 460ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--block-delay, 0ms);
  }
  .experience-entry.is-armed [data-experience-block] {
    opacity: 0;
    transform: translate3d(0, 9px, 0);
    transition: none;
  }
  .experience-rail__trace {
    transform: scaleY(0);
    transform-origin: top center;
  }
  .is-traced .experience-rail__trace {
    animation: experience-rail-draw 900ms cubic-bezier(0.65, 0, 0.35, 1) both;
  }
  .is-traced .experience-dot__ring {
    animation: experience-ping 780ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .is-traced .experience-branch {
    animation: experience-branch 620ms cubic-bezier(0.16, 1, 0.3, 1) 220ms both;
  }
}
@keyframes experience-rail-draw {
  0% {
    opacity: 0.35;
    transform: scaleY(0);
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0.9;
    transform: scaleY(1);
  }
}
@keyframes experience-branch {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  55% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.5;
    transform: scaleX(1);
  }
}
@keyframes experience-ping {
  0% {
    opacity: 0.85;
    transform: scale(0.7);
  }
  65% {
    opacity: 0.18;
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}
</style>
