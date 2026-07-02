import { useState } from "react"
import { DEMO2_COMPANY_DRAWER_ACTIVITY } from "./company-drawer-activity-data"

const SALT = { fontFeatureSettings: '"salt" 1' } as const

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

function ActivityLocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden>
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

function formatFollowerCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`
  }
  return value.toLocaleString()
}

function LinkedInFollowersChart({
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
          <linearGradient id="linkedin-followers-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0090ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0090ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#linkedin-followers-fill)" />
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
            aria-label={`${point.month}: ${formatFollowerCount(point.value)} followers`}
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
            {formatFollowerCount(hoveredPoint.value)} followers
          </p>
        </div>
      ) : null}
    </div>
  )
}

function LinkedInFollowersSection() {
  const { totalLabel, period, growthBadge, dataPoints } =
    DEMO2_COMPANY_DRAWER_ACTIVITY.linkedInFollowers

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>LinkedIn Followers</SectionTitle>
      <div className="flex flex-col gap-4 rounded-[12px] border border-solid border-[#f4f4f4] p-6">
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
        <LinkedInFollowersChart dataPoints={dataPoints} />
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
    </section>
  )
}

function RecentLinkedInPostsSection() {
  const { recentPosts, icons } = DEMO2_COMPANY_DRAWER_ACTIVITY

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Recent LinkedIn Posts</SectionTitle>
      <div className="flex flex-col gap-2">
        {recentPosts.map((post, index) => (
          <div
            key={index}
            className="flex cursor-pointer flex-col gap-3 rounded-[12px] border border-solid border-[#f4f4f4] px-4 py-3 transition-colors duration-150 ease-out hover:border-[#eee]"
          >
            <p className="text-[13px] leading-5 tracking-[-0.13px] text-[#323232]">
              {post.body}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <img
                    src={icons.thumbsUp}
                    alt=""
                    className="size-4 shrink-0 object-contain"
                    draggable={false}
                  />
                  <span className="text-[12px] leading-4 text-[#969696]">{post.likes}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <img
                    src={icons.comment}
                    alt=""
                    className="size-4 shrink-0 object-contain"
                    draggable={false}
                  />
                  <span className="text-[12px] leading-4 text-[#969696]">{post.comments}</span>
                </span>
              </div>
              <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#aaa]">
                {post.postedAgo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function OpenPositionsSection() {
  const { count, roles } = DEMO2_COMPANY_DRAWER_ACTIVITY.openPositions

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Open Positions ({count})</SectionTitle>
      <div className="flex flex-col gap-2">
        {roles.map((role) => (
          <div
            key={role.title}
            className="group/position flex cursor-pointer items-start justify-between rounded-[12px] border border-solid border-[#f4f4f4] px-4 py-3 transition-colors duration-150 ease-out hover:border-[#eee]"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium leading-[18px] tracking-[-0.26px] text-[#323232]">
                {role.title}
              </span>
              <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
                {role.department}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="inline-flex items-center gap-1.5">
                <ActivityLocationIcon />
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#969696]">
                  {role.location}
                </span>
              </span>
              <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#aaa] opacity-0 transition-opacity duration-150 ease-out group-hover/position:opacity-100">
                {role.postedAgo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CompanyDrawerActivityTab() {
  return (
    <div className="flex w-[512px] shrink-0 flex-col gap-6">
      <LinkedInFollowersSection />
      <RecentLinkedInPostsSection />
      <OpenPositionsSection />
    </div>
  )
}
