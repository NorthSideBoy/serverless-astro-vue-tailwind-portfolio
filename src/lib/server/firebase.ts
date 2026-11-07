import {
  applicationDefault, cert, getApps, initializeApp, type App, type Credential,
} from 'firebase-admin/app'

const DEFAULT_PROJECT_ID = 'northsideboy-portfolio'

// Environment files usually store PEM newlines as escaped "\n" sequences.
function readPrivateKey(): string | undefined {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

function credentialFromEnv(projectId: string): Credential | null {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = readPrivateKey()

  if (!clientEmail && !privateKey) return null

  if (!clientEmail || !privateKey) {
    throw new Error(
      'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set together, or neither to use Application Default Credentials',
    )
  }

  return cert({ projectId, clientEmail, privateKey })
}

export function getFirebaseApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const projectId = process.env.FIREBASE_PROJECT_ID ?? DEFAULT_PROJECT_ID
  const credential = credentialFromEnv(projectId) ?? applicationDefault()

  return initializeApp({ credential, projectId })
}
