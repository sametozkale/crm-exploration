import { cn } from "@/lib/utils"

/** Figma magic-wand — 14×14, color driven by parent text color */
export function HomeImproveIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex size-[14px] shrink-0 overflow-clip", className)}
      aria-hidden
    >
      <svg
        viewBox="0 0 13.6955 13.6958"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        className="block size-full"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.67036 0.0153051C8.0762 -0.0675491 8.47237 0.194284 8.55522 0.600126L8.87855 2.18385C8.9614 2.5897 8.69957 2.98586 8.29373 3.06872C7.88788 3.15157 7.49172 2.88974 7.40886 2.4839L7.08554 0.900169C7.00268 0.494327 7.26452 0.0981601 7.67036 0.0153051ZM12.4384 1.25717C12.7313 1.55007 12.7313 2.02494 12.4384 2.31783L11.2954 3.4608C11.0025 3.75369 10.5277 3.75369 10.2348 3.4608C9.94186 3.1679 9.94186 2.69303 10.2348 2.40014L11.3777 1.25717C11.6706 0.964279 12.1455 0.964279 12.4384 1.25717ZM8.62171 5.07407C8.9146 5.36696 8.9146 5.84183 8.62171 6.13473L1.28033 13.4761C0.987436 13.769 0.512563 13.769 0.21967 13.4761C-0.0732235 13.1832 -0.0732232 12.7083 0.21967 12.4154L7.56105 5.07407C7.85394 4.78117 8.32881 4.78117 8.62171 5.07407ZM5.44275 1.89511C5.14986 1.60222 4.67498 1.60222 4.38209 1.89511C4.0892 2.18801 4.0892 2.66288 4.38209 2.95577L5.52505 4.09874C5.81795 4.39163 6.29282 4.39163 6.58571 4.09874C6.87861 3.80584 6.87861 3.33097 6.58571 3.03807L5.44275 1.89511ZM11.8007 9.31368C12.0936 9.02079 12.0936 8.54591 11.8007 8.25302L10.6577 7.11006C10.3648 6.81717 9.88996 6.81717 9.59704 7.11006C9.30415 7.40295 9.30415 7.87783 9.59704 8.17072L10.74 9.31368C11.0329 9.60658 11.5078 9.60658 11.8007 9.31368ZM13.0954 5.14031C13.5013 5.22316 13.7631 5.61933 13.6803 6.02517C13.5974 6.43101 13.2012 6.69285 12.7954 6.60999L11.2117 6.28667C10.8058 6.20381 10.544 5.80764 10.6269 5.4018C10.7097 4.99596 11.1059 4.73413 11.5117 4.81698L13.0954 5.14031Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

/** Figma music-equalizer — 14×14, color driven by parent text color */
export function HomeEqualizerIcon({
  className,
  animated = false,
}: {
  className?: string
  /** Voice recording — bars pulse up/down. */
  animated?: boolean
}) {
  if (animated) {
    const bars = [
      { height: 4.5, delay: 0 },
      { height: 8.5, delay: 0.1 },
      { height: 12, delay: 0.2 },
      { height: 8.5, delay: 0.3 },
      { height: 4.5, delay: 0.4 },
    ] as const

    return (
      <span
        className={cn(
          "relative inline-flex size-[14px] shrink-0 items-center justify-center gap-[1.33px]",
          className,
        )}
        aria-hidden
      >
        {bars.map((bar, index) => (
          <span
            key={index}
            className="demo2-voice-eq-bar w-[1.5px] rounded-full bg-current"
            style={{
              height: bar.height,
              animationDelay: `${bar.delay}s`,
            }}
          />
        ))}
      </span>
    )
  }

  return (
    <span
      className={cn("relative inline-flex size-[14px] shrink-0 overflow-clip", className)}
      aria-hidden
    >
      <span className="absolute inset-[1.8%]">
        <svg
          viewBox="0 0 13.5 13.496"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          className="block size-full"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.5 0.75C7.5 0.551088 7.42098 0.360322 7.28033 0.21967C7.13968 0.0790176 6.94891 0 6.75 0C6.55109 0 6.36032 0.0790176 6.21967 0.21967C6.07902 0.360322 6 0.551088 6 0.75V12.746C6 12.9449 6.07902 13.1357 6.21967 13.2763C6.36032 13.417 6.55109 13.496 6.75 13.496C6.94891 13.496 7.13968 13.417 7.28033 13.2763C7.42098 13.1357 7.5 12.9449 7.5 12.746V0.75ZM3.75 2.308C3.94891 2.308 4.13968 2.38702 4.28033 2.52767C4.42098 2.66832 4.5 2.85909 4.5 3.058V10.44C4.5 10.6389 4.42098 10.8297 4.28033 10.9703C4.13968 11.111 3.94891 11.19 3.75 11.19C3.55109 11.19 3.36032 11.111 3.21967 10.9703C3.07902 10.8297 3 10.6389 3 10.44V3.057C3 2.85809 3.07902 2.66732 3.21967 2.52667C3.36032 2.38602 3.55109 2.308 3.75 2.308ZM0.75 4.614C0.948912 4.614 1.13968 4.69302 1.28033 4.83367C1.42098 4.97432 1.5 5.16509 1.5 5.364V8.132C1.5 8.23049 1.4806 8.32802 1.44291 8.41901C1.40522 8.51001 1.34997 8.59269 1.28033 8.66233C1.21069 8.73197 1.12801 8.78722 1.03701 8.82491C0.946018 8.8626 0.848491 8.882 0.75 8.882C0.651509 8.882 0.553982 8.8626 0.462987 8.82491C0.371993 8.78722 0.289314 8.73197 0.21967 8.66233C0.150026 8.59269 0.0947814 8.51001 0.0570903 8.41901C0.0193993 8.32802 -1.46764e-09 8.23049 0 8.132V5.364C0 5.16509 0.0790176 4.97432 0.21967 4.83367C0.360322 4.69302 0.551088 4.614 0.75 4.614ZM9.75 2.307C9.94891 2.307 10.1397 2.38602 10.2803 2.52667C10.421 2.66732 10.5 2.85809 10.5 3.057V10.439C10.5 10.6379 10.421 10.8287 10.2803 10.9693C10.1397 11.11 9.94891 11.189 9.75 11.189C9.55109 11.189 9.36032 11.11 9.21967 10.9693C9.07902 10.8287 9 10.6379 9 10.439V3.057C9 2.85809 9.07902 2.66732 9.21967 2.52667C9.36032 2.38602 9.55109 2.307 9.75 2.307ZM13.5 5.364C13.5 5.16509 13.421 4.97432 13.2803 4.83367C13.1397 4.69302 12.9489 4.614 12.75 4.614C12.5511 4.614 12.3603 4.69302 12.2197 4.83367C12.079 4.97432 12 5.16509 12 5.364V8.132C12 8.33091 12.079 8.52168 12.2197 8.66233C12.3603 8.80298 12.5511 8.882 12.75 8.882C12.9489 8.882 13.1397 8.80298 13.2803 8.66233C13.421 8.52168 13.5 8.33091 13.5 8.132V5.364Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </span>
  )
}

