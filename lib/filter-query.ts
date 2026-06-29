import type { Company } from "@/lib/data"
import { icpFitFromScore } from "@/lib/data"
import {
  defaultOperatorForAttribute,
  defaultValueForAttribute,
  formatAttributeValue,
  getAttributeDef,
  getOperatorsForAttribute,
  OPERATOR_LABELS,
  operatorNeedsValue,
  TABLE_FILTER_ATTRIBUTES,
  type AttributeSlug,
  type FilterOperator,
  type FilterValue,
} from "@/lib/filter-attributes"

export type FilterCondition = {
  kind: "condition"
  id: string
  attribute: AttributeSlug
  operator: FilterOperator
  value?: FilterValue
}

export type FilterGroup = {
  kind: "group"
  id: string
  combinator: "and" | "or"
  children: FilterNode[]
}

export type FilterNot = {
  kind: "not"
  id: string
  child: FilterNode
}

export type FilterNode = FilterCondition | FilterGroup | FilterNot

export type FilterQuery = FilterGroup

let idSeq = 0
export function newFilterId(prefix = "f"): string {
  idSeq += 1
  return `${prefix}-${idSeq}-${Date.now().toString(36)}`
}

export function createEmptyQuery(): FilterQuery {
  return {
    kind: "group",
    id: newFilterId("root"),
    combinator: "and",
    children: [],
  }
}

export function getNextFilterAttribute(query: FilterQuery): AttributeSlug {
  const used = new Set(
    flattenFilterChipsFromQuery(query).map((chip) => chip.condition.attribute),
  )
  const next = TABLE_FILTER_ATTRIBUTES.find((field) => !used.has(field.slug))
  return next?.slug ?? TABLE_FILTER_ATTRIBUTES[0].slug
}

export function createCondition(
  attribute: AttributeSlug = TABLE_FILTER_ATTRIBUTES[0].slug,
): FilterCondition {
  const operator = defaultOperatorForAttribute(attribute)
  return {
    kind: "condition",
    id: newFilterId("cond"),
    attribute,
    operator,
    value: defaultValueForAttribute(attribute, operator),
  }
}

export function createGroup(combinator: "and" | "or" = "and"): FilterGroup {
  return {
    kind: "group",
    id: newFilterId("group"),
    combinator,
    children: [],
  }
}

export function createNot(child: FilterNode): FilterNot {
  return { kind: "not", id: newFilterId("not"), child }
}

export function cloneQuery(query: FilterQuery): FilterQuery {
  return JSON.parse(JSON.stringify(query)) as FilterQuery
}

function mapNode(
  node: FilterNode,
  fn: (n: FilterNode) => FilterNode | null,
): FilterNode | null {
  const mapped = fn(node)
  if (!mapped) return null

  if (mapped.kind === "group") {
    const children: FilterNode[] = []
    for (const child of mapped.children) {
      const next = mapNode(child, fn)
      if (next) children.push(next)
    }
    return { ...mapped, children }
  }

  if (mapped.kind === "not") {
    const child = mapNode(mapped.child, fn)
    if (!child) return null
    return { ...mapped, child }
  }

  return mapped
}

function updateNodeInTree(
  root: FilterQuery,
  nodeId: string,
  updater: (node: FilterNode) => FilterNode,
): FilterQuery {
  const result = mapNode(root, (node) => {
    if (node.id === nodeId) return updater(node)
    return node
  })
  return (result ?? createEmptyQuery()) as FilterQuery
}

function findParentGroup(
  root: FilterGroup,
  nodeId: string,
): { parent: FilterGroup; index: number } | null {
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i]
    if (child.id === nodeId) return { parent: root, index: i }
    if (child.kind === "group") {
      const found = findParentGroup(child, nodeId)
      if (found) return found
    }
    if (child.kind === "not") {
      if (child.child.id === nodeId) return { parent: root, index: i }
      if (child.child.kind === "group") {
        const found = findParentGroup(child.child, nodeId)
        if (found) return found
      }
    }
  }
  return null
}

