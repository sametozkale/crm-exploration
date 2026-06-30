"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { DEMO2_ASSETS } from "./demo-2-assets"
import {
  DEMO2_MORE_SUGGESTIONS,
  DEMO2_NEW_COUNT_ACTIONS,
  DEMO2_PROMPT_PLACEHOLDERS,
  DEMO2_SAVED_SEARCHES,
  DEMO2_SAVED_SEARCH_CONTEXT_ACTIONS,
  DEMO2_SAVED_SEARCH_SORT_OPTIONS,
  DEMO2_SUGGESTION_CHIPS,
  type Demo2SavedSearch,
  type Demo2SavedSearchSortId,
} from "./demo-2-home-data"
import { DEMO2_SIZES } from "./demo-2-tokens"
import { HomeChevronDownIcon, HomeEqualizerIcon, HomeImproveIcon, HomeSearchListIcon } from "./home-icons"
import { HomeSmartPromptEditor, HOME_PROMPT_EDITOR_TEXT_CLASS, type HomeSmartPromptHandle } from "./home-smart-prompt-editor"
import { improvePrompt } from "@/lib/prompt-tokens"
import {
  applyPromptSuggestion,
  getPromptSuggestions,
  type PromptSuggestion,
} from "@/lib/prompt-suggestions"
import type { FilterQuery } from "@/lib/filter-query"
import { DEMO2_HOME_SHELL_FADE, DEMO2_PROMPT_SHELL_COLLAPSE } from "./demo-2-motion"
import { HomeFilterBar } from "./home-filter-bar"
import { useDelayedHover } from "./use-delayed-hover"
import { PromptRunShimmer } from "./prompt-run-shimmer"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"

const PROMPT_LINE_HEIGHT = 18
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

const HOME_SHELL_FADE = DEMO2_HOME_SHELL_FADE

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
      className={cn(
        "pointer-events-none absolute inset-0 text-[#ccc]",
        HOME_PROMPT_EDITOR_TEXT_CLASS,
      )}
      aria-hidden
    >
      {text}
      <span className="ml-px inline-block h-[14px] w-px animate-pulse bg-[#ccc]" />
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

