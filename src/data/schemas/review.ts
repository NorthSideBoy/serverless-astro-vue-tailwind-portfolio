import { z } from 'zod'
import { idSchema, imageAssetSchema, orderSchema, slugSchema } from './primitives'

export const identityProviderSchema = z.enum(['Google', 'Microsoft', 'GitHub'])
export type IdentityProvider = z.infer<typeof identityProviderSchema>

export const reviewAuthorSchema = z
  .object({
    provider: identityProviderSchema,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    photo: imageAssetSchema,
    roles: z.array(z.string().min(1)).min(1).max(20),
  })
  .strict()

export type ReviewAuthor = z.infer<typeof reviewAuthorSchema>

export const reviewSchema = z
  .object({
    id: slugSchema,
    order: orderSchema,
    author: reviewAuthorSchema,
    quote: z.string().min(1),
    experienceIds: z.array(idSchema).max(50),
    projectSlugs: z.array(slugSchema).max(50),
  })
  .strict()

export type Testimonial = z.infer<typeof reviewSchema>
