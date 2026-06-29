"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  getTokenDropdownOptions,
  parsePromptTokens,
  type PromptToken,
  type TokenType,
} from "@/lib/prompt-tokens"

const CHIP_CLASS =
  "mx-px my-px inline-flex h-5 cursor-pointer items-center rounded-[12px] bg-[rgba(0,144,255,0.07)] px-1 text-[13px] leading-[20px] text-[#0090ff] align-baseline transition-colors hover:bg-[rgba(0,144,255,0.12)]"

export interface HomeSmartPromptHandle {
  focus: () => void
  getElement: () => HTMLDivElement | null
}

interface DropdownState {
  type: TokenType
  value: string
  start: number
  end: number
  rect: DOMRect
}

function buildEditorNodes(editor: HTMLElement, text: string, tokens: PromptToken[]) {
  editor.replaceChildren()
  if (!text) return

  if (tokens.length === 0) {
    editor.appendChild(document.createTextNode(text))
    return
  }

  let cursor = 0
  for (const token of tokens) {
    if (token.start > cursor) {
      editor.appendChild(document.createTextNode(text.slice(cursor, token.start)))
    }
    const chip = document.createElement("span")
    chip.dataset.token = token.type
    chip.setAttribute("contenteditable", "false")
    chip.className = CHIP_CLASS
    chip.textContent = token.value
    editor.appendChild(chip)
    cursor = token.end
  }
  if (cursor < text.length) {
    editor.appendChild(document.createTextNode(text.slice(cursor)))
  }
}

function readEditorText(editor: HTMLElement): string {
  return editor.textContent ?? ""
}

function getCaretOffset(editor: HTMLElement): number | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!editor.contains(range.endContainer)) return null
  const pre = range.cloneRange()
  pre.selectNodeContents(editor)
  pre.setEnd(range.endContainer, range.endOffset)
  return pre.toString().length
}

function placeCaretAtOffset(editor: HTMLElement, offset: number) {
  const textLen = readEditorText(editor).length
  let remaining = Math.max(0, Math.min(offset, textLen))

  const applyRange = (range: Range) => {
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  const placeAtEnd = () => {
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    applyRange(range)
  }

  const walk = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const inChip = !!(node.parentElement as HTMLElement | null)?.closest("[data-token]")
      if (inChip) return false
      const len = node.textContent?.length ?? 0
      if (remaining <= len) {
        const range = document.createRange()
        range.setStart(node, remaining)
        range.collapse(true)
        applyRange(range)
        return true
      }
      remaining -= len
      return false
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.dataset.token) {
        const len = el.textContent?.length ?? 0
        if (remaining < len) {
          const range = document.createRange()
          if (remaining === 0) range.setStartBefore(el)
          else range.setStartAfter(el)
          range.collapse(true)
          applyRange(range)
          return true
        }
        remaining -= len
        return false
      }
      for (const child of Array.from(node.childNodes)) {
        if (walk(child)) return true
      }
    }
    return false
  }

  for (const child of Array.from(editor.childNodes)) {
    if (walk(child)) return
  }
  placeAtEnd()
}

function getTokenOffsets(
  editor: HTMLElement,
  chip: HTMLElement,
): { start: number; end: number; value: string } {
  const range = document.createRange()
  range.selectNodeContents(editor)
  range.setEndBefore(chip)
  const start = range.toString().length
  const value = chip.textContent ?? ""
  return { start, end: start + value.length, value }
}

export const HomeSmartPromptEditor = forwardRef<
  HomeSmartPromptHandle,
  {
    value: string
    onChange: (value: string) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
    onFocus?: () => void
    onBlur?: () => void
    readOnly?: boolean
    className?: string
    style?: React.CSSProperties
    onHeightChange?: () => void
  }
