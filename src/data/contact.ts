import { z } from 'zod'
import { localeSchema, type Locale } from './schemas/primitives'

/**
 * Shared contact-form constraints. The Zod schema, the Firestore rules and the
 * form attributes must agree; keep this object as the single source for the
 * values that can be shared with the browser.
 */
export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  emailMax: 254,
  subjectMin: 3,
  subjectMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const

export const CONTACT_FIELDS = ['name', 'email', 'subject', 'message'] as const

export type ContactField = (typeof CONTACT_FIELDS)[number]

export type ContactFieldIssue =
  | 'name-required'
  | 'name-min'
  | 'name-max'
  | 'email-required'
  | 'email-invalid'
  | 'email-max'
  | 'subject-required'
  | 'subject-min'
  | 'subject-max'
  | 'message-required'
  | 'message-min'
  | 'message-max'

const CONTACT_FIELD_ISSUES: readonly ContactFieldIssue[] = [
  'name-required',
  'name-min',
  'name-max',
  'email-required',
  'email-invalid',
  'email-max',
  'subject-required',
  'subject-min',
  'subject-max',
  'message-required',
  'message-min',
  'message-max',
]

export type ContactDraft = {
  name: string
  email: string
  subject: string
  message: string
  locale: Locale
}

export type ContactMessagePayload = ContactDraft

export type ContactFormErrors = Partial<Record<ContactField, ContactFieldIssue>>

/**
 * Firestore rules repeat this pattern because they cannot import TypeScript.
 * Keep both copies in sync.
 */
export const CONTACT_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

/** Firestore `string.size()` counts characters, not UTF-16 code units. */
function characterLength(value: string): number {
  return Array.from(value).length
}

/**
 * The issue messages double as the keys consumed by the localized copy. The
 * order of the refinements defines the reported issue: required, then minimum,
 * then maximum or format.
 */
export const contactDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((value) => value.length > 0, 'name-required')
    .refine((value) => characterLength(value) >= CONTACT_LIMITS.nameMin, 'name-min')
    .refine((value) => characterLength(value) <= CONTACT_LIMITS.nameMax, 'name-max'),
  email: z
    .string()
    .trim()
    .refine((value) => value.length > 0, 'email-required')
    .refine((value) => characterLength(value) <= CONTACT_LIMITS.emailMax, 'email-max')
    .refine((value) => CONTACT_EMAIL_PATTERN.test(value), 'email-invalid'),
  subject: z
    .string()
    .trim()
    .refine((value) => value.length > 0, 'subject-required')
    .refine((value) => characterLength(value) >= CONTACT_LIMITS.subjectMin, 'subject-min')
    .refine((value) => characterLength(value) <= CONTACT_LIMITS.subjectMax, 'subject-max'),
  message: z
    .string()
    .trim()
    .refine((value) => value.length > 0, 'message-required')
    .refine((value) => characterLength(value) >= CONTACT_LIMITS.messageMin, 'message-min')
    .refine((value) => characterLength(value) <= CONTACT_LIMITS.messageMax, 'message-max'),
  locale: localeSchema,
})

export function createEmptyContactDraft(locale: Locale): ContactDraft {
  return { name: '', email: '', subject: '', message: '', locale }
}

export function normalizeContactDraft(draft: ContactDraft): ContactDraft {
  return {
    name: draft.name.trim(),
    email: draft.email.trim(),
    subject: draft.subject.trim(),
    message: draft.message.trim(),
    locale: draft.locale,
  }
}

function isContactField(value: unknown): value is ContactField {
  return CONTACT_FIELDS.includes(value as ContactField)
}

function isContactFieldIssue(value: string): value is ContactFieldIssue {
  return (CONTACT_FIELD_ISSUES as readonly string[]).includes(value)
}

export function validateContactDraft(draft: ContactDraft): ContactFormErrors {
  const result = contactDraftSchema.safeParse(draft)
  if (result.success) return {}

  const errors: ContactFormErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (!isContactField(field) || errors[field]) continue
    if (!isContactFieldIssue(issue.message)) continue
    errors[field] = issue.message
  }
  return errors
}

export function isContactDraftValid(draft: ContactDraft): boolean {
  return Object.keys(validateContactDraft(draft)).length === 0
}

/** Trimmed values are the only values that reach Firestore. */
export function toContactMessage(draft: ContactDraft): ContactMessagePayload {
  return normalizeContactDraft(draft)
}
