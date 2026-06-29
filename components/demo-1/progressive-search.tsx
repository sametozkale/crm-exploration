"use client"

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { AnimatePresence, motion, LayoutGroup } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  DollarCircle,
  Info,
  MapPin,
  ScanSearch,
  Search,
  SearchX,
  Sparkle,
  Tag,
  Target,
  TrendUp,
  EditPrompt,
  MagicWand,
  Undo2,
  Users,
  X,
} from "@/components/icons"
import { AppSidebar } from "@/components/app-sidebar"
import { AttioFilterBuilder } from "./attio-filter-builder"
import { SavedSearchesPanel } from "@/components/lead-search-filters"
import {
  SmartPromptInput,
  type SmartPromptHandle,
} from "./smart-prompt-input"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  COMPANIES,
  icpFitFromScore,
  icpFitLabel,
  type Company,
  type IcpFit,
  type Tier,
} from "@/lib/data"
import { isPromptRelevant } from "@/lib/prompt-match"
import {
  applyFilterQuery,
  createEmptyQuery,
  flattenFilterChipsFromQuery,
  hasFilterConditions,
  type FilterQuery,
} from "@/lib/filter-query"
import type { AttributeSlug } from "@/lib/filter-attributes"
import {
  inferFiltersFromPrompt,
  syncPromptFiltersInQuery,
} from "@/lib/prompt-filters"
import {
  fromLegacyFilters,
  toLegacyHints,
  type LegacyFilterHints,
} from "@/lib/search-filters"
import { SAVED_SEARCHES } from "@/lib/saved-searches"
import {
  collapseVariants,
  emptyStateChildVariants,
  scaleFadeVariants,
  useCollapseTransition,
  useEmptyStateMotionProps,
  useFadeSlideMotionProps,
  useMotionTransition,
  useRowMotionTransition,
} from "@/lib/motion"
import { resolveSvglLogo } from "@/lib/svgl-logos"
import { cn } from "@/lib/utils"

type RowState = "pending" | "scanning" | "classified" | "discarded" | "restored"

type EvalRow = Company & {
  state: RowState
  classifiedAt?: number
}

type SortKey = "score" | "name" | "employees" | "founded"
type SortDir = "desc" | "asc"
type TierFilter = "all" | Tier | "discarded"

const DEFAULT_PROMPT =
  "AI labs founded by alumni of OpenAI, Anthropic, or DeepMind"

function initialPromptFilterState(prompt: string) {
  const query = inferFiltersFromPrompt(prompt)
  return {
    query,
    autoAttrs: new Set(
      flattenFilterChipsFromQuery(query).map((c) => c.condition.attribute),
    ),
  }
}

// Approx total to display in the "evaluated of" counter, to suggest scale.
const TOTAL_CANDIDATES = 12_487

// How long the "Complete" status bar stays visible before collapsing.
const STATUS_BAR_COMPLETE_VISIBLE_MS = 3_500

const TIERS_IN_ORDER: Tier[] = ["high", "medium", "low"]

const DEFAULT_TIER_SECTIONS_OPEN: Record<Tier, boolean> = {
  high: true,
  medium: true,
  low: true,
}

function sortEvalRows(
  list: EvalRow[],
  sort: { key: SortKey; dir: SortDir },
) {
  const dir = sort.dir === "desc" ? -1 : 1
  return [...list].sort((a, b) => {
    let va: number | string = a[sort.key] as number | string
    let vb: number | string = b[sort.key] as number | string
    if (typeof va === "string") va = va.toLowerCase()
    if (typeof vb === "string") vb = vb.toLowerCase()
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })
}

function showAppToast(message: string) {
  toast(message, { icon: null })
}

const ROW_FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"

// Shared table grid template for the Zero CRM company-listing table.
const TABLE_GRID =
  "grid grid-cols-[40px_minmax(240px,1.4fr)_minmax(150px,0.9fr)_minmax(170px,1fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)_minmax(120px,0.7fr)_minmax(100px,0.5fr)_minmax(72px,0.35fr)_minmax(160px,0.9fr)_minmax(180px,1fr)_120px]"

// Vertical column separators — soft hairline dividers between columns.
const TABLE_GRID_DIVIDERS =
  "[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-[#f3f4f6] dark:[&>*:not(:last-child)]:border-border/35"

const TABLE_ROW_HEIGHT = "min-h-9"
const TABLE_CELL_PX = "px-2.5"
const TABLE_LINE_COLOR = "border-[#f3f4f6] dark:border-border/35"
const TABLE_ROW_HOVER_BG =
  "hover:bg-[#fcfcfd] dark:hover:bg-muted/10"
const TABLE_ROW_HOVER_BG_ACTIVE = "bg-[#fcfcfd] dark:bg-muted/10"

// Min width = sum of column track minimums (40+240+…+120 = 1632) so the grid
// never overflows its wrapper.
const TABLE_MIN_WIDTH = "min-w-[1632px] w-full"

type TableColumn = {
  key: string
  label: string
  icon?: ComponentType<{ className?: string }>
  align?: "left" | "right"
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: "select", label: "" },
  { key: "company", label: "Company", icon: Building2 },
  { key: "industry", label: "Industry", icon: Tag },
  { key: "hq", label: "HQ", icon: MapPin },
  { key: "employees", label: "Employees", icon: Users },
  { key: "funding", label: "Funding", icon: DollarCircle },
  { key: "technologies", label: "Technologies", icon: Sparkle },
  { key: "founded", label: "Founded", icon: Calendar },
  { key: "crm", label: "CRM", icon: Building2 },
  { key: "job_signal", label: "Job signal", icon: Briefcase },
  { key: "signals", label: "Signals", icon: Sparkle },
  { key: "icp", label: "ICP Fit", icon: Target },
]

// Soft color palette for signal chips (subtle, light-mode CRM look).
const SIGNAL_CHIP_PALETTE = [
  "bg-[rgba(255,156,84,0.12)] text-[#c4632a] dark:text-[#ffb070]",
  "bg-[rgba(0,168,216,0.12)] text-[#0e7fa6] dark:text-[#4cc7ee]",
  "bg-[rgba(116,121,255,0.12)] text-[#5258d6] dark:text-[#9ea2ff]",
  "bg-[rgba(0,180,170,0.12)] text-[#0a9c93] dark:text-[#37d8cd]",
  "bg-[rgba(190,160,30,0.14)] text-[#9a7d14] dark:text-[#ffd874]",
]

function signalChipClass(signal: string) {
  let hash = 0
  for (let i = 0; i < signal.length; i++) {
    hash = (hash * 31 + signal.charCodeAt(i)) | 0
  }
  return SIGNAL_CHIP_PALETTE[Math.abs(hash) % SIGNAL_CHIP_PALETTE.length]
}

// Shared chip shell for categorical table cells (Signals, ICP Fit, …).
const TABLE_CHIP_CLASS =
  "inline-flex max-w-full items-center truncate rounded-[4px] px-1.5 py-0.5 font-inter text-[12px] font-medium leading-none tracking-[0.01em]"

// ICP Fit chips reuse the signal palette for a consistent table look.
const ICP_FIT_CHIP_CLASS: Record<IcpFit, string> = {
  excellent: SIGNAL_CHIP_PALETTE[3],
  good: SIGNAL_CHIP_PALETTE[1],
  medium: SIGNAL_CHIP_PALETTE[4],
}

