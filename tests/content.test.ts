import { describe, expect, it } from 'vitest'
import { reviewSchema } from '../src/data/schemas/review'
import { toPublicTestimonial } from '../src/data/mappers'

describe('editorial content published on the site', () => {
  it('publishes the author email in the public review model', () => {
    const editorial = reviewSchema.parse({
      id: 'review-1',
      anchorId: 'review-1',
      source: 'editorial',
      authorUid: null,
      approved: true,
      locale: 'en',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      author: {
        provider: 'Google',
        name: 'Andrea Rivas',
        email: 'private@example.com',
        photo: '/images/reviews/andrea.png',
        roles: ['Directora de operaciones', 'Cliente'],
      },
      quote: 'The team kept every process organised and easy to audit.',
      experienceIds: [],
      projectSlugs: [],
    })

    const publicReview = toPublicTestimonial(editorial)
    expect(publicReview.author.email).toBe('private@example.com')
    expect(JSON.stringify(publicReview)).toContain('private@example.com')
    expect(publicReview.author.name).toBe('Andrea Rivas')
    expect(publicReview.author.initials).toBe('AR')
    expect(publicReview.anchorId).toBe('review-1')
  })
})
