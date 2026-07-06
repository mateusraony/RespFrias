'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Activity, CheckCircle, Clock, Search } from 'lucide-react'
import { safeDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

const PERIOD_CHIPS = [
  { label: 'Hoje', days: 0 },
  { label: 'Esta semana', days: 7 },
  { label: 'Este mês', days: 30 },
]

export function SessionsFilter({ sessions }: { sessions: SessionRow[] }) {
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<number | null>(null)

  const filtered = useMemo(() => {
    let list = sessions
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) => s.patient_name.toLowerCase().includes(q))
    }
    if (period !== null) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - period)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      list = list.filter((s) => s.date >= cutoffStr)
    }
    return list
  }, [sessions, query, period])

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por paciente..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-1.5 shrink-0">
          {PERIOD_CHIPS.map(({ label, days }) => (
            <button
              key={label}
              type="button"
              onClick={() => setPeriod(period === days ? null : days)}
              className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                period === days
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-input hover:bg-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Activity className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">Nenhuma sessão encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Sessões Recentes
              {filtered.length !== sessions.length && (
                <Badge variant="outline" className="ml-auto text-xs">{filtered.length} de {sessions.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {filtered.map((s) => (
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
    </>
  )
}
