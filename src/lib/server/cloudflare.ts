export function getMediaBaseUrl(): string {
  const base = process.env.PUBLIC_MEDIA_URL?.trim().replace(/\/+$/, '')
  if (!base) {
    throw new Error(
      'PUBLIC_MEDIA_URL is required: dynamic Firestore media is served from Cloudflare R2',
    )
  }
  if (!base.startsWith('https://')) throw new Error('PUBLIC_MEDIA_URL must use HTTPS')
  return base
}
