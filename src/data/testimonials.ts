import type { ReviewAuthor as EditorialAuthor, Testimonial as EditorialReview } from './schemas/review'

export type { IdentityProvider } from './schemas/review'

// Editorial contact details are validated in Firestore but never published.
export type ReviewAuthor = Omit<EditorialAuthor, 'email'>
export type Testimonial = Omit<EditorialReview, 'author'> & { author: ReviewAuthor }
