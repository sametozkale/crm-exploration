export type Tier = "high" | "medium" | "low"

export type IcpFit = "excellent" | "good" | "medium"

// Base shape authored by hand. Extra firmographic fields needed for the
// Zero CRM company-listing table are derived deterministically below.
export type BaseCompany = {
  id: string
  name: string
  domain: string
  tagline: string
  hq: string
  employees: number
  founded: number
  funding: string // e.g. "$120M Series B"
  category: string
  // pre-computed for the prompt the page demos
  score: number // 0..100
  tier: Tier
  reasoning: string
  signals: string[] // small chips: e.g. "ex-OpenAI founder", "Series B"
}

// Full company record as consumed by the UI — base fields plus the
// firmographics Zero CRM surfaces when listing a company.
export type Company = BaseCompany & {
  industry: string // user-friendly industry label (Zero's re-categorization)
  headcountGrowth: number // % headcount growth (12mo snapshot)
  lastRound: string // e.g. "Series B", "Seed"
  totalFunding: string // total raised, e.g. "$415M"
  investors: string[] // notable backers
  technologies: string[] // detected tech stack
  inCrm: boolean // already in your CRM (include/exclude lists)
  linkedinLocations: number // number of LinkedIn office locations
  jobPostSnippets: string[] // recent job post excerpts
  lookalikeLabel?: string // similarity explanation for lookalike search
}

