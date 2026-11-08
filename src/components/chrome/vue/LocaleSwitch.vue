<script setup lang="ts">
import { usePreferences } from '@/composables/usePreferences'
import { useRoute } from '@/router/astroRouter'
import type { Locale } from '@/data/content'

const { copy, locale, setLocale } = usePreferences()
const route = useRoute()
const options: Locale[] = ['es', 'en']

function hrefFor(option: Locale) {
  const path = route.path.replace(/^\/en(?=\/|$)/, '') || '/'
  return `${option === 'en' ? `/en${path}` : path}${route.hash}`
}

function changeLocale(event: MouseEvent, option: Locale) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  setLocale(option)
}
</script>

<template>
  <div
    class="inline-flex items-center rounded-full border border-line bg-panel/25 p-0.5"
    role="group"
    :aria-label="copy.nav.languageLabel"
  >
    <a
      v-for="option in options"
      :key="option"
      :href="hrefFor(option)"
      data-locale-link
      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition"
      :class="locale === option ? 'bg-panel-2 text-ink' : 'text-muted hover:text-ink'"
      :aria-current="locale === option ? 'page' : undefined"
      @click="changeLocale($event, option)"
    >
      {{ option }}
    </a>
  </div>
</template>
