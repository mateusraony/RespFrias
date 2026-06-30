import { notFound } from 'next/navigation'
import { PaymentForm } from '@/components/financeiro/payment-form'
import { getPayment } from '@/app/actions/payments'
import { getPatients } from '@/app/actions/patients'

export default async function EditarPagamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [payment, patients] = await Promise.all([getPayment(id), getPatients()])
  if (!payment) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Editar pagamento</h1>
      <PaymentForm patients={patients} payment={payment} redirectTo="/financeiro" />
    </div>
  )
}
