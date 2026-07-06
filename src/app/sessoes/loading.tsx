export default function SessoesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="h-7 w-24 rounded bg-muted" />
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <div className="h-5 w-36 rounded bg-muted" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-56 rounded bg-muted" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
