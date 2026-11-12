import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import type { Auth } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import {
  authErrorKey,
  type AuthErrorKey,
} from '@/lib/reviews/errors'
import {
  completeRedirectSignIn,
  signInWithGoogle,
  signOutOfGoogle,
  subscribeToAuth,
  toGoogleSessionUser,
  type GoogleSessionUser,
} from '@/lib/auth/google'

export type GoogleSessionStatus = 'loading' | 'guest' | 'ready' | 'error'

/**
 * Resolves the single Firebase Auth session for the page. Contact and reviews
 * each mount their own instance, but both observe the same persisted session,
 * so signing in or out in one surface applies to the other.
 */
export function useGoogleSession() {
  const status = shallowRef<GoogleSessionStatus>('loading')
  const user = shallowRef<GoogleSessionUser | null>(null)
  const error = shallowRef<AuthErrorKey | null>(null)
  const busy = shallowRef(false)

  let active = true
  let auth: Auth | null = null
  let unsubscribe: (() => void) | undefined
  let initPromise: Promise<void> | undefined

  async function init(): Promise<void> {
    unsubscribe?.()
    unsubscribe = undefined
    status.value = 'loading'
    error.value = null

    try {
      const authInstance = await getFirebaseAuth()
      if (!active) return
      auth = authInstance

      unsubscribe = await subscribeToAuth(authInstance, (firebaseUser) => {
        if (!active) return
        if (!firebaseUser) {
          user.value = null
          status.value = 'guest'
          return
        }

        const sessionUser = toGoogleSessionUser(firebaseUser)
        if (!sessionUser) {
          user.value = null
          status.value = 'error'
          error.value = 'email-missing'
          return
        }

        user.value = sessionUser
        status.value = 'ready'
      })

      // Completes a redirect-based sign-in. Errors are surfaced without
      // blocking the auth-state callback that carries the actual user.
      try {
        await completeRedirectSignIn(authInstance)
      } catch (cause) {
        if (active) error.value = authErrorKey(cause)
      }
    } catch (cause) {
      if (!active) return
      user.value = null
      status.value = 'error'
      error.value = authErrorKey(cause)
    }
  }

  function ensureInit(): Promise<void> {
    initPromise ??= init()
    return initPromise
  }

  async function signIn(): Promise<void> {
    await ensureInit()
    if (!auth || busy.value) return

    busy.value = true
    error.value = null
    try {
      // Popup success is reflected by the auth-state subscription. A redirect
      // navigates away, so the finally block is only reached on cancel/error.
      await signInWithGoogle(auth)
    } catch (cause) {
      error.value = authErrorKey(cause)
    } finally {
      busy.value = false
    }
  }

  async function signOut(): Promise<void> {
    if (!auth || busy.value) return

    busy.value = true
    error.value = null
    try {
      await signOutOfGoogle(auth)
    } catch (cause) {
      error.value = authErrorKey(cause)
    } finally {
      busy.value = false
    }
  }

  async function retry(): Promise<void> {
    initPromise = undefined
    await ensureInit()
  }

  onMounted(() => {
    void ensureInit()
  })

  onBeforeUnmount(() => {
    active = false
    unsubscribe?.()
  })

  return { status, user, error, busy, signIn, signOut, retry }
}
