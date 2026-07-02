import { useState } from "react"
import { DEMO2_COMPANY_DRAWER_FINANCIALS } from "./company-drawer-financials-data"
import { cn } from "@/lib/utils"

const SALT = { fontFeatureSettings: '"salt" 1' } as const

type FundingRound = (typeof DEMO2_COMPANY_DRAWER_FINANCIALS.fundingRounds)[number]

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

function formatVisitCount(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return `${millions.toFixed(1).replace(/\.0$/, "")}M`
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`
  }
  return value.toLocaleString()
}

function WebsiteTrafficChart({
  dataPoints,
}: {
  dataPoints: readonly { month: string; value: number }[]
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const chartWidth = 464
  const chartHeight = 105
  const paddingY = 10
  const minValue = Math.min(...dataPoints.map((point) => point.value))
  const maxValue = Math.max(...dataPoints.map((point) => point.value))
  const range = maxValue - minValue || 1

  const points = dataPoints.map((point, index) => {
    const x =
      dataPoints.length === 1
        ? chartWidth / 2
        : (index / (dataPoints.length - 1)) * chartWidth
    const y =
      chartHeight -
      paddingY -
      ((point.value - minValue) / range) * (chartHeight - paddingY * 2)
    return { ...point, x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1]!.x} ${chartHeight} L 0 ${chartHeight} Z`
  const hoveredPoint = hoveredIndex === null ? null : points[hoveredIndex]

  return (
    <div
      className="relative h-[105px] w-full"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        className="block"
        aria-hidden
      >
        <defs>
          <linearGradient id="website-traffic-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0090ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0090ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#website-traffic-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#0090ff"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {hoveredPoint ? (
          <>
            <line
              x1={hoveredPoint.x}
              x2={hoveredPoint.x}
              y1={hoveredPoint.y}
              y2={chartHeight}
              stroke="#0090ff"
              strokeOpacity="0.2"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="3.5"
              fill="#0090ff"
              stroke="white"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>

      <div className="absolute inset-0 flex">
        {dataPoints.map((point, index) => (
          <button
            key={point.month}
            type="button"
            aria-label={`${point.month}: ${formatVisitCount(point.value)} visits`}
            className="h-full flex-1 cursor-pointer border-0 bg-transparent p-0"
            onMouseEnter={() => setHoveredIndex(index)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
          />
        ))}
      </div>

      {hoveredPoint ? (
        <div
          className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full rounded-[8px] border border-solid border-[#f4f4f4] bg-white px-2 py-1.5 shadow-[0px_2px_8px_0px_rgba(34,34,34,0.08)]"
          style={{
            left: `${(hoveredPoint.x / chartWidth) * 100}%`,
            top: `${(hoveredPoint.y / chartHeight) * 100}%`,
            marginTop: -8,
          }}
        >
          <p className="whitespace-nowrap text-[11px] font-medium leading-4 tracking-[-0.22px] text-[#323232]">
            {hoveredPoint.month}
          </p>
          <p className="whitespace-nowrap text-[11px] leading-4 tracking-[-0.22px] text-[#6f6f77]">
            {formatVisitCount(hoveredPoint.value)} visits
          </p>
        </div>
      ) : null}
    </div>
  )
}

function FinancialSummaryCards() {
  const { totalRaised, estRevenue } = DEMO2_COMPANY_DRAWER_FINANCIALS.summary

  return (
    <div className="grid grid-cols-2 gap-3">
      <div
        className="flex flex-col rounded-[12px] border border-solid border-[rgba(214,237,255,0.5)] p-[17px]"
        style={{
          backgroundImage:
            "linear-gradient(158deg, rgb(236, 247, 255) 0%, rgb(255, 255, 255) 100%)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <img src={totalRaised.icon} alt="" className="size-3.5 shrink-0" draggable={false} />
          <span className="text-[10px] font-medium uppercase tracking-[0.62px] text-[#0090ff]">
            {totalRaised.label}
          </span>
        </div>
        <p className="pt-1.5 text-[20px] font-semibold leading-7 tracking-[-0.2px] text-[#323232]">
          {totalRaised.value}
        </p>
        <p className="pt-1.5 text-[11px] leading-[16.5px] tracking-[-0.11px] text-[#9ca3af]">
          {totalRaised.meta}
        </p>
      </div>

      <div
        className="flex flex-col rounded-[12px] border border-solid border-[rgba(209,250,229,0.5)] p-[17px]"
        style={{
          backgroundImage:
            "linear-gradient(158deg, rgb(236, 253, 245) 0%, rgb(255, 255, 255) 100%)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <img src={estRevenue.icon} alt="" className="size-3.5 shrink-0" draggable={false} />
          <span className="text-[10px] font-medium uppercase tracking-[0.62px] text-[#00cd71]">
            {estRevenue.label}
          </span>
        </div>
        <p className="pt-1.5 text-[20px] font-semibold leading-7 tracking-[-0.2px] text-[#323232]">
          {estRevenue.value}
        </p>
        <p className="pt-1.5 text-[11px] leading-[16.5px] tracking-[-0.11px] text-[#9ca3af]">
          {estRevenue.meta}
        </p>
      </div>
    </div>
  )
}

function WebsiteTrafficSection() {
  const { totalLabel, period, growthBadge, dataPoints, metrics } =
    DEMO2_COMPANY_DRAWER_FINANCIALS.websiteTraffic

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Website Traffic</SectionTitle>
      <div className="flex flex-col gap-12 rounded-[12px] border border-solid border-[#f4f4f4] p-6">
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-medium leading-[22px] tracking-[-0.32px] text-[#323232]">
              {totalLabel}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#6f6f77]">
                {period}
              </span>
              <span
                className="rounded-[6px] bg-[rgba(102,220,126,0.1)] px-[6px] py-[2px] text-[12px] font-medium leading-4 tracking-[-0.24px] text-[#00cd71]"
                style={SALT}
              >
                {growthBadge}
              </span>
            </div>
          </div>
          <WebsiteTrafficChart dataPoints={dataPoints} />
          <div className="flex justify-between">
            {dataPoints.map((point) => (
              <span
                key={point.month}
                className="text-[12px] leading-4 tracking-[-0.24px] text-[#969696]"
              >
                {point.month}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="h-px w-full bg-[#f4f4f4]" />
          <div className="flex justify-between">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-1.5">
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
                  {metric.label}
                </span>
                <span className="text-[13px] font-medium leading-[18px] tracking-[-0.26px] text-[#323232]">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function fundingAmountClass(style: FundingRound["amountStyle"]) {
  if (style === "primary") return "font-semibold text-[#0090ff]"
  if (style === "muted") return "font-medium text-[#646464]"
  return "font-bold text-[#838383]"
}

function FundingRoundRow({ round, isFirst }: { round: FundingRound; isFirst: boolean }) {
  const { icons } = DEMO2_COMPANY_DRAWER_FINANCIALS

  return (
    <div className={cn("flex gap-4", isFirst ? "pb-3" : "py-3")}>
      <div
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
          round.icon === "flash" ? "bg-[#ebf6ff]" : "bg-[#fafafa]",
        )}
      >
        {round.icon === "flash" ? (
          <img src={icons.flash} alt="" className="size-3.5 shrink-0" draggable={false} />
        ) : (
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: round.dotColor ?? "#ccc" }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-[14px] font-semibold leading-5 tracking-[-0.15px] text-[#323232]">
              {round.name}
            </span>
            <span className={cn("text-[14px] leading-5 tracking-[-0.15px]", fundingAmountClass(round.amountStyle))}>
              {round.amount}
            </span>
            {"latest" in round && round.latest ? (
              <span className="rounded-[4px] bg-[#f4f4f4] px-[5px] py-0.5 text-[9px] font-semibold uppercase tracking-[-0.09px] text-[#969696]">
                Latest
              </span>
            ) : null}
          </div>
          <span
            className={cn(
              "shrink-0 text-[12px] leading-4",
              round.dateMuted ? "text-[#eee]" : "text-[#969696]",
            )}
          >
            {round.date}
          </span>
        </div>

        {round.valuation || round.lead ? (
          <div className="flex items-center gap-3 pt-1">
            {round.valuation ? (
              <p className="text-[12px] leading-4 text-[#777]">
                Valuation:{" "}
                <span className="font-medium text-[#838383]">{round.valuation}</span>
              </p>
            ) : null}
            {round.lead ? (
              <p
                className={cn(
                  "text-[12px] leading-4",
                  round.leadMuted ? "text-[#eee]" : "text-[#969696]",
                )}
              >
                Lead: {round.lead}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FundingRoundsSection() {
  const rounds = DEMO2_COMPANY_DRAWER_FINANCIALS.fundingRounds

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Funding Rounds</SectionTitle>
      <div className="relative w-full">
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-[#fafafa]" />
        <div className="relative flex flex-col">
          {rounds.map((round, index) => (
            <FundingRoundRow key={`${round.name}-${round.date}`} round={round} isFirst={index === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function CompanyDrawerFinancialsTab() {
  return (
    <div className="flex w-[512px] shrink-0 flex-col gap-6">
      <FinancialSummaryCards />
      <WebsiteTrafficSection />
      <FundingRoundsSection />
    </div>
  )
}
