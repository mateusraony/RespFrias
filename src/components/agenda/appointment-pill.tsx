import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AppointmentWithPatient } from '@/types'

const STATUS_STYLES: Record<AppointmentWithPatient['status'], string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  done: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200 line-through',
}

export function AppointmentPill({ appointment }: { appointment: AppointmentWithPatient }) {
  return (
    <Link
      href={`/agenda/${appointment.id}/editar`}
      className={cn(
        'block truncate rounded-md border px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80',
        STATUS_STYLES[appointment.status]
      )}
    >
      {appointment.time.slice(0, 5)} · {appointment.patient_name}
    </Link>
  )
}
