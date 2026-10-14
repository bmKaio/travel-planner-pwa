# Colour across v2 trips and a photo cover on "Hoy" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Carry the Guide hub's per-topic colour language across Hoy, Itinerario, Ayuda, the nav and the trip switcher, and replace the bare "Hoy" heading with a photo cover card showing the day's place, date and photo credit.

**Architecture:** One style map, `src/trips/components/sectionStyle.ts` (literal Tailwind class strings, same shape as `GUIDE_TOPIC_STYLE`), feeds every coloured component. `TripDay.cover?: DayCover` is authored in the trip content file (photos are Vite asset imports, precached by the service worker) and turned into a view model by the pure `buildCoverView` / `visibleCover` helpers; `DayCoverCard` only renders that view. Palette tests parse `src/index.css` and `tailwind.config.js`, so the contrast rule and the "token exists in both modes" rule are checked by `npm test`.

**Tech Stack:** React 18, React Router 7, Dexie 4, Tailwind 3 (CSS-variable palette), lucide-react 1.20, Vite 5 + vite-plugin-pwa (Workbox), Vitest 3.2 (`environment: node`), ffmpeg (libwebp) for image conversion.

**Spec:** `docs/superpowers/specs/2026-10-14-colour-and-today-cover-design.md` (binding). It builds on `docs/superpowers/specs/2026-10-14-responsive-guide-topics-design.md`. Executors read both, plus `CLAUDE.md`.

## Global Constraints

- UI copy in Spanish; code identifiers, types and comments in English.
- TypeScript strict with `noUnusedLocals` / `noUnusedParameters`: unused code fails `npm run build`.
- Prettier: no semicolons, single quotes, 2 spaces, `printWidth` 100, `trailingComma: es5`. Run `npx prettier --write <touched files>` before the checks.
- Components and pages never touch `tripsDb` directly; go through a hook in `src/trips/hooks/`.
- TDD for logic under `src/trips/`: observe RED before GREEN. Runner: `npm test` (Vitest 3, `environment: node`, only `src/**/*.test.ts`, TZ pinned to `America/Lima`; there is no component test setup, so UI is checked manually by the owner). Presentational-only edits have no unit test; their gate is typecheck, lint, build and the manual pass.
- Every task ends green on all four: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.
- Colour language (spec §1–§2): reuse the six guide topic tokens plus `trip-action`, `trip-urgent`, `trip-done`; **no new palette**. The only new token is `--trip-done-soft` (green soft). Unchanged: page background, action buttons (blue), done/urgent semantics, EmergencyCard look.
- Tailwind only generates classes it finds verbatim in the source: **literal class strings only**, kept in `sectionStyle.ts` / `guideTopicStyle.ts`; never build a class name by concatenating a colour name (`bg-trip-${x}`).
- Contrast rule (spec §1.6): the strong tone must reach **≥ 3:1 against its soft tone and against the card, in light and in dark**. Text on the photo stays readable through a gradient overlay.
- Data model (spec §3): `cover` is optional on a day; it is not indexed, so **no `TripsDB` version bump**. Images live in `src/trips/content/images/<tripId>/<slug>.webp`, are imported by the content file and are precached through `vite.config.ts` `workbox.globPatterns`.
- Photos (spec §5): Wikimedia Commons, free licences only (CC0, PD, CC BY, CC BY-SA); WebP, 1200 px wide, quality ~70, target ≤ 150 KB; `creditUrl` matches `^https://commons\.wikimedia\.org/`; credit link uses `target="_blank" rel="noopener noreferrer"`.
- Out of scope (spec §1): per-city colours, photos outside "Hoy" (Itinerario, Guía), legacy Vietnam screens.
- Content ships with `seedVersion` + 1 (13 → 14 at the time of writing). Re-read the file before bumping: another session may have changed it. Changing an image file changes its hashed URL, which is stored in IndexedDB with the day: any image change also needs a bump.
- Commits: conventional commits, **no `Co-Authored-By` and no AI attribution of any kind**. Do not push. Stage explicit paths only (never `git add .` / `-A`); `docs/peru/` and `odd/` stay untracked.
- `docs/peru/` stays untracked (private dossier and the T0 credits file); it is never committed.
- Snippets that quote existing code to replace ("replace X with Y") may be shown with different indentation than the file (Prettier reformats code blocks in this document); match on content, then run Prettier on the touched file.

## Review Focus

1. **Dark-mode fallback card legibility.** The spec puts white text on `bg-trip-topic-city`, but dark-mode turquoise is `#5fd3c4` and white on it is 1.81:1. The plain card uses the page background colour as text (5.05:1 light, 10.5:1 dark). Pinned by the `COVER_FALLBACK` contrast test in Task 4.
2. **A day with no cover** (older stored rows, a trip without photos, offline with stale data) must render the plain turquoise card titled with the trip name, never crash or show an empty box. Pinned by `buildCoverView` tests in Task 4 and a Dexie round-trip test in Task 4.
3. **The photo fails to load** (offline before the precache finished, a 404 after a deploy, a blocked request) must fall back to the plain card instead of a broken-image icon with unreadable white text. Pinned by `visibleCover` tests in Task 4; the `onError` wiring is a manual check (DevTools → block the request).
4. **Image file replaced without a `seedVersion` bump.** The hashed URL is stored in IndexedDB with the day, so installed devices would keep pointing at a file the new service worker no longer precaches. No automated pin is possible (the hash is a build artefact); the rule is in the content-file header comment and in the Global Constraints (Task 5).
5. **A long place name on a 320 px wide phone.** "Valle del Colca" at 32 px wraps to two lines; the card uses `min-h` (not a fixed height) so it grows instead of clipping text. Manual check in Task 4 (DevTools device toolbar, 320 px) and Task 5 (every Peru place).

## Spec gaps resolved in this plan

- **Fallback text colour** (Review Focus 1): `text-trip-bg` instead of white.
- **"Icon in a soft circle" on every card** is applied where the component already has an icon slot (LegList, StayCard, StayRow, FreeTimeIdeas) or gets one at the head of a new card (HelpCard), plus the section headings the spec lists. PlanList, EatList and SeeList get the coloured left edge only; their rows already lead with a time or a label.
- **NowCard "when the item is a plan item"**: `NowCard` only ever shows a plan item, so it is always `plan`-coloured. Its free-time ideas box stays `see`-coloured (FreeTimeIdeas).
- **`emergency` entry**: kept in the map because the spec table lists it (and a test pins the table), but `EmergencyCard` keeps its own red classes ("unchanged look").
- **Trip switcher stripe "in registry order"**: the stripe index is the trip's position in `TRIPS` (stable whatever the display order), cycling through `GUIDE_TOPIC_STYLE` stripes (history, city, food, drink, curiosity, tip). `hover:border-trip-ink` on `TripCard` would repaint the stripe, so it becomes `active:bg-trip-soft` like the Guide cards.
- **Eyebrow** reads "Hoy · Día N de M" even before or after the trip, as the old header did; the existing banner explains the situation.
- **Not touched** (spec lists no colour for them): `DayStrip`, `GuideCardList` ("Para saber más", "Salud y precauciones" cards), Itinerario section headings ("Transporte", "Si os sobra tiempo"). Headings get icons on Hoy and Ayuda only, as the spec says.
- **Spec §5 "Day" column** holds calendar dates (17–28 Oct = days 1–12): 12 days, 11 distinct photos, day 27 reuses day 23.
- **Card height** is `min-h-[200px] sm:min-h-[260px]` (Review Focus 5); the photo is absolutely positioned and covers whatever height results.

## File Structure

| File                                                                                                                                                                                                   | Responsibility                                                                  | Task |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ---- |
| `src/trips/content/images/peru-2026/*.webp`                                                                                                                                                            | The 11 cover photos                                                             | 0    |
| `src/index.css`, `tailwind.config.js`                                                                                                                                                                  | `--trip-done-soft` token (both modes) and its Tailwind colour                   | 1    |
| `src/trips/testing/tripTokens.ts` (+ test)                                                                                                                                                             | Test helpers: read palette from CSS, Tailwind registration check, WCAG contrast | 1    |
| `src/trips/components/sectionStyle.ts` (+ test)                                                                                                                                                        | `SECTION_STYLE`, `NAV_STYLE`, `tripStripe`, `COVER_FALLBACK`                    | 1, 4 |
| `PlanList`, `EatList`, `SeeList`, `LegList`, `StayCard`, `StayRow`, `FreeTimeIdeas`, `TabBar`                                                                                                          | Section colours on Itinerario and Hoy lists                                     | 2    |
| `SectionIcon`, `SectionHeading`, `NowCard`, `HelpCard`, `ContactList`, `DocList`, `ChecklistGroup`, `NotesEditor`, `TripNav`, `TripCard` + `TodayPage`, `HelpPage`, `ChecklistSection`, `TripSwitcher` | Headings, Ayuda, nav, switcher                                                  | 3    |
| `src/trips/types.ts`, `domain/dates.ts`, `domain/dayCover.ts` (+ tests)                                                                                                                                | `DayCover`, `formatDayCount`, `buildCoverView`, `visibleCover`                  | 4    |
| `DayCoverCard.tsx`, `TodayPage.tsx`, `vite.config.ts`, `content.test.ts`, `seedSync.test.ts`                                                                                                           | Cover card, integration, webp precache, content guards                          | 4    |
| `src/trips/content/peru-2026.ts`, `content.test.ts`                                                                                                                                                    | Covers in the content, `seedVersion` + 1, "every day has a cover" + size guards | 5    |

---

### Task 0: Photo research and conversion (no code)

**Files:**

- Create: `src/trips/content/images/peru-2026/<slug>.webp` × 11 (committed)
- Create: `docs/peru/portadas-creditos.md` (untracked, never committed; Task 5 reads it)

**Interfaces:**

- Produces: eleven files named exactly as in the table below, and a credits table with one row per slug holding `slug`, Commons file title, `creditUrl`, author, licence, `credit` (`Autor · Licencia`), `alt` (Spanish). Task 5 copies these values verbatim.

Photo list (spec §5). The slugs are fixed: Task 5 imports these exact paths.

