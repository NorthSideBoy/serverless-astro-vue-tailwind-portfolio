<script setup lang="ts">
import { RouterLink, useRoute } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { scrollToTop } from '@/router/scrollControl'
import LocaleSwitch from './ui/LocaleSwitch.vue'

const { copy } = usePreferences()
const route = useRoute()

function handleHomeClick(event: MouseEvent) {
  if (route.name !== 'home' || route.hash) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return
  }

  event.preventDefault()
  scrollToTop()
}
</script>

<template>
  <footer class="border-t border-line bg-page">
    <div class="shell py-14 md:py-16 xl:py-20">
      <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1.1fr] md:gap-12">
        <div>
          <RouterLink
            to="/"
            class="inline-flex items-center gap-3"
            @click="handleHomeClick"
          >
            <span
              class="font-serif text-[26px] font-black leading-none tracking-[-0.04em] text-ink"
            >
              SL
            </span>
            <span class="sr-only">{{ copy.nav.homeLabel }}</span>
            <span class="h-3.5 w-px bg-line-strong/60" aria-hidden="true" />
            <span class="seal-glyph text-[19px] leading-none text-soft" aria-hidden="true"
              >設計</span
            >
          </RouterLink>
          <p class="mt-5 max-w-[320px] text-[13.5px] leading-[1.7] text-muted">
            {{ copy.footer.tagline }}
          </p>
        </div>

        <div>
          <p class="mono-label text-muted">{{ copy.footer.sectionsLabel }}</p>
          <nav
            class="mt-4 flex flex-col items-start gap-2.5"
            :aria-label="copy.footer.sectionsLabel"
          >
            <RouterLink
              v-for="link in copy.nav.links"
              :key="link.id"
              :to="{ path: '/', hash: `#${link.id}` }"
              class="text-[12.5px] text-muted transition hover:text-soft"
            >
              {{ link.label }}
            </RouterLink>
          </nav>
        </div>

        <slot name="contact" />
      </div>

      <div
        class="mt-12 flex flex-col gap-5 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="font-mono text-[10px] uppercase tracking-[0.05em] text-muted">
          {{ copy.footer.copyright }}
        </p>
        <span class="seal-glyph hidden text-[17px] text-soft/80 sm:block" aria-hidden="true">
          構
        </span>
        <LocaleSwitch />
      </div>
    </div>
  </footer>
</template>
