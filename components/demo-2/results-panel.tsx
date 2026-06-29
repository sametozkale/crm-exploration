"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { DEMO2_ASSETS, DEMO2_TOOLBAR_PILL } from "./demo-2-assets"
import { DEMO2_SIZES } from "./demo-2-tokens"
import { cn } from "@/lib/utils"
import { DEMO2_COMPANIES, type Demo2Company } from "./demo-2-data"
import { ScoreBar } from "./score-bar"
import { AnimatedSourceDotGrid } from "./animated-source-dot-grid"
import { DEMO2_RESULTS_ENTRANCE } from "./demo-2-motion"
import { ResultsNoMatchEmpty } from "./results-no-match-empty"
import { ResultsNoMatchTemplates } from "./results-no-match-templates"
import { DEMO2_SOURCE_TAB_POPOVERS } from "./demo-2-source-tab-data"
import { SourceTabPopover } from "./source-tab-popover"

const SOURCE_TABS = [
  {
    id: "source1",
    label: "Source 1",
    avatars: [
      { src: DEMO2_ASSETS.tabSource1a, rounded: true },
      { src: DEMO2_ASSETS.tabSource1b, rounded: true },
      { src: DEMO2_ASSETS.tabSource1c, rounded: false },
    ],
  },
  {
    id: "source2",
    label: "Source 2",
    avatars: [
      { src: DEMO2_ASSETS.tabSource2a, rounded: true },
      { src: DEMO2_ASSETS.tabSource2b, rounded: false },
      { src: DEMO2_ASSETS.tabSource2c, rounded: true },
    ],
  },
  { id: "web", label: "Web search", icon: DEMO2_ASSETS.tabWebSearch },
] as const

const SOURCE_TAB_BUTTON_CLASS = cn(
  DEMO2_TOOLBAR_PILL,
  "group flex items-center gap-[6px] px-2 py-[6px] transition-[background-color,border-color,box-shadow,color] duration-150 ease-out hover:border-[#ddd] hover:bg-[#fdfdfd] hover:shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)]",
)

/** Figma 127:43524 — source tabs while results are loading */
const SCANNING_SOURCE_TABS = [
  { id: "lucy", label: "Lucy", variant: 0 },
  { id: "marius", label: "Marius", variant: 1 },
  { id: "nick", label: "Nick", variant: 0, rotate: true },
] as const

function ScanningSourceTab({
  label,
  variant,
  rotate,
}: {
  label: string
  variant: 0 | 1
  rotate?: boolean
}) {
  return (
    <div
      className={cn(
        DEMO2_TOOLBAR_PILL,
        "flex shrink-0 items-center gap-[6px] px-2 py-[6px]",
      )}
      style={{ height: DEMO2_SIZES.tabHeight }}
    >
      <span className="relative flex size-4 shrink-0 items-center justify-center overflow-hidden">
        <AnimatedSourceDotGrid variant={variant} rotate={rotate} />
      </span>
      <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#646464]">
        {label}
      </span>
    </div>
  )
}

const COLUMNS = [
  { key: "select", label: "", width: 40, stickyLeft: 0 },
  { key: "company", label: "Company", width: 200, stickyLeft: 40 },
  { key: "industry", label: "Industry", width: 200 },
  { key: "founded", label: "Founded year", width: 100 },
  { key: "employees", label: "Employee amount", width: 140 },
  { key: "location", label: "Location", width: 200 },
  { key: "score", label: "Score", width: 200 },
  { key: "website", label: "Website URL", width: 200 },
  { key: "description", label: "Description", width: 400 },
  { key: "funding", label: " Last funding type", width: 200, headerIcon: true },
  { key: "contacts", label: " Contacts", width: 200, headerIcon: true },
  { key: "jobs", label: " Jobs", width: 200, headerIcon: true },
  { key: "stickyPad", label: "", width: 42 },
] as const

/** Figma 219:17246 — columns while no rows are revealed yet */
const SCANNING_COLUMNS = [
  { key: "select", label: "", width: 40, stickyLeft: 0 },
  { key: "company", label: "Company", width: 200, stickyLeft: 40 },
  { key: "industry", label: "Industry", width: 200 },
  { key: "founded", label: "Founded year", width: 100 },
  { key: "employees", label: "Employee amount", width: 140 },
  { key: "location", label: "Location", width: 200 },
  { key: "website", label: "Website URL", width: 200 },
  { key: "description", label: "Description", width: 400 },
  { key: "funding", label: " Last funding type", width: 200, headerIcon: true },
  { key: "fundingDate", label: " Last funding date", width: 200, headerIcon: true },
  { key: "contacts", label: " Contacts", width: 200, headerIcon: true },
  { key: "jobs", label: " Jobs", width: 200, headerIcon: true },
  { key: "stickyPad", label: "", width: 42 },
] as const

