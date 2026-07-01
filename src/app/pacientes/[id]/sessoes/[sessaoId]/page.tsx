export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/pacientes/${id}?tab=sessoes`}>← Voltar</Link>
          </Button>
          <h1 className="text-xl font-semibold">
            Sessão de {dateStr} — {patient.name}
          </h1>
        </div>
        {!session.evolution_finalized_at && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/pacientes/${id}/sessoes/${sessaoId}/editar`}>Editar sessão</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações da sessão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            <span>Tipo: {session.session_type === 'quick' ? 'Sessão rápida' : 'Sessão completa'}</span>
            {session.duration_minutes && <span>Duração: {session.duration_minutes} min</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <p>SpO₂: {session.spo2_before ?? '—'} → {session.spo2_after ?? '—'}</p>
            <p>Borg: {session.borg_before ?? '—'} → {session.borg_after ?? '—'}</p>
            <p>FR: {session.respiratory_rate_before ?? '—'} → {session.respiratory_rate_after ?? '—'}</p>
            <p>FC: {session.heart_rate_before ?? '—'} → {session.heart_rate_after ?? '—'}</p>
          </div>
          {session.notes && (
            <p className="text-muted-foreground">Observações: {session.notes}</p>
          )}
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
