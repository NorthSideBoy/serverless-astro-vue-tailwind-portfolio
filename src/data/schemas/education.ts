import { z } from 'zod'
import { httpsUrlSchema, localizedSchema, orderSchema, slugSchema } from './primitives'

export const educationSchema = z
  .object({
    id: slugSchema,
    order: orderSchema,
    title: localizedSchema,
    institution: z.string().min(1),
    institutionHref: httpsUrlSchema.optional(),
    location: localizedSchema,
    description: localizedSchema,
    startYear: z.number().int().min(1900),
    endYear: z.number().int().min(1900).nullable(),
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.endYear !== null && entry.endYear < entry.startYear) {
      context.addIssue({
        code: 'custom',
        path: ['endYear'],
        message: 'endYear must be greater than or equal to startYear',
      })
    }
  })

export type EducationDocument = z.infer<typeof educationSchema>
export type EducationEntry = EducationDocument & { period: { es: string; en: string } }
