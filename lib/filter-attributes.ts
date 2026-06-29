import {
  COMPANIES,
  INVESTOR_POOL,
  TECH_POOL,
  icpFitLabel,
  type IcpFit,
} from "@/lib/data"

export type FilterOperator =
  | "$eq"
  | "$in"
  | "$not_empty"
  | "$contains"
  | "$starts_with"
  | "$ends_with"
  | "$lt"
  | "$lte"
  | "$gt"
  | "$gte"

export type AttributeValueKind =
  | "select"
  | "multi_select"
  | "number"
  | "text"
  | "boolean"
  | "company"

export type AttributeSection =
  | "Firmographics"
  | "Industry"
  | "Funding"
  | "Technologies"
  | "Job posts"
  | "Similarity"
  | "CRM"
  | "General"

export type AttributeSlug =
  | "hq"
  | "industry"
  | "funding_round"
  | "investors"
  | "technologies"
  | "founded"
  | "employees"
  | "headcount_growth"
  | "linkedin_locations"
  | "job_posts"
  | "lookalike"
  | "in_crm"
  | "name"
  | "signals"
  | "icp_fit"

export type FilterValue = string | number | boolean | string[]

export type AttributeDef = {
  slug: AttributeSlug
  label: string
  section: AttributeSection
  valueKind: AttributeValueKind
  operators: FilterOperator[]
  options?: () => string[]
}

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  $eq: "is",
  $in: "is any of",
  $not_empty: "is not empty",
  $contains: "contains",
  $starts_with: "starts with",
  $ends_with: "ends with",
  $lt: "is less than",
  $lte: "is at most",
  $gt: "is greater than",
  $gte: "is at least",
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort()
}

export function getFilterAttributeOptions() {
  const hqCities = uniqueSorted(COMPANIES.map((c) => c.hq))
  const industries = uniqueSorted(COMPANIES.map((c) => c.industry))
  const fundingRounds = uniqueSorted(
    COMPANIES.map((c) => c.lastRound).filter((r) => r !== "Total raised"),
  )
  const signals = uniqueSorted(COMPANIES.flatMap((c) => c.signals))
  const icpFits: IcpFit[] = ["excellent", "good", "medium"]
  return {
    hqCities,
    industries,
    fundingRounds,
    investors: [...INVESTOR_POOL],
    technologies: [...TECH_POOL],
    signals,
    icpFits,
    companies: COMPANIES.map((c) => ({ id: c.id, name: c.name })),
  }
}

/** Filterable fields aligned with the results table columns. */
export const TABLE_FILTER_ATTRIBUTES: ReadonlyArray<{
  slug: AttributeSlug
  label: string
}> = [
  { slug: "name", label: "Company" },
  { slug: "industry", label: "Industry" },
  { slug: "hq", label: "HQ" },
  { slug: "employees", label: "Employees" },
  { slug: "funding_round", label: "Funding" },
  { slug: "technologies", label: "Technologies" },
  { slug: "founded", label: "Founded" },
  { slug: "in_crm", label: "CRM" },
  { slug: "job_posts", label: "Job signal" },
  { slug: "signals", label: "Signals" },
  { slug: "icp_fit", label: "ICP Fit" },
]

const TABLE_FILTER_SLUGS = new Set(
  TABLE_FILTER_ATTRIBUTES.map((field) => field.slug),
)

export function isTableFilterAttribute(slug: AttributeSlug): boolean {
  return TABLE_FILTER_SLUGS.has(slug)
}

export function getTableFilterLabel(slug: AttributeSlug): string {
  return (
    TABLE_FILTER_ATTRIBUTES.find((field) => field.slug === slug)?.label ??
    getAttributeDef(slug).label
  )
}

