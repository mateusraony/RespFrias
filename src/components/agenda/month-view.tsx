import Link from 'next/link'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { AppointmentPill } from './appointment-pill'
import type { AppointmentWithPatient } from '@/types'

const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function MonthView({
  date,
  appointments,
}: {
  date: Date
  appointments: AppointmentWithPatient[]
}) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days: Date[] = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
    <div className="min-w-[560px]">
      <div className="grid grid-cols-7 border-b bg-gray-50 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-2 capitalize">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayAppointments = appointments
            .filter((a) => a.date === dateStr)
            .sort((a, b) => a.time.localeCompare(b.time))

          return (
            <div
              key={dateStr}
              className={cn(
                'min-h-[90px] border-b border-r p-1.5 last:border-r-0',
                !isSameMonth(day, date) && 'bg-gray-50/60 text-muted-foreground',
                isSameDay(day, new Date()) && 'bg-[#0d7ea8]/5'
              )}
            >
              <p className="mb-1 text-xs font-medium">{format(day, 'd')}</p>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((a) => (
                  <AppointmentPill key={a.id} appointment={a} />
                ))}
                {dayAppointments.length > 3 && (
                  <Link
                    href={`/agenda?view=dia&data=${dateStr}`}
                    className="block text-[11px] text-[#0d7ea8] hover:underline"
                  >
                    +{dayAppointments.length - 3} mais
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </div>
  )
}
