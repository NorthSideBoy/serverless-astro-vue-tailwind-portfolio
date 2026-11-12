import type { ContactMessagePayload } from '@/data/contact'
import type { Locale, Localized } from '@/data/schemas/primitives'

/**
 * Best-effort email notifications.
 *
 * Firestore is the record of truth for contact messages and pending reviews.
 * EmailJS only announces a write that already succeeded, so a failed or slow
 * send must never repeat the write, block the success state or reach the
 * console with visitor content. The SDK is imported on demand: visiting a page
 * downloads no EmailJS code.
 *
 * The public key, service and template identifiers are not secrets; they are
 * shipped in the browser bundle, exactly like the public Firebase config.
 */
export const EMAILJS_SEND_TIMEOUT_MS = 8_000

export const EMAILJS_SEND_URL = 'https://api.emailjs.com/api/v1.0/email/send'

export type NotificationOutcome = 'sent' | 'skipped' | 'failed'

export type EmailJsConfig = {
  publicKey: string
  serviceId: string
  contactTemplateId: string
  reviewTemplateId: string
}

export type ContactTemplateParams = {
  name: string
  email: string
  subject: string
  locale: Locale
  message: string
}

export type ReviewExperienceOption = {
  id: string
  role: string
  org: string
}

export type ReviewProjectOption = {
  slug: string
  title: Localized
}

export type ReviewTemplateInput = {
  authorName: string
  authorEmail: string
  roles: readonly string[]
  locale: Locale
  experienceIds: readonly string[]
  projectSlugs: readonly string[]
  quote: string
  experiences: readonly ReviewExperienceOption[]
  projects: readonly ReviewProjectOption[]
}

export type ReviewTemplateParams = {
  author_name: string
  author_email: string
  roles: string
  locale: Locale
  relations: string
  quote: string
}

function readPublicEnv(): Record<string, string | undefined> {
  return import.meta.env as unknown as Record<string, string | undefined>
}

export function readEmailJsConfig(
  env: Record<string, string | undefined> = readPublicEnv(),
): EmailJsConfig {
  return {
    publicKey: env.PUBLIC_EMAILJS_PUBLIC_KEY ?? '',
    serviceId: env.PUBLIC_EMAILJS_SERVICE_ID ?? '',
    contactTemplateId: env.PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID ?? '',
    reviewTemplateId: env.PUBLIC_EMAILJS_REVIEW_TEMPLATE_ID ?? '',
  }
}

/**
 * A missing key or template skips the send instead of failing it. Contact and
 * review templates are independent: one can be configured while the other is
 * not.
 */
export function isNotificationConfigured(
  config: EmailJsConfig,
  templateId: string,
): boolean {
  return Boolean(config.publicKey && config.serviceId && templateId)
}

export function buildContactTemplateParams(
  message: ContactMessagePayload,
): ContactTemplateParams {
  return {
    name: message.name,
    email: message.email,
    subject: message.subject,
    locale: message.locale,
    message: message.message,
  }
}

export function formatRoles(roles: readonly string[]): string {
  const normalized = roles.map((role) => role.trim()).filter(Boolean)
  return normalized.length ? normalized.join(', ') : 'None'
}

export function describeReviewRelations(
  input: Pick<
    ReviewTemplateInput,
    'experienceIds' | 'projectSlugs' | 'experiences' | 'projects' | 'locale'
  >,
): string {
  const experiences = new Map(
    input.experiences.map((entry) => [
      entry.id,
      [entry.role, entry.org].map((part) => part.trim()).filter(Boolean).join(' · '),
    ]),
  )
  const projects = new Map(
    input.projects.map((entry) => [entry.slug, entry.title[input.locale] || entry.title.es]),
  )

  const labels = [
    ...input.experienceIds.map((id) => experiences.get(id)).filter(Boolean),
    ...input.projectSlugs.map((slug) => projects.get(slug)).filter(Boolean),
  ]

  return labels.length ? labels.join('; ') : 'None'
}

export function buildReviewTemplateParams(
  input: ReviewTemplateInput,
): ReviewTemplateParams {
  return {
    author_name: input.authorName,
    author_email: input.authorEmail,
    roles: formatRoles(input.roles),
    locale: input.locale,
    relations: describeReviewRelations(input),
    quote: input.quote.trim(),
  }
}

function withTimeout<T>(task: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('emailjs/timeout')), milliseconds)
    task.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (cause: unknown) => {
        clearTimeout(timer)
        reject(cause)
      },
    )
  })
}

async function send(
  config: EmailJsConfig,
  templateId: string,
  params: Record<string, unknown>,
): Promise<NotificationOutcome> {
  if (!isNotificationConfigured(config, templateId)) return 'skipped'

  try {
    const { default: emailjs } = await import('@emailjs/browser')
    await withTimeout(
      emailjs.send(config.serviceId, templateId, params, { publicKey: config.publicKey }),
      EMAILJS_SEND_TIMEOUT_MS,
    )
    return 'sent'
  } catch {
    // Contact messages and reviews are private input: never log them or the
    // provider response. The stored document stays available for follow-up.
    return 'failed'
  }
}

export async function notifyContactMessage(
  message: ContactMessagePayload,
): Promise<NotificationOutcome> {
  const config = readEmailJsConfig()
  return send(config, config.contactTemplateId, buildContactTemplateParams(message))
}

export async function notifyNewReview(
  input: ReviewTemplateInput,
): Promise<NotificationOutcome> {
  const config = readEmailJsConfig()
  return send(config, config.reviewTemplateId, buildReviewTemplateParams(input))
}
