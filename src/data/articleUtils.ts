import type {
  Article,
  ArticleBlock,
  ArticleCover,
  ArticleLang,
  ArticleListItem,
  ArticleTranslation,
  InlineNode,
} from './schemas/article'

export type {
  Article,
  ArticleBlock,
  ArticleCover,
  ArticleLang,
  ArticleListItem,
  ArticleTranslation,
  ArticleTranslations,
  InlineMark,
  InlineNode,
  InlineTextNode,
} from './schemas/article'

export function availableArticleLanguages(article: Article): ArticleLang[] {
  return (['es', 'en'] as const).filter((lang) => Boolean(article.translations[lang]))
}

export function resolveArticleTranslation(
  article: Article,
  preferred: ArticleLang,
): ArticleTranslation & { lang: ArticleLang } {
  const lang = article.translations[preferred] ? preferred : preferred === 'es' ? 'en' : 'es'
  return { ...article.translations[lang]!, lang }
}

export function localizedValue(
  value: Partial<Record<ArticleLang, string>>,
  lang: ArticleLang,
): string {
  return value[lang] ?? value.es ?? value.en ?? ''
}

export function articleCoverSrc(cover: ArticleCover, theme: 'dark' | 'light'): string {
  return theme === 'dark' ? (cover.darkSrc ?? cover.src) : cover.src
}

export function articleCoverAlt(cover: ArticleCover, lang: ArticleLang): string {
  return localizedValue(cover.alt, lang)
}

const ES_MONTHS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
]
const EN_MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]

export function formatArticleDate(iso: string, locale: 'es' | 'en'): string {
  const date = new Date(`${iso}T12:00:00Z`)
  const months = locale === 'es' ? ES_MONTHS : EN_MONTHS
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export function inlineText(nodes: readonly InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.text
      if (node.type === 'break') return ' '
      if (node.type === 'link') return inlineText(node.children)
      return ''
    })
    .join('')
}

function listText(items: readonly ArticleListItem[]): string {
  return items
    .map((item) => `${inlineText(item.segments)} ${item.children ? listText(item.children) : ''}`)
    .join(' ')
}

function tableText(rows: readonly { cells: { segments: InlineNode[] }[] }[]): string {
  return rows.map((row) => row.cells.map((cell) => inlineText(cell.segments)).join(' ')).join(' ')
}

export function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'callout':
      return inlineText(block.segments)
    case 'quote':
      return `${inlineText(block.segments)} ${block.cite?.text ?? ''}`
    case 'list':
      return listText(block.items)
    case 'code':
      return `${block.label} ${block.filename ?? ''} ${block.code}`
    case 'image':
      return `${block.alt} ${block.caption ?? ''}`
    case 'gallery':
      return [
        block.caption ?? '',
        ...block.items.map((item) => `${item.alt} ${item.caption ?? ''}`),
      ].join(' ')
    case 'divider':
      return ''
    case 'table':
      return `${block.caption ?? ''} ${block.head ? tableText([block.head]) : ''} ${tableText(block.rows)}`
    case 'embed':
      return `${block.title} ${block.caption ?? ''}`
    case 'file':
      return `${block.label} ${block.meta ?? ''}`
    case 'footnotes':
      return block.items.map((item) => inlineText(item.segments)).join(' ')
    default: {
      // Exhaustiveness check: a new block type must add its text extractor.
      const exhaustive: never = block
      void exhaustive
      return ''
    }
  }
}

export function articleReadTime(translation: ArticleTranslation): number {
  const words = translation.blocks.map(blockText).join(' ').split(/\s+/).filter(Boolean).length

  return Math.max(1, Math.round(words / 200))
}

export function resolveBlockId(block: ArticleBlock, blockIndex: number): string {
  return block.id ?? `sec-${blockIndex}`
}

export interface ArticleTocItem {
  id: string
  text: string
  level: 2 | 3 | 4
  blockIndex: number
}

export interface ArticleContentIndex {
  toc: ArticleTocItem[]
  footnoteNumbers: Map<string, number>
}

export function buildArticleIndex(translation: ArticleTranslation): ArticleContentIndex {
  const toc: ArticleTocItem[] = []
  const footnoteNumbers = new Map<string, number>()

  translation.blocks.forEach((block, blockIndex) => {
    if (block.type !== 'heading') return
    const id = resolveBlockId(block, blockIndex)
    toc.push({ id, text: inlineText(block.segments), level: block.level, blockIndex })
  })

  for (const block of translation.blocks) {
    if (block.type === 'footnotes') continue
    forEachFootnoteRef(block, (id) => {
      if (footnoteNumbers.has(id)) return
      footnoteNumbers.set(id, footnoteNumbers.size + 1)
    })
  }

  const footnotesBlock = translation.blocks.find((block) => block.type === 'footnotes')
  if (footnotesBlock) {
    for (const item of footnotesBlock.items) {
      if (footnoteNumbers.has(item.id)) continue
      footnoteNumbers.set(item.id, footnoteNumbers.size + 1)
    }
  }

  return { toc, footnoteNumbers }
}

function forEachFootnoteRef(block: ArticleBlock, visit: (id: string) => void) {
  const walk = (nodes: readonly InlineNode[]) => {
    for (const node of nodes) {
      if (node.type === 'footnoteRef') visit(node.id)
      if (node.type === 'link') walk(node.children)
    }
  }

  const walkItems = (items: readonly ArticleListItem[]) => {
    for (const item of items) {
      walk(item.segments)
      if (item.children) walkItems(item.children)
    }
  }

  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'quote':
    case 'callout':
      walk(block.segments)
      break
    case 'list':
      walkItems(block.items)
      break
    case 'table':
      if (block.head) block.head.cells.forEach((cell) => walk(cell.segments))
      block.rows.forEach((row) => row.cells.forEach((cell) => walk(cell.segments)))
      break
    default:
      break
  }
}

export function sortArticles(source: readonly Article[]): Article[] {
  return [...source]
    .filter((article) => article.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.order - b.order)
}

export function findArticle(source: readonly Article[], slug: string): Article | undefined {
  return source.find((article) => article.slug === slug && article.status === 'published')
}

export function findAdjacentArticles(
  source: readonly Article[],
  slug: string,
): { prev: Article | null; next: Article | null } {
  const sorted = sortArticles(source)
  const index = sorted.findIndex((article) => article.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return { prev: sorted[index + 1] ?? null, next: sorted[index - 1] ?? null }
}
