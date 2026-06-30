'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createGoal } from '@/app/actions/goals'

export function GoalForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await createGoal(patientId, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <form
      action={(formData) => {
        handleSubmit(formData)
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="description">Nova meta</Label>
        <Input id="description" name="description" placeholder="Descrição da meta" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="target_date">Prazo</Label>
        <Input id="target_date" name="target_date" type="date" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Adicionar'}
      </Button>
    </form>
  )
}
