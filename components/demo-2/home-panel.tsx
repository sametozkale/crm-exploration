"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { DEMO2_ASSETS } from "./demo-2-assets"
import {
  DEMO2_FILTER_OPTIONS,
  DEMO2_NEW_COUNT_ACTIONS,
  DEMO2_PROMPT_PLACEHOLDERS,
  DEMO2_SAVED_SEARCHES,
  DEMO2_SAVED_SEARCH_CONTEXT_ACTIONS,
  type Demo2SavedSearch,
} from "./demo-2-home-data"
import { DEMO2_SIZES } from "./demo-2-tokens"
import { HomeChevronDownIcon, HomeEqualizerIcon, HomeImproveIcon, HomeSearchListIcon } from "./home-icons"
import { HomeSmartPromptEditor, type HomeSmartPromptHandle } from "./home-smart-prompt-editor"
import { improvePrompt } from "@/lib/prompt-tokens"
import {
  applyPromptSuggestion,
  getPromptSuggestions,
  type PromptSuggestion,
} from "@/lib/prompt-suggestions"
import { PromptRunShimmer } from "./prompt-run-shimmer"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"

const PROMPT_LINE_HEIGHT = 20
const PROMPT_MAX_LINES = 6

function syncPromptEditorHeight(editor: HTMLElement | null) {
  if (!editor) return
  const maxHeight = PROMPT_LINE_HEIGHT * PROMPT_MAX_LINES
  editor.style.height = "0px"
  const measured = editor.scrollHeight
  const nextHeight = Math.min(Math.max(PROMPT_LINE_HEIGHT, measured), maxHeight)
  editor.style.height = `${nextHeight}px`
  editor.style.overflowY = measured > maxHeight ? "auto" : "hidden"
}

const TYPE_CHAR_MS = 38
const DELETE_CHAR_MS = 22
const PAUSE_TYPED_MS = 1800
const PAUSE_DELETED_MS = 320

/** Prompt action row — framer-motion enter/exit */
const PROMPT_ACTION_EASE = [0.16, 1, 0.3, 1] as const
const PROMPT_ACTION_ENTER = { duration: 0.38, ease: PROMPT_ACTION_EASE }
const PROMPT_ACTION_EXIT = { duration: 0.28, ease: [0.4, 0, 0.6, 1] as const }
const PROMPT_BLUE = "#0090ff"
const PROMPT_BLUE_HOVER = "#0081e6"
/** Figma — Run pill width (icon + label + padding) */
const PROMPT_RUN_WIDTH = 68
const PROMPT_TEXT_ENTER = { duration: 0.36, ease: PROMPT_ACTION_EASE }
const PROMPT_TEXT_EXIT = { duration: 0.24, ease: PROMPT_ACTION_EASE }
const PROMPT_TEXT_INITIAL = { opacity: 0, y: 5, filter: "blur(2px)" }
const PROMPT_TEXT_SHOW = { opacity: 1, y: 0, filter: "blur(0px)" }
const PROMPT_TEXT_HIDE = { opacity: 0, y: -4, filter: "blur(2px)" }

const HOME_SHELL_FADE = {
  duration: 0.28,
  ease: PROMPT_ACTION_EASE,
} as const

function useTypingPlaceholder(placeholders: readonly string[], enabled: boolean) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const phrase = placeholders[phraseIndex] ?? placeholders[0] ?? ""

  useEffect(() => {
    if (!enabled) {
      setPhraseIndex(0)
      setCharIndex(0)
      setDeleting(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !phrase) return

    const typed = !deleting && charIndex >= phrase.length
    const cleared = deleting && charIndex === 0

    const delay = typed
      ? PAUSE_TYPED_MS
      : cleared
        ? PAUSE_DELETED_MS
        : deleting
          ? DELETE_CHAR_MS
          : TYPE_CHAR_MS

    const id = window.setTimeout(() => {
      if (typed) {
        setDeleting(true)
        return
      }
      if (cleared) {
        setDeleting(false)
        setPhraseIndex((current) => (current + 1) % placeholders.length)
        return
      }
      setCharIndex((current) => current + (deleting ? -1 : 1))
    }, delay)

    return () => window.clearTimeout(id)
  }, [enabled, phrase, charIndex, deleting, placeholders.length])

  return phrase.slice(0, charIndex)
}

