"use client"

import { motion, useReducedMotion } from "framer-motion"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_SIZES } from "./demo-2-tokens"
import { ChainOfThought } from "./chain-of-thought"
import { DEMO2_CHAT_CONTENT_ENTRANCE, DEMO2_SHELL_EASE } from "./demo-2-motion"
import { PostSearchFollowUp } from "./post-search-follow-up"
import { PromptRunShimmer } from "./prompt-run-shimmer"
import type { SearchRunStepStatus } from "./search-run-steps"
import type { Demo2SearchRunPhase } from "./use-demo2-search-run"
import { cn } from "@/lib/utils"

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
  bordered = true,
  children,
}: {
  bordered?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-4 rounded-[12px] bg-white p-3",
        bordered && "border border-solid border-[#f4f4f4]",
      )}
      style={{
        width: DEMO2_SIZES.chatInputWidth,
        height: DEMO2_SIZES.chatInputHeight,
      }}
    >
      {children}
    </div>
  )
}

function ChatResponseInputActions() {
  return (
    <div className="flex w-full shrink-0 items-center justify-between">
      <button
        type="button"
        aria-label="Add attachment"
        className="flex size-6 shrink-0 items-center justify-center rounded-[8px] border-[0.5px] border-solid border-[#f2f2f2] bg-white p-[6px] shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)]"
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
          className="flex size-6 shrink-0 items-center justify-center rounded-[8px] bg-[#f4f4f4] p-[6px]"
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
          className="flex size-6 shrink-0 items-center justify-center rounded-[8px] bg-[#0090ff] p-[6px]"
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
  value,
  bordered = true,
}: {
  value?: string
  bordered?: boolean
}) {
  return (
    <ChatResponseInputShell bordered={bordered}>
      {value ? (
        <p className="w-full shrink-0 truncate text-[13px] font-normal leading-4 tracking-[-0.13px] text-[#323232]">
          {value}
        </p>
      ) : (
        <p className="w-full shrink-0 break-words text-[13px] font-normal leading-4 tracking-[-0.13px] text-[#ccc]">
          Enter response
        </p>
      )}
      <ChatResponseInputActions />
    </ChatResponseInputShell>
  )
}

export function Demo2ChatPanel({
  title,
  flyPrompt,
  runPhase = "complete",
  cotStepStatuses = [],
  cotActiveStepIndex = 0,
  cotCompletedCount = 0,
  cotTotalSteps = 0,
  cotExpanded = false,
  onCotExpandedChange,
}: {
  title?: string
  /** Resolved prompt — shared layout target after Run transition. */
  flyPrompt?: string
  runPhase?: Demo2SearchRunPhase
  cotStepStatuses?: SearchRunStepStatus[]
  cotActiveStepIndex?: number
  cotCompletedCount?: number
  cotTotalSteps?: number
  cotExpanded?: boolean
  onCotExpandedChange?: (expanded: boolean) => void
} = {}) {
  const reduceMotion = useReducedMotion()
  const isRunning = runPhase === "running"
  const headerTitle = title ?? "Top AI companies in Nordics"
  const contentEntrance = reduceMotion
    ? { duration: 0 }
    : {
        delay: DEMO2_CHAT_CONTENT_ENTRANCE.delay,
        duration: DEMO2_CHAT_CONTENT_ENTRANCE.duration,
        ease: DEMO2_SHELL_EASE,
      }
  const headerEntrance = reduceMotion
    ? { duration: 0 }
    : { delay: 0.55, duration: 0.35, ease: DEMO2_SHELL_EASE }

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
          <button
            type="button"
            aria-label="More options"
            className="relative flex size-4 shrink-0 items-center justify-center"
          >
            <img
              src={DEMO2_ASSETS.chatMore}
              alt=""
              className="h-[2px] w-[10px] max-w-none"
              draggable={false}
            />
          </button>
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

      <div className="mx-2 mb-2 mt-auto shrink-0">
        {flyPrompt ? (
          <PromptRunShimmer active={isRunning} size="chat">
            <ChatResponseInput value={flyPrompt} bordered={!isRunning} />
          </PromptRunShimmer>
        ) : (
          <ChatResponseInput />
        )}
      </div>
    </aside>
  )
}
