"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect } from "react"
import { DEMO2_LAYOUT_TRANSITION } from "./demo-2-motion"
import { PromptRunShimmer } from "./prompt-run-shimmer"

/** Fixed-position prompt card flight (home rect → chat slot rect). */
export function PromptFlightOverlay({
  from,
  to,
  prompt,
  onComplete,
}: {
  from: DOMRect
  to: DOMRect
  prompt: string
  onComplete: () => void
}) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) onComplete()
  }, [reduceMotion, onComplete])

  if (reduceMotion) return null

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] isolate overflow-hidden"
      style={{ transformOrigin: "top left" }}
      initial={{
        x: from.left,
        y: from.top,
        width: from.width,
        height: from.height,
        borderRadius: 16,
      }}
      animate={{
        x: to.left,
        y: to.top,
        width: to.width,
        height: to.height,
        borderRadius: 12,
      }}
      transition={DEMO2_LAYOUT_TRANSITION.layout}
      onAnimationComplete={onComplete}
    >
      <PromptRunShimmer active className="h-full w-full !rounded-none" style={{ borderRadius: "inherit" }}>
        <div className="flex h-full flex-col justify-center overflow-hidden p-3">
          <p className="line-clamp-3 text-[14px] font-normal leading-5 text-[#202020]">{prompt}</p>
        </div>
      </PromptRunShimmer>
    </motion.div>
  )
}
