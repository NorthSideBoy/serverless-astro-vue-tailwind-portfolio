import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { chromium, type Browser, type Page } from 'playwright'
import { createServer } from 'node:net'

let server: ChildProcess
let browser: Browser
let base: string
const deepLink = 'project-mvc-boilerplate'

beforeAll(async () => {
  const port = await new Promise<number>((resolve, reject) => {
    const probe = createServer()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      probe.close(() => resolve(typeof address === 'object' && address ? address.port : 4323))
    })
  })
  base = `http://127.0.0.1:${port}`
  server = spawn('node', ['--env-file-if-exists=.env', './node_modules/.bin/astro', 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('preview server did not start')), 20_000)
    server.stdout?.on('data', (chunk: Buffer) => {
      if (!chunk.toString().includes(base)) return
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
  await page.route('**/images/tech-icons/fixture.svg', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"/></svg>',
    }),
  )
  return page
}

async function goto(page: Page, path: string) {
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' })
}

async function waitForHydration(page: Page) {
  await page.waitForSelector('astro-island[client="load"]:not([ssr])', { state: 'attached' })
}

async function waitForContactHydration(page: Page) {
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      page
        .locator('#contact')
        .evaluate((element) => !element.closest('astro-island')?.hasAttribute('ssr')),
    )
    .toBe(true)
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
    expect(await page.content()).not.toContain('andrea.rivas@example.com')
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
    const toggle = page.locator('header [data-theme-toggle]').first()
    const before = await page.evaluate(() => document.documentElement.dataset.theme)
    await toggle.click()
    const after = before === 'dark' ? 'light' : 'dark'
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe(after)
    expect(await page.evaluate(() => localStorage.getItem('sl-theme'))).toBe(after)
    await page.reload({ waitUntil: 'domcontentloaded' })
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(after)
    await page.close()
  })


  it('keeps static home sections readable without Vue and exposes one skip link target', async () => {
    const page = await openPage({ javaScriptEnabled: false })
    await goto(page, '/')
    expect(await page.locator('#about h2').count()).toBe(1)
    expect(await page.locator('#services article').count()).toBeGreaterThan(2)
    expect(await page.locator('#stack a[href^="https://"]').count()).toBeGreaterThan(0)
    expect(await page.locator('#stack [data-tech-icon="typescript"]').count()).toBe(1)
    expect(await page.locator('#stack [data-tech-icon="astro"]').count()).toBe(1)
    expect(await page.locator('#stack [data-tech-icon="fixture-custom"]').count()).toBe(1)
    expect(await page.locator('#experience article').count()).toBeGreaterThan(0)
    expect(await page.locator('#education article').count()).toBeGreaterThan(0)
    expect(await page.locator('#certifications article').count()).toBeGreaterThan(0)
    expect(await page.locator('#blog [data-blog-card]').count()).toBeGreaterThan(0)
    expect(await page.locator('#testimonials figure').count()).toBe(1)
    expect(await page.locator('#testimonials a[href="/resenas/"]').count()).toBe(1)
    expect(await page.locator('#testimonials a[href="/resenas/"]').textContent()).toContain(
      'Dejar una reseña',
    )
    expect(
      await page.locator('#testimonials a[href="mailto:andrea.rivas@example.com"]').count(),
    ).toBe(1)
    expect(await page.locator('#testimonials [data-review-google]').count()).toBe(1)
    expect(await page.locator('#testimonials').textContent()).toContain(
      'andrea.rivas@example.com',
    )
    expect(await page.locator('#top h1').count()).toBe(1)
    expect(await page.locator('#top .identity-plate[role="img"]').count()).toBe(1)
    expect(await page.locator('[data-scramble]').count()).toBeGreaterThan(0)
    expect(await page.locator('#skills [role="tab"]').count()).toBe(5)
    expect(await page.locator('#contact a[href^="mailto:"]').count()).toBe(1)
    expect(await page.locator('header nav a').count()).toBeGreaterThan(0)
    expect(await page.locator('footer nav a').count()).toBeGreaterThan(0)
    expect(await page.locator('astro-island[client="load"]').count()).toBe(0)
    expect(await page.locator('main#main').count()).toBe(1)
    expect(await page.locator('a.skip-link[href="#main"]').count()).toBe(1)
    await page.close()
  })

  it('renders the shared icon set in server HTML and after hydration', async () => {
    const ssr = await openPage({ javaScriptEnabled: false })
    await goto(ssr, '/')

    for (const name of [
      'menu',
      'x',
      'sun',
      'moon',
      'mail',
      'copy',
      'check',
      'github',
      'google',
      'whatsapp',
      'arrow-right',
      'arrow-up-right',
    ]) {
      expect(await ssr.locator(`svg[data-icon="${name}"]`).count()).toBeGreaterThan(0)
    }

    expect(
      await ssr
        .locator('svg[data-icon]')
        .evaluateAll((nodes) =>
          nodes.every((node) => node.getAttribute('aria-hidden') === 'true'),
        ),
    ).toBe(true)
    expect(
      await ssr.locator('header button[aria-controls="mobile-menu"]').getAttribute('aria-label'),
    ).toBeTruthy()
    expect(
      await ssr.locator('header [data-theme-toggle]').first().getAttribute('aria-label'),
    ).toBeTruthy()

    const totalIcons = await ssr.locator('svg[data-icon]').count()

    await goto(ssr, '/blog/fixture-article/')
    const externalLink = ssr.locator('.article-body p a[href="https://example.com"]').first()
    expect(await externalLink.locator('svg[data-icon="arrow-up-right"]').count()).toBe(1)
    expect(
      await externalLink.locator('svg[data-icon="arrow-up-right"]').getAttribute('class'),
    ).toContain('inline-block')
    expect(await externalLink.locator('span.sr-only').textContent()).toContain('pestaña nueva')
    await ssr.close()

    const page = await openPage()
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await goto(page, '/')
    await page.waitForSelector('astro-island[client="idle"]:not([ssr])', { state: 'attached' })

    expect(await page.locator('svg[data-icon]').count()).toBe(totalIcons)
    expect(await page.locator('svg[data-icon="arrow-right"]').count()).toBeGreaterThan(0)
    expect(errors).toEqual([])
    await page.close()
  })

  it('serves review access and panel shells without JavaScript', async () => {
    const page = await openPage({ javaScriptEnabled: false })

    await goto(page, '/resenas/')
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toBe(
      'noindex, follow',
    )
    expect(await page.locator('main#main').count()).toBe(1)
    expect(await page.locator('h1').count()).toBe(1)
    expect(await page.locator('h1').textContent()).toContain('Deja tu reseña')
    const google = page.locator('main button[aria-busy]').first()
    expect(await google.isDisabled()).toBe(true)
    expect(await google.textContent()).toContain('Preparando acceso')
    expect(await page.locator('noscript').count()).toBe(1)

    await goto(page, '/resenas/panel/')
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toBe(
      'noindex, follow',
    )
    expect(await page.locator('main#main').count()).toBe(1)
    expect(await page.locator('h1').textContent()).toContain('Tu reseña')
    expect(await page.locator('main').textContent()).toContain('Comprobando sesión')
    expect(await page.locator('noscript').count()).toBe(1)
    await page.close()
  })

  it('does not ship Firebase to the public home', async () => {
    const page = await openPage()
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await goto(page, '/')
    await page.waitForTimeout(2_000)
    expect(
      requests.some((url) => /firebase|identitytoolkit|firestore\.googleapis/.test(url)),
    ).toBe(false)
    await page.close()
  })

  it('enables the Google control after the review access island hydrates', async () => {
    const page = await openPage()
    await goto(page, '/resenas/')
    await waitForHydration(page)
    const google = page.getByRole('button', { name: 'Continuar con Google' })
    await expect.poll(() => google.isEnabled()).toBe(true)
    await expect.poll(() => google.getAttribute('aria-busy')).toBe('false')
    await page.close()
  })

  it('redirects an unauthenticated visitor from the panel to the access page', async () => {
    const page = await openPage()
    await goto(page, '/resenas/panel/')
    await waitForHydration(page)
    await page.waitForURL(`${base}/resenas/`)
    expect(await page.locator('h1').textContent()).toContain('Deja tu reseña')
    await page.close()
  })


  it('keeps the static skills tabs and contact controls keyboard accessible', async () => {
    const page = await openPage()
    await goto(page, '/')
    const tabs = page.locator('#skills [role="tab"]')
    await tabs.nth(1).focus()
    await tabs.nth(1).press('ArrowRight')
    expect(await tabs.nth(2).getAttribute('aria-selected')).toBe('true')
    expect(await tabs.nth(2).getAttribute('data-state')).toBe('active')
    expect(await page.locator('#skills-area-detail').getAttribute('aria-labelledby')).toBe('skills-area-tab-2')
    await tabs.nth(2).press('Home')
    expect(await tabs.nth(0).getAttribute('aria-selected')).toBe('true')
    expect(await page.locator('#skills-area-detail [data-area-detail]:visible').count()).toBe(1)
    expect(
      await page.locator('#skills-area-detail [data-area-detail]:visible').textContent(),
    ).toContain('Cómo se usa el sistema')
    await tabs.nth(0).press('End')
    expect(await tabs.nth(4).getAttribute('aria-selected')).toBe('true')
    expect(
      await page.locator('#skills-area-detail [data-area-detail]:visible').textContent(),
    ).toContain('Cómo se organiza el conjunto')
    expect(await page.locator('#contact button[type="submit"]').isDisabled()).toBe(false)
    await waitForContactHydration(page)
    const copy = page.locator('[data-copy-email]')
    await copy.click()
    await expect.poll(() => page.locator('[data-copy-status]').textContent()).not.toBe('')
    await page.close()
  })

  it('validates the contact form before calling Firebase or EmailJS', async () => {
    const page = await openPage()
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await goto(page, '/')
    await waitForContactHydration(page)

    await page.locator('#contact button[type="submit"]').click()

    await expect.poll(() => page.locator('#contact-name-error').textContent()).toBe(
      'Escribe tu nombre.',
    )
    expect(await page.locator('#contact-email-error').textContent()).toBe('Escribe tu correo.')
    expect(await page.locator('#contact-subject-error').textContent()).toBe('Escribe el asunto.')
    expect(await page.locator('#contact-message-error').textContent()).toBe('Escribe tu mensaje.')
    expect(
      await page.locator('#contact-name').evaluate((element) => element === document.activeElement),
    ).toBe(true)
    expect(await page.locator('#contact-name').getAttribute('aria-invalid')).toBe('true')
    expect(
      requests.some((url) =>
        /firebase|identitytoolkit|firestore\.googleapis|emailjs/.test(url),
      ),
    ).toBe(false)
    await page.close()
  })

  it('keeps the article outline and progress as script enhancements to server HTML', async () => {
    const page = await openPage()
    await goto(page, '/blog/fixture-article/')
    expect(await page.locator('astro-island').count()).toBe(0)
    expect(await page.locator('[data-article-toc] a[href="#intro"]').count()).toBeGreaterThan(0)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect.poll(() => page.locator('[data-reading-progress]').evaluate((element) => (element as HTMLElement).style.transform)).toMatch(/scaleX\(0\.[1-9]|scaleX\(1\)/)
    await page.close()
  })

  it('moves focus with the keyboard through the skip link and menu control', async () => {
    const page = await openPage({ viewport: { width: 390, height: 844 } })
    await goto(page, '/')
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
    const spanish = page.locator('header [data-locale-link][href="/blog/fixture-article/"]').first()
    await spanish.click()
    await page.waitForURL(`${base}/blog/fixture-article/#intro`)
    expect(await page.locator('html').getAttribute('lang')).toBe('es')
    expect(await page.evaluate(() => window.location.hash)).toBe('#intro')
    await page.close()
  })

  it('exposes canonical, social and JSON-LD metadata', async () => {
    const page = await openPage({ javaScriptEnabled: false })
    await goto(page, '/')
    expect(await page.locator('link[rel="canonical"]').getAttribute('href'))
      .toBe('https://fixture.example.test/')
    expect(await page.locator('meta[property="og:type"]').getAttribute('content'))
      .toBe('website')
    expect(await page.locator('meta[property="og:image"]').getAttribute('content'))
      .toBe('https://fixture.example.test/og-default.png')
    const homeJson = await page.locator('script[type="application/ld+json"]').textContent()
    expect(homeJson).toContain('"@type":"ProfilePage"')

    await goto(page, '/blog/fixture-article/')
    expect(await page.locator('meta[property="og:type"]').getAttribute('content'))
      .toBe('article')
    expect(await page.locator('meta[property="og:image"]').getAttribute('content'))
      .toContain('/images/fixture/cover.png')
    const articleJson = await page.locator('script[type="application/ld+json"]').textContent()
    expect(articleJson).toContain('"@type":"BlogPosting"')
    expect(articleJson).toContain('"@type":"BreadcrumbList"')
    expect(await page.locator('nav[aria-label="Ruta de navegación"]').count()).toBe(1)
    await page.close()
  })

  it('serves a sitemap with lastmod and language alternates', async () => {
    const index = await fetch(`${base}/sitemap-index.xml`)
    expect(index.ok).toBe(true)
    expect(await index.text()).toContain('/sitemap-0.xml')

    const response = await fetch(`${base}/sitemap-0.xml`)
    expect(response.ok).toBe(true)
    const body = await response.text()
    expect(body).toContain('https://fixture.example.test/blog/fixture-article/')
    expect(body).toContain('https://fixture.example.test/blog/solo-es/')
    expect(body).toContain('https://fixture.example.test/en/blog/solo-en/')
    expect(body).not.toContain('https://fixture.example.test/en/blog/solo-es/')
    expect(body).not.toContain('https://fixture.example.test/blog/solo-en/')
    expect(body).toContain('<lastmod>2024-01-02</lastmod>')
    expect(body).toContain('<lastmod>2024-02-02</lastmod>')
    expect(body).toContain('<lastmod>2024-03-02</lastmod>')
    expect(body).toContain('hreflang="x-default"')
    expect(body).not.toContain('/projects/')
  })

  it('keeps each blog index scoped to its locale', async () => {
    const spanish = await fetch(`${base}/blog/solo-es/`)
    expect(spanish.ok).toBe(true)
    expect(await spanish.text()).toContain('Artículo solo en español')

    const english = await fetch(`${base}/en/blog/solo-es/`)
    expect(english.status).toBe(404)
    const englishOnly = await fetch(`${base}/en/blog/solo-en/`)
    expect(englishOnly.ok).toBe(true)
    const spanishFallback = await fetch(`${base}/blog/solo-en/`)
    expect(spanishFallback.status).toBe(404)

    const spanishBody = await (await fetch(`${base}/blog/`)).text()
    expect(spanishBody).toContain('/blog/solo-es/')
    expect(spanishBody).toContain('/blog/fixture-article/')
    expect(spanishBody).not.toContain('/en/blog/solo-en/')
    expect(spanishBody).not.toContain('English only article')

    const englishBody = await (await fetch(`${base}/en/blog/`)).text()
    expect(englishBody).toContain('/en/blog/solo-en/')
    expect(englishBody).toContain('/en/blog/fixture-article/')
    expect(englishBody).not.toContain('/blog/solo-es/')
    expect(englishBody).not.toContain('Artículo solo en español')

    const spanishHome = await (await fetch(`${base}/`)).text()
    expect(spanishHome).not.toContain('/en/blog/solo-en/')
    const englishHome = await (await fetch(`${base}/en/`)).text()
    expect(englishHome).not.toContain('/blog/solo-es/')
  })

  it('renders a single image when theme variants are identical', async () => {
    const page = await openPage({ javaScriptEnabled: false })
    await goto(page, '/blog/fixture-article/')
    expect(await page.locator('img[src="/images/fixture/body.png"]').count()).toBe(1)
    expect(await page.locator('img[src="/images/fixture/cover.png"]').count()).toBe(1)
    await page.close()
  })

  it('keeps internal page links on their trailing-slash canonical form', async () => {
    const page = await openPage({ javaScriptEnabled: false })
    for (const path of ['/', '/blog/fixture-article/']) {
      await goto(page, path)
      const missing = await page.locator('a[href]').evaluateAll((links) =>
        links
          .map((link) => link.getAttribute('href'))
          .filter((href): href is string => {
            if (href === null) return false
            const [pathname] = href.split('#')
            return /^\/(en\/)?(blog|proyectos)(\/[^/]+)?$/.test(pathname)
          }),
      )
      expect(missing).toEqual([])
    }
    await page.close()
  })
})
