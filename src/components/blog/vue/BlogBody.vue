<script setup lang="ts">
import { computed } from 'vue'
import { content, type Locale } from '@/data/content'
import type { SiteSections } from '@/data/schemas/siteSection'
import type { Article } from '@/data/schemas/article'
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
import SealEyebrow from '@/components/ui/vue/SealEyebrow.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = defineProps<{
  locale: Locale
  sections: SiteSections
  articles: Article[]
}>()
const copy = computed(() => content[props.locale])
const sorted = computed(() => articlesForLocale(props.articles, props.locale))
const featured = computed(() => sorted.value[0])
const featuredTranslation = computed(
  () =>
    featured.value && resolveArticleTranslation(featured.value, props.locale),
)
const rest = computed(() =>
  sorted.value
    .slice(1)
    .map((post) => ({
      post,
      translation: resolveArticleTranslation(post, props.locale),
    })),
)
const homeHref = computed(() => toHref({ name: 'home' }, props.locale, ''))
const url = (slug: string, lang: 'es' | 'en') =>
  toHref({ name: 'article', slug }, lang, '')
const featuredHasThemeVariant = computed(() =>
  featured.value
    ? hasThemeVariant(featured.value.cover.src, featured.value.cover.darkSrc)
    : false,
)
</script>
<template>
  <main id="main">
    <section class="border-b border-line bg-page">
      <div class="shell page-intro-pad pt-12 md:pt-16 xl:pt-20">
        <a
          :href="homeHref"
          class="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition hover:text-soft"
          ><UiIcon name="arrow-left" :size="14" />{{ copy.blogPage.back }}</a
        >
        <div class="section-marker mt-8 max-w-[760px]">
          <p class="mono-label text-soft">
            <SealEyebrow seal="八" :label="copy.blogPage.eyebrow" />
          </p>
          <h1
            class="type-page mt-5 font-display font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            {{ sections.blog[locale].index?.title }}
          </h1>
          <p class="section-header__lead section-lead text-muted">
            {{ sections.blog[locale].index?.lead }}
          </p>
        </div>
      </div>
    </section>
    <section class="page-content-pad bg-section">
      <div class="shell">
        <p
          v-if="!featured || !featuredTranslation"
            class="type-support border border-line bg-panel/10 p-5 text-muted"
          role="status"
        >
          {{ copy.ui.emptyContent }}
        </p>
        <template v-else>
          <p
            class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
          >
            {{ sorted.length }} {{ copy.blogPage.countLabel }}
          </p>
          <article
            class="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 border border-line bg-panel/10 md:grid-cols-2 md:gap-10"
          >
            <a
              :href="url(featured.slug, featuredTranslation.lang)"
              class="group relative block overflow-hidden border-b border-line bg-sunken md:border-b-0 md:border-r"
            >
              <template v-if="featuredHasThemeVariant">
                <img
                  :src="articleCoverSrc(featured.cover, 'dark')"
                  :alt="articleCoverAlt(featured.cover, featuredTranslation.lang)"
                  :lang="featuredTranslation.lang"
                  :width="featured.cover.width ?? 1200"
                  :height="featured.cover.height ?? 750"
                  decoding="async"
                  class="theme-media-dark w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                  :class="{
                    'aspect-[16/10]':
                      !featured.cover.width || !featured.cover.height,
                  }"
                  :style="
                    featured.cover.width && featured.cover.height
                      ? {
                          aspectRatio: `${featured.cover.width} / ${featured.cover.height}`,
                        }
                      : undefined
                  "
                />
                <img
                  :src="articleCoverSrc(featured.cover, 'light')"
                  :alt="articleCoverAlt(featured.cover, featuredTranslation.lang)"
                  :lang="featuredTranslation.lang"
                  :width="featured.cover.width ?? 1200"
                  :height="featured.cover.height ?? 750"
                  decoding="async"
                  class="theme-media-light w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                  :class="{
                    'aspect-[16/10]':
                      !featured.cover.width || !featured.cover.height,
                  }"
                  :style="
                    featured.cover.width && featured.cover.height
                      ? {
                          aspectRatio: `${featured.cover.width} / ${featured.cover.height}`,
                        }
                      : undefined
                  "
                />
              </template>
              <img
                v-else
                :src="articleCoverSrc(featured.cover, 'light')"
                :alt="articleCoverAlt(featured.cover, featuredTranslation.lang)"
                :lang="featuredTranslation.lang"
                :width="featured.cover.width ?? 1200"
                :height="featured.cover.height ?? 750"
                decoding="async"
                class="w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                :class="{
                  'aspect-[16/10]':
                    !featured.cover.width || !featured.cover.height,
                }"
                :style="
                  featured.cover.width && featured.cover.height
                    ? {
                        aspectRatio: `${featured.cover.width} / ${featured.cover.height}`,
                      }
                    : undefined
                "
              />
              <span
                class="absolute left-4 top-4 border border-line bg-page/85 px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-soft"
                >{{ copy.blogPage.featured }}</span
              >
            </a>
            <div class="dot-corner flex min-w-0 flex-col p-6 md:p-8">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p
                  class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
                >
                  {{ formatArticleDate(featured.publishedAt, locale) }} ·
                  {{ articleReadTime(featuredTranslation) }}
                  {{ copy.blogPage.minLabel }}
                </p>
                <p
                  class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
                >
                  <span :lang="featuredTranslation.lang">{{
                    featuredTranslation.category
                  }}</span
                  ><span
                    class="inline-flex flex-wrap gap-1"
                    :aria-label="
                      locale === 'es'
                        ? 'Idiomas disponibles'
                        : 'Available languages'
                    "
                    ><span
                      v-for="language in availableArticleLanguages(featured)"
                      :key="language"
                      class="border border-line px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
                      >{{ language.toUpperCase() }}</span
                    ></span
                  >
                </p>
              </div>
              <h2
                class="mt-5 font-display text-[24px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink md:text-[28px]"
              >
                <a
                  :href="url(featured.slug, featuredTranslation.lang)"
                  :lang="featuredTranslation.lang"
                  class="transition hover:text-soft"
                  >{{ featuredTranslation.title }}</a
                >
              </h2>
              <p
                :lang="featuredTranslation.lang"
                class="type-copy-compact mt-4 leading-[1.72] text-muted"
              >
                {{ featuredTranslation.excerpt }}
              </p>
              <a
                :href="url(featured.slug, featuredTranslation.lang)"
                class="group mt-auto inline-flex min-h-11 items-center gap-2 pt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-soft transition hover:text-ink"
                >{{ copy.blogPage.readMore }}
                <UiIcon
                  name="arrow-right"
                  :size="13"
                  class="transition group-hover:translate-x-0.5"
              /></a>
            </div>
          </article>
          <div v-if="rest.length" class="mt-14 border-t border-line">
            <article v-for="{ post, translation } in rest" :key="post.slug">
              <a
                :href="url(post.slug, translation.lang)"
                class="group grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-3 border-b border-line py-8 transition-colors hover:bg-panel/10 md:grid-cols-[190px_minmax(0,1fr)_auto] md:items-baseline md:py-9"
                ><div
                  class="flex flex-wrap items-center gap-x-3 gap-y-1 md:flex-col md:items-start md:gap-y-1.5"
                >
                  <p
                    class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
                  >
                    {{ formatArticleDate(post.publishedAt, locale) }}
                  </p>
                  <p
                    class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
                  >
                    <span :lang="translation.lang">{{
                      translation.category
                    }}</span
                    ><span
                      v-if="post.featured"
                      class="ml-2 border border-soft/40 px-1.5 py-0.5 text-[10px] text-soft"
                      >{{ copy.blogPage.highlighted }}</span
                    ><span
                      class="ml-2 inline-flex flex-wrap gap-1"
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
                <div class="min-w-0">
                  <h2
                    class="font-display text-[19px] font-semibold leading-[1.3] tracking-[-0.02em] text-ink transition group-hover:text-soft md:text-[22px]"
                  >
                    <span :lang="translation.lang">{{
                      translation.title
                    }}</span>
                  </h2>
                  <p
                    class="type-copy-compact mt-2.5 max-w-[640px] leading-[1.7] text-muted"
                  >
                    <span :lang="translation.lang">{{
                      translation.excerpt
                    }}</span>
                  </p>
                </div>
                <UiIcon
                  name="arrow-right"
                  :size="16"
                  class="hidden text-muted transition group-hover:translate-x-1 group-hover:text-soft md:block"
              /></a>
            </article>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>
