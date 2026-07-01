'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { markAsPaid } from '@/app/actions/payments'

export function MarkAsPaidButton({ paymentId }: { paymentId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await markAsPaid(paymentId)
      if (!result.success) {
        toast.error('Erro ao marcar como pago.')
      } else {
        toast.success('Pagamento registrado com sucesso.')
        router.refresh()
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={handleClick}
      className="shrink-0 border-green-500 text-green-700 hover:bg-green-50"
    >
      {pending ? '...' : '✓ Pago'}
    </Button>
  )
}
