'use client'

import { useState, useMemo } from 'react'
import { SessionCard } from '@/components/pacientes/session-card'
import type { Session } from '@/types'

const PERIOD_CHIPS = [
  { label: 'Último mês', days: 30 },
  { label: '3 meses', days: 90 },
  { label: '6 meses', days: 180 },
]

const TYPE_CHIPS = [
  { label: 'Rápida', value: 'quick' },
  { label: 'Completa', value: 'full' },
]

export function PatientSessionsFilter({
  sessions,
  patientId,
}: {
  sessions: Session[]
  patientId: string
}) {
  const [period, setPeriod] = useState<number | null>(null)
  const [type, setType] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = sessions
    if (period !== null) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - period)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      list = list.filter((s) => s.date >= cutoffStr)
    }
    if (type !== null) {
      list = list.filter((s) => s.session_type === type)
    }
    return list
  }, [sessions, period, type])

  return (
    <div className="space-y-2">
      {sessions.length > 5 && (
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_CHIPS.map(({ label, days }) => (
            <button
              key={label}
              type="button"
              onClick={() => setPeriod(period === days ? null : days)}
              className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                period === days
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-input hover:bg-accent'
              }`}
            >
              {label}
            </button>
          ))}
          {TYPE_CHIPS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(type === value ? null : value)}
              className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                type === value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-input hover:bg-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-1">Nenhuma sessão neste filtro.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <SessionCard key={s.id} session={s} patientId={patientId} />
          ))}
          {filtered.length < sessions.length && (
            <p className="text-xs text-muted-foreground text-right">
              {filtered.length} de {sessions.length} sessões
            </p>
          )}
        </div>
      )}
    </div>
  )
}
