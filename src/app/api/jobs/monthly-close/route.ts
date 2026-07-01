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

    // Upsert with ON CONFLICT to prevent race conditions from concurrent cron calls.
    // If already closed (reopened_at IS NULL), skip silently via DO NOTHING + check.
    const upsertResult = await sql`
      INSERT INTO financial_closes (period_key, total_expected, total_received)
      VALUES (${periodKey}, ${total_expected}, ${total_received})
      ON CONFLICT (period_key) DO UPDATE
        SET total_expected = EXCLUDED.total_expected,
            total_received = EXCLUDED.total_received,
            closed_at = now(),
            reopened_at = NULL
        WHERE financial_closes.reopened_at IS NOT NULL
      RETURNING id, reopened_at
    `

    if (upsertResult.length === 0) {
      return `Month ${periodKey} already closed — skipped.`
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
