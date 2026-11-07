import type { ArticleDocument } from './article'
import type { Author } from './author'
import type { CertificationDocument } from './certification'
import type { EducationDocument } from './education'
import type { ExperienceDocument } from './experience'
import type { ProjectDocument } from './project'
import type { Testimonial } from './review'
import { sectionIds, type SiteSectionDocument } from './siteSection'
import type { StackGroup } from './stackGroup'
import type { Technology } from './technology'

export interface ContentGraph {
  siteSections: SiteSectionDocument[]
  authors: Author[]
  stackGroups: StackGroup[]
  technologies: Technology[]
  experience: ExperienceDocument[]
  projects: ProjectDocument[]
  education: EducationDocument[]
  certifications: CertificationDocument[]
  articles: ArticleDocument[]
  reviews: Testimonial[]
}

function checkTechnologyReferences(
  name: string,
  document: { id: string; tech: { id: string; label?: string }[] },
  technologies: Map<string, Technology>,
  issues: string[],
) {
  for (const [index, reference] of document.tech.entries()) {
    if (!technologies.has(reference.id)) {
      issues.push(`${name} ${document.id}: unknown tech[${index}].id ${reference.id}`)
    }
  }
}

function hasNestedArray(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => Array.isArray(entry) || hasNestedArray(entry))
  }
  if (value && typeof value === 'object') {
    return Object.values(value).some(hasNestedArray)
  }
  return false
}

function checkOrder(name: string, documents: { order: number }[], issues: string[]) {
  const orders = documents.map((document) => document.order)
  if (new Set(orders).size !== orders.length) issues.push(`${name}: duplicate order values`)
}

export function validateContentGraph(graph: ContentGraph): string[] {
  const issues: string[] = []
  const sectionIdsFound = graph.siteSections.map((section) => section.id)

  if (graph.siteSections.length !== sectionIds.length) {
    issues.push('siteSections: expected exactly seven section documents')
  }
  if (new Set(sectionIdsFound).size !== sectionIdsFound.length) {
    issues.push('siteSections: duplicate section IDs')
  }
  for (const id of sectionIds) {
    if (!sectionIdsFound.includes(id)) issues.push(`siteSections: missing "${id}"`)
  }

  const authorIds = new Set(graph.authors.map((author) => author.id))
  if (authorIds.size !== graph.authors.length) issues.push('authors: duplicate IDs')
  for (const article of graph.articles) {
    if (!authorIds.has(article.authorId)) {
      issues.push(`article ${article.id}: unknown authorId ${article.authorId}`)
    }
  }

  for (const [name, documents] of [
    ['stackGroups', graph.stackGroups],
    ['technologies', graph.technologies],
    ['experience', graph.experience],
    ['projects', graph.projects],
    ['education', graph.education],
    ['certifications', graph.certifications],
    ['articles', graph.articles],
    ['reviews', graph.reviews],
  ] as const) {
    checkOrder(name, documents, issues)
    const ids = documents.map((document) => document.id)
    if (new Set(ids).size !== ids.length) issues.push(`${name}: duplicate IDs`)
  }

  const stackGroupIds = new Set(graph.stackGroups.map((group) => group.id))
  const technologiesById = new Map(
    graph.technologies.map((technology) => [technology.id, technology]),
  )
  const experienceIds = new Set(graph.experience.map((entry) => entry.id))
  if (graph.experience.filter((entry) => entry.highlight).length > 1) {
    issues.push('experience: only one entry may be highlighted')
  }
  const projectIds = new Set(graph.projects.map((project) => project.id))

  for (const technology of graph.technologies) {
    if (technology.stackGroupId && !stackGroupIds.has(technology.stackGroupId)) {
      issues.push(`technology ${technology.id}: stackGroupId does not resolve`)
    }
  }

  for (const entry of graph.experience) {
    checkTechnologyReferences('experience', entry, technologiesById, issues)
  }

  for (const project of graph.projects) {
    checkTechnologyReferences('project', project, technologiesById, issues)
    for (const experienceId of project.experienceIds) {
      if (!experienceIds.has(experienceId)) {
        issues.push(`project ${project.id}: unknown experienceId ${experienceId}`)
      }
    }
  }

  for (const review of graph.reviews) {
    for (const experienceId of review.experienceIds) {
      if (!experienceIds.has(experienceId)) {
        issues.push(`review ${review.id}: unknown experienceId ${experienceId}`)
      }
    }
    for (const projectSlug of review.projectSlugs) {
      if (!projectIds.has(projectSlug)) {
        issues.push(`review ${review.id}: unknown projectSlug ${projectSlug}`)
      }
    }
  }

  const allDocuments = [
    ...graph.siteSections,
    ...graph.authors,
    ...graph.stackGroups,
    ...graph.technologies,
    ...graph.experience,
    ...graph.projects,
    ...graph.education,
    ...graph.certifications,
    ...graph.articles,
    ...graph.reviews,
  ]

  if (allDocuments.some(hasNestedArray)) {
    issues.push('content: nested arrays are not supported by Firestore Standard')
  }

  return issues
}
