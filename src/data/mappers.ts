import type { ArticleDocument, Article } from './schemas/article'
import type { Author } from './schemas/author'
import type { CertificationDocument, CertificationEntry } from './schemas/certification'
import type { ProjectDocument, Project } from './schemas/project'
import type { ExperienceDocument, ExperienceEntry } from './schemas/experience'
import type { Technology } from './schemas/technology'
import type { EducationDocument, EducationEntry } from './schemas/education'
import type { ReviewDocument, ReviewTimestamp } from './schemas/review'
import type { Testimonial } from './testimonials'
import { initialsFromName } from './reviews'
import { experiencePeriod, educationPeriod, certificationDate } from './dateLabels'
import { sectionIds, type SiteSectionDocument, type SiteSections } from './schemas/siteSection'
import { ContentValidationError } from './schemas/errors'

function technologyLabels(
  references: { id: string; label?: string }[],
  technologies: readonly Technology[],
  collection: string,
  documentId: string,
) {
  const byId = new Map(technologies.map((technology) => [technology.id, technology.name]))
  return references.map((reference, index) => {
    const name = byId.get(reference.id)
    if (!name) {
      throw new ContentValidationError(collection, [
        { path: `${documentId}.tech.${index}.id`, message: `Unknown technology: ${reference.id}` },
      ])
    }
    return reference.label ?? name
  })
}

export function toExperience(
  document: ExperienceDocument,
  technologies: readonly Technology[],
): ExperienceEntry {
  return {
    ...document,
    tech: technologyLabels(document.tech, technologies, 'experience', document.id),
    period: experiencePeriod(document.startMonth, document.endMonth),
  }
}

export function toEducation(document: EducationDocument): EducationEntry {
  return { ...document, period: educationPeriod(document.startYear, document.endYear) }
}

export function toProject(document: ProjectDocument, technologies: readonly Technology[]): Project {
  const { id, ...project } = document
  return {
    ...project,
    tech: technologyLabels(project.tech, technologies, 'projects', id),
    slug: id,
  }
}

export function toArticle(document: ArticleDocument, authors: readonly Author[]): Article {
  if (document.status !== 'published')
    throw new Error('Draft articles cannot be displayed publicly')
  const author = authors.find((entry) => entry.id === document.authorId)
  if (!author) {
    throw new ContentValidationError('articles', [
      { path: `${document.id}.authorId`, message: `Unknown author: ${document.authorId}` },
    ])
  }
  const { id, ...article } = document
  return { ...article, slug: id, author }
}

function reviewTimestampToIso(value: ReviewTimestamp): string {
  return typeof value === 'string'
    ? new Date(value).toISOString()
    : value.toDate().toISOString()
}

export function toPublicTestimonial(document: ReviewDocument): Testimonial {
  const { photo, photoUrl, ...author } = document.author
  return {
    anchorId: document.anchorId,
    locale: document.locale,
    author: {
      provider: author.provider,
      name: author.name,
      email: author.email,
      photo: photoUrl ?? photo ?? null,
      initials: initialsFromName(author.name),
      roles: author.roles,
    },
    quote: document.quote,
    experienceIds: document.experienceIds,
    projectSlugs: document.projectSlugs,
    createdAt: reviewTimestampToIso(document.createdAt),
  }
}

export function toCertification(document: CertificationDocument): CertificationEntry {
  const { id, ...certification } = document
  return { ...certification, credentialId: id, date: certificationDate(document.issuedMonth) }
}

export function toSiteSections(documents: SiteSectionDocument[]): SiteSections {
  const ids = documents.map((document) => document.id)
  if (
    ids.length !== sectionIds.length ||
    new Set(ids).size !== sectionIds.length ||
    sectionIds.some((id) => !ids.includes(id))
  ) {
    throw new ContentValidationError('siteSections', [
      { path: '(document)', message: 'Expected each required section exactly once' },
    ])
  }
  return Object.fromEntries(
    documents.map((document) => [document.id, document.copy]),
  ) as SiteSections
}
