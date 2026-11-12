import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildContactTemplateParams,
  buildReviewTemplateParams,
  describeReviewRelations,
  formatRoles,
  isNotificationConfigured,
  readEmailJsConfig,
  EMAILJS_SEND_URL,
  type EmailJsConfig,
  type ReviewTemplateInput,
} from '../src/lib/notifications/emailjs'
import type { ContactMessagePayload } from '../src/data/contact'

const here = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(here, '../src')

const config: EmailJsConfig = {
  publicKey: 'public-key',
  serviceId: 'service-id',
  contactTemplateId: 'template-contact',
  reviewTemplateId: 'template-review',
}

const contactMessage: ContactMessagePayload = {
  name: 'Andrea Rivas',
  email: 'andrea.rivas@example.com',
  subject: 'Sistema de inventario',
  message: 'Necesito ordenar el inventario y los reportes de la tienda.',
  locale: 'es',
}

const reviewInput: ReviewTemplateInput = {
  authorName: 'Luis Ortega',
  authorEmail: 'luis.ortega@example.com',
  roles: ['Tech Lead', 'Backend Engineer'],
  locale: 'en',
  experienceIds: ['acme-backend'],
  projectSlugs: ['inventory-system', 'missing-project'],
  quote: '  A reliable partner for a complex migration.  ',
  experiences: [{ id: 'acme-backend', role: 'Backend Engineer', org: 'Acme' }],
  projects: [
    {
      slug: 'inventory-system',
      title: { es: 'Sistema de inventario', en: 'Inventory system' },
    },
  ],
}

describe('email notification configuration', () => {
  it('reads only the public EmailJS identifiers', () => {
    expect(
      readEmailJsConfig({
        PUBLIC_EMAILJS_PUBLIC_KEY: 'key',
        PUBLIC_EMAILJS_SERVICE_ID: 'service',
        PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID: 'contact',
        PUBLIC_EMAILJS_REVIEW_TEMPLATE_ID: 'review',
      }),
    ).toEqual({
      publicKey: 'key',
      serviceId: 'service',
      contactTemplateId: 'contact',
      reviewTemplateId: 'review',
    })

    expect(readEmailJsConfig({})).toEqual({
      publicKey: '',
      serviceId: '',
      contactTemplateId: '',
      reviewTemplateId: '',
    })
  })

  it('skips a notification instead of failing when a value is missing', () => {
    expect(isNotificationConfigured(config, 'template-contact')).toBe(true)
    expect(isNotificationConfigured(config, '')).toBe(false)
    expect(isNotificationConfigured({ ...config, publicKey: '' }, 'template-contact')).toBe(false)
    expect(isNotificationConfigured({ ...config, serviceId: '' }, 'template-contact')).toBe(false)
  })

  it('uses the browser-compatible EmailJS endpoint contract', () => {
    expect(EMAILJS_SEND_URL).toBe('https://api.emailjs.com/api/v1.0/email/send')
  })
})

describe('contact notification payload', () => {
  it('maps the stored message to the template variables', () => {
    expect(buildContactTemplateParams(contactMessage)).toEqual({
      name: 'Andrea Rivas',
      email: 'andrea.rivas@example.com',
      subject: 'Sistema de inventario',
      locale: 'es',
      message: 'Necesito ordenar el inventario y los reportes de la tienda.',
    })
  })

  it('does not add fields the template does not render', () => {
    expect(Object.keys(buildContactTemplateParams(contactMessage)).sort()).toEqual([
      'email',
      'locale',
      'message',
      'name',
      'subject',
    ])
  })
})

describe('review notification payload', () => {
  it('formats roles as readable text and falls back to None', () => {
    expect(formatRoles(['Tech Lead', ' Backend Engineer '])).toBe(
      'Tech Lead, Backend Engineer',
    )
    expect(formatRoles(['', '   '])).toBe('None')
    expect(formatRoles([])).toBe('None')
  })

  it('labels relations with the review locale and ignores unknown ids', () => {
    expect(describeReviewRelations(reviewInput)).toBe(
      'Backend Engineer · Acme; Inventory system',
    )
    expect(describeReviewRelations({ ...reviewInput, locale: 'es' })).toBe(
      'Backend Engineer · Acme; Sistema de inventario',
    )
    expect(
      describeReviewRelations({
        ...reviewInput,
        experienceIds: [],
        projectSlugs: ['missing-project'],
      }),
    ).toBe('None')
  })

  it('builds the documented template variables', () => {
    expect(buildReviewTemplateParams(reviewInput)).toEqual({
      author_name: 'Luis Ortega',
      author_email: 'luis.ortega@example.com',
      roles: 'Tech Lead, Backend Engineer',
      locale: 'en',
      relations: 'Backend Engineer · Acme; Inventory system',
      quote: 'A reliable partner for a complex migration.',
    })
  })

  it('never publishes the approval flag, the UID or the photo', () => {
    const params = buildReviewTemplateParams(reviewInput) as Record<string, unknown>

    expect(params).not.toHaveProperty('approved')
    expect(params).not.toHaveProperty('authorUid')
    expect(params).not.toHaveProperty('photoUrl')
    expect(params).not.toHaveProperty('anchorId')
  })
})

describe('notification integration boundaries', () => {
  const read = (relative: string) => fs.readFileSync(path.join(srcDir, relative), 'utf8')

  const staticImporters = () => {
    const files = [path.join(srcDir, 'components'), path.join(srcDir, 'lib')]
    const results: string[] = []
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (/\.(vue|ts|astro)$/.test(entry.name)) {
          const source = fs.readFileSync(full, 'utf8')
          const imports = [...source.matchAll(/\bfrom\s+(['"])([^'"]+)\1/g)].map(
            (match) => match[2],
          )
          if (imports.includes('@emailjs/browser')) results.push(full)
        }
      }
    }
    files.forEach(walk)
    return results
  }

  it('loads the EmailJS SDK dynamically and never from a component', () => {
    expect(staticImporters()).toEqual([])

    const module = read('lib/notifications/emailjs.ts')
    expect(module).toContain("import('@emailjs/browser')")
    expect(module).not.toMatch(/^import .*@emailjs\/browser/m)
  })

  it('notifies only after the contact write and the review creation', () => {
    const contact = read('components/home/vue/ContactForm.vue')
    const writeIndex = contact.indexOf('await createContactMessage(')
    const notifyIndex = contact.indexOf('await notifyContactMessage(')

    expect(writeIndex).toBeGreaterThan(-1)
    expect(notifyIndex).toBeGreaterThan(writeIndex)
    expect(contact).not.toMatch(/^import .*@\/lib\/notifications/m)

    const panel = read('components/reviews/vue/ReviewPanel.vue')
    const createIndex = panel.indexOf('await createReview(')
    const notifyReviewIndex = panel.indexOf('await notifyNewReview(')
    const updateIndex = panel.indexOf('await updateReview(')

    expect(notifyReviewIndex).toBeGreaterThan(createIndex)
    expect(panel.slice(updateIndex, createIndex)).not.toContain('notifyNewReview')
    expect(panel.split('await notifyNewReview(').length - 1).toBe(1)
  })

  it('keeps visitor content out of the console', () => {
    const module = read('lib/notifications/emailjs.ts')
    expect(module).not.toMatch(/console\.(log|info|warn|error)/)
  })
})
