import type { Project } from './schemas/project'

export function primaryProjectLink(project: Project) {
  return project.links.find((link) => link.primary) ?? project.links[0]
}
