<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

const progress = shallowRef(0)

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="fixed inset-x-0 top-0 z-[70] h-[2px]" aria-hidden="true">
    <div
      class="h-full origin-left"
      :style="{ transform: `scaleX(${progress / 100})`, backgroundImage: 'linear-gradient(90deg, var(--c-action), var(--c-action-2))' }"
    />
  </div>
</template>
