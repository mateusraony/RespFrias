'use server'

import { revalidatePath } from 'next/cache'
import sql from '@/lib/db/client'
import type { ActionResult, FinancialClose } from '@/types'

export async function getFinancialClose(periodKey: string): Promise<FinancialClose | null> {
  try {
    const rows = await sql`SELECT * FROM financial_closes WHERE period_key = ${periodKey} LIMIT 1`
    return (rows[0] ?? null) as FinancialClose | null
  } catch (err) {
    console.error('getFinancialClose error:', err)
    return null
  }
}

export async function closeMonth(periodKey: string): Promise<ActionResult<void>> {
  try {
    const start = `${periodKey}-01`
    const end = `${periodKey}-32`

    const payments = await sql`
      SELECT amount, amount_paid FROM payments WHERE due_date >= ${start} AND due_date < ${end}
    `
    const totalExpected = payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
    const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount_paid ?? 0), 0)

    const existing = (await sql`SELECT id FROM financial_closes WHERE period_key = ${periodKey} LIMIT 1`)[0]
    if (existing) return { success: false, error: 'Este mês já possui um fechamento.' }

    const rows = await sql`
      INSERT INTO financial_closes (period_key, total_expected, total_received, closed_at)
      VALUES (${periodKey}, ${totalExpected}, ${totalReceived}, ${new Date().toISOString()})
      RETURNING id
    `
    const row = rows[0]
    if (!row) return { success: false, error: 'Erro ao fechar o mês.' }

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, new_value)
      VALUES ('financial_close', ${row.id as string}::uuid, 'finalize',
              ${JSON.stringify({ period_key: periodKey, total_expected: totalExpected, total_received: totalReceived })})
    `
    revalidatePath('/financeiro')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('closeMonth error:', err)
    return { success: false, error: 'Erro ao fechar o mês. Verifique a conexão com o banco.' }
  }
}

export async function reopenMonth(periodKey: string, justification: string): Promise<ActionResult<void>> {
  if (!justification?.trim()) return { success: false, error: 'Justificativa é obrigatória.' }

  try {
    const current = (await sql`SELECT * FROM financial_closes WHERE period_key = ${periodKey} LIMIT 1`)[0]
    if (!current) return { success: false, error: 'Fechamento não encontrado.' }

    await sql`UPDATE financial_closes SET reopened_at = ${new Date().toISOString()} WHERE id = ${current.id}`
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, old_value, justification)
      VALUES ('financial_close', ${current.id as string}::uuid, 'reopen',
              ${JSON.stringify(current)}, ${justification})
    `
    revalidatePath('/financeiro')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('reopenMonth error:', err)
    return { success: false, error: 'Erro ao reabrir o mês. Verifique a conexão com o banco.' }
  }
}
