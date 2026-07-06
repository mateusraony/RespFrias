'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { VitalsFields } from './vitals-fields'
import { createSession } from '@/app/actions/sessions'
import { toast } from 'sonner'
import { TECHNIQUES } from '@/lib/techniques'
import { SESSION_NOTES_CHIPS, DURATION_OPTIONS } from '@/lib/session-constants'
import type { SessionType } from '@/types'

export function SessionForm({
  patientId,
  patientName,
  sessionType,
  lastSession,
}: {
  patientId: string
  patientName: string
  sessionType: SessionType
  lastSession?: import('@/types').Session | null
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(50)
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  const [notes, setNotes] = useState('')


  function toggleTechnique(t: string) {
    setSelectedTechniques((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    formData.set('session_type', sessionType)
    const result = await createSession(patientId, patientName, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    toast.success('Sessão salva.')
    router.push(`/pacientes/${patientId}/sessoes/${result.data.id}`)
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
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration_minutes">Duração (min)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min="1"
            max="480"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={loading}
          />
          <div className="flex gap-1.5 pt-1">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                disabled={loading}
                className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                  duration === d
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>
      </div>

      <VitalsFields session={lastSession ?? undefined} />

      {sessionType === 'full' && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Técnicas utilizadas</p>
          {selectedTechniques.map((t) => (
            <input key={t} type="hidden" name="techniques_used" value={t} />
          ))}
          <div className="flex flex-wrap gap-2">
            {TECHNIQUES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTechnique(t)}
                disabled={loading}
                className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                  selectedTechniques.includes(t)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <div className="flex flex-wrap gap-1 mb-1">
          {lastSession?.notes && (
            <button type="button" disabled={loading}
              onClick={() => setNotes(lastSession.notes ?? '')}
              className="rounded-full px-2.5 py-0.5 text-xs border border-[#0d7ea8]/40 bg-[#0d7ea8]/5 text-[#0d7ea8] hover:bg-[#0d7ea8]/10 transition-colors disabled:opacity-50">
              ↩ Repetir obs. anterior
            </button>
          )}
          {SESSION_NOTES_CHIPS.map((c) => (
            <button key={c} type="button" disabled={loading}
              onClick={() => setNotes((n) => n ? `${n} · ${c}` : c)}
              className="rounded-full px-2.5 py-0.5 text-xs border border-input bg-background hover:bg-accent transition-colors disabled:opacity-50">
              {c}
            </button>
          ))}
        </div>
        <Textarea id="notes" name="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={loading} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar sessão'}
        </Button>
      </div>
    </form>
  )
}
