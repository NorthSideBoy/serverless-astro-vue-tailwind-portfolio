export type AuthErrorKey =
  | 'cancelled'
  | 'popup-blocked'
  | 'unauthorized-domain'
  | 'network'
  | 'unsupported-environment'
  | 'storage-unsupported'
  | 'provider-disabled'
  | 'email-missing'
  | 'unknown'

export type PublishErrorKey =
  | 'permission-denied'
  | 'network'
  | 'quota'
  | 'invalid-document'
  | 'unknown'

function errorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' ? code : ''
}

export function authErrorKey(error: unknown): AuthErrorKey {
  switch (errorCode(error)) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'cancelled'
    case 'auth/popup-blocked':
      return 'popup-blocked'
    case 'auth/unauthorized-domain':
      return 'unauthorized-domain'
    case 'auth/network-request-failed':
      return 'network'
    case 'auth/operation-not-supported-in-this-environment':
      return 'unsupported-environment'
    case 'auth/web-storage-unsupported':
      return 'storage-unsupported'
    case 'auth/operation-not-allowed':
      return 'provider-disabled'
    default:
      return 'unknown'
  }
}

export function publishErrorKey(error: unknown): PublishErrorKey {
  switch (errorCode(error)) {
    case 'permission-denied':
      return 'permission-denied'
    case 'unavailable':
    case 'network-request-failed':
      return 'network'
    case 'resource-exhausted':
      return 'quota'
    case 'review/invalid-document':
      return 'invalid-document'
    default:
      return 'unknown'
  }
}
