<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import { scrollControl, scrollToTop } from '@/router/scrollControl'
import LocaleSwitch from './LocaleSwitch.vue'
import ThemeToggle from './ThemeToggle.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const { copy } = usePreferences()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const scrolled = ref(false)
const activeId = ref('')
const currentSectionId = ref('')
const panelRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLButtonElement | null>(null)

const links = computed(() => copy.value.nav.links)
const isProjectsPage = computed(() => route.name === 'projects')
const isBlogPage = computed(() => route.name === 'blog' || route.name === 'article')
const currentId = computed(() => {
  if (isProjectsPage.value) return 'projects'
  if (isBlogPage.value) return 'blog'
  return activeId.value
})

function targetFor(link: { id: string }) {
  if (link.id === 'projects' && isProjectsPage.value) {
    return { name: 'projects' }
  }

  if (link.id === 'blog' && isBlogPage.value) {
    return { name: 'blog' }
  }

  return { path: '/', hash: `#${link.id}` }
}

function ariaCurrentFor(link: { id: string }) {
  if (currentId.value !== link.id) return undefined
  if (isProjectsPage.value && link.id === 'projects') return 'page'
  if (isBlogPage.value && link.id === 'blog') return 'page'
  return 'location'
}

function handleHomeClick(event: MouseEvent) {
  // The router owns the return to the top so only one motion drives the page.
  // A duplicate navigation to "/" would not run the scroll behavior, so that
  // one case falls back to the shared smooth path.
  menuOpen.value = false

  if (route.name !== 'home') return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return
  }

  // Clearing the section also queues the background hash rewrite; hold it so
  // the router's own return-to-top is the navigation that wins.
  scrollControl.holdHashSync()
  activeId.value = ''
  currentSectionId.value = ''

  if (!route.hash) {
    event.preventDefault()
    scrollToTop()
  }
}

function closeMenu(returnFocus = false) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (returnFocus) toggleRef.value?.focus()
}

function toggleMenu() {
  if (menuOpen.value) {
    closeMenu(true)
    return
  }
  menuOpen.value = true
}

let syncingHash = false
let queuedHashSync = false

function sectionForAnchor(anchor: string) {
  const target = document.getElementById(anchor)
  const section = target?.closest<HTMLElement>('section[id]')
  return section?.id ?? null
}

/**
 * Sections are rendered either as direct children of `main` (static Vue SSR)
 * or inside an `<astro-island>` wrapper (hydrated islands). Both are part of
 * the same home record, so the spy has to walk the real DOM order of both.
 */
function homeSections() {
  return document.querySelectorAll<HTMLElement>(
    'main > section[id], main > astro-island > section[id]',
  )
}

function navIdForSection(sectionId: string) {
  let navId = ''

  for (const section of homeSections()) {
    if (links.value.some((link) => link.id === section.id)) navId = section.id
    if (section.id === sectionId) break
  }

  return navId
}

function updateActiveSection() {
  if (route.name !== 'home') return

  const marker = Math.max(window.innerHeight * 0.35, 160)
  let sectionId = ''
  let navId = ''

  for (const section of homeSections()) {
    if (section.getBoundingClientRect().top > marker) continue

    sectionId = section.id
    if (links.value.some((link) => link.id === section.id)) navId = section.id
  }

  currentSectionId.value = sectionId === 'top' ? '' : sectionId
  activeId.value = navId
}

async function syncHashWithSection() {
  if (route.name !== 'home') return

  // Review anchors are rendered by a collapsed island; the target does not
  // exist until the reviews section expands. Leave that fragment alone and
  // give the island its moment to mount the card instead of replacing it with
  // the surrounding chapter.
  const liveAnchor = window.location.hash.replace(/^#/, '')
  if (liveAnchor.startsWith('review-') && !document.getElementById(liveAnchor)) {
    scrollControl.holdHashSync(1200)
    return
  }

  if (scrollControl.hashSyncHeld) return
  if (syncingHash) {
    // Keep only the latest section while an earlier history update settles.
    queuedHashSync = true
    return
  }

  syncingHash = true

  try {
    const anchor = route.hash.slice(1)
    const anchorTarget = anchor ? document.getElementById(anchor) : null
    if (anchorTarget && anchorTarget.tagName !== 'SECTION') {
      const rect = anchorTarget.getBoundingClientRect()
      if (rect.bottom > 0 && rect.top < window.innerHeight) return
    }

    const hash = currentSectionId.value ? `#${currentSectionId.value}` : ''
    if (route.hash === hash) return

    scrollControl.preserve = true
    await router.replace({ path: route.path, query: route.query, hash })
    // Vue Router applies scrollBehavior on the next tick. Keep the guard alive
    // until then so syncing the hash never moves the page.
    await nextTick()
  } catch {
    // A superseded history update must not stop section tracking.
  } finally {
    scrollControl.preserve = false
    syncingHash = false

    if (queuedHashSync) {
      queuedHashSync = false
      void syncHashWithSection()
    }
  }
}

function onScroll() {
  scrolled.value = window.scrollY > 8
  updateActiveSection()
}

function onResize() {
  updateActiveSection()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu(true)
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !panelRef.value) return
  const focusables = panelRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
  if (!focusables.length) return
  const first = focusables[0]!
  const last = focusables[focusables.length - 1]!
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === panelRef.value)
  ) {
    event.preventDefault()
    last.focus()
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === panelRef.value)
  ) {
    event.preventDefault()
    first.focus()
  }
}

