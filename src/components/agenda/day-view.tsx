import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { AppointmentPill } from './appointment-pill'
import type { AppointmentWithPatient } from '@/types'

export function DayView({
  date,
  appointments,
}: {
  date: Date
  appointments: AppointmentWithPatient[]
}) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dayAppointments = appointments
    .filter((a) => a.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        {dayAppointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum agendamento para {format(date, "dd 'de' MMMM", { locale: ptBR })}.
          </p>
        ) : (
          dayAppointments.map((a) => <AppointmentPill key={a.id} appointment={a} />)
        )}
      </CardContent>
    </Card>
  )
}
