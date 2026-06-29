"use client"

import { motion, useReducedMotion } from "framer-motion"
import { DEMO2_NO_MATCH_TEMPLATES } from "./demo-2-results-data"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"

/** Figma 114:37425 — bottom-left template row when no results match. */
export function ResultsNoMatchTemplates({
  onRunTemplate,
}: {
  onRunTemplate: (prompt: string) => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex w-full flex-col gap-4"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { delay: 0.28, duration: 0.42, ease: DEMO2_SHELL_EASE }
      }
    >
      <p
        className="text-[14px] leading-normal tracking-[-0.14px] text-[#aaa]"
        style={{ fontFeatureSettings: '"salt" 1' }}
      >
        Run a new search by using a ready-made templates
      </p>

      <div className="flex items-start gap-[9px] overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DEMO2_NO_MATCH_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onRunTemplate(template.prompt)}
            className="flex h-auto w-[194px] shrink-0 cursor-pointer flex-col items-start rounded-[12px] border border-solid border-[#f4f4f4] bg-white p-4 text-left transition-colors duration-150 ease-out hover:border-[#ececec] hover:bg-[#fafafa]"
          >
            <span className="flex w-full flex-col gap-3">
              <span className="text-[19px] leading-none">{template.emoji}</span>
              <span className="flex flex-col gap-2">
                <span className="text-[14px] leading-normal text-black">{template.title}</span>
                <span className="text-[13px] leading-[18px] tracking-[-0.13px] text-[#969696]">
                  {template.description}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
