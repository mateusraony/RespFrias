export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus, Download } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { MonthSwitcher } from '@/components/financeiro/month-switcher'
import { PaymentRow } from '@/components/financeiro/payment-row'
import { FinancialCloseCard } from '@/components/financeiro/financial-close-card'
import { getPaymentsByMonth } from '@/app/actions/payments'
import { getFinancialClose } from '@/app/actions/financial-close'

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const periodKey = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : format(new Date(), 'yyyy-MM')

  const [payments, financialClose] = await Promise.all([
    getPaymentsByMonth(periodKey),
    getFinancialClose(periodKey),
  ])

  const totalExpected = payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const totalReceived = payments.reduce((sum, p) => {
    if (p.status === 'paid') return sum + Number(p.amount_paid ?? p.amount ?? 0)
    if (p.status === 'partial') return sum + Number(p.amount_paid ?? 0)
    return sum
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Financeiro</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/financeiro/export?mes=${periodKey}`}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </a>
          </Button>
          <Button asChild>
            <Link href="/financeiro/pagamentos/novo">
              <Plus className="h-4 w-4" />
              Novo pagamento
            </Link>
          </Button>
        </div>
      </div>

      <MonthSwitcher periodKey={periodKey} />

      <FinancialCloseCard
        periodKey={periodKey}
        financialClose={financialClose}
        totalExpected={totalExpected}
        totalReceived={totalReceived}
      />

      <div className="space-y-2">
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pagamento neste mês.</p>
        ) : (
          payments.map((p) => <PaymentRow key={p.id} payment={p} />)
        )}
      </div>
    </div>
  )
}
