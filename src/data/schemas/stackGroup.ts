import { z } from 'zod'
import { localizedSchema, orderSchema, slugSchema } from './primitives'

export const stackGroupSchema = z
  .object({
    id: slugSchema,
    order: orderSchema,
    name: localizedSchema,
    description: localizedSchema,
  })
  .strict()

export type StackGroup = z.infer<typeof stackGroupSchema>
