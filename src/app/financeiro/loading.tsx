export default function FinanceiroLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-7 w-28 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded bg-muted" />
          <div className="h-9 w-36 rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-9 rounded bg-muted" />
        <div className="h-9 w-28 rounded bg-muted" />
        <div className="h-9 w-9 rounded bg-muted" />
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-2 w-full rounded bg-muted" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 flex items-center justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
