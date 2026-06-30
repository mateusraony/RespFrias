'use server'

import { createAdminClient } from '@/lib/supabase/server'
import type { AuditLog } from '@/types'

export async function getAuditLogs(patientId: string): Promise<AuditLog[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  return (data ?? []) as AuditLog[]
}
