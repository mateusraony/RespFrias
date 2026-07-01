'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AppointmentWithPatient } from '@/types'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function MiniCalendar({
  appointments = [],
}: {
  appointments?: AppointmentWithPatient[]
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const router = useRouter()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // Group appointments by day number for current month/year
  const byDay = new Map<number, AppointmentWithPatient[]>()
  for (const appt of appointments) {
    if (!appt.date) continue
    const d = new Date(appt.date + 'T12:00:00')
    if (d.getFullYear() === year && d.getMonth() === month && appt.status !== 'cancelled') {
      const day = d.getDate()
      if (!byDay.has(day)) byDay.set(day, [])
      byDay.get(day)!.push(appt)
    }
  }

  // Selected day appointments
  const selectedAppts = selectedDay ? (byDay.get(selectedDay) ?? []) : []

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  function handleDayClick(day: number) {
    setSelectedDay(day)
  }

  function goToAgenda(day: number) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    router.push(`/agenda?view=dia&data=${year}-${mm}-${dd}`)
  }

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const appts = byDay.get(day) ?? []
          const isSelected = selectedDay === day
          const todayFlag = isToday(day)
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => handleDayClick(day)}
                className={`w-7 h-7 text-xs rounded-full flex items-center justify-center transition-colors
                  ${todayFlag ? 'bg-[#0d7ea8] text-white font-bold'
                    : isSelected ? 'bg-[#0d7ea8]/15 text-[#0d7ea8] font-semibold ring-1 ring-[#0d7ea8]/40'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {day}
              </button>
              {/* Appointment dots */}
              {appts.length > 0 && (
                <div className="flex gap-0.5">
                  {appts.slice(0, 3).map((a, idx) => (
                    <span
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: a.patient_color ?? '#0d7ea8' }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected day appointments */}
      {selectedDay && selectedAppts.length > 0 && (
        <div className="border-t pt-3 space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            {String(selectedDay).padStart(2, '0')}/{String(month + 1).padStart(2, '0')}
          </p>
          {selectedAppts
            .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
            .map((appt) => (
              <button
                key={appt.id}
                onClick={() => goToAgenda(selectedDay)}
                className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 text-left transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: appt.patient_color ?? '#0d7ea8' }}
                />
                <span className="text-xs font-medium text-gray-500 w-9 shrink-0">
                  {appt.time?.slice(0, 5) ?? '—'}
                </span>
                <span className="text-xs text-gray-800 truncate">{appt.patient_name}</span>
              </button>
            ))}
          <button
            onClick={() => goToAgenda(selectedDay)}
            className="w-full text-[11px] text-[#0d7ea8] hover:underline text-right pt-0.5"
          >
            Ver na agenda →
          </button>
        </div>
      )}

      {selectedDay && selectedAppts.length === 0 && (
        <div className="border-t pt-3 text-center text-xs text-gray-400 py-1">
          Sem agendamentos neste dia
        </div>
      )}
    </div>
  )
}
