"use client"

import { forwardRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  AiEditingIcon,
  AiSearchIcon,
  ArrowDownWideNarrowIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  ArrowUpWideNarrowIcon,
  Cancel01Icon,
  CheckIcon as CheckIconSvg,
  ChevronDownIcon as ChevronDownIconSvg,
  ChevronLeftIcon as ChevronLeftIconSvg,
  ChevronRightIcon as ChevronRightIconSvg,
  ChevronUpIcon as ChevronUpIconSvg,
  CircleIcon as CircleIconSvg,
  CornerDownLeftIcon,
  FilterIcon as FilterIconSvg,
  GripVerticalIcon as GripVerticalIconSvg,
  InformationCircleIcon,
  Loading03Icon,
  MagicWand02Icon,
  MinusSignIcon,
  Moon02Icon,
  MoreHorizontalIcon as MoreHorizontalIconSvg,
  PanelLeftIcon as PanelLeftIconSvg,
  Search01Icon,
  SearchRemoveIcon,
  SparklesIcon,
  Sun01Icon,
  Undo02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type IconComponentProps = React.ComponentProps<typeof HugeiconsIcon> & {
  className?: string
  size?: number | string
}

const SIZE_FROM_CLASS: Record<string, number> = {
  "size-2": 8,
  "size-2.5": 10,
  "size-3": 12,
  "size-3.5": 14,
  "size-4": 16,
  "size-5": 20,
  "size-6": 24,
  "size-9": 36,
}

function resolveIconSize(className?: string, size?: number | string) {
  if (size != null) return Number(size)
  if (!className) return 24
  for (const [token, px] of Object.entries(SIZE_FROM_CLASS)) {
    if (className.includes(token)) return px
  }
  return 24
}

function createIcon(icon: IconSvgElement, displayName: string) {
  const Component = forwardRef<SVGSVGElement, IconComponentProps>(
    ({ className, size, strokeWidth = 2, ...props }, ref) => (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        size={resolveIconSize(className, size)}
        strokeWidth={strokeWidth}
        className={cn("shrink-0", className)}
        {...props}
      />
    ),
  )
  Component.displayName = displayName
  return Component
}

export { HugeiconsIcon }

export const ArrowDownWideNarrow = createIcon(
  ArrowDownWideNarrowIcon,
  "ArrowDownWideNarrow",
)
export const ArrowUpWideNarrow = createIcon(
  ArrowUpWideNarrowIcon,
  "ArrowUpWideNarrow",
)
export const ArrowLeft = createIcon(ArrowLeft01Icon, "ArrowLeft")
export const ArrowRight = createIcon(ArrowRight01Icon, "ArrowRight")
export const ArrowUpRight = createIcon(ArrowUpRight01Icon, "ArrowUpRight")
export const ChevronDown = createIcon(ChevronDownIconSvg, "ChevronDown")
export const ChevronRight = createIcon(ChevronRightIconSvg, "ChevronRight")
export const CornerDownLeft = createIcon(CornerDownLeftIcon, "CornerDownLeft")
export const Filter = createIcon(FilterIconSvg, "Filter")
export const Info = createIcon(InformationCircleIcon, "Info")
export const EditPrompt = createIcon(AiEditingIcon, "EditPrompt")
export const ScanSearch = createIcon(AiSearchIcon, "ScanSearch")
export const Search = createIcon(Search01Icon, "Search")
export const SearchX = createIcon(SearchRemoveIcon, "SearchX")
export const Sparkles = createIcon(SparklesIcon, "Sparkles")
export const MagicWand = createIcon(MagicWand02Icon, "MagicWand")
export const Undo2 = createIcon(Undo02Icon, "Undo2")
export const Users = createIcon(UserGroupIcon, "Users")
export const X = createIcon(Cancel01Icon, "X")
export const Moon = createIcon(Moon02Icon, "Moon")
export const Sun = createIcon(Sun01Icon, "Sun")

export const XIcon = X
export const CheckIcon = createIcon(CheckIconSvg, "CheckIcon")
export const ChevronDownIcon = createIcon(ChevronDownIconSvg, "ChevronDownIcon")
export const ChevronUpIcon = createIcon(ChevronUpIconSvg, "ChevronUpIcon")
export const ChevronLeftIcon = createIcon(ChevronLeftIconSvg, "ChevronLeftIcon")
export const ChevronRightIcon = createIcon(
  ChevronRightIconSvg,
  "ChevronRightIcon",
)
export const CircleIcon = createIcon(CircleIconSvg, "CircleIcon")
export const SearchIcon = createIcon(Search01Icon, "SearchIcon")
export const Loader2Icon = createIcon(Loading03Icon, "Loader2Icon")
export const MinusIcon = createIcon(MinusSignIcon, "MinusIcon")
export const GripVerticalIcon = createIcon(
  GripVerticalIconSvg,
  "GripVerticalIcon",
)
export const PanelLeftIcon = createIcon(PanelLeftIconSvg, "PanelLeftIcon")
export const MoreHorizontalIcon = createIcon(
  MoreHorizontalIconSvg,
  "MoreHorizontalIcon",
)
