"use client"

import { cn } from "@/lib/utils"

/** Per-dot timing for pseudo-random blue grid flicker (3×3). */
const SOURCE_DOT_PATTERNS: Record<
  0 | 1,
  readonly { delay: number; duration: number; min: number }[]
> = {
  0: [
    { delay: 0, duration: 1.15, min: 0.3 },
    { delay: 0.35, duration: 1.45, min: 0.55 },
    { delay: 0.7, duration: 1.05, min: 0.25 },
    { delay: 0.15, duration: 1.35, min: 0.45 },
    { delay: 0.55, duration: 1.2, min: 0.2 },
    { delay: 0.9, duration: 1.5, min: 0.6 },
    { delay: 0.25, duration: 1.1, min: 0.35 },
    { delay: 0.65, duration: 1.4, min: 0.5 },
    { delay: 0.45, duration: 1.25, min: 0.28 },
  ],
  1: [
    { delay: 0.2, duration: 1.3, min: 0.5 },
    { delay: 0.6, duration: 1.1, min: 0.22 },
    { delay: 0.05, duration: 1.45, min: 0.4 },
    { delay: 0.8, duration: 1.2, min: 0.32 },
    { delay: 0.3, duration: 1.35, min: 0.58 },
    { delay: 0.5, duration: 1.05, min: 0.26 },
    { delay: 0.75, duration: 1.5, min: 0.44 },
    { delay: 0.1, duration: 1.15, min: 0.18 },
    { delay: 0.4, duration: 1.4, min: 0.52 },
  ],
}

/** Figma 127:46427 / 221:19941 — animated blue dot grid; gray variant for CoT loading. */
export function AnimatedSourceDotGrid({
  variant = 0,
  rotate = false,
  tone = "blue",
}: {
  variant?: 0 | 1
  rotate?: boolean
  /** `gray` — neutral dots with staggered flicker (CoT loading header). */
  tone?: "blue" | "gray"
}) {
  const pattern = SOURCE_DOT_PATTERNS[variant]
  const isGray = tone === "gray"

  return (
    <span
      className={cn(
        "demo2-source-dot-grid grid size-[13px] grid-cols-3 gap-[1.5px]",
        rotate && "rotate-180",
      )}
      aria-hidden
    >
      {pattern.map((dot, index) => (
        <span
          key={index}
          className={cn(
            "demo2-source-dot size-[3px] rounded-full",
            isGray ? "bg-[#d8d8d8]" : "bg-[#0090ff]",
          )}
          style={
            {
              "--dot-min": dot.min,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  )
}