const SCANNING_SKELETON_ROWS = 5
const MAX_PREVIEW_SKELETON_ROWS = 5

function getSkeletonRowOpacity(skeletonIndex: number, skeletonCount: number) {
  if (skeletonCount <= 1) return 1
  const minOpacity = 0.35
  return 1 - (skeletonIndex / (skeletonCount - 1)) * (1 - minOpacity)
}

type ResultsColumn = (typeof COLUMNS)[number] | (typeof SCANNING_COLUMNS)[number]

function SourceAvatarStack({
  avatars,
}: {
  avatars: readonly { src: string; rounded: boolean }[]
}) {
  return (
    <div className="relative h-4 w-8 shrink-0">
      {avatars.map((avatar, i) => (
        <img
          key={avatar.src}
          src={avatar.src}
          alt=""
          className={cn(
            "absolute top-0 size-4 object-cover",
            avatar.rounded && "rounded-[2px]",
          )}
          style={{
            left: i * 8,
            zIndex: avatars.length - i,
          }}
        />
      ))}
    </div>
  )
}

function SourceTabButton({
  tab,
  hovered,
  onHoverChange,
}: {
  tab: (typeof SOURCE_TABS)[number]
  hovered: boolean
  onHoverChange: (open: boolean) => void
}) {
  const popover = tab.id in DEMO2_SOURCE_TAB_POPOVERS
    ? DEMO2_SOURCE_TAB_POPOVERS[tab.id]
    : undefined

  return (
    <div
      className="relative"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <button
        type="button"
        className={cn(
          SOURCE_TAB_BUTTON_CLASS,
          hovered &&
            "border-[#ddd] bg-[#fdfdfd] shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)]",
        )}
      >
        {"avatars" in tab ? (
          <SourceAvatarStack avatars={tab.avatars} />
        ) : (
          <span className="relative size-4 shrink-0 overflow-hidden">
            <img src={tab.icon} alt="" className="block size-full max-w-none" />
          </span>
        )}
        <span
          className={cn(
            "text-[12px] leading-4 tracking-[-0.12px] text-[#646464] transition-colors duration-150 ease-out group-hover:text-[#323232]",
            hovered && "text-[#323232]",
          )}
        >
          {tab.label}
        </span>
      </button>

      {hovered && popover ? (
        <SourceTabPopover
          title={tab.label}
          data={popover}
          className="absolute left-0 top-[calc(100%+3px)] z-50"
        />
      ) : null}
    </div>
  )
}

function ToolbarPill({
  className,
  style,
  children,
  label,
  ...props
}: React.ComponentProps<"button"> & {
  label?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(DEMO2_TOOLBAR_PILL, className)}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}

const SEARCH_PILL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

const TOOLBAR_ACTION_LABEL_CLASS =
  "text-[13px] font-medium leading-[14px] tracking-[-0.13px] text-[#646464]"

function ToolbarActionIcon({ src }: { src: string }) {
  return (
    <span className="relative size-3 shrink-0 overflow-hidden">
      <img src={src} alt="" className="block size-full max-w-none" />
    </span>
  )
}

/** Figma 129:72523 — icon-only at rest; expands on hover; click opens title search. */
function SearchToolbarPill({
  value,
  onChange,
  active,
  onActiveChange,
  disabled,
  lockActive = false,
}: {
  value: string
  onChange: (value: string) => void
  active: boolean
  onActiveChange: (active: boolean) => void
  disabled?: boolean
  lockActive?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()
  const hoverExpanded = reduceMotion

  useEffect(() => {
    if (active) inputRef.current?.focus()
  }, [active])

  const pillClass = cn(
    DEMO2_TOOLBAR_PILL,
    "group/search-pill overflow-hidden transition-[width,gap] duration-[250ms]",
    disabled && "pointer-events-none opacity-60",
    active || hoverExpanded
      ? "flex w-[148px] items-center justify-start gap-[6px]"
      : cn(
          "group flex w-10 items-center justify-center gap-0",
          "hover:w-[148px] hover:justify-start hover:gap-[6px]",
        ),
  )

  const pillStyle = { transitionTimingFunction: SEARCH_PILL_EASE }

  const searchIcon = (
    <span className="relative size-[14px] shrink-0 overflow-hidden">
      <img src={DEMO2_ASSETS.toolbarSearch} alt="" className="block size-full max-w-none" />
    </span>
  )

  if (active) {
    const hasValue = value.trim().length > 0

    return (
      <div className={pillClass} style={pillStyle}>
        {searchIcon}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              if (lockActive) return
              onChange("")
              onActiveChange(false)
            }
          }}
          onBlur={() => {
            if (!lockActive && !value.trim()) onActiveChange(false)
          }}
          placeholder="Search"
          aria-label="Search companies by title"
          className="min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-4 tracking-[-0.14px] text-[#646464] outline-none placeholder:text-[#aaa]"
        />
        {hasValue ? (
          <button
            type="button"
            aria-label="Clear search"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("")
              inputRef.current?.focus()
            }}
            className={cn(
              "flex size-[14px] shrink-0 items-center justify-center transition-opacity duration-150 ease-out",
              "pointer-events-none opacity-0",
              "group-hover/search-pill:pointer-events-auto group-hover/search-pill:opacity-100",
              "group-focus-within/search-pill:pointer-events-auto group-focus-within/search-pill:opacity-100",
              "hover:opacity-70",
            )}
          >
            <img
              src={DEMO2_ASSETS.toolbarSearchClear}
              alt=""
              className="block size-full max-w-none"
              draggable={false}
            />
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <button
      type="button"
      aria-label="Search"
      disabled={disabled}
      onClick={() => onActiveChange(true)}
      className={pillClass}
      style={pillStyle}
    >
      {searchIcon}
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-[14px] font-normal leading-4 tracking-[-0.14px] text-[#aaa]",
          hoverExpanded
            ? "max-w-[80px] opacity-100"
            : cn(
                "max-w-0 opacity-0 transition-[max-width,opacity] duration-[250ms]",
                "group-hover:max-w-[80px] group-hover:opacity-100",
                "group-focus-visible:max-w-[80px] group-focus-visible:opacity-100",
              ),
        )}
        style={hoverExpanded ? undefined : { transitionTimingFunction: SEARCH_PILL_EASE }}
        aria-hidden
      >
        Search
      </span>
    </button>
  )
}

