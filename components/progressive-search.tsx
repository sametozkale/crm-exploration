"use client"

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react"
import { toast } from "sonner"
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
  Search,
  SearchX,
  EditPrompt,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ThemeToggle } from "@/components/theme-toggle"
import { ZeroWordmark } from "@/components/zero-wordmark"
import { COMPANIES, type Company, type Tier } from "@/lib/data"
import { isPromptRelevant } from "@/lib/prompt-match"
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
  const [promptRelevant, setPromptRelevant] = useState(true)

  const timeoutsRef = useRef<number[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const searchGenerationRef = useRef(0)
  const lastToastedGenerationRef = useRef(0)

  const clearTimers = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t))
    timeoutsRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const startSearch = (q: string) => {
    clearTimers()
    searchGenerationRef.current += 1
    const relevant = isPromptRelevant(q)
    setPromptRelevant(relevant)
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
    if (!done) return
    if (lastToastedGenerationRef.current === searchGenerationRef.current) return
    lastToastedGenerationRef.current = searchGenerationRef.current
    toast("Search completed", { icon: null })
  }, [done])

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
    () =>
      promptRelevant ? rows.filter((r) => r.state === "discarded") : [],
    [rows, promptRelevant],
  )

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

  const fadeSlideProps = useFadeSlideMotionProps()
  const collapseTransition = useCollapseTransition()
  const actionTransition = useMotionTransition(0.18)

  const fakeEvaluated = Math.round(
    (evaluatedCount / COMPANIES.length) * TOTAL_CANDIDATES,
  )

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const focusPromptAndSelectAll = () => {
    const el = inputRef.current
    if (!el) return
    el.focus()
    requestAnimationFrame(() => {
      el.setSelectionRange(0, el.value.length)
    })
  }

  const resetApp = () => {
    clearTimers()
    searchGenerationRef.current += 1
    setRunning(false)
    setDone(false)
    setPrompt("")
    setDraft("")
    setEvaluatedCount(0)
    setActiveIds([])
    setShowDiscarded(false)
    setTierFilter("all")
    setTierSectionsOpen({ ...DEFAULT_TIER_SECTIONS_OPEN })
    setPromptRelevant(true)
    setHoverId(null)
    setRows(COMPANIES.map((c) => ({ ...c, state: "pending" })))
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  // Focus prompt with "/" when not typing in a field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA"
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
    <main className="relative min-h-dvh">
      <BackgroundGrid />

      <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-32 md:px-8">
        <Header onLogoClick={resetApp} />

        {/* Prompt */}
        <section className="mt-8">
          <div
            className={cn(
              "group relative overflow-hidden rounded-xl transition-colors",
              running ? "p-px" : "border border-border bg-card",
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
                "relative z-[1] overflow-hidden bg-card",
                running ? "prompt-card-surface-inset" : "rounded-xl",
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
              {(running || draft.trim().length > 0) && (
                <div className="flex h-8 shrink-0 items-center gap-2">
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
                      </motion.div>
                    ) : null}
                    {draft.trim().length > 0 ? (
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
                          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-black px-2.5 font-inter text-[12px] font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                          <MagicWand className="size-3 text-current" />
                          {running ? "Re-run" : done ? "Run again" : "Run"}
                        </button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <AnimatePresence initial={false}>
              {!isResultsIdle ? (
                <motion.div
                  key="status-bar"
                  variants={collapseVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={collapseTransition}
                  className="overflow-hidden"
                >
                  <div className="h-px bg-border" />

                  {/* Status bar */}
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 font-inter text-[11px] text-muted-foreground">
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
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

        {/* Toolbar */}
        <section className="mt-6 flex items-center justify-between gap-4 [&_.font-inter]:![letter-spacing:-0.01em]">
          <FilterControl
            value={tierFilter}
            onChange={setTierFilter}
            hasLowRows={rowsByTier.low.length > 0}
            disabled={isResultsIdle}
          />
          <SortControl
            sort={sort}
            onChange={setSort}
            disabled={isResultsIdle}
          />
        </section>

        {/* Results list */}
        <section className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <AnimatePresence mode="wait" initial={false}>
            {resultsPanelKey === "results" ? (
              <motion.div key="results" {...fadeSlideProps}>
                {hasVisibleResults && tierFilter !== "discarded" && (
                  <div className="grid grid-cols-12 gap-x-4 gap-y-1 border-b border-border bg-secondary/50 px-5 py-2.5 font-inter text-[11px] font-medium text-muted-foreground">
                    <div className="col-span-12 md:col-span-4">Company</div>
                    <div className="col-span-12 md:col-span-4">
                      Score · Reasoning
                    </div>
                    <div className="hidden md:col-span-2 md:block">Signals</div>
                    <div className="hidden md:col-span-2 md:block text-right">
                      Meta
                    </div>
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
                          hoverId={hoverId}
                          onHover={setHoverId}
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
                    />
                  )}
                </div>
              </motion.div>
            ) : null}

            {resultsPanelKey === "idle" ? (
              <EmptyState
                key="idle"
                variant="no-match"
                size="lg"
                icon={Search}
                title="Run a search to see results"
                body="Describe companies in plain language — we score matches, sort tiers, and park weak fits in Discarded."
                action={{
                  label: draft.trim() ? "Run search" : "Use sample prompt",
                  icon: MagicWand,
                  onClick: () => {
                    const q = draft.trim() || DEFAULT_PROMPT
                    if (!draft.trim()) setDraft(DEFAULT_PROMPT)
                    startSearch(q)
                  },
                }}
              />
            ) : null}

            {resultsPanelKey === "scanning" ? (
              <ScanningPlaceholder key="scanning" />
            ) : null}

            {resultsPanelKey === "no-match-irrelevant" ? (
              <EmptyState
                key="no-match-irrelevant"
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
            ) : null}

            {resultsPanelKey === "no-match-empty" ? (
              <EmptyState
                key="no-match-empty"
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
            ) : null}
          </AnimatePresence>
        </section>

      </div>
    </main>
    </TooltipProvider>
  )
}

/* ───────── components ────────── */

function Header({ onLogoClick }: { onLogoClick?: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        {onLogoClick ? (
          <button
            type="button"
            onClick={onLogoClick}
            className="cursor-pointer rounded-sm border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label="Reset and edit prompt"
          >
            <ZeroWordmark />
          </button>
        ) : (
          <ZeroWordmark />
        )}
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
  size = "default",
  icon: Icon,
  title,
  body,
  hints,
  action,
}: {
  variant?: "default" | "no-match"
  size?: "default" | "lg"
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
        "font-sans font-semibold tracking-tight text-foreground",
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
          ? "border border-border bg-white px-2.5 text-[#777] transition-colors hover:border-[#eee] hover:bg-white hover:text-[#646464] dark:border-border dark:bg-white dark:text-[#323232] dark:hover:border-neutral-500 dark:hover:bg-white dark:hover:text-[#323232]"
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
          ? size === "lg"
            ? "group relative min-h-[min(28rem,58vh)] py-16 sm:py-20"
            : "group relative min-h-[min(22rem,52vh)] py-14 sm:py-16"
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
  hoverId,
  onHover,
}: {
  tier: Tier
  open: boolean
  onToggle: () => void
  rows: EvalRow[]
  hoverId: string | null
  onHover: (id: string | null) => void
}) {
  const collapseTransition = useCollapseTransition()
  const rowTransition = useRowMotionTransition()

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
            variants={collapseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={collapseTransition}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-border">
              <AnimatePresence mode="popLayout" initial={false}>
                {rows.map((row) => (
                  <motion.li
                    key={row.id}
                    layout={rowTransition.layout}
                    data-row-id={row.id}
                    initial={{ opacity: 0, y: rowTransition.enterY }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: rowTransition.exitY }}
                    transition={rowTransition.transition}
                    onMouseEnter={() => onHover(row.id)}
                    onMouseLeave={() => onHover(null)}
                    className={cn(
                      "group relative grid grid-cols-12 gap-x-4 gap-y-2 px-5 py-3.5 outline-none transition-colors md:gap-y-0",
                      "hover:bg-secondary/50",
                      hoverId === row.id && "bg-secondary/50",
                    )}
                  >
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
}

function filterOptions(hasLowRows: boolean): FilterOption[] {
  return [
    { key: "all", label: "All" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    ...(hasLowRows ? [{ key: "low" as const, label: "Low" }] : []),
    { key: "discarded", label: "Discarded" },
  ]
}

function FilterControl({
  value,
  onChange,
  hasLowRows,
  disabled = false,
}: {
  value: TierFilter
  onChange: (value: TierFilter) => void
  hasLowRows: boolean
  disabled?: boolean
}) {
  const options = filterOptions(hasLowRows)
  const selected = options.find((o) => o.key === value) ?? options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          aria-label={`Filter: ${selected.label}`}
          aria-disabled={disabled}
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border border-border bg-white px-2.5 font-inter text-[11px] text-foreground transition-colors dark:bg-card",
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-secondary/40",
          )}
        >
          <Filter className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="font-medium">{selected.label}</span>
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
              "cursor-pointer py-1.5 text-[11px] focus:bg-secondary/60 focus:text-foreground",
              value === o.key && "bg-secondary/60 font-medium",
            )}
          >
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
  disabled = false,
}: {
  sort: { key: SortKey; dir: SortDir }
  onChange: (s: { key: SortKey; dir: SortDir }) => void
  disabled?: boolean
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
      aria-disabled={disabled}
      className={cn(
        "inline-flex h-8 items-center gap-0.5 rounded-md border border-border bg-white p-0.5 font-inter text-[11px] dark:bg-card",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {opts.map((o) => {
        const selected = sort.key === o.key
        return (
          <button
            key={o.key}
            type="button"
            disabled={disabled}
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
              "inline-flex h-full items-center gap-1 rounded-inset-control px-2.5 transition-colors duration-150",
              disabled
                ? "cursor-not-allowed"
                : "cursor-pointer",
              selected
                ? "bg-muted/60 font-medium text-foreground"
                : "text-muted-foreground",
              !disabled &&
                !selected &&
                "hover:bg-muted/40 hover:text-foreground",
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
  const barTransition = useMotionTransition(0)
  const reduceMotion = barTransition.duration === 0

  return (
    <div className="relative h-1 w-full min-w-[80px] max-w-[200px] flex-1 overflow-hidden rounded-full bg-secondary">
      <motion.div
        className={cn("absolute inset-y-0 left-0", color)}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 160, damping: 22 }
        }
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
  const collapseTransition = useCollapseTransition()

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
            variants={collapseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={collapseTransition}
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
                      className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-[6px] border border-border bg-card px-2 text-muted-foreground transition hover:text-foreground hover:bg-secondary"
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
