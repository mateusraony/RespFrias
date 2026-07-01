'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Session } from '@/types'

interface ChartPoint {
  date: string
  spo2_before?: number
  spo2_after?: number
  borg_before?: number
  borg_after?: number
  respiratory_rate_before?: number
  respiratory_rate_after?: number
  heart_rate_before?: number
  heart_rate_after?: number
}

function safeDate(val: unknown): string {
  if (!val) return '—'
  try {
    return format(new Date(String(val) + 'T12:00:00'), 'dd/MM', { locale: ptBR })
  } catch { return '—' }
}

function MiniChart({
  data,
  lines,
  title,
  unit,
  domain,
}: {
  data: ChartPoint[]
  lines: { key: keyof ChartPoint; color: string; label: string }[]
  title: string
  unit: string
  domain?: [number, number]
}) {
  const hasData = data.some((d) => lines.some((l) => d[l.key] != null))
  if (!hasData) return null

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={domain} unit={unit} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(v: number) => [`${v}${unit}`]}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          {lines.map((l) => (
            <Line
              key={l.key as string}
              type="monotone"
              dataKey={l.key as string}
              stroke={l.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={l.label}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SessionCharts({ sessions }: { sessions: Session[] }) {
  const data: ChartPoint[] = [...sessions]
    .reverse()
    .map((s) => ({
      date: safeDate(s.date),
      spo2_before: s.spo2_before ?? undefined,
      spo2_after: s.spo2_after ?? undefined,
      borg_before: s.borg_before ?? undefined,
      borg_after: s.borg_after ?? undefined,
      respiratory_rate_before: s.respiratory_rate_before ?? undefined,
      respiratory_rate_after: s.respiratory_rate_after ?? undefined,
      heart_rate_before: s.heart_rate_before ?? undefined,
      heart_rate_after: s.heart_rate_after ?? undefined,
    }))

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <MiniChart
        data={data}
        title="SpO₂ (%)"
        unit="%"
        domain={[80, 100]}
        lines={[
          { key: 'spo2_before', color: '#f59e0b', label: 'Antes' },
          { key: 'spo2_after', color: '#10b981', label: 'Depois' },
        ]}
      />
      <MiniChart
        data={data}
        title="Borg (esforço)"
        unit=""
        domain={[0, 10]}
        lines={[
          { key: 'borg_before', color: '#f59e0b', label: 'Antes' },
          { key: 'borg_after', color: '#10b981', label: 'Depois' },
        ]}
      />
      <MiniChart
        data={data}
        title="FR (irpm)"
        unit=" irpm"
        lines={[
          { key: 'respiratory_rate_before', color: '#f59e0b', label: 'Antes' },
          { key: 'respiratory_rate_after', color: '#10b981', label: 'Depois' },
        ]}
      />
      <MiniChart
        data={data}
        title="FC (bpm)"
        unit=" bpm"
        lines={[
          { key: 'heart_rate_before', color: '#f59e0b', label: 'Antes' },
          { key: 'heart_rate_after', color: '#10b981', label: 'Depois' },
        ]}
      />
    </div>
  )
}
