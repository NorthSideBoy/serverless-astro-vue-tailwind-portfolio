import { z } from 'zod'
import { isFileMediaPath, isImageMediaPath, isSafeMediaPath } from '../mediaPaths'

export type Locale = 'es' | 'en'

export const localeSchema = z.enum(['es', 'en'])

export const localizedSchema = z
  .object({
    es: z.string().min(1),
    en: z.string().min(1),
  })
  .strict()

export type Localized = z.infer<typeof localizedSchema>

export const idSchema = z
  .string()
  .min(1)
  .refine((value) => !value.includes('/'), 'Firestore document IDs cannot contain "/"')

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected a lowercase kebab-case slug')

export const blockIdSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected a lowercase kebab-case block ID')

export const orderSchema = z.number().int().nonnegative()

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'Expected a real calendar date')

export const yearMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected YYYY-MM')

export const httpsUrlSchema = z
  .url()
  .refine((value) => value.startsWith('https://'), 'Expected an https URL')

export const imageAssetSchema = z
  .string()
  .refine(isImageMediaPath, 'Expected an R2 image path starting with /images/')
  .refine(isSafeMediaPath, 'Asset paths cannot traverse directories or contain empty segments')

export const fileAssetSchema = z
  .string()
  .refine(isFileMediaPath, 'Expected an R2 file path starting with /files/')
  .refine(isSafeMediaPath, 'Asset paths cannot traverse directories or contain empty segments')