function replaceInGroup(
  group: FilterGroup,
  nodeId: string,
  replacement: FilterNode | null,
): FilterGroup {
  const nextChildren: FilterNode[] = []
  for (const child of group.children) {
    if (child.id === nodeId) {
      if (replacement) nextChildren.push(replacement)
      continue
    }
    if (child.kind === "group") {
      nextChildren.push(replaceInGroup(child, nodeId, replacement))
      continue
    }
    if (child.kind === "not") {
      if (child.child.id === nodeId) {
        if (replacement) nextChildren.push({ ...child, child: replacement })
        continue
      }
      if (child.child.kind === "group") {
        nextChildren.push({
          ...child,
          child: replaceInGroup(child.child, nodeId, replacement),
        })
        continue
      }
    }
    nextChildren.push(child)
  }
  return { ...group, children: nextChildren }
}

export function addCondition(
  query: FilterQuery,
  groupId?: string,
  attribute?: AttributeSlug,
): FilterQuery {
  const targetId = groupId ?? query.id
  const condition = createCondition(
    attribute ?? getNextFilterAttribute(query),
  )
  return updateNodeInTree(query, targetId, (node) => {
    if (node.kind !== "group" || node.id !== targetId) return node
    return { ...node, children: [...node.children, condition] }
  })
}

export function addGroup(
  query: FilterQuery,
  parentGroupId?: string,
  combinator: "and" | "or" = "or",
): FilterQuery {
  const targetId = parentGroupId ?? query.id
  const group = createGroup(combinator)
  return updateNodeInTree(query, targetId, (node) => {
    if (node.kind !== "group" || node.id !== targetId) return node
    return { ...node, children: [...node.children, group] }
  })
}

export function wrapInNot(query: FilterQuery, nodeId: string): FilterQuery {
  const parent = findParentGroup(query, nodeId)
  if (!parent) return query
  const node = parent.parent.children[parent.index]
  const wrapped = createNot(node)
  const nextChildren = [...parent.parent.children]
  nextChildren[parent.index] = wrapped
  return replaceNodeChildren(query, parent.parent.id, nextChildren)
}

function replaceNodeChildren(
  query: FilterQuery,
  groupId: string,
  children: FilterNode[],
): FilterQuery {
  return updateNodeInTree(query, groupId, (node) => {
    if (node.kind !== "group") return node
    return { ...node, children }
  })
}

export function removeNode(query: FilterQuery, nodeId: string): FilterQuery {
  if (query.id === nodeId) {
    return createEmptyQuery()
  }
  return replaceInGroup(query, nodeId, null)
}

export function updateGroupCombinator(
  query: FilterQuery,
  groupId: string,
  combinator: "and" | "or",
): FilterQuery {
  return updateNodeInTree(query, groupId, (node) => {
    if (node.kind !== "group") return node
    return { ...node, combinator }
  })
}

export function updateCondition(
  query: FilterQuery,
  conditionId: string,
  patch: Partial<Pick<FilterCondition, "attribute" | "operator" | "value">>,
): FilterQuery {
  return updateNodeInTree(query, conditionId, (node) => {
    if (node.kind !== "condition") return node
    let next: FilterCondition = { ...node, ...patch }

    if (patch.attribute && patch.attribute !== node.attribute) {
      const operator =
        patch.operator && getOperatorsForAttribute(patch.attribute).includes(patch.operator)
          ? patch.operator
          : defaultOperatorForAttribute(patch.attribute)
      next = {
        ...next,
        attribute: patch.attribute,
        operator,
        value: defaultValueForAttribute(patch.attribute, operator),
      }
    } else if (patch.operator && patch.operator !== node.operator) {
      const value = operatorNeedsValue(patch.operator)
        ? (patch.value ??
          (operatorNeedsValue(node.operator) ? node.value : defaultValueForAttribute(node.attribute, patch.operator)))
        : undefined
      next = { ...next, operator: patch.operator, value }
    }

    return next
  })
}

