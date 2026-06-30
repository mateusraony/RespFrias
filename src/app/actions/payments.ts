'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
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
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('financial_closes')
    .select('closed_at, reopened_at')
    .eq('period_key', periodKey)
    .single()

  return !!data && !data.reopened_at
}

export async function createPayment(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData)
  const parsed = paymentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('payments')
    .insert({ ...parsed.data, session_id: parsed.data.session_id || null })
    .select('id')
    .single()

  if (error) return { success: false, error: 'Erro ao criar pagamento.' }

  revalidatePath('/financeiro')
  return { success: true, data: { id: data.id } }
}

export async function updatePayment(id: string, formData: FormData): Promise<ActionResult<void>> {
  const raw = Object.fromEntries(formData)
  const parsed = paymentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()

  const { data: current } = await supabase.from('payments').select('*').eq('id', id).single()

  if (await isMonthClosed(current?.due_date)) {
    return {
      success: false,
      error: 'O mês deste pagamento já foi fechado. Reabra o fechamento mensal para editar.',
    }
  }

  const status = parsed.data.status
  const paidAt = status === 'paid' ? new Date().toISOString() : current?.paid_at ?? null

  const { error } = await supabase
    .from('payments')
    .update({ ...parsed.data, session_id: parsed.data.session_id || null, paid_at: paidAt })
    .eq('id', id)

  if (error) return { success: false, error: 'Erro ao atualizar pagamento.' }

  await supabase.from('audit_logs').insert({
    entity_type: 'payment',
    entity_id: id,
    patient_id: parsed.data.patient_id,
    action: 'update',
    old_value: current,
    new_value: parsed.data,
  })

  revalidatePath('/financeiro')
  return { success: true, data: undefined }
}

export async function getPaymentsByPatient(patientId: string): Promise<Payment[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('patient_id', patientId)
    .order('due_date', { ascending: false })

  return (data ?? []) as Payment[]
}

export async function getPaymentsByMonth(periodKey: string): Promise<PaymentWithPatient[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('payments')
    .select('*, patients(name)')
    .gte('due_date', `${periodKey}-01`)
    .lt('due_date', `${periodKey}-32`)
    .order('due_date')

  return (data ?? []).map((row) => {
    const { patients, ...rest } = row as typeof row & { patients: { name: string } | null }
    return { ...rest, patient_name: patients?.name ?? 'Paciente' }
  }) as PaymentWithPatient[]
}

export async function getPayment(id: string): Promise<Payment | null> {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('payments').select('*').eq('id', id).single()
  return (data ?? null) as Payment | null
}
