<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    code: string
    label: string
    lang?: string
    filename?: string
    /** Use inside an existing plate (for example a disclosure) to avoid nested cards. */
    bare?: boolean
  }>(),
  { bare: false },
)

const headerLabel = computed(() => [props.filename, props.lang].filter(Boolean).join(' · '))
const accessibleLabel = computed(() => [props.lang, props.label].filter(Boolean).join(' — '))
</script>

<template>
  <figure
    class="min-w-0 max-w-full overflow-hidden"
    :class="bare ? '' : 'rounded-lg border border-line bg-panel-2/80'"
  >
    <div class="flex items-center gap-1.5 border-b border-line/80 px-4 py-2.5">
      <span class="h-1.5 w-1.5 rounded-full bg-muted/45" aria-hidden="true" />
      <span class="h-1.5 w-1.5 rounded-full bg-muted/30" aria-hidden="true" />
      <span class="h-1.5 w-1.5 rounded-full bg-muted/20" aria-hidden="true" />
      <span
        v-if="headerLabel"
        class="ml-2 min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
      >
        {{ headerLabel }}
      </span>
    </div>
    <pre
      class="max-h-[420px] overflow-auto p-4 font-mono text-[11.5px] leading-[1.75] text-ink/90 md:p-5 xl:text-[12px]"
      tabindex="0"
      :aria-label="accessibleLabel"
    ><code>{{ code }}</code></pre>
  </figure>
</template>
