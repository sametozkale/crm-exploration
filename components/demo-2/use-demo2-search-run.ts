"use client"

import { useEffect, useRef, useState } from "react"
import {
  DEMO2_ROW_REVEAL_MS,
  DEMO2_SCANNING_HOLD_MS,
  DEMO2_SEARCH_RUN_STEPS,
  DEMO2_SEARCH_STEP_MS,
  type SearchRunStepStatus,
} from "./search-run-steps"

export type Demo2SearchRunPhase = "running" | "complete"

export function useDemo2SearchRun({
  active,
  totalRows,
  reduceMotion,
}: {
  active: boolean
  totalRows: number
  reduceMotion: boolean | null
}) {
  const [phase, setPhase] = useState<Demo2SearchRunPhase>("running")
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [visibleRowCount, setVisibleRowCount] = useState(0)
  const [cotExpanded, setCotExpanded] = useState(true)
  const timersRef = useRef<number[]>([])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  useEffect(() => {
    if (!active) {
      clearTimers()
      setPhase("running")
      setActiveStepIndex(0)
      setVisibleRowCount(0)
      setCotExpanded(true)
      return
    }

    if (reduceMotion) {
      setActiveStepIndex(DEMO2_SEARCH_RUN_STEPS.length)
      setVisibleRowCount(totalRows)
      setPhase("complete")
      setCotExpanded(false)
      return
    }

    clearTimers()
    setPhase("running")
    setActiveStepIndex(0)
    setVisibleRowCount(0)
    setCotExpanded(true)

    const stepCount = DEMO2_SEARCH_RUN_STEPS.length
    let step = 0
    let rows = 0
    const scanningStartedAt = Date.now()

    const revealNextRow = () => {
      if (rows >= totalRows) {
        schedule(() => {
          setPhase("complete")
          setCotExpanded(false)
        }, 400)
        return
      }
      rows += 1
      setVisibleRowCount(rows)
      schedule(revealNextRow, DEMO2_ROW_REVEAL_MS)
    }

    const startRowReveal = () => {
      const elapsed = Date.now() - scanningStartedAt
      const remainingHold = Math.max(0, DEMO2_SCANNING_HOLD_MS - elapsed)
      schedule(revealNextRow, remainingHold)
    }

    const advanceStep = () => {
      step += 1
      setActiveStepIndex(step)

      if (step < stepCount) {
        schedule(advanceStep, DEMO2_SEARCH_STEP_MS)
        return
      }

      startRowReveal()
    }

    schedule(advanceStep, DEMO2_SEARCH_STEP_MS)

    return clearTimers
  }, [active, reduceMotion, totalRows])

  const stepStatuses: SearchRunStepStatus[] = DEMO2_SEARCH_RUN_STEPS.map((_, index) => {
    if (index < activeStepIndex) return "done"
    if (index === activeStepIndex && phase === "running") return "active"
    return "pending"
  })

  const completedStepCount =
    phase === "complete"
      ? DEMO2_SEARCH_RUN_STEPS.length
      : Math.max(0, activeStepIndex)

  return {
    phase,
    stepStatuses,
    activeStepIndex,
    completedStepCount,
    visibleRowCount,
    cotExpanded,
    setCotExpanded,
    totalSteps: DEMO2_SEARCH_RUN_STEPS.length,
  }
}
