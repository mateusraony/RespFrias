'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Session } from '@/types'

const VITALS = [
  {
    key: 'spo2',
    label: 'SpO₂ (%)',
    step: '1',
    min: '0',
    max: '100',
    chips: [92, 94, 95, 96, 97, 98, 99],
  },
  {
    key: 'borg',
    label: 'Borg (0-10)',
    step: '0.5',
    min: '0',
    max: '10',
    chips: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    key: 'respiratory_rate',
    label: 'FR (irpm)',
    step: '1',
    chips: [12, 14, 16, 18, 20, 22, 24],
  },
  {
    key: 'heart_rate',
    label: 'FC (bpm)',
    step: '1',
    chips: [60, 70, 80, 90, 100, 110],
  },
] as const

type VitalKey =
  | 'spo2_before' | 'spo2_after'
  | 'borg_before' | 'borg_after'
  | 'respiratory_rate_before' | 'respiratory_rate_after'
  | 'heart_rate_before' | 'heart_rate_after'

type VitalsState = Partial<Record<VitalKey, string>>

function getInitial(session: Partial<Session> | undefined, key: VitalKey): string {
  const val = session?.[key as keyof Session]
  return val != null ? String(val) : ''
}

export function VitalsFields({ session }: { session?: Partial<Session> }) {
  const [vals, setVals] = useState<VitalsState>(() => {
    const init: VitalsState = {}
    for (const v of VITALS) {
      init[`${v.key}_before`] = getInitial(session, `${v.key}_before` as VitalKey)
      init[`${v.key}_after`] = getInitial(session, `${v.key}_after` as VitalKey)
    }
    return init
  })

  function set(key: VitalKey, value: string) {
    setVals((prev) => ({ ...prev, [key]: value }))
  }

  function renderGroup(phase: 'before' | 'after') {
    return VITALS.map((v) => {
      const fieldKey = `${v.key}_${phase}` as VitalKey
      const val = vals[fieldKey] ?? ''
      return (
        <div key={fieldKey} className="space-y-1.5">
          <Label htmlFor={fieldKey}>{v.label}</Label>
          <Input
            id={fieldKey}
            name={fieldKey}
            type="number"
            step={v.step}
            min={'min' in v ? v.min : undefined}
            max={'max' in v ? v.max : undefined}
            value={val}
            onChange={(e) => set(fieldKey, e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {v.chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => set(fieldKey, String(chip))}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  val === String(chip)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <p className="col-span-2 text-sm font-medium text-muted-foreground">Antes</p>
      {renderGroup('before')}
      <p className="col-span-2 pt-2 text-sm font-medium text-muted-foreground">Depois</p>
      {renderGroup('after')}
    </div>
  )
}
