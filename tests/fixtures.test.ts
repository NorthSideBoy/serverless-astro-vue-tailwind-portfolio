import { describe, expect, it } from 'vitest'
import { loadFixtureContent } from '../src/lib/server/fixtures'
import { collectionSchemas } from '../src/data/schemas/registry'
import { fixtureDocuments } from '../src/lib/server/fixtures'

describe('fixture content', () => {
  it('validates every collection', () => {
    for (const [name, schema] of Object.entries(collectionSchemas)) {
      const result = schema.safeParse(fixtureDocuments[name as keyof typeof fixtureDocuments])
      if (!result.success) throw new Error(`${name}: ${JSON.stringify(result.error.issues, null, 2)}`)
    }
    expect(() => loadFixtureContent()).not.toThrow()
  })
})
