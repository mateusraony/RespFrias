export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewSwitcher } from '@/components/agenda/view-switcher'
import { DayView } from '@/components/agenda/day-view'
import { WeekView } from '@/components/agenda/week-view'
import { MonthView } from '@/components/agenda/month-view'
import { getAppointmentsByRange } from '@/app/actions/appointments'
import { parseAgendaDate, getRange, toDateParam, type AgendaView } from '@/lib/agenda'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; data?: string }>
}) {
  const { view: rawView, data } = await searchParams
  const view: AgendaView = rawView === 'dia' || rawView === 'mes' ? rawView : 'semana'
  const date = parseAgendaDate(data)
  const { start, end } = getRange(view, date)

  const appointments = await getAppointmentsByRange(toDateParam(start), toDateParam(end))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Agenda</h1>
        <Button asChild>
          <Link href={`/agenda/nova?data=${toDateParam(date)}`}>
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Link>
        </Button>
      </div>

      <ViewSwitcher view={view} date={date} />

      {view === 'dia' && <DayView date={date} appointments={appointments} />}
      {view === 'semana' && <WeekView date={date} appointments={appointments} />}
      {view === 'mes' && <MonthView date={date} appointments={appointments} />}
    </div>
  )
}
