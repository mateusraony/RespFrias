'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import type { AppointmentWithPatient } from '@/types'

export function AppointmentPill({ appointment }: { appointment: AppointmentWithPatient }) {
  const color = appointment.patient_color ?? '#3B82F6'
  const cancelled = appointment.status === 'cancelled'
  const done = appointment.status === 'done'
  const [marking, setMarking] = useState(false)
  const [markedDone, setMarkedDone] = useState(done)

  async function handleMarkDone(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (markedDone || marking) return
    setMarking(true)
    const result = await updateAppointmentStatus(appointment.id, 'done')
    setMarking(false)
    if (result.success) setMarkedDone(true)
  }

  return (
    <div className="group relative">
      <Link
        href={`/agenda/${appointment.id}/editar`}
        style={{ backgroundColor: color, borderColor: color }}
        className={cn(
          'block truncate rounded-md border px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80',
          cancelled && 'opacity-40 line-through',
          markedDone && 'opacity-70'
        )}
      >
        {appointment.time.slice(0, 5)} · {appointment.patient_name}
        {markedDone && ' ✓'}
      </Link>
      {!cancelled && !markedDone && (
        <button
          type="button"
          onClick={handleMarkDone}
          disabled={marking}
          title="Marcar como realizado"
          className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center h-5 w-5 rounded-full bg-white/30 hover:bg-white/50 text-white text-xs leading-none transition-colors"
        >
          ✓
        </button>
      )}
    </div>
  )
}
