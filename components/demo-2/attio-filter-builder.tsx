"use client"

import { type ComponentType, type ReactNode, useLayoutEffect, useRef, useState } from "react"
import {
  Briefcase,
  Building2,
  Calendar,
  CircleDot,
  DollarCircle,
  Filter,
  MapPin,
  MoreHorizontal,
  Plus,
  Sparkle,
  Tag,
  Users,
} from "@/components/icons"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { icpFitLabel, type IcpFit } from "@/lib/data"
import {
  ATTRIBUTE_REGISTRY,
  getAttributeDef,
  getFilterAttributeOptions,
  getOperatorsForAttribute,
  getTableFilterLabel,
  OPERATOR_LABELS,
  operatorNeedsValue,
  TABLE_FILTER_ATTRIBUTES,
  type AttributeSlug,
  type FilterOperator,
  type FilterValue,
} from "@/lib/filter-attributes"
import {
  addCondition,
  clearQuery,
  flattenFilterChipsFromQuery,
  hasFilterConditions,
  removeNode,
  updateCondition,
  wrapInNot,
  type FilterChipItem,
  type FilterCondition,
  type FilterQuery,
} from "@/lib/filter-query"
import { cn } from "@/lib/utils"

const ROW_FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"

/** Matches app dropdown panels — white surface, border, no shadow. */
const FILTER_DROPDOWN_PANEL =
  "overflow-hidden rounded-lg border border-border bg-white text-foreground shadow-none dark:bg-card"

const FILTER_DROPDOWN_ITEM =
  "rounded-md font-inter text-[12px] focus:bg-muted focus:text-foreground"

const FILTER_CHIP_SURFACE = "bg-white dark:bg-card"

const SEGMENT_TRIGGER =
  `h-8 rounded-none border-y border-r border-border ${FILTER_CHIP_SURFACE} px-2.5 font-inter text-[12px] shadow-none first:rounded-l-md first:border-l hover:bg-zinc-50 dark:hover:bg-muted/30`

const VALUE_SEGMENT_INPUT =
  `h-8 rounded-none border-y border-r border-l-0 border-border ${FILTER_CHIP_SURFACE} px-2.5 font-inter text-[12px] shadow-none placeholder:text-muted-foreground/45 focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset`

const FILTER_VALUE_INPUT_MIN_PX = 72
const FILTER_VALUE_INPUT_MAX_PX = 176

