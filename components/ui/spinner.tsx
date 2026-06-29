import { Loader2Icon } from '@/components/icons'

import { cn } from '@/lib/utils'

function Spinner({
  className,
  strokeWidth,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      strokeWidth={typeof strokeWidth === 'string' ? Number(strokeWidth) : strokeWidth}
      {...props}
    />
  )
}

export { Spinner }
