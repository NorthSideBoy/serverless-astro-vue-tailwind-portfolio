import * as simpleIcons from 'simple-icons'

// Simple Icons is CC0; the marks themselves are trademarks of their owners.

type IconData = {
  slug: string
  title: string
  path: string
}

export type TechnologyIconMatch = IconData & {
  /** 0 exact slug, 1 exact title, 2+ fuzzy prefix/substring. */
  score: number
}

function isIconData(value: unknown): value is IconData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    typeof value.slug === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'path' in value &&
    typeof value.path === 'string'
  )
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const icons = Object.values(simpleIcons).filter(isIconData)
const cache = new Map<string, TechnologyIconMatch | null>()
const customIconChecks = new Map<string, Promise<boolean>>()

function score(icon: IconData, query: string): number {
  const slug = normalize(icon.slug)
  const title = normalize(icon.title)

  if (slug === query) return 0
  if (title === query) return 1
  if (slug.startsWith(query)) return 2
  if (title.startsWith(query)) return 3
  if (slug.includes(query)) return 4
  if (title.includes(query)) return 5
  return -1
}

/** Stable ordering: score, then title and slug by code point, never by ICU locale. */
function compareMatches(
  a: { icon: IconData; score: number },
  b: { icon: IconData; score: number },
): number {
  if (a.score !== b.score) return a.score - b.score
  if (a.icon.title < b.icon.title) return -1
  if (a.icon.title > b.icon.title) return 1
  if (a.icon.slug < b.icon.slug) return -1
  if (a.icon.slug > b.icon.slug) return 1
  return 0
}

/**
 * Resolve a technology `icon` key against Simple Icons.
 *
 * There are no per-key aliases. Ambiguous or missing marks belong in
 * Firestore as `customIcon`, not as an exception in this module.
 */
export function resolveTechnologyIcon(key: string | undefined): TechnologyIconMatch | null {
  if (!key) return null

  const query = normalize(key)
  if (!query) return null

  const cached = cache.get(query)
  if (cached !== undefined) return cached

  const best = icons
    .map((icon) => ({ icon, score: score(icon, query) }))
    .filter((entry) => entry.score >= 0)
    .sort(compareMatches)[0]

  const match = best ? { ...best.icon, score: best.score } : null
  cache.set(query, match)
  return match
}

export function resolveTechnologyIconPath(key: string | undefined): string | null {
  return resolveTechnologyIcon(key)?.path ?? null
}

/**
 * Build-time guard for custom technology icons. A missing R2 object, a
 * non-SVG response or a network failure returns `false` so the build can fall
 * back to the generic icon instead of rendering an empty mask.
 *
 * The cache prevents duplicate HEAD requests for the same URL.
 */
export function verifyCustomIconUrl(url: string): Promise<boolean> {
  const cached = customIconChecks.get(url)
  if (cached) return cached

  const check = fetch(url, {
    method: 'HEAD',
    signal: AbortSignal.timeout(5_000),
  })
    .then(
      (response) =>
        response.ok &&
        response.headers.get('content-type')?.toLowerCase().includes('image/svg+xml') === true,
    )
    .catch(() => false)

  customIconChecks.set(url, check)
  return check
}
