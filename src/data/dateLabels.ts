import type { Localized, Locale } from './schemas/primitives'

function monthLabel(isoMonth: string, locale: Locale): string {
  const [year, month] = isoMonth.split('-').map(Number)
  const date = new Date(Date.UTC(year!, month! - 1, 1))
  return `${new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '')
    .toUpperCase()} ${year}`
}

function localized(format: (locale: Locale) => string): Localized {
  return { es: format('es'), en: format('en') }
}

export function experiencePeriod(start: string, end: string | null): Localized {
  return localized(
    (locale) =>
      `${monthLabel(start, locale)} — ${end ? monthLabel(end, locale) : locale === 'es' ? 'HOY' : 'PRESENT'}`,
  )
}

export function educationPeriod(start: number, end: number | null): Localized {
  return localized((locale) => `${start} — ${end ?? (locale === 'es' ? 'EN CURSO' : 'PRESENT')}`)
}

export function certificationDate(month: string): Localized {
  return localized((locale) => monthLabel(month, locale))
}