>(function HomeSmartPromptEditor(
  {
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    readOnly = false,
    className,
    style,
    onHeightChange,
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const composingRef = useRef(false)
  const [dropdown, setDropdown] = useState<DropdownState | null>(null)

  const paint = useCallback(
    (text: string, opts: { restoreCaret?: boolean } = {}) => {
      const editor = editorRef.current
      if (!editor) return
      const tokens = parsePromptTokens(text)
      const caret = opts.restoreCaret ? getCaretOffset(editor) : null
      buildEditorNodes(editor, text, tokens)
      if (caret != null) placeCaretAtOffset(editor, caret)
      onHeightChange?.()
    },
    [onHeightChange],
  )

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    if (readEditorText(editor) === value) return
    const focused = document.activeElement === editor
    paint(value, { restoreCaret: focused })
  }, [value, paint])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        editorRef.current?.focus()
      },
      getElement() {
        return editorRef.current
      },
    }),
    [],
  )

  const handleInput = () => {
    const editor = editorRef.current
    if (!editor || composingRef.current || readOnly) return
    const text = readEditorText(editor)
    onChange(text)
    setDropdown(null)
    onHeightChange?.()
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      const el = editorRef.current
      if (el && document.activeElement === el && !composingRef.current) {
        paint(readEditorText(el), { restoreCaret: true })
      }
    }, 650)
  }

  const openDropdownForChip = (chip: HTMLElement) => {
    const editor = editorRef.current
    if (!editor || readOnly) return
    const type = chip.dataset.token as TokenType
    const { start, end, value: tokenValue } = getTokenOffsets(editor, chip)
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    setDropdown({
      type,
      value: tokenValue,
      start,
      end,
      rect: chip.getBoundingClientRect(),
    })
  }

  const scheduleCloseDropdown = () => {
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    hoverCloseTimerRef.current = setTimeout(() => setDropdown(null), 120)
  }

  const cancelCloseDropdown = () => {
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
  }

  const applySuggestion = (choice: string) => {
    const current = dropdown
    setDropdown(null)
    if (!current) return
    const next = value.slice(0, current.start) + choice + value.slice(current.end)
    onChange(next)
    requestAnimationFrame(() => editorRef.current?.focus())
  }

  return (
    <>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label="Search prompt"
        contentEditable={!readOnly}
        suppressContentEditableWarning
        spellCheck={false}
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={() => {
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
          const editor = editorRef.current
          if (editor) paint(readEditorText(editor))
          onBlur?.()
        }}
        onPaste={(e) => {
          if (readOnly) return
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          if (text) document.execCommand("insertText", false, text)
        }}
        onCompositionStart={() => {
          composingRef.current = true
        }}
        onCompositionEnd={() => {
          composingRef.current = false
          handleInput()
        }}
        onMouseOver={(e) => {
          const chip = (e.target as HTMLElement).closest<HTMLElement>("[data-token]")
          if (chip) openDropdownForChip(chip)
        }}
        onMouseLeave={(e) => {
          const related = e.relatedTarget as Node | null
          if (related && (e.currentTarget as HTMLElement).contains(related)) return
          scheduleCloseDropdown()
        }}
        className={cn(
          "m-0 block min-h-[20px] w-full resize-none overflow-hidden bg-transparent px-0 pt-0 pb-px text-[13px] leading-[20px] tracking-[-0.13px] outline-none",
          "text-[#202020] caret-[#202020] whitespace-pre-wrap break-words",
          readOnly && "pointer-events-none",
          className,
        )}
        style={style}
      />

      {dropdown ? (
        <HomeTokenDropdown
          state={dropdown}
          options={getTokenDropdownOptions(dropdown.value, dropdown.type)}
          onSelect={applySuggestion}
          onClose={() => setDropdown(null)}
          onHoverStart={cancelCloseDropdown}
          onHoverEnd={scheduleCloseDropdown}
        />
      ) : null}
    </>
  )
})

function HomeTokenTickIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-3 shrink-0" aria-hidden>
      <path
        d="M2.5 6.25L5 8.75L9.5 3.75"
        stroke="#0090FF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HomeTokenDropdown({
  state,
  options,
  onSelect,
  onClose,
  onHoverStart,
  onHoverEnd,
}: {
  state: DropdownState
  options: string[]
  onSelect: (value: string) => void
  onClose: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    const onScroll = () => onClose()
    window.addEventListener("keydown", onKey, true)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onClose)
    return () => {
      window.removeEventListener("keydown", onKey, true)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onClose)
    }
  }, [onClose])

  const left = Math.min(state.rect.left, window.innerWidth - 200)
  const isSelected = (option: string) =>
    option.toLowerCase() === state.value.toLowerCase()

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      onMouseEnter={onHoverStart}
      onMouseLeave={() => {
        setHovered(null)
        onHoverEnd()
      }}
      style={{
        position: "fixed",
        top: state.rect.bottom + 2,
        left: Math.max(8, left),
        minWidth: Math.max(state.rect.width, 140),
        zIndex: 60,
      }}
      className="flex flex-col rounded-[12px] border border-solid border-[#f7f7f7] bg-white p-1 drop-shadow-[0px_1px_2px_rgba(34,34,34,0.05)]"
    >
      {options.length === 0 ? (
        <div className="px-2 py-[6px] text-[13px] tracking-[0.13px] text-[#777]">No options</div>
      ) : (
        options.map((option) => {
          const selected = isSelected(option)
          const isHovered = hovered === option
          return (
            <button
              key={option}
              type="button"
              onMouseEnter={() => setHovered(option)}
              onClick={() => onSelect(option)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[8px] px-2 py-[6px] text-left text-[13px] leading-normal tracking-[0.13px] transition-colors duration-150 ease-out",
                selected
                  ? "text-[#0090ff]"
                  : isHovered
                    ? "bg-[#f7f7f7] text-[#646464]"
                    : "text-[#777]",
              )}
            >
              <span className="whitespace-nowrap">{option}</span>
              {selected ? <HomeTokenTickIcon /> : null}
            </button>
          )
        })
      )}
    </motion.div>,
    document.body,
  )
}
