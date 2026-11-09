import { z } from 'zod'
import {
  httpsUrlSchema,
  idSchema,
  imageAssetSchema,
  localeSchema,
  orderSchema,
  slugSchema,
} from './primitives'

export const identityProviderSchema = z.enum(['Google', 'Microsoft', 'GitHub'])
export type IdentityProvider = z.infer<typeof identityProviderSchema>

/**
 * Firestore stores `createdAt`/`updatedAt` as Timestamps. Fixtures use ISO
 * strings so the build can be exercised without Firestore.
 */
export const reviewTimestampSchema = z.union([
  z.iso.datetime({ offset: true }),
  z.custom<{ toDate: () => Date }>(
    (value) =>
      typeof value === 'object' &&
      value !== null &&
      typeof (value as { toDate?: unknown }).toDate === 'function',
    'Expected a Firestore Timestamp',
  ),
])

export type ReviewTimestamp = z.infer<typeof reviewTimestampSchema>

/** Document IDs are Firebase UIDs for visitors and slugs for editorial rows. */
export const reviewIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(
    /^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/,
    'Expected a Firebase UID or a kebab-case slug',
  )

/** Public, non-identifying anchor used by `#review-...` links. */
export const reviewAnchorIdSchema = slugSchema.max(40)

export const reviewSourceSchema = z.enum(['visitor', 'editorial'])

export const reviewAuthorDocumentSchema = z
  .object({
    provider: identityProviderSchema,
    name: z.string().min(1).max(80),
    /** Private moderation contact. Stripped before public output. */
    email: z.email().max(254),
    /** Editorial R2 asset. Visitor reviews use `photoUrl`. */
    photo: imageAssetSchema.optional(),
    photoUrl: httpsUrlSchema.max(4096).nullable().optional(),
    roles: z.array(z.string().min(2).max(60)).min(1).max(3),
  })
  .strict()

export type ReviewAuthorDocument = z.infer<typeof reviewAuthorDocumentSchema>

export const reviewSchema = z
  .object({
    id: reviewIdSchema,
    anchorId: reviewAnchorIdSchema,
    source: reviewSourceSchema,
    authorUid: idSchema.nullable(),
    approved: z.boolean(),
    order: orderSchema.optional(),
    locale: localeSchema,
    author: reviewAuthorDocumentSchema,
    quote: z.string().min(40).max(400),
    experienceIds: z.array(idSchema).max(3),
    projectSlugs: z.array(slugSchema).max(3),
    createdAt: reviewTimestampSchema,
    updatedAt: reviewTimestampSchema,
  })
  .strict()
  .superRefine((review, context) => {
    if (review.source === 'visitor') {
      if (!review.authorUid) {
        context.addIssue({
          code: 'custom',
          path: ['authorUid'],
          message: 'Visitor reviews require an author UID',
        })
      } else if (review.authorUid !== review.id) {
        context.addIssue({
          code: 'custom',
          path: ['authorUid'],
          message: 'Visitor review IDs must match the author UID',
        })
      }
    } else if (review.authorUid !== null) {
      context.addIssue({
        code: 'custom',
        path: ['authorUid'],
        message: 'Editorial reviews cannot claim an author UID',
      })
    }

    if (new Set(review.experienceIds).size !== review.experienceIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['experienceIds'],
        message: 'Experience references cannot contain duplicates',
      })
    }

    if (new Set(review.projectSlugs).size !== review.projectSlugs.length) {
      context.addIssue({
        code: 'custom',
        path: ['projectSlugs'],
        message: 'Project references cannot contain duplicates',
      })
    }

    if (review.experienceIds.length + review.projectSlugs.length > 3) {
      context.addIssue({
        code: 'custom',
        path: ['experienceIds'],
        message: 'A review can link to at most three records',
      })
    }
  })

export type ReviewDocument = z.infer<typeof reviewSchema>
