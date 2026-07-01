'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateGoalStatus } from '@/app/actions/goals'
import type { GoalStatus } from '@/types'

export function GoalActions({
  goalId,
  patientId,
  status,
}: {
  goalId: string
  patientId: string
  status: GoalStatus
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function setStatus(next: GoalStatus) {
    startTransition(async () => {
      await updateGoalStatus(goalId, patientId, next)
      router.refresh()
    })
  }

  if (status !== 'active') return null

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus('achieved')}>
        Marcar como atingida
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStatus('cancelled')}>
        Cancelar
      </Button>
    </div>
  )
}
