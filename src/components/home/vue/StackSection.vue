<script setup lang="ts">
import { computed } from 'vue'
import { content, type Locale } from '@/data/content'
import type { StackGroup } from '@/data/schemas/stackGroup'
import type { StackTechnology } from '@/data/schemas/technology'
import type { SiteSections } from '@/data/schemas/siteSection'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import PlateFrame from '@/components/ui/vue/PlateFrame.vue'
import TechIcon from '@/components/ui/vue/TechIcon.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = defineProps<{
  locale: Locale
  groups: StackGroup[]
  technologies: StackTechnology[]
  section: SiteSections['stack']
}>()
const stack = computed(() =>
  props.technologies
    .filter((item) => item.stackGroupId !== null)
    .sort((a, b) => a.order - b.order),
)
const grouped = computed(() =>
  [...props.groups]
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      items: stack.value.filter((item) => item.stackGroupId === group.id),
    })),
)
</script>
<template>
  <section
    id="stack"
    class="dot-field dot-field--mark dot-field--body relative overflow-hidden section-pad-sm bg-section"
    aria-labelledby="stack-title"
  >
    <span class="dot-extra" style="--dot-extra-focus: 0% 50%" aria-hidden="true" />
    <span class="dot-extra" style="--dot-extra-top: 80%; --dot-extra-height: 560px; --dot-field-strength: 58%" aria-hidden="true" />
    <div class="shell">
      <SectionHeader
        seal="四"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="stack-title"
        density="compact"
      />
      <PlateFrame>
        <div class="p-5 md:p-8 xl:p-9">
          <div
            class="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between md:gap-12"
          >
            <p
              class="max-w-[620px] text-[13.5px] leading-[1.7] text-muted md:text-[14px]"
            >
              {{ section[locale].note }}
            </p>
            <div
              class="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
            >
              <span
                >{{ stack.length }}
                {{ content[locale].stack.meta.technologiesLabel }} ·
                {{ groups.length }}
                {{ content[locale].stack.meta.areasLabel }}</span
              >
              <span class="inline-flex items-center gap-1.5 text-soft/90"
                ><span
                  class="h-1.5 w-1.5 rounded-full bg-soft"
                  aria-hidden="true"
                />{{ content[locale].stack.meta.coreLabel }}</span
              >
            </div>
          </div>
          <div class="mt-7 space-y-7 xl:mt-8 xl:space-y-8">
            <section
              v-for="(group, groupIndex) in grouped"
              :key="group.id"
              data-stack-group
              class="stack-group grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10"
              :aria-labelledby="`stack-group-${group.id}`"
            >
              <header
                class="stack-group__header lg:border-r lg:border-line lg:pr-8"
              >
                <p class="font-mono text-[10px] tracking-[0.12em] text-soft" aria-hidden="true">
                  {{ String(groupIndex + 1).padStart(2, '0') }}
                </p>
                <h3
                  :id="`stack-group-${group.id}`"
                  class="mt-1.5 font-display text-[17px] font-semibold uppercase tracking-[0.03em] text-ink md:text-[18px]"
                >
                  {{ group.name[locale] }}
                </h3>
                <p
                  class="mt-1.5 text-[12px] leading-[1.6] text-muted lg:mt-2.5"
                >
                  {{ group.description[locale] }}
                </p>
              </header>
              <ul
                class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2.5"
              >
                <li
                  v-for="(item, itemIndex) in group.items"
                  :key="item.id"
                  class="stack-tile-cell"
                  :style="{
                    '--tile-delay': `${60 + Math.min(itemIndex * 35, 175)}ms`,
                  }"
                >
                  <a
                    :href="item.href || undefined"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="stack-tile group/tile relative flex min-h-[96px] flex-col justify-between overflow-hidden border bg-section p-3 transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-panel/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    :class="[
                      item.core ? 'border-soft/40' : 'border-line',
                      groupIndex === 0 && itemIndex === 0 ? 'dot-corner' : '',
                    ]"
                    :style="{
                      '--tech-color-dark':
                        item.hoverColor?.dark ?? 'transparent',
                      '--tech-color-light':
                        item.hoverColor?.light ?? 'transparent',
                    }"
                  >
                    <span
                      class="stack-tile__line pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/tile:scale-x-100 group-focus-visible/tile:scale-x-100 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                    <div class="flex items-start justify-between gap-2">
                      <TechIcon
                        :name="item.icon ?? item.id"
                        :path="item.resolvedIconPath"
                        :custom-icon="item.customIcon"
                        :size="24"
                        class="stack-tile__icon h-6 w-6 text-icon transition-[transform,color,filter] duration-300 group-hover/tile:scale-110 group-focus-visible/tile:scale-110 motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100 motion-reduce:group-focus-visible/tile:scale-100"
                      />
                      <div class="flex items-center gap-2">
                        <span
                          v-if="item.core"
                          class="h-1.5 w-1.5 shrink-0 rounded-full bg-soft/80"
                          aria-hidden="true"
                        /><UiIcon
                          name="arrow-up-right"
                          :size="13"
                          class="stack-tile__arrow text-muted transition-[color,transform] duration-300 motion-reduce:transition-none"
                        />
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p
                        class="break-words text-[12.5px] font-medium leading-tight text-ink"
                      >
                        {{ item.name }}
                      </p>
                      <p
                        class="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted"
                      >
                        {{ item.tag[locale] }}
                      </p>
                    </div>
                    <span v-if="item.href" class="sr-only"
                      >({{ content[locale].ui.opensInNewTab }})</span
                    >
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </PlateFrame>
    </div>
  </section>
</template>
<style scoped>
.stack-tile {
  --tech-color: var(--tech-color-dark);
}
:global(html[data-theme='light']) .stack-tile {
  --tech-color: var(--tech-color-light);
}
.stack-tile:is(:hover, :focus-visible) {
  border-color: color-mix(in srgb, var(--tech-color) 60%, var(--c-line));
  box-shadow: 0 14px 30px -24px var(--tech-color);
}
.stack-tile:is(:hover, :focus-visible) .stack-tile__icon {
  color: var(--tech-color);
  filter: drop-shadow(
    0 2px 6px color-mix(in srgb, var(--tech-color) 65%, transparent)
  );
}
.stack-tile:is(:hover, :focus-visible) .stack-tile__arrow {
  color: var(--tech-color);
  transform: translate(2px, -2px);
}
.stack-tile__line {
  background-color: var(--tech-color);
}
@media (prefers-reduced-motion: no-preference) {
  .stack-group__header,
  .stack-tile-cell {
    transition:
      opacity 460ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 460ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--tile-delay, 0ms);
  }
  .stack-group.is-armed .stack-group__header,
  .stack-group.is-armed .stack-tile-cell {
    opacity: 0;
    transform: translate3d(0, 9px, 0);
    transition: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .stack-tile:is(:hover, :focus-visible) .stack-tile__arrow {
    transform: none;
  }
}
</style>
