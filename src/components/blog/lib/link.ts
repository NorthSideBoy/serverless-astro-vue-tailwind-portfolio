type ArticleLinkKind = 'internal' | 'anchor' | 'external' | 'mailto'

function articleLinkKind(href: string): ArticleLinkKind {
  if (href.startsWith('#')) return 'anchor'
  if (href.startsWith('/') && !href.startsWith('//')) return 'internal'
  if (href.startsWith('mailto:')) return 'mailto'
  return 'external'
}

export function isExternalArticleLink(href: string): boolean {
  return articleLinkKind(href) === 'external'
}
