"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { EditPrompt, Search } from "@/components/icons"
import { cn } from "@/lib/utils"
import {
  getTokenSuggestions,
  improvePrompt,
  parsePromptTokens,
  TOKEN_LABELS,
  TOKEN_STYLES,
  type TokenType,
} from "@/lib/prompt-tokens"

export interface SmartPromptHandle {
  focus: () => void
  selectAll: () => void
  blur: () => void
}

interface SmartPromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  /** Right-aligned action slot (Run / Stop buttons). */
  actions?: ReactNode
  /** Disable editing + Improve while a search is running. */
  disabled?: boolean
}

interface DropdownState {
  type: TokenType
  value: string
  start: number
  end: number
  rect: DOMRect
}

const CHIP_CLASS =
  "mx-px inline-flex items-center rounded-md px-1.5 py-px text-[0.94em] font-medium leading-snug align-baseline cursor-pointer select-none transition hover:brightness-95 dark:hover:brightness-110"

/** Rebuild the editor DOM from a plain string, wrapping detected tokens as chips. */
function buildEditorNodes(editor: HTMLElement, text: string) {
  editor.replaceChildren()
  if (!text) return

  const tokens = parsePromptTokens(text)
  let cursor = 0

  for (const token of tokens) {
    if (token.start > cursor) {
      editor.appendChild(
        document.createTextNode(text.slice(cursor, token.start)),
      )
    }
    const chip = document.createElement("span")
    chip.dataset.token = token.type
    chip.setAttribute("contenteditable", "false")
    chip.className = cn(CHIP_CLASS, TOKEN_STYLES[token.type])
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
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null)
  let remaining = offset
  let node: Node | null
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0
    const inChip = !!(node.parentElement as HTMLElement | null)?.closest(
      "[data-token]",
    )
    if (!inChip && remaining <= len) {
      const range = document.createRange()
      range.setStart(node, remaining)
      range.collapse(true)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      return
    }
    remaining -= len
  }
  placeCaretAtEnd(editor)
}

