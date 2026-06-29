/** Figma 114:37425 — ready-made search templates (no-match results). */
export const DEMO2_NO_MATCH_TEMPLATES = [
  {
    id: "recently-funded",
    emoji: "🔥",
    title: "Recently Funded",
    description: "3,000+ startups that raised funding in the last 6 months",
  },
  {
    id: "unicorn",
    emoji: "🦄",
    title: "Unicorn Companies",
    description: "500+ private companies valued at $1B+ globally",
  },
  {
    id: "series-a",
    emoji: "🌱",
    title: "Series A Startups",
    description: "4,000+ companies that raised Series A funding",
  },
  {
    id: "logistics",
    emoji: "🚚",
    title: "Logistics & Supply Chain",
    description: "2,800+ freight, delivery, and supply chain technology companies",
  },
  {
    id: "pe-backed",
    emoji: "💼",
    title: "PE-Backed Companies",
    description: "6,000+ companies backed by private equity firms",
  },
  {
    id: "plg",
    emoji: "🤝",
    title: "PLG Companies",
    description: "1,500+ companies using a product-led growth go-to-market motion",
  },
  {
    id: "ecommerce",
    emoji: "🛒",
    title: "E-Commerce",
    description: "5,000+ online retail and marketplace companies",
  },
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
