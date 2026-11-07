import { z } from 'zod'
import { localizedSchema, orderSchema, slugSchema, yearMonthSchema } from './primitives'
import { technologyReferenceSchema } from './technology'

const localizedBulletsSchema = z
  .object({
    es: z.array(z.string().min(1)).min(1),
    en: z.array(z.string().min(1)).min(1),
  })
  .strict()

export const experienceSchema = z
  .object({
    id: slugSchema,
    order: orderSchema,
    org: z.string().min(1),
    role: z.string().min(1),
    highlight: z.boolean().optional(),
    location: localizedSchema,
    summary: localizedSchema,
    bullets: localizedBulletsSchema,
    tech: z.array(technologyReferenceSchema).min(1).max(50),
    startMonth: yearMonthSchema,
    endMonth: yearMonthSchema.nullable(),
  })
  .strict()
  .superRefine((entry, context) => {
    if (new Set(entry.tech.map((technology) => technology.id)).size !== entry.tech.length) {
      context.addIssue({
        code: 'custom',
        path: ['tech'],
        message: 'Technology references cannot contain duplicates',
      })
    }

    if (entry.endMonth && entry.endMonth < entry.startMonth) {
      context.addIssue({
        code: 'custom',
        path: ['endMonth'],
        message: 'endMonth must be greater than or equal to startMonth',
      })
    }
  })

export type ExperienceDocument = z.infer<typeof experienceSchema>
export type ExperienceEntry = Omit<ExperienceDocument, 'tech'> & {
  tech: string[]
  period: { es: string; en: string }
}