function FilterValueInput({
  value,
  onChange,
  placeholder,
  className,
  type = "text",
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  type?: React.HTMLInputTypeAttribute
}) {
  const mirrorRef = useRef<HTMLSpanElement>(null)
  const [widthPx, setWidthPx] = useState(FILTER_VALUE_INPUT_MIN_PX)
  const measureText = value || placeholder || ""

  useLayoutEffect(() => {
    const mirror = mirrorRef.current
    if (!mirror) return
    const contentWidth = Math.ceil(mirror.getBoundingClientRect().width) + 20
    setWidthPx(
      Math.min(
        FILTER_VALUE_INPUT_MAX_PX,
        Math.max(FILTER_VALUE_INPUT_MIN_PX, contentWidth),
      ),
    )
  }, [measureText])

  return (
    <span className="relative inline-flex shrink-0">
      <span
        ref={mirrorRef}
        aria-hidden
        className="pointer-events-none invisible absolute whitespace-pre font-inter text-[12px]"
      >
        {measureText}
      </span>
      <Input
        type={type}
        style={{ width: widthPx }}
        className={cn(
          VALUE_SEGMENT_INPUT,
          "w-auto max-w-[11rem] min-w-[4.5rem] shrink-0",
          className,
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </span>
  )
}

/** Square 32×32 icon control — always non-shrinking inside segmented filter chips. */
const FILTER_ICON_BUTTON =
  "inline-flex size-8 min-h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center font-inter text-muted-foreground transition-colors hover:bg-zinc-50 hover:text-foreground dark:hover:bg-muted/30"

function FilterSelectContent({
  className,
  ...props
}: React.ComponentProps<typeof SelectContent>) {
  return (
    <SelectContent
      className={cn(FILTER_DROPDOWN_PANEL, className)}
      {...props}
    />
  )
}

const ATTRIBUTE_ICONS: Record<
  AttributeSlug,
  ComponentType<{ className?: string }>
> = {
  hq: MapPin,
  industry: Tag,
  funding_round: DollarCircle,
  investors: DollarCircle,
  technologies: Sparkle,
  employees: Users,
  founded: Calendar,
  headcount_growth: Building2,
  linkedin_locations: MapPin,
  job_posts: Briefcase,
  lookalike: Sparkle,
  in_crm: Building2,
  name: Building2,
  signals: Sparkle,
  icp_fit: CircleDot,
}

function formatSelectOptionLabel(
  attribute: AttributeSlug,
  option: string,
): string {
  if (attribute === "icp_fit") return icpFitLabel(option as IcpFit)
  if (attribute === "lookalike") {
    return (
      getFilterAttributeOptions().companies.find((c) => c.id === option)?.name ??
      option
    )
  }
  return option
}

function SegmentedSelectTrigger({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      {...props}
      size="sm"
      hideIcon
      className={cn(
        SEGMENT_TRIGGER,
        // Belt-and-suspenders: hide the default select chevron if it renders.
        "[&_svg.size-4.opacity-50]:hidden",
        className,
      )}
    />
  )
}

function ValueEditor({
  attribute,
  operator,
  value,
  onChange,
}: {
  attribute: AttributeSlug
  operator: FilterOperator
  value?: FilterValue
  onChange: (value: FilterValue | undefined) => void
}) {
  if (!operatorNeedsValue(operator)) {
    return (
      <span className={cn("inline-flex h-8 min-w-[5rem] items-center rounded-none border-y border-r border-l-0 border-border px-2.5 font-inter text-[11px] text-muted-foreground", FILTER_CHIP_SURFACE)}>
        —
      </span>
    )
  }

  const def = getAttributeDef(attribute)
  const opts = def.options?.() ?? []

  if (def.valueKind === "boolean") {
    return (
      <Select
        value={value === false ? "false" : "true"}
        onValueChange={(v) => onChange(v === "true")}
      >
        <SegmentedSelectTrigger className="min-w-[5rem] border-l-0">
          <SelectValue />
        </SegmentedSelectTrigger>
        <FilterSelectContent>
          <SelectItem className={FILTER_DROPDOWN_ITEM} value="true">
            Yes
          </SelectItem>
          <SelectItem className={FILTER_DROPDOWN_ITEM} value="false">
            No
          </SelectItem>
        </FilterSelectContent>
      </Select>
    )
  }

  if (def.valueKind === "number") {
    return (
      <FilterValueInput
        type="number"
        className="min-w-[5.5rem]"
        value={typeof value === "number" ? String(value) : ""}
        placeholder="0"
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
      />
    )
  }

  if (def.valueKind === "company") {
    const companies = getFilterAttributeOptions().companies
    return (
      <Select
        value={typeof value === "string" ? value : ""}
        onValueChange={(v) => onChange(v)}
      >
        <SegmentedSelectTrigger className="max-w-[10rem] border-l-0">
          <SelectValue placeholder="Company" />
        </SegmentedSelectTrigger>
        <FilterSelectContent>
          {companies.map((c) => (
            <SelectItem
              key={c.id}
              className={FILTER_DROPDOWN_ITEM}
              value={c.id}
            >
              {c.name}
            </SelectItem>
          ))}
        </FilterSelectContent>
      </Select>
    )
  }

  if (def.valueKind === "multi_select" && operator === "$in") {
    const selected = Array.isArray(value) ? value : []
    const label =
      selected.length === 0
        ? "Select…"
        : selected.length === 1
          ? selected[0]
          : `${selected.length} selected`

    return (
      <Select
        value={selected[0] ?? "__placeholder__"}
        onValueChange={(v) => {
          if (v === "__placeholder__") return
          const next = selected.includes(v)
            ? selected.filter((s) => s !== v)
            : [...selected, v]
          onChange(next)
        }}
      >
        <SegmentedSelectTrigger className="max-w-[9rem] border-l-0">
          <span className="truncate">{label}</span>
        </SegmentedSelectTrigger>
        <FilterSelectContent className="max-h-56">
          {opts.map((opt) => (
            <SelectItem
              key={opt}
              className={FILTER_DROPDOWN_ITEM}
              value={opt}
            >
              <span className="flex items-center gap-2">
                <Checkbox
                  checked={selected.includes(opt)}
                  className="pointer-events-none"
                />
                {formatSelectOptionLabel(attribute, opt)}
              </span>
            </SelectItem>
          ))}
        </FilterSelectContent>
      </Select>
    )
  }

  if (def.valueKind === "multi_select" && operator === "$contains") {
    return (
      <FilterValueInput
        placeholder="Keyword…"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (def.valueKind === "select" || def.valueKind === "multi_select") {
    return (
      <Select
        value={typeof value === "string" ? value : ""}
        onValueChange={(v) => onChange(v)}
      >
        <SegmentedSelectTrigger className="max-w-[9rem] border-l-0">
          <SelectValue placeholder="Select…" />
        </SegmentedSelectTrigger>
        <FilterSelectContent className="max-h-56">
          {opts.map((opt) => (
            <SelectItem
              key={opt}
              className={FILTER_DROPDOWN_ITEM}
              value={opt}
            >
              {formatSelectOptionLabel(attribute, opt)}
            </SelectItem>
          ))}
        </FilterSelectContent>
      </Select>
    )
  }

  return (
    <FilterValueInput
      placeholder="Value…"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function AddFilterMenu({
  query,
  onChange,
  children,
}: {
  query: FilterQuery
  onChange: (q: FilterQuery) => void
  children: ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          FILTER_DROPDOWN_PANEL,
          "max-h-72 w-52 overflow-y-auto p-1 font-inter text-[12px]",
        )}
      >
        {TABLE_FILTER_ATTRIBUTES.map(({ slug, label }) => {
          const Icon = ATTRIBUTE_ICONS[slug]
          return (
            <DropdownMenuItem
              key={slug}
              className={FILTER_DROPDOWN_ITEM}
              onClick={() => onChange(addCondition(query, undefined, slug))}
            >
              <Icon className="size-3.5 opacity-60" aria-hidden />
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FilterChip({
  item,
  query,
  onChange,
}: {
  item: FilterChipItem
  query: FilterQuery
  onChange: (q: FilterQuery) => void
}) {
  const { condition, negated } = item
  const Icon = ATTRIBUTE_ICONS[condition.attribute]
  const operators = getOperatorsForAttribute(condition.attribute)
  const fieldLabel = getTableFilterLabel(condition.attribute)

  return (
    <div className="inline-flex h-8 shrink-0 items-stretch font-inter text-[12px] text-foreground shadow-none">
      <Select
        value={condition.attribute}
        onValueChange={(slug) =>
          onChange(
            updateCondition(query, condition.id, {
              attribute: slug as AttributeSlug,
            }),
          )
        }
      >
        <SegmentedSelectTrigger className="max-w-[8.5rem] shrink-0 gap-1.5">
          <Icon className="size-3.5 shrink-0 opacity-60" aria-hidden />
          <span className="truncate">
            {negated ? `Not ${fieldLabel}` : fieldLabel}
          </span>
        </SegmentedSelectTrigger>
        <FilterSelectContent className="max-h-72">
          {TABLE_FILTER_ATTRIBUTES.map(({ slug, label }) => (
            <SelectItem
              key={slug}
              className={FILTER_DROPDOWN_ITEM}
              value={slug}
            >
              {label}
            </SelectItem>
          ))}
        </FilterSelectContent>
      </Select>

      <Select
        value={condition.operator}
        onValueChange={(op) =>
          onChange(
            updateCondition(query, condition.id, {
              operator: op as FilterOperator,
            }),
          )
        }
      >
        <SegmentedSelectTrigger className="max-w-[8rem] shrink-0 border-l-0 text-muted-foreground">
          <SelectValue />
        </SegmentedSelectTrigger>
        <FilterSelectContent>
          {operators.map((op) => (
            <SelectItem key={op} className={FILTER_DROPDOWN_ITEM} value={op}>
              {OPERATOR_LABELS[op]}
            </SelectItem>
          ))}
        </FilterSelectContent>
      </Select>

      <ValueEditor
        attribute={condition.attribute}
        operator={condition.operator}
        value={condition.value}
        onChange={(value) =>
          onChange(updateCondition(query, condition.id, { value }))
        }
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Filter actions"
            className={cn(
              FILTER_ICON_BUTTON,
              "rounded-none rounded-r-md border border-l-0 border-border hover:text-foreground",
              FILTER_CHIP_SURFACE,
              ROW_FOCUS_RING,
            )}
          >
            <MoreHorizontal className="size-3.5 rotate-90" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(FILTER_DROPDOWN_PANEL, "w-40 p-1 font-inter text-[12px]")}
        >
          {!negated ? (
            <DropdownMenuItem
              className={FILTER_DROPDOWN_ITEM}
              onClick={() => onChange(wrapInNot(query, condition.id))}
            >
              Exclude
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className={cn(
              FILTER_DROPDOWN_ITEM,
              "text-destructive focus:bg-destructive/10 focus:text-destructive",
            )}
            onClick={() => onChange(removeNode(query, condition.id))}
          >
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function AttioFilterBuilder({
  query,
  onChange,
}: {
  query: FilterQuery
  onChange: (q: FilterQuery) => void
}) {
  const active = hasFilterConditions(query)
  const chips = flattenFilterChipsFromQuery(query)

  if (!active) {
    return (
      <AddFilterMenu query={query} onChange={onChange}>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-1.5 font-inter text-[12px] text-muted-foreground transition-colors hover:text-foreground",
            ROW_FOCUS_RING,
          )}
        >
          <Filter className="size-3.5 opacity-70" aria-hidden />
          Filter
        </button>
      </AddFilterMenu>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((item) => (
          <FilterChip
            key={item.id}
            item={item}
            query={query}
            onChange={onChange}
          />
        ))}
        <AddFilterMenu query={query} onChange={onChange}>
          <button
            type="button"
            aria-label="Add filter"
            className={cn(
              FILTER_ICON_BUTTON,
              "rounded-lg border border-dashed border-border hover:border-foreground/25",
              ROW_FOCUS_RING,
            )}
          >
            <Plus className="size-3.5" />
          </button>
        </AddFilterMenu>
      </div>
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={() => onChange(clearQuery())}
          className="shrink-0 cursor-pointer px-1 font-inter text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </button>
      ) : null}
    </div>
  )
}

export { ATTRIBUTE_REGISTRY }
