import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Runs the inline scripts of public/404.html and index.html against a fake window,
// pinning the GitHub Pages deep-link round trip under the /travel-planner-pwa/ base.
function inlineScript(file: string): string {
  const html = readFileSync(resolve(process.cwd(), file), 'utf8')
  const match = html.match(/<script>([\s\S]*?)<\/script>/)
  if (!match) throw new Error(`No inline <script> in ${file}`)
  return match[1]
}

function run404(pathname: string, search = '', hash = ''): string {
  let replaced = ''
  const location = {
    protocol: 'https:',
    hostname: 'bmkaio.github.io',
    port: '',
    pathname,
    search,
    hash,
    replace: (url: string) => {
      replaced = url
    },
  }
  new Function('window', inlineScript('public/404.html'))({ location })
  return replaced
}

function runDecoder(search: string, hash = ''): string | null {
  let restored: string | null = null
  const fakeWindow = {
    location: { pathname: '/travel-planner-pwa/', search, hash },
    history: {
      replaceState: (_state: unknown, _title: unknown, url: string) => {
        restored = url
      },
    },
  }
  new Function('window', inlineScript('index.html'))(fakeWindow)
  return restored
}

describe('GitHub Pages SPA redirect', () => {
  it('404.html encodes a deep link with its query under the project base path', () => {
    expect(run404('/travel-planner-pwa/trips/peru-2026/itinerary/2026-10-24', '?tab=eat')).toBe(
      'https://bmkaio.github.io/travel-planner-pwa/?/trips/peru-2026/itinerary/2026-10-24&tab=eat'
    )
  })

  it('index.html restores the original deep link', () => {
    expect(runDecoder('?/trips/peru-2026/itinerary/2026-10-24&tab=eat')).toBe(
      '/travel-planner-pwa/trips/peru-2026/itinerary/2026-10-24?tab=eat'
    )
  })

  it('round-trips a path without query and keeps the hash', () => {
    const encoded = new URL(run404('/travel-planner-pwa/trips', '', '#top'))
    expect(runDecoder(encoded.search, encoded.hash)).toBe('/travel-planner-pwa/trips#top')
  })

  it('index.html leaves normal URLs alone', () => {
    expect(runDecoder('')).toBeNull()
    expect(runDecoder('?tab=eat')).toBeNull()
  })
})
