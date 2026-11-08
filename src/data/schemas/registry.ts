import { z } from 'zod'
import { siteSectionSchema } from './siteSection'
import { authorSchema } from './author'
import { stackGroupSchema } from './stackGroup'
import { technologySchema } from './technology'
import { experienceSchema } from './experience'
import { projectSchema } from './project'
import { educationSchema } from './education'
import { certificationSchema } from './certification'
import { articleSchema } from './article'
import { reviewSchema } from './review'
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

export type CollectionDocumentTypes = {
  [K in CollectionName]: z.infer<(typeof collectionSchemas)[K]>[number]
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
