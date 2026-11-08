<script setup lang="ts">
import { computed } from 'vue'
import { content, type Locale } from '@/data/content'
import type { ArticleBlock } from '@/data/schemas/article'
import { resolveBlockId } from '@/data/articleUtils'
import { embedSrc } from '@/components/blog/lib/embeds'
import { isExternalArticleLink } from '@/components/blog/lib/link'
import ArticleImage from './ArticleImage.vue'
import ArticleInline from './ArticleInline.vue'
import CodeBlock from '@/components/ui/vue/CodeBlock.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = defineProps<{
  block: ArticleBlock
  blockIndex: number
  locale: Locale
  footnotes: Record<string, number>
}>()
const copy = computed(() => content[props.locale])
const blockId = computed(() => resolveBlockId(props.block, props.blockIndex))
const embed = computed(() =>
  props.block.type === 'embed'
    ? embedSrc(props.block.provider, props.block.url, 'dark')
    : null,
)
const frameStyle = (width?: number, height?: number) =>
  width && height ? { aspectRatio: `${width}/${height}` } : undefined
const imageClass = (
  fit?: 'cover' | 'contain',
  width?: number,
  height?: number,
) => [
  'w-full',
  width && height ? 'h-full' : 'h-auto',
  fit === 'cover' ? 'object-cover' : 'object-contain',
]
const alignClass = (align?: 'left' | 'center' | 'right') =>
  align === 'center'
    ? 'text-center'
    : align === 'right'
      ? 'text-right'
      : 'text-left'
const footnote = (id: string) => props.footnotes[id] ?? 0
</script>