export function clearQuery(): FilterQuery {
  return createEmptyQuery()
}

export function countConditions(node: FilterNode): number {
  if (node.kind === "condition") return 1
  if (node.kind === "not") return countConditions(node.child)
  return node.children.reduce((sum, c) => sum + countConditions(c), 0)
}

export function hasFilterConditions(query: FilterQuery): boolean {
  return countConditions(query) > 0
}

export type FilterChipItem = {
  id: string
  condition: FilterCondition
  negated: boolean
}

/** Flatten a filter tree into display chips (conditions only). */
export function flattenFilterChips(
  node: FilterNode,
  negated = false,
): FilterChipItem[] {
  if (node.kind === "condition") {
    return [{ id: node.id, condition: node, negated }]
  }
  if (node.kind === "not") {
    return flattenFilterChips(node.child, !negated)
  }
  return node.children.flatMap((child) => flattenFilterChips(child, negated))
}

export function flattenFilterChipsFromQuery(query: FilterQuery): FilterChipItem[] {
  return flattenFilterChips(query)
}

export function collectConditions(
  node: FilterNode,
  attribute?: AttributeSlug,
): FilterCondition[] {
  if (node.kind === "condition") {
    if (attribute && node.attribute !== attribute) return []
    return [node]
  }
  if (node.kind === "not") {
    return collectConditions(node.child, attribute)
  }
  return node.children.flatMap((c) => collectConditions(c, attribute))
}

export function describeCondition(condition: FilterCondition): string {
  const attr = getAttributeDef(condition.attribute).label
  const op = OPERATOR_LABELS[condition.operator]
  if (!operatorNeedsValue(condition.operator)) {
    return `${attr} ${op}`
  }
  const val = formatAttributeValue(condition.attribute, condition.value)
  return `${attr} ${op} ${val}`.trim()
}

export function describeNode(node: FilterNode): string {
  if (node.kind === "condition") return describeCondition(node)
  if (node.kind === "not") return `Not (${describeNode(node.child)})`
  if (node.children.length === 0) return ""
  const parts = node.children.map(describeNode).filter(Boolean)
  if (parts.length === 0) return ""
  const joiner = node.combinator === "and" ? " AND " : " OR "
  if (parts.length === 1) return parts[0]
  return `(${parts.join(joiner)})`
}

export function describeFilterQuery(query: FilterQuery): string[] {
  const labels: string[] = []
  function walk(node: FilterNode) {
    if (node.kind === "condition") {
      labels.push(describeCondition(node))
      return
    }
    if (node.kind === "not") {
      labels.push(`Not: ${describeNode(node.child)}`)
      return
    }
    for (const child of node.children) walk(child)
  }
  walk(query)
  return labels
}

function compareNumber(field: number, op: FilterOperator, target: number): boolean {
  switch (op) {
    case "$eq":
      return field === target
    case "$lt":
      return field < target
    case "$lte":
      return field <= target
    case "$gt":
      return field > target
    case "$gte":
      return field >= target
    default:
      return false
  }
}

function matchString(
  field: string,
  op: FilterOperator,
  target: string,
): boolean {
  const f = field.toLowerCase()
  const t = target.toLowerCase()
  switch (op) {
    case "$eq":
      return f === t
    case "$contains":
      return f.includes(t)
    case "$starts_with":
      return f.startsWith(t)
    case "$ends_with":
      return f.endsWith(t)
    default:
      return false
  }
}

function matchStringList(
  fields: string[],
  op: FilterOperator,
  target: FilterValue | undefined,
): boolean {
  if (op === "$not_empty") return fields.length > 0
  if (op === "$in" && Array.isArray(target)) {
    return target.some((t) => fields.includes(String(t)))
  }
  if (op === "$contains" && typeof target === "string") {
    const t = target.toLowerCase()
    return fields.some((f) => f.toLowerCase().includes(t))
  }
  if (typeof target === "string") {
    return fields.some((f) => matchString(f, op, target))
  }
  return false
}

