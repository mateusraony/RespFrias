'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import type { ActionResult, Patient } from '@/types'

const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
})

export async function createPatient(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData)
  const parsed = patientSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...parsed.data, email: parsed.data.email || null })
    .select('id')
    .single()

  if (error) return { success: false, error: 'Erro ao criar paciente.' }

  revalidatePath('/pacientes')
  return { success: true, data: { id: data.id } }
}

export async function updatePatient(
  id: string,
  formData: FormData
): Promise<ActionResult<void>> {
  const raw = Object.fromEntries(formData)
  const parsed = patientSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()

  // Fetch current for audit
  const { data: current } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('patients')
    .update({ ...parsed.data, email: parsed.data.email || null })
    .eq('id', id)

  if (error) return { success: false, error: 'Erro ao atualizar paciente.' }

  await supabase.from('audit_logs').insert({
    entity_type: 'patient',
    entity_id: id,
    patient_id: id,
    action: 'update',
    old_value: current,
    new_value: parsed.data,
  })

  revalidatePath(`/pacientes/${id}`)
  revalidatePath('/pacientes')
  return { success: true, data: undefined }
}

export async function softDeletePatient(
  id: string,
  justification: string
): Promise<ActionResult<void>> {
  if (!justification?.trim()) {
    return { success: false, error: 'Justificativa é obrigatória.' }
  }

  const supabase = await createAdminClient()

  const { data: current } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('patients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: 'Erro ao remover paciente.' }

  await supabase.from('audit_logs').insert({
    entity_type: 'patient',
    entity_id: id,
    patient_id: id,
    action: 'delete',
    old_value: current,
    justification,
  })

  revalidatePath('/pacientes')
  redirect('/pacientes')
}

export async function getPatients(search?: string): Promise<Patient[]> {
  const supabase = await createAdminClient()
  let query = supabase
    .from('patients')
    .select('*')
    .is('deleted_at', null)
    .order('name')

  if (search?.trim()) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data } = await query
  return (data ?? []) as Patient[]
}

export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return (data ?? null) as Patient | null
}
