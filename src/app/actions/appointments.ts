'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db/client'
import type { ActionResult, Appointment, AppointmentWithPatient } from '@/types'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  duration_minutes: z.coerce.number().optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'done']).optional(),
  notes: z.string().optional(),
})

export async function createAppointment(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const { patient_id, date, time, duration_minutes, status, notes } = parsed.data
    const rows = await sql`
      INSERT INTO appointments (patient_id, date, time, duration_minutes, status, notes)
      VALUES (${patient_id}, ${date}, ${time}, ${duration_minutes ?? 50}, ${status ?? 'pending'}, ${notes ?? null})
      RETURNING id
    `
    const row = rows[0]
    if (!row) return { success: false, error: 'Erro ao criar agendamento.' }

    revalidatePath('/agenda')
    return { success: true, data: { id: row.id as string } }
  } catch (err) {
    console.error('createAppointment error:', err)
    return { success: false, error: 'Erro ao salvar agendamento. Verifique a conexão com o banco.' }
  }
}

export async function updateAppointment(id: string, formData: FormData): Promise<ActionResult<void>> {
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  try {
    const { patient_id, date, time, duration_minutes, status, notes } = parsed.data
    await sql`
      UPDATE appointments
      SET patient_id = ${patient_id}, date = ${date}, time = ${time},
          duration_minutes = ${duration_minutes ?? 50}, status = ${status ?? 'pending'}, notes = ${notes ?? null}
      WHERE id = ${id}
    `
    revalidatePath('/agenda')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('updateAppointment error:', err)
    return { success: false, error: 'Erro ao atualizar agendamento. Verifique a conexão com o banco.' }
  }
}

export async function updateAppointmentStatus(id: string, status: Appointment['status']): Promise<ActionResult<void>> {
  try {
    await sql`UPDATE appointments SET status = ${status} WHERE id = ${id}`
    revalidatePath('/agenda')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('updateAppointmentStatus error:', err)
    return { success: false, error: 'Erro ao atualizar status.' }
  }
}

export async function cancelAppointment(id: string, justification: string): Promise<ActionResult<void>> {
  if (!justification?.trim()) return { success: false, error: 'Justificativa é obrigatória.' }

  try {
    const current = (await sql`SELECT * FROM appointments WHERE id = ${id} LIMIT 1`)[0]
    await sql`UPDATE appointments SET status = 'cancelled' WHERE id = ${id}`
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, new_value, justification)
      VALUES ('appointment', ${id}::uuid, ${current?.patient_id ?? null}::uuid, 'update',
              ${JSON.stringify(current)}, ${JSON.stringify({ status: 'cancelled' })}, ${justification})
    `
    revalidatePath('/agenda')
    return { success: true, data: undefined }
  } catch (err) {
    console.error('cancelAppointment error:', err)
    return { success: false, error: 'Erro ao cancelar agendamento. Verifique a conexão com o banco.' }
  }
}

export async function getAppointmentsByRange(startDate: string, endDate: string): Promise<AppointmentWithPatient[]> {
  try {
    const rows = await sql`
      SELECT a.*, p.name AS patient_name
      FROM appointments a
      LEFT JOIN patients p ON p.id = a.patient_id
      WHERE a.deleted_at IS NULL AND a.date >= ${startDate} AND a.date <= ${endDate}
      ORDER BY a.date, a.time
    `
    return rows as unknown as AppointmentWithPatient[]
  } catch (err) {
    console.error('getAppointmentsByRange error:', err)
    return []
  }
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  try {
    const rows = await sql`
      SELECT * FROM appointments
      WHERE patient_id = ${patientId} AND deleted_at IS NULL
      ORDER BY date DESC, time DESC
    `
    return rows as unknown as Appointment[]
  } catch (err) {
    console.error('getAppointmentsByPatient error:', err)
    return []
  }
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  try {
    const rows = await sql`
      SELECT * FROM appointments WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
    `
    return (rows[0] ?? null) as Appointment | null
  } catch (err) {
    console.error('getAppointment error:', err)
    return null
  }
}
