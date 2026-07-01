'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { VitalsFields } from './vitals-fields'
import { updateSession } from '@/app/actions/sessions'
import { TECHNIQUES } from '@/lib/techniques'
import type { Session } from '@/types'

export function SessionFormEdit({
  session,
  patientId,
  patientName,
}: {
  session: Session
  patientId: string
  patientName: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    formData.set('session_type', session.session_type)
    const result = await updateSession(session.id, patientId, patientName, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    router.push(`/pacientes/${patientId}/sessoes/${session.id}`)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={session.date}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration_minutes">Duração (min)</Label>
          <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={session.duration_minutes ?? ''} />
        </div>
      </div>

      <VitalsFields session={session} />

      {session.session_type === 'full' && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Técnicas utilizadas</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TECHNIQUES.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="techniques_used"
                  value={t}
                  defaultChecked={session.techniques_used?.includes(t)}
                  className="h-4 w-4"
                />
                {t}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={session.notes ?? ''} />
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
