export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Calendar, User, FileText, CreditCard } from 'lucide-react'
import { getPayment, markAsPaid } from '@/app/actions/payments'
import { getPatient } from '@/app/actions/patients'

const statusMap = {
  paid: { label: 'Pago', variant: 'success' as const },
  pending: { label: 'Pendente', variant: 'warning' as const },
  partial: { label: 'Parcial', variant: 'warning' as const },
  agreement: { label: 'Acordo', variant: 'secondary' as const },
}

function safeDate(val: unknown): string {
  if (!val) return '—'
  try {
    return format(new Date(String(val) + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })
  } catch { return '—' }
}

function brl(val: number | undefined) {
  return (val ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function PagamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payment = await getPayment(id)
  if (!payment) notFound()

  const patient = await getPatient(payment.patient_id)
  const status = statusMap[payment.status] ?? { label: payment.status, variant: 'secondary' as const }
  const isPaid = payment.status === 'paid'

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/financeiro">← Voltar</Link>
          </Button>
          <h1 className="text-xl font-semibold">Pagamento</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/financeiro/${id}/editar`}>Editar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Detalhes do Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {patient && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <Link href={`/pacientes/${patient.id}`} className="text-[#0d7ea8] hover:underline">
                {patient.name}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Valor: <strong>{brl(payment.amount)}</strong></span>
            {payment.amount_paid != null && payment.amount_paid !== payment.amount && (
              <span className="text-muted-foreground">· Pago: {brl(payment.amount_paid)}</span>
            )}
          </div>

          {payment.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Vencimento: {safeDate(payment.due_date)}</span>
            </div>
          )}

          {payment.paid_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Pago em: {safeDate(payment.paid_at)}</span>
            </div>
          )}

          {payment.payment_method && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Método: {payment.payment_method}</span>
            </div>
          )}

          {payment.notes && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{payment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isPaid && (
        <form action={async () => { 'use server'; await markAsPaid(id) }}>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Marcar como pago
          </Button>
        </form>
      )}
    </div>
  )
}
