export type ContactSubmitErrorKey =
  | 'permission-denied'
  | 'network'
  | 'quota'
  | 'unknown'

function errorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' ? code : ''
}

export function contactSubmitErrorKey(error: unknown): ContactSubmitErrorKey {
  switch (errorCode(error)) {
    case 'permission-denied':
      return 'permission-denied'
    case 'unavailable':
    case 'network-request-failed':
      return 'network'
    case 'resource-exhausted':
      return 'quota'
    default:
      return 'unknown'
  }
}
