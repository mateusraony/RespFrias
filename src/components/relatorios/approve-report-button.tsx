'use client'

import { useState, useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
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
import { approveReport } from '@/app/actions/reports'

export function ApproveReportButton({
  reportId,
  patientId,
}: {
  reportId: string
  patientId: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await approveReport(reportId, patientId)
      setOpen(false)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success('Relatório aprovado. PDF disponível para download.')
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Aprovar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar relatório?</DialogTitle>
            <DialogDescription>
              Após aprovado, o PDF estará disponível para download. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={handleConfirm} disabled={pending}>
              {pending ? 'Aprovando...' : 'Confirmar aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
