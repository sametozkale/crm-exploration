import Image from "next/image"
import { DEMO2_ASSETS } from "../demo-2-assets"
import { DEMO2_TOKENS } from "../demo-2-tokens"
import { balanceChatBubbleLines } from "./balance-chat-bubble-lines"

interface ChatAssistantBubbleProps {
  text: string
  multiline?: boolean
  showTail?: boolean
  /** False for stacked assistant messages above the last one in a group. */
  showLogo?: boolean
}

const ASSISTANT_BUBBLE_TEXT_CLASS = "text-[14px] tracking-[-0.13px] text-[#323232]"

/** Left-aligned assistant bubble (Figma 216:5366 / stacked 90:1503). */
export function ChatAssistantBubble({
  text,
  multiline,
  showTail = true,
  showLogo = true,
}: ChatAssistantBubbleProps) {
  const isStacked = !showLogo
  const lines = multiline ? balanceChatBubbleLines(text) : ([text] as const)

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
          {lines.length === 1 ? (
            <p
              className={`${ASSISTANT_BUBBLE_TEXT_CLASS} ${
                multiline ? "leading-[18px]" : "leading-4 whitespace-nowrap"
              }`}
            >
              {lines[0]}
            </p>
          ) : (
            <div className={`flex flex-col ${ASSISTANT_BUBBLE_TEXT_CLASS} leading-[18px]`}>
              {lines.map((line, index) => (
                <span key={index} className="whitespace-nowrap">
                  {line}
                </span>
              ))}
            </div>
          )}
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
