"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

const LIGHT_COLOR = "#fafafa"
const DARK_COLOR = "#0a0a0a"

export function ThemeColorMeta() {
  const { theme, resolvedTheme } = useTheme()
  const activeTheme = theme === "light" || theme === "dark" ? theme : resolvedTheme

  useEffect(() => {
    const color = activeTheme === "dark" ? DARK_COLOR : LIGHT_COLOR
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement("meta")
      meta.setAttribute("name", "theme-color")
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", color)
  }, [activeTheme])

  return null
}
