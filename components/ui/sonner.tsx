'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-right"
      offset={24}
      closeButton={false}
      className="toaster group"
      toastOptions={{
        style: {
          width: 'fit-content',
          maxWidth: 'min(100%, calc(100vw - 3rem))',
          minHeight: 'unset',
          height: 'auto',
          padding: '8px 14px',
        },
        classNames: {
          toast:
            'group toast !h-auto !min-h-0 w-fit shrink-0 max-w-[min(100%,calc(100vw-3rem))] flex-nowrap items-center gap-0 rounded-lg border font-inter text-[13px] bg-background text-foreground border-border shadow-lg',
          title:
            '!m-0 max-w-none shrink-0 overflow-hidden text-ellipsis whitespace-nowrap p-0 text-[13px] font-medium leading-none text-foreground',
          description: 'text-muted-foreground',
          content: 'shrink-0',
          icon: '!hidden !size-0 !p-0',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
