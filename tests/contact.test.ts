import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CONTACT_LIMITS,
  contactDraftSchema,
  createEmptyContactDraft,
  isContactDraftValid,
  toContactMessage,
  validateContactDraft,
  type ContactDraft,
} from '../src/data/contact'
import { contactSubmitErrorKey } from '../src/lib/forms/errors'
import { CONTACT_COLLECTION } from '../src/lib/forms/repository'

const here = path.dirname(fileURLToPath(import.meta.url))

const validDraft: ContactDraft = {
  name: 'Andrea Rivas',
  email: 'andrea.rivas@example.com',
  subject: 'Sistema de inventario',
  message: 'Necesito ordenar el inventario y los reportes de la tienda.',
  locale: 'es',
}

describe('contact form schema', () => {
  it('accepts a complete message and trims every field', () => {
    const parsed = contactDraftSchema.parse({
      ...validDraft,
      name: '  Andrea Rivas  ',
      email: '  andrea.rivas@example.com ',
      subject: ' Sistema de inventario ',
      message: '  Necesito ordenar el inventario y los reportes.  ',
    })

    expect(parsed.name).toBe('Andrea Rivas')
    expect(parsed.email).toBe('andrea.rivas@example.com')
    expect(parsed.subject).toBe('Sistema de inventario')
    expect(parsed.message).toBe('Necesito ordenar el inventario y los reportes.')
  })

  it('reports the first issue per field', () => {
    const empty = createEmptyContactDraft('es')
    expect(validateContactDraft(empty)).toEqual({
      name: 'name-required',
      email: 'email-required',
      subject: 'subject-required',
      message: 'message-required',
    })

    expect(validateContactDraft({ ...validDraft, name: 'A' })).toEqual({ name: 'name-min' })
    expect(validateContactDraft({ ...validDraft, name: 'a'.repeat(81) })).toEqual({
      name: 'name-max',
    })
    expect(validateContactDraft({ ...validDraft, email: 'not-an-email' })).toEqual({
      email: 'email-invalid',
    })
    expect(validateContactDraft({ ...validDraft, subject: 'ab' })).toEqual({
      subject: 'subject-min',
    })
    expect(validateContactDraft({ ...validDraft, message: 'short' })).toEqual({
      message: 'message-min',
    })
  })

  it('enforces the shared limits and the email shape', () => {
    const longMessage = 'a'.repeat(CONTACT_LIMITS.messageMax + 1)
    expect(validateContactDraft({ ...validDraft, message: longMessage })).toEqual({
      message: 'message-max',
    })

    const longestEmail = `${'a'.repeat(CONTACT_LIMITS.emailMax)}@example.com`
    expect(validateContactDraft({ ...validDraft, email: longestEmail })).toEqual({
      email: 'email-max',
    })

    for (const email of [
      'user@example',
      'user name@example.com',
      '@example.com',
      'user@example.c',
    ]) {
      expect(validateContactDraft({ ...validDraft, email })).toEqual({
        email: 'email-invalid',
      })
    }
  })

  it('counts characters the way Firestore counts string size', () => {
    // An astral character is two UTF-16 code units but one Firestore character.
    expect(isContactDraftValid({ ...validDraft, name: '👤👤' })).toBe(true)
  })

  it('builds a trimmed payload with the portfolio locale', () => {
    const payload = toContactMessage({
      ...validDraft,
      name: '  Andrea  ',
      locale: 'en',
    })

    expect(payload).toEqual({
      name: 'Andrea',
      email: 'andrea.rivas@example.com',
      subject: 'Sistema de inventario',
      message: 'Necesito ordenar el inventario y los reportes de la tienda.',
      locale: 'en',
    })
  })
})

describe('contact submission contract', () => {
  it('writes to the private forms collection', () => {
    expect(CONTACT_COLLECTION).toBe('forms')
  })

  it('maps Firebase failures to localized copy keys', () => {
    expect(contactSubmitErrorKey({ code: 'permission-denied' })).toBe('permission-denied')
    expect(contactSubmitErrorKey({ code: 'unavailable' })).toBe('network')
    expect(contactSubmitErrorKey({ code: 'network-request-failed' })).toBe('network')
    expect(contactSubmitErrorKey({ code: 'resource-exhausted' })).toBe('quota')
    expect(contactSubmitErrorKey(new Error('boom'))).toBe('unknown')
  })

  it('keeps the Firestore rules aligned with the shared limits', () => {
    const rules = fs.readFileSync(path.resolve(here, '../firestore.rules'), 'utf8')
    const forms = rules.slice(rules.indexOf('function isValidContactMessage'))

    expect(forms).toContain('allow create: if isValidContactMessage(request.resource.data)')
    expect(forms).toContain('allow get, list, update, delete: if false')
    expect(forms).toContain(`validString(data.name, ${CONTACT_LIMITS.nameMin}, ${CONTACT_LIMITS.nameMax})`)
    expect(forms).toContain(`validString(data.email, 3, ${CONTACT_LIMITS.emailMax})`)
    expect(forms).toContain(
      `validString(data.subject, ${CONTACT_LIMITS.subjectMin}, ${CONTACT_LIMITS.subjectMax})`,
    )
    expect(forms).toContain(
      `validString(data.message, ${CONTACT_LIMITS.messageMin}, ${CONTACT_LIMITS.messageMax})`,
    )
  })
})
