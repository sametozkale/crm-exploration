"use client"

import { useState, type ReactNode } from "react"

import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_SIZES } from "./demo-2-tokens"
import { HomeChevronDownIcon } from "./home-icons"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Onboarding", icon: DEMO2_ASSETS.homeOnboarding },
  { label: "Home", icon: DEMO2_ASSETS.railHome },
  { label: "Messages", icon: DEMO2_ASSETS.railMessages },
  { label: "Tasks", icon: DEMO2_ASSETS.railTasks },
  { label: "Lead Search", icon: DEMO2_ASSETS.railGlobalSearch, active: true },
  { label: "Agents", icon: DEMO2_ASSETS.railFlash },
  { label: "Sequences", icon: DEMO2_ASSETS.railFlow },
  { label: "Reports", icon: DEMO2_ASSETS.railDashboard },
] as const

const RECORD_ITEMS = [
  { label: "Companies", icon: DEMO2_ASSETS.railBuilding },
  { label: "Contacts", icon: DEMO2_ASSETS.railUsers },
  { label: "Deals", icon: DEMO2_ASSETS.railMoney },
] as const

const LIST_ITEMS = ["Sales", "Investors", "Customers"] as const

function SidebarNavButton({
  label,
  icon,
  active,
}: {
  label: string
  icon: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center gap-[6px] rounded-[8px] px-2 py-[7px] text-left transition-colors duration-150 ease-out hover:bg-[#f4f4f4]",
        active && "bg-[#f4f4f4]",
      )}
    >
      <img src={icon} alt="" className="size-4 shrink-0 object-contain" draggable={false} />
      <span
        className={cn(
          "text-[13px] leading-4",
          active ? "text-[#202020]" : "text-[#646464]",
        )}
      >
        {label}
      </span>
    </button>
  )
}

function CollapsibleSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mx-2 mt-5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-[6px] px-2"
      >
        <span className="text-[11px] leading-none tracking-[-0.11px] text-[#bbb]">{title}</span>
        <HomeChevronDownIcon
          className={cn("transition-transform duration-150 ease-out", !open && "-rotate-90")}
        />
      </button>
      {open ? <div className="mt-2 flex flex-col gap-[2px]">{children}</div> : null}
    </div>
  )
}

/** Figma node 48:53 — expanded 200px sidebar */
export function Demo2HomeSidebar() {
  return (
    <aside
      className="flex h-dvh shrink-0 flex-col border-r border-solid border-[#f4f4f4] bg-white"
      style={{ width: DEMO2_SIZES.homeSidebarWidth }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex min-w-0 items-center gap-[6px]">
          <img
            src={DEMO2_ASSETS.logo}
            alt="Zero"
            className="size-4 shrink-0 rounded-[4px] object-cover"
            draggable={false}
          />
          <span className="truncate text-[13px] font-medium leading-4 text-[#202020]">
            Samet&apos;s wo...
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Settings" className="size-4 shrink-0 cursor-pointer">
            <img src={DEMO2_ASSETS.homeSettings} alt="" className="size-full" draggable={false} />
          </button>
          <button type="button" aria-label="Collapse sidebar" className="size-4 shrink-0 cursor-pointer">
            <img src={DEMO2_ASSETS.homeSidebar} alt="" className="size-full" draggable={false} />
          </button>
        </div>
      </div>

      <div className="mx-2 mt-[19px] flex items-center justify-between rounded-[8px] bg-[#f9f9f9] px-2 py-[7px]">
        <div className="flex min-w-0 items-center gap-[6px]">
          <img src={DEMO2_ASSETS.railSearch} alt="" className="size-4 shrink-0" draggable={false} />
          <span className="text-[12px] tracking-[-0.12px] text-[#989898]">Search...</span>
        </div>
        <div className="flex shrink-0 items-center gap-[2px]" aria-hidden>
          <img src={DEMO2_ASSETS.homeCommand} alt="" className="size-[10px] shrink-0" draggable={false} />
          <span className="w-2 text-center text-[11px] leading-none tracking-[0.11px] text-[#dcdcdc]">K</span>
        </div>
      </div>

      <nav className="mx-2 mt-3 flex flex-col gap-[2px]">
        {NAV_ITEMS.map((item) => (
          <SidebarNavButton key={item.label} {...item} />
        ))}
      </nav>

      <CollapsibleSection title="RECORDS">
        {RECORD_ITEMS.map((item) => (
          <SidebarNavButton key={item.label} {...item} />
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="LISTS">
        {LIST_ITEMS.map((label) => (
          <SidebarNavButton key={label} label={label} icon={DEMO2_ASSETS.railFolder} />
        ))}
      </CollapsibleSection>
    </aside>
  )
}
