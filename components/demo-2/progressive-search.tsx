"use client"

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"
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
import { DEMO2_SIZES } from "./demo-2-tokens"
import { Demo2HomePanel } from "./home-panel"
import { Demo2HomeSidebar } from "./home-sidebar"
import { Demo2IconRail } from "./icon-rail"
import { Demo2ResultsPanel } from "./results-panel"
import { useDemo2SearchRun } from "./use-demo2-search-run"
import { DEMO2_RUN_SHIMMER_MS, DEMO2_SHELL_EASE } from "./demo-2-motion"

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
  const [resultsSession, setResultsSession] = useState(0)
  const [hasMatchingResults, setHasMatchingResults] = useState(true)
  const runTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchRun = useDemo2SearchRun({
    active: phase === "results",
    totalRows: hasMatchingResults ? DEMO2_COMPANIES.length : 0,
    reduceMotion,
  })

  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current)
    }
  }, [])

  const finishRun = useCallback(
    (trimmed: string, caseId: ReturnType<typeof analyzePromptClarity>) => {
      if (caseId) {
        setClarificationCase(buildClarificationScenario(caseId, trimmed))
        setPhase("clarification")
      } else {
        setResolvedPrompt(trimmed)
        setHasMatchingResults(isDemo2PromptRelevant(trimmed))
        setOpenFiltersOnResults(false)
        setResultsSession((n) => n + 1)
        setPhase("results")
      }
      setIsRunShimmer(false)
    },
    [],
  )

  const handleRun = () => {
    const trimmed = prompt.trim()
    if (!trimmed || isRunShimmer) return

    const caseId = analyzePromptClarity(trimmed)
    setIsRunShimmer(true)

    const delay = reduceMotion ? 0 : DEMO2_RUN_SHIMMER_MS
    if (runTimerRef.current) clearTimeout(runTimerRef.current)
    runTimerRef.current = setTimeout(() => finishRun(trimmed, caseId), delay)
  }

  const handleClarificationResolve = (resolution: ClarificationResolution) => {
    setResolvedPrompt(resolution.prompt)
    setHasMatchingResults(isDemo2PromptRelevant(resolution.prompt))
    setOpenFiltersOnResults(resolution.kind === "open_filters")
    setClarificationCase(null)
    setResultsSession((n) => n + 1)
    setPhase("results")
  }

  const sidebarTransition = reduceMotion
    ? { duration: 0 }
    : { duration: DEMO2_RUN_SHIMMER_MS / 1000, ease: DEMO2_SHELL_EASE }

  const handleStartNewSearch = useCallback(() => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current)
    setPhase("home")
    setPrompt("")
    setResolvedPrompt("")
    setClarificationCase(null)
    setOpenFiltersOnResults(false)
    setIsRunShimmer(false)
    setHasMatchingResults(true)
  }, [])

  return (
    <LayoutGroup id="demo2-shell">
      <AnimatePresence mode="popLayout" initial={false}>
      {phase === "home" ? (
        <motion.div
          key="demo2-home"
          className="flex h-dvh w-full overflow-hidden bg-white font-inter"
          data-demo="2"
        >
          <Demo2HomeSidebar />
          <Demo2HomePanel
            prompt={prompt}
            onPromptChange={setPrompt}
            onRun={handleRun}
            isRunShimmer={isRunShimmer}
          />
        </motion.div>
      ) : null}

      {phase === "clarification" && clarificationCase ? (
        <ClarificationPanel
          scenario={clarificationCase}
          onResolve={handleClarificationResolve}
        />
      ) : null}

      {phase === "results" ? (
        <motion.div
          key="demo2-results"
          className="flex h-dvh w-full overflow-hidden bg-[#fafafa] font-inter"
          data-demo="2"
        >
          <motion.aside
            className="relative h-dvh shrink-0 overflow-hidden"
            initial={{ width: DEMO2_SIZES.homeSidebarWidth }}
            animate={{ width: DEMO2_SIZES.iconRailWidth }}
            transition={sidebarTransition}
          >
            <Demo2IconRail />
          </motion.aside>

          <motion.div className="shrink-0">
            <Demo2ChatPanel
              title={resolvedPrompt || undefined}
              flyPrompt={searchRun.phase === "running" ? resolvedPrompt : undefined}
              runPhase={searchRun.phase}
              cotStepStatuses={searchRun.stepStatuses}
              cotActiveStepIndex={searchRun.activeStepIndex}
              cotCompletedCount={searchRun.completedStepCount}
              cotTotalSteps={searchRun.totalSteps}
              cotExpanded={searchRun.cotExpanded}
              onCotExpandedChange={searchRun.setCotExpanded}
            />
          </motion.div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#fafafa] pt-2.5">
            <Demo2ResultsPanel
              key={resultsSession}
              prompt={resolvedPrompt}
              openFilters={openFiltersOnResults}
              visibleRowCount={searchRun.visibleRowCount}
              isSearchRunning={searchRun.phase === "running"}
              hasMatchingResults={hasMatchingResults}
              onStartNewSearch={handleStartNewSearch}
            />
          </div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </LayoutGroup>
  )
}
