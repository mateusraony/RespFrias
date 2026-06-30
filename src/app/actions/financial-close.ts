'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { ActionResult, FinancialClose } from '@/types'

export async function getFinancialClose(periodKey: string): Promise<FinancialClose | null> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('financial_closes')
    .select('*')
    .eq('period_key', periodKey)
    .single()
  return (data ?? null) as FinancialClose | null
}

export async function closeMonth(periodKey: string): Promise<ActionResult<void>> {
  const supabase = await createAdminClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, amount_paid')
    .gte('due_date', `${periodKey}-01`)
    .lt('due_date', `${periodKey}-32`)

  const totalExpected = (payments ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const totalReceived = (payments ?? []).reduce((sum, p) => sum + Number(p.amount_paid ?? 0), 0)

  const { data: existing } = await supabase
    .from('financial_closes')
    .select('id')
    .eq('period_key', periodKey)
    .single()

  if (existing) {
    return { success: false, error: 'Este mês já possui um fechamento.' }
  }

  const { data, error } = await supabase
    .from('financial_closes')
    .insert({
      period_key: periodKey,
      total_expected: totalExpected,
      total_received: totalReceived,
      closed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) return { success: false, error: 'Erro ao fechar o mês.' }

  await supabase.from('audit_logs').insert({
    entity_type: 'financial_close',
    entity_id: data.id,
    action: 'finalize',
    new_value: { period_key: periodKey, total_expected: totalExpected, total_received: totalReceived },
  })

  revalidatePath('/financeiro')
  return { success: true, data: undefined }
}

export async function reopenMonth(
  periodKey: string,
  justification: string
): Promise<ActionResult<void>> {
  if (!justification?.trim()) {
    return { success: false, error: 'Justificativa é obrigatória.' }
  }

  const supabase = await createAdminClient()

  const { data: current } = await supabase
    .from('financial_closes')
    .select('*')
    .eq('period_key', periodKey)
    .single()

  if (!current) return { success: false, error: 'Fechamento não encontrado.' }

  const { error } = await supabase
    .from('financial_closes')
    .update({ reopened_at: new Date().toISOString() })
    .eq('id', current.id)

  if (error) return { success: false, error: 'Erro ao reabrir o mês.' }

  await supabase.from('audit_logs').insert({
    entity_type: 'financial_close',
    entity_id: current.id,
    action: 'reopen',
    old_value: current,
    justification,
  })

  revalidatePath('/financeiro')
  return { success: true, data: undefined }
}
