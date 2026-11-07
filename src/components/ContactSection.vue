<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { useRevealList } from '@/composables/useRevealCycle'
import SectionHeader from './ui/SectionHeader.vue'
import UiIcon from './ui/UiIcon.vue'
import coreDark from '@/assets/images/core_dark.png'
import coreLight from '@/assets/images/core_light.png'

const { copy } = usePreferences()

const contactGrid = ref<HTMLElement | null>(null)
const { armed: contactArmed } = useRevealList(contactGrid, '[data-contact-panel]', {
  threshold: 0.08,
})

const email = 'saidlucena519@gmail.com'
const whatsapp = '+58 424 888 7764'
const whatsappHref = 'https://wa.me/584248887764'
const github = 'https://github.com/NorthSideBoy'

const form = reactive({ name: '', email: '', subject: '', message: '' })
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
let copyTimer: number | undefined

async function handleCopyEmail() {
  copyState.value = 'idle'
  try {
    await navigator.clipboard.writeText(email)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copyState.value = 'idle'
  }, 3200)
}

onBeforeUnmount(() => window.clearTimeout(copyTimer))

</script>

<template>
  <section
    id="contact"
    class="contact-texture dot-field section-pad relative overflow-hidden bg-section"
    aria-labelledby="contact-title"
  >
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
      class="theme-media-dark pointer-events-none absolute -right-28 top-24 hidden w-[360px] max-w-none opacity-30 md:block lg:w-[460px] lg:opacity-45"
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
      class="theme-media-light pointer-events-none absolute -right-28 top-24 hidden w-[360px] max-w-none opacity-30 md:block lg:w-[460px] lg:opacity-45"
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
        ref="contactGrid"
        class="grid gap-10 lg:grid-cols-[minmax(0,620px)_minmax(0,420px)] lg:justify-between lg:gap-16 xl:gap-24"
      >
        <div
          data-contact-panel
          class="contact-panel"
          :class="{ 'is-armed': contactArmed[0] }"
          :style="{ '--reveal-order': 0 }"
        >
          <h3
            class="max-w-[620px] font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink md:text-[36px]"
          >
            {{ copy.contact.question }}
          </h3>
          <p class="mt-5 max-w-[520px] text-[16px] leading-[1.7] text-muted md:text-[17px]">
            {{ copy.contact.paragraph }}
          </p>

          <div class="mt-7 flex max-w-[720px] flex-col gap-2.5">
            <div class="relative flex items-stretch gap-2 md:max-w-[520px]">
              <span
                class="contact-copy-trace"
                :data-active="copyState === 'copied' ? 'true' : 'false'"
                aria-hidden="true"
              />
              <a
                :href="`mailto:${email}`"
                :aria-label="copy.contact.emailAria"
                class="contact-pill min-w-0 flex-1"
              >
                <span class="contact-pill-icon" aria-hidden="true">
                  <UiIcon name="mail" :size="11" />
                </span>
                <span class="truncate">{{ email }}</span>
              </a>
              <button
                type="button"
                class="contact-pill w-auto shrink-0 justify-center px-4"
                :aria-label="copy.contact.form.copyEmail"
                :data-copied="copyState === 'copied'"
                @click="handleCopyEmail"
              >
                <Transition name="copy-icon" mode="out-in">
                  <UiIcon
                    :key="copyState === 'copied' ? 'check' : 'copy'"
                    :name="copyState === 'copied' ? 'check' : 'copy'"
                    :size="13"
                  />
                </Transition>
              </button>
            </div>
            <div aria-live="polite" class="min-h-[16px]">
              <Transition name="copy-status">
                <p
                  v-if="copyState !== 'idle'"
                  :key="copyState"
                  class="font-mono text-[10.5px] uppercase tracking-[0.06em]"
                  :class="copyState === 'copied' ? 'text-soft' : 'text-danger'"
                >
                  {{
                    copyState === 'copied' ? copy.contact.form.copied : copy.contact.form.copyFailed
                  }}
                </p>
              </Transition>
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
                :href="whatsappHref"
                target="_blank"
                rel="noreferrer"
                :aria-label="copy.contact.whatsappAria"
                class="contact-pill"
              >
                <span class="contact-pill-icon" aria-hidden="true">
                  <UiIcon name="whatsapp" :size="11" />
                </span>
                <span>{{ whatsapp }}</span>
                <UiIcon name="arrow-up-right" :size="11" class="ml-auto shrink-0 text-muted" />
              </a>

              <a
                :href="github"
                target="_blank"
                rel="noreferrer"
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
          data-contact-panel
          class="contact-panel border border-line bg-page/80 p-5 backdrop-blur-sm md:p-7 xl:p-8"
          :class="{ 'is-armed': contactArmed[1] }"
          :style="{ '--reveal-order': 1 }"
        >
          <form class="space-y-4" novalidate @submit.prevent>
            <div>
              <label
                for="contact-name"
                class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted"
              >
                {{ copy.contact.form.nameLabel }}
              </label>
              <input
                id="contact-name"
                v-model="form.name"
                type="text"
                name="name"
                autocomplete="name"
                class="field"
                :placeholder="copy.contact.form.namePlaceholder"
              />
            </div>

            <div>
              <label
                for="contact-email"
                class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted"
              >
                {{ copy.contact.form.emailLabel }}
              </label>
              <input
                id="contact-email"
                v-model="form.email"
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                class="field"
                :placeholder="copy.contact.form.emailPlaceholder"
              />
            </div>

            <div>
              <label
                for="contact-subject"
                class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted"
              >
                {{ copy.contact.form.subjectLabel }}
              </label>
              <input
                id="contact-subject"
                v-model="form.subject"
                type="text"
                name="subject"
                autocomplete="off"
                class="field"
                :placeholder="copy.contact.form.subjectPlaceholder"
              />
            </div>

            <div>
              <label
                for="contact-message"
                class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted"
              >
                {{ copy.contact.form.messageLabel }}
              </label>
              <textarea
                id="contact-message"
                v-model="form.message"
                name="message"
                rows="4"
                class="field min-h-[104px] resize-y"
                :placeholder="copy.contact.form.messagePlaceholder"
              />
            </div>

            <button type="submit" class="btn-primary w-full" disabled>
              {{ copy.contact.form.submit }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-texture {
  --dot-field-height: 320px;
  --dot-field-strength: 55%;
  --dot-field-mask: linear-gradient(to right, black 0%, transparent 58%);
  --tex-dot-core: var(--c-muted);
  --tex-dot-edge: var(--c-line-strong);
}

.contact-pill[data-copied='true'] {
  border-color: color-mix(in srgb, var(--c-soft) 70%, transparent);
  color: var(--c-soft);
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

.copy-icon-enter-active,
.copy-icon-leave-active,
.copy-status-enter-active,
.copy-status-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.copy-icon-enter-from {
  opacity: 0;
  transform: translateY(3px) scale(0.9);
}

.copy-icon-leave-to {
  opacity: 0;
  transform: translateY(-2px) scale(0.9);
}

.copy-status-enter-from {
  opacity: 0;
  transform: translateY(-2px);
}

.copy-status-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
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

@media (prefers-reduced-motion: reduce) {
  .copy-icon-enter-active,
  .copy-icon-leave-active,
  .copy-status-enter-active,
  .copy-status-leave-active {
    transition: none;
  }
}
</style>