| Slug                   | Days (Oct) | `place` shown   | Motif              | Search seeds (Commons)                            |
| ---------------------- | ---------- | --------------- | ------------------ | ------------------------------------------------- |
| `lima-miraflores`      | 17         | Lima            | Miraflores coast   | `Miraflores Lima coast`, `Malecón Miraflores`     |
| `lima-plaza-de-armas`  | 18         | Lima            | Plaza de Armas     | `Plaza Mayor Lima`, `Plaza de Armas Lima`         |
| `arequipa-misti`       | 19         | Arequipa        | City with El Misti | `Arequipa Misti`, `Arequipa Plaza de Armas Misti` |
| `colca-terrazas`       | 20         | Valle del Colca | Terraces           | `Colca valley terraces`, `Valle del Colca`        |
| `puno-titicaca`        | 21         | Puno            | Titicaca bay       | `Puno Lake Titicaca bay`                          |
| `uros-islas`           | 22         | Lago Titicaca   | Uros islands       | `Uros floating islands`                           |
| `cusco-plaza-de-armas` | 23, 27     | Cusco           | Plaza de Armas     | `Cusco Plaza de Armas`                            |
| `cusco-san-blas`       | 24         | Cusco           | San Blas           | `San Blas Cusco`                                  |
| `ollantaytambo`        | 25         | Valle Sagrado   | Ollantaytambo      | `Ollantaytambo`                                   |
| `machu-picchu`         | 26         | Machu Picchu    | Machu Picchu       | `Machu Picchu`                                    |
| `madrid`               | 28         | Madrid          | Madrid             | `Madrid skyline`, `Gran Vía Madrid`               |

Selection rules for every photo:

- Licence (Commons `LicenseShortName`) is one of `CC0`, `Public domain` / `PD-*`, `CC BY 2.0|3.0|4.0`, `CC BY-SA 2.0|3.0|4.0`. Reject NC, ND, GFDL-only, "fair use" and anything unclear.
- A landscape photograph, width ≥ 1600 px and width/height ≥ 1.4 (no scans, drawings or logos), daylight, no watermark or large text, no close-up of identifiable people.
- The subject sits in the vertical middle third: the card crops to about 1.8:1 on phones and up to 2.8:1 on tablets (`object-cover`, centred).
- Prefer Commons "Featured pictures" / "Quality images" when one fits.

- [ ] **Step 1: Prepare a scratch directory and helpers** (outside the repo; downloaded files are untrusted data, never run anything from that directory)

```bash
WORK="$(mktemp -d)"
UA='travel-planner-pwa/1.0 (https://github.com/bmKaio/travel-planner-pwa; family trip photo lookup)'

# Search Commons files: title, size, original URL, file page, licence, author.
commons_search() { # $1 = search text
  curl -sS -m 30 -A "$UA" -G 'https://commons.wikimedia.org/w/api.php' \
    --data-urlencode 'action=query' --data-urlencode 'format=json' \
    --data-urlencode 'generator=search' --data-urlencode "gsrsearch=$1 filetype:bitmap" \
    --data-urlencode 'gsrnamespace=6' --data-urlencode 'gsrlimit=15' \
    --data-urlencode 'prop=imageinfo' --data-urlencode 'iiprop=url|size|extmetadata' \
    --data-urlencode 'iiextmetadatafilter=Artist|LicenseShortName' |
    jq -r '.query.pages[] | [.title, "\(.imageinfo[0].width)x\(.imageinfo[0].height)", .imageinfo[0].extmetadata.LicenseShortName.value, (.imageinfo[0].extmetadata.Artist.value | gsub("<[^>]*>"; ""))] | @tsv'
}

# Full record of one chosen file.
commons_info() { # $1 = exact title, e.g. "File:Lima Peru coast.jpg"
  curl -sS -m 30 -A "$UA" -G 'https://commons.wikimedia.org/w/api.php' \
    --data-urlencode 'action=query' --data-urlencode 'format=json' \
    --data-urlencode "titles=$1" --data-urlencode 'prop=imageinfo' \
    --data-urlencode 'iiprop=url|size|extmetadata' \
    --data-urlencode 'iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl' |
    jq '.query.pages[] | {title, original: .imageinfo[0].url, page: .imageinfo[0].descriptionurl, width: .imageinfo[0].width, height: .imageinfo[0].height, licence: .imageinfo[0].extmetadata.LicenseShortName.value, author: (.imageinfo[0].extmetadata.Artist.value | gsub("<[^>]*>"; ""))}'
}

# Convert to 1200 px wide WebP (never upscale), lowering quality until the file is <= 150 KB.
to_webp() { # $1 = downloaded file, $2 = slug
  local out="src/trips/content/images/peru-2026/$2.webp" q
  mkdir -p "$(dirname "$out")"
  for q in 70 62 54 46; do
    ffmpeg -y -hide_banner -loglevel error -i "$1" -vf "scale='min(1200,iw)':-2" \
      -c:v libwebp -quality "$q" -compression_level 6 -frames:v 1 "$out"
    if [ "$(stat -c %s "$out")" -le 153600 ]; then
      echo "$2 q=$q $(stat -c %s "$out") bytes"
      return 0
    fi
  done
  echo "$2 is still above 150 KB at q=46: choose another photo" >&2
  return 1
}
```

If the network is blocked or Commons answers repeatedly with 429/403, stop and report `blocked`; do not look for photos on other sites.

- [ ] **Step 2: Pick one file per row.** For each slug run the search seeds (`commons_search 'Miraflores Lima coast'`), shortlist 2–3 candidates that pass the selection rules, then confirm the winner with `commons_info "File:<exact title>"`. Keep the exact Commons title, the `page` URL (this is the `creditUrl`), the plain-text author and the `licence`. Wait 1–2 s between requests.

- [ ] **Step 3: Download the originals** (host `upload.wikimedia.org`, the `original` URL from `commons_info`; strip the `?utm_…` query if present). On HTTP 429 wait 20 s and retry, at most 3 times.

```bash
curl -sS -L -m 120 -A "$UA" -o "$WORK/<slug>.orig" "<original URL>"
sleep 2
```

If an original is larger than 30 MB, add `--data-urlencode 'iiurlwidth=1280'` to the `commons_info` request, download `.imageinfo[0].thumburl` instead, and note it in the report.

- [ ] **Step 4: Convert** from the repository root: `to_webp "$WORK/<slug>.orig" <slug>` for every slug. Expected: eleven lines `<slug> q=<n> <bytes> bytes`, each ≤ 153600.

- [ ] **Step 5: Check the composition.** Make a crop preview at the tablet ratio for each file and open both the converted file and the preview with the Read tool:

```bash
ffmpeg -y -hide_banner -loglevel error -i src/trips/content/images/peru-2026/<slug>.webp \
  -vf "crop=iw:'min(ih,iw/2.8)'" "$WORK/<slug>-crop.png"
```

Reject and replace a photo whose subject is cut away by the 2.8:1 crop, or that is dark/flat enough to need a different overlay. Also verify the licence once more against the Commons file page text if `LicenseShortName` looked unusual.

- [ ] **Step 6: Write the credits table** to `docs/peru/portadas-creditos.md` (untracked) and paste the same table in the task report. One row per slug, values exact:

```markdown
| slug            | commons title                  | creditUrl                                                 | author   | licence   | credit               | alt (Spanish)                                   |
| --------------- | ------------------------------ | --------------------------------------------------------- | -------- | --------- | -------------------- | ----------------------------------------------- |
| lima-miraflores | File:<exact Commons file name> | https://commons.wikimedia.org/wiki/File:<exact_file_name> | <author> | <licence> | <author> · <licence> | <what the photo shows, in Spanish, ≤ 120 chars> |
```

Rules: `credit` is `Autor · Licencia` (for CC licences use the Commons short name, e.g. `CC BY-SA 4.0`; for public domain write `Dominio público`; for an unnamed author write `Autor desconocido`). `alt` describes the photo for a screen reader and is in Spanish. `creditUrl` is the Commons file page, `https`.

- [ ] **Step 7: Verify and commit** (images only)

Run: `ls -l src/trips/content/images/peru-2026/ && file src/trips/content/images/peru-2026/*.webp`
Expected: 11 files, each ≤ 153600 bytes, each `Web/P image, … 1200x…` (or the smaller original width).

Run: `git status --short`
Expected: only the 11 new `.webp` files plus the already-untracked `docs/peru/` and `odd/…` entries.

```bash
git add src/trips/content/images/peru-2026/*.webp
git commit -m "chore(trips): add Peru day cover photos"
```

The photos are unreferenced until Task 5; Vite only emits imported assets, so the build is unchanged.

---

### Task 1: Section colour map, `--trip-done-soft` token and palette tests

**Files:**

- Create: `src/trips/testing/tripTokens.ts`, `src/trips/testing/tripTokens.test.ts`
- Create: `src/trips/components/sectionStyle.ts`, `src/trips/components/sectionStyle.test.ts`
- Modify: `src/index.css` (token, both modes)
- Modify: `tailwind.config.js` (`done-soft`)

**Interfaces:**

- Produces (test helpers, `src/trips/testing/tripTokens.ts`):
  - `type ThemeMode = 'light' | 'dark'`
  - `readTripTokens(mode: ThemeMode, css?: string): Record<string, string>`: `--trip-*` hex colours of `src/index.css`, keyed without the prefix (`'topic-city'`, `'card'`)
  - `tailwindDefinesTripColour(token: string, config?: string): boolean`
  - `contrastRatio(a: string, b: string): number` (WCAG, hex `#rrggbb`)
- Produces (`src/trips/components/sectionStyle.ts`):
  - `type SectionKey = 'plan' | 'eat' | 'see' | 'leg' | 'stay' | 'emergency' | 'consular' | 'health' | 'private' | 'checklist' | 'notes'`
  - `type SectionStyle = GuideTopicStyle` (`{ icon: LucideIcon; edge; stripe; ink; soft }`)
  - `SECTION_STYLE: Record<SectionKey, SectionStyle>`
  - `type NavKey = 'today' | 'itinerary' | 'guide' | 'help'`; `interface NavStyle { bar: string; ink: string }`; `NAV_STYLE: Record<NavKey, NavStyle>`
  - `tripStripe(index: number): string`: top-border class for the trip at registry position `index`, cycling, never `undefined`

