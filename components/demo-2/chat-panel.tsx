"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_SAVED_SEARCH_CONTEXT_ACTIONS } from "./demo-2-home-data"
import { DEMO2_SIZES, DEMO2_CHAT_INPUT_SHELL_IDLE } from "./demo-2-tokens"
import { ChainOfThought } from "./chain-of-thought"
import {
  DEMO2_CHAT_CONTENT_ENTRANCE,
  DEMO2_CHAT_HEADER_ENTRANCE,
  DEMO2_SHELL_EASE,
} from "./demo-2-motion"
import { PostSearchFollowUp } from "./post-search-follow-up"
import { PromptRunShimmer } from "./prompt-run-shimmer"
import type { SearchRunStepStatus } from "./search-run-steps"
import type { Demo2SearchRunPhase } from "./use-demo2-search-run"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const CHAT_INPUT_LINE_HEIGHT = 16
const CHAT_INPUT_MAX_LINES = 5

function syncChatTextareaHeight(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return
  const maxHeight = CHAT_INPUT_LINE_HEIGHT * CHAT_INPUT_MAX_LINES
  textarea.style.height = "0px"
  const measured = textarea.scrollHeight
  const nextHeight = Math.min(Math.max(CHAT_INPUT_LINE_HEIGHT, measured), maxHeight)
  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY = measured > maxHeight ? "auto" : "hidden"
}

function ChatInputIcon({
  src,
  inset,
  bleed = "inset-0",
  rounded = true,
}: {
  src: string
  inset: string
  bleed?: string
  rounded?: boolean
}) {
  return (
    <span
      className={cn(
        "relative size-3 shrink-0 overflow-clip",
        rounded && "rounded-[1px]",
      )}
    >
      <span className={cn("absolute", inset)}>
        <span className={cn("absolute", bleed)}>
          <img src={src} alt="" className="block size-full max-w-none" draggable={false} />
        </span>
      </span>
    </span>
  )
}

/** Figma 128:57542 — chat response input shell (284×80). */
function ChatResponseInputShell({
  fillParent = false,
  children,
}: {
  /** Inside PromptRunShimmer — fill the mask without changing outer dimensions. */
  fillParent?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-end bg-white p-3",
        fillParent ? "h-full min-h-0 w-full gap-3" : cn(DEMO2_CHAT_INPUT_SHELL_IDLE, "gap-4"),
      )}
      style={
        fillParent
          ? undefined
          : {
              width: DEMO2_SIZES.chatInputWidth,
              minHeight: DEMO2_SIZES.chatInputHeight,
            }
      }
    >
      {children}
    </div>
  )
}

function ChatResponseInputActions({
  onSubmit,
  canSubmit = false,
  disabled = false,
}: {
  onSubmit?: () => void
  canSubmit?: boolean
  disabled?: boolean
}) {
  return (
    <div className="flex w-full shrink-0 items-center justify-between">
      <button
        type="button"
        aria-label="Add attachment"
        disabled={disabled}
        className="flex size-6 shrink-0 items-center justify-center rounded-[8px] border-[0.5px] border-solid border-[#f2f2f2] bg-white p-[6px] shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChatInputIcon
          src={DEMO2_ASSETS.chatAdd}
          inset="inset-[16.67%]"
          bleed="inset-[-6.25%]"
        />
      </button>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Voice input"
          disabled={disabled}
          className="flex size-6 shrink-0 items-center justify-center rounded-[8px] bg-[#f4f4f4] p-[6px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChatInputIcon
            src={DEMO2_ASSETS.chatMic}
            inset="inset-[8.33%_16.67%]"
            bleed="inset-[-4%_-5%]"
          />
        </button>
        <button
          type="button"
          aria-label="Send"
          disabled={disabled || !canSubmit}
          onClick={onSubmit}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-[8px] p-[6px] transition-colors",
            canSubmit && !disabled
              ? "bg-[#0090ff] hover:bg-[#0081e6]"
              : "bg-[#0090ff] opacity-40",
            "disabled:cursor-not-allowed",
          )}
        >
          <ChatInputIcon
            src={DEMO2_ASSETS.chatSubmit}
            inset="inset-0"
            rounded={false}
          />
        </button>
      </div>
    </div>
  )
}

