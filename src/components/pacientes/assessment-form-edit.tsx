'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChipInput } from '@/components/ui/chip-input'
import { PillSelect } from '@/components/ui/pill-select'
import { updateAssessment } from '@/app/actions/assessments'
import type { Assessment } from '@/types'

const CHIP_SETS: Record<string, number[]> = {
  spo2: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
  borg: [0, 2, 4, 5, 6, 8, 10],
  respiratory_rate: [12, 16, 20, 24],
  heart_rate: [55, 60, 70, 80, 90, 100, 110],
  six_mwt_distance: [200, 300, 350, 400, 450, 500],
}

const ASSESSMENT_TYPE_OPTIONS = [
  { value: 'initial', label: 'Avaliação inicial' },
  { value: 'periodic', label: 'Avaliação periódica' },
]

function MrcToggle({ defaultValue, disabled }: { defaultValue?: number | null; disabled?: boolean }) {
  const [value, setValue] = useState<number | null>(defaultValue ?? null)

  return (
    <div className="space-y-1">
      <input type="hidden" name="mrc_scale" value={value ?? ''} />
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setValue(value === v ? null : v)}
            disabled={disabled}
            className={`flex-1 rounded-md py-1.5 text-sm border transition-colors ${
              value === v
                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AssessmentFormEdit({ assessment, patientId }: { assessment: Assessment; patientId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [assessmentType, setAssessmentType] = useState<string>(assessment.assessment_type ?? 'periodic')

  async function handleSubmit(formData: FormData) {
    setError(null)

    const spo2 = formData.get('spo2') ? Number(formData.get('spo2')) : null
    const borg = formData.get('borg') ? Number(formData.get('borg')) : null
    const mrc = formData.get('mrc_scale') ? Number(formData.get('mrc_scale')) : null
    const rr = formData.get('respiratory_rate') ? Number(formData.get('respiratory_rate')) : null
    const hr = formData.get('heart_rate') ? Number(formData.get('heart_rate')) : null

    if (spo2 !== null && (spo2 < 0 || spo2 > 100)) { setError('SpO₂ deve estar entre 0 e 100%.'); return }
    if (borg !== null && (borg < 0 || borg > 10)) { setError('Escala de Borg deve estar entre 0 e 10.'); return }
    if (mrc !== null && (mrc < 0 || mrc > 5)) { setError('Escala MRC deve estar entre 0 e 5.'); return }
    if (rr !== null && rr <= 0) { setError('Frequência respiratória deve ser maior que 0.'); return }
    if (hr !== null && hr <= 0) { setError('Frequência cardíaca deve ser maior que 0.'); return }

    setLoading(true)
    const result = await updateAssessment(assessment.id, patientId, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    router.push(`/pacientes/${patientId}?tab=avaliacoes`)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tipo *</Label>
          <PillSelect
            name="assessment_type"
            options={ASSESSMENT_TYPE_OPTIONS}
            value={assessmentType}
            onChange={setAssessmentType}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Data *</Label>
          <Input id="date" name="date" type="date" defaultValue={assessment.date} required disabled={loading} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="spo2">SpO₂ (%)</Label>
          <ChipInput id="spo2" name="spo2" chips={CHIP_SETS.spo2} defaultValue={assessment.spo2 ?? ''} min={0} max={100} step="1" disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="borg">Borg (0–10)</Label>
          <ChipInput id="borg" name="borg" chips={CHIP_SETS.borg} defaultValue={assessment.borg ?? ''} min={0} max={10} step="0.5" disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="respiratory_rate">FR (irpm)</Label>
          <ChipInput id="respiratory_rate" name="respiratory_rate" chips={CHIP_SETS.respiratory_rate} defaultValue={assessment.respiratory_rate ?? ''} min={1} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heart_rate">FC (bpm)</Label>
          <ChipInput id="heart_rate" name="heart_rate" chips={CHIP_SETS.heart_rate} defaultValue={assessment.heart_rate ?? ''} min={1} disabled={loading} />
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-3">
          <Label>Escala MRC (0–5)</Label>
          <MrcToggle defaultValue={assessment.mrc_scale} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="six_mwt_distance">TC6 — distância (m)</Label>
          <ChipInput id="six_mwt_distance" name="six_mwt_distance" chips={CHIP_SETS.six_mwt_distance} defaultValue={assessment.six_mwt_distance ?? ''} min={0} placeholder="ex: 420" disabled={loading} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={assessment.notes ?? ''} disabled={loading} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
