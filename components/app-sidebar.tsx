"use client"

import { useState, type ComponentType } from "react"
import {
  ChartBar,
  ChevronDown,
  FlowConnection,
  Inbox,
  ScanSearch,
  UserSearch,
  Plus,
  Sent,
} from "@/components/icons"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { ThemeToggle } from "@/components/theme-toggle"
import { ZeroMark } from "@/components/zero-wordmark"
import { cn } from "@/lib/utils"

const SIDEBAR_ICON_STROKE = 1.5

function RecordMark({
  className,
  strokeWidth = SIDEBAR_ICON_STROKE,
}: {
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    </svg>
  )
}

type NavItem = {
  label: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  active?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { label: "Inbox", icon: Inbox },
  { label: "Lead Search", icon: ScanSearch, active: true },
  { label: "Leads", icon: UserSearch },
  { label: "Campaigns", icon: Sent },
  { label: "Automations", icon: FlowConnection },
  { label: "Insights", icon: ChartBar },
]

const RECORDS_NAV: NavItem[] = [
  { label: "Companies", icon: RecordMark },
  { label: "Contacts", icon: RecordMark },
  { label: "Deals", icon: RecordMark },
]

const LISTS_NAV: NavItem[] = [
  { label: "Inbound Leads", icon: RecordMark },
  { label: "Prospects", icon: RecordMark },
  { label: "Investors", icon: RecordMark },
]

function navItemClass(active?: boolean) {
  return cn(
    "group flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-[7px] font-inter text-[13px] tracking-[-0.01em] transition-colors",
    active
      ? "bg-muted font-medium text-foreground"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
  )
}

function navIconClass(active?: boolean, recordMark?: boolean) {
  return cn(
    "shrink-0 transition-colors",
    "size-4",
    active
      ? recordMark
        ? "text-[#e8873a]"
        : "text-foreground"
      : "text-muted-foreground/75 group-hover:text-foreground",
  )
}

function NavLink({
  item,
  recordMark = false,
}: {
  item: NavItem
  recordMark?: boolean
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      aria-current={item.active ? "page" : undefined}
      className={navItemClass(item.active)}
    >
      <Icon
        className={navIconClass(item.active, recordMark)}
        strokeWidth={SIDEBAR_ICON_STROKE}
      />
      <span className="truncate">{item.label}</span>
    </button>
  )
}

function SectionLabel({
  label,
  collapsed,
  onToggle,
  action,
}: {
  label: string
  collapsed: boolean
  onToggle: () => void
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-1 px-2.5 pb-1 pt-1">
      <button
        type="button"
        onClick={onToggle}
        className="group flex cursor-pointer items-center gap-1 font-inter text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground/55 transition-colors hover:text-muted-foreground"
      >
        {label}
        <ChevronDown
          className={cn(
            "size-3 shrink-0 text-muted-foreground/45 transition-transform group-hover:text-muted-foreground",
            collapsed ? "-rotate-90" : "rotate-0",
          )}
          strokeWidth={SIDEBAR_ICON_STROKE}
        />
      </button>
      {action}
    </div>
  )
}

export function AppSidebar() {
  const [recordsOpen, setRecordsOpen] = useState(true)
  const [listsOpen, setListsOpen] = useState(true)

  return (
    <aside className="flex h-dvh w-[248px] shrink-0 flex-col border-r border-border bg-card">
      {/* Workspace */}
      <div className="flex items-center gap-2.5 py-3.5 pl-[18px] pr-3.5">
        <ZeroMark className="size-[22px] text-foreground" />
        <span className="truncate font-sans text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          Zero
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pt-2.5 pb-4">
        {/* Primary */}
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <li key={item.label}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>

        {/* Records */}
        <div className="mt-5">
          <SectionLabel
            label="Records"
            collapsed={!recordsOpen}
            onToggle={() => setRecordsOpen((o) => !o)}
          />
          {recordsOpen && (
            <ul className="space-y-0.5">
              {RECORDS_NAV.map((item) => (
                <li key={item.label}>
                  <NavLink item={item} recordMark />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Lists */}
        <div className="mt-5">
          <SectionLabel
            label="Lists"
            collapsed={!listsOpen}
            onToggle={() => setListsOpen((o) => !o)}
            action={
              <button
                type="button"
                aria-label="New list"
                className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground/55 transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <Plus className="size-3.5" strokeWidth={SIDEBAR_ICON_STROKE} />
              </button>
            }
          />
          {listsOpen && (
            <ul className="space-y-0.5">
              {LISTS_NAV.map((item) => (
                <li key={item.label}>
                  <NavLink item={item} recordMark />
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      <div className="border-t border-border px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <KeyboardShortcutsHelp side="top" />
          <ThemeToggle tooltipSide="top" />
        </div>
      </div>
    </aside>
  )
}