export const ATTRIBUTE_REGISTRY: AttributeDef[] = [
  {
    slug: "hq",
    label: "HQ location",
    section: "Firmographics",
    valueKind: "select",
    operators: ["$eq", "$in", "$contains"],
    options: () => getFilterAttributeOptions().hqCities,
  },
  {
    slug: "founded",
    label: "Founded year",
    section: "Firmographics",
    valueKind: "number",
    operators: ["$eq", "$gte", "$lte", "$gt", "$lt"],
  },
  {
    slug: "employees",
    label: "Headcount",
    section: "Firmographics",
    valueKind: "number",
    operators: ["$eq", "$gte", "$lte", "$gt", "$lt"],
  },
  {
    slug: "headcount_growth",
    label: "Headcount growth %",
    section: "Firmographics",
    valueKind: "number",
    operators: ["$eq", "$gte", "$lte", "$gt", "$lt"],
  },
  {
    slug: "linkedin_locations",
    label: "LinkedIn locations",
    section: "Firmographics",
    valueKind: "number",
    operators: ["$eq", "$gte", "$lte", "$gt", "$lt"],
  },
  {
    slug: "industry",
    label: "Industry",
    section: "Industry",
    valueKind: "select",
    operators: ["$eq", "$in"],
    options: () => getFilterAttributeOptions().industries,
  },
  {
    slug: "funding_round",
    label: "Funding round",
    section: "Funding",
    valueKind: "select",
    operators: ["$eq", "$in"],
    options: () => getFilterAttributeOptions().fundingRounds,
  },
  {
    slug: "investors",
    label: "Investor",
    section: "Funding",
    valueKind: "multi_select",
    operators: ["$contains", "$in"],
    options: () => getFilterAttributeOptions().investors,
  },
  {
    slug: "technologies",
    label: "Technology",
    section: "Technologies",
    valueKind: "multi_select",
    operators: ["$contains", "$in"],
    options: () => getFilterAttributeOptions().technologies,
  },
  {
    slug: "job_posts",
    label: "Job posts",
    section: "Job posts",
    valueKind: "text",
    operators: ["$contains", "$eq", "$starts_with", "$ends_with"],
  },
  {
    slug: "lookalike",
    label: "Lookalike of",
    section: "Similarity",
    valueKind: "company",
    operators: ["$eq"],
    options: () =>
      getFilterAttributeOptions().companies.map((c) => c.id),
  },
  {
    slug: "in_crm",
    label: "In CRM",
    section: "CRM",
    valueKind: "boolean",
    operators: ["$eq"],
  },
  {
    slug: "name",
    label: "Company name",
    section: "General",
    valueKind: "text",
    operators: ["$contains", "$eq", "$starts_with", "$ends_with"],
  },
  {
    slug: "signals",
    label: "Signals",
    section: "General",
    valueKind: "multi_select",
    operators: ["$contains", "$in", "$eq"],
    options: () => getFilterAttributeOptions().signals,
  },
  {
    slug: "icp_fit",
    label: "ICP Fit",
    section: "General",
    valueKind: "select",
    operators: ["$eq", "$in"],
    options: () => getFilterAttributeOptions().icpFits,
  },
]

export function getAttributeDef(slug: AttributeSlug): AttributeDef {
  const def = ATTRIBUTE_REGISTRY.find((a) => a.slug === slug)
  if (!def) throw new Error(`Unknown attribute: ${slug}`)
  return def
}

export function getOperatorsForAttribute(slug: AttributeSlug): FilterOperator[] {
  return getAttributeDef(slug).operators
}

export function defaultOperatorForAttribute(
  slug: AttributeSlug,
): FilterOperator {
  return getOperatorsForAttribute(slug)[0]
}

export function defaultValueForAttribute(
  slug: AttributeSlug,
  operator: FilterOperator,
): FilterValue | undefined {
  const def = getAttributeDef(slug)
  if (operator === "$not_empty") return undefined
  switch (def.valueKind) {
    case "boolean":
      return true
    case "number":
      return 0
    case "multi_select":
      return []
    case "select":
      if (slug === "icp_fit") return "excellent"
      return def.options?.()[0] ?? ""
    case "company":
      return getFilterAttributeOptions().companies[0]?.id ?? ""
    case "text":
      return ""
    default:
      return ""
  }
}

export function operatorNeedsValue(operator: FilterOperator): boolean {
  return operator !== "$not_empty"
}

export function getAttributesBySection(): Record<
  AttributeSection,
  AttributeDef[]
> {
  const out = {} as Record<AttributeSection, AttributeDef[]>
  for (const attr of ATTRIBUTE_REGISTRY) {
    if (!out[attr.section]) out[attr.section] = []
    out[attr.section].push(attr)
  }
  return out
}

export function formatAttributeValue(
  slug: AttributeSlug,
  value: FilterValue | undefined,
): string {
  if (value === undefined) return ""
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) {
    return value.join(", ")
  }
  if (slug === "lookalike") {
    const name = getFilterAttributeOptions().companies.find(
      (c) => c.id === value,
    )?.name
    return name ?? String(value)
  }
  if (slug === "icp_fit" && typeof value === "string") {
    return icpFitLabel(value as IcpFit)
  }
  return String(value)
}
