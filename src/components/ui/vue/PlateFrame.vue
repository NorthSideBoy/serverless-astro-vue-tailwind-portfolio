<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Background ground. `panel` is the translucent default; `page` is the deepest ground. */
    tone?: 'panel' | 'page' | 'section' | 'sunken'
  }>(),
  { tone: 'panel' },
)

const toneClass = computed(
  () =>
    ({
      panel: 'bg-panel/20',
      page: 'bg-page',
      section: 'bg-section',
      sunken: 'bg-sunken',
    })[props.tone],
)
</script>

<template>
  <div class="relative border border-line" :class="toneClass">
    <span
      class="pointer-events-none absolute -left-px -top-px h-3.5 w-3.5 border-l border-t border-line-strong"
      aria-hidden="true"
    />
    <span
      class="pointer-events-none absolute -right-px -top-px h-3.5 w-3.5 border-r border-t border-line-strong"
      aria-hidden="true"
    />
    <span
      class="pointer-events-none absolute -bottom-px -left-px h-3.5 w-3.5 border-b border-l border-line-strong"
      aria-hidden="true"
    />
    <span
      class="pointer-events-none absolute -bottom-px -right-px h-3.5 w-3.5 border-b border-r border-line-strong"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>
