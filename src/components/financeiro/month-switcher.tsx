'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

export function MonthSwitcher({ periodKey }: { periodKey: string }) {
  const router = useRouter()
  const date = new Date(`${periodKey}-01T12:00:00`)

  function go(nextDate: Date) {
    router.push(`/financeiro?mes=${format(nextDate, 'yyyy-MM')}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => go(subMonths(date, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <p className="min-w-[140px] text-center text-sm font-medium capitalize">
        {format(date, 'MMMM yyyy', { locale: ptBR })}
      </p>
      <Button variant="outline" size="icon" onClick={() => go(addMonths(date, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => go(new Date())}>
        Hoje
      </Button>
    </div>
  )
}
