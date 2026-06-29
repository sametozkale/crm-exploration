"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { isDemo2PromptRelevant } from "@/lib/demo2-prompt-match"
import {
  analyzePromptClarity,
  buildClarificationScenario,
  type ClarificationResolution,
  type ClarificationScenario,
} from "@/lib/prompt-clarity"
import { ClarificationPanel } from "./clarification/clarification-panel"
import { Demo2ChatPanel } from "./chat-panel"
import { DEMO2_COMPANIES } from "./demo-2-data"
import {
  DEMO2_RESULTS_SHELL_ENTER,
  DEMO2_RUN_SHIMMER_MS,
  DEMO2_SIDEBAR_COLLAPSE,
} from "./demo-2-motion"
import { DEMO2_SIZES, getDemo2ChatPromptSlotRect } from "./demo-2-tokens"
import { Demo2HomePanel } from "./home-panel"
import { Demo2HomeSidebar } from "./home-sidebar"
import { Demo2IconRail } from "./icon-rail"
import { Demo2ResultsPanel } from "./results-panel"
import { PromptFlightOverlay } from "./prompt-flight-overlay"
import { useDemo2SearchRun } from "./use-demo2-search-run"

type Demo2Phase = "home" | "clarification" | "results"

/** Demo 2 — home → optional clarification → results */
export function ProgressiveSearch() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Demo2Phase>("home")
  const [prompt, setPrompt] = useState("")
  const [resolvedPrompt, setResolvedPrompt] = useState("")
  const [clarificationCase, setClarificationCase] = useState<ClarificationScenario | null>(
    null,
  )
  const [openFiltersOnResults, setOpenFiltersOnResults] = useState(false)
  const [isRunShimmer, setIsRunShimmer] = useState(false)
  const [isPromptLayoutFlying, setIsPromptLayoutFlying] = useState(false)
  const [homeExiting, setHomeExiting] = useState(false)
  const [resultsSession, setResultsSession] = useState(0)
  const [hasMatchingResults, setHasMatchingResults] = useState(true)
  const runTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const layoutFlightEndedRef = useRef(false)
  const promptCardRef = useRef<HTMLDivElement>(null)
  const chatPromptSlotRef = useRef<HTMLDivElement>(null)
  const [isGrayShellHiding, setIsGrayShellHiding] = useState(false)
  const [flightFromRect, setFlightFromRect] = useState<DOMRect | null>(null)
  const [flightToRect, setFlightToRect] = useState<DOMRect | null>(null)
  const [showFlightOverlay, setShowFlightOverlay] = useState(false)
  const grayShellHiddenRef = useRef(false)

  const searchRun = useDemo2SearchRun({
    active: phase === "results",
    totalRows: hasMatchingResults ? DEMO2_COMPANIES.length : 0,
    reduceMotion,
    sessionKey: resultsSession,
  })

  const clearRunTimers = useCallback(() => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current)
    runTimerRef.current = null
  }, [])

  useEffect(() => clearRunTimers, [clearRunTimers])

  const finishLayoutFlight = useCallback(() => {
    setShowFlightOverlay(false)
    setFlightFromRect(null)
    setFlightToRect(null)
    setHomeExiting(false)
    setIsPromptLayoutFlying(false)
    setIsGrayShellHiding(false)
    setIsRunShimmer(false)
    grayShellHiddenRef.current = false
  }, [])

  const handlePromptLayoutFlightComplete = useCallback(() => {
    if (layoutFlightEndedRef.current) return
    layoutFlightEndedRef.current = true
    finishLayoutFlight()
  }, [finishLayoutFlight])

  const startPromptFlight = useCallback(() => {
    layoutFlightEndedRef.current = false
    const fromRect = promptCardRef.current?.getBoundingClientRect() ?? null
    const toRect = getDemo2ChatPromptSlotRect()
    setFlightFromRect(fromRect)
    setFlightToRect(toRect)
    setShowFlightOverlay(Boolean(fromRect))
    setResultsSession((n) => n + 1)
    setHomeExiting(true)
    setPhase("results")
    setIsPromptLayoutFlying(true)

    if (reduceMotion) {
      handlePromptLayoutFlightComplete()
    }
  }, [handlePromptLayoutFlightComplete, reduceMotion])

  const handleGrayShellHidden = useCallback(() => {
    if (grayShellHiddenRef.current) return
    grayShellHiddenRef.current = true
    startPromptFlight()
  }, [startPromptFlight])

  const beginResultsTransition = useCallback(
    (trimmed: string, openFilters = false) => {
      grayShellHiddenRef.current = false
      setResolvedPrompt(trimmed)
      setHasMatchingResults(isDemo2PromptRelevant(trimmed))
      setOpenFiltersOnResults(openFilters)
      setIsGrayShellHiding(true)
      startPromptFlight()
    },
    [startPromptFlight],
  )

  const finishRun = useCallback(
    (trimmed: string, caseId: ReturnType<typeof analyzePromptClarity>) => {
      if (caseId) {
        setClarificationCase(buildClarificationScenario(caseId, trimmed))
        setIsRunShimmer(false)
        setPhase("clarification")
        return
      }
      beginResultsTransition(trimmed)
    },
    [beginResultsTransition],
  )

  const handleRun = () => {
    const trimmed = prompt.trim()
    if (!trimmed || isRunShimmer) return

    const caseId = analyzePromptClarity(trimmed)
    setIsRunShimmer(true)
    layoutFlightEndedRef.current = false
    clearRunTimers()

    const delay = reduceMotion ? 0 : DEMO2_RUN_SHIMMER_MS
    runTimerRef.current = setTimeout(() => finishRun(trimmed, caseId), delay)
  }

  const handleClarificationResolve = (resolution: ClarificationResolution) => {
    setClarificationCase(null)
    setResolvedPrompt(resolution.prompt)
    setHasMatchingResults(isDemo2PromptRelevant(resolution.prompt))
    setOpenFiltersOnResults(resolution.kind === "open_filters")
    setResultsSession((n) => n + 1)
    setIsRunShimmer(false)
    setPhase("results")
  }

  const handleStartNewSearch = useCallback(() => {
    clearRunTimers()
    layoutFlightEndedRef.current = false
    setPhase("home")
    setPrompt("")
    setResolvedPrompt("")
    setClarificationCase(null)
    setOpenFiltersOnResults(false)
    setHomeExiting(false)
    finishLayoutFlight()
    setHasMatchingResults(true)
  }, [clearRunTimers, finishLayoutFlight])

  const handleFollowUpSubmit = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setPrompt(trimmed)
    setResolvedPrompt(trimmed)
    setHasMatchingResults(isDemo2PromptRelevant(trimmed))
    setOpenFiltersOnResults(false)
    setResultsSession((n) => n + 1)
  }, [])

  const sidebarHeldWide = isPromptLayoutFlying || homeExiting
  const showFlyPrompt =
    Boolean(resolvedPrompt) &&
    (isPromptLayoutFlying || searchRun.phase === "running")
  const promptShimmerActive =
    isRunShimmer || isPromptLayoutFlying || searchRun.phase === "running"

  const sidebarTransition = reduceMotion
    ? { duration: 0 }
    : sidebarHeldWide
      ? { duration: 0 }
      : { ...DEMO2_SIDEBAR_COLLAPSE }

  const resultsShellTransition = reduceMotion
    ? { duration: 0 }
    : { ...DEMO2_RESULTS_SHELL_ENTER }

  const showHome = phase === "home" || homeExiting || isGrayShellHiding
  const showResults = phase === "results"

  return (
    <div className="relative h-dvh w-full overflow-hidden">
        {showHome ? (
          <div
            className={
              homeExiting
                ? "pointer-events-none absolute inset-0 z-[2] overflow-visible"
                : "absolute inset-0 z-[1] overflow-hidden"
            }
            data-demo="2"
          >
            <div className="flex h-dvh w-full font-inter">
              {!homeExiting ? <Demo2HomeSidebar /> : null}
              <Demo2HomePanel
                prompt={prompt}
                onPromptChange={setPrompt}
                onRun={handleRun}
                isRunShimmer={isRunShimmer || homeExiting || isGrayShellHiding}
                grayShellHiding={isGrayShellHiding}
                onGrayShellHidden={handleGrayShellHidden}
                homeLayoutFlying={homeExiting}
                promptCardRef={promptCardRef}
              />
            </div>
          </div>
        ) : null}

        <AnimatePresence>
          {phase === "clarification" && clarificationCase ? (
            <motion.div
              key="demo2-clarification"
              className="absolute inset-0 z-[3] h-dvh w-full font-inter"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
            >
              <ClarificationPanel
                scenario={clarificationCase}
                onResolve={handleClarificationResolve}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {showResults ? (
          <motion.div
            key="demo2-results"
            className="absolute inset-0 z-[1] flex h-dvh w-full overflow-hidden bg-[#fafafa] font-inter"
            data-demo="2"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={resultsShellTransition}
          >
            <motion.aside
              className="relative h-dvh shrink-0 overflow-hidden"
              initial={{ width: DEMO2_SIZES.homeSidebarWidth }}
              animate={{
                width: sidebarHeldWide
                  ? DEMO2_SIZES.homeSidebarWidth
                  : DEMO2_SIZES.iconRailWidth,
              }}
              transition={sidebarTransition}
            >
              <Demo2IconRail />
            </motion.aside>

            <Demo2ChatPanel
              title={resolvedPrompt || undefined}
              flyPrompt={showFlyPrompt ? resolvedPrompt : undefined}
              promptShimmerActive={promptShimmerActive}
              hidePromptDuringFlight={isPromptLayoutFlying}
              showInputActions={!isPromptLayoutFlying}
              chatPromptSlotRef={chatPromptSlotRef}
              runPhase={searchRun.phase}
              cotStepStatuses={searchRun.stepStatuses}
              cotActiveStepIndex={searchRun.activeStepIndex}
              cotCompletedCount={searchRun.completedStepCount}
              cotTotalSteps={searchRun.totalSteps}
              cotExpanded={searchRun.cotExpanded}
              onCotExpandedChange={searchRun.setCotExpanded}
              onFollowUpSubmit={handleFollowUpSubmit}
              hasMatchingResults={hasMatchingResults}
            />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#fafafa] pt-2.5">
              <Demo2ResultsPanel
                key={resultsSession}
                prompt={resolvedPrompt}
                openFilters={openFiltersOnResults}
                visibleRowCount={searchRun.visibleRowCount}
                isSearchRunning={searchRun.phase === "running"}
                hasMatchingResults={hasMatchingResults}
                onStartNewSearch={handleStartNewSearch}
                onRunTemplate={handleFollowUpSubmit}
              />
            </div>
          </motion.div>
        ) : null}

      {showFlightOverlay && flightFromRect && flightToRect ? (
        <PromptFlightOverlay
          from={flightFromRect}
          to={flightToRect}
          prompt={resolvedPrompt}
          onComplete={handlePromptLayoutFlightComplete}
        />
      ) : null}
    </div>
  )
}
