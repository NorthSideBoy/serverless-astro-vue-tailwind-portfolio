<script setup lang="ts">
import { computed } from 'vue'
import type { IconName } from '@/components/ui/icon-names'
import { brandIcons, isBrandIcon } from '@/components/ui/brand-icons'
import { uiIconComponents } from './icon-map'

const { name, size = 20, strokeWidth = 1.6 } = defineProps<{
  name: IconName
  size?: number
  strokeWidth?: number
}>()

const brand = computed(() => (isBrandIcon(name) ? brandIcons[name] : null))
const icon = computed(() => (isBrandIcon(name) ? null : uiIconComponents[name]))
</script>

<template>
  <svg
    v-if="brand"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    :data-icon="name"
  >
    <path :d="brand" />
  </svg>
  <component
    v-else-if="icon"
    :is="icon"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
    focusable="false"
    :data-icon="name"
  />
</template>
