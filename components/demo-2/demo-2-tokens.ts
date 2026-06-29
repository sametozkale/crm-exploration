/** Figma node 134:72555 — layout & size tokens */

export const DEMO2_SIZES = {
  iconRailWidth: 48,
  homeSidebarWidth: 200,
  homeContentWidth: 600,
  /** Figma 77:12951 — gray shell (card + filter + bottom padding). */
  homePromptShellHeight: 142,
  /** Figma 72:753 — white prompt card content height. */
  homePromptCardHeight: 98,
  /** Figma 78:14933 — prompt block ↔ action row */
  homePromptCardGap: 16,
  homePromptActionHeight: 32,
  /** Figma 48:53 — vertical rhythm from frame top (982px artboard) */
  homePageTitleTop: 16,
  homeGreetingTop: 300,
  homeHeroBlockTop: 372,
  homeSavedSearchesGap: 72,
  homeSavedSearchesTop: 626,
  chatPanelWidth: 300,
  chatInputWidth: 284,
  chatInputHeight: 80,
  chatContentWidth: 260,
  chatActionCard: { width: 260, height: 147 },
  toolbarSearchWidth: 148,
  toolbarSearchIconWidth: 40,
  toolbarFilterWidth: 101,
  toolbarPublicWidth: 99,
  toolbarFindSimilarsWidth: 129,
  toolbarReviewWidth: 94,
  resultsRightPadding: 8,
  tabHeight: 28,
  toolbarPillHeight: 32,
  tableRowHeight: 36,
  tableMinWidth: 2282,
  /** Figma 219:17246 — scanning table (no score, + funding date) */
  scanningTableMinWidth: 2122,
  iconSm: 12,
  iconMd: 14,
  iconLg: 16,
  scoreBarSegment: { width: 16, height: 5 },
  clarificationThreadWidth: 600,
  /** Thread 600px − logo 24 − gap 8 − bubble ml 5 */
  clarificationBubbleMaxWidth: 563,
  /** Thread 600px − avatar 24 − gap 8 */
  clarificationUserBubbleMaxWidth: 568,
} as const

/** Chat prompt slot rect while sidebar is still wide (fixed layout — no DOM measure). */
export function getDemo2ChatPromptSlotRect(
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800,
): DOMRect {
  const left = DEMO2_SIZES.homeSidebarWidth + 8
  const top = viewportHeight - 8 - DEMO2_SIZES.chatInputHeight - 8
  return new DOMRect(left, top, DEMO2_SIZES.chatInputWidth, DEMO2_SIZES.chatInputHeight)
}

/** Figma 82:13429 — white prompt card at rest (1px ring + drop shadow). */
export const DEMO2_HOME_PROMPT_CARD_IDLE =
  "bg-[#f4f4f4] drop-shadow-[0px_0px_2px_rgba(119,119,119,0.04)]"

/** Figma 142:81976 — chat follow-up input at rest (border only, no shadow). */
export const DEMO2_CHAT_INPUT_SHELL_IDLE =
  "rounded-[12px] border border-solid border-[#f4f4f4] bg-white"

/** Clarification chat layout tokens (Figma 86/88). */
export const DEMO2_TOKENS = {
  clarificationThreadWidth: DEMO2_SIZES.clarificationThreadWidth,
  clarificationContentMaxWidth: DEMO2_SIZES.clarificationThreadWidth,
  clarificationBubbleMaxWidth: DEMO2_SIZES.clarificationBubbleMaxWidth,
  clarificationUserBubbleMaxWidth: DEMO2_SIZES.clarificationUserBubbleMaxWidth,
} as const
