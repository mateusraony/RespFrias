export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AssessmentFormEdit } from '@/components/pacientes/assessment-form-edit'
import { getAssessments } from '@/app/actions/assessments'
import { getPatient } from '@/app/actions/patients'

export default async function EditarAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string; avaliacaoId: string }>
}) {
  const { id, avaliacaoId } = await params
  const [assessments, patient] = await Promise.all([getAssessments(id), getPatient(id)])
  const assessment = assessments.find((a) => a.id === avaliacaoId)
  if (!assessment || !patient) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/pacientes/${id}?tab=avaliacoes`}>← Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar avaliação — {patient.name}</h1>
      </div>
      <AssessmentFormEdit assessment={assessment} patientId={id} />
    </div>
  )
}