// Pre-computed for the demo prompt:
// "AI labs founded by alumni of OpenAI, Anthropic, or DeepMind"
const BASE_COMPANIES: BaseCompany[] = [
  {
    id: "c01",
    name: "Adept",
    domain: "adept.ai",
    tagline: "General intelligence for knowledge workers",
    hq: "San Francisco, CA",
    employees: 70,
    founded: 2022,
    funding: "$415M Series B",
    category: "AI Lab",
    score: 96,
    tier: "high",
    reasoning: "Founded by ex-OpenAI/DeepMind authors of the Transformer paper. Pure AI lab.",
    signals: ["ex-OpenAI", "ex-DeepMind", "Foundation models", "Series B"],
  },
  {
    id: "c02",
    name: "Anthropic",
    domain: "anthropic.com",
    tagline: "AI safety and research",
    hq: "San Francisco, CA",
    employees: 800,
    founded: 2021,
    funding: "$7.3B",
    category: "AI Lab",
    score: 99,
    tier: "high",
    reasoning: "Founded by ex-OpenAI VP of Research Dario Amodei. Definitive match.",
    signals: ["ex-OpenAI", "Foundation models", "Frontier"],
  },
  {
    id: "c03",
    name: "Inflection AI",
    domain: "inflection.ai",
    tagline: "Personal AI for everyone",
    hq: "Palo Alto, CA",
    employees: 70,
    founded: 2022,
    funding: "$1.3B",
    category: "AI Lab",
    score: 94,
    tier: "high",
    reasoning: "Co-founded by Mustafa Suleyman (DeepMind co-founder) and Karén Simonyan (DeepMind).",
    signals: ["ex-DeepMind", "Foundation models", "Mega-round"],
  },
  {
    id: "c04",
    name: "Cohere",
    domain: "cohere.com",
    tagline: "Enterprise-grade LLMs",
    hq: "Toronto, ON",
    employees: 400,
    founded: 2019,
    funding: "$445M Series C",
    category: "AI Lab",
    score: 91,
    tier: "high",
    reasoning: "Founded by Aidan Gomez, co-author of Attention Is All You Need at Google Brain; team includes ex-DeepMind.",
    signals: ["ex-Google Brain", "ex-DeepMind", "Enterprise"],
  },
  {
    id: "c05",
    name: "Mistral AI",
    domain: "mistral.ai",
    tagline: "Open and portable AI models",
    hq: "Paris, FR",
    employees: 60,
    founded: 2023,
    funding: "€385M Series A",
    category: "AI Lab",
    score: 93,
    tier: "high",
    reasoning: "Founded by ex-DeepMind (Arthur Mensch) and ex-Meta researchers.",
    signals: ["ex-DeepMind", "Open weights", "Europe"],
  },
  {
    id: "c06",
    name: "Perplexity",
    domain: "perplexity.ai",
    tagline: "Answer engine",
    hq: "San Francisco, CA",
    employees: 60,
    founded: 2022,
    funding: "$165M",
    category: "AI Product",
    score: 72,
    tier: "medium",
    reasoning: "Founders include ex-OpenAI engineer Aravind Srinivas, but it's an applied product, not a lab.",
    signals: ["ex-OpenAI", "Search", "Consumer"],
  },
  {
    id: "c07",
    name: "Reka",
    domain: "reka.ai",
    tagline: "Multimodal frontier models",
    hq: "Singapore",
    employees: 30,
    founded: 2022,
    funding: "$58M Series A",
    category: "AI Lab",
    score: 89,
    tier: "high",
    reasoning: "Founded by ex-DeepMind and ex-Google Brain researchers.",
    signals: ["ex-DeepMind", "Multimodal"],
  },
  {
    id: "c08",
    name: "xAI",
    domain: "x.ai",
    tagline: "Understand the universe",
    hq: "San Francisco, CA",
    employees: 200,
    founded: 2023,
    funding: "$6B Series B",
    category: "AI Lab",
    score: 81,
    tier: "high",
    reasoning: "Team pulls from DeepMind and OpenAI; mission is research.",
    signals: ["ex-DeepMind", "ex-OpenAI", "Frontier"],
  },
  {
    id: "c09",
    name: "Magic",
    domain: "magic.dev",
    tagline: "AI software engineer",
    hq: "San Francisco, CA",
    employees: 30,
    founded: 2022,
    funding: "$465M",
    category: "AI Product",
    score: 64,
    tier: "medium",
    reasoning: "Codegen lab. Some ex-DeepMind on team. Lab-adjacent but product-focused.",
    signals: ["ex-DeepMind", "Codegen"],
  },
  {
    id: "c10",
    name: "Sakana AI",
    domain: "sakana.ai",
    tagline: "Nature-inspired AI",
    hq: "Tokyo, JP",
    employees: 20,
    founded: 2023,
    funding: "$30M Seed",
    category: "AI Lab",
    score: 86,
    tier: "high",
    reasoning: "Founded by ex-Google Brain (David Ha) and ex-DeepMind researchers.",
    signals: ["ex-Google Brain", "ex-DeepMind", "Research"],
  },
  {
    id: "c11",
    name: "Imbue",
    domain: "imbue.com",
    tagline: "Reasoning agents",
    hq: "San Francisco, CA",
    employees: 25,
    founded: 2021,
    funding: "$220M Series B",
    category: "AI Lab",
    score: 70,
    tier: "medium",
    reasoning: "Research lab focus. Limited direct alumni from the named labs.",
    signals: ["Research", "Agents"],
  },
  {
    id: "c12",
    name: "Character.AI",
    domain: "character.ai",
    tagline: "Personalized AI characters",
    hq: "Menlo Park, CA",
    employees: 50,
    founded: 2021,
    funding: "$150M Series A",
    category: "AI Product",
    score: 74,
    tier: "medium",
    reasoning: "Founded by Noam Shazeer (ex-Google Brain), team includes DeepMind alumni. Consumer product, not a lab.",
    signals: ["ex-Google Brain", "ex-DeepMind", "Consumer"],
  },
  {
    id: "c13",
    name: "Hippocratic AI",
    domain: "hippocraticai.com",
    tagline: "Safety-focused healthcare LLM",
    hq: "Palo Alto, CA",
    employees: 60,
    founded: 2023,
    funding: "$120M Series A",
    category: "Vertical AI",
    score: 28,
    tier: "low",
    reasoning: "Healthcare vertical, not a foundation lab. Few alumni from the named labs.",
    signals: ["Vertical", "Healthcare"],
  },
  {
    id: "c14",
    name: "Glean",
    domain: "glean.com",
    tagline: "Enterprise search",
    hq: "Palo Alto, CA",
    employees: 500,
    founded: 2019,
    funding: "$260M Series D",
    category: "AI Product",
    score: 14,
    tier: "low",
    reasoning: "Enterprise search SaaS, ex-Google search team. Not a lab and not from the named orgs.",
    signals: ["Enterprise", "Search"],
  },
  {
    id: "c15",
    name: "Runway",
    domain: "runwayml.com",
    tagline: "AI tools for video",
    hq: "New York, NY",
    employees: 100,
    founded: 2018,
    funding: "$237M Series C",
    category: "AI Product",
    score: 22,
    tier: "low",
    reasoning: "Creative AI product company, not a research lab from the named orgs.",
    signals: ["Creative", "Video"],
  },
  {
    id: "c16",
    name: "Stability AI",
    domain: "stability.ai",
    tagline: "Open generative models",
    hq: "London, UK",
    employees: 150,
    founded: 2020,
    funding: "$101M",
    category: "AI Lab",
    score: 48,
    tier: "medium",
    reasoning: "Open-source generative lab, but not founded by alumni of the named labs.",
    signals: ["Open weights", "Generative"],
  },
  {
    id: "c17",
    name: "Liquid AI",
    domain: "liquid.ai",
    tagline: "Liquid foundation models",
    hq: "Cambridge, MA",
    employees: 40,
    founded: 2023,
    funding: "$37M Seed",
    category: "AI Lab",
    score: 58,
    tier: "medium",
    reasoning: "MIT spinout. Novel architecture lab. Not directly OpenAI/Anthropic/DeepMind alumni.",
    signals: ["MIT", "Research"],
  },
  {
    id: "c18",
    name: "Poolside",
    domain: "poolside.ai",
    tagline: "Foundation models for software",
    hq: "Paris, FR",
    employees: 50,
    founded: 2023,
    funding: "$126M Series A",
    category: "AI Lab",
    score: 67,
    tier: "medium",
    reasoning: "Co-founder ex-GitHub (Copilot) — adjacent. Some DeepMind influence on the team.",
    signals: ["ex-GitHub", "Codegen"],
  },
  {
    id: "c19",
    name: "Suno",
    domain: "suno.ai",
    tagline: "AI music generation",
    hq: "Cambridge, MA",
    employees: 30,
    founded: 2023,
    funding: "$125M Series B",
    category: "AI Product",
    score: 9,
    tier: "low",
    reasoning: "Consumer music product. No relevant lab alumni signals.",
    signals: ["Consumer", "Music"],
  },
  {
    id: "c20",
    name: "Eleven Labs",
    domain: "elevenlabs.io",
    tagline: "Voice AI",
    hq: "London, UK",
    employees: 80,
    founded: 2022,
    funding: "$80M Series B",
    category: "AI Product",
    score: 12,
    tier: "low",
    reasoning: "Voice synthesis product. Founders ex-Google/Palantir, not the named labs.",
    signals: ["Voice", "Product"],
  },
  {
    id: "c21",
    name: "Cresta",
    domain: "cresta.com",
    tagline: "Contact-center AI",
    hq: "San Francisco, CA",
    employees: 350,
    founded: 2017,
    funding: "$151M Series C",
    category: "Vertical AI",
    score: 19,
    tier: "low",
    reasoning: "Contact center vertical SaaS. Stanford AI lineage, not the named labs.",
    signals: ["Vertical", "Enterprise"],
  },
  {
    id: "c22",
    name: "Tessel",
    domain: "tessel.ai",
    tagline: "Reasoning for science",
    hq: "Berkeley, CA",
    employees: 18,
    founded: 2024,
    funding: "$22M Seed",
    category: "AI Lab",
    score: 84,
    tier: "high",
    reasoning: "Founded by two ex-Anthropic researchers; alignment heritage.",
    signals: ["ex-Anthropic", "Research"],
  },
  {
    id: "c23",
    name: "Numen",
    domain: "numen.ai",
    tagline: "Agents for ops",
    hq: "New York, NY",
    employees: 22,
    founded: 2024,
    funding: "$15M Seed",
    category: "AI Product",
    score: 55,
    tier: "medium",
    reasoning: "One ex-OpenAI engineer co-founder, but applied agents company.",
    signals: ["ex-OpenAI", "Agents"],
  },
  {
    id: "c24",
    name: "Photon Labs",
    domain: "photon.ai",
    tagline: "Optical compute for AI",
    hq: "Mountain View, CA",
    employees: 60,
    founded: 2022,
    funding: "$70M Series A",
    category: "Hardware",
    score: 7,
    tier: "low",
    reasoning: "Hardware company. Photonics, not a lab.",
    signals: ["Hardware"],
  },
  {
    id: "c25",
    name: "Aleph Alpha",
    domain: "aleph-alpha.com",
    tagline: "Sovereign European AI",
    hq: "Heidelberg, DE",
    employees: 200,
    founded: 2019,
    funding: "$500M",
    category: "AI Lab",
    score: 41,
    tier: "medium",
    reasoning: "European foundation lab; not seeded by the named lab alumni.",
    signals: ["Europe", "Sovereign"],
  },
  {
    id: "c26",
    name: "Conjecture",
    domain: "conjecture.dev",
    tagline: "Alignment research",
    hq: "London, UK",
    employees: 25,
    founded: 2022,
    funding: "$10M Seed",
    category: "AI Lab",
    score: 62,
    tier: "medium",
    reasoning: "Alignment lab; some EleutherAI heritage. Light direct OpenAI/Anthropic/DM alumni.",
    signals: ["Alignment", "Research"],
  },
  {
    id: "c27",
    name: "Together AI",
    domain: "together.ai",
    tagline: "Decentralized AI cloud",
    hq: "San Francisco, CA",
    employees: 90,
    founded: 2022,
    funding: "$102M Series A",
    category: "Infra",
    score: 11,
    tier: "low",
    reasoning: "Infrastructure / training cloud. Not a lab.",
    signals: ["Infra", "Cloud"],
  },
  {
    id: "c28",
    name: "Modal",
    domain: "modal.com",
    tagline: "Serverless cloud for AI",
    hq: "New York, NY",
    employees: 60,
    founded: 2021,
    funding: "$80M Series B",
    category: "Infra",
    score: 6,
    tier: "low",
    reasoning: "Cloud infra company. Not a lab and not from the named orgs.",
    signals: ["Infra"],
  },
  {
    id: "c29",
    name: "Lindy",
    domain: "lindy.ai",
    tagline: "Personal AI agents",
    hq: "San Francisco, CA",
    employees: 25,
    founded: 2022,
    funding: "$50M Series A",
    category: "AI Product",
    score: 31,
    tier: "low",
    reasoning: "Consumer agents product. Founder is serial entrepreneur, not lab alumnus.",
    signals: ["Consumer", "Agents"],
  },
  {
    id: "c30",
    name: "Helix",
    domain: "helix-ai.com",
    tagline: "Robotic foundation models",
    hq: "Sunnyvale, CA",
    employees: 45,
    founded: 2023,
    funding: "$75M Series A",
    category: "Robotics",
    score: 78,
    tier: "high",
    reasoning: "Founded by ex-DeepMind robotics team. Lab in spirit.",
    signals: ["ex-DeepMind", "Robotics"],
  },
  {
    id: "c31",
    name: "Conscium",
    domain: "conscium.com",
    tagline: "Conscious AI research",
    hq: "London, UK",
    employees: 12,
    founded: 2024,
    funding: "$2M Pre-seed",
    category: "AI Lab",
    score: 53,
    tier: "medium",
    reasoning: "Research-oriented lab. Some DeepMind advisors, founders less direct.",
    signals: ["Research", "Frontier"],
  },
  {
    id: "c32",
    name: "Bolt Health",
    domain: "bolthealth.ai",
    tagline: "Diagnostic copilots",
    hq: "Boston, MA",
    employees: 28,
    founded: 2023,
    funding: "$18M Seed",
    category: "Vertical AI",
    score: 4,
    tier: "low",
    reasoning: "Vertical health product. No relevant signals.",
    signals: ["Vertical", "Healthcare"],
  },
  {
    id: "c33",
    name: "Foundry",
    domain: "foundrysearch.ai",
    tagline: "Compute marketplace for labs",
    hq: "San Francisco, CA",
    employees: 35,
    founded: 2022,
    funding: "$80M Series A",
    category: "Infra",
    score: 16,
    tier: "low",
    reasoning: "Compute infra, not a lab.",
    signals: ["Infra", "Compute"],
  },
  {
    id: "c34",
    name: "Sentience",
    domain: "sentience.ai",
    tagline: "Agentic reasoning models",
    hq: "Zurich, CH",
    employees: 14,
    founded: 2024,
    funding: "$8M Pre-seed",
    category: "AI Lab",
    score: 80,
    tier: "high",
    reasoning: "Founded by two ex-DeepMind Zurich researchers. Pure research.",
    signals: ["ex-DeepMind", "Agents", "Europe"],
  },
  {
    id: "c35",
    name: "Orby",
    domain: "orby.ai",
    tagline: "Generalist work agents",
    hq: "Mountain View, CA",
    employees: 30,
    founded: 2022,
    funding: "$30M Seed",
    category: "AI Product",
    score: 38,
    tier: "low",
    reasoning: "Stanford lineage, not from named labs.",
    signals: ["Agents", "Stanford"],
  },
  {
    id: "c36",
    name: "AssemblyAI",
    domain: "assemblyai.com",
    tagline: "Speech-to-text APIs",
    hq: "San Francisco, CA",
    employees: 110,
    founded: 2017,
    funding: "$63M Series C",
    category: "AI Product",
    score: 5,
    tier: "low",
    reasoning: "Speech APIs. Not a lab.",
    signals: ["Speech", "API"],
  },
  {
    id: "c37",
    name: "Generally Intelligent",
    domain: "generallyintelligent.com",
    tagline: "AGI research",
    hq: "San Francisco, CA",
    employees: 20,
    founded: 2021,
    funding: "$20M",
    category: "AI Lab",
    score: 68,
    tier: "medium",
    reasoning: "Pure research lab. Light OpenAI/Anthropic/DeepMind alumni density.",
    signals: ["Research"],
  },
  {
    id: "c38",
    name: "Twelve Labs",
    domain: "twelvelabs.io",
    tagline: "Video understanding",
    hq: "San Francisco, CA",
    employees: 60,
    founded: 2021,
    funding: "$77M Series A",
    category: "AI Product",
    score: 24,
    tier: "low",
    reasoning: "Video API product. Not a lab.",
    signals: ["Video", "API"],
  },
  {
    id: "c39",
    name: "Hume AI",
    domain: "hume.ai",
    tagline: "Empathic voice AI",
    hq: "New York, NY",
    employees: 50,
    founded: 2021,
    funding: "$50M Series B",
    category: "AI Product",
    score: 33,
    tier: "low",
    reasoning: "Affective voice product. Some Google research alum, not the named labs.",
    signals: ["Voice", "Affective"],
  },
  {
    id: "c40",
    name: "Cradle",
    domain: "cradle.bio",
    tagline: "Generative protein design",
    hq: "Amsterdam, NL",
    employees: 35,
    founded: 2021,
    funding: "$33M Series A",
    category: "Vertical AI",
    score: 46,
    tier: "medium",
    reasoning: "Bio-AI vertical. Some DeepMind Isomorphic adjacency.",
    signals: ["Bio", "Generative"],
  },
  {
    id: "c41",
    name: "EvolutionaryScale",
    domain: "evolutionaryscale.ai",
    tagline: "Frontier biology models",
    hq: "New York, NY",
    employees: 25,
    founded: 2024,
    funding: "$142M Seed",
    category: "AI Lab",
    score: 76,
    tier: "high",
    reasoning: "Spun out from Meta FAIR — adjacent caliber, light direct alumni from named labs.",
    signals: ["Research", "Bio"],
  },
  {
    id: "c42",
    name: "Phind",
    domain: "phind.com",
    tagline: "AI search for developers",
    hq: "San Francisco, CA",
    employees: 12,
    founded: 2022,
    funding: "$12M Seed",
    category: "AI Product",
    score: 17,
    tier: "low",
    reasoning: "Developer search product. Not a lab.",
    signals: ["Search", "Developers"],
  },
  {
    id: "c43",
    name: "Goodfire",
    domain: "goodfire.ai",
    tagline: "Mechanistic interpretability",
    hq: "San Francisco, CA",
    employees: 18,
    founded: 2024,
    funding: "$7M Seed",
    category: "AI Lab",
    score: 88,
    tier: "high",
    reasoning: "Founded by ex-Anthropic interpretability researchers. Pure lab.",
    signals: ["ex-Anthropic", "Interpretability"],
  },
  {
    id: "c44",
    name: "Speak",
    domain: "speak.com",
    tagline: "AI language tutor",
    hq: "San Francisco, CA",
    employees: 90,
    founded: 2014,
    funding: "$78M Series C",
    category: "AI Product",
    score: 8,
    tier: "low",
    reasoning: "Consumer language app. Not a lab.",
    signals: ["Consumer", "EdTech"],
  },
  {
    id: "c45",
    name: "Ideogram",
    domain: "ideogram.ai",
    tagline: "Generative imagery",
    hq: "Toronto, ON",
    employees: 15,
    founded: 2023,
    funding: "$80M Series A",
    category: "AI Product",
    score: 71,
    tier: "medium",
    reasoning: "Founded by ex-Google Brain (Imagen authors). Adjacent to but not the named labs.",
    signals: ["ex-Google Brain", "Generative"],
  },
]

