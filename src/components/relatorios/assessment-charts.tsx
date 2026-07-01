'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Assessment } from '@/types'

function fmt(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function AssessmentCharts({ assessments }: { assessments: Assessment[] }) {
  if (assessments.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        São necessárias pelo menos 2 avaliações para exibir gráficos de evolução.
      </p>
    )
  }

  const data = [...assessments]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => ({
      name: fmt(a.date),
      'SpO₂ (%)': a.spo2,
      'FC (bpm)': a.heart_rate,
      'Borg': a.borg,
      'FR (irpm)': a.respiratory_rate,
      'TC6 (m)': a.six_mwt_distance,
    }))

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">SpO₂ e Frequência Cardíaca</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="SpO₂ (%)" stroke="#0d7ea8" strokeWidth={2} dot={{ r: 4 }} connectNulls />
            <Line type="monotone" dataKey="FC (bpm)" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Borg e Frequência Respiratória</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Borg" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} connectNulls />
            <Line type="monotone" dataKey="FR (irpm)" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.some((d) => d['TC6 (m)'] != null) && (
        <div>
          <p className="mb-2 text-sm font-medium">Teste de Caminhada 6 Minutos</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="TC6 (m)" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
