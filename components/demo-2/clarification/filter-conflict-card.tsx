import Image from "next/image"
import type { ReactNode } from "react"
import { DEMO2_ASSETS } from "../demo-2-assets"
import { ChatActionCard } from "./chat-action-card"
import type { FilterConflictCardData } from "./clarification-types"

interface FilterConflictCardProps {
  data: FilterConflictCardData
  onApplySuggested: () => void
  onKeepOriginal: () => void
}

function PromptCompareRow({
  label,
  labelClassName,
  children,
}: {
  label: string
  labelClassName: string
  children: ReactNode
}) {
  return (
    <div className="flex w-full items-start rounded-[12px] border border-[#f4f4f4] bg-white py-[10px] pl-[12px] pr-[24px]">
      <div className="flex w-full min-w-0 flex-col gap-2">
        <p
          className={`whitespace-nowrap text-[12px] font-medium leading-[14px] tracking-[-0.12px] ${labelClassName}`}
        >
          {label}
        </p>
        <p className="m-0 w-full max-w-[507px] break-words text-[14px] font-normal leading-5 tracking-[-0.13px] text-[#17181a]">
          {children}
        </p>
      </div>
    </div>
  )
}

/** Case 2 — filter conflict before/after card (Figma 88:1409). */
export function FilterConflictCard({
  data,
  onApplySuggested,
  onKeepOriginal,
}: FilterConflictCardProps) {
  return (
    <ChatActionCard>
      <p className="text-[13px] leading-[18px] tracking-[-0.13px] text-[#777]">{data.intro}</p>

      <div className="flex w-full flex-col gap-[8px]">
        <PromptCompareRow label={data.beforeLabel} labelClassName="text-[#ff3f3f]">
          {data.beforeSegments.map((segment, index) =>
            segment.conflict ? (
              <span key={index} className="font-medium text-[#ff3f3f] line-through">
                {segment.text}
              </span>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </PromptCompareRow>

        <PromptCompareRow label={data.afterLabel} labelClassName="text-[#00cd71]">
          {data.afterSegments.map((segment, index) => (
            <span key={index}>{segment.text}</span>
          ))}
        </PromptCompareRow>
      </div>

      <p className="text-[12px] leading-[14px] tracking-[-0.12px] text-[#969696]">{data.summary}</p>

      <div className="flex w-full items-center gap-[8px]">
        <button
          type="button"
          onClick={onApplySuggested}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-[6px] rounded-[11px] bg-[#202020] px-[12px] py-[8px] text-[14px] font-medium leading-4 tracking-[-0.14px] whitespace-nowrap text-white hover:bg-[#333]"
        >
          <span className="relative size-4 shrink-0 overflow-hidden">
            <Image
              src={DEMO2_ASSETS.clarificationTick}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </span>
          Apply & Run Search
        </button>
        <button
          type="button"
          onClick={onKeepOriginal}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[11px] bg-[#eee] px-[12px] py-[8px] text-[14px] font-medium leading-4 tracking-[-0.14px] whitespace-nowrap text-[#777] hover:bg-[#e4e4e4]"
        >
          Keep original
        </button>
      </div>
    </ChatActionCard>
  )
}
