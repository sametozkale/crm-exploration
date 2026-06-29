"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"
import { DEMO2_SIZES } from "./demo-2-tokens"
import { cn } from "@/lib/utils"

const POST_SEARCH_PARAGRAPHS = [
  "In the UI, you can unlock this filter to refine your search for Y Combinator companies that have received funding from leading LLM firms.",
  "After applying the filter, you'll see a comprehensive table listing all relevant companies.",
  "What would you like to do with these results?",
] as const

const ACTION_OPTIONS = [
  "Save to a list",
  "Export to CSV",
  "Refine the search",
] as const

type ActionOption = (typeof ACTION_OPTIONS)[number]

const TYPE_CHAR_MS = 18
const PARAGRAPH_PAUSE_MS = 360

const CHAT_ACTIONS = [
  { src: DEMO2_ASSETS.chatSend, label: "Send" },
  { src: DEMO2_ASSETS.chatImport, label: "Import" },
  { src: DEMO2_ASSETS.chatCopy, label: "Copy" },
  { src: DEMO2_ASSETS.chatVolume, label: "Read aloud" },
] as const

function ActionOptionRow({
  label,
  checked,
  onSelect,
}: {
  label: ActionOption
  checked: boolean
  onSelect: () => void
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onSelect}
      />
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[6px] border border-solid transition-colors duration-150 ease-out",
          checked
            ? "border-[#0090ff] bg-[#0090ff]"
            : "border-[#f2f2f2] bg-white group-hover:border-[#e0e0e0]",
        )}
        aria-hidden
      >
        {checked ? (
          <svg viewBox="0 0 12 12" className="size-2.5 text-white">
            <path
              d="M2.5 6 5 8.5 9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span
        className="text-[13px] leading-4 text-[#646464]"
        style={{ fontFeatureSettings: '"salt" 1' }}
      >
        {label}
      </span>
    </label>
  )
}

function TypingCursor() {
  return (
    <span
      className="ml-px inline-block h-[14px] w-px translate-y-px animate-pulse bg-[#323232]/35"
      aria-hidden
    />
  )
}

export function PostSearchFollowUp({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion()
  const [paragraphIndex, setParagraphIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [textDone, setTextDone] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [showIcons, setShowIcons] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null)
  const hasActionSelection = selectedAction !== null

  useEffect(() => {
    if (!active) {
      setParagraphIndex(0)
      setCharIndex(0)
      setTextDone(false)
      setShowCard(false)
      setShowIcons(false)
      return
    }

    if (reduceMotion) {
      setTextDone(true)
      setShowCard(true)
      setShowIcons(true)
    }
  }, [active, reduceMotion])

  useEffect(() => {
    if (!active || reduceMotion || textDone) return

    const current = POST_SEARCH_PARAGRAPHS[paragraphIndex]
    if (!current) {
      setTextDone(true)
      return
    }

    if (charIndex >= current.length) {
      if (paragraphIndex >= POST_SEARCH_PARAGRAPHS.length - 1) {
        const id = window.setTimeout(() => setTextDone(true), PARAGRAPH_PAUSE_MS)
        return () => window.clearTimeout(id)
      }

      const id = window.setTimeout(() => {
        setParagraphIndex((value) => value + 1)
        setCharIndex(0)
      }, PARAGRAPH_PAUSE_MS)
      return () => window.clearTimeout(id)
    }

    const id = window.setInterval(() => {
      setCharIndex((value) => value + 1)
    }, TYPE_CHAR_MS)

    return () => window.clearInterval(id)
  }, [active, reduceMotion, textDone, paragraphIndex, charIndex])

  useEffect(() => {
    if (!textDone || reduceMotion) return
    setShowCard(true)
  }, [textDone, reduceMotion])

  if (!active) return null

  const displayedParagraphs = reduceMotion
    ? [...POST_SEARCH_PARAGRAPHS]
    : POST_SEARCH_PARAGRAPHS.map((paragraph, index) => {
        if (index < paragraphIndex) return paragraph
        if (index === paragraphIndex) return paragraph.slice(0, charIndex)
        return ""
      })

  const isTyping = !reduceMotion && !textDone

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-5 text-[14px] leading-5 tracking-[-0.13px] text-[#323232]">
        {POST_SEARCH_PARAGRAPHS.map((_, index) => {
          if (!reduceMotion && index > paragraphIndex) return null

          const text = displayedParagraphs[index] ?? ""
          if (!text && index > paragraphIndex) return null

          return (
            <p key={index}>
              {text}
              {isTyping && index === paragraphIndex ? <TypingCursor /> : null}
            </p>
          )
        })}
      </div>

      <AnimatePresence>
        {showCard ? (
          <motion.div
            key="post-search-card"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: DEMO2_SHELL_EASE }}
            onAnimationComplete={() => {
              if (!reduceMotion) setShowIcons(true)
            }}
            className="relative rounded-[12px] border border-solid border-[#f4f4f4] bg-white"
            style={{
              width: DEMO2_SIZES.chatActionCard.width,
              height: DEMO2_SIZES.chatActionCard.height,
            }}
          >
            <div className="p-3">
              <p
                className="mb-3 text-[11px] tracking-[-0.11px] text-[#bbb]"
                style={{ fontFeatureSettings: '"salt" 1' }}
              >
                Select one following
              </p>
              <div className="flex flex-col gap-3">
                {ACTION_OPTIONS.map((label) => (
                  <ActionOptionRow
                    key={label}
                    label={label}
                    checked={selectedAction === label}
                    onSelect={() =>
                      setSelectedAction((current) => (current === label ? null : label))
                    }
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!hasActionSelection}
              className={cn(
                "absolute right-3 bottom-3 rounded-[8px] px-2 py-[5px] text-[12px] leading-[14px] tracking-[-0.12px] transition-colors",
                hasActionSelection
                  ? "bg-[#0090ff] text-white hover:bg-[#0081e6]"
                  : "bg-[#eee] text-[#777] opacity-25",
              )}
            >
              Continue
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showIcons ? (
          <motion.div
            key="post-search-icons"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: DEMO2_SHELL_EASE }}
            className="flex gap-2"
          >
            {CHAT_ACTIONS.map((action, index) => (
              <motion.button
                key={action.label}
                type="button"
                aria-label={action.label}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: reduceMotion ? 0 : index * 0.08,
                  ease: DEMO2_SHELL_EASE,
                }}
                className="flex cursor-pointer items-center justify-center rounded-[8px] p-1 transition-colors duration-150 ease-out hover:bg-[#f4f4f4]"
              >
                <img src={action.src} alt="" className="size-4" />
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
