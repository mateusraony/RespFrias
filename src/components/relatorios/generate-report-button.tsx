'use client'

import { useTransition } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateReport } from '@/app/actions/reports'

export function GenerateReportButton({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await generateReport(patientId)
      if (!result.success) {
        alert(result.error)
      }
    })
  }

  return (
    <Button onClick={handleClick} disabled={pending}>
      <FileText className="h-4 w-4" />
      {pending ? 'Gerando...' : 'Gerar relatório'}
    </Button>
  )
}
