export type TokenType =
  | "numeric"
  | "org"
  | "time"
  | "geo"
  | "role"
  | "industry"

export interface PromptToken {
  /** Inclusive start index into the source string. */
  start: number
  /** Exclusive end index into the source string. */
  end: number
  value: string
  type: TokenType
}

/** Soft chip styling per token type, with dark-mode variants. */
export const TOKEN_STYLES: Record<TokenType, string> = {
  numeric:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  org: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  time: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  geo: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  role: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  industry:
    "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
}

export const TOKEN_LABELS: Record<TokenType, string> = {
  numeric: "Threshold",
  org: "Organization",
  time: "Time range",
  geo: "Geography",
  role: "Role",
  industry: "Industry",
}

/** Known organizations the demo can recognize and suggest peers for. */
const ORG_DICTIONARY = [
  "OpenAI",
  "Anthropic",
  "DeepMind",
  "Google DeepMind",
  "Google Brain",
  "Meta AI",
  "Mistral",
  "xAI",
  "Cohere",
  "Hugging Face",
  "Stability AI",
  "Inflection",
  "Adept",
  "YC",
  "Y Combinator",
]

const GEO_DICTIONARY = [
  "San Francisco",
  "New York",
  "London",
  "Remote-first",
  "Remote",
  "United States",
  "USA",
  "US",
  "Europe",
  "Asia",
  "Global",
]

const ROLE_DICTIONARY = [
  "co-founder",
  "cofounder",
  "founder",
  "founders",
  "alumni",
  "researcher",
  "researchers",
  "research scientist",
  "engineer",
  "engineers",
  "executive",
  "advisor",
]

const INDUSTRY_DICTIONARY = [
  "AI lab",
  "AI labs",
  "AI safety",
  "AI alignment",
  "robotics",
  "LLMs",
  "large language models",
  "multimodal",
  "inference",
  "computer vision",
  "machine learning",
  "agents",
  "developer tools",
  "B2B SaaS",
  "SaaS",
  "fintech",
  "healthcare",
  "cybersecurity",
]

interface Candidate {
  start: number
  end: number
  value: string
  type: TokenType
  /** Higher priority wins when two candidates overlap. */
  priority: number
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Collect all literal matches for a dictionary as whole-ish phrases. */
function collectDictionary(
  text: string,
  dictionary: string[],
  type: TokenType,
  priority: number,
): Candidate[] {
  const out: Candidate[] = []
  for (const term of dictionary) {
    const pattern = new RegExp(
      `(?<![\\w])${escapeRegExp(term)}(?![\\w])`,
      "gi",
    )
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      out.push({
        start: match.index,
        end: match.index + match[0].length,
        value: match[0],
        type,
        priority,
      })
      if (match.index === pattern.lastIndex) pattern.lastIndex++
    }
  }
  return out
}

