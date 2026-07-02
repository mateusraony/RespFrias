'use client'

import { useState } from 'react'

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
  getStatus: (v: number) => 'good' | 'warn' | 'danger'
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

function AssessmentVitalCard({ vital, value, onChange, disabled }: {
  vital: VitalConfig
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const num = parseFloat(value)
  const status = !isNaN(num) ? vital.getStatus(num) : null

  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 transition-colors ${
      status ? STATUS_BORDER[status] : 'border-gray-100 bg-white'
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
        {value && status && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
            {value}{vital.unit}
          </span>
        )}
      </div>

      {/* Large number input */}
      <input
        type="number"
        name={vital.key}
        id={vital.key}
        aria-label={vital.label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        step={vital.step}
        min={vital.min}
        max={vital.max}
        placeholder="—"
        disabled={disabled}
        className="w-full text-center text-2xl font-bold text-gray-800 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300 placeholder:text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
      />

      {/* Quick chips */}
      <div className="flex flex-wrap gap-1 justify-center">
        {vital.chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onChange(String(chip))}
            disabled={disabled}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 ${
              value === String(chip)
                ? STATUS_COLORS[vital.getStatus(chip)]
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

function MrcToggleCard({ defaultValue, disabled }: { defaultValue?: number | null; disabled?: boolean }) {
  const [value, setValue] = useState<number | null>(defaultValue ?? null)

  const MRC_LABELS = ['Sem falta de ar', 'Caminhada rápida', 'Passo mais lento', 'Para após 100m', 'Não sai de casa', 'Acamado']

  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">📊</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">Escala MRC</p>
          <p className="text-[11px] text-gray-400">Dispneia: 0 (nenhuma) → 5 (incapacitante)</p>
        </div>
      </div>
      <input type="hidden" name="mrc_scale" value={value ?? ''} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setValue(value === v ? null : v)}
            disabled={disabled}
            title={MRC_LABELS[v]}
            className={`flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
              value === v
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <span className="text-base">{v}</span>
            <span className="text-[10px] font-normal text-center leading-tight opacity-70 hidden sm:block">{MRC_LABELS[v]}</span>
          </button>
        ))}
      </div>
      {value !== null && (
        <p className="text-xs text-center text-gray-500">{MRC_LABELS[value]}</p>
      )}
    </div>
  )
}

function Tc6Card({ defaultValue, disabled }: { defaultValue?: number | null; disabled?: boolean }) {
  const [value, setValue] = useState(defaultValue != null ? String(defaultValue) : '')
  const TC6_CHIPS = [150, 200, 250, 300, 350, 400, 450, 500]

  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🏃</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">TC6 — Distância</p>
          <p className="text-[11px] text-gray-400">Teste de caminhada de 6 minutos (metros)</p>
        </div>
      </div>
      <input
        type="number"
        name="six_mwt_distance"
        id="six_mwt_distance"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        placeholder="—"
        min="0"
        disabled={disabled}
        className="w-full text-center text-2xl font-bold text-gray-800 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300 placeholder:text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
      />
      <div className="flex flex-wrap gap-1 justify-center">
        {TC6_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setValue(String(chip))}
            disabled={disabled}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 ${
              value === String(chip)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200'
            }`}
          >
            {chip}m
          </button>
        ))}
      </div>
    </div>
  )
}

export function AssessmentVitalsFields({
  defaultValues,
  disabled,
}: {
  defaultValues?: Partial<Record<string, number | null>>
  disabled?: boolean
}) {
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const v of VITALS) {
      const dv = defaultValues?.[v.key]
      init[v.key] = dv != null ? String(dv) : ''
    }
    return init
  })

  return (
    <div className="space-y-3">
      {VITALS.map((v) => (
        <AssessmentVitalCard
          key={v.key}
          vital={v}
          value={vals[v.key]}
          onChange={(val) => setVals((prev) => ({ ...prev, [v.key]: val }))}
          disabled={disabled}
        />
      ))}
      <MrcToggleCard defaultValue={defaultValues?.mrc_scale} disabled={disabled} />
      <Tc6Card defaultValue={defaultValues?.six_mwt_distance} disabled={disabled} />
    </div>
  )
}