- [ ] **Step 1: Write the failing helper tests** in `src/trips/testing/tripTokens.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { contrastRatio, readTripTokens, tailwindDefinesTripColour } from './tripTokens'

describe('contrastRatio', () => {
  it('is 21 for black on white, in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
  })

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#1b7543', '#1b7543')).toBeCloseTo(1, 5)
  })

  it('matches the WCAG reference value for #767676 on white (4.54)', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 1)
  })
})

describe('readTripTokens', () => {
  const css = `
    .trip-app {
      --trip-card: #ffffff;
      --trip-topic-city: #0f766e;
      --not-trip: #123456;
    }

    .dark .trip-app {
      --trip-card: #1a1d21;
    }
  `

  it('reads the light block without the prefix, ignoring other variables', () => {
    expect(readTripTokens('light', css)).toEqual({ card: '#ffffff', 'topic-city': '#0f766e' })
  })

  it('reads the dark block', () => {
    expect(readTripTokens('dark', css)).toEqual({ card: '#1a1d21' })
  })

  it('throws when the block is missing', () => {
    expect(() => readTripTokens('dark', '.trip-app { --trip-card: #ffffff; }')).toThrow(
      'No .trip-app block'
    )
  })

  it('reads the real palette, which defines the card colour in both modes', () => {
    expect(readTripTokens('light').card).toBe('#ffffff')
    expect(readTripTokens('dark').card).toBe('#1a1d21')
  })
})

describe('tailwindDefinesTripColour', () => {
  const config = `
    colors: {
      done: 'var(--trip-done)',
      'done-ink': 'var(--trip-done-ink)',
      'topic-city': 'var(--trip-topic-city)',
    }
  `

  it('finds quoted and unquoted keys', () => {
    expect(tailwindDefinesTripColour('done', config)).toBe(true)
    expect(tailwindDefinesTripColour('topic-city', config)).toBe(true)
  })

  it('does not mistake a longer key for the token', () => {
    expect(tailwindDefinesTripColour('done-soft', config)).toBe(false)
    expect(tailwindDefinesTripColour('city', config)).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify RED**

Run: `npm test -- src/trips/testing/tripTokens.test.ts`
Expected: FAIL, `Failed to resolve import "./tripTokens"`.

- [ ] **Step 3: Write the helpers** in `src/trips/testing/tripTokens.ts`:

```ts
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
```

- [ ] **Step 4: Run to verify GREEN**

Run: `npm test -- src/trips/testing/tripTokens.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Write the failing map tests** in `src/trips/components/sectionStyle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { GUIDE_TOPIC_STYLE } from './guideTopicStyle'
import { NAV_STYLE, SECTION_STYLE, tripStripe, type NavKey, type SectionKey } from './sectionStyle'
import {
  contrastRatio,
  readTripTokens,
  tailwindDefinesTripColour,
  type ThemeMode,
} from '../testing/tripTokens'

// The spec's colour map (§2): the token each section takes. Pinning it here means a section
// added or recoloured in the code must also change the spec table.
const SECTION_TOKEN: Record<SectionKey, string> = {
  plan: 'topic-city',
  eat: 'topic-food',
  see: 'topic-history',
  leg: 'topic-tip',
  stay: 'topic-drink',
  emergency: 'urgent',
  consular: 'topic-tip',
  health: 'topic-food',
  private: 'topic-drink',
  checklist: 'done',
  notes: 'topic-history',
}

// Spec §2 "Nav": colour of the active item.
const NAV_TOKEN: Record<NavKey, string> = {
  today: 'action',
  itinerary: 'topic-city',
  guide: 'topic-curiosity',
  help: 'urgent',
}

const MODES: ThemeMode[] = ['light', 'dark']
const sectionKeys = Object.keys(SECTION_TOKEN) as SectionKey[]
const navKeys = Object.keys(NAV_TOKEN) as NavKey[]
const palette = { light: readTripTokens('light'), dark: readTripTokens('dark') }
const strongTokens = [...new Set([...Object.values(SECTION_TOKEN), ...Object.values(NAV_TOKEN)])]
const softTokens = [...new Set(Object.values(SECTION_TOKEN))].map((token) => `${token}-soft`)

describe('SECTION_STYLE', () => {
  it('covers exactly the sections of the spec table', () => {
    expect(Object.keys(SECTION_STYLE).sort()).toEqual([...sectionKeys].sort())
    expect(sectionKeys).toHaveLength(11)
  })

  it.each(sectionKeys)('%s takes the colour fixed by the spec, with literal classes', (key) => {
    const token = SECTION_TOKEN[key]
    const style = SECTION_STYLE[key]
    expect(style.ink).toBe(`text-trip-${token}`)
    expect(style.soft).toBe(`bg-trip-${token}-soft`)
    expect(style.edge).toBe(`border-l-trip-${token}`)
    expect(style.stripe).toBe(`border-t-trip-${token}`)
    expect(style.icon).toBeDefined()
  })
})

describe('NAV_STYLE', () => {
  it('has exactly the four nav items of the spec', () => {
    expect(Object.keys(NAV_STYLE).sort()).toEqual([...navKeys].sort())
  })

  it.each(navKeys)('%s colours its top bar and icon with the spec token', (key) => {
    expect(NAV_STYLE[key].bar).toBe(`before:bg-trip-${NAV_TOKEN[key]}`)
    expect(NAV_STYLE[key].ink).toBe(`text-trip-${NAV_TOKEN[key]}`)
  })
})

describe('palette', () => {
  it.each(MODES)('%s mode defines every strong and soft colour the maps use', (mode) => {
    for (const token of [...strongTokens, ...softTokens]) {
      expect(palette[mode][token], `${mode} --trip-${token}`).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('registers every strong and soft colour with Tailwind', () => {
    for (const token of [...strongTokens, ...softTokens]) {
      expect(tailwindDefinesTripColour(token), `tailwind.config.js ${token}`).toBe(true)
    }
  })

  it.each(MODES)(
    '%s mode: each strong tone reaches 3:1 on its soft tone and on the card',
    (mode) => {
      const colours = palette[mode]
      for (const key of sectionKeys) {
        const token = SECTION_TOKEN[key]
        expect(
          contrastRatio(colours[token], colours[`${token}-soft`]),
          `${key} on soft`
        ).toBeGreaterThanOrEqual(3)
        expect(
          contrastRatio(colours[token], colours.card),
          `${key} on card`
        ).toBeGreaterThanOrEqual(3)
      }
    }
  )

  it.each(MODES)('%s mode: the active nav tones reach 3:1 on the nav card', (mode) => {
    const colours = palette[mode]
    for (const key of navKeys) {
      const token = NAV_TOKEN[key]
      expect(contrastRatio(colours[token], colours.card), `${key} on card`).toBeGreaterThanOrEqual(
        3
      )
    }
  })
})

describe('tripStripe', () => {
  const count = Object.keys(GUIDE_TOPIC_STYLE).length

  it('follows the guide topic order, one stripe per trip', () => {
    expect(tripStripe(0)).toBe(GUIDE_TOPIC_STYLE.history.stripe)
    expect(tripStripe(1)).toBe(GUIDE_TOPIC_STYLE.city.stripe)
  })

  it('cycles when there are more trips than topic colours', () => {
    expect(tripStripe(count)).toBe(tripStripe(0))
    expect(tripStripe(count + 1)).toBe(tripStripe(1))
  })

  it('never returns undefined, even for a trip missing from the registry (index -1)', () => {
    expect(tripStripe(-1)).toBe(GUIDE_TOPIC_STYLE.tip.stripe)
  })
})
```

- [ ] **Step 6: Run to verify RED**

Run: `npm test -- src/trips/components/sectionStyle.test.ts`
Expected: FAIL, `Failed to resolve import "./sectionStyle"`.

- [ ] **Step 7: Add the token.** In `src/index.css`, after `--trip-done-ink: #ffffff;` (light block) add:

```css
--trip-done-soft: #dff3e7;
```

and after `--trip-done-ink: #0e1013;` (inside `.dark .trip-app`) add:

```css
--trip-done-soft: #16301f;
```

Measured contrast of the new pair (strong `--trip-done` on soft): light 4.93:1, dark 7.05:1.

In `tailwind.config.js`, after `'done-ink': 'var(--trip-done-ink)',` add:

```js
          'done-soft': 'var(--trip-done-soft)',
```

- [ ] **Step 8: Write the map** in `src/trips/components/sectionStyle.ts`:

```ts
import {
  BedDouble,
  Building2,
  CalendarClock,
  Camera,
  HeartPulse,
  ListChecks,
  Lock,
  NotebookPen,
  Route,
  Siren,
  UtensilsCrossed,
} from 'lucide-react'
import { GUIDE_TOPIC_STYLE, type GuideTopicStyle } from './guideTopicStyle'

export type SectionKey =
  | 'plan'
  | 'eat'
  | 'see'
  | 'leg'
  | 'stay'
  | 'emergency'
  | 'consular'
  | 'health'
  | 'private'
  | 'checklist'
  | 'notes'

/** Same shape as a guide topic: icon, left edge, top stripe, strong text colour, soft background. */
export type SectionStyle = GuideTopicStyle

// Literal class strings: Tailwind only generates classes it finds verbatim in the source.
// The section -> token table is spec §2; src/trips/components/sectionStyle.test.ts pins it.
export const SECTION_STYLE: Record<SectionKey, SectionStyle> = {
  plan: {
    icon: CalendarClock,
    edge: 'border-l-trip-topic-city',
    stripe: 'border-t-trip-topic-city',
    ink: 'text-trip-topic-city',
    soft: 'bg-trip-topic-city-soft',
  },
  eat: {
    icon: UtensilsCrossed,
    edge: 'border-l-trip-topic-food',
    stripe: 'border-t-trip-topic-food',
    ink: 'text-trip-topic-food',
    soft: 'bg-trip-topic-food-soft',
  },
  see: {
    icon: Camera,
    edge: 'border-l-trip-topic-history',
    stripe: 'border-t-trip-topic-history',
    ink: 'text-trip-topic-history',
    soft: 'bg-trip-topic-history-soft',
  },
  leg: {
    icon: Route,
    edge: 'border-l-trip-topic-tip',
    stripe: 'border-t-trip-topic-tip',
    ink: 'text-trip-topic-tip',
    soft: 'bg-trip-topic-tip-soft',
  },
  stay: {
    icon: BedDouble,
    edge: 'border-l-trip-topic-drink',
    stripe: 'border-t-trip-topic-drink',
    ink: 'text-trip-topic-drink',
    soft: 'bg-trip-topic-drink-soft',
  },
  // Listed by the spec; EmergencyCard keeps its own red classes ("unchanged look").
  emergency: {
    icon: Siren,
    edge: 'border-l-trip-urgent',
    stripe: 'border-t-trip-urgent',
    ink: 'text-trip-urgent',
    soft: 'bg-trip-urgent-soft',
  },
  consular: {
    icon: Building2,
    edge: 'border-l-trip-topic-tip',
    stripe: 'border-t-trip-topic-tip',
    ink: 'text-trip-topic-tip',
    soft: 'bg-trip-topic-tip-soft',
  },
  health: {
    icon: HeartPulse,
    edge: 'border-l-trip-topic-food',
    stripe: 'border-t-trip-topic-food',
    ink: 'text-trip-topic-food',
    soft: 'bg-trip-topic-food-soft',
  },
  private: {
    icon: Lock,
    edge: 'border-l-trip-topic-drink',
    stripe: 'border-t-trip-topic-drink',
    ink: 'text-trip-topic-drink',
    soft: 'bg-trip-topic-drink-soft',
  },
  checklist: {
    icon: ListChecks,
    edge: 'border-l-trip-done',
    stripe: 'border-t-trip-done',
    ink: 'text-trip-done',
    soft: 'bg-trip-done-soft',
  },
  notes: {
    icon: NotebookPen,
    edge: 'border-l-trip-topic-history',
    stripe: 'border-t-trip-topic-history',
    ink: 'text-trip-topic-history',
    soft: 'bg-trip-topic-history-soft',
  },
}

export type NavKey = 'today' | 'itinerary' | 'guide' | 'help'

export interface NavStyle {
  /** Background of the 3px top bar of the active item (applied on its `before:` pseudo-element). */
  bar: string
  /** Icon colour of the active item. */
  ink: string
}

export const NAV_STYLE: Record<NavKey, NavStyle> = {
  today: { bar: 'before:bg-trip-action', ink: 'text-trip-action' },
  itinerary: { bar: 'before:bg-trip-topic-city', ink: 'text-trip-topic-city' },
  guide: { bar: 'before:bg-trip-topic-curiosity', ink: 'text-trip-topic-curiosity' },
  help: { bar: 'before:bg-trip-urgent', ink: 'text-trip-urgent' },
}

// Trip switcher stripes reuse the guide topic stripes, in their order (no new literal classes).
const TRIP_STRIPES = Object.values(GUIDE_TOPIC_STYLE).map((style) => style.stripe)

/** Top-border class of the trip at registry position `index`; cycles, and tolerates -1. */
export function tripStripe(index: number): string {
  const count = TRIP_STRIPES.length
  return TRIP_STRIPES[((index % count) + count) % count]
}
```

