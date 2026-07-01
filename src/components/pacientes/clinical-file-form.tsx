'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { saveClinicalFile } from '@/app/actions/assessments'
import type { ClinicalFile } from '@/types'

export function ClinicalFileForm({
  patientId,
  clinicalFile,
}: {
  patientId: string
  clinicalFile: ClinicalFile | null
}) {
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSaved(false)
    setLoading(true)
    const result = await saveClinicalFile(patientId, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    setSaved(true)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {saved && (
        <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800">
          Ficha clínica salva.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="diagnosis_detail">Diagnóstico detalhado</Label>
        <Textarea
          id="diagnosis_detail"
          name="diagnosis_detail"
          rows={3}
          defaultValue={clinicalFile?.diagnosis_detail}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="history">Histórico</Label>
        <Textarea id="history" name="history" rows={3} defaultValue={clinicalFile?.history} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="current_medications">Medicações em uso</Label>
        <Textarea
          id="current_medications"
          name="current_medications"
          rows={2}
          defaultValue={clinicalFile?.current_medications}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="allergies">Alergias</Label>
        <Textarea id="allergies" name="allergies" rows={2} defaultValue={clinicalFile?.allergies} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="precautions">Precauções</Label>
        <Textarea
          id="precautions"
          name="precautions"
          rows={2}
          defaultValue={clinicalFile?.precautions}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar ficha clínica'}
        </Button>
      </div>
    </form>
  )
}
