<script setup lang="ts">
import { FileCode2 } from '@lucide/vue'

defineProps<{
  name?: string
  path?: string | null
  customIcon?: string | null
  size?: number
}>()
</script>

<template>
  <span
    v-if="customIcon"
    class="tech-icon-mask"
    :style="{
      width: `${size ?? 32}px`,
      height: `${size ?? 32}px`,
      '--tech-icon-url': `url('${customIcon}')`,
    }"
    aria-hidden="true"
    :data-tech-icon="name"
  />
  <svg
    v-else-if="path"
    class="tech-icon"
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    :data-tech-icon="name"
  >
    <path :d="path" />
  </svg>
  <FileCode2
    v-else
    :size="size ?? 32"
    :stroke-width="1.5"
    aria-hidden="true"
    focusable="false"
    :data-tech-icon="name"
  />
</template>

<style scoped>
/* An svg clips its own viewport by default, which slices off glows, shadows and
   scales a consumer adds around the mark. The icon box itself stays fixed. */
.tech-icon {
  overflow: visible;
}

.tech-icon-mask {
  display: inline-block;
  background-color: currentColor;
  -webkit-mask: var(--tech-icon-url) center / contain no-repeat;
  mask: var(--tech-icon-url) center / contain no-repeat;
  transition: background-color 300ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .tech-icon-mask {
    transition: none;
  }
}
</style>
