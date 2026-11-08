<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'outline' | 'plain'
    tone?: 'muted' | 'soft'
  }>(),
  { variant: 'outline', tone: 'muted' },
)
</script>

<template>
  <span
    v-if="variant === 'outline'"
    class="inline-flex items-center rounded-sm border border-line px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em]"
    :class="tone === 'soft' ? 'text-soft/90' : 'text-muted'"
  >
    <slot />
  </span>
  <span
    v-else
    class="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em] text-muted"
  >
    <span class="h-1 w-1 shrink-0 bg-soft/55" aria-hidden="true" />
    <slot />
  </span>
</template>
