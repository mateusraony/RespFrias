import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AppointmentWithPatient } from '@/types'

export function AppointmentPill({ appointment }: { appointment: AppointmentWithPatient }) {
  const color = appointment.patient_color ?? '#3B82F6'
  const cancelled = appointment.status === 'cancelled'

  return (
    <Link
      href={`/agenda/${appointment.id}/editar`}
      style={{ backgroundColor: color, borderColor: color }}
      className={cn(
        'block truncate rounded-md border px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80',
        cancelled && 'opacity-40 line-through'
      )}
    >
      {appointment.time.slice(0, 5)} · {appointment.patient_name}
    </Link>
  )
}
