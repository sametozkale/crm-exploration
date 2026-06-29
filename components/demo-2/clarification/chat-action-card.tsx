import type { ReactNode } from "react"

interface ChatActionCardProps {
  children: ReactNode
}

/** Shared action card shell — Figma 86:19642 / 88:1409. */
export function ChatActionCard({ children }: ChatActionCardProps) {
  return (
    <div
      className="flex w-full flex-col gap-[16px] rounded-[12px] border border-[#f4f4f4] bg-[#fbfbfb] p-[16px]"
      style={{ borderRadius: 12 }}
    >
      {children}
    </div>
  )
}
