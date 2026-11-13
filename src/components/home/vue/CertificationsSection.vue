<script setup lang="ts">
import type { Locale } from '@/data/content'
import type { CertificationEntry } from '@/data/schemas/certification'
import type { SiteSections } from '@/data/schemas/siteSection'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const { locale, items, section } = defineProps<{
  locale: Locale
  items: CertificationEntry[]
  section: SiteSections['certifications']
}>()
</script>

<template>
  <section
    id="certifications"
    class="section-pad border-t border-line bg-section"
    aria-labelledby="certifications-title"
  >
    <div class="shell">
      <SectionHeader
        seal="八"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="certifications-title"
      />
      <div class="border-t border-line">
        <article
          v-for="(item, index) in items"
          :key="item.id"
          data-certification-item
          class="certification-item relative grid gap-x-6 gap-y-2 border-b border-line py-4 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-start md:py-5"
          :style="{ '--reveal-order': index }"
        >
          <span class="certification-item__trace" aria-hidden="true" />
          <div
            class="flex items-baseline gap-3 font-mono text-[10.5px] uppercase tracking-[0.1em]"
            :class="index === 0 ? 'text-soft' : 'text-muted'"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="text-muted">{{ item.date[locale] }}</span>
          </div>
          <div class="min-w-0">
            <h3
              class="font-display text-[17px] font-semibold leading-snug text-ink md:text-[19px]"
            >
              {{ item.title }}
            </h3>
            <p
              class="mt-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted"
            >
              {{ item.provider }}
            </p>
          </div>
          <a
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
              class="type-meta group inline-flex min-h-11 max-w-full items-center gap-1 break-all font-mono tracking-[0.02em] text-soft transition hover:text-ink md:justify-end md:text-right"
            >{{ item.credentialId }}
            <UiIcon
              name="arrow-up-right"
              :size="11"
              class="shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          /></a>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.certification-item__trace {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left center;
  background-image: linear-gradient(
    to right,
    transparent,
    var(--c-soft) 18%,
    var(--c-aqua) 82%,
    transparent
  );
}
@media (prefers-reduced-motion: no-preference) {
  .certification-item > *:not(.certification-item__trace) {
    transition:
      opacity 440ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 440ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: calc(var(--reveal-order, 0) * 55ms);
  }
  .certification-item.is-armed > *:not(.certification-item__trace) {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
    transition: none;
  }
  .certification-item.is-shown .certification-item__trace {
    animation: certification-trace 900ms cubic-bezier(0.16, 1, 0.3, 1)
      calc(var(--reveal-order, 0) * 55ms) both;
  }
}
@keyframes certification-trace {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  16% {
    opacity: 0.85;
  }
  64% {
    opacity: 0.85;
    transform: scaleX(1);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
