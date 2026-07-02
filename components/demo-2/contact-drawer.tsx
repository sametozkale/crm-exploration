"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  getContactDrawerProfile,
  type ContactDrawerTab,
} from "./contact-drawer-data"
import { ContactDrawerBuildingIcon } from "./contact-drawer-building-icon"
import { ContactDrawerExperienceTab } from "./contact-drawer-experience-tab"
import { ContactDrawerSimilarProfilesTab } from "./contact-drawer-similar-profiles-tab"
import {
  DRAWER_FOOTER_ADD_DARK_BUTTON_CLASS,
  DRAWER_FOOTER_ADD_LIGHT_BUTTON_CLASS,
  DrawerFooterAddIcon,
} from "./drawer-footer-add-button"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"
import { useDrawerKeyboard } from "./use-drawer-keyboard"
import { cn } from "@/lib/utils"

const DRAWER_WIDTH = 560
const DRAWER_ENTRANCE = { duration: 0.38, ease: DEMO2_SHELL_EASE }
const SALT = { fontFeatureSettings: '"salt" 1' } as const

/** Figma arrow-up-01-round / arrow-down-01-round — 14px nav chevrons in 29px buttons. */
function FooterNavChevron({ direction }: { direction: "up" | "down" }) {
  return (
    <span
      className="relative size-[14px] shrink-0 overflow-hidden text-[#646464] transition-colors duration-150 ease-out group-hover/footer-nav-btn:text-[#323232]"
      aria-hidden
    >
      <svg viewBox="0 0 16 16" fill="none" className="block size-full">
        <path
          d={
            direction === "up"
              ? "M11.47 9.73C11.47 9.73 8.91 6.27 8 6.27C7.08 6.27 4.53 9.73 4.53 9.73"
              : "M11.47 6.27C11.47 6.27 8.91 9.73 8 9.73C7.08 9.73 4.53 6.27 4.53 6.27"
          }
          stroke="currentColor"
          strokeWidth="1.33"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

const FOOTER_NAV_BUTTON_CLASS =
  "group/footer-nav-btn flex size-[29px] shrink-0 items-center justify-center rounded-[8px] border-[0.5px] border-solid border-[#f2f2f2] bg-white drop-shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)] transition-colors duration-150 ease-out hover:border-[#eee]"

function ContactDrawerFooter({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: {
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="flex shrink-0 items-start justify-between rounded-bl-[12px] rounded-br-[12px] border-t border-solid border-[#f4f4f4] bg-[#fafafa] px-6 py-4">
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Previous contact"
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className={cn(
            FOOTER_NAV_BUTTON_CLASS,
            !canGoPrevious && "cursor-not-allowed opacity-40",
          )}
        >
          <FooterNavChevron direction="up" />
        </button>
        <button
          type="button"
          aria-label="Next contact"
          disabled={!canGoNext}
          onClick={onNext}
          className={cn(
            FOOTER_NAV_BUTTON_CLASS,
            !canGoNext && "cursor-not-allowed opacity-40",
          )}
        >
          <FooterNavChevron direction="down" />
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" className={DRAWER_FOOTER_ADD_DARK_BUTTON_CLASS}>
          <DrawerFooterAddIcon />
          <span className="whitespace-nowrap">Add to list</span>
        </button>
        <button type="button" className={DRAWER_FOOTER_ADD_LIGHT_BUTTON_CLASS}>
          <DrawerFooterAddIcon />
          <span className="whitespace-nowrap">Add to sequence</span>
        </button>
      </div>
    </div>
  )
}

function ContactDrawerSocialLinks({
  items,
}: {
  items: readonly {
    src: string
    variant: "framed" | "boxed"
    label: string
  }[]
}) {
  return (
    <div className="flex items-center gap-1">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          className={cn(
            "group/social shrink-0 cursor-pointer transition-[opacity,border-color,background-color] duration-150 ease-out",
            item.variant === "boxed"
              ? "flex size-5 items-center justify-center rounded-[4px] border-[0.5px] border-solid border-[#f4f4f4] bg-white p-1 hover:border-[#eee] hover:bg-[#fafafa]"
              : "relative size-5 hover:opacity-80",
          )}
        >
          <img
            src={item.src}
            alt=""
            draggable={false}
            className={cn(
              "pointer-events-none max-w-none object-contain",
              item.variant === "boxed"
                ? "size-3 transition-opacity duration-150 ease-out group-hover/social:opacity-70"
                : "absolute inset-0 size-full",
            )}
          />
        </button>
      ))}
    </div>
  )
}

