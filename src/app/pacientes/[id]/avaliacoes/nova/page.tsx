import { notFound } from 'next/navigation'
import { AssessmentForm } from '@/components/pacientes/assessment-form'
import { getPatient } from '@/app/actions/patients'

export default async function NovaAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await getPatient(id)
  if (!patient) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Nova avaliação — {patient.name}</h1>
      <AssessmentForm patientId={id} />
    </div>
  )
}
