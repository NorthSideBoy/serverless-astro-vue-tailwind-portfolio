import { z } from 'zod'
import type { Locale } from './primitives'

export const sectionIds = [
  'stack',
  'experience',
  'projects',
  'education',
  'certifications',
  'blog',
  'reviews',
] as const

export type SectionId = (typeof sectionIds)[number]

export const sectionIdSchema = z.enum(sectionIds)

export const sectionTextSchema = z
  .object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    lead: z.string().min(1),
    note: z.string().min(1).optional(),
    moreEyebrow: z.string().min(1).optional(),
    moreTitle: z.string().min(1).optional(),
    moreLead: z.string().min(1).optional(),
    index: z
      .object({
        title: z.string().min(1),
        lead: z.string().min(1),
        meta: z
          .object({
            title: z.string().min(1),
            description: z.string().min(1),
          })
          .strict(),
      })
      .strict()
      .optional(),
  })
  .strict()

export type SectionText = z.infer<typeof sectionTextSchema>

export const siteSectionSchema = z
  .object({
    id: sectionIdSchema,
    copy: z
      .object({
        es: sectionTextSchema,
        en: sectionTextSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((section, context) => {
    for (const locale of ['es', 'en'] as const) {
      const copy = section.copy[locale]
      if (section.id === 'stack' && !copy.note) {
        context.addIssue({
          code: 'custom',
          path: ['copy', locale, 'note'],
          message: 'Stack requires a note',
        })
      }
      if (section.id === 'projects' && (!copy.moreEyebrow || !copy.moreTitle || !copy.moreLead)) {
        context.addIssue({
          code: 'custom',
          path: ['copy', locale],
          message: 'Projects require more-section copy',
        })
      }
      if ((section.id === 'projects' || section.id === 'blog') && !copy.index) {
        context.addIssue({
          code: 'custom',
          path: ['copy', locale, 'index'],
          message: 'Index page requires title, lead and metadata',
        })
      }
    }
  })

export type SiteSectionDocument = z.infer<typeof siteSectionSchema>

export type SiteSections = Record<SectionId, Record<Locale, SectionText>>
