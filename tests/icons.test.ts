import { describe, expect, it } from 'vitest'
import { brandIconNames, uiIconNames } from '../src/components/ui/icon-names'
import { brandIcons, isBrandIcon } from '../src/components/ui/brand-icons'
import { uiIconComponents } from '../src/components/ui/vue/icon-map'
import { technologySchema } from '../src/data/schemas/technology'

describe('icon vocabulary', () => {
  it('keeps the UI icon names unique', () => {
    expect(new Set(uiIconNames).size).toBe(uiIconNames.length)
  })

  it('exposes every UI icon through the Vue map', () => {
    expect(Object.keys(uiIconComponents).sort()).toEqual([...uiIconNames].sort())
  })

  it('keeps brand icons separate from UI icons', () => {
    expect([...brandIconNames].sort()).toEqual(Object.keys(brandIcons).sort())

    for (const name of brandIconNames) {
      expect(isBrandIcon(name)).toBe(true)
      expect(uiIconComponents).not.toHaveProperty(name)
    }

    for (const name of uiIconNames) {
      expect(isBrandIcon(name)).toBe(false)
    }
  })

  it('renders non-empty brand paths', () => {
    expect(brandIcons.google.length).toBeGreaterThan(10)

    for (const path of Object.values(brandIcons)) {
      expect(path.length).toBeGreaterThan(10)
      expect(path).not.toContain('<')
    }
  })
})

describe('technology icon schema', () => {
  const baseTechnology = {
    id: 'fixture-tech',
    name: 'Fixture Tech',
    tag: { es: 'Tecnología', en: 'Technology' },
    href: 'https://example.com',
    hoverColor: { dark: '#123456', light: '#123456' },
    stackGroupId: 'backend',
    order: 0,
    type: 'technology' as const,
  }

  it('accepts a custom SVG path for a stack technology', () => {
    expect(
      technologySchema.safeParse({
        ...baseTechnology,
        customIcon: '/images/tech-icons/example.svg',
      }).success,
    ).toBe(true)
  })

  it('rejects a non-SVG custom icon', () => {
    expect(
      technologySchema.safeParse({
        ...baseTechnology,
        customIcon: '/images/tech-icons/example.png',
      }).success,
    ).toBe(false)
  })

  it('requires an icon key or a custom SVG for stack technologies', () => {
    expect(technologySchema.safeParse(baseTechnology).success).toBe(false)
  })

  it('rejects a custom icon on a non-stack technology', () => {
    expect(
      technologySchema.safeParse({
        ...baseTechnology,
        stackGroupId: null,
        hoverColor: undefined,
        customIcon: '/images/tech-icons/example.svg',
      }).success,
    ).toBe(false)
  })
})
