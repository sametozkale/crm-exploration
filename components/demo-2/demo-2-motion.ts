/** Shared demo-2 shell / layout-flight timing (home → results). */

export const DEMO2_SHELL_EASE = [0.22, 1, 0.36, 1] as const

export const DEMO2_LAYOUT_DURATION_S = 0.65

export const DEMO2_RUN_SHIMMER_MS = 650

export const DEMO2_LAYOUT_TRANSITION = {
  layout: { duration: DEMO2_LAYOUT_DURATION_S, ease: DEMO2_SHELL_EASE },
} as const

/** Stagger results chrome after prompt layout flight lands. */
export const DEMO2_RESULTS_ENTRANCE = {
  sourceTabs: 0.52,
  toolbar: 0.64,
  table: 0.76,
} as const

export const DEMO2_CHAT_CONTENT_ENTRANCE = {
  delay: 0.72,
  duration: 0.4,
} as const
