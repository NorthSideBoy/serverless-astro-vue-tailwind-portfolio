<script setup lang="ts">
import { computed } from 'vue'
import { content, type Locale } from '@/data/content'
import type { Article } from '@/data/schemas/article'
import type { SiteSections } from '@/data/schemas/siteSection'
import {
  articleCoverAlt,
  articleCoverSrc,
  articleReadTime,
  articlesForLocale,
  availableArticleLanguages,
  formatArticleDate,
  resolveArticleTranslation,
} from '@/data/articleUtils'
import { hasThemeVariant } from '@/data/themeMedia'
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
const lead = computed(() => latest.value[0])
const rest = computed(() => latest.value.slice(1))
const leadHasThemeVariant = computed(() =>
  lead.value
    ? hasThemeVariant(lead.value.post.cover.src, lead.value.post.cover.darkSrc)
    : false,
)
</script>
<template>
  <section
    id="blog"
    class="dot-field dot-field--body relative overflow-hidden section-pad border-t border-line bg-section"
    aria-labelledby="blog-title"
  >
    <span class="dot-extra" aria-hidden="true" />
    <span class="dot-extra" style="--dot-extra-top: 86%; --dot-extra-focus: 0% 50%; --dot-extra-height: 520px; --dot-field-strength: 58%" aria-hidden="true" />
    <div class="shell">
      <SectionHeader
        seal="九"
        :eyebrow="section[locale].eyebrow"
        :title="section[locale].title"
        :lead="section[locale].lead"
        title-id="blog-title"
        signal
      />
      <div
        v-if="latest.length"
        class="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-5"
      >
        <a
          v-if="lead"
          :href="articleHref(lead.post.slug, lead.translation.lang)"
          data-blog-card
          class="blog-card group relative flex flex-col overflow-hidden border border-line bg-panel/15 transition-colors hover:border-line-strong"
          :style="{ '--reveal-order': 0 }"
        >
          <span
            class="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left scale-x-0 bg-gradient-to-r from-soft/70 via-aqua/60 to-transparent transition-transform duration-300 group-hover:scale-x-100"
            aria-hidden="true"
          /><span class="blog-card__register" aria-hidden="true" />
          <figure
            class="dot-surface relative overflow-hidden border-b border-line bg-sunken"
          >
            <template v-if="leadHasThemeVariant">
              <img
                :src="articleCoverSrc(lead.post.cover, 'dark')"
                :alt="articleCoverAlt(lead.post.cover, lead.translation.lang)"
                :lang="lead.translation.lang"
                :width="lead.post.cover.width ?? 1200"
                :height="lead.post.cover.height ?? 750"
                loading="lazy"
                decoding="async"
                class="theme-media-dark aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.015]"
              />
              <img
                :src="articleCoverSrc(lead.post.cover, 'light')"
                :alt="articleCoverAlt(lead.post.cover, lead.translation.lang)"
                :lang="lead.translation.lang"
                :width="lead.post.cover.width ?? 1200"
                :height="lead.post.cover.height ?? 750"
                loading="lazy"
                decoding="async"
                class="theme-media-light aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.015]"
              />
            </template>
            <img
              v-else
              :src="articleCoverSrc(lead.post.cover, 'light')"
              :alt="articleCoverAlt(lead.post.cover, lead.translation.lang)"
              :lang="lead.translation.lang"
              :width="lead.post.cover.width ?? 1200"
              :height="lead.post.cover.height ?? 750"
              loading="lazy"
              decoding="async"
              class="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.015]"
            />
          </figure>
          <div class="flex flex-1 flex-col p-5 md:p-7">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p
                class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
              >
                {{ formatArticleDate(lead.post.publishedAt, locale) }} ·
                {{ articleReadTime(lead.translation) }}
                {{ copy.blog.minLabel }}
              </p>
              <p
                class="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
              >
                <span :lang="lead.translation.lang">{{
                  lead.translation.category
                }}</span
                ><span
                  v-if="lead.post.featured"
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
                    v-for="language in availableArticleLanguages(lead.post)"
                    :key="language"
                    class="border border-line px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
                    >{{ language.toUpperCase() }}</span
                  ></span
                >
              </p>
            </div>
            <h3
              class="mt-4 font-display text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink transition group-hover:text-soft md:text-[26px] xl:text-[28px]"
            >
              <span :lang="lead.translation.lang">{{
                lead.translation.title
              }}</span>
            </h3>
              <p class="type-copy-compact mt-3 line-clamp-3 max-w-[68ch] leading-[1.7] text-muted">
              <span :lang="lead.translation.lang">{{
                lead.translation.excerpt
              }}</span>
            </p>
            <div
              class="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4 md:mt-6"
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
          </div>
        </a>

        <div
          class="grid self-start gap-px border border-line bg-line"
        >
          <a
            v-for="({ post, translation }, index) in rest"
            :key="post.slug"
            :href="articleHref(post.slug, translation.lang)"
            data-blog-card
            class="blog-card group relative flex flex-col justify-between bg-section p-5 transition-colors hover:bg-panel/15 md:p-6"
            :style="{ '--reveal-order': index + 1 }"
          >
            <span
              class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-soft/70 via-aqua/60 to-transparent transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden="true"
            /><span class="blog-card__register" aria-hidden="true" />
            <div>
              <p
                class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted"
              >
                <span>{{ formatArticleDate(post.publishedAt, locale) }}</span>
                <span :lang="translation.lang">{{ translation.category }}</span>
                <span
                  v-if="post.featured"
                  class="border border-soft/40 px-1.5 py-0.5 text-[10px] text-soft"
                  >{{ copy.blogPage.highlighted }}</span
                >
                <span
                  class="inline-flex flex-wrap gap-1"
                  :aria-label="
                    locale === 'es'
                      ? 'Idiomas disponibles'
                      : 'Available languages'
                  "
                  ><span
                    v-for="language in availableArticleLanguages(post)"
                    :key="language"
                    class="border border-line px-1.5 py-0.5 text-[10px] text-muted"
                    >{{ language.toUpperCase() }}</span
                  ></span
                >
              </p>
              <h3
                class="mt-3 font-display text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink transition group-hover:text-soft md:text-[20px]"
              >
                <span :lang="translation.lang">{{ translation.title }}</span>
              </h3>
              <p class="type-copy-compact mt-2 line-clamp-2 leading-[1.65] text-muted">
                <span :lang="translation.lang">{{ translation.excerpt }}</span>
              </p>
            </div>
            <div
              class="mt-4 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
            >
              <span>{{ copy.blog.readMore }}</span>
              <UiIcon
                name="arrow-right"
                :size="13"
                class="transition group-hover:translate-x-1 group-hover:text-soft"
              />
            </div>
          </a>
          <a
            :href="blog"
            data-blog-card
            class="blog-card group flex min-h-12 items-center justify-between gap-3 bg-section p-5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-soft transition-colors hover:bg-panel/15 hover:text-ink md:p-6"
            :style="{ '--reveal-order': rest.length + 1 }"
          >
            <span>{{ copy.blog.viewAll }}</span>
            <UiIcon
              name="arrow-right"
              :size="14"
              class="transition group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
      <p
        v-if="!latest.length"
          class="type-support mt-6 border border-line bg-panel/10 p-5 text-muted"
        role="status"
      >
        {{ copy.ui.emptyContent }}
      </p>
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
      border-color 180ms ease,
      background-color 180ms ease;
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
