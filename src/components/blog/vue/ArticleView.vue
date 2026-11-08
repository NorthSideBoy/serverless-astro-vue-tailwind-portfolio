<script setup lang="ts">
import { computed } from 'vue'
import { content, type Locale } from '@/data/content'
import type { Article } from '@/data/schemas/article'
import {
  articleCoverAlt,
  articleCoverSrc,
  articleReadTime,
  availableArticleLanguages,
  buildArticleIndex,
  findAdjacentArticles,
  formatArticleDate,
  resolveArticleTranslation,
} from '@/data/articleUtils'
import ArticleBlock from './ArticleBlock.vue'
import ArticleToc from './ArticleToc.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = defineProps<{
  locale: Locale
  article: Article
  items: Article[]
}>()
const copy = computed(() => content[props.locale])
const translation = computed(() =>
  resolveArticleTranslation(props.article, props.locale),
)
const index = computed(() => buildArticleIndex(translation.value))
const footnotes = computed(() =>
  Object.fromEntries(index.value.footnoteNumbers),
)
const neighbors = computed(() =>
  findAdjacentArticles(props.items, props.article.slug),
)
const blog = computed(() => (props.locale === 'en' ? '/en/blog/' : '/blog/'))
const articleUrl = (slug: string) => `${blog.value}${slug}`
const coverAlt = computed(() =>
  articleCoverAlt(props.article.cover, translation.value.lang),
)
const coverStyle = computed(() =>
  props.article.cover.width && props.article.cover.height
    ? {
        aspectRatio: `${props.article.cover.width}/${props.article.cover.height}`,
      }
    : undefined,
)
const coverClass = computed(() =>
  props.article.cover.width && props.article.cover.height
    ? ''
    : 'aspect-[16/10]',
)
</script>

