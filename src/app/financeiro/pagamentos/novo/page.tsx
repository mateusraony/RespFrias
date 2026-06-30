import { PaymentForm } from '@/components/financeiro/payment-form'
import { getPatients } from '@/app/actions/patients'

export default async function NovoPagamentoPage() {
  const patients = await getPatients()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Novo pagamento</h1>
      <PaymentForm patients={patients} redirectTo="/financeiro" />
    </div>
  )
}
