/**
 * Public Firebase web configuration. These values are not secrets; they are
 * shipped in the browser bundle. Server credentials stay in `src/lib/server`.
 */
export type FirebasePublicConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
}

function readPublicEnv(): Record<string, string | undefined> {
  return import.meta.env as unknown as Record<string, string | undefined>
}

const env = readPublicEnv()

const firebaseConfig: FirebasePublicConfig = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: env.PUBLIC_FIREBASE_APP_ID ?? '',
}

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missing.length) {
  throw new Error(
    `Missing public Firebase configuration: ${missing.join(', ')}. ` +
      'Set PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, ' +
      'PUBLIC_FIREBASE_PROJECT_ID and PUBLIC_FIREBASE_APP_ID.',
  )
}

export { firebaseConfig }
