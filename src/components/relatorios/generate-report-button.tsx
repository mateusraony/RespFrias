'use client'

import { useTransition } from 'react'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { generateReport } from '@/app/actions/reports'

export function GenerateReportButton({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await generateReport(patientId)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success('Relatório gerado com sucesso.')
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
