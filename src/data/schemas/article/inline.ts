import { z } from 'zod'
import { blockIdSchema } from '../primitives'
import { inlineMarks, type InlineMark } from './catalog'

const httpsLinkSchema = z
  .string()
  .min(1)
  .max(2048)
  .refine((value) => /^https:\/\/[^\s]+$/.test(value), 'Expected an https URL')

const internalLinkSchema = z
  .string()
  .min(1)
  .max(2048)
  .refine(
    (value) => /^\/(?!\/)[^\s]*$/.test(value),
    'Expected a local route starting with a single /',
  )

const anchorLinkSchema = z
  .string()
  .min(1)
  .max(200)
  .refine((value) => /^#[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), 'Expected a kebab-case anchor')

const mailLinkSchema = z
  .string()
  .min(1)
  .max(320)
  .refine((value) => /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Expected a mailto URL')

export const linkHrefSchema = z.union([
  httpsLinkSchema,
  internalLinkSchema,
  anchorLinkSchema,
  mailLinkSchema,
])

export type LinkHref = z.infer<typeof linkHrefSchema>

export const inlineMarkSchema = z.enum(inlineMarks)

export const inlineTextNodeSchema = z
  .object({
    type: z.literal('text'),
    text: z.string().min(1).max(20_000),
    marks: z.array(inlineMarkSchema).min(1).max(inlineMarks.length).optional(),
  })
  .strict()

export type InlineTextNode = z.infer<typeof inlineTextNodeSchema>

export const inlineBreakNodeSchema = z.object({ type: z.literal('break') }).strict()

export type InlineBreakNode = z.infer<typeof inlineBreakNodeSchema>

export const inlineTextRunSchema = z
  .array(z.union([inlineTextNodeSchema, inlineBreakNodeSchema]))
  .min(1)
  .max(200)

export const inlineLinkSchema = z
  .object({
    type: z.literal('link'),
    href: linkHrefSchema,
    children: inlineTextRunSchema,
  })
  .strict()

export type InlineLink = z.infer<typeof inlineLinkSchema>

export const footnoteRefSchema = z
  .object({
    type: z.literal('footnoteRef'),
    id: blockIdSchema,
  })
  .strict()

export type FootnoteRef = z.infer<typeof footnoteRefSchema>

export const inlineNodeSchema = z.discriminatedUnion('type', [
  inlineTextNodeSchema,
  inlineBreakNodeSchema,
  inlineLinkSchema,
  footnoteRefSchema,
])

export type InlineNode = z.infer<typeof inlineNodeSchema>

export type { InlineMark }