// Decorative select checkbox (visual only — matches the CRM screenshot).
function SelectBox({
  className,
  variant = "header",
}: {
  className?: string
  variant?: "header" | "row"
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block size-4 shrink-0 rounded-[5px] border bg-white transition-[opacity,border-color] duration-150 dark:border-input dark:bg-card",
        variant === "header" && "select-header-box border-[#eceef2]",
        variant === "row" &&
          "row-select-box border-[#d7dce3] group-hover/row:border-[#b7c0cc]",
        className,
      )}
    />
  )
}

function rowMatchAriaLabel(row: EvalRow) {
  const tier =
    row.tier === "high" ? "High" : row.tier === "medium" ? "Medium" : "Low"
  return `${row.name}, ${tier} match`
}

function pickNextVisibleRowId(
  removedId: string,
  prevIds: string[],
  nextIds: string[],
): string | null {
  if (nextIds.length === 0) return null
  const oldIdx = prevIds.indexOf(removedId)
  if (oldIdx === -1) return nextIds[0] ?? null
  for (let i = oldIdx; i < prevIds.length; i++) {
    const id = prevIds[i]
    if (id && id !== removedId && nextIds.includes(id)) return id
  }
  for (let i = oldIdx - 1; i >= 0; i--) {
    const id = prevIds[i]
    if (id && nextIds.includes(id)) return id
  }
  return nextIds[0] ?? null
}

