"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { DEMO2_CLARIFICATION_THREAD_ENTRANCE, DEMO2_SHELL_EASE } from "../demo-2-motion"
import { DEMO2_TOKENS } from "../demo-2-tokens"

interface ChatThreadProps {
  children: ReactNode
}

/** Centered vertical message stack for clarification chat (Figma 86:19266). */
export function ChatThread({ children }: ChatThreadProps) {
  return (
    <div
      className="mx-auto flex w-full flex-col gap-9"
      style={{ maxWidth: DEMO2_TOKENS.clarificationThreadWidth }}
    >
      {children}
    </div>
  )
}

interface ChatThreadEntranceItemProps {
  index: number
  children: ReactNode
}

/** Staggered fade-up for clarification thread items. */
export function ChatThreadEntranceItem({ index, children }: ChatThreadEntranceItemProps) {
  const reduceMotion = useReducedMotion()
  const { base, stagger, duration } = DEMO2_CLARIFICATION_THREAD_ENTRANCE

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              delay: base + index * stagger,
              duration,
              ease: DEMO2_SHELL_EASE,
            }
      }
    >
      {children}
    </motion.div>
  )
}
