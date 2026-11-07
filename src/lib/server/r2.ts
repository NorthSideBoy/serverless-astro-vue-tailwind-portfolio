// Server-only: never import this module from a client component or Vue island.
import { S3Client } from '@aws-sdk/client-s3'
import { isMediaPath, isSafeMediaPath } from '@/data/mediaPaths'

let client: S3Client | undefined

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required for R2 S3 operations`)
  return value
}

export function getR2Bucket(): string {
  return required('R2_BUCKET')
}

export function getR2Client(): S3Client {
  if (client) return client

  const accountId = required('R2_ACCOUNT_ID')

  client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required('R2_ACCESS_KEY_ID'),
      secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
    },
  })

  return client
}

export function toObjectKey(assetPath: string): string {
  if (!isMediaPath(assetPath) || !isSafeMediaPath(assetPath)) {
    throw new Error(`Expected a valid R2 media path under /images/ or /files/: ${assetPath}`)
  }

  return assetPath.slice(1)
}
