'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import sql from '@/lib/db/client'
import type { ActionResult, Patient } from '@/types'

const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
})

export async function createPatient(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = patientSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { name, email, phone, birth_date, diagnosis, notes } = parsed.data
  const rows = await sql`
    INSERT INTO patients (name, email, phone, birth_date, diagnosis, notes)
    VALUES (${name}, ${email || null}, ${phone ?? null}, ${birth_date ?? null}, ${diagnosis ?? null}, ${notes ?? null})
    RETURNING id
  `
  const row = rows[0]
  if (!row) return { success: false, error: 'Erro ao criar paciente.' }

  revalidatePath('/pacientes')
  return { success: true, data: { id: row.id as string } }
}

export async function updatePatient(id: string, formData: FormData): Promise<ActionResult<void>> {
  const parsed = patientSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const current = (await sql`SELECT * FROM patients WHERE id = ${id} LIMIT 1`)[0]

  const { name, email, phone, birth_date, diagnosis, notes } = parsed.data
  await sql`
    UPDATE patients
    SET name = ${name}, email = ${email || null}, phone = ${phone ?? null},
        birth_date = ${birth_date ?? null}, diagnosis = ${diagnosis ?? null}, notes = ${notes ?? null}
    WHERE id = ${id}
  `

  await sql`
    INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, new_value)
    VALUES ('patient', ${id}::uuid, ${id}::uuid, 'update', ${JSON.stringify(current)}, ${JSON.stringify(parsed.data)})
  `

  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${id}`)
  return { success: true, data: undefined }
}

export async function softDeletePatient(id: string, justification: string): Promise<ActionResult<void>> {
  if (!justification?.trim()) return { success: false, error: 'Justificativa é obrigatória.' }

  const current = (await sql`SELECT * FROM patients WHERE id = ${id} LIMIT 1`)[0]
  if (!current) return { success: false, error: 'Paciente não encontrado.' }

  await sql`UPDATE patients SET deleted_at = now() WHERE id = ${id}`

  await sql`
    INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, justification)
    VALUES ('patient', ${id}::uuid, ${id}::uuid, 'delete', ${JSON.stringify(current)}, ${justification})
  `

  revalidatePath('/pacientes')
  redirect('/pacientes')
}

export async function getPatients(search?: string): Promise<Patient[]> {
  const rows = search?.trim()
    ? await sql`SELECT * FROM patients WHERE deleted_at IS NULL AND name ILIKE ${'%' + search + '%'} ORDER BY name`
    : await sql`SELECT * FROM patients WHERE deleted_at IS NULL ORDER BY name`
  return rows as unknown as Patient[]
}

export async function getPatient(id: string): Promise<Patient | null> {
  const rows = await sql`SELECT * FROM patients WHERE id = ${id} AND deleted_at IS NULL LIMIT 1`
  return (rows[0] ?? null) as Patient | null
}
