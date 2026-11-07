import { z } from 'zod'
import {
  httpsUrlSchema,
  idSchema,
  localizedSchema,
  orderSchema,
  imageAssetSchema,
  slugSchema,
} from './primitives'
import { technologyReferenceSchema } from './technology'

export const projectVisibilitySchema = z.enum(['public', 'private'])
export const projectLinkKindSchema = z.enum(['code', 'live', 'store'])

export const projectMediaSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('cover'),
      dark: imageAssetSchema,
      light: imageAssetSchema,
      alt: localizedSchema,
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      type: z.literal('logo'),
      src: imageAssetSchema,
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      surface: z.enum(['light', 'dark']).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('monogram'),
      label: z.string().min(1),
    })
    .strict(),
])

export type ProjectMedia = z.infer<typeof projectMediaSchema>

export const projectLinkSchema = z
  .object({
    kind: projectLinkKindSchema,
    href: httpsUrlSchema,
    label: localizedSchema,
    primary: z.boolean().optional(),
  })
  .strict()

export type ProjectLink = z.infer<typeof projectLinkSchema>
export type ProjectLinkKind = z.infer<typeof projectLinkKindSchema>
export type ProjectVisibility = z.infer<typeof projectVisibilitySchema>

export const projectSchema = z
  .object({
    id: slugSchema,
    order: orderSchema,
    title: localizedSchema,
    summary: localizedSchema,
    description: localizedSchema.optional(),
    collaboration: z.boolean(),
    featured: z.boolean(),
    visibility: projectVisibilitySchema,
    context: localizedSchema,
    experienceIds: z.array(idSchema).max(50),
    role: localizedSchema.optional(),
    period: localizedSchema.optional(),
    platforms: z.array(z.string().min(1)).max(20).optional(),
    tech: z.array(technologyReferenceSchema).min(1).max(50),
    media: projectMediaSchema,
    links: z.array(projectLinkSchema).max(20),
    code: z.string().min(1).optional(),
    repos: z.array(z.string().min(1)).max(50).optional(),
    meta: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((project, context) => {
    if (new Set(project.tech.map((technology) => technology.id)).size !== project.tech.length) {
      context.addIssue({
        code: 'custom',
        path: ['tech'],
        message: 'Technology references cannot contain duplicates',
      })
    }
    if (project.links.length > 1 && project.links.filter((link) => link.primary).length !== 1) {
      context.addIssue({
        code: 'custom',
        path: ['links'],
        message: 'Projects with multiple links require exactly one primary link',
      })
    }
  })

export type ProjectDocument = z.infer<typeof projectSchema>
export type Project = Omit<ProjectDocument, 'id' | 'tech'> & { slug: string; tech: string[] }