/** One-shot forward typewriter — used when Improve rewrites the prompt */
function useImproveTypewriter(
  target: string | null,
  onTick: (text: string) => void,
  onComplete: () => void,
) {
  const onTickRef = useRef(onTick)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onTickRef.current = onTick
    onCompleteRef.current = onComplete
  }, [onTick, onComplete])

  useEffect(() => {
    if (!target) return

    let index = 0
    onTickRef.current("")

    const id = window.setInterval(() => {
      index += 1
      const next = target.slice(0, index)
      onTickRef.current(next)
      if (index >= target.length) {
        window.clearInterval(id)
        onCompleteRef.current()
      }
    }, TYPE_CHAR_MS)

    return () => window.clearInterval(id)
  }, [target])
}

function TypingPlaceholder({ text }: { text: string }) {
  return (
    <span
      className="pointer-events-none absolute inset-0 text-[13px] leading-[20px] tracking-[-0.13px] text-[#ccc]"
      aria-hidden
    >
      {text}
      <span className="ml-px inline-block h-[14px] w-px translate-y-px animate-pulse bg-[#ccc]" />
    </span>
  )
}

function SuggestionAiIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 21.5 21.5"
      fill="none"
      className={cn("size-[14px] shrink-0", className)}
      aria-hidden
    >
      <path
        d="M1.75 10.75C6.25 10.75 10.75 6.25 10.75 1.75C10.75 6.25 15.25 10.75 19.75 10.75C15.25 10.75 10.75 15.25 10.75 19.75C10.75 15.25 6.25 10.75 1.75 10.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M0.75 18.25C1.58333 18.25 3.25 16.5833 3.25 15.75C3.25 16.5833 4.91667 18.25 5.75 18.25C4.91667 18.25 3.25 19.9167 3.25 20.75C3.25 19.9167 1.58333 18.25 0.75 18.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14.75 3.75C15.75 3.75 17.75 1.75 17.75 0.75C17.75 1.75 19.75 3.75 20.75 3.75C19.75 3.75 17.75 5.75 17.75 6.75C17.75 5.75 15.75 3.75 14.75 3.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SuggestionChip({
  label,
  iconUrl,
  emoji,
  aiIcon,
  muted,
  onClick,
}: {
  label: string
  iconUrl?: string
  emoji?: string
  aiIcon?: boolean
  muted?: boolean
  onClick?: () => void
}) {
  const textTone = muted
    ? "text-[#aaa] group-hover:text-[#909090]"
    : "text-[#646464] group-hover:text-[#4a4a4a]"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-8 shrink-0 cursor-pointer items-center gap-[6px] rounded-[12px] border border-solid border-[#f4f4f4] bg-white px-2 py-[6px] transition-colors duration-150 ease-out hover:border-[#e0e0e0]",
        muted && textTone,
      )}
    >
      {aiIcon ? (
        <span className="flex size-4 shrink-0 items-center justify-center text-[#c8c8c8] transition-colors duration-150 ease-out group-hover:text-[#b3b3b3]">
          <SuggestionAiIcon />
        </span>
      ) : iconUrl ? (
        <img src={iconUrl} alt="" className="size-4 rounded-[6px] object-cover" draggable={false} />
      ) : emoji ? (
        <span className="flex size-4 shrink-0 items-center justify-center text-[14px] leading-4">
          {emoji}
        </span>
      ) : null}
      <span
        className={cn(
          "text-[14px] leading-[15px] transition-colors duration-150 ease-out",
          textTone,
        )}
      >
        {label}
      </span>
    </button>
  )
}

function NewBadgePlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 8 8"
      fill="none"
      className={cn("size-2 shrink-0", className)}
      aria-hidden
    >
      <path
        d="M4 1.333V6.667M6.667 4H1.333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NewCountBadge({ count }: { count: number }) {
  return (
    <div
      className="group/newbadge relative shrink-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <span className="flex cursor-pointer items-center gap-[2px] rounded-[6px] bg-[rgba(0,205,113,0.07)] px-[5px] py-[3px] text-[10px] font-medium leading-[10px] tracking-[-0.1px] text-[#00cd71] transition-colors duration-150 ease-out group-hover/newbadge:bg-[#00cd71] group-hover/newbadge:text-white">
        <NewBadgePlusIcon />
        {count} new
      </span>

      <div className="invisible absolute left-0 top-full z-20 translate-y-1 pt-1 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/newbadge:visible group-hover/newbadge:translate-y-0 group-hover/newbadge:opacity-100">
        <div className="flex w-[155px] flex-col rounded-[12px] border border-solid border-[#3c3e42] bg-[#37393e] p-1 drop-shadow-[0px_2px_4px_rgba(34,34,34,0.1)]">
          {DEMO2_NEW_COUNT_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex w-full items-center gap-2 rounded-[8px] px-2 py-[6px] text-left transition-colors duration-150 ease-out hover:bg-[rgba(255,255,255,0.08)]"
            >
              <img
                src={DEMO2_ASSETS[action.icon]}
                alt=""
                className="size-4 shrink-0"
                draggable={false}
              />
              <span className="whitespace-nowrap text-[13px] leading-none tracking-[0.13px] text-white">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SavedSearchRow({
  search,
  onClone,
  onRemove,
}: {
  search: Demo2SavedSearch
  onClone: () => void
  onRemove: () => void
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="group flex h-[62px] w-full cursor-pointer items-start gap-3 rounded-[12px] bg-transparent p-3 text-left transition-colors duration-150 ease-out hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0090ff]/30"
        >
          <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[8px] bg-[rgba(0,144,255,0.07)] transition-colors duration-150 ease-out group-hover:bg-white">
            <HomeSearchListIcon />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[13px] font-medium leading-4 text-[#323232]">{search.title}</p>
              <div className="flex shrink-0 items-center gap-2">
                {search.filterCount != null ? (
                  <div className="flex items-center gap-1">
                    <img src={DEMO2_ASSETS.homeFilter} alt="" className="size-3" draggable={false} />
                    <span className="text-[13px] leading-4 text-[#969696]">{search.filterCount}</span>
                  </div>
                ) : null}
                {search.filterCount != null ? (
                  <span className="h-2 w-px bg-[#ededed]" aria-hidden />
                ) : null}
                <img
                  src={DEMO2_ASSETS.homeAvatar}
                  alt=""
                  className="size-4 rounded-full object-cover"
                  draggable={false}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <span className="rounded-[6px] border-[0.5px] border-solid border-[#f4f4f4] bg-white px-[5px] py-[3px] text-[10px] font-medium leading-[10px] tracking-[-0.1px] text-[#969696]">
                  {search.results} Results
                </span>
                {search.newCount != null ? <NewCountBadge count={search.newCount} /> : null}
              </div>
              <span className="text-[12px] leading-4 text-[#aaa]">{search.timeAgo}</span>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent
        className="min-w-[160px] rounded-[12px] border border-solid border-[#f7f7f7] bg-white p-1 shadow-[0px_1px_2px_rgba(34,34,34,0.05)]"
      >
        {DEMO2_SAVED_SEARCH_CONTEXT_ACTIONS.map((action) => (
          <ContextMenuItem
            key={action.id}
            className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-[6px] text-[13px] leading-normal tracking-[0.13px] text-[#777] focus:bg-[#f4f4f4] data-[highlighted]:bg-[#f4f4f4]"
            onSelect={() => {
              if (action.id === "clone") onClone()
              if (action.id === "remove") onRemove()
            }}
          >
            <img
              src={DEMO2_ASSETS[action.icon]}
              alt=""
              className="size-4 shrink-0"
              draggable={false}
            />
            {action.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

function ImprovePromptControl({
  isImproved,
  disabled,
  onImprove,
  onUndo,
}: {
  isImproved: boolean
  disabled?: boolean
  onImprove: () => void
  onUndo: () => void
}) {
  return (
    <div className="flex items-end">
      <AnimatePresence initial={false} mode="wait">
        {isImproved ? (
          <motion.div
            key="improved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 0.2, ease: PROMPT_ACTION_EASE }}
            className="flex items-center gap-[6px] text-[#0090ff]"
          >
            <HomeImproveIcon />
            <div className="flex items-center gap-[4px] whitespace-nowrap">
              <span className="text-[13px] leading-5 tracking-[-0.13px]">Improved</span>
              <span className="text-[8px] font-thin leading-none text-[#969696]" aria-hidden>
                •
              </span>
              <button
                type="button"
                onClick={onUndo}
                className="cursor-pointer text-[13px] leading-5 text-[#969696] transition-colors duration-150 ease-out hover:text-[#777777]"
              >
                Undo
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="improve"
            type="button"
            onClick={onImprove}
            disabled={disabled}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 0.2, ease: PROMPT_ACTION_EASE }}
            className={cn(
              "group/improve relative isolate flex cursor-pointer items-center gap-[6px] overflow-hidden text-[13px] leading-5 tracking-[-0.13px] text-[#979797] transition-colors duration-200 ease-out hover:text-[#0090ff]",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            <HomeImproveIcon />
            Improve
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function PromptActionButtons({
  hasPrompt,
  isImproved,
  isPromptTransitioning,
  isRunShimmer,
  isVoiceActive,
  onVoiceToggle,
  onImprove,
  onUndo,
  onRun,
}: {
  hasPrompt: boolean
  isImproved: boolean
  isPromptTransitioning: boolean
  isRunShimmer?: boolean
  isVoiceActive?: boolean
  onVoiceToggle: () => void
  onImprove: () => void
  onUndo: () => void
  onRun: () => void
}) {
  const voiceHighlighted = isVoiceActive || !hasPrompt

  return (
    <div className="flex min-h-8 w-full shrink-0 items-end justify-between">
      <div className="flex min-h-8 items-end">
        <AnimatePresence initial={false}>
          {hasPrompt ? (
            <motion.div
              key="improve-slot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: PROMPT_ACTION_EXIT }}
              transition={{ duration: 0.26, ease: PROMPT_ACTION_EASE }}
            >
              <ImprovePromptControl
                isImproved={isImproved}
                disabled={isPromptTransitioning}
                onImprove={onImprove}
                onUndo={onUndo}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div className="flex shrink-0 items-center" transition={PROMPT_ACTION_ENTER}>
        <motion.button
          type="button"
          aria-label="Voice input"
          aria-pressed={isVoiceActive}
          disabled={isRunShimmer}
          onClick={onVoiceToggle}
          className="flex cursor-pointer items-center justify-center rounded-[11px] p-[9px] disabled:cursor-default disabled:opacity-80"
          style={{
            width: DEMO2_SIZES.homePromptActionHeight,
            height: DEMO2_SIZES.homePromptActionHeight,
          }}
          animate={{
            backgroundColor: voiceHighlighted ? PROMPT_BLUE : "#ededed",
            color: voiceHighlighted ? "#ffffff" : "#777777",
          }}
          whileHover={
            voiceHighlighted ? { backgroundColor: PROMPT_BLUE_HOVER } : undefined
          }
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <HomeEqualizerIcon animated={isVoiceActive} />
        </motion.button>

        <AnimatePresence initial={false}>
          {hasPrompt ? (
            <motion.div
              key="run"
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{
                width: PROMPT_RUN_WIDTH,
                opacity: 1,
                marginLeft: 6,
              }}
              exit={{
                width: 0,
                opacity: 0,
                marginLeft: 0,
                transition: {
                  width: PROMPT_ACTION_EXIT,
                  marginLeft: PROMPT_ACTION_EXIT,
                  opacity: { duration: 0.16 },
                },
              }}
              transition={{
                width: PROMPT_ACTION_ENTER,
                marginLeft: PROMPT_ACTION_ENTER,
                opacity: { duration: 0.26, delay: 0.09, ease: "easeOut" },
              }}
              className="overflow-hidden"
            >
              <button
                type="button"
                onClick={onRun}
                disabled={isRunShimmer}
                className="flex h-8 w-full cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-[11px] bg-[#0090ff] px-3 text-[14px] font-medium leading-4 tracking-[-0.14px] text-white transition-colors duration-150 ease-out hover:bg-[#0081e6] disabled:cursor-default disabled:opacity-80"
              >
                <img src={DEMO2_ASSETS.homeRunSearch} alt="" className="size-3" draggable={false} />
                Run
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export function Demo2HomePanel({
  prompt,
  onPromptChange,
  onRun,
  isRunShimmer = false,
}: {
  prompt: string
  onPromptChange: (value: string) => void
  onRun: () => void
  isRunShimmer?: boolean
}) {
  const promptEditorRef = useRef<HomeSmartPromptHandle>(null)
  const promptBeforeImproveRef = useRef<string | null>(null)
  const pendingPromptTransitionRef = useRef<{
    next: string
    onDone?: () => void
    mode: "fade" | "improve-type"
  } | null>(null)
  const skipPromptEnterAnimationRef = useRef(false)
  const awaitingPromptEnterRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()
  const [promptFocused, setPromptFocused] = useState(false)
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(true)
  const [savedSearches, setSavedSearches] = useState(DEMO2_SAVED_SEARCHES)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isImproved, setIsImproved] = useState(false)
  const [promptVisible, setPromptVisible] = useState(true)
  const [promptEnterKey, setPromptEnterKey] = useState(0)
  const [isPromptTransitioning, setIsPromptTransitioning] = useState(false)
  const [improveTypingTarget, setImproveTypingTarget] = useState<string | null>(null)
  const hasPrompt = prompt.trim().length > 0
  const showPromptActions = hasPrompt || isPromptTransitioning || isImproved
  const showTypingPlaceholder = !hasPrompt && !promptFocused && !isPromptTransitioning

  useEffect(() => {
    if (isRunShimmer) setIsVoiceActive(false)
  }, [isRunShimmer])

  const handleVoiceToggle = useCallback(() => {
    if (isRunShimmer) return
    setIsVoiceActive((active) => !active)
  }, [isRunShimmer])

  const promptShimmerActive = isRunShimmer || isVoiceActive

  const handleCloneSavedSearch = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const index = prev.findIndex((item) => item.id === id)
      if (index === -1) return prev

      const source = prev[index]!
      const clone: Demo2SavedSearch = {
        ...source,
        id: `${source.id}-clone-${Date.now()}`,
        title: `${source.title} (copy)`,
        timeAgo: "Just now",
      }

      const next = [...prev]
      next.splice(index + 1, 0, clone)
      return next
    })
  }, [])

  const handleRemoveSavedSearch = useCallback((id: string) => {
    setSavedSearches((prev) => prev.filter((item) => item.id !== id))
  }, [])
  const typingPlaceholder = useTypingPlaceholder(
    DEMO2_PROMPT_PLACEHOLDERS,
    showTypingPlaceholder,
  )

  const resetImproveState = () => {
    setIsImproved(false)
    promptBeforeImproveRef.current = null
  }

  useEffect(() => {
    if (prompt.trim()) return
    if (isPromptTransitioning || improveTypingTarget) return
    resetImproveState()
  }, [prompt, isPromptTransitioning, improveTypingTarget])

  const finishImproveTyping = () => {
    setImproveTypingTarget(null)
    setIsPromptTransitioning(false)
    pendingPromptTransitionRef.current = null
    promptEditorRef.current?.focus()
  }

  useImproveTypewriter(improveTypingTarget, onPromptChange, finishImproveTyping)

  useLayoutEffect(() => {
    if (!promptVisible) return
    syncPromptEditorHeight(promptEditorRef.current?.getElement() ?? null)
  }, [prompt, promptVisible])

  const handlePromptHeightChange = useCallback(() => {
    syncPromptEditorHeight(promptEditorRef.current?.getElement() ?? null)
  }, [])

  const transitionPrompt = (
    next: string,
    onDone?: () => void,
    mode: "fade" | "improve-type" = "fade",
  ) => {
    if (prefersReducedMotion) {
      onPromptChange(next)
      onDone?.()
      promptEditorRef.current?.focus()
      return
    }
    if (!promptVisible || pendingPromptTransitionRef.current) return
    pendingPromptTransitionRef.current = { next, onDone, mode }
    setIsPromptTransitioning(true)
    setPromptVisible(false)
  }

  const handlePromptExitComplete = () => {
    const pending = pendingPromptTransitionRef.current
    if (!pending) {
      setPromptVisible(true)
      setIsPromptTransitioning(false)
      return
    }

    if (pending.mode === "improve-type") {
      skipPromptEnterAnimationRef.current = true
      setPromptEnterKey((key) => key + 1)
      setPromptVisible(true)
      setImproveTypingTarget(pending.next)
      return
    }

    onPromptChange(pending.next)
    setPromptEnterKey((key) => key + 1)
    awaitingPromptEnterRef.current = true
    setPromptVisible(true)
  }

  const handlePromptEnterComplete = () => {
    if (skipPromptEnterAnimationRef.current) {
      skipPromptEnterAnimationRef.current = false
      return
    }
    if (!awaitingPromptEnterRef.current) return
    awaitingPromptEnterRef.current = false
    setIsPromptTransitioning(false)
    pendingPromptTransitionRef.current?.onDone?.()
    pendingPromptTransitionRef.current = null
    promptEditorRef.current?.focus()
  }

  const cancelImproveTransition = () => {
    setImproveTypingTarget(null)
    pendingPromptTransitionRef.current = null
    skipPromptEnterAnimationRef.current = false
    awaitingPromptEnterRef.current = false
    setIsPromptTransitioning(false)
    setPromptVisible(true)
  }

  const handleImprove = () => {
    const raw = prompt.trim()
    if (!raw || isPromptTransitioning) return
    promptBeforeImproveRef.current = prompt
    setIsImproved(true)
    transitionPrompt(improvePrompt(prompt), undefined, "improve-type")
  }

  const handleUndo = () => {
    if (promptBeforeImproveRef.current == null) return
    const previous = promptBeforeImproveRef.current

    if (isPromptTransitioning) {
      cancelImproveTransition()
      onPromptChange(previous)
      resetImproveState()
      promptEditorRef.current?.focus()
      return
    }

    transitionPrompt(previous, () => resetImproveState())
  }

  const heroBlockTop = DEMO2_SIZES.homeHeroBlockTop
  const greetingHeight = 24
  const greetingTop = heroBlockTop - 48 - greetingHeight

  const suggestionChips = useMemo(() => getPromptSuggestions(prompt), [prompt])

  const handleSuggestionClick = useCallback(
    (suggestion: PromptSuggestion) => {
      resetImproveState()
      const next = applyPromptSuggestion(prompt, suggestion.insertText)
      onPromptChange(next)
      promptEditorRef.current?.focus()
    },
    [onPromptChange, prompt],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (hasPrompt) onRun()
    }
  }

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <header className="absolute left-4 top-4 z-10">
        <p className="text-[13px] font-medium leading-4 text-[#202020]">Lead search</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="relative mx-auto w-full px-4 pb-10"
          style={{
            maxWidth: DEMO2_SIZES.homeContentWidth,
            minHeight:
              DEMO2_SIZES.homeHeroBlockTop +
              32 +
              8 +
              DEMO2_SIZES.homePromptShellHeight +
              DEMO2_SIZES.homeSavedSearchesGap +
              280,
          }}
        >
          <motion.h1
            className="absolute left-0 right-0 text-[20px] font-medium leading-[24px] text-[#202020]"
            style={{ top: greetingTop }}
            animate={
              isRunShimmer
                ? { opacity: 0, y: -6 }
                : { opacity: 1, y: 0 }
            }
            transition={HOME_SHELL_FADE}
          >
            Hey Samet, what are you looking for;
          </motion.h1>

          <div
            className="absolute left-0 right-0 flex flex-col gap-[72px]"
            style={{ top: heroBlockTop }}
          >
            <div className="flex flex-col gap-2">
              <motion.div
                className="flex flex-wrap gap-[6px]"
                animate={
                  isRunShimmer
                    ? { opacity: 0, y: -6 }
                    : { opacity: 1, y: 0 }
                }
                transition={HOME_SHELL_FADE}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {suggestionChips.map((chip) => (
                    <motion.div
                      key={chip.id}
                      layout
                      className="inline-flex"
                      initial={{ opacity: 0, scale: 0.96, filter: "blur(2px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.96, filter: "blur(2px)" }}
                      transition={{ duration: 0.2, ease: PROMPT_ACTION_EASE }}
                    >
                      <SuggestionChip
                        label={chip.label}
                        iconUrl={chip.iconUrl}
                        emoji={chip.emoji}
                        aiIcon={chip.aiIcon}
                        onClick={() => handleSuggestionClick(chip)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              <div
                className="flex flex-col gap-[14px] rounded-[16px] bg-[#fafafa] pb-[14px]"
                style={{ minHeight: DEMO2_SIZES.homePromptShellHeight }}
              >
                <PromptRunShimmer active={promptShimmerActive}>
                  <div
                    className={cn(
                      "flex shrink-0 flex-col rounded-[16px] bg-white p-[16px]",
                      !promptShimmerActive &&
                        "shadow-[0px_0px_2px_rgba(119,119,119,0.04),inset_0px_0px_0px_1px_#f4f4f4]",
                    )}
                    style={{
                      gap: DEMO2_SIZES.homePromptCardGap,
                      minHeight: DEMO2_SIZES.homePromptCardHeight,
                    }}
                  >
                <div className="relative shrink-0">
                  {showTypingPlaceholder ? <TypingPlaceholder text={typingPlaceholder} /> : null}
                  <AnimatePresence mode="wait" initial={false} onExitComplete={handlePromptExitComplete}>
                    {promptVisible ? (
                      <motion.div
                        key={promptEnterKey}
                        initial={
                          promptEnterKey === 0 || skipPromptEnterAnimationRef.current
                            ? false
                            : PROMPT_TEXT_INITIAL
                        }
                        animate={PROMPT_TEXT_SHOW}
                        exit={{ ...PROMPT_TEXT_HIDE, transition: PROMPT_TEXT_EXIT }}
                        transition={PROMPT_TEXT_ENTER}
                        onAnimationComplete={handlePromptEnterComplete}
                        className="relative z-10"
                      >
                        <HomeSmartPromptEditor
                          ref={promptEditorRef}
                          value={prompt}
                          onChange={onPromptChange}
                          onFocus={() => setPromptFocused(true)}
                          onBlur={() => setPromptFocused(false)}
                          onKeyDown={handleKeyDown}
                          readOnly={isPromptTransitioning}
                          onHeightChange={handlePromptHeightChange}
                          style={{ height: PROMPT_LINE_HEIGHT }}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <PromptActionButtons
                  hasPrompt={showPromptActions}
                  isImproved={isImproved}
                  isPromptTransitioning={isPromptTransitioning}
                  isRunShimmer={isRunShimmer}
                  isVoiceActive={isVoiceActive}
                  onVoiceToggle={handleVoiceToggle}
                  onImprove={handleImprove}
                  onUndo={handleUndo}
                  onRun={onRun}
                />
                  </div>
                </PromptRunShimmer>

              <motion.div
                className="group/filter relative -my-1 ml-2 w-fit"
                animate={
                  isRunShimmer
                    ? { opacity: 0, y: -4 }
                    : { opacity: 1, y: 0 }
                }
                transition={HOME_SHELL_FADE}
              >
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-[6px] rounded-[8px] px-2 py-1 text-[13px] leading-4 text-[#969696] transition-colors group-hover/filter:bg-[#eeeeee] group-hover/filter:text-[#777]"
                >
                  <svg
                    viewBox="0 0 11.5 11.5"
                    fill="none"
                    className="size-3 shrink-0"
                    aria-hidden
                  >
                    <path
                      d="M3.91684 6.04522C2.46524 4.95994 1.43078 3.76618 0.865936 3.09506C0.691087 2.88731 0.633795 2.73527 0.599347 2.46747C0.48139 1.55047 0.422411 1.09197 0.691296 0.795987C0.96018 0.500003 1.43568 0.500003 2.38668 0.500003H9.1133C10.0643 0.500003 10.5398 0.500003 10.8087 0.795987C11.0776 1.09197 11.0186 1.55047 10.9006 2.46747C10.8662 2.73528 10.8089 2.88732 10.634 3.09506C10.0684 3.76703 9.03187 4.96292 7.57732 6.04957C7.44573 6.14788 7.35899 6.3081 7.3429 6.48582C7.1988 8.07865 7.06593 8.9511 6.98322 9.39245C6.84972 10.105 5.83934 10.5337 5.29849 10.9162C4.97652 11.1439 4.58583 10.8728 4.54411 10.5204C4.46457 9.84857 4.31476 8.48372 4.15123 6.48582C4.13654 6.30647 4.04949 6.14438 3.91684 6.04522Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Filter
                </button>

                <div className="invisible absolute left-0 top-full z-20 translate-y-1 pt-1 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/filter:visible group-hover/filter:translate-y-0 group-hover/filter:opacity-100">
                  <div className="flex w-[140px] flex-col rounded-[12px] border border-solid border-[#f7f7f7] bg-white p-1 drop-shadow-[0px_1px_2px_rgba(34,34,34,0.05)]">
                    {DEMO2_FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[8px] px-2 py-[6px] text-left transition-colors duration-150 ease-out hover:bg-[#f4f4f4]"
                      >
                        <img
                          src={DEMO2_ASSETS[option.icon]}
                          alt=""
                          className={cn(
                            "size-[14px] shrink-0",
                            "flip" in option && option.flip && "-rotate-180 -scale-x-100",
                          )}
                          draggable={false}
                        />
                        <span className="text-[13px] leading-none tracking-[0.13px] text-[#777]">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            </div>

            <motion.section
              className="flex flex-col gap-3"
              animate={
                isRunShimmer
                  ? { opacity: 0, y: -6 }
                  : { opacity: 1, y: 0 }
              }
              transition={HOME_SHELL_FADE}
            >
            <div className="flex h-6 items-center justify-between px-3">
              <button
                type="button"
                onClick={() => setSavedSearchesOpen((open) => !open)}
                aria-expanded={savedSearchesOpen}
                className="flex cursor-pointer items-center gap-[6px]"
              >
                <span className="text-[13px] leading-4 tracking-[-0.13px] text-[#bbb]">Saved Searches</span>
                <HomeChevronDownIcon
                  size={16}
                  className={cn(
                    "transition-transform duration-200 ease-out",
                    savedSearchesOpen ? "rotate-0" : "-rotate-90",
                  )}
                />
              </button>
              {savedSearchesOpen ? (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-[6px] rounded-[16px] border-[0.5px] border-solid border-[#f4f4f4] px-[10px] py-[4px] shadow-[0px_0px_1px_0px_rgba(119,119,119,0.15)]"
                >
                  <span className="relative size-3 shrink-0 overflow-hidden">
                    <img
                      src={DEMO2_ASSETS.homeSort}
                      alt=""
                      className="block size-full max-w-none"
                      draggable={false}
                    />
                  </span>
                  <span className="whitespace-nowrap text-[13px] leading-normal text-[#838383]">
                    Last editing
                  </span>
                </button>
              ) : null}
            </div>

            {savedSearchesOpen ? (
              <div className="flex flex-col gap-2">
                {savedSearches.map((search) => (
                  <SavedSearchRow
                    key={search.id}
                    search={search}
                    onClone={() => handleCloneSavedSearch(search.id)}
                    onRemove={() => handleRemoveSavedSearch(search.id)}
                  />
                ))}
              </div>
            ) : null}
          </motion.section>
          </div>
        </div>
      </div>
    </main>
  )
}
