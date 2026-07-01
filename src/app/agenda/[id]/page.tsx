export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, FileText } from 'lucide-react'
import { getAppointment } from '@/app/actions/appointments'
import { getPatient } from '@/app/actions/patients'

const statusMap = {
  confirmed: { label: 'Confirmado', variant: 'success' as const },
  pending: { label: 'Pendente', variant: 'warning' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
  done: { label: 'Concluído', variant: 'secondary' as const },
}

export default async function AgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const appointment = await getAppointment(id)
  if (!appointment) notFound()

  const patient = await getPatient(appointment.patient_id)

  const dateStr = format(new Date(appointment.date + 'T12:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const status = statusMap[appointment.status] ?? { label: appointment.status, variant: 'secondary' as const }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/agenda">← Voltar</Link>
          </Button>
          <h1 className="text-xl font-semibold">Agendamento</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/agenda/${id}/editar`}>Editar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Detalhes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="capitalize">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{appointment.time?.slice(0, 5) ?? '—'}{appointment.duration_minutes ? ` · ${appointment.duration_minutes} min` : ''}</span>
          </div>
          {patient && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <Link href={`/pacientes/${patient.id}`} className="text-[#0d7ea8] hover:underline">
                {patient.name}
              </Link>
            </div>
          )}
          {appointment.notes && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{appointment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {patient && (
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/pacientes/${patient.id}`}>Ver prontuário</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/pacientes/${patient.id}/sessoes/nova?appointmentId=${id}`}>Registrar sessão</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
