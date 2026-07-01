'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import sql from '@/lib/db/client'
import type { ActionResult, Session } from '@/types'

const sessionSchema = z.object({
  session_type: z.enum(['quick', 'full']),
  date: z.string().min(1, 'Data é obrigatória'),
  duration_minutes: z.coerce.number().optional(),
  spo2_before: z.coerce.number().optional(),
  spo2_after: z.coerce.number().optional(),
  borg_before: z.coerce.number().optional(),
  borg_after: z.coerce.number().optional(),
  respiratory_rate_before: z.coerce.number().optional(),
  respiratory_rate_after: z.coerce.number().optional(),
  heart_rate_before: z.coerce.number().optional(),
  heart_rate_after: z.coerce.number().optional(),
  techniques_used: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

function generateDraft(patientName: string, data: z.infer<typeof sessionSchema>): string {
  const dateStr = data.date
    ? format(new Date(data.date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })
    : ''
  const typeLabel = data.session_type === 'quick' ? 'rápida' : 'completa'
  const vitals: string[] = []
  if (data.spo2_before != null && data.spo2_after != null)
    vitals.push(`SpO₂: ${data.spo2_before}% → ${data.spo2_after}%`)
  if (data.borg_before != null && data.borg_after != null)
    vitals.push(`Borg: ${data.borg_before} → ${data.borg_after}`)
  if (data.respiratory_rate_before != null && data.respiratory_rate_after != null)
    vitals.push(`FR: ${data.respiratory_rate_before} → ${data.respiratory_rate_after} irpm`)
  if (data.heart_rate_before != null && data.heart_rate_after != null)
    vitals.push(`FC: ${data.heart_rate_before} → ${data.heart_rate_after} bpm`)
  return [
    `Paciente ${patientName} realizou sessão ${typeLabel} de fisioterapia respiratória em ${dateStr}.`,
    vitals.length ? vitals.join(' | ') + '.' : '',
    data.techniques_used?.length ? `Técnicas aplicadas: ${data.techniques_used.join(', ')}.` : '',
    data.notes?.trim() ? `Observações: ${data.notes.trim()}.` : '',
    'Conduta para próxima sessão: [a preencher]',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function createSession(
  patientId: string,
  patientName: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = { ...Object.fromEntries(formData), techniques_used: formData.getAll('techniques_used') }
  const parsed = sessionSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const draft = generateDraft(patientName, parsed.data)
  const {
    session_type, date, duration_minutes, spo2_before, spo2_after,
    borg_before, borg_after, respiratory_rate_before, respiratory_rate_after,
    heart_rate_before, heart_rate_after, techniques_used, notes,
  } = parsed.data

  const rows = await sql`
    INSERT INTO sessions
      (patient_id, session_type, date, duration_minutes, spo2_before, spo2_after,
       borg_before, borg_after, respiratory_rate_before, respiratory_rate_after,
       heart_rate_before, heart_rate_after, techniques_used, notes, evolution_draft)
    VALUES
      (${patientId}, ${session_type}, ${date}, ${duration_minutes ?? null},
       ${spo2_before ?? null}, ${spo2_after ?? null}, ${borg_before ?? null}, ${borg_after ?? null},
       ${respiratory_rate_before ?? null}, ${respiratory_rate_after ?? null},
       ${heart_rate_before ?? null}, ${heart_rate_after ?? null},
       ${techniques_used?.length ? sql`${techniques_used}` : sql`'{}'::text[]`},
       ${notes ?? null}, ${draft})
    RETURNING id
  `
  const row = rows[0]
  if (!row) return { success: false, error: 'Erro ao salvar sessão.' }

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: { id: row.id as string } }
}

export async function saveDraftEvolution(
  sessionId: string,
  patientId: string,
  draft: string
): Promise<ActionResult<void>> {
  await sql`
    UPDATE sessions
    SET evolution_draft = ${draft}, evolution_finalized_at = NULL
    WHERE id = ${sessionId} AND evolution_finalized_at IS NULL
  `
  revalidatePath(`/pacientes/${patientId}/sessoes/${sessionId}`)
  return { success: true, data: undefined }
}

export async function finalizeEvolution(sessionId: string, patientId: string): Promise<ActionResult<void>> {
  const rows = await sql`
    SELECT evolution_draft, evolution_finalized_at FROM sessions WHERE id = ${sessionId} LIMIT 1
  `
  const session = rows[0]
  if (!session) return { success: false, error: 'Sessão não encontrada.' }
  if (session.evolution_finalized_at) return { success: false, error: 'Evolução já foi finalizada.' }
  if (!session.evolution_draft?.trim()) return { success: false, error: 'Rascunho está vazio.' }

  const now = new Date().toISOString()
  await sql`
    UPDATE sessions
    SET evolution_final = ${session.evolution_draft as string},
        evolution_finalized_at = ${now}
    WHERE id = ${sessionId}
  `

  await sql`
    INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, new_value)
    VALUES ('session', ${sessionId}::uuid, ${patientId}::uuid, 'finalize',
            ${JSON.stringify({ evolution_final: session.evolution_draft, finalized_at: now })})
  `

  revalidatePath(`/pacientes/${patientId}/sessoes/${sessionId}`)
  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: undefined }
}

export async function getSessions(patientId: string): Promise<Session[]> {
  try {
    const rows = await sql`
      SELECT * FROM sessions WHERE patient_id = ${patientId} ORDER BY date DESC
    `
    return rows as unknown as Session[]
  } catch (err) {
    console.error('getSessions error:', err)
    return []
  }
}

export async function getSession(id: string): Promise<Session | null> {
  try {
    const rows = await sql`SELECT * FROM sessions WHERE id = ${id} LIMIT 1`
    return (rows[0] ?? null) as Session | null
  } catch (err) {
    console.error('getSession error:', err)
    return null
  }
}
