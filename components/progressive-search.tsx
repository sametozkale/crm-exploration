"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { AnimatePresence, motion, LayoutGroup } from "framer-motion"
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpWideNarrow,
  ArrowUpRight,
  ChevronDown,
  Filter,
  Info,
  ScanSearch,
  Search,
  SearchX,
  MagicWand,
  Undo2,
  Users,
  X,
} from "@/components/icons"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { ZeroWordmark } from "@/components/zero-wordmark"
import { COMPANIES, type Company, type Tier } from "@/lib/data"
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

// Approx total to display in the "evaluated of" counter, to suggest scale.
const TOTAL_CANDIDATES = 12_487

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

export function ProgressiveSearch() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [draft, setDraft] = useState(DEFAULT_PROMPT)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
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
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const timeoutsRef = useRef<number[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const clearTimers = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t))
    timeoutsRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const startSearch = (q: string) => {
    clearTimers()
    setPrompt(q)
    setRunning(true)
    setDone(false)
    setEvaluatedCount(0)
    setActiveIds([])
    setShowDiscarded(false)
    setTierFilter("all")
    setTierSectionsOpen({ ...DEFAULT_TIER_SECTIONS_OPEN })

    const reset: EvalRow[] = COMPANIES.map((c) => ({ ...c, state: "pending" }))
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
                    state: r.tier === "low" ? "discarded" : "classified",
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
    const t = window.setTimeout(() => startSearch(DEFAULT_PROMPT), 350)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = () => {
    if (!draft.trim()) return
    startSearch(draft.trim())
  }

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

  const discardedRows = useMemo(
    () => rows.filter((r) => r.state === "discarded"),
    [rows],
  )

  const visibleRows = useMemo(() => {
    if (tierFilter === "discarded") return discardedRows
    const flat: EvalRow[] = []
    for (const tier of TIERS_IN_ORDER) {
      if (tierFilter !== "all" && tierFilter !== tier) continue
      if (tierSectionsOpen[tier]) flat.push(...rowsByTier[tier])
    }
    return flat
  }, [rowsByTier, tierSectionsOpen, tierFilter, discardedRows])

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

  const progress = running
    ? Math.min(100, (evaluatedCount / COMPANIES.length) * 100)
    : 0

  const fakeEvaluated = Math.round(
    (evaluatedCount / COMPANIES.length) * TOTAL_CANDIDATES,
  )

  const activeName =
    activeIds
      .map((id) => rows.find((r) => r.id === id)?.name ?? "")
      .filter(Boolean)
      .slice(-1)[0] ?? null

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  // Global keyboard navigation across the living result set.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA"

      if (e.key === "/" && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
        return
      }
      if (typing) return
      if ((e.key === "Escape" || e.key === "Esc") && selectedId) {
        setSelectedId(null)
        return
      }
      if (!visibleRows.length) return

      const i = visibleRows.findIndex((r) => r.id === selectedId)
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault()
        const next = visibleRows[i < 0 ? 0 : Math.min(visibleRows.length - 1, i + 1)]
        setSelectedId(next.id)
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault()
        const prev = visibleRows[i < 0 ? 0 : Math.max(0, i - 1)]
        setSelectedId(prev.id)
      } else if (e.key === "Enter" && selectedId) {
        const row = visibleRows.find((r) => r.id === selectedId)
        if (row) window.open(`https://${row.domain}`, "_blank", "noopener")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [visibleRows, selectedId])

  // Keep the selected row in view as the user navigates.
  useEffect(() => {
    if (!selectedId) return
    const node = document.querySelector(`[data-row-id="${selectedId}"]`)
    node?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedId])

  return (
    <TooltipProvider delayDuration={120}>
    <main className="relative min-h-dvh">
      <BackgroundGrid />

      <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-32 md:px-8">
        <Header />

        {/* Prompt */}
        <section className="mt-8">
          <div
            className={cn(
              "group relative rounded-xl border bg-card transition-colors",
              running ? "border-primary/40" : "border-border",
            )}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder="Describe what you're looking for…"
                className="flex h-10 flex-1 resize-none items-center bg-transparent py-2.5 text-base leading-5 outline-none placeholder:text-muted-foreground/70"
              />
              <div className="flex shrink-0 items-center gap-2">
                {running ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearTimers()
                      setRunning(false)
                      setDone(true)
                      setActiveIds([])
                    }}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-muted/50 px-3 font-inter text-[11px] text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3 opacity-70" />
                    Stop
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md bg-black px-2.5 font-inter text-[11px] font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  <MagicWand className="size-3 text-current" />
                  {running ? "Re-run" : done ? "Run again" : "Run"}
                </button>
              </div>
            </div>

            {/* Progress rule — primary fill only while evaluating */}
            <div className="relative h-px overflow-hidden bg-border">
              <AnimatePresence>
                {running && (
                  <>
                    <motion.div
                      key="scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 scanline"
                    />
                    <motion.div
                      key="fill"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 font-inter text-[11px] text-muted-foreground">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      running
                        ? "bg-primary animate-pulse"
                        : done
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/40",
                    )}
                  />
                  {running ? "Evaluating" : done ? "Complete" : "Idle"}
                </span>
                {activeIds.length > 0 && (
                  <>
                    <span className="hidden sm:inline-block h-3 w-px bg-border" />
                    <span className="hidden md:inline-flex min-w-0 items-center gap-1.5">
                      <ArrowRight
                        className="size-3 shrink-0 text-foreground/70 animate-nudge-right"
                        aria-hidden
                      />
                      <span className="truncate">
                        Scanning{" "}
                        {activeIds
                          .map(
                            (id) => rows.find((r) => r.id === id)?.name ?? "",
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </span>
                  </>
                )}
              </div>
              <span className="shrink-0 tabular-nums">
                {fakeEvaluated.toLocaleString()} /{" "}
                {TOTAL_CANDIDATES.toLocaleString()} Candidates
              </span>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="mt-6 flex items-center justify-between gap-4">
          <FilterControl
            value={tierFilter}
            onChange={setTierFilter}
            hasLowRows={rowsByTier.low.length > 0}
          />
          <SortControl sort={sort} onChange={setSort} />
        </section>

        {/* Results list */}
        <section className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          {hasVisibleResults && tierFilter !== "discarded" && (
            <div className="grid grid-cols-12 gap-x-4 gap-y-1 border-b border-border bg-secondary/50 px-5 py-2.5 font-inter text-[11px] font-medium text-muted-foreground">
              <div className="col-span-12 md:col-span-4">Company</div>
              <div className="col-span-12 md:col-span-4">Match · reasoning</div>
              <div className="hidden md:col-span-2 md:block">Signals</div>
              <div className="hidden md:col-span-2 md:block text-right">Meta</div>
            </div>
          )}

          <div className="divide-y divide-border">
            <LayoutGroup>
              {TIERS_IN_ORDER.map((tier) => {
                if (!showTierSection(tier)) return null
                const tierRows = rowsByTier[tier]
                if (tierRows.length === 0) return null
                return (
                  <TierResultsSection
                    key={tier}
                    tier={tier}
                    open={tierSectionsOpen[tier]}
                    onToggle={() =>
                      setTierSectionsOpen((cur) => ({
                        ...cur,
                        [tier]: !cur[tier],
                      }))
                    }
                    rows={tierRows}
                    selectedId={selectedId}
                    hoverId={hoverId}
                    onSelect={setSelectedId}
                    onHover={setHoverId}
                  />
                )
              })}
            </LayoutGroup>

            {showDiscardedSection && (
              <DiscardedDrawer
                open={tierFilter === "discarded" ? true : showDiscarded}
                onToggle={() => {
                  if (tierFilter === "discarded") return
                  setShowDiscarded((s) => !s)
                }}
                rows={discardedRows}
                onRestore={restoreRow}
                pinnedOpen={tierFilter === "discarded"}
              />
            )}
          </div>

          {/* Empty states */}
          {!hasVisibleResults &&
            (running ? (
              <ScanningPlaceholder activeName={activeName} />
            ) : (
              <EmptyState
                icon={SearchX}
                title="No strong matches found"
                body="Nothing cleared the bar for this prompt. Try broadening the criteria or loosening a constraint, then run again."
                action={{
                  label: "Refine prompt",
                  onClick: () => inputRef.current?.focus(),
                }}
              />
            ))}

        </section>

      </div>
    </main>
    </TooltipProvider>
  )
}

