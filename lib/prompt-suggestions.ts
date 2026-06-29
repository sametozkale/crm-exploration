import { isFundingStage, parsePromptTokens } from "@/lib/prompt-tokens"

export type PromptSuggestion = {
  id: string
  label: string
  insertText: string
  iconUrl?: string
  emoji?: string
  /** Figma 61:18704 — AI stars for dynamic gap suggestions. */
  aiIcon?: boolean
}

const MAX_SUGGESTIONS = 3

/** Default chips when the prompt is empty (Figma home). */
export const STATIC_PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: "yc",
    label: "YC companies",
    insertText: "YC companies",
    iconUrl: "/demo-2/home/yc-chip.jpg",
  },
  {
    id: "saas",
    label: "SaaS companies",
    insertText: "SaaS companies",
    emoji: "🚀",
  },
  {
    id: "fintech",
    label: "Fintech companies",
    insertText: "Fintech companies",
    emoji: "🏛️",
  },
]

type PromptGaps = {
  location: boolean
  headcount: boolean
  funding: boolean
  founded: boolean
  industry: boolean
}

function stripTrailingPunctuation(text: string): string {
  return text.replace(/[.?!]+\s*$/, "").trim()
}

function analyzePromptGaps(text: string): PromptGaps {
  const trimmed = text.trim()
  const tokens = parsePromptTokens(trimmed)

  const hasGeo = tokens.some((t) => t.type === "geo")
  const hasLocationPhrase =
    hasGeo ||
    /\b(?:based in|headquartered in|hq in|located in)\b/i.test(trimmed) ||
    /\bin\s+(?:the\s+)?(?:us|uk|eu|europe|asia|nordics?|dach|latam)\b/i.test(trimmed)

  const hasHeadcount =
    /\b\d[\d,.]*\+?\s*(?:employees|employee)\b/i.test(trimmed) ||
    /\b\d+\s*[–—-]\s*\d+\s+employees\b/i.test(trimmed) ||
    (/\b(?:employees|headcount|team size)\b/i.test(trimmed) &&
      tokens.some(
        (t) =>
          t.type === "numeric" &&
          (/\d+\+/.test(t.value) || /\d+\s*[–—-]\s*\d+/.test(t.value)),
      ))

  const hasFunding =
    tokens.some((t) => t.type === "numeric" && isFundingStage(t.value)) ||
    /\b(?:bootstrapped|unicorn|ipo)\b/i.test(trimmed)

  const hasFounded =
    tokens.some((t) => t.type === "time") ||
    /\bfounded\s+(?:after|before|in|since)\b/i.test(trimmed) ||
    /\b(?:after|before|since)\s+\d{4}\b/i.test(trimmed)

  const hasIndustry =
    tokens.some((t) => t.type === "industry") ||
    /\b(?:saas|fintech|healthcare|e-?commerce|b2b|dev\s*tools|cybersecurity|insurance|biotech)\b/i.test(
      trimmed,
    )

  return {
    location: !hasLocationPhrase,
    headcount: !hasHeadcount,
    funding: !hasFunding,
    founded: !hasFounded,
    industry: !hasIndustry,
  }
}

const DYNAMIC_SUGGESTION_CATALOG: {
  gap: keyof PromptGaps
  suggestion: PromptSuggestion
}[] = [
  {
    gap: "location",
    suggestion: {
      id: "location",
      label: "Add location",
      insertText: "based in Europe",
      aiIcon: true,
    },
  },
  {
    gap: "headcount",
    suggestion: {
      id: "headcount",
      label: "Specify employee size",
      insertText: "100+ employees",
      aiIcon: true,
    },
  },
  {
    gap: "funding",
    suggestion: {
      id: "funding",
      label: "Add funding stage",
      insertText: "Series B or later",
      aiIcon: true,
    },
  },
  {
    gap: "founded",
    suggestion: {
      id: "founded",
      label: "Add founding year",
      insertText: "founded after 2020",
      aiIcon: true,
    },
  },
  {
    gap: "industry",
    suggestion: {
      id: "industry",
      label: "Specify industry",
      insertText: "B2B SaaS",
      aiIcon: true,
    },
  },
]

/** Up to 3 contextual chips for the current prompt. Empty prompt → static starters. */
export function getPromptSuggestions(prompt: string): PromptSuggestion[] {
  const trimmed = prompt.trim()
  if (!trimmed) return STATIC_PROMPT_SUGGESTIONS.slice(0, MAX_SUGGESTIONS)

  const gaps = analyzePromptGaps(trimmed)
  const dynamic = DYNAMIC_SUGGESTION_CATALOG.filter(({ gap }) => gaps[gap]).map(
    ({ suggestion }) => suggestion,
  )

  return dynamic.slice(0, MAX_SUGGESTIONS)
}

function clauseAlreadyPresent(prompt: string, clause: string): boolean {
  const p = prompt.toLowerCase()
  const c = clause.toLowerCase()
  if (p.includes(c)) return true

  if (/^based in /i.test(clause)) {
    const place = clause.replace(/^based in /i, "").trim()
    return new RegExp(`\\b(?:based in|hq in|in)\\s+${escapeRegExp(place)}\\b`, "i").test(
      prompt,
    )
  }

  if (/^founded after /i.test(clause)) {
    const year = clause.replace(/^founded after /i, "").trim()
    return new RegExp(`\\b(?:founded\\s+)?(?:after|since)\\s+${escapeRegExp(year)}\\b`, "i").test(
      prompt,
    )
  }

  if (/\d+\+?\s*employees$/i.test(clause)) {
    return /\b\d[\d,.]*\+?\s*employees\b/i.test(prompt)
  }

  if (/^series /i.test(clause)) {
    return /\bseries\s+[a-e]/i.test(prompt)
  }

  return false
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Append a suggestion clause without breaking the prompt's sentence flow.
 * Uses comma joins for filter-style fragments; starts fresh when prompt is empty.
 */
export function applyPromptSuggestion(prompt: string, insertText: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ")
  if (!trimmed) return insertText
  if (clauseAlreadyPresent(trimmed, insertText)) return trimmed

  const base = stripTrailingPunctuation(trimmed)

  const startsNewSentence = /^(find|show me|list|get me|search for)\b/i.test(insertText)
  if (startsNewSentence) return insertText

  if (/,\s*$/.test(base)) return `${base} ${insertText}`

  const commaJoin =
    /^(based in|hq in|in |with |founded |series |seed|pre-seed|\d)/i.test(insertText) ||
    /\b(employees|employee|funding|founded)\b/i.test(insertText) ||
    /^[A-Z]{2,}/.test(insertText)

  if (commaJoin) return `${base}, ${insertText}`

  return `${base}. ${insertText}`
}
