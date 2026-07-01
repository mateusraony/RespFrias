import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import { getPaymentsByMonth } from '@/app/actions/payments'

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export async function GET(request: NextRequest) {
  const mes = request.nextUrl.searchParams.get('mes')
  const periodKey = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : format(new Date(), 'yyyy-MM')

  const payments = await getPaymentsByMonth(periodKey)

  const header = ['Paciente', 'Valor', 'Valor Pago', 'Status', 'Forma de Pagamento', 'Vencimento', 'Pago em', 'Observações']
  const rows = payments.map((p) => [
    p.patient_name,
    String(p.amount ?? ''),
    String(p.amount_paid ?? ''),
    p.status,
    p.payment_method ?? '',
    p.due_date ?? '',
    p.paid_at ?? '',
    p.notes ?? '',
  ])

  const csv = '﻿' + [header, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="financeiro-${periodKey}.csv"`,
    },
  })
}
