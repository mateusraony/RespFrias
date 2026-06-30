'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import type { ActionResult, Appointment, AppointmentWithPatient } from '@/types'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  duration_minutes: z.coerce.number().optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'done']).optional(),
  notes: z.string().optional(),
})

export async function createAppointment(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('appointments')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { success: false, error: 'Erro ao criar agendamento.' }

  revalidatePath('/agenda')
  return { success: true, data: { id: data.id } }
}

export async function updateAppointment(
  id: string,
  formData: FormData
): Promise<ActionResult<void>> {
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createAdminClient()
  const { error } = await supabase.from('appointments').update(parsed.data).eq('id', id)

  if (error) return { success: false, error: 'Erro ao atualizar agendamento.' }

  revalidatePath('/agenda')
  return { success: true, data: undefined }
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<ActionResult<void>> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)

  if (error) return { success: false, error: 'Erro ao atualizar status.' }

  revalidatePath('/agenda')
  return { success: true, data: undefined }
}

export async function cancelAppointment(
  id: string,
  justification: string
): Promise<ActionResult<void>> {
  if (!justification?.trim()) {
    return { success: false, error: 'Justificativa é obrigatória.' }
  }

  const supabase = await createAdminClient()

  const { data: current } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) return { success: false, error: 'Erro ao cancelar agendamento.' }

  await supabase.from('audit_logs').insert({
    entity_type: 'appointment',
    entity_id: id,
    patient_id: current?.patient_id,
    action: 'update',
    old_value: current,
    new_value: { status: 'cancelled' },
    justification,
  })

  revalidatePath('/agenda')
  return { success: true, data: undefined }
}

export async function getAppointmentsByRange(
  startDate: string,
  endDate: string
): Promise<AppointmentWithPatient[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .is('deleted_at', null)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('time')

  return (data ?? []).map((row) => {
    const { patients, ...rest } = row as typeof row & { patients: { name: string } | null }
    return { ...rest, patient_name: patients?.name ?? 'Paciente' }
  }) as AppointmentWithPatient[]
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  return (data ?? []) as Appointment[]
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return (data ?? null) as Appointment | null
}
