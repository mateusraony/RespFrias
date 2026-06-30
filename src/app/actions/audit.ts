'use server'

import sql from '@/lib/db/client'
import type { AuditLog } from '@/types'

export async function getAuditLogs(patientId: string): Promise<AuditLog[]> {
  const rows = await sql`
    SELECT * FROM audit_logs
    WHERE patient_id = ${patientId}
    ORDER BY created_at DESC
  `
  return rows as unknown as AuditLog[]
}
