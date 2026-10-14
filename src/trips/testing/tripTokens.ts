import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export type ThemeMode = 'light' | 'dark'

const read = (file: string): string => readFileSync(resolve(process.cwd(), file), 'utf8')

const BLOCK: Record<ThemeMode, RegExp> = {
  light: /^\s*\.trip-app\s*\{([^}]*)\}/m,
  dark: /^\s*\.dark \.trip-app\s*\{([^}]*)\}/m,
}

/** `--trip-*` hex colours of src/index.css for one mode, keyed without the prefix ("topic-city"). */
export function readTripTokens(
  mode: ThemeMode,
  css: string = read('src/index.css')
): Record<string, string> {
  const block = BLOCK[mode].exec(css)?.[1]
  if (!block) throw new Error(`No .trip-app block for ${mode} mode in src/index.css`)
  const tokens: Record<string, string> = {}
  for (const match of block.matchAll(/--trip-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[match[1]] = match[2]
  }
  return tokens
}

/** True when tailwind.config.js maps `token` to `var(--trip-<token>)` (quoted or bare key). */
export function tailwindDefinesTripColour(
  token: string,
  config: string = read('tailwind.config.js')
): boolean {
  return new RegExp(`(?<![\\w-])['"]?${token}['"]?:\\s*'var\\(--trip-${token}\\)'`).test(config)
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2 contrast ratio between two `#rrggbb` colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}
