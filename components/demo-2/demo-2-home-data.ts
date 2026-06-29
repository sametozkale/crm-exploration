/** Figma nodes 48:53 & 77:12707 — home / typing states */

export const DEMO2_PROMPT_PLACEHOLDERS = [
  "Series A B2B SaaS in Europe, 50–200 employees, 3+ open sales roles",
  "AI startups in the Nordics founded after 2020 with Series B funding",
  "Fintech companies in the UK hiring senior engineers",
  "YC dev tools, 50–200 employees, recent launches",
  "Healthcare SaaS in the US that raised in the last 18 months",
  "DACH e-commerce brands on Shopify, growing headcount",
] as const

export const DEMO2_PROMPT_PLACEHOLDER = DEMO2_PROMPT_PLACEHOLDERS[0]

export const DEMO2_RESULTS_PROMPT = "Top AI companies in Nordics"

export const DEMO2_MORE_SUGGESTIONS = [
  { label: "Unicorn Companies", emoji: "🦄" },
  { label: "Series A Startups", emoji: "🌱" },
  { label: "PE-Backed Companies", emoji: "💼" },
  { label: "Recently Funded", emoji: "💰" },
] as const

/** Figma node 80:1270 — Filter dropdown categories */
export const DEMO2_FILTER_OPTIONS = [
  { label: "Company", icon: "homeFilterCompany", flip: true },
  { label: "Similarity", icon: "homeFilterSimilarity", flip: true },
  { label: "Industry", icon: "homeFilterIndustry", flip: true },
  { label: "Funding", icon: "homeFilterFunding" },
  { label: "Tech", icon: "homeFilterTech" },
  { label: "Job signal", icon: "homeFilterJobSignal" },
  { label: "Contacts", icon: "homeFilterContacts" },
] as const

/** Figma node 95:27051 — "+ N new" badge hover menu */
export const DEMO2_NEW_COUNT_ACTIONS = [
  { label: "Add to list", icon: "homeNewBadgeAddList" },
  { label: "Add to sequence", icon: "homeNewBadgeAddSequence" },
  { label: "Quick preview", icon: "homeNewBadgeQuickPreview" },
] as const

/** Figma 104:15010 — saved search row context menu */
export const DEMO2_SAVED_SEARCH_CONTEXT_ACTIONS = [
  { id: "clone", label: "Clone search", icon: "homeSavedSearchClone" },
  { id: "remove", label: "Remove search", icon: "homeSavedSearchRemove" },
] as const

export const DEMO2_SUGGESTION_CHIPS = [
  {
    id: "yc",
    label: "YC companies",
    iconUrl: "/demo-2/home/yc-chip.jpg",
  },
  {
    id: "saas",
    label: "SaaS companies",
    emoji: "🚀",
  },
  {
    id: "fintech",
    label: "Fintech companies",
    emoji: "🏛️",
  },
  {
    id: "more",
    label: "+4",
    muted: true,
  },
] as const

export type Demo2SavedSearch = {
  id: string
  title: string
  results: number
  newCount?: number
  filterCount?: number
  timeAgo: string
}

export const DEMO2_SAVED_SEARCHES: Demo2SavedSearch[] = [
  {
    id: "fintech-uk",
    title: "Fintech companies in UK",
    results: 32,
    newCount: 8,
    filterCount: 3,
    timeAgo: "2h ago",
  },
  {
    id: "untitled",
    title: "Untitled search",
    results: 56,
    newCount: 5,
    timeAgo: "2h ago",
  },
  {
    id: "yc",
    title: "YC companies",
    results: 89,
    newCount: 12,
    filterCount: 3,
    timeAgo: "2h ago",
  },
]
