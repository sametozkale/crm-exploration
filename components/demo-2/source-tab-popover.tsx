"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  DEMO2_SOURCE_TAB_POPOVER_ASSETS,
  type SourceTabPopoverData,
} from "./demo-2-source-tab-data"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"
import { cn } from "@/lib/utils"

function PopoverDivider() {
  return <div className="h-px w-full shrink-0 bg-[#f4f4f4]" aria-hidden />
}

/** Figma 128:72313 — appears 3px below a source tab on hover. */
export function SourceTabPopover({
  title,
  data,
  className,
}: {
  title: string
  data: SourceTabPopoverData
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: DEMO2_SHELL_EASE }}
      className={cn(
        "flex w-[429px] flex-col gap-3 overflow-hidden rounded-[12px] border border-solid border-[#f4f4f4] bg-white px-[25px] py-[17px] shadow-[0px_2px_8px_0px_rgba(34,34,34,0.05)]",
        className,
      )}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex w-full items-center justify-between">
        <p
          className="shrink-0 text-[14px] font-medium leading-[18px] text-[#202020]"
          style={{ fontFeatureSettings: '"salt" 1' }}
        >
          {title}
        </p>

        <div className="flex h-4 shrink-0 items-center gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-80"
          >
            <img
              src={DEMO2_SOURCE_TAB_POPOVER_ASSETS.eye}
              alt=""
              className="size-[14px] shrink-0"
              draggable={false}
            />
            <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#969696]">
              Hide
            </span>
          </button>

          <img
            src={DEMO2_SOURCE_TAB_POPOVER_ASSETS.actionDivider}
            alt=""
            className="h-2 w-px shrink-0"
            aria-hidden
            draggable={false}
          />

          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-80"
          >
            <img
              src={DEMO2_SOURCE_TAB_POPOVER_ASSETS.delete}
              alt=""
              className="size-[14px] shrink-0"
              draggable={false}
            />
            <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#ff6f6f]">
              Remove
            </span>
          </button>
        </div>
      </div>

      <PopoverDivider />

      <div className="flex w-full max-w-[379px] flex-col gap-3 pt-1">
        {data.links.map((link) => (
          <div key={link.label} className="flex items-center gap-2">
            <img
              src={link.icon}
              alt=""
              className={cn(
                "size-4 shrink-0 object-cover",
                link.rounded ? "rounded-[2px]" : "rounded-none",
              )}
              draggable={false}
            />
            <p className="min-w-0 whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#323232]">
              {link.label}
            </p>
          </div>
        ))}
        <p className="shrink-0 text-[11px] leading-4 tracking-[-0.11px] text-[#aaa]">
          +{data.moreCount} more
        </p>
      </div>

      <PopoverDivider />

      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#838383]">with</span>
          <img
            src={DEMO2_SOURCE_TAB_POPOVER_ASSETS.claude}
            alt=""
            className="size-4 shrink-0"
            draggable={false}
          />
          <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#838383]">
            {data.model}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#ccc]">by</span>
          <img
            src={data.authorAvatar}
            alt=""
            className="size-4 shrink-0 rounded-[4px] object-cover"
            draggable={false}
          />
          <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#202020]">
            {data.author}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