function collectRegex(
  text: string,
  pattern: RegExp,
  type: TokenType,
  priority: number,
): Candidate[] {
  const out: Candidate[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`)
  while ((match = re.exec(text)) !== null) {
    const value = match[0].trim()
    if (!value) {
      re.lastIndex++
      continue
    }
    const start = match.index + match[0].indexOf(value)
    out.push({
      start,
      end: start + value.length,
      value,
      type,
      priority,
    })
    if (match.index === re.lastIndex) re.lastIndex++
  }
  return out
}

/**
 * Parse a prompt into non-overlapping editable tokens, sorted by position.
 * Uses a regex + keyword dictionary pass. Longer / higher-priority matches win
 * when ranges overlap.
 */
export function parsePromptTokens(text: string): PromptToken[] {
  if (!text) return []

  const candidates: Candidate[] = []

  // Time ranges (priority high so "after 2022" beats a bare numeric "2022").
  candidates.push(
    ...collectRegex(
      text,
      /\blast\s+\d+\s+(?:months?|years?|weeks?|days?)\b/gi,
      "time",
      5,
    ),
    // Chip only the year — "founded after 2022" keeps the prefix as plain text.
    ...collectRegex(
      text,
      /\b(?<=(?:founded\s+)?(?:after|before|since)\s+)\d{4}\b/gi,
      "time",
      5,
    ),
    ...collectRegex(text, /\b\d{4}\s?[–—-]\s?\d{4}\b/gi, "time", 5),
    ...collectRegex(text, /\ball\s+time\b/gi, "time", 5),
  )

  // Numeric thresholds / funding stage.
  candidates.push(
    // Headcount — chip only the threshold; " employees" stays plain text.
    ...collectRegex(text, /\b\d[\d,.]*\+(?=\s+employees\b)/gi, "numeric", 5),
    ...collectRegex(text, /\b\d+\s?[–—-]\s?\d+(?=\s+employees\b)/gi, "numeric", 5),
    ...collectRegex(
      text,
      /\$?\d[\d,.]*\s?(?:\+|million|billion|m|b|k)?\+?/gi,
      "numeric",
      3,
    ),
    ...collectRegex(text, /\bSeries\s+[A-E]\b/gi, "numeric", 4),
  )

  // Dictionary-driven types.
  candidates.push(...collectDictionary(text, ORG_DICTIONARY, "org", 4))
  candidates.push(...collectDictionary(text, INDUSTRY_DICTIONARY, "industry", 3))
  candidates.push(...collectDictionary(text, GEO_DICTIONARY, "geo", 2))
  candidates.push(...collectDictionary(text, ROLE_DICTIONARY, "role", 2))

  // Drop degenerate numeric matches (e.g. a lone year already covered by time).
  const filtered = candidates.filter((c) => {
    if (c.type === "numeric") {
      return /\d/.test(c.value) || /^series\s+[a-e]$/i.test(c.value.trim())
    }
    return c.value.trim().length > 0
  })

  // Resolve overlaps: prefer higher priority, then longer span.
  filtered.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    if (a.priority !== b.priority) return b.priority - a.priority
    return b.end - b.start - (a.end - a.start)
  })

  const chosen: Candidate[] = []
  for (const cand of filtered) {
    const overlaps = chosen.some(
      (c) => cand.start < c.end && c.start < cand.end,
    )
    if (!overlaps) chosen.push(cand)
  }

  chosen.sort((a, b) => a.start - b.start)

  return chosen.map(({ start, end, value, type }) => ({
    start,
    end,
    value,
    type,
  }))
}

function nearbyNumericValues(value: string): string[] {
  const num = Number(value.replace(/[^\d.]/g, ""))
  const hasPlus = /\+/.test(value)
  const suffix = hasPlus ? "+" : ""
  if (!Number.isFinite(num) || num === 0) {
    return ["50+", "100+", "500+", "1000+"]
  }
  const ladder = [50, 100, 200, 500, 1000, 5000]
  const picks = ladder.filter((n) => n !== Math.round(num)).slice(0, 4)
  return picks.map((n) => `${n}${suffix}`)
}

/** Full dropdown option list for smart chips (Figma 79:952). */
export function getTokenDropdownOptions(value: string, type: TokenType): string[] {
  const current = value.trim()
  const norm = (s: string) => s.toLowerCase()

  const withCurrent = (options: string[]) => {
    const merged = options.some((o) => norm(o) === norm(current))
      ? options
      : [current, ...options]
    return [...new Map(merged.map((o) => [norm(o), o])).values()]
  }

  switch (type) {
    case "numeric": {
      if (/series/i.test(current)) {
        return [
          "Angel",
          "Pre-seed",
          "Seed",
          "Series A",
          "Series B",
          "Series C",
          "Series D",
        ]
      }
      return withCurrent(["50+", "100+", "200+", "500+", "1000+", "5000+"])
    }
    case "org":
      return withCurrent([
        "OpenAI",
        "Anthropic",
        "Google DeepMind",
        "Meta AI",
        "Mistral",
        "xAI",
        "Cohere",
        "YC",
      ])
    case "time": {
      if (/^\d{4}$/.test(current)) {
        return withCurrent(["2020", "2021", "2022", "2023", "2024", "2025"])
      }
      return withCurrent([
        "last 30 days",
        "last 3 months",
        "last 6 months",
        "last year",
        "founded after 2022",
        "2023–2025",
        "all time",
      ])
    }
    case "geo":
      return withCurrent([
        "US",
        "Europe",
        "Asia",
        "Global",
        "San Francisco",
        "Remote-first",
      ])
    case "role":
      return withCurrent([
        "founder",
        "co-founder",
        "researcher",
        "engineer",
        "SDR",
        "AE",
        "executive",
        "advisor",
      ])
    case "industry":
      return withCurrent([
        "B2B SaaS",
        "SaaS",
        "fintech",
        "AI safety",
        "robotics",
        "LLMs",
        "multimodal",
        "agents",
      ])
    default:
      return current ? [current] : []
  }
}

/** Hardcoded, sensible alternatives per token type (no API call). */
export function getTokenSuggestions(value: string, type: TokenType): string[] {
  switch (type) {
    case "numeric": {
      if (/series/i.test(value)) {
        return ["Series A", "Series B", "Series C", "Series D"].filter(
          (v) => v.toLowerCase() !== value.toLowerCase(),
        )
      }
      return nearbyNumericValues(value)
    }
    case "org": {
      const peers = [
        "OpenAI",
        "Anthropic",
        "Google DeepMind",
        "Meta AI",
        "Mistral",
        "xAI",
        "Cohere",
      ]
      return peers.filter((p) => p.toLowerCase() !== value.toLowerCase()).slice(0, 5)
    }
    case "time": {
      if (/^\d{4}$/.test(value)) {
        return ["2020", "2021", "2022", "2023", "2024", "2025"].filter(
          (v) => v !== value,
        )
      }
      return ["last 3 months", "last year", "2023–2025", "all time"].filter(
        (v) => v.toLowerCase() !== value.toLowerCase(),
      )
    }
    case "geo":
      return ["US", "Europe", "Asia", "Global", "Remote-first"].filter(
        (v) => v.toLowerCase() !== value.toLowerCase(),
      )
    case "role":
      return ["founder", "researcher", "engineer", "executive", "advisor"].filter(
        (v) => v.toLowerCase() !== value.toLowerCase(),
      )
    case "industry":
      return ["B2B SaaS", "SaaS", "fintech", "AI safety", "robotics", "LLMs", "multimodal", "agents"].filter(
        (v) => v.toLowerCase() !== value.toLowerCase(),
      )
    default:
      return []
  }
}

const IMPROVED_MARKER = /return results as a structured table/i

function stripTrailingPunctuation(text: string): string {
  return text.replace(/[.?!]+\s*$/, "").trim()
}

/**
 * Build follow-up clauses using dictionary-backed terms so improved prompts
 * still surface editable token chips (orgs, alumni, Series B, geo, …).
 */
function buildTokenRichEnrichment(raw: string, tokens: PromptToken[]): string[] {
  const parts: string[] = []

  const orgs = tokens.filter((t) => t.type === "org").map((t) => t.value)
  const hasAlumni = /\balumni\b/i.test(raw)
  const hasFounder = /\bfounders?\b/i.test(raw)
  const hasGeo = tokens.some((t) => t.type === "geo")
  const hasFundingStage = tokens.some(
    (t) => t.type === "numeric" && /series\s+[a-e]/i.test(t.value),
  )
  const hasTime = tokens.some((t) => t.type === "time")
  const hasHeadcount =
    /\bemployees\b/i.test(raw) &&
    tokens.some(
      (t) =>
        t.type === "numeric" &&
        (/\d+\+$/.test(t.value) || /\d+\s*[–—-]\s*\d+/.test(t.value)),
    )
  const hasIndustry = tokens.some((t) => t.type === "industry")

  if (hasAlumni || hasFounder) {
    parts.push("Prioritize alumni and founders with frontier lab experience")
  }

  if (orgs.length > 0) {
    const orgPhrase = orgs.slice(0, 3).join(", ")
    parts.push(`Include spinouts and researchers connected to ${orgPhrase}`)
  }

  if (!hasGeo) {
    parts.push("HQ in San Francisco or Remote-first")
  }

  if (!hasFundingStage) {
    parts.push("Series B or later")
  }

  if (!hasTime) {
    parts.push("founded after 2022")
  }

  if (!hasHeadcount) {
    parts.push("100+ employees")
  }

  if (!hasIndustry && /\bAI\b/i.test(raw)) {
    parts.push("Focus on AI safety, LLMs, and multimodal researchers")
  }

  parts.push(
    "Return results as a structured table with name, founding year, funding, and headcount",
  )

  return parts
}

/**
 * Simulated "Improve" rewrite. Deterministic so the demo is stable. Preserves the
 * user's intent and appends token-rich filters the chip parser can recognize.
 */
export function improvePrompt(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ")
  if (!trimmed) return trimmed

  if (IMPROVED_MARKER.test(trimmed)) {
    return trimmed
  }

  const tokens = parsePromptTokens(trimmed)
  const core = stripTrailingPunctuation(
    trimmed.replace(/^(find|show me|list|get me|search for)\s+/i, ""),
  )
  const lead = /^find\b/i.test(trimmed)
    ? stripTrailingPunctuation(trimmed)
    : `Find ${core}`

  const enrichment = buildTokenRichEnrichment(trimmed, tokens)
  return `${lead}. ${enrichment.join(". ")}.`
}
