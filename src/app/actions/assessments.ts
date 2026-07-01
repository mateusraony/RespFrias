'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db/client'
import type { ActionResult, Assessment, ClinicalFile } from '@/types'

const assessmentSchema = z.object({
  assessment_type: z.enum(['initial', 'periodic']),
  date: z.string().min(1, 'Data é obrigatória'),
  spo2: z.coerce.number().min(0).max(100).optional(),
  borg: z.coerce.number().min(0).max(10).optional(),
  respiratory_rate: z.coerce.number().optional(),
  heart_rate: z.coerce.number().optional(),
  mrc_scale: z.coerce.number().min(0).max(5).optional(),
  six_mwt_distance: z.coerce.number().optional(),
  notes: z.string().optional(),
})

const clinicalFileSchema = z.object({
  diagnosis_detail: z.string().optional(),
  history: z.string().optional(),
  current_medications: z.string().optional(),
  allergies: z.string().optional(),
  precautions: z.string().optional(),
})

export async function createAssessment(
  patientId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = assessmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const { assessment_type, date, spo2, borg, respiratory_rate, heart_rate, mrc_scale, six_mwt_distance, notes } = parsed.data
    const rows = await sql`
      INSERT INTO assessments
        (patient_id, assessment_type, date, spo2, borg, respiratory_rate, heart_rate, mrc_scale, six_mwt_distance, notes)
      VALUES
        (${patientId}, ${assessment_type}, ${date}, ${spo2 ?? null}, ${borg ?? null},
         ${respiratory_rate ?? null}, ${heart_rate ?? null}, ${mrc_scale ?? null},
         ${six_mwt_distance ?? null}, ${notes ?? null})
      RETURNING id
    `
    const row = rows[0]
    if (!row) return { success: false, error: 'Erro ao salvar avaliação.' }

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, new_value)
      VALUES ('assessment', ${row.id as string}::uuid, ${patientId}::uuid, 'create',
              ${JSON.stringify(parsed.data)})
    `
    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: { id: row.id as string } }
  } catch (err) {
    console.error('createAssessment error:', err)
    return { success: false, error: 'Erro ao salvar avaliação. Verifique a conexão com o banco.' }
  }
}

export async function updateAssessment(
  assessmentId: string,
  patientId: string,
  formData: FormData
): Promise<ActionResult<void>> {
  const parsed = assessmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const current = (await sql`SELECT * FROM assessments WHERE id = ${assessmentId} LIMIT 1`)[0]
    const { assessment_type, date, spo2, borg, respiratory_rate, heart_rate, mrc_scale, six_mwt_distance, notes } = parsed.data
    await sql`
      UPDATE assessments SET
        assessment_type = ${assessment_type}, date = ${date}, spo2 = ${spo2 ?? null},
        borg = ${borg ?? null}, respiratory_rate = ${respiratory_rate ?? null},
        heart_rate = ${heart_rate ?? null}, mrc_scale = ${mrc_scale ?? null},
        six_mwt_distance = ${six_mwt_distance ?? null}, notes = ${notes ?? null}
      WHERE id = ${assessmentId}
    `
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, new_value)
      VALUES ('assessment', ${assessmentId}::uuid, ${patientId}::uuid, 'update',
              ${JSON.stringify(current)}, ${JSON.stringify(parsed.data)})
    `
    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: undefined }
  } catch (err) {
    console.error('updateAssessment error:', err)
    return { success: false, error: 'Erro ao atualizar avaliação. Verifique a conexão com o banco.' }
  }
}

export async function getAssessments(patientId: string): Promise<Assessment[]> {
  try {
    const rows = await sql`
      SELECT * FROM assessments WHERE patient_id = ${patientId} ORDER BY date DESC
    `
    return rows as unknown as Assessment[]
  } catch (err) {
    console.error('getAssessments error:', err)
    return []
  }
}

export async function saveClinicalFile(patientId: string, formData: FormData): Promise<ActionResult<void>> {
  const parsed = clinicalFileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const { diagnosis_detail, history, current_medications, allergies, precautions } = parsed.data
    const existing = (await sql`SELECT * FROM clinical_files WHERE patient_id = ${patientId} LIMIT 1`)[0]
    const upserted = await sql`
      INSERT INTO clinical_files (patient_id, diagnosis_detail, history, current_medications, allergies, precautions)
      VALUES (${patientId}, ${diagnosis_detail ?? null}, ${history ?? null}, ${current_medications ?? null},
              ${allergies ?? null}, ${precautions ?? null})
      ON CONFLICT (patient_id) DO UPDATE SET
        diagnosis_detail = EXCLUDED.diagnosis_detail,
        history = EXCLUDED.history,
        current_medications = EXCLUDED.current_medications,
        allergies = EXCLUDED.allergies,
        precautions = EXCLUDED.precautions
      RETURNING id
    `
    const fileId = upserted[0]?.id as string ?? patientId
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, new_value)
      VALUES ('clinical_file', ${fileId}::uuid, ${patientId}::uuid,
              ${existing ? 'update' : 'create'}, ${JSON.stringify(existing ?? null)}, ${JSON.stringify(parsed.data)})
    `
    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: undefined }
  } catch (err) {
    console.error('saveClinicalFile error:', err)
    return { success: false, error: 'Erro ao salvar ficha clínica. Verifique a conexão com o banco.' }
  }
}

export async function getClinicalFile(patientId: string): Promise<ClinicalFile | null> {
  try {
    const rows = await sql`SELECT * FROM clinical_files WHERE patient_id = ${patientId} LIMIT 1`
    return (rows[0] ?? null) as ClinicalFile | null
  } catch (err) {
    console.error('getClinicalFile error:', err)
    return null
  }
}
