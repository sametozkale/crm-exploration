"use client"

import { useState } from "react"
import { Demo2HomeSidebar } from "../home-sidebar"
import { ChatAssistantBubble } from "./chat-assistant-bubble"
import { ChatThread } from "./chat-thread"
import { ChatUserBubble } from "./chat-user-bubble"
import type {
  ClarificationResolution,
  ClarificationScenario,
} from "./clarification-types"
import { FilterConflictCard } from "./filter-conflict-card"
import { SignalClarificationCard } from "./signal-clarification-card"

interface ClarificationPanelProps {
  scenario: ClarificationScenario
  onResolve: (resolution: ClarificationResolution) => void
}

/** Pre-search clarification — home sidebar + centered chat thread (Figma 86:19266). */
export function ClarificationPanel({ scenario, onResolve }: ClarificationPanelProps) {
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
                  {assistantMessages.map((message, index) => (
                    <ChatAssistantBubble
                      key={index}
                      text={message.text}
                      multiline={message.multiline}
                      showLogo={index === assistantMessages.length - 1}
                      showTail={index === assistantMessages.length - 1}
                    />
                  ))}
                </div>

                {scenario.card.kind === "signal_clarification" ? (
                  <div className="pl-[37px]">
                    <SignalClarificationCard
                      data={scenario.card}
                      selectedSignalIds={selectedSignalIds}
                      onToggleSignal={toggleSignal}
                      onUseBoth={handleUseBoth}
                      onSetFiltersManually={handleSetFiltersManually}
                    />
                  </div>
                ) : null}

                {scenario.card.kind === "filter_conflict" ? (
                  <div className="pl-[37px]">
                    <FilterConflictCard
                      data={scenario.card}
                      onApplySuggested={handleApplySuggested}
                      onKeepOriginal={handleKeepOriginal}
                    />
                  </div>
                ) : null}
              </div>
            </ChatThread>
          </div>
        </div>
      </main>
    </div>
  )
}
