export const dynamic = 'force-dynamic'

import { Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SessionsFilter } from '@/components/sessoes/sessions-filter'
import sql from '@/lib/db/client'

interface SessionRow {
  id: string
  patient_id: string
  patient_name: string
  session_type: 'quick' | 'full'
  date: string
  duration_minutes: number | null
  spo2_before: number | null
  spo2_after: number | null
  borg_before: number | null
  borg_after: number | null
  evolution_finalized_at: string | null
  created_at: string
}

async function getRecentSessions(): Promise<SessionRow[]> {
  try {
    const rows = await sql`
      SELECT s.id, s.patient_id, pt.name AS patient_name,
             s.session_type, s.date, s.duration_minutes,
             s.spo2_before, s.spo2_after, s.borg_before, s.borg_after,
             s.evolution_finalized_at, s.created_at
      FROM sessions s
      JOIN patients pt ON pt.id = s.patient_id AND pt.deleted_at IS NULL
      ORDER BY s.date DESC, s.created_at DESC
      LIMIT 50
    `
    return rows as unknown as SessionRow[]
  } catch {
    return []
  }
}


export default async function SessoesPage() {
  const sessions = await getRecentSessions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Sessões</h1>
        <Badge variant="outline">{sessions.length} recentes</Badge>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Activity className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">Nenhuma sessão registrada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <SessionsFilter sessions={sessions} />
      )}
    </div>
  )
}
