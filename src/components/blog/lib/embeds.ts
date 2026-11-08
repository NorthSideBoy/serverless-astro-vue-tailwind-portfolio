import type { EmbedProvider } from '@/data/schemas/article'

/**
 * Provider adapters. The contract stores a provider + a public URL; the renderer
 * is the only place that knows how to turn that into an iframe URL. Unknown or
 * malformed embeds fall back to a plain link card.
 */
export function embedSrc(
  provider: EmbedProvider,
  value: string,
  theme: 'dark' | 'light',
): string | null {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    switch (provider) {
      case 'youtube': {
        if (!['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) {
          return null
        }
        const id = youtubeId(url)
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
      }
      case 'vimeo': {
        if (!['vimeo.com', 'player.vimeo.com'].includes(host)) return null
        const id = vimeoId(url)
        return id ? `https://player.vimeo.com/video/${id}` : null
      }
      case 'codepen': {
        if (host !== 'codepen.io') return null
        const match = url.pathname.match(/^\/([^/]+)\/pen\/([^/]+)/)
        return match ? `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result` : null
      }
      case 'codesandbox': {
        if (host !== 'codesandbox.io') return null
        const match = url.pathname.match(/^\/(?:s|embed)\/([^/]+)/)
        return match
          ? `https://codesandbox.io/embed/${match[1]}?fontsize=14&hidenavigation=1&theme=${theme}`
          : null
      }
      default:
        return null
    }
  } catch {
    return null
  }
}

function youtubeId(url: URL): string | null {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
  if (url.pathname.startsWith('/embed/')) {
    return url.pathname.slice('/embed/'.length).split('/')[0] ?? null
  }
  if (url.pathname.startsWith('/shorts/')) {
    return url.pathname.slice('/shorts/'.length).split('/')[0] ?? null
  }
  return url.searchParams.get('v')
}

function vimeoId(url: URL): string | null {
  if (url.hostname === 'player.vimeo.com') {
    const match = url.pathname.match(/^\/video\/(\d+)/)
    return match?.[1] ?? null
  }
  const match = url.pathname.match(/\/(\d+)/)
  return match?.[1] ?? null
}
