import { z } from 'zod'
import { techIcons } from '../techIcons'
import { httpsUrlSchema, idSchema, localizedSchema, orderSchema, slugSchema } from './primitives'

export const technologyTypeSchema = z.enum(['technology', 'concept'])

export const technologyReferenceSchema = z
  .object({
    id: slugSchema,
    label: z.string().min(1).optional(),
  })
  .strict()

export const technologyHoverColorSchema = z
  .object({
    dark: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected a six-digit hex color'),
    light: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected a six-digit hex color'),
  })
  .strict()

export const technologySchema = z
  .object({
    id: slugSchema,
    name: z.string().min(1),
    tag: localizedSchema,
    href: httpsUrlSchema.optional(),
    icon: z
      .string()
      .min(1)
      .refine(
        (icon) => Object.prototype.hasOwnProperty.call(techIcons, icon),
        'Unknown technology icon',
      )
      .optional(),
    hoverColor: technologyHoverColorSchema.optional(),
    core: z.boolean().optional(),
    stackGroupId: slugSchema.nullable(),
    order: orderSchema,
    type: technologyTypeSchema,
  })
  .strict()
  .superRefine((technology, context) => {
    if (technology.stackGroupId && technology.type !== 'technology') {
      context.addIssue({
        code: 'custom',
        path: ['type'],
        message: 'Only technologies can appear in the Stack',
      })
    }

    if (technology.type === 'technology' && !technology.href) {
      context.addIssue({
        code: 'custom',
        path: ['href'],
        message: 'Technologies require an https link',
      })
    }

    if (technology.stackGroupId && !technology.icon) {
      context.addIssue({
        code: 'custom',
        path: ['icon'],
        message: 'Stack technologies require an icon',
      })
    }

    if (technology.stackGroupId && !technology.hoverColor) {
      context.addIssue({
        code: 'custom',
        path: ['hoverColor'],
        message: 'Stack technologies require hover colors for both themes',
      })
    }

    if (!technology.stackGroupId && technology.hoverColor) {
      context.addIssue({
        code: 'custom',
        path: ['hoverColor'],
        message: 'Only Stack technologies use hover colors',
      })
    }
  })

export type Technology = z.infer<typeof technologySchema>

export const technologyIdSchema = idSchema