/* ───────── components ────────── */

function Header() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <ZeroWordmark />
        <span className="mx-0.5 h-4 w-px bg-border" />
        <span className="font-inter text-[11px] uppercase text-muted-foreground">
          progressive search
        </span>
      </div>
      <ThemeToggle />
    </header>
  )
}

function BackgroundGrid() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-bg opacity-50" />
  )
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="relative mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-secondary">
        <span className="absolute inset-0 rounded-xl bg-primary/5" />
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <h3 className="font-sans text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-pretty text-[13px] leading-relaxed text-muted-foreground">
        {body}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 font-inter text-[11px] text-foreground transition hover:bg-secondary"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}

function ScanningPlaceholder({ activeName }: { activeName: string | null }) {
  return (
    <div className="px-5 py-8">
      <div className="flex items-center justify-center gap-2 pb-6 font-inter text-[11px] text-muted-foreground">
        <ScanSearch className="size-3.5 text-primary" />
        <span>
          Evaluating candidates
          {activeName ? (
            <>
              {" · "}
              <span className="text-foreground/80">{activeName}</span>
            </>
          ) : null}
        </span>
      </div>
      <ul className="space-y-3" aria-hidden>
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center gap-3"
            style={{ opacity: 1 - i * 0.28 }}
          >
            <span className="size-9 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
              <span className="block size-full scanline opacity-40" />
            </span>
            <div className="flex-1 space-y-2">
              <span className="block h-2.5 w-1/3 overflow-hidden rounded bg-secondary">
                <span className="block size-full scanline opacity-40" />
              </span>
              <span className="block h-2 w-2/3 overflow-hidden rounded bg-secondary">
                <span className="block size-full scanline opacity-30" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function tierSectionHint(tier: Tier) {
  return tier === "high"
    ? "Strong fit for this prompt"
    : tier === "medium"
      ? "Partial or indirect alignment"
      : "Weak signal — review before acting"
}

function tierDotClass(tier: Tier) {
  return tier === "high"
    ? "bg-emerald-500"
    : tier === "medium"
      ? "bg-tier-medium"
      : "bg-muted-foreground"
}

function TierSectionLabel({ tier }: { tier: Tier }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full border px-1.5 py-0 font-inter text-[10px] font-medium leading-none",
        tier === "high" &&
          "border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
        tier === "medium" &&
          "border-yellow-500/15 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400",
        tier === "low" && "border-border bg-muted/60 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          tier === "high" && "bg-emerald-500",
          tier === "medium" && "bg-yellow-500",
          tier === "low" && "bg-muted-foreground",
        )}
        aria-hidden
      />
      {tierLabel(tier)}
    </span>
  )
}

