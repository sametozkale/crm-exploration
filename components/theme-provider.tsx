'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
  type ThemeProviderProps,
} from 'next-themes'

const STORAGE_KEY = 'zero-theme'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey={STORAGE_KEY}
      themes={['light', 'dark']}
      value={{ light: 'light', dark: 'dark' }}
      enableColorScheme
      disableTransitionOnChange={false}
      {...props}
    >
      <ThemePreferenceGuard storageKey={STORAGE_KEY} />
      {children}
    </NextThemesProvider>
  )
}

/** Reset invalid legacy values (e.g. "system") when system theme is disabled. */
function ThemePreferenceGuard({ storageKey }: { storageKey: string }) {
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    if (!theme) return
    if (theme === 'light' || theme === 'dark') return
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored)
        return
      }
    } catch {
      /* ignore */
    }
    setTheme('light')
  }, [theme, setTheme, storageKey])

  return null
}
