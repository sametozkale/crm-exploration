"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { DEMO2_LAYOUT_TRANSITION } from "./demo-2-motion"

export const DEMO2_PROMPT_LAYOUT_ID = "demo2-prompt-card"

const SHIMMER_SIZE = {
  home: {
    outer: "rounded-[16px]",
    mask: "demo2-prompt-shimmer-mask",
  },
  chat: {
    outer: "rounded-[12px]",
    mask: "demo2-prompt-shimmer-mask-chat",
  },
} as const

interface PromptRunShimmerProps extends HTMLMotionProps<"div"> {
  active?: boolean
  size?: keyof typeof SHIMMER_SIZE
  layoutId?: string
  children: React.ReactNode
}

/** Spectrum border shimmer while Run is loading (demo-1 pattern, demo-2 radii). */
export function PromptRunShimmer({
  active,
  size = "home",
  layoutId = DEMO2_PROMPT_LAYOUT_ID,
  children,
  className,
  ...props
}: PromptRunShimmerProps) {
  const shimmer = SHIMMER_SIZE[size]

  return (
    <motion.div
      layoutId={layoutId}
      layout
      className={cn(
        "relative",
        active && cn("z-50 overflow-hidden p-px shadow-none", shimmer.outer),
        className,
      )}
      transition={DEMO2_LAYOUT_TRANSITION}
      {...props}
    >
      {active ? (
        <div
          className="prompt-card-shimmer-glow pointer-events-none absolute -inset-[120%] z-0"
          aria-hidden
        />
      ) : null}
      <div className={cn("relative z-[1]", active && shimmer.mask)}>
        {children}
      </div>
    </motion.div>
  )
}
