import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { chromium, type Browser, type Page } from 'playwright'

let server: ChildProcess
let browser: Browser
const base = 'http://127.0.0.1:4323'
const deepLink = 'project-mvc-boilerplate'

beforeAll(async () => {
  server = spawn('node', ['--env-file-if-exists=.env', './node_modules/.bin/astro', 'preview', '--host', '127.0.0.1', '--port', '4323'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('preview server did not start')), 20_000)
    server.stdout?.on('data', (chunk: Buffer) => {
      if (!chunk.toString().includes('Preview server running')) return
      clearTimeout(timeout)
      resolve()
    })
    server.once('exit', (code) => reject(new Error(`preview exited with ${code}`)))
  })
  browser = await chromium.launch()
}, 30_000)

afterAll(async () => {
  await browser?.close()
  server?.kill()
})

async function openPage(options: { javaScriptEnabled?: boolean; viewport?: { width: number; height: number } } = {}) {
  const page = await browser.newPage(options)
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1') return route.continue()
    return route.abort()
  })
  return page
}

async function goto(page: Page, path: string) {
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' })
}

async function waitForHydration(page: Page) {
  await page.waitForSelector('astro-island[client="load"]:not([ssr])', { state: 'attached' })
}

describe('rendered portfolio', () => {
  it('serves article content and project cards before Vue hydrates', async () => {
    const page = await openPage({ javaScriptEnabled: false })
    await goto(page, '/blog/fixture-article/')
    expect(await page.locator('.article-body h2').first().textContent()).toContain('Introducción')
    expect(await page.locator('a[href^="#fn-"]').count()).toBeGreaterThan(0)
    expect(await page.locator('a[href="https://example.com"]').count()).toBeGreaterThan(0)
    expect(await page.locator('.article-body blockquote').count()).toBe(1)
    expect(await page.locator('.article-body ol li').count()).toBeGreaterThan(1)
    expect(await page.locator('.article-body pre code').count()).toBe(1)
    expect(await page.locator('.article-gallery figure').count()).toBe(2)
    expect(await page.locator('.article-body table').count()).toBe(1)
    expect(await page.locator('.article-body iframe[title="Vídeo de prueba"]').count()).toBe(1)
    expect(await page.locator('.article-body a[download]').count()).toBe(1)
    expect(await page.content()).not.toContain('sample@example.com')
    await goto(page, '/proyectos/')
    expect(await page.locator('[data-project-card]').count()).toBeGreaterThan(1)
    expect(await page.locator('#projects-grid a[href^="https://"]').count()).toBeGreaterThan(0)
    await page.close()
  })

  it('filters project cards with the keyboard and restores a deep-linked card', async () => {
    const page = await openPage()
    await goto(page, `/proyectos/#${deepLink}`)
    await waitForHydration(page)
    await page.waitForSelector(`#${deepLink}`, { state: 'visible' })
    expect(await page.evaluate(() => document.activeElement?.id)).toBe(deepLink)
    const collaborations = page.locator('button[aria-controls="projects-grid"]').nth(2)
    await collaborations.focus()
    await collaborations.press('Enter')
    expect(await collaborations.getAttribute('aria-pressed')).toBe('true')
    expect(await page.locator('[data-project-card][hidden]').count()).toBe(1)
    expect(await page.locator('[data-project-card]:visible').count()).toBe(1)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    await page.waitForSelector(`#${deepLink}`, { state: 'visible' })
    await page.close()
  })

  it('shares the theme across independent islands and persists it', async () => {
    const page = await openPage()
    await goto(page, '/')
    await waitForHydration(page)
    const toggle = page.locator('header [data-theme-toggle]').first()
    const before = await page.evaluate(() => document.documentElement.dataset.theme)
    await toggle.click()
    const after = before === 'dark' ? 'light' : 'dark'
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe(after)
    expect(await page.evaluate(() => localStorage.getItem('sl-theme'))).toBe(after)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForHydration(page)
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(after)
    await page.close()
  })


  it('keeps static home sections readable without Vue and exposes one skip link target', async () => {
    const page = await openPage({ javaScriptEnabled: false })
    await goto(page, '/')
    expect(await page.locator('#about h2').count()).toBe(1)
    expect(await page.locator('#services article').count()).toBeGreaterThan(2)
    expect(await page.locator('#stack a[href^="https://"]').count()).toBeGreaterThan(0)
    expect(await page.locator('#experience article').count()).toBeGreaterThan(0)
    expect(await page.locator('#education article').count()).toBeGreaterThan(0)
    expect(await page.locator('#certifications article').count()).toBeGreaterThan(0)
    expect(await page.locator('#blog [data-blog-card]').count()).toBeGreaterThan(0)
    expect(await page.locator('main#main').count()).toBe(1)
    expect(await page.locator('a.skip-link[href="#main"]').count()).toBe(1)
    await page.close()
  })

  it('moves focus with the keyboard through the skip link and menu control', async () => {
    const page = await openPage({ viewport: { width: 390, height: 844 } })
    await goto(page, '/')
    await waitForHydration(page)
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement?.className)).toContain('skip-link')
    await page.keyboard.press('Enter')
    expect(await page.evaluate(() => window.location.hash)).toBe('#main')
    const menu = page.locator('header button[aria-controls="mobile-menu"]')
    await menu.focus()
    await menu.press('Enter')
    expect(await menu.getAttribute('aria-expanded')).toBe('true')
    await page.keyboard.press('Escape')
    expect(await menu.getAttribute('aria-expanded')).toBe('false')
    await page.close()
  })

  it('keeps alternate locales, one heading and locale links in the rendered article', async () => {
    const page = await openPage()
    await goto(page, '/en/blog/fixture-article/#intro')
    expect(await page.locator('html').getAttribute('lang')).toBe('en')
    expect(await page.locator('link[rel="alternate"][hreflang="es"]').count()).toBe(1)
    expect(await page.locator('main#main').count()).toBe(1)
    expect(await page.locator('h1').count()).toBe(1)
    await waitForHydration(page)
    const spanish = page.locator('header [data-locale-link][href="/blog/fixture-article/#intro"]').first()
    await spanish.click()
    await page.waitForURL(`${base}/blog/fixture-article/#intro`)
    expect(await page.locator('html').getAttribute('lang')).toBe('es')
    expect(await page.evaluate(() => window.location.hash)).toBe('#intro')
    await page.close()
  })
})
