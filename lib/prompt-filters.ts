import { COMPANIES } from "@/lib/data"
import {
  getFilterAttributeOptions,
  type AttributeSlug,
  type FilterOperator,
  type FilterValue,
} from "@/lib/filter-attributes"
import {
  createEmptyQuery,
  createNot,
  flattenFilterChipsFromQuery,
  newFilterId,
  removeNode,
  type FilterCondition,
  type FilterNode,
  type FilterQuery,
} from "@/lib/filter-query"
import { normalizeFundingStage, parsePromptTokens } from "@/lib/prompt-tokens"

const EUROPE_HQ = [
  "London, UK",
  "Paris, FR",
  "Amsterdam, NL",
  "Zurich, CH",
  "Heidelberg, DE",
]

const GEO_TO_HQ: Record<string, string> = {
  "san francisco": "San Francisco, CA",
  "new york": "New York, NY",
  london: "London, UK",
  paris: "Paris, FR",
  amsterdam: "Amsterdam, NL",
  boston: "Boston, MA",
  cambridge: "Cambridge, MA",
  singapore: "Singapore",
  tokyo: "Tokyo, JP",
  toronto: "Toronto, ON",
  zurich: "Zurich, CH",
}

const INDUSTRY_FROM_PROMPT: Record<string, string> = {
  "ai lab": "AI Research",
  "ai labs": "AI Research",
  robotics: "Robotics",
  inference: "AI Infrastructure",
  infra: "AI Infrastructure",
  "developer tools": "AI Software",
  "ai software": "AI Software",
  "machine learning": "AI Research",
  llms: "AI Research",
  "large language models": "AI Research",
  multimodal: "AI Research",
  agents: "AI Software",
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function makeCondition(
  attribute: AttributeSlug,
  operator: FilterOperator,
  value?: FilterValue,
): FilterCondition {
  return {
    kind: "condition",
    id: newFilterId("prompt"),
    attribute,
    operator,
    value,
  }
}

function resolveIndustry(term: string): string | null {
  const key = term.toLowerCase().trim()
  if (INDUSTRY_FROM_PROMPT[key]) return INDUSTRY_FROM_PROMPT[key]
  const industries = getFilterAttributeOptions().industries
  const exact = industries.find((i) => i.toLowerCase() === key)
  if (exact) return exact
  const partial = industries.find(
    (i) => i.toLowerCase().includes(key) || key.includes(i.toLowerCase()),
  )
  return partial ?? null
}

function resolveHq(geo: string): string | null {
  const key = geo.toLowerCase().trim()
  if (GEO_TO_HQ[key]) return GEO_TO_HQ[key]
  if (key === "usa" || key === "us" || key === "united states") {
    return null // handled via US_HQ list if needed
  }
  const cities = getFilterAttributeOptions().hqCities
  const match = cities.find(
    (c) =>
      c.toLowerCase().includes(key) ||
      key.includes(c.split(",")[0]?.toLowerCase() ?? ""),
  )
  return match ?? null
}

function orgToSignal(org: string): string {
  const value = org.trim()
  if (/openai/i.test(value)) return "ex-OpenAI"
  if (/anthropic/i.test(value)) return "ex-Anthropic"
  if (/google brain/i.test(value)) return "ex-Google Brain"
  if (/deepmind/i.test(value)) return "ex-DeepMind"
  return `ex-${value}`
}

function findCompanyIdByName(name: string): string | null {
  const key = name.toLowerCase().trim()
  const exact = COMPANIES.find((c) => c.name.toLowerCase() === key)
  if (exact) return exact.id
  const partial = COMPANIES.find(
    (c) =>
      c.name.toLowerCase().includes(key) || key.includes(c.name.toLowerCase()),
  )
  return partial?.id ?? null
}

function hasAlumniContext(text: string): boolean {
  return /\balumni\b|\bfounded by\b/i.test(text)
}

/** Build filter conditions implied by natural-language prompt tokens and phrases. */
export function inferFiltersFromPrompt(text: string): FilterQuery {
  const trimmed = text.trim()
  if (!trimmed) return createEmptyQuery()

  const children: FilterNode[] = []
  const tokens = parsePromptTokens(trimmed)
  const seen = new Set<AttributeSlug>()

  const push = (node: FilterNode, attribute?: AttributeSlug) => {
    const attr =
      attribute ??
      (node.kind === "condition"
        ? node.attribute
        : node.kind === "not" && node.child.kind === "condition"
          ? node.child.attribute
          : undefined)
    if (attr && seen.has(attr)) return
    if (attr) seen.add(attr)
    children.push(node)
  }

  for (const token of tokens) {
    if (token.type === "industry") {
      const industry = resolveIndustry(token.value)
      if (industry) push(makeCondition("industry", "$eq", industry), "industry")
      continue
    }

    if (token.type === "geo") {
      const key = token.value.toLowerCase().trim()
      if (key === "europe") {
        push(makeCondition("hq", "$in", EUROPE_HQ), "hq")
        continue
      }
      if (key === "usa" || key === "us" || key === "united states") {
        const usHq = getFilterAttributeOptions().hqCities.filter((c) =>
          /,\s*(CA|MA|NY)$/i.test(c),
        )
        push(makeCondition("hq", "$in", usHq), "hq")
        continue
      }
      const hq = resolveHq(token.value)
      if (hq) push(makeCondition("hq", "$eq", hq), "hq")
      continue
    }

    if (token.type === "numeric") {
      const stage = normalizeFundingStage(token.value)
      if (stage) {
        const rounds = getFilterAttributeOptions().fundingRounds
        if (rounds.includes(stage)) {
          push(makeCondition("funding_round", "$eq", stage), "funding_round")
        }
      }
      // Headcount is detected from the raw prompt below — the chip value
      // ("50–200" / "50+") doesn't include the word "employees".
      continue
    }

    if (token.type === "time") {
      const after = token.value.match(/(?:founded\s+)?after\s+(\d{4})/i)
      if (after) {
        push(
          makeCondition("founded", "$gte", Number.parseInt(after[1]!, 10)),
          "founded",
        )
        continue
      }
      const before = token.value.match(/(?:founded\s+)?before\s+(\d{4})/i)
      if (before) {
        push(
          makeCondition("founded", "$lte", Number.parseInt(before[1]!, 10)),
          "founded",
        )
      }
    }
  }

  // Headcount — "50–200 employees", "50+ employees", "200 employees".
  const parseInt10 = (raw: string) => Number.parseInt(raw.replace(/,/g, ""), 10)
  const headcountRange = trimmed.match(
    /(\d[\d,]*)\s*[–—-]\s*(\d[\d,]*)\s+employees?\b/i,
  )
  const headcountThreshold = trimmed.match(/(\d[\d,]*)\s*\+\s*employees?\b/i)
  const headcountExact = trimmed.match(/(\d[\d,]*)\s+employees?\b/i)
  if (headcountRange) {
    push(
      makeCondition("employees", "$gte", parseInt10(headcountRange[1]!)),
      "employees",
    )
  } else if (headcountThreshold) {
    push(
      makeCondition("employees", "$gte", parseInt10(headcountThreshold[1]!)),
      "employees",
    )
  } else if (headcountExact) {
    push(
      makeCondition("employees", "$gte", parseInt10(headcountExact[1]!)),
      "employees",
    )
  }

  if (hasAlumniContext(trimmed)) {
    const orgSignals = tokens
      .filter((t) => t.type === "org")
      .map((t) => orgToSignal(t.value))
    const unique = [...new Set(orgSignals)]
    if (unique.length === 1) {
      push(makeCondition("signals", "$contains", unique[0]!), "signals")
    } else if (unique.length > 1) {
      push(makeCondition("signals", "$in", unique), "signals")
    }
  }

  const lookalike = trimmed.match(
    /\blookalikes?\s+of\s+([A-Za-z0-9][\w\s.-]*?)(?=\s*(?:[,.\n]|$))/i,
  )
  if (lookalike) {
    const id = findCompanyIdByName(lookalike[1]!.trim())
    if (id) push(makeCondition("lookalike", "$eq", id), "lookalike")
  }

  if (/\bnot\s+in\s+crm\b/i.test(trimmed)) {
    push(createNot(makeCondition("in_crm", "$eq", true)), "in_crm")
  } else if (/\bin\s+crm\b/i.test(trimmed)) {
    push(makeCondition("in_crm", "$eq", true), "in_crm")
  }

  const hiring = trimmed.match(/\bhiring\s+(?:for\s+)?["']?(\w+)/i)
  if (hiring) {
    push(
      makeCondition("job_posts", "$contains", hiring[1]!.toLowerCase()),
      "job_posts",
    )
  }

  const techs = getFilterAttributeOptions().technologies.filter((tech) =>
    new RegExp(`\\b${escapeRegExp(tech)}\\b`, "i").test(trimmed),
  )
  if (techs.length === 1) {
    push(makeCondition("technologies", "$contains", techs[0]!), "technologies")
  } else if (techs.length > 1) {
    push(makeCondition("technologies", "$in", techs), "technologies")
  }

  const investors = getFilterAttributeOptions().investors.filter((name) =>
    new RegExp(`\\b${escapeRegExp(name)}\\b`, "i").test(trimmed),
  )
  if (investors.length === 1) {
    push(makeCondition("investors", "$contains", investors[0]!), "investors")
  } else if (investors.length > 1) {
    push(makeCondition("investors", "$in", investors), "investors")
  }

  return { ...createEmptyQuery(), children }
}

function removeConditionsByAttribute(
  query: FilterQuery,
  attribute: AttributeSlug,
): FilterQuery {
  const ids = flattenFilterChipsFromQuery(query)
    .filter((chip) => chip.condition.attribute === attribute)
    .map((chip) => chip.id)
  let next = query
  for (const id of ids) {
    next = removeNode(next, id)
  }
  return next
}

/**
 * Replace prompt-derived filters while keeping manually added filters intact.
 * `autoAttributes` tracks which attributes were last set from the prompt.
 */
export function syncPromptFiltersInQuery(
  existing: FilterQuery,
  prompt: string,
  autoAttributes: ReadonlySet<AttributeSlug>,
): { query: FilterQuery; autoAttributes: Set<AttributeSlug> } {
  const inferred = inferFiltersFromPrompt(prompt)
  const inferredChips = flattenFilterChipsFromQuery(inferred)
  const nextAuto = new Set(
    inferredChips.map((chip) => chip.condition.attribute),
  )

  let query = existing
  const attrsToClear = [...autoAttributes]
  for (const attribute of attrsToClear) {
    query = removeConditionsByAttribute(query, attribute)
  }

  for (const chip of inferredChips) {
    const node: FilterNode = chip.negated
      ? createNot(chip.condition)
      : chip.condition
    query = { ...query, children: [...query.children, node] }
  }

  return { query, autoAttributes: nextAuto }
}
