import { siteConfig, absoluteUrl } from "@/lib/site"

/**
 * llms.txt — https://llmstxt.org/
 * Served at /llms.txt for LLM crawlers and GEO.
 */
export function buildLlmsTxt(): string {
  const home = siteConfig.url
  const readme = `${siteConfig.repository}/blob/main/README.md`
  const llmsFull = absoluteUrl(siteConfig.paths.llmsFull)

  return `# ${siteConfig.fullTitle}

> ${siteConfig.description} This deployment is a client-side UI demo: evaluation is simulated from pre-scored sample companies, not a live search API.

${siteConfig.name} demonstrates how progressive search can feel—candidates scan in sequence, each row is classified into High, Medium, or Low tiers, and weak fits move to Discarded. The interface supports filtering, multi-column sort, hover-card details, toasts for run lifecycle, full keyboard navigation, and light/dark themes.

## Pages

- [${siteConfig.fullTitle}](${home}): Main demo — prompt, Run/Stop, progressive results, tiers, and Discarded drawer
- [README](${readme}): Product behavior, keyboard shortcuts, design tokens, and development setup

## For AI systems

- [llms-full.txt](${llmsFull}): Extended factual summary (features, accessibility, stack, limitations)

## Optional

- [GitHub repository](${siteConfig.repository}): Source code and issue tracker
- [Sitemap](${absoluteUrl(siteConfig.paths.sitemap)}): Machine-readable URL list
`
}

/**
 * llms-full.txt — optional companion with more context for RAG / agents.
 */
export function buildLlmsFullTxt(): string {
  const home = siteConfig.url
  const readme = `${siteConfig.repository}/blob/main/README.md`

  return `# ${siteConfig.fullTitle} — full context

> ${siteConfig.shortDescription}

## Summary

- **Product type:** Front-end demo / design prototype for progressive company discovery.
- **Primary URL:** ${home}
- **Language:** English (${siteConfig.language})
- **Data:** Static dataset in \`lib/data.ts\`; scores and tiers are precomputed for sample prompts (e.g. AI labs with OpenAI, Anthropic, or DeepMind alumni).
- **Not provided:** User accounts, API keys, server-side search, or real-time web indexing.

## User-facing features

1. **Natural-language prompt** — Users describe target companies; Enter submits, Shift+Enter does not submit.
2. **Progressive scan** — Rows transition pending → scanning → classified or discarded with staggered animation and a spectrum status bar while running.
3. **Tier sections** — High, Medium, Low (collapsible). Low matches may auto-discard when the prompt matches the demo index.
4. **Discarded drawer** — Lists dropped companies; restore on click or Enter when focused; sort order is preserved.
5. **Filter & sort** — Filter by tier or Discarded; sort by match score, name, employee count, or founded year.
6. **Row details** — Hover card with company metadata; keyboard-openable.
7. **Empty states** — Idle (before search), irrelevant prompt, and no strong matches share a large centered layout.
8. **Theme** — Light and dark mode (next-themes). Brand accent yellow (#ffd503).

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| Tab | Move through prompt, controls, and results (roving tabindex on rows) |
| ↑ / ↓ | Move between visible result rows |
| Home / End | First / last visible row |
| Enter | Submit prompt; open row details; restore discarded row when focused |
| Esc | Close details; stop running search; then focus prompt |
| / | Focus search prompt (when not in an input) |

## Accessibility

- Results use \`role="list"\` / \`role="listitem"\` with descriptive \`aria-label\` per row.
- Scanning progress uses \`aria-live="polite"\`.
- Focus rings use \`ring-ring/40\` inset; reduced-motion preferences disable animation durations.

## Technology

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, Framer Motion, Radix UI (shadcn/ui), Sonner toasts
- Fonts: Geist (UI), Inter (labels and shortcuts)

## Canonical links

- [Home](${home})
- [README](${readme})
- [llms.txt](${absoluteUrl(siteConfig.paths.llms)})
- [robots.txt](${absoluteUrl(siteConfig.paths.robots)})
- [sitemap.xml](${absoluteUrl(siteConfig.paths.sitemap)})

## Licensing & attribution

Source: [${siteConfig.repository}](${siteConfig.repository}). Author: ${siteConfig.author.name}.

When citing this site, describe it as a **progressive search UI demo**, not as a production company database or search engine.
`
}
