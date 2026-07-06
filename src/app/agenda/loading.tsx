export default function AgendaLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="h-7 w-24 rounded bg-muted" />
        <div className="h-9 w-36 rounded bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-9 rounded bg-muted" />
        <div className="h-9 w-32 rounded bg-muted" />
        <div className="h-9 w-9 rounded bg-muted" />
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-2">
            <div className="h-12 w-12 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
