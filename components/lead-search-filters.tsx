"use client"

import { describeFilterQuery } from "@/lib/filter-query"
import { fromLegacyFilters } from "@/lib/search-filters"
import { SAVED_SEARCHES, type SavedSearch } from "@/lib/saved-searches"
import { cn } from "@/lib/utils"

const ROW_FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"

function savedSearchSummary(search: SavedSearch): string {
  const labels = describeFilterQuery(fromLegacyFilters(search.filters))
  if (labels.length > 0) {
    return labels.slice(0, 3).join(" · ")
  }
  if (search.prompt?.trim()) return search.prompt.trim()
  return "No filters"
}

export function SavedSearchesPanel({
  onRun,
}: {
  onRun: (id: string) => void
}) {
  return (
    <div className="py-4">
      <h2 className="font-inter text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Saved searches
      </h2>

      <ul className="mt-3 grid gap-2">
        {SAVED_SEARCHES.map((search) => (
          <li key={search.id}>
            <button
              type="button"
              onClick={() => onRun(search.id)}
              className={cn(
                "group flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-border/60 bg-white p-3.5 text-left dark:bg-card",
                "transition-[border-color,transform] duration-150 ease-out",
                "hover:border-border/80 dark:hover:border-border/70",
                "active:scale-[0.995]",
                ROW_FOCUS_RING,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 font-sans text-[13px] font-medium leading-snug tracking-[-0.01em] text-foreground">
                  {search.name}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {search.newSinceLastRun != null &&
                  search.newSinceLastRun > 0 ? (
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-inter text-[10px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                      +{search.newSinceLastRun} new
                    </span>
                  ) : null}
                  <span className="rounded-md bg-muted/50 px-1.5 py-0.5 font-inter text-[10px] font-medium tabular-nums text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                    {search.resultCount.toLocaleString()} results
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3">
                <p className="min-w-0 flex-1 truncate font-inter text-[11px] leading-relaxed text-muted-foreground">
                  {savedSearchSummary(search)}
                </p>
                <span className="shrink-0 font-inter text-[11px] tabular-nums text-muted-foreground/45 transition-colors group-hover:text-muted-foreground">
                  {search.lastRunLabel}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
