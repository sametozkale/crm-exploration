"use client"

import { motion, useReducedMotion } from "framer-motion"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"

const NO_MATCH_ASSETS = {
  search: "/demo-2/results/no-match-search.svg",
  aiSearch: "/demo-2/results/no-match-ai-search.svg",
} as const

/** Figma 114:37591 — no matching results empty state. */
export function ResultsNoMatchEmpty({
  onStartNewSearch,
}: {
  onStartNewSearch: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex w-full max-w-[360px] flex-col items-center gap-4 text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              delay: 0.12,
              duration: 0.4,
              ease: DEMO2_SHELL_EASE,
            }
      }
    >
      <span className="relative size-8 shrink-0 overflow-hidden">
        <img
          src={NO_MATCH_ASSETS.search}
          alt=""
          className="block size-full max-w-none"
          draggable={false}
        />
      </span>

      <div className="flex w-full flex-col items-center gap-3">
        <h2
          className="text-[14px] font-medium leading-4 tracking-[-0.14px] text-[#202020]"
          style={{ fontFeatureSettings: '"salt" 1' }}
        >
          Unfortunately, no matching results
        </h2>
        <p className="text-[12px] leading-[18px] tracking-[-0.12px] text-[#646464]">
          We couldn&apos;t find companies in our index for this prompt.
          <br />
          Try describing the sector, signals, or type of company you want.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onStartNewSearch}
          className="inline-flex h-8 cursor-pointer items-center justify-center gap-[6px] rounded-[10px] bg-[#f4f4f4] px-[10px] py-[6px] transition-colors duration-150 ease-out hover:bg-[#ececec]"
        >
          <span className="relative size-[14px] shrink-0 overflow-hidden">
            <img
              src={NO_MATCH_ASSETS.aiSearch}
              alt=""
              className="block size-full max-w-none"
              draggable={false}
            />
          </span>
          <span className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-[#777]">
            Start new search
          </span>
        </button>
        <button
          type="button"
          className="cursor-pointer text-[11px] leading-[18px] tracking-[-0.11px] text-[#aaa] transition-colors hover:text-[#969696]"
        >
          How to get better results?
        </button>
      </div>
    </motion.div>
  )
}
