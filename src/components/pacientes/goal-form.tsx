'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createGoal } from '@/app/actions/goals'

const GOAL_TEMPLATES = [
  'Melhorar SpO₂ em repouso para ≥ 94%',
  'Reduzir dispneia (Borg ≤ 3) nas AVDs',
  'Aumentar distância no TC6 em 50 m',
  'Reduzir frequência de internações',
  'Independência nas AVDs sem dessaturação',
  'Tolerar exercício por 20 min contínuos',
  'Reduzir uso de broncodilatador de resgate',
  'Melhorar qualidade do sono',
]

export function GoalForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await createGoal(patientId, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    setDescription('')
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Nova meta</Label>
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className="text-xs text-primary hover:underline"
          >
            {showTemplates ? 'Fechar sugestões' : '💡 Ver sugestões'}
          </button>
        </div>

        {showTemplates && (
          <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-muted/40 p-2">
            {GOAL_TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setDescription(t); setShowTemplates(false) }}
                className="rounded-full border border-input bg-background px-3 py-1 text-xs hover:bg-accent transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        action={(formData) => { handleSubmit(formData) }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <Input
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da meta"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_date">Prazo</Label>
          <Input id="target_date" name="target_date" type="date" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Adicionar'}
        </Button>
      </form>
    </div>
  )
}
