"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Demo2HomeSidebar } from "../home-sidebar"
import { DEMO2_SHELL_EASE } from "../demo-2-motion"
import { ChatAssistantBubble } from "./chat-assistant-bubble"
import { ChatThread } from "./chat-thread"
import { ChatUserBubble } from "./chat-user-bubble"
import type {
  ClarificationResolution,
  ClarificationScenario,
} from "./clarification-types"
import { FilterConflictCard } from "./filter-conflict-card"
import { SignalClarificationCard } from "./signal-clarification-card"

/** Pause before the assistant starts "typing" each reply. */
const ASSISTANT_TYPING_START_DELAY_MS = 320

interface ClarificationPanelProps {
  scenario: ClarificationScenario
  onResolve: (resolution: ClarificationResolution) => void
}

/** Pre-search clarification — home sidebar + centered chat thread (Figma 86:19266). */
export function ClarificationPanel({ scenario, onResolve }: ClarificationPanelProps) {
  const reduceMotion = useReducedMotion()
  const [selectedSignalIds, setSelectedSignalIds] = useState<Set<string>>(() => {
    if (scenario.card.kind === "signal_clarification") {
      return new Set(scenario.card.signals.map((s) => s.id))
    }
    return new Set()
  })

  const toggleSignal = (signalId: string) => {
    setSelectedSignalIds((prev) => {
      const next = new Set(prev)
      if (next.has(signalId)) next.delete(signalId)
      else next.add(signalId)
      return next
    })
  }

  const handleUseBoth = () => {
    onResolve({ kind: "run", prompt: scenario.messages[0]?.text ?? "" })
  }

  const handleSetFiltersManually = () => {
    onResolve({ kind: "open_filters", prompt: scenario.messages[0]?.text ?? "" })
  }

  const handleApplySuggested = () => {
    if (scenario.card.kind !== "filter_conflict") return
    onResolve({ kind: "run", prompt: scenario.card.suggestedPrompt })
  }

  const handleKeepOriginal = () => {
    if (scenario.card.kind !== "filter_conflict") return
    onResolve({ kind: "run", prompt: scenario.card.originalPrompt })
  }

  const assistantMessages = scenario.messages.filter((m) => m.role === "assistant")
  const userMessage = scenario.messages.find((m) => m.role === "user")
  const totalAssistant = assistantMessages.length

  // Sequenced reveal: user bubble lands instantly, assistant replies type out
  // one after another, then the card fades in.
  const [visibleCount, setVisibleCount] = useState(reduceMotion ? totalAssistant : 0)
  const [cardVisible, setCardVisible] = useState(reduceMotion)
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (reduceMotion) {
      setVisibleCount(totalAssistant)
      setCardVisible(true)
      return
    }
    setVisibleCount(0)
    setCardVisible(false)
    const id = setTimeout(() => {
      if (totalAssistant > 0) setVisibleCount(1)
      else setCardVisible(true)
    }, ASSISTANT_TYPING_START_DELAY_MS)
    return () => clearTimeout(id)
  }, [reduceMotion, totalAssistant, scenario.id])

  useEffect(() => {
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current)
    }
  }, [])

  const handleTypingDone = () => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current)
    pendingTimer.current = setTimeout(() => {
      if (visibleCount < totalAssistant) {
        setVisibleCount((count) => count + 1)
      } else {
        setCardVisible(true)
      }
    }, ASSISTANT_TYPING_START_DELAY_MS)
  }

  const cardWrapperProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: cardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
        transition: { duration: 0.42, ease: DEMO2_SHELL_EASE },
      }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white font-inter" data-demo="2">
      <Demo2HomeSidebar />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <header className="absolute left-4 top-4 z-10">
          <p className="text-[13px] font-medium leading-4 text-[#202020]">Lead search</p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
          <div className="flex justify-center pt-20">
            <ChatThread>
              {userMessage ? <ChatUserBubble text={userMessage.text} /> : null}

              <div className="flex flex-col gap-[17px]">
                <div className="flex flex-col gap-1">
                  {assistantMessages.slice(0, visibleCount).map((message, index) => {
                    const isLastVisible = index === visibleCount - 1
                    return (
                      <ChatAssistantBubble
                        key={index}
                        text={message.text}
                        multiline={message.multiline}
                        showLogo={isLastVisible}
                        showTail={isLastVisible}
                        animateTyping={!reduceMotion && isLastVisible}
                        onTypingDone={isLastVisible ? handleTypingDone : undefined}
                      />
                    )
                  })}
                </div>

                {cardVisible && scenario.card.kind === "signal_clarification" ? (
                  <motion.div className="pl-[37px]" {...cardWrapperProps}>
                    <SignalClarificationCard
                      data={scenario.card}
                      selectedSignalIds={selectedSignalIds}
                      onToggleSignal={toggleSignal}
                      onUseBoth={handleUseBoth}
                      onSetFiltersManually={handleSetFiltersManually}
                    />
                  </motion.div>
                ) : null}

                {cardVisible && scenario.card.kind === "filter_conflict" ? (
                  <motion.div className="pl-[37px]" {...cardWrapperProps}>
                    <FilterConflictCard
                      data={scenario.card}
                      onApplySuggested={handleApplySuggested}
                      onKeepOriginal={handleKeepOriginal}
                    />
                  </motion.div>
                ) : null}
              </div>
            </ChatThread>
          </div>
        </div>
      </main>
    </div>
  )
}
