'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PatientCombobox } from '@/components/ui/patient-combobox'
import { createPayment, updatePayment } from '@/app/actions/payments'
import { toast } from 'sonner'
import { PillSelect } from '@/components/ui/pill-select'
import type { Patient, Payment, PaymentStatus } from '@/types'

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
  const [amount, setAmount] = useState<string>(payment?.amount?.toString() ?? '')
  const [status, setStatus] = useState<PaymentStatus>(payment?.status ?? 'pending')
  const [dueDate, setDueDate] = useState<string>(payment?.due_date ?? '')
  const [paymentMethod, setPaymentMethod] = useState<string>(payment?.payment_method ?? '')

  function addDays(days: number) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function handleAmountPaidChange(e: React.ChangeEvent<HTMLInputElement>) {
    const paid = parseFloat(e.target.value)
    const total = parseFloat(amount)
    if (!isNaN(paid) && !isNaN(total) && total > 0) {
      if (paid >= total) setStatus('paid')
      else if (paid > 0) setStatus('partial')
      else setStatus('pending')
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)

    const totalAmount = Number(formData.get('amount') ?? 0)
    const amountPaid = formData.get('amount_paid') ? Number(formData.get('amount_paid')) : null
    if (amountPaid !== null && amountPaid > totalAmount) {
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
    toast.success('Pagamento salvo.')
    router.push(redirectTo)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-1.5">
        <Label>Paciente *</Label>
        <PatientCombobox
          patients={patients}
          defaultValue={payment?.patient_id ?? defaultPatientId}
          name="patient_id"
          required
          disabled={loading}
        />
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={loading}
          />
          <div className="flex flex-wrap gap-1 pt-0.5">
            {[60, 80, 100, 120, 150, 200].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                disabled={loading}
                className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                  amount === String(v)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                }`}
              >
                R$ {v}
              </button>
            ))}
          </div>
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
            onChange={handleAmountPaidChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Vencimento</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={loading}
          />
          <div className="flex gap-1.5 pt-1">
            {[
              { label: 'Hoje', days: 0 },
              { label: '+7 dias', days: 7 },
              { label: '+30 dias', days: 30 },
            ].map(({ label, days }) => (
              <button
                key={label}
                type="button"
                onClick={() => setDueDate(addDays(days))}
                disabled={loading}
                className="rounded-full px-3 py-1 text-xs border border-input bg-background hover:bg-accent transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <PillSelect
            name="status"
            options={[
              { value: 'pending', label: 'Pendente' },
              { value: 'partial', label: 'Parcial' },
              { value: 'paid', label: 'Pago' },
              { value: 'agreement', label: 'Acordo' },
            ]}
            value={status}
            onChange={(v) => setStatus(v as PaymentStatus)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Forma de pagamento</Label>
        <input type="hidden" name="payment_method" value={paymentMethod} />
        <div className="flex flex-wrap gap-1.5">
          {['PIX', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Transferência', 'Outro'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(paymentMethod === m ? '' : m)}
              disabled={loading}
              className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                paymentMethod === m
                  ? 'bg-primary text-primary-foreground border-primary font-medium'
                  : 'bg-background border-input hover:bg-accent'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
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