export function ProgressiveSearch() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [draft, setDraft] = useState(DEFAULT_PROMPT)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [statusBarVisible, setStatusBarVisible] = useState(false)
  const [rows, setRows] = useState<EvalRow[]>(() =>
    COMPANIES.map((c) => ({ ...c, state: "pending" })),
  )
  const [evaluatedCount, setEvaluatedCount] = useState(0)
  const [activeIds, setActiveIds] = useState<string[]>([])
  const [tierSectionsOpen, setTierSectionsOpen] = useState(
    () => ({ ...DEFAULT_TIER_SECTIONS_OPEN }),
  )
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "score",
    dir: "desc",
  })
  const [tierFilter, setTierFilter] = useState<TierFilter>("all")
  const [showDiscarded, setShowDiscarded] = useState(false)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [promptRelevant, setPromptRelevant] = useState(true)
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)
  const [detailRowId, setDetailRowId] = useState<string | null>(null)
  const initialFiltersRef = useRef<ReturnType<
    typeof initialPromptFilterState
  > | null>(null)
  if (!initialFiltersRef.current) {
    initialFiltersRef.current = initialPromptFilterState(DEFAULT_PROMPT)
  }
  const [filterQuery, setFilterQuery] = useState<FilterQuery>(
    () => initialFiltersRef.current!.query,
  )

  const timeoutsRef = useRef<number[]>([])
  const inputRef = useRef<SmartPromptHandle>(null)
  const searchGenerationRef = useRef(0)
  const lastToastedGenerationRef = useRef(0)
  const focusedRowIdRef = useRef<string | null>(null)
  const prevVisibleRowIdsRef = useRef<string[]>([])
  const promptAutoFilterAttrsRef = useRef<Set<AttributeSlug>>(
    initialFiltersRef.current.autoAttrs,
  )

  const clearTimers = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t))
    timeoutsRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilterQuery((prev) => {
        const { query, autoAttributes } = syncPromptFiltersInQuery(
          prev,
          draft,
          promptAutoFilterAttrsRef.current,
        )
        promptAutoFilterAttrsRef.current = autoAttributes
        return query
      })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [draft])

  const stopSearch = () => {
    clearTimers()
    lastToastedGenerationRef.current = searchGenerationRef.current
    setRunning(false)
    setDone(true)
    setStatusBarVisible(true)
    setActiveIds([])
    showAppToast("Search stopped")
  }

  const startFilterSearch = (query: FilterQuery) => {
    clearTimers()
    searchGenerationRef.current += 1
    const pool = applyFilterQuery(COMPANIES, query)
    setPromptRelevant(pool.length > 0)
    setPrompt("")
    setRunning(false)
    setDone(true)
    setStatusBarVisible(true)
    setEvaluatedCount(pool.length)
    setActiveIds([])
    setShowDiscarded(false)
    setTierFilter("all")
    setTierSectionsOpen({ ...DEFAULT_TIER_SECTIONS_OPEN })
    setDetailRowId(null)

    const reset: EvalRow[] = pool.map((c) => ({
      ...c,
      state:
        c.tier === "low" ? ("discarded" as RowState) : ("classified" as RowState),
      classifiedAt: Date.now(),
    }))
    setRows(reset)
  }

  const startSearch = (q: string, query: FilterQuery = filterQuery) => {
    const interrupting = running
    clearTimers()
    if (interrupting) {
      lastToastedGenerationRef.current = searchGenerationRef.current
      showAppToast("Re-running the search")
    }
    searchGenerationRef.current += 1
    const relevant = isPromptRelevant(q)
    setPromptRelevant(relevant)
    setPrompt(q)
    setRunning(true)
    setDone(false)
    setStatusBarVisible(true)
    setEvaluatedCount(0)
    setActiveIds([])
    setShowDiscarded(false)
    setTierFilter("all")
    setTierSectionsOpen({ ...DEFAULT_TIER_SECTIONS_OPEN })
    setDetailRowId(null)

    const pool = applyFilterQuery(COMPANIES, query)
    const reset: EvalRow[] = pool.map((c) => ({ ...c, state: "pending" }))
    setRows(reset)

    const order = [...reset]
      .map((r) => ({ r, k: Math.random() }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.r)

    let cursor = 250
    order.forEach((row, idx) => {
      const scanDelay = cursor
      const classifyDelay = cursor + 320 + Math.random() * 220
      cursor = classifyDelay + 90 + Math.random() * 140

      timeoutsRef.current.push(
        window.setTimeout(() => {
          setActiveIds((cur) => [...cur, row.id].slice(-3))
          setRows((cur) =>
            cur.map((r) => (r.id === row.id ? { ...r, state: "scanning" } : r)),
          )
        }, scanDelay),
      )

      timeoutsRef.current.push(
        window.setTimeout(() => {
          setActiveIds((cur) => cur.filter((id) => id !== row.id))
          setRows((cur) =>
            cur.map((r) =>
              r.id === row.id
                ? {
                    ...r,
                    state: !relevant
                      ? "discarded"
                      : r.tier === "low"
                        ? "discarded"
                        : "classified",
                    classifiedAt: Date.now(),
                  }
                : r,
            ),
          )
          setEvaluatedCount(() => idx + 1)
        }, classifyDelay),
      )
    })

    timeoutsRef.current.push(
      window.setTimeout(() => {
        setRunning(false)
        setDone(true)
        setActiveIds([])
      }, cursor + 300),
    )
  }

  useEffect(() => {
    if (!done || running) return
    const timer = window.setTimeout(
      () => setStatusBarVisible(false),
      STATUS_BAR_COMPLETE_VISIBLE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [done, running])

  useEffect(() => {
    if (!done) return
    if (lastToastedGenerationRef.current === searchGenerationRef.current) return
    lastToastedGenerationRef.current = searchGenerationRef.current
    showAppToast("Search completed")
  }, [done])

  const submit = () => {
    if (draft.trim()) {
      startSearch(draft.trim(), filterQuery)
    } else if (hasFilterConditions(filterQuery)) {
      startFilterSearch(filterQuery)
    }
  }

  const runSavedSearch = (id: string) => {
    const saved = SAVED_SEARCHES.find((s) => s.id === id)
    if (!saved) return
    const query = fromLegacyFilters(saved.filters)
    promptAutoFilterAttrsRef.current = new Set()
    setFilterQuery(query)
    if (saved.prompt?.trim()) {
      setDraft(saved.prompt)
      startSearch(saved.prompt.trim(), query)
    } else {
      setDraft("")
      startFilterSearch(query)
    }
  }

  const filtersActive = hasFilterConditions(filterQuery)
  const filterHints = useMemo(
    () => toLegacyHints(filterQuery),
    [filterQuery],
  )
  const canSubmit = draft.trim().length > 0 || filtersActive
  const runLabel =
    !draft.trim() && filtersActive
      ? "Run filters"
      : running
        ? "Re-run"
        : done
          ? "Run again"
          : "Run"

  const restoreRow = (id: string) => {
    setRows((cur) =>
      cur.map((r) =>
        r.id === id ? { ...r, state: "restored" as RowState } : r,
      ),
    )
  }

  const survivingRows = useMemo(
    () =>
      rows.filter(
        (r) => r.state === "classified" || r.state === "restored",
      ),
    [rows],
  )

  const rowsByTier = useMemo(() => {
    const grouped = {} as Record<Tier, EvalRow[]>
    for (const tier of TIERS_IN_ORDER) {
      grouped[tier] = sortEvalRows(
        survivingRows.filter((r) => r.tier === tier),
        sort,
      )
    }
    return grouped
  }, [survivingRows, sort])

  const discardedRows = useMemo(() => {
    const list = promptRelevant
      ? rows.filter((r) => r.state === "discarded")
      : []
    return sortEvalRows(list, sort)
  }, [rows, promptRelevant, sort])

  const hasTierResults = TIERS_IN_ORDER.some(
    (tier) => rowsByTier[tier].length > 0,
  )

  const showTierSection = (tier: Tier) =>
    tierFilter === "all" || tierFilter === tier

  const showDiscardedSection =
    tierFilter === "all" || tierFilter === "discarded"

  const hasVisibleResults =
    tierFilter === "discarded"
      ? discardedRows.length > 0
      : tierFilter === "all"
        ? hasTierResults || discardedRows.length > 0
        : rowsByTier[tierFilter].length > 0

  const isResultsIdle = !running && !done

  const resultsPanelKey = useMemo(() => {
    if (isResultsIdle) return "idle"
    if (running && !hasVisibleResults) return "scanning"
    if (!hasVisibleResults && done) {
      return promptRelevant ? "no-match-empty" : "no-match-irrelevant"
    }
    return "results"
  }, [isResultsIdle, running, hasVisibleResults, done, promptRelevant])

  const discardedListOpen =
    promptRelevant &&
    showDiscardedSection &&
    (tierFilter === "discarded" || showDiscarded)

  const visibleRowIds = useMemo(() => {
    if (resultsPanelKey !== "results") return []
    if (tierFilter === "discarded") {
      return discardedListOpen ? discardedRows.map((r) => r.id) : []
    }
    const ids: string[] = []
    for (const tier of TIERS_IN_ORDER) {
      if (tierFilter !== "all" && tierFilter !== tier) continue
      if (!tierSectionsOpen[tier]) continue
      for (const row of rowsByTier[tier]) ids.push(row.id)
    }
    if (tierFilter === "all" && discardedListOpen) {
      for (const row of discardedRows) ids.push(row.id)
    }
    return ids
  }, [
    resultsPanelKey,
    tierFilter,
    tierSectionsOpen,
    rowsByTier,
    discardedListOpen,
    discardedRows,
  ])

  const focusRowById = useCallback((id: string | null) => {
    setFocusedRowId(id)
    focusedRowIdRef.current = id
    if (!id) return
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-focus-row="${id}"]`)
        ?.focus()
    })
  }, [])

  const getRowTabIndex = useCallback(
    (rowId: string) => {
      if (!visibleRowIds.includes(rowId)) return -1
      const activeId = focusedRowId ?? visibleRowIds[0]
      return activeId === rowId ? 0 : -1
    },
    [focusedRowId, visibleRowIds],
  )

  const handleRowKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, rowId: string) => {
      const idx = visibleRowIds.indexOf(rowId)
      if (idx === -1) return

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          const next = visibleRowIds[idx + 1]
          if (next) focusRowById(next)
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          const prev = visibleRowIds[idx - 1]
          if (prev) focusRowById(prev)
          break
        }
        case "Home": {
          e.preventDefault()
          const first = visibleRowIds[0]
          if (first) focusRowById(first)
          break
        }
        case "End": {
          e.preventDefault()
          const last = visibleRowIds[visibleRowIds.length - 1]
          if (last) focusRowById(last)
          break
        }
        case "Enter": {
          e.preventDefault()
          if (discardedRows.some((r) => r.id === rowId)) {
            restoreRow(rowId)
            return
          }
          setDetailRowId(rowId)
          break
        }
        default:
          break
      }
    },
    [visibleRowIds, focusRowById, discardedRows, restoreRow],
  )

  const fadeSlideProps = useFadeSlideMotionProps()
  const collapseTransition = useCollapseTransition()
  const actionTransition = useMotionTransition(0.18)

  const fakeEvaluated = Math.round(
    (evaluatedCount / COMPANIES.length) * TOTAL_CANDIDATES,
  )

  const focusPromptAndSelectAll = () => {
    inputRef.current?.selectAll()
  }

  const resetApp = () => {
    clearTimers()
    searchGenerationRef.current += 1
    setRunning(false)
    setDone(false)
    setStatusBarVisible(false)
    setPrompt("")
    setDraft("")
    setEvaluatedCount(0)
    setActiveIds([])
    setShowDiscarded(false)
    setTierFilter("all")
    setTierSectionsOpen({ ...DEFAULT_TIER_SECTIONS_OPEN })
    setPromptRelevant(true)
    setHoverId(null)
    setFocusedRowId(null)
    setDetailRowId(null)
    focusedRowIdRef.current = null
    prevVisibleRowIdsRef.current = []
    promptAutoFilterAttrsRef.current = new Set()
    setFilterQuery(createEmptyQuery())
    setRows(COMPANIES.map((c) => ({ ...c, state: "pending" })))
    requestAnimationFrame(() => {
      inputRef.current?.blur()
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    })
  }

  // When a focused row leaves the visible list (e.g. moved to Discarded), move focus forward.
  useEffect(() => {
    const prevIds = prevVisibleRowIdsRef.current
    if (focusedRowId && !visibleRowIds.includes(focusedRowId)) {
      const nextId = pickNextVisibleRowId(
        focusedRowId,
        prevIds,
        visibleRowIds,
      )
      if (nextId) focusRowById(nextId)
      else {
        setFocusedRowId(null)
        focusedRowIdRef.current = null
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }
    }
    prevVisibleRowIdsRef.current = visibleRowIds
  }, [visibleRowIds, focusedRowId, focusRowById])

  // After sort or pass completion, restore focus by company id.
  useEffect(() => {
    const id = focusedRowIdRef.current
    if (!id || resultsPanelKey !== "results" || !visibleRowIds.includes(id)) {
      return
    }
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-focus-row="${id}"]`,
      )
      if (el && document.activeElement !== el) {
        el.focus()
        setFocusedRowId(id)
      }
    })
  }, [done, sort, visibleRowIds, resultsPanelKey, rowsByTier])

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (detailRowId) {
        e.preventDefault()
        setDetailRowId(null)
        return
      }
      if (running) {
        e.preventDefault()
        stopSearch()
        return
      }
      const onRow =
        focusedRowId != null ||
        (e.target as HTMLElement | null)?.closest("[data-focus-row]")
      if (onRow) {
        e.preventDefault()
        setFocusedRowId(null)
        focusedRowIdRef.current = null
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [running, detailRowId, focusedRowId, stopSearch])

  // Focus prompt with "/" when not typing in a field.
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.isContentEditable === true
      if (e.key === "/" && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <TooltipProvider delayDuration={120}>
    <div className="flex h-dvh w-full overflow-hidden bg-background" data-demo="1">
      <AppSidebar />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 pb-12 md:px-8">
        <ListHeader onTitleClick={resetApp} />

        {/* Prompt */}
        <section className="mt-5">
          <div className="group relative overflow-hidden rounded-xl bg-secondary/40 shadow-none transition-colors dark:bg-secondary/25">
            <div className="relative z-[1] flex flex-col">
            <div
              className={cn(
                "relative",
                running && "overflow-hidden rounded-xl p-px",
              )}
            >
              {running && (
                <div
                  className="prompt-card-shimmer-glow pointer-events-none absolute -inset-[120%] z-0"
                  aria-hidden
                />
              )}
            <div
              className={cn(
                "relative z-[1] bg-card prompt-card-input-surface",
                running && "prompt-card-shimmer-mask",
              )}
            >
            <SmartPromptInput
              ref={inputRef}
              value={draft}
              onChange={setDraft}
              onSubmit={submit}
              disabled={running}
              placeholder="Describe what you're looking for…"
              actions={
                running || canSubmit ? (
                  <div className="flex h-8 items-center gap-2">
                    <AnimatePresence initial={false} mode="popLayout">
                      {running ? (
                        <motion.div
                          key="stop"
                          variants={scaleFadeVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={actionTransition}
                        >
                          <button
                            type="button"
                            onClick={stopSearch}
                            className={cn(
                              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-muted/50 px-3 font-inter text-[11px] text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted hover:text-foreground",
                              ROW_FOCUS_RING,
                            )}
                          >
                            <X className="size-3 opacity-70" />
                            Stop
                          </button>
                        </motion.div>
                      ) : null}
                      {canSubmit ? (
                        <motion.div
                          key="run"
                          variants={scaleFadeVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={actionTransition}
                        >
                          <button
                            type="button"
                            onClick={submit}
                            className={cn(
                              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-black px-2.5 font-inter text-[12px] font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
                              ROW_FOCUS_RING,
                            )}
                          >
                            <MagicWand className="size-3 text-current" />
                            {runLabel}
                          </button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                ) : null
              }
            />

            </div>
            </div>

            {/* Filter toolbar — sits on the soft card background below the white prompt. */}
            <div
              className={cn(
                "relative px-4 py-2.5",
                "[&_.font-inter]:![letter-spacing:-0.01em]",
              )}
            >
              <AttioFilterBuilder query={filterQuery} onChange={setFilterQuery} />
            </div>

            <AnimatePresence initial={false}>
              {statusBarVisible && (running || done) ? (
                <motion.div
                  key="status-bar"
                  variants={collapseVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={collapseTransition}
                  className="overflow-hidden"
                >
                  <div className="h-px bg-border/60" />

                  {/* Status bar */}
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 font-inter text-[11px] text-muted-foreground">
                    <div
                      className="flex min-w-0 flex-wrap items-center gap-3"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full transition-colors duration-200",
                            running
                              ? "prompt-spectrum-dot animate-pulse"
                              : done
                                ? "bg-emerald-500"
                                : "bg-muted-foreground/40",
                          )}
                        />
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={running ? "evaluating" : done ? "complete" : "ready"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={actionTransition}
                          >
                            {running ? "Evaluating" : done ? "Complete" : "Ready"}
                          </motion.span>
                        </AnimatePresence>
                        {running ? (
                          <span className="sr-only">
                            Evaluating companies, {fakeEvaluated.toLocaleString()}{" "}
                            of {TOTAL_CANDIDATES.toLocaleString()} scanned
                          </span>
                        ) : null}
                        {done && !running ? (
                          <span className="sr-only">
                            Search complete. {survivingRows.length} companies in
                            results.
                          </span>
                        ) : null}
                      </span>
                      {running && (
                        <>
                          <span className="hidden sm:inline-block h-3 w-px bg-border" />
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="shrink-0">Scanning</span>
                            {activeIds.length > 0 ? (
                              <>
                                <ArrowRight
                                  className="hidden size-3 shrink-0 text-foreground/70 animate-nudge-right md:block"
                                  aria-hidden
                                />
                                <span className="hidden truncate text-foreground/90 md:block">
                                  {activeIds
                                    .map(
                                      (id) =>
                                        rows.find((r) => r.id === id)?.name ?? "",
                                    )
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              </>
                            ) : null}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="shrink-0 tabular-nums">
                      {fakeEvaluated.toLocaleString()} /{" "}
                      {TOTAL_CANDIDATES.toLocaleString()} Candidates
                    </span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            </div>
          </div>

        </section>

        {/* Results list */}
        <section className="mt-4 space-y-6" aria-label="Search results">
          <AnimatePresence mode="wait" initial={false}>
            {resultsPanelKey === "results" ? (
              <motion.div key="results" {...fadeSlideProps} className="space-y-6">
                <LayoutGroup>
                  {TIERS_IN_ORDER.map((tier) => {
                    if (!showTierSection(tier)) return null
                    const tierRows = rowsByTier[tier]
                    if (tierRows.length === 0) return null
                    return (
                      <TierResultsSection
                        key={tier}
                        tier={tier}
                        rows={tierRows}
                        filterHints={filterHints}
                        hoverId={hoverId}
                        onHover={setHoverId}
                        focusedRowId={focusedRowId}
                        detailRowId={detailRowId}
                        onDetailRowIdChange={setDetailRowId}
                        onRowKeyDown={handleRowKeyDown}
                        onRowFocus={focusRowById}
                        getRowTabIndex={getRowTabIndex}
                      />
                    )
                  })}
                </LayoutGroup>

                {promptRelevant && showDiscardedSection && (
                  <DiscardedDrawer
                    open={tierFilter === "discarded" ? true : showDiscarded}
                    onToggle={() => {
                      if (tierFilter === "discarded") return
                      setShowDiscarded((s) => !s)
                    }}
                    rows={discardedRows}
                    onRestore={restoreRow}
                    pinnedOpen={tierFilter === "discarded"}
                    onRowKeyDown={handleRowKeyDown}
                    onRowFocus={focusRowById}
                    getRowTabIndex={getRowTabIndex}
                  />
                )}
              </motion.div>
            ) : null}

            {resultsPanelKey === "idle" ? (
              <SavedSearchesPanel key="idle" onRun={runSavedSearch} />
            ) : null}

            {resultsPanelKey === "scanning" ? (
              <ResultsStateCard key="scanning">
                <ScanningPlaceholder />
              </ResultsStateCard>
            ) : null}

            {resultsPanelKey === "no-match-irrelevant" ? (
              <ResultsStateCard key="no-match-irrelevant">
                <EmptyState
                  variant="no-match"
                  icon={SearchX}
                  title="Unfortunately, no matching results"
                  body={
                    <>
                      We couldn&apos;t find companies in our index for this
                      prompt.
                      <br />
                      Try describing the sector, signals, or type of company you
                      want.
                    </>
                  }
                  hints={[
                    "Be specific — e.g. AI lab, enterprise SaaS, Series B",
                    "Add signals like alumni, geography, or funding stage",
                    "Avoid unrelated keywords that don't match our dataset",
                  ]}
                  action={{
                    label: "Edit prompt",
                    onClick: focusPromptAndSelectAll,
                  }}
                />
              </ResultsStateCard>
            ) : null}

            {resultsPanelKey === "no-match-empty" ? (
              <ResultsStateCard key="no-match-empty">
                <EmptyState
                  variant="no-match"
                  icon={SearchX}
                  title="No strong matches found"
                  body="Nothing cleared the bar for this prompt. Loosen a constraint or broaden the criteria, then run again."
                  hints={[
                    "Remove the strictest filter in your prompt",
                    "Try related sectors or adjacent company types",
                  ]}
                  action={{
                    label: "Refine prompt",
                    onClick: focusPromptAndSelectAll,
                  }}
                />
              </ResultsStateCard>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
      </main>
    </div>
    </TooltipProvider>
  )
}

/* ───────── components ────────── */

function ListHeader({ onTitleClick }: { onTitleClick?: () => void }) {
  return (
    <header className="flex items-center gap-4">
      {onTitleClick ? (
        <button
          type="button"
          onClick={onTitleClick}
          className="group flex min-w-0 cursor-pointer items-center gap-2.5 rounded-md border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Reset search"
        >
          <ScanSearch
            className="size-4 shrink-0 text-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <h1 className="truncate font-sans text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            Lead Search
          </h1>
        </button>
      ) : (
        <div className="flex min-w-0 items-center gap-2.5">
          <ScanSearch
            className="size-4 shrink-0 text-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <h1 className="truncate font-sans text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            Lead Search
          </h1>
        </div>
      )}
    </header>
  )
}

function EmptyStateHintsList({ hints }: { hints: string[] }) {
  return (
    <ul className="space-y-2 font-inter text-[11px] leading-relaxed text-muted-foreground">
      {hints.map((hint) => (
        <li key={hint} className="flex gap-2.5">
          <span
            className="mt-[0.35rem] size-1 shrink-0 rounded-full bg-muted-foreground/45"
            aria-hidden
          />
          <span>{hint}</span>
        </li>
      ))}
    </ul>
  )
}

function EmptyStateHintsPopover({ hints }: { hints: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute right-4 bottom-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label="Search tips"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <Info className="size-3.5 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-auto max-w-[26rem] border-border p-0 shadow-lg"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-4 py-3.5">
            <EmptyStateHintsList hints={hints} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function EmptyState({
  variant = "default",
  icon: Icon,
  title,
  body,
  hints,
  action,
}: {
  variant?: "default" | "no-match"
  icon: ComponentType<{ className?: string }>
  title: string
  body: React.ReactNode
  hints?: string[]
  action?: {
    label: string
    onClick: () => void
    icon?: ComponentType<{ className?: string }>
  }
}) {
  const isNoMatch = variant === "no-match"
  const ActionIcon = action?.icon ?? (isNoMatch ? EditPrompt : null)
  const emptyMotion = useEmptyStateMotionProps()
  const childTransition = useMotionTransition(0.2)

  const contentClass = cn(
    "mx-auto flex w-full max-w-md flex-col items-center",
    emptyMotion.stagger && "contents",
  )

  const IconBlock = (
    <div
      className={cn(
        "relative mb-5 flex items-center justify-center",
        isNoMatch
          ? "size-11 rounded-xl border border-border/80 bg-gradient-to-b from-secondary/90 to-secondary/30"
          : "size-12 rounded-xl border border-border bg-secondary",
      )}
    >
      {isNoMatch ? (
        <span
          className="pointer-events-none absolute -inset-px rounded-xl opacity-70"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--spectrum-2) 22%, transparent), transparent 45%, color-mix(in oklch, var(--spectrum-5) 18%, transparent))",
          }}
          aria-hidden
        />
      ) : (
        <span className="absolute inset-0 rounded-xl bg-primary/5" aria-hidden />
      )}
      <Icon
        className={cn(
          "relative text-muted-foreground",
          isNoMatch ? "size-[18px]" : "size-5",
        )}
      />
    </div>
  )

  const TitleBlock = (
    <h3
      className={cn(
        "font-sans font-medium tracking-tight text-foreground",
        isNoMatch ? "text-base sm:text-[17px]" : "text-sm",
      )}
    >
      {title}
    </h3>
  )

  const BodyBlock = (
    <p
      className={cn(
        "mt-2 text-pretty leading-relaxed text-muted-foreground",
        isNoMatch
          ? "max-w-[26rem] text-[13px] sm:text-sm"
          : "max-w-sm text-[13px]",
      )}
    >
      {body}
    </p>
  )

  const ActionBlock = action ? (
    <button
      type="button"
      onClick={action.onClick}
      className={cn(
        "mt-6 inline-flex h-8 cursor-pointer items-center gap-1 rounded-md font-inter text-[11px] font-medium transition",
        isNoMatch
          ? "border border-border bg-white px-2.5 text-[#777] transition-colors hover:border-[#ddd] hover:bg-white hover:text-[#646464] dark:border-border dark:bg-white dark:text-[#323232] dark:hover:border-neutral-400 dark:hover:bg-white dark:hover:text-[#323232]"
          : "border border-border bg-card px-3 text-foreground hover:bg-secondary",
      )}
    >
      {ActionIcon ? (
        <ActionIcon className="size-3 shrink-0 text-current" />
      ) : null}
      {action.label}
    </button>
  ) : null

  return (
    <motion.div
      variants={emptyMotion.variants}
      initial={emptyMotion.initial}
      animate={emptyMotion.animate}
      exit={emptyMotion.exit}
      transition={emptyMotion.transition}
      className={cn(
        "flex w-full flex-col items-center justify-center px-6 text-center",
        isNoMatch
          ? "group relative min-h-[min(28rem,58vh)] py-16 sm:py-20"
          : "py-16",
      )}
    >
      {isNoMatch && hints && hints.length > 0 ? (
        <EmptyStateHintsPopover hints={hints} />
      ) : null}
      {emptyMotion.stagger ? (
        <div className="mx-auto flex w-full max-w-md flex-col items-center">
          <motion.div variants={emptyStateChildVariants} transition={childTransition}>
            {IconBlock}
          </motion.div>
          <motion.div variants={emptyStateChildVariants} transition={childTransition}>
            {TitleBlock}
          </motion.div>
          <motion.div variants={emptyStateChildVariants} transition={childTransition}>
            {BodyBlock}
          </motion.div>
          {action ? (
            <motion.div variants={emptyStateChildVariants} transition={childTransition}>
              {ActionBlock}
            </motion.div>
          ) : null}
        </div>
      ) : (
        <div className={contentClass}>
          {IconBlock}
          {TitleBlock}
          {BodyBlock}
          {ActionBlock}
        </div>
      )}
    </motion.div>
  )
}

function ScanningPlaceholder() {
  const fadeSlideProps = useFadeSlideMotionProps()
  return (
    <motion.div
      {...fadeSlideProps}
      className="min-h-[min(22rem,52vh)] p-5"
    >
      <ul className="space-y-3" aria-hidden>
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center gap-3"
            style={{ opacity: 1 - i * 0.28 }}
          >
            <span className="size-9 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
              <span className="block size-full scanline-muted opacity-40" />
            </span>
            <div className="flex-1 space-y-2">
              <span className="block h-2.5 w-1/3 overflow-hidden rounded bg-secondary">
                <span className="block size-full scanline-muted opacity-40" />
              </span>
              <span className="block h-2 w-2/3 overflow-hidden rounded bg-secondary">
                <span className="block size-full scanline-muted opacity-30" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function TableColumnHeader() {
  return (
    <div
      role="row"
      className={cn(
        TABLE_GRID,
        TABLE_GRID_DIVIDERS,
        "w-full items-center border-b bg-white",
        TABLE_LINE_COLOR,
      )}
    >
      {TABLE_COLUMNS.map((col) => {
        if (col.key === "select") {
          return (
            <div
              key={col.key}
              className="select-header-cell flex h-9 items-center justify-center"
            >
              <SelectBox variant="header" />
            </div>
          )
        }
        const Icon = col.icon
        return (
          <div
            key={col.key}
            className={cn(
              "flex h-9 min-w-0 items-center gap-1",
              TABLE_CELL_PX,
              "font-inter text-[12px] font-normal tracking-[0.01em] text-[#9ba7b9] dark:text-muted-foreground/70",
              col.align === "right" && "justify-end",
            )}
          >
            {Icon ? (
              <Icon className="size-3 shrink-0 opacity-80" aria-hidden />
            ) : null}
            <span className="truncate whitespace-nowrap">{col.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function ResultsStateCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {children}
    </div>
  )
}

function TierResultsSection({
  tier,
  rows,
  filterHints,
  hoverId,
  onHover,
  detailRowId,
  onDetailRowIdChange,
  onRowKeyDown,
  onRowFocus,
  getRowTabIndex,
}: {
  tier: Tier
  rows: EvalRow[]
  filterHints: LegacyFilterHints
  hoverId: string | null
  onHover: (id: string | null) => void
  focusedRowId: string | null
  detailRowId: string | null
  onDetailRowIdChange: (id: string | null) => void
  onRowKeyDown: (e: KeyboardEvent<HTMLElement>, rowId: string) => void
  onRowFocus: (id: string) => void
  getRowTabIndex: (rowId: string) => 0 | -1
}) {
  const rowTransition = useRowMotionTransition()

  return (
    <section>
      <p className="mb-2 px-0.5 font-inter text-[13px] font-medium tracking-[-0.01em] text-[#475b82] dark:text-muted-foreground">
        {tierLabel(tier)}
        <span className="ml-1.5 tabular-nums text-muted-foreground/50">
          {rows.length}
        </span>
      </p>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white",
          TABLE_LINE_COLOR,
        )}
      >
        <div className="overflow-x-auto">
        <div className={TABLE_MIN_WIDTH}>
          <div className="results-table-select">
          <TableColumnHeader />
          <ul
            role="list"
            className={cn("divide-y bg-white", TABLE_LINE_COLOR)}
          >
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <motion.li
                  key={row.id}
                  role="listitem"
                  layout={rowTransition.layout ? "position" : false}
                  data-row-id={row.id}
                  data-focus-row={row.id}
                  tabIndex={getRowTabIndex(row.id)}
                  aria-label={rowMatchAriaLabel(row)}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: rowTransition.exitY }}
                  transition={rowTransition.transition}
                  onMouseEnter={() => onHover(row.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onRowFocus(row.id)}
                  onKeyDown={(e) => onRowKeyDown(e, row.id)}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return
                    const target = e.target as HTMLElement
                    if (
                      target.closest("a, button, [role='button']") &&
                      target.closest("[data-focus-row]") !== e.currentTarget
                    ) {
                      return
                    }
                    onRowFocus(row.id)
                  }}
                  className={cn(
                    "group/row relative bg-white transition-colors",
                    ROW_FOCUS_RING,
                    TABLE_ROW_HOVER_BG,
                    hoverId === row.id && TABLE_ROW_HOVER_BG_ACTIVE,
                  )}
                >
                    <Row
                      row={row}
                      filterHints={filterHints}
                      detailOpen={detailRowId === row.id}
                      onDetailOpenChange={(open) =>
                        onDetailRowIdChange(open ? row.id : null)
                      }
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}

// Persist successful logo URLs across sort/filter/layout updates.
const logoReadySrcByKey = new Map<string, string>()

function logoCacheKey(domain: string, colorScheme: "light" | "dark") {
  return `${domain}:${colorScheme}`
}

function readLogoCache(cacheKey: string, sources: string[]) {
  const ready = logoReadySrcByKey.get(cacheKey)
  if (!ready) return null
  const index = sources.indexOf(ready)
  if (index < 0) return null
  return { src: ready, index }
}

// Logo chain: SVGL (https://svgl.app) when mapped → Google favicons → DuckDuckGo → initials.
function logoSources(domain: string, svglUrl: string | null) {
  return [
    ...(svglUrl ? [svglUrl] : []),
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ]
}

function isLogoImageUsable(img: HTMLImageElement, src: string) {
  if (/\.svg($|\?)/i.test(src)) return true
  return img.naturalWidth > 0 && img.naturalHeight > 0
}

const Logo = memo(function Logo({
  domain,
  name,
  size = 36,
}: {
  domain: string
  name: string
  size?: number
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const colorScheme: "light" | "dark" =
    mounted && resolvedTheme === "dark" ? "dark" : "light"
  const cacheKey = logoCacheKey(domain, colorScheme)
  const svglUrl = resolveSvglLogo(domain, colorScheme)
  const sources = useMemo(() => logoSources(domain, svglUrl), [domain, svglUrl])
  const cached = readLogoCache(cacheKey, sources)

  const [idx, setIdx] = useState(() => cached?.index ?? 0)
  const [loaded, setLoaded] = useState(() => cached != null)
  const imgRef = useRef<HTMLImageElement>(null)
  const exhausted = idx >= sources.length
  const src = cached?.src ?? (exhausted ? null : sources[idx])
  const isCached = cached != null

  useEffect(() => {
    const hit = readLogoCache(cacheKey, sources)
    if (hit) {
      setIdx(hit.index)
      setLoaded(true)
      return
    }
    setIdx(0)
    setLoaded(false)
  }, [cacheKey, domain])

  useEffect(() => {
    const hit = readLogoCache(cacheKey, sources)
    if (hit) {
      setIdx(hit.index)
      setLoaded(true)
    }
  }, [sources, cacheKey])

  const advanceOrShow = (img: HTMLImageElement, currentSrc: string) => {
    if (isLogoImageUsable(img, currentSrc)) {
      setLoaded(true)
      logoReadySrcByKey.set(cacheKey, currentSrc)
      return
    }
    setIdx((i) => i + 1)
  }

  useLayoutEffect(() => {
    const img = imgRef.current
    if (!img || !src) return
    if (img.complete) advanceOrShow(img, src)
  }, [src, idx, cacheKey])

  const initials = name
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-secondary",
        size <= 20
          ? "rounded-[4px]"
          : "rounded-[10px] border border-border/50",
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="absolute font-inter text-[11px] font-medium text-muted-foreground">
        {initials || "·"}
      </span>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          key={cacheKey}
          src={src}
          alt=""
          width={size}
          height={size}
          loading="eager"
          decoding="async"
          className={cn(
            "relative size-full object-contain",
            size <= 20 ? "p-0" : "bg-background p-1",
            isCached || loaded ? "opacity-100" : "opacity-0 transition-opacity duration-300",
          )}
          onLoad={(e) => {
            advanceOrShow(e.currentTarget, src)
          }}
          onError={() => {
            if (!logoReadySrcByKey.has(cacheKey)) setLoaded(false)
            setIdx((i) => i + 1)
          }}
          referrerPolicy="no-referrer"
        />
      ) : null}
    </div>
  )
})

function tierLabel(tier: Tier) {
  return tier === "high" ? "High" : tier === "medium" ? "Medium" : "Low"
}

function tierClasses(tier: Tier) {
  return tier === "high"
    ? "text-emerald-600 dark:text-emerald-400"
    : tier === "medium"
      ? "text-tier-medium"
      : "text-muted-foreground"
}

function scoreTierDotClass(tier: Tier) {
  return tier === "high"
    ? "bg-emerald-500"
    : tier === "medium"
      ? "bg-tier-medium"
      : "bg-muted-foreground"
}

function ScoreBreakdown({ row }: { row: EvalRow }) {
  return (
    <div className="w-72 max-w-[min(100vw-2rem,18rem)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("size-2 shrink-0 rounded-full", scoreTierDotClass(row.tier))}
            aria-hidden
          />
          <span className={cn("font-inter text-xs font-medium", tierClasses(row.tier))}>
            {tierLabel(row.tier)}
          </span>
        </div>
        <p className="shrink-0 font-inter font-semibold leading-none tabular-nums text-foreground">
          <span className="text-[17px]">{row.score}</span>
          <span className="text-xs font-normal text-muted-foreground">/100</span>
        </p>
      </div>
      <div className="px-3 py-2.5">
        <p className="font-inter text-[11px] font-medium uppercase text-muted-foreground">
          Match summary
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/90">
          {row.reasoning}
        </p>
      </div>
      {row.signals.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-border bg-muted/40 px-3 py-2 dark:bg-muted/20">
          {row.signals.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 font-inter text-[10px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyHoverCard({ row }: { row: EvalRow }) {
  const meta: { label: string; value: string }[] = [
    { label: "Industry", value: row.industry },
    { label: "HQ", value: row.hq },
    { label: "Headcount", value: `${row.employees.toLocaleString()} · ↗ +${row.headcountGrowth}%` },
    { label: "Founded", value: String(row.founded) },
    { label: "Last round", value: `${row.lastRound} · ${row.funding}` },
    { label: "Total raised", value: row.totalFunding },
  ]
  return (
    <HoverCardContent side="right" align="start" className="w-80 p-0">
      <div className="flex items-start gap-3 border-b border-border p-4">
        <Logo domain={row.domain} name={row.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-sans font-medium text-foreground">
              {row.name}
            </span>
            {row.inCrm && (
              <span className="inline-flex shrink-0 items-center rounded-[5px] bg-primary/10 px-1.5 py-0.5 font-inter text-[10px] font-medium text-primary">
                In CRM
              </span>
            )}
          </div>
          <a
            href={`https://${row.domain}`}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center font-inter text-[11px] text-muted-foreground hover:text-foreground"
          >
            {row.domain}
            <ArrowUpRight className="ml-0.5 size-3" />
          </a>
        </div>
        <span className="shrink-0 font-inter text-sm tabular-nums text-foreground">
          {row.score}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-[13px] leading-relaxed text-foreground/80">{row.reasoning}</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          {meta.map((m) => (
            <div key={m.label} className="min-w-0">
              <dt className="font-inter text-[10px] uppercase text-muted-foreground">
                {m.label}
              </dt>
              <dd className="truncate text-[12px] text-foreground">{m.value}</dd>
            </div>
          ))}
        </dl>
        {row.investors.length > 0 && (
          <div className="min-w-0">
            <p className="font-inter text-[10px] uppercase text-muted-foreground">
              Investors
            </p>
            <p className="mt-0.5 truncate text-[12px] text-foreground">
              {row.investors.join(", ")}
            </p>
          </div>
        )}
        {row.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {row.technologies.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-inter text-[10px] text-muted-foreground dark:bg-muted/20"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </HoverCardContent>
  )
}

function Row({
  row,
  filterHints,
  detailOpen = false,
  onDetailOpenChange,
}: {
  row: EvalRow
  filterHints: LegacyFilterHints
  detailOpen?: boolean
  onDetailOpenChange?: (open: boolean) => void
}) {
  const fit = icpFitFromScore(row.score)
  const jobKeyword = filterHints.jobPostKeyword?.trim().toLowerCase()
  const showLookalike = !!filterHints.lookalikeOfId
  return (
    <div className={cn(TABLE_GRID, TABLE_GRID_DIVIDERS, "w-full items-stretch")}>
      {/* Select */}
      <div className={cn("flex items-center justify-center", TABLE_ROW_HEIGHT)}>
        <SelectBox variant="row" />
      </div>

      {/* Company: logo + name + domain hover card */}
      <div
        className={cn(
          "flex min-w-0 items-center gap-2",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        <Logo key={row.domain} domain={row.domain} name={row.name} size={16} />
        <div className="min-w-0">
          <HoverCard
            open={detailOpen}
            onOpenChange={onDetailOpenChange}
            openDelay={120}
            closeDelay={80}
          >
            <HoverCardTrigger asChild>
              <div className="flex min-w-0 cursor-pointer items-center gap-2">
                <span className="truncate font-inter text-[13px] font-medium leading-none tracking-[0.01em] text-foreground">
                  {row.name}
                </span>
                <a
                  href={`https://${row.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hidden shrink-0 items-center rounded-sm bg-secondary px-1.5 py-0.5 font-inter text-[10px] text-muted-foreground transition hover:text-foreground lg:group-hover/row:inline-flex"
                >
                  {row.domain}
                </a>
              </div>
            </HoverCardTrigger>
            <CompanyHoverCard row={row} />
          </HoverCard>
        </div>
      </div>

      {/* Industry */}
      <div
        className={cn(
          "flex min-w-0 items-center",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        <span className="truncate font-inter text-[13px] leading-none text-[#475b82] tracking-[0.01em] dark:text-muted-foreground">
          {row.industry}
        </span>
      </div>

      {/* HQ */}
      <div
        className={cn(
          "flex min-w-0 items-center",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        <span className="block truncate font-inter text-[13px] leading-none text-[#475b82] tracking-[0.01em] dark:text-muted-foreground">
          {row.hq}
        </span>
      </div>

      {/* Employees + growth */}
      <div
        className={cn(
          "flex min-w-0 items-center gap-1.5",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        <span className="font-inter text-[13px] leading-none tabular-nums text-[#475b82] tracking-[0.01em] dark:text-muted-foreground">
          {row.employees.toLocaleString()}
        </span>
        <span className="inline-flex shrink-0 items-center gap-0.5 font-inter text-[12px] font-normal tabular-nums text-[#16a34a] dark:text-[#37d8a0]">
          <TrendUp className="size-3.5 shrink-0" aria-hidden />
          {row.headcountGrowth}%
        </span>
      </div>

      {/* Funding */}
      <div
        className={cn(
          "flex min-w-0 items-center",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        <span className="truncate font-inter text-[13px] leading-none text-[#475b82] tracking-[0.01em] dark:text-muted-foreground">
          {row.funding}
        </span>
      </div>

      {/* Technologies */}
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-1",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        {row.technologies.length > 0 ? (
          <>
            <span className="inline-flex max-w-full items-center truncate rounded-[4px] bg-[#f4f5f7] px-1.5 py-0.5 font-inter text-[12px] text-[#475b82] dark:bg-muted/40 dark:text-muted-foreground">
              {row.technologies[0]}
            </span>
            {row.technologies.length > 1 && (
              <span className="shrink-0 font-inter text-[11px] text-muted-foreground/70 tabular-nums">
                +{row.technologies.length - 1}
              </span>
            )}
          </>
        ) : (
          <span className="font-inter text-[12px] text-muted-foreground/50">—</span>
        )}
      </div>

      {/* Founded */}
      <div
        className={cn(
          "flex min-w-0 items-center",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        <span className="font-inter text-[13px] leading-none tabular-nums text-[#475b82] tracking-[0.01em] dark:text-muted-foreground">
          {row.founded}
        </span>
      </div>

      {/* CRM */}
      <div
        className={cn(
          "flex min-w-0 items-center",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        {row.inCrm ? (
          <span className="inline-flex shrink-0 items-center rounded-[5px] bg-primary/10 px-1.5 py-0.5 font-inter text-[10px] font-medium text-primary">
            In CRM
          </span>
        ) : (
          <span className="font-inter text-[12px] text-muted-foreground/50">—</span>
        )}
      </div>

      {/* Job signal */}
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-1",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        {row.jobPostSnippets.length > 0 ? (
          <>
            <span
              className={cn(
                "inline-flex max-w-full items-center truncate rounded-[6px] px-1.5 py-[3px] font-inter text-[11px] leading-[12px]",
                jobKeyword &&
                  row.jobPostSnippets[0].toLowerCase().includes(jobKeyword)
                  ? "bg-[rgba(116,121,255,0.12)] font-medium text-[#5258d6] dark:text-[#9ea2ff]"
                  : "text-[#475b82] dark:text-muted-foreground",
              )}
            >
              {row.jobPostSnippets[0]}
            </span>
            {row.jobPostSnippets.length > 1 && (
              <span className="shrink-0 font-inter text-[11px] text-muted-foreground/70 tabular-nums">
                +{row.jobPostSnippets.length - 1}
              </span>
            )}
          </>
        ) : (
          <span className="font-inter text-[12px] text-muted-foreground/50">—</span>
        )}
      </div>

      {/* Signals */}
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-1",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        {showLookalike && row.lookalikeLabel ? (
          <span className={cn(TABLE_CHIP_CLASS, signalChipClass(row.lookalikeLabel))}>
            {row.lookalikeLabel}
          </span>
        ) : row.signals.length > 0 ? (
          <>
            <span className={cn(TABLE_CHIP_CLASS, signalChipClass(row.signals[0]))}>
              {row.signals[0]}
            </span>
            {row.signals.length > 1 && (
              <span className="shrink-0 font-inter text-[11px] text-muted-foreground/70 tabular-nums">
                +{row.signals.length - 1}
              </span>
            )}
          </>
        ) : (
          <span className="font-inter text-[12px] text-muted-foreground/50">—</span>
        )}
      </div>

      {/* ICP Fit */}
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-1",
          TABLE_ROW_HEIGHT,
          TABLE_CELL_PX,
        )}
      >
        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <span className={cn(TABLE_CHIP_CLASS, ICP_FIT_CHIP_CLASS[fit])}>
              {icpFitLabel(fit)}
            </span>
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-auto overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-lg"
          >
            <ScoreBreakdown row={row} />
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  )
}

function DiscardedDrawer({
  open,
  onToggle,
  rows,
  onRestore,
  pinnedOpen = false,
  onRowKeyDown,
  onRowFocus,
  getRowTabIndex,
}: {
  open: boolean
  onToggle: () => void
  rows: EvalRow[]
  onRestore: (id: string) => void
  pinnedOpen?: boolean
  onRowKeyDown: (e: KeyboardEvent<HTMLElement>, rowId: string) => void
  onRowFocus: (id: string) => void
  getRowTabIndex: (rowId: string) => 0 | -1
}) {
  const collapseTransition = useCollapseTransition()

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        disabled={pinnedOpen}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-between bg-secondary/40 px-4 py-2.5 font-inter text-[11px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          pinnedOpen && "cursor-default hover:bg-secondary/40",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-[#969696] transition-[color,transform] group-hover:text-[#777]",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
          Discarded · {rows.length}
          <span className="text-muted-foreground/60">
            (Low matches dropped from view)
          </span>
        </span>
        {!pinnedOpen && (
          <span className="text-muted-foreground/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {open ? "Hide" : "Show"}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="drawer"
            variants={collapseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={collapseTransition}
            className="overflow-hidden"
          >
            <ul
              role="list"
              aria-label="Discarded companies"
              className="divide-y divide-border/60 px-5 py-3"
            >
              {rows.length === 0 && (
                <li className="py-3 text-center font-inter text-[11px] text-muted-foreground">
                  Nothing discarded yet.
                </li>
              )}
              {rows.map((r) => (
                <li
                  key={r.id}
                  role="listitem"
                  data-focus-row={r.id}
                  tabIndex={getRowTabIndex(r.id)}
                  aria-label={`${r.name}, discarded`}
                  onFocus={() => onRowFocus(r.id)}
                  onKeyDown={(e) => onRowKeyDown(e, r.id)}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return
                    const target = e.target as HTMLElement
                    if (target.closest("button")) return
                    onRowFocus(r.id)
                  }}
                  className={cn(
                    "group flex items-center justify-between gap-3 py-2.5",
                    ROW_FOCUS_RING,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Logo domain={r.domain} name={r.name} size={24} />
                    <span className="truncate text-sm text-foreground/80">
                      {r.name}
                    </span>
                    <span className="hidden md:inline truncate font-inter text-[11px] text-muted-foreground">
                      {r.reasoning}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-0 font-inter text-[11px] transition-[gap] duration-200 ease-out group-hover:gap-2 group-focus-within:gap-2">
                    <span className="tabular-nums text-muted-foreground transition-transform duration-200 ease-out">
                      {r.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRestore(r.id)}
                      className="pointer-events-none inline-flex h-6 max-w-0 cursor-pointer items-center gap-1 overflow-hidden rounded-[6px] border-0 bg-card px-0 text-muted-foreground opacity-0 transition-[max-width,opacity,padding,border-color] duration-200 ease-out hover:bg-secondary hover:text-foreground group-hover:pointer-events-auto group-hover:max-w-[5rem] group-hover:border group-hover:border-border group-hover:px-2 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:max-w-[5rem] group-focus-within:border group-focus-within:border-border group-focus-within:px-2 group-focus-within:opacity-100 focus-visible:pointer-events-auto focus-visible:max-w-[5rem] focus-visible:border focus-visible:border-border focus-visible:px-2 focus-visible:opacity-100"
                    >
                      <Undo2 className="size-3 shrink-0" />
                      <span className="shrink-0">Restore</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