- [ ] **Step 9: Run to verify GREEN**

Run: `npm test -- src/trips/components/sectionStyle.test.ts`
Expected: PASS. If a contrast assertion fails, the message names the mode and section; fix the colour value in `src/index.css`, never the threshold.

- [ ] **Step 10: Format, then run the full gate**

Run: `npx prettier --write src/trips/testing/tripTokens.ts src/trips/testing/tripTokens.test.ts src/trips/components/sectionStyle.ts src/trips/components/sectionStyle.test.ts tailwind.config.js src/index.css`
Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed.

Run: `grep -c 'bg-trip-done-soft' dist/assets/*.css` and `grep -cF 'before\:bg-trip-urgent' dist/assets/*.css`
Expected: both ≥ 1 (Tailwind generated the new literal classes).

- [ ] **Step 11: Commit**

```bash
git add src/index.css tailwind.config.js src/trips/testing/tripTokens.ts src/trips/testing/tripTokens.test.ts src/trips/components/sectionStyle.ts src/trips/components/sectionStyle.test.ts
git commit -m "feat(trips): add the section colour map and the done-soft token"
```

---

### Task 2: Itinerario colours (lists, stay, free-time ideas, tabs)

These components are shared with Hoy (`PlanList`, `StayCard`, `LegList`, `FreeTimeIdeas`), so Hoy's lists change too. Presentational only: no unit tests; the gate is typecheck/lint/build plus the manual pass.

**Files:**

- Modify: `src/trips/components/PlanList.tsx`, `EatList.tsx`, `SeeList.tsx`, `LegList.tsx`, `StayCard.tsx`, `StayRow.tsx`, `FreeTimeIdeas.tsx`, `TabBar.tsx`

**Interfaces:**

- Consumes: `SECTION_STYLE` (Task 1). `TabBar` indexes it with `ItineraryTab` (`'plan' | 'eat' | 'see'`), a subset of `SectionKey`.
- Produces: no new exports.

- [ ] **Step 1: `PlanList.tsx`.** After the `FreeTimeIdeas` import add the style import and a module constant:

```tsx
import FreeTimeIdeas, { type FreeTimeIdeasData } from './FreeTimeIdeas'
import { SECTION_STYLE } from './sectionStyle'

const { edge } = SECTION_STYLE.plan
```

Replace the list opening tag

```tsx
    <ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">
```

with

```tsx
    <ul className={`rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card px-4`}>
```

- [ ] **Step 2: `EatList.tsx`.** Same change with the `eat` colour:

```tsx
import MapsLink from './MapsLink'
import { SECTION_STYLE } from './sectionStyle'

const { edge } = SECTION_STYLE.eat
```

and replace the `<ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">` line with

```tsx
    <ul className={`rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card px-4`}>
```

- [ ] **Step 3: `SeeList.tsx`.** Same, `see` colour (it applies to both groups, planned and "Si os sobra tiempo", because both render through `SeeGroup`):

```tsx
import MapsLink from './MapsLink'
import { SECTION_STYLE } from './sectionStyle'

const { edge } = SECTION_STYLE.see
```

and in `SeeGroup` replace the `<ul className="rounded-[20px] border border-trip-line bg-trip-card px-4">` line with

```tsx
    <ul className={`rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card px-4`}>
```

- [ ] **Step 4: `LegList.tsx`.** Add `import { SECTION_STYLE } from './sectionStyle'` after the `MapsLink` import and, after `MODE_ICON`:

```tsx
const { edge, ink, soft } = SECTION_STYLE.leg
```

Replace the list opening tag with

```tsx
    <ul className={`rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card px-4`}>
```

and replace the icon block

```tsx
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trip-soft">
  <Icon className="h-5 w-5" aria-hidden="true" />
</div>
```

with

```tsx
<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${soft}`}>
  <Icon className={`h-5 w-5 ${ink}`} aria-hidden="true" />
</div>
```

- [ ] **Step 5: `StayCard.tsx`** (full file; the icon now comes from the map, so the direct `BedDouble` import goes away):

```tsx
import type { Stay } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'
import PhoneLink from './PhoneLink'
import { SECTION_STYLE } from './sectionStyle'

const { icon: StayIcon, edge, ink, soft } = SECTION_STYLE.stay

function StayCard({ stay }: { stay: Stay }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card p-[18px]`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${soft}`}>
          <StayIcon className={`h-6 w-6 ${ink}`} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-lg font-semibold">{stay.name}</p>
          <p className="text-base text-trip-muted">{stay.meta}</p>
        </div>
      </div>
      <MapsLink href={directionsUrl(stay.q)} variant="primary" className="w-full">
        Cómo llegar al alojamiento
      </MapsLink>
      {stay.phone && (
        <PhoneLink number={stay.phone} variant="ghost" className="w-full">
          Llamar
        </PhoneLink>
      )}
    </div>
  )
}

export default StayCard
```

- [ ] **Step 6: `StayRow.tsx`** (full file):

```tsx
import type { Stay } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import { NO_STAY_TEXT } from '../domain/stayCopy'
import MapsLink from './MapsLink'
import { SECTION_STYLE } from './sectionStyle'

const { icon: StayIcon, edge, ink, soft } = SECTION_STYLE.stay

function StayRow({ stay }: { stay: Stay | null }) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card p-4`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${soft}`}>
        <StayIcon className={`h-[22px] w-[22px] ${ink}`} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[17px] font-semibold">{stay ? stay.name : NO_STAY_TEXT}</p>
        {stay && <p className="text-[15px] text-trip-muted">{stay.meta}</p>}
      </div>
      {stay && (
        <MapsLink href={directionsUrl(stay.q)} icon={false} className="px-3">
          Cómo llegar
        </MapsLink>
      )}
    </div>
  )
}

export default StayRow
```

- [ ] **Step 7: `FreeTimeIdeas.tsx`.** The ideas are the day's alternative sights, so the box takes the `see` colour. Add after the `buttonStyles` import:

```tsx
import { SECTION_STYLE } from './sectionStyle'

const { edge, soft } = SECTION_STYLE.see
```

and replace

```tsx
    <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-trip-soft p-3">
```

with

```tsx
    <div className={`mt-2 flex flex-col gap-2 rounded-2xl border-l-4 ${edge} ${soft} p-3`}>
```

- [ ] **Step 8: `TabBar.tsx`.** The active tab takes its section's soft background and strong text (spec §2). Add `import { SECTION_STYLE } from './sectionStyle'` after the `itinerary` import and replace the `.map` callback body:

```tsx
{
  tabs.map((tab) => {
    const { soft, ink } = SECTION_STYLE[tab.id]
    return (
      <button
        key={tab.id}
        id={tabId(tab.id)}
        type="button"
        role="tab"
        aria-selected={tab.id === active}
        aria-controls={tabPanelId(tab.id)}
        onClick={() => onChange(tab.id)}
        className={`min-h-[44px] flex-1 rounded-xl text-base ${
          tab.id === active
            ? `${soft} ${ink} font-semibold shadow-sm`
            : 'font-medium text-trip-muted'
        }`}
      >
        {tab.label}
      </button>
    )
  })
}
```

- [ ] **Step 9: Format and run the full gate**

Run: `npx prettier --write src/trips/components/PlanList.tsx src/trips/components/EatList.tsx src/trips/components/SeeList.tsx src/trips/components/LegList.tsx src/trips/components/StayCard.tsx src/trips/components/StayRow.tsx src/trips/components/FreeTimeIdeas.tsx src/trips/components/TabBar.tsx`
Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed (a leftover `BedDouble` import or an unused variable fails the build).

- [ ] **Step 10: Manual pass (owner)** with `npm run build && npm run preview`, light and dark (`localStorage.setItem('theme','dark')` then reload, or the OS setting):
  - Itinerario: Plan tab turquoise edge, Comer terracotta, Visitar amber, "Transporte" indigo; the stay row purple with a soft circle.
  - The active tab shows its soft background and strong text and is distinguishable from the grey tab bar in both modes. If a soft tone is too close to the bar, report it; do not add classes outside `sectionStyle.ts`.
  - A free-time row (Plan tab, "Tarde libre") shows the amber "Ideas" box.
  - Hoy: the plan list, the stay card and the transport list carry the same colours.

- [ ] **Step 11: Commit**

```bash
git add src/trips/components/PlanList.tsx src/trips/components/EatList.tsx src/trips/components/SeeList.tsx src/trips/components/LegList.tsx src/trips/components/StayCard.tsx src/trips/components/StayRow.tsx src/trips/components/FreeTimeIdeas.tsx src/trips/components/TabBar.tsx
git commit -m "feat(trips): colour the itinerary lists and tabs by section"
```

---

### Task 3: Hoy headings and NowCard, Ayuda, nav and trip switcher

Presentational only: no unit tests (the colour logic is tested in Task 1); the gate is typecheck/lint/build plus the manual pass.

**Files:**

- Create: `src/trips/components/SectionIcon.tsx`, `src/trips/components/SectionHeading.tsx`
- Modify: `NowCard.tsx`, `HelpCard.tsx`, `ContactList.tsx`, `DocList.tsx`, `ChecklistGroup.tsx`, `NotesEditor.tsx`, `TripNav.tsx`, `TripCard.tsx` (all in `src/trips/components/`)
- Modify: `src/trips/pages/TodayPage.tsx`, `HelpPage.tsx`, `ChecklistSection.tsx`, `TripSwitcher.tsx`

**Interfaces:**

- Consumes: `SECTION_STYLE`, `SectionKey`, `NAV_STYLE`, `NavKey`, `tripStripe` (Task 1).
- Produces:
  - `SectionIcon({ section: SectionKey; icon?: LucideIcon })`: 36 px soft circle with the section's icon (or an override), tinted with the section colour
  - `SectionHeading({ section: SectionKey; children: ReactNode; icon?: LucideIcon; id?: string; size?: 'md' | 'lg' })`: `h2` with a `SectionIcon`; `id` is set on the `h2`; `md` = `text-xl`, `lg` = `text-2xl`
  - `HelpCard` gains a required prop `section: 'consular' | 'private'`
  - `TripCard` gains a required prop `accentIndex: number`

- [ ] **Step 1: Create `SectionIcon.tsx`:**

```tsx
import type { LucideIcon } from 'lucide-react'
import { SECTION_STYLE, type SectionKey } from './sectionStyle'

