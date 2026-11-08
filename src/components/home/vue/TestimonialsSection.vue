<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from '@/router/astroRouter'
import { prefersReducedMotion, scrollControl } from '@/router/scrollControl'
import { usePreferences } from '@/composables/usePreferences'
import { experienceAnchor, projectAnchor, reviewAnchor } from '@/data/anchors'
import type { ExperienceEntry } from '@/data/experience'
import type { Project } from '@/data/projects'
import type { Testimonial } from '@/data/testimonials'
import type { Locale } from '@/data/content'
import type { SectionText } from '@/data/schemas/registry'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import ContentState from '@/components/ui/vue/ContentState.vue'

const { copy, locale } = usePreferences()
const route = useRoute()
const props = defineProps<{
  items: Testimonial[]
  experiences: ExperienceEntry[]
  projects: Project[]
  section: Record<Locale, SectionText>
  loading: boolean
  error: string | null
}>()
defineEmits<{ retry: [] }>()
const reviews = computed(() =>
  props.items.map((review) => ({
    ...review,
    relatedExperiences: review.experienceIds.flatMap((id) => {
      const entry = props.experiences.find((item) => item.id === id)
      return entry ? [entry] : []
    }),
    relatedProjects: review.projectSlugs.flatMap((slug) => {
      const project = props.projects.find((item) => item.slug === slug)
      return project ? [project] : []
    }),
  })),
)
const initialCount = 4
const showAll = ref(false)

