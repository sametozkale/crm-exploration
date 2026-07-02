/** Company drawer profiles — Figma 147:16705 (demo; tab panels reuse Anthropic placeholders). */

const DRAWER = "/demo-2/company-drawer"

export type CompanyDrawerTab =
  | "Overview"
  | "People"
  | "Activity"
  | "Financials"
  | "Signals"

const DRAWER_TABS = [
  "Overview",
  "People",
  "Activity",
  "Financials",
  "Signals",
] as const satisfies readonly CompanyDrawerTab[]

const SHARED_DRAWER_ICONS = {
  location: `${DRAWER}/icon-location.svg`,
  globe: `${DRAWER}/icon-globe.svg`,
  add: `${DRAWER}/icon-add.svg`,
  growth: `${DRAWER}/stat-growth.svg`,
  mapDot: `${DRAWER}/map-dot.svg`,
  close: `${DRAWER}/icon-close.svg`,
} as const

const SHARED_SOCIAL = [
  { src: `${DRAWER}/social-linkedin.svg`, variant: "framed" as const, label: "LinkedIn" },
  { src: `${DRAWER}/social-crunchbase-inner.svg`, variant: "boxed" as const, label: "Crunchbase" },
  { src: `${DRAWER}/social-x.svg`, variant: "framed" as const, label: "X" },
  { src: `${DRAWER}/social-github.svg`, variant: "framed" as const, label: "GitHub" },
] as const

export type CompanyDrawerProfile = {
  companyId: string
  name: string
  logo: string
  location: string
  website: string
  websiteUrl: string
  tags: readonly string[]
  social: typeof SHARED_SOCIAL
  stats: readonly {
    label: string
    value: string
    growth?: string
    icon: string
    align: "start" | "end"
    valueIndent: boolean
  }[]
  tabs: typeof DRAWER_TABS
  about: string
  techStack: readonly string[]
  locations: readonly { city: string; hq?: boolean }[]
  mapImage: string
  mapDots: readonly { left: number; top: number }[]
  similarCompanies: readonly {
    name: string
    logo: string
    meta: string
  }[]
  icons: typeof SHARED_DRAWER_ICONS
}

/** Table company ids that have a drawer profile (footer arrows cycle this set in table order). */
export const DEMO2_DRAWER_NAVIGABLE_COMPANY_IDS = ["c02", "c04"] as const

const ANTHROPIC_DRAWER: CompanyDrawerProfile = {
  companyId: "c02",
  name: "Anthropic",
  logo: `${DRAWER}/anthropic-logo.png`,
  location: "San Francisco, CA",
  website: "anthropic.com",
  websiteUrl: "https://www.anthropic.com/",
  tags: ["AI", "AI Safety", "Research", "LLMs", "Enterprise AI"],
  social: SHARED_SOCIAL,
  stats: [
    {
      label: "Employees",
      value: "1,050",
      growth: "142%",
      icon: `${DRAWER}/stat-employees.svg`,
      align: "end",
      valueIndent: false,
    },
    {
      label: "Founded",
      value: "2021",
      icon: `${DRAWER}/stat-founded.svg`,
      align: "start",
      valueIndent: true,
    },
    {
      label: "Est. Revenue",
      value: "$1B+",
      icon: `${DRAWER}/stat-revenue.svg`,
      align: "start",
      valueIndent: true,
    },
    {
      label: "Followers",
      value: "820K",
      growth: "29%",
      icon: `${DRAWER}/stat-followers.svg`,
      align: "end",
      valueIndent: false,
    },
  ],
  tabs: DRAWER_TABS,
  about:
    "Anthropic is an AI safety company that builds reliable, interpretable, and steerable AI systems. Founded by former OpenAI researchers, Anthropic is best known for Claude, a family of large language models designed to be helpful, harmless, and honest. The company focuses on AI alignment research and developing safety techniques for frontier AI models.",
  techStack: [
    "Python",
    "Rust",
    "TypeScript",
    "PyTorch",
    "JAX",
    "React",
    "Next.js",
    "Triton",
    "Kubernetes",
  ],
  locations: [
    { city: "San Francisco, USA", hq: true },
    { city: "London, UK" },
    { city: "Washington DC, USA" },
    { city: "Dublin, Ireland" },
    { city: "Seattle, USA" },
  ],
  mapImage: `${DRAWER}/world-map.png`,
  mapDots: [
    { left: 205, top: 35 },
    { left: 218, top: 42 },
    { left: 67, top: 80 },
  ],
  similarCompanies: [
    {
      name: "Bridgera LLC",
      logo: `${DRAWER}/similar-bridgera.png`,
      meta: "Software Development · 70 people · Raleigh, North Carolina",
    },
    {
      name: "LineWise YC'25",
      logo: `${DRAWER}/similar-linewise.png`,
      meta: "Artificial Intelligence · 70 people · Raleigh, North Carolina",
    },
    {
      name: "Worklytics",
      logo: `${DRAWER}/similar-worklytics.png`,
      meta: "Software Development · 70 people · Raleigh, North Carolina",
    },
  ],
  icons: SHARED_DRAWER_ICONS,
}

