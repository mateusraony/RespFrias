import { NextRequest, NextResponse } from 'next/server'
import { validateCronSecret } from '@/lib/cron-auth'
import { runJob } from '@/lib/job-runner'
import { sendTelegramAlert } from '@/app/actions/alerts'
import sql from '@/lib/db/client'

function prevMonthKey(): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 7) // YYYY-MM
}

export async function POST(req: NextRequest) {
  const authError = validateCronSecret(req)
  if (authError) return authError

  const periodKey = prevMonthKey()

  const result = await runJob('monthly-close', periodKey, async () => {
    const [year, month] = periodKey.split('-').map(Number)
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    const payments = await sql`
      SELECT
        COALESCE(SUM(amount), 0)::numeric AS total_expected,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_paid ELSE 0 END), 0)::numeric AS total_received
      FROM payments
      WHERE due_date >= ${start} AND due_date < ${end}
    `

    const { total_expected, total_received } = payments[0] as { total_expected: string; total_received: string }

    const existing = await sql`
      SELECT id, reopened_at FROM financial_closes WHERE period_key = ${periodKey} LIMIT 1
    `

    if (existing.length > 0 && !existing[0].reopened_at) {
      return `Month ${periodKey} already closed — skipped.`
    }

    if (existing.length > 0 && existing[0].reopened_at) {
      await sql`
        UPDATE financial_closes
        SET total_expected = ${total_expected}, total_received = ${total_received},
            closed_at = now(), reopened_at = NULL
        WHERE period_key = ${periodKey}
      `
    } else {
      await sql`
        INSERT INTO financial_closes (period_key, total_expected, total_received)
        VALUES (${periodKey}, ${total_expected}, ${total_received})
      `
    }

    const expected = Number(total_expected).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const received = Number(total_received).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    const send = await sendTelegramAlert(
      `<b>📊 RespFrias — Fechamento ${periodKey}</b>\n\nEsperado: ${expected}\nRecebido: ${received}`
    )
    if (!send.success) {
      // Log but don't fail — close was saved
      console.warn('Telegram failed:', send.error)
    }

    return `Closed ${periodKey}: expected=${total_expected} received=${total_received}`
  })

  const status = result.status === 'error' ? 500 : 200
  return NextResponse.json(result, { status })
}
