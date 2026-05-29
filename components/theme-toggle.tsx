"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "@/components/icons"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8 shrink-0", className)}
        aria-hidden
        tabIndex={-1}
        disabled
      />
    )
  }

  const isDark = theme === "dark"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "relative size-8 shrink-0 text-muted-foreground/55 hover:bg-transparent hover:text-muted-foreground/80 dark:text-muted-foreground/50 dark:hover:bg-transparent dark:hover:text-muted-foreground/75",
            className,
          )}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Sun
            className={cn(
              "size-4 motion-reduce:transition-none",
              isDark ? "hidden" : "block",
            )}
            aria-hidden
          />
          <Moon
            className={cn(
              "size-4 motion-reduce:transition-none",
              isDark ? "block" : "hidden",
            )}
            aria-hidden
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDark ? "Light mode" : "Dark mode"}
      </TooltipContent>
    </Tooltip>
  )
}