/** Figma search-list-01 — inset + bleed at 18×18 */
export function HomeSearchListIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex size-[18px] shrink-0 overflow-clip", className)}
      aria-hidden
    >
      <span className="absolute inset-x-[8.33%] inset-y-[12.5%]">
        <span className="absolute -inset-x-[5%] -inset-y-[5.56%]">
          <svg
            viewBox="0 0 16.5 15"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            className="block size-full"
          >
            <path
              d="M15.2197 14.7803C15.5126 15.0732 15.9874 15.0732 16.2803 14.7803C16.5732 14.4874 16.5732 14.0126 16.2803 13.7197L15.75 14.25L15.2197 14.7803ZM13.95 12.45L13.4197 12.9803L15.2197 14.7803L15.75 14.25L16.2803 13.7197L14.4803 11.9197L13.95 12.45ZM14.85 9.3H15.6C15.6 6.64903 13.451 4.5 10.8 4.5V5.25V6C12.6225 6 14.1 7.47746 14.1 9.3H14.85ZM10.8 5.25V4.5C8.14903 4.5 6 6.64903 6 9.3H6.75H7.5C7.5 7.47746 8.97746 6 10.8 6V5.25ZM6.75 9.3H6C6 11.951 8.14903 14.1 10.8 14.1V13.35V12.6C8.97746 12.6 7.5 11.1225 7.5 9.3H6.75ZM10.8 13.35V14.1C13.451 14.1 15.6 11.951 15.6 9.3H14.85H14.1C14.1 11.1225 12.6225 12.6 10.8 12.6V13.35Z"
              fill="#0090FF"
            />
            <path
              d="M0.750004 5.25C0.33579 5.25 2.20728e-06 5.58578 0 5.99999C-2.20728e-06 6.41421 0.335782 6.75 0.749996 6.75L0.75 6L0.750004 5.25ZM4.5 6.75004C4.91421 6.75004 5.25 6.41426 5.25 6.00004C5.25 5.58583 4.91422 5.25004 4.5 5.25004L4.5 6.00004L4.5 6.75004ZM0.75 6L0.749996 6.75L4.5 6.75004L4.5 6.00004L4.5 5.25004L0.750004 5.25L0.75 6Z"
              fill="#0090FF"
            />
            <path
              d="M0.75 11.25H4.5"
              stroke="#0090FF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0.75 0.75H13.5"
              stroke="#0090FF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </span>
  )
}

/** Figma arrow-down-01-round — clean centered chevron */
export function HomeChevronDownIcon({
  className,
  size = 13,
}: {
  className?: string
  size?: number
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        className="block size-full"
      >
        <path
          d="M11.47 6.27C11.47 6.27 8.91 9.73 8 9.73C7.08 9.73 4.53 6.27 4.53 6.27"
          stroke="#BBBBBB"
          strokeWidth="1.33"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