function placeCaretAtEnd(editor: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(editor)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function selectAllContents(editor: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(editor)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

export const SmartPromptInput = forwardRef<
  SmartPromptHandle,
  SmartPromptInputProps
>(function SmartPromptInput(
  { value, onChange, onSubmit, placeholder, actions, disabled = false },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const improveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevTextRef = useRef<string | null>(null)
  const composingRef = useRef(false)

  const [multiline, setMultiline] = useState(false)
  const [improving, setImproving] = useState(false)
  const [undoVisible, setUndoVisible] = useState(false)
  const [dropdown, setDropdown] = useState<DropdownState | null>(null)

  const measureMultiline = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    // Single line with leading-7 + py-1.5 is ~40px; only switch to top-align past that.
    setMultiline(el.offsetHeight > 48)
  }, [])

  const paint = useCallback(
    (text: string, opts: { focus?: boolean; restoreCaret?: boolean } = {}) => {
      const editor = editorRef.current
      if (!editor) return
      const caret = opts.restoreCaret ? getCaretOffset(editor) : null
      buildEditorNodes(editor, text)
      if (opts.focus) {
        placeCaretAtEnd(editor)
      } else if (caret != null) {
        placeCaretAtOffset(editor, caret)
      }
      measureMultiline()
    },
    [measureMultiline],
  )

  // Sync external value changes (improve, undo, token swap, reset) into the DOM.
  // Echoes from our own onInput are skipped so the caret never jumps while typing.
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    if (readEditorText(editor) === value) return
    paint(value, { focus: document.activeElement === editor })
  }, [value, paint])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      if (improveTimerRef.current) clearTimeout(improveTimerRef.current)
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        const editor = editorRef.current
        if (!editor) return
        editor.focus()
        placeCaretAtEnd(editor)
      },
      selectAll() {
        const editor = editorRef.current
        if (!editor) return
        editor.focus()
        selectAllContents(editor)
      },
      blur() {
        editorRef.current?.blur()
      },
    }),
    [],
  )

  const handleInput = () => {
    const editor = editorRef.current
    if (!editor || composingRef.current) return
    const text = readEditorText(editor)
    onChange(text)
    measureMultiline()
    setDropdown(null)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      const el = editorRef.current
      if (el && document.activeElement === el && !composingRef.current) {
        paint(readEditorText(el), { restoreCaret: true })
      }
    }, 650)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (composingRef.current) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    if (text) document.execCommand("insertText", false, text)
  }

  const handleBlur = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    const editor = editorRef.current
    if (!editor) return
    // Re-tokenize once the user stops editing so chips are always fresh.
    paint(readEditorText(editor))
  }

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const editor = editorRef.current
    if (!editor) return
    const chip = (e.target as HTMLElement).closest<HTMLElement>("[data-token]")
    if (!chip) {
      setDropdown(null)
      return
    }
    e.preventDefault()
    const type = chip.dataset.token as TokenType
    const tokenValue = chip.textContent ?? ""
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.setEndBefore(chip)
    const start = range.toString().length
    setDropdown({
      type,
      value: tokenValue,
      start,
      end: start + tokenValue.length,
      rect: chip.getBoundingClientRect(),
    })
  }

  const applySuggestion = (choice: string) => {
    const editor = editorRef.current
    const current = dropdown
    setDropdown(null)
    if (!editor || !current) return
    const text = readEditorText(editor)
    const next = text.slice(0, current.start) + choice + text.slice(current.end)
    editor.focus()
    onChange(next)
  }

  const handleImprove = () => {
    const editor = editorRef.current
    if (!editor || improving || disabled) return
    const raw = readEditorText(editor).trim()
    if (!raw) return
    prevTextRef.current = readEditorText(editor)
    setImproving(true)
    setDropdown(null)
    if (improveTimerRef.current) clearTimeout(improveTimerRef.current)
    improveTimerRef.current = setTimeout(() => {
      setImproving(false)
      editorRef.current?.focus()
      onChange(improvePrompt(prevTextRef.current ?? raw))
      setUndoVisible(true)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => setUndoVisible(false), 5000)
    }, 750)
  }

  const handleUndo = () => {
    if (prevTextRef.current == null) return
    setUndoVisible(false)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    editorRef.current?.focus()
    onChange(prevTextRef.current)
  }

  const showImprove = value.trim().length > 0 && !disabled
  const showPlaceholder = value.length === 0

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex gap-3 px-4 py-3",
          multiline ? "items-start" : "items-center",
        )}
      >
        <Search
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            multiline && "mt-2",
          )}
        />

        <div className="relative min-w-0 flex-1">
          {showPlaceholder && (
            <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none text-base leading-7 text-muted-foreground/70">
              {placeholder}
            </span>
          )}
          <div
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-label={placeholder}
            contentEditable={!disabled}
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={handleBlur}
            onClick={handleEditorClick}
            onCompositionStart={() => {
              composingRef.current = true
            }}
            onCompositionEnd={() => {
              composingRef.current = false
              handleInput()
            }}
            className="max-h-[120px] min-h-7 w-full overflow-y-auto whitespace-pre-wrap break-words py-1.5 text-base leading-7 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          />
        </div>

        {(showImprove || actions) && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-2",
              multiline && "mt-0.5",
            )}
          >
            {showImprove ? (
              <motion.button
                type="button"
                onClick={handleImprove}
                disabled={improving}
                whileTap={{ scale: 0.96 }}
                title="Improve prompt with AI"
                className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 font-inter text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-default disabled:opacity-70"
              >
                {improving ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <EditPrompt className="size-3.5" strokeWidth={1.75} />
                )}
                Improve
              </motion.button>
            ) : null}
            {actions}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {undoVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden px-4"
          >
            <div className="flex items-center gap-1.5 pb-2.5 text-[12px] text-muted-foreground">
              <EditPrompt className="size-3 opacity-70" strokeWidth={1.75} />
              <span>Prompt improved.</span>
              <button
                type="button"
                onClick={handleUndo}
                className="cursor-pointer font-medium text-foreground underline-offset-2 hover:underline"
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {dropdown && (
        <TokenDropdown
          state={dropdown}
          suggestions={getTokenSuggestions(dropdown.value, dropdown.type)}
          onSelect={applySuggestion}
          onClose={() => setDropdown(null)}
        />
      )}
    </div>
  )
})

function TokenDropdown({
  state,
  suggestions,
  onSelect,
  onClose,
}: {
  state: DropdownState
  suggestions: string[]
  onSelect: (value: string) => void
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    const onScroll = () => onClose()
    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("keydown", onKey, true)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onClose)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("keydown", onKey, true)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onClose)
    }
  }, [onClose])

  const left = Math.min(state.rect.left, window.innerWidth - 240)

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: state.rect.bottom + 6,
        left: Math.max(8, left),
        minWidth: Math.max(state.rect.width, 180),
        zIndex: 60,
      }}
      className="overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {TOKEN_LABELS[state.type]}
      </div>
      {suggestions.length === 0 ? (
        <div className="px-2 py-1.5 text-[12px] text-muted-foreground">
          No alternatives
        </div>
      ) : (
        suggestions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
          >
            {option}
          </button>
        ))
      )}
    </motion.div>,
    document.body,
  )
}
