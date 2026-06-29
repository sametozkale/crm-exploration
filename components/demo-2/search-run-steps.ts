export type SearchRunStepStatus = "pending" | "active" | "done"

export type SearchRunStep = {
  id: string
  label: string
}

/** Figma 127:37623 — chain-of-thought steps while search runs. */
export const DEMO2_SEARCH_RUN_STEPS: SearchRunStep[] = [
  { id: "intent", label: "User is asking me to find companies" },
  { id: "research", label: "Researching potential companies..." },
  { id: "find", label: "Finding companies by prompt" },
  { id: "scrape", label: "Scraping company websites" },
  { id: "enrich", label: "Enriching all details" },
  { id: "score", label: "Scoring and ranking matches" },
  { id: "signals", label: "Looking up contact & job signals" },
  { id: "finalize", label: "Preparing results table" },
]

/** CoT + skeleton table — no real rows until this elapses. */
export const DEMO2_SCANNING_HOLD_MS = 10_000
export const DEMO2_ROW_REVEAL_MS = 340

export const DEMO2_SEARCH_STEP_MS = Math.floor(
  DEMO2_SCANNING_HOLD_MS / DEMO2_SEARCH_RUN_STEPS.length,
)