function ProfileDetailCard({
  icon,
  label,
  labelColor,
  value,
  subtitle,
  gradient,
  borderColor,
}: {
  icon: string
  label: string
  labelColor: string
  value: string
  subtitle: string
  gradient: string
  borderColor: string
}) {
  return (
    <div
      className="flex w-[249.5px] shrink-0 flex-col rounded-[12px] border border-solid p-[17px]"
      style={{ backgroundImage: gradient, borderColor }}
    >
      <div className="flex items-center gap-1.5">
        <img src={icon} alt="" className="size-3.5 shrink-0 object-contain" draggable={false} />
        <span
          className="text-[10px] font-medium uppercase leading-[15px] tracking-[0.62px]"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      </div>
      <p className="pt-1.5 text-[20px] font-semibold leading-7 tracking-[-0.2px] text-[#323232]">
        {value}
      </p>
      <p className="pt-1.5 text-[11px] leading-[16.5px] tracking-[-0.11px] text-[#9ca3af]">
        {subtitle}
      </p>
    </div>
  )
}

function EnrichRow({
  icon,
  title,
  credits,
  hint,
  value,
  enrichIcon,
  resetKey,
}: {
  icon: string
  title: string
  credits: string
  hint: string
  value: string
  enrichIcon: string
  resetKey: string
}) {
  const [enriched, setEnriched] = useState(false)

  useEffect(() => {
    setEnriched(false)
  }, [resetKey])

  return (
    <div className="flex w-full items-center justify-between rounded-[12px] border border-solid border-[#f4f4f4] px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 rounded-[8px] bg-[rgba(119,119,119,0.07)] p-1.5">
          <img src={icon} alt="" className="size-3 object-contain" draggable={false} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-1">
            <p className="text-[13px] font-medium leading-normal text-[#323232]">
              {enriched ? value : title}
            </p>
            {!enriched ? (
              <span
                className="rounded-[6px] bg-[rgba(0,205,113,0.07)] px-1 py-0.5 text-[10px] font-medium tracking-[-0.2px] text-[#00cd71]"
                style={SALT}
              >
                {credits}
              </span>
            ) : null}
          </div>
          {!enriched ? (
            <p className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">{hint}</p>
          ) : null}
        </div>
      </div>
      {!enriched ? (
        <button
          type="button"
          onClick={() => setEnriched(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] bg-[rgba(0,144,255,0.07)] px-2 py-[7px] text-[12px] leading-[14px] tracking-[-0.12px] text-[#0090ff] transition-colors duration-150 ease-out hover:bg-[rgba(0,144,255,0.12)]"
        >
          <img src={enrichIcon} alt="" className="size-3 object-contain" draggable={false} />
          Enrich
        </button>
      ) : null}
    </div>
  )
}

function ContactDrawerPanel({ contactKey }: { contactKey: string }) {
  const data = getContactDrawerProfile(contactKey)
  const [activeTab, setActiveTab] = useState<ContactDrawerTab>("Overview")
  const tabBarRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<ContactDrawerTab, HTMLButtonElement>>>({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    setActiveTab("Overview")
  }, [contactKey])

  useLayoutEffect(() => {
    const tabBar = tabBarRef.current
    const activeButton = tabRefs.current[activeTab]
    if (!tabBar || !activeButton) return

    const tabBarRect = tabBar.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    setIndicator({
      left: buttonRect.left - tabBarRect.left,
      width: buttonRect.width,
    })
  }, [activeTab])

  return (
    <div className="flex flex-col items-center gap-6 pt-6">
      <div className="flex w-[512px] shrink-0 flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className="size-12 shrink-0 rounded-[12px] border border-solid border-[#f4f4f4] bg-cover bg-top"
            style={{ backgroundImage: `url("${data.avatar}")` }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-[14px] font-medium leading-[18px] text-[#202020]">{data.name}</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1">
                  <div className="relative size-4 shrink-0 overflow-clip">
                    <div className="absolute inset-[12.5%_8.33%]">
                      <img
                        src={data.icons.role}
                        alt=""
                        className="block size-full max-w-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#777]">
                    {data.role}
                  </span>
                </span>
                <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#aaa]">at</span>
                <span className="inline-flex items-center gap-1">
                  <ContactDrawerBuildingIcon />
                  <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#777]">
                    {data.companyName}
                  </span>
                </span>
              </div>
              <ContactDrawerSocialLinks items={data.social} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-10 w-full shrink-0">
        <div className="absolute inset-x-0 top-0 border-t border-solid border-[#f9f9f9]" />
        <div
          ref={tabBarRef}
          className="absolute left-6 right-6 top-3 flex items-center justify-between text-[13px]"
        >
          <div className="flex gap-6">
            {(["Overview", "Experience"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                ref={(element) => {
                  tabRefs.current[tab] = element ?? undefined
                }}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "cursor-pointer bg-transparent p-0 transition-colors duration-150 ease-out",
                  activeTab === tab
                    ? "font-medium text-[#0090ff]"
                    : "text-[#838383] hover:text-[#646464]",
                )}
                style={SALT}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            ref={(element) => {
              tabRefs.current["Similar profiles"] = element ?? undefined
            }}
            onClick={() => setActiveTab("Similar profiles")}
            className={cn(
              "cursor-pointer bg-transparent p-0 transition-colors duration-150 ease-out",
              activeTab === "Similar profiles"
                ? "font-medium text-[#0090ff]"
                : "text-[#aaa] hover:text-[#838383]",
            )}
            style={SALT}
          >
            Similar profiles
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 border-b border-solid border-[#f9f9f9]" />
        {indicator.width > 0 ? (
          <div
            className="absolute bottom-0 z-10 h-0.5 rounded-t-[2px] bg-[#0090ff] transition-[left,width] duration-200 ease-out"
            style={{ left: 24 + indicator.left, width: indicator.width }}
          />
        ) : null}
      </div>

      {activeTab === "Overview" ? (
        <div className="flex w-[512px] shrink-0 flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h3
              className="text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
              style={SALT}
            >
              About
            </h3>
            <p className="text-[13px] leading-[22px] tracking-[-0.13px] text-[#646464]">
              {data.about}
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h3
              className="text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
              style={SALT}
            >
              Profile Details
            </h3>
            <div className="flex gap-3">
              <ProfileDetailCard
                icon={data.icons.seniority}
                label={data.seniority.label}
                labelColor="#0090ff"
                value={data.seniority.value}
                subtitle={data.seniority.subtitle}
                gradient="linear-gradient(157.76deg, rgb(236, 247, 255) 0%, rgb(255, 255, 255) 100%)"
                borderColor="rgba(214, 237, 255, 0.5)"
              />
              <ProfileDetailCard
                icon={data.icons.tenure}
                label={data.tenure.label}
                labelColor="#00cd71"
                value={data.tenure.value}
                subtitle={data.tenure.subtitle}
                gradient="linear-gradient(158.16deg, rgb(236, 253, 245) 0%, rgb(255, 255, 255) 100%)"
                borderColor="rgba(209, 250, 229, 0.5)"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3
              className="text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
              style={SALT}
            >
              Contact Info
            </h3>
            <div className="flex flex-col gap-2">
              {data.contactInfo.map((row) => (
                <EnrichRow
                  key={row.kind}
                  resetKey={`${contactKey}:${row.kind}`}
                  icon={row.kind === "email" ? data.icons.mail : data.icons.call}
                  title={row.title}
                  credits={row.credits}
                  hint={row.hint}
                  value={row.value}
                  enrichIcon={data.icons.enrich}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3
              className="text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
              style={SALT}
            >
              Location
            </h3>
            <div className="flex flex-col gap-3 rounded-[12px] border border-solid border-[#f4f4f4] px-1 pb-3 pt-1">
              <div className="h-[164px] w-full overflow-hidden rounded-[8px]">
                <img
                  src={data.mapImage}
                  alt=""
                  className="size-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="flex items-center gap-1 pl-3">
                <img
                  src={data.icons.location}
                  alt=""
                  className="size-3 shrink-0"
                  draggable={false}
                />
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
                  {data.location}
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "Experience" ? (
        <ContactDrawerExperienceTab contactKey={contactKey} companyName={data.companyName} />
      ) : null}
      {activeTab === "Similar profiles" ? (
        <ContactDrawerSimilarProfilesTab contactKey={contactKey} contactName={data.name} />
      ) : null}
    </div>
  )
}

/** Figma 300:26016 — contact profile drawer on the right of the results surface. */
export function ContactDrawer({
  open,
  contactKey,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onClose,
}: {
  open: boolean
  contactKey: string
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()

  useDrawerKeyboard({
    open,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
    onClose,
  })

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={DRAWER_ENTRANCE}
          className="group/drawer absolute bottom-1 right-1 top-1 z-40 flex min-h-0 flex-col overflow-hidden rounded-[12px] bg-white shadow-[0px_2px_4px_0px_rgba(34,34,34,0.1)]"
          style={{ width: DRAWER_WIDTH }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close contact profile"
            onClick={onClose}
            className="pointer-events-none absolute top-1 right-1 z-50 flex size-6 cursor-pointer items-center justify-center text-[#aaa] opacity-0 transition-[opacity,color] duration-150 ease-out group-hover/drawer:pointer-events-auto group-hover/drawer:opacity-100 hover:text-[#777] focus-visible:pointer-events-auto focus-visible:opacity-100"
          >
            <svg viewBox="0 0 8 8" fill="none" className="size-2" aria-hidden>
              <path
                d="M7.5 0.5L0.5 7.5M0.5 0.5L7.5 7.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ContactDrawerPanel contactKey={contactKey} />
          </div>
          <ContactDrawerFooter
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