function ChatResponseInput({
  value = "",
  onChange,
  onSubmit,
  readOnly = false,
  fillParent = false,
  placeholder = "Enter response",
}: {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  readOnly?: boolean
  fillParent?: boolean
  placeholder?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSubmit = Boolean(value.trim())

  useLayoutEffect(() => {
    if (readOnly) return
    syncChatTextareaHeight(textareaRef.current)
  }, [value, readOnly])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
    syncChatTextareaHeight(e.target)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSubmit && !readOnly) onSubmit?.()
    }
  }

  return (
    <ChatResponseInputShell fillParent={fillParent}>
      {readOnly ? (
        <p className="w-full min-h-4 shrink-0 truncate text-[13px] font-normal leading-4 tracking-[-0.13px] text-[#323232]">
          {value}
        </p>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          aria-label="Follow-up prompt"
          className="w-full min-h-4 resize-none border-0 bg-transparent p-0 text-[13px] font-normal leading-4 tracking-[-0.13px] text-[#323232] outline-none placeholder:text-[#ccc]"
        />
      )}
      <ChatResponseInputActions
        onSubmit={onSubmit}
        canSubmit={canSubmit}
        disabled={readOnly}
      />
    </ChatResponseInputShell>
  )
}

export function Demo2ChatPanel({
  title,
  flyPrompt,
  promptShimmerActive,
  hidePromptDuringFlight = false,
  chatPromptSlotRef,
  runPhase = "complete",
  cotStepStatuses = [],
  cotActiveStepIndex = 0,
  cotCompletedCount = 0,
  cotTotalSteps = 0,
  cotExpanded = false,
  onCotExpandedChange,
  onFollowUpSubmit,
  onCloneSearch,
  onRemoveSearch,
}: {
  title?: string
  /** Shared layout target while prompt morphs home → chat. */
  flyPrompt?: string
  promptShimmerActive?: boolean
  hidePromptDuringFlight?: boolean
  chatPromptSlotRef?: React.RefObject<HTMLDivElement | null>
  runPhase?: Demo2SearchRunPhase
  cotStepStatuses?: SearchRunStepStatus[]
  cotActiveStepIndex?: number
  cotCompletedCount?: number
  cotTotalSteps?: number
  cotExpanded?: boolean
  onCotExpandedChange?: (expanded: boolean) => void
  onFollowUpSubmit?: (prompt: string) => void
  onCloneSearch?: () => void
  onRemoveSearch?: () => void
} = {}) {
  const reduceMotion = useReducedMotion()
  const isRunning = runPhase === "running"
  const shimmerActive = promptShimmerActive ?? isRunning
  const [followUp, setFollowUp] = useState("")
  const headerTitle = title ?? "Top AI companies in Nordics"

  const handleFollowUpSubmit = useCallback(() => {
    const trimmed = followUp.trim()
    if (!trimmed || isRunning) return
    onFollowUpSubmit?.(trimmed)
    setFollowUp("")
  }, [followUp, isRunning, onFollowUpSubmit])
  const contentEntrance = reduceMotion
    ? { duration: 0 }
    : {
        delay: DEMO2_CHAT_CONTENT_ENTRANCE.delay,
        duration: DEMO2_CHAT_CONTENT_ENTRANCE.duration,
        ease: DEMO2_SHELL_EASE,
      }
  const headerEntrance = reduceMotion
    ? { duration: 0 }
    : {
        delay: DEMO2_CHAT_HEADER_ENTRANCE.delay,
        duration: DEMO2_CHAT_HEADER_ENTRANCE.duration,
        ease: DEMO2_SHELL_EASE,
      }

  const promptInput = flyPrompt ? (
    <PromptRunShimmer
      active={shimmerActive}
      size="chat"
      className="relative z-[60]"
      style={{
        width: DEMO2_SIZES.chatInputWidth,
        height: DEMO2_SIZES.chatInputHeight,
      }}
    >
      <ChatResponseInput value={flyPrompt} readOnly fillParent />
    </PromptRunShimmer>
  ) : (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.35, ease: DEMO2_SHELL_EASE }
      }
    >
      <PromptRunShimmer
        active={shimmerActive}
        size="chat"
        style={{
          width: DEMO2_SIZES.chatInputWidth,
          minHeight: DEMO2_SIZES.chatInputHeight,
        }}
      >
        <ChatResponseInput
          value={followUp}
          onChange={setFollowUp}
          onSubmit={handleFollowUpSubmit}
        />
      </PromptRunShimmer>
    </motion.div>
  )

  return (
    <aside
      className="flex h-dvh shrink-0 flex-col overflow-hidden bg-[#fafafa]"
      style={{ width: DEMO2_SIZES.chatPanelWidth }}
    >
      <motion.header
        className="flex shrink-0 items-start justify-between gap-3 px-5 pt-4"
        initial={reduceMotion ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={headerEntrance}
      >
        <div className="flex h-4 min-w-0 flex-1 items-center gap-[6px]">
          <h1
            className="min-w-0 truncate text-[13px] font-medium leading-4 text-[#202020]"
            title={headerTitle}
          >
            {headerTitle}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More options"
                className="relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors duration-150 ease-out hover:bg-[#f4f4f4]"
              >
                <img
                  src={DEMO2_ASSETS.chatMore}
                  alt=""
                  className="h-[2px] w-[10px] max-w-none"
                  draggable={false}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="min-w-[160px] rounded-[12px] border border-solid border-[#f7f7f7] bg-white p-1 shadow-[0px_1px_2px_rgba(34,34,34,0.05)]"
            >
              {DEMO2_SAVED_SEARCH_CONTEXT_ACTIONS.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-[6px] text-[13px] leading-normal tracking-[0.13px] text-[#777] focus:bg-[#f4f4f4] data-[highlighted]:bg-[#f4f4f4]"
                  onSelect={() => {
                    if (action.id === "clone") onCloneSearch?.()
                    if (action.id === "remove") onRemoveSearch?.()
                  }}
                >
                  <img
                    src={DEMO2_ASSETS[action.icon]}
                    alt=""
                    className="size-4 shrink-0"
                    draggable={false}
                  />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex h-4 shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="History"
            className="flex size-4 cursor-pointer items-center justify-center rounded-[8px] transition-colors duration-150 ease-out hover:bg-[#f4f4f4]"
          >
            <img src={DEMO2_ASSETS.chatClock} alt="" className="size-4 max-w-none" draggable={false} />
          </button>
          <button
            type="button"
            aria-label="Collapse sidebar"
            className="flex size-4 cursor-pointer items-center justify-center rounded-[8px] transition-colors duration-150 ease-out hover:bg-[#f4f4f4]"
          >
            <img src={DEMO2_ASSETS.chatSidebar} alt="" className="size-4 max-w-none" draggable={false} />
          </button>
        </div>
      </motion.header>

      <motion.div
        className="min-h-0 flex-1 overflow-y-auto px-5 pt-[26px]"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={contentEntrance}
      >
        <div
          className="flex flex-col gap-4"
          style={{ maxWidth: DEMO2_SIZES.chatContentWidth }}
        >
          <ChainOfThought
            phase={runPhase}
            stepStatuses={cotStepStatuses}
            activeStepIndex={cotActiveStepIndex}
            completedCount={cotCompletedCount}
            totalSteps={cotTotalSteps}
            expanded={cotExpanded}
            onExpandedChange={onCotExpandedChange ?? (() => {})}
          >
            <PostSearchFollowUp active={!isRunning} />
          </ChainOfThought>
        </div>
      </motion.div>

      <div ref={chatPromptSlotRef} className="mx-2 mb-2 mt-auto shrink-0">
        {hidePromptDuringFlight ? (
          <div
            className="invisible"
            style={{
              width: DEMO2_SIZES.chatInputWidth,
              height: DEMO2_SIZES.chatInputHeight,
            }}
            aria-hidden
          />
        ) : (
          promptInput
        )}
      </div>
    </aside>
  )
}
