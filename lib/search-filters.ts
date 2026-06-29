import {
  COMPANIES,
  INVESTOR_POOL,
  TECH_POOL,
  type Company,
} from "@/lib/data"
import type { FilterNode, FilterQuery } from "@/lib/filter-query"
import {
  collectConditions,
  createEmptyQuery,
  createNot,
  newFilterId,
  type FilterCondition,
} from "@/lib/filter-query"

export type CrmMode = "any" | "in_crm" | "not_in_crm"

export type SearchFilters = {
  hqCities: string[]
  foundedMin?: number
  foundedMax?: number
  employeesMin?: number
  employeesMax?: number
  growthMin?: number
  linkedinLocationsMin?: number
  industries: string[]
  fundingRounds: string[]
  investors: string[]
  technologies: string[]
  jobPostKeyword?: string
  lookalikeOfId?: string
  crmMode: CrmMode
}

export type FilterCategoryId =
  | "firmographics"
  | "similarity"
  | "industry"
  | "funding"
  | "technologies"
  | "job_posts"
  | "crm"

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  hqCities: [],
  industries: [],
  fundingRounds: [],
  investors: [],
  technologies: [],
  crmMode: "any",
}

export type FilterPill = {
  id: string
  label: string
}

export type SearchTemplate = {
  id: string
  label: string
  prompt?: string
  filters: Partial<SearchFilters>
}

export const SEARCH_TEMPLATES: SearchTemplate[] = [
  {
    id: "sf-series-b",
    label: "AI labs in SF, Series B, not in CRM",
    filters: {
      hqCities: ["San Francisco, CA"],
      fundingRounds: ["Series B"],
      industries: ["AI Research"],
      crmMode: "not_in_crm",
    },
  },
  {
    id: "attio-hiring",
    label: "Companies hiring for Attio",
    filters: { jobPostKeyword: "attio" },
  },
  {
    id: "anthropic-lookalikes",
    label: "Lookalikes of Anthropic",
    filters: { lookalikeOfId: "c02" },
  },
]

export function getFilterOptions() {
  const hqCities = [...new Set(COMPANIES.map((c) => c.hq))].sort()
  const industries = [...new Set(COMPANIES.map((c) => c.industry))].sort()
  const fundingRounds = [
    ...new Set(COMPANIES.map((c) => c.lastRound).filter((r) => r !== "Total raised")),
  ].sort()
  return {
    hqCities,
    industries,
    fundingRounds,
    investors: [...INVESTOR_POOL],
    technologies: [...TECH_POOL],
    companies: COMPANIES.map((c) => ({ id: c.id, name: c.name })),
  }
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.hqCities.length > 0 ||
    filters.industries.length > 0 ||
    filters.fundingRounds.length > 0 ||
    filters.investors.length > 0 ||
    filters.technologies.length > 0 ||
    filters.foundedMin != null ||
    filters.foundedMax != null ||
    filters.employeesMin != null ||
    filters.employeesMax != null ||
    filters.growthMin != null ||
    filters.linkedinLocationsMin != null ||
    !!filters.jobPostKeyword?.trim() ||
    !!filters.lookalikeOfId ||
    filters.crmMode !== "any"
  )
}

export function isCategoryActive(
  filters: SearchFilters,
  category: FilterCategoryId,
): boolean {
  switch (category) {
    case "firmographics":
      return (
        filters.hqCities.length > 0 ||
        filters.foundedMin != null ||
        filters.foundedMax != null ||
        filters.employeesMin != null ||
        filters.employeesMax != null ||
        filters.growthMin != null ||
        filters.linkedinLocationsMin != null
      )
    case "similarity":
      return !!filters.lookalikeOfId
    case "industry":
      return filters.industries.length > 0
    case "funding":
      return filters.fundingRounds.length > 0 || filters.investors.length > 0
    case "technologies":
      return filters.technologies.length > 0
    case "job_posts":
      return !!filters.jobPostKeyword?.trim()
    case "crm":
      return filters.crmMode !== "any"
    default:
      return false
  }
}

