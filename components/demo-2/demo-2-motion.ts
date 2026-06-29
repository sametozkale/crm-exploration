/** Demo-2 transition timing — prompt flight + staggered results chrome. */

export const DEMO2_SHELL_EASE = [0.16, 1, 0.3, 1] as const

/** Shimmer on home before layout flight begins (ms). */
export const DEMO2_RUN_SHIMMER_MS = 900

/** Prompt card morph home → chat (seconds). */
export const DEMO2_PROMPT_FLIGHT_S = 1.05

export const DEMO2_LAYOUT_TRANSITION = {
  layout: { duration: DEMO2_PROMPT_FLIGHT_S, ease: DEMO2_SHELL_EASE },
} as const

/** Home chrome fades when Run starts. */
export const DEMO2_HOME_SHELL_FADE = {
  duration: 0.4,
  ease: DEMO2_SHELL_EASE,
} as const

/** Gray prompt shell fades before the card flies to chat. */
export const DEMO2_PROMPT_SHELL_EXIT = {
  duration: 0.14,
  ease: DEMO2_SHELL_EASE,
} as const

/** Results shell fades in under the flying prompt. */
export const DEMO2_RESULTS_SHELL_ENTER = {
  duration: 0.4,
  ease: DEMO2_SHELL_EASE,
  delay: 0.06,
} as const

/** Sidebar narrows after prompt lands. */
export const DEMO2_SIDEBAR_COLLAPSE = {
  duration: 0.48,
  ease: DEMO2_SHELL_EASE,
} as const

const TOOLBAR_BASE_S = DEMO2_PROMPT_FLIGHT_S * 0.62

/** Staggered results chrome — timed to prompt flight. */
export const DEMO2_RESULTS_ENTRANCE = {
  sourceTabs: DEMO2_PROMPT_FLIGHT_S * 0.46,
  sourceTabStagger: 0.065,
  toolbar: TOOLBAR_BASE_S,
  toolbarStagger: 0.078,
  table: DEMO2_PROMPT_FLIGHT_S * 0.9,
  itemDuration: 0.5,
  duration: 0.5,
} as const

export const DEMO2_CHAT_HEADER_ENTRANCE = {
  delay: DEMO2_PROMPT_FLIGHT_S * 0.4,
  duration: 0.48,
} as const

export const DEMO2_CHAT_CONTENT_ENTRANCE = {
  delay: DEMO2_PROMPT_FLIGHT_S * 0.52,
  duration: 0.48,
} as const

export const DEMO2_ROW_ENTRANCE_DURATION_S = 0.42

/** Source tab hover — results table dims behind popover. */
export const DEMO2_TABLE_DIM = {
  opacity: 0.25,
  duration: 0.28,
  ease: DEMO2_SHELL_EASE,
} as const
