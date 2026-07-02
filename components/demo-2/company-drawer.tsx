"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { CompanyDrawerActivityTab } from "./company-drawer-activity-tab"
import { CompanyDrawerFinancialsTab } from "./company-drawer-financials-tab"
import { CompanyDrawerPeopleTab } from "./company-drawer-people-tab"
import { CompanyDrawerSignalsTab } from "./company-drawer-signals-tab"
import { getCompanyDrawerProfile, type CompanyDrawerTab } from "./company-drawer-data"
import {
  DRAWER_FOOTER_ADD_DARK_BUTTON_CLASS,
  DrawerFooterAddIcon,
} from "./drawer-footer-add-button"
import { DEMO2_SHELL_EASE } from "./demo-2-motion"
import { useDrawerKeyboard } from "./use-drawer-keyboard"
import { cn } from "@/lib/utils"

const DRAWER_WIDTH = 560
const DRAWER_ENTRANCE = { duration: 0.38, ease: DEMO2_SHELL_EASE }
const OVERLAY_ENTRANCE = { duration: 0.28, ease: DEMO2_SHELL_EASE }
const SALT = { fontFeatureSettings: '"salt" 1' } as const

/** px-5 table padding + select (40) + company (200) — interactive strip while drawer is open. */
const COMPANY_COLUMN_INTERACTIVE_WIDTH_PX = 20 + 40 + 200

const OVERLAY_SCRIM_GRADIENT =
  "linear-gradient(to right, rgba(255, 255, 255, 0.15) 0%, rgba(150, 150, 150, 0.15) 100%)"


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

/** Figma 168:42299 — sticky drawer footer on all tabs. */
function CompanyDrawerFooter({
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
          aria-label="Previous company"
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
          aria-label="Next company"
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
      <button type="button" className={DRAWER_FOOTER_ADD_DARK_BUTTON_CLASS}>
        <DrawerFooterAddIcon />
        <span className="whitespace-nowrap">Add to list</span>
      </button>
    </div>
  )
}


/** Figma 278:27271 — social links; framed assets include their own 20px tile. */
function CompanyDrawerSocialLinks({
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

/** Figma 146:4412 — location-01 pin for locations list. */
function LocationListIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M6.80887 10.6835C6.59203 10.8865 6.30219 11 6.00056 11C5.69892 11 5.40909 10.8865 5.19224 10.6835C3.20651 8.81299 0.545381 6.72346 1.84313 3.68983C2.54482 2.04958 4.22917 1 6.00056 1C7.77195 1 9.4563 2.04958 10.158 3.68983C11.4541 6.71963 8.79951 8.81944 6.80887 10.6835Z"
        stroke="#969696"
      />
      <path
        d="M7.75 5.5C7.75 6.4665 6.9665 7.25 6 7.25C5.0335 7.25 4.25 6.4665 4.25 5.5C4.25 4.5335 5.0335 3.75 6 3.75C6.9665 3.75 7.75 4.5335 7.75 5.5Z"
        stroke="#969696"
      />
    </svg>
  )
}

function StatCard({
  label,
  value,
  growth,
  icon,
  growthIcon,
  align,
  valueIndent,
}: {
  label: string
  value: string
  growth?: string
  icon: string
  growthIcon: string
  align: "start" | "end"
  valueIndent?: boolean
}) {
  return (
    <div
      className={cn(
        "flex w-[125px] shrink-0 flex-col gap-[6px] rounded-[12px] bg-[#fafafa] px-[12px] py-[10px]",
        align === "end" ? "items-end" : "items-start",
      )}
    >
      <div className="flex w-[101px] items-center gap-[4px]">
        <img src={icon} alt="" className="size-3 shrink-0 object-contain" draggable={false} />
        <span
          className="min-w-0 flex-1 text-[10px] uppercase leading-[14px] tracking-[-0.1px] text-[#969696]"
          style={SALT}
        >
          {label}
        </span>
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center",
          valueIndent ? "gap-2 pl-4" : "w-[85px] justify-between",
        )}
      >
        <span className="whitespace-nowrap text-[14px] font-semibold leading-[18px] tracking-[-0.28px] text-[#323232]">
          {value}
        </span>
        {growth ? (
          <span className="inline-flex items-center gap-[2px]">
            <img
              src={growthIcon}
              alt=""
              className="size-[10px] shrink-0 -scale-x-100 rotate-180 object-contain"
              draggable={false}
            />
            <span
              className="whitespace-nowrap text-[10px] font-medium uppercase leading-normal tracking-[-0.1px] text-[#05d052]"
              style={SALT}
            >
              {growth}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  )
}

