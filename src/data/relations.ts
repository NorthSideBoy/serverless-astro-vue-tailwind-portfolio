import type { ExperienceEntry } from './experience'
import type { Project } from './projects'
import type { Testimonial } from './testimonials'

export function reviewsForExperience(
  experienceId: string,
  reviews: readonly Testimonial[],
): Testimonial[] {
  return reviews.filter((review) => review.experienceIds.includes(experienceId))
}

export function reviewsForProject(
  projectSlug: string,
  reviews: readonly Testimonial[],
): Testimonial[] {
  return reviews.filter((review) => review.projectSlugs.includes(projectSlug))
}

export function projectsForExperience(
  experienceId: string,
  projects: readonly Project[],
): Project[] {
  return projects.filter((project) => project.experienceIds.includes(experienceId))
}

export function experiencesForProject(
  project: Project,
  experience: readonly ExperienceEntry[],
): ExperienceEntry[] {
  return project.experienceIds.flatMap((id) => {
    const entry = experience.find((item) => item.id === id)
    return entry ? [entry] : []
  })
}
