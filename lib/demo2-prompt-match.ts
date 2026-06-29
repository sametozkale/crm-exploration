import { DEMO2_COMPANIES } from "@/components/demo-2/demo-2-data"

const TOPIC_TERMS = [
  "saas",
  "b2b",
  "fintech",
  "software",
  "ai",
  "ml",
  "startup",
  "startups",
  "company",
  "companies",
  "series",
  "seed",
  "funding",
  "employees",
  "europe",
  "sales",
  "yc",
  "combinator",
  "enterprise",
  "security",
  "insurance",
  "technology",
  "internet",
  "development",
]

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^-+|-+$/g, ""))
    .filter(Boolean)
}

function buildCorpusTokens(): Set<string> {
  const tokens = new Set<string>(TOPIC_TERMS)

  for (const company of DEMO2_COMPANIES) {
    const blob = [
      company.name,
      company.industry,
      company.location,
      company.website,
      company.domain,
      company.description ?? "",
      company.lastFundingType ?? "",
    ].join(" ")

    for (const t of tokenize(blob)) {
      if (t.length >= 2) tokens.add(t)
    }
  }

  return tokens
}

const CORPUS_TOKENS = buildCorpusTokens()

function tokenMatchesCorpus(token: string): boolean {
  if (token.length < 2) return false
  if (CORPUS_TOKENS.has(token)) return true

  if (token.length >= 4) {
    for (const term of CORPUS_TOKENS) {
      if (term.length >= 4 && (term.includes(token) || token.includes(term))) {
        return true
      }
    }
  }

  return false
}

/** Whether the prompt can plausibly match companies in the demo-2 index. */
export function isDemo2PromptRelevant(query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return false

  const queryTokens = tokenize(trimmed)
  if (queryTokens.length === 0) return false

  let hits = 0
  for (const token of queryTokens) {
    if (token.length < 3 && !["ai", "ml", "yc"].includes(token)) continue
    if (tokenMatchesCorpus(token)) hits++
  }

  return hits > 0
}