function evaluateLookalike(
  company: Company,
  sourceId: string,
  allCompanies: Company[],
): boolean {
  const source = allCompanies.find((c) => c.id === sourceId)
  if (!source || company.id === source.id) return false
  return (
    company.industry === source.industry ||
    company.technologies.some((t) => source.technologies.includes(t)) ||
    !!company.lookalikeLabel
  )
}

function evaluateCondition(
  company: Company,
  condition: FilterCondition,
  allCompanies: Company[],
): boolean {
  const { attribute, operator, value } = condition

  if (operator === "$not_empty") {
    switch (attribute) {
      case "name":
        return !!company.name.trim()
      case "job_posts":
        return company.jobPostSnippets.length > 0
      default:
        return true
    }
  }

  switch (attribute) {
    case "hq": {
      if (operator === "$in" && Array.isArray(value)) {
        return value.includes(company.hq)
      }
      if (typeof value === "string") {
        return matchString(company.hq, operator, value)
      }
      return false
    }
    case "industry": {
      if (operator === "$in" && Array.isArray(value)) {
        return value.includes(company.industry)
      }
      if (typeof value === "string") {
        return company.industry === value
      }
      return false
    }
    case "funding_round": {
      if (operator === "$in" && Array.isArray(value)) {
        return value.includes(company.lastRound)
      }
      if (typeof value === "string") {
        return company.lastRound === value
      }
      return false
    }
    case "investors":
      return matchStringList(company.investors, operator, value)
    case "technologies":
      return matchStringList(company.technologies, operator, value)
    case "founded":
      return typeof value === "number"
        ? compareNumber(company.founded, operator, value)
        : false
    case "employees":
      return typeof value === "number"
        ? compareNumber(company.employees, operator, value)
        : false
    case "headcount_growth":
      return typeof value === "number"
        ? compareNumber(company.headcountGrowth, operator, value)
        : false
    case "linkedin_locations":
      return typeof value === "number"
        ? compareNumber(company.linkedinLocations, operator, value)
        : false
    case "job_posts": {
      if (typeof value !== "string") return false
      return company.jobPostSnippets.some((s) =>
        matchString(s, operator, value),
      )
    }
    case "lookalike": {
      if (typeof value !== "string") return false
      return evaluateLookalike(company, value, allCompanies)
    }
    case "in_crm": {
      if (typeof value === "boolean") {
        return company.inCrm === value
      }
      return false
    }
    case "name": {
      if (typeof value !== "string") return false
      return matchString(company.name, operator, value)
    }
    case "signals":
      return matchStringList(company.signals, operator, value)
    case "icp_fit": {
      const fit = icpFitFromScore(company.score)
      if (operator === "$in" && Array.isArray(value)) {
        return value.includes(fit)
      }
      if (typeof value === "string") {
        return fit === value
      }
      return false
    }
    default:
      return true
  }
}

function evaluateNode(
  company: Company,
  node: FilterNode,
  allCompanies: Company[],
): boolean {
  if (node.kind === "condition") {
    return evaluateCondition(company, node, allCompanies)
  }
  if (node.kind === "not") {
    return !evaluateNode(company, node.child, allCompanies)
  }
  if (node.children.length === 0) return true
  if (node.combinator === "and") {
    return node.children.every((c) => evaluateNode(company, c, allCompanies))
  }
  return node.children.some((c) => evaluateNode(company, c, allCompanies))
}

export function applyFilterQuery(
  companies: Company[],
  query: FilterQuery,
): Company[] {
  if (!hasFilterConditions(query)) return companies
  return companies.filter((c) => evaluateNode(c, query, companies))
}
