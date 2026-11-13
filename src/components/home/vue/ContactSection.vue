<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { useRevealCycle } from '@/composables/useRevealCycle'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import PlateFrame from '@/components/ui/vue/PlateFrame.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import ContactForm from '@/components/home/vue/ContactForm.vue'
import coreDark from '@/assets/images/core_dark.png?url'
import coreLight from '@/assets/images/core_light.png?url'

const { copy } = usePreferences()
const form = copy.value.contact.form
const email = copy.value.seo.email

type CopyState = 'idle' | 'success' | 'error'
const copyState = shallowRef<CopyState>('idle')
let copyTimer = 0

const copyStatusText = computed(() => {
  if (copyState.value === 'success') return form.copied
  if (copyState.value === 'error') return form.copyFailed
  return ''
})

async function copyEmail(): Promise<void> {
  let nextState: CopyState = 'error'
  try {
    await navigator.clipboard.writeText(email)
    nextState = 'success'
  } catch {
    // A disabled clipboard is a normal failure; the email stays selectable.
  }

  copyState.value = nextState
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copyState.value = 'idle'
  }, 3200)
}

onBeforeUnmount(() => window.clearTimeout(copyTimer))

// The section is hydrated as an island, so the static reveal script ignores
// it. Each panel owns the same quiet-absence cycle as the rest of the site.
const leftPanel = ref<HTMLElement | null>(null)
const rightPanel = ref<HTMLElement | null>(null)
const { armed: leftArmed } = useRevealCycle(leftPanel)
const { armed: rightArmed } = useRevealCycle(rightPanel)
</script>

