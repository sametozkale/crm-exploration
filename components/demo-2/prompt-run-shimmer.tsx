"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { DEMO2_HOME_PROMPT_CARD_IDLE } from "./demo-2-tokens"
import { DEMO2_PROMPT_SHELL_COLLAPSE } from "./demo-2-motion"

const SHIMMER_SIZE = {
  home: {
    outer: "rounded-[16px]",
    mask: "demo2-prompt-shimmer-mask rounded-[15px]",
  },
  chat: {
    outer: "rounded-[12px]",
    mask: "demo2-prompt-shimmer-mask-chat rounded-[11px]",
  },
} as const

interface PromptRunShimmerProps extends HTMLMotionProps<"div"> {
  active?: boolean
  /** Hides the idle gray ring — white card only (run → flight). */
  compact?: boolean
  size?: keyof typeof SHIMMER_SIZE
  children: React.ReactNode
}

/** Spectrum border shimmer shell. */
export function PromptRunShimmer({
  active,
  compact = false,
  size = "home",
  children,
  className,
  ...props
}: PromptRunShimmerProps) {
  const shimmer = SHIMMER_SIZE[size]
  const showIdleRing = !compact && !active && size === "home"

  return (
    <motion.div
      className={cn(
        "relative isolate box-border",
        shimmer.outer,
        (active || showIdleRing) && "p-px",
        showIdleRing && DEMO2_HOME_PROMPT_CARD_IDLE,
        active && "demo2-prompt-shimmer--active z-50",
        className,
      )}
      animate={
        compact && !active
          ? {
              padding: 0,
              backgroundColor: "rgba(255,255,255,0)",
              boxShadow: "0 0 0 rgba(119,119,119,0)",
            }
          : undefined
      }
      transition={DEMO2_PROMPT_SHELL_COLLAPSE}
      {...props}
    >
      {active ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-0 overflow-hidden",
            shimmer.outer,
          )}
          aria-hidden
        >
          <div className="prompt-card-shimmer-glow absolute -inset-[120%]" />
        </div>
      ) : null}
      <div
        className={cn(
          "relative z-[1] h-full min-h-0 overflow-hidden",
          !active && size === "chat" ? "rounded-[12px]" : cn("bg-white", shimmer.mask),
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}
