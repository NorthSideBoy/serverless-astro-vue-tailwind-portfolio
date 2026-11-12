<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { useGoogleSession } from '@/composables/useGoogleSession'
import { reviewPanelPath } from '@/data/paths'
import SealEyebrow from '@/components/ui/vue/SealEyebrow.vue'
import PlateFrame from '@/components/ui/vue/PlateFrame.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const { copy, locale } = usePreferences()
const { status, error, busy, signIn, retry } = useGoogleSession()

watch(
  status,
  (value) => {
    if (value === 'ready') {
      window.location.replace(reviewPanelPath(locale.value))
    }
  },
  { flush: 'post' },
)

function errorMessage() {
  if (!error.value || error.value === 'cancelled') return ''
  return copy.value.reviews.panel.errors.auth[error.value]
}
</script>

<template>
  <main id="main">
    <section
      class="dot-field dot-field--quiet relative overflow-hidden border-b border-line bg-page"
      aria-labelledby="review-access-title"
    >
      <div class="shell relative py-12 md:py-16 xl:py-20">
        <RouterLink
          :to="{ name: 'home' }"
          class="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition hover:text-soft"
        >
          <UiIcon name="arrow-left" :size="14" />
          {{ copy.reviews.access.back }}
        </RouterLink>

        <div class="mt-8 max-w-[820px]">
          <p class="mono-label text-soft">
            <SealEyebrow seal="十" :label="copy.reviews.access.eyebrow" />
          </p>
          <h1
            id="review-access-title"
            class="mt-4 font-display text-[38px] font-bold leading-[1.05] tracking-[-0.03em] text-ink md:text-[50px] xl:text-[58px]"
          >
            {{ copy.reviews.access.title }}
          </h1>
          <p class="mt-4 max-w-[680px] text-[15px] leading-[1.7] text-muted md:text-base">
            {{ copy.reviews.access.lead }}
          </p>
        </div>

        <div
          class="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14"
        >
          <div>
            <ol class="border-t border-line">
              <li
                v-for="step in copy.reviews.access.steps"
                :key="step.index"
                class="grid grid-cols-[42px_minmax(0,1fr)] gap-4 border-b border-line py-5"
              >
                <span class="font-mono text-[11px] uppercase tracking-[0.12em] text-soft">
                  {{ step.index }}
                </span>
                <span>
                  <span class="block font-display text-[17px] font-semibold text-ink">
                    {{ step.title }}
                  </span>
                  <span class="mt-1 block text-[13.5px] leading-[1.65] text-muted">
                    {{ step.body }}
                  </span>
                </span>
              </li>
            </ol>
          </div>

          <PlateFrame>
            <div class="p-6 md:p-8">
              <p class="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {{ copy.reviews.access.cardLabel }}
              </p>
              <h2 class="mt-4 font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">
                {{ copy.reviews.access.cardTitle }}
              </h2>
              <p class="mt-3 text-[13.5px] leading-[1.7] text-muted">
                {{ copy.reviews.access.cardBody }}
              </p>

              <p
                v-if="status === 'ready'"
                class="mt-6 flex min-h-13 items-center gap-3 border border-line px-4 text-[13px] text-muted"
                role="status"
              >
                <span class="h-2 w-2 shrink-0 rounded-full bg-status" aria-hidden="true" />
                {{ copy.reviews.access.redirecting }}
              </p>

              <button
                v-else
                type="button"
                class="btn-ghost mt-6 w-full justify-center"
                :disabled="status === 'loading' || status === 'error' || busy"
                :aria-busy="status === 'loading' || busy"
                @click="signIn"
              >
                <UiIcon name="google" :size="18" />
                {{
                  status === 'loading'
                    ? copy.reviews.access.googleLoading
                    : busy
                      ? copy.reviews.access.signingIn
                      : copy.reviews.access.google
                }}
              </button>

              <p
                v-if="errorMessage()"
                class="mt-4 border border-danger px-3 py-2 text-[12.5px] leading-relaxed text-danger"
                role="alert"
              >
                {{ errorMessage() }}
              </p>

              <button
                v-if="status === 'error'"
                type="button"
                class="mt-4 inline-flex min-h-11 items-center text-[13px] text-soft underline"
                @click="retry"
              >
                {{ copy.ui.retryContent }}
              </button>

              <div class="mt-6 border-t border-line pt-4">
                <p class="text-[12px] leading-[1.65] text-muted">
                  {{ copy.reviews.access.note }}
                </p>
                <noscript
                  class="mt-3 block border border-line bg-panel/20 px-3 py-2 text-[12.5px] text-ink"
                >
                  {{ copy.reviews.access.noscript }}
                </noscript>
              </div>
            </div>
          </PlateFrame>
        </div>
      </div>
    </section>
  </main>
</template>
