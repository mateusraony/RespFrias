'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
    ? format(new Date(data.date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
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

  const techniquesLine = data.techniques_used?.length
    ? `Técnicas aplicadas: ${data.techniques_used.join(', ')}.`
    : ''

  const notesLine = data.notes?.trim() ? `Observações: ${data.notes.trim()}.` : ''

  return [
    `Paciente ${patientName} realizou sessão ${typeLabel} de fisioterapia respiratória em ${dateStr}.`,
    vitals.length ? vitals.join(' | ') + '.' : '',
    techniquesLine,
    notesLine,
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
  const raw = {
    ...Object.fromEntries(formData),
    techniques_used: formData.getAll('techniques_used'),
  }
  const parsed = sessionSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const draft = generateDraft(patientName, parsed.data)
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('sessions')
    .insert({ ...parsed.data, patient_id: patientId, evolution_draft: draft })
    .select('id')
    .single()

  if (error) return { success: false, error: 'Erro ao salvar sessão.' }

  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: { id: data.id } }
}

export async function saveDraftEvolution(
  sessionId: string,
  patientId: string,
  draft: string
): Promise<ActionResult<void>> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('sessions')
    .update({ evolution_draft: draft, evolution_finalized_at: null })
    .eq('id', sessionId)
    .is('evolution_finalized_at', null) // só edita se não finalizado

  if (error) return { success: false, error: 'Erro ao salvar rascunho.' }

  revalidatePath(`/pacientes/${patientId}/sessoes/${sessionId}`)
  return { success: true, data: undefined }
}

export async function finalizeEvolution(
  sessionId: string,
  patientId: string
): Promise<ActionResult<void>> {
  const supabase = await createAdminClient()

  // Busca rascunho atual
  const { data: session } = await supabase
    .from('sessions')
    .select('evolution_draft, evolution_finalized_at')
    .eq('id', sessionId)
    .single()

  if (!session) return { success: false, error: 'Sessão não encontrada.' }
  if (session.evolution_finalized_at) {
    return { success: false, error: 'Evolução já foi finalizada.' }
  }
  if (!session.evolution_draft?.trim()) {
    return { success: false, error: 'Rascunho está vazio.' }
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('sessions')
    .update({
      evolution_final: session.evolution_draft,
      evolution_finalized_at: now,
    })
    .eq('id', sessionId)

  if (error) return { success: false, error: 'Erro ao finalizar evolução.' }

  await supabase.from('audit_logs').insert({
    entity_type: 'session',
    entity_id: sessionId,
    patient_id: patientId,
    action: 'finalize',
    new_value: { evolution_final: session.evolution_draft, finalized_at: now },
  })

  revalidatePath(`/pacientes/${patientId}/sessoes/${sessionId}`)
  revalidatePath(`/pacientes/${patientId}`)
  return { success: true, data: undefined }
}

export async function getSessions(patientId: string): Promise<Session[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
  return (data ?? []) as Session[]
}

export async function getSession(id: string): Promise<Session | null> {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('sessions').select('*').eq('id', id).single()
  return (data ?? null) as Session | null
}
