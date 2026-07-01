'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteReport } from '@/app/actions/reports'

export function DeleteReportButton({
  reportId,
  patientId,
}: {
  reportId: string
  patientId: string
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Excluir este relatório? Esta ação não pode ser desfeita.')) return
    startTransition(async () => {
      const result = await deleteReport(reportId, patientId)
      if (!result.success) alert(result.error)
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending} className="text-destructive hover:text-destructive">
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}
