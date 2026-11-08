<script setup lang="ts">
import { computed } from 'vue'
import { content, type Locale } from '@/data/content'
import type { Article } from '@/data/schemas/article'
import type { SiteSections } from '@/data/schemas/siteSection'
import {
  articleReadTime,
  articlesForLocale,
  availableArticleLanguages,
  formatArticleDate,
  resolveArticleTranslation,
} from '@/data/articleUtils'
import { toHref } from '@/router/astroRouter'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = defineProps<{
  locale: Locale
  articles: Article[]
  section: SiteSections['blog']
}>()
const copy = computed(() => content[props.locale])
const blog = computed(() => toHref({ name: 'blog' }, props.locale, ''))
const latest = computed(() => {
  const sorted = articlesForLocale(props.articles, props.locale)
  const featured = sorted.filter((post) => post.featured)
  const other = sorted.filter((post) => !post.featured)

  // The home is a curated teaser: featured posts are always visible first.
  return [...featured, ...other]
    .slice(0, 3)
    .map((post) => ({
      post,
      translation: resolveArticleTranslation(post, props.locale),
    }))
})
const articleHref = (slug: string, lang: 'es' | 'en') =>
  toHref({ name: 'article', slug }, lang, '')
</script>
<template>
  <section
    id="blog"
    class="section-pad border-t border-line bg-section"
    aria-labelledby="blog-title"
  >
    <div class="shell">
      <SectionHeader
        seal="九"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="blog-title"
        signal
      />
      <div class="grid gap-4 md:grid-cols-3 md:gap-5">
        <a
          v-for="({ post, translation }, index) in latest"
          :key="post.slug"
          :href="articleHref(post.slug, translation.lang)"
          data-blog-card
          class="blog-card group relative flex flex-col overflow-hidden border border-line bg-panel/15 p-5 hover:border-line-strong md:p-6"
          :class="index === 0 ? 'dot-corner' : ''"
          :style="{ '--reveal-order': index }"
        >
          <span
            class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-soft/70 via-aqua/60 to-transparent transition-transform duration-300 group-hover:scale-x-100"
            aria-hidden="true"
          /><span class="blog-card__register" aria-hidden="true" />
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p
              class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
            >
              {{ formatArticleDate(post.publishedAt, locale) }} ·
              {{ articleReadTime(translation) }} {{ copy.blog.minLabel }}
            </p>
            <p
              class="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
            >
              <span :lang="translation.lang">{{ translation.category }}</span
              ><span
                v-if="post.featured"
                class="border border-soft/40 px-1.5 py-0.5 text-[10px] text-soft"
                >{{ copy.blogPage.highlighted }}</span
              ><span
                class="inline-flex flex-wrap gap-1"
                :aria-label="
                  locale === 'es'
                    ? 'Idiomas disponibles'
                    : 'Available languages'
                "
                ><span
                  v-for="language in availableArticleLanguages(post)"
                  :key="language"
                  class="border border-line px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
                  >{{ language.toUpperCase() }}</span
                ></span
              >
            </p>
          </div>
          <h3
            class="mt-6 font-display text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink transition group-hover:text-soft md:text-[19px]"
          >
            <span :lang="translation.lang">{{ translation.title }}</span>
          </h3>
          <p class="mt-3 line-clamp-3 text-[13px] leading-[1.65] text-muted">
            <span :lang="translation.lang">{{ translation.excerpt }}</span>
          </p>
          <div
            class="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4 md:mt-8"
          >
            <span
              class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
              >{{ copy.blog.readMore }}</span
            ><UiIcon
              name="arrow-right"
              :size="14"
              class="text-muted transition group-hover:translate-x-1 group-hover:text-soft"
            />
          </div>
        </a>
      </div>
      <p
        v-if="!latest.length"
        class="mt-6 border border-line bg-panel/10 p-5 text-[13px] text-muted"
        role="status"
      >
        {{ copy.ui.emptyContent }}
      </p>
      <div v-if="latest.length" class="mt-10 flex justify-end">
        <a :href="blog" class="btn-ghost"
          >{{ copy.blog.viewAll }} <UiIcon name="arrow-right" :size="15"
        /></a>
      </div>
    </div>
  </section>
</template>
<style scoped>
.blog-card__register {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left center;
  background-image: linear-gradient(
    to right,
    var(--c-soft),
    var(--c-aqua) 58%,
    transparent 100%
  );
}
@media (prefers-reduced-motion: no-preference) {
  .blog-card {
    transition:
      opacity 480ms cubic-bezier(0.16, 1, 0.3, 1)
        calc(var(--reveal-order, 0) * 70ms),
      transform 480ms cubic-bezier(0.16, 1, 0.3, 1)
        calc(var(--reveal-order, 0) * 70ms),
      border-color 180ms ease;
  }
  .blog-card.is-armed {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
    transition: none;
  }
  .blog-card.is-shown .blog-card__register {
    animation: blog-register 960ms cubic-bezier(0.16, 1, 0.3, 1)
      calc(var(--reveal-order, 0) * 70ms) both;
  }
}
@keyframes blog-register {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  16% {
    opacity: 0.9;
  }
  60% {
    opacity: 0.9;
    transform: scaleX(1);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