export function getActiveFilterPills(filters: SearchFilters): FilterPill[] {
  const pills: FilterPill[] = []
  const opts = getFilterOptions()

  for (const city of filters.hqCities) {
    pills.push({ id: `hq:${city}`, label: city })
  }
  if (filters.foundedMin != null || filters.foundedMax != null) {
    const min = filters.foundedMin ?? "…"
    const max = filters.foundedMax ?? "…"
    pills.push({ id: "founded", label: `Founded ${min}–${max}` })
  }
  if (filters.employeesMin != null || filters.employeesMax != null) {
    const min = filters.employeesMin ?? "…"
    const max = filters.employeesMax ?? "…"
    pills.push({ id: "employees", label: `${min}–${max} employees` })
  }
  if (filters.growthMin != null) {
    pills.push({ id: "growth", label: `Growth ≥ ${filters.growthMin}%` })
  }
  if (filters.linkedinLocationsMin != null) {
    pills.push({
      id: "linkedin",
      label: `≥ ${filters.linkedinLocationsMin} LinkedIn locations`,
    })
  }
  if (filters.lookalikeOfId) {
    const name =
      opts.companies.find((c) => c.id === filters.lookalikeOfId)?.name ??
      "company"
    pills.push({ id: "lookalike", label: `Lookalike: ${name}` })
  }
  for (const ind of filters.industries) {
    pills.push({ id: `industry:${ind}`, label: ind })
  }
  for (const round of filters.fundingRounds) {
    pills.push({ id: `round:${round}`, label: round })
  }
  for (const inv of filters.investors) {
    pills.push({ id: `investor:${inv}`, label: inv })
  }
  for (const tech of filters.technologies) {
    pills.push({ id: `tech:${tech}`, label: tech })
  }
  if (filters.jobPostKeyword?.trim()) {
    pills.push({
      id: "job",
      label: `Job posts: "${filters.jobPostKeyword.trim()}"`,
    })
  }
  if (filters.crmMode === "in_crm") {
    pills.push({ id: "crm", label: "In CRM" })
  }
  if (filters.crmMode === "not_in_crm") {
    pills.push({ id: "crm", label: "Not in CRM" })
  }

  return pills
}

export function removeFilterPill(
  filters: SearchFilters,
  pillId: string,
): SearchFilters {
  if (pillId === "founded") {
    return { ...filters, foundedMin: undefined, foundedMax: undefined }
  }
  if (pillId === "employees") {
    return { ...filters, employeesMin: undefined, employeesMax: undefined }
  }
  if (pillId === "growth") {
    return { ...filters, growthMin: undefined }
  }
  if (pillId === "linkedin") {
    return { ...filters, linkedinLocationsMin: undefined }
  }
  if (pillId === "lookalike") {
    return { ...filters, lookalikeOfId: undefined }
  }
  if (pillId === "job") {
    return { ...filters, jobPostKeyword: undefined }
  }
  if (pillId === "crm") {
    return { ...filters, crmMode: "any" }
  }
  if (pillId.startsWith("hq:")) {
    const city = pillId.slice(3)
    return {
      ...filters,
      hqCities: filters.hqCities.filter((c) => c !== city),
    }
  }
  if (pillId.startsWith("industry:")) {
    const ind = pillId.slice(9)
    return {
      ...filters,
      industries: filters.industries.filter((i) => i !== ind),
    }
  }
  if (pillId.startsWith("round:")) {
    const round = pillId.slice(6)
    return {
      ...filters,
      fundingRounds: filters.fundingRounds.filter((r) => r !== round),
    }
  }
  if (pillId.startsWith("investor:")) {
    const inv = pillId.slice(9)
    return {
      ...filters,
      investors: filters.investors.filter((i) => i !== inv),
    }
  }
  if (pillId.startsWith("tech:")) {
    const tech = pillId.slice(5)
    return {
      ...filters,
      technologies: filters.technologies.filter((t) => t !== tech),
    }
  }
  return filters
}

export function applyCompanyFilters(
  companies: Company[],
  filters: SearchFilters,
): Company[] {
  let out = companies

  if (filters.hqCities.length > 0) {
    out = out.filter((c) => filters.hqCities.includes(c.hq))
  }
  if (filters.foundedMin != null) {
    out = out.filter((c) => c.founded >= filters.foundedMin!)
  }
  if (filters.foundedMax != null) {
    out = out.filter((c) => c.founded <= filters.foundedMax!)
  }
  if (filters.employeesMin != null) {
    out = out.filter((c) => c.employees >= filters.employeesMin!)
  }
  if (filters.employeesMax != null) {
    out = out.filter((c) => c.employees <= filters.employeesMax!)
  }
  if (filters.growthMin != null) {
    out = out.filter((c) => c.headcountGrowth >= filters.growthMin!)
  }
  if (filters.linkedinLocationsMin != null) {
    out = out.filter(
      (c) => c.linkedinLocations >= filters.linkedinLocationsMin!,
    )
  }
  if (filters.industries.length > 0) {
    out = out.filter((c) => filters.industries.includes(c.industry))
  }
  if (filters.fundingRounds.length > 0) {
    out = out.filter((c) => filters.fundingRounds.includes(c.lastRound))
  }
  if (filters.investors.length > 0) {
    out = out.filter((c) =>
      filters.investors.some((inv) => c.investors.includes(inv)),
    )
  }
  if (filters.technologies.length > 0) {
    out = out.filter((c) =>
      filters.technologies.some((t) => c.technologies.includes(t)),
    )
  }
  if (filters.jobPostKeyword?.trim()) {
    const kw = filters.jobPostKeyword.trim().toLowerCase()
    out = out.filter((c) =>
      c.jobPostSnippets.some((s) => s.toLowerCase().includes(kw)),
    )
  }
  if (filters.lookalikeOfId) {
    const source = companies.find((c) => c.id === filters.lookalikeOfId)
    if (source) {
      out = out.filter(
        (c) =>
          c.id !== source.id &&
          (c.industry === source.industry ||
            c.technologies.some((t) => source.technologies.includes(t)) ||
            !!c.lookalikeLabel),
      )
    }
  }
  if (filters.crmMode === "in_crm") {
    out = out.filter((c) => c.inCrm)
  }
  if (filters.crmMode === "not_in_crm") {
    out = out.filter((c) => !c.inCrm)
  }

  return out
}