const COHERE_DRAWER: CompanyDrawerProfile = {
  companyId: "c04",
  name: "Cohere",
  logo: `${DRAWER}/cohere-logo.svg`,
  location: "Toronto, ON",
  website: "cohere.com",
  websiteUrl: "https://cohere.com/",
  tags: ["Enterprise AI", "NLP", "LLMs", "API", "RAG"],
  social: SHARED_SOCIAL,
  stats: [
    {
      label: "Employees",
      value: "400",
      growth: "68%",
      icon: `${DRAWER}/stat-employees.svg`,
      align: "end",
      valueIndent: false,
    },
    {
      label: "Founded",
      value: "2019",
      icon: `${DRAWER}/stat-founded.svg`,
      align: "start",
      valueIndent: true,
    },
    {
      label: "Est. Revenue",
      value: "$100M+",
      icon: `${DRAWER}/stat-revenue.svg`,
      align: "start",
      valueIndent: true,
    },
    {
      label: "Followers",
      value: "124K",
      growth: "18%",
      icon: `${DRAWER}/stat-followers.svg`,
      align: "end",
      valueIndent: false,
    },
  ],
  tabs: DRAWER_TABS,
  about:
    "Cohere builds large language models for enterprise. Founded by Aidan Gomez and a team of researchers including co-authors of the Transformer paper, Cohere focuses on secure, customizable NLP for developers and businesses. Its Command and Embed models power retrieval, generation, and classification workflows across cloud and on-prem deployments.",
  techStack: [
    "Python",
    "PyTorch",
    "CUDA",
    "Kubernetes",
    "Rust",
    "TypeScript",
    "gRPC",
    "Terraform",
  ],
  locations: [
    { city: "Toronto, Canada", hq: true },
    { city: "San Francisco, USA" },
    { city: "London, UK" },
    { city: "New York, USA" },
  ],
  mapImage: `${DRAWER}/world-map.png`,
  mapDots: [
    { left: 198, top: 38 },
    { left: 72, top: 72 },
    { left: 214, top: 40 },
  ],
  similarCompanies: [
    {
      name: "Mistral AI",
      logo: `${DRAWER}/similar-bridgera.png`,
      meta: "Artificial Intelligence · 60 people · Paris, France",
    },
    {
      name: "Inflection AI",
      logo: `${DRAWER}/similar-linewise.png`,
      meta: "Artificial Intelligence · 70 people · Palo Alto, California",
    },
    {
      name: "AI21 Labs",
      logo: `${DRAWER}/similar-worklytics.png`,
      meta: "Artificial Intelligence · 200 people · Tel Aviv, Israel",
    },
  ],
  icons: SHARED_DRAWER_ICONS,
}

export const DEMO2_COMPANY_DRAWER_PROFILES: Record<
  (typeof DEMO2_DRAWER_NAVIGABLE_COMPANY_IDS)[number],
  CompanyDrawerProfile
> = {
  c02: ANTHROPIC_DRAWER,
  c04: COHERE_DRAWER,
}

/** @deprecated Use getCompanyDrawerProfile — kept for static tab data imports. */
export const DEMO2_COMPANY_DRAWER = ANTHROPIC_DRAWER

export function hasCompanyDrawerProfile(
  companyId: string,
): companyId is (typeof DEMO2_DRAWER_NAVIGABLE_COMPANY_IDS)[number] {
  return companyId in DEMO2_COMPANY_DRAWER_PROFILES
}

export function getCompanyDrawerProfile(companyId: string): CompanyDrawerProfile {
  if (hasCompanyDrawerProfile(companyId)) {
    return DEMO2_COMPANY_DRAWER_PROFILES[companyId]
  }
  return ANTHROPIC_DRAWER
}

export function getDrawerNavigableCompanyIdsInTableOrder(tableCompanyIds: readonly string[]) {
  const navigable = new Set<string>(DEMO2_DRAWER_NAVIGABLE_COMPANY_IDS)
  return tableCompanyIds.filter((id) => navigable.has(id))
}
