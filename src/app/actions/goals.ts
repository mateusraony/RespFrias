'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import type { ActionResult, Goal } from '@/types'

const goalSchema = z.object({
  description: z.string().min(3, 'Descrição é obrigatória'),
  target_date: z.string().optional(),
  status: z.enum(['active', 'achieved', 'cancelled']).optional(),
})

export async function createGoal(
  patientId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = goalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...parsed.data, patient_id: patientId })
    .select('id')
    .single()

  if (error) return { success: false, error: 'Erro ao criar meta.' }

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: { id: data.id } }
}

export async function updateGoalStatus(
  goalId: string,
  patientId: string,
  status: 'active' | 'achieved' | 'cancelled'
): Promise<ActionResult<void>> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('goals')
    .update({ status })
    .eq('id', goalId)

  if (error) return { success: false, error: 'Erro ao atualizar meta.' }

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: undefined }
}

export async function getGoals(patientId: string): Promise<Goal[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return (data ?? []) as Goal[]
}
