"use client"

import { Keyboard } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"

const SHORTCUTS = [
  {
    keys: ["Tab"],
    label: "Move between search, Run, filter, sort, and results",
  },
  {
    keys: ["↑", "↓"],
    label: "Move between result rows",
  },
  {
    keys: ["Home", "End"],
    label: "Jump to first or last result",
  },
  {
    keys: ["Enter"],
    label:
      "Run search from the prompt, or open row details / restore when a row is focused",
  },
  {
    keys: ["Esc"],
    label: "Stop a running search, close details, or focus the prompt",
  },
  {
    keys: ["/"],
    label: "Focus the search prompt",
  },
] as const

function ShortcutKey({ children }: { children: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[6px] border border-border bg-card px-1.5",
        "font-inter text-[10px] font-medium leading-none tracking-[-0.01em] text-foreground",
        "shadow-[0_1px_0_0_oklch(0_0_0/0.05)] dark:border-border/80 dark:bg-secondary/60 dark:shadow-[0_1px_0_0_oklch(1_0_0/0.06)]",
      )}
    >
      {children}
    </kbd>
  )
}

function ShortcutKeys({ keys }: { keys: readonly string[] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, ki) => (
        <span key={`${key}-${ki}`} className="inline-flex items-center gap-1">
          {ki > 0 ? (
            <span
              className="select-none font-inter text-[9px] font-medium text-muted-foreground/35"
              aria-hidden
            >
              +
            </span>
          ) : null}
          <ShortcutKey>{key}</ShortcutKey>
        </span>
      ))}
    </span>
  )
}

function KeyboardShortcutsList({ compact = false }: { compact?: boolean }) {
  return (
    <ul
      className={cn(
        "font-inter text-[11px] text-muted-foreground",
        compact
          ? "flex flex-wrap gap-x-4 gap-y-2"
          : "divide-y divide-border/20",
      )}
    >
      {SHORTCUTS.map((item, i) => (
        <li
          key={`${item.label}-${i}`}
          className={cn(
            "items-center",
            compact
              ? "inline-flex min-w-0 max-w-full gap-2"
              : "flex gap-3 py-2.5 first:pt-0 last:pb-0",
          )}
        >
          <ShortcutKeys keys={item.keys} />
          <span
            className={cn(
              compact
                ? "truncate text-[10px] leading-none"
                : "min-w-0 flex-1 text-[11px] leading-snug",
            )}
          >
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function KeyboardShortcutsHelp({
  side = "bottom",
}: {
  side?: "top" | "bottom"
}) {
  return (
    <HoverCard openDelay={120} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground/55 hover:bg-transparent hover:text-muted-foreground/80 dark:text-muted-foreground/50 dark:hover:bg-transparent dark:hover:text-muted-foreground/75"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="size-4" aria-hidden />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        side={side}
        sideOffset={8}
        className="w-[min(100vw-2rem,20rem)] border border-border p-0 font-inter shadow-lg"
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-[11px] font-medium text-foreground">
            Keyboard shortcuts
          </p>
        </div>
        <div className="px-3 py-3">
          <KeyboardShortcutsList />
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function KeyboardShortcutsFooter() {
  return (
    <footer
      className="border-t border-border/25 pt-6 dark:border-border/20"
      aria-label="Keyboard shortcuts"
    >
      <p className="mb-3 font-inter text-[11px] font-medium text-foreground">
        Keyboard shortcuts
      </p>
      <KeyboardShortcutsList compact />
    </footer>
  )
}
