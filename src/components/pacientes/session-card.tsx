import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Session } from '@/types'

export function SessionCard({ session, patientId }: { session: Session; patientId: string }) {
  const dateStr = format(new Date(session.date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })
  const isFinalized = !!session.evolution_finalized_at

  return (
    <Link href={`/pacientes/${patientId}/sessoes/${session.id}`}>
      <Card className="transition-shadow hover:shadow-md active:scale-[0.99]">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {dateStr} · {session.session_type === 'quick' ? 'Sessão rápida' : 'Sessão completa'}
              {session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
            </p>
            <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
              {session.spo2_before != null && session.spo2_after != null && (
                <span>SpO₂: {session.spo2_before}% → {session.spo2_after}%</span>
              )}
              {session.borg_before != null && session.borg_after != null && (
                <span>Borg: {session.borg_before} → {session.borg_after}</span>
              )}
            </div>
          </div>
          <Badge variant={isFinalized ? 'success' : 'warning'} className="shrink-0">
            {isFinalized ? 'Finalizada' : 'Rascunho'}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
