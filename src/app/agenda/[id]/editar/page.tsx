export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { AppointmentForm } from '@/components/agenda/appointment-form'
import { getAppointment } from '@/app/actions/appointments'
import { getPatients } from '@/app/actions/patients'

export default async function EditarAgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [appointment, patients] = await Promise.all([getAppointment(id), getPatients()])
  if (!appointment) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Editar agendamento</h1>
      <AppointmentForm patients={patients} appointment={appointment} />
    </div>
  )
}
