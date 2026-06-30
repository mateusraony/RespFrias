import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/types'

const LABELS: Record<PaymentStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  partial: 'Parcial',
  agreement: 'Acordo',
}

const VARIANTS: Record<PaymentStatus, 'success' | 'warning' | 'secondary' | 'outline'> = {
  paid: 'success',
  pending: 'warning',
  partial: 'secondary',
  agreement: 'outline',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>
}
