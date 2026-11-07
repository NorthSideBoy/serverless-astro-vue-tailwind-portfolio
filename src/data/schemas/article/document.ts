import { z } from 'zod'
import { ContentValidationError, validationIssues } from '../errors'
import { isoDateSchema, orderSchema, slugSchema } from '../primitives'
import { articleLangs, type EmbedProvider } from './catalog'
import {
  articleBlockSchema,
  type ArticleBlock,
  type ArticleListItem,
  type TableRow,
} from './blocks'
import type { InlineNode } from './inline'
import { assetSrcSchema, localizedAltSchema } from './media'
import type { Author } from '../author'

export const articleLangSchema = z.enum(articleLangs)

export const articleTranslationSchema = z
  .object({
    title: z.string().min(1).max(200),
    excerpt: z.string().min(1).max(600),
    category: z.string().min(1).max(60),
    blocks: z.array(articleBlockSchema).min(1).max(500),
  })
  .strict()
  .superRefine((translation, context) => {
    validateUniqueBlockIds(translation.blocks, context)
    validateTables(translation.blocks, context)
    validateEmbeds(translation.blocks, context)
    validateFootnotes(translation.blocks, context)
  })

export type ArticleTranslation = z.infer<typeof articleTranslationSchema>

export const articleTranslationsSchema = z
  .object({
    es: articleTranslationSchema.optional(),
    en: articleTranslationSchema.optional(),
  })
  .strict()
  .refine((translations) => Boolean(translations.es || translations.en), {
    message: 'An article needs at least one translation',
  })

export type ArticleTranslations = {
  es?: ArticleTranslation
  en?: ArticleTranslation
}

export const articleCoverSchema = z
  .object({
    src: assetSrcSchema,
    darkSrc: assetSrcSchema.optional(),
    alt: localizedAltSchema,
    width: z.number().int().positive().max(20_000).optional(),
    height: z.number().int().positive().max(20_000).optional(),
  })
  .strict()
  .superRefine((cover, context) => {
    if ((cover.width === undefined) !== (cover.height === undefined)) {
      context.addIssue({
        code: 'custom',
        path: ['width'],
        message: 'Cover width and height must be provided together',
      })
    }
  })

export type ArticleCover = z.infer<typeof articleCoverSchema>

const articleBaseSchema = z
  .object({
    id: slugSchema,
    order: orderSchema,
    updatedAt: isoDateSchema,
    cover: articleCoverSchema,
    authorId: slugSchema,
    featured: z.boolean().optional(),
    translations: articleTranslationsSchema,
  })
  .strict()

export const articleSchema = z
  .discriminatedUnion('status', [
    articleBaseSchema.extend({ status: z.literal('published'), publishedAt: isoDateSchema }),
    articleBaseSchema.extend({ status: z.literal('draft'), publishedAt: isoDateSchema.optional() }),
  ])
  .superRefine((article, context) => {
    if (article.publishedAt && article.updatedAt < article.publishedAt) {
      context.addIssue({
        code: 'custom',
        path: ['updatedAt'],
        message: 'updatedAt must be greater than or equal to publishedAt',
      })
    }
  })

export type ArticleDocument = z.infer<typeof articleSchema>
export type Article = Omit<Extract<ArticleDocument, { status: 'published' }>, 'id'> & {
  slug: string
  author: Author
}

/**
 * Parse a single article document at a repository boundary.
 *
 * The build validates each collection with `parseCollection` so an invalid
 * document fails the build. A runtime adapter (a future panel API) should use
 * this function per document so one broken article does not invalidate the
 * whole collection.
 */
export function parseArticleDocument(document: unknown): ArticleDocument {
  const result = articleSchema.safeParse(document)
  if (!result.success) {
    throw new ContentValidationError('articles', validationIssues(result.error))
  }
  return result.data
}

const reservedHeadingAnchors = new Set([
  'main',
  'top',
  'mobile-menu',
  'home',
  'contact',
  'blog',
  'projects',
  'stack',
  'experience',
  'education',
  'certifications',
  'reviews',
  'services',
  'skills',
  'testimonials',
  'site-header',
  'site-footer',
])

function validateUniqueBlockIds(blocks: readonly ArticleBlock[], context: z.RefinementCtx) {
  const seen = new Map<string, number>()
  const anchors = new Map<string, number>()

  for (const [index, block] of blocks.entries()) {
    if (block.id) {
      const previous = seen.get(block.id)
      if (previous !== undefined) {
        context.addIssue({
          code: 'custom',
          path: ['blocks', index, 'id'],
          message: `Duplicate block id "${block.id}" (first used at block ${previous})`,
        })
      } else {
        seen.set(block.id, index)
      }
    }

    if (block.type === 'heading') {
      const anchor = block.id ?? `sec-${index}`

      if (
        reservedHeadingAnchors.has(anchor) ||
        anchor.startsWith('fn-') ||
        anchor.startsWith('fnref-')
      ) {
        context.addIssue({
          code: 'custom',
          path: ['blocks', index, 'id'],
          message: `Heading anchor "${anchor}" is reserved by the page or footnote navigation`,
        })
      }

      const previousAnchor = anchors.get(anchor)
      if (previousAnchor !== undefined) {
        context.addIssue({
          code: 'custom',
          path: ['blocks', index, 'id'],
          message: `Duplicate heading anchor "${anchor}" (first used at block ${previousAnchor})`,
        })
      } else {
        anchors.set(anchor, index)
      }
    }
  }
}