function TierResultsSection({
  tier,
  open,
  onToggle,
  rows,
  selectedId,
  hoverId,
  onSelect,
  onHover,
}: {
  tier: Tier
  open: boolean
  onToggle: () => void
  rows: EvalRow[]
  selectedId: string | null
  hoverId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full cursor-pointer items-center justify-between bg-secondary/50 px-5 py-3 font-inter text-[11px] text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-[#777] transition-transform",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
          <TierSectionLabel tier={tier} />
          <span className="tabular-nums text-muted-foreground">· {rows.length}</span>
          <span className="hidden text-muted-foreground/60 sm:inline">
            ({tierSectionHint(tier)})
          </span>
        </span>
        <span className="shrink-0 text-muted-foreground/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="tier-rows"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-border">
              <AnimatePresence mode="popLayout" initial={false}>
                {rows.map((row) => (
                  <motion.li
                    key={row.id}
                    layout
                    data-row-id={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      layout: { type: "spring", stiffness: 400, damping: 36 },
                      opacity: { duration: 0.16 },
                      y: { duration: 0.16 },
                    }}
                    onMouseEnter={() => onHover(row.id)}
                    onMouseLeave={() => onHover(null)}
                    onClick={() => onSelect(row.id)}
                    className={cn(
                      "group relative grid cursor-pointer grid-cols-12 gap-x-4 gap-y-2 px-5 py-3.5 outline-none transition-colors md:gap-y-0",
                      "hover:bg-secondary/50",
                      selectedId === row.id
                        ? "bg-secondary/70"
                        : hoverId === row.id && "bg-secondary/50",
                    )}
                  >
                    {selectedId === row.id && (
                      <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                    )}
                    <Row row={row} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type FilterOption = {
  key: TierFilter
  label: string
  dotClass?: string
}

function filterOptions(hasLowRows: boolean): FilterOption[] {
  return [
    { key: "all", label: "All" },
    { key: "high", label: "High", dotClass: "bg-emerald-500" },
    { key: "medium", label: "Medium", dotClass: "bg-tier-medium" },
    ...(hasLowRows
      ? [{ key: "low" as const, label: "Low", dotClass: "bg-muted-foreground" }]
      : []),
    {
      key: "discarded",
      label: "Discarded",
      dotClass: "bg-muted-foreground/40",
    },
  ]
}

function FilterControl({
  value,
  onChange,
  hasLowRows,
}: {
  value: TierFilter
  onChange: (value: TierFilter) => void
  hasLowRows: boolean
}) {
  const options = filterOptions(hasLowRows)
  const selected = options.find((o) => o.key === value) ?? options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Filter: ${selected.label}`}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-2.5 font-inter text-[11px] text-foreground transition-colors hover:bg-secondary/40 dark:bg-card"
        >
          <Filter className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="inline-flex items-center gap-1.5 font-medium">
            {selected.dotClass && (
              <span
                className={cn("size-1.5 shrink-0 rounded-full", selected.dotClass)}
                aria-hidden
              />
            )}
            {selected.label}
          </span>
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[9.5rem] font-inter text-[11px]"
      >
        {options.map((o) => (
          <DropdownMenuItem
            key={o.key}
            onSelect={() => onChange(o.key)}
            className={cn(
              "cursor-pointer gap-2 py-1.5 text-[11px] focus:bg-secondary/60 focus:text-foreground",
              value === o.key && "bg-secondary/60 font-medium",
            )}
          >
            {o.dotClass ? (
              <span
                className={cn("size-1.5 shrink-0 rounded-full", o.dotClass)}
                aria-hidden
              />
            ) : (
              <span className="size-1.5 shrink-0" aria-hidden />
            )}
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SortControl({
  sort,
  onChange,
}: {
  sort: { key: SortKey; dir: SortDir }
  onChange: (s: { key: SortKey; dir: SortDir }) => void
}) {
  const opts: { key: SortKey; label: string }[] = [
    { key: "score", label: "Match" },
    { key: "name", label: "Name" },
    { key: "employees", label: "Size" },
    { key: "founded", label: "Founded" },
  ]
  return (
    <div
      role="group"
      aria-label="Sort by"
      className="inline-flex h-8 items-center gap-0.5 rounded-md border border-border bg-white p-0.5 font-inter text-[11px] dark:bg-card"
    >
      {opts.map((o) => {
        const selected = sort.key === o.key
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={selected}
            onClick={() =>
              onChange({
                key: o.key,
                dir:
                  selected
                    ? sort.dir === "desc"
                      ? "asc"
                      : "desc"
                    : o.key === "name"
                      ? "asc"
                      : "desc",
              })
            }
            className={cn(
              "inline-flex h-full cursor-pointer items-center gap-1 rounded-inset-control px-2.5 transition-colors duration-150",
              selected
                ? "bg-muted/60 font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
          >
            {o.label}
            {selected &&
              (sort.dir === "asc" ? (
                <ArrowUpWideNarrow
                  className="size-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : (
                <ArrowDownWideNarrow
                  className="size-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ))}
          </button>
        )
      })}
    </div>
  )
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

function Logo({ domain, name, size = 36 }: { domain: string; name: string; size?: number }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const colorScheme = mounted && resolvedTheme === "dark" ? "dark" : "light"
  const svglUrl = resolveSvglLogo(domain, colorScheme)
  const sources = useMemo(() => logoSources(domain, svglUrl), [domain, svglUrl])
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const exhausted = idx >= sources.length
  const src = exhausted ? null : sources[idx]

  useEffect(() => {
    setIdx(0)
    setLoaded(false)
  }, [domain, svglUrl])

  const advanceOrShow = (img: HTMLImageElement, currentSrc: string) => {
    if (isLogoImageUsable(img, currentSrc)) {
      setLoaded(true)
      return
    }
    setLoaded(false)
    setIdx((i) => i + 1)
  }

  useLayoutEffect(() => {
    const img = imgRef.current
    if (!img || !src || !img.complete) return
    advanceOrShow(img, src)
  }, [src, idx, domain, svglUrl])

  const initials = name
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-secondary"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* initials sit underneath as the resting/fallback layer */}
      <span className="absolute font-inter text-[11px] font-medium text-muted-foreground">
        {initials || "·"}
      </span>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          key={src}
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className={cn(
            "relative size-full bg-background object-contain p-1 transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={(e) => {
            if (!src) return
            advanceOrShow(e.currentTarget, src)
          }}
          onError={() => {
            setLoaded(false)
            setIdx((i) => i + 1)
          }}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  )
}

function tierLabel(tier: Tier) {
  return tier === "high"
    ? "High match"
    : tier === "medium"
      ? "Medium match"
      : "Low match"
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
    { label: "Category", value: row.category },
    { label: "HQ", value: row.hq },
    { label: "Headcount", value: `${row.employees} people` },
    { label: "Founded", value: String(row.founded) },
    { label: "Funding", value: row.funding },
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
      </div>
    </HoverCardContent>
  )
}

function Row({ row }: { row: EvalRow }) {
  return (
    <>
      <div className="col-span-12 flex min-w-0 items-start gap-3 md:col-span-4">
        <Logo domain={row.domain} name={row.name} />
        <div className="min-w-0 flex-1">
          <HoverCard openDelay={120} closeDelay={80}>
            <HoverCardTrigger asChild>
              <div className="min-w-0 cursor-pointer">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-sans text-sm font-medium text-foreground decoration-dotted underline-offset-4 group-hover:underline">
                    {row.name}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-inter text-[11px] text-muted-foreground">
                  {row.tagline}
                </p>
              </div>
            </HoverCardTrigger>
            <CompanyHoverCard row={row} />
          </HoverCard>
          <a
            href={`https://${row.domain}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex cursor-pointer items-center font-inter text-[11px] text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-foreground"
          >
            {row.domain}
            <ArrowUpRight className="ml-0.5 size-3" />
          </a>
        </div>
      </div>

      <div className="col-span-12 min-w-0 md:col-span-4">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex min-w-0 flex-1 cursor-help items-center gap-2.5">
                <span className="shrink-0 font-inter text-sm font-medium tabular-nums text-foreground">
                  {row.score}
                </span>
                <ScoreBar score={row.score} tier={row.tier} />
                <Info className="size-3 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-auto overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-lg"
            >
              <ScoreBreakdown row={row} />
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-foreground/85">
          {row.reasoning}
        </p>
      </div>

      <div className="col-span-12 min-w-0 md:col-span-2">
        {row.signals.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.signals.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 font-inter text-[10px] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="col-span-12 flex flex-wrap gap-x-3 gap-y-0.5 font-inter text-[11px] text-muted-foreground md:col-span-2 md:flex-col md:items-end md:gap-0.5">
        <span>{row.hq}</span>
        <span>
          {row.employees} ppl · {row.founded}
        </span>
        <span className="text-muted-foreground/80">{row.funding}</span>
      </div>
    </>
  )
}

function ScoreBar({ score, tier }: { score: number; tier: Tier }) {
  const color =
    tier === "high"
      ? "bg-emerald-500"
      : tier === "medium"
        ? "bg-tier-medium"
        : "bg-muted-foreground"
  return (
    <div className="relative h-1 w-full min-w-[80px] max-w-[200px] flex-1 overflow-hidden rounded-full bg-secondary">
      <motion.div
        className={cn("absolute inset-y-0 left-0", color)}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      />
    </div>
  )
}

function DiscardedDrawer({
  open,
  onToggle,
  rows,
  onRestore,
  pinnedOpen = false,
}: {
  open: boolean
  onToggle: () => void
  rows: EvalRow[]
  onRestore: (id: string) => void
  pinnedOpen?: boolean
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        disabled={pinnedOpen}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-between bg-secondary/50 px-5 py-3 font-inter text-[11px] text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          pinnedOpen && "cursor-default hover:bg-secondary/50",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-[#777] transition-transform",
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-border/60 px-5 py-3">
              {rows.length === 0 && (
                <li className="py-3 text-center font-inter text-[11px] text-muted-foreground">
                  Nothing discarded yet.
                </li>
              )}
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-2.5"
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
                  <div className="flex shrink-0 items-center gap-2 font-inter text-[11px]">
                    <span className="tabular-nums text-muted-foreground">
                      {r.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRestore(r.id)}
                      className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-[5px] border border-border bg-card px-2 text-muted-foreground transition hover:text-foreground hover:bg-secondary"
                    >
                      <Undo2 className="size-3" />
                      Restore
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