function PublicToggle({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-[#00cd71]" : "bg-[#e5e5e5]",
      )}
      aria-hidden
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-3 rounded-full bg-white shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] transition-transform duration-200",
          checked && "translate-x-3",
        )}
      />
    </span>
  )
}

function GrowthCell({ employees, growth }: { employees: number; growth: number }) {
  const positive = growth >= 0
  return (
    <div className="flex h-9 w-full items-center px-[10px]">
      <span className="text-[13px] leading-none text-[#646464] tabular-nums">{employees}</span>
      <span
        className={cn(
          "ml-auto text-[12px] leading-none tabular-nums",
          positive ? "text-[#218358]" : "text-[#ca244d]",
        )}
      >
        {positive ? `${growth}%` : `-${Math.abs(growth)}%`}
      </span>
    </div>
  )
}

function TableHeaderIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-[#838383]" aria-hidden>
      <path
        d="M2 3h8M2 6h8M2 9h5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FindActionCell({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-9 w-full cursor-pointer items-center gap-[5px] px-[10px] text-left"
    >
      <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-[#cecece]" aria-hidden>
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="whitespace-nowrap text-[13px] leading-9 text-[#cecece]">{label}</span>
    </button>
  )
}

function FundingPill({ label }: { label: string }) {
  return (
    <div className="flex h-9 items-center px-[10px]">
      <span className="rounded-[10px] border border-solid border-[#f4f4f4] py-px pl-[7px] pr-[9px] text-[13px] font-medium leading-6 text-[#202020]">
        {label}
      </span>
    </div>
  )
}

