import { COMPANIES } from "@/lib/data"

const DEMO_PROMPT =
  "AI labs founded by alumni of OpenAI, Anthropic, or DeepMind"

/** Topic terms that align with the demo dataset and default prompt. */
const TOPIC_TERMS = [
  "ai",
  "ml",
  "llm",
  "lab",
  "labs",
  "artificial",
  "intelligence",
  "machine",
  "learning",
  "model",
  "models",
  "neural",
  "foundation",
  "frontier",
  "openai",
  "anthropic",
  "deepmind",
  "deep",
  "mind",
  "google",
  "brain",
  "alumni",
  "founder",
  "founders",
  "founded",
  "research",
  "transformer",
  "startup",
  "startups",
  "enterprise",
  "safety",
  "inference",
  "multimodal",
  "agent",
  "agents",
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

  for (const company of COMPANIES) {
    const blob = [
      company.name,
      company.domain,
      company.tagline,
      company.category,
      company.reasoning,
      company.hq,
      company.funding,
      ...company.signals,
    ].join(" ")
    for (const t of tokenize(blob)) {
      if (t.length >= 2) tokens.add(t)
    }
  }

  for (const t of tokenize(DEMO_PROMPT)) {
    if (t.length >= 2) tokens.add(t)
  }

  return tokens
}

const CORPUS_TOKENS = buildCorpusTokens()

function tokenMatchesCorpus(token: string, corpus: Set<string>): boolean {
  if (token.length < 2) return false
  if (corpus.has(token)) return true

  if (token.length >= 4) {
    for (const term of corpus) {
      if (term.length >= 4 && (term.includes(token) || token.includes(term))) {
        return true
      }
    }
  }

  return false
}

/** Whether the prompt is plausibly related to the demo company index. */
export function isPromptRelevant(query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return false

  const queryTokens = tokenize(trimmed)
  if (queryTokens.length === 0) return false

  let hits = 0
  for (const token of queryTokens) {
    if (token.length < 3 && !["ai", "ml"].includes(token)) continue
    if (tokenMatchesCorpus(token, CORPUS_TOKENS)) hits++
  }

  return hits > 0
}
