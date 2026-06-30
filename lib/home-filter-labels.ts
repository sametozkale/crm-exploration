import { getAttributeDef, type AttributeSlug } from "@/lib/filter-attributes"
import type { FilterValue } from "@/lib/filter-attributes"

const HOME_FILTER_CATEGORY: Partial<Record<AttributeSlug, string>> = {
  funding_round: "Company",
  employees: "Company",
  industry: "Company",
  hq: "Company",
  founded: "Company",
  name: "Company",
  headcount_growth: "Company",
  linkedin_locations: "Company",
  icp_fit: "Company",
  investors: "Funding",
  technologies: "Tech",
  job_posts: "Jobs",
  signals: "Job signal",
  lookalike: "Similarity",
  in_crm: "Contacts",
}

const HOME_FILTER_FIELD: Partial<Record<AttributeSlug, string>> = {
  funding_round: "Last funding round",
  employees: "Employees",
  industry: "Categories",
  hq: "HQ",
  founded: "Founded",
  name: "Company",
  headcount_growth: "Headcount growth",
  linkedin_locations: "LinkedIn locations",
  icp_fit: "ICP fit",
  investors: "Investors",
  technologies: "Technologies",
  job_posts: "Title",
  signals: "Signals",
  lookalike: "Similarity",
  in_crm: "In CRM",
}

function categoryForAttribute(slug: AttributeSlug): string {
  if (HOME_FILTER_CATEGORY[slug]) return HOME_FILTER_CATEGORY[slug]!
  const section = getAttributeDef(slug).section
  if (section === "Funding") return "Funding"
  if (section === "Technologies") return "Tech"
  if (section === "Job posts") return "Job signal"
  if (section === "Similarity") return "Similarity"
  if (section === "CRM") return "Contacts"
  return "Company"
}

function fieldForAttribute(slug: AttributeSlug): string {
  return HOME_FILTER_FIELD[slug] ?? getAttributeDef(slug).label
}

export function getHomeFilterChipParts(
  attribute: AttributeSlug,
  _value?: FilterValue,
): { category: string; field: string } {
  return {
    category: categoryForAttribute(attribute),
    field: fieldForAttribute(attribute),
  }
}
