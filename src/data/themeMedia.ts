/**
 * Theme-aware media renders a dark and a light image only when the two sources
 * differ. When Firestore omits `darkSrc` (or repeats `src`), one image is
 * enough and the browser avoids a second request.
 */
export function hasThemeVariant(src: string, darkSrc?: string): boolean {
  return Boolean(darkSrc && darkSrc !== src)
}