/* ───────── firmographic enrichment ─────────
 * Zero CRM's company list view needs more than the base demo fields.
 * Rather than hand-author every value, we derive the extra firmographics
 * deterministically from each record so the dataset stays consistent and
 * easy to maintain while covering all companies.
 */

// Friendlier industry labels (Zero re-categorizes the raw LinkedIn taxonomy).
const INDUSTRY_LABELS: Record<string, string> = {
  "AI Lab": "AI Research",
  "AI Product": "AI Software",
  "Vertical AI": "Vertical AI",
  Hardware: "AI Hardware",
  Robotics: "Robotics",
  Infra: "AI Infrastructure",
}

export const INVESTOR_POOL = [
  "Sequoia",
  "a16z",
  "Lightspeed",
  "Index Ventures",
  "Khosla Ventures",
  "General Catalyst",
  "Greylock",
  "Founders Fund",
  "Accel",
  "NEA",
  "Spark Capital",
  "Thrive Capital",
]

export const TECH_POOL = [
  "PyTorch",
  "Kubernetes",
  "Next.js",
  "Snowflake",
  "Vercel",
  "Postgres",
  "Ray",
  "Hugging Face",
  "AWS",
  "GCP",
  "Datadog",
  "Segment",
]

const JOB_SNIPPET_POOL = [
  "Hiring for Attio admin",
  "Senior ML engineer",
  "Head of Marketing",
  "Platform engineer — Kubernetes",
  "Sales ops — HubSpot",
  "Founding designer",
  "Research scientist — LLM",
]

