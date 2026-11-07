export const imageMediaPrefix = '/images/'
export const fileMediaPrefix = '/files/'
export const mediaPrefixes = [imageMediaPrefix, fileMediaPrefix] as const

export function hasMediaPrefix(value: string): boolean {
  return mediaPrefixes.some((prefix) => value.startsWith(prefix))
}

export function isImageMediaPath(value: string): boolean {
  return value.startsWith(imageMediaPrefix) && value.length > imageMediaPrefix.length
}

export function isFileMediaPath(value: string): boolean {
  return value.startsWith(fileMediaPrefix) && value.length > fileMediaPrefix.length
}

export function isMediaPath(value: string): boolean {
  return isImageMediaPath(value) || isFileMediaPath(value)
}

export function isSafeMediaPath(value: string): boolean {
  return (
    !value.includes('..') &&
    !value.includes('//') &&
    !value.includes('\\') &&
    !value.endsWith('/') &&
    !/[?#]/.test(value)
  )
}