<template>
  <template v-if="block.type === 'heading'">
    <h2
      v-if="block.level === 2"
      :id="blockId"
      class="mt-12 mb-4 max-w-[72ch] scroll-mt-28 font-display text-[23px] font-bold leading-[1.2] tracking-[-0.025em] text-ink md:mt-14 md:text-[27px]"
    >
      <ArticleInline
        :nodes="block.segments"
        :locale="locale"
        :footnotes="footnotes"
      />
    </h2>
    <h3
      v-else-if="block.level === 3"
      :id="blockId"
      class="mt-9 mb-3 max-w-[72ch] scroll-mt-28 font-display text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-ink md:text-[20px]"
    >
      <ArticleInline
        :nodes="block.segments"
        :locale="locale"
        :footnotes="footnotes"
      />
    </h3>
    <h4
      v-else
      :id="blockId"
      class="mt-7 mb-2 max-w-[72ch] scroll-mt-28 font-display text-[16px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink md:text-[17px]"
    >
      <ArticleInline
        :nodes="block.segments"
        :locale="locale"
        :footnotes="footnotes"
      />
    </h4>
  </template>
  <p
    v-else-if="block.type === 'paragraph'"
    class="mt-5 max-w-[72ch] text-[15.5px] leading-[1.8] text-ink/85 md:text-[16.5px]"
  >
    <ArticleInline
      :nodes="block.segments"
      :locale="locale"
      :footnotes="footnotes"
    />
  </p>
  <blockquote
    v-else-if="block.type === 'quote'"
    class="mt-9 max-w-[72ch] border-l-2 border-soft/70 pl-5 md:pl-6"
  >
    <p
      class="font-serif text-[19px] italic leading-[1.55] text-ink md:text-[21px]"
    >
      <ArticleInline
        :nodes="block.segments"
        :locale="locale"
        :footnotes="footnotes"
      />
    </p>
    <cite
      v-if="block.cite"
      class="mt-3 block font-mono text-[10px] uppercase not-italic tracking-[0.08em] text-muted"
      ><a
        v-if="block.cite.href"
        :href="block.cite.href"
        :target="isExternalArticleLink(block.cite.href) ? '_blank' : undefined"
        :rel="
          isExternalArticleLink(block.cite.href)
            ? 'noopener noreferrer'
            : undefined
        "
        class="transition hover:text-soft"
        >{{ block.cite.text }}</a
      ><template v-else>{{ block.cite.text }}</template></cite
    >
  </blockquote>
  <template v-else-if="block.type === 'list'">
    <ol
      v-if="block.ordered"
      :start="block.start"
      class="mt-6 max-w-[72ch] space-y-3"
    >
      <li v-for="(item, index) in block.items" :key="index" class="flex gap-4">
        <span
          class="mt-[2px] shrink-0 font-mono text-[11px] font-medium tracking-[0.08em] text-soft"
          aria-hidden="true"
          >{{ String((block.start ?? 1) + index).padStart(2, '0') }}</span
        >
        <div class="min-w-0">
          <p class="text-[15px] leading-[1.75] text-ink/85 md:text-[16px]">
            <ArticleInline
              :nodes="item.segments"
              :locale="locale"
              :footnotes="footnotes"
            />
          </p>
          <ul v-if="item.children?.length" class="mt-2 space-y-2">
            <li
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
              class="flex gap-3.5"
            >
              <span
                class="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-soft"
                aria-hidden="true"
              />
              <p class="text-[15px] leading-[1.75] text-ink/85">
                <ArticleInline
                  :nodes="child.segments"
                  :locale="locale"
                  :footnotes="footnotes"
                />
              </p>
            </li>
          </ul>
        </div>
      </li>
    </ol>
    <ul v-else class="mt-6 max-w-[72ch] space-y-3">
      <li
        v-for="(item, index) in block.items"
        :key="index"
        class="flex gap-3.5"
      >
        <span
          class="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-soft"
          aria-hidden="true"
        />
        <div class="min-w-0">
          <p class="text-[15px] leading-[1.75] text-ink/85 md:text-[16px]">
            <ArticleInline
              :nodes="item.segments"
              :locale="locale"
              :footnotes="footnotes"
            />
          </p>
          <ul v-if="item.children?.length" class="mt-2 space-y-2">
            <li
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
              class="flex gap-3.5"
            >
              <span
                class="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-soft"
                aria-hidden="true"
              />
              <p class="text-[15px] leading-[1.75] text-ink/85">
                <ArticleInline
                  :nodes="child.segments"
                  :locale="locale"
                  :footnotes="footnotes"
                />
              </p>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </template>
  <CodeBlock
    v-else-if="block.type === 'code'"
    class="mt-8 max-w-full"
    :code="block.code"
    :label="block.label"
    :lang="block.lang"
    :filename="block.filename"
  />
  <figure
    v-else-if="block.type === 'image'"
    class="mt-9"
    :class="block.display === 'wide' ? 'w-full' : 'max-w-[72ch]'"
  >
    <div
      class="overflow-hidden border border-line bg-sunken"
      :style="frameStyle(block.width, block.height)"
    >
      <a
        v-if="block.href"
        :href="block.href"
        :target="isExternalArticleLink(block.href) ? '_blank' : undefined"
        :rel="
          isExternalArticleLink(block.href) ? 'noopener noreferrer' : undefined
        "
        class="block"
      >
        <ArticleImage
          :src="block.src"
          :dark-src="block.darkSrc"
          :alt="block.alt"
          :width="block.width"
          :height="block.height"
          :fit="block.fit"
          :img-class="imageClass(block.fit, block.width, block.height).join(' ')"
        />
      </a>
      <ArticleImage
        v-else
        :src="block.src"
        :dark-src="block.darkSrc"
        :alt="block.alt"
        :width="block.width"
        :height="block.height"
        :fit="block.fit"
        :img-class="imageClass(block.fit, block.width, block.height).join(' ')"
      />
    </div>
    <figcaption
      v-if="block.caption || block.credit"
      class="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-muted"
    >
      {{ block.caption
      }}<span v-if="block.credit" class="ml-2 text-muted/75">{{
        block.credit
      }}</span>
    </figcaption>
  </figure>
  <div
    v-else-if="block.type === 'gallery'"
    class="article-gallery mt-9 max-w-full"
    role="group"
    :aria-label="copy.articlePage.galleryLabel"
  >
    <div
      class="grid gap-4"
      :class="
        block.columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'
      "
    >
      <figure v-for="(item, index) in block.items" :key="index" class="mt-0">
        <div
          class="overflow-hidden border border-line bg-sunken"
          :style="frameStyle(item.width, item.height)"
        >
          <ArticleImage
            :src="item.src"
            :dark-src="item.darkSrc"
            :alt="item.alt"
            :width="item.width"
            :height="item.height"
            img-class="h-full w-full object-contain"
          />
        </div>
        <figcaption
          v-if="item.caption"
          class="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-muted"
        >
          {{ item.caption }}
        </figcaption>
      </figure>
    </div>
    <p
      v-if="block.caption"
      class="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-muted"
    >
      {{ block.caption }}
    </p>
  </div>
  <aside
    v-else-if="block.type === 'callout'"
    class="mt-9 max-w-[72ch] border p-5 md:p-6"
    :class="
      block.tone === 'tip'
        ? 'border-soft/40 bg-soft/[0.04]'
        : block.tone === 'warning'
          ? 'border-soft/60 bg-soft/[0.06]'
          : block.tone === 'important'
            ? 'border-soft/70 bg-soft/[0.08]'
            : 'border-line bg-panel/25'
    "
  >
    <p class="mono-label text-soft">
      {{ copy.articlePage.calloutTones[block.tone ?? 'note'] }}
    </p>
    <p
      v-if="block.title"
      class="mt-2 font-display text-[17px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink"
    >
      {{ block.title }}
    </p>
    <p class="mt-3 text-[14.5px] leading-[1.75] text-ink/85 md:text-[15.5px]">
      <ArticleInline
        :nodes="block.segments"
        :locale="locale"
        :footnotes="footnotes"
      />
    </p>
  </aside>
  <hr v-else-if="block.type === 'divider'" class="my-10 border-line" />
  <figure v-else-if="block.type === 'table'" class="mt-9 max-w-full">
    <div
      class="overflow-x-auto border border-line bg-panel/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft"
      tabindex="0"
      role="region"
      :aria-label="block.caption ?? copy.articlePage.tableLabel"
    >
      <table
        class="w-full min-w-[560px] border-collapse text-left text-[14px] leading-[1.65]"
      >
        <caption
          v-if="block.caption"
          class="border-b border-line px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
        >
          {{
            block.caption
          }}
        </caption>
        <thead v-if="block.head" class="bg-panel/30">
          <tr class="border-b border-line">
            <th
              v-for="(cell, index) in block.head.cells"
              :key="index"
              scope="col"
              class="px-4 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-soft"
              :class="alignClass(cell.align)"
            >
              <ArticleInline
                :nodes="cell.segments"
                :locale="locale"
                :footnotes="footnotes"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in block.rows"
            :key="rowIndex"
            class="border-b border-line/70 last:border-b-0"
          >
            <td
              v-for="(cell, cellIndex) in row.cells"
              :key="cellIndex"
              class="px-4 py-3 align-top text-ink/85"
              :class="alignClass(cell.align)"
            >
              <ArticleInline
                :nodes="cell.segments"
                :locale="locale"
                :footnotes="footnotes"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
  <figure v-else-if="block.type === 'embed'" class="mt-9 max-w-full">
    <div
      class="overflow-hidden border border-line bg-sunken"
      :class="
        block.aspect === '4/3'
          ? 'aspect-[4/3]'
          : block.aspect === '1/1'
            ? 'aspect-square'
            : 'aspect-video'
      "
    >
      <iframe
        v-if="embed"
        :src="embed"
        :title="block.title"
        :sandbox="
          block.provider === 'codepen' || block.provider === 'codesandbox'
            ? 'allow-scripts allow-same-origin allow-popups allow-forms'
            : undefined
        "
        loading="lazy"
        allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
          web-share;
        "
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
        class="h-full w-full border-0"
      />
      <div v-else class="flex h-full items-center justify-center p-6">
        <a
          :href="block.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${copy.articlePage.embedFallback}: ${block.title}`"
          class="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-soft transition hover:text-ink"
          >{{ copy.articlePage.embedFallback }}</a
        >
      </div>
    </div>
    <figcaption
      v-if="block.caption"
      class="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-muted"
    >
      {{ block.caption }}
    </figcaption>
  </figure>
  <a
    v-else-if="block.type === 'file'"
    :href="block.src"
    :download="block.download ? '' : undefined"
    class="mt-8 flex max-w-[72ch] items-center gap-4 border border-line bg-panel/15 p-4 transition hover:border-line-strong"
    ><span
      class="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-soft"
      aria-hidden="true"
      ><UiIcon name="download" :size="15" /></span
    ><span class="min-w-0"
      ><span class="block text-[14px] font-semibold text-ink">{{
        block.label
      }}</span
      ><span
        v-if="block.meta"
        class="mt-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
        >{{ block.meta }}</span
      ></span
    ><UiIcon name="arrow-right" :size="14" class="ml-auto shrink-0 text-muted"
  /></a>
  <section
    v-else-if="block.type === 'footnotes'"
    class="mt-12 max-w-[72ch] border-t border-line pt-6"
    :aria-label="copy.articlePage.footnotesTitle"
  >
    <h2 class="mono-label text-muted">{{ copy.articlePage.footnotesTitle }}</h2>
    <ol class="mt-4 space-y-4">
      <li
        v-for="item in [...block.items].sort(
          (a, b) => footnote(a.id) - footnote(b.id),
        )"
        :id="`fn-${item.id}`"
        :key="item.id"
        class="flex gap-3 text-[13.5px] leading-[1.7] text-ink/80"
      >
        <span
          class="shrink-0 font-mono text-[11px] font-medium tracking-[0.08em] text-soft"
          >{{ footnote(item.id) }}</span
        >
        <div class="min-w-0">
          <p>
            <ArticleInline
              :nodes="item.segments"
              :locale="locale"
              :footnotes="footnotes"
            />
          </p>
          <a
            :href="`#fnref-${item.id}`"
            class="mt-1 inline-flex min-h-8 items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted transition hover:text-soft"
            ><UiIcon name="arrow-up" :size="11" /><span class="sr-only">{{
              copy.articlePage.backToReference
            }}</span></a
          >
        </div>
      </li>
    </ol>
  </section>
</template>
