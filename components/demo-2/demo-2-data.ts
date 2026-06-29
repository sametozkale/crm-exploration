import { COMPANIES, type Company } from "@/lib/data"

export type Demo2Company = {
  id: string
  name: string
  industry: string
  foundedYear: number | null
  employees: number
  headcountGrowth: number
  location: string
  score: number
  website: string
  domain: string
  logoHue?: number
  logoUrl?: string
  description?: string
  lastFundingType?: string
}

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function mapCompanyToDemo2(company: Company): Demo2Company {
  const seed = hashString(company.id + company.domain)

  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    foundedYear: company.founded,
    employees: company.employees,
    headcountGrowth: company.headcountGrowth,
    location: company.hq,
    score: company.score,
    website: `https://${company.domain}`,
    domain: company.domain,
    logoHue: seed % 360,
    description: company.tagline,
    lastFundingType: company.lastRound,
  }
}

/** Demo-2 results index — same company database as demo-1 (`lib/data`). */
export const DEMO2_COMPANIES: Demo2Company[] = COMPANIES.map(mapCompanyToDemo2).sort(
  (a, b) => b.score - a.score,
)

export function scoreBarColors(score: number): string[] {
  const green = "#05d052"
  const yellow = "#fed047"
  const empty = "#eee"

  const filled =
    score >= 93 ? 5 : score >= 80 ? 4 : score >= 73 ? 3 : score >= 58 ? 2 : 1
  const active = score >= 80 ? green : yellow

  return Array.from({ length: 5 }, (_, i) => (i < filled ? active : empty))
}
