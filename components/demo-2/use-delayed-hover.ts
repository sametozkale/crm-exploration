"use client"

import { useEffect, useRef, useState } from "react"

export const MENU_CLOSE_DELAY_MS = 140

export function useDelayedHover(delayMs = MENU_CLOSE_DELAY_MS) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const onEnter = () => {
    clearTimer()
    setOpen(true)
  }

  const onLeave = () => {
    clearTimer()
    timerRef.current = setTimeout(() => setOpen(false), delayMs)
  }

  useEffect(() => clearTimer, [])

  return { open, onEnter, onLeave }
}
