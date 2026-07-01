'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db/client'
import type { ActionResult, Payment, PaymentWithPatient } from '@/types'

const paymentSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  session_id: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  amount_paid: z.coerce.number().optional(),
  status: z.enum(['paid', 'pending', 'partial', 'agreement']).optional(),
  payment_method: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
})

async function isMonthClosed(dueDate?: string): Promise<boolean> {
  if (!dueDate) return false
  const periodKey = dueDate.slice(0, 7)
  try {
    const rows = await sql`
      SELECT closed_at, reopened_at FROM financial_closes WHERE period_key = ${periodKey} LIMIT 1
    `
    const row = rows[0]
    return !!row && !row.reopened_at
  } catch {
    return false
  }
}

export async function createPayment(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const { patient_id, session_id, amount, amount_paid, status, payment_method, due_date, notes } = parsed.data
    const rows = await sql`
      INSERT INTO payments (patient_id, session_id, amount, amount_paid, status, payment_method, due_date, notes)
      VALUES (${patient_id}, ${session_id || null}, ${amount}, ${amount_paid ?? null},
              ${status ?? 'pending'}, ${payment_method ?? null}, ${due_date ?? null}, ${notes ?? null})
      RETURNING id
    `
    const row = rows[0]
    if (!row) return { success: false, error: 'Erro ao criar pagamento.' }

    revalidatePath('/financeiro')
    return { success: true, data: { id: row.id as string } }
  } catch (err) {
    console.error('createPayment error:', err)
    return { success: false, error: 'Erro ao criar pagamento. Verifique a conexão com o banco.' }
  }
}

export async function updatePayment(id: string, formData: FormData): Promise<ActionResult<void>> {
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const current = (await sql`SELECT * FROM payments WHERE id = ${id} LIMIT 1`)[0]

    if (await isMonthClosed(current?.due_date as string | undefined)) {
      return { success: false, error: 'O mês deste pagamento já foi fechado. Reabra o fechamento mensal para editar.' }
    }

    const { patient_id, session_id, amount, amount_paid, status, payment_method, due_date, notes } = parsed.data
    const paidAt = status === 'paid' ? new Date().toISOString() : (current?.paid_at ?? null)

    await sql`
      UPDATE payments
      SET patient_id = ${patient_id}, session_id = ${session_id || null}, amount = ${amount},
          amount_paid = ${amount_paid ?? null}, status = ${status ?? 'pending'},
          payment_method = ${payment_method ?? null}, due_date = ${due_date ?? null},
          notes = ${notes ?? null}, paid_at = ${paidAt as string | null}
      WHERE id = ${id}
    `
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, new_value)
      VALUES ('payment', ${id}::uuid, ${patient_id}::uuid, 'update',
              ${JSON.stringify(current)}, ${JSON.stringify(parsed.data)})
    `
    revalidatePath('/financeiro')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('updatePayment error:', err)
    return { success: false, error: 'Erro ao atualizar pagamento. Verifique a conexão com o banco.' }
  }
}

export async function getPaymentsByPatient(patientId: string): Promise<Payment[]> {
  try {
    const rows = await sql`
      SELECT * FROM payments WHERE patient_id = ${patientId} ORDER BY due_date DESC
    `
    return rows as unknown as Payment[]
  } catch (err) {
    console.error('getPaymentsByPatient error:', err)
    return []
  }
}

export async function getPaymentsByMonth(periodKey: string): Promise<PaymentWithPatient[]> {
  try {
    const start = `${periodKey}-01`
    const [y, m] = periodKey.split('-').map(Number)
    const end = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
    const rows = await sql`
      SELECT p.*, pt.name AS patient_name
      FROM payments p
      LEFT JOIN patients pt ON pt.id = p.patient_id
      WHERE p.due_date >= ${start} AND p.due_date < ${end}
      ORDER BY p.due_date
    `
    return rows as unknown as PaymentWithPatient[]
  } catch (err) {
    console.error('getPaymentsByMonth error:', err)
    return []
  }
}

export async function markAsPaid(id: string): Promise<ActionResult<void>> {
  try {
    const current = (await sql`SELECT * FROM payments WHERE id = ${id} LIMIT 1`)[0]
    if (!current) return { success: false, error: 'Pagamento não encontrado.' }

    if (await isMonthClosed(current?.due_date as string | undefined)) {
      return { success: false, error: 'O mês deste pagamento já foi fechado.' }
    }

    const now = new Date().toISOString()
    await sql`
      UPDATE payments SET status = 'paid', amount_paid = amount, paid_at = ${now} WHERE id = ${id}
    `
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, new_value)
      VALUES ('payment', ${id}::uuid, ${current.patient_id as string}::uuid, 'update',
              ${JSON.stringify(current)}, ${JSON.stringify({ status: 'paid' })})
    `
    revalidatePath('/financeiro')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('markAsPaid error:', err)
    return { success: false, error: 'Erro ao marcar como pago.' }
  }
}

export async function getPayment(id: string): Promise<Payment | null> {
  try {
    const rows = await sql`SELECT * FROM payments WHERE id = ${id} LIMIT 1`
    return (rows[0] ?? null) as Payment | null
  } catch (err) {
    console.error('getPayment error:', err)
    return null
  }
}
