import { z } from 'zod'
import { blockIdSchema, httpsUrlSchema } from '../primitives'
import { calloutTones, embedAspects, embedProviders, headingLevels, tableAligns } from './catalog'
import { inlineNodeSchema, inlineTextRunSchema, linkHrefSchema, type InlineNode } from './inline'
import {
  articleImageSchema,
  fileAssetSrcSchema,
  galleryColumnsSchema,
  galleryItemSchema,
} from './media'

export interface ArticleListItem {
  segments: InlineNode[]
  children?: ArticleListItem[]
}

export const articleListItemSchema: z.ZodType<ArticleListItem> = z.lazy(() =>
  z
    .object({
      segments: z.array(inlineNodeSchema).min(1).max(100),
      children: z.array(articleListItemSchema).min(1).max(20).optional(),
    })
    .strict(),
)

export const tableCellSchema = z
  .object({
    segments: z.array(inlineNodeSchema).min(1).max(100),
    align: z.enum(tableAligns).optional(),
  })
  .strict()

export type TableCell = z.infer<typeof tableCellSchema>

export const tableRowSchema = z
  .object({
    cells: z.array(tableCellSchema).min(1).max(20),
  })
  .strict()

export type TableRow = z.infer<typeof tableRowSchema>

const paragraphBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('paragraph'),
    segments: z.array(inlineNodeSchema).min(1).max(200),
  })
  .strict()

const headingBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('heading'),
    level: z.union([
      z.literal(headingLevels[0]),
      z.literal(headingLevels[1]),
      z.literal(headingLevels[2]),
    ]),
    segments: inlineTextRunSchema,
  })
  .strict()

const quoteBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('quote'),
    segments: z.array(inlineNodeSchema).min(1).max(200),
    cite: z
      .object({
        text: z.string().min(1).max(300),
        href: linkHrefSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict()

const listBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('list'),
    ordered: z.boolean().optional(),
    start: z.number().int().positive().max(1000).optional(),
    items: z.array(articleListItemSchema).min(1).max(100),
  })
  .strict()

const codeBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('code'),
    lang: z.string().min(1).max(40),
    label: z.string().min(1).max(200),
    filename: z.string().min(1).max(200).optional(),
    code: z.string().min(1).max(100_000),
  })
  .strict()

const imageBlockSchema = articleImageSchema.extend({
  id: blockIdSchema.optional(),
  type: z.literal('image'),
})

const galleryBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('gallery'),
    columns: galleryColumnsSchema.optional(),
    caption: z.string().min(1).max(500).optional(),
    items: z.array(galleryItemSchema).min(2).max(12),
  })
  .strict()

const calloutBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('callout'),
    tone: z.enum(calloutTones).optional(),
    title: z.string().min(1).max(160).optional(),
    segments: z.array(inlineNodeSchema).min(1).max(200),
  })
  .strict()

const dividerBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('divider'),
  })
  .strict()

const tableBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('table'),
    caption: z.string().min(1).max(300).optional(),
    head: tableRowSchema.optional(),
    rows: z.array(tableRowSchema).min(1).max(100),
  })
  .strict()

const embedBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('embed'),
    provider: z.enum(embedProviders),
    url: httpsUrlSchema,
    title: z.string().min(1).max(200),
    caption: z.string().min(1).max(500).optional(),
    aspect: z.enum(embedAspects).optional(),
  })
  .strict()

const fileBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('file'),
    src: fileAssetSrcSchema,
    label: z.string().min(1).max(200),
    meta: z.string().min(1).max(160).optional(),
    download: z.boolean().optional(),
  })
  .strict()

const footnotesBlockSchema = z
  .object({
    id: blockIdSchema.optional(),
    type: z.literal('footnotes'),
    items: z
      .array(
        z
          .object({
            id: blockIdSchema,
            segments: z.array(inlineNodeSchema).min(1).max(200),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict()

export const articleBlockSchema = z.discriminatedUnion('type', [
  headingBlockSchema,
  paragraphBlockSchema,
  quoteBlockSchema,
  listBlockSchema,
  codeBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  calloutBlockSchema,
  dividerBlockSchema,
  tableBlockSchema,
  embedBlockSchema,
  fileBlockSchema,
  footnotesBlockSchema,
])

export type ArticleBlock = z.infer<typeof articleBlockSchema>
export type ArticleHeadingBlock = Extract<ArticleBlock, { type: 'heading' }>
export type ArticleImageBlock = Extract<ArticleBlock, { type: 'image' }>
export type ArticleGalleryBlock = Extract<ArticleBlock, { type: 'gallery' }>
export type ArticleCalloutBlock = Extract<ArticleBlock, { type: 'callout' }>
export type ArticleTableBlock = Extract<ArticleBlock, { type: 'table' }>
export type ArticleEmbedBlock = Extract<ArticleBlock, { type: 'embed' }>
export type ArticleFileBlock = Extract<ArticleBlock, { type: 'file' }>
export type ArticleFootnotesBlock = Extract<ArticleBlock, { type: 'footnotes' }>
export type ArticleListBlock = Extract<ArticleBlock, { type: 'list' }>
export type ArticleQuoteBlock = Extract<ArticleBlock, { type: 'quote' }>
