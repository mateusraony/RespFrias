export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { safeDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAssessments } from '@/app/actions/assessments'
import { getPatient } from '@/app/actions/patients'

const typeMap: Record<string, string> = {
  initial: 'Avaliação Inicial',
  progress: 'Reavaliação',
  discharge: 'Alta',
}


function Row({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value == null) return null
  return (
    <div className="flex justify-between text-sm py-1.5 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default async function AvaliacaoPage({
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/pacientes/${id}?tab=avaliacoes`}>← Voltar</Link>
          </Button>
          <h1 className="text-xl font-semibold">
            {typeMap[assessment.assessment_type] ?? assessment.assessment_type} — {patient.name}
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/pacientes/${id}/avaliacoes/${avaliacaoId}/editar`}>Editar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Dados da Avaliação</span>
            <Badge variant="outline">{safeDate(assessment.date)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Tipo" value={typeMap[assessment.assessment_type] ?? assessment.assessment_type} />
          <Row label="SpO₂" value={assessment.spo2 != null ? `${assessment.spo2}%` : undefined} />
          <Row label="Escala de Borg" value={assessment.borg} />
          <Row label="Frequência Respiratória" value={assessment.respiratory_rate != null ? `${assessment.respiratory_rate} irpm` : undefined} />
          <Row label="Frequência Cardíaca" value={assessment.heart_rate != null ? `${assessment.heart_rate} bpm` : undefined} />
          <Row label="Escala MRC" value={assessment.mrc_scale} />
          <Row label="TC6 (Teste de caminhada)" value={assessment.six_mwt_distance != null ? `${assessment.six_mwt_distance} m` : undefined} />
        </CardContent>
      </Card>

      {assessment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{assessment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
