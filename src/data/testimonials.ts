import type { Locale } from './schemas/primitives'
import type { IdentityProvider } from './schemas/review'
import type { ExperienceEntry } from './experience'
import type { Project } from './projects'

// Minimal relation shapes used by review cards and the composer. The home can
// pass full entries; the panel page passes only these fields.
export type ReviewExperience = Pick<ExperienceEntry, 'id' | 'org' | 'role'>
export type ReviewProject = Pick<Project, 'slug' | 'title' | 'context'>

// Public review model. Never carries the author's email, approval flag,
// ownership UID or editorial ordering.
export type ReviewAuthor = {
  provider: IdentityProvider
  name: string
  email: string
  photo: string | null
  initials: string
  roles: string[]
}

export type Testimonial = {
  anchorId: string
  locale: Locale
  author: ReviewAuthor
  quote: string
  experienceIds: string[]
  projectSlugs: string[]
  createdAt: string
}

export type { IdentityProvider } from './schemas/review'
