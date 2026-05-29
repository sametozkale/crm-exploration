'use client'

import type { CSSProperties } from 'react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-right"
      closeButton={false}
      className="toaster group"
      style={
        {
          '--width': 'max-content',
        } as CSSProperties
      }
      toastOptions={{
        style: {
          width: 'max-content',
          maxWidth: 'min(100%, calc(100vw - 3rem))',
          minHeight: 'unset',
          height: 'auto',
          padding: '6px 12px',
        },
        classNames: {
          toast:
            'group toast !h-auto !min-h-0 !w-max max-w-[min(100%,calc(100vw-3rem))] items-center !gap-0 rounded-lg border font-inter text-[11px] group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          title: '!m-0 !p-0 text-[11px] font-medium leading-none group-[.toast]:text-foreground',
          description: 'group-[.toast]:text-muted-foreground',
          icon: '!hidden !size-0 !p-0',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
