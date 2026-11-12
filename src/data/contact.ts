import { z } from 'zod'
import { localeSchema, type Locale } from './schemas/primitives'

/**
 * Shared contact-form constraints. The Zod schema, the Firestore rules and the
 * form attributes must agree; keep this object as the single source for the
 * values that can be shared with the browser.
 *
 * Name and email are not editable: they come from the signed-in Google
 * account and are validated again by the rules against the auth token.
 */
export const CONTACT_LIMITS = {
  nameMin: 1,
  nameMax: 80,
  emailMax: 254,
  subjectMin: 3,
  subjectMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const

export const CONTACT_FIELDS = ['subject', 'message'] as const

export type ContactField = (typeof CONTACT_FIELDS)[number]

export type ContactFieldIssue =
  | 'subject-required'
  | 'subject-min'
  | 'subject-max'
  | 'message-required'
  | 'message-min'
  | 'message-max'

const CONTACT_FIELD_ISSUES: readonly ContactFieldIssue[] = [
  'subject-required',
  'subject-min',
  'subject-max',
  'message-required',
  'message-min',
  'message-max',
]

export type ContactDraft = {
  subject: string
  message: string
  locale: Locale
}

/** Identity resolved from the signed-in Google session, never from an input. */
export type ContactSender = {
  uid: string
  name: string
  email: string
}

export type ContactMessagePayload = ContactDraft & {
  name: string
  email: string
  senderUid: string
}

export type ContactFormErrors = Partial<Record<ContactField, ContactFieldIssue>>

/** Firestore `string.size()` counts characters, not UTF-16 code units. */
function characterLength(value: string): number {
  return Array.from(value).length
}

/**
 * The issue messages double as the keys consumed by the localized copy. The
 * order of the refinements defines the reported issue: required, then minimum,
 * then maximum.
 */
export const contactDraftSchema = z.object({
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
  return { subject: '', message: '', locale }
}

export function normalizeContactDraft(draft: ContactDraft): ContactDraft {
  return {
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

/**
 * Trimmed values are the only values that reach Firestore. The sender identity
 * is copied from the authenticated session, never from the form.
 */
export function toContactMessage(
  draft: ContactDraft,
  sender: ContactSender,
): ContactMessagePayload {
  return {
    ...normalizeContactDraft(draft),
    name: sender.name.trim(),
    email: sender.email.trim(),
    senderUid: sender.uid,
  }
}
