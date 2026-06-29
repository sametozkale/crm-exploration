import Image from "next/image"
import { DEMO2_ASSETS } from "../demo-2-assets"
import { DEMO2_TOKENS } from "../demo-2-tokens"
import {
  balanceChatBubbleLines,
  chatBubbleNeedsNaturalWrap,
} from "./balance-chat-bubble-lines"

interface ChatUserBubbleProps {
  text: string
}

const USER_BUBBLE_TEXT_CLASS =
  "text-[14px] leading-4 tracking-[-0.13px] text-[#323232]"

const USER_BUBBLE_MULTILINE_LEADING = "leading-[18px]"

/** Right-aligned user message bubble (Figma 216:5365). */
export function ChatUserBubble({ text }: ChatUserBubbleProps) {
  const useNaturalWrap = chatBubbleNeedsNaturalWrap(text)
  const lines = useNaturalWrap ? null : balanceChatBubbleLines(text)

  return (
    <div className="flex w-full justify-end">
      <div
        className="flex w-max max-w-full items-end gap-[8px]"
        style={{ maxWidth: DEMO2_TOKENS.clarificationThreadWidth }}
      >
        <div
          className="relative w-max max-w-full shrink-0"
          style={{ maxWidth: DEMO2_TOKENS.clarificationUserBubbleMaxWidth }}
        >
          <div
            className="inline-flex w-max max-w-full min-h-8 flex-col items-end justify-center rounded-bl-[10px] rounded-br-[5px] rounded-tl-[10px] rounded-tr-[10px] bg-[#f6f6f6] px-3 py-2"
            style={{ maxWidth: DEMO2_TOKENS.clarificationUserBubbleMaxWidth }}
          >
            {useNaturalWrap ? (
              <p
                className={`text-right break-words ${USER_BUBBLE_TEXT_CLASS} ${USER_BUBBLE_MULTILINE_LEADING}`}
              >
                {text.trim()}
              </p>
            ) : lines!.length === 1 ? (
              <p className={`whitespace-nowrap text-right ${USER_BUBBLE_TEXT_CLASS}`}>
                {lines![0]}
              </p>
            ) : (
              <div
                className={`flex flex-col items-end ${USER_BUBBLE_TEXT_CLASS} ${
                  lines!.length > 2 ? USER_BUBBLE_MULTILINE_LEADING : "leading-4"
                }`}
              >
                {lines!.map((line, index) => (
                  <span key={index} className="whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute -bottom-[2px] -right-[2px] size-2">
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
              className="absolute -right-[3px] top-[7px] size-1"
            />
          </div>
        </div>
        <Image
          src={DEMO2_ASSETS.clarificationUserAvatar}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 rounded-[24px] object-cover"
        />
      </div>
    </div>
  )
}
