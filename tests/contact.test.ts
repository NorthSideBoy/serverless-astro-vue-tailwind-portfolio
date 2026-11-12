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
  subject: 'Sistema de inventario',
  message: 'Necesito ordenar el inventario y los reportes de la tienda.',
  locale: 'es',
}

const sender = {
  uid: 'abc123XYZ',
  name: 'Andrea Rivas',
  email: 'andrea.rivas@example.com',
}

describe('contact form schema', () => {
  it('accepts a complete message and trims every editable field', () => {
    const parsed = contactDraftSchema.parse({
      ...validDraft,
      subject: ' Sistema de inventario ',
      message: '  Necesito ordenar el inventario y los reportes.  ',
    })

    expect(parsed.subject).toBe('Sistema de inventario')
    expect(parsed.message).toBe('Necesito ordenar el inventario y los reportes.')
  })

  it('reports the first issue per editable field', () => {
    const empty = createEmptyContactDraft('es')
    expect(validateContactDraft(empty)).toEqual({
      subject: 'subject-required',
      message: 'message-required',
    })

    expect(validateContactDraft({ ...validDraft, subject: 'ab' })).toEqual({
      subject: 'subject-min',
    })
    expect(validateContactDraft({ ...validDraft, subject: 'a'.repeat(121) })).toEqual({
      subject: 'subject-max',
    })
    expect(validateContactDraft({ ...validDraft, message: 'short' })).toEqual({
      message: 'message-min',
    })
  })

  it('enforces the shared limits', () => {
    expect(
      validateContactDraft({ ...validDraft, message: 'a'.repeat(CONTACT_LIMITS.messageMax + 1) }),
    ).toEqual({ message: 'message-max' })

    expect(
      validateContactDraft({ ...validDraft, subject: 'a'.repeat(CONTACT_LIMITS.subjectMax + 1) }),
    ).toEqual({ subject: 'subject-max' })
  })

  it('counts characters the way Firestore counts string size', () => {
    // An astral character is two UTF-16 code units but one Firestore character.
    expect(isContactDraftValid({ ...validDraft, subject: '👤👤👤' })).toBe(true)
  })

  it('builds a trimmed payload with the session identity and locale', () => {
    const payload = toContactMessage(
      {
        ...validDraft,
        subject: '  Hola  ',
        locale: 'en',
      },
      { ...sender, name: '  Andrea Rivas  ', email: ' andrea.rivas@example.com ' },
    )

    expect(payload).toEqual({
      senderUid: 'abc123XYZ',
      name: 'Andrea Rivas',
      email: 'andrea.rivas@example.com',
      subject: 'Hola',
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

  it('requires a verified Google account bound to the stored identity', () => {
    const rules = fs.readFileSync(path.resolve(here, '../firestore.rules'), 'utf8')

    expect(rules).toContain(
      "request.auth.token.firebase.sign_in_provider == 'google.com'",
    )
    expect(rules).toContain(
      'allow create: if isVerifiedGoogleUser()\n        && isValidContactMessage(request.resource.data)',
    )
    expect(rules).toContain('data.senderUid == request.auth.uid')
    expect(rules).toContain('data.email == request.auth.token.email')
  })

  it('keeps the Firestore rules aligned with the shared limits', () => {
    const rules = fs.readFileSync(path.resolve(here, '../firestore.rules'), 'utf8')
    const forms = rules.slice(rules.indexOf('function isValidContactMessage'))

    expect(forms).toContain('allow get, list, update, delete: if false')
    expect(forms).toContain(
      `validString(data.name, ${CONTACT_LIMITS.nameMin}, ${CONTACT_LIMITS.nameMax})`,
    )
    expect(forms).toContain(`validString(data.email, 3, ${CONTACT_LIMITS.emailMax})`)
    expect(forms).toContain(
      `validString(data.subject, ${CONTACT_LIMITS.subjectMin}, ${CONTACT_LIMITS.subjectMax})`,
    )
    expect(forms).toContain(
      `validString(data.message, ${CONTACT_LIMITS.messageMin}, ${CONTACT_LIMITS.messageMax})`,
    )
  })
})