watch(menuOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    await nextTick()
    panelRef.value?.focus()
  }
})

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

watch(currentSectionId, () => {
  // The address bar has to track the section as soon as it changes: a reload
  // right after reaching the hero must not restore the section just left.
  void syncHashWithSection()
})

let wideQuery: MediaQueryList | null = null

function onWideChange(event: MediaQueryListEvent) {
  if (event.matches) menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('keydown', onKeydown)

  scrolled.value = window.scrollY > 8

  if (isProjectsPage.value) {
    activeId.value = 'projects'
  } else if (isBlogPage.value) {
    activeId.value = 'blog'
  } else {
    const hash = route.hash.slice(1)
    if (hash && document.getElementById(hash)) {
      const sectionId = sectionForAnchor(hash)
      currentSectionId.value = hash === 'top' ? '' : hash
      activeId.value = sectionId ? navIdForSection(sectionId) : ''
    } else {
      updateActiveSection()
    }
  }

  if (typeof window.matchMedia === 'function') {
    wideQuery = window.matchMedia('(min-width: 1280px)')
    wideQuery.addEventListener('change', onWideChange)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeydown)
  wideQuery?.removeEventListener('change', onWideChange)
  scrollControl.preserve = false
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="site-header sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-200"
    :class="scrolled ? 'border-line bg-page/92' : 'border-transparent bg-page/75'"
  >
    <div class="shell flex h-[var(--header-bar-height)] items-center justify-between gap-4">
      <RouterLink
        to="/"
        class="group flex min-w-0 items-center gap-3"
        :aria-current="route.name === 'home' && currentId === '' ? 'page' : undefined"
        @click="handleHomeClick"
      >
        <span
          class="shrink-0 font-serif text-[23px] font-black leading-none tracking-[-0.04em] text-ink transition group-hover:text-soft xl:text-[25px]"
        >
          NSB
        </span>
        <span
          class="flex min-w-0 flex-col gap-1 font-mono leading-none text-muted transition group-hover:text-ink"
        >
          <span class="truncate text-[10px] font-medium tracking-[0.04em] sm:text-[11px]">
            NorthSideBoy
          </span>
          <span class="truncate text-[10px] tracking-[0.04em]">Said Lucena</span>
        </span>
      </RouterLink>

      <nav class="ml-auto hidden items-center gap-6 xl:flex" :aria-label="copy.nav.navLabel">
        <RouterLink
          v-for="link in copy.nav.links"
          :key="link.id"
          :to="targetFor(link)"
          :aria-current="ariaCurrentFor(link)"
          class="relative py-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.07em] transition-colors"
          :class="currentId === link.id ? 'text-soft' : 'text-muted hover:text-ink'"
        >
          {{ link.label }}
          <span
            class="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-soft transition-transform duration-200"
            :class="currentId === link.id ? 'scale-x-100' : 'scale-x-0'"
            aria-hidden="true"
          />
        </RouterLink>
      </nav>

      <div class="ml-2 flex shrink-0 items-center gap-2 md:ml-6 md:gap-2.5">
        <div class="hidden md:block">
          <LocaleSwitch />
        </div>
        <div class="hidden md:block">
          <ThemeToggle />
        </div>
        <button
          ref="toggleRef"
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel/20 text-soft transition hover:border-soft xl:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? copy.nav.closeMenu : copy.nav.openMenu"
          @click="toggleMenu"
        >
          <UiIcon :name="menuOpen ? 'close' : 'menu'" :size="18" />
        </button>
      </div>
    </div>

    <Transition name="drawer">
      <div
        v-if="menuOpen"
        id="mobile-menu"
        ref="panelRef"
        tabindex="-1"
        class="absolute inset-x-0 top-full flex h-[calc(100dvh-var(--header-bar-height))] flex-col overflow-hidden border-b border-line bg-page xl:hidden"
        @keydown="onPanelKeydown"
      >
        <nav
          class="shell flex min-h-0 flex-1 flex-col overflow-y-auto py-5"
          :aria-label="copy.nav.navLabel"
        >
          <RouterLink
            v-for="link in copy.nav.links"
            :key="link.id"
            :to="targetFor(link)"
            :aria-current="ariaCurrentFor(link)"
            class="mobile-menu-link block border-b border-line py-4 font-display text-[22px] font-semibold tracking-[-0.01em] transition hover:text-soft"
            :class="currentId === link.id ? 'text-soft' : 'text-ink'"
            @click="closeMenu()"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
        <div class="shrink-0 border-t border-line bg-page md:hidden">
          <div class="mobile-menu-controls shell flex items-center justify-between py-3">
            <LocaleSwitch />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  --header-bar-height: 88px;
}

@media (min-width: 1280px) {
  .site-header {
    --header-bar-height: 120px;
  }
}

@media (max-height: 520px) {
  .site-header {
    --header-bar-height: 64px;
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active,
  .drawer-leave-active {
    transition: none;
  }
}

@media (max-height: 520px) {
  .mobile-menu-link {
    padding-block: 0.6rem;
    font-size: 17px;
  }

  .mobile-menu-controls {
    padding-block: 0.375rem;
  }
}
</style>
