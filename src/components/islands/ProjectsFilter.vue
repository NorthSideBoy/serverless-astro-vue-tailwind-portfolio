<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'

type Filter = 'all' | 'own' | 'collaborations'
const props = defineProps<{
  label: string
  countLabel: string
  labels: Record<Filter, string>
  counts: Record<Filter, number>
}>()
const selected = shallowRef<Filter>('all')
const filters = computed(() => (['all', 'own', 'collaborations'] as const).map((id) => ({
  id, label: props.labels[id], count: props.counts[id],
})))
const visibleCount = computed(() => props.counts[selected.value])

function cards() {
  return document.querySelectorAll<HTMLElement>('#projects-grid [data-project-card]')
}

function applyFilter(value: Filter) {
  selected.value = value
  for (const card of cards()) {
    card.hidden = value !== 'all' && card.dataset.projectKind !== value
  }
}

async function focusDeepLink() {
  const id = window.location.hash.slice(1)
  if (!id.startsWith('project-')) return
  const target = document.getElementById(id)
  if (!target?.matches('[data-project-card]')) return
  if (target.hidden) applyFilter('all')
  await nextTick()
  requestAnimationFrame(() => target.focus({ preventScroll: true }))
}

onMounted(() => {
  void focusDeepLink()
  window.addEventListener('hashchange', focusDeepLink)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', focusDeepLink))
</script>

<template>
  <div class="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
    <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="label">
      <button
        v-for="item in filters" :key="item.id" type="button" aria-controls="projects-grid"
        class="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.06em] transition"
        :class="selected === item.id ? 'border-soft bg-soft/10 text-soft' : 'border-line text-muted hover:border-soft/50 hover:text-ink'"
        :aria-pressed="selected === item.id"
        @click="applyFilter(item.id)"
      >{{ item.label }} <span class="text-[11px]">{{ item.count }}</span></button>
    </div>
    <p class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted" aria-live="polite">
      {{ visibleCount }} {{ countLabel }}
    </p>
  </div>
</template>
