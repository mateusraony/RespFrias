'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db/client'
import type { ActionResult, Assessment, ClinicalFile } from '@/types'

const assessmentSchema = z.object({
  assessment_type: z.enum(['initial', 'periodic']),
  date: z.string().min(1, 'Data é obrigatória'),
  spo2: z.coerce.number().optional(),
  borg: z.coerce.number().optional(),
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

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: { id: row.id as string } }
}

export async function getAssessments(patientId: string): Promise<Assessment[]> {
  const rows = await sql`
    SELECT * FROM assessments WHERE patient_id = ${patientId} ORDER BY date DESC
  `
  return rows as unknown as Assessment[]
}

export async function saveClinicalFile(patientId: string, formData: FormData): Promise<ActionResult<void>> {
  const parsed = clinicalFileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { diagnosis_detail, history, current_medications, allergies, precautions } = parsed.data
  await sql`
    INSERT INTO clinical_files (patient_id, diagnosis_detail, history, current_medications, allergies, precautions)
    VALUES (${patientId}, ${diagnosis_detail ?? null}, ${history ?? null}, ${current_medications ?? null},
            ${allergies ?? null}, ${precautions ?? null})
    ON CONFLICT (patient_id) DO UPDATE SET
      diagnosis_detail = EXCLUDED.diagnosis_detail,
      history = EXCLUDED.history,
      current_medications = EXCLUDED.current_medications,
      allergies = EXCLUDED.allergies,
      precautions = EXCLUDED.precautions
  `

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: undefined }
}

export async function getClinicalFile(patientId: string): Promise<ClinicalFile | null> {
  const rows = await sql`SELECT * FROM clinical_files WHERE patient_id = ${patientId} LIMIT 1`
  return (rows[0] ?? null) as ClinicalFile | null
}
