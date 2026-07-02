/** Shared drawer footer Add to list button — Figma 300:28666 / add-01. */

export const DRAWER_FOOTER_ADD_DARK_BUTTON_CLASS =
  "inline-flex items-center gap-[6px] rounded-[8px] border-[0.5px] border-solid border-[#484848] bg-[#323232] px-2 py-[7px] text-[12px] leading-[14px] tracking-[-0.24px] text-white drop-shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)] transition-colors duration-150 ease-out hover:bg-[#2a2a2a]"

export const DRAWER_FOOTER_ADD_LIGHT_BUTTON_CLASS =
  "group inline-flex items-center gap-[6px] rounded-[8px] border-[0.5px] border-solid border-[#f2f2f2] bg-white px-2 py-[7px] text-[12px] leading-[14px] tracking-[-0.24px] text-[#646464] drop-shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)] transition-[background-color,border-color,box-shadow,color] duration-150 ease-out hover:border-[#ddd] hover:bg-[#fdfdfd] hover:text-[#323232] hover:shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)]"

/** Figma add-01 — 12px tile, 16.67% inset, 9×9 glyph. */
export function DrawerFooterAddIcon() {
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
