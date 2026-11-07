import type { z } from 'zod'

export interface ValidationIssue {
  path: string
  message: string
}

export class ContentValidationError extends Error {
  readonly collection: string
  readonly issues: ValidationIssue[]

  constructor(collection: string, issues: ValidationIssue[]) {
    super(`Invalid content in ${collection}: ${issues.length} issue(s)`)
    this.name = 'ContentValidationError'
    this.collection = collection
    this.issues = issues
  }
}

export function validationIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join('.') : '(document)',
    message: issue.message,
  }))
}
