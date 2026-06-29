"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_NO_MATCH_BETTER_RESULTS_TIPS } from "./demo-2-results-data"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"
import { cn } from "@/lib/utils"

/** Figma 114:37524 — ai-search icon inside Start new search button. */
function NoMatchAiSearchIcon() {
  return (
    <span className="relative size-[14px] shrink-0 overflow-clip">
      <span className="absolute inset-[8.33%] flex items-center justify-center">
        <span className="relative size-full -scale-x-100">
          <img
            src={DEMO2_ASSETS.resultsAiSearch}
            alt=""
            className="absolute -inset-[4.29%] block size-[calc(100%+8.58%)] max-w-none"
            draggable={false}
          />
        </span>
      </span>
    </span>
  )
}

/** Figma 114:37591 — no matching results empty state. */
export function ResultsNoMatchEmpty({
  onStartNewSearch,
}: {
  onStartNewSearch: () => void
}) {
  const reduceMotion = useReducedMotion()
  const [tipsOpen, setTipsOpen] = useState(false)

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
          src={DEMO2_ASSETS.resultsNoMatchSearch}
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

      <div className="flex w-full flex-col items-center gap-3">
        <button
          type="button"
          onClick={onStartNewSearch}
          className="inline-flex h-8 cursor-pointer items-center justify-center gap-[6px] rounded-[10px] bg-[#f4f4f4] px-[10px] py-[6px] transition-colors duration-150 ease-out hover:bg-[#ececec]"
        >
          <NoMatchAiSearchIcon />
          <span className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-[#777]">
            Start new search
          </span>
        </button>

        <div
          className="relative w-full"
          onMouseEnter={() => setTipsOpen(true)}
          onMouseLeave={() => setTipsOpen(false)}
        >
          <button
            type="button"
            className={cn(
              "cursor-pointer text-[11px] leading-[18px] tracking-[-0.11px] transition-colors",
              tipsOpen ? "text-[#777]" : "text-[#aaa]",
            )}
          >
            How to get better results?
          </button>

          <AnimatePresence>
            {tipsOpen ? (
              <motion.div
                className="absolute top-full left-0 z-10 w-full pt-3"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.16, ease: DEMO2_SHELL_EASE }
                }
              >
                <div className="rounded-[16px] border border-[#f4f4f4] p-4 text-left">
                  <ul className="list-disc space-y-0 pl-[18px] text-[12px] leading-5 tracking-[-0.12px] text-[#828282]">
                    {DEMO2_NO_MATCH_BETTER_RESULTS_TIPS.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
