"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useState } from "react"
import { ContactDrawerBuildingIcon } from "./contact-drawer-building-icon"
import {
  getContactDrawerExperience,
  type ContactEducation,
  type ContactWorkExperience,
} from "./contact-drawer-experience-data"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"
import { cn } from "@/lib/utils"

const SALT = { fontFeatureSettings: '"salt" 1' } as const

const EXPERIENCE_CARD_LAYOUT = {
  layout: { duration: 0.32, ease: DEMO2_SHELL_EASE },
} as const

const EXPERIENCE_EXPAND = {
  duration: 0.28,
  ease: DEMO2_SHELL_EASE,
} as const

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

function ExperienceBuildingIcon() {
  return <ContactDrawerBuildingIcon />
}

function ExperienceCalendarIcon({ src }: { src: string }) {
  return (
    <div className="relative size-4 shrink-0 overflow-clip">
      <div className="absolute inset-[8.33%_10.42%]">
        <img src={src} alt="" className="block size-full max-w-none" draggable={false} />
      </div>
    </div>
  )
}

function BriefcaseIcon({ src }: { src: string }) {
  return (
    <div className="relative size-3 shrink-0 overflow-clip">
      <div className="absolute inset-[10.42%]">
        <img src={src} alt="" className="block size-full max-w-none" draggable={false} />
      </div>
    </div>
  )
}

function MortarboardIcon({ src }: { src: string }) {
  return (
    <div className="relative size-3 shrink-0 overflow-clip">
      <div className="absolute inset-[12.5%_8.33%]">
        <img src={src} alt="" className="block size-full max-w-none" draggable={false} />
      </div>
    </div>
  )
}

function WorkExperienceCard({
  item,
  icons,
}: {
  item: ContactWorkExperience
  icons: ReturnType<typeof getContactDrawerExperience>["icons"]
}) {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const expandable = Boolean(item.description || item.dateRange)
  const expanded = hovered && expandable
  const layoutTransition = reduceMotion ? { duration: 0 } : EXPERIENCE_CARD_LAYOUT
  const expandTransition = reduceMotion ? { duration: 0 } : EXPERIENCE_EXPAND

  return (
    <motion.div
      layout
      className={cn(
        "flex w-full flex-col rounded-[12px] border border-solid bg-white p-4 transition-colors duration-150 ease-out",
        hovered ? "border-[#eee]" : "border-[#f4f4f4]",
      )}
      transition={layoutTransition}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex w-full items-start gap-3">
        <motion.div
          className="shrink-0 rounded-[8px] bg-[rgba(0,144,255,0.07)] p-1.5"
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.22, ease: DEMO2_SHELL_EASE }}
        >
          <BriefcaseIcon src={icons.briefcase} />
        </motion.div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-medium leading-normal text-[#323232]">{item.title}</p>
            {item.current ? (
              <span
                className="shrink-0 rounded-[6px] bg-[rgba(0,205,113,0.07)] px-1 py-0.5 text-[10px] font-medium tracking-[-0.2px] text-[#00cd71]"
                style={SALT}
              >
                Current
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <ExperienceBuildingIcon />
            <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#777]">
              {item.company}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="details"
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={expandTransition}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: reduceMotion ? 0 : -6 }}
              animate={{ y: 0 }}
              exit={{ y: reduceMotion ? 0 : -4 }}
              transition={expandTransition}
              className="mt-4 flex w-full flex-col gap-3 pl-9"
            >
              {item.description ? (
                <p className="text-[13px] leading-[22px] tracking-[-0.13px] text-[#646464]">
                  {item.description}
                </p>
              ) : null}
              {item.description && item.dateRange ? (
                <div className="border-t border-solid border-[#f4f4f4]" />
              ) : null}
              {item.dateRange ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-1">
                    <ExperienceCalendarIcon src={icons.calendar} />
                    <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#777]">
                      {item.dateRange}
                    </span>
                  </div>
                  {item.duration ? (
                    <span
                      className="shrink-0 rounded-[6px] bg-[rgba(150,150,150,0.07)] px-1 py-0.5 text-[10px] font-medium tracking-[-0.2px] text-[#969696]"
                      style={SALT}
                    >
                      {item.duration}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function EducationCard({
  item,
  icons,
}: {
  item: ContactEducation
  icons: ReturnType<typeof getContactDrawerExperience>["icons"]
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-[12px] border border-solid border-[#f4f4f4] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="shrink-0 rounded-[8px] bg-[rgba(255,176,58,0.07)] p-1.5">
          <MortarboardIcon src={icons.mortarboard} />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[13px] font-medium leading-normal text-[#323232]">{item.school}</p>
          <p className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">{item.degree}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ExperienceCalendarIcon src={icons.calendar} />
        <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#777]">
          {item.dateRange}
        </span>
      </div>
    </div>
  )
}

export function ContactDrawerExperienceTab({
  contactKey,
  companyName,
}: {
  contactKey: string
  companyName: string
}) {
  const data = getContactDrawerExperience(contactKey, companyName)

  return (
    <div className="flex w-[512px] shrink-0 flex-col gap-6 pb-6">
      <section className="flex flex-col gap-3">
        <SectionTitle>Work Experience</SectionTitle>
        <motion.div layout transition={EXPERIENCE_CARD_LAYOUT} className="flex flex-col gap-2">
          {data.work.map((item) => (
            <WorkExperienceCard key={item.id} item={item} icons={data.icons} />
          ))}
        </motion.div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Education</SectionTitle>
        <div className="flex flex-col gap-2">
          {data.education.map((item) => (
            <EducationCard key={item.id} item={item} icons={data.icons} />
          ))}
        </div>
      </section>
    </div>
  )
}