function validateTables(blocks: readonly ArticleBlock[], context: z.RefinementCtx) {
  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'table') continue
    const expected = block.head?.cells.length ?? block.rows[0]?.cells.length ?? 0
    if (block.head && block.head.cells.length !== expected) {
      context.addIssue({
        code: 'custom',
        path: ['blocks', index, 'head', 'cells'],
        message: 'Table head must have the same number of cells as the body',
      })
    }
    for (const [rowIndex, row] of block.rows.entries()) {
      if (row.cells.length !== expected) {
        context.addIssue({
          code: 'custom',
          path: ['blocks', index, 'rows', rowIndex, 'cells'],
          message: `Table row has ${row.cells.length} cells; expected ${expected}`,
        })
      }
    }
  }
}

function validateEmbeds(blocks: readonly ArticleBlock[], context: z.RefinementCtx) {
  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'embed') continue
    if (!embedHostMatches(block.provider, block.url)) {
      context.addIssue({
        code: 'custom',
        path: ['blocks', index, 'url'],
        message: `URL does not match the ${block.provider} provider`,
      })
    }
  }
}

function embedHostMatches(provider: EmbedProvider, value: string): boolean {
  try {
    const host = new URL(value).hostname.replace(/^www\./, '')
    switch (provider) {
      case 'youtube':
        return (
          host === 'youtube.com' ||
          host === 'm.youtube.com' ||
          host === 'youtu.be' ||
          host === 'youtube-nocookie.com'
        )
      case 'vimeo':
        return host === 'vimeo.com' || host === 'player.vimeo.com'
      case 'codepen':
        return host === 'codepen.io'
      case 'codesandbox':
        return host === 'codesandbox.io'
      default:
        return false
    }
  } catch {
    return false
  }
}

function validateFootnotes(blocks: readonly ArticleBlock[], context: z.RefinementCtx) {
  const footnoteBlocks = blocks
    .map((block, index) => ({ block, index }))
    .filter(
      (entry): entry is { block: Extract<ArticleBlock, { type: 'footnotes' }>; index: number } =>
        entry.block.type === 'footnotes',
    )

  if (footnoteBlocks.length > 1) {
    context.addIssue({
      code: 'custom',
      path: ['blocks'],
      message: 'An article can have at most one footnotes block',
    })
  }

  const footnoteEntry = footnoteBlocks[0]
  if (footnoteEntry && footnoteEntry.index !== blocks.length - 1) {
    context.addIssue({
      code: 'custom',
      path: ['blocks', footnoteEntry.index],
      message: 'The footnotes block must be the last block',
    })
  }

  const noteIds = footnoteEntry
    ? new Set(footnoteEntry.block.items.map((item) => item.id))
    : new Set<string>()
  if (footnoteEntry && noteIds.size !== footnoteEntry.block.items.length) {
    context.addIssue({
      code: 'custom',
      path: ['blocks', footnoteEntry.index, 'items'],
      message: 'Footnote ids must be unique',
    })
  }

  const references = collectFootnoteReferences(blocks)
  const referenceCounts = new Map<string, number>()
  for (const reference of references) {
    referenceCounts.set(reference.id, (referenceCounts.get(reference.id) ?? 0) + 1)
    if (!noteIds.has(reference.id)) {
      context.addIssue({
        code: 'custom',
        path: ['blocks', reference.blockIndex],
        message: `Footnote reference "${reference.id}" has no matching note`,
      })
    }
  }

  for (const [id, count] of referenceCounts) {
    if (count > 1) {
      context.addIssue({
        code: 'custom',
        path: ['blocks'],
        message: `Footnote "${id}" is referenced ${count} times; use one reference per note`,
      })
    }
  }

  if (footnoteEntry) {
    for (const [index, item] of footnoteEntry.block.items.entries()) {
      if ((referenceCounts.get(item.id) ?? 0) === 0) {
        context.addIssue({
          code: 'custom',
          path: ['blocks', footnoteEntry.index, 'items', index, 'id'],
          message: `Footnote "${item.id}" is never referenced`,
        })
      }
      if (containsFootnoteReference(item.segments)) {
        context.addIssue({
          code: 'custom',
          path: ['blocks', footnoteEntry.index, 'items', index, 'segments'],
          message: 'Footnotes cannot reference other footnotes',
        })
      }
    }
  }
}

function containsFootnoteReference(nodes: readonly InlineNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === 'footnoteRef') return true
    if (node.type === 'link') return containsFootnoteReference(node.children)
    return false
  })
}

function collectFootnoteReferences(
  blocks: readonly ArticleBlock[],
): { id: string; blockIndex: number }[] {
  const references: { id: string; blockIndex: number }[] = []
  for (const [blockIndex, block] of blocks.entries()) {
    if (block.type === 'footnotes') continue
    walkBlockInlineNodes(block, (nodes) => {
      for (const node of nodes) {
        if (node.type === 'footnoteRef') references.push({ id: node.id, blockIndex })
      }
    })
  }
  return references
}

function walkBlockInlineNodes(block: ArticleBlock, visit: (nodes: readonly InlineNode[]) => void) {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'quote':
    case 'callout':
      visit(block.segments)
      break
    case 'list':
      walkListItems(block.items, visit)
      break
    case 'table':
      if (block.head) walkTableRow(block.head, visit)
      for (const row of block.rows) walkTableRow(row, visit)
      break
    default:
      break
  }
}

function walkListItems(
  items: readonly ArticleListItem[],
  visit: (nodes: readonly InlineNode[]) => void,
) {
  for (const item of items) {
    visit(item.segments)
    if (item.children) walkListItems(item.children, visit)
  }
}

function walkTableRow(row: TableRow, visit: (nodes: readonly InlineNode[]) => void) {
  for (const cell of row.cells) visit(cell.segments)
}
