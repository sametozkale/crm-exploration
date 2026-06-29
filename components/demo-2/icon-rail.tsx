"use client"

import { SidebarFlashIcon, SidebarFolderIcon, SidebarSearchingIcon } from "./home-icons"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_SIZES } from "./demo-2-tokens"
import { cn } from "@/lib/utils"

const RAIL_ICON_PX = DEMO2_SIZES.iconLg

function RailIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={RAIL_ICON_PX}
      height={RAIL_ICON_PX}
      className="size-4 shrink-0 object-contain"
      draggable={false}
    />
  )
}

function railButtonHoverClass(activeBg?: string) {
  switch (activeBg) {
    case "bg-[#f9f9f9]":
      return "hover:bg-[#f2f2f2]"
    case "bg-[#f4f4f4]":
      return "hover:bg-[#ececec]"
    default:
      return "hover:bg-[#f4f4f4]"
  }
}

function RailButton({
  activeBg,
  children,
  className,
  label,
}: {
  activeBg?: string
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors duration-150 ease-out",
        activeBg ?? "bg-transparent",
        railButtonHoverClass(activeBg),
        className,
      )}
    >
      {children}
    </button>
  )
}

function RailDivider() {
  return (
    <div className="h-px w-4">
      <img src={DEMO2_ASSETS.railDivider} alt="" className="block h-px w-4" draggable={false} />
    </div>
  )
}

function RailSection({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("flex w-full flex-col items-center", className)}>{children}</div>
}

/** Figma node 134:72556 — 48px icon rail */
export function Demo2IconRail() {
  return (
    <aside
      className="flex h-dvh shrink-0 flex-col items-center border-r border-solid border-[#f4f4f4] bg-white"
      style={{ width: DEMO2_SIZES.iconRailWidth }}
    >
      <RailSection className="pt-4">
        <img
          src={DEMO2_ASSETS.logo}
          alt="Zero"
          width={RAIL_ICON_PX}
          height={RAIL_ICON_PX}
          className="size-4 rounded-[4px] object-cover"
          draggable={false}
        />
      </RailSection>

      <RailSection className="mt-[19px]">
        <RailButton activeBg="bg-[#f9f9f9]" label="Search">
          <SidebarSearchingIcon />
        </RailButton>
      </RailSection>

      <RailSection className="mt-3 gap-[2px]">
        <RailButton label="Progress">
          <RailIcon src={DEMO2_ASSETS.railProgress} alt="" />
        </RailButton>
        <RailButton label="Home">
          <RailIcon src={DEMO2_ASSETS.railHome} alt="" />
        </RailButton>
        <RailButton label="Messages">
          <RailIcon src={DEMO2_ASSETS.railMessages} alt="" />
        </RailButton>
        <RailButton label="Tasks">
          <RailIcon src={DEMO2_ASSETS.railTasks} alt="" />
        </RailButton>
        <RailButton activeBg="bg-[#f4f4f4]" label="Lead Search">
          <RailIcon src={DEMO2_ASSETS.railGlobalSearch} alt="" />
        </RailButton>
        <RailButton label="Automations">
          <SidebarFlashIcon />
        </RailButton>
        <RailButton label="Flows">
          <RailIcon src={DEMO2_ASSETS.railFlow} alt="" />
        </RailButton>
        <RailButton label="Dashboard">
          <RailIcon src={DEMO2_ASSETS.railDashboard} alt="" />
        </RailButton>
      </RailSection>

      <RailSection className="mt-5">
        <RailDivider />
      </RailSection>

      <RailSection className="mt-5 gap-[2px]">
        <RailButton label="Companies">
          <RailIcon src={DEMO2_ASSETS.railBuilding} alt="" />
        </RailButton>
        <RailButton label="Contacts">
          <RailIcon src={DEMO2_ASSETS.railUsers} alt="" />
        </RailButton>
        <RailButton label="Deals">
          <RailIcon src={DEMO2_ASSETS.railMoney} alt="" />
        </RailButton>
      </RailSection>

      <RailSection className="mt-5">
        <RailDivider />
      </RailSection>

      <RailSection className="mt-5 gap-[2px]">
        {[0, 1, 2].map((i) => (
            <RailButton key={i} label={`List ${i + 1}`}>
              <SidebarFolderIcon />
            </RailButton>
        ))}
      </RailSection>
    </aside>
  )
}
