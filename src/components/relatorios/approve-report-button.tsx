'use client'

import { useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approveReport } from '@/app/actions/reports'

export function ApproveReportButton({
  reportId,
  patientId,
}: {
  reportId: string
  patientId: string
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Confirma a aprovação deste relatório? Após aprovado, o PDF estará disponível para download.')) return
    startTransition(async () => {
      const result = await approveReport(reportId, patientId)
      if (!result.success) alert(result.error)
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending} className="text-emerald-600 border-emerald-300 hover:bg-emerald-50">
      <CheckCircle className="h-3.5 w-3.5" />
      {pending ? 'Aprovando...' : 'Aprovar'}
    </Button>
  )
}