const LOOKALIKE_LABELS = [
  "Similar positioning",
  "Same tech stack",
  "Overlapping industry tag",
  "Comparable GTM motion",
]

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// Pull a deterministic, non-repeating slice from a pool based on a seed.
function pickFromPool(pool: string[], seed: number, count: number): string[] {
  const out: string[] = []
  let cursor = seed
  const used = new Set<number>()
  while (out.length < count && used.size < pool.length) {
    cursor = (cursor * 1103515245 + 12345) & 0x7fffffff
    const idx = cursor % pool.length
    if (!used.has(idx)) {
      used.add(idx)
      out.push(pool[idx])
    }
  }
  return out
}

// Split "$415M Series B" → { amount: "$415M", round: "Series B" }
const ROUND_PATTERN =
  /\b(Pre-seed|Pre-Seed|Seed|Series\s+[A-Z]|Series\s+[A-Z]\+?)\b/i

function parseFunding(funding: string): { amount: string; round: string } {
  const match = funding.match(ROUND_PATTERN)
  if (match) {
    const round = match[0].replace(/\s+/g, " ").trim()
    const amount = funding.replace(ROUND_PATTERN, "").trim()
    return { amount: amount || funding, round }
  }
  return { amount: funding.trim(), round: "Total raised" }
}

