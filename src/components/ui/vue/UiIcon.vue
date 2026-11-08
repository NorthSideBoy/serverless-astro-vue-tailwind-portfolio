<script setup lang="ts">
import { computed } from 'vue'
import { brandIcons, iconPaths } from '@/components/ui/icons'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    strokeWidth?: number
  }>(),
  { size: 20, strokeWidth: 1.6 },
)


const isBrand = computed(() => brandIcons.has(props.name))
const body = computed(() => iconPaths[props.name] ?? '')
</script>

<template>
  <svg
    v-if="isBrand"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="body" />
  </svg>
  <svg
    v-else
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="body"
  />
</template>
