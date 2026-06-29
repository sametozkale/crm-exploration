import Image from "next/image"
import { DEMO2_ASSETS } from "../demo-2-assets"
import { ChatActionCard } from "./chat-action-card"
import type { SignalClarificationCardData } from "./clarification-types"

interface SignalClarificationCardProps {
  data: SignalClarificationCardData
  selectedSignalIds: Set<string>
  onToggleSignal: (signalId: string) => void
  onUseBoth: () => void
  onSetFiltersManually: () => void
}

/** Case 1 — signal clarification action card (Figma 86:19642). */
export function SignalClarificationCard({
  data,
  selectedSignalIds: _selectedSignalIds,
  onToggleSignal,
  onUseBoth,
  onSetFiltersManually,
}: SignalClarificationCardProps) {
  return (
    <ChatActionCard>
      <p className="text-[13px] leading-4 tracking-[-0.13px] text-[#777]">{data.intro}</p>

      <div className="flex flex-col gap-[16px]">
          {data.signals.map((signal) => (
            <div
              key={signal.id}
              className="flex w-full items-center justify-between rounded-[12px] border border-[#f4f4f4] bg-white py-[10px] pl-[12px] pr-[24px]"
            >
              <div className="flex shrink-0 flex-col items-start gap-[10px]">
                <p className="whitespace-nowrap text-[12px] font-medium leading-[14px] tracking-[-0.12px] text-[#0090ff]">
                  {signal.label}
                </p>
                <p className="text-[14px] font-normal leading-4 tracking-[-0.13px] text-[#17181a]">
                  {signal.title}
                </p>
                <p className="max-w-[364px] text-[13px] font-normal leading-normal tracking-[0.13px] text-[#bbb]">
                  {signal.meta}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSignal(signal.id)}
                className="shrink-0 cursor-pointer rounded-[12px] border border-[#f4f4f4] px-[10px] py-[8px] text-right text-[13px] font-medium leading-normal whitespace-nowrap text-[#202020] hover:bg-[#fafafa]"
              >
                Use this
              </button>
            </div>
          ))}
      </div>

      <p className="text-[12px] leading-[14px] tracking-[-0.12px] text-[#969696]">{data.summary}</p>

      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onUseBoth}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[11px] bg-[#202020] px-3 py-2 text-[14px] font-medium leading-4 tracking-[-0.14px] text-white hover:bg-[#333]"
        >
          <Image src={DEMO2_ASSETS.clarificationSearchWhite} alt="" width={12} height={12} />
          Use both
        </button>
        <button
          type="button"
          onClick={onSetFiltersManually}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[11px] px-3 py-2 text-[14px] leading-4 tracking-[-0.14px] text-[#777] hover:bg-[#f4f4f4]/60"
        >
          <Image src={DEMO2_ASSETS.clarificationFilter} alt="" width={14} height={14} />
          Set filters manually
        </button>
      </div>
    </ChatActionCard>
  )
}
