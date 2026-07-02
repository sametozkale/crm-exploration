import { useEffect } from "react"

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  )
}

/** Escape closes; ArrowUp/ArrowDown mirror footer prev/next when drawer is open. */
export function useDrawerKeyboard({
  open,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onClose,
}: {
  open: boolean
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(event.target)) return

      if (event.key === "Escape") {
        onClose()
        return
      }

      if (event.key === "ArrowUp" && canGoPrevious) {
        event.preventDefault()
        onPrevious()
        return
      }

      if (event.key === "ArrowDown" && canGoNext) {
        event.preventDefault()
        onNext()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, canGoPrevious, canGoNext, onPrevious, onNext, onClose])
}
