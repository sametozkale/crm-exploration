import type { SearchFilters } from "@/lib/search-filters"

export type SavedSearch = {
  id: string
  name: string
  prompt?: string
  filters: Partial<SearchFilters>
  /** Total matches when the search was last run. */
  resultCount: number
  /** New matches since last run — omitted when none. */
  newSinceLastRun?: number
  lastRunLabel: string
}

export const SAVED_SEARCHES: SavedSearch[] = [
  {
    id: "sf-series-b",
    name: "AI labs in SF, Series B, not in CRM",
    filters: {
      hqCities: ["San Francisco, CA"],
      fundingRounds: ["Series B"],
      industries: ["AI Research"],
      crmMode: "not_in_crm",
    },
    resultCount: 142,
    newSinceLastRun: 5,
    lastRunLabel: "2d ago",
  },
  {
    id: "attio-hiring",
    name: "Companies hiring for Attio",
    filters: { jobPostKeyword: "attio" },
    resultCount: 18,
    newSinceLastRun: 2,
    lastRunLabel: "1w ago",
  },
  {
    id: "anthropic-lookalikes",
    name: "Lookalikes of Anthropic",
    filters: { lookalikeOfId: "c02" },
    resultCount: 56,
    lastRunLabel: "3d ago",
  },
  {
    id: "openai-alumni",
    name: "AI labs founded by OpenAI alumni",
    prompt:
      "AI labs founded by alumni of OpenAI, Anthropic, or DeepMind",
    filters: {},
    resultCount: 89,
    lastRunLabel: "Yesterday",
  },
  {
    id: "nyc-ai-software",
    name: "AI software in NYC, not in CRM",
    filters: {
      hqCities: ["New York, NY"],
      industries: ["AI Software"],
      crmMode: "not_in_crm",
    },
    resultCount: 34,
    newSinceLastRun: 3,
    lastRunLabel: "5d ago",
  },
  {
    id: "series-a-aws",
    name: "Series A AI infra on AWS",
    filters: {
      fundingRounds: ["Series A"],
      industries: ["AI Infrastructure"],
      technologies: ["AWS"],
    },
    resultCount: 12,
    newSinceLastRun: 1,
    lastRunLabel: "2w ago",
  },
]