interface SectionIconProps {
  section: SectionKey
  /** Replaces the section's own icon (e.g. contacts and documents are both "private"). */
  icon?: LucideIcon
}

function SectionIcon({ section, icon }: SectionIconProps) {
  const style = SECTION_STYLE[section]
  const Icon = icon ?? style.icon
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.soft}`}
    >
      <Icon className={`h-5 w-5 ${style.ink}`} aria-hidden="true" />
    </span>
  )
}

export default SectionIcon
```

- [ ] **Step 2: Create `SectionHeading.tsx`:**

```tsx
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import SectionIcon from './SectionIcon'
import type { SectionKey } from './sectionStyle'

interface SectionHeadingProps {
  section: SectionKey
  children: ReactNode
  icon?: LucideIcon
  /** DOM id of the `h2` (for `aria-labelledby`). */
  id?: string
  size?: 'md' | 'lg'
}

function SectionHeading({ section, children, icon, id, size = 'md' }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2.5">
      <SectionIcon section={section} icon={icon} />
      <h2 id={id} className={`${size === 'lg' ? 'text-2xl' : 'text-xl'} font-bold`}>
        {children}
      </h2>
    </div>
  )
}

export default SectionHeading
```

- [ ] **Step 3: `NowCard.tsx`** (full file). The card is always a plan item: turquoise left edge, soft label chip, tinted pin.

```tsx
import { MapPin } from 'lucide-react'
import MapsLink from './MapsLink'
import FreeTimeIdeas, { type FreeTimeIdeasData } from './FreeTimeIdeas'
import { SECTION_STYLE } from './sectionStyle'

const { edge, ink, soft } = SECTION_STYLE.plan

interface NowCardProps {
  label: string
  range: string
  title: string
  place: string
  /** Directions link; null when the item is not a place to go. */
  url: string | null
  /** Ideas for a free-time item. */
  ideas?: FreeTimeIdeasData
}

function NowCard({ label, range, title, place, url, ideas }: NowCardProps) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-[22px] border-[1.5px] border-l-[6px] border-trip-ink ${edge} bg-trip-card p-5`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`rounded-lg ${soft} px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider ${ink}`}
        >
          {label}
        </span>
        <span className="font-trip-mono text-lg font-semibold">{range}</span>
      </div>
      <h2 className="text-[25px] font-bold leading-tight">{title}</h2>
      <p className="flex items-center gap-2 text-lg font-medium text-trip-ink2">
        <MapPin className={`h-5 w-5 shrink-0 ${ink}`} aria-hidden="true" />
        {place}
      </p>
      {url && (
        <MapsLink href={url} variant="primary" className="mt-1 w-full">
          Cómo llegar
        </MapsLink>
      )}
      {ideas && <FreeTimeIdeas {...ideas} />}
    </section>
  )
}

export default NowCard
```

- [ ] **Step 4: `TodayPage.tsx` headings.** Add `import SectionHeading from '../components/SectionHeading'` after the `TripStatusMessage` import, then replace the four headings:

| Old                                                            | New                                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `<h2 className="text-xl font-bold">Resto del día</h2>`         | `<SectionHeading section="plan">Resto del día</SectionHeading>`         |
| `<h2 className="text-xl font-bold">Plan del día</h2>`          | `<SectionHeading section="plan">Plan del día</SectionHeading>`          |
| `<h2 className="text-xl font-bold">Esta noche duermes en</h2>` | `<SectionHeading section="stay">Esta noche duermes en</SectionHeading>` |
| `<h2 className="text-xl font-bold">Transporte de hoy</h2>`     | `<SectionHeading section="leg">Transporte de hoy</SectionHeading>`      |

(`PageHeader` stays for now; Task 4 replaces it.)

- [ ] **Step 5: `HelpCard.tsx`** (full file). The card gets the left edge and a soft icon circle at the head; `consular` is indigo, `private` purple:

```tsx
import type { HelpCardInfo } from '../types'
import { directionsUrl } from '../domain/mapsUrl'
import MapsLink from './MapsLink'
import PhoneLink from './PhoneLink'
import { SECTION_STYLE } from './sectionStyle'

interface HelpCardProps {
  card: HelpCardInfo
  /** Public embassy cards are `consular`; imported agency, insurance and hotel cards are `private`. */
  section: 'consular' | 'private'
}