<template>
  <section
    id="contact"
    class="contact-texture dot-field dot-field--body section-pad relative overflow-hidden bg-section"
    aria-labelledby="contact-title"
  >
    <span
      class="dot-extra"
      style="--dot-extra-top: 58%; --dot-extra-reach: 40% 90%; --dot-field-strength: 54%"
      aria-hidden="true"
    />
    <span
      class="dot-extra"
      style="
        --dot-extra-top: 88%;
        --dot-extra-focus: 0% 50%;
        --dot-extra-reach: 36% 86%;
        --dot-extra-height: 480px;
        --dot-field-strength: 50%;
      "
      aria-hidden="true"
    />
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soft/45 to-transparent"
      aria-hidden="true"
    />
    <img
      :src="coreDark"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      width="1100"
      height="1100"
      class="theme-media-dark pointer-events-none absolute -right-28 top-28 hidden w-[340px] max-w-none opacity-20 md:block lg:w-[440px] lg:opacity-30"
    />
    <img
      :src="coreLight"
      data-theme-core
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      width="1100"
      height="1100"
      class="theme-media-light pointer-events-none absolute -right-28 top-28 hidden w-[340px] max-w-none opacity-20 md:block lg:w-[440px] lg:opacity-30"
    />
    <div class="shell relative">
      <SectionHeader
        seal="十一"
        :eyebrow="copy.contact.eyebrow"
        :title="copy.contact.title"
        :lead="copy.contact.lead"
        title-id="contact-title"
        signal
      />
      <div
        class="grid gap-10 lg:grid-cols-[minmax(0,620px)_minmax(0,420px)] lg:justify-between lg:gap-16 xl:gap-24"
      >
        <div
          ref="leftPanel"
          class="contact-panel min-w-0"
          :class="{ 'is-armed': leftArmed }"
          style="--reveal-order: 0"
        >
          <h3
            class="max-w-[620px] font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink md:text-[32px] xl:text-[36px]"
          >
            {{ copy.contact.question }}
          </h3>
          <p class="type-copy mt-5 max-w-[520px] leading-[1.7] text-muted">
            {{ copy.contact.paragraph }}
          </p>
          <div class="mt-7 flex max-w-[720px] flex-col gap-2.5">
            <div class="relative flex items-stretch gap-2 md:max-w-[520px]">
              <span
                class="contact-copy-trace"
                :data-active="copyState === 'success' ? 'true' : 'false'"
                aria-hidden="true"
              />
              <a
                :href="`mailto:${email}`"
                :aria-label="copy.contact.emailAria"
                class="contact-pill contact-pill--email min-w-0 flex-1"
              >
                <span class="contact-pill-icon" aria-hidden="true">
                  <UiIcon name="mail" :size="11" />
                </span>
                <span class="truncate">{{ email }}</span>
              </a>
              <button
                type="button"
                data-copy-email
                :data-email="email"
                :data-copied="copyState === 'success' ? 'true' : 'false'"
                class="contact-pill w-auto shrink-0 justify-center px-4"
                :aria-label="form.copyEmail"
                @click="copyEmail"
              >
                <span :hidden="copyState === 'success'">
                  <UiIcon name="copy" :size="13" />
                </span>
                <span :hidden="copyState !== 'success'">
                  <UiIcon name="check" :size="13" />
                </span>
              </button>
            </div>
            <div aria-live="polite" class="min-h-[16px]">
              <p
                data-copy-status
                :data-success="form.copied"
                :data-failure="form.copyFailed"
              class="type-meta font-mono uppercase tracking-[0.06em]"
                :class="copyState === 'error' ? 'text-danger' : 'text-soft'"
              >
                {{ copyStatusText }}
              </p>
            </div>
            <div class="my-2 flex flex-wrap gap-2">
              <span
                v-for="badge in copy.contact.badges"
                :key="badge"
                class="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase leading-none tracking-[0.05em] text-muted"
              >
                {{ badge }}
              </span>
            </div>
            <div class="grid gap-2.5 md:grid-cols-2">
              <a
                href="https://wa.me/584248887764"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="copy.contact.whatsappAria"
                class="contact-pill"
              >
                <span class="contact-pill-icon" aria-hidden="true">
                  <UiIcon name="whatsapp" :size="11" />
                </span>
                <span>+58 424 888 7764</span>
                <UiIcon name="arrow-up-right" :size="11" class="ml-auto shrink-0 text-muted" />
              </a>
              <a
                href="https://github.com/NorthSideBoy"
                target="_blank"
                rel="noopener noreferrer"
                class="contact-pill"
              >
                <span class="contact-pill-icon" aria-hidden="true">
                  <UiIcon name="github" :size="11" />
                </span>
                <span>GitHub · NorthSideBoy</span>
                <span class="sr-only">{{ copy.contact.githubAria }}</span>
                <UiIcon name="arrow-up-right" :size="11" class="ml-auto shrink-0 text-muted" />
              </a>
            </div>
          </div>
        </div>

        <div
          ref="rightPanel"
          class="contact-panel min-w-0"
          :class="{ 'is-armed': rightArmed }"
          style="--reveal-order: 1"
        >
          <PlateFrame tone="page">
            <div class="flex items-center gap-3 border-b border-line px-5 py-3.5 md:px-6">
              <h3
                id="contact-form-title"
                class="mono-label flex items-center gap-2 text-soft"
              >
                <span
                  class="inline-block size-1.5 shrink-0 rounded-full bg-line-strong"
                  aria-hidden="true"
                />
                {{ form.eyebrow }}
              </h3>
              <span class="h-px flex-1 bg-line" aria-hidden="true" />
            </div>
            <ContactForm />
            <noscript>
              <p class="type-support border-t border-line px-5 py-4 leading-relaxed text-muted md:px-6">
                {{ form.noscript }}
              </p>
            </noscript>
          </PlateFrame>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-texture {
  --dot-field-focus: 0% 0%;
  --dot-field-reach: 40% 100%;
  --dot-field-strength: 60%;
  --dot-field-fade: 70%;
}

.contact-pill[data-copied='true'] {
  border-color: color-mix(in srgb, var(--c-soft) 70%, transparent);
  color: var(--c-soft);
}

/* The mail glyph duplicates the address it sits beside; below 380px the
 * address itself matters more than the icon, so the pill reclaims the space
 * instead of truncating the one contact detail the visitor needs. */
@media (max-width: 379px) {
  .contact-pill--email {
    padding-inline: 0.9rem;
  }

  .contact-pill--email .contact-pill-icon {
    display: none;
  }
}

.contact-copy-trace {
  position: absolute;
  inset-inline: 0;
  bottom: -7px;
  height: 1px;
  pointer-events: none;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left center;
  background-image: linear-gradient(
    90deg,
    transparent,
    var(--c-soft) 12%,
    var(--c-aqua) 82%,
    transparent
  );
}

@media (prefers-reduced-motion: no-preference) {
  .contact-copy-trace[data-active='true'] {
    animation: contact-copy-trace 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .contact-panel {
    transition:
      opacity 480ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--reveal-order, 0) * 80ms),
      transform 480ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--reveal-order, 0) * 80ms);
  }

  .contact-panel.is-armed {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
    transition: none;
  }
}

@keyframes contact-copy-trace {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  18% {
    opacity: 1;
  }
  72% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(1);
  }
}
</style>
