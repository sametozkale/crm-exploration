"use client"

import { useState } from "react"
import {
  getContactDrawerSimilarProfiles,
  type SimilarProfile,
} from "./contact-drawer-similar-profiles-data"
import { cn } from "@/lib/utils"

const SALT = { fontFeatureSettings: '"salt" 1' } as const
const MATCH_TRACK_WIDTH_PX = 64

function SectionTitle({ children }: { children: string }) {
  return (
    <h3
      className="text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
      style={SALT}
    >
      {children}
    </h3>
  )
}

function CardAddIcon() {
  return (
    <span className="relative size-[12px] shrink-0 overflow-clip" aria-hidden>
      <span className="absolute inset-[16.67%]">
        <svg viewBox="0 0 9 9" fill="none" className="block size-full">
          <path d="M4.5 0.5V8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0.5 4.5H8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  )
}

function MatchScore({ percent }: { percent: number }) {
  const fillWidth = Math.round((MATCH_TRACK_WIDTH_PX * percent) / 100)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-[12px] leading-4 text-[#969696]">Match</span>
        <span className="text-[12px] font-medium leading-4 tracking-[-0.24px] text-[#00cd71]">
          {percent}%
        </span>
      </div>
      <div className="relative h-[5px] w-16 rounded-[9px] bg-[#eee]">
        <div
          className="absolute inset-y-0 left-0 rounded-[9px] bg-[#00cd71]"
          style={{ width: fillWidth }}
        />
      </div>
    </div>
  )
}

function SimilarProfileCard({ profile }: { profile: SimilarProfile }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-[12px] border border-solid px-4 py-3 transition-colors duration-150 ease-out",
        hovered ? "border-[#eee]" : "border-[#f4f4f4]",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex min-w-0 items-start gap-3">
        <img
          src={profile.avatar}
          alt=""
          className="size-6 shrink-0 rounded-full object-cover"
          draggable={false}
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[13px] font-medium leading-normal text-[#323232]">{profile.name}</p>
          <p className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">{profile.subtitle}</p>
        </div>
      </div>

      {hovered ? (
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-[6px] rounded-[8px] border-[0.5px] border-solid border-[#f2f2f2] bg-white px-2 py-[7px] text-[12px] leading-[14px] tracking-[-0.24px] text-[#646464] drop-shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)] transition-[background-color,border-color,color] duration-150 ease-out hover:border-[#ddd] hover:bg-[#fdfdfd] hover:text-[#323232]"
        >
          <CardAddIcon />
          <span className="whitespace-nowrap">Add to list</span>
        </button>
      ) : (
        <MatchScore percent={profile.matchPercent} />
      )}
    </div>
  )
}

export function ContactDrawerSimilarProfilesTab({
  contactKey,
  contactName,
}: {
  contactKey: string
  contactName: string
}) {
  const data = getContactDrawerSimilarProfiles(contactKey, contactName)

  return (
    <div className="flex w-[512px] shrink-0 flex-col gap-3 pb-6">
      <SectionTitle>Similar Profiles</SectionTitle>
      <div className="flex flex-col gap-2">
        {data.profiles.map((profile) => (
          <SimilarProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  )
}
