# Zero — Progressive Search

A demo interface for **natural-language company search** with progressive evaluation: candidates scan in one-by-one, get scored and tiered, and weak matches move to **Discarded**—all with keyboard-first navigation and motion that respects reduced-motion preferences.

> **Note:** Search results are simulated client-side from pre-scored data in `lib/data.ts`. The UI models the experience of a live progressive ranker, not a production search API.

## What you can do

| Area | Behavior |
|------|----------|
| **Prompt** | Describe companies in plain language. **Enter** runs; **Shift+Enter** is not used for submit. Sample prompt is pre-filled for the demo dataset. |
| **Run / Stop / Re-run** | Start a scan, stop mid-flight, or re-run (shows a toast when interrupting). |
| **Progressive scan** | Rows move `pending → scanning → classified` (or `discarded`) with staggered timing and a spectrum shimmer on the status bar while running. |
| **Tiers** | **High**, **Medium**, and **Low** sections—collapsible headers with counts. Low matches are auto-discarded when the prompt is relevant. |
| **Discarded** | Drawer for dropped companies; **Restore** on hover/focus or **Enter** when the row is focused. Respects the active sort order. |
| **Filter** | All tiers, single tier, or Discarded-only. |
| **Sort** | Match (score), Name, Size (employees), Founded—toggle direction on the active column. |
| **Row details** | Hover card with company metadata; **Enter** on a focused row opens it. |
| **Empty states** | Idle (“run a search”), irrelevant prompt, and no strong matches—shared large centered layout (`min(28rem, 58vh)`). |
| **Theme** | Light / dark via `next-themes`; brand yellow accent (`#ffd503` / `#e6c200`). |

## Keyboard shortcuts

Available in the header popover and the page footer.

| Key | Action |
|-----|--------|
| **Tab** | Move through prompt, Run/Stop, filter, sort, tier toggles, and results (roving tabindex on rows). |
| **↑ / ↓** | Move between visible result rows (including discarded when the drawer is open). |
| **Home / End** | First / last visible row. |
| **Enter** | Submit from prompt; open row details or restore a discarded row when focused. |
| **Esc** | Close details → stop running search → clear row focus and focus prompt. |
| **/** | Focus the search prompt (when not already in an input). |

Implementation: `components/keyboard-shortcuts-help.tsx`, row logic in `components/progressive-search.tsx` (`visibleRowIds`, `getRowTabIndex`, `handleRowKeyDown`).

## UI states

The results panel uses a single `AnimatePresence` region with distinct keys:

- `idle` — empty state before first run  
- `scanning` — placeholder while evaluation is in progress  
- `results` — tier sections + optional discarded drawer  
- `no-match-empty` — relevant prompt but nothing cleared the bar  
- `no-match-irrelevant` — prompt outside the demo index  

Status copy is announced via `aria-live="polite"` on the scanning/progress bar.

## Design system

### Tokens (`app/globals.css`)

- **Surfaces:** `--background`, `--card`, `--secondary`, `--border` (low-contrast oklch alphas).  
- **Brand:** `--primary` / `--accent` yellow; `--ring` matches accent for focus rings.  
- **Tiers:** `--tier-high`, `--tier-medium`, `--tier-low` (+ foreground pairs).  
- **Scanning spectrum:** `--spectrum-1` … `--spectrum-6` for shimmer and progress gradients.  
- **Layout:** `--radius` (0.625rem), `--grid-dot` for the page background grid.

### Typography

- **Geist** — UI sans (`--font-sans`)  
- **Inter** — labels, metadata, shortcuts (`font-inter`, often `text-[11px]`)  
- **Geist Mono** — available via `--font-mono`

### Components

- **shadcn/ui** primitives under `components/ui/` (Radix + Tailwind v4).  
- **Hugeicons** wrapped in `components/icons.tsx` (`createIcon` helper).  
- **Sonner** toasts — bottom-right, compact single-line copy (`Search stopped`, `Re-running the search`, `Search completed`); styles in `globals.css` + `components/ui/sonner.tsx`.

## Design engineering notes

**Motion (`lib/motion.ts`)**  
Shared easing `[0.22, 1, 0.36, 1]`, `fadeSlide`, `collapse`, and empty-state stagger variants. `useReducedMotion()` zeroes durations when the user prefers reduced motion.

**Layout**  
`main` is `min-h-dvh flex-col`; results card grows in the middle; keyboard-shortcuts footer is `mt-auto` with a soft top border (`border-border/25`).

**Focus**  
Rows use roving `tabIndex`: one visible row is tabbable (`focusedRowId ?? visibleRowIds[0]`). Focus ring: `ring-ring/40` inset (`ROW_FOCUS_RING`). Logo reset blurs the prompt—no persistent yellow textarea ring while typing.

**Micro-interactions**  
- Discarded chevron: `#969696` → `#777` on row hover  
- Restore button: width/opacity reveal on row hover and focus-within  
- Tier row hover: `#fafafa` / `dark:bg-muted/30`  
- Empty-state primary actions: bordered pill buttons with explicit hover border colors in light/dark

**Accessibility**  
Results `role="list"` / `role="listitem"`, row `aria-label` with tier, discarded list labeled, filter/sort as keyboard-focusable controls.

## Project structure

```
app/
  layout.tsx          # fonts, theme, metadata, toaster
  page.tsx            # renders ProgressiveSearch
  globals.css         # design tokens + Sonner overrides
components/
  progressive-search.tsx   # main app shell and logic
  keyboard-shortcuts-help.tsx
  theme-toggle.tsx
  icons.tsx
lib/
  data.ts             # demo companies + scores
  motion.ts           # Framer Motion presets
  prompt-match.ts     # relevance check for demo prompts
  site.ts             # metadata config
```

## SEO & GEO (crawlers and LLMs)

Set `NEXT_PUBLIC_SITE_URL` in production so canonical URLs, Open Graph, and LLM files use your real domain.

| Path | Purpose |
|------|---------|
| [`/robots.txt`](/robots.txt) | Crawl rules for all agents + common AI bots (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, …) |
| [`/sitemap.xml`](/sitemap.xml) | Home + LLM resource URLs |
| [`/llms.txt`](/llms.txt) | [llmstxt.org](https://llmstxt.org/) summary for generative engines |
| [`/llms-full.txt`](/llms-full.txt) | Extended factual context (features, shortcuts, limitations) |
| `/manifest.webmanifest` | PWA manifest (name, theme colors, icon) |

Content for `llms.txt` / `llms-full.txt` is generated from `lib/llms.ts` and `lib/site.ts`. JSON-LD (`WebSite`, `WebPage`, `SoftwareApplication`) is injected via `components/structured-data.tsx`.

Copy `.env.example` → `.env.local` and set your deploy URL before shipping.

## Development

Requires **Node 18+** and [pnpm](https://pnpm.io) (or npm/yarn).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build    # production build
pnpm start    # serve production build
pnpm lint     # ESLint
```

Optional: set `NEXT_PUBLIC_SITE_URL` for correct metadata/Open Graph URLs when deploying.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Radix UI · Sonner · next-themes
