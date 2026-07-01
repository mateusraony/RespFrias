'use client'

import { useState } from 'react'
import type { Session } from '@/types'

interface VitalConfig {
  key: 'spo2' | 'borg' | 'respiratory_rate' | 'heart_rate'
  label: string
  unit: string
  icon: string
  chips: number[]
  step: string
  min: string
  max: string
  normalRange: string
  getStatus: (v: number) => 'good' | 'warn' | 'danger' | null
}

const VITALS: VitalConfig[] = [
  {
    key: 'spo2',
    label: 'Saturação de O₂',
    unit: '%',
    icon: '🫁',
    chips: [90, 92, 93, 94, 95, 96, 97, 98, 99],
    step: '1', min: '0', max: '100',
    normalRange: 'Normal: ≥ 95%',
    getStatus: (v) => v >= 95 ? 'good' : v >= 92 ? 'warn' : 'danger',
  },
  {
    key: 'borg',
    label: 'Escala de Borg',
    unit: '/10',
    icon: '😮‍💨',
    chips: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    step: '0.5', min: '0', max: '10',
    normalRange: 'Leve: 0–2 · Moderado: 3–5 · Intenso: 6+',
    getStatus: (v) => v <= 2 ? 'good' : v <= 5 ? 'warn' : 'danger',
  },
  {
    key: 'respiratory_rate',
    label: 'Frequência Respiratória',
    unit: ' irpm',
    icon: '🌬️',
    chips: [12, 14, 16, 18, 20, 22, 24, 26, 28],
    step: '1', min: '0', max: '60',
    normalRange: 'Normal adulto: 12–20 irpm',
    getStatus: (v) => v >= 12 && v <= 20 ? 'good' : v <= 24 ? 'warn' : 'danger',
  },
  {
    key: 'heart_rate',
    label: 'Frequência Cardíaca',
    unit: ' bpm',
    icon: '❤️',
    chips: [55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110],
    step: '1', min: '0', max: '220',
    normalRange: 'Normal: 60–100 bpm',
    getStatus: (v) => v >= 60 && v <= 100 ? 'good' : v >= 50 && v <= 120 ? 'warn' : 'danger',
  },
]

const STATUS_COLORS = {
  good: 'bg-emerald-500 text-white',
  warn: 'bg-amber-400 text-white',
  danger: 'bg-red-500 text-white',
}

const STATUS_BORDER = {
  good: 'border-emerald-200 bg-emerald-50/40',
  warn: 'border-amber-200 bg-amber-50/40',
  danger: 'border-red-200 bg-red-50/40',
}

type Phase = 'before' | 'after'
type FieldKey = `${'spo2' | 'borg' | 'respiratory_rate' | 'heart_rate'}_${'before' | 'after'}`

function getInitial(session: Partial<Session> | undefined, key: FieldKey): string {
  const val = session?.[key as keyof Session]
  return val != null ? String(val) : ''
}

function VitalCard({ vital, before, after, onBefore, onAfter }: {
  vital: VitalConfig
  before: string
  after: string
  onBefore: (v: string) => void
  onAfter: (v: string) => void
}) {
  const beforeNum = parseFloat(before)
  const afterNum = parseFloat(after)
  const beforeStatus = !isNaN(beforeNum) ? vital.getStatus(beforeNum) : null
  const afterStatus = !isNaN(afterNum) ? vital.getStatus(afterNum) : null

  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 transition-colors ${
      (beforeStatus === 'danger' || afterStatus === 'danger')
        ? 'border-red-200 bg-red-50/30'
        : (beforeStatus === 'warn' || afterStatus === 'warn')
          ? 'border-amber-200 bg-amber-50/30'
          : 'border-gray-100 bg-white'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{vital.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{vital.label}</p>
            <p className="text-[11px] text-gray-400">{vital.normalRange}</p>
          </div>
        </div>
        {/* Delta */}
        {!isNaN(beforeNum) && !isNaN(afterNum) && (
          <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            afterNum > beforeNum
              ? vital.key === 'spo2' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              : afterNum < beforeNum
                ? vital.key === 'spo2' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
          }`}>
            {afterNum > beforeNum ? '↑' : afterNum < beforeNum ? '↓' : '='}{' '}
            {Math.abs(afterNum - beforeNum)}{vital.unit}
          </div>
        )}
      </div>

      {/* Before / After columns */}
      <div className="grid grid-cols-2 gap-3">
        <PhaseInput
          label="Antes"
          fieldName={`${vital.key}_before`}
          value={before}
          onChange={onBefore}
          vital={vital}
          status={beforeStatus}
          accentClass="bg-blue-50 border-blue-100"
        />
        <PhaseInput
          label="Depois"
          fieldName={`${vital.key}_after`}
          value={after}
          onChange={onAfter}
          vital={vital}
          status={afterStatus}
          accentClass="bg-violet-50 border-violet-100"
        />
      </div>
    </div>
  )
}

function PhaseInput({ label, fieldName, value, onChange, vital, status, accentClass }: {
  label: string
  fieldName: string
  value: string
  onChange: (v: string) => void
  vital: VitalConfig
  status: 'good' | 'warn' | 'danger' | null
  accentClass: string
}) {
  return (
    <div className={`rounded-lg border p-2.5 space-y-2 ${accentClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
        {value && status && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[status]}`}>
            {value}{vital.unit}
          </span>
        )}
      </div>

      {/* Large number display + input */}
      <input
        type="number"
        name={fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        step={vital.step}
        min={vital.min}
        max={vital.max}
        placeholder="—"
        className="w-full text-center text-2xl font-bold text-gray-800 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300 placeholder:text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      {/* Quick chips */}
      <div className="flex flex-wrap gap-1 justify-center">
        {vital.chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onChange(String(chip))}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-all active:scale-95 ${
              value === String(chip)
                ? STATUS_COLORS[vital.getStatus(chip) ?? 'good']
                : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}

export function VitalsFields({ session }: { session?: Partial<Session> }) {
  const [vals, setVals] = useState<Record<FieldKey, string>>(() => {
    const init = {} as Record<FieldKey, string>
    for (const v of VITALS) {
      init[`${v.key}_before`] = getInitial(session, `${v.key}_before`)
      init[`${v.key}_after`] = getInitial(session, `${v.key}_after`)
    }
    return init
  })

  function set(key: FieldKey, value: string) {
    setVals((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-200 inline-block" /> Antes da sessão</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-200 inline-block" /> Após a sessão</span>
      </div>

      {VITALS.map((v) => (
        <VitalCard
          key={v.key}
          vital={v}
          before={vals[`${v.key}_before`]}
          after={vals[`${v.key}_after`]}
          onBefore={(val) => set(`${v.key}_before`, val)}
          onAfter={(val) => set(`${v.key}_after`, val)}
        />
      ))}
    </div>
  )
}
