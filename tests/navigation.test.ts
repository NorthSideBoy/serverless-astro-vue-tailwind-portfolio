import { describe, expect, it } from 'vitest'
import { toHref } from '../src/router/astroRouter'

describe('links between Astro pages and Vue islands', () => {
  it('localizes both named routes and article links', () => {
    expect(toHref({ name: 'projects', hash: '#project-example' }, 'en', '/en/'))
      .toBe('/en/proyectos#project-example')
    expect(toHref('/blog/example', 'en', '/en/')).toBe('/en/blog/example')
  })

  it('preserves native fragments and the Spanish root', () => {
    expect(toHref('#contact', 'en', '/en/')).toBe('/en/#contact')
    expect(toHref({ name: 'home', hash: '#experience' }, 'es', '/proyectos'))
      .toBe('/#experience')
  })
})
