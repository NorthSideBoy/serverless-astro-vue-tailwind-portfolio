import { siGithub, siGoogle, siWhatsapp } from 'simple-icons'
import type { BrandIconName, IconName } from './icon-names'

/**
 * Static brand marks imported directly from Simple Icons (CC0).
 * The marks themselves are trademarks of their respective owners.
 */
export const brandIcons = {
  github: siGithub.path,
  google: siGoogle.path,
  whatsapp: siWhatsapp.path,
} as const satisfies Record<BrandIconName, string>

export function isBrandIcon(name: IconName): name is BrandIconName {
  return Object.prototype.hasOwnProperty.call(brandIcons, name)
}
