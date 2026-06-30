import { addDays, format, startOfWeek, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { AppointmentPill } from './appointment-pill'
import type { AppointmentWithPatient } from '@/types'

export function WeekView({
  date,
  appointments,
}: {
  date: Date
  appointments: AppointmentWithPatient[]
}) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayAppointments = appointments
          .filter((a) => a.date === dateStr)
          .sort((a, b) => a.time.localeCompare(b.time))

        return (
          <div
            key={dateStr}
            className={cn(
              'rounded-lg border bg-white p-2',
              isSameDay(day, new Date()) && 'border-[#0d7ea8]'
            )}
          >
            <p className="mb-2 text-center text-xs font-medium capitalize text-muted-foreground">
              {format(day, 'EEE dd', { locale: ptBR })}
            </p>
            <div className="space-y-1">
              {dayAppointments.length === 0 ? (
                <p className="text-center text-[11px] text-muted-foreground">—</p>
              ) : (
                dayAppointments.map((a) => <AppointmentPill key={a.id} appointment={a} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
