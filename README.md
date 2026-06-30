# Progressive Search

A demo interface for **natural-language company search** with progressive evaluation. Describe the companies you're looking for in plain language; the app scans candidates, scores each match, and reveals results in real time.

The project ships **two independent demos** behind a selector landing page:

- **Demo 1** — the baseline progressive ranker: prompt → live tiered scan (High / Medium / Low) with a Discarded drawer, keyboard-first navigation, and a structured filter builder.
- **Demo 2** — a redesign exploration focused on prompt UX, motion, and a chat-style flow: home prompt → optional clarification step → progressive results, with prompt-driven filter chips, a chain-of-thought run, and animated transitions.

> **Note:** Results are simulated client-side from pre-scored data in `lib/data.ts`. The UI models the experience of a live progressive ranker, not a production search API.

## Routes

| Path | Screen |
|------|--------|
| `/` | Demo selector landing (`app/page.tsx`) |
| `/demo-1` | Baseline progressive search (`components/demo-1/progressive-search.tsx`) |
| `/demo-2` | Redesign exploration (`components/demo-2/progressive-search.tsx`) |

---

## Demo 1 — baseline

| Area | Behavior |
|------|----------|
| **Prompt** | Describe companies in plain language. **Enter** runs the search. A sample prompt is pre-filled for the demo dataset. |
| **Run / Stop / Re-run** | Start a scan, stop mid-flight, or re-run (toast when interrupting). |
| **Progressive scan** | Rows move `pending → scanning → classified` (or `discarded`) with staggered timing and a spectrum shimmer on the status bar. |
| **Tiers** | **High**, **Medium**, **Low** — collapsible sections with counts. Low matches auto-discard when the prompt is relevant. |
| **Discarded** | Drawer for dropped companies; **Restore** on hover/focus or **Enter** when focused. Respects active sort order. |
| **Filter builder** | Structured attribute / operator / value conditions (`attio-filter-builder.tsx`) backed by `lib/filter-query.ts` + `lib/filter-attributes.ts`. Prompt phrases auto-populate filters (`lib/prompt-filters.ts`). |
| **Sort** | Match (score), Name, Size (employees), Founded — toggle direction on the active column. |
| **Row details** | Hover card with company metadata; **Enter** on a focused row opens it. |
| **Empty states** | Idle, irrelevant prompt, and no-strong-matches — shared centered layout. |
| **Keyboard** | Roving tabindex on rows; `↑/↓`, `Home/End`, `Enter`, `Esc`, and `/` to focus the prompt. See `components/keyboard-shortcuts-help.tsx`. |

---

## Demo 2 — redesign exploration

A three-phase flow orchestrated by `components/demo-2/progressive-search.tsx`:

```
home  →  (optional) clarification  →  results
```

**Home (`home-panel.tsx`)**
- Smart prompt editor with tokenized chips and a typing placeholder (`home-smart-prompt-editor.tsx`, `lib/prompt-tokens.ts`).
- **Improve** rewrites the prompt; **Run** triggers a shimmer, then a layout-flight transition into results.
- **Prompt-driven filter chips** (`home-filter-bar.tsx`): filters inferred from the prompt and filters added from the **Filter** dropdown render as `Company → Field` chips that wrap to multiple lines. Labels via `lib/home-filter-labels.ts`, mutations via `lib/home-filter-query.ts`.
- Funding submenu (`home-funding-filter-panel.tsx`) with a delayed-hover bridge (`use-delayed-hover.ts`) so the cursor can reach the panel without it closing.
- Saved searches list with a **sort dropdown** (Last editing / Created at / Last run / Name), per-row context menu, editor avatar, and hover-revealed timestamps.

**Clarification (`clarification/`)**
- When a prompt is ambiguous, a chat thread asks for confirmation (`lib/prompt-clarity.ts`). Cases: signal clarification and filter conflict.
- Thread messages and cards enter with a staggered fade-up animation.