<template>
  <main id="main">
    <section class="border-b border-line bg-page">
      <div class="shell py-12 md:py-16 xl:py-20">
        <a
          :href="blog"
          class="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition hover:text-soft"
          ><UiIcon name="arrow-left" :size="14" />
          {{ copy.articlePage.back }}</a
        >
        <div class="mt-8 max-w-[860px]">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p :lang="translation.lang" class="mono-label text-muted">
              {{ translation.category }}
            </p>
            <span
              v-if="article.featured"
              class="border border-soft/40 bg-soft/[0.04] px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-soft"
              >{{ copy.blogPage.highlighted }}</span
            ><span
              class="inline-flex flex-wrap gap-1"
              :aria-label="
                locale === 'es' ? 'Idiomas disponibles' : 'Available languages'
              "
              ><span
                v-for="language in availableArticleLanguages(article)"
                :key="language"
                class="border border-line px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
                >{{ language.toUpperCase() }}</span
              ></span
            >
          </div>
          <h1
            :lang="translation.lang"
            class="mt-5 font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-ink md:text-[46px] xl:text-[54px]"
          >
            {{ translation.title }}
          </h1>
          <p
            :lang="translation.lang"
            class="mt-5 max-w-[720px] text-[15px] leading-[1.7] text-muted md:text-[17px]"
          >
            {{ translation.excerpt }}
          </p>
          <dl
            class="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-4"
            :aria-label="copy.articlePage.metaLabel"
          >
            <div class="relative flex flex-col justify-center pl-[42px]">
              <dt
                class="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted"
              >
                <span
                  class="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-line font-display text-[11px] font-bold tracking-[-0.02em] text-soft"
                  aria-hidden="true"
                  >{{ article.author.initials }}</span
                >{{ copy.articlePage.authorLabel }}
              </dt>
              <dd class="text-[13px] font-semibold text-ink">
                {{ article.author.name }}
              </dd>
            </div>
            <div>
              <dt
                class="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted"
              >
                {{ copy.articlePage.published }}
              </dt>
              <dd
                class="font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink"
              >
                {{ formatArticleDate(article.publishedAt, locale) }}
              </dd>
            </div>
            <div>
              <dt
                class="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted"
              >
                {{ copy.articlePage.updated }}
              </dt>
              <dd
                class="font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink"
              >
                {{ formatArticleDate(article.updatedAt, locale) }}
              </dd>
            </div>
            <div>
              <dt
                class="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted"
              >
                {{ copy.articlePage.readTime }}
              </dt>
              <dd
                class="font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink"
              >
                {{ articleReadTime(translation) }}
                {{ copy.articlePage.readTimeUnit }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
    <section class="section-pad bg-section">
      <div class="shell">
        <div
          class="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-12 xl:grid-cols-[minmax(0,1fr)_210px] xl:gap-16"
        >
          <article
            class="min-w-0 w-full max-w-[860px] justify-self-center xl:justify-self-start"
          >
            <figure class="overflow-hidden border border-line bg-sunken">
              <img
                :src="articleCoverSrc(article.cover, 'dark')"
                :alt="coverAlt"
                :lang="translation.lang"
                :width="article.cover.width ?? 1200"
                :height="article.cover.height ?? 750"
                :style="coverStyle"
                decoding="async"
                class="theme-media-dark w-full object-cover"
                :class="coverClass"
              /><img
                :src="articleCoverSrc(article.cover, 'light')"
                :alt="coverAlt"
                :lang="translation.lang"
                :width="article.cover.width ?? 1200"
                :height="article.cover.height ?? 750"
                :style="coverStyle"
                decoding="async"
                class="theme-media-light w-full object-cover"
                :class="coverClass"
              />
            </figure>
            <ArticleToc
              v-if="index.toc.length"
              :items="index.toc"
              :label="copy.articlePage.toc"
              :lang="translation.lang"
              variant="inline"
            />
            <div class="article-body mt-10 max-w-full" :lang="translation.lang">
              <ArticleBlock
                v-for="(block, blockIndex) in translation.blocks"
                :key="block.id ?? blockIndex"
                :block="block"
                :block-index="blockIndex"
                :locale="locale"
                :footnotes="footnotes"
              />
            </div>
            <div class="mt-14 border border-line bg-panel/15 p-6 md:p-7">
              <p class="mono-label text-muted">
                {{ copy.articlePage.authorLabel }}
              </p>
              <div
                class="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div class="min-w-0">
                  <p
                    class="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink"
                  >
                    {{ article.author.name }}
                  </p>
                  <p
                    class="mt-2 max-w-[440px] text-[13.5px] leading-[1.7] text-muted"
                  >
                    {{ article.author.note[locale] }}
                  </p>
                </div>
                <a
                  v-if="article.author.cta"
                  :href="article.author.cta.href"
                  class="inline-flex min-h-11 shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-soft transition hover:text-ink"
                  >{{ article.author.cta.label[locale] }}
                  <UiIcon name="arrow-right" :size="13"
                /></a>
              </div>
            </div>
            <nav
              class="mt-6 grid gap-4 sm:grid-cols-2"
              :aria-label="copy.articlePage.navLabel"
            >
              <a
                v-if="neighbors.prev"
                :href="articleUrl(neighbors.prev.slug)"
                class="group border border-line p-5 transition-colors hover:border-line-strong"
                ><p
                  class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
                >
                  ← {{ copy.articlePage.prev }}
                </p>
                <p
                  class="mt-2.5 font-display text-[15px] font-semibold leading-[1.4] tracking-[-0.01em] text-ink transition group-hover:text-soft"
                >
                  <span
                    :lang="
                      resolveArticleTranslation(neighbors.prev, locale).lang
                    "
                    >{{
                      resolveArticleTranslation(neighbors.prev, locale).title
                    }}</span
                  >
                </p></a
              ><span v-else aria-hidden="true" /><a
                v-if="neighbors.next"
                :href="articleUrl(neighbors.next.slug)"
                class="group border border-line p-5 text-right transition-colors hover:border-line-strong"
                ><p
                  class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
                >
                  {{ copy.articlePage.next }} →
                </p>
                <p
                  class="mt-2.5 font-display text-[15px] font-semibold leading-[1.4] tracking-[-0.01em] text-ink transition group-hover:text-soft"
                >
                  <span
                    :lang="
                      resolveArticleTranslation(neighbors.next, locale).lang
                    "
                    >{{
                      resolveArticleTranslation(neighbors.next, locale).title
                    }}</span
                  >
                </p></a
              ><span v-else aria-hidden="true" />
            </nav>
          </article>
          <aside v-if="index.toc.length" class="hidden xl:block">
            <ArticleToc
              :items="index.toc"
              :label="copy.articlePage.toc"
              :lang="translation.lang"
              variant="aside"
            />
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>
