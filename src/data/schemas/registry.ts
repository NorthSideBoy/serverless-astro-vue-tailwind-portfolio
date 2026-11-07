import { z } from 'zod'
import { siteSectionSchema } from './siteSection'
import { authorSchema, type Author } from './author'
import { stackGroupSchema, type StackGroup } from './stackGroup'
import { technologySchema, type Technology } from './technology'
import { experienceSchema, type ExperienceEntry } from './experience'
import { projectSchema, type Project } from './project'
import { educationSchema, type EducationEntry } from './education'
import { certificationSchema, type CertificationEntry } from './certification'
import { articleSchema, type Article } from './article'
import { reviewSchema, type Testimonial } from './review'
import { ContentValidationError, validationIssues } from './errors'

export const collectionSchemas = {
  siteSections: z.array(siteSectionSchema),
  authors: z.array(authorSchema),
  stackGroups: z.array(stackGroupSchema),
  technologies: z.array(technologySchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  articles: z.array(articleSchema),
  reviews: z.array(reviewSchema),
} as const

export type CollectionName = keyof typeof collectionSchemas
export type ContentCollectionName = Exclude<CollectionName, 'siteSections'>

export type CollectionDocumentTypes = {
  [K in CollectionName]: z.infer<(typeof collectionSchemas)[K]>[number]
}

export interface CollectionTypes {
  authors: Author
  stackGroups: StackGroup
  technologies: Technology
  experience: ExperienceEntry
  projects: Project
  education: EducationEntry
  certifications: CertificationEntry
  articles: Article
  reviews: Testimonial
}

export type { SectionId, SectionText, SiteSections, SiteSectionDocument } from './siteSection'
export type { StackGroup } from './stackGroup'
export type { Author } from './author'
export type { Technology } from './technology'
export type { ExperienceEntry } from './experience'
export type { Project } from './project'
export type { EducationEntry } from './education'
export type { CertificationEntry } from './certification'
export type { Article } from './article'
export type { Testimonial } from './review'

export function parseCollection<K extends CollectionName>(
  name: K,
  documents: unknown,
): CollectionDocumentTypes[K][] {
  const result = collectionSchemas[name].safeParse(documents)
  if (!result.success) {
    throw new ContentValidationError(name, validationIssues(result.error))
  }
  return result.data as CollectionDocumentTypes[K][]
}

export const contentCollectionNames = [
  'authors',
  'stackGroups',
  'technologies',
  'experience',
  'projects',
  'education',
  'certifications',
  'articles',
  'reviews',
] as const satisfies readonly ContentCollectionName[]
