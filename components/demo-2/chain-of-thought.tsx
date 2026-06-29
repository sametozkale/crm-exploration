"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { AnimatedSourceDotGrid } from "./animated-source-dot-grid"
import { DEMO2_SEARCH_RUN_STEPS, type SearchRunStepStatus } from "./search-run-steps"
import type { Demo2SearchRunPhase } from "./use-demo2-search-run"
import { cn } from "@/lib/utils"

import { DEMO2_SHELL_EASE } from "./demo-2-motion"

function StepCheck({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        compact ? "h-4 w-[7px]" : "size-4",
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 12 12"
        className={cn("text-[#b0b0b0]", compact ? "size-[10px]" : "size-3")}
        fill="none"
      >
        <path
          d="M2.5 6 5 8.5 9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function CoTStepDot() {
  return (
    <span className="flex h-4 w-[7px] shrink-0 items-center justify-center" aria-hidden>
      <span className="size-[7px] rounded-full bg-[#d8d8d8]" />
    </span>
  )
}

function CoTStepList({
  steps,
  icon,
  reduceMotion,
  animateEntrance = false,
}: {
  steps: typeof DEMO2_SEARCH_RUN_STEPS
  icon: "dot" | "check"
  reduceMotion?: boolean | null
  animateEntrance?: boolean
}) {
  if (steps.length === 0) return null

  const rows = steps.map((step) => {
    const row = (
      <>
        {icon === "dot" ? <CoTStepDot /> : <StepCheck compact />}
        <p className="min-w-0 flex-1 text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
          {step.label}
        </p>
      </>
    )

    if (!animateEntrance) {
      return (
        <div key={step.id} className="relative flex items-start gap-2">
          {row}
        </div>
      )
    }

    return (
      <motion.div
        key={step.id}
        layout
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: DEMO2_SHELL_EASE }}
        className="relative flex items-start gap-2"
      >
        {row}
      </motion.div>
    )
  })

  return (
    <div className="relative flex flex-col gap-5">
      {steps.length > 1 ? (
        <div
          className="pointer-events-none absolute left-[3.5px] top-2 w-px bg-[#ececec]"
          style={{ height: "calc(100% - 16px)" }}
          aria-hidden
        />
      ) : null}
      {rows}
    </div>
  )
}

/** Figma 221:19941 — flat loading CoT while search runs. */
function ChainOfThoughtLoading({
  visibleSteps,
  reduceMotion,
}: {
  visibleSteps: typeof DEMO2_SEARCH_RUN_STEPS
  reduceMotion: boolean | null
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="flex size-4 shrink-0 items-center justify-center overflow-hidden">
          <AnimatedSourceDotGrid tone="gray" />
        </span>
        <span className="demo2-cot-searching-shimmer text-[13px] leading-4 tracking-[-0.13px]">
          Searching
        </span>
      </div>

      {visibleSteps.length > 0 ? (
        <CoTStepList
          steps={visibleSteps}
          icon="dot"
          reduceMotion={reduceMotion}
          animateEntrance
        />
      ) : null}
    </div>
  )
}

export function ChainOfThought({
  phase,
  stepStatuses,
  activeStepIndex,
  completedCount,
  totalSteps,
  expanded,
  onExpandedChange,
  children,
}: {
  phase: Demo2SearchRunPhase
  stepStatuses: SearchRunStepStatus[]
  activeStepIndex: number
  completedCount: number
  totalSteps: number
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  children?: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  const isRunning = phase === "running"

  const visibleStepCount = isRunning
    ? Math.min(activeStepIndex + 1, DEMO2_SEARCH_RUN_STEPS.length)
    : DEMO2_SEARCH_RUN_STEPS.length

  const visibleSteps = DEMO2_SEARCH_RUN_STEPS.slice(0, visibleStepCount)

  if (isRunning) {
    return (
      <ChainOfThoughtLoading visibleSteps={visibleSteps} reduceMotion={reduceMotion} />
    )
  }

  const headerLabel = `${completedCount || totalSteps} step${
    (completedCount || totalSteps) === 1 ? "" : "s"
  } completed`

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        className="flex w-fit items-center gap-[6px] text-[12px] leading-4 tracking-[-0.12px] text-[#777] transition-colors hover:text-[#646464]"
        aria-expanded={expanded}
      >
        <span>{headerLabel}</span>
        <motion.img
          src={DEMO2_ASSETS.chatArrowRight}
          alt=""
          className="size-[10px]"
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.32, ease: DEMO2_SHELL_EASE }}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="cot-body"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, height: 0, transition: { duration: 0.24 } }
            }
            transition={{ duration: 0.4, ease: DEMO2_SHELL_EASE }}
            className="overflow-hidden"
          >
            <CoTStepList steps={visibleSteps} icon="check" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {children}
    </div>
  )
}
