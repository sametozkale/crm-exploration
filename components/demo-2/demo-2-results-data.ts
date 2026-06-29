/** Figma 114:37425 — ready-made search templates (no-match results). */
export const DEMO2_NO_MATCH_TEMPLATES = [
  {
    id: "recently-funded",
    emoji: "🔥",
    title: "Recently Funded",
    description: "3,000+ startups that raised funding in the last 6 months",
    prompt: "Startups that raised funding in the last 6 months, B2B or fintech, US or Europe",
  },
  {
    id: "unicorn",
    emoji: "🦄",
    title: "Unicorn Companies",
    description: "500+ private companies valued at $1B+ globally",
    prompt: "Unicorn startups valued at $1B+, US or Europe, 500+ employees",
  },
  {
    id: "series-a",
    emoji: "🌱",
    title: "Series A Startups",
    description: "4,000+ companies that raised Series A funding",
    prompt: "Series A startups founded after 2020, B2B software, 30–120 employees",
  },
  {
    id: "logistics",
    emoji: "🚚",
    title: "Logistics & Supply Chain",
    description: "2,800+ freight, delivery, and supply chain technology companies",
    prompt: "Logistics and supply chain technology companies, Series B+, US or Europe",
  },
  {
    id: "pe-backed",
    emoji: "💼",
    title: "PE-Backed Companies",
    description: "6,000+ companies backed by private equity firms",
    prompt: "PE-backed software companies in the US, $50M+ revenue, growing headcount",
  },
  {
    id: "plg",
    emoji: "🤝",
    title: "PLG Companies",
    description: "1,500+ companies using a product-led growth go-to-market motion",
    prompt: "Product-led growth SaaS companies, 50–200 employees, US-based",
  },
  {
    id: "ecommerce",
    emoji: "🛒",
    title: "E-Commerce",
    description: "5,000+ online retail and marketplace companies",
    prompt: "E-commerce and online retail companies, Series A+, 100–500 employees",
  },
] as const

/** Chat sidebar follow-up when search completes with no index matches. */
export const DEMO2_NO_MATCH_POST_SEARCH_PARAGRAPHS = [
  "We couldn't find companies in our index for this prompt.",
  "Try describing the sector, signals, or type of company you want — or run a new search using the ready-made templates in the results panel.",
] as const

/** Figma 114:37415 — tips shown on "How to get better results?" hover. */
export const DEMO2_NO_MATCH_BETTER_RESULTS_TIPS = [
  "Be specific — e.g. AI lab, enterprise SaaS, Series B",
  "Add signals like alumni, geography, or funding stage",
  "Avoid unrelated keywords that don't match our dataset",
] as const

/** Figma 127:52038 — two-line tooltip on scanning source tab hover. */
export function formatScanningSourceTooltip(prompt: string): { line1: string; line2: string } {
  const trimmed = prompt.trim()
  if (!trimmed) {
    return { line1: "Looking for companies", line2: "matching your criteria" }
  }

  const topAiMatch = trimmed.match(/^top\s+ai\s+companies?\s+(.+)$/i)
  if (topAiMatch) {
    return {
      line1: "Looking for companies",
      line2: `in AI space ${topAiMatch[1]}`.replace(/\s+/g, " ").trim(),
    }
  }

  const words = trimmed.split(/\s+/)
  if (words.length <= 3) {
    return { line1: "Looking for companies", line2: trimmed }
  }

  const mid = Math.max(2, Math.ceil(words.length / 2))
  return {
    line1: `Looking for ${words.slice(0, mid).join(" ")}`,
    line2: words.slice(mid).join(" "),
  }
}
