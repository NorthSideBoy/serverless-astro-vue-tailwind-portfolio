<script setup lang="ts">
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import { usePreferences } from '@/composables/usePreferences'

const { copy, toggleTheme } = usePreferences()

// The server cannot know the persisted theme before the inline head script
// runs, so the control renders the same neutral markup in both places and CSS
// picks the icon from `data-theme`. That keeps the accessible name stable and
// removes the hydration mismatch.
const label = () => copy.value.nav.themeToggle
</script>

<template>
  <button
    type="button"
    data-theme-toggle
    class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel/20 text-soft transition hover:border-soft hover:bg-panel/50 active:scale-[0.96]"
    :aria-label="label()"
    :title="label()"
    @click="toggleTheme"
  >
    <span class="theme-toggle__icon theme-toggle__icon--sun">
      <UiIcon name="sun" :size="15" />
    </span>
    <span class="theme-toggle__icon theme-toggle__icon--moon">
      <UiIcon name="moon" :size="15" />
    </span>
  </button>
</template>

<style>
.theme-toggle__icon {
  display: none;
  align-items: center;
  justify-content: center;
}

html[data-theme='dark'] .theme-toggle__icon--sun,
html[data-theme='light'] .theme-toggle__icon--moon {
  display: inline-flex;
}
</style>
