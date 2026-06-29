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
  {
    label: "Unicorn Companies",
    emoji: "🦄",
    prompt: "Unicorn startups valued at $1B+, US or Europe, 500+ employees",
  },
  {
    label: "Series A Startups",
    emoji: "🌱",
    prompt: "Series A startups founded after 2020, B2B software, 30–120 employees",
  },
  {
    label: "PE-Backed Companies",
    emoji: "💼",
    prompt: "PE-backed software companies in the US, $50M+ revenue, growing headcount",
  },
  {
    label: "Recently Funded",
    emoji: "💰",
    prompt: "Startups that raised funding in the last 6 months, AI or fintech, US-based",
  },
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

/** Figma 82:13660 — funding type pills (absolute positions in 558×93 area) */
export const DEMO2_FUNDING_TYPE_PILLS = [
  { label: "Angel", left: -0.23, top: 0.3 },
  { label: "Convertible", left: 56.46, top: 0.3 },
  { label: "Pre seed", left: 148.29, top: 0.3 },
  { label: "Seed", left: 222.38, top: 0.3 },
  { label: "Series A", left: 274.61, top: 0.3 },
  { label: "Series B", left: 345.8, top: 0.3 },
  { label: "Series C", left: 416.06, top: 0.3 },
  { label: "Series D", left: 487.95, top: 0.3 },
  { label: "Series E+", left: 0.1, top: 32.5 },
  { label: "Private equity", left: 77.16, top: 32.5 },
  { label: "Crowdfunding", left: 180.93, top: 32.5 },
  { label: "Secondary", left: 289.93, top: 32.5 },
  { label: "Debt financing", left: 376.2, top: 32.5 },
  { label: "Post IPO round", left: -0.23, top: 64.7 },
  { label: "Other", left: 110.56, top: 64.7 },
] as const

export const DEMO2_FILTER_MENU_WIDTH = 140

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
    prompt: "YC-backed dev tools, 50–200 employees, recent product launches",
    iconUrl: "/demo-2/home/yc-chip.jpg",
  },
  {
    id: "saas",
    label: "SaaS companies",
    prompt: "B2B SaaS companies in Europe, 50–200 employees, actively hiring sales reps",
    emoji: "🚀",
  },
  {
    id: "fintech",
    label: "Fintech companies",
    prompt: "Fintech companies in the UK, Series B+, hiring senior engineers",
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
