<script setup lang="ts">
export interface TocItem {
  id: string
  text: string
  level: 2 | 3 | 4
}
defineProps<{
  items: TocItem[]
  label: string
  lang: string
  variant?: 'inline' | 'aside'
}>()
</script>

<template>
  <nav
    data-article-toc
    :class="
      variant === 'aside'
        ? 'sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto'
        : 'mt-8 border-y border-line py-5 xl:hidden'
    "
    :aria-label="label"
  >
    <p class="mono-label text-muted">{{ label }}</p>
    <ul
      :lang="lang"
      :class="
        variant === 'aside'
          ? 'mt-4 space-y-2.5 border-l border-line'
          : 'mt-3 grid gap-x-6 sm:grid-cols-2'
      "
    >
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          :class="
            variant === 'aside'
               ? 'type-action -ml-px block border-l border-transparent pl-4 leading-[1.55] text-muted transition hover:border-soft hover:text-ink'
               : 'type-action flex min-h-11 items-center border-b border-line/60 py-2 leading-[1.5] text-ink transition hover:text-soft'
          "
        >
          <span :style="{ paddingLeft: `${(item.level - 2) * 12}px` }">{{
            item.text
          }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
<style scoped>
nav a[aria-current='location'] {
  color: var(--c-soft);
}
nav.sticky a[aria-current='location'] {
  border-color: var(--c-soft);
  color: var(--c-ink);
}
</style>
