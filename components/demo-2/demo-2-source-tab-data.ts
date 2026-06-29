import { DEMO2_ASSETS } from "./demo-2-assets"

const TABS = "/demo-2/tabs"

export type SourceTabPopoverLink = {
  icon: string
  label: string
  rounded?: boolean
}

export type SourceTabPopoverData = {
  links: readonly SourceTabPopoverLink[]
  moreCount: number
  model: string
  author: string
  authorAvatar: string
}

/** Figma 128:72313 — source tab hover popover content. */
export const DEMO2_SOURCE_TAB_POPOVERS: Record<string, SourceTabPopoverData> = {
  source1: {
    links: [
      {
        icon: DEMO2_ASSETS.tabSource1a,
        label: "Y Combinator Company List | Batch W26",
        rounded: true,
      },
      {
        icon: DEMO2_ASSETS.tabSource1b,
        label: "Top YC Startups 2026 — Crunchbase Directory",
      },
      {
        icon: DEMO2_ASSETS.tabSource1c,
        label: "YC Portfolio Companies by Sector and Funding Stage",
        rounded: true,
      },
    ],
    moreCount: 2,
    model: "Claude Opus 4.8",
    author: "Lucy",
    authorAvatar: `${TABS}/marius-avatar.png`,
  },
  source2: {
    links: [
      {
        icon: DEMO2_ASSETS.tabSource2a,
        label: "Top 100 AI Companies 2026 | Indexed",
        rounded: true,
      },
      {
        icon: DEMO2_ASSETS.tabSource2b,
        label: "100 Top AI (Artificial Intelligence) Companies · June 2026 F6S",
      },
      {
        icon: DEMO2_ASSETS.tabSource2c,
        label: "100 AI Titans Shaping the Future: The Global AI Power List 2025",
        rounded: true,
      },
    ],
    moreCount: 4,
    model: "Claude Opus 4.8",
    author: "Marius",
    authorAvatar: `${TABS}/marius-avatar.png`,
  },
} as const

export const DEMO2_SOURCE_TAB_POPOVER_ASSETS = {
  eye: `${TABS}/popover-eye.svg`,
  delete: `${TABS}/popover-delete.svg`,
  claude: `${TABS}/claude.svg`,
  actionDivider: `${TABS}/popover-action-divider.svg`,
} as const
