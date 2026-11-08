import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
    for (const name of ['HeroSection', 'StatsSection', 'SkillsSection', 'ContactSection']) {
      expect(home).toContain(`./${name}.astro`)
      expect(home).not.toMatch(new RegExp(`<${name === 'HeroSection' ? 'Hero' : name === 'StatsSection' ? 'Stats' : name === 'SkillsSection' ? 'Skills' : 'Contact'}[^>]*client:`))
    }
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
    expect(reviews).toContain('v-for="(review, index) in reviews"')
    expect(reviews).toContain(':hidden="!showAll && index >= initialCount"')
  })
})
