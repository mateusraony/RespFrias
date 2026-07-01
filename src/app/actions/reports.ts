'use server'

import { revalidatePath } from 'next/cache'
import sql from '@/lib/db/client'
import type { ActionResult, Report, ReportContent } from '@/types'
import { getPatient } from './patients'
import { getClinicalFile, getAssessments } from './assessments'
import { getSessions } from './sessions'
import { getGoals } from './goals'

export async function getAllReports(): Promise<(Report & { patient_name: string })[]> {
  try {
    const rows = await sql`
      SELECT r.*, p.name AS patient_name
      FROM reports r
      JOIN patients p ON p.id = r.patient_id
      WHERE p.deleted_at IS NULL
      ORDER BY r.created_at DESC
    `
    return rows as unknown as (Report & { patient_name: string })[]
  } catch (err) {
    console.error('getAllReports error:', err)
    return []
  }
}

export async function getReports(patientId: string): Promise<Report[]> {
  try {
    const rows = await sql`
      SELECT * FROM reports WHERE patient_id = ${patientId} ORDER BY created_at DESC
    `
    return rows as unknown as Report[]
  } catch (err) {
    console.error('getReports error:', err)
    return []
  }
}

export async function getReport(id: string): Promise<Report | null> {
  try {
    const rows = await sql`SELECT * FROM reports WHERE id = ${id} LIMIT 1`
    return (rows[0] ?? null) as Report | null
  } catch (err) {
    console.error('getReport error:', err)
    return null
  }
}

export async function generateReport(patientId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const [patient, clinicalFile, assessments, sessions, goals] = await Promise.all([
      getPatient(patientId),
      getClinicalFile(patientId),
      getAssessments(patientId),
      getSessions(patientId),
      getGoals(patientId),
    ])

    if (!patient) return { success: false, error: 'Paciente não encontrado.' }

    const content: ReportContent = {
      patient,
      clinicalFile: clinicalFile ?? undefined,
      assessments,
      sessions,
      goals,
      generatedAt: new Date().toISOString(),
    }

    const title = `Relatório — ${patient.name} — ${new Date().toLocaleDateString('pt-BR')}`

    const rows = await sql`
      INSERT INTO reports (patient_id, title, status, content)
      VALUES (${patientId}, ${title}, 'draft', ${JSON.stringify(content)})
      RETURNING id
    `
    const row = rows[0]
    if (!row) return { success: false, error: 'Erro ao gerar relatório.' }

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, new_value)
      VALUES ('report', ${row.id}::uuid, ${patientId}::uuid, 'create', ${JSON.stringify({ title, status: 'draft' })})
    `

    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: { id: row.id as string } }
  } catch (err) {
    console.error('generateReport error:', err)
    return { success: false, error: `Erro ao gerar relatório: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function approveReport(reportId: string, patientId: string): Promise<ActionResult<void>> {
  try {
    const report = await getReport(reportId)
    if (!report) return { success: false, error: 'Relatório não encontrado.' }
    if (report.status === 'approved') return { success: false, error: 'Relatório já aprovado.' }

    await sql`
      UPDATE reports SET status = 'approved', approved_at = now() WHERE id = ${reportId}
    `
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action, old_value, new_value)
      VALUES ('report', ${reportId}::uuid, ${patientId}::uuid, 'update',
        ${JSON.stringify({ status: 'draft' })},
        ${JSON.stringify({ status: 'approved' })})
    `
    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: undefined }
  } catch (err) {
    console.error('approveReport error:', err)
    return { success: false, error: 'Erro ao aprovar relatório.' }
  }
}

export async function deleteReport(reportId: string, patientId: string): Promise<ActionResult<void>> {
  try {
    await sql`DELETE FROM reports WHERE id = ${reportId}`
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, patient_id, action)
      VALUES ('report', ${reportId}::uuid, ${patientId}::uuid, 'delete')
    `
    revalidatePath(`/pacientes/${patientId}`)
    return { success: true, data: undefined }
  } catch (err) {
    console.error('deleteReport error:', err)
    return { success: false, error: 'Erro ao excluir relatório.' }
  }
}
