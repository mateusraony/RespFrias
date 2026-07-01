export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Activity, CheckCircle, Clock } from 'lucide-react'
import { safeDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
            <p className="text-xs mt-1">
              Acesse um{' '}
              <Link href="/pacientes" className="text-[#0d7ea8] underline underline-offset-2">
                paciente
              </Link>{' '}
              para registrar a primeira sessão.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Sessões Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/pacientes/${s.patient_id}?tab=sessoes`}
                className="flex items-start justify-between gap-3 py-3 hover:bg-gray-50 rounded-md px-1 -mx-1 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.patient_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {safeDate(s.date)}
                    {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                    {s.spo2_before != null && s.spo2_after != null
                      ? ` · SpO₂ ${s.spo2_before}%→${s.spo2_after}%`
                      : ''}
                    {s.borg_before != null && s.borg_after != null
                      ? ` · Borg ${s.borg_before}→${s.borg_after}`
                      : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={s.session_type === 'full' ? 'default' : 'outline'} className="text-xs">
                    {s.session_type === 'full' ? 'Completa' : 'Rápida'}
                  </Badge>
                  {s.evolution_finalized_at ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle className="h-3 w-3" /> Finalizada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Clock className="h-3 w-3" /> Rascunho
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
