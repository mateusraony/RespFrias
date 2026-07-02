'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PillSelect } from '@/components/ui/pill-select'
import { AssessmentVitalsFields } from '@/components/pacientes/assessment-vitals-fields'
import { createAssessment } from '@/app/actions/assessments'

const ASSESSMENT_TYPE_OPTIONS = [
  { value: 'initial', label: 'Avaliação inicial' },
  { value: 'periodic', label: 'Avaliação periódica' },
]

export function AssessmentForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [assessmentType, setAssessmentType] = useState<string>('initial')

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
    const result = await createAssessment(patientId, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    router.push(`/pacientes/${patientId}`)
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
          <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required disabled={loading} />
        </div>
      </div>

      <AssessmentVitalsFields disabled={loading} />

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={4} disabled={loading} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar avaliação'}
        </Button>
      </div>
    </form>
  )
}