function HelpCard({ card, section }: HelpCardProps) {
  const { icon: Icon, edge, ink, soft } = SECTION_STYLE[section]
  return (
    <div
      className={`flex flex-col gap-3 rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card p-[18px]`}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${soft}`}
        >
          <Icon className={`h-6 w-6 ${ink}`} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-lg font-bold">{card.title}</p>
          <p className="text-base text-trip-muted">{card.sub}</p>
        </div>
      </div>
      <PhoneLink number={card.phone} className="w-full">
        {card.cta}
      </PhoneLink>
      {card.mapQuery && (
        <MapsLink
          href={directionsUrl(card.mapQuery)}
          variant="ghost"
          icon={false}
          className="w-full"
        >
          Cómo llegar
        </MapsLink>
      )}
    </div>
  )
}

export default HelpCard
```

- [ ] **Step 6: `ContactList.tsx`** (full file):

```tsx
import { Users } from 'lucide-react'
import type { Contact } from '../types'
import PhoneLink from './PhoneLink'
import SectionHeading from './SectionHeading'
import { SECTION_STYLE } from './sectionStyle'

const { edge } = SECTION_STYLE.private

function ContactList({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionHeading section="private" icon={Users}>
        Contactos del grupo
      </SectionHeading>
      <ul className={`rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card px-4`}>
        {contacts.map((contact) => (
          <li
            key={`${contact.name}-${contact.role}`}
            className="flex items-center gap-3.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[17px] font-semibold">{contact.name}</p>
              <p className="text-[15px] text-trip-muted">{contact.role}</p>
            </div>
            {contact.phone && (
              <PhoneLink number={contact.phone} variant="secondary" icon={false} className="px-3.5">
                <span aria-hidden="true">Llamar</span>
                <span className="sr-only">Llamar a {contact.name}</span>
              </PhoneLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ContactList
```

- [ ] **Step 7: `DocList.tsx`** (full file):

```tsx
import { FileText } from 'lucide-react'
import type { DocInfo } from '../types'
import SectionHeading from './SectionHeading'
import { SECTION_STYLE } from './sectionStyle'

const { edge } = SECTION_STYLE.private

function DocList({ docs }: { docs: DocInfo[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionHeading section="private" icon={FileText}>
        Documentos
      </SectionHeading>
      <p className="-mt-1 text-[15px] text-trip-muted">
        Dónde están y a quién llamar si se pierden.
      </p>
      <ul className={`rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card px-4`}>
        {docs.map((doc) => (
          <li
            key={`${doc.name}-${doc.where}`}
            className="flex flex-col gap-0.5 border-t border-trip-line py-3.5 first:border-t-0"
          >
            <p className="text-[17px] font-semibold">{doc.name}</p>
            <p className="text-base text-trip-ink2">Dónde: {doc.where}</p>
            <p className="text-[15px] text-trip-muted">Si se pierde: {doc.who}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DocList
```

- [ ] **Step 8: `HelpPage.tsx`.** Add `import SectionHeading from '../components/SectionHeading'` after the `GuideCardList` import. Replace the consular heading

```tsx
;<h2 id="help-consular-heading" className="text-2xl font-bold">
  Embajada y consulados de España
</h2>
{
  helpInfo.consular.map((card) => <HelpCard key={`${card.title}-${card.phone}`} card={card} />)
}
```

with

```tsx
;<SectionHeading section="consular" id="help-consular-heading" size="lg">
  Embajada y consulados de España
</SectionHeading>
{
  helpInfo.consular.map((card) => (
    <HelpCard key={`${card.title}-${card.phone}`} card={card} section="consular" />
  ))
}
```

the health heading

```tsx
<h2 id="help-guide-heading" className="text-2xl font-bold">
  Salud y precauciones
</h2>
```

with

```tsx
<SectionHeading section="health" id="help-guide-heading" size="lg">
  Salud y precauciones
</SectionHeading>
```

and the imported-cards map

```tsx
{
  helpInfo.cards.map((card) => <HelpCard key={`${card.title}-${card.phone}`} card={card} />)
}
```

with

```tsx
{
  helpInfo.cards.map((card) => (
    <HelpCard key={`${card.title}-${card.phone}`} card={card} section="private" />
  ))
}
```

`EmergencyCard` is not touched.

- [ ] **Step 9: Checklist and notes.**

`ChecklistGroup.tsx`: add `import { SECTION_STYLE } from './sectionStyle'` after the `checklist` domain import, a module constant `const { edge } = SECTION_STYLE.checklist` after it, and replace

```tsx
      <ul className="overflow-hidden rounded-[20px] border border-trip-line bg-trip-card">
```

with

```tsx
      <ul
        className={`overflow-hidden rounded-[20px] border border-l-4 border-trip-line ${edge} bg-trip-card`}
      >
```

`ChecklistSection.tsx`: add `import SectionHeading from '../components/SectionHeading'` after the `NotesEditor` import and replace

```tsx
<h2 id="checklist-heading" className="text-2xl font-bold">
  Checklist
</h2>
```

with

```tsx
<SectionHeading section="checklist" id="checklist-heading" size="lg">
  Checklist
</SectionHeading>
```

`NotesEditor.tsx`: add `import SectionIcon from './SectionIcon'` and `import { SECTION_STYLE } from './sectionStyle'` after the `lucide-react` import, plus `const { edge } = SECTION_STYLE.notes` below the imports. Replace

```tsx
<label htmlFor="trip-notes" className="text-xl font-bold">
  Mis notas
</label>
```

with

```tsx
<div className="flex items-center gap-2.5">
  <SectionIcon section="notes" />
  <label htmlFor="trip-notes" className="text-xl font-bold">
    Mis notas
  </label>
</div>
```

and the textarea class `"resize-y rounded-2xl border-[1.5px] border-trip-line bg-trip-card p-3.5 text-base text-trip-ink"` with

```tsx
        className={`resize-y rounded-2xl border-[1.5px] border-l-4 border-trip-line ${edge} bg-trip-card p-3.5 text-base text-trip-ink`}
```

- [ ] **Step 10: `TripNav.tsx`** (full file). The active item gets a 3px top bar and an icon in its colour; inactive items stay muted:

```tsx
import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarDays, LifeBuoy, ListOrdered, type LucideIcon } from 'lucide-react'
import { NAV_STYLE, type NavKey } from './sectionStyle'

// Relative links: TripNav renders inside the /trips/:tripId route.
const ITEMS: { to: NavKey; label: string; icon: LucideIcon }[] = [
  { to: 'today', label: 'Hoy', icon: CalendarDays },
  { to: 'itinerary', label: 'Itinerario', icon: ListOrdered },
  { to: 'guide', label: 'Guía', icon: BookOpen },
  { to: 'help', label: 'Ayuda', icon: LifeBuoy },
]

function TripNav() {
  return (
    <nav
      aria-label="Secciones del viaje"
      className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-trip-line bg-trip-card"
    >
      <ul className="mx-auto flex max-w-md px-2 md:max-w-3xl">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const { bar, ink } = NAV_STYLE[to]
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `relative flex min-h-[62px] flex-col items-center justify-center gap-1 text-sm no-underline ${
                    isActive
                      ? `font-bold text-trip-ink before:absolute before:inset-x-[22%] before:top-0 before:h-[3px] before:rounded-b ${bar}`
                      : 'font-medium text-trip-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-6 w-6 ${isActive ? ink : ''}`} aria-hidden="true" />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default TripNav
```

- [ ] **Step 11: `TripCard.tsx`** (full file). A coloured top stripe per trip, as the guide topic cards have:

```tsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { TripMeta } from '../types'
import { getTripStatus, TRIP_STATUS_LABEL } from '../domain/tripStatus'
import { tripHomePath } from '../domain/landing'
import { formatDateRange } from '../domain/dates'
import { tripStripe } from './sectionStyle'

interface TripCardProps {
  trip: TripMeta
  today: string
  /** Position of the trip in the registry; picks the colour of the top stripe. */
  accentIndex: number
}

function TripCard({ trip, today, accentIndex }: TripCardProps) {
  const status = getTripStatus(trip, today)
  return (
    <Link
      to={tripHomePath(trip)}
      className={`flex items-center gap-4 rounded-[20px] border border-t-[6px] border-trip-line ${tripStripe(accentIndex)} bg-trip-card p-[18px] text-trip-ink no-underline active:bg-trip-soft`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`self-start rounded-lg px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider ${
            status === 'current' ? 'bg-trip-ink text-trip-bg' : 'bg-trip-soft text-trip-ink2'
          }`}
        >
          {TRIP_STATUS_LABEL[status]}
        </span>
        <span className="text-lg font-semibold">{trip.name}</span>
        <span className="text-base text-trip-muted">
          {formatDateRange(trip.startDate, trip.endDate)} · {trip.countries.join(', ')}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-trip-muted" aria-hidden="true" />
    </Link>
  )
}

export default TripCard
```

In `TripSwitcher.tsx` replace **both** occurrences of

```tsx
<TripCard key={trip.id} trip={trip} today={today} />
```

with

```tsx
<TripCard
  key={trip.id}
  trip={trip}
  today={today}
  accentIndex={TRIPS.findIndex((candidate) => candidate.id === trip.id)}
/>
```

(`TRIPS` is already imported there. The index is the trip's registry position, so its colour does not change when the switcher re-sorts.)

- [ ] **Step 12: Format and run the full gate**

Run: `npx prettier --write src/trips/components/SectionIcon.tsx src/trips/components/SectionHeading.tsx src/trips/components/NowCard.tsx src/trips/components/HelpCard.tsx src/trips/components/ContactList.tsx src/trips/components/DocList.tsx src/trips/components/ChecklistGroup.tsx src/trips/components/NotesEditor.tsx src/trips/components/TripNav.tsx src/trips/components/TripCard.tsx src/trips/pages/TodayPage.tsx src/trips/pages/HelpPage.tsx src/trips/pages/ChecklistSection.tsx src/trips/pages/TripSwitcher.tsx`
Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed.

- [ ] **Step 13: Manual pass (owner)** (`npm run build && npm run preview`, light and dark):
  - Hoy: headings "Resto del día" / "Plan del día" (turquoise), "Esta noche duermes en" (purple), "Transporte de hoy" (indigo) each lead with a soft icon circle; the NowCard has a turquoise left edge and soft "Ahora" chip.
  - Nav: the active item shows a 3px top bar and icon: Hoy blue, Itinerario turquoise, Guía magenta, Ayuda red; inactive items stay grey.
  - Ayuda: consular cards indigo with a building icon; "Salud y precauciones" terracotta; imported cards, contacts and documents purple; checklist heading green with green-edged groups; "Mis notas" amber. The emergency card looks exactly as before.
  - `/trips`: the Peru card has a turquoise top stripe (registry index 1) and the Vietnam card an amber one (index 0).

- [ ] **Step 14: Commit**

```bash
git add src/trips/components/SectionIcon.tsx src/trips/components/SectionHeading.tsx src/trips/components/NowCard.tsx src/trips/components/HelpCard.tsx src/trips/components/ContactList.tsx src/trips/components/DocList.tsx src/trips/components/ChecklistGroup.tsx src/trips/components/NotesEditor.tsx src/trips/components/TripNav.tsx src/trips/components/TripCard.tsx src/trips/pages/TodayPage.tsx src/trips/pages/HelpPage.tsx src/trips/pages/ChecklistSection.tsx src/trips/pages/TripSwitcher.tsx
git commit -m "feat(trips): colour the Today and Help headings, the nav and the trip switcher"
```

---

### Task 4: `DayCover` type, cover card, Today integration, webp precache and content guards

**Files:**

- Modify: `src/trips/types.ts` (`DayCover`, `TripDay.cover?`)
- Modify: `src/trips/domain/dates.ts` (+ `dates.test.ts`)
- Create: `src/trips/domain/dayCover.ts`, `src/trips/domain/dayCover.test.ts`
- Modify: `src/trips/components/sectionStyle.ts` (+ `sectionStyle.test.ts`): `COVER_FALLBACK`
- Create: `src/trips/components/DayCoverCard.tsx`
- Modify: `src/trips/pages/TodayPage.tsx`, `vite.config.ts`
- Modify: `src/trips/content/content.test.ts`, `src/trips/domain/seedSync.test.ts`

**Interfaces:**

- Consumes: `formatDayLabel` (`dates.ts`), `SECTION_STYLE` and `readTripTokens` / `contrastRatio` (Task 1).
- Produces:
  - `interface DayCover { place: string; image: string; alt: string; credit: string; creditUrl: string }`; `TripDay.cover?: DayCover` (so `ContentDay` carries it)
  - `formatDayCount(index: number, total: number): string` → `'Día 4 de 12'`
  - `interface CoverView { eyebrow: string; place: string; dateLabel: string; cover: DayCover | null }`
  - `buildCoverView(cover: DayCover | undefined, tripName: string, index: number, total: number, iso: string): CoverView`
  - `visibleCover(view: CoverView, failedSrc: string | null): DayCover | null`
  - `COVER_FALLBACK: { surface: string; text: string }` in `sectionStyle.ts`
  - `DayCoverCard({ view: CoverView })`

- [ ] **Step 1: Write the failing `formatDayCount` test.** In `src/trips/domain/dates.test.ts` add `formatDayCount` to the import list and, inside `describe('day labels', …)`:

```ts
it('formats the day count', () => {
  expect(formatDayCount(0, 12)).toBe('Día 1 de 12')
  expect(formatDayCount(3, 12)).toBe('Día 4 de 12')
})
```

Run: `npm test -- src/trips/domain/dates.test.ts`
Expected: FAIL (`formatDayCount is not a function`).

- [ ] **Step 2: Implement it.** In `src/trips/domain/dates.ts` replace `formatDayHeading` with:

```ts
/** 'Día 1 de 12' (index is zero-based) */
export function formatDayCount(index: number, total: number): string {
  return `Día ${index + 1} de ${total}`
}

/** 'Día 1 de 12 · sáb 17 oct' (index is zero-based) */
export function formatDayHeading(index: number, total: number, iso: string): string {
  return `${formatDayCount(index, total)} · ${formatDayLabel(iso)}`
}
```

Run: `npm test -- src/trips/domain/dates.test.ts`
Expected: PASS (the existing `formatDayHeading` test still passes).

- [ ] **Step 3: Add the type** to `src/trips/types.ts`. Insert before `export interface TripDay`:

```ts
export interface DayCover {
  /** Place shown on the card, e.g. "Valle del Colca". */
  place: string
  /** Bundled image URL (Vite asset import from the content file). */
  image: string
  /** Describes the photo for screen readers. */
  alt: string
  /** "Autor · CC BY-SA 4.0" */
  credit: string
  /** Wikimedia Commons file page (https). */
  creditUrl: string
}
```

and add `cover?: DayCover` as the last field of `TripDay` (after `see: SeeItem[]`).

- [ ] **Step 4: Write the failing view-model tests** in `src/trips/domain/dayCover.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { DayCover } from '../types'
import { buildCoverView, visibleCover } from './dayCover'

const cover: DayCover = {
  place: 'Valle del Colca',
  image: '/assets/colca.webp',
  alt: 'Terrazas agrícolas del valle del Colca',
  credit: 'Autora · CC BY-SA 4.0',
  creditUrl: 'https://commons.wikimedia.org/wiki/File:Colca.jpg',
}

describe('buildCoverView', () => {
  it('shows the cover place with the day count and the date', () => {
    expect(buildCoverView(cover, 'Perú', 3, 12, '2026-10-20')).toEqual({
      eyebrow: 'Hoy · Día 4 de 12',
      place: 'Valle del Colca',
      dateLabel: 'mar 20 oct',
      cover,
    })
  })

  it('falls back to the trip name and no photo when the day has no cover', () => {
    expect(buildCoverView(undefined, 'Perú', 0, 12, '2026-10-17')).toEqual({
      eyebrow: 'Hoy · Día 1 de 12',
      place: 'Perú',
      dateLabel: 'sáb 17 oct',
      cover: null,
    })
  })

  it('falls back to the trip name when the cover place is blank', () => {
    const view = buildCoverView({ ...cover, place: '  ' }, 'Perú', 3, 12, '2026-10-20')
    expect(view.place).toBe('Perú')
  })
})

describe('visibleCover', () => {
  const view = buildCoverView(cover, 'Perú', 3, 12, '2026-10-20')

  it('returns the cover while its photo has not failed', () => {
    expect(visibleCover(view, null)).toBe(cover)
  })

  it('drops the cover once its own photo failed to load', () => {
    expect(visibleCover(view, '/assets/colca.webp')).toBeNull()
  })

  it('keeps the cover when a different photo failed earlier (another day)', () => {
    expect(visibleCover(view, '/assets/puno.webp')).toBe(cover)
  })

  it('returns null for a view without a cover', () => {
    expect(visibleCover(buildCoverView(undefined, 'Perú', 0, 12, '2026-10-17'), null)).toBeNull()
  })
})
```

Run: `npm test -- src/trips/domain/dayCover.test.ts`
Expected: FAIL, `Failed to resolve import "./dayCover"`.

- [ ] **Step 5: Implement `src/trips/domain/dayCover.ts`:**

```ts
import type { DayCover } from '../types'
import { formatDayCount, formatDayLabel } from './dates'

export interface CoverView {
  /** 'Hoy · Día 4 de 12' */
  eyebrow: string
  place: string
  /** 'mar 20 oct' */
  dateLabel: string
  /** Null when the day has no photo: the card renders on a plain colour. */
  cover: DayCover | null
}

/** Everything the Today cover card shows. `index` is the zero-based day position. */
export function buildCoverView(
  cover: DayCover | undefined,
  tripName: string,
  index: number,
  total: number,
  iso: string
): CoverView {
  return {
    eyebrow: `Hoy · ${formatDayCount(index, total)}`,
    place: cover?.place.trim() ? cover.place : tripName,
    dateLabel: formatDayLabel(iso),
    cover: cover ?? null,
  }
}

/** The cover to draw: null when there is none or its photo failed to load (`failedSrc`). */
export function visibleCover(view: CoverView, failedSrc: string | null): DayCover | null {
  return view.cover && view.cover.image !== failedSrc ? view.cover : null
}
```

Run: `npm test -- src/trips/domain/dayCover.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Write the failing fallback-contrast test.** In `src/trips/components/sectionStyle.test.ts` add `COVER_FALLBACK` to the `./sectionStyle` import and append:

```ts
describe('COVER_FALLBACK', () => {
  const surfaceToken = COVER_FALLBACK.surface.replace('bg-trip-', '')
  const textToken = COVER_FALLBACK.text.replace('text-trip-', '')

  it('is the turquoise section tone', () => {
    expect(surfaceToken).toBe(SECTION_TOKEN.plan)
  })

  it.each(MODES)('%s mode: its text reaches 4.5:1 on its surface', (mode) => {
    const colours = palette[mode]
    expect(colours[textToken], `${mode} --trip-${textToken}`).toBeDefined()
    expect(contrastRatio(colours[textToken], colours[surfaceToken])).toBeGreaterThanOrEqual(4.5)
  })
})
```

Run: `npm test -- src/trips/components/sectionStyle.test.ts`
Expected: FAIL (`COVER_FALLBACK` is not exported). White text would fail this test in dark mode (1.81:1); that is why the fallback text is a palette colour.

- [ ] **Step 7: Add `COVER_FALLBACK`** at the end of `src/trips/components/sectionStyle.ts`:

```ts
/**
 * Cover card without a photo: turquoise surface with the page background colour as text.
 * White would fail in dark mode (turquoise is light there); this pair is 5.05:1 light, 10.5:1 dark.
 */
export const COVER_FALLBACK = { surface: 'bg-trip-topic-city', text: 'text-trip-bg' } as const
```

Run: `npm test -- src/trips/components/sectionStyle.test.ts`
Expected: PASS.

- [ ] **Step 8: Add the guards.** (a) In `src/trips/content/content.test.ts`, after the `'$id guide entries are well-formed'` test add:

```ts
it.each(v2Trips)('$id day covers are well-formed', async (trip) => {
  const content = await loadTripContent(trip.id)
  for (const day of content.days) {
    const { cover } = day
    if (!cover) continue
    expect(cover.place.trim(), `${day.date} place`).not.toBe('')
    expect(cover.image.trim(), `${day.date} image`).not.toBe('')
    expect(cover.alt.trim(), `${day.date} alt`).not.toBe('')
    expect(cover.credit, `${day.date} credit`).toMatch(/\S · \S/)
    expect(cover.creditUrl, `${day.date} creditUrl`).toMatch(/^https:\/\/commons\.wikimedia\.org\//)
  }
})
```

This passes vacuously now (no day has a cover yet). It becomes meaningful in Task 5, where a mutation check proves it fails on a bad cover.

(b) In `src/trips/domain/seedSync.test.ts` extend the type import to `import type { ContentGuideEntry, DayCover } from '../types'` and add inside `describe('syncTripContent', …)`:

```ts
it('stores a day cover and drops it when a newer version removes it', async () => {
  const db = getDb()
  const cover: DayCover = {
    place: 'Lima',
    image: '/assets/lima.webp',
    alt: 'Costa de Miraflores',
    credit: 'Autor · CC BY 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Lima.jpg',
  }
  await syncTripContent(db, makeContent({ days: [{ ...makeDay('2026-10-17'), cover }] }))
  expect((await db.days.get(['peru-2026', '2026-10-17']))?.cover).toEqual(cover)

  await syncTripContent(db, makeContent({ seedVersion: 2, days: [makeDay('2026-10-17')] }))
  expect((await db.days.get(['peru-2026', '2026-10-17']))?.cover).toBeUndefined()
})
```

This is a characterization test: it should be GREEN at once (the cover is not indexed, so no `TripsDB` version bump is needed).

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Create `src/trips/components/DayCoverCard.tsx`.** `<img>` with a dark gradient for legibility; if the photo fails, the card falls back to the plain colour (`visibleCover`); `min-h` lets a long place wrap without clipping:

```tsx
import { useState } from 'react'
import { visibleCover, type CoverView } from '../domain/dayCover'
import { COVER_FALLBACK } from './sectionStyle'

function DayCoverCard({ view }: { view: CoverView }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const cover = visibleCover(view, failedSrc)

  return (
    <header
      className={`relative flex min-h-[200px] items-end overflow-hidden rounded-[20px] sm:min-h-[260px] ${
        cover ? 'bg-slate-800 text-white' : `${COVER_FALLBACK.surface} ${COVER_FALLBACK.text}`
      }`}
    >
      {cover && (
        <>
          <img
            src={cover.image}
            alt={cover.alt}
            loading="eager"
            decoding="async"
            onError={() => setFailedSrc(cover.image)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          />
        </>
      )}
      <div className="relative flex w-full flex-col gap-1 p-5">
        <p className="text-[13px] font-bold uppercase tracking-wider">{view.eyebrow}</p>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">{view.place}</h1>
        <p className="text-[17px] font-medium">{view.dateLabel}</p>
        {cover && (
          <a
            href={cover.creditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-end text-xs text-white/80 underline"
          >
            Foto: {cover.credit}
          </a>
        )}
      </div>
    </header>
  )
}

export default DayCoverCard
```

- [ ] **Step 10: Integrate in `TodayPage.tsx`.** Remove the now-unused imports `import { formatDayHeading } from '../domain/dates'` and `import PageHeader from '../components/PageHeader'` (`noUnusedLocals`), add

```tsx
import { buildCoverView } from '../domain/dayCover'
import DayCoverCard from '../components/DayCoverCard'
```

and replace

```tsx
<PageHeader title="Hoy" subtitle={formatDayHeading(view.dayIndex, days.length, day.date)} />
```

with

```tsx
<DayCoverCard view={buildCoverView(day.cover, trip.name, view.dayIndex, days.length, day.date)} />
```

The "Faltan N días" / "Viaje terminado" banner stays below the card, unchanged.

- [ ] **Step 11: Precache the photos.** In `vite.config.ts` change

```ts
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
```

to

```ts
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,webp}'],
```

- [ ] **Step 12: Format and run the full gate**

Run: `npx prettier --write src/trips/types.ts src/trips/domain/dates.ts src/trips/domain/dates.test.ts src/trips/domain/dayCover.ts src/trips/domain/dayCover.test.ts src/trips/domain/seedSync.test.ts src/trips/components/sectionStyle.ts src/trips/components/sectionStyle.test.ts src/trips/components/DayCoverCard.tsx src/trips/pages/TodayPage.tsx src/trips/content/content.test.ts vite.config.ts`
Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed. (`import img from './x.webp'` typechecks through `vite/client`, declared in `src/vite-env.d.ts`, and resolves to a URL string under Vitest; verified while writing this plan.)

- [ ] **Step 13: Manual pass (owner)**, `npm run build && npm run preview`. No Peru day has a photo yet, so this checks the fallback card:
  - "Hoy" opens with a turquoise card: `HOY · DÍA N DE 12`, "Perú" as the title, the date line; no credit link. Light and dark: text clearly readable in both.
  - DevTools device toolbar at 320 px: the card keeps its text inside, growing if needed.
  - The banner ("Faltan N días") sits below the card.

- [ ] **Step 14: Commit**

```bash
git add src/trips/types.ts src/trips/domain/dates.ts src/trips/domain/dates.test.ts src/trips/domain/dayCover.ts src/trips/domain/dayCover.test.ts src/trips/domain/seedSync.test.ts src/trips/components/sectionStyle.ts src/trips/components/sectionStyle.test.ts src/trips/components/DayCoverCard.tsx src/trips/pages/TodayPage.tsx src/trips/content/content.test.ts vite.config.ts
git commit -m "feat(trips): add the day cover card to Today"
```

---

### Task 5: Peru covers in the content and `seedVersion` bump

**Files:**

- Modify: `src/trips/content/peru-2026.ts`
- Modify: `src/trips/content/content.test.ts`

**Interfaces:**

- Consumes: `DayCover` (Task 4), the 11 files from Task 0, and `docs/peru/portadas-creditos.md` (Task 0, untracked).
- Produces: `cover` on all 12 Peru days; `seedVersion` + 1.

Day → constant → photo (from spec §5; slugs from Task 0):

| Date       | Constant                     | Image import        | File                                           | `place`           |
| ---------- | ---------------------------- | ------------------- | ---------------------------------------------- | ----------------- |
| 2026-10-17 | `COVER_LIMA_MIRAFLORES`      | `limaMiraflores`    | `./images/peru-2026/lima-miraflores.webp`      | `Lima`            |
| 2026-10-18 | `COVER_LIMA_PLAZA_DE_ARMAS`  | `limaPlazaDeArmas`  | `./images/peru-2026/lima-plaza-de-armas.webp`  | `Lima`            |
| 2026-10-19 | `COVER_AREQUIPA`             | `arequipaMisti`     | `./images/peru-2026/arequipa-misti.webp`       | `Arequipa`        |
| 2026-10-20 | `COVER_COLCA`                | `colcaTerrazas`     | `./images/peru-2026/colca-terrazas.webp`       | `Valle del Colca` |
| 2026-10-21 | `COVER_PUNO`                 | `punoTiticaca`      | `./images/peru-2026/puno-titicaca.webp`        | `Puno`            |
| 2026-10-22 | `COVER_UROS`                 | `urosIslas`         | `./images/peru-2026/uros-islas.webp`           | `Lago Titicaca`   |
| 2026-10-23 | `COVER_CUSCO_PLAZA`          | `cuscoPlazaDeArmas` | `./images/peru-2026/cusco-plaza-de-armas.webp` | `Cusco`           |
| 2026-10-24 | `COVER_CUSCO_SAN_BLAS`       | `cuscoSanBlas`      | `./images/peru-2026/cusco-san-blas.webp`       | `Cusco`           |
| 2026-10-25 | `COVER_OLLANTAYTAMBO`        | `ollantaytambo`     | `./images/peru-2026/ollantaytambo.webp`        | `Valle Sagrado`   |
| 2026-10-26 | `COVER_MACHU_PICCHU`         | `machuPicchu`       | `./images/peru-2026/machu-picchu.webp`         | `Machu Picchu`    |
| 2026-10-27 | `COVER_CUSCO_PLAZA` (reused) | (same as 23)        | (same as 23)                                   | `Cusco`           |
| 2026-10-28 | `COVER_MADRID`               | `madrid`            | `./images/peru-2026/madrid.webp`               | `Madrid`          |

Each constant has this exact shape. `image` is the imported URL; every other value comes **verbatim from the credits table in `docs/peru/portadas-creditos.md` (Task 0's report)**: `alt`, `credit` and `creditUrl` are not invented or reworded here.

```ts
import limaMiraflores from './images/peru-2026/lima-miraflores.webp'

const COVER_LIMA_MIRAFLORES: DayCover = {
  place: 'Lima',
  image: limaMiraflores,
  alt: '<alt from the credits table>',
  credit: '<credit from the credits table>',
  creditUrl: '<creditUrl from the credits table>',
}
```

Illustrative example of a filled constant (invented alt text; the author and licence shown are real metadata of a Commons file seen while writing this plan, but Task 0 decides the actual photo. **Do not copy this block**):

```ts
// ILLUSTRATIVE ONLY: use the values Task 0 recorded.
const COVER_LIMA_MIRAFLORES: DayCover = {
  place: 'Lima',
  image: limaMiraflores,
  alt: 'Acantilados y costa de Miraflores, en Lima, al atardecer',
  credit: 'magicmonkey · CC BY 2.0',
  creditUrl: 'https://commons.wikimedia.org/wiki/File:Lima_Peru_coast.jpg',
}
```

- [ ] **Step 1: Re-read the current `seedVersion`** in `src/trips/content/peru-2026.ts` (13 when this plan was written) and open `docs/peru/portadas-creditos.md`. If the credits file or any of the 11 `.webp` files is missing, stop and report `blocked`: Task 0 is not done.

- [ ] **Step 2: Write the failing guard tests.** In `src/trips/content/content.test.ts` add the imports at the top:

```ts
import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
```

and, after `'Peru has a guide'`, add:

```ts
it('Peru has a cover on every day', async () => {
  const content = await loadTripContent('peru-2026')
  for (const day of content.days) expect(day.cover, `${day.date} cover`).toBeDefined()
})

// Guard (green from the start): Task 0 already enforces it; this stops a later photo from bloating the install.
it('keeps every Peru cover photo within the size budget (150 KB)', () => {
  const dir = resolve(process.cwd(), 'src/trips/content/images/peru-2026')
  const files = readdirSync(dir).filter((file) => file.endsWith('.webp'))
  expect(files.length).toBeGreaterThan(0)
  for (const file of files) {
    expect(statSync(resolve(dir, file)).size, file).toBeLessThanOrEqual(150 * 1024)
  }
})
```

- [ ] **Step 3: Run to verify RED**

Run: `npm test -- src/trips/content/content.test.ts`
Expected: `Peru has a cover on every day` FAILS (`2026-10-17 cover` is undefined). The other new test passes.

- [ ] **Step 4: Add the imports and the cover constants.** In `src/trips/content/peru-2026.ts`: change the first line to `import type { DayCover, TripContent } from '../types'`; add the eleven `import … from './images/peru-2026/….webp'` lines from the table above right after it; and, between the header comment and `const content: TripContent = {`, add the eleven `COVER_*` constants (all `place`, `alt`, `credit`, `creditUrl` values from the credits table). Extend the header comment with these two lines:

```ts
// Covers: photos from Wikimedia Commons under free licences; author, licence and file page are in the
// COVER_* constants below. Changing an image file changes its hashed URL, so bump seedVersion too.
```

- [ ] **Step 5: Attach each cover to its day** (inserts a `cover:` line after each day's `cities:` line). Run from the repository root:

```bash
declare -A COVER=(
  [2026-10-17]=COVER_LIMA_MIRAFLORES [2026-10-18]=COVER_LIMA_PLAZA_DE_ARMAS
  [2026-10-19]=COVER_AREQUIPA [2026-10-20]=COVER_COLCA [2026-10-21]=COVER_PUNO
  [2026-10-22]=COVER_UROS [2026-10-23]=COVER_CUSCO_PLAZA [2026-10-24]=COVER_CUSCO_SAN_BLAS
  [2026-10-25]=COVER_OLLANTAYTAMBO [2026-10-26]=COVER_MACHU_PICCHU
  [2026-10-27]=COVER_CUSCO_PLAZA [2026-10-28]=COVER_MADRID
)
for d in "${!COVER[@]}"; do
  sed -i "/^      date: '$d',\$/,/^      cities: /{s/^      cities: .*\$/&\n      cover: ${COVER[$d]},/}" src/trips/content/peru-2026.ts
done
grep -c '^      cover: COVER_' src/trips/content/peru-2026.ts
```

Expected: `12`. Skim `git diff src/trips/content/peru-2026.ts`: each hunk adds one `cover:` line directly under a `cities:` line of the right date.

- [ ] **Step 6: Bump `seedVersion`** by one (13 → 14 if the file still said 13).

- [ ] **Step 7: Format, then verify GREEN**

Run: `npx prettier --write src/trips/content/peru-2026.ts src/trips/content/content.test.ts`
Run: `npm test`
Expected: PASS, including `Peru has a cover on every day`, `peru-2026 day covers are well-formed` and the size budget.

- [ ] **Step 8: Mutation check** that the well-formedness guard bites. Temporarily blank one `credit` (for example change `credit: 'Autor · CC BY 4.0'` of any constant to `credit: 'Autor'`), run `npm test -- src/trips/content/content.test.ts`, expect `peru-2026 day covers are well-formed` to FAIL naming the date, then revert the edit (`git diff` must show only the intended changes) and re-run to see GREEN.

- [ ] **Step 9: Run the full gate and check the precache**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all succeed.

Run: `ls dist/assets/*.webp | wc -l` → `11`
Run: `grep -o 'url:"assets/[^"]*\.webp"' dist/sw.js | sort -u | wc -l` → `11` (the photos are in the service worker precache manifest; day 27 reuses day 23's file).
Run: `du -ch dist/assets/*.webp | tail -1` → about 1.1 MB, never above 1.7 MB.

- [ ] **Step 10: Manual pass (owner)**, `npm run build && npm run preview`, light and dark:
  - To see each day, temporarily make `useNow` return a fixed date: in `src/trips/hooks/useNow.ts` change the first line of the hook body to `const [now, setNow] = useState(() => new Date('2026-10-20T10:00:00-05:00'))` and have `refresh` call `setNow(new Date('2026-10-20T10:00:00-05:00'))` too. Walk the dates 2026-10-17 to 2026-10-28. **Revert with `git checkout -- src/trips/hooks/useNow.ts` before committing.**
  - Each day shows its photo, "HOY · DÍA N DE 12", the place as title, the date line and the credit link ("Foto: Autor · Licencia") bottom right; the title and credit are readable on every photo (gradient). Check the 320 px width for "Valle del Colca" and "Valle Sagrado".
  - The credit link opens the Commons file page in a new tab.
  - Offline: load "Hoy" once online, switch DevTools to Offline, reload: the photo still shows.
  - DevTools → block a photo URL, reload: the card falls back to the plain turquoise card (no broken-image icon).
  - A device that had the previous `seedVersion` resyncs: ticks and notes in "Ayuda" are unchanged.

- [ ] **Step 11: Commit** (content and its test only; the photos were committed in Task 0)

```bash
git status --short
git add src/trips/content/peru-2026.ts src/trips/content/content.test.ts
git commit -m "feat(trips): add Peru day cover photos to the content"
```

`git status` must show nothing staged beyond those two files; `docs/peru/` and `odd/` remain untracked. Do not push.
