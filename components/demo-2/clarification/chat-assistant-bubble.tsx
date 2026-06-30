"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { DEMO2_ASSETS } from "../demo-2-assets"
import { DEMO2_TOKENS } from "../demo-2-tokens"
import { balanceChatBubbleLines } from "./balance-chat-bubble-lines"

interface ChatAssistantBubbleProps {
  text: string
  multiline?: boolean
  showTail?: boolean
  /** False for stacked assistant messages above the last one in a group. */
  showLogo?: boolean
  /** Reveal the text character-by-character (typing effect). */
  animateTyping?: boolean
  /** Fires once the typing animation reaches the end. */
  onTypingDone?: () => void
}

const ASSISTANT_BUBBLE_TEXT_CLASS = "text-[14px] tracking-[-0.13px] text-[#323232]"

const TYPE_TICK_MS = 18

/** Reveal text char-by-char, scaling speed so long messages don't drag. */
function useTypewriter(total: number, active: boolean, onDone?: () => void) {
  const [count, setCount] = useState(active ? 0 : total)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!active) {
      setCount(total)
      return
    }
    setCount(0)
    if (total <= 0) {
      onDoneRef.current?.()
      return
    }
    const charsPerTick = Math.max(1, Math.round(total / 160))
    let typed = 0
    const id = setInterval(() => {
      typed += charsPerTick
      if (typed >= total) {
        setCount(total)
        clearInterval(id)
        onDoneRef.current?.()
      } else {
        setCount(typed)
      }
    }, TYPE_TICK_MS)
    return () => clearInterval(id)
  }, [active, total])

  return count
}

/** Left-aligned assistant bubble (Figma 216:5366 / stacked 90:1503). */
export function ChatAssistantBubble({
  text,
  multiline,
  showTail = true,
  showLogo = true,
  animateTyping = false,
  onTypingDone,
}: ChatAssistantBubbleProps) {
  const isStacked = !showLogo
  const lines = useMemo(
    () => (multiline ? [...balanceChatBubbleLines(text)] : [text]),
    [text, multiline],
  )
  const total = useMemo(
    () => lines.reduce((sum, line, i) => sum + line.length + (i > 0 ? 1 : 0), 0),
    [lines],
  )
  const typed = useTypewriter(total, animateTyping, onTypingDone)

  let cursor = 0
  const renderedLines = lines.map((line, i) => {
    if (i > 0) cursor += 1
    const start = cursor
    cursor += line.length
    const visible = animateTyping
      ? Math.max(0, Math.min(line.length, typed - start))
      : line.length
    return { line, visible }
  })

  const multilineLayout = multiline || lines.length > 1

  return (
    <div
      className={`flex w-fit max-w-full items-end gap-[8px] ${isStacked ? "pl-[37px]" : ""}`}
      style={{ maxWidth: DEMO2_TOKENS.clarificationThreadWidth }}
    >
      {showLogo ? (
        <Image
          src={DEMO2_ASSETS.logo}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 rounded-[8px]"
        />
      ) : null}
      <div
        className="relative w-fit max-w-full shrink-0"
        style={{ maxWidth: DEMO2_TOKENS.clarificationBubbleMaxWidth }}
      >
        <div
          className={`${showLogo ? "ml-[5px]" : ""} inline-flex w-max max-w-full flex-col bg-[#f6f6f6] px-3 py-2 ${
            isStacked
              ? "rounded-[10px]"
              : "rounded-bl-[5px] rounded-br-[10px] rounded-tl-[10px] rounded-tr-[10px]"
          } ${multiline ? "min-h-8" : "h-8 justify-center"}`}
          style={{ maxWidth: DEMO2_TOKENS.clarificationBubbleMaxWidth }}
        >
          <div
            className={`${ASSISTANT_BUBBLE_TEXT_CLASS} ${
              multilineLayout ? "flex flex-col leading-[18px]" : "leading-4"
            }`}
          >
            {renderedLines.map(({ line, visible }, index) => (
              <span key={index} className="relative whitespace-nowrap">
                <span aria-hidden className="opacity-0">
                  {line || "\u00A0"}
                </span>
                <span className="absolute inset-0 whitespace-nowrap">
                  {line.slice(0, visible)}
                </span>
              </span>
            ))}
          </div>
        </div>
        {showTail ? (
          <div className="pointer-events-none absolute -bottom-[2px] left-[3px] size-2">
            <Image
              src={DEMO2_ASSETS.clarificationTailLarge}
              alt=""
              width={8}
              height={8}
              className="size-2"
            />
            <Image
              src={DEMO2_ASSETS.clarificationTailSmall}
              alt=""
              width={4}
              height={4}
              className="absolute -left-[3px] top-[7px] size-1"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
