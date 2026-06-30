import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { PaymentStatusBadge } from '@/components/financeiro/payment-status-badge'
import type { PaymentWithPatient } from '@/types'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PaymentRow({ payment }: { payment: PaymentWithPatient }) {
  return (
    <Link href={`/financeiro/${payment.id}/editar`}>
      <Card className="transition-opacity hover:opacity-80">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
          <div>
            <p className="font-medium">{payment.patient_name}</p>
            <p className="text-muted-foreground">
              {payment.due_date
                ? format(new Date(payment.due_date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })
                : 'Sem vencimento'}
              {payment.payment_method ? ` · ${payment.payment_method}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium">{formatCurrency(Number(payment.amount))}</p>
              {payment.amount_paid != null && (
                <p className="text-xs text-muted-foreground">
                  Pago: {formatCurrency(Number(payment.amount_paid))}
                </p>
              )}
            </div>
            <PaymentStatusBadge status={payment.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
