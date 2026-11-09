import type { Firestore } from 'firebase/firestore/lite'
import {
  normalizeRoles,
  normalizeGooglePhotoUrl,
  type ReviewDraft,
} from '@/data/reviews'
import type { Locale } from '@/data/schemas/primitives'
import type { ReviewSessionUser } from './auth'

export type ReviewRecord = {
  anchorId: string
  approved: boolean
  draft: ReviewDraft
  author: {
    name: string
    email: string
    photoUrl: string | null
  }
  createdAt: number
  updatedAt: number
}

function invalidDocument(): Error {
  return Object.assign(new Error('review/invalid-document'), {
    code: 'review/invalid-document',
  })
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function stringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.length > 0)
    .slice(0, max)
}

function localeValue(value: unknown): Locale {
  return value === 'en' ? 'en' : 'es'
}

function timestampMillis(value: unknown): number {
  if (typeof value === 'object' && value !== null) {
    if ('toMillis' in value && typeof value.toMillis === 'function') {
      return Number(value.toMillis())
    }
    if ('toDate' in value && typeof value.toDate === 'function') {
      return new Date(value.toDate()).getTime()
    }
  }
  return 0
}

function documentDataToRecord(data: unknown): ReviewRecord {
  if (typeof data !== 'object' || data === null) throw invalidDocument()

  const record = data as Record<string, unknown>
  const author = record.author
  if (typeof author !== 'object' || author === null) throw invalidDocument()

  const authorRecord = author as Record<string, unknown>
  const anchorId = stringValue(record.anchorId)
  const quote = stringValue(record.quote)
  const name = stringValue(authorRecord.name)
  const email = stringValue(authorRecord.email)
  if (!anchorId || !quote || !name || !email || typeof record.approved !== 'boolean') {
    throw invalidDocument()
  }

  return {
    anchorId,
    approved: record.approved,
    author: {
      name,
      email,
      photoUrl: normalizeGooglePhotoUrl(
        typeof authorRecord.photoUrl === 'string' ? authorRecord.photoUrl : null,
      ),
    },
    draft: {
      anchorId,
      roles: normalizeRoles(stringArray(authorRecord.roles, 5)),
      experienceIds: stringArray(record.experienceIds, 3),
      projectSlugs: stringArray(record.projectSlugs, 3),
      quote,
      locale: localeValue(record.locale),
    },
    createdAt: timestampMillis(record.createdAt),
    updatedAt: timestampMillis(record.updatedAt),
  }
}

export async function getOwnReview(
  db: Firestore,
  uid: string,
): Promise<ReviewRecord | null> {
  const { doc, getDoc } = await import('firebase/firestore/lite')
  const snapshot = await getDoc(doc(db, 'reviews', uid))
  if (!snapshot.exists()) return null
  return documentDataToRecord(snapshot.data())
}

function reviewPayload(user: ReviewSessionUser, draft: ReviewDraft) {
  return {
    locale: draft.locale,
    author: {
      provider: 'Google',
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoUrl,
      roles: normalizeRoles(draft.roles).slice(0, 3),
    },
    quote: draft.quote.trim(),
    experienceIds: draft.experienceIds.slice(0, 3),
    projectSlugs: draft.projectSlugs.slice(0, 3),
  }
}

export async function createReview(
  db: Firestore,
  user: ReviewSessionUser,
  draft: ReviewDraft,
): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import('firebase/firestore/lite')
  await setDoc(doc(db, 'reviews', user.uid), {
    id: user.uid,
    anchorId: draft.anchorId,
    source: 'visitor',
    authorUid: user.uid,
    approved: false,
    ...reviewPayload(user, draft),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateReview(
  db: Firestore,
  user: ReviewSessionUser,
  draft: ReviewDraft,
): Promise<void> {
  const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore/lite')
  await updateDoc(doc(db, 'reviews', user.uid), {
    ...reviewPayload(user, draft),
    updatedAt: serverTimestamp(),
  })
}
