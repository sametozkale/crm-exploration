"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { DEMO2_ASSETS } from "./demo-2-assets"
import { DEMO2_FUNDING_TYPE_PILLS } from "./demo-2-home-data"
import { cn } from "@/lib/utils"

const FUNDING_RANGE_MIN = 0
const FUNDING_RANGE_MAX = 10_000_000
const DEFAULT_MIN = 100_000
const DEFAULT_MAX = 500_000
const HANDLE_SIZE = 24

function formatAmount(value: number): string {
  return value.toLocaleString("en-US")
}

function parseAmount(raw: string): number | null {
  const parsed = Number.parseInt(raw.replace(/,/g, ""), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function clampAmount(value: number): number {
  return Math.min(FUNDING_RANGE_MAX, Math.max(FUNDING_RANGE_MIN, value))
}

function valueToLeft(value: number, trackWidth: number): number {
  const travel = Math.max(0, trackWidth - HANDLE_SIZE)
  const ratio =
    (clampAmount(value) - FUNDING_RANGE_MIN) / (FUNDING_RANGE_MAX - FUNDING_RANGE_MIN)
  return ratio * travel
}

function leftToValue(left: number, trackWidth: number): number {
  const travel = Math.max(1, trackWidth - HANDLE_SIZE)
  const ratio = Math.min(1, Math.max(0, left / travel))
  const raw = FUNDING_RANGE_MIN + ratio * (FUNDING_RANGE_MAX - FUNDING_RANGE_MIN)
  return clampAmount(Math.round(raw / 1000) * 1000)
}

function FundingTypePill({
  label,
  style,
  onSelect,
}: {
  label: string
  style: React.CSSProperties
  onSelect?: (label: string) => void
}) {
  return (
    <button
      type="button"
      style={style}
      onClick={() => onSelect?.(label)}
      className="absolute inline-flex h-[28px] cursor-pointer items-center rounded-[16px] border border-solid border-[#f4f4f4] bg-white px-[9px] py-[5px] text-[13px] font-normal leading-[18.2px] text-[#646464] transition-colors duration-150 ease-out hover:border-[#ececec]"
    >
      {label}
    </button>
  )
}

function FundingAmountField({
  label,
  labelLeft,
  value,
  onChange,
  onBlur,
}: {
  label: string
  labelLeft: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  return (
    <div className="relative h-[48px] min-w-0 flex-[1_0_266px] rounded-[10px] border border-solid border-[#f4f4f4]">
      <span
        className="absolute top-[6.1px] text-[11px] font-normal leading-[15.4px] text-[#838383]"
        style={{ left: labelLeft }}
      >
        {label}
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-full w-full border-0 bg-transparent px-[10px] pb-[6px] pt-[22px] text-[13px] font-normal leading-[18.2px] text-[#202020] outline-none"
      />
    </div>
  )
}

function DateRangeButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-[30px] items-center gap-[4px] rounded-[8px] px-[8px] text-[13px] font-medium leading-[18.2px] text-[#323232]"
    >
      <span className="relative size-[14px] shrink-0 overflow-hidden">
        <img
          src={DEMO2_ASSETS.homeFundingCalendar}
          alt=""
          className="block size-full max-w-none"
          draggable={false}
        />
      </span>
      {label}
    </button>
  )
}

function SliderGripIcon() {
  return (
    <svg
      width="6.27"
      height="8.4"
      viewBox="0 0 6.26667 8.4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block shrink-0"
    >
      <path
        d="M1 1H1.00338M1 4.2H1.00338M1 7.4H1.00338M5.26328 1H5.26667M5.26328 4.2H5.26667M5.26328 7.4H5.26667"
        stroke="#0090FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FundingAmountSlider({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  minValue: number
  maxValue: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const [dragging, setDragging] = useState<"min" | "max" | null>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => setTrackWidth(track.getBoundingClientRect().width)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  const updateFromPointer = useCallback(
    (clientX: number, handle: "min" | "max") => {
      const track = trackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const left = clientX - rect.left - HANDLE_SIZE / 2
      const next = leftToValue(left, rect.width)

      if (handle === "min") {
        onMinChange(Math.min(next, maxValue))
      } else {
        onMaxChange(Math.max(next, minValue))
      }
    },
    [maxValue, minValue, onMaxChange, onMinChange],
  )

  useEffect(() => {
    if (!dragging) return

    const onMove = (event: PointerEvent) => updateFromPointer(event.clientX, dragging)
    const onUp = () => setDragging(null)

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [dragging, updateFromPointer])

  const minLeft = valueToLeft(minValue, trackWidth)
  const maxLeft = valueToLeft(maxValue, trackWidth)
  const fillLeft = minLeft + HANDLE_SIZE / 2
  const fillWidth = Math.max(0, maxLeft - minLeft)

  return (
    <div className="pb-[12px] pt-[20px]">
      <div ref={trackRef} className="relative h-[6px] w-full rounded-[5px] bg-[#eee]">
        {trackWidth > 0 ? (
          <>
            <div
              className="absolute top-0 h-[6px] rounded-[5px] bg-[#0090ff]"
              style={{ left: fillLeft, width: fillWidth }}
            />
            {(["min", "max"] as const).map((handle) => {
              const left = handle === "min" ? minLeft : maxLeft
              return (
                <button
                  key={handle}
                  type="button"
                  aria-label={handle === "min" ? "Minimum funding amount" : "Maximum funding amount"}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    setDragging(handle)
                    event.currentTarget.setPointerCapture(event.pointerId)
                  }}
                  className={cn(
                    "absolute top-[-9px] flex size-6 cursor-grab touch-none items-center justify-center rounded-[8px] border border-solid border-[#fafafa] bg-white shadow-[0px_0.8px_0.8px_rgba(0,0,0,0.05),0px_1.6px_2px_rgba(0,0,0,0.05)]",
                    dragging === handle && "cursor-grabbing",
                  )}
                  style={{ left }}
                >
                  <SliderGripIcon />
                </button>
              )
            })}
          </>
        ) : null}
      </div>
    </div>
  )
}

/** Figma 82:13660 — opens 4px to the right of the filter dropdown, vertically centered on Funding. */
export function HomeFundingFilterPanel({
  onFundingRoundSelect,
}: {
  onFundingRoundSelect?: (round: string) => void
} = {}) {
  const [minValue, setMinValue] = useState(DEFAULT_MIN)
  const [maxValue, setMaxValue] = useState(DEFAULT_MAX)
  const [minInput, setMinInput] = useState(formatAmount(DEFAULT_MIN))
  const [maxInput, setMaxInput] = useState(formatAmount(DEFAULT_MAX))
  const [investorMode, setInvestorMode] = useState<"any" | "all">("any")

  const syncMin = useCallback((next: number) => {
    const clamped = clampAmount(next)
    const bounded = Math.min(clamped, maxValue)
    setMinValue(bounded)
    setMinInput(formatAmount(bounded))
  }, [maxValue])

  const syncMax = useCallback((next: number) => {
    const clamped = clampAmount(next)
    const bounded = Math.max(clamped, minValue)
    setMaxValue(bounded)
    setMaxInput(formatAmount(bounded))
  }, [minValue])

  const commitMinInput = useCallback(() => {
    const parsed = parseAmount(minInput)
    if (parsed === null) {
      setMinInput(formatAmount(minValue))
      return
    }
    syncMin(parsed)
  }, [minInput, minValue, syncMin])

  const commitMaxInput = useCallback(() => {
    const parsed = parseAmount(maxInput)
    if (parsed === null) {
      setMaxInput(formatAmount(maxValue))
      return
    }
    syncMax(parsed)
  }, [maxInput, maxValue, syncMax])

  return (
    <div className="w-[590px] shrink-0 rounded-[16px] border border-solid border-[#f7f7f7] bg-white shadow-[0px_1px_4px_0px_rgba(34,34,34,0.05)]">
      <div className="p-[16px]">
        <div className="w-[558px]">
          <h3 className="text-[16px] font-semibold leading-[22.4px] text-[#202020]">
            Company funding
          </h3>

          <div className="h-[130px] w-full pt-[15px]">
            <div className="h-[17px]">
              <p className="text-[12px] font-normal leading-[16.8px] text-[#838383]">
                Last funding type
              </p>
            </div>
            <div className="relative mt-[5px] h-[93px] w-full">
              {DEMO2_FUNDING_TYPE_PILLS.map((pill) => (
                <FundingTypePill
                  key={pill.label}
                  label={pill.label}
                  style={{ left: pill.left, top: pill.top }}
                  onSelect={onFundingRoundSelect}
                />
              ))}
            </div>
          </div>

          <div className="h-[67px] w-full pt-4">
            <div className="h-[22px] pb-[5px]">
              <p className="text-[12px] font-normal leading-[16.8px] text-[#838383]">
                Last funding round
              </p>
            </div>
            <div className="relative h-[30px] w-full">
              <div className="absolute left-[0.1px] top-[-0.1px]">
                <DateRangeButton label="June 10th 2026" />
              </div>
              <span className="absolute left-[143.61px] top-[4.8px] -translate-x-1/2 text-[13px] font-normal leading-[18.2px] text-[#323232]">
                -
              </span>
              <div className="absolute left-[155.3px] top-[-0.1px]">
                <DateRangeButton label="June 10th 2026" />
              </div>
            </div>
          </div>

          <div className="w-full pt-4">
            <div className="h-[17px]">
              <p className="text-[12px] font-normal leading-[16.8px] text-[#838383]">
                Total funding amount
              </p>
            </div>
            <div className="h-[95px] pt-[5px]">
              <div className="flex items-center gap-[10px]">
                <FundingAmountField
                  label="Min $"
                  labelLeft="9.91px"
                  value={minInput}
                  onChange={setMinInput}
                  onBlur={commitMinInput}
                />
                <span className="shrink-0 text-[13px] font-normal leading-[18.2px] text-[#202020]">
                  -
                </span>
                <FundingAmountField
                  label="Max $"
                  labelLeft="9.63px"
                  value={maxInput}
                  onChange={setMaxInput}
                  onBlur={commitMaxInput}
                />
              </div>

              <FundingAmountSlider
                minValue={minValue}
                maxValue={maxValue}
                onMinChange={syncMin}
                onMaxChange={syncMax}
              />
            </div>
          </div>

          <div className="w-full pt-4">
            <div className="h-[17px]">
              <p className="text-[12px] font-normal leading-[16.8px] text-[#838383]">Investors</p>
            </div>
            <div className="relative mt-[5px] h-[42px] rounded-[12px] border border-solid border-[#f4f4f4]">
              <input
                type="text"
                placeholder="Search investors by name"
                className="absolute left-[4.86px] top-[11px] h-[18px] w-[463px] border-0 bg-transparent px-[5px] text-[13px] font-normal leading-normal text-[#202020] outline-none placeholder:text-[#757575]"
              />
              <div className="absolute left-[469.86px] top-[5px] flex w-[81px] gap-[2px] rounded-[10px] bg-[#f9f9f9] p-[2px]">
                <button
                  type="button"
                  onClick={() => setInvestorMode("any")}
                  className="relative h-[26px] w-[41px] shrink-0 rounded-[8px]"
                >
                  {investorMode === "any" ? (
                    <span className="absolute inset-0 rounded-[8px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
                  ) : null}
                  <span
                    className={cn(
                      "relative flex h-[26px] items-center justify-center text-[12px] font-medium leading-[16.8px]",
                      investorMode === "any" ? "text-[#202020]" : "text-[#838383]",
                    )}
                  >
                    Any
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvestorMode("all")}
                  className="relative h-[26px] w-[34px] shrink-0 rounded-[8px]"
                >
                  {investorMode === "all" ? (
                    <span className="absolute inset-0 rounded-[8px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
                  ) : null}
                  <span
                    className={cn(
                      "relative flex h-[26px] items-center justify-center text-[12px] font-medium leading-[16.8px]",
                      investorMode === "all" ? "text-[#202020]" : "text-[#838383]",
                    )}
                  >
                    All
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
