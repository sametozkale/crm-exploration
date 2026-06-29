import Image from "next/image"
import { DEMO2_ASSETS } from "../demo-2-assets"
import { DEMO2_TOKENS } from "../demo-2-tokens"

interface ChatUserBubbleProps {
  text: string
}

/** Right-aligned user message bubble (Figma 216:5365). */
export function ChatUserBubble({ text }: ChatUserBubbleProps) {
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
            className="inline-flex w-max max-w-full min-h-8 items-center justify-center rounded-bl-[10px] rounded-br-[5px] rounded-tl-[10px] rounded-tr-[10px] bg-[#f6f6f6] px-3 py-2"
            style={{ maxWidth: DEMO2_TOKENS.clarificationUserBubbleMaxWidth }}
          >
            <p className="break-words text-right text-[14px] leading-4 tracking-[-0.13px] text-[#323232]">
              {text}
            </p>
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
