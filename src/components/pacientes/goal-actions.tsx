'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
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
  const [cancelOpen, setCancelOpen] = useState(false)

  function setStatus(next: GoalStatus) {
    startTransition(async () => {
      await updateGoalStatus(goalId, patientId, next)
      router.refresh()
    })
  }

  if (status === 'cancelled') {
    return (
      <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus('active')}>
        Reativar
      </Button>
    )
  }

  if (status === 'achieved') {
    return (
      <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus('active')}>
        Reabrir
      </Button>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus('achieved')}>
          Atingida
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setCancelOpen(true)}>
          Cancelar
        </Button>
      </div>
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar meta?</DialogTitle>
            <DialogDescription>
              A meta será marcada como cancelada. Você poderá reativá-la depois se necessário.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Voltar</Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => { setCancelOpen(false); setStatus('cancelled') }}
            >
              {pending ? 'Cancelando...' : 'Confirmar cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