export function mergeFilters(
  base: SearchFilters,
  patch: Partial<SearchFilters>,
): SearchFilters {
  return { ...base, ...patch }
}

function legacyCondition(
  attribute: FilterCondition["attribute"],
  operator: FilterCondition["operator"],
  value?: FilterCondition["value"],
): FilterCondition {
  return {
    kind: "condition",
    id: newFilterId("legacy"),
    attribute,
    operator,
    value,
  }
}

/** Expand flat SearchFilters into an Attio-style nested query (root AND). */
export function fromLegacyFilters(
  partial: Partial<SearchFilters>,
): FilterQuery {
  const filters = mergeFilters(DEFAULT_SEARCH_FILTERS, partial)
  const children: FilterNode[] = []

  if (filters.hqCities.length === 1) {
    children.push(legacyCondition("hq", "$eq", filters.hqCities[0]))
  } else if (filters.hqCities.length > 1) {
    children.push(legacyCondition("hq", "$in", filters.hqCities))
  }

  if (filters.foundedMin != null) {
    children.push(legacyCondition("founded", "$gte", filters.foundedMin))
  }
  if (filters.foundedMax != null) {
    children.push(legacyCondition("founded", "$lte", filters.foundedMax))
  }
  if (filters.employeesMin != null) {
    children.push(legacyCondition("employees", "$gte", filters.employeesMin))
  }
  if (filters.employeesMax != null) {
    children.push(legacyCondition("employees", "$lte", filters.employeesMax))
  }
  if (filters.growthMin != null) {
    children.push(
      legacyCondition("headcount_growth", "$gte", filters.growthMin),
    )
  }
  if (filters.linkedinLocationsMin != null) {
    children.push(
      legacyCondition("linkedin_locations", "$gte", filters.linkedinLocationsMin),
    )
  }

  if (filters.industries.length === 1) {
    children.push(legacyCondition("industry", "$eq", filters.industries[0]))
  } else if (filters.industries.length > 1) {
    children.push(legacyCondition("industry", "$in", filters.industries))
  }

  if (filters.fundingRounds.length === 1) {
    children.push(
      legacyCondition("funding_round", "$eq", filters.fundingRounds[0]),
    )
  } else if (filters.fundingRounds.length > 1) {
    children.push(
      legacyCondition("funding_round", "$in", filters.fundingRounds),
    )
  }

  if (filters.investors.length > 0) {
    children.push(legacyCondition("investors", "$in", filters.investors))
  }
  if (filters.technologies.length > 0) {
    children.push(legacyCondition("technologies", "$in", filters.technologies))
  }

  if (filters.jobPostKeyword?.trim()) {
    children.push(
      legacyCondition("job_posts", "$contains", filters.jobPostKeyword.trim()),
    )
  }

  if (filters.lookalikeOfId) {
    children.push(
      legacyCondition("lookalike", "$eq", filters.lookalikeOfId),
    )
  }

  if (filters.crmMode === "in_crm") {
    children.push(legacyCondition("in_crm", "$eq", true))
  }
  if (filters.crmMode === "not_in_crm") {
    children.push(
      createNot(legacyCondition("in_crm", "$eq", true)),
    )
  }

  return { ...createEmptyQuery(), children }
}

export type LegacyFilterHints = {
  jobPostKeyword?: string
  lookalikeOfId?: string
}

/** Read common table-display hints from a filter query tree. */
export function toLegacyHints(query: FilterQuery): LegacyFilterHints {
  const job = collectConditions(query, "job_posts")[0]
  const lookalike = collectConditions(query, "lookalike")[0]
  return {
    jobPostKeyword:
      typeof job?.value === "string" ? job.value : undefined,
    lookalikeOfId:
      typeof lookalike?.value === "string" ? lookalike.value : undefined,
  }
}
