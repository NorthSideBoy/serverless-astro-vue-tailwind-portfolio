import { z } from 'zod'
import { fileAssetSchema, imageAssetSchema } from '../primitives'
import { galleryColumns, imageDisplays, imageFits } from './catalog'
import { linkHrefSchema } from './inline'

/**
 * The only place that decides how article media is addressed.
 *
 * Firestore stores R2 object paths (`/images/...` and `/files/...`). The build
 * prefixes `PUBLIC_MEDIA_URL`; dynamic media is never copied into `public/`.
 */
export const assetSrcSchema = imageAssetSchema
export const fileAssetSrcSchema = fileAssetSchema

export type AssetSrc = z.infer<typeof assetSrcSchema>

/**
 * Cover art belongs to the article, not to a translation, so its alt text is
 * localized. Body images live inside a translation and use a plain string.
 */
export const localizedAltSchema = z
  .object({
    es: z.string().min(1).max(500).optional(),
    en: z.string().min(1).max(500).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.es || value.en), {
    message: 'Cover alt text needs at least one language',
  })

export type LocalizedAlt = z.infer<typeof localizedAltSchema>

export const articleImageSchema = z
  .object({
    src: assetSrcSchema,
    darkSrc: assetSrcSchema.optional(),
    alt: z.string().min(1).max(500),
    caption: z.string().min(1).max(500).optional(),
    credit: z.string().min(1).max(300).optional(),
    href: linkHrefSchema.optional(),
    width: z.number().int().positive().max(20_000).optional(),
    height: z.number().int().positive().max(20_000).optional(),
    fit: z.enum(imageFits).optional(),
    display: z.enum(imageDisplays).optional(),
  })
  .strict()

export type ArticleImage = z.infer<typeof articleImageSchema>

export const galleryItemSchema = z
  .object({
    src: assetSrcSchema,
    darkSrc: assetSrcSchema.optional(),
    alt: z.string().min(1).max(500),
    caption: z.string().min(1).max(500).optional(),
    credit: z.string().min(1).max(300).optional(),
    width: z.number().int().positive().max(20_000).optional(),
    height: z.number().int().positive().max(20_000).optional(),
  })
  .strict()

export type GalleryItem = z.infer<typeof galleryItemSchema>

export const galleryColumnsSchema = z.union([
  z.literal(galleryColumns[0]),
  z.literal(galleryColumns[1]),
])