async function revealReviewFromHash(hash: string) {
  const anchor = hash.replace(/^#/, '')
  if (!anchor.startsWith('review-')) return
  if (!props.items.some((review) => reviewAnchor(review.id) === anchor)) return

  // Hold the address bar before the first await: the header's scroll spy
  // reacts to the same jump and would otherwise rewrite the review fragment
  // to the surrounding section before the card exists.
  scrollControl.holdHashSync(prefersReducedMotion() ? 0 : 1200)

  // All reviews are in the server HTML. Expand hidden cards before scrolling
  // to a deep link so its target can become visible and receive focus.
  if (!showAll.value) {
    showAll.value = true
    await nextTick()
  }

  const target = document.getElementById(anchor)
  if (!target) return

  target.scrollIntoView({
    block: 'start',
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  })
}

function onHashChange() {
  void revealReviewFromHash(window.location.hash)
}

onMounted(() => {
  window.addEventListener('hashchange', onHashChange)

  // Expand after hydration, never during setup: the server painted the
  // collapsed list, so opening it before the first client render would make
  // the four extra cards a hydration mismatch.
  void revealReviewFromHash(route.hash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
})

watch([() => route.hash, () => props.items], ([hash]) => {
  void revealReviewFromHash(hash)
})
</script>

<template>
  <section
    id="testimonials"
    class="dot-field dot-field--quiet section-pad relative overflow-hidden border-y border-line bg-page"
    aria-labelledby="testimonials-title"
  >
    <div class="shell relative">
      <SectionHeader
        seal="十"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="testimonials-title"
      />

      <p class="mb-6 border-l-2 border-soft bg-panel/20 px-4 py-3 text-[13px] leading-relaxed text-ink">
        {{ copy.testimonials.sampleNotice }}
      </p>

      <ContentState
        v-if="loading || error || !items.length"
        :loading="loading"
        :error="error"
        @retry="$emit('retry')"
      />
      <div
        id="reviews-list"
        class="grid gap-4 md:grid-cols-2 md:gap-5"
        v-show="!loading && !error && items.length"
      >
        <figure
          v-for="(review, index) in reviews"
          :id="reviewAnchor(review.id)"
          :key="review.id"
          :style="{ '--review-order': Math.min(Math.max(index - initialCount, 0), 3) }"
          :hidden="!showAll && index >= initialCount"
          :class="{ 'is-entering': showAll && index >= initialCount }"
          class="review-card-item flex min-w-0 scroll-mt-28 flex-col border border-line bg-panel/15 p-5 transition-colors hover:border-line-strong md:p-7"
        >
          <figcaption class="min-w-0">
            <div class="flex min-w-0 items-center gap-3.5">
              <img
                :src="review.author.photo"
                alt=""
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                class="h-12 w-12 shrink-0 rounded-full border border-line-strong object-cover"
              />
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <p class="font-display text-[16px] font-semibold leading-tight text-ink">
                    {{ review.author.firstName }} {{ review.author.lastName }}
                  </p>
                  <span class="border border-line px-1.5 py-0.5 text-[10px] leading-none text-muted">
                    {{ copy.testimonials.sampleBadge }}
                  </span>
                </div>
              </div>
            </div>
            <ul class="mt-4 flex flex-wrap gap-1.5" :aria-label="copy.testimonials.rolesLabel">
              <li
                v-for="role in review.author.roles"
                :key="role"
                class="border border-line px-2.5 py-1 text-[11px] leading-tight text-soft"
              >
                {{ role }}
              </li>
            </ul>
          </figcaption>

          <blockquote
            class="mt-6 flex-1 border-l-2 border-soft/60 pl-5 text-[15.5px] leading-[1.75] text-ink md:text-[16.5px]"
          >
            <span class="font-serif text-[27px] leading-none text-soft" aria-hidden="true">“</span>
            {{ review.quote }}
          </blockquote>

          <div class="mt-7 flex flex-col gap-5 border-t border-line pt-5">
            <div v-if="review.relatedExperiences.length">
              <p class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                {{
                  review.relatedExperiences.length === 1
                    ? copy.testimonials.relatedExperience
                    : copy.testimonials.relatedExperiences
                }}
              </p>
              <div class="mt-3 flex flex-col gap-2">
                <RouterLink
                  v-for="entry in review.relatedExperiences"
                  :key="entry.id"
                  :to="{ name: 'home', hash: `#${experienceAnchor(entry.id)}` }"
                  class="group inline-flex min-h-11 max-w-full items-center gap-3 border border-line-strong px-3 py-2 text-left transition-colors hover:border-soft"
                >
                  <span class="min-w-0">
                    <span class="block text-[12px] leading-snug text-ink">
                      {{ entry.org }}
                    </span>
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
              </div>
            </div>

            <div v-if="review.relatedProjects.length">
              <p class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                {{
                  review.relatedProjects.length === 1
                    ? copy.testimonials.relatedProject
                    : copy.testimonials.relatedProjects
                }}
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <RouterLink
                  v-for="project in review.relatedProjects"
                  :key="project.slug"
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
              </div>
            </div>

            <p
              v-if="review.relatedExperiences.length === 0 && review.relatedProjects.length === 0"
              class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
            >
              {{ copy.testimonials.generalReview }}
            </p>
          </div>
        </figure>
      </div>

      <div
        v-if="!loading && !error && reviews.length > initialCount"
        class="mt-8 flex justify-center"
      >
        <button
          type="button"
          class="btn-ghost w-full sm:w-auto"
          aria-controls="reviews-list"
          :aria-expanded="showAll"
          @click="showAll = !showAll"
        >
          {{
            showAll
              ? copy.testimonials.showLess
              : `${copy.testimonials.viewAll} (${reviews.length})`
          }}
          <UiIcon
            name="arrow-down"
            :size="16"
            class="transition-transform"
            :class="showAll ? 'rotate-180' : ''"
          />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.review-card-item[hidden] { display: none; }
@media (prefers-reduced-motion: no-preference) {
  .review-card-item.is-entering { animation: review-card-enter 520ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--review-order, 0) * 60ms) both; }
}
@keyframes review-card-enter {
  from { opacity: 0; transform: translate3d(0, 12px, 0); }
  to { opacity: 1; transform: none; }
}
</style>
