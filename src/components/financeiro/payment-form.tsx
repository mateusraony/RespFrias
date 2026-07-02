'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createPayment, updatePayment } from '@/app/actions/payments'
import type { Patient, Payment } from '@/types'

export function PaymentForm({
  patients,
  payment,
  defaultPatientId,
  redirectTo,
}: {
  patients: Patient[]
  payment?: Payment
  defaultPatientId?: string
  redirectTo: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)

    const amount = Number(formData.get('amount') ?? 0)
    const amountPaid = formData.get('amount_paid') ? Number(formData.get('amount_paid')) : null
    if (amountPaid !== null && amountPaid > amount) {
      setError('Valor pago não pode ser maior que o valor total.')
      return
    }

    setLoading(true)
    const result = payment
      ? await updatePayment(payment.id, formData)
      : await createPayment(formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    router.push(redirectTo)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="patient_id">Paciente *</Label>
        <Select id="patient_id" name="patient_id" defaultValue={payment?.patient_id ?? defaultPatientId} required disabled={loading}>
          <option value="">Selecione um paciente</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Valor (R$) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            defaultValue={payment?.amount}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount_paid">Valor pago (R$)</Label>
          <Input
            id="amount_paid"
            name="amount_paid"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={payment?.amount_paid}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Vencimento</Label>
          <Input id="due_date" name="due_date" type="date" defaultValue={payment?.due_date} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={payment?.status ?? 'pending'} disabled={loading}>
            <option value="pending">Pendente</option>
            <option value="partial">Parcial</option>
            <option value="paid">Pago</option>
            <option value="agreement">Acordo</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="payment_method">Forma de pagamento</Label>
        <Select id="payment_method" name="payment_method" defaultValue={payment?.payment_method ?? ''} disabled={loading}>
          <option value="">Não informado</option>
          <option value="PIX">PIX</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão de crédito">Cartão de crédito</option>
          <option value="Cartão de débito">Cartão de débito</option>
          <option value="Transferência">Transferência</option>
          <option value="Outro">Outro</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={payment?.notes} disabled={loading} />
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
