import type { ArticleBlock } from './blocks'

/**
 * Closed vocabularies for the article contract.
 *
 * This module is intentionally free of Vue and presentation copy so
 * the article contract can be extracted into a shared package when the authoring
 * panel gets its own application.
 */

export const articleLangs = ['es', 'en'] as const
export type ArticleLang = (typeof articleLangs)[number]

export const inlineMarks = ['strong', 'em', 'underline', 'strike', 'code'] as const
export type InlineMark = (typeof inlineMarks)[number]

export const headingLevels = [2, 3, 4] as const
export type HeadingLevel = (typeof headingLevels)[number]

export const calloutTones = ['note', 'tip', 'warning', 'important'] as const
export type CalloutTone = (typeof calloutTones)[number]

export const embedProviders = ['youtube', 'vimeo', 'codepen', 'codesandbox'] as const
export type EmbedProvider = (typeof embedProviders)[number]

export const embedAspects = ['16/9', '4/3', '1/1'] as const
export type EmbedAspect = (typeof embedAspects)[number]

export const imageFits = ['cover', 'contain'] as const
export type ImageFit = (typeof imageFits)[number]

export const imageDisplays = ['column', 'wide'] as const
export type ImageDisplay = (typeof imageDisplays)[number]

export const galleryColumns = [2, 3] as const
export type GalleryColumns = (typeof galleryColumns)[number]

export const tableAligns = ['left', 'center', 'right'] as const
export type TableAlign = (typeof tableAligns)[number]

export const articleBlockTypes = [
  'heading',
  'paragraph',
  'quote',
  'list',
  'code',
  'image',
  'gallery',
  'callout',
  'divider',
  'table',
  'embed',
  'file',
  'footnotes',
] as const

export type ArticleBlockType = (typeof articleBlockTypes)[number]

// Compile-time parity check: adding a block to the schema without adding it to
// the catalog (or the other way around) makes this assignment fail.
type CatalogBlockType = (typeof articleBlockTypes)[number]
type CatalogMatchesSchema =
  Exclude<ArticleBlock['type'], CatalogBlockType> extends never
    ? Exclude<CatalogBlockType, ArticleBlock['type']> extends never
      ? true
      : false
    : false

export const articleBlockCatalogMatchesSchema: CatalogMatchesSchema = true
