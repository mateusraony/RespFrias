export const dynamic = 'force-dynamic'

import { PaymentForm } from '@/components/financeiro/payment-form'
import { getPatients } from '@/app/actions/patients'

export default async function NovoPagamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>
}) {
  const { patient_id } = await searchParams
  const patients = await getPatients()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Novo pagamento</h1>
      <PaymentForm patients={patients} defaultPatientId={patient_id} redirectTo="/financeiro" />
    </div>
  )
}
