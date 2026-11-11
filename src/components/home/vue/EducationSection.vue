<script setup lang="ts">
import type { Locale } from '@/data/content'
import type { EducationEntry } from '@/data/schemas/education'
import type { SiteSections } from '@/data/schemas/siteSection'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'

const { locale, items, section } = defineProps<{
  locale: Locale
  items: EducationEntry[]
  section: SiteSections['education']
}>()
</script>

<template>
  <section
    id="education"
    class="dot-field dot-field--mark relative overflow-hidden section-pad-sm bg-section"
    aria-labelledby="education-title"
  >
    <div class="shell">
      <SectionHeader
        seal="七"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="education-title"
        density="compact"
      />
      <div class="border-t border-line">
        <article
          v-for="(item, index) in items"
          :key="item.id"
          data-education-item
          class="education-item relative grid gap-x-6 gap-y-3 border-b border-line py-6 md:grid-cols-[160px_minmax(0,1fr)] md:py-7"
          :style="{ '--reveal-order': index }"
        >
          <span class="education-item__trace" aria-hidden="true" />
          <div
            class="font-mono text-[10.5px] uppercase tracking-[0.1em]"
            :class="index === 0 ? 'text-soft' : 'text-muted'"
          >
            <p>{{ item.period[locale] }}</p>
            <p class="mt-1.5">{{ item.location[locale] }}</p>
          </div>
          <div class="min-w-0">
            <h3
              class="font-display text-[20px] font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[22px]"
            >
              {{ item.title[locale] }}
            </h3>
            <p
              class="mt-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted"
            >
              <a
                v-if="item.institutionHref"
                :href="item.institutionHref"
                target="_blank"
                rel="noopener noreferrer"
                class="text-soft underline decoration-soft/40 underline-offset-4 transition hover:text-ink hover:decoration-ink/40"
                >{{ item.institution }}</a
              >
              <template v-else>{{ item.institution }}</template>
            </p>
            <p
              class="mt-2.5 max-w-[68ch] text-[13px] leading-[1.7] text-muted md:text-[13.5px]"
            >
              {{ item.description[locale] }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.education-item__trace {
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
    var(--c-soft),
    var(--c-aqua) 62%,
    transparent
  );
}
@media (prefers-reduced-motion: no-preference) {
  .education-item > *:not(.education-item__trace) {
    transition:
      opacity 480ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 480ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: calc(var(--reveal-order, 0) * 70ms);
  }
  .education-item.is-armed > *:not(.education-item__trace) {
    opacity: 0;
    transform: translate3d(0, 9px, 0);
    transition: none;
  }
  .education-item.is-shown .education-item__trace {
    animation: education-trace 920ms cubic-bezier(0.16, 1, 0.3, 1)
      calc(var(--reveal-order, 0) * 70ms) both;
  }
}
@keyframes education-trace {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  14% {
    opacity: 0.9;
  }
  62% {
    opacity: 0.9;
    transform: scaleX(1);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
