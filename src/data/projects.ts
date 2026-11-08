export type {
  Project,
  ProjectLink,
  ProjectLinkKind,
  ProjectMedia,
  ProjectVisibility,
} from './schemas/project'
export type { Localized } from './schemas/primitives'

/** The home carousel is a teaser, not a second projects index. */
export const MAX_HOME_CAROUSEL_PROJECTS = 5

export function homeProjectSubset<T extends { featured: boolean }>(
  projects: readonly T[],
): T[] {
  const featured = projects.filter((project) => project.featured)
  const other = projects
    .filter((project) => !project.featured)
    .slice(0, MAX_HOME_CAROUSEL_PROJECTS)

  return [...featured, ...other]
}
