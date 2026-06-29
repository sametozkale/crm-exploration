import Link from "next/link"
import { ZeroWordmark } from "@/components/zero-wordmark"
import { Button } from "@/components/ui/button"

export default function DemoSelectorPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-background px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <ZeroWordmark className="h-7 w-auto text-foreground" />
        <div className="space-y-1.5">
          <h1 className="font-sans text-xl font-semibold tracking-[-0.02em] text-foreground">
            Lead Search demos
          </h1>
          <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Demo 1 is the baseline. Demo 2 is an independent copy for experiments
            with prompt states, motion, and transitions.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="min-w-[148px] font-inter">
          <Link href="/demo-1">Demo 1</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="min-w-[148px] font-inter"
        >
          <Link href="/demo-2">Demo 2</Link>
        </Button>
      </div>
    </main>
  )
}
