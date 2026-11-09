<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { initialsFromName } from '@/data/reviews'

const props = withDefaults(
  defineProps<{
    name: string
    photo?: string | null
    size?: number
    eager?: boolean
  }>(),
  { photo: null, size: 48, eager: false },
)

const failed = ref(false)
watch(
  () => props.photo,
  () => {
    failed.value = false
  },
)

const initials = computed(() => initialsFromName(props.name))
const visibleInitials = computed(() =>
  props.size >= 40 ? initials.value.slice(0, 2) : initials.value.slice(0, 1),
)
const boxStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.max(9, Math.round(props.size * 0.33))}px`,
}))
</script>

<template>
  <span class="avatar" :style="boxStyle">
    <img
      v-if="photo && !failed"
      :src="photo"
      alt=""
      :width="size"
      :height="size"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      referrerpolicy="no-referrer"
      @error="failed = true"
    />
    <span v-else class="avatar__initials" aria-hidden="true">{{ visibleInitials }}</span>
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--c-line-strong);
  border-radius: 9999px;
  background-color: var(--c-sunken);
  color: var(--c-soft);
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