function CompanyDrawerPanel({ companyId }: { companyId: string }) {
  const data = getCompanyDrawerProfile(companyId)
  const [activeTab, setActiveTab] = useState<CompanyDrawerTab>("Overview")
  const tabBarRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<CompanyDrawerTab, HTMLButtonElement>>>({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    setActiveTab("Overview")
  }, [companyId])

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
        <div className="flex flex-col gap-3">
          <div className="flex w-full items-start">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-start rounded-[12px] border border-solid border-[#f4f4f4] p-2">
                <img
                  src={data.logo}
                  alt=""
                  className="size-8 object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex w-[226px] flex-col gap-2">
                <p className="text-[14px] font-medium leading-[18px] text-[#202020]">
                  {data.name}
                </p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <img
                      src={data.icons.location}
                      alt=""
                      className="size-4 shrink-0"
                      draggable={false}
                    />
                    <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-[#777]">
                      {data.location}
                    </span>
                  </span>
                  <a
                    href={data.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 no-underline"
                  >
                    <img
                      src={data.icons.globe}
                      alt=""
                      className="size-4 shrink-0"
                      draggable={false}
                    />
                    <span className="text-[12px] leading-4 tracking-[-0.12px] text-[#0090ff]">
                      {data.website}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-[2px]">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-solid border-[#f7f7f7] px-[6px] py-1 text-[11px] tracking-[-0.22px] text-[#969696]"
                  style={SALT}
                >
                  {tag}
                </span>
              ))}
            </div>
            <CompanyDrawerSocialLinks items={data.social} />
          </div>
        </div>

        <div className="flex gap-[4px]">
          {data.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} growthIcon={data.icons.growth} />
          ))}
        </div>
      </div>

      <div className="relative h-10 w-full shrink-0">
        <div className="absolute inset-x-0 top-0 border-t border-solid border-[#f9f9f9]" />
        <div
          ref={tabBarRef}
          className="absolute left-6 top-3 flex gap-6 text-[13px]"
        >
          {data.tabs.map((tab) => (
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
        <div className="absolute inset-x-0 bottom-0 border-b border-solid border-[#f9f9f9]" />
        {indicator.width > 0 ? (
          <div
            className="absolute bottom-0 z-10 h-0.5 rounded-t-[2px] bg-[#0090ff] transition-[left,width] duration-200 ease-out"
            style={{ left: 24 + indicator.left, width: indicator.width }}
          />
        ) : null}
      </div>

      {activeTab === "Overview" ? (
        <>
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
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1">
                {data.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center justify-center overflow-hidden rounded-[99px] bg-[rgba(0,144,255,0.05)] px-[6px] py-[4px] text-[11px] leading-normal tracking-[-0.22px] whitespace-nowrap text-[#0090ff]"
                    style={SALT}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3
                className="text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
                style={SALT}
              >
                Locations ({data.locations.length})
              </h3>
              <div className="flex w-full items-center gap-4 rounded-[12px] border border-solid border-[#f4f4f4] py-2 pl-2 pr-4">
                <div className="relative h-[164px] w-[300px] shrink-0">
                  <div className="absolute inset-0 overflow-hidden rounded-[8px]">
                    <img
                      src={data.mapImage}
                      alt=""
                      className="pointer-events-none absolute left-[-9.5%] top-[-227.31%] h-[495.83%] w-[127.87%] max-w-none"
                      draggable={false}
                    />
                  </div>
                  {data.mapDots.map((dot, index) => (
                    <img
                      key={index}
                      src={data.icons.mapDot}
                      alt=""
                      className="absolute size-[9.973px]"
                      style={{ left: dot.left, top: dot.top }}
                      draggable={false}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {data.locations.map((location) => (
                    <div key={location.city} className="flex items-center gap-1">
                      <LocationListIcon />
                      <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
                        {location.city}
                      </span>
                      {"hq" in location && location.hq ? (
                        <span
                          className="rounded-full bg-[rgba(0,144,255,0.07)] px-[5px] py-[2px] text-[10px] font-medium tracking-[-0.2px] text-[#0090ff]"
                          style={SALT}
                        >
                          HQ
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="flex w-full flex-col gap-3">
            <h3
              className="mx-auto w-[512px] shrink-0 text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
              style={SALT}
            >
              Similar Companies
            </h3>
            <div className="flex w-full gap-3 overflow-x-auto pl-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {data.similarCompanies.map((company) => (
                <div
                  key={company.name}
                  className="flex shrink-0 cursor-pointer flex-col gap-[6px] rounded-[12px] border border-solid border-[#f4f4f4] p-4 transition-colors duration-150 ease-out hover:border-[#eee]"
                >
                  <img
                    src={company.logo}
                    alt=""
                    className="size-6 rounded-[8px] object-cover"
                    draggable={false}
                  />
                  <p className="whitespace-nowrap text-[13px] font-medium leading-[22.4px] text-[#202020]">
                    {company.name}
                  </p>
                  <p className="w-[160px] text-[13px] leading-[18.2px] tracking-[-0.26px] text-[#838383]">
                    {company.meta}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "People" ? <CompanyDrawerPeopleTab /> : null}
      {activeTab === "Activity" ? <CompanyDrawerActivityTab /> : null}
      {activeTab === "Financials" ? <CompanyDrawerFinancialsTab /> : null}
      {activeTab === "Signals" ? <CompanyDrawerSignalsTab /> : null}
    </div>
  )
}

/** Figma 168:41887 / 168:39655 — gradient scrim over results; only while drawer is open. */
export function CompanyResultsOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="company-drawer-overlay"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={OVERLAY_ENTRANCE}
          className="pointer-events-none absolute inset-0 z-30 rounded-t-2xl"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-t-2xl"
            style={{ background: OVERLAY_SCRIM_GRADIENT }}
          />
          <button
            type="button"
            aria-label="Close company profile"
            onClick={onClose}
            className="pointer-events-auto absolute bottom-0 right-0 top-0 cursor-default rounded-t-2xl"
            style={{ left: COMPANY_COLUMN_INTERACTIVE_WIDTH_PX }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/** Figma 147:16705 — company profile drawer on the right of the results surface. */
export function CompanyDrawer({
  open,
  companyId,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onClose,
}: {
  open: boolean
  companyId: string
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
            aria-label="Close company profile"
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
            <CompanyDrawerPanel companyId={companyId} />
          </div>
          <CompanyDrawerFooter
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
