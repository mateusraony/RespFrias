'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createAssessment } from '@/app/actions/assessments'

export function AssessmentForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
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
          <Label htmlFor="assessment_type">Tipo *</Label>
          <Select id="assessment_type" name="assessment_type" defaultValue="initial" required>
            <option value="initial">Avaliação inicial</option>
            <option value="periodic">Avaliação periódica</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Data *</Label>
          <Input id="date" name="date" type="date" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="spo2">SpO₂ (%)</Label>
          <Input id="spo2" name="spo2" type="number" step="1" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="borg">Borg</Label>
          <Input id="borg" name="borg" type="number" step="0.5" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="respiratory_rate">FR (irpm)</Label>
          <Input id="respiratory_rate" name="respiratory_rate" type="number" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heart_rate">FC (bpm)</Label>
          <Input id="heart_rate" name="heart_rate" type="number" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mrc_scale">Escala MRC (0-5)</Label>
          <Input id="mrc_scale" name="mrc_scale" type="number" min={0} max={5} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="six_mwt_distance">TC6 (m)</Label>
          <Input id="six_mwt_distance" name="six_mwt_distance" type="number" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={4} />
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