function enrichCompany(base: BaseCompany): Company {
  const seed = hashString(base.id + base.name)
  const { amount, round } = parseFunding(base.funding)
  // 12-month headcount growth, skewed higher for younger / hotter companies.
  const growthBase = 4 + (seed % 26) // 4..29
  const headcountGrowth =
    base.tier === "high" ? growthBase + 4 : growthBase
  const investorCount = base.employees > 150 ? 3 : 2
  return {
    ...base,
    industry: INDUSTRY_LABELS[base.category] ?? base.category,
    headcountGrowth: Math.min(headcountGrowth, 42),
    lastRound: round,
    totalFunding: amount,
    investors: pickFromPool(INVESTOR_POOL, seed, investorCount),
    technologies: pickFromPool(TECH_POOL, seed >> 3, 3),
    inCrm: seed % 10 < 3, // ~30% already in CRM
    linkedinLocations: 1 + (seed % 8),
    jobPostSnippets: pickFromPool(JOB_SNIPPET_POOL, seed >> 5, 1 + (seed % 2)),
    lookalikeLabel:
      base.score >= 70
        ? LOOKALIKE_LABELS[seed % LOOKALIKE_LABELS.length]
        : undefined,
  }
}

export const COMPANIES: Company[] = BASE_COMPANIES.map(enrichCompany)

// Map the 0–100 match score onto Zero's ICP Fit label set.
export function icpFitFromScore(score: number): IcpFit {
  if (score >= 90) return "excellent"
  if (score >= 70) return "good"
  return "medium"
}

export function icpFitLabel(fit: IcpFit): string {
  return fit === "excellent"
    ? "Excellent"
    : fit === "good"
      ? "Good"
      : "Medium"
}
