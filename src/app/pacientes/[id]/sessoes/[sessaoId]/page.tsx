export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EvolutionEditor } from '@/components/pacientes/evolution-editor'
import { getSession } from '@/app/actions/sessions'
import { getPatient } from '@/app/actions/patients'

export default async function SessaoPage({
  params,
}: {
  params: Promise<{ id: string; sessaoId: string }>
}) {
  const { id, sessaoId } = await params
  const [session, patient] = await Promise.all([getSession(sessaoId), getPatient(id)])
  if (!session || !patient) notFound()

  const dateStr = format(new Date(session.date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">
        Sessão de {dateStr} — {patient.name}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sinais vitais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <p>SpO₂: {session.spo2_before ?? '—'} → {session.spo2_after ?? '—'}</p>
          <p>Borg: {session.borg_before ?? '—'} → {session.borg_after ?? '—'}</p>
          <p>
            FR: {session.respiratory_rate_before ?? '—'} → {session.respiratory_rate_after ?? '—'}
          </p>
          <p>FC: {session.heart_rate_before ?? '—'} → {session.heart_rate_after ?? '—'}</p>
        </CardContent>
      </Card>

      {!!session.techniques_used?.length && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Técnicas aplicadas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{session.techniques_used.join(', ')}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <EvolutionEditor session={session} patientId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