function CompanyLogo({ company }: { company: Demo2Company }) {
  if (company.logoUrl) {
    return (
      <span className="relative size-4 shrink-0 overflow-hidden rounded-[6.4px]">
        <img
          src={company.logoUrl}
          alt=""
          className="pointer-events-none size-full max-w-none rounded-[6.4px] object-contain"
        />
      </span>
    )
  }

  if (company.domain) {
    return (
      <span className="relative size-4 shrink-0 overflow-hidden rounded-[6.4px] bg-white">
        <img
          src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`}
          alt=""
          className="pointer-events-none size-full max-w-none rounded-[6.4px] object-contain"
        />
      </span>
    )
  }

  return (
    <span
      className="size-4 shrink-0 rounded-[6.4px]"
      style={{
        background: `linear-gradient(135deg, hsl(${company.logoHue ?? 210} 70% 72%), hsl(${(company.logoHue ?? 210) + 25} 60% 58%))`,
      }}
    />
  )
}

function GridCell({
  width,
  stickyLeft,
  stickyTop = false,
  className,
  children,
}: {
  width: number
  stickyLeft?: number
  stickyTop?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "demo2-grid-cell shrink-0 border-r border-solid border-[#f4f4f4] bg-white pr-px",
        (stickyLeft !== undefined || stickyTop) && "sticky",
        stickyTop && "top-0",
        stickyLeft !== undefined && (stickyTop ? "z-[4]" : "z-[2]"),
        className,
      )}
      style={{
        width,
        ...(stickyLeft !== undefined ? { left: stickyLeft } : {}),
      }}
    >
      {children}
    </div>
  )
}

function CellText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "truncate px-[10px] text-[13px] leading-9 text-[#646464]",
        className,
      )}
    >
      {children}
    </p>
  )
}

function RowCheckbox({
  checked,
  indeterminate = false,
  onChange,
  className,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  className?: string
}) {
  const active = checked || indeterminate

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      data-checked={active ? "" : undefined}
      data-indeterminate={indeterminate ? "" : undefined}
      onClick={(event) => {
        event.stopPropagation()
        onChange()
      }}
      className={cn(
        "flex size-4 cursor-pointer items-center justify-center rounded-[6px] border border-solid transition-colors",
        active ? "border-[#0090ff] bg-[#0090ff]" : "border-[#e0e0e0] bg-white",
        className,
      )}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="size-2.5 text-white" aria-hidden>
          <path
            d="M2.5 6 5 8.5 9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : indeterminate ? (
        <span className="h-px w-2 rounded-full bg-white" aria-hidden />
      ) : null}
    </button>
  )
}

/** Figma 93:21587 — skeleton bar widths per column. */
const SKELETON_BAR_WIDTHS = {
  company: 96,
  industry: 109,
  founded: 48,
  employees: 65,
  location: 123,
  website: 146,
  description: 233,
} as const

function SkeletonCheckbox() {
  return (
    <span
      className="size-4 shrink-0 rounded-[6px] border border-solid border-[#e0e0e0] bg-white"
      aria-hidden
    />
  )
}

function SkeletonBar({
  width,
  delayMs = 0,
  className,
}: {
  width: number
  delayMs?: number
  className?: string
}) {
  return (
    <div className={cn("flex h-9 items-center px-[10px]", className)}>
      <div
        className="demo2-skeleton-bar h-3 shrink-0 rounded-full"
        style={{ width, animationDelay: `${delayMs}ms` }}
      />
    </div>
  )
}

function SkeletonCompanyCell({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <div className="flex h-9 items-center px-[10px]">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="demo2-skeleton-bar size-4 shrink-0 rounded-full"
          style={{ animationDelay: `${delayMs}ms` }}
        />
        <span
          className="demo2-skeleton-bar h-3 shrink-0 rounded-full"
          style={{
            width: SKELETON_BAR_WIDTHS.company,
            animationDelay: `${delayMs + 40}ms`,
          }}
        />
      </div>
    </div>
  )
}

function SkeletonScoreBar({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <div className="flex h-9 items-center px-[10px]">
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="demo2-skeleton-bar h-[5px] w-4 shrink-0 rounded-full"
            style={{ animationDelay: `${delayMs + i * 60}ms` }}
          />
        ))}
      </div>
      <span
        className="demo2-skeleton-bar ml-2 h-3 w-6 shrink-0 rounded-full"
        style={{ animationDelay: `${delayMs + 300}ms` }}
      />
    </div>
  )
}

function TableSkeletonRow({
  rowIndex = 0,
  scanning = false,
  opacity = 1,
}: {
  rowIndex?: number
  scanning?: boolean
  opacity?: number
}) {
  const baseDelay = rowIndex * 80

  if (scanning) {
    return (
      <div
        className="demo2-table-row flex border-b border-solid border-[#f4f4f4] bg-white transition-opacity duration-300"
        style={{ opacity }}
      >
        <GridCell width={40} stickyLeft={0}>
          <div className="flex h-9 items-center justify-center">
            <SkeletonCheckbox />
          </div>
        </GridCell>
        <GridCell width={200} stickyLeft={40}>
          <SkeletonCompanyCell delayMs={baseDelay} />
        </GridCell>
        <GridCell width={200}>
          <SkeletonBar width={SKELETON_BAR_WIDTHS.industry} delayMs={baseDelay + 40} />
        </GridCell>
        <GridCell width={100}>
          <SkeletonBar width={SKELETON_BAR_WIDTHS.founded} delayMs={baseDelay + 80} />
        </GridCell>
        <GridCell width={140}>
          <SkeletonBar width={SKELETON_BAR_WIDTHS.employees} delayMs={baseDelay + 120} />
        </GridCell>
        <GridCell width={200}>
          <SkeletonBar width={SKELETON_BAR_WIDTHS.location} delayMs={baseDelay + 160} />
        </GridCell>
        <GridCell width={200}>
          <SkeletonBar width={SKELETON_BAR_WIDTHS.website} delayMs={baseDelay + 200} />
        </GridCell>
        <GridCell width={400}>
          <SkeletonBar width={SKELETON_BAR_WIDTHS.description} delayMs={baseDelay + 240} />
        </GridCell>
        <GridCell width={200}>
          <div className="h-9" />
        </GridCell>
        <GridCell width={200}>
          <div className="h-9" />
        </GridCell>
        <GridCell width={200}>
          <div className="h-9" />
        </GridCell>
        <GridCell width={200}>
          <div className="h-9" />
        </GridCell>
        <GridCell width={42} className="border-r-0" />
      </div>
    )
  }

  return (
    <div
      className="demo2-table-row flex border-b border-solid border-[#f4f4f4] bg-white transition-opacity duration-300"
      style={{ opacity }}
    >
      <GridCell width={40} stickyLeft={0}>
        <div className="flex h-9 items-center justify-center">
          <SkeletonCheckbox />
        </div>
      </GridCell>
      <GridCell width={200} stickyLeft={40}>
        <SkeletonCompanyCell delayMs={baseDelay} />
      </GridCell>
      <GridCell width={200}>
        <SkeletonBar width={SKELETON_BAR_WIDTHS.industry} delayMs={baseDelay + 40} />
      </GridCell>
      <GridCell width={100}>
        <SkeletonBar width={SKELETON_BAR_WIDTHS.founded} delayMs={baseDelay + 80} />
      </GridCell>
      <GridCell width={140}>
        <SkeletonBar width={SKELETON_BAR_WIDTHS.employees} delayMs={baseDelay + 120} />
      </GridCell>
      <GridCell width={200}>
        <SkeletonBar width={SKELETON_BAR_WIDTHS.location} delayMs={baseDelay + 160} />
      </GridCell>
      <GridCell width={200}>
        <SkeletonScoreBar delayMs={baseDelay + 200} />
      </GridCell>
      <GridCell width={200}>
        <SkeletonBar width={SKELETON_BAR_WIDTHS.website} delayMs={baseDelay + 240} />
      </GridCell>
      <GridCell width={400}>
        <SkeletonBar width={SKELETON_BAR_WIDTHS.description} delayMs={baseDelay + 280} />
      </GridCell>
      <GridCell width={200}>
        <div className="h-9" />
      </GridCell>
      <GridCell width={200}>
        <div className="h-9" />
      </GridCell>
      <GridCell width={200}>
        <div className="h-9" />
      </GridCell>
      <GridCell width={42} className="border-r-0" />
    </div>
  )
}

function TableRow({
  company,
  selected,
  onToggleSelect,
}: {
  company: Demo2Company
  selected: boolean
  onToggleSelect: () => void
}) {
  return (
    <div className="group/row demo2-table-row flex border-b border-solid border-[#f4f4f4] bg-white">
      <GridCell width={40} stickyLeft={0}>
        <div className="flex h-9 items-center justify-center">
          <RowCheckbox
            checked={selected}
            onChange={onToggleSelect}
            className="demo2-row-checkbox"
          />
        </div>
      </GridCell>
      <GridCell width={200} stickyLeft={40}>
        <div className="flex h-9 items-center justify-between px-[10px]">
          <div className="flex min-w-0 items-center gap-[8px]">
            <CompanyLogo company={company} />
            <span className="truncate text-[13px] font-medium leading-9 text-[#202020]">
              {company.name}
            </span>
          </div>
          <button
            type="button"
            className="flex w-[47px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-solid border-[#f4f4f4] bg-white px-2 py-[5px] text-[11px] font-medium leading-3 tracking-[0.11px] text-[#969696] opacity-0 shadow-[0px_1px_2px_rgba(34,34,34,0.05)] group-hover/row:opacity-100"
          >
            OPEN
          </button>
        </div>
      </GridCell>
      <GridCell width={200}>
        <CellText>{company.industry}</CellText>
      </GridCell>
      <GridCell width={100}>
        <CellText className="tabular-nums">{company.foundedYear ?? ""}</CellText>
      </GridCell>
      <GridCell width={140}>
        <GrowthCell employees={company.employees} growth={company.headcountGrowth} />
      </GridCell>
      <GridCell width={200}>
        <CellText>{company.location}</CellText>
      </GridCell>
      <GridCell width={200}>
        <div className="flex h-9 items-center pl-[10px] pr-[11px]">
          <ScoreBar score={company.score} />
        </div>
      </GridCell>
      <GridCell width={200}>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate px-[10px] text-[13px] leading-9 text-[#0d74ce] no-underline"
        >
          {company.website}
        </a>
      </GridCell>
      <GridCell width={400}>
        <CellText>{company.description ?? ""}</CellText>
      </GridCell>
      <GridCell width={200}>
        {company.lastFundingType ? <FundingPill label={company.lastFundingType} /> : null}
      </GridCell>
      <GridCell width={200}>
        <FindActionCell label=" Find contacts" />
      </GridCell>
      <GridCell width={200}>
        <FindActionCell label=" Find jobs" />
      </GridCell>
      <GridCell width={42} className="border-r-0" />
    </div>
  )
}

const RESULTS_STAGGER_EASE = [0.22, 1, 0.36, 1] as const

function TableHeader({
  columns,
  scanning,
  allSelected,
  someSelected,
  onToggleAll,
}: {
  columns: readonly ResultsColumn[]
  scanning?: boolean
  allSelected: boolean
  someSelected: boolean
  onToggleAll: () => void
}) {
  return (
    <div
      className={cn(
        "demo2-table-header sticky top-0 z-[3] flex border-t border-b border-solid border-[#f4f4f4] bg-white pt-px",
      )}
    >
      {columns.map((col) => (
        <GridCell
          key={col.key}
          width={col.width}
          stickyTop
          stickyLeft={"stickyLeft" in col ? col.stickyLeft : undefined}
          className={col.key === "stickyPad" ? "border-r-0" : undefined}
        >
          {col.key === "select" ? (
            <div className="demo2-select-header flex h-9 items-center justify-center">
              {scanning ? (
                <SkeletonCheckbox />
              ) : (
                <RowCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onToggleAll}
                  className="demo2-header-checkbox"
                />
              )}
            </div>
          ) : col.key === "stickyPad" ? (
            <div className="h-9" />
          ) : "headerIcon" in col && col.headerIcon ? (
            <div className="flex h-9 items-center gap-[6px] px-[10px]">
              <TableHeaderIcon />
              <p className="whitespace-nowrap text-[12px] leading-9 text-[#838383]">
                {col.label}
              </p>
            </div>
          ) : (
            <p className="px-[10px] text-[12px] leading-9 text-[#838383]">{col.label}</p>
          )}
        </GridCell>
      ))}
    </div>
  )
}

function ScanningToolbar({
  titleSearchOpen,
  titleSearchQuery,
  onTitleSearchOpenChange,
  onTitleSearchQueryChange,
}: {
  titleSearchOpen: boolean
  titleSearchQuery: string
  onTitleSearchOpenChange: (open: boolean) => void
  onTitleSearchQueryChange: (query: string) => void
}) {
  return (
    <div className="flex h-[68px] shrink-0 items-center gap-2 border-x border-[#f4f4f4] bg-white px-5 pt-5 pb-4">
      <SearchToolbarPill
        value={titleSearchQuery}
        onChange={onTitleSearchQueryChange}
        active={titleSearchOpen}
        onActiveChange={onTitleSearchOpenChange}
        disabled
      />

      <ToolbarPill className="pr-2" label="Filter">
        <ToolbarActionIcon src={DEMO2_ASSETS.toolbarFilter} />
        <span className={TOOLBAR_ACTION_LABEL_CLASS}>Filter</span>
        <span className="flex h-[18px] w-[19px] shrink-0 flex-col items-center justify-center rounded-[6px] bg-[rgba(0,144,255,0.1)] px-[6px] py-[2px] text-[13px] leading-[14px] tracking-[0.13px] text-[#0090ff]">
          3
        </span>
      </ToolbarPill>

      <ToolbarPill label="Public" aria-pressed disabled>
        <span className={TOOLBAR_ACTION_LABEL_CLASS}>Public</span>
        <PublicToggle checked />
      </ToolbarPill>

      <div className="ml-auto flex items-center gap-2">
        <ToolbarPill label="Find similars">
          <ToolbarActionIcon src={DEMO2_ASSETS.toolbarFindSimilars} />
          <span className={cn("shrink-0 whitespace-nowrap", TOOLBAR_ACTION_LABEL_CLASS)}>
            Find similars
          </span>
        </ToolbarPill>
        <ToolbarPill label="Review">
          <ToolbarActionIcon src={DEMO2_ASSETS.toolbarReview} />
          <span className={TOOLBAR_ACTION_LABEL_CLASS}>Review</span>
        </ToolbarPill>
      </div>
    </div>
  )
}

function ResultsSelectionActions({ count }: { count: number }) {
  return (
    <div className="ml-auto flex items-center gap-3 rounded-[10px] bg-[#f9f9f9] py-[2px] pl-3 pr-[2px]">
      <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#777]">
        {count} selected
      </span>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-[6px] rounded-[8px] bg-[#323232] px-2 py-[7px] transition-colors hover:bg-[#2a2a2a]"
      >
        <img
          src={DEMO2_ASSETS.resultsAddToList}
          alt=""
          className="size-3 shrink-0"
          draggable={false}
        />
        <span className="text-[13px] font-medium leading-[14px] tracking-[-0.13px] text-white">
          Add to list
        </span>
      </button>
    </div>
  )
}

function ResultsToolbar({
  isPublic,
  onTogglePublic,
  titleSearchOpen,
  titleSearchQuery,
  onTitleSearchOpenChange,
  onTitleSearchQueryChange,
  selectedCount,
}: {
  isPublic: boolean
  onTogglePublic: () => void
  titleSearchOpen: boolean
  titleSearchQuery: string
  onTitleSearchOpenChange: (open: boolean) => void
  onTitleSearchQueryChange: (query: string) => void
  selectedCount: number
}) {
  const hasSelection = selectedCount > 0
  const searchActive = hasSelection || titleSearchOpen

  return (
    <div className="flex h-[68px] shrink-0 items-center gap-2 border-x border-[#f4f4f4] bg-white px-5 pt-5 pb-4">
      <SearchToolbarPill
        value={titleSearchQuery}
        onChange={onTitleSearchQueryChange}
        active={searchActive}
        onActiveChange={(open) => {
          if (!hasSelection) onTitleSearchOpenChange(open)
        }}
        lockActive={hasSelection}
      />

      {hasSelection ? (
        <ResultsSelectionActions count={selectedCount} />
      ) : (
        <>
          <ToolbarPill className="pr-2" label="Filter">
            <ToolbarActionIcon src={DEMO2_ASSETS.toolbarFilter} />
            <span className={TOOLBAR_ACTION_LABEL_CLASS}>Filter</span>
            <span className="flex h-[18px] w-[19px] shrink-0 flex-col items-center justify-center rounded-[6px] bg-[rgba(0,144,255,0.1)] px-[6px] py-[2px] text-[13px] leading-[14px] tracking-[0.13px] text-[#0090ff]">
              3
            </span>
          </ToolbarPill>

          <ToolbarPill
            label="Toggle public visibility"
            aria-pressed={isPublic}
            onClick={onTogglePublic}
          >
            <span className={TOOLBAR_ACTION_LABEL_CLASS}>Public</span>
            <PublicToggle checked={isPublic} />
          </ToolbarPill>

          <div className="ml-auto flex items-center gap-2">
            <ToolbarPill label="Find similars">
              <ToolbarActionIcon src={DEMO2_ASSETS.toolbarFindSimilars} />
              <span className={cn("shrink-0 whitespace-nowrap", TOOLBAR_ACTION_LABEL_CLASS)}>
                Find similars
              </span>
            </ToolbarPill>
            <ToolbarPill label="Review">
              <ToolbarActionIcon src={DEMO2_ASSETS.toolbarReview} />
              <span className={TOOLBAR_ACTION_LABEL_CLASS}>Review</span>
            </ToolbarPill>
          </div>
        </>
      )}
    </div>
  )
}

function ResultsSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.42, delay, ease: RESULTS_STAGGER_EASE }
      }
    >
      {children}
    </motion.div>
  )
}

export function Demo2ResultsPanel({
  prompt: _prompt,
  openFilters: _openFilters,
  visibleRowCount,
  isSearchRunning = false,
  hasMatchingResults = true,
  onStartNewSearch,
}: {
  prompt?: string
  openFilters?: boolean
  /** How many table rows show real data (rest are skeletons). */
  visibleRowCount?: number
  isSearchRunning?: boolean
  hasMatchingResults?: boolean
  onStartNewSearch?: () => void
} = {}) {
  const [isPublic, setIsPublic] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [titleSearchOpen, setTitleSearchOpen] = useState(false)
  const [titleSearchQuery, setTitleSearchQuery] = useState("")
  const [hoveredSourceTabId, setHoveredSourceTabId] = useState<string | null>(null)

  const normalizedTitleQuery = titleSearchQuery.trim().toLowerCase()
  const matchesTitleSearch = (company: Demo2Company) =>
    !normalizedTitleQuery || company.name.toLowerCase().includes(normalizedTitleQuery)

  const allSelected =
    DEMO2_COMPANIES.length > 0 &&
    DEMO2_COMPANIES.every((company) => selectedIds.has(company.id))
  const someSelected = selectedIds.size > 0 && !allSelected

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const isAllSelected =
        DEMO2_COMPANIES.length > 0 &&
        DEMO2_COMPANIES.every((company) => prev.has(company.id))
      if (isAllSelected) return new Set()
      return new Set(DEMO2_COMPANIES.map((company) => company.id))
    })
  }

  const revealedCount =
    visibleRowCount ?? (isSearchRunning ? 0 : DEMO2_COMPANIES.length)
  const showScanningShell = isSearchRunning && revealedCount === 0
  const showNoMatchEmpty =
    !isSearchRunning && !hasMatchingResults && revealedCount === 0
  const activeColumns = showScanningShell ? SCANNING_COLUMNS : COLUMNS
  const tableMinWidth = showScanningShell
    ? DEMO2_SIZES.scanningTableMinWidth
    : DEMO2_SIZES.tableMinWidth
  const sourcePopoverOpen =
    hoveredSourceTabId !== null && hoveredSourceTabId in DEMO2_SOURCE_TAB_POPOVERS
  const totalCompanies = DEMO2_COMPANIES.length
  const previewSkeletonCount =
    !showScanningShell && revealedCount < totalCompanies - MAX_PREVIEW_SKELETON_ROWS
      ? Math.min(MAX_PREVIEW_SKELETON_ROWS, totalCompanies - revealedCount)
      : 0

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#fafafa] pl-0 pr-2"
    >
      <ResultsSection delay={DEMO2_RESULTS_ENTRANCE.sourceTabs}>
        <div
          className={cn("mb-2 flex items-center gap-1", sourcePopoverOpen && "relative z-50")}
        >
          {showScanningShell
            ? SCANNING_SOURCE_TABS.map((tab) => (
                <ScanningSourceTab
                  key={tab.id}
                  label={tab.label}
                  variant={tab.variant}
                  rotate={"rotate" in tab ? tab.rotate : false}
                />
              ))
            : SOURCE_TABS.map((tab) => (
                <SourceTabButton
                  key={tab.id}
                  tab={tab}
                  hovered={hoveredSourceTabId === tab.id}
                  onHoverChange={(open) =>
                    setHoveredSourceTabId(open ? tab.id : null)
                  }
                />
              ))}
        </div>
      </ResultsSection>

      <div className="demo2-results-surface relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-2xl border-t border-[#f4f4f4] bg-white">
        <ResultsSection delay={DEMO2_RESULTS_ENTRANCE.toolbar}>
          {showScanningShell ? (
            <ScanningToolbar
              titleSearchOpen={titleSearchOpen}
              titleSearchQuery={titleSearchQuery}
              onTitleSearchOpenChange={setTitleSearchOpen}
              onTitleSearchQueryChange={setTitleSearchQuery}
            />
          ) : (
            <ResultsToolbar
              isPublic={isPublic}
              onTogglePublic={() => setIsPublic((value) => !value)}
              titleSearchOpen={titleSearchOpen}
              titleSearchQuery={titleSearchQuery}
              onTitleSearchOpenChange={setTitleSearchOpen}
              onTitleSearchQueryChange={setTitleSearchQuery}
              selectedCount={selectedIds.size}
            />
          )}
        </ResultsSection>

        <ResultsSection
          delay={DEMO2_RESULTS_ENTRANCE.table}
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col transition-opacity duration-150",
            hoveredSourceTabId !== null && "opacity-25",
          )}
        >
          {showNoMatchEmpty ? (
            <div className="demo2-results-table relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-x border-[#f4f4f4] bg-white">
              <div className="min-w-0 shrink-0 overflow-x-auto px-5">
                <div style={{ minWidth: tableMinWidth }}>
                  <TableHeader
                    columns={activeColumns}
                    scanning={false}
                    allSelected={allSelected}
                    someSelected={someSelected}
                    onToggleAll={toggleAll}
                  />
                </div>
              </div>

              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6 pb-[210px] pt-2">
                  <ResultsNoMatchEmpty onStartNewSearch={onStartNewSearch ?? (() => {})} />
                </div>
              </div>
            </div>
          ) : (
          <div
            className="demo2-results-table relative flex min-h-0 flex-1 flex-col overflow-auto border-x border-[#f4f4f4] bg-white"
          >
            <div className="relative flex min-h-0 flex-col bg-white px-5 pb-12">
              <div
                className="demo2-results-table-body relative flex min-h-0 flex-1 flex-col bg-white"
                style={{ minWidth: tableMinWidth }}
              >
                <TableHeader
                  columns={activeColumns}
                  scanning={showScanningShell}
                  allSelected={allSelected}
                  someSelected={someSelected}
                  onToggleAll={toggleAll}
                />
                {showScanningShell
                  ? Array.from({ length: SCANNING_SKELETON_ROWS }, (_, index) => (
                      <TableSkeletonRow
                        key={index}
                        rowIndex={index}
                        scanning
                        opacity={getSkeletonRowOpacity(index, SCANNING_SKELETON_ROWS)}
                      />
                    ))
                  : (
                    <>
                      {DEMO2_COMPANIES.map((company, index) => {
                        const isRevealed = index < revealedCount
                        if (!isRevealed) {
                          return null
                        }
                        if (!matchesTitleSearch(company)) {
                          return null
                        }

                        return (
                          <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.32, ease: RESULTS_STAGGER_EASE }}
                          >
                            <TableRow
                              company={company}
                              selected={selectedIds.has(company.id)}
                              onToggleSelect={() => toggleRow(company.id)}
                            />
                          </motion.div>
                        )
                      })}
                      {Array.from({ length: previewSkeletonCount }, (_, index) => (
                        <TableSkeletonRow
                          key={`preview-skeleton-${revealedCount + index}`}
                          rowIndex={index}
                          opacity={getSkeletonRowOpacity(index, previewSkeletonCount)}
                        />
                      ))}
                    </>
                  )}
              </div>
            </div>
          </div>
          )}
        </ResultsSection>

        {showNoMatchEmpty ? (
          <div className="pointer-events-none absolute bottom-5 left-5 right-0 z-20 min-w-0">
            <div className="pointer-events-auto">
              <ResultsNoMatchTemplates />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
