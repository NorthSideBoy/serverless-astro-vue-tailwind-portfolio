/**
 * Canonical icon vocabulary. Names match the Lucide kebab-case names so
 * `lucide.dev/icons/<name>` is the reference for every UI glyph.
 *
 * Adding an icon:
 *   1. add the name here;
 *   2. import the component and add it to
 *      `components/ui/astro/icon-map.ts` and
 *      `components/ui/vue/icon-map.ts`;
 *   3. run `npm run check`.
 *
 * `phone` and `globe` were removed after the migration because no section used
 * them. Add them back here if a real use appears.
 */
export const uiIconNames = [
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-up-right',
  'check',
  'circle-check',
  'code',
  'copy',
  'database',
  'download',
  'layers',
  'mail',
  'menu',
  'moon',
  'plug',
  'shield-check',
  'sun',
  'terminal',
  'webhook',
  'x',
] as const

export type UiIconName = (typeof uiIconNames)[number]

/** Brand marks are filled paths generated from Simple Icons, not Lucide. */
export const brandIconNames = ['github', 'google', 'whatsapp'] as const

export type BrandIconName = (typeof brandIconNames)[number]

export type IconName = UiIconName | BrandIconName
