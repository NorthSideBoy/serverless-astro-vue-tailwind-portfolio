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
})
