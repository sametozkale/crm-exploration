export type ClarificationCaseId = "signal_clarification" | "filter_conflict"

export type ClarificationResolution =
  | { kind: "run"; prompt: string }
  | { kind: "open_filters"; prompt: string }

export type ChatMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; multiline?: boolean }

export interface SignalOption {
  id: string
  label: string
  title: string
  meta: string
}

export interface SignalClarificationCardData {
  kind: "signal_clarification"
  intro: string
  ambiguousPhrase: string
  signals: SignalOption[]
  summary: string
}

export interface FilterConflictSegment {
  text: string
  conflict?: boolean
  suggested?: boolean
}

export interface FilterConflictCardData {
  kind: "filter_conflict"
  intro: string
  beforeLabel: string
  beforeSegments: FilterConflictSegment[]
  afterLabel: string
  afterSegments: FilterConflictSegment[]
  summary: string
  suggestedPrompt: string
  originalPrompt: string
}

export type ClarificationCardData = SignalClarificationCardData | FilterConflictCardData

export interface ClarificationScenario {
  id: ClarificationCaseId
  messages: ChatMessage[]
  card: ClarificationCardData
}
