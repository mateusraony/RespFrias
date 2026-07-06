'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { PaymentRow } from '@/components/financeiro/payment-row'
import type { PaymentWithPatient } from '@/types'

export function PaymentsFilter({ payments }: { payments: PaymentWithPatient[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return payments
    const q = query.toLowerCase()
    return payments.filter((p) =>
      (p.patient_name ?? '').toLowerCase().includes(q)
    )
  }, [payments, query])

  return (
    <div className="space-y-2">
      {payments.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por paciente..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          {payments.length === 0 ? 'Nenhum pagamento neste mês.' : 'Nenhum pagamento encontrado.'}
        </p>
      ) : (
        filtered.map((p) => <PaymentRow key={p.id} payment={p} />)
      )}
    </div>
  )
}
