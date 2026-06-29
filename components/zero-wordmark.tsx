import { cn } from "@/lib/utils"

const WORDMARK_PATH =
  "M43.565 23.762L56.238 23.762L56.238 -0H43.565C19.505 -0 0 19.504 0 43.564L0 56.237H23.763V43.564C23.763 32.628 32.628 23.762 43.565 23.762ZM36.436 56.237L23.763 56.237L23.763 80H36.436C60.496 80 80 60.495 80 36.435V23.762H56.238V36.435C56.238 47.372 47.372 56.237 36.436 56.237ZM259.829 69.887C245.45 69.887 237.089 59.771 237.089 46.061C237.089 31.598 246.871 22.986 259.829 22.986C274.125 22.986 282.485 33.019 282.485 46.061C282.485 61.025 273.038 69.887 259.829 69.887ZM259.829 61.443C267.771 61.443 272.453 54.922 272.453 46.061C272.453 37.282 267.521 31.43 259.829 31.43C252.138 31.43 247.122 37.282 247.122 46.061C247.122 55.758 252.556 61.443 259.829 61.443ZM207.998 68.633H217.863V46.73C217.863 38.369 223.297 33.437 232.493 33.437H234.165V23.823H232.493C225.136 23.823 219.953 27 217.111 33.019L215.94 24.324H207.998V68.633ZM179.985 69.887C166.442 69.887 157.162 60.189 157.162 46.646C157.162 32.016 166.776 22.986 179.149 22.986C191.69 22.986 200.05 31.765 200.301 46.144V48.485H167.027C167.696 56.26 172.545 61.527 180.069 61.527C185.169 61.527 189.015 59.019 190.519 54.588H200.134C197.876 64.119 190.436 69.887 179.985 69.887ZM167.445 41.546H190.101C188.847 35.192 184.918 31.347 179.149 31.347C173.297 31.347 168.95 35.192 167.445 41.546ZM106.967 68.633H151.109V59.604H118.755L150.273 19.392V10.112H108.472V19.141H138.485L106.967 59.353V68.633Z"

// The Zero brand mark (glyph only, no wordmark text).
const MARK_PATH =
  "M43.565 23.762L56.238 23.762L56.238 -0H43.565C19.505 -0 0 19.504 0 43.564L0 56.237H23.763V43.564C23.763 32.628 32.628 23.762 43.565 23.762ZM36.436 56.237L23.763 56.237L23.763 80H36.436C60.496 80 80 60.495 80 36.435V23.762H56.238V36.435C56.238 47.372 47.372 56.237 36.436 56.237Z"

type ZeroWordmarkProps = {
  className?: string
}

/** Zero brand mark (glyph only) — scales with `text-foreground`. */
export function ZeroMark({ className }: ZeroWordmarkProps) {
  return (
    <svg
      role="img"
      aria-label="Zero"
      viewBox="-1 -1 82 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-foreground", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={MARK_PATH}
        fill="currentColor"
      />
    </svg>
  )
}

/** Zero logotype from Paper — scales with `text-foreground` for light/dark. */
export function ZeroWordmark({ className }: ZeroWordmarkProps) {
  return (
    <div
      role="img"
      aria-label="Zero"
      className={cn(
        "box-border h-[17px] w-[58px] shrink-0 text-foreground",
        className,
      )}
      style={{ aspectRatio: "3.47561 / 1" }}
    >
      <svg
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        viewBox="-1 -1 285 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full overflow-clip"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={WORDMARK_PATH}
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
