import { describe, expect, it } from 'vitest'
import { toPublicTestimonial } from '../src/data/mappers'
import {
  initialsFromName,
  normalizeGooglePhotoUrl,
  normalizeRoles,
  sortReviewDocuments,
  validateReviewDraft,
  type ReviewDraft,
} from '../src/data/reviews'
import { reviewSchema } from '../src/data/schemas/review'
import { authErrorKey, publishErrorKey } from '../src/lib/reviews/errors'
import { toReviewSessionUser } from '../src/lib/reviews/auth'

const visitorReview = {
  id: 'abc123XYZ',
  anchorId: 'r-1a2b3c4d',
  source: 'visitor',
  authorUid: 'abc123XYZ',
  approved: false,
  locale: 'es',
  author: {
    provider: 'Google',
    name: 'Andrea Rivas',
    email: 'andrea.rivas@example.com',
    photoUrl: 'https://lh3.googleusercontent.com/a/photo',
    roles: ['Directora de operaciones', 'Cliente'],
  },
  quote: 'Trabajar con Said nos permitió ordenar el proceso y cerrar el mes con datos confiables.',
  experienceIds: ['fixture-role'],
  projectSlugs: ['mvc-boilerplate'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

const validDraft: ReviewDraft = {
  anchorId: 'r-1a2b3c4d',
  roles: ['Cliente'],
  experienceIds: [],
  projectSlugs: [],
  quote: 'El sistema nos permitió ordenar el proceso y trabajar con información confiable.',
  locale: 'es',
}

describe('review document schema', () => {
  it('accepts a visitor review owned by its UID', () => {
    const parsed = reviewSchema.parse(visitorReview)
    expect(parsed.authorUid).toBe(parsed.id)
    expect(parsed.approved).toBe(false)
  })

  it('rejects a mismatched author UID and missing approval flag', () => {
    expect(() =>
      reviewSchema.parse({ ...visitorReview, authorUid: 'anotherUid' }),
    ).toThrow()

    const { approved: _approved, ...withoutApproval } = visitorReview
    expect(() => reviewSchema.parse(withoutApproval)).toThrow()
  })

  it('rejects invalid anchors, short quotes and too many relations', () => {
    expect(() => reviewSchema.parse({ ...visitorReview, anchorId: 'Not A Slug' })).toThrow()
    expect(() => reviewSchema.parse({ ...visitorReview, quote: 'Too short' })).toThrow()
    expect(() =>
      reviewSchema.parse({
        ...visitorReview,
        experienceIds: ['a', 'b'],
        projectSlugs: ['a', 'b'],
      }),
    ).toThrow()
  })

  it('enforces the 400-character quote and 3-role limits', () => {
    const quote400 = 'a'.repeat(400)
    const parsed = reviewSchema.parse({
      ...visitorReview,
      quote: quote400,
      author: { ...visitorReview.author, roles: ['Cliente', 'Líder', 'Colega'] },
    })
    expect(parsed.quote).toHaveLength(400)

    expect(() => reviewSchema.parse({ ...visitorReview, quote: 'a'.repeat(401) })).toThrow()
    expect(() =>
      reviewSchema.parse({
        ...visitorReview,
        author: {
          ...visitorReview.author,
          roles: ['Cliente', 'Líder', 'Colega', 'Extra'],
        },
      }),
    ).toThrow()
  })

  it('accepts a long Google photo URL within the 4096-character limit', () => {
    const longPhoto = `https://lh3.googleusercontent.com/a-/ALV-Uj${'x'.repeat(1080)}`
    expect(longPhoto.length).toBeGreaterThan(1000)
    const parsed = reviewSchema.parse({
      ...visitorReview,
      author: { ...visitorReview.author, photoUrl: longPhoto },
    })
    expect(parsed.author.photoUrl).toBe(longPhoto)
  })
})

describe('public review output', () => {
  it('publishes the author email while stripping moderation fields', () => {
    const publicReview = toPublicTestimonial(reviewSchema.parse(visitorReview))

    expect(publicReview.author.email).toBe('andrea.rivas@example.com')
    expect(publicReview).not.toHaveProperty('approved')
    expect(publicReview).not.toHaveProperty('authorUid')
    expect(JSON.stringify(publicReview)).toContain('andrea.rivas@example.com')
    expect(publicReview.author.photo).toBe('https://lh3.googleusercontent.com/a/photo')
    expect(publicReview.author.initials).toBe('AR')
    expect(publicReview.anchorId).toBe('r-1a2b3c4d')
  })

  it('falls back to initials when no photo exists', () => {
    const publicReview = toPublicTestimonial(
      reviewSchema.parse({
        ...visitorReview,
        author: { ...visitorReview.author, photoUrl: null },
      }),
    )
    expect(publicReview.author.photo).toBeNull()
    expect(publicReview.author.initials).toBe('AR')
  })
})

describe('review ordering', () => {
  it('keeps pinned editorial reviews first and sorts the rest newest first', () => {
    const sorted = sortReviewDocuments([
      { order: undefined, createdAt: '2024-01-01T00:00:00.000Z', id: 'old' },
      { order: 0, createdAt: '2023-01-01T00:00:00.000Z', id: 'pinned' },
      { order: undefined, createdAt: '2024-06-01T00:00:00.000Z', id: 'new' },
    ])
    expect(sorted.map((review) => review.id)).toEqual(['pinned', 'new', 'old'])
  })
})

describe('review draft validation', () => {
  it('accepts a complete draft with no relations', () => {
    expect(validateReviewDraft(validDraft)).toEqual({})
  })

  it('rejects missing roles, short quotes and too many relations', () => {
    expect(validateReviewDraft({ ...validDraft, roles: [] }).roles).toBe('roles-required')
    expect(validateReviewDraft({ ...validDraft, quote: 'short' }).quote).toBe('quote-min')
    expect(
      validateReviewDraft({
        ...validDraft,
        experienceIds: ['a', 'b'],
        projectSlugs: ['a', 'b'],
      }).relations,
    ).toBe('relations-max')
  })

  it('enforces the 400-character quote and 3-role limits', () => {
    expect(validateReviewDraft({ ...validDraft, quote: 'a'.repeat(400) }).quote).toBeUndefined()
    expect(validateReviewDraft({ ...validDraft, quote: 'a'.repeat(401) }).quote).toBe('quote-max')
    expect(
      validateReviewDraft({
        ...validDraft,
        roles: ['Cliente', 'Líder', 'Colega', 'Extra'],
      }).roles,
    ).toBe('roles-max')
  })

  it('rejects invalid roles and anchors', () => {
    expect(validateReviewDraft({ ...validDraft, roles: ['A'] }).roles).toBe('role-length')
    expect(validateReviewDraft({ ...validDraft, anchorId: 'Not A Slug' }).anchorId).toBe(
      'anchor-invalid',
    )
  })
})

describe('review helpers', () => {
  it('normalizes roles by trimming and removing duplicates', () => {
    expect(normalizeRoles([' Cliente ', 'cliente', 'Líder', ''])).toEqual([
      'Cliente',
      'Líder',
    ])
  })

  it('derives initials from the full name', () => {
    expect(initialsFromName('Andrea Rivas')).toBe('AR')
    expect(initialsFromName('Said')).toBe('S')
    expect(initialsFromName('  ')).toBe('?')
  })

  it('only accepts Google-hosted https avatars', () => {
    expect(normalizeGooglePhotoUrl('https://lh3.googleusercontent.com/a/photo')).toBe(
      'https://lh3.googleusercontent.com/a/photo',
    )
    expect(normalizeGooglePhotoUrl('http://lh3.googleusercontent.com/a/photo')).toBeNull()
    expect(normalizeGooglePhotoUrl('https://example.com/avatar.png')).toBeNull()
    expect(normalizeGooglePhotoUrl(null)).toBeNull()
  })

  it('accepts a long Google avatar URL but rejects one over the URL limit', () => {
    const longPhoto = `https://lh3.googleusercontent.com/a-/ALV-Uj${'x'.repeat(1080)}`
    expect(longPhoto.length).toBeGreaterThan(1000)
    expect(normalizeGooglePhotoUrl(longPhoto)).toBe(longPhoto)
    expect(
      normalizeGooglePhotoUrl(
        `https://lh3.googleusercontent.com/a-/ALV-Uj${'x'.repeat(4100)}`,
      ),
    ).toBeNull()
  })
})

describe('review error mapping', () => {
  it('maps cancelled and blocked popups', () => {
    expect(authErrorKey({ code: 'auth/popup-closed-by-user' })).toBe('cancelled')
    expect(authErrorKey({ code: 'auth/popup-blocked' })).toBe('popup-blocked')
    expect(authErrorKey({ code: 'auth/network-request-failed' })).toBe('network')
    expect(authErrorKey(new Error('unknown'))).toBe('unknown')
  })

  it('maps publish failures', () => {
    expect(publishErrorKey({ code: 'permission-denied' })).toBe('permission-denied')
    expect(publishErrorKey({ code: 'unavailable' })).toBe('network')
    expect(publishErrorKey({ code: 'resource-exhausted' })).toBe('quota')
    expect(publishErrorKey({ code: 'review/invalid-document' })).toBe('invalid-document')
  })
})

describe('review session mapping', () => {
  const googleProvider = {
    providerId: 'google.com',
    displayName: 'Andrea Rivas',
    email: 'andrea.rivas@example.com',
    photoURL: 'https://lh3.googleusercontent.com/a/photo',
  }

  it('maps a Google user and truncates an overlong display name', () => {
    const user = {
      uid: 'abc123',
      email: 'andrea.rivas@example.com',
      displayName: 'Andrea Rivas',
      photoURL: 'https://lh3.googleusercontent.com/a/photo',
      providerData: [googleProvider],
    }
    const mapped = toReviewSessionUser(user as never)
    expect(mapped).toMatchObject({
      uid: 'abc123',
      displayName: 'Andrea Rivas',
      email: 'andrea.rivas@example.com',
      photoUrl: 'https://lh3.googleusercontent.com/a/photo',
      provider: 'Google',
    })

    const longName = toReviewSessionUser({
      ...user,
      displayName: 'A'.repeat(120),
    } as never)
    expect(longName?.displayName).toHaveLength(80)
  })

  it('falls back to the email local part and drops non-Google photos', () => {
    const mapped = toReviewSessionUser({
      uid: 'abc123',
      email: 'andrea.rivas@example.com',
      displayName: null,
      photoURL: 'https://example.com/photo.png',
      providerData: [],
    } as never)
    expect(mapped?.displayName).toBe('andrea.rivas')
    expect(mapped?.photoUrl).toBeNull()
  })

  it('rejects a user without an email', () => {
    expect(
      toReviewSessionUser({
        uid: 'abc123',
        email: null,
        displayName: 'Andrea',
        photoURL: null,
        providerData: [],
      } as never),
    ).toBeNull()
  })
})
