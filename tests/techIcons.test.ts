import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  resolveTechnologyIcon,
  resolveTechnologyIconPath,
  verifyCustomIconUrl,
} from '../src/lib/server/techIcons'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('technology icon resolver', () => {
  it('resolves exact and prefixed Simple Icons slugs', () => {
    expect(resolveTechnologyIcon('typescript')?.slug).toBe('typescript')
    expect(resolveTechnologyIcon('tailwind')?.slug).toBe('tailwindcss')
    expect(resolveTechnologyIcon('typescript')?.score).toBe(0)
    expect(resolveTechnologyIcon('tailwind')?.score).toBe(2)
  })

  it('normalizes case, accents and separators', () => {
    expect(resolveTechnologyIcon('Vue.js')?.slug).toBe('vuedotjs')
    expect(resolveTechnologyIcon('socket.io')?.slug).toBe('socketdotio')
  })

  it('returns null for unknown keys', () => {
    expect(resolveTechnologyIcon('definitely-not-a-tech')).toBeNull()
    expect(resolveTechnologyIcon(undefined)).toBeNull()
    expect(resolveTechnologyIconPath(undefined)).toBeNull()
  })

  it('returns a non-empty path for a known technology', () => {
    expect(resolveTechnologyIconPath('astro')?.length).toBeGreaterThan(10)
  })

  it('rejects an unavailable custom icon', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })))
    await expect(verifyCustomIconUrl('https://example.test/missing.svg')).resolves.toBe(false)
  })
})
