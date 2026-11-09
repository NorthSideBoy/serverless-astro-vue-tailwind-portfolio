import type { Locale } from './schemas/primitives'
import type { ReviewTimestamp } from './schemas/review'

/**
 * Shared review constraints. The Zod schema, the Firestore rules and the
 * client form must agree; keep this object as the single source for the
 * values that can be shared with the browser.
 */
export const REVIEW_LIMITS = {
  quoteMin: 40,
  quoteMax: 400,
  rolesMax: 3,
  roleMin: 2,
  roleMax: 60,
  relationsMax: 3,
  photoUrlMax: 4096,
  /**
   * Remote Google photos are not uploaded to Firestore; the document stores
   * only the URL. The browser cannot read Content-Length cross-origin without
   * CORS, so this is the documented display policy for a future upload/proxy
   * path. The Avatar falls back to initials on load error.
   */
  photoMaxBytes: 10 * 1024 * 1024,
} as const

export type ReviewDraft = {
  anchorId: string
  roles: string[]
  experienceIds: string[]
  projectSlugs: string[]
  quote: string
  locale: Locale
}

export type ReviewDraftIssue =
  | 'roles-required'
  | 'roles-max'
  | 'role-length'
  | 'quote-min'
  | 'quote-max'
  | 'relations-max'
  | 'anchor-invalid'
  | 'locale-invalid'

export type ReviewDraftErrors = Partial<
  Record<'roles' | 'quote' | 'relations' | 'anchorId' | 'locale', ReviewDraftIssue>
>

const anchorPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeRoles(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const roles: string[] = []

  for (const value of values) {
    const role = value.trim()
    if (!role) continue

    const key = role.toLocaleLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    roles.push(role)
  }

  return roles
}

export function validateReviewDraft(draft: ReviewDraft): ReviewDraftErrors {
  const errors: ReviewDraftErrors = {}
  const roles = normalizeRoles(draft.roles)

  if (!roles.length) errors.roles = 'roles-required'
  else if (roles.length > REVIEW_LIMITS.rolesMax) errors.roles = 'roles-max'
  else if (
    roles.some(
      (role) =>
        role.length < REVIEW_LIMITS.roleMin || role.length > REVIEW_LIMITS.roleMax,
    )
  ) {
    errors.roles = 'role-length'
  }

  const quote = draft.quote.trim()
  if (quote.length < REVIEW_LIMITS.quoteMin) errors.quote = 'quote-min'
  else if (quote.length > REVIEW_LIMITS.quoteMax) errors.quote = 'quote-max'

  if (
    draft.experienceIds.length + draft.projectSlugs.length >
    REVIEW_LIMITS.relationsMax
  ) {
    errors.relations = 'relations-max'
  }

  if (draft.anchorId.length > 40 || !anchorPattern.test(draft.anchorId)) {
    errors.anchorId = 'anchor-invalid'
  }

  if (draft.locale !== 'es' && draft.locale !== 'en') {
    errors.locale = 'locale-invalid'
  }

  return errors
}

export function isReviewDraftValid(draft: ReviewDraft): boolean {
  return Object.keys(validateReviewDraft(draft)).length === 0
}

export function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  const initials = parts
    .map((part) => Array.from(part)[0] ?? '')
    .join('')
    .toLocaleUpperCase()

  return initials || '?'
}

/** Google profile photos are the only external image source the site accepts. */
export function normalizeGooglePhotoUrl(value: string | null | undefined): string | null {
  if (!value || value.length > REVIEW_LIMITS.photoUrlMax) return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.googleusercontent.com')
      ? value
      : null
  } catch {
    return null
  }
}

/** Public anchors avoid exposing the Firebase UID in the rendered HTML. */
export function createReviewAnchorId(): string {
  const bytes = new Uint8Array(4)
  globalThis.crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `r-${suffix}`
}

function timestampMillis(value: ReviewTimestamp): number {
  return typeof value === 'string'
    ? new Date(value).getTime()
    : value.toDate().getTime()
}

/**
 * Editorial rows may pin themselves with `order`; visitor reviews fall back to
 * newest first. The function is shared by the Firestore loader and fixtures.
 */
export function sortReviewDocuments<T extends { order?: number; createdAt: ReviewTimestamp }>(
  reviews: readonly T[],
): T[] {
  return [...reviews].sort((left, right) => {
    const leftOrder = left.order ?? Number.POSITIVE_INFINITY
    const rightOrder = right.order ?? Number.POSITIVE_INFINITY

    if (leftOrder !== rightOrder) return leftOrder - rightOrder
    return timestampMillis(right.createdAt) - timestampMillis(left.createdAt)
  })
}
