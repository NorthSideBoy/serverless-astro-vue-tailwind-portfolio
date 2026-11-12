import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sitemapEntries } from '../src/lib/sitemap'

const here = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(here, '../src')
const componentsDir = path.join(srcDir, 'components')
const islandsDir = path.join(componentsDir, 'islands')

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function importsOf(file: string): string[] {
  const source = fs.readFileSync(file, 'utf8')
  return [...source.matchAll(/\b(?:from\s+|import\s+)(['"])([^'"]+)\1/g)].map((match) => match[2])
}

function resolveImport(file: string, specifier: string): string | null {
  if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return null
  const base = specifier.startsWith('@/')
    ? path.join(srcDir, specifier.slice(2))
    : path.resolve(path.dirname(file), specifier)
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.astro`,
    `${base}.vue`,
    path.join(base, 'index.ts'),
  ]
  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile()
    } catch {
      return false
    }
  }) ?? null
}

function isInside(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

describe('component architecture', () => {
  const files = walk(srcDir).filter((file) => /\.(astro|vue|ts)$/.test(file))

  it('keeps every Astro to Vue import behind the islands boundary', () => {
    const violations: string[] = []
    for (const file of files.filter((entry) => entry.endsWith('.astro'))) {
      for (const specifier of importsOf(file)) {
        const target = resolveImport(file, specifier)
        if (target?.endsWith('.vue') && !isInside(islandsDir, target)) {
          violations.push(`${path.relative(srcDir, file)} -> ${specifier}`)
        }
      }
    }
    expect(violations, 'Astro may only import Vue components from components/islands/').toEqual([])
  })

  it('never imports an Astro component from Vue', () => {
    const violations: string[] = []
    for (const file of files.filter((entry) => entry.endsWith('.vue'))) {
      for (const specifier of importsOf(file)) {
        const target = resolveImport(file, specifier)
        if (target?.endsWith('.astro')) {
          violations.push(`${path.relative(srcDir, file)} -> ${specifier}`)
        }
      }
    }
    expect(violations, 'Vue components must not import Astro components').toEqual([])
  })

  it('keeps the components root free of loose component files', () => {
    const loose = fs.readdirSync(componentsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name !== 'README.md')
      .map((entry) => entry.name)
    expect(loose).toEqual([])
  })

  it('renders local home content in Astro and Firestore content through Vue', () => {
    const home = fs.readFileSync(path.join(componentsDir, 'home/astro/HomePage.astro'), 'utf8')
    for (const name of ['HeroSection', 'StatsSection', 'SkillsSection']) {
      expect(home).toContain(`./${name}.astro`)
      expect(home).not.toMatch(
        new RegExp(
          `<${name === 'HeroSection' ? 'Hero' : name === 'StatsSection' ? 'Stats' : 'Skills'}[^>]*client:`,
        ),
      )
    }
    expect(home).toContain('components/islands/home/ContactIsland.vue')
    expect(home).toMatch(/<Contact[^>]*client:visible/)
    expect(fs.existsSync(path.join(componentsDir, 'home/astro/ContactSection.astro'))).toBe(false)
    expect(fs.existsSync(path.join(componentsDir, 'home/vue/ContactSection.vue'))).toBe(true)
    for (const name of ['StackContent', 'ExperienceContent', 'EducationContent', 'CertificationsContent']) {
      expect(home).toContain(`components/islands/home/${name}.vue`)
    }
    expect(home).toContain('components/islands/blog/BlogContent.vue')
    for (const name of ['StackSection', 'ExperienceSection', 'EducationSection', 'CertificationsSection']) {
      expect(fs.existsSync(path.join(componentsDir, `home/astro/${name}.astro`))).toBe(false)
    }
  })

  it('keeps Firestore articles and indexes server-rendered by Vue without hydration', () => {
    const pages = [
      ['blog/astro/BlogPage.astro', 'BlogIndexContent'],
      ['blog/astro/ArticlePage.astro', 'ArticleContent'],
    ] as const
    for (const [page, component] of pages) {
      const source = fs.readFileSync(path.join(componentsDir, page), 'utf8')
      expect(source).toContain(`components/islands/blog/${component}.vue`)
      expect(source).not.toMatch(new RegExp(`<${component === 'ArticleContent' ? 'ArticleView' : 'BlogBody'}[^>]*client:`))
    }
    const projects = fs.readFileSync(path.join(componentsDir, 'projects/astro/ProjectsPage.astro'), 'utf8')
    expect(projects).toContain('components/islands/projects/ProjectsIndexIsland.vue')
    expect(projects).toMatch(/<ProjectsIndex[^>]*client:load/)
    const reviews = fs.readFileSync(path.join(componentsDir, 'home/vue/TestimonialsSection.vue'), 'utf8')
    expect(reviews).toContain('v-for="(review, index) in items"')
    expect(reviews).toContain(':hidden="!showAll && index >= initialCount"')
    expect(reviews).toContain('components/reviews/vue/ReviewCard.vue')
  })

  it('routes review pages through islands and keeps them out of search', () => {
    const access = fs.readFileSync(
      path.join(componentsDir, 'reviews/astro/ReviewsAccessPage.astro'),
      'utf8',
    )
    const panel = fs.readFileSync(
      path.join(componentsDir, 'reviews/astro/ReviewPanelPage.astro'),
      'utf8',
    )

    expect(access).toContain('components/islands/reviews/ReviewsAccessIsland.vue')
    expect(panel).toContain('components/islands/reviews/ReviewPanelIsland.vue')
    expect(access).toContain('indexable={false}')
    expect(panel).toContain('indexable={false}')

    const entries = sitemapEntries({
      site: new URL('https://example.test'),
      articles: [],
    })
    expect(entries.some((entry) => entry.loc.includes('/resenas/'))).toBe(false)
    expect(entries.some((entry) => entry.loc.includes('/reviews/'))).toBe(false)
  })

  it('keeps the Firebase web SDK out of the public content features', () => {
    const publicFeatures = ['home', 'projects', 'blog'].flatMap((feature) =>
      walk(path.join(componentsDir, feature)),
    )
    const violations = publicFeatures.filter((file) =>
      importsOf(file).some(
        (specifier) =>
          specifier === 'firebase' ||
          specifier.startsWith('firebase/') ||
          specifier.startsWith('@/lib/firebase'),
      ),
    )
    expect(violations.map((file) => path.relative(srcDir, file))).toEqual([])
  })

  it('keeps EmailJS out of the initial bundle of the public content features', () => {
    const publicFeatures = ['home', 'projects', 'blog'].flatMap((feature) =>
      walk(path.join(componentsDir, feature)),
    )
    const violations = publicFeatures.filter((file) =>
      importsOf(file).some(
        (specifier) =>
          specifier === '@emailjs/browser' ||
          specifier.startsWith('@/lib/notifications'),
      ),
    )
    expect(violations.map((file) => path.relative(srcDir, file))).toEqual([])
  })

  it('loads the contact Firebase SDK only after an explicit submit', () => {
    const form = fs.readFileSync(path.join(componentsDir, 'home/vue/ContactForm.vue'), 'utf8')
    const staticImports = importsOf(path.join(componentsDir, 'home/vue/ContactForm.vue'))

    expect(
      staticImports.filter(
        (specifier) =>
          specifier === 'firebase' ||
          specifier.startsWith('firebase/') ||
          specifier.startsWith('@/lib/firebase') ||
          specifier.startsWith('@/lib/forms'),
      ),
    ).toEqual([])
    expect(staticImports).toContain('@/composables/useGoogleSession')
    expect(form).toContain("import('@/lib/forms/repository')")
    expect(form).toContain("import('@/lib/firebase/client')")
  })

  it('shares one Google session between the contact form and the reviews', () => {
    for (const relative of [
      'home/vue/ContactForm.vue',
      'reviews/vue/ReviewAccess.vue',
      'reviews/vue/ReviewPanel.vue',
    ]) {
      const source = fs.readFileSync(path.join(componentsDir, relative), 'utf8')
      expect(source).toContain("from '@/composables/useGoogleSession'")
    }
  })

  it('never imports firebase-admin from client-facing review code', () => {
    const clientFiles = [
      ...walk(path.join(componentsDir, 'reviews')),
      ...walk(path.join(srcDir, 'lib/reviews')),
      ...walk(path.join(srcDir, 'lib/firebase')),
      path.join(srcDir, 'composables/useGoogleSession.ts'),
      path.join(srcDir, 'composables/useReviewDraft.ts'),
      path.join(srcDir, 'composables/useReviewSubmission.ts'),
    ]
    const violations = clientFiles.filter((file) =>
      importsOf(file).some((specifier) => specifier === 'firebase-admin' || specifier.startsWith('firebase-admin/')),
    )
    expect(violations.map((file) => path.relative(srcDir, file))).toEqual([])
  })

  it('keeps the review locale silent and inherited from the portfolio', () => {
    const panel = fs.readFileSync(
      path.join(componentsDir, 'reviews/vue/ReviewPanel.vue'),
      'utf8',
    )
    const draft = fs.readFileSync(
      path.join(srcDir, 'composables/useReviewDraft.ts'),
      'utf8',
    )
    const card = fs.readFileSync(
      path.join(componentsDir, 'reviews/vue/ReviewCard.vue'),
      'utf8',
    )

    expect(panel).not.toContain('draft.locale =')
    expect(panel).not.toContain('languageLabel')
    expect(draft).toContain('locale: options.locale')
    expect(card).not.toContain('review.locale.toUpperCase()')
  })

  it('renders publication errors next to the publish action', () => {
    const panel = fs.readFileSync(
      path.join(componentsDir, 'reviews/vue/ReviewPanel.vue'),
      'utf8',
    )
    const publishSection = panel.indexOf('copy.reviews.panel.sections.publish')
    const errorBlock = panel.indexOf('id="review-publish-error"')

    expect(publishSection).toBeGreaterThan(-1)
    expect(errorBlock).toBeGreaterThan(publishSection)
    expect(panel).toContain("alert?.focus({ preventScroll: true })")
    expect(panel).toContain('scrollIntoView')
  })

  it('keeps the server-only technology resolver out of Vue components', () => {
    const violations = files
      .filter((file) => file.endsWith('.vue'))
      .filter((file) =>
        importsOf(file).some((specifier) => specifier === '@/lib/server/techIcons'),
      )
    expect(violations.map((file) => path.relative(srcDir, file))).toEqual([])
  })

  it('keeps simple-icons imports in the brand module and the server resolver', () => {
    const allowed = new Set([
      path.join(componentsDir, 'ui/brand-icons.ts'),
      path.join(srcDir, 'lib/server/techIcons.ts'),
    ])
    const violations = files
      .filter((file) => !allowed.has(file))
      .filter((file) =>
        importsOf(file).some(
          (specifier) => specifier === 'simple-icons' || specifier.startsWith('simple-icons/'),
        ),
      )
    expect(violations.map((file) => path.relative(srcDir, file))).toEqual([])
  })

  it('keeps Lucide framework packages in their render layer', () => {
    const astroViolations = files
      .filter((file) => file.endsWith('.astro'))
      .filter((file) => importsOf(file).some((specifier) => specifier === '@lucide/vue'))
    const vueViolations = files
      .filter((file) => file.endsWith('.vue'))
      .filter((file) => importsOf(file).some((specifier) => specifier === '@lucide/astro'))
    expect([
      ...astroViolations.map((file) => path.relative(srcDir, file)),
      ...vueViolations.map((file) => path.relative(srcDir, file)),
    ]).toEqual([])
  })

  it('keeps icon primitives free of raw HTML injection', () => {
    for (const file of [
      path.join(componentsDir, 'ui/astro/UiIcon.astro'),
      path.join(componentsDir, 'ui/vue/UiIcon.vue'),
      path.join(componentsDir, 'ui/vue/TechIcon.vue'),
    ]) {
      const source = fs.readFileSync(file, 'utf8')
      expect(source).not.toMatch(/\bset:html\b|\bv-html\b/)
    }
  })

  it('wraps every hydrated island entry with withIslandContext', () => {
    const entries = walk(islandsDir).filter((file) => file.endsWith('Island.vue'))
    const violations = entries.filter(
      (file) => !fs.readFileSync(file, 'utf8').includes('withIslandContext'),
    )
    expect(violations.map((file) => path.relative(srcDir, file))).toEqual([])
  })
})
