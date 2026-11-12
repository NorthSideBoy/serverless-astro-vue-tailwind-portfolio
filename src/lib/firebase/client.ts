import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore/lite'
import { firebaseConfig } from './config'

/**
 * The Firebase web SDK is browser-only. Every entry point is a dynamic import
 * so the SDK never executes during Astro's SSR pass and only reaches the
 * review routes and the contact form after an explicit visitor action.
 */
let appPromise: Promise<FirebaseApp> | undefined
let authPromise: Promise<Auth> | undefined
let dbPromise: Promise<Firestore> | undefined

async function getClientApp(): Promise<FirebaseApp> {
  appPromise ??= (async () => {
    const { getApps, initializeApp } = await import('firebase/app')
    return getApps()[0] ?? initializeApp(firebaseConfig)
  })()

  return appPromise
}

export async function getFirebaseAuth(): Promise<Auth> {
  authPromise ??= (async () => {
    const { getAuth } = await import('firebase/auth')
    return getAuth(await getClientApp())
  })()

  return authPromise
}

export async function getFirestoreDatabase(): Promise<Firestore> {
  dbPromise ??= (async () => {
    const { getFirestore } = await import('firebase/firestore/lite')
    return getFirestore(await getClientApp())
  })()

  return dbPromise
}