function MoreSuggestionsChip({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <div className="group/more relative shrink-0">
      <button
        type="button"
        className="flex h-8 cursor-pointer items-center gap-2 rounded-[12px] border border-solid border-[#f4f4f4] bg-white px-2 py-[6px] transition-colors duration-150 ease-out group-hover/more:border-[#e0e0e0]"
      >
        <span className="text-[14px] leading-[15px] text-[#aaa] transition-colors duration-150 ease-out group-hover/more:text-[#909090]">
          +4
        </span>
      </button>

      <div className="invisible absolute bottom-full left-0 z-20 translate-y-1 pb-2 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/more:visible group-hover/more:translate-y-0 group-hover/more:opacity-100">
        <div className="flex w-[208px] flex-col gap-[2px] rounded-[12px] border border-solid border-[#f4f4f4] bg-white p-[6px] shadow-[0px_12px_32px_rgba(17,17,17,0.1)]">
          {DEMO2_MORE_SUGGESTIONS.map(({ label, emoji, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(prompt)}
              className="flex items-center gap-2 rounded-[8px] px-[10px] py-[8px] text-left text-[13px] leading-4 text-[#646464] transition-colors duration-150 ease-out hover:bg-[#f4f4f4] hover:text-[#202020]"
            >
              <span className="text-[14px] leading-none" aria-hidden>
                {emoji}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
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

function SavedSearchSortMenu({
  value,
  onChange,
}: {
  value: Demo2SavedSearchSortId
  onChange: (next: Demo2SavedSearchSortId) => void
}) {
  const sortHover = useDelayedHover()
  const activeLabel =
    DEMO2_SAVED_SEARCH_SORT_OPTIONS.find((option) => option.id === value)?.label ??
    "Last editing"

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={sortHover.onEnter}
      onMouseLeave={sortHover.onLeave}
    >
      <button
        type="button"
        className="flex cursor-pointer items-center gap-[6px] rounded-[16px] border-[0.5px] border-solid border-[#f4f4f4] px-[10px] py-[4px] shadow-[0px_0px_1px_0px_rgba(119,119,119,0.15)] transition-colors duration-150 ease-out hover:bg-[#fafafa]"
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
          {activeLabel}
        </span>
      </button>

      <div
        className={cn(
          "absolute right-0 top-full z-20 pt-1 transition-opacity duration-150 ease-out",
          sortHover.open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div className="min-w-[152px] rounded-[12px] border border-solid border-[#f7f7f7] bg-white p-1 drop-shadow-[0px_1px_2px_rgba(34,34,34,0.05)]">
          {DEMO2_SAVED_SEARCH_SORT_OPTIONS.map((option) => {
            const selected = option.id === value
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className={cn(
                  "flex w-full items-center rounded-[8px] px-2 py-[6px] text-left text-[13px] leading-none tracking-[-0.13px] transition-colors duration-150 ease-out hover:bg-[#f4f4f4]",
                  selected ? "text-[#323232]" : "text-[#969696] hover:text-[#777777]",
                )}
              >
                {option.label}
              </button>
            )
          })}
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
          <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[8px] bg-[rgba(0,144,255,0.07)]">
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
                  src={search.editorAvatar ?? DEMO2_ASSETS.homeAvatar}
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
              <span className="hidden text-[12px] leading-4 text-[#aaa] transition-opacity duration-150 ease-out group-hover:inline">
                {search.timeAgo}
              </span>
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
  filterQuery,
  onFilterQueryChange,
  isRunShimmer = false,
  grayShellHiding = false,
  onGrayShellHidden,
  homeLayoutFlying = false,
  promptCardRef,
}: {
  prompt: string
  onPromptChange: (value: string) => void
  onRun: () => void
  filterQuery: FilterQuery
  onFilterQueryChange: (query: FilterQuery) => void
  isRunShimmer?: boolean
  grayShellHiding?: boolean
  onGrayShellHidden?: () => void
  homeLayoutFlying?: boolean
  promptCardRef?: React.RefObject<HTMLDivElement | null>
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
  const [savedSearchSort, setSavedSearchSort] =
    useState<Demo2SavedSearchSortId>("last_editing")
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
  const shellCollapsed = isRunShimmer || grayShellHiding || homeLayoutFlying

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

  const handleTemplateClick = useCallback(
    (templatePrompt: string) => {
      resetImproveState()
      onPromptChange(templatePrompt)
      promptEditorRef.current?.focusAtEnd()
    },
    [onPromptChange],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (hasPrompt) onRun()
    }
  }

  return (
    <main
      className={cn(
        "relative flex min-h-0 min-w-0 flex-1 flex-col",
        homeLayoutFlying ? "bg-transparent" : "bg-white",
        isRunShimmer && "z-[1]",
      )}
    >
      <header
        className={cn(
          "absolute left-4 top-4 z-10",
          homeLayoutFlying && "pointer-events-none opacity-0",
        )}
      >
        <p className="text-[13px] font-medium leading-4 text-[#202020]">Lead search</p>
      </header>

      <div
        className={cn(
          "min-h-0 flex-1",
          isRunShimmer ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        <div
          className={cn(
            "relative mx-auto w-full px-4 pb-10",
            isRunShimmer && "overflow-visible",
          )}
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
              {!homeLayoutFlying ? (
                <>
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
                  {!hasPrompt
                    ? DEMO2_SUGGESTION_CHIPS.map((chip) => (
                        <motion.div
                          key={chip.id}
                          layout
                          className="inline-flex"
                          initial={{ opacity: 0, scale: 0.96, filter: "blur(2px)" }}
                          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.96, filter: "blur(2px)" }}
                          transition={{ duration: 0.2, ease: PROMPT_ACTION_EASE }}
                        >
                          {chip.id === "more" ? (
                            <MoreSuggestionsChip onSelect={handleTemplateClick} />
                          ) : (
                            <SuggestionChip
                              label={chip.label}
                              iconUrl={"iconUrl" in chip ? chip.iconUrl : undefined}
                              emoji={"emoji" in chip ? chip.emoji : undefined}
                              onClick={() => handleTemplateClick(chip.prompt)}
                            />
                          )}
                        </motion.div>
                      ))
                    : suggestionChips.map((chip) => (
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

              <motion.div
                className={cn(
                  "relative flex flex-col gap-[14px] rounded-[16px] bg-[#fafafa]",
                  !shellCollapsed && "pb-[10px]",
                )}
                animate={
                  shellCollapsed
                    ? { paddingBottom: 0, backgroundColor: "rgba(250,250,250,0)" }
                    : undefined
                }
                transition={DEMO2_PROMPT_SHELL_COLLAPSE}
                onAnimationComplete={() => {
                  if (!grayShellHiding || !shellCollapsed) return
                  onGrayShellHidden?.()
                }}
              >
                <motion.div
                  className="relative w-full shrink-0"
                  animate={{
                    minHeight: shellCollapsed
                      ? 0
                      : DEMO2_SIZES.homePromptShellHeight - 10,
                  }}
                  transition={DEMO2_PROMPT_SHELL_COLLAPSE}
                >
                <div ref={promptCardRef} className="relative w-full">
                <PromptRunShimmer
                  active={promptShimmerActive}
                  compact={shellCollapsed}
                  className={cn(
                    "w-full",
                    isRunShimmer && "relative z-[60]",
                  )}
                >
                  <div
                    className="flex w-full shrink-0 flex-col p-[16px]"
                    style={{ gap: DEMO2_SIZES.homePromptCardGap }}
                  >
                <div className="relative min-h-0 shrink-0 overflow-hidden">
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

                <AnimatePresence initial={false}>
                  {!isRunShimmer ? (
                    <motion.div
                      key="prompt-actions"
                      initial={false}
                      exit={{
                        opacity: 0,
                        height: 0,
                        marginTop: 0,
                        transition: {
                          opacity: { duration: 0.2 },
                          height: PROMPT_ACTION_EXIT,
                          marginTop: PROMPT_ACTION_EXIT,
                        },
                      }}
                      className="w-full overflow-hidden"
                    >
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
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                  </div>
                </PromptRunShimmer>
                </div>
                </motion.div>

              <motion.div
                className="relative pl-[10px]"
                animate={
                  isRunShimmer
                    ? { opacity: 0, y: -4 }
                    : { opacity: 1, y: 0 }
                }
                transition={HOME_SHELL_FADE}
              >
                <HomeFilterBar
                  filterQuery={filterQuery}
                  onFilterQueryChange={onFilterQueryChange}
                />
              </motion.div>
              </motion.div>
                </>
              ) : null}
            </div>

            <motion.section
              className="flex flex-col gap-3"
              animate={
                isRunShimmer || homeLayoutFlying || grayShellHiding
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
                <SavedSearchSortMenu
                  value={savedSearchSort}
                  onChange={setSavedSearchSort}
                />
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
