export const dynamic = 'force-dynamic'

import { AppointmentForm } from '@/components/agenda/appointment-form'
import { getPatients } from '@/app/actions/patients'

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; patient_id?: string }>
}) {
  const { data, patient_id } = await searchParams
  const patients = await getPatients()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Novo agendamento</h1>
      <AppointmentForm patients={patients} defaultDate={data} defaultPatientId={patient_id} />
    </div>
  )
}
