'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { shiftDate, toDateParam, type AgendaView } from '@/lib/agenda'

const VIEWS: { key: AgendaView; label: string }[] = [
  { key: 'dia', label: 'Dia' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
]

export function ViewSwitcher({ view, date }: { view: AgendaView; date: Date }) {
  const router = useRouter()

  function go(nextView: AgendaView, nextDate: Date) {
    router.push(`/agenda?view=${nextView}&data=${toDateParam(nextDate)}`)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => go(view, shiftDate(view, date, -1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="min-w-[140px] text-center text-sm font-medium capitalize">
          {format(date, view === 'mes' ? 'MMMM yyyy' : "dd 'de' MMMM yyyy", { locale: ptBR })}
        </p>
        <Button variant="outline" size="icon" onClick={() => go(view, shiftDate(view, date, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => go(view, new Date())}>
          Hoje
        </Button>
      </div>
      <div className="flex gap-1 rounded-md border bg-white p-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => go(v.key, date)}
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium transition-colors',
              view === v.key ? 'bg-[#0d7ea8] text-white' : 'text-muted-foreground hover:bg-gray-100'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
