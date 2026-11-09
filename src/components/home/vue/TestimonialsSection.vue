<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from '@/router/astroRouter'
import { prefersReducedMotion, scrollControl } from '@/router/scrollControl'
import { usePreferences } from '@/composables/usePreferences'
import { reviewAnchor } from '@/data/anchors'
import type { ExperienceEntry } from '@/data/experience'
import type { Project } from '@/data/projects'
import type { Testimonial } from '@/data/testimonials'
import type { Locale } from '@/data/content'
import type { SectionText } from '@/data/schemas/registry'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import ContentState from '@/components/ui/vue/ContentState.vue'
import ReviewCard from '@/components/reviews/vue/ReviewCard.vue'
import ReviewInvite from '@/components/reviews/vue/ReviewInvite.vue'

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

const initialCount = 4
const showAll = ref(false)

async function revealReviewFromHash(hash: string) {
  const anchor = hash.replace(/^#/, '')
  if (!anchor.startsWith('review-')) return
  if (!props.items.some((review) => reviewAnchor(review.anchorId) === anchor)) return

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

      <ContentState
        v-if="loading || error"
        :loading="loading"
        :error="error"
        @retry="$emit('retry')"
      />

      <template v-else>
        <div
          v-if="items.length"
          id="reviews-list"
          class="grid gap-4 md:grid-cols-2 md:gap-5"
        >
          <ReviewCard
            v-for="(review, index) in items"
            :id="reviewAnchor(review.anchorId)"
            :key="review.anchorId"
            :review="review"
            :experiences="experiences"
            :projects="projects"
            :hidden="!showAll && index >= initialCount"
            :class="{ 'is-entering': showAll && index >= initialCount }"
            :style="{ '--review-order': Math.min(Math.max(index - initialCount, 0), 3) }"
          />
        </div>

        <ReviewInvite v-else variant="empty" />

        <div v-if="items.length > initialCount" class="mt-8 flex justify-center">
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
                : `${copy.testimonials.viewAll} (${items.length})`
            }}
            <UiIcon
              name="arrow-down"
              :size="16"
              class="transition-transform"
              :class="showAll ? 'rotate-180' : ''"
            />
          </button>
        </div>

        <ReviewInvite v-if="items.length" variant="footer" />
      </template>
    </div>
  </section>
</template>
