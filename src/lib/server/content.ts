import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { getFirestore } from 'firebase-admin/firestore'
import { hasMediaPrefix } from '@/data/mediaPaths'
import { sortReviewDocuments } from '@/data/reviews'
import { validateContentGraph, type ContentGraph } from '@/data/schemas/graph'
import { parseCollection, type CollectionName } from '@/data/schemas/registry'
import {
  toArticle, toCertification, toEducation, toExperience, toProject, toPublicTestimonial, toSiteSections,
} from '@/data/mappers'
import { getMediaBaseUrl } from './cloudflare'
import { getFirebaseApp } from './firebase'
import { loadFixtureContent } from './fixtures'

type CollectionConfig = {
  name: CollectionName
  approvedOnly?: boolean
  optional?: boolean
}

const collections = [
  { name: 'siteSections' },
  { name: 'authors' },
  { name: 'stackGroups' },
  { name: 'technologies' },
  { name: 'experience' },
  { name: 'projects' },
  { name: 'education' },
  { name: 'certifications' },
  { name: 'articles' },
  { name: 'reviews', approvedOnly: true, optional: true },
] as const satisfies readonly CollectionConfig[]

const reservedMediaDirectories = ['images', 'files'] as const

function assertNoLocalMediaDirectories() {
  for (const directory of reservedMediaDirectories) {
    const path = resolve(process.cwd(), 'public', directory)
    if (!existsSync(path)) continue

    throw new Error(
      `public/${directory} is reserved for dynamic media served from Cloudflare R2. ` +
        'Keep static assets in src/assets or a non-reserved public path.',
    )
  }
}

async function fetchRaw({ name, approvedOnly, optional }: CollectionConfig): Promise<unknown[]> {
  const collection = getFirestore(getFirebaseApp(), '(default)').collection(name)
  const snapshot = approvedOnly
    ? await collection.where('approved', '==', true).get()
    : await collection.get()

  if (snapshot.empty && !optional) {
    throw new Error(`Firestore collection ${name} is empty; refusing to publish an incomplete site`)
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    if (data.id !== doc.id) throw new Error(`${name}/${doc.id}: document id does not match data.id`)
    return data
  })
}

function resolveMedia(value: unknown, base: string): unknown {
  if (typeof value === 'string') return hasMediaPrefix(value) ? base + value : value
  if (Array.isArray(value)) return value.map((item) => resolveMedia(item, base))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveMedia(item, base)]),
    )
  }
  return value
}

function assertNoUnresolvedMedia(value: unknown): void {
  if (typeof value === 'string') {
    if (hasMediaPrefix(value)) {
      throw new Error(
        `Unresolved media path "${value}". Dynamic media must be served from Cloudflare R2 via PUBLIC_MEDIA_URL.`,
      )
    }
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnresolvedMedia(item)
    return
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) assertNoUnresolvedMedia(item)
  }
}

async function readContent() {
  assertNoLocalMediaDirectories()
  const base = getMediaBaseUrl()

  const raw = await Promise.all(collections.map(fetchRaw))
  const byName = Object.fromEntries(
    collections.map((collection, index) => [collection.name, raw[index]]),
  )
  const graph: ContentGraph = {
    siteSections: parseCollection('siteSections', byName.siteSections),
    authors: parseCollection('authors', byName.authors),
    stackGroups: parseCollection('stackGroups', byName.stackGroups),
    technologies: parseCollection('technologies', byName.technologies),
    experience: parseCollection('experience', byName.experience),
    projects: parseCollection('projects', byName.projects),
    education: parseCollection('education', byName.education),
    certifications: parseCollection('certifications', byName.certifications),
    articles: parseCollection('articles', byName.articles),
    reviews: parseCollection('reviews', byName.reviews),
  }
  const issues = validateContentGraph(graph)
  if (issues.length) throw new Error(`Content graph is invalid:\n${issues.join('\n')}`)

  const sort = <T extends { order: number }>(items: T[]) => [...items].sort((a, b) => a.order - b.order)
  const contentModel = {
    sections: toSiteSections(graph.siteSections),
    groups: sort(graph.stackGroups),
    technologies: sort(graph.technologies),
    experience: sort(graph.experience).map((item) => toExperience(item, graph.technologies)),
    projects: sort(graph.projects).map((item) => toProject(item, graph.technologies)),
    education: sort(graph.education).map(toEducation),
    certifications: sort(graph.certifications).map(toCertification),
    articles: sort(graph.articles).filter((item) => item.status === 'published').map((item) => toArticle(item, graph.authors)),
    reviews: sortReviewDocuments(graph.reviews).map(toPublicTestimonial),
  }

  // Firestore stores R2 object paths (/images/... and /files/...). The build
  // resolves them through the public media domain without exposing S3 credentials.
  const model = resolveMedia(contentModel, base) as typeof contentModel
  assertNoUnresolvedMedia(model)
  return model
}

// All current routes are prerendered. Reuse one validated snapshot for an
// entire production build, including both locales and getStaticPaths(). In
// development, always read fresh content. Replace this cache before adding
// on-demand SSR routes so content cannot become stale across requests.
let buildContent: Promise<Awaited<ReturnType<typeof readContent>>> | undefined

export function loadContent() {
  if (process.env.CONTENT_SOURCE === 'fixture') return loadFixtureContent()
  if (!import.meta.env.PROD) return readContent()
  return buildContent ??= readContent().catch((error: unknown) => {
    buildContent = undefined
    throw error
  })
}
