import { describe, expect, it } from 'vitest'
import { reviewSchema } from '../src/data/schemas/review'
import { toPublicTestimonial } from '../src/data/mappers'

describe('editorial content published on the site', () => {
  it('validates editorial emails without publishing them in HTML or island props', () => {
    const editorial = reviewSchema.parse({
      id: 'review-1',
      order: 0,
      author: {
        provider: 'GitHub',
        firstName: 'Andrea',
        lastName: 'Rivas',
        email: 'private@example.com',
        photo: '/images/reviews/andrea.png',
        roles: ['Directora de operaciones', 'Cliente'],
      },
      quote: 'The team kept every process organised and easy to audit.',
      experienceIds: [],
      projectSlugs: [],
    })

    const publicReview = toPublicTestimonial(editorial)
    expect(publicReview.author).not.toHaveProperty('email')
    expect(JSON.stringify(publicReview)).not.toContain('private@example.com')
    expect(publicReview.author.firstName).toBe('Andrea')
  })
})
