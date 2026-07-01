import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  format,
} from 'date-fns'

export type AgendaView = 'dia' | 'semana' | 'mes'

export function parseAgendaDate(date?: string): Date {
  if (date) {
    const parsed = new Date(date + 'T12:00:00')
    if (!isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

export function getRange(view: AgendaView, date: Date): { start: Date; end: Date } {
  if (view === 'dia') return { start: startOfDay(date), end: endOfDay(date) }
  if (view === 'semana')
    return { start: startOfWeek(date, { weekStartsOn: 0 }), end: endOfWeek(date, { weekStartsOn: 0 }) }
  // Month view: expand to full calendar grid (weeks that overlap the month boundary)
  return {
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 0 }),
  }
}

export function shiftDate(view: AgendaView, date: Date, direction: 1 | -1): Date {
  if (view === 'dia') return direction === 1 ? addDays(date, 1) : subDays(date, 1)
  if (view === 'semana') return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1)
  return direction === 1 ? addMonths(date, 1) : subMonths(date, 1)
}

export function toDateParam(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
