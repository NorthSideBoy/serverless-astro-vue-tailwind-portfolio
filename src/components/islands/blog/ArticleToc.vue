<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

export interface TocItem { id: string; text: string; level: 2 | 3 | 4 }
const props = defineProps<{ items: TocItem[]; label: string; lang: string; variant?: 'inline' | 'aside' }>()
const active = shallowRef('')
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  const targets = props.items
    .map((item) => document.getElementById(item.id))
    .filter((element): element is HTMLElement => element !== null)
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting)
    if (visible.length) active.value = visible.reduce((a, b) =>
      a.boundingClientRect.top <= b.boundingClientRect.top ? a : b).target.id
  }, { rootMargin: '-96px 0px -55% 0px', threshold: 0 })
  targets.forEach((target) => observer?.observe(target))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav
    :class="variant === 'aside' ? 'sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto' : 'mt-8 border-y border-line py-5 xl:hidden'"
    :aria-label="label"
  >
    <p class="mono-label text-muted">{{ label }}</p>
    <ul
      :lang="lang"
      :class="variant === 'aside' ? 'mt-4 space-y-2.5 border-l border-line' : 'mt-3 grid gap-x-6 sm:grid-cols-2'"
    >
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          :aria-current="active === item.id ? 'location' : undefined"
          :class="variant === 'aside'
            ? `-ml-px block border-l pl-4 text-[12.5px] leading-[1.55] transition ${active === item.id ? 'border-soft text-ink' : 'border-transparent text-muted hover:border-soft hover:text-ink'}`
            : `flex min-h-11 items-center border-b border-line/60 py-2 text-[13px] leading-[1.5] transition ${active === item.id ? 'text-soft' : 'text-ink hover:text-soft'}`"
        >
          <span :style="{ paddingLeft: `${(item.level - 2) * 12}px` }">{{ item.text }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
