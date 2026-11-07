import { describe, expect, it } from 'vitest'
import { reviewSchema } from '../src/data/schemas/review'
import { toPublicTestimonial } from '../src/data/mappers'

describe('editorial content published on the site', () => {
  it('validates editorial emails without publishing them in HTML or island props', () => {
    const editorial = reviewSchema.parse({
      id: 'sample-review',
      order: 0,
      author: {
        provider: 'GitHub',
        firstName: 'Sample',
        lastName: 'Author',
        email: 'private@example.com',
        photo: '/images/reviews/sample.png',
        roles: ['Developer'],
      },
      quote: 'Example content',
      experienceIds: [],
      projectSlugs: [],
    })

    const publicReview = toPublicTestimonial(editorial)
    expect(publicReview.author).not.toHaveProperty('email')
    expect(JSON.stringify(publicReview)).not.toContain('private@example.com')
    expect(publicReview.author.firstName).toBe('Sample')
  })
})
