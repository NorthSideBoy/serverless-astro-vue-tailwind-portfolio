<script setup lang="ts">
import { techIcons } from '@/data/techIcons'
defineProps<{ name: string; size?: number }>()
</script>
<template>
  <svg
    v-if="techIcons[name]"
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="techIcons[name]" />
  </svg>
  <svg
    v-else
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M14 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9Z" />
    <path d="M14 3v6h6M8.5 13.5l7 7M15.5 13.5l-7 7" />
  </svg>
</template>
