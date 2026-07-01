'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db/client'
import type { ActionResult } from '@/types'

export interface PatientPackage {
  id: string
  patient_id: string
  total_sessions: number
  used_sessions: number
  description: string | null
  active: boolean
  created_at: string
}

const packageSchema = z.object({
  total_sessions: z.coerce.number().int().positive('Número de sessões deve ser maior que zero'),
  description: z.string().optional(),
})

export async function createPackage(
  patientId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = packageSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    // Deactivate any existing active package first
    await sql`UPDATE patient_packages SET active = false WHERE patient_id = ${patientId} AND active = true`

    const rows = await sql`
      INSERT INTO patient_packages (patient_id, total_sessions, description)
      VALUES (${patientId}, ${parsed.data.total_sessions}, ${parsed.data.description ?? null})
      RETURNING id
    `
    const row = rows[0]
    if (!row) return { success: false, error: 'Erro ao criar pacote.' }

    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: { id: row.id as string } }
  } catch (err) {
    console.error('createPackage error:', err)
    return { success: false, error: 'Erro ao criar pacote. Verifique a conexão com o banco.' }
  }
}

export async function getActivePackage(patientId: string): Promise<PatientPackage | null> {
  try {
    const rows = await sql`
      SELECT
        pk.id, pk.patient_id, pk.total_sessions, pk.description, pk.active, pk.created_at,
        COUNT(s.id)::int AS used_sessions
      FROM patient_packages pk
      LEFT JOIN sessions s ON s.patient_id = pk.patient_id AND s.created_at >= pk.created_at
      WHERE pk.patient_id = ${patientId} AND pk.active = true
      GROUP BY pk.id
      LIMIT 1
    `
    return (rows[0] ?? null) as PatientPackage | null
  } catch (err) {
    console.error('getActivePackage error:', err)
    return null
  }
}

export async function deactivatePackage(packageId: string, patientId: string): Promise<ActionResult<void>> {
  try {
    await sql`UPDATE patient_packages SET active = false WHERE id = ${packageId}`
    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: undefined }
  } catch (err) {
    console.error('deactivatePackage error:', err)
    return { success: false, error: 'Erro ao encerrar pacote.' }
  }
}
