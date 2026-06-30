'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
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
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('assessments')
    .insert({ ...parsed.data, patient_id: patientId })
    .select('id')
    .single()

  if (error) return { success: false, error: 'Erro ao salvar avaliação.' }

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: { id: data.id } }
}

export async function getAssessments(patientId: string): Promise<Assessment[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('assessments')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
  return (data ?? []) as Assessment[]
}

export async function saveClinicalFile(
  patientId: string,
  formData: FormData
): Promise<ActionResult<void>> {
  const parsed = clinicalFileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()

  // Upsert — um paciente tem exatamente uma ficha clínica
  const { error } = await supabase
    .from('clinical_files')
    .upsert({ ...parsed.data, patient_id: patientId }, { onConflict: 'patient_id' })

  if (error) return { success: false, error: 'Erro ao salvar ficha clínica.' }

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: undefined }
}

export async function getClinicalFile(patientId: string): Promise<ClinicalFile | null> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('clinical_files')
    .select('*')
    .eq('patient_id', patientId)
    .single()
  return (data ?? null) as ClinicalFile | null
}