**Results (`results-panel.tsx`, `chat-panel.tsx`)**
- Chat panel with a chain-of-thought run (`chain-of-thought.tsx`, `use-demo2-search-run.ts`) and staggered result rows.
- Source tabs, toolbar, and table chrome animate in, timed to the prompt flight.
- No-match templates and a post-search follow-up input (`results-no-match-*.tsx`, `post-search-follow-up.tsx`).

Motion timing for the whole flow lives in `components/demo-2/demo-2-motion.ts`; sizes/tokens in `demo-2-tokens.ts`.

---

## Design system

### Tokens (`app/globals.css`)
- **Surfaces:** `--background`, `--card`, `--secondary`, `--border` (low-contrast oklch alphas).
- **Brand:** `--primary` / `--accent`; `--ring` matches accent for focus rings.
- **Tiers:** `--tier-high`, `--tier-medium`, `--tier-low` (+ foreground pairs).
- **Scanning spectrum:** `--spectrum-1` … `--spectrum-6` for shimmer and progress gradients.

### Typography
- **Geist** — UI sans (`--font-sans`)
- **Inter** — labels, metadata, demo-2 surfaces (`font-inter`)
- **Geist Mono** — available via `--font-mono`

### Components
- **shadcn/ui** primitives under `components/ui/` (Radix + Tailwind v4).
- **Hugeicons** wrapped in `components/icons.tsx`; demo-2 uses local SVG assets under `public/demo-2/`.
- **Sonner** toasts (demo 1) — compact single-line copy; styles in `globals.css` + `components/ui/sonner.tsx`.
- **Framer Motion** throughout; `useReducedMotion()` zeroes durations when the user prefers reduced motion.

---

## Project structure

```
app/
  page.tsx            # demo selector landing
  demo-1/page.tsx     # → components/demo-1/progressive-search
  demo-2/page.tsx     # → components/demo-2/progressive-search
  layout.tsx          # fonts, theme, metadata, toaster
  globals.css         # design tokens + Sonner overrides
  robots.ts · sitemap.ts · manifest.ts · llms*.txt
components/
  demo-1/             # baseline progressive search
  demo-2/             # redesign: home / clarification / results + clarification/
  ui/                 # shadcn primitives
  icons.tsx · structured-data.tsx · theme-*.tsx
lib/
  data.ts                 # demo companies + scores
  filter-query.ts         # structured filter tree
  filter-attributes.ts    # attribute registry, operators, labels
  prompt-tokens.ts        # prompt tokenization + chips
  prompt-filters.ts       # prompt → filter inference (demo 1 + demo 2)
  home-filter-labels.ts   # demo-2 chip category/field labels
  home-filter-query.ts    # demo-2 chip add/update/remove helpers
  prompt-clarity.ts       # demo-2 clarification routing
  prompt-match.ts · demo2-prompt-match.ts  # relevance checks
  motion.ts · site.ts · llms.ts · utils.ts
```

---

## SEO & GEO (crawlers and LLMs)

Set `NEXT_PUBLIC_SITE_URL` in production so canonical URLs, Open Graph, and LLM files use your real domain.

| Path | Purpose |
|------|---------|
| `/robots.txt` | Crawl rules for all agents + common AI bots (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, …) |
| `/sitemap.xml` | Home + LLM resource URLs |
| `/llms.txt` | [llmstxt.org](https://llmstxt.org/) summary for generative engines |
| `/llms-full.txt` | Extended factual context |
| `/manifest.webmanifest` | PWA manifest (name, theme colors, icon) |

Content for `llms.txt` / `llms-full.txt` is generated from `lib/llms.ts` and `lib/site.ts`. JSON-LD is injected via `components/structured-data.tsx`. Copy `.env.example` → `.env.local` and set your deploy URL before shipping.

---

## Development

Requires **Node 18+**.

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Radix UI · Sonner · next-themes
