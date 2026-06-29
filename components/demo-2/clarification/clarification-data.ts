import type {
  ClarificationCardData,
  ClarificationCaseId,
  ClarificationScenario,
  ChatMessage,
} from "./clarification-types"

const SIGNAL_CLARIFICATION_SIGNALS = [
  {
    id: "hiring",
    label: "SIGNAL #1",
    title: "Companies hiring for legal or compliance roles",
    meta: "Based on active job postings — 1,240 companies match",
  },
  {
    id: "industry",
    label: "SIGNAL #2",
    title: "Industry includes Legal Tech, RegTech, or Compliance SaaS",
    meta: "Based on Zero's industry tags — 380 companies match",
  },
] as const

function buildSignalClarificationMessages(prompt: string): ChatMessage[] {
  return [
    { role: "user", text: prompt },
    {
      role: "assistant",
      text: "I'll look for B2B SaaS companies in the US with 100–500 employees",
    },
  ]
}

function buildSignalClarificationCard(prompt: string): ClarificationCardData {
  const ambiguousPhrase = extractAmbiguousPhrase(prompt) ?? "legal or compliance team"
  return {
    kind: "signal_clarification",
    intro: `For "${ambiguousPhrase}" I used two signals — let me know if these look right:`,
    ambiguousPhrase,
    signals: [...SIGNAL_CLARIFICATION_SIGNALS],
    summary: "Using both signals gives you ~840 companies to start with.",
  }
}

function extractAmbiguousPhrase(prompt: string): string | null {
  if (/\b(?:compliance|legal)\s+team\b/i.test(prompt)) {
    return "legal or compliance team"
  }
  if (/\bmid-market\b/i.test(prompt)) return "mid-market"
  const match = prompt.match(/\b(?:compliance\s+team|legal\s+team)\b/i)
  return match ? "legal or compliance team" : null
}

function buildFilterConflictMessages(prompt: string): ChatMessage[] {
  return [
    { role: "user", text: prompt },
    {
      role: "assistant",
      text: "Got it. I'll search for Series A B2B SaaS companies in Europe with active sales hiring signals.",
      multiline: true,
    },
    {
      role: "assistant",
      text: "Before we start the search, I need to verify your preferences since the filter has been updated. The headcount is now set to 200–500 employees.",
      multiline: true,
    },
  ]
}

function buildSuggestedPrompt(prompt: string): string {
  const suggested = prompt.replace(
    /\b50\s*[–—-]\s*200\s+employees,?/i,
    (match) => (match.endsWith(",") ? "200–500 employees," : "200–500 employees"),
  )
  return suggested.replace(/200–500 employees,(\S)/g, "200–500 employees, $1")
}

function buildFilterConflictCard(prompt: string): ClarificationCardData {
  const suggestedPrompt = buildSuggestedPrompt(prompt)
  const beforeSegments = buildBeforeSegments(prompt)
  const afterSegments = buildAfterSegments(suggestedPrompt)

  return {
    kind: "filter_conflict",
    intro:
      "Your filter update conflicts with the headcount in your prompt. Here's a revised prompt that matches your filters — apply it or keep your original.",
    beforeLabel: "Before (your prompt)",
    beforeSegments,
    afterLabel: "After (suggested)",
    afterSegments,
    summary:
      "Suggested prompt would return approx. ~1,840 companies — vs. ~640 with your original.",
    suggestedPrompt,
    originalPrompt: prompt,
  }
}

function buildBeforeSegments(prompt: string) {
  const conflictPattern = /\b50\s*[–—-]\s*200\s+employees,?/i
  const match = prompt.match(conflictPattern)
  if (!match || match.index == null) {
    return [{ text: prompt }]
  }
  const start = match.index
  const end = start + match[0].length
  const segments = []
  if (start > 0) segments.push({ text: prompt.slice(0, start) })
  segments.push({ text: match[0], conflict: true })
  if (end < prompt.length) segments.push({ text: prompt.slice(end) })
  return segments
}

function buildAfterSegments(suggested: string) {
  const suggestedPattern = /\b200\s*[–—-]\s*500\s+employees,?/i
  const match = suggested.match(suggestedPattern)
  if (!match || match.index == null) {
    return [{ text: suggested }]
  }
  const start = match.index
  const end = start + match[0].length
  const segments = []
  if (start > 0) segments.push({ text: suggested.slice(0, start) })
  segments.push({ text: match[0], suggested: true })
  if (end < suggested.length) segments.push({ text: suggested.slice(end) })
  return segments
}

export function buildClarificationScenario(
  caseId: ClarificationCaseId,
  prompt: string,
): ClarificationScenario {
  const trimmed = prompt.trim()
  switch (caseId) {
    case "signal_clarification":
      return {
        id: caseId,
        messages: buildSignalClarificationMessages(trimmed),
        card: buildSignalClarificationCard(trimmed),
      }
    case "filter_conflict":
      return {
        id: caseId,
        messages: buildFilterConflictMessages(trimmed),
        card: buildFilterConflictCard(trimmed),
      }
  }
}
