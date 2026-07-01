import { notFound } from 'next/navigation'
import { PatientForm } from '@/components/pacientes/patient-form'
import { getPatient } from '@/app/actions/patients'

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await getPatient(id)
  if (!patient) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Editar paciente</h1>
      <PatientForm patient={patient} />
    </div>
  )
}
