<script setup lang="ts">
import { usePreferences } from '@/composables/usePreferences'

defineProps<{
  loading: boolean
  error: string | null
}>()

defineEmits<{ retry: [] }>()

const { copy } = usePreferences()
</script>

<template>
  <div
     class="type-support border border-line bg-panel/10 p-5 text-muted"
    :role="error ? 'alert' : 'status'"
  >
    <template v-if="loading">{{ copy.ui.loadingContent }}</template>
    <template v-else-if="error">
      {{ copy.ui.errorContent }}
      <button type="button" class="ml-3 min-h-11 text-soft underline" @click="$emit('retry')">
        {{ copy.ui.retryContent }}
      </button>
    </template>
    <template v-else>{{ copy.ui.emptyContent }}</template>
  </div>
</template>
