import { z } from 'zod'
import { localizedSchema, slugSchema } from './primitives'

export const authorSchema = z
  .object({
    id: slugSchema,
    name: z.string().min(1),
    initials: z.string().min(1),
    note: localizedSchema,
    cta: z
      .object({
        href: z
          .string()
          .startsWith('/')
          .refine((value) => !value.startsWith('//'), 'Expected a local route'),
        label: localizedSchema,
      })
      .strict()
      .optional(),
  })
  .strict()

export type Author = z.infer<typeof authorSchema>
