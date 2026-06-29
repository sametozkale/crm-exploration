"use client"

import { useState, type ReactNode } from "react"

import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_SIZES } from "./demo-2-tokens"
import {
  HomeChevronDownIcon,
  SidebarFlashIcon,
  SidebarFolderIcon,
  SidebarListMailIcon,
  SidebarSearchingIcon,
} from "./home-icons"
import { cn } from "@/lib/utils"

const SIDEBAR_ITEM_HOVER = "hover:bg-[#f7f7f7]"

const NAV_ITEMS = [
  { label: "Onboarding", icon: DEMO2_ASSETS.homeOnboarding },
  { label: "Home", icon: DEMO2_ASSETS.railHome },
  { label: "Messages", icon: DEMO2_ASSETS.railMessages },
  { label: "Tasks", icon: DEMO2_ASSETS.railTasks },
  { label: "Lead Search", icon: DEMO2_ASSETS.railGlobalSearch, active: true },
  { label: "Agents", icon: "flash" as const },
  { label: "Sequences", icon: DEMO2_ASSETS.railFlow },
  { label: "Reports", icon: DEMO2_ASSETS.railDashboard },
] as const

const RECORD_ITEMS = [
  { label: "Companies", icon: DEMO2_ASSETS.railBuilding },
  { label: "Contacts", icon: DEMO2_ASSETS.railUsers },
  { label: "Deals", icon: DEMO2_ASSETS.railMoney },
] as const

const LIST_ITEMS = [
  {
    label: "Sales",
    children: [
      { label: "Outreach list", icon: "mail" as const },
      { label: "Target accounts", icon: DEMO2_ASSETS.railListSpirals },
    ],
  },
  { label: "Investors" },
  { label: "Customers" },
] as const

type ListChildIcon = (typeof LIST_ITEMS)[number] extends { children: infer C }
  ? C extends readonly (infer I)[]
    ? I extends { icon: infer Icon }
      ? Icon
      : never
    : never
  : never

function SidebarListChildIcon({ icon }: { icon: ListChildIcon | string }) {
  if (icon === "mail") return <SidebarListMailIcon />
  return (
    <img src={icon} alt="" className="size-4 shrink-0 object-contain" draggable={false} />
  )
}

function SidebarNavIcon({ icon }: { icon: NavIcon }) {
  if (icon === "flash") return <SidebarFlashIcon />
  return (
    <img src={icon} alt="" className="size-4 shrink-0 object-contain" draggable={false} />
  )
}

type NavIcon = (typeof NAV_ITEMS)[number]["icon"]

function SidebarNavButton({
  label,
  icon,
  active,
}: {
  label: string
  icon: NavIcon
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        `flex w-full cursor-pointer items-center gap-[6px] rounded-[8px] px-2 py-[7px] text-left transition-colors duration-150 ease-out ${SIDEBAR_ITEM_HOVER}`,
        active && "bg-[#f4f4f4]",
      )}
    >
      <SidebarNavIcon icon={icon} />
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

function SidebarFolderButton({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children?: readonly { label: string; icon: ListChildIcon | string }[]
}) {
  return (
    <div className="flex flex-col gap-[2px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          `flex w-full cursor-pointer items-center gap-[6px] rounded-[8px] px-2 py-[7px] text-left transition-colors duration-150 ease-out ${SIDEBAR_ITEM_HOVER}`,
          open && "bg-[rgba(0,144,255,0.07)]",
        )}
      >
        <SidebarFolderIcon open={open} />
        <span className="text-[13px] leading-4 text-[#646464]">{label}</span>
      </button>

      {open && children?.length ? (
        children.map((child) => (
          <button
            key={child.label}
            type="button"
            className={`flex w-full cursor-pointer items-center gap-[6px] rounded-[8px] py-[7px] pl-[30px] pr-2 text-left transition-colors duration-150 ease-out ${SIDEBAR_ITEM_HOVER}`}
          >
            <SidebarListChildIcon icon={child.icon} />
            <span className="text-[13px] leading-4 text-[#646464]">{child.label}</span>
          </button>
        ))
      ) : null}
    </div>
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
  const [openListFolder, setOpenListFolder] = useState<string | null>(null)

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
          <SidebarSearchingIcon />
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
        {LIST_ITEMS.map((item) => (
          <SidebarFolderButton
            key={item.label}
            label={item.label}
            open={openListFolder === item.label}
            onToggle={() =>
              setOpenListFolder((prev) => (prev === item.label ? null : item.label))
            }
            children={"children" in item ? item.children : undefined}
          />
        ))}
      </CollapsibleSection>
    </aside>
  )
}
