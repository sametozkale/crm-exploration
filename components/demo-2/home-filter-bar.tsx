"use client"

import { AnimatePresence, motion } from "framer-motion"
import { getHomeFilterChipParts } from "@/lib/home-filter-labels"
import {
  addManualHomeFilter,
  removeFilterByAttribute,
  upsertFilterCondition,
} from "@/lib/home-filter-query"
import type { AttributeSlug } from "@/lib/filter-attributes"
import {
  flattenFilterChipsFromQuery,
  type FilterChipItem,
  type FilterQuery,
} from "@/lib/filter-query"
import { cn } from "@/lib/utils"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_FILTER_OPTIONS } from "./demo-2-home-data"
import { HomeFundingFilterPanel } from "./home-funding-filter-panel"
import { useDelayedHover } from "./use-delayed-hover"

const FILTER_MENU_ATTRIBUTE: Record<string, AttributeSlug> = {
  Company: "employees",
  Similarity: "lookalike",
  Industry: "industry",
  Funding: "funding_round",
  Tech: "technologies",
  "Job signal": "job_posts",
  Contacts: "in_crm",
}

/** Figma 82:14349 — arrow-right-02-round in 8×8 (rotated from MCP export). */
function HomeFilterChipArrow() {
  return (
    <svg
      viewBox="0 0 8 8"
      fill="none"
      className="size-2 shrink-0"
      aria-hidden
    >
      <path
        d="M1.05 4H5.95"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.55 2.05L6.45 4L4.55 5.95"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Figma cancel-01 — 8×8 close icon on chip hover. */
function HomeFilterChipClose({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={`Remove ${label} filter`}
      onClick={onClick}
      className="hidden size-2 shrink-0 cursor-pointer items-center justify-center text-[#aaa] group-hover/chip:inline-flex"
    >
      <svg viewBox="0 0 8 8" fill="none" className="size-2" aria-hidden>
        <path
          d="M1.4 1.4L6.6 6.6M6.6 1.4L1.4 6.4"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

const FILTER_CHIP_TEXT_STYLE = { fontFeatureSettings: '"salt" 1' } as const

function HomeFilterOptionIcon({
  src,
  flip,
}: {
  src: string
  flip?: boolean
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-[14px] shrink-0 bg-[#969696] transition-colors duration-150 ease-out group-hover/option:bg-[#777777]",
        "[mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]",
        flip && "-rotate-180 -scale-x-100",
      )}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
      }}
    />
  )
}

function HomeFilterChip({
  item,
  onRemove,
}: {
  item: FilterChipItem
  onRemove: () => void
}) {
  const { category, field } = getHomeFilterChipParts(
    item.condition.attribute,
    item.condition.value,
  )
  const segments = field.split(" → ")

  return (
    <div className="group/chip relative inline-flex shrink-0 items-center gap-[4px] rounded-[8px] bg-[#f4f4f4] px-[6px] py-[4px] text-[12px] leading-[16px] text-[#838383] transition-colors duration-150 ease-out hover:bg-[#eee] hover:text-[#646464]">
      <span className="whitespace-nowrap" style={FILTER_CHIP_TEXT_STYLE}>
        {category}
      </span>
      {segments.map((segment, index) => (
        <span key={index} className="inline-flex items-center gap-[4px]">
          <HomeFilterChipArrow />
          <span className="whitespace-nowrap" style={FILTER_CHIP_TEXT_STYLE}>
            {segment}
          </span>
        </span>
      ))}
      <HomeFilterChipClose label={category} onClick={onRemove} />
    </div>
  )
}

function HomeFilterMenuRow({
  option,
  onSelect,
  onFundingRoundSelect,
}: {
  option: (typeof DEMO2_FILTER_OPTIONS)[number]
  onSelect: (attribute: AttributeSlug) => void
  onFundingRoundSelect: (round: string) => void
}) {
  const attribute = FILTER_MENU_ATTRIBUTE[option.label]
  const isFunding = option.label === "Funding"
  const fundingHover = useDelayedHover()

  const row = (
    <button
      type="button"
      onClick={() => {
        if (attribute && !isFunding) onSelect(attribute)
      }}
      className="group/option flex w-full items-center gap-2 rounded-[8px] px-2 py-[6px] text-left transition-colors duration-150 ease-out hover:bg-[#f4f4f4]"
    >
      <HomeFilterOptionIcon
        src={DEMO2_ASSETS[option.icon]}
        flip={"flip" in option && option.flip}
      />
      <span className="text-[13px] leading-none tracking-[0.13px] text-[#969696] transition-colors duration-150 ease-out group-hover/option:text-[#777777]">
        {option.label}
      </span>
    </button>
  )

  if (!isFunding) return row

  return (
    <div
      className="relative"
      onMouseEnter={fundingHover.onEnter}
      onMouseLeave={fundingHover.onLeave}
    >
      {row}
      <div
        className={cn(
          "absolute left-full top-1/2 z-30 flex -translate-y-1/2 transition-opacity duration-150 ease-out",
          fundingHover.open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div className="w-2 shrink-0 self-stretch" aria-hidden />
        <HomeFundingFilterPanel onFundingRoundSelect={onFundingRoundSelect} />
      </div>
    </div>
  )
}

export function HomeFilterBar({
  filterQuery,
  onFilterQueryChange,
  className,
}: {
  filterQuery: FilterQuery
  onFilterQueryChange: (query: FilterQuery) => void
  className?: string
}) {
  const chips = flattenFilterChipsFromQuery(filterQuery)
  const filterMenuHover = useDelayedHover()

  const handleManualAdd = (attribute: AttributeSlug) => {
    onFilterQueryChange(addManualHomeFilter(filterQuery, attribute))
  }

  const handleFundingRoundSelect = (round: string) => {
    onFilterQueryChange(
      upsertFilterCondition(filterQuery, "funding_round", "$eq", round),
    )
  }

  const handleRemoveChip = (attribute: AttributeSlug) => {
    onFilterQueryChange(removeFilterByAttribute(filterQuery, attribute))
  }

  return (
    <div className={cn("flex min-w-0 items-start gap-2", className)}>
      <div
        className="relative shrink-0 self-center"
        onMouseEnter={filterMenuHover.onEnter}
        onMouseLeave={filterMenuHover.onLeave}
      >
        <button
          type="button"
          className="inline-flex h-6 cursor-pointer items-center gap-[6px] rounded-[8px] px-2 text-[13px] leading-4 text-[#969696] transition-colors duration-150 ease-out hover:bg-[#eeeeee] hover:text-[#777]"
        >
          <img
            src={DEMO2_ASSETS.homeFilter}
            alt=""
            className="size-3.5 shrink-0"
            draggable={false}
          />
          Filter
        </button>

        <div
          className={cn(
            "absolute left-0 top-full z-20 pt-1 transition-opacity duration-150 ease-out",
            filterMenuHover.open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <div className="relative w-[140px] overflow-visible rounded-[12px] border border-solid border-[#f7f7f7] bg-white p-1 drop-shadow-[0px_1px_2px_rgba(34,34,34,0.05)]">
            {DEMO2_FILTER_OPTIONS.map((option) => (
              <HomeFilterMenuRow
                key={option.label}
                option={option}
                onSelect={handleManualAdd}
                onFundingRoundSelect={handleFundingRoundSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {chips.length > 0 ? (
        <>
          <div className="h-3 w-px shrink-0 self-center bg-[#e8e8e8]" aria-hidden />

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[2px] gap-y-[6px]">
            <AnimatePresence initial={false} mode="popLayout">
              {chips.map((chip) => (
                <motion.div
                  key={chip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex"
                >
                  <HomeFilterChip
                    item={chip}
                    onRemove={() => handleRemoveChip(chip.condition.attribute)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      ) : null}
    </div>
  )
}
