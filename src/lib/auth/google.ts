import type { Auth, User } from 'firebase/auth'
import { normalizeGooglePhotoUrl } from '@/data/reviews'

/**
 * Shared Google session used by the visitor review flow and the contact form.
 * The browser keeps one Firebase Auth session, so signing in on one feature is
 * visible to the other after hydration.
 */
export type GoogleSessionUser = {
  uid: string
  displayName: string
  email: string
  photoUrl: string | null
  provider: 'Google'
}

function fallbackName(email: string): string {
  const localPart = email.split('@')[0]?.trim()
  return localPart || 'Google user'
}

export function toGoogleSessionUser(user: User): GoogleSessionUser | null {
  const google = user.providerData.find((provider) => provider.providerId === 'google.com')
  const email = (user.email ?? google?.email ?? '').trim()
  if (!email) return null

  const displayName = (
    user.displayName?.trim() ||
    google?.displayName?.trim() ||
    fallbackName(email)
  ).slice(0, 80)

  return {
    uid: user.uid,
    displayName,
    email,
    photoUrl: normalizeGooglePhotoUrl(user.photoURL ?? google?.photoURL),
    provider: 'Google',
  }
}

export type GoogleSignInResult = 'success' | 'redirect' | 'cancelled'

function isPopupCancelled(code: string): boolean {
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request'
}

function shouldUseRedirect(code: string): boolean {
  return (
    code === 'auth/popup-blocked' ||
    code === 'auth/operation-not-supported-in-this-environment'
  )
}

export async function signInWithGoogle(auth: Auth): Promise<GoogleSignInResult> {
  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import(
    'firebase/auth'
  )
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  try {
    await signInWithPopup(auth, provider)
    return 'success'
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : ''

    if (isPopupCancelled(code)) return 'cancelled'
    if (shouldUseRedirect(code)) {
      await signInWithRedirect(auth, provider)
      return 'redirect'
    }
    throw error
  }
}

export async function completeRedirectSignIn(auth: Auth): Promise<void> {
  const { getRedirectResult } = await import('firebase/auth')
  await getRedirectResult(auth)
}

export async function signOutOfGoogle(auth: Auth): Promise<void> {
  const { signOut } = await import('firebase/auth')
  await signOut(auth)
}

export async function subscribeToAuth(
  auth: Auth,
  callback: (user: User | null) => void,
): Promise<() => void> {
  const { onAuthStateChanged } = await import('firebase/auth')
  return onAuthStateChanged(auth, callback)
}
