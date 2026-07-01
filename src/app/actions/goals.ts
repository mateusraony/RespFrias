'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db/client'
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
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const { description, target_date, status } = parsed.data
    const rows = await sql`
      INSERT INTO goals (patient_id, description, target_date, status)
      VALUES (${patientId}, ${description}, ${target_date ?? null}, ${status ?? 'active'})
      RETURNING id
    `
    const row = rows[0]
    if (!row) return { success: false, error: 'Erro ao criar meta.' }

    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: { id: row.id as string } }
  } catch (err) {
    console.error('createGoal error:', err)
    return { success: false, error: 'Erro ao criar meta. Verifique a conexão com o banco.' }
  }
}

export async function updateGoalStatus(
  goalId: string,
  patientId: string,
  status: 'active' | 'achieved' | 'cancelled'
): Promise<ActionResult<void>> {
  try {
    await sql`UPDATE goals SET status = ${status} WHERE id = ${goalId}`
    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: undefined }
  } catch (err) {
    console.error('updateGoalStatus error:', err)
    return { success: false, error: 'Erro ao atualizar meta.' }
  }
}

export async function getGoals(patientId: string): Promise<Goal[]> {
  try {
    const rows = await sql`
      SELECT * FROM goals
      WHERE patient_id = ${patientId} AND deleted_at IS NULL
      ORDER BY created_at DESC
    `
    return rows as unknown as Goal[]
  } catch (err) {
    console.error('getGoals error:', err)
    return []
  }
}
