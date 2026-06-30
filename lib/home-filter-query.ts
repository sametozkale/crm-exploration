import type { AttributeSlug, FilterOperator, FilterValue } from "@/lib/filter-attributes"
import {
  addCondition,
  createCondition,
  flattenFilterChipsFromQuery,
  removeNode,
  updateCondition,
  type FilterQuery,
} from "@/lib/filter-query"

export function upsertFilterCondition(
  query: FilterQuery,
  attribute: AttributeSlug,
  operator: FilterOperator,
  value?: FilterValue,
): FilterQuery {
  const existing = flattenFilterChipsFromQuery(query).find(
    (chip) => chip.condition.attribute === attribute,
  )
  if (existing) {
    return updateCondition(query, existing.condition.id, { operator, value })
  }
  const condition = {
    ...createCondition(attribute),
    operator,
    value,
  }
  return { ...query, children: [...query.children, condition] }
}

export function removeFilterByAttribute(
  query: FilterQuery,
  attribute: AttributeSlug,
): FilterQuery {
  const chips = flattenFilterChipsFromQuery(query).filter(
    (chip) => chip.condition.attribute === attribute,
  )
  let next = query
  for (const chip of chips) {
    next = removeNode(next, chip.id)
  }
  return next
}

export function addManualHomeFilter(
  query: FilterQuery,
  attribute: AttributeSlug,
): FilterQuery {
  const used = new Set(
    flattenFilterChipsFromQuery(query).map((chip) => chip.condition.attribute),
  )
  if (used.has(attribute)) return query
  return addCondition(query, undefined, attribute)
}
