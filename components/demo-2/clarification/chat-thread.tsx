import type { ReactNode } from "react"
import { DEMO2_TOKENS } from "../demo-2-tokens"

interface ChatThreadProps {
  children: ReactNode
}

/** Centered vertical message stack for clarification chat (Figma 86:19266). */
export function ChatThread({ children }: ChatThreadProps) {
  return (
    <div
      className="mx-auto flex w-full flex-col gap-9"
      style={{ maxWidth: DEMO2_TOKENS.clarificationThreadWidth }}
    >
      {children}
    </div>
  )
}
