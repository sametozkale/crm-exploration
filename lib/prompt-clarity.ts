import { buildClarificationScenario } from "@/components/demo-2/clarification/clarification-data"
import type {
  ClarificationCaseId,
  ClarificationScenario,
} from "@/components/demo-2/clarification/clarification-types"
import { parsePromptTokens } from "@/lib/prompt-tokens"

export type { ClarificationCaseId, ClarificationResolution, ClarificationScenario } from "@/components/demo-2/clarification/clarification-types"

const IMPROVED_MARKER = /return results as a structured table/i

const FILTER_CONFLICT_PATTERN = /\b50\s*[–—-]\s*200\s+employees,?/i

const SIGNAL_AMBIGUITY_PATTERN =
  /\b(?:compliance\s+team|legal\s+team|mid-market)\b/i

/** Returns a clarification case id when the prompt needs pre-search chat; null = run directly. */
export function analyzePromptClarity(prompt: string): ClarificationCaseId | null {
  const trimmed = prompt.trim()
  if (!trimmed) return null

  if (FILTER_CONFLICT_PATTERN.test(trimmed)) {
    return "filter_conflict"
  }

  if (SIGNAL_AMBIGUITY_PATTERN.test(trimmed) && !isFullySpecifiedPrompt(trimmed)) {
    return "signal_clarification"
  }

  if (isFullySpecifiedPrompt(trimmed)) {
    return null
  }

  return null
}

function isFullySpecifiedPrompt(text: string): boolean {
  if (IMPROVED_MARKER.test(text)) return true

  const tokens = parsePromptTokens(text)
  const hasGeo = tokens.some((t) => t.type === "geo")
  const hasFunding = tokens.some(
    (t) => t.type === "numeric" && /series\s+[a-e]/i.test(t.value),
  )
  const hasHeadcount =
    /\bemployees\b/i.test(text) &&
    tokens.some(
      (t) =>
        t.type === "numeric" &&
        (/\d+\+/.test(t.value) || /\d+\s*[–—-]\s*\d+/.test(t.value)),
    )
  const hasTime = tokens.some((t) => t.type === "time")

  return hasGeo && hasFunding && hasHeadcount && hasTime
}

export { buildClarificationScenario }
